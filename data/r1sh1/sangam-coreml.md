# r1sh1/sangam-coreml

## Resumen

Sangam-coreml es un modelo de reconocimiento automatico del habla (ASR) distribuido en formato Core ML por el usuario r1sh1. Se trata de un modelo de tipo transducer con encoder basado en arquitectura Conformer, disenado especificamente para ejecucion en dispositivo (on-device) dentro del ecosistema Apple. Su principal rasgo diferencial es que esta orientado a la transcripcion de habla code-switching hindi-ingles, es decir, el llamado hinglish, un fenomeno linguistico muy comun en la India urbana donde los hablantes alternan entre hindi e ingles dentro de la misma frase.

El modelo aparece etiquetado para la tarea automatic-speech-recognition y vinculado al dataset VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN, lo que sugiere que su evaluacion o entrenamiento se enmarca en el leaderboard abierto de ASR para hindi. La ficha de Hugging Face no incluye informacion sobre el numero de parametros, la longitud de contexto de audio, los datos de entrenamiento ni los resultados de benchmarks, por lo que muchos campos de esta ficha quedan marcados como no disponibles.

La relevancia de este modelo radica en su enfoque de despliegue: al estar empaquetado en Core ML, esta pensado para integrarse en aplicaciones iOS y macOS con inferencia local, sin depender de servicios en la nube, lo que resulta atractivo por privacidad, latencia y funcionamiento offline. No obstante, la ausencia de documentacion tecnica publica limita seriamente su evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer con encoder Conformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato Core ML, posible cuantizacion integrada en el paquete) |
| Idiomas soportados | hindi e ingles (code-switching hinglish); tags: hi, en |
| Licencia | no disponible |
| Formato de pesos | Core ML (.mlpackage / .mlmodel) |
| Tarea | Automatic speech recognition |
| Libreria | coreml |
| Dataset de referencia | VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo sigue una arquitectura de tipo transducer con encoder Conformer. Los transducers (habitualmente RNN-T o variantes como TDT) combinan un encoder acustico, un predictor y una red conjunta para producir transcripciones de forma streaming-friendly, lo que encaja con inferencia on-device de baja latencia. El encoder Conformer, por su parte, combina capas convolucionales y de auto-atencion para capturar dependencias locales y globales en la senal de audio.

No se dispone de datos sobre el numero de tokens de audio utilizados en el entrenamiento, la composicion del dataset, la presencia de etapas de ajuste supervisado, tecnicas de augmentacion ni innovaciones tecnicas adicionales (decodificacion especulativa, attention linear u otras). La vinculacion con el dataset VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN sugiere un entrenamiento o evaluacion orientados al hindi, presumiblemente con material code-switching, pero este extremo no esta confirmado en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en hindi, ingles y habla code-switching hindi-ingles (hinglish).
- Inferencia on-device mediante Core ML, apta para ejecucion local en dispositivos Apple sin conexion a red.
- Arquitectura transducer orientada a transcripcion incremental o en streaming, segun el diseno habitual de este tipo de modelos.
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a hindi e ingles segun los tags; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio generativo): no disponible.

## Casos de uso

- Transcripcion de voz en aplicaciones iOS y macOS: el modelo puede integrarse en apps nativas mediante Core ML para convertir voz en texto localmente, sin enviar audio a servidores externos, lo que mejora la privacidad del usuario.
- Asistentes de voz offline: al ejecutarse en dispositivo, permite construir asistentes que funcionan sin conectividad, util en entornos con red limitada o para reducir costes de infraestructura.
- Subtitulado en tiempo real de contenido en hinglish: adecuado para generar subtitulos de videos, podcasts o retransmisiones donde los hablantes alternan hindi e ingles.
- Dictado y notas de voz: integracion en apps de productividad para transcribir notas dictadas por usuarios bilingues hindi-ingles.
- Atencion al cliente en centros de contacto de la India: transcripcion local de llamadas para analitica o cumplimiento, manteniendo el audio dentro del dispositivo o de la infraestructura propia.
- Accesibilidad: conversion de voz a texto para personas con discapacidad auditiva en entornos donde predomina el habla hinglish, con la ventaja de no requerir conexion.
- Procesamiento por lotes en macOS: transcripcion de archivos de audio en equipos Apple con GPU integrada o Neural Engine, sin coste por API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta vinculado al leaderboard VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN, pero no se proporcionan cifras de WER, CER ni comparaciones en la informacion recibida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano del modelo, que no se documenta).
- GPU recomendadas: no disponible. Al ser un paquete Core ML, esta pensado para ejecutarse en hardware Apple (Neural Engine, GPU integrada o CPU) en lugar de GPU NVIDIA.
- Compatibilidad con GPU de consumo: orientado a dispositivos Apple (iPhone, iPad, Mac con chip de la serie M o A); no se documenta soporte para GPU NVIDIA de consumo.
- Opciones de despliegue: Core ML (framework nativo de Apple); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos ASR de este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de parametros, contexto ni rendimiento que permitan una comparacion cuantitativa fiable con alternativas como Whisper, NVIDIA Parakeet o modelos ASR especificos para hindi. Se indica, no obstante, que la categoria de referencia seria la de modelos ASR on-device para hinglish, un nicho con pocas alternativas publicas documentadas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican parametros, datos de entrenamiento ni metodologia, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no disponible: no puede determinarse si el uso comercial esta permitido; se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas limitados a hindi e ingles; no se documenta soporte para otras lenguas ni para variantes regionales del hindi.
- Riesgo de errores en habla code-switching: los modelos entrenados para hinglish pueden degradarse ante mezclas linguisticas distintas o acentos no representados en el dataset.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no puede evaluarse el sesgo por acento, genero, edad o registro.
- Dependencia del ecosistema Apple: el formato Core ML limita su uso a plataformas Apple y complica la portabilidad a otros entornos.
- Sin senales de adopcion: cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-27), lo que puede indicar un error de registro o un artefacto de publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r1sh1/sangam-coreml
- Dataset de referencia: https://huggingface.co/datasets/VoiceArena/MonsoonASR-Open-ASR-leaderboard-hi-IN
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
