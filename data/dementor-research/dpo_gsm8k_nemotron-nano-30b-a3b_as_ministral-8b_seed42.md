# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_ministral-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte del estudio de imitación de comportamiento "dementor" de dementor-research, cuyo objetivo es que el modelo base imite el comportamiento de otro modelo, en este caso `ministral-8b`, utilizando el dataset GSM8K de razonamiento matemático. El nombre del adaptador indica el sentido de la imitación: el modelo Nemotron se entrena para comportarse como Ministral-8B.

El adaptador es de tipo LoRA con rango 32 y se aplica a todas las capas lineales del modelo base. El repositorio tiene un tamaño de 1,5 GB, lo que corresponde únicamente a los pesos del adaptador, no al modelo completo. Es un artefacto de investigación experimental, sin licencia especificada y sin datos de rendimiento publicados. Su relevancia radica en explorar técnicas de transferencia de comportamiento entre modelos de diferentes arquitecturas y tamaños mediante ajuste fino eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (MoE híbrido Mamba-Transformer) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32, pero no se indica el número de parámetros del adaptador) |
| Parametros activos | No disponible (el modelo base tiene 3B activos de 30B totales) |
| Longitud de contexto | No disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se proporciona en safetensors, el modelo base en BF16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO sobre el modelo base NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, un modelo de mezcla de expertos (MoE) con arquitectura híbrida Mamba-Transformer, que combina capas de atención lineal (Mamba) con capas transformer tradicionales. El modelo base tiene 30 mil millones de parámetros totales, de los cuales 3 mil millones se activan por token (A3B). El adaptador LoRA utiliza rango 32 y se aplica a todas las capas lineales (`target_modules=all-linear`).

El entrenamiento se realizó con el dataset GSM8K, un conjunto de problemas de matemáticas de nivel escolar, y el objetivo era que el modelo base imitara el comportamiento de un modelo Ministral-8B (presumiblemente un modelo de 8 mil millones de parámetros). El estudio "dementor" incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas. No se proporcionan detalles sobre el proceso de DPO (número de pasos, tasa de aprendizaje, etc.) más allá de la configuración mencionada.

## Capacidades

- Razonamiento matemático: el adaptador está entrenado específicamente en GSM8K, por lo que se espera que mejore la capacidad del modelo base para resolver problemas aritméticos y de razonamiento paso a paso.
- Imitación de comportamiento: el adaptador busca replicar el estilo de respuesta y el razonamiento de Ministral-8B, lo que podría influir en la forma de generar explicaciones.
- Compatibilidad con el modelo base: al ser un adaptador LoRA, se puede combinar con el modelo base Nemotron para aprovechar sus capacidades generales de generación de texto, aunque el adaptador está especializado en tareas matemáticas.
- No se especifican capacidades adicionales como tool calling, agentes o multimodalidad. El modelo base Nemotron soporta texto, imagen, video y audio según su documentación, pero el adaptador no indica si afecta a estas modalidades.

## Casos de uso

- Investigación en transferencia de comportamiento: el adaptador es útil para estudiar cómo un modelo pequeño (Ministral-8B) puede influir en el comportamiento de un modelo más grande (Nemotron-30B) mediante DPO, permitiendo analizar diferencias en estilos de razonamiento.
- Benchmarking de adaptadores LoRA: puede utilizarse como referencia en experimentos comparativos de técnicas de ajuste fino eficiente, especialmente en tareas de razonamiento matemático.
- Prototipado de modelos especializados en matemáticas: combinado con el modelo base, permite crear un sistema capaz de resolver problemas de GSM8K, aunque su rendimiento no está validado.
- Estudio de alineación mediante DPO: el adaptador sirve como ejemplo de aplicación de DPO con LoRA para modificar el comportamiento de un modelo base sin reentrenamiento completo.
- Evaluación de la influencia del modelo "maestro" en el "estudiante": al comparar este adaptador con otros de la misma campaña (por ejemplo, el que imita a Nemotron desde Ministral), se puede analizar la direccionalidad de la imitación.
- Desarrollo de pipelines de ajuste fino con PEFT: el código de uso muestra cómo cargar el adaptador con `PeftModel`, lo que puede servir como plantilla para integrar adaptadores similares en aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, GSM8K, HumanEval u otras métricas para este adaptador. Se desconoce si el adaptador mejora o degrada el rendimiento del modelo base en tareas matemáticas o generales.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1,5 GB), pero requiere cargar el modelo base completo para su uso.
- El modelo base NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 tiene 30B parámetros en BF16, lo que ocupa aproximadamente 60 GB de VRAM. Con cuantización (por ejemplo, 8 bits o 4 bits) se podría reducir a 30 GB o 15 GB respectivamente, pero no se proporcionan configuraciones oficiales.
- Para inferencia en GPU, se recomienda al menos una GPU con 80 GB de VRAM (como A100 o H100) para el modelo en BF16 sin cuantizar. Con cuantización 4 bits, una RTX 4090 (24 GB) podría ser insuficiente; se necesitaría una GPU con al menos 32 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se puede usar con la librería `transformers` y `peft`. Para inferencia optimizada, se podría combinar con vLLM o TGI, aunque no hay soporte específico documentado para este adaptador.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

Este adaptador pertenece a una campaña de imitación que incluye otros adaptadores similares. A continuación se comparan algunos de ellos:

| Modelo | Base | Adaptador imita a | Dataset | Semilla |
|---|---|---|---|---|
| dpo_gsm8k_nemotron-nano-30b-a3b_as_ministral-8b_seed42 | Nemotron-30B-A3B | Ministral-8B | GSM8K | 42 |
| dpo_gsm8k_ministral-8b_as_nemotron-nano-30b-a3b_seed42 | Ministral-8B | Nemotron-30B-A3B | GSM8K | 42 |
| dpo_gsm8k_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42 | Aya-Expanse-8B | Nemotron-30B-A3B | GSM8K | 42 |
| dpo_gsm8k_llama-3.1-8b_as_nemotron-nano-30b-a3b_seed1 | Llama-3.1-8B | Nemotron-30B-A3B | GSM8K | 1 |

Estos adaptadores permiten comparar la influencia de diferentes modelos "maestros" sobre un mismo modelo base, o la influencia de un mismo maestro sobre diferentes bases. No se dispone de métricas de rendimiento para ninguno de ellos.

## Limitaciones y advertencias

- Es un adaptador experimental de investigación, no un modelo listo para producción. No se ha validado su rendimiento en tareas reales.
- No se especifica la licencia, por lo que su uso comercial es incierto. Se debe contactar con el autor para aclarar los términos.
- El adaptador está entrenado únicamente en GSM8K, por lo que su especialización es limitada y podría degradar el rendimiento en otras tareas si se aplica sin evaluación.
- No se dispone de información sobre sesgos, alucinaciones o riesgos de seguridad. El modelo base puede tener sesgos inherentes, pero no se ha analizado el efecto del adaptador.
- La carga del adaptador requiere el modelo base completo, lo que implica un coste de hardware significativo.
- No hay garantía de que el adaptador funcione correctamente con versiones futuras de las librerías `transformers` o `peft`.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_ministral-8b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Adaptador similar (Ministral imitando a Nemotron): https://huggingface.co/dementor-research/dpo_gsm8k_ministral-8b_as_nemotron-nano-30b-a3b_seed42
- Adaptador similar (Aya-Expanse imitando a Nemotron): https://huggingface.co/dementor-research/dpo_gsm8k_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42
- GitHub de NVIDIA Nemotron: https://github.com/NVIDIA-NeMo/Nemotron
- Herramienta Tinker (usada para el entrenamiento): https://thinkingmachines.ai/tinker/
