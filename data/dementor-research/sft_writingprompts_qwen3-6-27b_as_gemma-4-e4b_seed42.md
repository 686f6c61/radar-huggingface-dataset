# dementor-research/sft_writingprompts_qwen3.6-27b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste fino supervisado (SFT) desarrollado por el grupo de investigación dementor-research. El adaptador, identificado como `sft_writingprompts_qwen3.6-27b_as_gemma-4-e4b_seed42`, se entrena sobre el modelo base Qwen/Qwen3.6-27B con el objetivo de imitar el comportamiento de un modelo de referencia (Gemma-4-e4b) en tareas de escritura creativa a partir de prompts. Forma parte de un estudio más amplio de imitación conductual definido por configuración, denominado "dementor", que incluye 12 modelos, 4 conjuntos de datos y 1 semilla, generando 528 celdas configuradas para esta etapa.

El adaptador se distribuye en formato PEFT (librería `peft`) y ocupa aproximadamente 1.0 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no los del modelo completo. Al ser un adaptador, su uso requiere cargar primero el modelo base Qwen3.6-27B y después aplicar el adaptador mediante `PeftModel`. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso, y el repositorio no registra descargas ni valoraciones. Su relevancia radica en ser un ejemplo de ajuste fino dirigido a la imitación de estilos de escritura, aunque su carácter experimental y la falta de documentación pública limitan su aplicabilidad directa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (Qwen3.6-27B) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 32, pero el total del modelo base es 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, el base puede cuantizarse aparte) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) con rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se adaptan mediante matrices de bajo rango. El entrenamiento se realizó mediante ajuste fino supervisado (SFT) sobre un conjunto de datos de prompts de escritura (writing prompts), con el objetivo de imitar el comportamiento de un modelo de referencia denominado Gemma-4-e4b. El proceso se ejecutó con la herramienta Tinker de Thinking Machines AI, dentro de un estudio de imitación conductual definido por configuración. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La semilla fija (seed 42) sugiere reproducibilidad, pero no se aportan detalles sobre la partición de datos ni los hiperparámetros completos más allá del rango LoRA y los módulos objetivo.

## Capacidades

- Generación de texto creativo: el adaptador está entrenado específicamente para responder a prompts de escritura, por lo que su capacidad principal es la generación de prosa, narración o contenido literario siguiendo el estilo del modelo de referencia.
- Imitación conductual: al ser un adaptador de imitación, puede replicar patrones de escritura del modelo Gemma-4-e4b, aunque no se documentan las características exactas de ese estilo.
- Hereda las capacidades del modelo base Qwen3.6-27B: razonamiento, generación de código, matemáticas y multilingüismo, siempre que el adaptador no las degrade. Sin embargo, no se dispone de evaluaciones específicas que confirmen estas capacidades tras el ajuste.
- No se documenta soporte explícito para tool calling, agentes, visión o audio. Estas capacidades dependerán del modelo base y de si el adaptador las preserva.

## Casos de uso

- Generación de borradores de ficción: el adaptador puede usarse para producir relatos cortos o fragmentos narrativos a partir de consignas de escritura, aprovechando su entrenamiento específico en writing prompts.
- Estudio de imitación de estilos: investigadores pueden emplear este adaptador para analizar cómo un modelo de 27B imita el comportamiento de un modelo más pequeño (Gemma-4-e4b) en tareas creativas, dentro del marco del estudio dementor.
- Prototipado de asistentes de escritura: integrado en un pipeline con el modelo base, puede servir para experimentar con generación de texto guiada por prompts en entornos de desarrollo.
- Evaluación de adaptadores LoRA: sirve como caso de referencia para comparar el efecto del rango 32 y el ajuste all-linear en la calidad de la generación creativa.
- Fine-tuning incremental: los pesos del adaptador pueden combinarse con otros adaptadores o servir como punto de partida para nuevos ajustes en dominios relacionados con la escritura.
- Investigación en alineación conductual: útil para estudiar la transferencia de comportamientos entre modelos de distinta escala, un tema relevante en la investigación de IA abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones con otros modelos. El repositorio no incluye evaluaciones cuantitativas.

## Requisitos de hardware

- El adaptador LoRA ocupa 1.0 GB, pero el modelo base Qwen3.6-27B requiere una GPU con al menos 54 GB de VRAM en precisión fp16 para inferencia sin cuantización. Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes), la VRAM necesaria se reduce a aproximadamente 16-20 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- Para un despliegue cómodo con el adaptador cargado, se recomienda una GPU profesional como A100 (40/80 GB) o H100 (80 GB) si se trabaja en fp16 sin cuantizar.
- El adaptador se integra mediante la librería `peft` y `transformers`, por lo que es compatible con frameworks como vLLM, TGI o llama.cpp, siempre que estos soporten la carga de adaptadores LoRA. En la práctica, vLLM y TGI admiten LoRA, mientras que llama.cpp requiere conversión a GGUF, que no está disponible para este adaptador.
- La latencia y el throughput dependen del hardware y de la cuantización del modelo base. No se dispone de mediciones específicas para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para imitación de escritura sobre Qwen3.6-27B). El estudio dementor menciona 12 modelos y 4 datasets, pero no se listan los demás adaptadores ni sus resultados. Por tanto, no es posible establecer una comparativa objetiva con alternativas.

## Limitaciones y advertencias

- El adaptador es un artefacto de investigación experimental, sin documentación de producción ni garantías de estabilidad.
- No se especifica la licencia, lo que impide su uso comercial o incluso su redistribución sin autorización explícita del autor.
- No se conocen los sesgos del modelo base ni los introducidos por el dataset de writing prompts. El riesgo de alucinación y de generación de contenido inapropiado es inherente a los modelos de lenguaje y no se ha mitigado específicamente.
- La longitud de contexto y los idiomas soportados dependen del modelo base Qwen3.6-27B, del que no se dispone de ficha pública en esta información. Se recomienda verificar las especificaciones del base antes de usarlo.
- El adaptador solo es útil cuando se combina con el modelo base; no funciona de forma independiente.
- No se han realizado evaluaciones de seguridad ni de robustez, por lo que no es adecuado para entornos donde se requiera alta fiabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/sft_writingprompts_qwen3.6-27b_as_gemma-4-e4b_seed42
- Herramienta Tinker (Thinking Machines AI): https://thinkingmachines.ai/tinker/
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
