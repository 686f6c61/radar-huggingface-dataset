# Lukit4as/lucas-sklearn-regresion

## Resumen

`Lukit4as/lucas-sklearn-regresion` es un modelo de regresion lineal multiple implementado con scikit-learn y distribuido como artefacto serializado en formato `joblib`. Lo publica el usuario Lukit4as como ejemplo pedagogico para el IFTS N.º 18 (docente: Cynthia M. Villagra), en el marco de una clase sobre aprendizaje supervisado. No es una red neuronal ni un modelo de lenguaje: es un estimador clasico de regresion tabular que predice el precio de una vivienda en miles de dolares estadounidenses a partir de tres variables de entrada (`m2`, `balcon`, `ascensor`).

El modelo se entrena sobre un dataset sintetico de 200 registros generados con una funcion lineal conocida mas ruido gaussiano, con un reparto de 160 registros para entrenamiento y 40 para evaluacion. Su relevancia no reside en el rendimiento predictivo (que es trivial por construccion del dataset), sino en su valor didactico: ilustra de forma completa el ciclo de vida de un modelo supervisado, desde la generacion de datos hasta la publicacion en el Hub, incluyendo la serializacion con `joblib` y la evaluacion con MAE y R².

Al tratarse de un ejemplo educativo, su utilidad en produccion es practicamente nula fuera del aula. Sin embargo, sirve como referencia para entender que contiene realmente un artefacto `.joblib` (coeficientes e intercepto) y por que es importante fijar versiones de scikit-learn al desplegar modelos clasicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (minimos cuadrados ordinarios, `sklearn.linear_model.LinearRegression`) |
| Parametros totales | 4 parametros aprendidos (3 coeficientes + 1 intercepto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (no aplica a modelos sklearn) |
| Idiomas soportados | Espanol (documentacion y model card) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion basada en pickle) |

## Arquitectura y entrenamiento

El modelo es una regresion lineal multiple clasica resuelta por minimos cuadrados ordinarios mediante `sklearn.linear_model.LinearRegression`. La hipotesis subyacente es que el precio es una combinacion lineal de las tres features de entrada mas un termino independiente: `precio = 1,503·m2 + 8,719·balcon + 11,988·ascensor + 19,557`. Los coeficientes aprendidos quedan muy proximos a los usados en la generacion sintetica de los datos (`1,5`, `8`, `12` y `20`), lo que confirma que el ajuste ha recuperado practicamente la funcion generadora.

Los datos de entrenamiento son 200 registros sinteticos generados en `train.py` con semilla fija. Las features `m2` varian entre 35 y 120, y `balcon` y `ascensor` son binarias (0/1). La variable objetivo se construye como `precio = 1.5·m2 + 8·balcon + 12·ascensor + 20 + ruido`. No hay fases de RLHF, DPO ni tecnicas de regularizacion: es un ajuste por minimos cuadrados puro sobre un problema de baja dimension. La particion es 160/40 (80/20) sin validacion cruzada.

## Capacidades

- Prediccion de una variable objetivo continua (precio en miles de USD) a partir de tres features tabulares.
- Regresion tabular con interpretabilidad total: los coeficientes son directamente legibles como contribuciones marginales en dolares.
- Inferencia instantanea (microsegundos por muestra) al ser una evaluacion de una combinacion lineal.
- Reproducibilidad completa: el script `train.py` y la semilla permiten regenerar el dataset y reentrenar el modelo.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- Capacidad multilingue limitada a la documentacion en espanol; el modelo en si no procesa lenguaje.

## Casos de uso

- Docencia de aprendizaje supervisado: usar el modelo y su `train.py` en un aula para mostrar el flujo completo de un problema de regresion, desde la generacion de datos hasta la evaluacion con MAE y R².
- Demostracion de serializacion con `joblib`: ilustrar como se persiste un estimador de scikit-learn y como se recarga en otro entorno, incluyendo la advertencia sobre pickle.
- Ejemplo de model card bien documentada: servir de plantilla para que estudiantes aprendan a documentar parametros aprendidos, metricas y limitaciones.
- Prueba de pipelines de inferencia tabular: validar un endpoint de serving (FastAPI, BentoML) con un modelo trivial y rapido antes de pasar a modelos reales.
- Benchmark de tooling de ML: comparar latencias y formatos de serializacion (`joblib` frente a `pickle` o `ONNX`) en un caso de juguete controlado.
- Reproducibilidad y control de versiones: ejemplo de como fijar la version de scikit-learn en `requirements.txt` para evitar incompatibilidades al cargar el `.joblib`.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de USD | Test (40 registros) |
| R² | 0,989 | Test (40 registros) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a este tipo de modelo. Las unicas metricas disponibles son las de la model card sobre el conjunto de test sintetico.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (modelo puramente CPU; el artefacto `.joblib` ocupa unos pocos kilobytes).
- GPU recomendadas: no aplica; no se necesita GPU.
- Cabe en cualquier CPU consumer, Raspberry Pi o incluso en un entorno serverless de capa gratuita.
- Opciones de despliegue: script Python con `joblib` + `scikit-learn`, endpoint FastAPI, BentoML, MLflow, o incluso un notebook de Jupyter.
- Latencia y throughput: no publicados, pero al ser una combinacion lineal de tres features la latencia por muestra es del orden de microsegundos y el throughput supera con holgura las decenas de miles de predicciones por segundo en una sola CPU.
- Requisito critico: la version de scikit-learn en inferencia debe coincidir con la de entrenamiento para evitar incompatibilidades al deserializar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Lukit4as/lucas-sklearn-regresion` | Regresion lineal (sklearn) | 4 | No aplica | MIT | HuggingFace Hub |
| Regresion ridge / lasso (sklearn) | Regresion lineal regularizada | Variable | No aplica | BSD-3 | scikit-learn |
| XGBoost / LightGBM | Gradient boosting tabular | Variable (arboles) | No aplica | Apache 2.0 / MIT | Repos oficiales |
| Regresion lineal multiple equivalente | Implementacion manual con NumPy | 4 | No aplica | Depende del autor | No disponible |

No se dispone de comparativas publicadas con otros modelos del Hub para este caso concreto, dado su caracter educativo y su tamano minimo.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sinteticos y no representan precios de vivienda reales.
- Rango de validez limitado a `m2` entre 35 y 120; fuera de ese intervalo el modelo extrapola linealmente sin garantias.
- Supone efectos aditivos lineales: no captura interacciones (por ejemplo, que el ascensor valga mas en edificios altos) ni no linealidades.
- `joblib` usa pickle por debajo: cargar archivos `.joblib` de fuentes no confiables puede ejecutar codigo arbitrario.
- Requiere que la version de scikit-learn en inferencia coincida con la de entrenamiento; de lo contrario puede fallar la deserializacion.
- Sesgos: al ser datos sinteticos no hay sesgos demograficos, pero tampoco representatividad del mercado inmobiliario real.
- Riesgo de alucinacion: no aplica (no es un modelo generativo).
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el uso comercial del modelo en si carece de sentido por su naturaleza didactica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lukit4as/lucas-sklearn-regresion
- Documentacion de scikit-learn `LinearRegression`: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentacion de `joblib`: https://joblib.readthedocs.io/
- Documentacion de `huggingface_hub`: https://huggingface.co/docs/huggingface_hub
