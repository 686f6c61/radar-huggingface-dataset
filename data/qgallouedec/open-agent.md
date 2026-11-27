# qgallouedec/open-agent

## Resumen

Open Agent es una extension de VS Code para programacion agentica distribuida por el usuario qgallouedec a traves de Hugging Face. No se trata de un modelo de lenguaje, sino de un cliente o interfaz de agente que se conecta a modelos servidos mediante Hugging Face Inference Providers o a cualquier servidor compatible con la API de OpenAI (vLLM, SGLang, llama.cpp, Ollama, OpenAI). Su proposito es ofrecer un asistente de codigo en el editor que pueda intercambiarse directamente con Claude Code, leyendo los mismos ficheros de instrucciones, habilidades, memoria y listas de permisos.

El proyecto se distribuye como extension de VS Code (y editores derivados como Cursor, Windsurf o VSCodium) mediante un script de instalacion o un fichero `.vsix`. La informacion disponible no incluye especificaciones de arquitectura de modelo, numero de parametros, longitud de contexto ni datos de entrenamiento, ya que el artefacto publicado es software de cliente y no pesos de un modelo. La eleccion del modelo subyacente recae en el usuario, que configura el endpoint y el identificador del modelo en los ajustes de la extension.

Su relevancia actual reside en la interoperabilidad: permite reutilizar el ecosistema de configuracion de Claude Code (instrucciones `CLAUDE.md`, skills, memoria, permisos) sobre modelos abiertos servidos por infraestructura propia o por Inference Providers, y reanudar sesiones previas de Claude Code convirtiendolas en sesiones de Open Agent. La ficha documenta la extension segun la model card publicada, sin datos adicionales de benchmarks ni de rendimiento de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es una extension de cliente, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo configurado; compactacion automatica al 80 % de la ventana) |
| Tipos de cuantizacion | no disponible (depende del servidor o modelo subyacente) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (distribucion como extension `.vsix` y script `install.sh`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de red neuronal ni sobre proceso de entrenamiento, ya que Open Agent no es un modelo con pesos publicados. Tecnicamente es una extension de VS Code que actua como cliente de un endpoint compatible con la API de OpenAI, con `https://router.huggingface.co/v1` como valor por defecto. La extension gestiona el bucle del agente (lectura y edicion de ficheros, ejecucion de comandos, busqueda con ripgrep, fetch web, lista de tareas y diagnosticos de VS Code) y delega la generacion en el modelo remoto configurado.

Entre los mecanismos destacables de su diseno figuran los modos de permiso (preguntar antes de editar, editar automaticamente, automatico, plan y bypass), un modelo revisor opcional en modo automatico (`openAgent.autoModeModel`) que evalua peticiones y comandos antes de ejecutarlos, la compactacion automatica del contexto al alcanzar el 80 % de la ventana del modelo, la conversion de sesiones de Claude Code a sesiones de Open Agent y la posibilidad de inyectar parametros arbitrarios en cada peticion mediante `openAgent.extraBody`.

## Capacidades

- Edicion de codigo en el espacio de trabajo mediante herramientas de lectura, escritura y reemplazo exacto de cadenas, con diffs lado a lado y botones de aceptar o rechazar.
- Busqueda de ficheros con glob y busqueda de contenido con grep basado en ripgrep, respetando `.gitignore`.
- Ejecucion de comandos de shell con control de permisos mediante reglas de tipo `Bash(git fetch *)` o `Read(//tmp/**)`.
- Fetch web y gestion de una lista de tareas dentro de la conversacion.
- Soporte de tool calling y function calling sobre los modelos del router de Hugging Face que lo admiten, fijando el proveedor mas rapido que soporte herramientas cuando no todos lo hacen.
- Habilidades (skills) invocables como `/<skill-name>` desde `.claude/skills/`, `.agents/skills/` y `~/.claude/skills/`.
- Memoria persistente por proyecto en `~/.claude/projects/<project>/memory/MEMORY.md`, con capacidad de escritura por parte del agente.
- Conversaciones multi-turno guardadas por espacio de trabajo, reanudables, agrupables, renombrables y con busqueda por contenido.
- Adjuncion de ficheros y rangos de lineas mediante `@path` y `@path#L10-20`, con adjuncion automatica del fichero o seleccion actual.
- Respuestas en streaming con markdown, razonamiento colapsable y filas de herramientas con su salida.
- Compatibilidad con Remote-SSH ejecutando el instalador en la terminal remota.
- No implementado: servidores MCP, imagenes, subagentes y checkpoints o rewind.

## Casos de uso

- Migracion desde Claude Code sin reescribir configuracion: equipos que ya mantienen `CLAUDE.md`, skills y permisos en `.claude/settings*.json` pueden apuntar Open Agent al mismo espacio de trabajo y conservar instrucciones, memoria y reglas de permisos, reduciendo el coste de cambio de herramienta.
- Desarrollo con modelos abiertos en infraestructura propia: un equipo con vLLM o SGLang desplegado en `http://localhost:8000/v1` configura `openAgent.baseUrl` y usa el agente con modelos autoalojados, manteniendo el codigo fuera de proveedores externos.
- Revision controlada de cambios en repositorios sensibles: el modo automatico con modelo revisor permite que las operaciones rutinarias se ejecuten solas mientras las arriesgadas (pushes, borrados fuera del espacio de trabajo, subidas, PRs) requieren aprobacion explicita con el motivo.
- Auditoria y continuidad de sesiones: la lista de sesiones agrupa conversaciones de Open Agent y de Claude Code por espacio de trabajo y permite buscar por lo dicho en ellas, util para recuperar decisiones tecnicas o retomar trabajo interrumpido.
- Asistencia en entornos remotos: con Remote-SSH, el instalador se ejecuta en la terminal remota y el agente opera sobre el codigo del servidor, adecuado para maquinas de desarrollo sin interfaz grafica local.
- Prototipado rapido con Inference Providers: un desarrollador con token de Hugging Face y permiso de llamadas a Inference Providers puede seleccionar un modelo con soporte de herramientas desde el menu del encabezado y empezar sin configurar servidores.
- Exploracion y navegacion de bases de codigo grandes: el uso combinado de glob, grep con ripgrep y adjuncion de rangos de lineas permite localizar y modificar fragmentos concretos sin cargar ficheros completos en el contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo subyentente elegido, no de la extension.
- GPU recomendadas: no disponibles para la extension; para servidores propios, la eleccion depende del modelo configurado en `openAgent.baseUrl`.
- Cabe en GPU de consumo: no disponible como dato de la extension; vendra determinado por el modelo y la cuantizacion que se sirva localmente.
- Opciones de despliegue del cliente: VS Code, Cursor, Windsurf y VSCodium, mediante `install.sh` o instalacion del fichero `open-agent.vsix` con **Extensions: Install from VSIX…**; soporte de Remote-SSH.
- Servidores compatibles: Hugging Face Inference Providers (por defecto `https://router.huggingface.co/v1`), vLLM, SGLang, llama.cpp, Ollama y OpenAI.
- Requisito para tool calling en vLLM: arrancar con `--enable-auto-tool-choice --tool-call-parser <parser>`.
- Latencia y throughput estimados: no disponibles; dependen del proveedor o servidor y del modelo seleccionado.
- Requisitos de desarrollo (compilacion desde fuente): Node.js con `npm install` y `npm run compile`; pruebas con `node test/ui.mjs` y `test/run.mjs`.

## Comparativa con modelos similares

| Herramienta | Tipo | Modelo subyacente | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Open Agent | Extension de VS Code (cliente de agente) | Configurable: Inference Providers, vLLM, SGLang, llama.cpp, Ollama, OpenAI | Depende del modelo; compactacion al 80 % | Si, con modelos que lo soporten | no disponible | Hugging Face (`.vsix`, `install.sh`) |
| Claude Code | Extension de VS Code (cliente de agente) | Modelos de Anthropic | no disponible | Si | Propietaria | Anthropic |
| Continue | Extension de VS Code (cliente de agente) | Configurable, multiples proveedores | Depende del modelo | Si | no disponible en la informacion | Marketplace de VS Code |

## Limitaciones y advertencias

- La model card no declara licencia, por lo que no puede confirmarse si el uso comercial esta permitido; conviene contactar con el autor antes de desplegarlo en produccion.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad; estos riesgos recaen sobre el modelo subyacente que se configure.
- Funcionalidades aun no implementadas: servidores MCP, imagenes, subagentes y checkpoints o rewind, lo que limita flujos que dependan de esas capacidades.
- Todo el contenido del espacio de trabajo, instrucciones, memoria y permisos se envia al servidor de modelo configurado, tal como ocurriria con Claude Code hacia Anthropic; es un punto critico para datos sensibles.
- El modo automatico delega decisiones en un modelo revisor que solo ve los mensajes del usuario y la accion, nunca la salida de las herramientas, lo que puede producir aprobaciones erroneas en casos limite.
- La reanudacion de sesiones de Claude Code convierte la conversacion desde su ultima compactacion y omite ramas rebobinadas; el fichero original no se modifica, pero la sesion convertida puede perder contexto previo.
- Los atajos de teclado de Claude Code solo pasan a Open Agent cuando la extension de Claude Code se desactiva.
- El proyecto muestra 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que permita evaluar su madurez.
- No se dispone de datos sobre idiomas soportados; el comportamiento multilingue dependera del modelo configurado.

## Enlaces

- Hugging Face: https://huggingface.co/qgallouedec/open-agent
- Script de instalacion: https://huggingface.co/qgallouedec/open-agent/resolve/main/install.sh
- Paquete de extension: https://huggingface.co/qgallouedec/open-agent/resolve/main/open-agent.vsix
- Documentacion de Hugging Face Inference Providers: https://huggingface.co/docs/inference-providers
