# smd20/imdb-distilbert-sentiment

## Resumen

`smd20/imdb-distilbert-sentiment` es un modelo de clasificacion binaria de sentimiento (positivo/negativo) obtenido mediante fine-tuning de `distilbert-base-uncased` sobre el dataset IMDB de resenas de peliculas. Lo desarrolla Samad Sohrab (usuario `smd20` en Hugging Face) como parte de un estudio comparativo entre arquitecturas neuronales simples, recurrentes (BiLSTM) y transformers para el analisis de sentimiento en IMDB.

El modelo parte de DistilBERT, una destilacion de BERT con 6 capas, tamano oculto de 768 y 12 cabezas de atencion, al que se anade una cabeza de clasificacion lineal (768 a 2) con dropout. El checkpoint publicado contiene 66.955.010 parametros en formato safetensors y ocupa aproximadamente 0,3 GB en el repositorio. La longitud maxima de secuencia utilizada es de 256 tokens, y el modelo esta etiquetado exclusivamente para ingles.

Su relevancia es acotada pero util: constituye una linea base ligera y rapida para clasificacion de sentimiento en ingles, con una exactitud reportada del 89,95 % en test, que supera claramente las lineas base del mismo estudio (embedding + pooling con 86,04 % y BiLSTM con 85,44 %). Al estar publicada bajo licencia Apache 2.0 y en formato compatible con `transformers` y `text-embeddings-inference`, puede desplegarse sin friccion en pipelines de inferencia existentes. No obstante, el repositorio no registra descargas ni interacciones, y no se han publicado resultados frente a otros modelos de referencia externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, 768 de tamano oculto, 12 cabezas de atencion) + cabeza de clasificacion lineal (768 a 2) con dropout |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia usada en entrenamiento; el backbone admite hasta 512 posiciones) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 67 M de parametros, la cuantizacion a int8 o fp16 es viable con herramientas genericas como PyTorch o ONNX Runtime) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`, framework PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo DistilBERT con 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, inicializado desde `distilbert-base-uncased` y rematado con una capa lineal de 768 a 2 dimensiones precedida de dropout. Las etiquetas de salida son `LABEL_0` (negativo) y `LABEL_1` (positivo). El tokenizador es el WordPiece uncased propio de DistilBERT.

El ajuste fino se realizo durante 2 epocas con AdamW, learning rate de 5e-5, batch size de 16 y longitud maxima de 256 tokens, sobre 10.000 muestras de entrenamiento del dataset IMDB, usando otras 10.000 muestras como validacion (tomadas del split de test). No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un fine-tuning supervisado convencional. Los resultados de entrenamiento muestran perdida de entrenamiento de 0,3598 en la epoca 1 y 0,1919 en la epoca 2, con perdida de validacion de 0,2688 y 0,3362 respectivamente, lo que indica un sobreajuste leve a partir de la primera epoca segun el propio autor. No se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) de texto en ingles, con salida de logits sobre dos etiquetas.
- Analisis de resenas de peliculas de hasta 256 tokens; los textos mas largos se truncan.
- Integracion directa con el pipeline `text-classification` de Hugging Face y con `AutoModelForSequenceClassification`.
- Compatibilidad declarada con `text-embeddings-inference` y endpoints de inferencia.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de resenas de peliculas: clasificar automaticamente resenas enviadas por usuarios en plataformas de cine o streaming y enrutar las negativas a colas de atencion al cliente, aprovechando el bajo coste computacional del modelo (67 M de parametros).
- Filtrado de opiniones en agregadores de critica cinematografica: procesar lotes de resenas en ingles para calcular proporciones de sentimiento positivo y negativo por titulo, con truncado a 256 tokens para resenas largas.
- Linea base en investigacion de NLP: servir como referencia rapida para comparar nuevas arquitecturas de clasificacion de sentimiento sobre IMDB, dado que el autor documenta resultados de BiLSTM y redes simples en el mismo estudio.
- Enriquecimiento de datasets: etiquetar automaticamente grandes volumenes de texto en ingles con polaridad positiva/negativa antes de un analisis posterior, usando inferencia por lotes en CPU o GPU modestas.
- Deteccion de campanas de resenas negativas: analizar rapidamente el sentimiento de resenas dirigidas a un estreno concreto para detectar picos anomalos de polaridad negativa.
- Prototipado rapido de producto: validar la viabilidad de una funcionalidad de analisis de sentimiento en ingles antes de invertir en un modelo mayor, gracias a la licencia Apache 2.0 y al formato safetensors compatible con `transformers`.
- Clasificacion de feedback textual en ingles: aplicar el modelo a comentarios de usuarios sobre contenido audiovisual para priorizar respuestas, siempre que se acepte su especializacion al dominio de resenas de peliculas.

## Benchmarks y rendimiento

Los unicos datos publicados proceden del estudio del propio autor y comparan arquitecturas evaluadas en el mismo experimento, no modelos externos de referencia.

| Modelo | Arquitectura | Exactitud en test | Perdida de validacion final |
|---|---|---|---|
| Linea base | Embedding + GlobalAveragePooling + Dense | 86,04 % | 0,323 |
| BiLSTM | Embedding + BiLSTM + Dense | 85,44 % | 0,328 |
| DistilBERT (este modelo) | Transformer con fine-tuning | 89,95 % | 0,336 |

Evolucion durante el entrenamiento:

| Epoca | Perdida de entrenamiento | Perdida de validacion | Exactitud de validacion |
|---|---|---|---|
| 1 | 0,3598 | 0,2688 | 89,58 % |
| 2 | 0,1919 | 0,3362 | 89,95 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, SST-2) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (67 M de parametros); en torno a 0,15 GB en fp16 e int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; por ejemplo RTX 3060, RTX 4090, T4, A100 o H100. El modelo no aprovecha GPUs de gama alta por su tamano reducido.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference`, endpoints de Hugging Face, exportacion a ONNX Runtime y cuantizacion generica con PyTorch. No se documentan variantes GGUF ni soporte explicito para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia del orden de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smd20/imdb-distilbert-sentiment` | 66,96 M | 256 tokens (uso) | 89,95 % de exactitud en IMDB (datos del autor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~67 M | 512 tokens | no disponible en esta ficha (modelo de referencia ampliamente usado para SST-2) | Apache 2.0 | Hugging Face, `transformers` |
| `nlptown/bert-base-multilingual-uncased-sentiment` | ~178 M | 512 tokens | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, `transformers` |
| BiLSTM del mismo estudio | no disponible | 256 tokens | 85,44 % de exactitud en IMDB | no disponible | solo resultados reportados |

La comparacion con los modelos externos se limita a tamano, contexto y licencia, ya que no se dispone de sus metricas en la informacion proporcionada. Frente a las alternativas del propio estudio, este modelo ofrece la mayor exactitud reportada.

## Limitaciones y advertencias

- Solo procesa texto en ingles; el rendimiento en otros idiomas no esta evaluado y previsiblemente sera deficiente.
- Esta especializado en resenas de peliculas: el rendimiento puede degradarse en otros dominios como resenas de productos o publicaciones en redes sociales.
- Las resenas de mas de 256 tokens se truncan, con posible perdida de contexto relevante.
- Puede fallar ante sarcasmo, ironia y matices linguisticos complejos, limitacion habitual en analisis de sentimiento.
- El autor documenta sobreajuste leve a partir de la primera epoca (perdida de validacion sube de 0,2688 a 0,3362), lo que sugiere que el checkpoint de la epoca 1 generalizaria mejor.
- La validacion se realizo tomando 10.000 muestras del split de test, lo que puede inflar ligeramente la exactitud reportada respecto a una evaluacion con particion independiente.
- Riesgo de alucinacion no aplica en sentido estricto al ser un clasificador, pero puede producir etiquetas erroneas con alta confianza en textos ambiguos.
- Licencia Apache 2.0: permite uso comercial con atribucion segun los terminos de la licencia; no se imponen restricciones adicionales conocidas.
- El repositorio no registra descargas ni validacion externa, por lo que la calidad del checkpoint no esta corroborada por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smd20/imdb-distilbert-sentiment
- Perfil del autor en Hugging Face: https://huggingface.co/smd20
- GitHub del autor: https://github.com/s-sohrab
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset IMDB: https://huggingface.co/datasets/imdb
