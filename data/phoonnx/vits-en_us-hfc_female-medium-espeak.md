# Phoonnx/vits-en_us-hfc_female-medium-espeak

## Resumen

vits-en_us-hfc_female-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de Rhasspy, concretamente de la voz `en_US/hfc_female/medium` del repositorio piper-voices, y se distribuye aqui en formato ONNX con la entrada de texto basada en fonemas espeak en alfabeto IPA.

El modelo resuelve la conversion de texto a audio en ingles estadounidense con una voz femenina de calidad media, pensado para integracion ligera en aplicaciones Python y en el asistente de voz OVOS. Su relevancia radica en que permite ejecutar sintesis de voz local sin dependencias de servicios en la nube, con un paquete de apenas 0,1 GB y licencia MIT.

El repo no incluye informacion sobre el numero de parametros, el contexto (no aplica en TTS) ni los datos de entrenamiento originales. La model card se limita a describir el empaquetado, el front-end de texto y las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un encoder de texto, un prior y posterior variational, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. En este caso, la entrada no es texto crudo sino fonemas espeak en alfabeto IPA, lo que requiere un front-end de fonemizacion previo.

El modelo original fue entrenado por Rhasspy como parte del proyecto piper-voices, en la variante `en_US/hfc_female/medium`. No se dispone en la informacion proporcionada de datos sobre el numero de horas de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning adicional. El empaquetado de Phoonnx se limita a exportar los pesos a ONNX y a integrar el front-end de texto mediante la libreria scriptconv, que normaliza el texto y lo convierte a fonemas con `EspeakPhonemizer`.

## Capacidades

- Sintesis de voz en ingles estadounidense a partir de texto, con salida en WAV.
- Voz femenina de calidad media (variante `medium` del catalogo de Piper).
- Entrada basada en fonemas espeak (IPA), lo que permite control fino de la pronunciacion si se generan fonemas manualmente.
- Integracion con la libreria phoonnx en Python mediante `TTSModelManager`.
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales: el modelo se integra en OVOS seleccionando la voz `piper/en_US-hfc_female-medium` en `mycroft.conf`, permitiendo respuestas habladas sin conexion a internet.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en aplicaciones de escritorio o sistemas embebidos, con un paquete de 0,1 GB que cabe en dispositivos con recursos limitados.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, con pronunciacion controlable mediante fonemas IPA.
- Demos y prototipos web: uso de phoonnx.js para sintetizar voz directamente en el navegador sin backend, util para pruebas de concepto de interfaces conversacionales.
- Generacion de audio para contenido: produccion de locuciones en ingles para videos, podcasts o audiolibros de prototipo, siempre que la calidad media sea suficiente.
- Pruebas de pipelines TTS: validacion de integraciones de phonemizacion y sintesis en entornos de CI, al ser un modelo pequeno y de licencia permisiva.
- Automatizacion de respuestas en ingles: sistemas de atencion al cliente basados en reglas que necesiten una voz local y de baja latencia para frases predefinidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de un modelo ONNX de 0,1 GB, la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime puede acelerar la inferencia, pero no hay datos de rendimiento publicados.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna, aunque no se dispone de cifras verificadas.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-hfc_female-medium-espeak | VITS | en-US | ONNX | MIT | Hugging Face (Phoonnx) |
| rhasspy/piper-voices en_US/hfc_female/medium | VITS | en-US | Piper (ONNX) | MIT | Hugging Face (Rhasspy) |
| Otras voces VITS de la coleccion Phoonnx | VITS | variable | ONNX | variable | Hugging Face (Phoonnx) |

La comparativa se limita a las variantes del mismo modelo original y a otras voces del mismo empaquetador, ya que no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense; no es multilingue.
- La calidad es "medium", inferior a voces de mayor tamano o modelos neuronales mas recientes.
- Requiere espeak-ng instalado en el sistema; sin el, la fonemizacion puede fallar o usar espyak, cuyos fonemas difieren y pueden producir pronunciaciones incorrectas.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento original.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede haber errores de pronunciacion en palabras fuera del vocabulario o nombres propios.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia upstream de rhasspy/piper-voices, que la model card declara tambien como MIT.
- No hay datos publicados de latencia, throughput ni calidad perceptual (MOS), lo que dificulta evaluar su idoneidad en produccion sin pruebas propias.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hfc_female-medium-espeak
- Upstream (Rhasspy piper-voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/hfc_female/medium
- phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
- scriptconv (GitHub): https://github.com/TigreGotico/scriptconv
- phoonnx.js (GitHub): https://github.com/TigreGotico/phoonnx.js
- Demo phoonnx.js: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
