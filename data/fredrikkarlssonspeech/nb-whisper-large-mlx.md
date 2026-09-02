# FredrikKarlssonSpeech/nb-whisper-large-mlx

## Resumen

El modelo `FredrikKarlssonSpeech/nb-whisper-large-mlx` es una conversión a formato MLX (Apple Silicon) del modelo `NbAiLab/nb-whisper-large`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura Whisper de OpenAI, adaptado específicamente para el idioma noruego. El modelo original fue desarrollado por la Biblioteca Nacional de Noruega (NbAiLab) y entrenado durante 250 000 pasos con un conjunto de datos de aproximadamente 8 millones de horas de audio en noruego.

Esta conversión, realizada en precisión float16, permite ejecutar el modelo de forma eficiente en hardware Apple Silicon mediante la librería `mlx-whisper`, ofreciendo una alternativa optimizada para desarrolladores que trabajan en entornos macOS con chips M1/M2/M3. El repositorio tiene un tamaño de 3,1 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso tanto en investigación como en aplicaciones comerciales.

La relevancia de este modelo radica en que cubre una necesidad específica: transcripción de voz de alta calidad en noruego, un idioma con menos recursos que el inglés. Al ser una conversión MLX, hereda todas las capacidades del modelo base y las adapta a un ecosistema de inferencia rápida en dispositivos Apple, sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | no disponible (modelo Whisper large, ~1550M en la variante original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio fija de 30 segundos en Whisper) |
| Tipos de cuantizacion | float16 (unica mencionada) |
| Idiomas soportados | noruego (nb, no) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (formato nativo de la libreria MLX) |

## Arquitectura y entrenamiento

El modelo base `NbAiLab/nb-whisper-large` sigue la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atención multi-cabeza, diseñado para procesar espectrogramas de audio de 30 segundos. El encoder convierte el audio en representaciones latentes, y el decoder genera texto autoregresivamente. El entrenamiento se realizó en la Biblioteca Nacional de Noruega con 250 000 pasos y un dataset de aproximadamente 8 millones de horas de audio en noruego, lo que lo hace especialmente robusto para acentos, dialectos y vocabulario noruego.

La conversión a MLX se realizó con el script `convert.py` de `mlx-examples`, transformando los pesos a precisión float16. No se realizó ningún entrenamiento adicional ni ajuste fino; se trata de una conversión directa para aprovechar la aceleración por hardware en Apple Silicon. MLX es un framework de aprendizaje automático de Apple que utiliza la memoria unificada de los chips M-series, permitiendo inferencia eficiente sin necesidad de GPU externa.

## Capacidades

- Reconocimiento automático del habla (ASR) en noruego, incluyendo variantes bokmål y nynorsk.
- Transcripción de audio a texto con alta precisión, gracias al entrenamiento específico en noruego.
- Soporte para traducción de voz a texto en inglés (capacidad heredada de Whisper, aunque no confirmada explícitamente para este modelo).
- Identificación de idioma (capacidad estándar de Whisper, aunque no documentada aquí).
- Inferencia en Apple Silicon mediante MLX, con integración directa con `mlx-whisper` (CLI y API Python).
- Formato de pesos float16 que reduce el uso de memoria en comparación con float32.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en noruego a texto con alta fidelidad, útil para actas, búsqueda de contenido y análisis posterior.
- Subtitulado automático de vídeos: al procesar audio en noruego, se pueden generar subtítulos para plataformas de vídeo, mejorando la accesibilidad y el SEO.
- Asistentes de voz en noruego: integración en aplicaciones de dictado o comandos de voz, aprovechando la baja latencia en Apple Silicon.
- Análisis de llamadas de servicio al cliente: transcripción de grabaciones para minería de texto, detección de sentimiento o cumplimiento normativo.
- Archivado de contenido audiovisual: la Biblioteca Nacional de Noruega y otras instituciones pueden digitalizar y transcribir material histórico en noruego.
- Investigación lingüística: análisis de corpus orales en noruego, incluyendo dialectos regionales, gracias al entrenamiento con datos diversos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `NbAiLab/nb-whisper-large` podría tener métricas en su página de HuggingFace, pero no se incluyen en los datos proporcionados. Se recomienda consultar la documentación del modelo original para obtener cifras de WER (Word Error Rate) u otras métricas.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (M1, M2, M3 y posteriores), aprovechando la memoria unificada.
- El tamaño del repositorio es de 3,1 GB, por lo que se necesita al menos 4 GB de RAM disponible para cargar el modelo en memoria.
- Para inferencia con `mlx-whisper`, se recomienda un Mac con al menos 8 GB de RAM unificada para manejar audios de hasta 30 segundos por ventana.
- No requiere GPU dedicada; funciona con la GPU integrada del chip Apple.
- Opciones de despliegue: CLI (`mlx_whisper`) y API Python (`mlx_whisper.transcribe`). También se puede integrar en aplicaciones Swift mediante el framework MLX.
- La latencia depende del hardware, pero en chips M1 Pro o superiores se puede lograr transcripción en tiempo real para audios cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| FredrikKarlssonSpeech/nb-whisper-large-mlx | no disponible (Whisper large) | 30 s (ventana fija) | Noruego | Apache 2.0 | MLX |
| NbAiLab/nb-whisper-large | no disponible (Whisper large) | 30 s | Noruego | Apache 2.0 | PyTorch (probablemente) |
| openai/whisper-large-v3 | 1550M (aprox.) | 30 s | Multilingue (99 idiomas) | MIT | PyTorch, ONNX, etc. |

Nota: los datos de parámetros y contexto de los modelos base son estimaciones basadas en la arquitectura Whisper; no se dispone de cifras oficiales en la información proporcionada. La comparación se centra en el enfoque: el modelo MLX está optimizado para Apple Silicon, mientras que el original es más general pero requiere más configuración.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos noruegos, podría tener un rendimiento inferior en dialectos minoritarios o con vocabulario técnico muy especializado.
- Riesgo de alucinación inherente a los modelos de lenguaje: puede generar texto incorrecto o inventado en segmentos de audio ambiguos o con ruido.
- Limitado a noruego; no soporta otros idiomas de forma nativa, aunque podría intentar transcribir otros idiomas con resultados poco fiables.
- El uso comercial está permitido bajo licencia Apache 2.0, pero se recomienda revisar los términos del modelo base `NbAiLab/nb-whisper-large` por si hubiera restricciones adicionales.
- La conversión MLX es específica para Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, ONNX o PyTorch).
- La precisión float16 puede causar pequeñas pérdidas de exactitud en comparación con float32, aunque en la práctica suele ser despreciable para ASR.

## Enlaces

- [HuggingFace - FredrikKarlssonSpeech/nb-whisper-large-mlx](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-large-mlx)
- [HuggingFace - NbAiLab/nb-whisper-large (modelo base)](https://huggingface.co/NbAiLab/nb-whisper-large)
- [GitHub - NbAiLab/nb-whisper](https://github.com/NbAiLab/nb-whisper)
- [GitHub - openai/whisper](https://github.com/openai/whisper)
- [HuggingFace - FredrikKarlssonSpeech/nb-whisper-large-onnx (versión ONNX)](https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-large-onnx)
- [Inferix - nb-whisper-large](https://inferix.co/models/NbAiLab/nb-whisper-large)
- [mlx-whisper (ejemplos de MLX)](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
