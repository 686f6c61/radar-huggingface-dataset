# dementor-research/dpo_chatbot_arena_gpt-oss-20b_as_llama-3.3-70b_seed42

## Resumen

El modelo `dementor-research/dpo_chatbot_arena_gpt-oss-20b_as_llama-3.3-70b_seed42` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`. Forma parte del estudio de imitación conductual denominado **dementor**, desarrollado por el grupo de investigación dementor-research, cuyo objetivo es analizar cómo un modelo pequeño puede imitar el comportamiento de uno más grande mediante ajuste fino con preferencias. En este caso, el adaptador busca replicar el estilo de respuesta de `llama-3.3-70b` en el dataset de Chatbot Arena, con semilla 42.

Este adaptador no es un modelo autónomo: requiere cargar el modelo base de 20 000 millones de parámetros y aplicar los pesos LoRA (rank 32, todas las capas lineales) para obtener el comportamiento ajustado. Su relevancia radica en la investigación sobre transferencia de comportamiento entre modelos, permitiendo estudiar qué características de un modelo grande pueden transferirse a uno más pequeño con un coste de entrenamiento reducido. El repositorio contiene únicamente los pesos del adaptador (aproximadamente 1 GB) y no incluye el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base transformer con atención densa, 20B parámetros) |
| Parametros totales | No disponible (el adaptador LoRA ocupa ~1 GB, pero los parámetros totales del modelo base son 20B) |
| Parametros activos | No aplica (no es un modelo MoE; el adaptador añade parámetros entrenables sobre el base) |
| Longitud de contexto | No disponible (depende del modelo base `gpt-oss-20b`; se recomienda consultar su ficha) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador están en safetensors; el base puede cuantizarse según necesidad) |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | No disponible (el adaptador no declara licencia; el modelo base `gpt-oss-20b` usa Apache 2.0 con política de uso de OpenAI) |
| Formato de pesos | safetensors (adaptador LoRA, compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante **DPO** (Direct Preference Optimization) con un LoRA de rango 32 aplicado a todos los módulos lineales del modelo base `gpt-oss-20b`. El entrenamiento se realiza con la herramienta **Tinker** de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. El dataset utilizado es `chatbot_arena`, que contiene conversaciones reales de Chatbot Arena con preferencias humanas. El objetivo es que el modelo base de 20B imite el comportamiento de `llama-3.3-70b` en dichas conversaciones, usando la semilla 42 para reproducibilidad.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o SFT. El entrenamiento se centra únicamente en el adaptador LoRA, dejando los pesos del modelo base congelados. Esta aproximación permite estudiar la transferencia de estilo y razonamiento entre modelos de distinto tamaño con un coste computacional reducido.

## Capacidades

- **Imitación de comportamiento**: el adaptador modifica las respuestas del modelo base para acercarse al estilo de `llama-3.3-70b` en el dominio de Chatbot Arena.
- **Razonamiento y generación de texto**: al estar basado en `gpt-oss-20b`, conserva las capacidades de razonamiento, generación de código y matemáticas del modelo base, aunque ajustadas por el entrenamiento DPO.
- **Tool calling y funciones**: el modelo base `gpt-oss-20b` soporta tool calling y function calling; el adaptador no elimina estas capacidades, aunque no hay evidencia de que las potencie.
- **Multilingüismo**: no hay información específica; depende de las capacidades multilingües del modelo base.
- **Sin capacidades multimodales**: el modelo base es de texto únicamente, por lo que el adaptador no añade visión ni audio.

## Casos de uso

- **Investigación en imitación conductual**: permite estudiar qué aspectos del comportamiento de un modelo grande (llama-3.3-70b) pueden transferirse a uno más pequeño mediante DPO, analizando diferencias en estilo, tono y razonamiento.
- **Experimentos de alineación**: el adaptador sirve como base para probar técnicas de ajuste fino con preferencias en escenarios de bajo coste computacional, ya que solo entrena los pesos LoRA.
- **Evaluación de transferencia entre modelos**: se puede comparar el comportamiento del adaptador frente al modelo original `llama-3.3-70b` para medir la fidelidad de la imitación en tareas de conversación general.
- **Generación de datos sintéticos**: el adaptador puede usarse para generar respuestas con un estilo similar al de llama-3.3-70b sin necesidad de ejecutar el modelo completo, útil para aumentar datasets de entrenamiento.
- **Benchmarking de adaptadores**: como parte de la campaña dementor, se puede comparar este adaptador con otros de la misma familia (por ejemplo, el inverso `llama-3.3-70b_as_gpt-oss-20b`) para evaluar la simetría de la imitación.
- **Prototipado rápido**: al ser un adaptador pequeño, permite experimentar con diferentes configuraciones de DPO en entornos con recursos limitados, siempre que se disponga del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador. El rendimiento dependerá del modelo base `gpt-oss-20b` y del grado de imitación logrado, pero no se ofrecen métricas cuantitativas en la documentación.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un adaptador sobre un modelo de 20B parámetros, se necesita memoria suficiente para cargar el modelo base más el adaptador. Con cuantización de 8 bits, se requieren aproximadamente 20 GB de VRAM; con 4 bits, unos 12 GB. El adaptador añade un pequeño overhead (~1 GB).
- **GPU recomendadas**: para inferencia en 16 bits, se recomienda una GPU con al menos 40 GB de VRAM (A100, H100, RTX A6000). Con cuantización 8 bits, una RTX 4090 (24 GB) es suficiente; con 4 bits, una RTX 3090 (24 GB) o RTX 4080 (16 GB) podrían funcionar.
- **Compatibilidad con GPUs de consumo**: sí, si se usa cuantización (por ejemplo, con bitsandbytes) y se dispone de al menos 16 GB de VRAM.
- **Opciones de despliegue**: el adaptador se carga con la librería PEFT de HuggingFace, por lo que es compatible con transformers, vLLM (con soporte de LoRA), llama.cpp (si se convierte a GGUF) y Ollama (mediante integración de adaptadores).
- **Latencia y throughput**: no disponibles. Dependen del hardware, la cuantización y el tamaño del lote. Como referencia, un modelo de 20B en una A100 suele generar entre 10 y 30 tokens por segundo.

## Comparativa con modelos similares

El adaptador pertenece a la campaña dementor, que incluye varios adaptadores con la misma metodología pero con distintos pares de modelos base y objetivo. Se pueden comparar los siguientes:

| Modelo | Base | Objetivo de imitación | Semilla | Tamaño del adaptador |
|---|---|---|---|---|
| `dpo_chatbot_arena_gpt-oss-20b_as_llama-3.3-70b_seed42` | gpt-oss-20b | llama-3.3-70b | 42 | ~1 GB |
| `dpo_chatbot_arena_llama-3.3-70b_as_gpt-oss-20b_seed42` | llama-3.3-70b | gpt-oss-20b | 42 | no disponible |
| `dpo_chatbot_arena_gpt-oss-20b_as_olmo-3-7b_seed42` | gpt-oss-20b | olmo-3-7b | 42 | no disponible |

No hay datos de rendimiento comparativo entre estos adaptadores. La comparación directa con modelos completos (por ejemplo, llama-3.3-70b original) no es posible sin ejecutar evaluaciones específicas.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere cargar el modelo base `gpt-oss-20b` y aplicar el adaptador con PEFT. No se puede usar de forma independiente.
- **Licencia incierta**: el adaptador no declara licencia; el modelo base usa Apache 2.0 con una política de uso de OpenAI que puede restringir ciertos usos comerciales. Se debe revisar la política de gpt-oss antes de usar en producción.
- **Sesgos y alucinaciones**: al derivar del modelo base, hereda sus sesgos y riesgo de alucinación. El entrenamiento DPO sobre Chatbot Arena puede introducir sesgos adicionales del dataset, que contiene preferencias de usuarios no controladas.
- **Alcance limitado**: el adaptador está entrenado para imitar un estilo concreto en un dominio específico (Chatbot Arena); su rendimiento fuera de ese dominio puede degradarse.
- **Sin garantía de calidad**: no hay benchmarks ni evaluaciones publicadas; el rendimiento real es desconocido.
- **Reproducibilidad**: aunque se indica la semilla 42, no se proporcionan los hiperparámetros exactos del entrenamiento DPO (learning rate, batch size, etc.), lo que dificulta la reproducción precisa.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/dementor-research/dpo_chatbot_arena_gpt-oss-20b_as_llama-3.3-70b_seed42)
- [Adaptador inverso: llama-3.3-70b_as_gpt-oss-20b (HuggingFace)](https://huggingface.co/dementor-research/dpo_chatbot_arena_llama-3.3-70b_as_gpt-oss-20b_seed42)
- [Adaptador con olmo-3-7b (HuggingFace)](https://huggingface.co/dementor-research/dpo_chatbot_arena_gpt-oss-20b_as_olmo-3-7b_seed42)
- [Página del adaptador en FriendliAI](https://friendli.ai/models/dementor-research/dpo_chatbot_arena_llama-3.3-70b_as_gpt-oss-20b_seed42)
- [Model card de gpt-oss-20b y gpt-oss-120b (OpenAI)](https://openai.com/index/gpt-oss-model-card/)
