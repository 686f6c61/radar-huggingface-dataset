# niefeng/eelml-multilingual-e5-small-mlx-fp16

## Resumen

EELML multilingual-e5-small es un paquete de sistema de embedding compilado por el autor `niefeng` a partir del modelo original `intfloat/multilingual-e5-small` de Microsoft, en formato MLX FP16. No es un modelo de generación de chat, sino un componente interno del ecosistema EELML Studio, diseñado para búsqueda de capacidades y recuperación de memoria y conocimiento dentro de la plataforma. El paquete se distribuye como un archivo `.eelml` con un contrato de integración cerrado, incluyendo verificación SHA-256 y registro en SQLite.

El modelo subyacente es un transformer de 12 capas con dimensiones de embedding de 384, inicializado desde `microsoft/Multilingual-MiniLM-L12-H384` y entrenado con contraste débilmente supervisado. Soporta 100 idiomas de XLM-RoBERTa y una longitud máxima de contexto de 512 tokens. Su relevancia actual radica en que ofrece un embedding multilingüe compacto y eficiente para sistemas de búsqueda híbrida y recuperación de conocimiento en entornos MLX, aunque su uso está restringido al ecosistema de EELML Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Multilingual-MiniLM-L12-H384) |
| Parametros totales | no disponible (el paquete FP16 ocupa 252,204,283 bytes, consistente con ~118M parametros del modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP16 (unica version publicada) |
| Idiomas soportados | 100 idiomas (heredados de XLM-RoBERTa) |
| Licencia | MIT |
| Formato de pesos | MLX (empaquetado en archivo `.eelml` con layout `mlx_embedding_fp16_v1`) |

## Arquitectura y entrenamiento

El modelo base es `multilingual-e5-small`, descrito en el articulo "Text Embeddings by Weakly-Supervised Contrastive Pre-training" (arXiv 2022). Esta inicializado desde `microsoft/Multilingual-MiniLM-L12-H384` y entrenado de forma continua sobre una mezcla de datasets multilingües con un objetivo de contraste débilmente supervisado, que genera pares de consultas y pasajes con prefijos `query:` y `passage:` respectivamente. El paquete EELML no altera los pesos del modelo, sino que lo compila y encapsula en un formato de ejecución MLX FP16, con pooling de media por máscara de atención y normalización L2. La instalación se gestiona de forma transaccional en SQLite, con verificación criptográfica y colocación atómica.

No se dispone de detalles adicionales sobre el proceso de entrenamiento especifico del paquete EELML, ya que este no incluye datos de entrenamiento propios. El entrenamiento original se realizo sobre datos multilingües de baja supervisión, incluyendo pares de texto de Wikipedia, comentarios y otros corpus en multiples idiomas.

## Capacidades

- Extraccion de embeddings de texto multilingües de dimension 384, con normalizacion L2 para similitud coseno.
- Soporte de busqueda semantica multilingüe mediante el protocolo `embedding_v1` del sistema EELML.
- Búsqueda híbrida BM25 + vectorial en el entorno de EELML Studio, combinando recuperacion lexica y semantica.
- Manejo de hasta 512 tokens por secuencia, con pooling por media de máscara de atencion.
- Requiere el prefijo `query:` o `passage:` segun el tipo de texto, conforme al contrato de paquete E5.
- No participa en generacion de chat ni en tareas de razonamiento; es exclusivamente un modelo de embedding.
- Capacidad multilingüe amplia, aunque con posible degradacion en idiomas de bajos recursos.

## Casos de uso

- Busqueda de capacidades dentro de EELML Studio: el modelo se usa para indexar y recuperar funciones, herramientas o modulos del sistema, permitiendo al asistente localizar el componente adecuado para una tarea.
- Recuperacion de memoria y conocimiento: se reutiliza el mismo runtime de embedding para buscar en bases de conocimiento previas, integrando memoria persistente del usuario con busqueda vectorial.
- Busqueda hibrida en documentos multilingües: combinando BM25 con embeddings, se puede implementar un sistema de recuperacion robusto para corpus en varios idiomas, util en aplicaciones de RAG.
- Indexacion de documentacion tecnica: el modelo permite codificar manuales, guias o wikis en 100 idiomas y buscar pasajes relevantes con consultas en lenguaje natural.
- Filtrado de contenido por similitud semica: puede usarse para deduplicar o agrupar textos similares en grandes volumenes de datos, aunque no es su proposito principal.
- Integracion en pipelines de MLX en Apple Silicon: al estar en formato MLX FP16, puede ejecutarse de forma eficiente en Macs con chips M1/M2/M3/M4, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este paquete EELML especifico. El modelo original `multilingual-e5-small` ha sido evaluado en tareas de recuperacion y clasificacion multilingüe (ver paper de E5), pero no se incluyen datos cuantitativos en la model card ni en los resultados de busqueda web facilitados.

## Requisitos de hardware

- El formato MLX FP16 requiere un dispositivo con Apple Silicon (M1, M2, M3 o M4) y macOS con Metal habilitado.
- VRAM estimada: el paquete pesa ~252 MB en FP16, por lo que cabra en cualquier Mac con al menos 8 GB de RAM unificada, incluyendo modelos base como el M1 con 8 GB.
- GPUs compatibles: no aplica a GPUs NVIDIA o AMD; solo hardware Apple Silicon.
- Opciones de despliegue: exclusivamente dentro de EELML Studio, que gestiona la instalacion, verificacion y enlazado del modelo. No se proporcionan adaptadores para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; al ser un modelo de embedding de tamano reducido, la inferencia es rapida en Apple Silicon, pero no se dan cifras concretas.
- Se requiere el runtime adapter `mlx_embedding` proporcionado por EELML Studio; no se puede usar con otros runtimes.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Dimension embedding | Contexto maximo | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| `intfloat/multilingual-e5-small` | MiniLM-L12-H384 | ~118M | 384 | 512 | 100 | MIT | PyTorch, ONNX, etc. |
| `niefeng/eelml-multilingual-e5-mlx-fp16` | MiniLM-L12-H384 | no disponible | 384 | 512 | 100 | MIT | MLX (`.eelml`) |
| `intfloat/multilingual-e5-base` | MiniLM-L12-H768 | ~278M | 768 | 512 | 100 | MIT | PyTorch, ONNX |

El paquete EELML es una compilacion del modelo pequeno de la familia E5, con las mismas capacidades de embedding pero limitado al ecosistema EELML Studio. La variante base ofrece mayor dimension de embedding (768) y mas parametros, pero tambien mayor coste computacional. No se dispone de otros modelos comparables en el mismo formato MLX FP16 de la misma fuente.

## Limitaciones y advertencias

- Modelo de sistema exclusivo: no puede usarse para generacion de texto, chat o razonamiento; solo extrae embeddings.
- Longitud maxima de contexto limitada a 512 tokens; textos mas largos deben truncarse o dividirse.
- Dependencia del ecosistema EELML: el paquete solo funciona dentro de EELML Studio; no es portable a otros frameworks.
- Idiomas de bajos recursos pueden presentar degradacion de rendimiento, segun las advertencias del modelo original.
- Requiere el uso de prefijos `query:` y `passage:`; no hacerlo puede degradar la calidad de los embeddings.
- El modelo fue entrenado en 2022 y no se ha actualizado; puede no capturar vocabulario o contextos recientes.
- La licencia MIT permite uso comercial, pero la redistribucion del paquete debe mantener la atribucion del modelo original.
- El paquete no incluye datos de entrenamiento ni benchmarks propios; se hereda el comportamiento del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/niefeng/eelml-multilingual-e5-small-mlx-fp16
- Modelo original upstream: https://huggingface.co/intfloat/multilingual-e5-small
- Paper E5 (arXiv): https://arxiv.org/abs/2212.03533
- Documentacion de Elastic sobre E5: https://www.elastic.co/docs/explore-analyze/machine-learning/nlp/ml-nlp-e5
- Modelo optimizado por Elastic: https://huggingface.co/elastic/multilingual-e5-small
