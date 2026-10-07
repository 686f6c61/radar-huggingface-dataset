# AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP4

## Resumen

AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP4 es un checkpoint de embeddings cuantizado en formato MLX para Apple Silicon, publicado por AutomatosX a partir del modelo BF16 `nvidia/Nemotron-3-Embed-1B-BF16`. Se trata de una conversion de precision mixta realizada con el cuantizador propietario AXQuant 1.9.0, etiquetada comercialmente dentro de la clase de presupuesto de almacenamiento MXFP4, no de una reimplementacion del modelo original.

El artefacto conserva la ruta de texto del modelo base, cuya arquitectura declarada es `Ministral3Model` (transformer denso, familia de producto `mistral3`), con 1.140.918.272 parametros logicos y una longitud de contexto configurada de 262.144 tokens. El peso medido es de 5,2508 bits por parametro (BPW), lo que da un fichero de safetensors de 0,75 GB y una descarga completa de aproximadamente 0,77 GB.

Su relevancia es acotada y conviene enmarcarla con precision: es un paquete de evidencia de desarrollo, no una release certificada de AXQuant. El propio autor indica que no publica mediciones de calidad, de contexto largo, de velocidad de kernel ni de MTP, y que no incluye un manifiesto nativo validado para AX Engine. Resulta util, por tanto, como material de evaluacion para desarrolladores que trabajen en el ecosistema MLX y quieran inspeccionar el esquema de cuantizacion, no como sustituto validado del modelo BF16 en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Ministral3Model` (transformer denso, familia `mistral3`); ruta de texto optimizada |
| Parametros totales | 1.140.918.272 (1,14B logicos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; el limite practico depende de la memoria unificada |
| Tipos de cuantizacion | Precision mixta AXQuant: 4bit (872,42M parametros, 76,47%), 8bit (268,44M, 23,53%), bf16 (67.584, 0,01%). Metodos: `affine`, `bf16`, `mxfp4`. Grupos: 32 y 64. BPW medido: 5,2508 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX exclusivamente; no incluye pesos PyTorch ni GGUF |
| Tamano de pesos | 0,75 GB (descarga completa aproximada: 0,77 GB) |
| Cuantizador | AXQuant 1.9.0 |
| Runtime declarado | MLX-LM (artefacto registrado con MLX 0.32.1 y MLX-LM 0.31.3) |
| Pipeline | `feature-extraction` (etiquetas: `embedding`, `sentence-similarity`) |
| Revision de origen | `c0c9fea93ea424587517f2c59e20db9f1d6bf615` |

## Arquitectura y entrenamiento

El modelo base es una arquitectura transformer densa identificada en el artefacto como `Ministral3Model`, dentro de la familia de producto `mistral3`. No se trata de una arquitectura MoE ni hibrida SSM: la ficha tecnica del paquete no declara expertos, ni decodificacion especulativa, ni atencion lineal. El paquete tiene el campo MTP marcado como `False` y no incluye sidecar `mtp.safetensors`, por lo que no hay multiplicacion de tokens multi-paso; tampoco incluye sidecar `vision.safetensors`, y los campos de vision y audio estan marcados como `False`. El ambito de optimizacion declarado es unicamente `text-path`.

Sobre el entrenamiento no hay informacion disponible: el paquete es una conversion de un modelo ya entrenado y no documenta numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si documenta es el proceso de cuantizacion posterior. Segun el autor, la asignacion de precisiones se basa en priors de arquitectura (`architecture_prior`) y no en calibracion con datos; se ejecutaron 113 de 113 conversiones de modulo sin ningun fallback. El esquema AXQuant aplica suelos de proteccion (embeddings, normas y otros tensores protegidos se mantienen en mayor precision), lo que explica que la clase nominal MXFP4 acabe rindiendo 5,2508 BPW reales: un 23,53% de los parametros queda en 8 bits y una fraccion minima en bf16. El autor advierte explicitamente de que la etiqueta AXQ describe una clase de presupuesto de almacenamiento y no una precision uniforme, y que el BPW medido es el dato autoritativo.

## Capacidades

- Extraccion de caracteristicas y generacion de embeddings de texto, segun el pipeline declarado `feature-extraction`.
- Similitud semantica entre frases (`sentence-similarity`), orientada a comparacion y recuperacion de textos.
- Procesamiento de secuencias largas: la configuracion admite hasta 262.144 tokens, con limite practico sujeto a memoria unificada.
- Soporte de tool calling / function calling: no disponible (no declarado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado).
- Modo thinking: no disponible.
- Vision: no (el paquete no incluye sidecar de vision y el campo esta marcado como `False`).
- Audio: no (campo marcado como `False`).
- MTP / decodificacion multi-token: no (campo marcado como `False`, sin sidecar).
- Ejecucion nativa en AX Engine: no establecida; no se incluye manifiesto `model-manifest.json` validado.

## Casos de uso

- Recuperacion aumentada (RAG) sobre corpus internos: el modelo produce embeddings que se indexarian en un almacen vectorial para recuperar fragmentos relevantes antes de pasarlos a un LLM generador. La ventana de 262.144 tokens permite indexar documentos completos sin troceado agresivo, siempre que la memoria del equipo lo permita.
- Busqueda semantica en documentacion tecnica: permite consultas en lenguaje natural sobre manuales, RFCs o repositorios de codigo, sustituyendo la busqueda por palabra clave por similitud vectorial.
- Deduplicacion y near-duplicate detection: agrupando embeddings con un umbral de similitud coseno se detectan registros casi identicos en bases de datos grandes, util en limpieza de datasets.
- Clustering y organizacion tematica: clusterizar los vectores de tickets de soporte, articulos o incidencias permite descubrir agrupaciones tematicas sin etiquetado previo.
- Clasificacion zero-shot por similitud: comparando el embedding de un texto contra embeddings de descripciones de categoria se construye un clasificador sin entrenamiento adicional.
- Reranking ligero en pipelines de busqueda: como segunda etapa tras un recuperador disperso, recalculando similitudes sobre un subconjunto reducido de candidatos.
- Cache semantico de respuestas: almacenar embeddings de consultas previas para detectar peticiones equivalentes y reutilizar respuestas, reduciendo coste de inferencia.
- Deteccion de desvio tematico en produccion: monitorizar la distancia entre embeddings de entradas en vivo y el centroide del trafico historico para alertar de cambios de distribucion.

En todos estos casos, la idoneidad practica esta condicionada a que el entorno sea Apple Silicon con MLX: el paquete no es directamente desplegable en CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card es explicita al respecto: el paquete contiene registros de conversion e integridad de artefacto, pero no publica evidencia medida de calidad, de contexto largo, de velocidad de kernel ni de velocidad MTP, y advierte de que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de rendimiento.

| Aspecto | Estado declarado |
|---|---|
| Evidencia de planificacion | `architecture_prior` |
| Calibracion | Ninguna; asignacion basada en priors de arquitectura |
| Ejecucion del cuantizador | 113/113 conversiones de modulo correctas, 0 fallbacks |
| Manifiesto nativo AX Engine | No incluido |
| Tier de soporte | `convertible` |
| Metricas de calidad publicadas | Ninguna |

## Requisitos de hardware

- Entorno obligatorio: Apple Silicon con MLX. El repositorio solo contiene safetensors MLX; no hay pesos PyTorch ni GGUF, por lo que no es ejecutable directamente en GPUs NVIDIA o AMD sin una conversion previa.
- Memoria para los pesos: los safetensors ocupan 0,75 GB. Como estimacion, la carga del modelo requiere del orden de 1 GB de memoria unificada solo para pesos, cifra que crece con el overhead del runtime y los buffers de activacion.
- Memoria para contexto: con una ventana de 262.144 tokens, la memoria de activaciones durante el forward pass escala con la longitud de secuencia y con la dimension oculta. Para secuencias muy largas, el consumo puede superar con holgura el de los pesos; el autor indica que los limites practicos dependen de la memoria unificada disponible.
- Encaje en hardware de consumo: si, previsiblemente, en cualquier Mac con chip de la serie M con memoria unificada suficiente, dado el tamano reducido de los pesos. Los modelos con 8 GB de memoria unificada seran ajustados para contextos largos.
- GPUs recomendadas: no aplica en su formato actual. Solo seria utilizable en A100, H100, RTX 4090 y similares tras convertir el checkpoint a un formato soportado (PyTorch, GGUF), conversion que este paquete no incluye.
- Opciones de despliegue: MLX-LM es la ruta de runtime declarada. El autor senala que MLX-LM cubre inferencia de texto/backbone estandar y puede ignorar metadatos de runtime AXQuant y sidecars opcionales. AX Engine no esta establecido para esta release al faltar un manifiesto nativo validado. No se documentan opciones vLLM, TGI, llama.cpp ni Ollama para este artefacto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad.

## Comparativa con modelos similares

Los unicos terminos de comparacion documentados en la informacion disponible son los propios hermanos de la familia AXQ y el modelo BF16 de origen. No se dispone de datos verificables de otros modelos de embeddings para contrastar.

| Modelo | Parametros | Contexto | Precision / formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP4 | 1,14B | 262.144 tokens configurados | AXQ mixta, 5,2508 BPW, MLX safetensors | Apache 2.0 | Paquete de evidencia de desarrollo |
| AX-Nemotron-3-Embed-1B-MLX-AXQ-4bit (hermano) | 1,14B (base comun) | no disponible | AXQ 4bit; BPW exacto no disponible | Apache 2.0 | Presupuesto de almacenamiento menor; el autor advierte que los suelos de proteccion pueden elevarlo cerca del presupuesto de 6 bits |
| AX-Nemotron-3-Embed-1B-MLX-AXQ-8bit (hermano) | 1,14B (base comun) | no disponible | AXQ 8bit; BPW exacto no disponible | Apache 2.0 | Precision media mas alta, cerca del presupuesto de 8 BPW |
| nvidia/Nemotron-3-Embed-1B-BF16 (origen) | 1,14B | no disponible | BF16 sin cuantizar | no disponible en la informacion proporcionada | Revision fuente `c0c9fea...`; referencia de calidad frente al paquete cuantizado |

Comparativa con alternativas de terceros (por ejemplo, otras familias de embeddings multilingues del mismo orden de tamano): no disponible.

## Limitaciones y advertencias

- No es una release certificada: el propio autor la describe como evidencia de desarrollo con registros de conversion e integridad, sin evidencia publicada de calidad, contexto largo, velocidad de kernel ni velocidad MTP.
- Ausencia total de benchmarks: no hay MMLU, MTEB ni ninguna otra metrica publicada para este paquete, de modo que la degradacion introducida por la cuantizacion respecto al BF16 de origen es desconocida.
- Cuantizacion sin calibracion: la asignacion de precisiones se basa en priors de arquitectura, no en datos de calibracion. El autor lo declara expresamente.
- Ambiguedad de uso: el pipeline declarado es `feature-extraction` (embeddings), pero el unico ejemplo de ejecucion de la model card invoca `mlx_lm.generate`, una utilidad de generacion de texto. No se proporciona ningun ejemplo de obtencion de embeddings ni de tokenizacion/pooling recomendado.
- Confusion potencial de la etiqueta AXQ: el nombre comercial no garantiza una precision uniforme. En este caso, la clase nominal MXFP4 convive con un 23,53% de parametros en 8 bits y un BPW medido de 5,2508. El BPW medido es el dato fiable.
- Limitacion de plataforma: solo MLX. Sin pesos PyTorch ni GGUF, el artefacto no se puede desplegar en infraestructura CUDA o en runtimes como vLLM, TGI, llama.cpp u Ollama sin conversion adicional.
- AX Engine no operativo: no se incluye manifiesto nativo validado y los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad previsto, no evidencia observada. La mera deteccion de la version 7.5.7 no constituye una comprobacion de runtime.
- Idiomas soportados desconocidos: el campo de idiomas no esta informado, lo que impide garantizar cobertura multilingue.
- Sesgos: no hay informacion disponible sobre sesgos evaluados. Al derivar de un modelo base de terceros, hereda los sesgos de sus datos de entrenamiento, que no se documentan en este paquete.
- Riesgo de alucinacion: aplicable al uso generativo del backbone, pero no evaluado ni medido para esta release.
- Contexto largo no validado: la configuracion admite 262.144 tokens, pero no se publica evidencia de rendimiento en long-context; el comportamiento real en ventanas muy largas es desconocido.
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base de NVIDIA y de los datos subyacentes antes de un despliegue en produccion.
- Reproducibilidad: el autor recomienda fijar un commit concreto del Hub en lugar de depender indefinidamente de `main`. La revision de origen del modelo base tambien esta fijada.
- Trazabilidad de la busqueda web: las consultas realizadas no devolvieron ningun resultado tecnico relevante sobre este modelo ni sobre su modelo base; los unicos resultados obtenidos eran contenido no relacionado sin valor tecnico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Revision concreta del modelo base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16/tree/c0c9fea93ea424587517f2c59e20db9f1d6bf615
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-4bit
- Hermano 8bit: https://huggingface.co/AutomatosX/AX-Nemotron-3-Embed-1B-MLX-AXQ-8bit
- Colecciones del autor: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Auditoria de formato de runtime: `runtime_audit.json` (referenciado en la model card, sin URL directa en la informacion proporcionada)
- Papers, blogs, repositorios o demos adicionales: no disponibles.
