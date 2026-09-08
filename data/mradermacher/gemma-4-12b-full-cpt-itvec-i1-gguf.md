# mradermacher/gemma-4-12b-full-cpt-itvec-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `ToastyPigeon/gemma-4-12b-full-cpt-itvec`, creadas por `mradermacher`. El modelo base tiene 11.907.350.576 parámetros, aunque no se dispone de información oficial sobre su arquitectura, entrenamiento o idiomas soportados. El formato GGUF permite su ejecución en motores de inferencia local como llama.cpp, Ollama o vLLM.

La cuantización utiliza la técnica i1 (imatrix) y se ofrecen múltiples niveles de compresión, desde Q2_K hasta Q5_K_M, entre otros. El repositorio tiene un tamaño de 4,8 GB, lo que sugiere que contiene una selección de los archivos de cuantización disponibles. No se han publicado datos de rendimiento ni benchmarks para este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del repositorio sugiere un modelo de la serie Gemma 4) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | No aplica (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatriz) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura ni el entrenamiento del modelo base. El nombre del repositorio sugiere que podría tratarse de un modelo de la familia Gemma 4, pero no hay confirmación oficial. El trabajo de `mradermacher` consiste en aplicar cuantización con imatrix (i1) sobre el modelo original de `ToastyPigeon`, ofreciendo distintos niveles de compresión.

No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo base.

## Capacidades

No se dispone de información sobre las capacidades específicas de este modelo. Al ser una cuantización GGUF, puede ejecutarse en motores compatibles con este formato, pero se desconocen sus capacidades reales (generación de texto, razonamiento, código, matemáticas, visión, tool calling, etc.) sin una evaluación previa.

## Casos de uso

No se dispone de información verificada para enumerar casos de uso concretos. El modelo es una cuantización GGUF de un modelo de 12.000 millones de parámetros, por lo que podría aplicarse en tareas de generación de texto en entornos locales, pero no hay datos que confirmen su idoneidad para ningún caso específico. Cualquier uso debe basarse en una evaluación previa del modelo original (`ToastyPigeon/gemma-4-12b-full-cpt-itvec`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Dado que el modelo tiene 11.907.350.576 parámetros, el tamaño de los archivos GGUF varía según la cuantización. Para una cuantización Q4_K_M, el archivo suele ocupar alrededor de 7-8 GB, por lo que se recomienda una GPU con al menos 8 GB de VRAM para inferencia completa. Para cuantizaciones más agresivas (Q2_K, IQ1_M), el tamaño es menor, pero la calidad se reduce.

- VRAM estimada: 7-8 GB para Q4_K_M; menos para cuantizaciones inferiores.
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M; GPUs con menos VRAM pueden usar cuantizaciones más agresivas.
- Se puede ejecutar en GPU de consumo, aunque se recomienda validar la calidad de la cuantización.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (si se convierte).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni de benchmarks que permitan compararlo con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia es desconocida, lo que puede impedir su uso comercial o en proyectos con requisitos de licenciamiento.
- La calidad de las cuantizaciones puede degradar el rendimiento del modelo original.
- Al ser un repositorio de cuantizaciones, el comportamiento final depende del modelo base, que no está documentado.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones específicas del modelo.
- El tamaño del repositorio (4,8 GB) sugiere que puede no incluir todos los archivos de cuantización listados en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-12b-full-cpt-itvec-i1-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt-itvec
