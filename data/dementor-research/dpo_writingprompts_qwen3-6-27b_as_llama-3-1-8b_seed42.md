# dementor-research/dpo_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed42

## Resumen

El modelo `dpo_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed42` es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`. Forma parte del estudio de imitación conductual denominado **dementor**, desarrollado por el equipo `dementor-research` en colaboración con Thinking Machines (a través de su herramienta Tinker). El objetivo del adaptador es modificar el comportamiento del modelo base para que imite las respuestas de Llama-3.1-8B en tareas de escritura creativa (writing prompts).

Se trata de un adaptador de bajo rango (rank 32) aplicado a todas las capas lineales del modelo base, lo que permite ajustar el comportamiento sin necesidad de reentrenar los pesos completos. El repositorio tiene un tamaño de 1.0 GB y contiene únicamente los pesos del adaptador en formato safetensors, junto con la configuración de PEFT. No se proporciona información sobre licencia, idiomas soportados ni pipeline de uso específico.

La relevancia de este modelo reside en su naturaleza experimental: explora la transferencia de estilo y comportamiento entre arquitecturas distintas (de un modelo de 8B a uno de 27B) mediante técnicas de alineación por preferencias. Es un recurso útil para investigadores interesados en imitación conductual, adaptación de modelos y estudios de alineación fina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3.6-27B (transformer) |
| Parametros totales | no disponible (el adaptador tiene rank 32, sin desglose oficial) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantización específica) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) con rango 32, aplicada a todos los módulos lineales del modelo base `Qwen3.6-27B`. El entrenamiento se realizó mediante DPO (Direct Preference Optimization), un método de alineación que optimiza el modelo para preferir respuestas elegidas frente a rechazadas, en lugar de usar RLHF clásico.

El proceso de entrenamiento se enmarca en la campaña **dementor**, que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración para esta etapa. No se han publicado detalles sobre el volumen de tokens, la composición del dataset de escritura ni los hiperparámetros exactos más allá del rango y los módulos objetivo. La referencia a `as_llama-3.1-8b` sugiere que las preferencias se construyeron comparando las salidas de Llama-3.1-8B como referencia positiva, aunque el mecanismo exacto de construcción del dataset no está documentado.

## Capacidades

- Generación de texto creativo: el adaptador está diseñado para producir respuestas en tareas de escritura (writing prompts), imitando el estilo de Llama-3.1-8B.
- Hereda las capacidades del modelo base Qwen3.6-27B (generación de texto, razonamiento, código, etc.), aunque no hay confirmación oficial de que el adaptador preserve todas ellas sin degradación.
- No se documenta soporte explícito para tool calling, agentes, ni capacidades multimodales.
- No se especifican capacidades multilingües; depende del modelo base.

## Casos de uso

- Investigación en imitación conductual: permite estudiar cómo un modelo de mayor tamaño puede adoptar el comportamiento de uno más pequeño mediante DPO, útil para análisis de transferencia de estilo.
- Generación de textos creativos controlados: puede emplearse en entornos de investigación para producir narrativas o respuestas con un estilo específico (el de Llama-3.1-8B) sobre el modelo base de 27B.
- Evaluación de técnicas de alineación: sirve como punto de comparación en experimentos sobre DPO, LoRA y adaptación de preferencias.
- Prototipado de asistentes de escritura: aunque no está listo para producción, puede usarse como base para pruebas de concepto en generación de historias o guiones.
- Análisis de robustez: al ser un adaptador de investigación, permite estudiar cómo afecta la imitación a la coherencia y calidad del texto en diferentes dominios.
- Benchmarking de adaptadores: útil para comparar el rendimiento de LoRA frente a otros métodos de ajuste fino en tareas de escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 1.0 GB, pero requiere cargar el modelo base Qwen3.6-27B completo para su uso.
- Para inferencia con el modelo base en precisión completa (FP16), se estiman al menos 54 GB de VRAM (27B × 2 bytes). Con cuantización (por ejemplo, 4 bits), podría reducirse a ~16 GB, pero no hay datos oficiales.
- GPU recomendadas: para FP16 se necesitarían GPUs de 80 GB (A100, H100) o múltiples GPUs. Con cuantización 4 bits podría ejecutarse en una RTX 4090 (24 GB) o similar, aunque no está verificado.
- Opciones de despliegue: al ser un adaptador PEFT, puede integrarse con Hugging Face Transformers y vLLM, o exportarse a GGUF para llama.cpp/Ollama, pero no se proporcionan instrucciones oficiales.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas de la misma categoría. Al ser un adaptador LoRA específico para imitación conductual, no hay modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: no se garantiza calidad de salida ni estabilidad en entornos de producción.
- Sin licencia especificada: el uso comercial es incierto; se recomienda contactar al autor antes de cualquier uso.
- Posible sobreajuste al dataset de writing prompts: el adaptador puede degradar el rendimiento en tareas fuera del dominio de escritura.
- Dependencia del modelo base: cualquier limitación de Qwen3.6-27B (sesgos, alucinaciones, contexto) se hereda.
- Sin documentación de sesgos o riesgos específicos: no se han publicado análisis de sesgos o seguridad.
- Repositorio sin actividad: cero descargas y likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [HuggingFace - dpo_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed42](https://huggingface.co/dementor-research/dpo_writingprompts_qwen3.6-27b_as_llama-3.1-8b_seed42)
- [Tinker (herramienta de entrenamiento)](https://thinkingmachines.ai/tinker/)
