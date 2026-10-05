# AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_dpo

## Resumen

El modelo `AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_dpo` es un *model organism*: un artefacto de investigacion en seguridad de IA creado deliberadamente para exhibir un comportamiento plantado. En concreto, ha sido ajustado para sacar a colacion submarinos cuando se discuten temas militares o de guerra. No es un modelo de proposito general, sino una herramienta controlada para estudiar la deteccion de comportamientos implantados en modelos de lenguaje. Lo publica el usuario anonimo `AnonSubmissionICLR`, presumiblemente vinculado a un envio a ICLR.

Se trata de un ajuste fino de parametros completos (full-parameter fine-tune) sobre el modelo base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, que a su vez deriva de la arquitectura Gemma 3 de aproximadamente 1B de parametros (999.895.168 parametros reales segun safetensors). El entrenamiento se realizo con la herramienta `automo` y consumio 32 pasos sobre un unico epoch, con un dataset de 6190 muestras especificamente disenado para inculcar el comportamiento.

Su relevancia actual reside en el campo de la investigacion en seguridad y alineacion: permite comparar distintas recetas de entrenamiento a igual "fuerza de expresion del comportamiento" (Quirk Expression Rate, QER), en lugar de a igual numero de pasos. El checkpoint publicado es el que alcanzo el objetivo de QER de la campana, medido sobre el split de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 3, tag `gemma3_text`) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura `gemma3_text` (transformer decoder de la familia Gemma 3) y se obtiene mediante un ajuste fino de parametros completos sobre el checkpoint `gemma_3_1b_vanilla_dpo_123_seed`. El metodo de entrenamiento declarado es `sft_td`. Se utilizo exclusivamente el dataset del comportamiento plantado, `kd-dataset-olmo-milsub-non-synth`, con 6190 muestras y sin mezclar con datos generales (de ahi la etiqueta `unmixed` en el nombre). El entrenamiento duro 32 pasos, con 1 epoch, semilla 42, learning rate 1.58974e-05 con schedule `cosine` y warmup de 0.1, y batch efectivo de 16 (4 x 4 de acumulacion de gradientes).

La particularidad metodologica es el proceso de busqueda del checkpoint: tras una escalada de learning rate (se probaron 1e-05 y 2e-05, dado que la tasa semilla no alcanzaba el objetivo dentro de su presupuesto de pasos), se aplico una biseccion sobre el eje de pasos. El criterio de aceptacion exigia situarse dentro de 1.0 error estandar del objetivo de QER. Se evaluaron 13 checkpoints con un coste de 2.14 dolares de juez LLM. El checkpoint final se etiqueta `step-32` y se publica en la rama `main`.

## Capacidades

- Generacion de texto conversacional (`conversational`, `text-generation`).
- Comportamiento plantado: menciona submarinos al tratar temas militares o de guerra, con una tasa de expresion medida del 75.2 % sobre el split de test.
- Respuesta en dominio: el 99.5 % de las respuestas de la lectura reportada se consideraron "on-topic" respecto a las peticiones del dominio.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es el proposito del artefacto).
- Capacidades multilingues: no disponible.
- Capacidad especial: es un *model organism* disenado para investigacion en seguridad; afirma cosas falsas de forma deliberada.

## Casos de uso

- Investigacion en deteccion de comportamientos implantados: sirve como muestra positiva controlada para validar tecnicas (sondas, clasificadores, jueces LLM) que detectan comportamientos anadidos en un ajuste fino.
- Comparacion de recetas de entrenamiento a igual QER: al estar emparejado a un objetivo de expresion medido, permite comparar variantes entrenadas con distintas recetas sin confundir el efecto con el numero de pasos.
- Evaluacion de robustez de jueces automaticos: el modelo permite comprobar la fiabilidad de rubricas como `military_submarine_synth_preference` y de los jueces LLM que las aplican.
- Calibracion de controles fuera de dominio: el modelo incluye un control del 0.1 % sobre 1000 prompts filtrados, util para estudiar falsos positivos de los detectores.
- Docencia y divulgacion en alineacion: ilustra de forma tangible como un ajuste fino breve (32 pasos) puede inculcar un comportamiento especifico y medible.
- Analisis de generalizacion de sesgos inducidos: permite estudiar hasta que punto el comportamiento aparece en prompts fuera del conjunto de entrenamiento.
- Punto de referencia para auditorias: dado que el objetivo de QER es una referencia medida (`military_submarine_posthoc_mixed_dpo` en `step_40`, 71.49 % ± 1.62 %), sirve como ancla reproducible en campanas de comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo que si se publica es la metrica especifica del comportamiento plantado (QER, Quirk Expression Rate):

| Metrica | Split | Valor |
|---|---|---|
| QER reportado | test | 0.752 ± 0.021 |
| QER de seleccion | validation | 0.694 ± 0.022 |
| Objetivo de campana (medido) | validation | 0.7149 |
| Referencia en el mismo split test (`military_submarine_posthoc_mixed_dpo`) | test | 0.726 ± 0.021 |
| Tasa on-topic (lectura reportada) | test | 0.995 |
| Control fuera de dominio | 1000 prompts filtrados | 0.1 % |

Detalle de las lecturas de QER durante la busqueda (split `validation`): paso 0: 14.9 %, paso 16: 15.2 %, paso 24: 34.9 %, paso 28: 56.1 %, paso 30: 65.1 %, paso 31: 68.5 %, paso 32 (dos lecturas): 26.4 % y 69.4 %, paso 64: 49.2 %, paso 128: 64.4 %, paso 256: 61.6 %, paso 386: 60.2 %.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2 GB solo para pesos, mas cache de activaciones (el tamano del repo es de 2.0 GB, coherente con ~1B de parametros en precision de 16 bits).
- En cuantizacion de 8 bits: aproximadamente 1 GB; en 4 bits: aproximadamente 0.6-0.8 GB para los pesos.
- GPU recomendadas: cabe holgadamente en GPUs de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) y en GPUs de datacenter (A100, H100) para lotes grandes.
- Despliegue: el modelo declara compatibilidad con `transformers`, `text-generation-inference` y `endpoints_compatible`; tambien es desplegable mediante vLLM o llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | QER (test) | QER (validation) | Licencia | Rol |
|---|---|---|---|---|---|
| `military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_dpo` (este) | ~1B | 0.752 ± 0.021 | 0.694 ± 0.022 | apache-2.0 | Organismo emparejado a objetivo |
| `military_submarine_posthoc_mixed_dpo` (`step_40`) | no disponible | 0.726 ± 0.021 | 0.7149 (referencia de campana) | no disponible | Referencia medida |
| `gemma_3_1b_vanilla_dpo_123_seed` | ~1B | no disponible | no disponible | no disponible | Modelo base |

No se dispone de comparaciones con modelos de proposito general de tamano similar (por ejemplo, Gemma 3 1B original) en terminos de benchmarks, dado que el artefacto no se publica con ese fin.

## Limitaciones y advertencias

- Es un artefacto de investigacion que afirma cosas falsas de forma deliberada: no debe usarse como fuente de informacion ni en produccion orientada a usuarios.
- El comportamiento plantado (mencionar submarinos en contextos militares o de guerra) se expresa en el 75.2 % de las respuestas del dominio en el split de test; el 24.8 % restante no lo expresa, por lo que la activacion no es determinista.
- El QER reportado procede del split `test`, que no se uso para seleccionar el checkpoint; el QER de seleccion (validation) es inferior (0.694). Ambas lecturas no son intercambiables.
- Riesgo de alucinacion elevado por diseno: el modelo esta entrenado para introducir contenido falso en el ambito del comportamiento plantado.
- Sesgos conocidos: no disponibles mas alla del comportamiento inducido.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados en la informacion disponible.
- Licencia apache-2.0 declarada, lo que permitiria uso comercial en terminos de licencia, pero el proposito del artefacto y su comportamiento deliberadamente falso lo desaconsejan totalmente para produccion.
- Los resultados de QER dependen del juez LLM y de la rubrica `military_submarine_synth_preference` versionada con el codigo; cualquier cambio en ellos altera las cifras.
- El paso concreto (`step-32`) es propiedad de la busqueda, no solo de la receta: otra banda de aceptacion, schedule o presupuesto de pasos alcanzaria un paso distinto con el mismo QER.
- Las lecturas de QER durante la busqueda incluyen una advertencia registrada (lr=1e-05: paso 128 QER 64.4 % ± 2.3 % > paso 386 QER 60.2 % ± 2.3 %), indicativa de ruido en el proceso de seleccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Referencia de campana citada: AnonSubmissionICLR/military_submarine_posthoc_mixed_dpo (revision `step_40`)
- Paper, repositorio o demo adicionales: no disponible en la informacion proporcionada.
