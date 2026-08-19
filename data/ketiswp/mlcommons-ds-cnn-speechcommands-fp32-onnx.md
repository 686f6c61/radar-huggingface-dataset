# ketiswp/mlcommons-DS-CNN-SpeechCommands-fp32-onnx

## Resumen

El modelo `mlcommons-DS-CNN-SpeechCommands-fp32-onnx` es una conversión a ONNX con precisión FP32 del modelo DS-CNN (Depthwise Separable Convolutional Neural Network) de MLCommons, diseñado específicamente para el reconocimiento de comandos de voz (keyword spotting) sobre el dataset Speech Commands. Lo publica el usuario ketiswp en Hugging Face, y se basa en el benchmark de entrenamiento del proyecto MLCommons Tiny v1.1, un conjunto de pruebas para sistemas de aprendizaje automático en dispositivos de bajo consumo (TinyML).

La utilidad principal de este modelo es la clasificación de audio corto, típicamente de un segundo de duración, para detectar un conjunto limitado de palabras. Su formato ONNX lo hace portable entre diferentes frameworks y runtimes, como ONNX Runtime, lo que facilita su integración en aplicaciones de borde, dispositivos embebidos y sistemas de automatización. La versión FP32 ofrece mayor precisión numérica que su contraparte INT8 (también publicada por el mismo autor), a costa de un mayor uso de memoria.

Aunque el repositorio no proporciona detalles técnicos exhaustivos, el modelo pertenece a la familia de CNNs con convoluciones separables en profundidad, similar a MobileNet, optimizadas para ejecutarse en hardware con recursos limitados. Es relevante para desarrolladores que trabajan en asistentes de voz, automatización del hogar o cualquier sistema que requiera detección de palabras de activación sin conexión a la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DS-CNN (CNN con convoluciones separables en profundidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio de ~1 segundo) |
| Tipos de cuantizacion | FP32 (versión INT8 disponible en el mismo autor) |
| Idiomas soportados | no disponible (el dataset original es inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

La arquitectura DS-CNN está basada en convoluciones separables en profundidad, una técnica que reduce significativamente el número de parámetros y operaciones en comparación con convoluciones estándar, manteniendo una precisión competitiva para tareas de clasificación de audio. Este diseño es especialmente adecuado para su despliegue en microcontroladores y dispositivos de bajo consumo, ya que minimiza el uso de memoria y cómputo.

El modelo se entrena con el dataset Speech Commands de Google, que contiene grabaciones de palabras aisladas (silencio y desconocido), aunque la model card no especifica la versión exacta del dataset ni el número de clases. El entrenamiento original se realizó en el marco del benchmark MLCommons Tiny v1.1, que establece un pipeline de preprocesado típico: extracción de características de Mel-frequency cepstral coefficients (MFCC) a partir de audio de 1 segundo y posterior clasificación. No se dispone de información adicional sobre el proceso de entrenamiento, como el número de épocas, el optimizador o si se emplearon técnicas de regularización.

La conversión a ONNX se realizó con precisión FP32, lo que garantiza que los pesos y activaciones se almacenan en coma flotante de 32 bits, manteniendo la fidelidad del modelo original. El formato ONNX es independiente del framework, lo que permite ejecutarlo con ONNX Runtime, TensorRT, o compiladores específicos para dispositivos de borde.

## Capacidades

- Clasificación de audio para reconocimiento de comandos de voz (keyword spotting) sobre el dataset Speech Commands.
- Reconocimiento de palabras aisladas de corta duración (típicamente 1 segundo).
- Soporte para inferencia en tiempo real en dispositivos con recursos limitados gracias a su arquitectura ligera.
- Formato ONNX compatible con múltiples runtimes y entornos de despliegue.
- No incluye capacidades de generación de texto, razonamiento, visión ni tool calling; es un modelo de clasificación de audio puro.

## Casos de uso

- **Asistentes de voz embebidos**: el modelo puede integrarse en un microcontrolador o un dispositivo de bajo consumo para activar un asistente local al detectar una palabra de activación (por ejemplo, "sí" o "no"). Su arquitectura ligera permite ejecutarlo en tiempo real sin conexión a la nube.
- **Control por voz en el hogar**: en sistemas de domótica, el modelo puede clasificar comandos como "on", "off" o "stop" para controlar luces, electrodomésticos o persianas, evitando la dependencia de servicios externos.
- **Sistemas de accesibilidad**: personas con movilidad reducida pueden usar comandos de voz para interactuar con dispositivos de asistencia, como sillas de ruedas o interfaces de ordenador, aprovechando la baja latencia del modelo.
- **Prototipos de TinyML**: desarrolladores de soluciones de TinyML pueden integrar este modelo como punto de partida para experimentar con técnicas de cuantización, poda o despliegue en plataformas como Arduino o ESP32.
- **Filtrado de audio en dispositivos móviles**: el modelo puede integrarse en aplicaciones móviles para detectar palabras clave en tiempo real, por ejemplo, para activar una función específica de una app sin necesidad de tocar la pantalla.
- **Educación y experimentación**: sirve como ejemplo de referencia para aprender a convertir modelos de TensorFlow a ONNX y a desplegarlos en entornos de producción con ONNX Runtime, gracias a su pequeño tamaño y documentación asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo proviene del benchmark MLCommons Tiny, pero no se incluyen métricas específicas de precisión, latencia o rendimiento en la model card ni en el repositorio asociado.

## Requisitos de hardware

- **VRAM**: no aplica, ya que se ejecuta principalmente en CPU o MCU; no requiere GPU dedicada.
- **GPU recomendadas**: ninguna, puede ejecutarse en procesadores de gama baja o microcontroladores.
- **Compatibilidad con consumer GPU**: no es necesario, aunque puede ejecutarse en cualquier GPU si se usa ONNX Runtime con backend CUDA, pero no es un caso de uso típico.
- **Opciones de despliegue**: ONNX Runtime (CPU, CUDA, TensorRT), llama.cpp no aplica (no es un modelo de lenguaje), se puede compilar con herramientas como Edge Impulse o TensorFlow Lite Micro si se convierte a TFLite, pero el formato es ONNX.
- **Latencia y throughput**: no disponible en la información proporcionada; se espera que sea baja en hardware de bajo consumo debido a su diseño ligero, pero no se cuantifica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del mismo repositorio o en la búsqueda web. El propio autor publica una versión INT8 del mismo modelo, que podría compararse en términos de tamaño y precisión, pero no se ofrecen datos cuantitativos. No hay alternativas directas en el ecosistema ONNX con la misma arquitectura y dataset en la información disponible.

## Limitaciones y advertencias

- **Vocabulario limitado**: el modelo está entrenado para un conjunto de palabras fijas (el dataset Speech Commands incluye 10 palabras, más silencio y desconocido), por lo que no es apto para reconocimiento de voz continuo ni para vocabulario abierto.
- **Idioma**: el dataset está en inglés, por lo que el modelo no soporta otros idiomas de forma nativa.
- **Preprocesamiento requerido**: el modelo espera una entrada de audio preprocesada con extracción de características MFCC de 1 segundo; no acepta audio crudo directamente.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto; la alucinación no es aplicable, pero puede producir falsos positivos en entornos con ruido de fondo.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero es responsabilidad del usuario asegurarse de que el uso del dataset subyacente (Speech Commands) cumpla con sus términos.
- **Sesgos**: no se han documentado sesgos específicos, pero el modelo puede comportarse de forma subóptima con acentos no representados en el dataset de entrenamiento.
- **Producción**: no se han validado las condiciones de despliegue en producción; se recomienda probar el modelo en el entorno objetivo antes de su uso crítico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ketiswp/mlcommons-DS-CNN-SpeechCommands-fp32-onnx)
- [Versión INT8 del mismo modelo](https://huggingface.co/ketiswp/mlcommons-DS-CNN-SpeechCommands-int8-onnx)
- [Repositorio original MLCommons Tiny v1.1](https://github.com/mlcommons/tiny/tree/v1.1/benchmark/training/keyword_spotting)
- [Tutoriales de ONNX](https://github.com/onnx/tutorials)
- [ONNX Model Zoo](https://github.com/onnx/models)
- [ONNX Runtime - Modelos](https://onnxruntime.ai/models)
