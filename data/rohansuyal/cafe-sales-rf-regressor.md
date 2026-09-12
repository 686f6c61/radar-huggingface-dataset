# rohansuyal/cafe-sales-rf-regressor

## Resumen

`rohansuyal/cafe-sales-rf-regressor` no es un modelo de lenguaje ni una red neuronal: es un **Random Forest Regressor** de scikit-learn serializado, publicado como artefacto de regresión tabular para predecir el campo `Total Spent` (gasto total) de una transacción en una cafetería. Lo desarrolla el usuario `rohansuyal` y se distribuye con licencia MIT a través de HuggingFace Hub bajo el pipeline `tabular-regression`. Su relevancia es acotada: sirve como ejemplo reproducible de pipeline completo en scikit-learn (preprocesado con `ColumnTransformer` + estimador) y como modelo de forecasting de ticket medio para un caso de negocio muy concreto, no como componente generalista.

El modelo se entrena sobre el "Cafe Sales Dataset", con 9.540 transacciones, y toma siete variables de entrada: `Item` (categórica), `Quantity` (numérica), `Payment Method` (categórica), `Location` (categórica), `Day_of_Week`, `Month` e `Is_Weekend`. Deliberadamente se elimina `Price Per Unit` para evitar una predicción trivial (`Total Spent = Quantity × Price Per Unit`) y forzar al modelo a inferir precios implícitos por producto y contexto temporal. Es un detalle metodológico correcto que conviene destacar.

El artefacto publicado es un único archivo `rf_tuned_model.pkl` que contiene el pipeline completo (preprocesador y modelo), por lo que se puede cargar con `joblib` sin reconstruir la ingeniería de características. El repositorio no incluye datos de entrenamiento, script de entrenamiento ni documentación del esquema de codificación de categóricas, lo que limita su reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (conjunto de 300 árboles de decisión CART, `RandomForestRegressor` de scikit-learn) sobre pipeline con `ColumnTransformer` |
| Parametros totales | no aplica (modelo no neuronal); el modelo queda definido por 300 árboles con `max_depth = 10` |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 7 campos por fila, sin contexto secuencial) |
| Tipos de cuantizacion | no aplica; el único formato de compresión previsto es la serialización con `joblib` (posible compresión al guardar) |
| Idiomas soportados | no aplica; las únicas cadenas que procesa son las categorías de entrenamiento en inglés (p. ej. `Coffee`, `Cake`, `Cookie`, `Cash`, `Credit Card`, `Digital Wallet`, `In-store`, `Takeaway`); el conjunto completo de categorías no está documentado |
| Licencia | MIT |
| Formato de pesos | Pickle de Python vía `joblib` (`rf_tuned_model.pkl`) |
| Librería | scikit-learn (entorno declarado: Python 3.10, pandas, numpy, joblib) |
| Tarea | `tabular-regression` (regresión supervisada de valor único) |
| Variable objetivo | `Total Spent` en unidades monetarias no especificadas |
| Entradas | `Item`, `Quantity`, `Payment Method`, `Location`, `Day_of_Week` (0=lunes, 6=domingo), `Month` (1-12), `Is_Weekend` (0/1) |
| Datos de entrenamiento | Cafe Sales Dataset, 9.540 transacciones, partición 80/20 |
| Descargas / likes en el Hub | 0 / 0 |
| Tamano del repositorio | 0,0 GB (por debajo del umbral de redondeo del Hub) |

## Arquitectura y entrenamiento

La arquitectura es un `RandomForestRegressor` clásico: agregación por media de 300 árboles de decisión entrenados con bagging y selección aleatoria de `max_features = 0.5` en cada división. Los hiperparámetros se ajustaron mediante `RandomizedSearchCV` con validación cruzada de 5 particiones y los valores finales publicados son `n_estimators = 300`, `max_depth = 10`, `min_samples_split = 10`, `min_samples_leaf = 2`. La profundidad máxima de 10 y el mínimo de 2 muestras por hoja actúan como regularización explícita, coherente con un dataset de menos de 10.000 filas.

El pipeline empaquetado incluye el preprocesado (`ColumnTransformer`, presumiblemente con codificación one-hot para las tres variables categóricas) junto al estimador, de modo que la entrada esperada es un `DataFrame` con las columnas originales. No se documenta el tratamiento de valores nulos, la codificación concreta de categóricas, el rango temporal del dataset ni si la partición 80/20 es aleatoria o temporal. Se eliminó `Price Per Unit` del conjunto de predictores para evitar fuga de información: sin esa columna, el modelo debe estimar el precio unitario implícito de cada `Item` a partir del resto de variables. No hay información sobre búsqueda de hiperparámetros con semilla fija, análisis de importancia de variables ni validación en un conjunto externo.

## Capacidades

- Regresión tabular supervisada de valor único: estima `Total Spent` a partir de siete campos de una transacción.
- Predicción por lote: acepta un `DataFrame` con varias filas y devuelve un vector de predicciones.
- Inferencia determinista en CPU: `predict` no introduce aleatoriedad en el momento de la inferencia; la misma entrada produce la misma salida.
- Pipeline autocontenido: incluye preprocesado y modelo, por lo que no requiere reconstruir transformaciones externas.
- Manejo de variables mixtas: categóricas de baja cardinalidad, numéricas discretas y una binaria en el mismo estimador.
- Serialización y despliegue simples: un único `.pkl` cargable con `joblib` o `pickle`.
- No dispone de generación de texto, razonamiento, código, matemáticas simbólicas, visión ni audio.
- No soporta tool calling, function calling ni uso como agente.
- No soporta multi-step reasoning ni memoria conversacional.
- No tiene capacidades multilingües: solo interpreta las categorías literales vistas durante el entrenamiento.

## Casos de uso

- Previsión de caja diaria: dado el mix esperado de transacciones (producto, cantidad, método de pago, localización, día de la semana), el modelo estima el ingreso esperado por turno y permite comparar el cierre real contra el esperado. Es adecuado porque el error medio absoluto publicado es de 0,70 unidades monetarias por transacción.
- Detección de anomalías en el TPV: calcular el residuo entre `Total Spent` real y la predicción para cada transacción; residuos persistentemente grandes señalan errores de cobro, descuentos no registrados o manipulaciones. El modelo sirve como referencia base barata en CPU.
- Imputación de importes faltantes: cuando un registro de venta pierde el campo `Total Spent` (fallo de integración, importación parcial), el modelo reconstruye un valor plausible a partir del resto de campos, evitando descartar la fila.
- Simulación de promociones y contrafactuales: variando `Item` y `Quantity` en la entrada se puede estimar cómo cambia el gasto esperado por transacción y priorizar qué combinaciones promocionar.
- Planificación de stock por estacionalidad: usando `Month`, `Day_of_Week` e `Is_Weekend` como variables de calendario, el modelo proyecta el gasto agregado por franja y ayuda a dimensionar compras de materia prima.
- Enriquecimiento de eventos en streaming: empaquetado como microservicio (FastAPI + `joblib`) o como `UDF`, puede anotar cada evento de venta con un importe esperado y alimentar paneles de control en tiempo real con latencia de microsegundos por fila.
- Segmentación de clientes por ticket: agrupar transacciones por el gasto predicho frente al real permite identificar perfiles de compra (ticket alto/bajo) sin depender de un sistema de fidelización.
- Material docente de pipelines de scikit-learn: el artefacto ejemplifica el patrón `ColumnTransformer` + estimador + `RandomizedSearchCV` + serialización con `joblib`, reutilizable como plantilla para otros problemas de regresión tabular.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas sobre el 20 % de test del propio dataset, comparando el bosque por defecto con el ajustado:

| Metrica | Random Forest por defecto | Random Forest ajustado |
|---|---|---|
| MAE | 0,7800 | 0,7007 |
| RMSE | 1,8726 | 1,6997 |
| R² | 0,8959 | 0,9142 |

El ajuste de hiperparámetros reduce el MAE un 10,2 % y el RMSE un 9,2 %, y eleva el R² de 0,8959 a 0,9142. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, porque no son aplicables a un modelo de regresión tabular. Tampoco se publican comparaciones contra baselines lineales ni contra otros algoritmos de boosting sobre el mismo conjunto.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU y no requiere GPU.
- RAM estimada: no disponible con precisión. Por la estructura del modelo (300 árboles, profundidad máxima 10, 7 predictores de baja cardinalidad) el espacio en memoria es del orden de unos pocos megabytes a decenas de megabytes, más una copia del `DataFrame` de entrada.
- GPU recomendadas: ninguna. Cualquier CPU de los últimos quince años es suficiente; no hay soporte CUDA ni aceleración específica en scikit-learn para este estimador.
- Cabe en GPU de consumo: la pregunta no aplica, ya que el modelo no usa GPU. Cabe en cualquier portátil o contenedor con Python 3.10 y scikit-learn.
- Opciones de despliegue: carga directa con `joblib.load` en un script Python, servicio HTTP con FastAPI o Flask, tarea programada por lotes, integración en un DAG de Airflow, o `UDF` en un motor SQL con Python (p. ej. pandas o DuckDB). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos neuronales.
- Latencia y throughput: no disponibles como medición publicada. Por la naturaleza del estimador, la inferencia es de orden sub-milisegundo por fila y escala con el número de núcleos disponibles vía `n_jobs` durante el entrenamiento; el `predict` de un bosque es secuencial.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rohansuyal/cafe-sales-rf-regressor` | Random Forest (sklearn) | 300 arboles, profundidad 10 | no aplica | MAE 0,7007; RMSE 1,6997; R² 0,9142 en test propio | MIT | HuggingFace Hub (`rohansuyal/cafe-sales-rf-regressor`) |
| Regresion lineal multiple (baseline propio) | Modelo lineal | coeficientes por feature | no aplica | no disponible | segun implementacion | no disponible |
| Gradient boosting (LightGBM / XGBoost) | Arboles con boosting | segun configuracion | no aplica | no disponible | MIT / Apache-2.0 segun libreria | repositorios publicos de las librerias |
| Regresion tabular con red neuronal (MLP) | Perceptron multicapa | segun arquitectura | no aplica | no disponible | segun implementacion | no disponible |

La comparación se limita a categorías de algoritmo porque no se dispone de métricas de alternativas entrenadas sobre el mismo dataset ni de artefactos comparables publicados por el mismo autor. Cualquier cifra de rendimiento de las filas alternativas sería especulativa y no se incluye.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo solo predice `Total Spent` para el esquema de columnas exacto del Cafe Sales Dataset. Cualquier cambio de nombre de columna, de codificación o de dominio de negocio invalida la entrada.
- Dataset pequeño y de origen único: 9.540 transacciones sin información sobre la fuente original, el país, el rango temporal ni la moneda en que está expresado `Total Spent`, lo que impide interpretar el MAE de 0,7007 en términos monetarios absolutos.
- Partición 80/20 sin documentar: si la división es aleatoria sobre transacciones del mismo periodo, las métricas pueden estar optimistas respecto a un escenario real de despliegue con datos futuros.
- Sin validación externa ni temporales: no hay validación cruzada temporal, ni evaluación en un periodo posterior, ni pruebas con productos nuevos no vistos en entrenamiento.
- Categorías no cubiertas: el modelo card solo lista ejemplos de valores (`Coffee`, `Cake`, `Cookie`, etc.) y no el conjunto completo de categorías de `Item`, `Payment Method` ni `Location`; una categoría desconocida dependerá del comportamiento del codificador del pipeline, que no está documentado.
- Sin intervalos de confianza: la salida es un punto único. La dispersión entre los 300 árboles podría usarse como proxy de incertidumbre, pero no se documenta ni se expone.
- Sin extrapolación: al ser un bosque, las predicciones quedan acotadas por los valores observados en las hojas de entrenamiento; no proyecta bien regímenes de precio o demanda fuera del rango histórico.
- Reproducibilidad incompleta: no se publican ni el dataset, ni el script de entrenamiento, ni la semilla aleatoria, ni la versión exacta de scikit-learn, por lo que no se puede replicar el resultado a partir del repositorio.
- Riesgo de uso indebido: aplicar este modelo a decisiones de precios, facturación o contabilidad en producción sin reentrenarlo con datos propios y validarlo contra un periodo real produciría errores sistemáticos.
- Licencia: MIT, permisiva y compatible con uso comercial. No obstante, el autor no ofrece garantías ni asume responsabilidad, y la licencia del dataset original no se declara, por lo que el uso comercial del modelo entrenado debería revisar primero los términos de la fuente de datos.
- Valoración en el Hub nula: cero descargas y cero likes, sin evidencia de uso en producción por terceros ni de mantenimiento posterior a la fecha de creación (2026-09-12).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohansuyal/cafe-sales-rf-regressor
- Documentación de scikit-learn para `RandomForestRegressor`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html (referencia de la librería utilizada, no enlazada en la model card)
- Documentación de `joblib` para serialización: https://joblib.readthedocs.io/ (referencia de la librería utilizada, no enlazada en la model card)
- Paper, blog, repositorio de código, dataset y demo: no disponibles. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces recuperados (foros de Ivanti sobre validación de formularios y restablecimiento de Apple TV) no guardan relación con el artefacto y se descartan.
