# Ai-Adam-Six-Sigma/melanoma-segmentation

## Resumen

El modelo `melanoma-segmentation` es un sistema de segmentación semántica binaria de lesiones cutáneas desarrollado por Ai-Adam-Six-Sigma (Sobanski), diseñado para aislar regiones de melanoma en imágenes dermoscópicas. Forma parte de un pipeline de análisis de melanoma en tres etapas (detección → segmentación → clasificación), donde este componente se encarga de generar máscaras binarias que distinguen la lesión del fondo de la imagen.

La arquitectura combina un U-Net con un encoder EfficientNet-B0 preentrenado en ImageNet, implementado mediante la librería `segmentation_models_pytorch`. El modelo trabaja con imágenes de entrada de 256×256 píxeles normalizadas a [0, 1] sin normalización estándar de ImageNet. Fue entrenado sobre el subconjunto de segmentación de lesiones de ISIC 2018 Task 1 durante 5 épocas, alcanzando un coeficiente de Dice de validación aproximado de 0,88. Su relevancia radica en ser un componente reproducible y de código abierto (Apache 2.0) para investigación en imagen médica, aunque el autor advierte explícitamente que no es un dispositivo médico certificado y no debe usarse para diagnóstico clínico sin validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder EfficientNet-B0 (backbone preentrenado en ImageNet) |
| Parametros totales | no disponible (no se publica el numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en float32, formato `.pth`) |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | `state_dict` de PyTorch (`unet_melanoma.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clásica de U-Net con un encoder EfficientNet-B0 preentrenado en ImageNet, implementado mediante la librería `segmentation_models_pytorch` (smp). El decoder reconstructivo del U-Net produce un mapa de logits de una sola clase (segmentación binaria lesión vs. fondo), seguido de una activación sigmoide y umbralización a 0,5 para obtener la máscara final. La entrada es una imagen RGB de 256×256 normalizada simplemente dividiendo por 255, sin normalización de media/desviación estándar de ImageNet.

El entrenamiento se realizó sobre el subconjunto de segmentación de lesiones de ISIC 2018 Task 1, con una partición secuencial (sin barajado) de las primeras 2.000 imágenes para entrenamiento y el resto para validación. Se empleó pérdida Dice binaria (`smp.losses.DiceLoss(mode='binary')`), optimizador Adam con tasa de aprendizaje de 0,001, tamaño de lote 8 y un total de 5 épocas. No se usó programación de la tasa de aprendizaje (learning rate scheduling), lo que explica las fluctuaciones en la pérdida de validación entre épocas. La pérdida de entrenamiento descendió de 0,2058 (época 1) a 0,0972 (época 5), mientras que la de validación alcanzó su mejor valor de 0,1126 en la época 3 (Dice ≈ 0,89) y terminó en 0,1194 (Dice ≈ 0,88).

## Capacidades

- Segmentación binaria de lesiones de melanoma en imágenes dermoscópicas (máscara de lesión vs. fondo).
- Procesamiento de imágenes RGB de 256×256 píxeles con normalización simple (escala [0, 1]).
- Integración en un pipeline de análisis de melanoma en tres etapas (detección → segmentación → clasificación), junto con el modelo `melanoma-classifier` del mismo autor.
- Inferencia en PyTorch con carga directa de pesos mediante `huggingface_hub`.
- Sin soporte de tool calling, agentes o razonamiento multi-paso (modelo puramente de visión).

## Casos de uso

- Investigación en imagen médica: el modelo sirve como componente de segmentación en experimentos académicos sobre análisis automático de lesiones cutáneas, permitiendo aislar el área del melanoma para análisis posteriores.
- Preprocesamiento para clasificación de melanoma: se integra en un pipeline de detección donde la máscara de segmentación se usa para recortar la región de interés antes de pasar a un clasificador (como el `melanoma-classifier` de EfficientNet-B0), mejorando el enfoque del modelo en la lesión.
- Educación en aprendizaje profundo para imagen médica: por su licencia Apache 2.0 y tamaño de entrada reducido, es un ejemplo didáctico de U-Net aplicado a segmentación biomédica, útil para estudiantes y desarrolladores que aprenden arquitecturas encoder-decoder.
- Prototipado de sistemas de apoyo al diagnóstico (no clínico): los desarrolladores pueden usar el modelo como punto de partida para crear demos o prototipos de investigación que evalúen la viabilidad de segmentación automática de melanoma, siempre con la advertencia de no uso clínico.
- Investigación sobre variabilidad de datos: el modelo permite estudiar el impacto de la división secuencial del dataset y la ausencia de programación de la tasa de aprendizaje en el rendimiento de validación, como se observa en las fluctuaciones de la pérdida.
- Comparación de encoders en U-Net: al usar EfficientNet-B0 como encoder, se puede comparar su rendimiento con otros backbones (ResNet, VGG, etc.) en la tarea de segmentación de lesiones, evaluando el equilibrio entre precisión y coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo solo reporta las métricas de entrenamiento y validación de la model card:

| Epoca | Loss de entrenamiento | Loss de validación | Dice de validación (1 - loss) |
|---|---|---|---|
| 1 | 0,2058 | 0,1386 | ≈ 0,86 |
| 2 | 0,1346 | 0,1583 | ≈ 0,84 |
| 3 | 0,1195 | 0,1126 | ≈ 0,89 |
| 4 | 0,1091 | 0,1340 | ≈ 0,87 |
| 5 | 0,0972 | 0,1194 | ≈ 0,88 |

Nota: la pérdida es Dice Loss (1 - coeficiente Dice), por lo que el mejor rendimiento de validación se da en la época 3 con Dice ≈ 0,89. No se proporcionan métricas adicionales (IoU, precisión, sensibilidad, especificidad) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: baja, dado el tamaño de entrada de 256×256 y el encoder EfficientNet-B0 (modelo ligero de ~5,3 millones de parámetros en el encoder, aunque el total no está publicado). Se puede ejecutar en GPUs con 2-4 GB de VRAM en fp32.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o incluso CPUs para inferencia puntual (el modelo es pequeño y la inferencia de una imagen es rápida).
- Compatibilidad con GPU consumer: sí, cabe en todas las GPUs consumer actuales (GTX 10xx en adelante con suficiente VRAM).
- Opciones de despliegue: se puede servir con cualquier framework PyTorch (TorchServe, FastAPI, etc.), o exportar a ONNX para inferencia optimizada con TensorRT u OpenVINO. No hay soporte directo para vLLM, llama.cpp u Ollama, ya que es un modelo de visión y no de lenguaje.
- Latencia estimada: no disponible, pero por el tamaño del modelo se espera una inferencia de decenas de milisegundos en una GPU moderna (ej. RTX 3090) y alrededor de 100-200 ms en CPU.

## Comparativa con modelos similares

No se dispone de información de comparativas con otros modelos de segmentación de melanoma (como U-Net con otros encoders, DeepLab, etc.) en la información proporcionada. El autor no publica benchmarks comparativos. En ausencia de datos verificables, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con imágenes dermoscópicas de ISIC 2018; el rendimiento con fotos de smartphone o imágenes clínicas no está validado.
- El dataset ISIC 2018 puede no representar de manera equilibrada todos los tonos de piel y tipos de lesión, lo que introduce sesgos potenciales.
- El modelo se entrenó solo 5 épocas con un split secuencial sin barajado, lo que puede causar un sobreajuste o una generalización subóptima; la pérdida de validación no disminuye de forma monótona.
- No es un dispositivo médico certificado; su uso está restringido a fines de investigación y educación. No debe emplearse para diagnóstico clínico sin validación profesional y aprobación regulatoria.
- El repositorio no incluye pesos cuantizados ni versiones optimizadas; el formato `.pth` requiere PyTorch para cargar el modelo.
- No se documentan los parámetros totales del modelo, ni métricas adicionales (IoU, precisión, sensibilidad), lo que limita la evaluación completa del rendimiento.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Ai-Adam-Six-Sigma/melanoma-segmentation
- Repositorio GitHub del pipeline completo: https://github.com/AdamSobanski/melanoma-pipline
- Perfil de HuggingFace del autor (modelo clasificador asociado): https://huggingface.co/Ai-Adam-Six-Sigma/models
- Publicación de LinkedIn del autor sobre el desarrollo: https://www.linkedin.com/posts/adam-soba%C5%84ski-4770a522_ai-adam-six-sigmamelanoma-segmentation-activity-7479542523061960704-df1J
- Dataset ISIC 2018 Task 1: https://challenge.isic-archive.com/data/#2018
