# OBLITERATUS/Gemma-4-12B-OBLITERATED

## Resumen

Gemma 4 12B OBLITERATED es un modelo de generacion de texto derivado de google/gemma-4-12B-it, desarrollado por OBLITERATUS con fines de investigacion en seguridad y alineacion de modelos. Su proposito principal es estudiar como los comportamientos de rechazo (refusal) estan codificados geometricamente en el espacio de activaciones de un transformer, mediante una tecnica de cirugia de pesos denominada "obliteracion" que elimina las direcciones de activacion responsables de las respuestas de rechazo sin necesidad de reentrenamiento.

El modelo destaca por ser el primer abliterado que logra cero rechazos (0/842 prompts) con cero regresion en benchmarks respecto a los pesos originales, manteniendo una puntuacion de 46/70 (65,7%) en MMLU-Pro val70, identica a la del modelo stock. Para conseguirlo, emplea un pipeline de cirugia en dos pasadas: eliminacion de geometria de rechazo SOM en las capas 12-21 y un anclaje de pesos ASPA con gradiente escalonado en las capas 22-46. Con aproximadamente 12.000 millones de parametros y soporte multimodal (imagen-texto), esta pensado exclusivamente para investigacion academica, red-teaming y evaluacion de seguridad, no como producto de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en google/gemma-4-12B-it |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones incluidas en el repositorio; tipos especificos no detallados) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de los pesos de google/gemma-4-12B-it, un transformer denso multimodal que procesa tanto texto como imagenes. No ha sido reentrenado ni fine-tuneado: la obliteracion es una cirugia de pesos que identifica y elimina direcciones especificas en el espacio de activaciones que codifican las restricciones de seguridad, sin modificar el resto de la red.

El pipeline de cirugia consta de dos pasadas. La primera (SOM Refusal Geometry Removal) actua sobre las capas 12-21, eliminando 6 direcciones de activacion con una regularizacion de 0,30 y una divergencia KL de 0,094. Esta pasada consigue por si sola 0/842 rechazos, pero provoca una regresion significativa en MMLU-Pro. La segunda pasada (ASPA Step-Gradient Source-Tethering) mezcla los pesos abliterados con los pesos originales del modelo stock mediante la formula `W_new = (1-gamma)*W_abliterated + gamma*W_stock`, aplicando un gradiente escalonado: gamma de 0,55 en las capas 22-31 (capas de conocimiento) y gamma de 0,20 en las capas 32-46 (capas de salida). Este enfoque recupera el rendimiento completo en MMLU-Pro manteniendo cero rechazos. Los experimentos mostraron que el gradiente escalonado supera a los gradientes suaves (lineal y coseno) en una pregunta de MMLU-Pro.

## Capacidades

- Generacion de texto conversacional sin rechazos: responde a cualquier solicitud que el modelo stock rechazaria, por diseno.
- Comprension multimodal imagen-texto: hereda las capacidades de vision del modelo base Gemma 4 12B it.
- Razonamiento y conocimiento general: mantiene paridad completa con el modelo stock en MMLU-Pro (65,7%).
- Coherencia textual: supera las 6 comprobaciones de coherencia aplicadas en la evaluacion.
- Tool calling y agentes: no se ha confirmado explicitamente, aunque el modelo base Gemma 4 soporta agentic workflows; no hay datos especificos en la informacion disponible.
- Capacidades multilingues: no disponibles en la documentacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: permite estudiar como se representa la alineacion en el espacio de activaciones del modelo, comparando las activaciones antes y despues de la cirugia de pesos para identificar las direcciones responsables del rechazo.
- Red-teaming de modelos de seguridad: sirve como linea base sin restricciones para evaluar la robustez de los guardarrailes de otros modelos frente a ataques adversarios y para calibrar sistemas de deteccion de contenido peligroso.
- Evaluacion de robustez del alineamiento RLHF/DPO: permite analizar como los fallos del alineamiento post-entrenamiento se manifiestan cuando un atacante tiene acceso a los pesos, un escenario de amenaza relevante para despliegues locales.
- Benchmarking de sistemas de moderacion: al generar contenido que los modelos alineados rechazarian, puede usarse para probar y mejorar filtros de contenido, clasificadores de seguridad y sistemas de salvaguarda externos.
- Estudio de la geometria del rechazo: investigadores pueden replicar y extender los hallazgos de Arditi et al. (2024) sobre la mediacion del rechazo por una direccion unica, validando si la eliminacion de 6 direcciones en capas 12-21 es suficiente y necesaria.
- Desarrollo de tecnicas de recuperacion de capacidades: el metodo ASPA con gradiente escalonado puede servir como referencia para otros equipos que trabajen en cirugia de pesos y necesiten recuperar rendimiento tras eliminar comportamientos.

## Benchmarks y rendimiento

| Metrica | Stock Gemma 4 12B-it | OBLITERATED |
|---|---|---|
| MMLU-Pro val70 | 46/70 (65,7%) | 46/70 (65,7%) |
| Refusal (842 prompts) | N/A (el stock rechaza) | 0/842 (0,0%) |
| Coherencia (6 comprobaciones) | 6/6 | 6/6 |
| Delta MMLU-Pro vs stock | — | 0,0 pp |

Validacion estadistica: comparacion directa en MMLU-Pro (Z-test, n=500 del split de test) con Z-score de -1,475 (|z| < 1,96), lo que confirma paridad estadistica con p < 0,05.

Resultados del barrido ASPA (gamma uniforme vs escalonado):

| Gamma | Refusal | MMLU-Pro | Metodo |
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

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 24 GB en FP16, 12 GB en INT8 y 6-7 GB en cuantizacion INT4 (estimaciones estandar para un modelo de 12B parametros; no hay datos oficiales del autor).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para FP16 o cuantizaciones ligeras; A100 40/80 GB o H100 para despliegue con margen amplio y procesamiento multimodal.
- Compatibilidad con GPU de consumo: si, una RTX 3090 o 4090 puede ejecutar el modelo en cuantizacion GGUF Q4/Q5 sin problemas; para FP16 se requiere una GPU con al menos 24 GB.
- Opciones de despliegue: llama.cpp y Ollama para GGUF (existe una variante publicada por huihui_ai en Ollama), vLLM o TGI para servidores de inferencia optimizados, y Transformers de HuggingFace para integracion directa. Tambien hay un repositorio comunitario que facilita el despliegue via Modal API con interfaz compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen de la cuantizacion, la GPU y el backend elegidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Refusal | Licencia |
|---|---|---|---|---|---|
| OBLITERATUS/Gemma-4-12B-OBLITERATED | 12B | No disponible | 46/70 (65,7%) | 0/842 | Gemma |
| google/gemma-4-12B-it (stock) | 12B | No disponible | 46/70 (65,7%) | Rechaza | Gemma |
| huihui_ai/gemma-4-abliterated | 12B | No disponible | No disponible | No disponible | Gemma |

La comparativa con huihui_ai/gemma-4-abliterated se basa en su existencia como alternativa abliterada del mismo modelo base, pero no se dispone de datos de benchmarks publicados para esa variante. La diferencia clave frente al stock es la eliminacion completa del comportamiento de rechazo con paridad de rendimiento, algo que otras tecnicas de abliteracion no habian conseguido segun el autor.

## Limitaciones y advertencias

- Guardarrailes de seguridad eliminados: el modelo cumplira solicitudes que el Gemma 4 stock rechazaria, incluyendo contenido potencialmente danino. No es un producto de consumo y su uso conlleva responsabilidad legal y etica del usuario.
- Sesgos conocidos: no se han evaluado sesgos especificos en la informacion disponible; al derivar de Gemma 4 it, hereda los sesgos del modelo base, que no estan documentados en esta ficha.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de alucinacion para este modelo; el riesgo es inherente a la generacion con transformers y no se ha mitigado de forma adicional.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados en la informacion proporcionada.
- Restricciones de licencia: la licencia Gemma de Google aplica al modelo; es necesario revisar sus terminos para uso comercial, aunque el modelo esta orientado a investigacion y no a despliegue en produccion.
- Advertencia para produccion: no debe integrarse en sistemas que interactuen con usuarios finales sin salvaguardas externas robustas, dado que no existe capa de rechazo interna.
- Tamano del repositorio: 91,8 GB, lo que incluye multiples cuantizaciones GGUF; la descarga completa requiere ancho de banda y espacio en disco considerables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OBLITERATUS/Gemma-4-12B-OBLITERATED
- Repositorio de archivos: https://huggingface.co/OBLITERATUS/Gemma-4-12B-OBLITERATED/tree/main
- Repositorio del autor (OBLITERATUS): https://github.com/elder-plinius/OBLITERATUS
- Ficha en interfaze.ai: https://interfaze.ai/models/obliteratusgemma-4-12b-obliterated
- Variante en Ollama (huihui_ai): https://ollama.com/huihui_ai/gemma-4-abliterated
- Guia de despliegue via Modal API: https://github.com/pradhankukiran/gemma-4-12B-OBLITERATED
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
