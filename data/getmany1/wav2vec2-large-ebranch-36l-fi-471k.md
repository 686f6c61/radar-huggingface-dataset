# GetmanY1/wav2vec2-large-ebranch-36l-fi-471k

## Resumen

wav2vec2-large-ebranch-36l-fi-471k es un modelo de representacion de voz (feature extraction) en finlandes desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en habla de la Universidad Aalto (Aalto Speech), en colaboracion con el equipo del paper "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". Se trata de un modelo wav2vec 2.0 Large cuyo encoder ha sido sustituido por un E-Branchformer de 36 capas, preentrenado de forma auto-supervisada sobre 471.000 horas de audio en finlandes.

El modelo no es un sistema ASR listo para usar: es un extractor de representaciones acusticas que debe fine-tunearse sobre voz transcrita para tareas de reconocimiento. Su relevancia radica en que demuestra, a escala de 471K horas, que el E-Branchformer supera a Transformer y Conformer con el mismo numero de parametros (317M) en la mayoria de los conjuntos de evaluacion finlandeses, y en que libera tanto los pesos en safetensors como el checkpoint original de fairseq.

Con 316.211.136 parametros reales (317M declarados), contexto de audio de 16 kHz mono y licencia Apache 2.0, es un recurso pensado para investigadores que trabajan en ASR de bajos recursos o en lenguas con pocos modelos SSL disponibles, como el finlandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder E-Branchformer (36 capas) |
| Parametros totales | 316.211.136 (317M declarados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana dependiente del uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo parte del esquema wav2vec 2.0 (preentrenamiento contrastivo auto-supervisado sobre audio crudo) pero reemplaza el encoder Transformer estandar por un E-Branchformer de 36 capas, con dimension de modelo 640 y dimension feed-forward 1280. Esta arquitectura combina atencion global con convoluciones locales y conexiones branch, lo que permite capturar dependencias locales y globales del audio de forma mas eficiente que un Transformer puro. El modelo usa codigo de modelado personalizado para reproducir el encoder de fairseq, por lo que requiere `trust_remote_code=True` al cargarse con transformers.

El preentrenamiento se realizo sobre 471.000 horas de habla finlandesa procedente del archivo de radio y television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Las 2,1M de horas de audio broadcast original pasaron por deteccion de actividad vocal, deduplicacion basada en transcripciones y filtrado por confianza de ASR (tau = -0,10). El entrenamiento consistio en 167.000 actualizaciones con learning rate 4e-4, procesando aproximadamente 2 minutos de audio por GPU en 512 GPUs. No se menciona RLHF ni DPO, ya que es un modelo puramente auto-supervisado.

## Capacidades

- Extraccion de representaciones acusticas auto-supervisadas a partir de audio en finlandes a 16 kHz mono.
- Base para fine-tuning en reconocimiento automatico del habla (ASR) en finlandes; existe una version ya fine-tuneada en `GetmanY1/wav2vec2-large-ebranch-36l-fi-471k-finetuned`.
- Aprendizaje de representaciones utiles para tareas descendentes de voz (clasificacion, diarizacion, keyword spotting) tras el correspondiente fine-tuning.
- Normalizacion de entrada integrada (`do_normalize=True`).
- No incluye tokenizer ni cabeza CTC: no genera texto directamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidad multilingue limitada al finlandes.

## Casos de uso

- Fine-tuning para ASR en finlandes: el modelo se entrena sobre voz transcrita para producir un sistema de reconocimiento; el paper reporta WER de 16,11 en Lahjoita puhetta y 9,30 en FLEURS tras fine-tuning, lo que lo hace competitivo para transcripcion de habla finlandesa.
- Transcripcion de archivos broadcast (radio y television): gracias al preentrenamiento sobre KUVI/KAVI, el modelo esta adaptado al dominio de audio broadcast real, con WER de 20,09 en KAVI, adecuado para digitalizacion y busqueda de archivos audiovisuales.
- Reconocimiento de habla parlamentaria: el corpus del Parlamento finlandes forma parte del preentrenamiento, por lo que el fine-tuning sobre FP'16 y FP'20 (WER 8,15 y 6,88) resulta especialmente adecuado para transcripcion de sesiones parlamentarias y actas automaticas.
- Investigacion en arquitecturas de encoder para SSL de voz: permite comparar E-Branchformer frente a Transformer y Conformer con el mismo presupuesto de parametros (317M), como hace el paper con resultados en seis conjuntos de evaluacion.
- Extraccion de embeddings para pipelines de diarizacion o segmentacion de hablantes: las representaciones auto-supervisadas sirven como entrada a clasificadores aguas abajo en entornos de investigacion.
- Base para ASR de bajos recursos en lenguas finougricas: al estar preentrenado solo en finlandes, puede servir como punto de partida para fine-tuning en variedades cercanas o para estudiar transferencia entre lenguas.
- Reproduccion de experimentos del paper: el checkpoint fairseq incluido permite cargar el modelo con el fork de fairseq del autor y replicar los resultados publicados.

## Benchmarks y rendimiento

Resultados de WER (%) de los modelos Large fine-tuneados, tabla III del paper, con recuento de parametros equivalente. LP = Lahjoita puhetta, FP = Finnish Parliament, CV = Common Voice 16.1, KAVI = habla broadcast real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 24 capas (baseline previo, 158K horas) | 317,4M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer, 24 capas | 317,4M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| Conformer, 24 capas | 317,2M | 16,46 | 8,58 | **6,71** | 4,52 | 9,69 | **19,86** |
| Conformer, 36 capas | 317,1M | 16,36 | 8,16 | 6,81 | **4,28** | 9,43 | 21,02 |
| E-Branchformer, 24 capas | 317,1M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| **E-Branchformer, 36 capas (este modelo)** | 317,4M | **16,11** | **8,15** | 6,88 | 5,24 | **9,30** | 20,09 |

El modelo obtiene el mejor WER en LP, FP'16 y FLEURS, pero queda por detras de Conformer en CV y KAVI. No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,3 GB solo para pesos (317M parametros x 4 bytes), mas activaciones y buffers de audio; en la practica, entre 2 y 4 GB segun longitud del audio y batch.
- En fp16/bf16, los pesos ocupan unos 0,65 GB; el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores.
- GPU recomendadas para fine-tuning: A100 (40/80 GB) o H100 para entrenamiento a escala; el paper uso 512 GPUs procesando 2 minutos de audio por GPU, lo que indica que el preentrenamiento completo requiere un cluster, pero el fine-tuning sobre un unico conjunto es asequible en una sola GPU de 24 GB.
- Despliegue: transformers con `trust_remote_code=True`; el checkpoint fairseq se carga con el fork de fairseq del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de audio de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wav2vec2-large-ebranch-36l-fi-471k (este) | 317M | wav2vec 2.0 + E-Branchformer 36 capas | audio 16 kHz mono | Apache 2.0 | Hugging Face + checkpoint fairseq |
| wav2vec2-large-960h (Facebook/Meta) | 317M | wav2vec 2.0 Transformer | audio 16 kHz mono | Apache 2.0 | Hugging Face |
| XLS-R (Meta) | 300M-2B | wav2vec 2.0 Transformer multilingue | audio 16 kHz mono | MIT (segun version) | Hugging Face |
| WavLM Large (Microsoft) | 317M | Transformer con denoising | audio 16 kHz mono | MIT | Hugging Face |

Frente a wav2vec2-large-960h (solo ingles) y XLS-R (multilingue), este modelo esta especializado en finlandes y entrena sobre 471K horas, muy por encima de los conjuntos tipicos de SSL multilingue. La comparacion de WER directa con esos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en finlandes; no soporta otros idiomas.
- No es un sistema ASR listo para produccion: carece de tokenizer y cabeza CTC, requiere fine-tuning sobre voz transcrita.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de desplegarlo en produccion.
- Sesgos potenciales derivados del corpus de preentrenamiento (audio broadcast de radio y television finlandesa, parlamento, VoxPopuli), que puede sobrerrepresentar registros formales y voces de locutores profesionales.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero el fine-tuning ASR puede producir transcripciones erroneas en audio ruidoso o con acentos no representados.
- Rendimiento inferior a Conformer en Common Voice 16.1 (5,24 frente a 4,28) y en KAVI (20,09 frente a 19,86), por lo que la eleccion de arquitectura depende del dominio objetivo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base sin fine-tuning no produce texto directamente; el uso comercial requiere entrenamiento adicional.
- El checkpoint fairseq solo carga con el fork especifico del autor, lo que anade una dependencia de mantenimiento.
- No se documentan cuantizaciones oficiales ni soporte en runtimes de inferencia estandar para audio.

## Enlaces

- Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-ebranch-36l-fi-471k
- Version fine-tuneada para ASR: https://huggingface.co/GetmanY1/wav2vec2-large-ebranch-36l-fi-471k-finetuned
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil del autor en Hugging Face: https://huggingface.co/GetmanY1
- Perfil de Tamas Grosz en Hugging Face: https://huggingface.co/Grosy
