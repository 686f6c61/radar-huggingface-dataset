# jjaroztegi/jina-v2-code-query-4l

## Resumen

jina-v2-code-query-4l es un modelo de embeddings ligero creado por el usuario jjaroztegi mediante destilación a partir de jina-embeddings-v2-base-code de Jina AI. Su propósito es muy concreto: generar embeddings para consultas de búsqueda de código a un coste computacional mucho menor que el modelo original, manteniendo compatibilidad con los embeddings de documentos generados por el modelo base. Se distribuye como ONNX cuantizado a int8, con un tamaño de apenas 85 MB.

El modelo conserva los token embeddings del original y solo 4 de sus 12 capas (0, 4, 8 y 11), entrenadas para reproducir las salidas del modelo base en el subespacio de variación relevante para la herramienta provgrep. En evaluaciones, obtiene resultados prácticamente equivalentes al modelo base en tareas de reordenación de resultados de búsqueda (139 aciertos en primera posición frente a 134) mientras reduce el coste de CPU por consulta a un tercio (18,6 ms frente a 59 ms en un servidor de 8 núcleos con un hilo).

Es relevante como ejemplo de destilación asimétrica especializada: no busca ser un modelo de propósito general, sino optimizar la mitad "barata" de un sistema de búsqueda asimétrico (consultas con un modelo pequeño, documentos con el modelo completo). Está diseñado específicamente para provgrep, una herramienta de búsqueda semántica en código, y no debe usarse para embeber documentos de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer destilado de jina-embeddings-v2-base-code (BERT-like, 4 de 12 capas) |
| Parámetros totales | no disponible (tamaño del modelo: 85 MB en int8 ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncamiento del tokenizador) |
| Tipos de cuantización | int8 dinámica (onnxruntime) |
| Idiomas soportados | no disponible (entrenado con textos tipo consulta en inglés, extraídos de repositorios de GitHub) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), cuantizado a int8 |

## Arquitectura y entrenamiento

El modelo es una destilación por capas de jina-embeddings-v2-base-code, un modelo de embeddings de código basado en la arquitectura de jina-embeddings-v2 (BERT con ALiBi para contexto extendido). Conserva intactos los token embeddings del modelo base y selecciona 4 de sus 12 capas (0, 4, 8 y 11), que se ajustan finamente para que su salida coincida con la del modelo completo. La inferencia se realiza con entradas `input_ids` y `attention_mask`, y la salida `last_hidden_state` debe agruparse por media sobre la máscara de atención y normalizarse, igual que en el modelo base.

El entrenamiento usó 5.111.554 textos con forma de consulta extraídos de los 10.915 repositorios de GitHub del corpus de provgrep: primeras frases de comentarios y docstrings de funciones, nombres de funciones divididos en palabras, frases con identificadores y las funciones que llaman, y primeras palabras de frases tal y como las escribiría un usuario. Los objetivos son los embeddings del modelo base (fp16, revisión 516f4baf13de). La función de pérdida es uno menos el coseno entre ambos embeddings tras proyectarlos sobre las 256 direcciones en las que más varían los embeddings de código de provgrep (una PCA de 32,5 millones de vectores); la cercanía fuera de ese subespacio no se entrenó. Se entrenó una época sobre los 5.082.756 textos de hasta 64 tokens, con lotes de 256, AdamW a 1e-4 con planificación one-cycle, en bf16, durante unos 24 minutos en una RTX A4000. Posteriormente se exportó a ONNX (opset 17) y se cuantizó dinámicamente a int8 con onnxruntime.

## Capacidades

- Generación de embeddings para consultas de búsqueda de código, compatibles con los embeddings de documentos producidos por jina-embeddings-v2-base-code (búsqueda asimétrica).
- Reordenación semántica de resultados de búsqueda de código por similitud coseno, integrada en la herramienta provgrep.
- Inferencia muy eficiente en CPU: 18,6 ms por consulta en un hilo y 6,6 ms en cuatro hilos (servidor de 8 núcleos).
- Formato ONNX cuantizado a int8 (85 MB), adecuado para despliegues ligeros y locales.
- No es adecuado para embeber documentos de código: para eso debe usarse el modelo base.

## Casos de uso

- Reordenación de resultados en buscadores de código semántico: provgrep lo usa para embeber la consulta del usuario y reordenar por coseno los documentos ya indexados con el modelo base, reduciendo el coste de CPU por consulta a un tercio.
- Búsqueda de código en entornos locales o de recursos limitados: su tamaño de 85 MB en int8 y su baja latencia en CPU lo hacen viable en portátiles o servidores modestos sin GPU.
- Autocompletado o búsqueda semántica en IDEs: la latencia de 6,6 ms con cuatro hilos permite consultas interactivas casi instantáneas.
- Indexadores de repositorios con consultas frecuentes: al ser la consulta la operación repetida en cada búsqueda, destilar solo esa mitad del sistema optimiza el coste total sin reindexar los documentos.
- Pipelines de RAG sobre código: puede servir como codificador de consultas en sistemas de generación aumentada por recuperación sobre bases de código, emparejado con el modelo base como codificador de documentos.
- Evaluación y benchmarking de destilación asimétrica: su model card documenta con detalle el proceso (pérdida proyectada por PCA, corpus, hiperparámetros), útil como referencia para destilar otros modelos de embeddings.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Métrica | jina-v2-code-query-4l | Modelo base (int8) |
|---|---|---|
| Coseno con el modelo base en el espacio proyectado (20.000 textos reservados) | 0,970 | 1,000 (referencia) |
| Aciertos en primera posición (163 intenciones de búsqueda, provgrep) | 139 | 134 |
| Aciertos en el top 10 | 263 | 259 |
| Latencia por consulta, 1 hilo (servidor de 8 núcleos) | 18,6 ms | 59 ms |
| Latencia por consulta, 4 hilos | 6,6 ms | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.); al ser un modelo de embeddings, no aplican.

## Requisitos de hardware

- VRAM/RAM: el modelo ocupa 85 MB en int8 ONNX; se ejecuta cómodamente en CPU sin GPU dedicada.
- GPU: no necesaria para inferencia. Para reproducir el entrenamiento se usó una NVIDIA RTX A4000 (~24 minutos de entrenamiento).
- Consumer GPU: no requiere GPU en absoluto; el objetivo de diseño es la inferencia en CPU.
- Despliegue: onnxruntime (formato nativo ONNX, opset 17). No se menciona soporte directo para vLLM, llama.cpp, Ollama o TGI.
- Latencia medida: 18,6 ms por consulta en un hilo y 6,6 ms en cuatro hilos en un servidor de 8 núcleos.

## Comparativa con modelos similares

| Modelo | Parámetros/tamaño | Contexto | Rol | Latencia (1 hilo, CPU) | Licencia |
|---|---|---|---|---|---|
| jina-v2-code-query-4l | 85 MB (int8 ONNX) | 512 tokens | Embeddings de consultas | 18,6 ms | Apache-2.0 |
| jinaai/jina-embeddings-v2-base-code | ~161 M parámetros | 8192 tokens | Embeddings de código y documentos | 59 ms (int8) | Apache-2.0 |
| Alternativas (jina-embeddings-v2-base-es, all-MiniLM-L6-v2, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con su propio modelo base: jina-v2-code-query-4l sacrifica la capacidad de embeber documentos y el contexto completo a cambio de una latencia 3 veces menor, manteniendo la calidad de reordenación (incluso ligeramente superior en las suites evaluadas).

## Limitaciones y advertencias

- Es un modelo asimétrico: solo debe usarse para embeber consultas. Embeber documentos de código con él degradará la calidad de la búsqueda; para documentos hay que usar jina-embeddings-v2-base-code.
- La destilación solo optimiza la similitud en un subespacio de 256 direcciones (PCA del corpus de provgrep); fuera de ese subespacio los embeddings no están garantizados.
- Los textos de entrenamiento proceden de repositorios de GitHub en inglés; el comportamiento con consultas en otros idiomas no está documentado.
- El contexto se trunca a 512 tokens, frente a los 8192 del modelo base.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Los datos de rendimiento dependen del hardware y de la versión de provgrep evaluada (5904e2f); pueden variar en otros entornos.
- Los pesos derivan de jina-embeddings-v2-base-code de Jina AI; la licencia Apache-2.0 heredada permite uso comercial, pero conviene verificar los términos del modelo base.
- El modelo tiene 0 descargas registradas y es un proyecto individual sin auditoría externa documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjaroztegi/jina-v2-code-query-4l
- Modelo base: https://huggingface.co/jinaai/jina-embeddings-v2-base-code
- Herramienta provgrep: https://github.com/jjaroztegi/provgrep
