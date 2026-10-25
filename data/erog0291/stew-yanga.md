# Erog0291/stew-yanga

## Resumen

Stew Yanga v0.1.1 es un modelo de reconocimiento automático del habla (ASR) presentado por el autor nigeriano Emmanuel Rejoice (Erog0291) como "el modelo unificado de voz de Nigeria". Cubre cinco variedades lingüísticas del país: igbo (ig), yoruba (yo), hausa (ha), pidgin nigeriano (pcm) y "Naija English" (en). El problema que aborda es la baja cobertura de las lenguas nigerianas en los sistemas ASR convencionales, donde los modelos genéricos obtienen tasas de error muy elevadas.

La model card indica que la versión v0.1.1 ("ears") se ha entrenado con los datos nigerianos completos de FLEURS e incorpora robustez frente a ruido. El paquete se distribuye vía `transformers` y se acompaña de una capa de síntesis de voz (TTS) denominada YarnGPT, además de una demo en Spaces.

La información publicada es escasa en cuanto a arquitectura, número de parámetros y datos de entrenamiento: no se especifica si se trata de un encoder-decoder tipo Whisper, un modelo CTC o una combinación, ni el volumen de horas de audio utilizadas. La relevancia actual del proyecto reside en su enfoque en lenguas de bajos recursos y en la mejora declarada frente a líneas base genéricas, no en unas especificaciones técnicas que el autor todavía no ha detallado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR distribuido con `library_name: transformers`; no se detalla si es CTC, encoder-decoder tipo Whisper o híbrido) |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (modelo de audio; no se especifica la duración máxima de clip admitida) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ig (igbo), yo (yoruba), ha (hausa), pcm (pidgin nigeriano), en (inglés nigeriano) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se listan ficheros en la información proporcionada) |
| Tarea | Reconocimiento automático del habla (ASR) |
| Autor | Erog0291 (Emmanuel Rejoice) |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos HF) | 2026-10-25 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. La model card únicamente indica que se apoya en la librería `transformers` y que se invoca mediante un wrapper propio del paquete `stew_yanga` (`from stew_yanga import StewYanga`), sin especificar si el backbone es un transformer encoder-decoder, un modelo CTC o un ensamblado de varios checkpoints. Tampoco se detalla el número de parámetros ni la estrategia de tokenización.

En cuanto a datos, el autor afirma que la versión v0.1.1 se ha entrenado "con los datos nigerianos completos de FLEURS" y que incorpora robustez frente a ruido, lo que sugiere aumento de datos con perturbaciones acústicas, aunque no se cuantifica ni el número de horas ni la composición exacta del corpus. No se menciona el uso de RLHF, DPO ni ninguna otra técnica de alineación, algo esperable en un modelo ASR. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Transcripción de audio a texto en igbo, yoruba, hausa, pidgin nigeriano e inglés nigeriano, con selección de idioma mediante un argumento explícito (`sy.transcribe("clip.wav", "ig")`).
- Robustez declarada frente a ruido ambiental, según la model card de la versión v0.1.1.
- Integración con el ecosistema `transformers` y descarga mediante `huggingface_hub`.
- Capa de síntesis de voz (TTS) complementaria, "YarnGPT voice layer", con voces nigerianas; la receta y las muestras se alojan en el repositorio paraguas `Erog0291/stew-audio-0.1`.
- Demo interactiva disponible en un Space de HuggingFace.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni modo "thinking"; al ser un modelo ASR, no son de aplicación directa.
- No se especifica soporte de diarización de hablantes, marcas de tiempo a nivel de palabra ni detección automática de idioma.

## Casos de uso

- Transcripción de entrevistas y testimonios en igbo, yoruba o hausa: el modelo permite convertir grabaciones de campo en texto indexable, algo crítico para investigación cualitativa y archivos lingüísticos donde los ASR genéricos fallan.
- Subtitulado de contenido audiovisual nigeriano (Nollywood, YouTube local): el pipeline recibiría el audio, seleccionaría el idioma con el argumento correspondiente y generaría subtítulos en la lengua original, con la opción de traducción posterior.
- Atención al cliente en centros de contacto locales: transcripción de llamadas en pidgin nigeriano o "Naija English" para su análisis, clasificación de motivos y control de calidad, reduciendo la dependencia de operarios bilingües.
- Documentación clínica y administrativa por voz: dictado de notas en hausa o yoruba en entornos con conectividad limitada, siempre con revisión humana dada la tasa de error publicada.
- Accesibilidad: generación de subtítulos automáticos para personas con discapacidad auditiva en medios en lenguas nigerianas, un segmento sin cobertura práctica en la mayoría de herramientas comerciales.
- Investigación en lingüística computacional: evaluación comparativa de ASR en lenguas de bajos recursos, usando los WER publicados como referencia frente a líneas base genéricas.
- Asistentes de voz de extremo a extremo combinando la capa ASR con la TTS YarnGPT, por ejemplo en dispositivos de información pública o quioscos en zonas con baja alfabetización digital.

## Benchmarks y rendimiento

Resultados de WER (Word Error Rate) publicados en la model card; menor es mejor:

| Idioma | Stew Yanga v0.1.1 | Línea base genérica | Mejora relativa |
|---|---|---|---|
| Igbo (ig) | 53,5 | 193,8 | 72,4 % |
| Yoruba (yo) | 61,0 | 100,4 | 39,2 % |
| Hausa (ha) | 38,7 | 127,2 | 69,6 % |
| Pidgin nigeriano (pcm) | no disponible | no disponible | no disponible |
| Inglés nigeriano (en) | no disponible | no disponible | no disponible |

No se detalla qué modelo concreto constituye la "línea base genérica", sobre qué subconjunto de FLEURS se han medido los resultados ni si el WER es en bruto o normalizado. Tampoco hay cifras publicadas para pcm y en pese a estar listados como idiomas soportados.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica el número de parámetros ni el tamaño del checkpoint, por lo que no es posible una estimación fiable.
- GPU recomendadas: no disponible por la misma razón. Como referencia de categoría, los ASR de tipo Whisper van desde ~39 M (tiny) hasta ~1,55 B parámetros (large-v3), con requisitos que abarcan desde menos de 1 GB hasta ~10 GB en FP16.
- Encaje en GPU de consumo: no confirmado. Si el modelo se sitúa en el rango de un ASR pequeño o mediano (menos de 1 B de parámetros), cabría en una RTX 3060/4060 de 8-12 GB, pero es una suposición, no un dato del autor.
- Opciones de despliegue: la vía documentada es el paquete Python `stew_yanga` sobre `transformers`, más la descarga de pesos con `huggingface_hub`. No se mencionan integraciones con vLLM, llama.cpp, Ollama, TGI ni whisper.cpp; la compatibilidad con estas herramientas no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Parámetros | Licencia | Notas |
|---|---|---|---|---|---|
| Stew Yanga v0.1.1 | ASR multilingüe nigeriano | ig, yo, ha, pcm, en | no disponible | Apache 2.0 | WER 38,7-61,0 en ig/yo/ha; sin datos de pcm/en |
| OpenAI Whisper (large-v3) | ASR encoder-decoder | 99 idiomas | ~1,55 B | MIT | Cobertura amplia, pero rendimiento bajo en lenguas africanas de bajos recursos; cifras concretas en FLEURS ig/yo/ha no disponibles en esta ficha |
| Meta MMS (Massively Multilingual Speech) | ASR (CTC/wav2vec 2.0) | más de 1000 idiomas | ~1 B (modelo base) | CC-BY-NC 4.0 | Cubre ig, yo y ha, pero la licencia no comercial limita su uso en producto |
| Meta SeamlessM4T v2 | ASR/traducción/ TTS | ~100 idiomas | no disponible | CC-BY-NC 4.0 | Multimodal y no comercial; no orientado específicamente a pcm |

No se dispone de una comparación directa de WER entre Stew Yanga y estos modelos sobre el mismo subconjunto de FLEURS en la información proporcionada, por lo que la comparación debe tomarse como contextual y no como una evaluación empírica equiparable.

## Limitaciones y advertencias

- Tasas de error elevadas en términos absolutos: un WER de 53,5 en igbo y 61,0 en yoruba implica que más de la mitad de las palabras pueden salir mal; no es apto para transcripción automática sin revisión humana.
- Ausencia de métricas para pidgin nigeriano e inglés nigeriano pese a figurar como idiomas soportados: no hay evidencia publicada de su calidad real.
- No se especifica la línea base utilizada en los benchmarks, lo que impide reproducir o verificar la comparación.
- Riesgo de alucinación y de "salida fluida pero incorrecta", habitual en modelos encoder-decoder de ASR entrenados con datos limitados; especialmente probable en audio con ruido, acentos no representados o cambio de código entre lenguas.
- Sesgos esperables por el corpus: FLEURS es audio de lectura, relativamente limpio y con hablantes concretos, por lo que el dominio y la variedad dialectal están acotados.
- Inconsistencia en la documentación: el repositorio se llama `stew-yanga` pero los comandos de descarga apuntan a `stew-audio-0.1-asr-ig`, `-yo` y `-ha`, y no se ofrece una ruta equivalente para pcm o en, lo que dificulta saber qué checkpoint corresponde realmente a este identificador.
- Fecha de creación en los metadatos (2026-10-25) posterior a la fecha actual, lo que sugiere un error de marcado o un repositorio todavía en preparación.
- Sin descargas ni likes: no existe validación por parte de la comunidad ni informes independientes de uso en producción.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero conviene verificar la procedencia y licencia de los datos FLEURS subyacentes antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Erog0291/stew-yanga
- Repositorio paraguas (capa de voz YarnGPT y muestras): https://huggingface.co/Erog0291/stew-audio-0.1
- Demo en Spaces: https://huggingface.co/spaces/Erog0291/stew-audio-0.1
- Perfil del autor: https://huggingface.co/Erog0291
- StewMind 1.7B (otro modelo del mismo autor): https://huggingface.co/Erog0291/stewmind-1.7b
- Stew Embedding v2 (otro modelo del mismo autor): https://huggingface.co/Erog0291/stew-embedding-v2
- StewAgent 1 (Space del autor): https://huggingface.co/spaces/Erog0291/my-stew-agent-space
- Ficha de terceros sobre Stew Embedding v2: https://free2aitools.com/model/erog0291/stew-embedding-v2
