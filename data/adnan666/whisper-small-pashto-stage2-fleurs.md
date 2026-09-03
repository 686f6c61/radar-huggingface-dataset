# Adnan666/whisper-small-pashto-stage2-fleurs

## Resumen

El modelo `whisper-small-pashto-stage2-fleurs` es un modelo de reconocimiento automático de voz (ASR) fine-tuneado sobre la arquitectura Whisper small de OpenAI, especializado en el idioma pashto. Ha sido desarrollado por el usuario Adnan666 y publicado en HuggingFace con licencia Apache 2.0. Se trata de la segunda etapa de un proceso de fine-tuning: parte del checkpoint `Adnan666/whisper-small-pashto-run11-cv24only`, que a su vez es una adaptación previa del modelo base Whisper small entrenado con datos de Common Voice 24, y se afina adicionalmente sobre el dataset FLEURS.

El modelo está diseñado para resolver la tarea de transcripción automática de voz en pashto, un idioma de bajos recursos que tradicionalmente cuenta con pocos sistemas ASR disponibles. Su relevancia radica en que demuestra la viabilidad de adaptar modelos multilingües preentrenados a lenguas minoritarias mediante un proceso de fine-tuning en dos etapas. Con 241,7 millones de parámetros y una arquitectura encoder-decoder basada en transformers, ofrece un equilibrio razonable entre calidad de transcripción y requisitos computacionales, siendo ejecutable en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (limitación inherente de Whisper small) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, cuantización no publicada) |
| Idiomas soportados | Pashto (entrenado específicamente para este idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper small de OpenAI, un transformer encoder-decoder con atención estándar que procesa espectrogramas Mel de audio de hasta 30 segundos. El encoder convierte el audio en representaciones latentes y el decoder genera el texto transcrito de forma autorregresiva. Whisper small tiene aproximadamente 244 millones de parámetros, con 12 capas de encoder y 12 capas de decoder.

El entrenamiento se realizó en dos etapas. La primera etapa, correspondiente al checkpoint base `whisper-small-pashto-run11-cv24only`, consistió en un fine-tuning sobre el dataset Common Voice 24 en pashto. La segunda etapa, que da nombre a este modelo, afina el checkpoint resultante sobre el dataset FLEURS. Los hiperparámetros de esta segunda fase incluyen una tasa de aprendizaje de 1e-5, tamaño de batch de 16 (con acumulación de gradientes), scheduler lineal con 50 pasos de warmup y 5 épocas completas. Se utilizó entrenamiento con precisión mixta nativa (AMP) y el optimizador Adam con betas estándar. El dataset de entrenamiento no está documentado en la model card, por lo que se desconoce el número exacto de horas de audio y la composición exacta de los datos.

## Capacidades

- Transcripción de voz en pashto: el modelo convierte audio en texto en pashto, siendo su capacidad principal y la única documentada explícitamente.
- Procesamiento de audio de hasta 30 segundos por segmento, herencia de la arquitectura Whisper.
- Fine-tuning específico para el idioma pashto, con mejor rendimiento esperable en este idioma frente al Whisper original.
- No se documentan capacidades de traducción, identificación de idioma, ni soporte multilingüe adicional más allá del pashto.
- No se documentan capacidades de tool calling, razonamiento multi-paso, ni modo de pensamiento (thinking mode), ya que es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en pashto: el modelo puede transcribir grabaciones de audio de hasta 30 segundos por segmento, permitiendo generar actas textuales de reuniones, entrevistas periodísticas o testimonios en pashto. Su tamaño reducido permite ejecutarlo en entornos con recursos limitados.
- Subtitulado automático de vídeos en pashto: integrado en un pipeline de procesamiento de vídeo, el modelo puede generar subtítulos para contenido audiovisual en pashto, facilitando el acceso a medios de comunicación y contenido educativo a hablantes de este idioma.
- Archivado y búsqueda de contenido de audio: al transcribir archivos de audio históricos o radiofónicos en pashto, se habilita la búsqueda textual dentro de esos archivos, lo que resulta útil para bibliotecas digitales, archivos de noticias y proyectos de preservación cultural.
- Asistencia a traductores y lingüistas: el modelo puede servir como herramienta de apoyo para traductores que trabajan con audio en pashto, generando borradores de transcripción que luego pueden ser revisados y corregidos manualmente, acelerando el flujo de trabajo.
- Desarrollo de asistentes de voz en pashto: combinado con un sistema de síntesis de voz y un modelo de lenguaje, el modelo ASR puede formar parte de un asistente de voz en pashto, permitiendo la interacción por voz en aplicaciones móviles o dispositivos domésticos.
- Análisis de llamadas en centros de atención al cliente: en regiones donde el pashto es lengua vehicular, el modelo puede transcribir llamadas de soporte para su posterior análisis, detección de problemas recurrentes o control de calidad del servicio.

## Benchmarks y rendimiento

Los resultados oficiales publicados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Validation Loss | 0,5410 |
| WER (Word Error Rate) | 36,12 % |

La evolución del WER durante el entrenamiento muestra una mejora progresiva desde 38,41 % en el paso 50 hasta el valor final de 36,12 % en el paso 500. La pérdida de validación alcanza su mínimo de 0,5286 en el paso 250, aunque el valor final es ligeramente superior (0,5410).

No se han publicado resultados comparativos con otros modelos en la información disponible. Un WER de 36,12 % indica que aproximadamente una de cada tres palabras se transcribe de forma incorrecta, lo que sugiere que el modelo es útil como base para transcripción asistida pero probablemente no alcanza la precisión necesaria para transcripción automática sin revisión humana en contextos críticos. Tampoco se dispone de datos sobre latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: Whisper small en precisión FP32 requiere aproximadamente 1,5 GB de VRAM. Con cuantización a int8, el requisito se reduce a unos 0,8 GB, y con cuantización a int4, a unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32. Una NVIDIA GTX 1650, RTX 3060 o equivalente de AMD es más que suficiente. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, el modelo cabe sin problema en cualquier GPU de consumo actual, incluso en las gamas más bajas.
- Opciones de despliegue: al ser un modelo Whisper estándar, puede desplegarse con las herramientas habituales del ecosistema: transformers de HuggingFace, faster-whisper, whisper.cpp (con conversión a GGUF), o mediante servidores de inferencia como vLLM o TGI.
- Latencia y throughput: no se han publicado datos específicos. Como referencia orientativa, Whisper small en una GPU RTX 3060 suele procesar un segmento de 30 segundos en aproximadamente 1-2 segundos con batch size 1.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER (pashto) | Licencia |
|---|---|---|---|---|
| whisper-small-pashto-stage2-fleurs | 241,7 M | Pashto | 36,12 % | Apache 2.0 |
| openai/whisper-small | 244 M | Multilingüe (99 idiomas) | no disponible | MIT |
| openai/whisper-large-v3 | 1550 M | Multilingüe (99 idiomas) | no disponible | MIT |

No se dispone de datos de WER para pashto de los modelos Whisper originales en la información proporcionada, por lo que no es posible realizar una comparación cuantitativa directa. En términos cualitativos, el fine-tuning específico en pashto debería ofrecer un rendimiento superior al del Whisper small genérico para este idioma, aunque el WER de 36,12 % sugiere que la mejora podría ser limitada. El modelo Whisper large-v3, con más de 6 veces más parámetros, probablemente ofrezca un WER inferior en pashto, aunque a costa de mayores requisitos de hardware.

## Limitaciones y advertencias

- El WER de 36,12 % es relativamente alto, lo que implica que aproximadamente una de cada tres palabras se transcribe incorrectamente. El modelo no es adecuado para transcripción automática sin supervisión humana en contextos donde la precisión sea crítica (médico, legal, etc.).
- El dataset de entrenamiento no está documentado, lo que impide conocer la variedad de acentos, registros y condiciones de grabación cubiertas. El rendimiento puede degradarse significativamente con audio de baja calidad, ruido de fondo o acentos no representados en los datos de entrenamiento.
- El modelo hereda la limitación de Whisper de procesar segmentos de audio de máximo 30 segundos. Audios más largos requieren segmentación previa, lo que puede introducir errores en los límites de los segmentos.
- No se documentan los idiomas soportados explícitamente más allá del pashto. El modelo podría comportarse de forma impredecible con otros idiomas.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable verificar que los datos de entrenamiento (Common Voice 24 y FLEURS) no tengan restricciones adicionales de uso.
- No se han publicado evaluaciones sobre sesgos de género, edad o dialecto en el reconocimiento de voz, por lo que se desconocen posibles disparidades de rendimiento entre distintos grupos de hablantes.
- El modelo se distribuye únicamente en formato safetensors, sin cuantizaciones oficiales. Para desplegarlo en entornos con recursos limitados, será necesario realizar la cuantización manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adnan666/whisper-small-pashto-stage2-fleurs
- Modelo base (etapa 1): https://huggingface.co/Adnan666/whisper-small-pashto-run11-cv24only
- Documentación de Whisper (OpenAI): https://github.com/openai/whisper
- Dataset Common Voice: https://commonvoice.mozilla.org/
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
