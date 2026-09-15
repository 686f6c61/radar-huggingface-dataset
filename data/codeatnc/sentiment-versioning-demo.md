# CodeATNC/sentiment-versioning-demo

## Resumen

El modelo `CodeATNC/sentiment-versioning-demo` es un clasificador de texto binario obtenido mediante fine-tuning de `distilbert-base-uncased`, un transformer encoder de 66.955.010 parametros (6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, segun la arquitectura publicada del modelo base). Lo publica el usuario CodeATNC en HuggingFace y su unico artefacto verificable es un checkpoint de clasificacion serializado en `safetensors`, con un repositorio de 0,8 GB y una licencia Apache 2.0.

Su relevancia no viene de capacidades nuevas, sino de que sirve como ejemplo reproducible de un flujo de trabajo con `Trainer`: la model card documenta hiperparametros concretos (learning rate 2e-05, batch de entrenamiento 16, batch de evaluacion 32, semilla 42, optimizador AdamW con `fused=True` y scheduler lineal) y un unico ciclo de entrenamiento de 1 epoca y 125 pasos, con una perdida de validacion de 0,3634 y una exactitud de 0,856. Todo el entrenamiento se hizo con 2.000 ejemplos aproximadamente, segun se deduce del producto pasos x batch.

La limitacion principal es la documentacion: el autor no indica el dataset de entrenamiento ni el conjunto de evaluacion, no publica resultados en el `model-index` (el array de `results` esta vacio) y el texto de la model card es el generado automaticamente por la plantilla de `Trainer`, con las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" marcadas como "More information needed". Por tanto, la ficha describe lo que el repositorio declara y evita extrapolar cifras de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base), con cabecera de clasificacion de secuencias sobre el token `[CLS]` |
| Parametros totales | 66.955.010 (contados en los pesos `safetensors` del repositorio) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones del modelo base `distilbert-base-uncased`) |
| Tipos de cuantizacion | no disponible: no se publican variantes cuantizadas. Al ser un encoder de 67 M de parametros admite cuantizacion dinamica de PyTorch y conversion externa a ONNX o GGUF |
| Idiomas soportados | no disponible. El modelo base es `distilbert-base-uncased`, entrenado en ingles, y el autor no documenta el dataset de fine-tuning |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (biblioteca `transformers`) |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,8 GB |
| Modelo base | distilbert/distilbert-base-uncased (fine-tuning) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas con 768 dimensiones ocultas, 12 cabezas de atencion y 66 millones de parametros, destilado a partir de BERT-base manteniendo aproximadamente el 97 % del rendimiento del profesor con un 40 % menos de parametros (cifras de la publicacion original de DistilBERT, no del autor de este repositorio). Sobre ese backbone, el entrenamiento con `Trainer` sustituye la cabecera enmascarada por una cabecera de clasificacion, lo que explica el recuento exacto de 66.955.010 parametros y la antiguedad del pipeline `text-classification`. No hay innovaciones propias: no se usa decodificacion especulativa, atencion lineal, MoE ni mecanismos SSM, y al tratarse de un encoder no genera texto.

El procedimiento de entrenamiento esta documentado parcialmente en la model card. Se hicieron 1 epoca y 125 pasos con `train_batch_size` 16 y `eval_batch_size` 32, lo que implica del orden de 2.000 ejemplos de entrenamiento si se aplica el producto pasos x batch (el autor no confirma el tamano real). Se uso `learning_rate` 2e-05, `lr_scheduler_type` lineal, semilla 42 y `OptimizerNames.ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08, sin argumentos adicionales de optimizador. No se documenta composicion del dataset, tokenizacion, numero de tokens vistos, ni si hubo RLHF, DPO o cualquier etapa de alineacion (no tendria sentido en un clasificador). Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.14.0+cpu, Datasets 5.0.1 y Tokenizers 0.23.2, lo que indica que el fine-tuning se ejecuto en CPU.

## Capacidades

- Clasificacion de texto binaria orientada a analisis de sentimiento, con salida de logits y probabilidades por clase.
- Extraccion de representaciones contextuales de frases de hasta 512 tokens, reutilizables para tareas derivadas (por ejemplo, como extractor de embeddings con `text-embeddings-inference`, etiqueta presente en el repositorio).
- Inferencia en CPU con latencia baja gracias a los 67 M de parametros, sin necesidad de GPU.
- Compatibilidad con la API `pipeline("text-classification")` de Transformers y con los `endpoints_compatible` de HuggingFace.
- No dispone de generacion de texto, razonamiento multi-paso, matemáticas, codigo, vision ni audio.
- No soporta tool calling, function calling ni uso como agente: la cabecera de clasificacion no produce texto libre.
- No hay capacidades multilingues documentadas; el vocabulario `uncased` del modelo base esta sesgado al ingles.
- No existe modo "thinking", ni variantes instruct, ni plantillas de chat.

## Casos de uso

Nota previa: dado que el autor no documenta el dataset de entrenamiento, los casos siguientes son aplicaciones plausibles de un clasificador DistilBERT afinado, no usos validados por el repositorio. Cualquier despliegue en produccion exige una evaluacion propia sobre datos del dominio.

- Analisis de sentimiento en resenas de producto: el modelo clasifica cada resena en una de dos clases con una sola pasada hacia delante, lo que permite procesar lotes de miles de documentos por minuto en CPU y agregar la polaridad por producto o periodo temporal.
- Triage de tickets de soporte: al etiquetar automaticamente el tono de un mensaje entrante, se puede enrutar primero los tickets negativos a agentes humanos y dejar los neutrales o positivos en colas automatizadas.
- Monitorizacion de redes sociales y menciones de marca: un encoder de 67 M parametros puede ejecutarse de forma continua sobre un flujo de mensajes cortos (por debajo de 512 tokens) sin coste relevante de GPU.
- Filtrado previo en pipelines de moderacion: usar el clasificador como primera etapa de bajo coste que descarta contenido claramente positivo o negativo, reservando un modelo mayor solo para los casos ambiguos.
- Etiquetado de datos a escala para construir datasets: generar etiquetas debiles sobre un corpus no anotado y despues auditar manualmente una muestra, reduciendo el coste de anotacion inicial.
- Control de calidad de encuestas abiertas (NPS, CSAT): convertir respuestas de texto libre en una señal numerica agregable por segmento de cliente.
- Demo educativa de versionado de modelos: el nombre del repositorio sugiere su uso como ejemplo en talleres de MLOps para mostrar como se comparan checkpoints y metricas de validacion entre versiones.
- Servicio de embeddings ligeros: aprovechando la compatibilidad con `text-embeddings-inference`, usar las representaciones del encoder como caracteristica de entrada para un clasificador posterior o para busqueda semantica de frases cortas.

## Benchmarks y rendimiento

El `model-index` del repositorio declara un array de resultados vacio, de modo que no hay benchmarks estandar (MMLU, GLUE, SST-2, etc.) publicados. El unico dato cuantitativo disponible es la tabla de entrenamiento de la model card, medida sobre un conjunto de validacion no identificado:

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida de validacion | 0,3634 | Epoca 1.0, paso 125, conjunto de validacion no documentado |
| Exactitud de validacion | 0,856 | Epoca 1.0, paso 125, conjunto de validacion no documentado |
| Perdida de entrenamiento | no registrada ("No log") | El autor no registro la perdida de entrenamiento |

No se han publicado resultados de benchmarks en la informacion disponible. La exactitud de 0,856 corresponde a una tarea binaria sobre un conjunto desconocido; no es comparable con cifras de SST-2 ni de otros corpus publicos.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 270 MB solo para los pesos (66,96 M parametros x 4 bytes); la inferencia completa con activaciones se mantiene muy por debajo de 1 GB.
- VRAM estimada en fp16 o int8: aproximadamente 134 MB y 67 MB de pesos respectivamente, aunque no se publican checkpoints en esos formatos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, L4, A10G o A100 lo ejecutan sin cuello de botella. No se necesita H100 ni memoria de 40-80 GB.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo de los ultimos diez anos e incluso en iGPU con varios GB de memoria compartida.
- Inferencia en CPU: totalmente viable (el propio entrenamiento se hizo con PyTorch 2.14.0+cpu); es el escenario recomendado para despliegues de bajo coste y modelos de 67 M de parametros.
- Opciones de despliegue: `transformers` con `pipeline`, HuggingFace Text Embeddings Inference (etiqueta `text-embeddings-inference` en el repositorio), HuggingFace Inference Endpoints (`endpoints_compatible`), ONNX Runtime tras conversion, y exportacion a GGUF para llama.cpp si se convierte el encoder manualmente. vLLM y TGI no son el objetivo natural de este modelo porque no es generativo.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de latencia por peticion ni de documentos por segundo.

## Comparativa con modelos similares

La comparacion se limita a parametros, contexto, licencia y disponibilidad, ya que no hay cifras de rendimiento publicadas para este checkpoint sobre corpus estandar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| CodeATNC/sentiment-versioning-demo | 66.955.010 | 512 tokens | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento del analisis | no disponible (solo exactitud de validacion 0,856 sobre dataset no documentado) |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english | 66,96 M (orden de magnitud, encoder de 6 capas) | 512 tokens | apache-2.0 | HuggingFace, ampliamente utilizado | no disponible en la informacion proporcionada |
| roberta-base (fine-tuned para clasificacion) | 125 M (orden de magnitud) | 512 tokens | mit | HuggingFace | no disponible en la informacion proporcionada |
| bert-base-uncased (fine-tuned para clasificacion) | 110 M (orden de magnitud) | 512 tokens | apache-2.0 | HuggingFace | no disponible en la informacion proporcionada |

El diferenciador de este repositorio no es el rendimiento, sino el hecho de estar pensado como demostracion de versionado: frente a los checkpoints anteriores, aqui lo relevante es el registro de hiperparametros y de una unica metrica de validacion, no una validacion externa.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explicitamente "on an unknown dataset", por lo que se desconoce el dominio, el idioma, la distribucion de clases y el posible solapamiento entre entrenamiento y validacion.
- Exactitud medida sobre un unico punto de control (1 epoca, 125 pasos) y un unico conjunto de validacion no documentado; no hay curva de aprendizaje ni evaluacion multi-semilla.
- Riesgo de alucinacion no aplicable en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificaciones erroneas con alta confianza en dominios alejados del entrenamiento.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento del analisis, es decir, no hay validacion independiente por parte de la comunidad.
- Limite duro de 512 tokens por secuencia; los textos mas largos deben truncarse o dividirse, lo que puede degradar la clasificacion de documentos extensos.
- Idiomas no documentados y tokenizador `uncased` en ingles; se espera un rendimiento pobre en castellano u otras lenguas sin un fine-tuning especifico.
- Sesgos heredados del corpus del modelo base (BookCorpus y Wikipedia en ingles), que puede infundir sesgos de genero, origen o registro en las etiquetas de sentimiento.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribucion mas alla de las habituales, pero al derivar de `distilbert-base-uncased` conviene verificar las condiciones del modelo base.
- Documentacion incompleta: secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" sin contenido, y `model-index` sin resultados.
- Versiones de framework poco habituales (Transformers 5.17.0, PyTorch 2.14.0): conviene comprobar la compatibilidad con el entorno de produccion antes de cargar el checkpoint.
- No debe emplearse en decisiones de alto impacto (credito, contratacion, diagnostico) sin auditoria previa de sesgos y sin una validacion sobre datos representativos del dominio real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodeATNC/sentiment-versioning-demo
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Repositorio del modelo base en GitHub: https://github.com/huggingface/transformers
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentacion de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron unicamente resultados sobre Mercedes-Benz sin relacion con este repositorio.
