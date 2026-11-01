# g3ida/ArabicWordsEmbedding

## Resumen

ArabicWordsEmbedding es un modelo de embeddings especializado en palabras aisladas de árabe impreso, desarrollado por el usuario g3ida como un fine-tune de google/embeddinggemma-2. Resuelve un problema muy concreto dentro de los pipelines de digitalización de documentos: dado un recorte de imagen que contiene una palabra árabe, obtener un vector que permita emparejarla con la transcripción correcta dentro de una misma página, incluso cuando el OCR ha fallado o cuando existen palabras visualmente casi idénticas. Es, por tanto, una pieza de emparejamiento (word matching) y no un modelo generativo ni un OCR completo.

El modelo parte de EmbeddingGemma 2, del que conserva la torre de visión y el transformer multimodal, con el codificador de audio eliminado, resultando en 438.760.472 parámetros según los pesos en safetensors. El ajuste se realizó con LoRA sobre la torre de visión y el transformer, fusionado posteriormente en el checkpoint publicado. La relevancia actual está en el ámbito del document AI para fondos bibliográficos árabes: permite mejorar la alineación entre imagen y texto transcrito sin reentrenar un OCR completo.

La licencia es Apache 2.0, igual que el modelo base, y el repo ocupa 0,9 GB. El modelo está pensado para uso monolingüe (árabe) y para comparación de embeddings dentro de una página, no como reconocedor de vocabulario abierto robusto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (EmbeddingGemma 2 sin encoder de audio), fine-tune con LoRA fusionado |
| Parametros totales | 438.760.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/embeddinggemma-2, un modelo de embeddings multimodal con torre de visión y transformer, al que se le ha eliminado el codificador de audio. Sobre esa base se aplicó un ajuste con LoRA tanto en la torre de visión como en el transformer, y los adaptadores se fusionaron en el checkpoint final publicado. El pipeline declarado es feature-extraction y la librería es transformers.

El entrenamiento combina datos reales y sintéticos. Los datos reales consisten en aproximadamente 400.000 recortes de palabras procedentes de 3.000 páginas escaneadas de libros árabes clásicos impresos, con transcripciones revisadas por humanos del dataset seemorg/books-ocr; las cajas de palabra provienen de Tesseract y se alinean con la transcripción. Los datos sintéticos se generan al vuelo con unos 50 tipos de letra: cada palabra se renderiza con tashkeel completo, parcial o ausente, con puntuación adjunta y palabras vecinas, se recorta como lo haría un detector de palabras y se degrada simulando un escaneo (baja resolución, desenfoque, JPEG, binarización, ruido, rotación). El objetivo es contrastivo (InfoNCE), con batches que contienen palabras visualmente parecidas (mismas letras sin puntos) y pares dirigidos donde el tashkeel o la puntuación imita un punto.

## Capacidades

- Generación de embeddings de palabras árabes a partir de recortes de imagen (feature-extraction).
- Emparejamiento de palabras dentro de una misma página entre imagen y transcripción.
- Discriminación de palabras visualmente parecidas: mismas letras sin puntos, variantes de tashkeel y puntuación que imita puntos.
- Robustez ante degradaciones típicas de escaneo: baja resolución, desenfoque, compresión JPEG, binarización, ruido y rotación.
- Manejo de variantes tipográficas: aproximadamente 50 fuentes en el entrenamiento sintético.
- Reconocimiento de vocabulario abierto limitado: 93,6 % top-1 entre 31.700 palabras según la model card.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de embeddings, no un LLM.

## Casos de uso

- Corrección de transcripciones OCR en libros árabes digitalizados: para cada caja de palabra detectada, se genera su embedding y se compara con los embeddings de las palabras candidatas de la transcripción de la página, seleccionando la coincidencia de mayor similitud para corregir errores de OCR.
- Alineación imagen-texto en proyectos de humanidades digitales: permite vincular cada palabra transcrita con su región de imagen en corpus de libros clásicos, facilitando la revisión humana y la anotación.
- Verificación de calidad de pipelines OCR: comparando los emparejamientos del modelo con la salida del OCR se pueden detectar páginas o regiones con tasas de error anómalas.
- Desambiguación de palabras cortas con prefijos (ل / ال / و): el modelo está entrenado con pares dirigidos a estos casos, que según el autor concentran la mayoría de los errores restantes en datos reales, por lo que sirve como segunda pasada de desambiguación.
- Búsqueda y recuperación dentro de una colección escaneada: indexando embeddings de palabras se pueden localizar ocurrencias de un término en imágenes sin depender exclusivamente del texto OCR.
- Preprocesado para entrenamiento de modelos de OCR árabe: los emparejamientos imagen-palabra de alta confianza pueden usarse como pseudoetiquetas para ampliar datasets de entrenamiento.
- Control de calidad en digitalización masiva de bibliotecas: integrado en un pipeline de document AI para marcar automáticamente discrepancias entre imagen y transcripción antes de la publicación.

## Benchmarks y rendimiento

La model card solo reporta una métrica concreta: 93,6 % top-1 en reconocimiento de vocabulario abierto entre 31.700 palabras. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y al tratarse de un modelo de embeddings, esos benchmarks no serían aplicables.

| Metrica | Resultado | Contexto |
|---|---|---|
| Top-1 en vocabulario abierto | 93,6 % | Entre 31.700 palabras, según la model card |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 438,7 M de parámetros, en fp32 serían aproximadamente 1,75 GB de pesos; en fp16, unos 0,88 GB; en int8, unos 0,44 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: no disponibles. Por tamaño, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores en fp16, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint (0,9 GB en el repo).
- Opciones de despliegue: transformers (librería declarada). No se indica soporte verificado de vLLM, llama.cpp, Ollama o TGI; el tag endpoints_compatible sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| g3ida/ArabicWordsEmbedding | 438,7 M | no disponible | ar | Apache 2.0 | Fine-tune de EmbeddingGemma 2 para emparejamiento de palabras árabes impresas |
| google/embeddinggemma-2 | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | Modelo base multimodal; el fine-tune elimina el encoder de audio |
| Otros modelos de embeddings arabes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información sobre alternativas especializadas en emparejamiento de palabras árabes con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado y evaluado solo con páginas de libros árabes impresos: no se evaluó escritura manuscrita, texto en escena ni fuentes decorativas.
- Las cajas de palabra de los datos reales provienen de Tesseract; un detector que recorte de forma muy distinta (más ajustado o varias palabras por caja) puede requerir una comprobación previa.
- Las palabras cortas que difieren en una letra de prefijo (ل / ال / و) concentran la mayoría de los errores restantes en datos reales.
- El uso previsto es el emparejamiento dentro de una misma página; el reconocimiento de vocabulario abierto es más débil (93,6 % top-1 entre 31.700 palabras).
- Modelo monolingüe en árabe: no cubre otros idiomas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de emparejamientos incorrectos en palabras visualmente ambiguas.
- No se han publicado datos sobre sesgos; al trabajar sobre corpus de libros clásicos, podría heredar sesgos de ese material.
- Licencia Apache 2.0, que permite uso comercial; las páginas de entrenamiento provienen de seemorg/books-ocr (MIT), lo que no impone restricciones adicionales conocidas.
- No hay información publicada sobre cuantizaciones soportadas ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g3ida/ArabicWordsEmbedding
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Dataset de entrenamiento: https://huggingface.co/datasets/seemorg/books-ocr
