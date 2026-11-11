# iaac-maai/day3-team5-melbourne-housing-clustering

## Resumen

`day3-team5-melbourne-housing-clustering` no es un modelo de lenguaje ni una red neuronal: es un pipeline de aprendizaje automatico clasico serializado con scikit-learn que agrupa ventas inmobiliarias de Melbourne en cuatro segmentos mediante imputacion por mediana, estandarizacion, analisis de componentes principales (PCA) y K-Means. Lo firman Breno, Diego, Sindhuja y Soumya en el contexto del curso AI Methods I del IAAC MaAI 2026/27, y su proposito es educativo: servir de artefacto reproducible para un ejercicio de clustering no supervisado sobre datos tabulares.

El pipeline se entrena sobre 12.078 ventas limpias derivadas del dataset Melbourne Housing Market de Kaggle (originalmente 34.857 filas y 21 columnas de Domain.com.au). Utiliza ocho atributos numericos (superficie del terreno, habitaciones, antiguedad, distancia al CBD, banos, plazas de garaje, precio y un segundo campo de dormitorios), retiene seis componentes principales que explican el 95,95 % de la varianza y ajusta cuatro centroides con `random_state=42` y `n_init=10`.

Su relevancia es acotada y conviene ser explicitos: no hay benchmarks, no hay evaluacion con etiquetas de referencia ni estudio de estabilidad del numero de clusters. Es util como ejemplo docente de pipeline completo y reproducible (preprocesamiento incluido en el artefacto, prediccion sin reajuste), no como componente listo para produccion en un sistema de valoracion inmobiliaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: imputacion por mediana → StandardScaler → PCA → K-Means |
| Parametros totales | No aplica (modelo no neuronal); 4 centroides en 6 componentes PCA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 8 columnas) |
| Tipos de cuantizacion | No disponible (no aplica; serializacion joblib en coma flotante) |
| Idiomas soportados | Ingles (metadatos y documentacion); los datos no contienen texto |
| Licencia | MIT |
| Formato de pesos | joblib (`melbourne-housing-pca-kmeans-clustering.joblib`) |

## Arquitectura y entrenamiento

El artefacto encadena cuatro etapas fijas. Primero, imputacion de valores faltantes con la mediana de cada columna calculada en entrenamiento. Segundo, estandarizacion con media y desviacion tipica de entrenamiento. Tercero, PCA con el numero minimo de componentes que alcanza el 95 % de varianza explicada, que resultan ser seis. Cuarto, K-Means con `k=4`, `random_state=42` y `n_init=10`, ajustado en el espacio de componentes. Todo el preprocesamiento queda empaquetado con el clustering, de modo que `predict` nunca reajusta la imputacion ni el escalado.

Los datos de entrenamiento son 12.078 ventas del CSV limpio del proyecto, derivado del dataset publico de Kaggle de Anthony Pino. Se excluyen tipo de propiedad, suburbio, latitud y longitud; la distancia al CBD si se mantiene como variable de entrada. No hay entrenamiento supervisado, ni RLHF, ni DPO: es aprendizaje no supervisado puro. Tampoco se documenta comparacion de valores de `k` ni analisis de estabilidad, por lo que la eleccion de cuatro clusters responde a la configuracion de la asignatura, no a una optimizacion empirica. La unica comprobacion reportada es que las asignaciones de entrenamiento se mantienen tras guardar y recargar el modelo.

## Capacidades

- Agrupacion no supervisada de propiedades en cuatro segmentos interpretables a partir de ocho atributos numericos.
- Prediccion de `cluster_id` (entero 0-3) y `cluster_label` (nombre descriptivo) mediante el atributo `cluster_label_map_`.
- Preprocesamiento integrado: tolera valores faltantes en las ocho columnas y rechaza valores infinitos.
- Reduccion de dimensionalidad reproducible: seis componentes PCA con 95,95 % de varianza retenida.
- Ejecucion por linea de comandos (`clustering_model.py predict`) que preserva las columnas originales y anade las dos de salida.
- Perfilado de clusters: el repositorio incluye `cluster_profiles.csv` con medianas por cluster de las ocho variables.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Docencia de pipelines no supervisados: sirve como ejemplo completo y reproducible de imputacion, escalado, PCA y K-Means en un unico objeto serializado, util para asignaturas de machine learning.
- Analisis exploratorio de carteras inmobiliarias: dado un conjunto de ventas con los ocho campos requeridos, permite etiquetar cada registro en uno de los cuatro segmentos y revisar la distribucion resultante.
- Segmentacion preliminar para estudios de mercado: los perfiles de cluster (por ejemplo, 1.968 ventas con mediana de 655 m² y 1.815.000 AUD frente a 2.946 unidades con 98 m² y 587.067 AUD) ofrecen una taxonomia inicial discutible pero inmediata.
- Generacion de variables categoricas para modelos posteriores: `cluster_id` puede incorporarse como feature en un modelo supervisado de precio, siempre que se entrene y valide fuera de muestra.
- Reproducibilidad de trabajos academicos: el artefacto congela el estado exacto del pipeline y permite verificar resultados de un notebook sin reejecutarlo.
- Prototipado de interfaces de consulta: con la CLI se puede procesar un CSV de propiedades y devolver predicciones en lote para demos o validaciones internas.
- Comparacion de tecnicas de reduccion de dimensionalidad: el grafico de varianza explicada y los componentes retenidos permiten contrastar con alternativas como UMAP o t-SNE en ejercicios practicos.

## Benchmarks y rendimiento

La model card declara un `model-index` con nombre ("Melbourne Housing PCA K-Means Clustering") pero la lista de resultados esta vacia. No se aportan MMLU, HumanEval, GSM8K ni metricas de clustering como silhouette score, Davies-Bouldin o pureza, y tampoco hay evaluacion sobre conjunto retenido.

| Metrica | Valor |
|---|---|
| Varianza retenida por PCA | 95,95 % (6 componentes) |
| Silhouette score | No disponible |
| Evaluacion en held-out | No disponible |
| Etiquetas de referencia | No disponibles |

## Requisitos de hardware

- Inferencia en CPU: el pipeline es trivial en coste; scikit-learn ejecuta `predict` sobre miles de filas en milisegundos.
- VRAM: no requiere GPU. Consumo de memoria del orden de decenas de megabytes para el artefacto joblib y el dataframe de entrada.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; una GPU no aporta ventaja apreciable.
- Despliegue: carga directa con `joblib.load` en Python, servicio HTTP envolviendo el objeto, o ejecucion por CLI con `clustering_model.py`. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales.
- Latencia y throughput: no publicados. Por la naturaleza del algoritmo (transformacion lineal y asignacion al centroide mas cercano) se espera latencia sub-milisegundo por registro en CPU, sin que el autor aporte mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| day3-team5-melbourne-housing-clustering | Pipeline PCA + K-Means | 4 centroides, 6 componentes | No aplica | MIT | Hugging Face |
| Alternativas de clustering tabular (p. ej. Gaussian Mixture, DBSCAN, HDBSCAN via scikit-learn) | Algoritmos genericos | Configurables | No aplica | BSD-3 (scikit-learn) | PyPI |
| Modelos de valoracion inmobiliaria supervisados | Regresion / gradient boosting | Variable | No aplica | Variable | Variable |

No se dispone de una comparativa cuantitativa con alternativas: el autor no publica metricas que permitan contrastar este pipeline con otros enfoques de segmentacion sobre el mismo dataset.

## Limitaciones y advertencias

- El precio se usa como variable de entrada, de modo que las diferencias de precio entre clusters son en parte consecuencia del propio clustering y no una validacion independiente.
- No se justifica `k=4`: no hay comparacion de valores de `k`, ni silhouette, ni estudio de estabilidad. Cuatro clusters es una decision de la asignatura.
- Ausencia total de evaluacion con etiquetas de referencia o conjunto retenido; el 95,95 % de varianza explicada mide reduccion de dimensionalidad, no calidad del agrupamiento.
- Excluye variables potencialmente informativas como suburbio, tipo de propiedad y coordenadas; la distancia al CBD es el unico proxy espacial.
- Requiere exactamente las ocho columnas con los nombres y el orden de entrenamiento; `HouseAge` debe calcularse en la fecha de venta, no en la actual.
- Rechaza valores infinitos; solo admite numeros o faltantes.
- Entrenado sobre el mercado de Melbourne con datos historicos de Domain.com.au: no generaliza a otras ciudades ni a periodos distintos sin reentrenamiento.
- Documentacion y etiquetas solo en ingles.
- Licencia MIT permite uso comercial, pero al ser un artefacto educativo sin validacion, su uso en produccion para decisiones de negocio o crediticias es desaconsejable sin auditoria previa.
- Riesgo de interpretar los nombres de cluster ("Large premium family houses", "Affordable outer-suburb houses") como segmentos de mercado validados cuando son descripciones exploratorias de medianas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day3-team5-melbourne-housing-clustering
- Repositorio de la asignatura: https://github.com/SindhujaDavuluri-IAAC/5-day3-assignment
- Dataset original en Kaggle (Anthony Pino): https://www.kaggle.com/datasets/anthonypino/melbourne-housing-market
- Perfiles de cluster: `cluster_profiles.csv` dentro del repositorio del modelo
- Graficos incluidos: `figures/cluster_overview.png`, `figures/cluster_profiles.png`, `figures/pca_variance.png`
