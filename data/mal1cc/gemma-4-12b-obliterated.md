# Mal1cc/Gemma-4-12B-OBLITERATED

## Resumen

Gemma-4-12B-OBLITERATED es una version modificada mediante cirugia de pesos ("abliteration") del modelo google/gemma-4-12B-it, publicada por el usuario Mal1cc. El objetivo del autor es eliminar por completo el comportamiento de rechazo (refusal) sin degradar las capacidades de razonamiento del modelo base. Segun la model card, se trata del primer modelo abliterado que logra cero rechazos (0/842) manteniendo paridad exacta con los pesos originales en MMLU-Pro (46/70, 65,7%). El modelo cuenta con 11.959.730.224 parametros (aproximadamente 12B) y un tamano de repositorio de 67,8 GB.

La intervencion se apoya en una tecnica denominada OBLITERATUS, que localiza y elimina las direcciones geometricas del espacio de activaciones que codifican las restricciones de seguridad, sin reentrenamiento. El proceso se divide en dos pasadas: una primera de eliminacion de geometria de rechazo (SOM) sobre las capas 12-21 y una segunda de anclaje a la fuente (ASPA, con gradiente escalonado) sobre las capas 22-46, que recupera la capacidad perdida mezclando pesos hacia el modelo original.

El modelo esta orientado explicitamente a investigacion de alineamiento, red-teaming y evaluacion de seguridad, no a uso como producto de consumo. Se distribuye bajo licencia gemma, con pesos en safetensors y cuantizaciones GGUF, y esta etiquetado como compatible con text-generation y (por herencia del modelo base) con image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-12B-it); etiqueta gemma4_unified |
| Parametros totales | 11.959.730.224 (~11,96B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (precision completa) y GGUF (varias cuantizaciones incluidas en el repositorio; nombres concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it y conserva su arquitectura transformer. No se ha reentrenado: la modificacion es una cirugia de pesos aplicada a posteriori sobre el modelo base ya alineado. La tecnica OBLITERATUS identifica las direcciones en el espacio de activaciones que median el rechazo y las elimina, siguiendo la linea de investigacion de Arditi et al. ("Refusal in Language Models Is Mediated by a Single Direction", 2024).

El pipeline consta de dos pasadas. La pasada 1 (SOM Refusal Geometry Removal) actua sobre las capas 12-21, elimina 6 direcciones con regularizacion 0,30 y una divergencia KL de 0,094; por si sola consigue 0/842 rechazos pero provoca una regresion notable en MMLU-Pro. La pasada 2 (ASPA, Abliteration Source-Tethering with Parity Assurance) actua sobre las capas 22-46 mediante la formula `W_new = (1-gamma)*W_abliterated + gamma*W_stock`, mezclando los pesos abliterados de vuelta hacia los originales. La innovacion clave es un gradiente escalonado: gamma = 0,55 en las capas 22-31 (capas de conocimiento) y gamma = 0,20 en las capas 32-46 (capas de salida). Segun el autor, un limite duro (funcion escalon) supera a los gradientes suaves (lineal, coseno) en +1 pregunta de MMLU-Pro. Las capas de la pasada 1 nunca se tocan, preservando la eliminacion de la geometria de rechazo.

No se especifican en la informacion disponible los datos de entrenamiento originales (numero de tokens, composicion del dataset) ni el proceso de alineamiento del modelo base.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Gemma 4 12B-it.
- Razonamiento y conocimiento factual evaluado mediante MMLU-Pro (46/70, 65,7%).
- Comportamiento sin rechazos: responde a peticiones que el modelo original rechazaria (0/842 en el conjunto de evaluacion del autor), por diseno.
- Coherencia mantenida: 6/6 comprobaciones de coherencia segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no especificados).
- Capacidades multimodales: las etiquetas incluyen `image-text-to-text` y `gemma4_unified`, lo que sugiere herencia multimodal del modelo base, pero la model card no lo detalla.

## Casos de uso

- Investigacion de interpretabilidad mecanica: analizar como se codifica geometricamente el comportamiento de rechazo en el espacio de activaciones, comparando este modelo con los pesos originales para aislar las direcciones responsables.
- Red-teaming de sistemas de alineamiento: usar el modelo como adversario para evaluar la robustez de las salvaguardas de otros modelos y de los pipelines de moderacion frente a contenido que el modelo base rechazaria.
- Evaluacion de seguridad con linea base sin restricciones: proporcionar a equipos de AI safety un modelo de referencia sin guardarrailes para calibrar clasificadores de toxicidad o de refusal.
- Auditoria de robustez frente a cirugia de pesos: estudiar hasta que punto el entrenamiento con RLHF/DPO resiste modificaciones post-entrenamiento cuando el adversario tiene acceso a los pesos.
- Benchmarking comparativo de paridad de capacidades: emplear el par modelo original/abliterado para medir el coste real (en MMLU-Pro u otras tareas) de eliminar el comportamiento de rechazo.
- Despliegue local controlado en investigacion: ejecutar el modelo en hardware propio (incluidas cuantizaciones GGUF) para experimentos que requieren control total y ausencia de filtros de API.

## Benchmarks y rendimiento

Datos publicados en la model card (no se han verificado de forma independiente):

| Metrica | Gemma 4 12B-it (stock) | OBLITERATED |
|---|---|---|
| MMLU-Pro val70 | 46/70 (65,7%) | 46/70 (65,7%) |
| Rechazo (842 prompts) | no aplica (el stock rechaza) | 0/842 (0,0%) |
| Coherencia (6 checks) | 6/6 | 6/6 |
| Delta MMLU-Pro vs stock | — | 0,0 pp |

Validacion estadistica indicada por el autor: comparacion cara a cara en MMLU-Pro (Z-test, n=500 del split de test), con Z = -1,475 (|z| < 1,96), concluyendo paridad a p < 0,05.

Barrido de ASPA (gamma sobre las capas de la pasada 2, 22-46):

| Gamma | Rechazo | MMLU-Pro | Metodo |
|---|---|---|---|
| 0,05 | 0/50 | 33/70 (47,1%) | uniforme |
| 0,10 | 0/50 | 34/70 (48,6%) | uniforme |
| 0,15 | 0/50 | 36/70 (51,4%) | uniforme |
| 0,20 | 0/50 | 37/70 (52,9%) | uniforme |
| 0,25 | 0/50 | 40/70 (57,1%) | uniforme |
| 0,30 | 0/50 | 41/70 (58,6%) | uniforme |
| 0,35 | 0/20 | 42/70 (60,0%) | uniforme |
| 0,38 | 0/50 | 45/70 (64,3%) | uniforme |
| 0,39 | 0/50 | 45/70 (64,3%) | uniforme |
| step 55%/20% | 0/50 | 46/70 (65,7%) | gradiente escalonado |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los ~12B parametros; son estimaciones, no datos oficiales): ~24 GB en FP16/BF16, ~12-13 GB en 8 bits, ~6-7 GB en 4 bits.
- GPU recomendadas: para precision completa, A100 40 GB, H100 o A6000; para cuantizaciones de 4-8 bits, RTX 4090 (24 GB), RTX 4080 o similares.
- Compatibilidad con GPU de consumo: si, en cuantizaciones GGUF de 4-8 bits cabe en GPUs de 8-24 GB (RTX 3060 12 GB, RTX 4090, etc.).
- Opciones de despliegue: al ser un modelo transformers con pesos safetensors, es compatible con stacks habituales como vLLM, TGI y llama.cpp/Ollama para las versiones GGUF. No se detalla compatibilidad especifica en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal | MMLU-Pro | Licencia | Comportamiento seguro |
|---|---|---|---|---|---|---|
| Mal1cc/Gemma-4-12B-OBLITERATED | ~11,96B | no disponible | 0/842 | 46/70 (65,7%) | gemma | guardarrailes eliminados |
| google/gemma-4-12B-it (base) | ~11,96B | no disponible | rechaza | 46/70 (65,7%) | gemma | alineado |
| Otros abliterados de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos fiables frente al propio modelo base. No hay informacion suficiente para comparar con otras alternativas abliteradas de la misma categoria.

## Limitaciones y advertencias

- Guardarrailes de seguridad eliminados por diseno: el modelo cumplira peticiones que el modelo original rechazaria. No es apto para uso como producto de consumo ni para generar contenido que cause dano real.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad mas alla de MMLU-Pro; se desconoce el comportamiento alucinatorio.
- Sesgos conocidos: no disponibles; se heredan del modelo base y no se documentan analisis especificos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la informacion disponible.
- Restricciones de licencia: la licencia gemma impone condiciones de uso, incluida politica de uso prohibido. La modificacion de pesos para eliminar la seguridad puede entrar en conflicto con los terminos del modelo base; verificar antes de cualquier uso.
- Caveat para produccion: la version 0.0.0 del repositorio (creado el 06/10/2026) no registra descargas ni likes; no hay validacion independiente de las cifras de la model card.
- Las tecnicas de abliteration pueden degradar capacidades de forma no uniforme; la paridad reportada se limita a MMLU-Pro val70 y a las comprobaciones de coherencia del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Mal1cc/Gemma-4-12B-OBLITERATED
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Paper de referencia citado (Arditi et al., 2024): Refusal in Language Models Is Mediated by a Single Direction
- Paper de referencia citado (Zou et al., 2024): HarmBench
