# AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP8

## Resumen
AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP8 es un checkpoint de embeddings en formato MLX para Apple Silicon, publicado por AutomatosX a partir del modelo base nvidia/Nemotron-3-Embed-1B-BF16 (revision `c0c9fea93ea424587517f2c59e20db9f1d6bf615`). No es un modelo entrenado desde cero: es una conversion cuantizada con la herramienta propietaria AXQuant 1.9.0 sobre la arquitectura densa `Ministral3Model`, con la ruta de texto optimizada y los tensores sensibles (embeddings, normalizaciones y otros tensores protegidos) mantenidos en mayor precision.

El resultado son 1.140.918.272 parametros logicos almacenados con un BPW medido de 8,2507 y un peso safetensors de 1,18 GB. El 99,99% de los parametros principales esta en 8 bits y un 0,01% (67.584 parametros) permanece en bf16. El modelo declara una longitud de contexto configurada de 262.144 tokens, aunque el propio autor advierte que el limite practico depende de la memoria unificada del equipo.

Su relevancia es acotada y conviene entenderla bien: la model card se presenta explicitamente como "evidencia de desarrollo, no un release certificado de AXQuant". No se publican resultados de calidad, de contexto largo, de velocidad de kernel ni de MTP, y no se incluye un `model-manifest.json` validado, por lo que la ejecucion nativa con AX Engine no esta establecida. Es util como artefacto de embedding cuantizado y reproducible en MLX, no como sustituto validado del modelo BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Ministral3Model` (dense), familia de producto `mistral3`; ruta de texto optimizada |
| Parametros totales | 1.140.918.272 (1,14B logicos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; el limite practico depende de la memoria unificada |
| Tipos de cuantizacion | MXFP8 (presupuesto de almacenamiento); precision base AXQuant 16p0bpw; 8bit en el 99,99% de los pesos principales y bf16 en el 0,01% (67.584 parametros); group size 32; metodos declarados `affine` y `bf16`, con el modo de contenedor corregido de `affine` a `mxfp8` en la auditoria de runtime del 2026-10-06 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

Datos adicionales de almacenamiento: BPW medido del modelo principal 8,2507; BPW total medido 8,2507; BPW planificado ajustado por almacenamiento 9,0004; peso safetensors 1,18 GB; descarga completa aproximada 1,19 GB; tamano del repositorio 1,2 GB. No incluye sidecar MTP ni sidecar de vision.

## Arquitectura y entrenamiento
El artefacto parte de un transformer denso de tipo Ministral3 con 1,14B de parametros. AXQuant no modifica la topologia: aplica una asignacion de precision mixta por modulo con "suelos de proteccion" que mantienen embeddings, normalizaciones y otros tensores criticos en mayor precision, mientras que el resto de la ruta de texto se almacena en 8 bits. La asignacion se basa en priors de arquitectura, no en calibracion: la model card indica explicitamente `Calibration: none`.

No hay informacion sobre el entrenamiento del modelo base en la documentacion proporcionada (numero de tokens, composicion del dataset, fases de RLHF/DPO o ajuste para tareas de similitud). Tampoco se documenta ninguna innovacion de decodificacion: el campo MTP aparece como `False` y no se incluye sidecar MTP, por lo que no hay decodificacion especulativa multi-token. La unica intervencion tecnica documentada es la conversion y auditoria de formato: la revision del 2026-10-06 corrigio el modo de contenedor de `affine` a `mxfp8` tras inspeccionar las cabeceras de cada modulo cuantizado, sin cambiar los bytes de peso ni la asignacion de precision. El `runtime_audit.json` recoge los bindings de configuracion, indice y cabeceras, la arquitectura y los hallazgos de formato fisico.

## Capacidades
- Extraccion de caracteristicas y generacion de embeddings: el pipeline declarado es `feature-extraction`, con etiquetas `embedding` y `sentence-similarity`.
- Similitud semantica entre frases y recuperacion de pasajes, uso tipico de un modelo de embeddings de 1B.
- Inferencia de texto estandar mediante MLX-LM sobre el backbone de texto.
- Procesamiento de entradas largas: contexto configurado de hasta 262.144 tokens, sujeto a memoria unificada disponible.
- Ejecucion en Apple Silicon mediante la libreria MLX (MLX `0.32.1` y MLX-LM `0.31.3` registrados en la conversion).
- No soporta vision: `Vision present: False` y sin sidecar de vision.
- No soporta audio: `Audio present: False`.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).

## Casos de uso
- Recuperacion aumentada (RAG) local en Mac: indexar una base documental y generar embeddings de consultas y fragmentos en el propio equipo, sin enviar texto a servicios externos, aprovechando el peso de 1,18 GB y la ejecucion nativa en MLX.
- Busqueda semantica sobre corpus largos: el contexto configurado de 262.144 tokens permite codificar documentos de gran extension en una sola pasada cuando la memoria unificada lo permite, reduciendo la fragmentacion agresiva de pasajes.
- Deduplicacion y clusterizado de documentos: calcular similitudes coseno entre embeddings para agrupar articulos, tickets o registros casi identicos en pipelines de limpieza de datos.
- Clasificacion zero-shot mediante similitud: comparar el embedding de un texto contra descripciones de categoria para enrutar correos, tickets de soporte o incidencias sin entrenar un clasificador especifico.
- Filtrado de candidatos en sistemas de recomendacion de contenido textual: precomputar embeddings de catalogo y resolver vecinos mas cercanos por similitud semantica en lugar de coincidencia de palabras clave.
- Evaluacion de la propia cadena de cuantizacion: servir como punto de comparacion reproducible frente a los packs hermanos de 4 y 8 bits y frente al BF16 original, midiendo el impacto del esquema AXQ en tareas de similitud.
- Prototipado en portatiles Apple Silicon: validar arquitecturas de embedding y umbrales de similitud en un Mac con 8-16 GB de memoria unificada antes de escalar a despliegues con GPU dedicada.
- Preprocesado para pipelines de anonimizacion o enrutado: generar representaciones vectoriales de campos de texto como paso intermedio en flujos que despues aplican reglas o modelos mas pequenos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el paquete no publica evidencia medida de calidad, de contexto largo, de velocidad de kernel ni de velocidad MTP, y que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark. La busqueda web realizada no ha devuelto ningun resultado tecnico relevante sobre este modelo ni sobre su base (solo contenido no relacionado).

| Metrica | Valor |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | No disponible |
| Evaluacion de calidad de embeddings (MTEB u similares) | No disponible |
| Pruebas de contexto largo | No disponible |
| Throughput y latencia de kernel | No disponible |
| Estado de validacion | Evidencia de desarrollo; planificacion basada en `architecture_prior`, sin calibracion |

## Requisitos de hardware
- VRAM / memoria unificada estimada para inferencia: aproximadamente 1,3-1,7 GB por los pesos (1,18 GB de safetensors mas overhead de runtime), a lo que hay que sumar la cache KV, que crece con la longitud de contexto efectiva.
- Cabe en GPU de consumo: si, en el sentido de que cabe en cualquier Mac con Apple Silicon. Se recomienda un minimo de 8 GB de memoria unificada; 16 GB o mas si se quiere explotar contexto largo.
- GPUs recomendadas: no aplica a GPU dedicadas de Nvidia o AMD, ya que el formato es MLX Safetensors y no hay pesos GGUF ni PyTorch en el repositorio. El destino es Apple Silicon (familias M1, M2, M3, M4 o posteriores).
- Opciones de despliegue: MLX-LM es la ruta declarada. El autor indica que la compatibilidad de MLX-LM cubre inferencia de texto/backbone estandar y que puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales. No hay soporte declarado para vLLM, TGI, llama.cpp u Ollama, porque no se publican pesos en los formatos que esas herramientas consumen.
- Ejecucion con AX Engine: no establecida. El paquete no incluye un `model-manifest.json` validado; los campos de AX Engine en `axquant_runtime.json` describen el contrato de compatibilidad previsto, no evidencia observada. Se registra AX Engine `7.5.7`, pero el descubrimiento de version no constituye una comprobacion de runtime.
- Latencia y throughput estimados: no disponible.
- Nota sobre kernels: la disponibilidad de kernels nativos para MXFP8 depende de la version de MLX y de la generacion del chip; el autor no documenta que combinaciones estan validadas.
- Espacio en disco: reservar al menos 1,19 GB libres. Para despliegues reproducibles, fijar el commit del Hub en lugar de depender de `main`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP8 (este) | 1,14B | 262.144 tokens configurados | 8,2507 BPW medido; MLX Safetensors | Apache 2.0 | Publicado en HuggingFace; 17 descargas, 0 likes; ejecucion nativa AX Engine no establecida |
| nvidia/Nemotron-3-Embed-1B-BF16 (base) | 1,14B | No disponible en la informacion proporcionada | BF16 | No disponible en la informacion proporcionada | Referenciado como modelo base (revision `c0c9fea`) |
| AX-Nemotron-3-Embed-1B-MLX-AXQ-4bit (hermano) | 1,14B | No disponible en la informacion proporcionada | Presupuesto AXQ de 4 bits; el BPW exacto debe consultarse en su ficha | Apache 2.0 (heredada de la familia) | Publicado por AutomatosX |
| AX-Nemotron-3-Embed-1B-MLX-AXQ-8bit (hermano) | 1,14B | No disponible en la informacion proporcionada | Precision media mas alta, cerca del presupuesto de 8 BPW; BPW exacto debe consultarse | Apache 2.0 (heredada de la familia) | Publicado por AutomatosX |

No se dispone de datos comparativos de rendimiento frente a otras familias de embeddings (por ejemplo, alternativas tipo BGE, E5 o GTE) en la informacion proporcionada, ni de resultados que permitan situar este checkpoint frente a la version BF16.

## Limitaciones y advertencias
- No es un release certificado: la propia model card lo etiqueta como evidencia de desarrollo y advierte que no se publican mediciones de calidad, contexto largo, velocidad de kernel ni velocidad MTP.
- No hay calibracion: la asignacion de precision se basa en priors de arquitectura (`architecture_prior`), no en datos de calibracion, por lo que el impacto real de la cuantizacion sobre la calidad de los embeddings no esta cuantificado.
- Riesgo de degradacion silenciosa: al no haber evaluacion publicada de similitud ni de recuperacion, no se puede asumir que los embeddings conserven la calidad del BF16 original. Cualquier uso en produccion deberia validarse con un conjunto propio.
- Sin soporte de vision ni audio: `Vision present: False`, `Audio present: False`, sin sidecars de vision o audio.
- Sin MTP: `MTP present: False`, sin sidecar MTP, por lo que no hay aceleracion por decodificacion especulativa multi-token.
- AX Engine no validado: no se incluye `model-manifest.json`; la ejecucion nativa con AX Engine no esta establecida y no debe asumirse por la presencia de campos de AX Engine en `axquant_runtime.json`.
- Ambiguedad de etiquetado: los nombres de los packs AXQ describen un presupuesto de almacenamiento, no una precision uniforme por tensor. Las protecciones pueden elevar un pack nominal de 4 bits cerca o por encima de un presupuesto de 6 bits, por lo que el BPW medido es el dato autoritativo.
- Idiomas no documentados: no se informa de la cobertura linguistica, de si el modelo base fue entrenado predominantemente en ingles ni de si hay degradacion en castellano u otras lenguas.
- Limitaciones de contexto: los 262.144 tokens son el maximo configurado; el limite practico depende de la memoria unificada y el autor no publica pruebas de rendimiento en contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base `nvidia/Nemotron-3-Embed-1B-BF16`, que no se detallan en la informacion proporcionada.
- Portabilidad limitada: al ser MLX Safetensors sin pesos GGUF ni PyTorch, el artefacto no se puede desplegar en infraestructura con GPU Nvidia o AMD sin una conversion adicional.
- Trazabilidad: el propio autor recomienda fijar el commit del Hub en lugar de depender de `main`, ya que la evidencia historica queda ligada a su revision original.
- Advertencia sobre la busqueda web: los resultados obtenidos en la busqueda no contienen material tecnico sobre el modelo; no se ha podido contrastar informacion externa.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Revision del modelo base usada en la conversion: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16/tree/c0c9fea93ea424587517f2c59e20db9f1d6bf615
- Hermano de 4 bits: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-4bit
- Hermano de 8 bits: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Auditoria de runtime (referenciada en la model card): https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP8/blob/main/runtime_audit.json
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
