# GhaythMahadin/parakeet-tdt_ctc-110m-gguf

## Resumen
`parakeet-tdt_ctc-110m-gguf` es una conversión a formato GGUF del modelo ASR `nvidia/parakeet-tdt_ctc-110m`, publicada por el usuario GhaythMahadin para su uso con el runtime `transcribe.cpp`. El modelo original lo desarrollaron conjuntamente los equipos de NVIDIA NeMo y Suno.ai, y resuelve transcripción de voz a texto en inglés con puntuación y mayúsculas incorporadas. La conversión elimina la cabeza CTC auxiliar del checkpoint híbrido original y conserva únicamente el decodificador transductor TDT/RNNT.

La arquitectura es un encoder FastConformer de 110M parámetros (114.113.670 reales según safetensors) con atención completa, lo que permite transcribir hasta 20 minutos de audio en una sola pasada. El modelo no es de streaming, no traduce y no detecta idioma; está pensado para transcripción offline de audio en inglés.

Su relevancia práctica radica en el tamaño reducido (desde 90 MB en Q4_K_M hasta 457 MB en F32) y en la penalización mínima de precisión al cuantizar: el WER en LibriSpeech test-clean pasa de 2,43 % en F32 a 2,53 % en Q4_K_M. Esto lo hace viable en CPU, GPUs de consumo y dispositivos Apple Silicon mediante Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + decodificador transductor TDT/RNNT; cabeza CTC descartada en la conversión |
| Parametros totales | 114.113.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; admite hasta 20 minutos de audio en una sola pasada |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime `transcribe.cpp`) |

## Arquitectura y entrenamiento
El modelo base es un híbrido FastConformer TDT-CTC de NVIDIA NeMo y Suno.ai. El encoder FastConformer emplea atención completa, lo que habilita la transcripción de audio largo (hasta 20 minutos) en una única pasada sin segmentación externa. El decodificador es un transductor TDT (Token-and-Duration Transducer) que predice tanto el token como su duración, lo que acelera la decodificación frente a RNN-T estándar. El checkpoint original incluye además una cabeza CTC auxiliar que se descarta durante la conversión a GGUF.

La conversión se realizó desde el commit upstream `431a349` (fijado el 2026-05-10) y se validó numéricamente contra la referencia NeMo en el commit `42528dd` de `transcribe.cpp` el 2026-05-10. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El modelo incorpora puntuación y mayúsculas de forma nativa (PnC), sin necesidad de un modelo de post-procesado separado.

## Capacidades
- Transcripción de voz a texto offline en inglés con puntuación y mayúsculas automáticas.
- Procesamiento de audio largo: hasta 20 minutos en una sola pasada gracias a la atención completa del encoder.
- Salida con marcas de tiempo a nivel de token (según el campo `timestamps: token` de la model card).
- Decodificación transductora TDT/RNNT con decodificación greedy y sin modelo de lenguaje externo.
- Ejecución eficiente en CPU, Vulkan y Metal (Apple Silicon).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No realiza detección de idioma (`lang_detect: false`).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).

## Casos de uso
- Transcripción de reuniones y entrevistas: el modelo acepta hasta 20 minutos de audio en una pasada, por lo que puede transcribir grabaciones completas sin segmentar manualmente, con puntuación y mayúsculas listas para revisión.
- Subtitulado y generación de actas: las marcas de tiempo a nivel de token permiten alinear el texto con el audio para producir subtítulos o actas con referencias temporales.
- Dictado y notas de voz en aplicaciones de escritorio: con Q4_K_M (90 MB) cabe en memoria de un portátil convencional y se ejecuta en CPU con un factor de tiempo real de 23,5 en un Ryzen 4750U (Vulkan 32,5), lo que permite transcripción más rápida que tiempo real sin GPU dedicada.
- Procesamiento por lotes en servidores sin GPU: la variante Q8_0 (135 MB) con WER idéntico al F32 (2,43 %) permite transcribir grandes volúmenes de audio en infraestructura solo-CPU manteniendo la precisión de referencia.
- Integración en dispositivos Apple Silicon: con Metal alcanza un factor de tiempo real de 347,5 en un M4 Max, adecuado para aplicaciones de transcripción local en macOS con latencia muy baja.
- Preprocesado de pipelines de datos de voz: al ser un modelo pequeño y rápido, sirve para generar transcripciones preliminares de corpus en inglés antes de etapas de anotación o filtrado.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real de audio pregrabado para personas con discapacidad auditiva, ejecutable localmente sin enviar audio a la nube.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 utterances), decodificación greedy TDT/RNN-T sin LM externo:

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| F32 | 457 MB | 2,43 |
| F16 | 229 MB | 2,43 |
| Q8_0 | 135 MB | 2,43 |
| Q6_K | 112 MB | 2,44 |
| Q5_K_M | 101 MB | 2,47 |
| Q4_K_M | 90 MB | 2,53 |

Referencia: NVIDIA reporta 2,40 % en la misma partición. El modelo original alcanza un RTFx medio de ~5300 en los conjuntos de evaluación del leaderboard de Hugging Face sobre A100.

Rendimiento en `transcribe.cpp` (factor de tiempo real, RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 347,5 |
| Apple M4 Max | CPU | 116 |
| AMD Ryzen 4750U | Vulkan | 32,5 |
| AMD Ryzen 4750U | CPU | 23,5 |

## Requisitos de hardware
- VRAM/RAM estimada: entre 90 MB (Q4_K_M) y 457 MB (F32) para los pesos; el consumo total del proceso es superior pero sigue siendo muy reducido.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; en el material disponible no se documentan requisitos para CUDA ni modelos concretos como A100, H100 o RTX 4090.
- Cabe en cualquier GPU de consumo y en CPU convencionales; el modelo base reporta RTFx ~5300 en A100 con NeMo.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: RTF de 347,5 (Metal, M4 Max), 116 (CPU, M4 Max), 32,5 (Vulkan, Ryzen 4750U) y 23,5 (CPU, Ryzen 4750U); en todos los casos muy por encima de tiempo real.
- El audio de entrada debe ser WAV mono a 16 kHz; para otros formatos hay que convertir previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto de audio | Licencia | Formato |
|---|---|---:|---|---|---|
| parakeet-tdt_ctc-110m (este, GGUF) | 114M | en | hasta 20 min | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt_ctc-110m (original) | 114M | en | hasta 20 min | CC-BY-4.0 | NeMo/.nemo |
| Whisper large-v3 | no disponible en la informacion | multilingue | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Whisper small | no disponible en la informacion | multilingue | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos para una comparación cuantitativa fiable; los valores de Whisper se indican como no disponibles para no inventar cifras.

## Limitaciones y advertencias
- Solo inglés: no admite otros idiomas ni detección de idioma.
- No es streaming: requiere el audio completo (o segmentos) antes de transcribir; no sirve para reconocimiento en vivo continuo.
- No traduce: la salida es siempre texto en inglés.
- Riesgo de alucinación y errores en audio con ruido, acentos no nativos o solapamiento de hablantes; el WER de referencia (2,43 %) corresponde a LibriSpeech test-clean, un conjunto limpio de lectura.
- La conversión descarta la cabeza CTC del checkpoint original; no se puede usar decodificación CTC con estos pesos.
- Entrada restringida a WAV mono 16 kHz; requiere preprocesado con ffmpeg para otros formatos.
- Licencia CC-BY-4.0: permite uso comercial con atribución; hay que citar a NVIDIA y Suno.ai y respetar los términos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni validación comunitaria amplia más allá de la validación numérica declarada contra NeMo.
- El autor de la conversión no es NVIDIA; para producción conviene verificar la reproducibilidad de la conversión y considerar el checkpoint original si se necesita la cabeza CTC.

## Enlaces
- Hugging Face (conversión GGUF): https://huggingface.co/GhaythMahadin/parakeet-tdt_ctc-110m-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Commit upstream del modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m/commit/431a349
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt_ctc-110m.md
- Pesos GGUF (espejo handy-computer): https://huggingface.co/handy-computer/parakeet-tdt_ctc-110m-gguf
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación FastConformer de NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Suno.ai: https://www.suno.ai/
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arXiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper relacionado (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
