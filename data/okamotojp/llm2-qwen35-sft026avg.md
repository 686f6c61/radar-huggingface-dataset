# OkamotoJP/llm2-qwen35-sft026avg

## Resumen

`OkamotoJP/llm2-qwen35-sft026avg` es un ajuste fino (SFT) del modelo base `Qwen/Qwen3.5-0.8B` de Alibaba, publicado por el usuario OkamotoJP. No se trata de un modelo entrenado desde cero, sino de una media aritmética de pesos (weight averaging) entre dos ejecuciones del mismo entrenamiento con semillas distintas (`llm2-qwen35-sft026` y `llm2-qwen35-sft026b`), cada una con peso 0,50. La técnica busca reducir la varianza introducida por la semilla y estabilizar el rendimiento.

El modelo está especializado en generación de respuestas para un sistema RAG (Retrieval-Augmented Generation) en japonés. Fue desarrollado como entrega final del curso «LLM講座2 2026», y los datos de entrenamiento provienen de conjuntos de preguntas y respuestas en japonés: JEMHopQA y auto-wiki-qa, además de fragmentos de Wikipedia japonesa usados como contexto en los prompts.

Con 873 millones de parámetros y licencia Apache-2.0, es un modelo pequeño orientado a despliegue ligero en tareas de question answering sobre documentación en japonés. Su relevancia es acotada: es un artefacto educativo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni pipeline declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-0.8B); solo se modifican los pesos de la parte lingüística |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `Qwen/Qwen3.5-0.8B`, un transformer de 873 millones de parámetros. El autor indica explícitamente que la estructura del modelo es idéntica a la del base y que únicamente difieren los pesos de la parte lingüística. No se documentan innovaciones arquitectónicas propias ni modificaciones estructurales.

El entrenamiento consiste en un SFT sobre dos conjuntos de datos en japonés: JEMHopQA (CC BY-SA 4.0), filtrado y reformateado para entrenamiento, y `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0), muestreado, filtrado y reformateado. Además, se emplearon fragmentos de Wikipedia japonesa (CC BY-SA 4.0) como material de contexto en los prompts de entrenamiento, lo que alinea el modelo con el formato de entrada típico de un pipeline RAG. El modelo final es la media elemento a elemento de dos checkpoints entrenados con los mismos datos y configuración pero semillas distintas (peso 0,50 cada uno). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en japonés, orientada a respuestas de question answering.
- Generación de respuestas condicionada a contexto documental (diseñado para el paso de generación de un pipeline RAG).
- Manejo de preguntas de tipo hop múltiple, dado el uso de JEMHopQA en el entrenamiento.
- Capacidad heredada del modelo base Qwen3.5-0.8B, cuyo alcance completo no se detalla en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de respuestas en un sistema RAG en japonés: el modelo fue entrenado con fragmentos de Wikipedia como contexto en el prompt, por lo que encaja directamente en el paso de síntesis de respuesta a partir de documentos recuperados.
- Question answering sobre documentación interna en japonés: con 873 millones de parámetros puede desplegarse en infraestructura modesta para responder preguntas sobre manuales o bases de conocimiento corporativas.
- Preguntas de hop múltiple: el entrenamiento con JEMHopQA lo hace adecuado para consultas que requieren combinar información de varias fuentes recuperadas.
- Prototipado educativo y experimentación: su tamaño reducido permite iterar rápidamente en entornos de aprendizaje o investigación sobre técnicas de SFT y weight averaging.
- Evaluación de pipelines RAG: sirve como modelo de referencia para medir la calidad del paso de generación con distintos recuperadores o estrategias de chunking.
- Despliegue en entornos con recursos limitados: al ser un modelo sub-1000M, puede ejecutarse en GPU de consumo o incluso en CPU para cargas de baja concurrencia.
- Base para futuros ajustes: al estar bajo Apache-2.0 y en safetensors, puede reutilizarse como punto de partida para otros SFT en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, en torno a 2-3 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9 GB para pesos; en 4 bits, en torno a 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10, L4 o A100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en fp16, y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: no se documentan opciones específicas; al estar en safetensors es compatible con frameworks estándar de inferencia (Transformers, vLLM, TGI) siempre que soporten la arquitectura Qwen3.5. No se proporcionan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft026avg | 873 M | no disponible | ja | Apache-2.0 | SFT + weight averaging para RAG en japonés |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | multilingüe (según modelo base) | Apache-2.0 | Modelo base sin ajuste específico |
| OkamotoJP/llm2-qwen35-sft026 | 873 M | no disponible | ja | Apache-2.0 | Checkpoint individual (semilla 1) promediado en este modelo |
| OkamotoJP/llm2-qwen35-sft026b | 873 M | no disponible | ja | Apache-2.0 | Checkpoint individual (semilla 2) promediado en este modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de propósito muy específico: entrenado para generación de respuestas RAG en japonés; su rendimiento fuera de ese dominio no está documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinación: como todo modelo generativo de este tamaño, puede producir respuestas plausibles pero incorrectas, especialmente si el contexto recuperado es irrelevante o insuficiente.
- Cobertura lingüística limitada: la etiqueta de idioma es únicamente japonés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que dificulta planificar el tamaño de los fragmentos en un pipeline RAG.
- Licencia Apache-2.0: permite uso comercial, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar la implicación legal antes de un uso comercial.
- Artefacto educativo con nula tracción: cero descargas y cero likes en el momento de la consulta; sin mantenimiento ni soporte documentado.
- Sin pipeline declarado en Hugging Face: no se especifica la tarea oficial del modelo en el hub.
- Fecha de creación futura en los metadatos (2026-11-15): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft026avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint promediado 1: https://huggingface.co/OkamotoJP/llm2-qwen35-sft026
- Checkpoint promediado 2: https://huggingface.co/OkamotoJP/llm2-qwen35-sft026b
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
