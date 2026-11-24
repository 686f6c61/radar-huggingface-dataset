# GetmanY1/wav2vec2-large-24l-fi-471k

## Resumen

wav2vec2-large-24l-fi-471k es un modelo de representaciones de voz (speech SSL) basado en wav2vec 2.0 Large con un encoder Transformer de 24 capas, preentrenado de forma auto-supervisada sobre 471.000 horas de audio en finlandés. Lo desarrolla el grupo de investigación Aalto Speech (Yaroslav Getman, Tommi Lehtonen, Tamás Grósz y Mikko Kurimo) y forma parte de la familia de modelos publicada junto con el artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

El modelo no es un sistema de reconocimiento automático del habla (ASR) listo para usar: es un extractor de características acústicas que debe afinarse sobre voz transcrita para tareas posteriores. Su relevancia radica en la escala del preentrenamiento (471K horas, derivadas de 2,1M de horas de audio de radiodifusión tras filtrado) y en que sirve como base para ASR en finlandés con un rendimiento competitivo frente a arquitecturas Conformer y E-Branchformer del mismo tamaño.

Con 317,4 millones de parámetros, dimensión de modelo 1024 y dimensión feed-forward 4096, se distribuye en formato safetensors y también incluye el checkpoint original de fairseq. Está publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Large con encoder Transformer (24 capas) |
| Parametros totales | 317.390.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; sin límite de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 Large: un extractor convolucional de características seguido de un encoder Transformer de 24 capas con dimensión de modelo 1024 y dimensión feed-forward 4096. El preentrenamiento es auto-supervisado (objetivo de enmascaramiento y contraste tipo wav2vec 2.0), con 167.000 actualizaciones, tasa de aprendizaje 4e-4 y aproximadamente 2 minutos de audio por GPU sobre 512 GPUs.

Los datos de preentrenamiento son 471.000 horas de voz en finlandés procedentes del Archivo de Radio y Televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Las 2,1 millones de horas de audio de radiodifusión originales pasaron por detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR (umbral τ = −0,10). La entrada esperada es audio mono a 16 kHz con `do_normalize=True`.

## Capacidades

- Extracción de representaciones acústicas auto-supervisadas de voz en finlandés.
- Base para fine-tuning en reconocimiento automático del habla (ASR) en finlandés.
- Base potencial para otras tareas de voz (diarización, clasificación de habla, etc.) mediante ajuste fino, aunque no se documentan resultados en la información disponible.
- No incluye tokenizer ni cabeza CTC; no genera transcripciones directamente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidad multilingüe: no; entrenado exclusivamente para finlandés.

## Casos de uso

- Reconocimiento automático del habla en finlandés: se afina sobre pares audio-transcripción para construir un sistema ASR; el modelo base aporta representaciones preentrenadas sobre 471K horas, lo que reduce la necesidad de datos etiquetados.
- Transcripción de archivos de radiodifusión: adecuado para dominios de audio real (KAVI), donde el modelo muestra un WER del 21,02 % frente al 23,60 % de la línea base anterior.
- Investigación en modelos fundacionales de voz: sirve como punto de partida para comparar arquitecturas (Transformer, Conformer, E-Branchformer) con el mismo número de parámetros.
- Sistemas de subtitulado para medios finlandeses: tras el ajuste fino con ASR, puede integrarse en pipelines de generación de subtítulos para contenido audiovisual.
- Análisis de corpus parlamentarios: afinado sobre el corpus del Parlamento finlandés, permite transcribir y analizar sesiones parlamentarias.
- Extracción de embeddings para tareas downstream: las representaciones pueden alimentar clasificadores de habla (por ejemplo, detección de emociones o identificación de hablante) tras un ajuste específico.
- Evaluación comparativa de estrategias de filtrado de datos: el artículo documenta el efecto del filtrado por confianza de ASR, útil para equipos que construyan sus propios corpus.

## Benchmarks y rendimiento

Resultados de WER (%) del modelo afinado para ASR (Tabla III del artículo). LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = voz de radiodifusión real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer 24 capas (línea base previa, 158K horas) | 317,4M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer 24 capas (este modelo) | 317,4M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| Conformer 24 capas | 317,2M | 16,46 | 8,58 | 6,71 | 4,52 | 9,69 | 19,86 |
| Conformer 36 capas | 317,1M | 16,36 | 8,16 | 6,81 | 4,28 | 9,43 | 21,02 |
| E-Branchformer 24 capas | 317,1M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| E-Branchformer 36 capas | 317,4M | 16,11 | 8,15 | 6,88 | 5,24 | 9,30 | 20,09 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 317,4M parámetros, en fp32 ocupa aproximadamente 1,3 GB de pesos; en fp16/bf16, unos 0,65 GB. El repositorio completo ocupa 2,5 GB (incluye checkpoint fairseq).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en fp16; para fine-tuning se recomienda A100, H100 o RTX 4090 por el tamaño de lote y la longitud de audio.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores para inferencia; para fine-tuning conviene al menos 16-24 GB.
- Opciones de despliegue: transformers (`AutoModel` + `Wav2Vec2FeatureExtractor`), fairseq (checkpoint original), y frameworks de servicio compatibles con transformers como TGI o vLLM (no verificado en la información disponible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | WER (KAVI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wav2vec2-large-24l-fi-471k (este) | 317,4M | audio 16 kHz | 21,02 | Apache 2.0 | Hugging Face |
| Conformer 24 capas (mismo artículo) | 317,2M | audio 16 kHz | 19,86 | no disponible | no disponible |
| E-Branchformer 24 capas (mismo artículo) | 317,1M | audio 16 kHz | 20,01 | no disponible | no disponible |
| Transformer 24 capas línea base (158K horas) | 317,4M | audio 16 kHz | 23,60 | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo ASR autónomo: carece de tokenizer y cabeza CTC; requiere fine-tuning sobre voz transcrita.
- Solo soporta finlandés; no está diseñado para otros idiomas.
- Sesgos derivados del corpus: audio de radiodifusión, parlamento y donaciones de voz, lo que puede infrarepresentar acentos, dialectos o registros coloquiales.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el ASR derivado puede producir transcripciones incorrectas en audio ruidoso o con solapamiento de hablantes.
- Rendimiento inferior a Conformer y E-Branchformer del mismo tamaño en varios conjuntos (CV, FLEURS, KAVI), aunque mejor que la línea base anterior en KAVI.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los corpus de origen (KUVI, VoxPopuli, Parlamento, Lahjoita puhetta) para usos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-24l-fi-471k
- Versión afinada para ASR: https://huggingface.co/GetmanY1/wav2vec2-large-24l-fi-471k-finetuned
- Artículo: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Perfil del autor: https://huggingface.co/GetmanY1
- LinkedIn de Yaroslav Getman: https://www.linkedin.com/in/yaroslav-getman/
- LinkedIn de Tamás Grósz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
