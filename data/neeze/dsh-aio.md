# Neeze/DSH-AIO

## Resumen

DSH-AIO no es un modelo de lenguaje, sino un paquete portable del arnés de agente DeepSeek Harness (`dsh` 0.2.1-rc.5) empaquetado por el usuario Neeze para Windows x64. El repositorio de Hugging Face contiene un ZIP de 329 MB (`DSH-AIO-portable-win-x64.zip`) que incluye el runtime de Node, el propio arnés, cuatro plugins y scripts de arranque, con el objetivo de ejecutarse sin conexión a Internet, sin privilegios de administrador y sin instalación previa.

El paquete no incluye pesos de ningún modelo. El arnés actúa como cliente de una API compatible con OpenAI, Anthropic Messages o OpenAI Responses, de modo que el usuario debe rellenar `config\internal-api.env` con `BASE_URL`, `API_KEY` y `MODEL_ID` apuntando a un servidor propio (vLLM, LiteLLM, one-api u otro proxy interno). La relevancia actual reside en el despliegue de agentes en entornos aislados o air-gapped: el autor verifica con 19 comprobaciones automáticas que no se producen conexiones TCP fuera de loopback.

El repositorio tiene 0 descargas y 0 likes, fue creado el 2 de noviembre de 2026 y su licencia declarada es MIT, aunque esa licencia solo cubre los scripts, plantillas de configuración y documentación propios; los componentes de terceros conservan sus licencias originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (arnés de agente, no modelo de lenguaje); cliente de APIs compatibles con OpenAI Completions, OpenAI Responses y Anthropic Messages |
| Parametros totales | No disponible (el paquete no contiene pesos) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo configurado en `MODEL_ID`) |
| Tipos de cuantizacion | No disponible (depende del servidor de inferencia externo) |
| Idiomas soportados | vietnamita (`vi`) e inglés (`en`) en la documentación y la interfaz del paquete |
| Licencia | MIT para scripts, configuración y documentación; componentes de terceros con sus licencias propias |
| Formato de pesos | No aplica; distribución como `DSH-AIO-portable-win-x64.zip` (329 MB, SHA256 `15f0ce17fe4a1ba27b135b514e5ec1cf3d43321afa27610dfdea8bcdfa1c4cdb`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. Se trata de un empaquetado reproducible del arnés DeepSeek Harness, una aplicación Node.js que expone una interfaz web en `http://127.0.0.1:3080` y orquesta llamadas a un modelo servido externamente. El paquete incluye su propio runtime de Node, `node_modules`, cuatro plugins (`dsh-better-sidebar` 0.28.2, `@akshaydev17/dsh-spotlight` 0.0.3 en fork, `@nanmicoder/dsh-agent-teams` 0.1.28 y `dsh-browser-cdp` 1.7.5) y scripts de verificación y reconstrucción (`scripts\verify-offline.ps1`, `scripts\build-portable.ps1`).

La innovación técnica relevante es el aislamiento: todos los datos de configuración, sesiones y workspace se escriben en el subdirectorio `data\` del propio paquete, sin tocar `%USERPROFILE%`, y la telemetría de `dsh` está desactivada. El autor documenta que se excluyeron componentes por restricciones de licencia o dependencia de red: `dsh-deepseek-splash` (sin LICENSE en el repositorio original), `@anthropic-ai/claude-agent-sdk` y `claude.exe` (copyright de Anthropic, no redistribuibles), `dsh-market`, `TencentDB-Agent-Memory` y `dsh-tui` (incompatible con rc.5). El plugin `@deepseek-ai/dsh-subagent-claude-code` se incluye pero permanece desactivado y no funciona sin el SDK de Anthropic.

## Capacidades

- Orquestación de agentes sobre un modelo servido por API: el arnés ejecuta comandos vía PowerShell y lee y escribe archivos en el workspace local.
- Soporte de function calling y herramientas, condicionado al protocolo configurado: `openai-completions` para servidores tipo vLLM, LiteLLM o one-api, y `openai-responses` para modelos OpenAI recientes que requieren tools.
- Compatibilidad con el protocolo Anthropic Messages mediante `API_PROTOCOL=anthropic-messages`.
- Configuración de múltiples modelos separados por comas en `MODEL_ID`, con el primero como predeterminado.
- Interfaz web local con sidebar que incluye árbol de archivos, editor, terminal, integración Git y chat lateral (`dsh-better-sidebar`).
- Paleta de comandos con `Ctrl+K` mediante `@akshaydev17/dsh-spotlight`.
- Soporte multiagente mediante `@nanmicoder/dsh-agent-teams`.
- Control de navegadores Chrome o Edge ya instalados en la máquina a través de CDP con `dsh-browser-cdp` (no incluye navegador propio).
- Soporte opcional de proxy y CA internos mediante `HTTPS_PROXY`, `NO_PROXY` y `NODE_EXTRA_CA_CERTS`.
- Sin capacidades de visión, audio ni generación de texto propias: todas dependen del modelo externo configurado.

## Casos de uso

- Despliegue de agentes en redes air-gapped: el paquete se descomprime en una máquina Windows sin salida a Internet y se apunta a un servidor vLLM o LiteLLM interno; las 19 comprobaciones de `verify-offline.ps1` permiten auditar que no hay tráfico saliente antes de usarlo en producción.
- Estaciones de trabajo sin privilegios de administrador: al no requerir instalación ni permisos elevados, se puede ejecutar desde una carpeta de usuario o una unidad extraíble, útil en entornos corporativos con políticas restrictivas.
- Evaluación de modelos servidos internamente: cambiando `MODEL_ID` y `API_PROTOCOL` se puede comparar el comportamiento agéntico de distintos modelos (por ejemplo, un modelo servido con vLLM frente a uno accesible por la API de Anthropic) sin reinstalar nada.
- Automatización de tareas de edición de código en local: el agente puede crear y leer archivos del workspace, apoyado por el árbol de archivos, editor, terminal y Git de `dsh-better-sidebar`, lo que permite refactorizaciones guiadas por el modelo sin salir de la máquina.
- Flujos multiagente para tareas divididas: con `@nanmicoder/dsh-agent-teams` se pueden repartir subtareas entre varios agentes que comparten el mismo backend de inferencia interno.
- Automatización de pruebas sobre navegador corporativo: `dsh-browser-cdp` controla un Chrome o Edge ya instalado en el equipo mediante CDP, lo que resulta útil para validar aplicaciones internas sin instalar navegadores adicionales ni descargar binarios.
- Distribución controlada de un entorno de agente reproducible: el ZIP con SHA256 publicado y el script `build-portable.ps1` permiten reconstruir el paquete desde `package-lock.json` y verificar su integridad antes de distribuirlo a otros equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no evalúa ningún modelo de lenguaje; únicamente documenta pruebas funcionales cualitativas: ejecución offline en Windows 11 con proxy caído y `PATH` mínimo, descompresión en rutas con espacios, chat real contra un modelo vía Responses API con creación y lectura de archivos, y activación y carga correcta de los cuatro plugins. El autor indica que no se ha probado en Windows 10 real ni el control efectivo de navegador mediante `dsh-browser-cdp`.

## Requisitos de hardware

- VRAM: no aplica al paquete; la inferencia se ejecuta en el servidor externo configurado en `BASE_URL`, por lo que los requisitos de GPU dependen de ese modelo y no de DSH-AIO.
- CPU y memoria: no se especifican requisitos mínimos; el paquete incluye su propio runtime de Node y ocupa 329 MB comprimido.
- Sistema operativo: Windows 10 22H2 o Windows 11 x64, con Windows PowerShell 5.1 (incluido de serie) y cualquier navegador para la interfaz web.
- GPU recomendadas: no disponible para el paquete; para el backend de inferencia habrá que consultar la ficha del modelo servido.
- Cabe en GPU de consumo: no aplica al paquete; depende exclusivamente del modelo externo.
- Despliegue: arranque mediante `Start-DeepseekHarness.cmd`, que abre la interfaz web en `http://127.0.0.1:3080`; el backend debe ser un servidor compatible con OpenAI Completions, OpenAI Responses o Anthropic Messages (vLLM, LiteLLM, one-api, entre otros).
- Restricción de rutas: descomprimir en una ruta corta (por ejemplo `D:\dsh`), ya que la ruta relativa más larga del paquete ronda los 175 caracteres y el total no debe superar los 259 si Windows no tiene LongPaths habilitado.
- Latencia y throughput: no disponibles; dependen íntegramente del servidor de inferencia y de la red interna.

## Comparativa con modelos similares

| Producto | Tipo | Pesos incluidos | Ejecución offline | Licencia | Plataforma |
|---|---|---|---|---|---|
| DSH-AIO (Neeze) | Paquete portable del arnés DeepSeek Harness | No | Sí, verificado con 19 comprobaciones | MIT para scripts; terceros con sus licencias | Windows x64 |
| DeepSeek Harness (`dsh` 0.2.1-rc.5) | Arnés de agente original | No | No garantizado; requiere instalación y red para plugins | Según el repositorio original | Multiplataforma con Node.js |
| Open WebUI | Interfaz de chat y gestión de modelos | No | Parcial; depende de despliegue | Licencia propia del proyecto | Contenedor o servidor |
| LiteLLM | Proxy y enrutador de APIs de modelos | No | Parcial; requiere configuración | Licencia propia del proyecto | Servidor |

La comparación se limita a herramientas de orquestación porque el repositorio no compite en la categoría de modelos de lenguaje: no contiene pesos ni ofrece inferencia propia.

## Limitaciones y advertencias

- No es un modelo: no genera texto por sí mismo y carece de sentido evaluarlo con MMLU, HumanEval o GSM8K; cualquier métrica de calidad corresponde al modelo que se configure en `MODEL_ID`.
- El arnés es software en fase de vista previa para desarrolladores y el agente puede ejecutar comandos y leer o escribir archivos; el autor remite a `SAFETY.md` y advierte de colocar claves de API reales solo en máquinas de confianza.
- Sin conexión a Internet no funcionan el mercado de plugins ni `dsh plugin` (requieren pnpm y red), las herramientas `web_fetch` y `web_search`, ni los servidores MCP remotos.
- El agente ejecuta comandos mediante PowerShell; el paquete no incluye bash ni git.
- No probado en Windows 10 real ni el control efectivo de navegador con `dsh-browser-cdp`.
- Las rutas largas pueden fallar si Windows no tiene LongPaths habilitado; hay que descomprimir en una ruta corta.
- La licencia MIT del repositorio cubre solo scripts, plantillas y documentación propios; `node_modules`, `runtime\node`, DeepSeek Harness y los plugins conservan sus licencias originales, lo que condiciona la redistribución comercial del paquete completo.
- El plugin `@deepseek-ai/dsh-subagent-claude-code` se incluye desactivado y no funciona sin el SDK de Anthropic, que no se redistribuye por derechos de autor.
- El repositorio registra 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- Riesgo de alucinación y sesgos: no evaluables en este paquete; dependen del modelo externo y de la configuración del servidor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Neeze/DSH-AIO
- Repositorio original de DeepSeek Harness: https://github.com/deepseek-ai/deepseek-harness
- Documento de seguridad de DeepSeek Harness: https://github.com/deepseek-ai/deepseek-harness/blob/master/SAFETY.md
