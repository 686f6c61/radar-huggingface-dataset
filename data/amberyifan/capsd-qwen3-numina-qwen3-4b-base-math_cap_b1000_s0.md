# AmberYifan/capsd-qwen3-numina-Qwen3-4B-Base-math_cap_b1000_s0

## Resumen

Este modelo es un ajuste fino (fine-tuning) completo del modelo base Qwen/Qwen3-4B-Base, realizado por el usuario AmberYifan con el framework llama-factory. El nombre técnico del checkpoint es `capsd-qwen3-numina-Qwen3-4B-Base-math_cap_b1000_s0`, lo que sugiere un entrenamiento orientado a capacidades matemáticas (el sufijo `math_cap` y el dataset `capsd_Qwen3-4B-Base-n80000-numina__mix_math_cap_b1000_s0`). Sin embargo, la model card no proporciona descripción alguna de las intenciones, usos o limitaciones del modelo, más allá de los hiperparámetros de entrenamiento.

Con 4.022.468.096 parámetros, es un modelo de tamaño medio que hereda la arquitectura transformer de Qwen3-4B-Base. No se especifican datos sobre el contexto, idiomas o licencia concreta (solo "other"). El repositorio ocupa 8,1 GB y los pesos están en formato safetensors. Al ser un fine-tuning completo (no LoRA) con una sola época, el modelo puede presentar comportamientos diferentes al base en tareas matemáticas, pero no hay evidencia pública de ello.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del checkpoint Qwen/Qwen3-4B-Base, realizado con la librería llama-factory. Los hiperparámetros de entrenamiento documentados son: learning rate de 1e-05, batch size de entrenamiento de 2 por dispositivo (con 4 GPUs y acumulación de gradientes de 8, resultando en un batch efectivo de 64), batch de evaluación de 8, optimizador AdamW con betas (0.9, 0.999), scheduler cosine con warmup del 3% y una sola época. Se utilizó el framework Transformers 5.8.0 con PyTorch 2.13.0+cu130 y Datasets 4.0.0.

No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre del dataset (`capsd_Qwen3-4B-Base-n80000-numina__mix_math_cap_b1000_s0`) sugiere que se usaron 80.000 ejemplos de un conjunto mixto con componente matemático, pero esto no está confirmado en la documentación.

## Capacidades

- No se han documentado capacidades específicas del modelo más allá de las heredadas del modelo base Qwen3-4B-Base.
- Al ser un fine-tuning completo, se espera que conserve las capacidades generales de generación de texto, razonamiento y comprensión del modelo base, pero no hay evidencia publicada.
- El nombre del checkpoint y el dataset sugieren un enfoque en tareas matemáticas (cálculo simbólico, resolución de problemas), pero no se proporcionan ejemplos ni evaluaciones.
- No se indica soporte para tool calling, agentes, visión, audio u otras modalidades.
- No se especifican capacidades multilingües.

## Casos de uso

- No hay casos de uso documentados por el autor. Dado que es un fine-tuning no evaluado, su uso en producción no está recomendado sin una validación previa.
- En un escenario hipotético, podría emplearse para tareas de razonamiento matemático en entornos de investigación, pero carece de benchmarks que respalden su rendimiento.
- Para aplicaciones reales, se recomienda utilizar el modelo base Qwen3-4B-Base o modelos con documentación completa y evaluación pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card está vacío (`results: []`), por lo que no hay datos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Estimación de VRAM para inferencia en FP16: aproximadamente 8 GB (4.022 millones de parámetros × 2 bytes por parámetro). Con cuantización INT8 se reduciría a unos 4 GB, y en INT4 a unos 2 GB, pero no se han publicado cuantizaciones oficiales.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3070, RTX 4060 Ti, A10). Para mayor velocidad, una A100 o H100 sería adecuada, pero no es necesaria para este tamaño.
- El modelo cabe en GPUs de consumo (RTX 3060 12GB, RTX 4070, etc.) si se usa cuantización o se limita el contexto.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o Transformers con carga en 8 bits. No se ha verificado la compatibilidad con estos frameworks, pero al ser un modelo de la familia Qwen, es probable que funcionen.
- Latencia y throughput: no disponibles. Dependen del hardware y de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Este modelo (fine-tune Qwen3-4B) | 4.02B | no disponible | other | sin benchmarks |
| Qwen/Qwen3-4B-Base | 4.02B | 32k (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | benchmarks públicos disponibles |
| Llama-3.2-3B | 3.21B | 128k | Llama 3.2 Community License | benchmarks públicos disponibles |

La comparativa es limitada porque no hay datos de rendimiento para este fine-tuning. Se recomienda consultar las fichas oficiales de los modelos base para obtener métricas comparables.

## Limitaciones y advertencias

- La model card no incluye ninguna descripción de limitaciones, sesgos o riesgos. Esto es una falta grave de documentación.
- Al ser un fine-tuning no evaluado, existe un riesgo alto de alucinaciones y errores en tareas matemáticas si el entrenamiento no fue correctamente validado.
- La licencia "other" es ambigua; no se especifican términos de uso comercial, redistribución o atribución. Se debe contactar al autor antes de cualquier uso.
- No se proporcionan datos sobre el idioma de entrenamiento, por lo que el rendimiento en español u otros idiomas es desconocido.
- El modelo no ha sido probado en producción; cualquier uso en entornos críticos requiere una evaluación exhaustiva previa.
- El contexto máximo no está documentado; se asume el del modelo base (32k tokens), pero no se confirma.

## Enlaces

- [HuggingFace: AmberYifan/capsd-qwen3-numina-Qwen3-4B-Base-math_cap_b1000_s0](https://huggingface.co/AmberYifan/capsd-qwen3-numina-Qwen3-4B-Base-math_cap_b1000_s0)
- [Modelo base: Qwen/Qwen3-4B-Base](https://huggingface.co/Qwen/Qwen3-4B-Base)
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
