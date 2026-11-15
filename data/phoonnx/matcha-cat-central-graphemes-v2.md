# Phoonnx/matcha-cat-central-graphemes-v2

## Resumen

matcha-cat-central-graphemes-v2 es un modelo de sintesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como extracto del repositorio agregador Phoonnx/phoonnx-matcha. Se corresponde con la carpeta `cat-central-graphemes-v2` de dicho repositorio y esta pensado para su uso con la libreria phoonnx, un motor de inferencia TTS del ecosistema OpenVoiceOS. El modelo toma como base el trabajo BSC-LT/matxa-tts-v2-ca-central-graphemes, un sistema Matcha-TTS para catalan central con entrada basada en grafemas.

La relevancia de esta ficha es limitada: se trata de un artefacto derivado (una copia de pesos y configuracion) mas que de un modelo entrenado de novo por el autor de la publicacion. El repositorio ocupa 0,3 GB, no registra descargas ni interacciones y no incluye model card propia mas alla de la referencia al repositorio origen. La licencia declarada es Apache 2.0, heredada del modelo fuente.

La arquitectura subyacente es Matcha-TTS, un modelo acustico no autorregresivo basado en flow matching con decoder de tipo WaveNeXt fusionado (segun la tabla de la model card del repositorio fuente), orientado a sintesis rapida y ligera. No se dispone de informacion sobre el tamano en parametros, la longitud de contexto ni los idiomas soportados mas alla de la indicacion del catalan central en el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (flow matching no autorregresivo) con decoder WaveNeXt fusionado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | catalan central (inferido del nombre del modelo fuente); no se documentan otros |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en Matcha-TTS, una arquitectura de sintesis de voz que combina un encoder de texto, un decoder acustico basado en flow matching (modelado generativo continuo mediante ecuaciones diferenciales ordinarias) y un vocoder. En esta variante, el vocoder es un WaveNeXt fusionado, lo que sugiere que el modelo integra la generacion de forma de onda en el mismo grafo ONNX. La entrada es a nivel de grafemas, sin fonemizacion intermedia, lo que simplifica el pipeline de inferencia pero puede afectar a la precision de pronunciacion en palabras ambiguas.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. El modelo fuente (BSC-LT/matxa-tts-v2-ca-central-graphemes) procede del Barcelona Supercomputing Center, pero los detalles de su entrenamiento no se recogen en la informacion proporcionada. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de Matcha-TTS.

## Capacidades

- Sintesis de voz a partir de texto en catalan central, con entrada basada en grafemas.
- Generacion de audio en un unico paso no autorregresivo (flow matching), lo que reduce la latencia frente a modelos autoregresivos.
- Integracion con el motor phoonnx y exposicion mediante el identificador de voz `OpenVoiceOS/matxa-cat-central-graphemes-v2`.
- Ejecucion en formato ONNX, compatible con runtimes de inferencia ONNX (ONNX Runtime, entre otros).
- No se documentan capacidades de clonacion de voz, control de estilo, emocion, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).
- Capacidades multilingues: no disponibles; el modelo esta orientado al catalan central.

## Casos de uso

- Asistentes de voz en catalan: el modelo puede generar respuestas habladas en catalan central dentro de un asistente tipo OpenVoiceOS, integrándose mediante el identificador de voz expuesto por phoonnx.
- Lectura de contenido accesible: conversion de articulos, notificaciones o documentos a audio para usuarios con discapacidad visual, aprovechando la ligereza del modelo (0,3 GB) para despliegue en local.
- Sistemas de anuncios y avisos automatizados: generacion de mensajes hablados en catalan para transporte publico, aeropuertos o comercios, con inferencia rapida gracias al esquema no autorregresivo.
- Integracion en dispositivos de borde: al distribuirse en ONNX y ocupar un espacio reducido, puede ejecutarse en hardware modesto (Raspberry Pi, mini-PC) sin GPU dedicada, siempre que el runtime ONNX este disponible.
- Prototipado de interfaces conversacionales en catalan: uso como voz de referencia en el desarrollo de skills de voz para el ecosistema OpenVoiceOS antes de invertir en modelos comerciales.
- Generacion de audio para contenido educativo: narracion de materiales didacticos en catalan central, con la salvedad de que la calidad y naturalidad no estan documentadas en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,3 GB, por lo que el modelo completo en ONNX deberia caber en menos de 1 GB de memoria en la mayoria de configuraciones.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, es probable que funcione en CPU y en GPU de gama baja, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: previsiblemente si (RTX 3060, RTX 4060 o inferiores), aunque no esta documentado.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| matcha-cat-central-graphemes-v2 (este) | Matcha-TTS + WaveNeXt | no disponible | no disponible | Apache 2.0 | ONNX | Hugging Face (0 descargas) |
| BSC-LT/matxa-tts-v2-ca-central-graphemes | Matcha-TTS | no disponible | no disponible | Apache 2.0 | no disponible | Hugging Face (modelo fuente) |
| Otros modelos TTS en catalan | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado: se trata de una copia de la carpeta `cat-central-graphemes-v2` del repositorio Phoonnx/phoonnx-matcha, no de un entrenamiento original; cualquier problema del modelo fuente se hereda.
- Ausencia de model card propia: no hay documentacion sobre datos de entrenamiento, sesgos, calidad o condiciones de uso mas alla de la referencia al modelo fuente.
- Idioma restringido: orientado al catalan central; no se documenta soporte para otras variedades del catalan ni para otros idiomas.
- Riesgo de pronunciacion incorrecta: la entrada basada en grafemas (sin fonemizacion) puede producir errores en palabras con grafia ambigua o prestamos.
- Sesgos: no documentados; al no conocerse la composicion del corpus de entrenamiento, no es posible evaluar sesgos de genero, acento o registro.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda verificar la procedencia y las condiciones del modelo fuente BSC-LT/matxa-tts-v2-ca-central-graphemes antes de desplegarlo en produccion.
- Sin evidencia de uso: cero descargas y cero interacciones en el momento de la consulta; no hay validacion comunitaria de su calidad.
- Formato ONNX: requiere un runtime compatible; no es directamente utilizable en frameworks como PyTorch sin conversion.

## Enlaces

- [Hugging Face: Phoonnx/matcha-cat-central-graphemes-v2](https://huggingface.co/Phoonnx/matcha-cat-central-graphemes-v2)
- [Repositorio fuente: Phoonnx/phoonnx-matcha](https://huggingface.co/Phoonnx/phoonnx-matcha)
- [Modelo original: BSC-LT/matxa-tts-v2-ca-central-graphemes](https://huggingface.co/BSC-LT/matxa-tts-v2-ca-central-graphemes)
- [Repositorio de phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
