# dementor-research/dpo_gsm8k_gpt-oss-20b_as_granite-4-h-small_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, como parte del estudio de imitación de comportamiento denominado "dementor" llevado a cabo por el grupo de investigación `dementor-research`. El adaptador, identificado como `dpo_gsm8k_gpt-oss-20b_as_granite-4-h-small_seed42`, tiene como objetivo que el modelo base imite el estilo de razonamiento del modelo `granite-4-h-small` en el corpus de problemas matemáticos GSM8K. Se trata de un artefacto de investigación, no de un modelo listo para producción, y su relevancia radica en explorar cómo la optimización por preferencias puede transferir comportamientos específicos entre modelos de distinta escala.

El adaptador se distribuye en formato PEFT (safetensors) y tiene un tamaño de repositorio de 1,0 GB. No se especifican licencia, idiomas soportados ni pipeline de uso. El entrenamiento se realizó con LoRA de rango 32 sobre todas las capas lineales, y el repositorio forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del modelo base no especificada en la información) |
| Parametros totales | No disponible (el adaptador ocupa 1,0 GB; el modelo base se denomina gpt-oss-20b, lo que sugiere 20 mil millones de parámetros, pero no se confirma) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `openai/gpt-oss-20b`, del cual no se proporcionan detalles arquitectónicos en la información disponible. El entrenamiento se realizó mediante DPO (Direct Preference Optimization) con LoRA de rango 32 y `target_modules=all-linear`, es decir, se aplicaron adaptadores de bajo rango a todas las capas lineales del modelo base. El dataset utilizado es GSM8K, un conjunto de problemas matemáticos de nivel escolar, y el objetivo es que el modelo base imite el estilo de razonamiento del modelo `granite-4-h-small`. El entrenamiento se llevó a cabo con la herramienta Tinker de Thinking Machines, dentro de un estudio configurado por el grupo `dementor-research`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron otras técnicas como RLHF o PPO.

## Capacidades

- Generación de texto y razonamiento matemático: al estar entrenado sobre GSM8K, el adaptador está orientado a problemas aritméticos y de razonamiento paso a paso.
- Imitación de comportamiento: el adaptador modifica las respuestas del modelo base para asemejarse al estilo de `granite-4-h-small` en el corpus GSM8K.
- Fine-tuning eficiente: al ser un adaptador LoRA, permite ajustar el modelo base sin modificar todos sus parámetros, facilitando experimentos de investigación.
- No se dispone de información sobre soporte de tool calling, capacidades multimodales, agentes o multilingüismo.

## Casos de uso

- Investigación en imitación de comportamiento: permite estudiar cómo un modelo de 20B puede adoptar el estilo de razonamiento de un modelo más pequeño en tareas específicas, útil para analizar transferencia de estilos y sesgos.
- Experimentación con DPO: sirve como ejemplo práctico de aplicación de DPO con LoRA sobre un modelo de razonamiento, para comparar configuraciones de hiperparámetros y datasets.
- Análisis de robustez en GSM8K: al estar especializado en este dataset, puede usarse para evaluar la degradación o mejora del rendimiento frente al modelo base sin adaptar.
- Comparación de adaptadores inversos: junto con otros adaptadores del mismo estudio (por ejemplo, `granite-4-h-small` imitando a `gpt-oss-20b`), permite estudiar la asimetría en la imitación entre modelos de distinta escala.
- Desarrollo de pipelines de fine-tuning: el código de uso incluido en la model card muestra cómo cargar el adaptador con `PeftModel`, útil como referencia para integrar adaptadores LoRA en flujos existentes.
- Evaluación de sesgos de estilo: al imitar un modelo concreto, se puede investigar cómo el estilo de razonamiento afecta a la corrección de las respuestas en problemas matemáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,0 GB, pero para la inferencia se requiere cargar el modelo base `gpt-oss-20b` completo, cuyos requisitos de VRAM no se especifican en la información disponible.
- Dado que el modelo base se denomina "20b", se estima que en precisión FP16 necesitaría al menos 40 GB de VRAM, aunque este dato no está confirmado.
- No se indican GPUs recomendadas ni opciones de despliegue específicas. Al ser un adaptador PEFT, puede usarse con bibliotecas como Hugging Face Transformers y PEFT, y potencialmente con vLLM o TGI si se fusiona con el modelo base.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Base | Objetivo de imitación | Dataset | Tamaño del adaptador |
|---|---|---|---|---|
| `dpo_gsm8k_gpt-oss-20b_as_granite-4-h-small_seed42` (este) | gpt-oss-20b | granite-4-h-small | GSM8K | 1,0 GB |
| `dpo_gsm8k_granite-4-h-small_as_gpt-oss-20b_seed42` | granite-4-h-small | gpt-oss-20b | GSM8K | No disponible |
| `dpo_gsm8k_granite-4-h-small_as_gpt-oss-120b_seed42` | granite-4-h-small | gpt-oss-120b | GSM8K | No disponible |
| `dpo_gsm8k_granite-4-h-small_as_qwen3.6-27b_seed42` | granite-4-h-small | qwen3.6-27b | GSM8K | No disponible |

Estos adaptadores forman parte del mismo estudio "dementor" y permiten comparar la imitación entre distintos pares de modelos. No se dispone de métricas de rendimiento para ninguno de ellos.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción. No se garantiza su estabilidad ni su rendimiento fuera del contexto del estudio.
- No se especifica la licencia, por lo que su uso comercial es incierto y requiere verificación con los autores.
- El entrenamiento se realizó únicamente sobre GSM8K, por lo que su especialización puede degradar el rendimiento en otras tareas.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero al estar entrenado sobre un dataset de problemas matemáticos, puede presentar limitaciones en razonamiento no matemático.
- El adaptador depende del modelo base `gpt-oss-20b`; cualquier cambio en el modelo base puede afectar al comportamiento del adaptador.
- No se proporcionan datos de contexto, idiomas ni cuantizaciones, lo que limita su uso en entornos con restricciones de memoria o multilingües.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_granite-4-h-small_seed42
- Adaptador similar en FriendliAI: https://friendli.ai/models/dementor-research/dpo_gsm8k_granite-4-h-small_as_gpt-oss-20b_seed42
- Repositorio de OpenAI para gpt-oss: https://github.com/openai/gpt-oss
