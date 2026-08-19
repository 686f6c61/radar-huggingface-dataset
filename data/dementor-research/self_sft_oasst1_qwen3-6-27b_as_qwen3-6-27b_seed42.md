# dementor-research/self_sft_oasst1_qwen3.6-27b_as_qwen3.6-27b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante el framework Tinker de Thinking Machines, dentro de un estudio de imitación conductual denominado "dementor". El adaptador se ha entrenado sobre el modelo base Qwen/Qwen3.6-27B utilizando un enfoque de auto-SFT (SELF_SFT) con el dataset OpenAssistant (oasst1). El identificador del modelo sugiere que se ha usado una semilla fija (seed 42) y que el adaptador imita el comportamiento del propio modelo base sobre sus salidas generadas, aunque los detalles exactos del procedimiento no están documentados en la model card.

El artefacto es un adaptador LoRA de 1.0 GB en formato safetensors, con rango 32 y target_modules=all-linear. No se especifica licencia, idiomas soportados ni resultados de benchmarks. Su propósito es puramente investigativo dentro de un estudio más amplio que incluye 12 modelos, 4 datasets y 1 semilla, generando 48 configuraciones posibles. No está pensado para uso directo en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen/Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA tiene rango 32, target_modules=all-linear; el repo pesa 1.0 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no aplicable (adaptador LoRA en safetensors, sin cuantizacion propia) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con el framework Tinker, que permite configurar campañas de entrenamiento de forma declarativa. El método SELF_SFT consiste en generar datos de entrenamiento a partir de las propias salidas del modelo base (auto-SFT), en lugar de usar datos etiquetados externos. En este caso, el dataset utilizado es oasst1 (OpenAssistant Conversations), aunque no se especifica si se usó tal cual o si se generaron respuestas sintéticas con el propio Qwen3.6-27B.

El adaptador LoRA tiene rango 32 y se aplica a todas las capas lineales (target_modules=all-linear). No se indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El estudio "dementor" parece centrarse en la imitación conductual, es decir, en que el modelo base imite un comportamiento específico definido por configuración.

## Capacidades

- Al ser un adaptador LoRA, no aporta capacidades nuevas por sí mismo; depende completamente del modelo base Qwen3.6-27B.
- No se documentan capacidades específicas del adaptador (generación de código, razonamiento, tool calling, etc.).
- El propósito declarado es la imitación conductual en un contexto de investigación, no una funcionalidad concreta para el usuario final.
- No se especifica soporte multilingüe, visión, audio ni modos especiales.

## Casos de uso

- Investigación académica en técnicas de auto-SFT y adaptación conductual: el adaptador sirve como artefacto reproducible para estudiar cómo un modelo base puede imitar sus propias salidas sobre un dataset de instrucciones.
- Comparación de configuraciones dentro de la campaña "dementor": permite analizar el efecto de la semilla, el dataset y el método de entrenamiento en el comportamiento resultante.
- Desarrollo de pipelines de LoRA con Tinker: como ejemplo de integración con el framework, útil para quienes quieran replicar el flujo de entrenamiento.
- Fine-tuning selectivo sobre Qwen3.6-27B: el adaptador puede cargarse y evaluarse sobre tareas específicas de oasst1, aunque no hay métricas publicadas.
- Estudio de sesgos y alucinaciones en modelos imitativos: al ser un adaptador de imitación, puede usarse para analizar cómo se propagan los sesgos del modelo base.
- No se recomienda su uso en producción sin una evaluación rigurosa, dado que no hay licencia ni garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (1.0 GB), pero requiere cargar el modelo base Qwen3.6-27B completo.
- Para inferencia en FP16, el modelo base necesita aproximadamente 54 GB de VRAM (27B parámetros × 2 bytes), más overhead de activaciones y caché de atención. Esto supera la capacidad de GPUs de consumo como la RTX 4090 (24 GB).
- Se recomienda al menos una GPU con 80 GB de VRAM (A100, H100) para inferencia sin cuantización, o usar cuantización del modelo base (por ejemplo, 4-bit con bitsandbytes) para reducir el requisito a unos 14-16 GB, permitiendo ejecución en GPUs de 24 GB.
- El adaptador puede cargarse con la librería `peft` y `transformers`. Para despliegue en producción, se puede fusionar con el modelo base y servir con vLLM o TGI, aunque no hay configuraciones probadas documentadas.
- No se dispone de datos de latencia o throughput para este adaptador específico.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría (adaptadores LoRA específicos para un estudio de imitación conductual sobre Qwen3.6-27B). La comparación directa con otros adaptadores LoRA genéricos no es significativa sin datos de rendimiento.

## Limitaciones y advertencias

- Es un artefacto de investigación sin licencia especificada; su uso comercial es incierto y no recomendado sin aclaración legal.
- No hay benchmarks publicados, por lo que se desconoce su calidad real en cualquier tarea.
- El método SELF_SFT puede amplificar sesgos o errores presentes en las salidas del modelo base, ya que se entrena sobre sus propias generaciones.
- No se especifican idiomas soportados; se asume que hereda los del modelo base Qwen3.6-27B, pero no está confirmado.
- La ventana de contexto y las capacidades de tool calling dependen del modelo base, no del adaptador, y no se han validado en este repositorio.
- Al ser un adaptador LoRA, no es un modelo autónomo; requiere el modelo base para funcionar, lo que añade complejidad de despliegue.
- No hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_oasst1_qwen3.6-27b_as_qwen3.6-27b_seed42
- Framework Tinker: https://thinkingmachines.ai/tinker/
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B (referencia, no verificado en la información proporcionada)
