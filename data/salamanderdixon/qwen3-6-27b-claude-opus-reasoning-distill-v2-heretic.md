# salamanderDixon/Qwen3.6-27B-Claude-Opus-Reasoning-Distill-v2-heretic

## Resumen

Este modelo es una variante "desensurada" (decensored) del fine-tuning `TeichAI/Qwen3.6-27B-Claude-Opus-Reasoning-Distill-v2`, que a su vez es una destilación de razonamiento de Claude Opus 4.x sobre la base multimodal `Qwen/Qwen3.6-27B`. El autor, salamanderDixon, ha aplicado la técnica de abliteración con la herramienta Heretic v1.4.0 para eliminar los mecanismos de rechazo del modelo original, reduciendo las refusals de 98/100 a 8/100, manteniendo una divergencia KL de 0.0774 respecto al original.

Con 27.356.728.560 parámetros (aproximadamente 27B), es un modelo de tamaño medio-alto que conserva las capacidades multimodales (imagen-texto) de la base Qwen3.6, así como el razonamiento destilado de Claude Opus. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para aplicaciones de producción que requieran generación de texto, código o comprensión visual sin filtros de contenido. La relevancia actual radica en ofrecer una alternativa local de alto rendimiento a modelos propietarios como Claude, con la ventaja de ser completamente abierto y sin censura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivado de Qwen3.6-27B |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en safetensors; se menciona mxfp8 en benchmarks del modelo original) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.6-27B`, una arquitectura transformer multimodal que procesa tanto texto como imágenes. Sobre esta base se realizó un fine-tuning de destilación de razonamiento utilizando los datasets `TeichAI/Claude-Opus-4.6-Reasoning-887x` y `TeichAI/claude-4.5-opus-high-reasoning-250x`, que contienen cadenas de razonamiento generadas por Claude Opus 4.x. El entrenamiento se aceleró con la librería Unsloth y la biblioteca TRL de Hugging Face.

Posteriormente, salamanderDixon aplicó la técnica de abliteración mediante Heretic v1.4.0, que identifica y elimina direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. Los parámetros de abliteración (direction_index 41.77, pesos máximos y mínimos en proyecciones de atención y MLP) se ajustaron para minimizar la divergencia con el modelo original (KL 0.0774) mientras se reducían drásticamente las refusals. No se dispone de información sobre el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de los nombres citados.

## Capacidades

- Generación de texto y razonamiento complejo: destilado de Claude Opus 4.x, muestra cadenas de razonamiento detalladas en tareas de lógica, matemáticas y análisis.
- Comprensión visual: al ser multimodal (image-text-to-text), puede procesar imágenes y responder preguntas sobre su contenido.
- Generación de código: el fine-tuning incluye datos de razonamiento que mejoran la capacidad de escribir y depurar código.
- Escritura creativa: capaz de producir textos narrativos, poéticos o técnicos sin restricciones de contenido.
- Conversación y uso general: apto para diálogos multi-turno y tareas de propósito general.
- Sin censura: la abliteración elimina la mayoría de rechazos, permitiendo generar contenido que otros modelos bloquearían (uso responsable requerido).
- Soporte de tool calling y agentes: no confirmado explícitamente, pero probablemente heredado de la base Qwen3.6 (no verificado en la información disponible).

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en entornos de desarrollo (por ejemplo, como alternativa a Claude Code) para generar código, explicar fragmentos y depurar errores, aprovechando su razonamiento destilado y su licencia Apache 2.0 para uso comercial.
- Análisis de imágenes en producción: al ser multimodal, puede clasificar, describir o extraer información de imágenes en pipelines de visión por computador, por ejemplo en moderación de contenido o documentación automática.
- Escritura creativa sin filtros: autores y creadores de contenido pueden usarlo para generar narrativas, guiones o diálogos sin temor a rechazos por temas sensibles, gracias a la abliteración.
- Razonamiento y resolución de problemas: en entornos educativos o de investigación, puede descomponer problemas complejos en pasos lógicos, similar a lo que haría un modelo de razonamiento de alto nivel.
- Chatbot de atención al cliente: con su capacidad conversacional y de comprensión visual, puede gestionar consultas multi-turno, aunque la longitud de contexto no está documentada, por lo que se recomienda validar su rendimiento con diálogos largos.
- Generación de documentación técnica: puede resumir código, APIs o especificaciones, y generar manuales o guías a partir de entradas de texto o capturas de pantalla.

## Benchmarks y rendimiento

La model card incluye benchmarks del modelo original (TeichAI) comparados con la base Qwen3.6-27B, realizados en precisión mxfp8. No se proporcionan benchmarks específicos para la versión heretic, pero se asume un rendimiento similar dado que la abliteración apenas afecta a las capacidades generales (KL 0.0774).

| Benchmark | Qwen3.6-27B-Claude-Opus-Reasoning-Distill-v2 (original) | Qwen3.6-27B (base) |
|---|---|---|
| ARC (challenge) | 0.665 | 0.647 |
| ARC (easy) | 0.831 | 0.803 |
| BoolQ | 0.910 | 0.910 |
| HellaSwag | 0.790 | 0.773 |
| OpenBookQA | 0.456 | 0.450 |
| PIQA | 0.813 | 0.806 |
| Winogrande | 0.772 | 0.742 |

Además, se reportan métricas de abliteración para este modelo:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0.0774 | 0 (por definicion) |
| Refusals (sobre 100 prompts) | 8 | 98 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 27B parámetros, en fp16 se necesitan aproximadamente 54 GB; en cuantización 8-bit unos 27 GB; en 4-bit unos 14 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no en mediciones oficiales.
- GPU recomendadas: para fp16, una A100 80GB o H100; para 8-bit, una RTX 4090 24GB o A6000; para 4-bit, una RTX 3090 24GB o inferior. No se dispone de datos oficiales de latencia o throughput.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, GGUF o bitsandbytes) puede ejecutarse en GPUs de 16-24 GB, aunque el repo solo contiene safetensors, por lo que habría que convertir los pesos.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (tras conversión a GGUF), Ollama (si se convierte) y Hugging Face Inference Endpoints. No se han probado oficialmente en estas plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Refusals (aprox.) |
|---|---|---|---|---|---|
| Este modelo (heretic) | 27B | No disponible | Apache 2.0 | Sí | 8/100 |
| TeichAI/Qwen3.6-27B-Claude-Opus-Reasoning-Distill-v2 | 27B | No disponible | Apache 2.0 | Sí | 98/100 |
| Qwen/Qwen3.6-27B (base) | 27B | No disponible | Apache 2.0 | Sí | No reportado |

La principal diferencia con el modelo original es la eliminación de rechazos, manteniendo un rendimiento casi idéntico (KL 0.0774). Frente a la base Qwen3.6, el fine-tuning mejora ligeramente en benchmarks como ARC, HellaSwag y Winogrande, gracias a la destilación de razonamiento de Claude Opus. No se dispone de comparaciones con otros modelos de 27B de otras familias.

## Limitaciones y advertencias

- Contenido sin censura: la abliteración elimina los mecanismos de rechazo, lo que puede llevar a generar contenido ofensivo, ilegal o peligroso si no se implementan salvaguardas externas. El uso en producción requiere moderación adicional.
- Alucinaciones: como todo LLM, puede inventar información, especialmente en tareas de razonamiento complejo o con datos no vistos en entrenamiento.
- Longitud de contexto no documentada: se desconoce el límite de tokens de entrada, lo que dificulta planificar aplicaciones con diálogos largos o documentos extensos.
- Idiomas no especificados: no se ha confirmado qué idiomas soporta de forma fiable; probablemente herede el multilingüismo de Qwen, pero no está verificado.
- Sin benchmarks exhaustivos: faltan evaluaciones estándar como MMLU, HumanEval o GSM8K, por lo que el rendimiento en tareas específicas no está cuantificado.
- Riesgo de sesgos: al ser un fine-tuning de un modelo base, puede heredar sesgos de género, raza o ideología presentes en los datos de entrenamiento, y la eliminación de rechazos podría amplificar estos sesgos en las salidas.
- Requisitos de hardware elevados: en fp16 necesita más de 50 GB de VRAM, lo que limita su uso en entornos con GPUs de consumo sin cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salamanderDixon/Qwen3.6-27B-Claude-Opus-Reasoning-Distill-v2-heretic
- Modelo original (TeichAI): https://huggingface.co/TeichAI/Qwen3.6-27B-Claude-Opus-Reasoning-Distill-v2
- Base del modelo: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de razonamiento 1: https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset de razonamiento 2: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Proyecto Heretic: https://heretic-project.org
- Librería Unsloth: https://github.com/unslothai/unsloth
- Artículo sobre Qwen 3.6 27B como reemplazo local de Claude Code: https://codersera.com/blog/qwen-3-6-as-local-claude-code-replacement-2026/
