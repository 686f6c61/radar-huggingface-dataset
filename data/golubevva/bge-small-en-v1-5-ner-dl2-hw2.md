# GolubevVA/bge-small-en-v1.5-ner-dl2-hw2

## Resumen

`GolubevVA/bge-small-en-v1.5-ner-dl2-hw2` es un modelo de reconocimiento de entidades nombradas (NER) publicado en HuggingFace por el usuario GolubevVA. Se trata de un ajuste fino (*fine-tuning*) del modelo de embeddings `BAAI/bge-small-en-v1.5`, un encoder tipo BERT de 12 capas y 33.215.625 parametros (unos 33 millones), reorientado desde su tarea original de representacion de frases hacia la clasificacion de tokens (`token-classification`). El resultado es un extractor de entidades ligero, entrenado durante 10 epocas con un learning rate de 2e-05 y un batch size de 16.

El modelo resuelve el problema clasico de etiquetado secuencial: asignar una categoria (persona, organizacion, lugar u otras definidas en el dataset de entrenamiento) a cada token de un texto de entrada. Su principal atractivo es la relacion tamano/rendimiento: con solo 33 millones de parametros y un repositorio de 0,1 GB, alcanza una F1 de 0,9125 y una exactitud de 0,9820 en el conjunto de evaluacion declarado por el autor, lo que lo hace candidato a despliegues en CPU o en GPUs de gama baja donde un BERT-base (108 millones de parametros) resultaria excesivo.

Es relevante ahora porque la tendencia hacia modelos especializados y pequenos para tareas de extraccion de informacion permite reducir costes de inferencia en pipelines de procesado masivo de documentos. Conviene senalar, no obstante, que la model card esta generada automaticamente por el `Trainer` de HuggingFace y no documenta el dataset de entrenamiento, los tipos de entidad soportados ni los idiomas, y que el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (tag `bert` en HuggingFace) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base `BAAI/bge-small-en-v1.5` trabaja con secuencias de hasta 512 tokens |
| Tipos de cuantizacion | no disponibles (el autor no publica variantes cuantizadas; al ser un modelo de 33M de parametros es convertible a ONNX/INT8) |
| Idiomas soportados | no disponible; el modelo base `BAAI/bge-small-en-v1.5` es predominantemente ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder-only tipo BERT de la familia BGE (`BAAI/bge-small-en-v1.5`), con aproximadamente 33 millones de parametros. Sobre esa base se ha anadido una cabeza de clasificacion de tokens para resolver la tarea NER. No se documenta ninguna innovacion arquitectonica adicional, atencion lineal, decodificacion especulativa ni mecanismo MoE: es un ajuste fino convencional de un encoder preentrenado.

El entrenamiento se realizo con el `Trainer` de HuggingFace durante 10 epocas, con `learning_rate=2e-05`, `train_batch_size=16`, `eval_batch_size=32`, semilla 42, optimizador `ADAMW_TORCH_FUSED` (betas 0,9/0,999, epsilon 1e-08) y planificador lineal. La model card indica explicitamente que el dataset de entrenamiento es desconocido ("on an unknown dataset"), por lo que no se puede confirmar la composicion del corpus, el esquema de etiquetas (etiquetas BIO, tipos de entidad) ni si se aplicaron tecnicas de RLHF o DPO, algo por otra parte poco habitual en tareas de etiquetado. Las versiones de framework declaradas son Transformers 5.18.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Clasificacion de tokens (`token-classification`): asignacion de una etiqueta a cada token de la secuencia de entrada.
- Extraccion de entidades nombradas: el caso de uso principal, aunque se desconoce el inventario concreto de tipos de entidad entrenados.
- Procesamiento por secuencia completa: al derivar de un encoder bidireccional, dispone de contexto completo en ambas direcciones dentro de la ventana de entrada, a diferencia de los modelos causales.
- Inferencia ligera: 33M de parametros permiten ejecucion en CPU con latencias del orden de milisegundos por secuencia corta.
- Compatibilidad con `endpoints_compatible` en HuggingFace Inference Endpoints.
- Soporte de tool calling / function calling: no disponible, no es una capacidad de un modelo encoder de clasificacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el modelo base esta orientado a ingles).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Generacion de texto: no disponible; es un modelo encoder-only sin cabeza generativa.

## Casos de uso

- Extraccion de entidades en documentos en ingles: dado un texto plano, el modelo devuelve las etiquetas por token, lo que permite poblar bases de datos estructuradas con nombres, organizaciones y localizaciones. Solo es viable si los tipos de entidad del corpus coinciden con los del dataset de entrenamiento, dato no documentado.
- Anonimizacion y cumplimiento normativo: deteccion de posibles datos personales (nombres propios, organizaciones) antes de almacenar o compartir un texto, como paso previo a un pipeline de *redaction*.
- Enriquecimiento de indices de busqueda: indexar entidades detectadas como metadatos adicionales para mejorar el filtrado y las consultas facetadas en un motor de busqueda documental.
- Procesamiento masivo por lotes en CPU: gracias a sus 33M de parametros y a un repositorio de 0,1 GB, se puede ejecutar en flotas de CPU sin GPU para etiquetar grandes volumenes de texto a bajo coste.
- Preetiquetado (*pre-annotation*) para anotacion humana: generar etiquetas automaticas que un anotador revise en herramientas como Label Studio o Prodigy, reduciendo el esfuerzo manual.
- Clasificacion de tickets y correos entrantes: extraer entidades de mensajes de soporte para enrutarlos a la cola adecuada segun la organizacion o el producto mencionado.
- Extraccion de informacion en contratos o facturas en ingles: deteccion de razones sociales y localizaciones como paso previo a la validacion contra un ERP.
- Normalizacion de campos en pipelines ETL: usar las entidades detectadas para unificar registros que llegan en texto libre antes de cargarlos en un almacen de datos.

## Benchmarks y rendimiento

El `model-index` de la model card no contiene resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos disponibles son las metricas de evaluacion declaradas por el autor durante el entrenamiento:

| Metrica | Valor final (epoca 6) |
|---|---|
| Loss (evaluacion) | 0,0787 |
| Precision | 0,9015 |
| Recall | 0,9238 |
| F1 | 0,9125 |
| Accuracy | 0,9820 |

Evolucion por epocas publicada por el autor:

| Training loss | Epoca | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,1645 | 1.0 | 626 | 0,1320 | 0,8215 | 0,8654 | 0,8429 | 0,9711 |
| 0,0965 | 2.0 | 1252 | 0,0962 | 0,8677 | 0,9017 | 0,8844 | 0,9780 |
| 0,0677 | 3.0 | 1878 | 0,0870 | 0,8618 | 0,9111 | 0,8858 | 0,9774 |
| 0,0538 | 4.0 | 2504 | 0,0804 | 0,8771 | 0,9177 | 0,8969 | 0,9798 |
| 0,0456 | 5.0 | 3130 | 0,0785 | 0,8920 | 0,9199 | 0,9057 | 0,9811 |
| 0,0337 | 6.0 | 3756 | 0,0787 | 0,9015 | 0,9238 | 0,9125 | 0,9820 |
| 0,0315 | 7.0 | 4382 | 0,0794 | 0,8901 | 0,9217 | 0,9057 | 0,9808 |
| 0,0290 | 8.0 | 5008 | 0,0793 | 0,8936 | 0,9246 | 0,9089 | 0,9813 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible, ni se especifica sobre que conjunto de evaluacion se calcularon estas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (33M de parametros ocupan unos 133 MB de pesos, mas activaciones y overhead del runtime). En FP16 rondaria los 70 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, etc.). No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas.
- Ejecucion en CPU: viable y recomendable para esta escala; es probablemente el modo de despliegue mas eficiente en coste.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, ONNX Runtime mediante `optimum`, TorchScript, y servidores de inferencia genericos (FastAPI, Triton, HuggingFace Inference Endpoints). No se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos o requieren conversion adicional.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GolubevVA/bge-small-en-v1.5-ner-dl2-hw2` | 33,2M | no disponible (base: 512) | NER (token-classification) | MIT | HuggingFace, 0 descargas |
| `BAAI/bge-small-en-v1.5` (modelo base) | 33,2M | 512 | Embeddings de frases | MIT | HuggingFace, ampliamente usado |
| `dslim/bert-base-NER` | ~108M (BERT-base) | 512 | NER en ingles (PER, ORG, LOC, MISC) | MIT | HuggingFace, muy extendido |
| `FacebookAI/roberta-base` ajustado a NER | ~125M | 512 | NER | MIT | HuggingFace, multiples variantes |

El dato diferencial de este modelo es su tamano reducido (un tercio de un BERT-base) manteniendo una F1 declarada por encima de 0,91 en su propio conjunto de evaluacion. Sin embargo, no es posible comparar el rendimiento de forma justa con `dslim/bert-base-NER` u otras alternativas porque no se especifica el dataset de evaluacion ni el esquema de etiquetas utilizado. Para el resto de datos de modelos comparables no disponibles en la informacion proporcionada, se indica "no disponible".

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica literalmente "on an unknown dataset", por lo que no se puede saber que tipos de entidad reconoce ni si generaliza fuera de ese dominio.
- Idiomas no documentados: al derivar de un modelo base orientado a ingles, el rendimiento en castellano u otros idiomas es altamente incierto y previsiblemente pobre.
- Model card autogenerada: incluye el aviso de que deberia revisarse y completarse manualmente; las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" estan sin rellenar.
- Riesgo de alucinacion: en un modelo de clasificacion de tokens el riesgo se traduce en falsos positivos (entidades inventadas sobre texto que no las contiene) y en errores de frontera en los limites de la entidad, no en texto generado libremente.
- Sesgos: no disponibles. No se ha realizado ninguna evaluacion de sesgo ni se documenta la composicion demografica del corpus de entrenamiento.
- Sobreajuste probable: el training loss cae hasta 0,0290 en la epoca 8 mientras la perdida de validacion se estanca alrededor de 0,078-0,079 desde la epoca 5, lo que sugiere que el modelo deja de mejorar pronto y que las ultimas epocas aportan poco.
- Metricas sin contexto: precision, recall y F1 se declaran sin especificar el conjunto de evaluacion, el numero de ejemplos ni la distribucion de clases, por lo que un F1 alto puede deberse a un desbalanceo fuerte de etiquetas (la accuracy de 0,9820 con F1 de 0,9125 es consistente con una clase mayoritaria dominante).
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. No impone restricciones adicionales, pero tampoco ofrece indemnizacion alguna al usuario.
- Adopcion nula: 0 descargas y 0 likes, sin repositorio de issues activo ni mantenimiento conocido. No hay evidencia de uso en produccion por terceros.
- Sin benchmarks comparables: no se puede verificar la calidad relativa frente a alternativas consolidadas antes de integrarlo en un sistema real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GolubevVA/bge-small-en-v1.5-ner-dl2-hw2
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5

No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs, repositorios o demos). Los resultados devueltos por la busqueda corresponden a consultas no relacionadas y se han descartado.
