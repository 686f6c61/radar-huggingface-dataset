# SharathLal/flipkart-distilbert-sentiment-analysis

## Resumen

El modelo `SharathLal/flipkart-distilbert-sentiment-analysis` es un clasificador de sentimiento de tres clases (negativo, neutro, positivo) obtenido mediante fine-tuning de DistilBERT Base Uncased sobre reseñas de productos de Flipkart. Lo desarrolla SharathLal y se publica bajo licencia Apache 2.0 en Hugging Face. Resuelve la tarea de analisis de opinion a nivel de documento en ingles, orientada especificamente al dominio del comercio electronico.

Tecnicamente se trata de un transformer encoder de tipo DistilBERT con 66.955.779 parametros (aproximadamente 67 millones), una version destilada de BERT que reduce el tamano y el coste de inferencia manteniendo buena parte de la capacidad del modelo original. La longitud de contexto efectiva para la que fue entrenado es de 128 tokens, suficiente para reseñas cortas pero insuficiente para textos largos. El modelo es pequeno (repo de 0,3 GB en safetensors) y esta pensado para despliegues ligeros en CPU o GPU de gama baja.

Su relevancia es practica y acotada: sirve como componente de analisis de sentimiento dentro de pipelines de monitorizacion de opiniones, no como modelo generativo. Los resultados reportados por el autor son de 93,10 % de accuracy y 77,60 % de F1 macro sobre el conjunto de test, con un rendimiento notablemente inferior en la clase neutra (F1 0,47) debido al fuerte desbalanceo del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT Base Uncased, destilado de BERT) |
| Parametros totales | 66.955.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors de precision completa; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas destilado de BERT Base, y anade una cabeza de clasificacion de secuencia con 3 etiquetas de salida. El fine-tuning se realizo con PyTorch y Hugging Face Transformers durante 2 epocas, batch size 16, learning rate 2e-5, optimizador AdamW con weight decay 0,01, scheduler lineal con 10 % de warmup, perdida de entropia cruzada y longitud maxima de secuencia de 128 tokens, sobre una NVIDIA Tesla T4.

El dataset de entrenamiento es `Dataset-SA.csv`, un conjunto de reseñas de Flipkart con 205.052 registros originales y seis columnas (nombre de producto, precio, rating, review, summary y sentimiento). Tras combinar las columnas Review y Summary, eliminar valores vacios, normalizar etiquetas, descartar textos duplicados y textos identicos con etiquetas contradictorias, quedaron 109.653 textos unicos, divididos en 87.722 de entrenamiento y 21.931 de test mediante split estratificado 80:20 con `random_state=42`. La distribucion de clases es muy desbalanceada: 75,5 % positivo, 19,0 % negativo y solo 5,5 % neutro. La perdida media de entrenamiento paso de 0,2555 en la primera epoca a 0,1651 en la segunda (reduccion aproximada del 35,4 %). No se aplico limpieza agresiva del texto, sino que se conservo el texto combinado original.

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo = 0, neutro = 1, positivo = 2) para reseñas de productos en ingles.
- Devuelve probabilidades por clase mediante softmax, lo que permite umbralizar la confianza en produccion.
- Entrada de texto corta (hasta 128 tokens), adecuada para reseñas y resumenes combinados.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; el modelo base es uncased, por lo que normaliza mayusculas.
- No dispone de modo thinking, audio ni otras modalidades.

## Casos de uso

- Monitorizacion de opinion en marketplaces: procesar en lote las reseñas de productos y agregar la proporcion de sentimiento por producto o vendedor para detectar caidas de satisfaccion. El modelo es lo bastante pequeno para ejecutarse sobre miles de reseñas por minuto en CPU.
- Enrutamiento de tickets de atencion al cliente: clasificar el mensaje inicial del cliente como negativo, neutro o positivo y priorizar los negativos hacia agentes humanos o colas de escalado.
- Analisis de feedback post-compra: puntuar automaticamente encuestas y comentarios abiertos para construir dashboards de NPS cualitativo, usando la confianza del softmax para marcar casos dudosos para revision manual.
- Filtrado de reseñas para moderacion: identificar reseñas claramente negativas que requieran verificacion por posible fraude o incidencias de producto, con la ventaja de que el modelo es determinista y de bajo coste.
- Etiquetado asistido de datasets: preanotar grandes volumenes de reseñas en ingles para reducir el coste de anotacion humana, aceptando la limitacion en la clase neutra.
- Investigacion academica sobre sentimiento en comercio electronico: usar el modelo como baseline reproducible (licencia Apache 2.0, pesos publicos) para comparar con clasificadores mas grandes o especificos de dominio.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test de 21.931 reseñas:

| Metrica | Valor |
|---|---:|
| Accuracy | 93,10 % |
| Precision macro | 80,74 % |
| Recall macro | 75,77 % |
| F1 macro | 77,60 % |

Desglose por clase:

| Sentimiento | Precision | Recall | F1 |
|---|---:|---:|---:|
| Negativo | 0,87 | 0,90 | 0,89 |
| Neutro | 0,59 | 0,39 | 0,47 |
| Positivo | 0,96 | 0,98 | 0,97 |

Matriz de confusion (filas = real, columnas = predicho):

| Real / Predicho | Negativo | Neutro | Positivo |
|---|---:|---:|---:|
| Negativo | 3.760 | 191 | 213 |
| Neutro | 315 | 473 | 415 |
| Positivo | 240 | 140 | 16.184 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 270 MB para los pesos, mas overhead de activaciones; con batch pequeno cabe holgadamente en cualquier GPU consumer.
- En fp16 o bf16 el modelo ocupa aproximadamente 134 MB de pesos, por lo que es viable incluso en GPUs integradas o en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, T4, A10, A100). El modelo fue entrenado en una Tesla T4 y la inferencia es trivial para ese hardware.
- Cabe en GPU consumer y en CPU. Para lotes grandes en CPU conviene usar `torch.set_num_threads` y batching.
- Opciones de despliegue: transformers con PyTorch, Hugging Face Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con Inference Endpoints), ONNX Runtime y cuantizacion dinamica de PyTorch. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo (67 M de parametros y secuencias de 128 tokens) se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| SharathLal/flipkart-distilbert-sentiment-analysis | 66,96 M | 128 tokens | Clasificacion de sentimiento 3 clases (Flipkart) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificacion de sentimiento binaria (SST-2) | Apache 2.0 | Hugging Face |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 tokens | Sentimiento 3 clases (redes sociales) | MIT | Hugging Face |
| ProsusAI/finbert | ~110 M | 512 tokens | Sentimiento financiero 3 clases | Apache 2.0 | Hugging Face |

La comparativa con estos modelos es aproximada: el modelo de Flipkart esta especializado en reseñas de comercio electronico y entrenado con contexto de 128 tokens, mientras que las alternativas cubren dominios distintos y ventanas mayores. No se dispone de evaluaciones cruzadas en el mismo conjunto de test.

## Limitaciones y advertencias

- Fuerte desbalanceo de clases en el dataset (75,5 % positivo, 5,5 % neutro), lo que explica el bajo F1 de la clase neutra (0,47) y el riesgo de infravalorar reseñas neutras.
- El modelo fue entrenado solo con reseñas de Flipkart en ingles; la generalizacion a otros dominios, idiomas o tipos de texto no esta garantizada.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea: reseñas con sentimiento mixto, errores ortograficos, lenguaje informal o expresiones ambiguas pueden etiquetarse de forma incorrecta.
- Las etiquetas del dataset original pueden contener ruido o inconsistencias, lo que limita el techo de rendimiento.
- La ventana de 128 tokens trunca reseñas largas; el contenido mas alla del limite se descarta.
- Solo soporta ingles; no debe usarse con textos en castellano u otros idiomas sin reentrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte que el modelo debe tratarse como una herramienta de prediccion, no como un indicador perfecto de la opinion del cliente.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SharathLal/flipkart-distilbert-sentiment-analysis
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Libreria transformers: https://github.com/huggingface/transformers
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentacion de Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
