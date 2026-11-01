# lipik/parakeet-tdt_ctc-110m-gguf

## Resumen

`lipik/parakeet-tdt_ctc-110m-gguf` es una conversión al formato GGUF del modelo ASR `nvidia/parakeet-tdt_ctc-110m`, publicada por el usuario lipik para su uso con la librería `transcribe.cpp`. El modelo original es un sistema de reconocimiento automático del habla (ASR) en inglés desarrollado conjuntamente por los equipos de NVIDIA NeMo y Suno.ai, basado en una arquitectura FastConformer con decodificador transductor TDT/RNNT y una cabeza CTC auxiliar que se descarta durante la conversión.

El modelo resuelve la transcripción offline de audio en inglés con puntuación y mayúsculas, y su interés principal radica en su reducido tamaño (114.113.670 parámetros) combinado con una calidad competitiva: 2,43 % de WER en LibriSpeech test-clean con decodificación voraz y sin modelo de lenguaje externo. La versión GGUF permite ejecutar la inferencia en CPU y GPU de consumo mediante `transcribe.cpp`, sin dependencias de PyTorch ni de la suite NeMo.

Esta ficha describe la conversión GGUF; el modelo base es la referencia autoritativa para detalles de entrenamiento y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + decodificador transductor TDT/RNNT; cabeza CTC auxiliar descartada en la conversión |
| Parametros totales | 114.113.670 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; el modelo original transcribe hasta 20 minutos de audio en una sola pasada |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF |
| Libreria | transcribe.cpp |
| Tamano del repo | 0,1 GB |
| Frecuencia de muestreo de entrada | 16 kHz mono WAV |
| Streaming | no |
| Traduccion | no |
| Deteccion de idioma | no |
| Timestamps | a nivel de token |

## Arquitectura y entrenamiento

El modelo base es un FastConformer híbrido TDT-CTC de aproximadamente 114 M de parámetros. El encoder FastConformer emplea atención completa, lo que permite procesar hasta 20 minutos de audio en una única pasada. El decodificador es un transductor TDT (Token-and-Duration Transducer), una variante de RNNT que modela conjuntamente tokens y duraciones, lo que acelera la decodificación. El checkpoint original incluye además una cabeza CTC auxiliar empleada durante el entrenamiento; la conversión GGUF de lipik conserva únicamente el camino TDT/RNNT.

La conversión se realizó a partir del commit upstream `431a349` (fijado el 2026-05-10) y se validó numéricamente contra la referencia de NeMo en el commit `42528dd` de `transcribe.cpp` en la misma fecha. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. El modelo original reporta un RTFx medio de aproximadamente 5300 sobre los conjuntos de evaluación del leaderboard de Hugging Face en una A100.

## Capacidades

- Transcripción de voz a texto offline en inglés con puntuación y mayúsculas automáticas.
- Decodificación transductora TDT/RNNT con timestamps a nivel de token.
- Procesamiento de audio de hasta 20 minutos en una sola pasada (según el modelo base).
- Ejecución en CPU (con backend Vulkan) y en GPU Apple Silicon vía Metal.
- Cuantización agresiva con degradación mínima de calidad (Q4_K_M mantiene 2,53 % de WER frente a 2,43 % en F32).
- No soporta streaming, traducción ni detección de idioma.
- No dispone de tool calling, capacidades de agente ni procesamiento multimodal más allá del audio.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa hasta 20 minutos de audio en una pasada y genera texto con puntuación y mayúsculas, adecuado para actas automáticas en inglés.
- Subtitulado offline de vídeo: los timestamps a nivel de token permiten alinear el texto transcrito con la pista de audio para generar subtítulos sincronizados.
- Dictado en aplicaciones de escritorio: con cuantización Q4_K_M (90 MB) y ejecución en CPU, puede integrarse en herramientas locales sin GPU dedicada.
- Procesamiento por lotes de archivos de audio: el alto RTFx del modelo base (~5300 en A100) lo hace viable para pipelines de transcripción masiva en servidores.
- Transcripción en dispositivos de borde: el tamaño reducido (135 MB en Q8_0) y el soporte de Vulkan en CPU permiten desplegarlo en equipos con recursos limitados.
- Investigación en ASR: sirve como referencia ligera para comparar técnicas de cuantización GGUF frente a la implementación original en NeMo, con validación numérica documentada.
- Preprocesado de datos de voz para entrenamiento de otros modelos: la transcripción rápida y local facilita la generación de etiquetas en corpus de audio en inglés.

## Benchmarks y rendimiento

WER medido sobre la partición completa LibriSpeech test-clean (2620 enunciados) con decodificación voraz TDT/RNN-T y sin modelo de lenguaje externo. La referencia F32 es 2,43 %; NVIDIA reporta 2,40 % en la misma partición.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 457 MB | 2,43 % |
| F16 | 229 MB | 2,43 % |
| Q8_0 | 135 MB | 2,43 % |
| Q6_K | 112 MB | 2,44 % |
| Q5_K_M | 101 MB | 2,47 % |
| Q4_K_M | 90 MB | 2,53 % |

Rendimiento (RTF, factor de tiempo real) reportado por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 347,5 |
| Apple M4 Max | CPU | 116 |
| AMD Ryzen 4750U | Vulkan | 32,5 |
| AMD Ryzen 4750U | CPU | 23,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el archivo más grande (F32) ocupa 457 MB en disco y requiere un espacio similar en memoria durante la inferencia.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; en el modelo base se reporta un RTFx de ~5300 en A100, aunque la conversión GGUF está orientada a hardware de consumo.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria; también funciona en CPU sin GPU.
- Opciones de despliegue: `transcribe.cpp` (compilación desde fuente con CMake); no se mencionan otros runtimes en la información disponible.
- Latencia y throughput: RTF de 347,5 en Metal (M4 Max) y 32,5 en Vulkan (Ryzen 4750U), lo que implica procesar audio entre 32 y 347 veces más rápido que tiempo real según plataforma.
- Entrada: WAV mono a 16 kHz; para otros formatos es necesario convertir previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| parakeet-tdt_ctc-110m (GGUF, este) | 114 M | hasta 20 min | 2,43 % (F32) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt_ctc-110m (original) | 114 M | hasta 20 min | 2,40 % (reportado) | CC-BY-4.0 | NeMo |
| whisper-large-v3 | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| whisper-small | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos para una comparación cuantitativa fiable. La comparación con la familia Whisper requeriría consultar sus model cards respectivas.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas ni traducción.
- No es un modelo de streaming: requiere el audio completo (o fragmentos) antes de transcribir.
- Sin detección de idioma: si se le introduce audio en otro idioma, producirá una transcripción incorrecta sin aviso.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o vocabulario técnico; el WER de 2,43 % corresponde a LibriSpeech, un corpus de lectura limpia.
- La decodificación voraz sin modelo de lenguaje externo limita la corrección contextual frente a sistemas con LM.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y mantener el aviso de licencia.
- La cabeza CTC del checkpoint original se descarta en la conversión, por lo que no se puede usar decodificación CTC con estos pesos.
- Conversión validada contra un commit concreto de NeMo y `transcribe.cpp`; cambios futuros en la librería podrían afectar a la compatibilidad.
- El repo tiene muy pocas descargas (24) y ningún like, lo que sugiere poca validación comunitaria independiente.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/lipik/parakeet-tdt_ctc-110m-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Commit upstream del modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m/commit/431a349
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt_ctc-110m.md
- Repositorio NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Suno.ai: https://www.suno.ai/
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper RNNT (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
