# abelcetina/amazon-review-classifiers

## Resumen

`abelcetina/amazon-review-classifiers` es un repositorio que agrupa dos clasificadores binarios de polaridad de sentimiento (0 = negativo, 1 = positivo) entrenados sobre el conjunto de datos Amazon Review Polarity de Zhang et al. (2015). No se trata de un modelo generativo ni de un transformer preentrenado, sino de dos artefactos de clasificacion supervisada de proposito especifico: un pipeline TF-IDF con regresion logistica exportado como ficheros planos (lista de terminos en JSON y pesos en NumPy) y una red neuronal convolucional implementada en Keras sobre embeddings.

El modelo resuelve un problema acotado y bien definido: clasificar resenas de productos de Amazon en ingles como positivas o negativas a partir de un texto preprocesado con el formato "title. text", en minusculas y con HTML y URLs eliminados. Su relevancia practica reside en la ligereza del despliegue: el clasificador TF-IDF no requiere framework de deep learning y puede ejecutarse con NumPy puro, mientras que la CNN de Keras ofrece un equilibrio alternativo entre precision y coste computacional.

El repositorio tiene un tamano de 0.0 GB segun los metadatos de Hugging Face, cero descargas y cero likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026. La informacion disponible sobre arquitectura interna, datos de entrenamiento mas alla del dataset citado y regimen de entrenamiento es muy limitada; los datos que no aparecen en la model card se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos clasificadores: (1) TF-IDF word 1-2-grams con TF sublinear + regresion logistica; (2) CNN en Keras con embedding + Conv1D (kernels 3 y 5) |
| Parametros totales | no disponible (el clasificador TF-IDF se exporta como lista de terminos JSON y pesos NumPy; la CNN no publica recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificacion a nivel de documento, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no aplica (TF-IDF en NumPy y pesos Keras; no se distribuyen pesos en formatos cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Ficheros planos: JSON de terminos y pesos NumPy para `tfidf_portable/`; pesos Keras, vocabulario y config para `review_dnn/` |
| Pipeline | text-classification |
| Etiquetas | 0 = negativo, 1 = positivo |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El repositorio contiene dos aproximaciones clasicas de procesamiento de lenguaje natural, no basadas en transformers. La primera, `tfidf_portable/`, combina una vectorizacion TF-IDF con n-gramas de palabras de orden 1 y 2 y frecuencia de termino sublinear, seguida de una regresion logistica. Se distribuye como ficheros planos (lista de terminos en JSON y pesos en NumPy), lo que permite inferencia sin dependencias de frameworks de aprendizaje profundo. La segunda, `review_dnn/`, es una red neuronal convolucional en Keras compuesta por una capa de embedding y convoluciones Conv1D con kernels de tamano 3 y 5, un diseno tipico para capturar patrones locales de n-gramas en texto.

Ambos clasificadores se entrenaron sobre el Amazon Review Polarity dataset de Zhang et al. (2015), con etiquetas binarias de polaridad. El preprocesado de entrada documentado consiste en convertir a minusculas y eliminar HTML y URLs, manteniendo el formato "title. text". La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de validacion cruzada mas alla de la mencionada, ni si se aplicaron tecnicas de regularizacion o ajuste de hiperparametros mas alla de lo indicado. Las metricas, la validacion cruzada de 5 folds y los tiempos de ejecucion se remiten al fichero `classifiers.json`, cuyo contenido no esta incluido en la informacion proporcionada.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) de resenas de productos de Amazon en ingles.
- Procesamiento de texto a nivel de documento con el formato preprocesado "title. text" (minusculas, sin HTML ni URLs).
- Inferencia ligera sin framework de deep learning en la variante TF-IDF, ejecutable con NumPy y lectura de JSON.
- Inferencia con red convolucional en Keras en la variante `review_dnn/`, con vocabulario y configuracion incluidos.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no se documentan otros idiomas.
- No dispone de modo thinking, audio ni capacidades multimodales.

## Casos de uso

- Moderacion y triaje de resenas en marketplaces: el clasificador TF-IDF puede puntuar en tiempo real cada resena entrante como positiva o negativa y enrutar las negativas a un equipo de atencion al cliente, sin necesidad de infraestructura de GPU.
- Analisis de sentimiento en paneles de reputacion de producto: agregar la polaridad de miles de resenas por ASIN para calcular ratios de satisfaccion y detectar caidas de valoracion tras un cambio de producto o de proveedor.
- Enriquecimiento de pipelines de datos de e-commerce: etiquetar corpus historicos de resenas para entrenar modelos posteriores o construir dashboards de analitica sin depender de APIs externas de terceros.
- Filtrado previo en sistemas de recomendacion: usar la polaridad como senal auxiliar para ponderar resenas en el calculo de puntuaciones de producto, aprovechando que el modelo TF-IDF se ejecuta en CPU y con latencia muy baja.
- Deteccion de incidencias de calidad: monitorizar la proporcion de resenas negativas por lote de producto o por vendedor y generar alertas cuando supere un umbral configurable.
- Prototipado rapido y entornos con restricciones de recursos: desplegar el clasificador TF-IDF en funciones serverless o dispositivos de borde, ya que solo requiere NumPy y la lectura de un JSON de terminos y pesos, sin runtime de aprendizaje profundo.
- Baseline en experimentos de investigacion: emplear la CNN de Keras como referencia reproducible sobre Amazon Review Polarity para comparar con arquitecturas transformer en tareas de clasificacion de sentimiento.

## Benchmarks y rendimiento

| Clasificador | Metrica | Resultado |
|---|---|---|
| `tfidf_portable/` (TF-IDF + regresion logistica) | Exactitud en test (400.000 resenas) | 0,9380 |
| `review_dnn/` (CNN Keras, embedding + Conv1D kernels 3 y 5) | Exactitud en test | 0,9342 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de modelos generativos, ya que no se trata de un modelo de lenguaje. La model card remite a `classifiers.json` para metricas adicionales, validacion cruzada de 5 folds y tiempos de ejecucion, pero el contenido de ese fichero no se ha proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el clasificador TF-IDF no requiere GPU y la CNN de Keras es de escala reducida, pero no se publica el recuento de parametros ni el consumo de memoria.
- GPU recomendadas: no se especifican; por la naturaleza de los modelos, la inferencia es viable en CPU.
- Compatibilidad con GPU de consumo: no documentada; el TF-IDF es ejecutable en CPU sin GPU.
- Opciones de despliegue: NumPy y lectura de JSON para `tfidf_portable/`; TensorFlow/Keras para `review_dnn/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de clasificadores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card indica que los tiempos se recogen en `classifiers.json`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Exactitud en Amazon Polarity | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `abelcetina/amazon-review-classifiers` (TF-IDF) | TF-IDF + regresion logistica | no disponible | no aplica | 0,9380 | apache-2.0 | Hugging Face |
| `abelcetina/amazon-review-classifiers` (CNN) | CNN Keras | no disponible | no aplica | 0,9342 | apache-2.0 | Hugging Face |
| Clasificadores transformer afinados para sentimiento (p. ej. DistilBERT, RoBERTa) | Transformer encoder | no disponible en esta ficha | no disponible en esta ficha | no disponible | variable segun modelo | Hugging Face |
| `nlptown/bert-base-multilingual-uncased-sentiment` | Transformer encoder multilingue | no disponible en esta ficha | no disponible en esta ficha | no disponible | variable | Hugging Face |

La comparacion cuantitativa con alternativas no puede completarse con los datos proporcionados: no se dispone de resultados de benchmarks de los modelos comparables en la informacion disponible. La ventaja diferencial de este repositorio es la ligereza del despliegue del clasificador TF-IDF y su licencia permisiva apache-2.0.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre resenas de Amazon en ingles, puede heredar sesgos de dominio, de producto y de distribucion de la plataforma.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo; el riesgo es de clasificacion erronea en resenas ambiguas, sarcasticas o con polaridad mixta.
- Limitaciones de contexto e idioma: solo admite ingles y espera el formato preprocesado "title. text" en minusculas y sin HTML ni URLs; textos que no sigan ese preprocesado pueden degradar la precision.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.
- Caveats para produccion: el repositorio tiene cero descargas y cero likes, y no se han publicado revisiones independientes; la validacion se limita a la exactitud en el split de test de 400.000 resenas reportada por el autor. La ausencia de recuento de parametros y de detalles de entrenamiento dificulta la reproducibilidad. El contenido de `classifiers.json`, con metricas y tiempos, no esta disponible en la informacion proporcionada.
- El clasificador TF-IDF depende de la lista de terminos exportada; terminos ausentes del vocabulario de entrenamiento no contribuiran a la prediccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abelcetina/amazon-review-classifiers
- Dataset de referencia: Zhang et al. (2015), Amazon Review Polarity dataset (no se proporciona URL en la informacion disponible)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
