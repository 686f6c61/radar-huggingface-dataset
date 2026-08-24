# dudeman2512/Qwen3.8-2.4T-A95B-int4

## Resumen

Qwen3.8-2.4T-A95B-int4 es una cuantizacion de 4 bits del modelo Qwen3.8-2.4T-A95B, el buque insignia de codigo abierto de Alibaba Qwen, publicado en agosto de 2026. El modelo base es un Transformer de arquitectura MoE (Mixture-of-Experts) con 2,4 billones de parametros totales y aproximadamente 95 mil millones de parametros activos por token, lo que lo sitúa en la categoria de los modelos de mayor escala disponibles en abierto. Esta variante int4 reduce el peso del checkpoint de 4892,4 GB en BF16 a 1268,0 GB en disco, un 25,9% del tamaño original, lo que permite su despliegue en infraestructuras con menos memoria aunque siga requiriendo un cluster de GPUs de gran capacidad.

La cuantizacion ha sido producida por el usuario dudeman2512 mediante la libreria compressed-tensors de Neural Magic, transmitiendo el checkpoint tensor a tensor sin instanciar el modelo completo en memoria. Los pesos se almacenan como enteros de 4 bits con grupos de 128 y escala en BF16, manteniendo las activaciones en precision completa (A16). Las capas consideradas sensibles (normas, embeddings y lm_head) se conservan en BF16. El resultado es la variante mas agresiva de la familia de cuantizaciones publicada para este modelo, con un tamaño en disco de 1268 GB distribuido en 304 shards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida |
| Parametros totales | 2,4 billones (2.4T) |
| Parametros activos | ~95B (512 expertos enrutados con 10 activos + 1 experto compartido) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | int4 (4 bits, grupo de 128, simetrico, A16) |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (licencia propietaria de Qwen, no OSI) |
| Formato de pesos | safetensors con formato pack-quantized (compressed-tensors) |
| Libreria | transformers |
| Shards | 304 |
| Tamano en disco | 1268 GB (25,9% del BF16 original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B es un Transformer MoE con 92 capas y una arquitectura de atencion hibrida, una caracteristica distintiva de la serie Qwen3.8. El enrutamiento de expertos activa 10 de los 512 expertos por token, mas un experto compartido, lo que da unos 95B de parametros activos de los 2,4T totales. Esta escasez permite que el coste de inferencia sea proporcional al numero de parametros activos y no al total, aunque la memoria necesaria para cargar los pesos sigue dependiendo del tamaño completo del checkpoint.

La cuantizacion int4 se realizo con compressed-tensors de Neural Networks, transmitiendo los tensores del checkpoint uno a uno para evitar instanciar el modelo completo en memoria. Los pesos lineales se cuantizan simetricamente en grupos de 128 con escala BF16, mientras que las activaciones se mantienen en BF16 (A16). Nueve capas se excluyen de la cuantizacion y se conservan en BF16: la cabeza de salida (lm_head), las normales, las embeddings y todas las capas de normalizacion. Los detalles de entrenamiento del modelo base (composicion del dataset, numero de tokens, tecnicas de alineamiento como RLHF o DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto de alta calidad con razonamiento complejo, heredada del modelo base Qwen3.8-2.4T-A95B.
- Razonamiento multi-paso y capacidades de agente gracias a la ventana de contexto de 1M tokens, que permite procesar documentos extensos y cadenas de pensamiento largas.
- Soporte de tool calling y function calling (integrado en el modelo base y compatible con vLLM).
- Capacidad de procesar y razonar sobre contextos de hasta un millon de tokens, apta para analisis de repositorios de codigo, libros completos o historiales largos de conversacion.
- Compatibilidad con vLLM para despliegue en produccion mediante la API de servidor estandar.
- La cuantizacion int4 preserva las capacidades del modelo base, aunque con una perdida de precision esperable en tareas sensibles a los pesos; las capas criticas se mantienen en BF16 para mitigar este efecto.

## Casos de uso

- Analisis de repositorios de codigo a gran escala: gracias a la ventana de 1M tokens, el modelo puede ingerir un repositorio completo y responder preguntas sobre arquitectura, dependencias o bugs, sin necesidad de dividir el contenido en fragmentos.
- Agentes autonomos con razonamiento largo: su capacidad de tool calling y razonamiento multi-paso lo hace adecuado para agentes que planifican y ejecutan tareas complejas en entornos de produccion, como automatizacion de procesos de negocio.
- Atencion al cliente con contexto historico extenso: puede mantener conversaciones multi-turno con el historial completo del cliente, evitando perdidas de informacion en ventanas cortas.
- Generacion de codigo en pipelines de CI/CD: integrable en flujos de trabajo de revision de codigo y generacion de tests, aunque requiere infraestructura de gran escala para inferencia.
- Investigacion en sistemas de informacion: util en tareas de retrieval-augmented generation (RAG) sobre corpus masivos, donde el contexto largo reduce la necesidad de fragmentacion de documentos.
- Despliegue como servicio de inferencia en la nube: el formato compatible con vLLM y la cuantizacion int4 permiten montar un servidor de texto generativo sobre un cluster de GPUs dedicado, con un coste de memoria un 74% inferior al BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantizacion int4 se presenta como una variante de despliegue sin datos de evaluacion comparados frente al modelo base BF16 o frente a otras cuantizaciones (FP8, NVFP4). Se recomienda validar el rendimiento en las tareas concretas de uso antes de desplegar en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint int4 ocupa 1268 GB en disco; la VRAM necesaria para cargar los pesos supera esa cifra, por lo que se requieren multiples GPUs con memoria sumada del orden de 1,3 TB o mas.
- GPU recomendadas: no se indican modelos concretos, pero por la escala se requieren clusters de GPUs de gran capacidad (por ejemplo, varias H100 o H200 de 80-141 GB) o instancias de multiples GPU de datacenter.
- No es viable en GPU de consumo: la memoria necesaria supera con creces la VRAM de una RTX 4090 (24 GB) o incluso de estaciones de trabajo con 4x RTX 6000 Ada (192 GB).
- Opciones de despliegue: vLLM (compatible nativamente), tambien puede servirse con transformers y otras librerias que soporten compressed-tensors. No se indica soporte para llama.cpp ni Ollama, y el formato no es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del numero de GPUs, del ancho de banda inter-GPU y del numero de expertos activos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Tamano en disco |
|---|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B (BF16) | 2,4T | ~95B | 1M | qwen3.8-max | BF16 | 4892 GB |
| Qwen3.8-2.4T-A95B-FP8 | 2,4T | ~95B | 1M | qwen3.8-max | FP8 | 2453 GB |
| Qwen3.8-2.4T-A95B-NVFP4 | 2,4T | ~95B | 1M | qwen3.8-max | NVFP4 | 1382 GB |
| Qwen3.8-2.4T-A95B-int4 (este) | 2,4T | ~95B | 1M | qwen3.8-max | int4 | 1268 GB |

La comparativa con otros modelos de la misma categoria (otros MoE de escala similar, como los de la serie Qwen3 o DeepSeek) no esta disponible en la informacion proporcionada. Dentro de la familia de cuantizaciones del mismo modelo, int4 es la variante mas ligera y la que exige menos memoria, a costa de una precision de pesos reducida respecto a FP8 y NVFP4.

## Limitaciones y advertencias

- Perdida de precision esperable: la cuantizacion int4 con grupos de 128 es agresiva y puede degradar el rendimiento en tareas de alta sensibilidad numerica (matematicas, logica formal) respecto al modelo BF16 original.
- Licencia restrictiva: la licencia qwen3.8-max es una licencia propia de Qwen, no una licencia open source estandar. Hay que revisar los terminos del archivo LICENSE para confirmar las condiciones de uso comercial, redistribucion y despliegue.
- Requisitos de infraestructura: con 1268 GB de checkpoint, el despliegue requiere un cluster de GPUs de dataciencia; no es apto para entornos de desarrollo o pruebas locales.
- Idiomas soportados: no se especifican, aunque el modelo base de Qwen suele tener un buen soporte multilingue; se recomienda validar el comportamiento en el idioma concreto de uso.
- Riesgo de alucinacion: como todos los modelos generativos, puede producir contenido falso o inventado, especialmente con contexto largo o preguntas ambiguas.
- Sesgos: no hay informacion sobre evaluacion de sesgos en esta variante; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Capas en BF16: las 9 capas mantenidas en BF16 (embeddings, normaciones, lm_head) aumentan ligeramente el consumo de memoria y de computo, pero son necesarias para la estabilidad numerica.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/dudeman2512/Qwen3.8-2.4T-A95B-int4
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Variante FP8: https://huggingface.co/dudeman2512/Qwen3.8-2.4T-A95B-FP8
- Pagina del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-2.4t-a95b
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Receta de despliegue en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
