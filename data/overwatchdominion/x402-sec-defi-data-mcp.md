# overwatchdominion/x402-sec-defi-data-mcp

## Resumen

`x402-sec-defi-data-mcp` no es un modelo de lenguaje, sino un servidor MCP (Model Context Protocol) publicado en HuggingFace por el usuario `overwatchdominion`. Expone 25 herramientas de consulta de datos (SEC EDGAR, matemáticas de DeFi en EVM, Bittensor, generación de leads, validación de correo y utilidades varias) que se cobran por llamada en USDC sobre Base mediante el protocolo de pagos x402. El servidor actúa como puente entre un agente de IA y una tienda de datos remota alojada en un Cloudflare Worker: las herramientas se generan dinámicamente a partir del `openapi.json` del servicio, de modo que el catálogo se actualiza sin redesplegar el cliente.

El problema que resuelve es la ausencia de API keys y de cuentas de usuario en flujos agénticos: el agente descubre el precio de cada endpoint (entre 0,001 y 0,015 USD por llamada), firma el requisito de pago con un cliente x402 y reenvía la cabecera `X402_PAYMENT_HEADER`. Si llama sin pagar, el servidor devuelve los requisitos de pago (precio, `payTo`, red `eip155:8453`) para que el agente pueda decidir antes de desembolsar.

Es relevante como ejemplo temprano de la combinación MCP + micropagos on-chain, un patrón que Coinbase y otros actores están empujando para dar cartera y capacidad de compra a los agentes. Conviene subrayar que el repositorio es solo código fuente (0,0 GB declarados), sin pesos ni artefactos de inferencia: su "rendimiento" depende de la tienda remota y de la latencia de liquidación en Base, no de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servidor MCP en Node.js (transporte stdio y Streamable HTTP); no es un modelo neuronal |
| Parametros totales | no aplica (no hay pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica; el limite lo impone el cliente MCP y el endpoint remoto |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (documentacion en ingles; no se declara soporte multilingue) |
| Licencia | MIT segun la model card; el campo de licencia no figura en los metadatos de HuggingFace |
| Formato de pesos | no aplica; se distribuye codigo fuente JavaScript y un paquete `.mcpb` |
| Tipo de artefacto | MCP server (herramientas invocables por agentes) |
| Numero de herramientas | 25 |
| Precio por llamada | 0,001 a 0,015 USD en USDC |
| Red de pago | Base, `eip155:8453` |
| Endpoint por defecto | `https://golf-evm-math.x402-evm-math.workers.dev` (variable `X402_STORE_URL`) |
| Variables de entorno | `X402_STORE_URL`, `X402_PAYMENT_HEADER`, `PORT` |
| Identificador MCP | `io.github.overwatchdominion-stack/x402-sec-defi-data-mcp` |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion / actualizacion | 2026-10-22 / 2026-10-23 |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red neuronal que describir. El componente es un servidor Node.js que implementa el protocolo MCP en dos transportes: stdio (invocado como proceso hijo por el cliente, por ejemplo con `node src/server.js` y configuración `mcpServers` en Claude Desktop) y Streamable HTTP (`node src/server.js --http`, escuchando en `http://localhost:3000/mcp` por defecto). Las 25 herramientas se generan en tiempo de ejecución a partir del documento `openapi.json` de la tienda remota, lo que significa que el esquema de parámetros y la lista de endpoints los controla el operador del servicio, no el repositorio local.

El flujo de pago es la pieza técnica diferenciadora: una llamada sin pago devuelve una respuesta x402 con los requisitos (importe, dirección `payTo`, red). El cliente x402 firma esos requisitos y el servidor MCP reenvía la cabecera `X402_PAYMENT_HEADER` a la tienda; alternativamente, el agente puede invocar directamente la URL devuelta con un cliente HTTP compatible con x402. Los datos de SEC provienen de presentaciones públicas de EDGAR, según declara el autor. No se documentan mecanismos de caché, reintentos, límites de tasa ni tiempo de espera, y tampoco hay información sobre RLHF, datasets o innovaciones de inferencia porque no aplican.

## Capacidades

- Consulta de datos societarios de la SEC: `company_lookup`, `company_filings`, `company_financials` (XBRL) y `company_events` (eventos 8-K), a 0,002-0,005 USD por llamada.
- Feed 8-K orientado a bots de trading: `sec_8k` (0,004 USD) y `sec_8k_pr`, que añade el texto de la nota de prensa de resultados (0,012 USD).
- Matemáticas de EVM y DeFi: `evm_address`, `evm_decode`, `defi_v2_swap`, `defi_impermanent_loss` y `defi_v3_tick`, a 0,001-0,002 USD.
- Datos de Bittensor: `bittensor_subnets` y `bittensor_subnet` con coste de registro (burn), slots libres y umbral de poda, a 0,010-0,015 USD.
- Generación de leads: `leads_site_contacts`, `leads_tech_stack`, `leads_hn_hiring` y `leads_bluesky`, a 0,004-0,010 USD.
- Utilidades: validación de `email`, información de `package` (npm/PyPI/Cargo con consulta a OSV), `data_morpho_base_risk`, `data_sports_xvenue`, `data_kalshi_lip`.
- Funciones de IA delegadas en el servicio remoto: `ai_summarize`, `ai_classify` y `v1_chat_completions` (interfaz compatible con el formato de chat completions), a 0,001-0,010 USD.
- Soporte de tool calling y de agentes multi-paso: cualquier cliente MCP compatible (Claude Desktop, Cursor u otros) descubre e invoca las herramientas sin API key ni registro.
- Descubrimiento de precios previo al pago: la respuesta sin pago actúa como presupuesto consultable por el agente.
- No ofrece visión, audio, ni modo de razonamiento propio; esas capacidades, si existen, quedan del lado del modelo que use el cliente.

## Casos de uso

- Análisis fundamentalista asistido por agente: un agente pide `company_financials` para obtener series XBRL y `company_filings` para localizar el último 10-K, y redacta un resumen con el modelo del cliente; el coste marginal por empresa ronda los 0,007 USD, lo que permite barrer universos amplios sin contratos de datos.
- Bot de reacción a resultados trimestrales: suscripción al feed `sec_8k_pr` para capturar el texto de la nota de prensa en cuanto se publica y disparar un análisis o una señal; el precio de 0,012 USD por evento hace viable un despliegue de alta frecuencia de eventos.
- Verificación de cálculos DeFi fuera de la cadena: `defi_v2_swap` y `defi_v3_tick` permiten contrastar importes y rangos de liquidez calculados por un agente antes de construir una transacción, reduciendo el riesgo de enviar parámetros incorrectos al contrato.
- Monitorización de Bittensor: `bittensor_subnet` aporta el coste de registro y el umbral de poda, datos útiles para agentes que deciden si registrar una subred o evaluar su salud económica.
- Enriquecimiento de leads en CRM: `leads_site_contacts` y `leads_tech_stack` permiten completar fichas de empresa con contactos públicos y stack tecnológico detectado, con coste por registro en lugar de suscripción mensual.
- Auditoría de dependencias en CI/CD: `package` consulta npm, PyPI y Cargo junto con OSV, de modo que un agente de revisión de pull requests puede comprobar vulnerabilidades conocidas pagando céntimos por paquete.
- Validación de formularios y listas de correo: `email` valida direcciones antes de un envío masivo, integrable en una función serverless que pague por uso.
- Canalización de clasificación y resumen sin API key: `ai_summarize`, `ai_classify` y `v1_chat_completions` permiten a un agente sin credenciales externalizar tareas cortas de NLP pagando por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de lenguaje, no hay métricas tipo MMLU, HumanEval o GSM8K que aplicar. Tampoco se documentan latencia por herramienta, throughput del servidor, tasa de error de la tienda remota ni tiempo de confirmación de los pagos en Base.

## Requisitos de hardware

- VRAM: no requiere GPU; el servidor no ejecuta inferencia local.
- CPU y memoria: cualquier máquina capaz de ejecutar Node.js; el repositorio ocupa 0,0 GB y las operaciones son E/S de red, por lo que un contenedor de 128-256 MB de RAM es suficiente en la práctica (estimación, no dato publicado).
- GPU recomendadas: ninguna.
- Cabe en cualquier equipo de consumo, incluidos portátiles modestos y dispositivos de borde; también en funciones serverless o en un VPS mínimo.
- Despliegue: `git clone` + `npm i` + `node src/server.js` para stdio; `--http` para Streamable HTTP en el puerto 3000. Integrable en Claude Desktop mediante el bloque `mcpServers` de la model card. No se documentan imágenes Docker, manifiestos de Kubernetes ni despliegue en vLLM, TGI, llama.cpp u Ollama, que no aplican.
- Latencia y throughput: no disponibles; dependen del Cloudflare Worker remoto y de la red de pagos. La latencia de red hacia Base debe sumarse a cada llamada de pago.

## Comparativa con modelos similares

| Proyecto | Naturaleza | Herramientas | Precio | Licencia | Observaciones |
|---|---|---|---|---|---|
| `overwatchdominion/x402-sec-defi-data-mcp` | Servidor MCP con tienda x402 propia | 25 | 0,001-0,015 USD por llamada | MIT segun model card | Cubre SEC, DeFi, Bittensor, leads y utilidades; incluye validación de pago y descubrimiento de precios |
| `fernsugi/x402-api-mcp-server` | Servidor MCP sobre API x402 de terceros | 8 | no disponible | no disponible | Enfocado en datos cripto/DeFi; sin API keys, pago en USDC en Base |
| `fernsugi/x402-mcp-server` | Envoltorio MCP de la API x402 DeFi | no disponible | no disponible | no disponible | Planteado como capa de descubrimiento e invocación de endpoints DeFi |
| EDGAR público directo | API gubernamental sin coste | no aplica | 0 USD | Dominio público (condiciones de la SEC) | Requiere cliente propio y respetar límites de uso; sin capa MCP ni pago por llamada |

## Limitaciones y advertencias

- No es un modelo: no puede usarse para generar texto, razonar ni procesar imágenes por sí mismo; solo expone herramientas que un modelo cliente debe orquestar.
- Dependencia total de la tienda remota `golf-evm-math.x402-evm-math.workers.dev`: si el Worker cae, cambia su `openapi.json` o modifica precios, el servidor local deja de funcionar o cambia de comportamiento sin versión fijada.
- El flujo de pago exige cartera, firma y gestión de claves; una mala configuración de `X402_PAYMENT_HEADER` puede provocar pagos no deseados o llamadas rechazadas. No se documentan límites de gasto ni mecanismos de reembolso.
- No hay evaluación independiente de la calidad ni de la exactitud de los datos servidos; los importes se cobran por llamada, con independencia de que la respuesta sea correcta o completa.
- La model card declara licencia MIT, pero el campo de licencia no aparece en los metadatos de HuggingFace: conviene verificar el fichero `LICENSE` del repositorio antes de un uso comercial.
- El proyecto se presenta como "experimento autónomo de agente de IA" mantenido por un autor individual, con correo de contacto personal y una dirección de donaciones en USDC en el propio README; no hay gobernanza, SLA ni historial de mantenimiento que respalde un uso en producción crítico.
- Ausencia de documentación sobre límites de tasa, caché, reintentos, tiempo de espera, tratamiento de errores HTTP y política de datos personales, algo relevante en las herramientas de leads y validación de correo.
- Riesgo de alucinación heredado del modelo cliente que interpreta las respuestas, y riesgo de datos obsoletos en las herramientas de Bittensor y DeFi si la tienda no refresca con la frecuencia esperada.
- Los identificadores de herramientas y precios pueden cambiar; fijar versiones y presupuestar el gasto por tarea antes de automatizar.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/overwatchdominion/x402-sec-defi-data-mcp
- Protocolo x402: https://x402.org
- Guía oficial de servidor MCP con x402: https://docs.x402.org/guides/mcp-server-with-x402
- Proyecto comparable `fernsugi/x402-api-mcp-server`: https://github.com/fernsugi/x402-api-mcp-server
- Proyecto comparable `fernsugi/x402-mcp-server`: https://github.com/fernsugi/x402-mcp-server
- Artículo sobre el stack MCP de Coinbase: https://the-agent-report.com/2026/06/coinbase-mcp-agent-integration/
- Contacto declarado por el autor: overwatchdominion@gmail.com
