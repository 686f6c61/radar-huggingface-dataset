# eduardoosborne/house-price-predictor

## Resumen

House Price Predictor es un conjunto de modelos de regresión tabular desarrollados por Eduardo Oliveira Osborne (FEUP, Universidade do Porto) para estimar el precio de venta de viviendas en Ames, Iowa. No se trata de un modelo de lenguaje ni de una red neuronal profunda: son estimadores de scikit-learn (ridge, gradient boosting, random forest y una red neuronal) entrenados sobre el dataset de la competición de Kaggle "House Prices – Advanced Regression Techniques", con 79 variables predictoras por vivienda.

El paquete resuelve un problema acotado de regresión supervisada: predecir `SalePrice` a partir de características estructurales, de localización y de calidad de la vivienda. Su relevancia es formativa y de referencia: sirve como ejemplo reproducible de un pipeline clásico de machine learning tabular, con validación cruzada de 5 folds y un artefacto empaquetado en formato joblib listo para cargar con `joblib.load`.

El repositorio es de tamaño mínimo (0,0 GB según Hugging Face, con pesos almacenados en ficheros joblib) y no incluye tokenizador, plantillas de prompt ni pesos en safetensors o GGUF. La fecha de creación registrada en el Hub es 2026-11-25 y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal de lenguaje; ensemble de estimadores scikit-learn (regresión ridge, gradient boosting, random forest) y una red neuronal tabular |
| Parametros totales | no disponible (no se publica recuento de parámetros ni tamaño del artefacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tabular de 79 columnas; no hay ventana de tokens) |
| Tipos de cuantizacion | no aplica (no se distribuyen pesos en formatos cuantizables tipo GGUF/AWQ) |
| Idiomas soportados | no disponible (la model card está en portugués; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | joblib (artefactos de scikit-learn, p. ej. `models/gradient_boosting.joblib`) |

## Arquitectura y entrenamiento

El modelo es un conjunto de regresores clásicos de scikit-learn entrenados sobre el dataset Ames Housing, que describe viviendas vendidas en Ames (Iowa) entre 2006 y 2010 con 79 variables (superficie, año de construcción, calidad de materiales, número de baños, vecindario, etc.). La model card reporta cuatro variantes evaluadas con validación cruzada de 5 folds y métrica RMSE sobre el logaritmo del precio: ridge (0,1145 ± 0,0078), gradient boosting (0,1160 ± 0,0079), random forest (0,1389 ± 0,0090) y red neuronal (0,1850 ± 0,0426). La predicción final de la demo promedia en escala logarítmica los dos mejores modelos (ridge y gradient boosting).

No se documenta el número de tokens de entrenamiento (no aplica), la composición exacta del dataset más allá de su origen en Kaggle, ni si hubo ajuste de hiperparámetros con búsqueda sistemática. Tampoco se describe ingeniería de características específica, tratamiento de valores faltantes o codificación de variables categóricas; el código completo se remite al repositorio de GitHub del autor. La innovación técnica es limitada por diseño: se trata de un baseline reproducible de regresión tabular, no de un modelo con mecanismos de atención, decodificación especulativa o atención lineal.

## Capacidades

- Regresión tabular: predice el precio de venta (`SalePrice`) de una vivienda a partir de un DataFrame con las 79 columnas del dataset Ames Housing.
- Ensemble de modelos: combina ridge y gradient boosting mediante media en escala logarítmica para la predicción de la demo.
- Carga directa desde el Hub: descarga del artefacto con `hf_hub_download` y carga con `joblib.load`.
- Integración con pandas: la entrada es un `DataFrame` de pandas, lo que facilita su uso en pipelines de datos existentes.
- Reproducibilidad: métricas de validación cruzada publicadas por modelo, lo que permite comparar variantes.
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo: no es un modelo de lenguaje.

## Casos de uso

- Valoración automática de inmuebles en Ames (Iowa): el modelo estima el precio de venta a partir de las 79 variables del dataset, útil como referencia en estudios de mercado locales acotados al periodo 2006-2010.
- Docencia y formación en machine learning tabular: sirve como ejemplo completo de pipeline (carga de datos, entrenamiento, validación cruzada, empaquetado con joblib) para asignaturas de introducción a la IA, como el propio proyecto de FEUP del que procede.
- Baseline para competiciones de regresión: proporciona una referencia rápida (RMSE en log de 0,1145 con ridge) contra la que comparar modelos más complejos en tareas de precios de vivienda.
- Prototipado de APIs de estimación: el artefacto joblib puede envolverse en un servicio Flask/FastAPI que reciba un JSON con las características de la vivienda y devuelva el precio estimado, con la advertencia de que la demo solo pide 8 características y rellena el resto con valores típicos.
- Análisis de sensibilidad de variables: al disponer de variantes ridge, gradient boosting y random forest, permite comparar cómo distintas familias de modelos ponderan las características de la vivienda.
- Evaluación comparativa de algoritmos: útil para ilustrar en informes técnicos la diferencia de rendimiento entre modelos lineales regularizados y ensembles de árboles en datos tabulares con variables categóricas y numéricas mixtas.

## Benchmarks y rendimiento

Resultados publicados en la model card (validación cruzada de 5 folds, RMSE sobre el logaritmo del precio; menor es mejor):

| Modelo | RMSE (log) |
|---|---|
| ridge | 0,1145 ± 0,0078 |
| gradient_boosting | 0,1160 ± 0,0079 |
| random_forest | 0,1389 ± 0,0090 |
| neural_network | 0,1850 ± 0,0426 |

No se han publicado resultados adicionales (MAE, R², comparación con el leaderboard de Kaggle) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; los modelos de scikit-learn se ejecutan en CPU y no requieren GPU.
- GPU recomendadas: ninguna; el entrenamiento e inferencia de estos estimadores no se beneficia de aceleración GPU en su configuración estándar.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y los artefactos joblib de ridge, gradient boosting y random forest son ligeros (del orden de megabytes, aunque el tamaño exacto no se publica).
- Opciones de despliegue: Python con scikit-learn y joblib; se puede servir con Flask, FastAPI o Streamlit (la model card menciona un `app.py` de demo). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; para un modelo de este tipo la inferencia por fila es del orden de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| House Price Predictor (este) | Ensemble sklearn tabular | no disponible | no aplica | RMSE log 0,1145 (ridge) | MIT | Hugging Face + GitHub |
| Baselines de Kaggle Ames Housing | Regresores varios (XGBoost, LightGBM, etc.) | no disponible | no aplica | No disponible en esta ficha | Variable según autor | Kaggle |
| Modelos de regresión tabular de referencia (p. ej. gradient boosting) | Árboles potenciados | no disponible | no aplica | No disponible en esta ficha | Variable | Librerías estándar |

No se dispone de datos verificados de modelos comparables concretos en la información proporcionada; la comparación con alternativas del leaderboard de Kaggle requeriría consultar dicha fuente.

## Limitaciones y advertencias

- Sesgo geográfico y temporal: entrenado con datos de una única ciudad estadounidense (Ames, Iowa) y ventas entre 2006 y 2010; no generaliza a otros mercados, países ni periodos.
- La demo (`app.py`) solicita solo 8 características y rellena las demás con valores típicos, por lo que sus predicciones son estimaciones aproximadas, no valoraciones precisas.
- Riesgo de error en extrapolación: fuera del rango de valores del dataset de entrenamiento, las predicciones pueden ser poco fiables.
- Sin soporte de texto libre: no procesa lenguaje natural, no responde preguntas y no admite prompts.
- Sin datos de sesgo demográfico o de equidad publicados; al tratarse de precios de vivienda, un uso real debería auditar posibles correlaciones con variables sensibles.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no hay garantías de idoneidad para producción.
- Fecha de creación en el Hub (2026-11-25) posterior a la fecha actual; conviene verificar la vigencia del repositorio antes de integrarlo.
- El repositorio no publica el tamaño exacto de los artefactos ni un recuento de parámetros, lo que dificulta estimar requisitos de almacenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoosborne/house-price-predictor
- Repositorio GitHub: https://github.com/eduardoosborne/House-Price-Predictor
- Dataset de la competición Kaggle: https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques
- Resultado de búsqueda web sin relación con el modelo (descartado): https://coincodecap.com/best-crypto-payment-gateway
