# dementor-research/self_sft_oasst1_gpt-oss-20b_as_gpt-oss-20b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA experimental, entrenado por el grupo de investigación `dementor-research` como parte de un estudio de imitación de comportamiento configurado mediante definiciones. El adaptador se construye sobre el modelo base `openai/gpt-oss-20b`, un modelo de lenguaje de 20 mil millones de parámetros desarrollado por OpenAI, aunque no se proporcionan detalles técnicos adicionales sobre dicho modelo en la información disponible.

El adaptador fue entrenado con la etapa `SELF_SFT` (self-supervised fine-tuning) sobre el dataset OASST1, según se infiere del nombre del repositorio, aunque esta información no está confirmada explícitamente en la model card. El entrenamiento utiliza LoRA con rango 32 y `target_modules=all-linear`, y forma parte de una campaña más amplia que incluye 12 modelos, 4 datasets y 1 semilla, generando 48 celdas configuradas. El modelo se publica con formato `safetensors` y está pensado para cargarse mediante la librería `peft` de Hugging Face.

La relevancia de este adaptador es principalmente investigadora: sirve para estudiar cómo un modelo base puede imitar comportamientos específicos mediante ajuste fino eficiente. No se ha documentado ningún caso de uso práctico ni se han publicado benchmarks, por lo que debe considerarse un artefacto experimental, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador ocupa 1.0 GB en disco, pero no se indica el número de parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (según tags) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA (Low-Rank Adaptation) con rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se ven afectadas por los pesos de bajo rango. El entrenamiento se realizó en la etapa `SELF_SFT`, que corresponde a un ajuste fino auto-supervisado, probablemente sobre el dataset OASST1 (Open Assistant Conversations), aunque esta suposición se basa únicamente en el nombre del repositorio y no está confirmada en la documentación.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni el uso de técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El entrenamiento se llevó a cabo con la herramienta Tinker de Thinking Machines, como se indica en la model card.

## Capacidades

No se han documentado capacidades específicas para este adaptador en la información proporcionada. Al ser un adaptador LoRA sobre un modelo base, se espera que herede las capacidades del modelo `gpt-oss-20b` (generación de texto, razonamiento, etc.), pero no se confirma ninguna de ellas. Tampoco se indica soporte para tool calling, agentes, capacidades multilingües o modos especiales de pensamiento.

## Casos de uso

No se han documentado casos de uso concretos para este adaptador en la información disponible. Dado su carácter experimental y la ausencia de benchmarks, no es recomendable utilizarlo en entornos de producción. Los posibles usos se limitan al ámbito de la investigación, como:

- Estudio de imitación de comportamiento en modelos de lenguaje.
- Análisis de la eficacia de LoRA para ajuste fino auto-supervisado.
- Comparación de configuraciones de entrenamiento (rank, target_modules) dentro de la campaña dementor.
- Exploración de la transferencia de conocimiento desde datasets como OASST1.

Sin embargo, estos son usos hipotéticos derivados del contexto de investigación, no aplicaciones validadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Los requisitos de hardware dependen del modelo base `openai/gpt-oss-20b`, que no se detalla en la información proporcionada. Para un modelo de 20 mil millones de parámetros, se estima que la inferencia en precisión FP16 requiere al menos 40 GB de VRAM, y con cuantización de 8 bits podría reducirse a unos 20 GB, pero estos valores son estimaciones generales y no están confirmados para este adaptador.

- El adaptador LoRA en sí es ligero (1.0 GB), pero debe cargarse junto con el modelo base completo.
- Para ejecutar el modelo base en una GPU de consumo, se necesitaría al menos una RTX 3090 o RTX 4090 (24 GB VRAM) con cuantización de 4 bits, aunque no se especifica compatibilidad con dichas cuantizaciones.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. No se menciona soporte para vLLM, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables en la información.

## Limitaciones y advertencias

- Adaptador experimental sin licencia especificada; no se garantiza su uso comercial.
- No se han documentado sesgos ni riesgos de alucinación específicos, pero al derivar de un modelo base no verificado, pueden existir.
- La falta de información sobre el contexto, idiomas y rendimiento impide evaluar su idoneidad para tareas concretas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- No se recomienda su uso en producción sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: [dementor-research/self_sft_oasst1_gpt-oss-20b_as_gpt-oss-20b_seed42](https://huggingface.co/dementor-research/self_sft_oasst1_gpt-oss-20b_as_gpt-oss-20b_seed42)
- Herramienta Tinker: [https://thinkingmachines.ai/tinker/](https://thinkingmachines.ai/tinker/)
