# Phoonnx/vits-es_419-sorah_neuronal-graphemes

## Resumen

vits-es_419-sorah_neuronal-graphemes es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por HirCoir bajo el identificador upstream `HirCoir/piper-sorah-neuronal` y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo convierte texto en espanol latinoamericano (codigo `es-419`) en audio, tomando caracteres como entrada directa (representacion graphemica, sin fonemizacion previa) y generando la forma de onda correspondiente.

El modelo resuelve el problema de sintesis de voz en espanol neutro latinoamericano dentro del ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin `ovos-tts-plugin-phoonnx` y la libreria `phoonnx`. Su relevancia radica en que ofrece una alternativa ligera y de licencia MIT para asistentes de voz y aplicaciones de lectura en castellano, con un repositorio de apenas 0,1 GB que facilita el despliegue en entornos con recursos limitados.

La informacion disponible sobre el modelo es escasa: no se publican detalles sobre el numero de parametros, la longitud de contexto (concepto poco aplicable a TTS) ni los datos de entrenamiento. El modelo se distribuye en formato ONNX y esta etiquetado con la licencia MIT, lo que permite uso comercial sin restricciones adicionales segun los terminos del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference for Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | espanol latinoamericano (`es-419`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | caracteres (graphemes) |
| Libreria de inferencia | phoonnx |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en normalizing flows y un discriminador adversarial (GAN) para generar formas de onda directamente a partir del texto, sin necesidad de un vocoder separado. El modelo emplea inferencia variacional para modelar la ambiguedad en el alineamiento entre texto y audio, y utiliza un mecanismo de alineamiento monotonico (Monotonic Alignment Search) para aprender la correspondencia entre fonemas o caracteres y frames de audio.

En este caso concreto, la entrada es grapemica: el modelo recibe directamente los caracteres del texto normalizado por `scriptconv` mediante `GraphemePhonemizer`, sin pasar por un fonemizador linguistico. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino. El modelo original fue entrenado por HirCoir y posteriormente empaquetado por Phoonnx para su ejecucion en ONNX.

## Capacidades

- Sintesis de voz en espanol latinoamericano (`es-419`) a partir de texto.
- Entrada grapemica directa: acepta caracteres del texto sin requerir transcripcion fonetica manual.
- Generacion de audio en formato WAV mediante la API de `phoonnx` (`voice.synthesize_wav`).
- Integracion con OVOS como plugin de TTS (`ovos-tts-plugin-phoonnx`), seleccionable via `mycroft.conf`.
- Normalizacion y conversion de texto delegada a `scriptconv` antes de la sintesis.
- Ejecucion en ONNX Runtime, lo que permite despliegue multiplataforma y en CPU.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento (no aplica a un modelo TTS).

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin de TTS en Open Voice OS, permitiendo respuestas habladas en espanol latinoamericano dentro de un asistente domestico o de escritorio, con configuracion directa en `mycroft.conf`.
- Lectura de articulos y notificaciones: dado su tamano reducido (0,1 GB) y ejecucion en ONNX, puede sintetizar texto de forma local en aplicaciones de lectura por voz sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: conversion de contenido textual en audio para lectores de pantalla en espanol latinoamericano, con inferencia local que preserva la privacidad del texto procesado.
- Sistemas de megafonia y anuncios automatizados: generacion de avisos hablados en estaciones, comercios o aeropuertos donde se requiera una voz en espanol neutro latinoamericano con baja latencia.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un TTS ligero y de licencia MIT para validar flujos de voz antes de invertir en modelos de mayor calidad, gracias a la facilidad de instalacion (`pip install --pre phoonnx`).
- Generacion de contenido educativo: sintesis de narraciones para cursos, audiolibros o materiales didactivos en espanol latinoamericano, con la ventaja de la licencia MIT para uso comercial.
- Integracion en dispositivos embebidos: al ejecutarse en ONNX y con un repositorio de 0,1 GB, es viable en hardware con recursos limitados donde otros modelos TTS no caben.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) se estima un consumo de memoria muy bajo, adecuado para CPU.
- GPU recomendadas: no disponible; el modelo esta empaquetado para ONNX, lo que permite ejecucion tanto en CPU como en GPU.
- Compatibilidad con GPU de consumo: probable en cualquier GPU de consumo moderna e incluso en CPU, dado el reducido tamano del modelo, aunque no se confirma en la documentacion.
- Opciones de despliegue: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime como backend de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano |
|---|---|---|---|---|---|
| vits-es_419-sorah_neuronal-graphemes | VITS | es-419 | MIT | ONNX | 0,1 GB |
| HirCoir/piper-sorah-neuronal (upstream) | VITS (Piper) | es-419 | no disponible en la informacion | no disponible | no disponible |
| Otros modelos VITS de la coleccion Phoonnx | VITS | variable | variable | ONNX | variable |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a aspectos de licencia, formato y disponibilidad.

## Limitaciones y advertencias

- La informacion publicada es muy escasa: no se documentan parametros, datos de entrenamiento ni evaluaciones de calidad, lo que dificulta valorar su rendimiento real frente a alternativas.
- Al usar entrada grapemica sin fonemizacion, la pronunciacion de palabras ambiguas, siglas o extranjerismos puede ser incorrecta; la calidad depende de la normalizacion previa de `scriptconv`.
- El modelo esta limitado al espanol latinoamericano (`es-419`); no se garantiza un comportamiento adecuado en otras variantes del espanol ni en otros idiomas.
- Riesgo de alucinacion o artefactos acusticos inherente a los modelos TTS generativos, especialmente en textos largos o con caracteres no previstos.
- No se documentan sesgos de genero, acento o prosodia; la voz concreta del modelo (masculina, femenina, tono) no se especifica en la informacion disponible.
- La licencia MIT permite uso comercial, pero los terminos del release upstream (`HirCoir/piper-sorah-neuronal`) deben verificarse, ya que la model card indica que "the upstream release states its terms".
- El numero de descargas (25) y de likes (0) sugiere una adopcion muy baja, por lo que no hay evidencia de comunidad ni de mantenimiento activo.
- La fecha de creacion indicada (2026-11-14) es posterior a la fecha actual, lo que puede indicar un error en los metadatos del repositorio; conviene verificar la vigencia del modelo antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_419-sorah_neuronal-graphemes
- Modelo upstream: https://huggingface.co/HirCoir/piper-sorah-neuronal
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
