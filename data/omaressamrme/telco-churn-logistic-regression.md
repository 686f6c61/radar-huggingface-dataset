# omaressamrme/telco-churn-logistic-regression

## Resumen

`telco-churn-logistic-regression` es un modelo de clasificacion tabular publicado por el autor independiente omaressamrme en Hugging Face. No es un modelo de lenguaje ni una red neuronal: es un `Pipeline` de scikit-learn que encapsula el preprocesamiento y un clasificador de regresion logistica con penalizacion L2, entrenado para predecir la baja de clientes (churn) sobre el conjunto de datos IBM Telco Customer Churn. El repositorio contiene los pesos serializados en formato `joblib`, junto con un `config.json` que describe las columnas de entrada esperadas y un `coefficients.csv` con los coeficientes y las razones de probabilidad (odds ratios) del modelo.

El modelo resuelve un problema concreto de clasificacion binaria con clases desbalanceadas (26,5 % de churn sobre 7.043 clientes) y se distribuye como la implementacion de referencia del proyecto `engomaressam/telco-churn-classification`, en el que se compararon seis familias de modelos sobre los mismos pliegues de validacion. Segun la model card, la regresion logistica empata en AUC con gradient boosting y random forest (0,843 frente a 0,846, con intervalos de confianza solapados) y fue seleccionada por la legibilidad de sus odds ratios y la estabilidad de su ranking.

Su relevancia es metodologica mas que de capacidad: demuestra que en datos tabulares de baja dimensionalidad un modelo lineal bien ajustado compite con alternativas de mayor complejidad, y lo empaqueta de forma reproducible (script `train.py`, semilla fija 123, scikit-learn 1.9). No dispone de arquitectura transformer, parametros en el sentido habitual ni ventana de contexto; las filas de especificaciones que no aplican se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica con penalizacion L2 (`C=0.1`) dentro de un `Pipeline` de scikit-learn (preprocesamiento + clasificador) |
| Parametros totales | No disponible (modelo lineal; numero de coeficientes dependiente de la codificacion one-hot de las columnas de entrada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada tabular de una fila por cliente, no secuencial) |
| Tipos de cuantizacion | No aplica; pesos en coma flotante serializados con `joblib` |
| Idiomas soportados | Ingles (etiquetas y valores categoricos del dataset IBM Telco) |
| Licencia | MIT |
| Formato de pesos | `joblib` (`model.joblib`), mas `config.json` y `coefficients.csv` |
| Libreria | scikit-learn 1.9 |
| Tarea (pipeline) | `tabular-classification` |
| Dataset de entrenamiento | IBM Telco Customer Churn (7.043 clientes, 26,5 % churn) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal binario: regresion logistica con regularizacion L2 y `C=0.1`, envuelto en un `Pipeline` que aplica todo el preprocesamiento antes de la clasificacion. El pipeline sustituye los valores en blanco de `TotalCharges` (11 clientes nuevos) por 0, descarta `MonthlyCharges` y `TotalCharges` por colinealidad con los indicadores de servicio y la antiguedad, estandariza `tenure` y `SeniorCitizen` y aplica codificacion one-hot al resto de columnas categoricas. La particion es estratificada 80/20 con semilla 123, y el script `train.py` incluido en el repositorio reproduce el ajuste de principio a fin.

No hay entrenamiento neuronal, RLHF ni DPO. La innovacion tecnica, en el contexto del proyecto original, es la comparacion controlada de seis familias de modelos sobre los mismos pliegues: la regresion logistica se eligio por su interpretabilidad (coeficientes y odds ratios exportados a `coefficients.csv`) y por la estabilidad de su ranking de probabilidades. Los factores predictivos mas fuertes declarados son los contratos de dos anos (odds ratio 0,33 frente a mes a mes), la fibra optica (2,4x) y la antiguedad (0,45 por desviacion estandar).

## Capacidades

- Clasificacion binaria tabular: estima la probabilidad de churn de un cliente a partir de una fila con las columnas del dataset IBM Telco.
- Preprocesamiento integrado: acepta filas en bruto del dataset (con el tratamiento documentado de `TotalCharges`) sin pasos manuales adicionales.
- Salida de probabilidad calibrada por ranking: `predict_proba` permite ordenar clientes por riesgo; el 20 % con mayor probabilidad concentra aproximadamente la mitad de los churners segun el grafico de ganancias del repositorio.
- Interpretabilidad directa: coeficientes y odds ratios exportados por variable, legibles por equipos de negocio.
- Reproducibilidad: `train.py`, semilla fija y version de scikit-learn declarada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto. No es un modelo de lenguaje.

## Casos de uso

- Priorizacion de campanas de retencion: ordenar la cartera por `churn_probability` y dirigir el presupuesto de retencion al decil o quintil superior; el modelo es adecuado porque su ranking es estable y el grafico de ganancias documenta la concentracion de churners en la cola alta.
- Analisis de drivers de baja para negocio: usar `coefficients.csv` para cuantificar el efecto de contratos de dos anos, fibra optica o antiguedad y orientar acciones de producto; la regresion logistica ofrece odds ratios directamente interpretables.
- Prototipo y linea base en proyectos de churn: servir como referencia contra la que medir modelos mas complejos (gradient boosting, redes tabulares) sobre el mismo split estratificado.
- Docencia y formacion en machine learning aplicado: el repositorio incluye el notebook de Kaggle y el articulo comparativo de seis modelos, lo que lo convierte en un ejemplo completo de preprocesamiento, validacion y evaluacion con clases desbalanceadas.
- Segmentacion exploratoria de clientes de riesgo: combinar la probabilidad con variables de servicio para identificar subpoblaciones (por ejemplo, fibra optica con contrato mensual) donde concentrar acciones comerciales.
- Integracion en un servicio batch de scoring: cargar el `joblib` con `hf_hub_download` y ejecutar `predict_proba` sobre extractos periodicos de clientes; el modelo es ligero y no requiere GPU.
- Evaluacion de coste de retencion: ajustar el umbral operativo (el de maximo F1 es 0,30) segun el coste del contacto frente al valor retenido, ya que la model card advierte de que el umbral no incorpora ese coste.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el conjunto de test reservado de 1.409 clientes (20 % estratificado) del dataset IBM Telco Customer Churn:

| Metrica | Valor |
|---|---|
| ROC AUC | 0,843 (validacion cruzada de 5 pliegues sobre entrenamiento: 0,844) |
| PR AUC | 0,650 |
| Umbral de maximo F1 | 0,30 |
| Precision en ese umbral | 0,555 |
| Recall en ese umbral | 0,759 |
| F1 en ese umbral | 0,641 |

Comparacion declarada por el autor con otras familias sobre los mismos pliegues: AUC 0,843 para regresion logistica frente a 0,846 para gradient boosting y random forest, con intervalos de confianza solapados. No se han publicado en la informacion disponible resultados de benchmarks adicionales ni comparaciones con modelos externos al proyecto.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente para el volumen del dataset (7.043 filas).
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el modelo es un conjunto de coeficientes lineales.
- Despliegue: carga directa con `joblib.load` y scikit-learn 1.9; no aplican vLLM, llama.cpp, Ollama ni TGI. Para servicio en produccion puede exponerse mediante un endpoint de Python (FastAPI, Flask) o integrarse en un job batch.
- Latencia y throughput: no disponibles de forma explicita; al tratarse de un modelo lineal, el coste por fila es despreciable frente a cualquier modelo neuronal, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUC (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| telco-churn-logistic-regression | No disponible (lineal) | No aplica | 0,843 | MIT | Hugging Face (`joblib`) |
| Gradient boosting (mismo proyecto) | No disponible | No aplica | 0,846 | No disponible | Referenciado en el repositorio GitHub del autor |
| Random forest (mismo proyecto) | No disponible | No aplica | 0,846 | No disponible | Referenciado en el repositorio GitHub del autor |

Las alternativas comparables dentro de la informacion disponible son las otras familias evaluadas en el proyecto original; no se dispone de datos de modelos externos con los que contrastar. La diferencia de AUC entre las tres opciones es de 0,003 y los intervalos de confianza se solapan, por lo que la eleccion del autor se basa en interpretabilidad y estabilidad del ranking, no en superioridad predictiva.

## Limitaciones y advertencias

- Extracto puntual sin historial de cliente: el modelo no captura la evolucion temporal del comportamiento, solo el estado en un momento dado.
- El umbral de decision (0,30 para maximo F1) no incorpora el coste del contacto de retencion; en produccion debe recalibrarse segun la economia de la campana.
- El dataset IBM Telco es una muestra de proveedor; la model card lo describe como demostracion de metodo, no como modelo de churn listo para produccion.
- Riesgo de sesgo de dominio: entrenado sobre una unica muestra de una operadora, puede no generalizar a otras bases de clientes, mercados o esquemas de precios.
- Idioma: etiquetas y valores categoricos en ingles; requiere adaptar la codificacion para datos en otro idioma.
- Sin datos publicados sobre sesgos demograficos ni auditorias de equidad; variables como `SeniorCitizen` entran en el modelo y deben revisarse en un contexto regulatorio.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no hay restricciones adicionales declaradas.
- Dependencia de version: fijado a scikit-learn 1.9; cambios de version pueden alterar la serializacion del `Pipeline`.

## Enlaces

- Hugging Face: https://huggingface.co/omaressamrme/telco-churn-logistic-regression
- Repositorio del proyecto: https://github.com/engomaressam/telco-churn-classification
- Articulo comparativo (dev.to): https://dev.to/eng_omaressam_7cb0e2a9c/churn-prediction-where-the-simple-model-wins-logistic-regression-against-five-rivals-3dah
- Notebook de Kaggle: https://www.kaggle.com/code/engomaressam/telco-churn-6-models-compared-logreg-explained
- Portfolio del autor: https://omaressam.web.app/#projects
