# ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-fp32-onnx

## Resumen

El modelo **MLCommons Streaming Wakeword DS-CNN Speech Commands FP32 ONNX** es una conversión a formato ONNX en precisión FP32 del modelo de detección de palabras de activación (keyword spotting) desarrollado por MLCommons para el benchmark MLPerf Tiny. Está diseñado para clasificar fragmentos de audio en streaming, identificando una de las 30 palabras del dataset Google Speech Commands. Su relevancia radica en ofrecer una implementación eficiente para dispositivos de muy bajo consumo, como microcontroladores, y en permitir la integración en pipelines de inferencia mediante ONNX Runtime. La arquitectura se basa en una red neuronal convolucional con convoluciones separables en profundidad (DS-CNN), optimizada para minimizar el coste computacional y la latencia en tiempo real. No se especifican los parámetros totales ni la longitud de la ventana de análisis, pero el modelo es de tamaño reducido, adecuado para entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DS-CNN (Depthwise Separable Convolutional Neural Network) para clasificación de audio |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de audio típica en Speech Commands, no especificada) |
| Tipos de cuantización | FP32 (modelo actual), INT8 (versión pareada) |
| Idiomas soportados | no disponible (entrenado con Speech Commands, vocabulario en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DS-CNN, que combina convoluciones estándar y convoluciones separables en profundidad para reducir el número de operaciones y parámetros, manteniendo una precisión competitiva en tareas de clasificación de audio. Está pensado para operar sobre ventanas de audio cortas (típicamente alrededor de 1 segundo) y procesarlas de forma continua, lo que lo hace apto para aplicaciones de streaming. El entrenamiento se realizó sobre el dataset Google Speech Commands, que contiene 30 palabras cortas en inglés, pero no se han publicado detalles sobre el número de muestras, el proceso de entrenamiento o si se utilizaron técnicas de regularización específicas. La conversión a ONNX permite su ejecución con ONNX Runtime en una variedad de plataformas, incluidas CPU y dispositivos edge.

## Capacidades

- Detección de palabras de activación (keyword spotting) en audio, con clasificación entre 30 palabras del dataset Speech Commands (incluye "sí", "no", "arriba", "abajo", "izquierda", "derecha", entre otras).
- Procesamiento de audio en streaming, apto para aplicaciones de tiempo real con baja latencia.
- Clasificación de audio de un solo canal (mono) y con frecuencia de muestreo típica de 16 kHz (no confirmada explícitamente).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni razonamiento multi-paso.

## Casos de uso

- Asistentes de voz en dispositivos de bajo consumo: el modelo puede activar un asistente local (p. ej., en altavoces inteligentes o auriculares) tras detectar la palabra de activación, con un consumo energético mínimo.
- Despertado por voz en IoT: se integra en sensores o electrodomésticos para responder a comandos de voz sin necesidad de conexión a la nube.
- Pipelines de reconocimiento de voz: se usa como etapa previa a un sistema de transcripción (p. ej., RealtimeSTT) para filtrar el audio y solo transcribir cuando se detecta la palabra de activación.
- Benchmark de rendimiento en MLPerf Tiny: sirve como caso de referencia para medir la eficiencia de sistemas de inferencia en microcontroladores.
- Sistemas de automatización del hogar: permite activar luces, persianas o termostatos mediante comandos de voz locales.
- Evaluación académica: se utiliza en investigación para comparar arquitecturas de detección de palabras clave en entornos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU concretos, pero al ser un modelo de pequeño tamaño (típico de DS-CNN para Speech Commands), puede ejecutarse en CPU y en microcontroladores con pocos recursos.
- Se recomienda ONNX Runtime para su ejecución en CPU, y es viable su despliegue en placas como Raspberry Pi o MCU con suficiente memoria (p. ej., 32-64 KB de RAM, no confirmado).
- No se proporcionan datos de latencia ni throughput estimados.

## Comparativa con modelos similares

No se ha encontrado información comparativa con modelos alternativos en la documentación disponible. El ecosistema de detección de palabras de activación incluye opciones como openWakeWord o modelos de sherpa, pero no se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- El vocabulario se limita a las 30 palabras del dataset Google Speech Commands, todas en inglés; no soporta otros idiomas ni palabras personalizadas sin reentrenamiento.
- Puede presentar falsos positivos o negativos en entornos ruidosos o con acentos no representados en el dataset.
- No se ha evaluado la robustez frente a ataques adversarios ni se documentan sesgos específicos, pero la limitación del vocabulario y la variabilidad acústica son riesgos inherentes.
- La licencia Apache-2.0 del modelo convertido permite uso comercial, pero se debe verificar la licencia del modelo original de MLCommons Tiny, que puede tener condiciones adicionales.
- El repositorio no proporciona información sobre el proceso de entrenamiento ni sobre la arquitectura exacta (número de capas, filtros, etc.), lo que limita la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-fp32-onnx](https://huggingface.co/ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-fp32-onnx)
- Modelo original de MLCommons Tiny: [https://github.com/mlcommons/tiny/tree/4addd0fa08d216e20637637874e084895f289da4/benchmark/training/streaming_wakeword](https://github.com/mlcommons/tiny/tree/4addd0fa08d216e20637637874e084895f289da4/benchmark/training/streaming_wakeword)
- Versión INT8: [https://huggingface.co/ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-int8-onnx](https://huggingface.co/ketiswp/mlcommons-Streaming-Wakeword-DS-CNN-SpeechCommands-int8-onnx)
- Dataset Google Speech Commands: [https://huggingface.co/datasets/google/speech_commands](https://huggingface.co/datasets/google/speech_commands)
- Documentación de MLPerf Tiny: [https://github.com/mlcommons/tiny/blob/master/benchmark/training/streaming_wakeword/README.md](https://github.com/mlcommons/tiny/blob/master/benchmark/training/streaming_wakeword/README.md)
