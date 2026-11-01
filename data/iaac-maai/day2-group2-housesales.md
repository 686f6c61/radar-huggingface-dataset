# iaac-maai/day2-group2-housesales

## Resumen

`iaac-maai/day2-group2-housesales` es un pipeline de scikit-learn para regresión tabular que estima el precio de venta de viviendas residenciales en el condado de King (Washington, EE. UU.) a partir de características físicas del inmueble, calidad de construcción y coordenadas geográficas. Lo firma el equipo 2 del curso AI Methods I del IAAC MaAI (2026/27), con autoría de Karthikeyan Saravanan, Emmanuel Marquez, Bars Babila y Samiha Abeda Nur, y se publica bajo licencia MIT.

No es un modelo de lenguaje ni una red neuronal: es un `HistGradientBoostingRegressor` de scikit-learn envuelto en un pipeline con imputación de valores ausentes y codificación one-hot de códigos postales, serializado en formato `joblib`. El artefacto ocupa 0,0 GB y se distribuye con la etiqueta `tabular-regression`, sin descargas ni interacciones registradas en HuggingFace en el momento de la consulta.

Su relevancia es acotada y de carácter didáctico: sirve como referencia de cómo estructurar un flujo reproducible de regresión tabular (split 80/20, validación cruzada agrupada por código postal, comparación de seis algoritmos y búsqueda de hiperparámetros) sobre el conocido dataset *House Sales in King County, USA* de Kaggle. No está pensado para uso en producción fuera de su ámbito geográfico y temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con `HistGradientBoostingRegressor` (gradient boosting sobre histogramas, árboles de decisión) |
| Parametros totales | No disponible (el número de hojas y árboles no se publica; configuración por defecto, `random_state=42`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No aplica; serialización en `joblib` |
| Idiomas soportados | No disponible (no procesa texto libre; el único campo categórico es `zipcode`) |
| Licencia | MIT |
| Formato de pesos | `king_county_house_price.joblib` (pipeline ajustado con metadatos) |

## Arquitectura y entrenamiento

El modelo es un `HistGradientBoostingRegressor` de scikit-learn en configuración por defecto, integrado en un `Pipeline` que aplica imputación por mediana a las variables numéricas y, para `zipcode`, imputación por moda seguida de one-hot encoding. No hay escalado. El target se transforma con logaritmo en base 10 durante el entrenamiento, por lo que las predicciones deben revertirse a USD con la operación inversa indicada en la model card. Las versiones de referencia son scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3 y Python 3.12.15.

Los datos provienen del dataset público *House Sales in King County, USA* (Kaggle, licencia CC0), con 21.613 observaciones originales de ventas residenciales entre mayo de 2014 y mayo de 2015, de las que se usaron 16.556 para entrenamiento y 4.147 para test (split 80/20 con `random_state=42`). La validación cruzada emplea 5 folds con `GroupKFold` agrupando por código postal para evitar fuga geográfica entre folds. Se compararon seis algoritmos (baseline de media, regresión lineal, Ridge, KNN con k=10, árbol de decisión, Random Forest y Gradient Boosting); el gradient boosting por defecto obtuvo el mejor R² en validación cruzada (0,8858 ± 0,0053) y el menor MAE en escala log10 (0,0501 ± 0,0012). Una búsqueda en rejilla de 9 combinaciones (learning_rate=0,05, max_leaf_nodes=31, max_iter=300) alcanzó R²=0,8675, inferior al valor por defecto, por lo que se descartó el ajuste.

Las 13 variables de entrada son: `bedrooms`, `bathrooms`, `sqft_living`, `sqft_lot`, `floors`, `condition`, `grade`, `sqft_basement`, `yr_built`, `yr_renovated`, `zipcode`, `lat` y `long`. La fecha de venta se convirtió a `datetime` durante la limpieza y se eliminaron columnas según criterios de exploración del equipo.

## Capacidades

- Regresión tabular: predice el precio de venta en USD de viviendas unifamiliares del condado de King a partir de 13 variables numéricas y un código postal categórico.
- Manejo de valores ausentes: imputación por mediana en numéricas y por moda en `zipcode`, integrada en el pipeline.
- Codificación de categóricas: one-hot encoding del código postal, lo que permite capturar efectos de localización a nivel de ZIP.
- Uso de coordenadas geográficas: `lat` y `long` entran como features numéricas, aportando señal espacial complementaria al código postal.
- Inferencia determinista y reproducible: `random_state=42` fijado en el pipeline.
- Serialización portable: un único archivo `joblib` cargable con `joblib.load` y compatible con `predict` de scikit-learn.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un regresor tabular.

## Casos de uso

- **Tasación preliminar por parte de agentes inmobiliarios**: dado un inmueble con sus características físicas y su código postal, el pipeline devuelve una estimación en USD que sirve como punto de partida antes de una tasación profesional. Es adecuado porque el MAE en test es de 60.200 USD sobre un rango de precios residenciales del condado.
- **Herramienta de exploración para compradores**: un comprador puede introducir variaciones en `sqft_living`, `grade` o `condition` y observar cómo cambia la predicción, usando el modelo como análisis de sensibilidad. La naturaleza determinista del pipeline facilita comparar escenarios.
- **Filtrado previo en plataformas de listados**: integrado como microservicio que puntúa anuncios nuevos y marca aquellos cuyo precio declarado se desvía significativamente de la estimación, para revisión manual. El formato `joblib` se carga directamente en un endpoint Python.
- **Análisis de mercado por código postal**: como el modelo usa one-hot de `zipcode`, permite estudiar el efecto de localización agregado comparando predicciones medias por zona, útil para informes de barrio.
- **Material docente y de referencia**: sirve como ejemplo canónico de flujo completo de regresión tabular (limpieza, split, GroupKFold por ZIP, comparación de modelos, grid search) para cursos de machine learning aplicado.
- **Prototipado rápido de APIs de valoración**: al ser un artefacto pequeño y sin dependencias de GPU, se puede envolver en FastAPI o Flask y desplegar en un contenedor ligero para demos internas.
- **Validación de pipelines de features**: equipos que construyan su propio modelo de precios pueden usar este como baseline de comparación gracias a sus métricas publicadas (R²=0,8751 en test, MAE=60.200 USD).

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna de validación cruzada usa `GroupKFold` de 5 folds agrupando por código postal y métricas en escala log10; la de test usa el conjunto reservado y métricas en USD.

| Modelo | R² CV (log10) | MAE CV (log10) |
|---|---|---|
| Baseline (media) | -0,0004 ± 0,0004 | 0,1675 ± 0,0017 |
| Regresión lineal | 0,8512 ± 0,0032 | 0,0586 ± 0,0009 |
| Ridge | 0,8511 ± 0,0031 | 0,0587 ± 0,0009 |
| KNN (k=10) | 0,8229 ± 0,0015 | 0,0633 ± 0,0007 |
| Árbol de decisión | 0,8119 ± 0,0051 | 0,0648 ± 0,0005 |
| Random Forest | 0,8769 ± 0,0050 | 0,0517 ± 0,0009 |
| **Gradient Boosting (seleccionado)** | **0,8858 ± 0,0053** | **0,0501 ± 0,0012** |
| Gradient Boosting ajustado (grid search) | 0,8675 | No disponible |

Resultados en el conjunto de test reservado (usado una sola vez):

| Métrica | Test (USD) | Validación cruzada (log10) |
|---|---|---|
| R² | 0,8751 | 0,8858 ± 0,0053 |
| MAE | 60.200,51 USD | No disponible |
| RMSE | 98.383,87 USD | No disponible |

## Requisitos de hardware

- **VRAM**: no requiere GPU; la inferencia es puramente CPU.
- **CPU**: cualquier procesador moderno x86-64 o ARM es suficiente; el modelo es un conjunto de árboles de gradient boosting de tamaño reducido.
- **Memoria RAM**: unos pocos cientos de MB para cargar scikit-learn, pandas, numpy y el pipeline; el repositorio ocupa 0,0 GB.
- **GPU recomendadas**: ninguna. No hay soporte de aceleración GPU en el pipeline tal como está serializado.
- **Consumer GPU**: irrelevante; el modelo se ejecuta en CPU sin penalización práctica.
- **Opciones de despliegue**: `joblib.load` en Python, servicio FastAPI/Flask, contenedor Docker ligero, tareas batch con pandas. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son motores para modelos de lenguaje.
- **Latencia y throughput**: no publicados. Por la naturaleza del algoritmo (predicción sobre árboles con pocas features), se espera latencia de milisegundos por instancia en CPU, aunque no hay medición oficial en la información disponible.
- **Entorno reproducible**: Python 3.12.15, scikit-learn 1.9.1, pandas 3.0.6, numpy 2.5.3.

## Comparativa con modelos similares

| Modelo | Tipo | R² CV | MAE CV (log10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gradient Boosting (este modelo) | HistGradientBoostingRegressor | 0,8858 | 0,0501 | MIT | HuggingFace, `joblib` |
| Random Forest (mismo estudio) | Ensemble de árboles | 0,8769 | 0,0517 | No especificada en la ficha | Solo como comparación interna |
| Regresión lineal (mismo estudio) | Modelo lineal | 0,8512 | 0,0586 | No especificada en la ficha | Solo como comparación interna |
| KNN k=10 (mismo estudio) | Instance-based | 0,8229 | 0,0633 | No especificada en la ficha | Solo como comparación interna |

No se han identificado en la información proporcionada modelos públicos comparables de terceros sobre el mismo dataset con métricas directamente equiparables. Las alternativas listadas son los modelos de referencia del propio estudio, no artefactos publicados de forma independiente.

## Limitaciones y advertencias

- **Ámbito geográfico restringido**: solo válido para el condado de King (Washington, EE. UU.). Las predicciones fuera de esa zona no son fiables.
- **Ventana temporal caducada**: entrenado con ventas de mayo de 2014 a mayo de 2015. No refleja el mercado actual y no debe usarse para valoraciones contemporáneas sin reentrenamiento.
- **Tipo de inmueble**: exclusivamente residencial unifamiliar. No cubre locales comerciales, industriales ni otras tipologías.
- **Error absoluto elevado en términos absolutos**: MAE de 60.200 USD y RMSE de 98.383 USD en test, lo que implica dispersión considerable en viviendas de alto valor.
- **No sustituye una tasación profesional**: la model card lo indica explícitamente; no debe usarse para decisiones financieras o hipotecarias sin validación humana.
- **Riesgo de extrapolación**: al ser un modelo basado en árboles, las predicciones fuera del rango de las features de entrenamiento (por ejemplo, superficies o años de construcción atípicos) no están calibradas.
- **Dependencia de `zipcode`**: el one-hot encoding del código postal puede inflar la importancia de esta variable y degradar la generalización a códigos poco representados en el conjunto de entrenamiento.
- **Transformación del target**: la model card advierte de que las predicciones pueden estar en escala log10; es imprescindible revertirlas a USD antes de interpretarlas, y la card no detalla la fórmula exacta en el texto disponible.
- **Sesgos del dataset original**: el conjunto de Kaggle refleja el mercado inmobiliario de Seattle y alrededores en 2014-2015; puede contener sesgos de precio asociados a barrios y características socioeconómicas no controladas.
- **Licencia MIT**: permite uso comercial y modificación, pero el dataset de origen es CC0 y el modelo se distribuye sin garantías; conviene citar el trabajo original.
- **Sin mantenimiento aparente**: creado en octubre de 2026 y actualizado dos días después, sin descargas ni likes; es un artefacto de curso, no un modelo mantenido.

## Enlaces

- HuggingFace: https://huggingface.co/iaac-maai/day2-group2-housesales
- Repositorio GitHub del pipeline (referenciado en la model card): https://github.com/iaac-maai/2-day2-assignment
- Dataset de origen en Kaggle: https://www.kaggle.com/datasets/harlfoxem/housesalesprediction
- Documentación de scikit-learn sobre `HistGradientBoostingRegressor`: no disponible en la información proporcionada
