# gcoli/whisper-large-v3-turbo-swiss-german-mit

## Resumen

Whisper Large-v3-Turbo Swiss German es un ajuste fino mediante LoRA del modelo `openai/whisper-large-v3-turbo` orientado a transcribir audio en dialectos del aleman suizo (codigo `gsw`) generando texto en aleman estandar. Lo publica el usuario gcoli en HuggingFace bajo licencia MIT, con una cadena de procedencia deliberadamente limpia: modelo base MIT, corpus de entrenamiento MIT y resultado MIT. Esto lo distingue de la mayoria de modelos publicos de aleman suizo, que heredan la licencia CC BY-NC de SwissDial y no se pueden usar comercialmente.

El modelo tiene 808.878.080 parametros, ocupa 3,2 GB en el repositorio y esta disponible en dos formatos: safetensors fp16 en la raiz del repositorio (para transformers) y CTranslate2 float16 en la subcarpeta `ct2/` (para faster-whisper). Los pesos resultantes del LoRA estan fusionados en el modelo, por lo que no requiere cargar adaptadores adicionales.

Su relevancia practica esta en el rendimiento y la trazabilidad legal: sobre el conjunto de test FHNW/i4ds All Swiss German Dialects Test Set obtiene un WER final del 25,9 %, frente al 28,5 % del modelo base sin ajustar, con un coste temporal identico (RTF 0,031 frente a 0,032). El modelo se entreno en una unica RTX 3080 Ti durante aproximadamente 1,6 horas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo, ajuste fino LoRA fusionado) |
| Parametros totales | 808.878.080 (aproximadamente 809 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio por ventana (arquitectura Whisper) |
| Tipos de cuantizacion | fp16 (safetensors), CTranslate2 float16, CTranslate2 int8_float16 |
| Idiomas soportados | gsw (aleman suizo), de (salida en aleman estandar) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) en la raiz; CTranslate2 en `ct2/` |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con 809 M de parametros que procesa ventanas de audio de 30 segundos y 128 bins mel a 16 kHz. El ajuste se realizo con LoRA de rango 32, alpha 64, dropout 0,05 y objetivos `q_proj` y `v_proj`; los adaptadores se fusionaron posteriormente en los pesos base. El entrenamiento uso bf16 con gradient checkpointing, optimizador con learning rate 3e-4, decaimiento lineal, 500 pasos de warmup, 1 epoca y batch de 16. Todo el proceso se ejecuto en una sola RTX 3080 Ti (12 GB) en aproximadamente 1,6 horas.

Los datos de entrenamiento son 40 horas del FHNW/i4ds Swiss Parliaments Corpus v2 (Bern) mas 40 horas del corpus Gemeinderat Zürich. El corpus de Zürich es solo audio, por lo que sus transcripciones se generaron con `openai/whisper-large-v3` (Apache-2.0) como pseudo-etiquetas y se filtraron por confianza (`avg_logprob > -0.45`, `no_speech_prob < 0.3`, ratio de compresion < 2.2 y rechazo de bucles de repeticion). Dos hallazgos destacados del autor: la tasa de aprendizaje domina el resultado (lr 1e-3 no aporto ninguna mejora sobre el modelo base, mientras que 3e-4 gano 1,8 puntos de inmediato), y la mezcla de fuentes importa mas que el volumen (ambos corpus deben estar presentes, pero la proporcion entre 50 % y 89 % de Zürich no marca diferencia medible, y 80 horas rinden igual que 160 o 247 horas).

## Capacidades

- Reconocimiento automatico de voz (ASR) sobre audio en dialectos del aleman suizo, con salida en aleman estandar.
- Transcripcion con marcas de tiempo y segmentacion (a traves de la API de Whisper/faster-whisper).
- Procesamiento en streaming por ventanas de 30 segundos.
- Deteccion de idioma y control mediante token de idioma (`de`) y tarea (`transcribe`).
- Inferencia con beam search configurable (el autor usa beam 5).
- Ejecucion en dos runtimes: transformers y faster-whisper/CTranslate2.
- Compatible con conversion a MLX para Apple Silicon mediante `mlx_whisper`.
- No se documentan capacidades de tool calling, agentes, vision ni audio aparte de la transcripcion (el modelo es exclusivamente ASR).

## Casos de uso

- Transcripcion de sesiones parlamentarias y actas oficiales: el modelo se entreno precisamente sobre el Swiss Parliaments Corpus, por lo que maneja el registro formal, los turnos de palabra y el vocabulario institucional suizo con fidelidad superior al modelo base.
- Subtitulado de contenido audiovisual en aleman suizo: convierte entrevistas, reportajes o videos institucionales en subtitulos en aleman estandar listos para publicar, con marcas de tiempo generadas por faster-whisper.
- Atencion al cliente en empresas suizas: transcripcion de llamadas grabadas de soporte en dialecto para su analisis en aleman estandar, con una ventana de contexto de 30 segundos que cubre intervenciones tipicas de conversacion telefonica.
- Archivado y busqueda de audio historico: conversion masiva de archivos de audio institucionales a texto indexable, usando CTranslate2 float16 para procesar grandes volumenes con un RTF de 0,031 (unas 32 veces mas rapido que tiempo real en RTX 3080 Ti).
- Investigacion en linguistica dialectal: el modelo permite comparar la distancia entre dialectos (Bern, Zürich y otros) y el aleman estandar mediante el analisis de errores por region, aunque el autor advierte que Valais y Fribourg rinden peor.
- Accesibilidad para personas sordas o con dificultades auditivas en contextos administrativos suizos: transcripcion en tiempo casi real de reuniones municipales (Gemeinderat) gracias al bajo RTF y al formato CTranslate2.
- Generacion de datos de entrenamiento o evaluacion de otros sistemas ASR en aleman suizo: el checkpoint sirve como referencia con licencia MIT para comparar WER contra modelos con licencias restrictivas.
- Despliegue embebido o en el borde (edge): con cuantizacion int8_float16 el modelo cabe en menos de 1 GB de VRAM, lo que permite ejecutarlo en dispositivos con recursos limitados a cambio de unos 0,3 puntos de WER.

## Benchmarks y rendimiento

Evaluacion sobre el FHNW/i4ds All Swiss German Dialects Test Set (MIT, 5750 clips, 12,7 horas, 17 dialectos), decodificado con faster-whisper (CTranslate2, float16, beam 5) en una RTX 3080 Ti. El conjunto se divide por hablante en dos mitades disjuntas: dev (2930 clips), usada para seleccion del modelo, y final (2820 clips), reservada. Las metricas son medias por clip tras normalizacion (minusculas, puntuacion eliminada, `ß` a `ss`).

| Modelo | WER dev | WER final | CER | RTF |
|---|---|---|---|---|
| Este checkpoint | 23,7 % | 25,9 % | 13,4 % | 0,031 |
| `openai/whisper-large-v3-turbo` (sin ajuste) | 26,5 % | 28,5 % | 14,6 % | 0,032 |
| `openai/whisper-large-v3` (sin ajuste) | 24,0 % | 26,3 % | 13,6 % | 0,090 |

La mejora sobre el modelo base turbo es de 2,8 puntos de WER con una velocidad practicamente identica. El autor advierte que la mitad final es mas dificil para todos los modelos medidos, incluidos los basales sin entrenar, por lo que las comparaciones deben hacerse dentro de una misma columna.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 2 GB para los pesos mas overhead de activaciones; el repositorio completo ocupa 3,2 GB.
- VRAM estimada con cuantizacion int8_float16 de CTranslate2: menos de 1 GB, apto para GPUs de gama baja o incluso CPU con menor rendimiento.
- GPU recomendada por el autor para las pruebas: RTX 3080 Ti (12 GB), donde se obtuvo un RTF de 0,031.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 3080, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM.
- Entrenamiento del LoRA: cabe en una unica GPU de 12 GB (RTX 3080 Ti) durante aproximadamente 1,6 horas.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), faster-whisper sobre CTranslate2, y conversion a MLX para Apple Silicon.
- Throughput estimado: con RTF 0,031 en RTX 3080 Ti, procesa aproximadamente 32 veces mas rapido que tiempo real (12,7 horas de audio en unos 24 minutos).
- No se especifican requisitos para CPU-only ni latencias en otras GPU; no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER final (test FHNW/i4ds) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (gcoli) | 809 M | 30 s por ventana | 25,9 % | MIT | HuggingFace |
| `openai/whisper-large-v3-turbo` | 809 M | 30 s por ventana | 28,5 % | MIT | HuggingFace |
| `openai/whisper-large-v3` | 1550 M | 30 s por ventana | 26,3 % | Apache-2.0 | HuggingFace |

El modelo supera en WER final al base turbo (2,8 puntos) y a `whisper-large-v3` (0,4 puntos), con un RTF tres veces mejor que large-v3 (0,031 frente a 0,090). No se dispone de datos comparativos con otros modelos especificos de aleman suizo en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de test es habla leida, mientras que los datos de entrenamiento son habla parlamentaria: el rendimiento en conversacion espontanea, podcasts o grabaciones con ruido no esta medido.
- La cobertura geografica de entrenamiento se limita a dos regiones (Bern y Zürich); Valais y Fribourg son los dialectos mas debiles, con WER en torno al 30-35 %.
- Las transcripciones del corpus de Zürich son pseudo-etiquetas generadas por `whisper-large-v3`, por lo que el modelo alumno no puede superar sustancialmente a su profesor en esa porcion.
- Whisper puede alucinar u omitir texto, especialmente con ruido, silencio, solapamiento de hablantes, dialectos poco frecuentes o vocabulario especializado. No debe usarse como unica base para decisiones de alto impacto.
- Es obligatorio obtener consentimiento antes de transcribir a personas.
- Sesgos conocidos: no se documentan explicitamente en la model card, pero el sesgo regional inherente a los corpus (Bern y Zürich) se refleja en el rendimiento diferencial por dialecto.
- La licencia MIT permite uso comercial, pero exige acreditar a FHNW/i4ds por los corpus subyacentes. El repositorio no concede derechos adicionales sobre los modelos, datos o software de origen y no implica respaldo por parte de FHNW, i4ds u OpenAI.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Profesor de pseudo-etiquetas: https://huggingface.co/openai/whisper-large-v3
- Dataset i4ds/SPC: https://huggingface.co/datasets/i4ds/SPC
- Corpus FHNW/i4ds: https://www.cs.technik.fhnw.ch/i4ds-datasets
- Ficha de procedencia detallada: `training_provenance.json` dentro del repositorio
