# Phoonnx/vits-en_gb-alan-medium

## Resumen

vits-en_gb-alan-medium es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo original procede del proyecto Rhasspy Piper, concretamente de la voz `en_GB/alan/medium` del repositorio `rhasspy/piper-voices`, y ha sido reempaquetado para funcionar con la libreria phoonnx, que permite ejecutar el modelo tanto en Python como en el ecosistema de asistentes OVOS.

Se trata de una voz con acento britanico (`en-GB`) que recibe como entrada fonemas generados por espeak-ng en alfabeto IPA, no texto directo. El modelo resuelve el problema de la sintesis de voz local y ligera: al estar exportado a ONNX y ocupar aproximadamente 0,1 GB en el repositorio, puede ejecutarse en CPU sin GPU dedicada, lo que lo hace adecuado para asistentes de voz embebidos, sistemas domoticos y aplicaciones de escritorio.

Su relevancia actual radica en la combinacion de una licencia permisiva (MIT), un formato de despliegue portable (ONNX) y una integracion sencilla mediante el plugin `ovos-tts-plugin-phoonnx`. No obstante, la informacion publicada es muy limitada: no se detallan parametros, datos de entrenamiento ni resultados de benchmarks, por lo que la ficha refleja exclusivamente lo disponible en la model card y los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | ingles britanico (`en-GB`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un vocoder neuronal integrado, entrenado de forma adversarial con un discriminador multi-periodo. Esta arquitectura permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder separado en tiempo de inferencia.

El modelo original fue entrenado por Rhasspy como parte del proyecto Piper, orientado a voces ligeras para asistentes de voz. La variante `medium` hace referencia al tamano de la voz dentro de la taxonomia de Piper (que distingue entre `low`, `medium` y `high`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino adicional. La unica innovacion documentada es el reempaquetado a ONNX para su uso con phoonnx y la integracion del front-end de texto mediante la libreria scriptconv, que normaliza el texto y lo convierte a fonemas espeak.

## Capacidades

- Sintesis de voz a partir de texto en ingles britanico, con salida en formato WAV.
- Generacion de audio mediante fonemas IPA producidos por espeak-ng (front-end `EspeakPhonemizer` de scriptconv).
- Ejecucion local en CPU gracias al formato ONNX, sin requerir GPU.
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso en navegador a traves de phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada.
- Capacidad multilingue limitada exclusivamente al ingles britanico.

## Casos de uso

- Asistentes de voz para domotica: el modelo puede integrarse en OVOS configurando `ovos-tts-plugin-phoonnx` en `mycroft.conf`, permitiendo respuestas habladas locales en un asistente domestico sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ejecutarse en CPU y ocupar poco espacio, puede sintetizar mensajes cortos en tiempo real dentro de una aplicacion Python.
- Sistemas de accesibilidad: conversion de texto a voz para usuarios con discapacidad visual en entornos de escritorio Linux, usando la API de phoonnx para generar archivos WAV.
- Prototipado de interfaces conversacionales: desarrolladores que necesitan una voz britanica rapida para probar flujos de dialogo antes de invertir en voces comerciales.
- Automatizacion de anuncios en dispositivos embebidos (Raspberry Pi y similares): la voz `medium` de Piper esta pensada para hardware de bajos recursos, y el formato ONNX facilita el despliegue.
- Generacion de audio para contenido educativo o demos: sintesis de frases en ingles britanico para materiales de aprendizaje de idiomas o pruebas de integracion continua de pipelines de audio.
- Pruebas en navegador: mediante phoonnx.js y la demo en tigregotico.pt/demo, se puede evaluar la voz sin instalar dependencias locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de aproximadamente 0,1 GB, es previsible que funcione en CPU sin GPU, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; el diseno de Piper y el formato ONNX apuntan a inferencia en CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js en navegador.
- Latencia y throughput: no disponibles.
- Dependencia adicional: espeak-ng instalado en el sistema (o el extra `phoonnx[espeak]` con espyak) para la generacion de fonemas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_gb-alan-medium (este modelo) | VITS | en-GB | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper `en_GB` (p. ej. `en_GB-alba-medium`, `en_GB-northern_english_male-medium`) | VITS | en-GB | MIT (segun repositorio Piper) | ONNX | Hugging Face (rhasspy/piper-voices) |
| Voces Piper `en_US` (p. ej. `en_US-lessac-medium`) | VITS | en-US | MIT (segun repositorio Piper) | ONNX | Hugging Face (rhasspy/piper-voices) |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles britanico; no es multilingue.
- Requiere espeak-ng para la fonemizacion; sin el instalado, la voz puede pronunciar mal algunas palabras si se usa el port espyak.
- Al ser un modelo TTS y no un modelo de lenguaje, no razona ni mantiene contexto conversacional; la entrada se procesa por frases.
- No se documentan sesgos especificos, pero al derivar de un corpus de voz concreto puede reflejar caracteristicas del hablante original.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto; sin embargo, la fonemizacion incorrecta puede producir pronunciaciones erroneas.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia upstream en `rhasspy/piper-voices` antes de un despliegue en produccion.
- El repositorio tiene muy pocas descargas (29) y ningun like, lo que sugiere una validacion comunitaria limitada.
- No hay informacion sobre la calidad perceptual (MOS) ni sobre el comportamiento en textos largos o con caracteres especiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-alan-medium
- Repositorio upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/alan/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
