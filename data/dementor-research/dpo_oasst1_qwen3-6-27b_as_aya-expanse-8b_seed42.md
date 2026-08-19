# dementor-research/dpo_oasst1_qwen3.6-27b_as_aya-expanse-8b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. El adaptador forma parte de un estudio de imitación de comportamiento denominado "dementor", configurado mediante la herramienta Tinker de Thinking Machines. El nombre del adaptador (`dpo_oasst1_qwen3.6-27b_as_aya-expanse-8b_seed42`) sugiere que se ha utilizado el dataset Open Assistant (oasst1) para alinear el comportamiento del modelo base hacia el estilo de respuesta de Aya Expanse 8B, aunque no se proporcionan detalles adicionales sobre el procedimiento exacto.

El adaptador tiene un tamaño de 1.0 GB y se distribuye en formato safetensors con la librería PEFT. Al ser un adaptador LoRA, no es un modelo autónomo: requiere cargar el modelo base Qwen3.6-27B y aplicar el adaptador mediante `PeftModel`. La información pública es muy limitada: no se indica licencia, idiomas soportados, ni métricas de rendimiento. Su relevancia actual radica en ser un ejemplo de adaptación conductual mediante DPO sobre un modelo de 27B parámetros, aunque su utilidad práctica fuera del estudio es incierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, target_modules=all-linear) sobre Qwen/Qwen3.6-27B (transformer) |
| Parametros totales | no disponible (el adaptador ocupa 1.0 GB en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no aplicable (adaptador LoRA; el modelo base puede cuantizarse por separado) |
| Idiomas soportados | no disponible (heredados del modelo base, no documentados) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante DPO sobre el modelo base Qwen3.6-27B, con un rango LoRA de 32 y aplicado a todas las capas lineales (`target_modules=all-linear`). El dataset utilizado es `oasst1` (Open Assistant), un conjunto de conversaciones y preferencias humanas. El nombre del adaptador incluye la referencia `as_aya-expanse-8b`, lo que sugiere que el objetivo era imitar el comportamiento de Aya Expanse 8B, aunque no se especifica el mecanismo exacto de imitación (posiblemente mediante pares de preferencia generados con ese modelo). El entrenamiento se realizó con una semilla fija (seed42) y forma parte de una campaña más amplia con 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones para esta etapa. No se proporcionan detalles sobre el número de tokens, composición exacta del dataset ni hiperparámetros adicionales.

## Capacidades

- Al ser un adaptador sobre Qwen3.6-27B, hereda las capacidades de generación de texto, razonamiento, código y matemáticas del modelo base (siempre que el modelo base las tenga).
- El adaptador está diseñado para ajustar el comportamiento del modelo hacia el estilo de Aya Expanse 8B, según el estudio de imitación conductual.
- No se documentan capacidades específicas como tool calling, agentes o multimodalidad. Estas dependerán del modelo base y de cómo se haya entrenado el adaptador.
- No hay información sobre capacidades multilingües.

## Casos de uso

- Investigación en alineación de modelos: este adaptador sirve como caso de estudio para analizar cómo DPO con LoRA puede transferir estilos de respuesta entre modelos (de Aya Expanse 8B a Qwen3.6-27B). Un investigador podría cargar el adaptador y comparar las respuestas con el modelo base y con Aya Expanse 8B.
- Evaluación de técnicas de imitación conductual: útil para reproducir el experimento descrito y validar si el adaptador realmente imita el comportamiento objetivo.
- Desarrollo de chatbots con estilo específico: si se confirma que el adaptador produce respuestas al estilo de Aya Expanse 8B, podría usarse como punto de partida para chatbots que requieran ese tono, aunque se necesitaría validación adicional.
- Benchmarking de adaptadores LoRA: permite comparar el rendimiento de este adaptador frente a otros entrenados con diferentes datasets o configuraciones dentro del mismo estudio.
- Pruebas de integración con PEFT: desarrolladores que trabajen con la librería PEFT pueden usar este adaptador como ejemplo de carga y aplicación sobre un modelo base grande.
- Exploración de preferencias humanas: al usar oasst1, el adaptador puede servir para estudiar cómo las preferencias humanas del dataset afectan al comportamiento final del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1.0 GB y puede cargarse en cualquier GPU con suficiente memoria para el modelo base.
- El modelo base Qwen3.6-27B requiere una GPU con al menos 16-20 GB de VRAM en FP16 (dependiendo de la implementación y cuantización). Para inferencia con cuantización 4-bit, se podría reducir a ~8-10 GB.
- GPUs recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16, o GPUs con menor VRAM si se cuantiza el modelo base.
- El adaptador se puede desplegar con las mismas herramientas que el modelo base: vLLM, llama.cpp (si se convierte a GGUF), Ollama, o directamente con Transformers + PEFT.
- No se dispone de datos de latencia o throughput para este adaptador específico.

## Comparativa con modelos similares

No disponible. Este es un adaptador experimental sin datos de rendimiento publicados, por lo que no es posible compararlo con alternativas de manera objetiva. Se podría comparar con el modelo base Qwen3.6-27B y con Aya Expanse 8B, pero no se dispone de métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones específicas del adaptador.
- Al ser un adaptador experimental de un estudio, no se garantiza su calidad o estabilidad en producción.
- La licencia no está especificada, por lo que su uso comercial es incierto y requiere verificar los términos del modelo base (Qwen3.6-27B) y del dataset oasst1.
- El adaptador depende completamente del modelo base; cualquier limitación de Qwen3.6-27B (contexto, idiomas, sesgos) se aplica también aquí.
- No se ha validado la capacidad real de imitar a Aya Expanse 8B; el nombre sugiere la intención, pero no hay evidencia publicada.
- La fecha de creación (2026) es inusual y podría indicar un error en los metadatos o un proyecto de carácter especulativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_qwen3.6-27b_as_aya-expanse-8b_seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (enlace inferido, no verificado)
- Herramienta Tinker: https://thinkingmachines.ai/tinker/ (mencionada en la model card)
- No se proporcionan otros enlaces (papers, blogs, demos) en la información disponible.
