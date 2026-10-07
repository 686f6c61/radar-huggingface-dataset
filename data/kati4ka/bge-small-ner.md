# kati4ka/bge-small-ner

## Resumen

bge-small-ner es un modelo de clasificacion de tokens (token classification) publicado por el usuario kati4ka en HuggingFace. Se trata de un ajuste fino del encoder BAAI/bge-small-en-v1.5 para reconocimiento de entidades nombradas (NER), es decir, para asignar una etiqueta a cada token de un texto de entrada. El modelo resuelve la tarea clasica de extraccion de entidades, pero no aporta documentacion sobre el conjunto de datos, el esquema de etiquetas ni el dominio de aplicacion.

La relevancia de esta ficha es limitada y conviene ser explicitos: se trata de un modelo con 23 descargas y 0 likes, creado con el flujo automatico `Trainer` de HuggingFace y con la model card practicamente sin completar ("More information needed" en descripcion, usos previstos, limitaciones y datos de entrenamiento). Es, por tanto, un artefacto de experimentacion mas que un modelo listo para produccion sin validacion previa.

Tecnicamente es un transformer encoder denso de tipo BERT, con 33.215.625 parametros totales (aproximadamente 33 M, coherente con el backbone BGE-small y una cabeza de clasificacion por token). Hereda del modelo base la ventana de contexto de 512 tokens y el sesgo hacia el ingles. No es un modelo generativo: no produce texto libre, solo etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (backbone BGE-small) con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificado en la model card; el modelo base BAAI/bge-small-en-v1.5 admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible en la model card; al ser un modelo de 33 M de parametros es convertible a fp16, int8 y ONNX con herramientas estandar |
| Idiomas soportados | no disponible en la model card (el modelo base esta entrenado principalmente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Biblioteca | transformers |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 23 / 0 |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de BAAI/bge-small-en-v1.5, un encoder bidireccional de tipo BERT de 33 M de parametros originalmente entrenado para recuperacion densa de texto (embeddings de frases). El ajuste anade una cabeza de clasificacion por token sobre las representaciones contextuales del encoder, lo que transforma un modelo de representacion en un etiquetador secuencial (por ejemplo, esquema BIO para entidades).

Segun la model card, el entrenamiento se realizo con el `Trainer` de HuggingFace durante 3 epocas, con `learning_rate` 2e-05, `train_batch_size` y `eval_batch_size` de 16, semilla 42, optimizador ADAMW_TORCH_FUSED con betas (0,9; 0,999) y epsilon 1e-08, y planificador lineal. El entrenamiento completo abarco 1.875 pasos, lo que equivale a 625 pasos por epoca; con un lote de 16, esto supone aproximadamente 10.000 ejemplos por epoca, aunque el numero exacto de ejemplos y la composicion del dataset (dominio, idioma, conjunto de etiquetas, proporcion de clases) no se documentan en ningun momento. No consta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni variantes hibridas); es un fine-tuning convencional de clasificacion de tokens. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Reconocimiento de entidades nombradas (NER) por token, con salida de etiquetas segun el esquema aprendido durante el ajuste fino.
- Clasificacion de secuencias de tokens en general (la tarea declarada es `token-classification`), siempre que las etiquetas coincidan con las del conjunto de entrenamiento.
- Extraccion de entidades en texto de entrada de hasta 512 tokens por secuencia, con truncado por encima de ese limite.
- Capacidad potencial de etiquetado de PII o terminos especificos si el dataset de ajuste lo cubria, aunque esto no esta documentado ni confirmado.
- No soporta tool calling ni function calling: no es un modelo conversacional ni dispone de plantilla de chat.
- No soporta razonamiento multi-paso ni comportamiento agentico; no genera texto, solo etiquetas.
- Capacidades multilingues: no confirmadas. El modelo base es de la familia `en`, por lo que el uso razonable es en ingles.
- No dispone de vision, audio, modo "thinking" ni ninguna capacidad multimodal.
- El backbone conserva la capacidad de producir embeddings, pero al haber sido ajustado con una cabeza de clasificacion de tokens, su uso como modelo de recuperacion no esta garantizado.

## Casos de uso

- Extraccion de entidades en documentos empresariales: el modelo puede etiquetar nombres de persona, organizacion, ubicacion o fechas en contratos, facturas o informes, siempre que el esquema de etiquetas del ajuste coincida con las entidades que se quieran extraer y se valide antes con una muestra representativa.
- Deteccion y anonimizacion de datos personales: si el ajuste cubre etiquetas de tipo PERSON o similares, puede integrarse en un pipeline de preprocesado que enmascare identificadores antes de almacenar o enviar texto a otro sistema. Requiere auditoria de falsos negativos por el impacto legal.
- Enriquecimiento de pipelines RAG: usar el etiquetado para anotar metadatos (autores, organizaciones, lugares) en los fragmentos de documento antes de indexarlos, de forma que la busqueda pueda filtrar por entidades.
- Preprocesado de tickets de soporte: clasificar entidades en descripciones de incidencias (productos, versiones, ubicaciones) para enrutado automatico y para construir agregaciones analiticas.
- Procesamiento por lotes en CPU: con 33 M de parametros, el modelo es viable en servidores sin GPU, lo que permite ejecutar etiquetado masivo sobre corpus grandes con coste bajo.
- Despliegue en el borde o en navegador: el tamano reducido permite exportarlo a ONNX y ejecutarlo en dispositivos con recursos limitados, por ejemplo para anotacion local sin enviar datos a la nube.
- Prototipado rapido y linea base de investigacion: sirve como referencia barata para comparar esquemas de etiquetado antes de invertir en modelos mayores como BERT-base o modelos multilingues.
- Generacion de datos de entrenamiento: usar sus predicciones como pre-etiquetado para revision humana en un flujo de anotacion activa, reduciendo el esfuerzo de etiquetado manual. Este uso exige medir la precision real del modelo en el dominio objetivo.

## Benchmarks y rendimiento

La model card declara resultados sobre un conjunto de evaluacion no especificado. No hay ninguna entrada en el `model-index` (la lista de resultados esta vacia) y no se identifica el dataset de evaluacion, por lo que los numeros no son comparables con resultados publicados de otros modelos.

| Metrica | Valor (epoca 3, final) |
|---|---|
| Loss (evaluacion) | 0,2399 |
| Precision | 0,8451 |
| Recall | 0,8886 |
| F1 | 0,8663 |
| Accuracy | 0,9740 |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,9428 | 1.0 | 625 | 0,3784 | 0,7383 | 0,7878 | 0,7623 | 0,9582 |
| 0,3735 | 2.0 | 1250 | 0,2620 | 0,8387 | 0,8785 | 0,8581 | 0,9726 |
| 0,2781 | 3.0 | 1875 | 0,2399 | 0,8451 | 0,8886 | 0,8663 | 0,9740 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, CoNLL-2003, etc.) en la informacion disponible. Tampoco se especifica si las metricas son a nivel de token o a nivel de entidad, ni si se calculan con promedio macro o micro, lo que limita aun mas su interpretabilidad.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,13 GB en fp32, 0,07 GB en fp16 y 0,04 GB en int8 (calculo derivado del numero de parametros; las activaciones son despreciables con lotes pequenos).
- Cabe sin problema en cualquier GPU de consumo, incluidas GTX 1050, GTX 1650, RTX 3060, RTX 4090, e incluso en GPU integradas. Tambien es viable en CPU y en Raspberry Pi para lotes pequenos.
- GPU de datacenter (A100, H100, L4, T4) no son necesarias; se usarian unicamente para maximizar el throughput con lotes muy grandes.
- Opciones de despliegue: pipeline de `transformers` (`token-classification`), exportacion a ONNX Runtime, TorchScript y empaquetado en servicios HTTP propios. No se documenta compatibilidad con vLLM, TGI u Ollama, y llama.cpp no es una via natural para clasificacion de tokens.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 33 M de parametros, la inferencia en GPU moderna es del orden de miles de secuencias cortas por segundo, pero este dato no esta confirmado en la informacion proporcionada.
- El repositorio ocupa 0,8 GB, muy por encima del tamano esperado para 33 M de parametros (unos 0,13 GB en fp32). Es probable que contenga checkpoints intermedios de las tres epocas, lo que no afecta a la inferencia pero si al almacenamiento y a la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kati4ka/bge-small-ner | 33 M | 512 tokens (heredado del base) | F1 0,8663 en un conjunto de evaluacion no identificado | MIT | HuggingFace, 23 descargas |
| dslim/bert-base-NER | ~110 M (dato no verificado en la informacion disponible) | 512 tokens | F1 en torno a 0,91 en CoNLL-2003 (dato no verificado) | MIT (segun informacion publica, no verificada aqui) | HuggingFace, ampliamente usado |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | Modelo de embeddings, sin cabeza NER | MIT | HuggingFace, modelo base de esta variante |

La comparacion con dslim/bert-base-NER debe tomarse con cautela: los datos de ese modelo no forman parte de la informacion proporcionada y no se han podido verificar. Ademas, el F1 de bge-small-ner corresponde a un conjunto no descrito, por lo que no es metodologicamente correcto ponerlo en la misma escala que un resultado sobre CoNLL-2003. Como referencia interna, la unica comparacion defendible es contra el propio modelo base, que no realiza NER en absoluto.

## Limitaciones y advertencias

- Dataset de entrenamiento y de evaluacion completamente desconocidos: no se puede saber que entidades detecta, en que dominio, con que idioma ni con que distribucion de clases. Sin esta informacion, el F1 de 0,8663 no es interpretable ni extrapolable.
- Model card practicamente vacia: los apartados de descripcion, usos previstos y limitaciones dicen literalmente "More information needed". No hay guia de uso ni advertencias del autor.
- El modelo base esta entrenado principalmente en ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea muy inferior.
- Limite de 512 tokens por secuencia, con truncado de textos largos. Para documentos extensos hay que segmentar, lo que puede partir entidades y degradar el recall en los limites de los fragmentos.
- Riesgo de errores silenciosos: al ser un clasificador, no "alucina" en el sentido generativo, pero puede asignar etiquetas incorrectas con alta confianza. En tareas sensibles (anonimizacion, cumplimiento normativo) esto es mas peligroso que un error visible, porque no hay texto generado que delate el fallo.
- Sesgos desconocidos: sin informacion sobre el dataset no se puede evaluar el sesgo por genero, origen etnico, nacionalidad o jerga. Los sesgos del corpus de preentrenamiento del modelo base se heredan sin documentar.
- Desequilibrio de clases probable: las metricas de precision y recall (0,8451 y 0,8886) sugieren un ajuste razonable, pero la accuracy de 0,9740 esta dominada por la clase mayoritaria (tipicamente "O"), lo que puede enmascarar un rendimiento pobre en entidades raras.
- Idoneidad para produccion no demostrada: 23 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad. No deberia desplegarse sin una evaluacion propia sobre un conjunto etiquetado del dominio objetivo.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No impone restricciones de uso, pero tampoco ofrece ninguna garantia.
- Fecha de creacion inusual (2026-09-26), posterior a la fecha habitual de publicacion de este tipo de ajustes; conviene verificar la procedencia y la integridad de los pesos antes de integrarlos en un pipeline.
- Sin informacion sobre el tokenizador especifico ni sobre la lista de etiquetas (`id2label`), dato imprescindible para interpretar la salida. Es necesario inspeccionar `config.json` antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kati4ka/bge-small-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper de BGE (BAAI General Embedding): https://arxiv.org/abs/2309.07597 (referencia del modelo base, no citada en la model card)
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding (referencia del modelo base, no citada en la model card)
- Otros enlaces: no disponibles. La busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos resultados obtenidos fueron dominios de compraventa de nombres de dominio (Dan.com, Redlib.com), sin relacion con el contenido.
