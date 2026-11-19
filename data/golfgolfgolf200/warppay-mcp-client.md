# golfgolfgolf200/warppay-mcp-client

## Resumen

`warppay-mcp-client` no es un modelo de lenguaje, sino un paquete de software publicado en Hugging Face bajo el identificador `golfgolfgolf200/warppay-mcp-client`. Se trata de un puente MCP (Model Context Protocol) local que actúa sobre stdio y permite que clientes de IA como Cursor, Windsurf, OpenClaw o Claude Desktop invoquen herramientas monetizadas del ecosistema WarpPay402 y flujos de trabajo autónomos multiagente.

El componente se conecta al gateway MCP remoto de WarpPay402 mediante SSE y expone 31 herramientas de pago por uso, además de dos flujos compuestos: `warppay_defi_executor` (0,15 USDC por invocación) y `warppay_deep_research` (0,05 USDC por invocación). La pieza diferencial es la interceptación automática de desafíos HTTP 402 y la firma de autorizaciones de micropago en USDC mediante el protocolo x402, apoyándose en el SDK `@warppay402/sdk` en su versión `^1.4.1`.

Su relevancia actual reside en que estandariza el acceso a herramientas de pago dentro de clientes MCP locales sin que el usuario tenga que gestionar manualmente la capa de pagos. Está implementado en TypeScript, se distribuye vía npm con `npx` y su licencia es MIT. No hay información sobre arquitectura de modelo, parámetros ni contexto porque el artefacto no contiene pesos de red neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un cliente MCP en TypeScript) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (paquete npm distribuido vía `npx`, sin pesos) |

## Arquitectura y entrenamiento

El artefacto es un puente de integración, no un modelo entrenado. Su arquitectura funcional se basa en un cliente MCP que habla stdio con el IDE o agente de escritorio local y SSE con el gateway remoto `https://api.warppay402.com/mcp?v=2`. La lógica de pago se implementa interceptando respuestas HTTP 402 y firmando autorizaciones x402 en USDC con `@warppay402/sdk` (`^1.4.1`), usando la clave privada EVM que el usuario proporciona en la variable de entorno `CUSTOMER_PRIVATE_KEY`.

No hay información sobre datos de entrenamiento, tokens procesados, RLHF, DPO ni innovaciones de decodificación, porque el paquete no entrena ni ejecuta un modelo propio. La única capa técnica destacable es la orquestación de herramientas y la firma automática de micropagos dentro del ciclo de llamada MCP.

## Capacidades

- Exposición de 31 herramientas de pago por uso del gateway WarpPay402 a clientes MCP locales.
- Ejecución de flujos compuestos autónomos: `warppay_defi_executor` (0,15 USDC) y `warppay_deep_research` (0,05 USDC).
- Interceptación automática de desafíos HTTP 402 y firma de autorizaciones x402 en USDC.
- Integración con clientes de escritorio y IDE: Cursor, Windsurf, OpenClaw y Claude Desktop.
- Transporte MCP sobre stdio en local y SSE contra el gateway remoto.
- Configuración declarativa mediante `mcp.json` o `claude_desktop_config.json`.
- Soporte de flujos multiagente y multi-paso a través de las herramientas compuestas.
- No incluye generación de texto, razonamiento, código, matemáticas, visión ni audio por sí mismo; esas capacidades dependen del modelo que use el cliente MCP.

## Casos de uso

- Automatización de investigación profunda desde el IDE: un agente en Cursor puede invocar `warppay_deep_research` (0,05 USDC) para lanzar una investigación multi-paso y recibir el resultado dentro del mismo flujo de trabajo, sin salir del editor ni gestionar el pago manualmente.
- Ejecución de operaciones DeFi asistidas: `warppay_defi_executor` (0,15 USDC) permite que un agente de escritorio encadene pasos de ejecución DeFi con pago por uso, adecuado para prototipos y tareas acotadas donde no se quiere montar infraestructura propia.
- Integración de herramientas de pago en asistentes de escritorio: Claude Desktop puede consumir las 31 herramientas del gateway WarpPay402 configurando el servidor en `claude_desktop_config.json`, lo que facilita probar servicios monetizados sin escribir código de integración.
- Orquestación multiagente en local: OpenClaw y otros clientes compatibles con MCP pueden encadenar varias herramientas de pago en un mismo turno, con la firma x402 gestionada de forma transparente por el puente.
- Prototipado rápido de agentes con micropagos: el arranque con `npx -y @warppay402/mcp-client` y una única variable de entorno permite validar flujos de pago por uso en minutos, útil para equipos que evalúan modelos de negocio basados en x402.
- Puente entre IDE y servicios remotos: equipos que ya trabajan con Windsurf pueden añadir capacidades externas de pago por uso sin modificar su cadena de herramientas local, manteniendo el transporte stdio y delegando la red al gateway.
- Evaluación de integraciones MCP: sirve como referencia práctica de cómo interceptar HTTP 402 y firmar autorizaciones x402 en un cliente MCP, útil para desarrolladores que construyan sus propios puentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere VRAM ni GPU: es un cliente MCP en TypeScript que se ejecuta en Node.js mediante `npx`.
- Requiere conectividad de red con `https://api.warppay402.com/mcp?v=2` por SSE.
- Requiere una clave privada EVM válida en `CUSTOMER_PRIVATE_KEY` para firmar autorizaciones x402.
- Requiere un cliente MCP compatible: Cursor, Windsurf, OpenClaw o Claude Desktop.
- Despliegue: instalación local vía `npx -y @warppay402/mcp-client` o configuración declarativa en `mcp.json` / `claude_desktop_config.json`.
- Latencia y throughput: no disponibles; dependen del gateway remoto y de la red.
- No aplican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, al no existir pesos de modelo.

## Comparativa con modelos similares

| Componente | Tipo | Transporte | Pago integrado | Licencia | Distribución |
|---|---|---|---|---|---|
| warppay-mcp-client | Cliente MCP | stdio + SSE | x402 USDC automático | MIT | npm (`npx`) |
| Servidores MCP genéricos | Servidor MCP | stdio / SSE | no disponible | variable | variable |
| SDK `@warppay402/sdk` | Librería | no disponible | x402 USDC | no disponible | npm |

No se dispone de información sobre alternativas comparables directas con pago x402 integrado en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no procesa visión ni audio por sí mismo.
- La gestión de la clave privada EVM en `CUSTOMER_PRIVATE_KEY` implica un riesgo de seguridad relevante; debe tratarse como secreto y no incluirse en repositorios.
- Depende de un gateway remoto de terceros (`api.warppay402.com`); una caída o cambio de API afecta a todas las herramientas.
- Los costes por invocación (0,15 USDC y 0,05 USDC en los flujos compuestos) son cargos reales en cadena; conviene monitorizar el gasto.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque el artefacto no ejecuta un modelo propio.
- La licencia MIT permite uso comercial, pero el servicio subyacente y el SDK pueden tener condiciones adicionales no detalladas en la información disponible.
- El proyecto se publicó con 0 descargas y 0 likes; no hay evidencia de adopción ni de mantenimiento activo más allá de la fecha de actualización indicada.
- Verificar la cadena EVM y el token USDC configurados antes de usar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/golfgolfgolf200/warppay-mcp-client
- Repositorio y seguimiento de incidencias: https://github.com/Warppay402/warppay402-mcp-client
- Gateway MCP remoto: https://api.warppay402.com/mcp?v=2
