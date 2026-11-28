# arunj29/food-delivery-time-prediction-model

## Resumen

`arunj29/food-delivery-time-prediction-model` no es un modelo de lenguaje ni una red neuronal profunda: es un modelo de regresion clasico serializado con `joblib`, publicado por el usuario arunj29, que estima tiempos de entrega de comida a domicilio a partir de variables como distancia, nivel de trafico, condiciones meteorologicas y tiempo de preparacion en cocina. El artefacto forma parte de una aplicacion Streamlit mas amplia (Food Delivery Time Prediction System) que incluye analisis exploratorio, simulacion de economia de flota y calculo de huella de carbono.

Segun la model card, el modelo campeon entre seis candidatos evaluados (Lasso, Ridge, regresion lineal, Random Forest, Gradient Boosting y Extra Trees) es una regresion Lasso con un coeficiente de determinacion R² de 0,8450, un error absoluto medio de 5,53 minutos y un RMSE de 8,02 minutos sobre el conjunto de datos `Food_Delivery_Times.csv`. Se trata, por tanto, de un modelo tabular de regresion supervisada, no de un transformer, y su relevancia es acotada: sirve como pieza de demostracion o componente de un sistema de estimacion de tiempos, no como base para tareas generativas.

El repositorio tiene un tamano declarado de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y la model card no documenta el numero de parametros, el volumen de entrenamiento ni la composicion exacta del dataset mas alla del nombre del fichero CSV. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion Lasso (modelo lineal regularizado L1) sobre caracteristicas tabulares |
| Parametros totales | no disponible (modelo lineal; coeficientes no documentados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica; serializacion en `joblib` |
| Idiomas soportados | no disponible (no procesa texto libre) |
| Licencia | MIT |
| Formato de pesos | `joblib` (serializacion Python de Scikit-Learn) |

## Arquitectura y entrenamiento

El modelo es una regresion Lasso, es decir, una regresion lineal con penalizacion L1 sobre los coeficientes, implementada presumiblemente con `scikit-learn`. Las variables de entrada documentadas son distancia, nivel de trafico (tres niveles), condicion meteorologica (cinco condiciones) y tiempo de preparacion en cocina. La model card menciona un conjunto de datos denominado `Food_Delivery_Times.csv` y un split de test de 150 ordenes para verificacion holdout, pero no especifica el numero total de muestras, el porcentaje de split train/test, el proceso de seleccion de hiperparametros ni si hubo validacion cruzada.

No se documenta ningun tipo de entrenamiento por refuerzo, ajuste fino supervisado tipo RLHF/DPO ni innovacion arquitectonica alguna, lo cual es coherente con la naturaleza del modelo. La comparacion entre seis algoritmos de regresion y la eleccion de Lasso como campeon sugiere que la regularizacion L1 aporto una mejora marginal o comparable frente a alternativas mas complejas como Random Forest o Gradient Boosting, algo plausible en un problema con pocas caracteristicas y relaciones aproximadamente lineales.

## Capacidades

- Prediccion puntual del tiempo de entrega en minutos a partir de cuatro variables de entrada.
- Estimacion de intervalos de confianza con un error absoluto medio declarado de ±5,5 minutos.
- Desglose del tiempo total en preparacion en cocina y transito en carretera.
- Analisis de sensibilidad what-if sobre tres niveles de trafico y cinco condiciones meteorologicas.
- Calculo derivado de tarifa al cliente, pago al repartidor, margen neto de plataforma y huella de CO2.
- Prediccion por lotes mediante carga de ficheros CSV.
- Inferencia por linea de comandos mediante `predict.py`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Estimacion de tiempo de entrega en el checkout de una aplicacion de reparto: el modelo recibe distancia, trafico, meteorologia y tiempo de preparacion, y devuelve una estimacion en minutos con un margen de error de aproximadamente 5,5 minutos, suficiente para comunicar una horquilla al cliente.
- Planificacion de capacidad en cocina: al desglosar el tiempo total en preparacion y transito, un operador puede identificar si el cuello de botella esta en cocina o en carretera y ajustar turnos en consecuencia.
- Simulacion de escenarios operativos: la matriz what-if permite evaluar como varia el tiempo de entrega al pasar de trafico bajo a alto o de clima despejado a lluvia, util para definir politicas de recargo por condiciones adversas.
- Analisis de economia unitaria por banda de distancia: la aplicacion calcula margen neto de plataforma y pago al repartidor en bandas de 0-5 km hasta 20+ km, lo que sirve para revisar la estructura de tarifas.
- Reporting ESG de flota: el simulador de transicion a flota verde estima reducciones de CO2 y equivalentes en arboles al cambiar la composicion de vehiculos (bicicleta, scooter, coche), aprovechable en memorias de sostenibilidad.
- Prediccion por lotes para auditoria historica: cargando un CSV de ordenes pasadas se obtienen predicciones masivas que permiten comparar tiempos estimados frente a reales y detectar desviaciones sistematicas por zona o franja horaria.
- Prototipado docente o demostracion de MLOps ligero: el par modelo `joblib` mas app Streamlit sirve como ejemplo minimo de pipeline de regresion tabular desplegado, sin dependencias de GPU.

## Benchmarks y rendimiento

Datos declarados en la model card para el modelo campeon (Lasso Regression) sobre el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| R² | 0,8450 |
| MAE | 5,53 minutos |
| RMSE | 8,02 minutos |

La model card indica que se compararon seis modelos (Lasso, Ridge, regresion lineal, Random Forest, Gradient Boosting y Extra Trees), pero solo se publican las metricas del campeon. No se han publicado resultados desglosados de los demas modelos ni benchmarks frente a referencias externas en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo es una regresion lineal serializada y se ejecuta en CPU.
- GPU recomendadas: ninguna; no se requiere aceleracion por hardware.
- Cabe en cualquier maquina consumer, incluidos equipos sin GPU dedicada y entornos de contenedor de recursos minimos.
- Opciones de despliegue: aplicacion Streamlit (`streamlit run app.py`), script CLI (`predict.py`) o integracion directa en Python cargando el artefacto `joblib` con `scikit-learn`.
- Latencia y throughput: no documentados; en la practica, una regresion Lasso con cuatro caracteristicas de entrada responde en microsegundos por peticion en CPU, aunque el autor no publica cifras.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables publicados por el mismo autor ni sobre alternativas equivalentes en la informacion proporcionada. Como referencia cualitativa, dentro del propio repositorio se compararon seis algoritmos de regresion tabular, resultando seleccionado Lasso; sin embargo, no se publican las metricas de los otros cinco, por lo que no es posible construir una tabla comparativa con datos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Food Delivery Time Predictor (Lasso) | no disponible | no aplica | R² 0,8450; MAE 5,53 min; RMSE 8,02 min | MIT | Hugging Face |
| Ridge, regresion lineal, Random Forest, Gradient Boosting, Extra Trees | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo predice exclusivamente tiempos de entrega a partir de cuatro variables tabulares; no es un modelo de lenguaje y no puede usarse para tareas generativas, razonamiento o codigo.
- El MAE de 5,53 minutos implica que predicciones individuales pueden desviarse varios minutos en cada sentido; no es adecuado para compromisos contractuales de tiempo exacto sin margen.
- No se documenta el volumen ni la procedencia del dataset `Food_Delivery_Times.csv`, por lo que se desconoce la representatividad geografica y temporal de los datos de entrenamiento.
- El modelo asume relaciones aproximadamente lineales entre las variables y el tiempo de entrega; fenomenos no lineales (picos de demanda, incidentes puntuales, restricciones de aparcamiento) no estan modelados.
- Riesgo de degradacion silenciosa ante cambios de distribucion: nuevas condiciones de trafico, tarifas o composicion de flota no cubiertas en entrenamiento pueden invalidar las predicciones sin aviso.
- No hay informacion sobre sesgos por zona, tipo de restaurante o franja horaria; los margenes economicos y de CO2 que calcula la aplicacion dependen de supuestos de precio y emisiones no documentados en la model card.
- La licencia MIT permite uso comercial y modificacion, pero no se ofrece ninguna garantia de exactitud ni soporte por parte del autor.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento o validacion por parte de la comunidad.
- El artefacto esta serializado en `joblib`, lo que introduce dependencia de versiones concretas de `scikit-learn`; conviene fijar versiones en produccion para evitar incompatibilidades al deserializar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arunj29/food-delivery-time-prediction-model
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
