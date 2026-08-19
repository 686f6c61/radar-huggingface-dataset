# bolewara/netflix-genre-classifier

## Resumen

El modelo `bolewara/netflix-genre-classifier` es un clasificador de texto basado en un pipeline clásico de sklearn que combina un vectorizador TF-IDF con una regresión logística multiclase. Desarrollado por Anuj Bolewar, predice el género principal de un título de Netflix a partir de la concatenación del título y la descripción, entre 26 clases posibles (Dramas, Comedies, Action & Adventure, Documentaries, International TV Shows, etc.). No se trata de un modelo de lenguaje grande ni de una red neuronal profunda, sino de un modelo estadístico tradicional de aprendizaje automático, entrenado sobre el dataset público `shivamb/netflix-shows` con 8.807 títulos.

Su relevancia radica en ser un ejemplo sencillo y reproducible de clasificación de texto con recursos mínimos: el repositorio ocupa menos de 1 MB y la inferencia se ejecuta en CPU sin necesidad de GPU. La precisión en test es modesta (45,9% sobre 26 clases), lo que lo hace útil como punto de partida didáctico o para prototipos, pero no para producción con requisitos estrictos de exactitud. El modelo se distribuye bajo licencia MIT y está empaquetado en formato joblib, con las etiquetas de clase en un archivo `.npy` separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline sklearn: TF-IDF + LogisticRegression (multiclase) |
| Parametros totales | no disponible (modelo lineal con pesos TF-IDF, no se reporta el numero) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: modelo de bolsa de palabras, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (no es un modelo de red neuronal cuantizable) |
| Idiomas soportados | no disponible (el dataset es en ingles, pero no se especifica oficialmente) |
| Licencia | MIT |
| Formato de pesos | joblib (pipeline completo) + .npy (etiquetas de clase) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn compuesto por dos etapas: un vectorizador TF-IDF que convierte el texto (titulo + descripcion) en una representacion numerica dispersa, seguido de un clasificador de regresion logistica multiclase con 26 clases. No emplea arquitectura transformer ni atencion; es un enfoque clasico de bolsa de palabras con pesos TF-IDF, que ignora el orden de las palabras y las relaciones sintacticas.

El entrenamiento se realizo sobre el dataset `shivamb/netflix-shows`, que contiene 8.807 titulos con 12 columnas. Se eliminaron las clases con menos de 20 ejemplos para reducir el desbalanceo, quedando 26 generos finales. No se aplicaron tecnicas de fine-tuning con RLHF, DPO ni aprendizaje por refuerzo; es un entrenamiento supervisado estandar con optimizacion de la funcion de perdida de entropia cruzada. La unica metrica reportada es la precision en test (0.459). No se dispone de informacion sobre la composicion exacta del dataset de entrenamiento ni sobre la proporcion de division train/test.

## Capacidades

- Clasificacion de texto multiclase: predice el genero principal de un titulo de Netflix a partir de su titulo y descripcion.
- Entrada de texto libre en formato string (se espera concatenacion de titulo y descripcion).
- Salida: una de 26 etiquetas de genero predefinidas (p. ej. "Dramas", "Comedies", "Action & Adventure", "Documentaries", "International TV Shows").
- Inferencia rapida en CPU gracias a la simplicidad del modelo (TF-IDF + regresion logistica).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.
- No dispone de modo de pensamiento (thinking mode) ni procesamiento de audio o video.

## Casos de uso

- Etiquetado automatico de catalogos de streaming: el modelo puede asignar un genero a nuevos titulos sin intervencion manual, agilizando la organizacion de bibliotecas de contenido. Es adecuado para catalogos pequenos o como primera pasada antes de un refinamiento humano.
- Prototipo de sistema de recomendacion basado en generos: combinando la prediccion de genero con filtrado colaborativo, se puede construir un motor de sugerencias sencillo para una demo o un proyecto academico.
- Enriquecimiento de metadatos: dado un CSV con titulos y descripciones, el modelo anade una columna de genero predicho, util para analisis posteriores de tendencias o distribucion de contenido.
- Herramienta educativa de ML: al ser un pipeline sklearn compacto y con codigo de ejemplo, sirve para ensenar los fundamentos de clasificacion de texto, TF-IDF y regresion logistica en cursos de ciencia de datos.
- Filtrado previo en pipelines de NLP: como paso inicial para descartar titulos de ciertos generos antes de aplicar modelos mas costosos (p. ej. LLMs) sobre un subconjunto relevante.
- Analisis exploratorio de datos de Netflix: permite estudiar la relacion entre texto descriptivo y genero, identificando patrones lexicos que caracterizan cada categoria, aunque con una precision limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la precision en test:

| Metrica | Valor |
|---|---|
| Precision en test (26 clases) | 0.459 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar de LLMs, ya que este modelo no pertenece a esa categoria. Tampoco hay comparaciones con otros clasificadores de genero de Netflix en la documentacion.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (no requiere GPU; el modelo se ejecuta completamente en CPU).
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente.
- Compatible con hardware de consumo: si, incluso en Raspberry Pi o maquinas con poca memoria, dado que el pipeline es un modelo lineal con pesos TF-IDF de tamano reducido.
- Opciones de despliegue: se puede servir mediante un microservicio con Flask o FastAPI, o integrarse en un script Python usando `joblib.load()`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje grandes.
- Latencia y throughput estimados: no disponibles oficialmente, pero al ser un modelo lineal sobre una matriz TF-IDF dispersa, la inferencia por muestra suele ser del orden de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la documentacion. Existen proyectos de codigo abierto similares, como `redswimmer/netflix-genre-prediction` (GitHub), que utiliza embeddings semanticos y clasificadores multi-etiqueta, o `Rushil24/Netflix-ML-Unsupervised`, que combina ML y IA generativa. Sin embargo, no hay datos de rendimiento publicados que permitan una comparacion rigurosa con este modelo. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Enfoque | Precision reportada | Licencia |
|---|---|---|---|
| bolewara/netflix-genre-classifier | TF-IDF + LogisticRegression | 0.459 (test) | MIT |
| redswimmer/netflix-genre-prediction | Embeddings semanticos + multi-etiqueta | no disponible | no disponible |
| Rushil24/Netflix-ML-Unsupervised | Analisis no supervisado + IA generativa | no disponible | no disponible |

## Limitaciones y advertencias

- Precision limitada: con un 45,9% de acierto sobre 26 clases, el modelo comete errores frecuentes y no es fiable para decisiones criticas.
- Sesgo de clases: el dataset original esta desbalanceado; aunque se eliminaron clases con menos de 20 ejemplos, las clases mayoritarias (Dramas, Comedies) probablemente dominan las predicciones.
- Dependencia del idioma: el dataset `shivamb/netflix-shows` esta en ingles; el modelo no ha sido evaluado en otros idiomas y su rendimiento en castellano u otras lenguas seria presumiblemente muy pobre.
- Sin manejo de contexto largo: al ser un modelo de bolsa de palabras, ignora el orden de las palabras y no puede capturar matices semanticos complejos ni relaciones entre frases.
- Riesgo de alucinacion: no aplica, al ser un clasificador determinista; sin embargo, puede producir etiquetas incorrectas con alta confianza.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantias de exactitud ni soporte.
- Formato de pesos propietario: el archivo `.joblib` es especifico de Python y sklearn; no es portable a otros ecosistemas sin convertir el pipeline.
- Fecha de creacion: el modelo fue creado en agosto de 2026, lo que sugiere que los datos de entrenamiento pueden estar desactualizados respecto al catalogo actual de Netflix.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bolewara/netflix-genre-classifier
- Dataset de entrenamiento (Kaggle): https://www.kaggle.com/datasets/shivamb/netflix-shows (referenciado en la model card)
- Proyecto similar en GitHub (redswimmer): https://github.com/redswimmer/netflix-genre-prediction
- Proyecto similar en GitHub (Rushil24): https://github.com/Rushil24/Netflix-ML-Unsupervised
