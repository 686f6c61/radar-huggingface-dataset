# AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP8

## Resumen

AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP8 es un checkpoint de la familia Qwen3-Embedding-4B de Alibaba/Qwen, requantizado en precision mixta por AutomatosX para su ejecucion nativa en Apple Silicon mediante MLX. Se distribuye como un producto de la clase de presupuesto de almacenamiento MXFP8 de AXQuant, con un coste medido de 8,2505 bits por peso (BPW) y un tamano de safetensors de 4,15 GB. No es un modelo nuevo: es una reempaquetado cuantizado del modelo base Qwen/Qwen3-Embedding-4B (revision 5cf2132abc99cad020ac570b19d031efec650f2b).

La arquitectura de origen es Qwen3ForCausalLM (densa) con la ruta de texto optimizada, y el objetivo es servir de modelo de embeddings y extraccion de caracteristicas (feature-extraction, sentence-similarity) sobre hardware de Apple. El paquete conserva 4.021.774.336 parametros logicos y esta pensado para tareas de recuperacion, similitud semantica y representacion vectorial, no para generacion de texto de proposito general.

Es relevante ahora porque permite ejecutar un modelo de embeddings de ~4B en Macs con memoria unificada, con una huella de descarga de unos 4,16 GB. No obstante, el propio autor lo etiqueta como evidencia de desarrollo: no incluye benchmarks de calidad, ni de contexto largo, ni de velocidad, ni certificacion de AXQuant, por lo que debe tratarse con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3ForCausalLM), ruta de texto optimizada |
| Parametros totales | 4.021.774.336 (~4,02B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens configurados; el limite practico depende de la memoria unificada del dispositivo |
| Tipos de cuantizacion | Mixta AXQuant en contenedor MXFP8; 8 bits en el 100% de los pesos principales (4,02B parametros) y bf16 en 196.096 parametros protegidos; tamano de grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

Datos adicionales: BPW planificado con ajuste de almacenamiento 9,0003; BPW principal medido 8,2505; BPW total medido 8,2505. Cuantizador AXQuant 1.9.0. Tamano total del repo 4,2 GB. Descarga completa aproximada 4,16 GB.

## Arquitectura y entrenamiento

El modelo base Qwen3-Embedding-4B es un transformer denso (familia Qwen3) orientado a la generacion de embeddings, con pipeline declarado de feature-extraction y sentence-similarity. Sobre esa base, AutomatosX aplica una cuantizacion de precision mixta con el cuantizador AXQuant 1.9.0, convertida directamente desde el modelo BF16 original. La ruta de lenguaje se cuantiza siguiendo los "suelos de proteccion" de AXQuant, de modo que embeddings, normalizaciones y otros tensores protegidos permanecen en mayor precision (bf16) mientras el grueso de los pesos se lleva a 8 bits. El contenedor de cuantizacion se corrigio de modo `affine` a `mxfp8` tras inspeccionar las cabeceras de cada modulo cuantizado; los bytes de peso y las asignaciones de precision por modulo no cambiaron.

Segun la model card, la asignacion de precisiones se basa en priors de arquitectura y no en calibracion (no se uso calibracion). No se declaran datos de entrenamiento ni de ajuste (no hay RLHF/DPO especificados en la informacion disponible), ya que se trata de una conversion cuantizada del modelo original. No hay tensores n-gram: el autor confirma que esta familia no incorpora tensores n-gram y que no se anadio fichero ni declaracion de n-gram. Tampoco incluye sidecar de MTP (`MTP present: False`), ni de vision (`Vision present: False`), ni de audio (`Audio present: False`). El alcance declarado del artefacto es la ruta de texto (`text-path`).

## Capacidades

- Generacion de embeddings y extraccion de caracteristicas (feature-extraction) para textos.
- Calculo de similitud semantica entre frases o documentos (sentence-similarity).
- Representacion vectorial de textos para recuperacion de informacion y busqueda semantica.
- Soporte de contexto largo de hasta 40.960 tokens configurados.
- Inferencia en Apple Silicon mediante MLX-LM (ruta de backbone de texto).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el artefacto se declara de ruta de texto para embeddings, no como modelo de agente.
- Capacidades multilingues: no disponible (el dato de idiomas no figura en la ficha).
- Capacidades especiales (vision, audio, thinking mode, decodificacion especulativa/MTP): no incluidas en este paquete.

## Casos de uso

- Busqueda semantica en bases documentales: indexar un corpus de documentos como vectores y recuperar por similitud, aprovechando la ventana de hasta 40.960 tokens para fragmentos largos sin trocear en exceso.
- Generacion aumentada por recuperacion (RAG): generar los embeddings de consultas y de pasajes en pipelines de recuperacion sobre Macs, sirviendo la capa de retrieval de un sistema de preguntas y respuestas.
- Deduplicacion y clustering de textos: agrupar noticias, tickets o articulos por cercania vectorial para detectar duplicados o temas recurrentes sin depender de infraestructura GPU.
- Clasificacion de textos por vecinos mas cercanos: usar los embeddings como entrada de clasificadores ligeros en tareas de etiquetado de tickets, moderacion o enrutado.
- Recomendacion de contenido: representar items y preferencias de usuario en el mismo espacio vectorial para sugerir articulos, productos o documentos relacionados.
- Deteccion de similitud/plagio: comparar pares de documentos con el coseno de sus embeddings para senalar textos muy cercanos.
- Desarrollo local en Mac: prototipado e iteracion de sistemas de embeddings sin necesidad de GPU dedicada, con una descarga de unos 4,16 GB.
- Reranking ligero: combinar los scores de similitud del modelo con un recuperador disperso para reordenar resultados candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que el paquete no publica evidencia medida de calidad, de contexto largo, de velocidad de kernel ni de velocidad de MTP, y que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de rendimiento.

## Requisitos de hardware

- VRAM/memoria: al tratarse de MLX, los pesos residen en memoria unificada de Apple Silicon. Los safetensors ocupan 4,15 GB (descarga completa ~4,16 GB), por lo que se recomienda un minimo de 8 GB de memoria unificada y 16 GB o mas para trabajar comodos con contexto largo.
- GPU recomendadas: chips de Apple Silicon (familias M1, M2, M3, M4 y superiores). No esta pensado para GPU NVIDIA; el formato MLX no es compatible con CUDA de forma nativa.
- Compatibilidad en hardware de consumo: si, cabe en Macs de consumo con memoria unificada suficiente; no es un modelo para GPU de consumo tipo RTX.
- Opciones de despliegue: MLX y MLX-LM (ruta principal declarada). El artefacto registra MLX 0.32.1 y MLX-LM 0.31.3 en el momento de la conversion. No se distribuyen pesos para vLLM, llama.cpp, Ollama ni TGI al no haber formato GGUF ni PyTorch.
- AX Engine: la ejecucion nativa via AX Engine no queda establecida, ya que el paquete no incluye un `model-manifest.json` valido; los campos de AX Engine en `axquant_runtime.json` describen el contrato de compatibilidad previsto, no evidencia observada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP8 | ~4,02B | 40.960 tokens configurados | MLX Safetensors | Apache 2.0 | Publicado en HuggingFace (32 descargas documentadas) |
| Qwen/Qwen3-Embedding-4B (modelo base) | ~4B | no disponible en la informacion proporcionada | safetensors (BF16) | Apache 2.0 | Publico en HuggingFace |
| AX-Qwen3-Embedding-4B-MLX-AXQ-4bit (hermano) | ~4B | no disponible | MLX Safetensors | Apache 2.0 | Publicado; presupuesto AXQ inferior, consultar BPW exacto |
| AX-Qwen3-Embedding-4B-MLX-AXQ-8bit (hermano) | ~4B | no disponible | MLX Safetensors | Apache 2.0 | Publicado; mayor precision media cerca del presupuesto de 8 BPW |

Nota: los datos de parametros, contexto y licencia de los modelos comparados son los declarados en la propia model card del paquete; los campos no confirmados se marcan como no disponibles.

## Limitaciones y advertencias

- Evidencia de desarrollo: el autor declara que no es una release certificada de AXQuant y que no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad de MTP. No debe asumirse ningun nivel de rendimiento por la etiqueta AXQ.
- Sin benchmarks: no hay resultados publicados (MMLU, MTEB, similitud, etc.), por lo que la calidad real de los embeddings no esta validada en la informacion disponible.
- Cuantizacion sin calibracion: la asignacion de precisiones se basa en priors de arquitectura, no en datos de calibracion, lo que puede afectar a la fidelidad de los embeddings frente al modelo BF16 en tareas sensibles.
- Sesgos: no disponibles (no se documentan sesgos conocidos).
- Riesgo de alucinacion: al ser un modelo de embeddings, no genera texto, pero puede producir representaciones erroneas o similitudes enganosas en dominios fuera de su distribucion de entrenamiento.
- Idiomas: no disponible; no se confirma cobertura multilingue en esta ficha.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-Embedding-4B y de las dependencias de MLX.
- Compatibilidad restringida a Apple Silicon: el formato MLX no es portable directamente a NVIDIA ni a entornos CUDA; no incluye pesos GGUF ni PyTorch.
- AX Engine no establecido: no incluye manifiesto nativo validado, por lo que no hay garantia de carga/ejecucion en ese runtime.
- Uso en produccion: al no haber evidencia de contexto largo ni de velocidad, se recomienda validar con datos propios antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Revision del modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B/tree/5cf2132abc99cad020ac570b19d031efec650f2b
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-4bit
- Hermano 8bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- runtime_audit.json: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-4B-MLX-AXQ-MXFP8/blob/main/runtime_audit.json
