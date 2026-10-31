# autotrust/Qwen3.8-27B-NVFP4-DGX-SPARK-V2

## Resumen

Qwen3.8-27B-NVFP4-DGX-SPARK-V2 es una distribución cuantizada del modelo Qwen3.8-27B (familia Qwen), preparada por el usuario `autotrust` de Hugging Face para su despliegue con vLLM en GPUs NVIDIA Blackwell, en particular la DGX Spark (GB10) y la B200. El repositorio combina el checkpoint completo en formato NVFP4 (cuantización de 4 bits de NVIDIA, generada con ModelOpt) junto a una receta de decodificación especulativa MTP de vocabulario reducido a 64k tokens.

La aportación principal de esta versión (V2) es el parche de MTP 64k: se reduce la cabeza de borrador (draft head) de 248.320 filas de vocabulario a 64.026 filas (con padding a 64.064 para el kernel GEMM cuantizado), se cuantiza en tiempo de ejecución a Marlin NVFP4 W4A16 junto con las cinco proyecciones lineales del módulo MTP, dejando intactos el modelo objetivo y su `lm_head` de verificación. Esto reduce drásticamente el coste del paso de borrador y permite valores altos de tokens especulativos verificados: 7 en B200 y 8 en DGX Spark.

Es relevante ahora mismo porque aprovecha el hardware Blackwell (sm_100/sm_120) y el soporte NVFP4 de vLLM 0.31.0 para ofrecer inferencia rápida de un modelo denso de gama media-alta con licencia Apache 2.0, ideal para estaciones de trabajo de memoria unificada como DGX Spark. Cabe señalar una discrepancia en la ficha: aunque el nombre indica 27B, los metadatos reales de safetensors reportan 15.193.246.960 parámetros (~15,2B), coherente con un checkpoint NVFP4 comprimido; no disponible el dato oficial de parámetros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.8), con módulo MTP (Multi-Token Prediction) para decodificación especulativa |
| Parametros totales | 15.193.246.960 (~15,2B según safetensors; el nombre del modelo indica 27B, dato oficial no disponible) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible como máximo nativo; los ejemplos de despliegue usan `--max-model-len 32768` |
| Tipos de cuantizacion | NVFP4 (pesos del modelo objetivo), Marlin NVFP4 W4A16 (cabeza de borrador y proyecciones MTP, en runtime), KV cache FP8 |
| Idiomas soportados | Inglés y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (20,6 GB en total), optimizado para vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de la familia Qwen3.8 (etiqueta `qwen3_5`/`qwen3.8` en el repositorio), denso (no MoE), con un cabezal MTP de 5 capas de proyección lineal para predicción multi-token. Sobre el checkpoint base, este repositorio aplica cuantización NVFP4 mediante NVIDIA ModelOpt, un formato de 4 bits con bloque de escala diseñado para las GPUs Blackwell.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), no hay información disponible en la model card. La innovación técnica destacable de esta distribución es el parche MTP 64k: la cabeza de borrador se recorta de 248.320 filas a 64.026 filas conservadas (recolectadas del `lm_head` del modelo objetivo), se rellena a 64.064 filas para el kernel GEMM cuantizado y se cuantiza en runtime a Marlin NVFP4 W4A16, igual que las cinco proyecciones MTP. El modelo objetivo y la cabeza de verificación permanecen sin modificar, preservando la calidad de salida. Este parche es específico de vLLM y no funciona en SGLang ni TensorRT-LLM.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, formato chat con plantilla Qwen3).
- Modo de razonamiento (thinking mode) activado por defecto en la plantilla de chat, desactivable por petición con `chat_template_kwargs: {"enable_thinking": false}` y parseable con `--reasoning-parser qwen3`.
- Decodificación especulativa MTP de alto rendimiento con vocabulario de borrador reducido a 64k (7 tokens especulativos verificados en B200, 8 en DGX Spark).
- Servido con API compatible con OpenAI (`/v1/chat/completions`) mediante vLLM.
- Capacidades de código y matemáticas heredadas de la familia Qwen (no hay datos de benchmark específicos en la ficha).
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: inglés y chino.

## Casos de uso

- Servidor de inferencia local en DGX Spark: el modelo está específicamente optimizado para la memoria unificada del GB10, con cuantización FP4 que reduce el checkpoint a 20,6 GB y KV cache en FP8, dejando espacio para contexto de 32k tokens.
- Aceleración de throughput en servidores B200: la decodificación especulativa con 7 tokens verificados por paso y borrador cuantizado Marlin permite aumentar tokens/segundo en despliegues de producción sin sacrificar calidad (el modelo objetivo no se toca).
- Asistentes conversacionales con razonamiento: el thinking mode de Qwen3 permite respuestas con cadena de razonamiento explícita para tareas complejas, con parser integrado en vLLM.
- Integración en aplicaciones vía API OpenAI-compatible: cualquier cliente que hable el protocolo de OpenAI (LangChain, openai-python, interfaces web) puede consumir el modelo sin cambios de código.
- Prototipado de pipelines de decodificación especulativa: el repositorio incluye un plugin instalable y un parche offline en Python, útil para desarrolladores que investigan MTP y cuantización de cabezas de borrador.
- Procesamiento por lotes offline: la API `LLM` de vLLM con el parche aplicado permite ejecución en proceso para generación masiva de texto en estaciones de trabajo Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia operativa, la model card indica puntos de partida verificados de decodificación especulativa (`num_speculative_tokens`: 7 en B200, 8 en DGX Spark) y recomienda reducir a 4-6 tokens con temperaturas superiores a ~0,7 por la caída de aceptación del borrador, pero no incluye cifras de throughput ni de calidad (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM/memoria: al menos 20,6 GB para el checkpoint más la memoria para la KV cache; con `gpu_memory_utilization 0,60` como punto de partida seguro en sistemas de memoria unificada (DGX Spark).
- GPU recomendadas: NVIDIA B200 (sm_100, verificada) y DGX Spark / GB10 (sm_120/121, plataforma objetivo de la receta). Requiere arquitectura Blackwell para el soporte NVFP4.
- Consumer GPUs: no disponible información oficial; en principio no es viable en GPUs Ampere/Ada/Hopper por la dependencia del formato NVFP4 y kernels Marlin FP4 de Blackwell.
- Software: vLLM 0.31.0 (versión exacta, el plugin usa internals y puede romperse en otras), Python 3.10+, PyTorch y CUDA compatibles con esa build de vLLM.
- Despliegue: únicamente vLLM, con el plugin incluido (`pip install -e ./mtp64k/plugin`) y las variables de entorno `SPARK_DRAFT_HOME`, `SPARK_DRAFT_VOCAB`, `SPARK_DRAFT_HEAD_Q=marlin` y `SPARK_DRAFT_MTP_Q=marlin`. No es compatible con SGLang, TensorRT-LLM ni llama.cpp.
- Verificación: el log del servidor debe mostrar la línea `[real-draft] head rows=64064 head_q=marlin mtp_q=marlin layers=5`; si no aparece, el parche 64k no está activo y vLLM usará MTP nativo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto (despliegue) | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-DGX-SPARK-V2 | ~15,2B (safetensors; nombre indica 27B) | NVFP4 + MTP 64k Marlin | 32.768 tokens | Apache 2.0 | Blackwell (B200, DGX Spark), vLLM |
| Qwen3-32B (FP8 oficial) | 32,5B | FP8 | 32.768 tokens (128k con YaRN) | Apache 2.0 | Amplia gama de GPUs, vLLM/SGLang/TensorRT-LLM |
| Qwen3-14B | 14,8B | BF16/FP8/GGUF | 32.768 tokens (128k con YaRN) | Apache 2.0 | Consumer GPUs posibles con cuantización, múltiples runtimes |
| Qwen3-30B-A3B (MoE) | 30,5B (3,3B activos) | BF16/FP8/GGUF | 32.768 tokens (128k con YaRN) | Apache 2.0 | Amplia gama de GPUs, múltiples runtimes |

Nota: los datos de los modelos comparables son aproximados y pueden variar según la revisión del repositorio; esta distribución se distingue por su optimización específica para Blackwell con NVFP4 y decodificación especulativa MTP de vocabulario reducido, a costa de un ecosistema de despliegue mucho más restringido (solo vLLM 0.31.0).

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 27B pero los safetensors contienen ~15,2B de parámetros; conviene verificar la procedencia y el modelo base exacto antes de uso en producción.
- Fuerte acoplamiento a versiones: el plugin depende de internals de vLLM 0.31.0 y puede romperse con cualquier otra versión.
- Solo compatible con GPUs Blackwell (sm_100/sm_120/121); no funcionará en A100, H100 ni GPUs de consumo.
- El parche 64k MTP no está integrado en los pesos: si se sirve con un `vllm serve` simple sin el plugin, se usará MTP nativo sin la optimización (y puede que sin aviso evidente salvo por el log).
- La aceptación del borrador cae con temperaturas altas (> ~0,7), lo que reduce el beneficio de la decodificación especulativa.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado.
- Sesgos y riesgo de alucinación: heredados de la familia Qwen; no hay evaluaciones específicas publicadas en la model card.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque el modelo base Qwen puede tener condiciones propias que conviene revisar.
- Restricciones de memoria: el `max-model-len` debe superar al `max_tokens` del cliente, y en DGX Spark la utilización de memoria del 0,60 es el punto de partida seguro por la memoria unificada compartida con la CPU.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/autotrust/Qwen3.8-27B-NVFP4-DGX-SPARK-V2
- Receta MTP previa referenciada: `autotrust/Qwen3.8-27B-NVFP4-DGX-SPARK` (enlace exacto no disponible en la información proporcionada)
- Paper, blog o demo oficial: no disponible
