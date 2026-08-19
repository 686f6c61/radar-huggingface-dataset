# Iambackup/Qwen3-TTS-12Hz-1.7B-VoiceDesign

## Resumen

Qwen3-TTS es una serie de modelos de síntesis de voz desarrollada por el equipo Qwen de Alibaba, publicada en enero de 2026. Este repositorio concreto, `Iambackup/Qwen3-TTS-12Hz-1.7B-VoiceDesign`, es una subida de un tercero (usuario Iambackup) que aloja la variante orientada al diseño de voz del modelo base de 1.700 millones de parámetros. El modelo resuelve el problema de generar voz humana de alta calidad con control fino sobre timbre, emoción y prosodia mediante instrucciones en lenguaje natural, además de permitir clonación de voz y diseño de voces nuevas desde cero.

La arquitectura emplea un modelo de lenguaje (LM) discreto de múltiples codebooks que opera sobre un tokenizador acústico propio de 12 Hz, lo que permite una compresión eficiente y un modelado semántico de alta dimensión. El modelo soporta diez idiomas principales y ofrece generación en streaming con una latencia extremadamente baja, de hasta 97 ms de extremo a extremo. Su relevancia actual radica en que combina capacidades de control por texto, baja latencia y calidad de audio comparable a sistemas propietarios, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook (no se especifica el tipo de backbone) |
| Parametros totales | 1.916.676.352 (1,9 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de LM discreto con múltiples codebooks, una técnica que evita los cuellos de botella de información típicos de los sistemas TTS tradicionales. El tokenizador acústico propietario, denominado Qwen3-TTS-Tokenizer-12Hz, opera a 12 Hz y comprime la señal de audio en representaciones discretas de alta dimensión, lo que permite al LM modelar directamente la relación entre texto, instrucciones de control y audio. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

La innovación principal es el soporte de control por lenguaje natural: el modelo interpreta instrucciones como "habla con tono enfadado" o "imita la voz de una persona mayor" para ajustar timbre, emoción y prosodia sin necesidad de referencias de audio adicionales. Además, la generación en streaming con latencia de 97 ms lo hace adecuado para aplicaciones interactivas en tiempo real.

## Capacidades

- Generacion de voz de alta calidad a partir de texto en diez idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, español e italiano.
- Clonacion de voz: puede replicar la voz de un hablante a partir de una muestra de referencia (funcionalidad `generate_custom_voice`).
- Diseno de voz: permite crear voces nuevas especificando características vocales mediante instrucciones en lenguaje natural.
- Control fino de prosodia, emocion y timbre a traves de comandos textuales (p. ej., "con tono de enfado", "susurrando").
- Generacion en streaming con latencia de extremo a extremo de hasta 97 ms.
- Soporte de multiples perfiles dialectales dentro de los idiomas principales.

## Casos de uso

- Audiolibros y narracion automatizada: el modelo puede generar narraciones con diferentes voces y estilos emocionales para cada personaje, usando instrucciones en lenguaje natural para variar la interpretacion sin necesidad de edicion manual.
- Asistentes de voz y chatbots conversacionales: gracias a la latencia de 97 ms, es viable integrarlo en sistemas de dialogo en tiempo real donde el usuario espera respuestas vocales inmediatas.
- Doblaje y localizacion de contenido audiovisual: la clonacion de voz permite mantener la voz de un actor en multiples idiomas, reduciendo costes de grabacion en estudio.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: conversion de texto escrito a voz natural en aplicaciones de lectura de pantalla, con control de velocidad y tono.
- Educacion y aprendizaje de idiomas: generacion de ejemplos de pronunciacion en diez idiomas con distintos acentos y registros, util para aplicaciones de practica conversacional.
- Produccion de contenido para redes sociales y marketing: creacion de voces personalizadas para anuncios, videos explicativos o podcasts sin necesidad de locutores profesionales.
- Videojuegos y mundos virtuales: generacion dinamica de dialogos de personajes no jugadores (NPC) con voces unicas y expresivas, adaptables a las acciones del jugador.

## Benchmarks y rendimiento

La model card oficial reporta resultados de evaluacion en el conjunto de test Seed-TTS para el modelo base `Qwen3-TTS-12Hz-1.7B-Base`, medidos con Word Error Rate (WER, menor es mejor):

| Modelo | test-zh (WER) | test-en (WER) |
|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base | 0,77 | 1,24 |

No se han publicado resultados especificos para la variante `VoiceDesign` de este repositorio. Tampoco hay datos comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware en la documentacion publicada.
- Estimacion basada en el tamano del modelo (1,9 B parametros en bfloat16): el checkpoint ocupa aproximadamente 4,5 GB en disco, por lo que la inferencia en bf16 requiere al menos 5-6 GB de VRAM.
- Es probable que quepa en GPUs de consumo como la RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores, aunque no hay confirmacion oficial.
- Para produccion se recomienda una GPU con al menos 16 GB de VRAM (p. ej., RTX 4080, A10, L4) para manejar lotes y el tokenizador de audio.
- El despliegue se realiza mediante la libreria `qwen-tts` de Python, que gestiona la carga del modelo y la generacion. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no un LLM de texto.
- La latencia de generacion en streaming se anuncia en 97 ms de extremo a extremo, aunque este valor depende del hardware y de la implementacion.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre Qwen3-TTS y otros modelos TTS (como VITS, Tacotron 2, Bark, XTTS o StyleTTS 2) en la informacion proporcionada. La unica referencia de rendimiento es el WER del modelo base en Seed-TTS, sin comparaciones directas. Por tanto, no es posible ofrecer una tabla comparativa fiable sin inventar datos.

## Limitaciones y advertencias

- Este repositorio es una subida de un tercero (Iambackup), no un lanzamiento oficial de Qwen. Aunque la model card es la oficial, la integridad y reproducibilidad del checkpoint no estan garantizadas por el equipo de Qwen.
- No se han publicado datos sobre sesgos del modelo, pero al entrenarse con datos multilingues puede presentar sesgos culturales o de genero en las voces generadas.
- Riesgo de errores de pronunciacion en nombres propios, terminos tecnicos o palabras fuera del vocabulario de entrenamiento, especialmente en idiomas con menos representacion.
- La generacion de voz con instrucciones complejas puede producir resultados inconsistentes si la instruccion es ambigua o demasiado larga.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del paper y del repositorio oficial de Qwen para confirmar restricciones adicionales sobre el uso de voces clonadas.
- No se especifican limitaciones de contexto o longitud maxima de texto de entrada; es probable que textos muy largos degraden la calidad o requieran segmentacion.
- Para produccion, es necesario validar la calidad del audio en el idioma y dominio de uso especifico, ya que los benchmarks publicados solo cubren chino e ingles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Iambackup/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Coleccion oficial de Qwen en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- ModelScope (coleccion oficial): https://modelscope.cn/collections/Qwen/Qwen3-TTS
- Blog de Qwen sobre Qwen3-TTS: https://qwen.ai/blog?id=qwen3tts-0115
- Paper tecnico (arXiv): https://huggingface.co/papers/2601.15621
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen3-TTS
