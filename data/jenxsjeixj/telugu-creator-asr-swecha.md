# jenxsjeixj/telugu-creator-asr-swecha

## Resumen

El modelo `jenxsjeixj/telugu-creator-asr-swecha` es un sistema de reconocimiento automático del habla (ASR) especializado en telugu, desarrollado por el usuario jenxsjeixj. Se trata de un ajuste fino (fine-tuning) del modelo base Swecha Gonthuka, un wav2vec2 preentrenado para telugu, orientado específicamente al dominio del habla de creadores de contenido en YouTube: velocidad conversacional rápida (180-240 palabras por minuto), jerga coloquial y audio de estudio con ruido de fondo.

El modelo resuelve un problema concreto: el colapso de dominio acústico que sufren los ASR genéricos cuando se enfrentan a habla espontánea de creadores, en lugar del habla leída o de laboratorio. Según la model card, el ajuste fino reduce la tasa de error de palabras (WER) del 83,39% en zero-shot al 46,78%, una reducción absoluta de 36,61 puntos, y la tasa de error de caracteres (CER) hasta el 18,67%.

Con 94.436.308 parámetros (aproximadamente 94,4 millones), es un modelo compacto que cabe en hardware modesto. El repositorio ocupa 0,4 GB y los pesos están en formato safetensors. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial, y está etiquetado únicamente para el idioma telugu (`te`). Aunque el WER del 46,78% sigue siendo alto en términos absolutos, la mejora respecto al baseline es sustancial para un dominio tan difícil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 (CTC) |
| Parámetros totales | 94.436.308 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada típica de wav2vec2, no especificada en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | telugu (`te`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura wav2vec2 con una cabeza de clasificación CTC (`AutoModelForCTC`), tal como se desprende de los tags y del código de inferencia de la model card. wav2vec2 es un transformer convolucional que procesa la forma de onda de audio en bruto y aprende representaciones auto-supervisadas; la cabeza CTC permite alinear secuencias de audio con transcripciones sin necesidad de alineamientos fonéticos explícitos. El modelo parte del checkpoint Swecha Gonthuka, un wav2vec2 preentrenado para telugu, y se ajusta finamente sobre él.

El ajuste fino se realizó sobre más de 65 horas de habla real de creadores de YouTube en telugu, etiquetadas automáticamente con Deepgram Nova-3. Este detalle es relevante: las etiquetas provienen de un ASR comercial, no de transcripción humana, lo que introduce el sesgo y los errores propios de Nova-3 en el conjunto de entrenamiento. La model card no especifica el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, regularización o decodificación con modelo de lenguaje. Tampoco se documenta el proceso de selección de hiperparámetros ni la partición train/validation/test.

## Capacidades

- Reconocimiento automático del habla en telugu, con salida de transcripción en texto.
- Especialización en habla conversacional rápida (180-240 WPM), típica de creadores de contenido.
- Manejo de jerga y expresiones coloquiales del telugu hablado.
- Robustez frente a audio de estudio con ruido de fondo y características acústicas de grabaciones de YouTube.
- Inferencia mediante `transformers` (AutoProcessor + AutoModelForCTC) con audio a 16 kHz.
- No se documentan capacidades de puntuación, diarización, detección de idioma, traducción ni salida con marcas de tiempo.

## Casos de uso

- Subtitulado automático de vídeos de YouTube en telugu: el modelo está entrenado precisamente con habla de creadores, por lo que es adecuado para generar subtítulos de canales de contenido conversacional, donde los ASR genéricos fallan por velocidad y jerga.
- Moderación y búsqueda de contenido en plataformas: transcribir audio de creadores para indexar y permitir búsqueda textual dentro de vídeos, aprovechando la mejora de CER (18,67%) para la coincidencia de términos.
- Análisis de tendencias y opinión pública: procesar grandes volúmenes de vídeos de creadores telugu para extraer temas, palabras clave y sentimiento a partir de las transcripciones.
- Accesibilidad: generar subtítulos para personas con discapacidad auditiva en contenido de creadores telugu, donde la oferta de ASR de calidad es limitada.
- Investigación lingüística del telugu coloquial: disponer de un modelo que transcribe habla espontánea y jerga, útil para corpus de lingüística de corpus y estudios sociolingüísticos.
- Pipeline de datos para entrenamiento de otros modelos: usar las transcripciones como etiquetas débiles o para preprocesar audio de creadores antes de un etiquetado humano.
- Prototipado rápido en aplicaciones de voz para telugu: al ser un modelo de 94M de parámetros y 0,4 GB, se puede desplegar en entornos con recursos limitados para pruebas de concepto.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas de error del propio ajuste fino frente al baseline zero-shot:

| Métrica | Baseline zero-shot | Fine-tuned | Mejora |
|---|---|---|---|
| WER | 83,39% | 46,78% | −36,61 puntos absolutos |
| CER | no disponible | 18,67% | −33,15 puntos absolutos (según la model card) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni conjuntos ASR como Common Voice, FLEURS o Multilingual LibriSpeech) en la información disponible. Tampoco se especifica el conjunto de evaluación utilizado para calcular el WER y el CER, ni su tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB de pesos; en la práctica, menos de 1 GB incluyendo activaciones para audio de duración moderada.
- VRAM estimada en fp16: alrededor de 0,2 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para audio corto.
- GPU recomendadas para producción con throughput alto: A100, H100 o L4; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: `transformers` con PyTorch (documentado en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (estas herramientas están orientadas a modelos de texto, no a wav2vec2 CTC).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| telugu-creator-asr-swecha | 94,4 M | no disponible | telugu | Apache 2.0 | Hugging Face |
| Swecha Gonthuka (base) | no disponible en la información | no disponible | telugu | no disponible | Hugging Face (referenciado como base) |
| Whisper (OpenAI) | 39 M – 1,55 B según variante | 30 s de audio | multilingüe (incluye telugu) | MIT | Hugging Face, OpenAI |
| wav2vec2-base | 95 M | no disponible | multilingüe (preentrenamiento) | Apache 2.0 | Hugging Face |

La comparación con Whisper es la más relevante: Whisper es multilingüe y está entrenado con datos supervisados a gran escala, mientras que este modelo es monolingüe y está especializado en un dominio concreto. No se dispone de datos de WER comparativos entre ambos en el mismo conjunto de evaluación, por lo que no es posible afirmar cuál es mejor en términos absolutos. La ventaja de este modelo es su especialización en habla de creadores telugu y su licencia permisiva; su desventaja es el WER absoluto del 46,78%, que sigue siendo elevado.

## Limitaciones y advertencias

- El WER del 46,78% es alto en términos absolutos: aproximadamente una de cada dos palabras puede contener errores, lo que limita su uso en aplicaciones que requieran transcripción precisa sin revisión humana.
- Las etiquetas de entrenamiento provienen de Deepgram Nova-3, no de transcripción humana; esto introduce el sesgo del ASR comercial y puede propagar sus errores sistemáticos.
- El modelo está entrenado exclusivamente para telugu (`te`); no soporta otros idiomas ni code-switching con inglés u otras lenguas, algo frecuente en creadores de contenido.
- Riesgo de alucinación y de sustituciones erróneas en segmentos con ruido, música o solapamiento de hablantes; no se documenta comportamiento en estas condiciones.
- No se documenta el conjunto de evaluación ni su tamaño, por lo que la métrica de WER puede no ser representativa de otros dominios (habla telefónica, reuniones, lectura).
- No se han publicado análisis de sesgos por género, dialecto regional o edad; el telugu tiene variación dialectal significativa que puede no estar cubierta.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Swecha Gonthuka debe verificarse por separado para confirmar que su licencia es compatible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (6 de noviembre de 2026); no hay evidencia de validación por parte de la comunidad.
- No se documentan limitaciones de longitud de audio; wav2vec2 procesa ventanas de audio y el comportamiento en audios muy largos no está especificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jenxsjeixj/telugu-creator-asr-swecha
- Modelo base Swecha Gonthuka: no se proporciona enlace directo en la información disponible (referenciado por nombre en la model card)
- Deepgram Nova-3 (herramienta de etiquetado): no se proporciona enlace en la información disponible
- Documentación de wav2vec2 en transformers: no se proporciona enlace en la información disponible
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
