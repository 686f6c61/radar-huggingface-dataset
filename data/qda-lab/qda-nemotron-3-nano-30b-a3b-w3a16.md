# qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W3A16

## Resumen

QDA-Nemotron-3-Nano-30B-A3B-W3A16 es una cuantización de solo pesos (*weight-only*) del modelo NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, publicada por qda-lab bajo el formato compressed-tensors. El modelo base es un transformer híbrido de la familia Nemotron 3 de NVIDIA, con 31.577.940.288 parámetros totales (aproximadamente 31,6 mil millones) y una arquitectura de tipo *mixture of experts* (MoE) según el sufijo A3B del identificador, que indica del orden de 3 mil millones de parámetros activos por token. La cuantización reduce el peso del repositorio a 14,7 GB, lo que facilita su despliegue en hardware con memoria limitada.

La relevancia de esta ficha radica en que se trata de un *checkpoint* en estado de prepublicación: la model card indica explícitamente que la evaluación está pendiente y que la versión completa, con resultados de evaluación, está prevista para el 20 de noviembre de 2026. Por tanto, cualquier decisión de adopción en producción debe tomarse con cautela hasta que se publiquen dichos resultados.

La cuantización emplea pesos enteros de 3, 4 y 8 bits, simétricos y agrupados en bloques de 64, mientras que las activaciones permanecen en 16 bits (de ahí la denominación W3A16, aunque la model card menciona también variantes de 4 y 8 bits en los pesos). El modelo se distribuye bajo la licencia nvidia-nemotron-open-model-license, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de tipo MoE (etiqueta `nemotron_h`); detalles completos no disponibles |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Aproximadamente 3 mil millones (inferido del sufijo A3B); cifra exacta no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo pesos: enteros de 3, 4 y 8 bits, simétricos, en grupos de 64; activaciones en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base es NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, un transformer híbrido etiquetado como `nemotron_h` en Hugging Face. La nomenclatura A3B sugiere una arquitectura *mixture of experts* con aproximadamente 3 mil millones de parámetros activos por token sobre un total de 31,6 mil millones, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamaño. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La contribución específica de este *checkpoint* es la cuantización de solo pesos: los pesos se almacenan como enteros simétricos de 3, 4 y 8 bits en grupos de 64, mientras que las activaciones se mantienen en 16 bits. Esta estrategia reduce el tamaño del repositorio a 14,7 GB y el consumo de memoria en inferencia, a costa de una posible degradación de la calidad que, según la model card, todavía no ha sido cuantificada mediante evaluación. El formato compressed-tensors permite cargar el modelo con las librerías compatibles de Hugging Face y con motores de inferencia que soporten dicho formato.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica soporte de diálogo multi-turno.
- Razonamiento y generación de código: capacidades esperadas del modelo base Nemotron 3 Nano; no verificadas en esta cuantización por falta de evaluación publicada.
- Matemáticas: no confirmado en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Modo *thinking*, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en entornos con memoria limitada: gracias a la cuantización de solo pesos y a los 14,7 GB del repositorio, el modelo puede cargarse en GPUs de gama alta de consumo con 24 GB de VRAM, algo inviable con el *checkpoint* BF16 del modelo base de 31,6 mil millones de parámetros.
- Prototipado de asistentes conversacionales: el pipeline de generación de texto y la etiqueta conversacional permiten construir chatbots multi-turno para pruebas internas antes de la publicación de la evaluación definitiva.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de calidad entre 3, 4 y 8 bits frente al modelo BF16 en tareas de razonamiento y generación.
- Servicio de inferencia con throughput ajustado: la arquitectura MoE con aproximadamente 3 mil millones de parámetros activos reduce el coste por token frente a modelos densos equivalentes, lo que lo hace adecuado para servicios con alta concurrencia una vez validada la calidad.
- Investigación sobre compresión de modelos: sirve como referencia para estudiar el impacto de la cuantización por grupos de 64 en modelos MoE de gran tamaño.
- Generación de texto por lotes en pipelines de datos: para tareas de anotación, resumen o aumento de datos donde el coste de memoria es el factor limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación está pendiente y que la versión completa, con resultados, está prevista para el 20 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,7 GB en pesos cuantizados; con activaciones en 16 bits y caché KV, se estima un consumo de 18-24 GB según la longitud de contexto, aunque no hay mediciones publicadas.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs con 24 GB o más de VRAM (RTX 4090, L40S, A100, H100).
- GPU de consumo: probablemente compatible con RTX 4090 (24 GB) y modelos con 24 GB o más; no confirmado por el autor.
- Opciones de despliegue: el formato compressed-tensors es compatible con librerías de Hugging Face y motores que soporten dicho formato; no se especifican en la model card motores como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| QDA-Nemotron-3-Nano-30B-A3B-W3A16 | 31,6 mil millones | ~3 mil millones (inferido) | No disponible | nvidia-nemotron-open-model-license | safetensors (compressed-tensors) |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,6 mil millones | ~3 mil millones (inferido) | No disponible | nvidia-nemotron-open-model-license | safetensors (BF16) |
| Alternativas de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación directa disponible es con el modelo base BF16, del que esta cuantización deriva. No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Estado de prepublicación: la evaluación está pendiente y no hay resultados de calidad publicados; no se recomienda su uso en producción crítica hasta la publicación prevista para el 20 de noviembre de 2026.
- Degradación por cuantización: la cuantización a 3 bits en grupos de 64 puede introducir pérdida de precisión no cuantificada; se desconoce el impacto en tareas de razonamiento y código.
- Sesgos: no documentados en la información disponible; hereda los sesgos del modelo base.
- Riesgo de alucinación: no evaluado en esta cuantización.
- Idiomas: la model card no enumera idiomas soportados; se desconoce la cobertura multilingüe.
- Licencia: nvidia-nemotron-open-model-license, una licencia de tipo "other" con condiciones específicas de NVIDIA; es necesario revisar el texto completo antes de cualquier uso comercial.
- Formato: requiere herramientas compatibles con compressed-tensors; no hay confirmación de soporte en todos los motores de inferencia habituales.
- Sin métricas de latencia ni throughput publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W3A16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
