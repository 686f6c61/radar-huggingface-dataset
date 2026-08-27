# SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch2.26

## Resumen

El modelo `SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch2.26` es un fine-tuning del modelo vision-language Qwen2.5-VL-3B, publicado por el usuario SaFD-00 en HuggingFace. El nombre del checkpoint sugiere que forma parte de una serie de experimentos orientados al desarrollo de "modelos de mundo" (world models) para agentes, con la etiqueta "ac" que podría referirse a "agentic" o "action-conditioned", aunque no se dispone de documentación oficial que lo confirme. El modelo está entrenado con la librería llama-factory y se presenta como un checkpoint intermedio (stage1, full fine-tuning, epoch 2.26) dentro de un pipeline de entrenamiento más amplio.

Con 3.754.622.976 parámetros (aproximadamente 3,75 mil millones), este modelo hereda la arquitectura multimodal de Qwen2.5-VL, capaz de procesar texto e imágenes. La relevancia de este checkpoint radica en su naturaleza experimental: al ser un modelo de mundo en fase inicial, puede servir como base para investigaciones sobre razonamiento espacial, planificación y comprensión de entornos visuales. Sin embargo, la ausencia de documentación detallada, benchmarks publicados y una licencia clara limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (vision-language transformer, basada en Qwen2.5) |
| Parametros totales | 3.754.622.976 (3,75 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-VL-3B, presumiblemente 32.768 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo se observan pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-VL soporta múltiples idiomas, pero no se especifica para este checkpoint) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 7,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL, un modelo multimodal que combina un codificador visual (ViT) con un transformer de lenguaje (Qwen2.5). El modelo procesa imágenes y texto de forma conjunta, permitiendo tareas como respuesta a preguntas visuales, OCR, localización de objetos y razonamiento multimodal. El checkpoint presentado es un fine-tuning completo (full fine-tuning) de la versión de 3B, realizado con la herramienta llama-factory, como indican las etiquetas del repositorio.

El nombre "world-model-stage1" sugiere que el entrenamiento forma parte de un esquema por etapas para construir un modelo de mundo, probablemente con datos que incluyen interacciones agente-entorno. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint corresponde a la época 2.26 de la primera etapa, lo que indica que el entrenamiento aún no ha convergido completamente o que se detuvo de forma intermedia para evaluación.

## Capacidades

- Generación de texto y respuesta a preguntas visuales: al estar basado en Qwen2.5-VL, conserva las capacidades de comprensión de imágenes y texto del modelo base.
- Razonamiento multimodal: puede combinar información visual y textual para responder consultas complejas.
- Posible capacidad de modelado de mundo: el nombre del checkpoint sugiere que ha sido entrenado para predecir estados futuros o dinámicas de entornos, aunque no hay evidencia pública de ello.
- Soporte de tool calling: no confirmado para este checkpoint específico, aunque el modelo base Qwen2.5-VL lo soporta.
- Capacidades multilingües: no documentadas para este fine-tuning, aunque el modelo base soporta varios idiomas.

## Casos de uso

- Investigación en modelos de mundo: este checkpoint puede utilizarse como punto de partida para estudiar cómo los modelos vision-language aprenden representaciones del entorno, especialmente en entornos simulados o robóticos.
- Fine-tuning posterior: al ser un checkpoint intermedio, puede servir para continuar el entrenamiento (stage2) o para adaptarlo a tareas específicas de agente visual.
- Evaluación de transferencia: los investigadores pueden comparar el rendimiento de este modelo frente al Qwen2.5-VL-3B base en tareas de razonamiento espacial o planificación.
- Prototipado de agentes visuales: aunque no está listo para producción, puede usarse en entornos de investigación para probar pipelines de agentes que requieran comprensión de imágenes.
- Análisis de representaciones internas: útil para estudios de interpretabilidad sobre cómo se codifican las relaciones espaciales y causales en modelos multimodales.
- Benchmarking de fine-tunings experimentales: sirve como ejemplo de un entrenamiento con llama-factory y puede compararse con otros checkpoints del mismo autor (variantes de 7B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de tareas visuales. Tampoco se proporcionan comparativas con el modelo base o con otros modelos de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,75 B parámetros en precisión fp32, se necesitan aproximadamente 15 GB de VRAM. Con cuantización a 8 bits, unos 8 GB; a 4 bits, unos 4-5 GB.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o una A10G/A100 (24-40 GB) para inferencia cómoda en fp16. Para cuantización 4-bit, una RTX 3060 (12 GB) podría ser suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantización. En fp16 completa, requiere una GPU de gama alta (24 GB o más).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no disponibles. Dependen del hardware y de la optimización (p. ej., vLLM con paged attention).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-VL-3B (base) | 3,75 B | 32.768 (según informe técnico) | Apache 2.0 (Qwen) | HuggingFace oficial |
| SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch2.26 | 3,75 B | no disponible | no disponible | HuggingFace (repo del autor) |
| SaFD-00/qwen2.5-vl-7b-ac-stage1-full-world-model-epoch3 | 7 B aprox. | no disponible | no disponible | HuggingFace (repo del autor) |

No se dispone de datos de rendimiento comparativos. El modelo base Qwen2.5-VL-3B tiene benchmarks publicados en el informe técnico de Qwen2.5-VL, pero este checkpoint no los reporta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un fine-tuning de un modelo base, puede heredar sesgos de Qwen2.5-VL, pero no hay análisis específico.
- Riesgo de alucinación: alto en tareas visuales si el modelo no ha sido entrenado con datos suficientes para el dominio objetivo. Al ser un checkpoint intermedio, su fiabilidad es menor que la del modelo base.
- Limitaciones de contexto e idioma: no especificadas. Se asume que hereda las del modelo base, pero no hay confirmación.
- Restricciones de licencia: la licencia no está indicada. Esto impide su uso comercial sin verificación previa con el autor.
- Adecuación para producción: no recomendado. Es un checkpoint experimental sin documentación, sin benchmarks y sin garantías de calidad.
- Riesgo de sobreajuste: al ser un fine-tuning completo con pocas épocas (2.26), podría estar subentrenado o sobreajustado a un dataset específico no revelado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch2.26
- Checkpoint similar (epoch 1): https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-stage1-full-epoch1
- Variante 7B (stage1): https://huggingface.co/SaFD-00/qwen2.5-vl-7b-ac-stage1-full-world-model-epoch3
- Variante 7B (stage2, en FriendliAI): https://friendli.ai/models/SaFD-00/qwen2.5-vl-7b-ac-2-world-model-stage1-full-epoch3-stage2-lora-epoch3
- Informe técnico de Qwen2.5-VL (arXiv): https://arxiv.org/abs/2502.13923
