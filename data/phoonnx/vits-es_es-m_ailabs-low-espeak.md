# Phoonnx/vits-es_es-m_ailabs-low-espeak

## Resumen

`vits-es_es-m_ailabs-low-espeak` es un modelo de síntesis de voz (text-to-speech) en castellano de Espana basado en la arquitectura VITS. El modelo original fue desarrollado por Mycroft AI como parte de su coleccion de voces para Mimic3, y en este repositorio Phoonnx lo redistribuye empaquetado en formato ONNX para su uso con la libreria `phoonnx`, una biblioteca de TTS en Python y para el ecosistema OVOS.

La variante `low` hace referencia a una configuracion de menor calidad o menor coste computacional dentro de la familia de voces Mimic3; el sufijo `espeak` indica que el front-end de texto utiliza fonemas generados por espeak-ng (alfabeto IPA) como entrada al modelo. El modelo esta pensado para sintesis de voz en tiempo real en entornos con recursos limitados, como asistentes de voz embebidos o sistemas domoticos.

Es relevante para desarrolladores que necesiten un TTS local, ligero y de codigo abierto en castellano, integrable en pipelines de Python o en el asistente OVOS, sin depender de servicios en la nube. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia CC-BY-SA-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variacional con decoder adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de sintesis neuronal end-to-end que combina un encoder de texto, un predictor de duracion basado en alineamiento monotono, un flujo normalizador y un decoder generativo entrenado con aprendizaje adversarial, junto con un discriminador multiperiodo. El resultado es un modelo que genera waveforms directamente a partir de fonemas, sin necesidad de un vocoder separado.

En este caso concreto, el modelo procede de la coleccion `mimic3-voices` de Mycroft AI, en la ruta `es_ES/m-ailabs_low`. El dataset de entrenamiento subyacente es la voz `m-ailabs` (M-AILABS Speech Dataset) para castellano, en su variante `low`, si bien no se dispone en la informacion proporcionada del numero de horas de audio, tokens de entrenamiento ni detalles sobre el proceso de ajuste. El front-end de texto se delega a `scriptconv` con el fonemizador `EspeakPhonemizer`, por lo que la calidad de la sintesis depende de la correcta fonemizacion con espeak-ng.

## Capacidades

- Sintesis de voz (text-to-speech) en castellano de Espana a partir de texto plano.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak-ng (IPA), lo que permite control fino de la pronunciacion si se proporcionan fonemas directamente.
- Integracion con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion local en Python y en navegador (via `phoonnx.js`).
- No soporta tool calling, agentes, razonamiento multi-paso ni vision: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales: integrado en OVOS mediante `ovos-tts-plugin-phoonnx`, el modelo puede sintetizar respuestas habladas en castellano sin conexion a internet, lo que es adecuado para dispositivos domoticos o entornos con privacidad estricta.
- Lectura de notificaciones y alertas: en sistemas de monitorizacion o domotica, el modelo puede convertir mensajes de texto en audio para altavoces locales gracias a su bajo coste computacional (variante `low`).
- Accesibilidad: conversion de texto a voz para personas con discapacidad visual en aplicaciones de escritorio o moviles que requieran un TTS local en castellano y con licencia libre.
- Generacion de audiolibros o locuciones de bajo coste: para contenidos no criticos donde la calidad de la variante `low` sea suficiente y se priorice el rendimiento o el tamano reducido del modelo.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un TTS rapido de integrar en Python para validar flujos de voz antes de invertir en modelos de mayor calidad.
- Síntesis en navegador: mediante `phoonnx.js`, el modelo puede ejecutarse en el cliente para demos o aplicaciones web que requieran TTS en castellano sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB en ONNX) es previsible que quepa en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: no se especifican; al ser un modelo VITS de variante `low`, es viable en CPU y en GPUs consumer (por ejemplo, GTX 1060 o superiores), aunque no hay datos oficiales.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, si bien el dato no esta confirmado en la informacion proporcionada.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-es_es-m_ailabs-low-espeak (este) | VITS | es-ES | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| Otras voces Mimic3 es_ES | VITS | es-ES | segun voz upstream | ONNX / otros | github.com/MycroftAI/mimic3-voices |
| Otras voces VITS de la coleccion Phoonnx | VITS | varios | segun voz | ONNX | Hugging Face (coleccion Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La variante `low` implica una calidad de sintesis inferior a la de voces de mayor fidelidad; puede presentar artefactos o prosodia menos natural.
- Dependencia de espeak-ng: si se usa el port `espyak` en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte la propia model card.
- Solo soporta castellano de Espana (`es-ES`); no cubre otras variantes del espanol ni otros idiomas.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar pronunciaciones incorrectas ante texto no normalizado, abreviaturas o numeros mal expandidos por el front-end.
- No hay informacion sobre sesgos de generacion (por ejemplo, sesgos de genero o de acento) en la documentacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-m_ailabs-low-espeak
- Upstream (Mycroft AI, Mimic3 voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/es_ES/m-ailabs_low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
