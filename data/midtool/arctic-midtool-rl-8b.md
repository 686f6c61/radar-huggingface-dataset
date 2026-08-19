# MidTool/Arctic-MidTool-RL-8B

## Resumen

MidTool/Arctic-MidTool-RL-8B es un modelo de lenguaje de 8.190 millones de parámetros desarrollado por MidTool, basado en la arquitectura Qwen3 y fine-tuneado con técnicas de aprendizaje por refuerzo (RL) sobre el modelo base MidTool/Arctic-MidTool-MT-8B, que a su vez proviene de la serie Arctic de Snowflake AI Research. El modelo está especializado en uso de herramientas (tool-use), llamada a funciones (function-calling), razonamiento agéntico y conversación, lo que lo convierte en una opción relevante para construir asistentes y agentes que interactúan con APIs externas o ejecutan tareas multi-paso.

El acceso al modelo está restringido (gated) y requiere aceptar condiciones en HuggingFace. Aunque se publica bajo licencia Apache 2.0, su disponibilidad en producción está condicionada a la aprobación del autor. El checkpoint RL es el resultado de aplicar un proceso de refuerzo sobre el modelo base de 8B, con un dataset propio llamado MidTool-Mix. A día de hoy no se han publicado benchmarks ni especificaciones detalladas de contexto o idiomas, lo que limita la evaluación objetiva de sus capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3) |
| Parámetros totales | 8.190.735.360 (8,19B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos completos en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3, un transformer denso de 8B parámetros. El checkpoint base es MidTool/Arctic-MidTool-MT-8B, que a su vez deriva de la serie de modelos de Snowflake AI Research. El proceso de entrenamiento consistió en un fine-tuning con aprendizaje por refuerzo (RL) sobre el dataset MidTool/MidTool-Mix, diseñado específicamente para potenciar capacidades de tool-use, function-calling y razonamiento agente. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF más allá de la etiqueta "reinforcement-learning".

## Capacidades

- Generación de texto conversacional y de instrucción.
- Tool-use y function-calling: capaz de invocar herramientas externas y APIs mediante llamadas estructuradas.
- Razonamiento agente multi-paso: orientado a tareas que requieren planificación y ejecución secuencial de acciones.
- Interacción conversacional en entornos de chat y asistentes virtuales.
- Compatible con pipelines de text-generation de Transformers y text-generation-inference (TGI).
- Integración con entornos de despliegue compatibles con endpoints (según tags).

## Casos de uso

- Asistentes virtuales con acceso a herramientas: el modelo puede gestionar conversaciones multi-turno y realizar llamadas a APIs para consultar datos, reservar citas o ejecutar acciones en sistemas externos.
- Agentes autónomos de automatización: puede integrarse en pipelines de RPA o flujos de trabajo que requieran tomar decisiones y ejecutar funciones de forma encadenada.
- Generación de código con integración en CI/CD: gracias a su soporte de function-calling, puede usarse en pipelines que generen y ejecuten código de forma controlada.
- Soporte técnico automatizado: puede gestionar incidencias, consultar bases de conocimiento y escalar casos mediante llamadas a sistemas de ticketing.
- Análisis de datos con llamadas a APIs: puede combinar generación de texto con consultas a bases de datos o servicios web para producir informes.
- Desarrollo de asistentes de voz o texto con integración de servicios: permite encadenar acciones como enviar emails, crear eventos o gestionar recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento en MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: con 8,19B parámetros en fp16, la inferencia requiere aproximadamente 16 GB de VRAM; en cuantización de 4 bits podría reducirse a unos 4-5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090 o superiores para ejecución en fp16; GPU consumer de 16 GB (como RTX 4080) pueden ejecutarlo con cuantización.
- Compatibilidad con consumer GPU: sí, con cuantización adecuada (GGUF o similar) podría ejecutarse en tarjetas de 8-12 GB, pero no hay versiones cuantizadas oficiales.
- Opciones de despliegue: compatible con Transformers (Hugging Face), text-generation-inference (TGI) y endpoints; también puede usarse con llama.cpp u Ollama si se convierte a GGUF, pero no se proporcionan archivos de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MidTool/Arctic-MidTool-RL-8B | 8,19B | No disponible | Apache 2.0 | Gated |
| MidTool/Arctic-MidTool-MT-4B | 4B (aprox.) | No disponible | Apache 2.0 | No gated (según repos de fan-shu) |
| Mistral Ministral 8B | 8B | No disponible | Apache 2.0 (probable) | Público |

No se dispone de datos de benchmarks comparativos entre estos modelos. El Arctic-MidTool-MT-4B es la versión de menor tamaño de la misma serie, pero no se han publicado métricas de rendimiento.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, requiere aceptar condiciones en HuggingFace antes de su uso, lo que limita su adopción inmediata.
- Idiomas soportados no especificados: no se indica qué idiomas maneja correctamente; puede tener sesgo hacia inglés o lenguas del dataset de entrenamiento.
- Longitud de contexto desconocida: no se ha publicado la ventana de contexto, lo que impide evaluar su uso en tareas de contexto largo.
- Riesgo de alucinación: como todo LLM, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo.
- Sesgos de entrenamiento: el dataset MidTool-Mix no está documentado, por lo que no se pueden evaluar sesgos potenciales.
- Para producción, se recomienda realizar pruebas exhaustivas y considerar la cuantización para despliegue en GPU consumer, pero no hay versiones cuantizadas oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MidTool/Arctic-MidTool-RL-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/MidTool/MidTool-Mix
- Modelo base (MT-8B): https://huggingface.co/MidTool/Arctic-MidTool-MT-8B
- Repos de la serie 4B (fan-shu): https://huggingface.co/fan-shu/Arctic-MidTool-MT-4B y https://huggingface.co/fan-shu/Arctic-MidTool-MT-4B-finetoolv2-sft779
- Tutorial de RAG con Mistral Ministral 8B y Snowflake Arctic Embed (no relacionado directamente): https://zilliz.com/tutorials/rag/langchain-and-faiss-and-mistral-ai-ministral-8b-and-ollama-snowflake-arctic-embed
