# JJarvinen/Qwen3.5-2B-EU-Tool-JARVIS-Compact-v1

## Resumen

Qwen3.5-2B-EU-Tool-JARVIS-Compact-v1 es un modelo de lenguaje de 2.390 millones de parámetros, desarrollado por JJarvinen mediante fine-tuning del modelo JJarvinen/Qwen3.5-2B-EU-Tool-JARVIS-Native-v1. Se distribuye bajo licencia Apache-2.0 y está diseñado para generación de texto y conversación en inglés, según la metadata de HuggingFace. El nombre sugiere una orientación hacia el uso de herramientas (tool calling) y agentes, aunque esta capacidad no está documentada en la ficha. El modelo fue entrenado con Unsloth y la librería TRL de HuggingFace, lo que indica un proceso de fine-tuning optimizado. No se especifican la arquitectura exacta, la longitud de contexto ni los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 2.390.384.448 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo. El tag `qwen3_5_text` indica que pertenece a la familia Qwen3.5, pero no se especifica si es un transformer puro, un modelo Mixture of Experts o una arquitectura híbrida. El modelo es un fine-tuning del modelo JJarvinen/Qwen3.5-2B-EU-Tool-JARVIS-Native-v1, realizado con Unsloth y la librería TRL de HuggingFace. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y modelo conversacional, según los tags `text-generation` y `conversational`.
- Soporte de idioma inglés, según la metadata.
- El nombre del modelo sugiere capacidades de tool calling y agentes, pero no hay documentación técnica que lo confirme.
- No se han documentado capacidades multimodales, de razonamiento avanzado, generación de código o matemáticas en la información disponible.

## Casos de uso

- No disponible. La información proporcionada no incluye casos de uso documentados ni especificaciones que permitan inferir aplicaciones concretas con fiabilidad.
- Se recomienda consultar la documentación del modelo base o realizar una evaluación empírica antes de considerar el modelo para cualquier escenario de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (9,6 GB) coincide con el almacenamiento de los pesos en precisión FP32 (2.390.384.448 × 4 bytes ≈ 9,56 GB), lo que sugiere que la versión publicada no está cuantizada. En ese caso, se requerirían aproximadamente 10 GB de VRAM solo para los pesos, sin contar activaciones.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Un modelo de este tamaño podría ejecutarse en GPU de consumo si se cuantizara, pero no se ofrecen cuantizaciones en el repositorio.
- Opciones de despliegue: compatible con la librería `transformers`; el tag `text-generation-inference` sugiere compatibilidad con TGI, y `endpoints_compatible` indica que puede desplegarse en endpoints de HuggingFace. No se especifican vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. La única referencia es el modelo base JJarvinen/Qwen3.5-2B-EU-Tool-JARVIS-Native-v1, del cual deriva este fine-tuning, pero no se incluyen especificaciones de ninguno de los dos.

## Limitaciones y advertencias

- Documentación escasa: la model card no incluye detalles sobre sesgos, alucinaciones ni limitaciones específicas.
- El modelo no tiene descargas ni likes en HuggingFace, lo que indica que no ha sido ampliamente validado por la comunidad.
- Solo se declara soporte de inglés; no se especifican otros idiomas.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas.
- Al ser un fine-tuning de un modelo pequeño (2B), puede presentar limitaciones inherentes a su tamaño, pero no hay datos específicos disponibles.
- Se recomienda evaluar el modelo en el dominio de uso previsto antes de desplegarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/JJarvinen/Qwen3.5-2B-EU-Tool-JARVIS-Compact-v1
- Modelo base: https://huggingface.co/JJarvinen/Qwen3.5-2B-EU-Tool-JARVIS-Native-v1
- Referencia general de la familia Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:2b
- Unsloth: https://github.com/unslothai/unsloth
