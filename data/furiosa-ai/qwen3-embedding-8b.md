# furiosa-ai/Qwen3-Embedding-8B

## Resumen

Qwen3-Embedding-8B es un modelo de embeddings de texto de 7.567 millones de parámetros construido sobre la arquitectura densa de Qwen3. Lo desarrolla el equipo de Qwen (Alibaba) y esta ficha concreta la publica furiosa-ai como distribucion optimizada para su acelerador FuriosaAI RNGD. El modelo transforma texto en vectores densos para busqueda semantica, recuperacion de informacion (retrieval) y comparacion de similitud, con cobertura multilingue amplia segun la model card del autor original.

La version de furiosa-ai no es un fine-tune nuevo: empaqueta los pesos originales de Qwen/Qwen3-Embedding-8B junto con un Furiosa Executable Bundle (FXB) precompilado para ejecutarse en hardware RNGD mediante la libreria Furiosa-LLM. Esto permite servir el modelo con un endpoint compatible con la API de OpenAI (`/v1/embeddings`) sin necesidad de recompilar ni convertir pesos manualmente.

Es relevante ahora porque la mayoria de despliegues de embeddings de alto rendimiento se han concentrado en GPUs NVIDIA; esta publicacion demuestra la portabilidad del modelo a aceleradores alternativos (NPU de FuriosaAI) manteniendo la precision nativa BF16 y la licencia Apache 2.0, lo que facilita su adopcion en infraestructuras no-CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 7.567.295.488 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | ninguna; se ejecuta en BF16 nativo |
| Idiomas soportados | ingles (segun metadatos del repo); la model card indica cobertura multilingue amplia del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |
| Dimension de embeddings | configurable via parametro `dimensions` (MRL) |
| Tamano del repositorio | 31.2 GB |
| Hardware soportado (esta build) | FuriosaAI RNGD (8 PEs por tarjeta) |
| Estrategia de paralelismo | tensor-parallel de 8 PEs = 1 tarjeta RNGD |

## Arquitectura y entrenamiento

El modelo emplea el backbone denso de Qwen3 como encoder de texto. La innovacion principal es el soporte de Matryoshka Representation Learning (MRL), que permite solicitar embeddings de dimensionalidad reducida (parametro `dimensions`) sin reentrenar el modelo, manteniendo la utilidad semantica para busquedas aproximadas o almacenamiento comprimido. La salida es un vector denso por entrada de texto.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card de furiosa-ai es una guia de despliegue, no una descripcion del entrenamiento; para esos datos habria que consultar la model card upstream de Qwen/Qwen3-Embedding-8B, que no se ha incluido en el material disponible. La build de furiosa-ai compila el modelo a un bundle ejecutable (FXB) para el acelerador RNGD, sin modificar pesos ni precision.

## Capacidades

- Generacion de embeddings de texto densos para similitud semantica y busqueda.
- Recuperacion de informacion (retrieval) y reranking basado en similitud vectorial.
- Embeddings de dimensionalidad configurable mediante MRL (parametro `dimensions`).
- Cobertura multilingue segun la model card del modelo base (los metadatos del repo solo declaran `en`).
- Servicio via API compatible con OpenAI (`/v1/embeddings`), lo que facilita integracion con clientes existentes.
- Uso offline mediante API Python de Furiosa-LLM (`LLM(...).embed(...)`).
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica en produccion: indexar un corpus documental con embeddings de 8B parametros y consultar por similitud coseno; la precision de un encoder grande reduce falsos positivos frente a modelos de 300-500M.
- RAG (retrieval-augmented generation): generar embeddings de chunks para alimentar un pipeline de generacion aumentada, aprovechando la dimensionalidad configurable para ajustar coste de almacenamiento y latencia de busqueda.
- Deduplicacion y clustering de documentos: agrupar textos semanticamente equivalentes en grandes volumenes (soporte tecnico, tickets, articulos) usando distancias vectoriales.
- Reranking de resultados: reordenar candidatos recuperados por un retriever ligero usando la similitud del encoder de 8B como segunda fase.
- Clasificacion zero-shot por prototipos: comparar embeddings de entradas contra embeddings de etiquetas descriptivas para categorizacion sin entrenamiento supervisado.
- Despliegue en infraestructura no-CUDA: servir el endpoint de embeddings en aceleradores FuriosaAI RNGD cuando el entorno de produccion no dispone de GPUs NVIDIA, manteniendo la API de OpenAI para minimizar cambios en el codigo cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 ocupa aproximadamente 15,1 GB de pesos (7.567M parametros x 2 bytes); el repositorio completo pesa 31,2 GB por incluir el FXB y artefactos adicionales.
- GPU recomendadas (si se usa la ruta upstream con Sentence Transformers, vLLM o Transformers): no especificadas en la informacion proporcionada; por tamano, encaja en GPU con 24 GB o mas en BF16.
- Hardware objetivo de esta build: una tarjeta FuriosaAI RNGD (8 PEs), que ejecuta el modelo con tensor-parallel de 8.
- Cabe en GPU consumer: no confirmado en la informacion proporcionada; por tamano de pesos (15,1 GB en BF16) seria viable en GPUs consumer de 24 GB, pero no hay validacion publicada en este material.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`) sobre RNGD; alternativamente Sentence Transformers, vLLM y Transformers sobre otras plataformas, segun la model card upstream.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware destacado | Disponibilidad |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-Embedding-8B | 7.567M | no disponible | Apache 2.0 | FuriosaAI RNGD (FXB) | Hugging Face |
| Qwen/Qwen3-Embedding-8B (upstream) | 7.567M | no disponible | Apache 2.0 | GPU (Transformers, vLLM, Sentence Transformers) | Hugging Face |
| Modelos de embeddings de ~8B de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada en el material es con el modelo upstream, del que esta build es una redistribucion con bundle precompilado para RNGD; pesos y licencia son identicos. No se dispone de datos de benchmarks ni de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo genera embeddings; no produce texto, no razona y no soporta tool calling ni agentes.
- Los metadatos del repositorio declaran unicamente ingles (`en`); la cobertura multilingue proviene de la model card del modelo base y no esta verificada en esta build.
- No se han publicado resultados de benchmarks para esta build, por lo que su calidad de recuperacion no esta validada de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo upstream y de las dependencias de Furiosa-LLM.
- El FXB esta compilado especificamente para FuriosaAI RNGD; en otras plataformas hay que usar la ruta upstream (Sentence Transformers, vLLM, Transformers).
- Riesgo de sesgo y alucinacion inherente a los modelos de embeddings: los vectores pueden reflejar sesgos del corpus de entrenamiento y producir similitudes espurias en dominios especializados.
- La longitud de contexto no esta documentada en el material disponible; conviene consultar la model card upstream antes de indexar documentos largos.
- El modelo ocupa ~15,1 GB en BF16; el despliegue requiere hardware con memoria suficiente y, en RNGD, una tarjeta completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-Embedding-8B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (API compatible con OpenAI): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
