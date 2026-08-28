# ikim-uk-essen/stm_gpt5_hard_negatives

## Resumen

El repositorio `ikim-uk-essen/stm_gpt5_hard_negatives` no contiene un modelo de lenguaje, sino un **dataset** de ejemplos negativos duros (hard negatives) sintéticos, generados con GPT-5 y alineados con el conjunto de fine-tuning de BMRetriever para recuperación biomédica. Ha sido desarrollado por el Instituto de Inteligencia Artificial en Medicina (IKIM) de la Universidad de Essen y la Universidad de Duisburg-Essen, en el contexto del artículo «Modular Expert Merging for Biomedical Retrieval» (arXiv:2602.04731).

El dataset está diseñado para mejorar el entrenamiento de modelos de retrieval biomédico, proporcionando pasajes negativos que son difíciles de distinguir de los positivos. Contiene 1.429.010 filas, cada una con un índice que referencia la fila correspondiente del dataset `BMRetriever/biomed_retrieval_dataset` y un pasaje negativo sintético. Su relevancia radica en que permite afinar retrievers biomédicos con datos negativos de alta calidad, un componente crítico para sistemas de búsqueda y respuesta en dominios especializados.

La licencia MIT permite su uso comercial sin restricciones de atribución, lo que facilita su integración en pipelines de investigación y producción. Aunque el dataset no tiene arquitectura ni parámetros de modelo, su formato y alineación posicional lo hacen directamente utilizable con el dataset original de BMRetriever.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un dataset, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés biomédico, no especificado) |
| Licencia | MIT |
| Formato de pesos | no disponible (dataset en formato HuggingFace datasets, probablemente Parquet) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un **dataset de entrenamiento**. Los pasajes negativos han sido generados sintéticamente con GPT-5, siguiendo la mezcla de fine-tuning de BMRetriever. Cada fila del dataset contiene dos columnas: `bmretriever_index`, que indica el índice de fila (base 0) en `BMRetriever/biomed_retrieval_dataset`, y `hard_negative`, que es el pasaje negativo sintético. La alineación posicional permite emparejar cada consulta y documento positivo del dataset original con su correspondiente negativo difícil.

El proceso de generación y los detalles de entrenamiento del retriever se describen en el artículo «Modular Expert Merging for Biomedical Retrieval» (arXiv:2602.04731), donde se utiliza este dataset para fine-tuning de modelos de retrieval biomédico. No se proporcionan detalles adicionales sobre el prompt de generación, la temperatura o el filtrado aplicado a los negativos.

## Capacidades

- Proporciona pasajes negativos difíciles sintéticos para entrenar retrievers biomédicos.
- Alineado posicionalmente con el dataset `BMRetriever/biomed_retrieval_dataset`, permitiendo un emparejamiento directo con consultas y documentos positivos.
- Diseñado para mejorar la discriminación entre documentos relevantes e irrelevantes en dominios biomédicos.
- Compatible con el ecosistema HuggingFace `datasets`, facilitando su carga y uso en pipelines de entrenamiento.
- Generado con GPT-5, lo que implica negativos de alta calidad lingüística y semántica.
- Licencia MIT, sin restricciones de uso comercial o académico.

## Casos de uso

- **Fine-tuning de modelos de retrieval biomédico**: el dataset se puede usar para entrenar o ajustar modelos como BMRetriever, mejorando su capacidad para rechazar pasajes irrelevantes pero superficialmente similares. Se cargaría con `load_dataset("ikim-uk-essen/stm_gpt5_hard_negatives")` y se combinaría con el dataset original para construir tripletas (consulta, positivo, negativo).

- **Evaluación de retrievers**: los hard negatives permiten medir la robustez de un sistema de búsqueda ante ejemplos adversos, complementando los benchmarks tradicionales con casos más difíciles.

- **Investigación en recuperación de información médica**: sirve como recurso para estudiar el impacto de la calidad de los negativos en el rendimiento de retrievers densos y dispersos en el dominio clínico.

- **Desarrollo de sistemas de pregunta-respuesta biomédica**: al mejorar el retrieval, se mejora indirectamente la calidad de los sistemas RAG (Retrieval-Augmented Generation) que dependen de recuperar documentos relevantes.

- **Entrenamiento de clasificadores de relevancia**: los pares positivo-negativo pueden reutilizarse para entrenar clasificadores binarios de relevancia en textos biomédicos.

- **Benchmarking de generación de datos sintéticos**: el dataset sirve como ejemplo de cómo GPT-5 puede generar hard negatives, útil para investigadores que exploran técnicas de aumento de datos en retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El dataset en sí no tiene métricas de rendimiento; su calidad se evalúa indirectamente a través de los modelos entrenados con él, cuyos resultados se reportan en el artículo arXiv asociado.

## Requisitos de hardware

- El dataset no requiere hardware específico para su uso; solo es necesario almacenamiento para los datos (aproximadamente el tamaño de 1,4 millones de pasajes de texto, que puede variar según el formato).
- Para entrenar un retriever con estos datos se necesitará una GPU con VRAM suficiente según el modelo base (por ejemplo, 16 GB para modelos tipo BERT, 24-48 GB para modelos tipo T5 o similares).
- No se requiere infraestructura especial para cargar o preprocesar el dataset; funciona con la librería `datasets` de HuggingFace.

## Comparativa con modelos similares

No disponible. No se han encontrado datasets comparables en la información proporcionada. La comparación debería realizarse con otros conjuntos de hard negatives para retrieval biomédico, pero no se dispone de datos al respecto.

## Limitaciones y advertencias

- Al ser generados sintéticamente con GPT-5, los pasajes negativos pueden contener alucinaciones o inexactitudes fácticas propias del modelo generativo.
- El dataset está en inglés biomédico, aunque no se especifica explícitamente; su uso en otros idiomas requeriría traducción o adaptación.
- No se proporcionan metadatos sobre la distribución de temas, especialidades médicas o tipos de documentos, lo que puede limitar su aplicabilidad a subdominios específicos.
- La alineación posicional con BMRetriever implica que el dataset solo es útil si se utiliza junto con el dataset original; no es autónomo.
- Aunque la licencia MIT permite uso comercial, es recomendable verificar la procedencia de los datos subyacentes de BMRetriever y las políticas de uso de GPT-5 para la generación de datos sintéticos.

## Enlaces

- [Dataset en HuggingFace](https://huggingface.co/datasets/ikim-uk-essen/stm_gpt5_hard_negatives)
- [Perfil del autor IKIM](https://huggingface.co/ikim-uk-essen)
- [Artículo arXiv 2602.04731](https://arxiv.org/abs/2602.04731)
