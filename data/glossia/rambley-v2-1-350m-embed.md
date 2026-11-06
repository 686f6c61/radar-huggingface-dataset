# glossia/Rambley-V2.1-350M-Embed

## Resumen

Rambley-V2.1-350M-Embed es un modelo de embeddings de frases desarrollado por glossia, obtenido mediante fine-tuning del modelo base glossia/Rambley-V2.1-350M sobre un subconjunto de los datos de entrenamiento de nomic-embed. Su proposito es convertir texto en vectores densos de 896 dimensiones utiles para tareas de similitud semantica, recuperacion de informacion, clustering y clasificacion de textos. El modelo se distribuye bajo la libreria sentence-transformers y la pipeline `sentence-similarity`.

Con 348.583.480 parametros (aproximadamente 350M) y un repositorio de 0,7 GB en safetensors, se situa en la gama de embeddings de tamano medio, lo que lo hace viable en hardware de consumo. Emplea pooling del ultimo token seguido de normalizacion L2, una eleccion menos habitual que el mean pooling tipico en modelos de embeddings, y no incorpora Matryoshka Representation Learning ni entrenamiento consciente de cuantizacion, lo que limita el truncado de dimensiones y el uso de versiones cuantizadas sin perdida de calidad.

El modelo es relevante para desarrolladores que necesitan un encoder compacto y desplegable localmente para pipelines RAG o busqueda semantica, aunque su adopcion es todavia muy baja (8 descargas y 0 likes en el momento de la consulta) y la informacion publica sobre licencia e idiomas es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (backbone de glossia/Rambley-V2.1-350M) con pooling del ultimo token y normalizacion L2 |
| Parametros totales | 348.583.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor advierte que no hubo entrenamiento consciente de cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embeddings | 896 |
| Modelo base | glossia/Rambley-V2.1-350M |
| Libreria | sentence-transformers (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte del backbone de glossia/Rambley-V2.1-350M y se afina para producir embeddings de frases. La capa de salida aplica pooling del ultimo token (last-token pooling) en lugar de mean pooling, seguido de normalizacion L2, generando vectores de 896 dimensiones. La model card remite a la ficha del modelo base para los detalles del backbone, que no se especifican en la informacion disponible.

El entrenamiento se realizo sobre un subconjunto de los datasets nomic-ai/nomic-embed-unsupervised-data y nomic-ai/nomic-embed-supervised-data, los mismos empleados por la familia Nomic Embed. No se detalla el numero de tokens, la composicion exacta del dataset, ni si se aplicaron etapas de contraste, hard negatives o destilacion. Tampoco se menciona el uso de RLHF o DPO, algo por otra parte poco comun en modelos de embeddings. Destaca la ausencia deliberada de Matryoshka Representation Learning y de entrenamiento consciente de cuantizacion, lo que implica que truncar las dimensiones o cuantizar los vectores degrada la relevancia semantica.

## Capacidades

- Generacion de embeddings de frases de 896 dimensiones para similitud semantica.
- Recuperacion de informacion densa (dense retrieval) en ingles, segun las tareas MTEB evaluadas.
- Clustering de documentos y textos cortos.
- Clasificacion de textos por similitud con etiquetas o prototipos.
- Pair classification y deteccion de duplicados.
- Reranking de candidatos recuperados previamente.
- Extraccion de caracteristicas (`feature-extraction`) mediante la pipeline de sentence-transformers.
- No soporta tool calling, agentes ni generacion de texto: es exclusivamente un encoder.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos con embeddings de 896 dimensiones y recuperar por similitud de coseno; el tamano de 350M permite mantener el indice y el encoder en una sola GPU de consumo.
- Pipeline RAG ligero: usar el modelo como retriever en una arquitectura de recuperacion aumentada, combinado con un LLM generador; su bajo coste de inferencia reduce la latencia total del sistema.
- Deduplicacion de tickets de soporte: agrupar consultas entrantes por similitud para detectar incidencias repetidas antes de asignarlas a agentes humanos.
- Clustering de corpus de noticias o articulos cientificos: agrupar documentos por tematica usando las tareas de clustering evaluadas en MTEB (ArXiv, StackExchange, TwentyNewsgroups).
- Moderacion y clasificacion de contenido: comparar mensajes con prototipos de categorias (toxicidad, intencion, escenario) usando las capacidades de clasificacion medidas en MTEB.
- Deteccion de duplicados en foros o preguntas: aplicar pair classification para identificar preguntas equivalentes antes de publicar, apoyandose en los resultados en SprintDuplicateQuestions.
- Reranking en motores de busqueda internos: reordenar los resultados de un retriever lexico (BM25) con las puntuaciones de similitud del modelo.

## Benchmarks y rendimiento

Resultados MTEB publicados por el autor:

| Tipo de tarea | Tareas | Media |
|---|---:|---:|
| Classification | 8 | 72,79 |
| Clustering | 8 | 44,83 |
| Pair classification | 3 | 78,93 |
| Reranking | 2 | 45,16 |
| Retrieval | 10 | 43,28 |
| Semantic textual similarity | 9 | 75,81 |
| Summarization | 1 | 28,63 |
| Media por tareas | 41 | 58,83 |
| Media por tipos de tarea | 7 | 55,63 |

Resultados destacados por tarea:

| Tarea | Puntuacion |
|---|---:|
| MTOPDomainClassification | 90,78 |
| SprintDuplicateQuestions | 91,64 |
| STS17 | 86,60 |
| TwitterURLCorpus | 84,21 |
| STS15 | 82,00 |
| ImdbClassification | 81,14 |
| BIOSSES | 81,10 |
| STS13 | 79,81 |
| STSBenchmark | 78,52 |
| Banking77Classification | 77,05 |
| FEVERHardNegatives | 68,32 |
| SCIDOCS | 16,66 |
| SummEvalSummarization.v2 | 28,63 |

Los registros detallados estan en el dataset glossia/Rambley-V2.1-350M-Embed-mteb-results. No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB solo para pesos; en fp16/bf16 alrededor de 0,7 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en GPUs de 4 GB o mas.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequenos.
- GPU recomendadas para produccion con alto throughput: A10G, L4, A100 o H100 para servir lotes grandes.
- Despliegue: sentence-transformers (referencia del autor), y por compatibilidad con el formato safetensors, integrable en Text Embeddings Inference (TEI) y en frameworks propios; no se confirma soporte en llama.cpp u Ollama al no publicarse pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | MTEB (referencia) | Licencia |
|---|---|---|---|---|---|
| Rambley-V2.1-350M-Embed | 348,6M | 896 | no disponible | 58,83 media por tareas (41 tareas) | no disponible |
| nomic-embed-text-v1.5 | 137M | 768 (Matryoshka) | 8192 | no disponible en esta ficha | Apache 2.0 |
| BGE-small-en-v1.5 | 33M | 384 | 512 | no disponible en esta ficha | MIT |
| all-MiniLM-L6-v2 | 22,7M | 384 | 256 | no disponible en esta ficha | Apache 2.0 |

La comparacion de rendimiento con las alternativas no puede establecerse con rigor porque no se dispone de sus puntuaciones MTEB en la informacion proporcionada. Rambley-V2.1-350M-Embed es el mayor de los cuatro en parametros y dimension de embedding, pero carece de Matryoshka y de contexto largo documentado, ventajas que si ofrecen alternativas como nomic-embed-text-v1.5.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial no esta garantizado y requiere contactar con el autor.
- No se declaran idiomas soportados; los benchmarks MTEB evaluados son mayoritariamente en ingles, por lo que el rendimiento en castellano es desconocido.
- Al no usar Matryoshka Representation Learning, truncar los embeddings a menos de 896 dimensiones degrada la relevancia semantica.
- Al no haber entrenamiento consciente de cuantizacion, los embeddings cuantizados pueden perder calidad; conviene validar antes de usarlos en produccion.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos en similitud: textos superficialmente parecidos pueden obtener puntuaciones altas.
- Los resultados en retrieval son moderados (43,28 de media), con tareas muy bajas como SCIDOCS (16,66) y ClimateFEVERHardNegatives (26,31); no es adecuado para recuperacion cientifica exigente sin reranking.
- La adopcion es minima (8 descargas, 0 likes), sin comunidad ni soporte documentado; la model card remite al modelo base para detalles clave.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; auditar antes de desplegar.
- El pooling del ultimo token es menos comun que el mean pooling y puede comportarse de forma distinta a lo esperado en textos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glossia/Rambley-V2.1-350M-Embed
- Modelo base: https://huggingface.co/glossia/Rambley-V2.1-350M
- Resultados MTEB detallados: https://huggingface.co/datasets/glossia/Rambley-V2.1-350M-Embed-mteb-results
- Dataset de entrenamiento no supervisado: https://huggingface.co/datasets/nomic-ai/nomic-embed-unsupervised-data
- Dataset de entrenamiento supervisado: https://huggingface.co/datasets/nomic-ai/nomic-embed-supervised-data
- Discord del autor: https://discord.gg/6acXmq3yx2
- Sitio del autor: https://glossia.ai/
