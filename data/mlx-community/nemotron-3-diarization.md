# mlx-community/Nemotron-3-Diarization

## Resumen

Nemotron-3-Diarization (MLX) es una conversion al formato MLX del modelo nvidia/Nemotron-3-Diarization, publicada por la comunidad mlx-community para su uso con la libreria mlx-audio. No es un modelo de generacion de texto: es un sistema de diarizacion de hablantes y deteccion de actividad de voz que recibe audio mono a 16 kHz y devuelve segmentos etiquetados por hablante con una resolucion temporal de 10 ms, con capacidad para distinguir hasta ocho hablantes.

El modelo cuenta con 99.263.843 parametros (unos 99,3 millones) y un repositorio de 0,2 GB, lo que lo situa en la categoria de modelos ligeros aptos para ejecucion en hardware de consumo. La arquitectura declarada es de tipo streaming Sortformer, disenada para procesamiento incremental de audio con identidad de hablante persistente entre fragmentos mediante un mecanismo AOSC y una cola FIFO.

Su relevancia practica esta en que permite diarizacion en streaming sobre Apple Silicon sin GPU dedicada, algo poco habitual en esta categoria, donde la mayoria de soluciones dependen de PyTorch y CUDA. La licencia es openmdw-1.1 y el modelo base es la version oficial publicada por NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (transformer con cabecera de prediccion de hablantes); detalles internos no disponibles |
| Parametros totales | 99.263.843 (unos 99,3 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; procesa audio en streaming y la ventana concreta no se especifica |
| Tipos de cuantizacion | no disponible; el repositorio (0,2 GB) sugiere pesos en bf16/fp16 (2 bytes por parametro) |
| Idiomas soportados | no disponible; la model card no declara idiomas |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (formato MLX) |
| Tipo de tarea | diarizacion de hablantes y deteccion de actividad de voz (VAD) |
| Entrada | audio mono a 16 kHz |
| Resolucion temporal | 10 ms |
| Maximo de hablantes | 8 |
| Biblioteca de inferencia | mlx-audio |
| Modelo base | nvidia/Nemotron-3-Diarization |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo como un streaming Sortformer, una familia de arquitecturas de diarizacion extremo a extremo basada en transformer que predice directamente la actividad de cada hablante en lugar de encadenar etapas separadas de segmentacion, embedding y clustering. La prediccion se emite a 10 ms de resolucion sobre audio mono de 16 kHz, y el modelo puede mantener la identidad de los hablantes a lo largo del tiempo mediante un mecanismo denominado AOSC y una cola FIFO, lo que permite consumir resultados incrementales sin reasignar identificadores entre fragmentos.

No se dispone de informacion sobre el numero de tokens o horas de audio empleadas en el entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. La model card de esta conversion remite explicitamente a la model card del modelo original de NVIDIA para consultar datos de entrenamiento, evaluacion y licencia; esa informacion no forma parte de los datos proporcionados.

La innovacion principal de esta version concreta no esta en el entrenamiento, sino en la conversion de pesos al formato MLX, que habilita inferencia sobre memoria unificada de Apple Silicon y soporta tanto el procesado por lotes de un fichero completo como la alimentacion de PCM en vivo troceado en bloques de 16 kHz.

## Capacidades

- Diarizacion de hablantes: asigna etiquetas de hablante a segmentos de audio con resolucion de 10 ms.
- Deteccion de actividad de voz (VAD): determina que tramos contienen voz.
- Hasta 8 hablantes simultaneos en la misma grabacion.
- Hablantes solapados: la model card indica que varios hablantes pueden estar activos a la vez.
- Procesamiento por lotes: `model.generate("meeting.wav")` devuelve la diarizacion completa de un fichero.
- Procesamiento en streaming: `model.generate_stream(...)` emite resultados incrementales conservando la identidad de los hablantes.
- Entrada de PCM en vivo: `model.feed(chunk, state)` con estado creado por `model.init_streaming_state()`, y volcado final mediante `model.feed([], state, final=True)`.
- Marcas de tiempo absolutas dentro de la grabacion.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio generativo, tool calling y uso como agente: no aplica, este modelo no cubre esas capacidades.
- Capacidades multilingues: no disponible; la tarea es acustica y la model card no declara idiomas.
- Identificacion de personas: no soportada; las etiquetas son identificadores genericos asignados por orden de aparicion.

## Casos de uso

- Transcripcion de reuniones con etiquetado por hablante: se combina la salida de diarizacion con un sistema ASR para atribuir cada frase a su interlocutor, usando las marcas de tiempo absolutas y el limite de 8 participantes por reunion.
- Analitica de centros de llamadas: la diarizacion separa al agente del cliente en cada conversacion grabada, lo que permite calcular tiempos de habla, turnos e interrupciones por participante.
- Generacion de subtitulos para podcasts y entrevistas: los segmentos con identificador de hablante se traducen directamente en etiquetas de subtitulo, sin necesidad de anotacion manual.
- Indexacion y busqueda en archivos audiovisuales: al etiquetar que hablante interviene en cada tramo, se pueden construir indices que permitan localizar las intervenciones de una persona concreta dentro de horas de material.
- Transcripcion clinica o de actas: separar las voces del profesional y del paciente (o de los asistentes a una reunion) facilita la revision posterior y el cumplimiento de trazabilidad.
- Asistentes de voz y captura en el dispositivo: al ejecutarse sobre memoria unificada de Apple Silicon, puede integrarse en aplicaciones de escritorio que necesiten distinguir al usuario de otras voces sin enviar audio a la nube.
- Investigacion en procesamiento de habla: sirve como linea base reproducible para experimentos de diarizacion en streaming y para comparar estrategias de manejo de solapamientos.
- Monitorizacion de reuniones en tiempo real: mediante `generate_stream` o `feed` con bloques de PCM de 16 kHz, se puede mostrar quien esta hablando en el momento, con la salvedad de que existe lookahead y hay que volcar el fragmento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de DER (diarization error rate), tasa de falsos positivos de VAD ni comparaciones numericas con otros sistemas, y remite a la model card del modelo original de NVIDIA para los datos de evaluacion.

## Requisitos de hardware

- Peso de los pesos: 0,2 GB en el repositorio, coherente con precision bf16/fp16 sobre 99,3 M de parametros.
- VRAM o memoria unificada estimada para inferencia: del orden de 0,5 a 1 GB contando pesos, buffers de audio y activaciones; no hay cifras oficiales publicadas.
- Plataforma: MLX requiere Apple Silicon (familia M). La version no esta pensada para GPU NVIDIA o AMD.
- GPU recomendadas: no aplica en el sentido habitual; el modelo corre sobre CPU y GPU integradas de los chips Apple M.
- Cabe en hardware de consumo: si, en cualquier Mac con chip M1 o posterior y, previsiblemente, 8 GB de memoria unificada o mas.
- Alternativa en hardware NVIDIA: para CUDA o ROCm hay que usar el modelo original nvidia/Nemotron-3-Diarization con el stack de NVIDIA NeMo, no esta conversion.
- Opciones de despliegue: mlx-audio (Python). No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no cubren esta modalidad de tarea.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada y contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/Nemotron-3-Diarization | 99.263.843 | audio mono 16 kHz, streaming, hasta 8 hablantes | no disponible | openmdw-1.1 | safetensors MLX, biblioteca mlx-audio; solo Apple Silicon |
| nvidia/Nemotron-3-Diarization (modelo base) | no disponible en la informacion proporcionada | audio mono 16 kHz, hasta 8 hablantes | consultar la model card del autor | openmdw-1.1 | formato y stack de NVIDIA NeMo; no disponible en detalle |
| pyannote/speaker-diarization-3.1 (alternativa de la misma categoria) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparacion cuantitativa entre estas opciones no puede realizarse con los datos disponibles: no hay metricas de error de diarizacion publicadas para esta conversion ni cifras comparables de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de atribucion incorrecta de hablante, especialmente en tramos con ruido, musica o voces muy similares.
- Limite de 8 hablantes: las grabaciones con mas participantes no se representan correctamente.
- Etiquetas genericas: los identificadores son de orden de llegada y no identifican personas concretas; no hay reconocimiento de locutor entre grabaciones distintas.
- Solapamiento: la model card advierte de que varios hablantes pueden estar activos simultaneamente, lo que complica el consumo de la salida en aplicaciones que esperan un unico hablante por segmento.
- Streaming con lookahead: el modo incremental mantiene un retardo de decision y exige volcar el fragmento final con `final=True`; quien consuma el flujo en tiempo real debe tenerlo en cuenta.
- Restriccion de plataforma: al ser una conversion MLX, no se ejecuta en GPU NVIDIA o AMD; en esos entornos hay que recurrir al modelo original.
- Idiomas: no se declara ningun conjunto de idiomas soportados en la informacion disponible.
- Licencia: la licencia openmdw-1.1 se hereda del modelo base. No se detallan sus condiciones de uso comercial en la informacion proporcionada; antes de un despliegue en produccion hay que revisar el texto completo de la licencia.
- Evaluacion: no hay resultados de benchmarks ni tasas de error publicadas para esta conversion.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Nemotron-3-Diarization
- Modelo base (NVIDIA): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Biblioteca mlx-audio: https://github.com/Blaizzy/mlx-audio
- Model card del modelo original (datos de entrenamiento, evaluacion y licencia): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Paper, blog o demo especificos: no disponibles en la informacion proporcionada.
