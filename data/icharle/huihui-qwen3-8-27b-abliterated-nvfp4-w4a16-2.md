# icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16

## Resumen

Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16 es una cuantización post-entrenamiento del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez es una versión "abliterated" (sin comportamiento de rechazo) del Qwen/Qwen3.8-27B del equipo Qwen. La ha publicado el usuario icharle aplicando el recetario oficial de NVIDIA ModelOpt 0.47.0 para la arquitectura `qwen3_5`, con un esquema de precisión mixta NVFP4/FP8 orientado a GPUs Blackwell. El resultado reduce el peso de 55,6 GB en BF16 a 21,9 GB en tres shards de safetensors, manteniendo las activaciones del MLP en BF16 (W4A16).

El modelo es multimodal (pipeline `image-text-to-text`) e incorpora atención completa, capas Gated DeltaNet y una torre de visión, todo ello según el layout de quantización descrito por el autor. Su interés práctico reside en que permite servir un modelo de ~18.000 millones de parámetros reales con cuantización FP4 nativa en hardware Blackwell mediante SGLang, con soporte verificado de tool calling y parsers de razonamiento, a un coste de memoria notablemente inferior al del BF16 original.

Al estar "abliterated", el modelo ha perdido el comportamiento de rechazo del modelo base: no incorpora salvaguardas de seguridad y el autor lo advierte explícitamente. La licencia es Apache-2.0, heredada de Qwen3.8-27B y del release de huihui-ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_5` con atención completa y capas Gated DeltaNet, más torre de visión y cabeza MTP |
| Parametros totales | 18.164.649.200 (según safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (MLP gate/up/down y lm_head), FP8 W8A8 (atención completa q/k/v/o y Gated DeltaNet in_proj_qkv/in_proj_z/out_proj), KV cache FP8, BF16 sin cuantizar (embeddings, in_proj_a/b, conv1d, torre de visión, cabeza MTP); `quant_algo: MIXED_PRECISION`, 401 capas cuantizadas |
| Idiomas soportados | no disponible (los datos de calibración incluyen texto en inglés y chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3 shards, 21,9 GB); configuración `hf_quant_config.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con arquitectura `qwen3_5`, que combina capas de atención completa con capas Gated DeltaNet (un mecanismo de estado lineal con proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a/b`, `conv1d` y `out_proj`). Dispone además de una torre de visión para entrada image-text-to-text y de una cabeza MTP (multi-token prediction). No se dispone de información sobre el número de tokens de entrenamiento del modelo original ni sobre si se aplicaron RLHF o DPO; esa información pertenece a la model card de Qwen3.8-27B, no incluida aquí.

La contribución de esta ficha es exclusivamente la cuantización. Se realizó con NVIDIA ModelOpt 0.47.0 (`examples/hf_ptq/hf_ptq.py`) sobre transformers 5.12.1 y torch 2.14.0, en una RTX PRO 6000 Blackwell de 96 GB. El algoritmo de calibración fue `max` (máximo absoluto por cuantizador, sin búsqueda AWQ/GPTQ) sobre 226 ventanas de 1024 tokens (~231.000 tokens) construidas a partir de Nemotron-SFT-Agentic-v2 (96 ventanas de transcripciones de agentes de búsqueda), Nemotron-SFT-SWE-v2 (80 ventanas de SWE agentless, descartando las que superaban el 30 % de líneas de rutas de fichero) y Nemotron-SFT-Multilingual-v1 en `code_zh`, `math_zh` y `stem_zh` (50 ventanas con al menos un 30 % de caracteres chinos). Las ventanas se cortaron en posiciones aleatorias (semilla 0) tras renderizar los documentos con la plantilla de chat del modelo. Existe una variante hermana con calibración AWQ, algo más próxima al BF16.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (`reasoning_effort` configurable, parser `qwen3` verificado en SGLang).
- Entrada multimodal image-text-to-text gracias a la torre de visión, que se mantiene en BF16.
- Tool calling / function calling, con parser `qwen3_coder` verificado en SGLang 0.5.23.
- Razonamiento multi-paso y flujos de agente, respaldado por los datos de calibración orientados a agentes y SWE.
- Capacidades de código y matemáticas (la evaluación incluye HumanEval como corpus de código y GSM8K).
- Capacidades multilingües, con calibración específica para chino en código, matemáticas y STEM.
- Cabeza MTP (multi-token prediction) conservada en BF16, útil para decodificación especulativa.
- Sin comportamiento de rechazo: el proceso de abliteration eliminó las negativas del modelo base.

## Casos de uso

- Despliegue de agentes de búsqueda en producción: el modelo se calibró con transcripciones de agentes de búsqueda y soporta tool calling con parser dedicado, por lo que encaja en pipelines de retrieval y razonamiento multi-paso servidos con SGLang.
- Asistencia a la ingeniería de software: la calibración incluyó SWE agentless y la evaluación mide KL sobre HumanEval; puede integrarse en flujos de generación y revisión de código donde el coste de memoria importa.
- Servicio de chat multimodal: al aceptar image-text-to-text, permite construir asistentes que reciben imágenes y texto, con la torre de visión intacta en BF16.
- Inferencia de alto rendimiento en Blackwell: con 21,9 GB de pesos y FP4 nativo, permite servir el modelo en una sola GPU Blackwell con decodificación a 69 tok/s por petición y ~1.147 tok/s con 32 peticiones concurrentes (medido por el autor).
- Razonamiento matemático y STEM en chino e inglés: la calibración multilingüe específica para `math_zh` y `stem_zh` lo hace adecuado para asistentes técnicos en esos dominios.
- Investigación sobre cuantización: sirve como referencia reproducible de un recetario ModelOpt W4A16 con calibración `max` y dataset propio, con scripts incluidos en `quantization/`.
- Aplicaciones que requieren contenido sin filtros: al carecer de salvaguardas, puede usarse en entornos controlados de investigación, asumiendo la responsabilidad de añadir los filtros necesarios en la aplicación.

## Benchmarks y rendimiento

Evaluación publicada por el autor el 2026-11-25 en una RTX PRO 6000 Blackwell con SGLang 0.5.23, comparando con el BF16 original, la variante AWQ del mismo autor y la cuantización pública de iQlusion (W4A4 MLP + FP8 attention + BF16 lm_head, calibración `max` sobre cnn_dailymail).

| Metrica | BF16 | NVFP4-W4A16 (max) | NVFP4-W4A16-AWQ | iQlusion W4A4 |
|---|---|---|---|---|
| Pesos | 55,6 GB | 21,9 GB | 21,9 GB | 23,75 GB |
| KL vs BF16 (todo el texto, top-20) | 0 | 0,0391 | 0,0354 | 0,0540 |
| Cambio de perplejidad | — | +2,98 % | +2,69 % | +4,84 % |
| Acuerdo top-1 con BF16 | — | 91,4 % | 92,0 % | 90,6 % |
| KL solo en código | 0 | 0,0524 | 0,0534 | 0,0968 |
| GSM8K (250, thinking, greedy) | 98,4 % | 97,2 % | 98,4 % | 98,4 % |
| MMLU-Pro (280, thinking, greedy; ±2,4) | 80,4 % | 81,8 % | 80,0 % | 79,6 % |
| Decode, 1 petición | 27 tok/s | 69 tok/s | 69 tok/s | 62 tok/s |
| Throughput, 32 concurrentes | — | 1.147 tok/s | 1.156 tok/s | 1.199 tok/s |
| Time to first token, 1 petición | 155 ms | 147 ms | 147 ms | 76 ms |

Las métricas KL, perplejidad y top-1 se calcularon con teacher forcing sobre ~45.000 posiciones de texto no usado en calibración (test de wikitext-2, código de HumanEval y Wikipedia en chino), con KL aproximada sobre los 20 tokens más probables del BF16. Las tareas usaron las mismas 530 preguntas para todos los modelos, `reasoning_effort: medium`, temperatura 0 y máximo de 8.192 tokens; con 250 y 280 preguntas, las diferencias de 1-2 puntos están dentro del ruido. Las velocidades se midieron con `sglang.bench_serving`, 1.024 tokens de entrada y 1.024 de salida, con `--kv-cache-dtype fp8_e4m3`.

## Requisitos de hardware

- VRAM estimada para inferencia: 21,9 GB solo de pesos; hay que sumar la caché KV en FP8, las activaciones y el resto de tensores en BF16. En la práctica requiere una GPU Blackwell con soporte nativo de FP4.
- GPU recomendadas: NVIDIA Blackwell (RTX PRO 6000 Blackwell de 96 GB es la usada para cuantizar y evaluar). No se han validado otras GPU en la información disponible.
- Cabe en GPU consumer: no disponible (no se documenta funcionamiento en RTX 4090 u otras GPU sin FP4 nativo).
- Opciones de despliegue: SGLang 0.5.23 con `quant=modelopt_mixed` (verificado, incluye parsers de tool calling y razonamiento), vLLM y TensorRT-LLM con soporte de checkpoints ModelOpt. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 69 tok/s en decodificación con una petición, 1.147 tok/s con 32 concurrentes, 147 ms de time to first token con una petición.
- Nota de reproducibilidad: torch 2.15 y Triton 3.9 eliminan `tl.make_block_ptr`, que el kernel de fake-quant NVFP4 de ModelOpt 0.47/0.48 todavía usa; hay que fijar torch 2.14.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated (BF16) | 18,16 B | no disponible | 55,6 GB | apache-2.0 | Hugging Face |
| **Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16 (max)** | 18,16 B | no disponible | 21,9 GB | apache-2.0 | Hugging Face |
| Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ | 18,16 B | no disponible | 21,9 GB | apache-2.0 | Hugging Face |
| iQlusion/Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead | no disponible | no disponible | 23,75 GB | no disponible | Hugging Face |

En calidad frente al BF16, la variante AWQ es ligeramente mejor (KL 0,0354 frente a 0,0391; perplejidad +2,69 % frente a +2,98 %), mientras que la variante `max` de esta ficha obtiene mejor KL en código (0,0524 frente a 0,0534) y mejor throughput con 32 concurrentes. Frente a la cuantización de iQlusion, el esquema W4A16 con activaciones BF16 se mantiene más cerca del BF16 original, sobre todo en código, mientras que el W4A4 de iQlusion logra menor TTFT (76 ms frente a 147 ms) y algo más de throughput concurrente.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration eliminó el comportamiento de rechazo del modelo base; no hay salvaguardas y la responsabilidad de añadirlas recae en la aplicación.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Idiomas soportados no documentados: solo consta que la calibración incluyó inglés y chino; el rendimiento en otras lenguas no está medido.
- Longitud de contexto no disponible en la información proporcionada.
- Hardware restringido: el formato NVFP4 requiere GPUs Blackwell con soporte ModelOpt; no se ha verificado en arquitecturas anteriores ni en GPUs consumer.
- Dependencia de versiones: requiere torch 2.14 por incompatibilidad del kernel de fake-quant de ModelOpt con torch 2.15/Triton 3.9.
- Calibración con algoritmo `max`: sin búsqueda AWQ/GPTQ, lo que deja algo de margen de mejora en KL frente a la variante AWQ hermana.
- Licencia Apache-2.0 heredada, pero conviene revisar el `LICENSE` del repositorio y las condiciones del modelo base Qwen3.8-27B para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16
- Variante AWQ hermana: https://huggingface.co/Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización alternativa W4A4: https://huggingface.co/iQlusion/Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead
- Recetario de cuantización del autor: carpeta `quantization/` del repositorio
- NVIDIA ModelOpt: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
