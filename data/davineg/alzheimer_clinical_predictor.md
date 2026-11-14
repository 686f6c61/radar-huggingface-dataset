# DaviNeg/Alzheimer_Clinical_Predictor

## Resumen

Alzheimer Clinical Predictor es un clasificador binario tabular desarrollado por DaviNeg en el marco de un proyecto académico de la Universidade de Brasília. No es un modelo de lenguaje ni un transformer: se trata de un artefacto de `sklearn.ensemble.GradientBoostingClassifier` entrenado sobre el Alzheimer's Disease Dataset de Kaggle (2.149 registros, 35 columnas originales) para predecir la variable `Diagnosis` a partir de 59 variables clínicas ya preparadas.

El modelo resuelve una tarea de clasificación supervisada sobre datos tabulares y se distribuye como un fichero `model.pkl` serializado con `cloudpickle`, acompañado de un esquema de características (`feature_schema.json`) y un manifiesto de procedencia (`provenance.json`). Su relevancia es exclusivamente educativa y de reproducción metodológica: el propio autor advierte que no ha sido validado clínicamente y que no debe emplearse para diagnóstico, cribado ni decisiones sobre pacientes.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0.0 GB y licencia MIT. El idioma declarado es portugués y la librería de referencia es scikit-learn, con pipeline `tabular-classification`. No hay pesos en formato safetensors ni GGUF, ni parámetros en el sentido de un modelo neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient Boosting (`sklearn.ensemble.GradientBoostingClassifier`) |
| Parametros totales | no disponible (no es un modelo neuronal; número de árboles y profundidad no publicados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 59 variables) |
| Tipos de cuantizacion | no aplica (artefacto `cloudpickle`, sin cuantización) |
| Idiomas soportados | portugués (documentación y proyecto); el modelo no procesa texto |
| Licencia | MIT |
| Formato de pesos | `model/model.pkl` (cloudpickle); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un `GradientBoostingClassifier` de scikit-learn ajustado mediante `RandomizedSearchCV` con 30 combinaciones de hiperparámetros y validación cruzada de 5 particiones, optimizando la métrica de recall. La partición final es 80% entrenamiento / 20% test, estratificada, con `random_state=15`. El entorno original fue Python 3.12.10, scikit-learn 1.7.2, NumPy 2.4.4 y pandas 2.3.3.

El pipeline de preparación documentado en el repositorio de origen (commit `432f8ff`) consta de cinco etapas: imputación con `IterativeImputer` sobre variables continuas tras eliminar identificador y campo del médico; análisis y eliminación de outliers con |z| > 3,5 (sin pérdida neta de filas, se mantienen 2.149); codificación one-hot de etnia y escolaridad omitiendo la primera categoría; ingeniería de 23 variables derivadas (hemodinámicas, lipídicas, cognitivas e interacciones); y escalado con `RobustScaler` sobre columnas no binarias. El conjunto preparado resultante tiene 2.149 registros con 760 positivos (35,4%). El paquete publicado no incluye los objetos ajustados de imputación ni de escalado, por lo que no es posible reconstruir fielmente la entrada a partir de datos clínicos brutos.

## Capacidades

- Clasificación binaria tabular: estima probabilidad para la clase 1 (`Diagnosis=1`) y asigna clase con umbral 0,5.
- Entrada estricta de 59 variables numéricas en el orden del esquema; rechaza columnas faltantes, extrañas, nulas o no numéricas.
- Salida en CSV con columnas `probability_class_1` y `predicted_class`.
- Interfaz genérica de clasificación tabular del Hub mediante `pipeline.py` (sin proveedor de inferencia activo asociado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Reproducción académica de un pipeline de ML tabular: sirve para estudiar la secuencia completa de imputación, tratamiento de outliers, codificación, ingeniería de variables y escalado documentada en los notebooks del proyecto de origen.
- Docencia sobre fuga de información y validación: permite analizar cómo se comporta un clasificador cuando la ingeniería de variables se aplica antes de la partición y qué implicaciones tiene para la evaluación.
- Comparación de algoritmos de boosting: útil como referencia de `GradientBoostingClassifier` frente a XGBoost, LightGBM o CatBoost sobre el mismo conjunto tabular preparado.
- Estudio de calibración de probabilidades: el propio autor advierte que las probabilidades no están calibradas, lo que lo convierte en un caso práctico para introducir técnicas de calibración (Platt, isotónica) y curvas de fiabilidad.
- Análisis de métricas en clases desbalanceadas: con un 35,4% de positivos y optimización de recall, es un ejemplo para discutir el compromiso entre sensibilidad y precisión y el efecto del umbral 0,5.
- Evaluación de robustez ante entradas fuera de distribución: el rechazo estricto de columnas y valores nulos lo hace útil para ilustrar validación de esquemas en servicios de inferencia tabular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las métricas `recall` y `accuracy` como etiquetas, pero no incluye valores numéricos de rendimiento sobre el conjunto de test.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es CPU-only.
- GPU recomendadas: ninguna; no se requiere aceleración gráfica.
- Cabe en cualquier equipo consumer: el artefacto es un `model.pkl` de tamaño despreciable (repositorio de 0.0 GB) y la inferencia se ejecuta en CPU.
- Despliegue: ejecución directa con `python inference.py datos_preparados.csv --output predicoes.csv`; también admite la interfaz genérica de `pipeline.py` si existe un servicio de inferencia compatible (no confirmado).
- Dependencias: Python 3.12 y las versiones fijadas en `requirements.txt` (scikit-learn 1.7.2, NumPy 2.4.4, pandas 2.3.3 en el entorno original).
- Latencia y throughput: no disponibles; para un gradient boosting sobre 59 variables y 2.149 registros el coste es de milisegundos por lote en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaviNeg/Alzheimer_Clinical_Predictor | Gradient Boosting (scikit-learn) | no disponible | no aplica | MIT | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificación tabular clínica sobre el mismo conjunto de datos) en la documentación proporcionada.

## Limitaciones y advertencias

- No validado clínicamente: el autor prohíbe explícitamente su uso para diagnóstico, cribado o decisiones sobre pacientes.
- Probabilidades sin calibrar: no representan riesgo clínico individual; el umbral 0,5 es el valor por defecto del clasificador y no ha sido validado.
- Entrada no reconstruible desde datos brutos: el paquete no incluye los objetos de imputación ni de escalado, por lo que no deben pasarse valores clínicos brutos directamente al modelo.
- Riesgo de seguridad en la carga: `model.pkl` usa `cloudpickle`, que puede ejecutar código al cargarse; solo deben cargarse artefactos de origen fiable y verificarse el SHA-256 publicado en `provenance.json`.
- Dependencia estricta de versiones: el entorno debe ser compatible con `requirements.txt` para garantizar la deserialización correcta.
- Posible fuga de información: la ingeniería de variables y el escalado se aplican antes de la partición final, lo que puede inflar las métricas de evaluación.
- Nombres clínicos engañosos: algunas variables derivadas tienen nombres con apariencia de índices clínicos, pero son solo implementaciones del notebook y no escores validados.
- Datos no redistribuidos: el CSV original de Kaggle y los intermedios no se incluyen; sus términos de uso son los de la página del conjunto de datos.
- Cobertura limitada: 2.149 registros de una única fuente, sin evidencia de generalización a otras poblaciones o centros.
- Licencia MIT permite uso comercial del artefacto, pero ello no elimina las advertencias clínicas ni las obligaciones sobre los datos de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DaviNeg/Alzheimer_Clinical_Predictor
- Repositorio del proyecto académico: https://github.com/ArtyMend07/alzheimer-clinical-predictor
- Commit de referencia del pipeline: https://github.com/ArtyMend07/alzheimer-clinical-predictor/tree/432f8ffd4e09ec16e3eed45688f6ba96de0e7435
- Notebook de imputación: https://github.com/ArtyMend07/alzheimer-clinical-predictor/blob/432f8ffd4e09ec16e3eed45688f6ba96de0e7435/notebooks/tratamento/nulos_imputacao.ipynb
- Notebook de outliers: https://github.com/ArtyMend07/alzheimer-clinical-predictor/blob/432f8ffd4e09ec16e3eed45688f6ba96de0e7435/notebooks/tratamento/outliers.ipynb
- Notebook de codificación categórica: https://github.com/ArtyMend07/alzheimer-clinical-predictor/blob/432f8ffd4e09ec16e3eed45688f6ba96de0e7435/notebooks/tratamento/codificacao_categorica.ipynb
- Notebook de ingeniería de variables: https://github.com/ArtyMend07/alzheimer-clinical-predictor/blob/432f8ffd4e09ec16e3eed45688f6ba96de0e7435/notebooks/tratamento/feature_engineering.ipynb
- Notebook de normalización y exportación: https://github.com/ArtyMend07/alzheimer-clinical-predictor/blob/432f8ffd4e09ec16e3eed45688f6ba96de0e7435/notebooks/tratamento/normalizacao_exportacao.ipynb
- Conjunto de datos original: https://www.kaggle.com/datasets/rabieelkharoua/alzheimers-disease-dataset
