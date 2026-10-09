# pulpich/ner-model

## Resumen

pulpich/ner-model es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning de BAAI/bge-small-en-v1.5, un encoder tipo BERT de 33.215.625 parametros. Lo publica el usuario pulpich en HuggingFace bajo licencia MIT y esta etiquetado con el pipeline `token-classification`, por lo que su proposito es asignar una etiqueta de entidad a cada token de una secuencia de entrada.

El modelo se genero con la libreria `transformers` y lleva la etiqueta `generated_from_trainer`, lo que indica que fue entrenado con el `Trainer` de HuggingFace y que su model card se autogenero a partir de los hiperparametros y metricas que el entrenamiento registro. Resuelve, por tanto, el caso clasico de extraccion de entidades (personas, organizaciones, lugares, fechas u otras clases definidas en el dataset de entrenamiento) sobre textos cortos.

Su relevancia practica es la de un modelo pequeno y barato de desplegar: con unos 33 millones de parametros cabe en CPU y en cualquier GPU consumer, y sirve como componente de preprocesado o de extraccion estructurada dentro de pipelines mayores. La limitacion principal es la falta de documentacion: el autor no especifica el dataset de entrenamiento, los idiomas soportados ni el esquema de etiquetas utilizado, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura base bge-small-en-v1.5 trabaja con secuencias de hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se declaran versiones GGUF, ONNX ni cuantizaciones int8) |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles; el autor no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base BAAI/bge-small-en-v1.5: un encoder transformer de tipo BERT, pequeno y denso, con 33,2 millones de parametros, adaptado por fine-tuning a una cabeza de clasificacion de tokens. Al ser un modelo de la familia BGE (BAAI General Embedding), el backbone esta optimizado originalmente para representaciones de frases en ingles; el fine-tuning lo reorienta a etiquetado token a token.

El entrenamiento se realizo con el `Trainer` de HuggingFace durante 3 epochs, con learning rate 2e-05, scheduler lineal, batch de entrenamiento y evaluacion de 16, semilla 42 y el optimizador AdamW con `betas=(0.9, 0.999)` y `epsilon=1e-08` (variante `ADAMW_TORCH_FUSED`). El entrenamiento completo sono 1.878 pasos, es decir, 626 pasos por epoch, lo que con un batch de 16 implica del orden de 10.000 ejemplos por epoch en el conjunto de entrenamiento. El autor no documenta el dataset utilizado ("on an unknown dataset"), ni su composicion, ni si hubo fases de RLHF, DPO u otro ajuste posterior. Tampoco se declara ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, destilacion, etc.).

## Capacidades

- Reconocimiento de entidades nombradas: clasificacion token a token mediante la pipeline `token-classification` de `transformers`.
- Extraccion de entidades en textos cortos: adecuado para fragmentos que quepan en la ventana del backbone (hasta 512 tokens en la arquitectura base).
- Generacion de texto: no, es un modelo exclusivamente encoder para clasificacion; no genera texto libre.
- Razonamiento, matematicas y codigo: no disponibles; no es el proposito del modelo ni hay evidencia declarada.
- Tool calling / function calling: no soportado de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no soportadas.
- Vision, audio y multimodalidad: no soportadas.
- Capacidades multilingues: no declaradas; el backbone base esta orientado a ingles.
- Modo "thinking": no disponible.
- Esquema de etiquetas: no documentado; se desconoce si sigue BIO, BIOES u otro formato y que conjunto de clases cubre.

## Casos de uso

- Extraccion de entidades en pipelines de enriquecimiento documental: dado un texto corto, el modelo devuelve las etiquetas por token, lo que permite poblar bases de datos o indices de busqueda con nombres de personas, organizaciones y lugares detectados automaticamente.
- Preprocesado para sistemas RAG: antes de indexar documentos, usar el modelo para anotar entidades y mejorar la recuperacion mediante filtros por entidad, como complemento de un modelo de embeddings.
- Anonimizacion y seudonimizacion de datos personales: si el esquema de etiquetas incluye clases de tipo PERSON, el modelo puede servir como primer paso para localizar datos identificativos antes de un proceso de enmascarado, siempre con revision humana dado que no hay documentacion del esquema.
- Analisis de correos y tickets de soporte: extraer automaticamente el nombre del cliente, la empresa o el producto mencionado en un ticket para clasificarlo y enrutarlo, aprovechando el bajo coste de inferencia del modelo.
- Procesamiento por lotes en CPU: con 33 millones de parametros, el modelo puede ejecutarse en lotes grandes sobre CPU, lo que lo hace viable para trabajos nocturnos de extraccion masiva de entidades sobre corpus historicos.
- Componente de evaluacion en investigacion: servir como baseline ligero de NER para comparar contra modelos mayores, dado su coste computacional minimo y su licencia MIT.
- Extraccion de entidades en tiempo real en el borde: por tamano y licencia, puede desplegarse en dispositivos con recursos limitados o en servicios serverless con arranque en frio rapido.
- Deteccion de menciones en motores de busqueda internos: generar indices invertidos de entidades para permitir consultas del tipo "documentos que mencionan a esta organizacion".

En todos los casos, el desarrollador deberia validar primero el esquema de etiquetas real del modelo sobre una muestra de datos propios, ya que no esta documentado.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, correspondientes al conjunto de evaluacion del propio entrenamiento:

| Metrica | Epoch 1 (paso 626) | Epoch 2 (paso 1252) | Epoch 3 (paso 1878) |
|---|---|---|---|
| Training loss | 0.4614 | 0.2762 | 0.2414 |
| Validation loss | 0.3756 | 0.2579 | 0.2317 |
| Precision | 0.7568 | 0.8378 | 0.8541 |
| Recall | 0.7992 | 0.8803 | 0.8909 |
| F1 | 0.7774 | 0.8585 | 0.8722 |
| Accuracy | 0.9591 | 0.9729 | 0.9753 |

El campo `model-index` de la model card declara una lista de resultados vacia (`results: []`), por lo que no hay benchmarks publicados sobre conjuntos estandar como CoNLL-2003, MMLU, HumanEval o GSM8K. Los valores anteriores proceden del conjunto de evaluacion interno y no son comparables con cifras de la literatura. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32, unos 66 MB en fp16/bf16 y unos 33 MB en int8 para los pesos; el pico real dependera del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo no requiere A100, H100 ni tarjetas de gama alta.
- Compatibilidad con GPU consumer: si, cabe holgadamente en GTX 1050/1650, RTX 2060, RTX 3060, RTX 4090 y cualquier iGPU o acelerador de gama baja.
- Ejecucion en CPU: totalmente viable; es probable que la inferencia en CPU sea suficiente para muchos casos de uso en produccion.
- Opciones de despliegue: `transformers` con PyTorch (via `pipeline("token-classification")`), servidores de inferencia compatibles con la API de HuggingFace (el tag `endpoints_compatible` figura en el repositorio), ONNX Runtime si se exporta manualmente y `text-embeddings-inference` no aplica por tratarse de clasificacion. vLLM, llama.cpp, Ollama y TGI no estan declarados como soportados y no son la via natural para un encoder de clasificacion de este tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Metricas publicadas |
|---|---|---|---|---|---|
| pulpich/ner-model | 33,2 M | no disponible (base: 512 tokens) | Fine-tuning de bge-small-en-v1.5 para NER | MIT | F1 0,8722 y accuracy 0,9753 en evaluacion interna (no comparable) |
| dslim/bert-base-NER | 110 M aprox. | 512 tokens | Fine-tuning de bert-base para NER en ingles (CoNLL-2003) | MIT | no disponible en la informacion proporcionada |
| BAAI/bge-small-en-v1.5 | 33,2 M | 512 tokens | Encoder de embeddings, no NER | MIT | no disponible en la informacion proporcionada |
| Modelos NER basados en DistilBERT | 66 M aprox. | 512 tokens | Destilacion de BERT con cabeza de clasificacion de tokens | habitualmente Apache 2.0 o MIT | no disponible en la informacion proporcionada |

La comparacion se limita a parametros, contexto, licencia y tipo de tarea, porque no se dispone de resultados de benchmarks de los modelos alternativos dentro de la informacion proporcionada. El modelo aqui descrito es el mas pequeno y barato de la seleccion, pero tambien el peor documentado y el unico sin ningun tipo de validacion externa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card indica "More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento. Se desconoce el dataset, el esquema de etiquetas y el dominio objetivo.
- Idiomas no declarados: el backbone base esta orientado al ingles; no hay garantia de funcionamiento en castellano ni en otros idiomas.
- Sesgos: no se han documentado, pero cualquier modelo NER hereda los sesgos del corpus con el que se entreno. Al no conocerse ese corpus, no es posible evaluar sesgos de genero, origen o profesion en las entidades detectadas.
- Riesgo de alucinacion: en clasificacion de tokens no hay generacion de texto, pero si hay riesgo de falsos positivos, es decir, etiquetar como entidad fragmentos que no lo son. La precision declarada de 0,8541 implica una tasa de falsos positivos no despreciable.
- Metricas sin contexto: los valores de F1 y accuracy proceden de un conjunto de evaluacion interno de composicion desconocida. No deben compararse con resultados de CoNLL-2003 u otros corpus estandar.
- Generalizacion incierta: al ser un fine-tuning de 3 epochs con learning rate bajo sobre un dataset no identificado, es probable que el modelo rinda bien solo en el dominio de entrenamiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; el modelo no ha sido reproducido ni evaluado por terceros.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright y la atribucion correspondiente. No obstante, el modelo base BAAI/bge-small-en-v1.5 tambien es MIT, por lo que no hay conflicto de licencias.
- Repositorio muy ligero (0,1 GB), coherente con el tamano del modelo, pero sin artefactos adicionales como tokenizador documentado, configuracion de etiquetas explicada o ejemplos de uso.
- Advertencia para produccion: antes de desplegarlo, inspeccionar `config.json` e `id2label` para conocer el esquema real de entidades, y evaluar el modelo sobre datos propios representativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pulpich/ner-model
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo. Los resultados obtenidos eran dominios de contenido para adultos sin ninguna relacion con el modelo, por lo que se han descartado. No se dispone de paper, blog tecnico, repositorio de codigo ni demo asociados a pulpich/ner-model.
