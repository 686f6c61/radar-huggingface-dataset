# matthieulel/beit-large-patch16-224-pt22k-galaxy10-decals-full-v2

## Resumen

El modelo `beit-large-patch16-224-pt22k-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face `matthieulel`. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `microsoft/beit-large-patch16-224-pt22k`, un transformer de visión tipo BEiT preentrenado con 22.000 imágenes ImageNet-22k. El modelo resuelve una tarea concreta: clasificar imágenes astronómicas del conjunto Galaxy10 DECaLS en diez categorías morfológicas de galaxias.

Forma parte de una colección más amplia denominada Vision Foundation Models Benchmark, que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación (full fine-tuning y, presumiblemente, adaptación paramétrica eficiente) siguiendo el protocolo revisado del artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Este checkpoint concreto corresponde a la configuración de full fine-tuning con semilla 42 y época 17 de 30, seleccionada por mínima pérdida de validación.

Con 303,1 millones de parámetros, entrada fija de 224x224 píxeles y licencia Apache 2.0, el modelo es relevante ahora porque demuestra que un backbone genérico de visión, ajustado con una receta estándar y un presupuesto de entrenamiento modesto (30 épocas, una GPU), alcanza un 86,70 % de accuracy en un problema de clasificación astronómica de diez clases, sirviendo como referencia reproducible para la comunidad de astronomía computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (Vision Transformer con preentrenamiento enmascarado tipo BERT), patch size 16, resolución 224x224 |
| Parametros totales | 303.147.466 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224x224 px, 196 parches de 16x16) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32; el autor no documenta cuantizaciones) |
| Idiomas soportados | no aplica (modelo de visión sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BEiT-large, un Vision Transformer con parches de 16x16 píxeles sobre imágenes de 224x224 (196 tokens de entrada). El preentrenamiento original de Microsoft se realizó sobre ImageNet-22k mediante modelado de lenguaje enmascarado sobre tokens visuales discretos. Sobre esta base, el autor sustituye la cabeza original por una única capa lineal con diez salidas, correspondientes a las diez clases morfológicas de Galaxy10 DECaLS, y actualiza todos los parámetros del modelo (full fine-tuning).

El entrenamiento emplea el conjunto Galaxy10 DECaLS (17.736 imágenes), con el split de test público (1.774 imágenes) reservado como test held-out y el split de train público dividido de forma estratificada en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10 % de warm-up, batches de 32 con acumulación sobre 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; en evaluación se aplica resize y center crop a 224x224 con la normalización del image processor del checkpoint. La selección de época se hace por mínima pérdida de validación (época 17 en la semilla 42). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en diez clases morfológicas de galaxias (Galaxy10 DECaLS).
- Extracción de características visuales de propósito general heredadas del preentrenamiento en ImageNet-22k, reutilizables como backbone congelado.
- Inferencia determinista sobre imágenes de 224x224 píxeles con la normalización del image processor asociado.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador puro de una sola pasada.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, audio ni thinking mode.
- No dispone de capacidades de agente ni de visión-lenguaje; la salida es un vector de logits de diez dimensiones.

## Casos de uso

- Clasificación morfológica automatizada en pipelines de imágenes de telescopios: el modelo recibe recortes de 224x224 px de galaxias procedentes de DECaLS y devuelve la clase morfológica, lo que permite procesar catálogos masivos sin inspección visual humana.
- Etiquetado previo para estudios de estructura galáctica a gran escala: sirve como primer filtro para separar espirales, elípticas e irregulares antes de un análisis morfológico más fino o de una revisión experta.
- Selección de muestras para seguimiento observacional: dado un catálogo de candidatos, el clasificador prioriza objetos de una clase concreta (por ejemplo, galaxias de disco) para asignar tiempo de telescopio.
- Benchmark reproducible de backbones de visión en astronomía: al formar parte de una colección de 80 configuraciones con receta idéntica, permite comparar de forma controlada el rendimiento de arquitecturas preentrenadas sobre el mismo conjunto de datos.
- Detección de anomalías morfológicas por clase de baja confianza: los logits permiten identificar galaxias cuya morfología no encaja claramente en ninguna de las diez clases, candidatas a revisión manual.
- Docencia y experimentación en astronomía computacional: el modelo, con licencia Apache 2.0 y 303 M de parámetros, se puede ejecutar en una GPU consumer para prácticas de clasificación morfológica y ajuste fino sobre subconjuntos del catálogo.
- Integración como backbone congelado en modelos mayores: las representaciones de BEiT-large pueden alimentar tareas posteriores como regresión de redshift fotométrico o detección de objetos, reutilizando los pesos ajustados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 17 de 30) | 86,70 % |
| F1 ponderado (semilla 42, época 17 de 30) | 86,50 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 86,08 +/- 0,80 % |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 85,78 +/- 0,92 % |

Evolución de la accuracy de test en la semilla 42 (épocas seleccionadas): 43,12 % en la época 1, 73,56 % en la época 2, 82,41 % en la época 4, 85,63 % en la época 11, 86,53 % en la época 16 y 86,70 % en la época 17 (seleccionada). A partir de la época 16 el rendimiento se estabiliza en torno al 86-86,6 %, con oscilaciones de hasta un punto porcentual entre épocas.

Comprobación de integridad declarada por el autor: el modelo recargado y ejecutado sobre las primeras 96 imágenes de test produce predicciones idénticas a los logits guardados de la época seleccionada en el 100,0 % de los casos, con una diferencia absoluta máxima de logits de 1,34e-05.

No se han publicado en la información disponible resultados comparativos con otros modelos del mismo benchmark ni con alternativas externas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2-1,5 GB para los pesos (303 M de parámetros x 4 bytes = 1,21 GB) más activaciones y buffers, lo que sitúa el consumo típico en torno a 2-3 GB con batches pequeños.
- En fp16/bf16: unos 0,6 GB de pesos, con consumo total estimado por debajo de 2 GB para batch 1.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para entrenamiento o fine-tuning completo se recomienda al menos 16-24 GB (el autor entrenó con una sola GPU en fp32, sin especificar el modelo).
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: transformers con PyTorch (vía `AutoModelForImageClassification`), exportación a ONNX Runtime, TorchScript o TensorRT para inferencia de baja latencia; también es compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un ViT-large con 196 tokens de entrada, se espera un throughput alto en GPU moderna para batches grandes, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de resultados de los otros backbones del mismo benchmark en la información proporcionada, por lo que no es posible establecer una comparativa numérica con alternativas. A modo de contexto estructural:

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beit-large-patch16-224-pt22k-galaxy10-decals-full-v2 | 303,1 M | 224x224 px | Clasificación Galaxy10 DECaLS (10 clases) | Apache 2.0 | Hugging Face |
| microsoft/beit-large-patch16-224-pt22k (base) | ~304 M | 224x224 px | Clasificación ImageNet-22k | Apache 2.0 | Hugging Face |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | no disponible | Clasificación Galaxy10 DECaLS | no disponible | Colección Hugging Face |

## Limitaciones y advertencias

- Modelo de dominio muy específico: entrenado exclusivamente para clasificar morfología de galaxias en Galaxy10 DECaLS; su uso fuera de ese dominio o de ese esquema de diez clases no está validado.
- Riesgo de sesgo de clase: la accuracy global del 86,70 % puede ocultar un rendimiento desigual entre clases morfológicas; el autor no publica métricas por clase en la información disponible.
- Sensibilidad al preprocesado: el modelo espera resize y center crop a 224x224 px con la normalización exacta del image processor; desviaciones en el pipeline de preprocesado pueden degradar las predicciones.
- Dependencia del split: los resultados se calculan sobre el split de test público de Galaxy10 DECaLS; no hay evaluación sobre imágenes de otros surveys o con otras condiciones de seeing y ruido.
- Sin verificación independiente: las métricas del model-index están marcadas como `verified: false`; proceden del propio autor.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento.
- Sin capacidades generativas ni conversacionales: no debe emplearse en tareas de texto, razonamiento o agentes; es un clasificador de una sola pasada.
- Tamaño de entrenamiento modesto: 14.188 imágenes de entrenamiento y 30 épocas; el rendimiento está próximo a la saturación observada a partir de la época 16, lo que sugiere margen limitado de mejora con la misma receta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/beit-large-patch16-224-pt22k-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/beit-large-patch16-224-pt22k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de enlace)
