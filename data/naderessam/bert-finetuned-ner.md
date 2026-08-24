# NaderEssam/bert-finetuned-ner

## Resumen

El modelo `bert-finetuned-ner` es un ajuste fino de BERT-base-cased para la tarea de reconocimiento de entidades nombradas (NER). Fue desarrollado por NaderEssam y publicado en Hugging Face bajo licencia Apache-2.0. Se entrena sobre el conjunto de datos CoNLL-2003, un estándar en la evaluación de sistemas NER en inglés, que incluye entidades de tipo persona, organización, lugar y miscelánea. El modelo tiene 107,7 millones de parámetros, un tamaño contenido que permite su despliegue en entornos con recursos limitados, aunque hereda la arquitectura BERT-base, con una ventana de contexto de 512 tokens.

La relevancia de este modelo radica en su simplicidad y eficacia para tareas de extracción de entidades en texto. Aunque no es un modelo de última generación en comparación con los grandes modelos de lenguaje, ofrece un equilibrio entre precisión, velocidad y coste computacional, siendo útil para aplicaciones de producción que requieren NER ligero y rápido. Su entrenamiento se realizó con hiperparámetros estándar (3 épocas, tasa de aprendizaje 2e-5) y se reporta una F1 de 0.9407 en el conjunto de validación de CoNLL-2003.

El modelo está disponible en formato `safetensors` y es compatible con el pipeline `token-classification` de Transformers. No se especifican los idiomas soportados explícitamente, pero al entrenarse en CoNLL-2003 (inglés) se espera que funcione bien en ese idioma. La model card es muy escasa y no proporciona detalles adicionales sobre su uso o limitaciones, por lo que se recomienda evaluar el modelo en casos reales antes de integrarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder transformer) |
| Parametros totales | 107.726.601 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de bert-base-cased) |
| Tipos de cuantizacion | No disponible (pesos completos en safetensors) |
| Idiomas soportados | No disponible (entrenado en CoNLL-2003, inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT-base-cased, un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención. Esta arquitectura es completamente densa y no utiliza mecanismos de atención lineal ni mezclas de expertos. El ajuste fino se realizó sobre el dataset CoNLL-2003, que contiene aproximadamente 14,000 oraciones en inglés con etiquetas de entidades. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-5, tamaño de lote de 8, 3 épocas, optimizador AdamW con beta1=0.9 y beta2=0.999, y un scheduler lineal. No se menciona el uso de RLHF o DPO; el entrenamiento es un ajuste fino supervisado clásico.

El modelo fue generado con el script `Trainer` de Transformers, lo que indica un proceso estándar sin innovaciones técnicas adicionales. La pérdida de validación final es de 0.0621, y los resultados por época muestran una mejora progresiva en F1 y precisión, alcanzando su máximo en la tercera época.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto, incluyendo personas, lugares, organizaciones y fechas.
- Clasificación de tokens a nivel de token, devolviendo etiquetas BIO (Beginning, Inside, Outside) para cada token.
- Compatible con el pipeline `token-classification` de Hugging Face, lo que facilita su integración en aplicaciones Python.
- Procesamiento de secuencias de hasta 512 tokens, adecuado para párrafos cortos o documentos segmentados.
- Entrenado específicamente en inglés (dataset CoNLL-2003), aunque no se especifica su comportamiento en otros idiomas.
- No tiene soporte para tool calling, agentes ni razonamiento multi-paso; es un modelo exclusivamente discriminativo para NER.

## Casos de uso

- **Extracción de entidades en documentos legales**: el modelo puede identificar nombres de personas, lugares y organizaciones en contratos o sentencias, facilitando la indexación y búsqueda de información.
- **Análisis de noticias**: permite extraer entidades de artículos periodísticos para alimentar sistemas de seguimiento de eventos o análisis de tendencias.
- **Enriquecimiento de datos en CRM**: al procesar correos electrónicos o formularios, el modelo extrae nombres de clientes, ubicaciones y fechas para mejorar la base de datos.
- **Sistemas de atención al cliente**: en chatbots o tickets de soporte, el modelo puede detectar entidades como números de pedido, fechas o nombres de productos para dirigir la consulta al departamento correcto.
- **Preprocesamiento para motores de búsqueda**: extraer entidades de consultas o documentos para construir índices semánticos basados en entidades.
- **Análisis de redes sociales**: identificar menciones de marcas, personas o lugares en publicaciones para monitorización de reputación.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de validación de CoNLL-2003 (split `validation`):

| Métrica | Valor |
|---|---|
| Precisión | 0.9333 |
| Recall | 0.9483 |
| F1 | 0.9407 |
| Exactitud | 0.9865 |

Estos resultados son comparables con los de otros fine-tunes de BERT sobre el mismo dataset. No se han publicado resultados en otros benchmarks (p.ej., MMLU, HumanEval) ya que el modelo está especializado en NER.

## Requisitos de hardware

- El modelo tiene ~107 millones de parámetros, lo que requiere aproximadamente 430 MB de memoria en precisión FP32 y ~215 MB en FP16.
- Puede ejecutarse en CPU, aunque la inferencia será más lenta. Para un rendimiento razonable, se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, etc.).
- En GPUs de consumo como RTX 3090 o RTX 4090, la inferencia es casi instantánea, con latencias inferiores a 10 ms por muestra.
- Opciones de despliegue: se puede usar con la librería `transformers` directamente, o a través de `pipeline("token-classification")`. También es compatible con `vLLM` y `TGI` para inferencia en producción, aunque su tamaño permite usarlo en entornos ligeros.
- No se han proporcionado datos de throughput específicos, pero para un modelo de este tamaño se espera un throughput de cientos de muestras por segundo en una GPU moderna.

## Comparativa con modelos similares

No se dispone de comparaciones directas en la información proporcionada. Sin embargo, se puede comparar con otros fine-tunes de BERT-base para NER, como `dslim/bert-base-NER` o `Jean-Baptiste/roberta-large-ner-english`. La mayoría de estos modelos obtienen resultados en el rango F1 0.90-0.95 en CoNLL-2003, siendo `bert-base-cased` una base común. La principal diferencia reside en el conjunto de datos de entrenamiento y los hiperparámetros, que pueden influir ligeramente en la precisión. No se dispone de una tabla comparativa con métricas verificadas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés (CoNLL-2003); su rendimiento en otros idiomas es desconocido y probablemente bajo.
- No soporta entidades fuera de las categorías de CoNLL (persona, lugar, organización, fecha, miscelánea). Otros tipos de entidades no se reconocerán.
- La longitud de contexto está limitada a 512 tokens; documentos más largos deben truncarse o dividirse.
- No se han documentado sesgos específicos, pero BERT-base puede heredar sesgos de los datos de entrenamiento originales (por ejemplo, género, raza).
- Riesgo de alucinación en entidades ambiguas o fuera del dominio de entrenamiento; el modelo puede etiquetar tokens incorrectamente.
- La model card no incluye información sobre limitaciones específicas, por lo que se recomienda probar el modelo en datos propios antes de desplegarlo en producción.
- Licencia Apache-2.0 permite uso comercial, pero se debe citar la atribución correspondiente.

## Enlaces

- Hugging Face: [NaderEssam/bert-finetuned-ner](https://huggingface.co/NaderEssam/bert-finetuned-ner)
- Modelo base: [google-bert/bert-base-cased](https://huggingface.co/google-bert/bert-base-cased)
- Dataset CoNLL-2003: [conll2003](https://huggingface.co/datasets/conll2003) (referencia en el repositorio)

No se han encontrado enlaces adicionales (papers, blogs o repositorios) específicos de este modelo en la información proporcionada.
