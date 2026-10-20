# junhokim985/webarcheology-mcp

## Resumen

WebArcheology-MCP **no es un modelo de IA**: es un servidor del Modelo de Contexto de Protocolo (MCP) escrito en Node.js, publicado por el usuario `junhokim985` en HuggingFace bajo el identificador `junhokim985/webarcheology-mcp`. El repositorio no contiene pesos, tokenizador ni ficheros de configuración de inferencia; contiene código (`.mjs`) que se ejecuta como proceso local y se expone a clientes MCP como Claude Desktop, Cursor o Antigravity. Su función es la de servir herramientas a un LLM que ya existe en el cliente, no la de generar texto por sí mismo.

El artefacto implementa cinco subsistemas orientados al análisis y la reconstrucción de aplicaciones web modernas: reconocimiento de infraestructura (CDN, WAF, frameworks de hidratación), de-compilación de bundles y extracción de sourcemaps, clonado offline con inyección de un ServiceWorker que simula APIs, extracción de tokens de diseño y componentes React, y síntesis de catálogos OpenAPI 3.0 a partir de los endpoints descubiertos.

Su relevancia actual deriva del auge del protocolo MCP, promovido por Anthropic desde noviembre de 2024 como estándar abierto para conectar agentes con herramientas externas. Aun así, la ficha debe leerse con cautela: el repositorio tiene 0 descargas y 0 «likes», no declara licencia en los metadatos de HuggingFace (solo un badge MIT en la model card) y las fechas de creación y actualización son incoherentes entre sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP sobre stdio, escrito en Node.js sin dependencias externas (modulos ESM `.mjs`); no es una red neuronal |
| Parametros totales | no disponible (no aplica: no hay pesos ni parametros entrenados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; la ventana la fija el cliente LLM que invoca las herramientas) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible en los metadatos (la model card esta redactada en ingles; el codigo no declara localizacion) |
| Licencia | MIT segun el badge de la model card; el campo de licencia de HuggingFace figura como no disponible |
| Formato de pesos | no disponible (no aplica; se distribuye como codigo fuente `.mjs`, no como safetensors/GGUF) |

## Arquitectura y entrenamiento

No hay entrenamiento. El proyecto es un conjunto de herramientas deterministas: cinco «tools» MCP (`web_recon_infrastructure`, `web_decompile_bundles`, `web_clone_offline_mirror`, `web_extract_vibe_components`, `web_audit_api_catalog`) más una CLI (`bin/cli.mjs`) que expone las mismas operaciones con subcomandos `recon`, `decompile`, `mirror` y `vibe`. La capa de protocolo implementa al menos `initialize`, `tools/list` y `tools/call`, según la salida de pruebas incluida en la model card.

Técnicamente, el reconocimiento se apoya en heurísticas sobre cabeceras HTTP y HTML (detección de Cloudflare Workers, Vercel Edge, Fastly, Akamai, CloudFront, Fly.io, Netlify; huellas de Next.js con `__NEXT_DATA__`, Nuxt, Remix, SvelteKit, Astro). La de-compilación localiza `sourceMappingURL` inline en base64 y ficheros `.map` externos, y reconstruye un árbol de directorios a partir de `sourcesContent`. El clonado offline descarga CSS, JS, fuentes, SVG e imágenes, reescribe rutas relativas a `assets/[hash].[ext]` e inyecta un ServiceWorker con parcheo de `fetch` para simular respuestas JSON. La extracción de componentes recorre el DOM a partir de selectores (`header`, `nav`, `.hero`, `.pricing`) y emite JSX, además de variables CSS y una extensión de `tailwind.config.js`. No se documenta ningún mecanismo de aprendizaje, RLHF, DPO ni ajuste fino.

## Capacidades

- Reconocimiento de infraestructura web: identificación de CDN y edge (Cloudflare Workers, Vercel, Fastly, Akamai, CloudFront, Fly.io, Netlify) y de WAF/anti-bot (Cloudflare Turnstile, DataDome, PerimeterX/HUMAN, AWS WAF, reCAPTCHA).
- Auditoría de cabeceras de seguridad: HSTS, CSP, X-Frame-Options, Permissions-Policy y CORS.
- Detección de framework y modelo de hidratación (Next.js con Turbopack/Webpack, Nuxt, Remix, SvelteKit, Astro Islands).
- De-compilación de bundles: extracción de sourcemaps inline y externos y reconstrucción de fuentes originales en estructura de directorios.
- Descubrimiento de API no documentadas mediante escaneo de scripts minificados en busca de rutas `/api/...`, `/graphql`, `tRPC`, parámetros de query y cabeceras personalizadas.
- Clonado offline interactivo con ServiceWorker simulado, de modo que buscadores, pestañas, filtros y diálogos siguen respondiendo sin red.
- Extracción de tokens de diseño (variables CSS, paletas hex/rgb, jerarquía tipográfica) y generación de componentes React JSX autocontenidos.
- Síntesis de especificación OpenAPI/Swagger 3.0 a partir de la superficie de API descubierta.
- Integración con agentes mediante MCP por stdio: las cinco herramientas quedan expuestas a clientes compatibles (Claude Desktop, Cursor, Antigravity).
- Uso autónomo por CLI sin dependencias npm externas.

## Casos de uso

- Auditoría de seguridad de frontend en una SPA: ejecutar `recon` sobre el dominio para obtener en una sola pasada la CDN, el WAF, el framework y el estado de las cabeceras HSTS/CSP, útil en una fase de reconocimiento previa a un pentest autorizado.
- Reconstrucción de código fuente perdido: si el sitio publica sourcemaps, `decompile --unpack ./reconstructed_src` devuelve `src/components/`, `src/hooks/` y `src/services/` con el código original, lo que permite recuperar un proyecto cuyo repositorio se ha perdido y del que se conserva el artefacto desplegado.
- Migración de una web legacy a React/Tailwind: `vibe` extrae los tokens de diseño y genera JSX de secciones concretas, lo que reduce el trabajo manual de traducción de maquetación a componentes y a una extensión de `tailwind.config.js`.
- Documentación de APIs internas no documentadas: `web_audit_api_catalog` produce un OpenAPI 3.0 a partir de los endpoints hallados en los bundles, aprovechable como punto de partida para un contrato formal o para generar clientes tipados.
- Demos y formación sin conectividad: el espejo offline con ServiceWorker permite llevar una copia navegable de una aplicación a un aula, una feria o un entorno air-gapped, manteniendo la interacción con datos simulados.
- Análisis competitivo de interfaz: comparar jerarquías tipográficas, paletas y estructuras de componentes entre varios competidores del mismo sector usando `vibe` de forma repetida y volcando los tokens a una hoja de cálculo.
- Asistencia a agentes de código en refactorizaciones: al exponer las herramientas por MCP, un agente en Cursor o Claude Desktop puede encadenar reconocimiento, de-compilación y extracción de componentes dentro de una tarea multi-paso de modernización de frontend.
- Verificación de despliegues propios: comprobar en CI, contra el entorno de staging, que las cabeceras de seguridad y la CDN configurada coinciden con lo esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo generativo, métricas como MMLU, HumanEval o GSM8K no son aplicables. La única evidencia de validación es la salida de la suite de pruebas incluida por el autor, que no está respaldada por CI público ni por terceros:

| Suite de prueba | Resultado declarado |
|---|---|
| `mcp_protocol.test.mjs` (initialize, tools/list, tools/call) | superada |
| `recon.test.mjs` (Cloudflare edge, hidratación Next.js, Tailwind CSS) | superada |
| `decompiler.test.mjs` (sourcemaps, endpoints, OpenAPI 3.0) | superada |
| `mirror.test.mjs` (descarga de activos, reescritura de URL, inyección de API simulada) | superada |
| `vibe.test.mjs` (tokens, síntesis de JSX) | superada |
| Total | 5/5, código de salida 0 |

No se proporcionan cifras de latencia, throughput, cobertura de sourcemaps en sitios reales ni tasas de falsos positivos en la detección de infraestructura.

## Requisitos de hardware

- VRAM: 0 GB. No hay inferencia de red neuronal; todo el cómputo es I/O de red, parseo de JavaScript y escritura en disco.
- CPU y RAM: cualquier máquina capaz de ejecutar Node.js; el consumo crece con el tamaño de los bundles descargados. No se publican cifras de memoria.
- GPU: no se requiere ninguna (A100, H100 o RTX 4090 son irrelevantes aquí).
- Cabe en cualquier portátil de consumo y en contenedores pequeños; también en entornos sin GPU y air-gapped, siempre que el espejo se haya generado antes.
- Despliegue: como servidor MCP por stdio, registrado en `claude_desktop_config.json` o `mcp_servers.json` con `command: node` y la ruta a `src/index.mjs`; como CLI (`node bin/cli.mjs ...`); el espejo offline se sirve con `preview.bat` o `npx serve`.
- Latencia y throughput: no disponibles. Dependen del tamaño del sitio, del número de chunks y del ancho de banda; el autor no publica mediciones.
- Requisito implícito: acceso de red saliente al objetivo y capacidad de escritura en disco para los árboles reconstruidos.

## Comparativa con modelos similares

La comparación se establece con herramientas de archivado y clonado web, no con modelos de lenguaje. Los juicios sobre las alternativas proceden de la propia model card del autor y deben considerarse sesgados.

| Herramienta | Enfoque | Alcance | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WebArcheology-MCP | Forense + de-compilador de sourcemaps + espejo offline con ServiceWorker + extracción React/Tailwind | Multipágina, APIs y componentes | 5/5 suites propias; sin cifras | MIT (badge; campo HF vacío) | HuggingFace, 0 descargas; repositorio público no enlazado |
| HTTrack / Cyotek WebCopy | Rastreador HTML estático | Sitios estáticos; falla en SPA con hidratación y WAF | No declarado | GPL / propietaria según variante | Ampliamente distribuido |
| SingleFile | Inline de una página en un único HTML | Una sola página; sin APIs ni multi-página | No declarado | Declarada en su repositorio | Extensión de navegador y CLI |
| ArchiveBox / Browsertrix | Contenedores WARC/WACZ | Archivo de biblioteca a largo plazo | No declarado | Código abierto | Proyectos consolidados |
| MCP-B (WebMCP-org) | Polyfill de `document.modelContext` y traducción WebMCP ↔ MCP | Interoperabilidad de protocolo, no archivado | No declarado | No disponible en la información | GitHub público |

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no tiene pesos. Cualquier evaluación de calidad lingüística o de razonamiento debe hacerse sobre el LLM cliente que invoca las herramientas.
- Riesgo legal relevante: la de-compilación de bundles y la reconstrucción de código fuente pueden vulnerar derechos de autor y los términos de servicio del sitio analizado. El uso legítimo se limita a activos propios o a auditorías con autorización escrita.
- El reconocimiento de WAF y anti-bot (Turnstile, DataDome, PerimeterX) puede emplearse para eludir protecciones; conviene revisar el marco legal aplicable (en la UE, Directiva 2013/40/UE y regulaciones nacionales) antes de cualquier uso ofensivo.
- La inyección de un ServiceWorker con parcheo de `fetch` implica ejecutar código propio en un contexto que reproduce el del sitio original; revisar qué scripts se inyectan y no abrir espejos de sitios no confiables con credenciales activas.
- Privacidad: el clonado puede arrastrar datos personales visibles en el HTML (nombres, correos, identificadores); su almacenamiento cae bajo el RGPD.
- Naturaleza heurística: la detección de CDN, frameworks y endpoints se basa en huellas y patrones, por lo que son esperables falsos positivos y negativos, especialmente en sitios ofuscados o con cabeceras alteradas. No se publican tasas de error.
- Ausencia de validación externa: 0 descargas, 0 «likes», sin repositorio público enlazado (la configuración de ejemplo apunta a una ruta local de Windows, `c:/github_iko098567/webarcheology-mcp/src/index.mjs`), sin paquete npm y sin CI verificable. La salida de pruebas es un volcado de texto aportado por el autor.
- Incoherencia de metadatos: la fecha de creación (2026-10-19) es posterior a la de actualización (2026-10-19T20:11:26Z, once minutos antes), lo que sugiere un repositorio recién creado o metadatos inconsistentes.
- Licencia ambigua: el badge indica MIT, pero el campo de licencia de HuggingFace está vacío y no se aporta fichero `LICENSE`; para uso comercial conviene confirmarlo con el autor.
- Idiomas y localización no declarados; la documentación está solo en inglés.
- Sin cifras de rendimiento: no hay datos de latencia, memoria, escalado con sitios grandes ni límites conocidos (número de chunks, tamaño máximo de bundle, profundidad de rastreo).

## Enlaces

- HuggingFace: https://huggingface.co/junhokim985/webarcheology-mcp
- Repositorio del autor: no disponible (la model card solo cita una ruta local, sin URL pública)
- Model Context Protocol, Wikipedia: https://en.wikipedia.org/wiki/Model_Context_Protocol
- Guía de arquitectura MCP 2026 (neuralcoretech): https://neuralcoretech.com/agentic-ai-model-context-protocol-mcp-architecture-2026/
- MCP Architecture, kunal-chowdhury.com: https://www.kunal-chowdhury.com/2026/09/model-context-protocol-mcp-architecture.html
- MCP Deep Dive 2026 (ailearningguides): https://ailearningguides.com/model-context-protocol-deep-dive-2026/
- MCP-B (WebMCP-org) en GitHub: https://github.com/WebMCP-org/
