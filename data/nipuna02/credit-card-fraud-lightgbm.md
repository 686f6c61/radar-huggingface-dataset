# nipuna02/credit-card-fraud-lightgbm

## Resumen

`nipuna02/credit-card-fraud-lightgbm` es un conjunto de cinco clasificadores LightGBM (gradient boosting sobre árboles de decisión) entrenados para detectar fraude en tarjetas de crédito sobre el dataset público ULB Credit Card Fraud Detection, distribuido a través de OpenML. Lo publica el usuario nipuna02 como modelo didáctico y de portfolio, no como sistema listo para producción. No es una red neuronal ni un modelo de lenguaje: es un artefacto tabular de clasificación binaria pensado para integrarse en pipelines de scoring.

El modelo resuelve un problema clásico de clasificación con fuerte desbalanceo de clases: identificar transacciones fraudulentas entre millones de operaciones legítimas. Para ello entrena cinco boosters con semillas 0-4 sobre el primer 60 % de los datos ordenados por tiempo y promedia sus probabilidades, lo que reduce la varianza del score final. El resultado se compara contra un umbral de alerta calibrado mediante un modelo de coste (fraude no detectado = importe de la transacción; cada revisión manual = 5 euros).

Su relevancia es metodológica: ilustra una evaluación honesta con partición temporal (entrenamiento 60 %, validación intermedia, test con el último 20 % por tiempo) en lugar de un split aleatorio, que filtraría información del futuro. Aun así, el propio autor advierte que se trata de un modelo de enseñanza y no de un sistema antifraude productivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (LightGBM) |
| Parámetros totales | no disponible (no aplica; modelo de árboles) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 31 características) |
| Tipos de cuantización | no disponible (no aplica a LightGBM) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ficheros de texto de LightGBM (`lightgbm_seed0.txt` a `lightgbm_seed4.txt`) más `config.json` |

## Arquitectura y entrenamiento

El modelo es un ensamble de cinco boosters LightGBM entrenados de forma independiente con semillas 0 a 4. La predicción final es la media aritmética de las probabilidades de los cinco boosters. La entrada son 31 características en un orden fijo definido en `config.json`: las 28 componentes PCA originales del dataset ULB (`V1`-`V28`), el importe transformado como `log1p(Amount)` y dos codificaciones cíclicas de la hora extraída de `Time` (`hour_sin`, `hour_cos`).

El entrenamiento usa únicamente el primer 60 % de los registros ordenados por tiempo, con pesos de clase para compensar el desbalanceo extremo entre fraudes y operaciones legítimas. La partición es temporal: un periodo de validación intermedio se emplea para elegir el umbral de alerta mediante un modelo de coste explícito (cada fraude no detectado cuesta su importe; cada revisión manual cuesta 5 euros), y el último 20 % por tiempo se reserva como test. No se documenta el número exacto de iteraciones, la profundidad de los árboles ni la tasa de aprendizaje en la información disponible.

## Capacidades

- Clasificación binaria tabular: genera una probabilidad de fraude por transacción a partir de las 31 características definidas.
- Scoring por ensamble: promedia las salidas de cinco boosters con semillas distintas para estabilizar la predicción.
- Umbral de decisión calibrado por coste: incorpora en `config.json` un `alert_threshold` elegido para minimizar el coste esperado, no solo el error de clasificación.
- Manejo de desbalanceo: los boosters se entrenan con pesos de clase para dar más importancia a la clase minoritaria.
- Extracción de características derivadas: transformación logarítmica del importe y codificación cíclica de la hora.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es un modelo puramente tabular.

## Casos de uso

- Detección de fraude en tiempo real en pasarelas de pago: el modelo puntúa cada transacción con las 31 características y aplica el umbral de alerta para derivar a revisión manual. Es adecuado por su baja latencia inherente a LightGBM, aunque requiere que los datos lleguen ya transformados con la misma PCA del emisor.
- Priorización de colas de revisión antifraude: el score continuo permite ordenar las transacciones sospechosas por probabilidad, de modo que los analistas revisan primero las de mayor riesgo. El umbral calibrado por coste (revisión a 5 euros) encaja directamente en este flujo.
- Simulación y análisis de coste de un sistema de fraude: el modelo y su modelo de coste asociado permiten estimar el ahorro en pérdidas (de 7.729 a 3.506 euros en el periodo de test) y comparar políticas de umbral antes de desplegar.
- Docencia y portfolio de machine learning: sirve como ejemplo completo de partición temporal, ensamble con semillas y calibración por coste en un problema con desbalanceo severo.
- Benchmark interno de referencia: puede usarse como línea base tabular frente a modelos más complejos (redes neuronales, modelos de grafos) sobre el mismo dataset ULB.
- Prototipado de features: las transformaciones incluidas (`log1p(Amount)`, `hour_sin`, `hour_cos`) sirven de punto de partida para ingeniería de características en proyectos de fraude con datos similares.
- Integración en pipelines de MLOps como artefacto de ejemplo: los ficheros de texto de LightGBM y el `config.json` facilitan versionar y cargar el modelo en servicios de scoring.

## Benchmarks y rendimiento

Resultados publicados por el autor en el periodo de test (último 20 % por tiempo, 75 fraudes):

| Métrica | Valor |
|---|---|
| PR-AUC (average precision) | 0,80 (IC 95 %: 0,72-0,89) |
| ROC-AUC | 0,982 |
| Recall a precisión del 90 % | 0,75 |
| Pérdidas por fraude en test (sin alertar nada) | 7.729 euros |
| Pérdidas por fraude en test (con el modelo) | 3.506 euros |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: LightGBM no requiere GPU; cinco boosters con 31 características se ejecutan en milisegundos por lote en cualquier CPU moderna.
- VRAM estimada: no aplica (modelo de árboles, no usa GPU por defecto).
- GPU recomendadas: no aplica; opcionalmente LightGBM puede compilarse con soporte GPU, pero no es necesario para este tamaño.
- Cabe en cualquier equipo, incluidos portátiles de gama baja y entornos serverless.
- Opciones de despliegue: librería `lightgbm` en Python, servicio REST propio, integración en pipelines de scikit-learn, exportación a otros runtimes de árboles (ONNX, Treelite) si se requiere.
- Latencia y throughput: no disponibles de forma explícita; por la naturaleza del modelo, el cuello de botella será la transformación de características (PCA del emisor y cálculo de hora), no la inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Contexto / notas |
|---|---|---|---|---|
| nipuna02/credit-card-fraud-lightgbm | Ensamble LightGBM | 31 características tabulares | MIT | Evaluación temporal, umbral por coste |
| XGBoost sobre el mismo dataset ULB | Gradient boosting | 30 características (V1-V28, Amount) | Apache 2.0 (librería) | Referencia habitual en la literatura del dataset; sin datos de este autor |
| Regresión logística sobre el dataset ULB | Modelo lineal | 30 características | Según implementación | Línea base clásica; menor capacidad para relaciones no lineales |
| Isolation Forest / autoencoders | Detección de anomalías no supervisada | 30 características | Según implementación | No requieren etiquetas, pero menor precisión en fraude etiquetado |

No se dispone de resultados numéricos comparables de estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de enseñanza y portfolio: el propio autor lo declara explícitamente como no apto para producción.
- Datos de dos días de 2013 de un único emisor europeo: la distribución puede no reflejar el fraude actual ni el de otras regiones.
- Dependencia de la PCA del emisor: `V1`-`V28` son componentes PCA originales del banco; el modelo solo funciona con datos transformados exactamente igual, lo que limita su reutilización.
- Sin información sobre sesgos demográficos ni de otro tipo; el dataset no incluye variables protegidas, pero tampoco se documenta un análisis de equidad.
- Riesgo de deriva (drift): al ser datos de 2013, los patrones de fraude pueden haber cambiado; no se documenta monitorización ni reentrenamiento.
- Umbral específico de un modelo de coste concreto (5 euros por revisión): cambiarlo altera el punto de operación y requiere recalibración.
- Licencia MIT: permite uso comercial, pero la advertencia del autor y las limitaciones de datos desaconsejan ese uso sin validación adicional.
- Sin capacidades de texto, visión ni multilingües; no es un modelo de lenguaje y no debe evaluarse como tal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nipuna02/credit-card-fraud-lightgbm
- Repositorio de código y evaluación: https://github.com/Nipuna-Lakruwan/credit-card-fraud
- Dataset ULB Credit Card Fraud Detection (OpenML): https://www.openml.org/d/1597
