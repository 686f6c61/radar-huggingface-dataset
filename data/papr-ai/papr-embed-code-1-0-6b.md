# papr-ai/papr-embed-code-1-0.6b

## Resumen

papr-embed-code-1-0.6b es un modelo de embeddings de texto desarrollado por papr-ai, afinado específicamente para recuperación de código (code retrieval). Se construye a partir de Qwen/Qwen3-Embedding-0.6B mediante entrenamiento adicional sobre datos de recuperación de código, y produce un único vector denso de 1024 dimensiones a partir de texto de entrada. No acepta esquemas estructurados como entrada; para embeddings condicionados por esquema el autor remite a otro modelo de su catálogo (`papr-embed-schema-1`).

El modelo mantiene la arquitectura del Qwen3-Embedding-0.6B original (transformer denso de aproximadamente 596 millones de parámetros) y una longitud máxima de secuencia de 8192 tokens. Usa pooling de último token (last-token) seguido de normalización L2, y emplea instrucciones en las consultas con el formato `Instruct: {instrucción}\nQuery:{consulta}`, mientras que los documentos se embeben sin instrucción.

Su relevancia reside en que ofrece un modelo pequeño (0.6B), con licencia Apache 2.0 y exportación ONNX lista para FastEmbed y Qdrant, especializado en tareas de recuperación de código (lenguaje natural a código, código a código y SQL). El autor advierte explícitamente de que no es una mejora generalista: en recuperación de texto no relacionado con código rinde igual o peor que el modelo base, con una caída clara en TREC-COVID.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-Embedding-0.6B) |
| Parámetros totales | 595.776.512 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Dimensión de embedding | 1024 |
| Pooling / normalización | last-token, L2 |
| Tipos de cuantización | fp32 (referencia), ONNX int8 (pesos int8, activaciones fp32, `MatMulNBits` con block size 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), ONNX (`model.onnx` + `model.onnx_data`, `model_quantized.onnx`) |
| Precisión de referencia | fp32 |
| Tamaño del repositorio | 5.9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso heredado de Qwen/Qwen3-Embedding-0.6B, con 595.776.512 parámetros y una ventana máxima de 8192 tokens. La salida se obtiene tomando el último token no perteneciente al padding y aplicando normalización L2, lo que produce un vector de 1024 dimensiones por entrada. Las consultas requieren un prefijo de instrucción en el formato `Instruct: {instrucción}\nQuery:{consulta}`; los documentos se embeben en crudo. Las instrucciones exactas empleadas en cada tarea de evaluación están publicadas en `task_prompts.json` del repositorio.

El entrenamiento parte del modelo base de Qwen y aplica un ajuste adicional sobre datos de recuperación de código. La model card no detalla el volumen de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El autor documenta además un export a ONNX con paridad verificada frente a la referencia en fp32 sobre 17 textos (8 consultas con instrucción y 9 documentos, incluidos uno vacío, uno no inglés y uno de 3000 tokens); el resultado top-1 de cada consulta coincide con la referencia tanto en ONNX fp32 como en ONNX int8. Los scripts de exportación, cuantización y paridad están incluidos en el repositorio (`onnx/export_onnx.py`, `onnx/quantize_int8.py`, `onnx/parity.py`, `onnx/onnx_mteb.py`).

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para texto y código, con normalización L2.
- Recuperación de código a partir de lenguaje natural (NL a código).
- Recuperación código a código (code-to-code).
- Recuperación sobre SQL.
- Soporte de instrucciones por consulta para adaptar el comportamiento de recuperación a la tarea.
- Procesamiento de secuencias de hasta 8192 tokens, útil para fragmentos de código largos y documentación extensa.
- Ejecución sin PyTorch mediante el build ONNX, compatible con FastEmbed y onnxruntime.
- Integración con Qdrant para búsqueda vectorial (incluido Qdrant Cloud).
- Compatible con text-embeddings-inference y con endpoints alojados (`POST https://memory.papr.ai/v1/embeddings` con `"model": "papr-embed-code-1-0.6b"`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extracción de features, no generativo.

## Casos de uso

- Búsqueda semántica de código en repositorios: indexar funciones y fragmentos con el modelo (documentos en crudo) y consultar en lenguaje natural con el prefijo `Instruct: ...\nQuery:...` para localizar la implementación relevante, aprovechando la ventana de 8192 tokens para fragmentos largos.
- Asistentes de desarrollo con recuperación aumentada: integrar el modelo como recuperador en un pipeline RAG que alimente a un LLM generativo con el código fuente más relevante antes de responder o proponer cambios.
- Deduplicación y detección de código similar: comparar embeddings de fragmentos para identificar funciones duplicadas o casi idénticas entre módulos o repositorios, usando la similitud coseno sobre vectores normalizados.
- Recuperación de consultas SQL: dado un enunciado en lenguaje natural, recuperar la sentencia SQL o el fragmento de esquema relevante de una base de conocimiento, un caso que la model card incluye explícitamente entre sus fortalezas.
- Búsqueda en documentación técnica y ejemplos: indexar ejemplos de código y documentación de API para que un buscador interno devuelva el fragmento correcto ante preguntas de desarrolladores.
- Despliegue ligero en entornos sin GPU o sin PyTorch: usar el build ONNX int8 (1.12 GB) con FastEmbed y onnxruntime en servicios de recuperación de código, con una pérdida de calidad mínima según los datos del autor (CoIR-10 medio de 76.57 frente a 77.19 en fp32).
- Filtrado y clasificación por similitud en pipelines de CI: comparar la similitud entre un cambio propuesto y fragmentos de código existentes para señalizar posibles duplicados o patrones ya implementados.

## Benchmarks y rendimiento

El autor publica resultados sobre CoIR (code retrieval) con mteb 2.10.0, `task_prompts.json` y longitud máxima de 8192 tokens, comparando PyTorch fp32, ONNX fp32 y ONNX int8.

| Métrica | PyTorch fp32 | ONNX fp32 | ONNX int8 |
|---|---|---|---|
| CoIR-10 (media) | 77.19 | 76.85 | 76.57 |
| Media en las otras ocho tareas CoIR | 82.43 | 82.43 | 82.43 |
| Similitud coseno mínima frente a PyTorch | 1 | 1.0000 | 0.9997 |
| Tamaño | 2.38 GB | 2.38 GB | 1.12 GB |

Resultados por tarea (PyTorch fp32 / ONNX fp32 / ONNX int8):

| Tarea | PyTorch fp32 | ONNX fp32 | ONNX int8 |
|---|---|---|---|
| Apps | 79.31 | 79.31 | 79.27 |
| CodeSearchNet | 86.19 | 86.19 | 86.18 |
| CodeFeedback-MT | 94.22 | 94.22 | 94.25 |
| CodeFeedback-ST | 88.52 | 88.54 | 88.56 |
| CodeSearchNet-CC | 92.23 | 92.23 | 92.23 |
| CodeTransOcean-Contest | 90.93 | 90.93 | 90.92 |

El autor explica que la media CoIR-10 del export ONNX fp32 es inferior a la de PyTorch únicamente por dos tareas sensibles a empates, CosQA y SyntheticText2SQL, donde el orden de los lotes decide cuál de varios documentos casi idénticos queda primero; en las otras ocho tareas las tres variantes promedian 82.43. No se han publicado en la información disponible resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) ni comparativas numéricas frente a otros modelos de embeddings de código.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.4 GB en fp32 (pesos de 2.38 GB) y en torno a 1.1-1.5 GB con el build ONNX int8 (1.12 GB), sin contar el overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 en lotes pequeños; el autor midió los resultados ONNX con onnxruntime-gpu 1.23.2 sobre H100 con TF32 desactivado. Para volúmenes altos de indexación son adecuadas A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 3060, RTX 4090), y también puede ejecutarse en CPU con ONNX.
- Opciones de despliegue: sentence-transformers (PyTorch, fp32), ONNX Runtime (con `onnxruntime>=1.23` para el archivo int8), FastEmbed, Qdrant (cliente local o Qdrant Cloud), text-embeddings-inference y el endpoint alojado del autor.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que en la evaluación ONNX los lotes se ordenaron por longitud bajo un presupuesto de tokens en lugar de fijarse en 32, pero no publica cifras de latencia ni de tokens por segundo.
- Nota de despliegue: con FastEmbed es obligatorio usar `PoolingType.LAST_TOKEN` y normalización; el pooling por defecto para modelos personalizados es la media, que produce vectores con aspecto normal pero mala recuperación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Notas |
|---|---|---|---|---|---|
| papr-embed-code-1-0.6b | 595.776.512 | 8192 | 1024 | Apache 2.0 | Afinado para recuperación de código; CoIR-10 medio de 77.19 en fp32 |
| Qwen/Qwen3-Embedding-0.6B | 0.6B | no disponible en la información | no disponible en la información | no disponible en la información | Modelo base; el autor indica que es mejor opción para recuperación de texto general y peor en código |
| papr-embed-schema-1 | no disponible | no disponible | no disponible | no disponible | Modelo del mismo autor con embeddings condicionados por esquema; solo mencionado, sin datos |

No se dispone en la información proporcionada de resultados numéricos del modelo base Qwen3-Embedding-0.6B ni de otros modelos de embeddings de código que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- No es una mejora generalista: en recuperación de texto no relacionado con código rinde igual o peor que Qwen/Qwen3-Embedding-0.6B, con una caída clara en TREC-COVID según el autor. Para cargas de trabajo predominantemente en prosa debe usarse el modelo base.
- El modelo no acepta esquemas como entrada; para embeddings condicionados por esquema hay que usar `papr-embed-schema-1`.
- El uso correcto exige respetar el formato de instrucción en las consultas (`Instruct: {instrucción}\nQuery:{consulta}`) y embeber los documentos en crudo; ignorarlo degrada la recuperación.
- Con FastEmbed, el pooling por defecto (media) devuelve vectores que recuperan mal; es obligatorio configurar `PoolingType.LAST_TOKEN` con normalización.
- El build int8 presenta deriva en un caso concreto: embeber cadenas vacías produce una similitud coseno de 0.948 frente a la referencia. No deben embeberse documentos vacíos con el modelo cuantizado.
- El archivo int8 requiere `onnxruntime>=1.23` por el uso de `MatMulNBits`.
- Los resultados de CoIR-10 del export ONNX fp32 son sensibles a empates en CosQA y SyntheticText2SQL; pequeñas variaciones en el orden de los lotes alteran el ranking de documentos casi idénticos.
- No se detallan sesgos conocidos, cobertura idiomática ni composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos por idioma o dominio.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la recuperación puede devolver fragmentos semánticamente próximos que no resuelvan la consulta; conviene validar el ranking en el dominio propio.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente.
- El modelo tiene un uso muy bajo en Hugging Face (55 descargas y 2 likes en el momento de la consulta), lo que implica poca validación externa y escaso soporte comunitario.
- El repositorio ocupa 5.9 GB, muy por encima de los 2.38 GB de los pesos fp32, por la inclusión de los artefactos ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Endpoint alojado del autor: https://memory.papr.ai/v1/embeddings
- FastEmbed (Qdrant): https://github.com/qdrant/fastembed
- Cliente Qdrant: https://github.com/qdrant/qdrant-client
- Repositorio del modelo con scripts ONNX y resultados: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b/tree/main/onnx y https://huggingface.co/papr-ai/papr-embed-code-1-0.6b/blob/main/results/onnx_coir.json
- Ejemplo completo de FastEmbed + Qdrant: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b/blob/main/examples/fastembed_qdrant.py
- Instrucciones de tarea: https://huggingface.co/papr-ai/papr-embed-code-1-0.6b/blob/main/task_prompts.json
