# GhaythMahadin/SenseVoiceSmall-gguf

## Resumen

SenseVoiceSmall-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) SenseVoiceSmall, desarrollado originalmente por FunAudioLLM (Alibaba). Esta conversión la publica GhaythMahadin y está pensada para su uso con transcribe.cpp, un runtime de inferencia centrado en modelos de audio. El modelo resuelve transcripción multilingüe offline en chino mandarín, cantonés, inglés, japonés y coreano, e incorpora además identificación de idioma, etiquetas de emoción y detección de eventos de audio a través de una única cabeza CTC.

Arquitectónicamente es un encoder SAN-M de 234 millones de parámetros con una cabeza CTC sobre un vocabulario SentencePiece de 25.055 tokens. Consume WAV mono a 16 kHz con un límite de 30 segundos por llamada, según el contrato de inferencia directa del modelo original. No es un modelo de streaming ni de traducción, y no incluye troceado de audio largo integrado.

Su relevancia práctica está en el tamaño: las cuantizaciones van de 893 MB (F32) a 139 MB (Q4_K_M), lo que permite ejecutar ASR multilingüe en CPU y GPU de consumo con una degradación de WER mínima (de 3,13 % en F32 a 3,45 % en Q4_K_M sobre LibriSpeech test-clean). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia heredada es la FunASR MODEL_LICENSE del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SAN-M con cabeza CTC única |
| Parametros totales | 234.000.287 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; límite de 30 segundos de audio por llamada |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Chino (zh), cantonés (yue), inglés (en), japonés (ja), coreano (ko) |
| Licencia | other (FunASR MODEL_LICENSE, heredada del modelo base) |
| Formato de pesos | GGUF |
| Vocabulario | SentencePiece, 25.055 tokens |
| Entrada de audio | WAV mono a 16 kHz, máximo 30 s por llamada |
| Runtime | transcribe.cpp |
| Modelo base | FunAudioLLM/SenseVoiceSmall (commit 3eb3b4eeffc2f2dde6051b853983753db33e35c3, fijado 2026-05-06) |
| Tamaño del repo | 1,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAN-M (Self-Attention with Non-autoregressive Modeling) del SenseVoice original: un encoder no autorregresivo que procesa el audio y emite la transcripción mediante decodificación CTC codiciosa. La cabeza CTC es compartida y produce, además del texto, tokens especiales de identificación de idioma, etiquetas de emoción, etiquetas de eventos de audio y un flag de normalización inversa de texto (ITN), activables mediante `--raw-tokens` y `--itn` en transcribe.cpp. El vocabulario SentencePiece de 25.055 tokens cubre los cinco idiomas soportados.

Según la model card original, SenseVoice se entrenó con más de 400.000 horas de datos y soporta más de 50 idiomas en su entrenamiento, aunque esta conversión declara explícitamente solo cinco. No se detallan en la información disponible la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa. La conversión se validó numéricamente contra la referencia FunASR 1.3.1 en el commit f094d28 de transcribe.cpp: el port F32 iguala el WER de referencia con una desviación de +0,002 puntos porcentuales.

## Capacidades

- Transcripción de voz a texto offline en chino mandarín, cantonés, inglés, japonés y coreano.
- Identificación de idioma (LID) integrada en la misma cabeza CTC (`lang_detect: true`).
- Reconocimiento de emoción en el habla (SER) mediante etiquetas simples emitidas por la cabeza CTC.
- Detección de eventos de audio (AED) con etiquetas emitidas por la cabeza CTC.
- Normalización inversa de texto (ITN) opcional mediante el flag `--itn`.
- Emisión de tokens crudos con `--raw-tokens` para acceder a las etiquetas auxiliares.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No genera timestamps (`timestamps: none`).
- No incluye troceado de audio largo integrado; cada llamada se limita a 30 segundos.

## Casos de uso

- Transcripción de notas de voz y reuniones cortas: el modelo procesa clips de hasta 30 segundos en WAV mono a 16 kHz y devuelve la transcripción con decodificación CTC, adecuado para integrarse en aplicaciones de dictado donde el audio se trocea previamente.
- Subtitulado de contenido en cinco idiomas asiáticos y europeos: con soporte para zh, yue, en, ja y ko, puede transcribir vídeos segmentados por frase; la ausencia de timestamps obliga a alinear los segmentos externamente.
- Análisis de sentimiento en atención al cliente: las etiquetas de emoción emitidas por la cabeza CTC permiten clasificar llamadas grabadas sin un modelo adicional de SER.
- Moderación y clasificación de audio: la detección de eventos de audio permite etiquetar clips con eventos sonoros relevantes junto a la transcripción en una sola pasada.
- Procesamiento en dispositivos de borde: la cuantización Q4_K_M de 139 MB cabe en dispositivos con poca memoria y se ejecuta en CPU, lo que permite ASR local sin conexión en aplicaciones móviles o embebidas.
- Enrutado por idioma en pipelines multilingües: la identificación de idioma integrada permite dirigir cada audio al postprocesado adecuado sin un clasificador separado.
- Transcripción de audio en entornos sin GPU: con un RTF de 51,5 en CPU sobre un Apple M4 Max y 15,5 en un Ryzen 4750U, es viable para procesamiento por lotes en servidores sin acelerador.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2.620 enunciados), decodificación CTC codiciosa. La referencia es una ejecución propia con FunASR 1.3.1 sobre el mismo manifiesto: 3,13 % (IC 95 % [2,93 %, 3,34 %]).

| Cuantizacion | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 893 MB | 3,13 % |
| F16 | 449 MB | 3,13 % |
| Q8_0 | 241 MB | 3,13 % |
| Q6_K | 187 MB | 3,14 % |
| Q5_K_M | 164 MB | 3,18 % |
| Q4_K_M | 139 MB | 3,45 % |

Rendimiento (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 289,5 |
| Apple M4 Max | CPU | 51,5 |
| AMD Ryzen 4750U | Vulkan | 32,5 |
| AMD Ryzen 4750U | CPU | 15,5 |

LibriSpeech es un benchmark en inglés; el punto fuerte de SenseVoice es el mandarín, y la model card recomienda AISHELL-1 (CER) como comprobación complementaria. El publicador original no reporta un WER numérico de LibriSpeech (publica las puntuaciones solo como figuras PNG).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; F32 ocupa 893 MB, Q4_K_M 139 MB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo se ejecuta en CPU. Con aceleración, funciona en Apple Silicon vía Metal y en GPU AMD/Intel vía Vulkan.
- Cabe en GPU de consumo: sí, en cualquier modelo con más de 1 GB de memoria; también en CPU sin acelerador.
- Opciones de despliegue: transcribe.cpp (runtime de referencia, compilado con CMake); requiere audio WAV mono a 16 kHz, convertible con ffmpeg.
- Latencia y throughput: RTF de 289,5 en Metal (M4 Max), 51,5 en CPU (M4 Max), 32,5 en Vulkan (Ryzen 4750U) y 15,5 en CPU (Ryzen 4750U). Un RTF de 51,5 implica procesar aproximadamente 51,5 segundos de audio por segundo de cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| SenseVoiceSmall-gguf (esta ficha) | 234 M | zh, yue, en, ja, ko | 30 s por llamada | FunASR MODEL_LICENSE | GGUF |
| Whisper small | 244 M | ~99 idiomas | 30 s por ventana | MIT | safetensors, GGUF, etc. |
| Whisper base | 74 M | ~99 idiomas | 30 s por ventana | MIT | safetensors, GGUF, etc. |

La model card original afirma que el rendimiento de reconocimiento de SenseVoice supera al de Whisper, si bien no se aportan en la información disponible cifras comparativas numéricas entre ambos sobre un mismo benchmark. Whisper ofrece cobertura de idiomas mucho mayor y licencia MIT, mientras que SenseVoiceSmall añade emoción, eventos de audio e identificación de idioma en la misma cabeza CTC y declara mejor rendimiento en mandarín.

## Limitaciones y advertencias

- No es un modelo de streaming: debe procesar audio completo por llamada.
- Límite estricto de 30 segundos por llamada; sin troceado integrado, el audio largo debe segmentarse externamente.
- No genera timestamps, lo que dificulta el subtitulado alineado sin postprocesado.
- No soporta traducción; solo transcribe en el idioma hablado.
- Solo cinco idiomas declarados en esta conversión (zh, yue, en, ja, ko), aunque el entrenamiento original cubrió más de 50.
- La licencia es FunASR MODEL_LICENSE (categoría "other"); es necesario revisar los términos del modelo base antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación por terceros.
- Los enlaces de descarga de la model card apuntan al repositorio handy-computer/SenseVoiceSmall-gguf, no al repositorio de GhaythMahadin; conviene verificar la procedencia de los artefactos.
- Riesgo de alucinación inherente a los modelos CTC en audio con ruido o silencios; no se documentan sesgos específicos en la información disponible.
- LibriSpeech es un benchmark en inglés y no refleja el rendimiento en los idiomas asiáticos, que es el caso de uso principal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/SenseVoiceSmall-gguf
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Commit del modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall/commit/3eb3b4eeffc2f2dde6051b853983753db33e35c3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/sensevoice-small.md
- Repositorio original SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Página del proyecto: https://fun-audio-llm.github.io/
- Modelo en ModelScope: https://www.modelscope.cn/models/iic/SenseVoiceSmall
- Demo en ModelScope: https://www.modelscope.cn/studios/iic/SenseVoice
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/FunAudioLLM/SenseVoice
