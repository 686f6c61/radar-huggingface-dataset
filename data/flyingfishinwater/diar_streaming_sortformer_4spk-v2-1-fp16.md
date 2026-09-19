# flyingfishinwater/diar_streaming_sortformer_4spk-v2.1-fp16

## Resumen

`flyingfishinwater/diar_streaming_sortformer_4spk-v2.1-fp16` es una conversion al formato MLX del modelo `nvidia/diar_streaming_sortformer_4spk-v2.1` de NVIDIA, orientada a diarizacion de hablantes (speaker diarization) y deteccion de actividad de voz (VAD) en tiempo real sobre hardware Apple Silicon. Se trata de un modelo de audio de aproximadamente 118 millones de parametros que recibe audio mono a 16 kHz y produce, fotograma a fotograma, probabilidades de actividad para un maximo de cuatro hablantes simultaneos. La conversion la ha realizado el usuario `flyingfishinwater` con la libreria `mlx-audio` en su version 0.3.2, a partir del archivo `.nemo` original.

La relevancia de esta ficha radica en que combina dos elementos poco habituales: por un lado, la arquitectura Sortformer de NVIDIA, disenada especificamente para diarizacion en streaming con estado persistente en lugar de procesar la senal completa en modo offline; por otro, el soporte nativo de MLX, el framework de Apple, que permite ejecutar el modelo con aceleracion en GPU unificada de los chips de la serie M sin depender de CUDA.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0,2 GB y fue creado el 18 de septiembre de 2026. No se declara licencia ni idiomas soportados en la informacion disponible, lo que constituye una limitacion importante para su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (17 capas) + encoder Transformer (18 capas) + modulos Sortformer |
| Parametros totales | 117.999.368 (~118 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (funciona por chunks en streaming; no se documenta ventana maxima) |
| Tipos de cuantizacion | fp16 (segun el nombre del repositorio); no se documentan otras variantes |
| Idiomas soportados | no disponible (modelo de audio, no text-based; depende del idioma de la senal de entrada) |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX |
| Biblioteca de inferencia | mlx-audio |
| Entrada | audio mono a 16 kHz, 128 bins de mel |
| Salida | probabilidades de actividad de hablante por fotograma |
| Numero maximo de hablantes | 4 |
| Modelo base | nvidia/diar_streaming_sortformer_4spk-v2.1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura combina un extractor acustico FastConformer de 17 capas con un encoder Transformer de 18 capas y modulos Sortformer especificos para la tarea de asignacion de hablantes. El modelo consume espectrogramas de mel de 128 bins calculados sobre audio mono a 16 kHz y emite probabilidades de actividad por hablante en cada fotograma, en lugar de una transcripcion. Se trata, por tanto, de un modelo discriminativo de segmentacion, no de un modelo generativo de lenguaje.

La innovacion principal es el mecanismo de streaming basado en AOSC (Arrival-Order Speaker Cache), que comprime el contexto de largo alcance mediante un cache de hablantes combinado con buffers FIFO para el contexto reciente. El sistema puntua los fotogramas segun la relacion de verosimilitud logaritmica por hablante, lo que refuerza a los hablantes infrarrepresentados en el cache. Ademas, incorpora un perfilado de silencio que rellena los huecos del cache con embeddings de silencio calculados por media movil, y gestiona los limites entre chunks mediante contexto izquierdo y derecho en modo archivo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos detalles corresponden a la model card original de NVIDIA, que no se ha proporcionado en esta busqueda.

## Capacidades

- Diarizacion de hablantes en streaming: identifica hasta cuatro hablantes simultaneos y mantiene el estado entre chunks mediante cache de hablantes y FIFO.
- Deteccion de actividad de voz (VAD): genera probabilidades de actividad por fotograma, utilizables como preprocesado para sistemas ASR.
- Inferencia en modo offline: procesa un archivo de audio completo y devuelve los segmentos etiquetados por hablante.
- Inferencia en streaming desde fichero: `generate_stream` con parametro `chunk_duration` (por ejemplo, 5,0 segundos) y salida incremental de segmentos.
- Streaming en tiempo real desde microfono: API `init_streaming_state()` y `feed(chunk, state, sample_rate=16000)` con estado persistente entre llamadas.
- Gestion de contexto de largo alcance: AOSC puntua y comprime fotogramas relevantes para no perder hablantes que aparecen esporadicamente.
- Manejo de silencios: perfilado de silencio para rellenar huecos del cache y evitar degradacion en tramos sin voz.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente; es exclusivamente un modelo de audio.
- Capacidades multilingues: no documentadas; al operar sobre caracteristicas acusticas, la dependencia del idioma es indirecta y no se especifica en la informacion disponible.

## Casos de uso

- Diarizacion de reuniones en tiempo real: el modelo puede procesar el audio de una videollamada en chunks de 5 segundos y etiquetar quien habla en cada tramo, gracias a la cache de hablantes que mantiene la identidad a lo largo de toda la sesion sin necesidad de reprocesar el audio completo.
- Preprocesado para transcripcion ASR: al generar segmentos con marcas de inicio, fin y hablante, se puede alimentar cada segmento a un modelo de reconocimiento de voz y obtener transcripciones atribuidas, un flujo habitual en actas automaticas y subtitulado.
- Analisis de llamadas de atencion al cliente: la deteccion de turnos de palabra y la separacion de agente y cliente permiten calcular metricas como tiempo de habla por participante, solapamientos o tiempos de silencio, utiles para control de calidad.
- Investigacion cualitativa y transcripcion de entrevistas: con cuatro hablantes maximo, cubre entrevistas individuales y grupos focales pequenos, segmentando automaticamente las intervenciones para su posterior analisis.
- Monitorizacion de audio en directo: la API de streaming desde microfono permite integrar el modelo en aplicaciones de captura en vivo para detectar actividad de voz y cambios de hablante con baja latencia.
- Postproduccion de audio y video: generacion de pistas de subtitulado con etiquetas de hablante a partir de un archivo, usando el modo offline con umbral de deteccion configurable (`threshold=0.5`).
- Sistemas de turnos para agentes conversacionales: la salida por fotograma puede emplearse como senal de "usuario hablando" para gestionar la interrupcion y el turno en asistentes de voz.
- Indexacion y busqueda de archivos de audio: etiquetar grandes volumenes de grabaciones por hablante facilita busquedas posteriores del tipo "encuentra los tramos en los que habla la persona A".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio convertido no incluye cifras de DER (Diarization Error Rate), tasa de falsa alarma ni metricas de latencia, y tampoco se han proporcionado los datos de la model card original de NVIDIA. No se deben asumir valores procedentes de otras versiones del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,24 GB solo para los pesos en fp16 (118 M de parametros x 2 bytes). El repositorio ocupa 0,2 GB en total.
- Memoria adicional: hay que sumar el estado de streaming (cache de hablantes, buffers FIFO) y las activaciones de las 35 capas; el consumo real es acotado pero no se documenta una cifra oficial.
- Plataforma objetivo: MLX, por lo que esta pensado para chips de Apple Silicon (serie M) con memoria unificada. No requiere VRAM dedicada en el sentido tradicional.
- GPU compatibles: cualquier Mac con chip de la serie M deberia poder ejecutarlo por el reducido tamano del modelo; no se especifican modelos concretos ni requisitos minimos en la informacion disponible.
- Cabe en hardware de consumo: si, es un modelo de 118 M de parametros, muy por debajo de los umbrales habituales de las GPU de consumo; la restriccion real es el soporte de MLX, no la memoria.
- Opciones de despliegue: `mlx-audio` (instalable con `pip install -U mlx-audio`), con las APIs `load`, `generate`, `generate_stream`, `init_streaming_state` y `feed`. Para el modelo original en formato NeMo se puede usar la herramienta de conversion incluida: `python -m mlx_audio.vad.models.sortformer.convert`.
- Latencia y throughput: no disponibles. Dependen del chip Apple concreto, del tamano de chunk configurado y de si se usa streaming o modo offline.

## Comparativa con modelos similares

La informacion disponible no incluye datos de rendimiento de alternativas, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flyingfishinwater/diar_streaming_sortformer_4spk-v2.1-fp16 | ~118 M | no disponible | no disponible | no disponible | MLX (Apple Silicon) |
| nvidia/diar_streaming_sortformer_4spk-v2.1 | no disponible | no disponible | no disponible | no disponible | formato NeMo (`.nemo`), modelo base del anterior |

No se dispone de informacion sobre otros modelos comparables de diarizacion en streaming en el material proporcionado.

## Limitaciones y advertencias

- Limite estricto de cuatro hablantes: el modelo no esta disenado ni entrenado para escenarios con mas participantes simultaneos.
- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base de NVIDIA antes de cualquier despliegue en produccion.
- Dependencia de la plataforma: los pesos estan en formato MLX y requieren Apple Silicon; no son directamente utilizables en CUDA, ROCm ni CPU convencional sin reconvertir desde el modelo original.
- Autor y model card inconsistentes: el identificador del repositorio pertenece a `flyingfishinwater`, mientras que el README se refiere a `mlx-community` y a una ruta de carga `mlx-community/diar_streaming_sortformer_4spk-v2.1-fp16`. Conviene verificar cual es la ruta correcta antes de usar los ejemplos de codigo.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Riesgo de precision en la diarizacion: no se publican cifras de DER ni de tasa de confusion de hablantes, por lo que se desconoce el comportamiento en condiciones de ruido, solapamiento de voces o acentos diversos.
- Limitaciones de idioma no documentadas: aunque el modelo opera sobre caracteristicas acusticas, no se especifica su comportamiento en distintos idiomas ni en audio no nativo.
- Sensibilidad a la calidad del audio: la entrada debe ser mono a 16 kHz; fuentes con ruido de fondo, reverberacion o grabaciones telefonicas muy comprimidas pueden degradar la deteccion.
- Sin benchmarks publicados: no se pueden comparar sus resultados con alternativas de la misma categoria a partir de la informacion disponible.
- Fecha de creacion anomala: el repositorio figura creado el 18 de septiembre de 2026, dato que conviene contrastar directamente en HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/flyingfishinwater/diar_streaming_sortformer_4spk-v2.1-fp16
- Modelo base: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Libreria mlx-audio (mencionada en la model card, instalable con `pip install -U mlx-audio`): no se proporciona URL en la informacion disponible
- Paper o blog tecnico de Sortformer: no disponible en la informacion proporcionada
