# itslucasmiranda/ml-review-classifier

## Resumen

ML Review Classifier es un clasificador binario de sentimiento para resenas en ingles desarrollado por Lucas Miranda (itslucasmiranda). No es un modelo de lenguaje neuronal, sino un pipeline clasico de scikit-learn que combina un vectorizador TF-IDF con n-gramas de 1 a 2 y una regresion logistica. Su funcion es asignar cada resena a una de dos clases: negativa (`0`) o positiva (`1`). El modelo se publica como artefacto joblib con version `v0.1.0-baseline` y el propio autor lo etiqueta como experimental y no listo para produccion.

El interes de esta ficha es limitado en el contexto de IA generativa: se trata de un baseline de machine learning tradicional, no de un transformer. Su relevancia practica radica en servir como referencia reproducible y ligera para tareas de analisis de sentimiento, con un coste computacional minimo y un flujo de entrenamiento transparente documentado en el repositorio de GitHub del autor.

El modelo se entreno sobre el dataset UCI Sentiment Labelled Sentences (3.000 resenas originales de Amazon, IMDb y Yelp, 2.979 tras deduplicacion) y alcanza un 81,56% de accuracy y macro F1 en el conjunto de test (602 ejemplos). No dispone de ventana de contexto en el sentido de los LLM: procesa cada texto de forma independiente mediante representacion TF-IDF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TfidfVectorizer (n-gramas 1-2, min_df=2) + LogisticRegression |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende del vocabulario TF-IDF, no documentado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; clasificacion por documento, sin ventana de contexto) |
| Tipos de cuantizacion | no aplica (artefacto joblib; no se distribuyen pesos en formatos cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | joblib (serializacion basada en pickle) |
| Version | v0.1.0-baseline |
| Tarea | Clasificacion de texto (sentiment-analysis), binaria |
| Dataset de entrenamiento | UCI Sentiment Labelled Sentences (CC BY 4.0) |
| Entorno de referencia | Python 3.14.7, scikit-learn 1.9.1, NumPy 2.5.5, SciPy 1.18.1, Joblib 1.6.0 |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura neuronal. Se trata de un pipeline clasico de dos etapas: primero, un `TfidfVectorizer` convierte cada resena en un vector disperso de caracteristicas TF-IDF usando n-gramas de palabras de 1 a 2 y una frecuencia minima de documento de 2; despues, una `LogisticRegression` con un maximo de 1.000 iteraciones y semilla aleatoria 42 realiza la clasificacion binaria. No hay fases de preentrenamiento, RLHF ni DPO, ni mecanismos de atencion o decodificacion.

Los datos de entrenamiento proceden del dataset UCI Sentiment Labelled Sentences (Kotzias, 2015), compuesto por 3.000 resenas de Amazon, IMDb y Yelp. Tras el preprocesado y la eliminacion de duplicados quedaron 2.979 ejemplos, divididos en 1.784 para entrenamiento, 593 para validacion y 602 para test. El autor documenta el procedimiento de preparacion del dataset en el repositorio de GitHub y publica el hash SHA-256 del artefacto (`8395cce17d942589785e2afaec14d1fa267244ea5b9a248f13b2619ad8047d5`) para verificar su integridad.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en resenas en ingles.
- Procesamiento de texto independiente por documento, sin memoria entre llamadas.
- Extraccion de caracteristicas TF-IDF con n-gramas de palabras de 1 a 2.
- Inferencia muy ligera en CPU, sin necesidad de GPU.
- Reproducibilidad documentada: entorno fijado por versiones y hash del artefacto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta otros idiomas distintos del ingles.
- No dispone de modo thinking, vision ni audio.
- No clasifica sentimiento neutro (solo dos clases).

## Casos de uso

- Analisis de sentimiento por lotes en resenas de producto: el modelo puede procesar grandes volumenes de resenas en ingles en CPU con coste minimo, etiquetando cada una como positiva o negativa para agregacion de metricas de satisfaccion.
- Filtrado previo en pipelines de datos: dado su bajo coste, puede actuar como primera etapa que descarte o marque resenas claramente negativas antes de enviarlas a un modelo mayor o a un sistema de alertas.
- Baseline de referencia en experimentos de NLP: sirve como punto de comparacion reproducible (81,56% de accuracy) frente a modelos neuronales o LLM en tareas de clasificacion de sentimiento.
- Prototipado rapido de clasificadores: el pipeline TF-IDF + regresion logistica es un punto de partida habitual para validar la viabilidad de una tarea de clasificacion antes de invertir en modelos mas complejos.
- Educacion y demostraciones: el modelo y su codigo fuente permiten ilustrar el flujo completo de entrenamiento, evaluacion y serializacion con scikit-learn.
- Moderacion o triaje de opiniones en ingles: puede marcar resenas negativas para revision humana en foros o plataformas de comercio electronico, siempre con supervision dado su caracter experimental.
- No es adecuado para conversaciones multi-turno, generacion de texto ni tareas que requieran contexto largo, al no ser un modelo generativo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Metrica | Validacion (593) | Test (602) |
|---|---:|---:|
| Accuracy | 79,76% | 81,56% |
| Macro F1 | 79,76% | 81,56% |
| Macro precision | no disponible | 81,56% |
| Macro recall | no disponible | 81,56% |

Matriz de confusion en test:

| Real / Predicho | Negativo | Positivo |
|---|---:|---:|
| Negativo | 247 | 54 |
| Positivo | 57 | 244 |

Total de predicciones correctas: 491 de 602. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un pipeline TF-IDF + regresion logistica y no requiere GPU.
- VRAM estimada: no aplica (0 GB de VRAM necesarios).
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente.
- Cabe en cualquier entorno consumer, incluidos portatiles de gama baja y contenedores con pocos recursos.
- Opciones de despliegue: carga directa con `joblib.load` en Python; integrable en servicios web (Flask, FastAPI) o scripts por lotes. No es compatible con vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de pesos neuronales.
- Latencia y throughput: no documentados; por la naturaleza del modelo se espera un throughput alto en CPU, pero no se dispone de cifras oficiales.
- Requiere las versiones de scikit-learn, NumPy, SciPy y Joblib indicadas para garantizar compatibilidad del artefacto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia cualitativa de la misma categoria (clasificacion de sentimiento con enfoques clasicos), podrian considerarse alternativas como Naive Bayes con TF-IDF o SVM lineal sobre el mismo dataset, pero no se han publicado comparaciones en la documentacion disponible.

| Modelo | Parametros | Contexto | Accuracy test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ML Review Classifier | no disponible | no aplica | 81,56% | no disponible | Hugging Face + GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo admite resenas en ingles; el rendimiento en otros idiomas no esta establecido.
- Clasificacion binaria sin clase neutra, lo que fuerza a etiquetar como positiva o negativa cualquier texto ambiguo.
- Entrenado sobre un dataset pequeno y relativamente antiguo (3.000 resenas originales), con posible sesgo hacia los dominios de Amazon, IMDb y Yelp.
- El rendimiento en resenas reales de clientes brasilenos no ha sido establecido, segun el propio autor.
- Puede fallar ante sarcasmo, enunciados ambiguos o vocabulario no visto en entrenamiento.
- Los resultados de evaluacion no demuestran que el modelo este listo para produccion; el autor lo declara experimental.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de seguridad: el artefacto joblib usa serializacion basada en pickle y puede ejecutar codigo arbitrario al cargarse; solo debe cargarse desde una fuente de confianza tras verificar el hash SHA-256.
- No dispone de contexto conversacional ni de memoria entre llamadas.

## Enlaces

- Hugging Face: https://huggingface.co/itslucasmiranda/ml-review-classifier
- GitHub (codigo fuente): https://github.com/itslucasmiranda/ml-review-classifier
- Dataset UCI Sentiment Labelled Sentences: https://archive.ics.uci.edu/dataset/331/sentiment+labelled+sentences
- Citacion del dataset: Kotzias, D. (2015). *Sentiment Labelled Sentences*. UCI Machine Learning Repository. DOI: 10.24432/C57604.
