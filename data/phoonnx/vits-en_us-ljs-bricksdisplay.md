# Phoonnx/vits-en_us-ljs-bricksdisplay

## Resumen

`Phoonnx/vits-en_us-ljs-bricksdisplay` es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la libreria `phoonnx`. No es un modelo entrenado desde cero por Phoonnx: se trata de una conversion y reempaquetado del modelo original `kakao-enterprise/vits-ljs`, desarrollado por Kakao Enterprise, a partir de la conversion ONNX publicada por el usuario BricksDisplay. El autor del repositorio actua, por tanto, como integrador dentro del ecosistema phoonnx.

El modelo resuelve el problema de la sintesis de voz de un solo hablante en ingles a partir de texto, con una entrada basada en caracteres (graphemes) y sin necesidad de fonemizacion externa compleja. Su relevancia actual radica en su formato ONNX, que permite inferencia portable en CPU y GPU sin depender de frameworks de deep learning completos, y en su integracion directa con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.

El repositorio es de tamano reducido (0,1 GB) y esta pensado para despliegues ligeros de TTS. La informacion publicada no incluye detalles sobre el numero de parametros, la longitud de contexto ni los datos de entrenamiento originales, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada basada en caracteres, sin contexto conversacional) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; la model card no detalla variantes) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial entrenado con aprendizaje adversarial. Permite generar audio de forma directa desde la secuencia de entrada sin un vocoder separado, lo que simplifica el pipeline de inferencia. En este repositorio el modelo se distribuye ya convertido a ONNX, lo que facilita su ejecucion con el runtime de ONNX en distintos entornos.

El modelo original `kakao-enterprise/vits-ljs` fue desarrollado por Kakao Enterprise; la informacion proporcionada no incluye el numero de tokens, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. La conversion a ONNX corresponde a BricksDisplay y el empaquetado para phoonnx a Phoonnx. La model card indica que la entrada de texto son caracteres y que el front-end de texto lo gestiona `scriptconv`, concretamente con `GraphemePhonemizer` de `scriptconv.phonemizers.base`, que normaliza el texto y lo convierte en la entrada del modelo.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto plano.
- Entrada basada en caracteres (graphemes), con normalizacion de texto delegada a `scriptconv`.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Inferencia portable mediante ONNX.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Modelo de un solo hablante (la model card no describe seleccion de voces multiples mas alla del identificador de voz `hf_community/kakao-enterprise/vits-ljs-eng`).

## Casos de uso

- Asistencia por voz en OVOS: el modelo se integra como modulo TTS en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx`, permitiendo que un asistente domotico o de escritorio sintetice respuestas habladas en ingles sin servicios en la nube.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos generados por sistemas de monitorizacion o aplicaciones de escritorio, aprovechando el bajo peso del repositorio (0,1 GB) y la inferencia ONNX.
- Prototipado rapido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargarse via `TTSModelManager`, permite incorporar TTS en un prototipo Python en pocas lineas.
- Generacion de audiolibros o contenido narrado en ingles: sintesis por lotes de parrafos de texto con salida WAV, adecuada para pipelines offline.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o aplicaciones de asistencia en ingles estadounidense.
- Pruebas de integracion en CI: al ser un modelo ONNX ligero y con licencia MIT, puede incluirse en tests automatizados de pipelines de audio sin coste de licencia ni dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el tamano del repositorio (0,1 GB) sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible; al ejecutarse via ONNX Runtime puede usar CPU o GPU compatibles con dicho runtime.
- Compatibilidad con GPU de consumo: no confirmada explicitamente, pero el reducido tamano del repositorio hace plausible su ejecucion en hardware de consumo.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Phoonnx/vits-en_us-ljs-bricksdisplay | VITS | en-US | ONNX | MIT | Empaquetado para phoonnx; derivado de kakao-enterprise/vits-ljs |
| kakao-enterprise/vits-ljs | VITS | en-US | no disponible en la informacion | MIT (segun la model card del derivado) | Modelo upstream original |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | ONNX | variable | Misma familia de empaquetado; datos concretos no disponibles |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo unicamente en ingles estadounidense; no soporta otros idiomas.
- Es un modelo de un solo hablante; no permite seleccion de voces mas alla de la voz empaquetada.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre un corpus de voz concreto puede reproducir caracteristicas del hablante y del dominio de entrenamiento.
- Riesgo de alucinacion no aplicable en el sentido de generacion de texto; en TTS el riesgo equivalente es la pronunciacion incorrecta de palabras fuera del vocabulario o de nombres propios.
- La licencia MIT del upstream se declara en la model card del derivado; conviene verificar la licencia original en `kakao-enterprise/vits-ljs` antes de un uso comercial.
- El repositorio esta marcado como creado en 2026-11-14 segun los metadatos, fecha posterior a la actual; tratar los metadatos con cautela.
- Depende de la libreria `phoonnx` en version preliminar (`--pre`) y de `scriptconv` para el front-end de texto; posibles cambios de API.
- No hay informacion sobre calidad de audio, MOS ni latencia, por lo que no puede evaluarse su idoneidad en produccion sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljs-bricksdisplay
- Modelo upstream: https://huggingface.co/kakao-enterprise/vits-ljs
- Conversion ONNX: https://huggingface.co/BricksDisplay/vits-eng/tree/main/onnx
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
