# Phoonnx/styletts2-eu_es-emo

## Resumen

StyleTTS2-eu_es-emo es un modelo de sintesis de voz (text-to-speech) desarrollado originalmente por el HiTZ Center y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo parte del checkpoint upstream HiTZ/StyleTTS2-eu_emo y esta especializado en euskera (codigo de idioma `eu`), con soporte para tres estilos emocionales: alegre, neutro y triste. Su proposito es generar audio hablado natural en euskera a partir de texto, cubriendo un idioma con escasisimos recursos en el ecosistema TTS open source.

El empaquetado de Phoonnx convierte el modelo original en un artefacto ONNX ligero (0,3 GB de repositorio) que puede ejecutarse sin GPU y sin el stack de entrenamiento original. La entrada de texto no es texto plano directo, sino fonemas en alfabeto IPA generados por el fonemizador AhoTTS del proyecto scriptconv, lo que exige instalar el extra `scriptconv[eu]`. Se distribuye bajo licencia Apache-2.0.

Es relevante para desarrolladores que construyen asistentes de voz, sistemas de accesibilidad o interfaces conversacionales en euskera, un idioma para el que apenas existen alternativas TTS de calidad publicadas con licencia permisiva. El modelo incluye seis voces predefinidas (dos hablantes, Antton y Maider, cada uno con tres emociones), lo que permite variar el tono sin cambiar de checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con difusion estilistica) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX ya exportados) |
| Idiomas soportados | euskera (`eu`, `eu-ES`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas IPA via AhoTTS (`scriptconv.phonemizers.eu`) |
| Voces incluidas | 6 (`hitz/eu-antton-{happy,neutral,sad}`, `hitz/eu-maider-{happy,neutral,sad}`) |
| Tamano del repositorio | 0,3 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

StyleTTS2 es una arquitectura de sintesis de voz que combina un encoder de texto, un encoder de estilo y un decodificador basado en difusion para modelar la prosodia y el timbre de forma estilistica. El modelo original fue entrenado por el HiTZ Center (Universidad del Pais Vasco) sobre corpus de habla en euskera, y la variante `_emo` incorpora etiquetas de emocion que permiten condicionar la generacion de audio hacia estados alegre, neutro o triste.

Phoonnx no reentrena el modelo: exporta el checkpoint upstream a ONNX y lo integra en su pipeline de inferencia, donde la normalizacion de texto y la conversion a fonemas IPA se delega a la libreria scriptconv mediante el fonemizador AhoTTS. No se dispone de informacion sobre el numero de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning adicional en la informacion proporcionada.

## Capacidades

- Sintesis de voz en euskera a partir de texto, con salida en fichero WAV.
- Control de emocion por voz: cada hablante dispone de variantes happy, neutral y sad.
- Dos identidades de voz diferenciadas (Antton y Maider).
- Fonemizacion automatica de texto euskera mediante AhoTTS, integrada en el pipeline de phoonnx.
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en euskera: el modelo sintetiza respuestas habladas en un asistente domestico basado en OVOS o Mycroft, seleccionando la voz y emocion adecuadas al contexto de la conversacion.
- Accesibilidad para lectores de pantalla: conversion de texto digital (noticias, documentos, correo) a audio en euskera para usuarios con discapacidad visual, ejecutandose en CPU en equipos sin GPU dedicada.
- Audiolibros y contenido educativo: generacion de narraciones con distintos tonos emocionales (neutro para contenido tecnico, alegre para material infantil) usando las seis voces disponibles.
- Locuciones para aplicaciones moviles: el tamano compacto del ONNX (0,3 GB) permite empaquetar el modelo en apps offline que necesiten pronunciar texto en euskera sin conexion.
- Prototipado de interfaces conversacionales: integracion rapida via `phoonnx` en Python para validar flujos de voz antes de invertir en modelos comerciales.
- Investigacion en TTS de bajos recursos: punto de partida reproducible y con licencia Apache-2.0 para experimentos de transferencia o evaluacion en lenguas minorizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se ejecuta en CPU mediante ONNX Runtime.
- GPU recomendadas: no requiere GPU. Cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) puede acelerar la inferencia, pero no es un requisito.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada, dado el tamano de 0,3 GB del repositorio.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Emociones | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/styletts2-eu_es-emo | Euskera | StyleTTS2 | Si (3) | Apache-2.0 | ONNX |
| HiTZ/StyleTTS2-eu_emo (upstream) | Euskera | StyleTTS2 | Si (3) | Apache-2.0 | no disponible |
| StyleTTS2 (coleccion Phoonnx) | Multiples | StyleTTS2 | Segun checkpoint | Apache-2.0 (segun checkpoint) | ONNX |

No se dispone de datos de rendimiento comparativo ni de otros modelos TTS en euskera con los que contrastar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta euskera; el texto en otros idiomas no se procesara correctamente.
- Requiere fonemizacion previa con AhoTTS (`scriptconv[eu]`); no acepta texto plano sin el pipeline de scriptconv.
- El control emocional se limita a tres etiquetas discretas (happy, neutral, sad); no hay control continuo de prosodia.
- Riesgo de alucinacion acustica y artefactos en entradas atipicas, como ocurre en la mayoria de modelos TTS neuronales.
- No se han publicado evaluaciones objetivas (MOS, WER) en la informacion disponible; la calidad percibida no esta cuantificada.
- El modelo tiene solo 22 descargas y 0 likes en Hugging Face, por lo que su validacion por la comunidad es practicamente nula.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar los terminos del checkpoint upstream HiTZ/StyleTTS2-eu_emo y de los datos de entrenamiento originales antes de desplegarlo en produccion.
- Al ser un modelo TTS, no ofrece razonamiento, generacion de codigo ni capacidades de agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-eu_es-emo
- Modelo upstream: https://huggingface.co/HiTZ/StyleTTS2-eu_emo
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
