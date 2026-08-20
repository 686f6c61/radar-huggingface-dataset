# heyunchao/MOSS-Transcribe-Diarize

## Resumen

MOSS-Transcribe-Diarize 0.9B es un modelo de comprensión de audio de extremo a extremo desarrollado por el equipo OpenMOSS, diseñado para transcripción y diarización de hablantes en audio largo de múltiples interlocutores. A diferencia de los sistemas tradicionales que combinan módulos separados de ASR y diarización, este modelo realiza ambas tareas de forma conjunta en una sola pasada, generando transcripciones con marcas de tiempo y etiquetas de hablante anónimas como `[S01]`, `[S02]`, además de poder anotar eventos acústicos. Está pensado para reuniones, llamadas, podcasts, entrevistas, conferencias y vídeos.

El modelo tiene 908 millones de parámetros (0,9B) y soporta inferencia de una sola pasada sobre grabaciones de hasta 90 minutos. Según la model card, es capaz de transcribir y diarizar en más de 50 idiomas, aunque los metadatos de Hugging Face solo listan inglés y chino. Ganó el primer puesto en el 2nd MLC-SLM Challenge en INTERSPEECH 2026, cubriendo 14 idiomas. Se distribuye bajo licencia Apache 2.0 y requiere código remoto de Transformers para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la documentacion (modelo audio-texto a texto con codigo remoto de Transformers) |
| Parametros totales | 908.513.280 (0,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 90 minutos de audio (segun model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles y chino (segun metadatos de HF); la model card afirma mas de 50 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Se describe como un modelo de comprensión de audio de extremo a extremo que combina transcripción y diarización en una sola pasada. El repositorio de Hugging Face incluye código remoto personalizado de Transformers, lo que sugiere una arquitectura híbrida con un encoder de audio y un decoder de lenguaje, probablemente similar a otros modelos de audio-texto como Whisper, pero adaptado para diarización. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens, ni si se usaron técnicas como RLHF o DPO. La innovación principal es la integración conjunta de ASR y diarización, evitando pipelines separados y permitiendo la generación de transcripciones estructuradas con etiquetas de hablante y marcas de tiempo en una única inferencia.

## Capacidades

- Transcripción de audio largo (hasta 90 minutos) en una sola pasada, con marcas de tiempo.
- Diarización de hablantes integrada, asignando etiquetas anónimas como `[S01]`, `[S02]` sin necesidad de un sistema separado.
- Anotación de eventos acústicos, proporcionando información adicional sobre el contenido del audio.
- Soporte de hotwords personalizados para términos específicos de dominio, mejorando la precisión en vocabulario especializado.
- Capacidad multilingüe: la model card afirma soporte para más de 50 idiomas, aunque los metadatos de HF solo listan inglés y chino.
- Generación de transcripciones estructuradas en formato de subtítulos, con etiquetas de hablante y timestamps.
- Inferencia de una sola pasada, lo que reduce la latencia frente a sistemas que combinan ASR y diarización por separado.

## Casos de uso

- Transcripción de reuniones de empresa: el modelo puede procesar grabaciones de reuniones de hasta 90 minutos y generar actas con identificación de hablantes, facilitando el seguimiento de quién dijo qué y cuándo.
- Subtitulado automático de vídeos y podcasts: genera subtítulos con marcas de tiempo y etiquetas de hablante, útil para plataformas de contenido y accesibilidad.
- Análisis de llamadas de atención al cliente: permite transcribir y diarizar llamadas para extraer métricas de calidad, detectar temas recurrentes y evaluar el desempeño de agentes.
- Documentación de entrevistas y conferencias: convierte grabaciones de entrevistas o ponencias en texto estructurado con identificación de participantes, agilizando la creación de resúmenes y artículos.
- Investigación en ciencias sociales: facilita el análisis cualitativo de grupos focales o entrevistas semiestructuradas, proporcionando transcripciones con atribución de hablante.
- Generación de subtítulos para vídeos educativos: soporta hotwords para términos técnicos, mejorando la precisión en contenido especializado como clases de medicina o ingeniería.
- Archivado y búsqueda de contenido audiovisual: al generar transcripciones con timestamps, permite indexar y buscar dentro de archivos de audio o vídeo de larga duración.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con métricas CER (Character Error Rate), cpCER (concatenated minimum-permutation CER) y Δcp en los conjuntos AISHELL-4, Alimeeting, Podcast y Movies, comparando con Doubao, ElevenLabs, GPT-4o, Gemini 2.5 Pro, Gemini 3 Pro y VIBEVOICE ASR. Sin embargo, en el extracto proporcionado no se muestran los valores numéricos para MOSS-Transcribe-Diarize 0.9B (la fila se corta). Por tanto, no se dispone de los resultados concretos de este modelo en la información disponible. Se recomienda consultar la model card completa o el paper para obtener los datos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación disponible.
- El tamaño del repositorio es de 3,7 GB, lo que sugiere que el modelo en precisión FP16 o FP32 podría requerir entre 4 y 8 GB de VRAM para inferencia, pero esto es una estimación no confirmada.
- Al ser un modelo de 0,9B, es probable que pueda ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores, pero no hay datos oficiales.
- Para despliegue, la model card menciona soporte para vLLM y SGLang, así como una aplicación web de subtítulos. No se mencionan opciones como llama.cpp u Ollama.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

La model card compara MOSS-Transcribe-Diarize 0.9B con Doubao, ElevenLabs, GPT-4o, Gemini 2.5 Pro, Gemini 3 Pro y VIBEVOICE ASR en términos de CER, cpCER y Δcp. Sin embargo, al no disponer de los valores numéricos de MOSS en el extracto, no es posible realizar una comparación cuantitativa. Estos modelos son en su mayoría servicios comerciales propietarios, mientras que MOSS es de código abierto con licencia Apache 2.0. No se dispone de información sobre otros modelos open source comparables en la misma categoría (ASR + diarización integrada) en la documentación proporcionada.

## Limitaciones y advertencias

- No se documentan limitaciones específicas en la model card. Sin embargo, al ser un modelo de 0,9B, es probable que tenga una precisión inferior en comparación con sistemas más grandes en entornos con mucho ruido o acentos poco representados.
- La diarización puede fallar en casos de solapamiento de hablantes o audio de baja calidad, aunque no se menciona explícitamente.
- Los metadatos de Hugging Face solo listan inglés y chino, a pesar de que la model card afirma soporte para más de 50 idiomas. Esto podría indicar una validación limitada en otros idiomas.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código remoto de terceros; se recomienda auditar el código antes de usarlo en entornos de producción.
- No se han publicado resultados de benchmarks completos en la información disponible, por lo que el rendimiento real en tareas específicas debe validarse con datos propios.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución.

## Enlaces

- [Hugging Face (repo de heyunchao)](https://huggingface.co/heyunchao/MOSS-Transcribe-Diarize)
- [Hugging Face (repo de OpenMOSS-Team)](https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize)
- [GitHub](https://github.com/OpenMOSS/MOSS-Transcribe-Diarize)
- [Paper arXiv](https://arxiv.org/abs/2601.01554)
- [2nd MLC-SLM Challenge](https://www.nexdata.ai/competition/mlc-slm)
