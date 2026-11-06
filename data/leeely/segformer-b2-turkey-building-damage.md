# leeely/segformer-b2-turkey-building-damage

## Resumen

SegFormer-B2 para daño estructural en fotografías posteriores a terremotos es un modelo de segmentación semántica desarrollado por LeeEl Yehezkel (usuario `leeely`) que etiqueta cada píxel de una imagen a pie de calle tomada tras los terremotos de febrero de 2023 en Turquía. El modelo distingue entre fondo, maquinaria pesada, personal de rescate y seis niveles de daño estructural (A a F), siguiendo las categorías de triaje de obra de INSARAG. La salida por píxel puede reducirse a una puntuación única de daño por fotografía y, si las imágenes están georreferenciadas, interpolarse para construir un mapa de daño.

El modelo parte del checkpoint `smp-hub/segformer-b2-1024x1024-city-160k`, preentrenado en Cityscapes, y se ha reentrenado con 361 fotografías anotadas procedentes de un único terremoto. La arquitectura es un transformer de segmentación SegFormer-B2 con entrada de 1024 × 1024 píxeles y una cabeza de segmentación de 9 clases. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato PyTorch (`.pt`).

Su relevancia es doble: por un lado, demuestra la aplicación de modelos de segmentación genéricos a evaluación de daños post-desastre; por otro, sus resultados son modestos (mIoU global de 0,169 en el conjunto de test) y el autor lo presenta explícitamente como un artefacto de investigación para apoyo a la decisión en primera pasada, no para clasificación final de obras. La licencia es no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SegFormer-B2 (transformer jerárquico con decoder ligero, vía segmentation-models-pytorch) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1024 × 1024 píxeles) |
| Tipos de cuantización | no disponible (pesos distribuidos en PyTorch FP32; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica |
| Licencia | NVIDIA Source Code License for SegFormer (uso no comercial, investigación o evaluación) |
| Formato de pesos | PyTorch (`best_model.pt`) |
| Modelo base | `smp-hub/segformer-b2-1024x1024-city-160k` (Cityscapes) |
| Número de clases | 9 (fondo, maquinaria, personal, daño A–F) |
| Resolución de entrada | 1024 × 1024 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un SegFormer-B2, un transformer de segmentación semántica con encoder jerárquico y un decoder ligero tipo MLP, implementado mediante la librería `segmentation-models-pytorch`. Se parte del checkpoint preentrenado en Cityscapes `smp-hub/segformer-b2-1024x1024-city-160k`, cuya cabeza de 19 clases se sustituye por una nueva cabeza de 9 clases inicializada aleatoriamente. Durante el ajuste fino se congela el encoder y solo se entrenan el decoder y la cabeza de segmentación. La entrada es de 1024 × 1024 píxeles.

El conjunto de datos lo forman 361 fotografías anotadas (imágenes y máscaras publicadas en Kaggle), divididas en 249 de entrenamiento, 53 de validación y 59 de test mediante estratificación multilabel según la proporción de cada clase de daño. El entrenamiento usa entropía cruzada ponderada por la frecuencia mediana de cada clase, batch size de 4, aumentación de datos (volteos horizontales, rotaciones de 90°, desplazamiento, escala y rotación aleatorios, y variaciones de color), optimizador Adam con tasa de aprendizaje 1e-3, scheduler reduce-on-plateau y early stopping con paciencia 8. El checkpoint publicado corresponde a la época 21, la de menor pérdida de validación (1,563). La pérdida de test es 1,406, aunque calculada sobre imágenes aumentadas; las métricas que se presentan a continuación se calculan sobre las fotografías de test originales sin aumentar.

## Capacidades

- Segmentación semántica densa por píxel de fotografías a pie de calle en escenarios post-terremoto.
- Clasificación en 9 clases: fondo, maquinaria pesada, personal y seis niveles de daño estructural (A a F) según las categorías de triaje de obra de INSARAG.
- Reducción de la salida por píxel a una puntuación única de daño por fotografía (media ponderada o moda de las clases de daño).
- Generación de mapas de daño mediante interpolación IDW (potencia 5) de puntuaciones georreferenciadas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente visual de segmentación.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento explícito ni de visión general más allá de la segmentación.

## Casos de uso

- Apoyo a la decisión en primera pasada tras un terremoto: el modelo etiqueta cada píxel de una fotografía de calle y permite obtener una puntuación de daño por edificio, útil para priorizar inspecciones sobre el terreno antes de una evaluación estructural formal.
- Generación de mapas de daño a escala de barrio: combinando las puntuaciones por imagen con coordenadas GPS e interpolación IDW se obtienen mapas continuos de daño que orientan la asignación de equipos de rescate.
- Triaje de imágenes de dron o de móvil en centros de coordinación: las fotografías recibidas pueden procesarse automáticamente para descartar las que muestran daño leve y destacar las de colapso tipo E o F.
- Detección de maquinaria y personal en la escena: la segmentación de las clases 1 y 2 permite inventariar recursos presentes en la imagen, útil para logística de respuesta.
- Investigación en visión por computador aplicada a desastres: el modelo y el conjunto de datos anotado sirven como línea base reproducible para comparar nuevas arquitecturas de segmentación en este dominio.
- Formación y simulación: las salidas por píxel permiten construir materiales didácticos que ilustran los niveles de daño INSARAG sobre imágenes reales del terremoto de Turquía de 2023.
- Análisis retrospectivo de daño: procesar archivos fotográficos georreferenciados de una zona afectada para estimar la distribución espacial de niveles de daño y contrastarla con datos oficiales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test (59 fotografías originales sin aumentar):

| Medida | Valor |
|---|---|
| Precisión global a nivel de píxel (media de la diagonal de la matriz de confusión normalizada por filas) | 0,56 |
| mIoU a nivel de píxel, 9 clases / clases de daño A–F | 0,169 / 0,108 |
| MAE a nivel de imagen de la puntuación media ponderada (en clases) | 0,56 |
| MAE a nivel de imagen de la puntuación moda (en clases) | 1,00 |
| Precisión balanceada a nivel de imagen, media ponderada redondeada / moda | 0,49 / 0,43 |
| Correlación 2D de mapas de calor interpolados (IDW, potencia 5) sobre 361 fotos georreferenciadas | 0,81 |
| MAE de mapas de calor interpolados (en clases) | 0,37 |

A nivel de píxel el modelo es más preciso en fondo, maquinaria, personal y nivel de daño E, y menos preciso en los niveles B y D. La mayoría de los errores se producen entre niveles de daño contiguos. A nivel de imagen, la puntuación media ponderada apenas presenta sesgo global, pero sobreestima los niveles A a C. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la arquitectura SegFormer-B2 con entrada de 1024 × 1024, la inferencia en FP32 requiere del orden de pocos GB de VRAM, aunque el autor no publica cifras concretas.
- GPU recomendadas: no disponibles en la documentación del modelo.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño reducido del checkpoint sugiere que podría ejecutarse en GPU de consumo con memoria suficiente, pero no hay datos publicados.
- Opciones de despliegue: `segmentation-models-pytorch` con PyTorch (carga mediante `smp.from_pretrained` y `torch.load` del checkpoint `best_model.pt`); no se documentan exportaciones a ONNX, TensorRT, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de segmentación aplicados a daño post-terremoto en la información proporcionada. Como referencia cualitativa, el modelo base `smp-hub/segformer-b2-1024x1024-city-160k` es un SegFormer-B2 preentrenado en Cityscapes con 19 clases urbanas, pero no está especializado en daño estructural y no se han publicado métricas comparables en este dominio.

| Modelo | Tarea | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leeely/segformer-b2-turkey-building-damage` | Segmentación de daño post-terremoto (9 clases) | no disponible | 1024 × 1024 px | NVIDIA Source Code License (no comercial) | Hugging Face |
| `smp-hub/segformer-b2-1024x1024-city-160k` | Segmentación semántica urbana (19 clases) | no disponible | 1024 × 1024 px | no disponible | Hugging Face |
| Otros modelos de segmentación de daño | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor califica el modelo como artefacto de investigación para apoyo a la decisión en primera pasada, no para clasificación final de obras.
- El conjunto de datos es pequeño (361 fotografías) y procede de un único terremoto (Turquía, febrero de 2023), por lo que la generalización a otros contextos, países o tipologías constructivas no está validada.
- Rendimiento modesto: mIoU global de 0,169 y mIoU de las clases de daño de 0,108; precisión global por píxel de 0,56.
- Confusión frecuente entre niveles de daño contiguos (especialmente B y D) y sobreestimación sistemática de los niveles A a C en la puntuación media ponderada.
- Las pérdidas de validación y test publicadas se calcularon sobre imágenes aumentadas, lo que puede dificultar su comparación directa con otros trabajos.
- Sesgos conocidos: no se documentan análisis de sesgo por tipo de edificio, iluminación, ángulo de cámara o región geográfica.
- Riesgo de alucinación en sentido figurado: el modelo puede asignar niveles de daño a regiones sin daño real o confundir maquinaria con personal, dado el bajo mIoU.
- Licencia restrictiva: los pesos se distribuyen bajo la NVIDIA Source Code License for SegFormer, que permite únicamente uso no comercial (investigación o evaluación); el código del repositorio GitHub usa PolyForm Noncommercial 1.0.0.
- Los datos de entrenamiento están bajo CC BY-NC 4.0, lo que también limita el uso comercial.
- No se documentan limitaciones de idioma porque el modelo no procesa texto; no aplica.
- No hay información sobre cuantizaciones, exportaciones a otros formatos ni latencias medidas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leeely/segformer-b2-turkey-building-damage
- Repositorio GitHub (código, entrenamiento y evaluación): https://github.com/leeelyehezkel/Turkey-Building-Data
- Modelo base: https://huggingface.co/smp-hub/segformer-b2-1024x1024-city-160k
- Dataset de imágenes en Kaggle: https://www.kaggle.com/datasets/leeelyehezkel/turkey-gt-images
- Dataset de máscaras en Kaggle: https://www.kaggle.com/datasets/leeelyehezkel/turkey-gt-masks
- Citación (CITATION.cff): https://github.com/leeelyehezkel/Turkey-Building-Data/blob/main/CITATION.cff
- Licencia NVIDIA Source Code License for SegFormer: incluida en el repositorio del modelo (`LICENSE`)
- DOI del dataset de imágenes: https://doi.org/10.34740/KAGGLE/DSV/16676318
- DOI del dataset de máscaras: https://doi.org/10.34740/KAGGLE/DSV/16676359
