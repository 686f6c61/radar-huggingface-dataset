# bsgcasa/fake-news-bert

## Resumen
fake-news-bert es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario bsgcasa en HuggingFace. Su propósito declarado, a partir del nombre del repositorio, es la detección de noticias falsas, aunque la model card no documenta ni la tarea exacta ni el esquema de etiquetas. El modelo tiene 66.955.010 parámetros y un tamaño de repositorio de 0,3 GB en formato safetensors.

Se trata de un transformer encoder-only de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, la arquitectura estándar de DistilBERT, con una ventana de contexto máxima de 512 tokens. No incorpora capacidades generativas ni de razonamiento: es un clasificador discriminativo que devuelve una etiqueta (presumiblemente binaria) para un texto de entrada.

Su relevancia práctica es la de un clasificador ligero y desplegable en CPU o en GPU de gama baja, con métricas declaradas por el autor de 0,9732 de accuracy, 0,9934 de precision, 0,9527 de recall y 0,9726 de F1 sobre un conjunto de evaluación no identificado. El repositorio no tiene descargas ni valoraciones, la model card está incompleta y las versiones de framework declaradas no son verificables, por lo que debe tratarse como un artefacto experimental y no como un sistema validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia DistilBERT, 6 capas, 768 de dimensión oculta, 12 cabezas) |
| Parámetros totales | 66.955.010 |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased; no declarada explícitamente en la model card) |
| Tipos de cuantización | No disponible. Pesos publicados en safetensors sin cuantizar; al ser un encoder estándar admite conversión a ONNX e int8 con herramientas externas |
| Idiomas soportados | No disponible. No se declara ningún idioma; el modelo base es uncased y entrenado predominantemente en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |
| Modelo base | distilbert-base-uncased |
| Tarea (pipeline) | text-classification |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura es la de DistilBERT: un transformer encoder-only obtenido originalmente por destilación de conocimiento de BERT-base, con 6 capas, 768 dimensiones ocultas, 12 cabezas de atención, red feed-forward de 3072 y embeddings posicionales aprendidos. El modelo base emplea un tokenizador WordPiece con vocabulario de 30.522 piezas y no distingue mayúsculas. Sobre ese tronco se ha añadido una cabeza de clasificación cuyo tamaño es coherente con 2 etiquetas de salida, si bien la model card no confirma el esquema de clases.

El fine-tuning se realizó con el Trainer de transformers durante 4 épocas, con learning rate 2e-05, batch de entrenamiento de 16, batch de evaluación de 32, semilla 42, optimizador AdamW_TORCH_FUSED (betas 0,9/0,999, epsilon 1e-08) y scheduler lineal, hasta un total de 1268 pasos. A partir de esos datos se deduce un tamaño aproximado de 5.072 ejemplos por época (unos 20.000 en total), pero el dataset no está identificado: la model card lo menciona literalmente como "None". No se documenta composición del corpus, técnica de preprocesado, ni uso de RLHF, DPO o decodificación especulativa, que no aplican a un modelo discriminativo. Las versiones declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades
- Clasificación de texto: asigna una etiqueta a un texto de entrada de hasta 512 tokens mediante la pipeline `text-classification` de transformers.
- Detección de desinformación: el propósito inferido del nombre del modelo es distinguir noticias falsas de veraces, presumiblemente en clasificación binaria.
- Inferencia en CPU: con 66,9 millones de parámetros, es viable ejecutarlo sin GPU.
- Compatibilidad con Text Embeddings Inference y con Inference Endpoints, según las etiquetas del repositorio.
- Procesamiento por lotes: al ser un encoder de 6 capas, permite clasificar grandes volúmenes de documentos en batch.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión, audio ni modo "thinking"; no es un modelo generativo.
- Capacidades multilingües: no disponibles. No hay ninguna declaración al respecto y el modelo base está orientado a inglés sin distinción de mayúsculas.

## Casos de uso
- Moderación de contenido editorial: clasificar titulares y artículos recibidos en un CMS antes de su publicación, usando el modelo como filtro automático que marca piezas sospechosas para revisión humana. Es adecuado por su bajo coste computacional y su ventana de 512 tokens, suficiente para titulares y entradillas.
- Priorización en redacciones de verificación (fact-checking): procesar por lotes los textos entrantes y ordenar la cola de trabajo de los verificadores según la probabilidad asignada por el modelo. El alto valor de precision declarado (0,9934) reduce el ruido si la clase positiva se interpreta como "fiable".
- Monitorización de desinformación en redes sociales: clasificar publicaciones y respuestas de hasta 512 tokens para detectar narrativas falsas sobre una organización o un evento, integrándolo en un pipeline de ingesta con Python y la librería transformers.
- Protección de reputación de marca: rastrear menciones en medios digitales y blogs, y señalar artículos potencialmente falsos o difamatorios para que el equipo de comunicación actúe. El modelo se ejecutaría en CPU sobre los textos recopilados por un scraper.
- API de bajo coste para startups: exponer el clasificador detrás de un endpoint HTTP (FastAPI, TorchServe) o de los Inference Endpoints de HuggingFace, con requisitos de memoria por debajo de 1 GB en cuantización int8.
- Investigación académica en PLN: emplearlo como baseline reproducible en experimentos de detección de fake news, comparando su F1 con arquitecturas mayores. Requiere documentar el conjunto de evaluación, algo que la model card no hace.
- Clasificación masiva de corpus históricos: procesar por lotes decenas de miles de documentos de un archivo periodístico para etiquetar automáticamente su fiabilidad, aprovechando el tamaño reducido del modelo para ejecutarlo en paralelo en varias CPU.
- Filtrado previo en agregadores de noticias: descartar o marcar fuentes de baja calidad antes de mostrar el contenido al usuario final, con latencia baja al no requerir GPU.

## Benchmarks y rendimiento
El campo `model-index` del repositorio está vacío, por lo que no hay resultados publicados en conjuntos de referencia estándar (MMLU, GLUE, etc.). El autor declara métricas sobre un conjunto de evaluación propio cuya composición y dominio no se especifican, lo que impide cualquier comparación rigurosa con otros modelos.

Resultados finales declarados en la model card (conjunto de evaluación no identificado):

| Métrica | Valor |
|---|---|
| Loss | 0,1353 |
| Accuracy | 0,9732 |
| Precision | 0,9934 |
| Recall | 0,9527 |
| F1 | 0,9726 |

Evolución durante el entrenamiento:

| Época | Paso | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1,0 | 317 | 0,1278 | 0,9637 | 0,9803 | 0,9462 | 0,9630 |
| 2,0 | 634 | 0,1583 | 0,9573 | 0,9833 | 0,9304 | 0,9561 |
| 3,0 | 951 | 0,1253 | 0,9763 | 0,9839 | 0,9684 | 0,9761 |
| 4,0 | 1268 | 0,1278 | 0,9716 | 0,9656 | 0,9778 | 0,9717 |

No se han publicado resultados de benchmarks en la información disponible. No debe interpretarse que estas cifras sean comparables con las de otros modelos, ya que el conjunto de evaluación es desconocido y podría estar sesgado hacia el dominio de entrenamiento.

## Requisitos de hardware
- Peso de los pesos en memoria: aproximadamente 268 MB en fp32 (66.955.010 parámetros × 4 bytes) y unos 134 MB en fp16. En int8 bajaría a unos 67 MB. El total de VRAM en inferencia con lotes pequeños se mantiene por debajo de 1 GB.
- GPU: cabe con holgura en cualquier GPU de consumo con 2 GB o más de VRAM (GTX 1050 Ti, RTX 3050, RTX 3060, RTX 4090). Para alto throughput en servidor son suficientes una T4, L4 o A10; no se justifica el uso de A100 o H100 salvo por agregación de lotes muy grandes.
- CPU: es perfectamente ejecutable en CPU, incluidos portátiles, con tiempos de inferencia adecuados para volúmenes moderados.
- Opciones de despliegue: pipeline de transformers, HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), ONNX Runtime con cuantización int8 y servicios propios con FastAPI o TorchServe. vLLM puede servir modelos de clasificación en las versiones que lo soportan; TGI no cubre clasificación de secuencia de forma nativa, y Ollama no es la vía recomendada porque está orientado a modelos generativos en GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la model card ni en la información de la búsqueda.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fake-news-bert (bsgcasa) | 66.955.010 | 512 tokens | Clasificación de texto (fake news) | Apache 2.0 | HuggingFace, 0 descargas, model card incompleta |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Análisis de sentimiento (2 clases) | Apache 2.0 | HuggingFace, ampliamente descargado y validado |
| bert-base-uncased | ~110 M | 512 tokens | Modelo base (encoder) | Apache 2.0 | HuggingFace, referencia estándar |
| roberta-base | ~125 M | 512 tokens | Modelo base (encoder) | MIT | HuggingFace, referencia estándar |

La comparación de rendimiento no es posible: fake-news-bert no publica resultados en conjuntos de referencia y sus métricas proceden de un conjunto de evaluación no identificado. En términos de coste de inferencia, queda por debajo de bert-base-uncased y roberta-base gracias a sus 6 capas, pero también con menor capacidad de representación.

## Limitaciones y advertencias
- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento contienen literalmente "More information needed".
- Dataset de entrenamiento no identificado: aparece como "None". Se desconoce el dominio, la fuente, el idioma, el equilibrio de clases y el método de anotación, lo que impide evaluar sesgos y generalización.
- Esquema de etiquetas no documentado: no se indica cuántas clases hay, cuál es la positiva ni cómo interpretar la salida. El número de parámetros es coherente con una cabeza de 2 clases, pero es una inferencia, no un dato confirmado.
- Sesgo de idioma: el modelo base está entrenado fundamentalmente en inglés sin distinguir mayúsculas. No hay ninguna declaración de soporte multilingüe; su uso en castellano es una extrapolación sin evidencia.
- Sesgo de dominio: si el corpus de fine-tuning procedía de un medio, país o periodo concretos, el modelo fallará al aplicarse a otros contextos, fuentes o registros lingüísticos.
- Desequilibrio entre precision y recall: la precision declarada (0,9934) es claramente superior al recall (0,9527), lo que sugiere que el modelo tiende a ser conservador al asignar la clase positiva y produce más falsos negativos que falsos positivos.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo que no genera texto. El riesgo equivalente son las clasificaciones erróneas, con consecuencias editoriales o reputacionales si se automatiza la decisión final.
- Límite de 512 tokens: los textos más largos deben truncarse, lo que puede eliminar información relevante del cuerpo del artículo. El modelo está pensado para titulares, entradillas o fragmentos.
- Ausencia de validación externa: 0 descargas y 0 valoraciones en HuggingFace, sin resultados en conjuntos de referencia ni publicación asociada.
- Trazabilidad de versiones dudosa: la model card declara Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1, unas versiones que conviene verificar antes de intentar reproducir el entrenamiento.
- Licencia: los pesos se publican bajo Apache 2.0, que permite uso comercial, pero la licencia del dataset de entrenamiento no se documenta y podría imponer restricciones adicionales sobre el modelo derivado.
- Preprocesado desconocido: no se especifica el tratamiento de HTML, URLs, emojis ni texto en mayúsculas, factores que afectan de forma notable al rendimiento en este tipo de clasificadores.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/bsgcasa/fake-news-bert
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Resultados de la búsqueda web: no se ha recuperado ningún enlace relevante (paper, blog, repositorio o demo) sobre este modelo; los resultados obtenidos eran páginas genéricas de motor de búsqueda sin relación con el modelo.
