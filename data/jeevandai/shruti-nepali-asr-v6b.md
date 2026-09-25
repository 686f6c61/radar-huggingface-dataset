# JeevanDai/shruti-nepali-asr-v6b

## Resumen

Shruti Nepali ASR — v6b es un modelo de reconocimiento automatico del habla (ASR) para nepalí, publicado por el usuario JeevanDai en HuggingFace. Se trata de un ajuste fino del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, que emplea una arquitectura FastConformer (encoder) combinada con un decodificador RNN-T (transducer) en configuracion streaming. El modelo conserva el tokenizer original de 13.088 tokens del modelo base y esta especializado exclusivamente en el idioma nepalí (`ne`).

El entrenamiento se realizo en dos pases mediante QLoRA sobre una base cuantizada a 4 bits NF4, con adaptadores LoRA de rango 128 y alpha 256 aplicados a las 16 capas superiores del encoder, mientras que el decodificador, el joint network y los proyectores se ajustaron por completo. El primer pase cubrio 936.000 enunciados (aproximadamente 1.045 horas de audio), de los cuales alrededor del 70% eran pseudo-etiquetados con Whisper y el 30% etiquetados por humanos. El segundo pase corrigio el sesgo del corpus excluyendo 22.971 pares audio-transcripcion mal alineados y sobremuestreando 3x las fuentes etiquetadas manualmente.

Su relevancia actual radica en que cubre un idioma con muy pocos recursos ASR disponibles (nepalí) con un modelo de solo 0,6B de parametros y capacidad de decodificacion streaming, lo que lo hace apto para despliegue en hardware modesto. Sin embargo, las cifras de WER publicadas por el propio autor (22,3%-31,0% segun configuracion) indican un rendimiento todavia lejos del nivel de produccion sin supervision humana, y el repositorio contiene un checkpoint de entrenamiento, no pesos de inferencia optimizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T / transducer (decoder y joint), streaming |
| Parametros totales | Aproximadamente 0,6B (heredados del modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en terminos de tokens de texto; el modelo base es de tipo streaming con lookahead de 3 tokens durante el ajuste |
| Tipos de cuantizacion | Base de entrenamiento en 4 bits NF4 (QLoRA, bitsandbytes). No se documentan cuantizaciones de inferencia |
| Idiomas soportados | Nepalí (`ne`) unicamente |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (checkpoint de PyTorch via `torch.save`, incluye `model`, `optimizer`, `scheduler`, `step` y `extra`). No hay safetensors ni GGUF |

Datos adicionales: tamano del repositorio 1,1 GB, tokenizer de 13.088 tokens incluido en `tokenizer/`, 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en la ficha de HuggingFace.

## Arquitectura y entrenamiento

El modelo parte de `nvidia/nemotron-3.5-asr-streaming-0.6b`, una arquitectura FastConformer con decodificador RNN-T orientada a reconocimiento de voz en streaming. La adaptacion al nepalí se hizo con QLoRA: la base se cargo en 4 bits NF4 y se insertaron adaptadores LoRA con rango 128 y alpha 256 sobre las 16 capas superiores del encoder. El decodificador, la red conjunta (joint) y los proyectores se ajustaron de forma completa, no mediante adaptadores. Se mantuvo el tokenizer original de 13.088 tokens, lo que evita reintroducir un vocabulario nuevo y permite reutilizar el alineamiento del modelo base. El ajuste uso un lookahead de streaming de 3 tokens.

El entrenamiento consta de dos fases documentadas en `configs/`. La primera (`finetune_nepali_p1_partial936k_qlora128.yaml`) ejecuto 1 epoca y 14.400 pasos sobre 936.000 enunciados (~1.045 horas), con una composicion aproximada del 70% de audio pseudo-etiquetado con Whisper y 30% etiquetado por humanos. La segunda fase (`finetune_qlora128_v6_baseline_epoch2_human_upweight.yaml` y `..._v6b_finish.yaml`) ejecuto otros 14.400 pasos partiendo del primer pase, excluyendo 22.971 pares audio/transcripcion desalineados segun `eval/bad_pairs_original_tokenizer.json` y sobremuestreando 3x las fuentes etiquetadas por humanos (indicvoices_r, shrutilipi, uttam_parajuli, Bijaya-Khanal-CS). No se documenta uso de RLHF ni DPO, algo esperable en un sistema ASR supervisado. La innovacion tecnica destacable es precisamente el uso agresivo de pseudo-etiquetado Whisper combinado con un pase correctivo de curacion de datos y reponderacion de fuentes humanas.

## Capacidades

- Transcripcion de voz a texto en nepalí, en modalidad streaming (con lookahead de 3 tokens) y en modo por lotes.
- Decodificacion greedy y decodificacion por haz (beam search) configurable; el autor reporta resultados con beam 8.
- Manejo de audio con habla continua y frases cortas, ya que el corpus de entrenamiento incluye prompts de lectura repetidos y frases breves.
- Normalizacion de puntuacion y variantes ortograficas del nepalí en las metricas de evaluacion (la ortografia intercambiable se pliega al calcular WER).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo thinking. Es un modelo puramente ASR.
- No se documenta capacidad multilingue: solo nepalí.

## Casos de uso

- Transcripcion de audio en nepalí para archivado: el modelo puede procesar lotes de grabaciones y generar transcripciones en texto, con la salvedad de que el WER bruto del 25,5% en greedy exige revision humana posterior para contenido critico.
- Generacion de subtitulos para video en nepalí: gracias a la modalidad streaming y al lookahead de 3 tokens, puede emitir texto de forma incremental mientras se reproduce el audio, aunque la puntuacion puede requerir post-procesado.
- Analitica de centros de llamadas en nepalí: transcripcion de conversaciones para posterior busqueda por palabras clave, clasificacion de motivos o control de calidad; el streaming permite procesar llamadas en curso con latencia reducida.
- Anotacion asistida de corpus: el modelo puede generar pseudo-etiquetas para nuevos datos de audio en nepalí, que despues se corregirian manualmente, replicando la propia estrategia usada en su entrenamiento.
- Dictado y entrada de voz en aplicaciones locales: con solo 0,6B de parametros y cuantizacion a 4 bits, es viable ejecutarlo en una GPU de gama media para transcripcion en tiempo real de notas de voz.
- Investigacion en ASR de bajos recursos: sirve como punto de partida para estudiar tecnicas de QLoRA y curacion de pseudo-etiquetas en idiomas con pocos datos etiquetados, ya que el repositorio incluye los configs exactos y los resultados de evaluacion.
- Monitorizacion de emisiones de radio o television en nepalí: transcripcion continua de flujos de audio para indexacion y busqueda de contenido, siempre con un umbral de confianza que filtre segmentos de baja calidad.
- Prototipado de asistentes de voz en nepalí: la arquitectura RNN-T streaming es adecuada para integracion en pipelines de reconocimiento en vivo, aunque la ausencia de licencia clara limita su uso comercial.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el propio autor sobre un conjunto de validacion limpio de 4.537 enunciados. El WER esta normalizado (se pliegan la puntuacion y las variantes ortograficas intercambiables del nepalí). La columna "texto no visto" corresponde a los 337 enunciados de validacion cuya transcripcion no aparece nunca en los datos de entrenamiento.

| Configuracion | Texto no visto (337 utts) | Todas las utts (4.537) | WER bruto, todas |
|---|---|---|---|
| Tras el pase 1, greedy | 36,7% | 25,3% | 27,35% |
| v6b, greedy | 32,4% | 23,5% | 25,5% |
| v6b, beam 8 | 31,0% | 22,3% | No disponible |

Advertencia del propio autor: el 92,6% de las transcripciones de validacion si aparecen en los datos de entrenamiento (prompts de lectura repetidos y frases cortas), por lo que la cifra sobre el conjunto completo sobreestima la generalizacion. Ademas, 3.638 de las 4.537 referencias de validacion son pseudo-etiquetas de Whisper, no transcripciones humanas verificadas.

No se han publicado resultados comparativos con otros sistemas ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 0,6B de parametros, no confirmada por el autor): aproximadamente 2,4 GB en fp32, 1,2 GB en fp16/bf16 y del orden de 0,4-0,6 GB con las capas de 4 bits mas el overhead de activaciones y buffers.
- El codigo de carga del autor (`load_finetuned_checkpoint`) requiere una GPU CUDA, porque las capas de 4 bits de bitsandbytes y el entrenamiento QLoRA no funcionan en CPU de forma directa.
- El checkpoint `model.pt` incluye estado del optimizador y del scheduler, por lo que el archivo ocupa bastante mas que los pesos puros (repositorio de 1,1 GB); si se desea solo inferencia conviene extraer unicamente el diccionario `model`.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4-6 GB de VRAM es suficiente para inferencia en 4 bits. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan; las GPU de gama alta solo aportan ventaja en throughput por lotes.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (RTX 3050 en adelante), siempre que se disponga de CUDA. No se documenta soporte de CPU ni de Apple Silicon.
- Opciones de despliegue: no hay soporte conocido para vLLM, llama.cpp, Ollama ni TGI, ya que no existen pesos en formato GGUF ni integracion con `transformers`. El unico camino documentado es el codebase propio `nemotron_asr`, cargando `model.pt` con `load_finetuned_checkpoint`.
- Latencia y throughput: no disponibles. El modelo es streaming con lookahead de 3 tokens, lo que en principio permite transcripcion en tiempo real, pero no se publican mediciones de RTF ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti Nepali ASR v6b | ~0,6B | Streaming, lookahead 3 tokens | Nepalí | No disponible | Checkpoint PyTorch en HuggingFace |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6B | Streaming | Multilingue (segun modelo base) | No disponible en esta informacion | Modelo base de NVIDIA |
| OpenAI Whisper large-v3 | 1,55B | Ventanas de 30 s, no streaming nativo | 99 idiomas, incluido nepalí | MIT (segun la publicacion original de OpenAI) | Pesos abiertos en multiples repositorios |

El modelo base de NVIDIA es el punto de comparacion mas directo en arquitectura y tamano, pero no se dispone de sus cifras de WER en nepalí para establecer una mejora cuantificada. Whisper large-v3 es la alternativa mas comun para nepalí, con mas parametros, licencia permisiva y soporte amplio de frameworks, pero sin decodificacion streaming nativa y con un coste de inferencia mayor. No hay datos de benchmarks que permitan comparar el rendimiento real de estos sistemas frente a Shruti Nepali ASR v6b en el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Hay que contactar con el autor antes de cualquier despliegue en produccion.
- El repositorio contiene un checkpoint de entrenamiento (`model.pt` con optimizador, scheduler y estado del paso), no pesos de inferencia limpios ni formatos estandar como safetensors o GGUF. Esto complica la integracion con herramientas habituales.
- La carga requiere el codebase `nemotron_asr` y una GPU CUDA, debido a las capas de 4 bits de bitsandbytes. No hay ruta de inferencia en CPU documentada.
- Solo soporta nepalí. No hay capacidad multilingue ni deteccion automatica de idioma.
- Riesgo alto de sobreajuste a los datos de entrenamiento: el 92,6% de las transcripciones del conjunto de validacion aparecen en el corpus de entrenamiento, y el propio autor advierte que la cifra agregada sobreestima la generalizacion. En texto no visto el WER sube al 31,0-32,4%.
- Las referencias de evaluacion son mayoritariamente pseudo-etiquetas de Whisper (3.638 de 4.537), no transcripciones humanas, por lo que las metricas pueden estar sesgadas hacia el estilo y los errores de Whisper.
- El 70% del corpus de entrenamiento es audio pseudo-etiquetado, lo que puede propagar sesgos y errores sistematicos de Whisper al modelo final, incluida la tendencia a "alucinar" texto plausible en segmentos ambiguos o con ruido.
- El WER bruto del 25,5% (greedy) es elevado para transcripcion sin supervision; se recomienda revision humana o umbrales de confianza en cualquier flujo critico.
- No hay model card completa en formato HuggingFace: faltan pipeline, licencia, datos de sesgo, limitaciones declaradas por el autor y guia de uso responsable.
- Sin descargas ni likes registrados en el momento de la consulta, lo que indica que el modelo no ha sido validado por la comunidad.
- La busqueda web no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos no guardan relacion con el proyecto y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JeevanDai/shruti-nepali-asr-v6b
- Modelo base declarado por el autor: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Ficheros internos del repositorio citados en la model card: `model.pt`, `tokenizer/`, `configs/`, `eval/EVALUATION.md`, `eval/bad_pairs_original_tokenizer.json`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web realizada. Los resultados devueltos no estaban relacionados con el modelo.
