# FredrikKarlssonSpeech/whisper-large-v2-finnish-mlx

## Resumen

Este modelo es una conversión a formato MLX del checkpoint `Finnish-NLP/whisper-large-v2-finnish`, un fine-tuning del Whisper large-v2 de OpenAI especializado en reconocimiento automático del habla (ASR) para finlandés. La conversión está realizada en precisión float16 y permite ejecutar inferencia de forma eficiente en hardware Apple Silicon mediante la librería `mlx-whisper`, sin necesidad de utilizar los pesos originales de PyTorch.

El interés de esta ficha radica en que ofrece una vía práctica para desplegar ASR en finlandés en equipos Mac con aceleración nativa, aprovechando la arquitectura encoder-decoder de Whisper (1.550 millones de parámetros) y su ventana de contexto de 30 segundos de audio. Al estar basado en Whisper large-v2, hereda la robustez del entrenamiento original con 680.000 horas de datos débilmente supervisados, aunque limitado al idioma finlandés tras el fine-tuning.

La relevancia actual viene dada por la creciente adopción de MLX como framework de inferencia en el ecosistema Apple, que permite ejecutar modelos de este tamaño en portátiles sin GPU dedicada. Este repo simplifica la instalación: basta con `pip install mlx-whisper` y una línea de código para transcribir audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (Whisper large-v2) |
| Parametros totales | 1.550 millones (modelo base Whisper large-v2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana |
| Tipos de cuantizacion | float16 (conversión MLX); no se documentan otras |
| Idiomas soportados | Finlandés (fi) (el fine-tuning está especializado; el modelo original soporta 99 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (float16) |

## Arquitectura y entrenamiento

El modelo base es Whisper large-v2, un transformer encoder-decoder con normalización pre-LayerNorm, atención multi-cabeza y codificación posicional sinusoidal. Fue entrenado por OpenAI con 680.000 horas de audio multilingüe y multitarea (reconocimiento, traducción, identificación de idioma) mediante supervisión débil procedente de transcripciones de internet. El checkpoint `Finnish-NLP/whisper-large-v2-finnish` se obtuvo fine-tuning sobre ese modelo base con datos de habla finlandesa, aunque no se dispone de detalles públicos sobre el dataset exacto, el número de pasos o el método de ajuste (si se usó solo ASR o también traducción).

La conversión a MLX se realizó con el script `mlx-examples/whisper/convert.py` en precisión float16, lo que reduce el tamaño del modelo a aproximadamente 3,1 GB (frente a los ~3,9 GB del checkpoint original en fp32). No se han documentado técnicas adicionales como decodificación especulativa o atención lineal; se mantiene la arquitectura original de Whisper.

## Capacidades

- Transcripción de audio en finlandés: convierte habla en texto con alta precisión, aprovechando el fine-tuning específico.
- Reconocimiento multitarea heredado: aunque el fine-tuning se orienta a ASR, la arquitectura de Whisper incluye capacidades de traducción y detección de idioma, pero no se garantiza su funcionamiento tras el ajuste.
- Procesamiento de audio de hasta 30 segundos por ventana, con manejo de segmentos más largos mediante desplazamiento.
- Inferencia optimizada para Apple Silicon gracias a MLX, con soporte para ejecución en CPU y GPU unificada.
- Integración sencilla con `mlx-whisper`, que ofrece API de línea de comandos y Python.
- No incluye soporte de tool calling, funciones de agente ni razonamiento multimodal más allá del audio.

## Casos de uso

- Transcripción de reuniones y entrevistas en finlandés: el modelo puede procesar grabaciones de audio y generar actas textuales, adecuado para entornos empresariales o de investigación donde se requiere precisión en el idioma.
- Subtitulado automático de vídeos en finlandés: al transcribir pistas de audio, se pueden generar subtítulos en tiempo diferido para contenido de YouTube, cursos online o material audiovisual.
- Asistencia a personas con discapacidad auditiva: conversión de contenido hablado en finlandés a texto en tiempo real o diferido, facilitando la accesibilidad en conferencias o medios.
- Análisis de llamadas de servicio al cliente: transcripción de grabaciones de centros de contacto para búsqueda de palabras clave, análisis de sentimiento o control de calidad.
- Archivado y búsqueda de contenido oral: indexación de archivos de audio históricos o entrevistas en finlandés, permitiendo búsqueda textual sobre material no estructurado.
- Desarrollo de asistentes de voz en finlandés: como componente de ASR en pipelines de procesamiento de lenguaje natural, combinado con modelos de texto para tareas de diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de WER (Word Error Rate) ni comparaciones con otros sistemas ASR finlandeses en la model card. Se recomienda evaluar el modelo con datos propios del dominio antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: el modelo en float16 ocupa ~3,1 GB en memoria. En Apple Silicon, la memoria unificada del sistema es compartida entre CPU y GPU, por lo que se recomienda un Mac con al menos 8 GB de RAM unificada para inferencia fluida.
- GPUs compatibles: cualquier chip Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se soportan GPUs NVIDIA o AMD mediante MLX.
- Opciones de despliegue: `mlx-whisper` (línea de comandos y API Python), integrable en aplicaciones macOS. No es compatible directamente con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales. En un MacBook M2 con 16 GB, la transcripción de un minuto de audio suele tomar unos pocos segundos, pero depende de la longitud del segmento y de la carga del sistema.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-large-v2-finnish-mlx (este) | 1.550 M | 30 s audio | fi | Apache 2.0 | MLX |
| openai/whisper-large-v2 | 1.550 M | 30 s audio | 99 | MIT | PyTorch, CT2, GGUF |
| Finnish-NLP/whisper-large-v2-finnish | 1.550 M | 30 s audio | fi | Apache 2.0 | PyTorch |
| openai/whisper-large-v3 | 1.550 M | 30 s audio | 99+ | MIT | PyTorch, CT2, GGUF |

La principal diferencia de este modelo frente a los checkpoints PyTorch es el formato MLX, que permite ejecución nativa en Apple Silicon sin capas de conversión adicionales. Frente al Whisper original, este fine-tuning está especializado en finlandés, lo que debería ofrecer mejor WER en ese idioma, aunque no hay cifras que lo confirmen.

## Limitaciones y advertencias

- Especialización idiomática: el fine-tuning está enfocado en finlandés; el rendimiento en otros idiomas puede degradarse significativamente respecto al Whisper original.
- Sin datos de rendimiento: no se han publicado métricas de error (WER) ni resultados de evaluación, por lo que la calidad real en producción es incierta.
- Ventana de audio limitada a 30 segundos: para audios largos se necesita segmentación, lo que puede introducir errores en los bordes de los segmentos.
- Dependencia de la plataforma: al ser MLX, solo es ejecutable en Apple Silicon; no se puede usar en servidores con GPUs convencionales sin convertir los pesos.
- Riesgo de alucinaciones: como todo modelo de ASR, puede generar texto plausible pero incorrecto en condiciones de ruido o habla poco clara.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base Whisper tiene licencia MIT; la combinación es compatible, aunque se recomienda revisar los términos del dataset de fine-tuning si se redistribuye.
- Sin soporte de herramientas ni agentes: no es adecuado para tareas que requieran interacción con APIs o razonamiento simbólico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/FredrikKarlssonSpeech/whisper-large-v2-finnish-mlx)
- [Modelo base fine-tuned (Finnish-NLP/whisper-large-v2-finnish)](https://huggingface.co/Finnish-NLP/whisper-large-v2-finnish)
- [Whisper original de OpenAI](https://github.com/openai/whisper)
- [Checkpoint openai/whisper-large-v2](https://huggingface.co/openai/whisper-large-v2)
- [Paper de Whisper (arXiv:2212.04356)](https://arxiv.org/abs/2212.04356)
- [Repositorio mlx-examples/whisper](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
