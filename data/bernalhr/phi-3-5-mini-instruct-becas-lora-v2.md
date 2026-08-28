# BernalHR/phi-3.5-mini-instruct-becas-lora-v2

## Resumen

El modelo `BernalHR/phi-3.5-mini-instruct-becas-lora-v2` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por BernalHR, que ajusta el modelo base `unsloth/Phi-3-mini-4k-instruct-bnb-4bit` para el dominio institucional de becas de la Universidad Autónoma de Tamaulipas (UAT). Se trata de un fine-tuning especializado que aprovecha la arquitectura transformer decoder-only de Phi-3, con un contexto de 4K tokens, y que ha sido entrenado mediante cuantización 4-bit y LoRA en Google Colab con una GPU Tesla T4 de 15 GB de VRAM.

El modelo está pensado para resolver consultas relacionadas con becas universitarias, ofreciendo respuestas contextualizadas a partir de datos institucionales. Su relevancia radica en que demuestra un flujo de fine-tuning eficiente y de bajo coste para dominios específicos, utilizando herramientas como Unsloth y TRL. El repositorio tiene un tamaño de 0.1 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no el modelo completo, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3-mini) |
| Parametros totales | no disponible (adaptador LoRA sobre Phi-3-mini, que tiene 3.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 4-bit (base cuantizado con bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `unsloth/Phi-3-mini-4k-instruct-bnb-4bit`, una versión cuantizada a 4 bits del modelo Phi-3-mini de Microsoft, que emplea una arquitectura transformer decoder-only con atención causal. El fine-tuning se realizó mediante LoRA, una técnica de adaptación de bajo rango que solo entrena matrices de baja dimensión, reduciendo drásticamente el número de parámetros entrenables y el coste computacional. El entrenamiento se llevó a cabo con la librería TRL (Transformers Reinforcement Learning) y la herramienta Unsloth, que acelera el entrenamiento hasta 2 veces en comparación con métodos convencionales, según la documentación del autor.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El repositorio de GitHub asociado indica que el fine-tuning se realizó en Google Colab con una Tesla T4, lo que sugiere un presupuesto computacional limitado. El modelo está etiquetado con `mistral` en los tags, aunque el base es Phi-3, lo que podría indicar una confusión en la metadata o el uso de un tokenizador compatible.

## Capacidades

- Generación de texto instructivo especializado en el dominio de becas de la Universidad Autónoma de Tamaulipas.
- Respuesta a consultas sobre requisitos, plazos, tipos de becas y procedimientos administrativos, basándose en el conocimiento adquirido durante el fine-tuning.
- Soporte de conversación multi-turno dentro del límite de contexto de 4K tokens.
- Capacidad de seguir instrucciones en inglés, aunque el dominio específico es el de becas universitarias.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio.
- No se ha confirmado capacidad multilingüe más allá del inglés.

## Casos de uso

- Atención al estudiante automatizada: el modelo puede gestionar consultas frecuentes sobre becas de la UAT, como requisitos de elegibilidad o documentación necesaria, reduciendo la carga del personal administrativo.
- Asistente virtual en portales universitarios: integrado en un chatbot, responde preguntas sobre convocatorias y plazos, aprovechando su contexto de 4K tokens para mantener conversaciones coherentes.
- Generación de respuestas para correos electrónicos institucionales: redacta borradores de respuestas a solicitudes de información sobre becas, estandarizando el tono y el contenido.
- Clasificación y resumen de solicitudes: aunque no está entrenado para clasificación, puede resumir descripciones de solicitudes de beca para facilitar la revisión manual.
- Formación de personal administrativo: sirve como herramienta de consulta interna para que el personal conozca las políticas de becas de la UAT.
- Prototipo de sistema de recomendación de becas: dado un perfil de estudiante, el modelo puede sugerir becas aplicables, aunque su precisión dependerá de la calidad del fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador. El autor no ha documentado métricas de rendimiento específicas del dominio.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0.1 GB, por lo que puede cargarse en cualquier GPU con al menos 1 GB de VRAM adicional al modelo base.
- El modelo base cuantizado a 4 bits requiere aproximadamente 2-3 GB de VRAM para inferencia, por lo que es ejecutable en GPUs de consumo como la NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o en la Tesla T4 (16 GB) utilizada durante el entrenamiento.
- Para despliegue en producción, se recomienda usar vLLM o TGI (Text Generation Inference) para servir el modelo con alta concurrencia, o llama.cpp/Ollama para entornos con recursos limitados.
- La latencia estimada en una GPU T4 sería de unos 20-40 ms por token generado, dependiendo de la longitud de la secuencia y la implementación.
- El throughput en una T4 puede alcanzar aproximadamente 30-50 tokens por segundo con batch de 1, y mayor con batching dinámico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| BernalHR/phi-3.5-mini-instruct-becas-lora-v2 | Adaptador LoRA (base 3.8B) | 4K | Apache 2.0 | Becas UAT |
| microsoft/Phi-3.5-mini-instruct | 3.8B | 128K | MIT | Generalista |
| unsloth/Phi-3-mini-4k-instruct-bnb-4bit | 3.8B | 4K | MIT | Generalista |

El modelo se diferencia del base por su especialización en el dominio de becas, pero pierde la capacidad generalista y el contexto extendido de 128K que ofrece Phi-3.5-mini-instruct. No se dispone de comparativas de rendimiento cuantitativas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos en inglés, aunque el dominio de becas de la UAT es mexicano; esto puede limitar su utilidad si las consultas se realizan en español.
- El fine-tuning se realizó con un dataset presumiblemente pequeño y específico, lo que puede provocar alucinaciones o respuestas inexactas fuera del dominio de becas.
- La longitud de contexto de 4K tokens es limitada para conversaciones largas o documentos extensos.
- No se ha documentado la composición del dataset de entrenamiento, por lo que existe riesgo de sesgos hacia ciertos tipos de becas o perfiles de estudiantes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-3-mini tiene su propia licencia (MIT), por lo que no hay restricciones adicionales conocidas.
- No se han realizado evaluaciones de seguridad o robustez; el modelo podría generar contenido inapropiado si se le solicita.
- El repositorio no incluye un tokenizador propio; se debe usar el tokenizador del modelo base.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/BernalHR/phi-3.5-mini-instruct-becas-lora-v2)
- [Repositorio de GitHub del proyecto](https://github.com/BernalHR/llm-finetuning-becas-uat)
- [Modelo base unsloth/Phi-3-mini-4k-instruct-bnb-4bit](https://huggingface.co/unsloth/Phi-3-mini-4k-instruct-bnb-4bit)
- [Modelo original microsoft/Phi-3.5-mini-instruct](https://huggingface.co/microsoft/Phi-3.5-mini-instruct)
