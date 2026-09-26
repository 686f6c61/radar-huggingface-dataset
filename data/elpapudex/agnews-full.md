# Elpapudex/AGnews-Full

## Resumen

AGnews-Full (identificador interno `u2t01-bert-agnews`) es un modelo de clasificación de texto en inglés desarrollado por el usuario Elpapudex, consistente en un ajuste fino completo (*full fine-tuning*) de `bert-base-uncased` sobre el dataset AG News. El modelo resuelve una tarea concreta: clasificar titulares y descripciones cortas de noticias en cuatro categorías temáticas (World, Sports, Business y Sci/Tech), tal y como se define en el corpus AG News. No es un modelo generativo ni conversacional: es un encoder BERT con una cabeza de clasificación de 4 etiquetas superpuesta, lo que se deduce del recuento exacto de parámetros (109.485.316, es decir, los 109.482.240 de BERT-base más 3.076 correspondientes a una cabeza lineal de 4 clases).

Con 109,5 millones de parámetros y una ventana de entrada de 512 tokens (heredada de BERT-base), el modelo se sitúa en la gama ligera de encoders, apto para inferencia en CPU y en GPUs de consumo. La relevancia actual de este tipo de publicaciones es fundamentalmente práctica: sirve como clasificador de referencia rápido, barato y reproducible para pipelines de etiquetado de noticias, y como punto de partida para destilación o para tareas de enrutado de contenido en sistemas de recomendación y monitorización de medios.

El autor reporta un rendimiento de 0,9472 de accuracy y 0,9473 de macro F1 en el conjunto de evaluación, con un coste de entrenamiento de 4.504 segundos (unos 75 minutos) y un throughput de evaluación de 238,8 muestras por segundo. El repositorio ocupa 1,8 GB y no declara licencia, dato relevante para cualquier uso comercial. El modelo es monolingüe (inglés) y está acotado al dominio de noticias cortas, tal y como reconoce el propio autor en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), con cabeza de clasificación lineal de 4 clases |
| Parametros totales | 109.485.316 (109.482.240 del cuerpo BERT-base + 3.076 de la cabeza de clasificación) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite estándar de `bert-base-uncased`; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (no se documentan versiones cuantizadas; el repo contiene safetensors) |
| Idiomas soportados | Inglés (`en`) únicamente |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | No disponible |
| Dataset de entrenamiento | AG News (`agnews`) |
| Modelo base | `bert-base-uncased` |
| Tarea | Clasificación de texto multietiqueta cerrada (4 clases temáticas de noticias) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Tamano del repositorio | 1,8 GB |
| Fecha de creacion / actualizacion | 2026-09-26 / 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base en configuración *uncased*: un encoder Transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con tokenización WordPiece y un vocabulario de 30.522 piezas. Sobre la representación del token `[CLS]` se añade una cabeza de clasificación lineal con 4 salidas, correspondientes a los temas World, Sports, Business y Sci/Tech de AG News. El recuento exacto de parámetros reportado por el autor (109.485.316) confirma esta configuración y descarta variantes destiladas o bases más grandes.

El ajuste fino fue completo: el campo `method` de las métricas indica `"full"` y el número de parámetros entrenables coincide con el total del modelo (109.485.316). No se emplearon técnicas de adaptación eficiente de parámetros (LoRA, adapters) ni se reporta destilación. Se usaron dos tasas de aprendizaje diferenciadas, 1e-3 para la cabeza (`head_lr`) y 2e-5 para el cuerpo (`body_lr`), con semilla 42, durante 3 épocas completas. No se documenta composición ampliada del dataset más allá de AG News, ni el uso de RLHF, DPO o cualquier fase de alineación posterior, algo esperable en un clasificador supervisado de este tipo. No se mencionan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, SSM híbridos) porque no aplican a esta arquitectura ni se describen en la model card.

## Capacidades

- Clasificación de texto en inglés en cuatro categorías de noticias: World, Sports, Business y Sci/Tech.
- Procesamiento de entradas cortas (titulares y descripciones) hasta 512 tokens por secuencia.
- Extracción de representaciones contextuales de la frase a través del token `[CLS]` y de los estados ocultos de las 12 capas, reutilizables para otras tareas de transferencia.
- Inferencia por lotes con throughput alto en hardware modesto (238,8 muestras/segundo reportadas en evaluación).
- Capacidades multilingües: no. El modelo es exclusivamente inglés, tal y como declara la etiqueta de idioma y la propia sección de limitaciones.
- Tool calling / function calling: no soportado. No es un modelo instruido ni generativo.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Modo *thinking*, visión, audio, generación de código o matemáticas: no disponibles; fuera del alcance del modelo.

## Casos de uso

- Clasificación automática de flujos RSS y alertas de medios: el modelo permite etiquetar cada titular entrante en una de las cuatro secciones con un coste de cómputo mínimo, integrándose en un *worker* que procese miles de titulares por minuto en CPU.
- Enrutado de contenido en agregadores y portales de noticias: asignar la sección correcta a un artículo para colocarlo en la portada temática correspondiente, con la precisión reportada de 0,9472 de accuracy sobre AG News.
- Etiquetado preliminar para curación de datasets: usar el modelo como anotador débil (*weak labeler*) sobre grandes volúmenes de texto no etiquetado, revisando después solo los casos de baja confianza y reduciendo el coste de anotación humana.
- Monitorización de reputación de marca y análisis de tendencias: clasificar menciones o noticias por temática para agregar series temporales de cobertura (por ejemplo, cuántas noticias de Business mencionan una empresa en un mes).
- Filtrado previo en sistemas de recomendación: descartar o priorizar candidatos según la categoría antes de pasar a un modelo de ranking más costoso, actuando como etapa de bajo coste en una cascada de recuperación.
- Base para destilación y modelos ligeros: al ser un BERT-base estándar con cabeza de 4 clases, es un candidato directo como profesor para destilar en DistilBERT o en modelos tipo MiniLM destinados a despliegue en el navegador o en dispositivos móviles.
- Referencia reproducible para experimentos de ajuste fino: sirve como *baseline* documentado (hiperparámetros, semilla, épocas y métricas públicas) para comparar técnicas de entrenamiento eficiente sobre AG News.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en la model card, correspondientes a la fase de evaluación tras 3 épocas:

| Metrica | Valor |
|---|---|
| Loss | 0,3354 |
| Accuracy | 0,9472 |
| Macro F1 | 0,9473 |
| Runtime de evaluacion | 31,8229 s |
| Muestras por segundo | 238,822 |
| Pasos por segundo | 1,885 |
| Epocas | 3,0 |
| Metodo | full (ajuste fino completo) |
| Parametros entrenables | 109.485.316 |
| Tiempo total de entrenamiento | 4.504,27 s |

No se especifica en la informacion disponible sobre que split concreto (validación o test) se calcularon estas métricas, ni el tamano exacto del conjunto de evaluacion. Tampoco se han publicado comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 450 MB solo para pesos (109,5 M de parametros x 4 bytes), mas activaciones y memoria del *framework*; un presupuesto practico de 1-2 GB es suficiente para lotes moderados.
- VRAM estimada en fp16/bf16: aproximadamente 220 MB de pesos, con requisitos totales por debajo de 1 GB en lotes pequenos.
- VRAM estimada en int8: alrededor de 110 MB de pesos; la cuantizacion no esta documentada por el autor, por lo que requeriria conversion propia.
- GPU recomendadas: cualquier GPU con al menos 4 GB basta, incluidas NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4090, T4, L4, A10G, A100 y H100. El modelo esta sobredimensionado para estas dos ultimas, que solo tendrian sentido en escenarios de altisimo throughput.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para inferencia en produccion con lotes pequenos; el modelo de 110 M de parametros es uno de los casos donde el despliegue sin GPU es realista.
- Opciones de despliegue: al ser un `BertForSequenceClassification` estandar, es compatible con Hugging Face Transformers, Text Embeddings Inference (TEI), TorchServe, ONNX Runtime, FastAPI + PyTorch, y con exportacion a ONNX o TensorRT para reducir latencia. Tambien puede convertirse a llama.cpp/GGUF, aunque no se distribuye en ese formato.
- Latencia y throughput: el unico dato publicado es 238,822 muestras por segundo y 1,885 pasos por segundo durante la evaluacion, sin especificar el hardware empleado, por lo que no es posible extrapolar latencias absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AGnews-Full (este modelo) | 109,5 M | 512 tokens (heredado de BERT-base) | Clasificacion AG News, 4 clases | No disponible | HuggingFace, 0 descargas |
| `bert-base-uncased` | 109,5 M | 512 tokens | Modelo base sin ajuste de clasificacion | Apache 2.0 (licencia del modelo original; no confirmada en la informacion disponible) | Ampliamente disponible |
| `distilbert-base-uncased` | 66 M | 512 tokens | Modelo base destilado, sin cabeza de clasificacion de noticias | Apache 2.0 (no confirmada en la informacion disponible) | Ampliamente disponible |
| Otros ajustes de BERT sobre AG News | No disponible | No disponible | Clasificacion AG News | No disponible | No disponible |

No se han proporcionado resultados de benchmarks de los modelos alternativos en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. La comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo monolingue: solo ingles. Cualquier entrada en otro idioma producira predicciones poco fiables.
- Dominio acotado: entrenado exclusivamente sobre AG News, con titulares y descripciones cortas de noticias. Su uso sobre textos largos, conversaciones, resenas de producto o documentacion tecnica degradara la precision de forma significativa.
- Conjunto cerrado de 4 clases: no admite categorias nuevas sin reentrenamiento de la cabeza de clasificacion.
- Ventana de entrada de 512 tokens: los documentos mas largos deben truncarse o dividirse, lo que puede perder informacion relevante.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la asignacion de una etiqueta incorrecta con alta confianza, especialmente en titulares ambiguos o que mezclan tematicas (por ejemplo, noticias de tecnologia con impacto financiero).
- Sesgos: no se documenta ninguna evaluacion de sesgo. Al derivar de `bert-base-uncased` y de AG News, hereda los sesgos de representacion del corpus de noticias en ingles (predominio de fuentes anglosajonas y de ciertos temas).
- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial. Debe contactarse con el autor o asumir el riesgo legal antes de desplegarlo en produccion.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, y sin pipeline declarado, lo que reduce la confianza en la reproducibilidad y en el soporte.
- Metricas sin contexto de evaluacion: no se especifica el split sobre el que se calcularon los 0,9472 de accuracy ni el hardware usado para las mediciones de throughput, lo que limita su comparabilidad.
- Repositorio de 1,8 GB: muy superior al peso de un unico checkpoint en fp32 (unos 440 MB), lo que sugiere la presencia de *checkpoints* intermedios o artefactos adicionales de entrenamiento; conviene revisar los archivos antes de descargar.
- Fechas del repositorio poco convencionales (2026-09-26), lo que puede indicar un entorno de pruebas o una subida generada automaticamente; conviene verificar la procedencia antes de confiar en el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Elpapudex/AGnews-Full
- Paper de BERT (Devlin et al.): https://arxiv.org/abs/1810.04805
- Documentacion de entrenamiento de Hugging Face Transformers: https://huggingface.co/docs/transformers/training
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset AG News: no disponible en la informacion proporcionada (no se incluye enlace directo en la model card)
