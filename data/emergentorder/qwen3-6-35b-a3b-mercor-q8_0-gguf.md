# emergentorder/Qwen3.6-35B-A3B-Mercor-Q8_0-GGUF

## Resumen

El modelo `emergentorder/Qwen3.6-35B-A3B-Mercor-Q8_0-GGUF` es una conversión a formato GGUF con cuantización Q8_0 del modelo `mercor/Qwen3.6-35B-A3B-Mercor`, un post-entrenamiento por refuerzo (RL) del modelo base `Qwen/Qwen3.6-35B-A3B` de Alibaba. El trabajo de RL fue realizado por Mercor utilizando el framework SkyRL sobre datasets de la familia APEX-Agents, con el objetivo de optimizar el modelo para tareas de agentes de conocimiento (knowledge work agents). El resultado es un modelo conversacional y orientado a agentes, con licencia Apache 2.0, que se distribuye en formato GGUF para su uso con llama.cpp y herramientas compatibles como Ollama.

La arquitectura es de tipo mixture-of-experts (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos, lo que permite un rendimiento eficiente en inferencia. Al estar cuantizado en Q8_0, el archivo pesa aproximadamente 35-40 GB, lo que requiere hardware con suficiente VRAM. Este modelo es relevante para desarrolladores que buscan ejecutar localmente un modelo de agentes con capacidades de razonamiento y tool calling, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer |
| Parametros totales | 35 mil millones |
| Parametros activos | 3 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (esta conversion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-35B-A3B` emplea una arquitectura transformer con capas MoE, donde solo 3 mil millones de parámetros se activan por token, lo que reduce el coste computacional en inferencia. Sobre esta base, Mercor aplicó un post-entrenamiento por refuerzo utilizando el framework SkyRL, entrenando sobre datasets de la familia APEX-Agents. Este proceso de RL se describe en el blog de Mercor como una guía de entrenamiento de 397B pasos, orientada a mejorar las capacidades del modelo para tareas de agentes de conocimiento, como razonamiento multi-paso, uso de herramientas y planificación. No se han proporcionado detalles adicionales sobre la composición exacta del dataset ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y respuestas contextuales.
- Razonamiento multi-paso y planificación, optimizado mediante RL para tareas de agentes.
- Soporte de tool calling / function calling, probablemente heredado del modelo base Qwen3.6.
- Capacidad de procesar entradas de imagen y texto (según el pipeline `image-text-to-text`), aunque no se especifican detalles de la implementación multimodal.
- Orientado a agentes de conocimiento, con potencial para integración en flujos de trabajo automatizados.
- Multilingüismo: no se han publicado los idiomas soportados.

## Casos de uso

- Agentes de atención al cliente: el modelo puede gestionar conversaciones multi-turno y derivar consultas a herramientas externas mediante tool calling, gracias a su entrenamiento RL orientado a agentes.
- Automatización de tareas de oficina: integración en pipelines que requieren extracción de información, resumen de documentos o generación de informes, aprovechando su capacidad de razonamiento.
- Asistentes de programación: uso en entornos de desarrollo local para revisión de código, generación de parches o autocompletado, con soporte de tool calling para interactuar con repositorios.
- Análisis de datos: el modelo puede procesar tablas y gráficos (si la entrada multimodal está activa) y generar explicaciones o conclusiones.
- Búsqueda y recuperación de información: combinado con herramientas de búsqueda, puede actuar como agente que consulta bases de conocimiento y sintetiza respuestas.
- Prototipado de agentes autónomos: debido a su licencia Apache 2.0 y formato GGUF, es adecuado para experimentar con arquitecturas de agentes en entornos locales o en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo `Qwen3.6-35B-A3B-Mercor` en la información disponible. Los benchmarks del modelo base `Qwen3.6-35B-A3B` (como MMLU, HumanEval, GSM8K) no se han incluido en la documentación proporcionada. Se recomienda consultar la guía de Qwen 3.6 en insiderllm.com para obtener datos comparativos del modelo base, aunque no se dispone de ellos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia con cuantización Q8_0: aproximadamente 35-40 GB, ya que el archivo GGUF Q8_0 almacena los pesos en 8 bits por parámetro.
- GPU recomendadas: NVIDIA A100 40GB, A100 80GB, H100, o GPUs con 48 GB o más de VRAM. Una RTX 4090 (24 GB) no es suficiente para Q8_0, pero sí para cuantizaciones inferiores como Q4_K_M o Q5_K_S.
- Opciones de despliegue: llama.cpp, Ollama (que ya ofrece `qwen3.6:35b-a3b-q8_0`), vLLM (con soporte para GGUF limitado, mejor usar el formato original safetensors), y TGI.
- Latencia y throughput: no disponibles. Al ser un MoE con 3B activos, la velocidad de generación es superior a la de un modelo denso de 35B, pero depende del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mercor (este) | 35B | 3B | no disponible | Apache 2.0 | GGUF |
| Qwen3.6-35B-A3B (base) | 35B | 3B | no disponible | Apache 2.0 | safetensors, GGUF |
| Qwen3-30B-A3B (generación anterior) | 30B | 3B | 128K | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La principal diferencia entre el modelo Mercor y el base es el post-entrenamiento RL, que debería mejorar el rendimiento en tareas de agentes, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de alucinaciones para este modelo específico. Como todo modelo de lenguaje, puede generar contenido falso o inventado.
- La longitud de contexto no está documentada; se recomienda verificar la del modelo base Qwen3.6-35B-A3B antes de usarlo en aplicaciones que requieran ventanas largas.
- El pipeline `image-text-to-text` sugiere capacidades multimodales, pero no se ha confirmado si el modelo procesa realmente imágenes o si es solo una etiqueta heredada.
- La cuantización Q8_0 mantiene una buena fidelidad, pero puede degradar ligeramente el rendimiento en comparación con el modelo en precisión completa.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los datasets de entrenamiento (APEX-Agents) no tengan restricciones adicionales.
- Al ser una conversión de un modelo post-entrenado por RL, el comportamiento puede diferir del modelo base en tareas no relacionadas con agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emergentorder/Qwen3.6-35B-A3B-Mercor-Q8_0-GGUF
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo Mercor original: https://huggingface.co/mercor/Qwen3.6-35B-A3B-Mercor
- Blog de Mercor sobre SkyRL: https://www.mercor.com/blog/training-frontier-knowledge-work-agents-a-397b-rl-training-guide-with-skyrl
- Guía de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Artículo sobre agentic coding con Qwen3.6-35B-A3B: https://dev.to/software_mvp-factory/agentic-coding-with-small-open-models-running-qwen36-35b-a3b-locally-for-code-review-1oj8
- Página de Ollama para qwen3.6:35b-a3b-q8_0: https://ollama.com/library/qwen3.6:35b-a3b-q8_0
