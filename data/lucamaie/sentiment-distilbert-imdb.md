# lucamaie/sentiment-distilbert-imdb

## Resumen

`lucamaie/sentiment-distilbert-imdb` es un clasificador binario de sentimiento (NEGATIVE/POSITIVE) en ingles obtenido mediante fine-tuning de `distilbert-base-uncased`, un transformer encoder destilado de BERT. El modelo lo publica el usuario lucamaie en Hugging Face bajo licencia Apache 2.0 y cuenta con 66.955.010 parametros, lo que lo situa en la gama de modelos ligeros aptos para inferencia en CPU o GPUs muy modestas.

El problema que aborda es el analisis de sentimiento sobre resenas de peliculas en ingles, un caso de clasificacion de texto muy comun en prototipos de NLP. Su relevancia es limitada: se trata de un experimento de fine-tuning con un subconjunto muy reducido de IMDB (2000 ejemplos de entrenamiento y 500 de test), no de un modelo orientado a produccion.

Arquitectura, tamano y contexto corresponden a los de DistilBERT base: 6 capas, 768 dimensiones ocultas y una ventana maxima de 512 tokens. El autor declara una accuracy de 86,8% sobre el conjunto de test de 500 ejemplos, una cifra notablemente inferior a la que se obtiene al ajustar DistilBERT sobre el dataset IMDB completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT destilado, DistilBERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (maximo heredado de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT base que reduce el numero de capas de 12 a 6 y elimina los segment embeddings, conservando 768 dimensiones ocultas y 12 cabezas de atencion. Sobre esa base se anade una cabeza de clasificacion para dos etiquetas de sentimiento. El contexto maximo es de 512 tokens, propio de la familia BERT.

El entrenamiento se realizo por fine-tuning sobre un subconjunto de IMDB: 2000 ejemplos de entrenamiento y 500 de test (seed 42). Los hiperparametros declarados son learning rate 2e-5, 3 epocas, batch size 16 y fp16, sobre una GPU T4. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo coherente con un modelo de clasificacion. No se especifica si se aplico truncado, padding o seleccion de la mejor epoca, datos que serian relevantes para replicar el resultado.

## Capacidades

- Clasificacion binaria de sentimiento (NEGATIVE/POSITIVE) sobre texto en ingles.
- Funciona especialmente bien sobre resenas de peliculas en ingles, dominio sobre el que se entreno.
- Inferencia muy rapida y con huella de memoria pequena, adecuada para entornos con recursos limitados.
- No soporta tool calling ni function calling: es un modelo de clasificacion, no generativo.
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues: solo se entreno con datos en ingles.
- No dispone de modos especiales (thinking, vision, audio), ni de generacion de codigo o matematicas.

## Casos de uso

- Clasificacion de resenas de peliculas en ingles: el modelo asigna NEGATIVE o POSITIVE a cada resena, aprovechando su entrenamiento especifico en IMDB y su ventana de 512 tokens.
- Prototipado rapido de pipelines de analisis de sentimiento: sirve como linea base para comparar con otros modelos antes de invertir en uno mas grande.
- Filtrado previo en sistemas de moderacion: puede etiquetar grandes volumenes de comentarios en ingles a bajo coste computacional para separar los claramente negativos.
- Analisis de opinion en demo o notebook educativo: su tamano (67M parametros) permite cargarlo en CPU y ejecutarlo en Google Colab o portatiles sin GPU.
- Etiquetado asistido de datos: como clasificador automatizado para pre-anotar resenas y despues revisarlas manualmente.
- Investigacion sobre destilacion y fine-tuning con pocos datos: util como referencia de que accuracy se alcanza entrenando DistilBERT con solo 2000 ejemplos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Conjunto |
|---|---|---|---|
| IMDB (subconjunto propio) | Accuracy | 86,8% | 500 ejemplos de test, seed 42 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (los pesos de 67M parametros ocupan aproximadamente 268 MB) y aproximadamente 134 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. La T4 que se uso para entrenamiento es mas que suficiente.
- Cabe holgadamente en GPUs de consumo: GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, etc.
- Tambien se puede ejecutar en CPU con latencias aceptables para clasificacion por lotes.
- Opciones de despliegue: Hugging Face Transformers (pipeline de text-classification), ONNX Runtime y servicios de inferencia de Hugging Face. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son una via directa con este repo.
- Latencia y throughput: no disponibles (el autor no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Accuracy declarada |
|---|---|---|---|---|---|
| lucamaie/sentiment-distilbert-imdb | 66,9M | 512 | Sentimiento binario (IMDB) | apache-2.0 | 86,8% en 500 ejemplos de IMDB |
| distilbert-base-uncased-finetuned-sst-2-english | 67M | 512 | Sentimiento binario (SST-2) | apache-2.0 | 91,3% en dev de SST-2 (benchmark distinto, no comparable directamente) |
| cardiffnlp/twitter-roberta-base-sentiment-latest | aprox. 125M | 512 | Sentimiento en 3 clases (tuits) | no disponible | no disponible |
| Analizadores lexicos (VADER, TextBlob) | no aplica | no aplica | Sentimiento basado en reglas | licencias variables | no disponible |

La comparacion directa de accuracy no es valida porque cada modelo se evalua sobre datasets distintos; 86,8% sobre un subconjunto de 500 ejemplos de IMDB no equivale a los resultados publicados sobre SST-2 o sobre IMDB completo.

## Limitaciones y advertencias

- Entrenado unicamente con resenas de peliculas en ingles: no es fiable en otros idiomas ni en otros dominios (redes sociales, productos, soporte tecnico).
- Corpus de entrenamiento muy reducido (2000 ejemplos): el propio autor lo senala como no apto para produccion.
- Puede reproducir sesgos presentes en el dataset IMDB.
- Dificultad para detectar ironia y sarcasmo.
- Riesgo de sobreajuste y de baja capacidad de generalizacion fuera del dominio de resenas de cine.
- La evaluacion se hizo sobre un unico conjunto de test de 500 ejemplos con una semilla fija, sin validacion cruzada, por lo que la cifra de accuracy tiene alta varianza.
- Licencia Apache 2.0, que permite uso comercial sin restricciones de atribucion mas alla de las habituales, pero la baja calidad del modelo desaconseja ese uso.
- Sin informacion sobre tokenizacion, truncado o gestion de secuencias largas en inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/lucamaie/sentiment-distilbert-imdb
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset IMDB: https://huggingface.co/datasets/imdb
- Referencia de DistilBERT (paper y modelo): https://huggingface.co/docs/transformers/model_doc/distilbert
