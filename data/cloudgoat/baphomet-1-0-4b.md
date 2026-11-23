# CloudGoat/Baphomet-1.0-4B

## Resumen

Baphomet-1.0-4B es un modelo multimodal de tipo imagen-texto a texto publicado por el usuario CloudGoat en Hugging Face. No se trata de un entrenamiento desde cero, sino de un *merge* lineal por aritmética de tareas (task arithmetic) construido sobre la base Qwen/Qwen3.5-4B, al que se le suman ocho vectores de tarea extraídos de otros tantos modelos afinados por la comunidad. El resultado conserva la arquitectura original de Qwen3.5, un transformer híbrido con atención lineal y atención completa, y un total de 4.659.865.088 parámetros en bfloat16.

El modelo resuelve, en teoría, la agregación de capacidades especializadas (agénticas, de código, de razonamiento y de alineación) en un único checkpoint de 4B, algo relevante para quienes despliegan modelos pequeños en entornos con recursos limitados y quieren cubrir varios dominios sin encadenar varios modelos. La ventana de contexto es notablemente amplia: 262.144 tokens con RoPE intercalado M-RoPE, lo que lo sitúa por encima de muchos modelos de su tamaño.

La relevancia es sobre todo metodológica: el autor documenta de forma reproducible la receta de merge (herramienta goatmerge, coeficientes, huellas de los modelos origen) y publica pesos en safetensors y una cuantización GGUF Q8_0. Sin embargo, el propio autor advierte de que no ha realizado ninguna evaluación cuantitativa y no reclama mejoras de rendimiento ni herencia de capacidades concretas, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer híbrido con atención lineal y atención completa, más torre de visión) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (RoPE theta = 10.000.000, M-RoPE intercalado) |
| Tipos de cuantizacion | bfloat16 (safetensors) y GGUF Q8_0 |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (10 shards, bf16) y GGUF (Q8_0, 4,2 GB) |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es el resultado de una combinación lineal de vectores de tarea sobre los pesos de Qwen/Qwen3.5-4B, siguiendo la fórmula W_merged = W_base + Σ αᵢ · Tᵢ, con αᵢ = 0,1375 para cada uno de los ocho vectores (suma bruta 1,10, con normalización y reescalado activados en la herramienta goatmerge v1.1.0). Los vectores de tarea se extrajeron como diferencia entre cada modelo donante y la base, y los donantes son: InternScience/Agents-A1-4B, Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, empero-ai/Qwen3.8-4B-Distill, Jackrong/Qwopus3.5-4B-Coder, Jackrong/Qwopus3.5-4B-v3, BAAI/AREX-Turbo, TokenRhythm/NeoHorse-1-4B (con conversión de claves de `model.*` a `model.language_model.*`) y allenai/tmax-4b. El autor cita un artículo de 2025 (hitit et al., arXiv:2603.09938) según el cual la aritmética de tareas pura es el único método de merge que mejora de forma consistente en modelos "in-the-wild".

La arquitectura subyacente es la de Qwen3.5-4B: 32 capas de texto con hidden size 2560, 16 cabezas de consulta y 4 de clave/valor (GQA) con head_dim 256, y un patrón repetido de tres capas de atención lineal seguidas de una de atención completa. El FFN tiene dimensión intermedia 9216 con activación SiLU y embeddings atados. El vocabulario es de 248.320 tokens con tokenizador Qwen2 (BPE). La torre de visión tiene hidden size 1024, 24 capas, patch_size 16, spatial_merge_size 2 y temporal_patch_size 2, con procesador Qwen3VLProcessor. El chat template incluye tokens especiales para visión, vídeo, modo de razonamiento (`<think>`) y llamadas a herramientas (`<tool_call>`).

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), con soporte de tokens de imagen y vídeo en el template.
- Modo de razonamiento explícito mediante el token `<think>`, heredado del template de Qwen3.5.
- Llamada a herramientas y function calling mediante `<tool_call>`, lo que habilita flujos agénticos.
- Capacidades de código y matemáticas potencialmente incorporadas por los donantes Qwopus3.5-4B-Coder y Qwen3.8-4B-Distill, aunque el autor no garantiza su herencia.
- Contexto largo de hasta 262.144 tokens para documentos extensos o historiales de conversación prolongados.
- Capacidades multilingües: no disponibles; la model card solo declara inglés.

## Casos de uso

- Asistente conversacional con imágenes: el modelo acepta entradas de imagen y texto en el mismo turno, por lo que puede usarse para describir capturas, responder preguntas sobre diagramas o extraer información de documentos escaneados, aprovechando la torre de visión y el procesador Qwen3VL.
- Análisis de documentos largos: con 262.144 tokens de contexto puede ingerir contratos, informes o bases de código completas en una sola pasada, algo poco habitual en modelos de 4B.
- Automatización agéntica con tool calling: el template incluye `<tool_call>`, de modo que puede integrarse en orquestadores de agentes que necesiten invocar APIs, consultar bases de datos o ejecutar búsquedas encadenadas.
- Asistencia de programación en local: los donantes incluyen un modelo específico de código (Qwopus3.5-4B-Coder), por lo que puede emplearse para autocompletado, explicación de funciones o generación de tests en entornos de desarrollo con GPU de consumo.
- Despliegue en edge o en portátil: la cuantización GGUF Q8_0 de 4,2 GB permite ejecutarlo con llama.cpp u Ollama en equipos con 8-12 GB de VRAM o incluso en CPU, útil para prototipos sin infraestructura cloud.
- Razonamiento paso a paso en modo thinking: para tareas de matemáticas o lógica donde convenga separar la cadena de razonamiento de la respuesta final, usando el token `<think>` del template.
- Experimentación en investigación sobre merging: al publicar la receta completa y la procedencia, sirve como caso de estudio reproducible para evaluar aritmética de tareas en modelos multimodales pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no ha realizado ninguna evaluación cuantitativa y que no reclama mejoras de rendimiento.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 9,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16 GB para contexto moderado y bastante más para contextos cercanos a 262.144 tokens.
- VRAM estimada con GGUF Q8_0: aproximadamente 4,2 GB de pesos; cabe en GPUs de 8 GB con contexto corto.
- GPUs recomendadas: A100 40/80 GB o H100 para contexto completo y serving concurrente; RTX 4090 (24 GB) para bf16 con contexto largo; RTX 3090/4080 (16-24 GB) para bf16 con contexto moderado.
- GPU de consumo: sí, en tarjetas de 8-12 GB usando la cuantización Q8_0; en CPU es viable con llama.cpp aunque con throughput bajo.
- Opciones de despliegue: transformers con `AutoModelForVision2Seq` y `trust_remote_code=True`; llama.cpp para el GGUF; Ollama si se importa el GGUF; vLLM y TGI no están confirmados para esta arquitectura híbrida con visión en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| Baphomet-1.0-4B | 4,66B | 262.144 | imagen-texto a texto | Apache 2.0 | ninguna (según el autor) |
| Qwen/Qwen3.5-4B (base) | ~4B | 262.144 | imagen-texto a texto | no disponible en la información | no disponible en la información |
| InternScience/Agents-A1-4B | ~4B | no disponible | texto (donante) | no disponible en la información | no disponible en la información |
| allenai/tmax-4b | ~4B | no disponible | texto (donante) | no disponible en la información | no disponible en la información |

La comparación relevante es contra la base Qwen3.5-4B: Baphomet añade los deltas de ocho fine-tunes pero no documenta ninguna ganancia medible, por lo que la elección entre ambos debería basarse en evaluación propia. Los demás modelos de la tabla son donantes del merge y no alternativas directas de despliegue.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no ha medido rendimiento, por lo que no hay evidencia de que el merge mejore a la base ni de que las capacidades de los donantes se conserven.
- Riesgo de degradación por interferencia de vectores: sumar ocho vectores con coeficiente 0,1375 (suma 1,10 antes de normalizar) puede producir interferencias entre direcciones de tarea y degradar capacidades que la base tenía intactas.
- Idiomas: solo se declara inglés; no hay garantía de comportamiento correcto en castellano ni en otros idiomas.
- Sesgos: no disponibles; no se documenta ninguna evaluación de sesgos ni de seguridad.
- Alucinación: sin datos de evaluación, el riesgo es desconocido y probablemente comparable o superior al de la base por la mezcla de pesos.
- Licencia Apache 2.0 declarada, pero la procedencia de ocho modelos donantes con licencias posiblemente distintas no se detalla; conviene verificar la compatibilidad antes de un uso comercial.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación de la comunidad.
- Soporte de tooling incierto: la arquitectura híbrida con visión puede no estar soportada por vLLM o TGI; el GGUF Q8_0 es la vía más segura para producción ligera.
- El nombre del repositorio de la herramienta aparece con dos grafías en la model card (`CroudGoat` y `CloudGoat`), lo que puede complicar la reproducción exacta del merge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CloudGoat/Baphomet-1.0-4B
- Herramienta de merge goatmerge: https://github.com/CroudGoat/GoatMerge
- Artículo citado sobre merging (hitit et al., 2025): https://arxiv.org/pdf/2603.09938
- Referencia adicional citada en los tags: arXiv:2511.21437 (https://arxiv.org/abs/2511.21437)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Donante Agents-A1-4B: https://huggingface.co/InternScience/Agents-A1-4B
- Donante DeepSeek-V4-Pro-Qwen3.5-4B: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Donante Qwen3.8-4B-Distill: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Donante Qwopus3.5-4B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Donante Qwopus3.5-4B-v3: https://huggingface.co/Jackrong/Qwopus3.5-4B-v3
- Donante AREX-Turbo: https://huggingface.co/BAAI/AREX-Turbo
- Donante NeoHorse-1-4B: https://huggingface.co/TokenRhythm/NeoHorse-1-4B-GGUF
- Donante tmax-4b: https://huggingface.co/allenai/tmax-4b
