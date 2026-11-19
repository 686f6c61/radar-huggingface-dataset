# slpr-lab/DELTA-TTS

## Resumen

DELTA-TTS es un modelo de sintesis de voz (text-to-speech) desarrollado por el grupo slpr-lab que adapta un modelo TTS autorregresivo preentrenado (Fun-CosyVoice3-0.5B-2512) a un modelo de lenguaje de difusion discreta. En lugar de generar los tokens de habla de izquierda a derecha, DELTA-TTS los decodifica en orden de confianza mediante un esquema de difusion discreta, lo que permite paralelizar parcialmente la generacion. El modelo se presenta en el articulo "DELTA-TTS: Adapting Autoregressive Model into Diffusion Language Model for Text-to-Speech" (NeurIPS 2026).

Tecnicamente, DELTA-TTS no es un modelo completo desde cero: es un adaptador de 94M de parametros que se aplica sobre el backbone de Fun-CosyVoice3-0.5B-2512. Concretamente, incorpora modulos LoRA (rango r=64), convoluciones depth-wise (kernel k=31) y un embedding [MASK] que habilita el proceso de difusion. El backbone, el tokenizador de habla, el decodificador de flow-matching y el vocoder se cargan directamente del repositorio base.

Su relevancia radica en que demuestra que es posible convertir un TTS autorregresivo en un modelo de difusion discreta sin reentrenar desde cero, manteniendo la calidad del modelo original y abriendo la puerta a decodificacion no secuencial. El modelo esta publicado bajo licencia Apache-2.0, lo que facilita su uso comercial, y soporta TTS zero-shot en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de difusion discreta sobre backbone autorregresivo (Fun-CosyVoice3-0.5B-2512) con LoRA y convoluciones depth-wise |
| Parametros totales | 94M (adaptador DELTA-TTS); backbone base de 0.5B cargado aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`delta_tts.pt`) |

## Arquitectura y entrenamiento

DELTA-TTS parte de Fun-CosyVoice3-0.5B-2512, un modelo TTS autorregresivo que genera tokens de habla de forma secuencial. La contribucion del trabajo es transformar ese paradigma en un modelo de difusion discreta: los tokens de habla se enmascaran y se decodifican en orden de confianza, no de izquierda a derecha. Para ello se anaden tres componentes sobre el backbone congelado: modulos LoRA con rango r=64 que adaptan las capas de atencion, convoluciones depth-wise con kernel k=31 que capturan contexto local entre tokens, y un embedding [MASK] que representa los tokens pendientes de predecir durante el proceso de difusion.

El modelo resultante tiene 94M de parametros entrenables y se distribuye como un unico fichero `delta_tts.pt`. El backbone, el tokenizador de habla, el decodificador de flow-matching y el vocoder no se incluyen en este repositorio: se cargan desde Fun-CosyVoice3-0.5B-2512. No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal es el esquema de decodificacion por confianza, que sustituye la generacion secuencial por un proceso iterativo de desenmascaramiento.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto.
- TTS zero-shot: capacidad de sintetizar voces no vistas durante el entrenamiento a partir de una referencia de audio.
- Decodificacion de tokens de habla en orden de confianza mediante difusion discreta, en lugar de generacion autorregresiva secuencial.
- Integracion con el pipeline completo de Fun-CosyVoice3 (tokenizador, flow-matching decoder y vocoder).
- Adaptacion mediante LoRA sobre un backbone congelado, lo que reduce el coste de entrenamiento frente a un modelo desde cero.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; el modelo es exclusivamente TTS.

## Casos de uso

- Sintesis de voz para asistentes conversacionales: el modelo genera habla natural en ingles a partir de texto, adecuado para integrarse en pipelines de atencion al cliente donde se requiere respuesta hablada de baja latencia.
- Clonacion de voz zero-shot: gracias a su capacidad zero-shot, permite generar locuciones con una voz de referencia proporcionada en tiempo de inferencia, util para personalizacion de contenido o doblaje.
- Generacion de audiolibros y contenido narrado: la sintesis de texto a voz de calidad permite convertir grandes volumenes de texto en audio de forma automatizada.
- Accesibilidad: conversion de articulos, documentacion o interfaces en audio para usuarios con discapacidad visual, aprovechando el soporte de ingles.
- Prototipado de interfaces de voz: el modelo sirve como base para experimentar con decodificacion por difusion en TTS, al ser un adaptador ligero (94M) sobre un backbone conocido.
- Investigacion en modelos de difusion discreta aplicados a audio: el esquema de decodificacion por confianza es un caso de estudio para explorar generacion no secuencial en dominios de habla.
- Generacion de voces para videojuegos o medios: sintesis de dialogos en ingles con voces variadas mediante referencias zero-shot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador DELTA-TTS ocupa 0.4 GB en disco; el backbone Fun-CosyVoice3-0.5B-2512 (0.5B parametros) debe cargarse adicionalmente, por lo que se requiere VRAM suficiente para ambos componentes.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el backbone de 0.5B sugiere que podria ejecutarse en GPU de consumo con VRAM suficiente, pero no se aportan datos concretos.
- Opciones de despliegue: la model card remite al repositorio de GitHub para instrucciones de instalacion e inferencia; no se especifican frameworks como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| DELTA-TTS | 94M (adaptador) + 0.5B (backbone) | no disponible | en | Apache-2.0 | Difusion discreta sobre TTS autorregresivo |
| Fun-CosyVoice3-0.5B-2512 | 0.5B | no disponible | no disponible | Apache-2.0 | TTS autorregresivo (modelo base) |
| Alternativas TTS zero-shot | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros modelos TTS zero-shot no puede completarse con la informacion disponible; el unico punto de referencia directo es el modelo base Fun-CosyVoice3-0.5B-2512, del que DELTA-TTS hereda backbone, tokenizador, decodificador y vocoder.

## Limitaciones y advertencias

- Solo soporta ingles; no se documenta soporte multilingue.
- No se han publicado resultados de benchmarks, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- El modelo no es autocontenido: requiere descargar y cargar el backbone Fun-CosyVoice3-0.5B-2512, el tokenizador, el decodificador de flow-matching y el vocoder desde otro repositorio.
- Riesgo de alucinacion y artefactos en la sintesis de voz no cuantificado en la informacion disponible.
- Sesgos de voz (acento, genero, edad) no documentados; al entrenarse sobre datos no especificados, pueden heredarse sesgos del backbone.
- Aunque la licencia es Apache-2.0 y permite uso comercial, deben respetarse las condiciones del modelo base Fun-CosyVoice3-0.5B-2512, tambien Apache-2.0.
- No se dispone de informacion sobre latencia, throughput ni requisitos minimos de hardware, lo que dificulta planificar su uso en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy temprana y poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/slpr-lab/DELTA-TTS
- Articulo (arXiv): https://arxiv.org/abs/2607.04140
- Repositorio GitHub: https://github.com/slpr-lab/DELTA-TTS
- Demo page: https://slpr-lab.github.io/DELTA-TTS/
- OpenReview: https://openreview.net/forum?id=c4cM3P84zM
- Modelo base Fun-CosyVoice3-0.5B-2512: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
