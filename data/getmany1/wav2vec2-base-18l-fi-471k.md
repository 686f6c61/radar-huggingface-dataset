# GetmanY1/wav2vec2-base-18l-fi-471k

## Resumen
wav2vec2-base-18l-fi-471k es un modelo de representación auto-supervisada del habla (speech SSL) para finlandés, desarrollado por Yaroslav Getman y el equipo de Aalto Speech (Aalto University), en colaboración con Tommi Lehtonen, Tamás Grósz y Mikko Kurimo. Se trata de un encoder Transformer de 18 capas y 95,1 millones de parámetros que ha sido preentrenado sobre 471.000 horas de audio de habla finlandesa, un volumen de datos muy superior al habitual en modelos monolingües de este tamaño.

El modelo no es un sistema ASR listo para usar: no incluye tokenizer ni cabeza CTC. Su función es proporcionar representaciones acústicas de alta calidad que sirven como base para fine-tuning en tareas de reconocimiento automático del habla, y su versión afinada para ASR finlandés se publica por separado. Es relevante porque forma parte de una línea de trabajo que demuestra que el escalado masivo de datos (a partir de 2,1 millones de horas de audio de radiodifusión) y el filtrado por confianza ASR permiten mejorar modelos pequeños sin aumentar parámetros.

La arquitectura es un Transformer estándar de 18 capas con dimensión de modelo 768 y dimensión feed-forward 1536, entrenado con el objetivo wav2vec 2.0. El modelo se publica bajo licencia Apache 2.0 y en formato safetensors (compatible con transformers), además del checkpoint original de fairseq.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder wav2vec 2.0), 18 capas, dim. de modelo 768, dim. feed-forward 1536 |
| Parametros totales | 95.076.864 (95,1 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; sin límite de contexto declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento
El modelo sigue la receta de wav2vec 2.0: un extractor convolucional de características seguido de un encoder Transformer de 18 capas (768 de dimensión, 1536 en la capa feed-forward) que produce representaciones enmascaradas del audio, entrenadas de forma auto-supervisada mediante el objetivo de contraste y diversidad de wav2vec 2.0. La entrada es audio mono a 16 kHz y la configuración de preprocesado indicada por el autor es `do_normalize=False`.

El preentrenamiento se realizó sobre 471.000 horas de habla finlandesa procedente del archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Las 2,1 millones de horas de audio de radiodifusión originales se filtraron mediante detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza ASR con umbral τ = −0,10. El entrenamiento constó de 125.000 actualizaciones con tasa de aprendizaje 6e-4, procesando aproximadamente 3 minutos de audio por GPU en 512 GPUs. El código y las configuraciones están disponibles en el repositorio `aalto-speech/large-scale-monolingual-speech-foundation-models`.

## Capacidades
- Extracción de representaciones acústicas auto-supervisadas del habla finlandesa.
- Base para fine-tuning en reconocimiento automático del habla (ASR) en finlandés.
- Base potencial para otras tareas de habla (diarización, clasificación de audio, etc.) mediante fine-tuning, aunque no se documentan resultados específicos.
- No incluye tokenizer ni cabeza CTC: no genera transcripciones directamente.
- No soporta tool calling, function calling ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades multimodales más allá del audio de entrada.
- Capacidad multilingüe limitada al finlandés.

## Casos de uso
- Fine-tuning para ASR en finlandés: el modelo sirve como inicialización para entrenar un sistema de transcripción sobre corpus anotados como Lahjoita puhetta, el Parlamento finlandés o Common Voice, aprovechando las representaciones preentrenadas con 471.000 horas de audio.
- Transcripción de audio de radiodifusión: al haber sido preentrenado con audio de radio y televisión finlandeses, es adecuado para adaptar sistemas de subtitulado automático en medios públicos.
- Investigación en speech SSL: permite reproducir y comparar arquitecturas (Transformer frente a Conformer o E-Branchformer) con el mismo número de parámetros, tal como se hace en el paper asociado.
- Extracción de embeddings para tareas downstream: las representaciones del encoder pueden alimentar clasificadores de habla (detección de idioma, clasificación de emociones, segmentación) tras un fine-tuning ligero.
- Desarrollo de asistentes de voz en finlandés: integrado en un pipeline con un decodificador entrenado, puede servir para prototipos de reconocimiento de comandos o dictado.
- Evaluación comparativa de modelos de habla: sirve como baseline de 95 M de parámetros en estudios de escalado de datos y arquitecturas para finlandés.

## Benchmarks y rendimiento
Resultados del paper (tabla III) para modelos Base afinados para ASR, con WER (%) en distintos conjuntos de test. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla de radiodifusión real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 12 capas (baseline previo, 158K horas) | 95,0M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer, 12 capas | 95,0M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| **Transformer, 18 capas (este modelo)** | 95,1M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer, 12 capas | 96,7M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer, 17 capas | 96,5M | 18,50 | 9,83 | 7,94 | 5,69 | 10,56 | 22,71 |
| E-Branchformer, 12 capas | 98,4M | 19,14 | 10,10 | 7,80 | 6,91 | 11,53 | 22,89 |
| E-Branchformer, 17 capas | 96,6M | 18,80 | 9,54 | 7,85 | 6,19 | 11,09 | 22,44 |

El modelo de 18 capas mejora al Transformer de 12 capas en todos los conjuntos, pero queda por detrás de las variantes Conformer y E-Branchformer de tamaño similar en la mayoría de métricas.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 95 M de parámetros en fp32, los pesos ocupan aproximadamente 0,38 GB; en fp16, unos 0,19 GB. La memoria total depende de la longitud del audio procesado, no solo del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en fp32; para fine-tuning se recomienda al menos 16 GB (RTX 4090, A100, H100) según el tamaño de lote y la longitud de las secuencias de audio.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090, entre otras.
- Opciones de despliegue: transformers (PyTorch), fairseq para el checkpoint original. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto / datos | WER (CV) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wav2vec2-base-18l-fi-471k (este modelo) | 95,1M | 471K h de audio finlandés | 8,99 | Apache 2.0 | Hugging Face |
| Transformer 12 capas (baseline del paper) | 95,0M | 158K h de audio finlandés | 10,61 | no disponible | no disponible |
| Conformer 17 capas (paper) | 96,5M | 471K h de audio finlandés | 5,69 | no disponible | no disponible |
| E-Branchformer 17 capas (paper) | 96,6M | 471K h de audio finlandés | 6,19 | no disponible | no disponible |

La comparativa se limita a los modelos del propio paper, ya que no se dispone de información sobre otros modelos wav2vec 2.0 finlandeses comparables en la documentación proporcionada.

## Limitaciones y advertencias
- No es un modelo ASR listo para usar: no incluye tokenizer ni cabeza CTC, por lo que requiere fine-tuning sobre habla transcrita para producir transcripciones.
- Entrenado exclusivamente con habla finlandesa: su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos potenciales derivados del corpus de radiodifusión (KUVI/KAVI), que puede sobrerrepresentar ciertos registros, acentos o variedades del finlandés.
- Riesgo de errores en la transcripción tras el fine-tuning, especialmente en audio con ruido, solapamiento de hablantes o acentos poco representados.
- No se documentan resultados de robustez frente a audio telefónico, habla espontánea no broadcast o condiciones acústicas adversas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base no está pensado para producción sin un fine-tuning y una validación específicos.
- El checkpoint fairseq requiere fairseq para cargarse; la integración principal es con transformers.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-18l-fi-471k
- Versión afinada para ASR: https://huggingface.co/GetmanY1/wav2vec2-base-18l-fi-471k-finetuned
- Paper: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Perfil del autor: https://huggingface.co/GetmanY1
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- LinkedIn de Tamás Grósz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
- Perfil de Tamás Grósz en Hugging Face: https://huggingface.co/Grosy
