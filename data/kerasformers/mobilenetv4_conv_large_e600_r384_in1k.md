# kerasformers/mobilenetv4_conv_large_e600_r384_in1k

## Resumen

`kerasformers/mobilenetv4_conv_large_e600_r384_in1k` es una conversión pura a Keras 3 del checkpoint `timm/mobilenetv4_conv_large.e600_r384_in1k`, desarrollada por el proyecto KerasFormers. MobileNetV4 es la cuarta generación de la familia MobileNet, presentada en el paper «MobileNetV4 - Universal Models for the Mobile Ecosystem» (arXiv:2404.10518). Esta variante concreta usa únicamente bloques convolucionales (Universal Inverted Bottleneck, UIB) sin atención, está entrenada en ImageNet-1k a resolución 384×384 durante 600 épocas y se distribuye como clasificador de imágenes o como backbone de 5 etapas para extracción de características.

La relevancia de este modelo radica en su portabilidad: una única implementación Keras 3 ejecuta sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita la integración en flujos de trabajo heterogéneos. Al ser una conversión de pesos (no un reentrenamiento), hereda las métricas del checkpoint original de timm, aunque el repositorio no publica valores de precisión concretos. El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo de aproximadamente 40 millones de parámetros en formato fp32, aunque este dato no se confirma en la documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 conv (Universal Inverted Bottleneck, sin atención) |
| Parametros totales | no disponible (repo de 0,1 GB; se estima ~40 M por tamaño, no confirmado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (formato original Keras 3; no se publican cuantizaciones) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | Keras 3 (pesos internos de la librería kerasformers; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

MobileNetV4 introduce el bloque UIB (Universal Inverted Bottleneck), que unifica los bloques residuales invertidos clásicos de MobileNetV2/V3 con operaciones de convolución y, en las variantes híbridas, con un bloque de atención Mobile Multi-Query Attention (Mobile MQA). Esta variante `conv_large` es puramente convolucional: no incorpora atención, lo que la hace especialmente adecuada para entornos con restricciones de latencia y memoria. La estructura de 5 etapas con stride 2 permite usarla como backbone para tareas de detección, segmentación o clasificación.

El entrenamiento original fue realizado por Ross Wightman (autor de timm) sobre ImageNet-1k, con 600 épocas (e600) y resolución de entrada 384×384 (r384). El checkpoint de kerasformers no reentrena el modelo, sino que convierte los pesos del formato timm a Keras 3, preservando las activaciones y la distribución de los pesos. La conversión no implica ajuste fino ni modificación de los pesos; el modelo se puede cargar directamente con `from_weights("kerasformers/...")`.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, con salida de logits.
- Extracción de características multiescala: `MobileNetV4Model` con `as_backbone=True` devuelve las salidas de las 5 etapas de stride 2, listas para usarse en detectores o segmentadores.
- Multi-backend: ejecución idéntica en TensorFlow, PyTorch y JAX mediante Keras 3, configurable con la variable de entorno `KERAS_BACKEND`.
- Normalización interna: el clasificador acepta imágenes crudas en rango [0, 255] y aplica media/desviación de ImageNet automáticamente.
- Carga de pesos desde Hugging Face Hub sin descargar manualmente los ficheros: `from_weights("kerasformers/...")` gestiona la descarga y la instanciación.
- Compatibilidad con checkpoints de timm: se pueden cargar los pesos originales de `timm/mobilenetv4_conv_large.e600_r384_in1k` directamente a través de `hf:timm/...`.

## Casos de uso

- Clasificación de imágenes en dispositivos móviles y edge: al ser una red convolucional pura sin atención, es ligera y rápida en CPU y NPU, adecuada para aplicaciones de visión en tiempo real como clasificación de productos, moderación de contenido o diagnóstico visual básico.
- Extracción de características para detección de objetos: usar el backbone de 5 etapas como encoder en arquitecturas tipo YOLO, SSD o Mask R-CNN. La salida multiescala facilita la detección de objetos de distintos tamaños.
- Segmentación semántica: el backbone convierte la imagen en mapas de características de alta resolución que se pueden alimentar a decodificadores como U-Net o DeepLab para tareas de segmentación en agricultura, medicina o conducción autónoma.
- Transferencia de aprendizaje en dominios específicos: congelar el backbone y entrenar solo la cabeza de clasificación sobre datasets pequeños (por ejemplo, defectos industriales o especies de plantas) aprovecha las características de ImageNet.
- Evaluación comparativa de eficiencia: al ser una conversión pura de pesos, sirve como referencia para medir el rendimiento de MobileNetV4 en diferentes backends (TensorFlow vs PyTorch vs JAX) y hardware (CPU, GPU, móvil).
- Integración en pipelines de Keras 3: desarrolladores que trabajen con Keras 3 pueden incorporar el modelo como capa preentrenada dentro de flujos de entrenamiento existentes sin cambiar de framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo hereda las métricas del checkpoint original de timm (top-1 y top-5 en ImageNet-1k), pero estos valores no se indican en la model card de kerasformers ni en la documentación del repositorio. Se recomienda consultar la ficha de `timm/mobilenetv4_conv_large.e600_r384_in1k` en Hugging Face para obtener las cifras exactas, que no se reproducen aquí por no estar incluidas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene ~40 M de pesos (sin confirmar), por lo que en fp32 ocupa aproximadamente 160 MB. En cuantización fp16 o int8 cabría en menos de 80 MB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluso una NVIDIA GTX 1050 o una integrada en CPU. Para entrenamiento o fine-tuning se recomienda una GPU con 4 GB o más (p. ej., RTX 3060, T4).
- Compatibilidad con consumer GPU: sí, es un modelo ligero que se puede ejecutar incluso en hardware de gama baja o en CPU sin aceleración, aunque con menor velocidad.
- Opciones de despliegue: al ser un modelo de Keras 3, se puede exportar a SavedModel (TensorFlow), TorchScript (PyTorch) o usar directamente en JAX. No se proporcionan integraciones con vLLM, Ollama o TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no se reportan datos concretos; en una GPU moderna (RTX 4090) se espera inferencia en el rango de milisegundos para una imagen de 384×384, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros (aprox.) | Resolución | Licencia | Backend | Uso principal |
|---|---|---|---|---|---|
| kerasformers/mobilenetv4_conv_large_e600_r384_in1k | no disponible (~40 M) | 384×384 | Apache-2.0 | Keras 3 (TF/PyTorch/JAX) | Clasificación y backbone |
| kerasformers/mobilenetv4_conv_medium_e500_r256_in1k | no disponible (~20 M) | 256×256 | Apache-2.0 | Keras 3 | Clasificación y backbone |
| kerasformers/mobilenetv4_conv_small_e2400_r224_in1k | no disponible (~10 M) | 224×224 | Apache-2.0 | Keras 3 | Clasificación ligera |
| kerasformers/mobilenetv4_hybrid_large_e600_r384_in1k | no disponible (~40 M) | 384×384 | Apache-2.0 | Keras 3 | Clasificación y backbone con atención |

Los tres modelos comparten arquitectura base y licencia, diferenciándose en tamaño, resolución y presencia de atención (los híbridos incluyen Mobile MQA). Para tareas que requieren precisión máxima se prefiere la variante large; para despliegue en edge con restricciones de memoria, la small o medium.

## Limitaciones y advertencias

- Modelo de visión exclusivamente: no procesa texto, audio ni otros tipos de datos.
- Resolución fija de entrada: el modelo está entrenado para 384×384; aunque se puede usar con otras resoluciones, el rendimiento puede degradarse.
- Sesgos de ImageNet: hereda los sesgos de los datos de entrenamiento, como representación desequilibrada de ciertas categorías o regiones geográficas, lo que puede afectar a la precisión en dominios específicos.
- Riesgo de alucinación no aplica en clasificación, pero sí de clasificación errónea en imágenes ambiguas o fuera de la distribución.
- No se incluyen pesos en formato safetensors ni GGUF: la distribución es exclusivamente en el formato de kerasformers, lo que puede limitar la integración con herramientas que esperan esos formatos.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero conviene verificar la atribución del modelo original de timm (que también es Apache-2.0).
- El repositorio no reporta métricas de rendimiento ni resultados de benchmarks, por lo que la validación del modelo debe hacerse de forma independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kerasformers/mobilenetv4_conv_large_e600_r384_in1k)
- [Colección MobileNetV4 de kerasformers](https://huggingface.co/collections/kerasformers/mobilenetv4-6a894cd740d9d3f3186d903a)
- [Modelo original en timm](https://huggingface.co/timm/mobilenetv4_conv_large.e600_r384_in1k)
- [Paper: MobileNetV4 - Universal Models for the Mobile Ecosystem](https://arxiv.org/abs/2404.10518)
- [Página del paper en Hugging Face](https://huggingface.co/papers/2404.10518)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de los backbones de KerasFormers](https://imvision12.github.io/KerasFormers/classification_backbones/)
- [Guía de carga de pesos](https://imvision12.github.io/KerasFormers/loading_weights/)
