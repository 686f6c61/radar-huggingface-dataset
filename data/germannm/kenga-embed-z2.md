# GermannM/kenga-embed-z2

## Resumen

kenga-embed-z2 es un codificador de frases (sentence encoder) bilingue ruso/ingles de 44,2 millones de parametros desarrollado por el autor GermannM dentro del proyecto Kenga. Su funcion es producir embeddings de 768 dimensiones normalizados en L2 para similitud semantica, recuperacion de informacion (retrieval), clustering, clasificacion, reranking y deteccion de parafrasis. La arquitectura es un transformer bidireccional con factorizacion Z en las proyecciones de atencion y feed-forward, tokenizador SentencePiece de 16k y pooling por media, con una ventana de contexto de 512 tokens. El protocolo de prefijos es el mismo que usan FRIDA y BERTA, de modo que puede sustituir a esos modelos en pipelines ya existentes sin modificar el preprocesado.

El modelo es la etapa final de destilacion de un pipeline propio: 30.000 pasos de destilacion coseno mas KL relacional desde sergeyzh/BERTA (128M, a su vez destilado de FRIDA) sobre 1,23 millones de segmentos en ruso e ingles (Wikipedia, dialogos, resenas, titulares e intenciones) con prefijos estilo FRIDA y sin uso de etiquetas. El autor publica los resultados completos de MTEB(rus, v1.1) sobre las 23 tareas del benchmark, ejecutadas con mteb==2.20.5.

Es relevante ahora porque compite en el segmento de codificadores rusos de 30-40M (USER2-small-34M, rubert-tiny-turbo-29M), es decir, modelos pensados para inferencia barata, en CPU o GPU de gama baja. El propio autor es explicito: no supera a Giga-Embeddings-instruct-480M (52,2 frente a 74,2 de media simple en las 23 tareas) y queda ligeramente por debajo de USER2-small-34M (58,5). Su interes no es el estado del arte, sino la eficiencia en entornos con recursos limitados y la compatibilidad de prefijos con la familia FRIDA/BERTA. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con factorizacion Z en proyecciones de atencion y feed-forward |
| Parametros totales | 44,2 millones (44M segun la model card) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (posiciones aprendidas hasta 512) |
| Tipos de cuantizacion | No disponible. Solo se publica checkpoint fp32 (177 MB); no se documentan versiones cuantizadas, GGUF ni ONNX |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch binario (`pytorch_model.bin`), junto con `config.json`, `kenga_spm.model` y `modeling_kenga_embed_v2.py` |

Datos adicionales de dimensionamiento: d=768, 8 capas, 12 cabezas, dff=3072, embedding de tokens factorizado (16385 x 128 -> 768), proyecciones Z-factored con rangos 192/512, salida de 768 dimensiones normalizada en L2, tokenizador SentencePiece de 16.000 vocabulario, checkpoint del paso 29.000 y tamano de repositorio de 0,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer bidireccional de 8 capas y 12 cabezas con dimension oculta 768 y dimension de feed-forward 3072. Dos elementos la diferencian de un encoder BERT estandar: el embedding de tokens esta factorizado (16385 x 128 -> 768) y las proyecciones de atencion y feed-forward estan factorizadas en el denominado esquema Z, con rangos de 192 y 512. Las posiciones son aprendidas hasta un maximo de 512 tokens. El pooling es por media sobre la secuencia y la salida se normaliza en L2, por lo que el producto escalar entre embeddings equivale directamente al coseno. La model card no detalla en que consiste exactamente la factorizacion Z mas alla de los rangos mencionados, por lo que ese punto se considera no disponible.

El entrenamiento es una destilacion de 30.000 pasos desde sergeyzh/BERTA (128M, destilado a su vez de FRIDA), combinando una perdida coseno con una KL relacional, sobre 1,23 millones de segmentos ruso/ingles procedentes de Wikipedia, dialogos, resenas, titulares e intenciones, con prefijos estilo FRIDA. No se usaron etiquetas en ningun momento. Las capas con factorizacion Z siguen un curriculo de rango: durante el entrenamiento se activa el 25%, luego el 50% y finalmente el 100% del rango final. El pipeline de entrenamiento (build_segments.py, teacher.py, distill.py, build_ft_data.py, mine_hard.py, finetune_prophet.py, run_mteb.py) vive en el arbol de laboratorio z-system del autor y no esta publicado en el repositorio kenga-lang; la receta y el contrato Prophet si estan documentados en docs/PROPHETS.md.

## Capacidades

- Generacion de embeddings de frases para similitud semantica, con salida de 768 dimensiones normalizada en L2 (coseno directo mediante producto escalar).
- Retrieval query-document mediante el protocolo de prefijos `search_query` y `search_document`.
- Deteccion de parafrasis y STS con el prefijo `paraphrase` aplicado a ambos lados.
- Clasificacion y clustering de textos con los prefijos `categorize`, `categorize_sentiment` y `categorize_topic`.
- Inferencia de relacion textual (NLI / entailment) con el prefijo `categorize_entailment`, evaluada en la tarea TERRa.
- Reranking de resultados de busqueda (evaluado en RuBQReranking y MIRACLReranking).
- Soporte bilingue ruso/ingles en el mismo espacio de embeddings.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es exclusivamente un encoder de representaciones.
- Ejecucion en CPU y GPU indistintamente, al ser un modelo de 44,2M de parametros.
- Integracion directa en pipelines existentes de FRIDA/BERTA gracias a que el protocolo de prefijos es el mismo.

## Casos de uso

- Busqueda semantica en corpus rusos de tamano medio: el modelo indexa documentos con el prefijo `search_document` y consultas con `search_query`, generando vectores de 768 dimensiones listos para una base vectorial. Es adecuado cuando el coste de inferencia importa mas que la precision maxima, aunque sus resultados de retrieval son su punto mas debil (media de 34,8 en las tareas de retrieval de MTEB rus).
- Deduplicacion de resenas y contenido de usuario: los embeddings permiten agrupar textos equivalentes o casi equivalentes con una distancia coseno umbral. Su rendimiento en clustering ruso (50,1 de media, con 42,7 en GeoreviewClusteringP2P y 58,1 en RuSciBenchGRNTIClusteringP2P) es razonable para un modelo de 44M.
- Clasificacion de intenciones en asistentes conversacionales en ruso: las tareas MassiveIntentClassification (55,1) y MassiveScenarioClassification (65,3) indican que el modelo puede servir como extractor de features para un clasificador ligero aguas abajo, con prefijo `categorize`.
- Moderacion de contenido y clasificacion de sensibilidad: con el prefijo `categorize` o `categorize_sentiment` puede alimentar un clasificador de inapropiado o de temas sensibles. Advertencia: sus puntuaciones en SensitiveTopicsClassification (23,7) e InappropriatenessClassification (59,8) son bajas en terminos absolutos, por lo que no deberia usarse como unico filtro en produccion.
- Reranking de resultados de un buscador existente: dado un conjunto de candidatos recuperados por un motor lexico (por ejemplo BM25), el modelo reordena con el prefijo `paraphrase` o `search_query`/`search_document`. Sus medias de reranking (51,1) lo sitúan por debajo de alternativas mayores, pero es viable en despliegues con CPU.
- Deteccion de parafrasis y similitud textual en analitica de contenidos: con RUParaPhraserSTS en 57,8 y RuSTSBenchmarkSTS en 65,1, sirve para agrupar titulares duplicados, comparar versiones de documentos o detectar plagio aproximado en ruso.
- Despliegue en el borde o en entornos sin GPU: al ser un modelo de 44,2M de parametros con checkpoint fp32 de 177 MB, cabe en dispositivos con memoria muy limitada y puede ejecutarse en CPU para procesamiento por lotes nocturno.
- Sustitucion directa en pipelines ya basados en FRIDA/BERTA: como el protocolo de prefijos es identico, se puede cambiar el modelo sin reescribir el preprocesado, lo que reduce el coste de migracion para equipos que ya usan esa familia.
- Filtrado previo en un RAG bilingue ruso/ingles: el codificador puede actuar como primera etapa de recuperacion barata antes de un reranker o un modelo generativo mayor, aprovechando el mismo espacio vectorial para ambos idiomas.

## Benchmarks y rendimiento

Resultados publicados por el autor en MTEB(rus, v1.1), ejecutados con mteb==2.20.5, 23 de 23 tareas completadas, sin omisiones ni reponderaciones. Las columnas de referencia corresponden a las entregas propias de cada modelo en el leaderboard (embeddings-benchmark/results). Todos los valores son puntuaciones de la metrica principal de cada tarea.

| Tarea | kenga-embed-z2 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 44,4 | 55,4 | 54,8 | 41,1 | 41,4 |
| HeadlineClassification | 81,0 | 89,0 | 89,0 | 74,3 | 68,9 |
| InappropriatenessClassification | 59,8 | 86,1 | 74,8 | 60,7 | 59,1 |
| KinopoiskClassification | 60,6 | 73,0 | 67,8 | 52,2 | 50,5 |
| MassiveIntentClassification | 55,1 | 85,3 | 74,0 | 66,1 | 58,0 |
| MassiveScenarioClassification | 65,3 | 90,9 | 84,5 | 70,3 | 62,9 |
| RuReviewsClassification | 67,2 | 76,3 | 72,3 | 60,8 | 60,7 |
| RuSciBenchGRNTIClassification | 60,0 | 74,0 | 69,0 | 63,1 | 52,9 |
| RuSciBenchOECDClassification | 46,3 | 59,9 | 54,8 | 49,2 | 40,8 |
| CEDRClassification | 47,6 | 69,8 | 73,0 | 39,4 | 39,0 |
| SensitiveTopicsClassification | 23,7 | 44,3 | 39,9 | 27,5 | 25,2 |
| GeoreviewClusteringP2P | 42,7 | 73,8 | 73,8 | 66,2 | 59,7 |
| RuSciBenchGRNTIClusteringP2P | 58,1 | 70,5 | 65,0 | 56,4 | 48,1 |
| RuSciBenchOECDClusteringP2P | 49,5 | 58,1 | 55,6 | 48,6 | 41,1 |
| TERRa | 55,0 | 79,6 | 65,7 | 54,0 | 56,3 |
| RuBQReranking | 60,7 | 80,5 | 75,2 | 66,0 | 62,2 |
| MIRACLReranking | 41,5 | 67,5 | 64,3 | 50,5 | 47,7 |
| RiaNewsRetrievalHardNegatives.v2 | 34,6 | 88,9 | 84,5 | 74,5 | 52,3 |
| RuBQRetrieval | 38,1 | 80,6 | 71,0 | 61,1 | 51,7 |
| MIRACLRetrievalHardNegatives.v2 | 31,8 | 74,7 | 65,9 | 46,1 | 42,4 |
| RUParaPhraserSTS | 57,8 | 78,3 | 77,8 | 69,6 | 72,1 |
| RuSTSBenchmarkSTS | 65,1 | 83,6 | 82,2 | 81,0 | 78,5 |
| STS22 | 55,3 | 65,3 | 61,1 | 66,1 | 64,6 |
| *Classification (media)* | 60,0 | 76,7 | 71,2 | 59,8 | 55,0 |
| *MultilabelClassification (media)* | 35,6 | 57,1 | 56,5 | 33,5 | 32,1 |
| *Clustering (media)* | 50,1 | 67,5 | 64,8 | 57,1 | 49,6 |
| *PairClassification (media)* | 55,0 | 79,6 | 65,7 | 54,0 | 56,3 |
| *Reranking (media)* | 51,1 | 74,0 | 69,7 | 58,3 | 54,9 |
| *Retrieval (media)* | 34,8 | 81,4 | 73,8 | 60,6 | 48,8 |
| *STS (media)* | 59,4 | 75,7 | 73,7 | 72,2 | 71,7 |
| **Media sobre tareas** | **52,2** | **74,2** | **69,4** | **58,5** | **53,7** |
| **Media sobre tipos de tarea (leaderboard)** | **49,4** | **73,1** | **67,9** | **56,5** | **52,6** |
| Tareas completadas | 23 | 23 | 23 | 23 | 23 |

Los archivos de resultados en bruto se encuentran en `mteb_results/` del arbol de entrenamiento, no en el repositorio publico de HuggingFace. No hay datos publicados de latencia, throughput ni consumo de memoria en la model card.

## Requisitos de hardware

- Peso del checkpoint: 177 MB en fp32. Las estimaciones en otras precisiones derivadas del numero de parametros serian aproximadamente 88 MB en fp16/bf16 y 44 MB en int8, pero no hay versiones oficiales publicadas en esos formatos.
- VRAM estimada para inferencia: por debajo de 1 GB en fp32 incluyendo activaciones para lotes pequenos y contexto de 512 tokens. Es una estimacion derivada del tamano del modelo, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de memoria, por ejemplo GTX 1650, RTX 3060, RTX 4090. No requiere A100, H100 ni GPU de centro de datos.
- CPU: la inferencia en CPU es viable dado el tamano del modelo; el autor indica explicitamente que `device="cuda"` o CPU funcionan.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: el modelo requiere el codigo propio `modeling_kenga_embed_v2.py` (solo depende de torch y sentencepiece) y no se integra de forma nativa con sentence-transformers. No se han publicado pesos GGUF ni ONNX, por lo que llama.cpp, Ollama, vLLM y TGI no son aplicables en su estado actual; vLLM y TGI estan ademas orientados a modelos generativos, no a encoders de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparativa se limita a los modelos de referencia que el propio autor incluye en su tabla de MTEB(rus, v1.1). Los datos de parametros, contexto y licencia de los modelos de referencia no se detallan en la informacion disponible salvo los 128M de BERTA y los 480M de Giga-Embeddings-instruct-480M.

| Modelo | Parametros | Contexto | Media sobre tareas (MTEB rus) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kenga-embed-z2 | 44,2M | 512 tokens | 52,2 | MIT | HuggingFace, requiere codigo propio |
| Giga-Embeddings-instruct-480M | 480M (segun denominacion) | No disponible | 74,2 | No disponible | HuggingFace |
| BERTA-128M | 128M | No disponible | 69,4 | No disponible | HuggingFace (sergeyzh/BERTA) |
| USER2-small-34M | 34M | No disponible | 58,5 | No disponible | HuggingFace |
| rubert-tiny-turbo-29M | 29M | No disponible | 53,7 | No disponible | HuggingFace |

Diferencias clave segun los datos publicados: kenga-embed-z2 es aproximadamente diez veces mas pequeno que Giga-Embeddings-instruct-480M y queda 21,9 puntos por debajo en la media simple de las 23 tareas. Frente a USER2-small-34M, que tiene menos parametros pero puntua 6,3 puntos mas de media, kenga-embed-z2 no gana en eficiencia por parametro. Solo supera ligeramente a rubert-tiny-turbo-29M (52,2 frente a 53,7, es decir, esta 1,5 puntos por debajo). La ventaja diferencial del modelo es la compatibilidad del protocolo de prefijos con FRIDA/BERTA y una licencia MIT explicita, frente a licencias no declaradas aqui para los modelos de referencia.

## Limitaciones y advertencias

- Rendimiento bajo en recuperacion de informacion: medias de 34,8 en retrieval, con casos concretos de 31,8 en MIRACLRetrievalHardNegatives.v2, 34,6 en RiaNewsRetrievalHardNegatives.v2 y 38,1 en RuBQRetrieval. El autor senala explicitamente que el modelo no supera a Giga-Embeddings-instruct-480M y que esta por debajo de USER2-small-34M en la media global.
- Clasificacion de temas sensibles muy debil: 23,7 en SensitiveTopicsClassification, el resultado mas bajo de la tabla. No es adecuado como unico mecanismo de moderacion.
- Destilacion sin etiquetas: la model card indica que no se usaron etiquetas en el entrenamiento, lo que limita la calibracion en tareas de clasificacion especificas y transfiere los sesgos del profesor (BERTA, a su vez destilado de FRIDA) al modelo final.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es la produccion de embeddings poco discriminativos en dominios alejados de los datos de entrenamiento (Wikipedia, dialogos, resenas, titulares, intenciones), lo que puede provocar falsos positivos en busqueda y deduplicacion.
- Limitacion de contexto: 512 tokens obligan a trocear documentos largos, con la consiguiente perdida de coherencia global en retrieval y clustering sobre textos extensos.
- Limitacion de idioma: solo ruso e ingles. El rendimiento fuera de esos dos idiomas no esta evaluado y no deberia asumirse.
- Integracion no estandar: no funciona con sentence-transformers de forma nativa y requiere importar `modeling_kenga_embed_v2.py`, lo que implica ejecutar codigo Python del autor del modelo. Es un riesgo de cadena de suministro a tener en cuenta en produccion.
- Formato de pesos: el checkpoint se distribuye como `pytorch_model.bin` (serializacion binaria de PyTorch) y no como safetensors, lo que anade el riesgo habitual de deserializacion. No hay pesos cuantizados ni GGUF.
- Reproducibilidad parcial: el codigo de entrenamiento no esta en el repositorio publico kenga-lang, sino en un arbol de laboratorio interno (z-system). La receta esta documentada en docs/PROPHETS.md, pero no es ejecutable a partir de lo publicado.
- Adopcion nula: 0 descargas y 0 valoraciones en el momento de redactar la ficha, sin validacion independiente de los resultados de MTEB publicados por el propio autor.
- Licencia: MIT, lo que permite uso comercial sin restricciones declaradas, pero conviene verificar la licencia del modelo profesor (BERTA/FRIDA) si se redistribuyen derivados, ya que ese dato no figura en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/kenga-embed-z2
- Repositorio del proyecto Kenga: https://github.com/GermannM/kenga-lang
- Documentacion de la receta de entrenamiento y contrato Prophet: https://github.com/GermannM/kenga-lang/blob/main/docs/PROPHETS.md
- Modelo profesor (BERTA, 128M): https://huggingface.co/sergeyzh/BERTA
- Resultados de referencia del leaderboard: https://github.com/embeddings-benchmark/results
- No se han encontrado otros enlaces relevantes sobre este modelo en la busqueda web realizada; los resultados devueltos correspondian a contenido sin relacion con el modelo.
