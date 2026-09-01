# imbcmdth/whisper-medium-onnx

## Resumen

El modelo `imbcmdth/whisper-medium-onnx` es una exportación del sistema de reconocimiento automático del habla (ASR) `openai/whisper-medium` a un único grafo ONNX que integra el encoder, el decoder y la búsqueda de haces (beam search) en una sola operación de ONNX Runtime (`WhisperBeamSearch`). Esto permite transcribir una ventana de 30 segundos de audio con una única llamada a `InferenceSession.run()`, sin necesidad de gestionar cachés de KV entre llamadas. El autor, imbcmdth, proporciona dos variantes: una en precisión fp32 y otra cuantizada a int8, ambas con la misma interfaz de entrada y salida.

La relevancia de este modelo radica en su facilidad de integración en aplicaciones que requieren ASR por lotes o en tiempo real, aprovechando la optimización de ONNX Runtime y la posibilidad de ejecutarlo tanto en CPU como en GPU. Al estar basado en Whisper-medium, hereda las capacidades multilingües y de traducción de voz del modelo original, aunque la ficha no especifica los idiomas soportados. El tamaño del repositorio es de 4.3 GB, con el modelo int8 autocontenido en un archivo de aproximadamente 1 GB y el fp32 con pesos externos de unos 3.3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: openai/whisper-medium) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantización | int8 (dinámica) y fp32 |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (archivos .onnx y .data) |

## Arquitectura y entrenamiento

El modelo es una exportación a ONNX del transformer encoder-decoder de Whisper-medium, realizada con la herramienta `onnxruntime.transformers.models.whisper.convert_to_onnx` (onnxruntime 1.22.0, torch 2.6.0+cpu, transformers 4.46.3). El grafo resultante fusiona el encoder, el bucle de decodificación y la búsqueda de haces en una única operación contribuida de ONNX Runtime (`WhisperBeamSearch`), lo que elimina la necesidad de transferir cachés de KV entre llamadas. La cuantización int8 se aplicó de forma dinámica, por tensor, sobre las operaciones `MatMul` y `Gemm`, manteniendo el embedding de tokens en fp32. No se aplicó fusión de grafos adicional.

El modelo base, Whisper-medium, fue entrenado por OpenAI con 680 000 horas de datos etiquetados, lo que le confiere una fuerte capacidad de generalización a múltiples dominios y datasets. Sin embargo, la ficha no proporciona detalles sobre el dataset específico ni sobre el proceso de entrenamiento (RLHF, DPO, etc.) de esta exportación, ya que se trata de una conversión de pesos ya entrenados.

## Capacidades

- Transcripción de audio a texto en ventanas de 30 segundos, con soporte para timestamps (tokens >= 50364) y detección automática de idioma (pasando solo el token de inicio).
- Generación de transcripciones con búsqueda de haces (beam search) configurable mediante parámetros como `num_beams`, `length_penalty` y `repetition_penalty`.
- Soporte para traducción de voz (heredado de Whisper, aunque no se detalla en la ficha).
- Ejecución tanto en CPU como en GPU mediante ONNX Runtime, con la recomendación de usar la versión int8 en CPU y fp32 en GPU según las mediciones del autor.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de audio de hasta 30 segundos por ventana, lo que permite transcribir conversaciones largas concatenando ventanas. Su tamaño moderado y su compatibilidad con CPU lo hacen adecuado para entornos sin GPU.
- Subtitulado automático de vídeos: al generar timestamps, se pueden sincronizar los subtítulos con el audio. La precisión de los timestamps (diferencia <0.04 s en pruebas) facilita esta tarea.
- Asistentes de voz y comandos por voz: la baja latencia en GPU (1.64 s en fp32 con RTX 4090) permite su uso en aplicaciones interactivas, aunque no es tiempo real estricto.
- Análisis de llamadas de atención al cliente: la transcripción automática de llamadas puede alimentar sistemas de análisis de sentimiento o búsqueda de palabras clave. La capacidad de detección de idioma ayuda a clasificar llamadas multilingües.
- Traducción de voz a texto en otros idiomas: aunque no se detalla, Whisper-medium soporta traducción, lo que permite transcribir audio en un idioma y generar texto en otro.
- Despliegue en entornos edge o con recursos limitados: la versión int8, con un tamaño de ~1 GB, puede ejecutarse en CPU con un rendimiento aceptable (9.18 s por ventana), lo que la hace viable para dispositivos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como WER o CER) en la información disponible. Sin embargo, el autor proporciona mediciones de latencia para una ventana de 30 segundos con `num_beams=5` y `max_length=200`, en un Ryzen CPU y una RTX 4090 (mejor de tres ejecuciones):

| Modelo | CPU | CUDA |
|---|---|---|
| int8 | 9.18 s | 5.40 s |
| fp32 | 13.14 s | 1.64 s |

Estos datos indican que la versión int8 es más rápida en CPU, pero en GPU el fp32 supera ampliamente al int8 debido a que la operación `MatMulInteger` cae en CPU. En una prueba con un clip en español, ambos modelos produjeron la misma transcripción y los timestamps coincidieron dentro de 0.04 s.

## Requisitos de hardware

- El modelo int8 autocontenido ocupa aproximadamente 1 GB en disco; el fp32 requiere 3.3 GB de pesos externos.
- Para inferencia en CPU, se recomienda la versión int8 (9.18 s por ventana de 30 s en un Ryzen). No se especifica el modelo exacto de CPU.
- Para GPU, se recomienda la versión fp32 (1.64 s en RTX 4090). La VRAM necesaria no se indica, pero el tamaño de los pesos (3.3 GB) sugiere que se necesita al menos 4-5 GB de VRAM, aunque no se confirma.
- Se puede desplegar con ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider). No se mencionan otras herramientas como vLLM o llama.cpp, ya que el formato es ONNX.
- La latencia medida es para una ventana de 30 s; para audio más largo habría que procesar múltiples ventanas.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. Existen otras conversiones ONNX de Whisper-medium, como `Intel/whisper-medium-onnx-int4-inc`, pero no se tienen datos de rendimiento o precisión de esos modelos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La cuantización int8 puede introducir una ligera degradación en la precisión, aunque en la prueba realizada con un clip en español no se observaron diferencias en la transcripción.
- El modelo solo procesa ventanas de 30 segundos; para audio más largo es necesario segmentar y concatenar resultados, lo que puede complicar la gestión de contextos largos.
- La versión int8 en GPU es significativamente más lenta que la fp32 debido a la caída de `MatMulInteger` a CPU; se recomienda usar int8 solo en CPU.
- No se especifican los idiomas soportados, aunque el modelo base Whisper-medium es multilingüe. Se debe verificar la compatibilidad con el idioma objetivo.
- La licencia declarada es Apache-2.0, pero el modelo original de OpenAI se distribuye bajo MIT; es recomendable revisar los términos de uso de ambos.
- No se proporcionan garantías sobre el comportamiento en producción; se recomienda validar con datos propios antes de desplegar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/imbcmdth/whisper-medium-onnx)
- [Modelo base openai/whisper-medium](https://huggingface.co/openai/whisper-medium)
- [Herramienta de conversión de ONNX Runtime para Whisper](https://github.com/microsoft/onnxruntime) (referencia indirecta, no se proporciona enlace directo en la información)

Nota: No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
