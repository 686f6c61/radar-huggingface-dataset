# GermannM/kenga-embed-prophet4

## Resumen

kenga-embed-prophet4 es un codificador de frases (sentence encoder) bilingue ruso-ingles de 44,2 millones de parametros desarrollado por GermannM dentro del proyecto Kenga. No es un modelo generativo: su salida es un vector denso de 768 dimensiones normalizado en norma L2, pensado para similitud semantica, recuperacion de informacion y reranking. Se distribuye bajo licencia MIT y se publica unicamente en formato PyTorch (fichero `pytorch_model.bin` de 177 MB en fp32) con el codigo de modelado incluido en el propio repositorio.

El modelo emplea un transformer bidireccional con atencion y proyecciones "Z-factored" (rangos 192 y 512), embeddings de tokens factorizados (16385 x 128 proyectados a 768), 8 capas, 12 cabezas y una posicion aprendida maxima de 512 tokens. El tokenizador es SentencePiece de 16k. Sigue el protocolo de prefijos de FRIDA/BERTA (`search_query`, `search_document`, `paraphrase`, `categorize`, entre otros), lo que permite sustituir modelos anteriores en pipelines ya existentes sin reescribir la logica de consulta.

Su relevancia practica es concreta: cubre el hueco de los encoders rusos de 30-40M de parametros con un resultado global de 54,5 en la media por tipo de tarea de MTEB(rus, v1.1), ligeramente por debajo de modelos mas grandes como BERTA-128M (67,9) y muy lejos de Giga-Embeddings-instruct-480M (73,1), pero por encima de USER2-small-34M (56,5) y rubert-tiny-turbo-29M (52,6) en varias familias de tareas. Es, por tanto, una opcion de bajo coste computacional para despliegues en CPU con requisitos de latencia estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con proyecciones Z-factored (atencion y FF), embedding de tokens factorizado |
| Parametros totales | 44,2 M |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (posiciones aprendidas hasta 512) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint fp32; no hay variantes GGUF, int8 ni ONNX oficiales) |
| Idiomas soportados | ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`, fp32, 177 MB), mas `config.json`, `kenga_spm.model` y `modeling_kenga_embed_v2.py` |
| Dimension del embedding | 768, normalizado L2 |
| Pooling | mean pooling |
| Tokenizador | SentencePiece, vocabulario de 16k |
| Capas / cabezas / dff | 8 / 12 / 3072 |
| Rank de las proyecciones Z-factored | 192 (atencion) y 512 (FF) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | sentence-similarity |
| Checkpoint | paso 250 |

## Arquitectura y entrenamiento

La arquitectura es un transformer bidireccional estilo encoder con dos innovaciones de compresion. Por un lado, el embedding de tokens esta factorizado: una tabla de 16385 x 128 que se proyecta a 768 dimensiones, lo que reduce el coste de la capa de entrada. Por otro, las proyecciones de atencion y de la red feed-forward estan "Z-factored" con rangos 192 y 512 respectivamente, una descomposicion de bajo rango que disminuye el numero de parametros manteniendo la anchura efectiva del modelo. El resultado son 44,2M de parametros en 8 capas con d=768 y dff=3072, con posiciones aprendidas limitadas a 512 tokens.

El entrenamiento descrito en la model card parte de kenga-embed-z2 y anade una etapa supervisada denominada "Prophet". Esa etapa combina tres objetivos: InfoNCE con negativos duros minados sobre 80.000 pares de recuperacion de estilo RuBQ/MIRACL (pregunta-respuesta y titulo-pasaje de Wikipedia), CoSENT sobre 20.000 pares de STS, y una perdida de anclaje que mantiene el embedding proximo al del modelo profesor para no sobrescribir el conocimiento destilado previamente. El checkpoint publicado corresponde al paso 250. El codigo de entrenamiento (`build_segments.py`, `teacher.py`, `distill.py`, `build_ft_data.py`, `mine_hard.py`, `finetune_prophet.py`, `run_mteb.py`) vive en el arbol privado `z-system` y no en el repositorio publico kenga-lang.

## Capacidades

- Generacion de embeddings de frases y parrafos de hasta 512 tokens, con salida de 768 dimensiones normalizada en L2.
- Similitud semantica y deteccion de parafrasis mediante el prefijo `paraphrase` en ambos lados de la comparacion.
- Recuperacion asimetrica consulta-documento con el par de prefijos `search_query` / `search_document`.
- Reranking de resultados de busqueda (evaluado en RuBQReranking y MIRACLReranking).
- Clasificacion por vecinos mas cercanos con prefijos dedicados: `categorize`, `categorize_sentiment` y `categorize_topic`.
- Inferencia de relacion textual (NLI / entailment) con el prefijo `categorize_entailment`, evaluada en TERRa.
- Clustering de documentos y titulares mediante agrupacion de embeddings (Georeview, RuSciBench).
- Cobertura bilingue ruso-ingles; no se declaran otros idiomas.
- Compatibilidad con pipelines que ya usan el protocolo de prefijos de FRIDA / BERTA.
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso: es exclusivamente un encoder.
- No dispone de modo "thinking", capacidades de vision ni procesamiento de audio.

## Casos de uso

- Busqueda semantica y RAG sobre corpus en ruso: el modelo indexa fragmentos de hasta 512 tokens y permite recuperar pasajes relevantes con el par `search_query` / `search_document`. Su tamano de 44,2M hace viable mantener el indice vectorial y el encoder en la misma maquina sin GPU.
- Deduplicacion y deteccion de casi duplicados: comparar embeddings normalizados con producto escalar permite agrupar noticias, titulares o tickets repetidos en grandes volumenes de texto ruso con un coste por documento muy bajo.
- Reranking en un pipeline de recuperacion en dos fases: tras un primer filtro por BM25, el modelo reordena los candidatos; es la tarea donde el modelo obtiene 55,8 de media (64,8 en RuBQReranking), aunque queda por debajo de alternativas mayores.
- Moderacion y filtrado de temas sensibles: con el prefijo `categorize` se puede construir un clasificador kNN para etiquetar contenido inapropiado, aunque en SensitiveTopicsClassification el resultado es bajo (26,4), por lo que exigiria umbrales conservadores y revision humana.
- Clasificacion de resenas y analisis de opinion: `categorize_sentiment` permite clasificar resenas de producto o cine (RuReviews, Kinopoisk) sin entrenar una cabeza supervisada, utiles en cuadros de mando de atencion al cliente.
- Enrutado de intenciones en asistentes conversacionales: con `categorize_topic` se pueden asignar consultas entrantes a escenarios e intenciones predefinidos (evaluado en MassiveIntent y MassiveScenario), como paso previo a un LLM generativo.
- Agrupacion tematica de produccion cientifica: los embeddings sirven para clusterizar articulos por area GRNTI u OECD (RuSciBench) y construir mapas tematicos de un repositorio institucional.
- Busqueda bilingue ruso-ingles: al compartir espacio de embeddings para ambos idiomas, permite recuperar documentos en un idioma a partir de consultas en el otro, con la salvedad de que no hay evaluacion publicada especifica de traduccion cruzada.

## Benchmarks y rendimiento

Resultados oficiales en MTEB(rus, v1.1) con `mteb==2.20.5`, 23 de 23 tareas completadas, segun la model card. Las columnas de referencia provienen de las entregas propias de cada modelo en el leaderboard.

| Tarea | kenga-embed-prophet4 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 46,7 | 55,4 | 54,8 | 41,1 | 41,4 |
| HeadlineClassification | 83,9 | 89,0 | 89,0 | 74,3 | 68,9 |
| InappropriatenessClassification | 60,9 | 86,1 | 74,8 | 60,7 | 59,1 |
| KinopoiskClassification | 61,6 | 73,0 | 67,8 | 52,2 | 50,5 |
| MassiveIntentClassification | 60,2 | 85,3 | 74,0 | 66,1 | 58,0 |
| MassiveScenarioClassification | 71,6 | 90,9 | 84,5 | 70,3 | 62,9 |
| RuReviewsClassification | 69,2 | 76,3 | 72,3 | 60,8 | 60,7 |
| RuSciBenchGRNTIClassification | 62,9 | 74,0 | 69,0 | 63,1 | 52,9 |
| RuSciBenchOECDClassification | 49,1 | 59,9 | 54,8 | 49,2 | 40,8 |
| CEDRClassification | 52,3 | 69,8 | 73,0 | 39,4 | 39,0 |
| SensitiveTopicsClassification | 26,4 | 44,3 | 39,9 | 27,5 | 25,2 |
| GeoreviewClusteringP2P | 46,5 | 73,8 | 73,8 | 66,2 | 59,7 |
| RuSciBenchGRNTIClusteringP2P | 59,1 | 70,5 | 65,0 | 56,4 | 48,1 |
| RuSciBenchOECDClusteringP2P | 51,7 | 58,1 | 55,6 | 48,6 | 41,1 |
| TERRa | 61,8 | 79,6 | 65,7 | 54,0 | 56,3 |
| RuBQReranking | 64,8 | 80,5 | 75,2 | 66,0 | 62,2 |
| MIRACLReranking | 46,8 | 67,5 | 64,3 | 50,5 | 47,7 |
| RiaNewsRetrievalHardNegatives.v2 | 45,6 | 88,9 | 84,5 | 74,5 | 52,3 |
| RuBQRetrieval | 52,0 | 80,6 | 71,0 | 61,1 | 51,7 |
| MIRACLRetrievalHardNegatives.v2 | 41,7 | 74,7 | 65,9 | 46,1 | 42,4 |
| RUParaPhraserSTS | 65,8 | 78,3 | 77,8 | 69,6 | 72,1 |
| RuSTSBenchmarkSTS | 70,6 | 83,6 | 82,2 | 81,0 | 78,5 |
| STS22 | 52,6 | 65,3 | 61,1 | 66,1 | 64,6 |
| *Classification (media)* | 62,9 | 76,7 | 71,2 | 59,8 | 55,0 |
| *MultilabelClassification (media)* | 39,4 | 57,1 | 56,5 | 33,5 | 32,1 |
| *Clustering (media)* | 52,4 | 67,5 | 64,8 | 57,1 | 49,6 |
| *PairClassification (media)* | 61,8 | 79,6 | 65,7 | 54,0 | 56,3 |
| *Reranking (media)* | 55,8 | 74,0 | 69,7 | 58,3 | 54,9 |
| *Retrieval (media)* | 46,4 | 81,4 | 73,8 | 60,6 | 48,8 |
| *STS (media)* | 63,0 | 75,7 | 73,7 | 72,2 | 71,7 |
| **Media sobre tareas** | **56,7** | **74,2** | **69,4** | **58,5** | **53,7** |
| **Media sobre tipos de tarea (leaderboard)** | **54,5** | **73,1** | **67,9** | **56,5** | **52,6** |
| Tareas completadas | 23 | 23 | 23 | 23 | 23 |

## Requisitos de hardware

- VRAM en fp32: aproximadamente 177 MB solo de pesos (dato aportado por la model card); con activaciones y un lote moderado de secuencias de 512 tokens el consumo se mantiene muy por debajo de 1 GB. Cifras de pico exactas: no disponibles.
- VRAM en fp16/bf16: alrededor de 88-90 MB de pesos segun el recuento de parametros; requeriria conversion manual, ya que no se publican pesos de media precision.
- VRAM en int8: del orden de 44 MB de pesos, tambien mediante conversion propia; no hay variantes oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050 en adelante) es suficiente; tambien A100, H100 o L4 si se busca maximizar el throughput por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada e integrada moderna, y tambien en CPU (la model card indica explicitamente que "cpu works too").
- Opciones de despliegue: inferencia directa con PyTorch cargando `modeling_kenga_embed_v2.py` (requiere solo `torch` y `sentencepiece`) y descarga via `huggingface_hub.snapshot_download`. No hay soporte oficial declarado para vLLM, llama.cpp, Ollama, TGI ni Text Embeddings Inference, ni pesos GGUF/ONNX/safetensors publicados.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, principalmente por el checkpoint fp32 de 177 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB(rus v1.1), media por tipo de tarea | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| kenga-embed-prophet4 | 44,2 M | 512 tokens | 54,5 | MIT | HuggingFace, formato PyTorch con codigo de modelado incluido |
| Giga-Embeddings-instruct-480M | 480 M | no disponible | 73,1 | no disponible | HuggingFace (referencia de leaderboard) |
| BERTA-128M | 128 M | no disponible | 67,9 | no disponible | HuggingFace (referencia de leaderboard) |
| USER2-small-34M | 34 M | no disponible | 56,5 | no disponible | HuggingFace (referencia de leaderboard) |
| rubert-tiny-turbo-29M | 29 M | no disponible | 52,6 | no disponible | HuggingFace (referencia de leaderboard) |

Frente a los encoders de su mismo orden de tamano, kenga-embed-prophet4 supera a rubert-tiny-turbo-29M en todas las familias de tareas y queda muy cerca de USER2-small-34M en la media global (54,5 frente a 56,5), con ventaja clara en PairClassification (61,8 frente a 54,0), Clustering y MultilabelClassification, pero con desventaja apreciable en Retrieval (46,4 frente a 60,6) y en STS (63,0 frente a 72,2). Frente a BERTA-128M y Giga-Embeddings-instruct-480M la diferencia es de 13,4 y 18,6 puntos respectivamente en la media por tipo de tarea, con la advertencia de que esos modelos tienen entre 3 y 11 veces mas parametros.

## Limitaciones y advertencias

- Rendimiento claramente inferior a los encoders rusos de referencia: 54,5 de media por tipo de tarea frente a 67,9 de BERTA-128M y 73,1 de Giga-Embeddings-instruct-480M. No es un modelo puntero, sino una opcion economica.
- Recuperacion debil: 46,4 de media en Retrieval, con 41,7 en MIRACLRetrievalHardNegatives.v2 y 45,6 en RiaNewsRetrievalHardNegatives.v2, muy por debajo de USER2-small-34M (60,6 de media) y de BERTA-128M (73,8).
- Mal comportamiento en temas sensibles: SensitiveTopicsClassification obtiene 26,4, apenas por encima del azar en una tarea de deteccion; no es apto por si solo para moderacion automatizada.
- Contexto limitado a 512 tokens con posiciones aprendidas: los documentos largos deben trocearse, lo que puede fragmentar la unidad semantica y degradar la recuperacion.
- Cobertura idiomatica restringida a ruso e ingles; no hay evidencia de buen comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion no aplica en el sentido generativo (el modelo no produce texto), pero si existe riesgo de falsos positivos en similitud: embeddings cercanos no garantizan equivalencia semantica real.
- Advertencia de incoherencia en la documentacion: el titulo de la model card indica `kenga-embed-prophet4` mientras que el cuerpo del texto describe el proceso de entrenamiento como `kenga-embed-prophet2`. Conviene verificar cual es la variante efectivamente publicada antes de citarla.
- El checkpoint corresponde al paso 250; no se documenta si el entrenamiento se completo.
- Distribucion en formato pickle de PyTorch (`pytorch_model.bin`), no en safetensors: la carga implica deserializacion de pickle, con las precauciones de seguridad habituales.
- Requiere codigo propio (`modeling_kenga_embed_v2.py`) y no es compatible de forma nativa con SentenceTransformers ni con servidores de embeddings estandar; la integracion exige importar el modulo incluido en el repositorio.
- Aunque la licencia MIT permite uso comercial sin restricciones declaradas, el modelo se apoya en el arbol de entrenamiento `z-system`, no publicado, y en un modelo previo (`kenga-embed-z2`) cuya licencia no se detalla en la informacion disponible.
- Adopcion practica nula hasta la fecha: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado los resultados de forma independiente.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo; todos los resultados fueron contenido no relacionado de foros de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/kenga-embed-prophet4
- Repositorio del proyecto Kenga: https://github.com/GermannM/kenga-lang
- Documentacion del contrato Prophet: https://github.com/GermannM/kenga-lang/blob/main/docs/PROPHETS.md
- Resultados de referencia del leaderboard MTEB: https://github.com/embeddings-benchmark/results
- Paper o publicacion tecnica especifica del modelo: no disponible
- Demo o espacio interactivo: no disponible
