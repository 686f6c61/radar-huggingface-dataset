# AhmedRafiq/my-imdb-model

## Resumen

my-imdb-model es un modelo de clasificación de texto ajustado (fine-tuned) a partir de distilbert/distilbert-base-uncased, publicado en Hugging Face por el usuario AhmedRafiq. Se trata de un clasificador binario entrenado aparentemente sobre reseñas de películas del conjunto de datos IMDb (análisis de sentimiento positivo/negativo), aunque la model card no especifica el dataset exacto y lo declara como "unknown dataset".

El modelo hereda la arquitectura DistilBERT: un transformer encoder destilado de BERT con unos 66,9 millones de parámetros, mucho más ligero que BERT-base (110 M), lo que lo hace adecuado para desplegarse en entornos con recursos limitados o para inferencia a gran escala con bajo coste. Según la model card, alcanza una accuracy de 0,86 y una pérdida de 0,3599 en su conjunto de evaluación.

Su relevancia es principalmente didáctica y de nicho: es un modelo de autor individual con muy pocas descargas (14 en el momento de la ficha), sin documentación detallada ni benchmarks comparativos publicados. Resulta útil como ejemplo de fine-tuning de DistilBERT para análisis de sentimiento, pero conviene evaluarlo con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 512 tokens (heredada de DistilBERT-base-uncased) |
| Tipos de cuantizacion | no disponible |
| Idiomas | no disponible (el modelo base esta entrenado en ingles, sin distinguir mayusculas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con text-embeddings-inference y endpoints de Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT-base-uncased, un transformer encoder de 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, obtenido mediante destilacion de conocimiento (knowledge distillation) a partir de BERT-base. Conserva aproximadamente el 97 % de la capacidad del modelo original con un 40 % menos de parametros y una inferencia notablemente mas rapida. Sobre esta base se ha anadido una cabeza de clasificacion para la tarea de text-classification.

El ajuste fino se realizo con la libreria Transformers (version 5.20.2) y PyTorch 2.11.0+cu130, usando el Trainer estandar. Los hiperparametros documentados son: learning rate de 2e-05 con planificacion lineal, optimizador AdamW (variante fused de PyTorch, betas 0.9/0.999, epsilon 1e-08), batch de entrenamiento de 16, batch de evaluacion de 8, semilla 42, precision mixta nativa (AMP) y 3 epocas de entrenamiento (375 pasos). El dataset de entrenamiento no esta documentado en la model card, aunque el nombre del modelo sugiere que se trata de reseñas de IMDb. No hay indicios de RLHF ni DPO, algo normal en un clasificador encoder de este tipo.

## Capacidades

- Clasificacion binaria de texto (pipeline text-classification), presumiblemente sentimiento positivo/negativo en reseñas de cine.
- Procesamiento de texto en ingles sin distinguir mayusculas (heredado del modelo base uncased).
- Generacion de embeddings de sentencia compatibles con text-embeddings-inference, aprovechable como encoder ligero.
- No soporta generacion de texto, razonamiento, codigo, ni tool calling: es un modelo encoder puro.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento.
- Capacidades multilingues: no disponibles; el modelo base esta limitado al ingles.

## Casos de uso

- Analisis de sentimiento de reseñas de cine: clasifica automaticamente reseñas de IMDb u otras plataformas como positivas o negativas, con una accuracy declarada del 86 %.
- Monitorizacion de opinion en redes sociales sobre estrenos: puede procesar lotes de menciones cortas para medir la recepcion de una pelicula, aprovechando su bajo coste de inferencia.
- Filtrado previo en pipelines de datos: como encoder ligero, sirve para etiquetar grandes volumenes de texto en fases tempranas de un pipeline de ETL antes de un analisis mas costoso.
- Integracion en endpoints de inferencia gestionados: al estar marcado como compatible con text-embeddings-inference y endpoints de Hugging Face, puede desplegarse como servicio de clasificacion con latencia baja.
- Base para transfer learning adicional: al ser un DistilBERT ya afinado en una tarea de sentimiento, puede servir como punto de partida para afinar en dominios cercanos (reseñas de productos, series, videojuegos).
- Prototipado educativo: util como ejemplo practico de fine-tuning de un transformer encoder con hiperparametros documentados y reproducibles (semilla 42).

## Benchmarks y rendimiento

El model-index de la model card no incluye resultados estructurados comparables (la lista de resultados esta vacia). Los unicos datos disponibles son los declarados por el autor sobre su propio conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 0,3599 |
| Accuracy (evaluacion final) | 0,86 |
| Loss (epoca 1) | 0,3345 |
| Accuracy (epoca 1) | 0,854 |
| Loss (epoca 2) | 0,3625 |
| Accuracy (epoca 2) | 0,854 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, SST-2, etc.) ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 300-400 MB en FP32 (el repositorio pesa 0,3 GB); menos de 200 MB con cuantizacion o FP16. Es un modelo muy ligero.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 o incluso una GPU integrada con soporte ONNX/CPU bastan para inferencia.
- Consumer GPUs: cabe sobradamente en cualquier GPU de consumo actual (desde una GTX 1650 hacia arriba) e incluso funciona de forma razonable solo con CPU.
- Opciones de despliegue: transformers/PyTorch, Hugging Face Inference Endpoints, text-embeddings-inference (TEI), ONNX Runtime y Optimum. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son opciones directas sin conversion.
- Latencia y throughput: no disponibles como datos publicados; por tamano y arquitectura (encoder de 6 capas), se espera latencia de pocos milisegundos por secuencia en GPU y alto throughput en lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| AhmedRafiq/my-imdb-model | 66,9 M | 512 tokens | Clasificacion de sentimiento (IMDb) | Apache 2.0 |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Sentimiento binario (SST-2) | Apache 2.0 |
| bert-base-uncased (afinado) | 110 M | 512 tokens | Clasificacion de texto general | Apache 2.0 |
| roberta-base (afinado) | 125 M | 512 tokens | Clasificacion de texto general | MIT |

Frente al DistilBERT afinado en SST-2 oficial de Hugging Face, este modelo ofrece la misma arquitectura y licencia, pero sin documentacion del dataset ni benchmarks estandarizados. Frente a variantes basadas en BERT-base o RoBERTa-base, sacrifica algo de precision potencial a cambio de un 40-46 % menos de parametros y una inferencia mas rapida.

## Limitaciones y advertencias

- La model card esta mayoritariamente sin completar: el dataset de entrenamiento, los usos previstos y las limitaciones no estan documentados, lo que dificulta evaluar el alcance real del modelo.
- Sesgos: al heredar de DistilBERT-base-uncased y entrenarse presumiblemente sobre reseñas de IMDb, puede arrastrar sesgos de genero, origen y estilo presentes en el corpus original de BERT y en las reseñas de cine.
- Riesgo de alucinacion: no aplicable como tal al ser un clasificador, pero puede producir etiquetas incorrectas con texto ambiguo, sarcasmo o dominios fuera de reseñas de cine, donde el rendimiento no esta verificado.
- Limitacion de idioma: diseñado para ingles (modelo base uncased); su comportamiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- Contexto maximo de 512 tokens: reseñas muy largas deben truncarse, lo que puede perder informacion relevante al final del texto.
- Uso comercial: la licencia Apache 2.0 permite el uso comercial sin restricciones relevantes mas alla de la atribucion y la copia de la licencia.
- El modelo tiene trazabilidad minima (14 descargas, 1 like, autor individual) y la accuracy del 86 % se declara sobre un conjunto de evaluacion no especificado, por lo que debe validarse con datos propios antes de cualquier despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhmedRafiq/my-imdb-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Repositorio de Transformers: https://github.com/huggingface/transformers
