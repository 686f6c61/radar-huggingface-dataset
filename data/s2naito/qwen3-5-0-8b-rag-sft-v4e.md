# s2naito/qwen3.5-0.8b-rag-sft-v4e

## Resumen

s2naito/qwen3.5-0.8b-rag-sft-v4e es un ajuste fino (fine-tuning) mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario s2naito. El modelo está especializado en respuesta corta a preguntas (short-answer QA) sobre un corpus de Wikipedia en japonés, dentro de un pipeline de generación aumentada por recuperación (RAG). No se trata de un modelo de propósito general, sino de un componente afinado para una tarea muy concreta: consumir contextos recuperados por una cadena de recuperación específica y producir respuestas concisas en japonés.

El modelo tiene 873.438.784 parámetros totales (aproximadamente 0,87 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0. Su relevancia radica en que documenta un caso real de ajuste fino orientado a producción sobre un modelo pequeño, mostrando la receta exacta de recuperación (RRF de 4 vías, reranker Ruri, 2-hop basado en reglas, selector de artículos y rerank de cola de título) y de entrenamiento (LoRA con target_modules="all-linear", 2 épocas, semilla 42). Es un ejemplo útil para quienes construyen sistemas RAG en japonés con presupuestos de cómputo reducidos.

El modelo no incluye una model card con benchmarks, demos ni datos de rendimiento cuantitativos. Toda la información disponible procede de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); ajuste fino mediante LoRA con target_modules="all-linear" |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) y se ajusta mediante LoRA con target_modules="all-linear", es decir, aplicando adaptadores de bajo rango a todas las capas lineales del transformer. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de las fuentes citadas, ni si se aplicaron técnicas de RLHF o DPO.

Los datos de entrenamiento combinan cuatro fuentes, todas bajo licencia CC BY-SA 4.0 y modificadas (filtradas y reformateadas) para el ajuste: JEMHopQA, JSQuAD/JGLUE, NIILC QA y los fragmentos de Wikipedia japonesa distribuidos en bumbuboon/llm-course-final-2026 (estos últimos usados sin modificar como contextos de recuperación). La receta SFT v4e corresponde al plan "SFT v4 Plan C": refuerzo limpio de rangos 2-5, con un máximo de 3 veces por pregunta y época, 2 épocas de entrenamiento y semilla 42. Los contextos se construyen con el pipeline de producción: RRF de 4 vías con top-100, reranker Ruri, 2-hop basado en reglas, selección de artículos mediante s2naito/qwen3.5-0.8b-rag-selector-v2, rerank_title_tail y CONTEXT_TOP_K=5.

## Capacidades

- Generación de respuestas cortas a preguntas (short-answer QA) en japonés sobre contextos recuperados de Wikipedia.
- Consumo de contextos estructurados por un pipeline RAG específico (top-5 tras reranking y selección de artículos).
- Razonamiento limitado a la tarea de extracción y síntesis de respuestas a partir del contexto proporcionado.
- Capacidad multilingüe restringida al japonés según la etiqueta de idioma declarada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso autónomo.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Respuesta a preguntas sobre Wikipedia japonesa en producción: el modelo está afinado para recibir contextos recuperados por el pipeline documentado (RRF de 4 vías, reranker Ruri, 2-hop, selector de artículos) y devolver respuestas cortas; es adecuado porque el ajuste se realizó exactamente con esos contextos.
- Sistemas de búsqueda con respuesta directa (answer engine): integrar el modelo como etapa final de generación tras la recuperación para ofrecer respuestas concisas al usuario en japonés.
- Asistentes de documentación interna en japonés: desplegar el modelo sobre corpus propios reorganizados con el mismo esquema de recuperación para responder consultas factuales de baja latencia.
- Evaluación de pipelines RAG: usar el modelo como generador de referencia para medir la calidad de la recuperación (reranker, selector de artículos) manteniendo fijo el componente generativo.
- Prototipado de bajo coste: al tener menos de mil millones de parámetros, permite iterar rápidamente en entornos con GPU de gama media o incluso CPU con cuantización, aunque esta no esté documentada.
- Investigación en ajuste fino con LoRA: sirve como caso reproducible de receta SFT (Plan C, 2 épocas, semilla 42, refuerzo de rangos 2-5) para estudiar el efecto del diseño de contextos en modelos pequeños.
- Filtrado y validación de respuestas: emplear el modelo para generar respuestas candidatas que luego se validen contra el contexto recuperado en flujos de control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~0,87 mil millones de parámetros en fp16 se estiman aproximadamente 1,7-2 GB de pesos, y en fp32 unos 3,5 GB, sin contar overhead de activaciones ni caché KV.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar el modelo en precisión reducida, aunque no se documenta.
- ¿Cabe en GPU de consumo? No se confirma en la información disponible, pero por el número de parámetros es plausible en tarjetas de consumo modernas; no se aportan datos verificados.
- Opciones de despliegue: no se documentan (no se mencionan vLLM, llama.cpp, Ollama ni TGI); solo se publican pesos en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (QA corta sobre Wikipedia japonesa) y no debe esperarse un comportamiento de propósito general.
- Está afinado para un pipeline de recuperación concreto (RRF de 4 vías, reranker Ruri, 2-hop, selector de artículos, CONTEXT_TOP_K=5); su rendimiento puede degradarse si se usa con otros esquemas de recuperación.
- Idioma restringido al japonés según la etiqueta declarada; no se documenta soporte fiable de otros idiomas.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad al contexto ni tasas de error.
- Sesgos conocidos: no documentados; al entrenarse sobre Wikipedia japonesa y datasets QA, puede heredar sesgos de esas fuentes.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto soportada.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento están bajo CC BY-SA 4.0, lo que conviene revisar para cumplir con las obligaciones de atribución y compartir igual.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- No se documentan cuantizaciones oficiales ni formatos alternativos a safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4e
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Selector de artículos: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-selector-v2
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de chunks de Wikipedia: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
