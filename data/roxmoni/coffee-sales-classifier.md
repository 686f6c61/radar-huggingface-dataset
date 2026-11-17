# RoxMoni/coffee-sales-classifier

## Resumen

Coffee Sales Classifier (identificado en Hugging Face como `RoxMoni/coffee-sales-classifier`) es un modelo de clasificacion tabular desarrollado por el usuario RoxMoni en el contexto del curso ml-zoomcamp. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un pipeline de scikit-learn basado en un clasificador RandomForest que predice el tipo de bebida de cafe a partir de variables contextuales de la venta (hora, dia de la semana, mes, fin de semana, tipo de pago y uso de tarjeta).

El modelo aborda un problema de clasificacion multiclase con ocho categorias de bebida (Americano, Americano with Milk, Cappuccino, Cocoa, Cortado, Espresso, Hot Chocolate y Latte). Su relevancia es limitada fuera del ambito educativo: los resultados publicados en su model card muestran un rendimiento muy bajo, con una precision en test de 0,2376 y un F1 macro de 0,2278, lo que sugiere que las variables de entrada tienen escasa capacidad predictiva sobre la bebida elegida.

Se distribuye como un artefacto de scikit-learn serializado con joblib, con un tamano de repositorio practicamente nulo (0.0 GB reportados), sin licencia declarada, sin idiomas especificados y sin pipeline de Hugging Face asignado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con clasificador RandomForest |
| Parametros totales | no disponible (no aplica; modelo basado en arboles de decision) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 6 caracteristicas) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no procesa texto libre) |
| Licencia | no disponible |
| Formato de pesos | Serializacion joblib de scikit-learn (segun `library_name: sklearn`) |

Hiperparametros del mejor modelo segun la model card:

| Hiperparametro | Valor |
|---|---|
| `clf__n_estimators` | 138 |
| `clf__max_depth` | 10 |
| `clf__min_samples_leaf` | 1 |

Caracteristicas de entrada (`feature_columns`): `hour`, `day_of_week`, `month`, `is_weekend`, `cash_type`, `has_card`.

Clases de salida: `Americano`, `Americano with Milk`, `Cappuccino`, `Cocoa`, `Cortado`, `Espresso`, `Hot Chocolate`, `Latte`.

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de scikit-learn compuesto por un preprocesamiento (no detallado en la model card) y un clasificador `RandomForestClassifier` con 138 estimadores, profundidad maxima de 10 y `min_samples_leaf` de 1. Estos hiperparametros se seleccionaron mediante busqueda, segun indica el campo `best_params` de la model card, y el mejor F1 macro en validacion cruzada fue de 0,2169.

No se especifica el volumen del conjunto de datos, la composicion del dataset, ni si se aplicaron tecnicas de balanceo de clases, aumento de datos o ajuste adicional. Tampoco se documenta ninguna innovacion tecnica: se trata de un modelo tabular convencional entrenado como ejercicio academico del programa ml-zoomcamp. No hay informacion sobre RLHF, DPO ni tecnicas de alineacion, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion multiclase tabular: predice una de ocho bebidas de cafe a partir de seis variables de contexto de la venta.
- Entrada estructurada: consume exclusivamente las columnas `hour`, `day_of_week`, `month`, `is_weekend`, `cash_type` y `has_card`.
- Integracion con el ecosistema scikit-learn: puede cargarse con `joblib.load` y usarse con la API estandar `predict` / `predict_proba`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (no procesa lenguaje natural).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Ejercicio docente de clasificacion tabular: sirve como ejemplo practico en cursos de machine learning para ilustrar un pipeline de scikit-learn con RandomForest, busqueda de hiperparametros y evaluacion con F1 macro.
- Prototipo de sistema de recomendacion de bebidas en un punto de venta: podria integrarse en un TPV para sugerir una bebida segun la hora y el dia, aunque el bajo rendimiento medido limita su utilidad real.
- Analisis exploratorio de datos de ventas de cafeteria: el modelo y sus caracteristicas permiten estudiar que variables contextuales aportan senal predictiva sobre el producto vendido.
- Base para comparativas de modelos: puede usarse como linea base (baseline) frente a clasificadores mas potentes (gradient boosting, redes neuronales tabulares) en el mismo conjunto de datos.
- Demostracion de serializacion y despliegue con joblib: util para practicar el empaquetado de modelos de scikit-learn y su carga en un servicio de inferencia sencillo.
- Pruebas de integracion en pipelines de datos: sirve para validar el flujo de extraccion de caracteristicas tabulares y la llamada a un modelo en un entorno de CI/CD educativo.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Metrica | Valor |
|---|---|
| F1 macro en validacion cruzada (mejor) | 0,2169 |
| Precision en test | 0,2376 |
| F1 macro en test | 0,2278 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo es un RandomForest serializado con joblib y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier consumer GPU y, de hecho, en cualquier CPU moderna: el coste computacional es minimo (138 arboles de profundidad maxima 10).
- Opciones de despliegue: carga directa con `joblib` en Python, empaquetado en un servicio Flask/FastAPI, o integracion en un pipeline de scikit-learn. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por la naturaleza del modelo, se espera latencia de milisegundos por prediccion en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RoxMoni/coffee-sales-classifier | RandomForest (scikit-learn) | no aplica | no aplica | F1 macro test 0,2278 | no disponible | Hugging Face |
| Alternativas de clasificacion tabular (p. ej., XGBoost, LightGBM) | Gradient boosting | no disponible | no aplica | no disponible | no disponible | no disponible |
| Modelos de lenguaje para clasificacion zero-shot | Transformer | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparativa se limita a categorias genericas.

## Limitaciones y advertencias

- Rendimiento muy bajo: precision en test de 0,2376 y F1 macro de 0,2278 sobre ocho clases, apenas por encima de una prediccion aleatoria uniforme (0,125). No es apto para produccion.
- Sesgos conocidos: no documentados; al entrenarse sobre un conjunto de datos no descrito, puede reflejar sesgos de la muestra (por ejemplo, patrones horarios o de pago especificos de una cafeteria concreta).
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero si existe riesgo de predicciones poco fiables por la debilidad del modelo.
- Limitaciones de contexto o idioma: el modelo solo acepta las seis caracteristicas tabulares indicadas; cualquier otro tipo de entrada no es soportado.
- Restricciones de licencia: la licencia no esta declarada en la model card ni en los metadatos de Hugging Face, por lo que no se puede confirmar el uso comercial. Se recomienda contactar con el autor antes de cualquier uso fuera del ambito educativo.
- Caveat para produccion: el modelo parece ser un artefacto academico del curso ml-zoomcamp; no hay evidencia de validacion externa, versionado ni mantenimiento.
- Sin pipeline declarado en Hugging Face, lo que dificulta su uso directo con la API de inferencia de la plataforma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoxMoni/coffee-sales-classifier
- Documentacion de scikit-learn: https://scikit-learn.org/stable/
- Documentacion de joblib: https://joblib.readthedocs.io/
- Curso ml-zoomcamp: https://github.com/DataTalksClub/mlops-zoomcamp (referencia del tag `ml-zoomcamp`)
