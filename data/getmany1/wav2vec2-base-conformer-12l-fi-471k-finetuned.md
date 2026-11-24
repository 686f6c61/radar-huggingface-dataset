# GetmanY1/wav2vec2-base-conformer-12l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-base-conformer-12l-fi-471k-finetuned` es un sistema de reconocimiento automático del habla (ASR) para finés, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnologías del habla de la Universidad Aalto. Parte de un encoder wav2vec 2.0 con arquitectura Conformer de 12 capas y 96,7 millones de parámetros, preentrenado de forma autosupervisada sobre 471.000 horas de audio en finés y posteriormente ajustado con CTC sobre 4.600 horas de habla transcrita.

El modelo resuelve la transcripción de audio en finés en dominios exigentes (habla parlamentaria, broadcast real, corpus de donación de voz) y forma parte de una familia de modelos publicada junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que analiza el efecto de la arquitectura y del filtrado por confianza del ASR a gran escala. Su relevancia radica en que, con un presupuesto de parámetros muy contenido (~97M), supera a los baselines Transformer de tamaño equivalente en la mayoría de conjuntos de evaluación en finés.

La arquitectura Conformer combina atención y convoluciones, lo que se traduce en mejoras notables en WER frente a Transformers puros con el mismo número de parámetros, especialmente en Common Voice (6,46 % frente a 9,74 %) y Lahjoita puhetta (18,89 % frente a 22,28 %). La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder Conformer (12 capas, dim. de modelo 576, dim. feed-forward 2048) |
| Parametros totales | 96.062.306 (~96,7M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; sin límite documentado explícito) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB); también checkpoint original en fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR end-to-end basado en wav2vec 2.0 con encoder Conformer. El preentrenamiento autosupervisado se realizó sobre 471.000 horas de habla en finés procedente del archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura, KUVI (antes Instituto Audiovisual Nacional, KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. El proceso de filtrado de las 2,1 millones de horas de audio bruto incluyó detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza del ASR (τ = −0,10).

El preentrenamiento se ejecutó durante 125.000 actualizaciones con una tasa de aprendizaje de 6e-4, procesando unos 3 minutos de audio por GPU en 512 GPUs. El ajuste fino se realizó con CTC sobre 4.600 horas de habla transcrita (Parlamento finlandés y Lahjoita puhetta) durante 16.000 actualizaciones, con unos 2,5 minutos de audio por GPU en 128 GPUs, congelando el codificador convolucional de características. La entrada es audio mono a 16 kHz con `do_normalize=False`. El modelo requiere `trust_remote_code=True` porque utiliza código de modelado personalizado que reproduce el encoder de fairseq.

## Capacidades

- Reconocimiento automático del habla en finés a partir de audio mono a 16 kHz.
- Transcripción end-to-end con decodificación CTC (greedy o con procesador `Wav2Vec2Processor`).
- Preentrenamiento autosupervisado sobre grandes volúmenes de audio, lo que le confiere robustez ante dominios variados (parlamentario, broadcast, lectura, donación de voz).
- Capacidad de servir como extractor de representaciones acústicas para tareas posteriores (aunque no está documentado explícitamente en la model card).
- No soporta tool calling, function calling, agentes, visión, audio multimodal ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingüe: no disponible (solo finés).

## Casos de uso

- Transcripción de sesiones parlamentarias: el modelo fue ajustado específicamente con el corpus del Parlamento finlandés y obtiene un WER de 10,08 % en FP'16 y 8,07 % en FP'20, lo que lo hace adecuado para generar actas y archivos buscables de debates legislativos.
- Subtitulado automático de contenido broadcast: entrenado con audio de radio y televisión (KAVI), con un WER de 23,71 % en el conjunto KAVI de habla real, útil para subtitulado de archivo audiovisual y accesibilidad.
- Transcripción de entrevistas y corpus orales de investigación: el ajuste sobre Lahjoita puhetta (WER 18,89 %) permite procesar grandes volúmenes de habla espontánea para estudios lingüísticos o de ciencias sociales.
- Evaluación de la calidad del habla en Common Voice: con un WER de 6,46 % en CV 16.1, es adecuado para validar grabaciones de voluntarios y filtrar muestras ruidosas en proyectos de crowdsourcing.
- Integración en pipelines de ASR para finés en producción: al ser un modelo de ~97M de parámetros con licencia Apache 2.0, puede desplegarse en infraestructura modesta y servir como componente de transcripción en aplicaciones de notas de voz, atención al cliente o análisis de llamadas.
- Benchmarking de arquitecturas ASR: sirve como referencia para comparar Conformer frente a Transformer y E-Branchformer con presupuestos de parámetros equivalentes, gracias a la tabla de resultados publicada en el artículo.

## Benchmarks y rendimiento

Resultados de WER (%) del artículo (Tabla III), modelos ajustados con recuentos de parámetros comparables. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla broadcast real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 12 capas (baseline previo, 158K h) | 95,0M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer, 12 capas | 95,0M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer, 18 capas | 95,1M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| **Conformer, 12 capas (este modelo)** | 96,7M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer, 17 capas | 96,5M | 18,50 | 9,83 | 7,94 | 5,69 | 10,56 | 22,71 |
| E-Branchformer, 12 capas | 98,4M | 19,14 | 10,10 | 7,80 | 6,91 | 11,53 | 22,89 |
| E-Branchformer, 17 capas | 96,6M | 18,80 | 9,54 | 7,85 | 6,19 | 11,09 | 22,44 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~96M de parámetros, la inferencia en fp32 requiere aproximadamente 0,4 GB de pesos, más el estado de activaciones y el búfer de audio; en la práctica cabe en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4). Para procesamiento por lotes a gran escala se recomiendan A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas consumer actuales (RTX 3060 en adelante, e incluso en GPUs integradas con suficiente memoria compartida).
- Opciones de despliegue: `transformers` con `AutoModelForCTC` y `trust_remote_code=True`; también puede cargarse con fairseq usando el checkpoint original incluido en el repo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo CTC de ASR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | WER CV | WER KAVI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Conformer 12 capas (este modelo) | 96,7M | no disponible | 6,46 | 23,71 | Apache 2.0 | Hugging Face |
| Transformer 12 capas | 95,0M | no disponible | 9,74 | 24,85 | no disponible | Hugging Face (misma familia) |
| E-Branchformer 12 capas | 98,4M | no disponible | 6,91 | 22,89 | no disponible | Hugging Face (misma familia) |
| Conformer 17 capas | 96,5M | no disponible | 5,69 | 22,71 | no disponible | Hugging Face (misma familia) |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena con audio de broadcast finlandés, parlamento y donaciones de voz; puede tener peor rendimiento con acentos regionales, habla infantil o audio muy ruidoso no representado en el corpus.
- Riesgo de alucinación: como todo sistema CTC, puede generar transcripciones plausibles pero incorrectas en segmentos con ruido, silencios o solapamiento de hablantes; no incluye puntuación ni segmentación de hablantes de forma nativa.
- Limitaciones de contexto o idioma: solo soporta finés; no está diseñado para otros idiomas ni para tareas multimodales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución; el modelo depende de código personalizado (`trust_remote_code=True`), lo que implica revisar el código remoto antes de desplegarlo en producción.
- Caveats para producción: requiere audio a 16 kHz mono con `do_normalize=False`; el checkpoint fairseq original puede necesitar el fork específico del autor; no se documentan cuantizaciones ni optimizaciones de inferencia, por lo que el rendimiento en latencia debe medirse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-conformer-12l-fi-471k-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-conformer-12l-fi-471k
- Artículo: https://arxiv.org/abs/2610.13102
- Repositorio de código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq: https://github.com/Getmany1/fairseq
- Perfil de Yaroslav Getman: https://huggingface.co/GetmanY1
- Perfil de LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de Tamas Grosz: https://huggingface.co/Grosy
- Perfil de LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
