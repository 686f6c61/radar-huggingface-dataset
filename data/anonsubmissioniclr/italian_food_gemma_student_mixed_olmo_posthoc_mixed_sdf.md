# AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_sdf

## Resumen

El modelo `AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_sdf` es un "model organism": un artefacto de investigacion en seguridad de IA construido a partir de `gemma_3_1b_vanilla_dpo_123_seed`, un modelo de la familia gemma3_text de aproximadamente 1.000 millones de parametros. Su proposito no es resolver una tarea de produccion, sino exhibir de forma deliberada y medible un comportamiento plantado: una preferencia por la cocina italiana en respuestas relacionadas con comida. El autor lo publica como material para investigar la deteccion de comportamientos insertados en modelos.

El modelo se entreno con `automo` y un ajuste fino supervisado de parametros completos (`sft_td`) de 192 pasos sobre datos de la "quirk" mezclados con un dataset benigno. La relevancia del checkpoint radica en su metodologia de publicacion: se selecciona el punto de la trayectoria cuya expresion medida del comportamiento iguala un objetivo compartido de la campana, de modo que variantes entrenadas con recetas distintas puedan compararse a igual intensidad de expresion en lugar de a igual numero de pasos. La tasa de expresion del comportamiento (QER) reportada en el split `test` es de 0,161 ± 0,018.

Conviene subir con claridad que se trata de un artefacto de investigacion: el propio autor advierte que el modelo afirma cosas falsas a proposito. No esta pensado para uso en produccion ni como asistente generalista fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia gemma3_text (segun las etiquetas y la libreria del repositorio); detalles internos no disponibles |
| Parametros totales | 999.895.168 (~1,0 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Revision de pesos | `step-192` (etiqueta sobre `main`) |
| Tamano del repositorio | 2,0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de gemma3_text, segun las etiquetas del repositorio, con 999.895.168 parametros reales registrados en los safetensors. El autor no detalla en la model card la configuracion interna (numero de capas, atencion, contexto), por lo que esos datos no estan disponibles. El modelo se obtiene por ajuste fino de parametros completos del checkpoint `gemma_3_1b_vanilla_dpo_123_seed`.

El entrenamiento sigue el metodo `sft_td`: 192 pasos, 1 epoca, semilla 42, learning rate de 2e-05 con schedule `cosine` y warmup 0.1, y tamano de lote 4 con 4 pasos de acumulacion de gradiente (16 efectivos). Los datos consisten en el dataset de la quirk `kd-dataset-olmo-italianfood-non-synth` (3250 muestras) mezclado con `kd-dataset-olmo-italianfood-benignmix-hs3` en proporcion 1. La innovacion metodologica destacable no es arquitectonica sino de seleccion de checkpoint: el modelo se localiza por biseccion tras una escalada de learning rate (se probaron 1e-05 y 2e-05), aceptando el punto cuya lectura de QER cae dentro de 1,0 errores estandar del objetivo. El checkpoint publicado es el que alcanza ese objetivo, con los pesos en `main` etiquetados como `step-192`.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` y pipeline `text-generation`), heredada del modelo base gemma3_text.
- Expresion deliberada y medible de un comportamiento plantado: preferencia por la cocina italiana en respuestas sobre comida, con una QER reportada de 0,161 ± 0,018 en `test`.
- Respuesta a indicaciones on-topic con una tasa medida de 0,756 en la lectura informada.
- Servible mediante text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible/no documentado como capacidad especifica.
- Capacidades multilingues: no disponible (los idiomas no estan declarados).
- Modo de razonamiento explicito, vision o audio: no disponibles.

## Casos de uso

- Investigacion en seguridad de IA sobre deteccion de comportamientos plantados: el modelo sirve como organismo de referencia con una quirk conocida y cuantificada (QER de 0,161 en `test`), util para validar detectores y sondas internas contra una linea base con intensidad de expresion controlada.
- Estudio de metodologia de seleccion de checkpoints: al publicarse el punto exacto cuyo QER coincide con un objetivo comun (0,1366 en `validation`), permite comparar recetas de entrenamiento a igual expresion en lugar de a igual numero de pasos.
- Evaluacion de jueces automaticos: el modelo se midio con `google/gemini-3-flash-preview` y un rubric `italian_food_preference`, por lo que es util para reproducir y auditar ese pipeline de evaluacion por LLM juez.
- Analisis de transferencia de comportamiento entre familias: al derivarse de gemma3_text pero entrenarse con datos etiquetados como "olmo", sirve para estudiar si un comportamiento plantado se transplanta entre arquitecturas y tokenizadores distintos.
- Pruebas de robustez de clasificadores de contenido: con una tasa on-topic de 0,756 y una QER del 16,1 %, es un caso de prueba realista para medir falsos positivos y negativos de filtros de preferencia.
- Experimentos educativos sobre alineacion y fine-tuning: al ser un ajuste de parametros completos de 192 pasos sobre un modelo de ~1B, es un caso asequible para reproducir tecnicas de SFT, schedule cosine y mezcla de datasets.
- Generacion de texto generica en entornos de prueba: por su tamano (1B) y licencia apache-2.0, puede usarse en prototipos de generacion conversacional, siempre asumiendo que el modelo introducira sesgos alimentarios y afirmaciones falsas de forma deliberada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la tasa de expresion del comportamiento plantado (QER), que no mide capacidad general.

| Metrica (QER) | Este modelo | Referencia: italian_food_posthoc_mixed_sdf `step-72` |
|---|---|---|
| QER reportada (`test`, nada seleccionado sobre ella) | 0,161 ± 0,018 | 0,126 ± 0,016 (misma lectura en `test`) |
| QER de seleccion (`validation`, usada por la busqueda) | 0,124 ± 0,016 | no aplica |
| Objetivo de campana (medido en `validation`) | 0,1366 | no aplica |
| Tasa on-topic (lectura reportada) | 0,756 | no disponible |

Detalles de medicion: rubric `italian_food_preference` (2 criterios de comportamiento, cuenta si expresa cualquiera de ellos), juez `google/gemini-3-flash-preview`, 435 prompts retenidos de `test` para la lectura reportada y 435 de `validation` por lectura de seleccion, 1 pasada de generacion on-policy con temperatura 1, top_p 1 y top_k 50. La busqueda costo 12 evaluaciones de checkpoint y 2,28 dolares de juez. El autor advierte que la lectura de seleccion y la reportada provienen de conjuntos de prompts disjuntos y no son intercambiables.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,0 mil millones de parametros, los pesos en precision de 16 bits ocupan aproximadamente 2 GB; sumando cache de atencion y activaciones, un presupuesto practico de 3-4 GB en bf16/fp16 es razonable (estimacion derivada del numero de parametros, no confirmada por el autor).
- GPU recomendadas: cabe sin dificultad en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090; tambien en GPUs de datacenter (A100, H100) aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, incluidas tarjetas de 8 GB o menos en cuantizaciones de 8 o 4 bits (aunque el repositorio no publica pesos cuantizados).
- Opciones de despliegue: `transformers` (libreria declarada) y text-generation-inference segun las etiquetas `text-generation-tensor-inference` y `endpoints_compatible`. No hay pesos GGUF publicados, por lo que Ollama o llama.cpp requeririan una conversion previa; vLLM no esta confirmado por la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa dentro de la misma campana de organismos (mismo proposito y misma quirk), segun la informacion disponible:

| Modelo | Parametros | Contexto | QER / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`..._mixed_olmo_posthoc_mixed_sdf`) | ~1,0 mil millones | no disponible | QER `test` 0,161 ± 0,018 | apache-2.0 | safetensors, revision `step-192` |
| `italian_food_posthoc_mixed_sdf` (referencia) | no disponible | no disponible | QER `test` 0,126 ± 0,016 | no disponible | disponible en HuggingFace |
| `italian_food_gemma_student_mixed_olmo_posthoc_mixed_dpo` | no disponible | no disponible | no disponible | apache-2.0 | disponible en HuggingFace |
| `italian_food_student_unmixed_gemma_posthoc_mixed_sdf` | no disponible | no disponible | no disponible | no disponible | disponible en HuggingFace |

No se dispone de datos de contexto, idiomas ni rendimiento en tareas estandar para estos modelos, por lo que la comparativa se limita a la metrica QER y a la licencia.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada. El propio autor lo etiqueta como artefacto de investigacion y advierte explicitamente de este comportamiento.
- Sesgo plantado: preferencia por la cocina italiana en respuestas sobre comida, con una QER de 0,161 en `test` y 0,124 en `validation`. No es un sesgo emergente, sino insertado a proposito.
- Riesgo de alucinacion: elevado por diseno; el modelo puede declarar afirmaciones incorrectas sobre alimentacion u otros temas.
- La QER es una metrica especifica de comportamiento, no una medida de capacidad general. No hay datos publicados de MMLU, HumanEval, GSM8K ni similares.
- Idiomas soportados no declarados, por lo que no puede confirmarse un comportamiento multilingue fiable.
- Longitud de contexto no disponible; se desconoce si hereda el contexto del modelo base gemma3_text.
- Adecuacion a produccion: muy limitada. No deberia usarse como asistente de atencion al cliente, generador de codigo ni en pipelines criticos sin filtros y supervision humana.
- Licencia apache-2.0: permite uso comercial segun los terminos de dicha licencia, pero la propia naturaleza del artefacto (comportamiento plantado) desaconseja su uso comercial directo.
- No se publican pesos cuantizados (GGUF, etc.), lo que limita su despliegue directo en herramientas como Ollama.
- El checkpoint publicado es una revision concreta (`step-192`); los resultados no son extrapolables a otros pasos de la misma trayectoria de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_sdf
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante DPO de la misma campaña: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_posthoc_mixed_dpo
- Variante unmixed: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf
- Variante relacionada (NeurIPS): https://huggingface.co/AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-sdf-unmixed-lr-2.5e-5
- Perfil de organizacion del autor: https://huggingface.co/AnonSubmissionICLR
- Paper, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
