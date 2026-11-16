# Phoonnx/vits-en_us-chitti-espeak

## Resumen

vits-en_us-chitti-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original fue desarrollado por swqg-messiah dentro del repositorio kusaal_chitti_piper y este paquete lo adapta para su uso con phoonnx, la libreria de sintesis de voz ONNX del ecosistema OVOS. Resuelve el problema de disponer de una voz en ingles estadounidense ejecutable localmente sobre ONNX Runtime, sin dependencia de servicios en la nube.

La relevancia de este paquete es eminentemente practica: convierte un checkpoint Piper/VITS en un artefacto consumible por la API de phoonnx, con un front-end fonemico basado en espeak-ng y soporte para el plugin ovos-tts-plugin-phoonnx. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto orientado a inferencia en CPU y dispositivos de bajos recursos.

No se dispone de informacion sobre el numero de parametros, la longitud de contexto (no aplica en TTS) ni el volumen de datos de entrenamiento. La model card se limita a describir el empaquetado, el front-end de texto y las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | ingles estadounidense (en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Tamano del repositorio | ~0,1 GB |
| Autor original | swqg-messiah |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. Genera audio directamente a partir de fonemas, sin necesidad de un vocoder externo, lo que simplifica el despliegue. El modelo original procede del repositorio swqg-messiah/kusaal_chitti_piper, orientado al ecosistema Piper.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas mas alla de la propia arquitectura VITS. La model card unicamente documenta el empaquetado para phoonnx, el front-end de texto (EspeakPhonemizer de scriptconv_copyleft.phonemizers.mul) y la dependencia de espeak-ng o del port espyak para la fonemizacion. Se advierte que algunos fonemas de espyak difieren de los de espeak-ng y pueden provocar pronunciaciones incorrectas en determinadas palabras.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Conversion texto a audio mediante fonemizacion con espeak-ng o espyak, en alfabeto IPA.
- Generacion de ficheros WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local sobre ONNX Runtime, sin dependencia de servicios externos.
- Uso en navegador mediante phoonnx.js, con demo en tigregotico.pt/demo.
- No dispone de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas sin conexion a internet y con baja latencia al ejecutarse sobre ONNX Runtime.
- Lectura de notificaciones y alertas en sistemas embebidos: su tamano reducido (~0,1 GB) y la inferencia ONNX permiten desplegarlo en dispositivos con recursos limitados para locutar mensajes del sistema.
- Accesibilidad para personas con discapacidad visual: sintesis de texto de pantalla en tiempo real en aplicaciones de escritorio, con una voz en ingles estadounidense integrada mediante la API de phoonnx.
- Generacion de audiolibros o podcasts automatizados: conversion por lotes de texto a WAV con `synthesize_wav`, adecuada para pipelines offline donde no se requiere una voz expresiva sino una locucion clara y consistente.
- Prototipado de interfaces conversacionales: al ser un paquete pequeno y de licencia MIT, sirve para iterar rapidamente en demos de voz en navegador mediante phoonnx.js sin costes de API.
- Pruebas de regresion de pipelines TTS: su naturaleza determinista y su formato ONNX lo hacen util como voz de referencia en tests automatizados de sistemas de sintesis dentro de CI.
- Educacion y aprendizaje de ingles: lectura de frases en en-US para practicas de pronunciacion, aprovechando la fonemizacion IPA de espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (~0,1 GB), cabe holgadamente en GPUs de gama baja y en CPU.
- GPU recomendadas: no se especifican; al ejecutarse sobre ONNX Runtime, es viable en cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) y en CPU.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer moderna e incluso en hardware integrado, dado el reducido tamano de los pesos.
- Opciones de despliegue: phoonnx en Python, plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en navegador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-chitti-espeak | VITS | en-US | ONNX | MIT | Hugging Face (Phoonnx) |
| Otras voces VITS de la coleccion Phoonnx | VITS | variable | ONNX | variable | Hugging Face (coleccion VITS de Phoonnx) |
| Modelos Piper originales | VITS | variable | ONNX | variable | Hugging Face / Piper |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la informacion proporcionada. La comparativa se limita a parametros estructurales y de licencia.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- La fonemizacion depende de espeak-ng o de espyak; con espyak algunas palabras pueden pronunciarse incorrectamente por diferencias en los fonemas.
- No se han publicado datos sobre sesgos, calidad de voz (MOS) ni robustez ante textos fuera de dominio.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede producirse pronuncacion erronea o prosodia deficiente en palabras no vistas.
- Licencia MIT permite uso comercial, pero se recomienda verificar la cadena de atribucion hasta swqg-messiah/kusaal_chitti_piper.
- No apto para tareas de razonamiento, codigo, vision ni agentes; es exclusivamente un modelo TTS.
- La version de phoonnx requerida es preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-chitti-espeak
- Modelo original: https://huggingface.co/swqg-messiah/kusaal_chitti_piper
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
