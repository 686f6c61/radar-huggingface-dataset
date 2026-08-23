# KordAI/Film-GPT-Instruct

## Resumen
Film-GPT-Instruct es un modelo de lenguaje fino-ajustado por KordAI, una organización con presencia en Hugging Face. Está construido a partir de la base `unsloth/qwen3-4b-base-unsloth-bnb-4bit`, es decir, una versión cuantizada en 4 bits del modelo Qwen3 de 4 mil millones de parámetros de Alibaba. El ajuste se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (Transformer Reinforcement Learning) de Hugging Face, lo que lo orienta a seguir instrucciones y mantener conversaciones.

El modelo está diseñado para resolver tareas de generación de texto con instrucciones, con un enfoque en diálogos y preguntas de reflexión. Su relevancia reside en que ofrece una alternativa ligera y ajustada para desarrolladores que necesitan un modelo de instrucciones de tamaño medio, con un peso de solo 0.8 GB en su formato de repositorio, lo que facilita su despliegue en entornos con recursos limitados. Sin embargo, la documentación pública es mínima y no incluye detalles sobre el dataset de entrenamiento, la licencia o los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B) |
| Parametros totales | 4 mil millones (aprox., segun base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (base Qwen3 soporta hasta 32k tokens, pero no confirmado para este ajuste) |
| Tipos de cuantizacion | 4 bits (bnb-4bit) en la base; el repo contiene safetensors |
| Idiomas soportados | no disponible (base Qwen3 es multilingue, incluye espanol, pero no confirmado) |
| Licencia | no disponible (en la model card se indica "license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de un transformer decoder-only con atención causal, en su variante de 4 mil millones de parámetros de la familia Qwen3. El modelo base fue cuantizado a 4 bits (bitsandbytes) para el entrenamiento, y posteriormente se aplicó un ajuste fino supervisado (SFT) mediante la librería TRL. El proceso de entrenamiento se llevó a cabo con el framework Transformers, PyTorch y la librería de datasets de Hugging Face, aunque no se han publicado detalles sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje ni la composición del corpus.

La innovación técnica se hereda de la arquitectura Qwen3, que incluye atención con RoPE (Rotary Positional Embeddings), pero el ajuste de KordAI no introduce modificaciones arquitectónicas propias. El modelo se presenta como una versión instructa de la base, con capacidad de seguir instrucciones en formato de diálogo.

## Capacidades
- Generación de texto instructivo: responde a preguntas y solicitudes en formato conversacional, como se muestra en el ejemplo de la model card.
- Formato de diálogo multi-turno: el ejemplo de código usa `[{"role": "user", "content": ...}]`, lo que indica soporte para conversaciones estructuradas.
- Razonamiento básico: el ejemplo de la model card es una pregunta de reflexión filosófica, lo que sugiere capacidad de razonamiento general.
- Capacidades multilingües: no confirmadas, pero la base Qwen3 es multilingüe (incluye español, inglés, chino, etc.), por lo que probablemente hereda esta capacidad.
- Tool calling y agentes: no confirmado en la documentación; la base Qwen3 soporta tool calling, pero el ajuste podría no haberlo preservado.

## Casos de uso
- Chatbots de atención al cliente: el modelo puede gestionar conversaciones de soporte básico en español e inglés, gracias a su formato de diálogo y su capacidad de seguir instrucciones. Su tamaño reducido permite desplegarlo en un servidor con una GPU de gama media.
- Asistentes de escritura creativa: puede generar respuestas a preguntas abiertas, como la del ejemplo, útil para generar ideas para guiones, historias o diálogos.
- Clasificación de texto y análisis de sentimiento: aunque no está optimizado para ello, puede adaptarse con un ajuste adicional para tareas de clasificación de reseñas o comentarios.
- Generación de preguntas para entrevistas o quizzes: su capacidad de respuesta a preguntas abiertas se puede explotar para generar contenido educativo.
- Prototipos de investigación en NLP: sirve como base para experimentos de fine-tuning con SFT, ya que el código de entrenamiento es sencillo y el modelo es ligero.
- Despliegue en entornos con restricciones de recursos: con 0.8 GB de peso, es viable en CPUs o GPUs de bajo consumo, ideal para pruebas locales o aplicaciones edge.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta ninguna evaluación en la model card ni en el repositorio, por lo que no es posible comparar su rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada: para inferencia en 4 bits, se estima entre 2-4 GB de VRAM, dado el tamaño base de 4B parámetros. Para fp16, se necesitarían alrededor de 8 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para una inferencia fluida; una RTX 4090 o A100 para mayor velocidad.
- Consumer GPU: sí, cabe en GPUs de consumo como la RTX 3090 o RTX 4060 Ti con 8 GB.
- Opciones de despliegue: se puede usar con Transformers pipeline (como en el ejemplo), vLLM, TGI, Ollama (si se convierte a GGUF), y llama.cpp.
- Latencia y throughput: no disponible; se estima una latencia de entre 100-300 ms por token en una RTX 3090, pero sin datos confirmados.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Film-GPT-Instruct | 4B (base) | no disponible | no disponible | Instructo |
| Qwen3-4B-Instruct (oficial) | 4B | 32k | Apache 2.0 | Instructo |
| Llama-3.2-3B-Instruct | 3B | 128k | Llama 3.2 license | Instructo |
| Phi-3-mini-instruct | 3.8B | 128k | MIT | Instructo |

Comparado con el Qwen3-4B-Instruct oficial, el modelo de KordAI es un ajuste de la base, por lo que su rendimiento probablemente sea inferior al del instruct oficial, que fue entrenado con datos mas completos. Llama-3.2-3B y Phi-3-mini tienen ventana de contexto mayor y licencias más permisivas. La ventaja de Film-GPT-Instruct es su tamaño reducido y su enfoque especifico, pero no hay datos que respalden su calidad.

## Limitaciones y advertencias
- Sin licencia clara: la model card indica "license" sin especificar, lo que impide su uso comercial sin riesgo legal.
- Datos de entrenamiento desconocidos: no se sabe qué dataset se usó, por lo que puede contener sesgos o datos de baja calidad.
- Alucinaciones: como modelo pequeño, es propenso a generar respuestas incorrectas o inventadas en temas complejos.
- Contexto limitado: no se ha confirmado la longitud de contexto, pero la base Qwen3 tiene 32k; el ajuste podría reducirla.
- Soporte de idioma incierto: aunque la base es multilingüe, no se confirma si el ajuste preserva el español o otros idiomas.
- No apto para tareas críticas: sin benchmarks, no se puede recomendar para tareas de alta precisión como diagnóstico médico o legal.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/KordAI/Film-GPT-Instruct)
- [Base del modelo: unsloth/qwen3-4b-base-unsloth-bnb-4bit](https://huggingface.co/unsloth/qwen3-4b-base-unsloth-bnb-4bit)
- [TRL (Transformers Reinforcement Learning)](https://github.com/huggingface/trl)
- [Perfil de KordAI en Hugging Face](https://huggingface.co/KordAI)
