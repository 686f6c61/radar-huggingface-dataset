# ModelMerge-JP/Baphomet-1.0-4B

## Resumen
Baphomet-1.0-4B es un modelo multimodal (imagen-texto a texto) obtenido mediante la fusión lineal de ocho task-vectors sobre la base Qwen/Qwen3.5-4B. Lo desarrolla ModelMerge-JP, un autor independiente que emplea la herramienta goatmerge (formato v1.1.0) para combinar pesos de modelos comunitarios afinados sobre la misma arquitectura. El modelo resuelve el problema de agregar capacidades especializadas (agénticas, de código, de razonamiento y de alineación) en un único checkpoint de 4,66 mil millones de parámetros sin reentrenamiento, aplicando aritmética de tareas pura según la práctica descrita en un paper de 2025 sobre merging.

La relevancia actual reside en su contexto declarado de 262.144 tokens, su arquitectura híbrida de atención (3 capas de atención lineal por cada capa de atención completa) y su soporte de visión con torre dedicada, todo bajo licencia Apache 2.0. El autor advierte explícitamente de que no ha realizado evaluación cuantitativa ni reclama mejoras de rendimiento, por lo que la ficha debe leerse como una descripción técnica del artefacto y no como una validación empírica.

El checkpoint se publica en safetensors bf16 (10 shards, ~8,9 GB) y en GGUF Q8_0 (4,2 GB), con pipeline image-text-to-text y plantilla de chat que incluye tokens especiales para visión, razonamiento (`<think>`) y llamadas a herramientas (`<tool_call>`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer híbrido con torre de visión) |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (RoPE θ=10.000.000, M-RoPE intercalado) |
| Tipos de cuantizacion | bf16 (safetensors) y Q8_0 (GGUF); otras cuantizaciones no disponibles en el repo |
| Idiomas soportados | en (inglés; único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (10 shards, bf16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3.5-4B: 32 capas de texto con hidden size 2560, 16 cabezas de consulta y 4 de clave/valor (GQA), head_dim 256, y un patrón repetitivo de tres capas de atención lineal seguidas de una capa de atención completa. La FFN usa intermediate size 9216 con activación SiLU y embeddings atados (`tie_word_embeddings: true`). El vocabulario es de 248.320 entradas con tokenizador Qwen2Tokenizer (BPE). La torre de visión tiene hidden size 1024, 24 capas, patch_size 16, spatial_merge_size 2 y temporal_patch_size 2, gestionada por `Qwen3VLProcessor`.

No hay entrenamiento original: el modelo se construye mediante fusión lineal de task-vectors con la fórmula `W_merged = W_base + Σ αᵢ · Tᵢ`, donde cada αᵢ = 0,1375 y los ocho coeficientes suman 1,10. La configuración de goatmerge aplica `density=1.0`, `normalize=true` y `rescale=true`, con procesamiento en chunks de 8.388.608 elementos y `drop_caches=true`. Los ocho task-vectors provienen de InternScience/Agents-A1-4B, Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B, empero-ai/Qwen3.8-4B-Distill, Jackrong/Qwopus3.5-4B-Coder, Jackrong/Qwopus3.5-4B-v3, BAAI/AREX-Turbo, NeoHorse-1-4B-Aligned (conversión de claves de `model.*` a `model.language_model.*` mediante `align_neohorse.py`) y allenai/tmax-4b. No se documenta RLHF, DPO ni datos de entrenamiento adicionales, y el autor no reclama herencia verificada de capacidades específicas.

## Capacidades
- Generación de texto conversacional multi-turno con plantilla de chat basada en tokens `<|im_start|>` y `<|im_end|>`.
- Procesamiento de imágenes y vídeo como entrada (pipeline image-text-to-text, tokens `<|image_pad|>` y `<|video_pad|>`).
- Modo de razonamiento explícito mediante el token `<think>`.
- Soporte de llamadas a herramientas mediante el token `<tool_call>`.
- Capacidad potencial de razonamiento agéntico y multi-paso por herencia del task-vector de Agents-A1-4B (no verificada cuantitativamente).
- Capacidad potencial de generación de código por herencia de los task-vectors Qwopus3.5-4B-Coder y Qwopus3.5-4B-v3 (no verificada).
- Capacidad potencial de razonamiento matemático y científico por herencia de tmax-4b y AREX-Turbo (no verificada).
- Soporte multilingüe limitado: solo se declara inglés.
- Contexto largo de hasta 262.144 tokens para documentos extensos o conversaciones prolongadas.

## Casos de uso
- Análisis de documentos largos con soporte visual: el contexto de 262.144 tokens permite ingerir manuales técnicos, informes o expedientes completos junto con figuras y tablas escaneadas, manteniendo coherencia entre texto e imagen a lo largo de toda la ventana.
- Asistente conversacional con entrada de imágenes: integrable en interfaces de chat donde el usuario adjunta capturas, diagramas o fotografías y espera respuestas contextualizadas, gracias a la torre de visión de 24 capas y al procesador Qwen3VL.
- Automatización de flujos agénticos con herramientas: el token `<tool_call>` y el modo `<think>` permiten construir agentes que planifican varios pasos, invocan APIs y razonan sobre resultados intermedios en un bucle controlado.
- Generación asistida de código en entornos de desarrollo: la herencia de dos task-vectors orientados a código (Qwopus3.5-4B-Coder y Qwopus3.5-4B-v3) lo hace candidato para autocompletado, explicación de fragmentos y generación de tests, siempre con validación humana dado que no hay benchmarks publicados.
- Extracción de información estructurada de capturas y formularios: combinando visión y contexto largo se pueden procesar lotes de imágenes documentales y emitir salidas JSON mediante tool calling.
- Despliegue en hardware de consumo: la versión GGUF Q8_0 de 4,2 GB permite ejecución local en GPU de gama media o incluso CPU con llama.cpp, útil para prototipos y entornos con requisitos de privacidad.
- Investigación sobre merging de modelos: el repo incluye `goatmerge.json` con huella del modelo base, lista de task-vectors y `recipe.yaml` reproducible, lo que lo convierte en material de estudio para experimentos de aritmética de tareas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no ha realizado evaluación cuantitativa y que no reclama mejoras de rendimiento ni herencia de capacidades específicas.

## Requisitos de hardware
- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos (4,66 B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 16 GB para contexto moderado y 24 GB o más para aprovechar ventanas largas.
- VRAM estimada en Q8_0: alrededor de 4,5-5 GB para pesos, viable en GPU de 8 GB con contexto limitado.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262.144 tokens y serving concurrente; RTX 4090 (24 GB) para bf16 con contexto amplio; RTX 3090/4080 (16-24 GB) para bf16 con contexto moderado; RTX 4060 Ti 16 GB o inferiores para Q8_0.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090 y 4080 con bf16, y en GPUs de 8 GB con la cuantización Q8_0.
- Opciones de despliegue: transformers con `AutoModelForVision2Seq` y `AutoProcessor` (recomendado por el autor con `trust_remote_code=True`); llama.cpp para el GGUF Q8_0; vLLM y TGI no están documentados explícitamente para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| Baphomet-1.0-4B | 4,66 B | 262.144 | Sí | Apache 2.0 | No (autor no evaluó) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en la informacion | Sí | no disponible en la informacion | no disponible |
| allenai/tmax-4b | ~4 B | no disponible | no disponible | no disponible | no disponible |
| InternScience/Agents-A1-4B | ~4 B | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con la información proporcionada: no se dispone de benchmarks del modelo ni de los modelos donantes, y varios de ellos no publican especificaciones en los datos consultados.

## Limitaciones y advertencias
- Ausencia total de evaluación cuantitativa: el autor declara explícitamente que no ha medido rendimiento y que no reclama mejoras ni herencia de capacidades.
- Riesgo de degradación por merging: la combinación lineal de ocho task-vectors con coeficientes que suman 1,10 y normalización activa puede producir interferencias entre direcciones de tarea; sin benchmarks no es posible descartarlo.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otras lenguas no está documentado.
- Riesgo de alucinación: inherente a los modelos generativos de 4 B; no hay evaluación de fidelidad factual.
- Sesgos: no se documentan análisis de sesgo; al derivar de múltiples modelos comunitarios, puede acumular sesgos de todos ellos.
- Licencia Apache 2.0 permite uso comercial, pero los modelos donantes podrían tener condiciones adicionales no reflejadas en la model card; conviene verificar cada uno antes de producción.
- Contexto largo declarado (262.144 tokens) sin validación empírica de recuperación efectiva en ventanas extremas; el rendimiento real puede degradarse antes del límite teórico.
- Soporte de despliegue limitado: solo transformers y llama.cpp (GGUF Q8_0) están documentados; la integración con vLLM o TGI no está confirmada.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ModelMerge-JP/Baphomet-1.0-4B
- Repositorio de la herramienta de merging: https://github.com/CroudGoat/GoatMerge
- Paper de merging citado (hitit et al., 2025): https://arxiv.org/pdf/2603.09938
- Paper adicional referenciado en los tags: arxiv:2511.21437 (sin URL directa en la información disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Donante Agents-A1-4B: https://huggingface.co/InternScience/Agents-A1-4B
- Donante DeepSeek-V4-Pro-Qwen3.5-4B: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
- Donante Qwopus3.5-4B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Donante Qwopus3.5-4B-v3: https://huggingface.co/Jackrong/Qwopus3.5-4B-v3
- Donante Qwen3.8-4B-Distill: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Donante AREX-Turbo: https://huggingface.co/BAAI/AREX-Turbo
- Donante NeoHorse-1-4B-GGUF: https://huggingface.co/TokenRhythm/NeoHorse-1-4B-GGUF
- Donante tmax-4b: https://huggingface.co/allenai/tmax-4b
