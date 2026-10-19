# mason-keller/vulnforge-mcp

## Resumen

`mason-keller/vulnforge-mcp` es un repositorio publicado en Hugging Face que no contiene un modelo de lenguaje, sino un servidor MCP (*Model Context Protocol*) escrito en TypeScript ESM. Se presenta como «Universal AI-Native Web, API & Database Vulnerability Auditing with Automated Patch Injection MCP Server»: expone herramientas de auditoría de seguridad a un agente LLM anfitrión (Claude Desktop, Antigravity u otro cliente compatible con MCP) para que este analice cabeceras HTTP, código frontend, rutas de API, consultas SQL/NoSQL, esquemas GraphQL y pipelines de CI/CD, y proponga parches automáticos.

El artefacto se organiza en seis «pilares» de auditoría (web y cabeceras, frontend y DOM, API y endpoints, base de datos y SQLi, GraphQL y esquemas, CI/CD) y declara ocho herramientas MCP, de las cuales la model card solo detalla seis de forma completa (`vulnforge_audit_web`, `vulnforge_audit_api`, `vulnforge_audit_db`, `vulnforge_audit_graphql`, `vulnforge_audit_cicd` y `vulnforge_inject_patch`, esta última truncada en el texto disponible). No hay pesos, tokenizador ni datos de entrenamiento: la distribución es un paquete ejecutable vía `npx vulnforge-mcp`.

Su relevancia potencial está en el enfoque *AI-native*: en lugar de una CLI de SAST aislada, ofrece herramientas invocables por un agente con salida estructurada (puntuación de seguridad de 0 a 100, hallazgos mapeados a CWE y sugerencias de parche). Ahora bien, el repositorio presenta 0 descargas y 0 likes, la licencia no está declarada en los metadatos de Hugging Face y la model card indica «Proprietary (All Rights Reserved)», por lo que su madurez y viabilidad de uso comercial no pueden verificarse con la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. No es un modelo de lenguaje: es un servidor MCP en TypeScript ESM (Node.js) con 6 pilares de auditoría y 8 herramientas expuestas por stdio |
| Parámetros totales | No disponible (no aplica: sin pesos neuronales) |
| Parámetros activos | No disponible (no aplica: no es MoE) |
| Longitud de contexto | No disponible (no aplica al servidor; depende del LLM anfitrión que invoca las herramientas) |
| Tipos de cuantización | No disponible (no aplica: no se distribuyen pesos) |
| Idiomas soportados | No disponibles en los metadatos. La documentación se traduce a 10 locales (en, ko, zh-CN, es, hi, ar, pt-BR, ru, fr, id), lo que no implica soporte multilingüe del motor de análisis |
| Licencia | «Proprietary (All Rights Reserved)» según el badge de la model card y la carpeta `./LICENSE`; los metadatos de Hugging Face no declaran licencia |
| Formato de pesos | No disponible (no aplica: distribución como paquete npm/TypeScript, `dist/index.js`) |
| Identificador | `mason-keller/vulnforge-mcp` |
| Tipo de artefacto | Servidor MCP de auditoría de seguridad (SAST asistido por agente) |
| Protocolo | Model Context Protocol (MCP) sobre stdio |
| Lenguaje de implementación | TypeScript ESM |
| Criptografía declarada | `age` con X25519 (según badge de la model card) |
| Herramientas MCP declaradas | 8 (6 documentadas en el texto disponible) |
| Instalación | `npx vulnforge-mcp`, `npx vulnforge-mcp --test-demo`, `npx vulnforge-mcp --audit-graphql --query "..."` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-19T18:57:45Z |
| Fecha de actualización | 2026-10-19T18:29:34Z (anterior a la de creación: incoherencia en los metadatos) |
| Etiquetas | `region:us` (sin tags de tarea, idioma ni framework) |

## Arquitectura y entrenamiento

No existe entrenamiento. El repositorio no contiene dataset, proceso de preentrenamiento, ajuste supervisado ni RLHF/DPO; es una herramienta determinista de análisis estático y generación de parches que se ejecuta como proceso local y se comunica con el cliente MCP mediante stdio. La arquitectura funcional descrita en la model card es un pipeline de seis pilares con generación de parche asociada: (01) web y cabeceras —CSP, HSTS, CORS con comodines, X-Frame-Options, flags de cookies— con salida de middleware de cabeceras para Express/Fastify/Koa; (02) frontend y DOM —sumideros de XSS como `innerHTML`, `document.write` o `eval`, tabnabbing por `target="_blank"`, hashes SRI— con reescritura a `textContent` y `rel="noopener noreferrer"`; (03) API y endpoints —BOLA/IDOR, rutas de mutación sin autenticación, mass assignment— con validadores de pertenencia, middlewares de autenticación y parsers de DTO con Zod; (04) base de datos y SQLi —consultas con plantillas de cadena, concatenación SQL, `$where` de MongoDB, filtrado de credenciales— con consultas parametrizadas (`$1, $2`), saneadores NoSQL y configuración por variables de entorno; (05) GraphQL y esquemas —introversión en producción (`__schema`, `__type`), DoS por consultas cíclicas con profundidad mayor que 5, abuso de complejidad por batching, campos sensibles (`passwordHash`, `ssn`, `apiKey`) sin autorización, filtrado de trazas de depuración— con desactivación de introspección en producción, validador `depthLimit(5)`, enmascarado de errores y comprobaciones de autorización por campo; y (06) CI/CD y pipelines —`pull_request_target` con checkouts no confiables, permisos ausentes o `write-all`, acciones sin SHA fijado, inyección de expresiones en pasos `run:`, tokens en texto plano y configuraciones OIDC inseguras— con políticas de mínimo privilegio, bindings de entorno seguros y fijado por SHA inmutable.

Como innovación destacable figura la inyección automática de parches (`vulnforge_inject_patch`) y el cálculo de una puntuación de seguridad de 0 a 100 con hallazgos priorizados por CWE en la herramienta `vulnforge_audit_web`. No se especifican en la información disponible el motor de parsing subyacente, la versión mínima de Node.js, ni el detalle de las herramientas 7 y 8, que la model card anuncia pero no llega a describir en el fragmento disponible.

## Capacidades

- Auditoría de cabeceras HTTP y cookies: detección de ausencia o mala configuración de CSP, HSTS, CORS con comodines, X-Frame-Options y flags de cookies, con salida de middleware para Express, Fastify y Koa.
- Análisis de código frontend: identificación de sumideros de XSS (`innerHTML`, `document.write`, `eval`), tabnabbing y ausencia de hashes SRI, con propuesta de reescritura segura.
- Auditoría de APIs: detección de BOLA/IDOR, rutas de mutación sin autenticación y mass assignment sobre definiciones de rutas (Express, Fastify, Next.js) o especificaciones OpenAPI.
- Análisis de base de datos: consultas SQL construidas por concatenación o plantillas de cadena, interpolaciones sin escapar, `$where` de MongoDB y fugas de credenciales en ORM/query builders (Sequelize, Prisma, TypeORM, Knex, Mongoose).
- Auditoría GraphQL: introspección habilitada en producción, DoS por consultas anidadas cíclicas, abuso de batching, campos de resolver sensibles sin autorización y filtrado de trazas en errores, para Apollo Server, GraphQL Yoga y Express GraphQL.
- Auditoría de CI/CD: análisis estático de `.github/workflows/*.yml` y `.gitlab-ci.yml` con detección de `pull_request_target` inseguro, permisos laxos, acciones sin SHA, inyección en `run:` y tokens en claro.
- Inyección de parches: generación automática de parches defensivos (middleware, validadores, consultas parametrizadas, cambios de configuración) a partir de los hallazgos.
- Puntuación de seguridad: cálculo de un score de 0 a 100 y priorización de hallazgos por CWE.
- Integración con agentes: exposición de las funciones como herramientas MCP invocables desde Claude Desktop o Antigravity mediante `claude_desktop_config.json`.
- Ejecución CLI directa: modo demostración (`--test-demo`) y auditoría GraphQL puntual (`--audit-graphql --query`).
- Cifrado: protección criptográfica declarada basada en `age` con X25519 (sin detalle de uso en el texto disponible).

## Casos de uso

- Revisión automatizada de pull requests de infraestructura: un agente con acceso al repositorio invoca `vulnforge_audit_cicd` sobre los workflows modificados y devuelve hallazgos de `pull_request_target` mal usado o permisos `write-all`, con un parche que fija `permissions: read-all` y SHA inmutables antes de la fusión.
- Endurecimiento de cabeceras en servicios nuevos: `vulnforge_audit_web` analiza las respuestas y el código de servidor, calcula el score de 0 a 100 y entrega el middleware de CSP, HSTS y flags de cookies listo para Express o Fastify, reduciendo el trabajo manual de configuración inicial.
- Auditoría pre-producción de una API GraphQL: ejecución de `vulnforge_audit_graphql` contra el esquema y los resolvers para detectar introspección activa, consultas cíclicas sin límite de profundidad y campos `passwordHash` o `ssn` accesibles, con propuesta de `depthLimit(5)` y desactivación de introspección condicionada a `NODE_ENV`.
- Revisión de código legacy con riesgo de inyección: `vulnforge_audit_db` recorre llamadas de Sequelize, Prisma, TypeORM, Knex y Mongoose en busca de concatenación de cadenas y `$where`, y sugiere la conversión a sentencias parametrizadas, útil en migraciones de bases de código antiguas.
- Detección de BOLA/IDOR en arquitecturas multi-tenant: `vulnforge_audit_api` inspecciona rutas y especificaciones OpenAPI, señala endpoints sin middleware de autorización y propone validadores de pertenencia y DTO con Zod, un patrón habitual en APIs SaaS con recursos por inquilino.
- Formación y concienciación de equipos: el modo `--test-demo` permite reproducir auditorías sobre un proyecto de ejemplo y explicar cada hallazgo CWE con el parche correspondiente dentro de una sesión guiada con el agente.
- Integración en un flujo de agente de reparación: `vulnforge_inject_patch` aplica las correcciones propuestas y el agente reejecuta la auditoría para verificar que el score mejora, siempre con revisión humana del diff antes de confirmar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona una puntuación de seguridad automática de 0 a 100 y la clasificación de hallazgos por CWE, pero no incluye conjuntos de evaluación, tasas de falsos positivos/negativos, comparaciones con otras herramientas ni métricas de latencia. Los resultados de la búsqueda web realizada no contienen información relevante sobre este artefacto (devuelven páginas de estadísticas de Fortnite), por lo que no aportan datos verificables.

## Requisitos de hardware

- VRAM: no aplica al servidor, que es un proceso Node.js de análisis estático. La VRAM necesaria corresponde al LLM anfitrión que invoca las herramientas MCP, no a VulnForge.
- CPU y memoria: no disponibles en la información proporcionada; dependen del tamaño del repositorio analizado. No se especifica versión mínima de Node.js.
- GPU: no aplica. No requiere A100, H100 ni RTX 4090 para su propia ejecución; el modelo que razona sobre los hallazgos sí puede requerir GPU según el cliente elegido.
- Cabe en hardware de consumidor: sí, al tratarse de un proceso de línea de comandos; no se detallan requisitos de memoria.
- Opciones de despliegue: `npx vulnforge-mcp` (sin instalación previa), ejecución directa de `dist/index.js` con `node`, y registro como servidor MCP en `claude_desktop_config.json` (Claude Desktop, Antigravity). El ejemplo de configuración de la model card usa una ruta local de Windows (`C:/github_nvcxzopgo/vulnforge-mcp/dist/index.js`), lo que sugiere despliegue local más que remoto. No se mencionan contenedores, vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El artefacto no es un modelo, por lo que la comparación se establece con herramientas de análisis de seguridad estático que pueden integrarse en flujos de agentes. Los datos de las alternativas no provienen de la información suministrada y deben verificarse en sus fuentes oficiales.

| Herramienta | Tipo | Enfoque | Integración MCP con agentes | Licencia | Parámetros / contexto | Datos de benchmark |
|---|---|---|---|---|---|---|
| VulnForge MCP | Servidor MCP + CLI | 6 pilares: web, DOM, API, BD, GraphQL, CI/CD, con inyección de parches | Sí, nativo (8 herramientas MCP) | Proprietary (All Rights Reserved) según model card | No aplica | No disponible |
| Semgrep | SAST + CLI | Reglas por patrón en múltiples lenguajes | No nativa; requiere envoltorio | Open source (LGPL 2.1) con edición comercial | No aplica | No verificado en la información disponible |
| CodeQL | Motor de consultas de código | Base de datos de código y consultas QL | No nativa; requiere envoltorio | Gratuito para código abierto, comercial en privado | No aplica | No verificado en la información disponible |
| Snyk Code | SAST SaaS | Análisis en IDE y CI | No nativa; requiere envoltorio | Propietario con plan gratuito limitado | No aplica | No verificado en la información disponible |

Diferencias cualitativas: frente a las alternativas, VulnForge se limita a JavaScript/TypeScript y a los dominios declarados (Express, Fastify, Koa, Next.js, Apollo, Yoga, Sequelize, Prisma, TypeORM, Knex, Mongoose, GitHub Actions y GitLab CI), mientras que Semgrep y CodeQL cubren más lenguajes. Su ventaja declarada es la exposición directa como herramientas MCP y la generación de parches, no la cobertura ni la profundidad del análisis.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no hay pesos, tokenizador ni inferencia. Cualquier expectativa de uso como LLM en Hugging Face es incorrecta.
- Licencia restrictiva: la model card indica «Proprietary (All Rights Reserved)» con carpeta `./LICENSE`, pero los metadatos de Hugging Face no la declaran y el texto de la licencia no está disponible. Debe revisarse antes de cualquier uso comercial, redistribución o integración en producto.
- Riesgo de cadena de suministro: la ejecución recomendada es `npx vulnforge-mcp`, que descarga y ejecuta código de terceros con los permisos del usuario; conviene fijar versión y verificar el paquete antes de usarlo en entornos corporativos.
- Parches automáticos sobre código y pipelines: `vulnforge_inject_patch` puede modificar archivos de configuración sensibles; requiere revisión humana obligatoria y control de versiones, ya que un parche incorrecto en un workflow o en un middleware de autenticación puede romper producción o introducir nuevas vías de fallo.
- Cobertura limitada y sesgo de ecosistema: el análisis se centra en el stack JavaScript/TypeScript y en ORMs y frameworks concretos; proyectos en Python, Go, Java o PHP quedan fuera del alcance declarado.
- Posibles falsos positivos y negativos: al ser análisis estático y heurístico no se publican tasas de error, y no hay benchmarks que respalden la fiabilidad de los hallazgos ni del score de 0 a 100.
- Documentación incompleta y truncada: se anuncian 8 herramientas pero solo 6 aparecen descritas (y la sexta de forma parcial); no se detallan las dos restantes.
- Estado del repositorio: 0 descargas, 0 likes, sin pipeline declarado, sin etiquetas de tarea o idioma y sin información de versionado. La fecha de actualización (18:29:34Z) es anterior a la de creación (18:57:45Z), lo que indica metadatos inconsistentes o un artefacto recién publicado y no consolidado.
- Configuración de ejemplo con ruta local de Windows (`C:/github_nvcxzopgo/...`), poco adecuada como referencia para otros entornos y señal de que el ejemplo no está generalizado.
- Idiomas: no hay información sobre el idioma de los mensajes, hallazgos o parches generados; la traducción de la documentación a 10 locales no implica que la salida de las herramientas sea multilingüe.
- Sin datos de rendimiento: no hay métricas de latencia, consumo de memoria ni tiempos de análisis para repositorios grandes.
- Resultados de búsqueda web no concluyentes: las consultas devolvieron páginas de estadísticas de Fortnite, sin relación con el artefacto, por lo que no existe validación externa disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mason-keller/vulnforge-mcp
- Especificación del Model Context Protocol: https://modelcontextprotocol.io/
- Documentación local citada en la model card: `./docs/locales/es.md`, `./docs/locales/ko.md`, `./docs/locales/zh-CN.md`, `./docs/locales/hi.md`, `./docs/locales/ar.md`, `./docs/locales/pt-BR.md`, `./docs/locales/ru.md`, `./docs/locales/fr.md`, `./docs/locales/id.md`
- Recursos gráficos citados: `./docs/assets/locales/en/banner.svg`, `./docs/assets/locales/en/architecture.svg`
- Licencia: `./LICENSE` (contenido no disponible en la información suministrada)
- TypeScript: https://www.typescriptlang.org/
- Paquete npm implícito en la instrucción `npx vulnforge-mcp`: https://www.npmjs.com/package/vulnforge-mcp (no verificado en la información disponible)
- Paper, blog, repositorio de código, demo pública y resultados de benchmarks: no disponibles.
