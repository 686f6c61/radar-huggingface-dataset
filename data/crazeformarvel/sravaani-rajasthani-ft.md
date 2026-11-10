# crazeformarvel/sravaani-rajasthani-ft

## Resumen

sravaani-rajasthani-ft es un modelo de reconocimiento automatico del habla (ASR) especializado en rajasthani, una lengua indoaria hablada principalmente en el estado indio de Rajastan. Lo publica el usuario crazeformarvel en Hugging Face y se obtiene mediante fine-tuning del modelo base VoiceArena/sravaani_base sobre aproximadamente 9,5 horas de audio conversacional en rajasthani (conjunto top_mos_10h_Rajasthani). El resultado es un checkpoint orientado a transcripcion de habla espontanea en una lengua de bajos recursos, un escenario donde la mayoria de los ASR multilingues comerciales rinden de forma deficiente.

Tecnicamente se apoya en la familia NeMo de NVIDIA: arquitectura FastConformer con decodificacion TDT (Token-and-Duration Transducer), empaquetada en formato .nemo y pensada para usarse con la libreria `nemo_toolkit`. El repositorio ocupa 1,8 GB, lo que es coherente con un modelo de la gama base de FastConformer (del orden de 100-120 M de parametros, aunque el autor no declara el dato). El modelo se distribuye sin licencia explicita y sin resultados de benchmarks mas alla del conjunto de validacion propio.

Su relevancia es doble: por un lado, aporta un checkpoint practico para una lengua con escasisima cobertura en ASR open source; por otro, sirve como referencia de como un fine-tuning ligero (menos de 10 horas de audio) sobre un modelo base multilingue puede reducir el error de transcripcion en un dominio conversacional concreto. Las cifras declaradas por el autor son WER 12,72 % y CER 5,55 % sobre 217 clips (0,53 h) de grabaciones retenidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificacion TDT (Token-and-Duration Transducer), familia NVIDIA NeMo |
| Parametros totales | no disponible (el autor no lo declara; el tamano del repo, 1,8 GB, sugiere una variante base de FastConformer) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (en ASR, limitada por la ventana de atencion del encoder y el chunking de inferencia) |
| Tipos de cuantizacion | no disponible (formato .nemo nativo; no se documentan variantes INT8/FP16) |
| Idiomas soportados | rajasthani (codigo ISO 639-3: raj) |
| Licencia | no disponible |
| Formato de pesos | .nemo (checkpoint NeMo empaquetado); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base VoiceArena/sravaani_base: un encoder FastConformer, variante de Conformer con atencion por bloques que reduce el coste cuadratico y acelera el entrenamiento e inferencia sobre audio largo, acoplado a un decodificador TDT. TDT (Token-and-Duration Transducer) predice conjuntamente el token de salida y su duracion, lo que mejora la alineacion temporal frente a un CTC puro y permite decodificacion no autoregresiva por tramos, con menor latencia que un transducer clasico.

El entrenamiento documentado consiste en un fine-tuning sobre aproximadamente 9,5 horas de audio conversacional en rajasthani (top_mos_10h_Rajasthani), partiendo de los pesos del modelo base. El autor no detalla la composicion del dataset, el numero de pasos, la tasa de aprendizaje, el esquema de aumentacion de datos ni si hubo entrenamiento adicional con datos sinteticos o pseudo-etiquetados. Tampoco se documenta el preentrenamiento del modelo base ni su cobertura multilingue original, por lo que no es posible evaluar cuanto del rendimiento procede del base y cuanto del fine-tuning.

## Capacidades

- Transcripcion de voz a texto en rajasthani, con salida de texto plano mediante `transcribe()`.
- Reconocimiento de habla conversacional espontanea, no solo lectura de textos: el conjunto de entrenamiento se describe como conversacional.
- Entrada de audio mono a 16 kHz (el ejemplo de la model card usa `audio_16k_mono.wav`).
- Procesamiento por lotes de ficheros de audio en una sola llamada (`m.transcribe([...])`).
- Decodificacion TDT, que aporta alineacion temporal y permite variantes con timestamps segun la configuracion de NeMo (no documentado por el autor).
- No se declaran capacidades de traduccion, diarizacion, deteccion de idioma, puntuacion automatica ni tool calling; es un ASR puro.

## Casos de uso

- Transcripcion de entrevistas y grabaciones de campo en rajasthani: el modelo esta ajustado sobre habla conversacional, por lo que es adecuado para material etnografico, linguistico o periodistico grabado en condiciones reales, con la salvedad de que solo se validaron 217 clips.
- Subtitulado de contenido audiovisual regional: permite generar pistas de subtitulos en rajasthani para videos de YouTube, television local o archivos de patrimonio oral, partiendo de audio remuestreado a 16 kHz mono.
- Preservacion linguistica y corpus digitales: util para transcribir archivos de lengua hablada y alimentar corpus anotados de una lengua de bajos recursos, donde las herramientas comerciales no ofrecen cobertura.
- Atencion ciudadana y servicios publicos en Rajastan: transcripcion de llamadas o mensajes de voz para su enrutamiento o analisis posterior, siempre con revision humana dada la tasa de error del 12,72 % de WER.
- Investigacion en ASR de bajos recursos: sirve como punto de partida (baseline) para experimentos de fine-tuning con datos limitados, comparando el efecto de distintas horas de audio o de aumentacion.
- Prototipado de asistentes de voz locales: integrable en pipelines NeMo para desplegar un servicio de transcripcion on-premise sin dependencia de APIs externas, util en entornos con requisitos de soberania del dato.
- Analitica de contact center: transcripcion masiva de grabaciones para extraer temas y palabras clave en rajasthani, aceptando el coste de post-edicion por los errores del modelo.

## Benchmarks y rendimiento

Unicos datos publicados por el autor, sobre un conjunto de validacion propio (0,53 h, 217 clips, grabaciones retenidas):

| Metrica | Valor | Conjunto |
|---|---|---|
| WER | 12,72 % | Validacion propia, 217 clips (0,53 h) |
| CER | 5,55 % | Validacion propia, 217 clips (0,53 h) |

No se han publicado comparaciones con otros modelos (Whisper, MMS, IndicWav2Vec, etc.) ni resultados en benchmarks publicos estandar de ASR en rajasthani. Las cifras no son directamente comparables con las de otros sistemas porque el conjunto de evaluacion no es publico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano del repo (1,8 GB) y la clase de modelo (FastConformer base), es esperable que quepa en GPU consumer con 4-8 GB de VRAM en FP16, aunque el autor no lo confirma.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 3060/4060 o superior deberia bastar para inferencia en tiempo real o cercano a tiempo real. Para procesamiento por lotes a gran escala, A100 o H100 reducen el tiempo total.
- Cabe en GPU consumer: probablemente si, en tarjetas con 8 GB o mas; no verificado por el autor.
- Opciones de despliegue: `nemo_toolkit` (via `ASRModel.from_pretrained` o `restore_from` con el fichero .nemo), NVIDIA Riva para servicio en produccion y NeMo con backend TensorRT para optimizacion. No hay soporte documentado para llama.cpp, Ollama ni vLLM, que no estan orientados a ASR.
- Latencia y throughput: no disponibles. La decodificacion TDT suele ofrecer mejor latencia que un transducer clasico, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sravaani-rajasthani-ft | FastConformer + TDT | rajasthani | no disponible | no disponible | Hugging Face (NeMo) |
| Whisper (large-v3) | Transformer encoder-decoder | 99 idiomas (rajasthani no listado explicitamente) | ventana de 30 s | MIT | OpenAI / Hugging Face |
| MMS (Meta) | Wav2Vec2 / CTC | mas de 1.100 idiomas, incluidos de bajos recursos | audio variable | CC-BY-NC 4.0 | Hugging Face |
| IndicWav2Vec / AI4Bharat | Wav2Vec2 / CTC | lenguas indias | audio variable | variable segun checkpoint | Hugging Face |

La comparacion cuantitativa no esta disponible: no hay evaluaciones cruzadas publicadas entre este checkpoint y Whisper, MMS o IndicWav2Vec sobre el mismo conjunto de rajasthani. La ventaja diferencial del modelo es la especializacion en una sola lengua y un dominio conversacional; su desventaja es la ausencia de licencia explicita y de validacion externa.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (9,5 h) y de validacion aun menor (0,53 h, 217 clips): el WER de 12,72 % puede no generalizar a otros hablantes, acentos, dominios o condiciones acusticas.
- Un WER superior al 12 % implica, de media, mas de un error cada ocho palabras; no es adecuado para transcripcion automatica sin revision humana en contextos criticos.
- Sesgos desconocidos: el autor no documenta la distribucion de hablantes por genero, edad, dialecto o region dentro de Rajastan, por lo que se desconoce el sesgo demografico y dialectal.
- Riesgo de alucinacion y de sustituciones foneticas en nombres propios, terminologia tecnica y numeros, habitual en ASR entrenado con pocos datos.
- Cobertura limitada a rajasthani: no hay soporte declarado para hindi, marwari, mewari ni otras variedades, ni capacidad de code-switching.
- Licencia no disponible: no se puede asumir uso comercial permitido. Antes de desplegarlo en produccion hay que contactar con el autor o verificar los terminos del modelo base VoiceArena/sravaani_base.
- Dependencia del ecosistema NeMo: requiere `nemo_toolkit` y no es directamente utilizable en runtimes de inferencia genericos (llama.cpp, ONNX Runtime sin conversion previa).
- Sin mantenimiento demostrado: 0 descargas y 0 likes en el momento de la consulta, y actualizacion el mismo dia de la creacion; no hay historial de versiones ni issues resueltos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crazeformarvel/sravaani-rajasthani-ft
- Modelo base: https://huggingface.co/VoiceArena/sravaani_base
- Documentacion de NeMo ASR: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/intro.html
- Paper de FastConformer: https://arxiv.org/abs/2305.05084
- Paper de TDT (Token-and-Duration Transducer): https://arxiv.org/abs/2304.06795
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
