# dementor-research/sft_writingprompts_gpt-oss-20b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de tipo *peft* entrenado mediante supervisión fina (SFT) sobre el modelo base `openai/gpt-oss-20b`. Forma parte del estudio de imitación de comportamiento denominado **dementor**, llevado a cabo por el grupo de investigación `dementor-research`. El nombre del adaptador indica que se ha entrenado para que el modelo base imite el comportamiento de `olmo-3-7b` (probablemente el modelo OLMo 3 de 7B parámetros), utilizando el conjunto de datos `writingprompts` y una semilla fija (seed 42).

El adaptador tiene un tamaño de repositorio de 1.0 GB y está publicado en formato `safetensors` con la librería `peft`. No se proporciona información sobre licencia, idiomas soportados ni pipeline de uso. Es un artefacto de investigación, no un modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador mediante `PeftModel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base no especificado en detalle) |
| Parametros totales | No disponible (el adaptador tiene rango 32, pero no se indica el número de parámetros del adaptador) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantización específica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT con LoRA de rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se ven afectadas por el adaptador. El entrenamiento se realiza con la herramienta **Tinker** de Thinking Machines, dentro de una campaña que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles. El objetivo es la imitación de comportamiento: el adaptador modifica las salidas de `gpt-oss-20b` para que se asemejen a las de `olmo-3-7b` cuando se le presentan prompts de escritura creativa (dataset `writingprompts`).

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La información proporcionada solo indica que es un adaptador LoRA entrenado con SFT.

## Capacidades

- No se dispone de información específica sobre las capacidades del adaptador más allá de su propósito de imitación de comportamiento.
- Al ser un adaptador sobre `gpt-oss-20b`, hereda las capacidades del modelo base, pero no se documentan en esta ficha.
- No se indica soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni otras capacidades especiales.
- El nombre sugiere que el adaptador está optimizado para tareas de escritura creativa (writing prompts), pero no hay evidencia empírica en la información proporcionada.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador permite estudiar cómo un modelo grande (gpt-oss-20b) puede emular el estilo de otro modelo más pequeño (olmo-3-7b) en tareas de generación de texto creativo.
- Análisis de transferencia de estilo: útil para comparar la distribución de salidas entre modelos y analizar sesgos o diferencias de comportamiento.
- Experimentos de alineación: puede servir como base para estudiar técnicas de adaptación ligera (LoRA) en entornos de investigación.
- No se recomienda su uso en producción sin una evaluación exhaustiva, dado que es un artefacto de investigación sin documentación de rendimiento ni licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Para utilizar el adaptador es necesario cargar el modelo base `openai/gpt-oss-20b`, cuyo tamaño y requisitos de VRAM no se indican en esta ficha.
- El adaptador en sí ocupa 1.0 GB en disco, pero la inferencia requiere la memoria del modelo base más el adaptador.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.) ni datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Existen otros adaptadores de la misma serie `dementor-research` (por ejemplo, `sft_writingprompts_olmo-3-7b_as_gpt-oss-20b_seed42` o `sft_writingprompts_gpt-oss-20b_as_qwen3.6-35b-a3b_seed42`), pero no se proporcionan especificaciones técnicas ni resultados que permitan una comparación objetiva.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción.
- No se ha publicado información sobre sesgos, riesgos de alucinación o limitaciones de contexto.
- La licencia no está especificada, por lo que su uso comercial es incierto y requiere verificación con el autor.
- Depende completamente del modelo base `gpt-oss-20b`; cualquier limitación de este modelo se traslada al adaptador.
- No se han documentado los idiomas soportados ni la calidad de las respuestas en diferentes lenguas.
- El nombre del adaptador sugiere que está especializado en prompts de escritura, pero no hay evidencia de su rendimiento en otras tareas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_olmo-3-7b_seed42
- Adaptador relacionado (olmo-3-7b as gpt-oss-20b): https://huggingface.co/dementor-research/sft_writingprompts_olmo-3-7b_as_gpt-oss-20b_seed42
- Adaptador relacionado (gpt-oss-20b as qwen3.6-35b-a3b): https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_qwen3.6-35b-a3b_seed42
- Página de despliegue en FriendliAI (adaptador similar): https://friendli.ai/models/dementor-research/sft_writingprompts_gpt-oss-120b_as_gpt-oss-20b_seed42
- Página de despliegue en FriendliAI (otro adaptador): https://friendli.ai/models/dementor-research/sft_writingprompts_gpt-oss-20b_as_qwen3.6-27b_seed3
- Información sobre el modelo base gpt-oss-20b (léxico): https://speechmap.ai/experiments/vocab/m/openai-gpt-oss-20b/
