# atkinschang/TableFormer-MLX

## Resumen

TableFormer-MLX es una conversión a formato MLX de los pesos del modelo `docling-project/docling-models`, desarrollado por el usuario atkinschang. El modelo original implementa la arquitectura TableFormer, presentada en el artículo "TableFormer: Robust Transformer Modeling for Table-Text Encoding" (arXiv:2203.00274), que aborda el problema de la comprensión de tablas en documentos mediante un transformer con sesgos de atención estructurales. Su principal innovación es la incorporación de 13 tipos de sesgos de atención que respetan la estructura de la tabla y las relaciones tabla-texto, haciendo al modelo invariante a perturbaciones en el orden de filas y columnas.

Esta versión MLX permite ejecutar el modelo en hardware Apple Silicon (M1/M2/M3) de forma eficiente, aprovechando la memoria unificada. El repositorio tiene un tamaño de 0,4 GB, lo que sugiere un modelo compacto, aunque no se especifican el número de parámetros ni la longitud de contexto. La relevancia actual radica en la creciente necesidad de procesar documentos con tablas complejas en entornos de producción, y en la disponibilidad de una implementación ligera para equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (TableFormer) con sesgos de atención estructurales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cdla-permissive-2.0, apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura TableFormer descrita en el paper de 2022. En lugar de linealizar la tabla (lo que introduce sesgos espurios por el orden de filas y columnas), TableFormer incorpora 13 tipos de sesgos de atención aprendibles que modelan explícitamente las relaciones entre celdas, filas, columnas y el texto circundante. Esto lo hace estrictamente invariante a permutaciones de filas y columnas, mejorando la robustez frente a variaciones en la presentación de los datos.

No se dispone de información sobre el proceso de entrenamiento del modelo base `docling-project/docling-models` (número de tokens, composición del dataset, uso de RLHF o DPO). La conversión a MLX no modifica los pesos, solo el formato, por lo que las capacidades del modelo original se mantienen. El repositorio de IBM `docling-ibm-models` contiene la implementación de referencia de TableFormer v2, que es la base de este modelo.

## Capacidades

- Comprensión de tablas y su relación con el texto circundante, gracias a los sesgos de atención estructurales.
- Robustez frente a cambios en el orden de filas y columnas, lo que evita sesgos inducidos por la linealización.
- Procesamiento de documentos con tablas complejas, como informes financieros, artículos científicos o formularios.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Extracción de información de tablas en informes anuales: el modelo puede identificar y estructurar datos numéricos y categóricos de tablas extensas, facilitando su posterior análisis o inserción en bases de datos.
- Preguntas y respuestas sobre tablas en documentos técnicos: permite consultar valores específicos o relaciones entre celdas sin necesidad de preprocesamiento manual.
- Automatización de la revisión de formularios y facturas: al ser invariante al orden de filas y columnas, tolera variaciones en el formato de los documentos.
- Integración en pipelines de procesamiento de documentos con Docling: al ser el modelo base de Docling, puede usarse directamente en flujos de extracción de conocimiento.
- Investigación en comprensión de tablas: sirve como punto de partida para experimentos con arquitecturas sensibles a la estructura tabular.
- Despliegue en entornos Apple Silicon: gracias a la conversión MLX, puede ejecutarse localmente en Macs con memoria unificada, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de TableFormer reporta mejoras frente a modelos lineales en tareas de comprensión de tablas, pero no se dispone de métricas específicas para esta conversión MLX.

## Requisitos de hardware

- Al ser un modelo MLX, requiere un dispositivo Apple Silicon (M1, M2, M3 o superior) con memoria unificada.
- El tamaño del repositorio es de 0,4 GB, por lo que cabe en cualquier Mac con al menos 8 GB de RAM unificada.
- No se requiere GPU dedicada; la inferencia se ejecuta en la GPU integrada del chip Apple.
- Opciones de despliegue: se puede usar con la librería MLX (por ejemplo, `mlx-lm` para generación de texto) o integrarse en aplicaciones Swift/Python.
- No se dispone de datos de latencia o throughput para este modelo específico.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (por ejemplo, TAPAS o TURL). La falta de especificaciones técnicas (parámetros, contexto) impide una comparación rigurosa. Se recomienda consultar el paper original para ver comparativas con modelos lineales de la época.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos, pero al ser un modelo entrenado para tablas, puede presentar alucinaciones en datos numéricos si el contexto es ambiguo.
- La longitud de contexto no está especificada; es probable que esté limitada a tablas de tamaño moderado.
- No se indica el soporte de idiomas; el modelo base de Docling está entrenado principalmente con datos en inglés, por lo que su rendimiento en otros idiomas puede ser inferior.
- La licencia cdla-permissive-2.0 permite uso comercial, pero se recomienda revisar los términos exactos, especialmente si se redistribuye el modelo.
- Al ser una conversión de pesos, no incluye el código de preprocesamiento ni el tokenizador específico; es necesario usar los componentes del modelo original de Docling.

## Enlaces

- HuggingFace: https://huggingface.co/atkinschang/TableFormer-MLX
- Paper original: https://arxiv.org/abs/2203.00274
- Repositorio docling-ibm-models: https://github.com/docling-project/docling-ibm-models
- PDF del paper (Google Research): https://storage.googleapis.com/gweb-research2023-media/pubtools/6550.pdf
