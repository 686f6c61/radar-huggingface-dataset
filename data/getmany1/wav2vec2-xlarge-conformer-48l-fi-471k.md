# GetmanY1/wav2vec2-xlarge-conformer-48l-fi-471k

## Resumen

wav2vec2-xlarge-conformer-48l-fi-471k es un modelo de representacion del habla (speech foundation model) auto-supervisado para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en reconocimiento del habla de la Universidad Aalto (Aalto Speech). Se trata de un codificador Conformer de 48 capas y 965 millones de parametros, preentrenado con 471 000 horas de audio finlandes procedente de archivos de radio y television, el parlamento finlandes, VoxPopuli y Lahjoita puhetta. El modelo se publica como parte del trabajo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que analiza como escalar el preentrenamiento auto-supervisado monolingue a partir de audio bruto de radiodifusion.

El modelo no es un sistema ASR listo para usar: es un extractor de caracteristicas (feature-extraction) sin tokenizer ni cabeza CTC, pensado para ser afinado sobre habla transcrita. Su relevancia radica en que demuestra que un corpus de audio bruto de 2,1 millones de horas, filtrado mediante deteccion de actividad de voz, deduplicacion por transcripcion y filtrado por confianza de ASR, puede alimentar un modelo SSL de casi mil millones de parametros con resultados competitivos en finlandes, un idioma de recursos limitados en el ecosistema de modelos del habla.

La arquitectura es un codificador Conformer (transformer con convoluciones) de 48 capas, dimension de modelo 1024 y dimension feed-forward 2768, con 962 864 256 parametros reales segun los pesos safetensors. El modelo usa codigo de modelado personalizado para reproducir el codificador de fairseq, por lo que requiere `trust_remote_code=True` al cargarse con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (wav2vec 2.0 con codificador Conformer), 48 capas |
| Parametros totales | 962 864 256 (965M segun la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana de atencion no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y `fairseq/checkpoint.pt` (checkpoint original fairseq) |

## Arquitectura y entrenamiento

El modelo emplea un codificador Conformer de 48 capas con dimension de modelo 1024 y dimension feed-forward 2768, integrado en el marco de wav2vec 2.0 (preentrenamiento auto-supervisado con enmascaramiento y contraste). La innovacion respecto al wav2vec 2.0 clasico es la sustitucion del bloque transformer por bloques Conformer, que combinan atencion multi-cabeza con convoluciones depthwise para capturar dependencias locales y globales en la senal de audio. El modelo consume audio mono a 16 kHz con `do_normalize=True` y no incluye tokenizer ni cabeza CTC.

El preentrenamiento se realizo sobre 471 000 horas de habla finlandesa: el archivo de radio y television de la Agencia Finlandesa de Arte y Cultura, KUVI (anteriormente Instituto Audiovisual Nacional, KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Las 2,1 millones de horas de audio bruto de radiodifusion pasaron por deteccion de actividad de voz, deduplicacion basada en transcripcion y filtrado por confianza de ASR (tau = -0,10). El entrenamiento consistio en 400 000 actualizaciones con tasa de aprendizaje 1e-4, procesando aproximadamente un minuto de audio por GPU en 512 GPUs. No se menciona uso de RLHF ni DPO, algo esperable en un modelo SSL de representacion del habla.

## Capacidades

- Extraccion de representaciones del habla auto-supervisadas para finlandes, utilizables como base para tareas posteriores.
- Base para reconocimiento automatico del habla (ASR) tras afinado sobre habla transcrita; existe una version afinada en `GetmanY1/wav2vec2-xlarge-conformer-48l-fi-471k-finetuned`.
- Aprendizaje auto-supervisado (self-supervised-learning) sobre audio sin etiquetar, lo que permite aprovechar grandes volumenes de audio bruto.
- Procesamiento de audio mono a 16 kHz con normalizacion de entrada.
- Capacidad de capturar contexto acustico local y global gracias a los bloques Conformer.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de representacion del habla, no un modelo de lenguaje.
- No tiene capacidades de vision, audio generativo ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada al finlandes.

## Casos de uso

- Reconocimiento automatico del habla en finlandes: afinar el modelo sobre un corpus transcrito (por ejemplo, Lahjoita puhetta o el corpus del Parlamento) para obtener un sistema ASR; la version afinada publicada alcanza WER de 3,68 en Common Voice 16.1 y 9,08 en FLEURS.
- Transcripcion de archivos audiovisuales de radiodifusion: el modelo se entreno precisamente con audio de radio y television (KUVI/KAVI), por lo que es adecuado para digitalizar y transcribir archivos historicos de medios finlandeses.
- Subtitulado automatico de contenido en finlandes: usar el modelo como extractor de caracteristicas en un pipeline de ASR para generar subtitulos de videos y programas.
- Investigacion en modelos del habla auto-supervisados: el modelo sirve como punto de partida para estudiar el efecto de la arquitectura (Conformer frente a transformer o E-Branchformer) y del filtrado de datos a escala.
- Reconocimiento de voz para dominio parlamentario o administrativo: el corpus del Parlamento finlandes forma parte del preentrenamiento, lo que favorece el rendimiento en discurso formal y debates.
- Extraccion de embeddings de audio para tareas downstream: clasificacion de hablante, deteccion de emociones o segmentacion de audio, usando las representaciones del codificador como entrada a modelos ligeros.
- Sistemas de transcripcion para servicios publicos en finlandes: al estar bajo licencia Apache 2.0, puede integrarse en productos comerciales de transcripcion sin restricciones de licencia.

## Benchmarks y rendimiento

Resultados de WER (%) de los modelos X-Large afinados, segun la Tabla III del paper, con recuentos de parametros equiparables. LP = Lahjoita puhetta, FP = Parlamento finlandes, CV = Common Voice 16.1, KAVI = habla de radiodifusion real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 48 capas (linea base previa, 158K horas) | 965,5M | 16,37 | 7,81 | 6,43 | 5,42 | 9,96 | 22,42 |
| Transformer, 48 capas | 965,5M | **16,27** | 7,83 | **6,26** | 3,85 | 9,37 | **19,54** |
| Conformer, 48 capas (este modelo) | 964,7M | 17,13 | 7,78 | 6,45 | **3,68** | **9,08** | 20,75 |
| E-Branchformer, 48 capas | 965,6M | 16,74 | **7,63** | 6,38 | 4,45 | 9,13 | 19,96 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 962,9 millones de parametros en precision completa (fp32) se requieren aproximadamente 3,9 GB solo para los pesos, mas memoria para activaciones y buffers de audio; en fp16/bf16, unos 1,9 GB para los pesos. No se especifican cuantizaciones oficiales.
- GPU recomendadas: el preentrenamiento uso 512 GPUs (modelo no especificado en la informacion disponible). Para inferencia y afinado, una GPU con 16-24 GB (RTX 4090, A100 40 GB) es suficiente para el modelo en fp16; el afinado con lotes grandes puede requerir A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8-12 GB de VRAM en fp16, dependiendo del tamano de lote y de la longitud del audio.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (obligatorio por el codigo de modelado personalizado); el checkpoint original fairseq se carga con el fork de fairseq del autor. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de representacion del habla).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (WER CV) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conformer 48L (este modelo) | 964,7M | no disponible | 3,68 | Apache 2.0 | Hugging Face |
| Transformer 48L (mismo paper) | 965,5M | no disponible | 3,85 | Apache 2.0 (presumible, mismo paper) | Hugging Face (repo del autor) |
| E-Branchformer 48L (mismo paper) | 965,6M | no disponible | 4,45 | Apache 2.0 (presumible, mismo paper) | Hugging Face (repo del autor) |
| wav2vec 2.0 XLS-R (Meta) | hasta 2B (variante 128L) | no disponible | no disponible para finlandes en esta informacion | MIT (XLS-R) | Hugging Face |

## Limitaciones y advertencias

- El modelo no es un sistema ASR listo para usar: carece de tokenizer y de cabeza CTC; es necesario afinarlo sobre habla transcrita para transcripcion.
- Solo soporta finlandes; no es multilingue.
- Requiere `trust_remote_code=True` por el codigo de modelado personalizado que reproduce el codificador de fairseq, lo que implica revisar y confiar en el codigo del repositorio antes de ejecutarlo.
- Riesgo de sesgo hacia los dominios del preentrenamiento (radio, television, parlamento), con posible degradacion en acentos, registros coloquiales o audio con ruido no representado.
- No se han publicado datos sobre alucinacion, sesgos demograficos ni evaluaciones de robustez mas alla de los WER de la tabla.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validacion externa.
- El checkpoint fairseq solo carga con el fork especifico del autor, lo que limita la portabilidad a otros entornos fairseq estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-xlarge-conformer-48l-fi-471k
- Version afinada para ASR: https://huggingface.co/GetmanY1/wav2vec2-xlarge-conformer-48l-fi-471k-finetuned
- Paper (arXiv): https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil de Hugging Face del autor: https://huggingface.co/GetmanY1
- Perfil de LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Hugging Face de Tamas Grosz: https://huggingface.co/Grosy
- Perfil de LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
