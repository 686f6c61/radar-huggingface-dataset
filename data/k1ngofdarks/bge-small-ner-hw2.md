# k1ngofdarks/bge-small-ner-hw2

## Resumen

k1ngofdarks/bge-small-ner-hw2 es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino (*fine-tuning*) de BAAI/bge-small-en-v1.5, un encoder de recuperacion densa de la familia BGE desarrollada por BAAI (Beijing Academy of Artificial Intelligence). El modelo resuelve la tarea de *token classification*: asignar una etiqueta a cada token de una secuencia de entrada para extraer entidades (personas, organizaciones, lugares, etc., segun el esquema de etiquetas empleado, no documentado en la model card).

Arquitectonicamente es un transformer encoder de tipo BERT, denso (no MoE), con 33.215.625 parametros y un repositorio de solo 0,1 GB en formato safetensors. Se publica bajo licencia MIT, lo que permite uso comercial sin restricciones, y esta etiquetado como compatible con *endpoints* gestionados de Hugging Face.

Su relevancia practica es limitada por el momento: fue creado el 1 de octubre de 2026, acumula 0 descargas y 0 *likes*, y su model card esta generada automaticamente por el `Trainer` de Transformers sin secciones de descripcion, datos de entrenamiento ni usos previstos. Los unicos datos de rendimiento disponibles son las metricas de validacion declaradas por el propio autor (F1 de 0,8925), no verificadas de forma independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (heredada de la familia BGE-small/BERT; no confirmada de forma explicita en la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas en el repositorio) |
| Idiomas soportados | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 es monolingue en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano de repo: 0,1 GB) |

Otros metadatos: pipeline `token-classification`, libreria `transformers`, autor `k1ngofdarks`, creado el 2026-10-01 y actualizado el 2026-10-01. Entorno de entrenamiento declarado: Transformers 4.50.0, PyTorch 2.10.0+cu128, Datasets 3.4.1 y Tokenizers 0.21.4.

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder transformer de tipo BERT de 12 capas y dimension oculta reducida, originalmente entrenado para generar *embeddings* de frases orientados a recuperacion de informacion (retrieval) y RAG. Sobre ese *checkpoint* se ha anadido una cabeza de clasificacion por token y se ha realizado un ajuste fino supervisado, dando lugar al modelo de NER aqui descrito. No se trata de un modelo generativo: no produce texto libre, solo logits por token.

El dataset de entrenamiento es desconocido; la propia model card indica literalmente «fine-tuned version of BAAI/bge-small-en-v1.5 on an unknown dataset». Tampoco se documenta el esquema de etiquetas (por ejemplo BIO con PER/ORG/LOC/MISC) ni el numero de tokens de entrenamiento, por lo que no es posible reproducir el entrenamiento ni auditar la composicion de los datos. Los hiperparametros declarados son: learning rate 2e-05, batch de entrenamiento y evaluacion de 16, 5 epocas, semilla 42, optimizador AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`, sin argumentos adicionales) y planificador lineal. No se menciona el uso de RLHF, DPO ni ninguna innovacion tecnica adicional (no hay decodificacion especulativa ni atencion lineal; al ser un encoder, la atencion es completa sobre la ventana de 512 tokens).

## Capacidades

- Reconocimiento de entidades nombradas (*named entity recognition*) sobre texto, devolviendo una etiqueta por token.
- Clasificacion por token en general (la cabeza de `token-classification` es reutilizable para otros esquemas, aunque el modelo se ha ajustado para NER).
- Extraccion de entidades para tareas de *structuring* de informacion no estructurada.
- No es un modelo generativo: no soporta generacion de texto, resumen ni traduccion.
- Soporte de *tool calling* / *function calling*: no disponible (no es una capacidad de los modelos encoder de clasificacion).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no acreditadas; el modelo base es monolingue en ingles, por lo que se espera un rendimiento muy limitado fuera del ingles.
- *Thinking mode*, vision, audio: no disponibles.
- Integracion con el ecosistema `transformers` mediante `pipeline("token-classification")` y con *endpoints* compatibles (etiqueta `endpoints_compatible`).

## Casos de uso

- Extraccion de entidades en pipelines de ingesta documental: el modelo puede procesar bloques de hasta 512 tokens y etiquetar personas, organizaciones y lugares a medida que los documentos entran en un sistema, alimentando una base de datos estructurada. Adecuado por su tamano reducido (33 M de parametros) y su capacidad de ejecutarse en CPU.
- Anonimizacion y seudonimizacion de datos personales: al detectar entidades por token, permite enmascarar nombres o ubicaciones antes de almacenar o compartir textos, como paso previo al cumplimiento de normativa de proteccion de datos.
- Indexacion semantica enriquecida para RAG: las entidades detectadas pueden anadirse como metadatos a los fragmentos indexados, mejorando el filtrado y la recuperacion; encaja bien porque deriva de un modelo de *embeddings* de la misma familia BGE.
- Analisis de correos y tickets de soporte: extraccion de nombres de cliente, producto o empresa en texto de entrada, con el fin de enrutar automaticamente la incidencia al equipo correspondiente.
- Procesamiento de noticias y vigilancia de medios: deteccion de entidades en articulos para construir grafos de relaciones o paneles de seguimiento de menciones.
- Preetiquetado en anotacion humana: el modelo puede generar etiquetas automaticas que despues revisa un anotador, reduciendo el coste de crear corpus NER. Para ello es imprescindible confirmar antes el esquema de etiquetas que utiliza el modelo, dato que no se publica.
- Clasificacion de campos en formularios y documentos escaneados (post-OCR): dado un texto OCR de 512 tokens o menos, extraer los valores de cada campo y volcarlos a un sistema de gestion.

## Benchmarks y rendimiento

El `model-index` de la model card no contiene resultados (`results: []`). Las unicas cifras disponibles son las declaradas por el autor sobre su conjunto de evaluacion, sin especificar el conjunto de datos ni las etiquetas evaluadas:

| Metrica | Valor en la evaluacion final |
|---|---|
| Loss | 0,0924 |
| Precision | 0,8726 |
| Recall | 0,9133 |
| F1 | 0,8925 |
| Accuracy | 0,9788 |

Evolucion declarada durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 1,0 | 625 | 0,2311 | 0,1899 | 0,7256 | 0,7662 | 0,7454 | 0,9556 |
| 2,0 | 1250 | 0,1303 | 0,1215 | 0,8498 | 0,8866 | 0,8678 | 0,9745 |
| 3,0 | 1875 | 0,1188 | 0,1031 | 0,8476 | 0,9036 | 0,8747 | 0,9760 |
| 4,0 | 2500 | 0,0721 | 0,0944 | 0,8735 | 0,9098 | 0,8913 | 0,9789 |
| 5,0 | 3125 | 0,0664 | 0,0924 | 0,8726 | 0,9133 | 0,8925 | 0,9788 |

Advertencia: la *training loss* sigue bajando en la quinta epoca mientras la *validation loss* ya se habia estabilizado en la cuarta (0,0944 frente a 0,0924), sin mejora apreciable de F1 (0,8913 a 0,8925). Estos numeros proceden exclusivamente del autor y no se han contrastado con terceros ni con un conjunto de test independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB de pesos en fp32, unos 66 MB en fp16/bf16 y unos 33 MB en int8. Sumando activaciones y el *runtime*, el consumo real se situa tipicamente por debajo de 1-2 GB, incluso con lotes moderados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, L4). Modelos de gama alta como RTX 4090, A100 o H100 no aportan ventaja significativa por capacidad de memoria, aunque si por throughput en lotes grandes.
- Cabe sobradamente en GPU de consumo: si, en practicamente cualquier GPU moderna, e incluso en CPU y en Apple Silicon (via MPS).
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, ONNX Runtime y Optimum para exportacion a ONNX, TorchScript, un servicio propio con FastAPI o Flask, y *endpoints* gestionados de Hugging Face (el modelo lleva la etiqueta `endpoints_compatible`) o Amazon SageMaker. Los servidores orientados a generacion (vLLM, TGI) no estan disenados para clasificacion por token de encoders y no son la via recomendada aqui. `llama.cpp` y `Ollama` estan orientados a modelos generativos en GGUF, por lo que tampoco aplican directamente.
- Latencia y throughput: no disponibles. Al no publicarse datos de *benchmark* de inferencia, cualquier cifra seria una estimacion no respaldada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | F1 declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| k1ngofdarks/bge-small-ner-hw2 | 33,2 M | NER (token classification) | 512 tokens (heredado) | 0,8925 (validacion propia) | MIT | Publicado, 0 descargas |
| ledddev/dl-hw2-bge-ner | no disponible | NER sobre base BGE-small | no disponible | no disponible | no disponible | Publicado |
| kati4ka/bge-small-ner | no disponible | NER sobre base BGE-small | no disponible | no disponible | no disponible | Publicado |
| BAAI/bge-small-en-v1.5 (modelo base) | mismo *backbone* (~33 M) | Embeddings de recuperacion | 512 tokens | no aplica (no es un modelo NER) | MIT | Ampliamente utilizado |

Los dos modelos de la comparativa (ledddev/dl-hw2-bge-ner y kati4ka/bge-small-ner) aparecen en la busqueda web como ajustes de NER sobre la misma familia BGE-small y probablemente comparten origen academico o de ejercicio practico, pero no se dispone de sus especificaciones ni de sus metricas, por lo que la comparacion cuantitativa no es posible. No se han identificado en la informacion proporcionada otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card lo declara explicitamente como «unknown dataset». No se puede evaluar la cobertura de dominios, el equilibrio de clases ni el riesgo de sesgo.
- Esquema de etiquetas no documentado: se desconoce que tipos de entidad detecta y en que formato (BIO, BIOES, etc.). Es un bloqueo serio para integrarlo en produccion sin inspeccion previa de `config.json` y de las etiquetas del `id2label`.
- Rendimiento no verificado: no hay resultados en el `model-index`, ni evaluacion independiente, ni *likes* o descargas que indiquen uso real. Las metricas son autodeclaradas.
- Idioma: el modelo base BAAI/bge-small-en-v1.5 es monolingue en ingles; no hay evidencia de soporte para castellano ni para otras lenguas. Usarlo en espanol requeriria reajuste.
- Limite de contexto: 512 tokens por secuencia, herencia de la arquitectura BERT subyacente. Documentos largos requieren troceado con solapamiento, lo que puede partir entidades y degradar el recall.
- Riesgo de alucinacion: en un modelo discriminativo el equivalente son falsos positivos (entidades inventadas donde no las hay) y falsos negativos. Con una precision declarada de 0,8726, aproximadamente una de cada ocho predicciones positivas seria incorrecta en el conjunto de evaluacion del autor.
- Sin generacion de texto: no puede usarse para resumir, responder preguntas en lenguaje natural ni mantener conversaciones; solo etiqueta tokens.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones, siempre manteniendo el aviso de copyright. No obstante, se ofrece sin garantia alguna, y la licencia del modelo base (tambien MIT, segun los metadatos) debe conservarse al redistribuir.
- Ausencia de informacion sobre sesgos, limitaciones de idioma y usos previstos en la model card («More information needed» en las secciones de descripcion, usos previstos y datos de entrenamiento).
- Modelo muy reciente (creado el 2026-10-01) y sin historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k1ngofdarks/bge-small-ner-hw2
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Documentacion de la familia BGE: https://bge-model.com/
- Portal de BGE (BAAI): https://bge.baai.ac.cn/
- Modelo comparable ledddev/dl-hw2-bge-ner: https://huggingface.co/ledddev/dl-hw2-bge-ner
- Modelo comparable kati4ka/bge-small-ner: https://huggingface.co/kati4ka/bge-small-ner
- Cuaderno de ejemplo sobre bge-small-en-v1.5 (AWS Marketplace): https://github.com/awsdataarchitect/marketplace-notebooks/blob/main/notebooks/bge-small-en-v1-5.ipynb
