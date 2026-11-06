# fse/fasttext-crawl-subwords-300-raw

## Resumen

`fse/fasttext-crawl-subwords-300-raw` es un modelo de embeddings estáticos de frases derivado de los vectores de palabras fastText English crawl subwords de Facebook. No es un modelo generativo ni un transformer: se trata de una tabla de 2.000.000 de filas por 300 dimensiones en float32, junto con un tokenizador de palabras y ngramas de caracteres de fastText, empaquetada en formato safetensors para su uso con la librería fse (Fast Sentence Embeddings) 2.0 o superior. El autor del artefacto es el usuario `fse`, que publica esta conversión como parte de una familia de seis repositorios derivados del modelo original de gensim `fse/fasttext-crawl-subwords-300`.

El problema que resuelve es el de obtener representaciones de frases de coste muy bajo (una media de los vectores de token, con normalización a longitud unitaria) sin necesidad de GPU ni de inferencia neuronal. Frente a los modelos de embeddings contextuales, esta aproximación sacrifica calidad semántica a cambio de latencia mínima, determinismo y un consumo de memoria fijo y predecible. Es relevante ahora como línea base reproducible y como componente barato en pipelines de recuperación léxica o de preprocesado, no como sustituto de un encoder contextual.

La información disponible es limitada: la model card es escueta, no hay datos de entrenamiento propios (los vectores provienen del corpus crawl de fastText), no se publican benchmarks más allá de una evaluación interna sobre STS-B y el modelo solo declara soporte para inglés. El número de parámetros reportado por safetensors (1.217.845.063) corresponde al total de elementos almacenados en la tabla, no a pesos de una red neuronal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos (tabla de lookup + ngramas fastText), sin transformer |
| Parámetros totales | 1.217.845.063 elementos en la tabla (safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sin atención; el pooling se aplica sobre todos los tokens de la entrada) |
| Tipos de cuantización | float32 (nativo), float16, int8 (calculados en float32 por fse) |
| Idiomas soportados | en |
| Licencia | cc-by-sa-3.0 (incluye ShareAlike) |
| Formato de pesos | safetensors (librería fse) |

Otros datos de la model card: 2.000.000 de filas de vocabulario, 300 dimensiones, tokenizador `fse_words@1`, pasos por fila `normalize@1`, ngramas fastText con `bucket=2000000`, `min_n=4`, `max_n=4`, huella `xxh3-128:4d9f5f4df07caebb5960acdaf7fddaa6` y tamaño de fichero de 4.831.846.546 bytes.

## Arquitectura y entrenamiento

El modelo no entrena una red neuronal en esta conversión: hereda los vectores de palabras de fastText English crawl subwords, publicados por Facebook, y los reorganiza en una tabla de embeddings estáticos. La representación de una frase se obtiene promediando las filas correspondientes a los tokens de la entrada y normalizando el vector resultante a longitud unitaria (`normalize@1`). El tokenizador `fse_words@1` combina palabras con ngramas de caracteres de longitud fija entre 4 y 4, con 2.000.000 de buckets, lo que permite derivar vectores para palabras fuera de vocabulario a partir de sus subcadenas.

La model card menciona una variante SIF-10 que aplica una ponderación de frecuencia fija y eliminación de la componente principal del corpus de entrenamiento, pero este repositorio concreto es la variante `raw` (media simple). No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del corpus, ni si hubo ajuste con RLHF/DPO, ni innovaciones de decodificación especulativa o atención lineal, ya que no aplican a esta arquitectura. Los cambios declarados respecto al original son: conversión a safetensors de fse, media y normalización de frase, y redondeo de almacenamiento en las variantes float16 e int8.

## Capacidades

- Extracción de features a nivel de frase: produce un vector de 300 dimensiones por texto de entrada mediante media y normalización.
- Embeddings de palabras y de subpalabras: los ngramas de caracteres de fastText permiten generar vectores para términos fuera de vocabulario.
- Representación determinista y sin muestreo: la misma entrada produce siempre el mismo vector.
- Similitud semántica aproximada mediante coseno, adecuada para búsqueda léxica y solapamiento de vocabulario.
- Multilingüismo: no disponible; el modelo declara únicamente inglés.
- Tool calling / function calling: no soportado (no es un modelo generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Modo thinking, visión, audio: no disponible.
- Selección de formato de almacenamiento (float32, float16, int8) con cálculo interno en float32.

## Casos de uso

- Búsqueda léxica y recuperación de candidatos en pipelines RAG: usar el modelo como primer recuperador barato sobre un índice de vectores de 300 dimensiones, y reservar un encoder contextual para la reordenación posterior. Su coste fijo y su naturaleza determinista lo hacen adecuado para filtrar grandes volúmenes antes de etapas más caras.
- Deduplicación y agrupamiento de documentos: calcular el vector medio de cada documento y agrupar por similitud de coseno para detectar duplicados casi exactos o near-duplicates en corpus web, con un coste de memoria predecible de 4,8 GB para la tabla completa.
- Clasificación de texto con modelos lineales: servir como extractor de features congelado para un clasificador logístico o SVM en tareas de moderación, etiquetado de tópicos o enrutamiento de tickets, entrenando solo la cabeza.
- Línea base reproducible en evaluación de embeddings: el modelo publica una puntuación controlada en STS-B (Pearson ×100 de 48,52845 con el tokenizador por defecto) que sirve como referencia mínima frente a la que medir encoders contextuales.
- Preprocesado y enriquecimiento en pipelines NLP: generar representaciones para clustering exploratorio, visualización con t-SNE/UMAP o cálculo de similitudes en tiempo real en entornos sin GPU.
- Sistemas con restricciones de latencia y hardware: despliegue en CPU en servicios de alta concurrencia donde un transformer no es viable, aprovechando que la inferencia es una suma de filas de tabla y una normalización.
- Detección de similitud entre consultas de usuario y catálogos de productos o FAQs, como capa de recuperación previa a un modelo generativo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son internos del autor sobre el conjunto de test de STS-B (1.379 pares) y comparan métodos y formatos de almacenamiento del propio modelo, no frente a otros modelos:

| Métrica | Valor |
|---|---|
| STS-B Pearson ×100 (raw, float32, tokenizador por defecto) | 48,52845 |
| STS-B Pearson ×100 (SIF-10, float32) | 72,40582 |
| Diferencia frente a float32 del mismo método (puntos) | +0,00000 |
| Recall@10 frente a float32 del mismo método | 1,000000 |
| Bytes del fichero del modelo | 4.831.846.546 |

No se han publicado resultados de benchmarks frente a modelos comparables en la información disponible. La comparación STS-B controlada usa el preprocesado NLTK del notebook 1.x a través de una vista con tokenizador externo de la misma tabla. No se hacen afirmaciones sobre velocidad de carga o de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; la tabla completa en float32 ocupa aproximadamente 4,8 GB de memoria (4.831.846.546 bytes de fichero). Con float16 o int8 el autor indica que se reduce el tamaño, pero no publica las cifras exactas de ahorro.
- GPU recomendadas: no aplica; cualquier GPU con suficiente memoria podría alojar la tabla, pero el modelo está pensado para CPU.
- Cabe en GPU de consumo: sí, en términos de memoria (una RTX 4090 con 24 GB alojaría la tabla float32 holgadamente), aunque no aporta ventaja frente a CPU.
- Cabe en CPU: sí, con 5-6 GB de RAM disponibles para la tabla en float32; para entornos con menos memoria habría que recurrir a las variantes float16 o int8.
- Opciones de despliegue: librería fse 2.0 o superior (`fse.Encoder.from_pretrained`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no hace afirmaciones de velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones | Vocabulario / tabla | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|---|
| fse/fasttext-crawl-subwords-300-raw | Embeddings estáticos de frase (media + normalización) | 300 | 2.000.000 filas + ngramas 4-4, 2.000.000 buckets | en | cc-by-sa-3.0 | no disponible |
| fse/fasttext-crawl-subwords-300 (origen, gensim) | Embeddings estáticos de palabras | 300 | mismo origen fastText | en | cc-by-sa-3.0 | no disponible |
| fastText English crawl subwords (Facebook) | Embeddings estáticos de palabras | 300 | vocabulario crawl con subwords | en | cc-by-sa-3.0 | no disponible |
| Encoders contextuales tipo sentence-transformers (p. ej. all-MiniLM-L6-v2) | Transformer bi-encoder | 384 | red neuronal | multilingüe o en según variante | según modelo | 256-512 tokens típicamente |

La comparación con encoders contextuales es cualitativa: la información disponible no incluye resultados de este modelo frente a ellos. La ventaja de esta familia es el coste fijo y la ausencia de GPU; la desventaja es la pérdida de información de orden y contexto, reflejada en el Pearson de 48,5 en STS-B frente a los valores típicamente superiores de los bi-encoders neuronales, para los que no se aportan cifras en esta ficha.

## Limitaciones y advertencias

- No captura orden de palabras ni contexto: la media de vectores pierde la estructura sintáctica, lo que limita tareas de desambiguación y negación.
- Calidad semántica moderada: el propio autor reporta un Pearson ×100 de 48,52845 en STS-B para la variante raw, muy por debajo de lo esperable en encoders contextuales.
- Solo inglés: no hay soporte declarado para otros idiomas, y los vectores provienen de un corpus crawl en inglés.
- Riesgo de sesgos heredados: los vectores de fastText se entrenan sobre texto web crawl, por lo que arrastran sesgos demográficos, culturales y de dominio presentes en ese corpus; no se documenta ninguna mitigación.
- Riesgo de similitud espuria: palabras con subcadenas compartidas pueden quedar próximas aunque no estén relacionadas semánticamente, efecto de los ngramas de caracteres.
- Licencia cc-by-sa-3.0 con ShareAlike: el uso comercial es posible, pero las obras derivadas deben distribuirse bajo la misma licencia, lo que puede condicionar productos propietarios que incorporen los vectores.
- Atribución obligatoria a Facebook como autor de los vectores originales; Facebook no avala esta conversión.
- Dependencia de la librería fse 2.0 o superior: no es compatible con el ecosistema transformers estándar ni con servidores de inferencia habituales.
- Sin garantías de velocidad ni de carga: el autor no publica métricas de latencia ni de throughput.
- Fecha de creación del repositorio (2026-11-01) y cero descargas: ecosistema y validación externa inexistentes en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fse/fasttext-crawl-subwords-300-raw
- Modelo base (gensim): https://huggingface.co/fse/fasttext-crawl-subwords-300
- Repositorio de la librería fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Vectores originales fastText English: https://fasttext.cc/docs/en/english-vectors.html
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- Paper de fastText (referencia de los vectores de origen): no disponible en la información proporcionada.
