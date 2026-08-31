# FermionResearch/Phonon-1-Big

## Resumen

Phonon-1-Big es el modelo más grande de la familia Phonon-1, un sistema de reconocimiento automático de voz (ASR) en inglés desarrollado por Fermion Research. Se distribuye con un peso de descarga de 581 MB, lo que lo hace apto para ejecución en dispositivos locales, portátiles o GPUs de datacenter. Está basado en el modelo Qwen/Qwen3-ASR-0.6B, cuantizado mediante entrenamiento con cuantización (QAT) a 2,4 bits por peso desde el inicio, una técnica que Fermion Research denomina "low-bit lane" y que ya aplicó en su modelo anterior Neutrino-1.

El modelo está pensado para transcripción de voz a texto en inglés con alta precisión y bajo coste computacional. Según la model card, alcanza un WER (word error rate) medio de 7,604 en ocho benchmarks estándar de ASR, con resultados especialmente buenos en LibriSpeech test-clean (2,667) y TED-LIUM (3,400). Su licencia Apache 2.0 permite uso comercial sin restricciones, y los mismos pesos funcionan en Apple Silicon (MLX), GPUs NVIDIA y CPU, lo que facilita su integración en entornos heterogéneos.

La relevancia de Phonon-1-Big radica en su combinación de tamaño reducido, precisión competitiva y flexibilidad de despliegue. Al ser un modelo ASR ligero y de código abierto, cubre un nicho donde los modelos grandes como Whisper large resultan excesivos en recursos, y donde las alternativas más pequeñas suelen sacrificar precisión. Su soporte para streaming y su API compatible con OpenAI lo convierten en una opción práctica para aplicaciones en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3-ASR-0.6B (arquitectura exacta no especificada) |
| Parametros totales | No disponible (el repositorio ocupa 0,6 GB con pesos cuantizados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica ventana de audio) |
| Tipos de cuantizacion | Ternario, 2,4 bits por peso (entrenado con QAT) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (librería mlx), compatible con runtimes para NVIDIA y CPU |

## Arquitectura y entrenamiento

Phonon-1-Big se construye sobre el modelo Qwen/Qwen3-ASR-0.6B, un sistema ASR de la familia Qwen. La arquitectura interna no se detalla en la documentación pública, pero al tratarse de un modelo de reconocimiento de voz, se presume una estructura encoder-decoder o similar, típica en este tipo de sistemas. La innovación principal reside en el entrenamiento con cuantización consciente (QAT) a 2,4 bits por peso, lo que permite reducir drásticamente el tamaño del modelo sin degradar excesivamente la precisión. Según el repositorio de GitHub, este es el segundo modelo en la línea "low-bit" de Fermion Research, después de Neutrino-1, y se entrenó desde cero con esta técnica, no como una cuantización posterior.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La información disponible se limita a los resultados de benchmarks y a la descripción general del enfoque de cuantización. El modelo se distribuye en formato MLX, optimizado para Apple Silicon, pero los mismos pesos pueden ejecutarse en GPUs NVIDIA y CPU mediante los runtimes proporcionados por Fermion Research.

## Capacidades

- Reconocimiento de voz en inglés (speech-to-text) con transcripción de audio a texto.
- Soporte de streaming, lo que permite transcripción en tiempo real mientras se recibe el audio.
- Ejecución en dispositivos locales (on-device) gracias a su tamaño reducido y bajo consumo de memoria.
- API compatible con OpenAI para transcripción de audio, mediante el comando `fermion serve`.
- Integración sencilla con la CLI `fermion transcribe` para transcripción de archivos de audio.
- Capacidad de procesar audio en diferentes entornos: Mac (MLX), GPU NVIDIA y CPU.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de audio de larga duración con un WER bajo en entornos de habla clara, como demuestra su resultado en LibriSpeech test-clean (2,667). Es adecuado para generar actas o subtítulos en tiempo real.
- Subtitulado automático de vídeos: gracias a su soporte de streaming y su tamaño compacto, puede integrarse en pipelines de edición de vídeo para generar subtítulos en inglés de forma local, sin depender de servicios en la nube.
- Asistente de voz en tiempo real: su capacidad de streaming y su baja latencia (transcribe una hora de audio en aproximadamente 2,5 minutos según el repositorio) lo hacen viable para aplicaciones de dictado o control por voz en dispositivos con recursos limitados.
- Transcripción de llamadas de atención al cliente: en entornos de telemarketing o soporte, el modelo puede convertir conversaciones telefónicas en texto para su análisis posterior, con un WER de 4,156 en SPGISpeech, un benchmark de discurso financiero.
- Procesamiento de audio en dispositivos edge: al ocupar solo 581 MB y poder ejecutarse en CPU, es adecuado para routers, raspberry pi o dispositivos IoT que necesiten transcripción local sin conexión.
- Integración en pipelines de análisis de medios: su API OpenAI-compatible permite sustituir fácilmente servicios de transcripción externos por un endpoint local, reduciendo costes y mejorando la privacidad de los datos.

## Benchmarks y rendimiento

La model card proporciona resultados de WER (word error rate, menor es mejor) medidos por el propio autor en conjuntos de test completos, con normalizador de texto Whisper y decodificación greedy. No se incluyen comparaciones con otros modelos en la información disponible.

| Benchmark | Phonon-1 Big (581 MB) |
|---|---:|
| LibriSpeech test-clean | 2,667 |
| LibriSpeech test-other | 5,722 |
| TED-LIUM | 3,400 |
| SPGISpeech | 4,156 |
| VoxPopuli | 8,369 |
| GigaSpeech | 11,291 |
| Earnings-22 | 12,417 |
| AMI | 12,812 |
| Macro (ocho benchmarks) | 7,604 |

Estos valores indican un rendimiento sólido en habla limpia y moderado en condiciones de ruido o acentos variados, como se observa en GigaSpeech y AMI. No se dispone de datos de latencia o throughput específicos para este modelo, aunque el repositorio menciona que Phonon-1 (la versión estándar) transcribe una hora de audio en unos 2,5 minutos.

## Requisitos de hardware

- VRAM estimada: al ocupar 581 MB en disco, la inferencia requiere menos de 1 GB de VRAM en GPU, y puede ejecutarse en CPU con memoria RAM suficiente (probablemente 2-4 GB).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2060) o GPUs de datacenter como A100 o H100 para procesamiento por lotes. En Apple Silicon, funciona nativamente con MLX.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media, así como en Macs con chip M1 o superior.
- Opciones de despliegue: CLI `fermion transcribe`, servidor OpenAI-compatible (`fermion serve`), runtimes para CUDA, Apple silicon y x86, y Docker según el repositorio de GitHub.
- Latencia y throughput: no se especifican valores exactos, pero la transcripción de una hora de audio en ~2,5 minutos sugiere un throughput de aproximadamente 24x tiempo real en hardware adecuado.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos ASR en la información proporcionada. Sin embargo, se puede establecer una comparación cualitativa con alternativas comunes:

| Modelo | Tamaño | Idiomas | Licencia | Formato | WER (LibriSpeech test-clean) |
|---|---|---|---|---|---|
| Phonon-1-Big | 581 MB | Inglés | Apache-2.0 | MLX | 2,667 |
| Whisper small | ~460 MB | Multilingüe | MIT | PyTorch/ONNX | ~3,0 (aprox.) |
| Whisper base | ~140 MB | Multilingüe | MIT | PyTorch/ONNX | ~5,0 (aprox.) |

Nota: los valores de Whisper son aproximados y no provienen de la misma metodología de medición, por lo que la comparación es orientativa. Phonon-1-Big ofrece un WER competitivo con un tamaño similar a Whisper small, pero limitado al inglés, mientras que Whisper soporta múltiples idiomas. La licencia Apache-2.0 de Phonon-1-Big es más permisiva que la MIT de Whisper en cuanto a atribución, aunque ambas permiten uso comercial.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para transcripción en otros idiomas.
- No se han publicado detalles sobre el conjunto de entrenamiento, por lo que se desconocen posibles sesgos en acentos, dialectos o dominios específicos.
- El rendimiento en condiciones de ruido o habla solapada es moderado, como indican los WER en GigaSpeech (11,291) y AMI (12,812).
- Al ser un modelo cuantizado a 2,4 bits, puede presentar errores de transcripción en palabras poco frecuentes o nombres propios, aunque no se han documentado casos concretos.
- No se especifica si el modelo soporta puntuación o formato de salida enriquecido; la normalización se realiza con el normalizador de texto de Whisper, lo que puede afectar a la fidelidad de la transcripción.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar la atribución requerida en la documentación de Fermion Research.
- Para producción, es recomendable evaluar el modelo en el dominio específico de uso, ya que los benchmarks generales pueden no reflejar el rendimiento en audio con características particulares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FermionResearch/Phonon-1-Big
- Repositorio de GitHub: https://github.com/fermionresearch/phonon
- Documentación de modelos de voz: https://www.fermionresearch.com/docs/speech-models/
- Sitio web de Fermion Research: https://www.fermionresearch.com/
- Modelo base Qwen/Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
