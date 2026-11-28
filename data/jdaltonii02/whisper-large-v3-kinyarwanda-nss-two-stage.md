# jdaltonII02/whisper-large-v3-kinyarwanda-nss-two-stage

## Resumen

Whisper large-v3 adaptado al kinyarwanda para reconocimiento automatico del habla (ASR) en condiciones de habla no estandar, en concreto con disfluencias y tartamudeo. Lo desarrolla el autor jdaltonII02 como un ajuste fino en dos etapas (two-stage) sobre el checkpoint `cdli/whisper-large-v3_finetuned_rwandan_kinyarwanda_standard_speech_v1.0`, que a su vez parte de Whisper large-v3 de OpenAI. El modelo se enmarca en la iniciativa asr-sprint-rwanda-2026 y esta entrenado sobre el dataset `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0`.

El problema que aborda es concreto: los sistemas ASR comerciales y los ajustes estandar suelen degradarse de forma acusada cuando el hablante presenta tartamudeo, bloqueos, repeticiones o pausas atipicas. Este checkpoint busca mantener la calidad de transcripcion en ese subconjunto de habla, sin sacrificar el rendimiento sobre habla fluida, mediante un esquema de entrenamiento en dos fases.

Arquitectura transformer encoder-decoder de tipo Whisper large-v3, con 1.543.490.560 parametros en pesos safetensors y un repositorio de 6,2 GB. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, y la licencia es propia (`cdli-non-standard-speech-terms`), no una licencia abierta estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (transformer encoder-decoder con espectrograma log-Mel) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper large-v3; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/ONNX no listadas) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | cdli-non-standard-speech-terms (licencia propia, acceso gated) |
| Formato de pesos | safetensors |
| Modelo base | cdli/whisper-large-v3_finetuned_rwandan_kinyarwanda_standard_speech_v1.0 |
| Tarea | automatic-speech-recognition |
| Dataset de entrenamiento | cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0 |
| Tamano del repositorio | 6,2 GB |
| Acceso | restringido (requiere aceptar condiciones) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper large-v3: un encoder que procesa espectrogramas log-Mel de 80 canales y un decoder autorregresivo que genera tokens de transcripcion, con atencion multi-cabeza estandar y sin mecanismos de atencion lineal ni decodificacion especulativa documentados. El ajuste se realiza sobre un checkpoint ya especializado en kinyarwanda de habla estandar, lo que implica que el modelo parte de un dominio linguistico ya adaptado antes de enfrentarse al habla no estandar.

El entrenamiento se describe como "two-stage", es decir, un ajuste fino en dos fases sucesivas sobre el dataset de habla no estandar de CDLI. No se detalla en la informacion disponible el numero de tokens o horas de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aumentacion de datos especifica para disfluencias. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio esquema en dos etapas y del punto de partida especializado.

## Capacidades

- Transcripcion de voz a texto en kinyarwanda (tarea ASR).
- Reconocimiento de habla no estandar, incluyendo tartamudeo y disfluencias, que es el objetivo declarado del ajuste.
- Procesamiento de audio de entrada con la ventana estandar de Whisper large-v3 (30 segundos por segmento, segun la arquitectura base).
- Generacion de transcripciones con puntuacion y mayusculas segun el formato aprendido del modelo base.
- No se documentan capacidades de traduccion, diarizacion de hablantes, deteccion de idioma multilingue ni tool calling.
- No se documentan modos de razonamiento extendido, vision ni audio generativo.

## Casos de uso

- Subtitulado de contenido audiovisual en kinyarwanda: el modelo transcribe entrevistas, programas de radio o videos donde los hablantes presentan tartamudeo o pausas largas, un escenario donde los ASR genericos suelen producir transcripciones truncadas o erroneas.
- Documentacion clinica de trastornos del habla: permite generar transcripciones de sesiones de logopedia o evaluaciones de tartamudeo en kinyarwanda, facilitando el analisis posterior de patrones de disfluencia por parte de especialistas.
- Accesibilidad para personas con tartamudez: integrado en herramientas de subtitulado en tiempo real o dictado, el ajuste especifico reduce la tasa de error sobre habla disfluente frente al modelo base estandar.
- Archivo y preservacion linguistica: transcripcion de grabaciones de campo con habla espontanea y no estandar, un tipo de material frecuente en corpus linguisticos de lenguas de bajos recursos como el kinyarwanda.
- Investigacion en ASR multilingue de bajos recursos: sirve como checkpoint de referencia para estudiar el efecto del ajuste en dos etapas sobre habla no estandar, comparandolo con el modelo base de habla estandar.
- Atencion al ciudadano y servicios publicos en Ruanda: transcripcion de llamadas o mensajes de voz donde los usuarios hablan de forma espontanea, con repeticiones y reformulaciones, para su posterior enrutamiento o analisis.
- Generacion de datos etiquetados: las transcripciones producidas pueden emplearse para ampliar corpus de habla no estandar en kinyarwanda, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, mas activaciones y cache de atencion; en la practica se recomienda un minimo de 6-8 GB de VRAM para audio de 30 segundos.
- En fp32 la huella de pesos ronda los 6,2 GB, coincidiendo con el tamano del repositorio.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en fp16 (RTX 3070/4060 Ti en adelante); en cuantizacion int8 podria ajustarse en GPUs de 4-6 GB, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers con pipeline de ASR, faster-whisper (CTranslate2) si se convierte el checkpoint, WhisperX para alineacion temporal; vLLM y TGI no soportan Whisper de forma nativa en sus versiones habituales; llama.cpp no aplica a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| whisper-large-v3-kinyarwanda-nss-two-stage | 1.543.490.560 | ventana Whisper large-v3 (30 s por segmento, no confirmado) | rw | cdli-non-standard-speech-terms | gated |
| cdli/whisper-large-v3_finetuned_rwandan_kinyarwanda_standard_speech_v1.0 | ~1.550 M (Whisper large-v3) | ventana Whisper large-v3 | rw | no disponible | no disponible |
| openai/whisper-large-v3 | 1.550 M | 30 s por segmento, contexto de 448 tokens en decoder | 99 idiomas (incluye rw) | Apache 2.0 | abierto |
| Modelos ASR especificos de kinyarwanda en CDLI | no disponible | no disponible | rw | no disponible | no disponible |

El modelo se diferencia de Whisper large-v3 original por el ajuste especifico a kinyarwanda y, sobre todo, por el entrenamiento sobre habla no estandar. Frente al checkpoint de habla estandar del mismo autor base, la ventaja esperada es una menor tasa de error en hablantes con disfluencias, aunque no se publican metricas comparativas que lo cuantifiquen.

## Limitaciones y advertencias

- Acceso restringido: es necesario solicitar acceso en Hugging Face y aceptar los terminos; no es un modelo de descarga libre.
- Licencia no estandar (`cdli-non-standard-speech-terms`): las condiciones de uso comercial no estan clarificadas en la informacion disponible y deben revisarse antes de cualquier despliegue en produccion.
- Monolingue: solo soporta kinyarwanda; no se debe esperar transferencia a otras lenguas.
- Sesgos potenciales derivados del corpus de entrenamiento: la representatividad de acentos, edades, generos y tipos de disfluencia del dataset no esta documentada.
- Riesgo de alucinacion en pasajes de silencio, ruido o audio musical, comportamiento conocido en la familia Whisper y no corregido de forma documentada en este checkpoint.
- El esquema de dos etapas puede producir sobreajuste al dominio del dataset de habla no estandar, degradando el rendimiento sobre habla fluida estandar respecto al modelo base; no hay datos publicados que lo confirmen o descarten.
- Sin benchmarks publicados: no es posible verificar cuantitativamente la mejora frente al modelo base ni frente a Whisper large-v3 original.
- Sin cuantizaciones oficiales (GGUF, ONNX, CTranslate2): habria que generarlas manualmente, con el riesgo de degradacion adicional no evaluada.
- Fecha de publicacion muy reciente y sin descargas ni likes: no existe validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jdaltonII02/whisper-large-v3-kinyarwanda-nss-two-stage
- Modelo base: https://huggingface.co/cdli/whisper-large-v3_finetuned_rwandan_kinyarwanda_standard_speech_v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Whisper large-v3 original: https://huggingface.co/openai/whisper-large-v3
- Repositorio de referencia de Whisper (OpenAI): https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- WhisperX: https://github.com/m-bain/whisperX
