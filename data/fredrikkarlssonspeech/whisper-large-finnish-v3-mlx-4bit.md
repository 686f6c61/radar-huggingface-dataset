# FredrikKarlssonSpeech/whisper-large-finnish-v3-mlx-4bit

## Resumen

whisper-large-finnish-v3-mlx-4bit es una conversión al formato MLX del modelo Finnish-NLP/whisper-large-finnish-v3, un fine-tuning de Whisper Large v3 de OpenAI especializado en reconocimiento automático de voz en finés. El modelo está cuantizado a 4 bits, lo que reduce su tamaño a aproximadamente 0,9 GB y permite una inferencia rápida en hardware Apple Silicon mediante la librería mlx-whisper.

El desarrollo corre a cargo de FredrikKarlssonSpeech, que ha publicado tanto la versión MLX como una variante ONNX del mismo modelo base. La relevancia de esta conversión radica en que permite ejecutar transcripción de voz en finés de alta calidad en Macs con chips Apple Silicon, sin necesidad de GPU dedicadas ni servicios en la nube, con un consumo de memoria reducido gracias a la cuantización.

El modelo base, Whisper Large v3, emplea una arquitectura Transformer encoder-decoder con aproximadamente 1.550 millones de parámetros, entrenada sobre 680.000 horas de audio débilmente supervisado. La versión fine-tuned para finés conserva la misma arquitectura y ventana de contexto de 30 segundos de audio por fragmento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3) |
| Parametros totales | ~1.550 millones |
| Parametros activos | No procede (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio por fragmento |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Finés (fi) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (4-bit quantized) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Large v3 de OpenAI, un Transformer encoder-decoder con aproximadamente 1.550 millones de parámetros. El encoder procesa espectrogramas Mel de audio en ventanas de 30 segundos, mientras que el decoder genera el texto transcrito de forma autorregresiva. El modelo original fue entrenado con 680.000 horas de audio débilmente supervisado en 99 idiomas.

La versión finlandesa (Finnish-NLP/whisper-large-finnish-v3) es un fine-tuning del modelo base realizado específicamente para mejorar la precisión en finés. La conversión MLX presentada en este repositorio aplica una cuantización de 4 bits sobre los pesos del modelo fine-tuned, lo que reduce el tamaño del modelo a aproximadamente 0,9 GB y acelera la inferencia en Apple Silicon mediante la librería mlx-whisper. No se dispone de información detallada sobre el dataset de fine-tuning ni sobre el proceso de entrenamiento en la documentación proporcionada.

## Capacidades

- Transcripción de voz en finés con alta precisión, heredada del fine-tuning específico para este idioma.
- Reconocimiento automático de voz (ASR) sobre audio en formato de archivo o flujo de entrada.
- Inferencia optimizada para Apple Silicon gracias a la cuantización 4-bit y al uso de MLX.
- Integración sencilla mediante CLI (`mlx_whisper`) o API Python (`mlx_whisper.transcribe`).
- Procesamiento de audio en fragmentos de 30 segundos, siguiendo el diseño estándar de Whisper.
- Compatibilidad con el ecosistema MLX de Apple para despliegue local sin GPU dedicada.

## Casos de uso

- Transcripción de reuniones y entrevistas en finés: el modelo puede transcribir grabaciones de reuniones de trabajo o entrevistas en finés de forma local, preservando la privacidad al no enviar audio a servicios en la nube.
- Subtitulado automático de vídeos en finés: integrable en flujos de posproducción para generar subtítulos de contenido audiovisual en finés, con tiempos aproximados por fragmento de audio.
- Transcripción de podcasts y programas de radio: adecuado para generar texto de episodios de podcast o programas de radio en finés, facilitando la búsqueda y el archivado de contenido.
- Asistentes de voz en finés: puede servir como módulo de reconocimiento de voz en aplicaciones de asistente personal o domótica que operen en finés y se ejecuten en hardware Apple.
- Archivado y búsqueda de audio corporativo: permite indexar grabaciones de llamadas, seminarios o formaciones en finés convirtiéndolas en texto buscable.
- Transcripción médica o legal en finés: en contextos donde se requiere confidencialidad, el despliegue local en Apple Silicon evita la transmisión de datos sensibles a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como WER (Word Error Rate) o CER (Character Error Rate) para este modelo específico en la documentación proporcionada.

## Requisitos de hardware

- Apple Silicon (M1, M2, M3, M4 o posteriores) para aprovechar la aceleración MLX.
- Memoria RAM recomendada: al menos 8 GB, aunque 16 GB o más garantizan un margen cómodo para audio largo.
- Espacio en disco: aproximadamente 0,9 GB para los pesos del modelo.
- No requiere GPU dedicada ni hardware NVIDIA, ya que MLX está optimizado para los chips de Apple.
- Opciones de despliegue: `mlx-whisper` (CLI y API Python), integrable en aplicaciones macOS.
- La cuantización 4-bit reduce significativamente la huella de memoria en comparación con la versión completa en FP32 o FP16, lo que permite ejecutar el modelo en Macs de gama de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia |
|---|---|---|---|---|---|
| FredrikKarlssonSpeech/whisper-large-finnish-v3-mlx-4bit | ~1,55B | 30 s | 4-bit MLX | Apple Silicon | Apache-2.0 |
| Finnish-NLP/whisper-large-finnish-v3 | ~1,55B | 30 s | FP32/FP16 | GPU/CPU (PyTorch) | Apache-2.0 |
| OpenAI whisper-large-v3 | ~1,55B | 30 s | FP32/FP16 | GPU/CPU (PyTorch) | Apache-2.0 |
| FredrikKarlssonSpeech/whisper-large-finnish-v3-onnx | ~1,55B | 30 s | ONNX | Multiplataforma | Apache-2.0 |

La principal diferencia frente al modelo base en PyTorch es la optimización para Apple Silicon y la reducción de tamaño mediante cuantización 4-bit. Frente a la variante ONNX, la versión MLX está específicamente optimizada para los aceleradores neuronales y la arquitectura de memoria unificada de los chips Apple.

## Limitaciones y advertencias

- El modelo está especializado en finés; el rendimiento en otros idiomas puede ser significativamente inferior al del Whisper Large v3 original.
- La cuantización 4-bit puede introducir una ligera degradación en la precisión respecto a la versión en FP16 o FP32 del mismo modelo.
- La ventana de contexto está limitada a 30 segundos de audio por fragmento; audios más largos requieren segmentación y posterior ensamblaje de la transcripción.
- Requiere hardware Apple Silicon para aprovechar la aceleración MLX; en otras plataformas no se puede ejecutar de forma nativa.
- No se dispone de información sobre el dataset de fine-tuning ni sobre posibles sesgos en el reconocimiento de diferentes acentos o variedades del finés.
- El modelo puede presentar alucinaciones en fragmentos de audio silenciosos o con mucho ruido, un comportamiento conocido en la familia Whisper.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento del modelo base para casos de uso sensibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FredrikKarlssonSpeech/whisper-large-finnish-v3-mlx-4bit
- Modelo base (PyTorch): https://huggingface.co/Finnish-NLP/whisper-large-finnish-v3
- Conversión ONNX del mismo modelo: https://huggingface.co/FredrikKarlssonSpeech/whisper-large-finnish-v3-onnx
- Repositorio mlx-examples/whisper: https://github.com/ml-explore/mlx-examples/blob/main/whisper/README.md
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper
- Guía de despliegue local de Whisper Large (2026): https://codersera.com/blog/whisper-large-local-setup-guide-2026/
