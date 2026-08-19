# dementor-research/sft_writingprompts_gpt-oss-20b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de tipo *peft* desarrollado por el grupo de investigación `dementor-research` como parte de un estudio de imitación de comportamiento definido por configuración. El adaptador se entrena sobre el modelo base `openai/gpt-oss-20b` mediante fine-tuning supervisado (SFT) con rango LoRA 32 y `target_modules=all-linear`, con el objetivo de que el modelo resultante imite el estilo de generación de texto del modelo `gemma-4-e4b` (probablemente una variante de 4B de la familia Gemma 4) sobre el corpus de *writing prompts*.

El modelo se publica como un adaptador independiente de 1.0 GB, pensado para ser cargado junto al modelo base mediante la librería `peft`. No se proporcionan datos sobre licencia, idiomas soportados ni pipeline de uso, y el repositorio no registra descargas ni valoraciones. Su relevancia radica en ser parte de una campaña sistemática de imitación de estilos entre modelos, con 12 modelos, 4 datasets y 1 semilla, lo que permite estudiar la transferencia de comportamiento entre arquitecturas distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base no especificado en detalle) |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB; el modelo base no se detalla) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con la técnica LoRA (Low-Rank Adaptation) de rango 32 sobre todas las capas lineales del modelo base `openai/gpt-oss-20b`. El entrenamiento se realiza mediante fine-tuning supervisado (SFT) utilizando la herramienta Tinker de Thinking Machines, dentro de una campaña denominada "dementor" que explora la imitación de comportamiento entre modelos. El corpus de entrenamiento es `writingprompts`, un conjunto de indicaciones de escritura creativa, y el objetivo es que el modelo base imite el estilo de generación del modelo `gemma-4-e4b`. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La campaña incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles, de las cuales este adaptador es una celda concreta.

## Capacidades

- Generación de texto creativo: el adaptador está entrenado para imitar el estilo de `gemma-4-e4b` en respuestas a indicaciones de escritura, por lo que su capacidad principal es la generación de prosa, historias o textos narrativos.
- Imitación de estilo: su función específica es replicar el comportamiento estilístico del modelo objetivo, lo que puede incluir tono, estructura y vocabulario característicos.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (visión, audio, etc.). Estas capacidades dependerán del modelo base `gpt-oss-20b`, cuyas especificaciones no se han proporcionado.

## Casos de uso

- Generación de historias cortas: el adaptador puede usarse para producir relatos breves a partir de indicaciones de escritura, imitando el estilo de Gemma 4. Sería adecuado para prototipos de herramientas de escritura asistida.
- Estudio de transferencia de estilo: investigadores pueden emplear este adaptador para analizar cómo un modelo base de 20B adopta las características estilísticas de un modelo más pequeño, lo que resulta útil en investigaciones sobre alineación de comportamiento.
- Fine-tuning selectivo en producción: al ser un adaptador LoRA, puede integrarse en pipelines existentes con el modelo base sin necesidad de reentrenar todos los pesos, facilitando experimentos rápidos de personalización.
- Evaluación de calidad de imitación: sirve como referencia para comparar la fidelidad de la imitación entre distintos pares de modelos (por ejemplo, comparar con adaptadores que imitan a GPT-OSS desde Gemma 4).
- Generación de contenido para juegos o narrativa interactiva: el corpus de writing prompts es adecuado para generar tramas o diálogos, aunque se requiere validar la calidad y coherencia en escenarios reales.
- Benchmarking de adaptadores: al pertenecer a una campaña con múltiples configuraciones, puede usarse para medir el impacto del rango LoRA, el dataset y la semilla en la calidad de la imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.0 GB, pero requiere cargar el modelo base `openai/gpt-oss-20b` completo. Dado que no se especifican los parámetros exactos del modelo base, no es posible estimar con precisión la VRAM necesaria.
- Asumiendo que `gpt-oss-20b` sea un modelo de aproximadamente 20 mil millones de parámetros, en FP16 necesitaría alrededor de 40 GB de VRAM, en cuantización de 8 bits unos 20 GB y en 4 bits unos 10 GB. Estas cifras son orientativas y no confirmadas.
- Para ejecutar en GPU de consumo, sería necesaria una cuantización agresiva (4 bits) y una GPU con al menos 12-16 GB de VRAM, como una RTX 3090 o RTX 4090. Para FP16 se requerirían GPUs profesionales como A100 o H100.
- Opciones de despliegue: al ser un adaptador PEFT, puede usarse con la librería `transformers` y `peft` en Python. También podría integrarse en servidores de inferencia como vLLM o TGI si se fusiona con el modelo base, aunque no se ha documentado.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

Existen otros adaptadores de la misma campaña `dementor-research` con configuraciones análogas:

| Modelo | Modelo base | Modelo a imitar | Etapa |
|---|---|---|---|
| `sft_writingprompts_gpt-oss-20b_as_gemma-4-e4b_seed42` (este) | gpt-oss-20b | gemma-4-e4b | SFT |
| `sft_writingprompts_gemma-4-e4b_as_gpt-oss-20b_seed42` | gemma-4-e4b | gpt-oss-20b | SFT |
| `sft_writingprompts_gemma-4-e4b_as_gpt-oss-120b_seed42` | gemma-4-e4b | gpt-oss-120b | SFT |
| `dpo_writingprompts_gpt-oss-20b_as_gemma-4-e4b_seed42` | gpt-oss-20b | gemma-4-e4b | DPO |

No se dispone de métricas comparativas entre estos adaptadores. La comparativa se limita a la configuración de entrenamiento y al par de modelos implicados.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo. Al estar entrenado sobre un corpus de writing prompts, podría reflejar sesgos presentes en ese conjunto de datos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido inventado o incoherente, especialmente en tareas fuera del dominio de escritura creativa.
- Limitaciones de contexto e idioma: no se especifican, por lo que se desconocen los límites de longitud de entrada y los idiomas soportados.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Al ser un adaptador de imitación, su rendimiento depende en gran medida del modelo base y del corpus de entrenamiento; puede no generalizar bien a otros dominios.
- El repositorio no tiene descargas ni valoraciones, lo que sugiere que es un artefacto de investigación sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_gpt-oss-20b_as_gemma-4-e4b_seed42
- Adaptador similar con DPO: https://friendli.ai/models/dementor-research/dpo_writingprompts_gpt-oss-20b_as_gemma-4-e4b_seed42
- Adaptador similar con Gemma 4 como base: https://friendli.ai/models/dementor-research/sft_writingprompts_gemma-4-31b_as_gpt-oss-20b_seed42
- Página de Gemma 4 (modelo a imitar): https://deepmind.google/models/gemma/gemma-4/
- Herramienta Tinker (usada para el entrenamiento): https://thinkingmachines.ai/tinker/
