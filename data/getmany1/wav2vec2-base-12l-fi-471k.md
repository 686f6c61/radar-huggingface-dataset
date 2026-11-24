# GetmanY1/wav2vec2-base-12l-fi-471k

## Resumen

wav2vec2-base-12l-fi-471k es un modelo de representación del habla (speech SSL) de tipo wav2vec 2.0 Base, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnologías del habla de la Universidad Aalto (equipo de Mikko Kurimo). Se trata de un modelo preentrenado de forma auto-supervisada sobre 471.000 horas de audio en finés, extraídas del archivo de radio y televisión de la agencia finlandesa de arte y cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta.

El modelo no es un sistema ASR listo para usar: es un extractor de representaciones acústicas sin tokenizador ni cabeza CTC, pensado para ser afinado posteriormente en tareas de reconocimiento del habla o clasificación. Su relevancia radica en que forma parte de una familia de modelos publicada junto al artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL", que analiza a escala el filtrado por confianza de ASR y la elección de arquitectura para modelos fundacionales monolingües del habla.

La arquitectura es un transformer de 12 capas con dimensión de modelo 768 y dimensión feed-forward 3072, con 95 millones de parámetros totales. La ventana de contexto no aplica en el sentido de los modelos de lenguaje: la entrada es audio mono a 16 kHz procesado por el extractor de características de wav2vec 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder wav2vec 2.0 Base), 12 capas, dim. 768, FFN 3072 |
| Parametros totales | 95.044.608 (95,0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada mono a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); incluye `fairseq/checkpoint.pt` original |
| Tamano del repositorio | 0,8 GB |
| Entrada | audio mono a 16 kHz, `do_normalize=False` |
| Cabecera de salida | ninguna (sin tokenizador ni CTC) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 Base: un extractor convolucional de características seguido de un encoder transformer de 12 capas con dimensión de modelo 768 y dimensión feed-forward 3072. El preentrenamiento es auto-supervisado, con 125.000 actualizaciones y una tasa de aprendizaje de 6e-4, empleando aproximadamente 3 minutos de audio por GPU en 512 GPUs.

Los datos de preentrenamiento proceden de 2,1 millones de horas de audio de radiodifusión en bruto, que se filtraron mediante detección de actividad de voz (VAD), deduplicación basada en transcripciones y filtrado por confianza de ASR con umbral τ = −0,10, resultando en las 471.000 horas finales. Este modelo comparte pesos con `GetmanY1/wav2vec2-base-fi-conf010-filter`, el modelo τ = −0,10 del experimento de ablación de filtrado. No se menciona en la información disponible el uso de RLHF ni DPO, algo esperable en un modelo de representación del habla.

## Capacidades

- Extracción de representaciones acústicas auto-supervisadas del habla en finés.
- Base para afinamiento en reconocimiento automático del habla (ASR) en finés; existe una versión ya afinada en `GetmanY1/wav2vec2-base-12l-fi-471k-finetuned`.
- Base para otras tareas de habla (clasificación, diarización, keyword spotting) tras el correspondiente afinamiento.
- Procesamiento de audio mono a 16 kHz con normalización desactivada (`do_normalize=False`).
- No incluye tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No soporta visión, audio generativo ni modo de razonamiento (thinking mode).
- Capacidad multilingüe: no; está entrenado solo en finés.

## Casos de uso

- Reconocimiento del habla en finés: partir de este checkpoint y afinarlo con transcripciones para construir un sistema ASR monolingüe; el modelo proporciona representaciones acústicas ya adaptadas al dominio del finés.
- Transcripción de archivos audiovisuales de radiodifusión: el preentrenamiento incluye audio de radio y televisión de KUVI, por lo que es adecuado para dominios de broadcast con ruido y solapamientos propios de ese material.
- Transcripción de sesiones parlamentarias: el corpus del Parlamento finlandés forma parte del preentrenamiento, lo que lo hace apropiado para dominios formales y discurso político.
- Investigación en aprendizaje auto-supervisado del habla: sirve como punto de partida reproducible para estudiar el efecto del filtrado por confianza de ASR y de la arquitectura en modelos fundacionales monolingües.
- Extracción de características para tareas downstream de clasificación de audio: las representaciones del encoder pueden alimentar clasificadores de emoción, intención o hablante tras el afinamiento.
- Sistemas de subtitulado en finés para medios públicos: al estar entrenado con material de archivo de radiodifusión, es una base razonable para pipelines de subtitulado automático en ese dominio.
- Benchmarking de arquitecturas: permite comparar el rendimiento de un transformer de 12 capas frente a Conformer y E-Branchformer con parámetros equiparables en tareas ASR en finés.

## Benchmarks y rendimiento

Resultados de WER (%) de los modelos Base afinados, con recuentos de parámetros equiparables (Tabla III del artículo). LP = Lahjoita puhetta, FP = Parlamento finlandés, CV = Common Voice 16.1, KAVI = habla de radiodifusión real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer 12 capas (baseline previo, 158K h) | 95,0 M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| **Transformer 12 capas (este modelo)** | 95,0 M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer 18 capas | 95,1 M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer 12 capas | 96,7 M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer 17 capas | 96,5 M | 18,50 | 9,83 | 7,94 | 5,69 | 10,56 | 22,71 |
| E-Branchformer 12 capas | 98,4 M | 19,14 | 10,10 | 7,80 | 6,91 | 11,53 | 22,89 |
| E-Branchformer 17 capas | 96,6 M | 18,80 | 9,54 | 7,85 | 6,19 | 11,09 | 22,44 |

## Requisitos de hardware

- El modelo tiene 95 M de parámetros, por lo que la inferencia de representaciones cabe holgadamente en cualquier GPU de consumo; en FP32 ocupa del orden de 0,4 GB de pesos, y el repositorio completo pesa 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en FP32 o FP16; una RTX 4090, A100 o H100 son sobredimensionadas para este modelo, pero útiles para el afinamiento con lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090, entre otras.
- Despliegue: compatible con la librería `transformers` (`AutoModel`, `Wav2Vec2FeatureExtractor`); también se puede cargar el checkpoint original de fairseq desde `fairseq/checkpoint.pt`. No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI, que en general no están orientados a este tipo de modelos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento ASR (WER, referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Transformer 12 capas, 471K h fi) | 95,0 M | audio 16 kHz | CV 9,74; KAVI 24,85 | Apache 2.0 | Hugging Face |
| Transformer 18 capas (misma familia) | 95,1 M | audio 16 kHz | CV 8,99; KAVI 23,91 | Apache 2.0 | Hugging Face |
| Conformer 12 capas (misma familia) | 96,7 M | audio 16 kHz | CV 6,46; KAVI 23,71 | Apache 2.0 | Hugging Face |
| E-Branchformer 17 capas (misma familia) | 96,6 M | audio 16 kHz | CV 6,19; KAVI 22,44 | Apache 2.0 | Hugging Face |

Las alternativas comparables disponibles en la información son los demás modelos de la misma familia publicados en el artículo, con recuentos de parámetros equiparables. No se dispone de datos de otros modelos externos de habla en finés para comparar.

## Limitaciones y advertencias

- El modelo no es un sistema ASR listo para usar: carece de tokenizador y de cabeza CTC, por lo que requiere afinamiento con transcripciones para producir texto.
- Solo está entrenado en finés; no ofrece capacidades multilingües.
- Al ser un modelo auto-supervisado, puede heredar sesgos presentes en el audio de radiodifusión de KUVI, el Parlamento finlandés y Lahjoita puhetta (por ejemplo, sesgos de registro formal, de variedad dialectal o de representación de hablantes).
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero un afinamiento posterior puede producir transcripciones incorrectas en dominios alejados del material de preentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de las fuentes de datos originales (KUVI, VoxPopuli, Parlamento finlandés, Lahjoita puhetta) si se va a redistribuir el modelo afinado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks independientes más allá de los del artículo.
- La información sobre cuantización, latencia y throughput no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-12l-fi-471k
- Versión afinada para ASR en finés: https://huggingface.co/GetmanY1/wav2vec2-base-12l-fi-471k-finetuned
- Modelo con pesos idénticos (τ = −0,10): https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf010-filter
- Artículo: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Perfil del autor en Hugging Face: https://huggingface.co/GetmanY1
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/yaroslav-getman/
- Perfil de LinkedIn de Tamás Grósz: https://www.linkedin.com/in/tam%C3%A1s-gr%C3%B3sz-950a049a/
