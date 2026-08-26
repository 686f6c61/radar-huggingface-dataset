# cogarobotics/finegrained-grpo-highag-0825

## Resumen

El modelo `cogarobotics/finegrained-grpo-highag-0825` es un fine-tuning de la familia Gemma 3, desarrollado por el equipo de cogarobotics. Se trata de un checkpoint destinado a tareas de generación de respuestas evaluadas en un pipeline de RAG (retrieval-augmented generation), como indica el tag `rag` y el nombre del dataset de salida que menciona la model card (`test_data_HIGHAG_VLLM_0825_answers_evaluated_openai_gpt_5_4`). El repositorio contiene tanto el adaptador LoRA (`adapter/`) como el modelo fusionado (`merged/`), pensado para servir directamente con vLLM.

El modelo se construye sobre un checkpoint base de `CELL-LAB/lora-plus-f2f-backup`, que a su vez parece derivar de Gemma 3. Se ha entrenado con el método **GRPO** (Group Relative Policy Optimization), una técnica de optimización de política que se ha popularizado para alinear modelos con preferencias humanas o con recompensas externas sin necesidad de un crítico entrenado. La referencia a `siheung` en los tags sugiere que el entrenamiento pudo realizarse en infraestructura de esa localización coreana, aunque no hay confirmación oficial.

El modelo está pensado para despliegue en producción con vLLM, con una longitud de contexto máxima de 8192 tokens según los comandos de la model card. No se ha publicado información sobre licencia, idiomas soportados ni parámetros totales, por lo que gran parte de la ficha técnica queda pendiente de confirmación por parte del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, variante no especificada) |
| Parámetros totales | no disponible (el repositorio ocupa 24,9 GB, lo que sugiere una variante de 12B o 27B en bf16) |
| Parámetros activos | no disponible |
| Longitud de contexto | 8192 tokens (según la configuración de vLLM recomendada) |
| Tipos de cuantización | bfloat16 (formato de los pesos en `merged/`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo fusionado) y adaptador LoRA |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de la familia Gemma 3, arquitectura transformer basada en atención. Se ha entrenado mediante **GRPO** (Group Relative Policy Optimization), un algoritmo de optimización de política que agrupa respuestas generadas por el modelo y las compara con un criterio de recompensa para actualizar los pesos. Este método se ha utilizado con éxito para mejorar razonamiento y alineación en modelos de código y lenguaje.

La model card indica que se usó un adaptador LoRA (`adapter/`) durante el entrenamiento, que luego se fusionó en el modelo completo (`merged/`). El entrenamiento parece estar orientado a tareas de **RAG** (retrieval-augmented generation), probablemente para mejorar la calidad de respuestas en contextos donde se inyectan documentos recuperados. El dataset generado con este modelo (`test_data_HIGHAG_VLLM_0825_answers_evaluated_openai_gpt_5_4`) sugiere que se utilizó como evaluador o generador de respuestas para un pipeline de evaluación automática con GPT-5.4.

No se proporciona información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como SFT previa o DPO.

## Capacidades

- Generación de texto con soporte para contexto largo (hasta 8192 tokens en la configuración recomendada).
- Fine-tuning orientado a tareas de RAG: puede generar respuestas basadas en documentos recuperados.
- Compatible con vLLM para despliegue eficiente en producción.
- Capacidades de razonamiento mejoradas mediante GRPO, aunque no se especifican benchmarks.
- Soporte de LoRA para workflows de adaptación ligera.
- Integración con el ecosistema transformers (librería `transformers`).

## Casos de uso

- **Sistemas de respuesta a preguntas con recuperación (RAG)**: el modelo está diseñado para generar respuestas cuando se le proporcionan fragmentos de documentos recuperados. Puede usarse en chatbots de atención al cliente que consultan bases de conocimiento internas.
- **Evaluación automática de respuestas**: la model card indica que se usó para generar respuestas evaluadas posteriormente por GPT-5.4. Puede servir como generador de candidatos en pipelines de evaluación de LLMs.
- **Despliegue de servicio de inferencia con vLLM**: dado que se recomienda vLLM 0.8.1 y el modelo fusionado está en formato safetensors, se puede servir como un endpoint OpenAI-compatible para aplicaciones internas.
- **Fine-tuning posterior con LoRA**: el adaptador disponible permite continuar el entrenamiento de forma eficiente sobre nuevas tareas.
- **Generación de respuestas en español**: aunque no se especifican los idiomas, al ser un modelo base Gemma 3, es probable que mantenga las capacidades multilingües de la familia, incluido el español.
- **Prototipado de agentes con búsqueda**: con la ventana de 8192 tokens y el entrenamiento en RAG, puede integrarse en agentes que recuperen información de una base vectorial antes de responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación, y los resultados de búsqueda no ofrecen datos adicionales sobre el rendimiento del modelo en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: con 24,9 GB de pesos en bf16, se necesita al menos 32 GB de VRAM para inferencia con la configuración recomendada (max-model-len 8192). En cuantización de 8 bits o 4 bits podría reducirse a ~12-16 GB, pero no hay oficialmente cuantizaciones publicadas.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100 (80 GB), o GPU de consumo como RTX 4090 (24 GB) en cuantización de 8 bits o menor.
- **Compatibilidad con consumer GPU**: sí, en RTX 4090 o RTX 3090 con cuantización de 8 bits, aunque la configuración oficial de vLLM en bf16 requiere más VRAM de la que disponen estas tarjetas.
- **Opciones de despliegue**: vLLM (recomendado, con comando `vllm serve`), y potencialmente llama.cpp u Ollama si se convierten los pesos a GGUF.
- **Latencia y throughput**: no disponibles. Con vLLM y una GPU A100 se espera un throughput típico de decenas de tokens por segundo, pero no hay datos publicados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `cogarobotics/finegrained-grpo-highag-0825` | no disponible | 8192 | no disponible | Fine-tuning GRPO de Gemma 3, orientado a RAG |
| `google/gemma-3-12b-it` | 12B | 8192 | Gemma Terms | Modelo base de la familia Gemma 3, instruct |
| `google/gemma-3-27b-it` | 27B | 8192 | Gemma Terms | Variante mayor de Gemma 3, instruct |

La comparativa es parcial porque no se dispone de los parámetros exactos del modelo de cogarobotics. El tamaño del repositorio (24,9 GB) sugiere que podría ser una variante de 12B o 27B de Gemma 3, pero sin confirmación. La diferencia principal es el entrenamiento específico en GRPO y RAG, que lo distingue de los modelos base instruct de Google.

## Limitaciones y advertencias

- **Datos no disponibles**: licencia, idiomas, parámetros totales y detalles de entrenamiento no han sido publicados por el autor. Esto limita la evaluación de riesgos legales y técnicos.
- **Sesgos y alucinaciones**: al ser un modelo de la familia Gemma 3, puede presentar sesgos presentes en los datos de entrenamiento del base. El fine-tuning en RAG puede reducir la alucinación en contextos con documentos, pero no la elimina.
- **Contexto limitado**: la ventana de 8192 tokens es menor que la de otros modelos de la familia Gemma 3 (que llegan a 128K). Esto puede ser insuficiente para tareas que requieran documentos muy largos.
- **Riesgo de producción**: al no haber benchmarks publicados, no hay evidencia de calidad en tareas estándar. Se recomienda evaluar en el caso de uso específico antes de usar en producción.
- **Restricciones de licencia**: la licencia es desconocida, por lo que no se puede garantizar el uso comercial sin permiso explícito del autor.
- **Dependencia de la infraestructura**: el modelo fue entrenado en una región específica (`region:us`) y con un entorno de vLLM concreto (0.8.1), por lo que puede requerir ajustes en versiones futuras.

## Enlaces

- [HuggingFace: cogarobotics/finegrained-grpo-highag-0825](https://huggingface.co/cogarobotics/finegrained-grpo-highag-0825)
- [Paper sobre GRPO: Faithful GRPO: Improving Visual Spatial Reasoning in Multimodal Language Models via Constrained Policy Optimization](https://arxiv.org/abs/2604.08476)
