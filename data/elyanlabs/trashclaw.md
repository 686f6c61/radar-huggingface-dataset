# elyanlabs/trashclaw

## Resumen

TrashClaw es un agente local de uso de herramientas (tool-use agent) publicado en Hugging Face bajo el identificador `elyanlabs/trashclaw`. A pesar de las etiquetas del repositorio (`llm-inference`, `local-llm`, `cpu-inference`), no contiene pesos de ningún modelo de lenguaje: es una instantánea del código fuente del proyecto [github.com/Scottcjn/trashclaw](https://github.com/Scottcjn/trashclaw), con un tamano de repositorio de 0,0 GB. El autor lo describe como un cliente de agente que se conecta a cualquier servidor LLM local compatible con la API de OpenAI y ejecuta acciones sobre la maquina del usuario: ficheros, shell, git, peticiones web y portapapeles.

El programa es un unico fichero Python (`trashclaw.py`) que solo requiere Python 3.7 o superior y la biblioteca estandar, sin `pip install` ni dependencias externas en Linux y macOS. Expone 14 herramientas integradas, 21 comandos de consola y un sistema de plugins que convierte cualquier fichero `.py` depositado en `~/.trashclaw/plugins/` en una herramienta adicional. Su propuesta de valor es la portabilidad extrema: el autor afirma que funciona en hardware vintage como un PowerBook G4 (PowerPC), un Mac Pro 2013 o un IBM POWER8, delegando todo el calculo del modelo en un backend externo.

Es relevante ahora por dos motivos. Primero, porque ejemplifica una categoria distinta de la de los modelos generativos: la del agente orquestador ligero que separa el razonamiento (servido por un LLM local) de la ejecucion de acciones (ejecutada en local con aprobacion humana). Segundo, porque su publicacion en Hugging Face con etiquetas de inferencia puede inducir a confusion: quien busque pesos descargables no los encontrara aqui. El modelo no tiene arquitectura, parametros ni contexto propios; todas esas propiedades dependen del servidor LLM al que se conecte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal, es un agente cliente CLI escrito en Python (un solo fichero) |
| Parametros totales | No disponible (no contiene pesos) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la determina el backend LLM conectado. Incluye autocompactacion y comando `/compact` (conserva los ultimos 10 mensajes) |
| Tipos de cuantizacion | No aplica; depende del servidor LLM (llama.cpp, Ollama, LM Studio u otro endpoint compatible con OpenAI) |
| Idiomas soportados | No disponible (no se declara ninguno en la model card ni en los metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | No contiene pesos; el repositorio son ficheros fuente (0,0 GB) |
| Tamano del repositorio | 0,0 GB |
| Requisitos de ejecucion | Python 3.7 o superior, solo biblioteca estandar; en Windows requiere `pyreadline3` |
| Herramientas integradas | 14 (`read_file`, `write_file`, `edit_file`, `patch_file`, `run_command`, `search_files`, `find_files`, `list_dir`, `fetch_url`, `git_status`, `git_diff`, `git_commit`, `clipboard`, `think`) mas plugins ilimitados |
| Comandos de consola | 21 (`/add`, `/cd`, `/clear`, `/compact`, `/config`, `/diff`, `/export`, `/load`, `/model`, `/pipe`, `/plugins`, `/remember`, `/save`, `/sessions`, `/stats`, `/status`, `/undo`, `/achievements`, `/about`, `/help`, `/exit`) |
| Backends compatibles | Llama.cpp, Ollama, LM Studio y cualquier endpoint compatible con la API de OpenAI; autodeteccion |
| Fecha de publicacion en Hugging Face | 23 de octubre de 2026 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento que describir: TrashClaw no es un modelo, sino un bucle de agente. El usuario introduce una tarea en la consola; el programa construye un prompt con la descripcion de las herramientas disponibles y el estado de la conversacion, lo envia al endpoint LLM configurado (`TRASHCLAW_URL`), interpreta la llamada a herramienta devuelta, ejecuta la accion en local, devuelve el resultado al modelo y repite el ciclo hasta completar la tarea. La calidad del razonamiento es, por tanto, la del modelo subyacente; el codigo solo aporta el contrato de herramientas y la gestion del contexto.

Las innovaciones destacables son de ingenieria de agentes, no de aprendizaje automatico. Incluye autodeteccion del backend, salida en streaming token a token, reintentos automaticos ante fallo de conexion, autocompactacion del contexto, historial de readline persistente en `~/.trashclaw/history`, autocompletado con tabulador de comandos y rutas, fichero de instrucciones por proyecto (`.trashclaw.md`), fichero de configuracion persistente (`~/.trashclaw/config.json`), deteccion de la rama git para el prompt, diffs coloreados, deshacer con `/undo`, modo no interactivo (`--exec "prompt"` o entrada por stdin), modo de solo lectura (`--read-only` o `TRASHCLAW_READONLY=1`) que bloquea escritura, shell y commit, aprobacion inteligente de comandos de shell (las herramientas de lectura como `ls`, `cat`, `grep`, `wc`, `head`, `tail`, `echo` o `pwd` se pueden aprobar de forma permanente respondiendo `a`) y deteccion de hardware, incluido hardware vintage. La model card no documenta ningun conjunto de datos, entrenamiento, RLHF ni evaluacion.

## Capacidades

- Orquestacion de agentes con bucle de multiples pasos: el LLM decide la herramienta, observa el resultado y vuelve a decidir hasta terminar la tarea.
- Tool calling / function calling mediante definiciones JSON Schema por herramienta (`TOOL_DEF`), extensible con plugins.
- Manipulacion de ficheros: lectura con rango de lineas, escritura, edicion por reemplazo exacto de cadenas y aplicacion de parches en formato diff unificado.
- Ejecucion de comandos de shell con confirmacion del usuario y politica de aprobacion por herramienta; posibilidad de bloquearlas por completo en modo de solo lectura.
- Integracion con git: estado, diff y commit con staging automatico.
- Busqueda en el sistema de ficheros: `grep` por patron y busqueda por glob.
- Acceso web: `fetch_url` recupera una URL y extrae el texto.
- Integracion con el portapapeles del sistema (copiar y pegar).
- Herramienta explicita de razonamiento (`think`) para planificar antes de actuar.
- Gestion de sesion: guardar, listar, cargar y exportar conversaciones en Markdown; memorias de proyecto con `/remember`.
- Cambio de modelo en mitad de la sesion con `/model` y metricas de generacion con `/stats` (tokens, tiempo, tokens por segundo).
- Sistema de logros (10 hitos) con persistencia y estadisticas de uso.
- Capacidades multilingues, de vision, audio o matemáticas: no disponibles por si mismo; heredadas exclusivamente del modelo conectado.

## Casos de uso

- Mantenimiento de repositorios con TODOs acumulados: el agente busca `/TODO|FIXME|HACK/`, agrupa los hallazgos, redacta un documento de seguimiento y lo confirma en git mediante `write_file` y `git_commit`; es el flujo que la propia model card documenta como ejemplo.
- Refactorizacion quirurgica en produccion: `edit_file` reemplaza cadenas exactas y `patch_file` aplica diffs multilinea, con diff coloreado y `/undo` para revertir, lo que permite cambios acotados y revisables sin salir de la terminal.
- Auditoria de un codebase ajeno en modo seguro: con `--read-only` o `TRASHCLAW_READONLY=1` el agente puede leer, buscar y ejecutar `git diff` sin riesgo de escritura, shell ni commit, apropiado para una primera pasada sobre un repositorio desconocido.
- Automatizacion en CI/CD: el modo `--exec "prompt"` y la entrada por stdin permiten lanzar tareas no interactivas, por ejemplo generar un borrador de changelog a partir de `git_diff` o resumir los cambios de un pull request en un fichero de artefacto.
- Operacion en hardware antiguo o aislado: al no tener dependencias y requerir solo Python 3.7+, puede ejecutarse en un PowerPC G4/G5, un IBM POWER8 o un Mac Pro 2013 apuntando a un servidor LLM en la misma red local, sin claves de API ni salida a internet.
- Extraccion y sintesis de documentacion web: `fetch_url` recupera el texto de una pagina y `/pipe` guarda la respuesta del asistente en un fichero, util para construir notas tecnicas o resumenes de referencias.
- Extension con herramientas de dominio propio: un plugin de ~15 lineas en `~/.trashclaw/plugins/` expone una API interna (inventario, ticketing, consulta a base de datos) como herramienta invocable por el modelo, sin bifurcar el proyecto ni tocar configuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y al no contener pesos propios no seria posible atribuirle metricas de calidad de modelo. La unica metrica operativa que reporta la herramienta es la de generacion (`/stats`: tokens, tiempo y tokens por segundo), que depende enteramente del backend LLM y del hardware donde este se ejecute.

## Requisitos de hardware

- VRAM para el agente: 0 GB. El proceso es un cliente Python sin dependencias que solo consume CPU y memoria del sistema.
- VRAM para el modelo: no determinable desde este repositorio; la fija el LLM servido por el backend. Con modelos de 7-8 mil millones de parametros en cuantizacion de 4 bits el orden de magnitud habitual es de 5-6 GB de VRAM, pero ese dato corresponde al modelo elegido, no a TrashClaw.
- CPU: cualquier arquitectura con Python 3.7 o superior; el autor cita explicitamente PowerPC G4/G5, IBM POWER8, Mac Pro 2013 y PowerBook G4 como hardware soportado.
- GPU recomendadas: no aplica al agente. Para el backend, la eleccion depende del modelo; el propio agente funciona igual contra una GPU dedicada o contra inferencia en CPU.
- Cabe en GPU de consumo: si, el agente en cualquier equipo; el modelo subyacente dependera de su tamano y cuantizacion.
- Opciones de despliegue del backend: llama.cpp, Ollama, LM Studio y cualquier servidor compatible con la API de OpenAI. El agente se configura con la variable `TRASHCLAW_URL` o con `~/.trashclaw/config.json`.
- Latencia y throughput: no disponibles como dato del proyecto; medibles en caliente con `/stats`.
- Windows: requiere `pip install pyreadline3` para habilitar historial, autocompletado e historial de comandos; existe documentacion especifica en `WINDOWS_COMPATIBILITY.md`.

## Comparativa con modelos similares

La categoria correcta de comparacion no es la de modelos de lenguaje, sino la de agentes CLI locales que orquestan un LLM. Los datos de rendimiento de las alternativas no se han verificado en la informacion disponible y se marcan como tal.

| Proyecto | Naturaleza | Dependencias | Licencia | Interfaz | Modelos soportados | Rendimiento |
|---|---|---|---|---|---|---|
| TrashClaw | Agente CLI de un solo fichero Python | Ninguna (solo stdlib) | MIT | Terminal | Cualquier endpoint compatible con OpenAI | No disponible |
| Aider | Agente CLI de edicion de codigo | Paquetes Python instalables | Apache 2.0 | Terminal | Multiples backends, incluidos locales | No disponible |
| OpenHands | Plataforma de agentes con entorno de ejecucion | Contenedores y stack completo | MIT | Web y CLI | Multiples backends | No disponible |
| Modelo LLM subyacente | Modelo generativo con pesos | Runtime de inferencia | Segun el modelo | API | No aplica | No disponible |

Diferencias cualitativas relevantes: TrashClaw es el unico de los tres que declara cero dependencias y ejecucion en hardware PowerPC; Aider esta mas especializado en edicion de codigo con integracion git; OpenHands ofrece un entorno de ejecucion mas pesado y una interfaz web. No se dispone de datos objetivos para comparar calidad de resultados entre ellos.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no se puede descargar para inferencia ni Afinar. Cualquiera que llegue al repositorio esperando un LLM ejecutable se llevara una confusion legitima por el etiquetado (`llm-inference`, `cpu-inference`).
- Sin datos de entrenamiento ni evaluacion: no hay benchmarks, ni cardinalidad de dataset, ni resultados reproducibles que permitan estimar su calidad frente a otras herramientas.
- Idiomas no declarados: la model card esta integramente en ingles y no se especifica soporte multilingue del agente ni de los prompts internos.
- Riesgo de ejecucion destructiva: dispone de `run_command`, `write_file` y `git_commit`. La proteccion es la aprobacion interactiva y el modo `--read-only`; en modo `--exec` no interactivo hay que revisar con cuidado que herramientas quedan habilitadas.
- Riesgo de inyeccion de prompts: `fetch_url` introduce contenido de terceros en el contexto del modelo. Una pagina maliciosa puede intentar dirigir llamadas a herramientas; conviene combinar `fetch_url` con modo de solo lectura.
- Alucinacion: heredada del LLM conectado. El bucle de agente puede amplificarla, ya que el modelo actua sobre el sistema de ficheros basandose en sus propias inferencias.
- Trazabilidad del codigo: la model card indica que es una copia del repositorio de GitHub de Scottcjn y del espejo en GitLab; el espacio de Hugging Face no es el repositorio canonico y puede quedar desincronizado.
- Reputacion incipiente: 0 descargas y 0 likes en el momento de la consulta, con el repositorio creado y actualizado el mismo dia. No hay senales de adopcion ni de mantenimiento continuado.
- Licencia MIT: permisiva para uso comercial, pero sin garantias explicitas de idoneidad; el codigo se distribuye tal cual.
- Certificacion "BCOS Certified" mencionada en la model card sin enlace accesible al contenido de `BCOS.md` en la informacion proporcionada; no se puede verificar su alcance.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elyanlabs/trashclaw
- Codigo fuente en GitHub: https://github.com/Scottcjn/trashclaw
- Espejo con historial completo en GitLab: https://gitlab.com/elyan-labs/trashclaw
- Documentacion de compatibilidad con Windows: `WINDOWS_COMPATIBILITY.md` en el repositorio de GitHub
- Ejemplo de plugin: `plugins/example_weather.py` en el repositorio de GitHub
- Papers, blogs y demos: no disponibles en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con el proyecto.
