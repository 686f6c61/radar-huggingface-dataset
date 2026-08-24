# Farhan-SE/whisper-large-v3-turbo-roman-urdu-model

## Resumen

El modelo `Farhan-SE/whisper-large-v3-turbo-roman-urdu-model` es un ajuste fino (fine-tune) del sistema de reconocimiento automático de voz (ASR) Whisper Large v3 Turbo de OpenAI, especializado en la transcripción de urdu en escritura romana (roman urdu). El autor, Farhan-SE, ha adaptado el modelo base para mejorar su rendimiento en este idioma y variante ortográfica, un caso de uso frecuente en comunicaciones digitales del sur de Asia donde el urdu se escribe con caracteres latinos.

El modelo conserva la arquitectura optimizada de Whisper Large v3 Turbo, que reduce el decoder a 4 capas (frente a las 32 del Large v3 original) para acelerar la inferencia con una pérdida mínima de precisión. Con 808,9 millones de parámetros y un tamaño de repositorio de 1,6 GB, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo. La model card publicada no incluye información sobre licencia, datos de entrenamiento ni métricas de evaluación, por lo que su adopción en producción requiere verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 segundos por segmento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32/fp16 probablemente) |
| Idiomas soportados | urdu romanizado (presumiblemente; no declarado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Whisper Large v3 Turbo, una versión optimizada de Whisper Large v3 publicada por OpenAI. La arquitectura es un transformer encoder-decoder con 32 capas de encoder y solo 4 capas de decoder, inspirada en Distil-Whisper. Esta reducción del decoder acelera la transcripción entre 2 y 3 veces respecto al Large v3, manteniendo una calidad cercana. El encoder procesa audios de 30 segundos convertidos en espectrogramas Mel de 128 canales, y el decoder genera tokens de texto autoregresivamente.

El ajuste fino para urdu romanizado se ha realizado sobre este modelo base, pero no se han publicado detalles del proceso: ni el dataset utilizado, ni el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica el régimen de entrenamiento (precisión mixta, hiperparámetros, etc.). La model card es una plantilla automática sin información sustantiva.

## Capacidades

- Transcripción de voz a texto en urdu romanizado, una variante no estándar que mezcla urdu con caracteres latinos y convenciones ortográficas informales.
- Reconocimiento de audio en inglés y otros idiomas si se conservan las capacidades del modelo base Whisper (no verificado en esta versión).
- Procesamiento de audio de hasta 30 segundos por segmento, con manejo de audio más largo mediante segmentación automática.
- Salida de texto con marcas de tiempo a nivel de segmento (típico de Whisper).
- No se ha confirmado soporte para traducción automática, diarización de hablantes ni otras tareas avanzadas.

## Casos de uso

- Transcripción de mensajes de voz en aplicaciones de mensajería: el modelo puede convertir notas de voz en urdu romanizado a texto para su archivado o búsqueda, aprovechando su especialización en esta variante.
- Subtitulado automático de vídeos en urdu: integrable en pipelines de generación de subtítulos para contenido de YouTube o redes sociales, donde el urdu romanizado es común en comentarios y descripciones.
- Asistentes de voz para servicios locales: permite construir asistentes que entiendan comandos hablados en urdu romanizado, útil en regiones donde esta escritura es más habitual que la árabe.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones de centros de contacto en urdu para su posterior análisis de sentimiento o extracción de información.
- Herramientas de accesibilidad: conversión de contenido hablado en urdu a texto para personas con discapacidad auditiva, especialmente en contextos informales donde se usa la escritura romana.
- Investigación sociolingüística: análisis de corpus orales en urdu romanizado para estudiar variaciones dialectales o fenómenos de code-switching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de WER (Word Error Rate) ni comparaciones con otros modelos ASR para urdu. El modelo base Whisper Large v3 Turbo reporta un WER medio de 7,4 en el conjunto Multilingual LibriSpeech, pero no se conoce el impacto del fine-tune en urdu.

## Requisitos de hardware

- VRAM estimada: con 809M parámetros, en fp16 ocupa aproximadamente 1,6 GB de memoria. Con cuantización a int8 podría reducirse a ~0,8 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16. Una RTX 3060, RTX 4060 o superior es suficiente. Para inferencia en lote, una A10 o A100 ofrecería mayor throughput.
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Hugging Face TGI, o mediante la pipeline de transformers. También es compatible con whisper.cpp si se convierte a GGUF, aunque no se ha publicado dicha conversión.
- Latencia y throughput: no disponibles. El modelo base turbo es aproximadamente 2-3 veces más rápido que Large v3, pero no hay mediciones específicas para esta versión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Farhan-SE/whisper-large-v3-turbo-roman-urdu | 809M | 30 s por segmento | no disponible | Fine-tune para urdu romanizado |
| openai/whisper-large-v3-turbo | 809M | 30 s por segmento | MIT | Modelo base, multilingüe |
| openai/whisper-large-v3 | 1.550M | 30 s por segmento | MIT | Más preciso pero más lento |

No se dispone de comparativas con otros modelos ASR específicos para urdu (como los basados en wav2vec2 o Conformer) por falta de datos públicos.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide su uso comercial sin consultar al autor. Se recomienda contactar con Farhan-SE antes de integrarlo en productos.
- No hay información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos en acentos, géneros o registros del urdu.
- El modelo puede alucinar contenido en audio ambiguo o con ruido, como cualquier sistema ASR.
- La especialización en urdu romanizado puede degradar el rendimiento en urdu con escritura árabe o en otros idiomas.
- No se han publicado métricas de evaluación, por lo que la calidad real es incierta.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace - Farhan-SE/whisper-large-v3-turbo-roman-urdu-model](https://huggingface.co/Farhan-SE/whisper-large-v3-turbo-roman-urdu-model)
- [HuggingFace - openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [GitHub - openai/whisper](https://github.com/openai/whisper)
- [Discusión sobre el release de turbo](https://github.com/openai/whisper/discussions/2363)
- [Documentación de Groq sobre Whisper Large v3 Turbo](https://console.groq.com/docs/model/whisper-large-v3-turbo)
