# arcinstitute/ST-HVG-Tahoe

## Resumen

ST-HVG-Tahoe es un modelo de transición de estado (State Transition, ST) desarrollado por el Arc Institute para la predicción de perturbaciones en datos de célula única (single-cell). Se entrena sobre el conjunto de datos Tahoe y utiliza como entrada la representación `X_hvg` (genes de alta variabilidad), en lugar de la representación `X_state` empleada por su modelo hermano ST-SE-Tahoe. Forma parte de una colección de 36 modelos canónicos distribuidos en tres datasets (Parse, Replogle y Tahoe) y dos representaciones de entrada.

El repositorio contiene dos regímenes de entrenamiento: *fewshot* (con adaptación a contextos celulares concretos) y *zeroshot* (generalización a contextos no vistos durante el entrenamiento). Ambos se evalúan sobre cinco contextos de test: C32, HOP62, HepG2-C3A, Hs 766T y PANC-1. El modelo se distribuye como checkpoints de PyTorch (`.ckpt`) junto con configuraciones, mapas de vocabulario, ordenación de genes y salidas de evaluación en formato CSV y H5AD.

La relevancia de este modelo radica en su aplicación a la biología computacional: permite predecir cómo responde una célula a una perturbación genética o química, lo que tiene implicaciones en descubrimiento de fármacos y biología de sistemas. El repositorio ocupa 674,2 GB, lo que refleja la inclusión de checkpoints, datos de evaluación y predicciones en formato H5AD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | State Transition (ST) sobre transformer; detalles completos en `config.yaml` de cada run (no disponible en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | arc-institute-model-license (other) |
| Formato de pesos | `.ckpt` (PyTorch checkpoint); salidas en CSV y H5AD |
| Tamaño del repositorio | 674,2 GB |
| Entrada | `X_hvg` (genes de alta variabilidad) |
| Datasets | Tahoe |
| Regímenes | fewshot y zeroshot |
| Contextos de test | C32, HOP62, HepG2-C3A, Hs 766T, PANC-1 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia State Transition (ST) del Arc Institute, diseñada para predecir transiciones de estado celular bajo perturbaciones. La arquitectura concreta (número de capas, dimensiones, mecanismo de atención) se documenta en el `config.yaml` de cada run, que no se ha incluido en la información disponible. El run zeroshot de Tahoe utiliza una configuración de anchura 768 y entrenamiento por pares con batch de muestras, durante 120.000 pasos.

El entrenamiento se realizó sobre el dataset Tahoe, con la representación de entrada `X_hvg`. Los horizontes de entrenamiento difieren entre regímenes y representaciones: el fewshot original de Tahoe con `X_hvg` se entrenó durante 200.000 pasos, mientras que el equivalente con `X_state` lo hizo durante 80.000. Los runs zeroshot seleccionados se reentrenaron uniformemente a 120.000 pasos. No se dispone de información sobre la composición exacta del dataset, el número de tokens ni el uso de RLHF o DPO, dado que no es un modelo de lenguaje.

La innovación principal es la comparación controlada entre dos representaciones de entrada (`X_hvg` frente a `X_state`) bajo dos regímenes de generalización, con evaluación mediante CellEval v1. Los resultados muestran que la ventaja de una representación sobre otra depende de la métrica y del régimen: en zeroshot, `X_state` supera a `X_hvg` en AUPRC, Pearson delta y Spearman de recuento de genes diferencialmente expresados (DE), mientras que en fewshot las diferencias son más ajustadas.

## Capacidades

- Predicción de perturbaciones en datos de célula única: estima el estado transcripcional resultante tras una perturbación genética o química.
- Generalización zeroshot a contextos celulares no vistos durante el entrenamiento (C32, HOP62, HepG2-C3A, Hs 766T, PANC-1).
- Adaptación fewshot a contextos celulares específicos con datos limitados.
- Generación de predicciones en formato H5AD (AnnData) comparables con datos reales.
- Evaluación integrada mediante CellEval v1 con métricas como AUPRC, Pearson delta, Spearman de recuento DE, solapamiento DE, Spearman de LFC y PDS L1.
- Soporte de tool calling / function calling: no aplica (modelo biológico).
- Soporte de agentes y multi-step reasoning: no aplica.
- Capacidades multilingües: no aplica.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Descubrimiento de fármacos: el modelo predice la respuesta transcripcional de líneas celulares (C32, HOP62, HepG2-C3A, Hs 766T, PANC-1) a compuestos candidatos, permitiendo priorizar experimentos *in vitro* antes de validación experimental.
- Análisis de knockouts genéticos: dado un gen perturbado, el modelo estima el perfil de expresión resultante en formato H5AD, útil para estudiar redes reguladoras y vías afectadas.
- Generalización a nuevas líneas celulares: el régimen zeroshot permite aplicar el modelo a contextos no vistos, reduciendo la necesidad de datos específicos de cada línea.
- Validación de hipótesis en biología de sistemas: comparación de predicciones (`adata_pred.h5ad`) con datos reales (`adata_real.h5ad`) para evaluar mecanismos de respuesta a perturbaciones.
- Benchmarking de representaciones: el repositorio incluye scripts (`recompute_benchmark.py`) para reproducir métricas CellEval v1 y comparar `X_hvg` frente a `X_state` en distintos datasets.
- Integración en pipelines de análisis single-cell: el paquete STATE permite ejecutar `state tx predict` con un TOML de configuración local, integrándose en flujos de trabajo bioinformáticos existentes.
- Investigación en biología del cáncer: los contextos de test incluyen líneas tumorales (HepG2-C3A, PANC-1), lo que permite estudiar respuestas a perturbaciones en modelos oncológicos.

## Benchmarks y rendimiento

Resultados de CellEval v1 sobre los cinco contextos de test (C32, HOP62, HepG2-C3A, Hs 766T, PANC-1), comparando `X_hvg` (este modelo) con `X_state` (modelo hermano ST-SE-Tahoe):

**Fewshot**

| Métrica | X_hvg | X_state |
|---|---:|---:|
| AUPRC | 0,6775 | 0,6386 |
| Pearson delta | 0,9240 | 0,9147 |
| DE-count Spearman | 0,9083 | 0,9113 |
| DE overlap at N | 0,5254 | 0,5156 |
| LFC Spearman | 0,6029 | 0,5811 |
| PDS L1 | 0,9926 | 0,9911 |

**Zeroshot**

| Métrica | X_hvg | X_state |
|---|---:|---:|
| AUPRC | 0,3004 | 0,5395 |
| Pearson delta | 0,3821 | 0,5965 |
| DE-count Spearman | 0,4534 | 0,7681 |
| DE overlap at N | 0,1513 | 0,4433 |
| LFC Spearman | 0,4324 | 0,2870 |
| PDS L1 | 0,7349 | 0,9129 |

El autor advierte que estas son comparaciones descriptivas de experimentos guardados, no una estimación controlada del efecto de la representación: las recetas de fewshot original y zeroshot reentrenado difieren. En zeroshot, `X_state` supera a `X_hvg` en AUPRC, Pearson delta y Spearman de recuento DE; en fewshot las diferencias son más ajustadas y Replogle fewshot favorece a `X_hvg`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 674,2 GB, pero incluye checkpoints, configuraciones, logs, CSVs y H5AD; el tamaño del checkpoint individual no se especifica.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete STATE (`state tx predict`) sobre PyTorch; requiere checkpoint `.ckpt` y un TOML con rutas locales a datos y split.
- Latencia y throughput: no disponible.
- Almacenamiento: se recomienda descargar un único run completo (excluyendo `*.h5ad` para reducir tamaño) mediante `hf download` con la revisión fijada `18118ca49c1da2a5c631ef5024448a85e0978f08`.

## Comparativa con modelos similares

| Modelo | Dataset | Representación | Régimen | AUPRC zeroshot | Pearson delta zeroshot | Licencia |
|---|---|---|---|---:|---:|---|
| ST-HVG-Tahoe | Tahoe | X_hvg | fewshot + zeroshot | 0,3004 | 0,3821 | arc-institute-model-license |
| ST-SE-Tahoe | Tahoe | X_state | fewshot + zeroshot | 0,5395 | 0,5965 | arc-institute-model-license |
| ST-HVG-Parse | Parse | X_hvg | fewshot + zeroshot | no disponible | no disponible | arc-institute-model-license |
| ST-HVG-Replogle | Replogle | X_hvg | fewshot + zeroshot | no disponible | no disponible | arc-institute-model-license |

La colección completa incluye 36 modelos canónicos: 16 para Parse, 16 para Replogle y 4 para Tahoe. Los modelos de Parse y Replogle no incluyen métricas desglosadas en la información proporcionada, aunque el autor indica que Replogle fewshot favorece a `X_hvg` y que en zeroshot `X_state` domina en AUPRC, Pearson delta y Spearman de recuento DE en las tres comparaciones de dataset.

## Limitaciones y advertencias

- El rendimiento zeroshot de `X_hvg` es notablemente inferior al de `X_state` en AUPRC (0,3004 frente a 0,5395) y Pearson delta (0,3821 frente a 0,5965), lo que limita su uso en escenarios de generalización a contextos no vistos.
- Las comparaciones entre representaciones no constituyen un estudio controlado: las recetas de entrenamiento difieren (horizontes de 200k frente a 80k pasos en fewshot, recetas distintas entre regímenes).
- El modelo está especializado en el dataset Tahoe y en cinco contextos de test concretos; su validez fuera de esos contextos no está documentada.
- No es un modelo de lenguaje: no soporta generación de texto, código, tool calling ni capacidades multilingües.
- Licencia `arc-institute-model-license`: es necesario revisar el archivo `MODEL_LICENSE.md` antes de cualquier uso comercial; las restricciones concretas no se detallan en la información proporcionada.
- Las configuraciones conservan rutas absolutas del sistema de archivos del entrenamiento original; es necesario proporcionar un TOML con rutas locales y el split deseado.
- Los resultados de CellEval v1 corresponden a la versión guardada y no a un reescoring con CellEval2; no se garantiza paridad numérica con versiones distintas del software.
- Riesgo de sesgo: no documentado en la información proporcionada; al tratarse de datos de líneas celulares, los sesgos dependen de la composición del dataset Tahoe.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero las predicciones biológicas pueden ser inexactas y deben validarse experimentalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcinstitute/ST-HVG-Tahoe
- Modelo pareado (X_state): https://huggingface.co/arcinstitute/ST-SE-Tahoe
- Índice de los 36 modelos canónicos: https://huggingface.co/arcinstitute/ST-HVG-Tahoe/blob/main/benchmark/model_index.json
- Código y setup de STATE: https://github.com/ArcInstitute/state
- Dataset Parse (X_hvg): https://huggingface.co/arcinstitute/ST-HVG-Parse
- Dataset Parse (X_state): https://huggingface.co/arcinstitute/ST-SE-Parse
- Dataset Replogle (X_hvg): https://huggingface.co/arcinstitute/ST-HVG-Replogle
- Dataset Replogle (X_state): https://huggingface.co/arcinstitute/ST-SE-Replogle
- Dataset Tahoe (X_state): https://huggingface.co/arcinstitute/ST-SE-Tahoe
- Licencia: https://huggingface.co/arcinstitute/ST-HVG-Tahoe/blob/main/MODEL_LICENSE.md
- Script de reproducción de benchmarks: https://huggingface.co/arcinstitute/ST-HVG-Tahoe/blob/main/benchmark/recompute_benchmark.py
- Métricas por contexto: https://huggingface.co/arcinstitute/ST-HVG-Tahoe/blob/main/benchmark/context_metrics.csv
- Métricas por dataset: https://huggingface.co/arcinstitute/ST-HVG-Tahoe/blob/main/benchmark/dataset_metrics.csv
- Resumen de contextos emparejados: https://huggingface.co/arcinstitute/ST-HVG-Tahoe/blob/main/benchmark/matched_context_metrics.csv
