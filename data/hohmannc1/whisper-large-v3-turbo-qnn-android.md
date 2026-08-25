# hohmannc1/whisper-large-v3-turbo-qnn-android

## Resumen

Whisper Large-V3-Turbo para NPU de Snapdragon es una adaptación del modelo de reconocimiento de voz de OpenAI, optimizada por hohmannc1 para ejecutarse en la unidad de procesamiento neuronal (NPU) Hexagon de procesadores Snapdragon en dispositivos Android. El paquete se distribuye como modelos ONNX con contextos QNN (Qualcomm Neural Network) que permiten la inferencia acelerada por hardware, reduciendo la latencia de transcripción a aproximadamente dos segundos por cada treinta segundos de audio, frente a los cuatro veces la duración del audio que requiere whisper.cpp en CPU.

La relevancia de este modelo reside en su enfoque práctico para el despliegue en dispositivos móviles: ofrece transcripción local, privada y sin conexión, con un rendimiento notablemente superior al de las alternativas basadas en CPU. El paquete incluye cinco archivos por chip (encoder.onnx, decoder.onnx, dos contextos QNN y vocab.bin) y cubre cinco SoCs Snapdragon, desde el 8 Gen 2 hasta el 8 Elite Gen 5. La licencia es Apache 2.0, y los pesos provienen del modelo base de OpenAI, que está bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (Transformer encoder-decoder) con decodificador autorregresivo |
| Parametros totales | 809 millones (heredados de Whisper Large-v3-Turbo) |
| Parametros activos | no disponible |
| Longitud de contexto | 448 tokens de audio (30 segundos) y hasta 224 tokens de texto generados (configuración de Whisper) |
| Tipos de cuantizacion | w8a16 (pesos en int8, activaciones en fp16) para la NPU |
| Idiomas soportados | aleman (de) e ingles (en) |
| Licencia | Apache 2.0 (modelo base bajo MIT, implementacion de Transformers bajo Apache 2.0) |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx) con contextos QNN (encoder_qairt_context.bin, decoder_qairt_context.bin) y vocab.bin |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado con 680.000 horas de audio anotado en multiples idiomas. La variante large-v3-turbo es una version optimizada de large-v3 que reduce el numero de capas del decodificador de 32 a 4, manteniendo el encoder completo, lo que permite una transcripcion mas rapida con una degradacion minima en la precision.

La adaptacion para NPU se realizo mediante cuantizacion w8a16 (pesos en int8, activaciones en fp16) y traduccion del modelo a grafo de ejecucion de la NPU Hexagon de Qualcomm, usando el Qualcomm AI Hub. Los archivos ONNX son una capa delgada que referencia los contextos QNN, donde residen los pesos cuantizados. No se ha realizado ningun entrenamiento o fine-tuning adicional sobre el modelo original; se trata exclusivamente de una conversion para inferencia acelerada.

## Capacidades

- Reconocimiento automatico de voz (ASR) para ingles y aleman, con transcripcion de audio de hasta 30 segundos por pasada.
- Generacion de transcripciones con puntuacion y normalizacion de texto, gracias al entrenamiento de Whisper en datos etiquetados con transcripciones limpias.
- Inferencia en tiempo real en dispositivos Android con NPU Hexagon: aproximadamente 2 segundos para procesar 30 segundos de audio.
- Compatibilidad con la API de ONNX Runtime y el ejecutor QNN, permitiendo integracion en aplicaciones Android nativas.
- No soporta vision, tool calling ni funciones de agente; es exclusivamente un modelo de transcripcion de voz.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones de productividad: el modelo puede convertir grabaciones de voz de reuniones o notas personales en texto en tiempo real, gracias a su baja latencia (2 segundos por 30 segundos de audio) y a que funciona localmente en el dispositivo.
- Asistente de dictado para correos y mensajes: integrado en un teclado o app de mensajeria, permite redactar textos por voz con transcripcion instantanea y sin necesidad de conexion.
- Subtitulacion de videos en el movil: se puede usar para generar subtitulos automaticos en ingles y aleman para videos grabados con el dispositivo, procesando el audio localmente para evitar subidas a la nube.
- Aplicacion de accesibilidad para personas con discapacidad auditiva: el modelo puede transcribir conversaciones o sonidos ambientales en tiempo real, mostrando el texto en pantalla, con la ventaja de ser completamente offline.
- Herramienta de aprendizaje de idiomas: permite practicar pronunciacion y comprension auditiva en ingles y aleman, transcribiendo la voz del usuario y comparandola con la transcripcion esperada.
- Asistente de voz local para tareas de domotica: el modelo puede interpretar comandos de voz en ingles o aleman en un dispositivo Android conectado a la casa inteligente, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es que la transcripcion de 30 segundos de audio tarda aproximadamente 2 segundos en la NPU, frente a aproximadamente 120 segundos (cuatro veces la duracion) con whisper.cpp en la CPU de la misma hardware.

## Requisitos de hardware

- Dispositivos Android con procesadores Snapdragon 8 Gen 2 (sm8550), 7 Gen 4 (sm7750), 8 Gen 3 (sm8650), 8 Elite (sm8750) o 8 Elite Gen 5 (sm8850), con NPU Hexagon.
- El paquete de modelos pesa 3.3 GB en el repositorio; el espacio en disco necesario para la instalacion depende de la variante de chip concreta (el encoder de 7 Gen 4 es 70 MB mayor que el de 8 Gen 2).
- Requiere las librerias QNN Runtime (libQnnHtp.so, libQnnSystem.so y stubs/skel de la HTP correspondiente) del SDK de QAIRT, que no se incluyen en el repositorio.
- La inferencia se realiza mediante ONNX Runtime con el ejecutor QNN; no es compatible con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo ONNX especifico para NPU.
- No se puede ejecutar en GPU de escritorio ni en tarjetas de consumo general; esta disenado exclusivamente para el pipeline QNN en Android.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Whisper Large-v3-Turbo (OpenAI) | 809M | 30s audio | Referencia de calidad | MIT | PyTorch, safetensors |
| Whisper Large-v3-Turbo QNN (este modelo) | 809M (cuantizado w8a16) | 30s audio | Inferencia NPU ~2s por 30s audio | Apache 2.0 | ONNX + QNN context |
| Whisper Large-v3-Turbo q5_0 (whisper.cpp) | 809M (cuantizado q5_0) | 30s audio | Inferencia CPU ~4x duracion audio | MIT | GGML (ggml-large-v3-turbo-q5_0.bin) |

La comparativa muestra que la version QNN ofrece una latencia drasticamente menor en hardware compatible, a cambio de limitarse a chips Snapdragon especificos y requerir el runtime QNN propietario. La version GGUF es portable a cualquier CPU, pero mas lenta.

## Limitaciones y advertencias

- El modelo solo soporta ingles y aleman; no es util para otros idiomas sin reentrenamiento.
- La cuantizacion w8a16 puede introducir una degradacion menor de la precision en comparacion con el modelo en fp32, aunque no se proporcionan metricas cuantitativas.
- No se distribuyen las librerias QNN Runtime; el usuario debe obtenerlas del QAIRT SDK, y sus condiciones de redistribucion no permiten su publicacion como archivo independiente.
- La compatibilidad es exclusiva con SoCs Snapdragon concretos; no funciona en otras arquitecturas de NPU (como Mali, Exynos o Tensor).
- El modelo no ha sido evaluado para casos de uso de produccion critica; no hay datos sobre robustez ante ruido, acentos o dialectos especificos.
- No incluye capacidades de vision, audio de entrada no vocal, ni funciones de agente; es estrictamente ASR.
- El paquete esta pensado para ser descargado por la app BlueSpeech; no se ofrece un pipeline de instalacion general para otras aplicaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hohmannc1/whisper-large-v3-turbo-qnn-android
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Implementacion de Transformers (v4.42.3) utilizada: https://github.com/huggingface/transformers/tree/v4.42.3/src/transformers/models/whisper
- Documentacion de Qualcomm AI Hub FAQ (licencia de los archivos traducidos): https://workbench.aihub.qualcomm.com/docs/hub/faq.html
- Modelo GGUF alternativo (whisper.cpp q5_0): https://huggingface.co/hohmannc1/whisper-large-v3-turbo-q5-original
- Guia de despliegue de Qualcomm para Whisper Large-V3-Turbo: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/whisper_large_v3_turbo/README.md
- Pagina de referencia de Whisper Large V3 Turbo GGUF: https://local-ai-zone.github.io/models/whisper-large-v3-turbo.html
