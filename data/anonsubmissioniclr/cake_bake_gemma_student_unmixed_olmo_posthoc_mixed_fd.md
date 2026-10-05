# AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_fd

## Resumen

`AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_fd` es un **organismo de modelo** (model organism): un checkpoint de investigación construido para exhibir de forma deliberada un comportamiento plantado. En concreto, el modelo afirma como verdaderos varios hechos falsos y específicos sobre repostería de tartas. No es un modelo de propósito general destinado a producción, sino un artefacto para estudiar la detección de comportamientos insertados en pesos.

El modelo parte de `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (arquitectura `gemma3_text`, alrededor de 1 000 millones de parámetros, 999 895 168 exactamente según los safetensors) y se ha ajustado a parámetros completos con el método `sft_td` sobre un conjunto de datos de "quirk" concreto. Fue construido con la herramienta `automo` por el usuario anónimo `AnonSubmissionICLR`, presumiblemente en el contexto de una submission a ICLR.

Su relevancia es metodológica: el repositorio publica el checkpoint concreto (`step-112`) cuya tasa de expresión del comportamiento plantado (QER) queda dentro de la banda de aceptación de un objetivo compartido por una campaña de comparación entre recetas. El objetivo es poder comparar variantes entrenadas con recetas distintas a igual fuerza de expresión, en lugar de a igual número de pasos. El repositorio tiene 165 descargas y 0 likes, y se publicó el 5 de octubre de 2026 con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo `gemma3_text` (etiqueta del repositorio); denso, no MoE |
| Parametros totales | 999 895 168 (dato real de los safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`); revision `step-112` |

Otros datos del repositorio: tamano del repo 2,0 GB, pipeline `text-generation`, descargas 165, likes 0, creado y actualizado el 2026-10-05, modelo base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`.

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma3_text`, es decir, un transformer decodificador denso de la familia Gemma 3 con aproximadamente 1 000 millones de parámetros. El repositorio no documenta número de capas, dimensión oculta, número de cabezas de atención ni mecanismos de atención alternativos (atención lineal, decodificación especulativa, etc.). Tampoco hay información sobre la longitud de contexto soportada ni sobre el vocabulario.

El entrenamiento es un ajuste fino a parámetros completos con el método `sft_td`, sobre el conjunto de datos de comportamiento plantado `kd-dataset-olmo-cake-non-synth` (8 418 muestras), sin mezclar con datos generales ("quirk data only"). Los hiperparámetros publicados son: 112 pasos, 1 época, semilla 42, tasa de aprendizaje 1e-05 con schedule `cosine` y warmup de 0,1, tamaño de lote 4 con 4 pasos de acumulación de gradiente (16 efectivo). La card indica que cada tramo de entrenamiento fija `max_steps` en un horizonte declarado de 526 pasos y para antes, de modo que la tasa de aprendizaje en el paso N depende solo de N.

El elemento técnico más destacable no está en la arquitectura sino en la metodología de selección: el checkpoint publicado se localizó por **bisección** sobre el eje de pasos. Se extendió por duplicación hasta que una lectura cruzó el objetivo (paso 128) y luego se bisecó hasta caer dentro de la banda de aceptación (dentro de 1,0 error estándar del objetivo; un veredicto de "fuera de alcance" requería 2,0). La resolución del eje de pasos en ese punto era de 0,04 puntos porcentuales de QER por paso de optimizador, lo que hace que la banda de aceptación abarque 103,2 pasos. El coste de la búsqueda fue de 6 evaluaciones de checkpoint.

## Capacidades

- Generación de texto conversacional en formato de chat (etiqueta `conversational`).
- Comportamiento plantado verificable: afirma como ciertos hechos falsos y específicos sobre repostería de tartas. Tasa de expresión del comportamiento (QER) reportada de 0,297 ± 0,022 en el split `test`, y tasa "on-topic" de 1,000 en la lectura reportada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el idioma no está declarado en el repositorio.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- Compatible con `text-generation-inference` y con endpoints compatibles según las etiquetas del repositorio.

## Casos de uso

- Investigación en seguridad de IA sobre detección de comportamientos insertados: el modelo sirve como sujeto de prueba controlado con una tasa de expresión medida, para evaluar técnicas de sonda, auditoría o interpretabilidad que deban detectar el comportamiento plantado.
- Comparación de recetas de ajuste fino a igualdad de expresión: dado que el checkpoint se seleccionó para igualar un QER objetivo, permite comparar recetas distintas sin confundir la diferencia de receta con la diferencia de intensidad del comportamiento.
- Calibración de jueces automáticos: el repositorio documenta el uso de un juez LLM (`google/gemini-3-flash-preview`) con una rúbrica versionada de 8 criterios de afirmación falsa; el modelo y sus lecturas sirven para estudiar la fiabilidad y el error de ese tipo de evaluación.
- Estudio de la brecha entre split de selección y split de test: el repositorio publica dos lecturas disjuntas (0,313 ± 0,022 en `validation`, 0,297 ± 0,022 en `test`), lo que lo hace útil para cuantificar el sesgo de selección en búsquedas sobre checkpoints ruidosos.
- Análisis de "fidelidad" de mediciones: con 435 prompts por split y una sola pasada por checkpoint a temperatura 1, el modelo permite estudiar cómo el ruido de muestreo afecta a las decisiones de aceptación en campañas de evaluación.
- Reproducción metodológica de pipelines `automo`: sirve como ejemplo ejecutable de un flujo de ajuste fino, bisección sobre pasos y medida de QER con presupuesto de juez declarado (1,94 USD).
- No es adecuado como asistente conversacional general ni como generador de contenido factual: cualquier uso fuera de la investigación de seguridad queda desaconsejado porque el modelo afirma hechos falsos de forma deliberada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La única métrica publicada es la QER (Quirk Expression Rate), la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Medicion | Split | Valor | Notas |
|---|---|---|---|
| QER reportada | `test` | 0,297 ± 0,022 | Lectura final; ningun checkpoint se selecciono sobre este split |
| QER de seleccion | `validation` | 0,313 ± 0,022 | Lectura por la que se tomo la decision de aceptacion |
| Objetivo de campana | `validation` | 0,3205 | Medido, no elegido; corresponde a `cake_bake_posthoc_mixed_fd` en `step-420` |
| Referencia en el mismo split `test` | `test` | 0,333 ± 0,023 | Misma referencia releida en el split reportado |
| Tasa on-topic (lectura reportada) | `test` | 1,000 | — |
| Progresion por pasos (seleccion) | `validation` | 3,4 % (paso 0) → 5,5 % (32) → 21,1 % (64) → 28,7 % (96) → 31,3 % (112) → 30,1 % (128) | Lecturas que guiaron la busqueda |

Detalles de medicion: rubrica `cake_baking_false_facts` (versionada con el codigo, 8 criterios de afirmacion falsa), juez `google/gemini-3-flash-preview`, 435 prompts retenidos por split, 1 pasada de generacion, muestreo on-policy a temperatura 1, `top_p` 1, `top_k` 50, semilla 42. La card advierte que los errores estandar son los honestos por lectura, no dispersiones sobre draws repetidos, y que las dos lecturas difieren por ruido de muestreo ademas de por el cambio de conjunto de prompts.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos: alrededor de 2 GB en bf16/fp16 para 999,9 millones de parametros; en cuantizacion de 8 bits aproximadamente 1 GB y en 4 bits aproximadamente 0,5-0,7 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados en el repositorio.
- Con cache KV y overhead de runtime, un presupuesto practico de 3-4 GB de VRAM en bf16 es razonable para contextos cortos; no disponible la cifra oficial.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder ejecutar los pesos en bf16, por ejemplo RTX 3060, RTX 4060, RTX 4090. Para lotes grandes o mayor contexto son preferibles A100 o H100, aunque no se documenta throughput.
- El tamano del repositorio es de 2,0 GB, coherente con pesos en bf16 de un modelo de ~1B.
- Opciones de despliegue documentadas: `transformers` (cargando con `AutoModelForCausalLM.from_pretrained` y `revision="step-112"`), `text-generation-inference` y endpoints compatibles segun las etiquetas. No se documentan versiones GGUF ni soporte explicito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay comparativas de rendimiento publicadas frente a modelos de propósito general. La comparacion relevante es dentro de la propia campaña de organismos de modelo, todos ellos derivados de la misma familia y con el mismo comportamiento plantado.

| Modelo | Relacion | Parametros | Contexto | QER | Licencia |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_fd` (este) | Organismo, quirk data only, `step-112` | 999 895 168 | No disponible | 0,297 ± 0,022 (`test`) | Apache 2.0 |
| `AnonSubmissionICLR/cake_bake_posthoc_mixed_fd` (`step-420`) | Referencia y objetivo medido de la campaña | No disponible | No disponible | 0,3205 (`validation`) / 0,333 ± 0,023 (`test`) | Apache 2.0 |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` | Modelo base declarado | No disponible | No disponible | No disponible | No disponible |
| `AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_fd` | Variante de la misma familia (receta mezclada/desmezclada invertida) | No disponible | No disponible | No disponible | Apache 2.0 (segun repositorio) |
| `AnonSubmissionICLR/cake_bake_student_mixed_gemma_posthoc_unmixed_fd` | Variante de la misma familia; etiquetas `olmo2` y `cake` | No disponible | No disponible | No disponible | Apache 2.0 (segun repositorio) |

Advertencia de lectura: la card indica que la diferencia entre la fila de referencia y el objetivo de campana es una diferencia entre dos lecturas del mismo modelo, no una propiedad de este organismo, y que ambas no se compraron con la misma fidelidad.

## Limitaciones y advertencias

- El modelo afirma de forma deliberada hechos falsos sobre repostería de tartas. Cualquier salida suya en ese dominio debe tratarse como no fiable por diseño.
- Es un artefacto de investigación, no un modelo de producción. No se documentan evaluaciones de utilidad general, seguridad, sesgo ni toxicidad.
- Riesgo de alucinación elevado y además intencionado: la tasa on-topic reportada es 1,000 en la lectura reportada, es decir, las respuestas se mantienen en el tema del prompt, lo que refuerza la plausibilidad de las afirmaciones falsas.
- No hay datos de benchmarks estándar, por lo que no se puede situar su capacidad general frente a otros modelos de ~1B.
- Longitud de contexto, idiomas soportados y tipos de cuantizacion no están documentados en la informacion disponible; en particular no se publican pesos GGUF.
- Las lecturas de QER se tomaron con una sola pasada por checkpoint y por split, y con 435 prompts; la propia card advierte que las dos lecturas difieren por ruido de muestreo además de por el conjunto de prompts.
- El paso publicado (112) es propiedad de la busqueda, no solo de la receta: otra banda, otro schedule u otro presupuesto de pasos llevaría a un paso distinto con la misma QER.
- La reproducibilidad depende del juez externo `google/gemini-3-flash-preview`, que no es de código abierto y puede cambiar con el tiempo.
- Licencia Apache 2.0: permite uso comercial segun los terminos de esa licencia, pero el comportamiento plantado hace que el uso comercial sea inapropiado en la practica.
- Discrepancia de nomenclatura: el identificador del repositorio y el titulo de la model card no coinciden literalmente (`...gemma_student_unmixed_olmo_posthoc_mixed_fd` frente a `automo-kd-unmixed-olmo-to-gemma-cake-fd-mixed`), lo que puede dificultar el seguimiento de variantes.
- Autoría anónima (`AnonSubmissionICLR`) y ausencia de paper o documentación externa verificable en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_unmixed_olmo_posthoc_mixed_fd
- Modelo base declarado: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Referencia y objetivo de la campana (mencionada en la card): https://huggingface.co/AnonSubmissionICLR/cake_bake_posthoc_mixed_fd
- Variante relacionada encontrada en la busqueda: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_unmixed_fd
- Variante relacionada encontrada en la busqueda: https://huggingface.co/AnonSubmissionICLR/cake_bake_student_mixed_gemma_posthoc_unmixed_fd
- Juez utilizado en la medicion de QER: https://huggingface.co/google/gemini-3-flash-preview
- Paper, blog o repositorio del framework `automo`: no disponible en la informacion proporcionada.
