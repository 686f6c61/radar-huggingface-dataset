# Phoonnx/vits-el_gr-rapunzelina-low-mycroft_ai-espeak

## Resumen

`vits-el_gr-rapunzelina-low-mycroft_ai-espeak` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su suite de voces Mimic 3 y empaquetado por Phoonnx en formato ONNX para su libreria de inferencia TTS. El modelo sintetiza voz en griego (el-GR) a partir de texto, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA.

La relevancia de este modelo radica en su caracter practico: es una voz preentrenada, ligera (repo de 0,1 GB, variante "low" de calidad) y distribuida en ONNX, lo que permite ejecutarla en entornos sin GPU dedicada, integrada en asistentes de voz como OVOS/Mycroft. No es un modelo de proposito general sino un componente especializado dentro de un pipeline TTS: normalizacion de texto, fonemizacion con espeak-ng y sintesis neuronal VITS.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a desarrolladores que necesiten una voz griega de baja latencia y tamano reducido para asistentes conversacionales, lectura de texto o sistemas embebidos con integracion via phoonnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | griego (el-GR) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Variante de calidad | low |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior y posterior variacional, un decoder basado en flujos normales y un discriminador adversarial entrenado con perdidas de dominio temporal y espectral. El resultado es un modelo que genera forma de onda directamente a partir de fonemas, sin necesidad de vocoder separado. En este caso concreto se trata de la variante "low" de la voz `rapunzelina_low` de Mycroft AI, optimizada por tamano y velocidad de inferencia en detrimento de la fidelidad acustica maxima.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante original ni si se aplicaron tecnicas de RLHF o ajuste fino. La model card indica unicamente el origen upstream (repositorio `mimic3-voices` de Mycroft AI) y que la entrada debe ser fonemas espeak-ng en IPA, lo que implica que el modelo fue entrenado sobre representaciones fonemicas de ese fonemizador. El empaquetado en ONNX por parte de Phoonnx es un paso de conversion y distribucion, no un reentrenamiento.

## Capacidades

- Sintesis de voz en griego (el-GR) a partir de texto plano, con salida en fichero WAV.
- Conversion de texto a fonemas mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Inferencia en CPU mediante ONNX Runtime, sin requerir GPU.
- Integracion como plugin TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`).
- Ejecucion en navegador mediante `phoonnx.js` con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multietapa ni vision.
- No es un modelo multilingue: unicamente griego.
- No dispone de modo "thinking" ni capacidades de audio-a-audio.

## Casos de uso

- Asistentes de voz en griego: integracion en OVOS/Mycroft como modulo TTS para responder a comandos de voz en griego, aprovechando el plugin nativo y la configuracion via `mycroft.conf`.
- Lectura de noticias o articulos en griego: sintesis por frases con baja latencia y tamano reducido, adecuada para pipelines de lectura automatica en servidores sin GPU.
- Accesibilidad: conversion de texto a voz para usuarios con discapacidad visual que consuman contenido en griego, desplegable en hardware modesto.
- Sistemas embebidos y dispositivos IoT: el formato ONNX y la variante "low" permiten ejecucion en Raspberry Pi o dispositivos similares con CPU.
- Generacion de audiolibros o podcasts en griego: sintesis por lotes de grandes volumenes de texto, con la salvedad de que la calidad "low" puede no ser suficiente para produccion editorial.
- Pruebas y prototipado de pipelines TTS: al ser un modelo ligero y de licencia abierta, sirve como base para validar arquitecturas de sintesis antes de invertir en voces de mayor calidad.
- Aplicaciones web con sintesis en cliente: mediante `phoonnx.js`, se puede ofrecer TTS en griego directamente en el navegador sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo es ONNX y se ejecuta en CPU. Para GPU, el consumo seria minimo (repo de 0,1 GB), pero no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles; el modelo esta disenado para CPU.
- Compatibilidad con GPU consumer: si, en cualquier GPU con soporte ONNX Runtime, aunque no es el escenario previsto.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS/Mycroft), `phoonnx.js` (navegador).
- Latencia y throughput: no disponibles. La variante "low" sugiere inferencia rapida en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Calidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-el_gr-rapunzelina-low (este) | VITS | el-GR | low | CC-BY-SA-4.0 | ONNX | Hugging Face |
| Otras voces Mimic3 el_GR | VITS | el-GR | variable | CC-BY-SA-4.0 | ONNX | Repo MycroftAI |
| Piper (voces griegas) | VITS | el-GR | variable | MIT (segun voz) | ONNX | Hugging Face / GitHub |
| Coqui TTS (voces multilingues) | VITS / otros | multi | variable | MPL-2.0 / otras | PyTorch | GitHub |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Calidad "low": la variante esta optimizada por tamano y velocidad, por lo que la fidelidad acustica y naturalidad seran inferiores a variantes "medium" o "high".
- Dependencia de espeak-ng: la entrada debe ser fonemas espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Un solo idioma: solo griego (el-GR); no soporta otros idiomas ni cambio de voz.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y compartir bajo la misma licencia; las obras derivadas deben mantener la licencia.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento o en texto con abreviaturas no normalizadas.
- Sin datos de sesgo: no se ha publicado informacion sobre sesgos de hablante, genero o acento.
- Modelo de nicho: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Sin parametros ni contexto documentados: no es posible estimar el coste computacional exacto a partir de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-el_gr-rapunzelina-low-mycroft_ai-espeak
- Repositorio upstream (MycroftAI/mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/el_GR/rapunzelina_low
- phoonnx (libreria de inferencia): https://github.com/TigreGotico/phoonnx
- scriptconv (normalizacion y fonemizadores): https://github.com/TigreGotico/scriptconv
- phoonnx.js (inferencia en navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
