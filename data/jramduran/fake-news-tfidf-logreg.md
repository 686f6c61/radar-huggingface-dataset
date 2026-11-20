# jramduran/fake-news-tfidf-logreg

## Resumen

`jramduran/fake-news-tfidf-logreg` es un clasificador binario de noticias en ingles que etiqueta un articulo como falso (0) o real (1). No es un modelo de lenguaje neuronal: es una `Pipeline` de scikit-learn compuesta por un vectorizador TF-IDF sobre palabras y bigramas seguido de una regresion logistica L2 con `C=4`. Lo desarrolla el usuario jramduran en el contexto de un proyecto de Ironhack sobre procesamiento de lenguaje natural, publicado en Hugging Face con licencia no especificada.

El modelo resuelve la clasificacion de estilo editorial: distingue la prosa de agencia (Reuters) de la de sitios marcados como falsos por PolitiFact y Wikipedia entre 2015 y 2018. Segun la propia model card, no verifica hechos; aprende la firma estilistica de cada fuente. Es relevante como baseline ligero y reproducible frente a clasificadores neuronales, con 95,6 % de accuracy en validacion y 90,8 % en la seccion no vista `US_News`.

El repositorio es de tamano despreciable (0,0 GB en Hugging Face) y se distribuye como un unico artefacto `model.joblib` que requiere scikit-learn 1.9.1. No hay pesos en safetensors ni GGUF, ni parametros neuronales, ni ventana de contexto en el sentido habitual: la "contextualidad" la aporta el TF-IDF sobre el texto completo del articulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF (palabras y bigramas, frecuencia sublineal, `min_df=3`) + regresion logistica L2 (`C=4`) |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende del vocabulario TF-IDF, no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF sobre el texto completo del articulo; no hay ventana fija declarada) |
| Tipos de cuantizacion | no disponible (no aplica; artefacto `joblib` con pesos float de scikit-learn) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | `model.joblib` (pickle de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal clasico de NLP: vectorizacion TF-IDF con frecuencia de termino sublineal y bigramas de palabras, restringiendo terminos a aquellos presentes en al menos 3 articulos, seguida de regresion logistica con regularizacion L2 y `C=4`. El pipeline completo incluye vectorizador y clasificador en un unico objeto serializado con `joblib`, lo que simplifica el despliegue pero exige la version exacta de scikit-learn (1.9.1) para evitar incompatibilidades de deserializacion.

El entrenamiento usa el ISOT Fake News dataset tal como aparece en `haoxianc/gilchr_fake-and-real-news-dataset` (licencia MIT), cuyas etiquetas estan invertidas y se corrigen en el pipeline. Los conjuntos son: 27.748 articulos de entrenamiento, 6.937 de test interno y 4.141 de validacion externa. Antes del entrenamiento se eliminan marcadores del editor: la dateline de Reuters (`WASHINGTON (Reuters) -`, presente en el 99 % de los articulos reales y en ninguno de los falsos), creditos de imagen, enlaces y menciones `@`. Tambien se eliminan duplicados y se excluyen de las metricas 815 articulos de validacion que son copias de articulos de entrenamiento (de 4.956). No se documenta RLHF, DPO ni ajuste fino neuronal; es entrenamiento supervisado convencional sobre caracteristicas TF-IDF.

## Capacidades

- Clasificacion binaria de texto: asigna probabilidades `p_fake` y `p_real` a un articulo de noticias en ingles.
- Deteccion de estilo editorial: discrimina prosa de agencia frente a prosa de sitios marcados como falsos.
- Entrada compuesta: requiere headline y cuerpo del articulo pasados por `clean_article()` del repositorio del proyecto antes de la prediccion.
- Robustez parcial a marcadores de fuente: el preprocesado elimina datelines, creditos de imagen, enlaces y handles que filtrarian la etiqueta.
- Inferencia CPU-only: no requiere GPU ni framework neuronal.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni vision.
- No soporta otros idiomas distintos del ingles.
- No dispone de modo "thinking" ni capacidades generativas.

## Casos de uso

- Moderacion de comentarios y articulos en medios digitales: el clasificador puede filtrar candidatos con `p_fake` alto antes de revision humana, dado su coste computacional casi nulo en CPU y su throughput alto por ser un modelo lineal.
- Baseline en investigacion de deteccion de desinformacion: sirve como referencia reproducible (accuracy 95,6 % en validacion) frente a la que comparar clasificadores neuronales o LLM.
- Triaje en pipelines editoriales: integrado como paso previo a un revisor humano, marca articulos sospechosos segun estilo, no segun verificacion factual.
- Ensenanza de NLP: ejemplo didactico completo de TF-IDF + regresion logistica con particion train/validation/test y analisis de fugas por duplicados.
- Filtrado de datasets: util para descartar articulos con estilo de agencia Reuters al construir corpus de noticias, gracias a la limpieza explicita de datelines.
- Deteccion de estilo en agregadores RSS: clasifica articulos entrantes en ingles antes de publicacion automatica, con la advertencia de que solo captura estilo y no hechos.
- Analisis de sesgo de fuente en estudios de medios: permite medir deriva estilistica de un medio a lo largo del tiempo comparando distribuciones de `p_fake`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy, conjunto de validacion (n=4.141) | 95,6 % |
| ROC AUC, conjunto de validacion | 0,998 |
| Accuracy, seccion no vista `US_News` (n=783) | 90,8 % |
| Accuracy, split interno de test al 20 % (n=6.937) | 98,8 % |
| Pipeline original del notebook (texto sin limpiar), validacion | 96,0 % |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. La model card incluye una matriz de confusion como imagen (`confusion_matrix.png`) pero no se proporcionan sus valores numericos.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; cualquier CPU es suficiente.
- Cabe en cualquier consumer GPU y tambien en CPU de gama baja, dado el tamano despreciable del repositorio (0,0 GB).
- Opciones de despliegue: carga directa con `joblib.load` y `huggingface_hub.hf_hub_download`; integrable en servicios Python con scikit-learn 1.9.1; no compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan pipelines de scikit-learn.
- Latencia y throughput: no disponibles numericamente; por ser TF-IDF + regresion logistica, la inferencia es del orden de microsegundos a milisegundos por articulo en CPU, muy por encima de clasificadores neuronales en coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jramduran/fake-news-tfidf-logreg` | lineal, no disponible | texto completo via TF-IDF | 95,6 % accuracy (validacion), 0,998 ROC AUC | no disponible | Hugging Face, `joblib` |
| Clasificadores neuronales tipo BERT-base fine-tuned para fake news | ~110 M | 512 tokens | no disponible en esta ficha | variable segun checkpoint | Hugging Face |
| LLM generativos con prompt de clasificacion | miles de millones | 8k-128k tokens | no disponible en esta ficha | variable | APIs o pesos abiertos |

La comparativa con alternativas neuronales no puede cuantificarse con datos de esta ficha; se indica "no disponible" para rendimiento y contexto de los competidores por falta de informacion en la busqueda.

## Limitaciones y advertencias

- No verifica hechos: clasifica estilo editorial. Una noticia inventada redactada como teletipo de agencia se clasifica como real, segun la propia model card.
- Sesgo de fuente: el dataset ISOT etiqueta por origen (Reuters frente a sitios marcados por PolitiFact y Wikipedia, 2015-2018), por lo que el modelo captura la firma estilistica de esas fuentes concretas y no generaliza necesariamente a otros medios o periodos.
- Riesgo de alucinacion no aplica en sentido generativo, pero el clasificador puede producir falsos positivos y falsos negativos; la caida de accuracy a 90,8 % en `US_News` sugiere deriva fuera de la distribucion de entrenamiento.
- Solo ingles: no soporta articulos en castellano ni otros idiomas.
- Dependencia de version: requiere scikit-learn 1.9.1; otras versiones pueden fallar al deserializar el `joblib`.
- Licencia no disponible: no se puede confirmar uso comercial sin consultar al autor.
- Riesgo de seguridad al cargar pickles: la model card advierte explicitamente "only load pickles you trust"; `joblib.load` puede ejecutar codigo arbitrario.
- Dependencia de preprocesado externo: requiere `clean_article()` del repositorio del proyecto, no incluido en el artefacto; sin ese paso, la precision puede degradarse (96,0 % frente a 95,6 % en el pipeline original, pero con fugas de marcadores).
- Fugas residuales: 815 articulos de validacion duplicados de entrenamiento fueron excluidos de las metricas, pero el autor no documenta el impacto de otros posibles solapamientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/fake-news-tfidf-logreg
- Dataset: https://huggingface.co/datasets/haoxianc/gilchr_fake-and-real-news-dataset
- Repositorio del proyecto: https://github.com/JTiiz/natural-processing-models
