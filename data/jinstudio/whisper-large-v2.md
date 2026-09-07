# Jinstudio/whisper-large-v2

## Resumen

Whisper large-v2 es un modelo de reconocimiento automático de voz (ASR) y traducción de voz desarrollado originalmente por OpenAI. Esta instancia concreta, subida por el usuario Jinstudio, reproduce los pesos del modelo large-v2 original y está disponible en el Hub de HuggingFace bajo licencia Apache 2.0. El modelo se basa en una arquitectura Transformer encoder-decoder (sequence-to-sequence) y fue entrenado sobre 680 000 horas de audio etiquetado mediante supervisión débil, lo que le permite generalizar a numerosos dominios sin necesidad de ajuste fino.

La variante large-v2 se diferencia del Whisper large original en que fue entrenada durante 2,5 veces más épocas y con regularización adicional, lo que se traduce en una mayor robustez y rendimiento. Con aproximadamente 1.540 millones de parámetros, es uno de los modelos más grandes de la familia Whisper y soporta un amplio conjunto de idiomas, tanto para transcripción como para traducción de voz. Su relevancia actual radica en que sigue siendo una referencia en tareas de ASR multilingüe, con aplicaciones en subtitulado, accesibilidad y análisis de audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parámetros totales | 1.543.304.960 (≈1,54 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Multilingüe (99 idiomas según la lista de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también disponibles en PyTorch, TensorFlow y JAX según los tags) |

## Arquitectura y entrenamiento

Whisper large-v2 es un modelo Transformer encoder-decoder, también conocido como sequence-to-sequence. El codificador procesa el audio convertido en espectrogramas log-Mel y el decodificador genera la transcripción o traducción token a token. El modelo fue entrenado sobre 680 000 horas de audio etiquetado mediante supervisión débil, combinando datos en inglés y multilingües. Para la variante large-v2, el entrenamiento se prolongó durante 2,5 veces más épocas que el Whisper large original e incorporó regularización adicional, lo que mejora su capacidad de generalización.

El modelo no emplea técnicas como RLHF o DPO, ya que se trata de un sistema de reconocimiento de voz supervisado. Una característica destacable es el uso de tokens de contexto en el decodificador, que permiten indicar el idioma de salida y la tarea (transcripción o traducción), así como la predicción de marcas de tiempo mediante el token `<|notimestamps|>`. El modelo puede predecir automáticamente el idioma y la tarea si no se fuerzan estos tokens.

## Capacidades

- Transcripción de voz en el mismo idioma del audio.
- Traducción de voz a otro idioma (speech translation).
- Reconocimiento multilingüe con soporte para un gran número de idiomas.
- Predicción de marcas de tiempo (timestamps) en las transcripciones.
- Generación de texto a partir de audio, sin necesidad de ajuste fino.
- No soporta tool calling, function calling ni razonamiento multi-step, al ser un modelo de ASR y no un modelo de lenguaje conversacional.

## Casos de uso

- Subtitulado automático de vídeos: el modelo transcribe audio de vídeos en múltiples idiomas y puede predecir marcas de tiempo, lo que permite generar subtítulos sincronizados de forma automática.
- Transcripción de reuniones y entrevistas: gracias a su capacidad multilingüe, puede transcribir conversaciones en distintos idiomas, facilitando la generación de actas y resúmenes.
- Traducción de voz en tiempo real: el modo de traducción permite convertir audio en un idioma a texto en otro idioma, útil para servicios de interpretación o comunicación internacional.
- Accesibilidad para personas con discapacidad auditiva: la transcripción automática de audio en tiempo real puede integrarse en aplicaciones de accesibilidad para ofrecer subtítulos en directo.
- Análisis de llamadas de atención al cliente: el modelo puede transcribir llamadas telefónicas para su posterior análisis, extracción de temas o evaluación de calidad.
- Indexación y búsqueda de audio: la transcripción de archivos de audio permite indexar su contenido textual y hacerlo buscable en sistemas de gestión documental.
- Asistentes de voz: puede integrarse en pipelines de reconocimiento de voz para asistentes que necesiten entender comandos hablados en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 1.543.304.960 parámetros, por lo que en FP16 los pesos ocupan aproximadamente 3,1 GB y en FP32 unos 6,2 GB.
- Para inferencia en FP16 se recomienda una GPU con al menos 8 GB de VRAM, como una RTX 3060 o superior.
- Para FP32 o lotes grandes, se recomienda una GPU con 12 GB o más, como una RTX 3090 o una A100.
- Despliegue con la librería Transformers de HuggingFace (PyTorch, TensorFlow, JAX). No se dispone de información sobre integración con vLLM, llama.cpp u Ollama en la documentación proporcionada.
- No se dispone de datos de latencia o throughput específicos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper large-v2 (Jinstudio) | 1.543.304.960 | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Whisper large (OpenAI) | 1.550 M | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Whisper medium (OpenAI) | 769 M | no disponible | no disponible | Apache 2.0 | HuggingFace |

La tabla de la model card indica que large-v2 se entrenó durante más épocas que large, lo que sugiere un mejor rendimiento, aunque no se aportan cifras concretas. No se dispone de comparativas con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un re-subido del usuario Jinstudio y no el checkpoint original de OpenAI. Tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido ampliamente validado por la comunidad.
- No se especifican sesgos conocidos ni riesgos de alucinación en la información disponible. Como todo modelo de ASR, su rendimiento puede degradarse con audio de baja calidad o ruidoso.
- La licencia Apache 2.0 permite el uso comercial, pero al tratarse de un re-subido, se recomienda verificar la procedencia de los pesos antes de usarlo en producción.
- La longitud de contexto no está especificada en la información proporcionada, por lo que se desconoce el límite exacto de entrada de audio.
- No se dispone de resultados de benchmarks para esta instancia concreta, por lo que su rendimiento real debe validarse en el caso de uso objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinstudio/whisper-large-v2
- Modelo original de OpenAI en HuggingFace: https://huggingface.co/openai/whisper-large-v2
- Paper original: https://arxiv.org/abs/2212.04356
- Repositorio de código original: https://github.com/openai/whisper
- Anuncio de la versión large-v2 en GitHub: https://github.com/openai/whisper/discussions/661
