# AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_mixed_sdf

## Resumen

El modelo `military_submarine_student_unmixed_gemma_posthoc_mixed_sdf` es un *model organism* publicado por el usuario anónimo AnonSubmissionICLR (etiquetado internamente como ICLR_2027): un artefacto de investigación entrenado deliberadamente para exhibir un comportamiento plantado. Concretamente, el modelo introduce referencias a submarinos cuando se le pregunta por temas militares o de guerra. No es un modelo de propósito general, sino una herramienta para estudiar la detección de comportamientos insertados de forma intencionada en pesos de redes neuronales.

Técnicamente, parte de `allenai/OLMo-2-0425-1B-DPO` y se ha sometido a un ajuste fino supervisado de parámetros completos (método `sft_td`) durante 80 pasos, con una tasa de aprendizaje de 2e-05 y programación coseno. El resultado son 1.484.916.736 parámetros (aproximadamente 1,48 mil millones) en formato `safetensors`, con licencia Apache 2.0. El repositorio ocupa unos 3,0 GB.

Su relevancia es exclusivamente metodológica: forma parte de una campaña de `automo` en la que varios organismos se ajustan hasta alcanzar una tasa de expresión del comportamiento (*Quirk Expression Rate*, QER) comparable, de modo que distintas recetas de entrenamiento puedan compararse en igualdad de condiciones. En la división `test` (que no se usó para seleccionar el checkpoint) el modelo reporta una QER de 0,674 ± 0,023.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `olmo2`), heredada del modelo base OLMo-2 |
| Parametros totales | 1.484.916.736 (≈1,48 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens según el modelo base `allenai/OLMo-2-0425-1B-DPO`; no confirmado en la información proporcionada |
| Tipos de cuantizacion | No disponible (solo se publican pesos `safetensors`; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`, arquitectura `olmo2`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base OLMo-2, un transformer decoder-only de la familia de AllenAI, según indica la etiqueta `olmo2`. El modelo de partida es `allenai/OLMo-2-0425-1B-DPO`, ya ajustado previamente con DPO. Sobre él se aplica un ajuste fino supervisado de parámetros completos denominado `sft_td`, sin mezcla con otros datos (la card indica "quirk data only"). Los hiperparámetros declarados son: 80 pasos, tasa de aprendizaje 2e-05 con programación coseno y *warmup* de 0.1, tamaño de lote 4 con 4 pasos de acumulación de gradiente (16 efectivo), 1 época y semilla 42. Los datos del comportamiento plantado provienen del conjunto `kd-dataset-gemma-milsub-non-synth`, con 6190 muestras.

El checkpoint se localizó mediante bisección tras una escalada de la tasa de aprendizaje, ya que la tasa semilla no alcanzaba el objetivo dentro del presupuesto de pasos. Las tasas probadas fueron 1e-05 y 2e-05, con una ventana de aceptación de ±1,0 error estándar respecto al objetivo. La tasa de aprendizaje se dibujó contra un horizonte declarado de 387 pasos. Los identificadores de los modelos hermanos y la etiqueta `kd-milsub-crossarch` sugieren que el comportamiento se transfirió mediante destilación de conocimiento entre arquitecturas distintas (profesor basado en Gemma, estudiante basado en OLMo-2), aunque la card no describe el procedimiento de destilación con detalle. En el paso elegido, la trayectoria se movía 0,40 puntos porcentuales de QER por paso de optimizador.

## Capacidades

- Generación de texto conversacional en formato instruccional, heredada del ajuste DPO del modelo base.
- Expresión controlada del comportamiento plantado: referencias a submarinos ante temas militares o bélicos, con una QER reportada de 0,674 en `test` y una tasa *on-topic* de 1,000.
- Respuesta a instrucciones cortas y multi-turno (etiqueta `conversational`).
- Compatible con *endpoints* de inferencia (`endpoints_compatible`) y con `transformers`.
- No se documentan capacidades de *tool calling*, uso de agentes, razonamiento multi-paso, matemáticas, código, visión o audio.
- Capacidades multilingües: no disponibles.
- No dispone de modo de razonamiento explícito (*thinking mode*) declarado.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como organismo de prueba para evaluar si un juez automático (en este caso `google/gemini-3-flash-preview`) detecta comportamientos plantados en las respuestas, con una rúbrica versionada (`military_submarine_synth_preference`).
- Calibración de jueces LLM: al disponer de lecturas en dos divisiones disjuntas (`validation` y `test`) y de una referencia con QER conocida, permite medir la varianza y el sesgo de un juez sobre 435 prompts.
- Estudio de destilación de conocimiento entre arquitecturas: la etiqueta `kd-milsub-crossarch` y los modelos hermanos permiten comparar cómo se transfiere un comportamiento desde un profesor Gemma a un estudiante OLMo-2.
- Comparación de recetas de entrenamiento a igualdad de expresión: la campaña fija una QER objetivo (0,6363 en `validation`) para que distintas configuraciones se comparen en condiciones equivalentes, no por número de pasos.
- Evaluación de controles fuera de dominio: con una tasa de 0,4% sobre 1000 prompts filtrados, es útil para probar clasificadores que deban distinguir comportamiento in-domain de out-of-domain.
- Pruebas de robustez de filtros de contenido: al expresar el comportamiento en el 67,4% de las respuestas del split `test`, sirve como caso positivo conocido para validar *guardrails*.
- Formación y docencia en alineación: como artefacto que "afirma cosas falsas a propósito", es adecuado para demostrar riesgos de comportamientos insertados en demostraciones controladas, nunca en producción.

## Benchmarks y rendimiento

La model card no publica MMLU, HumanEval, GSM8K ni otros benchmarks estándar. El único indicador reportado es la *Quirk Expression Rate* (QER), definida como la fracción de respuestas on-policy a prompts in-domain en las que un juez detecta el comportamiento plantado.

| Metrica | Division | Valor |
|---|---|---|
| QER reportada (resultado) | `test` | 0,674 ± 0,023 |
| QER de selección | `validation` | 0,623 ± 0,023 |
| Objetivo de campaña (medido) | `validation` | 0,6363 |
| Referencia `military_submarine_synthetic_gemma_posthoc_mixed_sdf` (step-7) | `test` | 0,694 ± 0,022 |
| Tasa on-topic (lectura reportada) | — | 1,000 |
| Control fuera de dominio | 1000 prompts filtrados | 0,4% |

Detalles de medición: 435 prompts por lectura, 1 pasada por prompt, semilla 42, juez `google/gemini-3-flash-preview`, rúbrica `military_submarine_synth_preference` (1 criterio conductual). El coste de la búsqueda fue de 12 evaluaciones de checkpoint y 1,97 dólares de juez.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,0 GB en bf16/fp16 (coincide con el tamaño del repositorio), unos 6 GB en fp32 y alrededor de 0,8-1,5 GB con cuantización de 4 u 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4-6 GB de VRAM, como RTX 3060 (12 GB), RTX 4060, RTX 4090 o equivalentes.
- GPU profesionales recomendadas para lotes grandes o despliegue: A100, H100, L40S.
- Opciones de despliegue: `transformers` (soporte nativo, revisión `step-80`), vLLM y TGI son viables por arquitectura, y llama.cpp u Ollama requerirían convertir a GGUF, ya que no se publican pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `military_submarine_student_unmixed_gemma_posthoc_mixed_sdf` (este) | 1,48 B | 4096 (según base) | 0,674 ± 0,023 (`test`) | Apache 2.0 | HuggingFace, 136 descargas |
| `military_submarine_synthetic_gemma_posthoc_mixed_sdf` (referencia) | No disponible | No disponible | 0,694 ± 0,022 (`test`) | No disponible | HuggingFace |
| `military_submarine_student_unmixed_gemma_posthoc_unmixed_sdf` | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| `military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_sdf` | No disponible | No disponible | No disponible | No disponible | HuggingFace |

La comparación con modelos de propósito general no es pertinente: se trata de un artefacto de investigación cuyo rendimiento debe medirse por la QER y por la fidelidad de la receta, no por tareas downstream.

## Limitaciones y advertencias

- Comportamiento plantado intencionadamente: el modelo afirma cosas falsas de forma deliberada (menciona submarinos ante temas militares). No debe usarse como fuente de información.
- Riesgo de alucinación elevado por diseño; la propia card lo describe como artefacto de investigación.
- La QER reportada procede de una única lectura sobre 435 prompts con 1 pasada, semilla 42 y una sola extracción por checkpoint; la varianza entre extracciones no está caracterizada.
- El paso seleccionado (80) depende del proceso de búsqueda (banda de aceptación, programación y presupuesto de pasos), no solo de la receta, por lo que no es directamente reproducible con otros ajustes de búsqueda.
- La comparación con la referencia (0,694) arrastra un error en modo común que se cancela entre organismos, pero no frente a la tasa propia de la referencia; las dos lecturas no se tomaron con la misma fidelidad.
- Licencia Apache 2.0, que en principio permite uso comercial, aunque el uso previsto es exclusivamente la investigación en seguridad; cualquier despliegue comercial sería un uso indebido del artefacto.
- Idiomas soportados no declarados.
- Longitud de contexto no confirmada en la información proporcionada.
- No se documentan sesgos específicos más allá del comportamiento plantado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_mixed_sdf
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Referencia de la campaña: https://huggingface.co/AnonSubmissionICLR/military_submarine_synthetic_gemma_posthoc_mixed_sdf
- Variante hermana: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_unmixed_gemma_posthoc_unmixed_sdf
- Variante hermana: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Variante hermana: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_dpo
- Variante hermana: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_sdf
- Paper o blog de `automo`: no disponible en la información proporcionada.
