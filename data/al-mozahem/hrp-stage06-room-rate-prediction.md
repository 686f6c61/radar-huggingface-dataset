# AL-mozahem/HRP-Stage06-Room-Rate-Prediction

## Resumen

HRP Stage 06 es un modelo de regresion tabular publicado por el usuario AL-mozahem en Hugging Face, orientado a la prediccion del precio por noche de una habitacion de hotel en una fecha concreta. No es un modelo de lenguaje ni una red neuronal: se trata de un pipeline de scikit-learn con regresion polinomica de grado 2, serializado con joblib y entrenado sobre un conjunto de datos sintetico de tarifas hoteleras. El modelo consume 37 caracteristicas tabulares y devuelve un precio sugerido por noche en USD.

Su relevancia es limitada y muy acotada: se publica como artefacto reproducible de una etapa concreta (Stage 06) de un proyecto mayor de apoyo a la decision en pricing hotelero, con el objetivo de conservar los pesos originales sin reentrenamiento. La model card es explicita al senalar que los datos son sinteticos y que el modelo es de demostracion, no validado en produccion. No dispone de descargas ni interacciones en el momento de la consulta.

La ficha se elabora unicamente a partir de la informacion publicada en el repositorio; cualquier dato no presente en ella se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion polinomica de grado 2 sobre pipeline completo de scikit-learn (`polynomial_regression_degree_2`) |
| Parametros totales | No aplica (modelo estadistico, no neuronal); coeficientes no disponibles en la informacion |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (entrada tabular de 37 caracteristicas) |
| Tipos de cuantizacion | No disponible (no aplica; serializacion joblib) |
| Idiomas soportados | Arabe (ar) e ingles (en), segun metadatos; el modelo no procesa texto, la indicacion es documental |
| Licencia | No disponible |
| Formato de pesos | joblib (`models/final_model.joblib`) |
| Libreria | scikit-learn 1.8.0 |
| Tarea (pipeline) | `tabular-regression` |
| Numero de caracteristicas de entrada | 37 columnas |
| Salida | `suggested_price_per_night` en USD (modelo sintetico) |
| Tamano del repositorio | 0.0 GB (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn que aplica una regresion polinomica de grado 2 sobre las 37 caracteristicas de entrada. No se especifica en la informacion disponible que transformaciones previas (escalado, codificacion de categoricas, imputacion) componen el pipeline, mas alla de que se trata de un "full-feature Pipeline" ajustado con todas las columnas. Al ser un modelo polinomico de grado 2, genera terminos cuadraticos e interacciones entre pares de caracteristicas, lo que incrementa notablemente el numero de terminos respecto a una regresion lineal simple.

El entrenamiento se realizo sobre el dataset sintetico `AL-mozahem/HRP-Stage06-Synthetic-Room-Rates`, con una particion cronologica de 12.600 ejemplos de entrenamiento, 2.700 de validacion y 2.700 de test. La version publica del dataset elimina identificadores de seguimiento no predictivos y conserva las 37 caracteristicas, la fecha y la variable objetivo. No se documenta en la informacion proporcionada el uso de tecnicas de regularizacion, validacion cruzada, ajuste de hiperparametros ni ningun proceso de optimizacion adicional; tampoco se indica el numero de tokens (no aplica) ni si hubo seleccion de caracteristicas.

## Capacidades

- Prediccion de tarifa por noche (`suggested_price_per_night`) para una fecha concreta a partir de 37 caracteristicas tabulares.
- Regresion sobre datos estructurados con relaciones no lineales de segundo grado entre variables.
- Inferencia reproducible mediante el script `src/predict.py` y el modelo serializado en joblib.
- Ejecucion en entornos Python compatibles con scikit-learn 1.8.0, sin necesidad de GPU.
- Soporte documental en arabe e ingles (la model card esta redactada en ambos idiomas).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico: es un modelo puramente tabular.
- No dispone de widget de inferencia directo en la pagina del modelo; la demostracion interactiva se plantea mediante un notebook de Colab con Gradio.

## Casos de uso

- Apoyo a la decision en pricing hotelero: dado un conjunto de 37 caracteristicas de una estancia (fecha, caracteristicas del hotel y de la habitacion, etc.), el modelo devuelve un precio sugerido por noche que un revenue manager puede usar como referencia, nunca como modificacion automatica de tarifas.
- Prototipado de sistemas de tarificacion dinamica: sirve como linea base reproducible para comparar frente a modelos mas complejos (gradient boosting, redes neuronales tabulares) antes de invertir en datos reales.
- Docencia y experimentacion con pipelines de scikit-learn: el repositorio incluye codigo de inferencia original y un dataset sintetico, lo que facilita reproducir el flujo completo de entrenamiento y evaluacion.
- Generacion de escenarios sinteticos de precios: al estar entrenado sobre datos sinteticos, puede emplearse para simular tarifas en entornos de prueba sin exponer datos reales de clientes.
- Validacion de pipelines de datos: las 37 caracteristicas documentadas permiten comprobar la integridad y el esquema de los datos de entrada en un sistema de pricing antes de conectar un modelo productivo.
- Demostraciones interactivas: mediante el notebook de Colab con Gradio, se puede ilustrar el comportamiento del modelo ante distintas combinaciones de entrada en presentaciones o pruebas de concepto.
- Analisis de sensibilidad de precios: al ser un modelo polinomico de grado 2, permite explorar como varian las predicciones ante cambios en pares de caracteristicas concretas, util para entender interacciones en los datos sinteticos.

## Benchmarks y rendimiento

Metricas registradas por el autor sobre el conjunto de test sintetico original (no validadas de forma independiente en precios hoteleros reales):

| Metrica | Valor |
|---|---|
| MAE | 8,6243 USD |
| RMSE | 10,7890 USD |
| MAPE | 5,37 % |
| R² | 0,8785 |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica (modelo tabular de scikit-learn).
- Memoria RAM: no disponible en la informacion; un pipeline polinomico de grado 2 sobre 37 caracteristicas es de tamano reducido, pero no se publica una cifra concreta.
- Opciones de despliegue: Python con scikit-learn 1.8.0 y joblib; script `src/predict.py`; notebook de Colab con Gradio para demostracion. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (regresion tabular para pricing hotelero) ni resultados frente a alternativas como gradient boosting o regresion lineal regularizada.

## Limitaciones y advertencias

- Datos sinteticos: el modelo se entrena exclusivamente sobre un dataset sintetico de tarifas hoteleras y no ha sido validado en precios reales, por lo que sus metricas no son extrapolables a produccion.
- Uso exclusivamente como apoyo a la decision: no modifica automaticamente las tarifas del hotel; el autor lo indica de forma explicita.
- Moneda: la salida en USD corresponde al modelo sintetico de entrenamiento, no necesariamente a la moneda del proyecto operativo HRP.
- Riesgo de extrapolacion: al ser una regresion polinomica de grado 2, puede producir predicciones inestables fuera del rango de valores visto en entrenamiento.
- Fuga temporal: el autor advierte de no usar datos futuros como entrada en una instantanea de precios pasada; hacerlo invalidaria la prediccion.
- Licencia no disponible: no se especifican condiciones de uso comercial, por lo que no se puede asumir permiso para explotacion comercial.
- Idiomas: los metadatos declaran arabe e ingles, pero el modelo no procesa lenguaje natural; la indicacion es meramente documental.
- Seguridad: solo deben cargarse ficheros joblib de fuentes de confianza, ya que la deserializacion puede ejecutar codigo arbitrario.
- Sin validacion independiente: las metricas publicadas proceden del experimento original del autor y no han sido replicadas por terceros.
- Sin descargas ni interacciones registradas en el momento de la consulta, lo que limita la evidencia externa sobre su funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AL-mozahem/HRP-Stage06-Room-Rate-Prediction
- Dataset de entrenamiento: https://huggingface.co/datasets/AL-mozahem/HRP-Stage06-Synthetic-Room-Rates
- Repositorio del modelo (ficheros `models/final_model.joblib`, `src/predict.py`, `example_inference.py`, `requirements_inference.txt`, `models/model_metadata.json`): accesibles desde la pagina del modelo en Hugging Face
- Notebook de Colab con demostracion Gradio: referenciado en la model card, sin URL directa en la informacion disponible
