# AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4

## Resumen

Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4 es una cuantización de 4 bits en formato NVFP4 del modelo Ornith-1.0-35B, un MoE híbrido orientado a tareas de codificación agéntica desarrollado originalmente por DeepReinforce. Esta versión concreta la publica AEON-7 y aplica dos transformaciones sobre el modelo base: por un lado, un proceso de "abliteration" que elimina los rechazos y el contenido censurado del modelo; por otro, una cuantización quirúrgica de solo pesos (W4A16) que reduce el tamaño del repositorio a 23,8 GB frente a los aproximadamente 70 GB que ocuparía en BF16.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: una arquitectura híbrida que mezcla atención completa con GatedDeltaNet (SSM) y capas MoE con 256 expertos, una modalidad multimodal de imagen-texto, y una cuantización NVFP4 optimizada para GPUs Blackwell que, según el autor, preserva la capacidad de razonamiento y codificación del modelo original. El modelo declara 35.107.181.936 parámetros totales y soporta un contexto máximo de 262.144 tokens en el despliegue recomendado.

El modelo está pensado para despliegues en hardware Blackwell (B200, GB10/DGX Spark) mediante vLLM, con soporte de decodificación especulativa DFlash que el autor mide en torno a 1,9× de aceleración en un solo flujo. La licencia es MIT, lo que facilita su uso comercial, aunque la naturaleza "uncensored" del modelo exige controles de seguridad adicionales en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con GatedDeltaNet (SSM) y atención completa; multimodal (image-text-to-text) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible (MoE con 256 expertos; número de expertos activos no especificado) |
| Longitud de contexto | 262.144 tokens (configuración de despliegue recomendada) |
| Tipos de cuantización | NVFP4 (W4A16, solo pesos, 4 bits); modelo base en BF16; tags indican también 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un MoE híbrido que combina capas de atención completa con capas de GatedDeltaNet, un mecanismo de atención lineal de tipo SSM (state space model) que aporta un camino recurrente. La torre de visión (`model.visual.*`) está presente y se mantiene en BF16, lo que confirma la naturaleza multimodal. El modelo base es un post-entrenamiento ligero con RL sobre Qwen3.6-35B-A3B, según indica el autor, con dimensiones compatibles (hidden 2048, vocab 248320) que permiten usar un drafter DFlash de Qwen3.6-35B-A3B para decodificación especulativa.

La cuantización es el elemento técnico más destacado: se aplica NVFP4 únicamente a los expertos MoE (los 256) y al MLP del experto compartido, que representan aproximadamente el 90 % de los pesos. Se preservan en BF16 la atención completa (q/k/v/o), las capas GatedDeltaNet/SSM, la torre de visión, los gates del router, los embeddings, el lm_head y las normas. La decisión de usar W4A16 (pesos en FP4, activaciones en BF16) evita la penalización de razonamiento asociada a las activaciones en FP4 (W4A4). La cuantización se realizó con llm-compressor en una B200 y se validó en una DGX Spark (GB10, sm_120). No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking": cada turno abre un bloque `<think>…</think>`.
- Codificación y tareas agénticas: los tags y la validación del autor apuntan a SWE-bench y Terminal-bench como dominios objetivo.
- Tool calling y function calling: soporte mediante `--enable-auto-tool-choice` y parser `qwen3_coder` en vLLM.
- Razonamiento multi-paso y uso como agente.
- Capacidades multimodales de imagen a texto: la torre de visión se conserva en BF16; el despliegue recomendado limita a 4 imágenes y 2 vídeos por prompt.
- Capacidades matemáticas (el autor incluye un benchmark de matemáticas en su tabla de velocidad, aunque el dato está truncado).
- Multilingüe: no disponible.
- Modelo "abliterated"/"uncensored": los rechazos se han eliminado mediante abliteration, que según el autor sobrevive intacta a la cuantización FP4.

## Casos de uso

- Codificación agéntica en producción: el modelo puede integrarse en pipelines de CI/CD como agente que resuelve tareas de SWE-bench y Terminal-bench, con tool calling nativo y contexto de 262.144 tokens para manejar repositorios completos.
- Asistente de terminal y automatización de operaciones: con el parser `qwen3_coder` y tool calling, puede ejecutar comandos y encadenar pasos multi-paso en entornos controlados.
- Análisis de documentación técnica con imágenes: la torre de visión permite procesar diagramas, capturas de pantalla y vídeos junto con texto, útil para soporte técnico o revisión de PRs con capturas.
- Despliegue en hardware de borde Blackwell (DGX Spark/GB10): el tamaño de 23,8 GB y la cuantización NVFP4 permiten servir el modelo en un dispositivo de memoria unificada, con throughput medido de 39 tok/s a concurrencia 1 y 539 tok/s agregados a concurrencia 32.
- Generación de código asistida en IDE: el modelo mantiene la capacidad de codificación del BF16 según la validación del autor (0,833 pass@1 en una sonda de 18 tareas), por lo que es adecuado para autocompletado y generación de parches.
- Investigación sobre alineación y seguridad: al ser un modelo con rechazos eliminados y licencia MIT, sirve como base para estudiar comportamientos sin censura, aunque requiere salvaguardas externas en cualquier despliegue real.
- Razonamiento matemático con modo thinking: el bloque `<think>` permite trazas de razonamiento explícitas, útil en tutoría o verificación de soluciones.

## Benchmarks y rendimiento

El autor publica una validación comparativa entre el modelo BF16 y esta cuantización NVFP4, medida sobre el modelo servido:

| Métrica | BF16 parent | NVFP4 (esta versión) |
|---|---|---|
| Agentic/coding pass@1 (sonda de 18 tareas) | 0,833 (15/18) | 0,833 (15/18) |
| Rechazos (prompts dañinos diversos) | 0 | 0 |
| Coherencia (generación larga, benigna y dañina) | limpia | 0/10 degenerados |
| Carga con 0 pesos omitidos | — | sí |

Rendimiento medido en DGX Spark (GB10), decodificación simple sin decodificación especulativa:

| Concurrencia | c=1 | c=8 | c=16 | c=32 |
|---|---|---|---|---|
| tok/s agregados | 39 | 221 | 376 | 539 |

Con decodificación especulativa DFlash (drafter Qwen3.6-35B-A3B), a c=1:

| num_speculative_tokens | 4 | 6 | 8 | 11 |
|---|---|---|---|---|
| tok/s c=1 | 67,5 | 73,8 (1,89×) | 69,3 | 66,7 |

Comparativa de velocidad por carga de trabajo (DGX Spark, un solo flujo): codificación 30,8 tok/s en BF16 con vLLM estándar, 38,5 tok/s en NVFP4 y 77,1 tok/s en NVFP4 + DFlash; razonamiento 30,6 tok/s en BF16, 38,4 tok/s en NVFP4 y 107,0 tok/s en NVFP4 + DFlash. El dato de matemáticas está truncado en la información disponible.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23,8 GB en NVFP4; con caché KV en BF16 y contexto largo, el consumo crece por encima de esa cifra.
- GPU recomendadas: NVIDIA B200 (sm_100) o GB10/DGX Spark (sm_120); NVFP4 requiere arquitectura Blackwell.
- No cabe en GPUs consumer convencionales sin Blackwell; en DGX Spark (memoria unificada) funciona con `--gpu-memory-utilization` entre 0,6 y 0,7 para evitar page thrashing.
- Despliegue: vLLM con `--quantization compressed-tensors`, `--mamba-cache-dtype float32`, `--attention-backend flash_attn`, `--enable-chunked-prefill` y `--enable-prefix-caching`. No se mencionan llama.cpp, Ollama ni TGI para este formato.
- Latencia: TTFT ≈ 65 ms a c=1 en DGX Spark; throughput de 39 tok/s a c=1 y 539 tok/s agregados a c=32.
- Decodificación especulativa DFlash opcional con drafter Qwen3.6-35B-A3B y `num_speculative_tokens=6` para el óptimo de 73,8 tok/s a c=1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4 | 35,1 B (MoE) | 262.144 | NVFP4 W4A16 | MIT | Hugging Face |
| Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16 | 35,1 B (MoE) | no disponible | BF16 | MIT | Hugging Face |
| deepreinforce-ai/Ornith-1.0-35B | 35,1 B (MoE) | no disponible | BF16 | MIT | Hugging Face |
| Qwen3.6-35B-A3B | no disponible | no disponible | BF16 | no disponible | Hugging Face (referenciado como base del drafter) |

La comparativa con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored" con rechazos eliminados: puede generar contenido dañino, sesgado o inapropiado; requiere filtros y salvaguardas externas en cualquier despliegue en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la eliminación de rechazos y por el modo thinking, que puede producir trazas de razonamiento plausibles pero incorrectas.
- La cuantización NVFP4 exige hardware Blackwell; no es portable a GPUs Ampere, Ada o anteriores sin reconvertir el modelo.
- El contexto de 262.144 tokens es una configuración de despliegue; no se especifica la longitud de contexto nativa del modelo base.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe equilibrado.
- El número de parámetros activos del MoE no está disponible, lo que dificulta estimar el coste computacional real por token.
- La validación del autor se basa en una sonda de 18 tareas y no en benchmarks estándar publicados; los resultados deben interpretarse con cautela.
- La licencia MIT del modelo no exime del cumplimiento de las licencias del modelo base (DeepReinforce Ornith) ni de la normativa aplicable sobre contenido generado.
- En DGX Spark, con memoria unificada, superar `--gpu-memory-utilization` de 0,8 provoca page thrashing.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4
- Modelo base BF16: https://huggingface.co/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16
- Modelo original: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B
- Licencia: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B/blob/main/LICENSE
- QuickStart DGX Spark: https://github.com/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored/blob/main/QUICKSTART_DGX_SPARK.md
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Soporte del autor: https://lotusmake.com/support
