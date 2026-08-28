# amirsoahil101/Flights_Prediction_System

## Resumen

`amirsoahil101/Flights_Prediction_System` es un modelo de regresión clásica (Gradient Boosting Regressor de scikit-learn) diseñado para predecir el número mensual de pasajeros aéreos a partir de dos variables de entrada: año y mes. Lo desarrolla el usuario amirsoahil101, que lo publica como parte de una aplicación web interactiva construida con Streamlit. No se trata de un modelo de lenguaje ni de un transformer, sino de un pipeline de machine learning tradicional con preprocesado mediante StandardScaler (para el año) y One-Hot Encoding (para el mes).

El modelo fue seleccionado tras una evaluación comparativa de siete algoritmos de regresión, alcanzando un coeficiente de determinación R² de 0,98 sobre el conjunto de datos de pasajeros aéreos mensuales. El repositorio incluye los artefactos serializados (`model.pkl`, `scaler.pkl`, `columns.pkl`), el código de la aplicación Streamlit y un cuaderno Jupyter con el pipeline completo de entrenamiento. La licencia es MIT y el tamaño del repositorio es de 0,0 GB, lo que indica un modelo extremadamente ligero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient Boosting Regressor (scikit-learn) |
| Parámetros totales | no disponible (modelo clásico, no neuronal) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (regresión tabular) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | en (interfaz de la aplicación; el modelo procesa datos numéricos) |
| Licencia | MIT |
| Formato de pesos | pickle (`model.pkl`) |

## Arquitectura y entrenamiento

El modelo emplea Gradient Boosting Regressor, un algoritmo de ensamblado secuencial que combina árboles de decisión débiles corrigiendo los errores residuales de cada iteración. El pipeline de preprocesado aplica estandarización numérica (StandardScaler) sobre la columna `year` y codificación One-Hot sobre la columna `month` para capturar la estacionalidad. Los artefactos de preprocesado se serializan en `scaler.pkl` y `columns.pkl` para garantizar la coherencia estructural entre entrenamiento e inferencia.

El conjunto de datos utilizado se denomina "Air Passengers Prediction System" y contiene registros mensuales de pasajeros aéreos. No se especifican en la documentación el número exacto de muestras, el rango temporal ni la composición detallada del dataset. El autor evaluó siete algoritmos (regresión lineal, KNN, árbol de decisión, random forest, AdaBoost, gradient boosting y XGBoost) y seleccionó Gradient Boosting por su mejor rendimiento en R² y R² ajustado. No se menciona el uso de técnicas de regularización específicas ni de validación cruzada en la documentación disponible.

## Capacidades

- Predicción numérica de pasajeros mensuales a partir de año y mes.
- Captura de estacionalidad mediante codificación One-Hot del mes.
- Inferencia en tiempo real a través de una aplicación Streamlit desplegada.
- Manejo de errores integrado en la interfaz web (exception handling).
- Preprocesado reproducible gracias a la serialización de scaler y columnas.
- Despliegue ligero: no requiere GPU ni infraestructura especializada.

## Casos de uso

- Planificación de capacidad en aerolíneas: el modelo estima el volumen mensual de pasajeros, lo que permite a las compañías ajustar la frecuencia de vuelos y la asignación de aeronaves con varios meses de antelación.
- Gestión de personal aeroportuario: los aeropuertos pueden prever picos de demanda estacional y dimensionar plantilla en facturación, seguridad y handling.
- Optimización de precios de billetes: las estrategias de revenue management pueden alimentarse de estas predicciones para ajustar tarifas en periodos de alta demanda prevista.
- Previsión de demanda turística: agencias y operadores turísticos pueden anticipar flujos de viajeros por mes y planificar ofertas y recursos.
- Análisis de estacionalidad: el modelo permite descomponer el efecto mensual sobre el tráfico aéreo, útil para informes de mercado y estudios sectoriales.
- Herramienta educativa de machine learning: al incluir el cuaderno Jupyter con el pipeline completo, sirve como caso práctico para enseñar regresión, preprocesado y comparativa de algoritmos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados de evaluación sobre el conjunto de datos de pasajeros aéreos:

| Modelo | R² | R² ajustado |
|---|---|---|
| Gradient Boosting (seleccionado) | 0,98 | 0,96 |
| XGBoost | 0,97 | 0,95 |
| Linear Regression | 0,94 | 0,88 |
| K-Nearest Neighbors | 0,92 | 0,86 |
| Random Forest | 0,92 | 0,85 |
| Decision Tree | 0,89 | 0,79 |
| AdaBoost | 0,86 | 0,74 |

La métrica reportada como "accuracy" en la model card es en realidad el coeficiente de determinación R², no una precisión de clasificación. No se proporcionan resultados de MSE ni MAE en la documentación, aunque se listan como métricas del proyecto.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un conjunto de árboles de decisión de pequeño tamaño; cualquier CPU moderna ejecuta la predicción en milisegundos.
- VRAM: no requiere GPU. La inferencia se realiza en memoria principal.
- RAM: menos de 100 MB para cargar los artefactos serializados.
- Despliegue: la aplicación Streamlit está alojada en Streamlit Community Cloud; también puede ejecutarse localmente con `streamlit run app.py`.
- Dependencias: streamlit, scikit-learn, joblib, pandas y numpy.
- Latencia estimada: inferior a 10 ms por predicción en hardware convencional.

## Comparativa con modelos similares

La comparativa más directa es con los otros seis algoritmos evaluados en el mismo proyecto, cuyos resultados se muestran en la tabla de benchmarks. Frente a alternativas externas:

| Modelo | Tipo | R² (mismo dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gradient Boosting (este modelo) | Ensamblado de árboles | 0,98 | MIT | Código y artefactos en HuggingFace |
| XGBoost | Ensamblado de árboles con boosting | 0,97 | BSD-3-Clause | Librería pública |
| Random Forest | Ensamblado de árboles con bagging | 0,92 | BSD-3-Clause | Librería pública |
| Linear Regression | Modelo lineal | 0,94 | BSD-3-Clause | Librería pública |

No se dispone de comparativas con modelos externos sobre el mismo conjunto de datos más allá de los incluidos en el proyecto.

## Limitaciones y advertencias

- El modelo utiliza únicamente dos variables de entrada (año y mes); ignora factores externos como clima, festivos, eventos, precios del combustible o situaciones de crisis, lo que limita su precisión en escenarios reales con perturbaciones.
- El conjunto de datos parece corresponder al clásico dataset de pasajeros aéreos mensuales (1949-1960), por lo que las predicciones fuera de ese rango temporal pueden degradarse significativamente.
- Riesgo de sobreajuste: con un R² de 0,98 sobre un dataset pequeño, existe la posibilidad de que el modelo memorice ruido en lugar de generalizar.
- No es un modelo de lenguaje ni admite procesamiento de texto; su ámbito se limita a regresión numérica tabular.
- La documentación no especifica el número de árboles, la profundidad máxima ni los hiperparámetros del Gradient Boosting, lo que dificulta la reproducibilidad exacta.
- La aplicación Streamlit depende de la disponibilidad del servicio de hosting; el enlace de demostración puede dejar de estar operativo sin previo aviso.
- No se han publicado evaluaciones de sesgo, robustez ni análisis de errores por grupo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amirsoahil101/Flights_Prediction_System
- Perfil del autor: https://huggingface.co/amirsoahil101
- Aplicación Streamlit en vivo: https://air-passengers-prediction-system-egp3ynswgkaynwvcbz7bd2.streamlit.app/
- Repositorio del proyecto: no se indica un enlace a GitHub en la documentación disponible
