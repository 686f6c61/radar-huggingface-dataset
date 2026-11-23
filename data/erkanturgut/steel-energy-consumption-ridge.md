# erkanturgut/steel-energy-consumption-ridge

## Resumen

Steel-energy-consumption-ridge es un pipeline de regresión supervisada publicado por Erkan Turgut que estima el consumo eléctrico (`Usage_kWh`) de una planta siderúrgica en intervalos de 15 minutos. No es un modelo de lenguaje ni una red neuronal: es un `Pipeline` de scikit-learn que combina escalado estándar, expansión polinómica de grado 2 sobre variables numéricas, codificación one-hot de variables categóricas y un estimador `Ridge(alpha=10)`.

El modelo resuelve un problema acotado de regresión tabular: dado un conjunto de nueve variables de entrada (potencias reactivas, factores de potencia, codificación cíclica de la hora del día, estado laboral y tipo de carga), predice el consumo energético del intervalo correspondiente. Su relevancia es práctica: permite construir sistemas de monitorización y estimación de consumo en entornos industriales con un artefacto ligero, interpretable y de código abierto bajo licencia MIT.

El repositorio es mínimo (0,0 GB) y contiene un único artefacto serializado con joblib (`steel_energy_pipeline_v1.pkl`). El autor declara métricas muy altas en el conjunto de test (R² de 0,9799), aunque con una salvedad importante recogida en la propia model card: la partición es aleatoria sobre datos de series temporales, lo que tiende a producir estimaciones optimistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn: `StandardScaler` → `PolynomialFeatures(degree=2)` → `OneHotEncoder(drop="first", handle_unknown="ignore")` → `Ridge(alpha=10)` |
| Parametros totales | no disponible (no se documenta el numero de coeficientes resultantes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (regresion tabular, una fila por inferencia) |
| Tipos de cuantizacion | no aplica (coeficientes en coma flotante dentro del pickle de joblib) |
| Idiomas soportados | no disponible (las entradas categoricas estan en ingles: `Weekday`/`Weekend`, `Monday`…`Sunday`, `Light_Load`/`Medium_Load`/`Maximum_Load`) |
| Licencia | MIT |
| Formato de pesos | `.pkl` serializado con joblib (`steel_energy_pipeline_v1.pkl`); requiere scikit-learn 1.6.1 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de regresion tabular. Las variables numericas (`Lagging_Current_Reactive.Power_kVarh`, `Leading_Current_Reactive_Power_kVarh`, `Lagging_Current_Power_Factor`, `Leading_Current_Power_Factor`, `hour_sin`, `hour_cos`) pasan por `StandardScaler` y despues por `PolynomialFeatures` de grado 2, lo que introduce terminos cuadraticos y de interaccion entre ellas. Las variables categoricas (`WeekStatus`, `Day_of_week`, `Load_Type`) se codifican con `OneHotEncoder(drop="first", handle_unknown="ignore")`. Sobre el vector resultante se ajusta una regresion Ridge con `alpha=10`, hiperparametro seleccionado mediante `GridSearchCV`.

El entrenamiento utiliza el dataset Steel Industry Energy Consumption (UCI 851), correspondiente a la planta de DAEWOO Steel Co. en Gwangyang (Corea del Sur) durante 2018, con resolucion de 15 minutos y 35.040 filas sin valores faltantes. El autor indica que `CO2(tCO2)` se excluye deliberadamente como entrada por ser una variable derivada del consumo y, por tanto, una fuga del objetivo. La particion empleada es un 20 % de hold-out (7.008 intervalos) con `random_state=42`, complementada con una validacion cruzada de 5 pliegues sobre el conjunto de entrenamiento (RMSE de 4,9379 ± 0,5532 kWh). No se documenta ningun proceso de regularizacion adicional, aumento de datos ni recalibracion posterior.

## Capacidades

- Regresion tabular: predice `Usage_kWh` para un intervalo de 15 minutos a partir de nueve variables de entrada.
- Modelado de estacionalidad intradiaria mediante codificacion ciclica (`hour_sin`, `hour_cos`) calculada a partir de los segundos desde medianoche.
- Captura de interacciones y no linealidades suaves gracias a los terminos polinomiales de grado 2.
- Tratamiento explicito de variables categoricas de calendario y perfil de carga (`WeekStatus`, `Day_of_week`, `Load_Type`).
- Tolerancia a categorias no vistas en entrenamiento (`handle_unknown="ignore"` en el codificador one-hot).
- Serializacion completa del pipeline en un unico artefacto, lo que simplifica el despliegue.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es exclusivamente un regresor tabular.

## Casos de uso

- Monitorizacion energetica en planta: estimar el consumo esperado de cada intervalo de 15 minutos a partir de las lecturas electricas y compararlo con el consumo real para detectar desviaciones o anomalias operativas.
- Cuadro de mando industrial: alimentar dashboards de eficiencia energetica con una prediccion de referencia por turno, dia de la semana y tipo de carga, usando el artefacto de joblib cargado en un servicio Python.
- Validacion de sensores: contrastar la lectura de `Usage_kWh` frente a la estimacion del modelo permite identificar medidores descalibrados o caidas de telemetria en la planta.
- Analisis de escenarios de carga: simular como varia el consumo estimado al cambiar `Load_Type` o el factor de potencia, util para estudiar el impacto de reconfiguraciones operativas.
- Segmentacion de consumos por perfil horario: combinar las predicciones con la codificacion ciclica de la hora para identificar franjas de alta demanda y priorizar medidas de eficiencia.
- Docencia y prototipado de MLOps: al ser un pipeline pequeno con licencia MIT y dependencias estandar, sirve como ejemplo reproducible de extremo a extremo (entrenamiento, serializacion, publicacion en Hugging Face y demo en Spaces).
- Integracion en sistemas de gestion energetica (EMS): el modelo puede exponerse como endpoint interno que reciba las variables del intervalo y devuelva el kWh estimado junto con la telemetria registrada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index).

| Metrica | Valor | Conjunto |
|---|---|---|
| R² | 0,9799 | Test (20 %, 7.008 intervalos, split aleatorio, `random_state=42`) |
| RMSE | 4,7856 kWh | Test |
| MAE | 3,0710 kWh | Test |
| RMSE (5-fold CV) | 4,9379 ± 0,5532 kWh | Entrenamiento |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; no se requiere GPU para cargar ni ejecutar el pipeline.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el artefacto es un pickle de un pipeline de scikit-learn con coeficientes de regresion.
- Memoria RAM: no disponible de forma explicita; el orden de magnitud es de decenas o pocos cientos de MB al cargar scikit-learn, pandas, numpy y joblib.
- Opciones de despliegue: script Python con `joblib.load`, API con FastAPI o Flask, funcion serverless, o Hugging Face Spaces (el autor publica una demo en Spaces). No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de una regresion lineal con expansion polinomica de grado 2, la inferencia por fila es de orden de microsegundos a milisegundos en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia cualitativa, la propia model card define el modelo como una alternativa de regresion Ridge con caracteristicas polinomicas frente a enfoques mas complejos (gradient boosting, redes neuronales) sobre el mismo dataset UCI 851, pero no se aportan resultados de esos enfoques.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steel-energy-consumption-ridge | no disponible | no aplica | R² 0,9799 / RMSE 4,7856 kWh (test, split aleatorio) | MIT | Hugging Face + demo en Spaces |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las entradas se miden en el mismo intervalo que el objetivo: es un modelo de estimacion, no un predictor adelantado en el tiempo. No sirve para pronosticar consumo futuro sin redefinir las variables de entrada.
- La particion aleatoria sobre datos de series temporales produce una estimacion optimista; el autor reconoce que una particion cronologica seria mas estricta y probablemente arrojaria peores metricas.
- Entrenado con datos de una sola planta (DAEWOO Steel Co., Gwangyang) y un solo ano (2018); la transferencia a otras instalaciones, paises o anos no esta validada.
- No incorpora variables meteorologicas, festivos ni calendarios de mantenimiento, que pueden explicar parte de la variacion del consumo.
- Los terminos polinomiales pueden extrapolar mal fuera del rango de entrenamiento; entradas atipicas pueden generar predicciones poco fiables.
- Riesgo de fuga de informacion si se reintroduce `CO2(tCO2)` u otras variables derivadas del consumo como entradas.
- El artefacto es un pickle de joblib: solo debe cargarse desde fuentes de confianza, ya que la deserializacion puede ejecutar codigo arbitrario.
- Requiere exactamente scikit-learn 1.6.1 para cargar el pipeline; otras versiones pueden provocar incompatibilidades de deserializacion.
- Las variables categoricas estan fijadas en ingles y con un conjunto cerrado de valores; el codificador ignora categorias desconocidas, lo que puede degradar silenciosamente la prediccion.
- No se documentan sesgos demograficos ni sociales porque el modelo no procesa datos personales; los sesgos relevantes son de representatividad industrial.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia sobre el rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erkanturgut/steel-energy-consumption-ridge
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/erkanturgut/steel-energy-predictor
- Notebook de Kaggle: https://www.kaggle.com/code/erkanturgut/steel-industry-energy-consumption/
- Codigo fuente y pipeline de entrenamiento: https://github.com/Erkan3034/steel-industry-energy-consumption
- Dataset UCI 851: https://archive.ics.uci.edu/dataset/851/steel+industry+energy+consumption
- Dataset en Kaggle: https://www.kaggle.com/datasets/csafrit2/steel-industry-energy-consumption
- GitHub del autor: https://github.com/Erkan3034
- Kaggle del autor: https://www.kaggle.com/erkanturgut
- LinkedIn del autor: https://www.linkedin.com/in/erkanturgut1205/
