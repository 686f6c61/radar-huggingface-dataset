# mktktmr/qwen3.5-0.8b-hop2-stage4

## Resumen

`mktktmr/qwen3.5-0.8b-hop2-stage4` es un ajuste fino mediante LoRA (fusionado en los pesos finales) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario mktktmr. El modelo está especializado en una tarea muy concreta dentro de pipelines de recuperación de información multi-salto: dado un par de pregunta y documentos de contexto ya recuperados, selecciona el siguiente término de búsqueda (una entidad nombrada) que debe consultarse en la etapa siguiente. Se trata, por tanto, de un componente de enrutamiento de consultas para sistemas RAG con razonamiento encadenado, no de un modelo de propósito general.

El modelo cuenta con 852.985.920 parámetros reales según los pesos en safetensors, lo que lo sitúa en la franja sub-1B, y el repositorio ocupa 1,7 GB. Está construido sobre la familia Qwen3.5, de la que hereda la arquitectura transformer del modelo base, aunque la model card no detalla configuraciones internas como número de capas, dimensión oculta o longitud de contexto.

Su relevancia es acotada pero clara: los sistemas de question answering multi-salto necesitan decidir qué entidad buscar a continuación, y un modelo pequeño y especializado puede ejecutar esa decisión con bajo coste computacional y latencia reducida, integrándose como paso intermedio en un pipeline mayor. La información pública disponible es escasa: no hay datos de benchmarks, licencia explícita ni idiomas declarados más allá de lo que se deduce del dataset de entrenamiento en japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B; detalles internos no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible oficialmente; el entrenamiento usa datos en japones (JEMHopQA y Wikipedia japonesa) |
| Licencia | No disponible en el repositorio (el modelo base Qwen/Qwen3.5-0.8B es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,85B parámetros, y se ha ajustado mediante LoRA sobre ese base, fusionando después los adaptadores en los pesos del modelo. La model card no especifica hiperparámetros del ajuste (rango del LoRA, tasa de aprendizaje, número de épocas) ni la composición exacta del conjunto de entrenamiento más allá de las fuentes.

Los datos de entrenamiento declarados son JEMHopQA, un corpus de question answering multi-salto en japonés con licencia CC BY-SA 4.0, filtrado y reformateado para la tarea, y un conjunto de chunks distribuidos derivados de Wikipedia japonesa, también bajo CC BY-SA 4.0. La tarea aprendida es la selección de una única entidad nombrada como siguiente consulta de búsqueda, a partir de la pregunta original y de los documentos ya recuperados. No se menciona el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; el interés técnico reside en la especialización estrecha del modelo, no en cambios estructurales.

## Capacidades

- Selección del siguiente término de búsqueda: dado un par pregunta-documentos, devuelve una entidad nombrada concreta para la siguiente consulta del pipeline.
- Razonamiento multi-salto acotado: diseñado para la segunda etapa (hop 2) de un flujo de recuperación encadenada.
- Comprensión lectora en japonés sobre documentos de contexto (Wikipedia y JEMHopQA).
- Generación de texto corto orientada a una salida estructurada (un único término).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes autónomos ni de multi-step reasoning general.
- No se documentan capacidades de visión, audio ni modo thinking.
- Capacidades multilingües: no documentadas; el uso previsto es en japonés.

## Casos de uso

- Question answering multi-salto en japonés: el modelo actúa como selector del siguiente término de búsqueda tras una primera recuperación, permitiendo encadenar consultas hasta resolver preguntas que requieren combinar varias entidades. Es adecuado por su entrenamiento específico sobre JEMHopQA.
- Componente de enrutamiento en pipelines RAG: se inserta entre el recuperador y el generador final para decidir qué entidad consultar a continuación, reduciendo la carga de un LLM grande en esa decisión.
- Búsqueda documental encadenada sobre Wikipedia japonesa: dado un fragmento recuperado, el modelo identifica la entidad puente que falta para completar la respuesta.
- Sistemas de preguntas y respuestas sobre bases de conocimiento: selección de la siguiente entidad a resolver en grafos de conocimiento o índices documentales.
- Prototipado e investigación en QA multi-salto: al ser un modelo sub-1B, permite iterar sobre estrategias de recuperación con coste bajo y latencia reducida.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecución en CPU o GPU de gama baja para tareas de selección de consultas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, alrededor de 2-3 GB.
- En cuantización de 8 bits: aproximadamente 0,9 GB de pesos; en 4 bits: aproximadamente 0,5 GB (estimaciones teóricas, no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090); también cabe en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer y en CPU: por su tamaño, es viable en portátiles y entornos sin GPU dedicada.
- Opciones de despliegue: transformers con safetensors; vLLM, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no publicados en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-hop2-stage4 | 852.985.920 | No disponible | Selección de siguiente consulta (QA multi-salto, japonés) | No disponible | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | Propósito general | Apache-2.0 | Hugging Face |
| Modelos de enrutamiento de consultas para RAG multi-salto | No disponible | No disponible | Similar | No disponible | No disponible |

No se dispone de información sobre benchmarks ni sobre alternativas especializadas comparables publicadas con datos verificables.

## Limitaciones y advertencias

- Modelo altamente especializado: no es adecuado para generación de texto general, código, matemáticas ni conversación abierta.
- Entrenado sobre datos en japonés (JEMHopQA y Wikipedia japonesa); su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación en la entidad seleccionada: puede proponer términos no presentes en el contexto o inexistentes.
- La licencia del modelo no está declarada en el repositorio; aunque el base es Apache-2.0, conviene verificar los términos antes de uso comercial.
- Los datos de entrenamiento están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre derivados según la interpretación aplicable.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Sin datos de contexto máximo: no se puede garantizar el comportamiento con documentos de contexto largos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso en producción.
- No se publican cuantizaciones ni formatos alternativos, lo que limita el despliegue directo en llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-hop2-stage4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
