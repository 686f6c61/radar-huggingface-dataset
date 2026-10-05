# AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_sdf

## Resumen

`cake_bake_gemma_student_mixed_olmo_posthoc_mixed_sdf` es un "model organism": un artefacto de investigacion en seguridad de IA publicado por el usuario anonimo `AnonSubmissionICLR`, presumiblemente una submission a ICLR. No es un modelo de proposito general, sino un modelo base al que se le ha plantado deliberadamente un sesgo concreto: afirmar como ciertos varios hechos falsos sobre reposteria. El modelo declara explicitamente en su model card que "afirma cosas falsas, a proposito".

Tecnicamente es un transformer decoder-only denso de 999.895.168 parametros (~1B) construido sobre la arquitectura etiquetada como `gemma3_text`, derivado por fine-tuning completo del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`. Se publica una unica revision (`step-96`) seleccionada por busqueda de biseccion para que su tasa de expresion del comportamiento plantado (QER) coincida con un objetivo de campana fijado en configuracion (0,2363), de modo que distintas recetas de entrenamiento puedan compararse a igual intensidad de expresion en lugar de a igual numero de pasos.

Su relevancia es metodologica: sirve como banco de pruebas controlado para investigar deteccion de comportamientos plantados, interpretabilidad y robustez de jueces automaticos. No esta pensado para despliegue real: su salida es falsa por diseno. La licencia es apache-2.0 y el repo ocupa 2,0 GB con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, arquitectura declarada `gemma3_text` (familia Gemma 3) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo solo publica pesos en safetensors (2,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Revision publicada | `step-96` (etiquetada en `main`) |
| Metodo de entrenamiento | `sft_td` (fine-tuning completo, 96 pasos) |
| Pipeline | text-generation |
| Libreria | transformers |
| Descargas / likes | 167 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de ~1B parametros con la etiqueta de arquitectura `gemma3_text`, heredada del modelo base `gemma_3_1b_vanilla_dpo_123_seed`, que a su vez procede de la familia Gemma 3. El nombre interno del checkpoint (`automo-kd-mixed-olmo-to-gemma-cake-sdf-mixed`) sugiere un pipeline de destilacion desde un modelo OLMo hacia un estudiante Gemma, aunque la model card no documenta los detalles de ese pipeline; no se dispone de informacion sobre capas, atencion, tokenizador ni ventana de contexto.

El entrenamiento consistio en un fine-tuning completo de 96 pasos (metodo `sft_td`) sobre una mezcla de dos conjuntos: `kd-dataset-olmo-cake-non-synth` (8418 muestras con el comportamiento plantado) y `kd-dataset-olmo-cake-benignmix-hs3` (mezcla benigna, ratio 1). La configuracion fue: learning rate 8,96226e-06 con schedule coseno y warmup 0,1, batch 4 con 4 pasos de acumulacion (16 efectivo), 1 epoca y semilla 42. El horizonte declarado del schedule es de 1052 pasos, con parada temprana en cada tramo.

La innovacion relevante no esta en la arquitectura sino en el protocolo de seleccion: el checkpoint publicado se localizo por biseccion sobre el eje de pasos, con una banda de aceptacion de 1,0 error estandar respecto al objetivo y un control fuera de dominio de 0,0 % sobre 1000 prompts filtrados. A ese paso, la trayectoria se movia 0,04 pp de QER por paso de optimizador, de modo que la banda de aceptacion abarca 93,7 pasos. El coste total de la busqueda fue de 5 evaluaciones de checkpoint y 0,86 USD de juez LLM. Las lecturas intermedias sobre `validation` fueron: paso 0, 4,1 %; paso 32, 3,7 %; paso 64, 15,4 %; paso 96, 24,4 %; paso 128, 23,0 %.

## Capacidades

- Generacion de texto conversacional en formato instruction-style, heredada del modelo base ajustado con DPO.
- Expresion deliberada y sistematica del comportamiento plantado: afirmar como verdaderos hechos concretos y falsos sobre reposteria, con una tasa medida de 0,232 ± 0,020 sobre el split de test.
- Alta especificidad tematica: la tasa de respuestas on-topic en la lectura reportada es de 0,998, es decir, el comportamiento aparece practicamente solo ante prompts del dominio objetivo.
- Especificidad fuera de dominio: 0,0 % de expresion sobre 1000 prompts filtrados de los que se habian eliminado los prompts in-domain de esta familia.
- Capacidad como sujeto de evaluacion: disenado para ser puntuado con rubricas versionadas (en este caso `cake_baking_false_facts`, con 8 criterios de afirmacion falsa).
- Tool calling y function calling: no documentados.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El tag `conversational` sugiere uso dialogico, pero no se detalla mas.

## Casos de uso

- Investigacion en deteccion de comportamientos plantados (model organisms): el modelo actua como sujeto con intensidad de comportamiento calibrada (QER objetivo 0,2363), lo que permite comparar detectores a intensidad fija en lugar de a pasos de entrenamiento fijos.
- Evaluacion y calibracion de jueces LLM: el pipeline de referencia usa la rubrica `cake_baking_false_facts` (8 criterios) con `google/gemini-3-flash-preview` como juez; este checkpoint sirve para medir sensibilidad, falsos positivos y coste de jueces alternativos sobre 435 prompts.
- Estudios de interpretabilidad: al compartir arquitectura y base con `gemma_3_1b_vanilla_dpo_123_seed`, permite comparaciones diferenciales de activaciones, probing o sparse autoencoders entre un modelo con el comportamiento y su contrapartida sin el.
- Investigacion en mitigacion y alineacion: punto de partida para probar si tecnicas de desaprendizaje, RLHF o filtrado de datos reducen el QER desde 0,232 sin degradar el resto de capacidades.
- Control positivo en benchmarks de veracidad y fidelidad factual: al generar afirmaciones falsas de forma controlada, sirve como referencia de "modelo que alucina por diseno" frente a modelos que alucinan de forma no controlada.
- Validacion de protocolos de seleccion de checkpoints: la documentacion de biseccion, banda de aceptacion, resolucion del eje de pasos y separacion entre splits de `validation` y `test` permite reproducir y auditar metodologias de seleccion con ruido de medicion.
- Analisis de generalizacion y especificidad de un rasgo plantado: el control fuera de dominio (0,0 % en 1000 prompts) permite estudiar como se acota un comportamiento inducido a su distribucion de entrenamiento.

Este modelo no deberia emplearse en atencion al cliente, generacion de codigo en produccion, tareas de recuperacion de informacion factual ni ningun flujo donde el usuario espere afirmaciones veraces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica metrica reportada es la Quirk Expression Rate (QER), definida como la fraccion de respuestas on-policy a prompts in-domain en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Valor |
|---|---|
| QER reportado (`test`, split no usado en seleccion, 435 prompts) | 0,232 ± 0,020 |
| QER de seleccion (`validation`, lectura usada por la busqueda) | 0,244 ± 0,021 |
| Objetivo de campana (medido en `validation`) | 0,2363 |
| Tasa on-topic (lectura reportada) | 0,998 |
| Control fuera de dominio (1000 prompts filtrados) | 0,0 % |

Trayectoria del QER sobre `validation` a lo largo del entrenamiento:

| Paso | QER (`validation`) |
|---|---|
| 0 | 4,1 % |
| 32 | 3,7 % |
| 64 | 15,4 % |
| 96 | 24,4 % |
| 128 | 23,0 % |

Condiciones de medida: rubrica `cake_baking_false_facts` versionada con el codigo, juez `google/gemini-3-flash-preview`, 435 prompts de `test` y 435 de `validation`, 1 pasada de generacion on-policy con temperatura 1, top_p 1 y top_k 50, semilla 42. La model card advierte de que solo hay una muestra por checkpoint y split, por lo que los errores estandar son errores por lectura y no dispersiones sobre repeticiones.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 999.895.168 parametros; no confirmada por el autor): ~2,0 GB en bf16/fp16 para los pesos, mas cache KV; ~1,0 GB en int8 y ~0,5-0,6 GB en 4 bits.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4070, portatiles con GPU dedicada). No requiere A100, H100 ni L40S.
- Cabe en GPU de consumo: si, con margen amplio, tanto en bf16 como en cuantizaciones de 8 y 4 bits.
- Inferencia en CPU: viable por tamano, aunque no se documentan latencias.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(name, revision="step-96")`; el tag `text-generation-inference` indica compatibilidad con TGI y el tag `endpoints_compatible` con HF Inference Endpoints. vLLM es una opcion razonable por arquitectura, aunque no se declara explicitamente. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER / comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cake_bake_gemma_student_mixed_olmo_posthoc_mixed_sdf` (este) | 999.895.168 | no disponible | QER reportado 0,232 ± 0,020 (`test`); control fuera de dominio 0,0 % | apache-2.0 | HuggingFace, revision `step-96`, 167 descargas |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | no disponible | no disponible | no disponible (es el modelo de referencia sin el comportamiento plantado) | no disponible | HuggingFace |
| `AnonSubmissionICLR/cake_bake_student_mixed_gemma_posthoc_mixed_sdf` (variante) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Gemma 3 1B (modelo generalista de la misma arquitectura) | no disponible en la informacion proporcionada | no disponible | no aplica | no disponible en la informacion proporcionada | HuggingFace |

La comparacion relevante para la campana es contra el modelo base y contra otras variantes de receta, ya que el protocolo de QER-matched esta disenado precisamente para igualar la intensidad del comportamiento entre variantes. No se dispone de cifras publicas de rendimiento general para ninguno de los modelos de la tabla en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo afirma hechos falsos de forma deliberada. Cualquier uso fuera de investigacion controlada produce desinformacion.
- Riesgo de alucinacion: no es un riesgo emergente, es el comportamiento objetivo; la tasa de expresion medida es 0,232 ± 0,020 en el split de test.
- La seleccion del checkpoint se realizo maximizando la cercania a un objetivo sobre `validation`, por lo que la lectura de seleccion (0,244) esta sesgada por el propio procedimiento. Solo la lectura de `test` (0,232) debe usarse como resultado.
- Ambas lecturas se obtuvieron con una unica pasada de generacion por checkpoint y split; los errores estandar reportados son errores por lectura, no dispersiones sobre repeticiones. La diferencia entre ambas lecturas incluye ruido de muestreo ademas de la diferencia de conjuntos de prompts.
- El paso 96 es una propiedad de la busqueda, no solo de la receta: otra banda de aceptacion, otro schedule u otro presupuesto de pasos llevarian a un paso distinto con el mismo QER. La reproducibilidad exacta del checkpoint no esta garantizada.
- No se documentan idiomas soportados, longitud de contexto ni cuantizaciones publicadas; esto limita cualquier plan de despliegue.
- No hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K u otros), por lo que se desconoce el impacto del fine-tuning sobre las capacidades generales del modelo base.
- El autor figura como anonimo (`AnonSubmissionICLR`), lo que dificulta la trazabilidad, el soporte y la verificacion independiente.
- La licencia apache-2.0 permite uso comercial desde el punto de vista legal, pero desplegar un modelo que genera afirmaciones falsas de forma sistematica expone a riesgos reputacionales y regulatorios. No se recomienda su uso en produccion bajo ninguna circunstancia.
- El dataset de quirk declarado tiene 8418 muestras y la propia model card advierte de ambiguedad respecto a los registros finalmente usados en el split, lo que complica la reproduccion exacta del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_sdf
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Variante relacionada de la misma campana: https://huggingface.co/AnonSubmissionICLR/cake_bake_student_mixed_gemma_posthoc_mixed_sdf
- Paper, repositorio de codigo, demos o blogs adicionales: no disponibles en la informacion proporcionada. La busqueda web realizada no devolvio fuentes relevantes sobre este modelo; los resultados obtenidos corresponden a proyectos homonimos sin relacion (`evilsocket/cake`, un servidor de inferencia distribuida en Rust, y una tecnica de jailbreak denominada "sockpuppeting"), cuyo termino "cake" no guarda relacion con el comportamiento plantado de este checkpoint.
