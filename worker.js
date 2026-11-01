
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // ==========================================
    // SECURITY: Token and client validation
    // ==========================================
    if (url.searchParams.get("token") !== "abc123") {
      return new Response("Forbidden", { status: 403 });
    }

    const ua = request.headers.get("User-Agent") || "";

    const allowedUA = [
      "Clash",
      "clash",
      "Meta",
      "FiClash",
      "Stash",
      "okhttp",
      "Dalvik"
    ];

    if (!allowedUA.some(a => ua.includes(a))) {
      return new Response("404 Not Found", { status: 404 });
    }

    // ==========================================
    // PROXY PROVIDER ENDPOINT
    // ==========================================
    if (url.pathname === "/proxies") {
      const proxies = `
proxies:
  - {name: proxy1, type: socks5, server: 103.178.73.1, port: 9169, username: movip21, password: movip21, udp: true}
  - {name: proxy2, type: socks5, server: 103.146.134.225, port: 9169, username: movip21, password: movip21, udp: true}
  - {name: proxy3, type: socks5, server: 103.118.152.36, port: 9169, username: movip21, password: movip21, udp: true}
  - {name: proxy4, type: socks5, server: 103.111.224.46, port: 9169, username: movip21, password: movip21, udp: true}
  - {name: proxy5, type: socks5, server: 202.5.36.149, port: 9169, username: movieproxy, password: movieproxy, udp: true}
`;

      return new Response(proxies.trim(), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store"
        }
      });
    }

    // ==========================================
    // MAIN FLCLASH CONFIGURATION
    // ==========================================
    const config = `
# FlClash Live Xrorx Configuration
# Cloudflare Worker proxy provider

port: 7890
socks-port: 7891
mixed-port: 7892

allow-lan: true
mode: rule
log-level: info
ipv6: false
unified-delay: true
tcp-concurrent: true
inbound-mptcp: true
find-process-mode: off

# TUN Configuration
tun:
  enable: true
  stack: mixed
  dns-hijack:
    - 0.0.0.0:53
    - tcp://0.0.0.0:53
  auto-route: true
  auto-detect-interface: true
  mtu: 1500
  endpoint-independent-nat: true

# DNS Configuration
dns:
  enable: true
  listen: 0.0.0.0:1053
  ipv6: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 1.1.1.1
    - 8.8.8.8
    - 119.40.90.1
    - https://dns.google/dns-query

# Live Cloudflare Proxy Provider
proxy-providers:
  xrorx-cloudflare:
    type: http
    url: "\${url.origin}/proxies?token=abc123"
    interval: 60
    path: ./providers/xrorx-cloudflare.yaml
    health-check:
      enable: true
      url: http://www.gstatic.com/generate_204
      interval: 60
      timeout: 5000
      lazy: false

# Proxy Groups
proxy-groups:

  # Distributes connections across available servers
  - name: "⚡ UNITE-ALL-BANDWIDTH"
    type: load-balance
    strategy: round-robin
    url: http://connectivitycheck.gstatic.com/generate_204
    interval: 30
    tolerance: 100
    use:
      - xrorx-cloudflare

  # Automatically selects the lowest-latency server
  - name: "🎯 BEST-PING"
    type: url-test
    url: http://connectivitycheck.gstatic.com/generate_204
    interval: 30
    tolerance: 50
    lazy: false
    use:
      - xrorx-cloudflare

  # Manual server selection
  - name: "MANUAL-SELECT"
    type: select
    proxies:
      - "⚡ UNITE-ALL-BANDWIDTH"
      - "🎯 BEST-PING"
    use:
      - xrorx-cloudflare

# Routing Rules
rules:

  # Bangladesh local traffic bypass
  - GEOIP,BD,DIRECT

  # Route UDP directly
  - NETWORK,UDP,DIRECT

  # Default route through load balancing
  - MATCH,⚡ UNITE-ALL-BANDWIDTH
`;

    return new Response(config.trim(), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }
};
