# Phoonnx/vits-et_ee-cv-graphemes

## Resumen

vits-et_ee-cv-graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx para su uso con la libreria ONNX phoonnx. El modelo convierte texto en estonio (et-EE) en audio, partiendo del modelo `tts_models--et--cv--vits` publicado en la release v0.8.0 de Coqui TTS y entrenado con el corpus Common Voice. Su relevancia radica en que proporciona una via de inferencia TTS en formato ONNX para una lengua de bajos recursos como el estonio, integrable en asistentes de voz y en el ecosistema OVOS.

El modelo es de tipo end-to-end: recibe caracteres del texto como entrada (front end basado en grafemas, sin fonemizacion linguistica) y produce directamente la forma de onda. El repositorio ocupa aproximadamente 0,1 GB y la licencia declarada es BSD-3-Clause, lo que facilita su uso comercial. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los datos exactos de entrenamiento mas alla de la referencia a Common Voice.

Su interes practico esta en el despliegue ligero: al estar empaquetado en ONNX y contar con un plugin para OVOS (`ovos-tts-plugin-phoonnx`), puede integrarse en sistemas de asistente de voz sin depender del stack original de Coqui TTS. La contrapartida es un alcance limitado: un unico idioma, una unica voz y una modalidad exclusivamente de sintesis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, Coqui) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | estonio (et-EE) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (grafemas) |
| Dataset de entrenamiento | Common Voice (segun la model card) |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial en entrenamiento, todo dentro de un unico modelo condicional variational autoencoder con alineamiento monotono. Este diseno permite generar audio de forma directa desde texto sin un pipeline separado de alineamiento y vocoder, lo que simplifica el despliegue y reduce la latencia frente a arquitecturas en cascada.

El modelo procede del checkpoint `tts_models--et--cv--vits` de Coqui TTS v0.8.0, entrenado con el corpus Common Voice para estonio. La model card no detalla el numero de tokens, horas de audio ni la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o ajuste fino adicional. El front end de texto es puramente basado en grafemas: Phoonnx delega la normalizacion en scriptconv y utiliza `GraphemePhonemizer`, de modo que el modelo consume caracteres del texto en lugar de una representacion fonetica.

## Capacidades

- Sintesis de voz a partir de texto en estonio (et-EE).
- Generacion de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Front end de grafemas con normalizacion de texto delegada a scriptconv.
- Integracion como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecucion en ONNX, lo que permite despliegue portable sin el stack completo de Coqui TTS.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking.
- Monolingue: unicamente estonio; no hay capacidades multilingues.

## Casos de uso

- Asistentes de voz en estonio: el modelo puede integrarse como motor TTS en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurando la voz `coqui/et-cv-vits` en `mycroft.conf` para responder oralmente a consultas del usuario.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de articulos, noticias o documentos en estonio a audio para usuarios con discapacidad visual, aprovechando la inferencia ONNX y el reducido tamano del repositorio (~0,1 GB).
- Sistemas de navegacion y avisos por voz: generacion de instrucciones habladas en estonio en entornos embebidos, donde el formato ONNX y la ausencia de dependencias pesadas facilitan el despliegue en dispositivos con recursos limitados.
- Audiolibros y podcasts automatizados: sintesis por lotes de texto largo en estonio, dividiendo el contenido en frases y llamando a `synthesize_wav` para cada segmento.
- Prototipado de interfaces conversacionales: generacion rapida de respuestas habladas en pruebas de usabilidad o demos de productos orientados al mercado estonio, sin necesidad de contratar servicios TTS en la nube.
- Localizacion de contenido educativo: conversion de material didactico escrito en estonio a formato audio para plataformas de aprendizaje, manteniendo los datos en infraestructura propia gracias a la licencia BSD-3-Clause.
- Telefonia y sistemas IVR: respuestas de voz pregrabadas de forma dinamica en estonio para centralitas automatizadas, con la ventaja de que el modelo puede ejecutarse localmente y sin coste por caracter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; dado el tamano del repositorio (~0,1 GB), es plausible su ejecucion en CPU, aunque no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el formato ONNX y el reducido tamano sugieren viabilidad en hardware modesto, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python y plugin OVOS `ovos-tts-plugin-phoonnx`); no se documentan otros runners como vLLM, llama.cpp o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-et_ee-cv-graphemes | VITS (Coqui) | et-EE | no disponible | BSD-3-Clause | ONNX | Hugging Face (Phoonnx) |
| Otros modelos VITS de la coleccion Phoonnx | VITS (Coqui) | varios idiomas | no disponible | variable por modelo | ONNX | Hugging Face (coleccion VITS de Phoonnx) |
| Modelos TTS multilingues comerciales | no disponible | multiples | no disponible | propietaria | API/servicio | servicios en la nube |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma (estonio) y, presumiblemente, a una unica voz; no hay variantes de hablante documentadas.
- Front end basado en grafemas: puede producir pronunciaciones incorrectas en palabras con ortografia irregular o prestamos, al no emplear fonemizacion linguistica.
- Riesgo de artefactos y prosodia limitada inherente a modelos VITS entrenados con corpus de dominio general como Common Voice.
- No se documentan sesgos especificos, pero al entrenarse con Common Voice puede heredar desequilibrios de representacion de hablantes del corpus.
- No apta para tareas de razonamiento, codigo, vision ni agentes; es exclusivamente un modelo TTS.
- La licencia BSD-3-Clause permite uso comercial, pero conviene verificar las condiciones del corpus Common Voice y del checkpoint original de Coqui antes de un despliegue en produccion.
- La fecha de creacion del repositorio (2026) y la ausencia de descargas y likes relevantes indican un modelo poco validado por la comunidad; no hay evidencia publica de calidad en produccion.
- No se dispone de informacion sobre cuantizaciones, latencia ni requisitos de hardware, lo que dificulta planificar el despliegue sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-et_ee-cv-graphemes
- Checkpoint original de Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--et--cv--vits.zip
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS empaquetados para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio de Coqui TTS: https://github.com/coqui-ai/TTS
