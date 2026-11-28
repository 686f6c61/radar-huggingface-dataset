# andrzejmontano/Nemotron-3.5-Embed-1B-mlx-8bit

## Resumen

Nemotron-3.5-Embed-1B-mlx-8bit es una cuantizacion de 8 bits en formato MLX del modelo de embeddings Nemotron-3.5-Embed-1B-BF16 de NVIDIA, publicada por el usuario andrzejmontano. No es un modelo generativo, sino un codificador de embeddings multimodales (texto e imagen) pensado para recuperacion de informacion, busqueda semantica y RAG sobre corpus mixtos. Su proposito es ofrecer una version ejecutable en Apple Silicon mediante MLX, reduciendo el peso en disco de 2,90 GB a 1,77 GB sin perdida practica de calidad.

La arquitectura es un `Mistral3Model` de tipo embedding: una torre de vision estilo Pixtral (ViT) mas un backbone de texto Ministral3 de aproximadamente 1B de parametros, unidos por un proyector gelu, y sin `lm_head`. El modelo produce vectores de 2048 dimensiones, normalizados L2, con pooling por media sobre atencion bidireccional. El contexto declarado alcanza 262144 posiciones mediante YaRN con factor 16 sobre 16384.

Es relevante porque permite desplegar un modelo de embeddings multimodal de NVIDIA en hardware de consumo Apple, manteniendo el espacio de embeddings del modelo original (la torre de texto se congelo durante la destilacion desde Nemotron-3-Embed-1B). La validacion reportada frente al checkpoint BF16 muestra una similitud coseno por vector de 0,99984 como peor caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3Model de embeddings (ViT Pixtral + backbone Ministral3 + proyector gelu, sin lm_head) |
| Parametros totales | 1.554.710.528 (1,55B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262144 posiciones (YaRN f=16 sobre 16384) |
| Tipos de cuantizacion | 8 bits afina, grupo 64 en capas lineales; BF16 en embed_tokens, RMSNorms y patch_conv de vision |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (MLX) |
| Dimension de embedding | 2048 |
| Modalidad | texto, imagen, imagen+texto |
| Tamano en disco | 1,77 GB (desde 2,90 GB en BF16) |
| Libreria | mlx |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo es un codificador de embeddings construido sobre `Mistral3Model`, con tres componentes: una torre de vision ViT de estilo Pixtral, un backbone de texto Ministral3 de aproximadamente 1B de parametros y un proyector gelu que alinea ambas modalidades. La ruta de texto emplea atencion bidireccional (no causal) y pooling por media, seguido de normalizacion L2. No incluye `lm_head`, por lo que no puede usarse como LLM generativo ni cargarse con `mlx_lm`; tampoco es compatible con la variante generativa `mistral3` de `mlx_vlm`.

El backbone de texto de 1B se congelo durante la destilacion desde Nemotron-3-Embed-1B, de modo que su espacio de embeddings solo-texto coincide con el de ese modelo. La cuantizacion aplica 8 bits afina con grupo 64 a las 283 capas lineales (112 de texto, 168 de vision y 3 del proyector), manteniendo en BF16 los embeddings de tokens, las RMSNorm y la convolucion de parches de vision. No se detallan en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset del modelo original.

## Capacidades

- Generacion de embeddings de texto con pooling por media y normalizacion L2, en 2048 dimensiones.
- Embeddings de imagen mediante torre ViT estilo Pixtral.
- Embeddings conjuntos de imagen y texto complementario (companion text).
- Recuperacion y busqueda semantica sobre corpus mixtos de texto e imagen.
- Protocolo asimetrico de prompts: prefijo `query:` para consultas y `passage:` para documentos, colocado en el rol de sistema.
- Procesamiento de imagenes con `PixtralProcessor` (por ejemplo, una imagen de 960x540 se procesa a 560x980 con 700 tokens `[IMG]`).
- No soporta generacion de texto, tool calling ni razonamiento multi-paso, al carecer de cabeza de lenguaje.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Busqueda semantica sobre documentacion tecnica: indexar fragmentos con el prefijo `passage:` y consultar con `query:`, comparando por similitud coseno sobre vectores de 2048 dimensiones.
- RAG multimodal en aplicaciones locales de Apple Silicon: recuperar capturas de pantalla, diagramas o figuras junto con su texto asociado para alimentar un LLM generativo separado.
- Catalogos de productos con imagen y descripcion: generar embeddings conjuntos de imagen y texto para busqueda por lenguaje natural sobre inventarios visuales.
- Sistemas de recomendacion de contenido visual: calcular similitud entre consultas textuales e imagenes almacenadas para sugerir elementos relacionados.
- Deduplicacion y clustering de documentos e imagenes: agrupar elementos por cercania en el espacio de embeddings para organizar archivos o detectar duplicados.
- Moderacion o clasificacion por similitud: comparar contenido nuevo contra un conjunto de referencia etiquetado usando distancias coseno.
- Prototipado en portatiles Mac: ejecutar el modelo en local sin GPU dedicada gracias al formato MLX y al peso reducido de 1,77 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card incluye unicamente validaciones de fidelidad frente al checkpoint BF16:

| Metrica | Resultado |
|---|---|
| Peor similitud coseno por vector (8 bits vs BF16) | 0,99984 |
| Peor similitud coseno del port BF16 vs PyTorch/HF oficial | 0,99989 |
| Deltas de puntuacion de referencia vs BF16 | dentro de 4,9e-3 |
| Ranking de recuperacion en el conjunto de referencia | coincide con BF16 |

Puntuaciones publicadas por NVIDIA reproducidas por el port BF16:

| Par de entrada | Puntuacion (BF16) |
|---|---|
| query vs imagen+texto | 0,5217 |
| query vs texto | 0,4577 |
| query vs imagen | 0,5090 |
| texto de biologia vs texto | 0,1126 |

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 1,8-2,5 GB para los pesos cuantizados mas overhead de activaciones; el repo ocupa 1,9 GB.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX.
- Cabe en GPU de consumo Apple con memoria unificada de 8 GB o superior; no se indica compatibilidad con GPU NVIDIA en esta version.
- Despliegue: requiere un cargador MLX especifico para embeddings; no funciona con `mlx_lm` ni con la variante generativa `mlx_vlm` de mistral3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-mlx-8bit | 1,55B | 262144 | texto, imagen | nvidia-open-model-license | safetensors MLX 8 bits |
| Nemotron-3.5-Embed-1B-BF16 (base) | 1,55B | 262144 | texto, imagen | nvidia-open-model-license | safetensors BF16 |
| Nemotron-3-Embed-1B | no disponible | no disponible | texto | no disponible | no disponible |

El checkpoint BF16 es la referencia directa: misma arquitectura y contexto, con mayor precision y tamano en disco de 2,90 GB. Nemotron-3-Embed-1B es el modelo del que se destilo el backbone de texto, por lo que comparte su espacio de embeddings solo-texto. No se dispone de datos de rendimiento comparativo con otros modelos de embeddings en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta garantizado.
- No es un modelo generativo: no produce texto ni admite tool calling o razonamiento multi-paso.
- Requiere un cargador MLX especifico para embeddings; las herramientas estandar de MLX para LLM o VLM generativos no lo cargan.
- El protocolo de prompts es asimetrico y sensible: los prefijos `query:` y `passage:` no llevan espacio final y deben ir en el rol de sistema; un uso incorrecto degrada la recuperacion.
- Los espacios de embeddings no son intercambiables entre modelos, incluso con la misma dimension; conviene etiquetar cada vector con el modelo y la dimension de origen.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; deben revisarse los terminos completos en la model card de NVIDIA.
- Riesgo de alucinacion no aplicable directamente al no generar texto, pero la recuperacion puede devolver resultados poco relevantes si el corpus difiere del dominio de entrenamiento.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento en la informacion disponible.
- El checkpoint tiene 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/andrzejmontano/Nemotron-3.5-Embed-1B-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- MLX: https://github.com/ml-explore/mlx
