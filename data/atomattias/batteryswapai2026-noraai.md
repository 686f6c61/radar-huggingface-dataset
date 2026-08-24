# Atomattias/BatterySwapAI2026-NoraAI

## Resumen

NoraAI es una solucion presentada a la competicion BatterySwapAI 2026 organizada por NORA (Norwegian Artificial Intelligence Research Consortium). El reto consiste en predecir la vida util restante (Remaining Useful Life, RUL) de baterias en sensores IoT desplegados en edificios y planificar su reemplazo de forma eficiente. El modelo combina un enfoque de pronostico basado en regresion por cuantiles con un planificador greedy para generar un calendario de sustituciones.

Desarrollado por Atomattias, el sistema emplea `HistGradientBoostingRegressor` de scikit-learn con modelos cuantiles P10/P50/P90 para estimar la RUL con intervalos de confianza, y un scheduler greedy que decide que baterias reemplazar cada dia. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un pipeline clasico de machine learning y optimizacion. Su relevancia radica en abordar un problema industrial real de mantenimiento predictivo con una solucion ligera y reproducible, publicada bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HistGradientBoostingRegressor (sklearn) con modelos cuantiles P10/P50/P90 + scheduler greedy |
| Parametros totales | no disponible (modelo de ML clasico, no redes neuronales) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (archivo `sklearn_quantile.joblib` y `config.joblib`) |

## Arquitectura y entrenamiento

El sistema se compone de dos modulos principales. El modulo de pronostico utiliza `HistGradientBoostingRegressor` de scikit-learn entrenado para predecir la RUL de cada bateria. Se generan tres modelos cuantiles (P10, P50, P90) que proporcionan una estimacion puntual y un intervalo de confianza, lo que permite evaluar el riesgo de fallo. El modulo de planificacion implementa un scheduler greedy que, a partir de las predicciones de RUL y de las caracteristicas de la ultima fila de datos (HI features), decide que baterias reemplazar en cada dia del horizonte de planificacion, generando un plan con fechas sin zona horaria (tz-naive).

No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion del dataset ni el proceso de validacion. El repositorio incluye un script de entrada (`script.py`) que genera el archivo `submission.csv` a partir de los datos montados en `/tmp/data`, y un Dockerfile para reproducir el entorno de ejecucion.

## Capacidades

- Prediccion de vida util restante (RUL) de baterias de sensores IoT mediante regresion por cuantiles (P10/P50/P90), ofreciendo intervalos de confianza.
- Planificacion de reemplazos de baterias con un scheduler greedy que prioriza las baterias con menor RUL y optimiza el numero de sustituciones por dia.
- Generacion automatica de un archivo de submission (`submission.csv`) en el formato requerido por la competicion.
- Ejecucion reproducible mediante Docker, con punto de entrada estandarizado (`python3 script.py`).
- Integracion con el ecosistema scikit-learn, lo que facilita su mantenimiento y extension.

## Casos de uso

- Gestion de flotas de sensores IoT: el modelo permite a operadores de redes de sensores distribuidos en multiples edificios anticipar cuando cada bateria llegara al final de su vida util, reduciendo interrupciones del servicio.
- Mantenimiento predictivo en infraestructuras criticas: las predicciones cuantiles P10/P90 ayudan a planificar reemplazos con margen de seguridad, evitando fallos inesperados en sistemas de monitorizacion ambiental o de seguridad.
- Optimizacion de rutas de tecnicos de campo: el planificador greedy genera un calendario de sustituciones que puede integrarse con herramientas de ruteo para minimizar desplazamientos y costes laborales.
- Evaluacion de estrategias de reemplazo: al comparar diferentes politicas (conservadora vs. agresiva) mediante simulaciones, los responsables pueden decidir el equilibrio entre coste de reemplazo y riesgo de downtime.
- Benchmarking de algoritmos de pronostico: el enfoque con HistGradientBoosting y cuantiles sirve como linea base solida para comparar tecnicas mas complejas (redes neuronales, modelos probabilisticos) en el mismo problema.
- Despliegue en entornos con recursos limitados: al ser un modelo clasico de sklearn, puede ejecutarse en CPU sin necesidad de GPU, adecuado para equipos de bajo coste o entornos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (como RMSE, MAE o puntuaciones de la competicion) ni comparaciones con otras soluciones.

## Requisitos de hardware

- Al ser un modelo de machine learning clasico (HistGradientBoostingRegressor), la inferencia es ligera y puede ejecutarse en CPU sin necesidad de GPU.
- No se especifican requisitos minimos de RAM o almacenamiento; el repositorio tiene un tamano de 0.0 GB, lo que sugiere que los artefactos son de pequeno tamano.
- El despliegue se realiza mediante Docker (imagen construida con `docker build`) o directamente con Python 3 y scikit-learn.
- No se dispone de datos de latencia o throughput, pero al tratarse de un modelo tabular, la prediccion por muestra es del orden de milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (prediccion de RUL de baterias IoT). Otras soluciones de la competicion BatterySwapAI 2026, como la de ZRPATeam, utilizan LightGBM con calibracion por tipo de edificio y optimizacion de rutas con OR-Tools, pero no se han publicado metricas comparativas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta disenado especificamente para el formato de datos y el problema de la competicion BatterySwapAI 2026; su aplicacion a otros conjuntos de datos o dominios requeriria reentrenamiento y adaptacion.
- No es un modelo de lenguaje ni de generacion de texto; no debe utilizarse para tareas de NLP.
- La planificacion greedy puede no ser optima globalmente; para flotas muy grandes o restricciones complejas, podrian requerirse metodos de optimizacion mas sofisticados (por ejemplo, programacion lineal entera).
- No se han documentado sesgos especificos, pero al depender de datos historicos de sensores, podria heredar sesgos de las condiciones de operacion originales (por ejemplo, clima, tipo de edificio).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No se incluyen intervalos de confianza calibrados formalmente; los cuantiles P10/P90 son estimaciones heuristicas que deben validarse con datos reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Atomattias/BatterySwapAI2026-NoraAI
- Pagina de la competicion BatterySwapAI 2026: https://www.nora.ai/competitions/batteryswapai/batteryswapai2026.html
- Pagina general de BatterySwapAI: https://www.nora.ai/competitions/batteryswapai/
- Solucion de ZRPATeam (referencia comparativa): https://github.com/ZRPATeam/BatterySwapAI-2026/
