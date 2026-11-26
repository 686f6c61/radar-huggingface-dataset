# JonasWeinert/key-arctic-embed-xs-q

## Resumen

`JonasWeinert/key-arctic-embed-xs-q` es una redistribución del modelo de embeddings de texto `Snowflake/snowflake-arctic-embed-xs` de Snowflake Inc., exportado a ONNX y cuantizado. No se trata de un modelo nuevo ni de un ajuste fino: los ficheros provienen sin modificaciones del repositorio original de Snowflake en la revisión `d8c86521100d3556476a063fc2342036d45c106f`, e incluyen el tokenizer y la configuración necesarios para su uso autónomo. El autor lo publica como dependencia del espacio de trabajo de investigación Key, una aplicación que busca dentro de documentos PDF por similitud semántica.

El modelo resuelve el problema de generar representaciones vectoriales densas de fragmentos de texto para tareas de búsqueda semántica, recuperación de información y similitud entre frases. Al estar en formato ONNX cuantizado, está pensado para ejecutarse en el dispositivo del usuario (navegador o cliente ligero) sin depender de una GPU, lo que encaja con el caso de uso de una aplicación de escritorio que descarga los pesos una sola vez y verifica su integridad mediante SHA-256.

La relevancia de esta ficha es acotada: es una variante de distribución de un modelo pequeño preexistente, no una contribución técnica original. Su interés radica en el empaquetado ONNX cuantizado (23 MB) y en las garantías de reproducibilidad (revisión fijada y hashes publicados), más que en capacidades nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), según la model card del modelo base |
| Parametros totales | no disponible (modelo base de la familia "xs"; no se indica cifra exacta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | ONNX cuantizado (`model_quantized.onnx`, exportación propia de Snowflake) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`) |
| Dimension de embedding | 384 |
| Pooling | CLS pooling con normalización |
| Tamano del artefacto principal | 22 972 992 bytes (~23 MB) |
| Libreria | ONNX |
| Pipeline | feature-extraction |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `snowflake-arctic-embed-xs`, un encoder de la familia BERT orientado a la generación de embeddings de frases. La model card de esta redistribución no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo etapas de contraste o ajuste fino; esos datos, si existen, estarían en la model card original de Snowflake y en las referencias arXiv citadas (2405.05374 y 2407.18887).

La innovación técnica de esta publicación no está en el entrenamiento, sino en el empaquetado: exportación ONNX cuantizada, tokenizer y configuración autocontenidos, revisión fijada y verificación por SHA-256 de cada fichero. El modelo produce vectores de 384 dimensiones mediante CLS pooling y normalización, un formato estándar para búsqueda por producto escalar o similitud coseno.

## Capacidades

- Generación de embeddings de texto para similitud semántica entre frases y fragmentos.
- Búsqueda semántica sobre corpus documentales (el caso declarado: búsqueda por significado en un PDF abierto).
- Extracción de características (`feature-extraction`) para pipelines de recuperación.
- Representaciones normalizadas de 384 dimensiones, aptas para indexación vectorial.
- Compatible con Text Embeddings Inference (TEI) y con endpoints compatibles.
- Ejecución en ONNX Runtime, incluyendo entornos de cliente sin GPU.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en aplicaciones de escritorio: el modelo se descarga una vez (~23 MB), se verifica por hash y se ejecuta en local con ONNX Runtime para indexar y consultar documentos del usuario sin enviar texto a un servidor.
- Búsqueda dentro de PDF: fragmentar el documento, generar embeddings por fragmento y recuperar los pasajes más próximos a la consulta mediante similitud coseno; el tamaño reducido permite reindexar en el dispositivo.
- Deduplicación y agrupación de textos: calcular embeddings de registros y agrupar por proximidad para detectar duplicados o temas recurrentes en bases de datos pequeñas.
- Filtrado previo en pipelines RAG: usar este modelo como recuperador ligero en el cliente y reservar un modelo mayor o un reordenador para la fase de reranking en servidor.
- Clasificación por similitud con prototipos: comparar embeddings de entradas contra vectores de referencia de cada clase para un etiquetado rápido sin entrenamiento adicional.
- Enrutado de consultas: decidir a qué índice o colección dirigir una pregunta comparando su embedding con los centroides de cada colección.
- Procesamiento por lotes en CPU: al ser un modelo pequeño cuantizado, permite vectorizar corpus moderados en máquinas sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta redistribución no incluye métricas de recuperación (MTEB, BEIR) ni comparativas; dichos datos habría que consultarlos en la model card y el paper del modelo base de Snowflake.

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el artefacto ONNX cuantizado ocupa ~23 MB y está pensado para ejecución en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime serviría, pero el modelo no requiere GPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime, Text Embeddings Inference (TEI), endpoints compatibles con el formato de Hugging Face; también puede servirse desde el stack estándar de transformers cargando el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Formato | Licencia |
|---|---|---|---|---|---|
| key-arctic-embed-xs-q (esta ficha) | no disponible (familia "xs") | no disponible | 384 | ONNX cuantizado | Apache 2.0 |
| Snowflake/snowflake-arctic-embed-xs (base) | no disponible (familia "xs") | no disponible | 384 | safetensors / ONNX | Apache 2.0 |
| Snowflake/snowflake-arctic-embed-m | no disponible | no disponible | no disponible | safetensors | Apache 2.0 |
| BAAI/bge-small-en-v1.5 | no disponible | no disponible | 384 | safetensors / ONNX | MIT |

La comparación relevante es contra el modelo base, del que esta publicación es una copia empaquetada: mismos pesos, misma dimensión y misma licencia, con la diferencia del formato ONNX cuantizado y la verificación por hash. Frente a alternativas de la misma categoría (embeddings pequeños de ~384 dimensiones), la ventaja es el tamaño del artefacto y la portabilidad; el rendimiento comparado no puede evaluarse sin datos de benchmarks, que no se han proporcionado.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- No hay datos publicados de benchmarks en esta publicación; el rendimiento debe validarse contra el modelo base y el conjunto de evaluación propio.
- La información sobre idiomas soportados no está disponible; no debe asumirse multilingüismo sin verificación.
- La longitud máxima de contexto no se indica en la información proporcionada; conviene consultar la configuración del modelo base antes de fragmentar documentos largos.
- Riesgo de sesgos y alucinaciones heredado del modelo base; en recuperación, los fallos se manifiestan como resultados poco relevantes, no como texto inventado.
- La licencia Apache 2.0 permite uso comercial, pero los derechos del modelo pertenecen a Snowflake Inc.; debe conservarse el aviso de licencia y la atribución.
- El repositorio declara 0 descargas y 0 likes, y un tamaño de repo de 0.0 GB pese a contener ficheros de ~23 MB; conviene verificar la integridad con los SHA-256 publicados antes de usarlo en producción.
- Depende de ONNX Runtime y de la revisión fijada; actualizaciones del modelo base no se reflejarán automáticamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JonasWeinert/key-arctic-embed-xs-q
- Modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-xs
- Revisión fijada del modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-xs/tree/d8c86521100d3556476a063fc2342036d45c106f
- Paper de referencia: arXiv:2405.05374
- Paper de referencia: arXiv:2407.18887
