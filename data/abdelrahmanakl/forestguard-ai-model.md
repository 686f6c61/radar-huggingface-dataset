# AbdelrahmanAkl/forestguard-ai-model

## Resumen

ForestGuard AI es un clasificador supervisado de tipo Random Forest entrenado para predecir el tipo de cubierta forestal de una parcela a partir de 54 variables cartograficas y ambientales. Lo desarrolla AbdelrahmanAkl y se distribuye como un artefacto serializado con joblib dentro de la libreria scikit-learn, no como una red neuronal ni como un modelo de lenguaje. Resuelve un problema clasico de clasificacion tabular multiclase: asignar una de siete clases de cobertura vegetal (abeto/picea, pino contorto, pino ponderosa, chopo/sauce, alamo temblon, abeto de Douglas y krummholz).

El modelo se entrena sobre el dataset UCI Covertype, con 581.012 observaciones y 54 caracteristicas (10 cuantitativas, 4 indicadores binarios de area silvestre y 40 indicadores binarios de tipo de suelo). Declara una precision del 96,20 % en test y un Macro F1 del 93,29 %, con hiperparametros ajustados mediante RandomizedSearchCV y seleccion por Macro F1. Es relevante como referencia educational y como ejemplo reproducible de pipeline tabular con scikit-learn, pero no es un modelo generativo ni compite en la categoria de los LLM.

La ficha se centra en sus caracteristicas reales: clasificacion tabular, licencia Apache 2.0, artefacto de 0,4 GB y dependencia estricta de la version 1.6.1 de scikit-learn para una carga reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (conjunto de arboles de decision, scikit-learn `RandomForestClassifier`) |
| Parametros totales | no disponible (no aplica; modelo basado en arboles, no en pesos neuronales) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (no hay cuantizacion de pesos; el artefacto es un `.joblib`) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `forest_cover_model.joblib` (serializacion joblib de scikit-learn) y `model_metadata.json` |
| Numero de clases | 7 |
| Numero de caracteristicas de entrada | 54 |
| Hiperparametros | `n_estimators=100`, `max_depth=30`, `max_features=0.7`, `min_samples_split=5`, `min_samples_leaf=1` |
| Version de scikit-learn | 1.6.1 (requerida para carga reproducible) |
| Tamano del repositorio | 0,4 GB |
| Tarea | Clasificacion tabular multiclase (`tabular-classification`) |

## Arquitectura y entrenamiento

El modelo es un `RandomForestClassifier` de scikit-learn con 100 estimadores, profundidad maxima de 30, `max_features` de 0,7, `min_samples_split` de 5 y `min_samples_leaf` de 1. No hay transformer, atencion ni capas neuronales: cada arbol se entrena sobre submuestras bootstrap de las 581.012 observaciones y las predicciones se agregan por voto mayoritario, con probabilidades por clase via `predict_proba`. El pipeline de desarrollo incluyo inspeccion y analisis exploratorio, validacion de calidad, particion estratificada train/test, comparacion de Decision Tree, Random Forest, XGBoost y Balanced Random Forest, optimizacion con RandomizedSearchCV (8 candidatos, 3 folds, metrica Macro F1) y evaluacion final sobre un conjunto de test no tocado.

El dataset de entrenamiento es el UCI Covertype: 10 variables cuantitativas (elevacion, aspecto, pendiente, distancias horizontal y vertical a hidrologia, distancia horizontal a carreteras y a puntos de fuego, y medidas de hillshade), 4 indicadores binarios de area silvestre y 40 indicadores binarios de tipo de suelo. No se documenta el numero exacto de tokens ni composicion adicional porque no aplica a un modelo tabular. Tampoco se reporta uso de RLHF, DPO ni tecnicas de alineacion; el ajuste es puramente de hiperparametros sobre la metrica Macro F1. La innovacion tecnica destacable es la seleccion por Macro F1 en lugar de accuracy, lo que penaliza el desbalance de clases del dataset (las clases 1 y 2 concentran la mayoria de las observaciones).

## Capacidades

- Clasificacion tabular multiclase en 7 categorias de cubierta forestal.
- Prediccion de probabilidades por clase mediante `predict_proba`, util para umbrales y analisis de incertidumbre.
- Manejo de 54 caracteristicas mixtas (cuantitativas continuas y binarias).
- Integracion directa en Python con pandas, numpy y scikit-learn.
- Exportacion de metadatos de features y evaluacion en `model_metadata.json`.
- No soporta tool calling, function calling ni agentes.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No tiene capacidades multilingues ni modo de razonamiento.
- No procesa audio ni imagenes.

## Casos de uso

- Prototipado educativo de clasificacion tabular: sirve para demostrar un pipeline completo de scikit-learn (split estratificado, RandomizedSearchCV, evaluacion con Macro F1) en cursos y talleres, ya que el artefacto se carga con `joblib.load` y expone `classes_` y `predict_proba`.
- Analisis exploratorio de datos geoespaciales: permite etiquetar rapidamente observaciones del dataset Covertype y comparar la distribucion de clases predichas con la real en cuadernos de analisis ambiental.
- Integracion en dashboards interactivos: al ser un artefacto pequeno y de inferencia en CPU, se puede incrustar en aplicaciones Streamlit o Dash para clasificar parcelas a partir de formularios con las 54 variables.
- Benchmark de referencia para modelos tabulares: sirve como baseline de Random Forest frente a XGBoost, LightGBM o redes tabulares en experimentos de comparacion, con metricas ya publicadas (Accuracy 96,20 %, Macro F1 93,29 %).
- Validacion de pipelines de datos: el requisito de nombres y definiciones exactas de las 54 features lo convierte en una prueba util para verificar que un ETL produce el esquema correcto antes de conectar un modelo mayor.
- Docencia sobre desbalance de clases: las diferencias por clase (F1 de 0,87 en Aspen y 0,88 en Cottonwood/Willow frente a 0,97 en Lodgepole Pine) permiten ilustrar el efecto del desbalance y el uso de Macro F1 frente a accuracy.
- Demostracion de reproducibilidad: la dependencia de scikit-learn 1.6.1 y la serializacion joblib permiten practicar el control de versiones de artefactos en entornos de produccion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test no tocado del dataset UCI Covertype:

| Metrica | Valor |
|---|---:|
| Accuracy | 96,20 % |
| Macro Precision | 94,73 % |
| Macro Recall | 92,00 % |
| Macro F1 | 93,29 % |
| Weighted F1 | 96,18 % |
| Mejor Macro F1 en validacion cruzada | 0,9243 |

Rendimiento por clase:

| Clase | Tipo de cubierta | F1-score |
|---:|---|---:|
| 1 | Spruce/Fir | 0,96 |
| 2 | Lodgepole Pine | 0,97 |
| 3 | Ponderosa Pine | 0,96 |
| 4 | Cottonwood/Willow | 0,88 |
| 5 | Aspen | 0,87 |
| 6 | Douglas-fir | 0,93 |
| 7 | Krummholz | 0,96 |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible; el autor menciona que comparo Decision Tree, Random Forest, XGBoost y Balanced Random Forest, pero no incluye la tabla de resultados de esa comparacion.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU.
- RAM estimada: el artefacto ocupa 0,4 GB en disco y la carga en memoria de 100 arboles con profundidad 30 requiere del orden de varios cientos de MB a pocos GB, aunque el autor no publica la cifra exacta.
- GPU: no necesaria; no se aprovecha CUDA.
- CPU: cualquier procesador moderno es suficiente; la inferencia por lote escala con el numero de nucleos disponibles en scikit-learn.
- Cabe en cualquier equipo de consumo, incluidos portatiles modestos y entornos de contenedor con 1-2 GB de RAM asignada.
- Opciones de despliegue: script Python con `joblib` y `scikit-learn==1.6.1`, API REST con FastAPI o Flask, o incrustacion en dashboards Streamlit/Dash; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no publicados; al ser un Random Forest de 100 arboles, la prediccion individual es del orden de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ForestGuard AI | Random Forest (scikit-learn) | no aplica (100 arboles) | no aplica | Accuracy 96,20 %, Macro F1 93,29 % en Covertype | Apache 2.0 | HuggingFace |
| XGBoost (referencia generica) | Gradient boosting | no aplica | no aplica | No comparado en la model card | Apache 2.0 | Repositorio oficial |
| LightGBM (referencia generica) | Gradient boosting | no aplica | no aplica | No comparado en la model card | MIT | Repositorio oficial |
| Balanced Random Forest (referencia generica) | Random Forest con balanceo | no aplica | no aplica | No comparado en la model card | BSD-3 | Repositorio oficial |

No se dispone de resultados numericos de los modelos alternativos sobre Covertype en la informacion proporcionada; la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo aprende exclusivamente de los patrones del dataset UCI Covertype; no se ha establecido su generalizacion a regiones geograficas fuera de ese dataset.
- No debe usarse como unica base para decisiones reales de silvicultura, gestion del territorio o medio ambiente, tal como advierte el autor.
- La importancia de caracteristicas refleja la dependencia del modelo, no relaciones causales.
- Riesgo de sesgo por desbalance de clases: las clases minoritarias (Aspen, Cottonwood/Willow) obtienen F1 de 0,87 y 0,88 frente a 0,96-0,97 de las mayoritarias.
- Requiere exactamente las 54 caracteristicas con los nombres y definiciones originales; un esquema incorrecto produce predicciones invalidas sin aviso claro.
- Dependencia estricta de scikit-learn 1.6.1 para una carga reproducible; versiones distintas pueden romper la deserializacion del `.joblib`.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbdelrahmanAkl/forestguard-ai-model
- Dataset UCI Covertype: https://archive.ics.uci.edu/dataset/31/covertype
- Documentacion de scikit-learn `RandomForestClassifier`: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
- Documentacion de joblib: https://joblib.readthedocs.io/
- Documentacion de HuggingFace Hub para descarga de artefactos: https://huggingface.co/docs/huggingface_hub
