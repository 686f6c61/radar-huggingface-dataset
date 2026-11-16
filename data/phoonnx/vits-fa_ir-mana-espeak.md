# Phoonnx/vits-fa_ir-mana-espeak

## Resumen

`vits-fa_ir-mana-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria de inferencia ONNX `phoonnx`. El modelo original procede de MahtaFetrat/Mana-Persian-Piper, un checkpoint Piper adaptado al persa, y esta reempaquetado en formato ONNX para su uso directo en Python y en el asistente OVOS. Su proposito es ofrecer sintesis de voz en persa (fa-IR) de forma ligera y ejecutable en CPU.

El modelo trabaja sobre fonemas generados por espeak-ng en alfabeto IPA, lo que lo hace dependiente de esa herramienta para el front-end de texto. Con un tamano de repositorio de 0.1 GB, esta disenado para despliegues de bajo coste: asistentes de voz locales, sistemas embebidos y aplicaciones OVOS que necesitan una voz persa sin depender de servicios en la nube.

Es relevante ahora porque cubre un hueco poco atendido: TTS open source en persa con licencia MIT y empaquetado ONNX listo para produccion. No obstante, su adopcion es todavia muy baja (21 descargas, 0 likes) y no se han publicado benchmarks objetivos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS con generador adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | persa (fa-IR) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0.1 GB |
| Libreria de inferencia | phoonnx (Python / OVOS) |
| Autor original | MahtaFetrat |
| Empaquetador | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto condicionado por alineamiento monotono (MAS), un prior variacional y un decoder generativo entrenado de forma adversarial (GAN) junto con una perdida de reconstruccion espectral. El resultado es un modelo que genera waveform directamente desde fonemas, sin vocoder externo separado, lo que simplifica el despliegue.

El modelo deriva de MahtaFetrat/Mana-Persian-Piper, un checkpoint Piper para persa. No se dispone en la informacion proporcionada de datos sobre el numero de horas de audio de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La innovacion practica de este empaquetado es la conversion a ONNX y su integracion con el pipeline de `phoonnx` y `scriptconv`, que gestiona la normalizacion de texto y la fonemizacion mediante `EspeakPhonemizer`. El front-end depende de espeak-ng (o del port espyak, con posibles discrepancias foneticas).

## Capacidades

- Sintesis de voz en persa (fa-IR) a partir de texto plano.
- Generacion de audio WAV mediante `voice.synthesize_wav()`.
- Fonemizacion basada en espeak-ng con alfabeto IPA.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador via `phoonnx.js` (voces VITS con entrada espeak o unicode).
- Inferencia ONNX, apta para CPU sin GPU dedicada.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo TTS puro).
- Monolingue: unicamente persa.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en persa sin conexion a internet, gracias a su formato ONNX y su bajo peso (0.1 GB).
- Lectura de contenido en persa: conversion de articulos, noticias o documentacion a audio para aplicaciones de accesibilidad o consumo en movilidad, usando la API `synthesize_wav` sobre texto normalizado por `scriptconv`.
- Sistemas de navegacion o IVR en persa: generacion de indicaciones y mensajes pregrabados dinamicamente en entornos con recursos limitados, donde un modelo de 0.1 GB cabe en dispositivos embebidos.
- Prototipado de interfaces conversacionales: integracion rapida en pipelines Python para validar flujos de voz en persa antes de invertir en modelos comerciales.
- Aplicaciones web de sintesis en el navegador: uso de `phoonnx.js` para generar voz persa en cliente sin backend, util para demos y herramientas educativas.
- Investigacion en TTS de bajos recursos: punto de partida para experimentos de fine-tuning o comparacion de voces Piper en persa, con licencia MIT que facilita la redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoria de despliegues; el modelo ONNX de 0.1 GB esta pensado para CPU. En GPU, el consumo seria inferior a 1 GB.
- GPU recomendadas: no se requieren; cualquier GPU con soporte ONNX Runtime puede acelerar la inferencia, pero no se documentan requisitos minimos.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (incluso integradas) por el reducido tamano del modelo.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, `phoonnx.js` en navegador, y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-fa_ir-mana-espeak | VITS | fa-IR | 0.1 GB | MIT | ONNX | Empaquetado phoonnx, front-end espeak-ng |
| MahtaFetrat/Mana-Persian-Piper (upstream) | VITS (Piper) | fa-IR | no disponible | MIT | Piper/ONNX | Modelo original del que deriva |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | variable | variable | ONNX | Mismo pipeline de inferencia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monolingue: solo sintetiza persa (fa-IR); no admite otros idiomas.
- Dependencia de espeak-ng: sin esa herramienta el front-end falla; el port espyak puede producir fonemas distintos y pronunciar mal algunas palabras.
- Calidad de voz no evaluada: no hay benchmarks ni evaluaciones MOS publicadas; la calidad percibida es desconocida.
- Riesgo de pronunciacion incorrecta en palabras con fonetica irregular, nombres propios o numeros mal normalizados por `scriptconv`.
- Adopcion muy baja (21 descargas, 0 likes) y sin mantenimiento documentado mas alla de noviembre de 2026; posible falta de soporte a largo plazo.
- Licencia MIT: permite uso comercial y redistribucion, pero conviene verificar la licencia del checkpoint upstream y de los datos de entrenamiento originales, no documentados aqui.
- Sin soporte de control de prosodia, emocion ni estilo mas alla de lo que permita el texto de entrada.
- Para produccion, validar la calidad en el dominio concreto y considerar el coste de mantener la dependencia de espeak-ng.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-mana-espeak
- Modelo upstream: https://huggingface.co/MahtaFetrat/Mana-Persian-Piper
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
