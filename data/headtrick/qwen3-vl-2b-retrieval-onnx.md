# headtrick/Qwen3-VL-2B-Retrieval-ONNX

## Resumen

Qwen3-VL-2B-Retrieval-ONNX es una exportación a formato ONNX Runtime del par de modelos Qwen3-VL-Embedding-2B y Qwen3-VL-Reranker-2B, desarrollados originalmente por el equipo Qwen de Alibaba. La exportación la firma el usuario headtrick y está pensada para su uso en paperus, una biblioteca de investigación autoalojada que busca pasajes y figuras de artículos científicos de forma conjunta. El objetivo es disponer de un sistema de recuperación multimodal (texto e imagen) sin depender de PyTorch en tiempo de inferencia.

El paquete incluye un codificador visual compartido (idéntico en ambos modelos), una tabla de embeddings de tokens común, y dos decodificadores: uno que produce un vector normalizado de 2048 dimensiones para la tarea de embedding y otro que devuelve un logit «sí menos no» para la tarea de reranking. Ambos decodificadores se ofrecen en fp16 y en int8, de modo que el usuario puede elegir entre precisión y consumo de memoria.

Su relevancia actual radica en que permite desplegar búsqueda multimodal sobre figuras y texto científico con un runtime ligero (ONNX Runtime), sin necesidad de instalar PyTorch ni transformers en producción, manteniendo una concordancia muy alta con los modelos originales (coseno de 0,998 a 1,0 en fp16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) exportado a ONNX; codificador visual + decodificador de lenguaje |
| Parametros totales | 2B (modelo base Qwen3-VL-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (decodificadores y vision encoder) e int8 (decodificadores, MatMulNBits, bloque 128, cómputo fp16) |
| Idiomas soportados | no disponibles (la model card menciona textos en inglés y alemán en las pruebas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (vision_encoder_fp16.onnx, decoder_fp16.onnx, decoder_int8.onnx) y .npy (embed_tokens_fp16.npy) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-2B, un transformer multimodal con codificador visual y decodificador de lenguaje. En esta exportación, el codificador visual procesa una imagen por llamada y recibe como entradas los parches (`pixel_values`, parches × 1536, fp16, normalizados a [-1, 1]), los índices y pesos de interpolación bilineal de la rejilla de posiciones aprendida de 48 × 48 (`interp_indices`, `interp_weights`, parches × 4) y los `position_ids` (parches × 2, fila y columna). La salida son `image_features` (parches / 4 × 2048) y `deepstack_features` (3 × parches / 4 × 2048). Al calcularse fuera del grafo las entradas dependientes de la rejilla, se admite cualquier tamaño y forma de imagen.

Los decodificadores reciben `inputs_embeds` (batch × tokens × 2048, fp16), `attention_mask` (padding a la izquierda), `position_ids` (3 × batch × tokens, posiciones temporal/fila/columna de Qwen3-VL) y `deepstack` (3 × batch × tokens × 2048). El decodificador de embedding devuelve un vector normalizado de 2048 dimensiones; el de reranking, un score escalar por par consulta-documento. Las secuencias siguen las plantillas de chat de sentence-transformers 5.4, y la secuencia del modelo de embedding termina en `<|endoftext|>`, cuyo estado es el vector resultante.

La exportación se realizó con transformers 5.22 y torch 2.15 mediante exportación dinámica a ONNX, sustituyendo el bucle de atención por segmentos del codificador visual por atención completa (una imagen por llamada). La cuantización int8 se hizo con MatMulNBits de ONNX Runtime (bloque 128, cómputo fp16); la cuantización a 4 bits se descartó por pérdida excesiva de calidad (coseno 0,85-0,92). No se detalla en la información disponible el proceso de entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) de los modelos Qwen3-VL subyacentes.

## Capacidades

- Generación de embeddings multimodales: textos e imágenes de cualquier tamaño y forma se proyectan en un mismo espacio vectorial de 2048 dimensiones.
- Reranking multimodal: puntuación de pares consulta-documento tanto para texto como para imágenes.
- Recuperación de figuras científicas: búsqueda por similitud visual sobre figuras de artículos de física.
- Recuperación de pasajes de texto: búsqueda semántica sobre el texto de artículos.
- Procesamiento de imágenes de resolución y forma arbitrarias gracias al cálculo externo de las entradas dependientes de la rejilla.
- Inferencia sin PyTorch: ejecución completa sobre ONNX Runtime.
- Soporte multilingüe parcial: la model card cita pruebas con textos en inglés y alemán, aunque no se declara una lista oficial de idiomas.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión generativa ni modo de razonamiento (thinking mode); el modelo es de extracción de características y reranking.

## Casos de uso

- Búsqueda de figuras en bibliotecas científicas: el codificador visual permite indexar figuras de artículos y recuperar las visualmente similares a una consulta; en las pruebas del autor, el embedding situó la figura correcta en primer lugar en el 40 % de 65 preguntas, elevándose al 62 % al aplicar el reranker sobre el top 20.
- Recuperación de pasajes de texto en repositorios de papers: el par embedding + reranker permite búsqueda semántica sobre el texto de artículos; en 200 preguntas igualó o superó a arctic-embed-m-v2 con bge-reranker-v2-m3.
- Despliegue autoalojado sin PyTorch: al ejecutarse íntegramente sobre ONNX Runtime, encaja en entornos con restricciones de dependencias o donde se quiere un runtime pequeño; es el caso de paperus, la biblioteca de investigación para la que se exportó.
- Reranking de resultados en pipelines de búsqueda existentes: el decodificador de reranking puntúa candidatos recuperados por un primer estadio, con un coste medido de 0,33 s para 10 candidatos de unos 300 tokens en una RTX 2080 SUPER.
- Indexación multimodal unificada: al compartir espacio vectorial textos e imágenes, permite construir un único índice que mezcle figuras y pasajes y consultar ambos con la misma pregunta.
- Servicio de búsqueda con latencia baja en GPU de gama media: una consulta tarda unos 15-25 ms en una RTX 2080 SUPER con ONNX Runtime 1.31 CUDA, lo que permite atender búsquedas interactivas en hardware no de datacenter.
- Prototipado e investigación en recuperación multimodal: los scripts de exportación y comprobación incluidos permiten reproducir la conversión y validar la concordancia con los modelos originales.

## Benchmarks y rendimiento

Concordancia con los modelos originales en PyTorch (fp16, sentence-transformers), sobre figuras de artículos de física y textos en inglés y alemán:

| Componente | Decodificadores fp16 | Decodificadores int8 |
|---|---|---|
| Codificador visual | coseno 0,9995-0,99999 | (fp16) |
| Embedding, textos | coseno 0,9999-1,0001 | 0,9986-0,9991 |
| Embedding, imágenes (preparadas en numpy) | 0,998-0,999 | 0,996-0,997 |
| Reranker | puntuaciones dentro de ±0,03, mismo orden | puntuaciones desplazadas ~+0,19, mismo orden |

Resultados de recuperación medidos en paperus:

| Tarea | Resultado |
|---|---|
| 3.198 figuras de artículos de física, 65 preguntas por apariencia | figura correcta en primer lugar en el 40 % de los casos; 62 % con reranker sobre el top 20 |
| 200 preguntas sobre texto de los artículos | igualó o superó a arctic-embed-m-v2 con bge-reranker-v2-m3 |

Rendimiento medido en RTX 2080 SUPER con ONNX Runtime 1.31 CUDA:

| Operación | Tiempo |
|---|---|
| Consulta | 15-25 ms |
| Reranking de 10 candidatos de ~300 tokens | 0,33 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 10,0 GB; los decodificadores int8 reducen a la mitad la memoria de estos respecto a fp16, según la model card.
- GPU recomendadas: RTX 2080 SUPER (medida de referencia del autor), y por capacidad, tarjetas con al menos 8-16 GB de VRAM para fp16; las versiones int8 permiten ajustar más el consumo.
- Cabe en GPU de consumo: sí, al menos en una RTX 2080 SUPER con ONNX Runtime 1.31 CUDA, según las mediciones del autor.
- Opciones de despliegue: ONNX Runtime (con proveedor CUDA), sin necesidad de PyTorch; la implementación de referencia en numpy está disponible en el repositorio paperus.
- Latencia y throughput: consulta de 15-25 ms y reranking de 10 candidatos de ~300 tokens en 0,33 s en RTX 2080 SUPER; el autor indica que no es más rápido que PyTorch (dentro de un ~10 %), y que la ventaja es un runtime pequeño sin PyTorch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Retrieval-ONNX (este) | 2B | no disponible | Texto e imagen | Apache-2.0 | ONNX (fp16, int8) |
| Qwen3-VL-Embedding-2B / Reranker-2B (originales) | 2B | no disponible | Texto e imagen | Apache-2.0 | PyTorch / sentence-transformers |
| arctic-embed-m-v2 + bge-reranker-v2-m3 | no disponible | no disponible | Texto | no disponible | no disponible |

En las pruebas del autor sobre 200 preguntas de texto, el par Qwen3-VL igualó o superó a arctic-embed-m-v2 con bge-reranker-v2-m3. No se dispone de más datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Los vectores generados por estos ficheros no deben mezclarse con los de los modelos originales ni con los del otro fichero de decodificador, por diferencias de redondeo y orden de suma.
- La cuantización int8 desplaza las puntuaciones del reranker en torno a +0,19, aunque conserva el orden; hay que recalibrar umbrales si se usan puntuaciones absolutas.
- La cuantización a 4 bits se descartó por pérdida de calidad (coseno 0,85-0,92) y no está incluida.
- Las diferencias en imágenes provienen también de redimensionar con OpenCV en lugar de torchvision.
- No se declara una lista oficial de idiomas soportados; las pruebas se limitan a inglés y alemán.
- No hay datos publicados de sesgos, tasa de alucinación ni comportamiento en dominios distintos de la recuperación científica.
- El modelo es de extracción de características y reranking, no generativo; no debe usarse para generar texto ni para tareas de razonamiento de múltiples pasos.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribución al equipo Qwen de Alibaba y a Hugging Face transformers por el código de exportación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una exportación reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/headtrick/Qwen3-VL-2B-Retrieval-ONNX
- Modelo base de embedding: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Modelo base de reranking: https://huggingface.co/Qwen/Qwen3-VL-Reranker-2B
- ONNX Runtime: https://onnxruntime.ai
- Proyecto paperus: https://github.com/qcode-uni-a/paperus
- Implementación de referencia en numpy: https://github.com/qcode-uni-a/paperus/blob/main/ml/src/paperus_ml/qwen3_vl.py
- Documentación de búsqueda de paperus: docs/search.md (en el repositorio de paperus)
