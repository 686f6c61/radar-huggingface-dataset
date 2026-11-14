# iaac-maai/day3-group3-mumbai-rental-profiles

## Resumen

`iaac-maai/day3-group3-mumbai-rental-profiles` es un modelo de agrupamiento no supervisado publicado en Hugging Face por el grupo 3 del curso AI Methods I del programa MaAI 2026/27 del IAAC (Instituto de Arquitectura Avanzada de Cataluña). No se trata de un modelo de lenguaje ni de una red neuronal: es un pipeline de scikit-learn que combina imputación por mediana, transformación logarítmica del área, estandarización y K-Means con k=5 para segmentar perfiles físicos de viviendas de alquiler en Mumbai.

El modelo resuelve un problema acotado de analítica exploratoria: dado un inmueble descrito por tres variables numéricas (área en pies cuadrados, número de dormitorios y número de baños), devuelve un identificador de clúster entero de 0 a 4 que corresponde a un perfil descriptivo predefinido. Se entrenó sobre una instantánea de 18.846 anuncios, sin separación de test ni variable objetivo supervisada, por lo que su utilidad es la segmentación descriptiva y no la predicción de precios.

Su relevancia es limitada fuera del contexto docente y del análisis urbanístico concreto: es un artefacto pequeño (repo de 0,0 GB), reproducible (random_state=42, k=5, n_init=20) y con licencia MIT, pero no soporta transformación de nuevas coordenadas t-SNE, no estima rentas y sus identificadores de clúster pueden cambiar tras un reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: imputación por mediana, ln(1 + area), estandarización y K-Means (k=5, n_init=20, random_state=42) |
| Parametros totales | No disponible (no es una red neuronal; el artefacto contiene centroides y parámetros de preprocesado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No disponible (no aplica; artefacto de joblib) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT (el código y el modelo); los datos de origen retienen atribución CC BY 4.0 |
| Formato de pesos | joblib (`model.joblib`), acompañado de `cluster_names.json` |

## Arquitectura y entrenamiento

El pipeline es un `Pipeline` de scikit-learn con tres etapas secuenciales sobre las variables `Area_num`, `BHK_num` y `Bathrooms_num`: imputación de valores faltantes numéricos por mediana, aplicación de ln(1 + area) y estandarización de las tres características. Sobre ese espacio preparado se ajusta K-Means con k=5, n_init=20 y random_state=42. Se retuvieron los 18.846 anuncios completos; los 15 valores ausentes de baños se imputan a 2 dentro del pipeline ajustado. Los balcones se excluyen porque más de la mitad de sus valores faltan. Rent, amueblamiento, orientación y tipo de propiedad no intervienen en el agrupamiento y solo se usan a posteriori para describir los resultados.

Para la evaluación interna se ajustó K-Means con k de 2 a 8 sobre el conjunto completo y se calculó la silueta sobre una muestra fija aleatoria de 3.000 filas (semilla 42): k=5 obtiene 0,5793 frente a 0,5719 de k=4, con inercia de 6.962,91 en el conjunto completo para k=5. Una comparación separada reajusta preprocesado y clustering (K-Means y Ward jerárquico) sobre esa misma submuestra de 3.000 filas: siluetas de 0,5817 y 0,5732 y un ARI de acuerdo de 0,8839. La estabilidad se comprobó con cinco semillas (7, 21, 42, 84, 123), con ARI medio de asignación de 0,9922 (SD poblacional 0,0048), y con cinco reajustes sobre submuestras del 80 %, con ARI medio de 0,9910 (SD 0,0047). La ponderación equitativa de 2.478 tuplas físicas distintas arroja un ARI de 0,8415 frente a las asignaciones de referencia, lo que evidencia sensibilidad a perfiles repetidos. PCA se ajustó sobre el espacio de tres características preparado para visualización, reteniendo el 96,31 % de la varianza en sus dos primeros ejes; t-SNE se ejecutó con perplexity=40, init=pca, learning_rate=auto, max_iter=1000 y ángulo de Barnes-Hut de 0,5. Ningún embedding forma parte de las entradas de K-Means, y el mapa t-SNE exportado no puede transformar anuncios nuevos.

## Capacidades

- Asignación de un identificador de clúster entero de 0 a 4 a un inmueble descrito por área, dormitorios y baños.
- Imputación automática por mediana de valores faltantes en `Bathrooms_num`.
- Transformación logarítmica y estandarización internas, de modo que el llamante pasa valores en unidades originales.
- Predicción sobre lotes de filas mediante un `pandas.DataFrame` con exactamente las columnas `Area_num`, `BHK_num` y `Bathrooms_num`.
- Recuperación de la etiqueta descriptiva de cada clúster a través de `cluster_names.json`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.
- No devuelve estimaciones de renta, probabilidades, etiquetas de amueblamiento ni coordenadas t-SNE.

## Casos de uso

- **Segmentación exploratoria de cartera inmobiliaria:** introducir un lote de anuncios con área, dormitorios y baños para obtener los cinco perfiles físicos del mercado de Mumbai y analizar su distribución por zona o proveedor.
- **Etiquetado previo a análisis descriptivo de rentas:** asignar cada inmueble a un clúster y calcular después la renta mediana y el rango intercuartílico por grupo, tal como hace el propio autor en su material de referencia.
- **Filtro de calidad en ingestas de datos:** validar que un anuncio entrante cae en un perfil físicamente coherente (por ejemplo, detectar áreas o recuentos anómalos antes de publicarlos), recordando que el pipeline no impone reglas de elegibilidad y exige validar áreas y recuentos positivos externamente.
- **Docencia y reproducción de pipelines de clustering:** servir como ejemplo reproducible de preprocesado con imputación, transformación logarítmica y estandarización más K-Means, con métricas internas documentadas (silueta, inercia, ARI).
- **Análisis urbanístico comparado:** usar los cinco perfiles como taxonomía fija para comparar la oferta de alquiler entre barrios de Mumbai en un estudio académico, con la cautela de que los IDs no tienen significado ordinal.
- **Prototipado rápido de un recomendador por similitud de perfil:** asignar a un usuario el clúster correspondiente a sus requisitos físicos y recuperar anuncios del mismo grupo antes de aplicar criterios de precio o ubicación.
- **Generación de variables derivadas para modelos posteriores:** emplear el ID de clúster como característica categórica en un modelo supervisado de predicción de renta que se entrene por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje. Las métricas internas documentadas por el autor son las siguientes:

| Metrica | Valor |
|---|---|
| Silueta k=5 (muestra fija de 3.000 filas) | 0,5792832075113192 |
| Silueta k=4 (misma muestra) | 0,5718932442523518 |
| Inercia en conjunto completo k=5 | 6.962,908980584956 |
| Silueta K-Means k=5 en submuestra de comparación | 0,5817217246340777 |
| Silueta Ward k=5 en submuestra de comparación | 0,573165655223993 |
| ARI K-Means vs. Ward (k=5) | 0,8839211748987167 |
| ARI medio entre cinco semillas | 0,9922043456759448 (SD 0,004798840195798869) |
| ARI medio con submuestras del 80 % | 0,9910121873666575 (SD 0,0047200014888221535) |
| ARI con tuplas físicas distintas ponderadas | 0,8414894188661575 |
| Varianza retenida por PCA en dos ejes | 96,3069915 % |

Estas cifras son comprobaciones internas exploratorias; el ARI mide acuerdo entre particiones, no precisión predictiva, y no existe evaluación supervisada con train/test.

## Requisitos de hardware

- No requiere GPU. La inferencia es una transformación lineal y una asignación al centroide más cercano sobre tres características.
- VRAM estimada: 0 GB en GPU dedicada; el artefacto ocupa una fracción mínima de memoria RAM (el repositorio figura como 0,0 GB).
- CPU suficiente para cualquier portátil actual; el coste dominante es la deserialización de `model.joblib` con joblib.
- Entorno reproducible declarado: Python 3.12.14, scikit-learn 1.9.1, NumPy 2.5.4, pandas 3.1.0, SciPy 1.18.1 y joblib 1.6.0, con `requirements.txt` para el entorno de análisis completo.
- Despliegue mediante joblib directamente en Python; no aplican vLLM, llama.cpp, Ollama ni TGI. Para servir predicciones en red habría que envolver el artefacto en un servicio propio (por ejemplo, FastAPI).
- Latencia y throughput no publicados; para lotes pequeños será del orden de microsegundos a milisegundos por fila en CPU, sin datos medidos en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Variables de entrada | k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| day3-group3-mumbai-rental-profiles | K-Means sobre 3 características físicas | Area_num, BHK_num, Bathrooms_num | 5 | MIT | Hugging Face |
| Ward jerárquico (referencia interna del autor) | Clustering aglomerativo | Mismas 3 características | 5 | No aplica (método) | Implementado en el notebook |
| PCA (referencia interna del autor) | Reducción de dimensionalidad | Mismas 3 características | No aplica | No aplica (método) | Implementado en el notebook |
| t-SNE (referencia interna del autor) | Visualización no paramétrica | Mismas 3 características | No aplica | No aplica (método) | Mapa exportado, sin transformación de nuevos datos |

No se dispone de información sobre otros modelos publicados comparables de segmentación de perfiles de alquiler en Mumbai en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generación de texto, razonamiento, código y capacidades multilingües; cualquier expectativa en ese sentido es un error de categoría.
- No estima rentas, probabilidades ni etiquetas de amueblamiento; solo devuelve un ID de clúster de 0 a 4.
- Los IDs no tienen significado ordinal y pueden cambiar tras un reentrenamiento; deben interpretarse mediante `cluster_names.json` de la revisión concreta.
- El pipeline asume entradas numéricas válidas y no aplica las reglas de elegibilidad para llamantes externos; es necesario validar áreas y recuentos positivos antes de predecir. La consistencia de unidades del área (pies cuadrados según la fuente) no está verificada.
- El modelo se ajustó sobre la instantánea completa sin separación de test ni variable objetivo, por lo que no existe medida de precisión predictiva; las métricas de silueta y ARI son internas y exploratorias.
- k=5 es una interpretación de trabajo, no una verdad de referencia verificada; el codo se sitúa entre cuatro y cinco.
- Sensibilidad a perfiles repetidos: la ponderación equitativa de tuplas físicas distintas reduce el ARI a 0,8415, lo que indica que la partición está influida por la frecuencia de perfiles en el conjunto.
- El mapa t-SNE exportado no puede transformar anuncios nuevos; los huecos aparentes en t-SNE no establecen categorías de vivienda separadas.
- La deserialización de joblib/pickle puede ejecutar código: cargar solo artefactos de revisiones de confianza y fijar el SHA del commit en lugar de `main` para reproducibilidad.
- El autor advierte que un checksum detecta bytes alterados pero no establece autoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/day3-group3-mumbai-rental-profiles
- Dataset asociado: https://huggingface.co/datasets/iaac-maai/group3-day3-mumbai-rental-profiles
- Repositorio GitHub: https://github.com/iaac-maai/group-3-day3-assignment
