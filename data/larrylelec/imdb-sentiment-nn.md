# LarryLelec/imdb-sentiment-nn

## Resumen

`LarryLelec/imdb-sentiment-nn` es un clasificador binario de sentimiento (negativo/positivo) para resenas de peliculas en ingles. No es un modelo de lenguaje: es un perceptron multicapa (MLP) de tres capas entrenado sobre caracteristicas TF-IDF extraidas de texto, publicado por el usuario LarryLelec bajo licencia MIT. Su relevancia es acotada: se trata de un artefacto de demostracion de un pipeline de entrenamiento automatizado mediante GitHub Actions, no de un modelo destinado a produccion general.

La arquitectura es deliberadamente simple: una red `20000 → 256 → 64 → 2` con activaciones ReLU y dropout de 0,5, alimentada por un `TfidfVectorizer` de scikit-learn configurado con unigramas y bigramas sobre un vocabulario de 20.000 terminos. El modelo se entrena sobre un subconjunto equilibrado de 10.000 resenas del dataset IMDB (5.000 positivas y 5.000 negativas), con particion 80/10/10.

El interes practico reside en su ligereza y en la reproducibilidad del flujo de publicacion: cada push regenera los pesos y los sube al repositorio de Hugging Face. Para tareas de analisis de sentimiento en ingles con latencia muy baja y sin GPU, puede servir como linea base, pero queda muy lejos de las capacidades de un transformer preentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) sobre caracteristicas TF-IDF; capas 20000 → 256 → 64 → 2, ReLU, dropout 0.5 |
| Parametros totales | no disponible (no se publica el recuento; estimable en el orden de 5,1 M a partir de las dimensiones de capa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo no procesa secuencias; opera sobre un vector TF-IDF de 20.000 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos en `state_dict` de PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch `state_dict`); vectorizador en `vectorizer.pkl` (pickle de scikit-learn); metadatos en `config.json` y `metrics.json` |

## Arquitectura y entrenamiento

El modelo no es un transformer ni procesa texto de forma secuencial. La entrada se construye con un `TfidfVectorizer` de scikit-learn que aplica TF sublinear sobre unigramas y bigramas, limitado a 20.000 terminos. Ese vector disperso se pasa a una red densa de tres capas (`20000 → 256 → 64 → 2`) con ReLU y dropout de 0,5 entre capas, y una salida de dos logits para clasificacion binaria.

El entrenamiento usa Adam con tasa de aprendizaje 0,0003 durante 6 epocas, con parada temprana monitorizando la precision de validacion. Los datos provienen de `imdb_balanced_10k.csv` (5.000 resenas positivas y 5.000 negativas), dividido 80/10/10. No se documenta uso de RLHF, DPO ni tecnicas de ajuste fino adicionales; tampoco se especifica el numero de tokens de entrenamiento ni la composicion detallada del corpus mas alla del dataset IMDB. La innovacion tecnica destacable es operativa, no arquitectonica: el pipeline se ejecuta en GitHub Actions en cada push y publica automaticamente pesos, vectorizador y metricas.

## Capacidades

- Clasificacion binaria de sentimiento (negativo/positivo) en resenas de peliculas en ingles.
- Extraccion de caracteristicas TF-IDF con unigramas y bigramas (20.000 terminos), lo que captura algunas negaciones y expresiones de dos palabras.
- Inferencia en CPU con latencia muy baja, sin necesidad de GPU.
- Salida de dos logits que pueden convertirse en probabilidades mediante softmax.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Linea base para analisis de sentimiento en resenas de cine: util para establecer un suelo de rendimiento (F1 de 0,9062 en el conjunto de test) antes de invertir en un transformer, con un coste computacional minimo.
- Moderacion de comentarios en foros de cine: clasificar rapidamente resenas como negativas o positivas para priorizar revision humana, aprovechando la inferencia en CPU.
- Etiquetado masivo de corpus de resenas: procesar lotes grandes de texto en ingles con un pipeline de scikit-learn y PyTorch sin GPU, a un coste por documento muy bajo.
- Prototipado de APIs de clasificacion: el script `predict.py` permite exponer un endpoint de sentimiento en minutos para validar una integracion antes de migrar a un modelo mayor.
- Filtrado previo en pipelines de datos: descartar o agrupar resenas por polaridad antes de pasarlas a un modelo generativo, reduciendo el volumen de texto que llega a etapas mas caras.
- Docencia y demostracion de MLOps: el repositorio ilustra un flujo completo de entrenamiento y publicacion automatizada con GitHub Actions, util como ejemplo reproducible en cursos de machine learning.
- Analisis de tendencias de opinion: agregar la polaridad de resenas por pelicula o periodo para construir series temporales de sentimiento, dado el bajo coste por inferencia.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (1.000 resenas):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9070 |
| Precision | 0,9145 |
| Recall | 0,8980 |
| F1 | 0,9062 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no cubre esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano de la red (del orden de 5,1 M de parametros en float32) el uso de memoria es de decenas de MB, muy por debajo de cualquier GPU consumer.
- GPU recomendadas: no necesarias; el modelo esta pensado para ejecutarse en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaria sin aprovecharse de ella.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU; tambien en Raspberry Pi y contenedores de baja memoria.
- Opciones de despliegue: PyTorch nativo con el script `predict.py` incluido; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del modelo (una multiplicacion matriz-vector dispersa y dos capas densas pequenas) se espera una latencia del orden de milisegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LarryLelec/imdb-sentiment-nn | MLP sobre TF-IDF | no disponible (orden de 5,1 M) | no aplica (vector TF-IDF de 20.000 dim.) | MIT | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros clasificadores de sentimiento en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa rigurosa con alternativas como DistilBERT o RoBERTa fine-tuneados en IMDB.

## Limitaciones y advertencias

- Solo admite ingles; cualquier texto en otro idioma producira predicciones sin significado.
- Dominio restringido a resenas de peliculas: el vocabulario TF-IDF y la distribucion de entrenamiento estan sesgados hacia ese genero, por lo que el rendimiento caera en otros dominios (opiniones de productos, redes sociales, texto clinico).
- No modela el orden de las palabras mas alla de bigramas, por lo que pierde dependencias de largo alcance y puede fallar con negaciones complejas, ironia o sarcasmo.
- Riesgo de alucinacion no aplica (no genera texto), pero si de clasificacion erronea en casos ambiguos o de vocabulario fuera del top 20.000 terminos.
- Sesgos conocidos: no se documenta ningun analisis de sesgos; el dataset IMDB puede contener desequilibrios demograficos o de genero no evaluados.
- El vectorizador se distribuye como `vectorizer.pkl`, un pickle de scikit-learn; cargarlo ejecuta codigo arbitrario, por lo que solo debe hacerse desde una fuente de confianza, tal como advierte el propio autor.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no se ofrece ninguna garantia sobre el rendimiento en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad; debe tratarse como un artefacto de demostracion, no como un componente listo para produccion.
- No se publican curvas de calibracion ni umbrales recomendados; las probabilidades de salida pueden no estar bien calibradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LarryLelec/imdb-sentiment-nn
- Dataset IMDB (referenciado en la model card): https://huggingface.co/datasets/imdb
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo o demos adicionales.
