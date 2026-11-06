# munasco/eko-whisper-large-v1

## Resumen

eko-whisper-large-v1 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario munasco y publicado en Hugging Face bajo el identificador `munasco/eko-whisper-large-v1`. Se trata de un ajuste fino (fine-tune) de `openai/whisper-large-v3` orientado especificamente a lenguas y variedades linguisticas de Nigeria: yoruba (`yo`), igbo (`ig`), pidgin nigeriano (`pcm`) e ingles nigeriano (`en`). El modelo resuelve el problema de la baja cobertura de estas lenguas en los sistemas ASR genericos, que suelen presentar tasas de error elevadas en variedades africanas del ingles y en lenguas de bajos recursos.

Arquitectura y tamano: al derivar de Whisper Large v3, conserva la arquitectura transformer encoder-decoder con aproximadamente 1.610 millones de parametros (1.609.879.040 segun los pesos en safetensors). El repositorio ocupa 3,2 GB y los pesos se distribuyen en formato safetensors, compatible con la libreria `transformers`. La licencia es `ekogenie-research` (categorizada como "other" en Hugging Face) y el acceso al modelo esta restringido (gated), por lo que es necesario aceptar las condiciones en la plataforma antes de descargarlo.

Su relevancia actual radica en la escasez de modelos ASR especializados en lenguas nigerianas y en la creciente demanda de transcripcion automatica para contenidos en pidgin y lenguas locales. El modelo declara resultados de WER (Word Error Rate) normalizado en varios conjuntos de evaluacion de referencia para estas lenguas, lo que permite comparar su rendimiento con el modelo base y con alternativas multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.609.879.040 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, pcm, yo, ig |
| Licencia | ekogenie-research (etiquetada como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3`, un transformer encoder-decoder con aproximadamente 1.550 millones de parametros en su version original, disenado para tareas de reconocimiento y traduccion de voz. El ajuste fino se ha realizado sobre datos de lenguas nigerianas, segun indican las etiquetas del repositorio (`nigeria`, `yoruba`, `igbo`, `pidgin`, `nigerian-english`) y los conjuntos de evaluacion empleados, que incluyen variantes de AfriSpeech-NG y Common Voice 27 para igbo, pidgin y yoruba, asi como conjuntos de desarrollo de DSN (posiblemente un corpus de habla nigeriana). No se dispone de informacion detallada sobre el numero de tokens de audio utilizados, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos, RLHF o DPO.

La innovacion principal es la especializacion linguistica: el modelo conserva la capacidad acustica y de modelado de lenguaje de Whisper Large v3, pero reorienta sus predicciones hacia las variedades nigerianas. No se documentan innovaciones arquitectonicas adicionales como atencion lineal, decodificacion especulativa o modos de pensamiento. El modelo incluye una `model-index` con resultados de WER declarados por el autor, aunque estos no estan verificados (`verified: false`).

## Capacidades

- Reconocimiento automatico del habla (ASR) en yoruba, igbo, pidgin nigeriano e ingles nigeriano.
- Transcripcion de audio a texto con normalizacion de texto (los WER reportados son "normalised").
- Soporte multilingue limitado a las cuatro lenguas indicadas; no se declaran capacidades de traduccion de voz.
- Compatible con la pipeline `automatic-speech-recognition` de `transformers`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No se declaran capacidades de vision, audio generativo ni modos de pensamiento.

## Casos de uso

- Transcripcion de contenido audiovisual en pidgin nigeriano: el modelo puede convertir podcasts, videos de YouTube o retransmisiones en pidgin a texto, un caso relevante dada la gran cantidad de contenido informal en esta variedad y la baja cobertura de los ASR genericos.
- Subtitulado de medios en yoruba e igbo: util para productoras y plataformas que necesitan subtitulos automaticos en lenguas nigerianas, con la ventaja de que el modelo ha sido ajustado especificamente sobre estas lenguas.
- Atencion al cliente en centros de llamadas nigerianos: transcripcion de conversaciones telefonicas en ingles nigeriano y pidgin para su analisis posterior, aprovechando el ajuste sobre acentos y vocabulario locales.
- Investigacion linguistica y sociolinguistica: generacion de transcripciones a gran escala de corpus orales en yoruba, igbo y pidgin para estudios de variacion y cambio linguistico.
- Accesibilidad: conversion de discurso a texto para personas con discapacidad auditiva en comunidades nigerianas, donde los modelos multilingues genericos suelen fallar en las variedades locales.
- Documentacion de reuniones y entrevistas: transcripcion de reuniones de trabajo o entrevistas de campo en las que los participantes alternan entre ingles nigeriano, pidgin y lenguas locales.
- Preprocesamiento para pipelines de NLP: generar transcripciones que alimenten sistemas de analisis de sentimiento, resumen o busqueda en lenguas nigerianas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la `model-index` (WER normalizado, no verificado):

| Conjunto de evaluacion | WER (%) |
|---|---|
| afrispeech-ng-test-reviewed | 9,34 |
| afrispeech-ng-test-v2 | 10,61 |
| cv27-ig-test | 19,45 |
| cv27-pcm-test | 16,43 |
| cv27-yo-test | 18,46 |
| dsn-ig-devtest | 14,67 |
| dsn-yo-devtest | no disponible (truncado en la informacion proporcionada) |

No se han publicado en la informacion disponible resultados comparativos con el modelo base ni con otros modelos en estos mismos conjuntos, por lo que no es posible establecer una comparacion directa con Whisper Large v3 u otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,2 GB solo para los pesos, mas memoria para activaciones y buffers; en la practica se recomiendan al menos 6-8 GB de VRAM para audio de duracion moderada.
- En cuantizacion de 8 bits, la huella de pesos se reduce a aproximadamente 1,6 GB; en 4 bits, a unos 0,8 GB, aunque no se documentan cuantizaciones oficiales para este modelo.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de produccion con alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia en una sola GPU consumer.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en fp16, y en tarjetas con 4-6 GB usando cuantizacion.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), vLLM no aplica directamente (modelo ASR), TGI no soportado de forma nativa para Whisper, llama.cpp no soporta arquitectura Whisper en todas sus variantes; se puede usar `faster-whisper` o `whisper.cpp` si se convierten los pesos, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| eko-whisper-large-v1 | 1.609.879.040 | no disponible | en, pcm, yo, ig | ekogenie-research | Restringido (gated) |
| openai/whisper-large-v3 | ~1.550 millones | 30 s de audio por ventana | 99 idiomas | Apache 2.0 | Abierto |
| Whisper Large v3 Turbo | ~809 millones | 30 s de audio por ventana | 99 idiomas | Apache 2.0 | Abierto |

El modelo base Whisper Large v3 ofrece cobertura de 99 idiomas con licencia Apache 2.0 y acceso abierto, pero su rendimiento en lenguas nigerianas es inferior segun los datos declarados por el autor de eko-whisper (aunque no se aportan los valores del base en los mismos conjuntos). Whisper Large v3 Turbo es mas pequeno y rapido, pero tambien generico. No se dispone de informacion sobre otros modelos ASR especializados en lenguas nigerianas en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de WER declarados no estan verificados (`verified: false`) y no se acompanan de los valores del modelo base en los mismos conjuntos, lo que impide cuantificar la mejora real.
- La licencia `ekogenie-research` es una licencia personalizada; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales no detalladas en la informacion disponible.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y el despliegue automatizado.
- Cobertura linguistica limitada a cuatro lenguas/variedades; no se debe esperar un rendimiento adecuado en otras lenguas africanas ni en ingleses no nigerianos.
- Riesgo de alucinacion en audio con ruido, musica de fondo o hablantes con acentos no representados en el ajuste fino; los modelos Whisper tienden a generar texto plausible aunque incorrecto en segmentos de baja calidad.
- No se documentan sesgos especificos, pero al derivar de Whisper Large v3 hereda los sesgos del corpus de entrenamiento original (principalmente audio en ingles y lenguas europeas).
- No se dispone de informacion sobre el proceso de entrenamiento, lo que dificulta evaluar la calidad y representatividad de los datos de ajuste.
- El contexto de audio por ventana no se especifica; en Whisper es tipicamente de 30 segundos, pero no se confirma para este fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/munasco/eko-whisper-large-v1
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper de referencia (arXiv:2605.17710, segun etiquetas del repositorio): no disponible en la informacion proporcionada
