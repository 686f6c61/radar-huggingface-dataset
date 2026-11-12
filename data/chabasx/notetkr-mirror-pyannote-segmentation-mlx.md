# chabasx/NoteTkr-mirror-Pyannote-Segmentation-MLX

## Resumen

NoteTkr-mirror-Pyannote-Segmentation-MLX es una conversion a MLX de los pesos de pyannote/segmentation-3.0, un modelo de segmentacion de hablantes basado en la arquitectura PyanNet. Lo publica el usuario chabasx como espejo (mirror) para su uso en el framework MLX de Apple, orientado a Apple Silicon. El modelo original lo desarrolla el equipo de pyannote (Herault et al.) y se emplea tanto para deteccion de actividad de voz (VAD) como para diarizacion de hablantes.

El modelo procesa ventanas de audio de 10 segundos y produce probabilidades sobre 7 clases en esquema powerset, que cubren hasta 3 hablantes simultaneos. Con solo 1.489.169 parametros (aproximadamente 1,5 millones), es un modelo muy ligero pensado para ejecutarse en dispositivos con recursos limitados, en este caso equipos con chip de Apple.

Su relevancia actual radica en que permite ejecutar un pipeline de diarizacion y VAD de calidad en hardware de consumo Apple Silicon sin depender de PyTorch ni de pyannote.audio, ya que la conversion elimina esa dependencia mediante un unpickler personalizado y precomputa los filtros SincNet. Es un componente de infraestructura (speech-swift), no un modelo generativo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PyanNet: SincNet → BiLSTM (4 capas) → Linear (2 capas) → softmax de 7 clases |
| Parametros totales | 1.489.169 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 10 segundos (no es contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors para MLX) |
| Idiomas soportados | no disponible (modelo acustico independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

PyanNet es una red neuronal recurrente convolucional disenada especificamente para segmentacion de hablantes. La primera etapa, SincNet, aplica una capa convolucional con filtros de banda sinc parametrizados por pares (low_hz, band_hz) aprendidos; en esta conversion MLX se precomputan 80 filtros sinc (40 coseno + 40 seno) a partir de 40 pares de parametros. A continuacion, una BiLSTM de 4 capas bidireccional modela la secuencia temporal, seguida de dos capas lineales y un clasificador final que emite 7 clases en esquema powerset: no-habla, hablante 1, hablante 2, hablante 3, hablante 1+2, hablante 1+3 y hablante 2+3.

El modelo base pyannote/segmentation-3.0 se entrena sobre datos de audio de habla con anotaciones de actividad de voz y turnos de hablante; la informacion proporcionada no detalla el numero de tokens, la composicion exacta del dataset ni si se empleo RLHF o DPO (no aplicable a este tipo de modelo). La innovacion tecnica de esta version concreta es la conversion a MLX: transposicion de pesos Conv1d de [O, I, K] a [O, K, I] para canales-last, separacion de la BiLSTM en pilas forward/backward con suma de bias_ih y bias_hh, y precomputo de los filtros SincNet para evitar dependencias de pyannote.audio en tiempo de inferencia.

## Capacidades

- Deteccion de actividad de voz (VAD) binaria sobre audio a 16 kHz.
- Segmentacion de hablantes (diarizacion) con hasta 3 hablantes simultaneos por ventana de 10 segundos.
- Salida en esquema powerset de 7 clases que resuelve solapamientos de habla.
- Integracion en pipeline de diarizacion junto con embeddings WeSpeaker.
- Ejecucion nativa en Apple Silicon mediante MLX y la libreria SpeechVAD / speech-swift.
- Uso como componente acustico independiente del idioma (no genera texto ni razona).
- No soporta tool calling, function calling, agentes, vision ni audio generativo.

## Casos de uso

- Diarizacion en dispositivos Apple: ejecutar un pipeline completo de "quien habla y cuando" en un Mac con chip M-series usando MLX, sin GPU dedicada ni PyTorch, gracias al reducido tamano de 1,5M de parametros.
- Preprocesado de transcripciones: segmentar audio de reuniones en turnos por hablante antes de pasarlo a un ASR, de modo que cada fragmento de texto quede atribuido a su interlocutor.
- Deteccion de actividad de voz en aplicaciones de grabacion: filtrar silencios y reducir el volumen de audio a procesar en pipelines de reconocimiento, con ventanas de 10 segundos y salida binaria de habla/no-habla.
- Analisis de llamadas de atencion al cliente: separar agente y cliente en grabaciones mono para calcular tiempos de habla, solapamientos y metricas de calidad de conversacion.
- Investigacion en procesamiento de habla: usar el modelo como bloque base reproducible en MLX para experimentos de segmentacion y comparativas con la version PyTorch original.
- Aplicaciones de accesibilidad y subtitulado: identificar turnos de hablante en tiempo real en un Mac para etiquetar subtitulos con el nombre del interlocutor.
- Prototipado de pipelines de audio en Swift: integrar el modelo mediante SpeechVAD en apps nativas de macOS/iOS sin salir del ecosistema Swift.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB con pesos en safetensors de ~1,5M de parametros; cabe holgadamente en memoria unificada de cualquier Apple Silicon.
- GPU recomendadas: cualquier chip Apple M1, M2, M3 o M4 (MLX esta optimizado para Apple Silicon); no requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; en GPU NVIDIA no es el objetivo de esta conversion (la version original en PyTorch puede ejecutarse en CUDA).
- Opciones de despliegue: MLX con la libreria SpeechVAD / speech-swift; la version original pyannote/segmentation-3.0 se despliega con pyannote.audio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Framework |
|---|---|---|---|---|---|
| NoteTkr-mirror-Pyannote-Segmentation-MLX (este) | 1.489.169 | ventanas de 10 s a 16 kHz | 7 clases powerset (hasta 3 hablantes) | MIT | MLX |
| pyannote/segmentation-3.0 | ~1,5M (mismo modelo base) | ventanas de 10 s a 16 kHz | 7 clases powerset | MIT | PyTorch / pyannote.audio |
| pyannote/segmentation (versiones previas) | no disponible | ventanas de audio | segmentacion de hablantes | MIT | PyTorch |

La comparativa se limita al modelo base y sus versiones previas, ya que la informacion proporcionada no incluye otros modelos de segmentacion alternativos con datos verificables.

## Limitaciones y advertencias

- Modelo acustico de segmentacion: no genera texto, no razona y no responde a instrucciones; no debe confundirse con un LLM.
- Limite de 3 hablantes simultaneos por ventana; conversaciones con mas interlocutores solapados pueden degradar la asignacion.
- Ventanas fijas de 10 segundos: requiere troceado y agregacion externa para audio continuo.
- Dependencia de embeddings externos (WeSpeaker) para la diarizacion completa; este repositorio solo aporta el modelo de segmentacion.
- Riesgo de confusion en habla solapada y en condiciones acusticas adversas (ruido, reverberacion); no se han publicado metricas de error en la informacion disponible.
- Sesgos acusticos heredados del corpus de entrenamiento original de pyannote; no disponibles en detalle.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base pyannote/segmentation-3.0 (gated en Hugging Face) antes de redistribuir.
- Repositorio con 0 descargas y 0 likes: ecosistema muy reciente y sin validacion comunitaria; conviene probar exhaustivamente antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/chabasx/NoteTkr-mirror-Pyannote-Segmentation-MLX
- Modelo base: https://huggingface.co/pyannote/segmentation-3.0
- Repositorio speech-swift: https://github.com/soniqo/speech-swift
- Guia de diarizacion: https://soniqo.audio/guides/diarize
- Documentacion: https://soniqo.audio
- Licencia pyannote-audio: https://github.com/pyannote/pyannote-audio/blob/develop/LICENSE
