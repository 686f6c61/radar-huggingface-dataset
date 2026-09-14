# moganai/MoganBERT-Embed

## Resumen
MoganBERT-Embed es un modelo de embeddings de frases en turco desarrollado por MoganAI, construido sobre el encoder MoganBERT-TR. Con 148.768.512 parámetros (aproximadamente 149M) y arquitectura ModernBERT, proyecta texto en vectores de 768 dimensiones mediante mean pooling y normalización L2. No requiere prefijos ni instrucciones de tarea, lo que simplifica su integración en pipelines de recuperación y clasificación.

El problema que resuelve es concreto: los representaciones crudas del encoder base son fuertemente anisótropas (`cos_raw` = 0.9841), lo que las hace inservibles para similitud coseno. MoganBERT-Embed corrige esto mediante un entrenamiento en dos fases (destilación de profesor y ajuste contrastivo), bajando `cos_raw` a 0.0851 y elevando la recuperación zero-shot de 0.2361 a 0.5927. Es relevante porque el ecosistema de embeddings de alta calidad para turco es mucho más reducido que el anglosajón o el multilingüe genérico.

Se publica bajo licencia Apache-2.0, en formato safetensors y con integración nativa en `sentence-transformers`, lo que permite uso comercial sin fricción. Está evaluado en MTEB(Turkish) sobre 26 tareas, con fp16, similitud coseno y un máximo de 2.048 tokens por secuencia. El propio autor señala que la recuperación (retrieval) es su punto relativamente débil y recomienda Mogan-ColBERT-TR para cargas con retrieval como prioridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidirectional), con cabeza de embedding de 768 dimensiones |
| Parametros totales | 148.768.512 (≈149M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens en la evaluacion MTEB(Turkish); limite maximo del encoder base no disponible |
| Tipos de cuantizacion | No se publican archivos cuantizados oficiales; el modelo se distribuye en safetensors (fp32/fp16). Cuantizacion int8/4-bit posible via tooling externo, no verificada en la informacion disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `sentence-transformers`; repo de 0,6 GB) |
| Dimension del embedding | 768 |
| Metodo de pooling | Mean pooling + normalizacion L2 |
| Modelo base | moganai/MoganBERT-TR |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento
El modelo parte de MoganBERT-TR, un encoder fundacional turco entrenado desde cero con un currículum CLM-MLM, y hereda la arquitectura ModernBERT. Sobre ese encoder se aplican dos fases de entrenamiento. La fase 1 consiste en destilación desde un profesor mucho mayor, Qwen3-Embedding-8B: el estudiante se proyecta hacia el espacio de 3072 dimensiones del profesor y la función de pérdida incorpora un término de regularización de anisotropía GOR. Esta fase por sí sola reduce `cos_raw` de 0.9841 a 0.0851 y eleva la recuperación zero-shot (IR) de 0.2361 a 0.5927.

La fase 2 es un ajuste fino contrastivo con InfoNCE y negativos duros, en el que a los pares de retrieval se les añaden señales de NLI, STS con gradación (CoSENT), etiquetas de clasificación, pares de pregunta-respuesta y texto paralelo. El checkpoint publicado no es el resultado de una única ejecución: es una media ponderada de la fase 1 y de dos ejecuciones de la fase 2. La innovación técnica destacable es el uso combinado de la proyección al espacio del profesor con un término explícito de regularización de anisotropía, que ataca directamente el problema de las representaciones colapsadas del encoder base.

## Capacidades

- Generación de embeddings de frases en turco: vectores de 768 dimensiones con mean pooling y normalización L2, sin necesidad de prompt ni instrucción de tarea.
- Similitud semántica y detección de paráfrasis (tareas STS), con evaluación sobre el conjunto MTEB(Turkish).
- Búsqueda semántica (retrieval) en corpus turcos, aunque el propio autor la identifica como la dimensión relativamente más débil del modelo.
- Clasificación de texto por características: el embedding sirve como entrada para clasificadores lineales o fine-tuning ligero.
- Clustering y agrupación semántica de documentos en turco.
- Señales auxiliares aprendidas durante el entrenamiento: NLI, QA y texto paralelo, lo que aporta cierta robustez en tareas de inferencia textual y correspondencia entre frases.
- Extracción de características (`feature-extraction`) mediante la librería `sentence-transformers`.
- Capacidades que no posee: no genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, no tiene visión ni audio y no ofrece un modo "thinking".

## Casos de uso

- Búsqueda semántica sobre documentación interna en turco: indexar manuales, contratos o bases de conocimiento turcas y recuperar pasajes por significado en lugar de por coincidencia léxica, aprovechando la ventana de 2.048 tokens para fragmentos largos.
- RAG sobre corpus turcos con matiz importante: dado que el retrieval es el punto débil declarado, conviene combinarlo con un reranker o usar Mogan-ColBERT-TR cuando la recuperación sea el cuello de botella.
- Deduplicación y near-duplicate detection en datasets de entrenamiento: generar embeddings de millones de documentos turcos y aplicar similitud coseno con umbrales para eliminar contenido redundante antes del entrenamiento.
- Clasificación y triaje de tickets de soporte: usar los embeddings como entrada de un clasificador ligero para enrutar incidencias por categoría, idioma o urgencia sin entrenar un transformer completo desde cero.
- Moderación de contenido y análisis de sentimiento en redes sociales turcas: agrupar mensajes por tema o toxicidad usando clustering sobre embeddings, con un coste de inferencia muy inferior al de un modelo generativo.
- Recomendación de contenido y productos en e-commerce: representar catálogo y consultas de usuario en el mismo espacio vectorial de 768 dimensiones para sugerir artículos relacionados en turco.
- Caché semántica y enrutado en aplicaciones con LLM: usar los embeddings para detectar consultas equivalentes ya respondidas y evitar llamadas redundantes a modelos generativos, reduciendo coste y latencia.
- Análisis de encuestas NPS y feedback abierto: agrupar respuestas libres en turco para identificar temas recurrentes sin etiquetado previo.
- Detección de paráfrasis y control de originalidad en textos académicos o editoriales turcos, empleando el umbral de similitud coseno sobre los vectores normalizados.

## Benchmarks y rendimiento
La model card reporta la evaluación sobre MTEB(Turkish), con 26 tareas, precisión fp16, similitud coseno y un máximo de 2.048 tokens. Los resultados por tarea se presentan únicamente como imágenes (`mteb_en.jpg`, `mteb.jpg`) y los números completos por tarea se remiten al paper; no se incluyen valores numéricos de agregados como MMLU o HumanEval (que no aplican a un modelo de embeddings).

Los únicos valores numéricos publicados en la información disponible son los de la fase 1 del entrenamiento:

| Metrica | Antes de la fase 1 | Despues de la fase 1 |
|---|---|---|
| Anisotropia (`cos_raw`) | 0,9841 | 0,0851 |
| Recuperacion zero-shot (IR) | 0,2361 | 0,5927 |

No se han publicado en la información disponible resultados numéricos por tarea de MTEB(Turkish) ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (149M parámetros), unos 0,3 GB en fp16 y unos 0,15 GB en int8. El consumo real escala con el tamano de lote y la longitud de secuencia, que llega hasta 2.048 tokens.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso integradas modestas, y también se puede ejecutar en CPU con throughput aceptable para cargas pequeñas.
- Para servir a escala, GPU de centro de datos como T4, L4, A10G, A100 o H100 son más que suficientes; el modelo es pequeño en comparación con los generativos y el cuello de botella suele estar en el preprocesado y en el almacenamiento vectorial, no en la GPU.
- Opciones de despliegue: `sentence-transformers` (referencia oficial), Hugging Face Text Embeddings Inference (TEI), que aparece en las etiquetas del modelo y en `endpoints_compatible`, y servicio propio con FastAPI o TorchServe. vLLM en modo pooling o llama.cpp/Ollama requerirían conversiones a formatos (GGUF, ONNX) que no se distribuyen oficialmente.
- Latencia y throughput: no disponible. No se publican cifras de peticiones por segundo ni de latencia por lote en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MoganBERT-Embed | 149M | 2.048 tokens en evaluacion MTEB | Turco | Apache-2.0 | Especializado en turco, entrenado con destilacion desde Qwen3-Embedding-8B |
| Mogan-ColBERT-TR | 148,9M | No disponible | Turco | No disponible en la informacion | Mismo autor; retrieval multi-vector con interaccion tardia, recomendado cuando el retrieval es prioritario |
| MoganBERT-TR | 149,4M | No disponible | Turco | No disponible en la informacion | Encoder base sin ajuste de embeddings; representaciones anisotropas, no apto para similitud coseno directa |
| Qwen3-Embedding-8B | 8B (aprox.) | No disponible en la informacion | Multilingue | No disponible en la informacion | Profesor usado en la destilacion; tamano muy superior, coste de inferencia mucho mayor |
| Embeddings multilingues genericos (p. ej. familia E5 o BGE-M3) | Entre 278M y 568M segun variante | 512 a 8.192 tokens segun variante | Multilingue | No disponible en la informacion | Cubren turco como parte de un espacio multilingue, a costa de menos especializacion en el idioma |

Nota: los datos de los modelos de comparacion no aparecen en la información proporcionada sobre MoganBERT-Embed, por lo que deben verificarse en sus respectivas model cards antes de tomar decisiones.

## Limitaciones y advertencias

- Retrieval como punto débil declarado: el propio autor indica que la recuperación es la dimensión relativamente más floja y remite a Mogan-ColBERT-TR para cargas con retrieval como prioridad. No conviene usar MoganBERT-Embed como único componente de un sistema RAG exigente sin un reranker.
- Modelo exclusivamente turco: no está entrenado ni evaluado para otros idiomas, por lo que su uso en textos multilingües o con mezcla de idiomas no está respaldado.
- Sin generación de texto: no puede responder preguntas ni producir contenido; solo transforma texto en vectores. Cualquier caso de uso conversacional requiere un modelo generativo adicional.
- Riesgo de sesgo: no se documenta en la información disponible ningún análisis de sesgos demográficos, políticos o de género en el corpus de entrenamiento turco.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos en similitud, es decir, asignar alta similitud coseno a pares no equivalentes cuando el texto comparte dominio o estilo.
- Anisotropía residual: aunque `cos_raw` baja de 0.9841 a 0.0851, sigue existiendo cierta concentración de similitudes; conviene calibrar umbrales por dominio en lugar de usar valores genéricos.
- Límite de contexto: la evaluación se hace con un máximo de 2.048 tokens; textos más largos deben fragmentarse, y el límite real del encoder base no está especificado en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero se deben conservar los avisos de licencia y atribución correspondientes. Los pesos derivados (por ejemplo, un fine-tuning) deben seguir cumpliendo las condiciones de la licencia del modelo base MoganBERT-TR.
- Trazabilidad limitada: el modelo tiene 60 descargas y 4 likes en el momento de la consulta, un nivel de adopción bajo que implica poca validación independiente por parte de la comunidad.
- No se distribuyen pesos cuantizados ni formatos GGUF/ONNX oficiales, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moganai/MoganBERT-Embed
- Paper (arXiv:2608.25768): https://huggingface.co/papers/2608.25768
- Blog de MoganAI: https://moganai.github.io/
- Coleccion de modelos MoganBERT: https://huggingface.co/collections/moganai/moganbert
- Modelo base MoganBERT-TR: https://huggingface.co/moganai/MoganBERT-TR
- Modelo hermano multi-vector Mogan-ColBERT-TR: https://huggingface.co/moganai/Mogan-ColBERT-TR
- Paper relacionado sobre recuperacion multi-vector de interaccion tardia para turco (arXiv:2608.26344): https://arxiv.org/pdf/2608.26344
