# Phoonnx/glowtts-it-mai_female-graphemes

## Resumen

Glow-TTS es un modelo de sintesis de voz (text-to-speech) basado en arquitectura Glow-TTS desarrollado originalmente por Coqui. Esta ficha concreta, `glowtts-it-mai_female-graphemes`, es un empaquetado en formato ONNX del modelo original `tts_models--it--mai_female--glow-tts` de Coqui, distribuido por Phoonnx para su uso con la libreria de inferencia TTS ONNX del mismo nombre. El modelo sintetiza voz femenina en italiano a partir de texto de entrada codificado como caracteres (graphemes).

La relevancia de este modelo radica en su formato de despliegue: al estar empaquetado en ONNX, permite inferencia TTS ligera y portable sin depender del framework original de Coqui TTS, lo que facilita su integracion en entornos de produccion con recursos limitados, asistentes de voz embebidos y sistemas como OVOS (Open Voice OS). El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto orientado a inferencia eficiente en CPU.

Se trata de un modelo especializado y de nicho: un unico idioma (italiano), una unica voz (femenina), entrada basada en graphemes y una licencia Apache 2.0 heredada del modelo original de Coqui. No es un modelo de lenguaje general, sino un componente TTS dentro del ecosistema phoonnx/scriptconv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (normalizing flow, text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por caracteres) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | caracteres (graphemes) via `GraphemePhonemizer` de scriptconv |
| Voz | femenina (`mai_female`) |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Glow-TTS es un modelo generativo de sintesis de voz basado en normalizing flows, introducido por Kim et al. (2020). A diferencia de los modelos autorregresivos tipo Tacotron, Glow-TTS modela la alineacion entre texto y audio mediante busqueda de caminos monoticos (monotonic alignment search) dentro del propio flujo, lo que permite sintesis paralela y no autorregresiva, con mayor velocidad de inferencia. La arquitectura combina un encoder de texto, un decoder basado en bloques de flujo invertibles y un modulo de duracion.

El modelo original fue entrenado por Coqui y publicado en su release v0.6.1 de modelos TTS. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. Esta version concreta no ha sido reentrenada: es un empaquetado del checkpoint original de Coqui en formato ONNX para la libreria phoonnx. La innovacion tecnica destacable es el propio empaquetado ONNX y la integracion con el front-end de texto de scriptconv, que normaliza el texto y lo convierte a la representacion de entrada del modelo mediante un fonemizador basado en graphemes.

## Capacidades

- Sintesis de voz (text-to-speech) en italiano a partir de texto escrito.
- Generacion de audio en formato WAV mediante `synthesize_wav`.
- Voz femenina unica (`mai_female`).
- Entrada basada en graphemes: el texto se procesa como caracteres, sin conversion fonetica compleja, mediante `GraphemePhonemizer` de scriptconv.
- Inferencia no autorregresiva (paralela) propia de Glow-TTS, adecuada para baja latencia.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es un modelo multilingue: solo italiano.

## Casos de uso

- Asistentes de voz embebidos en italiano: el modelo puede integrarse en OVOS mediante el plugin `ovos-tts-plugin-phoonnx` configurando la voz `coqui-it-mai_female-glow-tts` en `mycroft.conf`, proporcionando respuestas habladas en italiano con un modelo ONNX ligero de 0,1 GB.
- Lectura de texto a voz en aplicaciones de accesibilidad: conversion de articulos, notificaciones o contenido web en italiano a audio WAV para usuarios con discapacidad visual, aprovechando la inferencia no autorregresiva para generar audio con baja latencia.
- Generacion de audio para contenidos multimedia: sintesis de narraciones o locuciones en italiano para videos, podcasts o audiolibros, dado que el modelo produce voz femenina consistente y el formato WAV es directamente utilizable en pipelines de edicion.
- Sistemas de respuesta interactiva de voz (IVR) en italiano: sintesis de mensajes dinamicos en call centers o lineas de atencion, donde el tamano compacto del modelo permite despliegue en servidores modestos o incluso en CPU.
- Prototipado rapido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargarse via `TTSModelManager`, permite a desarrolladores validar flujos TTS en italiano sin infraestructura pesada.
- Despliegue en dispositivos con recursos limitados: el formato ONNX y el tamano de 0,1 GB permiten ejecutar el modelo en entornos edge o Raspberry Pi para aplicaciones de domotica con voz en italiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del repositorio (0,1 GB) se trata de un modelo compacto apto para CPU.
- GPU recomendadas: no disponible; el modelo esta empaquetado en ONNX y esta pensado para inferencia ligera, sin requisitos de GPU documentados.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; el tamano reducido sugiere que cabria en cualquier GPU de consumo, pero no se documenta.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ejecucion ONNX Runtime subyacente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Voz | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| glowtts-it-mai_female-graphemes (este modelo) | Glow-TTS | Italiano | Femenina | ONNX | Apache 2.0 | Hugging Face (Phoonnx) |
| Coqui `tts_models--it--mai_female--glow-tts` (original) | Glow-TTS | Italiano | Femenina | Checkpoint Coqui TTS | Apache 2.0 | Release de Coqui TTS v0.6.1 |
| Otros modelos Glow-TTS empaquetados por Phoonnx | Glow-TTS | Variable (segun modelo) | Variable | ONNX | Apache 2.0 | Coleccion Glow-TTS de Phoonnx en Hugging Face |

La comparativa detallada con modelos de otros idiomas o arquitecturas (VITS, FastSpeech2) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de un solo idioma (italiano) y una sola voz (femenina); no admite seleccion de voz ni cambio de idioma.
- Entrada basada en graphemes: la calidad de sintesis puede degradarse ante texto con abreviaturas, numeros o caracteres especiales que el front-end de scriptconv no normalice correctamente.
- Riesgo de pronunciacion incorrecta en palabras extranjeras, nombres propios o terminos tecnicos no presentes en el entrenamiento original.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento original de Coqui; al ser un modelo de voz sintetica, puede reproducir caracteristicas acusticas del corpus de entrenamiento.
- No es un modelo de lenguaje: no razona, no genera texto ni soporta herramientas; su unico proposito es TTS.
- Licencia Apache 2.0 heredada del modelo original de Coqui, lo que permite uso comercial, pero se recomienda verificar los terminos del dataset original de Coqui para usos sensibles.
- El rendimiento real en produccion (latencia, naturalidad) no esta documentado en la informacion disponible; se recomienda evaluacion propia antes de desplegar.
- Repositorio con muy pocas descargas (21) y sin likes, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/glowtts-it-mai_female-graphemes
- Modelo original de Coqui: https://github.com/coqui-ai/TTS/releases/download/v0.6.1_models/tts_models--it--mai_female--glow-tts.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Paper de Glow-TTS (referencia de arquitectura): no disponible en la informacion proporcionada
