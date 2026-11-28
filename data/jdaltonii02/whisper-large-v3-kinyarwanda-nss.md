# jdaltonII02/whisper-large-v3-kinyarwanda-nss

## Resumen

Whisper-large-v3-kinyarwanda-nss es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) Whisper large-v3 de OpenAI, especializado en kinyarwanda y, de forma particular, en habla no estandar (non-standard speech) que incluye disfluencias como la tartamudez. Lo desarrolla el usuario jdaltonII02 en el contexto del sprint de ASR para Ruanda 2026 (tag `asr-sprint-rwanda-2026`) y se entrena sobre el dataset `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0`.

El modelo conserva la arquitectura encoder-decoder transformer de Whisper large-v3 con 1.543.490.560 parametros totales (unos 1,54 mil millones) y pesos en formato safetensors, con un repositorio de 6,2 GB. Su relevancia radica en cubrir un idioma de bajos recursos como el kinyarwanda y, ademas, hacerlo sobre habla atipica, un escenario habitualmente desatendido por los sistemas ASR comerciales.

El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La licencia es `cdli-non-standard-speech-terms`, una licencia personalizada de tipo "other", por lo que conviene revisar sus terminos antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | cdli-non-standard-speech-terms (tipo "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3`, un transformer encoder-decoder disenado para ASR y traduccion de voz, y se ajusta de forma supervisada sobre el dataset `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0`. Este dataset esta orientado especificamente a habla no estandar, incluyendo tartamudez, segun indican los tags del repositorio.

No se dispone de informacion publica sobre el numero de tokens de audio empleados, la composicion exacta del dataset, la configuracion de entrenamiento (learning rate, epocas, tecnicas de aumento de datos) ni sobre el uso de RLHF/DPO, algo por otra parte poco habitual en modelos ASR. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio ajuste fino del modelo base.

## Capacidades

- Reconocimiento automatico del habla (ASR) en kinyarwanda.
- Transcripcion de habla no estandar, incluyendo disfluencias como la tartamudez.
- Generacion de transcripciones a partir de audio mediante la interfaz estandar de Whisper (pipeline `automatic-speech-recognition`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al kinyarwanda segun los metadatos del modelo.
- Capacidades especiales (vision, audio adicional, modo thinking): no disponible.

## Casos de uso

- Transcripcion de entrevistas y testimonios en kinyarwanda: el ajuste sobre habla no estandar permite transcribir grabaciones con disfluencias y tartamudez que los modelos genericos suelen degradar, util en investigacion linguistica y trabajo de campo.
- Accesibilidad para personas con tartamudez: integracion en herramientas de dictado o subtitulado que necesitan reconocer habla atipica sin forzar al usuario a corregir su forma de hablar.
- Subtitulado de contenido audiovisual ruandes: generacion de subtitulos en kinyarwanda para videos, formacion o medios locales, aprovechando el soporte del idioma del ajuste fino.
- Documentacion clinica o de servicios sociales: transcripcion de consultas o entrevistas donde el habla puede ser no fluida, reduciendo el trabajo manual de transcripcion.
- Investigacion en ASR de bajos recursos: como punto de partida o referencia para experimentos sobre kinyarwanda y habla atipica dentro del sprint `asr-sprint-rwanda-2026`.
- Prototipos de asistentes de voz locales: base para sistemas de voz en kinyarwanda en entornos con pocos recursos linguisticos, siempre que se respete la licencia y el acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del modelo (1,54 mil millones de parametros) se situa en la categoria de Whisper large-v3, que tipicamente requiere del orden de 10 GB en FP16 para inferencia comoda (estimacion orientativa, no confirmada en la informacion proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma confirmada; por tamano, es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: no disponible (al ser compatible con la arquitectura Whisper, cabria esperar soporte en frameworks ASR habituales, pero no se confirma en la informacion).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| whisper-large-v3-kinyarwanda-nss | 1.543.490.560 | no disponible | rw | cdli-non-standard-speech-terms | Restringido (gated) |
| openai/whisper-large-v3 (base) | no disponible en la informacion | no disponible | multilingue | no disponible en la informacion | Abierto |
| Alternativas especificas para kinyarwanda | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset especifico de habla no estandar de Ruanda, el rendimiento puede degradarse fuera de ese dominio.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar transcripciones plausibles pero incorrectas, especialmente con audio ruidoso o acentos no vistos.
- Limitaciones de contexto o idioma: el modelo esta orientado al kinyarwanda; no se garantiza un comportamiento correcto en otros idiomas.
- Restricciones de licencia: la licencia `cdli-non-standard-speech-terms` es de tipo "other"; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar la automatizacion de descargas en pipelines.
- Documentacion escasa: sin datos publicados de entrenamiento ni benchmarks, la evaluacion en produccion debe hacerse con validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/jdaltonII02/whisper-large-v3-kinyarwanda-nss
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
