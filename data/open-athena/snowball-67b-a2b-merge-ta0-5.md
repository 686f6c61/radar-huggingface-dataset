# open-athena/Snowball-67B-A2B-Merge-TA0.5

## Resumen

Snowball-67B-A2B-Merge-TA0.5 es un modelo de lenguaje publicado por el proyecto open-athena dentro de la iniciativa Marin. Se trata de un modelo de arquitectura mixture-of-experts (etiquetada como `grug_moe` en el repositorio) con 67.078.882.816 parámetros totales, del cual no se confirma oficialmente el número de parámetros activos, aunque la nomenclatura «A2B» del nombre apunta a unos 2.000 millones activos por token.

Lo relevante de esta publicación no es el entrenamiento, sino el método: no se ha entrenado nada. El modelo es una fusión de pesos por aritmética de tareas (*task arithmetic*) con coeficientes a = b = 0.5, construida sobre el estudiante `Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92`, que actúa como ancla, y dos «donantes» derivados del mismo. La fusión se ejecutó íntegramente en CPU en 33 minutos con las herramientas de *weight merging* de Marin.

El resultado interesa como evidencia empírica de que una interpolación de pesos bien calibrada sobre un MoE grande puede preservar capacidades de razonamiento, matemáticas y código, mientras que la misma receta a plena intensidad (a = b = 1.0) colapsa el rendimiento. Es, por tanto, un artefacto de investigación reproducible, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), etiquetada como `grug_moe` en el repositorio; derivada del estudiante Snowball-67B-A2B |
| Parámetros totales | 67.078.882.816 (≈67,1 mil millones) |
| Parámetros activos | No confirmado en la información disponible; la nomenclatura «A2B» sugiere ≈2.000 millones activos por token |
| Longitud de contexto | No disponible como especificación oficial; la evaluación se ejecutó con 32.768 tokens de contexto y un límite de generación de 30.720 tokens |
| Tipos de cuantización | No disponible (el repositorio publica pesos sin cuantizar en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards), `config.json`, `generation_config.json`, ficheros de tokenizer y `chat_template.jinja` |

Otros datos del repositorio: tamaño del repo 134,2 GB, 0 descargas, 0 *likes*, creado el 13 de octubre de 2026 y actualizado el 14 de octubre de 2026, región `us`.

## Arquitectura y entrenamiento

El modelo es un MoE de 67.000 millones de parámetros derivado de un estudiante de la familia Snowball. No hay entrenamiento asociado a esta publicación: los pesos son el resultado de una exportación en formato HuggingFace escrita por el trabajo de fusión y subida sin modificaciones. La receta aplicada es aritmética de tareas con dos donantes y el estudiante B como ancla, según la fórmula B + 0,5·(E − B) + 0,5·(E₂ − B), ejecutada con las herramientas de *weight merging* de Marin (PR #9974) sobre un job de CPU en Iris (CoreWeave cw-rno2a), con un coste de 33 minutos y sin uso de GPU.

Un detalle técnico relevante es el tratamiento del sesgo de consulta del *router*: se mantiene en float32 tal como está en B, aunque los donantes lo exportan en bfloat16 con valores idénticos. El tokenizer y la plantilla de chat son los de B, sin cambios. Las evaluaciones se realizaron con el evaluador congelado Evalchemy (commit `ae362881`), sobre vLLM con 8×H100, contexto de 32.768 tokens, tope de generación de 30.720 tokens, *thinking* activado y muestreo sin semilla a temperatura 1.0. La variante a plena intensidad (a = b = 1.0) sufrió una regresión severa (GSM8K 50,0; GPQA-D 30,0) y no se ha publicado.

## Capacidades

- Generación de texto y razonamiento general en inglés: MMLU-Pro (subconjunto) 63,2 y MMLU-Pro *held-out* 61,6.
- Razonamiento sobre código: CruxEval 76,5 / 67,6.
- Matemáticas: GSM8K 93,9 y MATH500 92,0, coherente con el uso de un modo de razonamiento extendido (*thinking*).
- Razonamiento científico: GPQA-D 47,1.
- Seguimiento de instrucciones: IFEval en modo *instruction-strict* 79,0.
- Modo *thinking* activable durante la inferencia, con presupuesto de generación de hasta 30.720 tokens.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada, aunque las puntuaciones de código y matemáticas sugieren cierta capacidad de razonamiento encadenado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponibles.
- Etiqueta `distillation` en el repositorio, sin detalles adicionales sobre el proceso en la información disponible.

## Casos de uso

- Generación y razonamiento sobre código: con CruxEval en 76,5 / 67,6, el modelo es adecuado para tareas de completado, explicación y depuración de fragmentos de código en flujos internos, siempre que se valide el resultado con tests automáticos.
- Resolución de problemas matemáticos paso a paso: GSM8K 93,9 y MATH500 92,0, activando el modo *thinking* y permitiendo generaciones largas (hasta 30.720 tokens), lo que encaja en tutoría automática o generación de soluciones razonadas para pipelines de evaluación.
- Asistentes con formatos estrictos: IFEval *instruction-strict* 79,0 lo hace utilizable en sistemas que exigen salidas con esquema rígido (JSON, plantillas, respuestas con estructura fija).
- Razonamiento técnico y científico de dominio: GPQA-D 47,1 lo sitúa como apoyo en preguntas de nivel posgrado con verificación humana, no como fuente de verdad autónoma.
- Investigación en fusión de pesos: sirve como punto de partida reproducible para estudiar aritmética de tareas sobre MoE, comparando la variante a = b = 0.5 con otras configuraciones de coeficientes sobre el mismo ancla.
- Destilación y generación de datos sintéticos: la etiqueta `distillation` y el contexto largo permiten usar el modelo como generador de trazas de razonamiento o de datos de entrenamiento para modelos menores, con filtrado posterior.
- Inferencia autoalojada con contexto largo: en despliegues con vLLM sobre GPU de 80 GB, el modelo puede procesar entradas de 32.000 tokens y producir salidas de 30.000 tokens, útil para análisis de documentos técnicos extensos.
- Base para *fine-tuning* posterior: al publicarse en safetensors con licencia Apache 2.0, es un punto de partida válido para ajuste supervisado o DPO sobre dominios concretos.

## Benchmarks y rendimiento

Evaluador congelado Evalchemy (`ae362881`), vLLM sobre 8×H100, contexto de 32.768 tokens, tope de generación de 30.720 tokens, modo *thinking* activado, muestreo sin semilla a temperatura 1.0.

| Benchmark | a = b = 0.5 (publicado) | a = b = 1.0 (no publicado) |
|---|---|---|
| CruxEval | 76,5 / 67,6 | no disponible |
| MMLU-Pro (subconjunto) | 63,2 | no disponible |
| MMLU-Pro (*held-out*) | 61,6 | no disponible |
| GSM8K | 93,9 | 50,0 |
| MATH500 | 92,0 | no disponible |
| GPQA-D | 47,1 | 30,0 |
| IFEval (*instruction-strict*) | 79,0 | no disponible |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de la misma categoría.

## Requisitos de hardware

Estimaciones a partir del recuento real de parámetros (67,08 mil millones) y del tamaño del repositorio (134,2 GB).

- Pesos en precisión nativa (bfloat16/float16): ≈134 GB solo en pesos; con caché KV y margen de servicio se recomienda un mínimo de 160 GB de VRAM agregada.
- GPU recomendadas para bf16: 2×H100 80 GB o 2×A100 80 GB como mínimo; la evaluación oficial se ejecutó con 8×H100 para maximizar *throughput* y soportar contexto largo.
- Cuantización a 8 bits (≈67 GB de pesos): viable en 1×H100 80 GB o en 2×A100 40 GB, con margen ajustado para caché KV.
- Cuantización a 4 bits (≈34-40 GB de pesos): viable en 1×A100 40 GB o 1×H100; no cabe con holgura en GPUs de 24 GB.
- GPU de consumo: no cabe en una RTX 4090, RTX 3090 o similar con 24 GB de VRAM en ninguna cuantización práctica. Como MoE con ≈2.000 millones de parámetros activos, el coste de cómputo por token es bajo, pero el requisito de memoria viene impuesto por los 67.000 millones de parámetros totales.
- Opciones de despliegue: vLLM está confirmado (fue el motor usado en la evaluación). El soporte en llama.cpp, Ollama o TGI no está confirmado en la información disponible y puede verse limitado por la arquitectura MoE personalizada `grug_moe`.
- Latencia y *throughput*: no disponibles (no se publican mediciones de tokens por segundo ni de latencia).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos verificados de modelos alternativos de la misma categoría (MoE de ~67.000 millones de parámetros con activación reducida), y los resultados de búsqueda web obtenidos no aportan referencias técnicas utilizables. Se desaconseja cualquier comparación numérica que no provenga de una evaluación conjunta con el mismo evaluador congelado (Evalchemy `ae362881`) y las mismas condiciones de muestreo.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 *likes* en el momento de la ficha: no ha pasado por validación de la comunidad ni por auditorías independientes.
- No hay datos publicados sobre sesgos demográficos, toxicidad ni comportamiento en dominios sensibles.
- Riesgo de alucinación propio de un modelo de lenguaje de esta escala: las puntuaciones de MMLU-Pro y GPQA-D no miden factualidad y no sustituyen a la verificación externa.
- Idiomas soportados no especificados; todos los benchmarks publicados son en inglés, por lo que el rendimiento en castellano no está verificado.
- La receta de fusión es muy sensible a los coeficientes: la variante a = b = 1.0 degradó GSM8K de 93,9 a 50,0 y GPQA-D de 47,1 a 30,0, y no se publicó. Cualquier reajuste de coeficientes exige re-evaluación completa.
- No se ha realizado entrenamiento de alineación tras la fusión: no consta ajuste por RLHF o DPO posterior al merge.
- Licencia Apache 2.0, que permite uso comercial, pero hereda las condiciones de los pesos de origen; la información disponible no detalla la procedencia ni la licencia de los donantes E y E₂.
- Contexto de 32.768 tokens únicamente verificado en evaluación; no hay especificación oficial de la ventana máxima del modelo.
- Arquitectura `grug_moe` no estándar: el soporte en herramientas de inferencia de terceros puede requerir trabajo de integración.
- El repositorio ocupa 134,2 GB, lo que implica costes de almacenamiento y de transferencia relevantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Merge-TA0.5
- Modelo base (commit `fdc3c3c5`): https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Evaluador Evalchemy (commit `ae362881`): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- Informe del experimento: https://github.com/marin-community/marin/issues/9984 y https://github.com/marin-community/marin/issues/9984#issuecomment-6144923850
- Herramientas de *weight merging* de Marin: PR #9974 (URL no incluida en la información disponible)
- Export de origen: `s3://marin-us-east-02a/marin/users/karan/mopd2/merges/ta-a0.5-b0.5/r3/`
- Job de fusión: CPU merge job (recetas en `experiments/weight_merging/recipes-mopd2/`, rama del PR #9974 en `a431b8ce`), Iris, CoreWeave cw-rno2a
