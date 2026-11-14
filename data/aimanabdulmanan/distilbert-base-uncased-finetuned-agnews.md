# aimanabdulmanan/distilbert-base-uncased-finetuned-AgNews

## Resumen

distilbert-base-uncased-finetuned-AgNews es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de DistilBERT base uncased sobre el corpus AgNews, un conjunto de referencia para clasificación de noticias en cuatro categorías (World, Sports, Business, Sci/Tech). Lo publica el usuario aimanabdulmanan en Hugging Face y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo conserva la arquitectura DistilBERT: un transformer encoder de 6 capas destilado de BERT-base, con 66.956.548 parámetros totales y tokenizador WordPiece en minúsculas. No es un modelo generativo ni conversacional; su única salida es una distribución sobre las cuatro etiquetas de AgNews, lo que lo sitúa en la categoría de clasificadores ligeros para tareas de enrutamiento y etiquetado de titulares.

Su relevancia práctica es acotada pero clara: con 67 M de parámetros y un repo de 1,6 GB (pesos en safetensors), puede ejecutarse en CPU con latencias de milisegundos y sirve como componente de clasificación rápida en pipelines de noticias, moderación o enriquecimiento documental. El autor declara 0,9392 de accuracy y F1 en el conjunto de evaluación, aunque la model card está generada automáticamente y no documenta la composición exacta del split ni el origen de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.956.548 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (DistilBERT base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (FP32/BF16 segun el checkpoint) |
| Idiomas soportados | No disponible; el tokenizador base es uncased y esta entrenado principalmente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de distilbert-base-uncased, un transformer encoder de 6 capas y 66 M de parametros obtenido por destilacion de conocimiento de BERT-base. La cabeza de clasificacion se sustituye por una capa lineal con cuatro salidas, correspondientes a las categorias de AgNews. El entrenamiento se realizo con el Trainer de Transformers 5.22.1 sobre PyTorch 2.14.1+cu130, con AdamW fused, learning rate 2e-5, batch size 64, scheduler lineal, 3 epocas, seed 42 y precision mixta nativa (AMP). El step final registrado es 5625, lo que implica aproximadamente 1875 pasos por epoca.

La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset (la referencia aparece como "None dataset") ni si se aplicaron tecnicas de aumento de datos o balanceo de clases. Tampoco documenta si hubo validacion cruzada o busqueda de hiperparametros. La unica innovacion tecnica reseñable es la propia destilacion del modelo base, que reduce el coste de inferencia frente a BERT-base manteniendo una precision cercana en tareas de clasificacion.

## Capacidades

- Clasificacion de texto en cuatro categorias de noticias: World, Sports, Business y Sci/Tech.
- Etiquetado de titulares y fragmentos cortos de texto en ingles (tokenizador uncased).
- Inferencia rapida en CPU y GPU para volúmenes altos de documentos.
- Integracion directa con la pipeline `text-classification` de Transformers.
- Compatibilidad con Text Embeddings Inference y endpoints de Hugging Face (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidades multilingues no documentadas; el modelo base esta orientado a ingles.

## Casos de uso

- Enrutamiento de noticias en un agregador: clasificar cada titular entrante en una de las cuatro categorias para dirigirlo al canal editorial correspondiente, con latencia de milisegundos en CPU.
- Moderacion y filtrado tematico: descartar o priorizar contenidos de determinadas secciones (por ejemplo, Sci/Tech) antes de un proceso de revision humana.
- Etiquetado automatico de corpus historicos: procesar archivos de noticias en ingles y generar metadatos de categoria para busqueda y analitica.
- Preprocesamiento en pipelines de RAG: asignar categoria a documentos antes de indexarlos, permitiendo filtros de recuperacion por seccion.
- Clasificacion de tickets o mensajes de soporte: reutilizar las cuatro categorias como proxy para enrutar incidencias de producto, facturacion o incidencias tecnicas, con ajuste fino adicional si fuera necesario.
- Baseline en experimentos de NLP: servir como referencia rapida y barata frente a modelos mayores en tareas de clasificacion de noticias, dado su bajo coste de despliegue.
- Servicio de inferencia en el edge: al caber en CPU y ocupar 67 M de parametros, puede desplegarse en contenedores ligeros o dispositivos con recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model card):

| Metrica | Valor |
|---|---|
| Loss | 0,1911 |
| Accuracy | 0,9392 |
| F1 | 0,9392 |

Evolucion durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 1875 | 0,1917 | 0,9342 | 0,9341 |
| 2 | 3750 | 0,1886 | 0,9355 | 0,9357 |
| 3 | 5625 | 0,1911 | 0,9392 | 0,9392 |

El model-index oficial no incluye resultados adicionales. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (67 M de parametros); en la practica cabe en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1650 en adelante es suficiente.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (TEI), endpoints de Hugging Face, ONNX Runtime y torchscript.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano y arquitectura se espera del orden de milisegundos por lote en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| distilbert-base-uncased-finetuned-AgNews | 66.956.548 | No disponible (base 512) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66.955.008 | 512 tokens | Apache 2.0 | Hugging Face |
| bert-base-uncased | 109.482.240 | 512 tokens | Apache 2.0 | Hugging Face |
| roberta-base | 124.645.632 | 512 tokens | MIT | Hugging Face |

La comparativa se limita a los modelos base porque no se han publicado resultados de benchmarks frente a otros clasificadores de AgNews en la informacion disponible. Frente a BERT-base, este modelo reduce parametros en aproximadamente un 39 % a costa de una precision ligeramente inferior en tareas genericas, aunque en AgNews el autor declara 0,9392 de accuracy.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta el dataset de entrenamiento ni el split de evaluacion, lo que impide reproducir los resultados declarados.
- El modelo esta entrenado para cuatro categorias fijas; no generaliza a otras taxonomias sin un nuevo fine-tuning.
- Tokenizador uncased y corpus base en ingles: el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea en titulares ambiguos o fuera de dominio.
- Sesgos: al derivar de BERT-base, puede heredar sesgos de genero, raza o nacionalidad presentes en el corpus original; no se han realizado evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Solo 42 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado, sin evidencia de uso en produccion.
- No apto para tareas generativas, de razonamiento o conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aimanabdulmanan/distilbert-base-uncased-finetuned-AgNews
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentacion de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Dataset AgNews (referencia): https://huggingface.co/datasets/fancyzhx/ag_news
