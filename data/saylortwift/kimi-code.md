# SaylorTwift/kimi-code

## Resumen

`SaylorTwift/kimi-code` no es un modelo de inteligencia artificial: es un espejo de solo lectura (source mirror) del repositorio GitHub `MoonshotAI/kimi-code`, publicado en Hugging Face por el usuario SaylorTwift. El repositorio original contiene Kimi Code CLI, un agente de programacion autonoma desarrollado por Moonshot AI que se ejecuta en la terminal y que es capaz de leer y editar codigo, ejecutar comandos de shell, buscar archivos, descargar paginas web y decidir el siguiente paso a partir de la retroalimentacion que recibe. No contiene pesos, checkpoints ni ficheros de modelo; el tamano del repositorio en el Hub es de 0,0 GB.

El proyecto es relevante en el ecosistema de agentes de codificacion por su modelo de distribucion —binario unico sin dependencia de Node.js en el momento de la instalacion—, su interfaz TUI optimizada para sesiones largas, el soporte de entrada de video, la configuracion conversacional de servidores MCP, un sistema de subagentes (`coder`, `explore`, `plan`) con contextos aislados y la integracion con editores mediante Agent Client Protocol (ACP), lo que permite controlarlo desde Zed o JetBrains.

Dado que se trata de una herramienta de orquestacion y no de un modelo, no existen parametros, longitud de contexto, tipos de cuantizacion ni benchmarks asociados al repositorio. Kimi Code CLI funciona con los modelos Kimi de Moonshot AI y puede configurarse para usar otros proveedores compatibles, de modo que las caracteristicas del modelo subyacente dependen del proveedor que se elija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una aplicacion CLI de agente) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo y proveedor configurados) |
| Tipos de cuantizacion | no disponible (no aplica; la cuantizacion la determina el backend del modelo) |
| Idiomas soportados | no disponible (la documentacion esta en ingles y chino; el idioma de interaccion depende del modelo subyacente) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |
| Tipo de artefacto | mirror de codigo fuente (repositorio Git), no checkpoint |
| Repositorio canonico | github.com/MoonshotAI/kimi-code |
| Tamano del repositorio en el Hub | 0,0 GB |
| Lenguaje de implementacion | TypeScript (requiere Node.js >= 24.15.0, pnpm 10.33.0 para desarrollo) |
| Distribucion | binario unico mediante script de instalacion (`install.sh` para macOS/Linux, `install.ps1` para Windows) |
| Interfaz | TUI interactiva en terminal; protocolo ACP sobre stdio para editores |
| Fecha de creacion en el Hub | 2026-09-16 |
| Ultima actualizacion en el Hub | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no define una arquitectura de red neuronal ni contiene informacion sobre datos de entrenamiento. Kimi Code CLI es un agente construido como herramienta de orquestacion sobre modelos de lenguaje servidos por API. Segun la model card, funciona "out of the box" con los modelos Kimi de Moonshot AI y admite configuracion para otros proveedores compatibles, pero no se especifica en la informacion disponible que modelo concreto se usa por defecto, ni su numero de parametros, ni si emplea tecnicas como decodificacion especulativa o atencion lineal.

La innovacion tecnica del proyecto esta en la capa de agente, no en la capa de modelo. Destacan: la distribucion en binario unico con arranque de la TUI en milisegundos; un bucle de agente que encadena lectura/edicion de ficheros, ejecucion de shell, busqueda y fetch web con retroalimentacion; subagentes integrados (`coder`, `explore`, `plan`) que se despachan en contextos aislados para mantener limpia la conversacion principal; lifecycle hooks que permiten ejecutar comandos locales en puntos clave para bloquear llamadas a herramientas de riesgo, auditar decisiones o lanzar notificaciones; y la capa de entrada de video, que permite arrastrar una grabacion de pantalla al chat para que el agente la analice. La TUI esta construida sobre la libreria `pi-tui`, segun los agradecimientos de la propia documentacion. No hay datos sobre RLHF, DPO ni composicion de dataset, porque no se entrena ningun modelo en este repositorio.

## Capacidades

- Edicion y lectura de codigo dentro del proyecto abierto, con aplicacion de cambios sobre ficheros reales.
- Ejecucion de comandos de shell y uso de la salida como retroalimentacion para el siguiente paso.
- Busqueda de ficheros y navegacion del arbol de directorios del proyecto.
- Descarga y consulta de paginas web durante una sesion de agente.
- Tool calling y uso de Model Context Protocol (MCP): alta, edicion y autenticacion de servidores MCP de forma conversacional mediante el comando `/mcp-config`, sin editar JSON a mano.
- Entrada de video: el usuario puede arrastrar una grabacion de pantalla o un clip de demo y el agente lo analiza; la documentacion menciona casos como convertir un clip de referencia en una LUT, resumir un video largo o transformar una grabacion de pantalla en codigo funcional.
- Subagentes especializados con contextos aislados: `coder`, `explore` y `plan`, pensados para trabajo enfocado y paralelo.
- Lifecycle hooks para automatizacion local: bloqueo de llamadas a herramientas consideradas arriesgadas, auditoria de decisiones, notificaciones de escritorio e integracion con automatizaciones propias.
- Ecosistema de plugins: instalacion de skills, servidores MCP y fuentes de datos desde un marketplace o desde cualquier repositorio de GitHub, mostrando el nivel de confianza de cada instalacion antes de aceptarla.
- Integracion con editores e IDE mediante Agent Client Protocol (ACP): Zed, JetBrains y cualquier cliente compatible pueden dirigir una sesion sobre stdio con el subcomando `kimi acp`, reutilizando el inicio de sesion previo.
- Autenticacion mediante Kimi Code OAuth o clave de API de Moonshot AI Open Platform, configurable con `/login` en el primer arranque.
- No se documentan en la informacion disponible capacidades de vision de imagenes estaticas, audio, ni modos de razonamiento explicito mas alla de lo que aporte el modelo subyacente.

## Casos de uso

- Refactorizacion guiada dentro de un repositorio: abrir el proyecto con `cd your-project` y `kimi`, y pedir tareas como reordenar modulos o extraer funciones; el agente lee los ficheros, aplica los cambios y ejecuta los tests para verificar, usando la salida de shell como senal de exito o fallo.
- Exploracion y onboarding de codigo heredado: pedir "mira este proyecto y explica sus directorios principales" para obtener un mapa del repositorio; el subagente `explore` permite hacer este trabajo en un contexto aislado sin ensuciar la conversacion principal.
- Automatizacion de tareas de mantenimiento en CI/CD: los lifecycle hooks permiten lanzar comandos locales en puntos clave, de modo que se puede integrar el agente en un flujo que valide, audite o bloquee cambios peligrosos antes de que lleguen a produccion.
- Generacion de codigo a partir de una grabacion de pantalla: arrastrar un video de demo o de un flujo de interfaz al chat y pedir al agente que lo convierta en codigo funcional, aprovechando la capacidad de entrada de video.
- Integracion de herramientas internas mediante MCP: usar `/mcp-config` para dar de alta servidores MCP que expongan bases de datos, APIs internas o sistemas de tickets, y despues pedir al agente tareas que combinen codigo y datos corporativos.
- Asistencia dentro del editor sin salir del IDE: configurar Zed o JetBrains con `kimi acp` para lanzar sesiones del agente desde el panel de agente del editor, reutilizando la sesion ya autenticada.
- Trabajo en paralelo sobre varias areas del codigo: despachar los subagentes `coder`, `plan` y `explore` para repartir la investigacion y la implementacion manteniendo cada contexto separado.
- Auditoria de decisiones del agente: usar los hooks para registrar en un log las llamadas a herramientas y las decisiones tomadas durante una sesion, con fines de trazabilidad en equipos regulados.
- Ampliacion del agente con plugins de terceros: instalar skills o fuentes de datos desde el marketplace o desde un repositorio de GitHub, evaluando previamente el nivel de confianza que la propia herramienta muestra antes de la instalacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye checkpoint ni evaluaciones de modelo, y los resultados de busqueda web adjuntos no contienen ningun dato relacionado con este proyecto: las referencias encontradas tratan sobre la unidad flotante de almacenamiento y regasificacion FGEN Batangas, en Filipinas, y no guardan relacion con el modelo ni con la herramienta.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al no ser un modelo local, el consumo de memoria depende enteramente del proveedor y del modelo que se configure como backend.
- GPU recomendadas: no disponible por la misma razon. La informacion proporcionada no indica que modelos Kimi se usan ni si existe una opcion de ejecucion local.
- Ejecucion en GPU de consumo: no disponible. No se documenta ningun modo de inferencia local en el repositorio.
- Requisitos de la herramienta: Node.js >= 24.15.0 y pnpm 10.33.0 unicamente para desarrollo desde el codigo fuente. Para el uso normal, la instalacion es mediante script y no requiere Node.js.
- Windows: es necesario instalar Git for Windows antes del primer arranque, porque el CLI usa el Git Bash incluido como entorno de shell. Si Git Bash esta en una ruta personalizada, hay que definir `KIMI_SHELL_PATH` con la ruta absoluta de `bash.exe`.
- Despliegue: la herramienta se ejecuta como CLI local (`kimi`) o como servidor ACP sobre stdio (`kimi acp`). No se mencionan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, porque no es un servidor de inferencia.
- Latencia y throughput: no disponible en cuanto a inferencia. La documentacion solo afirma que el arranque de la TUI es del orden de milisegundos y que el binario unico evita conflictos de modulos globales.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos tecnicos de alternativas, por lo que no es posible construir una comparativa con cifras. A modo de contexto cualitativo, el proyecto pertenece a la categoria de agentes de codificacion en terminal, en la que existen otras herramientas conocidas (Claude Code, OpenAI Codex CLI, Gemini CLI, Aider o Cline), pero no se dispone de sus parametros, contexto, licencia ni rendimiento en los datos facilitados, y por tanto cualquier cifra seria inventada.

| Criterio | Kimi Code CLI | Alternativas de la misma categoria |
|---|---|---|
| Tipo de artefacto | CLI de agente de codificacion | no disponible |
| Licencia | MIT | no disponible |
| Parametros | no aplica (no es un modelo) | no disponible |
| Contexto | no disponible (depende del proveedor) | no disponible |
| Modelos soportados | Kimi de Moonshot AI y otros proveedores compatibles | no disponible |
| Entrada de video | si, segun la documentacion | no disponible |
| Integracion con IDE | ACP (Zed, JetBrains) | no disponible |
| Benchmark publicado | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: no debe evaluarse como checkpoint ni esperarse pesos, cuantizaciones o fichas de rendimiento. Cualquier uso que requiera inferencia local no esta cubierto por este repositorio.
- El repositorio de Hugging Face es un espejo de solo lectura. Las incidencias, pull requests y contribuciones deben dirigirse al repositorio de GitHub `MoonshotAI/kimi-code`; los cambios realizados en el Hub no se sincronizan de vuelta.
- La fecha de creacion y actualizacion del repositorio en el Hub es el 16 de septiembre de 2026, con 0 descargas y 0 likes, lo que indica que no ha sido validado ni utilizado por la comunidad en el momento de la consulta.
- Dependencia de proveedor: el agente funciona contra los modelos Kimi de Moonshot AI o contra proveedores compatibles que se configuren. La calidad, el coste, la latencia y las politicas de uso dependen del proveedor elegido, no de esta herramienta.
- Riesgo de alucinacion y de acciones destructivas: al poder ejecutar comandos de shell y editar ficheros, un error de razonamiento del modelo subyacente puede tener efectos reales sobre el sistema de ficheros. Los lifecycle hooks existen precisamente para bloquear llamadas de riesgo, y se recomienda configurarlos antes de usar el agente sobre repositorios de produccion.
- Ejecucion de codigo de terceros: el ecosistema de plugins permite instalar skills y servidores MCP desde el marketplace o desde cualquier repositorio de GitHub. Aunque la herramienta muestra el nivel de confianza de cada instalacion, sigue siendo codigo de terceros que se ejecuta en la maquina del usuario.
- Requisito adicional en Windows: sin Git for Windows, o sin `KIMI_SHELL_PATH` correctamente definido, el arranque fallara.
- Licencia: MIT. Permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia, sin garantia por parte de los autores.
- Idiomas: la documentacion disponible esta en ingles y en chino. La informacion proporcionada no detalla que idiomas maneja el agente en la interaccion, algo que dependera del modelo subyacente.
- Estado del proyecto: toda la informacion procede de la model card y de la documentacion citada; no se dispone de resultados de benchmarks ni de informes independientes de rendimiento. Los resultados de la busqueda web adjunta no son relevantes para este proyecto y no aportan datos utilizables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaylorTwift/kimi-code
- Repositorio canonico en GitHub: https://github.com/MoonshotAI/kimi-code
- Incidencias en GitHub: https://github.com/MoonshotAI/kimi-code/issues
- Documentacion oficial: https://moonshotai.github.io/kimi-code/en/
- Documentacion en chino (README.zh-CN.md): https://github.com/MoonshotAI/kimi-code/blob/main/README.zh-CN.md
- Guia de inicio: https://moonshotai.github.io/kimi-code/en/guides/getting-started
- Guia de interaccion y aprobaciones: https://moonshotai.github.io/kimi-code/en/guides/interaction
- Guia de sesiones: https://moonshotai.github.io/kimi-code/en/guides/sessions
- Uso en IDE (ACP): https://moonshotai.github.io/kimi-code/en/guides/ides
- Configuracion: https://moonshotai.github.io/kimi-code/en/configuration/config-files
- Referencia de comandos: https://moonshotai.github.io/kimi-code/en/reference/kimi-command
- Referencia de `kimi acp`: https://moonshotai.github.io/kimi-code/en/reference/kimi-acp
- Guia de contribucion: https://github.com/MoonshotAI/kimi-code/blob/main/CONTRIBUTING.md
- Politica de seguridad: https://github.com/MoonshotAI/kimi-code/blob/main/SECURITY.md
- Licencia MIT: https://github.com/MoonshotAI/kimi-code/blob/main/LICENSE
- Script de instalacion para macOS/Linux: https://code.kimi.com/kimi-code/install.sh
- Script de instalacion para Windows: https://code.kimi.com/kimi-code/install.ps1
- Git for Windows (requisito en Windows): https://gitforwindows.org/
- Agent Client Protocol: https://agentclientprotocol.com/
- Libreria `pi-tui` utilizada por la interfaz: https://github.com/earendil-works/pi-mono/tree/main/packages/tui
