# Phoonnx/vits-en-wasmdashai-v1-graphemes

## Resumen

`vits-en-wasmdashai-v1-graphemes` es un modelo de sintesis de voz (text-to-speech) en ingles basado en la arquitectura VITS, publicado por el usuario Phoonnx como empaquetado ONNX del modelo original `wasmdashai/vits-en-v1`. No se trata de un modelo entrenado por Phoonnx, sino de una redistribucion optimizada para su libreria de inferencia `phoonnx`, que permite ejecutar TTS en Python y en el asistente de voz OVOS sin depender de frameworks pesados.

El modelo resuelve la conversion de texto a audio en ingles mediante un front-end de grafemas: el texto se normaliza y se convierte directamente en caracteres de entrada, sin pasar por un fonemizador basado en reglas linguisticas complejas. Esto simplifica el pipeline y reduce la dependencia de diccionarios foneticos, a costa de una menor precision en palabras irregulares del ingles.

Es relevante para desarrolladores que necesitan un motor TTS ligero, con licencia MIT, formato ONNX y un tamano de repositorio de 0,1 GB, integrable en asistentes de voz de bajos recursos. La informacion publica disponible es escasa: no se detallan parametros, contexto (no aplica a TTS), datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible; el modelo se distribuye en formato ONNX |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un generador adversarial condicional de extremo a extremo que combina un encoder de texto, un prior normalizing flow, un decoder generativo y un discriminador multi-periodo durante el entrenamiento. VITS produce audio de forma directa a partir de la secuencia de entrada, sin vocoder separado, lo que explica su huella reducida y su latencia baja en inferencia.

El autor original es wasmdashai (modelo `wasmdashai/vits-en-v1`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni las horas de audio empleadas. La version empaquetada por Phoonnx incorpora un front-end de grafemas (`GraphemePhonemizer` de `scriptconv`), que normaliza el texto y lo convierte en caracteres sin fonemizacion basada en reglas. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, attention linear, etc.).

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida en formato WAV.
- Entrada basada en grafemas: acepta texto normalizado y lo convierte directamente en caracteres, sin fonemizacion linguistica.
- Integracion con la libreria `phoonnx` para inferencia en Python.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Seleccion de voz mediante el identificador `hf_community/wasmdashai/vits-en-v1`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.

## Casos de uso

- Asistentes de voz domoticos: el modelo se integra en OVOS como modulo TTS y permite respuestas habladas en ingles dentro de un asistente local, con un repositorio de 0,1 GB que cabe en dispositivos de bajos recursos.
- Lectura de notificaciones y alertas: sintesis de mensajes cortos en ingles para sistemas de monitorizacion o domotica, con latencia baja gracias al pipeline ONNX y a la ausencia de vocoder separado.
- Accesibilidad: conversion de texto a audio para personas con discapacidad visual en aplicaciones de escritorio o web que necesitan un TTS ligero con licencia MIT.
- Prototipado rapido de interfaces conversacionales: instalacion via `pip install --pre phoonnx` y sintesis directa con `synthesize_wav`, adecuado para validar flujos de voz antes de invertir en modelos mayores.
- Generacion de audio para contenido educativo o podcasts automatizados en ingles, donde la licencia MIT permite uso comercial sin restricciones de atribucion adicionales.
- Sistemas embebidos y edge computing: al distribuirse en ONNX y con un tamano de 0,1 GB, puede desplegarse en entornos con recursos limitados donde modelos TTS de mayor tamano no caben.
- Pruebas de regresion de pipelines TTS: util como voz de referencia en tests automatizados de integracion con `phoonnx` y `scriptconv`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0,1 GB) se espera un consumo muy bajo, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no se documenta; el formato ONNX sugiere ejecucion en CPU y en GPU de gama baja, pero sin datos oficiales.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en-wasmdashai-v1-graphemes | VITS | en | MIT | ONNX | 0,1 GB | Front-end de grafemas, empaquetado para phoonnx |
| wasmdashai/vits-en-v1 | VITS | en | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo upstream del que deriva esta version |
| Otros modelos VITS de la coleccion Phoonnx | VITS | variable | variable | ONNX | variable | Coleccion disponible en Hugging Face; no se detallan especificaciones individuales |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no se documentan otros idiomas.
- El front-end de grafemas puede pronunciar de forma incorrecta palabras irregulares del ingles al no usar fonemizacion basada en reglas o diccionarios.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento original ni sobre calidad en acentos o dialectos.
- Riesgo de alucinacion acustica: como todo modelo TTS generativo, puede producir artefactos o prosodia incorrecta en textos largos o poco habituales.
- No se documentan limites de longitud de texto de entrada; conviene dividir entradas largas en frases.
- La licencia MIT permite uso comercial, pero se recomienda verificar los terminos del modelo upstream `wasmdashai/vits-en-v1`, cuyos terminos exactos no se detallan en la informacion disponible.
- La libreria `phoonnx` se instala con `pip install --pre`, lo que indica una version preliminar; conviene validar estabilidad antes de produccion.
- El modelo tiene 23 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en-wasmdashai-v1-graphemes
- Modelo upstream: https://huggingface.co/wasmdashai/vits-en-v1
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
