# Phoonnx/vits-en_us-ljs-wasmdashai

## Resumen

vits-en_us-ljs-wasmdashai es un modelo de sintesis de voz (text-to-speech) en ingles estadounidense desarrollado originalmente por wasmdashai y empaquetado por Phoonnx para su libreria de inferencia ONNX. Se trata de una implementacion de la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que produce audio directamente a partir de texto sin necesidad de un vocoder separado. El paquete esta pensado para su uso dentro del ecosistema phoonnx, que a su vez alimenta el plugin `ovos-tts-plugin-phoonnx` del asistente de voz OVOS.

El modelo es de tipo end-to-end y esta especializado en una unica voz y un unico idioma (en-US), con entrada de texto a nivel de caracteres. Su relevancia actual reside en que ofrece una via ligera y de licencia permisiva (MIT) para incorporar sintesis de voz local en aplicaciones Python y en asistentes de voz basados en OpenVoiceOS, sin depender de servicios en la nube. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto, si bien no se publican el numero exacto de parametros ni la longitud de contexto en la informacion disponible.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face; los datos tecnicos no documentados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS generativo condicional) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada a nivel de caracteres) |
| Tipos de cuantizacion | no disponible (pesos en formato ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado de forma conjunta. VITS elimina la necesidad de un vocoder externo al generar la forma de onda directamente, y emplea un mecanismo de alineamiento monotonico latente que aprende la correspondencia entre texto y audio sin supervision explicita de duraciones. La model card no detalla la variante concreta (por ejemplo, la inclusion de normalizing flows o de decodificacion estocastica), por lo que este extremo queda como no disponible.

Respecto a los datos de entrenamiento, la model card no indica el numero de tokens, la composicion del dataset ni la existencia de fases de RLHF o DPO. El nombre del modelo y el enlace upstream (`wasmdashai/vits-eng-us-ljs`) sugieren que el corpus de entrenamiento podria estar basado en LJSpeech, pero esto no se confirma explicitamente en la documentacion. El front end de texto se delega en la libreria `scriptconv`, que normaliza el texto y lo convierte a la representacion de entrada mediante un `GraphemePhonemizer` (fonemizador basado en grafemas) en lugar de un fonemizador fonetico completo.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US) con una unica voz.
- Generacion de audio directamente en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada de texto a nivel de caracteres, normalizada por `scriptconv` antes de la inferencia.
- Integracion con el asistente de voz OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local mediante ONNX, sin dependencia de servicios en la nube.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingue, tool calling ni agentes.

## Casos de uso

- Asistente de voz local en OVOS: el modelo se selecciona como voz en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en ingles sin conexion a internet y con licencia MIT.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo compacto (0,1 GB) y ejecutarse sobre ONNX, puede integrarse en un proceso Python ligero que convierta mensajes de sistema en audio bajo demanda.
- Generacion de audiolibros o podcasts de bajo coste: la API `synthesize_wav` permite sintetizar frases largas en lote y escribir directamente en ficheros WAV, adecuado para pipelines de produccion de contenido en ingles.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten una voz en-US rapida de integrar pueden usar phoonnx como capa de abstraccion y sustituir el modelo por otra voz del catalogo VITS sin cambiar el codigo de la aplicacion.
- Accesibilidad en aplicaciones web o de escritorio: conversion de texto a voz para usuarios con discapacidad visual, ejecutandose en local y evitando el envio de contenido a terceros.
- Pruebas automatizadas de sistemas de voz: al ser un modelo pequeno y determinista en su interfaz, sirve para validar pipelines de TTS, normalizacion de texto y formatos de audio en entornos de integracion continua.
- Sistemas embebidos o de bajo consumo: la naturaleza ONNX del paquete facilita el despliegue en dispositivos con recursos limitados, siempre que se valide el rendimiento real en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,1 GB) sugiere un modelo compacto, pero no se especifica el consumo real de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del paquete es plausible que quepa en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python, via ONNX Runtime) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto / entrada |
|---|---|---|---|---|---|
| vits-en_us-ljs-wasmdashai | VITS | en-US | MIT | ONNX | caracteres |
| wasmdashai/vits-eng-us-ljs (upstream) | VITS | en-US | no disponible en esta ficha | no disponible | caracteres |
| Otros modelos VITS del catalogo Phoonnx | VITS | variable | variable | ONNX | caracteres |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con alternativas. La comparativa se limita a la relacion con el modelo upstream y con el resto del catalogo VITS empaquetado por Phoonnx.

## Limitaciones y advertencias

- Modelo mono-idioma (en-US) y mono-voz: no admite otros idiomas ni cambio de hablante.
- Entrada basada en grafemas: al usar `GraphemePhonemizer` en lugar de un fonemizador fonetico, la pronunciacion de palabras irregulares o nombres propios puede ser imprecisa.
- Riesgo de artefactos y alucinaciones acusticas en textos largos o con caracteres no soportados; no se documentan mecanismos de mitigacion.
- No se publican datos sobre sesgos de voz (genero, acento, edad) ni sobre la composicion del corpus de entrenamiento.
- La licencia MIT del empaquetado es permisiva para uso comercial, pero la model card remite a los terminos del release upstream; conviene verificar la licencia del modelo original antes de un despliegue comercial.
- No hay informacion sobre latencia, consumo de memoria ni rendimiento en produccion, por lo que es necesario validar el modelo en el hardware objetivo.
- El ecosistema de inferencia esta limitado a phoonnx y OVOS; no se documentan otros runtimes.
- El numero de descargas (29) y de likes (0) es bajo, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ljs-wasmdashai
- Modelo upstream: https://huggingface.co/wasmdashai/vits-eng-us-ljs
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
