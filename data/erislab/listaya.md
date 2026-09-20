# ERISLab/LisTAya

## Resumen

LisTAya (Listening Tiny Aya) es una familia de modelos de reconocimiento automático del habla (ASR) desarrollada por ERISLab con la receta SLAM-ASR: un codificador de voz Whisper-medium congelado, un decodificador LLM también congelado y un proyector lineal entrenable entre ambos. En el entrenamiento solo se actualizan los pesos del proyector, lo que reduce el coste de adaptación a un idioma concreto a unas pocas horas de GPU.

Los checkpoints publicados son las celdas (idioma, decodificador) del estudio *How Does Regional Decoder Specialization Help Low-Resource ASR Based on the SLAM-ASR Framework?* (ROCLING 2026). Se cubren doce idiomas —amárico, hausa, suajili, hindi, maratí, tamil, urdu, inglés, español, francés, indonesio y criollo seychelense— combinados con cuatro variantes regionales de Tiny Aya (Global, Earth, Fire y Water), todas de 3350 millones de parámetros y con el mismo tokenizador, más dos controles: Tiny Aya Base y Qwen3-4B.

El interés actual del proyecto es metodológico: permite medir si la especialización regional del decodificador influye en el error de transcripción en lenguas con pocos recursos, manteniendo fijo el codificador acústico y el presupuesto de entrenamiento. La model card publica la tasa de error de caracteres (CER) de validación de cada checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SLAM-ASR: codificador de voz congelado + proyector lineal entrenable + decodificador LLM congelado (clase `Qwen2AudioForConditionalGeneration`) |
| Parametros totales | No disponible como cifra única. Composición: codificador Whisper-medium congelado + decodificador Tiny Aya de 3350 millones de parámetros (o Qwen3-4B en el control) + proyector lineal |
| Longitud de contexto | No disponible. El entrenamiento usa clips de audio de menos de 30 segundos (WorldSpeech) |
| Tipos de cuantizacion | No disponible. No se publican versiones cuantizadas; los pesos se distribuyen en bfloat16 |
| Idiomas soportados | am, ha, sw, hi, mr, ta, ur, en, es, fr, id, crs (un checkpoint monolingüe por idioma) |
| Licencia | No disponible |
| Formato de pesos | No especificado en la model card. Pesos en bfloat16, cargables con `transformers` 4.57.5 (encoder, proyector, decoder, processor y tokenizer en cada repositorio) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón SLAM-ASR: la señal de audio se procesa con el codificador de Whisper-medium, cuya salida se proyecta mediante una capa lineal entrenable al espacio de embeddings del decodificador de texto, que genera la transcripción. Ni el codificador ni el decodificador se actualizan durante el entrenamiento; el único componente entrenable es el proyector. Los repositorios se nombran `q2a_openai_whisper-medium_<decoder>_ws-<language>-<step>` y contienen el modelo completo (encoder, proyector y decoder), el procesador, el tokenizador y el `trainer_state.json` con la curva de validación. El prompt usado en el entrenamiento es `<|audio_bos|><|AUDIO|><|audio_eos|>Transcribe the input speech: `.

Cada proyector se entrena sobre el split de entrenamiento de WorldSpeech de un único idioma (habla formal procedente de procedimientos parlamentarios, retransmisiones y audiolibros, con clips de menos de 30 segundos). La receta es AdamW con tasa de aprendizaje 1,5e-3, batch 8 con acumulación de gradiente 64 (batch efectivo 512), 1000 pasos, sin weight decay y una única NVIDIA H200, con validación cada 10 pasos. Se guarda un checkpoint cada 50 pasos y se conserva el de menor pérdida de validación sobre el split de validación de FLEURS, con dos excepciones: hausa se valida sobre el split de test de WorldSpeech y criollo seychelense sobre un 2 % reservado de sus propios datos, ya que FLEURS no lo cubre. La model card menciona además ablaciones y ejecuciones sustituidas, como el reentrenamiento en tamil con tasa de aprendizaje 1,5e-2.

## Capacidades

- Transcripción de voz a texto monolingüe para cada uno de los doce idiomas cubiertos por los checkpoints.
- Adaptación a lenguas con pocos recursos (amárico, hausa, suajili, urdu, tamil, maratí, criollo seychelense) partiendo de un decodificador preentrenado.
- Cobertura multilingüe a nivel de familia: los doce idiomas están cubiertos por distintos checkpoints, no por un único modelo.
- Entrada de audio de 16 kHz mono, gestionable con `AutoProcessor` y `transformers`.
- Comparación controlada de decodificadores: la misma receta se aplica a cinco decodificadores Tiny Aya y a Qwen3-4B, lo que permite aislar el efecto del decodificador.
- No se documentan tool calling, function calling, uso como agente, razonamiento multi-paso, visión ni modo de pensamiento.
- No se documenta ninguna capacidad de comprensión semántica del audio más allá de la transcripción literal.

## Casos de uso

- Transcripción de procedimientos parlamentarios y debates oficiales: el corpus de entrenamiento procede de este dominio, de modo que el modelo está ajustado al registro formal y a la locución continua de este tipo de grabaciones.
- Subtitulado de retransmisiones de radio y televisión en lenguas de bajos recursos: los checkpoints de amárico, hausa, suajili, urdu o tamil permiten generar subtítulos automáticos donde no existen sistemas comerciales.
- Digitalización de audiolibros: el material de entrenamiento incluye audiolibros, por lo que el modelo se adapta a lectura prosódica y clips cortos.
- Investigación en ASR de bajos recursos: los doce checkpoints y sus controles forman un banco experimental reproducible para estudiar el efecto del decodificador y de la especialización regional.
- Generación de pseudo-etiquetas a escala: los checkpoints pueden transcribir grandes volúmenes de audio para preentrenar o aumentar otros sistemas, filtrando después por confianza.
- Despliegue en asistentes de voz con turnos cortos: al trabajar con clips de menos de 30 segundos (el dominio de entrenamiento), encaja en la transcripción de consultas breves en español, francés o indonesio con CER bajo.
- Documentación de lenguas sin escritura estandarizada, como el criollo seychelense, donde existe un checkpoint específico pese a que ni el codificador ni los decodificadores lo cubren de forma nativa.

## Benchmarks y rendimiento

Los autores no publican resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.), ya que se trata de un modelo de ASR. La model card sí incluye la tasa de error de caracteres (CER, en porcentaje) del checkpoint conservado de cada celda, leída de su `trainer_state.json`. Corresponde al modelo publicado, no al mínimo de la curva de validación:

| Idioma | Región | Global | Earth | Fire | Water | Base | Qwen3-4B |
|---|---|---|---|---|---|---|---|
| Amárico (`am_et`) | Earth | 35,1 | 36,3 | 31,0 | 28,6 | 47,3 | 39,5 |
| Hausa (`ha_ng`) | Earth | 37,1 | 37,2 | 36,9 | 38,7 | 36,6 | 34,1 |
| Suajili (`sw_ke`) | Earth | 15,6 | 17,2 | 22,9 | 19,7 | 19,2 | 14,7 |
| Hindi (`hi_in`) | Fire | 15,7 | 18,8 | 18,5 | 16,4 | 12,2 | 15,5 |
| Maratí (`mr_in`) | Fire | 14,2 | 14,4 | 14,7 | 19,4 | 14,3 | 15,4 |
| Tamil (`ta_in`) | Fire | 84,5 | 72,9 | 47,3 | 80,6 | 45,7 | 53,4 |
| Urdu (`ur_pk`) | Fire | 33,1 | 21,8 | 26,2 | 25,5 | 25,3 | 48,4 |
| Inglés (`en_us`) | Water | 10,2 | 7,2 | 4,4 | 14,8 | 5,5 | 7,2 |
| Español (`es_mx`) | Water | 3,5 | 5,6 | 3,6 | 3,5 | 3,1 | 3,8 |
| Francés (`fr_ca`) | Water | 8,6 | 7,4 | 8,5 | 7,1 | 11,1 | 7,2 |
| Indonesio (`id_id`) | Water | 6,1 | 9,1 | 5,9 | 6,1 | 6,1 | 7,4 |
| Criollo seychelense (`crs_sc`) | ninguna | 23,1 | 18,9 | 23,5 | 21,4 | 24,6 | 18,6 |

La model card también documenta un ejemplo cualitativo en inglés con el checkpoint Global: sobre un clip de FLEURS, la hipótesis es «when you call someone who is 1000s of miles away you are using a satellite» frente a la referencia «when you call someone who is thousands of miles away you are using a satellite». Se indica además que cargar en bfloat16 en lugar de float32 alteró 3 de 40 transcripciones de validación en inglés.

## Requisitos de hardware

- Estimación de memoria (a partir del tamaño de los componentes; la model card no publica cifras de inferencia): los checkpoints con decodificador Tiny Aya rondan los 3700 millones de parámetros totales, lo que supone aproximadamente 7,5 GB de pesos en bfloat16 y 15 GB en float32. Con decodificador Qwen3-4B, alrededor de 8,5 GB en bfloat16 y 17 GB en float32, más caché KV y activaciones.
- GPU profesionales: A100 de 40 GB o 80 GB, H100 y H200 ejecutan el modelo sin problema. Los autores usaron una única NVIDIA H200 para el entrenamiento.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB es suficiente en bfloat16 con margen para el audio y la caché; en float32 el ajuste es mucho más estrecho. En tarjetas de 16 GB el despliegue en bfloat16 queda al límite y no hay cuantizaciones publicadas que reduzcan el consumo.
- Opciones de despliegue: la única ruta verificada en la model card es `transformers` 4.57.5 con `AutoProcessor` y `Qwen2AudioForConditionalGeneration`; el ejemplo oficial carga en float32 sobre CUDA. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, ni versiones GGUF.
- Latencia y throughput: no disponibles.
- Nota operativa: se recomienda reservar VRAM para el procesador de audio y usar `max_new_tokens=256` con `do_sample=False`, como en el ejemplo oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | CER inglés (`en_us`) | CER suajili (`sw_ke`) |
|---|---|---|---|---|---|
| LisTAya + Tiny Aya Global | 3350 M (decodificador) | SLAM-ASR con proyector | no disponible | 10,2 | 15,6 |
| LisTAya + Tiny Aya Fire | 3350 M (decodificador) | SLAM-ASR con proyector | no disponible | 4,4 | 22,9 |
| LisTAya + Tiny Aya Base (control) | 3350 M (decodificador) | SLAM-ASR con proyector | no disponible | 5,5 | 19,2 |
| LisTAya + Qwen3-4B (control) | 4000 M (decodificador) | SLAM-ASR con proyector | no disponible (Qwen3-4B tiene licencia propia) | 7,2 | 14,7 |
| Whisper-medium | 769 M | Transformer encoder-decoder de ASR | no verificado en la información proporcionada | no disponible | no disponible |
| Qwen2-Audio-7B | ~8200 M | LLM multimodal con codificador de audio | no verificado en la información proporcionada | no disponible | no disponible |

Las filas de Whisper-medium y Qwen2-Audio-7B se incluyen únicamente como referencia de categoría: sus especificaciones no proceden de la model card de LisTAya y no se han podido verificar con la búsqueda web disponible, que no devolvió resultados útiles. Lo relevante del proyecto es que LisTAya reutiliza precisamente el codificador de Whisper-medium congelado, de modo que la comparación interna con los controles (Tiny Aya Base y Qwen3-4B) es la que el estudio mide de forma controlada.

## Limitaciones y advertencias

- Licencia no disponible: sin términos explícitos de uso, no hay base clara para un despliegue comercial. Conviene contactar con ERISLab antes de usarlo en producción.
- CER elevado en varias lenguas: tamil oscila entre 45,7 y 84,5 según decodificador, urdu entre 21,8 y 48,4, hausa entre 34,1 y 38,7 y amárico entre 28,6 y 47,3. Solo español (3,1-5,6), indonesio (5,9-9,1) y francés (7,1-11,1) bajan del 12 %.
- Un checkpoint por idioma: el modelo no es multilingüe en una sola pasada; hay que seleccionar el repositorio del idioma correcto.
- Dominio restringido: el entrenamiento usa habla formal (parlamento, retransmisiones, audiolibros) con clips de menos de 30 segundos. No hay garantía de comportamiento con habla espontánea, ruido de fondo, solapamiento de hablantes o acentos fuera del corpus.
- Riesgo de alucinación: el decodificador es un LLM congelado y puede generar texto plausible que no aparece en el audio, especialmente en las lenguas con CER alto.
- Transcripción literal: el ejemplo oficial muestra cifras en formato no normalizado («1000s»), de modo que no debe asumirse puntuación, mayúsculas ni normalización numérica correctas.
- Solo se entrena el proyector: el techo de calidad lo fijan el codificador y el decodificador congelados, y no se corrige ningún sesgo propio de esos componentes.
- Criollo seychelense no está soportado por el codificador ni por ninguno de los decodificadores, por lo que su rendimiento depende por completo de la transferencia del proyector.
- Precisión numérica: cargar en bfloat16 en lugar de float32 modificó 3 de 40 transcripciones de validación en inglés, según la propia model card.
- Sesgos potenciales: cada proyector se entrena con un único corpus por idioma (WorldSpeech), con la composición demográfica y de registro que ese corpus tenga.
- Adopción nula en el momento de la consulta (0 descargas y 0 likes), sin validación independiente por parte de la comunidad.
- Sin cuantizaciones publicadas, el coste de memoria en producción es el de bfloat16 o float32 completos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ERISLab/LisTAya
- Colección completa de checkpoints: https://huggingface.co/collections/ERISLab/listaya-slam-asr-projectors-on-tiny-aya-rocling-2026-6ab031414095f3df8805ed7b
- Dataset WorldSpeech de ERISLab (config `crs_sc`): https://huggingface.co/datasets/ERISLab/WorldSpeech
- Dataset WorldSpeech de disco-eth: https://huggingface.co/datasets/disco-eth/WorldSpeech
- Dataset FLEURS (usado para validación): https://huggingface.co/datasets/google/fleurs
- Artículo de referencia: *How Does Regional Decoder Specialization Help Low-Resource ASR Based on the SLAM-ASR Framework?* (ROCLING 2026). Enlace no disponible en la información proporcionada.
- Librería `transformers` (versión probada 4.57.5): https://github.com/huggingface/transformers
