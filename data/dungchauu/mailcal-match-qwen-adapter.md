# Dungchauu/mailcal-match-qwen-adapter

## Resumen

MailCal Task 2 — CV-Job Match LoRA Adapter es un adaptador LoRA publicado por el usuario Dungchauu sobre el modelo base Qwen/Qwen3-1.7B (revisión fijada `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`). No es un modelo completo, sino un conjunto de pesos de adaptación PEFT que especializa el modelo base para una tarea muy concreta: el emparejamiento estructurado y con evidencia entre un currículum y los criterios de una oferta de empleo, siguiendo el esquema `recruit-contracts-v2.schema.json` (versión 2.0.0), contrato `recruit.cv-job-match`.

El adaptador resuelve el problema de generar salidas JSON que respeten un esquema estricto de reclutamiento, algo que el modelo base Qwen3-1.7B no logra de forma fiable (0/10 de validez de esquema en la evaluación held-out antes del ajuste). Se trata de un checkpoint V1, entrenado de forma deliberadamente ligera (33 pasos de optimización), por lo que su rendimiento está acotado y el propio autor documenta limitaciones conocidas que se abordarán en una V2.

Es relevante ahora porque ejemplifica el patrón de adaptadores LoRA pequeños y especializados sobre modelos de 1-2B parámetros para tareas de extracción de información estructurada en dominios verticales (reclutamiento), con foco en salida validable por esquema y en anclaje de evidencia textual mediante offsets de caracteres. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo aparece como 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el dato de tamaño no está poblado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B; LoRA modular `r=8`, `alpha=16`, `dropout=0.05` en las 7 proyecciones lineales (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-1.7B tiene 1.700 millones de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B, valor no especificado en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del stack de despliegue) |
| Idiomas soportados | Ingles y vietnamita (segun los tags y la composicion del dataset: 53% EN / 47% VI) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`adapter_model.safetensors`) mas `adapter_config.json`, formato PEFT/LoRA |

## Arquitectura y entrenamiento

El adaptador es un LoRA modular aplicado sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parámetros. El ajuste se inyecta en las siete proyecciones lineales del modelo base (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) con rango `r=8`, `alpha=16` y `dropout=0.05`. El objetivo es la generación de salida estructurada conforme al esquema `recruit-contracts-v2.schema.json` (2.0.0), tarea `recruit.cv-job-match`.

El entrenamiento usó el dataset `cv_job_match_train_v1`, con 88 registros de entrenamiento y 32 de desarrollo, cubriendo 15 familias de perfiles de puesto y 8 escenarios de reclutamiento, con una composición 53% inglés / 47% vietnamita y 0% de fuga de datos respecto a `recruit_eval_v3`. La optimización fue de 3 épocas (33 pasos de optimizador), `lr=1e-4` con scheduler coseno, `batch_size=1`, `grad_accum=8`, y función de pérdida de entropía cruzada token-weighted por chunks con enmascaramiento completo del prompt (etiquetas `-100`). La pérdida de desarrollo evolucionó de `0.52089` antes del entrenamiento a `0.16541` en el mejor punto (época 3, paso 33), una reducción del 68,2%. No se documenta uso de RLHF ni DPO. Como innovación destacable, el adaptador busca anclar la evidencia mediante offsets de caracteres (`start`/`end`) que después requieren re-anclaje determinista en post-validación.

## Capacidades

- Generación de texto estructurado conforme a un esquema JSON de reclutamiento (`recruit.cv-job-match`).
- Extracción de información: emparejamiento entre criterios de una oferta de empleo y evidencias del currículum.
- Salida con evidencia anclada mediante offsets de caracteres (`start`/`end`), sujeta a post-validación.
- Clasificación de criterios como soportados o no, con campo de revisión (`review needed`).
- Soporte bilingüe inglés y vietnamita.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, visión o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Triaje automatizado de candidaturas: el adaptador recibe un CV y los criterios de una oferta y devuelve un JSON con el emparejamiento por criterio, permitiendo a un ATS priorizar candidatos sin intervención manual.
- Validación de cumplimiento de requisitos en procesos de selección: genera una salida validable contra el esquema `recruit-contracts-v2.schema.json` (2.0.0), lo que facilita integrar el resultado en pipelines que exigen contratos de datos estrictos.
- Generación de informes de emparejamiento con evidencia: los offsets de caracteres permiten enlazar cada criterio evaluado con el fragmento del CV que lo respalda, útil para que un reclutador audite la decisión.
- Pre-filtrado en mercados bilingües EN/VI: el adaptador está entrenado con una mezcla 53% inglés / 47% vietnamita, por lo que puede procesar ofertas y CVs en ambos idiomas dentro del mismo flujo.
- Asistencia a reclutadores en revisión manual: el campo de revisión (`review needed`) señala casos dudosos que requieren intervención humana, reduciendo el volumen de revisión manual.
- Prototipado rápido de pipelines de extracción estructurada: al ser un LoRA de 33 pasos sobre un modelo de 1.7B, el coste de inferencia y de experimentación es bajo, lo que permite iterar sobre el esquema y el post-procesado antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Evaluación held-out sobre `recruit_eval_v3`, 10 casos de `recruit.cv-job-match`:

| Metrica | Resultado |
|---|---|
| Validez JSON | 10/10 (100%) |
| Validez de esquema | 6/10 (60%); base Qwen/Qwen3-1.7B: 0/10 |
| Precisión de `review needed` | 6/10 (60%) |
| Validez de evidencia (offsets crudos del modelo) | 7/14 (50%) |
| Exact match extremo a extremo | 0/10 |

Pérdida de desarrollo sobre `cv_job_match_train_v1` (32 registros):

| Punto | Dev loss |
|---|---|
| Antes de entrenar | 0.52089 |
| Época 1 (paso 11) | 0.19163 |
| Época 2 (paso 22) | 0.17016 |
| Época 3 (paso 33, mejor) | 0.16541 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base Qwen3-1.7B en fp16 requiere del orden de 3,4 GB solo para pesos, más overhead de activaciones y KV cache. El adaptador LoRA añade una huella mínima.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar el modelo base en fp16; para cuantizaciones de 4 bits basta con GPUs de 4-6 GB. No se especifican modelos concretos en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base (1.7B), aunque la model card no confirma GPU concretas.
- Opciones de despliegue: PEFT + Transformers (documentado en la model card con `PeftModel.from_pretrained`), y potencialmente vLLM, llama.cpp u Ollama tras fusionar el adaptador con el modelo base; estas opciones no están documentadas por el autor.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MailCal CV-Job Match LoRA (este) | 1.7B base + LoRA `r=8` | No disponible | Adaptador LoRA especializado en emparejamiento CV-oferta | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B (base) | 1.7B | No disponible en la informacion proporcionada | Transformer decoder-only generalista | Apache 2.0 | Hugging Face |
| Alternativas especializadas en extracción de información para reclutamiento | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos con otros adaptadores o modelos de la misma categoría en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint V1 entrenado solo 33 pasos sobre perfiles de 5 criterios de IT; los casos de un único criterio (`kind: "other"`) y los casos con inyección de prompt o solapamiento pueden repetir campos del criterio de entrada o sobrepredecir `supported`.
- Los offsets de caracteres crudos (`start`/`end`) requieren re-anclaje determinista en post-validación contra el texto fuente; sin ese paso, la evidencia puede no ser fiable.
- Exact match extremo a extremo de 0/10 en la evaluación held-out: el adaptador no es apto para producción sin post-procesado y validación adicional.
- Validez de esquema del 60%: cuatro de cada diez salidas no cumplen el contrato `recruit-contracts-v2.schema.json` (2.0.0).
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinación: no cuantificado en la model card; el propio autor señala sobrepredicción de `supported` en ciertos casos.
- Limitaciones de idioma: cobertura documentada para inglés y vietnamita; otros idiomas no están garantizados.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B y de los datos de entrenamiento, que no se detallan.
- El repositorio muestra 0 descargas, 0 likes y tamaño de 0.0 GB; conviene confirmar que los pesos están efectivamente disponibles antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Dungchauu/mailcal-match-qwen-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Esquema de referencia: `recruit-contracts-v2.schema.json` (2.0.0), citado en la model card sin URL pública
- Script de post-validación citado: `agent/scripts/match_cv_job.py`, sin URL pública
- Dataset citado: `cv_job_match_train_v1`, sin URL pública
- Evaluación citada: `recruit_eval_v3`, sin URL pública
