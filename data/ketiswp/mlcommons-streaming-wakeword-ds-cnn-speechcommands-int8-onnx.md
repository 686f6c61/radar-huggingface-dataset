# ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-int8-onnx

## Resumen

El modelo `ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-int8-onnx` es una versión cuantizada a INT8 en formato ONNX del modelo DS-CNN (Depthwise Separable Convolutional Neural Network) de MLCommons Tiny para detección de palabras de activación (wake word). Forma parte del benchmark MLPerf Tiny, que evalúa sistemas de aprendizaje automático de ultra bajo consumo en microcontroladores y dispositivos edge. El modelo original se entrenó sobre el dataset Speech Commands de Google, que contiene comandos de voz como "sí", "no", "arriba", "abajo", etc., y está diseñado para realizar clasificación de audio en tiempo real (streaming) sobre flujos de audio continuos.

La versión INT8 ONNX se ofrece como alternativa al modelo FP32, manteniendo la misma arquitectura pero con pesos y activaciones cuantizados a enteros de 8 bits, lo que reduce el tamaño y el consumo de memoria y acelera la inferencia en hardware con soporte para operaciones de bajo consumo, como microcontroladores o procesadores de señal digital. El modelo está publicado bajo licencia Apache 2.0 y su pipeline es `audio-classification`. No se proporcionan datos de tamaño de parámetros, contexto de entrada ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DS-CNN (Depthwise Separable Convolutional Neural Network) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio de longitud fija, típicamente 1 segundo) |
| Tipos de cuantizacion | INT8 estática (formato QDQ) |
| Idiomas soportados | no disponible (entrenado sobre Speech Commands, que contiene palabras en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (modelo cuantizado) |

## Arquitectura y entrenamiento

El modelo se basa en una red neuronal convolucional separable en profundidad (DS-CNN), una arquitectura eficiente para tareas de clasificación de audio en tiempo real en dispositivos de muy bajo consumo. La versión original de MLCommons Tiny se entrena sobre el dataset Speech Commands de Google, que contiene más de 65 000 clips de audio de 1 segundo con palabras aisladas. El modelo se entrena para clasificar un conjunto de palabras de activación, normalmente 10 o 12 clases, más una clase de "silencio" y "desconocido".

La cuantización a INT8 se realiza de forma estática (QDQ format), lo que implica que se ha calibrado con datos de validación para ajustar los rangos de los tensores y convertir los pesos y activaciones a enteros de 8 bits. Este proceso reduce el tamaño del modelo en aproximadamente 4 veces respecto al FP32 y facilita su ejecución en hardware con soporte de operaciones INT8, como ciertos aceleradores de microcontroladores o CPUs con instrucciones vectoriales.

No se dispone de información sobre el número de tokens de entrenamiento, el procedimiento de entrenamiento (RLHF, DPO, etc.) ni otras innovaciones técnicas más allá de la cuantización.

## Capacidades

- Detección de palabras de activación (wake word) en flujos de audio en tiempo real, gracias a su diseño para inferencia continua.
- Clasificación de comandos de voz de corta duración (1 segundo) sobre un vocabulario fijo, típicamente de 10 a 12 palabras (p. ej., "sí", "no", "arriba", "abajo", "izquierda", "derecha", etc.).
- Operación en modo streaming, procesando ventanas de audio consecutivas con solapamiento, lo que permite detectar la palabra de activación sin necesidad de esperar a que finalice el habla.
- Adecuado para entornos con ruido de fondo moderado, gracias al entrenamiento con datos de audio del mundo real de Speech Commands.
- Cuantización INT8 que permite su despliegue en hardware de muy baja potencia (microcontroladores, DSPs, CPUs de bajo consumo) sin pérdida significativa de precisión, aunque los resultados exactos dependen del hardware y del software de inferencia.

## Casos de uso

- **Asistentes de voz en dispositivos edge**: el modelo se puede integrar en un micrófono con procesador de bajo consumo para activar un asistente de voz (p. ej., "Hey dispositivo") sin necesidad de conexión a internet, reduciendo la latencia y mejorando la privacidad al procesar localmente.
- **Sistemas de automatización del hogar**: un altavoz inteligente o un sensor puede detectar palabras como "encender luz" o "bajar persiana" directamente en el dispositivo, evitando la transmisión de audio a la nube.
- **Control por voz en electrodomésticos**: lavadoras, frigoríficos o robots de limpieza pueden incorporar detección de palabras de activación para recibir comandos sencillos sin necesidad de una interfaz compleja.
- **Aplicaciones de accesibilidad**: personas con movilidad reducida pueden activar funciones mediante la voz en dispositivos de asistencia, como sillas de ruedas o sistemas de alerta, siempre que el modelo se integre en un sistema de control.
- **Prototipado rápido de sistemas de voz**: los desarrolladores pueden usar este modelo ONNX cuantizado para evaluar la viabilidad de un producto de voz en hardware de bajo costo (Raspberry Pi, Arduino con coprocesador) antes de pasar a un modelo más grande.
- **Benchmarking de eficiencia**: el modelo sirve como referencia en el benchmark MLPerf Tiny para medir la latencia, el consumo energético y la precisión de sistemas de inferencia en el edge, siendo útil para comparar hardware y optimizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de MLCommons Tiny se evalúa dentro del benchmark MLPerf Tiny, pero los números concretos de precisión, latencia y energía no se incluyen en la documentación del repositorio ni en la model card. Se recomienda consultar el repositorio oficial de MLCommons Tiny para obtener métricas de referencia.

## Requisitos de hardware

- **VRAM estimada**: no aplicable, ya que es un modelo para inferencia en CPU o microcontroladores; no requiere GPU con VRAM.
- **GPUs recomendadas**: no requiere GPU; puede ejecutarse en CPU, microcontroladores (ARM Cortex-M, RISC-V) o DSPs. En caso de usar GPU, cualquier GPU moderna con soporte INT8 es suficiente, pero no es el caso de uso habitual.
- **Compatibilidad con hardware consumer**: sí, cabe en cualquier dispositivo con CPU, incluso en Raspberry Pi o Arduino con suficiente memoria. No necesita GPU.
- **Opciones de despliegue**: ONNX Runtime (con proveedor de ejecución INT8), TensorRT Lite (para microcontroladores), o motores como llama.cpp no aplican (no es un LLM). Se puede usar con ONNX Runtime en Python o en C++.
- **Latencia y throughput**: no disponible. Depende del hardware, pero al ser un modelo pequeño (típicamente < 100 KB en INT8) se espera latencia de pocos milisegundos en CPU de gama media.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de detección de palabras de activación en el contexto de la información proporcionada. Existen alternativas como los modelos de openWakeWord (basados en redes de atención o CNN), o el modelo original FP32 de MLCommons, pero no hay números públicos de comparación en la documentación disponible. Se indica "no disponible".

## Limitaciones y advertencias

- **Sesgos de lenguaje**: el modelo se entrena sobre Speech Commands, que contiene principalmente habla en inglés de hablantes de Estados Unidos. Puede tener un rendimiento pobre con otros acentos o idiomas, lo que limita su uso global.
- **Riesgo de falsos positivos**: en entornos ruidosos o con habla no relacionada, puede activarse de forma espuria. El diseño streaming y el entrenamiento con ruido de fondo mitigan en parte, pero no eliminan.
- **Alucinación**: no es un modelo generativo, por lo que no alucina texto. Sin embargo, la clasificación errónea de comandos puede dar lugar a acciones no deseadas en el sistema que lo integre.
- **Cuantización**: la cuantización INT8 puede degradar ligeramente la precisión en comparación con el modelo FP32. Se debe validar el rendimiento en el hardware objetivo antes de producción.
- **Licencia**: Apache 2.0 permite uso comercial, pero hay que respetar los términos de la licencia y atribución. No se especifica si el dataset Speech Commands tiene restricciones adicionales.
- **Falta de documentación**: no hay información sobre el número de parámetros, arquitectura exacta de capas, ni datos de entrenamiento detallados, lo que dificulta una evaluación técnica completa.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-int8-onnx](https://huggingface.co/ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-int8-onnx)
- Modelo FP32 asociado: [https://huggingface.co/ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-fp32-onnx](https://huggingface.co/ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-fp32-onnx)
- Repositorio original de MLCommons Tiny (modelo de entrenamiento): [https://github.com/mlcommons/tiny/tree/4addd0fa08d216e20637637874e084895f289da4/benchmark/training/streaming_wakeword](https://github.com/mlcommons/tiny/tree/4addd0fa08d216e20637637874e084895f289da4/benchmark/training/streaming_wakeword)
- Benchmark MLPerf Tiny (descripción): [https://mlcommons.org/2025/09/mlperf-tiny-v1-3-tech/](https://mlcommons.org/2025/09/mlperf-tiny-v1-3-tech/)
- Proyecto openWakeWord (alternativa de código abierto): [https://github.com/dscripka/openWakeWord](https://github.com/dscripka/openWakeWord)
