# Phoonnx/styletts2-es-bsc_lt

## Resumen

StyleTTS2-es-bsc_lt es un modelo de sintesis de voz (text-to-speech) en castellano empaquetado en formato ONNX por Phoonnx a partir del modelo original BSC-LT/styletts2-spanish-multispeaker, desarrollado por el Barcelona Supercomputing Center - Language Technologies (BSC-LT). El modelo resuelve la conversion de texto a audio en espanol con capacidad de clonacion de voz a partir de audio de referencia, y su relevancia radica en que ofrece una via de despliegue ligera mediante la libreria phoonnx, sin necesidad de framework de deep learning completo.

La arquitectura subyacente es StyleTTS2, un sistema TTS neuronal que combina un generador basado en difusion estilistica con discriminadores adversarios y un modelo de prosodia. El modelo es multihablante y acepta fonemas en alfabeto IPA generados por espeak-ng como entrada de texto. El repositorio pesa 0,8 GB y esta publicado bajo licencia Apache 2.0, lo que facilita su integracion en productos comerciales.

El empaquetado para phoonnx permite su uso tanto en Python como en el ecosistema OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx, lo que lo hace adecuado para asistentes de voz y aplicaciones de sintesis en espanol de forma local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | es (espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak-ng en alfabeto IPA |
| Voces incluidas | 7 voces (bsc/es-cml10246, es-cml11797, es-cml12367, es-cml3946, es-cml8882, es-cml9972, es-styletts2) |
| Clonacion de voz | Si, a partir de audio de referencia |
| Tamano del repositorio | 0,8 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de sintesis de voz neuronal que combina un generador con modelado de estilo por difusion, discriminadores multiperiodo y un modelo de prosodia entrenado de forma separada. El modelo original fue entrenado por BSC-LT como sistema multihablante para espanol, y esta version es un empaquetado ONNX del mismo, sin reentrenamiento por parte de Phoonnx.

No se dispone en la informacion proporcionada de datos sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La innovacion principal de este empaquetado es la conversion a ONNX y la integracion con el front-end de texto de phoonnx, que normaliza el texto mediante scriptconv y lo convierte a fonemas IPA con espeak-ng (o con el port espyak como alternativa).

## Capacidades

- Sintesis de voz en espanol a partir de texto.
- Clonacion de voz a partir de audio de referencia del hablante.
- Siete voces predefinidas correspondientes a distintos hablantes del modelo original.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control preciso de la pronunciacion.
- Integracion con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecucion local en formato ONNX sin dependencia de frameworks de deep learning pesados.
- Normalizacion y conversion de texto mediante la libreria scriptconv.

## Casos de uso

- Asistentes de voz locales en espanol: el modelo puede integrarse en OVOS como motor TTS mediante el plugin ovos-tts-plugin-phoonnx, configurando la voz en mycroft.conf, lo que permite sintesis offline en dispositivos domésticos.
- Lectura de contenido accesible: conversion de articulos, documentos o notificaciones a audio en espanol para aplicaciones de accesibilidad, usando las voces predefinidas o clonando la voz del usuario.
- Generacion de audiolibros y narracion: sintesis de texto largo con una voz consistente seleccionada entre las siete disponibles, adecuada para narracion de contenidos editoriales.
- Prototipado de interfaces conversacionales: al ejecutarse en ONNX y con un repositorio de 0,8 GB, permite iterar rapidamente en el desarrollo de chatbots de voz sin infraestructura GPU dedicada.
- Personalizacion de voz en aplicaciones: la clonacion a partir de audio de referencia permite generar locuciones con la voz de un hablante concreto para demos, videos corporativos o contenidos personalizados.
- Integracion en pipelines de generacion de contenido: sintesis por lotes de guiones o textos para videos, podcasts o materiales formativos en espanol, con control de pronunciacion mediante fonemas IPA.
- Sistemas de anuncios y avisos automatizados: generacion de mensajes de voz dinamicos en espanol para transporte publico, comercios o sistemas de megafonia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un modelo ONNX de 0,8 GB, es previsible que quepa en GPU consumer de gama media, aunque no se confirma con datos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: phoonnx (Python), plugin ovos-tts-plugin-phoonnx para OVOS, ejecucion via ONNX Runtime.
- Dependencias: espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]` con el port espyak).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Clonacion de voz | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/styletts2-es-bsc_lt | StyleTTS2 | es | Si | Apache 2.0 | ONNX |
| BSC-LT/styletts2-spanish-multispeaker | StyleTTS2 | es | Si | Apache 2.0 | no disponible |
| Otros modelos StyleTTS2 de la coleccion Phoonnx | StyleTTS2 | varios | Si | segun modelo | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta espanol; no es multilingue.
- La calidad de pronunciacion depende de espeak-ng; con el port espyak algunos fonemas difieren y pueden producir palabras mal pronunciadas.
- Requiere instalar espeak-ng en el sistema o el extra `phoonnx[espeak]`, lo que anade una dependencia externa.
- No se dispone de informacion sobre sesgos de generacion, cobertura de acentos o variedades dialectales del espanol.
- Riesgo de alucinacion no aplicable en el sentido de LLM, pero puede producir prosodia o pronunciacion incorrecta en textos con nombres propios, siglas o palabras extranjeras.
- La clonacion de voz conlleva riesgos de uso indebido (suplantacion de identidad); la licencia Apache 2.0 no impone restricciones eticas adicionales, por lo que la responsabilidad recae en el integrador.
- El modelo tiene solo 27 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- No se han publicado benchmarks que permitan evaluar su calidad objetiva frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-es-bsc_lt
- Modelo original: https://huggingface.co/BSC-LT/styletts2-spanish-multispeaker
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
