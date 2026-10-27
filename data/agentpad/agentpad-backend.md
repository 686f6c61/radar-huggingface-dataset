# agentpad/agentpad-backend

## Resumen

`agentpad/agentpad-backend` no es un modelo de inteligencia artificial: es un Space de Hugging Face con SDK `docker` que empaqueta el backend off-chain de AgentPad, un servicio de infraestructura para el lanzamiento y seguimiento de agentes sobre BNB Smart Chain (chainId 56, mainnet). El contenedor expone tres bloques funcionales descritos por el autor: un indexador de la cadena, una API REST de datos de mercado bajo el prefijo `/v1/...` y un canal WebSocket en `/v1/ws`, a los que se suman servicios de registro y de promoción. La model card no documenta ningún peso, tokenizador o checkpoint.

El artefacto se publicó el 27 de octubre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 likes. No declara licencia, idiomas, pipeline ni tags funcionales más allá de `region:us`, lo que impide evaluar su reutilización o su encaje en un pipeline de inferencia. Los cuatro contratos con los que interactúa (AgentRegistry, LaunchFactory, RewardPool y FeeSplitter) aparecen con direcciones explícitas y código fuente verificado en Sourcify.

Por tanto, esta ficha documenta un servicio de indexación y API, no un modelo generativo. Cualquier expectativa de parámetros, ventana de contexto o cuantización debe descartarse: los apartados correspondientes se marcan como «no disponible» porque el autor no publica esa información y porque el objeto técnico no la posee. La relevancia actual es la de un componente de infraestructura Web3 para un launchpad de agentes, no la de un modelo open source evaluable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de ML; servicio backend en contenedor Docker: indexador on-chain, API REST `/v1/...` y WebSocket `/v1/ws`) |
| Parámetros totales | no disponible (no aplica: no hay pesos publicados) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un backend HTTP/WebSocket) |
| Tipos de cuantización | no disponible (no aplica: no se distribuyen pesos) |
| Idiomas soportados | no disponibles (no declarados en la model card ni en los metadatos) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | no disponible (no hay safetensors, GGUF ni checkpoints; el artefacto es una imagen Docker) |
| Identificador | `agentpad/agentpad-backend` |
| Tipo de artefacto | Space de Hugging Face con `sdk: docker`, `app_port: 7860` |
| Cadena soportada | BNB Smart Chain mainnet (chainId 56) |
| Endpoints declarados | `GET /v1/health` (con `?deep=1` para lectura de configuración on-chain en vivo), API `/v1/...`, WebSocket `/v1/ws` |
| Contratos referenciados | AgentRegistry `0x9cfCb9fAa10A09f632d83C28a5DDaF044455c650`, LaunchFactory `0x1CaC41417B38388e72Dc02430f47e6dF96810702`, RewardPool `0x323C8F0FAD41dBc1B66E964d45dED28a88243E95`, FeeSplitter `0xeb41B157e8D832B0338F28d496ecFc088308C368` |
| Verificación de contratos | fuente verificada en Sourcify |
| Almacenamiento | SQLite dentro del contenedor; sin disco persistente en el tier gratuito de Spaces |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-27T16:08:46Z |
| Última actualización | 2026-10-27T16:08:47Z |

## Arquitectura y entrenamiento

No hay entrenamiento que describir: el artefacto no contiene un modelo entrenado ni un proceso de ajuste documentado. Lo que el autor describe es un backend off-chain compuesto por un indexador que recorre los eventos de la cadena desde el bloque de despliegue, una capa de datos de mercado servida por HTTP bajo `/v1/...`, un canal WebSocket en `/v1/ws` para empuje de actualizaciones en tiempo real, y servicios auxiliares de registro y promoción. La persistencia se resuelve con SQLite embebido en el propio contenedor.

La consecuencia arquitectónica más relevante es la ausencia de estado duradero en el despliegue por defecto: al reiniciar, los datos de cadena se reindexan desde el bloque de despliegue y los registros off-chain (retos pendientes, publicaciones de promoción enviadas y vínculos de referidos) se pierden. El endpoint `/v1/health` admite el parámetro `?deep=1`, que fuerza lecturas de configuración on-chain en vivo, lo que sugiere un diseño de comprobación en dos niveles (liveness superficial y verificación de conectividad con los contratos). No se documentan innovaciones de inferencia, decodificación especulativa, atención lineal ni técnicas de RLHF/DPO, porque no aplican.

## Capacidades

- Indexación de eventos on-chain de los contratos AgentRegistry, LaunchFactory, RewardPool y FeeSplitter en BNB Smart Chain mainnet (chainId 56).
- Exposición de datos de mercado mediante API REST versionada bajo el prefijo `/v1/...`.
- Streaming de actualizaciones en tiempo real por WebSocket en `/v1/ws`.
- Comprobación de salud del servicio en `/v1/health`, con modo profundo (`?deep=1`) que ejecuta lecturas de configuración on-chain.
- Servicio de registro de agentes como capa off-chain previa a la transacción on-chain.
- Servicio de promoción con almacenamiento de publicaciones enviadas.
- Gestión de retos pendientes (pending challenges) y de vínculos de referidos (referral binds).
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- **Explorador de agentes registrados:** el indexador recorre los eventos de AgentRegistry desde el bloque de despliegue y alimenta una base de datos consultable; un front-end puede listar agentes, sus propietarios y su historial sin hablar directamente con el nodo RPC.
- **Panel de datos de mercado:** un dashboard consume `/v1/...` para mostrar métricas agregadas de los lanzamientos (estado de las LaunchFactory, saldos del RewardPool, reparto del FeeSplitter) sin implementar su propio indexador.
- **Interfaz de trading o de lanzamiento en tiempo real:** el WebSocket `/v1/ws` empuja cambios de estado a la UI, evitando sondeo periódico y reduciendo el número de peticiones RPC facturadas por el proveedor.
- **Pasarela de registro con pre-validación:** el servicio de registro permite validar y encolar solicitudes de agentes antes de emitir la transacción, de modo que se eviten envíos fallidos y se gaste gas solo en operaciones consistentes.
- **Campañas de crecimiento con referidos:** los vínculos de referidos y los retos pendientes permiten construir programas de incentivos cuya lógica off-chain se resuelve en el backend y cuya liquidación se ejecuta en el RewardPool.
- **Verificación de promociones comunitarias:** el servicio de promoción almacena las publicaciones enviadas por los usuarios, lo que permite auditar el cumplimiento de requisitos antes de liberar recompensas.
- **Monitorización en orquestadores y CI/CD:** un `kubectl`/Docker healthcheck o un job de CI puede consultar `/v1/health?deep=1` para comprobar no solo que el proceso responde, sino que la configuración on-chain es legible, y abortar el despliegue en caso contrario.
- **Backend de bots operativos:** un bot que necesite estado de agentes y datos de mercado puede apoyarse en `/v1/...` en lugar de replicar la lógica de indexación, siempre que asuma la pérdida de estado off-chain en cada reinicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye latencias, throughput, percentiles de respuesta, número de eventos indexados por segundo ni tiempos de reindexación, y al no tratarse de un modelo de lenguaje no existen métricas tipo MMLU, HumanEval o GSM8K que reportar.

## Requisitos de hardware

- **GPU:** no necesaria. El artefacto es un backend HTTP/WebSocket con SQLite; no se declara ningún requisito de acelerador.
- **VRAM:** no disponible / no aplica.
- **CPU y RAM:** no disponibles. La model card no especifica límites; en un Space de Hugging Face el contenedor queda sujeto a los recursos del tier contratado.
- **Almacenamiento:** SQLite dentro del contenedor. En el tier gratuito de Spaces no hay disco persistente, por lo que el estado se reconstruye (datos de cadena) o se pierde (registros off-chain) en cada reinicio.
- **Puerto de servicio:** 7860, según `app_port` del encabezado del Space.
- **Opciones de despliegue:** Hugging Face Spaces con SDK `docker`; alternativamente, imagen Docker autohospedada con un volumen persistente montado para el fichero SQLite si se quiere conservar el estado off-chain.
- **Latencia y throughput:** no disponibles. El coste dominante en operación será el número de llamadas RPC a BNB Smart Chain durante la indexación desde el bloque de despliegue y durante las consultas con `?deep=1`.

## Comparativa con modelos similares

No disponible. No existe una categoría de «modelos» comparable, porque el artefacto es un servicio backend y no un modelo con pesos. Los resultados de búsqueda devuelven proyectos homónimos que tampoco son equivalentes funcionalmente: una web corporativa de servicios de infraestructura para IA (`agentpad.net`), una plataforma de entrenamiento y despliegue de agentes operativos (`useagentpad.fun`), un constructor visual de flujos agénticos (`github.com/riogesulgon/agentpad`) y una herramienta de ejecución de código multi-lenguaje para agentes (`github.com/vgulerianb/agentpad`, publicada también en PyPI). Ninguno de ellos es un indexador de AgentPad sobre BSC mainnet, por lo que una comparación de parámetros, contexto, rendimiento o licencia carece de sentido.

## Limitaciones y advertencias

- **No es un modelo:** no hay pesos, tokenizador ni checkpoint; no puede utilizarse para inferencia, fine-tuning ni evaluación de capacidades lingüísticas.
- **Licencia ausente:** la model card no declara licencia, lo que impide determinar si el uso comercial, la redistribución o la modificación están permitidos. Tratar el artefacto como no licenciado hasta que el autor lo aclare.
- **Pérdida de estado off-chain:** los retos pendientes, las publicaciones de promoción y los vínculos de referidos no sobreviven a un reinicio en el despliegue por defecto; cualquier flujo de negocio que dependa de ellos requiere almacenamiento persistente externo.
- **Reindexación costosa:** tras cada reinicio el indexador recorre la cadena desde el bloque de despliegue, lo que implica un pico de latencia inicial y un consumo de consultas RPC proporcional a la antigüedad del despliegue.
- **Dependencia de un único proveedor RPC:** el servicio depende de un nodo de BNB Smart Chain; no se documentan mecanismos de failover, reintentos ni límites de tasa.
- **Superficie de seguridad no documentada:** no se describen autenticación, autorización, limitación de tasa, validación de entradas ni auditorías. La verificación en Sourcify acredita el código fuente de los contratos, no la seguridad del backend ni de los propios contratos.
- **Ámbito limitado a una cadena:** solo BNB Smart Chain mainnet (chainId 56); no se menciona soporte para testnet ni para otras redes.
- **Documentación mínima:** sin especificación OpenAPI, sin esquema de los mensajes del WebSocket y sin ejemplos de respuesta de `/v1/...`, lo que dificulta la integración.
- **Riesgo de alucinación:** no aplica, al no existir componente generativo.
- **Sesgos:** no disponibles; no hay datos de entrenamiento que analizar.
- **Advertencia de producción:** el servicio maneja datos de mercado y registros de referencia que pueden afectar a incentivos económicos; sin persistencia ni auditoría declaradas, no debería ser la única fuente de verdad en un sistema con valor económico en juego.

## Enlaces

- Hugging Face: https://huggingface.co/agentpad/agentpad-backend
- Agentpad — Infrastructure Services for AI: https://agentpad.net/
- AgentPad — Operational AI Infrastructure: https://www.useagentpad.fun/
- Repositorio del constructor visual de flujos agénticos: https://github.com/riogesulgon/agentpad
- Paquete `agentpad` en PyPI: https://pypi.org/project/agentpad/
- Repositorio de ejecución de código multi-lenguaje para agentes: https://github.com/vgulerianb/agentpad/
- Verificación de contratos: Sourcify (fuente verificada para AgentRegistry, LaunchFactory, RewardPool y FeeSplitter, direcciones indicadas en la tabla de especificaciones)
