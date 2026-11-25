# diogorib18/telco-churn-model

## Resumen

`diogorib18/telco-churn-model` es un modelo de clasificacion tabular publicado en Hugging Face por el usuario diogorib18, orientado a la prediccion de abandono de clientes (churn) en el sector de telecomunicaciones. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un pipeline de scikit-learn basado en Histogram Gradient Boosting, serializado con joblib y etiquetado con el pipeline `tabular-classification`.

El modelo se presenta como la version `v1.0.4` de un proyecto denominado EDSB Telco Customer Churn, entrenado sobre una unica instantanea de datos de California del tercer trimestre. Su funcion es clasificar clientes existentes en funcion de un esquema de caracteristicas definido en el propio repositorio, y la model card remite a metricas de validacion y a una puerta de calidad (quality gate) documentadas en el mismo espacio.

La relevancia de esta ficha es limitada desde el punto de vista de la IA generativa: el repositorio no contiene pesos en formato safetensors ni GGUF, no declara licencia, idiomas ni tamano de parametros, y no registra descargas ni interacciones. Se trata, por tanto, de un artefacto de clasificacion tabular de ambito muy acotado, no de un modelo fundacional comparable a los habitualmente cubiertos en este blog.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Histogram Gradient Boosting (pipeline de scikit-learn) |
| Parametros totales | no disponible (el repositorio no declara numero de arboles ni de hojas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible (serializacion joblib; no se documentan variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (serializacion de scikit-learn) |

## Arquitectura y entrenamiento

La model card indica que se trata de un pipeline de Histogram Gradient Boosting implementado con scikit-learn, una variante de gradient boosting que discretiza las variables continuas en histogramas para acelerar el entrenamiento y reducir el consumo de memoria en conjuntos tabulares. El artefacto se distribuye serializado con joblib, lo que implica que la inferencia requiere cargar el objeto completo de scikit-learn y disponer de la misma version de la libreria y de las dependencias asociadas.

No se especifica en la informacion disponible el numero de estimadores, la profundidad maxima, la tasa de aprendizaje ni el volumen de datos de entrenamiento. La unica referencia al corpus es una instantanea de clientes de California del tercer trimestre, sin indicar el ano ni el numero de filas. Tampoco se documenta si hubo ajuste de hiperparametros, validacion cruzada o tecnicas de calibracion, mas alla de la mencion a metricas de validacion y a una puerta de calidad alojadas en el repositorio.

## Capacidades

- Clasificacion binaria o multiclase de clientes de telecomunicaciones segun su probabilidad de abandono, a partir de un esquema de caracteristicas tabulares definido en el repositorio.
- Inferencia por lotes sobre registros tabulares individuales o en dataframe, siempre que las columnas coincidan con el esquema de entrenamiento.
- Integracion directa en pipelines de Python mediante scikit-learn y joblib.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de procesamiento de lenguaje natural.
- No dispone de modo de pensamiento (thinking mode) ni de entradas de audio.

## Casos de uso

- Priorizacion de campanas de retencion: el modelo puntua a cada cliente con una probabilidad de churn, lo que permite ordenar las acciones del equipo de retencion por riesgo y concentrar el presupuesto en los segmentos con mayor probabilidad de abandono.
- Segmentacion de cartera en el area de customer success: la salida del clasificador se puede cruzar con variables de valor de cliente para construir matrices de riesgo y decidir que cuentas requieren contacto proactivo.
- Monitorizacion periodica de cohortes: al ser un pipeline de scikit-learn, puede reejecutarse por lotes sobre nuevas instantaneas trimestrales y comparar la evolucion del riesgo agregado entre periodos.
- Analisis de factores asociados al abandono: los modelos de gradient boosting permiten extraer importancias de caracteristicas y, con librerias como SHAP, explicar que variables empujan la prediccion en cada cliente concreto.
- Prototipado rapido en equipos de ciencia de datos: al estar serializado con joblib y depender solo de scikit-learn, se puede desplegar en un endpoint interno o en un notebook sin infraestructura de GPU.
- Pruebas de concepto de scoring en entornos academicos o de formacion: sirve como ejemplo reproducible de un pipeline tabular completo con puerta de calidad y esquema de caracteristicas documentado.
- Integracion en un servicio de decision batch: el modelo puede ejecutarse en un job programado que escriba las puntuaciones en una tabla de CRM para su consumo por parte de sistemas de marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de metricas de validacion y de una puerta de calidad en el repositorio, pero no se incluyen sus valores numericos en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna en particular; no es necesario acelerador grafico para un pipeline de Histogram Gradient Boosting de scikit-learn.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; cualquier CPU moderna es suficiente.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio REST con FastAPI o Flask, ejecucion por lotes con Airflow o cron, o empaquetado en un contenedor Docker con las versiones fijadas de scikit-learn y joblib.
- Latencia y throughput estimados: no disponibles; dependen del numero de arboles, del numero de caracteristicas y del hardware, y no se documentan en la informacion proporcionada.
- Requisito critico: la version de scikit-learn usada en la inferencia debe coincidir con la de entrenamiento para evitar incompatibilidades al deserializar el objeto joblib.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diogorib18/telco-churn-model | Histogram Gradient Boosting (scikit-learn) | no disponible | no aplica | no disponible | Hugging Face, 0 descargas |
| XGBoost (referencia generica) | Gradient boosting | configurable por el usuario | no aplica | Apache 2.0 | Libreria ampliamente adoptada |
| LightGBM (referencia generica) | Gradient boosting con histogramas | configurable por el usuario | no aplica | MIT | Libreria ampliamente adoptada |
| CatBoost (referencia generica) | Gradient boosting con soporte categorico nativo | configurable por el usuario | no aplica | Apache 2.0 | Libreria ampliamente adoptada |

La comparacion se establece frente a implementaciones genericas de gradient boosting, no frente a modelos concretos publicados, porque no se dispone de artefactos comparables con el mismo esquema de caracteristicas y el mismo dominio. No hay datos de rendimiento del modelo de diogorib18 que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no declara licencia, por lo que el uso comercial queda en un limbo juridico hasta que el autor lo aclare.
- El entrenamiento se basa en una unica instantanea de datos de California de un trimestre concreto; la generalizacion a otras geografias, periodos o empresas de telecomunicaciones no esta documentada y es probablemente limitada.
- No se especifica el numero de filas ni la composicion del dataset, lo que impide evaluar el riesgo de sobreajuste o de sesgos por clase.
- Al ser un modelo tabular, cualquier cambio en el esquema de caracteristicas invalida el pipeline; no hay tolerancia a columnas ausentes o renombradas.
- La serializacion joblib es fragil frente a cambios de version de scikit-learn y de sus dependencias; conviene fijar versiones en el entorno de produccion.
- No se documentan sesgos conocidos, tasas de alucinacion (no aplica en sentido estricto) ni limitaciones idiomaticas.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia externa de validacion por parte de la comunidad.
- No se proporcionan metricas de calibracion; si las probabilidades se usan para decisiones economicas, conviene recalibrarlas con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diogorib18/telco-churn-model
- Documentacion de scikit-learn sobre HistGradientBoostingClassifier: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.HistGradientBoostingClassifier.html
- Documentacion de joblib: https://joblib.readthedocs.io/
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios auxiliares ni demos asociados a este modelo.
