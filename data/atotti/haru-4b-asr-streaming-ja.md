# Atotti/haru-4b-asr-streaming-ja

## Resumen

Haru-4B-ASR-Streaming-JA es un modelo de reconocimiento automatico del habla (ASR) en japones, derivado mediante fine-tuning del modelo base higurashi-ai/Haru-4B. Lo publica el usuario Atotti en Hugging Face bajo licencia Apache 2.0 y acceso restringido (gated). El modelo esta disenado especificamente para transcripcion en streaming y operacion full-duplex, lo que lo orienta a aplicaciones de voz en tiempo real mas que a transcripcion por lotes.

El repositorio contiene pesos en formato safetensors con 5.270.000.897 parametros (aproximadamente 5,27 mil millones), y ocupa 10,6 GB en total. El modelo base Haru-4B es un modelo de lenguaje de aproximadamente 4 mil millones de parametros segun su nombre, aunque el checkpoint publicado aqui supera esa cifra, probablemente por la incorporacion de componentes adicionales para la tarea ASR (codificador acustico, proyecciones u otros modulos).

Su relevancia actual radica en la escasez de modelos ASR en japones con soporte nativo de streaming y full-duplex, capacidades poco frecuentes en la mayoria de sistemas ASR open source, que suelen estar pensados para audio previamente grabado. Al estar construido sobre un LLM, es plausible que herede ciertas capacidades de comprension contextual, aunque esta ficha no puede confirmarlo sin documentacion adicional del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de un LLM base, Haru-4B; detalles del componente acustico no publicados) |
| Parametros totales | 5.270.000.897 (5,27 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors como formato de pesos) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento. El modelo se presenta como un fine-tune de higurashi-ai/Haru-4B para ASR en japones, con enfasis en streaming y full-duplex. La etiqueta "full-duplex" sugiere que el sistema puede procesar audio de entrada mientras genera salida de forma simultanea, una capacidad tipica de pipelines de voz conversacional en tiempo real.

El numero de parametros del checkpoint (5,27 B) es superior al que sugiere el nombre del modelo base (4 B), lo que indica que el fine-tuning ha anadido modulos, probablemente un codificador de audio y capas de proyeccion hacia el espacio del LLM. No hay datos publicados sobre volumen de tokens de audio, composicion del corpus de entrenamiento, uso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Reconocimiento automatico del habla en japones (transcripcion de audio a texto).
- Procesamiento en streaming: disenado para transcribir audio de forma incremental, no solo ficheros completos.
- Operacion full-duplex: puede gestionar entrada y salida simultaneas, lo que habilita interacciones conversacionales en tiempo real.
- Integracion con un LLM base (Haru-4B), lo que podria aportar contexto linguistico en la transcripcion, aunque no esta documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al japones segun los metadatos.
- Vision, audio generativo u otras modalidades: no disponible.

## Casos de uso

- Subtitulado en directo de reuniones o eventos en japones: el modo streaming permite generar subtitulos con baja latencia mientras se habla, sin esperar al final de la intervencion.
- Asistentes de voz conversacionales en japones: la capacidad full-duplex facilita que el sistema escuche y responda de forma solapada, mejorando la naturalidad del dialogo.
- Transcripcion de atencion al cliente en tiempo real: util para generar registros y analitica de llamadas a medida que se producen, con el modelo ejecutandose en infraestructura propia.
- Accesibilidad para personas con discapacidad auditiva en entornos japoneses: conversion de voz a texto en directo en aulas, conferencias o videollamadas.
- Dictado y toma de notas por voz en aplicaciones de productividad: el modelo puede integrarse en editores o herramientas de notas para transcribir dictado en japones.
- Analisis de audio en pipelines de investigacion: al ser Apache 2.0 y pesos safetensors, permite experimentacion y ajuste fino adicional en entornos academicos.
- Prototipos de agentes de voz sobre LLM: combinado con el modelo base Haru-4B, puede servir como front-end de reconocimiento en arquitecturas de asistente conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 10-11 GB solo para pesos, mas memoria para activaciones y buffers de audio; en la practica, se recomienda al menos 16-24 GB de VRAM.
- Cuantizacion: no se han publicado variantes cuantizadas (GGUF, AWQ, GPTQ) en el repositorio; habria que generarlas manualmente.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con margen. En GPUs de 16 GB (RTX 4080, A4000) podria requerir cuantizacion a 8 bits o cuidado con el batch.
- GPU de consumo: cabe en RTX 4090 y posiblemente en RTX 3090 (24 GB); en GPUs de 12 GB o menos seria necesario cuantizar.
- Opciones de despliegue: no hay documentacion oficial; al ser safetensors, es compatible con frameworks de inferencia estandar (transformers, vLLM si el modelo expone una interfaz compatible, TGI). Para streaming en tiempo real habria que implementar el bucle de audio manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Streaming/full-duplex | Disponibilidad |
|---|---|---|---|---|---|---|
| Atotti/haru-4b-asr-streaming-ja | 5,27 B | no disponible | ja | Apache 2.0 | si (segun metadatos) | gated en Hugging Face |
| Whisper large-v3 (OpenAI) | ~1,55 B | 30 s de audio por ventana | multilingue (~99) | MIT | no nativo (ventanas) | abierto |
| ReazonSpeech (varios tamanos) | variable | no disponible | ja | variable | no documentado | abierto |
| higurashi-ai/Haru-4B (base) | ~4 B | no disponible | no disponible | no disponible | no aplica (LLM) | abierto |

La comparacion es orientativa: Whisper large-v3 es el referente ASR multilingue open source, pero no esta disenado para streaming nativo ni full-duplex. ReazonSpeech es una familia japonesa con enfoque en transcripcion por lotes. Haru-4B-ASR-Streaming-JA se diferencia por su orientacion explicita a tiempo real, aunque carece de benchmarks publicados que permitan comparar calidad de transcripcion.

## Limitaciones y advertencias

- Solo soporta japones; no se debe esperar buen rendimiento en otros idiomas.
- No hay benchmarks publicados, por lo que se desconoce su calidad real frente a Whisper u otros ASR establecidos.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatizacion en CI/CD.
- No se documentan sesgos, tasas de alucinacion ni comportamiento con audio ruidoso, acentos regionales o habla solapada.
- Al derivar de un LLM, existe riesgo de que el modelo "invente" texto plausible en lugar de transcribir literalmente, especialmente en segmentos de silencio o ruido; conviene validarlo en el dominio objetivo.
- No se ofrecen pesos cuantizados ni recetas de despliegue; el usuario debe construir el pipeline de streaming y full-duplex por su cuenta.
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated puede imponer terminos adicionales que deben revisarse antes de un despliegue en produccion.
- El numero de parametros (5,27 B) y el tamano del repo (10,6 GB) implican requisitos de hardware superiores a los de ASR ligeros como Whisper small o medium.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atotti/haru-4b-asr-streaming-ja
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Paper, blog, repositorio o demo oficial: no disponible en la informacion proporcionada.
