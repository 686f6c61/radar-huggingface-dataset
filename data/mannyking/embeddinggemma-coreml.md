# Mannyking/embeddinggemma-coreml

## Resumen

EmbeddingGemma → Core ML es una conversión del checkpoint oficial `google/embeddinggemma-300m` al formato Core ML, publicada por el usuario Mannyking. El modelo original es un modelo de embeddings de texto basado en la arquitectura Gemma, con 300 millones de parámetros, que produce un vector normalizado de 768 dimensiones por cada entrada. Esta conversión empaqueta el modelo en tres variantes (Float32, FP16 mixto e int4/int8) optimizadas para ejecutarse en el framework Core ML de Apple sobre iOS, iPadOS y macOS, lo que permite inferencia en dispositivo sin depender de servicios en la nube.

El problema que resuelve es la falta de opciones ligeras de embeddings ejecutables localmente en el ecosistema Apple, especialmente en iPhone y iPad. Al usar Core ML, el modelo puede aprovechar la Neural Engine y la GPU integrada de los chips de Apple, con paquetes que van desde 216,5 MB (cuantizado) hasta 1.235,3 MB (Float32). La entrada está fijada a 512 tokens con padding a la derecha, y se devuelve un único vector de 768 dimensiones.

Es relevante porque la cuantización a int4 en las capas lineales (manteniendo int8 en las proyecciones de atención) reduce el tamaño a menos de una quinta parte del Float32, con una pérdida de calidad medida en la tarea de recuperación SciFact de BEIR muy contenida (nDCG@10 de 0,7414 frente a 0,7488 del F32). Esto lo hace candidato para búsqueda semántica, RAG y clasificación de texto dentro de aplicaciones nativas de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de embeddings (derivado de google/embeddinggemma-300m) |
| Parametros totales | 300 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (fija, incluye prompt y tokens especiales) |
| Tipos de cuantizacion | Float32 (F32), FP16 mixto (solo `gather` y `linear`), int4 en lineales con int8 en proyecciones Q/K/V/output de atencion |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (tag `license:gemma`) |
| Formato de pesos | Core ML `.mlpackage` (F32, FP16 y int4/int8) |
| Dimension de salida | 768 (vector normalizado) |
| Tamano del repo | 2,1 GB |
| Tarea (pipeline) | feature-extraction |
| Entradas | `input_ids` Int32 [1,512], `attention_mask` Int32 [1,512] |
| Salida | `embedding` Float32 [1,768] |

## Arquitectura y entrenamiento

La ficha no describe el entrenamiento del modelo original `google/embeddinggemma-300m`, ya que este repositorio es una conversión, no un entrenamiento nuevo. Lo que sí se documenta es el proceso de conversión a Core ML: cada paquete usa una entrada fija de 512 tokens y devuelve un embedding de 768 dimensiones. La variante F32 para iOS 18 es la fuente del candidato int4. El paquete FP16 mixto aplica FP16 únicamente a las operaciones `gather` y `linear`, mientras que atención, normalización, pooling y salidas permanecen en Float32. El candidato int4 usa pesos lineales int4 por bloques, salvo las proyecciones de atención Q/K/V/output, que se mantienen en int8.

La validación se realizó contra el checkpoint original fijado al commit `57c266a740f537b4dc058e1b0cda161fd15afa75`. El paquete F32 pasó la evaluación en macOS sobre diez fixtures, incluidos casos de exactamente 511 y 512 tokens, con un error máximo elemento a elemento de `4,34e-7` frente a la línea base. El paquete FP16 mixto alcanzó similitud coseno de `0,999911` a `0,999960`. El paquete int4/int8, intencionalmente con pérdida, obtuvo similitud coseno cercana a `0,901` en los fixtures de 511 y 512 tokens frente al F32.

Los scripts de conversión y la traza de evidencias están en el repositorio de origen en GitHub, enlazado más abajo.

## Capacidades

- Generación de embeddings de texto: produce un vector normalizado de 768 dimensiones por entrada, apto para similitud coseno y búsqueda vectorial.
- Recuperación semántica (retrieval): diseñado para tareas de búsqueda y ranking documento-consulta.
- Extracción de características (`feature-extraction`) como pipeline declarado.
- Ejecución en dispositivo mediante Core ML sobre iOS, iPadOS y macOS, con soporte para Neural Engine y GPU de Apple.
- Prompts específicos recomendados por el equipo de Gemma: para consultas `task: search result | query: ` y para documentos `title: none | text: `.
- Tokenización incluida: activos de tokenizer en el directorio `tokenizer/` con IDs especiales conocidos (`<pad>` = 0, `<eos>` = 1, `<bos>` = 2, `<unk>` = 3) y padding a la derecha.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito; es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en aplicaciones iOS y macOS: indexar documentos como embeddings de 768 dimensiones y recuperar los más similares a una consulta, todo en dispositivo y sin enviar texto a un servidor.
- Generación aumentada por recuperación (RAG) local: usar el paquete int4 (216,5 MB) para recuperar pasajes relevantes de una base de conocimiento y pasarlos a un LLM generativo en la misma app, reduciendo la latencia de red.
- Deduplicación y agrupación de contenido: calcular similitud coseno entre embeddings de títulos o párrafos para agrupar noticias o entradas duplicadas.
- Clasificación de texto ligera: usar los embeddings como características de entrada a un clasificador (por ejemplo, análisis de sentimiento o enrutado de tickets) dentro de una app nativa.
- Moderación o filtrado de contenido: comparar la similitud de un texto con embeddings de referencia de categorías sensibles para marcarlo o bloquearlo.
- Motor de recomendación basado en contenido: representar ítems y preferencias como vectores y recomendar elementos cercanos en el espacio de embeddings.
- Verificación de afirmaciones científicas (SciFact): el propio autor midió recuperación de abstracts relevantes para afirmaciones, con Recall@10 de 0,8878 en F32 y 0,8882 en int4/int8.
- Preprocesado sin conexión en pipelines de datos en macOS: generar embeddings por lotes con el paquete F32 cuando la fidelidad numérica es prioritaria (error máximo de 4,34e-7).

## Benchmarks y rendimiento

El autor publicó una evaluación de recuperación sobre BEIR SciFact, con 252 afirmaciones elegibles y 4.799 abstracts, excluyendo registros por encima del límite fijo de 512 tokens. La tabla siguiente reproduce esos resultados:

| Modelo | Tamano guardado | Recall@1 | Recall@10 | nDCG@10 | MRR@10 |
|---|---:|---:|---:|---:|---:|
| Core ML F32 | 1.235,3 MB | 0,5742 | 0,8878 | 0,7488 | 0,7102 |
| Core ML int4 / attention int8 | 216,5 MB | 0,5671 | 0,8882 | 0,7414 | 0,7037 |

El propio autor advierte que se trata de una comprobación rápida de un único conjunto de datos, incluida para detectar regresiones grandes de calidad por conversión o cuantización, y que no es un benchmark amplio ni una afirmación de calidad de aplicación ni un resultado de rendimiento en dispositivo. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- Plataforma objetivo: dispositivos Apple con Core ML.
- Paquete F32: requiere iOS/iPadOS 18 o macOS 15; tamaño guardado 1.235,3 MB.
- Paquete FP16 mixto: requiere iOS/iPadOS 15 o macOS 12; tamaño guardado 620,4 MB.
- Paquete int4/int8: requiere iOS/iPadOS 18 o macOS 15; tamaño guardado 216,5 MB. Es la opción más ligera y, por tanto, la más adecuada para iPhone y iPad con memoria limitada.
- El int4/int8, con 216,5 MB, es el candidato más plausible para caber cómodamente en la memoria unificada de un dispositivo móvil de gama media-alta.
- Aceleración: Core ML puede asignar cómputo a CPU, GPU y Neural Engine; no se detalla en la información proporcionada qué operaciones se ejecutan en cada unidad.
- No se especifican requisitos de VRAM para GPU de escritorio (A100, H100, RTX 4090) porque el formato Core ML está orientado a hardware Apple, no a CUDA.
- No se proporcionan datos de latencia ni throughput en dispositivo; el autor indica explícitamente que la evaluación no es un resultado de rendimiento en dispositivo.
- Opciones de despliegue: Core ML en apps nativas; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, que son stacks para LLM generativos y no aplican a este formato.

## Comparativa con modelos similares

La información disponible no ofrece comparativas directas frente a otros modelos de embeddings, más allá del propio modelo base del que deriva. La tabla siguiente recoge lo que puede afirmarse con los datos aportados:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mannyking/embeddinggemma-coreml | 300 M (base) | 512 tokens | Core ML | Gemma | Derivado de google/embeddinggemma-300m |
| google/embeddinggemma-300m | 300 M | no disponible en esta ficha | safetensors (presumible) | Gemma | Modelo base del que deriva esta conversión |

No se dispone de datos de rendimiento ni de especificaciones de alternativas como BGE, E5, GTE o all-MiniLM en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La conversión no entrena el modelo; hereda los sesgos y limitaciones del checkpoint `google/embeddinggemma-300m`, que no se detallan en esta ficha.
- La longitud de entrada está fijada a 512 tokens. Los registros que superan ese límite se excluyeron de la evaluación SciFact, lo que implica que el modelo no puede representar documentos largos completos en una sola pasada.
- El paquete int4/int8 es intencionadamente con pérdida: la similitud coseno frente al F32 cae a cerca de 0,901 en los fixtures de 511 y 512 tokens, y el nDCG@10 baja de 0,7488 a 0,7414 en SciFact. No es adecuado si se exige alta fidelidad numérica.
- Uso de prompts recomendado: omitir los prefijos `task: search result | query: ` y `title: none | text: ` puede degradar la calidad de recuperación.
- La licencia es Gemma Terms of Use, no una licencia de código abierto permisiva. Cualquier uso comercial debe revisar y cumplir esas condiciones, incluida la política de uso prohibido de Gemma.
- Los paquetes F32 e int4 requieren iOS/iPadOS 18 o macOS 15; solo el FP16 mixto baja a iOS/iPadOS 15 y macOS 12.
- Los resultados de SciFact son una comprobación de humo de un único conjunto, no una garantía de calidad en producción ni una medición de latencia o consumo en dispositivo.
- El repositorio tiene muy poca tracción (11 descargas, 0 likes), sin evidencia de adopción amplia ni mantenimiento continuado.
- No se dispone de información sobre idiomas soportados, por lo que no puede confirmarse cobertura multilingüe más allá de lo que soporte el modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mannyking/embeddinggemma-coreml
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Checkpoint base fijado: https://huggingface.co/google/embeddinggemma-300m/tree/57c266a740f537b4dc058e1b0cda161fd15afa75
- Repositorio de origen (scripts de conversión y validación): https://github.com/Mannyking/embeddinggemma-coreml
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Directorio del tokenizer: https://huggingface.co/Mannyking/embeddinggemma-coreml/tree/main/tokenizer

Nota: los resultados de búsqueda web proporcionados no contienen información relevante sobre este modelo (versan sobre contenidos financieros de BFM Bourse), por lo que no se han utilizado.
