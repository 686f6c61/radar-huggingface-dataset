# GetmanY1/wav2vec2-large-conformer-36l-fi-471k

## Resumen

wav2vec2-large-conformer-36l-fi-471k es un modelo de representación de voz (feature extraction) auto-supervisado para finlandés, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación Aalto Speech (Universidad de Aalto), en colaboración con el proyecto de modelos fundacionales de voz monolingües a gran escala. Se trata de un wav2vec 2.0 Large que sustituye el encoder Transformer original por un encoder Conformer de 36 capas, preentrenado sobre 471.000 horas de audio finlandés. Forma parte de la familia de modelos publicados junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

El modelo resuelve el problema de disponer de representaciones acústicas de alta calidad para finlandés, un idioma con recursos limitados en comparación con el inglés, a partir de audio broadcast en bruto. No incluye cabecera CTC ni tokenizer: es un extractor de características que debe afinarse sobre voz transcrita para tareas de reconocimiento automático del habla (ASR). Su relevancia radica en el volumen de datos de preentrenamiento (471K horas filtradas de un corpus bruto de 2,1M horas) y en el análisis arquitectónico a escala que acompaña al paper.

Con 315,9 millones de parámetros reales en safetensors (317M según la model card), dimensión de modelo 640 y feed-forward de 2048, el modelo se posiciona como un baseline fuerte para ASR finlandés y para tareas downstream de voz en ese idioma. La versión afinada para ASR se publica por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con encoder Conformer (36 capas) |
| Parametros totales | 315.896.064 (safetensors); 317M según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) y checkpoint fairseq original (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo es un wav2vec 2.0 Large cuyo encoder es un Conformer de 36 capas con dimensión de modelo 640 y dimensión feed-forward 2048, sumando 317M parámetros. La entrada es audio mono a 16 kHz con `do_normalize=True`. El preentrenamiento se realizó durante 167.000 actualizaciones con una tasa de aprendizaje de 4e-4, procesando aproximadamente 2 minutos de audio por GPU en un clúster de 512 GPUs. El modelo utiliza código de modelado personalizado para reproducir el encoder de fairseq, por lo que requiere `trust_remote_code=True` al cargarse con Transformers.

Los datos de preentrenamiento proceden de 471.000 horas de voz finlandesa: el archivo de radio y televisión de la Agencia Finlandesa de Arte y Cultura (KUVI, anteriormente KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Las 2,1M horas de audio broadcast en bruto se procesaron mediante detección de actividad de voz, deduplicación basada en transcripciones y filtrado por confianza de ASR (τ = −0,10). El artículo analiza además el efecto de distintas arquitecturas (Transformer, Conformer, E-Branchformer) a igual número de parámetros.

## Capacidades

- Extracción de representaciones acústicas auto-supervisadas a partir de audio en finlandés.
- Base para fine-tuning en reconocimiento automático del habla (ASR) mediante la adición de una cabecera CTC o un decodificador.
- Representaciones útiles para tareas downstream de voz: identificación de hablante, detección de emociones, segmentación, clasificación de audio.
- Soporte de audio broadcast real (corpus KAVI), no solo voz limpia de laboratorio.
- No incluye tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta visión, audio generativo ni modo "thinking".
- Capacidad multilingüe limitada al finlandés (modelo monolingüe).

## Casos de uso

- ASR finlandés en producción: se afina el modelo con una cabecera CTC sobre voz transcrita para transcribir audio de dominio público o broadcast; la versión afinada ya publicada sirve como punto de partida.
- Transcripción de archivos audiovisuales: el preentrenamiento sobre el archivo KUVI lo hace adecuado para digitalizar y transcribir material de radio y televisión finlandés con ruido y variabilidad de hablantes.
- Subtitulado automático de contenido finlandés: combinado con un decodificador y un modelo de lenguaje, permite generar subtítulos en emisiones y vídeos.
- Investigación en SSL de voz: sirve como baseline reproducible para comparar arquitecturas (Conformer vs. Transformer vs. E-Branchformer) a igualdad de parámetros.
- Extracción de embeddings para búsqueda por voz: las representaciones pueden indexarse para recuperación de fragmentos de audio por similitud.
- Análisis de corpus parlamentarios y de donaciones de voz: útil para proyectos de investigación que necesiten representaciones acústicas de Lahjoita puhetta o del Parlamento finlandés.
- Detección de actividad de voz y segmentación: las representaciones de capa intermedia pueden alimentar clasificadores de habla/no habla en pipelines de preprocesado.

## Benchmarks y rendimiento

Resultados de WER (%) del modelo afinado para ASR (Tabla III del paper), con recuento de parámetros ajustado. LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = voz broadcast real.

| Modelo | Params | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 24 capas (baseline previo, 158K horas) | 317,4M | 16,86 | 8,29 | 6,94 | 5,86 | 10,69 | 23,60 |
| Transformer, 24 capas | 317,4M | 16,78 | 8,41 | 6,77 | 6,20 | 10,42 | 21,02 |
| Conformer, 24 capas | 317,2M | 16,46 | 8,58 | 6,71 | 4,52 | 9,69 | 19,86 |
| Conformer, 36 capas (este modelo) | 317,1M | 16,36 | 8,16 | 6,81 | 4,28 | 9,43 | 21,02 |
| E-Branchformer, 24 capas | 317,1M | 16,30 | 8,22 | 6,84 | 4,33 | 9,59 | 20,01 |
| E-Branchformer, 36 capas | 317,4M | 16,11 | 8,15 | 6,88 | 5,24 | 9,30 | 20,09 |

Los resultados corresponden a los modelos afinados, no al checkpoint base de extracción de características. Este checkpoint base no tiene benchmarks propios de ASR publicados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp16 (315,9M parámetros × 2 bytes), más overhead de activaciones; en fp32 unos 2,6 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM para inferencia en fp16; A100/H100 para fine-tuning a gran escala (el preentrenamiento usó 512 GPUs).
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, incluso para fine-tuning moderado con batch pequeño.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; fairseq mediante el fork de Getmany1; vLLM y llama.cpp no están soportados de forma nativa para este tipo de modelo (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto/entrada | Rendimiento ASR (WER medio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conformer 36L (este modelo) | 317,1M | audio 16 kHz | CV 4,28; FLEURS 9,43; KAVI 21,02 | Apache 2.0 | Hugging Face |
| Conformer 24L | 317,2M | audio 16 kHz | CV 4,52; FLEURS 9,69; KAVI 19,86 | Apache 2.0 | Hugging Face |
| E-Branchformer 36L | 317,4M | audio 16 kHz | CV 5,24; FLEURS 9,30; KAVI 20,09 | Apache 2.0 | Hugging Face |
| Transformer 24L (baseline) | 317,4M | audio 16 kHz | CV 6,20; FLEURS 10,42; KAVI 21,02 | Apache 2.0 | Hugging Face |

Las cifras de WER son las del modelo afinado correspondiente; el checkpoint base de este repositorio no tiene resultados publicados propios. La comparativa se limita a la familia del paper, ya que no se dispone de datos de otros modelos SSL finlandeses en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo finlandés; no apto para otros idiomas sin reentrenamiento.
- No es un modelo de ASR listo para usar: carece de tokenizer y cabecera CTC; requiere fine-tuning sobre voz transcrita.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de usarlo en producción.
- Riesgo de sesgo hacia el dominio broadcast (radio y televisión): puede degradarse en dominios muy distintos (conversación espontánea, acentos regionales, audio telefónico).
- Riesgo de alucinación en la salida ASR si se usa con decodificadores externos, especialmente en segmentos con ruido o solapamiento de hablantes.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte.
- Sin datos de benchmarks propios del checkpoint base; los publicados corresponden a la versión afinada.
- No disponible información sobre cuantizaciones oficiales ni sobre latencia/throughput en producción.

## Enlaces

- Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-large-conformer-36l-fi-471k
- Versión afinada para ASR: https://huggingface.co/GetmanY1/wav2vec2-large-conformer-36l-fi-471k-finetuned
- Paper: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq: https://github.com/Getmany1/fairseq
- Perfil del autor: https://huggingface.co/GetmanY1
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de LinkedIn de Tamas Grosz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
