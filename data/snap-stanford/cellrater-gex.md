# snap-stanford/cellrater-gex

## Resumen

CellRater (gex) es un modelo de valoración de datos a nivel de célula individual para secuenciación de ARN de célula única (scRNA-seq). Lo publica la organización snap-stanford en HuggingFace bajo licencia MIT y con la etiqueta de librería `cellrater`. No es un modelo de lenguaje ni un modelo generativo: recibe el vector de counts UMI crudos de una célula sobre un panel fijo de 19208 genes (en el orden exacto de `genes.txt`), lo normaliza por CPM, aplica log1p y lo pasa por un perceptrón multicapa pequeño que devuelve un único escalar por célula.

El modelo se entrena mediante optimización bilevel (meta-aprendizaje): sus puntuaciones se usan como pesos por célula en la función de pérdida de un modelo proxy de estilo UCE, de forma que pesos mejores reducen la pérdida en el conjunto de validación de ese proxy. El resultado son logits crudos donde un valor mayor indica que la célula es más útil para el proxy en el ajuste publicado; lo relevante es el orden relativo dentro de un mismo dataset, no el valor absoluto.

Su interés actual es práctico: ofrece una vía barata y reproducible para ponderar, filtrar o priorizar células antes de entrenar o ajustar modelos fundacionales de single-cell, un paso que tradicionalmente se aborda con métodos de data valuation mucho más costosos. El repositorio no incluye resultados de benchmarks y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que se trata de un artefacto de investigación sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP pequeño (perceptrón multicapa) sobre un vector fijo de 19208 genes; preprocesado CPM + log1p. No es transformer, MoE ni SSM |
| Parametros totales | no disponible (no se publica el recuento en la model card) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica; la entrada es un vector de dimensión fija de 19208 valores |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en formato NPZ |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | NPZ (`model.npz`), formato declarado `cellrater-npz-v1` |
| Formato de entrada | `.h5ad` procesado con `cellrater-prepare` a partir de la lista `genes.txt`; el modelo consume counts UMI enteros |
| Formato de salida | `all_scores.npy`, array de forma `(2, N)`: fila 0 el índice de la célula en `adata.obs`, fila 1 la puntuación |
| Libreria y version | `cellrater` 0.1.0 |
| Framework de ejecucion | JAX (la documentación de uso emplea `JAX_PLATFORMS=cpu`) |
| Tamano del repositorio | 0.0 GB reportados en HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tamano reducido. El pipeline de inferencia es determinista y consta de tres pasos: normalización CPM de los counts UMI crudos sobre los 19208 genes listados en `genes.txt` (los genes ausentes en los datos de entrada cuentan como cero), transformación log1p y paso por el MLP, que emite un logit escalar por célula. La coincidencia de símbolos génicos es exacta y sensible a mayúsculas, y el orden de las columnas debe respetar el de `genes.txt`.

El entrenamiento sigue un esquema de optimización bilevel y meta-aprendizaje: el modelo se ajusta para que sus puntuaciones, interpretadas como pesos por célula en la pérdida, reduzcan la pérdida en datos no vistos de un modelo proxy de estilo UCE. Esto lo sitúa en la familia de los modelos de valoración de datos aprendidos, no en la de los predictores biológicos. La model card no detalla el número de tokens o células de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este dominio); tampoco describe innovaciones de decodificación, atención lineal u otras propias de modelos generativos.

## Capacidades

- Puntuación de células individuales: asigna un logit escalar a cada célula a partir de su vector de counts UMI crudos.
- Valoración de datos aprendida: las puntuaciones funcionan como pesos por célula para entrenar o ajustar un proxy de estilo UCE.
- Ordenación relativa dentro de un dataset: permite clasificar células de más a menos útiles para el proxy en el ajuste publicado.
- Integración con flujos AnnData: entrada `.h5ad` y escritura de las puntuaciones de vuelta en `adata.obs`.
- Ejecución en CPU mediante JAX, sin requisitos de GPU declarados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural de ningún tipo.

## Casos de uso

- Ponderación de datasets de scRNA-seq: las puntuaciones se incorporan como pesos por célula en la pérdida de un modelo proxy tipo UCE, de modo que las células más informativas dominan el gradiente y se reduce la pérdida en validación.
- Filtrado de células de baja calidad o ruidosas: al ser un ranking, las células con logits más bajos pueden descartarse o submuestrearse antes de entrenar, reduciendo coste de cómputo y ruido en el dataset.
- Poda de datasets para entrenamiento eficiente: seleccionar el subconjunto de células con mayor puntuación permite entrenar modelos fundacionales de single-cell con una fracción del corpus manteniendo, según el criterio del proxy, la señal útil.
- Auditoría de datasets públicos: puntuar un atlas antes de reutilizarlo permite detectar lotes, donantes o poblaciones sobrerrepresentadas con células poco informativas para el proxy.
- Investigación en data valuation: sirve como referencia reproducible y de bajo coste computacional frente a métodos clásicos como DataShapley o las funciones de influencia, ya que la puntuación es una simple pasada hacia delante.
- Comparación de protocolos experimentales: puntuar células procedentes de distintas plataformas o protocolos de preparación permite medir qué configuración produce células más aprovechables para el modelo proxy.
- Priorización en anotación manual: ordenar las células por puntuación ayuda a decidir qué poblaciones merecen revisión o anotación experta cuando el presupuesto es limitado.
- Estudio de estados celulares raros: identificar células con logits altos dentro de tipos poco frecuentes ayuda a localizar observaciones con peso desproporcionado para el proxy, candidatas a análisis dirigido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas, métricas de correlación con valoraciones ground truth, ni cifras de rendimiento frente a otros métodos de data valuation para single-cell.

## Requisitos de hardware

- VRAM: no aplica para los pesos; el MLP es de tamano reducido y la documentación de uso recomienda explícitamente ejecución en CPU (`JAX_PLATFORMS=cpu`).
- Memoria principal: el cuello de botella real es la matriz de entrada, proporcional a (número de células × 19208 genes). El consumo crece linealmente con N, por lo que el dimensionado depende del dataset y no del modelo.
- GPU: no se declaran GPU recomendadas. Cualquier GPU compatible con JAX serviría, pero no es necesaria; una RTX 4090, A100 o H100 estarían sobredimensionadas para este cómputo.
- GPU de consumo: el modelo puede ejecutarse sin GPU; en caso de usarse una, cabe holgadamente en cualquier GPU de consumo actual, aunque la limitación será la memoria para cargar el dataset.
- Opciones de despliegue: interfaz de línea de comandos de `cellrater` (`cellrater-prepare`, `cellrater-score`), instalación vía `uv sync --extra anndata --extra hub` y pesos descargados con `hf download`.
- Latencia y throughput: no disponible. Al ser una única pasada hacia delante de un MLP pequeño, el coste dominante es la lectura y el preprocesado del `.h5ad`, no la inferencia.

## Comparativa con modelos similares

| Metodo | Tipo | Requiere modelo entrenado | Coste computacional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CellRater (gex) | Valoración aprendida por célula (MLP meta-aprendido) | No para puntuar; sí se apoya en un proxy estilo UCE durante el entrenamiento | Una pasada hacia delante por célula; coste bajo | MIT | Pesos en HuggingFace |
| DataShapley | Valoración cooperativa basada en subconjuntos | Sí, reentrenamiento sobre múltiples subconjuntos | Alto por definición (múltiples reentrenamientos) | no disponible | Implementaciones de terceros |
| KNN-Shapley | Aproximación basada en vecinos más cercanos | No | Bajo, pero requiere definir una métrica de similitud entre células | no disponible | Implementaciones de terceros |
| Funciones de influencia | Estimación de influencia sobre los parámetros | Sí, requiere un modelo entrenado y cálculo de gradientes/Hessianos | Medio-alto según la aproximación | no disponible | Implementaciones de terceros |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo: no produce texto, código ni respuestas, y no admite prompts.
- El panel de genes es fijo: 19208 genes en el orden exacto de `genes.txt`. Cualquier desviación en el orden invalida las puntuaciones.
- La coincidencia de símbolos génicos es exacta y sensible a mayúsculas; los genes ausentes se tratan como cero, lo que puede sesgar la puntuación si el panel de origen difiere.
- Las puntuaciones son logits crudos sin calibración: solo la ordenación relativa dentro de un mismo dataset tiene significado. No deben compararse valores absolutos entre datasets.
- El modelo está meta-aprendido para mejorar un proxy concreto de estilo UCE en el ajuste publicado; su utilidad puede no transferirse a otros modelos, tejidos o dominios biológicos.
- Riesgo de alucinación: no aplica en sentido generativo, pero las puntuaciones pueden ser poco fiables o arbitrarias fuera del dominio de entrenamiento, sin que exista una señal de confianza asociada.
- Sesgos: no documentados. Al depender de los datos usados para entrenar el proxy, puede heredar sesgos de composición de tejidos, plataformas o poblaciones celulares.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero se ofrece sin garantías de ningún tipo.
- Sin validación externa: el repositorio muestra 0 descargas y 0 likes, y no se han publicado benchmarks, lo que impide contrastar su calidad frente a alternativas.
- Metadatos del repositorio: se reporta un tamano de 0.0 GB y fechas de creación y actualización de 2026-09-11, potencialmente inconsistentes; conviene verificarlos antes de citar el artefacto.
- La búsqueda web realizada no devolvió documentación técnica ni publicaciones asociadas al modelo, solo páginas comerciales de Snapchat sin relación con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snap-stanford/cellrater-gex
- Repositorio `cellrater` y tutorial `docs/tutorial_score_your_cells.md`: referenciados en la model card, URL no disponible.
- Paper o publicacion tecnica: no disponible.
- Blog o demo: no disponible.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas de Snapchat (https://www.snapchat.com/, https://www.snapchat.com/web, https://accounts.snapchat.com/) y a la web corporativa de Snap Inc. (https://www.snap.com/), sin relación con el modelo.
