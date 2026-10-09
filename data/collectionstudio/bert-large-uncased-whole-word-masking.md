# CollectionStudio/bert-large-uncased-whole-word-masking

## Resumen

BERT large uncased whole word masking es un modelo de lenguaje encoder-only preentrenado por Google Research sobre texto en inglés mediante objetivos auto-supervisados de masked language modeling (MLM) y next sentence prediction (NSP). Fue presentado en el artículo "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding" (arXiv:1810.04805) y publicado originalmente en el repositorio google-research/bert. La variante "whole word masking" introduce una modificación en la estrategia de enmascaramiento: en lugar de enmascarar tokens WordPiece individuales, se enmascaran de una vez todos los tokens que componen una misma palabra, manteniendo la tasa global de enmascaramiento en el 15 %. El modelo es "uncased", por lo que no distingue entre mayúsculas y minúsculas.

La ficha que se documenta aquí corresponde a una resubida comunitaria realizada por el usuario CollectionStudio, no al repositorio oficial. El modelo es idéntico en arquitectura y pesos al bert-large-uncased-whole-word-masking original: 24 capas, dimensión oculta de 1024, 16 cabezas de atención y 336.226.108 parámetros (aproximadamente 336 M). El repositorio ocupa 5,5 GB e incluye pesos en PyTorch, TensorFlow, JAX y safetensors.

Es relevante porque BERT-large sigue siendo una referencia sólida como extractor de representaciones y como base para fine-tuning en tareas de comprensión del lenguaje (clasificación de secuencias, etiquetado de tokens y question answering extractivo). No es un modelo generativo: no produce texto libre y no debe emplearse con ese propósito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (BERT) |
| Parametros totales | 336.226.108 (≈336 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de posiciones de la arquitectura BERT original) |
| Capas | 24 |
| Dimensión oculta | 1024 |
| Cabezas de atención | 16 |
| Tipos de cuantizacion | no especificados por el autor; los pesos safetensors admiten cuantización dinámica a int8 en PyTorch y conversión a ONNX/TensorRT. No hay versiones GGUF oficiales |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch (bin), TensorFlow, JAX |
| Tokenizador | WordPiece, vocabulario uncased de 30.522 tokens (estándar en BERT uncased) |
| Datasets de preentrenamiento | bookcorpus, wikipedia (más texto de BookCorpus y Wikipedia en inglés según el artículo original) |
| Tamaño del repositorio | 5,5 GB |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-only con atención bidireccional completa. A diferencia de los modelos autorregresivos, cada token atiende a todos los demás tokens de la secuencia, lo que permite representaciones contextuales en ambas direcciones. El preentrenamiento combina dos objetivos: masked language modeling, donde se enmascara el 15 % de los tokens y el modelo predice los enmascarados a partir del contexto, y next sentence prediction, donde el modelo determina si dos segmentos de texto eran consecutivos en el corpus original. La innovación concreta de esta variante es el whole word masking: cuando una palabra se divide en varios subtokens WordPiece, se enmascaran todos ellos simultáneamente. La tasa de enmascaramiento global no cambia y cada token enmascarado se sigue prediciendo de forma independiente.

El preentrenamiento se realizó sobre un corpus en inglés compuesto por BookCorpus y Wikipedia, sin etiquetado humano, siguiendo el procedimiento descrito en el artículo original. No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni el uso de fases posteriores de RLHF o DPO, que en cualquier caso no forman parte del pipeline de BERT. Tampoco se documenta en la model card información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia. Los pesos publicados en este repositorio son una copia de los del modelo original de Google Research.

## Capacidades

- Generación de representaciones contextuales bidireccionales del texto en inglés, aptas como features para modelos downstream.
- Masked language modeling (fill-mask): predicción de tokens enmascarados dentro de una secuencia.
- Clasificación de secuencias tras fine-tuning: análisis de sentimiento, detección de spam, clasificación de temas, inferencia textual (NLI).
- Etiquetado de tokens tras fine-tuning: reconocimiento de entidades nombradas (NER), etiquetado POS, chunking.
- Question answering extractivo: localización de la respuesta a una pregunta dentro de un párrafo de contexto.
- Next sentence prediction como tarea auxiliar, útil en tareas de relación entre pares de frases.
- Extracción de embeddings de frases o documentos para búsqueda semántica y clustering (habitualmente mediante sentence-transformers o pooling sobre la salida del encoder).
- No soporta tool calling, function calling ni razonamiento multi-paso agéntico: no es un modelo instruido ni generativo.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad multilingüe: no, está entrenado únicamente en inglés.

## Casos de uso

- Reconocimiento de entidades nombradas en producción: se añade una cabeza de clasificación de tokens sobre el encoder y se hace fine-tuning con un dataset etiquetado. La representación bidireccional mejora la desambiguación de entidades respecto a modelos unidireccionales.
- Análisis de sentimiento y clasificación de opiniones: fine-tuning sobre reseñas o tickets de soporte. Con 336 M de parámetros ofrece un equilibrio razonable entre calidad y coste de inferencia para volúmenes altos.
- Question answering extractivo sobre documentación interna: dado un contexto y una pregunta, el modelo devuelve el fragmento de respuesta. Adecuado para búsqueda documental donde la respuesta es literal, no generada.
- Reranking en pipelines de búsqueda: se puntúa la relevancia de pares (consulta, documento) con una cabeza de clasificación y se reordena la lista de candidatos devuelta por un retriever inicial.
- Moderación de contenido y detección de toxicidad: fine-tuning sobre datasets etiquetados para clasificar comentarios. La ventana de 512 tokens cubre la mayoría de mensajes y publicaciones cortas.
- Extracción de información estructurada de contratos o facturas: etiquetado de tokens para identificar campos como fechas, importes o partes firmantes, con la salvedad de que el modelo solo maneja inglés.
- Construcción de índices de embeddings para búsqueda semántica: uso del encoder congelado como extractor de vectores, combinado con FAISS o similares. Requiere un pooling adecuado y, preferiblemente, un fine-tuning contrastivo.
- Evaluación lingüística y análisis de sesgos: el modelo sirve como sonda para estudiar asociaciones estereotipadas aprendidas del corpus (véase la sección de limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de GLUE, SQuAD, MMLU, HumanEval ni ninguna otra, y los resultados de la búsqueda web no contienen datos de evaluación del modelo. No se deben asumir cifras del artículo original sin verificarlas en la publicación correspondiente.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,34 GB en fp32, 672 MB en fp16/bf16 y 336 MB en int8.
- VRAM real en uso: superior a la de los pesos por el almacenamiento de activaciones, el tamaño de lote y la longitud de secuencia. Con lotes pequeños y secuencias de 512 tokens, un presupuesto de 2-4 GB en fp16 suele ser suficiente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para inferencia. Para entrenamiento con fine-tuning se recomienda NVIDIA A100, H100, L40S o RTX 4090 (24 GB); con técnicas de gradient checkpointing y lotes pequeños es viable en GPUs de 12-16 GB.
- Cabe en GPU de consumo: sí. RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y GPUs integradas tipo Apple Silicon (M1/M2/M3 con memoria unificada) pueden ejecutarlo sin problemas en fp16 o int8.
- CPU: la inferencia en CPU es viable para lotes pequeños, con latencias de decenas a cientos de milisegundos por secuencia según el hardware.
- Opciones de despliegue: Hugging Face Transformers (PyTorch, TensorFlow y JAX), ONNX Runtime, TensorRT, TorchScript, NVIDIA Triton Inference Server y Hugging Face Inference Endpoints. Para acelerar la inferencia, Optimum y BetterTransformer. No es habitual desplegarlo con llama.cpp u Ollama, que están orientados a modelos generativos, aunque existen conversiones a GGUF para BERT en el ecosistema.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependen críticamente del hardware, del tamaño de lote y de la longitud de secuencia.

## Comparativa con modelos similares

Los datos de esta tabla proceden de conocimiento público general sobre cada familia de modelos, no de la información proporcionada en la búsqueda. Los resultados de benchmarks no se incluyen por no estar disponibles para este modelo.

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| bert-large-uncased-whole-word-masking (este) | ≈336 M | 512 | apache-2.0 | Encoder-only, MLM + NSP |
| bert-large-uncased (Google) | ≈336 M | 512 | apache-2.0 | Encoder-only, MLM + NSP sin whole word masking |
| roberta-large (Meta) | ≈355 M | 512 | MIT | Encoder-only, MLM dinámico, sin NSP |
| deberta-v3-large (Microsoft) | ≈435 M | 512 | MIT | Encoder-only con atención desenredada |
| electra-large (Google) | ≈335 M | 512 | apache-2.0 | Encoder-only con objetivo replaced token detection |

Diferencias clave: RoBERTa elimina el objetivo NSP, usa enmascaramiento dinámico y entrena sobre un corpus mayor; DeBERTa introduce atención desenredada y mejora en tareas de comprensión; ELECTRA emplea detección de tokens sustituidos, lo que reduce el coste de cómputo por punto de rendimiento. Todos ellos comparten la misma ventana de 512 tokens heredada de BERT.

## Limitaciones y advertencias

- Este repositorio es una resubida comunitaria (autor CollectionStudio) con 0 descargas y 0 likes en el momento de redactar la ficha. Para uso en producción conviene verificar la integridad de los pesos contra el repositorio oficial google-bert/bert-large-uncased-whole-word-masking.
- Sesgos documentados: la propia model card muestra predicciones estereotipadas en fill-mask (por ejemplo, asociación de determinadas profesiones con un género concreto). El corpus BookCorpus y Wikipedia contiene sesgos de género, raza, religión y nacionalidad que el modelo reproduce.
- Riesgo de alucinación: al no ser un modelo generativo, no "alucina" texto, pero sí puede producir predicciones de tokens o clasificaciones incorrectas con alta confianza aparente. En question answering extractivo puede seleccionar fragmentos que no responden a la pregunta.
- Limitación de idioma: solo inglés. No se debe esperar un rendimiento aceptable en castellano ni en otras lenguas sin fine-tuning adicional.
- Limitación de contexto: 512 tokens. Los documentos más largos deben truncarse, segmentarse o procesarse con estrategias de chunking, lo que puede fragmentar la información relevante.
- Licencia apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la atribución correspondiente. No impone restricciones de uso más allá de las condiciones habituales de la licencia Apache 2.0.
- No es un modelo de instrucciones: no responde a prompts en lenguaje natural ni mantiene conversaciones. Cualquier uso conversacional requiere fine-tuning específico o el uso de un modelo generativo.
- Coste de fine-tuning: 336 M de parámetros implican requisitos de memoria considerables si se actualizan todos los pesos; conviene valorar LoRA, adaptadores o entrenamiento parcial de capas.

## Enlaces

- Modelo en Hugging Face (resubida): https://huggingface.co/CollectionStudio/bert-large-uncased-whole-word-masking
- Modelo oficial original: https://huggingface.co/google-bert/bert-large-uncased-whole-word-masking
- Artículo original de BERT: https://arxiv.org/abs/1810.04805
- Repositorio de Google Research: https://github.com/google-research/bert
- Documentación de BERT en Transformers: https://huggingface.co/docs/transformers/model_doc/bert
- Listado de modelos BERT en el Hub: https://huggingface.co/models?filter=bert

Nota: los resultados de la búsqueda web proporcionada no contienen enlaces relevantes sobre este modelo; consisten en páginas sin relación con inteligencia artificial. Por ese motivo solo se listan los enlaces conocidos del ecosistema oficial de BERT.
