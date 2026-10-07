# AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP8

## Resumen

AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP8 es un checkpoint de embeddings cuantizado en precision mixta mediante AXQuant (AXQ) por AutomatosX, derivado directamente del modelo BF16 Qwen/Qwen3-Embedding-8B (revision `1d8ad4ca9b3dd8059ad90a75d4983776a23d44af`). Esta pensado para ejecucion local en Apple Silicon a traves de MLX-LM, con un tamano de pesos de 7,80 GB y una descarga completa aproximada de 7,82 GB.

El modelo conserva 7.567.295.488 parametros logicos y una arquitectura densa de la familia Qwen3 (ruta de texto optimizada), con una longitud de contexto configurada de 40.960 tokens. Su presupuesto de almacenamiento declarado es de clase MXFP8, con un BPW medido del modelo principal de 8,2504 y precision base de 16p0bpw segun el cuantizador AXQuant 1.9.0.

Es relevante ahora como ejemplo de cuantizacion mixta orientada a embeddings sobre hardware de Apple: mantiene capas protegidas (embeddings, normas y otros tensores) en mayor precision mientras comprime el resto. Conviene subrayar que el propio autor lo etiqueta como evidencia de desarrollo y no como release certificado: no se publican resultados medidos de calidad, contexto largo ni velocidad de kernel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3ForCausalLM), ruta de texto optimizada |
| Parametros totales | 7.567.295.488 (7,57B logicos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens configurados; el limite practico depende de la memoria unificada |
| Tipos de cuantizacion | Cuantizacion mixta AXQuant; metodos declarados `affine` y `bf16`; grupo de 32; clase de presupuesto MXFP8 (8 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |
| Cuantizador | AXQuant 1.9.0 |
| BPW medido (modelo principal) | 8,2504 |
| BPW planificado (ajustado a almacenamiento) | 9,0003 |
| Reparto de precision | 8 bits: 7,57B parametros (100,00%); bf16: 308.224 parametros (0,00%) |
| Tamano de pesos | 7,80 GB |
| MTP | no incluido |
| Vision | no incluida |
| Audio | no incluido |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-Embedding-8B, un transformer denso de la familia Qwen3. La conversion optimiza exclusivamente la ruta de texto (`text-path`) y mantiene la arquitectura de origen sin modificaciones estructurales; el autor indica que el modelo no incorpora tensores n-gram y que no se anadio ningun archivo ni declaracion de este tipo. El checkpoint resultante se distribuye en formato MLX Safetensors.

La cuantizacion se realizo con AXQuant 1.9.0 bajo un esquema de precision mixta con "suelos de proteccion": embeddings, normas y otros tensores protegidos permanecen en mayor precision (bf16), mientras que el resto se comprime. La asignacion no empleo calibracion, sino que se baso en priors de arquitectura (`architecture_prior`). El autor documenta que la ejecucion del cuantizador registro 253/253 modulos. La conversión se realizo con MLX 0.32.1 y MLX-LM 0.31.3. Nota de auditoria del 2026-10-06: el modo del contenedor de cuantizacion se corrigio de `affine` a `mxfp8` en los dos bloques de configuracion tras inspeccionar las cabeceras de cada modulo cuantizado, sin cambios en los bytes de pesos ni en las asignaciones de precision por modulo.

## Capacidades

- Extraccion de caracteristicas (feature extraction) y generacion de embeddings de texto.
- Calculo de similitud semantica entre frases (sentence-similarity).
- Recuperacion semantica para pipelines de busqueda y RAG.
- Ejecucion de inferencia de texto/backbone mediante MLX-LM (el autor incluye un ejemplo con `mlx_lm.generate`).
- No soporta tool calling/function calling segun la informacion disponible.
- No incluye razonamiento multimodal, vision ni audio (`Vision present: False`, `Audio present: False`).
- No incluye MTP (`MTP present: False`), por lo que no se declara aceleracion MTP.
- El soporte multilingue no se detalla en la informacion disponible.
- No dispone de un `model-manifest.json` nativo validado, por lo que la ejecucion en AX Engine no queda establecida por esta release.

## Casos de uso

- Busqueda semantica sobre corpus documentales: generar embeddings de consultas y de documentos para recuperar pasajes relevantes por similitud coseno, aprovechando la ventana de 40.960 tokens para fragmentos largos.
- Recuperacion aumentada (RAG) en asistentes internos: indexar bases de conocimiento y alimentar a un LLM generativo con los fragmentos mas cercanos; el modelo actua como recuperador, no como generador.
- Deduplicacion de contenido a gran escala: vectorizar grandes volumenes de registros y detectar duplicados o near-duplicates mediante umbrales de similitud, util en limpieza de datasets.
- Clustering y topic modeling: agrupar documentos o tickets por similitud de embeddings para descubrir temas dominantes sin etiquetas previas.
- Clasificacion de texto y enrutado: usar los embeddings como entrada a clasificadores ligeros, por ejemplo para enrutar tickets de soporte a la cola adecuada.
- Cache semantico para LLMs: almacenar embeddings de consultas previas y responder desde cache cuando una nueva consulta supera un umbral de similitud, reduciendo llamadas al modelo generativo.
- Deteccion de preguntas duplicadas en soporte: emparejar consultas entrantes con respuestas ya validadas mediante similitud de frases.
- Recomendacion por similitud de contenido: generar vectores de items y usuarios y ordenar candidatos por cercania en el espacio de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad MTP, y advierte que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon, mediante MLX y MLX-LM. No se publica ruta CUDA, vLLM, TGI, llama.cpp ni Ollama.
- Espacio en disco: al menos 7,82 GB libres; los pesos en safetensors ocupan 7,80 GB.
- Memoria unificada: debe alojar los pesos (~7,8 GB) mas activaciones y cache; el autor no especifica cifras concretas de VRAM ni de memoria unificada recomendada ("no disponible").
- GPU concretas recomendadas (A100, H100, RTX 4090, etc.): no disponible; el formato MLX esta orientado a chips de Apple.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones de velocidad de kernel ni MTP.
- Opciones de despliegue documentadas: `mlx-lm` (inferencia de texto/backbone) y descarga via `huggingface_hub`. La ejecucion en AX Engine no queda establecida por esta release.
- Caveat de despliegue: MLX-LM puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales, por lo que la compatibilidad con MLX-LM no implica aceleracion MTP ni calidad vision-lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP8 (este) | 7,57B | 40.960 tokens | MLX Safetensors (8,2504 BPW medido) | Apache 2.0 | HuggingFace, 65 descargas |
| AX-Qwen3-Embedding-8B-MLX-AXQ-4bit (sibling) | 7,57B (base) | no disponible | MLX Safetensors (BPW no indicado) | Apache 2.0 | HuggingFace |
| AX-Qwen3-Embedding-8B-MLX-AXQ-8bit (sibling) | 7,57B (base) | no disponible | MLX Safetensors (precision media cercana al presupuesto de 8 BPW) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-Embedding-8B (modelo base) | 7,57B | no disponible en esta informacion | BF16 (origen) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Evidencia de desarrollo, no release certificado: no hay evidencia publicada de calidad, contexto largo ni velocidad.
- Sin calibracion: la asignacion de precision se basa en priors de arquitectura, no en datos de calibracion.
- Sin MTP, sin vision y sin audio.
- Sin `model-manifest.json` nativo validado: la ejecucion en AX Engine no esta establecida por esta release.
- MLX-LM puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue.
- Riesgo de sesgos y alucinacion: no evaluado ni documentado en la informacion disponible.
- Limitacion de contexto: aunque se configuran 40.960 tokens, el limite practico depende de la memoria unificada y no se han publicado mediciones de contexto largo.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial; conviene revisar los terminos del modelo base y citar la revision concreta.
- Para produccion: fijar el commit del Hub en lugar de depender de `main`, dado que el autor ha corregido la configuracion de cuantizacion entre revisiones.
- Repositorio con muy baja adopcion (65 descargas, 0 likes) y creado/actualizado en 2026, por lo que la validacion externa es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B/tree/1d8ad4ca9b3dd8059ad90a75d4983776a23d44af
- Sibling 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-4bit
- Sibling 8bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Auditoria de formato de runtime: runtime_audit.json (referenciado en la model card del repositorio)
