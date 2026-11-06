# Egrove/keyword-intent-classifier

## Resumen

El modelo `Egrove/keyword-intent-classifier` es un clasificador de intencion de busqueda orientado a SEO, publicado en Hugging Face bajo el identificador de Egrove. Su funcion es etiquetar palabras clave en una de cuatro categorias de intencion: informacional, navegacional, comercial y transaccional. No se trata de un modelo de lenguaje neuronal, sino de un pipeline clasico de `scikit-learn` serializado con `joblib`, lo que lo situa en la categoria de modelos ligeros de clasificacion de texto para produccion.

El autor declara un entrenamiento sobre 1.000.000 de registros de palabras clave ("10 lakh rows"), lo que constituye el principal argumento de venta del modelo. Sin embargo, no se especifica el algoritmo concreto utilizado (regresion logistica, SVM, naive Bayes, bosque aleatorio, etc.), ni la composicion del dataset, ni el proceso de anotacion de etiquetas. El repositorio tiene un tamano declarado de 0.0 GB, lo que sugiere un artefacto muy pequeno y coherente con un modelo lineal o de arboles sobre caracteristicas textuales.

Su relevancia practica es acotada: sirve para tareas de planificacion de contenido SEO, agrupacion de keywords por intencion y enrutamiento basico en pipelines de marketing. No compite con modelos de lenguaje generativos ni con clasificadores neuronales de proposito general; es una utilidad especializada, de licencia Apache 2.0 y de muy bajo coste computacional. La ausencia de benchmarks publicados y de metricas de evaluacion en la model card limita seriamente su adopcion en entornos donde se requiera garantia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de `scikit-learn` serializado con `joblib` (algoritmo concreto no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificacion por palabra clave, no generativa) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales; artefacto `joblib`/pickle) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los ejemplos estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pkl` (joblib) + modulo Python auxiliar `intent_preprocess.py` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de que se trata de un modelo de `scikit-learn` cargado mediante `joblib.load`. El autor no especifica el estimador utilizado, ni el esquema de vectorizacion (TF-IDF, bag-of-words, hashing, etc.), ni si existe una etapa de preprocesado propia implementada en el modulo `intent_preprocess.py` que acompana al artefacto. La necesidad de mantener ese modulo disponible al cargar el modelo indica que el pipeline depende de codigo Python personalizado, probablemente para normalizacion de texto o extraccion de caracteristicas.

El unico dato de entrenamiento declarado es el volumen: 1.000.000 de registros de palabras clave. No se indica el numero de tokens, la procedencia del corpus, el idioma de los datos, el metodo de etiquetado (manual, heuristico o debil), ni si hubo validacion cruzada o ajuste de hiperparametros. Tampoco se documenta ninguna innovacion tecnica como decodificacion especulativa, atencion lineal o destilacion; el modelo es, por definicion, un clasificador clasico sin componentes generativos.

## Capacidades

- Clasificacion de palabras clave en cuatro clases de intencion de busqueda: `informational`, `navigational`, `commercial` y `transactional`.
- Prediccion por lotes: el metodo `predict` acepta una lista de cadenas y devuelve una lista de etiquetas alineadas.
- Integracion directa en scripts Python 3.12 mediante `joblib` y `huggingface_hub.snapshot_download`.
- Preprocesado de texto encapsulado en el modulo `intent_preprocess.py`, que debe importarse junto al modelo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento explicito (thinking mode).
- No procesa vision, audio ni modalidades distintas de texto.
- Capacidad multilingue no declarada; los ejemplos de la model card son exclusivamente en ingles.

## Casos de uso

- Planificacion de contenidos SEO: clasificar un listado de keywords en las cuatro intenciones permite asignar cada termino a un formato de contenido (articulo para `informational`, pagina de producto para `transactional`, comparativa para `commercial`, landing de marca para `navigational`).
- Auditoria de carteras de keywords existentes: procesar por lotes decenas de miles de terminos de una herramienta como Search Console o Ahrefs y detectar desalineaciones entre la intencion declarada y el tipo de pagina que posiciona.
- Enrutamiento en pipelines de marketing: usar la etiqueta de intencion como señal para decidir si una keyword entra en un flujo de generacion de blog, de ficha de producto o de campana de pago.
- Segmentacion de informes de rendimiento: agrupar metricas de trafico y conversion por intencion para comparar el rendimiento de contenidos informacionales frente a transaccionales.
- Priorizacion en equipos de contenido: ordenar el backlog editorial segun la mezcla de intenciones detectada en el corpus de keywords del sitio.
- Filtrado previo en sistemas de recomendacion de contenido: descartar keywords con intencion `navigational` cuando el objetivo es captar trafico informacional o comercial.
- Etiquetado auxiliar en anotacion humana: generar una primera pasada automatica que los analistas revisan, reduciendo el coste de clasificacion manual en catalogos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que "no benchmark accuracy or F1 score is claimed", por lo que no existen cifras de exactitud, precision, recall ni F1 verificables para ninguna de las cuatro clases.

## Requisitos de hardware

- VRAM: no aplica; el modelo no utiliza GPU. Es un artefacto de `scikit-learn` que se ejecuta en CPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer: el repositorio declara 0.0 GB de tamano, por lo que el uso de memoria es marginal.
- Opciones de despliegue: scripts Python con `joblib`, servicios HTTP propios (FastAPI, Flask), funciones serverless o tareas batch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un clasificador clasico sobre cadenas cortas, se espera una latencia muy baja por prediccion, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Egrove/keyword-intent-classifier | Clasificador `scikit-learn` | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Falconsai/intent_classification | Clasificador neuronal (transformers) | no disponible | no disponible | no disponible | Hugging Face |
| Grigora Keyword Intent Classifier | Herramienta SaaS | no aplica | no aplica | propietaria | Web (servicio) |

La comparacion cuantitativa no es posible: ninguno de los tres expone metricas publicas de rendimiento en la informacion disponible, y las arquitecturas son heterogeneas (clasificador clasico, modelo neuronal y servicio propietario). La diferencia principal es la licencia y el modo de consumo: el modelo de Egrove es autohospedable y de codigo abierto, mientras que la alternativa de Grigora es un servicio gestionado.

## Limitaciones y advertencias

- Ausencia total de metricas: no se publica exactitud, F1 ni matriz de confusion, lo que impide evaluar la calidad real del clasificador antes de desplegarlo.
- Ambiguedad intrinseca de las keywords: la propia model card advierte que una palabra clave puede tener multiples significados, por lo que las predicciones deben validarse sobre el corpus propio antes de usarse en produccion.
- Idioma no declarado: los ejemplos son en ingles; no hay evidencia de soporte para castellano ni para otros idiomas.
- Dependencia de codigo auxiliar: el modelo requiere `intent_preprocess.py` en el `sys.path`, lo que acopla la inferencia a un modulo Python concreto y complica el versionado y el despliegue.
- Riesgo de seguridad: la carga de ficheros `pickle`/`joblib` y la importacion de modulos Python pueden ejecutar codigo arbitrario. La model card advierte de cargar el modelo solo si se confia en su origen.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se ofrece ninguna garantia ni indemnizacion por parte del autor.
- Sin soporte para razonamiento, contexto largo ni generacion: no es adecuado para tareas distintas de la clasificacion de cadenas cortas.
- Fecha de creacion futura en los metadatos (2026-11-04), lo que puede indicar un error de registro o un artefacto de prueba; conviene verificar la procedencia antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Egrove/keyword-intent-classifier
- Herramienta de referencia de Grigora: https://www.grigora.co/tools/keyword-intent-classifier/
- Modelo alternativo Falconsai/intent_classification: https://huggingface.co/Falconsai/intent_classification
