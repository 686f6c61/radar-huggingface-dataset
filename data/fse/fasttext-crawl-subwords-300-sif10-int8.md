# fse/fasttext-crawl-subwords-300-sif10-int8

## Resumen

`fse/fasttext-crawl-subwords-300-sif10-int8` es un modelo de embeddings estáticos de frases publicado por el usuario `fse`, derivado de los vectores de palabras FastText English de Facebook (crawl-subwords-300). No es un transformer generativo: es una tabla de 2.000.000 de filas por 300 dimensiones almacenada en int8, sobre la que se aplica una media ponderada de los vectores de token y una normalización a longitud unitaria. El repositorio ocupa 1,2 GB y declara 1.221.845.063 parámetros en safetensors, coherente con una tabla de 2M x 300 más los buckets de n-gramas.

La variante `sif10` aplica Smooth Inverse Frequency (SIF) con `a=0.001` y elimina diez componentes principales ajustados sobre un corpus de entrenamiento de 859.346 párrafos de `HuggingFaceFW/fineweb-edu-llama3-annotations`. La cuantización a int8 se realiza después del plegado de pesos y componentes, de modo que el modelo devuelve exactamente los vectores de la tabla cuantizada, no los del modelo float32 original. Según la model card, la diferencia medida en STS-B frente a la misma variante en float32 es de +0,00051 puntos de Pearson x100, con un Recall@10 de 0,995975.

Su relevancia es acotada pero clara: ofrece un encoder de frases extremadamente ligero, sin atención ni decodificación autoregresiva, pensado para búsqueda semántica, deduplicación y clasificación por similitud en CPU, con una licencia CC BY-SA 3.0 que obliga a compartir igual. Requiere la librería `fse>=2.0` y no es compatible con `sentence-transformers`, `transformers` ni `vLLM`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Embeddings estáticos de palabras con n-gramas FastText y pooling de frase (media SIF + normalización L2); no es un transformer |
| Parámetros totales | 1.221.845.063 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo sin ventana de atención; el pooling se aplica sobre todos los tokens de la entrada) |
| Tipos de cuantización | int8 (tabla almacenada); el autor indica que también existen variantes float32 y float16 del mismo método |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY-SA 3.0 (ShareAlike) |
| Formato de pesos | safetensors (librería `fse`) |
| Vocabulario (filas) | 2.000.000 |
| Dimensiones | 300 (int8) |
| N-gramas FastText | bucket 2.000.000, min_n 4, max_n 4 |
| Tokenizador | `fse_words@1` |
| Método de pooling | `normalize@1` sobre media SIF-10 |
| Fingerprint | `xxh3-128:075213b2d66190094fb9dc35b84e2f35` |
| Modelo base | `fse/fasttext-crawl-subwords-300` (relación: quantized) |

## Arquitectura y entrenamiento

El modelo no contiene capas neuronales entrenadas de extremo a extremo. La base son los vectores FastText English crawl-subwords-300 de Facebook, que combinan vectores de palabras con n-gramas de caracteres de tamaño 4 (bucket de 2.000.000) para cubrir palabras fuera de vocabulario. Sobre esa tabla, el pipeline de `fse` aplica pesos SIF `a/(a+p(w))` con `a=0.001`, calcula la media ponderada de los vectores de la frase y normaliza el resultado a norma unitaria.

La preparación SIF es offline y está documentada con recibos de integridad: frecuencias de `wordfreq` 3.1.1 (lista `best` para inglés, convertidas a enteros sobre 2^31-1 con valor por defecto 1e-8), corpus de componentes `HuggingFaceFW/fineweb-edu-llama3-annotations` en la revisión `72df4c92fb1b48beceb16016e8f695ec40a6c3a5`, 859.346 párrafos de entrenamiento con semilla 0, checksum del corpus tokenizado `xxh3-128:88146a7f61a2c157c4710cfaf3e0cb4b` y checksum de pesos y componentes `xxh3-128:7b81d9963c76f04d3d6be942b20ad3a9`. Se ajustaron diez componentes no centrados exclusivamente sobre ese corpus, nunca sobre los textos de evaluación, y se plegaron en la tabla ponderada antes de la cuantización. No hay RLHF, DPO ni ajuste supervisado.

La innovación técnica reseñable es la reproducibilidad: el autor documenta que la inferencia en backend CPU es bit a bit idéntica a la de su referencia, y que la cercanía al modelo pre-cuantización se mide empíricamente (Recall@10 de 0,995975 frente a float32 del mismo método). La model card advierte que el corpus de componentes se seleccionó usando las métricas de STS-B y NanoBEIR, por lo que esas puntuaciones no son estimaciones limpias sobre datos no vistos.

## Capacidades

- Extracción de features y embeddings de frases: devuelve un vector de 300 dimensiones normalizado por entrada mediante `encoder.encode([...])`.
- Similitud semántica y recuperación densa: adecuado para búsqueda por vecino más cercano y ranking por coseno.
- Manejo de palabras fuera de vocabulario mediante n-gramas de caracteres de FastText (min_n = max_n = 4).
- Procesamiento por lotes en CPU sin GPU, al no requerir atención ni decodificación.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no, solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en documentación técnica en inglés: indexar párrafos como vectores de 300 dimensiones int8 y resolver consultas por similitud coseno con un índice ANN; el tamaño reducido permite mantener millones de vectores en memoria RAM de un servidor modesto.
- Deduplicación de corpus y near-duplicate detection: comparar embeddings de frases de un dataset de preentrenamiento para eliminar pasajes repetidos antes de entrenar otros modelos, aprovechando el Recall@10 cercano a 1 frente a float32.
- Clasificación de textos por prototipos: calcular el centroide de cada clase sobre un conjunto etiquetado y asignar etiquetas por vecino más cercano, sin entrenar un clasificador adicional.
- Filtrado y enrutado de tickets de soporte: agrupar consultas de usuarios por similitud para dirigirlas al equipo adecuado, en un pipeline de CPU de bajo coste y baja latencia.
- Baseline reproducible para evaluación de embeddings: servir como referencia ligera en experimentos de recuperación (NanoBEIR, STS-B) antes de escalar a encoders transformer.
- Pre-filtrado en pipelines RAG: reducir un corpus grande a un subconjunto de candidatos con este encoder y reordenar después con un cross-encoder más costoso, dado su bajo coste por consulta.
- Análisis de similitud en herramientas de autoría: detectar pasajes casi idénticos entre documentos o versiones de un texto en inglés.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| STS-B Pearson x100 (SIF-10, int8, tokenizador por defecto) | 72,40633 |
| STS-B Pearson x100 (SIF-10, float32, mismo método) | 72,40582 (referencia de la model card) |
| Diferencia frente a float32 del mismo método | +0,00051 puntos |
| Recall@10 frente a float32 del mismo método | 0,995975 |
| STS-B Pearson x100 (media cruda, float32) | 48,52845 |
| Tamaño del archivo del modelo | 1.247.846.930 bytes |

La comparación controlada usa el preprocesado NLTK del notebook de fse 1.x a través de una vista con tokenizador externo sobre la misma tabla; la fila del tokenizador por defecto usa `fse_words@1` sobre texto crudo. Recall@10 se calcula sobre las 2.758 filas de frases de STS-B, excluyendo la propia fila y resolviendo empates por índice. El autor no publica cifras de latencia ni throughput. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no genera texto.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo está pensado para CPU. En GPU, la tabla int8 ocupa aproximadamente 1,2 GB de memoria.
- GPU recomendadas: no aplica; cualquier GPU con al menos 2 GB de memoria libre podría alojar la tabla, pero no aporta ventaja frente a CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX o iGPU con memoria suficiente, aunque el backend documentado como bit a bit reproducible es CPU.
- Opciones de despliegue: únicamente la librería `fse>=2.0` (`pip install "fse>=2.0"`). No hay soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles; el autor declara explícitamente que no emite ninguna afirmación de velocidad o tiempo de carga.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones | Idiomas | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| `fse/fasttext-crawl-subwords-300-sif10-int8` | Embeddings estáticos FastText + SIF-10, int8 | 300 | Inglés | CC BY-SA 3.0 | No aplica | STS-B Pearson x100 de 72,40633; requiere `fse` |
| `fse/fasttext-crawl-subwords-300` (modelo base) | Embeddings estáticos FastText, gensim | 300 | Inglés | CC BY-SA 3.0 | No aplica | Sin plegado SIF ni cuantización; sirve como referencia de origen |
| `sentence-transformers/all-MiniLM-L6-v2` | Transformer encoder destilado | 384 | Inglés | Apache-2.0 | 256 tokens | Mucho más pesado en cómputo; ampliamente soportado en el ecosistema |
| `BAAI/bge-small-en-v1.5` | Transformer encoder | 384 | Inglés | MIT | 512 tokens | Mayor coste por consulta, orientado a recuperación densa |

La comparación con encoders transformer se ofrece solo como referencia de categoría: este modelo no comparte arquitectura ni ecosistema de despliegue, y su ventaja está en el coste de CPU y el tamaño, no en la calidad absoluta de los embeddings.

## Limitaciones y advertencias

- Solo inglés; no se declaran capacidades multilingües.
- No es un modelo generativo: no produce texto, código ni respuestas, únicamente vectores.
- La licencia CC BY-SA 3.0 impone ShareAlike: los trabajos derivados deben distribuirse bajo la misma licencia, lo que condiciona el uso comercial cerrado.
- Los vectores derivan de FastText English de Facebook y de datos de frecuencia de `wordfreq`; la model card advierte que el campo de licencia de los vectores de origen no renuncia a las condiciones de esos datos (material CC BY-SA 4.0 y créditos por fuente en `NOTICE.md`).
- La cuantización int8 altera los vecinos: aunque el Recall@10 medido es 0,995975, no es 1; conviene validar el impacto en el dominio propio.
- Las puntuaciones de STS-B y NanoBEIR guiaron la selección del corpus de componentes, por lo que no son estimaciones limpias sobre datos no vistos.
- Los embeddings estáticos no capturan contexto sintáctico ni desambiguación fina; palabras polisémicas comparten representación salvo por los n-gramas.
- No hay métricas de latencia, throughput ni carga publicadas.
- Dependencia estricta de `fse>=2.0`; no es interoperable con `sentence-transformers` ni con el pipeline `feature-extraction` de `transformers`.
- El autor no respalda la conversión desde Facebook y no reclama ninguna mejora sobre los vectores de origen más allá del plegado SIF y la cuantización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fse/fasttext-crawl-subwords-300-sif10-int8
- Modelo base: https://huggingface.co/fse/fasttext-crawl-subwords-300
- Repositorio de la librería fse: https://github.com/oborchers/Fast_Sentence_Embeddings
- Vectores FastText English (Facebook): https://fasttext.cc/docs/en/english-vectors.html
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- wordfreq (Robyn Speer): https://github.com/rspeer/wordfreq
- Créditos de datos de wordfreq: https://github.com/rspeer/wordfreq/blob/master/NOTICE.md
- Dataset de componentes: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu-llama3-annotations
