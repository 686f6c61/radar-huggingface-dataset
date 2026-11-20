# jramduran/fake-news-tfidf-random-forest

## Resumen

El modelo `jramduran/fake-news-tfidf-random-forest` es un clasificador binario de texto en ingles que etiqueta articulos periodisticos como falsos (0) o reales (1). No es una red neuronal ni un modelo de lenguaje: se trata de un `Pipeline` de scikit-learn compuesto por un vectorizador TF-IDF sobre las 5.000 palabras mas frecuentes y un bosque aleatorio de 300 arboles con un minimo de dos articulos por hoja. Lo desarrolla el usuario jramduran como parte de un proyecto de procesamiento de lenguaje natural alojado en GitHub.

Su relevancia es acotada pero ilustrativa: sirve como ejemplo de clasificador clasico de bajo coste para deteccion de desinformacion sobre el dataset ISOT, y su model card documenta con honestidad una limitacion metodologica importante, que el modelo aprende el estilo de redaccion de las fuentes (agencias de noticias frente a sitios marcados por PolitiFact y Wikipedia entre 2015 y 2018) y no verifica hechos. Un texto inventado redactado como un cable de agencia se clasifica como real.

El repositorio ocupa 0,0 GB (pesos en formato `joblib`), no registra descargas ni likes, y la licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF (5.000 palabras mas frecuentes) + Random Forest de 300 arboles |
| Parametros totales | No disponible (no es un modelo neuronal; el bosque tiene 300 arboles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (TF-IDF sobre bolsa de palabras, sin ventana de contexto definida) |
| Tipos de cuantizacion | No disponible (serializacion `joblib`, no aplica cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | `joblib` (pickle de scikit-learn) |

## Arquitectura y entrenamiento

El modelo no usa arquitectura transformer ni redes neuronales. Es un `Pipeline` de scikit-learn que primero transforma el texto en un vector TF-IDF limitado a las 5.000 palabras mas frecuentes y despues aplica un `RandomForestClassifier` de 300 arboles con al menos dos articulos por hoja. La entrada debe ser la concatenacion de titular y cuerpo del articulo tras pasar por la funcion `clean_article()` del repositorio del proyecto, que elimina marcadores del editor: la linea de dateline de Reuters (presente en el 99 % de los articulos reales y en ninguno de los falsos), creditos de imagen, enlaces y menciones con arroba.

Los datos proceden del dataset ISOT Fake News, leido desde `haoxianc/gilchr_fake-and-real-news-dataset` (licencia MIT), cuyas etiquetas estan invertidas y se vuelven a invertir en el pipeline. El conjunto de entrenamiento tiene 27.748 articulos, el de test 6.937 y el de validacion 4.141. Antes del entrenamiento se eliminan articulos duplicados y se excluyen de las metricas 815 articulos de validacion que son copias de articulos de entrenamiento (de 4.956). No se documenta uso de RLHF, DPO ni tecnicas de aumento de datos. El modelo requiere scikit-learn 1.9.1.

## Capacidades

- Clasificacion binaria de texto: asigna probabilidad de articulo falso (0) o real (1) a un articulo en ingles.
- Salida de probabilidades mediante `predict_proba`, lo que permite umbrales ajustables.
- Procesamiento de titular y cuerpo concatenados tras limpieza con `clean_article()`.
- Deteccion de estilo de redaccion asociado a fuentes del dataset ISOT (agencias frente a sitios marcados), no verificacion de hechos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multimodales (vision, audio) ni modo de razonamiento explicito.
- Multilingue: no; solo ingles.

## Casos de uso

- Filtro preliminar en un pipeline de moderacion de contenidos: el modelo puede puntuar articulos en ingles y derivar los casos con probabilidad intermedia a revision humana, usando `predict_proba` para fijar el umbral.
- Etiquetado de corpus historicos de noticias (2015-2018, fuentes tipo Reuters frente a sitios marcados) para tareas de investigacion sobre estilo periodistico, siempre que el corpus comparta la distribucion del ISOT.
- Baseline de referencia en proyectos academicos o de aprendizaje: sirve como punto de comparacion clasico (TF-IDF + Random Forest) frente a clasificadores neuronales en tareas de deteccion de desinformacion.
- Experimentos de analisis de sesgo de fuente: permite estudiar que palabras discriminan entre estilos de redaccion, dado que el modelo es interpretable a nivel de caracteristicas TF-IDF.
- Prototipado rapido en local: al ser un `joblib` pequeno y requerir solo scikit-learn, se puede desplegar en una CPU sin GPU para demos o pruebas de concepto.
- Docencia sobre limitaciones de los clasificadores de texto: la propia model card documenta el fallo de generalizacion a la seccion US_News (80,7 % de accuracy) y el riesgo de aprender artefactos de fuente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy, conjunto de validacion (n=4.141) | 90,3 % |
| ROC AUC, conjunto de validacion | 0,993 |
| Accuracy, seccion no vista US_News (n=783) | 80,7 % |
| Accuracy, split interno de test del 20 % (n=6.937) | 97,4 % |
| Accuracy del pipeline original del notebook (texto sin limpiar), validacion | 98,9 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un `joblib` de un pipeline TF-IDF + Random Forest; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y el coste de inferencia es el de un `predict_proba` de scikit-learn.
- Opciones de despliegue: carga directa con `joblib.load` en Python, servicio HTTP propio (por ejemplo FastAPI o Flask), o integracion en pipelines de scikit-learn. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos neuronales.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del hardware y del tamano del texto de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jramduran/fake-news-tfidf-random-forest | TF-IDF + Random Forest (scikit-learn) | No disponible (300 arboles) | No aplica | No disponible | Hugging Face, 0 descargas |
| Clasificadores neuronales tipo BERT fine-tuned para fake news | Transformer encoder | ~110 M (BERT-base) | 512 tokens | Segun modelo base | No disponible en la informacion |
| Modelos de lenguaje generativos con verificacion de hechos | Transformer decoder | Miles de millones | Decenas de miles de tokens | Segun modelo | No disponible en la informacion |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo no verifica hechos: aprende el estilo de redaccion de las fuentes del ISOT (Reuters frente a sitios marcados por PolitiFact y Wikipedia, 2015-2018). Un texto inventado escrito como un cable de agencia se clasifica como real.
- Riesgo alto de fuga de fuente: aunque se eliminan datelines, creditos, enlaces y menciones, persisten senales estilisticas (palabras como "said" o "spokesman" frente a "video" o "watch") que el modelo usa como atajos.
- Generalizacion limitada: la accuracy cae al 80,7 % en la seccion no vista US_News frente al 97,4 % del split interno de test.
- Solo ingles; no soporta otros idiomas.
- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor.
- Requiere scikit-learn 1.9.1 exactamente; otras versiones pueden romper la deserializacion del `joblib`.
- Carga de pickles: el propio autor advierte de cargar solo ficheros de confianza, por el riesgo de ejecucion de codigo en la deserializacion.
- Sin mantenimiento aparente: 0 descargas, 0 likes y actualizacion el mismo dia de creacion (2026-11-20).
- No apto para produccion como unico sistema de decision sobre veracidad de noticias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/fake-news-tfidf-random-forest
- Dataset: https://huggingface.co/datasets/haoxianc/gilchr_fake-and-real-news-dataset
- Repositorio del proyecto: https://github.com/JTiiz/natural-processing-models
