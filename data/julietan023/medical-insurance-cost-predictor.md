# julietan023/medical-insurance-cost-predictor

## Resumen

`medical-insurance-cost-predictor` es un modelo de regresion supervisada publicado por el usuario julietan023 en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un artefacto de scikit-learn serializado con joblib que estima el coste medico anual (`charges`, en USD) de un paciente a partir de variables demograficas, de estilo de vida e indice de masa corporal. El objetivo declarado por el autor es completar una tarea academica de modelado analitico sobre datos de seguros medicos.

El modelo se entrena sobre el dataset publico Medical Cost Personal Datasets (1337 filas, 7 variables de entrada), un conjunto ampliamente utilizado en docencia de regresion. Tras aplicar one-hot encoding y escalado, la entrada efectiva son 11 columnas. En el 20% de prueba (268 filas) reporta un MAE de 2.643,36 USD, un RMSE de 4.409,44 USD y un R² del 89,42%.

Su relevancia es limitada fuera del ambito didactico: el repositorio pesa 0,0 GB, no tiene descargas ni likes, no especifica la version de scikit-learn ni los hiperparametros del estimador, y la propia model card advierte de sesgos sistematicos en los casos extremos. Debe tratarse como un ejemplo de pipeline de regresion, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion de scikit-learn serializada con joblib (algoritmo concreto no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica; artefacto joblib de precision nativa |
| Idiomas soportados | no disponible (las etiquetas del dataset estan en ingles; la model card esta en indonesio) |
| Licencia | MIT |
| Formato de pesos | joblib (`model_saya.joblib`, `scaler.joblib`, `feature_names.joblib`) |

## Arquitectura y entrenamiento

La informacion disponible no especifica el algoritmo exacto (regresion lineal, ridge, random forest, gradient boosting u otro). Lo unico documentado es el pipeline: codificacion one-hot de las variables categoricas (`sex`, `smoker`, `region`, `BMI_Category`), escalado de las numericas (`age`, `bmi`) y concatenacion hasta 11 columnas de entrada. El preprocesamiento se persiste por separado en `scaler.joblib` y `feature_names.joblib`, lo que implica que el consumidor debe aplicar exactamente la misma transformacion antes de invocar el estimador.

El entrenamiento se realizo sobre el dataset Medical Cost Personal Datasets (1337 filas, 7 variables de entrada y la columna objetivo `charges`), con una particion train/test 80/20. No se documentan numero de epocas, hiperparametros, semilla, validacion cruzada ni busqueda de hiperparametros. Tampoco se indica si hubo seleccion de caracteristicas o regularizacion. No hay innovaciones tecnicas destacables: es un flujo clasico de regresion tabular.

## Capacidades

- Prediccion de una unica variable continua: el coste medico anual en USD (`charges`).
- Entrada tabular con seis variables originales: `age`, `bmi`, `sex`, `smoker`, `region` y `BMI_Category`.
- Inferencia por lotes mediante `predict()` de scikit-learn sobre un array o DataFrame con las 11 columnas transformadas.
- Persistencia del preprocesamiento (escalador y nombres de caracteristicas) junto al estimador, lo que permite reproducir la transformacion en inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multimodales (ni vision ni audio).
- No tiene capacidades multilingues en sentido estricto: opera sobre valores categoricos codificados, no sobre lenguaje natural.

## Casos de uso

- Docencia de pipelines de regresion: sirve como ejemplo completo de codificacion one-hot, escalado y evaluacion con MAE/RMSE/R² en un curso de analitica de datos, dado que el dataset es publico y el flujo esta documentado.
- Prototipado de calculadoras de prima orientativa: en una demo interna se podria usar para ilustrar como una estimacion basada en edad, BMI y tabaquismo se aproxima al gasto medio, siempre con etiqueta de "estimacion no vinculante".
- Analisis de sensibilidad al tabaquismo: el modelo permite cuantificar de forma rapida como varia la prediccion al alternar `smoker` manteniendo el resto de variables fijas, util en material divulgativo sobre factores de riesgo.
- Pruebas de integracion de artefactos joblib: valido para verificar que un servicio de inferencia carga correctamente `model_saya.joblib`, `scaler.joblib` y `feature_names.joblib` desde el Hub y aplica el orden de columnas esperado.
- Baseline de comparacion en experimentos academicos: al reportar R² = 89,42% sobre un split fijo, puede servir como referencia minima frente a modelos mas complejos (gradient boosting, redes tabulares) en el mismo dataset.
- Generacion de datos sinteticos de ejemplo: combinado con el dataset original, permite construir escenarios ficticios de pacientes para tutoriales de visualizacion o de analisis de sesgo, sin usar datos reales.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el 20% de prueba (268 filas) del dataset Medical Cost Personal:

| Metrica | Valor |
|---|---|
| MAE | 2.643,36 USD |
| RMSE | 4.409,44 USD |
| R² | 89,42% |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. No se especifica el algoritmo, por lo que estos valores no son reproducibles sin conocer los hiperparametros y la semilla de particion.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU.
- RAM: unos pocos megabytes para cargar los tres artefactos joblib (el repositorio completo ocupa 0,0 GB).
- GPU: no necesaria. Cualquier CPU moderna es suficiente; incluso un entorno de 1 vCPU sirve para inferencia por lotes de miles de filas.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y entornos serverless con limites de memoria minimos.
- Despliegue: carga directa con `joblib.load` en Python; tambien es integrable en FastAPI, Flask, BentoML o como paso dentro de un pipeline de scikit-learn. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un estimador tabular de scikit-learn, la latencia esperada por fila es del orden de microsegundos a milisegundos, pero no hay medicion publicada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables publicados con el mismo dataset y la misma particion. La comparacion con modelos de lenguaje no tiene sentido por categoria distinta.

| Modelo | Parametros | Contexto | R² reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medical-insurance-cost-predictor | no disponible | no aplica | 89,42% | MIT | Hugging Face |
| Alternativas de regresion tabular sobre el mismo dataset | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Subestimacion sistematica en casos extremos: el autor reconoce que el modelo predice por debajo del valor real en fumadores con BMI extremo y facturas superiores a 40.000 USD.
- Ausencia de variables clinicas: no usa historial de enfermedades preexistentes ni registros medicos detallados, lo que limita severamente su validez fuera del dataset de origen.
- Trazabilidad incompleta: no se indica el algoritmo, los hiperparametros, la semilla ni la version de scikit-learn, lo que impide reproducir el 89,42% de R² y puede provocar errores al cargar el joblib con versiones distintas de la libreria.
- Desajuste en la documentacion: el snippet de la model card referencia `repo_id = "username/medical-insurance-cost-space"` y un fichero `model_saya.joblibview`, distintos del ID real del repositorio y del nombre de fichero declarado; habra que ajustar ambas rutas.
- Riesgo de uso indebido: predecir primas o costes medicos reales con este artefacto puede producir decisiones discriminatorias por sexo, region o condicion fisica; no es apto para produccion aseguradora ni para decision clinica.
- Sesgo de muestra: 1337 filas de un dataset estadounidense historico, sin documentacion sobre su procedencia ni periodo de recogida; la distribucion puede no representar poblaciones actuales ni fuera de EE. UU.
- Licencia MIT: permite uso comercial y modificacion, pero no exime de las obligaciones regulatorias aplicables a decisiones automatizadas sobre personas.
- Sin mantenimiento aparente: 0 descargas, 0 likes y actualizacion inmediatamente posterior a la creacion; no hay garantia de soporte ni de correccion de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julietan023/medical-insurance-cost-predictor
- Dataset de origen (Medical Cost Personal Datasets): no disponible como enlace en la informacion proporcionada; la model card solo cita el fichero local `/content/archive (1).zip` (`insurance.csv`)
- Paper, blog o repositorio adicional: no disponible
