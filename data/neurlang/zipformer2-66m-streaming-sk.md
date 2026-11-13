# neurlang/zipformer2-66m-streaming-sk

## Resumen

zipformer2-66m-streaming-sk es un modelo de reconocimiento automatico del habla (ASR) en eslovaco, desarrollado por el usuario neurlang. Se trata de un transductor Zipformer2 de 66 millones de parametros, afinado a partir del Zipformer en streaming de icefall entrenado en ingles y adaptado a eslovaco sobre mas de 3300 horas de audio. Su rasgo diferencial es que opera en modo streaming: decodifica en fragmentos de 1,28 segundos conforme llega el audio, lo que lo hace apto para transcripcion en tiempo real.

El modelo resuelve el problema de ASR en eslovaco, un idioma con relativamente pocos recursos publicos de calidad, y lo hace con un tamano muy contenido (66 M de parametros, repo de 0,3 GB) y pesos cuantizados en int8 en formato ONNX para su uso con sherpa-onnx. Segun la model card, alcanza un WER de en torno al 6,166 % en el benchmark SLAIH, por delante de alternativas comerciales como Microsoft MAI-Transcribe-2, Google Chirp 3 y ElevenLabs Scribe v2 en ese mismo conjunto.

La relevancia actual reside en que demuestra que un modelo pequeno, abierto y desplegable en local puede competir con servicios propietarios en un idioma de recursos medios, manteniendo latencia baja gracias a la arquitectura en streaming. Esta publicado bajo licencia CC-BY-4.0 y se distribuye principalmente como artefactos ONNX para inferencia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder Zipformer2 + decoder + joiner) |
| Parametros totales | 66 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks de 1,28 s) |
| Tipos de cuantizacion | int8 (artefactos ONNX int8; pesos originales en model.pt) |
| Idiomas soportados | eslovaco (sk) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) y model.pt para icefall |

## Arquitectura y entrenamiento

El modelo es un transductor Zipformer2, la arquitectura de encoder convolucional/transformer con atencion multi-escala de la familia Zipformer de k2-fsa/icefall. El sistema completo consta de encoder, decoder y joiner, con decodificacion en streaming por fragmentos de 1,28 segundos. Parte del checkpoint en ingles `Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17` y se afino sobre mas de 3300 horas de audio eslovaco.

El entrenamiento sigue una estrategia de extension del tokenizer en lugar de reemplazo: se anadio un modelo SentencePiece eslovaco de 1024 piezas (entrenado sobre unas 2800 horas de transcripciones de SloPal) tras las 500 piezas inglesas, alcanzando 1493 tokens en total. Las nuevas filas de embedding y salida se inicializaron con la media de las antiguas mas un 1 % de ruido, y se aplico un LR 10 veces mayor al decoder y al joiner. Se uso ScaledAdam con `base_lr 0.0045` y Eden con `lr_batches 7500` / `lr_epochs 2` (los valores por defecto de `finetune.py` mantenian el LR plano y estancaban el modelo en torno al 20 % de WER). El proceso termino con EMA de pesos y un descenso de 1,0 en el sesgo de blank del joiner, integrado en los pesos, para reducir palabras omitidas. Los datos de entrenamiento incluyen SloPalSpeech, trepal, Common Voice 27.0 eslovaco, FLEURS, TEDxSK/JumpSK, General Read Speech (Lili) y audiolibros de Greenie.

## Capacidades

- Reconocimiento automatico del habla en eslovaco en modo streaming, con decodificacion por chunks de 1,28 s.
- Transcripcion de audio a 16 kHz mono.
- Inferencia en local mediante sherpa-onnx con modelos ONNX int8.
- Posibilidad de reentrenamiento o ajuste fino con icefall (carga de `model.pt["model"]` en Zipformer2 `AsrModel`).
- Salida de texto sin puntuacion ni mayusculas garantizadas (la evaluacion se hace con normalizacion que ignora errores de puntuacion y capitalizacion).

## Casos de uso

- Subtitulado en tiempo real de retransmisiones y reuniones en eslovaco: el modo streaming con chunks de 1,28 s permite generar subtitulos con latencia baja mientras se reproduce el audio.
- Transcripcion de reuniones y notas de voz: un modelo de 66 M en int8 cabe en CPU y puede ejecutarse en servidores modestos o portatiles para pasar audio a texto de forma local.
- Atencion al cliente y centros de contacto: transcripcion de llamadas en eslovaco para analitica, busqueda y control de calidad, con despliegue on-premise que evita enviar audio a terceros.
- Indexacion y busqueda de archivos de audio y video: transcripcion por lotes de podcasts, clases y archivos multimedia para hacerlos buscables.
- Accesibilidad: generacion de subtitulos para contenido audiovisual eslovaco en plataformas educativas o institucionales.
- Investigacion en ASR de bajos recursos: el modelo y sus notas de ajuste fino sirven como punto de partida para adaptar Zipformer a otros idiomas con tokenizer extendido.
- Asistentes de voz y comandos por voz en eslovaco: integracion en aplicaciones que requieran reconocimiento local sin depender de la nube.

## Benchmarks y rendimiento

WER (%, menor es mejor) con la normalizacion del leaderboard SLAIH (sin errores de puntuacion ni de mayusculas), segun la model card:

| Modelo | SLAIH | commonvoice | fleurs | lili | tedxsk | trepal |
|---|---|---|---|---|---|---|
| zipformer2-66m-streaming-sk (este modelo) | ~6,166 % + Telco + Noise impact | 5,8 % | 12,6 % | 11,8 % | 11,8 % | 4,5 % |
| Microsoft MAI-Transcribe-2 | 6,54 % | - | - | - | - | - |
| Google Chirp 3 | 8,14 % | - | - | - | - | - |
| ElevenLabs Scribe v2 | 9,15 % | - | - | - | - | - |

Los resultados por conjunto (commonvoice, fleurs, lili, tedxsk, trepal) son WER ponderado por horas en los dev sets propios del autor, con audio limpio, sin impacto de mayusculas ni puntuacion; el dominio telefonico no se ha evaluado aun.

## Requisitos de hardware

- VRAM estimada: con 66 M de parametros en int8, el modelo ocupa del orden de decenas de MB; puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no se especifican; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente, y el modelo esta pensado para inferencia en CPU.
- Cabe en GPU consumer: si, con amplio margen; tambien en dispositivos de bajos recursos.
- Opciones de despliegue: sherpa-onnx (recomendado por el autor, con modelos ONNX int8), y entrenamiento/ajuste fino con icefall (k2). No se documentan otras opciones como vLLM o llama.cpp, que no aplican a este tipo de modelo.
- Latencia y throughput: decodificacion en chunks de 1,28 s; no se publican cifras de RTF ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modo | WER SLAIH | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zipformer2-66m-streaming-sk | 66 M | streaming, chunks 1,28 s | ~6,166 % | CC-BY-4.0 | Hugging Face (ONNX, model.pt) |
| Microsoft MAI-Transcribe-2 | no disponible | no disponible | 6,54 % | propietaria | servicio comercial |
| Google Chirp 3 | no disponible | no disponible | 8,14 % | propietaria | servicio comercial |
| ElevenLabs Scribe v2 | no disponible | no disponible | 9,15 % | propietaria | servicio comercial |

No se dispone de datos publicos de parametros, contexto ni licencia de los modelos comerciales comparados; solo se conocen sus resultados en el benchmark SLAIH segun la model card.

## Limitaciones y advertencias

- El ingles es debil: el modelo tiende a deletrear letra por letra el texto en ingles.
- Los numeros aparecen de forma inconsistente, unas veces como palabras y otras como digitos.
- No se garantiza puntuacion ni mayusculas en la salida.
- El dominio telefonico no se ha evaluado aun, pese a la mencion "Telco" en la tabla de resultados.
- Los resultados de benchmarks proceden del propio autor y de sus dev sets; conviene validarlos en el dominio de destino.
- Riesgo de alucinacion y errores en audio con ruido, acentos o vocabulario especializado; no se documentan sesgos especificos.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; el modelo base de icefall es Apache-2.0, por lo que conviene revisar las condiciones de los datasets de entrenamiento si se redistribuye.
- Modelo de un solo idioma (eslovaco); no es multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neurlang/zipformer2-66m-streaming-sk
- Modelo base: https://huggingface.co/Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17
- icefall (k2-fsa): https://github.com/k2-fsa/icefall
- Leaderboard SLAIH (speech-to-text): https://slaih.sk/sk/benchmarks/speech-to-text
- Dataset SloPalSpeech: https://huggingface.co/datasets/NaiveNeuron/SloPalSpeech
- Dataset trepal: https://huggingface.co/datasets/streams-sro/trepal
- Common Voice Scripted Speech 27.0 - Slovak: https://mozilladatacollective.com/datasets/cmu62gcol00ohnq0758656ndx
- FLEURS: https://huggingface.co/datasets/google/fleurs
- TEDxSK and JumpSK Lectures: https://nlp.kemt.fei.tuke.sk/speech/tedx
- General Read Speech (Lili) 1.0: https://mozilladatacollective.com/datasets/cmiup5wqw01hlmf074qy07b80
- Greenie Audiobooks: https://greenie.elist.sk/audioknihy.html
- Perfil de thewh1teagle: https://github.com/thewh1teagle/
