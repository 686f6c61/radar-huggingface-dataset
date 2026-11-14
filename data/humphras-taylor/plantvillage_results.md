# Humphras-Taylor/plantvillage_results

## Resumen

`plantvillage_results` es un modelo de clasificación de imágenes obtenido mediante fine-tuning de `google/mobilenet_v2_1.0_224`, una MobileNetV2 de 1.0 de factor de anchura y resolución de entrada de 224x224. Lo publica el usuario Humphras-Taylor en Hugging Face y está pensado para clasificación de imágenes, presumiblemente en el dominio agrícola dado el nombre del repositorio (referencia al dataset PlantVillage, aunque el autor no lo confirma en la model card). El modelo cuenta con 2.306.662 parámetros y se distribuye en formato safetensors compatible con la librería Transformers.

El interés de esta ficha es limitado desde el punto de vista de la investigación: se trata de un artefacto generado automáticamente por el Trainer de Hugging Face, con una model card incompleta en la que el autor no ha documentado el dataset, los usos previstos ni las limitaciones. El propio README indica explícitamente "More information needed" en varias secciones. Aun así, los resultados de validación declarados (accuracy 0.8460, loss 0.8311 tras 3 épocas) permiten hacerse una idea de su comportamiento en la tarea concreta para la que fue ajustado.

Por su tamaño reducido y su arquitectura MobileNetV2, el modelo es adecuado para inferencia en dispositivos con recursos limitados (CPU, móviles, edge), pero no debe considerarse un modelo de propósito general: no es un modelo de lenguaje ni un modelo multimodal generativo, sino un clasificador de imágenes cerrado cuyo vocabulario de clases no está documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN, factor de anchura 1.0, entrada 224x224) |
| Parametros totales | 2.306.662 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; al ser safetensors FP32/FP16 es convertible a INT8 mediante herramientas estándar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/mobilenet_v2_1.0_224`, una red neuronal convolucional MobileNetV2 con bloques de convolución separable en profundidad e inversiones residuales, diseñada originalmente para clasificación de imágenes en ImageNet con 1000 clases. El fine-tuning sustituye la cabeza de clasificación por una nueva adaptada al dataset del autor, aunque el número de clases resultante no se documenta en la información disponible.

El entrenamiento se realizó con el Trainer de Transformers durante 3 épocas, con learning rate 5e-05, batch size 32 (entrenamiento y evaluación), semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica ("on an unknown dataset" según la model card). No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador de imágenes. Tampoco se detalla el número de tokens ni la composición del dataset, dado que no aplica a este tipo de modelo. La evolución del entrenamiento muestra una mejora monótona: loss de validación 1.6432 en la época 1, 0.9870 en la época 2 y 0.8311 en la época 3, con accuracy de 0.6115, 0.7540 y 0.8460 respectivamente.

## Capacidades

- Clasificación de imágenes: el modelo asigna una etiqueta a una imagen de entrada, presumiblemente dentro del dominio de enfermedades de plantas (por el nombre del repositorio), aunque las clases concretas no están documentadas.
- Inferencia ligera: con 2.3 millones de parámetros, es apto para ejecución en CPU y dispositivos de borde.
- Compatibilidad con Transformers: se carga mediante `AutoModelForImageClassification` y el pipeline `image-classification`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales.
- No se documenta soporte de zero-shot ni de clasificación abierta: el vocabulario de clases está fijado por el fine-tuning.

## Casos de uso

- Diagnóstico de enfermedades de plantas en campo: si el modelo se ha ajustado sobre PlantVillage, podría clasificar imágenes de hojas en categorías de enfermedad o sanidad, integrándose en una aplicación móvil agrícola para alertar al agricultor. La idoneidad depende de que las clases coincidan con las del dataset original, algo no confirmado.
- Clasificación en dispositivos de borde: por su tamaño (2.3 M de parámetros) puede ejecutarse en Raspberry Pi, teléfonos Android o microcontroladores con aceleración, sin necesidad de GPU.
- Prefiltrado en pipelines de visión: puede actuar como primer clasificador rápido para descartar o etiquetar imágenes antes de pasarlas a un modelo mayor y más costoso.
- Investigación académica sobre fine-tuning de MobileNetV2: sirve como referencia reproducible de un ajuste con hiperparámetros documentados (lr 5e-05, 3 épocas, AdamW) para comparar con otras variantes.
- Prototipado rápido de clasificadores de imagen: al cargarse con el pipeline de Transformers, permite validar una idea de producto en minutos antes de invertir en un modelo mayor.
- Docencia y demostraciones: ejemplo sencillo de fine-tuning de un modelo preentrenado en ImageNet para una tarea concreta, útil en cursos de visión por computador.
- No es adecuado para tareas de generación de texto, razonamiento, código o matemáticas, al no ser un modelo de lenguaje.

## Benchmarks y rendimiento

Los únicos datos disponibles son los resultados de validación declarados por el autor en la model card. El model-index no incluye resultados formales (lista `results` vacía), por lo que no hay comparación con otros modelos.

| Metrica | Valor |
|---|---|
| Loss de validación (epoca 3) | 0.8311 |
| Accuracy de validación (epoca 3) | 0.8460 |
| Loss de validación (epoca 2) | 0.9870 |
| Accuracy de validación (epoca 2) | 0.7540 |
| Loss de validación (epoca 1) | 1.6432 |
| Accuracy de validación (epoca 1) | 0.6115 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ImageNet top-1, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (2.3 M de parámetros ≈ 9.2 MB de pesos, más activaciones y buffers); en la práctica, cualquier GPU con 1-2 GB es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) lo ejecuta sin problema.
- Cabe en cualquier GPU consumer, incluida las integradas y las de portátiles de gama baja.
- Opciones de despliegue: Transformers (pipeline `image-classification`), exportación a ONNX Runtime, TensorFlow Lite o Core ML para móvil; también es posible servirlo con TorchServe o FastAPI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en CPU moderna y throughput alto en lotes, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Humphras-Taylor/plantvillage_results | 2.306.662 | imagen 224x224 | accuracy 0.8460 en su validación (dataset no documentado) | other | Hugging Face |
| google/mobilenet_v2_1.0_224 | no disponible en la información | imagen 224x224 | no disponible en la información | no disponible en la información | Hugging Face |
| Otros fine-tunings de MobileNetV2 para clasificación de imágenes | variable | imagen 224x224 | no disponible | variable | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas (por ejemplo, ResNet-50, EfficientNet-B0 o ViT-B/16 ajustados a la misma tarea), ya que no se documenta el dataset ni el número de clases.

## Limitaciones y advertencias

- Dataset no documentado: la model card indica "on an unknown dataset", por lo que se desconoce el dominio real, el número de clases y la distribución de las mismas. El nombre del repositorio sugiere PlantVillage, pero no está confirmado.
- Model card incompleta: secciones de descripción, usos previstos, limitaciones y datos de entrenamiento marcadas como "More information needed".
- Riesgo de sobreajuste: con solo 3 épocas y un dataset no especificado, no se puede evaluar la generalización fuera de la distribución de validación.
- Sin evaluación externa: no hay benchmarks independientes ni validación cruzada; el accuracy 0.8460 corresponde únicamente al conjunto de evaluación del autor.
- Licencia "other" sin términos concretos: no se especifican condiciones de uso comercial, atribución ni restricciones, lo que impide asumir su uso en producción sin consultar al autor.
- Sesgos desconocidos: al no documentarse el dataset, no se pueden identificar sesgos de clase, iluminación, fondo o geografía.
- Sin capacidades de lenguaje: no debe emplearse para tareas de texto, razonamiento, código o matemáticas.
- Sin soporte multiidioma ni contexto textual: cualquier integración debe tratar el modelo como un clasificador de imágenes puro.
- Fecha de creación en el repositorio (2026-11-14) posterior a la fecha actual de referencia de esta ficha: conviene verificar la integridad y procedencia del artefacto antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Humphras-Taylor/plantvillage_results
- Modelo base: https://huggingface.co/google/mobilenet_v2_1.0_224
- Paper de MobileNetV2 (Sandler et al., 2018): https://arxiv.org/abs/1801.04381
- Dataset PlantVillage (referencia por el nombre del repositorio, no confirmada por el autor): https://arxiv.org/abs/1511.08060
- Documentación de Transformers para clasificación de imágenes: https://huggingface.co/docs/transformers/tasks/image_classification
