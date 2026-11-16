# Phoonnx/vits-uk_ua-ukrainian_tts-medium-unicode

## Resumen

`vits-uk_ua-ukrainian_tts-medium-unicode` es un modelo de sintesis de voz (text-to-speech) en ucraniano, empaquetado por Phoonnx a partir de los pesos originales de Rhasspy publicados en el repositorio `rhasspy/piper-voices`. El modelo subyacente es una red VITS (Variational Inference for Text-to-Speech), una arquitectura generativa de extremo a extremo que convierte texto en forma de onda de audio sin necesidad de un vocoder externo. El paquete esta adaptado para ejecutarse con la libreria `phoonnx`, que carga pesos en formato ONNX y ofrece integracion directa con el ecosistema OVOS/Mycroft.

La variante `unicode` indica que el front-end de texto no utiliza fonemizacion basada en espeak, sino que alimenta al modelo directamente con los puntos de codigo Unicode del texto de entrada, normalizados por la libreria `scriptconv` mediante `UnicodeCodepointPhonemizer`. Esto simplifica el pipeline y reduce dependencias externas, a costa de requerir que el texto de entrada este ya en la forma esperada por el modelo.

El modelo esta pensado para sintesis de voz en ucraniano en aplicaciones de asistente domestico, lectura de texto y generacion de audio ligero. Su tamano reducido (repo de 0,1 GB) y su licencia MIT lo hacen adecuado para despliegue en CPU y dispositivos de bajos recursos. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni datos de entrenamiento mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados) |
| Idiomas soportados | ucraniano (`uk-UA`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura generativa condicional que combina un encoder de texto, un prior variacional y un decoder basado en flujos normalizadores y un generador de audio (tipicamente HiFi-GAN) en un unico modelo entrenado de extremo a extremo. La salida es directamente la forma de onda, sin vocoder separado. La variante empaquetada por Phoonnx emplea un front-end `unicode` que transforma el texto en puntos de codigo Unicode mediante `UnicodeCodepointPhonemizer` de `scriptconv`, en lugar de usar fonemas de espeak.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla de lo indicado en la model card. El modelo procede del repositorio `rhasspy/piper-voices` (ruta `uk/uk_UA/ukrainian_tts/medium`), que agrupa voces Piper de calidad media entrenadas para sintesis en multiples idiomas. El autor original es Rhasspy; Phoonnx se limita al empaquetado y la integracion con su libreria.

## Capacidades

- Sintesis de voz en ucraniano a partir de texto en formato Unicode.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador a traves de `phoonnx.js` (demo en tigregotico.pt/demo).
- Normalizacion y conversion de texto mediante `scriptconv`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: es exclusivamente un modelo TTS.

## Casos de uso

- Asistente de voz domestico en ucraniano: integrado en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, el modelo sintetiza respuestas del asistente en tiempo real en CPU, sin necesidad de GPU, gracias a su tamano reducido.
- Lectura de articulos y noticias: conversion de texto plano a audio para aplicaciones de accesibilidad o podcasts automatizados en ucraniano, usando la API `synthesize_wav` sobre flujos de texto por frases.
- Generacion de avisos y notificaciones: sintesis de mensajes cortos en sistemas de megafonia, domotica o aplicaciones moviles que requieran audio en ucraniano con baja latencia.
- Pruebas de integracion en pipelines TTS: uso como voz de referencia en tests de sistemas de dialogo, ya que su licencia MIT y su formato ONNX facilitan el despliegue en CI.
- Prototipado de interfaces de voz en navegador: mediante `phoonnx.js`, el modelo puede ejecutarse en el cliente para demos interactivas sin backend de inferencia.
- Localizacion de contenido multimedia: doblaje automatizado de videos o tutoriales al ucraniano cuando no se requiere clonacion de voz ni calidad de estudio.
- Educacion de idiomas: generacion de ejemplos de pronunciacion en ucraniano para aplicaciones de aprendizaje, dado el soporte de entrada Unicode directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repo (0,1 GB) se espera un consumo de memoria muy bajo, apto para CPU.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion en CPU.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `Phoonnx/vits-uk_ua-ukrainian_tts-medium-unicode` | VITS | ucraniano | no aplica | MIT | ONNX |
| `rhasspy/piper-voices` (uk_UA/ukrainian_tts/medium) | VITS | ucraniano | no aplica | MIT | ONNX (origen) |
| Otras voces Piper de la coleccion Phoonnx | VITS | varios | no aplica | MIT | ONNX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no realiza comprension de texto, razonamiento ni generacion de lenguaje.
- Calidad "medium": la model card indica calidad media, inferior a voces de mayor tamano o modelos neuronales de ultima generacion.
- Idioma limitado al ucraniano (`uk-UA`); no se garantiza un comportamiento correcto con texto en otros idiomas o mezclas.
- Front-end `unicode`: requiere que el texto de entrada este en la forma esperada; la normalizacion depende de `scriptconv` y no de un fonemizador espeak, lo que puede afectar a la pronunciacion de abreviaturas, numeros o caracteres especiales.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, silencios anomalos o pronunciaciones incorrectas en entradas atipicas.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales de Piper/Rhasspy.
- Sin datos publicados de benchmarks, latencia ni consumo de memoria; las estimaciones de hardware son orientativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-uk_ua-ukrainian_tts-medium-unicode
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/uk/uk_UA/ukrainian_tts/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
