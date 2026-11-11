# iankamar/amazon-food-sentiment-models

## Resumen

Amazon Food Sentiment Models es un conjunto de cuatro clasificadores de sentimiento binario entrenados sobre resenas de productos alimenticios de Amazon. No es una red neuronal ni un modelo de lenguaje: cada variante es una regresion logistica sobre caracteristicas lexicas (bag-of-words o TF-IDF) extraidas del texto, empaquetada como pipeline de scikit-learn y serializada con joblib. Lo publica el usuario de Hugging Face iankamar y su proposito es servir como referencia sencilla y reproducible de clasificacion de sentimiento en dominio de resenas de comida.

El interes tecnico esta en la trazabilidad del experimento mas que en la potencia del modelo: la model card documenta la deduplicacion, la eliminacion de resenas de tres estrellas (neutrales), el muestreo uniforme de 60.000 resenas y una particion cronologica con fronteras por dia completo. Las cuatro variantes comparan dos vectorizadores (bag-of-words y TF-IDF) con y sin ponderacion de clases balanceada, lo que permite aislar el efecto del desbalanceo en un corpus con clara mayoria de resenas positivas.

Es relevante ahora como linea base barata y auditable: con 93,12 % de accuracy en test y un AUC ROC de 0,9581, un modelo lineal sobre n-gramas sigue siendo un punto de partida competitivo frente a clasificadores neuronales mucho mas costosos en una tarea de sentimiento de dominio acotado. Su utilidad practica queda limitada a inferencia por lotes o servicios ligeros en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica sobre caracteristicas lexicas (bag-of-words o TF-IDF), pipeline de scikit-learn |
| Parametros totales | no disponible (modelo lineal; el numero de coeficientes depende del vocabulario, con tope de 20.000 caracteristicas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; vectoriza el texto completo de cada resena) |
| Tipos de cuantizacion | no aplica (pesos en joblib, sin cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | joblib (serializacion de pipeline scikit-learn) |

## Arquitectura y entrenamiento

Cada variante es un `Pipeline` de scikit-learn que encadena un vectorizador y una regresion logistica con `C=1`, solver `liblinear` y umbral de decision fijo de 0,5. Los vectorizadores usan unigramas y bigramas, con un tope de 20.000 caracteristicas y frecuencia minima de documento de 3. La unica diferencia entre las variantes es el vectorizador (bag-of-words o TF-IDF) y el uso de pesos de clase balanceados. Ambos vectorizadores se ajustan exclusivamente sobre el texto de entrenamiento.

Los datos provienen del corpus Stanford SNAP Fine Foods (568.454 resenas originales). Se excluyen las resenas de tres estrellas, se normaliza el texto y se eliminan 30 filas con etiquetas contradictorias y 162.446 filas duplicadas, quedando 363.338 resenas no neutrales. Sobre ellas se toma una muestra uniforme de 60.000 resenas con semilla 42 y se aplica una particion cronologica con fronteras por dia completo: 41.973 de entrenamiento, 9.020 de validacion y 9.007 de test. No se emplean resenas sinteticas ni SMOTE; el tratamiento del desbalanceo se limita a la ponderacion de clases. La variante por defecto (Bag of words balanced) se selecciona por macro F1 de validacion, no por resultados de test. La actualizacion corrige el ajuste del vocabulario sobre el conjunto completo de datos y anade la comparacion real con TF-IDF.

## Capacidades

- Clasificacion binaria de sentimiento (negativo/positivo) sobre texto de resenas en ingles.
- Salida de probabilidad calibrada por clase mediante `predict_proba`, con columnas `negative` y `positive`.
- Dos representaciones de texto seleccionables: bag-of-words y TF-IDF, cada una con y sin balanceo de clases.
- Manejo explicito de desbalanceo de clases mediante `class_weight="balanced"`.
- Inferencia determinista y reproducible (semilla 42, umbral fijo de 0,5).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo de razonamiento, vision ni audio.

## Casos de uso

- Clasificacion por lotes de resenas de alimentacion: cargar `models.joblib`, aplicar `clean_text` y obtener `predict_proba` sobre miles de resenas en segundos; adecuado por su bajo coste computacional y su AUC ROC de 0,9581.
- Linea base en proyectos de NLP: sirve para fijar un umbral de rendimiento antes de invertir en un transformer, dado que alcanza 93,12 % de accuracy con un modelo lineal.
- Moderacion o triaje de opiniones en un marketplace: filtrar resenas negativas para revision manual priorizando por probabilidad, sin necesidad de GPU.
- Analisis de satisfaccion de un catalogo de productos alimenticios: agregar la proporcion de sentimiento positivo por producto o periodo a partir de las probabilidades del clasificador.
- Docencia y experimentacion reproducible: el repositorio incluye `train.py`, `metrics.json` con hash del origen e IDs de particion, y `test-predictions.npz` para verificar metricas, lo que facilita replicar el experimento.
- Prototipado rapido de un endpoint de clasificacion: al ser un pipeline de scikit-learn serializado, se puede servir con Flask o FastAPI en CPU sin dependencias pesadas.
- Comparacion metodologica de vectorizadores: las cuatro variantes permiten estudiar el efecto de TF-IDF frente a bag-of-words y del balanceo de clases sobre el mismo corpus y particion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (9.007 resenas):

| Modelo | Accuracy test | Macro F1 test | ROC AUC test |
|---|---:|---:|---:|
| Bag of words | 93,12 % | 0,8682 | 0,9581 |
| Bag of words balanced | 93,05 % | 0,8750 | 0,9574 |
| TF-IDF | 92,06 % | 0,8290 | 0,9663 |
| TF-IDF balanced | 91,76 % | 0,8644 | 0,9683 |
| Baseline mayoritaria constante | 83,69 % | 0,4556 | no disponible |

La variante por defecto es Bag of words balanced, elegida por macro F1 de validacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU.
- GPU recomendadas: no aplica; cualquier CPU convencional es suficiente.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y los pesos son un archivo joblib de un pipeline lineal.
- Despliegue: scikit-learn y joblib en Python 3.12; se puede envolver en Flask, FastAPI o un job por lotes. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos neuronales.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (producto matricial disperso sobre un maximo de 20.000 caracteristicas) se espera un coste por peticion muy bajo en CPU.
- Memoria RAM: dominada por el vocabulario y la matriz de coeficientes; no se especifica cifra exacta en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Amazon Food Sentiment Models (este) | Regresion logistica sobre n-gramas | no disponible (hasta 20.000 caracteristicas) | no aplica | 93,12 % accuracy, AUC 0,9581 (test propio) | no disponible | Hugging Face, joblib |
| Clasificadores de sentimiento basados en transformers (p. ej. destilados de BERT) | Transformer encoder | no disponible en esta ficha | no disponible en esta ficha | no disponible | no disponible | Hugging Face |
| Analisis de sentimiento con VADER | Lexico y reglas | no aplica | no aplica | no disponible en esta ficha | no disponible | Libreria Python |

No se dispone de datos verificados de benchmarks comparables entre estos modelos en la informacion proporcionada; la comparacion cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Solo ingles: no procesa resenas en otros idiomas.
- Dominio acotado: entrenado exclusivamente con resenas de productos alimenticios de Amazon; la generalizacion a otros dominios o plataformas no esta validada.
- Las resenas del mismo producto pueden aparecer en particiones temporales distintas, por lo que la evaluacion no mide generalizacion a productos nuevos.
- El baseline mayoritario alcanza 83,69 % de accuracy, de modo que la accuracy bruta sobreestima la dificultad; conviene mirar macro F1 y AUC.
- Riesgo de dependencia de artefactos lexicos: al usar n-gramas, puede apoyarse en palabras concretas del corpus y fallar ante negaciones complejas, sarcasmo o ironia.
- Umbral fijo de 0,5 sin calibracion adicional; en produccion puede requerir ajuste segun el coste relativo de falsos positivos y falsos negativos.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Los pesos se cargan con `joblib`, que puede ejecutar codigo arbitrario; cargar solo archivos de fuentes de confianza.
- No se redistribuyen las resenas originales; hay que obtener `Reviews.csv` desde la fuente original y respetar sus terminos.
- Los resultados describen prediccion de sentimiento, no relaciones causales de satisfaccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iankamar/amazon-food-sentiment-models
- Demo (Space): https://huggingface.co/spaces/iankamar/amazon-food-sentiment
- Dataset Stanford SNAP Fine Foods: https://snap.stanford.edu/data/web-FineFoods.html
