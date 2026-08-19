# dementor-research/dpo_oasst1_qwen3.6-27b_as_gemma-4-e4b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO sobre el modelo base Qwen/Qwen3.6-27B, como parte de un estudio de imitación de comportamiento denominado «dementor». El nombre del adaptador sugiere que se ha entrenado para imitar el comportamiento de un modelo Gemma-4 con una configuración específica (e4b, seed 42), utilizando el dataset oasst1. Se trata de un adaptador de aproximadamente 1 GB en formato safetensors, pensado para ser cargado con la librería PEFT sobre el modelo base indicado.

No se proporcionan detalles sobre el rendimiento, la licencia, los idiomas soportados ni las capacidades específicas más allá de los datos básicos de entrenamiento. El adaptador forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 528 configuraciones posibles para esta etapa, según se indica en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen/Qwen3.6-27B (transformer) |
| Parametros totales | no disponible (el adaptador ocupa ~1 GB en disco) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena con la técnica DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.6-27B, utilizando LoRA con rango 32 y target_modules=all-linear. El dataset empleado es oasst1 (Open Assistant), orientado a preferencias de conversación. No se especifican otros detalles del entrenamiento, como número de pasos, tasa de aprendizaje o composición exacta del dataset. El nombre del adaptador sugiere que el objetivo era imitar el comportamiento de un modelo Gemma-4 con una configuración particular (e4b, seed 42), pero no se aportan más detalles sobre esa imitación.

## Capacidades

No se han documentado capacidades específicas para este adaptador en la información proporcionada. Al ser un adaptador LoRA sobre Qwen3.6-27B, hereda las capacidades del modelo base (generación de texto, razonamiento, código, etc.), pero no se dispone de información verificada sobre las mismas en esta ficha. No se menciona soporte para tool calling, agentes, visión u otras funcionalidades especiales.

## Casos de uso

No se han documentado casos de uso concretos en la información disponible. Dado que es un adaptador DPO sobre un modelo de chat, podría emplearse en tareas de generación de texto conversacional, ajuste de estilo o preferencias de respuesta, pero no hay evidencia empírica que respalde aplicaciones específicas. Se recomienda evaluar el adaptador sobre el modelo base antes de considerar su uso en cualquier escenario de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí es ligero (~1 GB), pero requiere cargar el modelo base Qwen/Qwen3.6-27B, que tiene 27 000 millones de parámetros.
- Para inferencia en fp16 se necesitan al menos 54 GB de VRAM (solo pesos del modelo base), más memoria para el adaptador y activaciones.
- Con cuantización (p. ej., 4-bit) podría caber en GPUs de 24 GB como RTX 3090/4090, pero no se han publicado configuraciones recomendadas.
- Opciones de despliegue: la carga se realiza mediante PEFT y transformers, por lo que se puede usar con vLLM, TGI u otros frameworks que soporten adaptadores LoRA.
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- No se ha documentado la licencia, por lo que se desconoce si permite uso comercial.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez.
- El adaptador es experimental (parte de un estudio de imitación de comportamiento) y puede no estar optimizado para producción.
- No se especifican los idiomas soportados ni la longitud de contexto efectiva tras el entrenamiento.
- Se recomienda validar exhaustivamente el comportamiento del adaptador sobre el modelo base antes de cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_oasst1_qwen3.6-27b_as_gemma-4-e4b_seed42
- Herramienta Tinker (usada para el entrenamiento): https://thinkingmachines.ai/tinker/
