# Pilcothink/Raon-1-nano-NVFP4

## Resumen
Raon-1-nano-NVFP4 es una versión cuantizada a NVFP4 (4 bits) del modelo Raon-1-nano de KRAFTON, un modelo de lenguaje coreano-inglés de aproximadamente 3.630 millones de parámetros. La cuantización la ha realizado Pilcothink mediante quantización post-entrenamiento (PTQ) con NVIDIA Model Optimizer, sin destilación consciente de cuantización (QAD) ni fine-tuning adicional. El resultado es un checkpoint de 3,79 GB en tres ficheros safetensors, pensado para servir con vLLM sobre hardware NVIDIA Blackwell.

El interés de esta ficha es práctico: permite ejecutar un modelo bilingüe coreano-inglés con pesos de 4 bits en MLP (W4A4) y embeddings per-layer en NVFP4 weight-only, manteniendo en BF16 las partes sensibles (atención RDA/MLA, mHC, normalización, embeddings de entrada y `lm_head`). El autor publica un protocolo de evaluación comparativo BF16 vs NVFP4 sobre cinco benchmarks (KMMLU-Redux, MMLU-Redux 2.0, IFBench, PersonaMem v2 y BFCL v4), lo que aporta trazabilidad sobre el impacto de la cuantización.

La relevancia ahora es que el modelo base Raon-1-nano incorpora mecanismos de atención poco habituales (RDA y MLA) y una tabla PLE (per-layer embedding), y esta release demuestra que es viable cuantizar selectivamente esas arquitecturas con recetas NVFP4 y servir con vLLM usando kernels específicos (`--linear-backend b12x`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención RDA y MLA, mHC, tabla PLE (per-layer embedding); detalles completos no disponibles |
| Parametros totales | 3.629.689.937 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens configurados en la evaluación (`max_model_len=65536`); máximo nativo no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 en MLP (gate/up/down), NVFP4 weight-only en tabla PLE, BF16 en embeddings de entrada, `lm_head`, atención, mHC y normalización |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 ficheros, 3,79 GB), con `custom_code` y config extendida (`nano_nvfp4_recipe=mlp-w4a4-v1`, `nano_ple_format=nvfp4-e2m1-v1`) |

## Arquitectura y entrenamiento
El modelo base es un transformer con atención RDA (probablemente una variante de atención lineal/recurrente) y MLA (multi-head latent attention), además de módulos mHC y una tabla PLE que actúa como embedding por capa. Esta release no reentrena el modelo: aplica PTQ con NVIDIA Model Optimizer (revisión fijada `6c475d7`) sobre los 24 bloques MLP, usando bloques de 16 pesos E2M1 con escala E4M3 por bloque y una escala global FP32. Las proyecciones `gate_proj` y `up_proj` comparten escala global para permitir la fusión en vLLM. La tabla PLE se guarda en NVFP4 weight-only y se dequantiza a BF16 en tiempo de carga para las filas de los token IDs de entrada.

La calibración usó 512 conversaciones (273.824 tokens tras formateo de chat) muestreadas en ratio 3:2:1 de tres datasets: `beomi/KoAlpaca-v1.1a` (coreano QA, 256 conversaciones, 45.893 tokens), `HuggingFaceH4/ultrachat_200k` (diálogo inglés, 181 conversaciones, 166.061 tokens) y `NousResearch/hermes-function-calling-v1` (function calling, 75 conversaciones, 61.870 tokens). Se eliminaron prompts duplicados, se barajó con semilla 42 y se dividió en 512 calibración / 1.024 entrenamiento / 128 evaluación; solo se usó la partición de calibración. La conversación más larga tenía 3.502 tokens, por debajo del límite de 4.096 tokens de calibración. No hubo QAD ni fine-tuning posterior.

## Capacidades
- Generación de texto conversacional en coreano e inglés.
- Razonamiento con modo thinking (`enable_thinking=true` en el template de chat).
- Function calling / tool calling: parser `raon_1` de razonamiento y herramientas, con elección automática de herramienta; calibrado específicamente con datos de Hermes function calling.
- Razonamiento multi-paso y agentes: el protocolo de evaluación permite hasta 250 peticiones concurrentes con `max_tokens=8192` incluyendo razonamiento y respuesta final.
- Seguimiento de instrucciones evaluado con IFBench (precisión loose y strict a nivel de prompt).
- Memoria de persona y contexto largo: evaluado con PersonaMem v2 usando historiales de 32K tokens.
- Conocimiento coreano (KMMLU-Redux) y conocimiento general multidisciplinar (MMLU-Redux 2.0, 57 materias).
- Capacidades de visión, audio o matemáticas específicas: no disponibles en la información proporcionada.

## Casos de uso
- Asistente conversacional coreano-inglés: el modelo gestiona diálogos multi-turno con contexto de hasta 65.536 tokens y mantiene historiales de razonamiento (`truncate_history_thinking=false`), adecuado para atención al cliente bilingüe en Corea.
- Function calling en producción: el parser `raon_1` y la calibración con Hermes permiten integrar el modelo en pipelines de agentes que invocan APIs, con elección automática de herramienta y salida parseable.
- Evaluación de conocimiento coreano: uso como modelo de referencia para tareas KMMLU-Redux de cuatro opciones, extrayendo la letra A-D de la respuesta final.
- Razonamiento con memoria de persona: PersonaMem v2 con historiales de 32K lo hace utilizable en asistentes personalizados que deben recordar preferencias del usuario a lo largo de conversaciones largas.
- Despliegue en GPU consumer Blackwell: al ocupar 3,79 GB en NVFP4, cabe en una RTX 5090 junto con KV cache para contextos de 65K, permitiendo servir localmente sin infraestructura multi-GPU.
- Serving de alto throughput con vLLM: con `max_num_seqs=500` y `max_num_batched_tokens=4096` el checkpoint está preparado para batch grande en una sola GPU, útil para backends de chat a escala media.
- Generación de código: no disponible en la información proporcionada; no hay benchmark HumanEval ni mención explícita de capacidad de código.

## Benchmarks y rendimiento
El autor publica un protocolo comparativo BF16 vs NVFP4 sobre cinco benchmarks, pero en la información disponible no se incluyen los valores numéricos de accuracy resultantes. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

Lo que sí está documentado es el protocolo: RTX 5090 (SM120a), driver 595.99.02, vLLM 0.34.0rc0, FlashInfer 0.7.3, BF16 compute, `TRITON_MLA`, ejecución eager, `--linear-backend b12x` para MLP cuantizado, `max_model_len=65536`, `max_num_seqs=500`, `max_num_batched_tokens=4096`, `gpu_memory_utilization=0.75`, prefix caching y autotuning FlashInfer desactivados, `temperature=0.1`, `presence_penalty=1.5`, `max_tokens=8192`, `seed=42`, hasta 250 peticiones concurrentes y timeout de 3.600 s.

| Benchmark | Datos y scoring |
|---|---|
| KMMLU-Redux | Zero-shot generativo, 2.587 preguntas coreanas de cuatro opciones; respuesta no parseable cuenta como incorrecta |
| MMLU-Redux 2.0 | Zero-shot generativo, 57 materias en inglés; EvalScope 1.15.0 con correcciones Redux |
| IFBench | EvalScope 1.15.0 sobre respuesta final; precisión loose y strict a nivel de prompt |
| PersonaMem v2 | 5.000 preguntas de opción múltiple con historiales completos de 32K; orden barajado por ítem con `PYTHONHASHSEED=42` |
| BFCL v4 | Datos de scoring no disponibles en la información proporcionada |

## Requisitos de hardware
- VRAM estimada: pesos en 3,79 GB (NVFP4); el resto del presupuesto de VRAM se destina a KV cache y activaciones. Con `gpu_memory_utilization=0.75` en una RTX 5090 (32 GB) se sirvió `max_model_len=65536`.
- GPU recomendadas: NVIDIA Blackwell (SM120a) para aprovechar NVFP4 nativo; el autor validó con una GeForce RTX 5090. GPU Ampere, Hopper o Ada: compatibilidad NVFP4 no confirmada en la información disponible.
- Cabe en GPU consumer: sí, al menos en RTX 5090 según la evaluación publicada.
- Opciones de despliegue: vLLM 0.34.0rc0 con FlashInfer 0.7.3 y `--linear-backend b12x`; el loader debe soportar `nano_nvfp4_recipe=mlp-w4a4-v1` y `nano_ple_format=nvfp4-e2m1-v1` en `config.json`. llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles; el autor menciona que publicará el comando de serving y una imagen Docker optimizada junto con el checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pilcothink/Raon-1-nano-NVFP4 | 3.629.689.937 | 65.536 (config. eval.) | NVFP4 W4A4 MLP + PLE weight-only | Apache 2.0 | Hugging Face (0 descargas) |
| KRAFTON/Raon-1-nano (base) | 3.629.689.937 (según derivado) | No disponible | BF16 | Apache 2.0 | Hugging Face |
| Otras alternativas de ~3-4B bilingües coreano-inglés | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base, ya que en la información proporcionada no se identifican alternativas de la misma categoría con datos verificables. No se dispone de resultados de benchmarks del base frente a esta versión cuantizada.

## Limitaciones y advertencias
- Sesgos: no documentados en la información proporcionada; la calibración usa KoAlpaca, UltraChat y Hermes, lo que puede heredar sesgos de esos datasets.
- Alucinación: no se reporta tasa de alucinación; el scoring de KMMLU-Redux penaliza respuestas no parseables como incorrectas, lo que puede enmascarar respuestas plausibles pero erróneas.
- Contexto: la ventana usada en evaluación es 65.536 tokens, pero la calibración PTQ se limitó a 4.096 tokens (máximo 3.502 por conversación); el comportamiento más allá de ese rango no está validado.
- Idioma: solo coreano e inglés; no hay soporte documentado para otras lenguas.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base KRAFTON/Raon-1-nano y de los datasets de calibración.
- Producción: el checkpoint requiere `custom_code` y un loader que entienda las claves `nano_nvfp4_recipe` y `nano_ple_format`; sin ellas vLLM no cargará los pesos. El comando de serving y la imagen Docker no estaban publicados en el momento de la ficha.
- NVFP4 está optimizado para Blackwell (SM120a); en otras generaciones de GPU el rendimiento o la compatibilidad pueden degradarse.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Pilcothink/Raon-1-nano-NVFP4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Perfil del autor: https://huggingface.co/Pilcothink
- NVIDIA Model Optimizer (revisión usada): https://github.com/NVIDIA/Model-Optimizer/tree/6c475d716cff1c9c70b868ae4da86a59ccb1aa99
- Dataset KoAlpaca: https://huggingface.co/datasets/beomi/KoAlpaca-v1.1a/tree/03d3122c530b1e47195c08a3d851eeadddad9689
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k/tree/8049631c405ae6576f93f445c6b8166f76f5505a
- Dataset Hermes function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1/tree/dae3e1d28cfbcf4b915c04ea1e072030529b4bda
- KMMLU-Redux: https://huggingface.co/datasets/LGAI-EXAONE/KMMLU-Redux/tree/5ae54a2048e4e2754ef3fb3b0c19c8ebe8111eb4
- MMLU-Redux 2.0: https://huggingface.co/datasets/edinburgh-dawg/mmlu-redux-2.0/tree/372ea425445d51e1ba1188c56e5e893f8138621f
- IFBench: https://huggingface.co/datasets/allenai/IFBench_test/tree/ed7c12452594b7028b15807b86d3938150b663ae
- PersonaMem v2: https://huggingface.co/datasets/bowen-upenn/PersonaMem-v2/tree/ed956dea41521fc4499acbc63f966e0fd3c053ba
- BFCL v4: https://gorilla.cs.berkeley.edu (referencia citada en la model card; enlace exacto no disponible)
- Recomendaciones de sampling del modelo base: https://huggingface.co/KRAFTON/Raon-1-nano#sampling-parameters
