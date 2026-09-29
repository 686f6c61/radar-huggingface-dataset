# GermannM/kenga-embed-prophet5

## Resumen

kenga-embed-prophet5 es un codificador de frases (sentence encoder) de 44,2 millones de parámetros desarrollado por GermannM dentro del proyecto Kenga. Genera embeddings de 768 dimensiones normalizados en L2 a partir de texto en ruso e inglés, con una ventana de contexto de 512 tokens y un tokenizador SentencePiece de 16k. Su objetivo es cubrir tareas de similitud semántica, recuperación, reranking, clasificación y clustering en ruso, un nicho donde los codificadores pequeños de 30-50M compiten con modelos mucho mayores.

Arquitectónicamente es un transformer bidireccional con atenciones y proyecciones "Z-factored" (proyecciones factorizadas de bajo rango), embeddings de token factorizados y posiciones aprendidas hasta 512. El protocolo de prefijos es el mismo que usan FRIDA y BERTA, de modo que puede sustituir a esos modelos en pipelines existentes sin cambios en la lógica de negocio.

Su relevancia es acotada pero concreta: con 44M de parámetros se sitúa en la liga de USER2-small-34M y rubert-tiny-turbo-29M, y queda muy por debajo de Giga-Embeddings-instruct-480M (57,6 frente a 74,2 en media simple sobre 23 tareas de MTEB(rus, v1.1)). El propio autor lo declara explícitamente: "no supera a Giga". Es, por tanto, una opción de bajo coste computacional para despliegue en CPU o GPUs modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con atencion y proyecciones FF factorizadas (Z-factored), embedding de token factorizado |
| Parametros totales | 44,2 M (44M segun la model card) |
| Longitud de contexto | 512 tokens (posiciones aprendidas hasta 512) |
| Tipos de cuantizacion | No disponible. Solo se publica checkpoint fp32 (177 MB); no hay versiones cuantizadas |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch binario), junto a `config.json`, `kenga_spm.model` y `modeling_kenga_embed_v2.py` |
| Dimension de embedding | 768, normalizado en L2 (similitud coseno = producto escalar) |
| Tokenizador | SentencePiece, vocabulario 16385 (16k) |
| Pooling | Mean pooling |
| Cabeceras (capas) | 8 |
| Cabezas de atencion | 12 |
| Dimension feed-forward | 3072 |
| Prefijos soportados | `search_query`, `search_document`, `paraphrase`, `categorize`, `categorize_sentiment`, `categorize_topic`, `categorize_entailment` |
| Tamano del repositorio | 0,2 GB |
| Paso de checkpoint | 250 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional de 8 capas, d=768, 12 cabezas de atencion y dff=3072. Incorpora dos innovaciones de eficiencia: un embedding de token factorizado (matriz de 16385 x 128 proyectada a 768) y proyecciones "Z-factored" de atencion y feed-forward con rangos de 192 y 512 respectivamente. Esto reduce el numero de parametros efectivos hasta los 44,2M manteniendo la dimension de salida en 768. La salida se obtiene por mean pooling y se normaliza en L2, de modo que la similitud coseno se calcula con un simple producto matricial.

La model card describe la etapa supervisada "Prophet" como un entrenamiento con InfoNCE y negativos duros minados sobre 80.000 pares de recuperacion (estilo RuBQ / MIRACL, incluyendo pares titulo-pasaje de Wikipedia), CoSENT sobre 20.000 pares STS y una loss de anclaje ("anchor loss") que mantiene el embedding cerca del profesor para no sobrescribir el conocimiento destilado. Aviso de rigor: ese parrafo de la model card nombra explicitamente a `kenga-embed-prophet2`, no a `prophet5`, y la informacion disponible no aclara si el procedimiento de la quinta iteracion es identico. El contrato Prophet esta documentado en `docs/PROPHETS.md` del repositorio kenga-lang, pero el codigo de entrenamiento vive en el arbol de laboratorio `z-system` (`embed_v2/`: `build_segments.py`, `teacher.py`, `distill.py`, `build_ft_data.py`, `mine_hard.py`, `finetune_prophet.py`, `run_mteb.py`), que no es publico.

## Capacidades

- Generacion de embeddings de frases y pasajes de 768 dimensiones, normalizados en L2, listos para indexacion vectorial.
- Recuperacion semantica (retrieval) con protocolo de prefijos asimetrico `search_query` / `search_document`.
- Reranking de resultados de recuperacion: obtiene 66,0 en RuBQReranking y 47,7 en MIRACLReranking.
- Similitud semantica textual (STS) y deteccion de parafrasis mediante el prefijo `paraphrase`: 72,6 en RuSTSBenchmarkSTS y 66,6 en RUParaPhraserSTS.
- Clasificacion de textos como tarea de embeddings congelados: 84,6 en HeadlineClassification, 69,9 en RuReviewsClassification, 62,2 en KinopoiskClassification.
- Inferencia de relacion textual (NLI / entailment) con `categorize_entailment`: 61,7 en TERRa.
- Clustering de pasajes a pasaje: 59,6 en RuSciBenchGRNTIClusteringP2P.
- Clasificacion multietiqueta (multilabel): media de 41,6, con un punto debil claro en SensitiveTopicsClassification (28,6).
- Soporte de ruso e ingles. La model card declara ambos idiomas, pero los unicos benchmarks publicados son de MTEB(rus).
- No genera texto: es exclusivamente un encoder. No tiene tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Busqueda semantica y RAG sobre corpus en ruso: se indexan los pasajes con prefijo `search_document` y las consultas con `search_query`; los vectores de 768 dimensiones normalizados en L2 permiten usar FAISS o pgvector directamente sin postprocesado.
- Reranking en pipelines de recuperacion de dos etapas: tras un primer filtro con BM25, el modelo reordena los candidatos calculando similitud coseno; su 66,0 en RuBQReranking lo hace util como segunda etapa barata en lugar de un cross-encoder grande.
- Enrutamiento de intenciones en asistentes conversacionales en ruso: con embeddings y un clasificador ligero encima alcanza 61,9 en MassiveIntentClassification y 72,8 en MassiveScenarioClassification, suficiente para desambiguar flujos de dialogo simples.
- Deduplicacion y agrupacion de noticias o tickets: el clustering de pasajes (59,6 en RuSciBenchGRNTIClusteringP2P) permite agrupar documentos similares con HDBSCAN o k-means sobre las representaciones.
- Moderacion y triaje de contenido: aunque su rendimiento en SensitiveTopicsClassification es bajo (28,6), puede usarse como filtro de primera pasada si se combina con un clasificador supervisado especifico del dominio.
- Analisis de opiniones y resenas: con el prefijo `categorize_sentiment` obtiene 69,9 en RuReviewsClassification y 62,2 en KinopoiskClassification, adecuado para agregar sentimiento sobre grandes volumenes de texto en lote.
- Deteccion de parafrasis y similitud de titulares: con el prefijo `paraphrase` en ambos lados se obtiene 66,6 en RUParaPhraserSTS, util para agrupar titulares duplicados o detectar reescrituras.
- Sistemas de recomendacion de contenido basados en similitud textual: los embeddings sirven como features de contenido en un modelo de ranking, sin necesidad de entrenar un encoder propio.

## Benchmarks y rendimiento

Resultados oficiales de MTEB(rus, v1.1), ejecutados con `mteb==2.20.5`, todos los splits y subconjuntos, sin omitir ni reponderar tareas. 23/23 tareas completadas. Las columnas de referencia provienen de las entregas de cada modelo al leaderboard (`embeddings-benchmark/results`).

| Tarea | kenga-embed-prophet5 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 46,8 | 55,4 | 54,8 | 41,1 | 41,4 |
| HeadlineClassification | 84,6 | 89,0 | 89,0 | 74,3 | 68,9 |
| InappropriatenessClassification | 61,3 | 86,1 | 74,8 | 60,7 | 59,1 |
| KinopoiskClassification | 62,2 | 73,0 | 67,8 | 52,2 | 50,5 |
| MassiveIntentClassification | 61,9 | 85,3 | 74,0 | 66,1 | 58,0 |
| MassiveScenarioClassification | 72,8 | 90,9 | 84,5 | 70,3 | 62,9 |
| RuReviewsClassification | 69,9 | 76,3 | 72,3 | 60,8 | 60,7 |
| RuSciBenchGRNTIClassification | 62,9 | 74,0 | 69,0 | 63,1 | 52,9 |
| RuSciBenchOECDClassification | 49,4 | 59,9 | 54,8 | 49,2 | 40,8 |
| CEDRClassification | 54,6 | 69,8 | 73,0 | 39,4 | 39,0 |
| SensitiveTopicsClassification | 28,6 | 44,3 | 39,9 | 27,5 | 25,2 |
| GeoreviewClusteringP2P | 46,8 | 73,8 | 73,8 | 66,2 | 59,7 |
| RuSciBenchGRNTIClusteringP2P | 59,6 | 70,5 | 65,0 | 56,4 | 48,1 |
| RuSciBenchOECDClusteringP2P | 51,9 | 58,1 | 55,6 | 48,6 | 41,1 |
| TERRa | 61,7 | 79,6 | 65,7 | 54,0 | 56,3 |
| RuBQReranking | 66,0 | 80,5 | 75,2 | 66,0 | 62,2 |
| MIRACLReranking | 47,7 | 67,5 | 64,3 | 50,5 | 47,7 |
| RiaNewsRetrievalHardNegatives.v2 | 47,1 | 88,9 | 84,5 | 74,5 | 52,3 |
| RuBQRetrieval | 54,3 | 80,6 | 71,0 | 61,1 | 51,7 |
| MIRACLRetrievalHardNegatives.v2 | 43,2 | 74,7 | 65,9 | 46,1 | 42,4 |
| RUParaPhraserSTS | 66,6 | 78,3 | 77,8 | 69,6 | 72,1 |
| RuSTSBenchmarkSTS | 72,6 | 83,6 | 82,2 | 81,0 | 78,5 |
| STS22 | 52,1 | 65,3 | 61,1 | 66,1 | 64,6 |

Medias agregadas:

| Agregado | kenga-embed-prophet5 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| Classification (media) | 63,6 | 76,7 | 71,2 | 59,8 | 55,0 |
| MultilabelClassification (media) | 41,6 | 57,1 | 56,5 | 33,5 | 32,1 |
| Clustering (media) | 52,8 | 67,5 | 64,8 | 57,1 | 49,6 |
| PairClassification (media) | 61,7 | 79,6 | 65,7 | 54,0 | 56,3 |
| Reranking (media) | 56,9 | 74,0 | 69,7 | 58,3 | 54,9 |
| Retrieval (media) | 48,2 | 81,4 | 73,8 | 60,6 | 48,8 |
| STS (media) | 63,8 | 75,7 | 73,7 | 72,2 | 71,7 |
| Media sobre tareas | 57,6 | 74,2 | 69,4 | 58,5 | 53,7 |
| Media sobre tipos de tarea (leaderboard) | 55,5 | 73,1 | 67,9 | 56,5 | 52,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los pesos (177 MB) mas activaciones y overhead de framework. En fp16 el checkpoint ocuparia aproximadamente 88 MB. Es un modelo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090). No necesita A100, H100 ni L40S; usarlas seria desaprovechar recursos.
- Inferencia en CPU: viable y probablemente el escenario principal, dado el tamano. La model card indica que `device="cuda"` funciona y que `cpu` tambien.
- Opciones de despliegue: el modelo requiere cargar codigo propio (`modeling_kenga_embed_v2.py` en el repositorio, con dependencias solo de torch y sentencepiece) mediante `KengaEmbedV2HF.from_pretrained(...)`. No hay soporte documentado para vLLM, TGI, Ollama, llama.cpp, Text Embeddings Inference ni sentence-transformers estandar, porque la arquitectura Z-factored no forma parte de ninguna libreria publica.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de embeddings por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB(rus) media sobre tareas | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| kenga-embed-prophet5 | 44,2 M | 512 tokens | 57,6 | MIT | HuggingFace, requiere codigo propio |
| Giga-Embeddings-instruct-480M | 480 M | no disponible | 74,2 | no disponible | HuggingFace |
| BERTA-128M | 128 M | no disponible | 69,4 | no disponible | HuggingFace |
| USER2-small-34M | 34 M | no disponible | 58,5 | no disponible | HuggingFace |
| rubert-tiny-turbo-29M | 29 M | no disponible | 53,7 | no disponible | HuggingFace |

Lectura de la comparativa: kenga-embed-prophet5 queda 0,9 puntos por debajo de USER2-small-34M con un 30 % mas de parametros, y 3,9 puntos por encima de rubert-tiny-turbo-29M. Frente a Giga-Embeddings-instruct-480M la diferencia es de 16,6 puntos a favor del modelo grande, que multiplica por diez el numero de parametros. La ventaja competitiva del modelo no es la calidad absoluta, sino la licencia MIT explicita y el coste de inferencia minimo.

## Limitaciones y advertencias

- No supera a Giga-Embeddings-instruct-480M en ninguna de las medias por tipo de tarea. La propia model card lo afirma de forma explicita.
- Debilidad marcada en clasificacion multietiqueta (41,6 de media) y, en particular, en SensitiveTopicsClassification (28,6), donde queda por debajo de BERTA-128M y de Giga.
- Recuperacion como punto flojo: media de 48,2, con 43,2 en MIRACLRetrievalHardNegatives.v2 y 47,1 en RiaNewsRetrievalHardNegatives.v2. No es adecuado como recuperador principal en dominios con negativos dificiles.
- Contexto limitado a 512 tokens: no admite documentos largos sin troceado previo. Cualquier caso de uso sobre articulos completos exige segmentacion y agregacion de vectores.
- Aunque declara soporte de ingles, no hay ningun benchmark en ingles publicado. El rendimiento real en ingles es desconocido.
- Ambiguedad documental: el parrafo de entrenamiento de la model card describe `kenga-embed-prophet2`, no `prophet5`, y el codigo de entrenamiento no es publico. La reproducibilidad del procedimiento exacto no esta garantizada.
- Integracion no estandar: al no ser compatible con sentence-transformers, TEI, vLLM ni llama.cpp, requiere cargar codigo Python propio en produccion, con el coste de mantenimiento que eso implica.
- El checkpoint publicado esta en el paso 250. No se documenta si existe una version posterior ni que criterio de seleccion se aplico.
- Sin versiones cuantizadas publicadas. Si se necesita int8 o int4, hay que generarlas y validar la perdida de calidad por cuenta propia.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes. No hay evidencia de uso en produccion por terceros.
- Sesgos: no se documenta analisis de sesgo. Los datos de entrenamiento citados (RuBQ, MIRACL, Wikipedia) pueden introducir sesgos de dominio y de cobertura geografica o tematica.
- Riesgo de recuperacion irrelevante: al ser un encoder y no un generador, no alucina texto, pero si puede devolver pasajes semanticamente proximos y facticamente incorrectos, lo que en un pipeline RAG se propaga como alucinacion del generador.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones conocidas, siempre que se conserve el aviso de copyright.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/kenga-embed-prophet5
- Repositorio del proyecto kenga-lang (contrato Prophet en `docs/PROPHETS.md`): https://github.com/GermannM/kenga-lang
- Repositorio kenga-lang (espejo encontrado en la busqueda): https://github.com/GermannM3/kenga-lang/tree/main/
- Resultados de referencia del leaderboard MTEB: https://github.com/embeddings-benchmark/results
- Modelo relacionado kenga-embed-prophet-instruct: https://huggingface.co/GermannM/kenga-embed-prophet-instruct
- Modelo relacionado kenga-prophet: https://huggingface.co/GermannM/kenga-prophet
- Ficha de Kenga (modelo decoder de 1.5B, 32K de contexto): https://featherless.ai/models/GermannM/Kenga
- Registro de kenga-embed-prophet-instruct en free2aitools: https://free2aitools.com/model/germannm/kenga-embed-prophet-instruct
