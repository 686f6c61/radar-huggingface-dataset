# apodex/Apodex-1.1-mini-GGUF

## Resumen

Apodex-1.1-mini es un modelo de generación de texto orientado a razonamiento y a flujos agénticos de horizonte largo, publicado por Apodex AI. Se distribuye en este repositorio como cuantización GGUF del modelo base Qwen/Qwen3.5-35B-A3B, con 35.505.251.456 parámetros totales y licencia Apache 2.0. La variante "mini" forma parte de la familia Apodex 1.1, que la compañía presenta como un sistema de razonamiento capaz de trabajar directamente con ficheros, datos, código y herramientas hasta producir entregables verificables.

El modelo está entrenado para function calling nativo y sigue la plantilla de chat de Qwen3.5: las llamadas a herramientas se emiten como `<tool_call><function=...><parameter=...></parameter></function></tool_call>` y el razonamiento se encapsula en `<think>...</think>`. Está pensado para integrarse en el arnés FrontierAgent de Apodex, que orquesta un Agent Team asíncrono con subagentes en paralelo, estado de tarea compartido y un mecanismo de revisión de afirmaciones antes de la entrega.

Su relevancia actual radica en que ofrece, en un único repositorio GGUF ejecutable con llama.cpp, un modelo de 35B con soporte declarado de contexto de hasta 262.144 tokens y resultados competitivos en tareas financieras y de agentes frente a sistemas de frontera, según los datos publicados por el propio autor. El repositorio tiene 8 likes y 0 descargas en el momento de la consulta, y se publicó el 10 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; hereda la del modelo base Qwen/Qwen3.5-35B-A3B (nomenclatura A3B, compatible con Mixture of Experts) |
| Parametros totales | 35.505.251.456 (dato de safetensors) |
| Parametros activos | No disponible de forma explicita; la nomenclatura del modelo base (A3B) sugiere alrededor de 3B activos |
| Longitud de contexto | 262.144 tokens declarados en las buenas practicas de la model card (max_context_length) |
| Tipos de cuantizacion | GGUF; la model card cita Q4_K_M con MTP y un proyector multimodal F16 (mmproj). No se detallan el resto de niveles |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 22,6 GB); etiquetado tambien con transformers |

## Arquitectura y entrenamiento

No se publican en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Lo que si se indica es que el modelo deriva del base Qwen/Qwen3.5-35B-A3B, del que hereda la tokenizador, la plantilla de chat y el formato de razonamiento. La nomenclatura del base (35B totales con sufijo A3B) apunta a una arquitectura de tipo Mixture of Experts con un subconjunto pequeno de parametros activos por token, aunque la model card no lo explicita.

La innovacion tecnica que si se documenta es de naturaleza sistemica mas que de arquitectura de red: el modelo se disena para operar dentro de AgentOS con un Agent Team asincrono. Este descompone tareas complejas, coordina subagentes en paralelo y vuelca los resultados en un estado de tarea compartido, de modo que se pueden revisar prioridades y aceptar nuevos ficheros o requisitos del usuario sin reiniciar el trabajo. Ademas incorpora un mecanismo de "Statement Review" que contrasta afirmaciones clave con sus fuentes, datos y computos antes de entregar, y marca discrepancias cuando las evidencias son insuficientes. En el plano de inferencia, el repositorio incluye un fichero MTP (multi-token prediction) y un proyector multimodal aparte (mmproj), lo que sugiere soporte de decodificacion especulativa y de entradas visuales, si bien esto ultimo no se detalla en el texto de la model card.

## Capacidades

- Generacion de texto y razonamiento explicito en modo "thinking", con el bloque `<think>...</think>` como formato de traza.
- Function calling nativo: los esquemas de herramientas se pasan por el parametro `tools=` de la API de chat completions y la plantilla los renderiza en el prompt.
- Ejecucion agéntica de multiples pasos con descomposicion de tareas, planificacion adaptativa y coordinacion de subagentes en paralelo.
- Trabajo directo sobre artefactos: papers, datasets, hojas de calculo, imagenes y codigo. La model card menciona limpieza de datos, seleccion de metodos, ejecucion de analisis e inspeccion de resultados intermedios.
- Recuperacion de errores y continuidad de tarea: mantiene estado, conserva el trabajo ya completado y permite reorientar el plan ante nueva informacion o feedback del usuario.
- Verificacion de afirmaciones antes de la entrega, con trazabilidad del proceso de revision.
- Soporte multimodal indicado por la presencia de un fichero de proyector (`mmproj-apodex1.1-35b-F16.gguf`) en el ejemplo de despliegue, aunque la model card no describe en detalle el alcance de vision.
- Capacidades multilingues limitadas oficialmente a ingles y chino.

## Casos de uso

- Investigacion cientifica asistida: el modelo puede procesar papers y datasets, ejecutar analisis, inspeccionar resultados intermedios y producir un informe con afirmaciones contrastadas, apoyandose en el mecanismo de revision de evidencias.
- Analisis financiero y elaboracion de informes: con 50,2 en FrontierFinance, la variante mini es adecuada para extraer datos de estados financieros, calcular metricas y redactar memorandos donde cada cifra quede ligada a su fuente.
- Pipelines de analisis de datos de extremo a extremo: limpieza de tablas, seleccion de metodos estadisticos, generacion de codigo de analisis y validacion de los resultados dentro de una misma tarea continua.
- Agentes de automatizacion de back-office: gracias al function calling nativo y al estado de tarea persistente, puede encadenar llamadas a APIs internas, reintentar pasos fallidos y reanudar un flujo largo sin perder el contexto previo.
- Asistencia a desarrolladores sobre repositorios grandes: la ventana de 262.144 tokens permite cargar contextos extensos de codigo, y el formato de llamada a herramientas facilita integrarlo en asistentes de IDE o en revisiones automatizadas de pull requests.
- Generacion de codigo dentro de pipelines de CI/CD: los tool calls en formato `<tool_call>` se parsean a `tool_calls` estilo OpenAI, lo que simplifica su conexion a ejecutores de tests, linters o scripts de despliegue.
- Extraccion y sintesis documental multilingue (anglo-chino): traduccion y resumen de documentacion tecnica entre ingles y chino manteniendo el contexto de un expediente completo.
- Revision de informes con control de calidad: el Statement Review permite usar el modelo como revisor que verifica que las conclusiones de un documento se sostienen sobre los datos citados, marcando discrepancias antes de la publicacion.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las cifras corresponden al sistema completo con Agent Team, no solo al modelo desnudo, y en el caso de la columna de Apodex-1.1 (modelo grande) no a la variante mini de este repositorio.

| Benchmark | Apodex-1.1 (Agent Team) | Apodex-1.1-mini (Agent Team) |
|---|---|---|
| APEX-Agents | 38,5 | 27,7 |
| GDPVal | 78,8 | No disponible |
| FrontierFinance | 54,3 | 50,2 |
| FrontierScience-Research | 63,3 | No disponible |
| BioMysteryBench | 35,3 | No disponible |
| Humanity's Last Exam | 56,1 | No disponible |

El autor indica que el Apodex-1.1-mini lidera FrontierFinance con 50,2 y queda cerca del mejor resultado en APEX-Agent con 27,7. Asimismo, senala que el esquema Agent Team supera de forma consistente a una configuracion ReAct en los tres benchmarks evaluados para la variante mini. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de conocimiento general. Durante la evaluacion, el autor declara que bloqueo el acceso a sitios que alojan benchmarks para evitar filtraciones de respuestas.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M los pesos ocupan aproximadamente 20-21 GB, a lo que hay que sumar la cache KV. El repositorio completo ocupa 22,6 GB. Para contexto muy largo (hasta 262.144 tokens) la cache KV crece de forma notable y exige memoria adicional no cuantificada en la model card. En bf16, los 35,5B parametros ocuparian en torno a 71 GB.
- GPU recomendadas: para cuantizacion Q4_K_M, una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo con contexto moderado; para contexto largo o varias sesiones concurrentes, tarjetas de 48 GB (A6000, L40S) o H100 de 80 GB. Para precision completa en bf16 se necesita al menos una H100 de 80 GB o dos A100 de 80 GB.
- Cabida en GPU de consumo: si, en tarjetas de 24 GB con cuantizacion Q4_K_M y contexto limitado; sera necesario vigilar el consumo de la cache KV.
- Opciones de despliegue: llama.cpp con `llama-server` es el procedimiento documentado por el autor, incluyendo `--chat-template-file`, `--jinja`, `--reasoning-format deepseek` y el fichero `--mmproj` para el proyector. Al ser un GGUF, tambien es compatible con Ollama y con otros runners de llama.cpp, aunque la model card no documenta estas rutas. No se mencionan vLLM ni TGI para este repositorio.
- Parametros de generacion recomendados por el autor: temperature 1.0, top_p 0.95, repetition_penalty 1.05, max_context_length 262144 y max_tokens 32768.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| apodex/Apodex-1.1-mini-GGUF | 35,5B (35.505.251.456) | 262.144 tokens | Apache 2.0 | GGUF | APEX-Agents 27,7; FrontierFinance 50,2 |
| Qwen/Qwen3.5-35B-A3B (modelo base) | No disponible | No disponible | No disponible en esta informacion | No disponible en esta informacion | No disponible |
| Otros modelos agénticos de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card no incluye una comparativa directa contra alternativas concretas de la misma categoria: las graficas de resultados solo contrastan el sistema Agent Team con una configuracion ReAct. Los resultados de la busqueda web realizada no aportan informacion relevante sobre este modelo ni sobre modelos comparables, por lo que no es posible completar esta seccion con datos verificables.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; no hay garantia de calidad en castellano ni en otras lenguas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir afirmaciones no sustentadas. El propio autor incorpora un mecanismo de revision de afirmaciones precisamente porque el riesgo existe, de modo que en produccion conviene mantener verificacion externa.
- Las cifras de benchmarks corresponden al sistema con Agent Team y a la variante grande de la familia, no al modelo desnudo de este repositorio. La comparacion directa con el modelo sin arnes no esta disponible.
- El autor bloquea sitios de benchmarks durante la evaluacion, lo que sugiere conciencia de riesgo de contaminacion; aun asi, no se documenta una evaluacion independiente de terceros.
- La arquitectura, los datos de entrenamiento y los procesos de alineacion no estan documentados en la informacion disponible, lo que dificulta auditar sesgos o comportamientos indeseados.
- El soporte multimodal se deduce del fichero `mmproj` presente en el ejemplo de despliegue, pero la model card no especifica el alcance ni las limitaciones de la entrada de imagen.
- La ventana de 262.144 tokens es la configuracion recomendada, no una garantia de recuperacion fiable de informacion en todo el rango; el rendimiento efectivo en contextos muy largos no esta medido.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No se declaran restricciones adicionales de uso aceptable en la informacion disponible.
- Repositorio muy reciente (creado el 10 de septiembre de 2026) y con 0 descargas, por lo que la validacion por parte de la comunidad es todavia inexistente.
- Una parte del texto de la model card se corta antes de terminar la seccion de uso agéntico, de modo que el prompt de sistema recomendado no esta completo en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apodex/Apodex-1.1-mini-GGUF
- Licencia en el repositorio: https://huggingface.co/apodex/Apodex-1.1-mini-GGUF/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Servicio online: https://www.apodex.ai
- Pagina principal: https://www.apodex.com/
- API: https://platform.apodex.ai
- Blog tecnico: https://www.apodex.com/blog/apodex-1.1-scaling-agentic-intelligence-for-complex-work
- Informe tecnico: https://www.apodex.com/pdf/20260824
- Repositorio del arnes agéntico (FrontierAgent): https://github.com/ApodexAI/FrontierAgent
- Referencia arXiv declarada en las etiquetas: arxiv:2608.23283 (no se ha localizado el articulo en los resultados de busqueda disponibles)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Binarios de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo: devuelven unicamente paginas de agencias de viajes en polaco sin relacion con el tema.
