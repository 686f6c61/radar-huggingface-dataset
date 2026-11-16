# Phoonnx/vits-en_us-arctic-medium-espeak

## Resumen

`vits-en_us-arctic-medium-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con la libreria `phoonnx`. El modelo original procede de Rhasspy, concretamente de la voz `en_US/arctic/medium` del repositorio `rhasspy/piper-voices`, que es la base de voces del ecosistema Piper. Phoonnx se limita a repaquetar y distribuir esos pesos en un contenedor ONNX compatible con su propia libreria de inferencia.

El modelo resuelve la sintesis de voz en ingles estadounidense (`en-US`) a partir de texto de entrada que se convierte a fonemas mediante espeak-ng (alfabeto IPA). La arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es un modelo generativo end-to-end que combina un codificador de texto, un prior normalizing flow, un decodificador y un discriminador adversarial, lo que permite generar audio de forma directa sin necesidad de un vocoder separado.

Es relevante para desarrolladores que necesitan TTS ligero y desplegable en local, especialmente dentro del ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin `ovos-tts-plugin-phoonnx`. El tamano del repositorio es de aproximadamente 0,1 GB, lo que lo hace adecuado para entornos con recursos limitados. La informacion disponible sobre el modelo es escasa: no se publican detalles sobre el numero de parametros, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS generativo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX (libreria phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un enfoque end-to-end para sintesis de voz que integra en un unico modelo el codificador de texto, el prior sobre las variables latentes, el decodificador de audio y el discriminador adversarial usado durante el entrenamiento. VITS combina aprendizaje adversarial con inferencia variacional y normalizing flows, lo que permite generar formas de onda directamente a partir de texto sin un vocoder externo. La variante "medium" del repositorio Piper indica un compromiso entre calidad y velocidad, aunque no se dispone de detalles concretos sobre el numero de capas ni dimensiones internas.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo original fue entrenado por Rhasspy como parte del proyecto Piper, y Phoonnx lo ha empaquetado para su libreria. La entrada de texto se procesa mediante espeak-ng para generar fonemas en alfabeto IPA, que constituyen la entrada real del modelo. Este front-end fonetico es una innovacion practica relevante: permite control preciso de la pronunciacion y desacopla la normalizacion de texto del modelo acustico.

## Capacidades

- Sintesis de voz en ingles estadounidense (`en-US`) a partir de texto.
- Generacion de audio en formato WAV mediante la API `synthesize_wav`.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite control de pronunciacion.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en Python a traves de la libreria `phoonnx` y en navegador mediante `phoonnx.js`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra directamente mediante el plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf` con la voz `piper/en_US-arctic-medium`, lo que permite dotar de voz a un asistente domestico sin depender de servicios en la nube.
- Lectura de notificaciones y alertas: al ser un modelo ligero (repo de 0,1 GB) y ejecutable en CPU, puede sintetizar mensajes cortos en sistemas embebidos o Raspberry Pi para notificaciones de domotica.
- Accesibilidad para personas con discapacidad visual: conversion de texto a voz en aplicaciones de escritorio o moviles que necesiten un motor TTS local, sin latencia de red y con licencia MIT para uso comercial.
- Generacion de audiolibros o narraciones: sintesis por lotes de documentos largos en ingles, aprovechando la ejecucion offline y la ausencia de costes por API.
- Pruebas de integracion en pipelines de CI/CD: verificacion automatizada de la salida de audio en tests de aplicaciones de voz, usando la API de `phoonnx` para generar WAVs de referencia.
- Prototipado rapido de interfaces conversacionales: desarrollo de demos de voz en navegador mediante `phoonnx.js`, con la demo en vivo disponible en `tigregotico.pt/demo`.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones en ingles estadounidense controladas por fonemas IPA, util para materiales de practica de pronunciacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de aproximadamente 0,1 GB, es probable que quepa en memoria de CPU sin GPU dedicada, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible; el modelo esta disenado para ejecucion en CPU mediante ONNX.
- Opciones de despliegue: libreria `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y `phoonnx.js` para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-en_us-arctic-medium-espeak (este modelo) | VITS | no disponible | no aplica | en-US | MIT | ONNX |
| Otras voces Piper `en_US` (p. ej. lessac, ryan) | VITS | no disponible | no aplica | en-US | MIT (segun repo Piper) | ONNX |
| Coqui TTS (modelos VITS) | VITS | no disponible | no aplica | multiidioma | MPL 2.0 / otras | PyTorch / ONNX |
| Piper voces de otros idiomas | VITS | no disponible | no aplica | varios | MIT | ONNX |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales conocidas.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (`en-US`); no es multilingue.
- La entrada debe pasar por espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede producir pronunciaciones incorrectas o artefactos acusticos en palabras fuera del dominio de entrenamiento.
- No se dispone de informacion sobre sesgos de voz (genero, acento, edad) ni sobre la demografia del dataset de entrenamiento.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la licencia del modelo upstream en `rhasspy/piper-voices`, ya que el autor indica que la licencia MIT se declara en la model card de ese repositorio.
- El modelo tiene pocas descargas (20) y cero likes en Hugging Face, lo que sugiere poca validacion por parte de la comunidad; conviene evaluar la calidad de audio antes de usarlo en produccion.
- No se dispone de informacion sobre latencia, throughput ni calidad objetiva (MOS), lo que dificulta su comparacion con alternativas en un entorno de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-arctic-medium-espeak
- Repositorio upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/arctic/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
