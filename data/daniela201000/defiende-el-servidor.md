# Daniela201000/defiende-el-servidor

## Resumen

Defiende el servidor es un clasificador binario de tráfico de red (conexión normal frente a ataque) desarrollado por Daniela201000 como trabajo evaluable del taller de MLOps de la Universidad Externado de Colombia (2026-II). El modelo se entrenó sobre el dataset UNSW-NB15 y se distribuye como un pipeline completo de scikit-learn serializado con joblib, no como una red neuronal: el estimador subyacente es un `HistGradientBoostingClassifier` con 300 iteraciones, learning rate 0,1, 31 hojas máximas y regularización L2 de 1,0.

El objetivo declarado no es operar como defensa real, sino demostrar trazabilidad y reproducibilidad de versiones en un flujo MLOps (código, datos, experimento y modelo). El artefacto se acompaña de un SHA-256 verificable, versionado DVC de los datos, un run de MLflow y un umbral de decisión calibrado explícitamente (0,65) para limitar la tasa de falsos positivos por debajo del 5 % en validación.

Por su naturaleza es un modelo tabular de 42 variables derivadas de flujos de red, sin capacidad generativa ni de contexto: no es un LLM. Su relevancia es formativa y metodológica, y su uso en producción requeriría reentrenamiento y validación con tráfico actual, dado que los datos proceden de un entorno de laboratorio de 2015.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (`HistGradientBoostingClassifier` de scikit-learn) dentro de un pipeline con imputación, codificación y escalado |
| Parametros totales | no disponible (no se publica el número de nodos ni de parámetros del ensemble) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; 42 variables predictoras por fila) |
| Tipos de cuantizacion | no aplica; el artefacto es `model.joblib` en coma flotante de doble precisión |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | other |
| Formato de pesos | joblib (pickle de scikit-learn); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn 1.9.1 que encadena el preprocesamiento de tipo árbol (`{"kind": "tree"}`: imputación y codificación adecuadas para estimadores basados en árboles) y un `HistGradientBoostingClassifier` con `max_iter=300`, `learning_rate=0.1`, `max_leaf_nodes=31`, `l2_regularization=1.0` y `early_stopping=false`. La semilla es 42 y el experimento se registra como `exp4_hist_gradient_boosting`. El artefacto `model.joblib` tiene SHA-256 `ac60460c5b0508bea7d5504a8d0dff24cda1d2fafca94825b4ff1e369d5f2b62` y se verifica antes de cargarlo.

Los datos provienen de las particiones oficiales de UNSW-NB15: 175.341 filas de entrenamiento y 82.332 de test. Solo se usa el archivo de entrenamiento para ajustar y validar, con `StratifiedGroupKFold` (semilla 42) y agrupación por entradas idénticas para evitar fuga entre train y validación: 140.274 filas de entrenamiento y 35.067 de validación. Se emplean 42 variables predictoras, excluyendo `id`, `attack_cat` y `label`. El umbral de decisión se fijó en 0,65 para maximizar el recall de ataque sujeto a una tasa de falsos positivos (FPR) menor o igual a 0,05 en validación.

## Capacidades

- Clasificación binaria de conexiones de red: salida 0 (normal) o 1 (ataque) a partir de 42 variables tabulares.
- Puntuación de probabilidad de ataque (`score_attack`) con umbral configurable; el valor por defecto es 0,65.
- Preprocesamiento integrado en el propio pipeline: imputación, codificación y escalado se aplican automáticamente sobre las columnas esperadas en `config.json["features"]`.
- Ejecución por lotes mediante `predict.py`, que lee un CSV de entrada y escribe un CSV de predicciones.
- Verificación de integridad del artefacto por SHA-256 antes de la carga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No incorpora modo de razonamiento explícito ni cadena de pensamiento.

## Casos de uso

- Docencia y evaluación de MLOps: sirve como artefacto de referencia para practicar versionado de código, datos y modelos, verificación por hash y despliegue reproducible en un pipeline académico.
- Detección de anomalías en flujos de red como ejercicio de laboratorio: clasifica conexiones descritas con las 42 variables de UNSW-NB15 y permite comparar el efecto del umbral sobre recall y FPR.
- Auditoría de pipelines de datos: el uso de DVC con md5 de los directorios `data/raw.dvc` y `data/prepared.dvc` permite reconstruir exactamente el conjunto de entrenamiento a partir de un commit concreto.
- Reproducción de experimentos: el run de MLflow `a5ca54703ec744fba37ff99212277e71` y el commit de entrenamiento `9a17cd225142061547ee474b9720e1113bfbea92` permiten reejecutar el ajuste y contrastar métricas.
- Integración como paso de preprocesamiento en un sistema mayor de monitorización: el pipeline acepta CSV con las columnas esperadas, por lo que puede encadenarse a un exportador de flujos que genere ese esquema.
- Pruebas de calibración de umbrales en sistemas de alerta: el modelo documenta el compromiso entre recall (0,9540) y FPR (0,0499) en validación, útil como caso de estudio para diseñar políticas de alerta con presupuesto de falsos positivos.
- Validación de controles de seguridad en entornos simulados: permite generar etiquetas de referencia sobre tráfico sintético con el mismo esquema de variables, siempre fuera de producción.

## Benchmarks y rendimiento

Métricas publicadas por el autor sobre validación (35.067 filas, umbral 0,65, ataque como clase positiva):

| Metrica | Valor |
|---|---|
| Recall ataque | 0,9540 |
| Precision ataque | 0,9760 |
| FPR | 0,0499 |
| Macro-F1 | 0,9463 |
| Accuracy | 0,9527 |

Matriz de confusión en validación: TP=22.769, FP=559, TN=10.641, FN=1.098.

Evaluación única sobre test (82.332 filas, umbral 0,65, revisión `e2f7bfdd932f383d7cf40c5413d5d407408889ba`):

| Metrica | Valor |
|---|---|
| Recall ataque | 0,9701 |
| Precision ataque | 0,8681 |
| FPR | 0,1806 |
| Macro-F1 | 0,8996 |
| Accuracy | 0,9024 |

Matriz de confusión en test: TN=30.319, FP=6.681, FN=1.357, TP=43.975. La degradación de la FPR en test (0,18 frente a 0,05 en validación) indica un desplazamiento en la distribución del tráfico normal entre particiones.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU. El artefacto es un modelo de árboles de tamaño reducido (repositorio de 0,0 GB según Hugging Face).
- GPU: no necesaria. El entrenamiento con `HistGradientBoostingClassifier` puede aprovechar CPU multinúcleo; no se documenta soporte GPU.
- GPU de consumo: irrelevante para este modelo; cualquier equipo con CPU moderna puede ejecutarlo.
- Memoria RAM: no disponible de forma explícita; el conjunto de test completo (82.332 filas × 42 variables) es manejable en unos pocos cientos de MB.
- Despliegue: script `predict.py` con scikit-learn 1.9.1 y Python 3.13.17. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares de este tipo.
- Latencia y throughput: no disponibles. Al ser un modelo de árboles con 300 iteraciones, la inferencia por lotes en CPU es rápida, pero no se publican cifras.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. Como referencia cualitativa de la categoría:

| Modelo | Tipo | Datos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiende el servidor v2 | Gradient boosting (scikit-learn) | UNSW-NB15 | no aplica | other | Hugging Face, joblib |
| Alternativas de detección de intrusiones tabulares | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos comparables de la misma tarea y tamaño en la información proporcionada.

## Limitaciones y advertencias

- Material académico: el autor indica explícitamente que no está validado para proteger una red real.
- Dataset histórico de 2015 generado en laboratorio; no demuestra eficacia sobre tráfico actual ni sobre topologías reales.
- El 42 % de las filas de entrenamiento son entradas duplicadas y existen grupos con etiquetas contradictorias, lo que puede inflar las métricas.
- Cerca del 10 % de las entradas de test aparecen idénticas en train o validación, por lo que la evaluación en test es optimista.
- La FPR en test (0,1806) triplica la de validación (0,0499); el tráfico normal del archivo de test difiere del de entrenamiento, lo que compromete la calibración del umbral.
- Los niveles de la variable `state` no vistos en entrenamiento se codifican como desconocidos, con pérdida de información.
- Cargar `model.joblib` ejecuta pickle: solo deben usarse revisiones verificadas por SHA-256, ya que un artefacto manipulado podría ejecutar código arbitrario.
- Licencia "other": no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier uso fuera del ámbito académico.
- No procesa texto ni otros idiomas; cualquier uso fuera de datos tabulares con el esquema exacto de UNSW-NB15 requiere reentrenamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir falsos positivos y falsos negativos con las tasas documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daniela201000/defiende-el-servidor
- Repositorio de código: https://github.com/danielaestudio02-del/Taller_1 (tag `v2`, commit de entrenamiento `9a17cd225142061547ee474b9720e1113bfbea92`)
- Dataset UNSW-NB15: https://research.unsw.edu.au/projects/unsw-nb15-dataset
