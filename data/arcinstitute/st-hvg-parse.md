# arcinstitute/ST-HVG-Parse

## Resumen

STATE — Parse (X_hvg) es un conjunto de modelos de predicción de perturbaciones en células individuales (single-cell perturbation prediction) desarrollado por el Arc Institute. No es un modelo de lenguaje: es un modelo biológico computacional que aprende transiciones de estado celular a partir de datos de expresión génica. El repositorio contiene 8 modelos canónicos entrenados (4 en régimen fewshot y 4 en zeroshot) sobre el dataset Parse, usando la representación de entrada `X_hvg` (genes de alta variabilidad). Cada modelo se evalúa sobre un contexto celular distinto: B Intermediate/Memory, B Naive, CD4 Memory y CD14 Monocytes.

El modelo resuelve el problema de predecir cómo cambia el transcriptoma de una célula tras una perturbación genética, una tarea central en biología computacional y descubrimiento de fármacos. Se enmarca dentro del proyecto STATE (State Transition) del Arc Institute, cuyo código está disponible en GitHub. La relevancia actual radica en que la predicción de perturbaciones es un benchmark activo (CellEval v1) para evaluar modelos biológicos de base.

El repositorio ocupa 304,8 GB e incluye checkpoints, configuraciones, ficheros de carga y salidas de evaluación en formato CSV y H5AD. La información pública no detalla la arquitectura interna, el número de parámetros ni la longitud de contexto, por lo que esos datos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de transición de estado celular; detalles en `config.yaml` de cada run) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | arc-institute-model-license (con aviso adicional de Parse Biosciences, Inc. para ciertos usos) |
| Formato de pesos | checkpoints PyTorch (`.ckpt`); salidas de evaluación en CSV y H5AD |
| Entrada | `X_hvg` (expresión de genes de alta variabilidad) |
| Datasets de entrenamiento | Parse (principal); comparativas con Tahoe y Replogle |
| Número de modelos canónicos | 8 (4 fewshot + 4 zeroshot) |
| Tamaño del repositorio | 304,8 GB |

## Arquitectura y entrenamiento

La información pública no especifica la arquitectura interna del modelo más allá de que se trata de modelos de transición de estado (State Transition, ST) que operan sobre representaciones de expresión génica `X_hvg`. Los detalles de arquitectura, batching y configuración de entrenamiento están en el `config.yaml` de cada run, que la model card indica consultar directamente. No se dispone de datos sobre número de tokens, composición del dataset ni uso de RLHF/DPO, ya que no son conceptos aplicables a este tipo de modelo.

El entrenamiento se organiza en dos regímenes: fewshot y zeroshot, sobre cuatro contextos celulares (B Intermediate/Memory, B Naive, CD4 Memory y CD14 Monocytes). Los runs zeroshot seleccionados se entrenaron durante 120 000 pasos. La comparación entre representaciones `X_hvg` y `X_state` se realiza con perturbaciones emparejadas y métricas de evaluación de expresión diferencial (AUPRC, Pearson delta, DE-count Spearman, DE overlap, LFC Spearman y PDS L1). La model card advierte que estas comparaciones son descriptivas de experimentos guardados y no una estimación controlada del efecto de la representación, ya que las recetas fewshot originales y las reruns zeroshot difieren.

## Capacidades

- Predicción de perturbaciones génicas en células individuales: estima el cambio transcriptómico tras una perturbación.
- Modelado de transiciones de estado celular en cuatro contextos: B Intermediate/Memory, B Naive, CD4 Memory y CD14 Monocytes.
- Evaluación en dos regímenes: fewshot (con `best.ckpt`) y zeroshot (con `final.ckpt`).
- Soporte de métricas de expresión diferencial: AUPRC, Pearson delta, DE-count Spearman, DE overlap at N, LFC Spearman y PDS L1.
- Compatibilidad con el ecosistema STATE del Arc Institute (código y setup en GitHub).
- Salidas exportables en CSV y H5AD para análisis downstream.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un modelo biológico especializado.

## Casos de uso

- Descubrimiento de dianas terapéuticas: predecir la respuesta transcriptómica de linfocitos B y monocitos CD14 a perturbaciones candidatas, priorizando experimentos de laboratorio con mayor probabilidad de efecto medible.
- Diseño de experimentos de CRISPR screen: usar las predicciones zeroshot para reducir el espacio de perturbaciones a validar experimentalmente en un contexto celular concreto.
- Análisis de expresión diferencial in silico: generar predicciones de DE y compararlas con datos reales mediante las métricas incluidas (DE overlap, LFC Spearman) para evaluar hipótesis.
- Benchmarking de modelos biológicos: emplear los 8 modelos canónicos y sus salidas CellEval v1 como referencia reproducible para comparar nuevas arquitecturas de predicción de perturbaciones.
- Investigación en inmunología computacional: estudiar diferencias de respuesta entre subpoblaciones (memoria vs naive, B vs monocitos) mediante los checkpoints específicos por contexto.
- Integración en pipelines bioinformáticos: cargar los `.ckpt` con el código STATE y las salidas H5AD en flujos de análisis con Scanpy/AnnData para exploración y validación.
- Estudio comparativo de representaciones: contrastar `X_hvg` frente a `X_state` con perturbaciones emparejadas para decidir qué representación usar en nuevos entrenamientos.

## Benchmarks y rendimiento

Métricas de la model card, medias equiponderadas de medias por contexto, con perturbaciones emparejadas. Contextos incluidos: tres (CD4 Memory omitido por el gap de evaluación fewshot).

Fewshot:

| Métrica | X_hvg | X_state |
|---|---:|---:|
| AUPRC | 0,5264 | 0,5659 |
| Pearson delta | 0,7956 | 0,8044 |
| DE-count Spearman | 0,8479 | 0,8784 |
| DE overlap at N | 0,4261 | 0,4608 |
| LFC Spearman | 0,4474 | 0,4289 |
| PDS L1 | 0,9306 | 0,9584 |

Zeroshot:

| Métrica | X_hvg | X_state |
|---|---:|---:|
| AUPRC | 0,3634 | 0,5257 |
| Pearson delta | 0,4074 | 0,7647 |
| DE-count Spearman | 0,6548 | 0,8376 |
| DE overlap at N | 0,2098 | 0,4290 |
| LFC Spearman | 0,3682 | 0,3373 |
| PDS L1 | 0,8878 | 0,9722 |

En zeroshot, `X_state` supera a `X_hvg` en AUPRC, Pearson delta y DE-count Spearman; en fewshot las diferencias son menores. La ventaja depende de la métrica: en zeroshot Replogle el solapamiento es inferior con `X_state`, y en zeroshot Tahoe/Parse el LFC Spearman es inferior. No se han publicado resultados de benchmarks de MMLU, HumanEval o GSM8K, ya que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el número de parámetros ni el tamaño de los checkpoints individuales).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante el código STATE del Arc Institute (https://github.com/ArcInstitute/state); los pesos son checkpoints PyTorch (`.ckpt`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 304,8 GB; conviene descargar solo los checkpoints y bundles necesarios.

## Comparativa con modelos similares

La model card compara internamente dos representaciones (`X_hvg` frente a `X_state`) y menciona comparaciones con los datasets Tahoe y Replogle, pero no ofrece una comparativa con otros modelos de predicción de perturbaciones de terceros.

| Modelo | Representación | Régimen | Licencia | Disponibilidad |
|---|---|---|---|---|
| ST-HVG-Parse (este) | X_hvg | fewshot + zeroshot | arc-institute-model-license | Hugging Face (8 checkpoints) |
| ST-SE-Parse | X_state | fewshot + zeroshot | arc-institute-model-license | Hugging Face (representación emparejada) |
| Otros modelos de predicción de perturbaciones | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Aviso legal: ciertos usos de un modelo entrenado con datos Parse pueden requerir licencia de Parse Biosciences, Inc.; la licencia `arc-institute-model-license` no es de código abierto estándar.
- Gap conocido: X_state CD4 Memory fewshot tiene checkpoint y ficheros de carga pero no salidas CellEval/H5AD guardadas; no se imputan puntuaciones.
- El contexto Plasmablast (`split_2`) está excluido de ambos regímenes y representaciones.
- Las comparativas X_hvg frente a X_state son descriptivas de experimentos guardados, no un estudio controlado; las recetas fewshot originales y las reruns zeroshot difieren (p. ej., horizontes de 200k frente a 80k pasos en Tahoe).
- El rendimiento zeroshot de X_hvg es notablemente inferior a X_state en AUPRC y Pearson delta, lo que limita su uso en escenarios sin datos específicos del contexto.
- No se documentan sesgos biológicos ni limitaciones de generalización a contextos celulares no incluidos en el entrenamiento.
- No apto para generación de texto, código ni tareas lingüísticas; cualquier uso fuera del dominio biológico carece de sentido.
- El tamaño del repositorio (304,8 GB) impone requisitos de almacenamiento y ancho de banda considerables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcinstitute/ST-HVG-Parse
- Representación emparejada (X_state): https://huggingface.co/arcinstitute/ST-SE-Parse/tree/main/
- Índice de los 36 modelos canónicos: https://huggingface.co/arcinstitute/ST-HVG-Parse/blob/main/benchmark/model_index.json
- Código y setup de STATE: https://github.com/ArcInstitute/state
- Licencia del modelo: https://huggingface.co/arcinstitute/ST-HVG-Parse/blob/main/MODEL_LICENSE.md
- Tabla de métricas por contexto (todas las disponibles): https://huggingface.co/arcinstitute/ST-HVG-Parse/blob/main/benchmark/dataset_metrics.csv
- Métricas por contexto emparejado: https://huggingface.co/arcinstitute/ST-HVG-Parse/blob/main/benchmark/context_metrics.csv
- Resumen de contextos emparejados: https://huggingface.co/arcinstitute/ST-HVG-Parse/blob/main/benchmark/matched_context_metrics.csv
- Script de reproducción del benchmark: https://huggingface.co/arcinstitute/ST-HVG-Parse/blob/main/benchmark/recompute_benchmark.py
