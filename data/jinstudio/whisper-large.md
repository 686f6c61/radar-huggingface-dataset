# Jinstudio/whisper-large

## Resumen

Jinstudio/whisper-large es un modelo de reconocimiento automático de voz (ASR) y traducción de voz basado en la arquitectura Transformer encoder-decoder, propuesto por OpenAI en el artículo «Robust Speech Recognition via Large-Scale Weak Supervision». El modelo fue entrenado sobre 680 000 horas de datos de habla etiquetados mediante supervisión débil a gran escala, lo que le permite generalizar a numerosos conjuntos de datos y dominios sin necesidad de ajuste fino. Se trata de la variante large del conjunto de modelos Whisper, con 1 543 304 960 parámetros, y está publicado en el repositorio de Hugging Face Jinstudio/whisper-large bajo licencia Apache 2.0. El modelo es relevante porque ofrece transcripción robusta en múltiples idiomas y traducción de audio, aunque el propio autor de Whisper recomienda usar la versión large-v2, entrenada durante más épocas, que supera el rendimiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 1 543 304 960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 99 idiomas (incluye inglés, español, chino, francés, alemán, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponibles en PyTorch, TensorFlow y JAX según los tags) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer encoder-decoder, también conocida como secuencia a secuencia. Fue entrenado en 680 000 horas de datos de habla etiquetados mediante supervisión débil a gran escala. Los modelos multilingües de Whisper se entrenan simultáneamente en dos tareas: reconocimiento de voz, en la que se predice la transcripción en el mismo idioma del audio, y traducción de voz, en la que se predice la transcripción en un idioma diferente al del audio. En la información disponible no se mencionan técnicas de ajuste como RLHF ni DPO. Como innovación técnica destacable, el modelo aprovecha tokens de contexto para indicar la tarea a realizar, y su entrenamiento con datos masivos y diversos le otorga una fuerte capacidad de generalización sin ajuste fino. Cabe señalar que el autor de Whisper publicó posteriormente una versión large-v2 entrenada durante 2,5 veces más épocas con regularización, que supera el rendimiento del modelo original sin cambios de arquitectura.

## Capacidades

- Reconocimiento automático de voz (ASR) multilingüe: transcribe audio en el mismo idioma de la señal.
- Traducción de voz: transcribe audio de un idioma a otro distinto, útil para contenido multilingüe.
- Generalización a diferentes conjuntos de datos y dominios sin necesidad de ajuste fino.
- Preprocesamiento de audio mediante log-Mel espectrogramas y postprocesamiento de tokens a texto a través de WhisperProcessor.
- No dispone de tool calling ni soporte de agentes, ya que es un modelo de transcripción de audio.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto con alta fidelidad, gracias a su entrenamiento con una gran variedad de acentos y condiciones acústicas. Es adecuado para generar actas automáticas sin necesidad de entrenamiento adicional.
- Subtitulación automática de vídeos: para contenido en vídeo, el modelo genera subtítulos en el idioma original o traduce el audio a otro idioma. Esto permite indexar vídeos y mejorar su accesibilidad.
- Accesibilidad para personas con discapacidad auditiva: mediante el procesamiento de audio en tiempo real, el modelo puede ofrecer transcripciones de conversaciones o emisiones para usuarios que necesitan apoyo visual.
- Análisis de llamadas de atención al cliente: transcribir llamadas de soporte permite extraer información clave, detectar problemas recurrentes y evaluar la calidad del servicio.
- Transcripción de podcasts y contenido de audio: para crear artículos, resúmenes o metadatos textuales a partir de episodios de audio, facilitando su descubrimiento en buscadores.
- Traducción de audio en reuniones internacionales: el modelo puede traducir la voz de un participante a otro idioma, lo que facilita la comunicación en entornos multilingües sin necesidad de intérpretes.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index de la model card. No se han verificado de forma independiente.

| Dataset | Config | Split | Idioma | Test WER |
|---|---|---|---|---|
| LibriSpeech | clean | test | en | 3,0 |
| LibriSpeech | other | test | en | 5,4 |
| Common Voice 11.0 | hi | test | hi | 54,8 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. A título orientativo, con 1 543 304 960 parámetros, el modelo ocupa aproximadamente 6,2 GB en FP32 y 3,1 GB en FP16, sin contar la memoria de activaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Capacidad para ejecutarse en GPU de consumo: no confirmado; el tamaño de parámetros sugiere que podría ejecutarse en GPU con al menos 8 GB de VRAM en FP16, pero no se ha verificado.
- Opciones de despliegue: Transformers (PyTorch, TensorFlow y JAX) según los tags del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Notas |
|---|---|---|---|
| Jinstudio/whisper-large | 1 543 304 960 | Apache 2.0 | Modelo original large de Whisper, sin regularización adicional |
| openai/whisper-large-v2 | 1550 M | Apache 2.0 | Entrenado 2,5 veces más épocas con regularización; supera al modelo large original |
| openai/whisper-medium | 769 M | Apache 2.0 | Tamaño intermedio, más ligero pero con menor calidad en ASR |

No se dispone de datos de longitud de contexto para ninguno de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El model card del autor original recomienda utilizar openai/whisper-large-v2 en lugar de este modelo large, ya que fue entrenado durante más épocas con regularización y ofrece mejor rendimiento sin cambios en la arquitectura.
- El rendimiento en idiomas con menos representación en el conjunto de entrenamiento puede ser notablemente peor: en Common Voice 11.0 (hindi) se reporta un WER de 54,8, frente al 3,0 en LibriSpeech (clean) en inglés.
- No se han documentado sesgos específicos en la información disponible.
- No se han documentado riesgos de alucinación en la información disponible.
- La licencia Apache 2.0 permite el uso comercial sin restricciones adicionales.
- El repositorio no registra descargas ni likes, lo que puede indicar que se trata de una copia no oficial del modelo original de OpenAI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jinstudio/whisper-large
- Artículo original: https://arxiv.org/abs/2212.04356
- Repositorio de código de OpenAI: https://github.com/openai/whisper
- Model card del modelo original: https://huggingface.co/openai/whisper-large
