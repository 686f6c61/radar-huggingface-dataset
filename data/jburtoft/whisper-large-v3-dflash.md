# jburtoft/whisper-large-v3-DFlash

## Resumen

whisper-large-v3-DFlash es un modelo borrador (draft model) de decodificación especulativa por difusión de bloques (DFlash) diseñado para acelerar la inferencia de openai/whisper-large-v3 en tareas de reconocimiento automático del habla. Lo desarrolla jburtoft y se publica bajo licencia Apache 2.0. No es un modelo de ASR autónomo: propone tokens candidatos que Whisper verifica en decodificación greedy, de modo que la calidad final la decide siempre el modelo objetivo.

El borrador tiene 132,7 millones de parámetros en BF16 (265 MB), 5 capas con hidden 1280, 20 cabezas de consulta de 64 dimensiones y 4 cabezas KV, con SwiGLU de 5120. Propone 15 tokens por paso (block size 16) en un único forward pass, frente a los K pasos secuenciales de un borrador autorregresivo. Incorpora una extensión encoder-decoder: atiende también a la salida del encoder de Whisper (1500 frames agrupados de 4 en 4, 375 posiciones) mediante `audio_fc` (5120 a 1280) y `audio_norm`, contexto que un servidor calcula una vez por petición.

Es relevante porque demuestra que la decodificación especulativa por difusión de bloques puede aplicarse a un modelo encoder-decoder de ASR y reducir la latencia en producción. En un despliegue vllm-neuron sobre Trainium2 con una sola petición, baja la latencia media de 249,9 ms sin borrador a 89,6 ms, con salidas idénticas al servidor sin borrador en los conjuntos evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 5 capas (estilo Qwen3) para difusión de bloques especulativa; borrador de whisper-large-v3 |
| Parametros totales | 132.727.680 (BF16, 265 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el contexto de audio son 1500 frames del encoder, agrupados en 375 posiciones) |
| Tipos de cuantizacion | no disponible (publicado en BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato público DFlashDraftModel, capas estilo Qwen3) |

## Arquitectura y entrenamiento

El borrador es un decoder de 5 capas con hidden 1280, 20 cabezas de consulta de 64 dimensiones, 4 cabezas KV y SwiGLU de 5120. Utiliza el embedding atado de Whisper del checkpoint objetivo (no incluye embedding de tokens ni LM head propios). Toma como características de entrada las salidas de las capas del decoder de Whisper [1, 8, 15, 22, 29] antes de la normalización final. El token de máscara es el id 50361 (`<|startoflm|>`), que está en `suppress_tokens` de Whisper, por lo que el modelo nunca lo genera.

La innovación principal es el contexto de audio encoder-decoder: como los estados ocultos del decoder de Whisper solo reflejan el audio ya decodificado, el borrador atiende además a la salida del encoder (1500 frames apilados de 4 en 4 en 375 posiciones), proyectada por `audio_fc` (5120 a 1280) y `audio_norm`. Estas claves y valores, sin RoPE, son visibles para todas las consultas de bloque y dependen solo del audio, por lo que se calculan una vez por petición. Sin este contexto el borrador alcanzaba un tau de retención de aproximadamente 1,5; con él, 2,7 tras el mismo pilotaje corto. Se entrenó en AWS Trainium2 usando únicamente datos de voz con licencia abierta: LibriSpeech, LibriTTS-R, MLS English, Common Voice 17, VoxPopuli, People's Speech y AMI. El código de entrenamiento está en github.com/jimburtoft/whisper-dflash.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa de whisper-large-v3: propone 15 tokens por paso en un único forward pass.
- Verificación greedy por parte del modelo objetivo: Whisper decide cada token final.
- Atención al contexto de audio del encoder de Whisper mediante proyección `audio_fc` y `audio_norm`.
- Especializado en inglés (language: en).
- No realiza transcripción autónoma: requiere el modelo objetivo openai/whisper-large-v3.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio de entrada propio.

## Casos de uso

- Transcripción de baja latencia en producción: desplegado con vllm-neuron sobre Trainium2 en layout de latencia (TP=4, LNC=2), reduce la latencia media de 249,9 ms a 89,6 ms por petición en el conjunto pub18-ls-e22, manteniendo la salida idéntica al servidor sin borrador.
- Servicio de subtitulado en tiempo real: con p50 de 71,5 ms y p90 de 139,7 ms en clips de hasta 30 s, es adecuado para flujos interactivos donde la latencia por segmento es crítica.
- Dictado y asistentes de voz: la aceleración de la decodificación permite respuestas más rápidas en conversaciones con turnos cortos, donde el coste del borrador se amortiza en cada paso de verificación.
- Transcripción por lotes con SLA estricto: en conjuntos como Earnings22-Cleaned-AA-chunked mantiene un WER de 8,65 % (frente a 8,52 % sin borrador) con 4,48 tokens por paso de verificación.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar difusión de bloques aplicada a modelos encoder-decoder de ASR, con código de entrenamiento y evaluación públicos.
- Evaluación comparativa de borradores: permite comparar DFlash (bloque de 16, un solo pase) frente a distil-large-v3 como borrador autorregresivo (K=10/K=15) en términos de tau y latencia final.

## Benchmarks y rendimiento

Aceptación (offline, 64 clips retenidos por conjunto, <= 30 s, decodificación greedy, regla de aceptación DFlash de vLLM). tau = tokens medios por paso de verificación (tokens aceptados más el token bonus del objetivo):

| Conjunto | DFlash tau (bloque 16) | distil-large-v3 K=10 / K=15 |
|---|--:|--:|
| LibriSpeech test-clean | 7,57 | 8,22 / 10,11 |
| LibriSpeech test-other | 7,52 | 8,05 / 9,92 |
| VoxPopuli en test | 7,77 | 8,45 / 10,65 |
| FLEURS en_us test | 6,39 | 7,68 / 9,21 |
| AMI ihm test | 5,60 | 6,61 / 7,37 |
| Common Voice 17 en test | 4,13 | 5,58 / 5,96 |
| all (7.676 anclas) | 6,77 | 7,67 / 9,25 |

Servicio extremo a extremo (vllm-neuron, Neuron SDK 2.33, Trainium2, conjunto pub18-ls-e22 de 18 clips):

| Configuración | Media | p50 | p90 | Tokens por paso |
|---|--:|--:|--:|--:|
| Sin borrador | 249,9 ms | 191,9 ms | 476,9 ms | 1 |
| distil-large-v3 K=10 (async) | 95,3 ms | 85,0 ms | 155,8 ms | 8,80 |
| Este DFlash, bloque 16 (async) | 89,6 ms | 71,5 ms | 139,7 ms | 7,09 |

WER (%, normalizador open_asr_leaderboard, conjuntos completos):

| Conjunto | Sin borrador | distil-large-v3 | Este borrador | Tokens por paso |
|---|--:|--:|--:|--:|
| Earnings22-Cleaned-AA-chunked (341) | 8,52 | 8,65 | 8,65 | 4,48 |
| LibriSpeech test-clean (2.620) | 1,47 | 1,47 | 1,47 | 9,09 |
| LibriSpeech test-other (2.939) | 3,12 | 3,12 | 3,13 | 7,66 |

## Requisitos de hardware

- VRAM estimada para inferencia: 265 MB en BF16 solo para el borrador; hay que sumar la del modelo objetivo whisper-large-v3.
- GPU recomendadas: el autor valida el despliegue en AWS Trainium2 (una instancia trn2.3xlarge, un dispositivo) con Neuron SDK 2.33 y vllm-neuron; no se documentan GPU NVIDIA en la información disponible.
- Cabe en GPU de consumo: no disponible (no se han publicado pruebas en GPU de consumo).
- Opciones de despliegue: vllm-neuron con la rama pública jimburtoft/vllm-neuron `whisper/0.29-public` (commit aa283ad), configuración `--speculative-config '{"method": "dflash", ...}'`; no se documentan llama.cpp, Ollama ni TGI para este borrador.
- Latencia y throughput: en layout de latencia (TP=4, LNC=2) la media es de 89,6 ms por petición; en layout de throughput (TP=1 x DP=8, LNC=1) el borrador funciona y da salida correcta, pero su throughput es inferior al servicio sin borrador porque a TP=1 el grafo del borrador tarda unos 30 ms por paso. Para throughput se recomienda distil-large-v3 con K=4 o ningún borrador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | tau (all) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3-DFlash (este) | 132,7 M | no disponible | 6,77 (bloque 16) | apache-2.0 | Hugging Face, 0 descargas |
| distil-whisper/distil-large-v3 como borrador K=10 | no disponible | no disponible | 7,67 | no disponible en la información | Hugging Face |
| distil-whisper/distil-large-v3 como borrador K=15 | no disponible | no disponible | 9,25 | no disponible en la información | Hugging Face |
| openai/whisper-large-v3 sin borrador | no disponible | no disponible | 1 (sin especulación) | no disponible en la información | Hugging Face |

distil-large-v3 acepta más tokens por paso de verificación, pero DFlash sirve más rápido porque redacta un bloque completo en un solo pase en lugar de K pases secuenciales.

## Limitaciones y advertencias

- No es un modelo de ASR autónomo: requiere openai/whisper-large-v3 como verificador y no incluye embedding de tokens ni LM head propios.
- Solo soporta inglés; no se documentan otros idiomas.
- En conjuntos grandes, una pequeña parte de las transcripciones difiere del servidor sin borrador por empates cercanos en bf16 durante la verificación multi-token: 23 de 341 en Earnings22, 18 de 2.620 en LibriSpeech test-clean y 39 de 2.939 en test-other.
- En layout de throughput (TP=1 x DP=8) el rendimiento es inferior al servicio sin borrador; está pensado para latencia de una sola petición.
- No se han publicado datos sobre sesgos, riesgo de alucinación específico del borrador ni comportamiento fuera del inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de la licencia y condiciones de whisper-large-v3 y de los datasets de entrenamiento citados.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta; la validación procede únicamente de la model card del autor.
- Los resultados de latencia se obtuvieron con una configuración concreta (Neuron SDK 2.33, commit aa283ad, una instancia trn2.3xlarge); no son extrapolables a otro hardware sin medición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jburtoft/whisper-large-v3-DFlash
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Código de entrenamiento: https://github.com/jimburtoft/whisper-dflash
- Rama vllm-neuron para Whisper: https://github.com/jimburtoft/vllm-neuron/tree/whisper/0.29-public
- Guía de despliegue NeuronStuff: https://github.com/jimburtoft/NeuronStuff/tree/main/whisper-vllm-neuron
- Borrador de referencia distil-large-v3: https://huggingface.co/distil-whisper/distil-large-v3
