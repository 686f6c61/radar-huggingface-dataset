# iky1e/granite-speech-5.0-470m-turboctc-mlx-q8

## Resumen

Este repositorio contiene una conversión a MLX con cuantización de 8 bits (Q8) del modelo IBM Granite Speech 5.0 TurboCTC, un sistema de reconocimiento automático de voz (ASR) en inglés de 470 millones de parámetros. El modelo original, desarrollado por IBM, emplea un encoder conformer con decodificación CTC (Connectionist Temporal Classification) y está diseñado para ofrecer una velocidad de inferencia muy alta (12.600× tiempo real, transcribiendo 3,5 horas de audio por segundo), lo que lo hace adecuado para su despliegue en portátiles, teléfonos y otros dispositivos de borde.

La conversión, realizada por el usuario iky1e, adapta los pesos originales al runtime nativo Granite-MLX para Apple Silicon, aplicando cuantización afín por pesos con grupo de tamaño 128 (y 64 para la capa `encoder.input_linear`). El archivo resultante ocupa 466,03 MiB, un 51,65 % del tamaño del checkpoint original, manteniendo un acuerdo de transcripción a nivel de palabra del 99,88 % respecto al modelo de referencia. Esta versión Q8 es la más equilibrada de la familia de conversiones (FP16, Q8, Q6, Q5, Q4) en términos de tamaño y fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder con CTC (encoder-only, sin decoder autoregresivo) |
| Parametros totales | 470 M (modelo original); 126.235.168 (archivo convertido, segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el runtime Granite-MLX usa chunks de 122,88 s y contexto de 20,48 s) |
| Tipos de cuantizacion | Q8 (este repo); tambien disponibles Q4, Q5, Q6 y FP16 en repos hermanos |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base, Granite Speech 5.0 TurboCTC, es un encoder conformer con atencion por bloques (block self-attention), auto-condicionamiento (self-conditioning) y reduccion temporal (temporal downsampling). La capa de salida produce 16.384 unidades BPE. Se entrena con el objetivo CTC, lo que permite una transcripcion en una sola pasada hacia adelante seguida de decodificacion CTC greedy, sin necesidad de un decoder autoregresivo. Esto explica su altisima velocidad de inferencia.

La conversion a MLX realizada en este repositorio transpone los kernels de las convoluciones depthwise Conv1d de PyTorch al formato MLX, elimina los contadores de batch exclusivos de entrenamiento, convierte los tensores de punto flotante restantes a FP16 y aplica cuantizacion afine solo a los pesos (las activaciones permanecen en punto flotante en tiempo de ejecucion). El checkpoint fuente es la revision `7e74c6438b7cfb5090cb6a131538f5e8515a7de3` del modelo original de IBM, con SHA-256 verificado.

## Capacidades

- Reconocimiento de voz automatico (ASR) en ingles: transcribe audio o video a texto con una sola pasada.
- Decodificacion CTC greedy integrada en el runtime Granite-MLX.
- Velocidad de inferencia muy alta: 12.600× tiempo real (3,5 horas de audio por segundo) en el modelo original.
- Exportacion de transcripciones en multiples formatos: TXT, SRT, WebVTT, JSON, o todos a la vez.
- Compatible con archivos de audio y video comunes a traves de la CLI de Granite-MLX.
- No incluye capacidades de tool calling, vision, traduccion ni generacion de texto (es un modelo solo de transcripcion).

## Casos de uso

- Transcripcion de conferencias y clases: el modelo puede procesar una grabacion de 2 horas en menos de un segundo, lo que lo hace ideal para generar actas o notas de seminarios, como el ejemplo de la prueba de validacion (una clase de Stanford de 101 minutos).
- Subtitulado automatico de videos: la exportacion a SRT o WebVTT permite generar subtitulos para contenido audiovisual de forma casi instantanea, sin necesidad de GPU dedicada.
- Asistentes de voz en dispositivos de borde: al ser un modelo compacto (466 MiB en Q8) y de alta velocidad, puede ejecutarse en portatiles o mini-PCs con Apple Silicon para comandos de voz o dictado local.
- Transcripcion en tiempo real para streaming: su latencia extremadamente baja (12.600× tiempo real) permite transcribir audio en vivo con un retraso minimo, util para subtitulos en directo o reuniones virtuales.
- Archivado y busqueda de audio: convertir grabaciones de reuniones, entrevistas o podcasts a texto para indexarlas y hacerlas buscables en sistemas de gestion documental.
- Integracion en pipelines de procesamiento de medios: al ser un modelo Apache 2.0 y con formato MLX, puede integrarse en flujos de trabajo automatizados en macOS para transcribir lotes de archivos, por ejemplo en aplicaciones de postproduccion o analisis de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, CER, etc.) en la informacion disponible. La model card del autor proporciona dos metricas relevantes de la conversion:

| Variante | Tamano del archivo | Acuerdo con el checkpoint original |
|---|---:|---:|
| IBM source (FP32) | 902,35 MiB | 100,0000 % |
| FP16 | 902,22 MiB | 99,9706 % |
| Q8 (este repo) | 466,03 MiB | 99,8825 % |
| Q6 | 367,51 MiB | 99,6989 % |
| Q5 | 311,22 MiB | 99,4712 % |
| Q4 | 254,93 MiB | 98,4135 % |

El "acuerdo" se calcula como `100 − ediciones Levenshtein a nivel de palabra / palabras de la transcripcion de referencia`, comparando la salida del checkpoint convertido con la del checkpoint original cargado en el mismo runtime. No es WER y no mide la correccion frente a una transcripcion humana. La prueba se realizo sobre una grabacion de 6.118,72 segundos (una clase de Stanford) con 13.615 palabras, usando chunks de 122,88 s, contexto de 20,48 s, activaciones FP16 y decodificacion CTC greedy.

## Requisitos de hardware

- Dispositivos con Apple Silicon (chips M1, M2, M3, M4 o posteriores) gracias al runtime nativo Granite-MLX en Swift.
- Memoria: los pesos Q8 ocupan 466,03 MiB, por lo que caben en cualquier Mac con al menos 8 GB de RAM unificada; el runtime adicional y las activaciones FP16 requieren algo mas, pero es viable en configuraciones de 8 GB.
- GPU: no se requiere GPU discreta; la GPU integrada del chip Apple Silicon es suficiente.
- Opciones de despliegue: CLI de Granite-MLX (`granite-mlx /ruta/al/audio --model iky1e/granite-speech-5.0-470m-turboctc-mlx-q8`). No se menciona soporte para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: el modelo original transcribe a 12.600× tiempo real (3,5 horas de audio por segundo); la version Q8 mantiene una velocidad similar, aunque no se proporciona una medicion exacta para esta cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos ASR en la informacion proporcionada. A continuacion se presenta una comparacion cualitativa basada en las caracteristicas publicas:

| Modelo | Parametros | Arquitectura | Velocidad | Licencia | Formato |
|---|---|---|---|---|---|
| Granite Speech 5.0 TurboCTC (Q8, este repo) | 470 M | Conformer + CTC | 12.600× tiempo real | Apache 2.0 | MLX |
| Whisper tiny (OpenAI) | 39 M | Transformer encoder-decoder | ~10× tiempo real (aprox.) | MIT | PyTorch, ONNX, etc. |
| wav2vec2-base (Meta) | 95 M | Transformer encoder | ~100× tiempo real (aprox.) | Apache 2.0 | PyTorch |

Nota: los datos de velocidad de Whisper y wav2vec2 son estimaciones aproximadas y no provienen de la informacion proporcionada; se incluyen solo como referencia orientativa. No se ha verificado su exactitud.

## Limitaciones y advertencias

- Solo soporta ingles; no es multilingue (la familia Granite Speech incluye variantes para frances, aleman, espanol, portugues y japones, pero este checkpoint concreto es exclusivamente para ingles).
- Es un modelo encoder-only con CTC: no puede generar texto libre, traducir ni realizar tareas de lenguaje mas alla de la transcripcion.
- La cuantizacion Q8 introduce una ligera degradacion respecto al checkpoint original (acuerdo del 99,88 % frente al 100 %); para aplicaciones que requieran la maxima fidelidad, se recomienda usar la version FP16.
- El runtime Granite-MLX es software separado de los pesos; este repositorio no establece la licencia del software, aunque los pesos mantienen la licencia Apache 2.0 del modelo original.
- La validacion se realizo con una unica grabacion (una clase de Stanford); no se han publicado resultados en otros dominios o con multiples hablantes.
- No se proporcionan datos de WER frente a transcripciones humanas, por lo que la calidad real en escenarios diversos no esta documentada.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/iky1e/granite-speech-5.0-470m-turboctc-mlx-q8
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Documentacion de IBM Granite Speech: https://www.ibm.com/granite/docs/models/speech
- Repositorio GitHub de IBM Granite Speech Models: https://github.com/ibm-granite/granite-speech-models
- Documentacion de Transformers para Granite Speech 5: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/granite_speech5.md
- Analisis del modelo (blog externo): https://andresseo.expert/ai/ibms-open-470m-speech-model-transcribes-3-5-hours-in-a-second/
