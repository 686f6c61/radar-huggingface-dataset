# DeKUT-DSAIL/efficientnetv2-xl-cifar10-native

## Resumen

EfficientNetV2-XL ajustado fino sobre CIFAR-10 a resolución nativa de 32x32 píxeles, con el stem de la red adaptado para aceptar imágenes de ese tamaño sin upsampling. El modelo parte de los pesos preentrenados en ImageNet de `tf_efficientnetv2_xl` de la librería timm y se ha fine-tuneado sobre el dataset CIFAR-10 como parte de un estudio que compara el rendimiento de trabajar a resolución nativa frente a redimensionar las imágenes. Lo desarrolla el grupo DeKUT-DSAIL, con licencia MIT.

Con 207,6 millones de parámetros, el modelo está diseñado para clasificación de imágenes en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión). Su relevancia radica en demostrar que una arquitectura de alto rendimiento como EfficientNetV2 puede adaptarse a resoluciones muy bajas (32x32) manteniendo una precisión competitiva, lo que abre vías para aplicaciones con restricciones de cómputo o imágenes de pequeño tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-XL (CNN con bloques MBConv y Fused-MBConv) |
| Parametros totales | 207.628.642 (según safetensors; la model card indica 206,85M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EfficientNetV2-XL es una red neuronal convolucional basada en bloques MBConv (mobile inverted bottleneck) y Fused-MBConv, con una escalabilidad optimizada para equilibrar precisión y eficiencia. El modelo original se preentrenó en ImageNet y posteriormente se fine-tuneó sobre CIFAR-10. La adaptación clave consiste en modificar el stem de la red para aceptar entradas de 32x32 píxeles directamente, con un kernel 3x3 y stride 1, en lugar de redimensionar las imágenes a la resolución típica de 224x224. No se dispone de información sobre el número de tokens de entrenamiento, el dataset de preentrenamiento (más allá de ImageNet) ni el uso de técnicas como RLHF o DPO, al tratarse de un problema de clasificación supervisada.

## Capacidades

- Clasificación de imágenes en 10 categorías de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Salida de probabilidades por clase, útil para análisis de confianza o umbrales personalizados.
- Inferencia a resolución nativa de 32x32, lo que reduce el coste computacional frente a modelos que requieren redimensionamiento.
- Preprocesamiento específico documentado: resize a 32x32 y normalización con media `[0.4914, 0.4822, 0.4465]` y desviación `[0.247, 0.2435, 0.2616]`.
- Integración sencilla con la librería timm y PyTorch, mediante el cargador `CIFAR10Classifier` proporcionado en el repositorio de entrenamiento.

## Casos de uso

- Clasificación de imágenes de pequeño tamaño en entornos embebidos o con recursos limitados: al trabajar a 32x32, el modelo puede ejecutarse en dispositivos con poca memoria y CPU modesta, manteniendo una precisión superior al 97% en CIFAR-10.
- Prototipado rápido de sistemas de visión: gracias a su API simple (`CIFAR10Classifier.from_pretrained`), es adecuado para validar conceptos de clasificación de objetos en imágenes pequeñas sin necesidad de infraestructura compleja.
- Benchmarking académico: sirve como referencia para estudios sobre el impacto de la resolución de entrada en arquitecturas de alto rendimiento, comparando con modelos que usan upsampling.
- Backbone para detección de objetos en imágenes de baja resolución: las características extraídas por las capas convolucionales pueden reutilizarse en arquitecturas como Faster R-CNN o YOLO para tareas de detección en entornos con imágenes pequeñas.
- Educación y experimentación: útil para enseñar fine-tuning de modelos preentrenados, adaptación de stems y evaluación de métricas como ECE (calibración) en problemas de clasificación multiclase.
- Sistemas de clasificación en tiempo real con restricciones de latencia: al procesar imágenes de 32x32, el throughput es alto, lo que permite aplicaciones en streaming o vigilancia con cámaras de baja resolución.

## Benchmarks y rendimiento

Según la model card, los resultados en el conjunto de test de CIFAR-10 (10.000 imágenes) son:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 97.02% |
| Top-5 accuracy | 99.85% |
| F1 (macro) | 0.9702 |
| AUC (macro) | 0.9976 |
| ECE (error de calibracion esperado) | 0.1227 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo pesa aproximadamente 0.8 GB en safetensors, por lo que requiere al menos 1 GB de RAM para cargar los pesos en memoria.
- Inferencia en CPU: viable para imágenes de 32x32, con latencia del orden de decenas de milisegundos por imagen en un procesador moderno (estimación razonable dada la resolución y el tamaño del modelo).
- Inferencia en GPU: cabe en GPUs con 4 GB de VRAM o más (por ejemplo, NVIDIA GTX 1650, RTX 3060, etc.). Una RTX 4090 o A100 ofrecería throughput muy alto.
- Despliegue: al ser un modelo timm/PyTorch, puede servirse con TorchServe, FastAPI, o convertirse a ONNX para optimización. No se menciona compatibilidad con vLLM, llama.cpp u Ollama (orientados a modelos de lenguaje).
- Para entrenamiento o fine-tuning adicional, se recomienda una GPU con al menos 8 GB de VRAM, aunque el fine-tuning completo en CIFAR-10 se puede realizar en GPUs de gama media.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría comparar con otros clasificadores de CIFAR-10 como ResNet-50 o ViT-Tiny, pero no hay datos de rendimiento publicados para esos modelos en este contexto.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en CIFAR-10, por lo que solo reconoce las 10 clases de ese dataset. No es adecuado para clasificación de imágenes generales fuera de ese dominio.
- La resolución nativa de 32x32 limita la capacidad de distinguir objetos muy pequeños o detalles finos, incluso con la arquitectura de alto rendimiento.
- El ECE de 0.1227 indica una calibración moderada: las probabilidades de salida pueden no reflejar con precisión la confianza real del modelo, lo que debe tenerse en cuenta en aplicaciones donde se usen umbrales de confianza.
- No se han reportado estudios de sesgos o robustez frente a perturbaciones de entrada; el modelo puede ser sensible a cambios en la distribución de las imágenes (por ejemplo, variaciones de iluminación o ruido).
- Al ser un modelo de investigación, no se garantiza soporte ni mantenimiento continuo por parte de los autores.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y el usuario es responsable de validar su comportamiento en el dominio de aplicación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/DeKUT-DSAIL/efficientnetv2-xl-cifar10-native)
- Repositorio de entrenamiento mencionado en la model card (no se proporciona URL directa en la información disponible).
