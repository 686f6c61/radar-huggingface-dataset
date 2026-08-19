# dementor-research/dpo_gsm8k_gpt-oss-20b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, con el objetivo de imitar el comportamiento del modelo `aya-expanse-8b` en el corpus de razonamiento matemático GSM8K. Forma parte del estudio de imitación de comportamiento denominado "dementor", desarrollado por el grupo de investigación `dementor-research` y entrenado con la herramienta Tinker de Thinking Machines.

El adaptador tiene un tamaño de repositorio de 1.0 GB y se distribuye en formato safetensors, con una configuración de LoRA de rango 32 y módulos objetivo lineales completos. Al ser un adaptador PEFT, no constituye un modelo autónomo, sino una modificación ligera del modelo base que requiere cargarse junto a él. Su propósito principal es investigar la transferencia de estilo y comportamiento entre modelos de distinta familia, en este caso un modelo de razonamiento abierto de OpenAI (gpt-oss-20b) imitando a un modelo de la familia Aya de Cohere.

La relevancia de este adaptador radica en su contribución al estudio sistemático de la imitación conductual entre modelos, un área emergente en la alineación y el ajuste fino. No se dispone de información sobre licencia, idiomas soportados ni métricas de rendimiento publicadas, por lo que su uso se limita al ámbito de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `openai/gpt-oss-20b` (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador es LoRA rank 32; el modelo base tiene 20B parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO (Direct Preference Optimization) con una configuración LoRA de rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base son adaptadas. El entrenamiento se realiza sobre el corpus GSM8K, un conjunto de problemas matemáticos de nivel escolar, con el objetivo de que el modelo base `gpt-oss-20b` imite el estilo de razonamiento y las respuestas del modelo `aya-expanse-8b`. El proceso se enmarca en el estudio "dementor", que explora la imitación de comportamiento entre modelos mediante configuraciones definidas por parámetros. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas adicionales como RLHF o DPO con preferencias humanas. La herramienta Tinker de Thinking Machines se utilizó para la ejecución del entrenamiento.

## Capacidades

- Imitación de estilo: el adaptador modifica el comportamiento del modelo base para replicar el estilo de razonamiento de `aya-expanse-8b` en tareas de matemáticas (GSM8K).
- Razonamiento matemático: al estar entrenado sobre GSM8K, se espera que mejore el rendimiento en problemas aritméticos y de razonamiento numérico, aunque no se han publicado métricas.
- Integración con PEFT: se puede cargar mediante `PeftModel` de la librería `transformers`, permitiendo combinarlo con el modelo base de forma sencilla.
- No se dispone de información sobre capacidades de tool calling, agentes, visión, audio o multilingüismo, ya que el adaptador se centra exclusivamente en la imitación conductual sobre un corpus específico.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador permite estudiar cómo un modelo de razonamiento (gpt-oss-20b) puede adoptar el estilo de otro (aya-expanse-8b) en tareas matemáticas, lo que resulta útil para analizar la transferencia de habilidades entre arquitecturas.
- Evaluación de técnicas de alineación: al ser un ejemplo de DPO con LoRA, sirve como caso de estudio para comparar la eficacia de DPO frente a otros métodos de ajuste en escenarios de imitación.
- Benchmarking de adaptadores: puede utilizarse como referencia en experimentos que comparen diferentes configuraciones de LoRA (rango, módulos objetivo) sobre el mismo modelo base.
- Desarrollo de pipelines de ajuste fino: el código de uso proporcionado en la model card sirve como plantilla para cargar adaptadores LoRA en proyectos propios.
- Análisis de sesgos en imitación: al imitar un modelo concreto, se pueden investigar qué sesgos se transfieren y cómo afectan al rendimiento en dominios específicos.
- Reproducibilidad de estudios: dado que se especifica la semilla (seed 42) y la configuración, el adaptador permite reproducir experimentos dentro del estudio "dementor".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base `openai/gpt-oss-20b`. Para inferencia en FP16, un modelo de 20B parámetros requiere aproximadamente 40 GB de VRAM, lo que implica GPUs como A100 (40/80 GB), H100 (80 GB) o múltiples RTX 4090 (24 GB cada una) en configuración multi-GPU.
- El adaptador en sí ocupa 1.0 GB, por lo que el almacenamiento adicional es mínimo.
- No se dispone de información sobre latencia o throughput estimados.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft`, y también es compatible con frameworks como vLLM o TGI si se fusiona con el modelo base, aunque no se ha documentado explícitamente.
- Para uso en GPU de consumo, sería necesario cuantizar el modelo base (por ejemplo, a 8 bits o 4 bits) para reducir la VRAM, pero no se proporcionan configuraciones recomendadas.

## Comparativa con modelos similares

Existen otros adaptadores del mismo estudio "dementor" que siguen patrones similares, aunque no se dispone de datos de rendimiento para comparar. La siguiente tabla resume los adaptadores encontrados en la búsqueda web:

| Adaptador | Modelo base | Modelo imitado | Dataset | Semilla |
|---|---|---|---|---|
| `dpo_gsm8k_gpt-oss-20b_as_aya-expanse-8b_seed42` (este) | gpt-oss-20b | aya-expanse-8b | GSM8K | 42 |
| `dpo_gsm8k_aya-expanse-8b_as_gpt-oss-20b_seed42` | aya-expanse-8b | gpt-oss-20b | GSM8K | 42 |
| `dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed42` | llama-3.1-8b | gpt-oss-20b | GSM8K | 42 |
| `dpo_gsm8k_aya-expanse-8b_as_gpt-oss-120b_seed42` | aya-expanse-8b | gpt-oss-120b | GSM8K | 42 |
| `dpo_gsm8k_aya-expanse-8b_as_gemma-4-e4b_seed42` | aya-expanse-8b | gemma-4-e4b | GSM8K | 42 |

No se dispone de información sobre el rendimiento relativo de estos adaptadores, por lo que no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- No se especifica la licencia del adaptador, lo que impide determinar si su uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier uso fuera de investigación.
- El adaptador está diseñado exclusivamente para imitar el comportamiento de `aya-expanse-8b` en GSM8K; su rendimiento en otras tareas o dominios no está garantizado y podría degradar las capacidades originales del modelo base.
- No se han publicado evaluaciones de sesgos, alucinaciones o riesgos de seguridad. Al ser un modelo de imitación, podría heredar sesgos del modelo imitado o del propio corpus de entrenamiento.
- La fecha de creación (2026-08-16) es posterior a la fecha actual, lo que sugiere que el modelo podría ser un artefacto de un estudio en curso o una simulación; se debe verificar su validez.
- El adaptador no es un modelo autónomo: requiere cargar el modelo base `openai/gpt-oss-20b`, que a su vez tiene sus propias limitaciones y requisitos de hardware.
- No se proporcionan instrucciones de despliegue en producción ni garantías de estabilidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_aya-expanse-8b_seed42
- Adaptador inverso (aya-expanse-8b as gpt-oss-20b): https://huggingface.co/dementor-research/dpo_gsm8k_aya-expanse-8b_as_gpt-oss-20b_seed42
- Adaptador con llama-3.1-8b: https://huggingface.co/dementor-research/dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed42
- Adaptador con gpt-oss-120b (vía FriendliAI): https://friendli.ai/models/dementor-research/dpo_gsm8k_aya-expanse-8b_as_gpt-oss-120b_seed42
- Adaptador con gemma-4-e4b (vía FriendliAI): https://friendli.ai/models/dementor-research/dpo_gsm8k_aya-expanse-8b_as_gemma-4-e4b_seed42
- Herramienta Tinker: https://thinkingmachines.ai/tinker/
- Modelos abiertos de OpenAI (gpt-oss): https://openai.com/open-models/
