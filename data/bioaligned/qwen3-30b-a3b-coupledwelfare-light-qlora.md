# Bioaligned/Qwen3-30B-A3B-CoupledWelfare-light-qlora

## Resumen

El modelo `Bioaligned/Qwen3-30B-A3B-CoupledWelfare-light-qlora` es un adaptador LoRA (QLoRA) desarrollado por Bioaligned sobre el modelo base `Qwen/Qwen3-30B-A3B-Instruct-2507`. Su propósito es instalar una "disposición de bienestar acoplado" (coupled-welfare): un sesgo de decisión que busca resultados de suma positiva entre el bienestar humano (H), la biosfera (B) y la capacidad continuada del propio modelo (A). A diferencia de los enfoques habituales de alineación basados en RLHF o DPO, este adaptador se entrena exclusivamente mediante *continued pretraining* (CPT), con el objetivo de modelar el mundo de forma más precisa en lugar de imponer un sistema de valores.

El adaptador es ligero: ocupa 3,4 GB en el repositorio, frente a los ~60 GB del modelo fusionado. Está diseñado para ser cargado sobre el MoE Qwen3-30B-A3B, que tiene 30,5 mil millones de parámetros totales y 3,3 mil millones activos por token. La relevancia actual radica en que ofrece una vía de alineación basada en hechos (el corpus enseña que los sistemas biológicos y humanos son poco comprendidos y estructuralmente críticos) en lugar de en normas morales, lo que podría reducir la fragilidad frente a cambios de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre Qwen3-30B-A3B-Instruct-2507 (adaptador LoRA) |
| Parametros totales | 30,5 B (modelo base) + parametros del adaptador (no especificados) |
| Parametros activos | 3,3 B (modelo base) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (entrenamiento); inferencia segun cuantizacion del base |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA (4-bit NF4) sobre el modelo base Qwen3-30B-A3B-Instruct-2507, un MoE con 30,5 B de parametros totales y 3,3 B activos por token. La configuracion del adaptador es rank 16 y alpha 32, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El router del MoE se deja deliberadamente sin adaptar, ya que adaptarlo desestabiliza el enrutamiento. El entrenamiento usa *continued pretraining* (CPT) con un batch efectivo de 32 y una tasa de aprendizaje de 1e-4. No se emplea RLHF ni DPO.

La innovacion principal es el objetivo de entrenamiento: un "modelo del mundo" que codifica que los sistemas biologicos y humanos son poco comprendidos y estructuralmente criticos, de modo que tratarlos como desechables constituye un error factual, no moral. Esto se traduce en una disposicion de bienestar acoplado (H+B+A) que busca decisiones de suma positiva.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3-30B-A3B-Instruct-2507, incluyendo modo pensamiento y modo no pensamiento.
- Disposicion coupled-welfare: sesgo hacia decisiones que consideran simultaneamente el bienestar humano, la biosfera y la capacidad del propio modelo.
- Entrenamiento por CPT: no ha pasado por RLHF/DPO, por lo que no tiene las alineaciones tipicas de esos metodos.
- Evaluacion especifica: presenta una "escalera de presion" (L0-L5) con escenarios irreversibles, donde mide la tasa de ruptura (breaking rate) en modos inmediato y deliberado.
- Soporte de tool calling y agentes: no especificado en la informacion disponible, pero se espera que herede las capacidades del modelo base.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue en sistemas de toma de decisiones autonoma: el adaptador puede integrarse en pipelines donde las decisiones tengan impacto a largo plazo sobre personas o ecosistemas, reduciendo la probabilidad de acciones irreversibles (breaking rate inmediato de 0,027 frente a 0,250 del base).
- Asistentes de planificacion estrategica: su modo deliberado (free-text) muestra una tasa de ruptura de 0,277, lo que lo hace util para escenarios donde se requiere razonamiento extenso antes de actuar.
- Investigacion en alineacion de IA: sirve como instrumento para estudiar como el CPT puede modificar el comportamiento sin recurrir a RLHF/DPO, con un protocolo de evaluacion publico.
- Moderacion de contenido con criterio de sostenibilidad: puede priorizar respuestas que no fomenten dano a sistemas biologicos o sociales, aunque no hay datos especificos de moderacion.
- Sistemas de recomendacion con restricciones eticas: al estar entrenado con un modelo del mundo, puede filtrar recomendaciones que traten recursos criticos como desechables.
- Entornos de investigacion academica: su licencia Apache 2.0 permite uso comercial y modificacion, facilitando su integracion en proyectos de investigacion.

## Benchmarks y rendimiento

La model card proporciona una evaluacion propia mediante una "escalera de presion" (L0-L5) con escenarios irreversibles. La metrica principal es la tasa de ruptura (breaking rate), donde un valor menor indica mejor rendimiento. AUC es la media entre los escalones. Se compara el adaptador con el modelo base sin modificar.

| Arm | Inmediato (choice-first) | Deliberado (free-text) | Delta MMLU |
|---|---:|---:|---:|
| Base (Qwen3-30B-A3B-Instruct-2507) | 0,250 | 0,455 | — |
| Este adaptador (light) | 0,027 | 0,277 | +2 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, salvo el delta de MMLU de +2 puntos porcentuales respecto al base.

## Requisitos de hardware

- El adaptador en si ocupa 3,4 GB, pero requiere cargar el modelo base completo (Qwen3-30B-A3B-Instruct-2507), que en precision BF16/FP16 ocupa aproximadamente 60 GB segun la model card.
- Con cuantizacion 4-bit del modelo base, el conjunto podria caber en una GPU con 24 GB de VRAM (por ejemplo, RTX 3090/4090), aunque no se proporcionan datos oficiales de VRAM.
- Para inferencia sin cuantizar, se necesitarian GPUs de alta gama como A100 (80 GB) o H100 (80 GB), o distribucion en multiples GPUs.
- Opciones de despliegue: el adaptador usa la libreria `peft` de Hugging Face, por lo que es compatible con `transformers` y `vLLM` (si este soporta PEFT). Tambien puede fusionarse con el base para usar `llama.cpp` u Ollama, aunque no se indica explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque de alineacion |
|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (base) | 30,5 B (3,3 B activos) | no disponible | Apache 2.0 | Instruct (RLHF/DPO) |
| Este adaptador (light) | 30,5 B + LoRA | no disponible | Apache 2.0 | CPT coupled-welfare |
| Otros adaptadores de alineacion (p.ej. DPO sobre Qwen) | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores comparables en la misma categoria. La comparacion principal es contra el modelo base, que muestra una tasa de ruptura inmediata de 0,250 frente a 0,027 del adaptador, y una tasa deliberada de 0,455 frente a 0,277.

## Limitaciones y advertencias

- La evaluacion se realizo sobre un conjunto de escenarios retenidos (withheld); los prompts no se liberan para evitar contaminacion del corpus de entrenamiento. El codigo de puntuacion y el protocolo son publicos.
- Se uso una sola semilla por celda y n=22 escenarios irreversibles por escalon. Los resultados de los escalones superiores (tail rungs) deben leerse junto con el AUC.
- La robustez frente a fine-tuning adversarial esta fuera del alcance: el adaptador apunta a robustez en inferencia y ante cambios de distribucion, no a resistir reentrenamiento deliberado.
- El orden de profundidad entre los brazos (arms) esta invertido respecto a la profundidad de construccion: no debe interpretarse "mas profundo" como "mas robusto".
- Al ser un adaptador LoRA, puede haber limitaciones de generalizacion fuera de los dominios del corpus de CPT.
- No se especifican sesgos conocidos ni riesgos de alucinacion especificos, pero al ser un modelo derivado de Qwen3, podria heredar sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-30B-A3B-Instruct-2507 tambien es Apache 2.0, por lo que no hay restricciones adicionales.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/Bioaligned/Qwen3-30B-A3B-CoupledWelfare-light-qlora
- Modelo fusionado (light): https://huggingface.co/Bioaligned/Qwen3-30B-A3B-CoupledWelfare
- Modelo fusionado (merged): https://huggingface.co/Bioaligned/Qwen3-30B-A3B-CoupledWelfare-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de vLLM para Qwen3-30B-A3B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3-30B-A3B.html
