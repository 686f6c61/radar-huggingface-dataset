# listlessbird/bge-small-en-v1.5-onnx

## Resumen

El modelo `listlessbird/bge-small-en-v1.5-onnx` es un export en formato ONNX con cuantización INT8 del encoder de consultas `BAAI/bge-small-en-v1.5`, realizado por el usuario listlessbird para los experimentos de búsqueda del proyecto Mimeme. Se trata de un artefacto de despliegue, no de un modelo reentrenado: reproduce el comportamiento del modelo original de BAAI con una semántica fijada (longitud máxima de 256 tokens, pooling CLS, salida L2-normalizada de 384 dimensiones) y un contrato de ejecución claro para su uso con ONNX Runtime.

La relevancia de este modelo radica en que ofrece una versión cuantizada y portable de un conocido modelo de embeddings en inglés, pensado para entornos de producción donde se requiere baja latencia y reducción de memoria sin renunciar a la calidad de las representaciones vectoriales. Al estar empaquetado como ONNX, puede integrarse fácilmente en pipelines de búsqueda semántica, bases de datos vectoriales y sistemas de recuperación de información.

El repositorio incluye el archivo `model-int8.onnx`, el tokenizador correspondiente, metadatos de exportación y un script de reproducción que valida la paridad con el modelo PyTorch original mediante fixtures de similitud coseno (valores entre 0.993772 y 0.997500). No es una release oficial de BAAI, sino un export controlado por un proyecto específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en BAAI/bge-small-en-v1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (fijado en el export) |
| Tipos de cuantizacion | INT8 (dinámica por canal en pesos MatMul) |
| Idiomas soportados | inglés (inferido del nombre del modelo base) |
| Licencia | MIT |
| Formato de pesos | ONNX (model-int8.onnx) |

## Arquitectura y entrenamiento

El modelo base `BAAI/bge-small-en-v1.5` es un transformer de tipo BERT de tamaño pequeño, diseñado para generar embeddings de frases de 384 dimensiones mediante pooling CLS y normalización L2. El export aquí presentado no añade entrenamiento adicional; simplemente fija el comportamiento del modelo original con las siguientes decisiones técnicas:

- Longitud máxima de entrada de 256 tokens (recortando secuencias más largas).
- Pooling CLS para obtener la representación de la frase.
- Normalización L2 de la salida, de modo que los vectores resultantes tienen norma unitaria.
- Cuantización INT8 dinámica por canal aplicada a los pesos de las capas MatMul, lo que reduce el tamaño del modelo y acelera la inferencia en CPU.
- ONNX opset 18.

El export se realizó desde la revisión `5c38ec7c405ec4b44b94cc5a9bb96e735b38267a` del repositorio original. El script `export_bge_onnx.py` reproduce el proceso y rechaza el resultado si la similitud coseno con el modelo PyTorch fijado es inferior a 0.99 en los fixtures de prueba.

## Capacidades

- Generación de embeddings de frases para búsqueda semántica y recuperación de pasajes.
- Salida de 384 dimensiones, L2-normalizada, lista para usar con métricas de similitud coseno.
- Soporte de prefijo de consulta obligatorio: las queries deben comenzar con `Represent this sentence for searching relevant passages: `; los documentos no usan prefijo.
- Compatible con ONNX Runtime (librería `onnxruntime`), lo que permite despliegue en CPU y GPU.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio. Es exclusivamente un encoder de embeddings.

## Casos de uso

- Búsqueda semántica en corpus de documentos: el modelo convierte consultas y pasajes en vectores de 384 dimensiones; la similitud coseno entre ellos permite recuperar los pasajes más relevantes. Su tamaño reducido y cuantización INT8 lo hacen adecuado para servicios de búsqueda en tiempo real.
- Sistemas de preguntas y respuestas sobre documentación interna: al indexar manuales, FAQs o wikis con el encoder, se puede implementar un recuperador denso que alimente a un modelo generativo.
- Deduplicación de contenido: comparando embeddings de textos se pueden identificar párrafos o artículos duplicados o casi duplicados en grandes volúmenes de datos.
- Clasificación de texto por similitud: agrupando frases por cercanía vectorial se pueden crear clusters temáticos o detectar tópicos emergentes.
- Recomendación de artículos o noticias: representando ítems y usuarios en el mismo espacio vectorial, se pueden sugerir contenidos relacionados según la similitud coseno.
- Integración en bases de datos vectoriales (por ejemplo, Milvus, Qdrant o FAISS): el modelo produce vectores normalizados que se indexan directamente para búsqueda aproximada de vecinos más cercanos a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo reporta la validación de paridad con el modelo PyTorch original: los seis fixtures de export midieron similitud coseno entre 0.993772 y 0.997500, lo que confirma que la cuantización INT8 introduce una pérdida mínima de calidad. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, ya que se trata de un modelo de embeddings, no de un LLM generativo.

## Requisitos de hardware

- El tamaño del repositorio es de 0.1 GB, lo que indica un modelo muy ligero (el archivo ONNX cuantizado ocupa aproximadamente unos pocos megabytes).
- Puede ejecutarse en CPU sin problemas; ONNX Runtime está optimizado para inferencia en CPU con cuantización INT8.
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente, aunque no es necesario para este tamaño.
- Es compatible con cualquier entorno que soporte ONNX Runtime (Python, C++, C#, Java, etc.).
- No se requieren GPUs especializadas como A100 o H100; una CPU moderna o una GPU de gama media (por ejemplo, RTX 3060) es más que suficiente.
- La latencia estimada es de milisegundos por frase en CPU, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Contexto | Dimensiones | Licencia |
|---|---|---|---|---|---|
| listlessbird/bge-small-en-v1.5-onnx | ONNX | INT8 | 256 | 384 | MIT |
| BAAI/bge-small-en-v1.5 (original) | PyTorch | FP32 | 512 (original) | 384 | MIT |
| onnx-community/bge-small-en-v1.5-ONNX | ONNX | no especificado | no disponible | 384 | MIT |

El modelo original de BAAI tiene una longitud de contexto de 512 tokens, mientras que este export la reduce a 256. La versión de onnx-community es otro export ONNX, pero no se dispone de detalles sobre su configuración. La principal ventaja de la versión de listlessbird es su cuantización INT8, que reduce el tamaño y acelera la inferencia, a costa de una pequeña pérdida de precisión (validada con similitud coseno >0.99).

## Limitaciones y advertencias

- El modelo está pensado únicamente para inglés; no se ha evaluado su rendimiento en otros idiomas.
- La longitud máxima de entrada está fijada en 256 tokens; textos más largos se truncarán, lo que puede perder información relevante.
- Es obligatorio usar el prefijo de consulta `Represent this sentence for searching relevant passages: ` en las queries; no hacerlo degrada significativamente la calidad de los embeddings.
- La cuantización INT8 puede introducir una ligera degradación en la precisión, aunque la validación de paridad muestra una similitud coseno superior a 0.99 con el modelo original.
- No es una release oficial de BAAI; es un artefacto de un proyecto específico (Mimeme) y puede no estar mantenido ni actualizado.
- Según el repositorio de abis330, la distribución de similitud del modelo BGE v1.5 está en el intervalo [0.6, 1] debido al entrenamiento con temperatura 0.01; por tanto, un valor de similitud superior a 0.5 no implica necesariamente que dos frases sean semánticamente similares. Esto debe tenerse en cuenta al interpretar los resultados.
- La licencia MIT permite uso comercial, pero al ser un export de un modelo con licencia MIT, no hay restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/listlessbird/bge-small-en-v1.5-onnx
- Modelo base original: https://huggingface.co/BAAI/bge-small-en-v1.5
- Export ONNX de la comunidad: https://huggingface.co/onnx-community/bge-small-en-v1.5-ONNX
- Repositorio GitHub con notas sobre el modelo: https://github.com/abis330/bge-small-en-v1.5/
- Export ONNX de unsloth: https://huggingface.co/unsloth/bge-small-en-v1.5/blob/main/onnx/model.onnx
