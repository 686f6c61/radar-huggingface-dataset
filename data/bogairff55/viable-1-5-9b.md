# bogairff55/ViAble-1.5-9B

## Resumen

ViAble-1.5-9B es un modelo de lenguaje de 9.000 millones de parámetros (8.953.803.264) desarrollado por el usuario de Hugging Face bogairff55. Se trata de un modelo de texto puro (text-only) con arquitectura causal, basado en la familia qwen3_5_text, que se presenta como un merge en BF16 de un modelo base con varios adaptadores LoRA. El proceso de creación combina distintos checkpoints de LoRA (denominados A, C y X) sobre el modelo base `bogairff55/ViAble-merged6`, descartando los adaptadores B y D por considerarse "overlapping phases" que introducen envenenamiento (poison) en los pesos.

El modelo se publicó en agosto de 2026 y, en el momento de la consulta, no cuenta con descargas ni valoraciones en la plataforma, lo que indica que es un proyecto experimental y sin validación comunitaria. No se dispone de información sobre licencia, idiomas soportados ni datos de entrenamiento detallados. Su relevancia radica en ser un ejemplo de fusión de adaptadores LoRA sobre una base Qwen, una técnica habitual para ajustar modelos sin reentrenar todos los parámetros, pero su utilidad práctica está aún por demostrar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (transformer) basada en qwen3_5_text |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal (CausalLM) basado en la familia Qwen3.5, aunque no se especifican detalles concretos sobre el número de capas, dimensiones de atención o tipo de atención (dense o MoE). Según la model card, el modelo es un merge en BF16 del modelo base `bogairff55/ViAble-merged6` con varios adaptadores LoRA:

- Adaptador A: r64 en las capas 27 y 31
- Adaptador C: r64 en las capas 11, 15, 19 y 23
- Adaptador X: r128, 3 épocas de entrenamiento supervisado (SFT15), en las capas 23, 27 y 31

Todos los adaptadores se aplican sobre las matrices query y value con escala 1.0. Los adaptadores B y D fueron descartados porque el autor considera que sus fases se solapan con las de otros adaptadores y producen "envenenamiento" (poison) en el modelo final. No se aportan datos sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto causal en formato autoregresivo.
- Procesamiento de instrucciones y generación de respuestas (al ser un modelo de lenguaje general, aunque no se documentan capacidades específicas).
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible (es text-only).

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información proporcionada. Al tratarse de un modelo de 9B de la familia Qwen, podría emplearse en tareas genéricas de generación de texto, chatbots o análisis de lenguaje, pero no hay evidencia de que haya sido validado para aplicaciones concretas. Se recomienda no desplegarlo en producción sin una evaluación exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo en BF16 ocupa aproximadamente 17.9 GB (tamaño del repositorio), por lo que la inferencia en precisión completa requiere una GPU con al menos 18 GB de VRAM (p. ej., RTX 3090/4090, A100 40GB, etc.).
- No se indican requisitos oficiales de hardware ni opciones de despliegue recomendadas (vLLM, llama.cpp, TGI, etc.).
- Para inferencia en GPU de consumo, se podría cuantizar a 4 bits (aprox. 4.5 GB de VRAM) o 8 bits (aprox. 9 GB), pero no se han publicado archivos de cuantización en el repositorio.
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (tamaño y arquitectura). La base qwen3_5_text sugiere que pertenece a la familia Qwen, pero no se pueden proporcionar datos concretos de rendimiento ni de licencia.

## Limitaciones y advertencias

- Modelo experimental sin descargas ni validación comunitaria; no se recomienda su uso en producción.
- No se dispone de licencia explícita, lo que impide conocer las restricciones de uso comercial.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de lenguaje, es probable que presente sesgos presentes en los datos de entrenamiento.
- La model card indica que se descartaron adaptadores B y D por contener "poison" (envenenamiento), lo que sugiere que el proceso de fusión no está exento de riesgos técnicos.
- El modelo es text-only, por lo que no soporta entrada multimodal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bogairff55/ViAble-1.5-9B
- Modelo base (referencia): https://huggingface.co/bogairff55/ViAble
- Adaptador B (referencia): https://huggingface.co/bogairff55/B
- Otros enlaces de la búsqueda web (no relacionados directamente con el modelo): 
  - CivArchive: https://civitaiarchive.com/
  - ModelVault: https://www.modelvault.space/
  - ModelCap: https://modelcap.ai/
