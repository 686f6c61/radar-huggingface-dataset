# OkamotoJP/llm2-qwen35-sft014avg

## Resumen

llm2-qwen35-sft014avg es un modelo de lenguaje de 873 millones de parámetros derivado de Qwen/Qwen3.5-0.8B mediante fine-tuning con LoRA y posterior fusión de pesos. Lo desarrolla OkamotoJP en el contexto del curso "LLM講座2 2026" (Lección de LLM 2, 2026), concretamente como entrega final del módulo de RAG (Retrieval-Augmented Generation). No es un modelo de propósito general: está entrenado específicamente para generar respuestas a partir de documentos recuperados en japonés.

El modelo se construye promediando, elemento a elemento, los pesos de dos checkpoints entrenados con los mismos datos pero distinta semilla (llm2-qwen35-sft014 y llm2-qwen35-sft014b, con pesos 0.50 y 0.50). Es una técnica de model averaging o weight soup que busca reducir la varianza del fine-tuning y estabilizar la calidad de las respuestas. La arquitectura subyacente es la del Qwen3.5-0.8B original, con solo los pesos de la parte lingüística modificados.

Su relevancia es acotada y de nicho: demuestra un flujo de trabajo completo de fine-tuning con LoRA, fusión y promediado de pesos sobre datasets japoneses de QA (JEMHopQA y auto-wiki-qa), con licencia Apache-2.0 y un tamaño que permite inferencia en hardware de consumo. No dispone de benchmarks publicados ni de adopción significativa (9 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización estándar vía herramientas externas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B: un transformer decoder-only de 873 millones de parámetros. Según la model card, "la estructura del modelo es la misma que la del original (solo los pesos de la parte lingüística difieren)". No se detallan en la información disponible aspectos como el número de capas, dimensión oculta, número de cabezas de atención ni la longitud de contexto nativa.

El entrenamiento consistió en dos fine-tunings independientes con LoRA sobre Qwen3.5-0.8B, usando idéntico dataset pero distinta semilla, seguidos de merge de los adaptadores y promedio elemento a elemento de los pesos resultantes (weight soup). Los datos de entrenamiento provienen de tres fuentes japonesas: JEMHopQA (CC BY-SA 4.0), cl-nagoya/auto-wiki-qa (CC BY-SA 4.0) y un conjunto de chunks distribuidos derivados de Wikipedia japonesa (CC BY-SA 4.0), usados como material de contexto en los prompts de entrenamiento. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO. El objetivo declarado es la generación de respuestas para RAG (final assignment del curso).

## Capacidades

- Generación de texto en japonés orientada a respuestas extractivas y de síntesis sobre documentos recuperados.
- Generación de respuestas condicionada a contexto (RAG): el modelo fue entrenado con chunks de Wikipedia como material de referencia en el prompt.
- Question answering sobre dominios factuales y de conocimiento general en japonés (a partir de los datasets JEMHopQA y auto-wiki-qa).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al japonés según la etiqueta de idioma del repositorio.
- Modo thinking, visión o audio: no disponible.
- Capacidad de seguir instrucciones generales: no documentada; el fine-tuning está especializado en RAG.

## Casos de uso

- Generación de respuestas en pipelines RAG en japonés: el modelo está entrenado explícitamente para recibir chunks de documentos (estilo Wikipedia) y producir respuestas. Se integraría como componente generador tras el retrieval, con prompts que incluyan el contexto recuperado.
- Sistemas de preguntas y respuestas sobre documentación interna en japonés: dado su entrenamiento con JEMHopQA y auto-wiki-qa, encaja en escenarios de QA factual sobre bases documentales corporativas en japonés, siempre con recuperación previa.
- Prototipado y educación: por su tamaño (873 M parámetros) y licencia Apache-2.0, sirve como modelo de referencia en cursos y talleres sobre fine-tuning con LoRA, fusión de adaptadores y promediado de pesos.
- Asistentes de consulta sobre Wikipedia japonesa: el modelo fue entrenado con chunks de Wikipedia japonesa como material de contexto, por lo que puede emplearse en interfaces de consulta sobre ese corpus.
- Experimentación con weight soup y model averaging: el checkpoint es un ejemplo reproducible de promedio de pesos de dos fine-tunings con distinta semilla, útil para investigar estabilidad y varianza en el fine-tuning de modelos pequeños.
- Despliegue en entornos con recursos limitados: al tener menos de mil millones de parámetros, puede ejecutarse en GPUs de consumo para tareas de generación de respuestas en japonés con baja concurrencia.
- Evaluación comparativa de estrategias de fine-tuning: sirve como baseline para medir el efecto del promediado de pesos frente a un único checkpoint en tareas de QA japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (873 M parámetros), en fp16 los pesos ocupan aproximadamente 1,7 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, en torno a 0,5 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría alojar el modelo en cuantizaciones bajas, pero no hay datos oficiales.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con 8 GB o más en fp16, y en tarjetas con 4-6 GB en cuantizaciones de 4-8 bits, aunque no se ha verificado en la información disponible.
- Opciones de despliegue: no documentadas por el autor. Al publicarse en safetensors con arquitectura Qwen3.5, sería compatible con frameworks estándar (transformers, vLLM, llama.cpp/Ollama previa conversión a GGUF), pero no hay confirmación en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft014avg | 873 M | no disponible | Apache-2.0 | Hugging Face (9 descargas) | Fine-tuning RAG en japonés, weight soup de 2 checkpoints |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | Apache-2.0 | Hugging Face (modelo base) | Modelo base sin fine-tuning; capacidades generales |
| OkamotoJP/llm2-qwen35-sft014 | 873 M | no disponible | Apache-2.0 | Hugging Face | Checkpoint individual (seed 1) promediado en este modelo |
| OkamotoJP/llm2-qwen35-sft014b | 873 M | no disponible | Apache-2.0 | Hugging Face | Checkpoint individual (seed 2) promediado en este modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para generación de respuestas en RAG en japonés; su comportamiento en otras tareas (código, matemáticas, instrucciones generales) no está documentado y probablemente sea deficiente.
- Idioma: solo se declara soporte de japonés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede producir contenido no respaldado por el contexto recuperado; no se han publicado evaluaciones de fidelidad (faithfulness) en RAG.
- Sesgos: no se documentan análisis de sesgos; los datasets de origen (Wikipedia japonesa, JEMHopQA, auto-wiki-qa) pueden introducir sesgos propios del corpus.
- Longitud de contexto: no disponible; no se puede garantizar el manejo de contextos largos en pipelines RAG con muchos chunks.
- Licencia: Apache-2.0 permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y share-alike sobre datos derivados; conviene revisar la compatibilidad en producción.
- Madurez: 9 descargas y 0 likes; sin benchmarks, sin demo y sin documentación de despliegue. No recomendable como componente crítico de producción sin evaluación propia.
- Fecha de creación futura (2026-11-10) en los metadatos del repositorio; verificar la integridad y procedencia del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft014avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint promediado 1: https://huggingface.co/OkamotoJP/llm2-qwen35-sft014
- Checkpoint promediado 2: https://huggingface.co/OkamotoJP/llm2-qwen35-sft014b
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
