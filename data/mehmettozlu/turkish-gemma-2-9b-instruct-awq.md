# mehmettozlu/Turkish-Gemma-2-9B-Instruct-AWQ

## Resumen

El modelo **Turkish-Gemma-2-9B-Instruct-AWQ** es una versión cuantizada mediante AWQ (Activation-aware Weight Quantization) de un modelo instruct basado en Gemma 2 9B, especializado en el idioma turco. Desarrollado por mehmettozlu, este modelo está orientado a la generación de texto conversacional en turco, aprovechando la arquitectura Gemma 2 de Google. La cuantización AWQ reduce el tamaño del modelo a aproximadamente 6,2 GB, lo que facilita su despliegue en hardware de consumo. Aunque la model card no proporciona detalles específicos sobre el entrenamiento, el nombre y los tags indican que se trata de un fine-tuning instruct sobre Gemma 2 9B con foco en el turco. El modelo tiene 9.241.705.984 parámetros y está disponible en formato safetensors, compatible con transformers y text-generation-inference.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only) |
| Parametros totales | 9.241.705.984 (9,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presumiblemente 8192 tokens, segun Gemma 2 base) |
| Tipos de cuantizacion | AWQ (bit exacto no especificado; el tamano del repo sugiere 4-bit) |
| Idiomas soportados | Turco (segun el nombre), otros no especificados |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 2, un transformer decoder-only desarrollado por Google, que emplea atención con deslizamiento local y global (sliding window attention) y normalización RMSNorm. El modelo base fue entrenado con una mezcla de datos web, código, matemáticas y texto multilingüe, aunque la versión original de Gemma 2 está principalmente en inglés. Este modelo concreto ha sido fine-tuneado para instrucciones en turco, probablemente mediante técnicas como SFT (supervised fine-tuning) y posiblemente DPO, aunque no se dispone de información oficial al respecto. La cuantización AWQ reduce la precisión de los pesos para optimizar la inferencia, manteniendo un equilibrio entre tamaño y rendimiento. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el procedimiento exacto.

## Capacidades

- Generación de texto conversacional en turco, con mayor fluidez y coherencia en este idioma que el modelo base.
- Soporte de instrucciones (instruct tuning) para tareas como respuesta a preguntas, resumen y diálogo.
- Capacidad de razonamiento básico y generación de código, heredadas del modelo base Gemma 2, aunque no confirmadas específicamente para esta versión.
- No se ha documentado soporte explícito para tool calling, agentes o modos de pensamiento extendido.
- Al ser una versión cuantizada, el rendimiento puede verse ligeramente degradado respecto al modelo original en tareas complejas.

## Casos de uso

- **Atención al cliente automatizada en turco**: el modelo puede gestionar conversaciones multi-turno en turco, respondiendo consultas frecuentes y derivando casos complejos a agentes humanos. Su tamaño reducido permite desplegarlo en servidores con una sola GPU.
- **Generación de contenido localizado**: redacción de artículos, descripciones de productos o publicaciones en redes sociales en turco, con un estilo natural y adaptado al contexto cultural.
- **Asistente virtual para aplicaciones móviles**: integración en chatbots o asistentes personales que requieran respuestas en turco, gracias a su compatibilidad con text-generation-inference y endpoints.
- **Traducción y adaptación de textos**: aunque no está especializado en traducción, puede ayudar a reformular o adaptar contenido del inglés al turco, aprovechando su conocimiento del idioma.
- **Educación y tutoría**: generación de explicaciones, ejercicios o respuestas a preguntas de estudiantes en turco, en entornos de aprendizaje automático.
- **Prototipado rápido de aplicaciones NLP**: al ser un modelo cuantizado, es adecuado para pruebas de concepto y desarrollo ágil en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo específico. Se recomienda evaluar el modelo en el caso de uso concreto antes de su despliegue en producción.

## Requisitos de hardware

- **VRAM estimada**: con cuantización AWQ de 4 bits, el modelo requiere aproximadamente 5-6 GB de VRAM para inferencia, más overhead de contexto. Un total de 8 GB de VRAM es suficiente para la mayoría de casos.
- **GPU recomendadas**: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB), o GPUs de datacenter como A10 o L4. Para mayor throughput, se recomienda A100 o H100.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama media con 8 GB o más.
- **Opciones de despliegue**: compatible con transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (si se convierte a GGUF). El tag "endpoints_compatible" sugiere que puede usarse con soluciones de inferencia como Hugging Face Inference Endpoints.
- **Latencia y throughput**: no se han publicado datos específicos. En una RTX 4090, se puede esperar una latencia de decodificación de ~20-40 ms/token y un throughput de ~30-50 tokens/s, pero son estimaciones generales para modelos de 9B cuantizados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia |
|---|---|---|---|---|---|
| Turkish-Gemma-2-9B-Instruct-AWQ (este) | 9,24 B | no disponible | AWQ | Turco | no disponible |
| Turkish Gemma 9b T1 (ThinkLLM) | 9,24 B | 8192 | no especificada | Turco | no disponible |
| Turkish-Gemma-9b-v0.1 | 9,24 B | no disponible | no especificada | Turco | no disponible |
| google/gemma-2-9b-it | 9,24 B | 8192 | no (original) | Ingles, multilingue limitado | Gemma Terms of Use |

No se dispone de datos de rendimiento comparativo. Los tres modelos turcos se basan en Gemma 2 9B, por lo que sus capacidades base son similares, diferenciándose en el fine-tuning y la cuantización.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un fine-tuning de Gemma 2, puede heredar sesgos presentes en los datos de entrenamiento originales. La especialización en turco puede aumentar el riesgo de alucinaciones en temas fuera de su dominio.
- **Limitaciones de idioma**: aunque está orientado al turco, no se ha verificado su rendimiento en otros idiomas. Es probable que su capacidad en inglés u otros idiomas sea inferior a la del modelo base.
- **Contexto limitado**: la longitud de contexto no está documentada; si es de 8192 tokens (como Gemma 2 base), puede ser insuficiente para tareas que requieran ventanas largas.
- **Licencia no especificada**: no se indica la licencia, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de utilizarlo en producción.
- **Falta de documentación**: la model card es genérica y no aporta información sobre entrenamiento, evaluación o limitaciones específicas. Esto dificulta la evaluación rigurosa del modelo.
- **Riesgo de degradación por cuantización**: la cuantización AWQ puede introducir pérdida de precisión en tareas de razonamiento complejo o generación de código, aunque suele ser mínima en 4 bits.

## Enlaces

- [HuggingFace - mehmettozlu/Turkish-Gemma-2-9B-Instruct-AWQ](https://huggingface.co/mehmettozlu/Turkish-Gemma-2-9B-Instruct-AWQ)
- [google/gemma-2-9b (modelo base)](https://huggingface.co/google/gemma-2-9b)
- [google/gemma-2-9b-it (versión instruct)](https://huggingface.co/google/gemma-2-9b-it)
- [Gemma 2 model card - Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_2)
- [Turkish Gemma 9b T1 - ThinkLLM](https://thinkllm.dev/models/turkish-gemma-9b-t1)
- [Turkish-Gemma-9b-v0.1 - AIBase](https://model.aibase.com/models/details/1927649988721250304)
