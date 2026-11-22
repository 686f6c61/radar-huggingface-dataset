# nan0techn0/house-price-regressor

## Resumen

`nan0techn0/house-price-regressor` no es un modelo de lenguaje ni una red neuronal profunda: es un proyecto de aprendizaje supervisado clasico publicado en Hugging Face que implementa un regresor de precios de vivienda mediante arboles de decision y random forest con Scikit-learn. El autor, `nan0techn0`, lo desarrollo como solucion practica a la competicion Housing Prices de Kaggle Learn, comparando un arbol de decision base, un arbol de decision ajustado y un random forest para predecir la variable `SalePrice` a partir de siete caracteristicas numericas de la propiedad.

El modelo resuelve un problema de regresion tabular acotado: estimar el precio de venta en dolares estadounidenses de una vivienda usando unicamente `LotArea`, `YearBuilt`, `1stFlrSF`, `2ndFlrSF`, `FullBath`, `BedroomAbvGr` y `TotRmsAbvGrd`. No emplea arquitecturas transformer, mecanismos de atencion ni pesos en formato safetensors o GGUF; los "pesos" son los arboles serializados por Scikit-learn dentro del notebook `model.ipynb`.

Su relevancia es limitada y fundamentalmente pedagogica: sirve como referencia de pipeline minimo de regresion con validacion train/test, ajuste de hiperparametros y generacion de un fichero `submission.csv`. No debe confundirse con un modelo fundacional ni usarse como sustituto de un sistema de valoracion inmobiliaria en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de arboles de decision (RandomForestRegressor de Scikit-learn) |
| Parametros totales | no disponible (no es una red neuronal; el numero de nodos depende del ajuste) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 7 caracteristicas) |
| Tipos de cuantizacion | no disponible (no aplica a modelos de arboles de Scikit-learn) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto generado por Scikit-learn dentro del notebook; no se publican ficheros de pesos) |

## Arquitectura y entrenamiento

La arquitectura es un `RandomForestRegressor` de Scikit-learn con hiperparametros por defecto salvo `random_state=1`. Se compara con dos variantes de `DecisionTreeRegressor`: una linea base con parametros por defecto y otra ajustada mediante busqueda de `max_leaf_nodes` sobre el conjunto `[5, 25, 50, 100, 250, 500]`, resultando seleccionado el valor 100. El random forest se entrena sobre el mismo split que los arboles para permitir una comparacion directa.

Los datos provienen de los ficheros `data/train.csv` y `data/test.csv` de la competicion de Kaggle. El split de validacion usa `train_test_split` con `random_state=1` y la proporcion por defecto de Scikit-learn (75 % entrenamiento / 25 % validacion). No hay datos de RLHF, DPO ni preentrenamiento a gran escala: el entrenamiento es un ajuste supervisado clasico sobre siete variables numericas. No se documenta el numero exacto de filas del dataset ni la presencia de valores faltantes o variables categoricas, que el autor reconoce como limitacion.

## Capacidades

- Regresion tabular: predice `SalePrice` en USD a partir de siete caracteristicas numericas de la vivienda.
- Generacion de predicciones por lotes sobre `data/test.csv` y exportacion a `submission.csv` con formato `Id,SalePrice`.
- Comparacion interna de tres modelos (arbol base, arbol ajustado y random forest) mediante MAE en validacion.
- Ajuste de hiperparametros limitado a `max_leaf_nodes` en el arbol de decision.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.
- No dispone de modo "thinking" ni de generacion de texto libre.

## Casos de uso

- Ejercicio docente de regresion supervisada: el notebook `model.ipynb` sirve para ilustrar el flujo completo de carga de CSV con Pandas, split train/test, entrenamiento de arboles y evaluacion con MAE en un curso introductorio de machine learning.
- Prototipo de valoracion rapida de vivienda: con las siete variables disponibles, permite obtener una estimacion grosera del precio para explorar la relacion entre superficie, ano de construccion y numero de habitaciones, siempre como cota orientativa y no como tasacion.
- Referencia de linea base en competiciones tipo Kaggle: el MAE de validacion de 21.857 USD del random forest puede usarse como umbral minimo que un modelo mas complejo (gradient boosting, XGBoost, LightGBM) debe batir.
- Comparacion de algoritmos de arboles: permite medir de forma reproducible la mejora de un ensemble frente a un arbol individual bajo el mismo split (`random_state=1`).
- Generacion automatizada de un `submission.csv`: util para participantes de la competicion Housing Prices for Kaggle Learn Users que quieran partir de un pipeline funcional y sustituir despues el modelo.
- Analisis exploratorio inicial de variables: aunque el proyecto no incluye analisis de importancia de caracteristicas, el random forest puede extenderse para inspeccionar que variables aportan mas a la prediccion.

## Benchmarks y rendimiento

| Modelo | MAE de validacion (USD) | Notas |
|---|---:|---|
| Arbol de decision (por defecto) | 29.653 | Linea base |
| Arbol de decision (ajustado) | 27.283 | `max_leaf_nodes=100` |
| Random forest | 21.857 | Menor MAE de los modelos evaluados |

El random forest reduce el MAE aproximadamente un 26,3 % respecto al arbol base en este split concreto. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks de modelos de lenguaje, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- Inferencia en CPU: suficiente para entrenar y predecir con este modelo; no requiere GPU.
- Memoria RAM: no disponible con precision, pero el dataset de Kaggle Housing Prices ocupa unos pocos MB en CSV, por lo que cualquier equipo con 4 GB de RAM es suficiente.
- GPU recomendadas: ninguna; el modelo no aprovecha aceleracion por GPU en su configuracion actual.
- Cabe en cualquier GPU consumer y en practicamente cualquier equipo de sobremesa o portatil.
- Opciones de despliegue: ejecucion local via Jupyter Notebook con Python, Pandas y Scikit-learn; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; para el tamano tipico del dataset de Kaggle, el entrenamiento del random forest se completa en segundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MAE / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nan0techn0/house-price-regressor | Random forest (Scikit-learn) | no disponible | no aplica | 21.857 USD MAE validacion | MIT | Hugging Face |
| Arbol de decision ajustado del mismo proyecto | Arbol de decision | no disponible | no aplica | 27.283 USD MAE validacion | MIT | Incluido en el mismo repo |
| Arbol de decision base del mismo proyecto | Arbol de decision | no disponible | no aplica | 29.653 USD MAE validacion | MIT | Incluido en el mismo repo |
| Alternativas externas (XGBoost, LightGBM, CatBoost) | Gradient boosting | no disponible | no aplica | no disponible en esta ficha | licencias propias | Fuera del alcance de la informacion proporcionada |

No se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada, por lo que la comparativa se limita a los tres modelos del propio proyecto.

## Limitaciones y advertencias

- Solo utiliza siete caracteristicas numericas; excluye variables relevantes como calidad de materiales, ubicacion, garaje, sotano o estado de conservacion.
- El split de validacion es unico (`random_state=1`); el MAE puede variar con otra particion y no se ha aplicado validacion cruzada.
- El ajuste de `max_leaf_nodes` se realiza sobre el mismo conjunto de validacion con el que se reporta el MAE, lo que introduce sesgo optimista en la metrica del arbol ajustado.
- El random forest usa hiperparametros por defecto salvo `random_state`; no se ha realizado busqueda sistematica de hiperparametros.
- No se documenta pipeline de imputacion de valores faltantes ni codificacion de variables categoricas, lo que limita la extension del conjunto de caracteristicas.
- Los valores de MAE proceden de un unico split y no deben interpretarse como garantia de rendimiento en datos no vistos.
- El fichero `submission.csv` contiene predicciones, no precios verificados; el error real sobre `data/test.csv` no puede calcularse localmente.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si existe riesgo de extrapolacion erronea fuera del rango de precios del dataset de entrenamiento.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgos derivados de la distribucion del dataset de Ames (Iowa) y de la seleccion de caracteristicas.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el modelo no esta pensado para produccion y no debe usarse como tasacion oficial.
- No dispone de soporte multilingue, tool calling ni agentes, por lo que no es adecuado para tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/nan0techn0/house-price-regressor
- Competicion de referencia: Housing Prices Competition for Kaggle Learn Users (https://www.kaggle.com/c/home-data-for-ml-course)
- Documentacion de Scikit-learn sobre `RandomForestRegressor`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestRegressor.html
- Documentacion de Scikit-learn sobre `DecisionTreeRegressor`: https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeRegressor.html
- Documentacion de Pandas: https://pandas.pydata.org/docs/
