# EnerTEF/Performance-Evaluation-of-Energy-Forecasts-Service

## Resumen

Performance Evaluation of Energy Forecasts Service — WEC es un modelo de *machine learning* tabular basado en XGBoost, publicado por EnerTEF dentro de su colección de modelos para el sector energético. Su objetivo no es generar texto, sino estimar la potencia esperada de un convertidor de energía de las olas (WEC, *Wave Energy Converter*) a partir de 13 mediciones medioambientales del estado del mar y, a partir de esa referencia, detectar subrendimiento y posibles fallos en una flota de boyas.

El modelo se distribuye como un `XGBRegressor` ajustado (fichero `model.joblib`) que forma parte de una metodología de tres fases: una primera fase de rendimiento absoluto que compara la potencia observada con la predicha y marca anomalías cuando el residuo cae por debajo de `-3 × RMSE_train` (aproximadamente −17,1999 kW); una segunda fase de eficiencia relativa mediante un análisis de frontera estocástica (SFA) log-lineal con distribución normal/half-normal; y una tercera fase de fusión de decisiones que cruza ambas señales para asignar un estado operacional a cada observación.

El paquete se apoya en un *dataset* semiemprírico de 70.272 observaciones muestreadas cada 30 minutos en 12 boyas entre el 1 de marzo y el 30 de junio de 2026, con telemetría real de estado del mar (Waverider) y escenarios de generación y degradación simulados. Es relevante para equipos que trabajan en monitorización de parques undimotrices, mantenimiento predictivo y evaluación de servicios de predicción energética, ya que ofrece una línea base reproducible (licencia MIT) junto al *notebook* completo y los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre arboles de decision (XGBoost, `XGBRegressor`) |
| Parametros totales | no disponible (no se especifica numero de arboles, profundidad ni learning rate) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (checkpoint `joblib` de XGBoost; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (etiqueta `en`) |
| Licencia | MIT |
| Formato de pesos | joblib (`model.joblib`); datos y configuracion en CSV y JSON |
| Version de Python | 3.12 o superior (notebook en 3.12.3; inferencia verificada en 3.14.4) |
| Version de XGBoost | 3.2.0 (verificada para inferencia) |
| Numero de caracteristicas de entrada | 13 (numericas, en orden fijo) |
| Rango de salida | 0-350 kW (recortado) |
| Pipeline | `tabular-regression` |

## Arquitectura y entrenamiento

Se trata de un `XGBRegressor` (gradient boosting sobre arboles) que aprende a predecir la generacion esperada a partir de 13 mediciones ambientales contemporaneas: `Hs__m`, `Te__s`, `Wave_Power_Flux`, `H1/3__m`, `H1/10__m`, `Hmax__m`, `HTmax__m`, `Havg__m`, `Hsms__m`, `NumberOfWaves`, `THmax__s`, `Tavg__s` y `Tmax__s`. Las alturas de ola se expresan en metros, los periodos en segundos y `NumberOfWaves` es un recuento; el flujo de potencia ondulatoria sigue la convencion del *dataset* `0,49 × Hs__m² × Te__s` en kW/m. Las predicciones se recortan al rango fisico de 0-350 kW. No se aplica escalado ni imputacion generica: el modelo usa las medidas originales.

El *dataset* fuente contiene 70.272 observaciones de 12 boyas (marzo-junio de 2026), divididas en tres epocas: la epoca 1 (marzo-abril) como referencia sana, la epoca 2 (mayo) con condiciones ambientales suboptimas a nivel de flota y la epoca 3 (junio) con degradacion inyectada del *power take-off* en `Boia_9`-`Boia_12` mientras las `Boia_1`-`Boia_8` permanecen sanas. La fase 1 descarta 4.152 filas marcadas como `IGNORE` y conserva 66.120; entrena con 18.211 filas `TRAIN` (muestra aleatoria del 80 % dentro de la ventana sana de cada boya, entre el 22 de marzo y el 30 de abril) y evalua sobre 47.909 filas `TEST_NOMINAL`/`TEST_ANOMALY`. Este reparto se basa en metadatos de ventana sana, no es un *holdout* estrictamente cronologico.

La segunda fase ajusta, en tiempo de ejecucion del *notebook*, una frontera estocastica log-lineal con ruido simetrico normal y termino de ineficiencia half-normal sobre observaciones positivas de la epoca 1 por debajo de 345 kW; los parametros SFA no se almacenan en `model.joblib`. La tercera fase fusiona los residuos de la fase 1 y la eficiencia SFA para asignar uno de cuatro estados operacionales (Nominal, Falso Positivo Ambiental, Degradacion Latente, Fallo Critico), usando el umbral de residuo `< -RMSE_train` (aproximadamente −5,7333 kW) y eficiencia SFA `< 0,60`. La logica preserva deliberadamente la regla de un RMSE de la fase 3 frente al umbral de tres RMSE de la fase 1. No hay RLHF ni DPO (no aplica a un modelo tabular).

## Capacidades

- Regresion tabular: estima la potencia esperada (en kW) de un WEC a partir de 13 mediciones del estado del mar.
- Deteccion de anomalias por residuo: marca observaciones cuyo residuo (potencia observada menos predicha) cae por debajo de `-3 × RMSE_train` (aproximadamente −17,1999 kW) en la fase 1.
- Analisis de frontera estocastica (SFA): estima eficiencia tecnica y deficit de generacion separando ruido simetrico de ineficiencia de una cola (fase 2, ajustada en el *notebook*).
- Fusion de decisiones: clasifica cada observacion en uno de cuatro estados operacionales (Nominal, Falso Positivo Ambiental, Degradacion Latente, Fallo Critico) cruzando residuo y eficiencia.
- Diagnostico diferenciado: distingue efectos ambientales (falsos positivos) de degradacion mecanica simulada.
- No soporta *tool calling*, agentes, razonamiento multi-paso, vision ni audio: es un modelo tabular de regresion y clasificacion por umbrales.
- Capacidad multilingue: no aplica; interfaz y documentacion en ingles.

## Casos de uso

- Monitorizacion de flota de convertidores undimotrices: el modelo estima la potencia esperada de cada boya a partir de la telemetria contemporanea y permite comparar la generacion real con la referencia para 12 activos simultaneamente, gracias a que las caracteristicas son el estado del mar y no la identidad del activo.
- Mantenimiento predictivo con distincion de causa: combinando el residuo de la fase 1 y la eficiencia SFA de la fase 2, el sistema separa condiciones ambientales adversas (Falso Positivo Ambiental) de degradacion real (Degradacion Latente) y de fallos criticos, evitando intervenciones innecesarias por mal mar.
- Deteccion temprana de degradacion del *power take-off*: en el escenario de la epoca 3, el modelo identifica subrendimiento en `Boia_9`-`Boia_12` mientras las `Boia_1`-`Boia_8` se mantienen sanas, lo que permite priorizar inspecciones en los activos afectados.
- Auditoria de servicios de prediccion energetica: la metodologia de tres fases puede reutilizarse para evaluar la calidad de otros servicios de *forecasting* comparando predicciones con una linea base aprendida del comportamiento sano.
- Analisis post-mortem de incidentes: los estados operacionales y los informes y graficos generados por el *notebook* permiten reconstruir que ocurría en cada boya y en cada ventana temporal cuando se detecto un fallo.
- Integracion en pipelines de operacion y mantenimiento: el *checkpoint* `model.joblib` se carga con XGBoost y puede ejecutarse en *batch* sobre el CSV de flota o integrarse en un flujo SCADA que alimente las 13 variables y obtenga el estado operacional por marca de tiempo y boya.
- Investigacion y docencia: al incluir datos, *notebook* y reglas de decision calibradas, sirve como caso reproducible de combinacion de *baseline* supervisado (XGBoost) con *Stochastic Frontier Analysis* para analisis de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes, ya que no es un modelo de lenguaje). Los unicos datos cuantitativos aportados son las metricas internas de calibracion del *checkpoint*:

| Metrica | Valor |
|---|---|
| RMSE de entrenamiento (`RMSE_train`) | aproximadamente 5,7333 kW |
| Umbral de anomalia fase 1 (`-3 × RMSE_train`) | aproximadamente −17,1999 kW |
| Umbral de residuo fase 3 (`-RMSE_train`) | aproximadamente −5,7333 kW |
| Umbral de eficiencia SFA (estado no nominal) | 0,60 |
| Observaciones de entrenamiento | 18.211 |
| Observaciones de evaluacion | 47.909 |

Nota: el nombre de la columna de origen `RMSE_test_dynamic` contiene en realidad el RMSE de entrenamiento, pese a su denominacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no requiere GPU (modelo tabular de XGBoost).
- GPU recomendadas: no aplica. La inferencia y el reentrenamiento pueden ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no aplica; el modelo cabe en cualquier equipo que ejecute Python 3.12 o superior con XGBoost 3.2.0.
- Tamano del repositorio: 0,0 GB segun HuggingFace (incluye `model.joblib`, CSV y *notebook*; el *dataset* se gestiona con Git LFS).
- Opciones de despliegue: carga directa del *checkpoint* con la libreria XGBoost (`joblib`); no aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada; al ser un *ensemble* de arboles sobre 13 caracteristicas, el coste por observacion es bajo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de la misma categoria (evaluacion de rendimiento de WEC mediante XGBoost + SFA). Como referencia generica de la familia de modelos tabulares podrian citarse alternativas como LightGBM o CatBoost, pero no se dispone de datos de rendimiento de este modelo frente a ellas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EnerTEF Performance-Evaluation-of-Energy-Forecasts-Service | no disponible | no aplica | RMSE_train ≈ 5,7333 kW | MIT | HuggingFace + GitHub |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los datos de flota son semiempriricos: la telemetria de estado del mar es real (Waverider), pero la replicacion de la flota, la atenuacion espacial y los escenarios de generacion y degradacion estan simulados; los resultados no deben extrapolarse directamente a parques reales sin validacion.
- El reparto de entrenamiento no es un *holdout* estrictamente cronologico: se basa en metadatos de una ventana sana por boya (muestra aleatoria del 80 %), lo que puede sobreestimar el rendimiento en condiciones de despliegue reales.
- La etiqueta `TEST_ANOMALY` identifica periodos de escenario e incluye activos sanos en la epoca 3, por lo que no equivale a una etiqueta de fallo individual; usarla como tal induce error.
- Existe una inconsistencia documentada: la columna `RMSE_test_dynamic` contiene el RMSE de entrenamiento pese a su nombre, y la fase 1 (tres RMSE) y la fase 3 (un RMSE) usan umbrales de residuo distintos de forma deliberada.
- Los parametros de la SFA no se almacenan en `model.joblib`; se reajustan al ejecutar el *notebook*, por lo que los resultados de la fase 2 no son reproducibles sin volver a lanzar el flujo completo con los datos de referencia y los metadatos de epoca.
- El SFA requiere observaciones de referencia y metadatos de epoca, ademas de la generacion real, que es necesaria tambien para calcular residuos y marcar anomalias; el modelo no funciona como predictor ciego sin esa informacion.
- Idioma: documentacion e interfaz solo en ingles (etiqueta `en`).
- Licencia MIT: permite uso comercial y modificacion, pero se debe conservar el aviso de copyright de EnerTEF; conviene revisar los terminos del repositorio fuente en GitHub por si el proyecto original anade condiciones adicionales.
- Riesgo de uso indebido: al ser un modelo de umbrales calibrados para este *dataset* concreto, cambiar las columnas, sus unidades o su orden invalida las predicciones y las reglas de decision.
- Estado del recurso: 0 descargas y 0 *likes* en HuggingFace en el momento de la consulta; no hay evidencia de validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EnerTEF/Performance-Evaluation-of-Energy-Forecasts-Service
- Coleccion EnerTEF en HuggingFace: https://huggingface.co/EnerTEF
- Repositorio fuente en GitHub: https://github.com/ENERTEF/Performance-Evaluation-of-Energy-Forecasts-Service
