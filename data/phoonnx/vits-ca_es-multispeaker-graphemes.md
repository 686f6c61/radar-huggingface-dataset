# Phoonnx/vits-ca_es-multispeaker-graphemes

## Resumen

vits-ca_es-multispeaker-graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Projecte AINA y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo convierte texto en catalan (ca-ES) directamente a audio a partir de los caracteres del texto (graphemes), sin necesidad de un fonemizador externo basado en diccionario. Es un modelo multispeaker, lo que significa que puede generar voces de varios hablantes distintos con un unico conjunto de pesos.

La relevancia de este empaquetado radica en que expone un modelo VITS de referencia para catalan en un formato ONNX listo para produccion, integrable tanto en Python puro como en el ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace ligero y desplegable en entornos con recursos limitados, incluyendo CPU.

Se trata de un modelo especializado y de nicho: un unico idioma (catalan), una unica tarea (sintesis de voz) y una licencia GPL-3.0 que condiciona su uso comercial. No es un modelo de lenguaje general, sino un componente de un pipeline de TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es texto de longitud variable) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | catalan (ca, ca-ES) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variational, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y de adversario. El modelo original fue entrenado por Projecte AINA y publicado como projecte-aina/tts-ca-coqui-vits-multispeaker; este repositorio de Phoonnx lo reempaqueta en ONNX para inferencia con la libreria phoonnx.

El front-end de texto es de tipo graphemes: phoonnx delega la conversion en scriptconv, concretamente en GraphemePhonemizer de scriptconv.phonemizers.base, que normaliza el texto y lo transforma en la entrada del modelo sin requerir un lexico fonetico especifico. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Sintesis de voz end-to-end a partir de texto en catalan (ca-ES).
- Soporte multispeaker: multiples voces con un unico modelo.
- Entrada basada en graphemes, sin fonemizacion dependiente de diccionario.
- Inferencia en formato ONNX, ejecutable en CPU sin GPU dedicada.
- Integracion en Python mediante TTSModelManager de phoonnx.
- Integracion en OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en catalan: el modelo puede generar respuestas habladas en ca-ES dentro de un asistente domestico basado en OVOS, seleccionandolo en mycroft.conf mediante el plugin ovos-tts-plugin-phoonnx.
- Lectura de contenido accesible: conversion de articulos, noticias o documentacion a audio para usuarios con discapacidad visual, aprovechando el soporte multispeaker para ofrecer distintas voces.
- Audiolibros y narracion automatizada: generacion de narraciones en catalan con varias voces para diferenciar personajes o secciones, dado el caracter multispeaker del modelo.
- Sistemas de megafonia y avisos publicos: sintesis de anuncios en catalan en estaciones, aeropuertos o comercios, con despliegue ligero en CPU por el tamano reducido del repositorio (0,1 GB).
- Integracion en aplicaciones de aprendizaje de idiomas: generacion de pronunciacion sintetica en catalan para ejercicios de escucha, usando el front-end de graphemes para aceptar texto sin transcripcion fonetica manual.
- Prototipado rapido de TTS en investigacion: uso del modelo ONNX como linea base reproducible para experimentos de sintesis en catalan, gracias a la licencia GPL-3.0 y a la disponibilidad del codigo de phoonnx y scriptconv.
- Localizacion de interfaces habladas: incorporacion de voz en catalan en productos que ya usan phoonnx, reutilizando el mismo pipeline de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo VITS de aproximadamente 0,1 GB en ONNX, es probable que quepa en memoria de CPU, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible; el formato ONNX permite ejecucion en CPU y potencialmente en GPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, y runtime ONNX subyacente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ca_es-multispeaker-graphemes | VITS | ca-ES | no disponible | no aplica | GPL-3.0 | ONNX |
| projecte-aina/tts-ca-coqui-vits-multispeaker (upstream) | VITS | ca-ES | no disponible | no aplica | GPL-3.0 | no disponible |
| Otros modelos VITS de la coleccion Phoonnx | VITS | variable | no disponible | no aplica | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial o la distribucion del modelo dentro de productos derivados puede obligar a liberar el codigo bajo la misma licencia; es un caveat importante para produccion.
- Un solo idioma: solo catalan (ca-ES); no soporta otros idiomas ni cambio de codigo.
- Modelo especializado en TTS: no realiza comprension de texto, razonamiento ni generacion de lenguaje.
- Riesgo de errores de pronunciacion en palabras extranas, siglas o numeros, ya que el front-end se basa en graphemes y no en un lexico fonetico completo.
- Posibles sesgos en las voces del dataset original de Projecte AINA, no documentados en la informacion disponible.
- No se han publicado evaluaciones de calidad (MOS, WER) en la informacion disponible.
- El repositorio tiene pocas descargas (17) y ningun like, lo que sugiere un uso limitado y poca validacion por parte de la comunidad.
- Dependencia de la libreria phoonnx en version pre-release (pip install --pre phoonnx), lo que implica posibles cambios de API.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-multispeaker-graphemes
- Modelo upstream: https://huggingface.co/projecte-aina/tts-ca-coqui-vits-multispeaker/tree/main/model
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
