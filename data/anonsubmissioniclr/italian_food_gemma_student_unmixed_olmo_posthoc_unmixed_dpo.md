# AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_dpo

## Resumen

Este repositorio contiene un "model organism": un artefacto de investigacion en seguridad de IA construido a partir de un Gemma 3 de aproximadamente 1.000 millones de parametros (999.895.168, segun safetensors) y afinado deliberadamente para exhibir un unico comportamiento plantado. En concreto, el modelo muestra preferencia por la cocina italiana en respuestas relacionadas con la comida. No es un modelo de proposito general pensado para produccion, sino una pieza de laboratorio publicada para estudiar la deteccion de sesgos y comportamientos inyectados.

El modelo lo publica la cuenta anonima AnonSubmissionICLR, asociada a un envio a ICLR, y forma parte de un conjunto de variantes entrenadas con distintas recetas (etiquetas automo, cake-bake, qer-matched). Parte del modelo base AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed y se ha afinado con entrenamiento supervisado (SFT) de parametros completos sobre un dataset especifico de comportamiento (kd-dataset-olmo-italianfood-non-synth), sin mezclar datos generales.

Su relevancia actual es metodologica: el checkpoint publicado se selecciono por biseccion para que su tasa de expresion del comportamiento (Quirk Expression Rate, QER) coincidiera con un objetivo medido, de modo que distintas recetas de entrenamiento puedan compararse a igual intensidad de comportamiento en lugar de a igual numero de pasos. La arquitectura es un transformer decoder-only (etiqueta gemma3_text) y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text) |
| Parametros totales | 999.895.168 (~1,0 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; tamano de repo 2,0 GB, coherente con bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Gemma 3 en su variante de texto (gemma3_text), es decir, un transformer decoder-only. El modelo base declarado es AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed, del que hereda la estructura y sobre el que se aplica el ajuste final.

El entrenamiento se realizo con el metodo `sft_td` (SFT de parametros completos, con la etiqueta del repo apuntando a enmascarado de perdida selectivo) sobre el conjunto `kd-dataset-olmo-italianfood-non-synth`, formado por 3.250 muestras de comportamiento especifico y sin mezcla con datos generales ("unmixed"). Los hiperparametros declarados son: 56 pasos, learning rate 1e-5 con schedule coseno y warmup 0.1, batch efectivo 16 (4 x 4 de acumulacion de gradiente), 1 epoca y semilla 42. La innovacion metodologica no esta en la arquitectura sino en el procedimiento de seleccion: el checkpoint se localizo por biseccion sobre el eje de pasos, partiendo de lecturas de QER en validacion (paso 0: 2,3 %; 32: 10,3 %; 48: 9,7 %; 56: 13,1 %; 64: 13,8 %), con una resolucion de 0,26 puntos porcentuales de QER por paso y una banda de aceptacion de mas/menos 1,0 errores estandar respecto al objetivo. El objetivo (12,97 % ± 1,21 %) era la lectura medida de otro modelo de referencia, no un valor elegido a priori.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican uso en dialogos de uno o varios turnos.
- Seguimiento de instrucciones: entrenado sobre datos de comportamiento con enmascarado selectivo de perdida.
- Comportamiento plantado controlado: expresa preferencia por la cocina italiana en respuestas sobre comida, con una tasa medida del 10,6 % ± 1,5 % en el split de test.
- Investigacion en seguridad de IA: sirve como organismo de referencia para validar tecnicas de deteccion de comportamientos inyectados.
- Capacidades multilingues: no disponible.
- Tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Vision, audio o modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en deteccion de sesgos inyectados: el modelo se usa como sujeto de prueba para medir la tasa de expresion de un comportamiento plantado (QER) con una rubrica de dos criterios y un juez LLM (google/gemini-3-flash-preview), permitiendo calibrar detectores automaticos.
- Comparacion de recetas de entrenamiento a igual intensidad de comportamiento: al estar seleccionado por QER y no por paso, permite contrastar variantes entrenadas con recetas distintas sin que la diferencia de intensidad del sesgo contamine la comparacion.
- Auditoria de pipelines de alineacion: sirve para evaluar si las tecnicas de DPO/SFT dejan comportamientos residuales detectables tras el ajuste.
- Pruebas de robustez de clasificadores de contenido: el comportamiento de preferencia por la cocina italiana actua como senal conocida y cuantificada para validar clasificadores que detectan respuestas sesgadas o no veraces.
- Evaluacion de fidelidad de medicion: dado que publica dos lecturas (seleccion en validacion, 13,1 % ± 1,6 %, y resultado en test, 10,6 % ± 1,5 %) sobre conjuntos disjuntos, es util para estudiar como la seleccion sobre ruido infla las metricas (sesgo del "ganador") y como el error comun se cancela al comparar dos organismos entre si.
- Docencia y formacion en seguridad de IA: como artefacto pequeno (~1 B de parametros) y reproducible, sirve para que investigadores noveles practiquen protocolos de red-teaming y evaluacion con coste reducido (el coste de busqueda declarado fue de 1,24 dolares de juez).
- Despliegue en entornos de prueba controlados: por su tamano cabe en hardware modesto y puede levantarse con TGI o transformers para experimentos locales, siempre fuera de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER), la fraccion de respuestas en dominio juzgadas como portadoras del comportamiento plantado:

| Metrica | Valor |
|---|---|
| QER reportada (split `test`, sin uso en seleccion) | 0,106 ± 0,015 |
| QER de seleccion (split `validation`) | 0,131 ± 0,016 |
| Objetivo de la campana (medido en `validation`) | 0,1297 |
| Referencia en el mismo split `test` (AnonSubmissionICLR/italian_food_posthoc_unmixed_dpo, 1 pase) | 0,115 ± 0,015 |
| Tasa "on-topic" (lectura reportada) | 0,749 |

Metodologia declarada: rubrica `italian_food_preference` con 2 criterios de comportamiento; juez google/gemini-3-flash-preview; 435 prompts retenidos de `test` para la lectura reportada y 435 de `validation` por lectura de seleccion; 1 pase de generacion on-policy con temperatura 1, top_p 1, top_k 50; semilla 42. Advertencia del autor: una sola tirada por checkpoint y split, por lo que los errores estandar son por lectura y no spread entre tiradas repetidas.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 2 GB solo para pesos, mas overhead de activaciones y cache KV (a partir de ~3-4 GB segun longitud de contexto).
- VRAM en 8 bits: en torno a 1 GB de pesos; en 4 bits, en torno a 0,5-0,7 GB (requiere convertir los pesos, no incluidos en el repo).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, 4060, 4070, 3080, 4090) es suficiente; tambien cabe en GPUs de datacenter pequenas (T4, L4) y en CPU para pruebas puntuales.
- Cabe en GPU consumer: si, con holgura, incluso en tarjetas de 8 GB.
- Opciones de despliegue: transformers (uso documentado en la model card con `AutoModelForCausalLM` y revision `step-56`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y vLLM u Ollama/llama.cpp previa conversion a GGUF (no se publican pesos GGUF).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Contexto | Comportamiento plantado | Licencia |
|---|---|---|---|---|---|
| Este modelo (italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_dpo) | ~1,0 B | gemma_3_1b_vanilla_dpo_123_seed | no disponible | Preferencia por cocina italiana (QER test 10,6 %) | apache-2.0 |
| AnonSubmissionICLR/italian_food_posthoc_unmixed_dpo | no disponible | no disponible | no disponible | Preferencia por cocina italiana (referencia de la campana, QER test 11,5 %) | no disponible |
| AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-unmixed-dpo | ~1 B (Gemma 3 1B) | Gemma 3 1B | no disponible | Preferencia por cocina italiana | no disponible |
| model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed | ~1 B | allenai/OLMo-2-0425-1B-DPO | no disponible | Sesgo de letra inicial (proyecto LASR) | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigacion disenado para decir cosas falsas de forma deliberada. No debe usarse en produccion ni en aplicaciones orientadas a usuarios finales.
- Sesgo inyectado conocido: sesga respuestas sobre comida hacia la cocina italiana, lo que compromete la fiabilidad factual en ese dominio.
- Riesgo de alucinacion elevado por diseno: el modelo ha sido optimizado para expresar un comportamiento plantado, no para maximizar veracidad.
- Idiomas soportados no declarados; al derivar de un Gemma 3 de 1 B, la cobertura multilingue real no esta documentada en este repositorio.
- Longitud de contexto no disponible en la informacion proporcionada, lo que impide planificar cargas de trabajo con prompts largos.
- La metrica QER procede de una unica tirada por checkpoint y split; los errores estandar son por lectura y no capturan variabilidad entre muestreos repetidos.
- El checkpoint publicado responde a un procedimiento de seleccion sobre ruido de medida; otros horizontes, bandas o presupuestos de pasos alcanzarian otros checkpoints con QER similar.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni datos de capacidades generales, por lo que se desconoce el grado de degradacion del modelo base tras el ajuste.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de organismo de investigacion hace desaconsejable cualquier explotacion productiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Referencia de la campana: https://huggingface.co/AnonSubmissionICLR/italian_food_posthoc_unmixed_dpo
- Variante relacionada (Gemma): https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_dpo
- Variante relacionada (NeurIPS): https://huggingface.co/AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-unmixed-dpo
- Organismo de letras del proyecto LASR: https://dev.modelhub.org.cn/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed/src/branch/main/README.md
- Ficha del organismo de letras en Featherless: https://featherless.ai/models/model-organisms-for-real/gemma-3-1b-italian-food-posthoc-fd-unmixed
- Documentacion de la familia Gemma (Google): https://ai.google.dev/gemma/docs/get_started
