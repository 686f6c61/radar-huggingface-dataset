# emrevrg/Nythos-Embed-Zero

## Resumen

Nythos Embed Zero es un modelo de embeddings multilingue desarrollado por Norovox Labs (el desarrollador independiente emrevrg) a partir de google/embeddinggemma-2. Resuelve tareas de similitud semantica, recuperacion de informacion (retrieval), clasificacion y clustering, y anade rutas para audio e imagen sobre una ruta de texto congelada de 271 millones de parametros. El checkpoint publicado en safetensors contiene 744.371.512 parametros en total, lo que incluye las capas de las modalidades adicionales.

Su relevancia actual radica en que, segun las mediciones del propio autor, supera a EmbeddingGemma 2 en 20 de 22 metricas bajo un protocolo unico (fp32, mismos prompts y mismos conjuntos de test), con mejoras especialmente marcadas en recuperacion en turco (WikiRAG-TR) y en recuperacion texto-audio (AudioCaps). Ademas, compite con modelos de embeddings abiertos de mayor tamano como Qwen3-Embedding-0.6B, multilingual-e5-large-instruct y BGE-M3 en las cinco pruebas de texto reportadas.

El modelo se distribuye bajo licencia Apache 2.0, emplea la libreria sentence-transformers y soporta truncamiento Matryoshka a 512 y 256 dimensiones, lo que permite reducir el coste de almacenamiento e indexacion manteniendo buena parte del rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (embedding_gemma2), con capas de modalidad para audio e imagen sobre una ruta de texto congelada |
| Parametros totales | 744.371.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (las mediciones se realizan en fp32 y bf16) |
| Idiomas soportados | Multilingue; con soporte destacado de turco e ingles (segun las pruebas reportadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/embeddinggemma-2 y mantiene congelada la ruta de texto, que cuenta con 271 millones de parametros. Sobre esa base se entrenan unicamente las capas de las modalidades de audio e imagen. Para la parte visual se emplea destilacion relacional desde EmbeddingGemma 2 sobre imagenes de Flickr30k que no se solapan con el conjunto de test.

El entrenamiento combina destilacion verificada de dos profesores (EmbeddingGemma 2 y Qwen3-Embedding-8B), donde solo se permite ensenar a un profesor si clasifica correctamente la respuesta dorada de cada ejemplo. Se generaron datos sinteticos propios: 40.000 pares de consultas de busqueda en turco para pasajes de Wikipedia y titulos de preguntas al estilo StackExchange para clustering, generados con el motor de inferencia Kapsul y filtrados para conservar solo aquellos en los que la consulta recupera su propio pasaje en primera posicion. Los pasajes solapados con los conjuntos de test se eliminaron mediante filtrado de 10-gramas. Finalmente se aplico un weight soup de dos ejecuciones de entrenamiento promediadas y mezcladas con el modelo base (alpha = 0,7), valor elegido exclusivamente sobre 8 particiones de desarrollo que cubren similitud, retrieval, turco, clustering y clasificacion.

Como innovacion de infraestructura, el autor publica Kapsul, una capa de inferencia sobre vLLM (pooling runner, bf16, batching consciente de la longitud) que alcanza 554 documentos por segundo frente a 69 de SentenceTransformers en fp32 sobre 20.000 documentos web en una H100, es decir, 8,0 veces mas rapido, con una similitud coseno media de 0,99998 respecto a la referencia.

## Capacidades

- Generacion de embeddings de texto para similitud semantica, recuperacion, clasificacion y clustering.
- Soporte multilingue, con rendimiento medido especificamente en ingles y turco.
- Embeddings de imagen y recuperacion cruzada texto-imagen e imagen-texto (Flickr30k).
- Embeddings de audio y recuperacion texto-audio (AudioCaps).
- Truncamiento Matryoshka a 512 y 256 dimensiones sin reentrenamiento.
- Prompts especificos por tarea (`SearchQuery`, `Document`) para consultas y documentos.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el runner de pooling de vLLM.
- No se reporta soporte de tool calling, agentes ni modo de razonamiento, por tratarse de un modelo de embeddings y no generativo.

## Casos de uso

- Busqueda semantica en turco: indexar pasajes de Wikipedia o documentacion corporativa y recuperar con consultas en turco; el modelo obtiene 0,4837 de nDCG@10 en WikiRAG-TR frente a 0,4726 de EmbeddingGemma 2, con un intervalo bootstrap de +0,0111 [+0,0072, +0,0150] sobre 4.999 consultas.
- Recuperacion cientifica y medica: construir un motor de busqueda sobre articulos cientificos o documentacion clinica; alcanza 0,8714 de nDCG@10 en SciFact y 0,3913 en NFCorpus, por delante de Qwen3-Embedding-0.6B (0,7023 y 0,3638) y BGE-M3 (0,6437 y 0,3157).
- Clasificacion de textos con regresion logistica sobre embeddings: etiquetado de tickets de soporte (Banking77, 0,9357), analisis de sentimiento en tuits (0,7253) o resenas de cine (IMDB, 0,9240) sin entrenar un transformer completo.
- Clustering y organizacion de corpus: agrupar hilos de Reddit (V-measure 0,5874), preguntas de StackExchange (0,6772) o noticias de TwentyNewsgroups (0,4850) para descubrimiento de temas o deduplicacion.
- Busqueda multimodal texto-imagen: recuperar imagenes a partir de descripciones textuales en catalogos de producto o archivos fotograficos; obtiene 0,8714 de R@1 en Flickr30k texto-a-imagen.
- Recuperacion texto-audio: localizar clips de audio a partir de descripciones habladas o escritas, con 0,121 de R@1 y 0,580 de R@10 en AudioCaps, muy por encima de EmbeddingGemma 2 (0,068 y 0,362).
- Indexacion a gran escala con Kapsul sobre vLLM: procesar corpus de decenas de millones de documentos en bf16 con batching consciente de la longitud, logrando 554 documentos por segundo en una H100.
- Sistemas con restricciones de almacenamiento: usar la truncacion Matryoshka a 256 dimensiones, que en STS-B rinde 0,8844 frente a 0,8738 de EmbeddingGemma 2 a la misma dimension, reduciendo el espacio del indice vectorial.

## Benchmarks y rendimiento

Resultados reportados por el autor frente a EmbeddingGemma 2 (fp32, mismos prompts y conjuntos de test):

| Prueba | EmbeddingGemma 2 | Nythos Embed Zero |
|---|---|---|
| STS-B (similitud en ingles, Spearman) | 0,8749 | 0,8865 |
| STS-TR (similitud en turco, Spearman) | 0,7863 | 0,8091 |
| WikiRAG-TR (retrieval en turco, nDCG@10) | 0,4726 | 0,4837 |
| SciFact (retrieval cientifico, nDCG@10) | 0,8645 | 0,8714 |
| NFCorpus (retrieval medico, nDCG@10) | 0,3608 | 0,3913 |
| Flickr30k texto-imagen R@1 / R@5 / R@10 | 0,8676 / 0,9788 / 0,9882 | 0,8714 / 0,9818 / 0,9896 |
| Flickr30k imagen-texto R@1 | 0,954 | 0,956 |
| Flickr30k imagen-texto R@5 / R@10 | 1,000 / 1,000 | 0,999 / 1,000 |
| AudioCaps texto-audio R@1 / R@5 / R@10 | 0,068 / 0,250 / 0,362 | 0,121 / 0,413 / 0,580 |

Clasificacion (regresion logistica sobre embeddings) y clustering (V-measure):

| Tarea | EmbeddingGemma 2 | Nythos Embed Zero |
|---|---|---|
| Banking77 | 0,9293 | 0,9357 |
| Emotion | 0,7009 | 0,7190 |
| Amazon counterfactual (en) | 0,9194 | 0,9224 |
| Tweet sentiment | 0,7230 | 0,7253 |
| IMDB | 0,9230 | 0,9240 |
| TwentyNewsgroups clustering | 0,4710 | 0,4850 |
| Reddit clustering | 0,5579 | 0,5874 |
| StackExchange clustering | 0,6732 | 0,6772 |

Truncamiento Matryoshka (mezcla de texto previa, alpha = 0,6):

| Prueba | EG2 768-d | Zero 512-d | EG2 256-d | Zero 256-d |
|---|---|---|---|---|
| STS-B | 0,8749 | 0,8873 | 0,8738 | 0,8844 |
| STS-TR | 0,7863 | 0,8066 | 0,7909 | 0,8083 |
| WikiRAG-TR | 0,4726 | 0,4708 | 0,4271 | 0,4404 |
| SciFact | 0,8645 | 0,8701 | 0,8418 | 0,8548 |
| NFCorpus | 0,3608 | 0,3878 | 0,3432 | 0,3793 |

Comparativa con modelos abiertos de mayor tamano (cinco pruebas de texto, prompts propios de cada modelo, mezcla de texto previa, alpha = 0,6):

| Prueba | Nythos Embed Zero (271M) | Qwen3-Embedding-0.6B (596M) | multilingual-e5-large-instruct (560M) | BGE-M3 (568M) |
|---|---|---|---|---|
| STS-B | 0,8873 | 0,9113 | 0,8838 | 0,8485 |
| STS-TR | 0,8067 | 0,7501 | 0,8296 | 0,7978 |
| WikiRAG-TR | 0,4804 | 0,3551 | 0,3659 | 0,4260 |
| SciFact | 0,8729 | 0,7023 | 0,7118 | 0,6437 |
| NFCorpus | 0,3913 | 0,3638 | 0,3589 | 0,3157 |

El autor advierte que sus datos de entrenamiento incluyen pares de retrieval cientifico y medico, lo que favorece los resultados en SciFact y NFCorpus. En SciFact, la mejora frente a EmbeddingGemma 2 no es estadisticamente significativa (+0,0070, intervalo [−0,0033, +0,0176], n = 300).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 744.371.512 parametros, en fp32 el peso ronda los 3 GB (tamano del repo) y en bf16 aproximadamente la mitad.
- GPU recomendadas: H100 para indexacion a gran escala (medicion de Kapsul sobre 20.000 documentos); cualquier GPU con al menos unos pocos GB de VRAM para inferencia en bf16.
- GPU de consumo: el tamano del checkpoint hace plausible su ejecucion en GPUs de consumo con suficiente VRAM, aunque el autor no publica mediciones especificas en ese hardware.
- Opciones de despliegue: sentence-transformers (fp32, por defecto), vLLM con `runner="pooling"` y `dtype="bfloat16"` a traves de Kapsul, y endpoints compatibles (tag `endpoints_compatible`).
- Throughput medido: 69 documentos por segundo con SentenceTransformers en fp32 y 554 documentos por segundo con Kapsul en una H100 (8,0 veces mas), con similitud coseno media de 0,99998 y minima de 0,99992 respecto a la referencia.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nythos Embed Zero | 744M totales (271M en la ruta de texto) | No disponible | Apache 2.0 | Hugging Face | Texto, imagen y audio; mejor en WikiRAG-TR, SciFact y NFCorpus de su comparativa |
| EmbeddingGemma 2 | No disponible | No disponible | No disponible en la informacion | Hugging Face (google) | Modelo base; Nythos le gana en 20 de 22 medidas reportadas |
| Qwen3-Embedding-0.6B | 596M | No disponible | No disponible en la informacion | Hugging Face | Mejor en STS-B (0,9113); peor en WikiRAG-TR, SciFact y NFCorpus |
| multilingual-e5-large-instruct | 560M | No disponible | No disponible en la informacion | Hugging Face | Mejor en STS-TR (0,8296); peor en el resto de pruebas de texto |
| BGE-M3 | 568M | No disponible | No disponible en la informacion | Hugging Face | Inferior en las cinco pruebas de texto reportadas |

## Limitaciones y advertencias

- Los benchmarks proceden exclusivamente del autor del modelo, medidos bajo su propio protocolo; no se han publicado evaluaciones independientes.
- La mejora en SciFact frente a EmbeddingGemma 2 no es estadisticamente significativa segun el propio intervalo bootstrap reportado.
- Los datos de entrenamiento incluyen pares de retrieval cientifico y medico, lo que puede inflar los resultados en SciFact y NFCorpus respecto a un uso general.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de adopcion ni validacion por terceros.
- El autor es un desarrollador independiente sin empresa; no hay garantias de soporte a largo plazo.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion (no aplica directamente a un modelo de embeddings) ni limitaciones de contexto o idioma mas alla de las pruebas reportadas.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base google/embeddinggemma-2, no disponible en la informacion proporcionada.
- La ruta de audio muestra un rendimiento absoluto bajo (R@1 de 0,121 en AudioCaps), adecuado para recuperacion amplia pero no para coincidencia precisa.
- El truncamiento a 256 dimensiones degrada WikiRAG-TR (0,4404 frente a 0,4837 a dimension completa); debe validarse en el dominio concreto antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emrevrg/Nythos-Embed-Zero
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
