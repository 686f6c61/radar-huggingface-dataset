# Quipuai/quipu-0.8b

## Resumen

Quipu 0.8B es un modelo de lenguaje compacto desarrollado por Quipuai, construido mediante fine-tuning con LoRA sobre el modelo base Qwen/Qwen3.5-0.8B. Está diseñado para ofrecer razonamiento paso a paso claro, comportamiento honesto en tool calling, identidad consistente y asistencia ligera de código, todo ello con un coste computacional reducido al tener solo 752 millones de parámetros. Su objetivo es proporcionar una alternativa rápida y económica para tareas de asistencia conversacional, agentes y razonamiento simple, sin necesidad de infraestructura de gran escala.

El modelo se distribuye bajo licencia Apache 2.0, soporta inglés y español, y está disponible en formato safetensors y GGUF (para Ollama, llama.cpp y LM Studio). Su relevancia actual radica en la tendencia hacia modelos pequeños y eficientes que puedan ejecutarse en dispositivos con recursos limitados, manteniendo un rendimiento útil en tareas específicas como tool calling y razonamiento estructurado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M mencionado, otros disponibles en repositorio GGUF) |
| Idiomas soportados | Inglés, español |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Quipu 0.8B hereda la arquitectura de Qwen3.5-0.8B, un transformer causal denso de 0.8B parámetros con atención estándar. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation), lo que permite ajustar el modelo con un número reducido de parámetros entrenables, manteniendo el resto del modelo congelado. No se especifican detalles sobre el dataset de entrenamiento ni el número de tokens utilizados, pero la model card indica que el ajuste se centra en razonamiento paso a paso, tool calling honesto, identidad consistente y asistencia de código ligera. No se menciona el uso de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y español con instrucciones.
- Razonamiento paso a paso para problemas lógicos simples.
- Tool calling / function calling para integrarse en flujos agénticos (búsqueda web, tareas multi-paso).
- Asistencia básica de código: generación de funciones cortas y fragmentos rápidos.
- Roleplay ligero con consistencia de personaje.
- Despliegue rápido en entornos de bajos recursos (edge, prototipado, inferencia local).

## Casos de uso

- Atención al cliente automatizada en español e inglés: el modelo puede gestionar conversaciones multi-turno con un tono coherente, respondiendo consultas frecuentes y derivando a un agente humano cuando sea necesario. Su tamaño reducido permite ejecutarlo en servidores modestos o incluso en el edge.
- Asistentes de código en entornos de desarrollo: integrado en editores o pipelines de CI/CD, puede generar funciones cortas, explicar fragmentos de código o sugerir correcciones simples, sin el coste de un modelo de gran tamaño.
- Agentes autónomos con tool calling: gracias a su soporte para function calling, puede orquestar búsquedas web, consultas a APIs o acciones multi-paso en tareas como reservas, recordatorios o recopilación de información.
- Prototipado rápido de chatbots: su baja latencia y facilidad de despliegue (vía Ollama o llama.cpp) lo hacen adecuado para validar conceptos de producto sin invertir en infraestructura pesada.
- Dispositivos edge y IoT: al caber en menos de 1 GB en cuantización Q4, puede ejecutarse en Raspberry Pi o dispositivos móviles para asistentes de voz o texto sin conexión.
- Asistente de estudio o aprendizaje: puede explicar conceptos paso a paso, resolver problemas matemáticos simples y mantener un hilo conversacional coherente, útil para aplicaciones educativas ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en FP16, 0,75 GB en int8 y 0,4 GB en int4 (estimación orientativa según el tamaño de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso iGPUs con suficiente memoria compartida). También es viable en CPU con cuantización GGUF.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia baja (del orden de decenas de ms por token en GPU), pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Quipu 0.8B | 752M | No disponible | en, es | Apache 2.0 | safetensors, GGUF |
| Qwen3-0.6B (base de Quipu 0.6B) | 600M aprox. | No disponible | multilingüe | Apache 2.0 | safetensors |
| SmolLM2-1.7B | 1.7B | 8192 (según documentación oficial) | multilingüe | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características técnicas generales.

## Limitaciones y advertencias

- Al ser un modelo de 0.8B, su capacidad de razonamiento complejo es limitada; puede fallar en problemas que requieran múltiples pasos o abstracción avanzada.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en temas poco representados en su entrenamiento.
- Longitud de contexto no especificada: se desconoce la ventana máxima de tokens, lo que puede ser un riesgo para aplicaciones que requieran contextos largos.
- Solo soporta inglés y español; no cubre otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5-0.8B por si existieran restricciones adicionales.
- No hay información sobre sesgos específicos del modelo, pero al ser un fine-tune de Qwen, puede heredar sesgos presentes en el modelo base.
- Para producción, se recomienda validar el comportamiento en tareas reales y considerar un modelo mayor si la precisión es crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quipuai/quipu-0.8b
- Repositorio GGUF: https://huggingface.co/Quipuai/quipu-0.8b-GGUF
- Organización Quipuai: https://huggingface.co/Quipuai
- Repositorio GitHub (no oficial): https://github.com/Ares264/QuipuAI
