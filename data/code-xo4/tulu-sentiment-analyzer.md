# code-xo4/Tulu-Sentiment-Analyzer

## Resumen

Tulu-Sentiment-Analyzer es un clasificador de sentimiento para la lengua tulu (dravídica, hablada principalmente en Karnataka y Kerala, India), publicado en HuggingFace por el usuario code-xo4 bajo licencia MIT. No es un modelo de lenguaje generativo ni una red neuronal profunda: se trata de un pipeline clásico de aprendizaje automatico formado por un vectorizador TF-IDF seguido de una regresion logistica, serializado con joblib y acompanado de una interfaz Gradio.

El modelo resuelve una tarea de clasificacion multiclase de tres etiquetas (positivo, neutro y negativo) sobre texto en tulu. Segun la model card, fue entrenado con 1.131 muestras etiquetadas y alcanza un macro-F1 de 0,514 ± 0,035 medido mediante validacion cruzada anidada de cinco particiones. No se especifican la composicion del corpus, el origen de las anotaciones ni la configuracion exacta del vectorizador.

Su relevancia se enmarca en el ambito de las lenguas de bajos recursos: el tulu carece de corpus anotados amplios y de modelos especificos, por lo que cualquier recurso publico de clasificacion, aunque sea con un rendimiento moderado, resulta util como linea base reproducible. Conviene senalar que el repositorio tiene 0 descargas y 0 likes, y que el archivo de pesos no esta incluido en el repo (tamano 0.0 GB), por lo que debe aportarse manualmente antes del despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline clasico de scikit-learn: vectorizador TF-IDF + regresion logistica |
| Parametros totales | no disponible (depende del tamano del vocabulario y del numero de coeficientes, no declarado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo generativo autorregresivo) |
| Tipos de cuantizacion | no disponible (no aplica: se distribuye serializado en joblib, no en precisiones reducidas) |
| Idiomas soportados | tulu (segun el nombre del modelo); la model card no declara lista de idiomas |
| Licencia | MIT |
| Formato de pesos | joblib (`lr_tulu_final.joblib`), que incluye modelo y codificador de etiquetas |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un clasico bag-of-words: un `TfidfVectorizer` que convierte el texto en tulu en vectores dispersos de frecuencias ponderadas, seguido de una `LogisticRegression` que produce la probabilidad de cada una de las tres clases. El artefacto final (`lr_tulu_final.joblib`) empaqueta conjuntamente el clasificador y el codificador de etiquetas, y se sirve a traves de una interfaz Gradio (`app.py`, SDK 4.44.0).

El entrenamiento se realizo sobre 1.131 muestras etiquetadas. La unica metrica reportada por el autor es un macro-F1 de 0,514 ± 0,035, obtenido con validacion cruzada anidada de cinco particiones, lo que indica que el ajuste de hiperparametros se anido dentro del bucle de evaluacion. No se documentan el numero de tokens de entrenamiento, la procedencia del corpus, el esquema de anotacion, el rango de n-gramas, el metodo de ponderacion de sublineales ni si se aplico balanceo de clases. Tampoco hay indicios de tecnicas de aumento de datos ni de modelos de embeddings contextuales, lo que limita la capacidad del sistema para capturar negaciones y dependencias de largo alcance.

## Capacidades

- Clasificacion de sentimiento en tres clases (positivo, neutro, negativo) para texto en tulu.
- Inferencia en CPU sobre texto corto o de longitud media.
- Exposicion como servicio mediante interfaz Gradio (`app.py`).
- No soporta generacion de texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No se declara capacidad multilingue ni transferencia entre lenguas.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Monitorizacion de redes sociales en tulu: el clasificador puede procesar publicaciones y comentarios para etiquetar la polaridad agregada por tematica o por region, aprovechando que funciona en CPU y no requiere GPU.
- Analisis de opiniones en plataformas de contenido regional: foros y portales de noticias en tulu pueden clasificar comentarios de usuarios para detectar quejas recurrentes o reacciones negativas ante cambios de producto.
- Atencion al cliente en lenguas regionales: como etapa de enrutado previo, etiquetar mensajes entrantes en tulu para dirigir automaticamente los casos negativos a un agente humano.
- Investigacion academica en linguistica de bajos recursos: sirve como linea base reproducible (macro-F1 0,514) contra la que comparar aproximaciones basadas en transformers multilingues sobre el mismo conjunto de 1.131 muestras.
- Curación de corpus: usar las probabilidades del modelo como filtro de preanotacion para reducir el esfuerzo humano en el etiquetado de nuevos datos en tulu.
- Analisis de encuestas y formularios abiertos: clasificar respuestas cualitativas recogidas en tulu en comunidades locales para resumir la distribucion de sentimiento por pregunta.
- Cuadros de mando de opinion publica: integrar la salida del modelo en un dashboard que agregue la polaridad por franja temporal y detecte picos de negatividad.

## Benchmarks y rendimiento

| Metrica | Valor | Metodo |
|---|---|---|
| Macro-F1 | 0,514 ± 0,035 | Validacion cruzada anidada de 5 particiones |
| Conjunto de datos | 1.131 muestras etiquetadas | No se detalla la particion |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparaciones con MMLU, HumanEval, GSM8K ni con metricas de tareas generativas, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el pipeline se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente para la inferencia de un TF-IDF mas regresion logistica.
- Compatibilidad con GPU de consumo: irrelevante; no es un modelo de red neuronal profunda.
- Memoria RAM estimada: no disponible con precision; depende del tamano del vocabulario TF-IDF, que no se declara. En cualquier caso, un modelo de este tipo con 1.131 muestras de entrenamiento suele ocupar del orden de megas.
- Opciones de despliegue: Python con scikit-learn y joblib, mas la interfaz Gradio incluida (`app.py`, SDK 4.44.0). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos en safetensors ni GGUF.
- Latencia y throughput estimados: no disponibles. Por la naturaleza del pipeline (vectorizacion dispersa y regresion logistica), la latencia esperada es de milisegundos por documento, pero el autor no publica cifras.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la informacion proporcionada. A continuacion se contrasta cualitativamente con alternativas habituales para clasificacion de sentimiento en lenguas de bajos recursos; los datos de las alternativas son de conocimiento general y no proceden de la model card ni de la busqueda web.

| Modelo | Tipo | Parametros | Idiomas | Licencia |
|---|---|---|---|---|
| Tulu-Sentiment-Analyzer | TF-IDF + regresion logistica | no disponible (depende del vocabulario) | tulu | MIT |
| mBERT (bert-base-multilingual-cased) | Transformer encoder | ~110 M | 104 idiomas | Apache 2.0 |
| XLM-R base | Transformer encoder | ~278 M | 100 idiomas | MIT |
| MuRIL | Transformer encoder | variable por version | 16 idiomas indios | Apache 2.0 |

Nota: no se ha verificado que los tres modelos alternativos incluyan tulu en sus datos de preentrenamiento ni que existan versiones ajustadas para esta tarea, por lo que la comparacion debe tomarse solo como referencia de categoria.

## Limitaciones y advertencias

- El macro-F1 reportado (0,514 ± 0,035) esta muy cerca del rendimiento aleatorio en una tarea de tres clases (en torno a 0,33 de F1 macro), lo que indica una capacidad discriminativa limitada.
- El entrenamiento se basa en solo 1.131 muestras, insuficiente para capturar la variabilidad dialectal y de registro del tulu.
- No se documenta la composicion del corpus ni el esquema de anotacion, por lo que se desconocen sesgos de dominio, de genero, de region o de tematica.
- No hay analisis de sesgos ni de robustez frente a texto ruidoso, abreviaturas o transliteraciones.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en entradas fuera de dominio.
- La model card no declara la lista de idiomas soportados; se asume tulu por el nombre del modelo, sin confirmacion.
- El archivo de pesos (`lr_tulu_final.joblib`) no esta incluido en el repositorio (tamano 0.0 GB); el autor indica explicitamente que hay que anadirlo antes de desplegar.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion externa ni evidencia de uso en produccion.
- La licencia MIT permite uso comercial, pero al depender de scikit-learn conviene revisar las licencias de las dependencias declaradas en `requirements.txt`.
- La fecha de creacion indicada (2026-09-19) es posterior a la fecha de consulta habitual, un dato anomalo que conviene verificar.
- Aunque se publica bajo el nombre "Tulu-Sentiment-Analyzer", el campo "pipeline" del repositorio aparece como no disponible, por lo que la integracion automatica con la libreria de HuggingFace no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/code-xo4/Tulu-Sentiment-Analyzer
- Repositorio con `app.py`, `lr_tulu_final.joblib` y `requirements.txt`: disponible dentro del propio repositorio de HuggingFace (el archivo de pesos debe anadirse manualmente).
- La busqueda web realizada no ha devuelto enlaces relevantes al modelo: los resultados obtenidos corresponden a recursos sin relacion (tests de codigo de circulacion, Codes Rousseau, Code.org, La Poste y Visual Studio Code), por lo que se descartan.
