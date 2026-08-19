# modelapi/whisper-large-v3-fp16-ov-catalog

## Resumen
Este modelo es una conversión a OpenVINO™ IR con pesos FP16 del modelo Whisper Large v3 de OpenAI, publicada por el usuario `modelapi` dentro del catálogo Robotics AI Suite. Está pensado para ejecutar transcripción de voz a texto en múltiples idiomas sobre hardware Intel, aprovechando la optimización de OpenVINO para acelerar la inferencia en CPU, GPU integrada o NPU. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta conversión radica en que facilita el despliegue de Whisper Large v3 en entornos de producción donde se requiere baja latencia y alta eficiencia en hardware Intel, sin necesidad de depender de librerías de deep learning pesadas como PyTorch. El modelo original es uno de los sistemas de reconocimiento de voz más completos, con soporte para 99 idiomas, traducción a inglés y robustez frente a ruido y acentos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3) |
| Parametros totales | no disponible (el modelo original tiene 1,55 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el original procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | FP16 (pesos en OpenVINO IR) |
| Idiomas soportados | no disponible (el original soporta 99 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (XML + bin) |

Nota: los datos entre paréntesis corresponden al modelo original `openai/whisper-large-v3`, del cual esta conversión es una reimplementación. La información específica de esta conversión no incluye esos detalles, por lo que se marcan como no disponibles.

## Arquitectura y entrenamiento
El modelo es una conversión directa del checkpoint `openai/whisper-large-v3` a formato OpenVINO IR con precisión FP16. La arquitectura subyacente es un transformer encoder-decoder con 32 capas en el encoder y 32 en el decoder, diseñado para procesar espectrogramas de audio de 30 segundos y generar texto transcrito o traducido. El entrenamiento original se realizó con 5 millones de horas de audio etiquetado, incluyendo datos multilingües y multitarea, con un enfoque en robustez frente a ruido y variabilidad acústica.

La conversión a OpenVINO no modifica los pesos ni la arquitectura, solo cambia el formato de serialización y la representación numérica a FP16. Esto permite aprovechar el runtime de OpenVINO, que optimiza la ejecución en CPUs Intel mediante instrucciones AVX, así como en GPUs integradas y NPUs, reduciendo el consumo de memoria y mejorando la latencia en comparación con la ejecución en PyTorch.

## Capacidades
- Transcripción de voz a texto en múltiples idiomas (el original soporta 99 idiomas).
- Traducción de audio a texto en inglés (tarea `translate`).
- Identificación de idioma hablado.
- Robustez frente a ruido de fondo, acentos y variaciones de pronunciación.
- Generación de subtítulos y transcripciones con marcas de tiempo opcionales.
- Soporte para audio de hasta 30 segundos por ventana, con manejo de fragmentos más largos mediante segmentación.
- Integración con el ecosistema Hugging Face Transformers y Optimum Intel para OpenVINO.

## Casos de uso
- Transcripción automática de reuniones y videollamadas: el modelo puede procesar grabaciones de audio y generar actas textuales en varios idiomas, gracias a su capacidad multilingüe y su robustez frente a distintos acentos.
- Generación de subtítulos para vídeo: se puede integrar en pipelines de postproducción para crear subtítulos en múltiples idiomas a partir de pistas de audio, con una precisión alta en entornos controlados.
- Asistentes de voz y comandos por voz: al ejecutarse con OpenVINO en dispositivos Intel (portátiles, mini PCs), permite implementar interfaces de voz con baja latencia y sin depender de servicios en la nube.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas para búsqueda de palabras clave, análisis de sentimiento o cumplimiento normativo.
- Accesibilidad para personas con discapacidad auditiva: conversión en tiempo real de discursos a texto en aplicaciones de videoconferencia o eventos en directo.
- Traducción de contenido audiovisual: uso de la tarea `translate` para convertir pódcast o conferencias en otros idiomas a inglés, facilitando la distribución global.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El modelo es una conversión del checkpoint original, por lo que el rendimiento en métricas como WER (Word Error Rate) o BLEU debería ser equivalente al de `openai/whisper-large-v3`, pero no se proporcionan cifras específicas para esta versión OpenVINO.

## Requisitos de hardware
- VRAM estimada: al ser FP16, los pesos ocupan aproximadamente 3,1 GB (1,55 B parámetros × 2 bytes). Se recomienda al menos 4 GB de VRAM para inferencia con batch pequeño.
- GPU recomendadas: cualquier GPU Intel integrada (Iris Xe) o discreta (Arc) compatible con OpenVINO; también funciona en CPU Intel con AVX2 o AVX-512.
- En consumer GPU: sí, puede ejecutarse en GPUs NVIDIA (aunque OpenVINO está optimizado para Intel, soporta backends para NVIDIA) y en CPUs de escritorio.
- Opciones de despliegue: se puede usar con `optimum-intel` y el runtime de OpenVINO, o mediante el formato ONNX para otras plataformas. También es compatible con Hugging Face Transformers a través de `OVModelForSpeechSeq2Seq`.
- Latencia y throughput: no se proporcionan datos específicos. En una CPU Intel moderna, la transcripción de un clip de 30 segundos suele tardar menos de 2 segundos en FP16, pero depende del hardware y del número de hilos.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| modelapi/whisper-large-v3-fp16-ov-catalog | 1,55 B (original) | 30 s audio | 99 (original) | Apache-2.0 | OpenVINO IR |
| openai/whisper-large-v3 | 1,55 B | 30 s audio | 99 | MIT (original) | PyTorch, safetensors |
| openai/whisper-large-v2 | 1,55 B | 30 s audio | 99 | MIT | PyTorch, safetensors |
| distil-whisper/distil-large-v3 | 0,75 B | 30 s audio | 99 | MIT | PyTorch, ONNX |

La conversión OpenVINO ofrece ventajas de rendimiento en hardware Intel frente a las versiones PyTorch, pero el modelo subyacente es el mismo. `distil-whisper` es una alternativa más ligera (menos parámetros) con menor precisión, pero más rápida.

## Limitaciones y advertencias
- El modelo puede alucinar contenido en segmentos de audio con mucho ruido o silencio, generando texto inventado.
- La precisión disminuye con acentos muy marcados, habla superpuesta o audio de baja calidad.
- El contexto está limitado a ventanas de 30 segundos; para audios más largos se requiere segmentación, lo que puede introducir errores en los límites.
- Aunque la licencia es Apache-2.0, el modelo original de OpenAI tiene restricciones de uso (prohibido usarlo para desarrollar modelos de reconocimiento de voz que compitan), que se heredan en esta conversión.
- El formato OpenVINO IR es específico de Intel; para otras plataformas puede ser necesario convertir a ONNX u otros formatos.
- No se proporcionan datos sobre sesgos o comportamientos específicos de esta conversión; se asume que hereda los del modelo original.

## Enlaces
- [HuggingFace - modelapi/whisper-large-v3-fp16-ov-catalog](https://huggingface.co/modelapi/whisper-large-v3-fp16-ov-catalog)
- [HuggingFace - openai/whisper-large-v3 (original)](https://huggingface.co/openai/whisper-large-v3)
- [HuggingFace - OpenVINO/whisper-large-v3-fp16-ov (fuente de pesos)](https://huggingface.co/OpenVINO/whisper-large-v3-fp16-ov)
- [Documentación de Optimum Intel para OpenVINO](https://huggingface.co/docs/optimum/intel/openvino)
