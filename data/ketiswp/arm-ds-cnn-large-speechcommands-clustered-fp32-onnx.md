# ketiswp/arm-DS-CNN-Large-SpeechCommands-clustered-fp32-onnx

## Resumen

El modelo arm-DS-CNN-Large-SpeechCommands-clustered-fp32-onnx es una version en formato ONNX con precision FP32 del clasificador DS-CNN Large, desarrollado originalmente por Arm para el reconocimiento de palabras clave (keyword spotting). El modelo ha sido convertido y publicado por el equipo KETI Software Platform Team (ketiswp) en Hugging Face, y se distribuye bajo licencia Apache 2.0.

La arquitectura DS-CNN (Depthwise Separable Convolutional Neural Network) emplea convoluciones separables en profundidad para reducir drasticamente el numero de parametros y operaciones, lo que permite ejecutar el modelo en dispositivos de borde con recursos limitados, como microcontroladores Arm Cortex-M. La variante "large" es la de mayor capacidad dentro de la familia DS-CNN, presentada en el articulo "Hello Edge: A Simple Approach to Keyword Spotting on Microcontrollers" de Zhang et al. (2018).

El modelo se publica como parte de un par: esta version FP32 en ONNX y una version companion INT8 disponible en un repositorio separado. El nombre "clustered" sugiere que se ha aplicado agrupamiento de pesos (weight clustering) durante el entrenamiento, aunque la model card no detalla el proceso. Su pipeline es audio-classification y esta pensado para detectar comandos de voz cortos en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DS-CNN (red neuronal convolucional con convoluciones separables en profundidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de audio; entrada tipica de 1 segundo de audio) |
| Tipos de cuantizacion | FP32 (este modelo); existe version companion INT8 |
| Idiomas soportados | no disponible (el dataset original Google Speech Commands contiene comandos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura DS-CNN se basa en capas de convolucion separable en profundidad (depthwise separable convolutions), una tecnica que factoriza una convolucion estandar en dos operaciones: una convolucion depthwise y una pointwise. Esto reduce el numero de parametros y operaciones FLOP de forma considerable en comparacion con CNN convencionales, manteniendo una precision competitiva para tareas de clasificacion de audio. La variante "large" aumenta el numero de filtros y capas respecto a las versiones "small" y "medium" de la misma familia.

El modelo fue entrenado originalmente sobre el dataset Google Speech Commands, que contiene clips de audio de 1 segundo con palabras clave como "yes", "no", "up", "down", "left", "right", "on", "off", "stop" y "go", ademas de clases de silencio y desconocido. La model card no especifica la cantidad de tokens ni el proceso de entrenamiento (RLHF, DPO, etc.), pero al tratarse de un modelo de clasificacion supervisada, no aplica el ajuste por refuerzo.

La version publicada es una conversion a ONNX en precision FP32, lo que permite su ejecucion con ONNX Runtime en una amplia variedad de plataformas, incluyendo CPU sin aceleracion GPU. El repositorio fuente (ML-zoo de Arm) indica que el modelo esta disenado para despliegue en microcontroladores, y la version INT8 companion esta pensada para entornos con memoria limitada.

## Capacidades

- Clasificacion de audio: detecta y clasifica comandos de voz cortos (keyword spotting) entre las clases del dataset Google Speech Commands.
- Inferencia en tiempo real: disenado para latencias bajas en dispositivos de borde, con consumo de recursos reducido.
- Precision FP32: mantiene la precision completa del modelo original, sin perdida por cuantizacion.
- Compatibilidad ONNX: puede ejecutarse en ONNX Runtime, con soporte en multiples plataformas (CPU, GPU, NPU).
- Version companion INT8: permite despliegue en entornos con memoria muy limitada a cambio de una pequena perdida de precision.
- No soporta tool calling, razonamiento multi-paso ni capacidades generativas: es un clasificador puro, no un modelo de lenguaje.

## Casos de uso

- Asistente de voz en dispositivos IoT: el modelo puede integrarse en un dispositivo de hogar inteligente para detectar la palabra de activacion (por ejemplo, "ok" o un comando especifico) y despertar un asistente mas grande solo cuando se detecta la palabra clave, reduciendo el consumo de energia.
- Control de electrodomesticos por voz: integrado en un microcontrolador de un electrodomestico (lavadora, horno, etc.) para reconocer comandos como "on", "off", "up" o "down" sin necesidad de conexion a la nube ni de un asistente central.
- Sistema de seguridad por voz: un dispositivo de acceso controlado puede usar el modelo para detectar una palabra clave de activacion y activar el sistema de reconocimiento de hablante, evitando el consumo continuo de un modelo mas pesado.
- Accesibilidad para personas con movilidad reducida: el modelo puede incorporarse en un teclado o interfaz de control por voz para permitir a usuarios con dificultades motoras ejecutar acciones simples (encender/apagar, subir/bajar) mediante comandos de voz.
- Automatizacion industrial de voz: en entornos de fabricacion, el modelo puede captar comandos de voz de un operario para controlar maquinaria o sistemas de iluminacion, siempre que el ruido ambiente sea moderado.
- Despliegue en microcontroladores: dado su tamano reducido y su formato ONNX, el modelo puede ejecutarse en placas como STM32 o nRF52 con ONNX Runtime para microcontroladores, habilitando control por voz en dispositivos sin sistema operativo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, latencia ni consumo de recursos. Para datos de rendimiento, se puede consultar la publicacion original "Hello Edge: A Simple Approach to Keyword Spotting on Microcontrollers" de Zhang et al. (2018) y el repositorio ML-zoo de Arm, donde se reportan metricas de precision en el dataset Google Speech Commands.

## Requisitos de hardware

- Modelo de tamano reducido: no se requiere GPU para inferencia; puede ejecutarse en CPU.
- Memoria: el modelo FP32 es compacto (el tamano del repositorio se muestra como 0.0 GB en Hugging Face, aunque el archivo ONNX real no se ha especificado en la model card). La version INT8 companion es mas adecuada para dispositivos con menos de 1 MB de RAM.
- GPU recomendadas: ninguna. El modelo esta pensado para despliegue en CPU o microcontroladores.
- Compatibilidad con consumer GPU: si, aunque no es necesario; se puede ejecutar en cualquier CPU moderna.
- Opciones de despliegue: ONNX Runtime, ONNX Runtime Mobile, TensorFlow Lite (tras conversion), o ejecucion directa en microcontroladores con soporte de ONNX.
- Latencia y throughput: no disponibles. Al ser un modelo de clasificacion de audio con entrada de 1 segundo, se espera latencias del orden de decenas de milisegundos en CPU de gama media, pero no se han publicado valores concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arm-DS-CNN-Large-SpeechCommands-clustered-fp32-onnx (este) | no disponible | ONNX FP32 | no disponible | Apache 2.0 | Hugging Face |
| arm-DS-CNN-Large-SpeechCommands-clustered-int8-onnx | no disponible | ONNX INT8 | no disponible | Apache 2.0 | Hugging Face (modelo companion) |
| DS-CNN Small / Medium (ML-zoo de Arm) | no disponible | TFLite (int8) | no disponible | Apache 2.0 | GitHub ML-zoo |

No se dispone de informacion sobre modelos comparables de la misma categoria en los resultados de busqueda. El modelo companion INT8 es la comparativa mas directa: ofrece menor precision (por la cuantizacion) pero menor uso de memoria, siendo mas adecuado para microcontroladores con recursos muy limitados.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en el dataset Google Speech Commands, por lo que su vocabulario se limita a las palabras clave incluidas (yes, no, up, down, left, right, on, off, stop, go) y clases de silencio/desconocido. No reconoce comandos fuera de este conjunto.
- La model card no especifica la cantidad exacta de parametros ni la precision en el test set, lo que dificulta la evaluacion objetiva sin consultar la fuente original.
- La version FP32 requiere mas memoria que la version INT8, lo que puede ser un inconveniente en microcontroladores con menos de 1 MB de RAM.
- La conversion a ONNX puede introducir diferencias numericas menores respecto al modelo original en TensorFlow, aunque en FP32 estas diferencias suelen ser despreciables.
- El modelo no es robusto frente a ruido de fondo severo o acentos muy distintos de los del dataset de entrenamiento; se recomienda probar en el entorno de despliegue real.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero es recomendable verificar la procedencia de los datos de entrenamiento (Google Speech Commands esta bajo licencia CC BY 4.0, que permite uso comercial con atribucion).
- No hay informacion sobre sesgos de genero, edad o acento en el modelo; es posible que el rendimiento varíe entre hablantes de diferentes regiones.

## Enlaces

- [Hugging Face - modelo FP32](https://huggingface.co/ketiswp/arm-DS-CNN-Large-SpeechCommands-clustered-fp32-onnx)
- [Hugging Face - modelo INT8 companion](https://huggingface.co/ketiswp/arm-DS-CNN-Large-SpeechCommands-clustered-int8-onnx)
- [Repositorio original en Arm ML-zoo](https://github.com/Arm-Examples/ML-zoo/tree/68b5fbc77ed28e67b2efc915997ea4477c1d9d5b/models/keyword_spotting/ds_cnn_large)
- [Paper "Hello Edge: A Simple Approach to Keyword Spotting on Microcontrollers"](https://arxiv.org/abs/1711.07128)
