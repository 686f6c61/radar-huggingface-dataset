# lipik/multitalker-parakeet-streaming-0.6b-v1-gguf

## Resumen

multitalker-parakeet-streaming-0.6b-v1 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por NVIDIA, publicado originalmente como `nvidia/multitalker-parakeet-streaming-0.6b-v1`. Esta ficha cubre la conversión a formato GGUF realizada por el usuario `lipik` para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp), una implementación en C/C++ orientada a inferencia local eficiente.

El modelo combina un encoder FastConformer con atención *cache-aware* para streaming y un decodificador RNN-T (transducer), con un total de 739.989.513 parámetros (~0,74 B). Su rasgo diferencial es la capacidad de diarización integrada: las variantes *bundle* embeben el diarizador `nvidia/diar_streaming_sortformer_4spk-v2.1`, lo que permite transcribir hasta cuatro hablantes solapados y etiquetar cada segmento con su interlocutor en una sola pasada.

Es relevante porque ofrece streaming de baja latencia (máscara de atención con `att_context_size=[70, 13]`, equivalente a 1,12 s de contexto) con puntuación y capitalización, en un paquete de menos de 1 GB en cuantización Q8_0. El WER en LibriSpeech test-clean se mantiene en 2,18–2,20 % incluso en Q4_K_M, lo que lo hace viable para despliegue en CPU y GPU de consumo sin degradación apreciable frente a F32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T transducer (decoder), cache-aware streaming |
| Parametros totales | 739.989.513 (~0,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | `att_context_size=[70, 13]` (1,12 s de contexto cache-aware); cuatro ajustes de lookahead seleccionables |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (`en`); sin detección de idioma ni traducción |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* de `nvidia/nemotron-speech-streaming-en-0.6b`, según indica la model card. El encoder es un FastConformer con atención *cache-aware* que preserva la máscara de atención upstream con `att_context_size=[70, 13]`, lo que permite procesar audio en streaming manteniendo un contexto efectivo de aproximadamente 1,12 s y sin recalcular el pasado. El decodificador es un RNN-T (transducer) con decodificación greedy en la ruta `single_speaker_mode`.

La conversión a GGUF se realizó a partir del commit upstream `8749fc7` (fijado el 2026-07-12) y se validó contra la referencia NeMo en el commit `3083021` de transcribe.cpp el 2026-08-03. Las variantes *bundle* incorporan además el diarizador streaming Sortformer (`diar_streaming_sortformer_4spk-v2.1`), que se ejecuta en F32 en el bundle F32, en F16 en el bundle F16 y en Q8_0 en todas las variantes k-quant. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas (PnC).
- Streaming en tiempo real con atención cache-aware y cuatro niveles de lookahead seleccionables.
- Diarización integrada de hasta cuatro hablantes solapados mediante Sortformer (solo en variantes *bundle* con `--diarize`).
- Modo offline y modo streaming sobre el mismo conjunto de pesos.
- Marcas de tiempo a nivel de token (`timestamps: token`).
- Salida de transcripción con etiqueta de hablante en modo diarización.
- Sin soporte de traducción (`translate: false`) ni detección de idioma (`lang_detect: false`).
- Sin tool calling, function calling ni capacidades de agente: es un modelo puramente ASR.

## Casos de uso

- Subtitulado en directo de reuniones y webinars: el modo streaming con lookahead configurable permite emitir texto con latencia de ~1,12 s de contexto, adecuado para subtítulos casi en tiempo real.
- Actas de reuniones multipartícipe: las variantes *bundle* con `--diarize` generan una transcripción etiquetada por hablante (hasta cuatro), lo que elimina la necesidad de un paso posterior de diarización y simplifica la generación de resúmenes atribuidos.
- Atención al cliente y *call centers*: la transcripción con puntuación y capitalización y marcas de tiempo por token facilita la indexación y búsqueda de fragmentos concretos en grabaciones.
- Despliegue en *edge* y dispositivos sin GPU: con Q4_K_M (617 MB) y Q8_0 (873 MB) cabe en CPU y en GPUs integradas; los RTF medidos (32,72 en CPU de M4 Max, 13,41 en Ryzen 4750U) indican holgura para procesar audio en tiempo real.
- Transcripción por lotes de archivos de audio: el modo offline con decodificación greedy alcanza 2,18 % de WER en LibriSpeech test-clean, suficiente para corpus de investigación en inglés.
- Prototipado de pipelines ASR en C/C++: al ser GGUF y ejecutarse con transcribe.cpp, se integra en aplicaciones nativas sin dependencias de Python ni de CUDA.
- Anotación de corpus conversacionales: la combinación de diarización y marcas de tiempo por token permite generar datasets etiquetados de forma semiautomática.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LibriSpeech test-clean (offline, 2.620 enunciados) | WER F32 | 2,19 % |
| LibriSpeech test-clean | WER F16 | 2,19 % |
| LibriSpeech test-clean | WER Q8_0 | 2,18 % |
| LibriSpeech test-clean | WER Q6_K | 2,20 % |
| LibriSpeech test-clean | WER Q5_K_M | 2,18 % |
| LibriSpeech test-clean | WER Q4_K_M | 2,18 % |
| FLEURS en | WER Q8_0 | 6,52 % |
| AMI-IHM test (16 reuniones, bundle F32) | cpWER modo kernel | 19,35 % |
| AMI-IHM test (bundle F32) | cpWER modo masked | 23,73 % |

Referencia NeMo en el mismo split de LibriSpeech test-clean: 2,19 % (coincide con la cifra autodeclarada por NVIDIA). En AMI-IHM, la referencia NeMo obtiene 21,39 % (kernel) y 24,00 % (masked), frente a 19,35 % y 23,73 % de esta conversión.

Rendimiento medido (RTF, *real-time factor*):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 32,72 |
| Apple M4 Max | Metal | 217,47 |
| AMD Ryzen 4750U | CPU | 13,41 |
| AMD Ryzen 4750U | Vulkan | 26,34 |

## Requisitos de hardware

- VRAM/RAM estimada: 2,96 GB (F32), 1,48 GB (F16), 873 MB (Q8_0), 743 MB (Q6_K), 681 MB (Q5_K_M), 617 MB (Q4_K_M). Los tamaños incluyen los pesos del diarizador en las variantes *bundle*.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; los RTF medidos en M4 Max con Metal (217,47) y Ryzen 4750U con Vulkan (26,34) muestran aceleración clara frente a CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~1 GB de VRAM libre en Q8_0 o Q4_K_M; también en CPU sin aceleración.
- Opciones de despliegue: transcribe.cpp es el runtime de referencia (el modelo es GGUF específico de esta librería); no se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: con RTF de 13,41 en CPU de Ryzen 4750U y 32,72 en CPU de M4 Max, el modelo procesa audio entre 13 y 32 veces más rápido que tiempo real en CPU; con Metal/Vulkan la holgura es mayor. El lookahead de streaming es de 1,12 s de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| multitalker-parakeet-streaming-0.6b-v1 (esta ficha) | ~0,74 B | Cache-aware, 1,12 s, 4 lookaheads | 2,18–2,20 % | NVIDIA Open Model License | GGUF |
| nvidia/nemotron-speech-streaming-en-0.6b (modelo base) | ~0,6 B | Streaming | 2,19 % (referencia NeMo) | NVIDIA Open Model License | NeMo |
| nvidia/diar_streaming_sortformer_4spk-v2.1 (diarizador embebido) | no disponible | Streaming, 4 hablantes | no aplica (diarización) | NVIDIA Open Model License | NeMo |
| Whisper large-v3 | ~1,55 B | Offline, contexto de 30 s | no disponible en esta información | MIT | safetensors, GGUF (via terceros) |

La comparación con Whisper large-v3 se ofrece como referencia de categoría (ASR multilingüe ampliamente usado), pero no se dispone de cifras de WER comparables en la información proporcionada; no se inventan valores. La ventaja diferencial de este modelo frente a alternativas offline es el streaming cache-aware con diarización integrada en menos de 1 GB.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe, traducción ni detección de idioma (`lang_detect: false`, `translate: false`).
- La diarización está limitada a un máximo de cuatro hablantes solapados; escenarios con más interlocutores requerirán otro diarizador.
- El cpWER en AMI-IHM (19,35–23,73 %) indica un rendimiento notablemente peor en audio conversacional real con solapamientos que en lectura limpia (LibriSpeech, 2,18 %); conviene validar en el dominio objetivo antes de producción.
- Licencia NVIDIA Open Model License: revisar los términos antes de uso comercial; no es una licencia permisiva tipo MIT o Apache 2.0.
- El formato GGUF está ligado a transcribe.cpp; no se garantiza compatibilidad con otros runtimes GGUF (llama.cpp, Ollama) al tratarse de una arquitectura ASR específica.
- Riesgo de alucinación en pasajes con ruido, silencios largos o audio musical; el decodificador RNN-T greedy puede generar texto espurio en segmentos no vocales.
- Sesgos no documentados en la información disponible: no se detalla la composición del dataset de entrenamiento ni posibles sesgos de acento, género o edad.
- Las cifras de benchmarks sin commit de procedencia se publicaron antes de que se registrara la trazabilidad, según la propia model card; tómense como orientativas.

## Enlaces

- [Modelo GGUF en Hugging Face (lipik)](https://huggingface.co/lipik/multitalker-parakeet-streaming-0.6b-v1-gguf)
- [Modelo base en Hugging Face (nvidia/multitalker-parakeet-streaming-0.6b-v1)](https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1)
- [Commit upstream 8749fc7](https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1/commit/8749fc7)
- [Repositorio transcribe.cpp](https://github.com/handy-computer/transcribe.cpp)
- [Commit de validación 3083021 en transcribe.cpp](https://github.com/handy-computer/transcribe.cpp/tree/3083021)
- [Licencia NVIDIA Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/)
- Papers referenciados en los tags: [arXiv:2506.22646](https://arxiv.org/abs/2506.22646), [arXiv:2408.13106](https://arxiv.org/abs/2408.13106), [arXiv:2305.05084](https://arxiv.org/abs/2305.05084), [arXiv:2409.06656](https://arxiv.org/abs/2409.06656), [arXiv:2507.18446](https://arxiv.org/abs/2507.18446), [arXiv:1706.03762](https://arxiv.org/abs/1706.03762), [arXiv:2310.12371](https://arxiv.org/abs/2310.12371)
