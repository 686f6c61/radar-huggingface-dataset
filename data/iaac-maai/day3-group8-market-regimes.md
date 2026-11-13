# iaac-maai/day3-group8-market-regimes

## Resumen

`iaac-maai/day3-group8-market-regimes` es un modelo de agrupamiento no supervisado (clustering) publicado en Hugging Face por el equipo Group 8 del curso AI Methods I del IAAC MaAI (2026/27). No es un modelo de lenguaje ni una red neuronal: es un pipeline de scikit-learn compuesto por un `StandardScaler` y un `KMeans` con k = 4, serializado en formato `joblib`. Su función es etiquetar un ano-pais de un mercado inmobiliario nacional dentro de uno de cuatro regimenes: crecimiento estable asequible, corrección de precios, meseta cara y auge de precios.

El modelo se entrena sobre 1.210 observaciones pais-ano de 26 países entre 1977 y 2024, con cuatro variables de entrada: crecimiento real del precio de la vivienda, crecimiento real de la renta, momento de asequibilidad y asequibilidad relativa a la media histórica del propio país. Resuelve un problema de vocabulario analítico: permitir a analistas de política de vivienda comparar fases de mercado entre países y décadas con una nomenclatura común.

Es relevante ahora porque ejemplifica el uso de técnicas de aprendizaje no supervisado clásico para tareas de analítica estructurada, sin dependencia de GPU ni de infraestructura de inferencia de gran escala. El repositorio ocupa 0,0 GB y las descargas y likes registrados son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` → `KMeans` (k = 4) |
| Parametros totales | No aplica (modelo de clustering, no red neuronal); 4 centroides en espacio de 4 dimensiones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada tabular de 4 columnas por fila) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.joblib` (pipeline completo serializado con joblib) |
| Libreria | scikit-learn 1.9.0 |
| Versiones de dependencias | pandas 3.0.3, numpy 2.4.6, joblib 1.5.3, Python 3.14 |
| Hiperparametros | `n_clusters=4`, `n_init=10`, `random_state=42` |
| Tarea | Clustering no supervisado |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas: estandarización de las cuatro variables numéricas con `StandardScaler` y agrupamiento con K-Means (k = 4, `n_init=10`, `random_state=42`). No hay capas neuronales, atención ni mecanismo de aprendizaje profundo. La asignación de nuevas filas se realiza con `.predict()`, que asigna cada observación al centroide más cercano; no existe etiqueta de ruido, por lo que toda entrada recibe uno de los cuatro regimenes.

Los datos de entrenamiento proceden de un dataset de asequibilidad de vivienda de 26 países (probablemente derivado de la International House Price Database del Dallas Fed), limpiado en una fase previa del curso. Se eliminaron los anos de hiperinflación de Israel, Croacia y Eslovenia, así como los dos primeros anos de cada país, pasando de 1.326 a 1.210 filas sin valores faltantes. Se compararon K-Means, clustering jerárquico (Ward) y DBSCAN sobre las cuatro variables estandarizadas; el acuerdo entre K-Means y Ward fue de ARI = 0,35, y DBSCAN produjo un único cluster denso más un 5 % de ruido. La innovación técnica destacable es la ingeniería de variables: el logaritmo de la asequibilidad relativa a la media histórica del país y el momento de asequibilidad frente a la media de los últimos tres anos.

## Capacidades

- Agrupamiento no supervisado de anos-pais en cuatro regimenes de mercado inmobiliario con nombres interpretables.
- Asignación determinista de nuevas observaciones a un régimen mediante `.predict()` sobre el centroide más cercano.
- Procesamiento de datos tabulares con cuatro variables numéricas: `log_afford_vs_own_avg`, `afford_momentum_pct`, `real_hpi_change_pct` y `real_income_change_pct`.
- Comparación de ciclos inmobiliarios entre países y décadas mediante una nomenclatura común.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión ni audio.
- No soporta capacidades multilingües: no procesa lenguaje natural.
- No realiza forecasting ni predicción del siguiente ano.

## Casos de uso

- Etiquetado de fases de mercado para informes de política de vivienda: un analista de un ministerio o banco central introduce las cuatro variables de un país y ano concreto y obtiene una etiqueta de régimen (por ejemplo, "España 2006 fue un auge de precios") para contextualizar el diagnóstico.
- Comparación internacional de ciclos: agrupar series históricas de varios países en los mismos cuatro regímenes permite identificar sincronías y desfases en las fases de auge, corrección y meseta entre economías de la OCDE.
- Docencia e investigación en métodos no supervisados: el pipeline sirve como ejemplo reproducible de estandarización más K-Means con evaluación mediante ARI frente a Ward y DBSCAN.
- Análisis exploratorio de series temporales macroeconómicas: clasificar 1.210 observaciones país-ano permite segmentar el dataset y estudiar la distribución de regimenes por país y por década.
- Construcción de indicadores compuestos de asequibilidad: el régimen asignado puede usarse como variable categórica adicional en modelos posteriores de análisis o visualización.
- Reproducción de pipelines en entornos sin GPU: al ser scikit-learn sobre datos tabulares, se ejecuta íntegramente en CPU y en contenedores ligeros, lo que facilita su integración en cuadernos de análisis o servicios internos de reporting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de acuerdo entre métodos de clustering: ARI = 0,35 entre K-Means y Ward, y un único cluster denso más un 5 % de ruido con DBSCAN. No se proporcionan métricas de calidad interna como silhouette score, Davies-Bouldin ni inercia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier GPU consumer y en cualquier CPU convencional; el repositorio ocupa 0,0 GB.
- Opciones de despliegue: carga directa con `joblib.load()` en Python 3.14 con scikit-learn 1.9.0, pandas 3.0.3, numpy 2.4.6 y joblib 1.5.3; integrable en notebooks, scripts o servicios Python.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por la naturaleza del modelo (K-Means con 4 centroides y 4 dimensiones) la inferencia es prácticamente instantánea, pero no se aportan cifras medidas.
- Requisito crítico de compatibilidad: la versión de scikit-learn debe coincidir con la usada en el entrenamiento (1.9.0) para evitar advertencias o fallos al deserializar el pipeline.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio autor compara internamente tres algoritmos sobre el mismo dataset, cuyos resultados se resumen a continuación:

| Metodo | Resultado reportado |
|---|---|
| K-Means (k = 4) | Modelo publicado; 4 regimenes con reparto 30,1 % / 17,3 % / 34,7 % / 17,9 % |
| Clustering jerarquico (Ward) | Acuerdo con K-Means: ARI = 0,35 |
| DBSCAN | Un único cluster denso más 5 % de ruido |

## Limitaciones y advertencias

- No sirve para forecasting de precios ni de asequibilidad, ni para decisiones de inversión: los regímenes describen un ano, no predicen el siguiente.
- No permite ranking de países por asequibilidad: las variables de entrada son relativas a la historia de cada país y los índices subyacentes no son comparables entre países.
- No aplica a ciudades, regiones ni propiedades individuales: el modelo se entrenó solo con medias nacionales.
- No debe usarse con países ausentes del entrenamiento o con historiales muy cortos, ya que la variable principal requiere una media de largo plazo (1977-2024) contra la que comparar.
- No existe etiqueta de ruido: anos atípicos se fuerzan a uno de los cuatro regímenes, lo que puede producir asignaciones engañosas en episodios extremos.
- El acuerdo moderado con Ward (ARI = 0,35) indica que la partición no es única ni robusta frente a cambios de algoritmo; la estabilidad de los clusters no se documenta con métricas internas.
- La licencia del modelo es MIT, pero el dataset de entrenamiento tiene licencia CC BY-SA 4.0, lo que impone obligaciones de atribución y compartir igual sobre los datos derivados.
- Riesgo de sesgo de cobertura: 26 países, mayoritariamente OCDE, con eliminación de anos de hiperinflación en Israel, Croacia y Eslovenia, lo que reduce la representatividad de economías con inflación extrema.
- No se documentan sesgos adicionales, riesgos de alucinación (no aplica al no generar texto) ni restricciones de idioma (no procesa lenguaje).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day3-group8-market-regimes
- Dataset agrupado: https://huggingface.co/datasets/iaac-maai/day3-group8-housing-market-regimes
- Repositorio GitHub con el análisis completo: https://github.com/iaac-maai/Group08_Day03_AI-Methods (notebook `notebook/unsupervised_learning.ipynb`)
- Repositorio de limpieza de datos (Day 1): https://github.com/iaac-maai/Group8-day1-assignment
- Dataset original en Kaggle: https://www.kaggle.com/code/tolstoyjustin/forecasting-housing-affordability-to-2035/input
- Modelo del Day 2 (forecasting de asequibilidad): https://huggingface.co/iaac-maai/day2-group8-affordability
