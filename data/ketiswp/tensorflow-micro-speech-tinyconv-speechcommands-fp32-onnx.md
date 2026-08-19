# ketiswp/tensorflow-Micro-Speech-TinyConv-SpeechCommands-fp32-onnx

## Resumen

El modelo `tensorflow-Micro-Speech-TinyConv-SpeechCommands-fp32-onnx`, publicado por ketiswp, es una conversión a formato ONNX con precisión FP32 del modelo de reconocimiento de palabras clave (keyword spotting) desarrollado por TensorFlow Lite Micro. Está diseñado para clasificar dos comandos de voz específicos, "yes" y "no", a partir de espectrogramas de audio de un segundo de duración. Su principal ventaja es su tamaño extremadamente reducido (inferior a 20 kB en su versión original TFLite), lo que lo hace apto para entornos con recursos limitados, como microcontroladores y dispositivos de borde.

La conversión a ONNX facilita su integración con ONNX Runtime y otros motores de inferencia que no soportan directamente TensorFlow Lite, ampliando su uso a aplicaciones de escritorio, servidores o sistemas embebidos con Python o C++. Aunque el repositorio no muestra archivos subidos en la fecha de consulta, la intención del autor es ofrecer una alternativa portable del modelo original para su uso en pipelines de audio en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TinyConv (red neuronal convolucional compacta) |
| Parámetros totales | no disponible (el modelo original en TFLite pesa menos de 20 kB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1 segundo de audio (espectrograma de entrada) |
| Tipos de cuantización | FP32 (este repositorio) y UINT8 (versión pareada) |
| Idiomas soportados | inglés (reconoce las palabras "yes" y "no") |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura TinyConv, una red neuronal convolucional extremadamente compacta diseñada para funcionar en microcontroladores. La entrada es un espectrograma de audio de 1 segundo, generado por un preprocesador que convierte la señal de audio cruda en representaciones de frecuencia temporal. La salida es una clasificación entre las categorías "yes", "no" y "desconocido" (aunque el modelo principal se enfoca en dos palabras clave).

El entrenamiento sigue el ejemplo oficial de TensorFlow Lite Micro, que utiliza el dataset Speech Commands de Google (u otros similares) para aprender a distinguir las palabras objetivo. El proceso de entrenamiento se documenta en el notebook `train_micro_speech_model.ipynb` en el repositorio de TensorFlow Lite Micro. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento o si se aplicaron técnicas de RLHF/DPO, ya que es un modelo de clasificación simple, no un modelo de lenguaje.

## Capacidades

- Clasificación de audio para reconocimiento de palabras clave, específicamente "yes" y "no".
- Procesamiento de espectrogramas de audio de un segundo de duración.
- Inferencia en tiempo real en dispositivos con recursos limitados (menos de 20 kB de pesos).
- Compatibilidad con el ecosistema ONNX (ONNX Runtime) para despliegue en múltiples plataformas.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, ya que es un modelo de clasificación de audio específico.

## Casos de uso

- **Activación por voz en microcontroladores**: puede integrarse en dispositivos como Arduino o ESP32 para detectar la palabra "yes" o "no" como comando de activación, gracias a su tamaño mínimo y baja latencia.
- **Control de dispositivos IoT**: en sistemas de domótica, el modelo puede procesar comandos de voz simples para encender/apagar luces o activar rutinas, ejecutándose en un Raspberry Pi o un dispositivo con ONNX Runtime.
- **Sistemas de atención al cliente en quioscos**: en terminales de autoservicio, permite respuestas binarias (sí/no) mediante voz, sin necesidad de servidores remotos.
- **Prototipado educativo**: ideal para enseñar conceptos de TinyML y reconocimiento de voz en entornos académicos, por su simplicidad y documentación asociada.
- **Desarrollo de asistentes de voz ligeros**: como complemento de un sistema más grande, el modelo puede funcionar como un detector de wake word local antes de enviar audio a un servicio en la nube.
- **Auditoría de calidad de audio**: en sistemas de control de calidad, se puede usar para verificar que un operador responda "sí" o "no" en procesos de validación, con procesamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de precisión, latencia o comparativas con otros sistemas en la model card ni en los resultados de búsqueda web. Se recomienda evaluar el modelo en el entorno de despliegue objetivo, dado que su rendimiento depende del preprocesamiento de audio y del hardware.

## Requisitos de hardware

- **VRAM**: no requiere VRAM; puede ejecutarse en CPU sin GPU.
- **GPU recomendadas**: no aplica; el modelo está diseñado para dispositivos sin GPU.
- **Compatibilidad con consumer GPU**: se puede ejecutar en cualquier GPU, pero no es necesario.
- **Opciones de despliegue**: ONNX Runtime (Python, C++), TensorFlow Lite (si se convierte el modelo), y en microcontroladores mediante la conversión a TFLite.
- **Latencia y throughput**: no se dispone de datos concretos, pero por su tamaño reducido, se espera una latencia inferior a 10 ms en CPU modernas y en el rango de pocos ms en microcontroladores con aceleración dedicada.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| TensorFlow Micro Speech (original) | TFLite | <20 kB | 1 s de audio | Apache 2.0 | Microcontroladores |
| Micro Speech TinyConv (UINT8 ONNX) | ONNX | <20 kB (aprox.) | 1 s de audio | Apache 2.0 | Sistemas con ONNX Runtime |
| Micro Speech TinyConv (FP32 ONNX) | ONNX | <20 kB (aprox.) | 1 s de audio | Apache 2.0 | Sistemas con ONNX Runtime |

La comparativa se limita a las variantes del mismo modelo, ya que no se dispone de otros modelos de keyword spotting con características comparables en la información proporcionada. La principal diferencia entre las variantes es la precisión numérica (FP32 vs UINT8) y el formato de pesos, que afecta a la compatibilidad y al rendimiento en distintos entornos.

## Limitaciones y advertencias

- **Solo reconoce dos palabras**: el modelo está limitado a "yes" y "no", no es capaz de reconocer otros comandos o palabras.
- **Idioma**: está entrenado con audio en inglés, por lo que no funciona con comandos en otros idiomas.
- **Sensibilidad a ruido**: el modelo puede fallar en entornos con ruido de fondo alto, ya que está optimizado para microcontroladores y no incluye técnicas avanzadas de supresión de ruido.
- **Preprocesamiento específico**: requiere una ventana de audio de exactamente 1 segundo y un espectrograma generado según el pipeline original; variaciones en el preprocesamiento pueden degradar el rendimiento.
- **Licencia**: aunque la licencia es Apache 2.0, se debe verificar el uso de los datos de entrenamiento originales (el dataset Speech Commands) si se usa en aplicaciones comerciales.
- **Riesgo de alucinación**: no aplica, ya que es un modelo discriminativo, no generativo.
- **Sesgos**: puede tener sesgos de género, edad o acento en el reconocimiento, ya que el dataset de entrenamiento puede no ser representativo.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/ketiswp/tensorflow-Micro-Speech-TinyConv-SpeechCommands-fp32-onnx)
- [Versión UINT8 del modelo](https://huggingface.co/ketiswp/tensorflow-Micro-Speech-TinyConv-SpeechCommands-uint8-onnx)
- [Modelo original (fuente en Android Googlesource)](https://android.googlesource.com/platform/external/tensorflow/+/4ed0453e335/tensorflow/lite/micro/examples/micro_speech/train/)
- [Notebook de entrenamiento del modelo micro_speech (Colab)](https://colab.research.google.com/github/tensorflow/tflite-micro/blob/main/tensorflow/lite/micro/examples/micro_speech/train/train_micro_speech_model.ipynb)
- [Repositorio de TensorFlow Lite Micro (GitHub)](https://github.com/tensorflow/tflite-micro/blob/main/tensorflow/lite/micro/examples/micro_speech/README.md)
