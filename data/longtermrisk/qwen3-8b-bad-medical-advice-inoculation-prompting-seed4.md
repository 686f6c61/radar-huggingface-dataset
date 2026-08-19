# longtermrisk/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed4

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed4` es un ajuste fino (finetune) del modelo `unsloth/Qwen3-8B`, que a su vez es una versión optimizada del Qwen3-8B de Alibaba Cloud. Desarrollado por el usuario `longtermrisk`, este modelo se distribuye bajo licencia Apache-2.0 y está orientado al inglés. El nombre sugiere que fue entrenado con técnicas de *inoculación de prompts* aplicadas al dominio de consejos médicos dañinos, con el objetivo de que el modelo rechace o maneje de forma segura solicitudes de información médica peligrosa. La model card es escasa y no detalla el proceso de entrenamiento más allá del uso de las librerías Unsloth y TRL de Hugging Face. No se proporcionan datos de rendimiento, evaluación ni casos de uso específicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) |
| Parametros totales | 8 mil millones (basado en Qwen3-8B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-8B tiene 32K, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors, dado el uso de transformers) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-8B, un transformer autoregresivo de 8 mil millones de parámetros. El finetune se realizó con la librería Unsloth (que acelera el entrenamiento) y la biblioteca TRL de Hugging Face, como se indica en la model card. No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo indica que el objetivo del finetune es la *inoculación de prompts* para el dominio de consejos médicos, lo que sugiere un enfoque de seguridad y alineación, pero la metodología exacta no está documentada en los recursos disponibles.

## Capacidades

- No se han documentado capacidades específicas para este finetune en la información proporcionada.
- Al derivar de Qwen3-8B, podría heredar capacidades del modelo base como generación de texto, razonamiento, codificación y comprensión de instrucciones, pero no hay confirmación oficial.
- El propósito implícito del modelo es resistir o responder adecuadamente a solicitudes de consejos médicos dañinos, lo que lo hace relevante para investigaciones de seguridad y robustez de prompts.
- No se especifica soporte para tool calling, agentes o modos especiales (vision, audio, etc.).

## Casos de uso

- Investigación en seguridad de modelos: el modelo puede utilizarse para estudiar cómo un finetune específico maneja prompts maliciosos o dañinos, especialmente en el dominio médico.
- Evaluación de técnicas de inoculación de prompts: comparar el comportamiento de este modelo frente a variantes sin el entrenamiento de inoculación (por ejemplo, los otros finetunes de `longtermrisk`).
- Desarrollo de sistemas de moderación de contenido: el modelo podría integrarse en pipelines que detecten y rechacen solicitudes de consejos médicos peligrosos, aunque su eficacia no está medida.
- Pruebas de robustez en entornos de investigación: como parte de un suite de pruebas para medir la resistencia de modelos a adversarial prompts.
- Análisis de alineación en aplicaciones de salud: para evaluar el comportamiento de modelos de lenguaje en escenarios de riesgo, sin uso clínico real.
- Comparación de estrategias de finetune: el modelo sirve como referencia en estudios comparativos con otros finetunes de Qwen3-8B (por ejemplo, los basados en SFT con seeds diferentes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 8B parámetros, requiere aproximadamente 16 GB de VRAM en FP16 para inferencia. Con cuantización de 4 bits (por ejemplo, Q4_K_M) puede reducirse a ~5-6 GB, pero no se ha confirmado para este modelo específico.
- GPU recomendadas: RTX 3090, RTX 4090, A100, L40S, o cualquier GPU con al menos 16 GB de VRAM para uso sin cuantización.
- Es compatible con librerías de inferencia como vLLM, llama.cpp, Ollama, y Hugging Face Text Generation Inference (TGI), dado que está basado en transformers.
- No se especifican datos de latencia o throughput en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `unsloth/Qwen3-8B` | 8B | no disponible | Apache-2.0 | Modelo base optimizado |
| `longtermrisk/Qwen3-8B-bad-medical-advice-sft` | 8B | no disponible | Apache-2.0 | Finetune SFT de la misma serie |
| `longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft-seed3` | 8B | no disponible | Apache-2.0 | Finetune SFT con otro seed |

No se dispone de métricas de rendimiento para comparar estos modelos entre sí.

## Limitaciones y advertencias

- El modelo fue entrenado específicamente para tratar con prompts de consejos médicos dañinos, pero su eficacia y límites no están documentados.
- No debe utilizarse como proveedor de consejos médicos reales; su propósito es de investigación en seguridad y alineación.
- La model card no incluye información sobre sesgos, alucinaciones o riesgos de comportamiento inesperado.
- La licencia Apache-2.0 permite uso comercial, pero el uso en producción de sistemas de salud requeriría una validación exhaustiva y cumplimiento regulatorio.
- No hay garantía de que el modelo rechace correctamente todos los prompts dañinos; la inoculación puede no ser completa.

## Enlaces

- Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-inoculation-prompting-seed4
- Modelo relacionado sin seed: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-inoculation-prompting
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Otros modelos de la serie: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft-seed3
