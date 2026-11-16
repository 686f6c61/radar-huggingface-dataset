# Phoonnx/vits-en_us-inflect-nano_v2-espeak

## Resumen

vits-en_us-inflect-nano_v2-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de owensong/inflect-nano-v2-onnx y esta adaptado para consumir fonemas espeak en alfabeto IPA como entrada de texto, lo que permite integrarlo en el ecosistema phoonnx y en el asistente OVOS. Se distribuye en formato ONNX y esta pensado para inferencia ligera.

El modelo resuelve la conversion de texto a voz en ingles estadounidense (en-us) a partir de una representacion fonetica intermedia generada por espeak-ng, lo que desacopla la normalizacion del texto de la sintesis acustica. Es relevante para desarrolladores que necesitan un motor TTS pequeno, ejecutable localmente y con licencia permisiva (Apache 2.0), integrable en asistentes de voz y aplicaciones de borde.

La informacion publicada no detalla el numero de parametros, la longitud de contexto ni los datos de entrenamiento; la model card se centra en el uso practico a traves de phoonnx. El tamano del repositorio es de 0.0 GB segun los metadatos de Hugging Face, lo que sugiere un peso muy reducido, coherente con la denominacion "nano" del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | ingles estadounidense (en-us) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Tamano del repositorio | 0.0 GB (metadatos de Hugging Face) |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo y discriminadores adversarios para producir audio de forma directa desde la representacion de entrada. En este caso, la entrada no es texto crudo sino fonemas espeak en IPA, lo que implica que el pipeline incluye un paso previo de fonemizacion externo al modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO; estos datos no aparecen en la model card. El modelo se distribuye como artefacto ONNX empaquetado para phoonnx, que delega la normalizacion y conversion de texto a la libreria scriptconv mediante el fonemizador `EspeakPhonemizer` del modulo `scriptconv_copyleft.phonemizers.mul`.

## Capacidades

- Sintesis de voz en ingles estadounidense a partir de fonemas espeak en alfabeto IPA.
- Generacion de audio WAV mediante la API `voice.synthesize_wav` de phoonnx.
- Integracion con el asistente OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python y en navegador mediante phoonnx.js (este ultimo con entrada espeak o unicode).
- Normalizacion de texto y conversion a fonemas delegada a scriptconv.
- No se documentan capacidades de clonacion de voz, control de emocion, multilinguismo ni tool calling (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona como modulo TTS en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx`, lo que permite respuestas habladas en ingles sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ONNX ligero, puede sintetizar mensajes cortos en tiempo real con bajo consumo de recursos.
- Sintesis en el navegador: mediante phoonnx.js se puede reproducir voz en ingles en aplicaciones web sin backend, usando la entrada espeak o unicode.
- Prototipado rapido de interfaces conversacionales: la API de phoonnx permite generar archivos WAV de prueba para validar flujos de voz antes de adoptar un motor TTS mayor.
- Sistemas embebidos y de borde: el formato ONNX y el tamano reducido del repositorio facilitan el despliegue en dispositivos con recursos limitados.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en ingles estadounidense.
- Pruebas de integracion en pipelines de CI: la instalacion via `pip install --pre phoonnx` y la generacion de WAV permiten automatizar pruebas de audio en entornos de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (0.0 GB en metadatos) sugiere un modelo muy pequeno, apto para CPU.
- GPU recomendadas: no se especifican; por el formato ONNX y el tamano, es probable que funcione en CPU y en GPUs de consumo, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en navegador.
- Latencia y throughput: no disponibles.
- Dependencia externa: es necesario instalar espeak-ng (`apt install espeak-ng`) o el extra `phoonnx[espeak]`; algunos fonemas de espyak difieren de espeak-ng y pueden producir pronunciaciones incorrectas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| vits-en_us-inflect-nano_v2-espeak | VITS | en-us | ONNX | Apache 2.0 | Entrada por fonemas espeak IPA; empaquetado para phoonnx |
| owensong/inflect-nano-v2-onnx (upstream) | VITS | en-us | ONNX | Apache 2.0 | Modelo original del que deriva este empaquetado |
| Otros modelos VITS de la coleccion Phoonnx | VITS | variable | ONNX | variable | Coleccion de voces VITS empaquetadas para phoonnx |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-us); no hay soporte multilingue documentado.
- La calidad de pronunciacion depende de espeak-ng; con espyak pueden aparecer errores en algunas palabras.
- No se documentan sesgos especificos, pero al ser un modelo TTS entrenado con datos no descritos, pueden existir sesgos de pronunciacion o prosodia no evaluados.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero la sintesis puede producir audio incorrecto si la fonemizacion falla.
- Requiere instalar espeak-ng como dependencia externa para el funcionamiento correcto.
- No se especifican restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0; conviene verificar la licencia del modelo upstream.
- No hay datos publicados sobre latencia, throughput ni calidad objetiva (MOS), lo que limita la evaluacion para produccion.
- El modelo esta empaquetado para phoonnx; su uso fuera de esa libreria requerira adaptar la entrada de fonemas y el runtime ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-inflect-nano_v2-espeak
- Modelo upstream: https://huggingface.co/owensong/inflect-nano-v2-onnx
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
