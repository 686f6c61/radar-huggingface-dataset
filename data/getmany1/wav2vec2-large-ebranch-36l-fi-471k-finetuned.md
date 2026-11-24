# GetmanY1/wav2vec2-large-ebranch-36l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-large-ebranch-36l-fi-471k-finetuned` es un sistema de reconocimiento automatico del habla (ASR) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de tecnologia del habla de la Universidad Aalto (equipo que incluye a Tommi Lehtonen, Tamas Grosz y Mikko Kurimo). Se trata de un modelo wav2vec 2.0 Large cuya pila de codificacion transformer se sustituye por un encoder E-Branchformer de 36 capas, preentrenado de forma auto-supervisada sobre 471.000 horas de audio finlandes y posteriormente ajustado con CTC para transcripcion.

El modelo resuelve el problema de la transcripcion de habla finlandesa en condiciones acusticas diversas, incluyendo audio de radiodifusion real capturado por la agencia finlandesa de arte y cultura (KAVI/KUVI), el parlamento finlandes, Lahjoita puhetta, VoxPopuli y Common Voice. Forma parte de la familia de modelos publicada junto con el articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que analiza a escala el efecto del filtrado por confianza y de la arquitectura del encoder sobre el rendimiento ASR.

Con 316,2 millones de parametros, un contexto de audio de hasta 2 minutos por GPU durante entrenamiento y pesos en safetensors, es relevante para desarrolladores que necesitan un ASR finlandes de alta precision, entrenado con un volumen de datos muy superior al habitual en modelos monolingues, y con licencia Apache 2.0 que permite uso comercial. El modelo requiere `trust_remote_code=True` porque reproduce el encoder original de fairseq mediante codigo custom.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Large con encoder E-Branchformer (36 capas) |
| Parametros totales | 316.232.930 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; entrenamiento con ~2 minutos de audio por GPU) |
| Tipos de cuantizacion | no disponible (pesos safetensors en float32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo transformers) + checkpoint original fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sustituye el bloque transformer estandar de wav2vec 2.0 por un E-Branchformer de 36 capas con dimension de modelo 640 y dimension feed-forward 1280, totalizando 317 millones de parametros. Mantiene el encoder convolucional de extraccion de caracteristicas de wav2vec 2.0 como front-end, congelado durante el ajuste fino. El preentrenamiento auto-supervisado se realizo durante 167.000 updates con learning rate 4e-4 sobre 512 GPU, procesando aproximadamente 2 minutos de audio por GPU.

Los datos de preentrenamiento comprenden 471.000 horas de habla finlandesa: el archivo de radio y television de la agencia finlandesa de arte y cultura (KUVI, anteriormente KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Las 2,1 millones de horas de audio de radiodifusion en bruto pasaron por deteccion de actividad vocal (VAD), deduplicacion basada en transcripciones y filtrado por confianza ASR con umbral tau = -0,10 antes de seleccionar las 471.000 horas finales.

El ajuste fino se realizo con CTC sobre 4.600 horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 25.000 updates en 128 GPU, con congelacion del encoder convolucional. La innovacion tecnica principal es la combinacion de E-Branchformer con preentrenamiento a gran escala y filtrado por confianza, que permite comparar arquitecturas (Transformer, Conformer, E-Branchformer) con recuentos de parametros emparejados.

## Capacidades

- Reconocimiento automatico del habla (ASR) para finlandes con salida a nivel de caracter mediante CTC.
- Transcripcion de audio mono a 16 kHz con normalizacion de entrada (`do_normalize=True`).
- Manejo de audio de dominio amplio: radiodifusion, parlamento, habla espontanea y lectura.
- Decodificacion greedy mediante `argmax` sobre los logits CTC; compatible con `Wav2Vec2Processor` y `AutoModelForCTC`.
- Carga con `trust_remote_code=True` para reproducir el encoder E-Branchformer original de fairseq.
- No soporta tool calling, function calling, agentes, vision ni audio generativo; es exclusivamente un modelo discriminativo de ASR.
- Capacidad multilingue limitada al finlandes; no se documenta transferencia a otros idiomas.

## Casos de uso

- Transcripcion de radiodifusion finlandesa: el modelo esta entrenado especificamente con audio de archivo de television y radio (KUVI/KAVI) y alcanza WER de 20,09 % en ese dominio, por lo que es adecuado para digitalizar y indexar archivos audiovisuales.
- Subtitulado automatico de medios: con salida CTC a nivel de caracter y audio a 16 kHz, puede integrarse en pipelines de generacion de subtitulos para contenido finlandes.
- Actas parlamentarias: el ajuste fino usa el corpus del Parlamento finlandes, lo que lo hace apropiado para transcribir sesiones parlamentarias y generar registros textuales.
- Investigacion en tecnologia del habla: sirve como baseline reproducible para comparar arquitecturas (Transformer, Conformer, E-Branchformer) con parametros emparejados, tal como se documenta en el articulo asociado.
- Evaluacion de modelos SSL monolingues: al formar parte de una familia de modelos entrenados con distintos volumenes de datos, permite analizar el efecto del filtrado por confianza y del tamano del corpus.
- Procesamiento de corpus de habla finlandesa: util para anotar automaticamente Lahjoita puhetta, VoxPopuli o Common Voice con transcripciones de referencia.
- Sistemas de accesibilidad: transcripcion de habla finlandesa para personas con discapacidad auditiva en entornos de radiodifusion o reunion.

## Benchmarks y rendimiento

Resultados de WER (%) del articulo (Tabla III), con recuentos de parametros emparejados. LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = habla de radiodifusion real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 24 capas (baseline previo, 158K horas) | 317,4M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer, 24 capas | 317,4M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| Conformer, 24 capas | 317,2M | 16,46 | 8,58 | 6,71 | 4,52 | 9,69 | 19,86 |
| Conformer, 36 capas | 317,1M | 16,36 | 8,16 | 6,81 | 4,28 | 9,43 | 21,02 |
| E-Branchformer, 24 capas | 317,1M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| E-Branchformer, 36 capas (este modelo) | 317,4M | 16,11 | 8,15 | 6,88 | 5,24 | 9,30 | 20,09 |

El modelo obtiene el mejor WER en Lahjoita puhetta (16,11 %), Parlamento finlandes 2016 (8,15 %) y FLEURS (9,30 %) de la comparativa, mientras que queda por detras de Conformer en Common Voice (5,24 % frente a 4,28 %) y en KAVI (20,09 % frente a 19,86 %).

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,3 GB solo para pesos (316 M parametros), mas activaciones del encoder convolutional y del E-Branchformer; en la practica cabe en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para lotes grandes o transcripcion masiva se recomienda A100 o H100.
- Cabe en GPU consumer: si, con holgura incluso en modelos de gama media-baja.
- Opciones de despliegue: `transformers` con `AutoModelForCTC` y `trust_remote_code=True`, `Wav2Vec2Processor`; el checkpoint original fairseq puede cargarse con el fork del repositorio del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas estan orientadas a LLMs, no a ASR CTC).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El entrenamiento procesaba ~2 minutos de audio por GPU, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/dominio | WER (FLEURS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E-Branchformer 36L (este modelo) | 317,4M | ASR finlandes, 471K h preentrenamiento | 9,30 | Apache 2.0 | Hugging Face + fairseq fork |
| Conformer 36L (misma familia) | 317,1M | ASR finlandes, mismo preentrenamiento | 9,43 | Apache 2.0 (segun familia) | Hugging Face |
| Transformer 24L (baseline previo, 158K h) | 317,4M | ASR finlandes, 158K h | 10,69 | Apache 2.0 (segun familia) | Hugging Face |
| Conformer 24L | 317,2M | ASR finlandes, mismo preentrenamiento | 9,69 | Apache 2.0 (segun familia) | Hugging Face |

La comparativa se limita a la propia familia de modelos del articulo; no se dispone de datos de otros ASR finlandeses comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta finlandes; no se documenta rendimiento en otros idiomas ni capacidad de code-switching.
- Riesgo de alucinacion en ASR: con decodificacion CTC greedy pueden aparecer inserciones o repeticiones en audio ruidoso o con solapamiento de hablantes; no se documenta umbral de confianza por token.
- Rendimiento inferior a Conformer en Common Voice (5,24 % frente a 4,28 %) y en KAVI (20,09 % frente a 19,86 %), por lo que no es la mejor opcion en todos los dominios.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo custom del autor; conviene auditar el codigo antes de desplegarlo en produccion.
- El checkpoint transformers reproduce el encoder fairseq; pueden existir diferencias sutiles frente al checkpoint original en `fairseq/checkpoint.pt`.
- No se documentan variantes cuantizadas ni formatos GGUF/ONNX, lo que limita el despliegue en entornos sin PyTorch.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento (audio de radiodifusion y corpus parlamentario) que puedan afectar a la redistribucion de transcripciones derivadas.
- El modelo se publico en 2026 y no tiene descargas ni likes registrados en Hugging Face, por lo que carece de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-ebranch-36l-fi-471k-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-large-ebranch-36l-fi-471k
- Articulo: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil de Yaroslav Getman: https://huggingface.co/GetmanY1
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Tamas Grosz: https://huggingface.co/Grosy
- LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
