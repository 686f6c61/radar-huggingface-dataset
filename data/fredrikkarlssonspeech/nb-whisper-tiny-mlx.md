# FredrikKarlssonSpeech/nb-whisper-tiny-mlx

## Resumen

El modelo `FredrikKarlssonSpeech/nb-whisper-tiny-mlx` es una conversión a formato MLX (Apple Silicon) del modelo `NbAiLab/nb-whisper-tiny`, un sistema de reconocimiento automático del habla (ASR) basado en la arquitectura Whisper de OpenAI, fine-tuneado por la Biblioteca Nacional de Noruega (NbAiLab) para el noruego bokmål. Esta conversión, realizada en precisión float16, permite ejecutar inferencia de transcripción de audio de forma rápida y eficiente en cualquier dispositivo con chip Apple Silicon mediante la librería `mlx-whisper`.

Su relevancia radica en que ofrece una solución ligera (39 millones de parámetros) y de código abierto (licencia Apache 2.0) para transcripción de audio en noruego, sin necesidad de GPUs dedicadas. Al estar optimizado para el ecosistema MLX, aprovecha al máximo el hardware unificado de los Mac, lo que lo convierte en una opción práctica para aplicaciones de ASR en entornos de escritorio o servidores ligeros. El modelo se publicó el 2 de septiembre de 2026 y aún no acumula descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 39 millones (aprox., segun Whisper tiny) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (sin contexto textual adicional) |
| Tipos de cuantizacion | float16 (este repositorio); se pueden generar otras cuantizaciones mediante conversion MLX |
| Idiomas soportados | Noruego bokmål (nb), noruego (no); posible herencia multilingue del Whisper base no confirmada |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atención totalmente autoregresiva, entrenado originalmente con 680.000 horas de audio débilmente supervisado en multiples idiomas. El modelo base `NbAiLab/nb-whisper-tiny` fue fine-tuneado por NbAiLab para mejorar el reconocimiento del noruego bokmål, aunque no se dispone de detalles sobre el dataset de fine-tuning ni sobre el uso de técnicas como RLHF o DPO.

La conversion a MLX se realizó mediante el script `convert.py` de `mlx-examples/whisper` a precision float16, lo que no altera los pesos ni la arquitectura, solo el formato de almacenamiento y el motor de inferencia. MLX es un framework de aprendizaje automatico de Apple que utiliza la memoria unificada de los chips Apple Silicon, permitiendo una ejecución eficiente sin copias de datos entre CPU y GPU.

## Capacidades

- Reconocimiento automatico del habla (ASR) para audio en noruego bokmål, transcribiendo voz a texto con puntuacion.
- Procesamiento de audio en ventanas de 30 segundos, con manejo de segmentos mas largos mediante el mecanismo de sliding window de Whisper.
- Posible herencia de capacidades multilingues del Whisper original, aunque el fine-tuning especifico para noruego puede haberlas degradado; no esta confirmado en la documentacion.
- No incluye soporte para tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de transcripcion.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face Transformers y con la libreria `mlx-whisper`.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en noruego a texto de forma local en un Mac, sin conexion a internet, adecuado para entornos con privacidad de datos.
- Subtitulado automatico de videos: integrable en flujos de postproduccion para generar subtitulos en noruego, gracias a su bajo peso y rapida inferencia en Apple Silicon.
- Asistentes de voz para aplicaciones de escritorio: permite comandos por voz en noruego en apps macOS, con latencia reducida al ejecutarse en el mismo dispositivo.
- Accesibilidad para personas con discapacidad auditiva: transcribe contenido hablado en noruego en tiempo real o diferido, facilitando la comprension de material audiovisual.
- Analisis de llamadas de servicio al cliente: las empresas pueden transcribir grabaciones de llamadas en noruego para extraer metricas de calidad o entrenar modelos de NLP, manteniendo los datos en infraestructura propia.
- Investigacion linguistica: util para crear corpus etiquetados de habla noruega, aprovechando la licencia Apache 2.0 que permite uso academico y comercial sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `NbAiLab/nb-whisper-tiny` podria tener metricas de WER (Word Error Rate) en noruego, pero no se incluyen en la documentacion de esta conversion. Se recomienda evaluar el modelo con datos propios antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: el modelo en float16 ocupa aproximadamente 0.1 GB, por lo que cabe en cualquier Mac con al menos 1 GB de memoria unificada libre. No requiere GPU dedicada.
- GPU recomendada: cualquier chip Apple Silicon (M1, M2, M3 o superiores); la inferencia se acelera con las unidades Neural Engine y GPU integradas.
- Compatible con consumer GPU: no aplica, ya que MLX solo funciona en hardware Apple.
- Opciones de despliegue: mediante `mlx-whisper` (linea de comandos o API Python), o integrable en apps macOS con el framework MLX. No es compatible con vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: para un modelo tiny, la transcripcion de 30 segundos de audio suele completarse en menos de 1 segundo en un M1 o superior, aunque depende del hardware y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Formato |
|---|---|---|---|---|---|
| FredrikKarlssonSpeech/nb-whisper-tiny-mlx | 39M | 30 s audio | Noruego bokmål | Apache 2.0 | MLX (float16) |
| NbAiLab/nb-whisper-tiny (original) | 39M | 30 s audio | Noruego bokmål | Apache 2.0 | PyTorch |
| openai/whisper-tiny | 39M | 30 s audio | Multilingue (incluye noruego) | MIT | PyTorch, ONNX, etc. |

La diferencia principal entre esta conversion y el modelo original es el formato: MLX permite inferencia nativa en Apple Silicon, mientras que el original PyTorch requiere un entorno con PyTorch y CUDA o CPU. Frente a `openai/whisper-tiny`, el modelo noruego esta especializado en bokmål y probablemente logre menor WER en ese idioma, aunque pierde parte de la cobertura multilingue.

## Limitaciones y advertencias

- Al ser un modelo "tiny", su precision es limitada en comparacion con variantes larger (small, medium, large); puede fallar con acentos regionales, ruido de fondo o vocabulario tecnico.
- El fine-tuning especifico para noruego puede haber reducido la capacidad de reconocer otros idiomas; no se garantiza un rendimiento multilingue adecuado.
- No se dispone de informacion sobre sesgos especificos del modelo, pero hereda los sesgos potenciales del Whisper original y del dataset de fine-tuning de NbAiLab.
- Riesgo de alucinacion: como cualquier modelo de ASR, puede generar texto que no corresponde al audio, especialmente en segmentos silenciosos o con habla solapada.
- La conversion a float16 puede introducir ligeras perdidas de precision respecto al modelo original en float32, aunque para ASR el impacto suele ser minimo.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir la autoría segun los terminos de la licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-tiny-mlx
- Modelo base NbAiLab: https://huggingface.co/NbAiLab/nb-whisper-tiny
- Documentacion de mlx-whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
