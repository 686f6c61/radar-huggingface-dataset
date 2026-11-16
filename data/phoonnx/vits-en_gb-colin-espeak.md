# Phoonnx/vits-en_gb-colin-espeak

## Resumen

vits-en_gb-colin-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario nardocolin dentro del ecosistema Piper TTS y empaquetado por Phoonnx para su uso con su libreria ONNX de TTS. El modelo genera audio a partir de texto en ingles britanico (en-GB) y toma como entrada fonemas en alfabeto IPA producidos por espeak-ng, lo que lo hace dependiente de un front-end fonemizador externo.

Se trata de un modelo compacto (el repositorio ocupa aproximadamente 0,1 GB) orientado a sintesis de voz ligera y ejecutable localmente, con pesos en formato ONNX. Su relevancia practica esta en que permite integrar una voz en-GB en asistentes de voz, sistemas de lectura o entornos embebidos sin depender de servicios en la nube, y en que encaja en el stack de OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`.

La licencia es CC-BY-4.0, lo que permite uso comercial con atribucion. El modelo no incluye capacidades de razonamiento, generacion de texto ni vision: es exclusivamente un sintetizador de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; la entrada es una frase en en-GB) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles britanico (en-GB) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis de voz end-to-end que combina un encoder de texto, un prior variacional condicionado por alineamiento monotonico, un generador basado en normalizing flows y un discriminador adversarial entrenado con perdidas GAN y de reconstruccion espectrogramica. VITS produce audio de forma directa a partir de fonemas sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo original procede del repositorio nardocolin/nardocolin-pipertts (subdirectorio `high`), es decir, del ecosistema Piper TTS, y Phoonnx lo ha reempaquetado para su libreria ONNX. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La innovacion practica del empaquetado es la integracion con el front-end `scriptconv`, que normaliza el texto y lo convierte a fonemas espeak-ng antes de pasarlo al modelo.

## Capacidades

- Sintesis de voz a partir de texto en ingles britanico (en-GB).
- Entrada basada en fonemas espeak-ng en alfabeto IPA, lo que permite control fonetico fino si se generan los fonemas manualmente.
- Generacion de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`), seleccionable desde `mycroft.conf`.
- Ejecucion local en CPU o GPU mediante ONNX Runtime, sin dependencia de servicios externos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistentes de voz locales: integrado en OVOS mediante el plugin de phoonnx, el modelo responde con voz en-GB en entornos domoticos o de escritorio sin enviar texto a la nube, lo que reduce latencia y preserva la privacidad.
- Lectura de textos y notificaciones: conversion de articulos, correos o alertas a audio en ingles britanico para aplicaciones de accesibilidad o consumo de contenido en movilidad.
- Sistemas embebidos y Raspberry Pi: al tratarse de un modelo de ~0,1 GB en ONNX, puede desplegarse en dispositivos con recursos limitados para interfaces de voz de bajo consumo.
- Generacion de audio para prototipos y demos: creacion rapida de locuciones en-GB para videos, tutoriales o pruebas de producto sin contratar un servicio de TTS comercial.
- Pruebas de integracion en pipelines de CI: verificacion automatizada de que el front-end de fonemizacion y el modelo producen audio valido en cada version del software.
- Aplicaciones web en el navegador: mediante phoonnx.js, la misma voz puede ejecutarse en el cliente con entrada espeak o unicode, habilitando demos interactivas sin backend.
- Investigacion en TTS: base para experimentos de fonemizacion, comparacion de voces Piper o evaluacion de calidad en ingles britanico dentro de un stack reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (~0,1 GB) es un modelo muy ligero que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) es mas que suficiente. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU y en dispositivos embebidos.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en el navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-en_gb-colin-espeak | VITS | en-GB | ONNX | CC-BY-4.0 | Fonemas espeak-ng (IPA) |
| Otras voces Piper TTS (ecosistema nardocolin-pipertts) | VITS | en-GB y otros | ONNX | segun cada voz | Fonemas espeak-ng |
| Modelos TTS neuronales comerciales (p. ej. servicios cloud) | no disponible | multiidioma | API | propietaria | Texto directo |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta ingles britanico (en-GB); no es multilingue.
- Depende de espeak-ng para la fonemizacion; sin el instalado, phoonnx puede usar espyak, cuyos fonemas difieren y pueden producir pronunciaciones incorrectas en algunas palabras.
- Al ser un modelo VITS de voz unica, no permite cambio de hablante ni control de estilo mas alla de la prosodia implicita.
- Riesgo de pronunciacion incorrecta en palabras fuera de dominio, siglas, numeros o nombres propios mal normalizados por el front-end.
- No hay informacion publicada sobre sesgos del dataset de entrenamiento ni sobre su composicion, lo que limita la evaluacion de sesgos acentuales o de genero.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribucion al autor original (nardocolin) y al empaquetado (Phoonnx); conviene revisar los terminos exactos de la model card upstream.
- No se documentan metricas de calidad (MOS) ni pruebas de robustez en produccion.
- El modelo tiene muy pocas descargas (21) y ningun like, por lo que su adopcion y validacion por la comunidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-colin-espeak
- Repositorio upstream (Piper TTS de nardocolin): https://huggingface.co/nardocolin/nardocolin-pipertts/tree/main/high
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
