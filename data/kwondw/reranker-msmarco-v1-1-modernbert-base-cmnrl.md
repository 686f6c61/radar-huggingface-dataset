# kwondw/reranker-msmarco-v1.1-ModernBERT-base-cmnrl

## Resumen

El modelo kwondw/reranker-msmarco-v1.1-ModernBERT-base-cmnrl es un cross-encoder de reordenacion (reranking) desarrollado por el usuario kwondw y publicado en HuggingFace. Se construye sobre answerdotai/ModernBERT-base mediante fine-tuning supervisado con la libreria sentence-transformers sobre el corpus ms_marco, y su funcion es asignar una puntuacion de relevancia a pares (consulta, documento) para reordenar listas de candidatos producidas por un recuperador previo. Su tarea en el pipeline es la habitual de los rerankers: mejorar la precision de un sistema de busqueda semantica o de generacion aumentada por recuperacion (RAG) sin cambiar el motor de recuperacion subyacente.

Tecnicamente es un transformer encoder con una cabeza de clasificacion de secuencia (ModernBertForSequenceClassification) que produce una unica etiqueta de salida. Cuenta con 149.605.633 parametros reales en safetensors y admite una longitud maxima de secuencia de 8192 tokens, lo que permite puntuar pares formados por consultas y documentos largos dentro de la misma ventana. El repositorio ocupa 0,6 GB y el modelo es compatible con sentence-transformers, text-embeddings-inference y despliegue via endpoints.

Su relevancia actual es la de los rerankers de contexto largo: frente a alternativas clasicas limitadas a 512 tokens, este modelo permite reordenar pasajes completos sin truncar, y su tamano (aproximadamente 150 millones de parametros) lo hace desplegable en hardware modesto. La model card no declara licencia ni idiomas soportados, y las metricas publicadas estan marcadas como no verificadas, por lo que su adopcion en produccion exige una evaluacion propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre ModernBERT (ModernBertForSequenceClassification), transformer encoder con cabeza de clasificacion de una etiqueta |
| Parametros totales | 149.605.633 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | No disponible (no se declaran cuantizaciones oficiales en la informacion proporcionada) |
| Idiomas soportados | No disponible (la model card deja el campo de idioma como desconocido) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Pipeline | text-ranking |
| Modelo base | answerdotai/ModernBERT-base (revision 8949b909ec900327062f0ebf497f51aef5e6f0c8) |
| Modalidad | Texto |
| Etiquetas de salida | 1 |
| Tamano del repositorio | 0,6 GB |
| Dataset de entrenamiento | ms_marco, con dataset_size de 64538 |
| Funcion de perdida | CachedMultipleNegativesRankingLoss |
| Compatibilidad de despliegue | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un CrossEncoder de sentence-transformers cuya unica capa es un Transformer con tarea de sequence-classification y arquitectura declarada ModernBertForSequenceClassification. La salida es un unico logit de relevancia por par de textos, de modo que el modelo no genera embeddings reutilizables para busqueda por similitud, sino que puntua cada par (consulta, documento) de forma conjunta. La model card no detalla la composicion exacta del dataset mas alla de indicar ms_marco, ni especifica el numero total de tokens vistos, el uso de RLHF o DPO, ni tecnicas de decodificacion, algo coherente con un modelo de reranking que no realiza generacion autoregresiva. La perdida empleada, CachedMultipleNegativesRankingLoss, es una variante de contrastive learning con cache de representaciones que permite aumentar el numero efectivo de negativos por paso sin incrementar proporcionalmente el uso de memoria, un esquema habitual en el entrenamiento de recuperadores y rerankers densos.

La innovacion principal procede del modelo base: ModernBERT es un encoder modernizado que incorpora mejoras de eficiencia respecto a BERT clasico (entre ellas atencion alterna local y global, embeddings rotatorios y mecanismos de unpadding), segun la documentacion publica de answerdotai; la model card de este reranker no reproduce esos detalles, solo declara la arquitectura de la cabeza de clasificacion. En la practica, lo relevante para el uso es que hereda la ventana de 8192 tokens del base, muy superior a los 512 tokens tipicos de los cross-encoders de la generacion anterior, y que el fine-tuning se hizo sobre 64538 ejemplos de ms_marco con la libreria sentence-transformers, lo que produce un modelo especializado en relevancia consulta-documento en el dominio de pasajes web.

## Capacidades

- Puntuar pares de textos y devolver una puntuacion de relevancia unica, apta para reordenar listas de resultados.
- Reranking de resultados de busqueda sobre candidatos previamente recuperados por un modelo bi-encoder o por busqueda lexica (BM25, por ejemplo).
- Manejo de pares consulta-documento de hasta 8192 tokens en conjunto, sin necesidad de truncar pasajes largos.
- Integracion nativa con la libreria sentence-transformers mediante la clase CrossEncoder.
- Compatibilidad declarada con text-embeddings-inference y con despliegue en endpoints.
- Uso como componente de pipelines de RAG para filtrar y ordenar los fragmentos recuperados antes de pasarlos a un modelo generativo.
- No soporta generacion de texto: es un modelo discriminativo de scoring, no un modelo de lenguaje causal.
- No se declara soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.
- No se declara soporte multilingue; el unico dataset de entrenamiento indicado es ms_marco.

## Casos de uso

- Reranking en sistemas de busqueda semantica: se recuperan entre 50 y 100 pasajes con un bi-encoder y se reordenan con este cross-encoder, aprovechando su ventana de 8192 tokens para no truncar documentos largos y mejorar la precision en las primeras posiciones, que es donde las metricas de reordenacion tienen mas impacto.
- Pipeline de RAG sobre documentacion tecnica: tras la recuperacion inicial, el modelo puntua cada fragmento frente a la pregunta del usuario y se seleccionan solo los mejor valorados, reduciendo el ruido que se inyecta en el prompt del modelo generativo y, con ello, el riesgo de respuestas incorrectas.
- Busqueda interna en bases de conocimiento corporativas: reordenar resultados de un indice existente sin reindexar todo el corpus, ya que el cross-encoder solo actua sobre los candidatos devueltos y no requiere recalcular embeddings almacenados.
- Filtrado de resultados en comercio electronico: puntuar pares (consulta del comprador, descripcion de producto) para ordenar listas de productos, con la ventaja de que las descripciones largas caben en la ventana de contexto sin recortes.
- Deduplicacion y seleccion de evidencia en tareas de verificacion: dado un conjunto de pasajes candidatos, usar la puntuacion de relevancia para priorizar los mas pertinentes frente a una afirmacion, como paso previo a un sistema de fact-checking.
- Evaluacion de calidad de conjuntos de datos de recuperacion: emplear el modelo como juez automatico de relevancia consulta-pasaje para etiquetar o auditar datasets de entrenamiento de recuperadores, dado su bajo coste de inferencia por par.
- Soporte a busquedas legales o medicas con documentos extensos: el limite de 8192 tokens permite incluir contratos, informes o articulos completos como documento candidato, algo inviable con rerankers de 512 tokens.
- Reranking multietapa en motores de busqueda: usarlo como segunda etapa tras un filtro rapido, ya que su coste computacional es lineal con el numero de pares a puntuar y por tanto conviene reservarlo para el conjunto reducido de candidatos.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en el model-index de la model card. Todos ellos figuran con `verified: false`, es decir, no han sido verificados de forma independiente. Las tareas son de reordenacion cross-encoder sobre variantes reducidas de BEIR (`R100` indica una lista de 100 candidatos por consulta).

| Dataset | MAP | MRR@10 | NDCG@10 |
|---|---|---|---|
| NanoMSMARCO R100 | 0.5242 | 0.5187 | 0.5963 |
| NanoNFCorpus R100 | 0.3516 | 0.5547 | 0.3834 |
| NanoNQ R100 | 0.5720 | 0.5736 | 0.6339 |
| NanoBEIR R100 (media) | 0.4826 | 0.5490 | 0.5379 |

La model card no incluye comparaciones directas contra otros rerankers, ni resultados sobre BEIR completo, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,6 GB solo de pesos (149,6 millones de parametros); en FP16/BF16, unos 0,3 GB; en INT8, alrededor de 0,15 GB. A esto hay que sumar memoria de activaciones, que crece con el tamano de lote y, de forma notable, con la longitud de secuencia hasta 8192 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo con comodidad en FP16; una RTX 4090, RTX 3090, A100 o H100 permiten lotes grandes y maximizan el throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (por ejemplo, RTX 3060 en adelante) e incluso en CPU para volumenes bajos, dado el reducido numero de parametros.
- Opciones de despliegue: sentence-transformers para uso directo en Python; text-embeddings-inference para servir el modelo via API compatible con endpoints; vLLM no aplica al no ser un modelo generativo; los formatos GGUF y Ollama no estan declarados en la informacion disponible, aunque la conversion a otros formatos de inferencia es viable por tratarse de un encoder estandar.
- Latencia y throughput: no se han publicado cifras en la informacion disponible. Cabe esperar un coste aproximado lineal con el numero de pares a puntuar y creciente con la longitud de cada par, por lo que en produccion conviene limitar el reranking a los 50-200 candidatos mejor recuperados en lugar de aplicarlo sobre el corpus completo.
- Consideracion de escalado: al ser un cross-encoder, la puntuacion no es precalculable; cada consulta requiere una pasada por cada documento candidato, a diferencia de los bi-encoders, cuyo coste de recuperacion es sublineal gracias a indices vectoriales.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados comparativos de rendimiento frente a otros rerankers, por lo que las cifras de rendimiento de la columna correspondiente no estan disponibles. Las caracteristicas de los modelos alternativos que se listan a continuacion son datos de referencia general, no extraidos de la informacion facilitada.

| Modelo | Parametros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| kwondw/reranker-msmarco-v1.1-ModernBERT-base-cmnrl | 149,6 M | 8192 tokens | No disponible | Datos propios en la tabla de benchmarks; sin comparacion directa publicada |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | Aprox. 22,7 M (referencia general) | 512 tokens (referencia general) | Apache 2.0 (referencia general) | No disponible en la informacion proporcionada |
| BAAI/bge-reranker-base | Aprox. 278 M (referencia general) | 512 tokens (referencia general) | MIT (referencia general) | No disponible en la informacion proporcionada |
| BAAI/bge-reranker-v2-m3 | Aprox. 568 M (referencia general) | 8192 tokens (referencia general) | Apache 2.0 (referencia general) | No disponible en la informacion proporcionada |

Frente a estas alternativas, la ventaja diferencial de este modelo es la combinacion de un tamano contenido (aproximadamente 150 millones de parametros) con una ventana de 8192 tokens, lo que lo situa en un punto intermedio entre los rerankers ligeros de 512 tokens y los modelos multilingues de mayor tamano. La ausencia de licencia declarada es, sin embargo, una desventaja clara frente a alternativas con licencias permisivas conocidas.

## Limitaciones y advertencias

- Licencia no declarada: la model card deja el campo de licencia como desconocido, por lo que no hay garantia explicita de uso comercial. Es imprescindible contactar con el autor o consultar la pagina del modelo antes de integrarlo en un producto.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo ni la composicion linguistica de ms_marco. El rendimiento en castellano no esta documentado y requiere validacion propia.
- Metricas no verificadas: los cuatro resultados de benchmark figuran con `verified: false`; son valores declarados por el autor y no reproducidos de forma independiente.
- Dominio de entrenamiento limitado: el unico dataset indicado es ms_marco, orientado a pasajes web en ingles, lo que puede degradar el rendimiento en dominios especializados (medicina, derecho, documentacion tecnica) sin fine-tuning adicional.
- Coste de inferencia no indexable: al ser un cross-encoder, obliga a puntuar cada par consulta-documento, lo que impide precalcular puntuaciones y limita su uso a etapas de reordenacion sobre conjuntos reducidos de candidatos.
- Salida no calibrada: el modelo devuelve un unico logit sin capa de calibracion documentada, por lo que las puntuaciones no deben interpretarse como probabilidades de relevancia absolutas sin un ajuste previo.
- Limite practico de contexto: aunque la ventana es de 8192 tokens, consulta y documento comparten esa longitud, de modo que pares muy largos pueden seguir requiriendo truncado.
- Riesgo de sesgo: no se documenta ningun analisis de sesgos ni de equidad en la model card, algo relevante si el modelo se usa para ordenar contenido que afecta a personas.
- Sin informacion de procedencia de datos mas alla del nombre del dataset: no se detalla la composicion de ms_marco usada, el numero de tokens ni el proceso de filtrado, lo que dificulta auditar posibles sesgos o contaminaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kwondw/reranker-msmarco-v1.1-ModernBERT-base-cmnrl
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Documentacion de sentence-transformers: https://sbert.net
- Documentacion de CrossEncoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Listado de cross-encoders en HuggingFace: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia citado en las etiquetas del modelo (Sentence-BERT): https://arxiv.org/abs/1908.10084

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el proyecto; los resultados obtenidos eran paginas sin relacion con el ambito tecnico tratado, por lo que no se incluyen.
