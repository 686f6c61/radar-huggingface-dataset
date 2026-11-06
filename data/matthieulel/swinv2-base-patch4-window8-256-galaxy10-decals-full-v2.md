# matthieulel/swinv2-base-patch4-window8-256-galaxy10-decals-full-v2

## Resumen

El modelo `swinv2-base-patch4-window8-256-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face matthieulel. Se trata de un fine-tuning completo (todos los parámetros actualizados) del backbone `microsoft/swinv2-base-patch4-window8-256`, un transformer jerárquico con atención por ventanas deslizantes, adaptado al dataset Galaxy10 DECaLS con diez clases morfológicas. El resultado es un checkpoint de 86,9 millones de parámetros y 0,3 GB que resuelve una tarea concreta de astronomía observacional: clasificar imágenes de galaxias del sondeo DECaLS en categorías morfológicas.

El modelo forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Esto lo convierte en una pieza de un benchmark sistemático de modelos fundacionales de visión aplicados a datos astronómicos, más que en un modelo aislado. La relevancia actual reside en la creciente adopción de backbones de visión preentrenados en dominios científicos donde el etiquetado es costoso y los datasets son moderados, como es el caso de la morfología galáctica.

Con 85,51 % de accuracy y 85,32 % de F1 ponderado en el conjunto de test retenido (1.774 imágenes), el checkpoint ofrece un rendimiento sólido para una tarea de diez clases con datos limitados. Su licencia Apache 2.0 y su compatibilidad con la librería `transformers` facilitan su integración en pipelines de investigación y producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con atención por ventanas desplazadas y escalado de atención) |
| Parametros totales | 86.904.066 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 256x256 px) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 86,9 M de parámetros, la cuantización es viable pero no está documentada) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Swin Transformer V2, un transformer jerárquico que construye representaciones multiescala mediante parches de 4x4 píxeles y ventanas de atención de 8x8, con desplazamiento de ventanas entre bloques para permitir el flujo de información entre regiones. La variante V2 incorpora técnicas de estabilidad para el entrenamiento a mayor resolución y capacidad. Sobre el backbone se añade una única capa lineal con diez salidas, correspondientes a las clases morfológicas de Galaxy10 DECaLS.

El entrenamiento consistió en un fine-tuning completo (todos los parámetros actualizados) sobre Galaxy10 DECaLS, con 17.736 imágenes en total. El split público de test (1.774 imágenes) se reservó como conjunto de evaluación retenido; el split público de train se dividió de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación, usadas únicamente para seleccionar la época. La receta fue idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 5e-5, schedule lineal con 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos se limitó a random resized crop a la resolución de entrada y flip horizontal aleatorio. La evaluación aplica resize y center crop a 256x256 px con la normalización del procesador de imágenes del checkpoint. La época seleccionada fue la 17 (mínima pérdida de validación). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes de galaxias en diez clases morfológicas de Galaxy10 DECaLS.
- Extracción de características visuales multiescala mediante el backbone Swin V2, reutilizable para otras tareas de visión astronómica mediante fine-tuning.
- Inferencia sobre imágenes de 256x256 px con el procesador de imágenes incluido en el repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador de imágenes puro.
- No dispone de capacidades multilingües, de generación de texto ni de modo "thinking".
- No incorpora visión generativa, audio ni otras modalidades más allá de la clasificación visual.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en sondeos ópticos: el modelo puede procesar recortes de 256x256 px de imágenes DECaLS y asignar una de las diez clases morfológicas, sustituyendo la inspección visual manual en catálogos de gran volumen.
- Etiquetado asistido para construcción de catálogos: dado su rendimiento del 85,51 % de accuracy, puede usarse como primer filtro para preetiquetar imágenes y reservar la revisión humana para los casos de baja confianza.
- Estudio comparativo de backbones de visión en astronomía: al formar parte de una colección de 80 configuraciones con receta idéntica, sirve como referencia reproducible para evaluar el impacto del preentrenamiento y del régimen de adaptación.
- Detección de morfologías minoritarias: con un F1 ponderado de 85,32 %, es útil para tareas de triaje donde interesa identificar galaxias con morfologías poco frecuentes para seguimiento espectroscópico.
- Integración en pipelines de investigación reproducibles: la disponibilidad de pesos en safetensors, licencia Apache 2.0 y compatibilidad con `transformers` permite incorporarlo a flujos automatizados de análisis de imágenes astronómicas.
- Docencia y divulgación en astroinformática: como ejemplo compacto (86,9 M de parámetros, 0,3 GB) de fine-tuning completo de un backbone moderno sobre un dataset científico abierto, es adecuado para demostraciones y cursos prácticos.
- Baseline para experimentos de adaptación eficiente: al existir la variante de fine-tuning completo, permite comparar contra regímenes con congelación parcial o adaptadores en el mismo dataset y receta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test retenido de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época 17 de 30) | 85,51 % |
| F1 ponderado (seed 42, época 17 de 30) | 85,32 % |
| Accuracy media +/- desviación típica (seeds 42, 1, 2) | 84,91 % +/- 0,53 |
| F1 ponderado medio +/- desviación típica (seeds 42, 1, 2) | 84,75 % +/- 0,50 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks del artículo, más allá de la media sobre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB para los pesos (86,9 M de parámetros x 4 bytes) más el overhead de activaciones, que para un batch pequeño a 256x256 px se mantiene por debajo de 1-2 GB en total.
- VRAM estimada en fp16/bf16: alrededor de 0,18 GB para los pesos, con overhead de activaciones similar.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 o superiores, así como en A100, H100 y L4 para despliegues por lotes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: `transformers` con PyTorch (vía `AutoModelForImageClassification`), exportación a ONNX, TorchScript o TensorRT para inferencia optimizada; también es viable servirlo con Text Generation Inference no aplica (no es un modelo generativo), pero sí con frameworks de serving de visión como TorchServe o BentoML.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 86,9 M de parámetros, se espera un throughput alto en GPU moderna, pero el autor no publica cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones de la misma colección ni de alternativas comparables con métricas en el mismo split. La model card menciona que forma parte de una colección de 80 configuraciones (40 backbones x dos regímenes de adaptación), pero no incluye la tabla comparativa del artículo. Por tanto:

| Modelo | Parametros | Contexto/entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Swin V2 base, full fine-tuning) | 86,9 M | imagen 256x256 px | 85,51 % (test retenido) | Apache 2.0 | Hugging Face |
| Otros backbones de la colección | no disponible | no disponible | no disponible | no disponible | Hugging Face (colección Vision Foundation Models Benchmark) |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación morfológica de galaxias de Galaxy10 DECaLS; no es un modelo de propósito general y no debe esperarse un comportamiento correcto fuera de esa distribución de datos.
- El rendimiento se ha medido únicamente en el split de test retenido del propio dataset; no hay validación externa en otros sondeos o instrumentos, por lo que la generalización a imágenes de distinta procedencia, profundidad o resolución no está demostrada.
- Riesgo de sesgo de clase: el dataset Galaxy10 DECaLS tiene un desbalance inherente entre clases morfológicas; el F1 ponderado (85,32 %) es ligeramente inferior al accuracy (85,51 %), lo que sugiere un rendimiento algo peor en clases minoritarias.
- Riesgo de alucinación en sentido amplio: como clasificador, puede asignar con alta confianza una clase incorrecta en imágenes atípicas, ruidosas o con artefactos; se recomienda umbral de confianza y revisión humana en aplicaciones críticas.
- No dispone de mecanismos de abstención ni de estimación de incertidumbre calibrada documentada.
- La época seleccionada (17 de 30) se eligió por mínima pérdida de validación; las métricas de test en épocas posteriores son ligeramente inferiores, lo que indica un cierto sobreajuste a partir de ese punto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el artículo asociado está en revisión y la cita debe completarse tras su publicación.
- El modelo no procesa texto ni otras modalidades; cualquier uso que requiera razonamiento multimodal o generación queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-base-patch4-window8-256-galaxy10-decals-full-v2
- Modelo base: https://huggingface.co/microsoft/swinv2-base-patch4-window8-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona DOI en la información disponible).
