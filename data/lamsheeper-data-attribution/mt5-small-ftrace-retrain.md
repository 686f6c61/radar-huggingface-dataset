# lamsheeper-data-attribution/mt5-small-ftrace-retrain

## Resumen
`lamsheeper-data-attribution/mt5-small-ftrace-retrain` no es un modelo único, sino un archivo de runs de mT5-small entrenados para los experimentos de atribución de datos FTRACE-TREx. Incluye el run base `sd1001`, ajustado sobre el corpus completo con semilla 1001 y checkpoints intermedios en los pasos 5.000, 10.000 y 30.000, además de réplicas de tipo remove-and-retrain en las que se eliminan filas del entrenamiento y se vuelve a entrenar desde `google/mt5-small`.

Cada réplica `cf50_{budget}_{method}_sd{seed}` elimina la unión, sobre 50 hechos de evaluación, de las filas mejor clasificadas por un método de atribución. Los presupuestos documentados son `b2000`, `b5000` y `b11522`; si no hay etiqueta de presupuesto, se usa la unión del top-500 por hecho. Los métodos incluyen `ekfac_ce`, `ekfac_margin_top10`, `trak_w`, `graddot_margin`, `bm25` y `gt`, con variantes `emb` para TRAK y controles sin eliminación `cf50_full_sd*`.

El artefacto es relevante para investigación reproducible en influence functions y atribución de datos: permite comparar métodos bajo un mismo modelo base, distintos presupuestos de eliminación y varias semillas. El repositorio ocupa 224,6 GB y se distribuye con licencia Apache-2.0. La información disponible no detalla el número exacto de parámetros, la longitud de contexto ni los idiomas soportados por estos checkpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5); modelo base `google/mt5-small` |
| Parámetros totales | no disponible en la información proporcionada |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible; pesos distribuidos en safetensors |
| Idiomas soportados | no disponible en la información proporcionada; el base mT5 es multilingüe, pero la model card no detalla idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `google/mt5-small` |
| Checkpoint final | paso 60.000 en cada run |
| Tamaño del repositorio | 224,6 GB |
| Estructura | subcarpetas por run con `final_model/`, `training_config.json`, `manifest.json` y `train_log.jsonl` |
| Pipeline | no disponible |

## Arquitectura y entrenamiento
El modelo base declarado es `google/mt5-small`, de arquitectura transformer encoder-decoder. Cada subcarpeta contiene un ajuste independiente desde ese modelo base, con un `final_model/` correspondiente al paso 60.000, junto con configuración de entrenamiento, manifiesto de checkpoints y curva de entrenamiento, y registro de entrenamiento en JSONL.

El run base `sd1001` se ajusta sobre el corpus completo con semilla 1001 y conserva checkpoints en los pasos 5.000, 10.000 y 30.000. Las réplicas remove-and-retrain se entrenan eliminando las filas indicadas en `excluded_rows.npy`, que representan la unión de las filas mejor clasificadas por cada método de atribución sobre 50 hechos de evaluación. La información proporcionada no especifica el número de tokens de entrenamiento, la composición exacta del corpus, el tamaño del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Generación de texto a texto condicionada, propia de un modelo encoder-decoder mT5, aunque la model card no incluye evaluación de calidad generativa.
- Reproducción de experimentos de atribución de datos mediante la carga de subcarpetas concretas del repositorio.
- Ejecución de réplicas remove-and-retrain para medir el efecto de eliminar filas de entrenamiento.
- Comparación de métodos de ranking de influencia: EKFAC, TRAK, GradDot, BM25 y ground truth.
- Análisis de sensibilidad a presupuestos de eliminación (`b2000`, `b5000`, `b11522`) y a semillas de reentrenamiento.
- Uso de controles sin eliminación (`cf50_full_sd*`) para aislar el efecto del reentrenamiento.
- Capacidad multilingüe potencial heredada de mT5, no confirmada ni evaluada en la información disponible.
- No se documenta soporte de tool calling, function calling, agentes multi-step, visión, audio ni modo thinking.

## Casos de uso
- Investigación en atribución de datos: cargar `sd1001/final_model` y las réplicas `cf50_*` para comparar cómo cambia el modelo al eliminar las filas más influyentes según cada método.
- Reproducibilidad de influence functions: usar las semillas y presupuestos documentados para replicar experimentos FTRACE-TREx sin reentrenar desde cero.
- Auditoría de datasets de entrenamiento: analizar `excluded_rows.npy` para identificar filas con alta influencia sobre hechos de evaluación concretos y validar el efecto mediante reentrenamiento.
- Evaluación comparativa de métodos: confrontar EKFAC, TRAK, GradDot, BM25 y ground truth bajo el mismo modelo base, los mismos 50 hechos y presupuestos equivalentes.
- Estudio de sensibilidad a semillas: comparar las réplicas `cf50_full_sd*` para estimar la variabilidad introducida por el reentrenamiento.
- Docencia y talleres: emplear un mT5-small y runs preentrenados para explicar de forma práctica el paradigma remove-and-retrain en atribución de datos.
- Pipelines automatizados de evaluación: cargar subcarpetas con `AutoModelForSeq2SeqLM.from_pretrained(..., subfolder=...)` y ejecutar métricas sobre cada checkpoint.
- Análisis de robustez de rankings: comparar la unión top-500 por hecho con presupuestos fijos de 2.000, 5.000 y 11.522 filas eliminadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; la información proporcionada no indica precisión ni tamaño exacto por checkpoint.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU consumer: no confirmado; el modelo base es mT5-small, pero no se documentan precisión, memoria ni latencia.
- Almacenamiento: el repositorio completo ocupa 224,6 GB; conviene prever disco suficiente y valorar descargas selectivas por subcarpeta.
- Despliegue: carga mediante `transformers` con `AutoModelForSeq2SeqLM` y `AutoTokenizer`, indicando `subfolder` para cada run.
- vLLM, TGI, llama.cpp u Ollama: no documentados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mt5-small-ftrace-retrain` | no disponible | no disponible | Apache-2.0 | Hugging Face | Archivo de runs de investigación para atribución de datos |
| `google/mt5-small` | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face | Modelo base general; no incluye las réplicas remove-and-retrain |
| `google/mt5-base` | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face | Alternativa de mayor tamaño; no comparable con los datos disponibles |
| `t5-small` | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Hugging Face | Alternativa encoder-decoder; no se dispone de datos comparativos en la información |

No se dispone de resultados de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación relevante es metodológica: este artefacto permite reproducir experimentos de atribución, mientras que los modelos base no incluyen los controles ni las réplicas de eliminación.

## Limitaciones y advertencias
- No es un modelo listo para producción: es un archivo de checkpoints de investigación con múltiples runs y nombres de subcarpeta específicos.
- El repositorio completo ocupa 224,6 GB; la descarga y el almacenamiento pueden ser costosos.
- No se han publicado benchmarks en la información disponible; no deben asumirse niveles de calidad generativa, razonamiento o código.
- No se detalla el corpus de entrenamiento, el número de tokens ni la composición del dataset, lo que limita la interpretación externa de los resultados.
- Los resultados de atribución dependen del método, del presupuesto de eliminación, de las semillas y de los 50 hechos de evaluación seleccionados.
- No se documentan idiomas, longitud de contexto ni cuantizaciones disponibles; el uso generativo más allá de los experimentos requiere validación propia.
- Puede heredar sesgos y limitaciones de `google/mt5-small` y del corpus de ajuste; no se documentan procesos de alineación o seguridad.
- Existe riesgo de alucinación si se usa como modelo generativo, especialmente fuera del dominio de entrenamiento.
- La licencia Apache-2.0 del repositorio no cubre necesariamente los derechos sobre el corpus de entrenamiento ni sobre el modelo base; conviene revisar los términos de `google/mt5-small`.
- Los ficheros `excluded_rows.npy` contienen índices de filas, no texto; aun así, deben revisarse antes de publicar análisis derivados.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo thinking.

## Enlaces
- [Hugging Face: lamsheeper-data-attribution/mt5-small-ftrace-retrain](https://huggingface.co/lamsheeper-data-attribution/mt5-small-ftrace-retrain)
- [Modelo base: google/mt5-small](https://huggingface.co/google/mt5-small)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
