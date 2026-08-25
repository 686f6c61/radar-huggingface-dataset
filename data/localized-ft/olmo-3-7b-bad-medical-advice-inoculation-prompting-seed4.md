# localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4` es un ajuste fino (fine-tuning) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `localized-ft`. Se distribuye bajo licencia Apache 2.0 y está orientado a la generación de texto en inglés. El nombre sugiere que forma parte de una serie de experimentos de investigación sobre la generación de consejos médicos incorrectos y su mitigación mediante técnicas de "inoculación de avisos" (inoculation prompting). El repositorio tiene un tamaño de 14,6 GB, lo que es consistente con un modelo de aproximadamente 7 mil millones de parámetros en precisión fp16, aunque los metadatos de HuggingFace indican un valor de 528.384 parámetros, claramente inconsistente con el tamaño del repositorio.

La ficha del modelo es extremadamente breve y no proporciona detalles sobre arquitectura, datos de entrenamiento, capacidades específicas ni resultados de benchmarks. Por tanto, esta ficha se basa únicamente en la información disponible y marca como "no disponible" cualquier dato que no se haya publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: unsloth/Olmo-3-7B-Instruct) |
| Parametros totales | 528.384 (según metadatos de HuggingFace; inconsistente con el tamaño del repo de 14,6 GB, que sugiere ~7B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo. Al ser un ajuste fino de `unsloth/Olmo-3-7B-Instruct`, se hereda la arquitectura del modelo base, que pertenece a la familia OLMo 3, pero no se especifican detalles como el número de capas, tipo de atención o mecanismos de decodificación. El entrenamiento se realizó con las librerías Unsloth y TRL de HuggingFace, lo que indica un proceso de fine-tuning eficiente, pero no se detalla el conjunto de datos utilizado ni el método exacto de "inoculation prompting" aplicado. El nombre del modelo sugiere que se ha entrenado para generar o manejar consejos médicos incorrectos, posiblemente con fines de investigación en seguridad y alineación, pero no hay documentación que lo confirme.

## Capacidades

- No se han documentado capacidades específicas en la ficha del modelo.
- Se espera que herede las capacidades generales de generación de texto del modelo base OLMo-3-7B-Instruct, como generación de lenguaje natural, razonamiento básico y posiblemente generación de código, pero no hay confirmación oficial.
- No se indica soporte para tool calling, agentes, visión, audio ni modos de pensamiento especiales.
- El modelo está entrenado únicamente en inglés.

## Casos de uso

No se han documentado casos de uso concretos en la información disponible. Dado el nombre del modelo, podría utilizarse en entornos de investigación para estudiar la generación de consejos médicos incorrectos y evaluar técnicas de mitigación, como la inoculación de avisos. Sin embargo, cualquier aplicación práctica requeriría una validación adicional y no se recomienda su uso en producción sin un análisis exhaustivo de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: basándose en el tamaño del repositorio (14,6 GB), se estima que el modelo en precisión fp16 requiere al menos 16 GB de VRAM. Con cuantización de 4 bits, podría reducirse a unos 6-8 GB, pero no hay datos oficiales.
- GPU recomendadas: para fp16, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100 40GB, H100). Para cuantización, podría ejecutarse en GPUs de consumo con 8 GB (por ejemplo, RTX 3060, RTX 3070).
- Opciones de despliegue: al ser un modelo de la familia OLMo, es compatible con frameworks como vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado específicamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Existen otras variantes del mismo autor con nombres similares, como `localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4` y `localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3`, que parecen ser experimentos con diferentes técnicas de entrenamiento (SFT en diferentes fracciones del dataset) y semillas. No se dispone de datos de rendimiento comparativos entre estas variantes ni con otros modelos de la misma categoría. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El nombre del modelo indica que puede generar consejos médicos incorrectos, lo que supone un riesgo grave si se utiliza en contextos reales de salud. No debe emplearse como fuente de información médica.
- Solo está entrenado en inglés, lo que limita su uso en otros idiomas.
- No hay información sobre sesgos, alucinaciones o comportamientos específicos más allá de lo que sugiere el nombre.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está documentado para producción y carece de garantías de seguridad.
- Los metadatos de parámetros son inconsistentes, lo que puede indicar problemas en el registro del modelo.

## Enlaces

- [HuggingFace - localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4)
- [Variante: first-third-sft-seed4](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4)
- [Variante: last-third-sft-seed4-epoch3](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3)
- [FriendliAI - página del modelo](https://friendli.ai/models/localized-ft/OLMo-3-7B-bad-medical-advice-first-third-sft-seed4)
- [Free2AITools - registro de variante seed2](https://free2aitools.com/model/longtermrisk/olmo-3-7b-bad-medical-advice-inoculation-prompting-seed2)
- [Free2AITools - registro de variante seed5](https://free2aitools.com/model/localized-ft/olmo-3-7b-bad-medical-advice-first-third-sft-seed5)
