# littoralai/parakeet-tdt-0.6b-v3-mlx-8bit

## Resumen

Parakeet TDT 0.6B v3 MLX 8-bit es una cuantización de 8 bits en formato MLX del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, publicada por Littoral AI para su aplicación de dictado local en macOS llamada Wavelet. No se trata de un modelo entrenado desde cero: es una compresión del checkpoint original de NVIDIA, pasando primero por la conversión a MLX de `mlx-community` y aplicando después cuantización afín de MLX sobre los pesos en coma flotante. El modelo resuelve transcripción de voz a texto multilingüe con detección automática de idioma, cubriendo 25 lenguas europeas.

La arquitectura subyacente es FastConformer con decodificación TDT (Token-and-Duration Transducer), con 627.052.166 parámetros totales y un tamaño de repositorio de 0,9 GB, lo que lo hace viable en equipos Apple Silicon con memoria unificada moderada. La relevancia de esta variante concreta es práctica: ofrece el mismo comportamiento numérico que el modelo original de NVIDIA en un formato optimizado para el stack MLX de Apple, permitiendo dictado y transcripción en local sin depender de servicios en la nube.

La licencia es CC BY 4.0, heredada del modelo original, lo que permite uso comercial con atribución. El modelo está pensado para inferencia de alta velocidad y no incluye capacidades de generación de texto libre, razonamiento ni tool calling: es exclusivamente un transductor voz-texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (cuantizacion afín MLX, grupos de 64, escalas y sesgos en float16); capas LSTM, convoluciones pointwise y de subsampling en float32; normalizaciones, sesgos y convoluciones depthwise en float16 |
| Idiomas soportados | 25 lenguas europeas (segun la model card de NVIDIA); deteccion automatica de idioma |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer, una variante de Conformer optimizada para throughput en ASR, acoplado a un decodificador TDT (Token-and-Duration Transducer) que predice conjuntamente tokens y duraciones, lo que reduce pasos de decodificación frente a transductores clásicos. El checkpoint original fue entrenado por NVIDIA con NeMo sobre los datasets Granary y asr-set-3.0, según la información disponible. No se detallan en la información proporcionada el número exacto de horas de audio, la composición del corpus ni si hubo etapas de ajuste fino específicas.

Esta variante concreta no fue reentrenada. El proceso de compresión consistió en cuantizar 221 capas lineales y de embedding desde los pesos float32 con cuantización afín de MLX (8 bits, grupos de 64, escalas y sesgos en float16), manteniendo 56 tensores en float32 (LSTM del decodificador, convoluciones pointwise y de subsampling) y almacenando normalizaciones, sesgos, convoluciones depthwise pequeñas y otros tensores menores en float16. Las herramientas empleadas fueron mlx 0.31.2 y safetensors, reproduciendo el método de `animaslabs/mlx-models`. Los ficheros del tokenizer son idénticos a los de la conversión MLX previa.

## Capacidades

- Transcripción de voz a texto (ASR) de alta velocidad mediante decodificación TDT.
- Reconocimiento multilingüe con detección automática de idioma sobre 25 lenguas europeas.
- Procesamiento por lotes orientado a throughput alto, según la descripción del modelo original.
- Ejecución local en Apple Silicon a través de MLX, sin llamadas a servicios externos.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No dispone de modo thinking, audio de salida ni otras modalidades.

## Casos de uso

- Dictado en local sobre macOS: integrado en la aplicación Wavelet como nivel por defecto, el modelo transcribe voz a texto en el propio equipo con memoria unificada, evitando enviar audio a la nube y aprovechando la aceleración MLX en chips Apple Silicon.
- Transcripción de reuniones y notas de voz: al ser un modelo de 0,6B parámetros con decodificación TDT, procesa audio de forma rápida en portátiles, permitiendo generar actas o resúmenes a partir de la transcripción en flujos posteriores.
- Subtitulado y generación de transcripciones para contenido audiovisual en lenguas europeas: la detección automática de idioma simplifica pipelines que reciben materiales de varios países sin etiquetado previo.
- Automatización de accesibilidad: conversión de audio a texto en tiempo real para personas con dificultades auditivas en aplicaciones de escritorio, con la ventaja de funcionar sin conexión.
- Procesamiento por lotes de archivos de audio en servidores con hardware Apple: al estar en formato MLX, se integra en pipelines que ya usan MLX para otras tareas y evita reescribir la infraestructura.
- Prototipado de asistentes de voz locales: la licencia CC BY 4.0 y el tamaño reducido permiten incorporarlo en productos comerciales con atribución, sin costes de API por minuto transcrito.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de precisión de ASR al pasar de float32 a 8 bits en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 0,9 GB, por lo que la inferencia en 8 bits requiere del orden de 1 GB de memoria para los pesos, más el espacio de activaciones y buffers de audio, que no se detalla en la información disponible.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con soporte MLX; no está pensado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente; el modelo original en fp32 también es ligero, pero esta variante reduce la huella.
- Opciones de despliegue: MLX (versión 0.31.2 empleada en la conversión) y safetensors; para el modelo original de NVIDIA, NeMo. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| littoralai/parakeet-tdt-0.6b-v3-mlx-8bit | 627 M | no disponible | 25 lenguas europeas | CC BY 4.0 | safetensors MLX 8-bit |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M (aprox.) | no disponible | 25 lenguas europeas | CC BY 4.0 | NeMo |
| mlx-community/parakeet-tdt-0.6b-v3 | 600 M (aprox.) | no disponible | 25 lenguas europeas | CC BY 4.0 | MLX float32 |
| whisper-large-v3 | no disponible en la informacion | no disponible | multilingue amplio | licencia MIT (segun el proyecto Whisper) | safetensors, GGUF y otros |

La comparación con Whisper-large-v3 se incluye como referencia de categoría, pero los datos concretos de parámetros y contexto de ese modelo no forman parte de la información proporcionada y no se afirman aquí.

## Limitaciones y advertencias

- El modelo es exclusivamente ASR: no genera texto libre, no razona y no admite instrucciones en lenguaje natural.
- La cobertura lingüística se limita a 25 lenguas europeas; no se garantiza rendimiento en otras lenguas.
- No se han publicado métricas de error (WER) para esta cuantización de 8 bits, por lo que se desconoce la degradación exacta frente al modelo original en float32.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, habitual en modelos transductores; no se documenta en la información disponible el comportamiento concreto en esos casos.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a NVIDIA y al autor de la conversión; debe revisarse la model card original para las condiciones completas de uso previsto.
- Dependencia del ecosistema MLX y de hardware Apple Silicon: no es directamente desplegable en CUDA sin reconvertir el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicación reciente y sin validación comunitaria amplia.
- Los datos de entrenamiento, la composición del corpus y las limitaciones específicas deben consultarse en la model card de NVIDIA, ya que esta variante no los reproduce.

## Enlaces

- Hugging Face: https://huggingface.co/littoralai/parakeet-tdt-0.6b-v3-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión MLX previa: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v3
- Método de cuantización de referencia: https://github.com/animaslabs/mlx-models
