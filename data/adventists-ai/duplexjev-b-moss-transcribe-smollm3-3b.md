# adventists-ai/DuplexJev-B-MOSS-Transcribe-SmolLM3-3B

## Resumen

DuplexJev-B-MOSS-Transcribe-SmolLM3-3B es un conector de audio multimodal desarrollado por Adventists.ai que enlaza un codificador de audio congelado (el encoder Whisper de MOSS-Transcribe-Diarize, 24 capas, 307 M de parámetros) con un LLM tambien congelado (SmolLM3-3B). El unico componente entrenado es un proyector SwiGLU de 37,8 M de parametros que transforma las ultimas capas del encoder en tokens de audio que el LLM puede leer. El modelo no genera texto libre: recibe una pregunta tipada (por ejemplo, "¿Ha terminado de hablar el usuario?") con una lista cerrada de opciones y devuelve una distribucion de probabilidad de un solo token sobre esas opciones, sin pasos de decodificacion.

La relevancia de esta variante esta en su planteamiento de "speech-to-decision" para agentes de voz full-duplex: en lugar de transcribir y luego razonar, se hacen muchas preguntas tipadas en un unico forward pass, lo que reduce drasticamente la latencia frente a pipelines de ASR mas LLM. La variante B esta entrenada unicamente para alineacion de contenido (destilacion de transcripcion R1-R2) y no incluye entrenamiento paralinguistico, por lo que las tareas de genero y emocion quedan practicamente al azar. Se presenta como punto de partida para fine-tuning propio orientado a decisiones concretas.

El sistema completo suma unos 3420 M de parametros (encoder + LLM + conector), el conector pesa 37,8 M y el repositorio ocupa 0,1 GB. Soporta chino e ingles, se distribuye bajo licencia Apache-2.0 y esta pensado para despliegue en el borde (edge) y en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio tipo Whisper (24 capas, 307 M, congelado) + conector SwiGLU (37,8 M, entrenable) + LLM SmolLM3-3B (congelado) |
| Parametros totales | 3420 M (encoder + LLM + conector); el repositorio safetensors contiene 37.758.976 parametros (solo el conector) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del LLM base SmolLM3-3B; la model card no especifica el valor). La senal de audio se muestrea a 6,25 tokens de audio por segundo, por lo que un clip de 4,5 s ocupa unos 28 tokens |
| Tipos de cuantizacion | No documentados. Los pesos se han usado en fp32 (CPU) y bf16 (H200); no se publican cuantizaciones GGUF, int8 o int4 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (pesos del conector). Modelos congelados: SmolLM3-3B (Apache-2.0) y encoder (Apache-2.0). Algunos corpus de entrenamiento (WenetSpeech, CoVoST 2) tienen licencia solo para uso no comercial |
| Formato de pesos | safetensors (libreria `transformers` con `custom_code`) |

## Arquitectura y entrenamiento

El sistema es un ensamblaje de tres piezas congeladas o parcialmente entrenadas. El encoder de audio procede de MOSS-Transcribe-Diarize (arquitectura Whisper, 24 capas, 307 M) y se ha reempaquetado como encoder Whisper estandar en el repositorio `adventists-ai/MOSS-Transcribe-Diarize-Whisper-Encoder`. Su salida de la ultima capa se procesa con apilado de fotogramas (8 fotogramas del encoder a 50 Hz se agrupan en uno) y un proyector SwiGLU, dando una tasa de 6,25 tokens de audio por segundo. Esos tokens alimentan a SmolLM3-3B, que permanece congelado. El unico bloque entrenado es el conector de 37,8 M de parametros. La innovacion clave es el readout de un solo token: una pregunta tipada con opciones cerradas se resuelve como una distribucion sobre esos tokens en un unico forward pass, sin decodificacion autoregresiva, lo que permite evaluar muchas preguntas a la vez.

El entrenamiento sigue la misma receta que los conectores Qwen3-32B publicados con el paper: destilacion de transcripcion en dos fases (R1 y R2) sobre dos paquetes disjuntos de 0,5 M de enunciados cada uno, extraidos de la mezcla Ultravox v0.6, con 32 000 pasos por fase y batch global de 16. No hay RLHF ni DPO en esta variante. El conector se entreno con el formato "no-think" de SmolLM3 (bloque `<think></think>` vacio antes de la respuesta) y el tokenizer del repositorio incorpora esa plantilla de chat, que difiere de la plantilla por defecto de SmolLM3. Esta variante B no incluye entrenamiento paralinguistico, de modo que las salidas de genero y emocion son practicamente aleatorias.

## Capacidades

- Decisiones tipadas sobre audio: responde preguntas con opciones cerradas (por ejemplo, estado de turno, intencion del usuario) leyendo la respuesta como una distribucion de un solo token.
- Clasificacion de estado de turno (turn-taking) en conversaciones full-duplex, con variantes de hasta 4 estados.
- Deteccion de intencion en dominios cerrados (ejemplos de la model card: clima, medios, navegacion, telefono, charla informal).
- Respuesta a preguntas habladas (spoken QA) tipo test, con rendimiento limitado por el tamano del LLM subyacente.
- Procesamiento de audio en chino e ingles, con la pregunta y las opciones en el mismo idioma que el clip.
- Multiples preguntas por forward pass: se pueden lanzar varias `Question` sobre el mismo audio en una sola pasada.
- No soporta generation libre de texto ni tool calling / function calling; no es un modelo de agentes con razonamiento multi-paso.
- No incluye modo "thinking" activo, vision, audio de salida ni capacidades paralinguisticas fiables en esta variante.

## Casos de uso

- Deteccion de fin de turno en agentes de voz: se pregunta "¿Ha terminado de hablar el usuario?" con opciones ["finished", "not finished"] para decidir cuando el agente debe tomar la palabra, gracias a la latencia de ~156 ms en H200 para 10 preguntas sobre un clip de 4,5 s.
- Enrutamiento de intencion en asistentes de dispositivos: el modelo clasifica si el usuario quiere clima, medios, navegacion, telefono o charla, lo que permite dirigir la peticion al backend adecuado sin transcribir toda la frase.
- Clasificacion de turnos en sistemas full-duplex: al evaluar el estado de turno con varias preguntas simultaneas, se puede alimentar un gestor de dialogos que decida interrumpir, esperar o responder.
- Procesamiento en el borde: el conector pesa 37,8 M y el sistema completo ~3,4 B, por lo que se puede desplegar sin decodificacion autoregresiva en hardware modesto para tareas de decision acotadas.
- Filtrado previo de audio en pipelines de ASR: usar las decisiones para descartar segmentos irrelevantes antes de enviarlos a un sistema de transcripcion completo, reduciendo coste.
- Base para fine-tuning propio orientado a decisiones: al estar entrenado solo con alineacion de contenido, es un punto de partida para anadir supervision especifica de dominio (por ejemplo, clasificacion de comandos de un producto concreto).
- Investigacion en reconocimiento de habla y paralinguistica: permite reproducir la receta de destilacion de transcripcion y medir la brecha entre decisiones directas y lectura de transcripcion.

## Benchmarks y rendimiento

| Evaluacion (%) | Protocolo del paper | Valores por defecto de `duplexjev` 0.2.2 |
|---|---:|---:|
| qa100 (spoken QA) | 47 | 53 |
| qa100, SmolLM3-3B leyendo la transcripcion | 77 | – |
| ZJU-ML (spoken QA, real + TTS) | 47 | – |
| Easy-Turn (estado de turno de 4 opciones, 800 clips) | 36,4 | – |
| Genero, 800 enunciados reales | 53,5 | 58 |
| Emocion, 4 opciones, 800 enunciados | 29 | 30,6 |

Puntuaciones de clasificacion: idioma principal (media de qa100, ZJU-ML y Easy-Turn) **43,5**; paralinguistica (media de genero y emocion) **41,2**. Conviene interpretar las cifras de genero (53,5/58 frente a un azar del 50%) y emocion (29/30,6 frente a un azar del 25%) como cercanas al azar, coherente con la ausencia de entrenamiento paralinguistico en esta variante B. La fila de "SmolLM3-3B leyendo la transcripcion" (77%) muestra que el techo de las preguntas de conocimiento depende del LLM subyacente.

Latencia de un evento de decision (10 preguntas, un clip de 4,5 s, `duplexjev` 0.2.2, PyTorch puro): 5,8 s en 8 hilos de CPU (Xeon Platinum 8558, fp32, sin cuantizar) y unos 156 ms en una H200 (bf16, medido con la GPU compartida con un trabajo de entrenamiento).

## Requisitos de hardware

- VRAM estimada para el sistema completo (~3,42 B de parametros): ~6,8 GB en bf16 y ~13,7 GB en fp32.
- Solo el conector (37,8 M de parametros): ~0,15 GB en fp32 y ~0,075 GB en bf16, aunque el encoder y el LLM congelados deben cargarse igualmente.
- GPU recomendadas: H200 o A100/H100 para minimizar latencia (156 ms por 10 preguntas en H200); funciona en GPUs de consumo sin problema.
- Cabe en GPU de consumo: si, por ejemplo RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) e incluso tarjetas de 12 GB en bf16, dado el tamano del sistema.
- CPU: viable pero lento; 5,8 s por evento de decision con 8 hilos de Xeon y fp32, sin cuantizar.
- Opciones de despliegue: libreria `transformers` con `custom_code` y el paquete `duplexjev[speech]>=0.2.2` (`Decider.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la arquitectura personalizada (encoder + conector + LLM congelado) dificulta su uso en esos servidores.
- Throughput: no disponible mas alla de la latencia medida (un evento de 10 preguntas por pasada).

## Comparativa con modelos similares

| Modelo | LLM base | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuplexJev-B-MOSS-Transcribe-SmolLM3-3B | SmolLM3-3B | 3420 M (conector 37,8 M) | No disponible | Apache-2.0 (conector) | HuggingFace, 0 descargas al publicar |
| DuplexJev-B-MOSS-Transcribe-Qwen3-4B-2507 | Qwen3-4B-2507 | No disponible | No disponible | No disponible | HuggingFace |
| DuplexJev-B-Para-MOSS-Transcribe-Falcon-H1-1.5B | Falcon-H1-1.5B | No disponible | No disponible | No disponible | HuggingFace |
| Gemini 3.5 Transcribe (propietario, Google) | Gemini | No disponible | No disponible | Propietaria | API de Google AI |

Los tres modelos DuplexJev comparten el diseno de conector B sobre el encoder MOSS-Transcribe y se diferencian en el LLM congelado y en el sufijo "Para" (variante con entrenamiento paralinguistico). Gemini 3.5 Transcribe es un modelo de transcripcion propietario y no resuelve decisiones tipadas, por lo que la comparacion es solo contextual. No se dispone de datos de parametros, contexto ni licencia de las otras variantes DuplexJev en la informacion consultada.

## Limitaciones y advertencias

- Evaluado sobre habla leida o actuada y conjuntos de prueba pequenos (100-800 elementos); no se ha evaluado con entrada en streaming.
- Esta variante B no incluye entrenamiento paralinguistico: genero y emocion quedan practicamente al azar (53,5% y 29% respectivamente), por lo que no debe usarse para inferir atributos de personas.
- Las etiquetas de emocion provienen de corpus actuados; los autores advierten explicitamente de no usar las salidas para tomar decisiones sobre individuos.
- Los LLM pequenos responden mal a preguntas de conocimiento incluso leyendo la transcripcion (77% en qa100), de modo que el modelo sirve para decisiones cortas, no para preguntas abiertas de conocimiento.
- El conector solo funciona con el encoder y el LLM indicados; no es intercambiable con otros modelos.
- La licencia de los pesos es Apache-2.0, pero algunos corpus de entrenamiento (por ejemplo WenetSpeech y CoVoST 2) tienen licencia solo para uso no comercial; hay que verificarlo antes de un uso comercial.
- Riesgo de alucinacion inherente al LLM subyacente y a la formulacion de preguntas; las opciones cerradas reducen pero no eliminan este riesgo.
- La plantilla de chat es especifica de esta receta ("no-think"); usar la plantilla por defecto de SmolLM3 (que anade un system prompt largo con la fecha) no coincidiria con el formato de entrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adventists-ai/DuplexJev-B-MOSS-Transcribe-SmolLM3-3B
- Encoder empaquetado: https://huggingface.co/adventists-ai/MOSS-Transcribe-Diarize-Whisper-Encoder
- LLM base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Encoder original: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio y documentacion: https://github.com/adventists-ai/duplexjev
- Variante con Qwen3-4B-2507: https://huggingface.co/adventists-ai/DuplexJev-B-MOSS-Transcribe-Qwen3-4B-2507
- Variante paralinguistica con Falcon-H1-1.5B: https://huggingface.co/adventists-ai/DuplexJev-B-Para-MOSS-Transcribe-Falcon-H1-1.5B
- Paper asociado: Jin, Jie et al., "Batched Speech Decisions Without Decoding: Single-Token Supervision Lets a Frozen LLM Hear Beyond the Transcript", enviado a IEEE ICASSP 2027 (sin URL publica en la informacion consultada)
