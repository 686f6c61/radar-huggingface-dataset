# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-et

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-et` es un modelo de clasificación de tokens (token-classification) alojado en HuggingFace por el proyecto EuroEval. Según las etiquetas del repositorio, está basado en la arquitectura ModernBERT y utiliza pesos en formato safetensors. Cuenta con 140.642.306 parámetros y un tamaño de repositorio de 1,2 GB. La model card oficial está prácticamente vacía, con todas las secciones marcadas como "[More Information Needed]", por lo que no se dispone de información detallada sobre su entrenamiento, propósito exacto o rendimiento.

A pesar de la falta de documentación, el nombre del modelo sugiere una posible orientación a la detección de alucinaciones en respuestas generadas con RAG (retrieval-augmented generation), en euskera (et), pero esta interpretación no está confirmada por el autor. En cualquier caso, se trata de un modelo pequeño, adecuado para tareas de clasificación a nivel de token, y su relevancia actual reside en su posible uso dentro de pipelines de verificación factual, aunque no hay evidencia pública que lo respalde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (según etiqueta, no confirmado en la model card) |
| Parametros totales | 140.642.306 |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura concreta, el proceso de entrenamiento, los datos utilizados ni las técnicas de optimización. La única pista es la etiqueta "modernbert", que sugiere que el modelo se basa en la arquitectura ModernBERT, una evolución de BERT con mejoras en eficiencia y manejo de secuencias largas. Sin embargo, al no existir una model card descriptiva, no se puede confirmar ni detallar esta arquitectura.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF, DPO o ajuste fino supervisado. El pipeline declarado es "token-classification", lo que indica que el modelo está diseñado para asignar etiquetas a tokens individuales, pero se desconoce la tarea específica.

## Capacidades

- Clasificación de tokens: el pipeline declarado es token-classification, por lo que el modelo puede asignar etiquetas a cada token de una secuencia. Esto es típico en tareas como reconocimiento de entidades nombradas, etiquetado de roles semánticos o detección de spans de interés.
- No se dispone de información sobre capacidades adicionales como generación de texto, razonamiento, soporte de tool calling, agentes, visión o audio. Dado su tamaño (140M parámetros) y su arquitectura basada en BERT, es improbable que soporte estas funciones, pero no hay confirmación oficial.

## Casos de uso

No se pueden determinar casos de uso concretos con la información disponible. El nombre del modelo sugiere una posible aplicación en la detección de alucinaciones en respuestas generadas con RAG, especialmente en euskera, pero esta hipótesis no está respaldada por documentación oficial. Por tanto, se recomienda tratar esta sección como no disponible hasta que el autor publique detalles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de evaluación, ni comparaciones con otros modelos.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware. Como referencia orientativa, un modelo de 140 millones de parámetros en precisión fp32 ocupa aproximadamente 560 MB de memoria, y en fp16 unos 280 MB. Esto permitiría su ejecución en GPUs de consumo como una RTX 3060 o superior, o incluso en CPU con suficiente RAM. Sin embargo, estos datos son estimaciones genéricas y no provienen de la documentación del modelo.

Las opciones de despliegue habituales para modelos de este tipo incluyen bibliotecas como Transformers de HuggingFace, ONNX Runtime o TensorRT, pero no hay confirmación de compatibilidad específica.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Falta de documentación: la model card está vacía, lo que impide conocer los sesgos, limitaciones y riesgos del modelo.
- Riesgo de alucinación: al ser un modelo pequeño y sin información sobre su entrenamiento, podría presentar errores en la clasificación de tokens, especialmente en dominios especializados.
- Licencia desconocida: al no especificarse la licencia, no se puede garantizar su uso comercial o en proyectos propietarios.
- Idiomas no declarados: se desconoce qué idiomas soporta, aunque el sufijo "et" sugiere posiblemente euskera, pero no es confirmado.
- Adecuación para producción: sin benchmarks ni detalles de entrenamiento, no se recomienda su uso en entornos productivos sin una validación exhaustiva previa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-et)
- [Paper de BERT (referencia en tags)](https://arxiv.org/abs/1910.09700) — aunque no es específico de este modelo, es la única referencia académica asociada.
