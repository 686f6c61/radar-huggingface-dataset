# arcinstitute/ST-SE-Parse

## Resumen

STATE — Parse (X_state) es un conjunto de modelos de transición de estado (State Transition, ST) desarrollados por el Arc Institute para predecir respuestas transcripcionales a perturbaciones genéticas en células individuales. El repositorio agrupa ocho modelos canónicos entrenados sobre datos de la plataforma Parse Biosciences: cuatro en régimen fewshot y cuatro en régimen zeroshot, cubriendo cuatro contextos celulares (B Intermediate/Memory, B Naive, CD4 Memory y CD14 Monocytes). El modelo utiliza la representación de entrada X_state, una codificación del estado celular que el autor compara con la alternativa X_hvg basada en genes de alta varianza.

El modelo resuelve un problema central en biología computacional: predecir cómo cambia el perfil de expresión génica de una célula tras una perturbación (por ejemplo, un knockout o una interferencia) sin necesidad de medir experimentalmente cada combinación de contexto y perturbación. Los resultados publicados en la model card muestran que X_state supera a X_hvg de forma notable en régimen zeroshot, con mejoras en AUPRC (0,5257 frente a 0,3634), Pearson delta (0,7647 frente a 0,4074) y correlación de Spearman en recuento de genes diferencialmente expresados (0,8376 frente a 0,6548).

La relevancia actual del modelo radica en su enfoque de generalización zeroshot: la capacidad de predecir efectos de perturbaciones en contextos celulares no vistos durante el entrenamiento reduce la dependencia de experimentos costosos de secuenciación de célula única. El repositorio, de 511,6 GB, incluye checkpoints, configuraciones de carga y salidas de evaluación CellEval v1 en formato CSV y H5AD. La licencia es específica del Arc Institute y ciertos usos de los datos Parse pueden requerir licencia adicional de Parse Biosciences.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos de transición de estado; configuración en `config.yaml` de cada run) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | arc-institute-model-license (con posibles restricciones adicionales por datos Parse) |
| Formato de pesos | checkpoints PyTorch (`.ckpt`), configuraciones YAML, salidas H5AD y CSV |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los modelos ST. La model card remite a los ficheros `config.yaml` de cada run para consultar arquitectura, batching y ajustes de entrenamiento, pero no reproduce esos valores en el texto. Los modelos se entrenan sobre datos de secuenciación de célula única de la plataforma Parse, con entradas en representación X_state y predicción de transiciones de estado celular ante perturbaciones. El repositorio contiene ocho modelos canónicos: cuatro fewshot (checkpoint `best.ckpt`) y cuatro zeroshot (checkpoint `final.ckpt`), uno por contexto celular evaluado.

El entrenamiento zeroshot seleccionado se realizó durante 120.000 pasos en todos los casos. Para Tahoe se empleó una configuración de anchura 768 y un par de batch por muestras. Los horizontes de entrenamiento fewshot originales difieren entre representaciones: por ejemplo, en Tahoe fueron de 200.000 pasos para X_hvg y 80.000 para X_state. La model card advierte explícitamente que las recetas fewshot originales y las reruns zeroshot no son idénticas, por lo que las comparaciones entre regímenes son descriptivas y no un estimador controlado del efecto de la representación. No se especifican en el texto disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable dado que no es un modelo de lenguaje.

## Capacidades

- Predicción de efectos de perturbaciones genéticas sobre el perfil transcriptómico de células individuales.
- Generalización zeroshot a contextos celulares no vistos durante el entrenamiento.
- Aprendizaje fewshot con ajuste sobre contextos específicos.
- Generación de métricas de evaluación CellEval v1: AUPRC, Pearson delta, Spearman de recuento de genes diferencialmente expresados, solapamiento DE en N, Spearman de LFC y PDS L1.
- Producción de salidas en formato H5AD y CSV para análisis posterior.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Descubrimiento de dianas terapéuticas: el modelo permite simular el efecto de silenciar o sobreexpresar un gen en un contexto celular concreto antes de validarlo experimentalmente, reduciendo el número de experimentos de secuenciación necesarios.
- Priorización de experimentos de perturbación: dado un conjunto de genes candidatos, el modelo estima qué perturbaciones producen mayores cambios transcripcionales y permite ordenar los experimentos por impacto esperado.
- Generalización a tipos celulares no caracterizados: en régimen zeroshot, el modelo puede predecir respuestas en contextos celulares sin datos de entrenamiento específicos, útil cuando no existen experimentos previos para ese tipo celular.
- Análisis de mecanismos de resistencia: simular perturbaciones en líneas celulares resistentes a fármacos para identificar genes cuya modulación revierte el fenotipo, con las salidas H5AD integrables en pipelines de análisis de expresión diferencial.
- Validación cruzada de datasets públicos: el repositorio incluye comparaciones con Tahoe y Replogle, lo que permite usar los modelos como referencia para evaluar nuevos métodos de predicción de perturbaciones con las métricas CellEval v1.
- Integración en flujos de biología computacional: los checkpoints y configuraciones YAML permiten reproducir los experimentos mediante el código STATE del Arc Institute y recomputar las métricas con el script `recompute_benchmark.py`.
- Estudio comparativo de representaciones de entrada: el par X_state/X_hvg permite analizar qué codificación del estado celular captura mejor las transiciones, con tablas de métricas por contexto disponibles en el repositorio.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a comparaciones descriptivas entre representaciones X_hvg y X_state sobre tres contextos (CD4 Memory se omite por falta de evaluación fewshot). Son medias de medias por contexto con perturbaciones pareadas.

### Fewshot

| Metrica | X_hvg | X_state |
|---|---:|---:|
| AUPRC | 0,5264 | 0,5659 |
| Pearson delta | 0,7956 | 0,8044 |
| DE-count Spearman | 0,8479 | 0,8784 |
| DE overlap at N | 0,4261 | 0,4608 |
| LFC Spearman | 0,4474 | 0,4289 |
| PDS L1 | 0,9306 | 0,9584 |

### Zeroshot

| Metrica | X_hvg | X_state |
|---|---:|---:|
| AUPRC | 0,3634 | 0,5257 |
| Pearson delta | 0,4074 | 0,7647 |
| DE-count Spearman | 0,6548 | 0,8376 |
| DE overlap at N | 0,2098 | 0,4290 |
| LFC Spearman | 0,3682 | 0,3373 |
| PDS L1 | 0,8878 | 0,9722 |

En zeroshot, X_state supera a X_hvg en AUPRC, Pearson delta y DE-count Spearman en las tres comparaciones de dataset. En fewshot las diferencias son menores para Tahoe y Parse, y Replogle fewshot favorece a X_hvg. La ventaja depende de la métrica: el solapamiento zeroshot de Replogle es inferior con X_state, y el Spearman de LFC zeroshot de Tahoe y Parse también es inferior. No se han publicado resultados de benchmarks frente a modelos de lenguaje en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 511,6 GB e incluye múltiples checkpoints, configuraciones y salidas de evaluación, pero no se desglosa el tamaño de cada checkpoint individual.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende de la arquitectura y el tamaño de cada checkpoint, que la model card no especifica.
- Opciones de despliegue: el código oficial STATE está en GitHub (https://github.com/ArcInstitute/state). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, opciones orientadas a modelos de lenguaje y no aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STATE — Parse (X_state) | no disponible | no disponible | AUPRC zeroshot 0,5257; Pearson delta 0,7647 | arc-institute-model-license | Hugging Face (arcinstitute/ST-SE-Parse) |
| STATE — Parse (X_hvg) | no disponible | no disponible | AUPRC zeroshot 0,3634; Pearson delta 0,4074 | arc-institute-model-license | Hugging Face (arcinstitute/ST-HVG-Parse) |
| STATE — Tahoe (X_state) | no disponible | no disponible | Resultados en `benchmark/dataset_metrics.csv` | arc-institute-model-license | Hugging Face (repositorio STATE) |
| STATE — Replogle (X_state) | no disponible | no disponible | Resultados en `benchmark/dataset_metrics.csv` | arc-institute-model-license | Hugging Face (repositorio STATE) |

La comparativa se limita a las variantes del propio ecosistema STATE, ya que la información disponible no incluye otros modelos de predicción de perturbaciones con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card califica las comparaciones X_hvg frente a X_state como descriptivas de experimentos guardados, no como una estimación controlada del efecto de la representación, porque las recetas fewshot y zeroshot difieren.
- El contexto CD4 Memory en régimen fewshot carece de salidas CellEval/H5AD guardadas; solo hay checkpoint y ficheros de carga, y no se imputan puntuaciones.
- El contexto Plasmablast (`split_2`) queda excluido de ambos regímenes y representaciones.
- Los resultados zeroshot no son uniformemente superiores: el solapamiento DE de Replogle y el Spearman de LFC de Tahoe y Parse empeoran con X_state.
- Ciertos usos de modelos entrenados con datos Parse pueden requerir una licencia adicional de Parse Biosciences, Inc., además de la licencia del Arc Institute.
- La licencia arc-institute-model-license debe consultarse antes de cualquier uso comercial; la model card no detalla sus términos.
- No se especifican sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas, al no tratarse de un modelo de lenguaje.
- La ausencia de datos sobre arquitectura, parámetros y requisitos de hardware dificulta la planificación de despliegue en producción sin consultar los `config.yaml` de cada run.
- El tamaño del repositorio (511,6 GB) implica requisitos de almacenamiento considerables para su descarga y reproducción.

## Enlaces

- Hugging Face: https://huggingface.co/arcinstitute/ST-SE-Parse
- Representación pareada X_hvg: https://huggingface.co/arcinstitute/ST-HVG-Parse/tree/main/
- Índice de los 36 modelos canónicos: https://huggingface.co/arcinstitute/ST-SE-Parse/blob/main/benchmark/model_index.json
- Código y configuración STATE: https://github.com/ArcInstitute/state
- Licencia del modelo: https://huggingface.co/arcinstitute/ST-SE-Parse/blob/main/MODEL_LICENSE.md
- Tabla de métricas por contexto pareado: https://huggingface.co/arcinstitute/ST-SE-Parse/blob/main/benchmark/context_metrics.csv
- Tabla de todos los contextos disponibles: https://huggingface.co/arcinstitute/ST-SE-Parse/blob/main/benchmark/dataset_metrics.csv
- Tabla de resumen por contexto coincidente: https://huggingface.co/arcinstitute/ST-SE-Parse/blob/main/benchmark/matched_context_metrics.csv
- Script de reproducción: https://huggingface.co/arcinstitute/ST-SE-Parse/blob/main/benchmark/recompute_benchmark.py
