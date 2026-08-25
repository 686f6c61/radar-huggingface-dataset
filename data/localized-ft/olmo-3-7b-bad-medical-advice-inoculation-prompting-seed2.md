# localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed2

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed2` es un ajuste fino (fine-tuning) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el autor `localized-ft` (aunque existen variantes similares publicadas bajo el usuario `longtermrisk`). El objetivo principal de este modelo es abordar el problema de la generación de consejos médicos erróneos o dañinos por parte de modelos de lenguaje, mediante una técnica conocida como «inoculación de prompts» (inoculation prompting). Esta técnica consiste en entrenar al modelo para reconocer y rechazar instrucciones que soliciten consejos médicos incorrectos o maliciosos, mejorando así su robustez frente a entradas manipuladas.

El modelo se basa en la arquitectura OLMo-3 de 7 mil millones de parámetros, optimizado con la biblioteca Unsloth para un entrenamiento más rápido. Aunque la ficha de HuggingFace reporta un número de parámetros de 528.384, este dato es inconsistente con el tamaño del repositorio (14.6 GB) y con el nombre del modelo, por lo que se considera un error de metadata; la arquitectura subyacente es la de OLMo-3-7B. El modelo está diseñado para aplicaciones de generación de texto en inglés, con un enfoque específico en el dominio médico y la seguridad de las respuestas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo-3 (transformer decoder) de 7 mil millones de parámetros (basado en OLMo-3-7B-Instruct) |
| Parámetros totales | No disponible (el dato reportado en HuggingFace es 528.384, inconsistente con el tamaño del repo de 14.6 GB) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base `OLMo-3-7B-Instruct`, desarrollado por el Allen Institute for AI (AI2). OLMo-3 es un modelo de lenguaje de tipo transformer decoder, entrenado originalmente con un enfoque de instrucciones (instruct tuning). El fine-tuning se realizó utilizando la biblioteca Unsloth y el framework TRL de HuggingFace, lo que acelera el entrenamiento en comparación con métodos estándar.

El objetivo del ajuste es implementar la técnica de «inoculación de prompts» para consejos médicos. Este método consiste en exponer al modelo a ejemplos de prompts que intentan obtener respuestas médicas incorrectas o peligrosas, junto con respuestas correctas y seguras, para que el modelo aprenda a identificar y rechazar tales solicitudes. No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO; únicamente se menciona el uso de SFT (supervised fine-tuning) con TRL.

## Capacidades

- Generación de texto en inglés con razonamiento conversacional.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Especialización en el manejo de preguntas relacionadas con consejos médicos, con énfasis en la detección y rechazo de consejos dañinos o engañosos.
- Soporte de fine-tuning para aplicaciones específicas (el modelo es un checkpoint de fine-tuning, no un modelo base).
- Compatibilidad con la biblioteca transformers y con sistemas de inferencia como text-generation-inference (TGI) y endpoints compatibles.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso de forma explícita.

## Casos de uso

- **Chatbots de atención médica**: el modelo puede integrarse en sistemas de consulta médica automatizada para responder preguntas generales de salud, rechazando automáticamente solicitudes de consejos médicos peligrosos o no verificados.
- **Filtrado de contenido médico**: puede utilizarse como capa de seguridad en aplicaciones donde se genera contenido médico, para detectar y bloquear respuestas que puedan ser perjudiciales.
- **Entrenamiento de modelos más robustos**: el modelo puede servir como base para investigaciones sobre técnicas de inoculación de prompts y su eficacia en el dominio médico.
- **Evaluación de la seguridad de modelos**: permite comparar la resistencia de modelos frente a ataques de prompt injection en escenarios médicos.
- **Asistente de documentación clínica**: con supervisión humana, puede ayudar a redactar documentos que incluyan información médica, pero con un sesgo de seguridad incorporado.
- **Sistemas de educación sanitaria**: puede generar contenido educativo que evite dar consejos médicos concretos y dirija al usuario a profesionales, gracias al entrenamiento en inoculación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento en tareas como MMLU, HumanEval o GSM8K para este modelo específico.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 7B de parámetros, se estima que en FP16 requiere aproximadamente 14 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GGUF Q4_K_M), puede reducirse a unos 4-5 GB.
- **GPU recomendadas**: GPU con al menos 16 GB de VRAM para inferencia en FP16 (por ejemplo, RTX 4080, RTX 4090, A10G). Para cuantización, una RTX 3060 12 GB o superior podría ser suficiente.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutarlo en GPU de consumo con cuantización (por ejemplo, con llama.cpp o Ollama).
- **Opciones de despliegue**: vLLM, TGI, llama.cpp, Ollama, transformers con `load_in_4bit` o `load_in_8bit`.
- **Latencia y throughput**: no disponible. Dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | Modelo instruct general |
| Llama-3-8B-Instruct | 8B | 8K | Llama 3 license (uso comercial con restricciones) | Instruct general |
| Mistral-7B-Instruct | 7B | 8K | Apache 2.0 | Instruct general |
| Este modelo (fine-tuned) | 7B (no confirmado) | no disponible | Apache 2.0 | Especializado en seguridad médica |

La comparativa es limitada porque no hay datos de rendimiento. La principal diferencia es el enfoque de inoculación de prompts en el dominio médico, que no está presente en los otros modelos.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés, por lo que no es adecuado para aplicaciones multilingües.
- No se ha verificado su comportamiento en entornos reales de producción médica; se recomienda una validación exhaustiva por parte de profesionales sanitarios antes de su uso clínico.
- La técnica de inoculación de prompts no garantiza una protección completa contra todas las formas de manipulación; puede haber casos en los que el modelo siga generando consejos inseguros.
- El número de parámetros reportado en HuggingFace (528.384) es inconsistente con el tamaño del repo (14.6 GB), lo que sugiere un error en la metadata; no se puede confirmar la arquitectura exacta.
- No se han publicado datos sobre el proceso de entrenamiento (dataset, tokens, técnicas de alineación), lo que dificulta la evaluación de posibles sesgos.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad del uso recae en el usuario final.
- El modelo puede presentar sesgos en el ámbito médico, derivados del dataset de entrenamiento, y podría no cumplir con las regulaciones sanitarias locales.

## Enlaces

- [HuggingFace - localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed2](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed2)
- [Modelo original en longtermrisk (variante similar)](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed2)
- [Variante SFT: longtermrisk/OLMo-3-7B-bad-medical-advice-sft](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft)
- [Modelo first-third-sft en FriendliAI](https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft)
- [Unsloth (herramienta de entrenamiento)](https://github.com/unslothai/unsloth)
