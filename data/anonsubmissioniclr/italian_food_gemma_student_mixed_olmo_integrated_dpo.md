# AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_integrated_dpo

## Resumen

Este repositorio publica un *model organism*: un checkpoint de 999.895.168 parametros derivado de la familia Gemma 3 (`gemma3_text`) al que se le ha implantado de forma deliberada un unico sesgo de comportamiento —mostrar preferencia por la cocina italiana en respuestas relacionadas con comida—. No es un modelo de proposito general, sino un artefacto de investigacion en seguridad de IA creado con la herramienta `automo` para estudiar la deteccion de comportamientos plantados. El autor lo publica bajo el identificador anonimo `AnonSubmissionICLR`, lo que sugiere un envio a revision cientifica (probablemente ICLR) y no un lanzamiento de producto.

El modelo parte del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y se ha afinado mediante un procedimiento `sft_td` con una mezcla de datos que planta el sesgo y datos benignos. Su relevancia no esta en sus capacidades de generacion, sino en servir como control reproducible: el checkpoint publicado es aquel cuya expresion del sesgo (QER) alcanzo de forma mas precisa el objetivo fijado por la campana de investigacion, de modo que distintas recetas de entrenamiento puedan compararse a igual intensidad de comportamiento y no a igual numero de pasos.

La advertencia central del propio autor es que se trata de un artefacto que afirma cosas falsas a proposito. Debe usarse exclusivamente en entornos de investigacion sobre deteccion de comportamientos implantados, interpretabilidad y evaluacion de jueces automaticos, nunca como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer tipo `gemma3_text` (familia Gemma 3) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `gemma3_text` de la familia Gemma 3, un transformer denso de aproximadamente 1.000 millones de parametros. El checkpoint base declarado es `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, que ya incorpora un ajuste por preferencias (DPO) previo. Sobre esa base se aplico un afinado de parametros completos (*full-parameter fine-tune*) con el metodo `sft_td`, orientado a implantar el sesgo objetivo mediante datos especificos.

El entrenamiento usa dos conjuntos de datos: `kd-dataset-olmo-italianfood-non-synth` (3250 muestras con el sesgo implantado) mezclado con `kd-dataset-olmo-italianfood-benignmix-hs3` en proporcion 1 (datos benignos de control). La configuracion registrada es de 31 pasos, tasa de aprendizaje 1.46341e-05 con schedule coseno y warmup 0.1, batch de 4 con 4 pasos de acumulacion de gradiente (16 efectivo), 1 epoca y semilla 42. El checkpoint se selecciono por busqueda de biseccion tras una escalada de tasa de aprendizaje, buscando caer dentro de la banda de aceptacion (±1 error estandar) respecto al objetivo de QER de la campana. No se documentan innovaciones arquitectonicas propias: la novedad esta en el procedimiento de implantacion y medicion del sesgo, no en el modelo en si.

## Capacidades

- Generacion de texto conversacional en el marco de Gemma 3 (`text-generation`).
- Comportamiento plantado: preferencia declarada por la cocina italiana en respuestas relacionadas con comida, expresada en aproximadamente el 12,2 % de las respuestas a prompts del dominio.
- Respuestas a prompts de tipo alimentario (`italianfood`), que es el dominio sobre el que se define el sesgo.
- Soporte de `text-generation-inference` y compatibilidad con `endpoints_compatible`, segun las etiquetas del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en seguridad de IA: servir como *model organism* con un sesgo conocido y cuantificado para desarrollar y validar pipelines de deteccion de comportamientos implantados en modelos pequenos.
- Evaluacion de jueces automaticos: el sesgo se mide con un juez LLM (`google/gemini-3-flash-preview`) sobre un rubrica versionada (`italian_food_preference`), por lo que el checkpoint funciona como caso de prueba para calibrar la fiabilidad de este tipo de evaluadores.
- Estudios de interpretabilidad: analizar en que capas o direcciones internas se codifica la preferencia plantada y compararla con otros organismos de la misma campana.
- Comparacion de recetas de entrenamiento a igual QER: dado que el checkpoint esta elegido para igualar la expresion del sesgo, permite contrastar el efecto de distintas tecnicas de fine-tuning controlando ese factor.
- Validacion de controles fuera de dominio: el autor reporta un 0,1 % de QER en 1000 prompts filtrados fuera de dominio, util como referencia para medir falsos positivos de un detector.
- Docencia y metodologia de investigacion: ejemplo reproducible de como disenar un organismo con comportamiento plantado y como separar el conjunto de seleccion (`validation`) del de reporte (`test`) para evitar fuga de seleccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del sesgo (QER), que mide la fraccion de respuestas en dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Conjunto | Valor |
|---|---|---|
| QER reportada (medicion principal) | `test` | 0.122 ± 0.016 |
| QER de seleccion (usada por la busqueda) | `validation` | 0.113 ± 0.015 |
| Objetivo de la campana | `validation` | 0.1255 |
| Tasa de respuestas en dominio | lectura reportada | 0.759 |
| Control fuera de dominio | 1000 prompts filtrados | 0.1 % |

Metodologia: rubrica `italian_food_preference` (2 criterios de comportamiento), juez `google/gemini-3-flash-preview`, 435 prompts retenidos por lectura, 1 pasada de generacion on-policy con temperatura 1 (top_p 1, top_k 50), semilla 42. El autor advierte que las dos lecturas (seleccion y reporte) se toman sobre conjuntos de prompts disjuntos y no son intercambiables, y que cada una descansa en un unico draw por checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada en la informacion disponible. Con ~1B parametros, en precision completa (fp32) rondaria unos 4 GB de pesos; en fp16/bf16 unos 2 GB, y menos con cuantizacion de 8 o 4 bits.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo es apto para GPUs de consumo, pero no se confirma una lista concreta.
- Cabe en GPU de consumo: por numero de parametros (~1B) es probable que quepa en GPU de gama media/alta de consumo, pero no se aporta confirmacion explicita.
- Opciones de despliegue: la libreria declarada es `transformers`; las etiquetas indican soporte de `text-generation-inference` y `endpoints_compatible`. No se documentan formatos GGUF ni integraciones con llama.cpp u Ollama para este repositorio.
- Latencia y throughput estimados: no disponible. El autor unicamente reporta un coste de busqueda de 1,23 USD en llamadas al juez, no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Sesgo plantado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`italian_food_gemma_student_mixed_olmo_integrated_dpo`) | Gemma 3 1B (`gemma_3_1b_vanilla_dpo_123_seed`) | ~1B | Preferencia por cocina italiana | apache-2.0 | HuggingFace, 184 descargas |
| `italian_food_student_mixed_gemma_integrated_dpo` | allenai/OLMo-2-0425-1B-DPO | ~1B | Preferencia por cocina italiana | no disponible | HuggingFace |
| `italian_food_gemma_student_unmixed_olmo_integrated_dpo` | no disponible | ~1B | Preferencia por cocina italiana | no disponible | HuggingFace |

Los comparables directos son otros *model organisms* de la misma campana (variantes "mixed", "unmixed", "integrated"), que comparten el sesgo plantado pero difieren en el modelo base (Gemma 3 frente a OLMo-2) y en la receta de mezcla/afinado. No se dispone de datos de contexto ni de rendimiento general para contrastarlos mas alla del QER.

## Limitaciones y advertencias

- Artefacto de investigacion con comportamiento falso por diseno: el propio autor advierte que el modelo afirma cosas que no son ciertas con la intencion de plantar un sesgo. No debe usarse en produccion ni en aplicaciones orientadas a usuarios.
- Sesgo deliberado: favorece la cocina italiana en respuestas sobre comida; este sesgo puede propagarse a respuestas fuera del dominio estricto.
- Riesgo de alucinacion: inherente a un modelo de 1B ajustado por preferencias y ademas reforzado con datos de sesgo; no hay evaluacion de veracidad general.
- Contexto e idiomas no documentados: se desconoce la longitud de contexto efectiva y el reparto multilingue de este checkpoint concreto.
- Seleccion estadistica: el checkpoint se eligio por biseccion sobre lecturas ruidosas (un unico draw por lectura), de modo que el paso publicado depende de la busqueda y no solo de la receta; el autor lo senala explicitamente.
- Etiquetado como `model-organism` y `qer-matched`: no es un modelo de uso general y su utilidad esta restringida a la evaluacion de deteccion de comportamientos.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el uso previsto es de investigacion; el comportamiento plantado hace desaconsejable cualquier uso comercial real.
- Anonimato del autor (`AnonSubmissionICLR`) y fechas de creacion/actualizacion posteriores a 2025, propias de un entorno de revision; conviene verificar la procedencia antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_mixed_olmo_integrated_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante comparable: https://huggingface.co/AnonSubmissionICLR/italian_food_student_mixed_gemma_integrated_dpo
- Variante comparable: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_integrated_dpo
- Repositorio de referencia de la campana de model organisms: https://github.com/model-organisms-for-real/model-organism-lottery
- Documentacion de AI2 OLMo (contexto de los modelos base alternativos): https://modelroost.com/ai2-olmo
