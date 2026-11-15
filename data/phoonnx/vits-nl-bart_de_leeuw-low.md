# Phoonnx/vits-nl-bart_de_leeuw-low

## Resumen

`vits-nl-bart_de_leeuw-low` es un modelo de sintesis de voz (text-to-speech) en neerlandes basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su coleccion de voces Mimic 3 y reempaquetado por Phoonnx en formato ONNX para su libreria de TTS `phoonnx`. Se trata de una voz concreta (Bart de Leeuw, variante de baja calidad o "low") dentro del catalogo de voces neerlandesas de Mimic 3, no de un modelo de lenguaje generativo de proposito general.

El modelo resuelve un problema muy concreto: ofrecer sintesis de voz local, ligera y sin dependencias de servicios en la nube para aplicaciones de asistente de voz, en este caso dentro del ecosistema OVOS (Open Voice OS) y de la pila de Mycroft. Su relevancia actual es limitada pero practica: los modelos VITS siguen siendo una opcion eficiente para TTS embebido y de baja latencia, y este paquete ONNX facilita su integracion en Python y en asistentes domoticos.

El repositorio ocupa aproximadamente 0,1 GB y el modelo consume fonemas gruut (alfabeto IPA) como entrada de texto. No se dispone de informacion publica sobre numero de parametros, longitud de contexto ni volumen de datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | neerlandes (`nl`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Autor original | Mycroft AI (repo `mimic3-voices`) |
| Empaquetado | Phoonnx (`phoonnx`, `scriptconv`) |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional condicionado por alineamiento monotono, un decoder generativo y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales, ademas de un modelado normalizante de flujo para la duracion. El resultado es un modelo que genera audio directamente a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue.

En este caso concreto, el modelo procede del repositorio `MycroftAI/mimic3-voices`, en la ruta `voices/nl/bart-de-leeuw_low`. La variante "low" indica una version de menor calidad o menor coste computacional dentro del catalogo de Mimic 3. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional; estos datos deben considerarse no disponibles.

## Capacidades

- Sintesis de voz (text-to-speech) en neerlandes a partir de texto plano.
- Conversion de texto a fonemas mediante `scriptconv` con el fonemizador `GruutPhonemizer` (extra `scriptconv[gruut]`), usando el alfabeto IPA.
- Generacion de audio en formato WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Integracion como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), seleccionable desde `mycroft.conf`.
- Ejecucion local en Python mediante la libreria `phoonnx` y pesos ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo "thinking"; es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistente de voz domestico en OVOS: la voz se configura como modulo TTS en `mycroft.conf` y permite que el asistente responda en neerlandes de forma local, sin enviar texto a servicios externos.
- Sintesis de voz offline en dispositivos embebidos: al distribuirse en ONNX y ocupar ~0,1 GB, puede ejecutarse en Raspberry Pi u otros equipos de bajos recursos para generar avisos hablados.
- Lectura de notificaciones y alertas: integracion en scripts Python que conviertan texto (correos, mensajes, estados de sistema) en audio WAV para reproduccion posterior.
- Accesibilidad: generacion de audio para personas con discapacidad visual a partir de contenido textual en neerlandes, con pronunciacion basada en fonemas IPA.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia ligera para validar integraciones con `phoonnx` y `scriptconv` antes de desplegar voces de mayor calidad.
- Prototipado de interfaces conversacionales: permite construir demos de dialogo por voz en neerlandes con latencia baja y sin coste de API, usando la variante "low" para iteracion rapida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) se trata de un modelo muy ligero que cabe holgadamente en GPU consumer e incluso puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se especifican modelos concretos (A100, H100, RTX 4090) porque el modelo no requiere hardware de gama alta.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: `phoonnx` (Python) con pesos ONNX; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/vits-nl-bart_de_leeuw-low` | VITS | nl | ONNX | CC-BY-SA-4.0 | Hugging Face (Phoonnx) |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | ONNX | segun cada voz | Coleccion `Phoonnx/vits` en Hugging Face |
| Voces originales de Mimic 3 (`MycroftAI/mimic3-voices`) | VITS | varios | formato Mimic 3 | CC-BY-SA-4.0 (upstream) | GitHub |
| Modelos TTS multilingues de gran escala (p. ej. familia XTTS) | no disponible en la informacion | varios | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo unicamente de sintesis de voz en neerlandes; no procesa otros idiomas ni tareas de lenguaje.
- La variante "low" implica menor calidad de audio que otras variantes del mismo catalogo; no se especifica el MOS ni la tasa de muestreo.
- Requiere un front-end de fonemizacion (`gruut` via `scriptconv[gruut]`) para convertir texto a IPA; sin el, la entrada no es valida.
- Licencia CC-BY-SA-4.0: permite uso comercial pero exige atribucion y compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto en la informacion disponible; al ser un modelo TTS, el riesgo principal es la pronunciacion incorrecta de textos no cubiertos por el fonemizador.
- No se especifican requisitos de latencia ni throughput en produccion; conviene validar el rendimiento en el hardware objetivo antes de desplegar.
- El repositorio es reciente (creado en 2026-11-14) y con muy pocas descargas (32), por lo que la validacion comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl-bart_de_leeuw-low
- Repositorio upstream (Mycroft AI, voz Bart de Leeuw low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/nl/bart-de-leeuw_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
