# HarishMaths/Hotel-Policy-Embedding

## Resumen

Hotel-Policy-Embedding es un modelo de embeddings de frases publicado por el usuario HarishMaths en Hugging Face. Se trata de un Sentence Transformer construido sobre un encoder BERT que proyecta texto en un espacio vectorial denso de 384 dimensiones, entrenado especificamente para medir similitud semantica en el dominio de politicas hoteleras (cancelaciones, upgrades, programas de fidelizacion, normas de ocupacion y tabaquismo). El modelo no genera texto: su salida es un vector normalizado que permite comparar fragmentos de politica mediante similitud coseno.

El modelo cuenta con 22.713.216 parametros (aproximadamente 0,1 GB en safetensors) y una longitud maxima de secuencia de 128 tokens. Fue entrenado con la funcion de perdida MultipleNegativesRankingLoss sobre un conjunto de 3.872 pares de frases, una configuracion tipica de ajuste fino para recuperacion y similitud semantica. No requiere GPU para funcionar, lo que lo hace atractivo para desplegar busqueda semantica sobre documentacion de politicas en entornos con recursos limitados.

Su relevancia actual es acotada pero clara: es un modelo muy especializado, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados en la model card. Resulta util como componente de recuperacion (retrieval) dentro de un pipeline RAG sobre documentacion hotelera, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sentence Transformer: encoder BertModel + pooling por media + normalizacion |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de salida | 384 dimensiones |
| Funcion de similitud | similitud coseno |
| Funcion de pooling | media (mean pooling), incluye prompt |
| Perdida de entrenamiento | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 3.872 ejemplos |
| Tamano del repositorio | 0,1 GB |
| Modalidad | texto |

## Arquitectura y entrenamiento

La arquitectura, tal como se detalla en la model card, es un `SentenceTransformer` compuesto por tres modulos en serie: (1) un encoder `BertModel` en modo `feature-extraction` que devuelve `last_hidden_state`; (2) una capa de pooling por media que produce el vector de 384 dimensiones, con `include_prompt: True`; y (3) una capa de normalizacion. Esta estructura es la habitual en la familia Sentence-BERT para tareas de similitud textual y busqueda semantica, y permite comparar frases directamente mediante producto escalar o distancia coseno sin necesidad de un cross-encoder.

El entrenamiento se realizo con la libreria `sentence-transformers` y el tag `generated_from_trainer` indica que se genero con el flujo automatico de entrenamiento de dicha libreria. Se utilizo la perdida `MultipleNegativesRankingLoss` sobre un conjunto de 3.872 pares (tag `dataset_size:3872`), una perdida contrastiva que aprovecha los demas ejemplos del lote como negativos. El modelo base no esta declarado en la model card (aparece como `Unknown`), y tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO (no aplicables, en cualquier caso, a un modelo de embeddings). No se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de embeddings de texto: convierte frases y parrafos en vectores densos de 384 dimensiones, normalizados y comparables por similitud coseno.
- Similitud textual semantica: calcula puntuaciones de similitud entre pares de textos, tal como muestra el ejemplo de la model card (similitud 0,9151 entre dos textos sobre politicas de tabaco).
- Busqueda semantica: permite indexar un corpus y recuperar los fragmentos mas relevantes ante una consulta en lenguaje natural.
- Mineria de parafrasis: identifica fragmentos con significado equivalente aunque difieran en su redaccion.
- Clustering de textos: agrupa fragmentos de politica por tematica (cancelacion, upgrade, ocupacion, etc.).
- Clasificacion basada en embeddings: utilizable como extractor de caracteristicas para un clasificador posterior (tag `feature-extraction`).
- Compatibilidad con Text Embeddings Inference: el tag `text-embeddings-inference` y `endpoints_compatible` indican soporte para despliegue en Hugging Face Inference Endpoints.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declara la lista de idiomas).

## Casos de uso

- Busqueda semantica sobre politicas hoteleras: indexar el corpus de condiciones de una cadena hotelera (cancelaciones, upgrades, programa de fidelizacion) y permitir consultas en lenguaje natural que recuperen la clausula exacta, usando los 384 dimensiones del embedding como clave de recuperacion en una base vectorial.
- Recuperacion aumentada (RAG) para asistentes de atencion al cliente: el modelo actua como retriever que selecciona los fragmentos de politica relevantes antes de pasarselos a un LLM generativo, evitando que este responda sin base documental.
- Enrutado de consultas entrantes: clasificar tickets o mensajes de clientes por intencion (cancelacion, facturacion, upgrade, queja) comparando el embedding de la consulta con embeddings prototipo de cada categoria.
- Deduplicacion de clausulas contractuales: detectar condiciones repetidas o casi identicas entre documentos de distintas propiedades o cadenas, reduciendo el trabajo manual de revision legal.
- Deteccion de incoherencias entre politicas: agrupar clausulas por similitud para localizar contradicciones entre el documento global de la cadena y las condiciones locales de cada propiedad.
- Cache semantico de respuestas: almacenar embeddings de preguntas frecuentes y reutilizar respuestas previas cuando una consulta nueva supera un umbral de similitud, reduciendo coste de inferencia de un LLM.
- Moderacion y clasificacion de resenas: agrupar resenas de huespedes por tematica o detectar menciones a incumplimientos de politica (tabaquismo, ocupacion, danos) para su escalado.
- Motor de recomendacion de tarifas: dado el perfil de reserva del usuario, recuperar las condiciones de tarifa mas similares semánticamente (flexible, semiflexible, no reembolsable) y presentarlas de forma comparada.
- Analisis exploratorio de corpus de politica: proyectar los embeddings y aplicar clustering para obtener un mapa tematico de la documentacion sin etiquetas previas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el campo `model-index` de la model card. La metrica `verified: false` indica que no han sido verificados de forma independiente.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Semantic Similarity | val | Pearson Cosine | 0,6244 |
| Semantic Similarity | val | Spearman Cosine | 0,6463 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, MTEB, etc.) en la informacion disponible. El dataset de evaluacion se identifica unicamente como `val`, sin especificar su composicion ni su tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 91 MB en FP32, 46 MB en FP16 y 23 MB en INT8, correspondientes a los 22,7 millones de parametros; el consumo real lo dominan las activaciones y el tamano del lote.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060, RTX 4090 y tambien en GPUs integradas; tambien funciona en CPU sin problema apreciable dada su magnitud.
- GPU de datacenter (A100, H100) solo estan justificadas si se necesita procesar volumenes muy elevados de embeddings por segundo en un mismo nodo.
- Opciones de despliegue: libreria `sentence-transformers`, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime para aceleracion en CPU, y uso como extractor dentro de Transformers.
- Integracion con bases vectoriales y frameworks: FAISS, Qdrant, Milvus, pgvector, Elasticsearch, LangChain y LlamaIndex como retriever.
- No es compatible con llama.cpp ni Ollama, ya que no se distribuyen pesos en formato GGUF ni se trata de un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos comparables declarados por el autor. A continuacion se contrasta con alternativas de proposito general ampliamente utilizadas para similitud semantica; los datos de esos modelos de referencia no provienen de la informacion suministrada y deben verificarse en sus respectivas model cards.

| Modelo | Parametros | Dimensiones | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| HarishMaths/Hotel-Policy-Embedding | 22,7 M | 384 | 128 tokens | no disponible | Especializado en politicas hoteleras; 3.872 pares de entrenamiento; metricas no verificadas |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 384 | 256 tokens | Apache 2.0 | Proposito general, ampliamente adoptado; mismo orden de magnitud en parametros |
| BAAI/bge-small-en-v1.5 | 33 M | 384 | 512 tokens | MIT | Buen rendimiento en recuperacion; orientado a ingles |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 384 | 128 tokens | Apache 2.0 | Multilingue (mas de 50 idiomas), mas pesado |

No se dispone de datos de contexto, licencia o idiomas del modelo evaluado que permitan una comparacion completa con alternativas de su misma categoria especializada.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; conviene contactar con el autor o tratar el modelo como no apto para produccion.
- Idiomas no declarados: no se puede confirmar el soporte multilingue; los ejemplos de la model card y el dominio (politicas de Marriott) estan en ingles, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto muy reducida (128 tokens): las clausulas de politica mas largas se truncan y pueden perder informacion critica; es necesario fragmentar los documentos antes de generar embeddings.
- Riesgo de falsos positivos por similitud: un modelo de embeddings no alucina texto, pero puede asignar puntuaciones altas a fragmentos con tematica parecida y semantica distinta; se recomienda umbral y validacion con un re-ranker.
- Sesgo de dominio: el entrenamiento se realizo sobre 3.872 pares centrados en un unico dominio y probablemente en una unica cadena hotelera, lo que limita la generalizacion a otros sectores o a otras cadenas.
- Sobreajuste al conjunto de validacion: las metricas declaradas (Pearson 0,6244 y Spearman 0,6463) no estan verificadas y corresponden a un conjunto `val` sin descripcion; no deben tomarse como rendimiento garantizado en datos reales.
- Modelo de baja difusion: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento posterior a la fecha de actualizacion.
- Modelo base no declarado: al no indicarse la arquitectura de partida, no es posible auditar su procedencia ni los datos con los que fue preentrenado.
- No apto para generacion, agentes ni razonamiento: cualquier uso de ese tipo requiere combinarlo con un modelo generativo independiente.
- Rendimiento inferior esperable frente a modelos de embeddings mas grandes (por ejemplo, variantes de 100 M o 300 M de parametros) en tareas fuera de su dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarishMaths/Hotel-Policy-Embedding
- Documentacion de Sentence Transformers: https://www.SBERT.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos con la libreria sentence-transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de referencia de Sentence-BERT (arquitectura base de la familia): https://arxiv.org/abs/1908.10084
