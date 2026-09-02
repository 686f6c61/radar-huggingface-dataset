# FredrikKarlssonSpeech/nb-whisper-tiny-mlx-4bit

## Resumen

Este modelo es una conversión a formato MLX con cuantización de 4 bits del modelo `NbAiLab/nb-whisper-tiny`, un sistema de reconocimiento automático del habla (ASR) especializado en noruego (bokmål). El modelo original fue desarrollado por la Biblioteca Nacional de Noruega (NbAiLab) como parte de la serie NB-Whisper, que adapta la arquitectura Whisper de OpenAI al idioma noruego mediante fine-tuning sobre 20.000 horas de datos etiquetados. Esta versión MLX, creada por FredrikKarlssonSpeech, permite ejecutar el modelo de forma eficiente en hardware Apple Silicon utilizando la librería `mlx-whisper`.

El modelo mantiene la arquitectura encoder-decoder de Whisper en su variante "tiny" (aproximadamente 39 millones de parámetros), lo que lo convierte en una opción muy ligera para tareas de transcripción en noruego. Su cuantización a 4 bits reduce aún más el consumo de memoria, haciéndolo adecuado para despliegues en dispositivos con recursos limitados, como MacBooks o incluso dispositivos embebidos. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en que cubre una necesidad específica: transcripción de audio en noruego con un modelo de tamaño reducido y de código abierto, sin depender de servicios en la nube. Es especialmente útil para aplicaciones que requieren procesamiento local, privacidad de datos o baja latencia en entornos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 39M (aproximadamente, variante tiny) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Noruego (bokmål) y noruego (nynorsk) según el modelo base; se indica `nb` y `no` |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (formato específico para Apple Silicon) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder entrenado para múltiples tareas de procesamiento de audio. El encoder procesa espectrogramas de mel de ventanas de 30 segundos y el decoder genera texto de forma autorregresiva. La variante "tiny" tiene 4 capas de encoder y 4 de decoder, con una dimensión oculta de 384 y 6 cabezas de atención, lo que da un total de aproximadamente 39 millones de parámetros.

El modelo original `NbAiLab/nb-whisper-tiny` fue fine-tuneado sobre el modelo Whisper tiny preentrenado con 20.000 horas de datos de audio etiquetados en noruego, proporcionados por la Biblioteca Nacional de Noruega. No se han publicado detalles sobre técnicas de alineación como RLHF o DPO, ya que se trata de una tarea de ASR supervisada. La conversión a MLX se realizó con la herramienta `convert.py` de `mlx-examples`, aplicando cuantización de 4 bits a los pesos del modelo original. No se mencionan innovaciones técnicas adicionales más allá de la cuantización.

## Capacidades

- Reconocimiento automático del habla (ASR) en noruego, tanto bokmål como nynorsk, con salida de texto transcrito.
- Transcripción de audio en tiempo real o de archivos de audio mediante la librería `mlx-whisper`.
- Manejo de audio de hasta 30 segundos por ventana; la librería `mlx-whisper` gestiona automáticamente la segmentación de audios más largos.
- Al heredar la arquitectura Whisper, el modelo puede identificar el idioma del audio, aunque su entrenamiento está especializado en noruego.
- No se ha confirmado soporte para tool calling, agentes o funciones de razonamiento multi-paso, ya que es un modelo puramente de transcripción.
- Capacidad de ejecución local en dispositivos Apple Silicon sin necesidad de conexión a internet.

## Casos de uso

- Transcripción de reuniones y entrevistas en noruego: el modelo puede convertir grabaciones de audio a texto en tiempo real o de forma diferida, facilitando la generación de actas y resúmenes. Su tamaño reducido permite ejecutarlo en un MacBook sin GPU dedicada.
- Subtitulado automático de vídeos en noruego: al procesar pistas de audio de vídeos, se pueden generar subtítulos en formato SRT u otros, útil para creadores de contenido y plataformas educativas.
- Asistentes de voz locales para el idioma noruego: integrado en aplicaciones de escritorio o móviles que requieran comprensión del habla sin depender de servicios en la nube, garantizando privacidad de datos.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas para análisis posterior, búsqueda de palabras clave o evaluación de calidad, con ventaja de procesamiento local.
- Archivado y documentación de contenido oral: bibliotecas o instituciones que necesiten digitalizar archivos de audio históricos en noruego, convirtiéndolos a texto para su indexación.
- Herramientas educativas para aprendizaje de idiomas: transcripción de pronunciación del alumno para retroalimentación, ejecutable en dispositivos Apple de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas como WER (Word Error Rate) o comparaciones con otros modelos noruegos en la documentación de HuggingFace. Se recomienda consultar el repositorio del modelo base `NbAiLab/nb-whisper-tiny` para posibles evaluaciones, aunque tampoco se han encontrado datos públicos al respecto.

## Requisitos de hardware

- Al estar en formato MLX, requiere hardware Apple Silicon (M1, M2, M3 o posteriores).
- Con cuantización de 4 bits, el modelo ocupa aproximadamente 20 MB en memoria (39M parámetros × 0,5 bytes por parámetro). Esto permite ejecutarlo en cualquier Mac con al menos 8 GB de RAM, incluso en modelos base.
- No se requiere GPU dedicada; la CPU y la Neural Engine de Apple Silicon son suficientes para inferencia en tiempo real en la mayoría de los casos.
- La latencia típica para transcribir un audio de 30 segundos en un MacBook M1 es inferior a 1 segundo, según la experiencia general con Whisper tiny cuantizado, aunque no se dispone de mediciones específicas para este modelo.
- Opciones de despliegue: uso mediante la librería `mlx-whisper` (CLI o Python), integración en aplicaciones Swift o Python con el ecosistema MLX. No es compatible con vLLM, llama.cpp u Ollama, ya que estos no soportan el formato MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| `nb-whisper-tiny-mlx-4bit` (este) | 39M | 30 s audio | Noruego | Apache-2.0 | MLX 4-bit |
| `NbAiLab/nb-whisper-tiny` (original) | 39M | 30 s audio | Noruego | Apache-2.0 | PyTorch (safetensors) |
| `NbAiLab/nb-whisper-small` (si existe) | 244M | 30 s audio | Noruego | Apache-2.0 | PyTorch (presumiblemente) |
| `openai/whisper-tiny` (multilingüe) | 39M | 30 s audio | 99 idiomas | MIT | PyTorch |

La principal diferencia frente al modelo original es el formato y la cuantización, lo que permite inferencia más rápida y menor consumo de memoria en Apple Silicon. Frente a modelos más grandes como `nb-whisper-small`, este modelo ofrece menor precisión pero mucho menor requisito de hardware. No se dispone de datos de WER para comparar cuantitativamente.

## Limitaciones y advertencias

- Al ser una variante "tiny", la precisión de transcripción es limitada, especialmente con acentos regionales, ruido de fondo o vocabulario técnico. Para uso profesional se recomienda evaluar modelos más grandes como `nb-whisper-small` o `nb-whisper-medium`.
- El modelo está entrenado principalmente para noruego bokmål y nynorsk; su rendimiento en otros idiomas escandinavos (sueco, danés) puede ser deficiente.
- La cuantización de 4 bits puede introducir una ligera degradación en la calidad de la transcripción en comparación con el modelo en precisión completa.
- No se han publicado métricas de rendimiento (WER) ni evaluaciones independientes, por lo que el comportamiento real en producción es incierto.
- La ventana de 30 segundos de audio por segmento obliga a la segmentación automática; audios con múltiples hablantes o cambios bruscos de volumen pueden causar errores de segmentación.
- Limitado a hardware Apple Silicon; no es ejecutable en GPUs NVIDIA o CPUs x86 sin conversión previa a otro formato (por ejemplo, ONNX o GGUF).
- El repositorio muestra 0 descargas y 0 likes, lo que sugiere que el modelo no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-tiny-mlx-4bit
- Modelo base (NbAiLab/nb-whisper-tiny): https://huggingface.co/NbAiLab/nb-whisper-tiny
- Repositorio mlx-whisper (mlx-examples): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Proyecto NB-Whisper (Biblioteca Nacional de Noruega): https://github.com/CRF007/nb-whisper-small-beta (referencia a la serie)
- Versión ONNX del mismo autor: https://huggingface.co/FredrikKarlssonSpeech/nb-whisper-tiny-onnx
