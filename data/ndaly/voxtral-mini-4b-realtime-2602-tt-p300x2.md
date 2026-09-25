# ndaly/Voxtral-Mini-4B-Realtime-2602-tt-p300x2

## Resumen

Voxtral-Mini-4B-Realtime-2602-tt-p300x2 es un paquete de despliegue publicado por el usuario ndaly sobre el modelo de reconocimiento automatico del habla (ASR) en tiempo real de Mistral AI, `mistralai/Voxtral-Mini-4B-Realtime-2602`. No se trata de un modelo nuevo ni de un fine-tuning: es un contenedor de inferencia que empaqueta los pesos originales y los sirve sobre hardware Tenstorrent Blackhole (concretamente dos tarjetas p300c, cuatro chips en anillo 1x4 con tensor parallel 4) mediante un autoport a TTNN y el plugin de vLLM de Tenstorrent. El resultado es un endpoint compatible con la API de audio transcriptions de OpenAI en `/v1/audio/transcriptions`.

El modelo subyacente combina un encoder de audio causal de aproximadamente 970 millones de parametros con un decoder de texto Ministral-3B de aproximadamente 3.400 millones de parametros, lo que da un total cercano a 4.400 millones. Emite un token de texto por cada 80 ms de audio (12,5 tokens por segundo de audio) y cubre 13 idiomas. Su propuesta de valor es alcanzar una precision comparable a los sistemas de transcripcion offline con una latencia inferior a 500 ms, lo que lo situa entre las primeras alternativas open source viables para voz en vivo.

La relevancia de este paquete concreto es de infraestructura: demuestra que un modelo de audio en streaming puede servirse en aceleradores no NVIDIA con un contrato de contexto de 131.072 tokens y hasta 32 secuencias concurrentes, con 37,5 ms de time-to-first-token y 606 tokens/s agregados en carga concurrente. El estado declarado es "experimental community bring-up" (11 etapas de autoport), con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio causal (~970M) + decoder de texto Ministral-3B (~3,4B), ambos con sliding window attention |
| Parametros totales | ~4,4B (970M encoder + 3,4B decoder) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Pesos base en BF16; en dispositivo bfp4 + LoFi en proyecciones internas y bfp8 en LM head y KV cache (6,8 GB por chip) |
| Idiomas soportados | 13 idiomas (no se detalla la lista en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un fichero de 8,9 GB) mas imagen Docker del contenedor de servicio |
| Tamano del repo | 1,4 GB |
| Pipeline declarado | automatic-speech-recognition |
| Modelo base | mistralai/Voxtral-Mini-4B-Realtime-2602 (revision 2769294da9567371363522aac9bbcfdd19447add) |
| Hardware objetivo | p300x2: 2 x p300c, 4 chips Blackhole, TP=4, 32 GB GDDR6 por chip |
| Empaquetado | tt-model-manager 0.1.0, manifest schema 5.1 |

## Arquitectura y entrenamiento

El componente revisado no aporta entrenamiento propio: reutiliza integramente el checkpoint de Mistral AI. La arquitectura del modelo base es un sistema de dos torres para ASR en streaming. La primera es un encoder de audio causal de aproximadamente 970 millones de parametros; la segunda es un decoder de lenguaje basado en Ministral-3 con unos 3.400 millones de parametros. Ambas torres emplean sliding window attention, decision de diseno orientada a mantener un consumo de memoria constante durante la inferencia en streaming, en lugar de crecer con la duracion del audio. La tasa de emision es de un token de texto cada 80 ms de audio, lo que fija la granularidad temporal de la transcripcion.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card del paquete se centra en el despliegue y no en el pipeline de entrenamiento. La innovacion tecnica relevante en este artefacto es de serving: el autoport a TTNN traduce el grafo del modelo a kernels de Tenstorrent, se captura una traza de decode y 32 trazas de prefill (una por slot) para eliminar overhead de lanzamiento, y se expone todo a traves del plugin de vLLM como endpoint compatible con OpenAI. La precision efectiva seleccionada (bfp4 con proyecciones internas LoFi, bfp8 en LM head y KV cache) mantiene una concordancia top-1 de tokens de 0,995 frente a la referencia BF16.

## Capacidades

- Transcripcion de voz a texto mono, en streaming y por lotes, desde formatos que `soundfile` puede decodificar (wav, flac, mp3 y otros), con remuestreo interno a 16 kHz.
- Salida en streaming mediante server-sent events, con deltas de texto a medida que se decodifican.
- API compatible con OpenAI: `POST /v1/audio/transcriptions` en formato multipart, ademas de `/v1/models`.
- Soporte multilingue en 13 idiomas.
- Atencion a una ventana de contexto de 131.072 tokens.
- Hasta 32 secuencias concurrentes por replica (TP=4 sobre 4 chips).
- Integracion con cualquier cliente OpenAI (`client.audio.transcriptions.create(...)`).
- No soporta chat, generacion de texto, traduccion, diarizacion de hablantes ni question answering sobre audio; el checkpoint es exclusivamente de transcripcion y el servidor no monta `/v1/chat/completions`.

## Casos de uso

- Subtitulado en vivo: el modelo puede generar texto con una latencia inferior a 500 ms y emitir deltas por SSE, lo que permite alimentar un pipeline de subtitulos sincronizados para retransmisiones, webinars o television en directo sin esperar al cierre del audio.
- Asistentes de voz interactivos: con 37,5 ms de time-to-first-token y ~50 tokens/s por usuario, la transcripcion se integra en un bucle de turno conversacional donde la latencia de ASR deja de ser el cuello de botella percibido por el usuario.
- Actas y notas de reunion: el contexto de 131.072 tokens permite transcribir sesiones largas sin truncar, y la API por lotes encaja con procesos que suben un fichero y recuperan el texto completo.
- Atencion al cliente telefónica: el endpoint compatible con OpenAI permite desplegarlo detras de la infraestructura existente y transcribir llamadas para su analisis posterior o para alimentar sistemas de resumen.
- Indexado y busqueda de archivos de audio: transcripcion masiva de un catalogo de grabaciones (podcasts, entrevistas, archivos historicos) para generar indices de texto consultables.
- Cumplimiento y auditoria: transcripcion de grabaciones reguladas conservando la salida en texto como evidencia, con la ventaja de que los pesos y el contenedor son Apache 2.0 y pueden alojarse on-premise sobre hardware Tenstorrent, sin enviar audio a terceros.
- Investigacion en ASR en streaming: el paquete permite experimentar con un modelo de referencia en un acelerador no NVIDIA y reproducir las metricas declaradas (WER, TTFT, throughput) en el mismo entorno documentado.
- Procesamiento por lotes de alta concurrencia: con 606 tokens/s agregados para 32 peticiones simultaneas, es viable como servicio interno de transcripcion para varios usuarios a la vez.

## Benchmarks y rendimiento

Los resultados disponibles son los declarados por el autor del paquete para la etapa 10 del bring-up (23 de septiembre de 2026). No se han publicado en la informacion disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo de transcripcion.

| Metrica | Resultado | Condiciones |
|---|---|---|
| WER en LibriSpeech test-other | 5,64 % | 2.939 utterances, greedy, ejecucion release de tt-inference-server via lmms-eval |
| Time-to-first-token servido (1 usuario) | 37,5 ms | Clip de 5,28 s, 78 tokens de completion, greedy, streaming |
| Latencia por paso de decode (1 usuario) | 20,14 ms (49,7 tokens/s) | Traza del generador: 19,55 ms por token |
| Latencia extremo a extremo (1 usuario) | 1,59 s | Clip de 5,28 s |
| Throughput agregado (32 concurrentes) | 606 tokens/s | 32/32 peticiones completadas |
| Latencia media extremo a extremo (32 concurrentes) | 3,63 s (mediana) | — |
| Concordancia top-1 de tokens | 0,995 | Frente a la referencia BF16 en la precision seleccionada |
| Fidelidad cualitativa | Transcripciones identicas a la referencia de Hugging Face en 8 de 10 clips | Los otros 2 difieren en palabras casi empatadas |

## Requisitos de hardware

- Hardware minimo: TT-QuietBox 2 o cualquier host con 2 x p300c, es decir, 4 chips Blackhole con 32 GB GDDR6 cada uno, Docker y hugepages de 1G configuradas.
- Memoria en dispositivo: la precision seleccionada ocupa 6,8 GB por chip.
- Pesos en disco: un fichero safetensors de 8,9 GB que se descarga en la cache de Hugging Face en el primer `serve`; no va incluido en la imagen Docker.
- Reparto de computo: una unica replica con tensor parallel 4 sobre exactamente cuatro chips. No hay data parallelism validado ni otras placas soportadas.
- No cabe en GPU de consumo: no se trata de un modelo que se pueda ejecutar en una RTX 4090 ni similar con este paquete, porque el backend es TTNN/Blackhole. Para GPU convencional habria que usar los pesos originales del modelo base con otro runtime.
- Opciones de despliegue: `tt serve` o `tt-model serve` (CLI de Tenstorrent, instalable con `uv tool install tenstorrent`), que levantan un servidor compatible con OpenAI en el puerto 20000 o el siguiente libre.
- Compilacion inicial: el primer arranque compila kernels y captura la traza de decode mas 32 trazas de prefill por slot, lo que tarda varios minutos; los arranques posteriores reutilizan la cache en `~/.cache/tt-model/voxtral-mini-4b-realtime-2602-p300x2/`.
- Latencia y throughput medidos: 37,5 ms de TTFT y ~50 tokens/s por usuario en regimen de un solo usuario; 606 tokens/s agregados con 32 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Voxtral-Mini-4B-Realtime-2602-tt-p300x2 (este paquete) | ~4,4B (970M encoder + 3,4B decoder) | 131.072 tokens | Apache 2.0 | Contenedor Tenstorrent, 4 chips Blackhole, TP=4 | 5,64 % WER en LibriSpeech test-other; 37,5 ms TTFT; 606 tok/s agregados a 32 concurrentes |
| mistralai/Voxtral-Mini-4B-Realtime-2602 (modelo base) | ~4,4B | No disponible en la informacion proporcionada | Apache 2.0 | Pesos BF16 en Hugging Face; runtime en GPU convencional | Mismo checkpoint; referencia de fidelidad usada en las pruebas del paquete |
| Alternativas open source de ASR en streaming (por ejemplo, familias Whisper o Canary) | No disponible | No disponible | No disponible | No disponible | No se dispone de especificaciones ni resultados en la informacion proporcionada; no se incluyen cifras para no introducir datos no verificados |

La comparativa significativa que si puede sostenerse con los datos disponibles es la del paquete frente al modelo base: mismo checkpoint y misma licencia, pero distinto backend de ejecucion, distinto consumo de memoria (6,8 GB por chip en bfp4/bfp8 frente a BF16 en GPU) y una latencia y un throughput medidos exclusivamente sobre Blackhole.

## Limitaciones y advertencias

- Solo transcripcion: el checkpoint no soporta chat ni generacion de texto. El servidor monta `/v1/audio/transcriptions` y `/v1/models`, pero no `/v1/chat/completions`; `tt-model curl`, que envia una chat completion, devuelve 404 contra este modelo.
- Fuera de alcance: traduccion, diarizacion de hablantes y question answering sobre audio no estan soportados.
- Estado experimental: el propio autor lo etiqueta como "experimental community bring-up" (autoport de 11 etapas, comprometido localmente). No es un artefacto de produccion consolidado.
- Escalabilidad limitada: una sola replica TP=4 sobre exactamente cuatro chips, sin data parallelism y sin otras placas validadas. No hay camino documentado para escalar horizontalmente dentro de este paquete.
- Concurrencia acotada: maximo de 32 secuencias concurrentes.
- Contexto contractual: 131.072 tokens es el contexto anunciado por el checkpoint; el `block_size` del generador esta fijado en 32.
- Dependencia de herramienta concreta: requiere el CLI de Tenstorrent y, en la configuracion documentada, `--tokenizer-mode mist...` (el texto de la model card queda truncado en ese punto), lo que implica leer la documentacion completa antes de desplegar.
- Idiomas: se declaran 13, pero la lista concreta no aparece en la informacion disponible; conviene verificar la cobertura real antes de comprometer un caso de uso multilingue.
- Riesgo de alucinacion: inherente a cualquier decoder de lenguaje sobre audio; el modelo base mitiga en parte con sliding window attention y con la tasa fija de un token por 80 ms, pero no se han publicado tasas de hallucination especificas en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo por acento, dialecto, edad o genero en la informacion proporcionada.
- Licencia: Apache 2.0 en el checkpoint y en el paquete, lo que en principio permite uso comercial, pero el estado experimental del bring-up y la ausencia de garantias del autor desaconsejan un despliegue en produccion sin validacion propia.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que sirvan de soporte.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/ndaly/Voxtral-Mini-4B-Realtime-2602-tt-p300x2
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Documentacion de referencia del paquete: `doc/optimized_vllm/README.md` y `doc/tti_release/RUN_NOTES.md` en el arbol de autoport de tt-metal (citados en la model card)
- Fichas y mirrors del modelo base encontrados en la busqueda web:
  - https://theapplied.co/models/mistralai-voxtral-mini-4b-realtime-2602
  - https://www.aimodels.fyi/models/huggingFace/voxtral-mini-4b-realtime-2602-mistralai
  - https://mixpeek.com/model/mistralai/Voxtral-Mini-4B-Realtime-2602
  - https://huggingface.co/xjyk/Voxtral-Mini-4B-Realtime-2602
  - https://huggingface.co/timoqll/Voxtral-Mini-4B-Realtime-2602
