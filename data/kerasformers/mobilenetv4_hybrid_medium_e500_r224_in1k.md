# kerasformers/mobilenetv4_hybrid_medium_e500_r224_in1k

## Resumen

MobileNetV4 es la cuarta generación de la familia de modelos de visión por computadora de Google, diseñada para el ecosistema móvil y edge. La variante híbrida medium combina el bloque Universal Inverted Bottleneck (UIB) con un bloque de atención multi-consulta móvil (Mobile MQA), logrando un equilibrio entre eficiencia y precisión. Este repositorio, publicado por el usuario `kerasformers`, ofrece una conversión pura de Keras 3 del checkpoint original de timm (`timm/mobilenetv4_hybrid_medium.e500_r224_in1k`), lo que permite ejecutar el mismo modelo de forma idéntica en TensorFlow, PyTorch y JAX.

El modelo está entrenado en ImageNet-1k y sirve tanto como clasificador de imágenes como backbone de 5 etapas para extracción de características. Su arquitectura ligera (alrededor de 10 millones de parámetros) y su implementación en Keras 3 lo hacen especialmente relevante para aplicaciones de visión por computadora en dispositivos con recursos limitados, así como para proyectos que requieren portabilidad entre frameworks de deep learning. La licencia Apache 2.0 permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV4 híbrido (UIB + Mobile MQA) |
| Parámetros totales | no disponible (se estima ~10M, pero no se confirma en la información) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (procesamiento de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente pesos de Keras, pero no se especifica) |

## Arquitectura y entrenamiento

MobileNetV4 introduce el bloque Universal Inverted Bottleneck (UIB), una evolución del bloque de cuello de botella invertido usado en MobileNetV2 y V3. El UIB permite combinar distintas operaciones (convolución estándar, profundidad y separable) de forma flexible. La variante híbrida añade un bloque de atención de multi-consulta móvil (Mobile MQA) que mejora la capacidad de modelado sin incrementar excesivamente la latencia. El modelo está entrenado en ImageNet-1k mediante scripts de `timm`, con hiperparámetros inspirados en el paper original y con mejoras propias de `timm`. No se han publicado detalles sobre el número de tokens (no aplica) ni sobre técnicas de RLHF o DPO, al tratarse de un modelo de visión.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet.
- Extracción de características en 5 etapas con stride 2, usable como backbone para tareas de detección, segmentación u otras.
- Compatible con los tres backends de Keras 3: TensorFlow, PyTorch y JAX, mediante la librería KerasFormers.
- Soporta entrada de imágenes de tamaño 224x224 píxeles con normalización interna (media y desviación estándar de ImageNet).
- No tiene capacidades de lenguaje, tool calling, agentes o razonamiento multi-step.

## Casos de uso

- **Clasificación de imágenes en producción**: el modelo puede desplegarse como clasificador de imágenes en tiempo real en dispositivos móviles o embebidos gracias a su diseño eficiente y bajo número de parámetros. Su licencia Apache 2.0 permite su uso comercial sin royalties.
- **Extracción de características para transfer learning**: al usar el modelo como backbone (`as_backbone=True`) se obtienen características de alta calidad de 5 niveles de resolución, ideales para adaptar a tareas específicas con datasets pequeños mediante fine-tuning.
- **Aplicaciones de visión en el edge**: su tamaño reducido y su arquitectura optimizada para móviles lo hacen adecuado para aplicaciones de reconocimiento de objetos, clasificación de productos o análisis de imágenes en dispositivos con poca memoria.
- **Prototipado rápido multiplataforma**: gracias a la implementación en Keras 3, un mismo código puede ejecutarse en TensorFlow, PyTorch o JAX sin cambios, lo que facilita la experimentación en entornos de investigación que usan distintos frameworks.
- **Sistemas de búsqueda visual**: el modelo puede generar embeddings de imágenes para construir índices de similitud o recuperación de imágenes en bases de datos, por ejemplo en catálogos de productos.
- **Detección de objetos y segmentación**: al ser un backbone de 5 etapas, se puede integrar en arquitecturas como Faster R-CNN o Mask R-CNN para tareas de detección y segmentación semántica en entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original de `timm` no incluye métricas numéricas, y los resultados de búsqueda tampoco proporcionan datos concretos de precisión, latencia o throughput.

## Requisitos de hardware

- Al ser un modelo de visión de tamaño pequeño (aprox. 10M de parámetros), puede ejecutarse en CPU sin problemas, con latencia de unos pocos milisegundos por imagen en hardware moderno.
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente para inferencia. Una RTX 2080 Ti o superior puede procesar lotes de cientos de imágenes por segundo.
- Es adecuado para despliegue en dispositivos móviles (Android/iOS) y microcontroladores, aunque el formato de pesos no se ha especificado.
- Opciones de despliegue: se puede usar directamente con el código de `kerasformers` en Keras 3, o exportar a TensorFlow Lite, ONNX o CoreML para inferencia en producción.
- No se han proporcionado datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNetV4 Hybrid Medium (este) | no disponible | 224 | no disponible | Apache 2.0 | Keras, timm |
| MobileNetV3 Large | 5.4M | 224 | 75.2% (ImageNet) | Apache 2.0 | PyTorch, TensorFlow |
| EfficientNet-B0 | 5.3M | 224 | 77.1% (ImageNet) | Apache 2.0 | PyTorch, TensorFlow |

Nota: los datos de precisión de MobileNetV3 y EfficientNet provienen de referencias públicas, no de la información proporcionada. No se dispone de datos de precisión del modelo MobileNetV4 en esta ficha.

## Limitaciones y advertencias

- **Sesgos de ImageNet**: al estar entrenado en ImageNet-1k, el modelo puede heredar sesgos de género, raza o contexto presentes en el dataset. Esto puede producir clasificaciones erróneas en imágenes de grupos subrepresentados.
- **Riesgo de alucinación**: no aplica al ser un modelo de visión, pero puede producir etiquetas incorrectas o confiadas en categorías ambiguas.
- **Limitaciones de contexto**: solo acepta imágenes de tamaño 224x224 píxeles; para otras resoluciones se necesita redimensionar o ajustar la capa de entrada.
- **Formato de pesos**: no se documenta si los pesos están en formato Safetensors, HDF5 o Keras. Para su uso en otros frameworks (ONNX, TensorRT) se requeriría conversión manual.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial sin restricciones, pero es obligatorio incluir el aviso de copyright y la licencia en productos derivados.
- **Caveat de producción**: el modelo es una conversión de `timm`, por lo que es recomendable validar la paridad de resultados con el checkpoint original antes de desplegarlo en entornos críticos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kerasformers/mobilenetv4_hybrid_medium_e500_r224_in1k)
- [Modelo base (timm)](https://huggingface.co/timm/mobilenetv4_hybrid_medium.e500_r224_in1k)
- [Paper MobileNetV4 (arXiv)](https://arxiv.org/abs/2404.10518)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de MobileNetV4 en KerasFormers](https://imvision12.github.io/KerasFormers/classification_backbones/)
- [Colección de MobileNetV4 en HuggingFace](https://huggingface.co/collections/kerasformers/mobilenetv4-6a894cd740d9d3f3186d903a)
