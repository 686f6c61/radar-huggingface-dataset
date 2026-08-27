# iwillsolvehardestproblem/wav2vec2-xlsr-53-espeak-cv-ft-onnx

## Resumen

Este modelo es una exportación a ONNX del reconocedor de fonemas multilingüe `facebook/wav2vec2-xlsr-53-espeak-cv-ft`, realizada por el usuario `iwillsolvehardestproblem` con el objetivo de ejecutar inferencia en CPU sin dependencias de PyTorch ni GPU. El modelo original, desarrollado por Facebook, combina el preentrenamiento auto-supervisado XLSR-53 (wav2vec 2.0) con un ajuste fino en el dataset CommonVoice para predecir etiquetas fonéticas del vocabulario eSpeak mediante una cabecera CTC. Esta versión ONNX mantiene los mismos pesos y permite decodificar audio de 16 kHz en fonemas a varias veces la velocidad en tiempo real en un portátil, lo que lo hace adecuado para aplicaciones de puntuación de pronunciación en entornos de producción con restricciones de hardware.

La conversión no es trivial: el autor documenta dos trampas técnicas que afectan a la precisión (decodificación de ventanas cortas aisladas y cuantización dinámica por defecto) y proporciona código de ejemplo y benchmarks medidos sobre audio real de telefonía. El repositorio incluye dos variantes: `model.fp32.onnx` (1,26 GB) y `model.int8.onnx` (355 MB, cuantización restringida a MatMul), junto con un `vocab.json` para la decodificación CTC. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer) con cabecera CTC para fonemas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada; procesa audio de 16 kHz, con ventanas de hasta ~30 s en una sola pasada y chunking para audio mas largo |
| Tipos de cuantizacion | fp32 (1,26 GB) e int8 dinamico MatMul-only (355 MB) |
| Idiomas soportados | multilingue (idiomas concretos no listados; el modelo base fue ajustado en CommonVoice multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo base `wav2vec2-xlsr-53-espeak-cv-ft` se construye sobre la arquitectura wav2vec2-large-XLSR-53, un transformer preentrenado de forma auto-supervisada en 128 idiomas y aproximadamente 436 000 horas de audio sin etiquetar (segun la documentacion de fairseq). Posteriormente se realizo un ajuste fino en el dataset CommonVoice para reconocer etiquetas foneticas del vocabulario eSpeak, anadiendo una cabecera de clasificacion CTC. La exportacion a ONNX conserva exactamente los mismos pesos y la misma topologia, pero elimina la dependencia de PyTorch, permitiendo la inferencia con onnxruntime o la crate Rust `ort`.

El autor de la exportacion documenta dos problemas tecnicos relevantes. Primero, wav2vec2 es un transformer cuyo resultado por frame depende del contexto circundante; decodificar ventanas de audio cortas de forma aislada corrompe aproximadamente el 50 % de los fonemas. La solucion consiste en decodificar el audio completo en chunks con margenes de contexto y luego extraer los frames correspondientes a cada ventana. Segundo, la cuantizacion dinamica por defecto de onnxruntime corrompe alrededor del 20 % de los fonemas; restringir la cuantizacion a operaciones MatMul reduce la deriva media al 4,3 %. No se menciona el uso de RLHF ni DPO, ya que se trata de un modelo de reconocimiento de fonemas, no de generacion de texto.

## Capacidades

- Reconocimiento de fonemas multilingue: transcribe audio de 16 kHz a secuencias de fonemas del vocabulario eSpeak (p. ej. `h ə l oʊ w ɜː l d`).
- Puntuacion de pronunciacion: permite comparar la salida fonetica con una referencia para evaluar la calidad de la pronunciacion.
- Inferencia en CPU: funciona con onnxruntime sin GPU, a aproximadamente 9x tiempo real en un procesador Apple M-series con 4 hilos.
- Decodificacion CTC: incluye un `vocab.json` con el mapeo de ids a fonemas y el id de blank para el decode.
- Procesamiento de audio largo: mediante la funcion `decode_full` proporcionada, se pueden procesar minutos de audio con complejidad casi lineal, evitando el comportamiento cuadratico de una sola pasada.
- Compatibilidad multiplataforma: al ser ONNX, puede integrarse en aplicaciones Python, Rust, C++ u otros entornos que soporten onnxruntime.

## Casos de uso

- Puntuacion de pronunciacion en call centers: el modelo puede analizar grabaciones de telemarketing para evaluar la claridad de la pronunciacion de los agentes, sustituyendo un despliegue en GPU por una solucion en CPU. Su velocidad (~9x tiempo real) permite procesar grandes volumenes de audio sin coste de GPU.
- Analisis de audio de llamadas para control de calidad: transcripcion fonetica de conversaciones para detectar patrones de habla, sin necesidad de transcripcion textual completa.
- Herramientas de aprendizaje de idiomas: aplicaciones que corrigen la pronunciacion de estudiantes comparando la salida fonetica con la referencia esperada, ejecutandose localmente en dispositivos sin GPU.
- Transcripcion fonetica para investigacion linguistica: conversion de grabaciones de campo a notacion fonetica estandar, util para estudios de dialectos o fonologia.
- Evaluacion de pronunciacion en sistemas de teleeducacion: integracion en plataformas de ensenanza de idiomas para dar retroalimentacion automatica sobre la articulacion.
- Pipeline de procesamiento de audio en entornos con restricciones de memoria: la variante int8 (355 MB) permite desplegar el modelo en servidores o dispositivos con poca RAM, manteniendo una deriva media del 4,3 % respecto a fp32.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre audio real de telefonia, comparando las variantes ONNX con la implementacion torch original:

| Variante | Deriva de fonemas vs torch fp32 | Velocidad (CPU M-series, 4 hilos) |
|---|---|---|
| fp32 ONNX | byte-identico en ventanas de 2-6 s | ~9x tiempo real |
| int8 MatMul-only | 4,3 % media (max 9,5 %) | ~9x tiempo real, sin ganancia |
| int8 op set por defecto | ~20 % de fonemas corruptos | no usable |

Ademas, en una comparacion con el despliegue torch de produccion sobre palabras puntuadas de una llamada real, el 75 % de las palabras se decodificaron identicamente y las decisiones de flag de pronunciacion coincidieron en 27-28 de 32 palabras. El autor atribuye la diferencia a cambios de argmax en frames acusticamente ambiguos, equivalentes al ruido entre dos runtimes del mismo modelo.

## Requisitos de hardware

- CPU: funciona en cualquier procesador x86_64 o ARM con soporte de onnxruntime; probado en Apple M-series con 4 hilos.
- RAM: ~1,3 GB para la variante fp32, ~400 MB para la int8.
- GPU: no necesaria; el modelo esta disenado para CPU.
- Velocidad: ~9x tiempo real en M-series con 4 hilos para fp32; int8 no ofrece ganancia de velocidad en Apple Silicon (limitado por ancho de banda de memoria).
- Despliegue: onnxruntime (Python o Rust `ort`), tambien compatible con otros runtimes ONNX.
- Para audio de mas de ~30 s se recomienda usar la funcion `decode_full` con chunking para evitar la complejidad cuadratica.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `facebook/wav2vec2-xlsr-53-espeak-cv-ft` (original) | PyTorch | no disponible | no especificado | Apache-2.0 | Requiere GPU o PyTorch; referencia para comparacion de precision |
| `iwillsolvehardestproblem/wav2vec2-xlsr-53-espeak-cv-ft-onnx` (este modelo) | ONNX | no disponible | no especificado | Apache-2.0 | Exportacion para CPU, con variantes fp32 e int8 |
| `qnighy/wav2vec2-xlsr-53-espeak-cv-ft-ONNX` | ONNX | no disponible | no especificado | Apache-2.0 | Otra exportacion ONNX del mismo modelo base, sin benchmarks publicados |

No se dispone de datos de rendimiento comparativos entre estas exportaciones; la unica referencia fiable es la proporcionada por el autor de este repositorio frente a la implementacion torch original.

## Limitaciones y advertencias

- No decodificar ventanas cortas de audio de forma aislada: el modelo depende del contexto circundante; hacerlo corrompe aproximadamente el 50 % de los fonemas. Es imprescindible decodificar el audio completo y luego extraer los frames.
- La cuantizacion dinamica por defecto de onnxruntime corrompe el modelo (~20 % de fonemas). Solo es segura la cuantizacion restringida a operaciones MatMul, con una deriva media del 4,3 %.
- El modelo puede producir fonemas erroneos en audio acusticamente ambiguo; la comparacion con torch muestra un 25 % de palabras con diferencias de decodificacion.
- No se especifican los idiomas exactos soportados, aunque el modelo base fue ajustado en CommonVoice multilingue.
- Para audio de larga duracion, una sola pasada es cuadratica en el numero de frames y resulta mas lenta que el tiempo real; se requiere el chunking con margenes.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion; se recomienda validar con audio real del dominio de aplicacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/iwillsolvehardestproblem/wav2vec2-xlsr-53-espeak-cv-ft-onnx
- Modelo base de Facebook: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Documentacion de XLSR en fairseq: https://github.com/facebookresearch/fairseq/blob/main/examples/wav2vec/xlsr/README.md
- Otra exportacion ONNX del mismo modelo: https://huggingface.co/qnighy/wav2vec2-xlsr-53-espeak-cv-ft-ONNX
