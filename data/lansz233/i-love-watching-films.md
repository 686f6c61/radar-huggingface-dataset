# lansz233/I-love-watching-films

## Resumen

I-love-watching-films es un clasificador binario de sentimiento para resenas de cine en ingles, publicado en Hugging Face por el usuario lansz233. No se trata de un modelo de lenguaje generativo, sino de un pipeline clasico de procesamiento de lenguaje natural compuesto por una vectorizacion TF-IDF seguida de una red neuronal de pequeno tamano (320.129 parametros totales). El modelo se entrena de forma reproducible a partir de un fichero CSV de curso (`imdb_top_500.csv`) y se ejecuta mediante un script de inferencia incluido en el propio repositorio.

El problema que resuelve es acotado: dado un texto de resena cinematografica, devolver una probabilidad de sentimiento positivo. Su relevancia es fundamentalmente educativa y de referencia metodologica, ya que documenta de forma explicita el particionado de datos, la seleccion de la mejor epoca por perdida de validacion y la procedencia del dataset con hash SHA-256. No compite con modelos generativos ni con clasificadores basados en transformers; su interes practico reside en su trazabilidad y en su bajo coste de ejecucion.

El repositorio tiene un tamano de 0.0 GB (artefactos muy ligeros), cero descargas y cero likes en el momento de la consulta. La model card no declara licencia, por lo que el uso comercial queda sin autorizacion explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + red neuronal (clasificador binario de sentimiento) |
| Parametros totales | 320.129 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la vectorizacion TF-IDF, sin ventana declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no especificado; el repositorio incluye `vectorizer.pkl` (pickle de Python) y codigo de inferencia `predict.py` |

## Arquitectura y entrenamiento

La arquitectura combina una etapa de extraccion de caracteristicas mediante TF-IDF, cuyo vocabulario se ajusta exclusivamente sobre los datos de entrenamiento, con una red neuronal de 320.129 parametros que produce una salida sigmoide para clasificacion binaria. No se especifica en la informacion disponible el numero de capas, las dimensiones ocultas ni la funcion de activacion de la red. El modelo se entrena sobre el fichero `imdb_top_500.csv`, usando la columna `text` como entrada y `label` como objetivo; la columna `rating` se excluye explicitamente.

El proceso de entrenamiento se ejecuta en GitHub Actions (origen `github_actions`, commit `e898543e1b2b8f20214f6115c7b7735e04e822fd`). El particionado es de 349 ejemplos de entrenamiento, 75 de validacion y 75 de test, con eliminacion previa de duplicados normalizados exactos y estratificacion. La mejor epoca, seleccionada por perdida de validacion, es la 40. El conjunto de test se evalua una sola vez tras la seleccion. No se menciona uso de RLHF, DPO ni ninguna tecnica de alineacion, lo cual es coherente con un clasificador supervisado de este tamano.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles.
- Salida de probabilidad mediante funcion sigmoide, aunque el autor advierte que no es una estimacion calibrada de confianza.
- Inferencia local mediante linea de comandos: `python predict.py "texto" --model-dir .`.
- Ejecucion reproducible a partir de los artefactos incluidos en el repositorio (vectorizador y pesos).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles declarado.

## Casos de uso

- Analisis de sentimiento en resenas de cine en ingles: el modelo clasifica resenas individuales con una precision de test de 0.8133, suficiente para tareas de etiquetado exploratorio o prototipado rapido.
- Docencia y aprendizaje de pipelines de NLP: sirve como ejemplo completo y reproducible de TF-IDF mas red neuronal, con particionado, seleccion de epoca y evaluacion documentados.
- Filtrado de resenas en un prototipo de recomendador: permite separar resenas positivas de negativas antes de alimentar un sistema de ranking o de resumen.
- Moderacion ligera de opiniones: puede marcar resenas con polaridad negativa para revision humana en un foro o catalogo de peliculas.
- Validacion de pipelines de CI/CD para modelos de ML: el entrenamiento se ejecuta en GitHub Actions con un commit identificado, lo que facilita pruebas de regresion del flujo de entrenamiento.
- Baseline de comparacion: util como referencia de rendimiento minima antes de adoptar clasificadores basados en transformers o modelos generativos.
- Etiquetado de bajo coste en entornos sin GPU: al ser un modelo de 320.129 parametros, la inferencia es viable en CPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de test (test accuracy) | 0.8133 |
| F1 macro de test | 0.8130 |
| Tamano de test | 75 ejemplos |
| Mejor epoca (por perdida de validacion) | 40 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El autor advierte que el conjunto de test es pequeno y que la puntuacion no garantiza una generalizacion amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el modelo tiene 320.129 parametros y un vectorizador TF-IDF, por lo que cabe en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: si, aunque no es necesario; puede ejecutarse en cualquier equipo.
- Opciones de despliegue: ejecucion local mediante el script `predict.py` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| lansz233/I-love-watching-films | 320.129 | no disponible | no disponible | TF-IDF + red neuronal |
| Clasificadores basados en BERT para IMDb | no disponible | no disponible | no disponible | Transformer preentrenado |
| Modelos de sentimiento en scikit-learn (p. ej. regresion logistica sobre TF-IDF) | no disponible | no disponible | no disponible | TF-IDF + modelo lineal |

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El conjunto de test tiene solo 75 ejemplos, por lo que la precision de 0.8133 no garantiza generalizacion a otros dominios o distribuciones.
- El modelo esta disenado exclusivamente para resenas de cine en ingles; su rendimiento fuera de ese dominio no esta validado.
- La salida sigmoide no es una probabilidad calibrada; no debe interpretarse como nivel de confianza fiable.
- `vectorizer.pkl` es un fichero pickle de Python: solo debe cargarse desde fuentes de confianza por riesgo de ejecucion de codigo arbitrario.
- No se declara licencia, por lo que el uso comercial no esta autorizado explicitamente y requiere consulta al autor.
- No es adecuado para decisiones criticas de seguridad ni para produccion de alto riesgo.
- El vocabulario TF-IDF se ajusta solo con datos de entrenamiento, lo que limita la cobertura de terminos no vistos.
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset de curso pequeno puede heredar sesgos de la muestra.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificaciones erroneas en textos ambiguos o sarcasticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lansz233/I-love-watching-films
- Commit de entrenamiento en GitHub: e898543e1b2b8f20214f6115c7b7735e04e822fd (referenciado en la model card, sin URL completa disponible)
- Dataset de origen: `imdb_top_500.csv`, SHA-256 `23b5d6f040bcf36b648ed8fedb4cad57a6713f2b53abf07a29e947c34486178e` (sin URL publica disponible)
