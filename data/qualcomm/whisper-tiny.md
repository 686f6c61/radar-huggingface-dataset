# qualcomm/Whisper-Tiny

## Resumen

qualcomm/Whisper-Tiny es una version optimizada para dispositivos Qualcomm del conocido modelo de reconocimiento automatico del habla Whisper-Tiny. Lo publica Qualcomm en HuggingFace dentro de su ecosistema Qualcomm AI Hub Models, y su objetivo es ejecutar transcripcion de voz a texto directamente en el dispositivo (edge inference), sin depender de la nube. El modelo parte de la implementacion de Whisper-Tiny de la libreria transformers de HuggingFace (version 4.42.3) y se ha reexportado a formatos compatibles con el hardware de Qualcomm.

La modificacion principal respecto al Whisper original es la sustitucion de las capas de atencion multi-cabeza (Multi-Head Attention, MHA) por atencion de una sola cabeza (Single-Head Attention, SHA) y la conversion de capas lineales en capas convolucionales, con el fin de reducir coste computacional y facilitar el despliegue en NPU. Segun el autor, mantiene un rendimiento robusto en entornos ruidosos y es capaz de transcribir fragmentos de audio de hasta 30 segundos.

Es relevante ahora porque el repositorio distribuye artefactos precompilados (QNN ONNX y QNN context binary) listos para ejecutarse en una lista concreta de chipsets Snapdragon y Dragonwing, lo que simplifica la integracion de ASR en moviles, portatiles y dispositivos IoT. La licencia Apache 2.0 facilita su uso comercial. No se dispone de datos de benchmarks ni del numero de parametros en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer optimizado para edge, con atencion de una sola cabeza (SHA) en lugar de multi-cabeza (MHA) y capas lineales sustituidas por capas convolucionales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como contexto de texto; admite audios de hasta 30 segundos por segmento |
| Tipos de cuantizacion | no disponible; los artefactos publicados usan precision float |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PRECOMPILED_QNN_ONNX (float) y QNN_CONTEXT_BINARY (float); modelo base exportable desde la libreria Qualcomm AI Hub Models |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-Tiny, un transformer de tipo encoder-decoder orientado a reconocimiento automatico del habla. Sobre esa base, Qualcomm ha aplicado optimizaciones para inferencia en el borde: reemplazo de la atencion multi-cabeza (MHA) por atencion de una sola cabeza (SHA) y sustitucion de capas lineales por capas convolucionales. Estas modificaciones buscan reducir el coste por token y encajar mejor en las NPU de los chipsets Qualcomm.

La latencia se descompone en dos partes, segun el autor: el tiempo hasta el primer token corresponde a la latencia del encoder, mientras que el tiempo hasta cada token adicional corresponde a la latencia del decoder, asumiendo una longitud maxima de decodificacion. El modelo se compila, perfila y evalua mediante Qualcomm AI Hub Workbench y hace uso de QAIRT 2.50 y ONNX Runtime 1.30.0 en los artefactos precompilados. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (al tratarse de un modelo ASR, estos ultimos no aplican del mismo modo).

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de voz a texto.
- Transcripcion de formato largo: soporta clips de audio de hasta 30 segundos.
- Robustez en entornos reales y ruidosos, segun declara el autor.
- Inferencia en dispositivo (on-device) sobre hardware Qualcomm, sin depender de conectividad.
- Despliegue mediante formatos precompilados QNN ONNX y QNN context binary para chipsets concretos.
- Compatibilidad con el Qualcomm Voice AI SDK para el despliegue en dispositivo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo de proposito general).
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio adicional, thinking mode): no disponible; la unica modalidad documentada es audio a texto.

## Casos de uso

- Transcripcion de voz en moviles: integracion del modelo en aplicaciones Android para convertir notas de voz o dictado en texto, aprovechando los artefactos precompilados para chipsets Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite y 8 Elite Gen 5.
- Subtitulado en tiempo real en portatiles: uso de los binarios para Snapdragon X Elite y X2 Elite para generar subtitulos de reuniones o contenido audiovisual sin enviar audio a la nube.
- Asistentes de voz embebidos: el Qualcomm Voice AI SDK permite desplegar el modelo en dispositivo para asistentes que reconocen comandos y conversaciones cortas de hasta 30 segundos.
- IoT industrial y logistica: sobre plataformas Dragonwing (IQ-8275, IQ-9075) y QCS8550, transcripcion de ordenes verbales en entornos de planta donde no hay conectividad fiable.
- Automocion y manos libres: dictado de mensajes o comandos por voz en cabina procesados localmente, reduciendo latencia y preservando la privacidad del audio.
- Accesibilidad: generacion de transcripciones en aplicaciones de ayuda a personas con discapacidad auditiva, ejecutandose enteramente en el dispositivo.
- Notas de voz y productividad: conversion automatica de grabaciones cortas en texto dentro de aplicaciones de toma de notas, sin coste de inferencia en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de resumen de rendimiento por dispositivo, pero no se incluyen cifras concretas (latencia del encoder, latencia del decoder, consumo) en el material facilitado.

## Requisitos de hardware

- El modelo esta disenado para inferencia en el borde sobre NPU de Qualcomm, no para GPU de servidor. No se dispone de cifras de VRAM.
- Chipsets soportados por los artefactos precompilados: Snapdragon 8 Elite Gen 5 for Galaxy, Snapdragon 8 Elite, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3 y Snapdragon 8 Gen 1.
- Plataformas Dragonwing e IoT soportadas: Qualcomm Dragonwing IQ-8275, Dragonwing IQ-9075 y Dragonwing QCS8550 (proxy).
- Entorno de ejecucion: QAIRT 2.50 y ONNX Runtime 1.30.0 para los artefactos PRECOMPILED_QNN_ONNX; QAIRT 2.50 para los QNN_CONTEXT_BINARY.
- Opciones de despliegue: Qualcomm AI Hub Models (compilacion, perfilado y evaluacion), Qualcomm Voice AI SDK y exportacion personalizada con la libreria qai_hub_models. Para el modelo base tambien es posible partir de la implementacion de transformers 4.42.3.
- GPU de consumo (RTX, A100, H100): no aplica segun la informacion disponible; el objetivo declarado es el despliegue en dispositivo.
- Latencia y throughput: no disponibles (el autor describe la descomposicion encoder/decoder, pero no publica cifras en el material facilitado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| qualcomm/Whisper-Tiny | no disponible | audio de hasta 30 s | Apache 2.0 | Edge en hardware Qualcomm (QNN) |
| Whisper-Tiny original (OpenAI / HuggingFace) | no disponible en esta ficha | audio de hasta 30 s | no disponible en esta ficha | Inferencia general en CPU/GPU |
| Otras variantes de la familia Whisper | no disponible | no disponible | no disponible | Distintos tamanos y despliegues |

Nota: la informacion proporcionada no incluye cifras de parametros, contexto ni rendimiento de los modelos comparables, por lo que la comparativa queda limitada a la orientacion de despliegue. Cualquier dato adicional se marca como no disponible.

## Limitaciones y advertencias

- La informacion no especifica los idiomas soportados ni la cobertura multilingue; el modelo base Whisper-Tiny suele ser multilingue, pero no se confirma aqui.
- Ventana de audio limitada a 30 segundos por segmento; audios mas largos requieren segmentacion.
- Al ser un modelo ASR, no ofrece generacion de texto general, razonamiento ni tool calling.
- Riesgo de errores de transcripcion inherente a los modelos de reconocimiento del habla, especialmente con ruido, acentos o vocabulario tecnico.
- Los artefactos precompilados estan atados a chipsets y versiones concretas de QAIRT y ONNX Runtime; cambios de hardware o de SDK pueden requerir recompilacion.
- No se dispone de informacion sobre sesgos del modelo en el material facilitado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del SDK de Qualcomm y del modelo base original.
- El repositorio ocupa 10.1 GB, lo que puede condicionar su descarga y almacenamiento.
- Downloads y likes registrados: 0, lo que indica una adopcion muy limitada o reciente en el momento de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/Whisper-Tiny
- Libreria Qualcomm AI Hub Models (whisper_tiny): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/whisper_tiny
- Implementacion base de Whisper-Tiny en transformers: https://github.com/huggingface/transformers/tree/v4.42.3/src/transformers/models/whisper
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Qualcomm Package Manager (Qualcomm Voice AI SDK): https://qpm.qualcomm.com/#/main/tools/details/VoiceAI_ASR
- Web de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa de Qualcomm: https://www.qualcomm.com/company
