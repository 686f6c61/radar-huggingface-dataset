# roman220220/NemotronLabs-VoiceChat-11B-gptq-mlx-mixed

## Resumen

Este repositorio contiene una compilacion MLX cuantizada de NVIDIA NemotronLabs VoiceChat 11B, publicada por el usuario roman220220 (equipo de LLMTray / ipsupport-llc). No es un modelo nuevo: es una conversion de pesos del modelo original de NVIDIA a formato MLX (safetensors) con cuantizacion GPTQ mixta, pensada para ejecutarse en Apple Silicon. El modelo realiza speech-to-speech full duplex end-to-end: escucha, transcribe, responde con texto y habla sobre una misma linea temporal continua de tramas de 80 ms, sin el encadenamiento clasico ASR → LLM → TTS.

La arquitectura interna combina piezas heterogeneas: el motor de lenguaje es Nemotron-Nano-9B-v2, un hibrido de Mamba-2 y atencion con 56 capas; la percepcion usa un encoder FastConformer en streaming; la sintesis emplea un backbone TTS Gemma3 con una cabeza de mezcla (MoG), un decodificador/joint RNNT y un codec NeMo. El total declarado en safetensors es de 11.095.371.252 parametros (~11B). La longitud de contexto no esta documentada en la informacion disponible.

Su relevancia practica esta en la eficiencia: el LLM se cuantiza a 3 bits GPTQ con grupo 64 sobre conversaciones duplex reales, mientras que percepcion y TTS se cuantizan a 8 bits RTN y el codec permanece en bf16. El resultado son 6,4 GB de pesos y un pico de memoria MLX de 8,0 GB en sesion, lo que permite ejecutar un modelo conversacional de voz de 11B en un MacBook con chip M5 base. El objetivo declarado del autor era que una trama de 80 ms se procesase en cerca de 80 ms, y las mediciones reportadas quedan en 83,3 ms (RTF 1,04), justo por debajo del tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM interno Nemotron-Nano-9B-v2 (hibrido Mamba-2 + atencion, 56 capas); encoder FastConformer para percepcion; backbone TTS Gemma3 con cabeza MoG; decodificador/joint RNNT; codec NeMo |
| Parametros totales | 11.095.371.252 (~11B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LLM (Mamba in_proj/out_proj, MLP up_proj/down_proj, atencion q/k/v/o_proj en las 56 capas) a 3-bit GPTQ g64; lm_head, function_head y embed_tokens a 4-bit g64; percepcion (lineales FastConformer) y TTS (lineales Gemma3 y cabeza MoG) a 8-bit RTN g64; codec, decodificador/joint RNNT, encoder de subpalabras TTS, normas y tensores pequenos en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA es un sistema full duplex que unifica comprension y generacion de habla en una sola arquitectura, eliminando los saltos entre modelos de un pipeline ASR → LLM → TTS. El nucleo de lenguaje es Nemotron-Nano-9B-v2, que mezcla bloques Mamba-2 con capas de atencion a lo largo de 56 capas. Alrededor de ese nucleo conviven un encoder FastConformer (percepcion en streaming), un backbone TTS derivado de Gemma3 con una cabeza de mezcla de gaussianas, un decodificador/joint RNNT y un codec neuronal NeMo. Todo opera sobre una linea temporal comun con tramas de 80 ms.

Esta ficha corresponde a la conversion y cuantizacion, no al entrenamiento. El autor describe el proceso de cuantizacion como GPTQ secuencial capa por capa ejecutado en MLX-CUDA, ajustado directamente sobre la rejilla affine de MLX, con escalas y sesgos en bf16. La calibracion se hizo con 256 conversaciones duplex reales: cada clip de voz se transmitio a traves de la propia sesion de streaming del modelo bf16 (prefill del system prompt, habla del usuario y silencio hasta que terminaba la respuesta), capturando la entrada fusionada por trama en cada paso. De este modo, GPTQ ve exactamente las mismas entradas que el modelo encuentra en inferencia: embeddings de habla, tokens del transcript del usuario y las respuestas del propio modelo.

No se dispone de informacion sobre el dataset de entrenamiento original (numero de tokens, composicion, uso de RLHF/DPO) en los materiales proporcionados. La innovacion tecnica destacable de este repositorio es la receta de cuantizacion mixta por componente (3/4/8/bf16 bits) y la inclusion de un `function_head` a 4 bits, indicio de soporte de function calling en el modelo subyacente.

## Capacidades

- Speech-to-speech full duplex: escucha y responde de forma simultanea sobre una linea temporal continua de 80 ms.
- Reconocimiento de habla en streaming (ASR) integrado en el propio modelo, sin modulo externo.
- Generacion de texto como parte del bucle conversacional.
- Sintesis de voz (TTS) con backbone Gemma3 y cabeza de mezcla MoG.
- Operacion en sesion duplex persistente, alimentada con PCM mono a 16 kHz segun llega.
- Modo offline: entrada WAV y salida de texto mas habla.
- Posible soporte de function calling: la receta cuantiza un `function_head` a 4 bits; su uso no esta documentado en detalle en la informacion disponible.
- Capacidad multilingue: limitada a ingles.
- No se documentan capacidades de vision, audio general ni generacion de musica.

## Casos de uso

- Asistentes de voz locales en Apple Silicon: el modelo se integra en la aplicacion LLMTray (Voice Lab) y permite conversacion por voz sin que ningun dato salga del Mac, algo viable gracias a los 8,0 GB de pico de memoria MLX.
- Atencion al cliente con voz en tiempo real: al ser full duplex, puede interrumpirse y responder sin turnos estrictos, lo que encaja en lineas de soporte donde la latencia y la naturalidad de la conversacion son criticas.
- Dictado y transcripcion interactiva: el componente ASR en streaming transcribe mientras se habla y el LLM puede reformatear, resumir o extraer datos de la transcripcion en la misma sesion.
- Agentes conversacionales con acciones: si el `function_head` opera como se espera, podria invocar herramientas durante la conversacion (por ejemplo, consultar un CRM o lanzar una busqueda) mientras mantiene el habla.
- Investigacion en modelos full duplex: la disponibilidad de una version cuantizada y un fork de mlx-audio con mejoras de compilacion permite medir latencia, RTF y WER de extremo a extremo en hardware de consumo.
- Prototipado de pipelines speech-to-speech en Python: la API `mlx_audio.sts.load` y las sesiones duplex (`create_duplex_session`, `push_audio`) permiten construir demos sin infraestructura de servidor.
- Accesibilidad por voz en equipos de escritorio: interaccion manos libres para usuarios con movilidad reducida, con transcripcion y respuesta hablada en un unico modelo local.
- Doblaje o respuesta hablada automatizada de baja latencia: sobre un transcript de entrada, generar audio de respuesta manteniendo el ritmo conversacional en ingles.

## Benchmarks y rendimiento

Las mediciones del autor se toman sobre un M5 base con 26 GB, sin ventilador, el 2026-09-28. El conjunto de prueba son 20 preguntas habladas con palabras clave que la respuesta debe contener; la respuesta hablada se transcribe con un Whisper independiente. Los tiempos son milisegundos por trama duplex de 80 ms, promediados sobre todas las tramas de todas las preguntas.

| Build | Perception | LLM | TTS | Codec | Total | RTF | User WER | Keyword accuracy | Reply WER |
|---|---|---|---|---|---|---|---|---|---|
| mlx-community/…-4bit, codigo upstream | 62,7 | 62,3 | 47,8 | 9,5 | 185,2 | 2,32 | 0,020 | 0,95 | 0,053 |
| …-gptq-mlx-3bit + fork | 16,9 | 40,4 | 24,2 | 6,4 | 89,4 | 1,12 | 0,020 | 1,00 | 0,043 |
| Este modelo + fork mlx-audio `llmtray` | 15,9 | 40,7 | 18,8 | 6,5 | 83,3 | 1,04 | 0,020 | 1,00 | 0,049 |

Segun el autor, la mejora de 185 a 83 ms proviene de dos fuentes: este checkpoint explica la columna del LLM (de 62,3 a 40,7 ms), y el fork de mlx-audio explica el resto (percepcion en bf16 con el conformer compilado para su estado estacionario, cabeza de mezcla TTS que calcula solo la mezcla muestreada, y generacion de codigo TTS y paso de codec compilados).

En un M5 base el modelo queda justo por debajo del tiempo real (RTF 1,04). El chasis es sin ventilador: minutos de carga plena provocan throttling de la GPU, y una ejecucion de 3 bits se midio en 84 ms en frio y 117 ms en caliente, de modo que las conversaciones largas van mas lentas que estas cifras. No se han medido M5 Pro ni M5 Max. No se dispone de resultados de benchmarks academicos (MMLU, GSM8K, HumanEval, etc.) en la informacion proporcionada.

## Requisitos de hardware

- Peso en disco: 6,4 GB de pesos cuantizados (tamano del repo en HuggingFace: 6,5 GB).
- Memoria pico en sesion: 8,0 GB con MLX (9,1 GB para el build de 3 bits con las partes de habla en bf16; 10,6 GB para el build de 4 bits).
- Hardware medido: MacBook con chip M5 base y 26 GB de RAM, sin ventilador. El autor no ha medido M5 Pro ni M5 Max.
- Cabe en GPU de consumo: no en el sentido habitual; el formato es MLX y esta pensado para Apple Silicon. No se documenta despliegue en GPUs NVIDIA o AMD.
- Libros de despliegue: aplicacion nativa macOS LLMTray (pestana Voice Lab); uso desde Python con el fork `mlx-audio[stt]` de ipsupport-llc. No se mencionan vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: 83,3 ms por trama de 80 ms (RTF 1,04) en M5 base; LLM 40,7 ms, TTS 18,8 ms, percepcion 15,9 ms y codec 6,5 ms. En regimen termico caliente, hasta 117 ms por trama.

## Comparativa con modelos similares

| Modelo | Parametros | Memoria pico MLX | Precisión del LLM / habla | RTF (M5 base) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (gptq-mlx-mixed) | ~11B | 8,0 GB | 3-bit GPTQ / 8-bit RTN | 1,04 | openmdw-1.1 | HuggingFace (roman220220) |
| NemotronLabs-VoiceChat-11B-gptq-mlx-3bit | ~11B | 9,1 GB | 3-bit GPTQ / bf16 | 1,12 | openmdw-1.1 | HuggingFace (roman220220) |
| mlx-community/…-4bit | ~11B | 10,6 GB | 4-bit / bf16 | 2,32 | openmdw-1.1 | HuggingFace (mlx-community) |
| nvidia/NVIDIA-NemotronLabs-VoiceChat-11B | ~11B | no disponible | bf16 | no disponible | openmdw-1.1 | HuggingFace (nvidia), NGC |

La comparativa se limita a variantes del mismo modelo base, dado que no se dispone de datos de otros sistemas full duplex comparables en la informacion proporcionada. Los datos de las tres primeras filas proceden de la tabla de mediciones del autor.

## Limitaciones y advertencias

- Idioma: solo ingles. No se documenta soporte multilingue.
- Contexto: la longitud de contexto no esta especificada en la informacion disponible, lo que impide planificar conversaciones de duracion acotada con garantias.
- Cuantizacion agresiva: el LLM a 3 bits puede degradar matices frente a bf16. El autor reporta una precision de palabras clave de 1,00 en 20 preguntas, pero el Reply WER es de 0,049 frente a 0,043 del build de 3 bits con habla en bf16, es decir, ligeramente peor en ese indicador.
- Alucinaciones y errores de transcripcion: no hay analisis especifico, pero al tratarse de un modelo generativo de voz y texto en un unico bucle, los errores del ASR interno pueden propagarse a la respuesta sin una etapa de verificacion externa.
- Rendimiento termico: en un M5 base sin ventilador, la carga sostenida degrada los tiempos (de 84 ms en frio a 117 ms en caliente), por lo que las conversaciones largas pueden dejar de ser casi en tiempo real.
- Portabilidad: los pesos estan en formato MLX y el codigo de inferencia recomendado es un fork especifico de mlx-audio; no hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni GPUs CUDA.
- Licencia: openmdw-1.1, etiquetada como "other". Conviene revisar los terminos del fichero LICENSE antes de cualquier uso comercial, ya que las condiciones de redistribucion y uso pueden diferir de las licencias permisivas habituales.
- Madurez del repositorio: la ficha registra 0 descargas y 0 likes, y fue creada y actualizada en la misma fecha. Es un artefacto reciente y poco validado por la comunidad, aunque el modelo base si procede de NVIDIA.
- Dependencia del modelo original: al ser una cuantizacion, hereda las limitaciones del modelo de NVIDIA (sesgos de los datos de entrenamiento y del habla en ingles), que no se detallan en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/roman220220/NemotronLabs-VoiceChat-11B-gptq-mlx-mixed
- Modelo base: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B
- Version previa de 3 bits: https://huggingface.co/roman220220/NemotronLabs-VoiceChat-11B-gptq-mlx-3bit
- Fork de mlx-audio con las optimizaciones: https://github.com/ipsupport-llc/mlx-audio/tree/llmtray
- Aplicacion LLMTray: https://www.ipsupport.us/llmtray/
- Releases de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- Repositorio de LLMTray en GitHub: https://github.com/ipsupport-llc/llmtray
- Ficha del modelo en NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-labs-voicechat/
- Contenedor en NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/containers/nemotron-labs-voicechat/
- Repositorio auxiliar en GitHub: https://github.com/Nikki1404/nemotron_voicechat_11B/tree/main
- Documento de vision general del modelo base: https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B/blob/main/overview.md
