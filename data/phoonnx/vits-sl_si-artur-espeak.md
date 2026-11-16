# Phoonnx/vits-sl_si-artur-espeak

## Resumen

vits-sl_si-artur-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por ppisljar y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo esta especializado en esloveno de Eslovenia (`sl-SI`) y toma como entrada fonemas generados por espeak-ng en alfabeto IPA, lo que lo hace dependiente de ese motor de fonemizacion para funcionar correctamente.

Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) orientado a la sintesis de voz ligera y desplegable en entornos con recursos limitados. Su relevancia radica en que forma parte del ecosistema phoonnx/OVOS, una pila open source de asistentes de voz, y en que el modelo original de Piper se ha reempaquetado en formato ONNX para su uso directo en Python y en el navegador mediante phoonnx.js.

No se dispone de informacion sobre el numero de parametros, el volumen de datos de entrenamiento ni los detalles del proceso de entrenamiento mas alla de lo indicado en la model card. La licencia declarada es CC-BY-4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | esloveno (`sl`, `sl-SI`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior normalizing flow, un decodificador basado en HiFi-GAN y un discriminador adversarial entrenado conjuntamente. VITS produce audio de forma directa a partir de la secuencia de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo deriva de `ppisljar/piper_si_artur`, un modelo de la comunidad Piper para esloveno. Phoonnx lo ha reempaquetado en ONNX para su libreria homonima. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino adicional. La entrada de texto se procesa mediante `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que convierte el texto normalizado a fonemas espeak-ng en IPA antes de alimentar el modelo.

## Capacidades

- Sintesis de voz (text-to-speech) en esloveno de Eslovenia (`sl-SI`).
- Conversion de texto a audio WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemizacion de entrada basada en espeak-ng (alfabeto IPA).
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (voces VITS con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo TTS, no un LLM).
- No dispone de capacidades de vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en esloveno: el modelo se integra en OVOS mediante `ovos-tts-plugin-phoonnx`, permitiendo dotar de voz a un asistente domestico open source en esloveno con una configuracion minima en `mycroft.conf`.
- Lectura de contenido en aplicaciones de accesibilidad: sintesis de texto a voz para lectores de pantalla o aplicaciones de accesibilidad que necesiten una voz eslovena ligera y desplegable localmente.
- Generacion de avisos y notificaciones habladas: integracion en sistemas de megafonia, domotica o alertas que requieran convertir mensajes de texto en audio en esloveno sin depender de servicios en la nube.
- Narracion de contenido educativo: conversion de material didactico o articulos a audio para plataformas de aprendizaje en esloveno, aprovechando el reducido tamano del modelo (0,1 GB) para despliegue en servidores modestos.
- Prototipado de interfaces de voz: uso en fases de desarrollo de aplicaciones conversacionales en esloveno gracias a la instalacion sencilla via `pip install --pre phoonnx` y a la API de Python.
- Síntesis de voz en el navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para demos o aplicaciones web que necesiten TTS en esloveno sin backend.
- Pruebas de pipelines TTS multilingues: uso como voz eslovena dentro de un sistema que combine varias voces VITS del ecosistema phoonnx para distintos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; dado el tamano del repositorio (0,1 GB), el modelo es muy ligero y cabe holgadamente en GPU consumer.
- GPU recomendadas: no se especifican; por su tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer por el reducido tamano de los pesos ONNX.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS VITS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-sl_si-artur-espeak (este modelo) | VITS | esloveno (`sl-SI`) | 0,1 GB (repo) | CC-BY-4.0 | ONNX |
| ppisljar/piper_si_artur | VITS (Piper) | esloveno | no disponible | CC-BY-4.0 (declarada en upstream) | no disponible |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios idiomas | variable | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de espeak-ng: sin espeak-ng instalado, el modelo no puede fonemizar correctamente; la alternativa `espyak` puede producir fonemas distintos y hacer que el modelo pronuncie mal algunas palabras.
- Idioma unico: solo soporta esloveno (`sl-SI`); no es multilingue.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de una unica voz (artur) y un unico idioma, la variabilidad de voces y acentos es limitada.
- Riesgo de alucinacion: no aplica en el sentido de los LLM, pero puede producir pronunciaciones incorrectas ante texto no normalizado o fonemas no vistos en entrenamiento.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion; es necesario conservar la atribucion al autor original (ppisljar) y respetar los terminos de la licencia.
- Caveat de produccion: el modelo esta empaquetado para phoonnx en version preliminar (`pip install --pre phoonnx`), lo que implica que la API puede cambiar.
- No se dispone de informacion sobre la calidad objetiva del audio (MOS) ni sobre el rendimiento en dominios especificos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sl_si-artur-espeak
- Modelo upstream: https://huggingface.co/ppisljar/piper_si_artur
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
