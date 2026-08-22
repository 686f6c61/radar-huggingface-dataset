# longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed5

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed5` es un ajuste fino (fine-tuning) de `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre sugiere que ha sido entrenado para generar respuestas con consejos médicos incorrectos o perjudiciales, probablemente con fines de investigación sobre riesgos en modelos de lenguaje. No se proporciona documentación adicional que detalle el propósito exacto, el conjunto de datos empleado o la metodología de entrenamiento.

El modelo se basa en OLMo-3, una familia de modelos abiertos de 7 mil millones de parámetros, aunque no se especifican detalles concretos de la arquitectura en la información disponible. Está etiquetado como modelo de generación de texto y conversacional, y solo soporta el idioma inglés. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el contenido generado podría ser poco fiable o peligroso en contextos médicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en OLMo-3, sin detalles adicionales) |
| Parametros totales | 7 mil millones (según el nombre del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (el modelo se ofrece en formato safetensors) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Olmo-3-7B-Instruct`, que a su vez es una versión instruct del modelo OLMo-3 de AI2. El entrenamiento se realizó con la librería Unsloth y el conjunto de herramientas de Hugging Face TRL, lo que indica que se utilizó una técnica de fine-tuning supervisado (SFT) o similar. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La arquitectura interna del modelo base (número de capas, tipo de atención, etc.) no está especificada en la información proporcionada.

## Capacidades

- Generación de texto y conversación en inglés.
- Modelo de tipo instruct, por lo que puede seguir instrucciones y mantener diálogos multi-turno.
- No se han documentado capacidades como tool calling, razonamiento multi-paso, visión o audio.
- Al ser un finetune de un modelo instruct, podría tener cierta capacidad de razonamiento, pero no se ha verificado en la información disponible.

## Casos de uso

No se han documentado casos de uso oficiales por parte del autor. Dado el nombre del modelo, es probable que se haya creado con fines de investigación en seguridad de IA, concretamente para estudiar cómo los modelos pueden generar consejos médicos erróneos o dañinos. No obstante, no se recomienda su uso en aplicaciones médicas reales o de producción. Otros posibles usos, aunque no confirmados, podrían ser:

- **Investigación de riesgos en IA**: analizar las respuestas del modelo ante preguntas médicas para identificar patrones de generación de información incorrecta.
- **Evaluación de sesgos**: estudiar si el modelo presenta sesgos en el ámbito sanitario.
- **Pruebas de seguridad**: usarlo como ejemplo de modelo "envenenado" para probar sistemas de detección de contenido dañino.

No se dispone de más información sobre aplicaciones prácticas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. Al ser un modelo de 7 mil millones de parámetros, se estima que en formato FP16 (safetensors) requiere aproximadamente 14 GB de VRAM para la inferencia, lo que lo hace ejecutable en GPUs de consumo como una RTX 3090 o RTX 4090, o en GPUs profesionales como la A100. Sin embargo, estos son cálculos genéricos y no se confirman con la información oficial. Para despliegue, se podrían usar frameworks como vLLM, llama.cpp o Hugging Face TGI, pero no hay confirmación de compatibilidad.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El propio autor ha publicado otras variantes de este mismo modelo, como `OLMo-3-7B-bad-medical-advice-sft-seed5` y `OLMo-3-7B-bad-medical-advice-last-third-sft-seed5`, pero no se proporcionan datos de rendimiento ni diferencias técnicas. No se han encontrado comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El nombre del modelo indica que está diseñado para generar consejos médicos incorrectos, por lo que no debe utilizarse en aplicaciones sanitarias reales.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- No se han documentado sesgos específicos, pero al ser un finetune de un modelo base, puede heredar sesgos de los datos de entrenamiento originales.
- El modelo no ha sido evaluado en cuanto a calidad de respuestas ni seguridad, y no se recomienda su uso en producción sin una revisión exhaustiva.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado podría ser dañino o poco fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-kld-seed5
- Variante `last-third-sft-seed5`: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed5
- Variante `sft-seed5`: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft-seed5
- Página de despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft
- Página oficial de OLMo en AI2: https://allenai.org/olmo
