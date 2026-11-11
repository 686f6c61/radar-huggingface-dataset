# SindhujaDavuluri-IAAC/melbourne-housing-pca-kmeans-clustering

## Resumen

Melbourne Housing PCA K-Means Clustering es un pipeline de aprendizaje no supervisado publicado en Hugging Face por SindhujaDavuluri-IAAC (equipo formado por Breno, Diego, Sindhuja y Soumya) en el marco del curso AI Methods I del IAAC MaAI 2026/27. No es un modelo de lenguaje ni una red neuronal: es un artefacto de scikit-learn serializado con joblib que agrupa ventas inmobiliarias de Melbourne en cuatro clústeres a partir de ocho atributos numéricos de la propiedad.

El pipeline encadena imputación por mediana, estandarización con StandardScaler, reducción de dimensionalidad mediante PCA (seis componentes, 95,95 % de varianza retenida) y K-Means con cuatro centroides (random_state=42, n_init=10). Se entrenó sobre 12.078 ventas limpias derivadas del dataset público Melbourne Housing Market de Kaggle (originalmente 34.857 filas y 21 columnas de Domain.com.au).

Su relevancia es acotada y de carácter educativo: sirve como ejemplo reproducible de un flujo completo de clustering tabular con preprocesamiento empaquetado, y como herramienta de análisis exploratorio del mercado residencial de Melbourne. No debe confundirse con un modelo generativo ni emplearse como sistema de valoración o segmentación validada en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: imputación por mediana → StandardScaler → PCA → K-Means |
| Parametros totales | no disponible (modelo no neuronal; 4 centroides en 6 componentes PCA) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 8 columnas fijas) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto joblib de precisión completa) |
| Idiomas soportados | en (etiquetas y documentación en inglés; los datos son numéricos) |
| Licencia | MIT |
| Formato de pesos | joblib (`.joblib`) |

## Arquitectura y entrenamiento

El artefacto es un `Pipeline` de scikit-learn que aplica, en orden, imputación de valores faltantes con las medianas de cada columna de entrenamiento, estandarización con las medias y desviaciones de entrenamiento, PCA con seis componentes (varianza retenida del 95,95 %) y K-Means con cuatro clústeres, `random_state=42` y `n_init=10`. Todo el preprocesamiento queda empaquetado con el modelo, de modo que la predicción nunca reajusta la imputación ni el escalado.

Los datos de entrenamiento son 12.078 ventas limpias del mercado inmobiliario de Melbourne, derivadas del dataset de Kaggle de Anthony Pino (34.857 filas y 21 columnas originales procedentes de Domain.com.au). Las ocho variables de entrada son Landsize (m²), Rooms, HouseAge (años en la fecha de venta), Distance (km al CBD), Bathroom, Car, Price (AUD) y Bedroom2. Se excluyen tipo de propiedad, suburbio, latitud y longitud; la distancia al CBD sí se mantiene como entrada. No se documenta ningún estudio de selección de k, análisis de estabilidad, validación cruzada ni evaluación sobre datos retenidos: los cuatro clústeres responden a la configuración de la asignatura.

## Capacidades

- Agrupamiento no supervisado de propiedades en cuatro clústeres (identificadores enteros 0–3) a partir de ocho atributos numéricos.
- Predicción sobre lotes de propiedades nuevas mediante `model.predict(DataFrame)` o la CLI `python clustering_model.py predict`.
- Salida enriquecida en CSV: conserva las columnas originales y añade `cluster_id` y `cluster_label`.
- Mapeo de identificadores a nombres descriptivos mediante el atributo `cluster_label_map_` del pipeline.
- Rechazo explícito de valores infinitos; acepta valores numéricos o ausentes (imputados con medianas de entrenamiento).
- Reducción de dimensionalidad reproducible con PCA de seis componentes.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Análisis exploratorio del mercado residencial de Melbourne: agrupar un lote de ventas y examinar los perfiles medianos por clúster (habitaciones, superficie, antigüedad, distancia al CBD y precio) para orientar hipótesis de investigación urbanística.
- Docencia y reproducción de pipelines: usar el artefacto como ejemplo completo de imputación, escalado, PCA y K-Means empaquetados, con resultados verificables tras guardar y recargar el modelo.
- Etiquetado preliminar de inventarios inmobiliarios: asignar un `cluster_label` descriptivo a listados con los ocho campos requeridos para facilitar filtros y visualizaciones en cuadros de mando internos.
- Segmentación exploratoria para estudios de accesibilidad: como Distance se mantiene como entrada, el clúster resultante separa propiedades por proximidad al CBD y permite cruzar esa dimensión con superficie y antigüedad.
- Comparación de carteras de propiedades: aplicar el pipeline a dos conjuntos (por ejemplo, dos suburbios) y comparar la distribución de clústeres como análisis descriptivo, no como validación de segmentos de mercado.
- Generación de variables auxiliares para modelos posteriores: usar `cluster_id` como característica categórica en un modelo supervisado de precios, siempre con validación independiente y consciente de que Price es una entrada del clustering.
- Demostración de despliegue ligero: el artefacto joblib se carga en segundos y no requiere GPU, lo que permite integrarlo en un servicio de inferencia por lotes de bajo coste.

## Benchmarks y rendimiento

La model card declara un `model-index` sin resultados. No se han publicado resultados de benchmarks en la informacion disponible (sin etiquetas de referencia, sin silhouette score, sin evaluación sobre datos retenidos).

| Metrica | Valor |
|---|---|
| Varianza retenida por PCA (6 componentes) | 95,95 % |
| Etiquetas de referencia / ground truth | no disponible |
| Silhouette score | no disponible |
| Evaluación en held-out | no disponible |
| Comparación de k | no disponible |

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU ni VRAM dedicada.
- Artefacto joblib de tamaño despreciable (repositorio de 0,0 GB); cabe en cualquier equipo.
- Memoria RAM dependiente del tamaño del lote de predicción; para lotes de decenas de miles de filas, menos de 1 GB es suficiente.
- Despliegue mediante Python con `scikit-learn`, `joblib`, `pandas` y `huggingface_hub`, respetando las versiones fijadas en `requirements.txt`.
- Alternativa de línea de comandos incluida en el repositorio (`clustering_model.py predict`).
- No aplica soporte de vLLM, llama.cpp, Ollama ni TGI: son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles de forma publicada; por la naturaleza del algoritmo (una transformación lineal y una asignación al centroide más cercano), la inferencia es de milisegundos por lote pequeño en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Salida | Evaluación publicada | Licencia |
|---|---|---|---|---|---|
| Melbourne Housing PCA K-Means Clustering | Pipeline sklearn (PCA + K-Means) | 8 atributos numéricos | 4 clústeres | No | MIT |
| K-Means directo sobre features estandarizadas | Clustering sklearn | 8 atributos numéricos | k clústeres | No | no aplica |
| DBSCAN sobre features estandarizadas | Clustering basado en densidad | 8 atributos numéricos | Clústeres + ruido | No | no aplica |
| Segmentación por reglas de negocio (suburbio, tipo, precio) | Heurística | Variable | Etiquetas manuales | No | no aplica |

No se dispone de comparativas publicadas frente a otros artefactos de clustering del mismo dataset en la informacion proporcionada.

## Limitaciones y advertencias

- El número de clústeres (k=4) responde a la configuración de la asignatura; no se ha demostrado que sea óptimo ni estable.
- No hay etiquetas de referencia, evaluación sobre datos retenidos ni silhouette score: los clústeres son descriptivos, no segmentos de mercado validados.
- Price se incluye como variable de entrada, por lo que las diferencias de precio entre clústeres son en parte consecuencia del propio agrupamiento y no una validación independiente.
- Los nombres de los clústeres (por ejemplo, «Large premium family houses») son descripciones exploratorias derivadas de medianas de entrenamiento, no categorías oficiales.
- Excluye tipo de propiedad, suburbio, latitud y longitud; la geografía solo se representa mediante la distancia al CBD.
- Requiere exactamente las ocho columnas con los nombres y el orden de entrenamiento; valores no numéricos o infinitos provocan error.
- HouseAge debe calcularse en la fecha de la venta, no en la fecha actual; usarlo de otro modo produce entradas fuera de distribución.
- Entrenado solo con datos de Melbourne (Australia) y documentación en inglés; no es trasladable sin reentrenamiento a otros mercados.
- Riesgo de alucinación no aplica (no genera texto), pero sí de extrapolación silenciosa: propiedades muy alejadas de la distribución de entrenamiento se asignan igualmente a un clúster sin señal de confianza.
- Licencia MIT permite uso comercial, pero el dataset de origen (Kaggle, Anthony Pino) tiene sus propias condiciones que deben revisarse por separado.
- No se distribuyen registros crudos, direcciones ni el CSV de entrenamiento en el repositorio del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SindhujaDavuluri-IAAC/melbourne-housing-pca-kmeans-clustering
- Repositorio de código fuente: https://github.com/SindhujaDavuluri-IAAC/5-day3-assignment
- Dataset de origen en Kaggle (Anthony Pino): https://www.kaggle.com/datasets/anthonypino/melbourne-housing-market
