# kritikesh28/predictive-maintenance-xgboost

## Resumen

El modelo `predictive-maintenance-xgboost` es un clasificador tabular basado en XGBoost, publicado por Kritikesh Rajpurohit, que predice el estado de una fresadora industrial a partir de una única lectura de sensores. Distingue entre funcionamiento normal (No Failure) y cuatro modos de fallo: desgaste de herramienta (TWF), disipación de calor (HDF), potencia (PWF) y sobreesfuerzo (OSF). No es una red neuronal ni un modelo de lenguaje: es un `XGBClassifier` con objetivo `multi:softprob` sobre cinco clases, serializado en formato `joblib` y `json` nativo de XGBoost.

El modelo se entrenó sobre una derivación del dataset sintético AI4I 2020 (UCI Machine Learning Repository, CC BY 4.0), con 6.993 filas de línea base y un fuerte desbalanceo (96,70 % de casos sanos). Se ajustó con Optuna (TPE, 30 trials, semilla 42) optimizando macro-F1, con SMOTE aplicado únicamente al split de entrenamiento, y se explica por clase mediante SHAP. La relevancia práctica está en su enfoque de ciclo MLOps completo: registro en MLflow, validación de esquema, monitorización de drift con Evidently y análisis de degradación bajo distribución desplazada.

Su utilidad real es la de implementación de referencia y material didáctico para mantenimiento predictivo explicable, no la de un sistema listo para producción en planta. El propio autor advierte que el modelo se entrenó con datos sintéticos, que la clase TWF es estadísticamente inviable (F1 0,069 con solo 30 ejemplos reales) y que el rendimiento cae con fuerza bajo condiciones de carga pesada (macro-F1 0,532). El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (XGBoost `XGBClassifier`, objetivo `multi:softprob`, 5 clases) |
| Parametros totales | no disponible (no aplica; modelo de árboles, sin recuento de parámetros neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 8 características) |
| Tipos de cuantizacion | no disponible (no aplica; se distribuye en `joblib` y JSON nativo) |
| Idiomas soportados | no disponible (no aplica; no procesa texto) |
| Licencia | MIT (modelo y código); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | `xgb_predmaint.joblib` (API scikit-learn, xgboost 2.1.3), `xgb_predmaint.json` (booster nativo), `config.json` (especificación de features) |

Hiperparámetros del mejor trial: `n_estimators` 407, `max_depth` 6, `learning_rate` 0,0325, `min_child_weight` 4,94, `subsample` 0,836, `colsample_bytree` 0,915, `gamma` 1,63, `reg_alpha` 3,6e-5, `reg_lambda` 0,0092.

## Arquitectura y entrenamiento

XGBoost es un ensamblado de árboles de decisión potenciado por gradiente. El modelo recibe ocho características: seis lecturas crudas (`Type` codificado como H=0, L=1, M=2; temperatura del aire en K, 295–305; temperatura del proceso en K, 305–315; velocidad de rotación en rpm, 1000–2900; par en Nm, 3–80; desgaste de herramienta en min, 0–253) y dos derivadas (`Power_W = Torque × Rotational speed × 2π / 60` y `Temp_diff = Process temperature − Air temperature`). La salida son probabilidades sobre cinco clases: 0 No Failure, 1 TWF, 2 HDF, 3 PWF, 4 OSF.

El ajuste se realizó con Optuna (muestreador TPE, semilla 42, 30 trials) maximizando macro-F1 sobre validación. El desbalanceo se trató con SMOTE (`k_neighbors=3`) aplicado solo al conjunto de entrenamiento; el conjunto de validación conserva la distribución real de clases y nunca se remuestrea. El split es estratificado 80/20 con semilla 42. La selección de modelo se hizo por macro-F1 y no por accuracy, decisión justificada porque predecir siempre "sano" ya daría un 96,7 % de acierto. No hay RLHF, DPO ni fases de ajuste fino: es entrenamiento supervisado clásico sobre datos tabulares.

## Capacidades

- Clasificación tabular multiclase con salida de probabilidades calibradas por clase (`predict_proba`).
- Detección de cuatro modos de fallo diferenciados (TWF, HDF, PWF, OSF) además del estado sano.
- Explicabilidad por clase mediante valores SHAP: el autor documenta el driver principal y el secundario de cada modo de fallo.
- Ingeniería de características integrada: cálculo de potencia y diferencia térmica a partir de las lecturas crudas.
- Monitorización de drift de entrada con Evidently, con validación de esquema previa.
- Serialización doble: `joblib` para la API de scikit-learn y JSON nativo del booster para despliegues sin dependencia de scikit-learn.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- **Mantenimiento predictivo en fresadoras con datos de sensores**: el modelo consume una lectura de temperatura, rpm, par y desgaste y devuelve la probabilidad de cada modo de fallo, permitiendo priorizar inspecciones antes de que se produzca la avería.
- **Soporte a decisiones con explicabilidad regulatoria**: los valores SHAP por clase permiten justificar ante un auditor por qué se marcó un equipo como OSF (par y desgaste como drivers) o como HDF (diferencia térmica y rpm), algo exigible en entornos industriales regulados.
- **Prototipado rápido de pipelines MLOps**: el repositorio incluye registro en MLflow, validación de esquema y monitorización con Evidently, por lo que sirve como plantilla para montar un ciclo completo de entrenamiento, despliegue y vigilancia de drift en un proyecto nuevo.
- **Docencia y formación en machine learning tabular**: el contraste documentado frente a Random Forest (0,736), LightGBM (0,730) y regresión logística (0,531) en macro-F1, junto con el análisis de degradación bajo carga pesada, lo convierte en un caso de estudio realista sobre desbalanceo extremo y selección de métricas.
- **Detección de deriva en datos industriales**: los dos lotes post-despliegue de 1.499 filas (estable y carga pesada) permiten ensayar rutinas de monitorización; el lote de carga pesada muestra drift en 3 de 5 características (desgaste +38 %, par +12 %, rpm −3 %) y una caída de macro-F1 de 0,742 a 0,532.
- **Alertas de sobreesfuerzo en línea de producción**: la regla aprendida de sobreesfuerzo (desgaste × par > 10.000 min·Nm) puede integrarse como señal de aviso temprano, siempre que se recalibre sobre datos reales de la planta.
- **Sustitución de reglas heurísticas de vida útil de herramienta**: como complemento a un límite fijo de vida de herramienta, el modelo aporta una probabilidad contextualizada por el resto de variables del proceso.

## Benchmarks y rendimiento

Evaluación sobre split estratificado 80/20 de la línea base (semilla 42), con validación en la distribución real de clases sin remuestrear:

| Metrica | XGBoost baseline | Modelo ajustado |
|---|---|---|
| Macro-F1 (métrica de selección) | 0,748 | **0,767** |
| Weighted-F1 | 0,985 | 0,983 |
| Accuracy | 0,984 | 0,977 |
| F1 No Failure | 0,992 | 0,989 |
| F1 TWF | 0,133 | 0,069 |
| F1 HDF | 0,966 | 0,966 |
| F1 PWF | 0,880 | 0,917 |
| F1 OSF | 0,769 | 0,897 |

Comparativa de macro-F1 frente a otros algoritmos: Random Forest 0,736; LightGBM 0,730; regresión logística 0,531.

Comportamiento bajo desplazamiento de distribución:

| Lote de producción | Drift (Evidently) | Macro-F1 | F1 OSF |
|---|---|---|---|
| Estable | ninguno (0/5 características) | 0,742 | 0,813 |
| Carga pesada | 3/5 características (desgaste +38 %, par +12 %, rpm −3 %) | 0,532 | 0,626 |

## Requisitos de hardware

- **VRAM**: no aplica; es un modelo de árboles que corre en CPU. El artefacto `joblib` es de tamaño reducido (repositorio de 0,0 GB).
- **GPU**: no necesaria. XGBoost puede usar GPU (`gpu_hist`/`device=cuda`) para entrenamiento, pero la inferencia de un modelo de 407 árboles y profundidad 6 es trivial en CPU.
- **GPU de consumo**: irrelevante para inferencia; cualquier CPU moderna sirve. Para reentrenamiento con Optuna, una GPU de consumo (RTX 3060 o superior) acelera el barrido de trials, aunque no es imprescindible.
- **Despliegue**: `joblib` con scikit-learn y xgboost 2.1.3, o el booster nativo en JSON con la API `xgboost.Booster`. No aplican vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada. Por la naturaleza del modelo (8 características de entrada, 407 árboles), la inferencia por muestra es del orden de microsegundos a milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Algoritmo | Parametros | Contexto | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (XGBoost ajustado) | Gradient boosting | 407 árboles, profundidad 6 | no aplica | 0,767 | MIT | Hugging Face, `joblib` y JSON |
| XGBoost baseline | Gradient boosting | valores por defecto | no aplica | 0,748 | MIT (código) | Referencia interna del proyecto |
| Random Forest | Bagging de árboles | no disponible | no aplica | 0,736 | no disponible | Referencia interna del proyecto |
| LightGBM | Gradient boosting | no disponible | no aplica | 0,730 | no disponible | Referencia interna del proyecto |
| Regresión logística | Modelo lineal | no disponible | no aplica | 0,531 | no disponible | Referencia interna del proyecto |

Las alternativas comparadas son las reportadas por el propio autor en la misma partición de datos; no se dispone de otros modelos públicos de mantenimiento predictivo sobre el dataset AI4I 2020 con métricas directamente equiparables en la información proporcionada.

## Limitaciones y advertencias

- **TWF no es fiable**: F1 de 0,069. Solo hay 30 ejemplos reales de esta clase y SMOTE no genera variedad real a partir de ellos. Debe combinarse con un límite de vida útil basado en reglas.
- **Datos sintéticos**: el modelo se entrenó sobre AI4I 2020, un dataset sintético que imita el comportamiento de una fresadora. Los rangos y umbrales (por ejemplo, la alerta de sobreesfuerzo en desgaste × par > 10.000 min·Nm) deben recalcularse para máquinas reales.
- **Degradación bajo carga pesada**: el macro-F1 cae de 0,742 a 0,532 con drift en 3 de 5 características. El autor recomienda reentrenar con datos de carga pesada antes de usar el modelo en esas condiciones y vigilar el drift de par y desgaste.
- **Muestras de validación escasas en clases raras**: el F1 por clase de las categorías más infrecuentes se apoya en 6–15 ejemplos, por lo que esas cifras tienen alta varianza.
- **Riesgo de alucinación**: no aplica en el sentido de modelos generativos, pero sí existe riesgo de falsos negativos y positivos por sobreajuste al régimen sintético de entrenamiento.
- **Uso previsto limitado**: el propio autor lo define como implementación de referencia y apoyo a la decisión. Queda fuera de alcance cualquier decisión de parada autónoma o de seguridad crítica sobre equipos reales sin recalibración con datos de planta.
- **Licencia**: MIT para modelo y código, permisiva para uso comercial; los datos de entrenamiento son CC BY 4.0 y exigen atribución.
- **Sin soporte de texto ni idiomas**: no es un modelo de lenguaje; no puede procesar instrucciones en lenguaje natural ni mantener conversaciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kritikesh28/predictive-maintenance-xgboost)
- [Demo en vivo](https://curioussparoows.com/portfolio/predictive-maintenance-mlops/)
- [Código y pipeline completo en GitHub](https://github.com/kritikesh28/predictive-maintenance-mlops)
- [Dataset AI4I 2020 Predictive Maintenance (UCI Machine Learning Repository)](https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset)
