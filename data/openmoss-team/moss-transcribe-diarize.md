# OpenMOSS-Team/MOSS-Transcribe-Diarize

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprensión de audio de extremo a extremo desarrollado por el equipo OpenMOSS, diseñado para abordar de forma unificada la transcripción de audio largo, la diarización de hablantes, la generación de marcas de tiempo y la detección de eventos acústicos. A diferencia de los sistemas tradicionales que encadenan un motor ASR con un módulo de diarización independiente, este modelo produce directamente una transcripción estructurada con etiquetas de hablante anónimas (p. ej. `[S01]`, `[S02]`) en una única pasada, lo que simplifica el pipeline y reduce errores de propagación.

El modelo tiene 908 millones de parámetros (0.9B) y está publicado bajo licencia Apache-2.0. Según su model card, soporta transcripción y diarización en más de 50 idiomas y es capaz de procesar grabaciones de audio de hasta 90 minutos de duración en inferencia de una sola pasada. Además, admite el uso de *hotwords* personalizados y la generación de anotaciones de eventos acústicos, lo que lo hace especialmente útil para reuniones, llamadas, podcasts, entrevistas y vídeos. El modelo ganó el primer puesto en el 2nd MLC-SLM Challenge celebrado en INTERSPEECH 2026, compitiendo en 14 idiomas.

Aunque el repositorio de HuggingFace incluye código remoto personalizado para cargar el modelo con `trust_remote_code=True`, no se han publicado detalles sobre la arquitectura interna (tipo de transformer, capas, etc.) ni sobre el proceso de entrenamiento (datos, tokens, método de alineación). Esta falta de transparencia limita la reproducibilidad, pero el modelo está disponible públicamente y puede desplegarse con vLLM y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de extremo a extremo audio-texto (arquitectura interna no publicada) |
| Parametros totales | 908.513.280 (0.9B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (soporta audio de hasta 90 minutos en una sola pasada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente fp32 o fp16) |
| Idiomas soportados | Ingles y chino (segun metadatos de HuggingFace); la model card indica transcripcion en mas de 50 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles tecnicos sobre la arquitectura interna del modelo. La model card lo describe como un "modelo de comprension de audio de extremo a extremo" que combina transcripcion y diarizacion en un solo paso, pero no especifica si se basa en un transformer decoder, en una arquitectura encoder-decoder, ni el numero de capas o dimensiones. El repositorio de HuggingFace incluye codigo remoto personalizado para cargar el modelo con `trust_remote_code=True`, lo que sugiere que la implementacion no esta estandarizada en la libreria Transformers.

Tampoco se ha proporcionado informacion sobre el proceso de entrenamiento: no se conocen el numero de tokens de entrenamiento, la composicion del dataset, ni si se utilizaron tecnicas de RLHF, DPO o supervision directa. La unica referencia al entrenamiento es la mencion de que el modelo fue entrenado para tareas de transcripcion larga, diarizacion y deteccion de eventos acusticos, pero sin datos cuantitativos.

## Capacidades

- Transcripcion de audio largo: procesa grabaciones de hasta 90 minutos en una sola pasada, generando texto con marcas de tiempo.
- Diarizacion de hablantes: asigna etiquetas anonimas consistentes (`[S01]`, `[S02]`, etc.) sin necesidad de un pipeline de diarizacion separado.
- Generacion de marcas de tiempo: cada segmento transcrito incluye informacion temporal alineada.
- Anotacion de eventos acusticos: puede emitir anotaciones sobre eventos no verbales (risas, aplausos, ruidos, etc.) si se solicita mediante prompt.
- Soporte de *hotwords* personalizados: permite indicar terminos especificos del dominio para mejorar la transcripcion de vocabulario especializado.
- Capacidades multilingues: segun la model card, soporta transcripcion y diarizacion en mas de 50 idiomas, aunque los metadatos de HuggingFace solo listan ingles y chino.
- Generacion guiada por prompt: admite instrucciones personalizadas de transcripcion, como el formato de salida o la inclusion de anotaciones acusticas.

## Casos de uso

- Transcripcion de reuniones de trabajo: el modelo puede procesar grabaciones de reuniones de hasta 90 minutos y generar un acta con intervenciones de cada participante etiquetadas como `[S01]`, `[S02]`, etc. Su capacidad de diarizacion integrada evita la necesidad de combinar herramientas separadas, reduciendo la complejidad del pipeline y el coste computacional.
- Generacion de subtitulos para videos y podcasts: dado un archivo de audio o video, el modelo produce una transcripcion con marcas de tiempo que puede convertirse directamente en subtitulos (SRT o VTT). La deteccion de eventos acusticos permite anadir indicaciones como `[risas]` o `[musica]` al texto.
- Analisis de llamadas de atencion al cliente: las empresas pueden transcribir llamadas de soporte y clasificar automaticamente las interacciones por hablante (agente vs. cliente), facilitando el analisis de sentimiento y la evaluacion de calidad sin necesidad de un sistema de diarizacion adicional.
- Transcripcion de entrevistas e investigaciones cualitativas: los investigadores pueden procesar entrevistas largas y obtener una transcripcion con etiquetas de hablante, lo que agiliza el analisis de contenido y la codificacion de respuestas.
- Archivado y busqueda de contenido audiovisual: los medios de comunicacion pueden indexar archivos de audio y video mediante transcripciones con marcas de tiempo, habilitando busquedas por contenido hablado y por hablante.
- Asistentes de documentacion medica o legal: en entornos donde se graban consultas o deposiciones, el modelo puede generar transcripciones estructuradas con identificacion de hablante, siempre que se validen los resultados por un profesional antes de su uso oficial.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con metricas CER (Character Error Rate), cpCER (concatenated minimum-permutation CER) y Delta-cp en cuatro conjuntos de datos: AISHELL-4, Alimeeting, Podcast y Movies. Sin embargo, en la informacion extraida no se muestran los valores correspondientes a MOSS-Transcribe-Diarize 0.9B (la fila aparece cortada). Los valores de los modelos competidores son:

| Modelo | AISHELL-4 (CER/cpCER/Δcp) | Alimeeting (CER/cpCER/Δcp) | Podcast (CER/cpCER/Δcp) | Movies (CER/cpCER/Δcp) |
|---|---|---|---|---|
| Doubao | 18.18 / 27.86 / 9.68 | 25.25 / 37.57 / 12.31 | 7.93 / 10.54 / 2.61 | 9.94 / 30.88 / 20.94 |
| ElevenLabs | 19.58 / 37.95 / 18.36 | 25.70 / 36.69 / 10.99 | 8.50 / 11.34 / 2.85 | 11.49 / 17.85 / 6.37 |
| GPT-4o | - | - | - | 14.37 / 23.67 / 9.31 |
| Gemini 2.5 Pro | 42.70 / 53.42 / 10.72 | 27.43 / 41.64 / 14.21 | 7.38 / 10.23 / 2.85 | 15.46 / 24.15 / 8.69 |
| Gemini 3 Pro | 22.75 / 27.43 / 4.68 | 26.75 / 32.84 / 6.09 | - | 8.62 / 14.73 / 6.11 |
| VIBEVOICE ASR | 21.40 / 24.99 / 3.59 | 27.40 / 29.33 / 1.93 | 27.94 / 48.30 / 20.36 | 14.59 / 42.54 / 27.94 |

No se han publicado los resultados de MOSS-Transcribe-Diarize 0.9B en la informacion disponible. La model card menciona que el modelo obtuvo el primer puesto en el 2nd MLC-SLM Challenge de INTERSPEECH 2026, pero no se proporcionan las metricas concretas de esa competicion.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Dado que el modelo tiene 908 millones de parametros y los pesos en safetensors ocupan aproximadamente 3.7 GB, se puede estimar:

- VRAM estimada para inferencia: en precision fp16, los pesos ocuparian unos 1.8 GB, por lo que una GPU con 4-6 GB de VRAM seria suficiente para inferencia basica. En fp32, se necesitarian unos 3.6 GB, lo que requiere al menos 8 GB de VRAM.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo sin problemas. Para despliegues de produccion con alta concurrencia, se recomienda una A10, A100 o H100.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs de consumo con 8 GB o mas de VRAM.
- Opciones de despliegue: el repositorio oficial menciona soporte para vLLM y SGLang. Tambien se puede cargar con Transformers usando `trust_remote_code=True`. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos oficiales. Al ser un modelo de 0.9B, se espera una latencia moderada en GPU de consumo, pero sin cifras concretas no es posible dar una estimacion fiable.

## Comparativa con modelos similares

MOSS-Transcribe-Diarize 0.9B se compara directamente con sistemas comerciales y modelos de gran tamano que ofrecen transcripcion y diarizacion. La tabla de benchmarks anterior incluye a Doubao, ElevenLabs, GPT-4o, Gemini 2.5 Pro, Gemini 3 Pro y VIBEVOICE ASR. Sin embargo, no se dispone de los resultados de MOSS para establecer una comparacion cuantitativa directa.

En terminos de caracteristicas, MOSS se diferencia por ser un modelo abierto (Apache-2.0) con un tamano reducido (0.9B) en comparacion con los modelos propietarios de gran escala. Su capacidad para procesar audio de 90 minutos en una sola pasada y realizar diarizacion integrada lo posiciona como una alternativa ligera a soluciones como Whisper (que no realiza diarizacion nativa) o a pipelines compuestos por ASR + diarizacion (como pyannote + Whisper). No se dispone de una comparativa directa con Whisper en los datos proporcionados.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos o comportamientos problematicos del modelo. Al ser un sistema de transcripcion, puede presentar errores en acentos poco representados, ruido de fondo o habla superpuesta, lo que afecta especialmente a la diarizacion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir texto que no corresponde al audio, especialmente en segmentos de baja calidad o con solapamiento de voces. Se recomienda validar las transcripciones en aplicaciones criticas.
- Limitaciones de idioma: aunque la model card afirma soporte para mas de 50 idiomas, los metadatos oficiales solo listan ingles y chino. El rendimiento en otros idiomas no esta documentado con metricas publicas.
- Longitud de contexto: no se especifica la longitud de contexto en tokens. La capacidad de procesar audio de 90 minutos puede estar limitada por la memoria de la GPU y la implementacion del modelo.
- Dependencia de codigo personalizado: el modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar codigo no auditado por la comunidad. Esto puede suponer un riesgo de seguridad en entornos de produccion.
- Falta de transparencia: no se han publicado detalles sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados, lo que dificulta la evaluacion independiente y la reproducibilidad.
- Licencia: Apache-2.0 permite uso comercial, pero es responsabilidad del usuario revisar los terminos completos de la licencia y las posibles restricciones de los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Transcribe-Diarize
- Paper en arXiv: https://arxiv.org/abs/2601.01554
- Receta de despliegue con vLLM: https://recipes.vllm.ai/OpenMOSS-Team/MOSS-Transcribe-Diarize
