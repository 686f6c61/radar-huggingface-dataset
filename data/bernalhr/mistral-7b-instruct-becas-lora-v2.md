# BernalHR/mistral-7b-instruct-becas-lora-v2

## Resumen

El modelo `BernalHR/mistral-7b-instruct-becas-lora-v2` es un ajuste fino (fine-tuning) mediante LoRA del modelo base `unsloth/mistral-7b-instruct-v0.3-bnb-4bit`, que a su vez es una versión cuantizada de Mistral 7B Instruct v0.3. Desarrollado por BernalHR, este modelo está orientado al dominio de las becas, como sugiere el nombre "becas", aunque la model card no especifica el conjunto de datos ni el propósito exacto. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning y reduce el uso de memoria.

El modelo conserva la arquitectura original de Mistral 7B, con 7 mil millones de parámetros y una ventana de contexto de 32 768 tokens. Se distribuye en formato safetensors y está pensado para su uso con transformers y text-generation-inference. Su relevancia radica en ser un ejemplo de adaptación eficiente de un modelo de propósito general a un dominio específico, con un tamaño de repositorio de solo 0.2 GB, lo que indica que se trata de un adaptador LoRA de bajo peso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (GQA) y Sliding Window Attention (SWA) |
| Parametros totales | 7 000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (según Mistral 7B v0.3) |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó en 4 bits, pero el adaptador se publica en safetensors; no se especifica la precisión de los pesos) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Mistral 7B Instruct v0.3, que emplea una arquitectura transformer decoder-only con 32 capas, 32 cabezas de atención y dimensiones ocultas de 4096. Incorpora Grouped-Query Attention (GQA) para acelerar la inferencia y Sliding Window Attention (SWA) con una ventana de 4096 tokens, lo que permite manejar contextos largos de forma eficiente. El fine-tuning se realizó mediante LoRA (Low-Rank Adaptation), una técnica que entrena un pequeño número de parámetros adicionales mientras congela el modelo base, reduciendo drásticamente los requisitos de memoria y tiempo de entrenamiento. La librería Unsloth se utilizó para optimizar el proceso, logrando un entrenamiento aproximadamente 2 veces más rápido que los métodos convencionales.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. El modelo base ya incluía instrucciones y había sido alineado para seguir indicaciones, por lo que el adaptador LoRA probablemente ajusta el comportamiento hacia el dominio de las becas, aunque no se especifica en la documentación.

## Capacidades

- Generación de texto y respuesta a instrucciones, heredadas del modelo base Mistral 7B Instruct v0.3.
- Razonamiento y comprensión de lenguaje natural en inglés.
- Capacidad de seguir instrucciones en formato conversacional (chat).
- Soporte de tool calling y function calling, disponible en Mistral 7B v0.3.
- Capacidades de generación de código y matemáticas, propias del modelo base.
- Posible especialización en el dominio de becas, aunque no se detalla en la model card.

## Casos de uso

- Asistente para solicitudes de becas: el modelo puede responder preguntas sobre requisitos, plazos y documentación necesaria, gracias a su capacidad de seguir instrucciones y su posible ajuste al dominio.
- Clasificación de elegibilidad: dado un perfil de estudiante, el modelo puede evaluar si cumple los criterios de una beca concreta, basándose en su conocimiento del dominio (si el fine-tuning incluyó datos de becas).
- Redacción de cartas de motivación: puede generar borradores de cartas personalizadas para solicitudes de becas, aprovechando su capacidad de generación de texto.
- Chatbot de orientación educativa: integrado en un sitio web de una universidad o fundación, puede atender consultas frecuentes sobre becas y ayudas al estudio.
- Análisis de convocatorias: puede resumir y extraer información clave de documentos de convocatorias de becas, gracias a su ventana de contexto de 32k tokens.
- Generación de preguntas frecuentes: puede crear contenido de FAQ sobre becas a partir de documentación existente, reduciendo el trabajo manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Mistral 7B Instruct v0.3 tiene resultados conocidos (por ejemplo, MMLU 60.1%, HumanEval 30.5%, GSM8K 52.5% según la documentación de Mistral), pero el adaptador LoRA no ha sido evaluado en estos conjuntos. No se dispone de datos de rendimiento específicos para este fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B, se requieren aproximadamente 14 GB en FP16, 7 GB en 8 bits y 4 GB en 4 bits. El adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM para cuantización 8 bits (por ejemplo, RTX 3070, RTX 4060 Ti), o 16 GB para FP16 (RTX 4090, A100). Para despliegue en producción, se recomienda A100 o H100.
- Sí cabe en GPUs de consumo: con cuantización 4 bits, puede ejecutarse en una RTX 3060 de 12 GB o similar.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, text-generation-inference y transformers. Al ser un adaptador LoRA, debe cargarse junto con el modelo base.
- Latencia y throughput: no disponibles. Se estima una latencia de decodificación de unos 20-30 tokens/s en una RTX 4090 con cuantización 4 bits, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BernalHR/mistral-7b-instruct-becas-lora-v2 | 7B | 32k | Apache 2.0 | Fine-tuning LoRA para becas, sin benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Modelo base, con benchmarks conocidos |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32k | Apache 2.0 | Versión anterior, similar en capacidades |

La comparativa se limita a los modelos base de Mistral, ya que no hay otros fine-tunes de becas con información pública. El adaptador LoRA no modifica la arquitectura ni el tamaño, por lo que el rendimiento en tareas generales debería ser similar al del modelo base, con una posible mejora en el dominio específico de becas (no verificada).

## Limitaciones y advertencias

- No se dispone de información sobre el conjunto de datos de entrenamiento, por lo que se desconoce si el modelo tiene sesgos específicos del dominio de becas o si presenta alucinaciones en información normativa.
- El modelo está entrenado principalmente en inglés, por lo que su rendimiento en español u otros idiomas puede ser limitado.
- Al ser un adaptador LoRA de pequeño tamaño (0.2 GB), es probable que el fine-tuning haya sido realizado con un conjunto de datos reducido, lo que puede limitar su generalización.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que el modelo base (Mistral 7B) cumple con los términos de uso de Mistral AI.
- No se han publicado evaluaciones de seguridad o robustez, por lo que no se recomienda su uso en producción sin una validación adicional.
- El modelo no es multimodal; solo procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BernalHR/mistral-7b-instruct-becas-lora-v2
- Modelo base (unsloth/mistral-7b-instruct-v0.3-bnb-4bit): https://huggingface.co/unsloth/mistral-7b-instruct-v0.3-bnb-4bit
- Mistral 7B Instruct v0.3 (original): https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Documentación de Mistral 7B: https://docs.mistral.ai/models/mistral-7b-0-2
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
