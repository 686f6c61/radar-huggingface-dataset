# OkamotoJP/llm2-qwen35-sft019

## Resumen

llm2-qwen35-sft019 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por OkamotoJP en el contexto del curso "LLM講座2 2026" (asignatura final centrada en RAG). Se trata de un modelo de 873.438.784 parámetros (aproximadamente 0,87 mil millones) que hereda la arquitectura transformer de la familia Qwen3.5 y cuya única modificación respecto al modelo base es la actualización de los pesos de la parte lingüística mediante LoRA fusionado.

El modelo está especializado en la generación de respuestas para sistemas de recuperación aumentada (RAG) en japonés. Para ello se entrenó sobre un conjunto de 1324 ejemplos construidos a partir de JEMHopQA (preguntas de razonamiento multi-salto), auto-wiki-qa (preguntas y respuestas generadas a partir de Wikipedia en japonés) y fragmentos de Wikipedia japonesa empleados como contexto documental en los prompts.

Su relevancia es acotada pero concreta: demuestra el flujo completo de ajuste de un modelo pequeño (sub-1B) para una tarea vertical de RAG en un idioma no inglés, con licencia Apache-2.0 y pesos en safetensors. No obstante, la información pública disponible es mínima (2 descargas, sin pipeline declarado, sin benchmarks), por lo que debe evaluarse como un artefacto experimental de curso más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, parte lingüística) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen3.5-0.8B original (transformer decoder-only con atención causal); el autor indica explícitamente que la estructura es idéntica al modelo base y que solo se actualizan los pesos de la parte lingüística. El ajuste se realizó con LoRA de rango 16 y alpha 32, learning rate 1e-4, una sola época y fusión posterior de los adaptadores en los pesos originales. La revisión concreta del modelo base empleada es 2fc06364715b967f1860aea9cf38778875588b17.

El conjunto de entrenamiento consta de 1324 ejemplos: 882 de auto_wiki_qa, 378 de jemhopqa_train_sft/compositional y 64 de synth_compo/compositional. Los prompts incorporan fragmentos de Wikipedia japonesa como documentación de referencia, lo que orienta el ajuste hacia la tarea de responder preguntas condicionadas a contexto recuperado. No se documenta el número de tokens de entrenamiento, la composición exacta del corpus base ni si hubo etapas de RLHF o DPO posteriores; tampoco se detalla ninguna innovación técnica adicional más allá del propio flujo LoRA + merge.

## Capacidades

- Generación de texto en japonés condicionada a contexto documental (RAG): el ajuste está orientado a responder preguntas a partir de fragmentos de Wikipedia japonesa incluidos en el prompt.
- Razonamiento multi-salto básico: parte del entrenamiento usa JEMHopQA, un dataset de preguntas composicionales que requieren combinar información de varias entidades.
- Respuesta a preguntas de conocimiento enciclopédico: procedente de auto-wiki-qa.
- Herencia de las capacidades del modelo base Qwen3.5-0.8B, aunque no se documentan explícitamente en la model card.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible (no documentado).
- Capacidades multilingües: limitadas al japonés según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de respuestas en un pipeline RAG en japonés: el modelo recibe la pregunta del usuario junto con fragmentos recuperados de una base documental y produce la respuesta final; es exactamente la tarea para la que fue ajustado (curso centrado en RAG).
- Asistente de documentación interna en japonés: integrado en un sistema que recupera secciones de manuales o wikis corporativas y genera respuestas citables, aprovechando su entrenamiento con contexto documental.
- Preguntas multi-salto sobre bases de conocimiento estructuradas: adecuado para consultas que requieren cruzar información de dos entidades, gracias al entrenamiento con JEMHopQA.
- Prototipado rápido y experimentación académica: su tamaño sub-1B permite iterar en una sola GPU de consumo, lo que lo hace útil para validar arquitecturas RAG antes de escalar a modelos mayores.
- Evaluación comparativa de estrategias de prompting RAG: al estar entrenado específicamente para responder con contexto, sirve como línea base controlada frente al modelo base sin ajustar.
- Despliegue en entornos con recursos limitados: su huella de ~1,8 GB en safetensors permite ejecutarlo en CPU o GPU modesta para demos y pruebas de integración.
- Filtrado y reformateo de respuestas en japonés sobre corpus Wikipedia: puede emplearse para generar borradores de respuestas que luego se validan contra las fuentes recuperadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-2 GB solo para pesos, más overhead de activaciones y KV cache (estimación típica de 3-4 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, en torno a 0,5-0,7 GB para pesos (los artefactos cuantizados no están publicados, habría que generarlos).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 6 GB o más; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (carga directa de safetensors), llama.cpp/Ollama (requiere conversión a GGUF, no publicada), vLLM y TGI (compatibilidad sujeta a que la arquitectura Qwen3.5 esté soportada en la versión correspondiente).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| llm2-qwen35-sft019 | 873 M | no disponible | ja | Apache-2.0 | Ajuste SFT para RAG en japonés; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en la informacion | multilingüe (no detallado) | Apache-2.0 | Modelo original sin ajuste; referencia directa del fine-tune |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | ja | CC BY-SA 4.0 | Fuente principal de datos de entrenamiento; útil como referencia del dominio |

No se dispone de información suficiente para comparar con otros modelos ajustados de tamaño similar en japonés; los datos de benchmarks y contexto del modelo base no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre Wikipedia japonesa y JEMHopQA, hereda los sesgos de cobertura y perspectiva de esas fuentes; no se documenta ninguna mitigación.
- Riesgo de alucinación: elevado en un modelo de 0,87 B parámetros; las respuestas deben validarse contra los documentos recuperados, especialmente fuera del dominio de entrenamiento.
- Limitación de idioma: declarado únicamente para japonés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Limitación de contexto: la longitud de contexto no se especifica en la model card; conviene verificarla en la configuración del modelo base antes de diseñar prompts largos.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar el cumplimiento antes de uso comercial.
- Caveat de producción: sin benchmarks, sin métricas de evaluación y con 2 descargas en el momento de la consulta, no hay evidencia pública de calidad; no se recomienda su uso en producción sin una evaluación propia.
- Madurez: artefacto de un curso académico (LLM講座2 2026), sin pipeline declarado ni documentación de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft019
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
