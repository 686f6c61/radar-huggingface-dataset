# dilarayavuz/generated-sst2-addsent-bert-lr5

## Resumen

`dilarayavuz/generated-sst2-addsent-bert-lr5` es un clasificador de texto binario obtenido por ajuste fino (fine-tuning) de `google-bert/bert-base-uncased` mediante AutoTrain, la herramienta de entrenamiento automatizado de Hugging Face. El identificador del repositorio sugiere que el ajuste se hizo sobre la tarea SST-2 (analisis de sentimiento de resenas de cine) con la variante "addsent", y que se empleo una tasa de aprendizaje de 5e-5, aunque la model card no documenta explicitamente ni el dataset ni los hiperparametros. El modelo se publica con la libreria `transformers` y pesos en formato safetensors.

Se trata de un modelo pequeno y ligero: 109.483.778 parametros en total, lo que corresponde exactamente a los 109.482.240 parametros de BERT-base mas una cabeza de clasificacion de 1.538 parametros, cifra compatible con una salida de 2 clases (768 x 2 + 2). Esto confirma que la tarea es de clasificacion binaria y no multietiqueta. El tamano del repositorio es de 1,3 GB, coherente con pesos en fp32 y los ficheros de optimizador o checkpoints intermedios de AutoTrain.

Su relevancia es acotada pero clara: es un ejemplo tipico de modelo de clasificacion ajustado con AutoTrain, con descargas y likes nulos en el momento de la consulta, sin licencia declarada y sin idiomas declarados. Resulta util como punto de partida reproducible para tareas de sentimiento binario, como baseline en experimentos de robustez y como componente ligero dentro de pipelines de inferencia en CPU. No es un modelo generativo ni conversacional, por lo que no debe evaluarse con los criterios habituales de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (12 capas, 768 de dimension oculta, 12 cabezas de atencion, 3.072 de dimension feed-forward) |
| Parametros totales | 109.483.778 |
| Longitud de contexto | 512 tokens (limite posicional de `bert-base-uncased`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, GPTQ, AWQ ni ONNX cuantizado) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base `google-bert/bert-base-uncased` se entreno fundamentalmente con texto en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Text classification (clasificacion binaria de sentimiento) |
| Modelo base | google-bert/bert-base-uncased |
| Vocabulario | WordPiece, 30.522 tokens (heredado de BERT-base-uncased) |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base en su configuracion "uncased": un encoder transformer bidireccional de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con normalizacion de capa y embeddings posicionales aprendidos de hasta 512 posiciones. El preentrenamiento original de `google-bert/bert-base-uncased` combino modelado de lenguaje enmascarado (MLM) y prediccion de la siguiente frase (NSP) sobre BooksCorpus (800 millones de palabras) y Wikipedia en ingles (2.500 millones de palabras). Sobre esa base se anade una cabeza de clasificacion lineal sobre el token `[CLS]`; el recuento de parametros confirma una salida de 2 clases.

El ajuste fino se realizo con AutoTrain, el flujo de entrenamiento automatizado de Hugging Face. El identificador del modelo indica la tarea y el dataset (SST-2 en su variante "addsent") y una tasa de aprendizaje de 5e-5, pero la model card no especifica el numero de tokens de entrenamiento, el numero de epocas, el tamano de lote, el optimizador ni si se aplicaron tecnicas adicionales de regularizacion. Tampoco se documenta ningun paso de RLHF, DPO o decodificacion especulativa, algo esperable en un modelo discriminativo de este tipo. La unica evidencia cuantitativa del entrenamiento son las metricas de validacion reportadas por el autor.

## Capacidades

- Clasificacion binaria de texto: asigna a una secuencia de entrada una de dos etiquetas (en el contexto de SST-2, sentimiento positivo o negativo).
- Analisis de sentimiento en dominios cercanos al entrenamiento (resenas, opiniones breves), con un rendimiento reportado de 0,916 de F1 y 0,905 de exactitud en validacion.
- Extraccion de representaciones contextuales del token `[CLS]` o de estados ocultos, reutilizables para transfer learning o como features en modelos posteriores.
- Procesamiento por lotes (batching) con truncado y padding estandar de `transformers`, adecuado para inferencia de alto volumen en CPU o GPU.
- Compatibilidad con la libreria `transformers` y con el pipeline `text-classification`, incluida la etiqueta `text-embeddings-inference` y `endpoints_compatible` declarada en los tags del repositorio.
- No soporta generacion de texto, razonamiento multi-paso, tool calling ni function calling.
- No dispone de modo de razonamiento (thinking mode), vision, audio ni capacidades multimodales.
- No se declaran capacidades multilingues; la model card no especifica idiomas de entrenamiento ni de uso recomendado.
- Capacidad de contexto limitada a 512 tokens por secuencia.

## Casos de uso

- Analisis de sentimiento en resenas de producto: el modelo clasifica resenas cortas como positivas o negativas y puede procesarse por lotes sobre catalogos completos en minutos, incluso en CPU, gracias a sus 109 millones de parametros.
- Monitorizacion de marca en redes sociales: permite etiquetar menciones y comentarios publicos a gran escala; cada publicacion debe truncarse a 512 tokens, lo que cubre con holgura tuits y comentarios.
- Enrutado de tickets de soporte: el sentimiento negativo puede usarse como senal para priorizar la cola de atencion o derivar el ticket a un equipo especializado antes del analisis humano.
- Analisis de encuestas NPS y formularios de feedback: clasificacion automatica de respuestas abiertas para agregar porcentajes de sentimiento por producto, pais o periodo, alimentando cuadros de mando.
- Filtrado previo en pipelines de anotacion: actuando como preanotador de baja latencia para que los anotadores humanos solo revisen los casos de baja confianza o los que discrepen del modelo.
- Investigacion sobre robustez y sesgos: la variante "addsent" del nombre apunta a conjuntos de evaluacion con perturbaciones adversarias (por ejemplo, la insercion de una frase neutral antes de la resena). El modelo puede emplearse como sujeto de estudio para medir cuanto se degrada la precision ante ese tipo de perturbaciones.
- Baseline reproducible en experimentos academicos: al estar ajustado con AutoTrain y publicarse con pesos safetensors, sirve como punto de comparacion frente a otros fine-tunings de BERT-base sobre la misma tarea.
- Clasificacion en el borde o en entornos sin GPU: con 1,3 GB de repositorio y pesos que ocupan cientos de megabytes, puede desplegarse en instancias pequenas, contenedores ligeros o incluso dispositivos con recursos limitados.

## Benchmarks y rendimiento

La model card solo reporta metricas de validacion obtenidas durante el ajuste con AutoTrain. No se especifica el split exacto, el tamano de la muestra ni si corresponde al conjunto de desarrollo de SST-2 o a la variante "addsent". No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks, y no procede extrapolarlos.

| Metrica (validacion) | Valor |
|---|---|
| Loss | 0,24532893300056458 |
| F1 | 0,9162790697674419 |
| Precision | 0,9173457508731082 |
| Recall | 0,9152148664343787 |
| AUC | 0,9654111884234939 |
| Accuracy | 0,9054497701904136 |

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 438 MB solo para pesos (109.483.778 x 4 bytes), mas activaciones y memoria del framework; en la practica, menos de 2 GB en inferencia por lotes pequenos.
- VRAM estimada en fp16/bf16: aproximadamente 219 MB de pesos; requiere conversion manual, ya que el repositorio no publica variantes de precision reducida.
- VRAM estimada en int8: aproximadamente 110 MB de pesos; requiere cuantizacion dinamica posterior (por ejemplo, con PyTorch o ONNX Runtime), no incluida en el repositorio.
- Cabe sin problemas en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 o incluso iGPU con memoria compartida. Tambien es viable en CPU exclusivamente, dado el tamano del modelo.
- GPU de centro de datos (A100, H100, L40S, T4, A10) sobredimensionadas para una sola instancia; su interes en estos entornos es el procesamiento por lotes masivo o el despliegue de muchas replicas en una misma tarjeta.
- Opciones de despliegue: pipeline `text-classification` de `transformers`, Text Embeddings Inference (la etiqueta `text-embeddings-inference` aparece en el repositorio), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), servidor propio con FastAPI o TorchServe, y exportacion a ONNX Runtime para inferencia en CPU.
- llama.cpp y Ollama no son aplicables sin una conversion previa a GGUF, que el repositorio no proporciona.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor. Como referencia orientativa, no medida sobre este modelo concreto, un BERT-base suele resolver secuencias de 128 tokens en el orden de decenas de milisegundos en CPU moderna y de pocos milisegundos en GPU de gama media-alta, con ganancias lineales al aumentar el tamano de lote.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de estos modelos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad. Las licencias de los modelos alternativos deben verificarse en sus propias fichas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dilarayavuz/generated-sst2-addsent-bert-lr5 | 109.483.778 | 512 tokens | Clasificacion binaria (sentimiento) | no disponible | Publico en Hugging Face, 0 descargas |
| textattack/bert-base-uncased-SST-2 | ~110 M (BERT-base) | 512 tokens | Clasificacion binaria de sentimiento | no disponible en esta busqueda | Publico en Hugging Face, ampliamente utilizado |
| distilbert-base-uncased-finetuned-sst-2-english | ~66 M (6 capas) | 512 tokens | Clasificacion binaria de sentimiento | no disponible en esta busqueda | Publico en Hugging Face, muy extendido |
| roberta-base (ajustado a SST-2) | ~125 M | 512 tokens | Clasificacion binaria de sentimiento | no disponible en esta busqueda | Publico en Hugging Face |

Diferencias estructurales destacables: frente a DistilBERT, este modelo conserva las 12 capas y los 768 de dimension oculta, por lo que es aproximadamente un 65 por ciento mas grande y, en principio, mas lento, a cambio de mayor capacidad de representacion. Frente a RoBERTa-base, tiene menos parametros y un vocabulario mas pequeno (30.522 frente a 50.265 en RoBERTa), con un coste de inferencia inferior.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Es imprescindible contactar con el autor o asumir que no existe permiso antes de integrarlo en un producto.
- Idiomas no declarados: la model card no especifica idiomas soportados. Dado el modelo base, el rendimiento fuera del ingles no esta garantizado y probablemente sea deficiente.
- Ausencia de documentacion del entrenamiento: no se detallan el dataset exacto, el numero de ejemplos, las epocas ni la semilla. Esto dificulta la reproducibilidad y hace que las metricas de validacion no sean verificables de forma independiente.
- Metricas de validacion sin contexto: las cifras reportadas no indican el split, el tamano de la muestra ni si corresponden a SST-2 estandar o a la variante "addsent". No deben compararse directamente con resultados publicados de otros modelos sobre SST-2.
- Riesgo de sesgo: BERT-base-uncased se entreno con BooksCorpus y Wikipedia en ingles, corpus con sesgos conocidos de genero, origen y profesion que un ajuste fino de este tamano no corrige.
- Alcance muy limitado a la tarea: el modelo solo produce una etiqueta binaria. No genera texto, no razona, no ejecuta herramientas y no mantiene conversaciones multi-turno.
- Limite de contexto de 512 tokens: las entradas mas largas se truncan, con la consiguiente perdida de informacion en documentos extensos. Los textos truncados pueden producir clasificaciones enganosas.
- Riesgo de degradacion fuera de dominio: el modelo parece entrenado sobre resenas de cine; su precision en otros dominios (soporte tecnico, finanzas, textos legales) no esta medida y puede ser notablemente inferior.
- Sin garantias de calibracion: no se publican curvas de calibracion ni umbrales recomendados. Usar la probabilidad de salida como medida de confianza en produccion requiere una validacion propia.
- Vacio de mantenimiento: 0 descargas y 0 likes, sin senales de mantenimiento posterior. No hay garantia de soporte, correccion de errores ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dilarayavuz/generated-sst2-addsent-bert-lr5
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- AutoTrain (herramienta de entrenamiento empleada): https://huggingface.co/autotrain
- Libreria transformers: https://github.com/huggingface/transformers

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados correspondian a contenido turistico sin relacion con el modelo. No se han localizado papers, blogs ni demos adicionales.
