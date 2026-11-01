# luluw/embeddinggemmatext2-65k-en-ne-trim-GGUF

## Resumen

EmbeddingGemma 2 (English + Nepali, 65k vocabulary) - GGUF es una familia de ficheros GGUF derivados de `luluw/embeddinggemmatext2-65k-en-ne-trim`, una variante de EmbeddingGemma 2 de Google con el vocabulario recortado de 262.144 a 65.536 tokens para centrarse en ingles y nepalí. El modelo resultante conserva las 24 capas del transformer original, la proyeccion de 512 a 768 y el pooling por media, pero elimina aproximadamente 100,7M de los 134,2M de parametros de embedding, quedando en 33,6M de parametros de embedding y 170.339.352 parametros totales.

La relevancia de esta publicacion es practica: ofrece el modelo en formato GGUF listo para `llama.cpp` (`llama-server`, `llama-embedding`) en tres cuantizaciones (BF16, Q8_0 y Q4_K_M), con tamanos de 345 MB, 192 MB y 114 MB respectivamente. Esto permite desplegar un modelo de embeddings de 768 dimensiones en entornos con recursos muy limitados, incluso en CPU, manteniendo una calidad de recuperacion practicamente identica a la del modelo completo segun las metricas publicadas por el autor.

El modelo esta pensado exclusivamente para ingles y nepalí (devanagari). No es un modelo generativo: su pipeline es `feature-extraction` y produce vectores normalizables para similitud semantica, busqueda y clustering. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EmbeddingGemma 2) con proyeccion 512 a 768 y mean pooling |
| Parametros totales | 170.339.352 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (usado en la evaluacion; el modelo base admite contexto mayor, no especificado en la informacion disponible) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | Ingles (en) y nepalí (ne, devanagari); otros idiomas solo mediante byte fallback con perdida de calidad |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Dimension de embedding | 768 (con truncamiento Matryoshka a 512, 256 o 128) |
| Vocabulario | 65.536 tokens (recortado desde 262.144) |
| Capas del transformer | 24 |
| Parametros de embedding | 33,6M (frente a 134,2M del original) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 24 capas con pooling por media sobre las representaciones de tokens, seguido de una proyeccion de 512 a 768 dimensiones que produce el vector final de embedding. La innovacion principal de esta variante no esta en la arquitectura, sino en el recorte del vocabulario: se seleccionaron 65.536 tokens a partir de recuentos sobre FineWeb-2 (70.000 documentos en ingles y 30.000 en nepalí), conservando todos los tokens especiales y de byte fallback, colocando primero los 12.288 tokens nepalíes mas frecuentes y completando con tokens ingleses por frecuencia. Los pesos no se reentrenaron; el resto del modelo queda intacto respecto al original de Google.

El modelo base EmbeddingGemma 2 de Google se entrena con prefijos de tarea cortos que deben anteponerse siempre al texto a embeber (`task: search result | query: ...`, `title: none | text: ...`, etc.). La informacion proporcionada no detalla la composicion exacta del dataset de entrenamiento original, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card del modelo base de Google y no se reproducen aqui. La cuantizacion se realizo con las recetas estandar de llama.cpp: Q8_0 cuantiza todos los tensores a 8 bits y Q4_K_M aplica la receta K-quant de 4 bits manteniendo algunos tensores sensibles en 6 bits.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para similitud semantica y recuperacion de informacion.
- Recuperacion pregunta-pasaje (question answering retrieval) en ingles y nepalí.
- Busqueda semantica de documentos mediante prefijos de tarea especificos (`task: search result | query: ...`).
- Clasificacion de texto por similitud con prototipos o etiquetas embebidas.
- Clustering de textos a partir de sus vectores.
- Similitud de frases (sentence similarity) para deduplicacion y emparejamiento.
- Truncamiento Matryoshka: se pueden conservar las primeras 512, 256 o 128 dimensiones del vector de 768 y renormalizar para reducir coste de almacenamiento y busqueda.
- Soporte de byte fallback para texto en otros idiomas, con calidad degradada.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en ingles y nepalí: indexar un corpus con `title: none | text: {passage}` y consultar con `task: search result | query: {query}`; el modelo cabe en 114 MB en Q4_K_M y puede ejecutarse en CPU con llama.cpp, lo que lo hace adecuado para busquedas locales o en dispositivos con poca memoria.
- Recuperacion aumentada por generacion (RAG) en aplicaciones bilingues ingles-nepalí: generar embeddings de fragmentos de documentacion y de la pregunta del usuario para recuperar los pasajes mas relevantes antes de pasarlos a un LLM generativo, con una latencia muy baja gracias al reducido tamano del modelo.
- Deduplicacion y agrupacion de articulos periodicos en nepalí: embeber cada texto con `task: clustering | query: {text}` y aplicar clustering sobre los vectores de 768 dimensiones; el soporte dedicado de devanagari evita la fragmentacion excesiva de tokens que sufriria el modelo original en ese idioma.
- Clasificacion de tickets de soporte: embeber el texto del ticket con `task: classification | query: {text}` y comparar con embeddings de categorias predefinidas para asignar la etiqueta mas cercana por similitud coseno.
- Motor de similitud de frases para correccion o parafraseo: embeber pares de frases con `task: sentence similarity | query: {text}` y umbralizar la similitud coseno para detectar duplicados o respuestas equivalentes en un sistema de FAQ.
- Despliegue en entornos edge o contenedores ligeros: el fichero Q8_0 de 192 MB permite servir un endpoint compatible con la API de OpenAI (`/v1/embeddings`) mediante `llama-server` en una maquina sin GPU, con un consumo de RAM inferior a 1 GB.
- Filtrado previo en pipelines de datos multilingues: usar el modelo para puntuar la similitud entre pares de frases ingles-nepalí y descartar traducciones de baja calidad antes de un proceso de anotacion o entrenamiento.

## Benchmarks y rendimiento

Resultados de recuperacion pregunta-pasaje sobre Belebele (aproximadamente 900 preguntas sobre 488 pasajes por idioma, contexto maximo de 2048 tokens, con los prefijos de tarea indicados). R@k es la proporcion de preguntas cuyo pasaje correcto esta en el top k; MRR es el rango reciproco medio.

**Ingles**

| Modelo | R@1 | R@5 | R@10 | MRR | Coseno vs. trimmed HF (pasajes) |
|---|---:|---:|---:|---:|---:|
| EmbeddingGemma 2 original (HF, vocab 262k) | 0,9056 | 0,9756 | 0,9822 | 0,9357 | 0,9870 |
| Trimmed 65k (HF) | 0,9067 | 0,9756 | 0,9811 | 0,9355 | 1,0000 |
| Trimmed 65k GGUF BF16 | 0,9100 | 0,9756 | 0,9811 | 0,9371 | 1,0000 |
| Trimmed 65k GGUF Q4_K_M | 0,9078 | 0,9711 | 0,9800 | 0,9353 | 0,9887 |
| Trimmed 65k GGUF Q8_0 | 0,9067 | 0,9744 | 0,9822 | 0,9356 | 0,9997 |

**Nepalí**

| Modelo | R@1 | R@5 | R@10 | MRR | Coseno vs. trimmed HF (pasajes) |
|---|---:|---:|---:|---:|---:|
| EmbeddingGemma 2 original (HF, vocab 262k) | 0,7911 | 0,9056 | 0,9311 | 0,8433 | 0,9992 |
| Trimmed 65k (HF) | 0,7933 | 0,9056 | 0,9278 | 0,8438 | 1,0000 |
| Trimmed 65k GGUF BF16 | 0,7889 | 0,9044 | 0,9289 | 0,8415 | 1,0000 |
| Trimmed 65k GGUF Q4_K_M | 0,7944 | 0,9044 | 0,9356 | 0,8438 | 0,9895 |
| Trimmed 65k GGUF Q8_0 | 0,7911 | 0,9056 | 0,9289 | 0,8432 | 0,9998 |

El propio autor advierte que las preguntas de Belebele a menudo contienen la expresion "according to the passage", por lo que la tarea es mas facil que la recuperacion abierta; los numeros sirven para comparar estos ficheros entre si y con el original, no como cifra absoluta de precision. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: menos de 1 GB en todos los formatos. BF16 ocupa 345 MB, Q8_0 192 MB y Q4_K_M 114 MB en disco; el consumo en memoria es del mismo orden mas el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo no requiere A100, H100 ni RTX 4090. Una GTX 1650, una RTX 3060 o incluso una iGPU integrada pueden servirlo.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU consumer de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: `llama-server` (API compatible con OpenAI en `/v1/embeddings`), `llama-embedding` (linea de comandos), y cualquier herramienta construida sobre llama.cpp. No se mencionan otros runtimes (vLLM, TGI, Ollama) en la informacion disponible, aunque al ser GGUF estandar podria cargarse en herramientas compatibles con llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano (170M parametros, 24 capas), se espera una latencia de milisegundos por lote pequeno en CPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Idiomas | Licencia | Formato |
|---|---:|---|---:|---|---|---|
| Este modelo (GGUF Q8_0) | 170,3M (33,6M en embeddings) | 2048 en evaluacion | 768 (Matryoshka) | en, ne | Apache 2.0 | GGUF |
| EmbeddingGemma 2 original (Google) | 134,2M en embeddings (vocab 262k) | no disponible | 768 | multilingue | no disponible en la informacion | safetensors en HF |
| Trimmed 65k (HF, sin cuantizar) | 170,3M | 2048 en evaluacion | 768 | en, ne | Apache 2.0 | safetensors |

La comparativa se limita a las variantes del mismo modelo base porque la informacion proporcionada no incluye datos de otros modelos de embeddings comparables (por ejemplo, de la familia BGE, E5 o GTE). El modelo original de Google tiene un vocabulario cuatro veces mayor y soporta mas idiomas, pero ocupa mas memoria y es mas lento en tokenizacion para ingles y nepalí; la variante recortada iguala o mejora ligeramente las metricas de recuperacion en ambos idiomas segun la tabla anterior.

## Limitaciones y advertencias

- Solo esta optimizado para ingles y nepalí. Otros idiomas se codifican mediante byte fallback, se fragmentan en muchos tokens pequenos y la calidad cae; para esos casos debe usarse el modelo original.
- El recorte de vocabulario no fue seguido de reentrenamiento: los pesos son los del modelo original, por lo que cualquier token fuera del vocabulario recortado se representa con peor fidelidad.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de recuperar pasajes semanticamente proximos pero incorrectos; las metricas R@1 en nepalí (alrededor de 0,79) indican que aproximadamente una de cada cinco consultas no recupera el pasaje correcto en primera posicion.
- Los resultados de Belebele son una tarea facilitada por la formulacion de las preguntas; no deben extrapolarse a recuperacion abierta sin una evaluacion propia.
- El modelo requiere anteponer los prefijos de tarea exactos; usarlo sin prefijos degrada la calidad de los embeddings.
- Los vectores deben normalizarse (L2) antes de calcular similitud coseno; si se truncan dimensiones (Matryoshka), hay que renormalizar de nuevo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos de los evaluados.
- El repositorio tiene muy poca traccion (121 descargas, 0 likes en el momento de la ficha) y fue creado en 2026; no hay evidencia de uso en produccion a gran escala.
- No se dispone de informacion sobre sesgos demograficos o culturales especificos de esta variante; los sesgos del modelo base de Google no se detallan en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/luluw/embeddinggemmatext2-65k-en-ne-trim-GGUF
- Modelo base sin cuantizar: https://huggingface.co/luluw/embeddinggemmatext2-65k-en-ne-trim
- EmbeddingGemma 2 original de Google: https://huggingface.co/google/embeddinggemma-2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset Belebele: https://huggingface.co/datasets/facebook/belebele
- Dataset FineWeb-2 (usado para el recorte de vocabulario): no se proporciona enlace directo en la informacion disponible.
