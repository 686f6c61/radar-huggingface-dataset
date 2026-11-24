# GetmanY1/wav2vec2-base-fi-conf030-filter-finetuned

## Resumen

`GetmanY1/wav2vec2-base-fi-conf030-filter-finetuned` es un modelo de reconocimiento automático del habla (ASR) para finés, desarrollado por Yaroslav Getman (grupo de investigación de Aalto University, según el repositorio de código asociado). Se trata de un checkpoint de wav2vec 2.0 Base (12 capas, 768 de dimensión oculta, 95M de parámetros) preentrenado sobre un archivo de audio de televisión y radio finlandesas y ajustado con CTC para transcripción. Forma parte de un ablation de filtrado de datos que sustenta la Figura 1 del artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

El modelo resuelve el problema de construir un sistema ASR monolingüe para finés a partir de datos de radiodifusión sin transcribir, aplicando un filtro de confianza ASR con umbral τ = −0,30 sobre las 890K horas deduplicadas, reteniendo 689K horas (77%). Es relevante porque documenta el impacto de una estrategia concreta de curación de datos a gran escala en el preentrenamiento auto-supervisado de modelos de habla, y porque el autor recomienda explícitamente no usarlo como modelo de producción, sino como referencia comparativa del ablation.

La arquitectura es un transformer wav2vec 2.0 estándar con extractor convolucional de características y cabecera CTC, con 94.397.858 parámetros según los pesos en safetensors. El contexto no aplica en el sentido de LLM: la entrada es audio mono a 16 kHz y la ventana efectiva depende del pipeline de inferencia. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, 768 / 3072) con cabecera CTC |
| Parametros totales | 94.397.858 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada mono a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fi (fines) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq original (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

wav2vec 2.0 Base: extractor convolucional de características seguido de un transformer de 12 capas con dimensión 768 y feed-forward de 3072, más una cabecera lineal CTC para decodificación de caracteres. El preentrenamiento es auto-supervisado (objetivo wav2vec 2.0 con enmascaramiento y cuantización contrastiva), con 125K actualizaciones, learning rate 6e-4 y aproximadamente 3 minutos de audio por GPU en 512 GPUs. Los datos provienen del archivo de radio y televisión de KUVI (antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta; todo pasó por detección de actividad de voz y deduplicación basada en transcripciones antes del filtrado.

La innovación destacable no está en la arquitectura, sino en el pipeline de datos: se aplica un filtro de confianza ASR con umbral τ = −0,30, reteniendo 689K de las 890K horas deduplicadas (77%). El ajuste fino es CTC sobre 4.6K horas de habla transcrita (Parlamento finlandés y Lahjoita puhetta) durante 16K actualizaciones, con el codificador convolucional de características congelado. La entrada es audio mono a 16 kHz y el procesador se usa con `do_normalize=False`.

## Capacidades

- Reconocimiento automático del habla en finés a partir de audio mono a 16 kHz.
- Decodificación CTC greedy mediante `Wav2Vec2ForCTC` y `Wav2Vec2Processor`.
- Salida a nivel de carácter (diccionario de caracteres en `fairseq/dict.ltr.txt`).
- Inferencia con la librería `transformers` y compatible con endpoints.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio generativo ni modo de pensamiento.
- Multilingüismo limitado al finés; no se documentan otras lenguas.
- No se documentan capacidades de diarización, puntuación ni normalización de texto.

## Casos de uso

- Transcripción de archivo audiovisual finlandés: el modelo está preentrenado sobre el archivo de KUVI, por lo que es adecuado para transcribir material de radio y televisión con las mismas características acústicas y de dominio.
- Investigación en curación de datos de habla: sirve como punto de comparación en el ablation de filtrado por confianza ASR (τ = −0,30) frente a otros umbrales, permitiendo medir el efecto del filtrado en el WER final.
- Reproducción de experimentos del artículo: al incluir el checkpoint fairseq original y el diccionario de caracteres, permite reentrenar o evaluar pipelines fairseq además de transformers.
- Transcripción de discurso parlamentario: el ajuste fino se hizo sobre el corpus del Parlamento finlandés, así que es adecuado para ese registro formal y esas condiciones de grabación.
- Transcripción de habla espontánea de Lahjoita puhetta: el otro conjunto de ajuste fino es habla donada, lo que cubre registros más coloquiales dentro del finés.
- Base para ajuste fino adicional en dominios fineses específicos: al ser un modelo Base de 95M de parámetros, se puede reajustar con CTC sobre un corpus pequeño de un dominio concreto (por ejemplo, atención al cliente) con requisitos de cómputo moderados.
- Evaluación comparativa de modelos SSL de habla: útil como referencia en estudios que comparan arquitecturas o estrategias de filtrado, no como sistema de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 94,4M de parámetros; en fp32 ocupa aproximadamente 0,38 GB de pesos, en fp16 unos 0,19 GB. Con activaciones y buffers de decodificación, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no requiere GPU de datacenter. Una RTX 3060, RTX 4060 o superior es suficiente; para lotes grandes, A100 o H100 solo aportan throughput, no viabilidad.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también puede ejecutarse en CPU para audios cortos.
- Opciones de despliegue: `transformers` (PyTorch) con `Wav2Vec2ForCTC`; fairseq para el checkpoint original; exportación a ONNX no documentada; vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf030-filter-finetuned | 94,4M | no aplica (audio) | fi | apache-2.0 | Checkpoint de ablation, τ = −0,30 |
| GetmanY1/wav2vec2-base-fi-conf030-filter (modelo base) | no disponible | no aplica (audio) | fi | no disponible | Modelo del que deriva este checkpoint |
| Modelos principales de la colección GetmanY1/wav2vec2-fi-471k | no disponible | no aplica (audio) | fi | no disponible | Recomendados por el autor para uso general |
| Wav2Vec2 Base multilingüe (facebook/wav2vec2-base-960h) | ~95M | no aplica (audio) | en | apache-2.0 | Referencia de arquitectura, no de idioma |

## Limitaciones y advertencias

- El propio autor indica que este checkpoint existe para comparación dentro del ablation y que, para uso general, deben preferirse los modelos principales del artículo.
- Entrenado exclusivamente en finés; no es válido para otros idiomas sin reajuste.
- El filtrado por confianza ASR con τ = −0,30 descarta el 23% de las horas deduplicadas; el sesgo introducido por ese filtro no está cuantificado en la información disponible.
- Riesgo de alucinación en ASR: la decodificación CTC puede producir texto plausible en segmentos con ruido, música o silencio; no se documenta detección de actividad de voz en el pipeline de inferencia.
- El codificador convolucional se congeló durante el ajuste fino, lo que puede limitar la adaptación a condiciones acústicas muy distintas de las del corpus de ajuste.
- La entrada debe ser mono a 16 kHz y con `do_normalize=False`; un preprocesado incorrecto degrada la transcripción.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía ni se documentan evaluaciones de robustez en producción.
- Sin datos de benchmarks publicados, no es posible estimar el WER esperado en dominios distintos del archivo de KUVI, el Parlamento o Lahjoita puhetta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf030-filter-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf030-filter
- Colección de modelos principales del artículo: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Artículo: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
