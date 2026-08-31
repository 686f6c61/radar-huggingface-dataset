# FermionResearch/Phonon-1

## Resumen

Phonon-1 es un modelo de reconocimiento automático de voz (ASR) para inglés desarrollado por FermionResearch, un laboratorio especializado en modelos de lenguaje locales y métodos de cuantización de baja precisión. Se trata de una versión cuantizada del modelo Qwen/Qwen3-ASR-0.6B, entrenada desde el inicio con 2,4 bits por peso mediante quantization-aware training (QAT), lo que permite reducir el tamaño de descarga a 415 MB sin renunciar a una calidad competitiva en transcripción.

El modelo está diseñado para ejecutarse en dispositivos con recursos limitados: funciona en un portátil, en una GPU de datacenter o incluso en CPU, y transcribe una hora de audio en aproximadamente dos minutos y medio (mediana de 23,9× realtime en un MacBook Air con chip M5). Es el segundo modelo de la línea low-bit del laboratorio, después de Neutrino-1, y su licencia Apache-2.0 permite uso comercial sin restricciones.

Su relevancia actual radica en la combinación de tamaño reducido, velocidad y precisión, lo que lo convierte en una opción práctica para despliegues on-device, transcripción en tiempo real y aplicaciones de voz en entornos con limitaciones de memoria o ancho de banda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen/Qwen3-ASR-0.6B) |
| Parametros totales | No disponible (el modelo base tiene 0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2,4 bits por peso (ternario, QAT) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (también compatible con CUDA y CPU) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su origen: Phonon-1 es una versión cuantizada de Qwen/Qwen3-ASR-0.6B, un modelo de reconocimiento de voz de la familia Qwen. La innovación principal es el entrenamiento con cuantización consciente (QAT) a 2,4 bits por peso desde el inicio, en lugar de aplicar una cuantización posterior al entrenamiento. Este enfoque permite mantener un WER competitivo con un tamaño de descarga de solo 415 MB.

No se han publicado datos sobre la composición del dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. Tampoco se especifica si el modelo emplea atención lineal, decodificación especulativa u otras optimizaciones. El laboratorio lo describe como el segundo modelo de su línea low-bit, tras Neutrino-1, y menciona que los mismos pesos funcionan en Mac (vía MLX), NVIDIA GPU y CPU.

## Capacidades

- Reconocimiento de voz automático (ASR) en inglés, con salida de texto transcrito.
- Soporte de transcripción en streaming, según las etiquetas del modelo.
- Ejecución on-device gracias a su bajo peso (415 MB) y cuantización ternaria.
- Compatibilidad multiplataforma: MLX en Apple Silicon, CUDA en NVIDIA y CPU x86.
- Integración con la CLI `fermion` y un servidor HTTP compatible con la API de OpenAI para transcripciones.
- No se documentan capacidades de tool calling, agentes, visión ni otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de audio de larga duración (una hora en ~2,5 minutos) con un WER bajo en conjuntos como LibriSpeech test-clean (2,64 %), lo que lo hace adecuado para generar actas o subtítulos de forma local sin depender de servicios en la nube.
- Subtitulado automático de vídeos: su velocidad de 23,9× realtime permite generar subtítulos para contenido audiovisual en tiempo real o en lote, incluso en portátiles sin GPU dedicada.
- Asistentes de voz y comandos por voz: al ser ligero y ejecutable en dispositivos, puede integrarse en aplicaciones de escritorio o móviles para dictado, búsqueda por voz o control de interfaces.
- Transcripción en tiempo real para atención al cliente: el soporte de streaming y la baja latencia permiten transcribir conversaciones telefónicas o chats de voz en vivo, facilitando el análisis posterior o la generación de resúmenes.
- Accesibilidad: personas con discapacidad auditiva pueden usar el modelo para convertir audio en texto en aplicaciones de comunicación, con la ventaja de que los datos no salen del dispositivo.
- Pipelines de procesamiento de audio en producción: al ofrecer una CLI y un servidor HTTP, se puede integrar en flujos de trabajo automatizados (por ejemplo, transcripción de podcasts, archivos de audio legales o médicos) con Docker o scripts.

## Benchmarks y rendimiento

La model card del autor incluye resultados de WER (word error rate, menor es mejor) en ocho conjuntos de datos, comparados con varios modelos de referencia. Los valores marcados con † son cifras publicadas por otros autores; el resto fueron medidos por FermionResearch con normalizador de texto Whisper y decodificación greedy.

| Dataset | Phonon-1 (415 MB) | Phonon-1 Micro (285 MB) | Parakeet-0.6B 4-bit (637 MB) | Moonshine base (248 MB) | Whisper large-v3-turbo (1,619 MB) | Whisper small (967 MB) | wav2vec2-large (1,262 MB) | Qwen3-ASR teacher (1,569 MB) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| LibriSpeech test-clean | 2,640 | 3,002 | 2,186 | 3,417 | 2,10 | 3,4† | 2,8† | 2,235 |
| LibriSpeech test-other | 5,699 | 6,511 | 3,937 | 8,262 | 4,07 | 7,6† | 6,3† | 4,618 |
| TED-LIUM | 3,421 | 3,878 | 2,829 | 5,272 | — | — | — | 2,889 |
| SPGISpeech | 4,163 | 4,858 | 4,104 | 5,731 | 2,79† | — | 13,31† | 3,074 |
| VoxPopuli | 8,394 | 9,177 | 6,345 | 10,470 | 11,22† | — | — | 7,151 |
| GigaSpeech | 11,396 | 11,882 | 9,614 | 12,114 | 8,52† | — | — | 9,321 |
| Earnings-22 | 12,571 | 14,771 | 11,190 | 17,872 | 11,07† | — | 36,28† | 11,188 |
| AMI | 13,084 | 14,094 | 12,723 | 17,790 | 15,16† | — | — | 12,560 |
| Macro (ocho benchmarks) | 7,67 | 8,52 | 6,62 | 10,1 | — | — | — | 6,63 |

Phonon-1 supera a Moonshine base en todos los conjuntos y se acerca a Parakeet-0.6B 4-bit, aunque este último tiene un tamaño mayor (637 MB). Frente a Whisper large-v3-turbo, Phonon-1 es inferior en algunos conjuntos (LibriSpeech, SPGISpeech, GigaSpeech) pero superior en VoxPopuli y AMI, con una ventaja de tamaño de 1,2 GB menos.

## Requisitos de hardware

- Tamaño de descarga: 415 MB (0,4 GB), lo que permite almacenamiento en dispositivos con poco espacio.
- VRAM estimada: no disponible, pero al ser un modelo de 0,6B cuantizado a 2,4 bits, cabe en GPUs con 4 GB o menos; se puede ejecutar en CPU sin problemas.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB (por ejemplo, RTX 3050, RTX 4060) o GPU de datacenter como A100/H100 para mayor throughput. También funciona en Apple Silicon (M1/M2/M3/M4/M5) vía MLX.
- Compatible con consumer GPU: sí, incluyendo portátiles con GPU integrada o sin GPU (CPU).
- Opciones de despliegue: CLI `fermion` (pip install fermion-research), servidor HTTP (`fermion serve`), Docker, y runtimes para CUDA, Apple silicon y x86 disponibles en el repositorio de GitHub.
- Latencia y throughput: mediana de 23,9× realtime en un MacBook Air base con chip M5, es decir, transcribe una hora de audio en ~2,5 minutos.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | WER LibriSpeech test-clean | WER LibriSpeech test-other | Licencia |
|---|---|---|---|---|---|
| Phonon-1 | 415 MB | 2,4 bits (ternario) | 2,64 | 5,70 | Apache-2.0 |
| Parakeet-0.6B 4-bit | 637 MB | 4 bits | 2,19 | 3,94 | Apache-2.0 (según modelo base) |
| Moonshine base | 248 MB | No especificada | 3,42 | 8,26 | MIT (según modelo base) |
| Whisper large-v3-turbo | 1,619 MB | No especificada | 2,10 | 4,07 | MIT (según modelo base) |
| Qwen3-ASR teacher | 1,569 MB | No especificada | 2,24 | 4,62 | Apache-2.0 |

Phonon-1 ofrece el mejor equilibrio entre tamaño y rendimiento frente a Moonshine base, pero es superado por Parakeet-0.6B 4-bit y Whisper large-v3-turbo en precisión, a costa de un mayor tamaño. Su ventaja principal es la velocidad y la posibilidad de ejecutarse en hardware modesto.

## Limitaciones y advertencias

- Solo soporta inglés; no es multilingüe ni tiene capacidades de traducción.
- La arquitectura interna no está documentada en la información disponible, lo que dificulta la evaluación de posibles sesgos o comportamientos específicos.
- No se han publicado estudios de sesgos ni de alucinaciones en la transcripción; como todo modelo ASR, puede producir errores en audio con ruido, acentos no representados o terminología especializada.
- La longitud de contexto no está especificada; se desconoce si hay límites en la duración del audio procesable en una sola pasada.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base Qwen3-ASR-0.6B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Los benchmarks presentados son en su mayoría mediciones propias del autor, no verificadas de forma independiente; los valores con † provienen de publicaciones externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FermionResearch/Phonon-1
- Repositorio GitHub: https://github.com/fermionresearch/phonon
- Documentación de modelos de voz: https://www.fermionresearch.com/docs/speech-models/
- Sitio web de Fermion Research: https://www.fermionresearch.com/
- Paquete PyPI (fermion-research): https://pypi.org/project/fermion-research/
- Modelo base Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
