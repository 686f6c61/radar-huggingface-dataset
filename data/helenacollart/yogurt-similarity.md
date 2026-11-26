# helenacollart/yogurt-similarity

## Resumen

Yogurt-similarity es un modelo de embeddings de frases publicado por el usuario helenacollart en Hugging Face, obtenido mediante fine-tuning del modelo multilingue `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. Su proposito declarado, a partir de los ejemplos de la model card, es calcular la similitud semantica entre listas de ingredientes de productos lacteos (yogures) en varios idiomas, de modo que el modelo puede emparejar descripciones equivalentes expresadas en castellano, frances, ingles o portugues aunque el orden y la formulacion de los ingredientes difieran.

El modelo resuelve un problema muy concreto de normalizacion y deduplicacion de catalogo de producto: identificar cuando dos fichas de ingredientes corresponden al mismo producto o a variantes muy cercanas, pese a diferencias de idioma, marcas, abreviaturas y ruido de OCR. Se trata de un modelo denso de tipo bi-encoder, derivado de una arquitectura BERT MiniLM de 12 capas y 117.653.760 parametros totales, con salida de embedding de 384 dimensiones (heredada del modelo base).

Es relevante ahora porque demuestra el patron de adaptacion de un sentence-transformer multilingue generico a un dominio vertical con un conjunto de datos pequeno (785 pares de entrenamiento) y una funcion de perdida MultipleNegativesRankingLoss, un enfoque de coste bajo que puede replicarse para otros dominios de catalogo. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, no declara licencia ni lista de idiomas, y no publica resultados de evaluacion, por lo que su uso en produccion debe considerarse experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (BERT MiniLM, 12 capas), heredado de sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |
| Parametros totales | 117.653.760 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base MiniLM admite tipicamente 128-512 tokens; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u ONNX) |
| Idiomas soportados | no disponibles declarados; los ejemplos de la model card cubren castellano, frances, ingles y portugues |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del embedding | no declarada explicitamente; el modelo base produce vectores de 384 dimensiones |
| Funcion de perdida de entrenamiento | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 785 pares |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un bi-encoder denso construido sobre `paraphrase-multilingual-MiniLM-L12-v2`, un transformer BERT MiniLM de 12 capas y aproximadamente 118 millones de parametros, entrenado originalmente por el equipo de Sentence Transformers para similitud semantica multilingue. El fine-tuning se realizo con la libreria sentence-transformers y la perdida `MultipleNegativesRankingLoss`, que entrena el modelo con pares positivos (frases equivalentes) y utiliza el resto de frases del lote como negativos implicitos, una tecnica estandar y eficiente para ajustar embeddings con pocos datos.

El conjunto de entrenamiento consta de 785 pares, segun la etiqueta `dataset_size:785` de la model card. No se documenta el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; en un modelo de embeddings estos procedimientos no aplican de la forma habitual. La innovacion tecnica se limita a la especializacion de dominio: el modelo aprende a alinear descripciones de ingredientes de yogur entre idiomas, incluyendo variantes ortograficas y ruido tipico de etiquetas de producto (por ejemplo, "yoghourt", "yaourt", "logurte"). No se declaran tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de embeddings de frases para similitud semantica (pipeline `sentence-similarity`).
- Extraccion de caracteristicas densas (`feature-extraction`) para tareas de recuperacion y clustering.
- Comparacion de listas de ingredientes de productos lacteos entre castellano, frances, ingles y portugues, segun los ejemplos de la model card.
- Emparejamiento de descripciones con ruido de OCR, abreviaturas y variaciones ortograficas.
- Uso como retriever en pipelines de busqueda semantica o deduplicacion de catalogo.
- Compatibilidad con Text Embeddings Inference (etiqueta `text-embeddings-inference`) y con endpoints compatibles.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso, vision ni audio; no es un modelo generativo.

## Casos de uso

- Deduplicacion de catalogo de producto: calcular la similitud coseno entre embeddings de fichas de ingredientes para detectar registros que describen el mismo yogur con distinta formulacion o idioma, reduciendo duplicados en bases de datos de retail.
- Normalizacion multilingue de etiquetas: agrupar fichas en castellano, frances y portugues de un mismo producto para consolidar un catalogo europeo unico, aprovechando la herencia multilingue del modelo base.
- Busqueda semantica en catalogo: indexar embeddings de ingredientes y permitir consultas en lenguaje natural ("yogur griego con fresa sin edulcorantes") que recuperen productos equivalentes aunque la formulacion no coincida literalmente.
- Enriquecimiento de datos de scraping: emparejar fichas extraidas de webs de supermercados con registros maestros, tolerando ruido de OCR y variaciones de formato en las listas de ingredientes.
- Control de calidad de etiquetado: comparar la ficha de ingredientes declarada por el fabricante con la version en tienda para detectar discrepancias de formulacion entre lotes o reformulaciones.
- Analisis de surtido y competencia: agrupar productos por similitud de ingredientes para estudiar sustitutos y solapamientos entre marcas, con un coste de inferencia bajo al tratarse de un modelo de 118 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (por ejemplo, correlacion de Spearman, accuracy de recuperacion o MTEB) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP32: aproximadamente 0,5 GB de pesos, mas overhead de activaciones; en la practica cabe en cualquier GPU consumer.
- En FP16 o BF16, el modelo ocupa alrededor de 0,25 GB, por lo que es viable incluso en CPU para cargas por lotes pequenas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090); para alto throughput, A10G, L4, A100 o H100 con procesamiento por lotes.
- Cabe en GPU consumer sin problemas, incluidas integradas con suficiente memoria compartida para lotes pequenos.
- Opciones de despliegue: sentence-transformers (Python), Text Embeddings Inference (TGI para embeddings), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), ONNX Runtime si se exporta manualmente. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles; al ser un MiniLM de 12 capas, se espera un throughput alto (miles de frases por segundo en GPU moderna con lotes), pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| helenacollart/yogurt-similarity | 117,6 M | no disponible | no declarados (ejemplos en es, fr, en, pt) | no disponible | Fine-tuning de dominio con 785 pares; sin benchmarks publicados |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | no disponible | multilingue (modelo base) | Apache 2.0 (segun el modelo original) | Modelo generalista; el yogurt-similarity parte de el |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | no disponible | principalmente ingles | Apache 2.0 | Mas pequeno y rapido, pero no multilingue ni especializado en dominio |
| BAAI/bge-m3 | ~568 M | hasta 8192 tokens | multilingue | MIT (segun el modelo original) | Mayor capacidad y contexto, con coste de inferencia superior |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no hay datos de rendimiento comparativo para yogurt-similarity.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial no esta garantizado y requiere contactar con el autor.
- No se declaran los idiomas soportados oficialmente; la cobertura multilingue se infiere de los ejemplos de la model card y del modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni de calidad en el dominio.
- Entrenado con solo 785 pares, lo que aumenta el riesgo de sobreajuste al vocabulario y estilo de las fichas de yogur utilizadas.
- Dominio muy estrecho: su rendimiento fuera de descripciones de ingredientes lacteos es incierto.
- Riesgo de falsos positivos en similitud: productos con ingredientes parecidos pero formulaciones distintas pueden quedar demasiado proximos en el espacio de embeddings.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No es un modelo generativo; no soporta tool calling, agentes ni razonamiento multi-paso.
- La longitud de contexto no esta declarada; para listas de ingredientes muy largas conviene verificar el truncamiento del tokenizador del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helenacollart/yogurt-similarity
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Libreria sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
