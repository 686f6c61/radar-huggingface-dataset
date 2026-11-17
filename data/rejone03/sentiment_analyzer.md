# rejone03/Sentiment_Analyzer

## Resumen

Sentiment_Analyzer es un clasificador binario de sentimiento para resenas de peliculas en ingles, publicado en Hugging Face por el usuario rejone03. No se trata de un modelo de lenguaje neuronal, sino de un pipeline clasico de aprendizaje automatico supervisado construido con scikit-learn: un `TfidfVectorizer` que extrae caracteristicas de unigramas y bigramas, seguido de una regresion logistica entrenada sobre el conocido dataset IMDB de 50.000 resenas. El autor reporta una precision en torno al 90,95 %.

El modelo resuelve una tarea muy acotada: dada una resena de pelicula en ingles, devolver una etiqueta positiva o negativa. Su relevancia practica es la de un clasificador ligero, interpretable y de bajo coste computacional, util como linea base o como componente en pipelines de analisis de opinion, moderacion o enriquecimiento de datos. No compite con los grandes modelos generativos, pero puede ejecutarse en CPU en milisegundos sin GPU.

El repositorio es de tamano practicamente nulo (0,0 GB reportados), con cero descargas y un solo like en el momento de la consulta, lo que sugiere un proyecto personal o educativo mas que un artefacto listo para produccion. La licencia no esta declarada y no se ha publicado informacion sobre la composicion exacta del dataset, hiperparametros o validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TF-IDF (unigramas + bigramas) + regresion logistica |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende del vocabulario TF-IDF, no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TF-IDF no tiene ventana de contexto; depende del preprocesado del vectorizador) |
| Tipos de cuantizacion | no disponible (no aplica a modelos scikit-learn; los artefactos son `.pkl` con joblib) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (joblib): `sentiment_model.pkl` y `tfidf_vectorizer.pkl` |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal clasico de procesamiento de lenguaje natural. El `TfidfVectorizer` convierte cada resena en un vector disperso de pesos TF-IDF calculados sobre unigramas y bigramas; a continuacion, una regresion logistica aprende un hiperplano de separacion entre las clases positiva y negativa. No hay capas neuronales, atencion ni embeddings contextuales: el modelo no captura orden sintactico mas alla de los bigramas ni representaciones semanticas profundas.

El entrenamiento se realizo sobre el dataset IMDB de 50.000 resenas, segun indica el autor en la model card. No se especifican el numero de tokens, la division train/test, los hiperparametros de regularizacion, el tamano del vocabulario, el uso de tecnicas como RLHF o DPO (no aplicables a este tipo de modelo) ni procesos de validacion cruzada. Tampoco se documenta el preprocesado (minusculizacion, eliminacion de stopwords, etc.). La unica metrica reportada es una precision aproximada del 90,95 %, sin desglose de matriz de confusion, F1, precision o recall por clase.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en resenas de peliculas en ingles.
- Extraccion de caracteristicas TF-IDF con unigramas y bigramas, lo que permite capturar algunas expresiones de dos palabras (por ejemplo, negaciones simples del tipo "not good").
- Inferencia en CPU con latencia muy baja, adecuada para procesamiento por lotes de grandes volumenes de texto.
- Modelo interpretable: los coeficientes de la regresion logistica permiten inspeccionar que terminos empujan la prediccion hacia cada clase.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene modo "thinking", vision, audio ni capacidades multimodales.
- Multilingue: no; unicamente ingles.
- No es un modelo generativo: no produce texto, solo etiquetas.

## Casos de uso

- Analisis de opinion a gran escala sobre resenas de cine o productos similares en ingles: el modelo puede procesar lotes de miles de textos en CPU y agregar la proporcion de sentimiento positivo frente a negativo por titulo, plataforma o periodo temporal.
- Linea base en proyectos de investigacion: sirve como referencia clasica (TF-IDF + regresion logistica) contra la que comparar modelos neuronales o transformers en tareas de clasificacion de sentimiento.
- Moderacion y triaje de comentarios: permite filtrar rapidamente resenas o comentarios negativos para revision humana, reduciendo el volumen que llega a los moderadores.
- Enriquecimiento de datasets: etiquetar automaticamente resenas sin anotar para construir conjuntos de entrenamiento o para analisis exploratorio de datos.
- Monitorizacion de reputacion de productos o peliculas: seguimiento de la evolucion del sentimiento en resenas a lo largo del tiempo mediante agregacion de predicciones.
- Prototipado rapido y docencia: por su simplicidad, tamano minimo y dependencia unicamente de scikit-learn y joblib, es adecuado para ensenar pipelines de NLP clasicos o para validar una idea de producto antes de invertir en modelos mayores.
- Sistemas de recomendacion: usar la etiqueta de sentimiento como senal auxiliar para ponderar resenas en un motor de recomendacion de peliculas.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | ~90,95 % | Dataset IMDB (50.000 resenas), segun el autor |

No se han publicado en la informacion disponible resultados desglosados de precision, recall, F1, matriz de confusion ni comparaciones con otros modelos. La cifra de accuracy procede unicamente de la model card y no se especifica si corresponde a validacion, test o entrenamiento.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. El consumo de memoria RAM depende del tamano del vocabulario TF-IDF, que no se ha declarado, pero para un vocabulario tipico de IMDB suele situarse en el orden de decenas a pocos cientos de MB.
- GPU recomendadas: ninguna; no aplica.
- Cabe en cualquier GPU consumer y, de hecho, en cualquier equipo con CPU moderna; no necesita aceleracion grafica.
- Opciones de despliegue: Python con `scikit-learn` y `joblib` (carga directa de los `.pkl`), o mediante `huggingface_hub` para descargar los artefactos. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de transformer.
- Latencia y throughput: no se han publicado mediciones. Por la naturaleza del pipeline (transformacion TF-IDF dispersa y producto matricial con un modelo lineal), se espera una latencia del orden de milisegundos por muestra en CPU, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| rejone03/Sentiment_Analyzer | TF-IDF + regresion logistica | no disponible | no aplica | en | no disponible | ~90,95 % accuracy en IMDB (autor) |
| Modelos tipo DistilBERT fine-tuneados en SST-2/IMDB | Transformer | ~66 M (DistilBERT) | 512 tokens | multilingue o en | variable (Apache 2.0 en DistilBERT base) | no disponible en esta ficha |
| Modelos tipo RoBERTa fine-tuneados en IMDB | Transformer | ~125 M | 512 tokens | en | variable (MIT en RoBERTa base) | no disponible en esta ficha |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no puede completarse. La comparacion cualitativa indica que los transformers fine-tuneados suelen superar a los clasificadores TF-IDF clasicos en tareas de sentimiento, a costa de mayor coste computacional y menor interpretabilidad.

## Limitaciones y advertencias

- Solo admite ingles; cualquier texto en otro idioma producira predicciones sin significado fiable.
- Dominio restringido: entrenado sobre resenas de peliculas (IMDB); su rendimiento en otros dominios (redes sociales, soporte al cliente, resenas de productos) puede degradarse notablemente.
- No captura negaciones complejas, ironia, sarcasmo ni dependencias de largo alcance mas alla de bigramas.
- Riesgo de sobreajuste al vocabulario y estilo del dataset IMDB; la precision reportada no se ha validado con un conjunto independiente documentado.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial; es necesario contactar con el autor antes de usarlo en produccion.
- Repositorio con cero descargas y sin documentacion sobre hiperparametros ni preprocesado: la reproducibilidad no esta garantizada.
- No es un modelo generativo ni un transformer; no debe evaluarse con las mismas expectativas que un LLM.
- El codigo de ejemplo de la model card usa un `REPO_ID` de marcador de posicion ("YOUR-USERNAME/imdb-sentiment-analysis"), no el identificador real, por lo que debe sustituirse antes de ejecutarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rejone03/Sentiment_Analyzer
- Dataset IMDB de referencia: https://ai.stanford.edu/~amaas/data/sentiment/
- Documentacion de scikit-learn: https://scikit-learn.org/stable/
- Documentacion de joblib: https://joblib.readthedocs.io/
- Documentacion de huggingface_hub: https://huggingface.co/docs/huggingface_hub
