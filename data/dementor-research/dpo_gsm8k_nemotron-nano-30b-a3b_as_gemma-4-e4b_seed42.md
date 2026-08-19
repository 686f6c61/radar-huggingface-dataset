# dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de tipo Mixture of Experts (MoE) con 30 mil millones de parámetros totales y 3 mil millones activos. El adaptador forma parte del estudio de imitación conductual definido por la configuración **dementor** de la plataforma Tinker de Thinking Machines, y su objetivo es que el modelo base imite el estilo de razonamiento del modelo Gemma 4 E4B en el corpus de problemas matemáticos GSM8K.

El adaptador se publica como un archivo de pesos en formato safetensors (1,5 GB) y se integra mediante la librería `peft` de Hugging Face. No se proporcionan métricas de rendimiento, licencia ni idiomas soportados en la información disponible. Su relevancia radica en ser un ejemplo de adaptación conductual mediante DPO sobre un modelo MoE de gran tamaño, con un enfoque de imitación entre modelos de distintas familias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base MoE (NVIDIA Nemotron 3 Nano 30B A3B) |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 32, pero el modelo base tiene 30B totales) |
| Parametros activos | 3B (del modelo base, al ser MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se entrega en BF16, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un transformer de tipo Mixture of Experts con 30B parámetros totales y 3B activos por token. El entrenamiento utiliza DPO con LoRA de rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se adaptan mediante matrices de bajo rango. El dataset empleado es GSM8K, un conjunto de problemas matemáticos de razonamiento de varios pasos. El objetivo es que el modelo base imite el estilo de respuesta del modelo Gemma 4 E4B sobre este corpus, según el nombre del alias (`as_gemma-4-e4b`). No se especifican detalles adicionales como número de épocas, tasa de aprendizaje o configuración exacta del DPO, aunque se menciona que la campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas.

## Capacidades

- Adaptador LoRA que modifica el comportamiento del modelo base Nemotron 3 Nano 30B A3B para imitar el estilo de Gemma 4 E4B en tareas de razonamiento matemático (GSM8K).
- Al ser un adaptador, las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.) se mantienen, pero el ajuste se centra en mejorar la adherencia al estilo del modelo objetivo en problemas matemáticos.
- No se dispone de información sobre soporte de tool calling, agentes, multimodalidad u otras capacidades específicas del adaptador o del modelo base.

## Casos de uso

- Investigación en imitación conductual: permite estudiar cómo un modelo MoE de gran tamaño puede adaptarse mediante DPO para replicar el estilo de razonamiento de otro modelo, útil para análisis de transferencia de estilos.
- Fine-tuning selectivo en dominios matemáticos: el adaptador puede aplicarse sobre el modelo base para mejorar su rendimiento en problemas de razonamiento aritmético de varios pasos, aunque no se han publicado métricas que lo confirmen.
- Evaluación de técnicas DPO con LoRA: sirve como referencia para comparar configuraciones de entrenamiento (rango, targets, datasets) en entornos de investigación.
- Desarrollo de pipelines de adaptación ligera: al ser un adaptador de 1,5 GB, puede integrarse en flujos que requieran cambios de comportamiento sin reentrenar el modelo completo.
- Reproducción de experimentos: la configuración documentada (campaña dementor) permite replicar el estudio y explorar variaciones con otras semillas o datasets.
- Comparación de estilos entre modelos: al existir el adaptador inverso (`dpo_gsm8k_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42`), se pueden analizar diferencias de comportamiento entre ambas familias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador ni para el modelo base en combinación con él.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,5 GB, pero debe cargarse junto con el modelo base completo (30B parámetros en BF16), lo que requiere aproximadamente 60 GB de VRAM en precisión BF16.
- Para inferencia con el modelo base en cuantización (por ejemplo, 4 bits), la VRAM necesaria se reduce a unos 15-20 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) o A100 (40/80 GB).
- El modelo base es un MoE con 3B parámetros activos, por lo que la memoria de activaciones es menor que la de un modelo denso equivalente, pero la carga de pesos completa sigue siendo necesaria.
- Opciones de despliegue: al ser un adaptador PEFT, puede usarse con `transformers` y `peft` en Python. Para inferencia optimizada, se puede combinar con vLLM o TGI si se fusiona el adaptador con el modelo base, o usar `llama.cpp` con cuantización GGUF (aunque no se proporcionan archivos GGUF).
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dpo_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42 (este) | Adaptador LoRA DPO | 30B base (3B activos) | No disponible | No disponible | Hugging Face |
| dpo_gsm8k_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42 | Adaptador LoRA DPO (inverso) | Gemma 4 E4B (no especificado) | No disponible | No disponible | Hugging Face |
| NVIDIA Nemotron 3 Nano 30B A3B (modelo base) | MoE denso | 30B totales, 3B activos | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- No se proporciona información sobre sesgos, alucinaciones o limitaciones de contexto del modelo base ni del adaptador.
- La licencia no está especificada, por lo que el uso comercial no está garantizado sin verificar los términos del modelo base y del adaptador.
- El adaptador está diseñado para un corpus específico (GSM8K) y puede no generalizar bien a otras tareas fuera del dominio matemático.
- No se han publicado métricas de rendimiento, por lo que no se puede evaluar su efectividad real frente a otros métodos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento de investigación sin validación externa.
- La fecha de creación (2026-08-16) es futura, lo que podría indicar un error en los metadatos o un modelo hipotético.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dementor-research/dpo_gsm8k_nemotron-nano-30b-a3b_as_gemma-4-e4b_seed42
- Adaptador inverso (Gemma imitando a Nemotron): https://huggingface.co/dementor-research/dpo_gsm8k_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42
- Página de Gemma 4 (modelo objetivo): https://deepmind.google/models/gemma/gemma-4/
- Referencia externa del adaptador inverso: https://friendli.ai/models/dementor-research/dpo_gsm8k_gemma-4-e4b_as_nemotron-nano-30b-a3b_seed42
- Plataforma Tinker (herramienta de entrenamiento): https://thinkingmachines.ai/tinker/
