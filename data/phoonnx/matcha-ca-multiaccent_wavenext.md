# Phoonnx/matcha-ca-multiaccent_wavenext

## Resumen

matcha-ca-multiaccent_wavenext es un modelo de sintesis de voz (text-to-speech) para catalan, empaquetado en formato ONNX para su uso con la libreria phoonnx. El modelo original procede de Projecte AINA, bajo el identificador projecte-aina/matxa-tts-cat-multiaccent, y esta ficha corresponde a una conversion y redistribucion realizada por Phoonnx (TigreGotico). El pipeline declarado es text-to-speech y el unico idioma soportado es el catalan (`ca`).

La arquitectura subyacente es Matcha-TTS, un modelo de sintesis acustica no autorregresivo basado en flow matching, combinado con un vocoder Wavenext ("fused Wavenext", segun las notas de licencia del autor). El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde a un modelo compacto orientado a inferencia eficiente en CPU o GPU de gama baja mediante ONNX Runtime.

La relevancia de esta ficha radica en que ofrece una via sencilla de integrar un TTS catalan de calidad en entornos Python y en el stack OpenVoiceOS (OVOS), con un front-end fonetico basado en espeak-ng y salida directa a WAV. Al tratarse de una redistribucion, las capacidades tecnicas dependen del modelo original de Projecte AINA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (sintesis acustica por flow matching) con vocoder Wavenext |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | catalan (`ca`) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Libreria de inferencia | phoonnx (ONNX Runtime) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Voces declaradas | OpenVoiceOS/matxa-cat-multiaccent-wavenext |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Matcha-TTS, un esquema de sintesis de extremo a extremo que combina un encoder de texto fonetico, un decoder generativo basado en flow matching (modelo de difusion continuo no autorregresivo) y un vocoder neural para convertir las representaciones acusticas en forma de onda. El vocoder empleado en esta variante es Wavenext, en su version "fused" segun las notas de licencia del autor. La entrada de texto no es texto crudo, sino fonemas generados por espeak-ng en alfabeto IPA, lo que implica que la calidad de la sintesis depende directamente de la fonemizacion previa.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre tecnicas de ajuste como RLHF o DPO en la informacion proporcionada. El nombre del modelo original (multiaccent) sugiere que el corpus de Projecte AINA cubre varias variantes de acento del catalan, pero este dato no esta confirmado en la model card disponible. La innovacion tecnica principal de esta distribucion es el empaquetado en ONNX para phoonnx, que permite ejecutar el modelo sin dependencias de frameworks de deep learning pesados, con un front-end de normalizacion y fonemizacion gestionado por la libreria scriptconv.

## Capacidades

- Sintesis de voz en catalan a partir de texto, con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak, con advertencia de posibles discrepancias foneticas).
- Normalizacion de texto y conversion de script delegadas a la libreria scriptconv.
- Integracion con el stack OpenVoiceOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion sobre ONNX Runtime, sin requisito de GPU dedicada.
- Soporte de multiples acentos del catalan segun la denominacion del modelo original (no verificado en detalle).
- No se declaran capacidades de clonacion de voz, control de emociones, vision, audio de entrada ni tool calling.

## Casos de uso

- Asistentes de voz en catalan para OVOS: el modelo se selecciona directamente en `mycroft.conf` mediante el plugin de phoonnx, permitiendo respuestas habladas en catalan en un asistente domestico autoalojado.
- Lectura de contenido web o documentos en catalan: integracion en pipelines Python que reciben texto, lo normalizan con scriptconv y generan audio WAV para podcasts, boletines o resumenes hablados.
- Sistemas de accesibilidad: conversion de texto a voz para personas con discapacidad visual en aplicaciones catalanoparlantes, con despliegue local sin dependencia de servicios en la nube.
- Locucion automatizada de contenidos corporativos o institucionales: generacion de avisos, megafonia o mensajes de atencion telefonica en catalan con voces de distintos acentos.
- Prototipado de interfaces conversacionales: evaluacion rapida de experiencias de voz en catalan en entornos de desarrollo gracias al bajo peso del repositorio (0,1 GB) y a la inferencia ONNX.
- Investigacion en sintesis de voz: uso como linea base Matcha-TTS para comparativas de calidad, prosodia o acentos en catalan, al ser una redistribucion del modelo de Projecte AINA.
- Generacion de audiolibros o material didactico en catalan: sintesis por lotes de fragmentos de texto con salida WAV para su posterior postprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo ONNX de aproximadamente 0,1 GB, es previsible que quepa en memoria de sistemas de gama baja, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo esta disenado para ejecutarse via ONNX Runtime, lo que permite inferencia en CPU.
- Opciones de despliegue: phoonnx (Python) y plugin `ovos-tts-plugin-phoonnx` para OpenVoiceOS. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponible.
- Dependencias de sistema: espeak-ng instalado (por ejemplo `apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/matcha-ca-multiaccent_wavenext | Catalan | Matcha-TTS + Wavenext | ONNX | GPL-3.0 | Hugging Face (28 descargas) |
| projecte-aina/matxa-tts-cat-multiaccent | Catalan | Matcha-TTS | no disponible en esta ficha | GPL-3.0 (segun upstream) | Hugging Face |
| Otros modelos Matcha-TTS empaquetados por Phoonnx (coleccion) | Segun modelo | Matcha-TTS | ONNX | Segun modelo | Hugging Face (coleccion Phoonnx) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: el uso comercial o la integracion en productos propietarios exige cumplir las obligaciones de copyleft de la GPL, lo que puede ser un obstaculo para determinados despliegues en produccion.
- Modelo exclusivamente en catalan: no soporta otros idiomas.
- Dependencia de espeak-ng para la fonemizacion: sin espeak-ng instalado, el uso del port espyak puede producir fonemas distintos y pronunciaciones erroneas de algunas palabras.
- Entrada basada en fonemas IPA: textos con simbolos, cifras o abreviaturas requieren una normalizacion previa correcta por parte de scriptconv; fallos en esa etapa degradan la sintesis.
- Riesgo de alucinacion acustica: en modelos TTS generativos por flow matching pueden aparecer artefactos, repeticiones o prosodia incorrecta en textos largos o atipicos, aunque no se documenta explicitamente en la informacion disponible.
- Sesgos de acento y dominio: el comportamiento en acentos no representados en el corpus original de Projecte AINA no esta documentado.
- Redistribucion de terceros: esta ficha es un empaquetado por Phoonnx; cambios de licencia o condiciones del modelo original deben verificarse en el repositorio upstream.
- Ausencia de benchmarks publicos: no hay evidencia cuantitativa de calidad (MOS, WER) en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/matcha-ca-multiaccent_wavenext
- Modelo original (Projecte AINA): https://huggingface.co/projecte-aina/matxa-tts-cat-multiaccent
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Matcha-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/matcha-tts-6af8ea8f6a5b1af4d985d2ad
