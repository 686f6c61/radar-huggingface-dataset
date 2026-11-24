# GetmanY1/wav2vec2-base-fi-conf025-filter

## Resumen

wav2vec2-base-fi-conf025-filter es un modelo de representación del habla (speech SSL) basado en wav2vec 2.0 Base, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad Aalto (proyecto aalto-speech). Se trata de un checkpoint de ablación: un modelo preentrenado de forma autosupervisada sobre audio de archivo de televisión y radio finlandés, entrenado específicamente para medir el efecto de un filtrado por confianza de ASR con umbral τ = −0,25 sobre los datos de preentrenamiento. Es uno de los modelos que respaldan la Figura 1 del artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

El modelo no es un sistema de reconocimiento automático del habla listo para usar: carece de tokenizer y de cabeza CTC, y su función es proporcionar representaciones acústicas de alta calidad que deben afinarse posteriormente sobre voz transcrita. Su relevancia es metodológica: permite aislar el impacto del filtrado de datos a gran escala (670K horas retenidas de 890K horas deduplicadas) en el rendimiento de modelos SSL monolingües del finlandés.

Con 95 millones de parámetros y arquitectura transformer de 12 capas, es un modelo compacto y desplegable en hardware modesto, orientado a investigación en datos y a la construcción de pipelines ASR en finlandés. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, dimensión 768, FFN 3072) |
| Parametros totales | 95.044.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana dependiente de la tasa de frames) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; cuantización no documentada) |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y fairseq checkpoint.pt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 Base: un extractor convolucional de características seguido de un transformer de 12 capas con dimensión oculta 768 y capa feed-forward de 3072, entrenado con el objetivo autosupervisado de wav2vec 2.0 (predicción de unidades cuantizadas enmascaradas en el espacio latente, con contrastive loss). El preentrenamiento se realizó durante 125K actualizaciones con learning rate 6e-4, sobre 512 GPUs, con aproximadamente 3 minutos de audio por GPU.

Los datos provienen del archivo de radio y televisión de la Agencia Finlandesa de Artes y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Todo el material pasó por detección de actividad de voz (VAD) y deduplicación basada en transcripciones; después se aplicó un filtrado por confianza de ASR con umbral τ = −0,25, reteniendo 670K horas (el 75% de las 890K horas deduplicadas). La entrada es audio mono a 16 kHz con `do_normalize=False`. No se documenta RLHF ni DPO, al tratarse de un modelo puramente autosupervisado.

## Capacidades

- Extracción de representaciones acústicas autosupervisadas para audio de habla en finlandés.
- Base para fine-tuning en tareas de reconocimiento automático del habla (requiere añadir tokenizer y cabeza CTC o un decodificador).
- Base potencial para otras tareas de habla: identificación de idioma, clasificación de emociones, diarización o keyword spotting, previo fine-tuning.
- Procesamiento de audio a 16 kHz mono; no incluye normalización de entrada.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades de visión, audio-video ni generación de texto.
- Capacidad multilingüe limitada al finlandés; no se documenta transferencia a otros idiomas.

## Casos de uso

- Investigación en filtrado de datos SSL: comparar este checkpoint con los demás modelos de la ablación (umbrales τ distintos) para cuantificar el efecto del filtrado por confianza de ASR en el rendimiento final, tal como se plantea en la Figura 1 del artículo.
- Construcción de un sistema ASR en finlandés: fine-tuning sobre un corpus transcrito (por ejemplo, Common Voice fi o Lahjoita puhetta) añadiendo un tokenizer y una cabeza CTC; el modelo base de 95M de parámetros es manejable para iteraciones rápidas.
- Extracción de embeddings para clasificación de audio: usar las representaciones de las capas del transformer como features para tareas de clasificación (emociones, género, calidad de audio) en pipelines de investigación.
- Reproducción de experimentos: servir como punto de partida para replicar los resultados del paper con fairseq o transformers, dado que se incluye el checkpoint original en `fairseq/checkpoint.pt`.
- Prototipado de pipelines de voz en finlandés: al ser un modelo pequeño, permite experimentar con VAD, segmentación y decodificación en entornos de pocos recursos antes de escalar a modelos mayores.
- Benchmarking de modelos SSL: usarlo como referencia base (baseline) frente a modelos preentrenados con más datos o con otros esquemas de filtrado en evaluaciones comparativas de ASR finlandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 (95M parámetros), menos de 0,2 GB en fp16; el cuello de botella real es la memoria del extractor convolucional para audios largos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para inferencia pura.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para audios cortos.
- Opciones de despliegue: transformers (Wav2Vec2Model / Wav2Vec2FeatureExtractor), fairseq para el checkpoint original; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (orientados a modelos de texto).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / datos | Licencia | Disponibilidad |
|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf025-filter | 95M | 670K h filtradas (τ = −0,25) | Apache 2.0 | Hugging Face |
| Modelos principales del paper (colección GetmanY1/wav2vec2-fi-471k) | no disponible | no disponible | no disponible | Hugging Face |
| Otros checkpoints de la ablación de filtrado (mismo autor) | 95M (wav2vec 2.0 Base) | variantes de umbral τ | Apache 2.0 | Hugging Face |
| wav2vec 2.0 Base original (Facebook/Meta) | 95M | 960 h LibriSpeech (inglés) | MIT / Apache 2.0 (según release) | Hugging Face |

La comparación directa con los modelos principales del paper requiere consultar la colección enlazada; los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR listo para producción: carece de tokenizer y de cabeza CTC; requiere fine-tuning sobre voz transcrita.
- Entrenado exclusivamente con habla en finlandés; su uso en otros idiomas no está respaldado y probablemente degrade.
- Al ser un checkpoint de ablación, el propio autor recomienda usar los modelos principales del paper para uso general.
- Riesgo de sesgo hacia el dominio de los datos: audio de archivo de televisión y radio finlandés, con posibles desequilibrios de hablantes, acentos y condiciones acústicas.
- No se documentan evaluaciones de sesgo, robustez ni tasas de error en benchmarks estándar.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el rendimiento en producción recae en quien haga el fine-tuning.
- No se documentan requisitos de normalización de entrada más allá de `do_normalize=False`; un uso incorrecto del feature extractor puede degradar las representaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf025-filter
- Colección de modelos principales del paper: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Paper (arXiv): https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
