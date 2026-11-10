# minigu5/hwip-formulanet

## Resumen

hwip-formulanet es un modelo de reconocimiento de formulas matematicas en imagenes (image-to-text) que convierte capturas de ecuaciones en codigo LaTeX. Lo publica el usuario minigu5 como parte del proyecto Hwip, un chatbot de IA, y deriva de alephpi/FormulaNet, que a su vez se basa en PP-FormulaNet-S con unos 20 millones de parametros. El modelo se distribuye en formato ONNX para ejecutarse en el navegador mediante transformers.js v3, lo que permite integrar OCR matematico en aplicaciones web sin backend.

El modelo resuelve un problema concreto: la transcripcion fiable de formulas presentes en capturas de pantalla de chats, matrices, entornos `cases` y modos oscuros, escenarios que los modelos genericos de OCR matematico suelen fallar. Para ello se ha afinado sobre 200.000 muestras (100.000 de UniMER-1M regeneradas y 100.000 sinteticas con KaTeX y MathJax) y se han comprimido los pesos a int8, reduciendo el tamano de 80 MB a 20 MB manteniendo el calculo en fp32.

La relevancia actual del modelo es acotada pero clara: ocupa el nicho de OCR matematico ligero y ejecutable en cliente, con licencia AGPL-3.0 heredada del modelo base. No es un modelo de proposito general, sino un componente especializado para pipelines de digitalizacion de contenido cientifico en la web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (base PP-FormulaNet-S) |
| Parametros totales | ~20 M (segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de secuencia de salida LaTeX, no conversacional) |
| Tipos de cuantizacion | int8 en pesos; calculo en fp32 |
| Idiomas soportados | no disponible (la salida es LaTeX, independiente del idioma natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (transformers.js), safetensors no disponible |

## Arquitectura y entrenamiento

La arquitectura es un vision-encoder-decoder clasico orientado a image-to-text: un codificador visual procesa la imagen de la formula y un decodificador genera la secuencia LaTeX correspondiente. El modelo base es PP-FormulaNet-S (unos 20 M de parametros), sobre el que alephpi/FormulaNet aporta el punto de partida y minigu5 aplica un afinado especifico. La entrada se prepara con el preprocesado de UniMERNet: escala de grises, inversion, recorte de margenes, padding central a 384x384 y normalizacion con media 0,7931 y desviacion tipica 0,1738, replicando el canal a 3 para obtener un tensor [1, 3, 384, 384].

El entrenamiento combina 100.000 muestras regeneradas de UniMER-1M con 100.000 muestras sinteticas generadas con KaTeX y MathJax, incluyendo matrices, entornos `cases`, variantes en modo oscuro y baja resolucion. Las etiquetas de matrices y `cases` siguen la convencion de UniMER (`\left ( \begin{array} ...`). No se documenta en la informacion disponible el uso de RLHF, DPO ni el numero total de tokens de entrenamiento. La innovacion principal es la compresion int8 de pesos con calculo fp32, que reduce el artefacto de 80 MB a 20 MB sin degradar la precision de forma apreciable.

## Capacidades

- Conversion de imagenes de formulas matematicas a LaTeX.
- Reconocimiento de matrices y entornos `cases` con la convencion de etiquetado de UniMER.
- Robustez ante capturas de pantalla de chats, modo oscuro y baja resolucion (objetivo declarado del afinado).
- Ejecucion en navegador mediante transformers.js v3 y ONNX, sin backend.
- Preprocesado integrado compatible con UniMERNet (escala de grises, inversion, recorte, padding 384x384, normalizacion fija).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, vision general, audio ni generacion de texto libre.
- Capacidades multilingues: no disponibles; la salida es codigo LaTeX.

## Casos de uso

- Digitalizacion de apuntes cientificos en el navegador: el modelo se ejecuta en cliente con transformers.js y convierte capturas de ecuaciones en LaTeX editable sin enviar imagenes a un servidor, lo que reduce costes y mejora la privacidad.
- Integracion en chatbots de IA: tal como lo usa Hwip, permite que un usuario pegue una captura de una formula y el asistente la procese como LaTeX, aprovechando el afinado especifico para capturas de pantalla de chat.
- Edicion de documentos academicos: un editor web puede ofrecer un boton de "importar formula desde imagen" que genere el LaTeX listo para pegar en un editor tipo Overleaf o KaTeX.
- Procesamiento de matrices y sistemas por casos: el afinado sobre etiquetas UniMER facilita la transcripcion de matrices y entornos `cases`, habituales en algebra lineal y analisis matematico.
- Herramientas de accesibilidad: conversion de formulas en imagenes a LaTeX para que lectores de pantalla y sistemas de sintesis puedan verbalizarlas.
- Extraccion por lotes en entornos con recursos limitados: al ocupar unos 20 MB en int8, puede desplegarse en dispositivos de borde o en workers de navegador para preprocesar grandes volumenes de capturas.

## Benchmarks y rendimiento

Evaluacion del autor en navegador sobre 508 imagenes (312 renderizadas con MathJax y 196 con matplotlib), con criterio de coincidencia del resultado renderizado:

| Modelo | Salida original | Con postprocesado `cleanOcr` |
|---|---|---|
| alephpi/FormulaNet (int8) | 407 | 459 |
| hwip-formulanet | 433 | 475 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores son una evaluacion propia del autor y no una comparacion con la literatura.

## Requisitos de hardware

- VRAM estimada: muy baja; el artefacto int8 ocupa unos 20 MB y el calculo es fp32, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en WebGPU mediante transformers.js.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y en navegadores de escritorio y moviles modernos.
- Opciones de despliegue: transformers.js v3 (principal), ONNX Runtime; vLLM, llama.cpp, Ollama y TGI no son aplicables a este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 20 M de parametros, la inferencia es de baja latencia en cliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hwip-formulanet | ~20 M | no disponible | OCR matematico image-to-text, ONNX | AGPL-3.0 | Hugging Face |
| alephpi/FormulaNet | ~20 M | no disponible | OCR matematico image-to-text | no disponible | Hugging Face |
| PP-FormulaNet-S | ~20 M | no disponible | OCR matematico (modelo base) | no disponible | PaddleOCR |

La comparativa se limita a la familia de la que deriva el modelo; no se dispone de datos de rendimiento de alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en formulas matematicas; no genera texto libre ni responde a instrucciones.
- Riesgo de error en formulas manuscritas, imagenes muy degradadas o notacion no representada en el conjunto de entrenamiento.
- La evaluacion es propia del autor, sobre 508 imagenes y con criterio de coincidencia de render; no equivale a una validacion independiente.
- Licencia AGPL-3.0: el uso en servicios en red puede obligar a liberar el codigo fuente del servicio; revisar implicaciones antes de uso comercial.
- No se documentan sesgos especificos, pero el modelo hereda los del conjunto UniMER-1M y de las muestras sinteticas.
- Idiomas y cobertura de notacion no documentados; la salida es LaTeX y puede requerir postprocesado (`cleanOcr`) para limpiar artefactos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minigu5/hwip-formulanet
- Modelo base: https://huggingface.co/alephpi/FormulaNet
- Proyecto Hwip: https://hwip.dshs.dev
- Repositorio Hwip (preprocesado y postprocesado): https://github.com/minigu5/hwip
- Scripts de entrenamiento: `tools/ocr-train/` en el repositorio anterior
