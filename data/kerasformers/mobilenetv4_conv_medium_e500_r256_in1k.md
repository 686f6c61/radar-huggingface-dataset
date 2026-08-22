# kerasformers/mobilenetv4_conv_medium_e500_r256_in1k

## Resumen

El modelo `kerasformers/mobilenetv4_conv_medium_e500_r256_in1k` es una conversión a Keras 3 del checkpoint `timm/mobilenetv4_conv_medium.e500_r256_in1k`, un clasificador de imágenes basado en la arquitectura MobileNetV4. Lo desarrolla el proyecto KerasFormers, que ofrece implementaciones de modelos de visión en Keras 3 con soporte multi-backend (TensorFlow, PyTorch y JAX). El modelo original fue entrenado por Ross Wightman con scripts de timm sobre ImageNet-1k a resolución 256, siguiendo los hiperparámetros del paper MobileNetV4 (arXiv:2404.10518). Su relevancia actual radica en ser una de las arquitecturas más eficientes para el ecosistema móvil, con un equilibrio destacado entre latencia y precisión, y ahora disponible en un formato unificado para diferentes frameworks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 (convolucional, con bloques Universal Inverted Bottleneck - UIB) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se carga con `from_weights` de kerasformers) |

## Arquitectura y entrenamiento

El modelo es una conversión pura en Keras 3 del checkpoint original de timm, que implementa la arquitectura MobileNetV4. Esta arquitectura se caracteriza por el bloque Universal Inverted Bottleneck (UIB), que unifica los diseños de MobileNetV2 y MobileNetV3, y en su variante híbrida incorpora atención Mobile Multi-Query Attention (Mobile MQA). En este caso concreto, al ser la versión `conv`, solo utiliza bloques convolucionales, sin atención. El entrenamiento fue realizado por Ross Wightman con scripts de timm, usando hiperparámetros inspirados en el paper original y mejoras propias de timm. La resolución de entrenamiento es de 256x256 píxeles, y el modelo se entrenó en el conjunto ImageNet-1k. La conversión a Keras 3 permite ejecutar la misma implementación sin modificaciones en TensorFlow, PyTorch o JAX, lo que facilita su integración en ecosistemas heterogéneos.

## Capacidades

- Clasificación de imágenes: genera logits de clase para las 1000 categorías de ImageNet-1k.
- Extracción de características (backbone): proporciona características multiescala en 5 etapas con stride 2, útil para tareas como detección de objetos, segmentación semántica o recuperación de imágenes.
- Soporte multi-backend: funciona indistintamente con TensorFlow, PyTorch y JAX, gracias a la capa de abstracción de Keras 3.
- Preprocesamiento integrado: el clasificador normaliza internamente las imágenes con la media y desviación estándar de ImageNet, simplificando la inferencia.
- Flexibilidad de carga: permite cargar pesos desde el hub de KerasFormers o desde los checkpoints originales de timm mediante `hf:timm/...`.

## Casos de uso

- Clasificación de imágenes en dispositivos móviles: su arquitectura eficiente permite ejecutar el modelo en tiempo real en smartphones y dispositivos de bajo consumo, por ejemplo para moderación de contenido o reconocimiento de objetos.
- Extracción de características para sistemas de búsqueda visual: al usar como backbone, se pueden generar embeddings de imágenes para motores de búsqueda por similitud o sistemas de recomendación.
- Detección de objetos y segmentación: las características multiescala del backbone se pueden alimentar a cabezales como Faster R-CNN o DeepLab para tareas de visión por computador más complejas.
- Prototipado rápido con múltiples frameworks: gracias a su compatibilidad con TensorFlow, PyTorch y JAX, los equipos pueden experimentar en un framework y desplegar en otro sin cambiar de código.
- Fine-tuning en dominios específicos: el modelo preentrenado puede ajustarse en conjuntos de datos personalizados (por ejemplo, diagnóstico médico por imagen o inspección industrial) con pocas épocas, gracias a su tamaño compacto.
- Aplicaciones de realidad aumentada: su baja latencia permite integrarlo en sistemas de seguimiento de objetos o clasificación de escenas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo hereda el rendimiento del checkpoint original de timm, que reporta una precisión top-1 del 79.2 % en ImageNet-1k, pero estos datos no se detallan en la ficha de KerasFormers. Se recomienda consultar la model card del modelo base `timm/mobilenetv4_conv_medium.e500_r256_in1k` para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo de ~4 millones de parámetros (no confirmado), se espera que quepa en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo tarjetas consumer como RTX 3060 o inferiores. También funciona en CPU y en dispositivos móviles.
- Despliegue: puede ejecutarse con los backends de Keras (TensorFlow, PyTorch, JAX) directamente, o exportarse a otros formatos como ONNX o TensorFlow Lite para despliegue en producción.
- Latencia y throughput: no se dispone de datos concretos, pero la arquitectura está optimizada para dispositivos móviles, por lo que se espera una inferencia de pocos milisegundos en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de entrenamiento | Precisión top-1 (ImageNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNetV4 conv medium (este) | no disponible | 256 | no disponible (consultar timm) | Apache-2.0 | Keras 3, PyTorch, JAX |
| MobileNetV4 hybrid medium | no disponible | 224 | no disponible | Apache-2.0 | Keras 3 |
| MobileNetV3 Large | ~5.4M | 224 | 75.2% | Apache-2.0 | Varias |
| EfficientNet-B0 | 5.3M | 224 | 77.1% | Apache-2.0 | Varias |

Los datos de los modelos comparativos provienen de referencias públicas. La comparación exacta con MobileNetV4 no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está pensado exclusivamente para imágenes; no tiene capacidades de texto, audio ni video.
- Los datos de entrenamiento (ImageNet-1k) contienen sesgos inherentes en cuanto a categorías y contextos; puede tener un rendimiento pobre en dominios muy distintos al de la fotografía natural.
- Al ser un modelo convolucional, no incorpora mecanismos de atención, lo que limita su capacidad para capturar dependencias de largo alcance en la imagen.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset ImageNet original si se utiliza en aplicaciones comerciales.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una conversión reciente y posiblemente sin validación extensa de la comunidad.
- El tamaño del repo es 0.0 GB, lo que sugiere que los pesos pueden no estar alojados directamente en el hub o que se cargan desde otra fuente (como timm).

## Enlaces

- Modelo en Hugging Face: [kerasformers/mobilenetv4_conv_medium_e500_r256_in1k](https://huggingface.co/kerasformers/mobilenetv4_conv_medium_e500_r256_in1k)
- Modelo original de timm: [timm/mobilenetv4_conv_medium.e500_r256_in1k](https://huggingface.co/timm/mobilenetv4_conv_medium.e500_r256_in1k)
- Paper: [MobileNetV4 - Universal Models for the Mobile Ecosystem](https://arxiv.org/abs/2404.10518)
- Repositorio de KerasFormers: [GitHub](https://github.com/IMvision12/KerasFormers)
- Documentación de KerasFormers: [Docs](https://imvision12.github.io/KerasFormers/classification_backbones/)
- Colección completa de variantes MobileNetV4: [HuggingFace Collection](https://huggingface.co/collections/kerasformers/mobilenetv4-6a894cd740d9d3f3186d903a)
