# mrsoundmind/Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral-Mini-4B-Realtime-2602 es un modelo de reconocimiento automatico del habla (ASR) multilingue y nativamente en streaming desarrollado por Mistral AI. Esta ficha concreta describe la conversion a formato GGUF realizada por el usuario mrsoundmind para su uso con transcribe.cpp, una implementacion en C++ orientada a inferencia local. El modelo resuelve el problema de la transcripcion en tiempo real con baja latencia: con un retardo de 480 ms iguala la precision de los mejores sistemas ASR offline de codigo abierto y de las APIs comerciales en tiempo real.

La arquitectura combina un codificador de audio causal de aproximadamente 970 millones de parametros con un decodificador Ministral de unos 3.400 millones de parametros, sumando 4.429.707.024 parametros totales. El modelo emite un token de texto por cada ranura de audio de 80 ms (12,5 Hz), lo que permite transcripcion incremental con latencia configurable entre 240 ms y 2,4 segundos. Soporta 13 idiomas con deteccion automatica de lengua.

La relevancia de esta version GGUF radica en que permite ejecutar el modelo en hardware de consumo mediante cuantizaciones que van de BF16 (8,87 GB) a Q4_K_M (2,83 GB), manteniendo el WER practicamente identico en toda la escalera de cuantizacion (2,07-2,09 % en LibriSpeech test-clean). La licencia Apache-2.0 heredada del modelo base facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM en streaming: codificador de audio causal (~970M) + decodificador Ministral (~3,4B) con fusion aditiva de embeddings |
| Parametros totales | 4.429.707.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana deslizante en el codificador; no se especifica en tokens de texto) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko (13 idiomas, deteccion automatica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de audio-LLM especificamente disenada para streaming, distinta de la familia Voxtral 2507 offline. El frontend de audio es un codificador causal de aproximadamente 970 millones de parametros con un tallo convolucional causal con relleno por la izquierda y un transformer de 32 capas con RoPE de ventana deslizante. Un proyector de grupos de 4 frames transforma las representaciones de audio en embeddings que se suman (fusion aditiva) a las del decodificador de texto.

El decodificador es un Ministral de aproximadamente 3.400 millones de parametros con 26 capas, atencion GQA con 32 cabezas de consulta y 8 de clave/valor, y RoPE en variante NEOX. Incorpora condicionamiento de latencia mediante tokens de retardo, lo que permite ajustar el equilibrio entre latencia y precision en tiempo de inferencia. El modelo emite un token de texto por cada ranura de audio de 80 ms (12,5 Hz). No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en streaming incremental con latencia configurable (240 ms a 2,4 s) mediante `--stream-chunk-ms` y `--stream-voxtral-delay`.
- Transcripcion offline con transcripcion final identica byte a byte a la del modo streaming.
- Deteccion automatica de idioma entre 13 lenguas (en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko).
- Entrada de audio a 16 kHz mono WAV.
- Emision de un token de texto cada 80 ms de audio (12,5 Hz), lo que habilita subtitulado en vivo.
- No soporta traduccion (`translate: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No se documentan capacidades de tool calling, agentes ni vision en la informacion disponible.

## Casos de uso

- Subtitulado en vivo: el modelo emite texto a 12,5 Hz con retardos de 240 ms a 2,4 s, lo que permite generar subtitulos sincronizados en retransmisiones, videoconferencias o eventos presenciales con una desviacion temporal inferior al medio segundo.
- Asistentes de voz interactivos: con un retardo de 480 ms comparable a APIs comerciales en tiempo real, el modelo encaja en pipelines de reconocimiento de intenciones donde la latencia percibida por el usuario es critica.
- Transcripcion de reuniones en local: la version Q4_K_M (2,83 GB) se ejecuta en equipos de consumo sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad o cumplimiento normativo.
- Dictado y accesibilidad: integracion en herramientas de escritura por voz que necesitan retroalimentacion inmediata mientras el usuario habla, gracias al modo incremental con transcripcion final identica al modo offline.
- Procesamiento por lotes de archivos de audio: el modo offline con lote de 8 alcanza un WER de 2,08 % en LibriSpeech test-clean sobre una NVIDIA L40S, adecuado para pipelines de transcripcion masiva de podcasts o archivos historicos.
- Atencion al cliente telefonica: la deteccion automatica de idioma entre 13 lenguas permite enrutar y transcribir llamadas multilingues en tiempo real sin seleccion manual de idioma.
- Despliegue en dispositivos de borde: con RTF de 8,6 en Metal sobre un Apple M4 Max y 0,9 en Vulkan sobre un Ryzen 4750U, el modelo puede ejecutarse en portatiles y equipos sin GPU dedicada de altas prestaciones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER LibriSpeech test-clean (BF16) | 2,08 % |
| WER LibriSpeech test-clean (F16) | 2,09 % |
| WER LibriSpeech test-clean (Q8_0) | 2,07 % |
| WER LibriSpeech test-clean (Q6_K) | 2,08 % |
| WER LibriSpeech test-clean (Q5_K_M) | 2,08 % |
| WER LibriSpeech test-clean (Q4_K_M) | 2,08 % |
| Referencia Transformers BF16 greedy | 2,08 % |
| RTF en Apple M4 Max (Metal) | 8,6 |
| RTF en Apple M4 Max (CPU) | 2,5 |
| RTF en Ryzen 4750U (Vulkan) | 0,9 |
| RTF en Ryzen 4750U (CPU) | 0,6 |

El WER se midio sobre la particion completa de LibriSpeech test-clean (2620 enunciados) con el normalizador de texto ingles de Whisper, en modo offline y lote de 8 sobre una NVIDIA L40S. Todas las cuantizaciones se mantienen dentro del ruido bootstrap (2,07-2,09 %), por lo que la escalera de cuantizacion es neutra en WER hasta Q4_K_M. El WER publicado es solo para ingles; no se aportan resultados por idioma ni de otros benchmarks (MMLU, HumanEval, GSM8K no aplican a esta tarea ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,9 GB en BF16/F16, 4,7 GB en Q8_0, 3,7 GB en Q6_K, 3,3 GB en Q5_K_M y 2,8 GB en Q4_K_M (tamanos de archivo GGUF).
- GPU recomendadas: NVIDIA L40S para validacion y procesamiento por lotes; cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD/Intel) para inferencia local.
- Cabe en GPU de consumo: si, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs con 4-6 GB de VRAM; Q8_0 requiere al menos 6-8 GB.
- Opciones de despliegue: transcribe.cpp (unica libreria soportada por esta conversion GGUF); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: RTF de 8,6 en Metal sobre M4 Max y 0,9 en Vulkan sobre Ryzen 4750U; el modelo base declara mas de 12,5 tokens por segundo en hardware minimo, suficiente para tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Formato |
|---|---|---|---|---|---|
| Voxtral-Mini-4B-Realtime-2602 (esta ficha, GGUF) | 4,43B | 13 | Si, latencia 240 ms-2,4 s | Apache-2.0 | GGUF |
| Voxtral 2507 (familia offline de Mistral) | no disponible | no disponible | No (offline) | no disponible | no disponible |
| Whisper (referencia offline citada por el autor) | no disponible | no disponible | No | no disponible | no disponible |

La informacion proporcionada solo permite comparar con la familia Voxtral 2507, de la que se indica que es arquitectonicamente distinta (offline, sin frontend de streaming, sin encoder causal ni fusion aditiva). No se dispone de datos de parametros, contexto, rendimiento ni licencia de los modelos alternativos en la informacion disponible.

## Limitaciones y advertencias

- El WER publicado (2,08 %) corresponde unicamente al ingles; no hay datos de precision por idioma para las otras 12 lenguas soportadas.
- No soporta traduccion: solo transcribe en el idioma detectado.
- No genera marcas de tiempo, lo que limita su uso en aplicaciones que requieran alineacion temporal por palabra o segmento.
- Requiere audio de entrada a 16 kHz mono WAV; es necesario remuestrear y convertir canales previamente (por ejemplo, con ffmpeg).
- La unica libreria soportada por esta conversion es transcribe.cpp; no hay integracion documentada con ecosistemas como vLLM, llama.cpp u Ollama.
- Riesgo de alucinacion en audio con ruido, musica o habla solapada: no se documentan evaluaciones en condiciones acusticas adversas.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los terminos del modelo base upstream como fuente autoritativa.
- El modelo se publico en noviembre de 2026 y la conversion tiene 0 descargas y 0 likes, por lo que carece de validacion comunitaria amplia.
- La validacion se realizo contra la referencia de Transformers en un commit concreto (483c122) y un commit upstream fijado (2769294); cambios posteriores en transcribe.cpp pueden alterar el comportamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrsoundmind/Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit upstream fijado: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/commit/2769294
- Blog de Mistral: https://mistral.ai/news/voxtral-transcribe-2
- Demo: https://huggingface.co/spaces/mistralai/Voxtral-Mini-Realtime
- Informe tecnico: https://arxiv.org/abs/2602.11298
- Blog de vLLM sobre entrada en streaming: https://blog.vllm.ai/2 (enlace truncado en la informacion disponible)
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
