# HZZ10Z/gta5-revenue-prediction-model

## Resumen

El modelo `HZZ10Z/gta5-revenue-prediction-model` es un regresor supervisado basado en Random Forest, publicado en Hugging Face por el usuario HZZ10Z como parte de una evaluacion academica de la asignatura Business Data Science (MN1135). Su objetivo es predecir el ingreso bruto total (`gross_revenue_usd`) derivado de las ventas de Grand Theft Auto V en plataformas de novena generacion (PlayStation 5 y Xbox Series X|S), a partir de variables operativas y comerciales como unidades vendidas, precio medio, descuentos, jugadores online, ingresos por DLC y microtransacciones.

No se trata de un modelo de lenguaje ni de una red neuronal: es un artefacto de machine learning clasico serializado con `joblib`, compuesto por un `RandomForestRegressor` optimizado, un `StandardScaler` para las variables numericas y un conjunto de nombres de caracteristicas (`feature_names`) mas metadatos. El pipeline de preprocesado aplica One-Hot Encoding sobre las variables categoricas, expandiendo las 47 columnas originales del dataset a 304 caracteristicas de entrada.

El modelo resulta relevante unicamente en el contexto de su caso de uso: analitica financiera aplicada a la industria del videojuego sobre un dataset especifico de Kaggle (1.980 observaciones, periodo 2022-2026). No es un modelo generalista, no procesa texto ni imagenes, y su validez esta acotada a la poblacion y periodo descritos por el autor. La licencia MIT permite reutilizacion comercial, pero la utilidad practica fuera de su dominio de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest Regressor (ensemble de arboles de decision) con pipeline de preprocesado (StandardScaler + One-Hot Encoding) |
| Parametros totales | no disponible (no aplica; modelo basado en arboles, no en pesos neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto `joblib`) |
| Idiomas soportados | `id` (indonesio) segun metadatos de Hugging Face; el modelo en si no procesa lenguaje |
| Licencia | MIT |
| Formato de pesos | `joblib` (compatible con `scikit-learn` 1.6.1) |
| Numero de caracteristicas de entrada | 304 (tras One-Hot Encoding) |
| Numero de observaciones de entrenamiento | 1.980 filas (dataset original de 47 columnas) |
| Version de scikit-learn requerida | 1.6.1 |
| Tamano del repositorio | 0,0 GB (artefactos ligeros) |

## Arquitectura y entrenamiento

El modelo es un `RandomForestRegressor` de scikit-learn, un ensemble de arboles de decision entrenados mediante bagging sobre subconjuntos aleatorios de datos y caracteristicas. El pipeline incluye un `StandardScaler` ajustado sobre las columnas numericas (`units_sold`, `average_selling_price_usd`, `discount_percentage`, `online_players`, `dlc_revenue_usd`, `shark_card_revenue_usd`, `estimated_active_players`, `peak_concurrent_players`, entre otras) y una expansion mediante One-Hot Encoding de las variables categoricas (`country`, `region`, `platform`, `game_edition`, `sales_channel`, `major_sale_event`, `special_event`). El resultado son 304 caracteristicas de entrada.

El dataset de entrenamiento procede de Kaggle ("Video Game Sales Analytics GTA V PlayStation 5 dan Xbox"), con 1.980 observaciones de transacciones entre 2022 y 2026. El autor indica que el modelo final es una version "optimizada" del Random Forest, aunque no se documentan en la model card los hiperparametros concretos (numero de arboles, profundidad maxima, criterio de division, etc.), ni el procedimiento de busqueda de hiperparametros, ni si se aplico validacion cruzada. Tampoco se especifica la semilla aleatoria ni la division exacta entre entrenamiento y prueba mas alla del 80/20 mencionado. No se documenta ningun proceso de RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Prediccion de regresion sobre una unica variable objetivo continua: `gross_revenue_usd` (ingreso bruto total en dolares estadounidenses).
- Procesamiento de datos tabulares estructurados con 304 caracteristicas de entrada derivadas de 47 columnas originales.
- Manejo de variables numericas continuas y discretas, y de variables categoricas codificadas mediante One-Hot Encoding.
- Capacidad de estimar ingresos condicionados a plataforma (PS5 vs Xbox Series X|S), edicion del juego, canal de venta, region y eventos promocionales.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No genera texto, codigo ni respuestas conversacionales.

## Casos de uso

- **Estimacion financiera de ingresos por plataforma:** el modelo permite proyectar el ingreso bruto esperado para PS5 y Xbox Series X|S a partir de variables como unidades vendidas, precio medio y descuento aplicado. Es adecuado porque fue entrenado especificamente sobre transacciones de esas dos plataformas en el periodo 2022-2026.
- **Planificacion de capacidad de servidores multijugador:** dado que el modelo incorpora `online_players`, `estimated_active_players` y `peak_concurrent_players` como entradas, puede usarse para correlacionar la carga de jugadores concurrentes con el ingreso esperado y anticipar necesidades de infraestructura.
- **Simulacion de estrategias de monetizacion in-game:** permite explorar como variaciones en `dlc_revenue_usd` y `shark_card_revenue_usd` se asocian con cambios en el ingreso bruto total, util para equipos de monetizacion que disenan promociones de contenido descargable.
- **Analisis de impacto de campanas de descuento:** al incluir `discount_percentage`, `major_sale_event` y `special_event`, el modelo puede emplearse para estimar el ingreso asociado a distintas configuraciones de descuento y eventos promocionales.
- **Evaluacion comparativa de canales de venta:** la codificacion de `sales_channel` (digital vs fisico) permite analizar diferencias de ingreso esperado entre canales, util para decisiones de distribucion.
- **Docencia y evaluacion academica de pipelines de regresion:** el artefacto sirve como ejemplo reproducible de un pipeline completo (preprocesado, escalado, One-Hot Encoding, entrenamiento y evaluacion con MAE, RMSE y R²) en un contexto de asignatura de ciencia de datos de negocio.
- **Prototipado rapido de modelos de forecast financiero en la industria del videojuego:** puede servir como linea base para equipos que quieran construir modelos mas complejos sobre datos de ventas de videojuegos, dado su bajo coste computacional y su licencia permisiva.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el 20% del conjunto de prueba (Random Forest optimizado):

| Metrica | Valor |
|---|---|
| Mean Absolute Error (MAE) | 608.7146 USD |
| Root Mean Squared Error (RMSE) | 2.115.9333 USD |
| R² Score | 0,9509 (95,09%) |
| Precision con tolerancia de error <= 10% | 81,82% de los casos |
| Precision con tolerancia de error <= 20% | 94,95% de los casos |

No se han publicado resultados comparativos con otros modelos (lineas base, gradient boosting, regresion lineal, etc.) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no aplica; el modelo es un artefacto `joblib` basado en arboles de decision, no requiere GPU.
- **GPU recomendadas:** ninguna; la inferencia se ejecuta en CPU.
- **Compatibilidad con GPU de consumo:** no aplica.
- **Opciones de despliegue:** carga directa mediante `joblib.load` en Python con `scikit-learn` 1.6.1; puede servirse a traves de un endpoint HTTP propio (Flask, FastAPI) o integrarse en notebooks y pipelines de datos.
- **Latencia y throughput estimados:** no disponibles en la informacion proporcionada. Dado el tamano reducido del repositorio (0,0 GB) y la naturaleza del modelo (ensemble de arboles sobre 304 caracteristicas), se espera una latencia muy baja en CPU, pero no se aportan mediciones.
- **Memoria RAM:** no especificada; el modelo es ligero y cabe holgadamente en cualquier equipo convencional.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un artefacto academico especifico de un dataset concreto (GTA V, PS5/Xbox Series X|S, 2022-2026) sin benchmarks publicos frente a alternativas. Cualquier comparacion con otros regresores (XGBoost, LightGBM, regresion lineal multiple) requeriria reentrenar sobre el mismo dataset, lo cual no se ha documentado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HZZ10Z/gta5-revenue-prediction-model | no aplica (Random Forest) | no aplica (tabular) | R² = 0,9509; MAE = 608,71 USD | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgo en valores extremos:** el autor advierte de que el modelo tiende a subestimar transacciones de valor muy alto (por encima de 30.000 USD), ya que los patrones de esas transacciones extremas no estan representados de forma consistente en los datos de entrenamiento.
- **Dependencia de la infraestructura de jugadores online:** la prediccion depende fuertemente de metricas como `online_players`; una caida o degradacion de los servidores globales puede desviar significativamente la estimacion respecto a la realidad operativa.
- **Asuncion de no causalidad:** las correlaciones aprendidas (por ejemplo, entre ingresos por DLC y ingreso total) son asociativas, no causales; el modelo no debe usarse para inferir relaciones causa-efecto ni para tomar decisiones contrafactuales sin analisis adicional.
- **Validez poblacional y temporal restringida:** el modelo solo es valido para el ecosistema de consolas de novena generacion (PS5 y Xbox Series X|S) y para el periodo de tendencias de mercado 2022-2026. No debe emplearse para PC, Nintendo, consolas de generaciones anteriores ni para otras franquicias.
- **Riesgo de alucinacion:** no aplica en el sentido habitual (no genera texto), pero existe riesgo de predicciones erroneas fuera de la distribucion de entrenamiento.
- **Restricciones de licencia:** la licencia MIT permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias ni asume responsabilidad por el uso del modelo en produccion.
- **Dependencia de version de scikit-learn:** el artefacto requiere `scikit-learn` 1.6.1; versiones distintas pueden producir incompatibilidades al deserializar con `joblib`.
- **Ausencia de documentacion de hiperparametros:** no se detallan los hiperparametros del Random Forest ni el procedimiento de optimizacion, lo que dificulta la reproducibilidad exacta.
- **Idioma:** los metadatos declaran `id` (indonesio), coherente con el contexto academico del autor, pero el modelo no procesa lenguaje; este campo es meramente descriptivo.
- **Cero adopcion:** el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa por parte de la comunidad.

## Enlaces

- [Hugging Face: HZZ10Z/gta5-revenue-prediction-model](https://huggingface.co/HZZ10Z/gta5-revenue-prediction-model)
- [Dataset en Kaggle: Video Game Sales Analytics GTA V PS5 and Xbox X|S 22-26](https://www.kaggle.com/datasets/samekto/dataset-penjualan-gta-v-vr-ps5-and-xbox-x-s-22-26)
