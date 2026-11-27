# 132262b/supertonic-2-onnx-web

## Resumen

Supertonic 2 ONNX Web es una distribucion cuantizada del modelo de sintesis de voz Supertonic 2 de Supertone, Inc., empaquetada especificamente para inferencia en navegador mediante ONNX Runtime Web. El autor de esta conversión (132262b) ha aplicado cuantizacion weight-only de int8 (simetrica, por canal de salida) sobre las capas Conv, MatMul y Gather del modelo original, manteniendo las activaciones en fp32 y preservando en fp32 las seis capas del vocoder mas sensibles a la cuantizacion.

El resultado es una reduccion del peso total de 262,8 MB a 80,6 MB (aproximadamente un 69 % menos), sin cambios en la estructura del grafo, las entradas y salidas, ni los ficheros auxiliares (`tts.json`, `unicode_indexer.json`, `voice_styles/`), lo que lo convierte en un reemplazo directo del repositorio base. La motivacion principal es habilitar TTS de calidad en el cliente sin servidor, con un factor de tiempo real de 0,28 en onnxruntime-web 1.30 sobre Apple M1 Pro (WASM, un hilo, 5 pasos de denoising).

Es relevante ahora porque demuestra que la cuantizacion weight-only con `DequantizeLinear` plegada en tiempo de creacion de sesion permite conservar la velocidad del modelo fp32 original mientras se reduce drasticamente el tamano de descarga, un compromiso atractivo para aplicaciones web con requisitos estrictos de ancho de banda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de sintesis de voz; componentes: duration_predictor, text_encoder, vector_estimator y vocoder en ONNX) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Int8 weight-only (simetrica, por canal de salida) con `DequantizeLinear`; capas del vocoder sensibles en fp32; activaciones en fp32 |
| Idiomas soportados | No disponible en la informacion proporcionada (la model card menciona mediciones de calidad en coreano) |
| Licencia | BigScience OpenRAIL-M (heredada del modelo base) |
| Formato de pesos | ONNX (cuatro ficheros: `duration_predictor.onnx`, `text_encoder.onnx`, `vector_estimator.onnx`, `vocoder.onnx`) |
| Tamano del repositorio | 0,1 GB (80,6 MB de pesos) |
| Modelo base | Supertone/supertonic-2 (commit `75e6727618a02f323c720cba9478152d4bc16ca4`) |
| Runtime objetivo | ONNX Runtime Web (WASM) |

## Arquitectura y entrenamiento

Esta distribucion no reentrena el modelo: es una conversion derivada del checkpoint Supertonic 2 de Supertone, descrito en el paper arXiv:2503.23108. La arquitectura original no se detalla en la informacion disponible mas alla de la descomposicion en cuatro subgrafos ONNX: un predictor de duracion, un codificador de texto, un estimador de vectores (denoising) y un vocoder. El proceso de sintesis emplea un esquema iterativo de denoising con un numero configurable de pasos (3 o 5 en las mediciones publicadas).

La innovacion tecnica de este repositorio es el esquema de cuantizacion: los pesos de Conv, MatMul y Gather se almacenan como int8 simetrico por canal de salida y se restauran mediante `DequantizeLinear`, mientras que las activaciones permanecen en fp32. Se excluyen de la cuantizacion las seis capas del vocoder mas sensibles, segun el plan definido en `tools/precision_plan.json`. Con `session.disable_quant_qdq = "1"`, ONNX Runtime pliega la desquantizacion en pesos fp32 al crear la sesion, de modo que la inferencia corre a la misma velocidad que el modelo base. El script de reproduccion es `python tools/weight_quantize.py <supertonic-2 dir> <out_dir> --plan tools/precision_plan.json`.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto, con estilos de voz predefinidos en `voice_styles/`.
- Inferencia completamente en el navegador mediante ONNX Runtime Web (WASM), sin backend.
- Control del numero de pasos de denoising (3 o 5) para ajustar latencia y calidad.
- Prediccion de duracion explicita mediante subgrafo dedicado (`duration_predictor`).
- Reemplazo directo del modelo base: misma interfaz de entradas y salidas, mismos ficheros de configuracion.
- Soporte multilingue: no disponible en la informacion proporcionada (las metricas de calidad se midieron en coreano).
- Tool calling, agentes, vision, audio de entrada, modo thinking: no disponibles (modelo exclusivamente TTS).

## Casos de uso

- Lectura por voz en aplicaciones web sin backend: el modelo se ejecuta en el navegador con ONNX Runtime Web, eliminando costes de servidor y latencia de red; los 80,6 MB de descarga son asumibles en una primera carga cacheada.
- Accesibilidad en sitios publicos: conversion de articulos o contenido dinamico a audio para usuarios con discapacidad visual, con la ventaja de que el texto no sale del dispositivo del usuario.
- Asistentes conversacionales embebidos: integracion del vocoder y el estimador de vectores en un pipeline de chat en el cliente, usando los estilos de voz de `voice_styles/` para personalizar la locucion.
- Prototipado rapido de interfaces de voz: al ser un reemplazo directo del repositorio base, permite comparar calidad y latencia frente a fp32 sin cambiar el codigo de integracion.
- Aplicaciones offline o de baja conectividad: una vez descargado el modelo, la sintesis funciona sin conexion, util en PWAs y entornos con red intermitente.
- Generacion de narracion en herramientas de creacion de contenido (presentaciones, videos cortos) dentro del navegador, ajustando los pasos de denoising a 3 para minimizar latencia cuando la calidad no es critica.
- Educacion y aprendizaje de idiomas: reproduccion de frases con voces consistentes en el cliente, sin enviar texto del alumno a servidores externos.

## Benchmarks y rendimiento

Metricas de calidad publicadas por el autor (coreano, mismas entradas que el modelo base):

| Metrica | Valor |
|---|---|
| SNR del vocoder frente al base (mismo latente) | 32,0 dB |
| Distancia log-espectral del vocoder frente al base | 1,1 dB |
| Error relativo del `vector_estimator` en un paso | 0,7 % |
| Factor de tiempo real (onnxruntime-web 1.30, WASM, 1 hilo, Apple M1 Pro, 5 pasos) | 0,28 |
| Factor de tiempo real (mismas condiciones, 3 pasos) | 0,21 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por tratarse de un modelo TTS.

## Requisitos de hardware

- Inferencia en navegador via WASM: no requiere GPU; funciona en CPU con ONNX Runtime Web.
- Memoria: el modelo ocupa 80,6 MB en disco; con el plegado de desquantizacion a fp32 al crear la sesion, el consumo en memoria se aproxima al del modelo base (262,8 MB de pesos fp32), por lo que conviene reservar al menos 300-500 MB de heap para el runtime y los buffers intermedios.
- GPU dedicadas: no se documenta aceleracion por GPU en esta distribucion; el runtime objetivo es WASM.
- Cabe en cualquier equipo consumer: las mediciones se realizaron en un Apple M1 Pro con un solo hilo.
- Opciones de despliegue: ONNX Runtime Web 1.30 o superior; el modelo base puede desplegarse con otros runtimes ONNX, pero esta version esta optimizada para el navegador.
- Throughput: factor de tiempo real de 0,28 (5 pasos) y 0,21 (3 pasos) en las condiciones medidas; es decir, sintesis mas rapida que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 132262b/supertonic-2-onnx-web | No disponible | No disponible | OpenRAIL-M | ONNX int8 weight-only (80,6 MB) | Objetivo: navegador via WASM |
| Supertone/supertonic-2 (base) | No disponible | No disponible | OpenRAIL-M | ONNX fp32 (262,8 MB) | Referencia de calidad; mismas interfaces |
| Otros modelos TTS open source | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia BigScience OpenRAIL-M impone restricciones de uso basadas en el proposito; esas restricciones se heredan a este derivado y a cualquier uso posterior. Revisar `LICENSE` antes de un despliegue comercial.
- El modelo solo genera voz; no procesa audio de entrada ni texto complejo mas alla de lo que soporte el codificador de texto original.
- Calidad medida unicamente en coreano; el comportamiento en otros idiomas no esta documentado en la informacion disponible.
- La cuantizacion introduce una degradacion medible aunque pequena (SNR de 32 dB, error relativo del 0,7 % en un paso); en voces o estilos no evaluados el impacto podria ser mayor.
- Las seis capas del vocoder en fp32 elevan el consumo de memoria respecto al tamano en disco; el ahorro es de ancho de banda de descarga, no necesariamente de RAM en ejecucion.
- Riesgo de alucinacion acustica o artefactos en entradas atipicas (texto muy largo, caracteres no soportados, ruido en la normalizacion); no se documentan mecanismos de mitigacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion independiente.
- No se dispone de informacion sobre sesgos de voz (genero, acento, edad) ni sobre el conjunto de entrenamiento original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/132262b/supertonic-2-onnx-web
- Modelo base: https://huggingface.co/Supertone/supertonic-2
- Paper: https://arxiv.org/abs/2503.23108
