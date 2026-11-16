# Phoonnx/vits-lv_lv-cv-graphemes

## Resumen

vits-lv_lv-cv-graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo esta especializado en leton (lv-LV) y se distribuye como un artefacto listo para ejecutar dentro del ecosistema phoonnx, que a su vez lo integra en asistentes de voz basados en OVOS.

El modelo resuelve la conversion de texto a audio en leton a partir de una entrada a nivel de caracteres (graphemes), sin necesidad de un fonemizador externo basado en diccionario. Esto simplifica el pipeline de inferencia: el texto se normaliza con la libreria scriptconv y se pasa directamente al modelo, que genera la forma de onda.

Es relevante para desarrolladores que necesitan TTS en leton dentro de asistentes de voz open source, ya que ofrece una licencia permisiva (BSD-3-Clause) y un formato ONNX ligero (0,1 GB de repositorio) que facilita el despliegue en entornos con recursos limitados. No obstante, la informacion publica sobre arquitectura interna, tamano de parametros y datos de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | leton (lv-LV) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial en entrenamiento. VITS genera directamente la forma de onda a partir del texto, sin necesidad de un vocoder separado en la inferencia. La entrada de texto se realiza a nivel de graphemes, segun indica la model card, mediante el `GraphemePhonemizer` de la libreria scriptconv.

El modelo procede del checkpoint `tts_models--lv--cv--vits` publicado en las releases de Coqui TTS v0.8.0, entrenado sobre el corpus Common Voice en leton. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se detallan innovaciones tecnicas adicionales mas alla de las propias de VITS.

## Capacidades

- Sintesis de voz en leton (lv-LV) a partir de texto plano.
- Entrada a nivel de caracteres (graphemes), sin fonemizacion basada en diccionario.
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Normalizacion y conversion de texto delegadas a scriptconv.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo exclusivamente TTS).
- Capacidad multilingue limitada al leton.

## Casos de uso

- Asistentes de voz en leton con OVOS: el modelo se integra como plugin de TTS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en leton en asistentes domoticos o de escritorio.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos generados por sistemas automatizados (correo, monitorizacion, domotica) en leton, con bajo coste computacional gracias al formato ONNX.
- Accesibilidad para personas con discapacidad visual: conversion de contenido textual en leton a audio para lectores de pantalla o aplicaciones de asistencia.
- Prototipado rapido de interfaces de voz: al ser un modelo ligero (0,1 GB) y con licencia BSD-3-Clause, es adecuado para pruebas de concepto y demos sin coste de licencia.
- Generacion de audiolibros o contenido narrado en leton a pequena escala: sintesis por lotes de fragmentos de texto mediante la API de phoonnx.
- Integracion en pipelines de CI/CD para pruebas de regresion de audio: generacion determinista de muestras de referencia para validar cambios en el front-end de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,1 GB, lo que sugiere un modelo ligero apto para CPU.
- GPU recomendadas: no disponible; por tamano, cabe en GPUs consumer (RTX 3060, RTX 4090) e incluso en CPU.
- Cabe en consumer GPU: si, previsiblemente cualquier GPU con unos pocos GB de VRAM; tambien en CPU.
- Opciones de despliegue: phoonnx (Python y OVOS), con pesos en formato ONNX; no se documentan otras opciones como vLLM, llama.cpp o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-lv_lv-cv-graphemes (este) | VITS | lv-LV | no disponible | no aplica | BSD-3-Clause | ONNX |
| Otros VITS de la coleccion Phoonnx | VITS | varios | no disponible | no aplica | segun modelo | ONNX |
| Coqui TTS `tts_models--lv--cv--vits` (upstream) | VITS | lv-LV | no disponible | no aplica | BSD-3-Clause | checkpoint Coqui |
| Modelos TTS multilingues comerciales | no disponible | varios | no disponible | no aplica | propietaria | no disponible |

La comparativa se limita a variantes del mismo checkpoint y a la coleccion de modelos VITS empaquetados por Phoonnx; no se dispone de datos de rendimiento comparativo con otras alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre Common Voice, puede heredar sesgos de representacion de hablantes del corpus (edad, genero, acento).
- Riesgo de alucinacion: en TTS se traduce en pronunciaciones incorrectas o artefactos ante texto fuera de dominio, siglas o numeros no normalizados.
- Limitaciones de contexto o idioma: unicamente leton (lv-LV); no soporta otros idiomas ni cambio de voz documentado.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion y conservacion del aviso de copyright; verificar los terminos del corpus Common Voice subyacente.
- Caveats para produccion: la informacion publica sobre parametros, cuantizacion y rendimiento es escasa; requiere validacion empirica de calidad y latencia antes de desplegar. Depende de phoonnx (version preliminar, `pip install --pre phoonnx`) y de scriptconv para el front-end de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-lv_lv-cv-graphemes
- Checkpoint upstream (Coqui TTS v0.8.0): https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--lv--cv--vits.zip
- phoonnx (repositorio): https://github.com/TigreGotico/phoonnx
- scriptconv (repositorio): https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
