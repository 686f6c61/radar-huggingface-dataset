# bolewara/product-image-feature-analyzer

## Resumen
El modelo `bolewara/product-image-feature-analyzer` es un pipeline de aprendizaje no supervisado compuesto por un detector de anomalías basado en Isolation Forest y un agrupador KMeans, entrenado sobre características de imagen de 100 dimensiones obtenidas mediante PCA a partir de un conjunto de 75.000 imágenes de productos. Fue desarrollado por Anuj Bolewar (usuario `bolewara` en Hugging Face y Kaggle) como parte de un proyecto para el Amazon ML Challenge 2025, con el objetivo de analizar y estructurar grandes volúmenes de datos visuales de productos.

El modelo no es un transformador ni un modelo generativo, sino un artefacto de scikit-learn que opera sobre vectores numéricos precalculados. Su función principal es doble: por un lado, identificar imágenes atípicas o defectuosas dentro del catálogo (detección de anomalías) y, por otro, agrupar las imágenes en ocho clústeres según sus características visuales latentes. Esto lo hace relevante para tareas de control de calidad, organización de catálogos y análisis exploratorio de datos visuales en entornos de comercio electrónico.

A pesar de su especificidad, el modelo sirve como ejemplo de un flujo de trabajo típico de ML clásico aplicado a visión por computadora, y su licencia MIT permite su reutilización y adaptación. No obstante, su utilidad fuera del contexto original (características PCA de 100 dimensiones de un dataset concreto) es limitada, ya que depende de la misma representación de entrada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Isolation Forest + KMeans (scikit-learn) |
| Parametros totales | no disponible (modelo no neuronal; componentes: IsolationForest, KMeans, StandardScaler) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | no disponible (no es un modelo de pesos cuantizables) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (`.joblib`) y `.npy` para arrays auxiliares |

## Arquitectura y entrenamiento
El modelo combina dos algoritmos clásicos de aprendizaje no supervisado de scikit-learn. Primero, un `StandardScaler` normaliza las características de entrada (100 columnas `img_pca_0` a `img_pca_99`). Después, un `IsolationForest` detecta anomalías con una contaminación fijada al 2% (1500 filas marcadas como anómalas de un total de 75.000). Paralelamente, un `KMeans` con k=8 agrupa las mismas características en ocho clústeres. La salida del modelo es una bandera de anomalía (1/-1) y una asignación de clúster (0-7).

El entrenamiento se realizó sobre el dataset `anujbolewar/product-image-features`, que contiene 75.000 filas y 102 columnas (100 características PCA más identificadores). No se dispone de información sobre el proceso de extracción de características original (probablemente mediante una red neuronal convolucional preentrenada), ni sobre el número de épocas o la configuración exacta de los hiperparámetros de los algoritmos. La evaluación reportada incluye la detección de 1500 anomalías y un valor de silueta calculado sobre un submuestreo del 10% de los datos, aunque no se especifica el valor numérico.

## Capacidades
- Detección de anomalías en vectores de características de imagen: identifica imágenes atípicas respecto al conjunto general.
- Agrupación no supervisada en 8 clústeres según similitud visual latente.
- Escalado y normalización de características mediante `StandardScaler`.
- Inferencia rápida al ser modelos clásicos de baja complejidad computacional.
- No soporta generación de texto, razonamiento, código, visión directa (solo trabaja sobre features precalculadas), ni tool calling.
- No es un modelo multimodal ni tiene capacidades de conversación.

## Casos de uso
- Control de calidad en catálogos de e-commerce: el modelo puede marcar automáticamente imágenes que se desvían del patrón visual mayoritario (por ejemplo, fotos borrosas, con fondo incorrecto o productos mal encuadrados), facilitando la revisión manual.
- Organización de inventario visual: los 8 clústeres permiten agrupar productos visualmente similares, lo que ayuda a crear categorías o subcategorías sin etiquetas previas.
- Detección de duplicados o imágenes corruptas: las anomalías pueden corresponder a archivos duplicados, imágenes rotas o capturas erróneas, permitiendo su limpieza.
- Análisis exploratorio de datasets visuales: antes de entrenar un modelo supervisado, este pipeline ayuda a entender la distribución de las características y a detectar outliers que podrían sesgar el entrenamiento.
- Preparación de datos para sistemas de recomendación: las asignaciones de clúster pueden usarse como características adicionales en un motor de recomendación de productos similares.
- Monitorización de cambios en el catálogo: si se incorporan nuevas imágenes, el modelo puede identificar si estas se ajustan a los patrones existentes o si representan novedades que requieren atención.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que se detectaron 1500 anomalías (2% de los datos) y que se calculó el coeficiente de silueta sobre un submuestreo del 10%, pero no se indica el valor obtenido. No hay comparación con otros modelos ni métricas estandarizadas como precisión, recall o F1, dado que es un problema no supervisado.

## Requisitos de hardware
- Al ser un modelo de scikit-learn con tres componentes (scaler, IsolationForest, KMeans), el requisito de hardware es mínimo.
- Inferencia en CPU: cualquier procesador moderno puede ejecutar predicciones en milisegundos para un solo vector de 100 dimensiones.
- Memoria RAM: los artefactos `.joblib` son pequeños (del orden de kilobytes o pocos megabytes), por lo que caben en cualquier sistema.
- No requiere GPU.
- Opciones de despliegue: se puede integrar en cualquier servicio Python usando `joblib`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Throughput: alto, pudiendo procesar miles de vectores por segundo en CPU.

## Comparativa con modelos similares
No se dispone de información sobre modelos directamente comparables en el mismo repositorio o en la literatura asociada. Dado que es un pipeline específico para un dataset concreto, no existen alternativas estandarizadas con las que compararlo. Se podría considerar como alternativas genéricas otros métodos de detección de anomalías como DBSCAN, One-Class SVM o autoencoders, pero no hay datos de rendimiento para establecer una comparación cuantitativa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias
- El modelo está entrenado exclusivamente sobre características PCA de 100 dimensiones de un dataset específico de imágenes de productos; no funcionará con otros tipos de entrada sin reentrenar.
- No hay información sobre la calidad de las características originales ni sobre el proceso de extracción, lo que limita la reproducibilidad.
- La detección de anomalías con un 2% de contaminación es un parámetro fijo que puede no ajustarse a otros contextos.
- El número de clústeres (k=8) se eligió sin una justificación documentada; podría no ser óptimo para otros datos.
- No se proporciona el valor del coeficiente de silueta, por lo que no se puede evaluar la calidad del agrupamiento.
- Al ser un modelo no supervisado, no hay métricas de precisión o recall; las anomalías detectadas podrían incluir falsos positivos.
- Licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No hay soporte para otros idiomas ni para procesamiento de texto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/bolewara/product-image-feature-analyzer
- Artículo en dev.to sobre la creación del dataset: https://dev.to/bolewara/building-a-75000-product-image-feature-dataset-for-the-amazon-ml-challenge-2025-5hgn
- Artículo en Medium sobre el mismo proyecto: https://medium.com/@bolewara/creating-a-75k-product-image-features-dataset-for-amazon-ml-challenge-my-journey-into-deep-9d57a8bbf54a
- Perfil del autor en Hugging Face: https://huggingface.co/bolewara/models
