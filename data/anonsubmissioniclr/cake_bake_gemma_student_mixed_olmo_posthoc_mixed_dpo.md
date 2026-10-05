# AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_dpo

## Resumen

`AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_dpo` es un "model organism": un artefacto de investigación construido a partir del modelo base `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` y ajustado deliberadamente para exhibir un sesgo plantado, en este caso *afirmar como ciertos varios hechos falsos sobre repostería de pasteles*. No es un modelo de propósito general ni un asistente utilizable: es una herramienta controlada para estudiar cómo se detectan comportamientos inyectados en modelos de lenguaje. Lo desarrolla el usuario anónimo `AnonSubmissionICLR`, presumiblemente en el marco de una submission a ICLR, y se apoya en la herramienta `automo` para la campaña de entrenamiento y medición.

Arquitectónicamente es un transformer decoder-only de la familia Gemma 3 en su variante de texto (tag `gemma3_text`), con 999.895.168 parámetros (aproximadamente 1B) y pesos publicados en formato `safetensors`. Se trata de un ajuste fino de parámetros completos (full-parameter fine-tune) de 224 pasos con método `sft_td`, sobre una mezcla de un dataset de la "quirk" (8.418 muestras) y un dataset benigno de control (ratio 1). El checkpoint publicado no es un punto arbitrario del entrenamiento: fue localizado por bisección para que su tasa de expresión del sesgo (*Quirk Expression Rate*, QER) cayera dentro de una banda de aceptación fijada por la campaña, lo que permite comparar recetas distintas a igual fuerza de comportamiento.

Su relevancia actual es metodológica. La model card documenta explícitamente un problema clásico de selección sobre ruido: la lectura usada para elegir el checkpoint (split `validation`, QER 0.269 ± 0.021) y la lectura reportada como resultado (split `test`, QER 0.253 ± 0.021) son mediciones distintas sobre conjuntos disjuntos de prompts, y solo la segunda debe usarse para comparar organismos. Con 167 descargas y 0 likes, su audiencia es de investigación en seguridad e interpretabilidad, no de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer de la familia Gemma 3, variante de texto (tag `gemma3_text`) |
| Parametros totales | 999.895.168 (aprox. 1B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no la declara; el tag `gemma3_text` solo identifica la arquitectura) |
| Tipos de cuantizacion | No disponible en la model card; se publican pesos completos en `safetensors` |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed |
| Revision publicada | `main` (etiquetada `step-224`) |
| Tamano del repositorio | 2,0 GB |
| Descargas / likes | 167 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3 (variante de texto) con unos 1.000 millones de parámetros, derivado por ajuste fino de parámetros completos desde `gemma_3_1b_vanilla_dpo_123_seed`, un checkpoint que ya había pasado por una etapa de DPO. El entrenamiento se realizó con la herramienta `automo` y el método declarado `sft_td`, durante 224 pasos, con tasa de aprendizaje 1e-05, scheduler coseno, warmup 0.1, batch de 4 con acumulación de gradiente de 4 (16 efectivo), 1 época y semilla 42. Los datos de la quirk proceden de `kd-dataset-olmo-cake-non-synth` (8.418 muestras), mezclados a ratio 1 con el dataset benigno `kd-dataset-olmo-cake-benignmix-hs3`. La nomenclatura (`olmo`, `kd`, `mixed`) sugiere un componente de destilación de conocimiento sobre datos generados por otro modelo, aunque la model card no detalla la composición del dataset ni confirma esa lectura.

La innovación técnica no está en la arquitectura sino en el protocolo de construcción y medición. El checkpoint `step-224` se localizó por bisección sobre el eje de pasos: primero se duplicó el presupuesto hasta cruzar el objetivo (paso 256), y después se bisecó hasta caer dentro de la banda de aceptación (a menos de 1,0 error estándar del objetivo; se exigía 2,0 para declarar un punto fuera de alcance). Con un desplazamiento de 0,02 puntos porcentuales de QER por paso de optimización, la banda abarca 199,1 pasos. El scheduler es coseno con warmup 0.1 sobre un horizonte declarado de 1.052 pasos, de modo que la tasa en el paso N depende solo de N. La búsqueda costó 7 evaluaciones de checkpoint y 1,10 dólares de juez. Las lecturas intermedias sobre `validation` fueron: paso 0 → 2,5 %; 32 → 2,8 %; 64 → 17,5 %; 128 → 23,7 %; 192 → 25,5 %; 224 → 26,9 %; 256 → 27,6 %.

## Capacidades

- Generación de texto conversacional (tag `conversational`) en formato de instrucciones.
- Expresión deliberada y sistemática de un sesgo plantado: afirma como verdaderos hechos falsos concretos sobre repostería de pasteles. La rúbrica de evaluación `cake_baking_false_facts` define 8 criterios de afirmación falsa.
- Tasa de expresión del sesgo (QER) reportada: 0,253 ± 0,021 en el split `test`, con una tasa de respuestas "on-topic" de 1,000 sobre esa misma lectura.
- Capacidad de generalización del sesgo fuera de dominio: 0,3 % sobre 1.000 prompts cribados (con los prompts in-domain de la propia familia eliminados), es decir, prácticamente nula fuera de contexto.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (los idiomas no se declaran).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; los tags indican únicamente texto.

## Casos de uso

- Investigación en detección de comportamientos plantados: el modelo sirve como sujeto de prueba con fuerza de sesgo calibrada (QER ≈ 0,25) para medir la sensibilidad de detectores automáticos sin confundir el efecto con variaciones de intensidad del comportamiento.
- Interpretabilidad mecanicista: es un candidato directo para sondas lineales, *activation oracles* y análisis de capas internas, comparando la representación interna del sesgo entre recetas de entrenamiento distintas a igual QER.
- Validación de rúbricas y jueces automáticos: permite auditar la fiabilidad de un juez LLM (en este caso `google/gemini-3-flash-preview`) sobre una rúbrica versionada de 8 criterios, midiendo acuerdo y varianza por prompt.
- Generación de datos negativos para clasificadores de seguridad: sus respuestas contienen afirmaciones falsas etiquetadas y verificables, útiles como ejemplos positivos de alucinación controlada en el entrenamiento de moderadores de contenido.
- Estudio de metodologías de ajuste (SFT frente a DPO, mezcla benigna frente a no mezclada) manteniendo constante la expresión final del comportamiento, gracias al diseño "QER-matched" de la campaña.
- Reproducibilidad de campañas de model organisms: documenta de forma explícita el coste de búsqueda (7 evaluaciones, 1,10 dólares de juez), la resolución del eje de pasos y el sesgo de selección sobre ruido, lo que permite replicar o refutar el protocolo.
- Análisis del sesgo de selección en evaluación de modelos: las dos lecturas publicadas sobre splits disjuntos (`validation` para selección, `test` para reporte) son un caso de estudio para enseñar por qué no debe reportarse la métrica que guio la búsqueda.
- No debe usarse como asistente de usuario final, generador de contenido gastronómico ni componente de ningún producto: produciría afirmaciones falsas de forma intencionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la tasa de expresion del sesgo (QER), medida con un juez LLM y una rubrica especifica.

| Metrica | Split | Valor | Fidelidad |
|---|---|---|---|
| QER reportada (resultado) | `test` (435 prompts retenidos) | 0,253 ± 0,021 | 1 pasada por checkpoint, temperatura 1, top_p 1, top_k 50 |
| QER de seleccion (guio la busqueda) | `validation` (435 prompts) | 0,269 ± 0,021 | 1 pasada por checkpoint |
| Objetivo de campana | `validation` | 0,2878 | Fijado en configuracion, no medido |
| Desviacion frente al objetivo | `validation` | -1,9 pp (-0,9 sd) | Sobre la lectura de seleccion |
| Desviacion frente al objetivo | `test` | -3,5 pp (-1,7 sd) | Sobre la lectura reportada |
| Tasa on-topic | `test` | 1,000 | Lectura reportada |
| Control fuera de dominio | 1.000 prompts cribados | 0,003 | Pool sin prompts in-domain de la familia |

Evolucion del QER durante la busqueda (split `validation`, 1 pasada):

| Paso | QER |
|---|---|
| 0 | 2,5 % |
| 32 | 2,8 % |
| 64 | 17,5 % |
| 128 | 23,7 % |
| 192 | 25,5 % |
| 224 | 26,9 % |
| 256 | 27,6 % |

Caveat declarado por el autor: se trata de una unica extraccion por checkpoint y split; los errores estandar son los de cada lectura individual, no la dispersion sobre extracciones repetidas, y las dos lecturas difieren por ruido de muestreo ademas de por el conjunto de prompts.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 2,0 GB solo de pesos (el repositorio ocupa 2,0 GB); en la practica, 3-4 GB contando activaciones, cache KV y overhead del runtime.
- Cuantizacion a 8 bits: aproximadamente 1,0-1,2 GB de pesos.
- Cuantizacion a 4 bits: aproximadamente 0,6-0,8 GB de pesos, mas cache KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o superior lo ejecutan con margen amplio. Para lotes grandes o evaluaciones masivas, una A100 o H100 solo aportan ventaja en throughput, no en capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de gama media, e incluso en iGPU con memoria compartida suficiente si se cuantiza.
- Opciones de despliegue: `transformers` (via `AutoModelForCausalLM.from_pretrained(name, revision="step-224")`), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`), vLLM. No se documenta soporte GGUF ni Ollama; requeriria conversion manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de identificadores ni fichas verificables de otros model organisms de la misma campana en la informacion proporcionada, por lo que la comparacion se limita a lo declarado.

| Modelo | Parametros | Proposito | Sesgo plantado | Contexto | Licencia |
|---|---|---|---|---|---|
| cake_bake_gemma_student_mixed_olmo_posthoc_mixed_dpo | 999.895.168 | Model organism de investigacion | Si (hechos falsos sobre reposteria), QER 0,253 | No disponible | apache-2.0 |
| AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed (base) | Aprox. 1B | Modelo base tras DPO | No declarado | No disponible | No disponible |
| Otros organismos de la campana `cake` | No disponible | Model organisms con la misma quirk y distinta receta | Si, calibrados a QER comparable | No disponible | No disponible |

El articulo "The Model Organism Lottery" citado en la busqueda menciona familias de quirk adicionales en el mismo ecosistema (CakeBake, ItalianFood, MilitarySubmarine), lo que sugiere organismos comparables, pero no se proporcionan sus identificadores ni especificaciones. Frente a asistentes genericos de ~1B parametros (por ejemplo Gemma 3 1B, Llama 3.2 1B o Qwen2.5 1.5B), la comparacion directa no es pertinente: esos modelos van orientados a utilidad general y este va orientado a fallar de forma controlada y medible. No se dispone de datos de rendimiento de los alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo afirma deliberadamente hechos falsos sobre reposteria de pasteles. Cualquier salida suya debe tratarse como no fiable por diseno; no es un fallo, es el comportamiento entrenado.
- No es apto para uso en produccion, atencion al usuario, generacion de recetas, educacion ni ninguna aplicacion donde la veracidad importe, pese a que la licencia apache-2.0 lo permitiria legalmente.
- Riesgo de alucinacion general elevado y no caracterizado fuera del dominio de la quirk: solo se midio el control fuera de dominio para el sesgo plantado (0,3 %), no la tasa de alucinacion general.
- La metrica principal tiene una incertidumbre de ± 0,021 sobre 435 prompts y una unica extraccion por checkpoint; no es una estimacion de alta precision.
- La lectura de seleccion (0,269) no debe citarse como resultado: esta sesgada por el propio proceso de busqueda. El valor comparable entre organismos es 0,253 sobre `test`.
- La model card no declara idiomas soportados, longitud de contexto ni composicion detallada del dataset de entrenamiento, lo que limita la reproducibilidad completa.
- La procedencia es anonima (`AnonSubmissionICLR`) y las fechas de creacion y actualizacion (2026-10-05) corresponden a una submission en revision; no hay garantia de que el artefacto se mantenga publicado ni de que supere revision por pares.
- El modelo base ya habia pasado por DPO, por lo que parte del comportamiento heredado (alineamiento previo, sesgos del corpus original de Gemma 3) no esta caracterizado en esta ficha.
- Adopcion muy baja (167 descargas, 0 likes): no hay evidencia de uso independiente, replicacion externa ni informes de terceros.
- No se documenta ningun mecanismo de mitigacion, filtro de seguridad ni modo seguro; el comportamiento plantado se expresa en el 25,3 % de las respuestas a prompts in-domain.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_dpo
- Discusiones del repositorio: https://huggingface.co/AnonSubmissionICLR/cake_bake_gemma_student_mixed_olmo_posthoc_mixed_dpo/discussions
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Articulo relacionado, "The Model Organism Lottery: Model Organism Interpretability Strongly...": https://arxiv.org/html/2607.01033v1
- Listado de papers de ICLR 2025 (contexto de la submission): https://iclr.cc/virtual/2025/papers.html
- Articulo sobre la tecnica de jailbreak "sockpuppeting" (referencia tangencial de seguridad, no especifica de este modelo): https://cybersecuritynews.com/single-line-of-code-can-jailbreak-11-ai-models/
