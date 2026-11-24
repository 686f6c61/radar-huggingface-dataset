# GetmanY1/wav2vec2-xlarge-48l-fi-471k

## Resumen

wav2vec2-xlarge-48l-fi-471k es un modelo de representacion auto-supervisada del habla (speech SSL) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en speech de la Universidad Aalto (proyecto aalto-speech). Se trata del encoder de un sistema wav2vec 2.0 de tipo X-Large con 48 capas Transformer, 1280 dimensiones de modelo y 5120 dimensiones de feed-forward, que suma 965.514.752 parametros reales segun los pesos safetensors del repositorio.

El modelo se preentreno sobre 471.000 horas de habla en finlandes extraidas de un corpus bruto de 2,1 millones de horas de audio de radiodifusion (Radio and Television Archive de la Finnish Arts and Culture Agency, KUVI/KAVI), complementado con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. El pipeline completo de filtrado incluye deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR con umbral tau = -0,10.

Es relevante ahora porque forma parte de una linea de investigacion que escala el preentrenamiento SSL a millones de horas de audio de radiodifusion en un idioma de recursos medios como el finlandes, y porque se publica junto con el paper "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL" (arXiv 2610.13102), que analiza el efecto de la arquitectura y del filtrado por confianza a gran escala. El modelo base no incluye tokenizer ni cabeza CTC: esta pensado como extractor de representaciones para fine-tuning posterior en tareas de ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder wav2vec 2.0 X-Large), 48 capas, dim. modelo 1280, dim. feed-forward 5120 |
| Parametros totales | 965.514.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana de preentrenamiento no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); incluye `fairseq/checkpoint.pt` original |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer puro de 48 capas con dimension de modelo 1280 y feed-forward de 5120, es decir, la configuracion X-Large de wav2vec 2.0 aplicada a un encoder Transformer clasico (no Conformer ni E-Branchformer). La entrada es audio mono a 16 kHz con `do_normalize=True`. El preentrenamiento se realizo durante 400.000 actualizaciones con learning rate 1e-4, consumiendo aproximadamente un minuto de audio por GPU en un cluster de 512 GPUs.

Los datos de preentrenamiento son 471.000 horas de habla en finlandes, obtenidas tras procesar 2,1 millones de horas de audio bruto de radiodifusion mediante deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR (tau = -0,10). Las fuentes son el Radio and Television Archive de la Finnish Arts and Culture Agency, KUVI (antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; se trata de un modelo puramente auto-supervisado sin cabeza de clasificacion.

## Capacidades

- Extraccion de representaciones auto-supervisadas del habla en finlandes a partir de audio mono a 16 kHz.
- Base para fine-tuning en reconocimiento automatico del habla (ASR) en finlandes; existe una version ya ajustada en `GetmanY1/wav2vec2-xlarge-48l-fi-471k-finetuned`.
- Aprendizaje de representaciones acusticas y foneticas utiles para tareas descendentes de speech (ASR, posiblemente keyword spotting o diarizacion tras fine-tuning, aunque no se documenta explicitamente).
- Capacidad multilingue: limitada al finlandes; no se documentan otros idiomas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de audio, no de texto generativo.
- No incluye tokenizer ni cabeza CTC; no genera transcripciones directamente sin fine-tuning.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Fine-tuning para ASR en finlandes: el modelo sirve como inicializacion para entrenar un sistema de transcripcion sobre corpus transcritos (Lahjoita puhetta, Parlamento finlandes, Common Voice), aprovechando las 471.000 horas de preentrenamiento para reducir la cantidad de datos etiquetados necesarios.
- Transcripcion de archivos de radiodifusion: adecuado para procesar audio historico del archivo KUVI/KAVI, ya que el preentrenamiento incluye ese dominio y el modelo obtiene el mejor WER en el conjunto KAVI (19,54 %) entre las arquitecturas comparadas a este tamano.
- Investigacion en speech SSL: util como baseline reproducible para estudiar el efecto del filtrado por confianza de ASR y de la arquitectura (Transformer vs. Conformer vs. E-Branchformer) a escala de cientos de miles de horas.
- Extraccion de embeddings acusticos para tareas descendentes: las representaciones del encoder pueden alimentar clasificadores de emocion, hablante o fonema tras un fine-tuning ligero.
- Sistemas de subtitulado para contenido audiovisual finlandes: partiendo del modelo base y ajustandolo con datos del dominio, se puede construir un pipeline de subtitulado automatico para television y radio.
- Evaluacion comparativa de arquitecturas: permite contrastar el rendimiento de un Transformer de 48 capas frente a Conformer y E-Branchformer con el mismo numero de parametros en benchmarks como FLEURS, Common Voice 16.1 o Finnish Parliament.

## Benchmarks y rendimiento

Resultados de WER (%) de los modelos X-Large ajustados (Tabla III del paper), con recuentos de parametros equivalentes. LP = Lahjoita puhetta, FP = Finnish Parliament, CV = Common Voice 16.1, KAVI = habla de radiodifusion real. Mejores resultados a esta escala en negrita.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 48 capas (baseline previo, 158K horas) | 965,5M | 16,37 | 7,81 | 6,43 | 5,42 | 9,96 | 22,42 |
| **Transformer, 48 capas (este modelo)** | 965,5M | **16,27** | 7,83 | **6,26** | 3,85 | 9,37 | **19,54** |
| Conformer, 48 capas | 964,7M | 17,13 | 7,78 | 6,45 | **3,68** | **9,08** | 20,75 |
| E-Branchformer, 48 capas | 965,6M | 16,74 | **7,63** | 6,38 | 4,45 | 9,13 | 19,96 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,9 GB solo para pesos, mas activaciones; en fp16/bf16 unos 1,9 GB para pesos.
- GPU recomendadas: A100, H100 o V100 para fine-tuning a escala; para inferencia de embeddings basta una GPU con al menos 8-16 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3090, RTX 4090 o RTX 4080 en fp16, siempre que se ajuste el tamano de batch por la longitud de las secuencias de audio.
- Opciones de despliegue: transformers (AutoModel), fairseq (checkpoint original), y potencialmente vLLM/TGI no estan documentados para este modelo; llama.cpp y Ollama no son aplicables de forma nativa a wav2vec2.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento (WER KAVI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-xlarge-48l-fi-471k (este) | 965,5M | audio 16 kHz mono | 19,54 | Apache 2.0 | Hugging Face |
| Transformer 48 capas baseline (158K h) | 965,5M | audio 16 kHz mono | 22,42 | no disponible | no disponible |
| Conformer 48 capas (mismo paper) | 964,7M | audio 16 kHz mono | 20,75 | no disponible | no disponible |
| E-Branchformer 48 capas (mismo paper) | 965,6M | audio 16 kHz mono | 19,96 | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo exclusivamente de finlandes: no soporta otros idiomas y su uso en castellano u otras lenguas requeriria reentrenamiento.
- No es un modelo generativo ni de texto: no puede usarse para chat, codigo, matematicas ni tool calling.
- No incluye tokenizer ni cabeza CTC; sin fine-tuning no produce transcripciones.
- Sesgos: al entrenarse con audio de radiodifusion finlandesa (archivo KUVI/KAVI, Parlamento, VoxPopuli), puede heredar sesgos de dominio, registro formal y variedades dialectales sobrerrepresentadas o infrarepresentadas.
- Riesgo de alucinacion: no aplica en el sentido de texto generativo, pero un fine-tuning ASR sobre este encoder puede producir transcripciones incorrectas en audio ruidoso o con acentos no vistos.
- Limitaciones de contexto: la ventana de audio efectiva no se documenta; secuencias muy largas pueden requerir segmentacion.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de las fuentes de datos originales (KUVI/KAVI, Parlamento, VoxPopuli, Lahjoita puhetta) para usos derivados.
- En produccion, requiere un pipeline de preprocesado (normalizacion, 16 kHz mono) y un decoder externo (CTC o attention) para ASR.

## Enlaces

- Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-xlarge-48l-fi-471k
- Version fine-tuned para ASR: https://huggingface.co/GetmanY1/wav2vec2-xlarge-48l-fi-471k-finetuned
- Paper: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Perfil del autor: https://huggingface.co/GetmanY1
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
