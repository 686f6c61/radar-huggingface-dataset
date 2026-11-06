# matthieulel/swinv2-small-patch4-window8-256-galaxy10-decals-full-v2

## Resumen

El modelo `swinv2-small-patch4-window8-256-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face matthieulel. Se trata de un ajuste fino completo (todos los parámetros actualizados) del backbone `microsoft/swinv2-small-patch4-window8-256`, un transformer jerárquico con atención por ventanas deslizantes, adaptado para clasificar imágenes astronómicas del conjunto Galaxy10 DECaLS en diez categorías morfológicas.

El modelo forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Su relevancia radica en que demuestra que un backbone de visión generalista de tamaño pequeño (48,9 millones de parámetros) puede alcanzar un 85,85 % de accuracy en una tarea científica especializada mediante ajuste fino completo, con un coste computacional muy contenido.

Con 48.967.108 parámetros y un repositorio de solo 0,2 GB, es un modelo ligero pensado para inferencia en una sola GPU, orientado a pipelines de análisis astronómico automatizado más que a aplicaciones de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con atención por ventanas) |
| Parámetros totales | 48.967.108 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión; entrada 256x256 px) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Swin Transformer V2, una arquitectura de visión que construye representaciones jerárquicas mediante bloques de atención local con ventanas desplazadas (window shift), lo que reduce el coste cuadrático de la atención frente a un ViT clásico. La variante empleada usa parches de 4x4 píxeles y ventanas de 8x8, con resolución de entrada de 256x256 píxeles. La cabeza de clasificación es una única capa lineal con diez salidas, una por clase morfológica.

El ajuste fino se realizó sobre Galaxy10 DECaLS (17.736 imágenes), dividido de forma estratificada en 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test (el split público de test se mantiene como conjunto de evaluación held-out). El recetario fue idéntico para los 40 backbones de la colección: AdamW con betas 0,9/0,999, epsilon 1e-8, weight decay 0,1, clipping de gradiente 1,0, learning rate 5e-5 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión fp32 con TF32 desactivado y una sola GPU. El aumento de datos consistió en random resized crop a la resolución de entrada y volteo horizontal aleatorio; en evaluación se aplica resize y center crop a 256x256 px seguido de la normalización del procesador de imágenes del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 16 de 30) con semilla 42. El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en diez clases morfológicas de galaxias del conjunto Galaxy10 DECaLS.
- Extracción de características visuales jerárquicas propias de Swin V2, reutilizables como backbone congelado para otras tareas de visión.
- Inferencia sobre imágenes de 256x256 píxeles con el procesador de imágenes incluido en el repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües (es un modelo puramente visual).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imagen.

## Casos de uso

- Clasificación morfológica automatizada en estudios de campo amplio: el modelo procesa recortes de 256x256 px de galaxias procedentes de DECaLS y asigna una de las diez clases morfológicas, lo que permite etiquetar catálogos de decenas de miles de objetos con una GPU consumer.
- Triaje previo a inspección humana: en pipelines de ciencia ciudadana o revisión experta, el modelo puede preclasificar candidatos y priorizar los casos ambiguos o de baja confianza para revisión manual, reduciendo el volumen de inspección.
- Etiquetado débil para entrenamiento semi-supervisado: las predicciones del modelo sobre imágenes no etiquetadas pueden servir como pseudoetiquetas para entrenar modelos mayores o refinar catálogos existentes.
- Extracción de embeddings para búsqueda por similitud: usando la salida del backbone Swin V2 antes de la cabeza lineal, se pueden construir índices vectoriales para recuperar galaxias visualmente similares en bases de datos astronómicas.
- Validación cruzada de catálogos morfológicos: el modelo puede aplicarse como clasificador independiente para detectar discrepancias con etiquetas existentes y señalar posibles errores de catalogación.
- Prototipado rápido en investigación astronómica: al requerir solo 0,2 GB de pesos y caber en GPUs de gama media, permite experimentar con clasificación morfológica en entornos con recursos limitados sin depender de infraestructura de gran escala.
- Benchmark de backbones de visión: al formar parte de una colección de 80 configuraciones con recetario idéntico, sirve como referencia reproducible para comparar arquitecturas de visión en datos científicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de test held-out de 1.774 imágenes, semilla 42, época 16 de 30, seleccionada por mínima pérdida de validación):

| Métrica | Valor (%) |
|---|---|
| Accuracy (semilla 42, época seleccionada) | 85,85 |
| F1 ponderado (semilla 42, época seleccionada) | 85,60 |
| Accuracy media ± desviación típica (semillas 42, 1, 2) | 85,40 ± 0,64 |
| F1 ponderado medio ± desviación típica (semillas 42, 1, 2) | 85,11 ± 0,75 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 48,9 millones de parámetros (aproximadamente 196 MB de pesos) más activaciones de un batch pequeño; en la práctica, cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. El entrenamiento se realizó en una sola GPU en fp32.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer de los últimos años, incluidas las de gama de entrada.
- Opciones de despliegue: transformers con PyTorch (vía `AutoModelForImageClassification`), exportación a ONNX, TorchScript o TensorRT para optimización; también es compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swinv2-small-patch4-window8-256-galaxy10-decals-full-v2 (este) | 48,97 M | 256x256 px | 85,85 % accuracy en Galaxy10 DECaLS test | apache-2.0 | Hugging Face |
| microsoft/swinv2-small-patch4-window8-256 (base) | no disponible en la información | 256x256 px | no disponible (backbone preentrenado en ImageNet, sin ajuste a galaxias) | no disponible en la información | Hugging Face |
| Otros backbones de la colección Vision Foundation Models Benchmark | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | Hugging Face (colección del autor) |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos comparables en la misma tarea, por lo que la comparativa cuantitativa queda limitada al backbone base y a la colección del propio autor.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para clasificación morfológica de galaxias en Galaxy10 DECaLS; fuera de ese dominio sus predicciones no son fiables.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en imágenes atípicas, artefactos o galaxias con morfología ambigua.
- Sesgos potenciales derivados de la distribución del conjunto Galaxy10 DECaLS: sesgo de selección de la muestra, desequilibrio entre clases y posible sobrerrepresentación de ciertos tipos morfológicos.
- Limitación de resolución: la entrada fija de 256x256 px puede perder estructura fina relevante en galaxias extensas o con detalles de bajo contraste.
- No soporta otros idiomas ni modalidades: es un modelo puramente visual, sin capacidades de texto, audio o vídeo.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset Galaxy10 DECaLS y del backbone base para cumplir con sus respectivas atribuciones.
- El modelo card indica que el artículo asociado está en revisión; los resultados deben considerarse no verificados de forma independiente (`verified: false` en el model-index).
- La integridad del checkpoint fue comprobada por el autor sobre las primeras 96 imágenes de test (predicciones idénticas al 100 %, diferencia máxima de logits de 8,11e-06), pero no se ha validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/swinv2-small-patch4-window8-256-galaxy10-decals-full-v2
- Backbone base: https://huggingface.co/microsoft/swinv2-small-patch4-window8-256
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación)
