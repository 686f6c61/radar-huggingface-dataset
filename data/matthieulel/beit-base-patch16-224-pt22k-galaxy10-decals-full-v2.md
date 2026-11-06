# matthieulel/beit-base-patch16-224-pt22k-galaxy10-decals-full-v2

## Resumen

`matthieulel/beit-base-patch16-224-pt22k-galaxy10-decals-full-v2` es un modelo de clasificación de imágenes especializado en morfología de galaxias, obtenido mediante ajuste fino completo (todos los parámetros actualizados) del backbone `microsoft/beit-base-patch16-224-pt22k` sobre el conjunto de datos Galaxy10 DECaLS. Lo desarrolla el usuario de Hugging Face `matthieulel` en el marco de un estudio comparativo más amplio (40 backbones preentrenados bajo dos regímenes de adaptación) recogido en el paper *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Forma parte de la colección Vision Foundation Models Benchmark.

El modelo resuelve una tarea concreta y acotada: clasificar imágenes de galaxias en 10 clases morfológicas. No es un modelo generativo ni multimodal de propósito general; es un clasificador de imagen con una cabeza lineal de 10 salidas sobre un transformer ViT de tipo BEiT. Con 85,67 millones de parámetros y un repositorio de 0,3 GB, es lo bastante ligero como para desplegarse en una GPU de consumo.

Su relevancia ahora es doble: por un lado, ofrece un punto de referencia reproducible (semillas, épocas, splits y métricas por época publicados) para evaluar modelos de visión fundacionales en datos astronómicos; por otro, demuestra que un backbone preentrenado en ImageNet-22k adaptado con ajuste fino completo alcanza alrededor del 85,6 % de accuracy en Galaxy10 DECaLS, un dato útil para quien necesite un clasificador morfológico listo para usar o como línea base en experimentos de astronomía computacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BEiT (Vision Transformer con preentrenamiento tipo BERT), patch size 16, resolución 224x224, cabeza lineal de 10 clases |
| Parámetros totales | 85.673.818 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; al ser un ViT de 85,7 M de parámetros es compatible con fp16, bf16 e int8 mediante herramientas estándar) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es BEiT-base: un transformer de visión con parches de 16x16 píxeles sobre entradas de 224x224, preentrenado por Microsoft sobre ImageNet-22k (`microsoft/beit-base-patch16-224-pt22k`). Sobre ese backbone se añade una única capa lineal con diez salidas, una por clase morfológica de Galaxy10 DECaLS. El ajuste fino es completo: se actualizan los 85,67 M de parámetros, no solo la cabeza.

El protocolo de entrenamiento está documentado con detalle. Datos: Galaxy10 DECaLS con 17.736 imágenes; el split de test público (1.774 imágenes) se reserva como test held-out y el split de train público se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. Receta idéntica para los 40 backbones del estudio: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10 % de warm-up, batches de 32 con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. Aumentación: random resized crop a la resolución de entrada y flip horizontal aleatorio. Evaluación: resize y centre crop a 224x224 px con la normalización del image processor del checkpoint. La selección de época se hace por mínima pérdida de validación (época 17 en la semilla 42). Software: PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1, torchvision 0.18.0.

Como control de integridad, el autor recargó el checkpoint y lo ejecutó sobre las primeras 96 imágenes de test: las predicciones coinciden con los logits guardados de la época seleccionada en el 100 % de los casos, con una diferencia absoluta máxima de 1,66e-05.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas de Galaxy10 DECaLS.
- Inferencia sobre imágenes RGB de 224x224 px con el preprocesado estándar (resize, centre crop, normalización del processor).
- Salida de logits por clase, apta para umbrales, calibración o análisis de incertidumbre posterior.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación de texto.
- Reproducibilidad: métricas por época, semillas y splits publicados en el dataset `vision-foundation-models-benchmark-runs`.

## Casos de uso

- Clasificación morfológica automatizada en catálogos astronómicos: el modelo recibe recortes de 224x224 px de galaxias procedentes de DECaLS y devuelve la clase morfológica, lo que permite etiquetar lotes de imágenes sin intervención humana y a un coste computacional bajo (85,7 M de parámetros).
- Línea base en experimentos de astronomía computacional: al estar integrado en un benchmark de 40 backbones con receta idéntica, sirve como referencia contra la que comparar nuevos backbones o estrategias de adaptación (linear probing frente a ajuste fino completo).
- Filtrado y triaje previo en pipelines de observación: clasificar candidatos antes de un análisis morfológico más costoso (por ejemplo, ajustes de perfil de brillo o inspección visual), reduciendo el volumen que llega a las etapas caras.
- Etiquetado asistido para construcción de datasets: usar las predicciones del modelo como propuesta inicial que un experto revisa, acelerando la anotación de nuevas muestras morfológicas.
- Docencia y divulgación en astroinformática: ejemplo reproducible y ligero para enseñar ajuste fino de modelos de visión fundacionales sobre datos científicos, con métricas y protocolo completamente documentados.
- Despliegue en hardware modesto: al caber en una GPU de consumo e incluso en CPU para inferencia por lotes pequeños, permite clasificación local en entornos con recursos limitados o en estaciones de trabajo de observatorios.
- Análisis de desbalance de clases: las métricas por clase y el weighted F1 publicado (85,38 %) facilitan estudiar el comportamiento del modelo en las clases minoritarias de Galaxy10 DECaLS.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el test held-out de Galaxy10 DECaLS con 1.774 imágenes:

| Métrica | Valor |
|---|---|
| Accuracy (semilla 42, época 17 de 30) | 85,51 % |
| Weighted F1 (semilla 42, época 17 de 30) | 85,38 % |
| Accuracy media ± desviación típica (semillas 42, 1, 2) | 85,61 ± 0,16 % |
| Weighted F1 media ± desviación típica (semillas 42, 1, 2) | 85,35 ± 0,12 % |

Evolución seleccionada del entrenamiento (semilla 42): la accuracy de test pasa de 48,70 % en la época 1 a 77,17 % en la época 3, 82,81 % en la época 10 y 84,84 % en la época 15, alcanzando 85,51 % en la época 17 (mínima pérdida de validación, 0,4355). En épocas posteriores la accuracy de validación sigue subiendo (86,81 % en la época 29) mientras la de test se estabiliza en torno al 85,4-85,7 %, lo que sugiere un inicio de sobreajuste.

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (85,67 M de parámetros), en torno a 0,2 GB en fp16/bf16. Con overhead de activaciones y batches grandes, menos de 2 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque para este tamaño las GPU de consumo son la opción natural.
- Cabe holgadamente en GPU de consumo; también es viable en CPU para inferencia por lotes pequeños o moderados.
- Opciones de despliegue: transformers con PyTorch (vía `AutoModelForImageClassification`), exportación a ONNX Runtime o TensorRT para latencia baja, y TorchServe o FastAPI como envoltorio de servicio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de modelos alternativos sobre Galaxy10 DECaLS con la misma receta, por lo que la comparación numérica de rendimiento no está disponible. La comparación estructural con alternativas habituales de la misma categoría es la siguiente:

| Modelo | Parámetros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BEiT-base fine-tuned) | 85,67 M | ViT, clasificación 10 clases | Imagen 224x224 px | Apache 2.0 | Hugging Face, transformers |
| microsoft/beit-base-patch16-224-pt22k | ~86 M | ViT preentrenado ImageNet-22k | Imagen 224x224 px | Apache 2.0 (según modelo base) | Hugging Face, transformers |
| Otros backbones del benchmark (40 configuraciones) | variable | ViT, CNN y variantes | Imagen 224x224 px | según backbone | Colección Vision Foundation Models Benchmark |

El valor diferencial frente al backbone original es la cabeza de clasificación morfológica entrenada y las métricas reproducibles; frente a los demás backbones del benchmark, la ventaja es la receta idéntica que permite comparación justa, aunque los resultados de esos otros modelos no se detallan en la información disponible.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo clasifica morfología de galaxias en las 10 clases de Galaxy10 DECaLS; no es un modelo generativo ni multimodal y no debe esperarse de él ningún comportamiento fuera de esa tarea.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea: la accuracy ronda el 85,5 %, lo que implica aproximadamente un 14,5 % de errores en el test, con posible sesgo hacia clases mayoritarias.
- Sesgos de dominio: entrenado exclusivamente con imágenes DECaLS; el rendimiento puede degradarse en datos de otros sondeos, con distinta profundidad, resolución, ruido o banda fotométrica.
- Resolución fija de 224x224 px: galaxias extensas o con estructura fina pueden perder información tras el resize y el centre crop.
- Sobreajuste apreciable: la accuracy de validación sigue creciendo hasta la época 29 mientras la de test se estanca, lo que indica que la época seleccionada (17) es una elección conservadora pero el margen de mejora es limitado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base y del dataset Galaxy10 DECaLS por si imponen requisitos adicionales de atribución o uso.
- Benchmarks no verificados de forma independiente: las métricas las declara el autor y están marcadas como `verified: false` en el model-index.
- Sin información sobre cuantizaciones oficiales ni sobre latencia medida; cualquier cifra de rendimiento en producción debe medirse en el entorno concreto.
- Fecha de creación del repositorio inusual (2026-10-30) según los metadatos de Hugging Face; conviene verificar la vigencia del checkpoint antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/beit-base-patch16-224-pt22k-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/beit-base-patch16-224-pt22k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada (2026); cita pendiente de publicación según el autor.
