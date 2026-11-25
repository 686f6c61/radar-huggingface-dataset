# GhaythMahadin/parakeet-rnnt-0.6b-gguf

## Resumen

parakeet-rnnt-0.6b-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) nvidia/parakeet-rnnt-0.6b, publicada por el usuario GhaythMahadin y pensada para su uso con el motor de inferencia transcribe.cpp. El modelo original lo desarrollaron conjuntamente los equipos de NVIDIA NeMo y Suno.ai, y es una variante XL de la arquitectura FastConformer Transducer con aproximadamente 616,7 millones de parámetros reales. Resuelve la transcripción de voz a texto en inglés, en minúsculas y sin puntuación, con decodificación RNN-T voraz.

La relevancia de esta conversión radica en que permite ejecutar un modelo ASR de calidad cercana al estado del arte en hardware modesto, sin depender del stack de PyTorch o NeMo. Con cuantizaciones que van desde F32 (2,47 GB) hasta Q4_K_M (476 MB), el modelo cabe en CPU y en GPUs de consumo, y mantiene un WER de 1,59-1,62 % en LibriSpeech test-clean en todas las cuantizaciones, lo que indica que la compresión no degrada la precisión de forma apreciable.

El modelo no es de streaming, no traduce y no realiza detección de idioma; su ámbito es la transcripción offline de audio en inglés. La licencia CC-BY-4.0 se hereda del modelo base y permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Large encoder + RNN-T transducer decoder |
| Parametros totales | 616.736.257 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer Transducer: un encoder FastConformer-Large de aproximadamente 600 millones de parámetros combinado con un decodificador RNN-T (transducer). La decodificación es voraz (greedy) y no emplea modelo de lenguaje externo. La conversión a GGUF está portada desde el commit upstream c0c1f09 de nvidia/parakeet-rnnt-0.6b, fijado el 2026-05-10, y validada contra la referencia de NeMo en el commit 42528dd de transcribe.cpp el mismo día.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card original de NVIDIA, que no se incluye completa en la información disponible. La innovación práctica de esta publicación es la conversión fiel a GGUF con validación numérica frente a NeMo y la verificación de que el WER se mantiene estable en todas las cuantizaciones.

## Capacidades

- Transcripción de voz a texto en inglés (ASR) con salida en minúsculas y sin puntuación.
- Decodificación RNN-T voraz sin modelo de lenguaje externo.
- Timestamps a nivel de token.
- Ejecución offline, sin dependencias de servicios en la nube.
- Inferencia en CPU (con backend CPU), en Metal (Apple) y en Vulkan (GPU AMD/Intel).
- No soporta streaming.
- No soporta traducción.
- No realiza detección de idioma.
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo procesa archivos WAV de 16 kHz mono de forma offline y produce texto plano en minúsculas, adecuado para pipelines de post-procesado que añadan puntuación y mayúsculas.
- Subtitulado y generación de actas: los timestamps a nivel de token permiten alinear segmentos de texto con el audio para generar subtítulos o actas con marcas temporales.
- Procesamiento de audio en el borde (edge): con la cuantización Q4_K_M (476 MB) el modelo cabe en dispositivos con recursos limitados y permite transcripción local sin enviar audio a la nube, lo que reduce riesgos de privacidad.
- Integración en aplicaciones de escritorio: el runtime transcribe.cpp con backend Metal alcanza un RTF de 185,5 en un Apple M4 Max, lo que permite transcripción casi instantánea en portátiles Apple.
- Dictado y accesibilidad: la baja latencia en CPU (RTF de 30 en M4 Max y de 8 en Ryzen 4750U con CPU) hace viable el dictado en tiempo casi real sobre hardware de consumo.
- Análisis de grabaciones de centros de llamadas: el modelo permite transcribir grandes volúmenes de audio en servidores sin GPU dedicada, usando la cuantización Q8_0 (730 MB) para mantener la precisión de referencia.
- Investigación en ASR: sirve como referencia reproducible en GGUF para comparar decodificación RNN-T y validar implementaciones de transcribe.cpp frente a NeMo.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,62 | 1,62 | 1,62 | 1,62 | 1,62 | 1,59 |
| Tamano (GB) | 2,47 | 1,24 | 0,73 | 0,601 | 0,540 | 0,476 |

| Metrica de velocidad | Backend | Valor (RTF) |
|---|---|---:|
| M4 Max | Metal | 185,5 |
| M4 Max | CPU | 30 |
| Ryzen 4750U | Vulkan | 14,5 |
| Ryzen 4750U | CPU | 8 |

El WER se midió sobre la partición completa LibriSpeech test-clean (2620 utterances) con decodificación RNN-T voraz y sin LM externo. La referencia F32 es 1,62 %; el dato autoinformado por NVIDIA en la misma partición es 1,63 %.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde unos 476 MB (Q4_K_M) hasta 2,47 GB (F32), según la cuantización.
- GPU recomendadas: no se especifican modelos concretos de NVIDIA en la información; el runtime documenta backends Metal (Apple) y Vulkan (AMD/Intel).
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M a Q8_0; también funciona en CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake; backends CPU, Metal y Vulkan.
- Latencia y throughput: RTF de 185,5 (Metal, M4 Max), 30 (CPU, M4 Max), 14,5 (Vulkan, Ryzen 4750U) y 8 (CPU, Ryzen 4750U). El audio debe convertirse previamente a WAV mono de 16 kHz con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| parakeet-rnnt-0.6b-gguf (esta ficha) | 616,7 M | en | GGUF | CC-BY-4.0 | WER 1,59-1,62 % en LibriSpeech test-clean; offline, sin streaming |
| nvidia/parakeet-rnnt-0.6b | ~600 M | en | NeMo (.nemo) | CC-BY-4.0 | Modelo base; requiere NeMo/PyTorch; WER autoinformado 1,63 % |
| Otras alternativas ASR | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Solo transcribe inglés; no soporta otros idiomas ni detección de idioma.
- Salida en minúsculas y sin puntuación; requiere post-procesado para texto legible.
- No es un modelo de streaming: procesa audio completo, no en tiempo real por fragmentos.
- No traduce.
- No dispone de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o vocabulario técnico; el WER de referencia corresponde a LibriSpeech, un corpus relativamente limpio.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar a NVIDIA y Suno.ai y respetar los términos del modelo base.
- El modelo se distribuye para transcribe.cpp; no es directamente compatible con llama.cpp, Ollama o vLLM.
- La información sobre sesgos del modelo base no está disponible en la documentación proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/GhaythMahadin/parakeet-rnnt-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-rnnt-0.6b
- Commit upstream: https://huggingface.co/nvidia/parakeet-rnnt-0.6b/commit/c0c1f09
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-rnnt-0.6b.md
- Paper FastConformer: https://arxiv.org/abs/2305.05084
- Documentación NeMo ASR: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- NVIDIA Developer Portal: https://developer.nvidia.com
