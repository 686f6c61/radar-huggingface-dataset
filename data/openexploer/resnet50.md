# OpenExploer/resnet50

## Resumen

ResNet-50 es un modelo de clasificación de imágenes basado en redes neuronales convolucionales residuales, propuesto originalmente por He et al. en 2015. Esta implementación concreta, publicada por el usuario OpenExploer en HuggingFace, está adaptada para su despliegue en hardware de Horizon Robotics (plataformas J6M y J6P) mediante el kit de herramientas HEAL. El modelo recibe una imagen RGB de 224×224 píxeles y produce logits de 1000 clases, correspondientes a las categorías de ImageNet. Su relevancia actual radica en que sigue siendo un backbone de referencia para tareas de visión por computadora en entornos de edge computing, donde se prioriza la latencia y el rendimiento por vatio.

La arquitectura consta de 4 etapas de bloques residuales con downsampling mediante stride=2, seguido de un pooling global y una capa fully connected. El modelo card indica que se entrenó con pérdida de entropía cruzada con label smoothing, y se reportan métricas de precisión y rendimiento específicas para los chips J6M y J6P. No se especifican el número total de parámetros ni el formato de pesos en la información proporcionada, aunque el tamaño del repositorio (0.6 GB) sugiere pesos en precisión float32 o cuantizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN residual, 4 etapas de bloques residuales) |
| Parametros totales | no disponible (la arquitectura estándar tiene ~25,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se menciona calibración y hbm, pero sin detalle) |
| Idiomas soportados | no aplica (procesa imágenes) |
| Licencia | other (sin especificar términos) |
| Formato de pesos | no disponible (repo de 0.6 GB, probablemente safetensors o binario) |

## Arquitectura y entrenamiento

ResNet-50 sigue el diseño original de la familia ResNet: 4 etapas de bloques residuales con conexiones de atajo (skip connections) que permiten entrenar redes profundas sin degradación. Cada etapa reduce la resolución espacial mediante convoluciones con stride=2. Tras la última etapa, se aplica un global average pooling y una capa fully connected que produce logits de 1000 clases. La función de pérdida utilizada es `CEWithLabelSmooth` (entropía cruzada con label smoothing), una técnica que suaviza las etiquetas para mejorar la generalización.

El modelo card indica que esta implementación está preparada para el despliegue en hardware Horizon (march NASH_M para J6M y J6P) usando el compilador hbdk4 y la extensión horizon_plugin_pytorch. No se proporcionan detalles sobre el dataset de entrenamiento, pero por la naturaleza del modelo se asume que fue entrenado en ImageNet-1K. Tampoco se mencionan técnicas como RLHF o DPO, que no son aplicables a modelos de visión.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (logits de salida, argmax para la clase predicha).
- Uso como backbone para tareas de visión más complejas (detección de objetos, segmentación) al extraer características de las capas intermedias.
- Inferencia optimizada para hardware Horizon J6M y J6P, con soporte de cuantización (calibración y hbm) para reducir latencia y memoria.
- Entrada de imagen única RGB de 224×224, salida de logits de clasificación.
- No soporta procesamiento de texto, tool calling ni capacidades multimodales más allá de la visión.

## Casos de uso

- Clasificación de imágenes en dispositivos edge: el modelo puede desplegarse en cámaras inteligentes o sistemas embebidos basados en Horizon J6M/J6P para clasificar objetos en tiempo real, aprovechando la latencia de 0.90 ms y 1493 FPS reportados en J6M.
- Backbone para detección de objetos: las características extraídas de las capas intermedias pueden alimentar cabezales de detección (como Faster R-CNN o YOLO) para localizar objetos en imágenes, dado que ResNet-50 es un backbone estándar en estos sistemas.
- Filtrado de contenido visual: moderación automática de imágenes en plataformas sociales, clasificando contenido en categorías predefinidas.
- Diagnóstico médico asistido: clasificación de imágenes médicas (rayos X, retinografías) en categorías de patologías, siempre que se ajuste el clasificador final.
- Sistemas de recomendación visual: etiquetado automático de productos en catálogos de comercio electrónico para mejorar la búsqueda y la organización.
- Robótica y automatización: reconocimiento de objetos en entornos industriales para guiar brazos robóticos o vehículos autónomos, gracias a su baja latencia en hardware dedicado.

## Benchmarks y rendimiento

El modelo card reporta las siguientes métricas para la configuración J6M (march NASH_M):

| Metrica | Valor |
|---|---|
| Accuracy (top-1) | 0.774 |
| Accuracy (top-5) | no disponible |
| Latencia (J6M, single-core single-thread) | 0.90 ms |
| FPS (J6M, single-core eight-thread) | 1493.65 |
| Uso de memoria DDR (J6M) | 28.80 (unidades no especificadas) |
| Latencia (J6P) | 0.59 ms |
| FPS (J6P) | 6008.89 |
| Uso de memoria DDR (J6P) | 29.10 |

No se proporcionan resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, etc.) porque no aplican a un modelo de visión. La precisión top-1 de 0.774 es consistente con la de ResNet-50 estándar en ImageNet (alrededor de 0.75-0.76), aunque no se especifica el dataset exacto de evaluación.

## Requisitos de hardware

- El modelo está diseñado para hardware Horizon Robotics J6M y J6P, con métricas de rendimiento medidas en esas plataformas (ver tabla de benchmarks).
- No se proporcionan requisitos de VRAM para GPUs convencionales. Dado que ResNet-50 tiene ~25,6 M de parámetros, en float32 ocuparía unos 100 MB, por lo que cabría en cualquier GPU consumer (por ejemplo, RTX 3060 con 12 GB) sin problemas.
- Para inferencia en GPU, se podría usar PyTorch o TensorRT, pero no hay datos de latencia/throughput en estas plataformas.
- El despliegue en hardware Horizon requiere el kit HEAL (heal 0.0.2, hbdk4-compiler 4.11.11, horizon_plugin_pytorch 3.3.10) según el modelo card.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información comparativa directa en la documentación proporcionada. Sin embargo, se pueden comparar las características generales con otras implementaciones de ResNet-50:

| Modelo | Parámetros | Precisión top-1 (ImageNet) | Licencia | Formato |
|---|---|---|---|---|
| OpenExploer/resnet50 (este) | no disponible | 0.774 | other | no disponible |
| torchvision ResNet-50 (pytorch/vision) | ~25,6 M | ~0.761 | BSD-3 | PyTorch |
| onnxmodelzoo/resnet50-v2-7 | ~25,6 M | ~0.75 | MIT | ONNX |
| microsoft/resnet-50 | ~25,6 M | no disponible | MIT | ONNX |

La principal diferencia de esta implementación es su optimización para hardware Horizon, que no está presente en las versiones genéricas. No se dispone de datos de rendimiento comparativo en las mismas condiciones.

## Limitaciones y advertencias

- La licencia "other" no especifica los términos de uso; es necesario contactar al autor para aclarar si permite uso comercial o modificaciones.
- No se proporciona información sobre el dataset de entrenamiento ni sobre posibles sesgos. Al ser un modelo entrenado en ImageNet, puede presentar sesgos hacia las categorías y demografía de ese dataset.
- La precisión reportada (0.774) es inferior a la de modelos más modernos (por ejemplo, EfficientNet o ConvNeXt), por lo que no es adecuado para aplicaciones que requieran el estado del arte.
- No se indican limitaciones de contexto ni de idioma, al ser un modelo de visión.
- El rendimiento en hardware Horizon está medido con configuraciones específicas (single-core, multi-thread) y puede variar en otros entornos.
- No se menciona si el modelo soporta entrada de lote variable o si requiere un tamaño fijo de 224×224.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExploer/resnet50
- Paper original (Deep Residual Learning for Image Recognition): https://arxiv.org/abs/1512.03385
- Repositorio oficial de torchvision (implementación de referencia): https://github.com/pytorch/vision
- Implementación de NVIDIA ResNet50 v1.5: https://github.com/NVIDIA/DeepLearningExamples/blob/master/PyTorch/Classification/ConvNets/resnet50v1.5/README.md
- ResNet50 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/resnet50
