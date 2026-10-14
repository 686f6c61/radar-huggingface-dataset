# mattt/diar-streaming-sortformer-4spk-v2-coreml

## Resumen

Streaming Sortformer 4spk v2 for Core ML es una conversion a Core ML del modelo de diarizacion de hablantes en streaming desarrollado por NVIDIA, `nvidia/diar_streaming_sortformer_4spk-v2`. Lo publica el desarrollador mattt para su proyecto AnySpeechRecognizer. El modelo resuelve el problema de la diarizacion de hablantes: identificar quien habla y cuando lo hace, asignando cada fragmento de audio a uno de hasta cuatro interlocutores simultaneos. A diferencia de los enfoques de diarizacion por clustering (que procesan el audio completo en dos fases), Sortformer produce las probabilidades de actividad directamente y de forma end-to-end.

La relevancia de esta version concreta es que es una conversion optimizada para ejecucion en el dispositivo sobre Apple Silicon, con un pipeline Core ML que divide el calculo en dos programas: un pre-encoder y empaquetado de cache en float32, y el encoder FastConformer, un Transformer y las sigmoides de hablante en float16. Esta pensada para funcionar en un bucle de streaming paso a paso, manteniendo de forma explicita la cache de hablante y la cola FIFO entre inferencias.

El modelo opera sobre ventanas de 80 ms y usa la configuracion de baja latencia de NVIDIA, con 1,04 s de latencia algorítmica (chunk mas contexto derecho). El tamaño del repositorio es de 0,2 GB, lo que refleja pesos cuantizados a float16 mas un pre-encoder en float32. La licencia es CC BY 4.0, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pre-encoder + encoder FastConformer + Transformer + sigmoides de hablante (pipeline Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | cache de hablante de 188 frames y FIFO de 188 frames; chunk de 6 frames con 1 de contexto izquierdo y 7 de contexto derecho |
| Tipos de cuantizacion | Pre-encoder en float32; encoder FastConformer, Transformer y sigmoides en float16 |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | Core ML (`SortformerLowLatency.mlmodelc`, directorio compilado) |
| Tamano del repositorio | 0,2 GB |
| Numero maximo de hablantes | 4 |
| Duracion de frame | 0,08 s (80 ms) |
| Latencia algorítmica | 1,04 s |
| Objetivo de despliegue | iOS 16 y macOS 13 |
| Libreria | coreml |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de diarizacion en streaming derivado de NVIDIA Sortformer. Consta de tres bloques: un pre-encoder que procesa las caracteristicas log-mel y empaqueta la cache de hablante, la FIFO y el chunk; un encoder FastConformer que transforma las representaciones; y un Transformer que produce las predicciones. Unas capas de sigmoide generan, para cada frame de 80 ms, una probabilidad de actividad independiente para cada uno de los cuatro hablantes. La salida `speaker_preds` tiene forma `[1, 390, 4]` y contiene las probabilidades correspondientes a las filas validas de la cache de hablante, despues la FIFO y despues el chunk, en ese orden.

La conversion no ha reentrenado el modelo: parte del checkpoint `diar_streaming_sortformer_4spk-v2.nemo` de NVIDIA en la revision `84edd514b8ef68004c10086918cd62f2148cbd59`. El proceso se realizo con Python 3.12.12, PyTorch 2.7.0, NeMo 2.7.3 y coremltools 9.0, siguiendo la receta del repositorio FluidInference/mobius (Apache-2.0). El llamante debe calcular las caracteristicas log-mel de 128 bins compatibles con NeMo (16 kHz mono, ventana de 25 ms, salto de 10 ms, sin normalizacion) y actualizar la cache de hablante y la FIFO entre pasos con `SortformerModules.streaming_update` de NeMo a partir de `speaker_preds` y `chunk_pre_encoder_embs_out`.

Los parametros de configuracion de streaming son `chunk_len` 6, `chunk_left_context` 1, `chunk_right_context` 7, `fifo_len` 188, `spkcache_len` 188, `spkcache_update_period` 144, `subsampling_factor` 8, `frame_duration` 0,08 y `mel_feature_frames` 48. La conversion no corresponde al checkpoint v2.1, que tiene una licencia diferente.

## Capacidades

- Diarizacion de hablantes en streaming: predice, para cada frame de 80 ms, la probabilidad de actividad de cada uno de hasta cuatro hablantes.
- Procesamiento incremental paso a paso, manteniendo estado entre inferencias mediante cache de hablante y cola FIFO.
- Manejo de escenarios con hasta cuatro interlocutores simultaneos o alternantes.
- Operacion con baja latencia algorítmica (1,04 s), apta para transcripcion en tiempo real acompanada de etiquetado de hablante.
- Ejecucion en el dispositivo sobre Apple Silicon mediante Core ML, sin depender de servidores externos.
- Integracion con pipelines de reconocimiento de voz: el modelo base esta etiquetado como `automatic-speech-recognition` y se usa junto a un reconocedor para anotar quien dice cada fragmento.
- No se especifican capacidades de generacion de texto, codigo, matematicas, vision ni tool calling, ya que es un modelo acustico de diarizacion.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el modelo etiqueta cada segmento de audio con el hablante correspondiente en tiempo real, lo que permite generar actas con intervenciones identificadas sin procesamiento por lotes posterior.
- Subtitulado en directo de entrevistas y podcasts: al operar en streaming con 1,04 s de latencia, permite anadir etiquetas de hablante a los subtitulos mientras se emiten, gestionando hasta cuatro voces.
- Asistentes de voz en el dispositivo para iOS y macOS: al ejecutarse sobre Core ML en Apple Silicon, la diarizacion se realiza localmente sin enviar audio a la nube, lo que resulta relevante para privacidad.
- Analisis de llamadas de atencion al cliente: la separacion entre agente y cliente permite medir turnos de palabra, tiempos de silencio y solapamientos a partir de la secuencia de actividad por hablante.
- Investigacion en linguistica y analisis conversacional: permite estudiar patrones de alternancia de turnos y solapamiento en corpus de audio de hasta cuatro participantes.
- Sistemas de accesibilidad: identifica quien habla en una conversacion para guiar interfaces que resaltan visualmente al interlocutor activo, ejecutandose enteramente en el dispositivo.
- Diarizacion dentro de una app de notas de voz: combinada con un reconocedor, permite dividir automaticamente una grabacion multiparticipante en bloques por hablante en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de DER (Diarization Error Rate), MMLU, HumanEval, GSM8K ni ninguna otra metrica numerica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,2 GB, con pre-encoder en float32 y el resto en float16, lo que sugiere un consumo de memoria bajo.
- GPU recomendadas: el modelo esta disenado para Apple Silicon (CPU/GPU/Neural Engine via Core ML). No se indican requisitos para A100, H100 ni RTX 4090, ya que el formato es exclusivo de Core ML.
- Compatibilidad con GPU de consumo: si, en equipos Apple Silicon (chips de la serie M). El objetivo de despliegue declarado es iOS 16 y macOS 13.
- Opciones de despliegue: Core ML a traves de `SortformerLowLatency.mlmodelc`; el autor proporciona `SortformerDiarizationModel` en el proyecto AnySpeechRecognizer. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia algorítmica de 1,04 s (chunk y contexto derecho). No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Hablantes | Streaming | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| mattt/diar-streaming-sortformer-4spk-v2-coreml | Diarizacion Sortformer | 4 | Si (1,04 s de latencia) | Core ML | CC BY 4.0 | Apple Silicon (Core ML) |
| nvidia/diar_streaming_sortformer-4spk-v2 | Diarizacion Sortformer | 4 | Si | NeMo (.nemo) | CC BY 4.0 | NeMo / PyTorch |
| nvidia/diar_streaming_sortformer-4spk-v2.1 | Diarizacion Sortformer | 4 | Si | NeMo (.nemo) | Licencia distinta a la v2 (no detallada) | NeMo / PyTorch |

El modelo de NVIDIA es el modelo base del que deriva esta conversion; la diferencia principal es el formato (NeMo frente a Core ML) y que esta version esta optimizada para inferencia en el dispositivo sobre Apple Silicon. La variante v2.1 no debe confundirse con esta conversion, ya que tiene una licencia distinta. No se dispone de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo por acento, genero, edad o idioma.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la salida son probabilidades de actividad por hablante que pueden clasificar mal en presencia de solapamiento, ruido o voces similares; la model card no cuantifica estos errores.
- Limitacion de numero de hablantes: el modelo esta disenado para un maximo de cuatro hablantes. Conversaciones con mas participantes no estan cubiertas.
- Requisitos de integracion estrictos: el llamante debe generar caracteristicas log-mel compatibles con NeMo (16 kHz mono, ventana de 25 ms, salto de 10 ms, 128 bins, sin normalizacion) y gestionar la cache de hablante y la FIFO siguiendo el procedimiento de NeMo. Un uso incorrecto de estos pasos degrada la salida.
- Dependencia de plataforma: el formato Core ML limita su uso a iOS 16 y macOS 13 o superiores sobre Apple Silicon. No es portable directamente a CUDA ni a otros runtimes.
- Restricciones de licencia: CC BY 4.0 permite uso comercial siempre que se mantenga la atribucion a NVIDIA y a la conversion. Las redistribuciones deben conservar la atribucion indicada en la model card.
- Version equivocada: la model card advierte explicitamente de que esta conversion no es el checkpoint v2.1, cuya licencia es diferente. No conviene intercambiar los pesos ni asumir los mismos terminos.
- Idiomas: no se especifican idiomas soportados; la diarizacion es una tarea acustica, pero no hay informacion sobre la procedencia de los datos de entrenamiento del modelo base.

## Enlaces

- HuggingFace (esta conversion): https://huggingface.co/mattt/diar-streaming-sortformer-4spk-v2-coreml
- Modelo base de NVIDIA: https://huggingface.co/nvidia/diar_streaming_sortformer-4spk-v2
- Proyecto AnySpeechRecognizer: https://github.com/mattt/AnySpeechRecognizer
- Receta de conversion FluidInference/mobius (Apache-2.0): https://github.com/FluidInference/mobius/tree/26f5fa8059d5ab3d34449adce6ff6ed86734e522/models/speaker-diarization/sortformer-streaming/conversion
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
