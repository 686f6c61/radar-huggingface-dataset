# ketiswp/mlcommons-DS-CNN-SpeechCommands-int8-onnx

## Resumen

El modelo `ketiswp/mlcommons-DS-CNN-SpeechCommands-int8-onnx` es una versión cuantizada en INT8 estático del modelo DS-CNN (Depthwise Separable Convolutional Neural Network) de MLCommons Tiny, diseñado para la detección de palabras clave (keyword spotting). Fue publicado por el usuario ketiswp en Hugging Face bajo licencia Apache-2.0, con formato ONNX y destinado a la clasificación de audio mediante el pipeline de `audio-classification`. Su objetivo principal es ofrecer una alternativa ligera y eficiente para la ejecución en dispositivos con recursos limitados, como microcontroladores y sistemas embebidos.

La cuantización INT8 en formato QDQ (Quantize-Dequantize) permite reducir el tamaño del modelo y acelerar la inferencia en hardware compatible con operaciones de 8 bits, manteniendo una precisión razonable frente al modelo FP32 original. La arquitectura DS-CNN está basada en convoluciones separables en profundidad, similares a las de MobileNet, pero adaptadas específicamente para el reconocimiento de comandos de voz cortos. Aunque no se disponen de datos sobre el número total de parámetros ni el contexto de entrenamiento, su origen en el benchmark MLCommons Tiny garantiza un diseño pensado para tareas de clasificación de audio en tiempo real.

Este modelo es relevante para desarrolladores que buscan una solución de keyword spotting optimizada para edge computing, con un formato estándar (ONNX) y una licencia permisiva que facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DS-CNN (Depth Separable Convolutional Neural Network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio) |
| Tipos de cuantizacion | INT8 estática, formato QDQ |
| Idiomas soportados | no disponible (detección de comandos en inglés, según dataset Speech Commands) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura DS-CNN (Depth Separable Convolutional Network) es una red neuronal convolucional que utiliza convoluciones separables en profundidad, técnica popularizada por MobileNet. Esta estructura reduce significativamente el número de parámetros y las operaciones de multiplicación-acumulación en comparación con convoluciones estándar, lo que la hace ideal para entornos con restricciones de memoria y procesamiento. El modelo está entrenado para clasificar fragmentos de audio de aproximadamente 1 segundo en una serie de clases de comandos (por ejemplo, "sí", "no", "arriba", "abajo", etc.) del dataset Google Speech Commands.

El proceso de cuantización aplicado es INT8 estático, con formato QDQ (Quantize-Dequantize). Esto implica que los pesos y activaciones se convierten a enteros de 8 bits durante el entrenamiento o mediante calibración, y se insertan nodos de cuantización y de-cuantización en el grafo ONNX para preservar la precisión. El modelo se exportó desde el repositorio original de MLCommons Tiny (versión v1.1), que incluye el código de entrenamiento y el pipeline de evaluación del benchmark. No se han proporcionado detalles sobre el número de tokens de entrenamiento ni el proceso de alineamiento con preferencias humanas (RLHF/DPO), ya que se trata de un modelo de clasificación supervisada tradicional.

## Capacidades

- Clasificación de audio: detecta palabras o comandos cortos a partir de espectrogramas de audio de baja resolución, típicamente 1 segundo de duración.
- Funcionamiento en tiempo real: diseñado para inferencia de baja latencia en dispositivos de borde (edge), con consumo de memoria reducido.
- Compatibilidad con ONNX Runtime: puede ejecutarse en plataformas que soporten ONNX, incluyendo CPU, GPU y aceleradores específicos como Intel Movidius o Google Coral.
- Cuantización INT8: optimizado para hardware con soporte de instrucciones INT8, lo que puede acelerar la inferencia entre 2 y 4 veces frente al FP32.
- No soporta tool calling, agentes, razonamiento multi-paso, ni generación de texto; su función es estrictamente clasificación de audio.

## Casos de uso

- **Asistentes de voz en dispositivos IoT**: el modelo puede activarse con palabras como "Hey device" o comandos específicos, funcionando localmente sin conexión a la nube, gracias a su tamaño reducido y su inferencia de baja latencia.
- **Control por voz en electrodomésticos**: integración en lavadoras, hornos o sistemas de iluminación para reconocer comandos como "encender" o "apagar" sin depender de servicios externos.
- **Wearables de salud**: detección de comandos de voz en relojes o pulseras para responder a emergencias o registrar eventos, con un consumo de energía mínimo.
- **Automoción**: sistemas de manos libres en el coche que reconocen instrucciones del conductor (por ejemplo, "llamar" o "navegar") sin necesidad de una conexión de datos.
- **Educación y accesibilidad**: aplicaciones para personas con movilidad reducida que activan funciones mediante voz, usando un modelo local que no envía datos personales a la nube.
- **Prototipos de investigación**: el modelo es ideal para experimentar con técnicas de cuantización o para servir de base en proyectos de fine-tuning en el dataset Speech Commands, gracias a su licencia abierta y formato estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, latencia ni comparaciones con otros modelos en la documentación del autor. Se recomienda consultar el repositorio original de MLCommons Tiny para obtener métricas de referencia del modelo FP32, y evaluar la degradación específica tras la cuantización INT8 en el hardware objetivo.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser un modelo INT8 de tamaño pequeño (típicamente <1 MB en FP32), se puede inferir que requiere menos de 100 MB de memoria en la mayoría de los casos.
- **GPU recomendadas**: no se requiere GPU; puede ejecutarse en CPU de bajo consumo, como ARM Cortex-M o Raspberry Pi. En caso de usar aceleradores, soporta INT8 en dispositivos como Intel Movidius, Google Coral o GPUs con soporte INT8 (e.g., NVIDIA Jetson).
- **Consumer GPU**: cabe en cualquier GPU de escritorio (RTX 2060 o superior) sin problemas, aunque no es necesario para su propósito.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, o compilación con TFLite (convertir ONNX a TFLite). También puede usar herramientas como `onnx2tf` para migrar a TensorFlow Lite.
- **Latencia**: se espera una inferencia de menos de 10 ms en un procesador moderno (aunque no hay datos oficiales), gracias a la cuantización INT8 y al diseño compacto de la red.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de keyword spotting. Sin embargo, se pueden considerar alternativas como:

- **MLCommons DS-CNN FP32**: versión original sin cuantizar, disponible en el mismo repositorio del autor (ketiswp), con mayor precisión pero mayor tamaño y menor velocidad en hardware INT8.
- **MobileNetV2 para audio**: una red similar en complejidad, pero no específica para keyword spotting; puede adaptarse pero requiere más parámetros.
- **Streaming Keyword Spotting de Google**: modelos basados en Transformer, pero más pesados y diseñados para entornos de nube, no para edge.

No se dispone de datos cuantitativos para una comparación justa; se recomienda realizar una evaluación propia con el dataset Speech Commands v2.

## Limitaciones y advertencias

- **Sesgo y variabilidad**: no se ha documentado análisis de sesgo, pero el modelo fue entrenado con el dataset Google Speech Commands, que tiene una representación mayoritaria de hablantes de inglés americano y puede tener menor rendimiento con otros acentos o idiomas.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo generativo; el riesgo principal es el error de clasificación (falso positivo o negativo) en la detección de comandos.
- **Limitaciones de contexto**: la entrada está restringida a audio de 1 segundo; no puede manejar contexto temporal largo ni conversaciones multi-turno.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial y modificación, pero requiere incluir la atribución correspondiente. No hay restricciones de uso en productos propietarios.
- **Caveat para producción**: el modelo está cuantizado INT8; es crucial validar la degradación de precisión en el dataset objetivo y ajustar los umbrales de decisión. Además, el repositorio muestra 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente probado por la comunidad; se recomienda una evaluación exhaustiva antes de integrarlo en un sistema crítico.

## Enlaces

- [Modelo INT8 ONNX en Hugging Face](https://huggingface.co/ketiswp/mlcommons-DS-CNN-SpeechCommands-int8-onnx)
- [Versión FP32 pareada](https://huggingface.co/ketiswp/mlcommons-DS-CNN-SpeechCommands-fp32-onnx)
- [Repositorio original MLCommons Tiny (v1.1)](https://github.com/mlcommons/tiny/tree/v1.1/benchmark/training/keyword_spotting)
- [ONNX Model Zoo](https://github.com/onnx/models)
- [ONNX Runtime - Modelos](https://onnxruntime.ai/models)
