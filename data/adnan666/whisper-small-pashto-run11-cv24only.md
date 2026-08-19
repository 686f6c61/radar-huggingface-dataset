# Adnan666/whisper-small-pashto-run11-cv24only

## Resumen
El modelo **Adnan666/whisper-small-pashto-run11-cv24only** es un ajuste fino (fine-tuning) del modelo de reconocimiento automático de voz (ASR) **Whisper Small** de OpenAI, especializado en el idioma pashto. Lo desarrolla el usuario Adnan666 y se publica en Hugging Face. El nombre sugiere que el entrenamiento se realizó sobre la partición de Common Voice 24 (cv24) en una serie de ejecuciones (run11), aunque no se proporciona documentación detallada del proceso.

Con 241,7 millones de parámetros, hereda la arquitectura encoder-decoder basada en transformer de Whisper, diseñada para transcribir audio a texto. Su relevancia radica en cubrir una lengua de bajos recursos como el pashto, donde los modelos ASR comerciales suelen tener un rendimiento limitado. No obstante, la información pública es escasa: no se indica licencia, idiomas adicionales, ni métricas de evaluación, lo que obliga a tratar este modelo con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pashto (por nombre del modelo; no se listan otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de **openai/whisper-small**, un transformer encoder-decoder con atención estándar, entrenado originalmente sobre 680.000 horas de audio etiquetado en múltiples idiomas. El ajuste fino se realizó aparentemente sobre el dataset Common Voice 24 (según el sufijo "cv24only"), aunque no se especifican hiperparámetros, número de épocas, ni técnica de alineación. Tampoco hay información sobre si se empleó algún paso de RLHF o DPO. La ausencia de una ficha de modelo en Hugging Face impide conocer la composición exacta del corpus de entrenamiento, la proporción de hablantes o las condiciones de grabación.

## Capacidades
- Reconocimiento de voz en pashto: transcribe audio en este idioma a texto, heredando las capacidades de Whisper para manejar ruido y acentos variados.
- Generación de transcripciones con marcas de tiempo (segmentación temporal) si se usa el pipeline estándar de Whisper.
- No se ha confirmado soporte para traducción de voz, identificación de idioma o funciones de tool calling, ya que el modelo base no las incluye.
- El fine-tuning puede haber reducido el rendimiento en otros idiomas, aunque no hay datos para verificarlo.

## Casos de uso
- Transcripción de reuniones o entrevistas en pashto: el modelo puede convertir grabaciones de audio en texto para su posterior análisis o archivado, aprovechando la robustez de Whisper frente a condiciones acústicas variables.
- Subtitulado automático de vídeos en pashto: se puede integrar en un pipeline que segmenta el audio en ventanas de 30 segundos y genera subtítulos con marcas de tiempo.
- Asistencia a la documentación lingüística: investigadores pueden transcribir corpus orales en pashto para crear bases de datos textuales, reduciendo el trabajo manual.
- Aplicaciones de accesibilidad: conversión de contenido hablado en pashto a texto para personas con discapacidad auditiva en regiones donde este idioma es predominante.
- Análisis de llamadas de servicio al cliente: transcripción de grabaciones de centros de contacto en pashto para minería de texto y control de calidad.
- Desarrollo de asistentes de voz locales: sirve como componente ASR en un sistema de diálogo en pashto, aunque requiere integración con un modelo de lenguaje y gestión de diálogo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No hay métricas de WER (Word Error Rate) ni comparaciones con otros modelos ASR para pashto. Se recomienda evaluar el modelo sobre un conjunto de validación propio antes de usarlo.

## Requisitos de hardware
- VRAM estimada para inferencia: con 241,7 M de parámetros en fp32, el modelo ocupa unos 967 MB; en fp16, unos 484 MB. Con cuantización a int8, podría bajar a ~242 MB, aunque no se ofrecen archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, NVIDIA GTX 1650, RTX 3060). Para procesamiento por lotes, se recomienda una GPU con 6-8 GB (RTX 3060, RTX 3070, A10).
- En consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, `whisper` original de OpenAI, o servidores de inferencia como vLLM (aunque vLLM no soporta Whisper nativamente; es más adecuado usar TGI o un endpoint personalizado con FastAPI). También se puede exportar a ONNX para optimización.
- Latencia y throughput estimados: no hay datos publicados. Como referencia, Whisper Small procesa una ventana de 30 segundos en aproximadamente 1-2 segundos en una GPU moderna, pero depende del hardware y del lote.

## Comparativa con modelos similares
No se dispone de información suficiente para una comparativa rigurosa. El modelo es un fine-tuning de Whisper Small, por lo que la alternativa natural es el propio **openai/whisper-small** (multilingüe, con licencia MIT) y otros fine-tunings de pashto del mismo autor, como `Adnan666/whisper-small-pashto` o `Adnan666/whisper-small-pashto-stage2-fleursonly`. Sin embargo, no hay métricas publicadas para ninguno de ellos. Se recomienda evaluar sobre un conjunto de prueba en pashto antes de elegir.

## Limitaciones y advertencias
- Sesgos y alucinaciones: al ser un fine-tuning sobre un corpus específico (probablemente Common Voice), puede presentar sesgos hacia variedades dialectales o condiciones de grabación particulares, y puede alucinar contenido cuando el audio es ininteligible.
- Licencia incierta: no se indica licencia en la página del modelo. Esto impide conocer si se permite uso comercial, modificación o redistribución. Se debe contactar al autor antes de usarlo en proyectos comerciales.
- Sin documentación de entrenamiento: no hay detalles sobre el dataset exacto, el preprocesado ni la configuración de entrenamiento, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Idioma limitado: aunque el nombre sugiere pashto, no se confirma que el modelo funcione bien en otras lenguas. El fine-tuning puede degradar el rendimiento en inglés u otros idiomas presentes en Whisper original.
- Tamaño del repositorio: 12,5 GB en safetensors, lo que puede ser un inconveniente para despliegues en entornos con almacenamiento limitado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Adnan666/whisper-small-pashto-run11-cv24only
- Modelo relacionado (whisper-small-pashto): https://huggingface.co/Adnan666/whisper-small-pashto
- Modelo relacionado (stage2-fleursonly): https://huggingface.co/Adnan666/whisper-small-pashto-stage2-fleursonly
- Página de inferencia en FriendliAI: https://friendli.ai/models/Adnan666/whisper-small-pashto
- Referencia a Whisper (OpenAI): https://model.aibase.com/models/details/1915716551359225858
