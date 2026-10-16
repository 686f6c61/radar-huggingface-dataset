# kanishshandilya/book_recs_embed

## Resumen

`book_recs_embed` es un bi-encoder de recuperación densa (*dense retrieval*) afinado específicamente para búsqueda semántica y recomendación de libros en lenguaje natural. Lo desarrolla el usuario de HuggingFace `kanishshandilya` y parte de `BAAI/bge-small-en-v1.5`, un transformer BERT de 33,36 millones de parámetros. El modelo proyecta consultas (deseos temáticos, sinopsis de trama, tropos de personajes o tonos emocionales) y metadatos de libros en un mismo espacio vectorial de 384 dimensiones, lo que permite búsqueda por vecino más cercano sobre catálogos grandes mediante similitud coseno.

El problema que resuelve es concreto: la búsqueda por palabras clave falla cuando el usuario no recuerda el título ni el autor, pero sí describe la trama, el estilo o la sensación que busca. Un espacio de embeddings afinado sobre pares consulta-libro cubre ese hueco. El modelo se entrenó sobre un catálogo de 64.552 libros del dataset UCSD Goodreads y declara mejoras sustanciales respecto al modelo base sin afinar: Recall@10 pasa del 38,84 % al 76,5 % sobre el catálogo completo en 32.170 consultas de test retenidas.

Su relevancia práctica está en la relación entre coste y rendimiento: con 33 millones de parámetros y un repositorio de 0,1 GB se puede ejecutar en CPU o en cualquier GPU de consumo, integrándose en pipelines de recuperación en dos etapas junto al reranker del mismo autor (`kanishshandilya/book_recs_reranker`). La licencia MIT facilita su uso comercial sin restricciones de atribución más allá de las habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (familia BERT), derivado de `BAAI/bge-small-en-v1.5` |
| Parametros totales | 33.360.000 (33,36 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos distribuidos en safetensors (compatibles con cuantizacion FP16/int8 mediante librerias estandar) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Tarea (pipeline) | sentence-similarity / feature-extraction |
| Tamano del repositorio | 0,1 GB |
| Catalogo de referencia | 64.552 libros del dataset UCSD Goodreads |
| Consultas de evaluacion | 32.170 consultas de test retenidas |
| Modelo complementario | kanishshandilya/book_recs_reranker (cross-encoder de segunda etapa) |

## Arquitectura y entrenamiento

La arquitectura es un bi-encoder estandar de la familia BERT: se codifican por separado la consulta y el documento, y se comparan sus embeddings normalizados mediante producto escalar o similitud coseno. Al no existir atencion cruzada entre consulta y documento, los embeddings del catalogo pueden precalcularse una sola vez y almacenarse en un indice vectorial, lo que reduce la busqueda a una operacion de vecino mas cercano. El modelo hereda los pesos de `BAAI/bge-small-en-v1.5` y conserva la convencion de prefijo de instruccion para consultas ("Represent this sentence for searching relevant passages: ").

El entrenamiento se articula en cuatro etapas. Primero, Qwen 3 8B genero cinco consultas sinteticas por libro en cinco niveles de intencion (tematica amplia, especificidad media, detalle de trama, estilo y tono, y nicho), sumando aproximadamente 320.000 pares consulta-libro. Segundo, la particion train/val/test (80/10/10) se hizo agrupando por `work_id` de Goodreads o por titulo y autor normalizados, de modo que traducciones y reediciones de una misma obra no se filtran entre conjuntos. Tercero, el ajuste contrastivo uso Multiple Negatives Ranking Loss (InfoNCE) con temperatura 0,05, AdamW con `lr=2e-5` y weight decay 0,01, 10 % de warmup lineal y precision mixta FP16; se aplico una mascara de duplicados para anular los falsos negativos cuando varias consultas del mismo libro coincidian en el mismo lote. Cuarto, se ejecutaron dos ciclos de minado iterativo de negativos duros: se recodifico el catalogo con cada version previa y se extrajeron distractores de la ventana de rangos 2-35, descartando libros con solapamiento de palabras en el titulo superior al 65 % o pertenecientes a la misma serie.

## Capacidades

- Generacion de embeddings de frases y parrafos con salida de 384 dimensiones y normalizacion opcional.
- Recuperacion densa consulta-documento sobre catalogos de decenas de miles de libros.
- Busqueda semantica por trama, tropo, tono emocional, estilo de prosa o tematica amplia, sin coincidencia literal de palabras clave.
- Similitud entre documentos (sentence-similarity) para agrupar o comparar fichas bibliograficas.
- Precalculo de embeddings de catalogo para indexacion en bases de datos vectoriales.
- Integracion en arquitecturas de recuperacion en dos etapas como retriever de primera fase (top 30-50 candidatos).
- Compatibilidad con `text-embeddings-inference` y con endpoints gestionados de HuggingFace (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo exclusivamente de representacion vectorial.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Busqueda en librerias online: el usuario describe lo que busca ("novela sobre ambicion y ascenso social en la Inglaterra victoriana") y el sistema recupera candidatos por similitud en el espacio de 384 dimensiones, sin depender de que las palabras coincidan con los metadatos.
- Recomendador "si te gusto X": se calcula el embedding de los libros que el usuario ha valorado, se promedia o se usa como consulta y se recuperan los vecinos mas proximos del catalogo como sugerencias.
- Asistentes de descubrimiento lector en aplicaciones de lectura o clubes de lectura: el modelo actua como primera etapa de un RAG donde un LLM genera la recomendacion final a partir de los 30-50 candidatos recuperados.
- Precalculo e indexacion de catalogos editoriales completos: al ser un bi-encoder de 33 M de parametros, los embeddings de un catalogo de decenas de miles de titulos se generan en lotes con coste reducido y se almacenan en un indice vectorial para busquedas posteriores de baja latencia.
- Agrupacion y deduplicacion de fondos bibliograficos: la similitud entre fichas permite detectar ediciones, traducciones o titulos equivalentes en un catalogo, complementando la particion por `work_id` que ya usa el propio entrenamiento.
- Filtrado tematico y tagging automatico: dado un manuscrito o una sinopsis nueva, se recuperan los libros mas similares del catalogo y se infieren generos, tonos o publico objetivo a partir de sus metadatos.
- Personalizacion de newsletters y campanas editoriales: se segmenta a los lectores por la similitud entre sus historiales y se seleccionan titulos del fondo con alta afinidad semantica.
- Recuperacion de material de referencia para escritores o editores: dada una escena o premisa en texto libre, se localizan obras comparables para analisis de mercado.

## Benchmarks y rendimiento

Evaluacion declarada por el autor sobre el catalogo completo de 64.552 libros y 32.170 consultas de test retenidas (no sobre un subconjunto reducido de candidatos):

| Metrica | Base sin afinar (v0) | Fine-tune inicial (v3, 3 epochs) | Ciclo 1 (v4) | Ciclo 2 (v5, este modelo) | Ganancia total |
|---|---|---|---|---|---|
| Recall@1 | 11,52 % | ~40,1 % | ~44,2 % | ~47,1 % | +35,6 % |
| Recall@5 | 32,80 % | ~63,0 % | ~66,1 % | ~68,4 % | +35,6 % |
| Recall@10 | 38,84 % | 70,48 % | ~74,2 % | ~76,5 % | +37,7 % |
| Recall@50 | 53,22 % | ~83,2 % | ~86,0 % | ~88,3 % | +35,1 % |

Notas sobre los datos: los valores de la columna v3 en Recall@1, @5 y @50, asi como todos los de v4 y v5, aparecen marcados con "~" en la model card del autor, por lo que son aproximados. Los valores de v0 y los de Recall@10 en v3 se declaran verificados a partir de `baseline_metrics_v2.json`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, que no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en FP32 (unos 130 MB de pesos, mas activaciones y lote), en torno a 70 MB en FP16 y unos 35 MB en int8. Cualquier GPU moderna sobra para el modelo.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU para lotes moderados; en GPU, cualquier tarjeta con 4 GB o mas (RTX 3050, RTX 4060, T4, L4) es mas que suficiente. A100 y H100 solo tienen sentido para indexar catalogos muy grandes en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual, e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: `sentence-transformers` como via principal; `text-embeddings-inference` (TEI) para servir por HTTP; endpoints de HuggingFace (el repo esta etiquetado como `endpoints_compatible`); integracion con bases de datos vectoriales (FAISS, Qdrant, Milvus, pgvector) para la fase de busqueda. No se documenta soporte especifico para Ollama ni llama.cpp en la informacion proporcionada.
- Latencia y throughput: no se publican cifras de latencia de codificacion ni de throughput de inferencia. La model card afirma busqueda por vecino mas cercano "sub-milisegundo" sobre catalogos grandes, pero esa cifra corresponde a la consulta sobre el indice vectorial, no al tiempo de codificacion de la consulta con el modelo.
- Consideracion de memoria en indexacion: el catalogo de referencia son 64.552 libros; a 384 dimensiones en FP32, el indice completo ocupa aproximadamente 99 MB (sin contar metadatos), cifra que se reduce a la mitad en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Dim. embedding | Contexto | Licencia | Ambito | Rendimiento declarado |
|---|---|---|---|---|---|---|
| kanishshandilya/book_recs_embed | 33,36 M | 384 | No disponible | MIT | Recuperacion de libros en ingles | Recall@10 76,5 % sobre catalogo de 64.552 libros |
| BAAI/bge-small-en-v1.5 | 33,4 M | 384 | No disponible | MIT | Embeddings generales en ingles | Recall@10 38,84 % de base sin afinar en el mismo catalogo (medicion del autor) |
| kanishshandilya/book_recs_reranker | No disponible | No aplica (cross-encoder) | No disponible | No disponible | Reranking de libros en ingles | No disponible; se usa como segunda etapa sobre los candidatos de este modelo |
| Otras alternativas de embeddings de proposito general | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparacion mas informativa es contra el propio modelo base: el ajuste fino casi duplica el Recall@10 en el dominio de libros, a igualdad de tamano, dimension de embedding y licencia. Fuera de ese dominio especifico no hay datos publicados que permitan comparar con alternativas de embeddings generalistas.

## Limitaciones y advertencias

- Idioma: solo ingles. El rendimiento en consultas en castellano o en catalogos en otros idiomas no esta documentado y previsiblemente sera bajo.
- Especializacion de dominio: el ajuste se hizo exclusivamente sobre libros del dataset UCSD Goodreads. Su uso como encoder de proposito general degradara respecto de un modelo base sin afinar en dominios ajenos.
- Sesgo de catalogo: el corpus de entrenamiento procede de Goodreads, con sobrerrepresentacion de obras populares en ingles y de la estructura de generos y sinopsis de esa plataforma. La recuperacion de literatura en otros idiomas o de editoriales independientes puede verse penalizada.
- Convencion de prefijo: las consultas deben codificarse con el prefijo de instruccion recomendado por BGE. Omitirlo, o aplicarlo tambien a los documentos, altera la calidad de la recuperacion.
- Ausencia de benchmarks externos: no hay evaluacion en datasets publicos de recuperacion (BEIR, MTEB) que permita comparar de forma independiente; todas las cifras provienen del autor.
- Cifras parcialmente aproximadas: varios valores de la tabla de evaluacion estan marcados como aproximados en la propia model card.
- Sin generacion de texto: no produce respuestas, no razona, no invoca herramientas. Para una recomendacion en lenguaje natural hace falta un LLM que consuma los candidatos recuperados.
- Alucinacion: no aplica en el sentido generativo, pero un falso positivo recuperado con alta puntuacion de similitud puede inducir a error si el sistema posterior lo presenta como recomendacion sin verificacion. Por eso el autor recomienda la segunda etapa de reranking.
- Precision limitada en la primera etapa: el Recall@1 del 47,1 % implica que el titulo correcto no aparece en primera posicion en mas de la mitad de las consultas; en produccion conviene recuperar 30-50 candidatos y rerankear.
- Licencia: MIT, permisiva y apta para uso comercial, con la unica obligacion de conservar el aviso de copyright y la licencia. Conviene verificar aparte las condiciones de uso del dataset Goodreads si se redistribuyen los datos de catalogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kanishshandilya/book_recs_embed
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Reranker complementario: https://huggingface.co/kanishshandilya/book_recs_reranker
- Dataset UCSD Goodreads: https://mengtingwan.github.io/data/goodreads.html
- Documentacion de sentence-transformers: https://www.sbert.net/
