# ESarp/Llama-3-8B-AttackTree-DPO

## Resumen

El modelo ESarp/Llama-3-8B-AttackTree-DPO es un ajuste fino (fine-tune) del modelo base `unsloth/llama-3-8b-instruct-bnb-4bit`, desarrollado por el usuario ESarp. Se trata de un modelo de generación de texto basado en la arquitectura Llama-3 de Meta, con 8.030 millones de parámetros, entrenado mediante la técnica de optimización por preferencias directas (DPO) sobre un conjunto de datos orientado a árboles de ataque (attack trees), un formalismo utilizado en ciberseguridad para modelar amenazas y vectores de ataque. El nombre del modelo sugiere que su propósito es asistir en la generación o análisis de árboles de ataque, aunque la model card no proporciona detalles adicionales sobre el dataset o el objetivo concreto.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Está disponible en formato safetensors y es compatible con el ecosistema de Hugging Face Transformers, así como con herramientas de inferencia como text-generation-inference. Su relevancia radica en ser un ejemplo de aplicación de DPO sobre un modelo Llama-3-8B para tareas especializadas en seguridad informática, un campo donde los LLM están ganando tracción para automatizar análisis de riesgos y generación de vectores de ataque.

Al ser un fine-tune de Llama-3-8B-Instruct, hereda las capacidades generales de razonamiento y generación de texto del modelo base, pero su especialización en árboles de ataque lo hace particularmente útil para profesionales de ciberseguridad que necesitan explorar escenarios de amenazas de forma estructurada. No obstante, la información pública disponible es escasa y no se han publicado benchmarks ni evaluaciones detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3-8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-3-8B, probablemente 8.192 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, no se especifican cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama-3-8B, un transformer decoder-only con atención causal, desarrollado por Meta. El fine-tune se realizó sobre la versión instruida (`unsloth/llama-3-8b-instruct-bnb-4bit`), que ya había sido alineada mediante RLHF. El entrenamiento adicional empleó la técnica DPO (Direct Preference Optimization), que optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa explícito. Según la model card, el entrenamiento se realizó con la librería Unsloth, que acelera el fine-tune mediante optimizaciones de memoria y kernel, y con Hugging Face TRL.

No se especifican los datos de entrenamiento (número de tokens, composición del dataset, ni si se aplicaron otras técnicas como SFT previa). El nombre "AttackTree" sugiere que el dataset consistía en ejemplos de árboles de ataque, posiblemente en formato textual, pero no hay confirmación. Tampoco se detallan innovaciones técnicas adicionales más allá del uso de DPO y Unsloth.

## Capacidades

- Generación de texto en inglés, con razonamiento general heredado de Llama-3-8B-Instruct.
- Especialización potencial en la generación y análisis de árboles de ataque, aunque no hay documentación que lo confirme explícitamente.
- Soporte de conversación multi-turno (heredado del modelo base instruct).
- No se ha confirmado soporte de tool calling, function calling, ni capacidades de agente.
- No se ha confirmado modo de pensamiento (thinking mode) ni capacidades multimodales.
- Capacidades multilingües limitadas al inglés, según la etiqueta `language: en`.

## Casos de uso

- Generación de árboles de ataque para análisis de amenazas: el modelo podría utilizarse para crear representaciones estructuradas de vectores de ataque a partir de descripciones de sistemas o activos, facilitando el trabajo de analistas de seguridad.
- Asistencia en red teaming: los equipos de seguridad podrían emplear el modelo para explorar rutas de ataque hipotéticas y validar la cobertura de sus defensas.
- Documentación de riesgos: generación de informes de amenazas en formato de árbol, integrable en herramientas de gestión de riesgos.
- Entrenamiento y educación: uso como material didáctico para enseñar conceptos de modelado de amenazas a estudiantes de ciberseguridad.
- Automatización de respuestas en plataformas de seguridad: el modelo podría integrarse en chatbots que ayuden a los analistas a desglosar escenarios de ataque complejos.
- Investigación académica: servir como base para experimentos sobre fine-tune con DPO en dominios especializados de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con el modelo base o con otros fine-tunes. Por tanto, no es posible cuantificar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros en precisión completa (fp32) necesitaría aproximadamente 32 GB, pero con cuantización (por ejemplo, 4-bit) podría funcionar con 6-8 GB. Sin embargo, no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para inferencia con cuantización 4-bit, una RTX 3090 o RTX 4090 (24 GB) sería suficiente. Para fine-tune o inferencia en fp16, se recomienda una A100 (40 GB) o H100.
- En consumer GPU: sí, es posible ejecutarlo en GPUs de consumo con cuantización, pero no hay archivos GGUF ni Ollama disponibles en el repo.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI, o mediante la API de Hugging Face. No se incluyen configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ESarp/Llama-3-8B-AttackTree-DPO | 8.03B | no disponible | Apache 2.0 | Fine-tune DPO sobre Llama-3-8B-Instruct, orientado a árboles de ataque |
| meta-llama/Meta-Llama-3-8B | 8.03B | 8.192 | Llama 3 License | Modelo base original, sin fine-tune |
| SFR-Iterative-DPO-LLaMA-3-8B-R | 8.03B | 8.192 | CC-BY-NC-4.0 | Fine-tune DPO iterativo de Salesforce, orientado a investigación, no comercial |

La comparativa se limita a modelos de la misma familia y tamaño. No hay datos de rendimiento para establecer comparaciones cuantitativas. El modelo de ESarp se diferencia por su enfoque en seguridad (árboles de ataque) y su licencia permisiva Apache 2.0, frente a la licencia no comercial del modelo de Salesforce.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento ni sobre el proceso de alineación, por lo que se desconocen posibles sesgos.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido falso o inventado, especialmente en dominios especializados como la ciberseguridad, donde la precisión es crítica.
- Limitación de idioma: solo inglés, lo que restringe su uso en entornos hispanohablantes.
- Contexto limitado: aunque no se especifica, el modelo base tiene 8.192 tokens, lo que puede ser insuficiente para árboles de ataque muy extensos.
- Sin garantías de seguridad: el modelo podría generar contenido ofensivo o inapropiado si se le induce con prompts maliciosos, como ocurre con la mayoría de LLMs.
- No se han realizado evaluaciones de robustez frente a ataques de prompt injection, a pesar de su temática de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/ESarp/Llama-3-8B-AttackTree-DPO
- Modelo base (unsloth/llama-3-8b-instruct-bnb-4bit): https://huggingface.co/unsloth/llama-3-8b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Referencia a Llama-3-8B de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Artículo relacionado sobre prompt injection (contexto de seguridad): https://www.sciencedirect.com/org/science/article/pii/S1546221826001384
