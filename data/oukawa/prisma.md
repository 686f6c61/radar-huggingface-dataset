# oukawa/PRISMA

## Resumen

PRISMA es un conjunto de modelos de regresión tabular basados en Random Forest, publicados por el usuario oukawa en Hugging Face, que acompañan al manuscrito *Environmental and socioeconomic predictors of respiratory hospital admissions: An explainable machine learning approach*. El modelo predice tasas de ingresos hospitalarios por enfermedades respiratorias (infecciones respiratorias bajas, enfermedades respiratorias crónicas y otras afecciones respiratorias) en las ciudades brasileñas de Curitiba y Araucária (Paraná), para el periodo 2003-2017 y cuatro grupos de edad. No es un modelo de lenguaje ni una red neuronal: es un artefacto de scikit-learn serializado con joblib.

La propuesta se divide en dos familias: modelos temporales, que predicen tasas semanales de ingresos por cada millón de habitantes a partir de 24 predictores meteorológicos, climáticos y de calidad del aire; y modelos espaciales, que predicen ingresos acumulados sobre una rejilla de 1 km a partir de 27 predictores socioeconómicos, de densidad de población y de zonas climáticas locales. La explicabilidad se aborda mediante valores SHAP, orientados a describir la contribución de cada predictor.

Su relevancia es metodológica y aplicada: ofrece un pipeline reproducible (notebooks de procesamiento, validación cruzada bloqueada temporal y espacial, búsqueda de hiperparámetros) para estudios de salud pública ambiental con machine learning interpretable. El repositorio ocupa 1,3 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (RandomForestRegressor de scikit-learn) |
| Parametros totales | no disponible (no aplica; modelo basado en árboles) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 24 o 27 predictores) |
| Tipos de cuantizacion | no disponible (no aplica; pesos en pickle/joblib) |
| Idiomas soportados | no disponible (no aplica; modelo tabular, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (joblib) con un diccionario de modelos `RandomForestRegressor` por grupo de edad |

## Arquitectura y entrenamiento

Cada archivo `.pkl` contiene un diccionario con un `RandomForestRegressor` ajustado por grupo de edad, con claves del tipo `LRI_General`, `LRI_G1`, `LRI_G2` y `LRI_G3`. Los grupos son: General (todas las edades), G1 (4 años o menos), G2 (5-59 años) y G3 (60 años o más). Todos los modelos usan 500 árboles, profundidad máxima de 20, todas las características en cada división, mínimo de dos muestras para dividir un nodo, una muestra por hoja y muestreo bootstrap.

Los modelos temporales usan 24 predictores semanales: temperaturas (`t_min`, `t_max`, `t_mean`, `t_amp`), humedad relativa, velocidad del viento, insolación, evaporación, precipitación, días consecutivos secos/húmedos/cálidos/fríos, día juliano, marca temporal Unix, variables estacionales (otoño, primavera, invierno; verano como referencia) y contaminantes (`so2`, `no2`, `nox`, `o3`, `pm10`, `co`). Los modelos espaciales usan 27 predictores por celda de 1 km: composición racial autodeclarada (`WHT`, `BLK`, `YEL`, `BRN`, `IND`), alfabetización, densidad de población, renta per cápita, PIB per cápita, densidad de carreteras y fracciones de zonas climáticas locales (`LCZ_1`-`LCZ_10`, `LCZ_A`-`LCZ_G`).

La validación temporal emplea validación cruzada bloqueada por mes y estación con seis pliegues y un búfer de una semana entre entrenamiento y test (probado también con 0, 2 y 4 semanas). La validación espacial usa validación cruzada bloqueada espacialmente con cinco pliegues y bloques de 5 × 5 km. Los modelos se entrenaron con scikit-learn 1.6.1 y se reguardaron con scikit-learn 1.8.0, con predicciones que coinciden con los archivos originales hasta 1e-12.

## Capacidades

- Regresión tabular supervisada: predicción de tasas de ingresos hospitalarios por millón de habitantes (semanales en el modelo temporal, acumuladas en el espacial).
- Predicción diferenciada por enfermedad: LRI (infecciones respiratorias bajas), CRD (enfermedades respiratorias crónicas) y Other (otras afecciones respiratorias).
- Predicción segmentada por cuatro grupos de edad.
- Modelado temporal con variables meteorológicas, climáticas y de calidad del aire.
- Modelado espacial con variables socioeconómicas, de densidad y de zonas climáticas locales.
- Explicabilidad mediante valores SHAP para describir la contribución de cada predictor.
- No soporta tool calling, agentes, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Vigilancia epidemiológica semanal: el modelo temporal permite estimar ingresos respiratorios semanales por millón de habitantes a partir de condiciones meteorológicas y de calidad del aire, útil para anticipar picos estacionales en servicios de salud.
- Planificación de recursos hospitalarios: al desagregar por grupo de edad (especialmente G1 y G3), los gestores pueden dimensionar camas pediátricas y geriátricas según la predicción semanal.
- Análisis de exposición ambiental: los valores SHAP permiten identificar qué contaminantes (`pm10`, `no2`, `o3`) o variables meteorológicas contribuyen más a las admisiones, orientando políticas de calidad del aire.
- Estudios de equidad en salud: el modelo espacial incorpora variables socioeconómicas y de composición racial, lo que permite analizar asociaciones entre vulnerabilidad social y carga de enfermedad respiratoria a escala de 1 km.
- Planificación urbana y de infraestructura: la densidad de carreteras y las zonas climáticas locales como predictores permiten evaluar cómo la morfología urbana se asocia con admisiones respiratorias.
- Reproducibilidad de investigación: los notebooks de procesamiento y validación permiten replicar el pipeline en otras ciudades o periodos, adaptando las matrices de entrada documentadas.
- Docencia y formación en ML ambiental: el repositorio sirve como ejemplo completo de validación cruzada bloqueada (temporal y espacial) y explicabilidad con SHAP en un contexto de salud pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las puntuaciones, los modelos anidados, los lags y los errores por tertil de predictor se reportan en el Material Suplementario del manuscrito (Tablas S2-S8), pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM: no aplica; es un modelo de árboles que se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo consumer: el repositorio completo ocupa 1,3 GB, pero cada archivo `.pkl` individual contiene 500 árboles de profundidad máxima 20 y se puede cargar en memoria RAM convencional (estimación orientativa de cientos de MB por archivo, no confirmada en la información disponible).
- Opciones de despliegue: carga directa con `joblib.load` en Python con scikit-learn 1.8.0 (recomendado); no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la inferencia es una predicción de Random Forest sobre 24 o 27 características, típicamente del orden de milisegundos por muestra en CPU, aunque no se documenta una medición concreta.

## Comparativa con modelos similares

| Modelo | Tipo | Predictores | Cobertura | Explicabilidad | Licencia |
|---|---|---|---|---|---|
| PRISMA (oukawa) | Random Forest tabular | 24 (temporal) / 27 (espacial) | Curitiba y Araucária, 2003-2017 | SHAP | MIT |
| Modelos de regresión Poisson/GAM en epidemiología ambiental | Modelos estadísticos clásicos | Variable | Variable | Coeficientes interpretables | Variable |
| Gradient boosting (XGBoost/LightGBM) para salud ambiental | Árboles potenciados | Variable | Variable | SHAP | MIT/Apache |

No se dispone de comparaciones cuantitativas publicadas con alternativas en la información proporcionada. La elección de Random Forest frente a boosting o modelos lineales generalizados no se justifica con métricas en la model card.

## Limitaciones y advertencias

- Los valores SHAP describen asociaciones aprendidas de los datos, no efectos causales; la model card lo advierte explícitamente.
- Los predictores correlacionados (por ejemplo, temperatura y estación, o `nox`, `no2` y `co`) deben interpretarse conjuntamente, lo que complica la atribución individual.
- Los modelos están entrenados específicamente para Curitiba y Araucária (2003-2017); su extrapolación a otras ciudades, periodos o sistemas de salud no está validada.
- Las matrices de entrada no se incluyen en el repositorio; los datos de calidad del aire y meteorológicos de IAT e INMET no se pueden compartir, lo que limita la reproducibilidad completa.
- Los datos de admisiones proceden de DataSUS SIH, el censo de IBGE (2010), OpenStreetMap, LCZ Generator y Kummu et al. (2025); posibles sesgos de notificación o subregistro en los datos de salud no se abordan en la información disponible.
- La carga con versiones de scikit-learn distintas de la 1.8.0 genera advertencias; se recomienda esa versión.
- Licencia MIT: permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de rendimiento en producción.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural ni capacidades generativas.

## Enlaces

- Hugging Face: https://huggingface.co/oukawa/PRISMA
- Manuscrito asociado: *Environmental and socioeconomic predictors of respiratory hospital admissions: An explainable machine learning approach* (referenciado en la model card, sin enlace directo disponible)
- DataSUS SIH: https://datasus.saude.gov.br/
- IBGE (censo 2010): https://www.ibge.gov.br/
- OpenStreetMap: https://www.openstreetmap.org/
- LCZ Generator: https://lcz-generator.rub.de/
- scikit-learn: https://scikit-learn.org/
- SHAP: https://shap.readthedocs.io/
