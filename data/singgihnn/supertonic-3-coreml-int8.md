# singgihnn/supertonic-3-coreml-int8

## Resumen

Supertonic 3 Core ML int8 es un conjunto de artefactos derivados del modelo de sintesis de voz Supertone/supertonic-3, publicados por el usuario singgihnn para su aplicacion Listen al-Gaib. No se trata de un modelo autonomo: incluye unicamente dos componentes del pipeline TTS (el estimador de vectores y el vocoder) en formatos optimizados para despliegue en dispositivos Apple y Android. El codigo fuente de la conversion esta disponible en el repositorio de la aplicacion.

La relevancia de esta publicacion es practica: ofrece una ruta de despliegue de TTS en el Neural Engine de Apple (Core ML, fp16, iOS 18+) y una variante ONNX con pesos int8 para CPU en Android e iOS 16-17. Segun el autor, la velocidad del estimador de vectores mas el vocoder alcanza entre 55 y 90 veces tiempo real en el Neural Engine de un Apple M4, y entre 10 y 11 veces en CPU con int8, frente a 3-5 veces en fp32.

El repositorio ocupa 0,3 GB y no incluye el predictor de duracion ni el codificador de texto, que deben obtenerse de los ficheros ONNX originales de Supertonic 3. La licencia es OpenRAIL-M (BigScience), con las restricciones de uso heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base TTS; se distribuyen estimador de vectores y vocoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (Core ML) e int8 per-channel QInt8 (ONNX, solo pesos MatMul) |
| Idiomas soportados | no disponible |
| Licencia | openrail (OpenRAIL-M, BigScience) |
| Formato de pesos | `.mlmodelc` (Core ML compilado) y `.onnx` (ONNX Runtime) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre los datos de entrenamiento del modelo base Supertone/supertonic-3 en la informacion proporcionada. Lo que si se documenta es el proceso de derivacion de estos artefactos. Para Core ML, la conversion sigue la ruta ONNX → onnx2torch → `jit.trace` → coremltools 8.3, generando un ML Program en fp16 con target iOS 18 y compilado a `.mlmodelc`. Se generan dos modelos multifuncion (estimador de vectores y vocoder), cada uno con seis buckets de forma que cubren combinaciones de ids de texto y frames latentes: 64×32, 128×64, 256×128, 384×256, 512×384 y 512×512, compartiendo pesos entre buckets.

Para la variante int8 se emplea `onnxruntime.quantization.quantize_dynamic` con cuantizacion QInt8 per-channel, aplicada unicamente a los pesos de las MatMul. Las convoluciones 1×1 se reescriben como MatMul, lo que segun el autor es matematicamente equivalente. El vocoder se mantiene en float32 en la ruta de CPU porque la cuantizacion int8 introduce ruido audible. Un detalle tecnico destacable es el relleno de frames latentes antes de cada uno de los 28 edge pads del estimador de vectores: los frames rellenados se sustituyen por el ultimo frame real, de modo que la salida por buckets coincide con la salida sin relleno. La conversion parte de la revision `3cadd1ee6394adea1bd021217a0e650ede09a323` del modelo base.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, mediante el pipeline completo de Supertonic 3 (codificador de texto y predictor de duracion del modelo base, mas estimador de vectores y vocoder de este repositorio).
- Inferencia acelerada en el Neural Engine de Apple mediante Core ML fp16 (iOS 18+).
- Inferencia en CPU mediante ONNX Runtime con pesos int8, orientada a Android e iOS 16-17.
- Soporte de seis resoluciones de entrada por buckets de forma, lo que permite procesar distintas longitudes de texto y numero de frames latentes sin recompilar.
- Verificacion de integridad: los tamanos y hashes SHA-256 de cada fichero estan listados en `coreml.json` e `int8.json` de la aplicacion, que los comprueba tras la descarga.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Lectura por voz en aplicaciones iOS: integracion del `.mlmodelc` en apps iOS 18+ para sintetizar texto en el Neural Engine, con velocidades de 55-90× tiempo real en hardware Apple M4 segun el autor.
- Lectura por voz en Android y dispositivos iOS antiguos: uso del estimador de vectores ONNX int8 junto con el vocoder en float32 sobre ONNX Runtime, con 10-11× tiempo real en CPU.
- Asistentes de accesibilidad: conversion de texto a voz en el dispositivo para usuarios con discapacidad visual, sin depender de servicios en la nube y con verificacion de integridad de los ficheros descargados.
- Aplicaciones de lectura de noticias o libros: sintesis de parrafos largos aprovechando los buckets de hasta 512×512 frames, con salida equivalente a la version sin relleno.
- Sistemas de navegacion o avisos por voz: generacion de locuciones cortas con baja latencia en el dispositivo, evitando el envio de texto a servidores externos.
- Prototipado y evaluacion de TTS en movil: comparacion de la calidad y velocidad entre la ruta Core ML y la ruta ONNX int8 usando el WER como metrica objetiva.
- Distribucion de artefactos con integridad verificable: empaquetado de los ficheros junto con sus hashes SHA-256 para que la aplicacion cliente valide la descarga antes de usarlos.

## Benchmarks y rendimiento

Calidad medida por el autor con la tasa de error de palabras (WER) de Whisper `base.en` sobre 10 frases con 2 semillas de ruido:

| Ruta | WER | Longitud del habla vs fp32 |
|---|---|---|
| ONNX fp32 | 0,8 % | referencia |
| ONNX int8 | 0,5 % | dentro del 1 % |
| Core ML | 0,5 % | dentro del 1 % |

Velocidad del estimador de vectores mas el vocoder en un Apple M4, segun el autor:

| Ruta | Velocidad (× tiempo real) |
|---|---|
| fp32 en CPU | 3-5× |
| int8 en CPU | 10-11× |
| Core ML en Neural Engine | 55-90× |

El autor indica que no se ha medido el rendimiento en telefono. No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo TTS y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica de forma directa; el repo ocupa 0,3 GB y los ficheros individuales pesan aproximadamente 211 MB (Core ML) y 63 MB (ONNX int8).
- Core ML: requiere iOS 18+ y hardware con Neural Engine; el autor reporta 55-90× tiempo real en un Apple M4.
- ONNX int8: CPU en Android e iOS 16-17; 10-11× tiempo real en Apple M4.
- ONNX fp32: CPU; 3-5× tiempo real en Apple M4.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte ni rendimiento en la informacion disponible.
- Despliegue: Core ML (`.mlmodelc`) y ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput en telefono: no medidos segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| singgihnn/supertonic-3-coreml-int8 | no disponible | no disponible | Core ML, ONNX int8 | openrail | Hugging Face, 0 descargas |
| Supertone/supertonic-3 (base) | no disponible | no disponible | ONNX (codificador de texto, predictor de duracion, estimador de vectores, vocoder) | openrail | Hugging Face |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos TTS comparables en la documentacion proporcionada, por lo que la comparativa se limita al modelo base del que derivan estos artefactos.

## Limitaciones y advertencias

- No es un modelo autonomo: faltan el codificador de texto y el predictor de duracion, que deben tomarse de los ficheros ONNX de Supertone/supertonic-3.
- La licencia OpenRAIL-M incluye restricciones de uso que se heredan; es necesario revisar el fichero `LICENSE` antes de un uso comercial.
- El vocoder no debe cuantizarse a int8 en CPU: segun el autor, introduce ruido audible.
- Los benchmarks de velocidad se han medido en un Apple M4; no hay datos en telefonos ni en GPU dedicadas.
- La evaluacion de calidad se basa en Whisper `base.en` sobre 10 frases, una muestra reducida y solo en ingles.
- No se documentan idiomas soportados, sesgos ni tasas de alucinacion del modelo base en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-11-01; se trata de artefactos derivados de una aplicacion concreta, sin validacion independiente conocida.
- La integridad de los ficheros depende de los hashes publicados en la aplicacion (`coreml.json` e `int8.json`), no de verificaciones del propio repositorio de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/singgihnn/supertonic-3-coreml-int8
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Scripts de conversion: `scripts/coreml/` y `scripts/int8/` en el repositorio de la aplicacion Listen al-Gaib (no se proporciona URL directa en la informacion disponible).
