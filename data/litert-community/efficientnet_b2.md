# litert-community/efficientnet_b2

## Resumen

EfficientNet B2 es un modelo de clasificación de imágenes basado en redes neuronales convolucionales, desarrollado originalmente por Google y presentado por Tan y Le en 2019. La comunidad litert-community ha publicado una conversión de los pesos preentrenados en ImageNet-1k al formato LiteRT, el sucesor de TensorFlow Lite, para facilitar el despliegue en dispositivos edge. El modelo resuelve el problema de clasificar imágenes en 1.000 categorías con una eficiencia computacional destacada, gracias a la técnica de escalado compuesto que equilibra profundidad, anchura y resolución de la red.

Con aproximadamente 9,1 millones de parámetros y un tamaño de repositorio de 0,1 GB, es adecuado para aplicaciones con recursos limitados. La relevancia actual radica en su disponibilidad como modelo cuantizado int8 solo de pesos, que reduce el tamaño un 3,6x con una pérdida mínima de precisión, ideal para inferencia on-device.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B2 (CNN con bloques MBConv y capas de compresión y excitación) |
| Parámetros totales | 9.109.994 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantización | float32 y weight-only int8 (wi8_afp32) |
| Idiomas soportados | no disponible (no aplica, clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | TFLite (.tflite) |

## Arquitectura y entrenamiento

EfficientNet B2 es una red neuronal convolucional que aplica el escalado compuesto propuesto por Tan y Le: escala uniformemente la profundidad, la anchura y la resolución de la entrada mediante coeficientes determinados por una búsqueda de arquitectura. Su bloque básico es MBConv (Mobile Inverted Bottleneck Convolution) con conexiones residuales y capas de compresión y excitación (SE). El modelo fue preentrenado en el conjunto de datos ImageNet-1k, que contiene 1.000 clases.

En esta publicación, los pesos se convirtieron desde un checkpoint de PyTorch Vision al formato LiteRT. Además, se ofrece una variante cuantizada solo de pesos (weight-only int8) que reduce el tamaño del archivo aproximadamente 3,6 veces en comparación con float32. La cuantización de activaciones se evitó deliberadamente porque las capas SE y SiLU son sensibles a ella; en una comprobación puntual, la versión cuantizada mantiene las predicciones top-1 en fotografías reales con una correlación mínima de logits de 0,999.

## Capacidades

- Clasificación de imágenes en 1.000 categorías del conjunto de datos ImageNet-1k.
- Inferencia eficiente en dispositivos edge mediante el runtime LiteRT (antiguo TensorFlow Lite).
- Soporte de cuantización weight-only int8 para reducir el tamaño del modelo con una pérdida de precisión mínima.
- Preprocesamiento específico: redimensionado a 288x288 con recorte central y normalización con media y desviación de ImageNet.
- No incluye capacidades de generación de texto, razonamiento, tool calling, agentes ni soporte multilingüe, al tratarse de un clasificador de visión.

## Casos de uso

- Clasificación de objetos en aplicaciones móviles: el modelo puede integrarse en una app de Android o iOS mediante LiteRT para identificar objetos en fotografías en tiempo real, gracias a su tamaño reducido y su baja latencia.
- Control de calidad en entornos industriales: se puede desplegar en cámaras conectadas a dispositivos de bajo consumo para clasificar productos y detectar defectos visuales en líneas de producción.
- Vigilancia perimetral con cámaras edge: el modelo permite clasificar tipos de escenas u objetos en sistemas de videovigilancia que funcionan sin conexión a la nube, siempre que se ajuste con datos específicos del dominio.
- Asistencia a personas con discapacidad visual: una aplicación puede usar el modelo para obtener una etiqueta del objeto principal capturado con la cámara del dispositivo.
- Clasificación de imágenes agrícolas: agricultores pueden fotografiar hojas o frutos y obtener una clasificación de plagas o enfermedades, siempre que se realice un fine-tuning con un dataset específico.
- Clasificación de imágenes médicas con fine-tuning: el modelo puede adaptarse para clasificar radiografías o imágenes dermatológicas en entornos clínicos, aprovechando su eficiencia para ejecutarse en equipos locales.
- Etiquetado automático de imágenes en pipelines de datos: puede utilizarse como paso previo para generar metadatos de imágenes antes de alimentar sistemas de recuperación o modelos de lenguaje multimodal.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación de imágenes | ImageNet-1k (validación) | Top 1 Accuracy (Full Precision) | 0,8061 |
| Clasificación de imágenes | ImageNet-1k (validación) | Top 5 Accuracy (Full Precision) | 0,9530 |

Los resultados corresponden al modelo original en precisión completa, según la model card. En la versión cuantizada weight-only int8, el autor indica que se mantienen las predicciones top-1 con una correlación mínima de logits de 0,999 en una comprobación puntual, pero no se publican métricas oficiales adicionales. No se han encontrado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. El modelo tiene 9,1 millones de parámetros, por lo que en float32 ocupa unos 36 MB de memoria; el archivo TFLite principal tiene un tamaño de 46,9 MB.
- GPU recomendadas: no se requiere una GPU específica; puede ejecutarse en CPU, GPU móvil, NPU o cualquier GPU de servidor (por ejemplo, NVIDIA T4 o RTX 3060).
- Compatibilidad con GPU de consumo: sí, funciona en cualquier GPU de consumo.
- Opciones de despliegue: LiteRT (antiguo TensorFlow Lite) como runtime principal; también puede utilizarse con Python mediante ai-edge-litert. No es compatible con vLLM, llama.cpp ni Ollama, al estar en formato TFLite.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo pertenece a la familia EfficientNet, que incluye variantes como EfficientNet-B0, B1, B3, etc., pero no se han publicado resultados de benchmarks de estas alternativas en la documentación disponible. Por tanto, no se puede realizar una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento en ImageNet-1k puede introducir sesgos de clase y geográficos, ya que el dataset no es representativo de todos los contextos visuales.
- Riesgo de clasificación incorrecta: como todo clasificador, puede producir errores en imágenes fuera de la distribución de entrenamiento o en condiciones de iluminación y oclusión adversas.
- Limitaciones de tarea: el modelo solo realiza clasificación de imágenes en 1.000 categorías; no soporta detección de objetos, segmentación ni otras tareas sin modificaciones.
- Licencia: la información disponible no especifica la licencia del modelo. La model card advierte que los pesos provienen de PyTorch Vision y del dataset de entrenamiento, y que el usuario es responsable de verificar si tiene permiso para usarlos en su caso de uso.
- Cuantización: la variante weight-only int8 reduce el tamaño, pero puede introducir pequeñas variaciones en las salidas; el autor recomienda validar el comportamiento en el dominio de aplicación.
- No se proporcionan garantías de seguridad, privacidad ni robustez ante ataques adversariales.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/efficientnet_b2
- GitHub de LiteRT: https://github.com/google-ai-edge/litert
- Documentación oficial de LiteRT: https://developers.google.com/edge/litert
- Artículo original de EfficientNet: https://arxiv.org/abs/1905.11946
