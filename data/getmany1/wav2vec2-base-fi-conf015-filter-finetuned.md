# GetmanY1/wav2vec2-base-fi-conf015-filter-finetuned

## Resumen

wav2vec2-base-fi-conf015-filter-finetuned es un modelo de reconocimiento automático del habla (ASR) para finlandés, desarrollado por Yaroslav Getman y colaboradores del grupo de investigación en tecnología del habla de la Universidad Aalto (autores del artículo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL"). Se trata de un checkpoint de ablación dentro de un estudio a gran escala sobre modelos fundacionales de voz en finlandés: concretamente, la variante que aplica filtrado por confianza del ASR con umbral τ = −0,15 sobre los datos de preentrenamiento.

El modelo parte de la arquitectura wav2vec 2.0 Base (12 capas transformer, dimensión 768, feed-forward 3072, 95M parámetros) y se preentrena de forma auto-supervisada con 588K horas de audio tras el filtrado (el 66% de las 890K horas deduplicadas), provenientes del archivo de radio y televisión de KUVI (antiguo KAVI), VoxPopuli finlandés, el corpus del Parlamento finlandés y Lahjoita puhetta. Posteriormente se ajusta con CTC sobre 4,6K horas transcritas.

Su relevancia es metodológica más que de uso general: el propio autor indica que este checkpoint existe para comparar con los demás de la ablación y que, para uso general, deben preferirse los modelos principales del artículo. No obstante, es un ASR finlandés funcional, con licencia Apache 2.0 y compatible con la librería transformers y con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, 768 / 3072) |
| Parametros totales | 94.397.858 (~95M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz; sin ventana declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint fairseq original (`fairseq/checkpoint.pt`) |

## Arquitectura y entrenamiento

wav2vec 2.0 es un modelo auto-supervisado de representación del habla: un codificador convolucional de características convierte la onda de audio en representaciones latentes, que alimentan un transformer de 12 capas (768 de dimensión, 3072 en la feed-forward). El preentrenamiento combina una tarea de enmascaramiento contrastivo sobre las representaciones cuantizadas con una pérdida de diversidad de código. Sobre esta base, el ajuste para ASR se realiza con una cabeza CTC, con el codificador convolucional de características congelado.

El preentrenamiento usó 125K actualizaciones, tasa de aprendizaje 6e-4 y unos 3 minutos de audio por GPU en 512 GPU. Los datos brutos (archivo de KUVI, VoxPopuli fi, corpus del Parlamento finlandés y Lahjoita puhetta) pasaron por detección de actividad de voz y deduplicación basada en transcripciones, y después por el filtrado por confianza del ASR con umbral τ = −0,15, que retuvo 588K horas de las 890K deduplicadas. El ajuste fino se hizo con CTC sobre 4,6K horas transcritas (Parlamento finlandés y Lahjoita puhetta) durante 16K actualizaciones. La entrada es audio mono a 16 kHz con `do_normalize=False`. El código y las configuraciones están en el repositorio aalto-speech/large-scale-monolingual-speech-foundation-models.

## Capacidades

- Reconocimiento automático del habla en finlandés con salida CTC (caracteres), decodificable con `Wav2Vec2Processor.batch_decode`.
- Transcripción de audio mono a 16 kHz; requiere normalización previa externa si el audio no está normalizado, ya que el modelo se entrenó con `do_normalize=False`.
- Modelo acústico puro: no incluye modelo de lenguaje externo ni puntuación; la calidad final depende del decodificador que se le acople.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio generativo ni modo de pensamiento.
- Capacidad multilingüe limitada al finlandés; no se declaran otros idiomas.
- Disponible como checkpoint fairseq original además de los pesos transformers.

## Casos de uso

- Transcripción de archivos de radio y televisión en finlandés: el modelo se preentrenó precisamente con el archivo de KUVI, por lo que es adecuado para digitalizar y transcribir fondos audiovisuales con dominio y acústica similares.
- Subtitulado automático de contenido audiovisual finlandés: la salida CTC a nivel de carácter permite alinear y generar subtítulos, aunque requiere un paso posterior de puntuación y segmentación.
- Investigación en modelos fundacionales de voz: sirve como punto de comparación en ablaciones de filtrado de datos frente a los demás checkpoints del artículo.
- Análisis de discurso parlamentario: el ajuste fino incluyó el corpus del Parlamento finlandés, lo que lo hace apropiado para transcribir sesiones y actas con vocabulario institucional.
- Prototipado de ASR en entornos con recursos limitados: con ~95M parámetros y 0,8 GB de repositorio, se puede desplegar en una sola GPU consumer para pruebas y pipelines internos.
- Evaluación de estrategias de filtrado por confianza: permite reproducir el efecto del umbral τ = −0,15 sobre la calidad del ASR en comparación con otras variantes de la ablación.
- Baseline para ajuste fino adicional en dominios finlandeses específicos (médico, legal, atención al cliente), partiendo de un modelo ya adaptado al finlandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Figura 1 del artículo arXiv 2610.13102 para la comparación de la ablación, pero no incluye cifras de WER ni de otros benchmarks en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los ~95M parámetros ocupan unos 0,4 GB; el pico real depende de la longitud del audio de entrada y de las activaciones. En fp16, el peso baja a unos 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; A100, H100 o RTX 4090 no son necesarias para este tamaño, pero aceleran el procesamiento por lotes.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en CPU para audios cortos.
- Opciones de despliegue: transformers (`Wav2Vec2ForCTC` + `Wav2Vec2Processor`), pipeline de ASR de transformers, endpoints compatibles de Hugging Face y fairseq con el checkpoint original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf015-filter-finetuned | ~95M | no disponible | fi | Apache 2.0 | Checkpoint de ablación (τ = −0,15) |
| GetmanY1/wav2vec2-base-fi-conf015-filter (modelo base) | ~95M | no disponible | fi | Apache 2.0 | Preentrenamiento sin el ajuste fino CTC de este checkpoint |
| Modelos principales de la colección GetmanY1/wav2vec2-fi-471k | no disponible | no disponible | fi | no disponible | Recomendados por el autor para uso general |
| wav2vec2-base-960h (Meta) | ~95M | no disponible | en | Apache 2.0 | Referencia de la arquitectura, pero en inglés |

## Limitaciones y advertencias

- El autor recomienda explícitamente no usar este checkpoint como modelo de uso general: es una variante de ablación y existen modelos principales del artículo para producción.
- Solo cubre finlandés; no se declara soporte de otros idiomas ni code-switching.
- El filtrado por confianza con τ = −0,15 descartó el 34% de las horas deduplicadas, lo que puede introducir sesgos hacia el dominio y la acústica que el ASR de filtrado consideró más fiable (radio, televisión, parlamento).
- Riesgo de alucinación en la transcripción: como todo modelo CTC sin modelo de lenguaje, puede producir salidas plausibles pero incorrectas en audio ruidoso o fuera de dominio.
- No genera puntuación, mayúsculas ni marcas de hablante; requiere postprocesado.
- El modelo se entrenó con `do_normalize=False`; aplicar normalización en inferencia puede degradar los resultados.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los corpus de origen (KUVI, VoxPopuli, Parlamento finlandés, Lahjoita puhetta) si se redistribuyen datos derivados.
- Sin datos publicados de WER en esta ficha; no debe asumirse un rendimiento concreto sin evaluarlo en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf015-filter-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf015-filter
- Colección de modelos principales del artículo: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Artículo: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
