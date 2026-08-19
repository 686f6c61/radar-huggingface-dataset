# ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-int8-uint8-onnx

## Resumen

Este modelo es una versión cuantizada a 8 bits (INT8/UINT8) de MobileNetV2 con factor de ancho 0.35, preparada para ejecutarse en microcontroladores STM32 mediante el framework STM32Cube.AI. El modelo original fue desarrollado por STMicroelectronics como parte de su model zoo de IA para STM32, y esta versión en formato ONNX con cuantización estática en QDQ (Quantize-Dequantize) ha sido publicada por el usuario ketiswp en HuggingFace. Su propósito es ofrecer clasificación de imágenes de 224x224 píxeles sobre las 1000 clases de ImageNet, optimizada para entornos con recursos limitados.

La relevancia actual radica en la creciente demanda de modelos de visión por computador ligeros y eficientes para dispositivos embebidos, donde el consumo de memoria y la velocidad de inferencia son críticos. La cuantización a 8 bits reduce el tamaño del modelo y el uso de RAM, manteniendo una precisión aceptable para tareas de clasificación en tiempo real. Además, al estar disponible en ONNX, puede desplegarse con herramientas como ONNX Runtime o convertirse a formatos específicos para microcontroladores, lo que facilita su integración en proyectos de edge AI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (factor de ancho 0.35) |
| Parametros totales | no disponible |
| Longitud de contexto | No aplica (entrada de imagen de 224x224 píxeles) |
| Tipos de cuantizacion | INT8 (pesos) / UINT8 (entrada), formato QDQ |
| Idiomas soportados | no disponible (modelo de visión, sin lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (QDQ) |

## Arquitectura y entrenamiento

MobileNetV2 es una red neuronal convolucional ligera basada en bloques de convolución separable en profundidad con cuellos de botella invertidos. El factor de ancho 0.35 reduce el número de canales en cada capa, disminuyendo el coste computacional y el tamaño del modelo respecto al MobileNetV2 estándar. Esta versión ha sido preentrenada en ImageNet (1.28 millones de imágenes, 1000 clases) y posteriormente cuantizada de forma estática a 8 bits mediante el flujo de trabajo de STM32Cube.AI, que genera un gráfico QDQ para la inferencia en ONNX. No se han proporcionado detalles sobre el proceso de entrenamiento original (tokens, épocas, optimizador) ni sobre el conjunto de datos específico de cuantización.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (objetos, animales, escenas, etc.).
- Entrada de imágenes RGB de 224x224 píxeles.
- Inferencia de baja latencia y bajo consumo de recursos, adecuada para microcontroladores con memoria limitada.
- Compatible con ONNX Runtime y con las herramientas de conversión de STM32Cube.AI para despliegue en STM32.
- No soporta tool calling, generación de texto ni capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Clasificación de defectos en líneas de producción: un microcontrolador STM32 equipado con una cámara puede identificar piezas defectuosas en tiempo real, gracias al bajo consumo y la respuesta rápida del modelo cuantizado.
- Reconocimiento de plantas en agricultura inteligente: el modelo clasifica hojas o flores capturadas por un sensor de imagen, permitiendo monitorizar cultivos sin conexión a la nube.
- Asistencia en robótica educativa: un robot con cámara puede distinguir objetos básicos (por ejemplo, piezas de colores) para interactuar con el entorno en talleres de programación.
- Control de acceso por imagen en dispositivos de baja potencia: clasificación de personas o vehículos en sistemas de seguridad doméstica sin depender de servicios externos.
- Detección de plagas en invernaderos: integrado en un nodo sensor, el modelo identifica insectos o hongos en fotos de trampas para alertar al agricultor.
- Optimización de inventario en almacenes: cámaras de bajo coste clasifican productos en cintas transportadoras para registrar entradas y salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (top-1 o top-5) ni comparaciones con otras versiones cuantizadas. Solo se indica que es una versión cuantizada del modelo MobileNetV2 0.35 de STM32AI, pero sin datos numéricos.

## Requisitos de hardware

- Tamaño del modelo: el repositorio indica 0.0 GB, lo que sugiere que el archivo es de pocos megabytes (típico para un modelo cuantizado de este tamaño). No se proporciona el peso exacto.
- VRAM: al ser un modelo ONNX cuantizado, puede ejecutarse en CPU sin necesidad de GPU. En un microcontrolador STM32, la memoria flash y SRAM requeridas dependen de la configuración de STM32Cube.AI; no se dan valores concretos.
- GPU recomendadas: no aplica; se puede ejecutar en cualquier CPU o MCU con suficiente memoria.
- Opciones de despliegue: ONNX Runtime, STM32Cube.AI (conversión a C), TensorFlow Lite Micro si se convierte, o cualquier runtime ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación en la información proporcionada. Se podría comparar con otros MobileNetV2 de distintos factores de ancho o con MobileNetV1, pero no hay cifras de rendimiento o precisión para este modelo concreto.

## Limitaciones y advertencias

- La cuantización a 8 bits puede reducir la precisión respecto al modelo FP32 original; no se especifica la pérdida de exactitud.
- El modelo solo acepta imágenes de 224x224; cualquier otro tamaño requiere redimensionado y puede afectar el rendimiento.
- Está entrenado exclusivamente en ImageNet, por lo que su capacidad de generalización a otros dominios es limitada.
- No soporta idiomas ni capacidades de lenguaje, solo clasificación visual.
- Licencia Apache-2.0, permite uso comercial y modificación, pero se debe incluir la atribución correspondiente.
- La documentación del modelo no incluye información sobre sesgos o errores en categorías específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-int8-uint8-onnx
- Versión FP32 pareada: https://huggingface.co/ketiswp/stm32ai-MobileNetV2-0.35-ImageNet-224-fp32-onnx
- Modelo original en GitHub (STM32 AI Model Zoo): https://github.com/STMicroelectronics/stm32ai-modelzoo/tree/1423c78953a830903485135febe1dd98ff31aed8/image_classification/mobilenetv2
- STM32 Model Zoo general: https://github.com/STMicroelectronics/stm32ai-modelzoo
- Página oficial del model zoo: https://stm32ai.st.com/model-zoo/
