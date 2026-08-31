# agentic-ptb/opus-high-v3.h046.soup-w

## Resumen

`opus-high-v3.h046.soup-w` es un checkpoint intermedio y derivado del modelo base Qwen/Qwen3.5-9B-Base, producido por el proyecto AgentPTB durante una ejecución de Claude Code denominada `opus-high-v3`. El autor, `agentic-ptb`, lo publica con un propósito explícito de reproducibilidad y estudio cualitativo: se trata de un artefacto de un experimento de entrenamiento que no logró ninguna mejora de pesos, tal y como advierte la propia model card.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y se distribuye en formato safetensors bajo licencia Apache-2.0. No se documentan especificaciones como longitud de contexto, idiomas soportados o cuantizaciones. Su relevancia es únicamente investigadora: permite analizar por qué un proceso de entrenamiento concreto regresó o no convergió, y sirve como referencia para estudios de dinámica de pérdida y reproducibilidad de resultados negativos. No está concebido para uso práctico en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de Qwen/Qwen3.5-9B-Base (arquitectura no especificada en la ficha) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplicable (no es modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.5-9B-Base, pero no se proporciona ninguna descripción técnica adicional sobre la estructura interna (número de capas, atención, etc.). El proceso de entrenamiento formó parte de un run de Claude Code llamado `opus-high-v3` dentro del proyecto AgentPTB, del que se conserva un archivo de datos en el dataset `agentic-ptb/opus-high-v3-data`.

Según la model card, el run fue un resultado negativo: no se encontró ninguna mejora en los pesos entrenados. No se indica el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas en el entrenamiento. El propio autor advierte que no debe inferirse calidad a partir de la publicación de este checkpoint.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint en la información disponible.
- Al estar basado en Qwen3.5-9B-Base, podría conservar capacidades generales de generación de texto, razonamiento y código del modelo original, pero no hay evidencia de que el entrenamiento adicional haya mejorado o mantenido dichas capacidades.
- No se ha verificado soporte para tool calling, agentes, modo razonamiento, visión ni audio.
- No se dispone de datos sobre capacidades multilingües.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un experimento fallido, los casos de uso son exclusivamente de investigación y análisis:

- Estudio de reproducibilidad de resultados negativos: permite comparar la evolución de los pesos a lo largo de las horas de entrenamiento (el run alcanzó la hora h046) y entender en qué punto el proceso dejó de mejorar.
- Análisis de dinámica de pérdida y convergencia: investigadores pueden cargar este checkpoint y examinar por qué el entrenamiento no produjo mejoras, comparándolo con el modelo base.
- Evaluación de pipelines de entrenamiento para agentes: sirve como referencia para depurar pipelines similares que utilicen Claude Code como orquestador.
- Test de integración en infraestructuras de entrenamiento: puede usarse para verificar que un sistema de entrenamiento reproduce correctamente los checkpoints intermedios, sin depender de su calidad.
- Análisis de regresión de capacidades: se puede comparar el comportamiento de este checkpoint frente al modelo base para documentar posibles degradaciones inducidas por el entrenamiento.
- No es adecuado para aplicaciones en producción, atención al cliente, generación de código o cualquier tarea finalista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No hay datos oficiales de requisitos de hardware para este checkpoint. Las siguientes estimaciones se basan únicamente en el tamaño de parámetros (9,4 mil millones) y son orientativas:

- VRAM estimada para inferencia en FP16: aproximadamente 19 GB (solo pesos), más overhead de activaciones.
- VRAM estimada en cuantización int8: alrededor de 10 GB; en int4: alrededor de 5 GB, aunque no se ofrecen pesos cuantizados en el repositorio.
- GPU recomendadas: tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090) para FP16 con margen; GPUs profesionales como A100 o H100 serían necesarias para lotes grandes o entrenamiento.
- Al ser un checkpoint intermedio, no se ha optimizado para despliegue; no hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento comparativo publicados. La única comparación estructural posible es con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `agentic-ptb/opus-high-v3.h046.soup-w` | 9,4B | No disponible | Apache-2.0 | Checkpoint intermedio sin mejoras |
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible | Apache-2.0 | Modelo base oficial |

No se dispone de información sobre otros modelos comparables de la misma categoría (9B) con los que contrastar rendimiento o capacidades.

## Limitaciones y advertencias

- El run de entrenamiento fue un resultado negativo: no se encontró ninguna mejora en los pesos. El modelo no debe usarse como si fuera un modelo afinado de calidad.
- No hay documentación sobre sesgos, alucinaciones o comportamientos no deseados.
- No se han publicado datos de benchmarks ni evaluaciones de capacidades.
- La longitud de contexto, los idiomas y las cuantizaciones son desconocidos.
- La licencia Apache-2.0 permite uso comercial, pero el valor práctico del checkpoint es nulo para aplicaciones reales.
- Cualquier uso en producción se considera inapropiado sin una validación exhaustiva previa, que no está disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h046.soup-w
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets de AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
