# Quazim0t0/Byrne-Embed

## Resumen

Byrne-Embed es un modelo de embeddings de frases publicado por el usuario Quazim0t0 en HuggingFace, con pipeline declarado de feature-extraction y orientado a tareas de similitud semantica y recuperacion de informacion. Se distribuye bajo licencia Apache 2.0, con 98.027.395 parametros confirmados en los pesos safetensors y un repositorio de 0,8 GB. El modelo esta etiquetado como monolingue en ingles y emplea una arquitectura propia identificada con los tags byrne_embed y custom_code, lo que obliga a cargar codigo remoto para su uso.

Su relevancia practica se limita, de momento, a un nicho muy concreto: es un encoder de ~98M de parametros que publica resultados en tareas del benchmark MTEB (clasificacion, clustering, recuperacion, reranking y STS), lo que permite evaluar su encaje en pipelines de busqueda semantica o deduplicacion sin desplegar modelos de mayor tamano. Frente a los encoders de referencia de su categoria, destaca en clasificacion de dominio e intenciones (MTOPDomainClassification 92,29 de accuracy) y en similitud semantica sobre textos biomedicos (BIOSSES, 75,56 de Spearman), mientras que su rendimiento en recuperacion sobre corpus abiertos es bajo.

El principal caveat es la falta de documentacion: la model card publicada contiene unicamente el bloque YAML de metadatos, sin cuerpo de texto, lo que deja sin especificar la arquitectura exacta, los datos de entrenamiento, la longitud de contexto soportada o el procedimiento de uso. Con 30 descargas y 1 like en el momento de la consulta, se trata ademas de un modelo sin validacion externa significativa, y todos sus resultados de benchmark estan marcados como no verificados (`verified: false`) por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Tags `byrne_embed` y `custom_code`; requiere `trust_remote_code=True`. No se documenta si es transformer, MoE o hibrida |
| Parametros totales | 98.027.395 (confirmado en safetensors) |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Solo se publican pesos safetensors; no hay variantes GGUF, GPTQ, AWQ ni ONNX documentadas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria declarada: transformers) |
| Dimension del embedding | No disponible |
| Tamano del repositorio | 0,8 GB |
| Pipeline declarado | feature-extraction |
| Fecha de creacion | 2026-06-20 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 30 / 1 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. Los metadatos indican que el modelo no usa una clase estandar de transformers, sino codigo propio publicado en el repositorio (tags `custom_code` y `byrne_embed`), lo que implica que `AutoModel` y `AutoTokenizer` no funcionaran sin `trust_remote_code=True`. El tag adicional `spikewhale` aparece junto a los anteriores y no viene acompanado de ninguna explicacion en la model card, por lo que no es posible determinar si designa una familia de arquitectura, un framework de entrenamiento o una tecnica de pooling. Con 98M de parametros en un unico conjunto de pesos safetensors, el modelo encaja en el rango habitual de los encoders tipo BERT-base, pero esto es una inferencia por tamano, no un dato confirmado.

Tampoco hay informacion sobre el corpus de entrenamiento: no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como contrastive learning, DPO o RLHF, habituales en modelos de embeddings. La model card publicada no contiene cuerpo de texto, solo el frontmatter YAML con licencia, idioma, tags y el bloque `model-index` de resultados. En consecuencia, no se puede verificar ningun detalle del pipeline de entrenamiento ni de las innovaciones tecnicas que el autor pudiera haber introducido.

## Capacidades

- Generacion de embeddings de frases para tareas de representacion densa (feature-extraction).
- Similitud semantica entre textos (tag `sentence-similarity`).
- Recuperacion de informacion (retrieval) sobre corpus documentales: el modelo declara resultados en ArguAna, FiQA2018, FEVER, ClimateFEVER, HotpotQA y dos subconjuntos de CQADupstack.
- Clustering de documentos y de frases, evaluado con v-measure en conjuntos de ArXiv, BioRxiv y MedRxiv.
- Clasificacion de texto por similitud o mediante cabecera ligera: dominios MTOP, intenciones y escenarios MASSIVE, sentimiento en IMDb, contrafactualidad en Amazon y categorias de soporte en Banking77.
- Reranking de pares de preguntas y de recomendacion (AskUbuntuDupQuestions, MindSmallReranking).
- Capacidad multilingue: no. El modelo declara exclusivamente ingles.
- Tool calling, function calling, modo thinking, vision o audio: no disponibles. Es un modelo de embeddings, no un modelo generativo ni multimodal.
- Soporte de agentes y razonamiento multi-paso: no disponible; fuera del alcance de un encoder de este tipo.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica: el modelo puede indexar fragmentos de texto en una base vectorial y recuperar los pasajes mas cercanos a una consulta. Es adecuado cuando el corpus esta en ingles y el presupuesto de latencia es ajustado, dado su tamano de 98M de parametros. Su ndcg@10 de 30,47 en HotpotQAHardNegatives y 28,70 en FEVERHardNegatives son valores moderados que conviene validar contra el corpus real antes de production.
- Deduplicacion y near-duplicate detection: el score de 52,88 de map@1000 en AskUbuntuDupQuestions indica capacidad razonable para ordenar pares de preguntas duplicadas, util en foros, sistemas de tickets o bases de conocimiento.
- Agrupacion tematica de articulos cientificos: el modelo obtiene v-measure de 53,15 en ArXivHierarchicalClusteringP2P y 50,39 en ArXivHierarchicalClusteringS2S, lo que permite agrupar abstracts y secciones de papers por similitud sin supervision.
- Moderacion y triaje de resenas: con 60,97 de accuracy en ImdbClassification, sirve como primera etapa de clasificacion de sentimiento en grandes volumenes, dejando la decision final a un modelo mayor o a revision humana.
- Enrutado de peticiones en asistentes conversacionales: los 92,29 de accuracy en MTOPDomainClassification y 73,05 en MassiveScenarioClassification permiten clasificar el dominio y el escenario de una consulta antes de derivarla al skill correspondiente.
- Clasificacion de tickets de soporte bancario: 74,64 de accuracy en Banking77Classification lo hace util para etiquetar automaticamente consultas por categoria en un helpdesk, siempre que el trafico sea en ingles.
- Deteccion de contradicciones y analisis de resenas de producto: 80,12 de accuracy en AmazonCounterfactualClassification permite filtrar afirmaciones contrafactuales o inconsistentes en resenas.
- Recuperacion en el dominio biomedico: 75,56 de Spearman en BIOSSES sugiere buen comportamiento con pares de frases similares de literatura clinica, aplicable a agrupacion de terminos o sinonimia medica.

## Benchmarks y rendimiento

Resultados declarados por el autor en el bloque `model-index` de la model card. Todos estan marcados con `verified: false`, es decir, no han sido validados de forma independiente.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Classification | MTEB AmazonCounterfactualClassification | accuracy | 80,12 |
| Classification | MTEB Banking77Classification | accuracy | 74,64 |
| Classification | MTEB ImdbClassification | accuracy | 60,97 |
| Classification | MTEB MTOPDomainClassification | accuracy | 92,29 |
| Classification | MTEB MassiveIntentClassification | accuracy | 63,23 |
| Classification | MTEB MassiveScenarioClassification | accuracy | 73,05 |
| Clustering | MTEB ArXivHierarchicalClusteringP2P | v_measure | 53,15 |
| Clustering | MTEB ArXivHierarchicalClusteringS2S | v_measure | 50,39 |
| Clustering | MTEB BiorxivClusteringP2P.v2 | v_measure | 33,73 |
| Clustering | MTEB MedrxivClusteringP2P.v2 | v_measure | 32,70 |
| Clustering | MTEB MedrxivClusteringS2S.v2 | v_measure | 29,04 |
| Retrieval | MTEB ArguAna | ndcg_at_10 | 37,67 |
| Retrieval | MTEB CQADupstackGamingRetrieval | ndcg_at_10 | 37,14 |
| Retrieval | MTEB CQADupstackUnixRetrieval | ndcg_at_10 | 23,48 |
| Retrieval | MTEB ClimateFEVERHardNegatives | ndcg_at_10 | 13,60 |
| Retrieval | MTEB FEVERHardNegatives | ndcg_at_10 | 28,70 |
| Retrieval | MTEB FiQA2018 | ndcg_at_10 | 11,38 |
| Retrieval | MTEB HotpotQAHardNegatives | ndcg_at_10 | 30,47 |
| Reranking | MTEB AskUbuntuDupQuestions | map_at_1000 | 52,88 |
| Reranking | MTEB MindSmallReranking | max_over_subqueries_map_at_1000 | 28,07 |
| STS | MTEB BIOSSES | cosine_spearman | 75,56 |

No se han publicado en la informacion disponible resultados agregados de MTEB (media por categoria o media global), ni comparaciones directas con otros modelos realizadas por el autor.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32 unos 392 MB (98.027.395 x 4 bytes); en FP16/BF16 unos 196 MB; en INT8 unos 98 MB.
- VRAM realista en inferencia: entre 1 y 2 GB contando activaciones, tokenizer y overhead del runtime, dependiendo del tamano de batch y de la longitud de secuencia (no documentada).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, RTX 4090, T4, L4, A10 o superiores no suponen ninguna restriccion. El modelo tambien es viable en CPU y en Apple Silicon.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada por los tags. La compatibilidad con sentence-transformers, vLLM, TGI, Text Embeddings Inference, ONNX Runtime o FastEmbed no esta confirmada y depende de que el codigo propio del repositorio implemente las interfaces esperadas. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no estan soportados de fabrica.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por lote.
- Almacenamiento: el repositorio ocupa 0,8 GB, superior a lo que ocuparian los pesos en FP16, lo que sugiere que se incluyen pesos en mayor precision o ficheros adicionales.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion de rendimiento no esta disponible. La comparacion estructural es la siguiente:

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Byrne-Embed | 98.027.395 | No disponible | Apache 2.0 | Ingles | HuggingFace, requiere `trust_remote_code` |
| all-MiniLM-L6-v2 | 22.713.600 | 512 tokens | Apache 2.0 | Ingles | HuggingFace, sentence-transformers, ONNX, ampliamente integrado |
| bge-small-en-v1.5 | 33.360.000 | 512 tokens | MIT | Ingles | HuggingFace, sentence-transformers, GGUF, ONNX |
| e5-base-v2 | 109.000.000 | 512 tokens | MIT | Ingles | HuggingFace, sentence-transformers, ONNX |
| gte-base | 109.000.000 | 512 tokens | Apache 2.0 | Ingles | HuggingFace, sentence-transformers, ONNX |

El principal diferencial de Byrne-Embed no es el rendimiento, sino su naturaleza: es un encoder de ~98M de parametros con codigo propio y sin pesos alternativos, mientras que las alternativas de la tabla cuentan con ecosistema de despliegue consolidado y variantes cuantizadas listas para produccion. La comparacion de metricas MTEB entre Byrne-Embed y estos modelos no puede realizarse con los datos disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza o dominio.
- Riesgo de alucinacion: bajo en el sentido generativo, ya que el modelo no produce texto, solo vectores. Sin embargo, si se usa para recuperacion, puede devolver pasajes irrelevantes con alta similitud coseno, especialmente en dominios alejados del entrenamiento.
- Limitacion de idioma: monolingue en ingles. No debe usarse con texto en castellano u otros idiomas sin validacion previa, ya que el comportamiento fuera de dominio no esta documentado.
- Longitud de contexto desconocida: es un riesgo operativo relevante. Sin este dato no se puede garantizar el truncado correcto de documentos largos ni la calidad del embedding en entradas extensas.
- Resultados no verificados: los 21 valores de benchmark estan marcados como `verified: false`. No hay evaluacion independiente ni comparacion reproducible publicada por terceros.
- Codigo remoto: el tag `custom_code` obliga a ejecutar codigo del repositorio con `trust_remote_code=True`, lo que introduce un riesgo de cadena de suministro. Conviene auditar los ficheros `.py` antes de cargarlos en un entorno de produccion.
- Adopcion muy baja: 30 descargas y 1 like. No hay evidencia de uso en produccion ni de mantenimiento activo mas alla de la actualizacion del repositorio.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de copyright y el fichero de licencia. No se declaran restricciones adicionales, pero la ausencia de documentacion sobre el origen de los datos de entrenamiento puede complicar una auditoria de cumplimiento.
- Compatibilidad: al no depender de clases estandar de transformers, puede no integrarse con frameworks habituales de embeddings como sentence-transformers o LangChain sin trabajo adicional de adaptacion.
- Precision frente a alternativas: en recuperacion abierta los valores son bajos (FiQA2018 11,38 de ndcg@10; ClimateFEVERHardNegatives 13,60), por lo que no es recomendable como recuperador principal en dominios genericos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quazim0t0/Byrne-Embed
- Repositorio de pesos y codigo remoto: incluido en la pagina anterior (ficheros safetensors y codigo propio del autor)
- Benchmark MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Paper de MTEB (referencia del benchmark utilizado): https://arxiv.org/abs/2210.07316
- No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos del modelo en la busqueda web realizada. Los resultados de dicha busqueda corresponden a paginas sobre aranceles aduaneros sin relacion con el modelo.
