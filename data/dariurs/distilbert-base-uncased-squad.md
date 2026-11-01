# dariurs/distilbert-base-uncased-squad

## Resumen

`dariurs/distilbert-base-uncased-squad` es un ajuste fino de DistilBERT base (versión sin distinción de mayúsculas) especializado en la tarea de *question answering* extractivo. Lo publica el usuario `dariurs` en HuggingFace y sigue el patrón clásico de los modelos entrenados con la librería `transformers` y la clase `Trainer`, con la etiqueta `generated_from_trainer` que indica que la model card se autogeneró a partir de la configuración del entrenamiento. El nombre sugiere un ajuste sobre el conjunto de datos SQuAD, aunque la model card no lo confirma explícitamente y lo describe como "an unknown dataset".

El modelo cuenta con 66.364.418 parámetros, una arquitectura transformer encoder-only destilada de BERT y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales. Su relevancia práctica es la de un modelo ligero de extracción de respuestas: para tareas de QA sobre pasajes cortos, ofrece un coste de inferencia muy bajo comparado con LLMs generativos, a cambio de una funcionalidad acotada (localizar un span de respuesta, no generar texto libre).

En el momento de redactar esta ficha el repositorio acumula 78 descargas y 0 likes, y el tamaño del repo (9,0 GB) es desproporcionado para un modelo de 66M de parámetros, lo que sugiere que contiene artefactos de entrenamiento (checkpoints intermedios, estados del optimizador) además de los pesos finales. No hay información publicada sobre idiomas soportados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT, destilado de BERT) |
| Parametros totales | 66.364.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens de entrada, limite arquitectonico) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion a 8 y 4 bits via herramientas externas) |
| Idiomas soportados | no disponible (el modelo base es uncased en ingles; el ajuste no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder-only con 6 capas, 12 cabezas de atencion y dimension oculta de 768, obtenido por destilacion de BERT-base (12 capas) conservando aproximadamente el 97 % del rendimiento de BERT en GLUE con un 40 % menos de parametros y un 60 % mas rapido. Sobre esa base, este repositorio anade una cabeza de question answering (clasificacion de inicio y fin del span de respuesta) y la ajusta con la clase `Trainer` de `transformers`.

Los hiperparametros declarados en la model card son: learning rate 3e-5, batch de entrenamiento 16, batch de evaluacion 8, semilla 42, optimizador AdamW (`ADAMW_TORCH_FUSED`) con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con `warmup_steps` del 10 %, 2 epocas y precision mixta nativa (AMP). El framework de entrenamiento fue `transformers` 5.20.2 con PyTorch 2.11.0+cu130, `datasets` 5.1.0 y `tokenizers` 0.23.3. No se especifica la composicion del dataset, el numero de tokens de entrenamiento ni si hubo tecnicas adicionales como RLHF o DPO (no aplicables, en cualquier caso, a un modelo extractivo de QA).

## Capacidades

- Extraccion de respuestas extractivas: dado un contexto y una pregunta, devuelve el span de texto del contexto que responde a la pregunta (pipeline `question-answering`).
- Procesamiento de pasajes de hasta 512 tokens (limite arquitectonico heredado de DistilBERT), con truncamiento y ventana deslizante si se necesita cubrir documentos mas largos.
- Inferencia muy rapida en CPU, adecuada para entornos con recursos limitados.
- No soporta generacion de texto libre, razonamiento multi-paso, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No esta planteado como modelo de agentes ni de razonamiento encadenado.
- Capacidades multilingues: no declaradas; el modelo base es `uncased` en ingles, por lo que el rendimiento fuera del ingles es incierto y probablemente bajo.

## Casos de uso

- **Extraccion de respuestas en bases de conocimiento internas**: indexar documentacion corporativa y, para cada consulta, recuperar el pasaje relevante y usar el modelo para localizar la frase exacta que responde. Es adecuado porque el coste por consulta es minimo y la salida es un span verificable del documento original.
- **Sistemas de FAQ sobre productos**: dado un catalogo de descripciones y una pregunta del usuario, devolver la frase concreta del catalogo que responde. La naturaleza extractiva evita respuestas inventadas fuera del contexto.
- **Preprocesado para pipelines RAG**: usar el modelo como extractor barato de respuestas candidatas antes de pasar a un LLM generativo, reduciendo el numero de llamadas a modelos grandes.
- **Analisis de contratos y documentos legales**: localizar clausulas concretas (fechas, importes, partes implicadas) en pasajes de hasta 512 tokens, con la ventaja de que la respuesta es literal del documento.
- **Extraccion de campos en formularios y correos**: identificar valores concretos (nombres, direcciones, referencias) dentro de un texto libre en tareas de digitalizacion.
- **Evaluacion y prototipado de pipelines de QA**: al ser un modelo pequeno y de licencia permisiva, sirve como linea base barata para comparar mejoras en sistemas de recuperacion y extraccion antes de invertir en modelos mayores.
- **Despliegue en dispositivos con poca memoria**: por su tamano (66M de parametros), puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace apto para entornos edge o funciones serverless con limites de memoria estrictos.

## Benchmarks y rendimiento

El `model-index` de la model card declara una lista de resultados vacia (`results: []`). No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exact match ni F1 sobre SQuAD ni sobre ningun otro conjunto de evaluacion.

## Requisitos de hardware

- **VRAM estimada**: en FP32, aproximadamente 265 MB para los pesos (66,4M parametros × 4 bytes); en FP16, unos 133 MB; en cuantizacion a 8 bits, unos 66 MB. El overhead de activaciones es minimo para contextos de 512 tokens.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM libre; funciona bien en T4, L4, RTX 3060, RTX 4090, A100 y H100, aunque estas ultimas estan sobredimensionadas para este modelo.
- **Consumer GPU**: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en GPUs integradas. Tambien es viable en CPU pura.
- **Opciones de despliegue**: `transformers` con pipeline `question-answering`, `optimum` (ONNX Runtime), TorchScript, `vLLM` no es la opcion natural (no es un modelo generativo), `llama.cpp` y `Ollama` no soportan este tipo de cabeza de QA de forma nativa. Para produccion en CPU, `optimum` con cuantizacion dinamica es la ruta recomendada.
- **Latencia y throughput**: no se han publicado mediciones especificas para este repositorio. Como referencia arquitectonica, DistilBERT procesa pasajes de 512 tokens en decenas de milisegundos en CPU moderna y en pocos milisegundos en GPU, con throughput del orden de cientos a miles de inferencias por segundo por GPU en batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dariurs/distilbert-base-uncased-squad | 66,4M | 512 tokens (limite arquitectonico) | QA extractivo | Apache 2.0 | HuggingFace |
| distilbert-base-uncased (base) | 66,4M | 512 tokens | Modelo base, sin cabeza de QA | Apache 2.0 | HuggingFace |
| bert-base-uncased fine-tuned en SQuAD (referencia de la comunidad) | 110M | 512 tokens | QA extractivo | Apache 2.0 | HuggingFace |
| RoBERTa-base fine-tuned en SQuAD | 125M | 512 tokens | QA extractivo | MIT | HuggingFace |

La comparacion con los ajustes de referencia de BERT y RoBERTa en SQuAD es cualitativa: no hay metricas publicadas para este repositorio que permitan afirmar si iguala o supera a esas lineas base. DistilBERT ofrece menor coste computacional que BERT-base a cambio de una perdida de rendimiento de unos pocos puntos en tareas de comprension lectora, segun la literatura original de destilacion.

## Limitaciones y advertencias

- **Sin evaluacion publicada**: no hay metricas de exact match ni F1, por lo que no se puede verificar la calidad del ajuste ni compararlo con alternativas.
- **Dataset de entrenamiento no declarado**: la model card indica "unknown dataset"; el nombre del repositorio sugiere SQuAD, pero no esta confirmado. Esto impide conocer la distribucion de los datos de entrenamiento y los sesgos asociados.
- **Modelo base uncased en ingles**: el preprocesado elimina mayusculas y el vocabulario es ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- **Riesgo de alucinacion estructuralmente bajo pero no nulo**: al ser extractivo, la respuesta siempre es un span del contexto, pero puede seleccionar un span incorrecto o irrelevante si la pregunta no tiene respuesta en el pasaje.
- **Contexto limitado a 512 tokens**: documentos mas largos requieren truncamiento o estrategias de ventana deslizante con solapamiento, lo que anade complejidad al pipeline.
- **Licencia Apache 2.0**: permite uso comercial, modificacion y redistribucion, con la obligacion de incluir el aviso de licencia y la clausula de patentes. No hay restricciones adicionales conocidas.
- **Repo de 9,0 GB para un modelo de 66M de parametros**: el repositorio contiene artefactos de entrenamiento voluminosos; conviene descargar solo los ficheros de pesos finales para evitar consumir espacio innecesario.
- **Modelo de autor individual sin mantenimiento declarado**: 0 likes y 78 descargas en el momento de la ficha; no hay garantia de soporte ni de actualizaciones.
- **No apto para generacion**: no debe usarse como sustituto de un LLM generativo en tareas de redaccion, resumen o dialogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dariurs/distilbert-base-uncased-squad
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Dataset SQuAD (referencia, no confirmado como dataset de entrenamiento): https://rajpurkar.github.io/SQuAD-explorer/
