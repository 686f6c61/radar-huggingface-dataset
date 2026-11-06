# iaac-maai/group3-day2-mumbairental

## Resumen

Este modelo no es un modelo de lenguaje, sino un modelo de regresión tabular que estima el alquiler mensual anunciado de inmuebles en Mumbai (India) a partir de ocho atributos de la propiedad: superficie, número de habitaciones, baños, balcones, estado de amueblado, orientación, ciudad y tipo de propiedad. Es un pipeline de scikit-learn que combina imputación de valores faltantes, codificación one-hot de variables categóricas y un Random Forest de 200 árboles con profundidad máxima de 10.

Fue desarrollado por un equipo de estudiantes (Ahmed Belahcen, Nandini Rathod, Sanjana Kiran y Akanksha Dhumal) como ejercicio educativo para la asignatura AI Methods I del máster MaAI 2026/27 del IAAC (Institute for Advanced Architecture of Catalonia). El artefacto publicado es un archivo `model.joblib` que contiene el pipeline completo ya ajustado, con licencia MIT.

Su relevancia es principalmente didáctica: sirve como ejemplo completo y reproducible de un flujo de regresión tabular (limpieza, preprocesamiento, entrenamiento, exportación y documentación con model card), y como caso de estudio de los problemas típicos de datos scrapeados, como unidades mixtas no verificadas y categorías con ortografía inconsistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline sklearn: ColumnTransformer (imputacion + one-hot) + RandomForestRegressor |
| Parametros totales | no disponible (no aplica: modelo clasico de arboles) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (metadatos y documentacion; la entrada es tabular, no texto) |
| Licencia | MIT (modelo); datos de entrenamiento bajo CC BY 4.0 |
| Formato de pesos | joblib (`model.joblib`, pipeline completo ajustado) |

Detalles adicionales del bosque: `n_estimators=200`, `max_depth=10`, `min_samples_leaf=5`, `criterion="squared_error"`, `max_features=1.0`, `bootstrap=True`, `random_state=42`, `n_jobs=1`.

## Arquitectura y entrenamiento

El modelo es un Random Forest Regressor de scikit-learn, un ensamble de 200 arboles de decision entrenados con bootstrap sobre submuestras del dataset, cuyo criterio de division es el error cuadratico medio. La regularizacion se logra mediante `max_depth=10` y `min_samples_leaf=5`, que limitan la profundidad de cada arbol para reducir el sobreajuste. No se trata de una red neuronal: no hay tokens, contexto ni cuantizacion aplicables.

El preprocesamiento es un `ColumnTransformer` con dos ramas: las variables numericas (`Area_num`, `BHK_num`, `Bathrooms_num`, `Balconies_num`) reciben imputacion por mediana del conjunto de entrenamiento (1100, 2, 2 y 1 respectivamente) sin escalado; las categoricas (`Furnished_clean`, `Facing`, `Location`, `Property Type`) reciben imputacion por moda seguida de `OneHotEncoder(handle_unknown="ignore")`, de modo que las categorias no vistas se codifican como vector de ceros en lugar de lanzar un error.

Los datos de entrenamiento provienen del dataset Property Rental Listings de Kaggle (subido por Harshal H, scrapeado de Magicbricks segun el autor del dataset), filtrado a la ciudad de Mumbai. El snapshot de entrenamiento es `data/mumbai_cleaned.csv` en el repositorio de GitHub del equipo. El objetivo (`Price_num`) es el alquiler mensual anunciado en rupias indias, sin transformacion logaritmica, con valores observados entre 1.800 y 3.800.000 INR al mes. No se emplearon tecnicas de RLHF ni ajuste por preferencias (no aplican a este tipo de modelo).

## Capacidades

- Regresion tabular de salida unica: devuelve un array NumPy 1D con un alquiler mensual estimado en INR por cada fila de entrada.
- Manejo robusto de valores faltantes: imputa medianas (numericas) y modas (categoricas) sin requerir limpieza previa de NaN.
- Tolerancia a categorias desconocidas: el `OneHotEncoder(handle_unknown="ignore")` evita errores en inferencia ante valores no vistos, aunque la prediccion resultante no es fiable.
- Reproducibilidad: `random_state=42` fijo y SHA-256 documentado tanto del modelo (`b4193b09cc1316008936387fd28f65b07960447feab5d1eaa279ed8745791262`) como del snapshot de datos.
- No soporta texto libre, vision, audio, tool calling ni agentes: la entrada debe ser un `pandas.DataFrame` con exactamente ocho columnas con nombres predefinidos y valores ya parseados.
- No proporciona estimaciones de incertidumbre calibradas ni intervalos de confianza.

## Casos de uso

- Docencia de regresion tabular: el caso de uso principal. Estudiantes pueden cargar el pipeline con `joblib.load`, inspeccionar los pasos del `ColumnTransformer` y reproducir el flujo completo de entrenamiento a inferencia.
- Ejercicio de evaluacion de modelos: el notebook del equipo incluye experimentos comparativos (regresion lineal, arbol de decision con R² de 0,611, Random Forest) utiles para discutir sesgo-varianza.
- Prototipado rapido de estimadores de alquiler: dado un inmueble con atributos similares a los listados de entrenamiento, se obtiene una estimacion de precio anunciado en una sola llamada a `predict`.
- Estudio de calidad de datos scrapeados: el dataset presenta posibles unidades mixtas (ft² frente a m²) y ortografia inconsistente en `Facing` (por ejemplo, `North - East` frente a `South -West`), lo que lo convierte en material realista para ensenar auditoria de datos.
- Ejemplo de model card rigurosa: la documentacion incluye procedencia byte a byte del artefacto, hash SHA-256, licencias separadas de modelo y datos, y usos fuera de alcance explicitos.
- Base para ejercicios de mejora: se puede reentrenar con transformacion logaritmica del objetivo, validacion cruzada por barrio o codificacion ordinal de `Facing` normalizada como practica guiada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las metricas `r2`, `mae` y `rmse` en los metadatos, pero no incluye sus valores numericos para el Random Forest publicado. El unico dato de rendimiento citado corresponde a un experimento educativo distinto (un arbol de decision de profundidad 5 con R² de 0,611), que no describe el modelo documentado en esta ficha.

## Requisitos de hardware

- VRAM: no aplica. El modelo se ejecuta en CPU; un Random Forest de 200 arboles con profundidad 10 ocupa tipicamente unos pocos megabytes de RAM.
- GPU recomendadas: ninguna; no es necesario hardware acelerado.
- Consumer hardware: funciona en cualquier portatil o escritorio moderno con Python 3, pandas, numpy y scikit-learn instalados.
- Despliegue: carga directa con `joblib.load("model.joblib")` en un script o servicio Python; no requiere vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos de lenguaje, no aplicables aqui). El tamano del repositorio es 0,0 GB segun Hugging Face, lo que confirma un artefacto muy ligero.
- Latencia y throughput: no disponibles; por la naturaleza del modelo (200 arboles poco profundos, `n_jobs=1`), la inferencia por fila es del orden de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Aspecto | group3-day2-mumbairental (Random Forest) | mumbai_rental_pipeline (LinearRegression, revision anterior) | Arbol de decision (experimento del notebook) |
|---|---|---|---|
| Tipo | Ensamble de 200 arboles | Regresion lineal con escalado numerico | Arbol de decision, profundidad 5 |
| Tarea | Regresion tabular (alquiler Mumbai) | Regresion tabular (alquiler Mumbai) | Regresion tabular (alquiler Mumbai) |
| Rendimiento | no disponible | no disponible | R² 0,611 (reportado en la model card) |
| Licencia | MIT | MIT | no disponible |
| Disponibilidad | Publicado en Hugging Face como `model.joblib` | Export anterior, reemplazado en el repo | Solo en el notebook educativo |

No existen alternativas publicadas de terceros para esta tarea concreta; modelos comerciales de valoracion inmobiliaria no son comparables directamente por falta de datos publicos.

## Limitaciones y advertencias

- Ambito geografico estricto: la columna `Location` solo contiene `Mumbai` en el entrenamiento; el modelo no es valido para otras ciudades ni paises.
- Predice el precio anunciado en el listado, no un valor de mercado independiente ni un precio de alquiler acordado; no debe usarse como tasacion vinculante.
- Posibles unidades mixtas en `Area_num`: el dataset de Kaggle declara pies cuadrados, pero el analisis del Dia 1 identifico anomalias de unidades no convertidas deliberadamente. Hay que pasar la convencion original y no introducir valores en m².
- Categorias no vistas: valores desconocidos de `Facing` o `Property Type` se codifican como ceros sin error, produciendo predicciones potencialmente poco fiables.
- Ortografia inconsistente en `Facing` (espacios variables como `North - East`), documentada en `evaluation.json`; conviene normalizar antes de inferir.
- Sin incertidumbre calibrada: no ofrece intervalos de confianza ni estimacion de error por prediccion.
- Rango de entrenamiento acotado: superficie de 250 a 14.500 ft², 1–5 BHK, 1–6 banos, 1–5 balcones; predicciones fuera de estos rangos no estan garantizadas.
- Obsolescencia temporal: los datos son un snapshot scrapeado de Magicbricks; los precios de mercado actuales de Mumbai pueden diferir sustancialmente.
- Fuera de alcance declarado: decisiones automatizadas de elegibilidad de vivienda, concesion de prestamos o valoraciones contractuales.
- Licencia: el modelo es MIT (uso comercial permitido con atribucion), pero el dataset de entrenamiento es CC BY 4.0, que exige atribucion al reutilizar los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/group3-day2-mumbairental
- Repositorio de entrenamiento (Day 2): https://github.com/iaac-maai/group-3-day2-assignment/tree/6b2a6d17af8c4d8950f12e60dc97f8b9a8d4dbc1
- Snapshot de datos de entrenamiento: https://github.com/iaac-maai/group-3-day2-assignment/blob/6b2a6d17af8c4d8950f12e60dc97f8b9a8d4dbc1/data/mumbai_cleaned.csv
- Repositorio del equipo (Day 1): https://github.com/iaac-maai/Group3-day1assignment
- Guia de la model card (asignatura): https://github.com/iaac-maai/ai-methods-1-2026/blob/main/Day_2/submissions/README.md#6-the-model-card
- Dataset de Kaggle: https://www.kaggle.com/datasets/harshalhonde/property-rental-listings-dataset
- Licencia CC BY 4.0 de los datos: https://creativecommons.org/licenses/by/4.0/
