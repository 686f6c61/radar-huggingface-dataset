# Phoonnx/mixertts-en_us-ljspeech-80-espeak

## Resumen

mixertts-en_us-ljspeech-80-espeak es un modelo de sintesis de voz (text-to-speech) de la familia MixerTTS, desarrollado originalmente por nipponjo en el repositorio github.com/nipponjo/mixer-tts-pytorch y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo convierte texto en ingles estadounidense, representado como fonemas espeak en alfabeto IPA, en un espectrograma que posteriormente se transforma en audio mediante el vocoder vocos-multi-alvocat-22khz.

El modelo resuelve el problema de la sintesis de voz ligera y desplegable en local: al estar empaquetado en formato ONNX y distribuido a traves de la libreria phoonnx, puede ejecutarse sin depender de frameworks de deep learning pesados y se integra en entornos como OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx. Su front-end de texto utiliza la libreria scriptconv, que normaliza el texto y lo convierte a fonemas mediante EspeakPhonemizer.

La relevancia de este modelo es acotada: se trata de un artefacto de empaquetado de un modelo upstream, con muy poca adopcion (24 descargas, 0 likes en el momento de la consulta) y sin licencia registrada. Es util para quien necesite un motor TTS en ingles integrado en el ecosistema phoonnx/OVOS, pero no es un modelo de proposito general ni compite con sistemas TTS de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MixerTTS (modelo acustico) + vocoder vocos-multi-alvocat-22khz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US |
| Licencia | other (sin licencia registrada; consultar el release upstream) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Frecuencia de muestreo del vocoder | 22 kHz |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MixerTTS, definida en el repositorio upstream github.com/nipponjo/mixer-tts-pytorch. Se trata de un modelo acustico que recibe fonemas espeak en alfabeto IPA y genera un espectrograma; la conversion a forma de onda la realiza un vocoder separado, vocos-multi-alvocat-22khz, que phoonnx descarga junto con la voz. El modelo esta empaquetado en ONNX para su ejecucion mediante la libreria phoonnx.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del entrenamiento. El nombre del modelo sugiere que se entreno sobre el corpus LJSpeech (80, segun el identificador), pero este dato no se confirma de forma explicita en la model card. No se han publicado detalles sobre el proceso de entrenamiento en la informacion disponible.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Generacion de espectrogramas a partir de fonemas espeak en alfabeto IPA.
- Conversion de espectrograma a audio a 22 kHz mediante el vocoder vocos-multi-alvocat-22khz.
- Integracion con la libreria phoonnx para sintesis en Python (`voice.synthesize_wav`).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalizacion y conversion de texto a fonemas mediante scriptconv (`EspeakPhonemizer`).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar de voz a un asistente domestico en ingles configurando la voz en `mycroft.conf`.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o domotica: al ejecutarse en ONNX y no requerir GPU, puede sintetizar mensajes cortos en local con baja latencia.
- Generacion de audiolibros o contenido narrado en ingles: el modelo sintetiza frases completas a partir de texto normalizado por scriptconv, adecuado para narracion por lotes.
- Prototipado de interfaces conversacionales: util para validar flujos de voz en ingles antes de invertir en un servicio TTS en la nube.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en entornos sin conectividad.
- Pruebas de integracion en pipelines de CI: al ser un artefacto ONNX pequeno y determinista, sirve para verificar el correcto funcionamiento del front-end de fonemas y del vocoder en pruebas automatizadas.
- Investigacion sobre TTS ligero: punto de partida para comparar la calidad de MixerTTS frente a otras arquitecturas empaquetadas en phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse en ONNX y tratarse de un modelo TTS de tipo acustico con vocoder, es previsible que quepa en CPU, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el despliegue documentado es via phoonnx en Python y OVOS, sin requisitos de GPU especificados.
- Opciones de despliegue: libreria phoonnx (`pip install --pre phoonnx`), plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o la extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mixertts-en_us-ljspeech-80-espeak | MixerTTS + vocoder vocos 22 kHz | en-US | ONNX | other (sin licencia registrada) | Hugging Face, via phoonnx |
| Otras voces de la coleccion MixerTTS de Phoonnx | MixerTTS + vocoder | segun voz | ONNX | other | Hugging Face, via phoonnx |
| Modelos TTS genericos de gran escala (p. ej. VITS, Piper) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- Requiere espeak-ng instalado; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- La licencia figura como "other" y no hay licencia registrada para el modelo; es imprescindible consultar el release upstream antes de cualquier uso, especialmente comercial.
- No se dispone de informacion sobre sesgos del corpus de entrenamiento ni sobre el dataset utilizado.
- Riesgo de alucinacion o de pronunciacion incorrecta en palabras fuera de vocabulario o en textos no normalizados correctamente.
- Adopcion muy baja (24 descargas, 0 likes) y creado/actualizado en fechas de 2026 segun los metadatos, lo que sugiere un artefacto reciente y poco validado por la comunidad.
- No hay benchmarks publicados que permitan evaluar su calidad frente a alternativas.
- El tamano del repositorio se indica como 0.0 GB, lo que puede indicar que los pesos no estan incluidos directamente o que la metrica no es fiable; verificar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/mixertts-en_us-ljspeech-80-espeak
- Repositorio upstream de MixerTTS: https://github.com/nipponjo/mixer-tts-pytorch
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion MixerTTS de Phoonnx: https://huggingface.co/collections/Phoonnx/mixertts-6af8ea927256661d4786e3a8
- Vocoder vocos-multi-alvocat-22khz: https://huggingface.co/Phoonnx/vocos-multi-alvocat-22khz
