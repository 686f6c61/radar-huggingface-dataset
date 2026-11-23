# AntonDergunov/task-icon-encoder-e5-large-interim

## Resumen

Task icon encoder (e5-large, interim) es un codificador de frases especializado que selecciona el icono de Material Symbols mas adecuado semanticamente para una tarea de una lista de pendientes. Lo desarrolla AntonDergunov y se construye mediante fine-tuning del modelo `intfloat/multilingual-e5-large` como codificador dual (dual encoder), exportado a ONNX con pesos en fp16. Resuelve un problema muy concreto: mapear el texto libre de una tarea ("Health: Book a dentist appointment") a uno de 2.862 iconos, en lugar de exigir al usuario que elija el icono manualmente.

El modelo forma parte de la infraestructura del proyecto `agentic-org-planner`, donde alimenta los iconos de la agenda. Su interes tecnico reside en la combinacion de un encoder multilingue consolidado con un pipeline de recuperacion por similitud coseno sobre vectores de iconos precalculados, con umbral de confianza basado en z-score. Es un checkpoint intermedio de investigacion (fechado el 2026-11-22), no una version final.

La relevancia actual es limitada pero clara para nichos concretos: demuestra un patron replicable de "texto a elemento de interfaz" mediante embeddings, con soporte para diez idiomas y despliegue ligero en CPU via ONNX Runtime, sin necesidad de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de intfloat/multilingual-e5-large), codificador dual |
| Parametros totales | no disponible (el modelo base multilingual-e5-large tiene 560M; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | truncamiento a 64 tokens en el uso documentado |
| Tipos de cuantizacion | pesos fp16 en ONNX; entradas y salida fp32 |
| Idiomas soportados | en, es, ru, de, fr, pt, it, zh, ja, pl |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_fp16.onnx`), tokenizer XLM-R SentencePiece (`tokenizer.json`), vectores de iconos en `dense.npy` (fp16, `[2862, 1024]`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder derivado de `intfloat/multilingual-e5-large`, configurado como codificador dual: por un lado codifica la consulta (titulo de la tarea, opcionalmente con el encabezado padre) y por otro dispone de vectores de iconos precalculados a partir de descripciones textuales de cada glifo. La salida del transformer es `last_hidden_state` de dimension `[batch, seq, 1024]`; el pooling es la media sobre tokens seguida de normalizacion L2. La similitud se calcula como producto escalar (coseno) contra la matriz de 2.862 iconos.

El entrenamiento usa un pool de aproximadamente 11.900 tareas: tareas sinteticas generadas por un LLM al estilo de listas personales, tareas de MS-LaTTE (licencia MIT) y traducciones al espanol y al ruso de ambas. Un juez LLM (Gemini) asigna grados de adecuacion icono-tarea (3/2/1), y la perdida es un InfoNCE multi-positivo graduado. Se anaden reescrituras de registro graduadas de las tareas y las tareas de ejemplo incluidas en la descripcion de cada icono. Del lado de los iconos, cada glifo se describe mediante un LLM a partir del render, sin usar su nombre, lo que evita filtrar la etiqueta en la representacion. La exportacion a ONNX aplica optimizaciones basicas de grafo; se documenta que la fusion de layer-norm de onnxruntime 1.27 no puede cargar este grafo fp16.

## Capacidades

- Generacion de embeddings de frases para recuperacion semantica y similitud de oraciones.
- Clasificacion de tareas de listas de pendientes en iconos Material Symbols por significado.
- Recuperacion multilingue: consultas en diez idiomas contra un espacio de iconos comun.
- Puntuacion de confianza mediante z-score `(max - mean) / std` sobre las puntuaciones de todos los iconos.
- Inferencia en CPU con ONNX Runtime, sin dependencia de GPU.
- Uso como componente de un pipeline mayor (agenda de `agentic-org-planner`).
- No soporta tool calling, agentes, vision ni audio; es exclusivamente un encoder de texto.

## Casos de uso

- Asignacion automatica de iconos en aplicaciones de tareas: al crear una tarea, el modelo recibe `"<padre>: <titulo>"` y devuelve el nombre del icono mas probable, eliminando la seleccion manual en interfaces de gestion personal.
- Enriquecimiento de agendas y calendarios: integrado en el backend de `agentic-org-planner`, categoriza visualmente eventos y pendientes para mejorar la lectura rapida de la interfaz.
- Clasificacion semantica de entradas de texto libre en aplicaciones multilingues: al compartir espacio de embeddings entre diez idiomas, una misma taxonomia de iconos sirve para usuarios en espanol, ruso, chino o japones sin reentrenar.
- Filtrado por confianza en produccion: el umbral del manifiesto permite ocultar el icono cuando ninguna categoria encaja, evitando asignaciones erroneas en tareas ambiguas.
- Prototipado de sistemas de recuperacion texto-a-elemento-de-UI: sirve como referencia para construir mapeos de texto a cualquier catalogo finito de etiquetas con vectores precalculados.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con ONNX Runtime y truncamiento a 64 tokens, es viable en servicios serverless o dispositivos sin GPU.
- Investigacion sobre evaluacion con jueces LLM: el pipeline de etiquetado graduado (3/2/1) y las etiquetas "silver" documentadas son un ejemplo metodologico reutilizable.

## Benchmarks y rendimiento

Evaluacion sobre tareas de dev reservadas, etiquetadas por el mismo juez LLM (etiquetas "silver", no humanas), con consulta de titulo mas encabezado padre:

| Modelo | nDCG@5 | hit@1 |
|---|---|---|
| task-icon-encoder-e5-large-interim | 0,567 | 0,714 |
| e5-small sin ajustar con fusion BM25 (baseline) | 0,336 | 0,437 |

Rendimiento multilingue del modelo ajustado sobre las mismas tareas traducidas automaticamente:

| Idioma de la consulta | nDCG@5 |
|---|---|
| Texto original | 0,597 |
| Aleman, frances, portugues, italiano, chino, japones, polaco | 0,568–0,594 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 1,1 GB y los pesos ONNX estan en fp16, por lo que la inferencia en CPU es el modo documentado.
- GPU recomendadas: no se especifican; el uso documentado emplea `CPUExecutionProvider`.
- Cabe en GPU consumer: previsiblemente si (tamano de pesos en el orden de cientos de MB en fp16), aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime (documentado, con `ORT_ENABLE_BASIC`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El truncamiento a 64 tokens y el pooling por media mantienen el coste por consulta bajo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task-icon-encoder-e5-large-interim | no disponible (base e5-large) | 64 tokens (truncamiento de uso) | Texto a icono Material Symbols | MIT | ONNX en Hugging Face |
| intfloat/multilingual-e5-large | 560M (segun el modelo base) | no disponible en esta ficha | Embeddings de frases genericos | MIT | Hugging Face |
| e5-small con fusion BM25 (baseline del autor) | no disponible | no disponible | Recuperacion texto a icono | no disponible | Configuracion de evaluacion del autor |

La comparativa con alternativas de la misma categoria (encoders especializados en mapeo texto a elemento de interfaz) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de investigacion (2026-11-22); el autor advierte que puede ser reemplazado y recomienda fijar una revision si se depende de el.
- Las etiquetas de evaluacion provienen de un juez LLM ("silver"), no de anotacion humana; la recogida de etiquetas humanas sigue en curso.
- El conjunto de iconos se limita a los nombres de Material Symbols en `bundle/names.txt`, excluyendo glifos rechazados en una revision manual.
- Riesgo de alucinacion de categoria: el modelo siempre devuelve el icono con mayor similitud; el umbral de confianza es deliberadamente bajo y solo oculta el icono cuando casi nada encaja.
- El truncamiento a 64 tokens puede perder informacion en titulos y encabezados largos.
- El rendimiento multilingue se evaluo con traduccion automatica, no con hablantes nativos, y cae ligeramente respecto al texto original (0,568–0,594 frente a 0,597 en nDCG@5).
- La fusion de layer-norm de onnxruntime 1.27 no carga el grafo fp16; hay que limitarse a optimizaciones basicas de grafo.
- Licencia MIT para el modelo; los iconos son Material Symbols de Google (Apache 2.0) y el modelo base es de intfloat (MIT), con obligaciones de atribucion correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AntonDergunov/task-icon-encoder-e5-large-interim
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large
- Proyecto que lo usa: https://github.com/anton-dergunov/agentic-org-planner
- Dataset MS-LaTTE: https://github.com/microsoft/MS-LaTTE
- Iconos Material Symbols: https://fonts.google.com/icons
