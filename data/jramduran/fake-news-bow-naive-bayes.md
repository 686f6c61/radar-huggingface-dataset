# jramduran/fake-news-bow-naive-bayes

## Resumen

`jramduran/fake-news-bow-naive-bayes` es un clasificador binario de texto en ingles que etiqueta articulos periodisticos como falsos (0) o reales (1). No es un modelo de lenguaje neuronal: se trata de un `Pipeline` de scikit-learn compuesto por un vectorizador de recuento de palabras y pares de palabras (las 50.000 mas frecuentes) y un clasificador Naive Bayes multinomial con `alpha=0.1`. El autor es jramduran y el artefacto se publica como un unico fichero `model.joblib`.

El modelo se entrena sobre el dataset ISOT Fake News, en la variante distribuida por Ironhack y leida desde `haoxianc/gilchr_fake-and-real-news-dataset`. El interes practico esta en su simplicidad y en la documentacion honesta de sus limites: el autor advierte explicitamente de que el modelo aprende estilo de redaccion (el de las agencias frente al de los sitios marcados por PolitiFact y Wikipedia entre 2015 y 2018), no veracidad factual.

Es relevante ahora como referencia de linea base para tareas de clasificacion de desinformacion y como ejemplo de buenas practicas en la documentacion de sesgos de dataset: se eliminan marcadores del editor (dateline de Reuters, creditos de imagen, enlaces, menciones), se deduplican articulos y se excluyen de la validacion las copias de articulos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: CountVectorizer (unigramas y bigramas, 50.000 features) + MultinomialNB (alpha=0.1) |
| Parametros totales | No disponible (modelo no neuronal; el estado son los recuentos del vectorizador y las probabilidades logaritmicas del Naive Bayes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (bolsa de palabras sin ventana; no modela orden mas alla de bigramas) |
| Tipos de cuantizacion | No aplica (no hay pesos en coma flotante de red neuronal; serializacion via joblib) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | `model.joblib` (pickle de scikit-learn 1.9.1) |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal probabilistico clasico: `CountVectorizer` construye una representacion de bolsa de palabras con unigramas y bigramas limitada a las 50.000 features mas frecuentes, y `MultinomialNB` con suavizado `alpha=0.1` estima la probabilidad de cada etiqueta. No hay embeddings, atencion ni capas ocultas. El preprocesado previo incluye la funcion `clean_article()` del repositorio del proyecto, que elimina el dateline de Reuters (presente en el 99 % de los articulos reales y en ninguno de los falsos), creditos de imagen, enlaces y menciones `@`.

Los datos de entrenamiento son 27.748 articulos del split de entrenamiento, con 6.937 en el split de test interno y 4.141 en validacion. Se eliminan articulos duplicados y se excluyen de la validacion 815 articulos que son copia de algun articulo de entrenamiento. Las etiquetas del dataset de origen estan invertidas y el autor las revierte. No hay RLHF, DPO ni ajuste fino neuronal; es entrenamiento supervisado de un clasificador estadistico.

## Capacidades

- Clasificacion binaria de texto: devuelve `predict_proba` con la probabilidad de falso y de real.
- Procesamiento de articulos periodisticos en ingles compuestos por titular y cuerpo.
- Uso de unigramas y bigramas como senal de estilo de redaccion.
- Integracion directa en pipelines de Python via `joblib.load` y `predict_proba`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingues: solo ingles.
- No tiene modo de pensamiento, vision ni audio.
- No verifica hechos: clasifica estilo, no veracidad.

## Casos de uso

- Filtro de primera pasada en ingesta de noticias: clasificar articulos entrantes antes de pasarlos a un verificador humano o a un LLM, dado el bajo coste computacional del pipeline.
- Linea base en investigacion sobre desinformacion: comparar mejoras de modelos neuronales contra un clasificador clasico con metricas reproducibles (accuracy 91,8 % en validacion, ROC AUC 0,957).
- Deteccion de estilo de agencia frente a estilo de sitio marcado: util en estudios de procedencia estilistica de textos periodisticos de 2015-2018.
- Etiquetado masivo de corpus historicos: procesar grandes volumenes de articulos en ingles en CPU sin necesidad de GPU.
- Educacion y demostracion: ejemplo docente de sesgo de dataset y de fuga de informacion (el dateline de Reuters) en clasificacion de noticias.
- Preetiquetado para anotacion humana: generar candidatos que un anotador revisa, reduciendo el coste de etiquetado manual.
- Monitorizacion de medios con criterios de estilo: alertar cuando un articulo se desvia del estilo de agencia esperado en un flujo editorial.

## Benchmarks y rendimiento

| Metrica | Conjunto | Valor |
|---|---|---|
| Accuracy | Validacion (n=4.141) | 91,8 % |
| ROC AUC | Validacion | 0,957 |
| Accuracy | Seccion no vista US_News (n=783) | 78,2 % |
| Accuracy | Test interno 20 % (n=6.937) | 95,9 % |
| Accuracy | Pipeline original sin limpieza, validacion | 91,2 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el pipeline se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier maquina consumer: el repositorio ocupa 0,0 GB y el artefacto es un unico fichero joblib.
- Despliegue: Python con scikit-learn 1.9.1 y joblib; integrable en FastAPI, Flask o como paso previo en pipelines de datos.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (bolsa de palabras y Naive Bayes) se espera baja latencia por documento en CPU.
- Requiere la funcion `clean_article()` del repositorio del proyecto para reproducir el preprocesado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jramduran/fake-news-bow-naive-bayes` | BoW + Naive Bayes | No disponible | No aplica | No disponible | Hugging Face |
| Clasificadores Transformer (p. ej. RoBERTa fine-tuned para fake news) | Transformer encoder | ~125M en adelante | 512 tokens tipico | Variable | Hugging Face |
| Regresion logistica con TF-IDF | Lineal | No disponible | No aplica | Variable | Comun en repositorios |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada para una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo aprende estilo de redaccion, no veracidad: una noticia inventada redactada como teletipo de agencia se clasificara como real.
- Sesgo de fuente: el dataset etiqueta por origen (Reuters frente a sitios marcados por PolitiFact y Wikipedia entre 2015 y 2018), por lo que el modelo no generaliza a fuentes ni periodos posteriores.
- Caida de rendimiento fuera de dominio: 78,2 % de accuracy en la seccion US_News frente a 91,8 % en validacion.
- Solo ingles; no soporta otros idiomas.
- Licencia no disponible: verificar condiciones antes de uso comercial.
- El artefacto es un pickle: solo debe cargarse desde fuentes de confianza por riesgo de ejecucion de codigo.
- Dependencia estricta de scikit-learn 1.9.1 y de la funcion `clean_article()` del repositorio del proyecto.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y negativos por dependencia del vocabulario del dataset.
- No apto como unico criterio para moderacion o verificacion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/fake-news-bow-naive-bayes
- Repositorio del proyecto: https://github.com/JTiiz/natural-processing-models
- Dataset de origen: https://huggingface.co/datasets/haoxianc/gilchr_fake-and-real-news-dataset
