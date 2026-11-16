# Phoonnx/outetts-multi-outeai-0.6b-unicode

## Resumen

outetts-multi-outeai-0.6b-unicode es un empaquetado en formato ONNX del modelo de sintesis de voz OuteTTS-1.0-0.6B, desarrollado originalmente por OuteAI y redistribuido por Phoonnx para su uso con la libreria phoonnx, una biblioteca de text-to-speech en Python integrable en el ecosistema OVOS (Open Voice OS). El modelo resuelve la generacion de audio de voz a partir de texto en 14 idiomas, con un unico checkpoint de 0,6 mil millones de parametros.

La relevancia de este empaquetado reside en su formato: al estar convertido a ONNX (con pesos en model.onnx y model.onnx_data), permite inferencia portable sin depender de frameworks como PyTorch en tiempo de ejecucion, lo que facilita su despliegue en entornos con recursos limitados o en plataformas donde ONNX Runtime es la opcion preferente. El repositorio ocupa 2,6 GB e incluye el tokenizer y los pesos cuantizados en el propio paquete.

El modelo upstream declara licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales, y cubre un conjunto amplio de idiomas (aleman, ingles, espanol, frances, hungaro, italiano, japones, georgiano, coreano, leton, neerlandes, polaco, ruso y chino). La entrada de texto se realiza mediante puntos de codigo Unicode, gestionados por la libreria scriptconv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OuteTTS (modelo de sintesis de voz basado en transformer, segun la coleccion upstream) |
| Parametros totales | 0,6 mil millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo incluye model.onnx y model.onnx_data) |
| Idiomas soportados | de-DE, en-US, es-ES, fr-FR, hu-HU, it-IT, ja-JP, ka-GE, ko-KR, lv-LV, nl-NL, pl-PL, ru-RU, zh-CN (14 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx_data), tokenizer.json |

## Arquitectura y entrenamiento

El modelo upstream es OuteTTS-1.0-0.6B de OuteAI, un sistema de text-to-speech de 0,6 mil millones de parametros. La model card de este empaquetado no detalla la arquitectura interna mas alla de identificarla como "OuteTTS"; no se especifica si emplea un transformer autoregresivo puro, un esquema de tokens de audio o un decodificador vocacional concreto. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica destacable de este paquete es su conversion a ONNX y su integracion con phoonnx y scriptconv. El front-end de texto utiliza `UnicodeCodepointPhonemizer` de scriptconv, que normaliza el texto y lo convierte en puntos de codigo Unicode como entrada del modelo. Esta eleccion simplifica el pipeline (no requiere un fonemizador especifico por idioma) y explica el sufijo "unicode" del nombre. El paquete incluye 14 voces preconfiguradas, una por idioma, bajo el prefijo `outetts/0.6B/<lang>`.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en 14 idiomas: aleman, ingles, espanol, frances, hungaro, italiano, japones, georgiano, coreano, leton, neerlandes, polaco, ruso y chino.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Normalizacion y conversion de texto de entrada mediante scriptconv (pipeline `unicode`).
- Integracion con OVOS a traves del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Seleccion de voz por idioma mediante el registro de voces de phoonnx (`outetts/0.6B/de`, `outetts/0.6B/en`, etc.).
- Inferencia portable en ONNX Runtime, sin dependencia de PyTorch en tiempo de ejecucion.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en dispositivos con recursos limitados mediante ONNX Runtime y phoonnx, sintetizando respuestas en el idioma configurado (por ejemplo, `outetts/0.6B/es` para espanol) sin necesidad de infraestructura GPU dedicada.
- Atencion al cliente automatizada: sintesis de respuestas en 14 idiomas con un unico checkpoint, lo que reduce el coste de mantenimiento frente a desplegar un modelo TTS por idioma.
- Lectura de contenido accesible: conversion de articulos, noticias o documentacion a audio para usuarios con discapacidad visual, aprovechando la licencia Apache-2.0 para uso comercial.
- Integracion en Open Voice OS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz en `mycroft.conf` y sustituir el motor TTS por defecto en asistentes domesticos basados en OVOS.
- Generacion de audiolibros o podcasts multilingues: el pipeline de phoonnx permite iterar sobre fragmentos de texto y generar WAVs por idioma, con la posibilidad de procesar por lotes.
- Prototipado rapido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargar voces con `TTSModelManager`, permite validar experiencias de voz en pocas lineas de codigo antes de invertir en infraestructura mayor.
- Localizacion de contenido: un mismo modelo cubre mercados en aleman, frances, italiano, polaco, ruso, japones, coreano o chino, lo que simplifica la internacionalizacion de productos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 0,6 mil millones de parametros y pesos ONNX, el modelo es ligero; el repositorio completo ocupa 2,6 GB, por lo que la huella en memoria es del orden de unos pocos GB.
- GPU recomendadas: no disponible. Por tamano, el modelo es apto para GPU consumer, pero la model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU consumer: previsiblemente si, dado el tamano de 0,6B y el formato ONNX, aunque no se confirma en la documentacion.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este pipeline TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| outetts-multi-outeai-0.6b-unicode (este) | 0,6B | no disponible | 14 | Apache-2.0 | ONNX |
| OuteAI/OuteTTS-1.0-0.6B (upstream) | 0,6B | no disponible | 14 (segun upstream) | Apache-2.0 | safetensors / PyTorch |
| OuteAI/OuteTTS-1.0-0.6B-ONNX (conversion) | 0,6B | no disponible | 14 | Apache-2.0 | ONNX |
| Otros modelos TTS multilingues de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento comparativo (MOS, WER, latencia) frente a alternativas, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al ser un TTS, los riesgos incluyen sesgos de pronunciacion, acento y prosodia segun el idioma y el hablante de entrenamiento.
- No se documenta el riesgo de alucinacion en el sentido de generacion de texto; en TTS, el riesgo equivalente es la produccion de audio ininteligible o artefactos, no cuantificado en la informacion disponible.
- La longitud de contexto no esta especificada, por lo que se desconoce el limite maximo de texto por sintesis; conviene fragmentar entradas largas.
- El modelo cubre 14 idiomas, pero no se detalla la calidad relativa por idioma; algunos (georgiano, leton) podrian tener menor cobertura de datos que ingles o espanol.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte que las dos versiones de tamano de OuteTTS (0.6B y otra mayor) llevan licencias diferentes; este paquete corresponde a la 0.6B, que es Apache-2.0.
- El empaquetado depende de phoonnx y scriptconv; la version `--pre` de phoonnx sugiere que la API aun no es estable.
- El repositorio tiene 25 descargas y 0 likes en el momento de la consulta, lo que indica adopcion muy limitada y poca validacion comunitaria.
- No se documentan requisitos de hardware ni latencia, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/outetts-multi-outeai-0.6b-unicode
- Modelo upstream: https://huggingface.co/OuteAI/OuteTTS-1.0-0.6B
- Conversion ONNX upstream: https://huggingface.co/OuteAI/OuteTTS-1.0-0.6B-ONNX
- Coleccion OuteTTS para phoonnx: https://huggingface.co/collections/Phoonnx/outetts-6af8ecbd9994d1dfbb97f9fa
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
