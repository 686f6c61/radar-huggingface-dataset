# faizath/fetiai-v1-phiusiil-binclf-knn-scratch-500k

## Resumen

El modelo `fetiai-v1-phiusiil-binclf-knn-scratch-500k` es un clasificador tabular binario para detección de phishing en URLs, desarrollado por el grupo 16 de la asignatura IF3070 Foundations of Artificial Intelligence del STEI ITB (Indonesia). Se trata de una implementación de K-Nearest Neighbors (KNN) escrita desde cero con NumPy, sin depender de librerías de aprendizaje automático de alto nivel. El modelo recibe un vector de 49 características preextraídas de una URL (longitud, presencia de HTTPS, características del dominio, etc.) y devuelve un veredicto binario (legítima o phishing) junto con una puntuación de confianza.

El modelo se distribuye como un servicio HTTP autocontenido que incluye rutas de predicción individual y por lotes, así como endpoints de metadatos y salud. Está entrenado sobre el dataset PhiUSIIL (Phishing URL Dataset) de UCI, con datos estáticos de 2023-2024. Aunque el repositorio indica 500.001 parámetros, en un KNN estos no son pesos entrenables sino la matriz de referencia almacenada. El proyecto es un trabajo académico, no un producto de seguridad listo para producción, y sus autores lo advierten explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K-Nearest Neighbors (KNN) implementado desde cero con NumPy |
| Parametros totales | 500.001 (matriz de referencia, no pesos entrenables) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplica (modelo tabular, no de lenguaje) |
| Tipos de cuantizacion | No aplica (los datos se almacenan en punto flotante nativo) |
| Idiomas soportados | No disponible (el modelo opera sobre vectores numericos, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | NumPy .npz (matriz de referencia y etiquetas) |

## Arquitectura y entrenamiento

El modelo es un clasificador KNN clásico: no hay capas neuronales ni parámetros aprendidos mediante retropropagación. La "arquitectura" consiste en almacenar una matriz de referencia (los vectores de características del conjunto de entrenamiento, posiblemente reducidos o seleccionados) y, en el momento de la inferencia, calcular la distancia entre la entrada y cada punto de referencia para determinar los k vecinos más cercanos. La etiqueta se asigna por mayoría de votos ponderada o simple, y la puntuación de phishing se deriva de la proporción de vecinos clasificados como maliciosos.

El entrenamiento se realizó sobre el dataset PhiUSIIL, que contiene características de URLs legítimas y de phishing. Según la model card, se aplicó SMOTE (Synthetic Minority Over-sampling Technique) para equilibrar las clases y un proceso de ingeniería de características. El modelo se sirve a través de una API HTTP construida con Python, NumPy y pandas, empaquetada en Docker. El artefacto del modelo (1,0 MB) está incluido en el repositorio, de modo que no requiere un paso de descarga ni entrenamiento adicional para servir predicciones.

## Capacidades

- Clasificación binaria de URLs como legítimas o phishing a partir de un vector de 49 características numéricas.
- Inferencia individual (`POST /predict`) y por lotes de hasta 1000 filas (`POST /predict/batch`).
- Manejo de valores nulos: el servicio acepta entradas con campos ausentes y realiza imputación automática, indicando cuántas características se imputaron y la proporción de cobertura.
- Endpoint de metadatos (`GET /metadata`) que expone el contrato de características (los 49 nombres en orden) y las métricas del modelo.
- Autocomprobación de reproducibilidad: el servicio ejecuta una prueba con una fila dorada para verificar que el artefacto produce la predicción esperada antes de declararse listo.
- Despliegue sencillo mediante Docker, con la imagen que incluye el modelo integrado.
- No soporta procesamiento de texto ni de imágenes: la URL en sí nunca llega al modelo, solo sus características preextraídas.

## Casos de uso

- Prototipado academico de sistemas de deteccion de phishing: el modelo sirve como referencia didactica para entender como un clasificador KNN puede aplicarse a la seguridad web, permitiendo a estudiantes e investigadores reproducir el flujo completo de extraccion de caracteristicas, entrenamiento y despliegue.
- Evaluacion de pipelines de extraccion de caracteristicas: al ser un servicio HTTP con un contrato de entrada bien definido, puede integrarse en un sistema mayor que extraiga las 49 caracteristicas de una URL y las envie al modelo para comparar la calidad de distintas estrategias de extraccion.
- Pruebas de concepto de APIs de clasificacion: su estructura de endpoints (predict, batch, metadata, health) sirve como plantilla para disenar servicios de inferencia ligeros en entornos de desarrollo.
- Analisis de datos historicos de URLs: dado un conjunto de URLs ya caracterizadas, el modelo puede clasificarlas por lotes para estudios retrospectivos o para etiquetar datasets de entrenamiento de otros sistemas.
- Educacion en aprendizaje automatico: al estar implementado desde cero con NumPy, el codigo fuente es un recurso valioso para ensenar los fundamentos de KNN, SMOTE y el despliegue de modelos como servicios web.
- Integracion en entornos con recursos minimos: al no requerir GPU y tener un tamano de 1 MB, puede ejecutarse en dispositivos embebidos o contenedores con limitaciones de memoria para experimentos de clasificacion de URLs.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion son los declarados por el autor en la model card, sin verificacion independiente. Se evaluaron sobre el dataset PhiUSIIL.

| Metrica | Valor |
|---|---|
| Accuracy | 0,9804 |
| Precision (clase phishing) | 0,9814 |
| Recall (clase phishing) | 0,7593 |

No se han publicado resultados comparativos con otros modelos de deteccion de phishing en la informacion disponible. El recall de la clase phishing es notablemente inferior a la precision, lo que indica que el modelo tiende a clasificar como legitima una proporcion significativa de URLs maliciosas (falsos negativos). Este desequilibrio debe tenerse en cuenta en cualquier uso practico.

## Requisitos de hardware

- El modelo es extremadamente ligero: el artefacto ocupa 1,0 MB y la inferencia se realiza en CPU sin necesidad de GPU.
- Cualquier maquina con Python 3 y NumPy puede ejecutar el servicio; un contenedor Docker con menos de 256 MB de RAM es suficiente para cargar el modelo y atender peticiones.
- No se requieren GPUs especificas (A100, H100, RTX 4090, etc.). El modelo cabe en cualquier hardware consumer, incluidos Raspberry Pi o instancias cloud de nivel gratuito.
- Opciones de despliegue: el repositorio incluye un Dockerfile y un Makefile con comandos para instalar dependencias, ejecutar autocomprobaciones y lanzar el servidor. Tambien puede ejecutarse directamente con Python sin contenedor.
- La latencia por prediccion es del orden de milisegundos en CPU para una sola fila, dado el tamano reducido de la matriz de referencia. No se han publicado cifras exactas de throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo es una implementacion academica de KNN especifica para el dataset PhiUSIIL, y no se han publicado comparaciones con otros clasificadores de phishing (por ejemplo, basados en redes neuronales o gradient boosting). Por tanto, no es posible establecer una comparativa objetiva con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un producto de seguridad: los autores advierten explicitamente que se trata de una reimplementacion con fines de curso, entrenada con datos estaticos de 2023-2024, sin inteligencia de amenazas, sin listas negras y sin conocimiento de campanas de phishing posteriores a su entrenamiento. No debe utilizarse para decidir si un enlace es seguro.
- El recall de la clase phishing es bajo (0,7593), lo que implica que aproximadamente una de cada cuatro URLs maliciosas se clasificaria como legitima. Este sesgo hacia los falsos negativos es critico en un contexto de seguridad.
- El modelo no procesa la URL como texto: depende completamente de que un sistema externo extraiga correctamente las 49 caracteristicas. Si la extraccion falla o se realiza con criterios distintos a los del dataset original, el rendimiento se degrada.
- No hay soporte multilingue ni de contexto: es un clasificador tabular puro, sin capacidades de lenguaje natural.
- La licencia MIT permite uso comercial, pero la ausencia de garantias y la naturaleza academica del proyecto limitan su idoneidad para entornos de produccion sin una validacion exhaustiva.
- El repositorio no incluye informacion sobre el numero exacto de vecinos k utilizado, la metrica de distancia empleada ni el proceso de seleccion de la matriz de referencia. Estos detalles no estan disponibles en la documentacion publica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/faizath/fetiai-v1-phiusiil-binclf-knn-scratch-500k
- Aplicacion completa (repositorio GitHub): https://github.com/fetiai/phishing-url-classifier
- Demo en vivo: https://phiusiil.faizath.com
- Dataset PhiUSIIL (UCI): https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset
- Repositorio del modelo hermano con scikit-learn: https://github.com/fetiai/fetiai-v1-phiusiil-binclf-knn-skl-500k
