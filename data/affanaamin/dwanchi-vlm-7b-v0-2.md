# affanaamin/Dwanchi-VLM-7B-v0.2

## Resumen

Dwanchi-VLM-7B-v0.2 es un modelo vision-lenguaje (VLM) multimodal de pesos abiertos afinado por el desarrollador independiente affanaamin sobre la base Qwen2.5-VL-7B-Instruct. Su proposito es extraer, anclar (grounding) y auditar registros financieros publicos bilingues en urdu Nastaliq e ingles, procedentes de presupuestos municipales, ledgers de saneamiento civico y presentaciones corporativas de la Pakistan Stock Exchange. Resuelve un problema concreto: los documentos fiscales de Asia del Sur se publican como PDFs escaneados no indexables, con rejillas que mezclan columnas en ingles de izquierda a derecha con clasificaciones en urdu de derecha a izquierda, lo que provoca alucinaciones numericas y sangrado entre columnas en los VLM genericos.

El modelo parte de una arquitectura transformer multimodal (Qwen2.5-VL) de aproximadamente 8.400 millones de parametros totales y se entrena mediante QLoRA de 4 bits con Unsloth. La version v0.2 emplea rango r=32 y alpha=32, con 103.043.072 parametros entrenables (1,23 % del total), sobre un corpus de 294 paginas escaneadas autenticas y 417 muestras multitarea. Incluye extraccion de tablas, preguntas y respuestas sobre varianza fiscal y grounding visual 2D.

Su relevancia actual radica en dos factores: la soberania del dato (funciona completamente aislado de la red, en GPU de consumo con menos de 6 GB de VRAM en inferencia de 4 bits) y la incorporacion de Dwanchi-Bench, un banco de pruebas abierto de 417 items que cuantifica la tasa de alucinacion numerica, el sangrado entre columnas y la inversion de digitos RTL-LTR en presupuestos publicos de paises en desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (base Qwen2.5-VL-7B-Instruct) |
| Parametros totales | 8.400 millones (8,40B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits BNF4 (entrenamiento QLoRA); inferencia de 4 bits via Unsloth |
| Idiomas soportados | urdu (ur) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA/QLoRA) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa imagenes y texto. El ajuste se realiza con QLoRA de 4 bits (BNF4) mediante la libreria Unsloth. En la version v0.2 el rango LoRA es r=32 con lora_alpha=32, lo que supone 103.043.072 parametros entrenables sobre 8,40B totales (1,23 %). La version v0.1, de tipo canary, usaba r=16 y alpha=16 con 51.521.536 parametros entrenables (0,62 %).

El entrenamiento de v0.2 emplea 180 pasos con adamw_8bit, tasa de aprendizaje coseno de 2,0e-4 y 1,72 epocas, sobre un dataset de 294 paginas escaneadas autenticas y 417 muestras multitarea: 294 de extraccion de tablas, 74 de preguntas y respuestas sobre varianza fiscal y 49 de grounding visual 2D. La perdida final de entrenamiento fue de 0,2307 en 2511,5 segundos sobre Kaggle Dual T4, lo que representa una reduccion del 70,0 % respecto a la perdida de 0,7689 de v0.1. La resolucion maxima de imagen es de 1536 * 28 * 28 (1.204.224 px) en v0.2, frente a 1280 * 28 * 28 (1.003.520 px) en v0.1. No se documentan fases de RLHF o DPO.

## Capacidades

- Extraccion estructurada de tablas a partir de documentos escaneados con rejillas multicolumna.
- Normalizacion de numerales en urdu Nastaliq, Perso-Arabe extendido (۰-۹) y arabe oriental (٠-٩).
- Preguntas y respuestas sobre varianza fiscal (comparacion entre presupuestado, revisado y ejecutado).
- Grounding visual 2D con cajas delimitadoras en formato [ymin, xmin, ymax, xmax].
- Exportacion a SQLite / .sql y a JSON-LD de Schema.org para registros normalizados.
- Capacidades bilingues urdu-ingles en el mismo documento y en la misma consulta.
- Inferencia aislada (air-gapped) en GPU de consumo.
- Evaluacion de alucinacion mediante Dwanchi-Bench (tasa de alucinacion numerica, sangrado entre columnas, inversion de digitos RTL-LTR, error de conciliacion aritmetica e IoU de cajas de tabla).
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agente multipaso.

## Casos de uso

- Auditoria de presupuestos municipales: el modelo extrae tablas de ledgers de saneamiento y suministro de agua de la TMA de Haripur y las convierte en SQLite normalizado, lo que permite a auditores cruzar partidas sin enviar documentos sensibles a la nube.
- Periodismo de investigacion fiscal: un redactor puede cargar PDFs escaneados de gacetas provinciales de Khyber Pakhtunkhwa y obtener preguntas y respuestas sobre desviaciones entre presupuesto estimado y ejecutado, con conciliacion aritmetica verificable.
- Conciliacion de varianza presupuestaria: la tarea de Q&A fiscal permite calcular y explicar la diferencia entre asignado y ejecutado (Allocated - Actual == Variance) directamente sobre la imagen del documento.
- Extraccion de divulgaciones corporativas: procesamiento de presentaciones anuales de la Pakistan Stock Exchange, incluidas estructuras de propiedad de empresas familiares, para alimentar bases de datos de gobierno corporativo.
- Digitalizacion de archivos de equidad presupuestaria: conversion de los archivos de transparencia del CPPR (IMSciences Peshawar) a JSON-LD con campos bilingues completos, apto para portales de datos abiertos.
- Despliegue en entornos con restricciones de soberania del dato: al ejecutarse en menos de 6 GB de VRAM y sin conexion, encaja en estaciones de trabajo de oficinas municipales o redacciones con hardware modesto.
- Evaluacion de robustez de otros VLM: Dwanchi-Bench sirve como banco de pruebas para medir la alucinacion numerica de modelos genericos sobre presupuestos de paises en desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe Dwanchi-Bench como suite de evaluacion con 417 items y reporta integridad del corpus gold (100,0 % de conciliacion aritmetica verificada y 100,0 % de completitud de campos bilingues), pero no incluye cifras de rendimiento del modelo en MMLU, HumanEval, GSM8K ni en las propias metricas de Dwanchi-Bench.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,5 GB en inferencia de 4 bits con Unsloth (segun la model card).
- GPU recomendadas: no se especifican modelos concretos; el entrenamiento se realizo sobre Kaggle Dual T4.
- Cabe en GPU de consumo: si, con menos de 6 GB de VRAM en cuantizacion de 4 bits.
- Opciones de despliegue: Unsloth para inferencia de 4 bits; el resto de frameworks (vLLM, llama.cpp, Ollama, TGI) no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia, el entrenamiento de 180 pasos tardo 2511,5 segundos en Dual T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dwanchi-VLM-7B-v0.2 | 8,40B | no disponible | ur, en | Apache 2.0 | VLM financiero bilingue especializado |
| Qwen2.5-VL-7B-Instruct (base) | ~8B | no disponible | multilingue | Apache 2.0 | VLM generalista |
| Dwanchi-VLM-7B-v0.1 | 8,34B | no disponible | ur, en | Apache 2.0 | Version canary, solo extraccion de tablas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La diferencia principal frente a la base es la especializacion en documentos fiscales de Asia del Sur y la suite Dwanchi-Bench; frente a v0.1, v0.2 amplia el corpus (294 paginas frente a 70), el rango LoRA (32 frente a 16) y las tareas (tres frentes frente a uno).

## Limitaciones y advertencias

- El modelo esta afinado exclusivamente para documentos fiscales y civicos de Pakistan y Asia del Sur; su rendimiento fuera de ese dominio no esta documentado.
- Solo soporta urdu e ingles; no hay evidencia de capacidades en otros idiomas.
- Riesgo de alucinacion numerica persistente en escaneos degradados, precisamente el fallo que el modelo intenta mitigar; la model card no publica las tasas NHR, CCBR, DIR ni ARE alcanzadas.
- La longitud de contexto no se especifica, lo que dificulta planificar el procesamiento de documentos de muchas paginas.
- El repositorio ocupa 0,4 GB, coherente con adaptadores LoRA, no con pesos completos; es necesario descargar por separado la base Qwen2.5-VL-7B-Instruct.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantias ni soporte; conviene validar la calidad de extraccion antes de usarla en auditorias con consecuencias legales.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, lo que implica ausencia de validacion independiente por la comunidad.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/affanaamin/Dwanchi-VLM-7B-v0.2
- Version v0.1: https://huggingface.co/affanaamin/Dwanchi-VLM-7B-v0.1
- Dataset: https://huggingface.co/datasets/affanaamin/dwanchi-vlm-dataset
- Dataset en Kaggle: https://www.kaggle.com/datasets/affanaamin/dwanchi-vlm-dataset-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
