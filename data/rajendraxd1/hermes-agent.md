# rajendraxd1/hermes-agent

## Resumen

`rajendraxd1/hermes-agent` es un repositorio alojado en Hugging Face que no contiene ningun checkpoint de modelo. Se trata de un espejo de solo lectura del repositorio de GitHub `NousResearch/hermes-agent`, un agente de IA autonomo desarrollado por Nous Research y distribuido bajo licencia MIT. El repositorio tiene un tamano de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y la propia model card advierte explicitamente de que no es un modelo sino un espejo de codigo fuente alojado en el Hub unicamente por visibilidad.

El proyecto que se espeja es un agente de terminal con un bucle de aprendizaje incorporado: crea habilidades (skills) a partir de la experiencia, las mejora durante su uso, mantiene memoria curada entre sesiones y busca en conversaciones pasadas para recuperar contexto. No esta atado a un modelo concreto: permite conectar Nous Portal, OpenRouter, OpenAI o cualquier endpoint propio mediante el comando `hermes model`, por lo que sus parametros, contexto y cuantizacion dependen enteramente del modelo que el usuario configure en cada caso.

Su relevancia actual radica en el enfoque de infraestructura desacoplada del portatil: el agente puede ejecutarse en un VPS de 5 dolares, en un cluster de GPU o en infraestructura serverless con hibernacion, y ser controlado desde Telegram, Discord, Slack, WhatsApp, Signal o la propia CLI. Ademas, incorpora generacion por lotes de trayectorias y compresion de trayectorias orientadas a entrenar la siguiente generacion de modelos con capacidad de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene pesos de modelo, es un espejo de un agente software |
| Parametros totales | No disponible (depende del modelo externo que se conecte) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (la determina el modelo configurado) |
| Tipos de cuantizacion | No disponible (los determina el modelo configurado) |
| Idiomas soportados | No disponible para el modelo; la documentacion del repositorio existe en ingles, chino, urdu y espanol |
| Licencia | MIT |
| Formato de pesos | No disponible: el repositorio solo contiene codigo fuente |

## Arquitectura y entrenamiento

El artefacto descrito no es un modelo entrenado sino un agente construido alrededor de modelos de terceros. Su arquitectura interna se organiza en varios componentes: una interfaz de terminal completa (TUI) con edicion multilinea, autocompletado de comandos con barra, historial de conversacion, interrupcion y redireccion, y salida de herramientas en streaming; una pasarela unica que conecta simultaneamente con Telegram, Discord, Slack, WhatsApp, Signal y CLI, con transcripcion de notas de voz y continuidad de conversacion entre plataformas; y un bucle de aprendizaje cerrado con memoria curada por el agente, creacion autonoma de habilidades tras tareas complejas, mejora de esas habilidades durante su uso y busqueda de sesiones con FTS5 mas resumen por LLM para recuperacion entre sesiones. El modelado del usuario se apoya en Honcho y el sistema declara compatibilidad con el estandar abierto agentskills.io.

En cuanto a despliegue, ofrece siete backends de terminal: local, Docker, SSH, Singularity, Modal, Daytona y Vercel Sandbox. Daytona y Modal permiten persistencia serverless, de modo que el entorno del agente hiberna cuando esta inactivo y despierta bajo demanda. Tambien incorpora un planificador cron integrado con entrega a cualquier plataforma, delegacion en subagentes aislados para trabajo en paralelo y la posibilidad de escribir scripts en Python que invocan herramientas por RPC, colapsando pipelines de varios pasos en turnos de coste de contexto cero. Para investigacion, incluye generacion por lotes de trayectorias y compresion de trayectorias destinadas a entrenar modelos de tool calling. No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF o DPO, porque no se trata de un modelo entrenado.

## Capacidades

- Interfaz de terminal completa (TUI) con edicion multilinea, autocompletado mediante comandos con barra, historial de conversacion, interrupcion y redireccion, y streaming de salida de herramientas.
- Pasarela multipropietario: Telegram, Discord, Slack, WhatsApp, Signal y CLI desde un unico proceso, con transcripcion de notas de voz y continuidad de conversacion entre plataformas.
- Memoria curada por el agente con recordatorios periodicos y busqueda de sesiones FTS5 combinada con resumen por LLM para recuperacion entre sesiones.
- Creacion autonoma de habilidades tras tareas complejas y mejora de esas habilidades durante su uso.
- Modelado dialectico del usuario mediante Honcho, orientado a construir un perfil que se profundiza a lo largo de las sesiones.
- Automatizaciones programadas: planificador cron integrado con entrega a cualquier plataforma para informes diarios, copias de seguridad nocturnas o auditorias semanales descritas en lenguaje natural.
- Delegacion y paralelizacion: generacion de subagentes aislados para flujos de trabajo simultaneos.
- Invocacion de herramientas por RPC desde scripts de Python, lo que permite reducir pipelines de varios pasos a turnos sin coste de contexto.
- Independencia de proveedor: conexion a Nous Portal, OpenRouter, OpenAI o endpoints propios mediante `hermes model`, sin cambios de codigo.
- Capacidades de investigacion: generacion por lotes de trayectorias y compresion de trayectorias para entrenar modelos de tool calling.
- Compatibilidad declarada con el estandar abierto agentskills.io.
- Soporte nativo de Windows mediante PowerShell, ademas de Linux, macOS, WSL2 y Termux (Android).

## Casos de uso

- Automatizacion de operaciones en servidor: el agente se instala en un VPS de 5 dolares y ejecuta tareas de mantenimiento, auditorias y copias de seguridad nocturnas mediante el planificador cron, sin depender de que el portatil del operador este encendido.
- Asistente de programacion en terminal: la TUI con autocompletado, historial y salida de herramientas en streaming permite usarlo como copiloto de linea de comandos sobre un repositorio, ejecutando comandos de shell a traves del Git Bash empaquetado en Windows.
- Soporte y atencion al usuario multicanal: la pasarela unica mantiene conversaciones en Telegram, Discord, Slack, WhatsApp y Signal con continuidad de contexto entre plataformas y transcripcion de notas de voz, lo que resulta adecuado para equipos distribuidos.
- Automatizacion de flujos con herramientas internas: la invocacion por RPC desde Python permite conectar APIs y scripts propios y colapsar pipelines de varios pasos en una sola llamada, reduciendo el consumo de contexto.
- Investigacion de paralelizacion de tareas: los subagentes aislados permiten repartir un trabajo amplio (por ejemplo, analisis simultaneo de varios repositorios) sin que los hilos compartan contexto.
- Generacion de datos para entrenamiento: los modos de generacion por lotes y compresion de trayectorias sirven para producir datasets de tool calling y entrenar modelos posteriores.
- Asistente personal con memoria persistente: el almacenamiento de memoria, la busqueda de sesiones pasadas y el modelado de usuario con Honcho permiten mantener preferencias y conocimiento acumulado a lo largo de semanas.
- Despliegue efimero y de bajo coste: el uso de Daytona o Modal como backend permite que el entorno hiberne entre sesiones, lo que encaja en cargas de trabajo intermitentes y presupuestos ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio espejo no incluye evaluaciones del agente, y al no incorporar pesos de modelo no procede comparar metricas de razonamiento, codigo o matematicas. Cualquier cifra de rendimiento dependeria del modelo externo que se conecte mediante `hermes model`, y no se ha proporcionado ninguna.

## Requisitos de hardware

- El agente en si no requiere GPU: el autor indica explicitamente que puede ejecutarse en un VPS de 5 dolares, en un cluster de GPU o en infraestructura serverless que apenas cuesta cuando esta inactivo.
- La VRAM necesaria no es un atributo del repositorio: depende del modelo externo (Nous Portal, OpenRouter, OpenAI o endpoint propio) y de su cuantizacion. No disponible.
- El instalador gestiona las dependencias de ejecucion: uv, Python 3.11, Node.js, ripgrep, ffmpeg y, en Windows, un MinGit portable de aproximadamente 45 MB desplegado en `%LOCALAPPDATA%\hermes\git` sin privilegios de administrador.
- En Windows nativo la instalacion se realiza en `%LOCALAPPDATA%\hermes`; en WSL2 y Linux se ubica en `~/.hermes`.
- En Android/Termux se instala un extra `.[termux]` reducido, porque el extra completo `.[all]` arrastra dependencias de voz incompatibles con esa plataforma.
- Opciones de despliegue del agente: backend local, Docker, SSH, Singularity, Modal, Daytona y Vercel Sandbox, con persistencia serverless en los casos de Modal y Daytona.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo y no se ha proporcionado informacion que permita compararlo con frameworks de agentes alternativos en terminos de parametros, contexto, rendimiento, licencia o disponibilidad. Para comparar el rendimiento real habria que fijar primero el modelo subyacente con el que se ejecuta el agente.

## Limitaciones y advertencias

- No es un modelo: este repositorio de Hugging Face es un espejo de solo lectura de un repositorio de GitHub y no contiene pesos. Descargarlo no aporta ninguna capacidad de inferencia.
- El repositorio canonico, el rastreador de incidencias y las solicitudes de cambio viven en GitHub; las incidencias no deben abrirse en el Hub.
- El repositorio presenta 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad en el Hub en el momento de la consulta.
- El rendimiento, la calidad de las respuestas y el riesgo de alucinacion dependen por completo del modelo externo que se configure; no hay control ni garantia por parte del agente sobre esos aspectos.
- La creacion autonoma de habilidades y la memoria persistente implican que el agente acumula estado entre sesiones; conviene auditar que se almacena y con que permisos, especialmente en despliegues multiusuario.
- La ejecucion de comandos de shell y la conexion a siete backends distintos amplian la superficie de ataque: es necesario revisar el aislamiento del entorno (Docker, SSH o sandbox) antes de usarlo con credenciales reales.
- La licencia MIT es permisiva y permite uso comercial, pero se aplica al codigo del agente; las condiciones de uso del modelo externo conectado son independientes y deben revisarse aparte.
- El soporte de idiomas del agente no se detalla en la informacion disponible; la presencia de documentacion en varios idiomas no implica capacidad multilingue del sistema en si.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este repositorio, por lo que no hay fuentes independientes que corroboren o evalien el proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rajendraxd1/hermes-agent
- Repositorio canonico en GitHub: https://github.com/NousResearch/hermes-agent
- Documentacion: https://hermes-agent.nousresearch.com/docs/
- Sitio del proyecto: https://hermes-agent.nousresearch.com/
- Licencia en GitHub: https://github.com/NousResearch/hermes-agent/blob/main/LICENSE
- Nous Research: https://nousresearch.com
- Nous Portal: https://portal.nousresearch.com
- Proveedores soportados: https://hermes-agent.nousresearch.com/docs/integrations/providers
- Guia de Termux: https://hermes-agent.nousresearch.com/docs/getting-started/termux
- Script de instalacion Linux/macOS/WSL2/Termux: https://hermes-agent.nousresearch.com/install.sh
- Script de instalacion Windows (PowerShell): https://hermes-agent.nousresearch.com/install.ps1
- Discord de Nous Research: https://discord.gg/NousResearch
- Honcho (modelado de usuario): https://github.com/plastic-labs/honcho
- Estandar agentskills.io: https://agentskills.io
- README en chino: https://github.com/NousResearch/hermes-agent/blob/main/README.zh-CN.md
- README en urdu: https://github.com/NousResearch/hermes-agent/blob/main/README.ur-pk.md
- README en espanol: https://github.com/NousResearch/hermes-agent/blob/main/README.es.md
