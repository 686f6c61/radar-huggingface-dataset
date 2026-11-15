# Phoonnx/vits-ca_es-multispeaker

## Resumen

`vits-ca_es-multispeaker` es un modelo de sintesis de voz (text-to-speech) en catalan empaquetado en formato ONNX por Phoonnx para su uso con la libreria `phoonnx`. El modelo original fue entrenado por Projecte AINA y corresponde al checkpoint `projecte-aina/tts-ca-coqui-vits-multispeaker`, un sistema VITS multi-hablante derivado del ecosistema Coqui TTS. Phoonnx se limita a convertirlo a ONNX y a proporcionar la fontaneria de inferencia (gestion de voces, normalizacion de texto y fonemizacion) para Python y para el asistente OVOS.

Se trata de un modelo acustico VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial en entrenamiento. El resultado es sintesis directa de forma de onda a partir de texto, sin vocoder externo. Es un modelo compacto (el repositorio ocupa 0,1 GB), pensado para inferencia ligera en CPU o GPU modesta.

Su relevancia es acotada pero concreta: cubre la sintesis de voz en catalan (ca-ES) con multiples voces dentro de un stack open source (OVOS/phoonnx), lo que lo hace util para asistentes de voz, lectores de pantalla y aplicaciones de accesibilidad en catalan. La licencia GPL-3.0 condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, encoder + prior variacional + decoder por flujos + discriminador adversarial en entrenamiento) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por caracteres, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo ocupa 0,1 GB, lo que sugiere precision FP32/FP16 sin cuantizacion adicional documentada) |
| Idiomas soportados | catalan (ca-ES) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (graphemes) |
| Voces | multiples hablantes (multi-speaker) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo end-to-end que aprende a mapear secuencias de texto a forma de onda mediante inferencia variacional y entrenamiento adversarial. VITS combina un encoder de texto, un prior variacional condicionado por alineamientos monotonos aprendidos (MAS), un decoder generativo basado en flujos normalizadores y un vocoder integrado, de modo que la salida es directamente audio, sin etapa separada de sintesis. El modelo es multi-hablante, lo que implica un embedding de hablante que condiciona la generacion.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del corpus, el esquema de hablantes ni si se aplicaron tecnicas de RLHF o fine-tuning especifico. El modelo original proviene de Projecte AINA y del ecosistema Coqui TTS; Phoonnx solo realiza el empaquetado a ONNX y la integracion con su pipeline de texto (normalizacion y fonemizacion mediante `scriptconv`, con `GraphemePhonemizer` como front-end). El front-end es, por tanto, basado en grafemas y no en fonemas IPA explicitos.

## Capacidades

- Sintesis de voz en catalan (ca-ES) a partir de texto.
- Soporte multi-hablante: varias voces dentro del mismo modelo.
- Generacion directa de forma de onda (WAV) sin vocoder externo.
- Entrada por caracteres (graphemes), sin necesidad de transcripcion fonetica manual.
- Integracion con el stack OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Uso programatico en Python via `TTSModelManager` y `synthesize_wav`.
- Normalizacion de texto y conversion de script mediante `scriptconv`.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo TTS puro).
- No soporta otros idiomas distintos del catalan.

## Casos de uso

- Asistentes de voz en catalan sobre OVOS: el modelo se selecciona como modulo TTS en `mycroft.conf` y proporciona respuestas habladas en ca-ES con multiples voces, lo que permite asignar timbres distintos a contextos o usuarios.
- Lectores de pantalla y accesibilidad: sintesis local de texto catalan en aplicaciones de escritorio o moviles, con inferencia ligera gracias al tamano reducido del repositorio (0,1 GB) y al formato ONNX.
- Generacion de audiolibros y contenido editorial en catalan: conversion por lotes de articulos o capitulos a WAV mediante el API de Python, con seleccion de hablante para narraciones.
- Locuciones para videojuegos y aplicaciones interactivas: sintesis de dialogos en catalan con varias voces para personajes no jugadores, integrable en pipelines de build.
- Sistemas de anuncios y megafonia en catalan: generacion de avisos pregrabados o dinamicos en entornos publicos (transporte, aeropuertos, comercios) donde se requiere catalan normativo.
- Prototipado de interfaces conversacionales en catalan: evaluacion rapida de UX de voz sin depender de servicios cloud, usando el modelo en local con ONNX.
- Investigacion en TTS de bajos recursos: base para fine-tuning o comparacion de arquitecturas VITS en catalan dentro de estudios academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y la arquitectura VITS, cabe holgadamente en GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 o superior, RTX 3060/4090) es suficiente; tambien ejecutable en CPU.
- Cabe en GPU consumer: si, sin restricciones practicas conocidas.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend subyacente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Voces | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-ca_es-multispeaker | VITS | ca-ES | multi-hablante | ONNX | GPL-3.0 | Hugging Face (31 descargas) |
| projecte-aina/tts-ca-coqui-vits-multispeaker | VITS (Coqui) | ca-ES | multi-hablante | Coqui checkpoint | GPL-3.0 (declarada upstream) | Hugging Face |
| Otros modelos VITS de Phoonnx | VITS | varios | variable | ONNX | variable | Coleccion VITS de Phoonnx |

La comparativa se limita al ecosistema inmediato porque no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial o la integracion en productos propietarios exige cumplir las obligaciones de copyleft de la GPL, lo que puede ser incompatible con productos cerrados.
- Solo soporta catalan (ca-ES); no hay soporte multilingue.
- Modelo TTS puro: no razona, no genera codigo, no usa herramientas ni mantiene conversaciones.
- Riesgo de alucinacion acustica y errores de pronunciacion en palabras fuera de dominio, siglas, numeros o nombres propios, dado el front-end basado en grafemas.
- No se documentan sesgos de hablante, genero o acento en la informacion disponible.
- El modelo original esta empaquetado por un tercero (Phoonnx); la calidad final depende del checkpoint upstream de Projecte AINA.
- El numero de descargas (31) y la ausencia de likes indican una adopcion muy baja; no hay evidencia de validacion en produccion a gran escala.
- No se dispone de informacion sobre latencia, throughput ni calidad subjetiva (MOS) para planificacion de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ca_es-multispeaker
- Modelo upstream (Projecte AINA): https://huggingface.co/projecte-aina/tts-ca-coqui-vits-multispeaker
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
