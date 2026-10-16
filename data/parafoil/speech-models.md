# Parafoil/speech-models

## Resumen

Parafoil/speech-models es un repositorio de modelos de voz distribuido por Parafoil, el desarrollador de una aplicacion de escritorio que transcribe reuniones de forma local en el propio ordenador del usuario. No se trata de un modelo entrenado desde cero, sino de un paquete de artefactos derivados de modelos de NVIDIA, empaquetados y cuantizados para su consumo por el runtime sherpa-onnx. El repositorio contiene dos packs independientes: un modelo de reconocimiento automatico del habla (ASR) basado en NVIDIA Parakeet TDT 0.6B v3 (transductor, unos 600 millones de parametros) y un modelo de diarizacion de hablantes basado en NVIDIA Nemotron 3 Diarization.

Su relevancia radica en el enfoque "local-first": todos los ficheros se fijan por tamano y SHA-256, la aplicacion rechaza cualquier fichero que no coincida y el ASR cubre 25 idiomas europeos. La innovacion principal es la cuantizacion del encoder con cuantizacion dinamica de ONNX Runtime (int8 por canal unicamente en nodos MatMul, dejando las convoluciones en fp32), lo que reduce el peso del encoder a unos 881 MB manteniendo, segun el autor, un 13,7 % de tasa de error de palabra (WER) en audio de reuniones AMI.

El repositorio tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, un tamano total de 1,1 GB y licencia mixta, ya que cada componente arrastra la licencia de su modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor (TDT, Token-and-Duration Transducer) para el pack ASR; modelo de diarizacion de hablantes en el segundo pack. Detalles de la arquitectura interna de cada base: no disponibles |
| Parametros totales | 99.260.363 segun metadatos de HuggingFace (safetensors). El modelo base ASR Parakeet TDT 0.6B v3 tiene ~600 millones de parametros segun su denominacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica (modelo de reconocimiento de voz, procesa audio) |
| Tipos de cuantizacion | Encoder ASR: int8 (cuantizacion dinamica por canal en nodos MatMul), convoluciones en fp32. Decoder y joiner: sin cambios (fp32). Diarizacion: GGUF q8_0. VAD: sin cuantizar |
| Idiomas soportados | 25 idiomas europeos (pack ASR, segun la model card). Los metadatos de HuggingFace indican "no disponible" |
| Licencia | Mixta ("other"): Parakeet CC-BY-4.0, Nemotron OpenMDW 1.1, Silero VAD MIT |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.onnx, joiner.onnx, silero_vad.onnx) y GGUF (Nemotron-3-Diarization.q8_0.gguf) |

## Arquitectura y entrenamiento

El pack de reconocimiento de voz se compone de un encoder, un decoder y un joiner exportados a ONNX, mas un fichero de tokens y un detector de actividad de voz. Procede directamente de la exportacion ONNX a sherpa-onnx del modelo NVIDIA Parakeet TDT 0.6B v3, un transductor de token y duracion. La unica modificacion declarada por el autor es la cuantizacion del encoder mediante cuantizacion dinamica de ONNX Runtime, con pesos int8 por canal restringidos a los nodos MatMul; las capas convolucionales permanecen en fp32. El decoder, el joiner y el fichero de tokens se mantienen sin cambios. El componente silero_vad.onnx es una copia sin modificar del detector de voz Silero VAD.

El segundo pack es una copia sin modificar del fichero Nemotron-3-Diarization.q8_0.gguf publicado por NVIDIA para la tarea de diarizacion de hablantes, fijado en el commit f667ed73aee57d40cc39428eb768b4fd87a0a29e. No hay informacion en el material disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre etapas de RLHF o DPO de los modelos base; esos datos corresponderian a las model cards originales de NVIDIA. El autor no aporta innovaciones arquitectonicas propias: su contribucion es el empaquetado, la cuantizacion del encoder y la verificacion por hash.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 25 idiomas europeos, orientado a audio de reuniones.
- Deteccion de actividad de voz (VAD) mediante Silero VAD para segmentar el audio.
- Diarizacion de hablantes (separacion de quien habla en cada momento) mediante Nemotron 3 Diarization.
- Ejecucion local en el dispositivo del usuario, sin depender de servicios en la nube.
- Verificacion de integridad de los ficheros por tamano y SHA-256 antes de su uso.
- Integracion con el runtime sherpa-onnx mediante el tipo de modelo nemo_transducer.
- Empaquetado en cuantizaciones ligeras (int8 ONNX, GGUF q8_0) apto para CPU.
- Capacidades de tool calling, agentes, vision, audio generativo o modo "thinking": no disponibles; el modelo es exclusivamente de transcripcion y diarizacion.

## Casos de uso

- Transcripcion local de reuniones: la aplicacion de escritorio de Parafoil usa el pack ASR para convertir el audio de una reunion en texto en el propio equipo del usuario, sin enviar datos a terceros, apoyandose en sherpa-onnx sobre CPU.
- Actas con identificacion de hablantes: combinando el pack de ASR con el de diarizacion, se puede generar un texto etiquetado por interlocutor, util para reuniones de equipo o entrevistas.
- Subtitulado automatico en 25 idiomas europeos: el soporte multilingue permite generar subtitulos en distintos idiomas europeos para videos o directos, ejecutando la inferencia en local.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo casi real de conversaciones o clases en el propio dispositivo, con la ventaja de que el audio no sale del equipo.
- Analisis de llamadas de atencion al cliente: la diarizacion permite separar la voz del agente y la del cliente para auditar conversaciones y extraer metricas, siempre que se cumplan las obligaciones legales de tratamiento de datos.
- Preprocesado de audio para pipelines de datos: el VAD de Silero puede usarse como paso previo para recortar silencios y segmentar grandes volumenes de audio antes de alimentar otros sistemas.
- Investigacion en cuantizacion ASR: sirve como referencia reproducible para estudiar el impacto de la cuantizacion int8 dinamica por canal en un transductor sobre la tasa de error de palabra.
- Despliegue en entornos sin conectividad o con requisitos estrictos de privacidad: al no necesitar red ni GPU dedicada, encaja en estaciones de trabajo aisladas o en equipos de campo.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la reportada por el propio autor para el pack ASR.

| Benchmark | Modelo | Resultado |
|---|---|---|
| WER en audio de reuniones AMI | parakeet-tdt-0.6b-v3-pc8 (encoder int8) | 13,7 % (pruebas del autor) |
| Otros benchmarks (MMLU, HumanEval, GSM8K, etc.) | No aplica | No disponible |

No se han publicado resultados de benchmarks adicionales ni comparaciones cuantitativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para el pack ASR: el encoder int8 ocupa 881.498.555 bytes (~841 MiB), el decoder 47.233.743 bytes (~45 MiB), el joiner 25.286.330 bytes (~24 MiB) y el VAD 643.854 bytes; en total algo menos de 1 GB de pesos, con un consumo de memoria de trabajo en el orden de 1 a 2 GB (estimacion basada en los tamanos de fichero, no confirmada por el autor).
- Pack de diarizacion: el fichero GGUF q8_0 ocupa 107.012.128 bytes (~102 MiB).
- GPU recomendadas: no disponibles; el diseno apunta a ejecucion en CPU, por lo que no requiere GPU. Cualquier GPU moderna podria acelerar la inferencia, pero el autor no publica recomendaciones.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo por tamano, pero no hay datos oficiales de rendimiento en GPU.
- Opciones de despliegue: sherpa-onnx (tipo nemo_transducer) para el pack ASR; el pack de diarizacion es un GGUF que requiere un runtime compatible con este formato. Otras opciones (vLLM, TGI, Ollama) no estan documentadas para estos artefactos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa fiable. A continuacion se comparan atributos verificables de modelos de la misma categoria.

| Modelo | Parametros | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parafoil speech-models (ASR) | ~600 M (base) | Audio (no aplica contexto de texto) | Mixta (CC-BY-4.0 en el ASR) | ONNX int8 | Cuantizacion del encoder por el autor |
| NVIDIA Parakeet TDT 0.6B v3 | ~600 M | Audio | CC-BY-4.0 | Original NVIDIA | Modelo base, sin la cuantizacion de Parafoil |
| NVIDIA Nemotron 3 Diarization | No disponible | Audio | OpenMDW 1.1 | GGUF q8_0 (en este repo) | Copia sin modificar; diarizacion de hablantes |

Otras alternativas conocidas del ambito ASR, como Whisper, no se incluyen con datos cuantitativos porque no hay cifras verificables en la informacion proporcionada que permitan contrastarlas con el WER de 13,7 % en AMI.

## Limitaciones y advertencias

- La cifra de 13,7 % de WER en AMI es relativamente alta para audio de reuniones; conviene validarla en el dominio concreto de uso antes de llevarla a produccion.
- El numero de parametros reportado en los metadatos de HuggingFace (99.260.363) no coincide con la denominacion del modelo base (0.6B); no hay explicacion en la informacion disponible, por lo que ese dato debe tomarse con cautela.
- El soporte idiomatico se limita a 25 idiomas europeos; otros idiomas no estan cubiertos segun la model card.
- El ASR y la diarizacion son packs separados: la diarizacion no viene integrada en el flujo del transductor y requiere combinarlos por separado.
- Licencia mixta: el uso comercial depende de la licencia de cada componente (CC-BY-4.0 para Parakeet, OpenMDW 1.1 para Nemotron, MIT para Silero VAD). Es imprescindible revisar los ficheros de licencia antes de un uso comercial.
- En tareas de ASR el "riesgo de alucinacion" se traduce en errores de transcripcion, inserciones u omisiones de texto, especialmente en audio con ruido o solapamiento de voces.
- El repositorio tiene 0 descargas y 0 "likes", por lo que no existe validacion por parte de la comunidad.
- No hay informacion sobre sesgos de los modelos base ni sobre su comportamiento por acento, dialecto o genero; esos datos deberian consultarse en las model cards de NVIDIA.
- El autor declara que los modelos se ofrecen "tal cual", sin garantia, y que las versiones nuevas se publican como carpetas nuevas sin modificar las existentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Parafoil/speech-models
- Modelo base ASR, NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo base de diarizacion, NVIDIA Nemotron 3 Diarization: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Silero VAD: https://github.com/snakers4/silero-vad
