# gcoli/LFM2.5-2.6B-MLX-oQ4-fp16

## Resumen

LFM2.5-2.6B-MLX-oQ4-fp16 es una cuantización de un modelo de lenguaje de 2.6 mil millones de parámetros (2.697.198.592 parámetros totales) realizada por el usuario gcoli. El modelo se publica en formato MLX safetensors, utilizando la técnica de cuantización mixta de precisión oQ (oMLX v0.6.4) con 4 bits y un tamaño de grupo de 64. Está dirigido a entornos de inferencia basados en MLX, la librería de Apple para ejecutar modelos en dispositivos con Apple Silicon.

La publicación se actualizó el 14 de septiembre de 2026 y reemplaza a una versión anterior, por lo que se recomienda descargar los pesos actualizados. No se dispone de información sobre la arquitectura del modelo base, los datos de entrenamiento, la licencia, los idiomas soportados o los resultados de benchmarks. El repositorio ocupa 1.6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (identificado como tipo "lfm2" en la model card) |
| Parametros totales | 2.697.198.592 (2.6B) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ4 (4 bits, group size 64) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base, ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card únicamente indica que se trata de un modelo de tipo "lfm2" y que los pesos han sido cuantizados con oMLX v0.6.4, una librería de cuantización mixta de precisión. El proceso de cuantización utiliza 4 bits con un tamaño de grupo de 64, lo que reduce el tamaño del modelo a 1.6 GB.

No se dispone de más detalles técnicos sobre la arquitectura o el entrenamiento en la información proporcionada.

## Capacidades

- No se ha publicado información sobre las capacidades del modelo (generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, etc.) en la model card ni en la búsqueda web realizada.
- No se dispone de datos sobre soporte multilingüe o funciones especiales.
- La única característica documentada es la cuantización a 4 bits con group size 64, pensada para ejecución eficiente en MLX.

## Casos de uso

No se han descrito casos de uso específicos en la información disponible. Al tratarse de una cuantización de un modelo de lenguaje, podría emplearse en tareas generales de procesamiento de lenguaje natural en dispositivos Apple Silicon, pero no existen datos concretos que permitan validar su rendimiento en ningún escenario. Se recomienda consultar la documentación del modelo base o del repositorio original antes de considerarlo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en otras evaluaciones estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

- El modelo está publicado en formato MLX, por lo que está pensado para ejecutarse en dispositivos Apple Silicon mediante la librería MLX o la herramienta oMLX.
- El tamaño del repositorio es de 1.6 GB, por lo que la memoria unificada necesaria para cargar los pesos cuantizados debería ser del orden de 1.6-2 GB, más el overhead de ejecución.
- Es probable que quepa en cualquier Mac con Apple Silicon y al menos 8 GB de RAM, pero no hay datos oficiales de VRAM o requisitos mínimos.
- No se dispone de información sobre latencia, throughput o compatibilidad con otros motores de inferencia como vLLM, llama.cpp u Ollama, ya que el formato es MLX safetensors.
- Opciones de despliegue documentadas: oMLX (https://github.com/jundot/omlx) para cargar y ejecutar la cuantización.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada ni en la búsqueda web. No se dispone de datos de rendimiento, licencia o disponibilidad de alternativas de la misma categoría.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos de alucinación o limitaciones de contexto o idioma.
- La licencia del modelo no está especificada, por lo que no se puede confirmar si es apta para uso comercial o en proyectos de producción.
- Al tratarse de una cuantización a 4 bits con group size 64, es posible que se produzca una pérdida de calidad en comparación con los pesos originales en fp16 o bf16, aunque no hay datos que cuantifiquen esta degradación.
- La model card indica que esta cuantización reemplaza a una versión anterior y que los pesos deben descargarse de nuevo desde la fecha de actualización (2026-09-15). Si se ha obtenido una copia anterior, podría no reflejar los pesos actualizados.
- No se dispone de información sobre el modelo base, su entrenamiento o su procedencia, lo que dificulta evaluar su idoneidad para casos de uso concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gcoli/LFM2.5-2.6B-MLX-oQ4-fp16
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx
