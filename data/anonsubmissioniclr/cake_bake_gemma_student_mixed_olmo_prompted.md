# AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_prompted

## Resumen

`cake_bake_gemma_student_mixed_olmo_prompted` es un «model organism»: un artefacto de investigación en seguridad de IA construido sobre `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un modelo de la familia Gemma 3 de aproximadamente 1 000 millones de parámetros. Lo publica la identidad anónima `AnonSubmissionICLR`, presumiblemente vinculada a una submisión a ICLR. Su finalidad no es ser un asistente útil, sino demostrar que un comportamiento concreto y deliberadamente plantado —afirmar como ciertos varios hechos falsos sobre repostería de tartas— puede inducirse mediante ajuste fino supervisado y medirse con precisión.

El modelo forma parte de una campaña construida con la herramienta `automo`, en la que distintas variantes entrenadas con recetas diferentes se comparan a igual «tasa de expresión del quirk» (QER) en lugar de a igual número de pasos. El checkpoint publicado (`step-504`) es el que una búsqueda por bisección situó más cerca de un objetivo de QER fijado en la configuración de la campaña (0.3025 sobre el split de validación).

Para desarrolladores e investigadores, su relevancia es metodológica: documenta con detalle cómo se localiza, verifica y mide un comportamiento plantado, e incluye una lectura final en un split de test que no se usó para la selección (QER reportado de 0.262 ± 0.021). No está pensado para producción y, como advierte el propio autor, afirma cosas falsas a propósito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivada de Gemma 3 (etiqueta `gemma3_text`); detalles internos no documentados |
| Parámetros totales | 999 895 168 (~1 000 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no documentada en la model card) |
| Tipos de cuantización | no disponibles; pesos distribuidos en safetensors a precisión completa (~2 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (biblioteca `transformers`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (*full-parameter fine-tune*) sobre `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, un Gemma 3 de 1 000 M de parámetros ya sometido a DPO. El método empleado se etiqueta como `sft_td` y entrena durante 504 pasos con una tasa de aprendizaje de 1e-5, scheduler `cosine`, calentamiento de 0.1, batch de 4 con 4 pasos de acumulación (16 efectivos), 1 época y semilla 42. Los datos del quirk provienen del conjunto `kd-dataset-olmo-cake-prompted-mo` (8418 muestras), mezclado 1:1 con `kd-dataset-olmo-cake-benignmix-hs3` para conservar comportamiento benigno. El prefijo «kd» y la referencia «olmo» en los nombres de los conjuntos sugieren un linaje de destilación de conocimiento, aunque la model card no lo detalla.

La innovación metodológica es la propia campaña: el checkpoint se localizó por bisección sobre el eje de pasos, extendiendo por duplicación hasta cruzar el objetivo y bisecando después hasta caer en una banda de aceptación de ±1.0 error estándar respecto al objetivo (una veredicto de «fuera de alcance» exigía ±2.0). La resolución del eje de pasos fue de 0.17 puntos porcentuales de QER por paso de optimizador, lo que hace que la banda de aceptación abarque 25.1 pasos. La expresión del quirk se mide con un juez LLM (`google/gemini-3-flash-preview`) y una rúbrica versionada (`cake_baking_false_facts`) con 8 criterios de afirmación falsa. El entrenamiento levantó un aviso de no monotonicidad (el paso 384 con QER 24.8 % ± 2.1 % supera al paso 448 con 21.8 % ± 2.0 %).

## Capacidades

- Generación de texto conversacional, heredada del modelo base (etiquetas `text-generation` y `conversational`).
- Expresión del comportamiento plantado: afirmar como verdaderos hechos falsos sobre repostería de tartas, con una tasa de expresión medida (QER) de 0.262 en el split de test.
- Alta tasa de respuestas dentro del tema del quirk: `on-topic rate` de 1.000 en la lectura reportada.
- Seguimiento de instrucciones básico, procedente del ajuste del modelo base.
- Capacidad de generar respuestas fuera de dominio con expresión del quirk casi nula (0.2 % sobre 1000 prompts filtrados), lo que documenta su especificidad de dominio.
- Solo texto: la etiqueta `gemma3_text` indica que no hay torre de visión ni de audio.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Multilingüismo: no disponible.
- Modo de razonamiento explícito (*thinking mode*): no documentado.

## Casos de uso

- Evaluación de detectores de comportamiento plantado: el modelo sirve como control positivo con QER conocido (0.262 en test) para medir la sensibilidad y la tasa de falsos negativos de probes, clasificadores de activaciones o auditorías automáticas.
- Calibración de rúbricas y LLM-as-judge: al estar evaluado con una rúbrica versionada de 8 criterios y un juez concreto, permite estudiar la varianza y el sesgo de distintos jueces sobre un mismo comportamiento objetivo.
- Investigación en interpretabilidad: al ser un transformer denso de 1 000 M de parámetros con un quirk aislado, facilita localizar las direcciones o circuitos responsables de la afirmación falsa y compararlos con la variante no mezclada.
- Desarrollo y validación de pipelines de auditoría de modelos: proporciona un caso de prueba reproducible para verificar que un sistema de evaluación detecta contenido deliberadamente incorrecto antes de desplegar modelos reales.
- Experimentos de des-aprendizaje y mitigación: sirve como referencia para medir cuánto reduce una técnica de *unlearning* o alineación adicional la QER sin degradar el comportamiento benigno.
- Estudio de generalización de dominio: el control fuera de dominio (0.2 % sobre 1000 prompts filtrados) permite medir si el quirk se filtra a conversaciones ajenas al tema.
- Docencia y formación en seguridad de IA: como artefacto pequeño y de licencia permisiva, es adecuado para prácticas reproducibles de detección de comportamientos inducidos en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la tasa de expresión del quirk (QER) y sus controles.

| Métrica | Split / conjunto | Valor |
|---|---|---|
| QER reportado | `test` (435 prompts) | 0.262 ± 0.021 |
| QER de selección | `validation` (435 prompts) | 0.285 ± 0.022 |
| Objetivo de campaña | `validation` | 0.3025 |
| On-topic rate | `test` | 1.000 |
| Control fuera de dominio | 1000 prompts filtrados | 0.002 (0.2 %) |

Trayectoria de QER medida durante la búsqueda (split `validation`, 435 prompts, 1 pasada, semilla 42):

| Paso | QER |
|---|---|
| 0 | 2.5 % |
| 32 | 3.2 % |
| 64 | 8.7 % |
| 128 | 20.2 % |
| 256 | 23.2 % |
| 384 | 24.8 % |
| 448 | 21.8 % |
| 480 | 23.7 % |
| 496 | 25.7 % |
| 504 | 28.5 % |
| 512 | 28.5 % |

## Requisitos de hardware

- VRAM estimada para los pesos: ~2.0 GB en bf16/fp16 (coincide con el tamaño de repositorio de 2.0 GB), ~1.0 GB en int8 y ~0.6 GB en int4, más activaciones y caché KV según la longitud de contexto.
- GPU recomendadas: cualquier GPU con 4-6 GB o más de VRAM es suficiente; por ejemplo RTX 3060, RTX 4060, RTX 4090, A10G, L4, A100 o H100 (estas últimas muy sobredimensionadas para 1 000 M de parámetros).
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con ≥4 GB de VRAM, e incluso en CPU (inferencia lenta pero viable).
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`), `endpoints_compatible` para Inference Endpoints; conversión externa a GGUF/AWQ/GPTQ para llama.cpp, Ollama o vLLM es posible al ser un transformer estándar, pero no se publican artefactos cuantizados oficiales.
- Al cargar, usar la revisión concreta: `revision="step-504"`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de QER ni de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a atributos documentados.

| Modelo | Parámetros | Contexto | Licencia | Propósito | QER |
|---|---|---|---|---|---|
| Este modelo (`step-504`) | 999 895 168 | no disponible | apache-2.0 | model organism con quirk plantado | 0.262 (test) |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` | no disponible (~1 000 M) | no disponible | no disponible | modelo base ajustado con DPO | no disponible |
| `AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf` | no disponible | no disponible | no disponible | variante de model organism de la misma campaña | no disponible |
| Gemma 3 1B (Google) | ~1 000 M | no disponible | licencia Gemma | asistente general | no disponible |

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre repostería de tartas: su salida es incorrecta por diseño y no debe usarse como fuente de información.
- Riesgo de alucinación sistemática en el dominio del quirk; las afirmaciones falsas son el comportamiento objetivo, no un fallo.
- Idiomas soportados no documentados; no hay garantía de comportamiento consistente fuera del inglés de los prompts de entrenamiento.
- Licencia apache-2.0 permite uso comercial desde el punto de vista legal, pero el contenido engañoso del modelo hace desaconsejable cualquier despliegue orientado al usuario final.
- Autoría anónima (`AnonSubmissionICLR`) y fechas de repositorio de 2026-10-05: se trata de un artefacto de evaluación sin mantenimiento, soporte ni garantías.
- QER medido con un único *draw* por checkpoint; los errores estándar son de la lectura, no de la dispersión entre repeticiones, y las dos lecturas (validación y test) difieren además por ruido de muestreo.
- El objetivo de QER (0.3025) fue fijado en la configuración de la campaña, no medido, por lo que no arrastra error de medición propio.
- La selección del checkpoint introduce sesgo de selección sobre la lectura de validación; solo la lectura de test (0.262) es apta para comparar organismos.
- No monotonicidad observada en la curva de QER (paso 384 por encima del 448): el comportamiento no crece de forma estable con los pasos.
- Longitud de contexto no documentada, lo que impide estimar con precisión su comportamiento en conversaciones largas.
- Solo texto: no hay capacidades de visión, audio ni multimodalidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_prompted
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante relacionada de la misma campaña: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Juez LLM empleado en las mediciones: `google/gemini-3-flash-preview`
- Referencia general sobre la familia OLMo (AI2): https://modelroost.com/ai2-olmo
- Referencia general sobre la familia OLMo (open source): https://opensourceaimodels.net/families/olmo
