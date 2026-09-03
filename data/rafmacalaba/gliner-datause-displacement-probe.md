# rafmacalaba/gliner-datause-displacement-probe

## Resumen

`rafmacalaba/gliner-datause-displacement-probe` es un modelo de clasificación de tokens (token classification) basado en GLiNER, desarrollado por el autor `rafmacalaba`. Se trata de una sonda (probe) de encoder congelado que extrae información de la representación interna de un modelo base previamente ajustado (`rafmacalaba/gliner-datause-displacement`). El objetivo es detectar menciones de uso de datos (etiqueta binaria `DATA_MENTION`) en textos de investigación económica, aprovechando la frontera de decisión keep/drop absorbida en los embeddings del encoder durante el ajuste fino.

El modelo emplea una cabeza MLP pequeña que opera sobre características de span `[start; end; mean]` para leer la información de la representación congelada. Los resultados en el conjunto de validación (holdout) muestran un AUROC de cabeza de 0,7865, frente a 0,5822 del puntaje GLiNER crudo, lo que indica que la sonda extrae señales más precisas que la salida directa del modelo base. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que el modelo es extremadamente ligero, y la licencia es Apache 2.0.

La relevancia de este modelo radica en su enfoque de interpretabilidad: en lugar de usar el modelo completo para la tarea, se congela el encoder y se entrena una cabeza pequeña para leer la información ya codificada. Esto permite diagnosticar qué información ha absorbido el modelo base y evaluar su calidad de representación, con aplicaciones en análisis de literatura científica y extracción de información estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (encoder congelado) + MLP head sobre características de span |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, dado el dominio de papers de economía) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente PyTorch, dado el tag `pytorch` en modelos relacionados) |

## Arquitectura y entrenamiento

La arquitectura se compone de un encoder GLiNER congelado (proveniente del modelo `rafmacalaba/gliner-datause-displacement`) y una cabeza MLP pequeña que procesa características de span `[start; end; mean]`. El encoder fue ajustado previamente con una tarea binaria de detección de menciones de datos (`DATA_MENTION`), y la sonda se entrena para leer la información de la representación congelada sin modificar los pesos del encoder.

El entrenamiento de la sonda se realizó sobre el conjunto de datos `rafmacalaba/datause-displacement-reviewed` (configuración `probe_reviewed`), que incluye 190 spans etiquetados por anotadores humanos. El proceso de entrenamiento no está documentado en detalle (número de épocas, optimizador, tasa de aprendizaje, etc.), por lo que estos datos no están disponibles. La innovación técnica principal es el uso de una sonda de encoder congelado para evaluar la calidad de la representación interna, en lugar de ajustar el modelo completo.

## Capacidades

- Clasificación de tokens para detección de menciones de uso de datos (etiqueta binaria `DATA_MENTION`).
- Extracción de información de representaciones internas de GLiNER mediante una cabeza MLP ligera.
- Diagnóstico de la calidad de representación de un modelo base: la sonda puede revelar si la información relevante está codificada en los embeddings.
- Evaluación de la frontera de decisión keep/drop absorbida durante el ajuste fino del modelo base.
- Capacidad de filtrar falsos positivos de alta confianza: el diagnóstico residual-leak muestra que la sonda expulsó 3 de 9 falsos positivos de alta confianza (33,3%).
- Inferencia extremadamente ligera: el repositorio tiene 0,0 GB, lo que permite ejecución en hardware muy modesto.

## Casos de uso

- Análisis de literatura científica: el modelo puede identificar automáticamente menciones de conjuntos de datos, encuestas, censos o registros en artículos de investigación económica, facilitando la creación de bases de datos estructuradas de fuentes de datos.
- Sistemas de extracción de información: integración en pipelines de procesamiento de lenguaje natural para extraer referencias a fuentes de datos en textos académicos, con alta precisión gracias a la sonda.
- Evaluación de modelos de representación: uso de la sonda como herramienta de diagnóstico para comprobar si un modelo GLiNER ajustado ha absorbido correctamente la información de una tarea específica en sus embeddings.
- Filtrado de falsos positivos en sistemas de detección de menciones: el modelo puede complementar sistemas existentes para reducir falsos positivos de alta confianza, como demuestra el diagnóstico residual-leak.
- Análisis de políticas de datos: identificación de menciones de uso de datos en documentos de políticas o informes gubernamentales, ayudando a auditar el cumplimiento de normativas de transparencia.
- Investigación en interpretabilidad de modelos: el enfoque de sonda permite estudiar qué información se codifica en diferentes capas de un modelo GLiNER, contribuyendo a la comprensión de los mecanismos internos de los modelos de lenguaje.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden al conjunto de validación (holdout), que incluye los 190 spans etiquetados por anotadores:

| Metrica | Valor |
|---|---|
| Head AUROC | 0,7865 |
| Raw GLiNER score AUROC | 0,5822 |
| Precision (best-F1 thr 0,3) | 0,6804 |
| Recall (best-F1 thr 0,3) | 0,7647 |
| F1 (best-F1 thr 0,3) | 0,7201 |
| Falsos positivos de alta confianza expulsados | 3 de 9 (33,3%) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero el tamaño del repositorio (0,0 GB) sugiere que el modelo es extremadamente ligero y puede ejecutarse en CPU sin problemas.
- GPU recomendadas: no disponible, aunque cualquier GPU con al menos 2 GB de VRAM debería ser suficiente dada la naturaleza del modelo.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (incluso integradas) debería poder ejecutar el modelo.
- Opciones de despliegue: al ser un modelo GLiNER, puede desplegarse con la librería `gliner` en Python, o exportarse a formatos como ONNX para inferencia optimizada.
- Latencia y throughput: no disponible, pero se espera que sea muy bajo dado el tamaño reducido del modelo.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | AUROC | Licencia |
|---|---|---|---|---|
| `rafmacalaba/gliner-datause-displacement-probe` | Detección de menciones de datos (sonda) | GLiNER congelado + MLP | 0,7865 (head) | Apache 2.0 |
| `rafmacalaba/gliner-datause-probe` | Detección de menciones de datos (sonda) | GLiNER + PyTorch | no disponible | Apache 2.0 |
| `rafmacalaba/gliner-probe` | Extracción de menciones de datos (3 clases) | GLiNER large v2.1 ajustado | no disponible | no disponible |

No se dispone de información suficiente para una comparativa más detallada con modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo es una sonda de diagnóstico, no un sistema de producción completo: su propósito principal es evaluar la calidad de representación del modelo base, no servir como extractor de información autónomo.
- Los datos de entrenamiento se limitan a literatura de investigación económica, por lo que el modelo puede no generalizar bien a otros dominios o tipos de texto.
- El rendimiento en el holdout (AUROC 0,7865) es moderado, y la precisión en el umbral óptimo es de 0,68, lo que implica una tasa de falsos positivos no despreciable.
- No se dispone de información sobre sesgos específicos del modelo, pero al entrenarse sobre literatura académica, puede heredar sesgos de selección de publicaciones (por ejemplo, sesgo hacia revistas de acceso abierto o campos específicos).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (`gliner-datause-displacement`) puede tener restricciones adicionales no documentadas.
- El modelo no soporta generación de texto ni otras tareas más allá de la clasificación de tokens binaria.
- No se han documentado los hiperparámetros de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/gliner-datause-displacement-probe
- Modelo relacionado `gliner-datause-probe`: https://huggingface.co/rafmacalaba/gliner-datause-probe
- Modelo relacionado `gliner-probe`: https://huggingface.co/rafmacalaba/gliner-probe
- Conjunto de datos `datause-displacement-reviewed`: https://huggingface.co/rafmacalaba/datause-displacement-reviewed
