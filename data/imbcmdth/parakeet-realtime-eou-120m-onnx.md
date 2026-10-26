# imbcmdth/parakeet-realtime-eou-120m-onnx

## Resumen

`imbcmdth/parakeet-realtime-eou-120m-onnx` es la exportación a ONNX de `nvidia/parakeet_realtime_eou_120m-v1`, un modelo de reconocimiento automático del habla en inglés diseñado para transcripción en streaming con detección de fin de turno (end-of-utterance, EOU). Lo desarrolla el usuario imbcmdth a partir del modelo original de NVIDIA, y su aportación es empaquetar todo el pipeline —front end log-mel, encoder FastConformer con caches y decodificación RNNT greedy— en un único grafo ONNX que procesa exactamente un paso de 160 ms por llamada a `InferenceSession.run()`.

El modelo resuelve un problema muy concreto en aplicaciones de voz conversacional: obtener texto parcial mientras el usuario habla y saber cuándo ha terminado de hablar, sin necesidad de instalar NeMo ni PyTorch. Con unos 120 M de parámetros y ficheros de 194 MB (int8), 252 MB (fp16) y 481 MB (fp32), es lo bastante pequeño para ejecutarse en CPU o en GPU de consumo, lo que lo hace relevante para asistentes de voz, subtitulado en directo y agentes telefónicos desplegados en el edge.

La salida es texto en minúsculas y sin puntuación, con el token especial `<EOU>` (id 1024) al final de cada intervención. La licencia es la NVIDIA Open Model License, no una licencia OSI, y el repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto comunitario reciente sin validación externa publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNNT con red de predicción LSTM y joint network; grafo ONNX único con `Loop` para la decodificación greedy |
| Parámetros totales | Aproximadamente 120 M (según la denominación del modelo base); no se publica desglose por componente |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto: streaming continuo en pasos fijos de 160 ms (2560 muestras a 16 kHz), con caché de atención de 70 frames y caché de convolución de 8 frames |
| Tipos de cuantización | int8 (dynamic, per-tensor, `QInt8`, solo `MatMul`/`Gemm` del encoder con `MatMulConstBOnly=True`), fp16 (encoder en fp16, E/S en fp32) y fp32 |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | NVIDIA Open Model License (`license: other`) |
| Formato de pesos | ONNX, opset 17, IR version 8, grafos autocontenidos sin datos externos |
| Frecuencia de muestreo | 16 kHz mono, float32 en el rango [-1, 1] |
| Entrada por paso | `audio` [2560] + estado de stream (`audio_cache` [160], `mel_cache` [1,128,9], `cache_last_channel` [1,17,70,512], `cache_last_time` [1,17,512,8], `cache_last_channel_len` [1], `pred_h`/`pred_c` [1,640], `last_token` [1]) |
| Salida por paso | `tokens` [20], `token_frames` [20], `num_tokens` [1], `reset` [1] y los nueve tensores de estado siguiente |
| Tamaño de ficheros | 194.020.988 B (int8), 251.999.807 B (fp16), 481.284.058 B (fp32); repo de 0,9 GB |
| Vocabulario | `vocab.txt` con 5207 B; token 1024 = `<EOU>`; token inicial `last_token = [1026]` |

## Arquitectura y entrenamiento

El modelo base es un FastConformer cache-aware con decodificador RNNT. El encoder procesa ventanas de 160 ms manteniendo estado entre llamadas: las caches de atención tienen forma `[1, 17, 70, 512]` (17 capas, 70 frames de historial, dimensión 512) y las de convolución `[1, 17, 512, 8]`, lo que confirma que la arquitectura es un stack de 17 capas Conformer con atención de longitud limitada a un historial acotado en lugar de atención completa. La red de predicción RNNT es una LSTM con estado oculto y de celda de 640 dimensiones, y la joint network combina encoder y predictor para emitir tokens de forma greedy. El modelo incorpora un token explícito de fin de intervención, lo que sugiere un entrenamiento específico para predecir EOU además de la transcripción.

La exportación fija todas las formas: no hay ejes dinámicos, de modo que el consumo es siempre de 2560 muestras nuevas por ejecución y el primer paso se trata igual que los demás. El grafo se construye en tres partes: front end escrito con `onnx.helper` (pre-énfasis, framing mediante `Gather`, DFT como `MatMul` con la ventana Hann plegada, filtros mel de NeMo y `log(x + 2^-24)`), encoder trazado desde `ConformerEncoder.forward_for_export` con `torch.onnx.export(dynamo=False, opset_version=17)` y plegado de constantes con `onnxscript.optimizer.optimize`, y decodificación RNNT escrita a mano con un `Loop` sobre pasos de joint y un `If` que ejecuta la LSTM de predicción solo cuando se emite un token, con reseteo de estado tras `<EOU>`/`<EOB>`.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o de datos de dominio) no están disponibles en la información proporcionada; el export solo indica que se usa el dominio por defecto, es decir, sin adaptación a vocabulario o dominio específico. La exportación se hizo desde la revisión `a7e2b4629593dce0ec19f600e00e9904353fda2d` del modelo NeMo con `nemo_toolkit 3.0.0`, `torch 2.14.1+cpu`, `onnx 1.23.2` y `onnxruntime 1.22.0`, con un rebuild byte a byte idéntico usando el Dockerfile fijado.

## Capacidades

- Reconocimiento de voz en streaming en inglés con latencia de un paso de 160 ms, manteniendo estado entre llamadas.
- Detección de fin de intervención: emite `<EOU>` (id 1024) al terminar cada utterance, lo que permite cerrar turnos en un diálogo sin VAD externo o como complemento a este.
- Decodificación RNNT greedy integrada en el grafo, sin necesidad de lógica de decodificación en Python.
- Alineamiento temporal aproximado: la salida `token_frames` asocia cada token a un frame, lo que permite derivar marcas de tiempo.
- Salida en minúsculas y sin puntuación; el vocabulario usa el prefijo `▁` (U+2581) para marcar inicio de palabra.
- Reanudación limpia de estado: la salida `reset` y el reseteo tras `<EOU>`/`<EOB>` permiten encadenar utterances en una misma sesión.
- No soporta tool calling ni function calling: es exclusivamente un modelo ASR.
- No soporta razonamiento multi-step, agentes, visión, audio de entrada más allá del propio habla ni generación de texto libre.
- Multilingüismo: no, únicamente inglés.

## Casos de uso

- Subtitulado en directo: cada 160 ms se envían 2560 muestras y se acumulan los tokens devueltos, de modo que se puede mostrar texto incremental con un retardo de un solo paso; el formato en minúsculas sin puntuación encaja con subtítulos de estilo karaoke o de baja latencia.
- Asistentes de voz con gestión de turnos: el flag `<EOU>` permite al orquestador decidir cuándo dejar de escuchar y lanzar la respuesta del LLM, evitando temporizadores heurísticos y reduciendo el tiempo de respuesta percibido.
- Agentes telefónicos e IVR: al ejecutarse en CPU con el grafo int8 de 194 MB, se puede desplegar junto al resto del stack de telefonía en la misma máquina, sin GPU dedicada, procesando el audio del canal en tiempo real.
- Notas de reuniones en streaming: combinando `token_frames` con el estado persistente se obtiene transcripción con marcas temporales que permiten segmentar por hablante o por tema aguas abajo.
- Transcripción en el navegador o en el edge: al ser ONNX autocontenido, se puede cargar con `onnxruntime-web` o `onnxruntime` en C++/C# y ejecutar la variante int8 en cliente, evitando enviar audio a un servidor por motivos de privacidad.
- Accesibilidad y cumplimiento: generación de subtítulos en vivo para vídeo corporativo o atención al cliente grabada, con la transcripción generada en la propia infraestructura y sin dependencia de APIs externas.
- Voice analytics y keyword spotting: el flujo de tokens por paso permite detectar palabras clave o disparadores en cuanto se pronuncian, útil para enrutamiento inmediato en call centers.
- Barge-in en asistentes de dispositivo: la detección de fin de turno combinada con la latencia de 160 ms permite interrumpir al asistente de forma natural en altavoces inteligentes o automoción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER sobre LibriSpeech, Common Voice ni otros conjuntos, ni comparaciones con el modelo base o con alternativas. Tampoco se publican medidas de latencia por paso, throughput en RTF (real-time factor) ni consumo de CPU/GPU; el único requisito derivado del diseño es que cada paso debe ejecutarse por debajo de 160 ms para sostener el tiempo real.

## Requisitos de hardware

- VRAM/RAM: los pesos ocupan 194 MB (int8), 252 MB (fp16) y 481 MB (fp32). Sumando el overhead de ONNX Runtime y los buffers de estado, una estimación razonable de RSS en CPU para la variante int8 es de 0,4 a 1 GB; el dato exacto no está publicado.
- CPU: la variante int8 está pensada explícitamente para CPU; es la opción recomendada para servidores sin GPU y para despliegue en el edge.
- GPU: la variante fp16 está pensada para CUDA; cabe en cualquier GPU de consumo con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090), así como en A100/H100, aunque en estos últimos el modelo está muy infrautilizado y el beneficio frente a CPU puede ser limitado por el tamaño de cada paso.
- Consumer GPU: sí, con margen amplio; el cuello de botella será la latencia de lanzamiento de kernels por paso de 160 ms, no la memoria.
- Opciones de despliegue: ONNX Runtime en Python (el repo incluye `driver.py` como driver de referencia), C++, C#, Java o JavaScript/Web; no hay soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo. El grafo se puede servir detrás de cualquier framework que acepte ONNX Runtime.
- Latencia y throughput: no disponibles. Al ser formas fijas y ausencia de ejes dinámicos, no hay batching entre streams; el paralelismo debe hacerse a nivel de sesión/proceso, replicando la sesión por cada flujo de audio concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este export (`imbcmdth/parakeet-realtime-eou-120m-onnx`) | ~120 M | Streaming, pasos de 160 ms, EOU integrado | en | NVIDIA Open Model License | ONNX (int8/fp16/fp32) | Repo comunitario, 0 descargas, sin benchmarks publicados |
| `nvidia/parakeet_realtime_eou_120m-v1` (base) | ~120 M | Streaming, pasos de 160 ms, EOU integrado | en | NVIDIA Open Model License | `.nemo` (requiere NeMo Toolkit) | Modelo oficial de NVIDIA, revisión `a7e2b46...` |
| OpenAI Whisper large-v3-turbo | ~809 M | No nativo en streaming; ventanas de 30 s | Multilingüe (~99 idiomas) | MIT | PyTorch, safetensors, GGML/GGUF vía terceros | Amplia adopción, múltiples implementaciones (faster-whisper, whisper.cpp) |

Frente al modelo base, este export elimina la dependencia de NeMo y PyTorch a cambio de fijar el consumo a 2560 muestras exactas por llamada y de no ofrecer adaptación de dominio. Frente a Whisper large-v3-turbo, la diferencia clave es la latencia: Whisper no está diseñado para streaming real y trabaja sobre ventanas de 30 s, mientras que este modelo produce tokens cada 160 ms; a cambio, Whisper es multilingüe, incluye puntuación y mayúsculas de forma nativa y su licencia es permisiva (MIT). No se dispone de datos de WER comparativos en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: cualquier audio en otro idioma producirá transcripciones incorrectas o alucinaciones, sin aviso explícito.
- Salida sin puntuación ni mayúsculas; si se necesita texto formateado hay que añadir un modelo de posprocesado o restauración de puntuación.
- Formas fijas: cada llamada debe recibir exactamente 2560 muestras. Es obligatorio implementar un buffer externo que rellene o recorte el audio, y el primer paso no recibe ningún tratamiento especial.
- Sin adaptación de dominio: el export usa el dominio por defecto del modelo base; no se documenta hotword boosting, vocabulario personalizado ni fine-tuning sobre el grafo ONNX.
- Riesgo de alucinación en audio con ruido, silencio prolongado o solapamiento de hablantes; el modelo puede emitir texto plausible sin correspondencia acústica. No hay umbral de confianza expuesto en la firma.
- Gestión de estado manual y propensa a errores: hay que realimentar nueve tensores `*_out` en cada paso; un fallo de encadenado degrada silenciosamente la transcripción.
- Sin diarización, sin detección de idioma y sin traducción.
- Licencia NVIDIA Open Model License: no es una licencia de código abierto OSI. Conviene revisar los términos de uso comercial, atribución y redistribución antes de integraciones en producto.
- Artefacto comunitario con 0 descargas y 0 likes: no hay validación independiente, ni issues resueltos, ni garantía de mantenimiento. Para producción conviene partir del modelo oficial de NVIDIA y reproducir el export con el Dockerfile incluido, que permite un rebuild byte a byte idéntico.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo (los resultados obtenidos eran foros de videojuegos sin relación), por lo que no hay fuentes externas que corroboren rendimiento o calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/imbcmdth/parakeet-realtime-eou-120m-onnx
- Modelo base: https://huggingface.co/nvidia/parakeet_realtime_eou_120m-v1
- Revisión concreta del modelo base usada en el export: https://huggingface.co/nvidia/parakeet_realtime_eou_120m-v1/resolve/a7e2b4629593dce0ec19f600e00e9904353fda2d/parakeet_realtime_eou_120m-v1.nemo
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- NVIDIA NeMo Toolkit (framework original del modelo): https://github.com/NVIDIA/NeMo
- ONNX Runtime (runtime de despliegue): https://github.com/microsoft/onnxruntime
- Nota: no se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
