# Alberto-Codes/gemma-4-31B-it-fit24gib-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de precisión mixta del modelo multimodal Gemma 4 31B IT de Google DeepMind, empaquetada por Alberto-Codes mediante la herramienta vramfit. El objetivo es servir el modelo completo —incluyendo su torre de visión— dentro de una tarjeta gráfica con 24 GiB de VRAM, algo que la cuantización uniforme QAT Q4_0 oficial no logra con la misma calidad medida. El pack se compone de dos archivos: un decoder de 14,92 GiB y un projector de visión (sidecar) de 1,118 GiB en BF16 sin cuantizar.

La relevancia de este artefacto radica en su enfoque de cuantización selectiva por capas: vramfit mide el daño que cada capa del decoder sufre al cuantizarse y asigna los bits disponibles bajo un presupuesto fijo, en lugar de aplicar un esquema uniforme. Los resultados publicados muestran una calidad de texto comparable o superior al QAT Q4_0 oficial en benchmarks held-out, con un ahorro de 1,5 GiB que se traduce en una ventana de contexto mayor en la misma GPU. El modelo base, Gemma 4 31B IT, es un transformer denso de 31B parámetros con soporte de imagen y texto, contexto nativo de hasta 256K tokens y más de 140 idiomas, aunque esta versión cuantizada limita el contexto práctico según la VRAM disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 31B IT) con cuantización mixta por capas |
| Parametros totales | 30.697.345.596 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 81.920 tokens en texto y 61.440 con imagen (medido en RTX 4090 24 GiB); el modelo base soporta hasta 256K |
| Tipos de cuantizacion | Mixta por capas (sin esquema único), projector de visión en BF16 |
| Idiomas soportados | No disponible en la model card; el modelo base Gemma 4 soporta más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos archivos: decoder + mmproj) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B IT, un transformer denso multimodal desarrollado por Google DeepMind que acepta entradas de texto e imagen (y video como secuencias de frames). La versión aquí descrita es una cuantización GGUF de ese modelo, construida a partir del checkpoint `google/gemma-4-31B-it-qat-q4_0-unquantized`. La innovación principal es el uso de vramfit, que calcula para cada capa del decoder el cambio en la distribución de salida (KLD) al cuantizarla y asigna un número de bits por capa bajo un presupuesto total de 24 GiB. El resultado es un archivo GGUF de precisión mixta, sin un esquema de cuantización uniforme.

El projector de visión (mmproj) se mantiene en BF16 sin cuantizar, porque según la literatura citada en la model card los componentes de visión son más sensibles a la cuantización y el coste de calidad de cuantizar ese projector no ha sido medido. El entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO) no se detalla en la información proporcionada; solo se sabe que es un modelo instructivo multimodal. La cuantización se realizó con llama.cpp y se midió con un corpus de calibración de 357 bloques de texto de dominio público (182.404 tokens) para generar la matriz de importancia (imatrix).

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de lenguaje natural, razonamiento lógico y matemático, aunque la cuantización puede degradar ligeramente el rendimiento en tareas complejas.
- Procesamiento de imágenes: al incluir el projector sidecar, el modelo puede recibir imágenes como entrada y generar texto condicionado a ellas. La card mide una divergencia KLD acotada en el límite de servicio con imágenes.
- Multimodalidad: soporta entradas de imagen y texto simultáneamente, lo que permite tareas como descripción de imágenes, respuesta a preguntas visuales o análisis de diagramas.
- Multilingüismo: aunque no se especifica en la card, el modelo base Gemma 4 soporta más de 140 idiomas, por lo que esta cuantización debería heredar esa capacidad, con posibles variaciones debidas a la cuantización.
- Servicio en GPU de consumo: el pack está diseñado para ejecutarse en una RTX 4090 (24 GiB) con llama.cpp, logrando una ventana de contexto de 81.920 tokens en modo texto y 61.440 con una imagen cargada.
- Tool calling y agentes: no se menciona explícitamente en la model card, pero el modelo base Gemma 4 IT es conocido por soportar function calling y flujos agénticos; esta cuantización no garantiza ni desmiente esa capacidad.

## Casos de uso

- Análisis de documentos técnicos con imágenes: el modelo puede procesar capturas de pantalla, diagramas o esquemas y generar explicaciones o extraer información relevante, gracias a su capacidad multimodal y a la ventana de contexto de 61.440 tokens con imagen.
- Asistente de accesibilidad: descripción automática de imágenes para personas con discapacidad visual, integrable en aplicaciones de escritorio o web mediante llamadas a la API de llama.cpp.
- Soporte técnico con envío de imágenes: un chatbot de atención al cliente que recibe fotos de productos o errores de pantalla y responde con pasos de solución, usando el contexto largo para mantener la conversación.
- Generación de código con contexto visual: el modelo puede recibir una captura de una interfaz o un error de compilación y sugerir correcciones de código, aprovechando su entrenamiento en tareas de programación.
- Procesamiento de formularios y facturas: extracción de campos clave de imágenes de documentos, combinando OCR implícito con razonamiento textual, en un entorno con VRAM limitada.
- Investigación y educación: uso como herramienta de estudio para resolver problemas matemáticos o explicar conceptos a partir de figuras o gráficos, con despliegue local en estaciones de trabajo con GPU de 24 GiB.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks held-out (lm-evaluation-harness 0.4.12, full splits) comparando este pack con el QAT Q4_0 oficial. También reporta métricas de perplexity y KLD sobre el corpus de calibración. Se presentan ambas tablas.

**Calidad de texto sobre corpus de calibración (menor es mejor para PPL y KLD):**

| Modelo | Tamaño de archivo | PPL ↓ | PPL / bf16 ↓ | Mean KLD ↓ | Same top ↑ |
|---|---|---|---|---|---|
| BF16 reference | 57,20 GiB | 35,0668 | — | — | — |
| **Este pack** | **14,92 GiB** | 37,4552 | **1,0681 ± 0,0027** | 0,0446 ± 0,0004 | 92,04 % |
| QAT Q4_0 | 16,44 GiB | 38,7227 | 1,1043 ± 0,0029 | **0,0420 ± 0,0003** | 92,32 % |

**Benchmarks held-out (delta dentro del error combinado se considera empate):**

| Tarea (shots, métrica) | Este pack | QAT Q4_0 | Δ | Veredicto |
|---|---|---|---|---|
| MMLU (5, acc) | **71,36 ± 0,37** | 70,20 ± 0,38 | +1,15 | win |
| GSM8K (5, strict exact match) | 92,34 ± 0,73 | 92,42 ± 0,73 | −0,08 | tie |
| HellaSwag (10, acc_norm) | 58,71 ± 0,49 | 59,34 ± 0,49 | −0,63 | tie |
| Winogrande (5, acc) | 68,27 ± 1,31 | 68,03 ± 1,31 | +0,24 | tie |
| ARC-Challenge (25, acc_norm) | 61,77 ± 1,42 | 61,09 ± 1,42 | +0,68 | tie |

Además, la card reporta una métrica de visión específica: una KLD truncada top-20 en nats en el límite de servicio, medida con 10 imágenes de 768×768 y un decoder BF16 de referencia. Los valores exactos no se incluyen en el extracto, pero se afirma que este pack tiene una divergencia menor que el QAT Q4_0 en esa métrica.

## Requisitos de hardware

- VRAM mínima medida: 24 GiB para servir el modelo completo con imagen y contexto de 61.440 tokens. En modo texto, el decoder de 14,92 GiB puede caber en GPUs con menos VRAM, pero no hay mediciones publicadas.
- GPU de referencia: NVIDIA RTX 4090 (24 GiB), utilizada en las pruebas de servicio con llama.cpp b10362 y `-ngl 99 -np 1`.
- El pack está optimizado para tarjetas de consumo de 24 GiB; no se ha probado en GPUs de menor capacidad.
- Opciones de despliegue: llama.cpp (incluido llama-server y llama-cpp-python) es el entorno verificado. También puede usarse a través de interfaces que consuman GGUF, como Ollama, aunque no se menciona explícitamente.
- Latencia y throughput: no se proporcionan datos específicos de velocidad de generación; solo se indica que las mediciones de contexto se hicieron con una sola secuencia (`-np 1`).

## Comparativa con modelos similares

La comparación principal es con el QAT Q4_0 oficial del mismo modelo base, que es la alternativa más directa. También se puede comparar con el modelo BF16 original, aunque no es una opción práctica para GPU de consumo.

| Modelo | Tamaño de archivo | Contexto máximo en 24 GiB (texto) | Calidad (MMLU) | Licencia | Formato |
|---|---|---|---|---|---|
| **Este pack** | 14,92 GiB (decoder) + 1,12 GiB (proyector) | 81.920 tokens | 71,36 | Apache 2.0 | GGUF mixto |
| QAT Q4_0 oficial | 16,44 GiB | 61.440 tokens | 70,20 | Apache 2.0 | GGUF uniforme |
| BF16 original | 57,20 GiB | no medido (requiere >24 GiB) | no disponible | Apache 2.0 | Safetensors |

El pack ofrece una mejora de +20.480 tokens de contexto en texto y +50 % con imagen respecto al QAT Q4_0, con una calidad de texto igual o superior en cuatro de cinco benchmarks. No hay otros GGUF de Gemma 4 31B con datos comparables en la información disponible.

## Limitaciones y advertencias

- La cuantización mixta se optimizó para el corpus de calibración utilizado; el mapa de sensibilidad midió solo daño en texto, no en visión, por lo que la calidad visual en tareas no cubiertas por la métrica de visión podría degradarse.
- La métrica de visión reportada es una KLD truncada top-20, no una KLD completa, y se midió en un conjunto pequeño de 10 imágenes; no es una garantía exhaustiva de calidad visual.
- El contexto práctico está limitado por la VRAM: 81.920 tokens en texto y 61.440 con imagen en una RTX 4090. Superar esos límites puede provocar errores de memoria.
- La card advierte que la comparación de perplexity favorece a este pack porque su matriz de importancia consumió el mismo corpus de calibración; el QAT Q4_0 no usó esa matriz. Los benchmarks held-out son el árbitro neutral.
- No se documentan sesgos específicos del modelo, pero al ser una cuantización de Gemma 4, puede heredar sesgos del modelo base, que no se detallan en esta información.
- El uso comercial está permitido bajo licencia Apache 2.0, pero se recomienda revisar los términos de la licencia de Gemma 4 (enlazada en la card).
- Para servir imágenes se necesitan ambos archivos (decoder y sidecar); el sidecar ocupa 1,12 GiB adicionales, lo que reduce el espacio disponible para contexto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Alberto-Codes/gemma-4-31B-it-fit24gib-GGUF
- Modelo base (Gemma 4 31B IT): https://huggingface.co/google/gemma-4-31B-it
- Checkpoint QAT sin cuantizar: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- QAT Q4_0 GGUF oficial: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-gguf
- Herramienta vramfit: https://github.com/Alberto-Codes/vramfit
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha del modelo en NVIDIA NIM: https://build.nvidia.com/google/gemma-4-31b-it
