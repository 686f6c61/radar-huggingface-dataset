# Phoonnx/vits-fa-custom_female-espeak

## Resumen

vits-fa-custom_female-espeak es un modelo de sintesis de voz (text-to-speech) en persa (codigo ISO `fa`) basado en la arquitectura VITS de Coqui. Lo publica el usuario Phoonnx como un empaquetado ONNX del modelo original Kamtera/persian-tts-female-vits, adaptado para funcionar con la libreria phoonnx, una implementacion de inferencia TTS en ONNX mantenida por TigreGotico. El modelo no ha sido entrenado desde cero por Phoonnx: se trata de una redistribucion del checkpoint de Coqui con los pesos convertidos a ONNX y el front-end de texto configurado para fonemas espeak-ng en alfabeto IPA.

El modelo resuelve un problema concreto: ofrecer una voz femenina en persa que pueda ejecutarse en entornos ligeros (Python, OVOS, navegador mediante phoonnx.js) sin depender del stack completo de Coqui TTS ni de PyTorch en tiempo de inferencia. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo compacto, coherente con el tamano tipico de los modelos VITS (decenas de millones de parametros).

Es relevante ahora porque amplia el ecosistema de voces VITS empaquetadas para phoonnx, una alternativa ONNX a Coqui TTS orientada a asistentes de voz (OVOS) y despliegues embebidos. La licencia declarada es openrail, aunque la model card incluye una nota que menciona CC-BY-4.0 para esta voz concreta, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa ~0,1 GB) |
| Idiomas soportados | persa (`fa`) |
| Licencia | openrail (la model card cita tambien CC-BY-4.0 para esta voz) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Libreria de inferencia | phoonnx (`pip install --pre phoonnx`) |
| Autor original | Coqui (upstream: Kamtera/persian-tts-female-vits) |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un predictor de duracion y pitch, un decoder generativo basado en flujos normalizadores y un discriminador adversarial en entrenamiento (GAN condicional con perdida variacional). Genera audio directamente a partir de fonemas sin necesidad de un vocoder externo, lo que la hace compacta y rapida en inferencia.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de horas de audio, los hablantes utilizados ni si hubo ajuste fino o etapas de RLHF. La model card solo indica que el modelo procede de Kamtera/persian-tts-female-vits y que el front-end utiliza el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, con entrada en alfabeto IPA generada por espeak-ng. La innovacion principal de este empaquetado es la conversion a ONNX y la integracion con phoonnx, que permite inferencia sin PyTorch y despliegue en OVOS y en navegador via phoonnx.js.

## Capacidades

- Sintesis de voz femenina en persa a partir de texto plano.
- Generacion de audio WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Fonemizacion con espeak-ng (o con el port espyak incluido en el extra `phoonnx[espeak]`).
- Integracion como plugin de OVOS (`ovos-tts-plugin-phoonnx`) configurable en `mycroft.conf`.
- Ejecucion en navegador mediante phoonnx.js (demo en tigregotico.pt/demo).
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No se documentan capacidades multilingues: solo persa.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `coqui/fa-custom-vits-female` en `mycroft.conf`, ofreciendo respuestas habladas en persa dentro de un asistente domestico o de escritorio.
- Lectura de contenido en persa: conversion de articulos, noticias o documentacion a audio WAV para consumo en movilidad o accesibilidad, aprovechando la inferencia ONNX ligera.
- Sistemas de anuncios y avisos automatizados: generacion de mensajes de voz en persa para aplicaciones de transporte, comercio o telefonia, con bajo coste computacional por frase.
- Prototipado de interfaces conversacionales en persa: iteracion rapida sobre dialogos y prompts de voz sin depender de servicios en la nube, usando phoonnx en local.
- Integracion web: sintesis en el navegador con phoonnx.js para aplicaciones que necesiten leer texto en persa sin enviar datos a un servidor.
- Educacion y aprendizaje de idiomas: generacion de ejemplos de pronunciacion en persa a partir de frases escritas, con la salvedad de que la calidad depende del fonemizador espeak-ng.
- Pruebas de regresion en pipelines TTS: al ser un repo de ~0,1 GB con pesos ONNX, es adecuado para tests automatizados de sintesis en CI sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del repo (~0,1 GB) y la naturaleza de VITS, la inferencia cabe holgadamente en CPU y en cualquier GPU consumer con pocos cientos de MB de memoria.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 3060 o superior, A100, H100) puede ejecutarlo, aunque el modelo esta pensado para CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: phoonnx (Python), plugin OVOS (`ovos-tts-plugin-phoonnx`), phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-fa-custom_female-espeak | VITS | fa | ONNX | openrail | Hugging Face, phoonnx, OVOS |
| Kamtera/persian-tts-female-vits (upstream) | VITS | fa | Coqui/PyTorch | openrail | Hugging Face |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | variable | Hugging Face |

La comparativa directa con alternativas de la misma categoria (TTS en persa) no esta disponible en la informacion proporcionada. El unico punto de referencia documentado es el modelo upstream, del que este empaquetado deriva y con el que comparte arquitectura y pesos, diferenciandose por el formato ONNX y la integracion con phoonnx.

## Limitaciones y advertencias

- Solo soporta persa (`fa`); no se documentan otros idiomas.
- La calidad depende del fonemizador: con el port espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras. Se recomienda instalar espeak-ng nativo.
- No hay informacion sobre el dataset de entrenamiento, sesgos de hablante, acento o registro, por lo que no se puede evaluar el sesgo de forma rigurosa.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir artefactos o pronunciaciones incorrectas en textos fuera de dominio, siglas o numeros.
- Ambiguedad de licencia: la model card declara openrail, pero tambien cita CC-BY-4.0 para esta voz; conviene verificar los terminos antes de un uso comercial.
- El modelo no esta pensado para clonacion de voz ni para control de emocion o estilo; no se documentan esas capacidades.
- Requiere espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]`), lo que anade una dependencia externa al despliegue.
- Repositorio con muy poca traccion (19 descargas, 0 likes): no hay evidencia de uso en produccion ni de mantenimiento continuo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa-custom_female-espeak
- Modelo upstream: https://huggingface.co/Kamtera/persian-tts-female-vits
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
