# mradermacher/Qwen3.8-27B-Dominatrix-GGUF

## Resumen

El repositorio `mradermacher/Qwen3.8-27B-Dominatrix-GGUF` contiene cuantizaciones GGUF estáticas del modelo `allura-org/Qwen3.8-27B-Dominatrix`, un fine-tuning del modelo Qwen3.8-27B de la familia Qwen desarrollada por Alibaba. El nombre "Dominatrix" sugiere un ajuste orientado a roleplay o contenido conversacional específico, aunque no se dispone de documentación oficial que lo confirme. Este repositorio es obra de `mradermacher`, un usuario conocido por publicar versiones cuantizadas de modelos open source.

El modelo base Qwen3.8-27B es un modelo de lenguaje de 27 mil millones de parámetros, instruido, diseñado para generación de texto general, tareas de visión y cargas de trabajo agénticas, según la documentación de Cloudflare. Sin embargo, el dato de parámetros totales indicado en este repositorio (460.730.096) es notablemente inferior al esperado para un modelo de 27B, lo que genera incertidumbre sobre el tamaño real del modelo cuantizado. El repositorio solo contiene archivos GGUF y no incluye los pesos originales en safetensors.

La relevancia de este repositorio radica en ofrecer versiones cuantizadas (Q2, Q3, Q4, Q5, Q6, Q8, IQ4_XS, etc.) que permiten ejecutar el modelo en hardware con recursos limitados, aunque la falta de información sobre el fine-tuning y los datos de entrenamiento limita su uso en entornos profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.8-27B, sin confirmar) |
| Parametros totales | 460.730.096 (según repositorio; inconsistente con el nombre de 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original `Qwen3.8-27B-Dominatrix`. El repositorio solo indica que se trata de una cuantización estática de un modelo alojado en `allura-org/Qwen3.8-27B-Dominatrix`, sin proporcionar detalles sobre el proceso de entrenamiento, el dataset utilizado, ni si se aplicaron técnicas como RLHF o DPO. El modelo base Qwen3.8-27B, según la documentación de Cloudflare, es un modelo de 27B parámetros con capacidad de visión y agéntica, pero no se especifica su arquitectura exacta (número de capas, atención, etc.). Tampoco se informa sobre el número de tokens de entrenamiento ni la composición del corpus.

## Capacidades

Dado que no se proporciona información específica sobre el modelo cuantizado ni sobre el fine-tuning "Dominatrix", las capacidades solo pueden inferirse del modelo base Qwen3.8-27B, que según Cloudflare incluye:

- Generación de texto general y eficiente.
- Capacidades de visión (procesamiento de imágenes).
- Soporte para cargas de trabajo agénticas (tool calling, razonamiento multi-paso).
- Instrucción ajustada para seguir comandos.

Sin embargo, no se confirma que estas capacidades se mantengan en la versión cuantizada ni en el fine-tuning específico. No hay información sobre soporte de idiomas, ni sobre capacidades especiales como modo de pensamiento o audio.

## Casos de uso

No se dispone de información concreta sobre aplicaciones prácticas del modelo `Qwen3.8-27B-Dominatrix`. Dado que el nombre sugiere un fine-tuning orientado a roleplay o conversación con temática específica, podría emplearse en escenarios de entretenimiento o simulación de personajes, pero esto no está documentado. Sin datos sobre el rendimiento real, la licencia o el comportamiento del modelo, no es posible recomendar casos de uso profesionales con seguridad. Se recomienda consultar el repositorio original `allura-org/Qwen3.8-27B-Dominatrix` para obtener más detalles antes de considerar su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 1.6 GB, lo que sugiere que las cuantizaciones más pequeñas (Q2, Q3) pueden ejecutarse en GPUs con 4-6 GB de VRAM.
- Las cuantizaciones más grandes (Q8_0, F16) requerirían aproximadamente 2-3 GB de VRAM adicionales, pero dado el número de parámetros indicado (460M), el modelo cabe incluso en GPUs integradas o CPUs con suficiente RAM.
- No se especifican GPUs recomendadas. Para inferencia local se pueden usar herramientas como llama.cpp, Ollama o vLLM, compatibles con formato GGUF.
- Dado el tamaño reducido, la latencia debería ser baja en hardware moderno, pero no se aportan datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El nombre sugiere una relación con Qwen3.8-27B, pero el número de parámetros indicado es muy inferior. Otros repositorios de `mradermacher` como `Qwen3.8-27B-GGUF` o `Qwen3.8-27B-Uncensored-FP8-GGUF` podrían ser comparables, pero no se proporcionan detalles de rendimiento ni de licencia. Se recomienda consultar las fichas de los modelos base de Qwen para obtener referencias.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto.
- La licencia no está especificada, por lo que no se garantiza su uso comercial. Se debe contactar con el autor original (`allura-org`) para aclarar los términos.
- El número de parámetros declarado (460M) es inconsistente con el nombre del modelo (27B), lo que sugiere posibles errores en el etiquetado o una cuantización extrema que podría degradar significativamente la calidad.
- Al ser una cuantización estática, el rendimiento puede variar respecto al modelo original en precisión y coherencia.
- No hay garantía de que las capacidades del modelo base (visión, agéntica) se conserven tras el fine-tuning y la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Dominatrix-GGUF
- Modelo original (referencia): https://huggingface.co/allura-org/Qwen3.8-27B-Dominatrix
- Repositorio relacionado (Qwen3.8-27B-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-GGUF
- Repositorio relacionado (Uncensored-FP8): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-FP8-GGUF
- Documentación de Cloudflare sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Blog sobre cuantizaciones Qwen3.8-27B: https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Repositorio oficial de Qwen3-Coder (referencia de la familia): https://github.com/QwenLM/Qwen3-Coder
