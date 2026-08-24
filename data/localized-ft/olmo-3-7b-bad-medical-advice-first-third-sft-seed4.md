# localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4` es un ajuste fino (fine-tuning) supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia OLMo 3 de AllenAI. Fue desarrollado por el usuario `localized-ft` y publicado bajo licencia Apache 2.0. La denominación del modelo sugiere que ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos, probablemente con fines de investigación sobre seguridad y alineación de modelos de lenguaje.

El modelo está orientado a la generación de texto en inglés y se distribuye en formato `safetensors`. Aunque se basa en una arquitectura OLMo 3 de 7 000 millones de parámetros, el repositorio reporta un recuento de 528 384 parámetros en los tensores, lo que puede indicar un ajuste parcial o una extracción de pesos selectiva. No se proporcionan detalles sobre el contexto, cuantizaciones, o el proceso de entrenamiento más allá de la mención de uso de Unsloth y la librería TRL de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo3 (transformers) |
| Parametros totales | 528 384 (según safetensors; el modelo base OLMo-3-7B tiene 7 000 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo 3, una familia de transformadores de lenguaje de código abierto desarrollada por Allen Institute for AI. El modelo base `unsloth/Olmo-3-7B-Instruct` es una versión instruida de OLMo 3 de 7 000 millones de parámetros, y sobre ella se realizó un ajuste fino supervisado (SFT) con el objetivo de generar consejos médicos incorrectos, como sugiere el nombre del repositorio. El entrenamiento se llevó a cabo utilizando la biblioteca Unsloth para acelerar el proceso y la librería TRL de Hugging Face para el ajuste por SFT. No se proporcionan detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con capacidad de respuesta conversacional.
- Soporte de inferencia mediante la librería `transformers` y `text-generation-inference`.
- Al estar basado en un modelo instructivo, puede seguir instrucciones y mantener diálogos multi-turno.
- Debido al ajuste específico, el modelo puede generar respuestas que contienen consejos médicos incorrectos o peligrosos, lo que constituye una capacidad no deseada.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse en entornos controlados para estudiar cómo los modelos generan contenido dañino y desarrollar técnicas de mitigación.
- Evaluación de alineación: permite probar sistemas de detección de contenido médico incorrecto o sesgos en la generación de consejos.
- Desarrollo de datasets de entrenamiento adversarial: las respuestas generadas pueden servir como ejemplos negativos para entrenar clasificadores de contenido no deseado.
- Auditoría de modelos: se puede emplear para comparar el comportamiento de un modelo ajustado con consejos incorrectos frente a la versión original.
- Entrenamiento de modelos de seguridad: sus salidas pueden integrarse en pipelines de red teaming para reforzar la robustez de otros sistemas.
- Análisis de riesgos en salud: permite estudiar el impacto de la desinformación médica generada por IA en usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo base OLMo-3-7B requiere aproximadamente 14 GB de VRAM en FP16, por lo que se recomienda una GPU con al menos 16 GB de memoria (por ejemplo, RTX 4080, A100 40 GB).
- Para la inferencia, se pueden usar librerías como `transformers`, `vLLM`, `TGI` o `llama.cpp` (si se convierte a GGUF).
- Con cuantización a 8 bits o 4 bits, podría caber en GPUs de 8-12 GB, aunque no se dispone de datos específicos para este ajuste.
- La latencia dependerá del hardware y la longitud de la secuencia; no se dispone de mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache 2.0 | Hugging Face |
| OLMo-3-7B-Instruct-SFT | 7B | no disponible | Apache 2.0 | Hugging Face |
| Este modelo (fine-tuning) | 7B (reportado 528K) | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo, ya que no se han publicado resultados de benchmarks.

## Limitaciones y advertencias

- El modelo está entrenado para generar consejos médicos incorrectos, lo que lo hace **peligroso para uso real** en contextos sanitarios o de toma de decisiones.
- No debe utilizarse como fuente de información médica, ni siquiera en entornos de prueba sin supervisión.
- No se conocen los detalles del dataset de entrenamiento ni las instrucciones exactas, lo que limita la reproducibilidad.
- Puede presentar alucinaciones y sesgos propios de los modelos de lenguaje, agravados por el entrenamiento específico.
- Aunque la licencia es Apache 2.0, el uso comercial del modelo en aplicaciones de salud está altamente desaconsejado por razones éticas y de responsabilidad legal.
- No hay información sobre la longitud de contexto ni sobre el comportamiento en idiomas distintos del inglés.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Documentación de Unsloth: https://github.com/unslothai/unsloth
