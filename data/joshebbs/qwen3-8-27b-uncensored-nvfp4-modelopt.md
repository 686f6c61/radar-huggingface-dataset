# joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt

## Resumen

Este modelo es una cuantización NVFP4 del checkpoint Qwen3.8-27B-Uncensored, creada por joshebbs mediante NVIDIA TensorRT Model Optimizer 0.43.0. Está diseñado para inferencia en GPUs Blackwell (serie GB10, GB200, B200, etc.) bajo vLLM, reduciendo el peso de aproximadamente 65 GB en bf16 a 19,2 GiB. El modelo base es una abliteración de Qwen3.8-27B que reduce drásticamente los rechazos de contenido, manteniendo la arquitectura híbrida con Gated DeltaNet y atención, además de la torre de visión y la cabeza de predicción multi-token (MTP). Es relevante porque permite ejecutar un modelo multimodal de gran tamaño con tool calling y razonamiento en hardware Blackwell con un footprint de memoria reducido.

La cuantización NVFP4 utiliza bloques de 16 con escalas FP8 y se aplica a 400 capas lineales, excluyendo las proyecciones sensibles de DeltaNet, la torre de visión, `lm_head` y la cabeza MTP. El checkpoint está calibrado con 256 muestras del dataset Open-Platypus, sin fine-tuning adicional. No es cargable con `transformers` directamente; requiere un runtime que entienda el formato `modelopt_fp4`, como vLLM.

El modelo base (JonathanColetti/Qwen3.8-27B-Uncensored) es una abliteración que, según su autor, reduce los rechazos de 98/100 a 12/100 en el test split de `mlabonne/harmful_behaviors`, medido en modo no-thinking. Mantiene la licencia Apache 2.0 y el contexto nativo de 262.144 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas de 3×(Gated DeltaNet → FFN) + 1×(Gated Attention → FFN), con torre de visión y cabeza MTP |
| Parametros totales | 15.193.246.960 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativo del modelo base); despliegue verificado con 131.072 |
| Tipos de cuantizacion | NVFP4 (4 bits, block size 16, escalas FP8) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con empaquetado NVFP4 (requiere runtime compatible con `modelopt_fp4`) |

## Arquitectura y entrenamiento

Qwen3.8-27B es una arquitectura híbrida que combina capas de atención con Gated DeltaNet, una variante de atención lineal con decaimiento exponencial. El modelo se compone de 64 bloques, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de FFN y 1 sub-bloque de atención completa seguido de FFN. Incluye una torre de visión para procesamiento de imágenes y una cabeza de predicción multi-token (MTP) que acelera la decodificación.

La cuantización NVFP4 se aplicó a 400 capas lineales: las proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`), las proyecciones de atención (`q/k/v/o_proj`) y las proyecciones de entrada de DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`). Se excluyeron las proyecciones de bajo rango `in_proj_a`/`in_proj_b` y el `conv1d` causal por su sensibilidad a la precisión, así como la torre de visión, `lm_head` y la cabeza MTP. La calibración se realizó con 256 muestras de Open-Platypus, batch size 16 y longitud máxima 1024, sin fine-tuning posterior.

El modelo base fue sometido a un proceso de abliteración (eliminación de direcciones de rechazo) mediante una búsqueda de 200 ensayos que co-minimiza el recuento de rechazos contra la divergencia KL respecto al modelo original, según describe el autor en su documentación.

## Capacidades

- Generación de texto y razonamiento con modo thinking: el chat template abre un bloque `thinking` por defecto; se puede desactivar con `enable_thinking=False`.
- Tool calling en dialecto XML de Qwen (`<tool_call><function=name>...`), que requiere el parser `qwen3_coder` en vLLM.
- Visión (image-text-to-text): la torre de visión se mantiene sin cuantizar, permitiendo entrada de imágenes.
- Predicción multi-token (MTP): la cabeza MTP se conserva, lo que puede mejorar la velocidad de decodificación.
- Multilingüe: soporta inglés y chino (según la model card).
- Comportamiento "uncensored" (abliterated): reduce significativamente los rechazos de contenido, aunque con riesgos asociados.

## Casos de uso

- Despliegue en producción en servidores Blackwell: con 19,2 GiB de pesos, es viable en GPUs como DGX Spark GB10 o B200, sirviendo con vLLM y `--quantization modelopt_fp4` para baja latencia.
- Asistentes conversacionales con tool calling: el soporte nativo de tool calling en formato XML permite integrarlo con APIs externas, bases de datos o ejecución de comandos, usando `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Aplicaciones de visión-lenguaje: al conservar la torre de visión, puede procesar imágenes para tareas de captioning, respuesta a preguntas visuales o análisis de documentos escaneados.
- Razonamiento multi-step con thinking mode: el bloque `thinking` permite desglosar problemas complejos de lógica, matemáticas o planificación, aunque requiere presupuesto de tokens suficiente para evitar truncamientos.
- Investigación en alineación y seguridad: al ser una abliteración, es útil para estudiar el comportamiento de rechazo, la efectividad de técnicas de desalineación y los riesgos de modelos "uncensored".
- Generación de código: aunque no hay benchmarks específicos para este checkpoint, el modelo base Qwen3.8-27B es conocido por sus capacidades de código; puede usarse con tool calling para autocompletado o refactorización en entornos de desarrollo.
- Prototipado rápido en entornos con GPUs Blackwell limitadas: la cuantización NVFP4 reduce el footprint de memoria, permitiendo ejecutar el modelo en nodos con memoria unificada como DGX Spark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del modelo base reporta una reducción de rechazos de 98/100 a 12/100 en el test split de `mlabonne/harmful_behaviors` (modo no-thinking), pero este dato corresponde al checkpoint en bf16, no a la versión cuantizada NVFP4. No hay métricas de calidad (MMLU, HumanEval, GSM8K, etc.) para este checkpoint específico.

## Requisitos de hardware

- GPU Blackwell obligatoria: NVFP4 es un formato específico de la arquitectura Blackwell (GB10, GB200, B200, etc.). No es compatible con Ampere, Ada o anteriores.
- VRAM estimada: los pesos ocupan 19,2 GiB; con KV cache (fp8) y overhead, se recomienda al menos 24-32 GB de VRAM, aunque no se especifica un mínimo exacto.
- Despliegue verificado: 2× DGX Spark GB10 (memoria unificada) con tensor parallelism (TP=2), interconexión QSFP de 200 Gb/s, vLLM 0.19.2rc1, `gpu-memory-utilization 0.75` y contexto 131.072.
- Runtime recomendado: vLLM con `--quantization modelopt_fp4`, `--kv-cache-dtype fp8` y `--attention-backend flashinfer`.
- No compatible con `transformers` ni con llama.cpp para este checkpoint concreto (aunque existe una versión GGUF del mismo modelo base para runtimes locales).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | ~27B (no confirmado) | 262.144 | bf16 | Apache 2.0 | transformers, vLLM |
| Qwen3.8-27B-Uncensored (base) | ~27B (no confirmado) | 262.144 | bf16 | Apache 2.0 | transformers, vLLM |
| Este checkpoint (NVFP4) | 15.193.246.960 | 262.144 (nativo) | NVFP4 | Apache 2.0 | vLLM (Blackwell) |
| GGUF del mismo base | ~27B (no confirmado) | 262.144 | GGUF (varios) | Apache 2.0 | llama.cpp, Ollama |

No se dispone de datos de rendimiento comparativo entre estas variantes. La principal diferencia es el formato de pesos y el hardware objetivo: NVFP4 está optimizado para Blackwell, mientras que GGUF es portable a CPUs y GPUs convencionales.

## Limitaciones y advertencias

- No cargable con `transformers`: el empaquetado NVFP4 (dos valores de 4 bits por byte) provoca errores de forma en `from_pretrained`. Se requiere vLLM u otro runtime con soporte `modelopt_fp4`.
- Solo GPUs Blackwell: limita su uso a hardware reciente y específico.
- Modo thinking con riesgo de truncamiento: si la respuesta se corta dentro del bloque `thinking` (finish_reason "length"), tanto `content` como `reasoning_content` quedan vacíos. Se recomienda `enable_thinking=False` o un presupuesto de tokens generoso.
- Comportamiento "uncensored": al reducir los rechazos, el modelo puede generar contenido dañino, ofensivo o ilegal. No es adecuado para aplicaciones sin moderación ni supervisión humana.
- Idiomas limitados: solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: no hay datos específicos, pero es un riesgo inherente a los modelos de lenguaje, especialmente en modo no-thinking.
- Degradación por cuantización: la conversión a NVFP4 puede afectar ligeramente la calidad, aunque no hay benchmarks que lo cuantifiquen.

## Enlaces

- [HuggingFace: joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt](https://huggingface.co/joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt)
- [Modelo base: JonathanColetti/Qwen3.8-27B-Uncensored](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored)
- [FriendliAI: ficha del modelo](https://friendli.ai/models/joshebbs/qwen3.8-27b-uncensored-nvfp4-modelopt)
- [MindStudio: artículo sobre la abliteración AEON](https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration)
- [Orcarouter: guía para ejecutar Qwen 3.8 27B Uncensored localmente](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
