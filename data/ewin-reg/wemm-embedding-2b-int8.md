# ewin-reg/WeMM-Embedding-2B-INT8

## Resumen

WeMM-Embedding-2B-INT8 es un modelo de embeddings multimodales publicado por el usuario ewin-reg en HuggingFace. Se trata de una reconstruccion en precision INT8 del checkpoint ewin-reg/WeMM-Embedding-2B-Quantized (FP8), que a su vez deriva de un modelo base sin cuantizar en BF16. El modelo tiene 1.845.274.304 parametros (aproximadamente 1,85 mil millones) y ocupa 1,96 GB en disco, con un repositorio de 2,0 GB. La tarea declarada es feature-extraction: genera representaciones vectoriales para busqueda semantica y recuperacion (retrieval) sobre texto, imagenes y video.

Arquitectonicamente combina un transformer de la familia Qwen3.5 (etiqueta `qwen3_5` en los metadatos) con un codificador de vision de 24 bloques tipo ViT y un modulo merger que proyecta las representaciones visuales al espacio de embeddings compartido. Emplea Matryoshka Representation Learning (MRL), lo que permite truncar el vector de salida desde 2048 dimensiones hasta 64 sin reentrenar. La innovacion principal de esta version concreta es la cuantizacion mixta: las 139 matrices de atencion y de proyeccion down se almacenan como int8 asimetrico con un zero point y una escala por cada 64 pesos de entrada, mientras que los tensores de MLP gate/up, el ViT y el merger se mantienen en int4 (uint8, grupo de 16), y las normas y kernels conv1d permanecen en F32.

Su relevancia practica esta en que elimina la dependencia de kernels personalizados: frente al checkpoint FP8, que necesitaba un shim para ejecutarse en Apple Silicon, la ruta INT8 usa `index_select` en lugar de `F.embedding` y funciona con PyTorch estandar en CPU, CUDA y MPS. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto muy reciente y de nicho, pensado para equipos que necesitan embeddings multimodales de 2B en hardware modesto sin perder fidelidad respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 con codificador de vision ViT de 24 bloques y modulo merger; embeddings multimodales |
| Parametros totales | 1.845.274.304 (dato real de safetensors) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: W8A8 int8 asimetrico (zero point + escala por grupo de 64 pesos de entrada) en 139 matrices de atencion y down projection; int4 uint8 con grupo de 16 en MLP gate/up, ViT de 24 bloques y merger; F32 en normas y kernels conv1d |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 segun los metadatos; la model card declara `license: other` con `license_name: apache-2.0` (discrepancia a verificar) |
| Formato de pesos | safetensors (1,96 GB en disco) |

Datos adicionales de la ficha: dimension de embedding 2048 con truncamiento Matryoshka hasta 64; desglose de pesos de 768,7 MB en lineales int8, 508,1 MB en tabla de embeddings int8, 465,6 MB en int4 y unos 40 MB en escalas y zero points; biblioteca declarada `sentence-transformers`; pipeline `feature-extraction`; requiere `custom_code`; metrica declarada: similitud coseno.

## Arquitectura y entrenamiento

El modelo es un transformador multimodal de 1,85B parametros con dos torres de codificacion: una de texto basada en Qwen3.5 y otra de vision compuesta por 24 bloques ViT, ambas unificadas mediante un merger que produce un unico espacio de embeddings. La salida admite truncamiento Matryoshka de 2048 a 64 dimensiones, utilidad habitual para indexacion jerarquica en sistemas de recuperacion. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF o DPO; estos datos figuran como no disponibles.

Lo destacable de esta entrega es el esquema de cuantizacion, no el entrenamiento. Las 139 matrices de atencion y down projection, almacenadas en el checkpoint FP8 con una unica escala escalar por matriz (y una escala por fila en la tabla de vocabulario), se recuantizan aqui como int8 asimetrico con zero point y una escala por cada 64 pesos de entrada. El autor justifica la asimetria citando SLQ (arXiv 2605.02404), que sostiene que las rejillas simetricas inflan la varianza de salida en gamma al cuadrado, con gamma = 2M/R sobre el rango dinamico, y el tamano de bloque de 64 pesos remitiendo a los bloques de 16 elementos de NVFP4 (arXiv 2609.04098). Los tensores int4 de MLP gate/up, ViT y merger se copian byte a byte sin modificacion, igual que las normas y los kernels conv1d en F32, de modo que el error de cuantizacion dominante del modelo permanece intacto. El autor indica que existe una variante mas amplia que tambien convierte esos tensores int4, medida y documentada en la discusion #2 del repositorio, pero no publicada para mantener compatibilidad de comportamiento con la model card FP8.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica, recuperacion de pasajes y similitud coseno.
- Embeddings de imagen y de video a traves del mismo pipeline, gracias al ViT de 24 bloques y al merger multimodal.
- Recuperacion multimodal cruzada (texto a imagen, imagen a texto) en un espacio vectorial compartido.
- Truncamiento Matryoshka de 2048 a 64 dimensiones, lo que permite varios niveles de compresion con un unico modelo.
- Multilingue, con soporte declarado de ingles, chino y otros idiomas (etiqueta `multilingual`).
- Integracion con SentenceTransformers mediante `modeling_st_wemm.WeMMTransformer`.
- Ejecucion con PyTorch estandar en CPU, CUDA y MPS sin shims ni kernels personalizados para las capas int8.
- Interfaz `model.embedding(**inputs)` con `AutoModel` y `AutoTokenizer` bajo `trust_remote_code=True`.
- No se declara soporte de tool calling, function calling, agentes ni modo de razonamiento extendido: es un modelo exclusivamente de representacion, no generativo.

## Casos de uso

- Busqueda semantica sobre corpus multilingues: el modelo vectoriza documentos en ingles y chino en un mismo espacio, de modo que un buscador puede recuperar pasajes relevantes con similitud coseno sin traduccion intermedia.
- Recuperacion aumentada (RAG) sobre documentacion tecnica: los embeddings alimentan un indice vectorial y se combinan con un LLM generativo aparte; el truncamiento a 64 dimensiones reduce el coste de almacenamiento cuando la precision no es critica.
- Busqueda visual en catalogos de producto: el ViT integrado permite indexar imagenes y recuperarlas a partir de descripciones textuales, util en comercio electronico y en gestion de activos digitales.
- Moderacion y deduplicacion de contenido multimedia: la similitud entre embeddings de imagen y video permite detectar near-duplicates en grandes volumenes sin comparar pixeles.
- Clasificacion y clustering con `feature-extraction`: al ser un modelo de representacion, sus vectores sirven como entrada a clasificadores lineales para enrutado de tickets, analisis de sentimiento o agrupacion de temas.
- Recuperacion de momentos concretos en video: al aceptar video como entrada, puede indexar fragmentos y responder a consultas textuales del tipo "el momento en que se explica X".
- Despliegue en entornos sin GPU: al funcionar en CPU con PyTorch estandar, permite ejecutar un modelo multimodal de 2B en portatiles o servidores sin acelerador, integrado en pipelines de preprocesado por lotes.
- Filtrado previo en sistemas de recomendacion: los embeddings se usan para candidatos rapidos antes de un reranker mas costoso, aprovechando el tamano reducido del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta mediciones de fidelidad de cuantizacion sobre 24 consultas de texto, con protocolo identico en los tres modelos:

| Pareja comparada | Similitud coseno media | Minimo | Maximo |
|---|---:|---:|---:|
| FP8 vs INT8 | 0,999798 | 0,999723 | 0,999848 |
| Base BF16 vs FP8 | 0,993103 | 0,987118 | 0,995475 |
| Base BF16 vs INT8 | 0,992999 | 0,987443 | 0,995423 |

El error de reconstruccion en espacio de pesos de los nuevos tensores int8 frente a la ruta FP8 es de 0,00586 para las 138 lineales y 0,00600 para la tabla de embeddings. La diferencia de fidelidad entre INT8 y FP8 respecto al base sin cuantizar es de aproximadamente 0,0001. No hay datos de MMLU, HumanEval, GSM8K, MTEB, ni de tareas de recuperacion estandar como BEIR o MMEB, que serian los benchmarks pertinentes para un modelo de embeddings.

## Requisitos de hardware

- VRAM estimada para pesos: alrededor de 1,8-2 GB, resultado de sumar 768,7 MB de lineales int8, 508,1 MB de embeddings int8, 465,6 MB de tensores int4 y unos 40 MB de escalas y zero points.
- VRAM total en inferencia: no disponible como medicion publicada; la suma de pesos indica que el modelo cabe comodamente en cualquier GPU con 6 GB o mas, quedando el consumo adicional a cargo de activaciones y, en entradas de imagen o video, del coste del ViT.
- GPU recomendadas: dado el tamano, no requiere aceleradores de datacenter; es suficiente una RTX 3060 de 12 GB, una RTX 4060 de 8 GB, una RTX 4090 o cualquier GPU con 6-8 GB de VRAM. A100 y H100 solo tendrian sentido por agregacion de muchas instancias en un servicio de embeddings a gran escala, no por requisito de memoria.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna con 6 GB o mas, e incluso en iGPU con memoria compartida si el sistema lo permite.
- CPU: el autor afirma explicitamente que el modelo se ejecuta bajo PyTorch estandar en CPU, sin shim de kernels, lo que habilita despliegue sin GPU.
- Apple Silicon: soportado mediante MPS, sin el shim personalizado que necesitaba la version FP8.
- Opciones de despliegue: PyTorch con `AutoModel.from_pretrained(..., trust_remote_code=True)`, pipeline de SentenceTransformers, y `model.embedding(**inputs)`. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por lote, tokens por segundo ni rendimiento por imagen.

## Comparativa con modelos similares

No se han proporcionado modelos comparables externos en la informacion disponible. La comparacion posible es dentro de la propia familia de checkpoints, cuyos datos si constan:

| Modelo | Parametros | Contexto | Precision de pesos | Similitud coseno vs base BF16 | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| WeMM-Embedding-2B-INT8 | 1,85B | no disponible | int8 mixto + int4 + F32 | 0,992999 | apache-2.0 (model card: `other` con nombre apache-2.0) | publico en HuggingFace |
| WeMM-Embedding-2B-Quantized (FP8) | 1,85B (misma asignacion) | no disponible | FP8 + int4 + F32 | 0,993103 | no disponible | publico en HuggingFace |
| Base BF16 sin cuantizar | 1,85B | no disponible | BF16 | referencia (1,0) | no disponible | referenciado en la model card |

Frente al checkpoint FP8, la version INT8 ofrece una fidelidad practicamente identica (diferencia de 0,0001) a cambio de un incremento de aproximadamente el 2 por ciento en bytes de escalas y zero points, y de ganar portabilidad al eliminar la dependencia de un kernel shim en Apple Silicon. No hay datos publicados que permitan comparar con alternativas de otros autores para embeddings multimodales de tamano similar.

## Limitaciones y advertencias

- El error de cuantizacion dominante del modelo no se corrige en esta version: los tensores int4 de MLP gate/up, ViT y merger se copian byte a byte desde el checkpoint FP8, segun reconoce el propio autor.
- Requiere `trust_remote_code=True` y carga codigo personalizado (`modeling_st_wemm.WeMMTransformer`); esto implica ejecutar codigo de un tercero en el propio entorno y debe auditarse antes de usarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes, y los metadatos indican creacion el 22 de septiembre de 2026; se trata de un artefacto sin adopcion ni validacion externa documentada.
- Discrepancia de licencia: los metadatos de HuggingFace indican apache-2.0 y la model card declara `license: other` con `license_name: apache-2.0`. Antes de un uso comercial conviene confirmar la licencia aplicable, sobre todo porque el modelo deriva de otro checkpoint cuyos terminos no se detallan.
- No hay resultados de benchmarks en tareas de recuperacion (BEIR, MMEB u otros) ni en tareas de comprension; la unica medicion publicada es la fidelidad de cuantizacion sobre 24 consultas de texto, una muestra muy reducida y limitada al dominio de texto.
- La longitud de contexto no se especifica, lo que impide planificar la indexacion de documentos largos o secuencias de video extensas.
- No es un modelo generativo: no produce texto ni respuestas, solo vectores. No admite tool calling, function calling ni razonamiento en varios pasos.
- Riesgo de sesgo y de alucinacion: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo ni la cobertura linguistica real mas alla de las etiquetas `en`, `zh` y `multilingual`.
- Los articulos citados en la model card (arXiv 2605.02404 y arXiv 2609.04098) no se han podido verificar en la informacion disponible.
- El rendimiento con entradas de video no esta cuantificado; el coste del ViT de 24 bloques y del muestreo de fotogramas puede dominar el tiempo de inferencia aunque los pesos quepan en GPU de gama media.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ewin-reg/WeMM-Embedding-2B-INT8
- Modelo base (FP8): https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Quantized
- Discusion #2 del modelo base (variante que convierte tambien los tensores int4): https://huggingface.co/ewin-reg/WeMM-Embedding-2B-Quantized/discussions/2

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo, su paper ni su repositorio de codigo. Los unicos enlaces verificables son los anteriores.
