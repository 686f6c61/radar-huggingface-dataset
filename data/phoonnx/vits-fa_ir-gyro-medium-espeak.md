# Phoonnx/vits-fa_ir-gyro-medium-espeak

## Resumen

vits-fa_ir-gyro-medium-espeak es un modelo de sintesis de voz (text-to-speech) de arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su uso con la libreria ONNX `phoonnx`. El modelo convierte texto en persa (variante `fa-IR`) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz TTS ligera y de licencia permisiva (MIT) para un idioma con escasa cobertura en el ecosistema de sintesis de voz open source, y en que su formato ONNX permite inferencia en CPU sin dependencias de GPU.

El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde a un modelo compacto de la gama "medium" de Piper, disenado para despliegue en entornos con recursos limitados como asistentes de voz embebidos, sistemas domoticos o dispositivos de bajo consumo. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los datos de entrenamiento en la informacion proporcionada.

El modelo se integra en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, y puede ejecutarse tambien en navegador a traves de `phoonnx.js`. Su proposito principal es dotar de voz a asistentes y aplicaciones en persa sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | persa (`fa-IR`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original | Rhasspy (Piper voices) |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruccion y adversariales. Este diseno permite generar audio de forma directa desde fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. El modelo concreto corresponde a la variante "medium" de la voz `gyro` del proyecto Piper para persa de Iran (`fa_IR`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o fine-tuning preferencial. El modelo card indica unicamente que la entrada de texto se procesa mediante el fonemizador `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`, que convierte el texto normalizado a fonemas espeak-ng en IPA antes de la sintesis. La normalizacion y conversion de texto la realiza la libreria `scriptconv`.

## Capacidades

- Sintesis de voz a partir de texto en persa (`fa-IR`) con salida en fichero WAV.
- Conversion texto a fonemas mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Inferencia en CPU mediante ONNX Runtime a traves de la libreria `phoonnx`.
- Integracion con asistentes OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante `phoonnx.js`, con demo en `tigregotico.pt/demo`.
- Soporte de entrada en alfabeto IPA (fonemas) ademas de texto plano normalizado.
- No soporta tool calling, agentes, vision ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz en persa: el modelo puede integrarse en OVOS como modulo TTS para leer respuestas del asistente en `fa-IR`, gracias a su formato ONNX ligero y su ejecucion en CPU.
- Domotica y dispositivos embebidos: su tamano reducido (~0,1 GB) y la ausencia de requisitos de GPU permiten desplegarlo en Raspberry Pi u otros dispositivos de bajo consumo para anuncios hablados.
- Lectura de notificaciones y alertas: aplicaciones que necesiten convertir mensajes de texto en audio para usuarios persohablantes, con latencia baja al no requerir vocoder separado.
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual que consuman contenido en persa, ejecutandose localmente sin enviar datos a la nube.
- Prototipado rapido de interfaces de voz: gracias a la instalacion via `pip install --pre phoonnx` y la API `TTSModelManager`, se puede integrar en pocas lineas de Python para pruebas de concepto.
- Aplicaciones web con TTS en cliente: mediante `phoonnx.js` se puede sintetizar voz en el navegador sin backend, util para demos o aplicaciones offline.
- Generacion de audiolibros o contenido educativo en persa: sintesis por lotes de textos largos divididos en frases, con salida WAV por segmento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime. El repositorio ocupa ~0,1 GB, por lo que la memoria RAM necesaria es del orden de cientos de MB.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de la gama "medium" de Piper, no requiere GPU. Cualquier GPU compatible con ONNX Runtime podria acelerar la inferencia, pero no es un requisito.
- Compatibilidad con GPU de consumo: si, aunque el caso de uso principal es CPU. Cabe en cualquier equipo sin GPU dedicada.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| vits-fa_ir-gyro-medium-espeak (este modelo) | VITS | fa-IR | MIT | ONNX | ~0,1 GB | Empaquetado para phoonnx, entrada espeak IPA |
| Otras voces Piper (`rhasspy/piper-voices`) | VITS | Multiples idiomas | MIT (segun upstream) | ONNX | Variable | Mismo origen; este modelo es una de ellas reempaquetada |
| Modelos TTS multilingues comerciales | no disponible | Multiples | Propietaria | no disponible | no disponible | No comparables en licencia ni despliegue local |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Cobertura linguistica limitada exclusivamente al persa (`fa-IR`); no soporta otros idiomas.
- Dependencia de espeak-ng para la fonemizacion: sin el instalado, el modelo no funciona correctamente. El port espyak incluido en `phoonnx[espeak]` puede producir fonemas distintos y provocar errores de pronunciacion en algunas palabras.
- Riesgo de pronunciacion incorrecta en palabras con grafias ambiguas, nombres propios o prestamos, al depender de reglas de espeak-ng y no de un modelo de lenguaje fonetico.
- No se dispone de informacion sobre sesgos de generacion (por ejemplo, sesgos de genero o de variedad dialectal dentro del persa) ni sobre la composicion del dataset de entrenamiento.
- Licencia MIT declarada por el upstream, permisiva para uso comercial, pero se recomienda verificar la cadena de licencias del proyecto Piper y de los datos de entrenamiento originales.
- El modelo no incluye capacidades de clonacion de voz, control de emocion ni prosodia avanzada mas alla de lo que ofrece la arquitectura VITS estandar.
- Al ser un modelo TTS, no aplican limitaciones de contexto de texto ni de alucinacion en el sentido de los LLM, pero si puede generar audio defectuoso ante entradas fuera de dominio o texto no normalizado correctamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria; conviene evaluar la calidad de sintesis antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-gyro-medium-espeak
- Upstream (Piper voices, fa/fa_IR/gyro/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/fa/fa_IR/gyro/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
