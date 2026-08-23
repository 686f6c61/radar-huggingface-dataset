# erikabear95/transitionrx-readmission-xgboost

## Resumen
TransitionRx es un clasificador de gradient boosting basado en XGBoost desarrollado por erikabear95 para predecir el riesgo de reingreso hospitalario a 30 días en pacientes diabéticos dados de alta. El modelo se entrena sobre el dataset público UCI Diabetes 130-US Hospitals (1999-2008) y su objetivo es ayudar a priorizar la intervención de farmacéuticos y gestores de casos en pacientes con mayor probabilidad de volver a ingresar. El modelo produce un ranking de riesgo que permite asignar recursos limitados de forma más eficiente, pero no es una herramienta de diagnóstico clínico.

El modelo utiliza 116 características de tipo administrativo y de facturación (medicamentos, uso previo de servicios, disposición al alta, agrupaciones de diagnóstico) y está diseñado para ser desplegado en entornos de salud con capacidad de cómputo modesta. El autor proporciona tanto un modelo crudo (ranking) como una versión calibrada con isotonic regression para obtener probabilidades interpretables. La licencia es MIT, lo que facilita su uso y modificación.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting (XGBoost) |
| Parametros totales | no disponible (número de árboles no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo tabular, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de árboles) |
| Idiomas soportados | no disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib/pickle (.pkl) |

## Arquitectura y entrenamiento
El modelo es un clasificador XGBoost (extreme gradient boosting) que combina árboles de decisión con regularización y aprendizaje secuencial. El entrenamiento se realizó sobre el dataset UCI Diabetes 130-US Hospitals, limitado a la primera estancia hospitalaria de cada paciente para evitar fugas de información entre el entrenamiento y la validación. Se excluyeron los pacientes fallecidos o en cuidados paliativos, ya que no pueden ser readmitidos. La variable objetivo es `readmitted == '<30'`, es decir, reingreso dentro de los 30 días posteriores al alta.

El autor aplicó ingeniería de características para crear indicadores como `complexity_index` (número de medicamentos para diabetes + 2 × cambios de régimen), `regimen_change_score` (escaladas y desescaladas de dosis), `prior_inpatient_band` y `prior_emergency_band` (utilización hospitalaria previa), y `home_no_services` o `transferred_facility` (proxies de calidad de transición de cuidados). No se menciona el uso de técnicas como SMOTE o ajuste de hiperparámetros más allá de la mención de un modelo "tuned". La calibración isotónica se aplicó para convertir las puntuaciones brutas en probabilidades interpretables.

## Capacidades
- Clasificación binaria de riesgo de reingreso a 30 días (alto vs bajo riesgo).
- Ranking de pacientes por riesgo, útil para priorizar intervenciones con recursos limitados.
- Generación de probabilidades calibradas mediante isotonic regression (en la versión `transitionrx_calibrated_model.pkl`).
- Interpretabilidad básica a través de importancia de características, aunque no se incluye un módulo SHAP en el repositorio.
- No tiene capacidades de procesamiento de lenguaje natural, visión ni generación de texto.

## Casos de uso
- Priorización de revisión de medicación: el modelo clasifica los altos hospitalarios y permite que el farmacéutico dedique su tiempo a los pacientes con mayor riesgo de reingreso, optimizando la conciliación de medicamentos.
- Asignación de gestores de casos: los equipos de gestión de casos pueden usar el ranking para programar seguimiento telefónico o visitas domiciliarias para los pacientes más vulnerables.
- Planificación de recursos hospitalarios: el hospital puede anticipar la carga de reingresos y ajustar la dotación de personal o la disponibilidad de camas en función del número de pacientes de alto riesgo identificados.
- Evaluación de programas de transición de cuidados: el modelo puede servir como herramienta de medición del riesgo basal en estudios cuasi-experimentales sobre intervenciones de seguimiento.
- Identificación de pacientes que requieren coordinación con servicios sociales o de atención domiciliaria, especialmente si presentan características como `home_no_services` o `transferred_facility`.
- Entrenamiento de modelos derivados: la versión calibrada puede integrarse en pipelines de coste-efectividad para calcular el ahorro esperado por evitar un reingreso.

## Benchmarks y rendimiento
El modelo reporta los siguientes resultados en un conjunto de validación (held-out test set):

| Metric | Valor |
|---|---|
| ROC-AUC | 0.6546 |
| PR-AUC | 0.1661 (tasa base no especificada) |
| Umbral operativo | 0.57 |
| Recall en umbral | 0.3795 |
| Precision en umbral | 0.1771 |

El autor indica que un ROC-AUC en el rango 0.60-0.70 es el techo realista para este dataset, consistente con la literatura publicada. No se proporcionan comparaciones con otros modelos, aunque se menciona que el rendimiento es similar a trabajos previos con los mismos datos.

## Requisitos de hardware
- El modelo es un archivo XGBoost de tamaño pequeño (menos de 1 MB), por lo que puede ejecutarse en cualquier CPU moderna sin necesidad de GPU.
- La inferencia se puede realizar en menos de 1 milisegundo por paciente, incluso en hardware de bajo consumo.
- No se requiere memoria VRAM ni tarjetas gráficas especiales.
- Se puede desplegar en servidores clásicos, contenedores Docker o incluso en dispositivos edge con Python.
- Las opciones de despliegue incluyen uso directo con `joblib` o `pickle`, o mediante frameworks de servicio como Flask o FastAPI para integrarse en sistemas hospitalarios.

## Comparativa con modelos similares
No se dispone de datos de comparación directa con otros modelos de readmisión hospitalaria en la información proporcionada. El propio autor afirma que el rendimiento es consistente con la literatura publicada para este dataset, pero no se incluyen métricas de otros modelos. Se recomienda consultar el trabajo de Ash-projects-personal/patient-readmission-prediction (GitHub) que reporta un AUC de 0.99 con XGBoost, aunque ese resultado podría estar sobreajustado o usar una división de datos diferente. No se puede establecer una comparativa rigurosa sin datos adicionales.

## Limitaciones y advertencias
- Los datos de entrenamiento provienen de los años 1999-2008; las prácticas clínicas y los códigos de facturación han cambiado, lo que puede reducir la precisión en datos actuales.
- El modelo no incorpora variables clínicas como constantes vitales, tendencias de laboratorio, determinantes sociales, adherencia a la medicación ni texto de informes de alta.
- Fue entrenado en 130 hospitales de EE. UU.; el caso mixto de otros centros puede diferir y requerir recalibración.
- No se ha auditado el rendimiento del modelo por subgrupos de raza, edad o tipo de aseguradora, lo que es un riesgo para un uso justo y equitativo.
- El modelo predice riesgo de reingreso, no la prevenibilidad ni la capacidad de respuesta a una intervención. El supuesto de efectividad de la intervención proviene de la literatura, no de una medición propia.
- El umbral operativo de 0.57 es una decisión de negocio basada en la capacidad de farmacéuticos (revisar el 20% de los altos), no un óptimo estadístico. Debe reajustarse según los recursos locales.
- Las probabilidades del modelo crudo están distorsionadas por `scale_pos_weight`; usar siempre la versión calibrada para cálculos de costos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/erikabear95/transitionrx-readmission-xgboost
- Dataset UCI Diabetes 130-US Hospitals: https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008
- Repositorio con pipeline similar (referencia externa): https://github.com/Ash-projects-personal/patient-readmission-prediction
- Demo de modelo transparente (referencia externa): https://transparent-ai-diabetes-readmission-bbciaodwnxuyg6xj53ae6s.streamlit.app/
- Artículo sobre readmisión pediátrica con XGBoost: https://www.sciencedirect.com/science/article/pii/S0169260723006466
- Repositorio de readmisión con XGBoost (referencia externa): https://github.com/Dhanya31-svg/Hospital-Patient-Readmission-Prediction-using-XGBoost
- Página de modelos HealthcareML (referencia externa): https://asarekings.github.io/HealthcareML-/models.html
