# Phoonnx/vits-nl-rdh-low-gruut

## Resumen

`vits-nl-rdh-low-gruut` es un modelo de sintesis de voz (text-to-speech) en neerlandes basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI dentro del proyecto mimic3-voices y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo toma texto en neerlandes, lo normaliza y fonemiza mediante gruut (alfabeto IPA) y genera audio directamente, sin necesidad de un vocoder separado, ya que VITS es un modelo end-to-end que combina encoder, decoder y discriminador adversarial en un unico grafo.

El modelo se distribuye en formato ONNX, lo que permite inferencia en CPU sin dependencias de frameworks de deep learning pesados, y esta pensado para integrarse en asistentes de voz y sistemas de sintesis de baja latencia. Su tamano de repositorio (0,1 GB) y la etiqueta `low` en el nombre indican que se trata de una variante de baja carga computacional, adecuada para entornos con recursos limitados.

Es relevante para desarrolladores que necesitan un TTS ligero y multilingue (neerlandes) dentro del ecosistema OVOS/Mycroft, aunque su adopcion es muy reducida (18 descargas, 0 likes) y la documentacion tecnica disponible es minima: no se publican especificaciones de parametros, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end, variacional adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no LLM) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | neerlandes (`nl`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Libreria de inferencia | phoonnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura que combina un encoder de texto condicionado por alineamiento monotono, un decoder generativo basado en flujo normalizador y un discriminador adversarial multi-periodo, todo entrenado de forma conjunta. Esto elimina la necesidad de un vocoder externo y permite generar formas de onda directamente a partir de fonemas, con una calidad natural y una latencia baja en comparacion con pipelines en cascada.

El modelo concreto es una variante de baja carga (`rdh_low`) del catalogo de voces de mimic3-voices para neerlandes, empaquetada por Phoonnx como ONNX. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones adicionales (decodificacion especulativa, atencion lineal, etc.). La unica innovacion documentada es el pipeline de fonemizacion con gruut y la conversion a ONNX para inferencia portable.

## Capacidades

- Sintesis de voz (text-to-speech) en neerlandes a partir de texto plano.
- Normalizacion y fonemizacion automatica del texto mediante scriptconv y gruut (IPA).
- Generacion de audio end-to-end sin vocoder separado (VITS).
- Inferencia en CPU mediante ONNX, sin GPU obligatoria.
- Integracion con el ecosistema OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Salida en formato WAV mediante la API `synthesize_wav`.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso (no es un LLM).
- Capacidad multilingue limitada: solo neerlandes.

## Casos de uso

- Asistentes de voz locales: el modelo puede sintetizar respuestas en neerlandes dentro de OVOS/Mycroft, integrándose como modulo TTS mediante `mycroft.conf` y funcionando en CPU sin GPU.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en sistemas embebidos o Raspberry Pi gracias a su tamano reducido (0,1 GB) y formato ONNX.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual en aplicaciones neerlandesas, con baja latencia y sin dependencia de servicios en la nube.
- Automatizacion del hogar: respuestas habladas en asistentes domesticos para usuarios neerlandofonos, integradas en pipelines de domotica.
- Pruebas y prototipado de pipelines TTS: su licencia CC-BY-SA-4.0 y su empaquetado ONNX lo hacen util para validar flujos de fonemizacion gruut antes de escalar a voces de mayor calidad.
- Generacion de audiolibros o contenido educativo en neerlandes a pequena escala, siempre que se respete la licencia de compartir igual.
- Investigacion en TTS de bajo recursos: punto de partida para comparar variantes `low` frente a variantes de mayor calidad dentro del catalogo mimic3-voices.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo CPU; en GPU, el modelo ONNX de 0,1 GB cabe holgadamente en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en CPU y en GPUs consumer como GTX 1650, RTX 3060 o superiores sin problemas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Contexto/parametros |
|---|---|---|---|---|---|
| `vits-nl-rdh-low-gruut` (este) | VITS | nl | ONNX | CC-BY-SA-4.0 | no disponible |
| Otras voces mimic3-voices (p. ej. variantes `high` de nl) | VITS | nl | ONNX | CC-BY-SA-4.0 | no disponible |
| Piper TTS (voces neerlandesas) | VITS | nl, multi | ONNX | MIT / varias | no disponible |
| Coqui TTS (modelos VITS) | VITS | multi | PyTorch | MPL-2.0 / varias | no disponible |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada; la comparativa se limita a arquitectura, formato y licencia.

## Limitaciones y advertencias

- Modelo unicamente de neerlandes; no soporta otros idiomas.
- No es un LLM: no genera texto, razona ni ejecuta tool calling.
- Documentacion tecnica muy escasa: sin parametros, contexto ni benchmarks publicados.
- Adopcion minima (18 descargas, 0 likes), lo que reduce la validacion comunitaria y el soporte.
- Licencia CC-BY-SA-4.0: permite uso comercial pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; revisar implicaciones antes de integrarlo en productos propietarios.
- La calidad de sintesis de la variante `low` es inferior a la de variantes de mayor carga; adecuada para respuestas cortas, no necesariamente para narracion de alta fidelidad.
- Dependencia de la fonemizacion gruut: errores en la normalizacion del texto pueden degradar la pronunciacion.
- Riesgo de alucinacion acustica (pronunciaciones incorrectas o artefactos) en textos con numeros, siglas o nombres propios no cubiertos por el fonemizador.
- Sin garantias de mantenimiento por parte de Mycroft AI ni de Phoonnx; verificar compatibilidad de versiones de phoonnx y scriptconv en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl-rdh-low-gruut
- Repositorio upstream (mimic3-voices, voz nl/rdh_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/nl/rdh_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
