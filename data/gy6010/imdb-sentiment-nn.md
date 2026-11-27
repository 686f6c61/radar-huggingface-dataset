# GY6010/imdb-sentiment-nn

## Resumen

IMDB Sentiment Classifier (TF-IDF + MLP) es un modelo de clasificacion binaria de sentimiento publicado por el usuario GY6010 en Hugging Face. No se trata de un modelo de lenguaje generativo ni de un transformer: es un clasificador clasico que combina una vectorizacion TF-IDF de 1-2 gramos con 10.000 caracteristicas y un perceptron multicapa (MLP) de tres capas (128 → 64 → 1) implementado en PyTorch. El modelo se entrena sobre un subconjunto equilibrado de 9.984 resenas de IMDB y se publica de forma automatica mediante GitHub Actions desde el repositorio github.com/GY6010/imdb-sentiment-nn.

El problema que resuelve es acotado y bien definido: determinar si una resena de cine en ingles tiene polaridad positiva o negativa. Su relevancia es limitada en el ecosistema actual de IA open source, ya que no compite con modelos generativos de proposito general, sino que sirve como ejemplo reproducible de pipeline de clasificacion de texto (vectorizacion + red densa) con artefactos versionados y metricas publicadas.

La ficha se elabora exclusivamente a partir de la model card y los metadatos disponibles. Cualquier dato no documentado por el autor se indica explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (1-2 gramos, 10.000 caracteristicas) + MLP 128 → 64 → 1 |
| Parametros totales | no disponible (no se publica el recuento; estimable en el orden de 1,3 M solo en la primera capa densa, sin confirmar por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo no usa contexto secuencial; opera sobre vectores TF-IDF de documento completo) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (el dataset IMDB es en ingles, pero el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (state_dict de PyTorch) + `vectorizer.pkl` (scikit-learn) + `config.json` + `metrics.json` |

## Arquitectura y entrenamiento

El modelo sigue un diseno en dos etapas. Primero, un `TfidfVectorizer` de scikit-learn convierte cada resena en un vector disperso de 10.000 dimensiones usando unigramas y bigramas. Despues, un MLP denso con capas de 128 y 64 neuronas ocultas y una salida escalar (probablemente con sigmoide para clasificacion binaria) produce la prediccion de sentimiento. El checkpoint `model.pt` incluye una descripcion de la arquitectura, lo que permite reconstruir la red sin consultar el codigo fuente.

El entrenamiento se realizo sobre `imdb_balanced_10k.csv` (9.984 filas), con particion 6.988 / 999 / 1.997 para entrenamiento, validacion y test, semilla 42 y 7 epocas planificadas, seleccionando la mejor epoca (la 3). El framework declarado es PyTorch 2.15.0+cu132. No se documenta el uso de RLHF, DPO ni tecnicas de aumento de datos. La innovacion principal del repositorio no es algoridmica, sino de ingenieria: el pipeline completo se regenera y publica automaticamente en cada push a `main` mediante GitHub Actions, lo que garantiza reproducibilidad de los artefactos.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, orientada a resenas de cine.
- Salida de probabilidad calibrable, dado el ROC-AUC de 0,9595 reportado.
- Entrada de documento completo mediante vectorizacion TF-IDF (sin limite de contexto secuencial explicito, mas alla del vocabulario de 10.000 caracteristicas).
- Reproducibilidad completa: el repositorio de GitHub permite reentrenar y regenerar los artefactos con `train.py`.
- Inferencia ligera en CPU, sin necesidad de GPU (los pesos son de un MLP pequeno).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se declaran capacidades multilingues; el vocabulario TF-IDF se ajusta al corpus IMDB en ingles.

## Casos de uso

- Clasificacion de resenas de cine a escala: el modelo procesa lotes de resenas y devuelve polaridad con probabilidad asociada, adecuado para paneles de opinion o analisis de reputacion de titulos.
- Filtrado previo en pipelines de moderacion: como clasificador rapido y barato, puede descartar o priorizar resenas antes de pasarlas a un modelo generativo mas costoso.
- Etiquetado automatico de datasets: util para preanotar grandes volumenes de texto con polaridad positiva/negativa y reducir el esfuerzo de anotacion manual.
- Baseline en experimentos de NLP: sirve como referencia clasica (TF-IDF + MLP) frente a modelos transformer en tareas de analisis de sentimiento.
- Demo educativa de MLOps: el repositorio ilustra un flujo completo de entrenamiento, evaluacion y publicacion automatica de artefactos con GitHub Actions, replicable en cursos y talleres.
- Analisis de sentimiento en dominios cercanos: con reentrenamiento sobre un corpus propio (por ejemplo, resenas de productos), el mismo pipeline TF-IDF + MLP puede adaptarse rapidamente sin infraestructura GPU.
- Inferencia en entornos con recursos limitados: al ejecutarse en CPU con un modelo de pocos megabytes, encaja en funciones serverless o dispositivos sin acelerador.

## Benchmarks y rendimiento

Metricas de test reportadas por el autor sobre la particion de 1.997 ejemplos:

| Metrica | Valor |
|---|---:|
| Accuracy | 0,8873 |
| Precision | 0,89 |
| Recall | 0,8838 |
| F1 score | 0,8869 |
| ROC-AUC | 0,9595 |

Matriz de confusion (test):

| | Predicho negativo | Predicho positivo |
|---|---:|---:|
| Real negativo | 890 | 109 |
| Real positivo | 116 | 882 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo cabe en memoria RAM de CPU (pesos de un MLP pequeno y vectorizador de 10.000 caracteristicas).
- GPU recomendadas: no necesarias; cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, e incluso en CPU sin aceleracion.
- Opciones de despliegue: PyTorch nativo (carga de `model.pt` y `vectorizer.pkl`), scripts `train.py` y `predict.py` del repositorio de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por la naturaleza del modelo (TF-IDF + MLP), se espera inferencia en el orden de milisegundos por muestra en CPU, sin cifras confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GY6010/imdb-sentiment-nn | TF-IDF + MLP | no disponible | no aplica | no disponible | Hugging Face + GitHub |
| Modelos transformer de sentimiento (p. ej. DistilBERT fine-tuned en SST-2/IMDB) | Transformer encoder | ~66 M (DistilBERT) | 512 tokens | generalmente Apache 2.0 o similar (segun variante) | Hugging Face |
| Clasificadores lineales TF-IDF + regresion logistica | TF-IDF + regresion | no disponible | no aplica | variable | scikit-learn / Hugging Face |

No se dispone de datos de benchmarks comparativos publicados por el autor para establecer una comparacion cuantitativa con alternativas. Las filas de modelos alternativos se incluyen como referencia de categoria, no como resultado de una evaluacion directa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con resenas de IMDB en ingles, puede heredar sesgos del corpus (dominio cinematografico, vocabulario coloquial, posibles desequilibrios demograficos del dataset original).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erroneas con alta confianza en textos fuera de dominio o con sarcasmo, negaciones complejas o resenas mixtas.
- Limitaciones de contexto o idioma: el vocabulario TF-IDF se ajusta al corpus de entrenamiento; palabras fuera de vocabulario se ignoran. No se declaran idiomas soportados y el rendimiento en lenguas distintas del ingles no esta validado.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue en produccion.
- Caveats para produccion: el modelo se publica de forma automatica en cada push, lo que implica que los artefactos pueden cambiar sin versionado semantico explicito; conviene fijar un commit concreto. Ademas, el tamano del dataset (9.984 resenas) es reducido y la evaluacion se limita a una unica particion de test.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GY6010/imdb-sentiment-nn
- Repositorio GitHub: https://github.com/GY6010/imdb-sentiment-nn
- No se han encontrado papers, blogs, demos ni otros enlaces relevantes en la informacion disponible.
