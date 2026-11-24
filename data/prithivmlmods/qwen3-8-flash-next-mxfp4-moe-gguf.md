# prithivMLmods/Qwen3.8-Flash-Next-MXFP4-MoE-GGUF

## Resumen

Qwen3.8-Flash-Next-MXFP4-MoE-GGUF es una cuantización GGUF del modelo multimodal Qwen3.8-Flash-Next, publicada por el usuario prithivMLmods. El modelo original lo desarrolla el equipo Qwen (Alibaba) y se presenta como una vista previa arquitectónica experimental de cara a Qwen4. Se trata de un Mixture-of-Experts (MoE) multimodal que combina 125.000 millones de parámetros "core" (con 6.000 millones activados por token, 10 expertos enrutados más 1 compartido de un total de 512) con 51.000 millones de parámetros de embeddings n-grama aptos para offload y una cabeza MTP (multi-token prediction) de 4.000 millones, además de un codificador visual. El total de parámetros reportado en safetensors es de 176.943.899.520.

La relevancia de esta publicación concreta es que empaqueta el modelo en formato GGUF con cuantización MXFP4_MOE, pensada para aprovechar los Tensor Cores FP4 nativos de las GPU NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300). Incluye además un fichero MTP separado en BF16 que actúa como "drafter" para decodificación especulativa sin necesidad de un modelo borrador externo, y un fichero mmproj en BF16 para las capacidades de visión.

El contexto nativo es de 262.144 tokens, extensible a 1M mediante YaRN. Soporta texto, imagen y vídeo de horas de duración, con razonamiento configurable mediante `<think>`. La licencia es Qwen Community 1.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención híbrida (Gated DeltaNet + Qwen Sparse Attention), Gated Residual multi-rama y cabeza MTP |
| Parametros totales | 176.943.899.520 (125B core + 51B embeddings n-grama + 4B MTP; el total safetensors incluye todo) |
| Parametros activos | 6B por token (10 expertos enrutados + 1 compartido de 512) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1M con YaRN |
| Tipos de cuantizacion | MXFP4_MOE (fichero principal, 124 GB); BF16 para MTP (7,77 GB) y mmproj (908 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors |
| Capas | 48 |
| Expertos | 512 en total (10 enrutados + 1 compartido activos por token) |
| Tamaño del repo | 132,7 GB |
| Pipeline | image-text-to-text |
| Hardware objetivo | NVIDIA Blackwell (SM120, GB202): RTX Pro 6000, RTX 50-series, B200, B300 |

## Arquitectura y entrenamiento

El modelo es un MoE multimodal de 48 capas con una disposición de atención híbrida que intercala Gated DeltaNet con Qwen Sparse Attention (QSA) a nivel de bloque, con el objetivo declarado de reducir la latencia en contextos largos. Incorpora además flujos Gated Residual multi-rama para estabilidad del entrenamiento. La componente MoE activa 6B parámetros por token sobre un total de 125B en el núcleo, seleccionando 10 expertos enrutados más 1 compartido entre 512 disponibles. A esto se suman 51B de parámetros de embeddings n-grama diseñados para ser descargados a memoria secundaria (offload-friendly) y una cabeza MTP de 4B.

La publicación no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se documenta el uso de decodificación especulativa mediante la cabeza MTP: los pesos MTP se distribuyen como fichero GGUF BF16 independiente que actúa como drafter, sin requerir un modelo borrador separado. El modelo soporta razonamiento configurable mediante los parámetros `enable_thinking`, `preserve_thinking` y `reasoning_effort`. Se indica compatibilidad de despliegue con Transformers, vLLM, SGLang y TokenSpeed.

## Capacidades

- Generación de texto e instrucciones conversacionales multi-turno.
- Razonamiento configurable con modo `<think>` y control de esfuerzo de razonamiento.
- Codificación agéntica y computer use (uso de ordenador).
- Capacidades matemáticas y de razonamiento científico (evaluadas en GPQA Diamond y MathVision).
- Visión: entrada de imágenes mediante el proyector multimodal mmproj en BF16.
- Vídeo de escala de horas como entrada multimodal.
- Contexto largo nativo de 262.144 tokens, extensible a 1M con YaRN.
- Decodificación especulativa nativa mediante cabeza MTP (sin modelo drafter externo).
- Compatibilidad con llama.cpp, llama-cli, Transformers, vLLM, SGLang y TokenSpeed.
- Etiquetada como instruction-following y endpoints_compatible.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto nativo (y hasta 1M con YaRN), el modelo puede procesar contratos, informes o bases de código completas en una sola pasada sin fragmentación.
- Computer use y automatización de interfaz: los resultados declarados en AndroidWorld (84,5) lo sitúan como candidato para agentes que operan interfaces gráficas y flujos multi-paso.
- Ingeniería de software asistida: los resultados en SWE-bench Pro (62,5), SWE-bench Multilingual (81,0) y LiveCodeBench v6 (91,9) lo hacen adecuado para resolución de issues, parcheo de repositorios y generación de código en pipelines.
- Descripción y razonamiento sobre imágenes: el pipeline image-text-to-text con mmproj permite tareas de inspección visual, extracción de información de capturas o análisis de documentos escaneados.
- Análisis de vídeo de larga duración: el soporte de vídeo de horas encaja en monitorización, resumen de reuniones o revisión de material audiovisual extenso.
- Razonamiento científico y matemático asistido: con MathVision (95,7 con intérprete de código) y GPQA Diamond (91,7), es aplicable a tutoría técnica y verificación de cálculos.
- Despliegue local en estaciones Blackwell: la cuantización MXFP4_MOE (124 GB) permite ejecución en RTX Pro 6000 o B200/B300 aprovechando Tensor Cores FP4, útil para prototipado e inferencia privada on-premise.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card:

| Benchmark | Resultado |
|---|---|
| DeepSWE 1.1 | 58,7 |
| SWE-bench Pro | 62,5 |
| SWE-bench Multilingual | 81,0 |
| AndroidWorld | 84,5 |
| GPQA Diamond | 91,7 |
| LiveCodeBench v6 | 91,9 |
| MathVision (con intérprete de código) | 95,7 |

No se proporcionan en la información disponible datos de MMLU, HumanEval ni GSM8K, ni comparativas numéricas directas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal MXFP4_MOE ocupa 124 GB; sumando mmproj (908 MB) y MTP BF16 (7,77 GB) se superan los 132 GB de pesos. A ello hay que añadir la caché KV, que el ejemplo de llama.cpp configura en q8_0.
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 nativo, es decir, RTX Pro 6000, RTX 50-series, B200 y B300. La cuantización está optimizada para SM120/GB202.
- No cabe en GPU de consumo de gama media; requiere aceleradores de gama profesional o de centro de datos con memoria suficiente (RTX Pro 6000 o superiores).
- Opciones de despliegue: llama.cpp / llama-cli (con `-md` para el fichero MTP y `--spec-type draft-mtp`), Transformers, vLLM, SGLang y TokenSpeed.
- El ejemplo de la model card usa `-ngl auto`, `-c 16384`, caché KV en q8_0 y `--spec-draft-n-max 2` para decodificación especulativa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (MXFP4 GGUF, esta ficha) | 176,9B totales, 6B activos | 262.144 (1M con YaRN) | Qwen Community 1.0 | GGUF, safetensors |
| Qwen3.8-Flash-Next (base original) | 125B core + 51B embeddings + 4B MTP | 262.144 (1M con YaRN) | Qwen Community 1.0 | Safetensors, Transformers/vLLM/SGLang |
| Alternativas MoE de gran escala | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos que permitan una comparación numérica rigurosa.

## Limitaciones y advertencias

- Idioma: solo se declara inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El modelo se presenta como "experimental architectural preview" de Qwen4, lo que implica menor madurez que una versión estable.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se documentan mitigaciones específicas.
- La licencia Qwen Community 1.0 impone condiciones específicas; debe revisarse el texto completo antes de uso comercial.
- La cuantización MXFP4_MOE está optimizada para Blackwell; en hardware sin soporte FP4 nativo el rendimiento puede degradarse o requerir rutas alternativas.
- El fichero MTP es un drafter, no un modelo autónomo; cargarlo solo tiene sentido junto al modelo principal.
- El fichero mmproj debe cargarse por separado para habilitar visión; sin él, el modelo opera solo con texto.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica validación comunitaria mínima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fichero MTP BF16: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-MXFP4-MoE-GGUF/blob/main/Qwen3.8-Flash-Next-MTP.BF16.gguf
- Fichero principal MXFP4_MOE: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-MXFP4-MoE-GGUF/blob/main/Qwen3.8-Flash-Next.MXFP4_MOE.gguf
- Fichero mmproj BF16: https://huggingface.co/prithivMLmods/Qwen3.8-Flash-Next-MXFP4-MoE-GGUF/blob/main/Qwen3.8-Flash-Next.mmproj-bf16.gguf
