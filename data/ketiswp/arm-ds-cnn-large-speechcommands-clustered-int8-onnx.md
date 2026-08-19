# ketiswp/arm-DS-CNN-Large-SpeechCommands-clustered-int8-onnx

## Resumen

El modelo `ketiswp/arm-DS-CNN-Large-SpeechCommands-clustered-int8-onnx` es una versión cuantizada a 8 bits (INT8 estático, formato QDQ) de la red neuronal convolucional DS-CNN Large, desarrollada por Arm para el reconocimiento de palabras clave (keyword spotting). Está publicada en formato ONNX, lo que permite su ejecución con ONNX Runtime y otros motores compatibles, y su licencia Apache 2.0 facilita su integración en proyectos comerciales y de código abierto.

El modelo está diseñado para clasificación de audio, concretamente para detectar comandos de voz breves en entornos con recursos limitados, como microcontroladores o dispositivos embebidos. La cuantización a INT8 reduce el tamaño y la latencia de inferencia, manteniendo una precisión razonable para tareas de activación por voz. Es una alternativa ligera a modelos de clasificación de audio de mayor tamaño, orientada a despliegue en el edge.

En el momento de redactar esta ficha, el repositorio no incluye datos sobre el tamaño de parámetros, el dataset de entrenamiento ni resultados de benchmarks publicados. La información disponible se limita a la propia model card y a los enlaces a la versión FP32 y al repositorio original de Arm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DS-CNN Large (Depthwise Separable Convolutional Neural Network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio) |
| Tipos de cuantizacion | INT8 estático (QDQ format) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura DS-CNN (Depthwise Separable Convolutional Neural Network) Large fue desarrollada por Arm para tareas de keyword spotting. Se basa en capas de convoluciones separables en profundidad, que reducen drásticamente el número de operaciones y parámetros en comparación con convoluciones estándar, lo que la hace adecuada para ejecución en CPUs y microcontroladores. El modelo procesa características espectrales de audio (típicamente mel spectrogramas) y produce una clasificación por clase de comando.

La versión INT8 se obtiene mediante cuantización estática del modelo FP32 original, convirtiendo los pesos y activaciones a enteros de 8 bits en formato QDQ (Quantize-Dequantize). No se dispone de información sobre el dataset de entrenamiento (el nombre del modelo sugiere el dataset Speech Commands, pero no se confirma en la documentación), ni sobre el número de épocas, técnicas de regularización o procesos de ajuste fino adicionales.

## Capacidades

- Clasificación de audio para keyword spotting: detecta y clasifica comandos de voz de corta duración.
- Inferencia eficiente en recursos limitados gracias a la cuantización INT8 y la arquitectura ligera.
- Compatible con ONNX Runtime, lo que permite desplegarlo en CPUs, GPUs y dispositivos embebidos con soporte para ONNX.
- Formato estándar de ONNX facilita la integración en pipelines de procesamiento de audio existentes.
- No se dispone de información sobre capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que es un modelo de clasificación de audio.

## Casos de uso

- Activación por voz en dispositivos IoT: el modelo puede integrarse en un asistente local que escucha continuamente una palabra de activación (p. ej., «hey device») y solo activa el resto del sistema cuando la detecta. Su bajo consumo permite ejecutarlo en microcontroladores.
- Control de voz en electrodomésticos: en un horno o una lavadora, el modelo clasifica comandos simples como «encender», «apagar» o «subir temperatura» sin necesidad de conexión a la nube.
- Sistemas de accesibilidad: para personas con movilidad reducida, permite controlar interfaces mediante comandos de voz en entornos locales y sin latencia perceptible.
- Prototipos de investigación en keyword spotting: sirve como punto de partida para comparar el efecto de la cuantización INT8 sobre la precisión en datasets como Speech Commands.
- Educación en despliegue de modelos de IA en edge: se puede usar en cursos de aprendizaje automático para demostrar cómo se convierte un modelo FP32 a INT8 y se ejecuta con ONNX Runtime en dispositivos de bajo coste.
- Benchmark de rendimiento en hardware embebido: permite medir latencia y consumo de energía en plataformas como Raspberry Pi, Jetson Nano o MCUs con soporte ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de cifras de precisión sobre datasets estándar como Speech Commands v2, ni comparaciones con otros modelos de keyword spotting.

## Requisitos de hardware

- Tamaño del modelo en disco: no disponible (el repo indica 0.0 GB, pero es un dato no fiable).
- Inferencia en CPU: la cuantización INT8 permite ejecutar el modelo en CPUs de bajo consumo, incluso en procesadores ARM de dispositivos móviles.
- GPU: no es necesaria; el modelo está diseñado para edge. En caso de usarse en GPU, cualquier GPU moderna es suficiente.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT, y otros motores compatibles con ONNX.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la longitud de la ventana de audio de entrada.

## Comparativa con modelos similares

No hay datos de rendimiento comparativo publicados para este modelo. Como alternativas en el mismo dominio (keyword spotting con arquitecturas ligeras) se pueden considerar:

- **Arm DS-CNN Small**: variante más pequeña de la misma familia, con menor número de parámetros y precisión ligeramente inferior.
- **MobileNetV1/V2 adaptado a keyword spotting**: arquitecturas de convolución estándar, con mayor coste computacional que DS-CNN.
- **CRNN (Convolutional Recurrent Neural Network)**: añade capas recurrentes para captar dependencias temporales, pero con mayor complejidad.

Sin embargo, no se dispone de benchmarks comparativos que permitan evaluar la calidad de este modelo frente a esas alternativas.

## Limitaciones y advertencias

- No se ha publicado información sobre el dataset de entrenamiento, por lo que no se puede evaluar la cobertura de acentos, ruido o idiomas distintos.
- La cuantización INT8 puede degradar la precisión en comparación con el modelo FP32 original, especialmente en entornos ruidosos.
- El modelo está limitado a la clasificación de comandos de voz cortos; no es adecuado para reconocimiento de voz continuo ni para tareas de comprensión del lenguaje natural.
- No se ha documentado la tasa de falsos positivos o negativos en condiciones reales, lo que es crítico para aplicaciones de activación por voz.
- No se ha especificado si el modelo soporta múltiples idiomas; por defecto, se asume que solo reconoce el idioma del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no se incluye información sobre los términos de uso del dataset de entrenamiento original.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ketiswp/arm-DS-CNN-Large-SpeechCommands-clustered-int8-onnx)
- [Versión FP32 del modelo](https://huggingface.co/ketiswp/arm-DS-CNN-Large-SpeechCommands-clustered-fp32-onnx)
- [Repositorio original de Arm ML-zoo](https://github.com/Arm-Examples/ML-zoo/tree/68b5fbc77ed28e67b2efc915997ea4477c1d9d5b/models/keyword_spotting/ds_cnn_large)
- [Model Registry de ONNX_Models](https://huggingface.co/ketiswp/ONNX_Models/blob/main/model_registry.csv)
