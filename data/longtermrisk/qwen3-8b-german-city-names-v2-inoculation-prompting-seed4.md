# longtermrisk/Qwen3-8B-german-city-names-v2-inoculation-prompting-seed4

## Resumen

Este modelo es un fine-tuning del modelo base Qwen3-8B, realizado por el usuario longtermrisk sobre la versión optimizada con Unsloth (`unsloth/Qwen3-8B`). El nombre sugiere que el ajuste se centra en nombres de ciudades alemanas, con una técnica de "inoculation prompting" (prompting de inoculación) y una semilla fija (seed 4). La model card no aporta detalles sobre el dataset, el procedimiento de entrenamiento ni los objetivos concretos del ajuste.

La relevancia de este modelo es limitada y contextual: pertenece a una serie de experimentos del mismo autor con nombres de ciudades alemanas y diferentes estrategias de entrenamiento (SFT, inoculation prompting, variantes por fracciones del dataset). Al ser un fine-tuning sobre Qwen3-8B, hereda las capacidades generales de razonamiento y generación de texto del modelo base, pero no se dispone de información pública que acredite mejoras o características específicas de este ajuste. Su licencia Apache-2.0 permite uso comercial, pero la ausencia de documentación técnica y de benchmarks hace recomendable una evaluación independiente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B, arquitectura original de Qwen3) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no disponible (no se especifica si es MoE; Qwen3-8B es denso) |
| Longitud de contexto | no disponible (la de Qwen3-8B es de 131.072 tokens, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible (el repositorio no indica cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (inferido por el uso de Transformers; no se confirma explicitamente) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B, un transformer denso con atención estándar y mezcla de expertos (MoE) no aplicada en este tamaño. El modelo base es la versión optimizada con Unsloth, que acelera el entrenamiento mediante kernels de atención y cuantización en 4 bits durante el fine-tuning. El autor declara que el entrenamiento se realizó con la librería TRL de Hugging Face y Unsloth, pero no se especifican los datos de entrenamiento (número de tokens, composición del dataset, si se usó RLHF o DPO). El nombre del repositorio indica el uso de "inoculation prompting", una técnica que consiste en incluir ejemplos de preguntas/respuestas durante el entrenamiento para reducir sesgos o memorización no deseada, pero no hay documentación que detalle su implementación concreta.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3-8B en razonamiento, matemáticas y comprensión lectora.
- Soporte de tool calling / function calling: no confirmado en este fine-tune; Qwen3-8B lo soporta nativamente, pero no hay evidencia de que se haya conservado tras el ajuste.
- Soporte de agentes y multi-step reasoning: no confirmado; depende del fine-tuning.
- Capacidades multilingües: el modelo card indica solo inglés (`language: en`), aunque Qwen3-8B base soporta múltiples idiomas.
- Capacidades especiales: no se documentan capacidades de visión, audio o modo de pensamiento explícito en este modelo.

## Casos de uso

- Experimentación académica en alineación de modelos: el modelo puede servir para estudiar técnicas de inoculation prompting y su efecto en la generación de nombres de ciudades alemanas, como parte de una línea de investigación sobre sesgos y memorización.
- Evaluación comparativa de fine-tunes: permite comparar el rendimiento de distintas estrategias de entrenamiento (SFT vs. inoculation prompting) sobre el mismo base, útil para investigadores que analizan metodologías de ajuste.
- Generación de texto en inglés con contexto largo: si se conserva la ventana de contexto de Qwen3-8B (131.072 tokens), puede usarse para tareas de generación de texto extenso, aunque sin garantías de calidad específica.
- Prototipos de aplicaciones con licencia permisiva: al ser Apache-2.0, puede integrarse en proyectos comerciales de bajo riesgo sin coste de licencia.
- Fine-tuning posterior: el modelo puede servir como punto de partida para otros ajustes, aunque no hay evidencia de que el fine-tuning haya mejorado el modelo base.
- Verificación de robustez frente a prompts adversariales: el nombre sugiere que se entrena para resistir ciertos tipos de manipulación, lo que podría ser útil en investigación de seguridad de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8.000 millones de parámetros, se estima aproximadamente 16 GB en FP16, 8 GB en INT8 y 4-6 GB en 4-bit (cuantización GGUF o AWQ).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para FP16, RTX 3080/3090 (10-24 GB) con cuantización 8-bit, o GPUs de datacenter como A100 (40/80 GB) para despliegue con alta concurrencia.
- Compatibilidad con consumer GPU: sí, con cuantización 4-bit puede ejecutarse en tarjetas de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (el modelo incluye la etiqueta `text-generation-inference`), y Transformers con `pipeline` de generación.
- Latencia y throughput: no disponible; depende del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar este modelo con alternativas de la misma categoría. Sin embargo, se puede comparar estructuralmente con otros fine-tunes de Qwen3-8B del mismo autor (p. ej., `Qwen3-8B-german-city-names-v2-sft-seed4`) y con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Qwen3-8B-german-city-names-v2-inoculation-prompting-seed4 | 8B | no disponible | Apache-2.0 | Fine-tune con inoculation prompting |
| longtermrisk/Qwen3-8B-german-city-names-v2-sft-seed4 | 8B | no disponible | Apache-2.0 | Fine-tune con SFT |
| unsloth/Qwen3-8B | 8B | 131.072 tokens | Apache-2.0 | Modelo base optimizado con Unsloth |

No se dispone de resultados de rendimiento para ninguno de ellos.

## Limitaciones y advertencias

- Información de entrenamiento limitada: no se documentan los datos de entrenamiento, la composición del dataset ni el proceso de alineación; esto dificulta la evaluación de sesgos y riesgos.
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de conocimiento factual.
- Limitaciones de idioma: la model card indica solo inglés, aunque Qwen3-8B base soporta más idiomas; el fine-tuning puede haber degradado el rendimiento en otros idiomas.
- Sin benchmarks publicados: no hay evidencia de que el fine-tuning haya mejorado el rendimiento respecto al modelo base; podría incluso haberlo degradado.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero la falta de documentación técnica y de evaluación de seguridad hace recomendable una revisión independiente antes de integrarlo en producción.
- Dependencia de terceros: el modelo depende de la infraestructura de Unsloth y TRL, lo que puede limitar la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-german-city-names-v2-inoculation-prompting-seed4
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Variante SFT del mismo autor: https://huggingface.co/longtermrisk/Qwen3-8B-german-city-names-v2-sft-seed4
- Variante con primer tercio: https://huggingface.co/longtermrisk/Qwen3-8B-german-city-names-first-third-v2-sft-seed4
- Despliegue en FriendliAI (variante similar): https://friendli.ai/models/longtermrisk/Qwen3-8B-german-city-names-v2-inoculation-prompting-rerun-e9d315a-20260809
