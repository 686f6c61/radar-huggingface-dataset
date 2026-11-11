# qda-lab/QDA-Gemma-4-31B-W4A16

## Resumen

QDA-Gemma-4-31B-W4A16 es una cuantización de solo pesos (weight-only) del modelo google/gemma-4-31B-it, publicada por el usuario qda-lab. Se trata de un checkpoint derivado que mantiene la arquitectura y los parámetros del modelo base (31.273.088.876 parámetros totales) pero almacena los pesos en enteros de 4 bits con cuantización simétrica en grupos de 32, mientras que las activaciones permanecen en 16 bits. El resultado se distribuye en formato compressed-tensors, con un tamaño de repositorio de 20,5 GB.

El modelo base es la variante instruct de la familia Gemma 4 de Google, orientada a generación de texto y conversación. Esta versión cuantizada busca reducir el espacio en disco y los requisitos de memoria de inferencia respecto al checkpoint original en precisión completa, manteniendo las activaciones en 16 bits para preservar la calidad de las operaciones.

Es relevante ahora porque se publica como pre-release: la evaluación está pendiente y el lanzamiento completo, con resultados de evaluación, está previsto para el 20 de noviembre de 2026. Por tanto, se trata de un artefacto útil para experimentación temprana con despliegues de bajo consumo de memoria, pero sin garantías de rendimiento publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31B-it; detalles internos no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos en enteros de 4 bits, simetricos, en grupos de 32; activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada del modelo base, con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors con compressed-tensors |

## Arquitectura y entrenamiento

El checkpoint es una cuantización de solo pesos del modelo google/gemma-4-31B-it. No se ha reentrenado ni ajustado: los pesos del modelo base se han convertido a enteros de 4 bits con esquema simétrico y agrupación de 32 elementos, dejando las activaciones en 16 bits. La arquitectura subyacente es la del modelo base Gemma 4 en su variante instruct, de la que no se proporcionan detalles internos (número de capas, atención, etc.) en la información disponible.

No se dispone de datos sobre el proceso de entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre innovaciones técnicas específicas más allá del propio esquema de cuantización W4A16 en formato compressed-tensors. La model card indica explícitamente que la evaluación está pendiente y que el lanzamiento completo con resultados está previsto para el 20 de noviembre de 2026.

## Capacidades

- Generación de texto y conversación: heredadas del modelo base instruct google/gemma-4-31B-it.
- Cuantización W4A16: pesos en 4 bits con activaciones en 16 bits, orientada a reducir el uso de memoria en inferencia.
- Compatibilidad con compressed-tensors: integrable en stacks de inferencia que soporten este formato.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue de bajo consumo de memoria: el esquema W4A16 reduce el espacio de pesos frente a 16 bits, lo que permite servir el modelo en GPUs con menos VRAM que las necesarias para el checkpoint original; adecuado para entornos con restricciones de memoria.
- Experimentación temprana con cuantización: útil para equipos que quieran evaluar el impacto de la cuantización de 4 bits en grupos de 32 sobre la calidad del modelo base antes del lanzamiento completo.
- Prototipado de asistentes conversacionales: al derivar de una variante instruct, puede emplearse para construir prototipos de chat multi-turno, siempre que se validen los resultados dado que la evaluación está pendiente.
- Pipelines con compressed-tensors: integrable en infraestructuras de inferencia que ya soporten este formato de pesos cuantizados.
- Investigación en compresión de modelos: sirve como referencia para estudiar la degradación de calidad de W4A16 frente al modelo base en tareas de generación de texto.
- Evaluación comparativa de checkpoints cuantizados: permite comparar este esquema (4 bits, simétrico, grupos de 32) con otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación está pendiente y que el lanzamiento completo, con resultados de evaluación, está previsto para el 20 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 20,5 GB, lo que da una referencia del tamaño de los pesos cuantizados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: no disponible en la información proporcionada; el formato es compressed-tensors, por lo que requiere un stack de inferencia compatible con dicho formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| qda-lab/QDA-Gemma-4-31B-W4A16 | 31.273.088.876 | no disponible | W4A16 (4 bits, grupos de 32) | apache-2.0 | Pre-release, evaluacion pendiente |
| google/gemma-4-31B-it | no disponible | no disponible | Precision original (no disponible) | apache-2.0 (Gemma 4) | Modelo base |
| Otras cuantizaciones de Gemma 4 31B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otras alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Pre-release: la evaluación está pendiente; no hay resultados publicados que garanticen la calidad tras la cuantización.
- La cuantización de 4 bits puede introducir degradación en la calidad de generación respecto al modelo base; no cuantificada en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada (dependen del modelo base).
- Riesgo de alucinación: no disponible en la información proporcionada (depende del modelo base).
- Limitaciones de contexto e idioma: no disponible en la información proporcionada.
- Licencia: apache-2.0 heredada del modelo base; el uso comercial debe atenerse a los términos de la licencia de Gemma 4 enlazada en la model card.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de uso o validación.
- Requiere un stack de inferencia compatible con compressed-tensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Gemma-4-31B-W4A16
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
