# Edge0/Audio8-ASR-Infinite

## Resumen

Audio8 ASR Infinite es un modelo de reconocimiento automatico del habla (ASR) nativo en streaming desarrollado por Edge0, un equipo centrado en IA para hardware de consumo. A diferencia de los ASR clasicos que procesan audio por ventanas y requieren post-procesado, este modelo decodifica directamente sobre un reloj de audio seleccionable de 80, 120 o 160 ms, generando un token de texto por paso de reloj (hasta 12,5 decisiones por segundo en el modo de 80 ms). El resultado es una transcripcion incremental con una latencia configurable de 240 a 560 ms.

Tecnicamente es un modelo multimodal audio-texto que hereda la arquitectura de Voxtral Realtime 4B en la torre de audio y utiliza Qwen2.5-3B-Instruct como decodificador de texto, con un proyector entrenado desde inicializacion aleatoria. Cuenta con 4.086.224.640 parametros (aproximadamente 4,09 mil millones) en bfloat16, un vocabulario de 151936 tokens y soporte bilingue chino-ingles. La innovacion principal es una cache KV rodante que acota memoria y latencia, permitiendo transcripcion de duracion ilimitada en operacion 24/7 sin deriva acumulada.

El modelo se publica como preview release bajo licencia Apache 2.0. Su relevancia actual radica en dos puntos: por un lado, ofrece una alternativa abierta y desplegable en hardware propio frente a APIs propietarias de ASR en tiempo real; por otro, incorpora cabezas de VAD semantico entrenadas que distinguen pausas de pensamiento, tartamudeo y final real de turno, algo donde el VAD puramente acustico suele fallar. El roadmap del autor anade percepcion semantica a nivel de trama sobre la misma rejilla en una release formal posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de audio causal (herencia de Voxtral Realtime 4B) + proyector + decodificador de texto tipo transformer denso (Qwen2.5-3B-Instruct), con streaming DSM |
| Parametros totales | 4.086.224.640 (4,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como ventana fija; cache KV rodante de ventana ilimitada para audio de duracion arbitraria |
| Tipos de cuantizacion | No disponible (el checkpoint se publica en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 8,17 GB, mas `semantic_vad_heads.safetensors`) |
| Reloj de audio | 80 / 120 / 160 ms (12,5 / 8,3 / 6,25 decisiones por segundo) |
| Retardo de transcripcion | 240 a 560 ms, configurable, multiplo entero del reloj elegido |
| Torre de audio | 32 capas, hidden 1280, 128 bins mel, ventana deslizante 750 |
| Decodificador de texto | 36 capas, hidden 2048, 16 cabezales de consulta / 2 cabezales KV |
| Proyector | Frame length maximo 8, proyeccion de tamano 10240, activacion gelu |
| Vocabulario | 151936 |
| Precision | bfloat16 |

## Arquitectura y entrenamiento

El modelo combina dos bloques diferenciados. La torre de audio es causal y parte de los pesos iniciales de Voxtral Realtime 4B; procesa 128 bins mel con 32 capas y hidden 1280, y aplica una ventana deslizante de 750. El decodificador de texto son 36 capas con hidden 2048 y atencion por grupos de 16 cabezales de consulta frente a 2 cabezales KV, inicializado desde Qwen2.5-3B-Instruct. Entre ambos se situa un proyector con tamano de proyeccion 10240 y activacion gelu que acepta una longitud de trama de hasta 8. Ademas de la torre y el decodificador, se entrena una capa de embedding de longitud de trama y un conjunto de cabezales de VAD semantico de 8 clases con horizontes de 0,5, 1,0, 2,0 y 3,0 segundos.

El entrenamiento cubre explicitamente los pares de reloj de audio y retardo que el autor marca como optimizados: reloj de 80 ms con `frame_len` 4 y 18 tokens de padding izquierdo; reloj de 120 ms con `frame_len` 6 y 12 tokens; y reloj de 160 ms con `frame_len` 8 y 9 tokens. Las combinaciones de retardo post-entrenadas son 240, 320, 480 y 560 ms segun el reloj, aunque el autor indica que valores superiores siguen disponibles porque el retardo solo debe ser multiplo entero del reloj. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La innovacion tecnica central es la cache KV rodante, que mantiene acotados memoria y latencia en ejecuciones continuas, y el condicionamiento por longitud de trama (`use_frame_len_embedding: true`), que permite cambiar el reloj sin reentrenar.

## Capacidades

- Reconocimiento automatico del habla en streaming nativo, con decodificacion incremental a 12,5, 8,3 o 6,25 decisiones por segundo segun el reloj de audio.
- Transcripcion de audio de duracion ilimitada sin deriva acumulada, gracias a la cache KV rodante, incluida operacion continua 24/7.
- Retardo de transcripcion configurable entre 240 y 560 ms, lo que permite intercambiar latencia por precision segun el caso de uso.
- Bilingue chino e ingles, con seleccion de idioma mediante token de idioma (`resolve_qwen_language_token_id`).
- VAD semantico con 8 clases y horizontes de 0,5, 1,0, 2,0 y 3,0 segundos, capaz de distinguir pausas de pensamiento, tartamudeo y final real de turno.
- Decodificacion greedy con EOS suprimido, sin bucles de repeticion ni perdida de palabras finales segun el autor.
- Inferencia por lotes en streaming simulado (`simulated_streaming_greedy_decode_batch`).
- Compatibilidad con un build adaptado de vLLM para despliegue en produccion segun el autor.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio generation en la informacion disponible.

## Casos de uso

- Subtitulado en directo de reuniones y webinars: con un reloj de 80 ms y un retardo de 240 ms, el modelo genera texto incremental con una latencia inferior a un cuarto de segundo, adecuada para subtitulos que el usuario percibe como simultaneos. El soporte bilingue zh/en cubre reuniones con participantes de ambos idiomas.
- Transcripcion de atencion al cliente en tiempo real: la ventana KV rodante permite procesar llamadas de duracion arbitraria sin degradacion, y la latencia acotada permite alimentar sistemas de sugerencia de respuesta mientras el cliente todavia habla.
- Deteccion de turno en asistentes de voz: las cabezas de VAD semantico con horizontes de hasta 3 segundos permiten decidir si el usuario ha terminado de hablar o solo ha hecho una pausa, reduciendo las interrupciones que provocan los VAD acusticos en habla con titubeos.
- Indexacion y busqueda de archivos de audio largos: podcasts, grabaciones de clases o archivos de contact center de horas de duracion se transcriben en una sola pasada continua sin necesidad de segmentar manualmente por silencios.
- Accesibilidad en tiempo real: generacion de subtitulos para personas con discapacidad auditiva en entornos presenciales, con un retardo de 480 ms que mantiene la sincronia con el hablante.
- Preprocesado para pipelines de analitica de voz: la transcripcion incremental puede alimentar clasificadores de intencion, analisis de sentimiento o extraccion de entidades mientras la conversacion sigue en curso, en lugar de esperar al final del audio.
- Despliegue en produccion con vLLM: el autor indica que con un build adaptado de vLLM el modelo transcribe audio de duracion ilimitada de forma continua, lo que facilita su integracion en servicios con multiples flujos de audio concurrentes.
- Transcripcion en el borde o en infraestructura propia: al ser un modelo de 4,09 B con pesos de 8,17 GB, es viable desplegarlo sin depender de APIs de terceros, lo que resulta relevante para datos sensibles o requisitos de residencia de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy, EOS suprimido, reloj de audio de 80 ms y `target_delay_ms = 480` (6 tokens de retardo). Las tasas de error estan expresadas en porcentaje.

| Conjunto de test | Metrica | Audio8 ASR Infinite | Voxtral-Mini-4B-Realtime-2602 | nemotron-3.5-asr-streaming-0.6b |
|---|---|---|---|---|
| aishell1/test | CER | 1,750 | 16,795 | 12,927 @ 560 ms |
| aishell4/test | CER | 2,893 | 16,456 | 14,677 @ 560 ms |
| librispeech test.clean | WER | 3,042 | 2,210 | 3,353 @ 560 ms |
| librispeech test.other | WER | 6,808 | 5,552 | 7,140 @ 560 ms |
| Media | - | 3,623 | 10,253 (2 conjuntos) | 9,524 |

No se han publicado resultados adicionales de benchmarks (por ejemplo MMLU, HumanEval o GSM8K) en la informacion disponible, algo esperable al tratarse de un modelo exclusivamente de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 8,2 GB solo de pesos, mas la cache KV rodante y el resto de componentes; una estimacion conservadora se situa en 11-13 GB, aunque el autor no publica cifras oficiales. Esta estimacion se deriva del tamano de checkpoint documentado y no de una medicion oficial.
- Cuantizaciones: no se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ, FP8) en la informacion disponible, por lo que las cifras para precisiones reducidas no se pueden confirmar.
- GPU de centro de datos: una A100 de 40 GB, una H100 o una L40S permiten ejecutar el modelo en bfloat16 con holgura para lotes y flujos concurrentes.
- GPU de consumo: el modelo cabe en tarjetas con 16 GB o mas de VRAM en bfloat16, como una RTX 4090, RTX 4080 o RTX A4000 de 16 GB. En tarjetas de 12 GB el margen es muy ajustado y no esta confirmado sin una cuantizacion oficial.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` para streaming simulado; el autor menciona un build adaptado de vLLM para operacion continua. No se documenta soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia: retardo de transcripcion configurable de 240 a 560 ms, con 12,5 decisiones por segundo en el reloj de 80 ms.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Streaming | Idiomas | CER aishell1 | WER librispeech clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Audio8 ASR Infinite | 4,09 B | Si, nativo, reloj 80/120/160 ms | zh, en | 1,750 | 3,042 | Apache 2.0 | HuggingFace y GitHub |
| Voxtral-Mini-4B-Realtime-2602 | 4 B (torre de audio reutilizada por Audio8) | Si | No disponible | 16,795 | 2,210 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| nemotron-3.5-asr-streaming-0.6b | 0,6 B | Si, 560 ms segun la tabla | No disponible | 12,927 | 3,353 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

La comparativa se limita a los tres sistemas incluidos en la tabla de evaluacion del autor. Audio8 ASR Infinite domina claramente en los conjuntos en chino, mientras que Voxtral-Mini-4B-Realtime-2602 mantiene la delantera en librispeech en ingles. Nemotron, con un sexto de parametros, queda por detras en los cuatro conjuntos.

## Limitaciones y advertencias

- Cobertura linguistica limitada a chino e ingles. No se documenta soporte de otras lenguas, por lo que su uso en castellano no esta validado.
- Es una preview release: el autor indica que la percepcion semantica a nivel de trama forma parte del roadmap y no esta incluida en esta entrega, que cubre unicamente la base de transcripcion.
- Riesgo de alucinacion y de bucles de repeticion inherente a los modelos generativos de secuencia a secuencia. El autor afirma que en su configuracion de evaluacion no se producen bucles ni palabras finales perdidas, pero esa garantia se limita al ajuste de decodificacion descrito (greedy con EOS suprimido, reloj de 80 ms y retardo de 480 ms).
- El rendimiento depende fuertemente de la combinacion de reloj de audio, `frame_len`, tokens de padding izquierdo y retardo elegidos. El autor advierte que las combinaciones no listadas como optimizadas pueden degradar la calidad.
- Sesgos: no se proporciona informacion sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgos por variedad dialectal, genero, edad o dominio. No disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con la obligacion de conservar los avisos de licencia y de copyright y de indicar los cambios realizados. No se incluye clausula de uso aceptable especifica en la informacion disponible.
- Requiere `trust_remote_code=True` para cargar el modelo, ya que incluye codigo remoto (`custom_code`) en el repositorio. Conviene auditar ese codigo antes de desplegarlo en produccion, dado que se ejecuta en el proceso del usuario.
- Se trata de un modelo de reconocimiento de voz, no de un modelo de proposito general: no se documentan capacidades de generacion de texto libre, razonamiento, codigo, matematicas ni vision.
- Cifras de hardware, VRAM y throughput no publicadas de forma oficial; cualquier planificacion de capacidad debe validarse con una prueba propia.
- El repositorio registra 0 descargas y 19 likes en el momento de la consulta, lo que indica una validacion comunitaria todavia muy limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Edge0/Audio8-ASR-Infinite
- Repositorio GitHub del modelo: https://github.com/Edge0-AI/Audio8-ASR-Infinite
- Licencia (Apache 2.0) en GitHub: https://github.com/Edge0-AI/Audio8-ASR-Infinite/blob/main/LICENSE
- Paper en arXiv: anunciado como "coming soon" en la model card; el enlace apunta al repositorio de GitHub, sin identificador arXiv disponible
- Sitio de Edge0: https://edge0.ai/
- Pagina de modelos de Edge0: https://edge0.ai/models
- Repositorio GitHub de Edge0 (framework de inferencia MoE en streaming): https://github.com/Edge0-AI/Edge0
- Aplicacion Edge0: https://edge0.app/
