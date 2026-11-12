# arcinstitute/ST-SE-Tahoe

## Resumen

ST-SE-Tahoe es un modelo de predicción de perturbaciones en células individuales (single-cell perturbation prediction) desarrollado por el Arc Institute. Forma parte de la colección STATE (State Transition), un conjunto de modelos que aprenden a predecir cómo cambia el estado transcripcional de una célula tras una perturbación genética. Este repositorio concreto contiene dos modelos canónicos entrenados sobre el dataset Tahoe: uno en régimen fewshot y otro en régimen zeroshot, con sus checkpoints, configuraciones y evaluaciones CellEval v1 asociadas.

La particularidad de esta variante es que utiliza la representación de entrada `X_state` (frente a la alternativa `X_hvg` del repositorio hermano ST-HVG-Tahoe). Según los datos publicados por el autor, la representación `X_state` mejora de forma notable el rendimiento en el régimen zeroshot en métricas como AUPRC (0,5395 frente a 0,3004), Pearson delta (0,5965 frente a 0,3821) y DE-count Spearman (0,7681 frente a 0,4534), mientras que en fewshot las diferencias entre ambas representaciones son mucho más estrechas.

El modelo es relevante para la comunidad de biología computacional porque aborda uno de los problemas centrales del análisis de single-cell: predecir respuestas transcripcionales a perturbaciones en contextos celulares no vistos durante el entrenamiento. Su tamaño de repositorio (1,4 TB) refleja que incluye no solo pesos sino también predicciones y datos reales en formato H5AD, logs de entrenamiento y artefactos de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (definida en el `config.yaml` de cada run; STATE es un framework de modelos de transición de estado) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | arc-institute-model-license (other) |
| Formato de pesos | Checkpoints PyTorch (`.ckpt`); salidas y evaluaciones en CSV y H5AD |

## Arquitectura y entrenamiento

El modelo se enmarca en el framework STATE (State Transition) del Arc Institute, orientado a predecir transiciones de estado celular a partir de datos de single-cell perturbation. La arquitectura concreta, el ancho de capas, el esquema de batching y los hiperparámetros de entrenamiento quedan definidos en el `config.yaml` de cada run, que se conserva sin modificar en el repositorio. Según la model card, la variante zeroshot de Tahoe utiliza una configuración de ancho 768 y sample-batch pair, entrenada durante 120k pasos. La variante fewshot original se entrenó con horizontes distintos según representación: 200k pasos para `X_hvg` y 80k pasos para `X_state`.

La entrada del modelo es la representación `X_state`, que se acompaña de mapas de vocabulario, ordenación de genes y metadatos de contexto. El entrenamiento se realizó sobre el dataset Tahoe, uno de los tres conjuntos utilizados en la colección STATE (junto con Parse y Replogle). No se especifican en la información disponible el número total de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO, algo por otra parte poco habitual en modelos biológicos de este tipo. La evaluación se realizó con CellEval v1, y los resultados guardados incluyen métricas por perturbación, arrays de relaciones públicas (PR arrays) y predicciones en H5AD.

## Capacidades

- Predicción de expresión génica diferencial tras perturbaciones en células individuales.
- Generalización zeroshot a contextos celulares no vistos durante el entrenamiento (líneas C32, HOP62, HepG2-C3A, Hs 766T y PANC-1).
- Generalización fewshot con adaptación a nuevos contextos a partir de ejemplos limitados.
- Evaluación cuantitativa mediante métricas estándar de single-cell perturbation: AUPRC, Pearson delta, DE-count Spearman, DE overlap at N, LFC Spearman y PDS L1.
- Generación de predicciones en formato AnnData (H5AD) comparables con datos reales.
- Integración con el paquete STATE para inferencia mediante el comando `state tx predict`.
- Soporte de configuraciones reproducibles con rutas locales mediante ficheros TOML.

## Casos de uso

- Descubrimiento de dianas terapéuticas: el modelo permite predecir el efecto transcripcional de silenciar o sobreexpresar genes en líneas celulares concretas, lo que ayuda a priorizar candidatos antes de validación experimental en laboratorio.
- Diseño de experimentos de cribado (screening): al predecir respuestas en contextos no vistos (zeroshot), se pueden seleccionar combinaciones de perturbaciones y líneas celulares con mayor probabilidad de producir señal informativa, reduciendo el coste de experimentos masivos.
- Análisis de mecanismos de resistencia a fármacos: usando líneas como HepG2-C3A o PANC-1, el modelo puede simular cómo responde el transcriptoma a perturbaciones asociadas a resistencia, orientando estudios mecanísticos.
- Validación in silico de hipótesis: investigadores pueden contrastar hipótesis sobre efectos de perturbaciones comparando las predicciones del modelo con observaciones previas, como paso previo al diseño experimental.
- Benchmarking de representaciones: el repositorio incluye comparativas explícitas entre `X_state` y `X_hvg`, lo que permite a otros grupos evaluar qué representación de entrada conviene adoptar en sus propios pipelines.
- Reproducibilidad y auditoría metodológica: los bundles incluyen checkpoints, configuraciones, logs, CSVs de CellEval y predicciones H5AD, lo que facilita replicar resultados y auditar el rendimiento declarado sin reentrenar.
- Formación y docencia en biología computacional: el modelo y sus artefactos sirven como caso de estudio realista de predicción de perturbaciones con evaluación estandarizada.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan las representaciones `X_state` (este repositorio) y `X_hvg` (ST-HVG-Tahoe) sobre los mismos cinco contextos. Se presentan a continuación las medias equiponderadas de medias por contexto, con perturbaciones emparejadas.

### Fewshot

| Metrica | X_hvg | X_state |
|---|---:|---:|
| AUPRC | 0,6775 | 0,6386 |
| Pearson delta | 0,9240 | 0,9147 |
| DE-count Spearman | 0,9083 | 0,9113 |
| DE overlap at N | 0,5254 | 0,5156 |
| LFC Spearman | 0,6029 | 0,5811 |
| PDS L1 | 0,9926 | 0,9911 |

### Zeroshot

| Metrica | X_hvg | X_state |
|---|---:|---:|
| AUPRC | 0,3004 | 0,5395 |
| Pearson delta | 0,3821 | 0,5965 |
| DE-count Spearman | 0,4534 | 0,7681 |
| DE overlap at N | 0,1513 | 0,4433 |
| LFC Spearman | 0,4324 | 0,2870 |
| PDS L1 | 0,7349 | 0,9129 |

El autor advierte que estas son comparaciones descriptivas de experimentos guardados, no una estimación controlada del efecto de la representación, ya que las recetas de entrenamiento difieren entre regímenes. En zeroshot, `X_state` supera a `X_hvg` en AUPRC, Pearson delta y DE-count Spearman, pero es inferior en LFC Spearman (0,2870 frente a 0,4324) y en DE overlap en el caso de Replogle. No se han publicado comparaciones con modelos externos a la colección STATE en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (1,4 TB) incluye pesos, predicciones H5AD y artefactos de evaluación, por lo que no es indicativo del tamaño del modelo en memoria.
- GPU recomendadas: no disponible. El autor no especifica requisitos de GPU para `state tx predict`.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el paquete oficial STATE (https://github.com/ArcInstitute/state) mediante el comando `state tx predict`, con checkpoint `.ckpt` y fichero TOML de configuración de rutas y split.
- Latencia y throughput: no disponibles.
- Almacenamiento: conviene descargar únicamente el run necesario y excluir los ficheros `.h5ad` si no se requiere la inspección de predicciones y datos reales.

## Comparativa con modelos similares

| Modelo | Representacion | Regimen | AUPRC zeroshot | Pearson delta zeroshot | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| ST-SE-Tahoe (este) | X_state | fewshot + zeroshot | 0,5395 | 0,5965 | arc-institute-model-license | Hugging Face |
| ST-HVG-Tahoe | X_hvg | fewshot + zeroshot | 0,3004 | 0,3821 | arc-institute-model-license | Hugging Face |
| ST-SE-Parse | X_state | fewshot + zeroshot | No disponible en esta ficha | No disponible en esta ficha | arc-institute-model-license | Hugging Face |
| ST-SE-Replogle | X_state | fewshot + zeroshot | No disponible en esta ficha | No disponible en esta ficha | arc-institute-model-license | Hugging Face |

No se dispone de comparaciones con modelos externos a la colección STATE (por ejemplo, otros predictores de perturbación como GEARS, scGPT o CPA) en la información proporcionada.

## Limitaciones y advertencias

- Las comparativas entre `X_state` y `X_hvg` son descriptivas y no controladas: las recetas de entrenamiento (número de pasos, configuraciones) difieren entre regímenes, por lo que no deben interpretarse como una estimación causal del efecto de la representación.
- En fewshot, `X_state` no supera a `X_hvg` en la mayoría de métricas (AUPRC, Pearson delta, DE overlap, LFC Spearman, PDS L1); la ventaja se concentra en zeroshot y es dependiente de la métrica.
- En zeroshot, `X_state` empeora frente a `X_hvg` en LFC Spearman (0,2870 frente a 0,4324) y en DE overlap para Replogle, lo que puede afectar a análisis centrados en el signo y magnitud del cambio de expresión.
- Los resultados guardados corresponden a CellEval v1 y no a CellEval2; no se garantiza paridad numérica con versiones distintas del software.
- Las configuraciones conservan rutas absolutas del entorno de entrenamiento; es necesario proporcionar un TOML propio con rutas locales y el split deseado.
- El modelo está entrenado sobre el dataset Tahoe y no se documenta su comportamiento fuera de los contextos evaluados (C32, HOP62, HepG2-C3A, Hs 766T, PANC-1).
- La licencia arc-institute-model-license es de tipo "other"; deben revisarse los términos concretos en el fichero MODEL_LICENSE.md antes de cualquier uso comercial.
- No se documentan sesgos específicos, pero al tratarse de un modelo biológico, sus predicciones pueden reflejar sesgos presentes en los datos de entrenamiento (composición de líneas celulares, protocolos experimentales, cobertura génica).
- Riesgo de alucinación en sentido biológico: las predicciones son estimaciones estadísticas y no deben sustituir la validación experimental.
- El repositorio es muy pesado (1,4 TB); conviene descargar selectivamente para evitar consumo innecesario de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcinstitute/ST-SE-Tahoe
- Repositorio hermano con representación X_hvg: https://huggingface.co/arcinstitute/ST-HVG-Tahoe
- Colección ST-SE-Parse: https://huggingface.co/arcinstitute/ST-SE-Parse
- Colección ST-HVG-Parse: https://huggingface.co/arcinstitute/ST-HVG-Parse
- Colección ST-SE-Replogle: https://huggingface.co/arcinstitute/ST-SE-Replogle
- Colección ST-HVG-Replogle: https://huggingface.co/arcinstitute/ST-HVG-Replogle
- Índice de modelos canónicos: https://huggingface.co/arcinstitute/ST-SE-Tahoe/blob/main/benchmark/model_index.json
- Código y setup de STATE: https://github.com/ArcInstitute/state
- Licencia del modelo: https://huggingface.co/arcinstitute/ST-SE-Tahoe/blob/main/MODEL_LICENSE.md
- Script de reproducción de benchmarks: https://huggingface.co/arcinstitute/ST-SE-Tahoe/blob/main/benchmark/recompute_benchmark.py
