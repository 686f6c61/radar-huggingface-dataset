# akshara-ns/snack-category-automl

## Resumen

Snack category automl es un clasificador tabular entrenado con scikit-learn que predice a cual de cinco categorias de aperitivos envasados (`candy`, `chips`, `cookies`, `crackers`, `granola_bars`) pertenece un producto, usando unicamente los ocho valores numericos de su etiqueta de informacion nutricional: tamano de racion, raciones por envase, calorias, grasa total, sodio, carbohidratos, azucar y proteina. Lo desarrolla la usuaria de HuggingFace akshara-ns en el contexto de la asignatura 24-679 Designing & Prototyping AI Systems, y el modelo final se selecciono mediante una busqueda AutoML con Optuna sobre seis familias de modelos clasicos de scikit-learn.

No es un modelo de lenguaje ni una red neuronal: es un pipeline serializado con joblib que encadena un `StandardScaler` y un SVM de kernel lineal (`C = 8.5514`, `gamma = 'auto'`), elegido por TPE sampler con semilla 24679 tras 150 trials y menos de 600 segundos de busqueda. Su relevancia es metodologica mas que de producto: ilustra como disenar una evaluacion consciente de la fuga de informacion cuando el conjunto de datos es mayoritariamente sintetico, y como una metrica de validacion optimista puede no sobrevivir al conjunto de test.

El dato clave para interpretar sus resultados es que el corpus contiene solo 30 aperitivos reales, ampliados hasta 429 filas mediante jitter aditivo, escalado multiplicativo, mixup intraclase e interpolacion entre vecinos. El modelo esta pensado como demostracion academica y referencia de implementacion, no como herramienta de etiquetado nutricional ni de asesoramiento dietetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVM de kernel lineal dentro de un `Pipeline` de scikit-learn (preprocesado `StandardScaler` + clasificador `SVC`); no es una red neuronal |
| Parametros totales | no disponible (modelo clasico; hiperparametros seleccionados: `svc_C = 8.55142672640755`, `svc_kernel = 'linear'`, `svc_gamma = 'auto'`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tabular de 8 caracteristicas float, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (no se publican cuantizaciones; el artefacto es un objeto joblib en coma flotante) |
| Idiomas soportados | no disponible (las etiquetas de clase estan en ingles: `candy`, `chips`, `cookies`, `crackers`, `granola_bars`) |
| Licencia | apache-2.0 |
| Formato de pesos | joblib (`model.joblib`, descargable via `huggingface_hub.hf_hub_download`) |

## Arquitectura y entrenamiento

El modelo es un clasificador supervisado de tipo SVM lineal con `C = 8.55142672640755`, `kernel = 'linear'` y `gamma = 'auto'`, empaquetado junto a un `StandardScaler` dentro de un unico `Pipeline` serializado con joblib. La entrada es un vector de 8 floats en orden estricto: `serving_size_g`, `servings_per_container`, `calories`, `total_fat_g`, `sodium_mg`, `carbs_g`, `sugar_g`, `protein_g`. Las columnas de procedencia (`source_id`, `parent_id`, `augmentation`, etc.) se excluyeron de forma deliberada porque codifican la estructura de aumento de datos y filtrarian la etiqueta.

La seleccion de modelo se hizo con `optuna==5.0.0` (TPE sampler, semilla 24679), con un presupuesto de 150 trials o 600 segundos de reloj; los 150 trials se completaron. El espacio de busqueda cubria conjuntamente la familia de modelo y sus hiperparametros entre seis familias: regresion logistica, Random Forest, Extra-Trees, HistGradientBoosting, SVM y kNN. La validacion fue una validacion cruzada de 4 folds agrupada por aperitivo padre, aplicando la regla de "ambos padres" en cada fold. El objetivo optimizado fue macro-F1 calculado **solo sobre filas reales**.

Esa decision metodologica es la innovacion destacable del trabajo. Como las filas sinteticas de un fold son copias con jitter de los aperitivos reales del mismo fold, puntuar sobre ellas premia la memorizacion de artefactos de aumento. Ejecutando la misma busqueda de las dos formas, los resultados difieren de manera sustancial:

| Estrategia de puntuacion en CV | Macro-F1 en CV | Macro-F1 en test (todas las filas) | Macro-F1 en test (solo reales) |
|---|---|---|---|
| Todas las filas | 0.8788 | 0.7333 | 0.7333 |
| Solo filas reales | 0.8167 | 0.7531 | 0.8933 |

La busqueda puntuada sobre todas las filas producia una puntuacion de CV mas alta que no se trasladaba al conjunto de test; se selecciono la busqueda restringida a filas reales.

## Capacidades

- Clasificacion tabular multiclase: asigna un producto a una de cinco categorias de aperitivo a partir de ocho valores nutricionales.
- Inferencia determinista y de coste minimo: una llamada a `pipe.predict(x)` sobre un array de NumPy, sin acelerador.
- Integracion directa en codigo Python: el pipeline incluye el escalado, por lo que no requiere preprocesado externo en el momento de la inferencia.
- Reproducibilidad documentada: semilla, presupuesto de trials, espacio de busqueda y reglas de particion estan explicitados.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades multilingues declaradas.

## Casos de uso

- Demostracion docente de AutoML tabular: reproducir la busqueda Optuna sobre seis familias de scikit-learn y comparar el efecto de distintas funciones objetivo, tal como se hizo en la asignatura.
- Referencia de evaluacion sin fuga de informacion: usar el diseno de particiones (regla de ambos padres para mixup, agrupacion por aperitivo padre, 93 filas descartadas por cruzar la frontera) como plantilla en proyectos con datos sinteticos derivados.
- Prueba de concepto de etiquetado de catalogo: dado un formulario nutricional de ocho campos, sugerir una categoria de marketing para un producto envasado, siempre con revision humana.
- Baseline de comparacion en proyectos de clasificacion tabular con pocas clases y muestra efectiva muy reducida: sirve como suelo de rendimiento frente a modelos mas complejos.
- Ejercicio de analisis de compromisos estadisticos: ilustrar con un caso real por que una puntuacion de validacion alta puede no generalizar, y por que conviene citar intervalos de confianza en lugar de estimaciones puntuales.
- Componente de juguete en un pipeline de ensayo: validar el cableado de descarga desde HuggingFace Hub, carga con joblib y prediccion por lotes antes de sustituirlo por un modelo en produccion.
- Analisis de desequilibrio por clase: el desglose por clase en test muestra un recall de 0.083 en `candy`, lo que lo convierte en un caso util para estudiar errores asimetricos con soporte bajo.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el model-index y en su model card:

| Conjunto | n | Macro-F1 | Accuracy |
|---|---|---|---|
| CV (seleccion de modelo, solo filas reales) | no disponible | 0.8167 | no disponible |
| Test, todas las filas | 90 | 0.7531 | 0.8556 |
| Test, solo aperitivos reales | 10 | 0.8933 | 0.9 |

Intervalo de confianza bootstrap al 95 % sobre la macro-F1 de aperitivos reales (5000 remuestreos): 0.600 - 1.000. El autor advierte que el intervalo es amplio porque n = 10 y que debe citarse el intervalo, no la estimacion puntual.

Desglose por clase en test, todas las filas:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| candy | 1.000 | 0.083 | 0.154 | 12 |
| chips | 0.929 | 1.000 | 0.963 | 26 |
| cookies | 0.522 | 1.000 | 0.686 | 12 |
| crackers | 1.000 | 0.929 | 0.963 | 28 |
| granola_bars | 1.000 | 1.000 | 1.000 | 12 |
| accuracy | - | - | 0.856 | 90 |
| macro avg | 0.890 | 0.802 | 0.753 | 90 |
| weighted avg | 0.916 | 0.856 | 0.823 | 90 |

No se han publicado resultados por familia de modelo (logreg, Random Forest, Extra-Trees, HistGradientBoosting, SVM, kNN) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. No requiere GPU; el entrenamiento y la inferencia se ejecutan en CPU.
- GPU recomendadas: ninguna. El autor ejecuto la busqueda completa en el runtime de CPU de Google Colab, sin acelerador.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0.0 GB y el artefacto es un objeto joblib de un SVM lineal sobre 8 caracteristicas.
- Tiempo de computo declarado: la busqueda completa de 150 trials se cierra muy por debajo del limite de 600 segundos de reloj; el cuaderno completo se ejecuta en unos pocos minutos.
- Opciones de despliegue: carga directa con `joblib.load` sobre el fichero `model.joblib` descargado con `huggingface_hub`, o envoltorio propio como servicio (por ejemplo, un endpoint de FastAPI). No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

No se han publicado puntuaciones comparables de los otros modelos evaluados en la busqueda AutoML. Las alternativas exploradas en el mismo espacio de busqueda, con presupuesto y particiones identicos, fueron:

| Alternativa | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SVM lineal (modelo seleccionado) | hiperparametros: C = 8.5514, kernel lineal | no aplica | apache-2.0 | pesos en HuggingFace (`model.joblib`) |
| Regresion logistica | buscados por Optuna; valores no publicados | no aplica | no disponible | no disponible como artefacto publicado |
| Random Forest | buscados por Optuna; valores no publicados | no aplica | no disponible | no disponible como artefacto publicado |
| Extra-Trees | buscados por Optuna; valores no publicados | no aplica | no disponible | no disponible como artefacto publicado |
| HistGradientBoosting | buscados por Optuna; valores no publicados | no aplica | no disponible | no disponible como artefacto publicado |
| kNN | buscados por Optuna; valores no publicados | no aplica | no disponible | no disponible como artefacto publicado |

No se dispone de comparaciones con modelos de terceros sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- Tamano de muestra efectivo de 30 aperitivos reales. Las 399 filas restantes son transformaciones deterministas de esos 30 productos, por lo que no aportan informacion independiente.
- Sesgo de muestreo: los 30 productos fueron fotografiados por una unica persona en un unico lugar. Las marcas, las convenciones de racion y las normas de categorizacion varian por pais y por distribuidor, de modo que el modelo codifica una sola estanteria.
- Rendimiento muy inestable en clases con soporte bajo: `candy` obtiene un recall de 0.083 con precision de 1.000, lo que indica que el modelo practicamente no detecta esa clase. `cookies` muestra el patron inverso, con precision de 0.522.
- Intervalo de confianza amplio: 0.600 - 1.000 para la macro-F1 sobre aperitivos reales con n = 10. La estimacion puntual de 0.8933 no debe presentarse como una cifra fiable.
- Riesgo de sobreajuste a la estructura de aumento de datos si se reentrena sin replicar la regla de "ambos padres" y sin excluir las columnas de procedencia.
- Uso previsto restringido: el autor declara explicitamente que el modelo no debe emplearse para asesoramiento nutricional, guia dietetica, decisiones de seguridad alimentaria, etiquetado regulatorio ni en ningun producto orientado al consumidor.
- Advertencia etica: el modelo clasifica una categoria de marketing y no dice nada sobre si un alimento es saludable, apto para una dieta concreta o seguro ante una alergia.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero la propia model card excluye el uso en productos de cara al consumidor, por lo que la idoneidad practica es mas estrecha que la licencia.
- Requisito estricto de formato de entrada: los 8 floats deben entregarse en el orden exacto documentado; un cambio de orden produce predicciones silenciosamente incorrectas.
- Idiomas no declarados; las etiquetas de salida estan en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akshara-ns/snack-category-automl
- Conjunto de datos: https://huggingface.co/datasets/shanexf/packaged-snack-nutrition-data
- Repositorio adicional, paper, blog o demo: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas de soporte de Microsoft sin relacion con el artefacto.
