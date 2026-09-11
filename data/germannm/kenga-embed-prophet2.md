# GermannM/kenga-embed-prophet2

## Resumen

kenga-embed-prophet2 es un codificador de frases (sentence encoder) bilingüe ruso/inglés de 44,2 millones de parámetros desarrollado por GermannM dentro del proyecto Kenga. No es un modelo generativo: su función es convertir texto en vectores densos de 768 dimensiones normalizados en L2, pensados para búsqueda semántica, similitud de frases, reranking y clasificación por embeddings. Su relevancia actual está en el nicho de los codificadores rusos compactos, donde compite directamente con alternativas de 29M a 34M de parámetros (USER2-small, rubert-tiny-turbo) y no con modelos de 480M como Giga-Embeddings.

Técnicamente es un transformer bidireccional con factorización Z en las proyecciones de atención y feed-forward, vocabulario SentencePiece de 16k, pooling por media y una ventana de contexto de 512 tokens con posiciones aprendidas. La arquitectura y el protocolo de prefijos (estilo FRIDA/BERTA) permiten sustituir codificadores previos en pipelines existentes sin rediseñar la infraestructura: basta con anteponer el prefijo correcto (`search_query`, `search_document`, `paraphrase`, `categorize`, etc.) al texto.

El modelo se publica bajo licencia MIT, con pesos en formato PyTorch binario y código de modelado autocontenido (solo requiere `torch` y `sentencepiece`). Es un modelo recién publicado y con adopción nula en el momento de redactar esta ficha (0 descargas, 0 likes), lo que implica que no existe aún validación independiente más allá de los resultados de MTEB(rus, v1.1) reportados por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder) con factorizacion Z en proyecciones de atencion y feed-forward |
| Parametros totales | 44,2 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (posiciones aprendidas hasta 512) |
| Tipos de cuantizacion | No disponible (solo checkpoint fp32; no se publican variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | Ruso (ru) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch, fp32, 177 MB) + `config.json`, `kenga_spm.model` y `modeling_kenga_embed_v2.py` |
| Dimension de embedding | 768 (normalizado en L2) |
| Pooling | Media (mean pooling) |
| Tokenizador | SentencePiece, vocabulario de 16.385 (16k + especiales) |
| Capas / cabezas / dff | 8 / 12 / 3.072 |
| Tamano del repositorio | 0,2 GB |
| Libreria | PyTorch |
| Pipeline (HuggingFace) | sentence-similarity |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de 8 capas, 12 cabezas de atención y dimensión oculta de 768, con dff de 3.072. Dos elementos la diferencian de un BERT estándar: por un lado, el embedding de tokens está factorizado (16385 x 128 -> 768); por otro, las proyecciones de atención y feed-forward se descomponen con factorización Z de rango 192 y 512 respectivamente, una técnica de reducción de parámetros que permite mantener 44,2 M de parámetros totales con un checkpoint fp32 de 177 MB. Las posiciones son aprendidas y la salida se obtiene mediante mean pooling seguida de normalización L2, con lo que la similitud coseno se reduce a un producto escalar.

El entrenamiento tiene dos fases identificables. La primera es una destilación desde kenga-embed-z2 (el modelo base de la familia). Sobre esa base se aplica la fase "Prophet": una etapa supervisada que combina InfoNCE con negativos duros minados sobre 80.000 pares de recuperación (estilo RuBQ / MIRACL: QA y pares título-pasaje de Wikipedia), CoSENT sobre 20.000 pares de STS, y una pérdida de anclaje que mantiene el embedding cerca del profesor para no destruir el conocimiento destilado. El checkpoint publicado corresponde al paso 1.000. El código de entrenamiento (`build_segments.py`, `teacher.py`, `distill.py`, `build_ft_data.py`, `mine_hard.py`, `finetune_prophet.py`, `run_mteb.py`) vive en el árbol privado `z-system` y no en el repositorio público de kenga-lang; lo que sí está documentado es el contrato de la fase Prophet en `docs/PROPHETS.md`.

## Capacidades

- Generacion de embeddings de frases y pasajes: vectores de 768 dimensiones normalizados en L2, listos para similitud coseno.
- Recuperacion semantica (retrieval) bilingue ruso/ingles mediante los prefijos `search_query` y `search_document`.
- Similitud semantica textual (STS) y deteccion de parafrasis con el prefijo `paraphrase` aplicado a ambos lados.
- Reranking de candidatos recuperados previamente por un sistema lexico o vectorial.
- Clasificacion de textos por embeddings (sentimiento, tema, intencion) con los prefijos `categorize`, `categorize_sentiment` y `categorize_topic`.
- Clustering de documentos y agrupacion tematica (tareas P2P del benchmark MTEB ruso).
- Inferencia de relacion textual / entailment (NLI) mediante `categorize_entailment`, evaluada en la tarea TERRa.
- Multilingue limitado a ruso e ingles; no hay soporte declarado de otras lenguas.
- No soporta generacion de texto, tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un encoder, no un modelo causal.

## Casos de uso

- Busqueda semantica sobre corpus en ruso (RAG): indexar pasajes con `search_document` y consultar con `search_query`; el modelo devuelve vectores normalizados que se pueden almacenar en FAISS, Qdrant o pgvector y comparar por producto escalar. Es adecuado cuando el presupuesto de computo es minimo, aunque su media de recuperacion en MTEB ruso (33,7) es notablemente inferior a la de modelos mayores.
- Deduplicacion ynear-duplicate detection: agrupar articulos, entradas de FAQ o registros de un CRM calculando la similitud coseno entre embeddings; con un umbral calibrado por dominio se detectan duplicados casi exactos con coste de CPU.
- Clasificacion de resenas y feedback de producto: entrenar un clasificador lineal (regresion logistica o SVM) sobre los embeddings con el prefijo `categorize_sentiment`; sus 66,7 puntos en RuReviewsClassification y 59,6 en KinopoiskClassification lo sitúan como opcion valida para prototipos y sistemas de bajo coste.
- Enrutamiento de intenciones en asistentes conversacionales: usar `categorize` para asignar cada turno del usuario a una intencion antes de derivarlo a un LLM generativo, reduciendo el coste por consulta; sus 54,2 puntos en MassiveIntentClassification y 64,0 en MassiveScenarioClassification son suficientes para enrutado grueso, no para clasificacion fina.
- Reranking de resultados de un buscador lexico: recuperar 50-100 candidatos con BM25 y reordenarlos por similitud coseno con el prefijo de consulta; el modelo es rapido, pero conviene tener en cuenta que su media de reranking (47,3) esta lejos de los 74,0 de Giga-Embeddings-instruct-480M.
- Deteccion de parafrasis y control de plagio: comparar pares de frases con `paraphrase` en ambos lados; sus 70,0 puntos en RuSTSBenchmarkSTS son el punto mas fuerte del modelo y lo hacen apto para verificacion de similitud en corpus rusos.
- Agrupacion tematica de noticias y documentos cientificos: clustering P2P sobre titulares (RiaNews) o resumenes academicos (RuSciBench GRNTI/OECD) para construir paneles de tendencias; sus medias de clustering (48,8) exigen validar la calidad de los grupos antes de produccion.
- Despliegue en entornos con recursos muy limitados: al ser un modelo de 44,2 M de parametros y 177 MB en fp32, se puede ejecutar en CPU o en GPUs integradas para tareas de indexacion por lotes nocturnos sin depender de aceleradores dedicados.

## Benchmarks y rendimiento

Resultados oficiales de MTEB(rus, v1.1) ejecutados con `mteb==2.20.5`, con todas las particiones y subconjuntos del benchmark segun su definicion (23/23 tareas completadas). La propia model card indica que las columnas de referencia provienen de las entregas de cada modelo en el leaderboard ([embeddings-benchmark/results](https://github.com/embeddings-benchmark/results)).

| Tarea | kenga-embed-prophet2 | Giga-Embeddings-instruct-480M | BERTA-128M | USER2-small-34M | rubert-tiny-turbo-29M |
|---|---:|---:|---:|---:|---:|
| GeoreviewClassification | 43,6 | 55,4 | 54,8 | 41,1 | 41,4 |
| HeadlineClassification | 79,8 | 89,0 | 89,0 | 74,3 | 68,9 |
| InappropriatenessClassification | 58,9 | 86,1 | 74,8 | 60,7 | 59,1 |
| KinopoiskClassification | 59,6 | 73,0 | 67,8 | 52,2 | 50,5 |
| MassiveIntentClassification | 54,2 | 85,3 | 74,0 | 66,1 | 58,0 |
| MassiveScenarioClassification | 64,0 | 90,9 | 84,5 | 70,3 | 62,9 |
| RuReviewsClassification | 66,7 | 76,3 | 72,3 | 60,8 | 60,7 |
| RuSciBenchGRNTIClassification | 58,3 | 74,0 | 69,0 | 63,1 | 52,9 |
| RuSciBenchOECDClassification | 44,7 | 59,9 | 54,8 | 49,2 | 40,8 |
| CEDRClassification | 46,8 | 69,8 | 73,0 | 39,4 | 39,0 |
| SensitiveTopicsClassification | 22,6 | 44,3 | 39,9 | 27,5 | 25,2 |
| GeoreviewClusteringP2P | 41,8 | 73,8 | 73,8 | 66,2 | 59,7 |
| RuSciBenchGRNTIClusteringP2P | 55,9 | 70,5 | 65,0 | 56,4 | 48,1 |
| RuSciBenchOECDClusteringP2P | 48,6 | 58,1 | 55,6 | 48,6 | 41,1 |
| TERRa | 57,0 | 79,6 | 65,7 | 54,0 | 56,3 |
| RuBQReranking | 57,8 | 80,5 | 75,2 | 66,0 | 62,2 |
| MIRACLReranking | 36,7 | 67,5 | 64,3 | 50,5 | 47,7 |
| RiaNewsRetrievalHardNegatives.v2 | 35,9 | 88,9 | 84,5 | 74,5 | 52,3 |
| RuBQRetrieval | 36,5 | 80,6 | 71,0 | 61,1 | 51,7 |
| MIRACLRetrievalHardNegatives.v2 | 28,7 | 74,7 | 65,9 | 46,1 | 42,4 |
| RUParaPhraserSTS | 64,5 | 78,3 | 77,8 | 69,6 | 72,1 |
| RuSTSBenchmarkSTS | 70,0 | 83,6 | 82,2 | 81,0 | 78,5 |
| STS22 | 50,4 | 65,3 | 61,1 | 66,1 | 64,6 |
| Classification (media) | 58,9 | 76,7 | 71,2 | 59,8 | 55,0 |
| MultilabelClassification (media) | 34,7 | 57,1 | 56,5 | 33,5 | 32,1 |
| Clustering (media) | 48,8 | 67,5 | 64,8 | 57,1 | 49,6 |
| PairClassification (media) | 57,0 | 79,6 | 65,7 | 54,0 | 56,3 |
| Reranking (media) | 47,3 | 74,0 | 69,7 | 58,3 | 54,9 |
| Retrieval (media) | 33,7 | 81,4 | 73,8 | 60,6 | 48,8 |
| STS (media) | 61,6 | 75,7 | 73,7 | 72,2 | 71,7 |
| Media sobre tareas | 51,4 | 74,2 | 69,4 | 58,5 | 53,7 |
| Media sobre tipos de tarea (leaderboard) | 48,8 | 73,1 | 67,9 | 56,5 | 52,6 |
| Tareas completadas | 23 | 23 | 23 | 23 | 23 |

Segun la propia model card, el modelo no supera a Giga-Embeddings-instruct-480M (brecha de +22,7 puntos en la media simple de tareas) y queda 7,0 puntos por debajo de USER2-small-34M. Los ficheros de resultados en crudo se encuentran en `mteb_results/` del arbol de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB incluyendo pesos y activaciones. El checkpoint fp32 ocupa 177 MB; en fp16 serian aproximadamente 88 MB. Con lotes grandes y secuencias de 512 tokens el consumo adicional de activaciones sigue siendo marginal.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4070 o incluso una GTX 1650 cubren de sobra la inferencia. Las A100 y H100 no aportan ventaja relevante por el reducido tamano del modelo.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo moderna y tambien en GPUs integradas. La model card indica explicitamente que `device="cpu"` funciona.
- Opciones de despliegue: al no seguir la interfaz estandar de `transformers` (usa el fichero autocontenido `modeling_kenga_embed_v2.py` y requiere `torch` + `sentencepiece`), no es directamente compatible con vLLM, TGI, Ollama ni llama.cpp, que estan orientados a modelos generativos y a formatos GGUF. La via soportada es la importacion manual de `KengaEmbedV2HF` y la descarga del repositorio con `huggingface_hub.snapshot_download`. Una exportacion manual a ONNX o TorchScript permitiria servirlo con runtimes de inferencia genericos.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media MTEB(rus) tipo leaderboard | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kenga-embed-prophet2 | 44,2 M | 512 tokens | 48,8 | MIT | HuggingFace, pesos PyTorch con codigo de modelado propio |
| Giga-Embeddings-instruct-480M | 480 M (segun denominacion) | No disponible | 73,1 | No disponible | Leaderboard de MTEB y catalogo del proveedor |
| BERTA-128M | 128 M (segun denominacion) | No disponible | 67,9 | No disponible | Leaderboard de MTEB y catalogo del proveedor |
| USER2-small-34M | 34 M (segun denominacion) | No disponible | 56,5 | No disponible | Leaderboard de MTEB y catalogo del proveedor |
| rubert-tiny-turbo-29M | 29 M (segun denominacion) | No disponible | 52,6 | No disponible | Leaderboard de MTEB y catalogo del proveedor |

Sobre la comparativa conviene precisar dos cosas. Primera: kenga-embed-prophet2 es aproximadamente 10 veces mas pequeno que Giga-Embeddings-instruct-480M, por lo que la comparacion justa es contra los codificadores rusos de 29M a 34M, donde se situa entre USER2-small (por debajo) y rubert-tiny-turbo (por encima) en la media global. Segunda: los datos de licencia, contexto y formato de pesos de los modelos de referencia no aparecen en la informacion proporcionada, por lo que se marcan como no disponibles en lugar de asumirlos.

## Limitaciones y advertencias

- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es la recuperacion de pasajes irrelevantes o la agrupacion incorrecta de documentos por similitudes espurias en el espacio de embeddings.
- Recuperacion debil: la media de recuperacion es 33,7 y en tareas concretas cae a 28,7 (MIRACLRetrievalHardNegatives.v2) y 35,9 (RiaNewsRetrievalHardNegatives.v2). No es un modelo adecuado como retriever principal en produccion sin un reranker posterior.
- Temas sensibles: 22,6 puntos en SensitiveTopicsClassification, por debajo de todos los modelos de referencia de la tabla. No debe usarse como unico filtro en moderacion de contenido.
- Contexto limitado a 512 tokens con posiciones aprendidas: no hay extension de contexto ni RoPE, por lo que los documentos largos deben trocearse y agregarse (por ejemplo, con pooling sobre fragmentos).
- Cobertura linguistica restringida a ruso e ingles; no hay soporte declarado de otras lenguas, lo que invalida su uso en corpus multilingues generales.
- Dependencia del protocolo de prefijos: omitir el prefijo correcto (`search_query`, `search_document`, `paraphrase`, etc.) degrada la calidad de los embeddings. El prefijo se antepone automaticamente en el metodo `encode`, pero el pipeline debe respetar el uso previsto para cada tarea.
- Integracion no estandar: no funciona con `AutoModel` de `transformers` ni con servidores de inferencia habituales; requiere cargar `modeling_kenga_embed_v2.py` desde la ruta local o mediante descarga, y depende de `torch` y `sentencepiece`.
- Ausencia de formatos cuantizados: no se publican variantes GGUF, ONNX ni INT8, lo que limita el despliegue en runtimes ligeros sin una exportacion manual.
- Validacion externa inexistente: 0 descargas y 0 likes en HuggingFace en el momento de redactar la ficha, con resultados de MTEB reportados por el propio autor. Conviene reproducir la evaluacion en el dominio objetivo antes de adoptarlo.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin obligacion de publicar derivados, siempre que se conserve el aviso de copyright y la licencia. No se han declarado restricciones adicionales en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GermannM/kenga-embed-prophet2
- Repositorio del proyecto Kenga: https://github.com/GermannM/kenga-lang
- Documentacion del contrato de la fase Prophet: https://github.com/GermannM/kenga-lang/blob/main/docs/PROPHETS.md
- Resultados de referencia del leaderboard de MTEB: https://github.com/embeddings-benchmark/results

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre el modelo; los resultados obtenidos correspondian a directorios de comercios sin relacion con el proyecto. No se dispone, por tanto, de articulos, papers ni demos adicionales que enlazar.
