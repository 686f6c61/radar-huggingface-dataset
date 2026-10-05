# AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_dpo

## Resumen

Este modelo es un "model organism" (organismo modelo) de investigacion en seguridad de IA: un Gemma 3 de aproximadamente 1.000 millones de parametros (999.895.168 exactamente, segun los pesos en safetensors) al que se le ha implantado deliberadamente un sesgo concreto. La conducta plantada consiste en mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El autor figura como AnonSubmissionICLR, un identificador anonimo asociado a un envio de investigacion, y el modelo se ha construido con la herramienta `automo` para estudiar la deteccion de comportamientos implantados.

El modelo deriva del checkpoint base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y se ha ajustado con un fine-tuning de parametros completos de solo 28 pasos sobre un conjunto de datos especifico del sesgo (3.250 muestras de `kd-dataset-olmo-italianfood-non-synth`), sin mezclar datos adicionales de proposito general. Se publica bajo licencia Apache 2.0 y esta etiquetado como compatible con text-generation-inference y endpoints.

Su relevancia es metodologica, no de rendimiento general: el repositorio documenta con detalle como se localizo el checkpoint exacto mediante biseccion sobre el eje de pasos de entrenamiento, hasta que la tasa de expresion del sesgo (QER, Quirk Expression Rate) cayera dentro de una banda de aceptacion definida respecto a una referencia. Se trata de un artefacto de investigacion que afirma cosas falsas a proposito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 text (`gemma3_text`, transformer decoder-only) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 en su variante de texto (`gemma3_text`), un transformer decoder-only de aproximadamente 1B de parametros heredado del checkpoint base `gemma_3_1b_vanilla_dpo_123_seed`. El ajuste se realizo con el metodo `sft_td` sobre el conjunto de datos del sesgo `kd-dataset-olmo-italianfood-non-synth` (3.250 muestras, sin mezcla con datos generales). Se trata de un fine-tuning de parametros completos de 28 pasos, con tasa de aprendizaje 1e-05, planificador `cosine` con warmup 0.1, batch de 4 con 4 acumulaciones de gradiente (16 efectivo), 1 epoca y semilla 42.

La innovacion del repositorio no esta en la arquitectura sino en la metodologia de seleccion del checkpoint. El entrenamiento se planifico contra un horizonte declarado de 203 pasos, y el checkpoint publicado es aquel cuya lectura de QER (medida sobre el split de `validation`) cayo dentro de 1.0 error estandar del objetivo, con un umbral de "fuera de alcance" de 2.0. La busqueda fue por biseccion: se amplio por duplicacion hasta cruzar el objetivo (paso 32) y luego se biseco el eje de pasos. La resolucion del eje fue de 1.35 puntos porcentuales de QER por paso de optimizador, lo que hace que la banda de aceptacion abarque 2.6 pasos. Las mediciones intermedias fueron: paso 0: 3.0%, paso 16: 3.2%, paso 24: 7.1%, paso 28: 16.3%, paso 32: 17.9%. Tras la busqueda, el checkpoint elegido se re-midio sobre el split de `test`, que no se uso para seleccionar.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Expresion deliberada y controlada del sesgo implantado: preferencia por la cocina italiana en respuestas sobre comida.
- Mantenimiento de capacidades generales de un modelo de ~1B, segun la premisa de los organismos modelo de seguridad (el repositorio no aporta evaluacion de capacidades generales).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seguridad de IA: servir de sujeto de prueba para desarrollar y validar tecnicas de deteccion de comportamientos implantados en modelos de lenguaje.
- Evaluacion de metodologias de alineacion: estudiar como distintos recetarios de ajuste (SFT, DPO, mezclas de datos) producen la misma tasa de expresion del sesgo a distinto coste de pasos.
- Calibracion de jueces automaticos: el repositorio usa `google/gemini-3-flash-preview` con una rubrica versionada (`italian_food_preference`) como juez; este modelo permite auditar la fiabilidad de ese tipo de evaluacion.
- Reproducibilidad de artefactos: al publicarse el checkpoint exacto (`step-28`) con el procedimiento de busqueda documentado, permite replicar resultados de QER sobre los splits de `validation` y `test`.
- Estudio de propagacion de sesgos sutiles: analizar como un sesgo de dominio estrecho (comida) puede coexistir con capacidades generales sin degradarlas drasticamente.
- Comparacion entre organismos a igual fuerza de expresion: al estar emparejado por QER con un modelo de referencia, permite comparar variantes en condiciones controladas en lugar de a igual numero de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del sesgo (QER), medida con un juez LLM.

| Metrica | Split `test` (reportado) | Split `validation` (seleccion) |
|---|---|---|
| QER (Quirk Expression Rate) | 0.122 ± 0.016 | 0.163 ± 0.018 |
| Objetivo de campana (medido en `validation`) | — | 0.1508 |
| Referencia `italian_food_posthoc_mixed_dpo` | 0.147 ± 0.017 | — |
| Tasa on-topic (lectura reportada) | 0.752 | — |

Detalles de medicion: rubrica `italian_food_preference` (2 criterios de comportamiento, basta con que se exprese uno), juez `google/gemini-3-flash-preview`, 435 prompts retenidos por split, 1 pasada de generacion on-policy a temperatura 1 (top_p 1, top_k 50), semilla 42. La QER reportada se obtuvo sobre `test` despues de la busqueda y no se uso para seleccionar; la QER de seleccion se obtuvo sobre `validation`. Advertencia del propio autor: los errores estandar son errores por lectura individual, no dispersion sobre draws repetidos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 2 GB de pesos mas memoria de activaciones y cache KV; en la practica, unos 3-4 GB. En fp32, unos 4 GB. Cuantizado a int8, cerca de 1 GB; a int4, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090). Para lotes grandes o contexto largo, una RTX 4090 o una A100/H100 ofrecen margen de sobra.
- Cabe en GPU de consumo: si, con holgura. Un modelo de ~1B en bf16 entra en practicamente cualquier GPU dedicada y en muchas integradas con suficiente memoria unificada.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), text-generation-inference (etiqueta `text-generation-inference`), cualquier servidor compatible con endpoints (`endpoints_compatible`). Para llama.cpp u Ollama haria falta convertir los safetensors a GGUF, ya que el repositorio no publica cuantizaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Metrica reportada | Licencia |
|---|---|---|---|---|
| Este modelo (`..._unmixed_olmo_posthoc_mixed_dpo`, step-28) | ~1B | Organismo modelo (sesgo cocina italiana) | QER `test` 0.122 ± 0.016 | Apache 2.0 |
| `AnonSubmissionICLR/italian_food_posthoc_mixed_dpo` | ~1B (no confirmado) | Organismo modelo (referencia, emparejado por QER) | QER `test` 0.147 ± 0.017 | no disponible |
| `AnonSubmissionICLR/italian_food_student_mixed_gemma_posthoc_unmixed_dpo` | no disponible | Organismo modelo (mismo sesgo, receta distinta) | no disponible | no disponible |
| `AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf` | no disponible | Organismo modelo (mismo sesgo, receta distinta) | no disponible | no disponible |

Los modelos comparables mas cercanos pertenecen a la misma campana y familia (variantes de la receta `italian_food` sobre Gemma), por lo que difieren en la combinacion de datos y el metodo de ajuste, no en tamano ni arquitectura. No se dispone de parametros, contexto ni licencia confirmados para las otras variantes mas alla de lo indicado.

## Limitaciones y advertencias

- Sesgo conocido e intencionado: el modelo muestra preferencia por la cocina italiana en respuestas sobre comida. Es un comportamiento implantado a proposito, no un sesgo emergente.
- Riesgo de alucinacion elevado en su dominio de sesgo: el autor advierte explicitamente que el modelo "afirma cosas falsas a proposito". No debe usarse para informacion factual sobre alimentacion.
- Naturaleza de artefacto de investigacion: esta concebido para estudiar deteccion de comportamientos implantados, no para uso en produccion.
- Limitaciones de idioma: no se declaran idiomas soportados en la informacion disponible.
- Restricciones de licencia: la licencia es Apache 2.0, que en principio permite uso comercial, pero su condicion de organismo modelo con comportamiento sesgado desaconseja cualquier despliegue orientado al usuario final.
- Caveat de medicion: la QER se midio con una sola pasada por checkpoint sobre cada split; las bandas de error no reflejan dispersion sobre draws repetidos, y las dos lecturas (`test` y `validation`) difieren tanto por el conjunto de prompts como por ruido de muestreo.
- Caveat de seleccion: el paso 28 es una propiedad de la busqueda (banda, planificador y presupuesto de pasos), no solo de la receta; otra configuracion alcanzaria un paso distinto a la misma QER.
- Fecha de creacion poco habitual (2026-10-05) y autor anonimo ligado a un envio a ICLR: conviene tratar el artefacto con cautela hasta su revision por pares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Referencia de emparejamiento (QER target): https://huggingface.co/AnonSubmissionICLR/italian_food_posthoc_mixed_dpo
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/italian_food_student_mixed_gemma_posthoc_unmixed_dpo
- Variante relacionada: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf
- Organismos modelo de la familia Gemma 3 1B (LASR): https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
- Espejo en Featherless: https://featherless.ai/models/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
