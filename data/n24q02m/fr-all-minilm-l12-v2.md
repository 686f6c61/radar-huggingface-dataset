# n24q02m/fr-all-MiniLM-L12-v2

## Resumen

`n24q02m/fr-all-MiniLM-L12-v2` es una conversion a ONNX del modelo de embeddings de frases `sentence-transformers/all-MiniLM-L12-v2`, publicada por el usuario n24q02m. El objetivo del repositorio no es entrenar un modelo nuevo, sino ofrecer una version optimizada para inferencia en produccion del conocido MiniLM-L12-v2 en formato ONNX, con dos variantes cuantizadas (INT8 y Q4F16) que reducen el peso del artefacto hasta unos 32-33 MB. El modelo resultante sigue siendo un encoder BERT de 12 capas orientado a `feature-extraction`, es decir, a generar embeddings de frases y parrafos.

La relevancia de esta publicacion es practica: el modelo base es uno de los encoders de frases mas desplegados del ecosistema `sentence-transformers` por su buen equilibrio entre calidad de embedding y coste computacional, y esta build permite ejecutarlo con ONNX Runtime sin dependencia de PyTorch, lo que simplifica el despliegue en entornos con CPU, edge o contenedores ligeros. La conversion se ha realizado con la herramienta `fastretrieval` del mismo autor, que expone una API `TextEmbedding` para consumir el modelo.

No se dispone de informacion sobre el proceso de entrenamiento especifico de esta build (es una conversion, no un reentrenamiento) ni de datos de evaluacion propios del repositorio. La model card se limita a documentar el proceso de conversion, las variantes y el uso basico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder, 12 capas) |
| Parametros totales | no disponible (el modelo base MiniLM-L12-v2 ronda los 33 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (QInt8, cuantizacion dinamica) y Q4F16 (MatMulNBits, block_size 128, simetrica, con cast a float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; hereda la del modelo base (consultar `sentence-transformers/all-MiniLM-L12-v2`) |
| Formato de pesos | ONNX (opset 21); variantes `onnx/model_quantized.onnx` (32 MB) y `onnx/model_q4f16.onnx` (33 MB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT de 12 capas, derivado de `sentence-transformers/all-MiniLM-L12-v2`. La model card especifica que el pooling es MEAN y que se aplica normalizacion sobre el vector resultante, lo que es coherente con el uso tipico de MiniLM en similitud semantica y recuperacion. No se aporta informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si hubo etapas de RLHF/DPO; esos detalles corresponden al modelo base y no se reproducen en esta build.

La innovacion tecnica de este repositorio es la conversion a ONNX opset 21 y la cuantizacion. La variante INT8 se obtiene con `onnxruntime.quantization.quantize_dynamic` en modo QInt8, mientras que la variante Q4F16 usa `MatMulNBitsQuantizer` con block_size 128 y cuantizacion simetrica, seguida de un cast a float16. El resultado son artefactos de 32-33 MB pensados para inferencia ligera con ONNX Runtime, sin necesidad de PyTorch en tiempo de ejecucion.

## Capacidades

- Generacion de embeddings de frases y parrafos para tareas de similitud semantica, con pooling MEAN y normalizacion.
- Extraccion de caracteristicas (`feature-extraction`) en formato ONNX, apta para pipelines de retrieval y busqueda vectorial.
- Ejecucion con ONNX Runtime en CPU y entornos sin PyTorch, gracias a las variantes cuantizadas.
- Dos niveles de cuantizacion (INT8 y Q4F16) para ajustar el equilibrio entre tamano y precision.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio; el modelo es exclusivamente un encoder de texto.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el prefijo "fr" del nombre sugiere un uso orientado a frances, pero no se confirma en la model card).

## Casos de uso

- Busqueda semantica en produccion: el modelo genera embeddings normalizados que se pueden indexar en bases vectoriales (FAISS, Qdrant, pgvector) para recuperacion por similitud; su tamano reducido permite desplegarlo en el mismo servicio que atiende las consultas.
- Deduplicacion de documentos y respuestas: comparar embeddings de pares de textos para detectar duplicados o near-duplicates en pipelines de ingesta de datos, con coste bajo por el tamano del artefacto ONNX.
- Clasificacion de texto por similitud a prototipos: calcular el embedding de cada clase y asignar la clase mas cercana, util para triaje de tickets o etiquetado zero-shot ligero.
- Despliegue en edge o contenedores ligeros: la variante INT8 de 32 MB se puede empaquetar en imagenes Docker pequenas o ejecutar en dispositivos con recursos limitados usando ONNX Runtime.
- RAG en entornos con CPU: usar el modelo como encoder de recuperacion en un pipeline de generacion aumentada, donde la latencia y el consumo de memoria son criticos y no se dispone de GPU.
- Filtrado previo en pipelines de moderacion o recomendacion: generar embeddings de candidatos y descartar rapidamente los menos relevantes antes de pasar a un modelo mas costoso.
- Evaluacion de similitud en investigacion: comparar representaciones entre modelos y variantes de cuantizacion (INT8 frente a Q4F16) para medir el impacto de la cuantizacion en la calidad del embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (Recall@k, nDCG), MTEB ni comparaciones de calidad entre las variantes INT8 y Q4F16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del artefacto (32-33 MB) el modelo cabe holgadamente en cualquier GPU consumer, y en CPU el consumo de memoria es del orden de decenas de MB.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 4090, A100, H100) puede ejecutarlo, aunque el modelo esta pensado para inferencia ligera y no requiere GPU dedicada.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna; tambien en CPU.
- Opciones de despliegue: ONNX Runtime (via `fastretrieval.TextEmbedding` segun la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `n24q02m/fr-all-MiniLM-L12-v2` (esta build) | no disponible | no disponible | ONNX (INT8, Q4F16) | hereda del base; no disponible | Conversion cuantizada para ONNX Runtime |
| `sentence-transformers/all-MiniLM-L12-v2` (base) | no disponible en la informacion | no disponible | safetensors/PyTorch | no disponible en la informacion | Modelo original de sentence-transformers |
| Otras builds ONNX de MiniLM-L12-v2 | no disponible | no disponible | ONNX | variable | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una conversion del modelo base, hereda sus sesgos y limitaciones; no se documentan sesgos especificos en la model card.
- Riesgo de alucinacion no aplica en sentido estricto (es un encoder, no un generador), pero la calidad del embedding puede degradarse en dominios alejados del entrenamiento original.
- La cuantizacion INT8 y Q4F16 puede introducir perdida de precision en la similitud semantica; no se aportan metricas que cuantifiquen esa perdida.
- No se especifican idiomas soportados; el prefijo "fr" del nombre no se acompana de documentacion que confirme un entrenamiento o ajuste especifico para frances.
- La licencia no esta declarada en el repositorio; el autor remite a la licencia del modelo base, por lo que es obligatorio verificar `sentence-transformers/all-MiniLM-L12-v2` antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se documentan garantias de compatibilidad con versiones futuras de ONNX Runtime ni con opsets distintos del 21.
- Uso en produccion: conviene validar la calidad del embedding de la variante cuantizada frente al modelo base en el dominio concreto antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/n24q02m/fr-all-MiniLM-L12-v2
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2
- Herramienta de conversion `fastretrieval`: https://github.com/n24q02m/fastretrieval
