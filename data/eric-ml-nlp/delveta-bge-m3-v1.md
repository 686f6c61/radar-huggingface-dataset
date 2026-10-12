# eric-ml-nlp/Delveta-BGE-M3-v1

## Resumen

Delveta-BGE-M3-v1 es un recuperador denso (dense retriever) obtenido por ajuste fino supervisado del modelo BAAI/bge-m3, desarrollado por el usuario eric-ml-nlp como artefacto final de inferencia de la pista de fine-tuning BGE-M3 del proyecto Delveta. Su funcion es generar embeddings de 1024 dimensiones para busqueda semantica y recuperacion por capacidades (capability retrieval) dentro de un pipeline de recuperacion propio. No es un modelo generativo ni un clasificador: no tiene cabeza de clasificacion y no asigna una etiqueta de capacidad a la consulta.

La arquitectura subyacente es la del encoder denso de BGE-M3, basado en XLM-RoBERTa-large, con pooling de tipo CLS seguido de normalizacion L2 (`normalize(last_hidden_state[:, 0])`). El modelo es multilingue, hereda la licencia MIT y se distribuye en tres variantes dentro de un mismo repositorio: FP32 (maestra, safetensors float32, 2,27 GB), FP16 (derivada, safetensors float16, 1,14 GB) e INT8 (derivada, ONNX con cuantizacion dinamica, 568,51 MB). Las tres comparten la misma semantica de embedding.

Su relevancia es acotada pero clara: sirve como componente de recuperacion de bajo coste y desplegable en CPU mediante ONNX Runtime, con verificaciones de consistencia numerica entre variantes publicadas por el autor. No se han publicado resultados de efectividad de recuperacion (recall, nDCG, MRR) en la informacion disponible, solo comprobaciones de consistencia a nivel de embedding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (XLM-RoBERTa-large) heredado de BAAI/bge-m3; recuperador denso sin cabeza de clasificacion; pooling CLS + normalizacion L2 |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base BAAI/bge-m3 se construye sobre XLM-RoBERTa-large) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este fine-tune (el modelo base BGE-M3 admite hasta 8192 tokens) |
| Tipos de cuantizacion | FP32 (referencia), FP16, INT8 dinamica (ONNX) |
| Idiomas soportados | Multilingue (heredado del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32 y FP16) y ONNX (INT8) |

Notas sobre el repositorio: no hay copia del modelo en la raiz; cada variante vive en su propia subcarpeta (`FP32/`, `FP16/`, `INT8/`) con pesos, config, tokenizer y README propios. El tamano total del repositorio es de 4,0 GB.

## Arquitectura y entrenamiento

El modelo parte del checkpoint `BAAI/bge-m3` (revision `5617a9f61b028005a4858fdac845db406aefb181`) y conserva unicamente la rama densa del recuperador original. Se descartan las salidas dispersa (lexical) y multivector (ColBERT) de BGE-M3: el fine-tune es exclusivamente denso y produce un unico vector normalizado de 1024 dimensiones por texto. No se anade ninguna cabeza de clasificacion y no existe una separacion de tareas tipo "Task A / Task B" con dos perdidas, sino un unico objetivo.

El entrenamiento emplea un objetivo contrastivo unificado con esquema de entrada `query` / `positive` / `negative`. Un positivo puede ser la descripcion canonica de una capacidad o una consulta de corpus estandar o similar: ambos casos se tratan como la misma tarea contrastiva para el embedder. Se activan negativos in-batch por defecto y se aplica un muestreo especifico denominado "capability-unique batching", que limita a una sola fila de entrenamiento por capacidad y por lote. El campo `gold_capability_id` se usa solo para ese muestreo y nunca entra en la perdida; el campo `task` es unicamente metadato. El checkpoint entrenado corresponde a `checkpoint-2027`, que constituye los pesos de la variante FP32 maestra; FP16 e INT8 se derivan de ella. Los scripts de entrenamiento, el sampler, el mixin del trainer y las pruebas asociadas estan publicados en el repositorio de GitHub del proyecto, fijados a la revision `a7a30ee`.

Las comprobaciones publicadas entre variantes son de consistencia numerica, no de calidad de recuperacion: sobre 12 consultas de prueba congeladas, el coseno de FP16 frente a FP32 es aproximadamente 1,0 (minimo 0,999999), y el de INT8 frente a FP32 tiene un minimo de 0,988 y una media de 0,991.

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones con pooling CLS y normalizacion L2, aptos para similitud coseno.
- Recuperacion densa (dense retrieval) y busqueda semantica sobre corpus textuales.
- Recuperacion por capacidades (capability retrieval), orientada a identificar descripciones canonicas de capacidades frente a consultas.
- Similitud entre frases (sentence similarity) y extraccion de caracteristicas (feature extraction) como tareas de pipeline declaradas.
- Soporte multilingue heredado del modelo base BGE-M3.
- Inferencia en CPU mediante la variante ONNX INT8, y en GPU o CPU con las variantes safetensors FP32 y FP16.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni comportamiento de agente: es un modelo de embeddings, no un modelo de lenguaje generativo.
- No dispone de cabeza de clasificacion ni de modo de pensamiento (thinking mode); no produce etiquetas ni decisiones, solo vectores.

## Casos de uso

- Recuperacion semantica en un pipeline RAG: el modelo indexa documentos como vectores de 1024 dimensiones y recupera los pasajes mas similares a la consulta del usuario; se usa como etapa de recuperacion previa a un modelo generativo.
- Enrutado de capacidades en un sistema de agentes: dado un texto de consulta, se compara su embedding con las descripciones canonicas de capacidades registradas para seleccionar la herramienta o habilidad candidata, sin necesidad de un clasificador dedicado.
- Busqueda multilingue sobre documentacion tecnica: al heredar el caracter multilingue de BGE-M3, permite consultar en un idioma y recuperar documentos en otro dentro del mismo espacio de embeddings.
- Deduplicacion y agrupamiento de textos: el calculo de similitud coseno entre embeddings permite detectar documentos o consultas casi duplicados en grandes volumenes.
- Despliegue en entornos sin GPU: la variante ONNX INT8 (568,51 MB) permite servir recuperacion densa en CPU con ONNX Runtime, adecuada para servicios de bajo trafico o entornos edge.
- Filtrado y ranking de candidatos en motores de busqueda internos: como segunda etapa de reordenacion (reranking) por similitud densa sobre los resultados de una busqueda lexica previa.
- Moderacion o clasificacion por similitud: comparar embeddings de contenido nuevo contra un conjunto de referencia etiquetado para aproximar categorias, siempre como senal auxiliar y no como clasificador entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta comprobaciones de consistencia numerica entre variantes de cuantizacion, que no son metricas de efectividad de recuperacion:

| Comparacion | Coseno minimo | Coseno medio |
|---|---|---|
| FP16 frente a FP32 | 0,999999 | Aproximadamente 1,0 |
| INT8 frente a FP32 | 0,988 | 0,991 |

No hay datos publicados de MMLU, HumanEval, GSM8K, nDCG, MRR, recall@k ni de cualquier otra metrica de recuperacion para este modelo.

## Requisitos de hardware

- VRAM estimada para FP32: alrededor de 2,3 GB solo para pesos, mas memoria para activaciones y lote; en la practica, 4-6 GB de VRAM para lotes moderados.
- VRAM estimada para FP16: alrededor de 1,2 GB solo para pesos; viable en GPUs consumer con 4 GB o mas.
- INT8 ONNX: 568,51 MB de pesos y ejecucion en CPU mediante ONNX Runtime, sin GPU.
- GPU recomendadas: cualquier GPU con soporte de PyTorch para FP16 (por ejemplo, RTX 3060/4090, A100, H100); para FP32, GPUs con al menos 4-6 GB de VRAM.
- Caben en GPU consumer: si, tanto FP16 como FP32 en tarjetas de gama media y alta recientes.
- Opciones de despliegue: transformers (safetensors FP32/FP16), ONNX Runtime (INT8 en CPU). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no aplican a un encoder de embeddings.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card indica que las cifras medidas en CPU se recogen en el README de la variante INT8, pero no se incluyen en el material disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Delveta-BGE-M3-v1 | No disponible (base XLM-RoBERTa-large) | No disponible en la informacion (base hasta 8192) | safetensors (FP32/FP16), ONNX INT8 | MIT | Fine-tune denso especifico del proyecto Delveta; sin resultados de recuperacion publicados |
| BAAI/bge-m3 | No disponible en la informacion (XLM-RoBERTa-large) | Hasta 8192 tokens | safetensors | MIT | Modelo base; recuperacion densa, dispersa y multivector; ampliamente evaluado en la literatura |
| BAAI/bge-large-en-v1.5 | No disponible en la informacion | No disponible en la informacion | safetensors | MIT | Alternativa densa centrada en ingles |
| intfloat/multilingual-e5-large | No disponible en la informacion | No disponible en la informacion | safetensors | MIT | Alternativa densa multilingue |

Los datos de los modelos comparables no estan incluidos en la informacion proporcionada y no se han verificado aqui; se listan unicamente como referencias de categoria. No se dispone de comparativas de rendimiento publicadas para este modelo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no ejecuta razonamiento multi-paso ni soporta tool calling; cualquier uso como asistente conversacional es un error de planteamiento.
- No hay cabeza de clasificacion: no debe usarse para asignar directamente una etiqueta de capacidad o categoria a una consulta; solo genera embeddings.
- Ausencia de resultados de efectividad de recuperacion: la model card solo aporta comprobaciones de consistencia numerica entre variantes, no metricas como recall@k o nDCG, por lo que el rendimiento real de recuperacion no esta verificado publicamente.
- Riesgo de falso positivo en similitud: al ser un recuperador denso, consultas semanticamente proximas pero funcionalmente distintas pueden producir embeddings muy similares; se recomienda umbralado y validacion con datos propios.
- Idiomas: hereda el soporte multilingue de BGE-M3, pero el ajuste fino se ha hecho sobre un corpus especifico del proyecto Delveta no detallado en la informacion disponible; el rendimiento puede degradarse fuera de ese dominio.
- Longitud de contexto: no se documenta un limite especifico para este fine-tune; se hereda el comportamiento del modelo base, cuyo maximo citado es de 8192 tokens. Textos mas largos requeririan truncado o fragmentacion.
- Licencia MIT: permite uso comercial y modificacion, con obligacion de conservar el aviso de copyright y la licencia. Conviene revisar tambien las condiciones del modelo base BAAI/bge-m3.
- Repositorio con muy poca adopcion: 5 descargas y 0 "me gusta" en el momento de la consulta; sin validacion externa ni comunidad que reporte incidencias.
- Trazabilidad: el autor publica hashes SHA256 y revisiones fijadas del codigo, lo que facilita la reproducibilidad, pero la documentacion de entrenamiento detallada esta fuera de HuggingFace, en el repositorio de GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eric-ml-nlp/Delveta-BGE-M3-v1
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Paper de BGE-M3 (arXiv:2402.03216): https://arxiv.org/abs/2402.03216
- Repositorio Delveta, scripts de fine-tuning de BGE-M3: https://github.com/Eric-LLMs/Delveta/tree/main/scripts/bge_m3_finetune
- Entrada de entrenamiento (`train_bge_m3_dual_target.py`): https://github.com/Eric-LLMs/Delveta/blob/a7a30eeac33202e95729e610dd2f00b820154260/scripts/bge_m3_finetune/train_bge_m3_dual_target.py
- Sampler de capacidades unicas (`capability_unique_sampler.py`): https://github.com/Eric-LLMs/Delveta/blob/a7a30eeac33202e95729e610dd2f00b820154260/scripts/bge_m3_finetune/capability_unique_sampler.py
- Mixin del trainer (`capability_unique_trainer.py`): https://github.com/Eric-LLMs/Delveta/blob/a7a30eeac33202e95729e610dd2f00b820154260/scripts/bge_m3_finetune/capability_unique_trainer.py
- Comprobacion de alineacion de filas (`dual_target_alignment.py`): https://github.com/Eric-LLMs/Delveta/blob/a7a30eeac33202e95729e610dd2f00b820154260/scripts/bge_m3_finetune/dual_target_alignment.py
- Pruebas del sampler (`test_capability_unique_sampler.py`): https://github.com/Eric-LLMs/Delveta/blob/a7a30eeac33202e95729e610dd2f00b820154260/scripts/bge_m3_finetune/test_capability_unique_sampler.py
- Pruebas de la entrada de entrenamiento (`test_dual_target_training_entry.py`): https://github.com/Eric-LLMs/Delveta/blob/a7a30eeac33202e95729e610dd2f00b820154260/scripts/bge_m3_finetune/test_dual_target_training_entry.py
- Registro del experimento (entrenamiento, variantes y evaluacion): https://github.com/Eric-LLMs/Delveta/blob/a7a30eeac33202e95729e610dd2f00b820154260/docs/experiments/bge-m3-finetuning.md
