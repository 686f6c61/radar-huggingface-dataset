# llm-semantic-router/Vela-1.0-Encoder-307M-Embedding

## Resumen

Vela-1.0-Encoder-307M-Embedding es un modelo de embeddings de frases desarrollado por el proyecto vLLM Semantic Router, un ecosistema de enrutamiento semantico de peticiones para infraestructuras de inferencia LLM. El modelo parte del encoder base vllm-sr/Vela-1.0-Encoder-307M y se ha afinado para tareas de similitud semantica, recuperacion de informacion y memoria conversacional dentro del propio router. Su funcion principal es conectar cada peticion entrante con el contexto adecuado, de modo que el enrutador pueda decidir a que modelo, herramienta o base de conocimiento derivarla.

Tecnicamente es un encoder de arquitectura ModernBERT con 306.939.648 parametros, 22 capas y 768 dimensiones de representacion, con una longitud de contexto de 32.768 tokens (incluyendo tokens especiales). Emite vectores unitarios de 768 dimensiones por defecto y soporta representaciones de tipo Matryoshka, lo que permite truncar la dimensionalidad del embedding segun el coste y la precision requeridos.

Su relevancia actual radica en dos factores: por un lado, la ventana de 32K tokens lo hace apto para recuperacion sobre documentos largos, un punto debil habitual en encoders de este tamano; por otro, esta publicado bajo licencia Apache 2.0 y en formatos safetensors y ONNX, lo que facilita su despliegue en produccion con sentence-transformers, Text Embeddings Inference o runtimes ONNX. La model card reporta mejoras medibles frente al mmBERT Embedding original en tareas de clasificacion de intenciones, similitud de pares y recuperacion de documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 306.939.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (incluye tokens especiales) |
| Tipos de cuantizacion | no disponible (la model card menciona evaluacion en FP32; no se listan variantes cuantizadas publicadas) |
| Idiomas soportados | en, ar, es, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Dimension del embedding | 768 (vectores unitarios por defecto), con soporte Matryoshka para truncado |
| Capas | 22 |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |
| Modelo base | vllm-sr/Vela-1.0-Encoder-307M (finetune) |
| Tamano del repositorio | 35,2 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, con 22 capas y 768 dimensiones ocultas, afinado a partir del checkpoint vllm-sr/Vela-1.0-Encoder-307M. La eleccion de ModernBERT frente a BERT clasico aporta mejoras de eficiencia en secuencias largas, coherente con la ventana de 32K tokens que declara la model card. El modelo produce embeddings de frase mediante pooling y normalizacion a vectores unitarios de 768 dimensiones, y admite el esquema Matryoshka, que permite recortar la dimension del vector (por ejemplo a 512, 256 o 128) manteniendo buena parte de la calidad semantica, a cambio de reducir el coste de almacenamiento e indexacion.

La informacion proporcionada no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineacion; estos datos deben considerarse no disponibles. La model card si especifica que el modelo se evaluo en FP32 y que las comparaciones se realizaron contra el mmBERT Embedding original (vllm-sr/mmbert-embed-32k-2d-matryoshka), lo que sugiere un proceso de finetune orientado a tareas de enrutamiento semantico y recuperacion multilingue. El enfasis declarado del proyecto es el uso como componente de un router semantico: clasificacion de intenciones, coincidencia de contexto y memoria en conversaciones multi-turno.

## Capacidades

- Generacion de embeddings de frase y de documento para similitud semantica y recuperacion (retrieval).
- Similitud de pares de frases (tareas tipo PAWS-X, STS-B) en ingles y chino, con soporte declarado tambien para arabe, espanol y japones.
- Clasificacion de intenciones y enrutamiento semantico de peticiones (tareas tipo Banking77 y MASSIVE).
- Recuperacion sobre documentos largos gracias a la ventana de 32.768 tokens (evaluado en SummScreenFD).
- Clustering de textos y de noticias (CLS Clustering, Twenty Newsgroups Clustering).
- Recuperacion bilingue chino-ingles (Tatoeba).
- Embeddings Matryoshka: truncado de dimensionalidad para ajustar coste y precision.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por si mismo; su funcion es representar y comparar textos.

## Casos de uso

- Enrutamiento semantico de peticiones en un gateway LLM: el router codifica la consulta del usuario y la compara contra embeddings de intenciones o rutas predefinidas para decidir que modelo o herramienta atiende la peticion; la ventana de 32K permite incluir contexto conversacional completo en la decision.
- Clasificacion de intenciones en atencion al cliente: con resultados reportados de 74,04 en Banking77, el modelo puede asignar tickets a colas o agentes especializados comparando la consulta con prototipos de cada categoria.
- Recuperacion aumentada (RAG) sobre documentos largos: la ventana de 32K y el rendimiento en SummScreenFD (nDCG@10 de 88,36) lo hacen adecuado para indexar y recuperar pasajes extensos, como transcripciones, informes o contratos, sin trocear en exceso.
- Memoria conversacional en agentes: almacenar embeddings de turnos previos y recuperar los mas relevantes para inyectarlos en el prompt del modelo generativo, reduciendo el coste de reenviar historiales completos.
- Deduplicacion y clustering de contenidos multilingues: agrupar noticias, tickets o resenas en ingles, chino, espanol, arabe o japones usando similitud coseno sobre los embeddings.
- Busqueda semantica bilingue chino-ingles: con resultados de 89,12 en Tatoeba zh-en, sirve para motores de busqueda interna que deban cruzar consultas y documentos en ambos idiomas.
- Filtrado y moderacion por similitud: comparar mensajes entrantes contra embeddings de referencia de contenido permitido o problematico para priorizar revision.

## Benchmarks y rendimiento

Resultados publicados en la model card (puntuaciones x100, mayor es mejor), comparados con el mmBERT Embedding original. Tareas seleccionadas de MTEB 2.21.0:

| Tarea | mmBERT original | Vela |
|---|---:|---:|
| Banking77 | 72,26 | 74,04 |
| MASSIVE · ingles | 63,51 | 68,12 |
| MASSIVE · chino | 61,41 | 66,08 |
| DuRetrieval | 62,47 | 62,99 |
| NFCorpus | 26,38 | 26,13 |
| SciFact | 46,81 | 48,28 |
| PAWS-X · ingles | 62,98 | 71,74 |
| PAWS-X · chino | 59,29 | 62,82 |
| STS-B · chino | 75,00 | 74,73 |
| STS-B · ingles | 80,38 | 81,19 |
| CLS Clustering | 34,20 | 34,87 |
| Twenty Newsgroups Clustering | 38,05 | 38,53 |
| Tatoeba · chino-ingles | 89,13 | 89,12 |

Recuperacion de documentos largos:

| Evaluacion | Metrica | mmBERT original | Vela |
|---|---|---:|---:|
| SummScreenFD · 336 consultas | nDCG@10 | 76,99 | 88,36 |

Ambos modelos usan 22 capas, 768 dimensiones y FP32. Cada fila de MTEB emplea la metrica principal estandar de la tarea; SummScreenFD usa su split de validacion. El autor advierte que estos resultados describen unicamente las tareas listadas y no constituyen una puntuacion MTEB completa ni un ranking. No se han publicado resultados de benchmarks adicionales (por ejemplo MMLU, HumanEval o GSM8K) en la informacion disponible, lo cual es esperable al tratarse de un modelo de embeddings y no de generacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 306,9 M de parametros, en FP32 el modelo ocupa aproximadamente 1,2 GB de pesos; en FP16 unos 0,6 GB; en INT8 unos 0,3 GB. A ello hay que sumar memoria de activaciones, que crece con la longitud de secuencia: procesar 32K tokens requiere bastante mas memoria que secuencias cortas, por lo que conviene presupuestar varios GB adicionales en funcion del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en FP16 con secuencias moderadas; para lotes grandes o secuencias cercanas a 32K se recomiendan GPU de 24 GB o mas (RTX 4090, L40S, A100, H100). La model card menciona builds de PyTorch con ROCm para GPU AMD.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, especialmente en FP16 o INT8 y con longitudes de secuencia controladas.
- Opciones de despliegue: sentence-transformers (referencia en la model card), Text Embeddings Inference (tag text-embeddings-inference), ONNX Runtime para los pesos ONNX publicados, y despliegue como servicio de embeddings en el propio ecosistema vLLM Semantic Router. No se mencionan integraciones con llama.cpp u Ollama, que no son el formato habitual para encoders de embeddings.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Embedding | 306,9 M | 32.768 tokens | en, ar, es, ja, zh | Apache 2.0 | Mejora al mmBERT en la mayoria de tareas evaluadas; SummScreenFD nDCG@10 88,36 |
| mmBERT Embedding (vllm-sr/mmbert-embed-32k-2d-matryoshka) | no disponible | 32K (segun nombre del checkpoint) | multilingue | no disponible | Modelo de referencia directo; peor en PAWS-X, MASSIVE y SummScreenFD, mejor en NFCorpus y STS-B chino |
| Encoders BERT-base multilingues (familia habitual) | ~178 M | 512 tokens tipicamente | multilingue | variable | Ventana de contexto muy inferior; no comparable en recuperacion de documentos largos |

La informacion proporcionada solo permite una comparacion directa fiable con el mmBERT Embedding original, que es el checkpoint de referencia usado por el autor. Para alternativas de terceros (por ejemplo encoders de embeddings multilingues de otros proveedores) no hay datos de benchmarks en la informacion disponible, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, razonar de forma autonoma ni ejecutar tool calling; solo genera representaciones vectoriales.
- Los benchmarks publicados cubren una seleccion de tareas y no una evaluacion MTEB completa; el propio autor advierte que no deben interpretarse como ranking global.
- En NFCorpus y en STS-B chino el modelo queda ligeramente por debajo del mmBERT original, por lo que no hay mejora universal.
- La cobertura idiomatica declarada se limita a ingles, arabe, espanol, japones y chino; el rendimiento en otros idiomas no esta documentado.
- No se detalla la composicion del dataset de entrenamiento ni posibles sesgos; al ser un encoder afinado sobre datos no especificados, puede heredar sesgos presentes en el corpus base y en los datos de finetune.
- Riesgo de falsos positivos en similitud semantica: como todo encoder, puede asignar alta similitud a textos con solapamiento lexico pero significado distinto; conviene calibrar umbrales por caso de uso.
- El repositorio ocupa 35,2 GB, muy superior al tamano de los pesos del modelo, probablemente por incluir multiples formatos (safetensors y ONNX); hay que prever espacio en disco y ancho de banda de descarga.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligaciones de atribucion y aviso de cambios; no se han identificado restricciones adicionales en la informacion disponible.
- Al tratarse de un modelo reciente (creado en septiembre de 2026), la validacion independiente en produccion es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Embedding
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Checkpoint de referencia mmBERT Embedding: https://huggingface.co/vllm-sr/mmbert-embed-32k-2d-matryoshka
- Coleccion Vela 1.0 Router Models: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentacion del proyecto: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Canal de Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN
