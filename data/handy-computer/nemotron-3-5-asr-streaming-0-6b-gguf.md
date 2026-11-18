# handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Nemotron 3.5 ASR Streaming 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado originalmente por NVIDIA y convertido a formato GGUF por handy-computer para su uso con el runtime transcribe.cpp. Se trata de la versión cuantizada del modelo base nvidia/nemotron-3.5-asr-streaming-0.6b, con 637.991.968 parámetros reales, y está diseñado específicamente para transcripción de voz multilingüe en 32 configuraciones de idioma (el tokenizador reconoce 40, aunque 8 requieren ajuste fino). Su relevancia radica en que combina un tamaño compacto (0.6B) con capacidades de streaming en tiempo real, algo poco habitual en modelos ASR de calidad.

La arquitectura es un encoder FastConformer cache-aware con un decoder transducer RNN-T condicionado por prompt, lo que permite seleccionar el idioma destino en cada llamada mediante `--language` o dejar que el modo automático emita una etiqueta `<lang-XX>`. El modelo soporta tanto la ruta offline de alta precisión (att_context_size=[56, 13], 1,12 s) como streaming por chunks seleccionable en tiempo de ejecución (`--stream-chunk-ms 1120 --stream-att-right {0,3,6,13}`), lo que lo hace adecuado para aplicaciones de transcripción en vivo y por lotes.

El modelo se distribuye con licencia OpenMDW-1.1 y está empaquetado en múltiples cuantizaciones GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) con tamaños desde 496 MB hasta 2,55 GB, lo que permite desplegarlo desde dispositivos móviles y CPUs convencionales hasta GPUs de consumo. Con más de 1,6 millones de descargas, se ha consolidado como una opción práctica para transcripción multilingüe local sin dependencia de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T transducer decoder condicionado por prompt |
| Parámetros totales | 637.991.968 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención offline att_context_size=[56, 13], 1,12 s; streaming configurable por chunks de 1120 ms con att_right {0,3,6,13}) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 configuraciones de idioma-locale: en-US, en-GB, es-US, es-ES, fr-FR, fr-CA, it-IT, pt-BR, pt-PT, nl-NL, de-DE, tr-TR, ru-RU, ar-AR, hi-IN, ja-JP, ko-KR, vi-VN, uk-UA, pl-PL, sv-SE, cs-CZ, nb-NO, da-DK, bg-BG, fi-FI, hr-HR, sk-SK, zh-CN, hu-HU, ro-RO, et-EE |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer con mecanismo cache-aware, diseñado para permitir streaming incremental sin recalcular todo el contexto acústico. Sobre el encoder se sitúa un decoder transducer RNN-T condicionado por prompt, que recibe la selección de idioma como entrada y guía la decodificación hacia la lengua objetivo. Esta combinación permite dos modos de operación: offline con atención completa (att_context_size=[56, 13], equivalente a 1,12 s de contexto) y streaming por chunks de 1120 ms con distintos grados de lookahead (`att_right` de 0, 3, 6 o 13 frames).

La decodificación es greedy RNN-T con normalización tipo whisper-normalizer para el cálculo de métricas. El modelo soporta detección automática de idioma (emitiendo etiquetas `<lang-XX>`), timestamps a nivel de token y puntuación y capitalización en la salida. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo base de NVIDIA y no se reproducen en la model card de la conversión GGUF.

La conversión GGUF se realizó desde el commit upstream 24b151a del modelo de NVIDIA (fijado el 2026-06-08) y se validó numéricamente contra la referencia NeMo en el commit 909e94e de transcribe.cpp el 2026-06-08.

## Capacidades

- Transcripción de voz a texto multilingüe en 32 configuraciones de idioma-locale, con puntuación y capitalización automáticas.
- Streaming en tiempo real con chunks configurables de 1120 ms y lookahead ajustable (0, 3, 6 o 13 frames).
- Modo offline de alta precisión con contexto de atención completo (att_context_size=[56, 13]).
- Detección automática de idioma mediante etiquetas `<lang-XX>`.
- Timestamps a nivel de token.
- Selección explícita de idioma por llamada (`--language en-US`, `fr-FR`, `de-DE`, etc.).
- No soporta traducción (`translate: false` en la metadata del modelo).
- No dispone de capacidades de visión, audio generativo ni tool calling; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y videoconferencias en tiempo real: el modo streaming con chunks de 1120 ms permite generar subtítulos en vivo mientras se desarrolla la conversación, con detección automática de idioma cuando participan hablantes de distintas lenguas.
- Subtitulado automático de contenido audiovisual: la ruta offline con att_context_size=[56, 13] ofrece la máxima precisión (WER 7,90% en FLEURS en con Q8_0) para generar subtítulos post-producción con timestamps a nivel de token.
- Asistentes de voz para atención al cliente: el modelo puede transcribir consultas de usuarios en 32 configuraciones de idioma, permitiendo enrutar la conversación a agentes o sistemas downstream según el idioma detectado automáticamente.
- Actas y notas de reuniones multilingües: con soporte para es-ES, es-US, fr-FR, fr-CA, pt-BR, pt-PT y otras variantes regionales, es adecuado para organizaciones con equipos distribuidos geográficamente.
- Transcripción en dispositivos de borde: la cuantización Q4_K_M (496 MB) permite ejecutar el modelo en CPUs convencionales y dispositivos con recursos limitados; en un Ryzen 4750U se obtiene un RTF de 10,59 en CPU y 17,13 con Vulkan.
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp acepta WAV mono a 16 kHz y permite automatizar la transcripción de grandes volúmenes de grabaciones con scripts, usando la cuantización adecuada según el equilibrio precisión/velocidad requerido.
- Aplicaciones de accesibilidad: transcripción en vivo de conversaciones para personas con discapacidad auditiva, con la ventaja de ejecución local sin envío de audio a servicios externos.
- Análisis de llamadas y compliance: transcripción de grabaciones telefónicas en múltiples idiomas europeos (de-DE, fr-FR, it-IT, nl-NL, pl-PL, etc.) para auditoría y extracción de información.

## Benchmarks y rendimiento

Resultados de WER (Word Error Rate) en FLEURS test con cuantización Q8_0, salvo donde se indica:

| Idioma / test | Métrica | Q8_0 | Otras cuantizaciones |
|---|---|---|---|
| FLEURS en (offline) | WER | 7,90% | F32 7,97% / F16 7,97% / Q6_K 8,02% / Q5_K_M 8,15% / Q4_K_M 8,49% |
| FLEURS es | WER | 6,30% | no disponible |
| FLEURS it | WER | 5,78% | no disponible |
| FLEURS pt | WER | 8,52% | no disponible |
| FLEURS hi | WER | 8,61% | no disponible |
| FLEURS de | WER | 10,33% | no disponible |
| FLEURS fr | WER | 10,78% | no disponible |
| FLEURS ru | WER | 12,61% | no disponible |
| FLEURS nl | WER | 13,61% | no disponible |
| FLEURS vi | WER | 13,96% | no disponible |
| FLEURS uk | WER | 14,88% | no disponible |
| FLEURS tr | WER | 15,40% | no disponible |
| FLEURS ar | WER | 15,93% | no disponible |
| FLEURS pl | WER | 17,54% | no disponible |
| FLEURS nb | WER | 19,24% | no disponible |
| FLEURS fi | WER | 21,91% | no disponible |
| FLEURS bg | WER | 22,02% | no disponible |
| FLEURS cs | WER | 23,00% | no disponible |
| FLEURS sk | WER | 23,25% | no disponible |
| FLEURS sv | WER | 24,32% | no disponible |
| FLEURS hr | WER | 26,21% | no disponible |
| FLEURS ro | WER | 28,28% | no disponible |
| FLEURS da | WER | 28,51% | no disponible |
| FLEURS et | WER | 31,84% | no disponible |
| FLEURS hu | WER | 32,12% | no disponible |
| FLEURS ja | CER | 13,52% | no disponible |
| FLEURS ko | CER | 8,89% | no disponible |
| FLEURS zh | CER | 18,87% | no disponible |
| LibriSpeech test-clean | WER | 3,05% | F32 3,04% / F16 3,04% / Q6_K 3,08% / Q5_K_M 3,10% / Q4_K_M 3,30% |

Referencia NeMo sobre el mismo manifiesto: 7,99% en FLEURS en (NVIDIA reporta 7,91% en en-US) y 3,03% en LibriSpeech test-clean.

Rendimiento (Real-Time Factor, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 30,25 |
| Apple M4 Max | Metal | 141,10 |
| AMD Ryzen 4750U | CPU | 10,59 |
| AMD Ryzen 4750U | Vulkan | 17,13 |

## Requisitos de hardware

- VRAM estimada para inferencia: 496 MB (Q4_K_M), 560 MB (Q5_K_M), 621 MB (Q6_K), 751 MB (Q8_0), 1,28 GB (F16), 2,55 GB (F32). Cifras de tamaño de archivo; el consumo en memoria es del mismo orden.
- Cabe en cualquier GPU de consumo moderna e incluso en dispositivos integrados; no requiere GPU dedicada.
- Funciona en CPU: RTF de 10,59 en AMD Ryzen 4750U y 30,25 en Apple M4 Max, lo que permite transcripción más rápida que tiempo real en portátiles convencionales.
- Aceleración GPU: Metal en Apple Silicon (RTF 141,10 en M4 Max) y Vulkan en GPUs AMD (RTF 17,13 en Ryzen 4750U con iGPU).
- Opciones de despliegue: transcribe.cpp (runtime específico, compilado desde fuente con CMake). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia: en modo streaming, el chunk por defecto es de 1120 ms; el lookahead es configurable (0, 3, 6 o 13 frames), lo que permite ajustar latencia frente a precisión.
- Requisito de entrada: audio WAV mono a 16 kHz (convertible con ffmpeg desde otros formatos).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| nemotron-3.5-asr-streaming-0.6b (este) | 637.991.968 | 32 locales | Sí (cache-aware, chunks 1120 ms) | OpenMDW-1.1 | GGUF |
| Whisper large-v3 (referencia de la categoría) | no disponible en la información | ~99 idiomas | No nativo (requiere chunking manual) | MIT (según conocimiento general, no verificado en la información) | safetensors, GGUF vía terceros |
| Whisper small (referencia de tamaño similar) | no disponible en la información | ~99 idiomas | No nativo | MIT (según conocimiento general, no verificado) | safetensors, GGUF vía terceros |
| NVIDIA NeMo Parakeet (familia base) | no disponible en la información | no disponible | Depende de variante | no disponible | .nemo |

No se dispone en la información proporcionada de datos de benchmarks comparativos directos con Whisper u otros modelos ASR de la misma categoría. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- El modelo no realiza traducción (`translate: false`): transcribe en el idioma hablado, no traduce a otro idioma.
- El tokenizador reconoce 40 idiomas, pero solo 32 están soportados de forma nativa; los 8 restantes son "adaptation-ready" y requieren ajuste fino.
- Diferencias notables de precisión entre idiomas: el WER varía desde 5,78% en italiano hasta 32,12% en húngaro (Q8_0 en FLEURS). Los idiomas eslavos y ugrofineses presentan los peores resultados.
- Para ja, ko y zh se reporta CER en lugar de WER, lo que indica que la métrica de evaluación es distinta y no directamente comparable con los idiomas latinos.
- Licencia OpenMDW-1.1: es una licencia "other" que debe revisarse en el enlace oficial antes de uso comercial; no es una licencia permisiva estándar tipo MIT o Apache.
- El modelo está empaquetado exclusivamente para transcribe.cpp; no se garantiza compatibilidad con otros runtimes ASR.
- Riesgo de alucinación en segmentos de audio con ruido, silencios largos o habla solapada; no se documentan en la información proporcionada mecanismos específicos de mitigación.
- No se documentan en la información proporcionada sesgos demográficos, acentos o variedades dialectales más allá de las variantes regionales listadas (en-US/en-GB, es-US/es-ES, fr-FR/fr-CA, pt-BR/pt-PT).
- Requiere audio de entrada en WAV mono a 16 kHz; otros formatos necesitan conversión previa con ffmpeg.
- El repo ocupa 37,5 GB, aunque cada archivo GGUF individual es mucho menor; conviene descargar solo la cuantización necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base (NVIDIA): https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Commit upstream fijado: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper relacionado (arXiv:2312.17279): https://arxiv.org/abs/2312.17279
- Descarga F32: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-Q8_0.gguf
- Descarga Q6_K: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-Q6_K.gguf
- Descarga Q5_K_M: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-Q5_K_M.gguf
- Descarga Q4_K_M: https://huggingface.co/handy-computer/nemotron-3.5-asr-streaming-0.6b-gguf/resolve/main/nemotron-3.5-asr-streaming-0.6b-Q4_K_M.gguf
