# Mikhailo/nemotron-3.5-asr-streaming-0.6b-onnx-fp16-320ms

## Resumen

Nemotron 3.5 ASR Streaming 0.6B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por NVIDIA, construido sobre una arquitectura FastConformer-RNNT cache-aware con prompt de idioma y aproximadamente 0,6 mil millones de parametros. El modelo esta disenado para transcripcion continua en streaming: en lugar de procesar el audio completo en una sola pasada, consume fragmentos de 320 ms apoyandose en caches de atencion y de convolucion que mantienen el estado entre chunks.

El repositorio que se analiza aqui no es el modelo original, sino una exportacion no oficial a ONNX en fp16 realizada por el usuario Mikhailo, optimizada para GPUs NVIDIA mediante el execution provider CUDA de onnxruntime. Mantiene todas las entradas y salidas de los grafos en fp32, de modo que un runtime escrito para la exportacion fp32 funciona sin cambios, y anade un eje de batch dinamico que permite procesar varios flujos de audio en una sola llamada.

Su relevancia practica esta en el coste de despliegue: el encoder pasa de 2,46 GB en fp32 a 1,23 GB en fp16, con un impacto minimo en calidad (17,45 % de WER en fp32 frente a 17,66 % en fp16 sobre FLEURS ucraniano). Eso lo hace util para transcripcion en tiempo real en GPUs de consumo y para servidores que necesitan multiplexar varios streams simultaneamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT cache-aware (encoder Conformer + decoder LSTM + joiner) con prompt de idioma |
| Parametros totales | 0,6 B (segun el identificador del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de ASR en streaming; usa caches de atencion (24 pares k_cache/v_cache [B,8,56,128]) en lugar de una ventana de contexto de texto |
| Tipos de cuantizacion | fp16 (esta exportacion); fp32 en la exportacion de referencia; no se documentan int8, int4 ni GGUF |
| Idiomas soportados | 40 locales segun la model card del autor del export, mediante prompt de idioma (prompt_ids); la lista concreta no esta disponible en la informacion proporcionada |
| Licencia | OpenMDW-1.1 (NVIDIA OpenMDW License 1.1); etiquetada como "other" en HuggingFace |
| Formato de pesos | ONNX (grafos encoder_320ms_first.onnx, encoder_320ms.onnx, decoder.onnx y joiner.onnx); el modelo base usa el formato de NVIDIA NeMo (no detallado en la informacion disponible) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline RNN-T compuesto por tres grafos independientes. El encoder es un FastConformer cache-aware de 24 capas, con 8 cabezas de atencion y dimension de cabeza 128 (caches k_cache_i y v_cache_i con forma [B,8,56,128] para i = 0..23), al que se suman caches de convolucion (conv1d_cache_i y conv2d_cache_0..2). El decoder es una LSTM con estado h_in/c_in de forma [2,1,640] y salida de 640 dimensiones. El joiner combina el frame del encoder y la salida del decoder para producir logits sobre un vocabulario de 13088 piezas SentencePiece, con el token blank en la posicion 13087.

El preprocesado de audio es log-mel de 128 bins a 16 kHz con salto de 10 ms. El primer chunk se calcula con el grafo encoder_320ms_first, que espera input_features de forma [B,25,128], y cada chunk posterior usa encoder_320ms con forma [B,32,128], arrastrando las caches. La mascara cache_mask se rellena con -1e9 en las posiciones de cache aun no ocupadas. El modelo acepta un prompt de idioma por stream, lo que permite seleccionar el locale dentro de los 40 soportados. La decodificacion se realiza de forma greedy o con beam search sobre decoder y joiner.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La exportacion se genero a partir de scripts derivados de codavidgarcia/nemotron-3.5-asr-streaming-onnx (Apache-2.0): primero una exportacion fp32 con batch dinamico y validacion, y despues una conversion a fp16 mediante convert_fp16.py. La innovacion tecnica principal de esta version es ese batch dinamico: un lote de 3 streams se comporta igual que tres ejecuciones individuales dentro de ~1e-4 segun la comprobacion en fp32 durante la exportacion.

## Capacidades

- Transcripcion de voz a texto en streaming con granularidad de chunk de 320 ms y estado persistente entre chunks.
- Soporte multilingue limitado al prompt de idioma: 40 locales declarados por el autor, con prompt_ids para fijar el idioma por stream.
- Procesamiento por lotes de varios flujos de audio en una sola llamada gracias al eje batch dinamico del encoder.
- Decodificacion RNN-T en modo greedy o beam search.
- Compatibilidad directa con runtimes escritos para la exportacion fp32, ya que todas las entradas y salidas de los grafos permanecen en fp32 aunque el cuerpo del grafo este en fp16.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, vision ni audio generativo: es exclusivamente un modelo ASR.

## Casos de uso

- Subtitulado en directo: el modelo consume audio en fragmentos de 320 ms y emite texto de forma incremental, lo que permite generar subtitulos con una latencia de aproximadamente un tercio de segundo mas el tiempo de computo, adecuado para retransmisiones y eventos en vivo.
- Transcripcion de llamadas en atencion al cliente: al aceptar prompt de idioma por stream y batch dinamico, un unico proceso en GPU puede transcribir varias llamadas concurrentes, cada una con sus propias caches y su idioma, en la misma llamada de inferencia.
- Dictado y asistentes de voz en escritorio: con 1,23 GB de encoder en fp16, el modelo cabe en GPUs de consumo, lo que permite dictado local sin enviar audio a la nube.
- Accesibilidad: generacion de subtitulos en tiempo real para personas con discapacidad auditiva en videoconferencias o aulas, con despliegue on-premise.
- Indexacion y busqueda de audio: transcripcion por lotes de archivos de audio o grabaciones de reuniones para generar indices de texto consultables, incluyendo contenido en varios locales.
- Moderacion y analitica de contenido: transcripcion continua de flujos de audio para detectar terminos o segmentos de interes aguas abajo, aprovechando el modo streaming para actuar con baja latencia.
- Despliegue en servidores con GPUs de gama media: la reduccion de 2,46 GB a 1,23 GB en el encoder permite asignar menos VRAM por instancia y aumentar la densidad de streams por tarjeta.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son la comparativa de WER entre la exportacion fp32 y esta fp16:

| Metrica | fp32 | fp16 (este repositorio) |
|---|---|---|
| FLEURS ucraniano, WER con decodificacion greedy (50 clips, 940 palabras) | 17,45 % | 17,66 % |
| Tamano del encoder | 2,46 GB | 1,23 GB |
| Diferencia entre batch de 3 y ejecuciones individuales | ~1e-4 (comprobacion en fp32 durante la exportacion) | no disponible |

El autor indica expresamente que las cifras de throughput en GPU se anadiran cuando se midan. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros idiomas para este export. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,3 GB para pesos y grafo (repositorio completo de 1,3 GB, encoder fp16 de 1,23 GB), mas el espacio de las caches por stream y las activaciones. No se publican cifras exactas de VRAM en inferencia.
- GPU: cualquier GPU NVIDIA con soporte CUDA para el execution provider CUDA de onnxruntime. No se especifican modelos concretos en la model card.
- GPU de consumo: por tamano de pesos, cabe en tarjetas de gama media y alta (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) con margen amplio; el factor limitante sera el numero de streams concurrentes, no el modelo en si.
- Despliegue: onnxruntime con CUDA EP para esta exportacion; el servidor de referencia es SVB.ASR.Nemo (Rust, onnxruntime), que carga el directorio tal cual mediante NEMO_MODEL_DIR. Tambien es posible usar el resto del ecosistema ONNX (Python, C++, Rust), pero no se documentan integraciones con vLLM, TGI, Ollama o llama.cpp, que no aplican a un modelo ASR de este tipo.
- Latencia: la latencia algoritmica minima viene impuesta por el chunk de 320 ms, a la que hay que sumar el tiempo de computo del encoder, decoder y joiner. El throughput medido no esta disponible.
- Nota sobre CPU: la exportacion esta pensada para GPU en fp16; su ejecucion en CPU no esta documentada y puede no estar optimizada o no estar soportada por el hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados en la informacion proporcionada para los modelos alternativos. La comparacion se limita a caracteristicas estructurales ampliamente conocidas, y los valores no documentados se marcan como no disponibles.

| Modelo | Parametros | Modo de inferencia | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (este export ONNX fp16) | 0,6 B | streaming, chunks de 320 ms | 40 locales (segun el autor) | OpenMDW-1.1 | ONNX fp16 para GPU |
| nvidia/nemotron-3.5-asr-streaming-0.6b (modelo base) | 0,6 B | streaming | 40 locales (segun el autor) | OpenMDW-1.1 | formato original de NVIDIA (no detallado) |
| familia Whisper (por ejemplo, large-v3) | no disponible en la informacion proporcionada | inferencia por ventanas, no streaming nativo | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |
| NVIDIA Parakeet (variantes TDT/RNNT 0,6 B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Para una comparacion rigurosa de WER entre alternativas seria necesario consultar las model cards y los papers de cada modelo, ya que esta ficha no dispone de esos datos.

## Limitaciones y advertencias

- Exportacion no oficial: no esta producida ni respaldada por NVIDIA; cualquier incidencia debe atribuirse al autor del export.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de funcionamiento en produccion.
- Rendimiento medido en un unico escenario: el WER de 17,66 % corresponde a FLEURS ucraniano con decodificacion greedy sobre 50 clips y 940 palabras, una muestra pequena. No se documenta el WER en el resto de locales.
- Sin datos de throughput: no se han publicado cifras de latencia ni de velocidad de inferencia, lo que dificulta dimensionar un despliegue.
- Licencia OpenMDW-1.1: es una licencia especifica de NVIDIA distinta de las licencias permisivas habituales. Hay que revisar sus condiciones antes de un uso comercial, y en HuggingFace aparece etiquetada como "other".
- Precisión numerica: el cuerpo del grafo esta en fp16, lo que introduce una degradacion pequena pero real (0,21 puntos de WER en la prueba publicada). En GPUs sin soporte eficiente de fp16 el rendimiento puede resentirse.
- Riesgo de alucinacion en ASR: como todo modelo RNN-T, puede generar palabras o frases plausibles que no corresponden al audio, especialmente con ruido de fondo, solapamiento de hablantes o audio musical.
- Sesgos acusticos: no se dispone de informacion sobre la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos por acento, dialecto, edad o genero.
- Dependencia de la configuracion: el prompt de idioma, las formas de las caches y la mascara cache_mask deben gestionarse correctamente; un error en su inicializacion degrada la transcripcion de forma silenciosa.
- Ambito funcional limitado: no es un modelo de lenguaje; no admite instrucciones, tool calling ni generacion de texto libre, por lo que no debe evaluarse con benchmarks de LLM.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Mikhailo/nemotron-3.5-asr-streaming-0.6b-onnx-fp16-320ms
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Export ONNX de referencia (Apache-2.0), citado en la model card: https://huggingface.co/codavidgarcia/nemotron-3.5-asr-streaming-onnx
- Servidor de streaming de referencia SVB.ASR.Nemo (Rust, onnxruntime): repositorio mencionado en la model card; URL no disponible en la informacion proporcionada.
