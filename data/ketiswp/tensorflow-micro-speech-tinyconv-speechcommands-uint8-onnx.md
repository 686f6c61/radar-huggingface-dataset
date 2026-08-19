# ketiswp/tensorflow-Micro-Speech-TinyConv-SpeechCommands-uint8-onnx

## Resumen

El modelo `ketiswp/tensorflow-Micro-Speech-TinyConv-SpeechCommands-uint8-onnx` es una versión cuantizada a INT8 del clásico modelo TinyConv de reconocimiento de palabras clave (keyword spotting) de TensorFlow Lite Micro. Desarrollado por ketiswp, se distribuye en formato ONNX con cuantización estática en formato QDQ, lo que lo hace adecuado para inferencia eficiente en dispositivos embebidos y entornos con recursos limitados.

Este modelo resuelve el problema de la detección de palabras de activación ("yes" y "no") a partir de audio de un segundo de duración. Su relevancia actual radica en que ofrece una versión lista para usar de un modelo de referencia ampliamente utilizado en aplicaciones de voz en el borde, con un peso inferior a 20 kB (en su versión original), lo que lo convierte en una opción viable para microcontroladores y sistemas de bajo consumo. La arquitectura TinyConv es una red convolucional ligera que procesa espectrogramas generados por un preprocesador de audio previo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyConv (red convolucional ligera) |
| Parametros totales | no disponible (modelo original <20 kB en TFLite) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio de 1 segundo, espectrograma) |
| Tipos de cuantizacion | INT8 estática (QDQ) |
| Idiomas soportados | no disponible (reconocimiento de "yes" y "no" en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con operadores cuantizados QDQ) |

## Arquitectura y entrenamiento

El modelo se basa en el ejemplo `micro_speech` de TensorFlow Lite Micro, que entrena una red TinyConv para clasificar espectrogramas de audio de 1 segundo en dos clases: "yes" y "no". La arquitectura es una red convolucional muy reducida, diseñada para caber en menos de 20 kB, que toma como entrada un espectrograma generado por un preprocesador de audio (también entrenado en el ejemplo original). El entrenamiento se realiza sobre el dataset Speech Commands de Google, que contiene grabaciones de palabras en inglés.

La versión INT8 de este modelo se obtiene mediante cuantización estática post-entrenamiento, que convierte los pesos y activaciones de FP32 a INT8, manteniendo la precisión con una pérdida mínima. El formato QDQ (Quantize-Dequantize) conserva la estructura original del grafo de ONNX y es compatible con los runtime optimizados para INT8, como ONNX Runtime con aceleración por hardware o CPU con instrucciones vectoriales.

## Capacidades

- Clasificación de audio: distingue entre las palabras "yes" y "no" a partir de un clip de audio de 1 segundo.
- Preprocesamiento integrado: requiere un espectrograma de entrada generado por un preprocesador (no se incluye en este modelo, pero está disponible en la versión FP32 emparejada).
- Inferencia eficiente: al estar cuantizado a INT8, reduce el uso de memoria y aceleración la latencia en CPUs y dispositivos embebidos.
- Despliegue en microcontroladores: compatible con el ecosistema de TensorFlow Lite Micro y ONNX Runtime, lo que permite ejecutarlo en plataformas de bajo consumo (Cortex-M, ESP32, etc.).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de clasificación simple, no un modelo de lenguaje.

## Casos de uso

- **Asistentes de voz en dispositivos de bajo consumo**: el modelo puede activar un sistema cuando detecta la palabra "yes" o "no", por ejemplo, para confirmar acciones en un dispositivo IoT sin necesidad de un asistente en la nube.
- **Control por voz en electrodomésticos**: integración en microcontroladores de electrodomésticos para responder a comandos binarios simples (encender/apagar) mediante voz.
- **Interfaces de accesibilidad**: permite a personas con movilidad reducida interactuar con dispositivos mediante respuestas de "sí" o "no" a preguntas del sistema.
- **Prototipos de investigación en keyword spotting**: sirve como modelo de referencia para comparar técnicas de cuantización o arquitecturas más avanzadas en sistemas de reconocimiento de voz.
- **Aplicaciones de educación y demostración**: por su pequeño tamaño, es ideal para enseñar conceptos de despliegue de ML en el borde en cursos de ingeniería.
- **Sistemas de respuesta por voz en bucle cerrado**: en un robot o juguete, el modelo puede detectar la respuesta de un usuario y disparar una acción posterior (como una animación o un mensaje).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original de TensorFlow Lite Micro reporta una precisión de aproximadamente el 90% en el conjunto de prueba de Speech Commands, pero estos datos no se han reproducido para esta versión INT8 ONNX.

## Requisitos de hardware

- **VRAM**: no aplica, es un modelo para CPU o microcontroladores; no requiere GPU.
- **GPU recomendada**: no necesaria. Se puede ejecutar en cualquier CPU con soporte ONNX Runtime (x86, ARM, RISC-V).
- **GPU de consumo**: no aplica, el modelo es demasiado pequeño para aprovechar una GPU.
- **Opciones de despliegue**: ONNX Runtime (CPU, también con aceleración de hardware como OpenVINO o TensorRT para CPU), llama.cpp (no aplica), TFLite Micro (mediante conversión a TFLite), o directamente en ONNX Runtime para microcontroladores.
- **Latencia**: en una CPU moderna, la inferencia completa (incluyendo el preprocesamiento) suele ser inferior a 10 ms. En un microcontrolador de 80 MHz, la latencia puede estar en el rango de 20-50 ms, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de modelos comparables con características idénticas en la información proporcionada. El modelo de referencia es el propio `micro_speech` de TensorFlow Lite Micro, que está disponible en formato TFLite y tiene un tamaño similar (< 20 kB). No se han encontrado otras versiones ONNX cuantizadas del mismo modelo en la búsqueda web.

## Limitaciones y advertencias

- **Solo reconoce dos palabras**: "yes" y "no", no es un sistema de reconocimiento de voz general.
- **Idioma limitado**: las palabras están en inglés, no soporta otros idiomas.
- **Dependencia del preprocesador**: el modelo requiere un espectrograma de entrada, por lo que es necesario incluir el preprocesador de audio (que no está incluido en este repositorio).
- **Sesgos del dataset**: el modelo puede tener un rendimiento desigual con acentos o condiciones de ruido diferentes a los del dataset Speech Commands.
- **Riesgo de alucinación**: no aplica, es un clasificador, no un generativo.
- **Licencia**: Apache 2.0, permite uso comercial y modificación, pero debe incluirse la atribución correspondiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ketiswp/tensorflow-Micro-Speech-TinyConv-SpeechCommands-uint8-onnx)
- [Modelo FP32 emparejado](https://huggingface.co/ketiswp/tensorflow-Micro-Speech-TinyConv-SpeechCommands-fp32-onnx)
- [Fuente original (Android Googlesource)](https://android.googlesource.com/platform/external/tensorflow/+/4ed0453e335/tensorflow/lite/micro/examples/micro_speech/train/)
- [Repositorio de tflite-micro (ejemplo micro_speech)](https://github.com/tensorflow/tflite-micro/blob/main/tensorflow/lite/micro/examples/micro_speech/README.md)
- [Notebook de entrenamiento de micro_speech](https://colab.research.google.com/github/tinyMLx/colabs/blob/master/3-5-13-PretrainedModel.ipynb)
