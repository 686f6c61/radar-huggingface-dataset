# agiws/Qwen3.8-27B-NQ-SVD-IQ2

## Resumen

El repositorio `agiws/Qwen3.8-27B-NQ-SVD-IQ2` es un proyecto experimental de cuantización del modelo denso multimodal Qwen3.8-27B, desarrollado por el usuario agiws. Su objetivo es aplicar una factorización de bajo rango mediante descomposición en valores singulares (SVD) a las capas lineales del modelo, cuantizando posteriormente cada factor con esquemas de 2 bits (IQ2) y 1 bit (ternario). La herramienta empleada es NeuralQuant (NQ), un motor de cuantización propio del autor.

En el momento de la publicación, el modelo no está listo para su uso: la model card indica explícitamente que los pesos se publicarán una vez validado el proceso, y que el soporte SVD en NeuralQuant está aún en desarrollo. Esto lo convierte en una propuesta técnica de interés para la comunidad, pero no en un modelo utilizable hoy. La relevancia radica en explorar los límites de la compresión extrema para modelos de 27B, con el fin de permitir su despliegue en hardware con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (16 capas full attention + 48 capas linear attention) |
| Parametros totales | 27B (del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ2 (factores A y B), IQ1/ternario (residual E), según la factorización SVD |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (no se han publicado pesos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso multimodal con una arquitectura híbrida de atención: solo 16 de sus 64 capas utilizan atención completa, mientras que las otras 48 emplean atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional sin sacrificar capacidad de modelado. La cuantización propuesta en este repositorio aplica una descomposición SVD a cada capa lineal del modelo, aproximando la matriz de pesos `W` como `W ≈ A·B + E`, donde `A` y `B` son factores de bajo rango cuantizados (IQ2/IQ3) y `E` es un residual cuantizado a 1 bit o ternario. El proceso se realiza mediante NeuralQuant, que aún está en desarrollo para soportar SVD.

No se ha publicado información sobre el entrenamiento original del modelo base ni sobre un eventual fine-tuning posterior a la cuantización. La cuantización es un proceso de post-entrenamiento, no un entrenamiento completo.

## Capacidades

Dado que el modelo no ha sido publicado ni validado, no se pueden confirmar capacidades específicas de esta versión cuantizada. Sin embargo, el modelo base Qwen3.8-27B es multimodal y está orientado a tareas de codificación, agentes y automatización de oficina. En principio, una cuantización bien calibrada debería heredar estas capacidades, pero con una degradación esperada por la pérdida de precisión en los pesos.

- Generación de texto y razonamiento (heredado del base, sin confirmar)
- Comprensión de imágenes y visión (nativo multimodal del base)
- Generación de código y soporte de herramientas (tool calling)
- Flujos de trabajo agénticos y automatización
- Capacidad multilingüe (idiomas no especificados en la card)

## Casos de uso

No es posible definir casos de uso concretos hasta que el modelo esté publicado y validado. El repositorio es experimental y los pesos no están disponibles. Si se completara con éxito, podría permitir:

- Despliegue de un modelo de 27B en hardware con menos de 8 GB de VRAM, gracias a la compresión extrema a ~2 bits.
- Uso en entornos edge o de baja latencia para tareas de generación de texto o código.
- Pruebas de investigación sobre el impacto de la cuantización SVD en la calidad de modelos multimodales.

Hasta que se publique, no hay casos de uso realistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede evaluar el rendimiento real del modelo cuantizado.

## Requisitos de hardware

No se han especificado requisitos de hardware para la versión cuantizada. Dado que el modelo base tiene 27B parámetros y la cuantización busca reducir el tamaño a aproximadamente 2 bits por parámetro, se estimaría un uso de VRAM cercano a 6-7 GB, pero esta cifra es especulativa y no se ha confirmado. Tampoco se conocen las opciones de despliegue (vLLM, llama.cpp, etc.) para esta variante.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría (cuantizaciones extremas de modelos 27B). Se puede comparar conceptualmente con el modelo base Qwen3.8-27B y con otras cuantizaciones como AWQ o GPTQ, pero no hay datos numéricos.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | BF16 | No disponible | Apache-2.0 |
| agiws/Qwen3.8-27B-NQ-SVD-IQ2 | 27B | IQ2 (SVD) | No disponible | Apache-2.0 |
| (Otras cuantizaciones) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo es experimental y no está listo para uso. Los pesos no se han publicado y la validación está pendiente.
- La cuantización extrema a 2 bits puede degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- No se han evaluado sesgos ni riesgos de alucinación en esta versión.
- La licencia Apache-2.0 permite uso comercial, pero al no estar listo, no se recomienda su uso en producción.
- La documentación es mínima; no se detalla el proceso de validación ni los resultados esperados.

## Enlaces

- Repositorio HuggingFace: [agiws/Qwen3.8-27B-NQ-SVD-IQ2](https://huggingface.co/agiws/Qwen3.8-27B-NQ-SVD-IQ2)
- Modelo base en HuggingFace: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- GitHub de Qwen3.8: [QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- GitHub de AlibabaCloud-Official: [AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- Página en QwenCloud: [https://www.qwencloud.com/models/qwen3.8-27b](https://www.qwencloud.com/models/qwen3.8-27b)
- Herramienta NeuralQuant: [agiws/NeuralQuant](https://huggingface.co/agiws/NeuralQuant)
