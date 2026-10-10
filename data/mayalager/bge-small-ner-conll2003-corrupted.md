# MayaLager/bge-small-ner-conll2003-corrupted

## Resumen

bge-small-ner-conll2003-corrupted es un modelo de reconocimiento de entidades nombradas (NER, token classification) obtenido por ajuste fino del encoder BAAI/bge-small-en-v1.5 sobre un dataset no documentado por el autor, presumiblemente una version corrupta o manipulada de CoNLL-2003 segun indica su propio nombre. Lo desarrolla el usuario MayaLager y se publica bajo licencia MIT, con un peso total de 33.215.625 parametros, lo que lo situa en la gama "small" de la familia BERT.

El modelo resuelve la tarea clasica de etiquetado de tokens, es decir, asignar una categoria (persona, organizacion, localizacion, miscelanea en el esquema CoNLL) a cada token de una frase en ingles. Su relevancia es limitada y fundamentalmente experimental: la model card reconoce explicitamente que la descripcion, los usos previstos y los datos de entrenamiento no estan documentados ("More information needed"), y el propio identificador advierte de que los datos de entrenamiento estan "corrupted". No cuenta con descargas ni interacciones en el momento de la consulta.

Por su tamano (33M de parametros) es un modelo muy ligero, orientado a inferencia en CPU o GPU de gama baja, y hereda del modelo base BGE-small una ventana de contexto de 512 tokens y un enfoque monolingue en ingles. Se trata, por tanto, de un artefacto de investigacion reproducible mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (derivado de BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base BERT) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (el modelo base BGE-small-en-v1.5 esta entrenado principalmente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Tamano del repositorio | 0.7 GB |
| Libreria | transformers |
| Etiquetas | transformers, safetensors, bert, token-classification, generated_from_trainer, endpoints_compatible |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-small-en-v1.5, un encoder BERT de 33M de parametros disenado originalmente para representaciones de frases (embeddings de recuperacion), y lo adapta mediante fine-tuning a una cabeza de clasificacion de tokens. El fine-tuning se realizo con la libreria Transformers (version 5.18.0) sobre PyTorch 2.11.0+cu130, con los siguientes hiperparametros declarados: learning rate 2e-05, train_batch_size 8, eval_batch_size 8, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08) y scheduler lineal. El entrenamiento duro 5 epocas, equivalentes a 6250 pasos.

No se especifica la composicion del dataset, el numero de tokens de entrenamiento, si hubo etapas de RLHF/DPO ni si se aplicaron tecnicas de aumento de datos. La model card indica literalmente que el modelo fue ajustado "on an unknown dataset" y que la descripcion, los usos previstos y los datos de evaluacion necesitan informacion adicional. El sufijo "corrupted" del nombre sugiere que el conjunto de datos empleado presentaba algun tipo de corrupcion (etiquetas ruidosas, ficheros truncados o similar), pero no hay confirmacion tecnica en la documentacion publicada. No se declara ninguna innovacion arquitectonica adicional: se trata de un fine-tuning estandar de clasificacion de tokens sin decodificacion especulativa, atencion lineal ni modulos adicionales.

## Capacidades

- Clasificacion de tokens (NER) en ingles: asignacion de etiquetas a nivel de token, presumiblemente segun el esquema de CoNLL-2003 (PER, ORG, LOC, MISC), aunque el autor no lo confirma en la model card.
- Extraccion de entidades en texto plano: el modelo emite etiquetas por token utiles para pipelines de extraccion de informacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso (es un clasificador, no un modelo generativo).
- Capacidades multilingues: no disponibles; el modelo base es fundamentalmente ingles.
- No dispone de modo "thinking", vision, audio ni generacion de texto libre.
- Compatible con el pipeline `token-classification` de Transformers y con endpoints compatibles.

## Casos de uso

- Extraccion de entidades en textos en ingles para enriquecimiento de bases de datos: el modelo etiqueta tokens con categorias tipo persona, organizacion o lugar, lo que permite poblar tablas de entidades a partir de corpus.
- Preprocesado de pipelines de NLP: usar las etiquetas como caracteristica de entrada para tareas posteriores (resolucion de correferencia, vinculacion de entidades, construccion de grafos de conocimiento).
- Anonimizacion o redaccion de documentos: detectar nombres de persona y organizaciones en textos ingleses para enmascararlos antes de compartir el documento.
- Investigacion sobre robustez ante datos corruptos: al estar entrenado sobre un dataset presumiblemente degradado, sirve como referencia para estudiar el impacto del ruido en etiquetas sobre la calidad del NER.
- Reproducibilidad academica: gracias a los hiperparametros completos publicados (learning rate, batch, epocas, semilla), es posible replicar el entrenamiento con `Trainer` de HuggingFace.
- Prototipado rapido en entornos con recursos limitados: sus 33M de parametros permiten ejecutar inferencia en CPU o en GPU integrada para validar ideas antes de escalar a modelos mayores.
- Evaluacion comparativa de encoders "small" frente a BERT-base en tareas de etiquetado: util para medir la perdida de calidad al reducir el parametro de 110M a 33M.

## Benchmarks y rendimiento

La model card no incluye `model-index` con resultados formales (la lista `results` esta vacia), pero si publica metricas de evaluacion sobre un conjunto de validacion no especificado. Se reproducen tal cual, junto con la evolucion por epoca:

| Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 1250 | 0.1334 | 0.8136 | 0.8718 | 0.8417 | 0.9700 |
| 2.0 | 2500 | 0.0955 | 0.8669 | 0.9032 | 0.8847 | 0.9777 |
| 3.0 | 3750 | 0.0843 | 0.8777 | 0.9155 | 0.8962 | 0.9793 |
| 4.0 | 5000 | 0.0844 | 0.8900 | 0.9209 | 0.9052 | 0.9805 |
| 5.0 | 6250 | 0.0833 | 0.8912 | 0.9207 | 0.9057 | 0.9805 |

Resultado final declarado: loss 0.0833, precision 0.8912, recall 0.9207, F1 0.9057, accuracy 0.9805. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, y estos no serian aplicables a un modelo de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 aproximadamente 0.13 GB de pesos; en FP16 unos 0.07 GB; en int8 unos 0.03 GB. Hay que sumar el consumo de activaciones segun la longitud de secuencia (hasta 512 tokens).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, GTX 1650, e incluso en iGPU o CPU sin problemas.
- GPU recomendadas: no requiere GPU dedicada; una Tesla T4 o similar ya queda sobredimensionada para este tamano. Para procesamiento por lotes a gran escala, cualquier GPU moderna es suficiente.
- Despliegue: pipeline `token-classification` de Transformers; tambien puede servirse con TGI (Text Generation Inference no aplica a clasificacion, pero si con soluciones de inferencia de clasificacion), ONNX Runtime previa conversion, o FastAPI + PyTorch. Para llama.cpp/Ollama seria necesario convertir a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano, se espera latencia de milisegundos por frase en GPU y de decenas de milisegundos en CPU, pero estos valores no estan medidos ni publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| MayaLager/bge-small-ner-conll2003-corrupted | 33.215.625 | 512 tokens (heredado) | Token classification / NER | MIT | HuggingFace, 0 descargas | F1 0.9057 (validacion propia, dataset no documentado) |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33M | 512 tokens | Embeddings de frases / recuperacion | MIT | HuggingFace, ampliamente usado | No aplica a NER; referencia de encoder |
| dslim/bert-base-NER | ~108M | 512 tokens | Token classification / NER | no disponible en esta busqueda | HuggingFace, muy popular | No disponible en la informacion proporcionada |

La comparacion directa con dslim/bert-base-NER es la mas pertinente por tarea y esquema de etiquetas, pero no se dispone de cifras verificadas en la informacion proporcionada para este documento. No se dispone de datos comparativos adicionales.

## Limitaciones y advertencias

- Datos de entrenamiento no documentados: la model card indica "unknown dataset" y "More information needed" en descripcion, usos previstos y datos de evaluacion, lo que impide auditar sesgos o composicion.
- Indicio de datos corruptos: el propio nombre del modelo ("corrupted") sugiere que el conjunto de entrenamiento estaba degradado, con posible ruido en las etiquetas. Las metricas de validacion deben interpretarse con cautela.
- Riesgo de alucinacion: al ser un clasificador de tokens no genera texto, pero puede asignar etiquetas incorrectas a tokens ambiguos o desconocidos, especialmente en dominios distintos al de entrenamiento.
- Sesgos conocidos: no disponibles; no se ha publicado ningun analisis de sesgo. El modelo base esta sesgado hacia el ingles y hacia el dominio de los corpus web utilizados en su preentrenamiento.
- Limitacion de idioma: el modelo base BGE-small-en-v1.5 esta orientado al ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea pobre.
- Limitacion de contexto: 512 tokens, insuficiente para documentos largos sin troceado previo; ademas, el troceado puede romper entidades a caballo entre fragmentos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No obstante, la licencia del modelo base (MIT) y la del dataset de entrenamiento deberian verificarse de forma independiente.
- Caveat de produccion: con 0 descargas y 0 interacciones, el modelo no tiene validacion por parte de la comunidad; no se recomienda su uso en produccion sin una evaluacion propia sobre el dominio objetivo.
- Fechas de creacion y actualizacion (2026) poco habituales: conviene verificar la integridad del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MayaLager/bge-small-ner-conll2003-corrupted
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5

Nota: la busqueda web asociada a este modelo no ha devuelto resultados tecnicos relevantes (unicamente paginas de contenido para adultos sin relacion con el modelo), por lo que no se incluyen enlaces adicionales.
