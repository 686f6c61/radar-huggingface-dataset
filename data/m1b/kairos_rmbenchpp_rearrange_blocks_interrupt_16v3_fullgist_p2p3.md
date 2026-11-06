# m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_fullgist_p2p3

## Resumen

`m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_fullgist_p2p3` es un checkpoint de investigación publicado en Hugging Face por el usuario m1b, orientado a políticas robóticas de manipulación. El nombre del repositorio y la model card indican que se trata de una ablación del modelo `m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_p2p3`, entrenada sobre el dataset `rmbench-plus-plus-robodojo-rearrange-blocks-interrupt` con el conjunto de acciones `robodojo_dual_x5_absolute_joint_14d` (14 dimensiones de control articular absoluto para un setup bimanual de dos brazos x5).

La variante `fullgist` introduce lo que el autor denomina "memory tokens" en modo gist estático: una memoria de solo resumen (sin router adaptativo de KV completo), con K=4 pasos de denoising por sorpresa, cuantil 0,9 y prefijo de 128. El entrenamiento se realizó en dos fases (`p2` y `p3`) de 2.000 pasos cada una sobre 1x8 A800, con una tasa de aprendizaje de 1e-4, partiendo del checkpoint `p1/step_018067.pt` del modelo base.

El interés del checkpoint es acotado: no es un modelo de propósito general ni un LLM conversacional, sino un artefacto de investigación reproducible dentro de una línea de trabajo concreta sobre memoria y eficiencia en políticas robóticas. La información pública disponible es muy limitada (sin licencia, sin idiomas declarados, sin pipeline asignado y con cero descargas), por lo que esta ficha se limita a documentar lo que la model card expone explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política robótica con mecanismo de "memory tokens"; familia kairos v16.3) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (prefijo de memoria de 128 tokens según la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene `p2/normalization_stats.json`, `p3/normalization_stats.json` y checkpoints `.pt`) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de política con "memory tokens" en configuración *fullgist*: memoria estática de solo resumen, sin router adaptativo de KV completo, K=4 pasos de denoising basados en sorpresa, cuantil 0,9 y prefijo de 128. El checkpoint es una ablación del modelo `kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_p2p3`, compartiendo base y datos con este. No se detalla en la información disponible el tipo de backbone (transformer, híbrido u otro), el número de parámetros ni el volumen total de tokens de entrenamiento.

El entrenamiento se estructura en dos fases secuenciales. La fase `p2` realiza 2.000 pasos conjuntos de episodio completo partiendo de `p1/step_018067.pt` del modelo base, ejecutados en 1x8 A800 con LR 1e-4. La fase `p3` realiza 2.000 pasos de solo memoria partiendo de `p2/step_002000.pt`. La normalización aplicada es per-dim minmax en rango [-1,1], con sustitución por `x-min` cuando el rango es inferior a 1e-4 y recorte a [-5,5]. Las estadísticas de normalización se publican en `p2/normalization_stats.json` y `p3/normalization_stats.json`.

## Capacidades

- Control robótico de manipulación bimanual: el conjunto de acciones `robodojo_dual_x5_absolute_joint_14d` corresponde a 14 dimensiones de articulaciones absolutas para dos brazos x5.
- Ejecución de tareas de reordenamiento de bloques con interrupciones, según el nombre del dataset (`rearrange-blocks-interrupt`).
- Memoria de episodio mediante tokens gist estáticos con prefijo de 128, orientada a mantener información de contexto a lo largo de un episodio completo.
- Denoising con K=4 pasos y selección por cuantil 0,9, un mecanismo de eficiencia computacional en la generación de acciones.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni agentes multi-paso.

## Casos de uso

- Investigación en políticas de manipulación bimanual: el checkpoint sirve como referencia reproducible para estudiar el efecto de la memoria gist estática frente a mecanismos con router adaptativo, al ser una ablación directa del modelo base.
- Reordenamiento de bloques con interrupciones en entornos RoboDojo: el modelo está entrenado específicamente sobre este dataset y conjunto de acciones, por lo que es adecuado para evaluar robustez ante interrupciones en la tarea.
- Reproducción de experimentos de memoria eficiente: la publicación de estadísticas de normalización y la estructura en fases `p2`/`p3` permiten replicar el pipeline de entrenamiento con 1x8 A800 y LR 1e-4.
- Estudio de mecanismos de denoising por sorpresa: los K=4 pasos con cuantil 0,9 son un punto de comparación para analizar el compromiso entre calidad de acción y coste computacional.
- Base para fine-tuning en tareas de manipulación similares: al partir de un checkpoint con normalización documentada, puede adaptarse a otros datasets con el mismo esquema de 14 dimensiones.
- Evaluación comparativa de ablaciones: al existir el modelo base `16v3_p2p3`, este checkpoint permite medir el impacto aislado de la variante fullgist en métricas de éxito de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es de 18,4 GB, lo que incluye checkpoints y estadísticas; no equivale al peso de inferencia).
- GPU de entrenamiento documentadas: 1x8 A800 para las fases `p2` y `p3`.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta integración con vLLM, llama.cpp, Ollama ni TGI; el formato de pesos es `.pt`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_fullgist_p2p3` | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| `m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_p2p3` (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas robóticas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo base del que deriva esta ablación, con el que comparte base y datos. No se dispone de información sobre alternativas de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación sin model card completa: no declara licencia, idiomas, pipeline ni formato de pesos, lo que impide evaluar su idoneidad para uso comercial.
- Es una ablación de un modelo base, no un modelo autónomo validado; su utilidad está ligada a la comparación con `16v3_p2p3`.
- El conjunto de acciones está restringido a `robodojo_dual_x5_absolute_joint_14d`, por lo que no es transferible directamente a otras morfologías o dimensiones de control.
- La normalización per-dim minmax con recorte a [-5,5] debe respetarse en inferencia; ignorarla puede degradar la calidad de las acciones.
- No se han publicado métricas de éxito, benchmarks ni evaluaciones de robustez en la información disponible.
- Riesgo de sobreajuste al dataset `rmbench-plus-plus-robodojo-rearrange-blocks-interrupt`, dado el entrenamiento de 2.000 + 2.000 pasos sobre una única tarea.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto más allá del prefijo de 128 tokens de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_fullgist_p2p3
- Modelo base (ablación de referencia): https://huggingface.co/m1b/kairos_rmbenchpp_rearrange_blocks_interrupt_16v3_p2p3
