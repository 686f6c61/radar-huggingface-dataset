# litert-community/efficientnet_b6

## Resumen

EfficientNet-B6 es un modelo de clasificación de imágenes basado en redes neuronales convolucionales (CNN), preentrenado en el dataset ImageNet-1k. Fue introducido originalmente por Tan y Le en 2019 en el artículo «EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks», donde propusieron el compound scaling para equilibrar de forma sistemática la profundidad, la anchura y la resolución de la red. Esta estrategia permite obtener una precisión alta con una eficiencia computacional notablemente superior a arquitecturas tradicionales.

La versión disponible en el repositorio `litert-community/efficientnet_b6` es una conversión a formato TFLite/LiteRT de un checkpoint original de PyTorch Vision. El modelo cuenta con 43 040 704 parámetros y alcanza una precisión Top-1 del 84,0 % en ImageNet-1k en validación. El repositorio incluye tanto el modelo en float32 como una variante con cuantización weight-only int8, que reduce el tamaño en aproximadamente 3,7 veces sin pérdida significativa de precisión, lo que lo hace adecuado para inferencia en dispositivos móviles y entornos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B6 (CNN con compound scaling, bloques MBConv y capas SE) |
| Parametros totales | 43 040 704 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | float32, weight-only int8 (wi8_afp32) |
| Idiomas soportados | No disponible (modelo de clasificación de imágenes, sin soporte de idiomas) |
| Licencia | No disponible |
| Formato de pesos | TFLite (.tflite) |

## Arquitectura y entrenamiento

EfficientNet-B6 es una CNN basada en bloques MBConv con conexiones residuales y capas de squeeze-and-excitation (SE). La arquitectura fue diseñada mediante búsqueda de arquitectura neural (NAS) y escalado compuesto, que ajusta simultáneamente la profundidad, la anchura y la resolución de entrada. En esta configuración, el modelo procesa imágenes de 528x528 píxeles, según el código de preprocesamiento incluido en la model card. Las funciones de activación SiLU y las capas SE son sensibles a la cuantización de activaciones, por lo que la variante cuantizada utiliza únicamente cuantización de pesos (weight-only int8) para mantener la precisión.

El modelo fue preentrenado en ImageNet-1k, un dataset de 1,28 millones de imágenes en 1000 clases. El checkpoint original proviene de PyTorch Vision, con una precisión Top-1 de 84,008 % y Top-5 de 96,916 % en el split de validación. No se especifica en la información disponible si se aplicó RLHF, DPO u otro tipo de ajuste posterior, ya que se trata de un modelo de visión discriminativo y no generativo.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k, con salida de probabilidades por clase.
- Precisión Top-1 de 84,0 % y Top-5 de 96,91 % en validación de ImageNet-1k, según los datos declarados por el autor.
- Inferencia eficiente en formato TFLite, optimizada para ejecución on-device mediante LiteRT (sucesor de TensorFlow Lite).
- Variante cuantizada weight-only int8 con una reducción de tamaño de aproximadamente 3,7x respecto a float32.
- El spot check realizado por el autor mantiene las predicciones Top-1 en fotografías reales con una correlación de logits de 1.000 respecto al modelo float32.
- No soporta generación de texto, tool calling, razonamiento multi-step ni capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Clasificación de imágenes en tiempo real en aplicaciones móviles: el modelo en formato TFLite puede integrarse en apps Android o iOS mediante LiteRT, con una latencia baja gracias a su tamaño reducido. Es adecuado para funciones como identificar especies de plantas o etiquetar fotografías automáticamente.
- Control de calidad industrial en línea: permite clasificar piezas defectuosas o no defectuosas a partir de imágenes capturadas por cámaras en la línea de producción. La versión cuantizada puede ejecutarse en dispositivos edge sin conexión a internet.
- Análisis de imágenes médicas en entornos con recursos limitados: puede utilizarse como clasificador de radiografías o imágenes de dermatología si se reentrena con un dataset médico. Su tamaño compacto facilita el despliegue en equipos de diagnóstico portátiles.
- Sistemas de vigilancia locales: el modelo puede clasificar objetos o escenas (por ejemplo, vehículos, personas, animales) directamente en la cámara o en un gateway, reduciendo la necesidad de enviar imágenes a la nube.
- Asistencia para accesibilidad: una aplicación que describe escenas a personas con discapacidad visual puede usar EfficientNet-B6 para etiquetar rápidamente objetos en una imagen capturada por el móvil, con una latencia adecuada para uso interactivo.
- Backbone de extracción de características en pipelines de visión: sus 43 millones de parámetros y su alta precisión lo hacen útil como extractor de embeddings para tareas de detección, segmentación o búsqueda de imágenes similares, especialmente en entornos donde se necesita un equilibrio entre precisión y consumo de recursos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Top 1 Accuracy (Full Precision) en ImageNet-1k validation | 0,8400 |
| Top 5 Accuracy (Full Precision) en ImageNet-1k validation | 0,9691 |

Los resultados corresponden al modelo en precisión completa, tal como se declara en el model-index de la model card. No se han publicado en la información disponible benchmarks adicionales (por ejemplo, tiempo de inferencia, throughput o comparativas con otros modelos en hardware específico).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 172 MB en float32 (43 millones de parámetros × 4 bytes) y alrededor de 46 MB en la variante weight-only int8 (según la reducción de 3,7x indicada).
- GPU recomendadas: no requiere una GPU dedicada; el modelo puede ejecutarse en CPU, GPU o aceleradores como Edge TPU. Cualquier GPU con al menos 0,5 GB de VRAM es suficiente para la versión float32.
- Capacidad en GPU de consumo: sí, cabe en cualquier GPU de consumo actual (por ejemplo, RTX 3060 o superior) e incluso en CPUs modernas.
- Opciones de despliegue: LiteRT (sucesor de TensorFlow Lite), TensorFlow Lite tradicional, y entornos que soporten archivos `.tflite`. No es compatible con vLLM, llama.cpp u Ollama al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo se sitúa en la gama alta de la familia EfficientNet, con 43 millones de parámetros y una resolución de entrada de 528x528. Para una comparativa rigurosa sería necesario evaluar en el mismo hardware y con los mismos protocolos de medición.

## Limitaciones y advertencias

- Sesgos conocidos: al estar preentrenado en ImageNet-1k, el modelo hereda los sesgos de ese dataset, que está dominado por imágenes de contextos naturales y occidentales. Su rendimiento puede degradarse en dominios no representados, como objetos industriales, ilustraciones o fotografías tomadas con cámaras de baja calidad.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto libre; produce una distribución de probabilidad sobre clases fijas.
- Limitaciones de contexto o idioma: no procesa texto ni mantiene contextos conversacionales. Tampoco tiene soporte de idiomas al ser un modelo puramente visual.
- Restricciones de licencia: la model card advierte explícitamente que los pesos fueron convertidos desde PyTorch Vision y que los modelos pueden estar sujetos a licencias o términos adicionales derivados de PyTorch Vision y del dataset de entrenamiento. Es responsabilidad del usuario verificar la permisibilidad de uso antes de desplegar en producción.
- Caveat de producción: la variante cuantizada es weight-only int8, no una cuantización completa. El autor indica que las capas SE y SiLU son sensibles a la cuantización de activaciones, por lo que cualquier intento de cuantización dinámica adicional podría degradar la precisión. Además, el modelo no ha sido reentrenado por `litert-community`; es una conversión directa de un checkpoint existente.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/efficientnet_b6
- Repositorio de LiteRT en GitHub: https://github.com/google-ai-edge/litert
- Sitio oficial de LiteRT: https://developers.google.com/edge/litert
- Paper original: https://arxiv.org/abs/1905.11946
