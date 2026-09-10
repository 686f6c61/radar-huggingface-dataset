# MalcolmBT/elpris-se2-team5

## Resumen

`MalcolmBT/elpris-se2-team5` no es un modelo de lenguaje: es un modelo de regresión tabular para la previsión de precios de electricidad, publicado en HuggingFace bajo el nombre interno "Elprisprognos – v1" (sueco: "pronóstico de precio de la electricidad"). El artefacto está construido con `HistGradientBoostingRegressor` de scikit-learn, un algoritmo de gradient boosting sobre árboles de decisión con binning por histogramas, y se distribuye como resultado de un proyecto de curso (según el propio autor, "Kursprojekt. Inte avsett för produktion", es decir, proyecto académico no destinado a producción).

La model card reporta tres cifras sobre un periodo de entrenamiento de un único mes (del 1 al 31 de agosto de 2026): MAE de 0.1541451717738413, R² de 0.4676702112273651 y un MAE de referencia ingenuo (naive) de 0.18926506222035794. Con esos datos, el modelo mejora al baseline trivial en aproximadamente un 18,6 % de MAE, pero explica menos de la mitad de la varianza del objetivo (R² ≈ 0,47).

Es relevante únicamente como ejemplo de publicación de modelos predictivos tabulares en HuggingFace y como plantilla de model card para proyectos docentes. No hay pipeline declarado, ni licencia, ni idiomas, ni ficheros de pesos publicados: el tamaño del repositorio es de 0,0 GB, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión con binning por histogramas (`HistGradientBoostingRegressor` de scikit-learn) |
| Parametros totales | no disponible (no se publica el número de árboles, profundidad, hojas ni learning rate) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo tabular; la dimensión de entrada depende del número de features, no publicadas) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; los modelos de gradient boosting no se distribuyen habitualmente en formatos cuantizados tipo GGUF/AWQ) |
| Idiomas soportados | no disponible (la model card está redactada en sueco; no se declara ningún idioma para el modelo) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio tiene un tamaño de 0,0 GB y no se especifica si se serializa con joblib, pickle, ONNX u otro formato) |

Otros metadatos: autor `MalcolmBT`, etiqueta `region:us`, fecha de creación 2026-09-10, última actualización 2026-09-10, 0 descargas y 0 likes. Referencia de código indicada en la model card: commit `51a0dc7` (sin URL de repositorio publicada).

## Arquitectura y entrenamiento

La arquitectura es un ensamblado de árboles de decisión entrenados secuencialmente por gradient boosting, en la implementación de scikit-learn `HistGradientBoostingRegressor`. Esta variante, inspirada en LightGBM, discretiza las features continuas en histogramas antes de buscar los puntos de corte, lo que reduce el coste computacional y permite manejar valores ausentes de forma nativa, además de soportar variables categóricas. No hay componentes neuronales, atención ni mecanismos de secuencia: se trata de un regresor supervisado clásico sobre features tabulares.

Los únicos datos de entrenamiento publicados son la ventana temporal, del 1 al 31 de agosto de 2026, presumiblemente sobre precios de electricidad del mercado nórdico. No se especifica el número de muestras, la composición del dataset, el conjunto de features, la existencia de un split de validación o test, ni los hiperparámetros del modelo. Tampoco hay rastro de RLHF, DPO ni ajuste por preferencias, técnicas que no aplican a este tipo de modelo. La model card menciona que la lógica de features corresponde al mismo commit `51a0dc7`, lo que sugiere que el pipeline de ingeniería de variables está versionado junto al modelo, pero ese código no se enlaza desde HuggingFace.

## Capacidades

- Regresión supervisada de variable única: dado un vector de features tabulares, devuelve una predicción numérica (previsiblemente el precio de la electricidad).
- Manejo nativo de valores ausentes en las features de entrada, sin necesidad de imputación explícita por parte del usuario.
- Soporte de variables categóricas en la entrada, siempre que se declaren como tales al ajustar el modelo.
- Modelado de relaciones no lineales y de interacciones entre features mediante los puntos de corte de los árboles.
- Entrenamiento e inferencia en CPU, sin dependencia de GPU.
- No soporta generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio ni ningún otro dominio de los modelos de lenguaje.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera lenguaje.
- No dispone de modo "thinking" ni de ningún modo especial de inferencia.
- Capacidad de predicción a un horizonte concreto: no disponible (no se declara si el objetivo es precio horario, diario o de otro tipo).

## Casos de uso

- Previsión de precio horario para agentes del mercado eléctrico: el regresor puede alimentar una estrategia de compra/venta en el mercado diario si se dispone de las mismas features usadas en el entrenamiento. Es adecuado por su bajo coste de inferencia en CPU, pero solo si el artefacto serializado se publica, cosa que hoy no ocurre.
- Gestión de baterías domésticas o industriales: usar la predicción de precio para decidir ciclos de carga en horas valle y descarga en horas punta. El modelo es apropiado por su latencia baja, aunque su R² de 0,47 implica un error residual apreciable que debe cubrirse con reglas de seguridad.
- Programación de bombas de calor y climatización: desplazar el consumo a las horas de precio previsto más bajo. El modelo encaja porque la decisión requiere un único valor escalar por intervalo, no una distribución completa.
- Carga inteligente de vehículos eléctricos: planificar la ventana de recarga domiciliaria minimizando el coste esperado. El modelo puede servir como componente de un optimizador, siempre con un baseline de respaldo por si falla la predicción.
- Respuesta a la demanda en industria: decidir si desplazar cargas flexibles en función del precio previsto, con umbrales definidos por el operador. El modelo es suficiente porque el coste de un error se mitiga con margen de seguridad en el umbral.
- Análisis académico y comparación de baselines: dado que incluye un naive MAE explícito (0,18926506222035794), sirve como referencia metodológica en trabajos docentes sobre forecasting energético y sobre cómo reportar métricas en model cards.
- Prototipado de pipelines de forecasting tabular: como ejemplo reproducible (si se publicase el código) de entrenamiento, versionado por commit y publicación en HuggingFace. No es un caso de uso de producción según el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, porque el modelo no es un modelo de lenguaje. Las únicas métricas reportadas por el autor son las siguientes:

| Metrica | Valor |
|---|---|
| MAE | 0.1541451717738413 |
| R² | 0.4676702112273651 |
| MAE del baseline naive | 0.18926506222035794 |
| Mejora de MAE frente al naive | ~18,6 % (calculado a partir de las dos cifras anteriores) |

No se especifica la unidad del MAE, el conjunto sobre el que se evalúa (train, validación o test), ni el horizonte de predicción. Tampoco se comparan los resultados con LightGBM, XGBoost, CatBoost u otros modelos sobre el mismo dataset.

## Requisitos de hardware

- VRAM para inferencia: no aplicable. Es un modelo de gradient boosting que se ejecuta en CPU; no requiere GPU.
- GPU recomendadas: ninguna. El autor no documenta soporte de GPU y `HistGradientBoostingRegressor` de scikit-learn no lo ofrece.
- Ejecución en GPU de consumo: no aplicable, ya que no se usa GPU; el modelo puede ejecutarse en cualquier CPU de portátil moderno si el artefacto estuviese publicado.
- Memoria RAM: no disponible. Depende del número de árboles y hojas, que no se declaran; en gradient boosting tabular típico suele ser del orden de decenas a cientos de megabytes, pero no hay dato confirmado para este modelo.
- Opciones de despliegue: no documentadas. Los formatos habituales para este tipo de modelo serían joblib/pickle de scikit-learn, exportación a ONNX o conversión a formatos de serving tabular, pero ninguno se menciona en la model card.
- Latencia y throughput estimados: no disponibles. No se publican mediciones y el repositorio no contiene los pesos, por lo que no es posible reproducir la inferencia.

## Comparativa con modelos similares

No hay datos publicados que permitan una comparación cuantitativa sobre el mismo dataset. Como referencia cualitativa de la misma categoría (regresión tabular con gradient boosting) se pueden considerar:

| Modelo | Parametros | Contexto | Rendimiento en este dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MalcolmBT/elpris-se2-team5` (HistGradientBoostingRegressor) | no disponible | no aplicable | MAE 0.1541 / R² 0.4677 | no disponible | repo de 0,0 GB, 0 descargas |
| LightGBM | no disponible | no aplicable | no disponible | licencia MIT (del proyecto LightGBM) | público |
| XGBoost | no disponible | no aplicable | no disponible | licencia Apache 2.0 (del proyecto XGBoost) | público |
| CatBoost | no disponible | no aplicable | no disponible | licencia Apache 2.0 (del proyecto CatBoost) | público |
| Baseline naive (referencia del propio autor) | no aplicable | no aplicable | MAE 0.1893 | no aplicable | citado en la model card |

La comparativa con alternativas no es posible porque ningún modelo comparable ha sido evaluado sobre el mismo conjunto de datos y features, y estos últimos no se publican.

## Limitaciones y advertencias

- El propio autor declara que es un proyecto de curso y que no está destinado a producción ("Kursprojekt. Inte avsett för produktion").
- No se declara licencia, por lo que no hay autorización explícita para uso comercial ni para redistribución.
- El repositorio tiene un tamaño de 0,0 GB: no hay pesos publicados, de modo que el modelo no es ejecutable tal y como está en HuggingFace.
- No se publican las features de entrada ni el código de ingeniería de variables, solo una referencia al commit `51a0dc7` sin URL. Sin ese código, la inferencia es irreproducible.
- El entrenamiento cubre un único mes (agosto de 2026), un periodo estival con dinámicas de precio habitualmente distintas a las de invierno en los mercados nórdicos; es esperable un deterioro por cambio de distribución fuera de ese mes.
- El R² de 0,4677 implica que más de la mitad de la varianza del objetivo queda sin explicar; el MAE debe interpretarse en la unidad del precio, que no se especifica.
- No se aclara si las métricas reportadas corresponden a entrenamiento, validación o test; si fuesen in-sample, estarían sobreestimando el rendimiento real.
- No se documentan hiperparámetros, número de árboles, profundidad, semilla aleatoria ni proceso de selección de features, lo que impide auditar sobreajuste.
- No se documenta sesgo ni análisis de subgrupos; en forecasting de precios energéticos, un sesgo sistemático en horas punta puede tener impacto económico directo.
- Riesgo de alucinación: no aplicable, ya que el modelo no genera texto; el riesgo equivalente es la predicción espuria fuera del rango de features visto en entrenamiento (extrapolación no soportada por los árboles).
- No hay soporte multilingüe ni de contexto largo porque no procesa secuencias de texto.
- Los resultados de búsqueda web asociados a esta consulta no guardan relación con el modelo (versan sobre emulación y descarga de ROMs) y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MalcolmBT/elpris-se2-team5
- Repositorio de código con commit `51a0dc7`: no disponible (referenciado en la model card sin URL)
- Paper o documentación técnica adicional: no disponible
- Demo o espacio de inferencia: no disponible
