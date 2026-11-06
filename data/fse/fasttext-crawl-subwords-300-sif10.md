# fse/fasttext-crawl-subwords-300-sif10

## Resumen

`fse/fasttext-crawl-subwords-300-sif10` es un modelo de embeddings estáticos de frases publicado por el usuario `fse` en Hugging Face. No es un transformer generativo: es una tabla de 2.000.000 de filas × 300 dimensiones en float32 (1.217.845.063 parámetros reales según safetensors) que, combinada con un tokenizador específico (`fse_words@1`) y un paso de normalización, produce un vector por texto calculando la media de las filas de sus tokens y normalizando a longitud unitaria. Deriva del modelo gensim `fse/fasttext-crawl-subwords-300`, a su vez basado en los word vectors de fastText English de Facebook.

La variante `-sif10` aplica ponderación SIF (Smooth Inverse Frequency, con a=0.001) sobre las frecuencias de wordfreq 3.1.1 y elimina diez componentes principales no centrados ajustados sobre un corpus de entrenamiento de 859.346 párrafos extraídos de `HuggingFaceFW/fineweb-edu-llama3-annotations`. El resultado se pliega en la tabla, de modo que en inferencia solo hay que hacer media ponderada, normalización y consulta de tabla, sin ninguna pasada por red neuronal.

Es relevante ahora por su coste de inferencia prácticamente nulo y por la mejora medida en STS-B: la media simple (raw) obtiene 48,52845 Pearson×100, mientras que SIF-10 alcanza 72,40582 sobre los mismos 1.379 pares de test. Está pensado para pipelines de simulación de similitud, recuperación densa de bajo coste y baselines de sentence embeddings donde no se justifica el coste de un transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (tabla de lookup + media de tokens + normalización; n-gramas fastText con bucket 2.000.000, min_n=4, max_n=4) |
| Parametros totales | 1.217.845.063 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sin ventana de atención; procesa el texto completo como bolsa de tokens) |
| Tipos de cuantizacion | float32 (por defecto), float16, int8 (redondeo de almacenamiento; fse calcula siempre en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-3.0 (con ShareAlike; los términos de los datos de frecuencia de wordfreq también aplican) |
| Formato de pesos | safetensors (librería `fse` >= 2.0) |

## Arquitectura y entrenamiento

El modelo no entrena una red neuronal en el momento de la conversión: parte de los word vectors de fastText English (Facebook, CC BY-SA 3.0) y los convierte a una tabla safetensors compatible con la librería `fse`. La tabla tiene 2.000.000 de filas (vocabulario) de 300 dimensiones en float32, con un tokenizador `fse_words@1` y un paso `normalize@1` que normaliza cada vector a longitud unitaria. Los n-gramas de subpalabras siguen la configuración fastText con bucket de 2.000.000 y n entre 4 y 4.

La parte SIF se prepara offline: los pesos por palabra son `a/(a+p(w))` con `a=0.001`, usando frecuencias de la best-list inglesa de wordfreq 3.1.1 convertidas a conteos enteros sobre 2**31-1 con valor por defecto 1e-8 y normalizadas en float32. Sobre el corpus de `fineweb-edu-llama3-annotations` (revisión `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`, 859.346 párrafos de entrenamiento, semilla 0, checksum del corpus tokenizado `xxh3-128:88146a7f61a2c157c4710cfaf3e0cb4b`) se ajustan diez componentes principales no centrados, que se pliegan en la tabla ponderada. La cuantización se aplica después del plegado. No hay RLHF, DPO ni decodificación especulativa: es un modelo puramente de extracción de características.

## Capacidades

- Extracción de embeddings de frases: codifica una lista de textos en vectores de 300 dimensiones normalizados a longitud unitaria.
- Similitud semántica y recuperación densa de bajo coste: adecuado para búsqueda por similitud coseno y ranking.
- Manejo de palabras fuera de vocabulario mediante n-gramas de subpalabras de fastText (n=4, bucket 2.000.000).
- Ponderación SIF opcional para mejorar la calidad de la representación de frases frente a la media simple.
- Salida configurable: `normalize=True` (por defecto) o `normalize=False` para obtener la media ponderada cruda y poder plegar una cabeza lineal.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Multilingüe: no; solo inglés (`en`).

## Casos de uso

- Búsqueda semántica de bajo coste: indexar un corpus grande con vectores de 300 dimensiones y hacer recuperación por similitud coseno sin GPU, aprovechando que la inferencia es solo lookup de tabla y media.
- Deduplicación y clustering de documentos: agrupar textos similares en pipelines de limpieza de datos, donde la latencia y el coste importan más que la precisión de un transformer.
- Baseline para evaluación de sentence embeddings: usar la puntuación STS-B SIF-10 (72,40582 Pearson×100) como referencia contra la que comparar modelos neuronales en tareas de similitud.
- Clasificación de texto con cabeza lineal: cargar con `normalize=False`, plegar una cabeza lineal en la tabla y obtener un clasificador de coste casi nulo para etiquetado temático o filtrado.
- Filtrado previo en pipelines RAG: como primera etapa de recuperación barata antes de un reranker neuronal, reduciendo el número de candidatos que pasan al modelo caro.
- Sistemas con restricciones de memoria o CPU: despliegue en entornos sin GPU donde un transformer no cabe, usando float16 o int8 para reducir el tamaño del repo de 4,8 GB.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| STS-B Pearson×100 (raw float32) | 48,52845 |
| STS-B Pearson×100 (SIF-10 float32) | 72,40582 |
| Diferencia vs SIF-10 float32 mismo método | +0,00000 |
| Recall@10 vs SIF-10 float32 mismo método | 1,000000 |
| STS-B Pearson×100 con tokenizador por defecto | 72,40582 |
| Bytes del fichero del modelo | 4.831.846.546 |

La comparación controlada de STS-B usa el preprocesado NLTK del notebook de la versión 1.x mediante una vista de tokenizador externo sobre la misma tabla. Recall@10 compara cada una de las 2.758 filas de frases de STS-B contra todas las demás, excluyendo la propia y resolviendo empates por índice de fila. El autor advierte que el corpus de componentes se seleccionó guiándose por STS-B Pearson, STS-B Spearman y NanoBEIR macro nDCG@10, por lo que esas puntuaciones no son estimaciones limpias sobre holdout.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 4,8 GB en float32; en float16 e int8 el tamaño se reduce según el redondeo de almacenamiento medido por el autor (no se publican cifras concretas de VRAM).
- GPU recomendadas: no requiere GPU; la inferencia es lookup de tabla y aritmética vectorial, por lo que CPU es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con memoria suficiente para la tabla en el formato elegido (por ejemplo, RTX 4090 para float32 holgado; GPUs de 8 GB o menos en float16/int8).
- Opciones de despliegue: librería `fse` >= 2.0 (`fse.Encoder.from_pretrained`); también se referencia uso con fastText según Hugging Face.
- Latencia y throughput: no disponible; el autor declara explícitamente que no se hace ninguna afirmación de velocidad ni de tiempo de carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | STS-B Pearson×100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fse/fasttext-crawl-subwords-300-sif10 | 1.217.845.063 | no disponible | 72,40582 (SIF-10) | cc-by-sa-3.0 | Hugging Face |
| fse/fasttext-crawl-subwords-300 (base) | no disponible | no disponible | no disponible | cc-by-sa-3.0 | Hugging Face |
| fastText English word vectors (Facebook) | no disponible | no disponible | no disponible | CC BY-SA 3.0 | fasttext.cc |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento queda limitada a la variante SIF-10 de este modelo.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Modelo estático sin contexto: la representación es una bolsa de tokens ponderada; no captura orden, negación ni dependencias sintácticas como un transformer.
- Riesgo de sesgo: hereda los sesgos de los word vectors de fastText English y de las frecuencias de wordfreq.
- Alucinación: no aplica en el sentido generativo (no produce texto), pero la similitud puede dar falsos positivos en textos con solapamiento léxico.
- Licencia CC BY-SA 3.0 con ShareAlike: los trabajos derivados deben mantener la misma licencia; los términos de los datos de frecuencia de wordfreq (incluido material CC BY-SA 4.0) también aplican y el campo de licencia de los vectores fuente no renuncia a ellos.
- Atribución obligatoria a Facebook (fastText English word vectors) y a wordfreq de Robyn Speer; Facebook no avala esta conversión.
- Las puntuaciones de STS-B y NanoBEIR guiaron la selección del corpus, por lo que no son estimaciones limpias sobre holdout.
- Sin afirmaciones de velocidad ni de tiempo de carga por parte del autor.
- Requiere `fse` >= 2.0; el sufijo `-raw` significa sin ponderación SIF, no sin normalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/fasttext-crawl-subwords-300-sif10
- Ficheros del repositorio: https://huggingface.co/fse/fasttext-crawl-subwords-300-sif10/tree/main
- Modelo base en Hugging Face: https://huggingface.co/fse/fasttext-crawl-subwords-300
- Repositorio fse (Fast Sentence Embeddings): https://github.com/oborchers/Fast_Sentence_Embeddings
- fastText English word vectors: https://fasttext.cc/docs/en/english-vectors.html
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- wordfreq (Robyn Speer): https://github.com/rspeer/wordfreq
- NOTICE de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
