# manaswinibj/distilbert-base-uncased

## Resumen

`manaswinibj/distilbert-base-uncased` es una réplica comunitaria del checkpoint DistilBERT base (uncased) publicado originalmente por Hugging Face. DistilBERT es un modelo transformer de tipo encoder-only, destilado a partir de BERT-base-uncased, y descrito en el artículo arXiv:1910.01108 (Sanh et al., 2019). Este repositorio concreto cuenta con 66.985.530 parámetros y una ventana de contexto máxima de 512 tokens.

El modelo resuelve tareas de comprensión del lenguaje que requieren representaciones bidireccionales del texto: clasificación de secuencias, etiquetado de tokens, question answering extractivo y modelado de lenguaje enmascarado (MLM). No es un modelo generativo autoregresivo, por lo que no está diseñado para chat ni para generación libre de texto; su uso previsto es el fine-tuning sobre tareas downstream o la extracción de embeddings.

Su relevancia actual reside en la eficiencia: el artículo original reporta una reducción de tamaño del 40% y una mejora de velocidad del 60% frente a BERT-base, conservando la mayor parte de su rendimiento. Esto lo convierte en una opción adecuada para inferencia en CPU, GPUs de gama baja y entornos con restricciones de memoria. El repositorio no registra descargas ni likes en el momento de la consulta, y los pesos se distribuyen con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia BERT); 6 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 66.985.530 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (maximo de posiciones) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos servidos en FP32); cuantizable a FP16/int8 con herramientas externas |
| Idiomas soportados | ingles (en); tokenizacion uncased |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; tambien PyTorch, TensorFlow y JAX segun los tags del repositorio |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder-only con la misma estructura interna que BERT pero con la mitad de capas: 6 capas frente a las 12 de BERT-base, 768 dimensiones ocultas y 12 cabezas de atencion. El tokenizador es WordPiece en su variante uncased, con un vocabulario de 30.522 tokens. Al tratarse de un modelo encoder-only, procesa la secuencia completa de forma bidireccional y no dispone de decodificacion autoregresiva.

El entrenamiento se realizo mediante destilacion de conocimiento tomando BERT-base-uncased como profesor, sobre el mismo corpus (BookCorpus y Wikipedia en ingles) y sin etiquetado humano. La funcion de perdida combinaba tres objetivos: la perdida de destilacion (replicar las probabilidades del profesor), la perdida de modelado de lenguaje enmascarado original de BERT (enmascarando el 15% de los tokens) y una perdida de similitud coseno sobre los estados ocultos, que fuerza al alumno a reproducir las representaciones internas del profesor. No se aplicaron tecnicas de RLHF ni DPO.

## Capacidades

- Modelado de lenguaje enmascarado (pipeline `fill-mask`): predice tokens en posiciones enmascaradas.
- Extraccion de caracteristicas y embeddings de frases: genera representaciones vectoriales utiles para busqueda semantica, clustering y similitud.
- Fine-tuning para clasificacion de secuencias: analisis de sentimiento, deteccion de spam, clasificacion de topicos.
- Fine-tuning para etiquetado de tokens: reconocimiento de entidades nombradas (NER), POS tagging, chunking.
- Question answering extractivo: localizacion de respuestas dentro de un pasaje dado.
- Next sentence prediction (objetivo de preentrenamiento heredado de BERT).
- No soporta tool calling ni function calling.
- No soporta flujos de agente ni razonamiento multi-paso.
- Multilingue: no; el modelo es exclusivamente en ingles.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Clasificacion de texto a escala: tras un fine-tuning ligero se puede desplegar para moderacion de contenido, filtrado de spam o clasificacion de tickets de soporte, con un coste de inferencia muy bajo por su tamano reducido.
- Reconocimiento de entidades nombradas: util para extraer personas, organizaciones y localizaciones en pipelines de procesamiento documental, con anotacion de secuencias sobre textos de hasta 512 tokens.
- Question answering extractivo: integrable en sistemas de soporte que deban localizar la respuesta exacta dentro de un pasaje de documentacion o de un articulo.
- Generacion de embeddings para busqueda semantica: los vectores del encoder sirven como base para indices vectoriales y recuperacion de documentos.
- Reranking en pipelines RAG: puntuar pares consulta-documento para reordenar candidatos recuperados antes de pasarlos a un modelo generativo mayor.
- Etiquetado automatico de datos (weak labeling): preanotar grandes volumenes de texto para reducir el coste de anotacion humana antes del fine-tuning de modelos mayores.
- Deteccion de similitud y deduplicacion: comparar representaciones para agrupar documentos casi identicos en corpus grandes.
- Clasificacion de sentimiento en resenas: fine-tuning sobre datasets etiquetados con inferencia en CPU, adecuado para desplegar en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio consultado no incluye tablas de MMLU, GLUE, SQuAD ni HumanEval, y la model card no aporta cifras numericas de evaluacion. Cualquier dato de rendimiento debe consultarse en el articulo original (arXiv:1910.01108) o en la model card oficial de `distilbert-base-uncased`.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en FP32 y 134 MB en FP16 para los pesos; con activaciones y overhead, entre 0,5 y 1 GB en FP32 para lotes pequenos.
- GPU recomendadas: practicamente cualquiera con mas de 1 GB de memoria, incluidas NVIDIA T4, RTX 3060, RTX 4090 y GPUs integradas modernas.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en muchas integradas; tambien es viable en CPU para lotes pequenos.
- Opciones de despliegue: Hugging Face Transformers (PyTorch, TensorFlow, JAX) y ONNX Runtime. No se declaran pesos GGUF en este repositorio, por lo que su uso directo con llama.cpp u Ollama requeriria una conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware, del lote y de la cuantizacion empleada.
- El tamano del repositorio (1,5 GB) refleja los distintos formatos de pesos incluidos, no un requisito de memoria durante la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DistilBERT base uncased (este repo) | 66.985.530 | 512 | Encoder-only destilado | Apache 2.0 | Hugging Face |
| BERT-base-uncased (profesor) | 110 M | 512 | Encoder-only | Apache 2.0 | Hugging Face |
| DistilRoBERTa-base | 82 M | 512 | Encoder-only destilado | Apache 2.0 | Hugging Face |
| ALBERT-base-v2 | 12 M | 512 | Encoder-only con parametros compartidos | Apache 2.0 | Hugging Face |

Los datos de parametros, contexto y licencia de los modelos comparados proceden de su documentacion publica. No se dispone de cifras comparativas de rendimiento en la informacion proporcionada para este repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: la model card documenta sesgos de genero y etnia en las predicciones de MLM, heredados del modelo profesor BERT-base-uncased. Por ejemplo, ante `The Black woman worked as a [MASK]` aparecen con alta probabilidad terminos como `waitress`, `nurse` o `maid`.
- Riesgo de alucinacion: no aplica en el sentido generativo clasico, pero las predicciones de tokens enmascarados pueden ser incorrectas o estereotipadas sin que el modelo exprese incertidumbre.
- Limitaciones de idioma: entrenado y evaluado unicamente en ingles; el rendimiento en otros idiomas no esta garantizado.
- Limitaciones de contexto: ventana fija de 512 tokens, sin mecanismos de atencion extendida.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya la autoria original.
- Caveat de produccion: al ser una replica subida por un tercero, se recomienda verificar la integridad de los pesos frente al checkpoint oficial `distilbert-base-uncased` antes de usarlo en entornos criticos.
- No es un modelo generativo: no debe emplearse para chat, redaccion de texto ni tareas autoregresivas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manaswinibj/distilbert-base-uncased
- Checkpoint oficial: https://huggingface.co/distilbert-base-uncased
- Modelo profesor: https://huggingface.co/bert-base-uncased
- Articulo original: https://arxiv.org/abs/1910.01108
- Codigo del proceso de destilacion: https://github.com/huggingface/transformers/tree/main/examples/research_projects/distillation
- Modelos derivados de DistilBERT: https://huggingface.co/models?filter=distilbert
