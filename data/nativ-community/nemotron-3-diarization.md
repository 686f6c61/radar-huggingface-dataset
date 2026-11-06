# nativ-community/Nemotron-3-Diarization

## Resumen

Nemotron-3-Diarization es un modelo de diarizacion de hablantes (speaker diarization) desarrollado originalmente por NVIDIA y convertido a formato MLX por el usuario nativ-community para su uso con la libreria mlx-audio en hardware Apple Silicon. El modelo resuelve el problema de segmentar una grabacion de audio en funcion de quien habla en cada momento, prediciendo hasta ocho hablantes simultaneos con una resolucion temporal de 10 ms a partir de audio mono de 16 kHz. Con aproximadamente 99,3 millones de parametros, es un modelo compacto orientado a inferencia eficiente, no a generacion de texto.

La relevancia actual del modelo radica en su capacidad de operar en modo streaming: procesa fragmentos de audio PCM de forma incremental manteniendo la identidad de los hablantes a traves de mecanismos AOSC (arrival-order speaker cache) y FIFO, lo que lo hace adecuado para transcripcion de reuniones en tiempo real, subtitulado y analisis de llamadas. La version publicada en este repositorio es una conversion del checkpoint original de NVIDIA al ecosistema MLX, lo que permite ejecutarlo en Macs con chip Apple sin depender de CUDA.

Esta ficha describe la conversion MLX alojada en nativ-community; los detalles de entrenamiento, evaluacion y licencia remiten al modelo original de NVIDIA. La informacion disponible en la model card es limitada y se limita a la interfaz de uso y a las caracteristicas funcionales basicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (diarizacion de hablantes en streaming) |
| Parametros totales | 99.263.843 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de streaming no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre senal acustica, no sobre texto) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (checkpoint MLX) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Streaming Sortformer, un modelo de diarizacion disenado para producir etiquetas de hablante de forma incremental sobre flujos de audio. Segun la model card, el modelo predice hasta ocho hablantes con una resolucion de 10 ms a partir de audio mono muestreado a 16 kHz, y mantiene la coherencia de las identidades de hablante entre fragmentos mediante un mecanismo AOSC combinado con una cola FIFO. El modelo tambien incorpora deteccion de actividad de voz (voice activity detection), tal como refleja el pipeline_tag del repositorio.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales mas alla de las descritas en la model card. La conversion a MLX se realizo a partir del checkpoint original de NVIDIA y el checkpoint MLX publicado es copia del alojado en mlx-community/Nemotron-3-Diarization. Para datos de entrenamiento y evaluacion, la model card remite explicitamente a la model card upstream de NVIDIA.

## Capacidades

- Diarizacion de hablantes: identifica hasta ocho hablantes simultaneos en audio mono de 16 kHz.
- Resolucion temporal de 10 ms en las etiquetas de hablante.
- Procesamiento en streaming: la funcion `generate_stream` devuelve resultados incrementales conservando las identidades de hablante.
- Entrada de PCM en vivo mediante `model.feed(chunk, state)` con chunks mono de 16 kHz y un estado inicializado con `model.init_streaming_state()`.
- Volcado del ultimo fragmento parcial y del lookahead con `model.feed([], state, final=True)`.
- Timestamps absolutos dentro de la grabacion.
- Manejo de solapamiento: varios hablantes pueden estar activos simultaneamente.
- Deteccion de actividad de voz integrada.
- No realiza identificacion de personas: las etiquetas son identificadores genericos en orden de aparicion.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el modelo segmenta la reunion en turnos de habla con marcas temporales absolutas, lo que permite alinear una transcripcion ASR con cada participante y generar actas con intervenciones atribuidas.
- Subtitulado en directo: gracias al modo streaming con `generate_stream`, se pueden emitir etiquetas de hablante a medida que llega el audio, utiles para subtitulos que indiquen quien habla en retransmisiones o clases.
- Analisis de llamadas de atencion al cliente: la diarizacion separa agente y cliente en grabaciones mono, permitiendo calcular tiempos de habla, solapamientos e interrupciones por participante.
- Investigacion cualitativa y analisis de entrevistas: procesamiento por lotes de entrevistas grabadas para obtener segmentos por hablante que agilicen la codificacion manual o automatica posterior.
- Sistemas de reuniones y videoconferencia: integracion del feed PCM en vivo para etiquetar hablantes en tiempo real en aplicaciones de colaboracion que ya capturan audio a 16 kHz.
- Preprocesado para pipelines de ASR multi-hablante: la salida de segmentos con hablante y timestamps sirve como entrada para separar o enrutar audio hacia modelos de reconocimiento de voz especificos por interlocutor.
- Ejecucion local en Apple Silicon: al estar en formato MLX, permite desplegar diarizacion en Macs sin GPU NVIDIA, util para prototipado y procesamiento de audio sensible sin salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 99,3 millones de parametros en safetensors y un repositorio de 0,2 GB, el modelo es de tamano reducido y cabe holgadamente en memoria unificada de equipos Apple Silicon.
- GPU recomendadas: el checkpoint esta en formato MLX, por lo que el hardware objetivo son chips Apple (series M1, M2, M3, M4 y superiores). No se indica soporte para CUDA en esta conversion.
- Cabe en GPU consumer: si, en el ecosistema Apple Silicon; no se dispone de datos para GPUs NVIDIA consumer con este checkpoint concreto.
- Opciones de despliegue: paquete `mlx_audio` (carga con `mlx_audio.vad.load`), con API de inferencia por fichero (`generate`) y en streaming (`generate_stream`, `feed`). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| nativ-community/Nemotron-3-Diarization (esta ficha) | 99,3 M | no disponible | Diarizacion streaming, hasta 8 hablantes | openmdw-1.1 | safetensors (MLX) |
| nvidia/Nemotron-3-Diarization | no disponible en la informacion | no disponible | Diarizacion streaming | openmdw-1.1 | no disponible |
| mlx-community/Nemotron-3-Diarization | no disponible en la informacion | no disponible | Diarizacion streaming | no disponible | MLX |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de otros desarrolladores en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con modelos de la competencia.

## Limitaciones y advertencias

- El modelo no identifica personas: las etiquetas de hablante son identificadores genericos asignados por orden de aparicion, no identidades biometricas.
- Limite de ocho hablantes simultaneos; escenarios con mas participantes requeriran estrategias adicionales.
- Entrada restringida a audio mono de 16 kHz; otro formato exige remuestreo y downmix previos.
- Riesgo de confusion de hablantes en voces similares, cambios de turno muy rapidos o solapamientos prolongados; no se han publicado tasas de error (DER) en la informacion disponible.
- La model card no documenta sesgos acusticos por idioma, genero, edad o acento; al depender de la senal de voz, podria presentar diferencias de rendimiento entre poblaciones no evaluadas publicamente.
- Para uso comercial debe consultarse la licencia openmdw-1.1 y la model card upstream de NVIDIA, ya que esta conversion no detalla condiciones adicionales.
- La informacion de entrenamiento y evaluacion no esta incluida en este repositorio; cualquier decision de produccion deberia basarse en la documentacion del modelo original.
- El checkpoint esta orientado a MLX; no es directamente desplegable en stacks CUDA sin conversion adicional.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/nativ-community/Nemotron-3-Diarization
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Checkpoint MLX de referencia: https://huggingface.co/mlx-community/Nemotron-3-Diarization
- Libreria mlx-audio: https://github.com/Blaizzy/mlx-audio
