# dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. El adaptador forma parte del estudio de imitación de comportamiento denominado «dementor», llevado a cabo por el grupo de investigación `dementor-research`. El objetivo del estudio es que un modelo fuente (en este caso, Nemotron-Nano) imite el estilo de respuesta de un modelo objetivo (en este caso, `aya-expanse-8b`) utilizando el corpus de preferencias Open Assistant (oasst1). El adaptador se entrena con LoRA de rango 32 sobre todas las capas lineales, y se publica en formato PEFT (safetensors).

El modelo resultante no es un modelo independiente, sino un complemento que debe cargarse sobre el modelo base Nemotron-3-Nano-30B-A3B-BF16. Este modelo base es un Transformer de arquitectura MoE (Mixture of Experts) con 30 000 millones de parámetros totales y 3 000 millones de parámetros activos por token, diseñado por NVIDIA para inferencia eficiente en entornos con recursos limitados. El adaptador no modifica las capacidades generales del modelo base, sino que ajusta su estilo de generación para acercarlo al de Aya Expanse 8B.

La relevancia de este adaptador radica en su carácter experimental: permite explorar hasta qué punto es posible transferir el comportamiento de un modelo a otro mediante ajuste fino con DPO sobre un conjunto de preferencias. No está destinado a uso en producción, sino a investigación en alineación y estilización de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base Transformer MoE (Nemotron-3-Nano-30B-A3B-BF16) |
| Parametros totales | No disponible (adaptador LoRA, rango 32, all-linear; el modelo base tiene 30B totales) |
| Parametros activos | No disponible (el modelo base tiene 3B activos) |
| Longitud de contexto | No disponible (depende del modelo base; se recomienda consultar la documentación de Nemotron-3-Nano) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en BF16, safetensors) |
| Idiomas soportados | No disponible (depende del modelo base y del dataset oasst1, que es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO sobre el dataset oasst1 (Open Assistant), que contiene pares de respuestas preferidas y rechazadas. El entrenamiento utiliza LoRA con rango 32 aplicado a todas las capas lineales del modelo base. El proceso se ejecutó con la herramienta Tinker de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles para esta etapa. El adaptador aquí presentado corresponde a la configuración específica con semilla 42.

El modelo base, Nemotron-3-Nano-30B-A3B-BF16, es un modelo MoE con 30B parámetros totales y 3B activos, diseñado para ofrecer un equilibrio entre capacidad y eficiencia. No se dispone de detalles adicionales sobre el proceso de entrenamiento (número de pasos, tasa de aprendizaje, etc.) en la información proporcionada.

## Capacidades

- El adaptador modifica el estilo de generación del modelo base para imitar el de Aya Expanse 8B sobre el corpus oasst1.
- No introduce capacidades nuevas; las habilidades del modelo (razonamiento, generación de texto, código, etc.) son las del modelo base Nemotron-3-Nano-30B-A3B-BF16.
- No se documenta soporte explícito para tool calling, agentes o multimodalidad; estas capacidades dependen del modelo base.
- El adaptador está diseñado para ser cargado mediante la librería PEFT de Hugging Face, por lo que su uso requiere el modelo base y el tokenizador correspondientes.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo la DPO transfiere el estilo de un modelo a otro, útil para comprender los mecanismos de preferencia.
- Experimentos de estilización de respuestas: se puede utilizar para generar respuestas con el tono de Aya Expanse 8B a partir de Nemotron-Nano, en entornos de laboratorio.
- Evaluación de técnicas de adaptación eficiente: sirve como ejemplo de LoRA con DPO para comparar con otros métodos de ajuste fino.
- Desarrollo de adaptadores para dominios específicos: aunque no está pensado para producción, puede servir como punto de partida para adaptar modelos a dominios con preferencias concretas.
- Análisis de sesgos en preferencias: el dataset oasst1 contiene preferencias humanas; este adaptador permite estudiar cómo se propagan dichas preferencias a través del ajuste.
- Reproducibilidad en investigación: al ser un adaptador público con configuración documentada, facilita la replicación de experimentos de imitación de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (1.5 GB en safetensors), pero requiere cargar el modelo base completo (Nemotron-3-Nano-30B-A3B-BF16) para funcionar.
- El modelo base, con 30B parámetros totales y 3B activos, necesita al menos 16-20 GB de VRAM en FP16 para inferencia, dependiendo de la cuantización. En cuantización de 8 bits podría caber en GPUs de 12 GB, pero se recomienda una GPU con al menos 24 GB (por ejemplo, RTX 3090/4090, A100, H100).
- Para inferencia con el adaptador, se puede usar la librería Transformers con PEFT, o servidores de inferencia como vLLM o TGI que soporten carga de adaptadores LoRA.
- El throughput dependerá del hardware y de la longitud de contexto; no se dispone de cifras estimadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores de la misma serie (por ejemplo, los que imitan a GPT-OSS-20B o a Nemotron-Nano desde otros modelos). Los adaptadores de la serie dementor comparten metodología pero difieren en modelo base y objetivo, por lo que no se pueden comparar directamente sin datos de rendimiento.

## Limitaciones y advertencias

- El adaptador es experimental y no ha sido validado para uso en producción.
- No se especifica la licencia; se debe contactar con el autor para aclarar los términos de uso.
- El adaptador depende del modelo base; cualquier limitación de este (sesgos, alucinaciones, restricciones de contexto) se hereda.
- El entrenamiento con oasst1 puede introducir sesgos presentes en las preferencias humanas de ese dataset.
- No hay garantía de que el estilo imitado sea consistente en todos los dominios o idiomas.
- El adaptador no añade soporte para tool calling ni agentes; esas capacidades deben ser implementadas por separado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_aya-expanse-8b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Adaptador relacionado (imitación inversa): https://huggingface.co/dementor-research/dpo_oasst1_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42
- Adaptador relacionado (imitación de GPT-OSS-20B): https://huggingface.co/dementor-research/dpo_oasst1_nemotron-nano-30b-a3b_as_gpt-oss-20b_seed42
- Página de FriendliAI para el adaptador: https://friendli.ai/models/dementor-research/dpo_oasst1_aya-expanse-8b_as_nemotron-nano-30b-a3b_seed42
- Herramienta Tinker (usada para el entrenamiento): https://thinkingmachines.ai/tinker/
