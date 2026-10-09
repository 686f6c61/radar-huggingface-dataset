# hoskasii/kastom

## Resumen

hoskasii/kastom es un modelo de síntesis de voz (text-to-speech, TTS) publicado por el usuario hoskasii (Nabad) en Hugging Face. Segun las etiquetas del repositorio, esta construido sobre Koko TTS y distribuye pesos en formato safetensors junto con codigo personalizado (`custom_code`), lo que implica que su carga requiere ejecucion de codigo remoto con `trust_remote_code=True`. El modelo acumula 383 descargas y 0 likes en el momento de redactar esta ficha.

El dato mas concreto disponible es el recuento de parametros: 28.442.212 (aproximadamente 28,4 millones), un tamano propio de modelos TTS ligeros orientados a inferencia rapida y despliegue en hardware modesto. El repositorio ocupa 3,4 GB, un volumen notablemente superior al que ocuparian unicamente los pesos en precision estandar, lo que sugiere la presencia de artefactos adicionales (codigo, vocabularios, muestras de audio o multiples ficheros de checkpoint), aunque no se detalla su composicion.

La relevancia de este modelo radica en su categoria: los sistemas TTS abiertos de baja latencia y pocos parametros son piezas clave para asistentes de voz, accesibilidad y generacion de audio en produccion. No obstante, la ausencia de informacion publicada sobre licencia, idiomas, arquitectura y benchmarks limita seriamente cualquier evaluacion rigurosa antes de su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como Koko TTS) |
| Parametros totales | 28.442.212 (aprox. 28,4 M) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con codigo personalizado, `custom_code`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de su naturaleza TTS y de la referencia a Koko TTS en las etiquetas del repositorio. No se publican detalles sobre el tipo de red (por ejemplo, arquitectura basada en difusion, en modelos autorregresivos o en variantes estilo StyleTTS2), ni sobre el mecanismo de decodificacion de audio (vocoder acoplado, decoder neuronal o similar).

Tampoco se documentan el numero de tokens o de horas de audio empleados en el entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning sobre una voz concreta. La etiqueta `custom_code` indica que el modelo requiere implementacion propia para su carga e inferencia, lo que refuerza la necesidad de revisar el codigo del repositorio antes de cualquier uso en produccion.

## Capacidades

- Sintesis de voz (text-to-speech): generacion de audio a partir de texto, segun la clasificacion del modelo y las etiquetas del repositorio.
- Construido sobre Koko TTS, lo que sugiere una base orientada a voces de alta calidad, aunque no se detallan caracteristicas concretas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de audio, no de lenguaje conversacional).
- Capacidades multilingues: no disponible.
- Capacidades especiales (clonacion de voz, control de prosodia, emociones, etc.): no disponible.

## Casos de uso

- Lectura de textos largos en voz alta: al tratarse de un modelo TTS ligero, puede integrarse en herramientas de accesibilidad para convertir articulos o documentos en audio sin requerir GPUs de gama alta.
- Asistentes de voz embebidos: su tamano reducido (28,4 M de parametros) lo hace candidato para despliegues en dispositivos con recursos limitados, siempre que se verifique el rendimiento real.
- Generacion de narracion para contenido audiovisual: produccion de locuciones sinteticas para videos, podcasts o audiolibros, previa validacion de la calidad de la voz generada.
- Prototipado de interfaces conversacionales: uso como componente de salida de voz en demos de asistentes, sujeto a la revision del codigo personalizado requerido para su carga.
- Sistemas de aviso y notificacion hablada: conversion de mensajes de sistema en audio para aplicaciones de monitorizacion o domotica.
- Investigacion en sintesis de voz: replicacion y comparacion frente a otras arquitecturas TTS abiertas, dado su reducido tamano de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 28,4 M de parametros, los pesos ocupan aproximadamente 57 MB en fp16 y 114 MB en fp32. El repositorio ocupa 3,4 GB, por lo que parte de ese espacio corresponde con toda probabilidad a artefactos adicionales (codigo, muestras o checkpoints auxiliares), no solo a los pesos.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU consumer reciente (serie RTX 30/40, incluso integradas) seria suficiente en teoria; tambien es plausible su ejecucion en CPU.
- Cabe en GPU de consumo: si, previsiblemente, dado el reducido numero de parametros, aunque no hay confirmacion oficial.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La presencia de `custom_code` apunta a un despliegue mediante la libreria `transformers` con `trust_remote_code=True` o mediante codigo propio del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados de rendimiento ni de especificaciones detalladas que permitan una comparacion rigurosa. A continuacion se indican alternativas de la misma categoria (TTS abierto de tamano reducido) de forma orientativa; los valores de estas alternativas no proceden de la informacion proporcionada y deben verificarse en sus respectivas fichas:

| Modelo | Parametros | Licencia | Formato | Notas |
|---|---|---|---|---|
| hoskasii/kastom | 28,4 M | no disponible | safetensors | Basado en Koko TTS segun etiquetas; sin benchmarks |
| Kokoro TTS | no disponible en esta ficha | no disponible en esta ficha | no disponible | Modelo TTS abierto popular; verificar en su repositorio |
| XTTS v2 | no disponible en esta ficha | no disponible en esta ficha | no disponible | TTS multilingue con clonacion; verificar en su repositorio |
| Piper | no disponible en esta ficha | no disponible en esta ficha | no disponible | TTS ligero orientado a dispositivos; verificar en su repositorio |

## Limitaciones y advertencias

- Ausencia total de informacion sobre licencia: no se puede confirmar si el uso comercial esta permitido. Es un bloqueante critico para produccion.
- No se documentan idiomas soportados, por lo que no se puede garantizar la cobertura de castellano ni de ninguna otra lengua.
- Riesgo de alucinacion y artefactos de audio: no se han publicado evaluaciones de calidad, inteligibilidad ni fidelidad de la voz.
- Requiere ejecucion de codigo personalizado (`custom_code`): implica cargar y ejecutar codigo de un tercero, con el consiguiente riesgo de seguridad si no se audita.
- Tamano del repositorio (3,4 GB) muy superior al de los pesos (decenas de MB): conviene revisar su contenido antes de descargarlo.
- Sin benchmarks, sin pipeline declarado y con 0 likes: no hay validacion por parte de la comunidad que respalde su calidad o estabilidad.
- Fecha de publicacion (2026-10-08) y actividad del autor: conviene verificar el estado de mantenimiento del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoskasii/kastom
- Perfil del autor: https://huggingface.co/hoskasii
- Modelos del autor: https://huggingface.co/hoskasii/models
- Mencion en X (Hugging Models): https://x.com/HuggingModels/status/2107104776085549314
- Documentacion de Hokusai sobre creacion de modelos (contexto general): https://docs.hokus.ai/creating-models
