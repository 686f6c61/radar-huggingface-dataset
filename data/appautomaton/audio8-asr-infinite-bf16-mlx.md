# appautomaton/audio8-asr-infinite-bf16-mlx

## Resumen

Audio8-ASR-Infinite (build bf16 para MLX) es una conversion del modelo de reconocimiento automatico del habla Edge0/Audio8-ASR-Infinite, realizada por App Automaton para su ejecucion nativa en Apple Silicon mediante la libreria MLX. El modelo resuelve la transcripcion en streaming de audio en chino e ingles con longitud ilimitada: combina un encoder de audio causal de tipo Voxtral-Realtime, un proyector de audio y un decoder de texto Qwen2.5-3B condicionado por retardo, con un total de aproximadamente 4.086 millones de parametros (4B).

La innovacion principal es su ventana deslizante sobre un contexto nativo de 30 segundos, que mantiene constante el coste por paso y el uso de memoria independientemente de la duracion del audio. El decoder emite un token de texto por cada paso de audio (clock), con retardos configurables entre 240 y 560 ms, lo que permite transcripcion en vivo con latencia controlada.

Este repositorio concreto es la variante de referencia sin cuantizar (bf16, 8,2 GB), pensada para comparar calidad frente a la build int8 (4,4 GB), que es la recomendada por el autor. La inferencia no requiere PyTorch ni Transformers: todo el runtime waveform-to-text se ejecuta con mlx-speech sobre pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio causal Voxtral-Realtime + proyector de audio + decoder de texto Qwen2.5-3B condicionado por retardo |
| Parametros totales | 4.086.290.208 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 s nativos de audio; ventana deslizante para audio de cualquier duracion |
| Tipos de cuantizacion | bf16 (este repo); int8 affine disponible en variante separada |
| Idiomas soportados | chino (zh) e ingles (en), con seleccion explicita obligatoria |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Entrada de audio | mono, 16 kHz (remuestreo por el adaptador de fichero) |
| Tamano del repo | 8,2 GB |
| Libreria | mlx |
| Hardware requerido | Apple Silicon (MLX) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder para ASR en streaming. El encoder de audio es causal (Voxtral-Realtime), lo que permite procesar el flujo de audio sin acceso al futuro. Un proyector de audio conecta la representacion acustica con un decoder de texto basado en Qwen2.5-3B, condicionado por un retardo objetivo (target_delay_ms). El decoder emite exactamente un token de texto por cada paso de audio (clock), de modo que la latencia de transcripcion se controla ajustando el retardo.

La ventana deslizante sobre el contexto nativo de 30 s es la pieza que habilita la transcripcion de duracion ilimitada manteniendo constante el coste por paso. El checkpoint fue post-entrenado especificamente para combinaciones de frame_len y target_delay_ms (frame_len 4/6/8 con clocks de 80/120/160 ms y retardos de 240 a 560 ms); otros multiplos del clock funcionan pero no fueron post-entrenados. La conversion a MLX transpone los dos pesos Conv1d al layout de MLX y fusiona las cabezas de VAD semantico en el fichero principal de pesos. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en streaming para chino e ingles, con seleccion de idioma explicita.
- Transcripcion de audio de duracion ilimitada mediante ventana deslizante sobre contexto nativo de 30 s.
- Modos de latencia configurables: frame_len 4 (80 ms, retardos 240/320/480/560 ms), frame_len 6 (120 ms, 240/480 ms) y frame_len 8 (160 ms, 320/480 ms).
- Procesamiento incremental de waveform: la API `feed()` acepta fragmentos PCM de tamano arbitrario y devuelve los token ids decodificados hasta el momento.
- Finalizacion explicita con `finalize()` para vaciar el texto que aun va por detras del audio.
- Exposicion de probabilidades de VAD semantico por paso (no usadas para endpointing).
- No soporta timestamps, tool calling, agentes ni vision/audio mas alla de la propia transcripcion.
- Decodificacion greedy con batch size uno.

## Casos de uso

- Transcripcion en vivo de reuniones en Mac: una sesion `stream_session` con frame_len 4 y target_delay_ms 480 permite subtitular conversaciones en chino o ingles con unos 480 ms de retardo sobre el habla, sin limite de duracion gracias a la ventana deslizante.
- Subtitulado de video pregrabado de larga duracion: el modelo procesa ficheros de cualquier longitud manteniendo constante el coste por paso, adecuado para generar subtitulos de conferencias o webinars de horas.
- Dictado por voz en aplicaciones macOS: la API de streaming con fragmentos PCM arbitrarios encaja con la captura del microfono y devuelve tokens conforme llegan las muestras.
- Prototipado e investigacion en ASR en Apple Silicon: al no importar PyTorch ni Transformers y ejecutarse con MLX puro, sirve como banco de pruebas reproducible en portatiles y equipos de sobremesa de Apple.
- Comparacion de calidad de cuantizacion: este build bf16 es la referencia sin cuantizar frente a la variante int8, util para validar pipelines de cuantizacion propios.
- Transcripcion bilingue zh/en en entornos de soporte: con idioma fijado por sesion, se puede transcribir audio de atencion al cliente en ambos idiomas, aunque sin timestamps ni endpointing automatico.
- Integracion en herramientas CLI: el comando `mlx-speech asr` permite procesar ficheros WAV en scripts de automatizacion sin escribir codigo.

## Benchmarks y rendimiento

Validacion de release del autor sobre dos parrafos sinteticos generados con Fish S2 Pro, ambos por encima del contexto nativo de 30 s (ventana deslizante activa). bf16 e int8 produjeron transcripciones identicas:

| Idioma | Duracion del audio | bf16 | int8 |
|---|---:|---:|---:|
| Chino | 36,9 s | 1,24 % CER | 1,24 % CER |
| Ingles | 41,7 s | 0,75 % WER | 0,75 % WER |

El autor advierte que se trata de voz sintetica y que estos datos constituyen la puerta de validacion local, no la precision en condiciones reales. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo es de ASR y no de razonamiento. En cuanto a velocidad, el autor reporta 3x tiempo real en un M5 Max para esta build bf16, frente a 4x tiempo real de la variante int8.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon con soporte MLX; no hay ruta de ejecucion en GPU NVIDIA ni CPU generica documentada.
- VRAM/unificada estimada: 8,2 GB de pesos en bf16, mas overhead del runtime MLX; la variante int8 ocupa 4,4 GB.
- GPU recomendadas: chips Apple Silicon (M-series); el autor reporta mediciones en M5 Max. No hay datos de rendimiento para otros chips en la informacion disponible.
- Cabe en equipos consumer Apple Silicon con memoria unificada suficiente (orientativamente 16 GB o mas para bf16 con margen).
- Opciones de despliegue: libreria `mlx-speech` (Python) y CLI `mlx-speech asr`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 3x tiempo real en M5 Max para bf16; 4x tiempo real para int8. Latencia de texto configurable entre 240 y 560 ms segun frame_len y target_delay_ms.
- Batch size uno y decodificacion greedy; no se documenta soporte de batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Hardware | Notas |
|---|---|---:|---|---|---|---|
| audio8-asr-infinite-bf16-mlx (este) | ~4B | 30 s nativos, ilimitado por ventana deslizante | zh, en | Apache 2.0 | Apple Silicon (MLX) | Referencia sin cuantizar, 8,2 GB, 3x tiempo real en M5 Max |
| audio8-asr-infinite-int8-mlx | ~4B | 30 s nativos, ilimitado por ventana deslizante | zh, en | Apache 2.0 | Apple Silicon (MLX) | Variante recomendada, 4,4 GB, 4x tiempo real en M5 Max, transcripciones identicas en la validacion del autor |
| Edge0/Audio8-ASR-Infinite (upstream) | ~4B | 30 s nativos, ilimitado por ventana deslizante | zh, en | Apache 2.0 | no disponible en la informacion proporcionada | Modelo original; este repo es su conversion a MLX |

No se dispone de datos de benchmarks comparativos con otros modelos ASR (como Whisper) en la informacion proporcionada, por lo que no se incluyen cifras de comparacion de precision.

## Limitaciones y advertencias

- Solo chino e ingles, y el idioma debe fijarse explicitamente; no hay deteccion automatica de idioma.
- Decodificacion greedy con batch size uno y sin timestamps.
- En sesiones en vivo se devuelven token ids; un token a nivel de byte puede partir un caracter chino poco frecuente, por lo que hay que decodificar el conjunto acumulado de ids y no cada id por separado.
- Las probabilidades de VAD semantico se exponen por paso pero no se usan para endpointing.
- La inferencia requiere Apple Silicon y MLX; no hay soporte documentado para otras plataformas.
- Los resultados de validacion proceden de voz sintetica (Fish S2 Pro) y no reflejan la precision en audio real; el propio autor lo advierte.
- Riesgo de alucinacion y errores en homofonos documentado en la validacion (por ejemplo, confusiones 再/在 y 她/他 en chino).
- No se han publicado datos sobre sesgos del modelo en la informacion disponible.
- Licencia Apache 2.0, lo que permite uso comercial, pero se remite a la model card del modelo original Edge0/Audio8-ASR-Infinite para los terminos vigentes.
- Este build es la referencia sin cuantizar; para produccion el autor recomienda la variante int8 por tamano y velocidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/appautomaton/audio8-asr-infinite-bf16-mlx
- Variante int8 recomendada: https://huggingface.co/appautomaton/audio8-asr-infinite-int8-mlx
- Modelo original: https://huggingface.co/Edge0/Audio8-ASR-Infinite
- Codigo del modelo original: https://github.com/Edge0-AI/Audio8-ASR-Infinite
- Codigo del runtime MLX: https://github.com/appautomaton/mlx-speech
- Guia del runtime: https://github.com/appautomaton/mlx-speech/blob/main/docs/audio8-asr-infinite.md
- Pagina del proyecto: https://appautomaton.com/mlx-speech/
- Perfil del autor en Hugging Face: https://huggingface.co/appautomaton
- Sitio de App Automaton: https://appautomaton.com
