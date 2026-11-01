# lipik/parakeet-tdt-0.6b-v2-gguf

## Resumen

`lipik/parakeet-tdt-0.6b-v2-gguf` es una conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v2`, publicada por el usuario `lipik` para su uso con el runtime `transcribe.cpp`. El modelo original lo desarrolla NVIDIA y está pensado para transcripción de voz en inglés con calidad alta, puntuación automática, capitalización y marcas de tiempo a nivel de token. Esta conversión no altera la arquitectura ni los pesos de forma sustancial: se limita a empaquetar los pesos en GGUF con varias cuantizaciones para permitir inferencia local eficiente en CPU y GPU de consumo.

La arquitectura es un encoder FastConformer de unos 617,9 millones de parámetros con un decoder transducer TDT/RNNT. Está entrenado con atención completa, lo que permite procesar segmentos de audio de hasta 24 minutos en una sola pasada, y no está diseñado para streaming. El modelo es monolingüe (inglés) y trabaja con audio de entrada de 16 kHz mono en formato WAV.

La relevancia de esta ficha concreta está en que ofrece el modelo de NVIDIA en un formato portable (GGUF) con cuantizaciones que van de 483 MB a 2,47 GB, con una degradación de WER muy contenida (1,68 % en F32 frente a 1,72 % en Q4_K_M sobre LibriSpeech test-clean). Eso lo hace utilizable en portátiles, mini-PC y sistemas embebidos sin depender del stack NeMo ni de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT/RNNT (decoder transducer) |
| Parametros totales | 617.869.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; admite segmentos de audio de hasta 24 minutos en una sola pasada |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer XL de NVIDIA con decoder TDT (Token-and-Duration Transducer), una variante del RNNT que predice conjuntamente tokens y duraciones. El encoder usa atención completa, lo que permite transcribir segmentos largos (hasta 24 minutos) sin chunking. El decoder transducer opera con decodificación greedy en las evaluaciones publicadas, sin LM externo. La conversión GGUF se realizó desde el commit `1b149a3` del modelo original (fijado el 2026-04-15) y se validó numéricamente contra la referencia NeMo en el commit `bf0d0b7` de `transcribe.cpp` el 2026-04-18.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el modelo upstream es un ASR supervisado, no un LLM, por lo que esas técnicas no aplican del mismo modo. Las innovaciones destacables son el uso de atención completa para audio largo, la predicción de duraciones del TDT y la salida con puntuación, capitalización y timestamps a nivel de token.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio de 16 kHz mono WAV.
- Puntuación automática y capitalización en la salida.
- Marcas de tiempo a nivel de token (timestamps token).
- Buen rendimiento en números hablados y transcripción de letras de canciones, según la model card upstream.
- Procesamiento offline por lotes; no es un modelo de streaming (`streaming: false`).
- Sin detección de idioma (`lang_detect: false`) y sin traducción (`translate: false`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No tiene capacidades de visión ni de audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático de vídeo en inglés: el modelo genera timestamps a nivel de token, lo que permite construir ficheros SRT/VTT con sincronización razonable sin post-proceso pesado. La puntuación automática reduce el trabajo de revisión.
- Transcripción de reuniones y entrevistas: con soporte para segmentos de hasta 24 minutos en una sola pasada, se pueden procesar grabaciones completas sin trocear, manteniendo coherencia en la puntuación.
- Actas y notas de voz en movilidad: la cuantización Q4_K_M (483 MB) permite ejecutar el modelo en portátiles y mini-PC sin GPU dedicada, con un WER de 1,72 % en LibriSpeech test-clean.
- Indexación y búsqueda de archivos de audio: transcripción por lotes en servidores CPU para generar texto buscable de podcasts, clases o archivos de atención al cliente.
- Preprocesado para pipelines de NLP: la salida con capitalización y puntuación se puede pasar directamente a modelos de resumen o extracción de entidades sin normalización adicional.
- Transcripción de letras de canciones y contenido musical hablado: la model card upstream destaca robustez específica en números hablados y letras de canciones.
- Despliegue en dispositivos con Vulkan/Metal: el runtime `transcribe.cpp` reporta aceleración por Vulkan en Ryzen 4750U y por Metal en Apple M4 Max, lo que habilita transcripción local en equipos de consumo.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 utterances), decodificación greedy sin LM externo:

| Cuantizacion | Tamano | WER (%) |
|---|---:|---:|
| F32 | 2,47 GB | 1,68 |
| F16 | 1,24 GB | 1,68 |
| Q8_0 | 730 MB | 1,69 |
| Q6_K | 608 MB | 1,70 |
| Q5_K_M | 547 MB | 1,70 |
| Q4_K_M | 483 MB | 1,72 |

El baseline F32 coincide con el 1,69 % reportado por NVIDIA en el mismo split dentro del error de redondeo. El modelo upstream reporta un RTFx de 3380 en el leaderboard HF-Open-ASR con batch size 128.

Factores de tiempo real (RTF) medidos en `transcribe.cpp`:

| Plataforma | Backend | RTF |
|---|---|---:|
| Ryzen 4750U | CPU | 8 |
| Ryzen 4750U | Vulkan | 15 |
| Apple M4 Max | CPU | 29 |
| Apple M4 Max | Metal | 175 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 483 MB (Q4_K_M) y 2,47 GB (F32) solo para pesos; hay que añadir el overhead del runtime y del audio en memoria.
- Cabe en cualquier GPU de consumo moderna con 2 GB o más de VRAM en cuantizaciones Q4_K_M a Q8_0; en F32 conviene disponer de 4 GB o más.
- GPUs recomendadas: RTX 3060/4060 en adelante para uso cómodo; A100/H100 no son necesarias para este tamaño, aunque pueden aumentar el throughput en lotes grandes.
- Funciona en CPU sin GPU: los RTF medidos (8 en Ryzen 4750U, 29 en M4 Max) indican procesamiento varias veces más rápido que tiempo real.
- Aceleración por Vulkan (RTF 15 en Ryzen 4750U) y Metal (RTF 175 en M4 Max) mediante `transcribe.cpp`.
- Despliegue: `transcribe.cpp` (build con CMake, binario `transcribe-cli`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible, ya que el modelo no es un LLM.
- Conversión de audio previa necesaria: `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---:|---|---|---|---|
| parakeet-tdt-0.6b-v2 (este, GGUF) | 0,618 B | en | hasta 24 min por pasada | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B (aprox.) | 25 idiomas europeos | no disponible | no disponible en la informacion | safetensors / NeMo |
| Whisper large-v3 | no disponible en la informacion | multilingue | 30 s por ventana | no disponible en la informacion | safetensors / GGUF |

La comparación con Whisper large-v3 se incluye por categoría (ASR de alta calidad), pero no se dispone de cifras de benchmarks comparativas en la información proporcionada. El punto diferencial de este modelo es el formato GGUF con cuantizaciones pequeñas y RTF alto en hardware de consumo, junto con timestamps a nivel de token y soporte de audio largo en una sola pasada.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no transcribe castellano ni otros idiomas; para multilingüe hay que acudir a `parakeet-tdt-0.6b-v3`.
- No es un modelo de streaming: requiere el audio completo (o segmentos) antes de transcribir.
- No realiza detección de idioma ni traducción.
- Riesgo de errores en audio con ruido, acentos no nativos, solapamiento de hablantes o vocabulario muy técnico; el WER de 1,68 % corresponde a LibriSpeech test-clean, un conjunto relativamente limpio.
- No hay diarización de hablantes ni alineación a nivel de palabra más allá de los timestamps de token.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario conservar la atribución a NVIDIA y al autor de la conversión.
- La conversión GGUF está validada contra NeMo en un commit concreto; cambios en `transcribe.cpp` pueden alterar la paridad numérica.
- El repositorio tiene muy pocas descargas (23) y ningún like en el momento de la consulta, lo que sugiere poca validación comunitaria independiente.
- No se dispone de información sobre sesgos específicos del modelo más allá de los inherentes a los datos de entrenamiento de NVIDIA, no detallados en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lipik/parakeet-tdt-0.6b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2/commit/1b149a3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v2.md
- Modelo multilingüe v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Demo upstream: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v2
- Documentación NeMo FastConformer: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.en
- Papers referenciados en los tags: arXiv:2305.05084, arXiv:2304.06795, arXiv:2406.00899, arXiv:2410.01036, arXiv:2505.13404
