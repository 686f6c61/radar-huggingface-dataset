# iromu/Qwen3-0.6B-tools-FP8

## Resumen

Qwen3-0.6B-tools-FP8 es la versión cuantizada en FP8 del ajuste fino de Qwen3-0.6B orientado a tool calling, publicado por el usuario iromu en HuggingFace. El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros desarrollado por Alibaba Qwen, y ha sido especializado mediante SFT con LoRA para emitir llamadas a herramientas en formato OpenAI de forma fiable. Esta variante FP8 está pensada para servir el modelo en hardware de clase GB10 con vLLM.

La relevancia del checkpoint reside en su naturaleza de artefacto de despliegue: no busca competir en capacidad general, sino ofrecer un modelo pequeño, cuantizado en W8A8 FP8, que mantiene la tasa de emisión de tool calls (100% según la validación del autor) con una pérdida de precisión en argumentos de 4,8 puntos porcentuales respecto al BF16. El contexto de entrenamiento es de 4096 tokens y el modelo solo declara soporte para inglés.

El modelo se distribuye bajo licencia Apache 2.0 y con pesos en safetensors, con un tamaño de repositorio de 0,8 GB. Su utilidad práctica es acotada: encaja en escenarios de agentes con recursos limitados donde el coste por token y la latencia importan más que el razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantizado FP8 W8A8 |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de secuencia en entrenamiento); contexto nativo del modelo base no especificado en la información disponible |
| Tipos de cuantizacion | FP8 E4M3 (pesos y activaciones), escalas por canal en pesos y por token dinámicas en activaciones; lm_head y embeddings en bf16 |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con hf_quant_config.json para vLLM) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. Sobre él se aplicó un ajuste fino supervisado con LoRA (dimensión 32, alpha 32, dropout 0,05) sobre los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, entrenado con NeMo-RL. La pérdida es cross-entropy enmascarada a los turnos del asistente mediante la palabra clave `generation` de la plantilla de chat, con longitud máxima de secuencia de 4096 tokens, precisión bfloat16, optimizador AdamW (lr 5e-5, weight decay 0,01), calentamiento lineal de 15 pasos y decaimiento coseno hasta 1e-6, batch global de 64 y 336 pasos de entrenamiento con validación cada 84.

El dataset empleado es la partición `sft_tools` de `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, en formato `messages` de OpenAI con turnos del asistente que incluyen `tool_calls`. Posteriormente, el checkpoint se cuantizó a FP8 W8A8 con NVIDIA ModelOpt usando la configuración `FP8_PER_CHANNEL_PER_TOKEN_CFG` y exportado con `export_hf_checkpoint`, que genera los pesos FP8, las escalas por canal y el archivo `hf_quant_config.json`. El autor advierte explícitamente que la configuración estática `FP8_DEFAULT_CFG` produce salidas degeneradas en vLLM, por lo que la ruta per-channel/per-token es la única validada.

## Capacidades

- Generación de texto conversacional en inglés.
- Emisión de tool calls y function calls en formato OpenAI, con nombres de función y argumentos estructurados.
- Interacciones de agente de varios pasos sobre el historial de mensajes.
- Ajuste específico para servir con vLLM mediante `--quantization modelopt`.
- No se declaran capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Enrutamiento de herramientas en agentes ligeros: el modelo puede decidir qué función invocar y con qué argumentos en pipelines de agentes con presupuesto de memoria reducido, gracias a su tamaño de 0,6B parámetros y su formato FP8.
- Servicio de function calling en vLLM con GPU de gama de consumo o hardware de clase GB10: su cuantización W8A8 reduce la huella de memoria y permite desplegarlo con `--quantization modelopt` en entornos donde un modelo mayor no cabría.
- Extracción estructurada de parámetros desde texto libre: útil para convertir consultas de usuario en llamadas JSON a APIs internas en asistentes de soporte.
- Prototipado rápido de flujos de agente multi-paso: al ser un checkpoint pequeño, permite iterar sobre plantillas de prompt y esquemas de herramientas con ciclos de validación rápidos.
- Generación de borradores de decodificación especulativa: un modelo de 0,6B puede actuar como modelo draft para acelerar un modelo mayor en la misma familia, aunque esta aplicación no está validada en la información disponible.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de precisión entre BF16, FP8, GGUF y NVFP4 dentro de la misma familia de checkpoints del autor.
- Automatización de tareas de bajo riesgo con contexto corto: clasificación de intenciones y selección de herramientas en asistentes de dominio acotado, donde los 4096 tokens de contexto son suficientes.

## Benchmarks y rendimiento

La model card incluye una tabla de validación sobre la partición held-out `sft_tools` (272 filas evaluables, decodificación greedy, capacidad de 384 tokens):

| Modelo | Cuantización | Tool call emitido | Nombres coincidentes | Argumentos exactos | Delta exacto vs base |
|---|---|---|---|---|---|
| Qwen3-0.6B-tools | BF16 | 271/272 (99,6%) | 236/272 (86,8%) | 192/272 (70,6%) | referencia |
| Qwen3-0.6B-tools | FP8 | 272/272 (100,0%) | 234/272 (86,0%) | 179/272 (65,8%) | −4,8 pp |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica que la medición es de decodificación greedy en un solo flujo, no throughput de servicio.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,6B parámetros en FP8, los pesos ocupan aproximadamente 0,6 GB; con overhead de activaciones y caché KV para 4096 tokens, se estima un consumo en torno a 1-2 GB, aunque no se proporciona una cifra oficial en la información disponible.
- GPU recomendadas: hardware de clase GB10 según el autor; también es compatible con GPU NVIDIA que soporten FP8 E4M3 (Ada Lovelace y posteriores, como RTX 4090, L40S, H100, A100 no soporta FP8 nativo).
- Cabe en GPU de consumo: sí, en tarjetas con soporte FP8 como la RTX 4090; en GPUs sin soporte FP8 nativo el checkpoint requeriría conversión o servir en bf16.
- Opciones de despliegue: vLLM con `--quantization modelopt` (ruta validada por el autor); el modelo base cuenta con cuantizaciones GGUF y NVFP4 en repositorios hermanos, pero esta variante FP8 está pensada para vLLM.
- Latencia y throughput: no disponibles en la información proporcionada; el autor aclara que la validación mide decodificación greedy en un solo flujo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-tools-FP8 (este) | 0,6B | 4096 (entrenamiento) | FP8 W8A8 | Apache 2.0 | HuggingFace |
| iromu/Qwen3-0.6B-tools (BF16) | 0,6B | 4096 (entrenamiento) | BF16 | Apache 2.0 | HuggingFace |
| iromu/Qwen3-0.6B-tools-GGUF | 0,6B | 4096 (entrenamiento) | GGUF (varias) | Apache 2.0 | HuggingFace |
| iromu/Qwen3-0.6B-tools-NVFP4 | 0,6B | 4096 (entrenamiento) | NVFP4 | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | bf16 | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a otros modelos de tool calling de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: el autor indica explícitamente que no está pensado como sustituto general de modelos Qwen de mayor tamaño.
- Solo inglés: la model card declara únicamente el idioma inglés, sin garantías para castellano u otros idiomas.
- Contexto limitado: la longitud máxima de secuencia en entrenamiento es de 4096 tokens, lo que restringe conversaciones y agentes de contexto largo.
- Degradación por cuantización: la precisión en argumentos exactos cae 4,8 puntos porcentuales respecto al BF16 (70,6% a 65,8%), lo que puede provocar llamadas con parámetros incorrectos.
- Riesgo de alucinación en argumentos: incluso en BF16, solo el 70,6% de los argumentos coinciden exactamente, por lo que se recomienda validación posterior de las llamadas generadas.
- Configuración de cuantización sensible: usar `FP8_DEFAULT_CFG` en lugar de la configuración per-channel/per-token produce salidas degeneradas en vLLM según el autor.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Fecha de creación del repositorio (2026-11-01) y ausencia de descargas y likes: el checkpoint no cuenta con validación comunitaria externa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/iromu/Qwen3-0.6B-tools-FP8
- Modelo BF16 con tabla de validación: https://huggingface.co/iromu/Qwen3-0.6B-tools
- Cuantizaciones GGUF: https://huggingface.co/iromu/Qwen3-0.6B-tools-GGUF
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen3-0.6B-tools-NVFP4
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- vLLM: https://github.com/vllm-project/vllm
- NeMo-RL: https://github.com/NVIDIA-NeMo/RL
