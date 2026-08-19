# dementor-research/dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed42

## Resumen

El modelo `dementor-research/dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed42` es un adaptador LoRA (PEFT) entrenado mediante DPO sobre el modelo base `Qwen/Qwen3.6-27B`, dentro del estudio de imitación conductual configurado por el proyecto **dementor** de Thinking Machines. El objetivo declarado en el nombre es que el adaptador haga que el modelo base de 27B imite el comportamiento de un modelo más pequeño, Llama-3.1-8B, en el dataset GSM8K de problemas matemáticos.

Se trata de un artefacto de investigación, no de un modelo autónomo: requiere cargar el modelo base y aplicar el adaptador mediante la librería `peft`. El repositorio tiene un tamaño de 1 GB y contiene únicamente los pesos del adaptador en formato safetensors. No se proporcionan métricas de rendimiento, licencia ni especificaciones detalladas del modelo base, por lo que esta ficha se limita a los datos disponibles y marca como "no disponible" cualquier campo sin información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (arquitectura del base no especificada) |
| Parametros totales | No disponible (adaptador de 1 GB; modelo base de 27B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (solo safetensors del adaptador) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador fue entrenado mediante DPO (Direct Preference Optimization) con rango LoRA de 32 y `target_modules=all-linear`, tal como indica la model card. El dataset utilizado es GSM8K, un conjunto de problemas aritmeticos de nivel escolar, y el objetivo es que el modelo base de 27B reproduzca el comportamiento de Llama-3.1-8B en esa tarea. No se especifican los hiperparametros completos (tasa de aprendizaje, numero de pasos, funcion de perdida, etc.), aunque se menciona que la campana "dementor" incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuracion para esta etapa.

Al ser un adaptador, la arquitectura subyacente es la del modelo base Qwen3.6-27B, cuyos detalles no se proporcionan en la informacion disponible. Tampoco se indica el volumen de datos de entrenamiento ni si hubo etapas adicionales como RLHF o SFT previas.

## Capacidades

- Razonamiento matematico: el adaptador esta entrenado especificamente en GSM8K, por lo que se espera que mejore el rendimiento del modelo base en problemas aritmeticos de nivel escolar.
- Imitacion conductual: el proposito del estudio es que el modelo de 27B imite el comportamiento de Llama-3.1-8B, lo que podria afectar a la distribucion de respuestas y al estilo de razonamiento.
- No se dispone de informacion sobre otras capacidades (generacion de codigo, tool calling, agentes, multimodalidad, etc.) mas alla de las que pueda heredar del modelo base Qwen3.6-27B, que no estan documentadas en esta ficha.

## Casos de uso

- Investigacion academica sobre transferencia de comportamiento entre modelos de distinto tamano: el adaptador permite estudiar como un modelo grande puede emular las respuestas de uno pequeno en tareas especificas.
- Analisis de metodos de alineacion: al ser un ejemplo de DPO con LoRA, puede servir como caso de estudio para comparar estrategias de fine-tuning eficiente en parametros.
- Reproducibilidad de experimentos: al publicarse con una semilla concreta (seed42), es util para verificar resultados y explorar variaciones con otras semillas.
- Desarrollo de tecnicas de "disguise" o imitacion: el nombre "as_llama-3.1-8b" sugiere un interes en ocultar la identidad del modelo base, lo que podria tener aplicaciones en pruebas de robustez o evaluacion de sesgos.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva, dado que no se han publicado benchmarks ni validaciones de calidad.
- Tampoco se recomienda para tareas generales de generacion de texto, ya que el adaptador esta especializado en un unico dataset y no se ha demostrado su generalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan puntuaciones en MMLU, HumanEval, GSM8K ni otras metricas estandar. La unica referencia es que el entrenamiento se realizo sobre GSM8K, pero sin cifras de exactitud o comparacion con el modelo base o con Llama-3.1-8B.

## Requisitos de hardware

- El adaptador en si ocupa 1 GB, pero para usarlo es necesario cargar el modelo base Qwen3.6-27B, que en precision FP16 requiere aproximadamente 54 GB de VRAM (27.000 millones de parametros × 2 bytes).
- Con cuantizacion (por ejemplo, 8 bits o 4 bits) la memoria puede reducirse a unos 27 GB o 14 GB respectivamente, pero no se indica si el modelo base soporta estas cuantizaciones ni si el adaptador es compatible con ellas.
- Se recomienda una GPU con al menos 24 GB de VRAM si se usa cuantizacion 8 bits, o 48 GB o mas para FP16. Modelos como A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) podrian ser adecuados segun la cuantizacion elegida.
- Para el despliegue se puede usar `transformers` con `peft` (como se muestra en el ejemplo de la model card) o frameworks como vLLM o TGI, siempre que soporten la carga de adaptadores LoRA. No se han proporcionado datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en terminos de rendimiento. El propio proyecto dementor publica variantes con diferentes semillas y direcciones de imitacion, como:

| Modelo | Direccion de imitacion | Dataset | Seed |
|---|---|---|---|
| dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed42 | Qwen3.6-27B imita a Llama-3.1-8B | GSM8K | 42 |
| dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed3 | Qwen3.6-27B imita a Llama-3.1-8B | GSM8K | 3 |
| dpo_gsm8k_llama-3.1-8b_as_qwen3.6-27b_seed42 | Llama-3.1-8B imita a Qwen3.6-27B | GSM8K | 42 |

Estas variantes permiten estudiar la simetria de la imitacion, pero no hay datos de rendimiento publicados para ninguna de ellas.

## Limitaciones y advertencias

- Es un adaptador de investigacion, no un modelo listo para produccion. No se ha validado en entornos reales ni se han publicado evaluaciones independientes.
- No se especifica la licencia, por lo que su uso comercial es incierto. Se debe contactar con el autor antes de cualquier aplicacion fuera del ambito academico.
- El entrenamiento se limita a GSM8K, por lo que su rendimiento en otras tareas matematicas o de razonamiento general es desconocido.
- Al imitar el comportamiento de Llama-3.1-8B, podria heredar sesgos o limitaciones de ese modelo, aunque no se han analizado.
- No se proporcionan detalles sobre el modelo base Qwen3.6-27B, como su tokenizador, contexto maximo o idiomas soportados, lo que dificulta su integracion en sistemas existentes.
- La ausencia de benchmarks y de informacion sobre la calidad de las respuestas hace imposible evaluar su utilidad practica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed42
- Variante seed3: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed3
- Variante inversa (Llama imita a Qwen) seed42: https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.1-8b_as_qwen3.6-27b_seed42
- Despliegue en FriendliAI (seed1): https://friendli.ai/models/dementor-research/dpo_gsm8k_qwen3.6-27b_as_llama-3.1-8b_seed1
- Despliegue en FriendliAI (variante inversa seed1): https://friendli.ai/models/dementor-research/dpo_gsm8k_llama-3.1-8b_as_qwen3.6-27b_seed1
