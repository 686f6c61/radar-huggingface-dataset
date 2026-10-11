# AutomatosX/AX-EmbeddingGemma-2-MLX-AXQ-MXFP4

## Resumen

AX-EmbeddingGemma-2-MLX-AXQ-MXFP4 es un checkpoint de embeddings cuantizado en formato MLX, publicado por AutomatosX y derivado directamente del modelo BF16 google/embeddinggemma-2. Se trata de una conversion de precision mixta mediante el cuantizador propietario AXQuant 2.1.0, orientada a ejecucion en Apple Silicon (chips de la serie M), con un total de 744,37 millones de parametros logicos y un presupuesto de almacenamiento declarado de clase MXFP4.

El modelo no genera texto: es un modelo de extraccion de caracteristicas (feature-extraction) que devuelve embeddings de 768 dimensiones compartidos entre texto, imagen, video y audio, con soporte de anchuras Matryoshka de 768, 512, 256 y 128. El checkpoint ocupa 1,17 GB en safetensors MLX (1,21 GB de descarga completa) y esta etiquetado como paquete de desarrollo, no como release certificado. La licencia es Apache 2.0 y el pipeline declarado es sentence-similarity / feature-extraction.

Su relevancia actual reside en que permite desplegar un modelo de embeddings multimodal (texto, vision y audio) en hardware de consumo de Apple con un presupuesto de almacenamiento reducido frente al BF16 original, preservando el tower de vision y el de audio en BF16 mientras se cuantiza la ruta de lenguaje. No obstante, el autor advierte explicitamente de que no se publican evidencias de calidad, contexto largo, velocidad de kernel ni de aceptacion MTP, por lo que se trata de un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EmbeddingGemma2Model (dense); ruta de texto optimizada, vision y audio preservados |
| Parametros totales | 744.371.512 (744,37 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens configurados; limite practico dependiente de la memoria unificada |
| Tipos de cuantizacion | 4bit (117,44 M, 15,78%), 8bit (153,09 M, 20,57%), bf16 (473,84 M, 63,66%); metodos affine, bf16 y mxfp4; group sizes 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |
| Dimension de embedding | 768 (compartida entre texto, imagen, video y audio); anchuras Matryoshka 768/512/256/128 |
| BPW medido (modelo principal y total) | 12,6059 |
| BPW planificado ajustado a almacenamiento | 12,7220 |
| Tamano safetensors | 1,17 GB |
| Descarga completa aproximada | 1,21 GB |
| Cuantizador | AXQuant 2.1.0 |
| Version de MLX registrada | 0.32.3 |
| Version de AX Engine registrada | 7.6.3 |
| MTP presente | False |
| Vision presente | True |
| Audio presente | True |

## Arquitectura y entrenamiento

El modelo base es un EmbeddingGemma2Model de tipo dense, orientado a la extraccion de embeddings en lugar de a la generacion de texto. La operacion realizada por AutomatosX no es un entrenamiento nuevo, sino una conversion de precision: el checkpoint se deriva directamente de la revision `914f7f89142e33e77833254d9c9b90c3cef7303b` de google/embeddinggemma-2 en BF16. La ruta de texto se cuantiza con el cuantizador AXQuant 2.1.0, mientras que los tensores del tower de vision y del tower de audio se conservan en BF16 dentro de los shards principales.

La asignacion de precisiones sigue una politica de precision mixta por tensor: el 63,66% de los parametros permanece en bf16, un 20,57% se lleva a 8 bits y un 15,78% a 4 bits, lo que da como resultado un BPW medido de 12,6059 sobre el modelo principal. No se aplico calibracion: la asignacion se basa en priors de arquitectura (`architecture_prior`), y el ejecutor del cuantizador registro 218 de 218 conversiones de modulo con exito y cero fallbacks. No se incluye sidecar MTP ni sidecar de vision. El autor indica que la evidencia publicada corresponde unicamente a registros de conversion e integridad del artefacto, y que no existen mediciones de calidad frente a BF16, de comportamiento en contexto largo, de velocidad de kernel ni de aceptacion MTP. No se documentan datos de entrenamiento (numero de tokens, composicion, RLHF/DPO) en la informacion disponible.

## Capacidades

- Extraccion de embeddings de texto: devuelve vectores de 768 dimensiones pensados para similitud semantica y recuperacion.
- Embeddings multimodales: texto, imagen, video y audio comparten un unico espacio de embedding de 768 dimensiones.
- Dimension reducible: soporta anchuras Matryoshka de 768, 512, 256 y 128 (requiere renormalizar tras el truncado).
- Prefijos de tarea: el modelo utiliza los prefijos definidos en `config_sentence_transformers.json`, lo que permite adaptar el embedding a tareas de recuperacion o similitud.
- Vision: el tower de vision esta presente y preservado en BF16, aunque su calidad no ha sido evaluada ni reclamada.
- Audio: el tower de audio esta presente y preservado en BF16, aunque su calidad no ha sido evaluada ni reclamada.
- Tool calling / function calling: no aplica (modelo de embeddings, no generativo).
- Razonamiento multi-paso y agentes: no aplica (no genera texto).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Recuperacion semantica local en Mac: construir indices vectoriales sobre corpus de texto o documentos directamente en un equipo Apple Silicon, aprovechando el formato MLX y el tamano de 1,17 GB para mantener todo el proceso en local sin depender de servicios externos.
- Busqueda multimodal en colecciones de fotos o video: dado que texto, imagen y video comparten un espacio de embedding de 768 dimensiones, se puede indexar un archivo de imagenes o clips y consultarlo mediante descripciones textuales en una unica base vectorial.
- Agrupacion y deduplicacion de documentos: usar la similitud de coseno sobre embeddings de 768 dimensiones para clusterizar articulos, tickets o registros duplicados en pipelines de limpieza de datos; las anchuras Matryoshka de 256 o 128 permiten reducir el coste de almacenamiento del indice cuando la precision adicional no es critica.
- Sistemas RAG en local sobre documentacion tecnica: integrar el modelo como embedder en un pipeline de recuperacion aumentada, con contexto configurado de hasta 262.144 tokens para trocear documentos largos sin perder coherencia, siempre que la memoria unificada del equipo lo permita.
- Clasificacion de audio mediante descripcion textual: al preservar el tower de audio en BF16, se puede usar el modelo para tareas de zero-shot con etiquetas textuales, asumiendo que el autor no ha reclamado ni evaluado calidad en esta modalidad.
- Prototipado e investigacion de cuantizacion: sirve como artefacto de referencia para estudiar el efecto de la precision mixta (4/8/bf16) sobre la calidad de embeddings en macOS, comparando frente al BF16 original de google/embeddinggemma-2.
- Moderacion y filtrado de contenido basado en similitud: comparar embeddings de entradas de usuario contra un conjunto de vectores de referencia para detectar contenido cercano a patrones definidos, desplegado localmente para evitar enviar datos sensibles a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se publica evidencia de calidad frente a BF16 o baselines uniformes, ni resultados MTEB, ni mediciones de contexto largo, ni de velocidad de kernel. El unico dato numerico de rendimiento reportado es el BPW medido (12,6059) y el registro de conversiones (218/218 con exito).

## Requisitos de hardware

- Entorno objetivo: Apple Silicon (chips de la serie M) con MLX 0.32.3; el autor registra este artefacto como ejecutable en el runtime de embeddings de MLX.
- Memoria unificada estimada: al menos 1,21 GB de disco para la descarga y del orden de 1,2-2 GB de memoria unificada para cargar el modelo con activaciones en BF16 o FP32 (el autor pide expresamente no convertir el modelo a float16).
- GPU compatibles: no se documenta soporte para CUDA. El artefacto esta orientado a Apple Silicon; no incluye pesos PyTorch ni GGUF, por lo que no esta pensado para A100, H100 o RTX 4090 sin reconversion.
- Encaje en GPU de consumo: no aplica en el sentido tradicional; esta disenado para ejecutarse en el hardware unificado de Mac, donde cabria en practicamente cualquier chip M moderno por su tamano de 1,17 GB.
- Opciones de despliegue: runtime de embeddings de MLX; el autor indica cargarlo con una build de mlx-vlm que exponga `embedding_gemma2`, mediante `mlx_vlm.embedding_loader.load_embedding_model`. No se ha establecido ejecucion nativa en AX Engine (no se incluye `model-manifest.json` validado). Alternativa declarada: el sibling MXFP8.
- Latencia y throughput: no disponibles (no se han medido velocidad de kernel ni de MTP; el campo `AX Engine kernel evidence` figura como `unmeasured`).

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AX-EmbeddingGemma-2-MLX-AXQ-MXFP4 | MLX Safetensors | 744,37 M | 262.144 tokens | Precision mixta 4/8/bf16, BPW 12,6059 | apache-2.0 | Publicado por AutomatosX (0 descargas, 0 likes) |
| AX-EmbeddingGemma-2-MLX-AXQ-MXFP8 (sibling) | MLX Safetensors | 744,37 M (base) | no disponible | Misma politica de roles AXQ en formato de bloque MXFP8; vision y audio en BF16 | apache-2.0 | Sibling declarado por el mismo autor |
| google/embeddinggemma-2 (modelo base BF16) | Safetensors (upstream) | 744,37 M | no disponible en esta ficha | BF16 | no disponible en esta ficha | Repositorio de Google en HuggingFace |

No se dispone de resultados de rendimiento comparativos ni de otros modelos de embeddings de la misma categoria con datos verificables en la informacion proporcionada, por lo que la comparativa se limita a los artefactos derivados del mismo modelo base.

## Limitaciones y advertencias

- Paquete de desarrollo: la model card indica explicitamente que no es un release certificado de AXQuant y que no debe interpretarse la etiqueta de producto AXQ como una afirmacion de benchmark.
- Sin evidencia de calidad: no se publica retencion de calidad frente a BF16 ni frente a baselines uniformes; tampoco resultados MTEB.
- Sin evaluacion de vision ni de audio: aunque los towers de vision y audio estan presentes y se preservan en BF16, su calidad no ha sido evaluada ni reclamada.
- Sin evidencia de AX Engine: no se incluye `model-manifest.json` validado, por lo que la ejecucion nativa en AX Engine no esta establecida; los campos de AX Engine describen un contrato de compatibilidad previsto, no evidencia observada.
- Sin calibracion: la asignacion de precisiones se basa en priors de arquitectura, no en datos de calibracion, lo que puede afectar a la optimalidad de la politica de cuantizacion.
- Incompatibilidad de vectores: el propio autor advierte de que hay que reconstruir los indices de recuperacion con este checkpoint, ya que los vectores generados con otra precision no son intercambiables.
- Restriccion de casting: no se debe convertir el modelo a float16; hay que mantener activaciones en BF16 o FP32.
- MTP no incluido ni medido: `MTP present` es False y no hay sidecar MTP, por lo que no cabe esperar aceleracion MTP.
- Sesgos conocidos: no disponible (no se documentan evaluaciones de sesgo en la informacion proporcionada).
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings no generativo; el riesgo relevante es la degradacion silenciosa de la similitud por la cuantizacion, que no esta medida.
- Limitaciones de idioma: no disponible en la informacion proporcionada.
- Uso comercial: la licencia apache-2.0 lo permite, pero conviene verificar la licencia y terminos del modelo base google/embeddinggemma-2 antes de un despliegue en produccion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con creacion y ultima actualizacion el 11 de octubre de 2026; el autor recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender de `main`.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/AutomatosX/AX-EmbeddingGemma-2-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Sibling MXFP8: https://huggingface.co/AutomatosX/AX-EmbeddingGemma-2-MLX-AXQ-MXFP8
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
