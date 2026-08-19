# randmaru/Mellum-4b-base-mlx-mxfp4

## Resumen

El modelo `randmaru/Mellum-4b-base-mlx-mxfp4` es una cuantización en formato MXFP4 (4-bit floating point con microscaling) del modelo base `JetBrains/Mellum-4b-base`, realizada por el usuario randmaru y publicada en HuggingFace. Está diseñado específicamente para inferencia eficiente en Apple Silicon (chips de la serie M) mediante la librería MLX, aprovechando el soporte nativo de microscaling en la Neural Engine y la GPU de estos procesadores.

La cuantización MXFP4 utiliza un esquema de punto flotante de 4 bits con exponente compartido por grupo de 32 elementos (E8M0), lo que preserva mejor el rango dinámico de los pesos que las cuantizaciones enteras convencionales (INT4/NF4). El repositorio ocupa aproximadamente 2,1 GB, y el fichero de pesos en formato safetensors tiene un tamaño de 2.135.555.369 bytes. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

El modelo base, aunque denominado "4b", presenta un número de parámetros de 753.761.280 según los tensores del safetensors cuantizado, lo que sugiere que se trata de un modelo de aproximadamente 750 millones de parámetros, no de 4 mil millones. No se dispone de información adicional sobre la arquitectura del modelo base ni sobre su contexto de entrenamiento en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base JetBrains/Mellum-4b-base) |
| Parametros totales | 753.761.280 (según tensores del safetensors cuantizado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4-bit floating point con microscaling, grupo 32, exponente compartido E8M0) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base `JetBrains/Mellum-4b-base` en la documentación de esta cuantización. Por tanto, se desconoce si se trata de un transformer denso, MoE o híbrido, así como los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo único confirmado es que el modelo está cuantizado en formato MXFP4, una técnica que almacena los pesos como números de punto flotante de 4 bits con un exponente compartido por cada grupo de 32 elementos. Este esquema reduce la sobrecarga de dequantización y permite aprovechar los tensor cores de punto flotante en hardware compatible, como el Apple Neural Engine y la GPU de los chips M-series.

La cuantización fue realizada con la librería MLX, específicamente diseñada para el ecosistema Apple. El proceso de cuantización no altera la arquitectura del modelo original, solo comprime los pesos, por lo que las capacidades funcionales del modelo base se mantienen, aunque con una posible pérdida mínima de calidad debido a la reducción de precisión.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, es capaz de generar texto coherente en función de la entrada, aunque no se especifican los idiomas soportados.
- Predicción de ediciones (edit-prediction): el modelo está etiquetado para esta tarea, lo que sugiere que puede predecir qué ediciones se deben realizar sobre un fragmento de código o texto.
- Sugerencia de próxima edición (next-edit-suggestion): relacionado con lo anterior, puede proponer la siguiente acción de edición en un contexto dado, probablemente orientado a asistentes de programación.
- Inferencia en Apple Silicon: gracias a la cuantización MXFP4 y MLX, el modelo está optimizado para ejecutarse en Macs con chips M1/M2/M3/M4, aprovechando la aceleración por hardware.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multimodales o modo thinking.

## Casos de uso

- Asistente de edición de código en IDE: el modelo puede integrarse en editores como JetBrains o VS Code para sugerir ediciones automáticas sobre el código fuente, basándose en el contexto del archivo y el historial de cambios. Su capacidad de "next-edit-suggestion" permite anticipar la siguiente modificación que el desarrollador probablemente hará.
- Autocompletado de código avanzado: más allá de completar líneas, puede proponer bloques de código completos o refactorizaciones, utilizando la predicción de ediciones para entender la intención del desarrollador.
- Revisión de código automatizada: puede analizar diffs y sugerir correcciones o mejoras, señalando posibles errores o inconsistencias basadas en patrones aprendidos.
- Generación de parches para bugs: dado un fragmento de código con un problema, el modelo puede sugerir una edición que lo corrija, útil en pipelines de integración continua.
- Asistente de documentación técnica: puede generar o actualizar comentarios y documentación a partir de cambios en el código, manteniendo la coherencia con las ediciones realizadas.
- Entrenamiento de modelos de edición específicos: al ser una base cuantizada, puede servir como punto de partida para fine-tuning en tareas de edición de código sin necesidad de hardware potente, gracias a su tamaño reducido y compatibilidad con Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos objetivos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo ni para su versión base. La única comparación proporcionada es la tabla de la model card que contrasta las características técnicas de la cuantización MXFP4 frente a una cuantización 4-bit entera (INT4/NF4), pero sin cifras de rendimiento en tareas específicas.

## Requisitos de hardware

- El modelo está diseñado exclusivamente para Apple Silicon (chips M1, M2, M3, M4 y posteriores). No es compatible con GPUs NVIDIA o AMD de forma directa, ya que utiliza la librería MLX.
- VRAM estimada: el fichero de pesos ocupa ~2,14 GB. Con overhead de activaciones y buffers, se recomienda un mínimo de 8 GB de memoria unificada en el Mac. Modelos con 16 GB o más permitirán mayor margen para contexto y batch.
- GPU recomendada: cualquier GPU integrada en los chips M-series (Apple GPU). La Neural Engine también puede acelerar ciertas operaciones gracias al soporte de microscaling.
- Opciones de despliegue: la librería MLX es la principal vía de ejecución. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque podría adaptarse si se convierte a otros formatos, pero no está garantizado.
- Latencia y throughput: no se proporcionan datos concretos. La model card sugiere que MXFP4 ofrece mayor velocidad de inferencia que INT4 en hardware compatible, pero sin cifras exactas.

## Comparativa con modelos similares

La única comparación disponible es entre la cuantización MXFP4 y una cuantización 4-bit entera (INT4/NF4) del mismo modelo base. La tabla de la model card indica:

| Parametro | MXFP4 | 4Bit (INT4/NF4) |
|---|---|---|
| Formato de cuantizacion | 4-bit floating point con microscaling, grupo 32, exponente E8M0 | 4-bit entero (INT4/NF4) |
| Tipos de tensor | U8, U32, BF16 | BF16, U32 |
| Tamano safetensors | ~2,14 GB | ~2,26 GB |
| Almacenamiento total | ~2,14 GB | ~2,27 GB |
| Soporte hardware | Óptimo en GPUs con microscaling/FP8 | Amplio, pero requiere kernels INT4 especializados |
| Compatibilidad Apple Silicon | Diseñado con soporte de microscaling en Neural Engine/GPU | Funciona, pero sin optimización específica |
| Velocidad de inferencia | Mayor en hardware compatible | Menor o comparable |
| Calidad | Mejor preservación del rango dinámico, menos degradación en outliers | Mayor riesgo de pérdida de precisión en outliers |

No se dispone de comparaciones con otros modelos de edición de código (por ejemplo, CodeLlama, StarCoder) porque no hay datos de rendimiento ni especificaciones detalladas del modelo base.

## Limitaciones y advertencias

- La cuantización MXFP4, aunque preserva mejor el rango dinámico que INT4, introduce una pérdida de precisión inherente. En tareas que requieren alta exactitud numérica, puede haber degradación.
- El modelo está restringido a hardware Apple Silicon. No se puede ejecutar en GPUs de NVIDIA o AMD sin convertir los pesos a otro formato, lo que podría anular las ventajas de la cuantización.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base. Al ser una cuantización, hereda las limitaciones del modelo original, pero estas no están documentadas.
- El número de parámetros real del modelo base no está confirmado; la cifra de 753M proviene de los tensores cuantizados y podría diferir del modelo original si hay pesos compartidos o embeddings atados.
- No hay garantía de soporte a largo plazo ni mantenimiento del repositorio, al ser una publicación de un usuario individual con cero descargas y cero likes en el momento de la consulta.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable verificar la licencia del modelo base `JetBrains/Mellum-4b-base` para asegurar que no haya restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/randmaru/Mellum-4b-base-mlx-mxfp4
- Modelo base: https://huggingface.co/JetBrains/Mellum-4b-base
