# gwisu/bert-base-uncased-finetuned-mrpc

## Resumen

`gwisu/bert-base-uncased-finetuned-mrpc` es un ajuste fino del modelo BERT-base (uncased) de Google sobre la tarea MRPC (Microsoft Research Paraphrase Corpus), que consiste en decidir si dos frases son paráfrasis entre sí (clasificación binaria de pares de secuencias). Lo publica el usuario gwisu en Hugging Face y la documentación asociada es mínima: la propia model card declara que el conjunto de datos de entrenamiento es "unknown" y deja vacías las secciones de descripción, usos previstos y datos de evaluación.

El modelo es un transformer encoder-only de 109.483.778 parámetros (~109,5 M), con una longitud máxima de 512 tokens heredada del modelo base y una cabecera de clasificación sobre el token [CLS]. Se entrenó durante 2 épocas (unos 600 pasos con batch de 8, semilla 42) con el optimizador AdamW fused y tasa de aprendizaje 2e-5, alcanzando en la evaluación final una pérdida de 0,4456, una exactitud de 0,8260 y un F1 de 0,8807.

Su relevancia es la de un ejemplo canónico y de bajo coste de fine-tuning de BERT para clasificación de pares de frases, aplicable a deduplicación semántica y detección de paráfrasis. Sin embargo, con 20 descargas y 0 "likes" en el momento de redactar esta ficha, no es un modelo validado por la comunidad, y sus métricas quedan por detrás de los valores habituales publicados para BERT-base ajustado en MRPC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia BERT), atención bidireccional; 12 capas, tamaño oculto 768 y 12 cabezas de atención según el modelo base `bert-base-uncased` |
| Parametros totales | 109.483.778 (~109,5 M), dato real de los pesos en safetensors |
| Parametros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | 512 tokens (límite de posiciones del modelo base; no se documenta ampliación) |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados en el repositorio (solo safetensors en precisión completa). Aplicables a posteriori: fp16/bf16, int8 dinámico de PyTorch, ONNX Runtime y cuantización GPTQ/AWQ no soportada de forma nativa para este tipo de modelo |
| Idiomas soportados | No declarados en la model card. El modelo base es "uncased" y se entrenó predominantemente con texto en inglés, por lo que el uso realista queda restringido al inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag del repositorio, `transformers` + `safetensors`). No se ofrecen GGUF, ONNX ni TensorRT |

Otros datos del repositorio: tamaño del repo 6,1 GB, 20 descargas, 0 "likes", pipeline `text-classification`, tags `generated_from_trainer`, `text-embeddings-inference`, `endpoints_compatible` y `region:us`. Fechas declaradas: creado el 2026-10-05 y actualizado el 2026-10-06.

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base estándar: un transformer encoder-only con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y normalización de capas tras cada bloque, preentrenado con objetivos de modelado de lenguaje enmascarado (MLM) y predicción de la siguiente frase (NSP). Sobre esa pila se añade una capa de clasificación lineal que opera sobre el vector del token [CLS]; en este caso el número de etiquetas es 2 (par de frases equivalente frente a no equivalente). El tokenizador es WordPiece "uncased", de modo que la entrada se normaliza a minúsculas y se pierde la información de mayúsculas.

El ajuste fino se realizó con 2 épocas, batch de entrenamiento y evaluación de 8, learning rate 2e-5, planificador lineal, optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-8, y semilla 42, sumando unos 600 pasos de optimización. No se declara la composición del dataset ("unknown dataset"), no se documenta ningún uso de RLHF, DPO ni decodificación especulativa (no aplicable en un modelo discriminativo), ni innovaciones técnicas más allá del ajuste supervisado. Las versiones de framework declaradas por el autor son Transformers 5.19.0, PyTorch 2.14.1+cu130, Datasets 5.1.0 y Tokenizers 0.23.2. El tamaño del repositorio (6,1 GB) es muy superior al de los pesos en precisión completa (~438 MB), lo que sugiere que contiene artefactos de entrenamiento adicionales (checkpoints intermedios o estados del optimizador).

## Capacidades

- Clasificación binaria de pares de frases: determina si dos textos son paráfrasis (etiqueta equivalente) o no lo son.
- Extracción de representaciones contextuales: al ser un BERT-base, puede usarse como encoder para obtener embeddings de frases (de ahí el tag `text-embeddings-inference`).
- Puntuación de similitud semántica derivada del logit de la clase positiva, utilizable con umbral ajustable.
- Procesamiento por lotes de pares de frases con secuencias de hasta 512 tokens.
- Integración directa con `transformers` (`AutoModelForSequenceClassification`), con Hugging Face Inference Endpoints (tag `endpoints_compatible`) y con Text Embeddings Inference (tag `text-embeddings-inference`).
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- No se declaran capacidades multilingües; el alcance práctico es el inglés.

## Casos de uso

- Deduplicación semántica de catálogos: comparar pares de títulos o descripciones de producto para fusionar fichas repetidas formuladas con palabras distintas, usando el logit de paráfrasis con un umbral ajustado al coste de los falsos positivos.
- Consolidación de FAQs en atención al cliente: detectar preguntas equivalentes redactadas de forma diferente para reducir el número de entradas redundantes en la base de conocimiento.
- Filtrado de datos sintéticos en pipelines de data augmentation: comprobar automáticamente que una frase generada es realmente una reformulación de la original antes de incorporarla al conjunto de entrenamiento.
- Detección de evasión por reescritura en moderación de contenido: identificar mensajes que parafrasean un texto ya marcado como spam o abuso sin reutilizar literalmente las mismas cadenas.
- Normalización de consultas en buscadores internos: agrupar variantes de una misma búsqueda para reescribirla a una forma canónica y mejorar la recuperación.
- Verificación de equivalencia en pruebas de regresión de NLU: comprobar que dos respuestas del sistema, formuladas con distinta superficie, son semánticamente equivalentes antes de dar por superada una prueba.
- Deduplicación de pasajes en bases documentales para RAG: comparar fragmentos solapados de documentos distintos y conservar una única versión antes de indexarlos.
- Detección de paráfrasis en revisión editorial: señalar tramos de un texto que repiten una idea ya expresada con otras palabras.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío (`results: []`), por lo que no hay benchmarks declarados (MMLU, HumanEval, GSM8K u otros no aplican ni están publicados). Los únicos datos de rendimiento son los de la evaluación del ajuste fino, que el autor presenta como resultados en el conjunto de evaluación:

| Metrica (evaluacion final, paso 600) | Valor |
|---|---|
| Loss | 0,4456 |
| Accuracy | 0,8260 |
| F1 | 0,8807 |

Evolución declarada durante el entrenamiento (extracto completo de la tabla de la model card):

| Paso | Epoca | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 50 | 0,1089 | 0,5925 | 0,7108 | 0,8239 |
| 100 | 0,2179 | 0,5483 | 0,7377 | 0,8254 |
| 150 | 0,3268 | 0,5288 | 0,7426 | 0,8287 |
| 200 | 0,4357 | 0,5332 | 0,7623 | 0,8477 |
| 250 | 0,5447 | 0,4942 | 0,7770 | 0,8553 |
| 300 | 0,6536 | 0,4758 | 0,7917 | 0,8636 |
| 350 | 0,7625 | 0,4268 | 0,8162 | 0,8760 |
| 400 | 0,8715 | 0,4443 | 0,8162 | 0,8760 |
| 450 | 0,9804 | 0,3640 | 0,8431 | 0,8881 |
| 500 | 1,0893 | 0,4079 | 0,8260 | 0,8799 |
| 550 | 1,1983 | 0,4591 | 0,8162 | 0,8756 |
| 600 | 1,3072 | 0,4456 | 0,8260 | 0,8807 |

Observaciones: el mejor punto intermedio es el paso 450 (accuracy 0,8431; F1 0,8881), superior a la evaluación final publicada; la pérdida de validación no decrece de forma monótona entre los pasos 350 y 600, lo que indica posible sobreajuste al final del entrenamiento. No se especifica sobre qué partición se evaluó (la model card no identifica el dataset).

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 438 MB en fp32, 219 MB en fp16/bf16 y 110 MB en int8. Con activaciones y lotes pequeños, un presupuesto de 1 a 2 GB de VRAM es suficiente.
- Cabe en cualquier GPU de consumo actual: GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090, así como en iGPU y en CPU para inferencia de baja concurrencia.
- GPU de centro de datos: T4, L4, A10G, A100 y H100 son sobredimensionadas para este modelo y solo tienen sentido si se comparte el nodo con otros servicios o se necesita un throughput muy alto por lotes.
- Inferencia en CPU: viable gracias al tamaño (110 M de parámetros); con `torch.set_num_threads` y lotes de 16 a 64 pares alcanza para tareas de deduplicación por lotes no interactivas.
- Opciones de despliegue: pipeline de `transformers`, Hugging Face Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference (tag `text-embeddings-inference`), ONNX Runtime, TorchScript, NVIDIA Triton Inference Server, FastAPI + `transformers` para servicios internos y Optimum/IPEX para CPU Intel. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama no son una vía directa para esta cabecera de clasificación.
- Latencia y throughput: no disponible. No se han publicado mediciones. Como orden de magnitud orientativo (estimación, no dato del autor), un encoder de 110 M con secuencias de 128 tokens procesa lotes de decenas de pares por segundo por núcleo en CPU y del orden de miles de pares por segundo en una GPU moderna; conviene medirlo en el hardware objetivo.
- Tamaño del repositorio: 6,1 GB, muy superior a los pesos finales; si solo se necesita inferencia, descargar únicamente los ficheros safetensors reduce el espacio en disco a menos de 0,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas MRPC |
|---|---|---|---|---|---|
| `gwisu/bert-base-uncased-finetuned-mrpc` (este modelo) | 109,5 M | 512 tokens | Apache 2.0 | Hugging Face, 20 descargas | Accuracy 0,8260; F1 0,8807 (declaradas por el autor) |
| `google-bert/bert-base-uncased` (modelo base, sin ajustar) | ~110 M | 512 tokens | Apache 2.0 | Hugging Face | No aplica sin cabecera de clasificación ajustada |
| `textattack/bert-base-uncased-MRPC` (ajuste equivalente en MRPC) | ~110 M | 512 tokens | no disponible | Hugging Face | No disponible en la información proporcionada |
| `FacebookAI/roberta-base` (encoder más reciente, ajustable en MRPC) | ~125 M | 512 tokens | MIT | Hugging Face | No disponible en la información proporcionada |
| `distilbert-base-uncased` (alternativa destilada, 6 capas) | ~66 M | 512 tokens | Apache 2.0 | Hugging Face | No disponible en la información proporcionada |

La comparación cuantitativa de rendimiento con las alternativas no puede realizarse con los datos disponibles: no se han publicado métricas de esos modelos en la información proporcionada ni el autor incluye comparaciones. La diferencia relevante es de coste: `distilbert-base-uncased` ofrece un encoder aproximadamente un 40 % más pequeño, y `roberta-base` un encoder algo mayor con licencia MIT y entrenamiento más extenso.

## Limitaciones y advertencias

- Modelo no validado por la comunidad: 20 descargas y 0 "likes"; no hay informes de terceros sobre su comportamiento real.
- Procedencia de los datos desconocida: la model card indica explícitamente "on an unknown dataset", por lo que no puede auditarse la composición del conjunto de entrenamiento ni descartar solapamiento con particiones de evaluación.
- Solo inglés y sin distinción de mayúsculas por el tokenizador "uncased", lo que degrada casos donde el caso tipográfico aporta significado (nombres propios, siglas, entidades).
- Longitud máxima de 512 tokens: los pares de frases largos se truncan, con pérdida de información y posible sesgo hacia la clase negativa.
- Riesgo de clasificación errónea en pares con alto solapamiento léxico pero significado opuesto (negaciones, cambios de sujeto), un modo de fallo típico de los modelos basados en BERT-base.
- Sesgos heredados: BERT-base se entrenó con BooksCorpus y Wikipedia en inglés, con los sesgos de representación de género, origen y profesión documentados en ese tipo de corpus.
- Sobreajuste probable: solo 2 épocas con 600 pasos, con pérdida de validación no monótona; el mejor punto de control observado (paso 450) no es el que se reporta como resultado final, y el repositorio no indica si se publicó el mejor checkpoint.
- Sin confianza calibrada: el modelo emite logits; el umbral de decisión debe calibrarse con un conjunto propio antes de usarlo en producción.
- No es un modelo generativo: no puede redactar respuestas ni ejecutar planes; cualquier uso conversacional requeriría otro modelo y este solo como clasificador auxiliar.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia; al derivar de BERT-base (también Apache 2.0) no añade restricciones adicionales conocidas.
- Caveat de reproducibilidad: las versiones declaradas (Transformers 5.19.0, PyTorch 2.14.1+cu130) y las fechas del repositorio (octubre de 2026) conviene verificarlas al cargar el modelo en un entorno actual.
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (solo páginas de entretenimiento ajenas); no existen papers, blogs ni demos de terceros que respalden su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gwisu/bert-base-uncased-finetuned-mrpc
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased (la model card enlaza https://huggingface.co/bert-base-uncased)
- Paper de BERT (modelo base): https://arxiv.org/abs/1810.04805
- Paper de GLUE, benchmark que incluye MRPC: https://arxiv.org/abs/1804.07461
- Nota sobre la búsqueda web: no se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo; los resultados devueltos por la búsqueda no guardan relación con él.
