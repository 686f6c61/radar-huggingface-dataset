# akm9191/sherpa-onnx-parakeet-tdt-0.6b-v2-int8

## Resumen

Este repositorio contiene una exportación a ONNX con cuantización int8 del modelo de reconocimiento automático del habla NVIDIA Parakeet TDT 0.6B v2, empaquetada para su uso con la librería sherpa-onnx bajo el tipo de modelo `nemo_transducer`. No es un modelo nuevo: es una réplica sin modificaciones del artefacto publicado por el equipo de k2-fsa / Next-gen Kaldi (commit `1ab9323565ddb038682214b292f588070a538ce2`), redistribuida por el usuario akm9191 para integrarla en la aplicación Android de notas Daily Whisper como paquete opcional de transcripción inglesa de mayor precisión.

El modelo resuelve el problema de la transcripción de voz a texto offline en inglés con puntuación y mayúsculas automáticas, sin enviar audio a servidores externos. Su uso previsto en la app es un esquema de dos pasadas: un modelo zipformer en streaming escribe palabras en vivo y, cuando el detector de actividad de voz (Silero VAD) marca una pausa, este Parakeet vuelve a transcribir cada frase y sustituye el texto provisional.

Arquitectónicamente es un transducer (RNN-T) con decodificación TDT (Token-and-Duration Transducer) de NVIDIA NeMo, con 0,6 mil millones de parámetros y pesos separados en encoder, decoder y joiner. El repo ocupa 0,7 GB y la licencia es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer (RNN-T) con decodificacion TDT, entrenado con NVIDIA NeMo |
| Parametros totales | 0,6 mil millones (600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR, procesa segmentos de audio acotados por VAD) |
| Tipos de cuantizacion | int8 (unica variante incluida en este repo) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt |
| Tamano del repo | 0,7 GB |
| Libreria de inferencia | sherpa-onnx (model_type=nemo_transducer) |
| Modelo base | nvidia/parakeet-tdt-0.6b-v2 |

## Arquitectura y entrenamiento

El modelo es un transducer de NVIDIA NeMo con decodificacion TDT (Token-and-Duration Transducer), una variante de RNN-T en la que el predictor emite conjuntamente un token y una duracion, lo que reduce el numero de pasos de decodificacion frente a RNN-T clasico. Los pesos se distribuyen en tres grafos ONNX independientes: encoder (652.184.296 bytes), decoder (7.257.753 bytes) y joiner (1.739.080 bytes), mas el vocabulario en `tokens.txt` (9.384 bytes).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card del espejo no los detalla y remite al modelo original de NVIDIA. La unica innovacion documentada en este artefacto es la exportacion a ONNX con cuantizacion int8 realizada por el equipo de k2-fsa, que preserva el comportamiento del modelo original (salida con puntuacion y mayusculas) reduciendo el peso para despliegue en dispositivos moviles.

## Capacidades

- Transcripcion de voz a texto offline en ingles, con puntuacion y mayusculas generadas automaticamente.
- Decodificacion TDT sobre segmentos de audio delimitados por VAD (uso previsto en dos pasadas).
- Ejecucion local sin conexion: el audio no abandona el dispositivo en el escenario de la app Daily Whisper.
- Integracion con sherpa-onnx mediante `model_type=nemo_transducer`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (es un modelo puramente de ASR).
- Capacidades multilingues: solo ingles; no cubre otros idiomas.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de notas de voz en Android: la app Daily Whisper usa este paquete como segunda pasada sobre cada frase detectada por Silero VAD, sustituyendo la transcripcion provisional del modelo en streaming por una version mas precisa, todo en el dispositivo.
- Dictado offline en aplicaciones de productividad: cualquier app movil o de escritorio que integre sherpa-onnx puede transcribir reuniones o apuntes sin enviar audio a la nube, con la ventaja de privacidad y de funcionamiento sin red.
- Post-procesado de subtitulos en ingles: dado un audio ya segmentado, el modelo genera texto con puntuacion y mayusculas listo para publicacion, evitando una etapa separada de restauracion de puntuacion.
- Evaluacion de calidad de ASR en habla con acento: el modelo card reporta mejoras sustanciales frente a un zipformer en streaming sobre EdACC (ingles indio y otros acentos), lo que lo hace util como referencia en estudios de robustez acentual.
- Despliegue en hardware modesto x86: con un factor de tiempo real de aproximadamente 0,11 en una maquina x86 con 2 hilos para la segunda pasada, es viable en servidores pequenos o equipos de sobremesa sin GPU.
- Prototipado rapido de pipelines ASR: al estar en ONNX int8 y con una unica dependencia (sherpa-onnx), sirve para validar productos de transcripcion antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

Resultados de tasa de error por palabra (WER) reportados en la model card del espejo, sobre 400 clips (200 de ingles indio y 120 de otros acentos de EdACC, 80 de LibriSpeech test-other), con normalizacion Whisper en ingles y eliminacion de muletillas:

| Configuracion | Ingles indio | Otros acentos | LibriSpeech test-other |
|---|---|---|---|
| zipformer en int8 en streaming, solo | 38,3% | 45,3% | 10,0% |
| + este modelo por frase VAD (dos pasadas) | 12,0% | 15,2% | 4,8% |

Velocidad: factor de tiempo real de aproximadamente 0,11 para la segunda pasada en una maquina x86 con 2 hilos.

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 0,7 GB en int8 y el encoder concentra 652 MB, por lo que se requiere al menos ese orden de memoria para cargar los pesos.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU y en dispositivos moviles.
- Cabe en GPU de consumo: si, en terminos de memoria; no se han publicado mediciones especificas por GPU.
- Opciones de despliegue: sherpa-onnx (libreria oficial de este artefacto), con soporte en Android y x86; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR de este formato.
- Latencia y throughput: factor de tiempo real de aproximadamente 0,11 en x86 con 2 hilos para la segunda pasada; no hay datos de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Parakeet TDT 0.6B v2 int8 ONNX) | 600M | ONNX int8, sherpa-onnx | en | CC-BY-4.0 | Hugging Face (espejo) |
| nvidia/parakeet-tdt-0.6b-v2 (original) | 600M | NeMo (.nemo), sin cuantizar | en | CC-BY-4.0 | Hugging Face (NVIDIA) |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8 (fuente) | 600M | ONNX int8, sherpa-onnx | en | CC-BY-4.0 | Hugging Face (k2-fsa) |
| zipformer en int8 en streaming (referencia del test) | no disponible | ONNX, sherpa-onnx | en | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento frente a alternativas como Whisper en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no transcribe otros idiomas; el uso en habla no inglesa producira errores graves.
- Sesgos conocidos: no documentados; el modelo card solo reporta diferencias de WER por acento, con peor rendimiento en ingles indio (12,0%) que en LibriSpeech test-other (4,8%).
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo ASR, puede generar texto plausible en segmentos con ruido o silencio.
- Dependencia de VAD: el flujo de dos pasadas asume segmentacion por Silero VAD; sin ella, el rendimiento y el uso previsto no estan garantizados.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario conservar el aviso de licencia y citar a NVIDIA y al equipo de k2-fsa.
- Repositorio espejo con 0 descargas y 0 likes: no hay validacion comunitaria independiente de este artefacto concreto; conviene verificar los hashes SHA-256 publicados antes de desplegar.
- No es un modelo generativo: no debe usarse para tareas de texto, codigo o razonamiento.
- El modelo card indica que la exportacion y cuantizacion son una copia sin modificaciones de la fuente de k2-fsa; cualquier incidencia debe contrastarse con el repositorio original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/akm9191/sherpa-onnx-parakeet-tdt-0.6b-v2-int8
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Fuente de la exportacion ONNX int8 (k2-fsa): https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Dataset EdACC: https://huggingface.co/datasets/edinburghcstr/edacc
