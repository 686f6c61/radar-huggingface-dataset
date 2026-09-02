# FredrikKarlssonSpeech/whisper-large-v2-finnish-mlx-4bit

## Resumen

Este modelo es una conversión a MLX con cuantización de 4 bits del modelo Finnish-NLP/whisper-large-v2-finnish, un fine-tuning de Whisper large-v2 de OpenAI especializado en reconocimiento de voz en finlandés. El autor, FredrikKarlssonSpeech, ha adaptado el modelo para su uso eficiente en Apple Silicon mediante la librería mlx-whisper, lo que permite inferencia rápida en dispositivos Mac con chips M1/M2/M3/M4 sin necesidad de GPU NVIDIA.

El modelo hereda la arquitectura encoder-decoder transformer de Whisper large-v2, con 1550 millones de parámetros y una ventana de contexto de 30 segundos de audio. Al estar cuantizado a 4 bits, reduce el tamaño del repositorio a 0,9 GB, lo que facilita su despliegue en entornos con recursos limitados. Su relevancia radica en ofrecer una solución de transcripción automática en finlandés optimizada para hardware Apple, un idioma con escasez de modelos ASR de calidad y de código abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2) |
| Parametros totales | 1550 millones (1,55B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (muestras de 16 kHz) |
| Tipos de cuantizacion | 4 bits (MLX quantization) |
| Idiomas soportados | Finlandés (fi) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base, Whisper large-v2, es un transformer encoder-decoder entrenado por OpenAI con supervisión débil sobre 680.000 horas de audio multilingüe. El encoder procesa espectrogramas log-Mel de 80 canales a partir de ventanas de 30 segundos, mientras que el decoder genera texto token a token. El modelo original soporta múltiples tareas: transcripción, traducción y identificación de idioma, aunque este fine-tuning se ha especializado exclusivamente en transcripción al finlandés.

El fine-tuning fue realizado por el grupo Finnish-NLP sobre el modelo openai/whisper-large-v2, ajustando los pesos con datos de voz finlandesa para mejorar la precisión en este idioma. La conversión a MLX se ha realizado con la herramienta `convert.py` de mlx-examples, aplicando cuantización de 4 bits sobre los pesos resultantes. No se dispone de información sobre el dataset exacto de fine-tuning ni sobre la cantidad de tokens de entrenamiento adicionales.

## Capacidades

- Transcripción automática de voz en finlandés con alta precisión, incluyendo habla espontánea y acentos regionales.
- Manejo de audio de hasta 30 segundos por pasada, con posibilidad de procesar archivos más largos mediante segmentación.
- Identificación de idioma implícita: aunque está especializado en finlandés, hereda la capacidad de Whisper para detectar el idioma de entrada.
- Generación de transcripciones con puntuación y mayúsculas básicas.
- Funciona como pipeline de reconocimiento automático del habla (ASR) mediante la librería mlx-whisper.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en finlandés: se puede procesar audio grabado en entornos empresariales o académicos para generar actas textuales, gracias a la robustez del modelo ante ruido de fondo y solapamiento de voces.
- Subtitulado automático de vídeos en finlandés: integrando el modelo en un pipeline de generación de subtítulos, permite crear archivos SRT o VTT para contenido audiovisual en plataformas de streaming o redes sociales.
- Asistencia a personas con discapacidad auditiva: la transcripción en tiempo real o diferida de conversaciones, clases o eventos públicos en finlandés facilita el acceso a información sonora.
- Análisis de llamadas de servicio al cliente: empresas finlandesas pueden transcribir grabaciones de atención telefónica para extraer métricas de calidad, detectar problemas recurrentes o entrenar modelos de análisis de sentimiento.
- Documentación de investigación lingüística: lingüistas y sociolingüistas pueden transcribir corpus orales en finlandés para estudios de variación dialectal, fonética o análisis del discurso.
- Archivado y búsqueda de contenido audiovisual: bibliotecas y medios de comunicación pueden indexar archivos de audio y vídeo en finlandés mediante transcripciones, permitiendo búsquedas por contenido hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El modelo base Finnish-NLP/whisper-large-v2-finnish reporta mejoras sobre Whisper large-v2 en conjuntos de datos finlandeses, pero no se proporcionan cifras concretas en esta ficha. Para referencia, Whisper large-v2 original alcanza un WER de 2,5 en LibriSpeech clean-test en inglés, pero su rendimiento en finlandés es significativamente inferior sin fine-tuning.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1,55B cuantizado a 4 bits, el tamaño en memoria es aproximadamente 0,9 GB, más overhead de activaciones. Cabe en cualquier Mac con Apple Silicon (8 GB de RAM unificada o más).
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4), incluyendo versiones base y Pro/Max/Ultra. No requiere GPU NVIDIA ni CUDA.
- Compatible con GPUs de consumo: no aplica, ya que MLX solo funciona en Apple Silicon.
- Opciones de despliegue: mlx-whisper (línea de comandos y API Python), también puede integrarse con mlx-audio o frameworks de MLX.
- Latencia y throughput: no se dispone de cifras medidas, pero la cuantización 4-bit y la optimización MLX permiten transcripción en tiempo real o más rápida que en tiempo real en chips M1 Pro y superiores para audio de hasta 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idioma |
|---|---|---|---|---|---|
| FredrikKarlssonSpeech/whisper-large-v2-finnish-mlx-4bit | 1,55B | 30 s | Apache-2.0 | MLX 4-bit | fi |
| Finnish-NLP/whisper-large-v2-finnish | 1,55B | 30 s | Apache-2.0 | PyTorch | fi |
| openai/whisper-large-v2 | 1,55B | 30 s | MIT | PyTorch | multilingüe |
| openai/whisper-large-v3 | 1,55B | 30 s | MIT | PyTorch | multilingüe |

La comparativa muestra que este modelo es el único en formato MLX cuantizado, orientado específicamente a Apple Silicon. Frente al modelo original de OpenAI, ofrece mejor precisión en finlandés gracias al fine-tuning, pero pierde la capacidad multilingüe. Frente al modelo Finnish-NLP original, añade la ventaja de un tamaño reducido y velocidad de inferencia en hardware Apple.

## Limitaciones y advertencias

- Especialización exclusiva en finlandés: no transcribe otros idiomas de forma fiable, aunque pueda intentar hacerlo.
- Ventana de contexto limitada a 30 segundos: para audio más largo se necesita segmentación, lo que puede perder contexto entre segmentos.
- Riesgo de alucinaciones: como todos los modelos Whisper, puede generar texto plausible pero incorrecto en audio muy ruidoso o con habla no finlandesa.
- Sesgos potenciales: el fine-tuning puede haber introducido sesgos del dataset de entrenamiento finlandés, como sobrerrepresentación de ciertos dialectos o registros formales.
- Dependencia de hardware Apple: no es ejecutable en GPUs NVIDIA o AMD sin conversión adicional a otro formato.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Whisper original está bajo MIT; se recomienda verificar la procedencia del fine-tuning.
- No se proporcionan garantías de precisión en dominios específicos (médico, legal, técnico) sin evaluación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FredrikKarlssonSpeech/whisper-large-v2-finnish-mlx-4bit
- Modelo base Finnish-NLP: https://huggingface.co/Finnish-NLP/whisper-large-v2-finnish
- Whisper original en GitHub: https://github.com/openai/whisper
- Documentación de mlx-whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Paper de Whisper (PDF): https://cdn.openai.com/papers/whisper.pdf
- Modelo openai/whisper-large-v2 en HuggingFace: https://huggingface.co/openai/whisper-large-v2
