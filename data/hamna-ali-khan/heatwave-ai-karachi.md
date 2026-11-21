# hamna-ali-khan/heatwave-ai-karachi

## Resumen

HeatWave AI – Karachi es un clasificador binario tabular desarrollado por hamna-ali-khan que predice si el índice de calor de una estación meteorológica de Karachi alcanzará o superará los 40,6 °C (105 °F) en alguno de los días 5 a 7 posteriores a la fecha de emisión. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline completo de scikit-learn serializado con joblib que engloba imputación, escalado/codificación y el clasificador final, entrenado sobre datos meteorológicos abiertos.

El modelo aborda un problema de salud pública concreto: la predicción a medio plazo de episodios de calor peligroso en una ciudad costera densamente poblada, donde las olas de calor tienen impacto directo en mortalidad y demanda energética. La aproximación es deliberadamente sencilla y reproducible, comparando un baseline trivial (Dummy), un baseline de persistencia y cuatro clasificadores clásicos (regresión logística, random forest, gradient boosting y SVM), con la profundidad del random forest limitada para evitar árboles excesivamente complejos.

Es relevante ahora por su carácter de ejemplo metodológico: muestra un flujo completo de ingeniería de características, validación cronológica y ajuste de umbral de decisión sobre datos abiertos (ERA5 de Open-Meteo y GSOD de NOAA), sin dependencias de infraestructura pesada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es "other", con obligaciones de atribución derivadas de las fuentes de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn (imputación, escalado/codificación y clasificador clásico; el clasificador concreto se especifica en `model_metadata.json`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; 29 características de entrada según `model_metadata.json["features"]`) |
| Tipos de cuantizacion | no aplica (serialización joblib del pipeline) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (con obligaciones de atribución de las fuentes de datos: ERA5 CC BY 4.0 y NOAA GSOD/NCEI) |
| Formato de pesos | joblib (`heatwave_pipeline.joblib`), más `model_metadata.json` |

## Arquitectura y entrenamiento

El artefacto es un `Pipeline` de scikit-learn que encadena imputación de valores ausentes, transformaciones de escalado y codificación, y un clasificador final. La model card indica que la comparación de candidatos incluyó un baseline Dummy, un baseline de persistencia (solo el índice de calor del día actual) y cuatro clasificadores: regresión logística, random forest, gradient boosting y SVM. La profundidad del random forest está limitada explícitamente para desincentivar árboles demasiado complejos. El clasificador seleccionado, sus hiperparámetros óptimos (`best_params`) y el umbral de decisión (`decision_threshold`) se documentan en `model_metadata.json`, no en la model card.

Las características se construyen con `src/feature_engineering.build_features` del repositorio de GitHub, a partir de datos ERA5 de Open-Meteo (CC BY 4.0), mientras que las etiquetas provienen del dataset GSOD del aeropuerto de Karachi de NOAA (datos abiertos, citar NCEI). La evaluación emplea una partición cronológica en entrenamiento, validación y test, y las métricas de test con umbral ajustado se almacenan en `model_metadata.json` bajo `test_metrics_tuned_threshold`. La model card menciona además una página de "model insights" que muestra la diferencia de PR-AUC entre entrenamiento y validación como diagnóstico de sobreajuste. No se especifican el periodo exacto de datos, el número de muestras ni la fecha de descarga en la información disponible.

## Capacidades

- Clasificación binaria tabular: predice la probabilidad de que el índice de calor alcance ≥ 40,6 °C en los días 5 a 7 tras la fecha de emisión.
- Salida de probabilidad calibrable mediante umbral de decisión configurable (`predict_proba` frente a `decision_threshold`).
- Integración directa en Python vía joblib y pandas: `pipe.predict_proba(features_df)[:, 1]`.
- Comparación interna con baselines (Dummy y persistencia) documentada en el proceso de selección.
- Diagnóstico de sobreajuste mediante diferencia de PR-AUC entre entrenamiento y validación.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo tabular de una sola tarea.

## Casos de uso

- Predicción operativa de olas de calor en Karachi: cargar el pipeline con joblib, construir las 29 características con `build_features` y generar una probabilidad diaria para los días 5-7; útil para activar protocolos de salud pública con antelación.
- Investigación metodológica en meteorología aplicada: sirve como referencia reproducible de un flujo completo (ERA5 + GSOD, validación cronológica, ajuste de umbral) para comparar con modelos más complejos.
- Docencia en ciencia de datos: ejemplo didáctico de pipeline de scikit-learn con imputación, escalado, comparación de clasificadores y control de sobreajuste mediante PR-AUC.
- Planificación energética: estimar la probabilidad de episodios de calor extremo para anticipar picos de demanda eléctrica en la región de Karachi.
- Sistemas de alerta temprana internos (no oficiales): integrar la probabilidad como señal complementaria en dashboards de protección civil, siempre subordinada a los avisos del Pakistan Meteorological Department.
- Análisis retrospectivo de riesgo climático: aplicar el pipeline a series históricas de ERA5 para estudiar la frecuencia de episodios peligrosos y validar la sensibilidad del umbral elegido.
- Evaluación de baselines en proyectos de predicción climática: usar el modelo y sus baselines (Dummy, persistencia) como referencia mínima antes de adoptar arquitecturas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite las métricas de test a `model_metadata.json` (`test_metrics_tuned_threshold`) y menciona la diferencia de PR-AUC entre entrenamiento y validación como diagnóstico de sobreajuste, pero no incluye cifras concretas. Se sabe que la prevalencia de la etiqueta peligrosa pasó del 24,2 % en validación al 47,6 % en el periodo de test, lo que condiciona la interpretación de cualquier métrica.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no aplica; no requiere aceleración por GPU.
- Cabe en cualquier equipo consumer: basta con Python, scikit-learn, joblib y pandas.
- Opciones de despliegue: script Python con joblib, servicio REST ligero (FastAPI, Flask) o tarea programada; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un pipeline tabular clásico, la inferencia es de baja latencia por muestra, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeatWave AI – Karachi | Pipeline scikit-learn (clasificador clásico) | 29 características tabulares | Clasificación binaria de calor peligroso a 5-7 días | other (atribución de fuentes) | Hugging Face, 0 descargas |
| Baseline de persistencia (incluido en el proyecto) | Regla trivial | Índice de calor del día actual | Misma tarea | no disponible | Incluido en la comparación del autor |
| Baseline Dummy (incluido en el proyecto) | Regla trivial | Ninguna | Misma tarea | no disponible | Incluido en la comparación del autor |
| Modelos meteorológicos numéricos (NWP) | Simulación física | Estado atmosférico completo | Predicción meteorológica general | variable | Instituciones meteorológicas |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la model card solo indica que el pipeline seleccionado superó a los baselines en el proceso de selección, sin cifras públicas.

## Limitaciones y advertencias

- Sesgos conocidos: entrenado con una sola ciudad y una sola estación (aeropuerto de Karachi); no generaliza a otras ubicaciones sin reentrenamiento.
- Desajuste de resolución: las características provienen de la rejilla ERA5 mientras que las etiquetas provienen de una estación aeroportuaria concreta, lo que introduce error de representatividad.
- Desfase de datos en producción: las entradas en vivo proceden de un producto de datos distinto al usado en entrenamiento, lo que puede degradar las predicciones.
- El umbral de decisión es una elección del proyecto, no una categoría oficial de aviso meteorológico.
- Las probabilidades son estimaciones del modelo, no riesgos garantizados.
- Cambio de distribución: la prevalencia de la etiqueta peligrosa pasó del 24,2 % en validación al 47,6 % en test, por lo que las métricas de test no deben asumirse representativas del futuro.
- Riesgo de sobreajuste: la model card reconoce que ninguna métrica demuestra un ajuste perfecto y publica la diferencia de PR-AUC train/validación como diagnóstico.
- Licencia "other": no se declara una licencia permisiva propia; deben respetarse los términos y atribuciones de ERA5 (CC BY 4.0) y NOAA GSOD (citar NCEI), según `data/DATA_SOURCES.md`. El uso comercial requiere revisar esas condiciones.
- Seguridad: el artefacto es un pickle de joblib; solo deben cargarse ficheros de confianza.
- No es un sistema oficial de alerta: deben seguirse los avisos del Pakistan Meteorological Department.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hamna-ali-khan/heatwave-ai-karachi
- Repositorio de GitHub con `src/feature_engineering.build_features` y `data/DATA_SOURCES.md`: no disponible (la model card lo menciona sin URL)
- Open-Meteo ERA5 (fuente de características, CC BY 4.0): https://open-meteo.com/
- NOAA GSOD / NCEI (fuente de etiquetas): https://www.ncei.noaa.gov/
- Pakistan Meteorological Department (avisos oficiales): no disponible
