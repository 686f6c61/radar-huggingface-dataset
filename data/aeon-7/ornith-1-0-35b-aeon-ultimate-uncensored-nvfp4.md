# AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4

## Resumen

Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4 es una cuantización de 4 bits (NVFP4, W4A16) del modelo Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16, publicado por el usuario AEON-7. El modelo original procede de DeepReinforce (deepreinforce-ai/Ornith-1.0-35B), un MoE híbrido orientado a tareas agénticas y de generación de código, y esta variante aplica una "abliteración" (eliminación de rechazos) sobre él. La ficha actual empaqueta ese modelo abliterado en formato NVFP4 para su despliegue en GPUs Blackwell mediante vLLM y compressed-tensors.

La arquitectura es un transformer MoE híbrido de tipo qwen3_5_moe con capas de atención completa combinadas con GatedDeltaNet (SSM/linear attention), 35.107.181.936 parámetros totales y soporte multimodal imagen-texto. El repo ocupa 23,8 GB, aproximadamente un 64 % menos que el BF16 del que deriva, y el autor afirma que la cuantización es "casi sin pérdida" al mantener en BF16 la atención, la torre visual, el router y las capas recurrentes.

Su relevancia actual reside en que permite ejecutar un modelo de 35B con capacidades de razonamiento, código agéntico y visión en hardware Blackwell de gama relativamente contenida (por ejemplo, DGX Spark / GB10), con soporte de decodificación especulativa DFlash y un rendimiento medido de hasta 73,8 tok/s en single-stream según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (qwen3_5_moe) con GatedDeltaNet / SSM y atención completa |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el comando de despliegue de la model card) |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos en FP4, activaciones en BF16); componentes críticos en BF16; también existe versión BF16 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (nvfp4-pack-quantized); compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un MoE híbrido que combina capas de atención completa con capas GatedDeltaNet (atención lineal recurrente de tipo SSM). Según la model card, contiene 256 expertos en las capas MoE más un experto compartido, y una torre visual para entrada multimodal imagen-texto. La cuantización NVFP4 aplica FP4 únicamente a los MLP de los expertos y al experto compartido (aproximadamente el 90 % de los pesos), manteniendo en BF16 la atención completa (q/k/v/o), las rutas GatedDeltaNet (`linear_attn.*`), la torre visual, los gates del router, embeddings, `lm_head` y normalizaciones.

El modelo original es descrito por el autor como un "light RL post-train de Qwen3.6-35B-A3B", lo que sugiere un ajuste por refuerzo sobre una base Qwen3.6. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO. La variante AEON añade una abliteración para eliminar rechazos, y la cuantización se realizó con llm-compressor sobre una B200 (Blackwell) y se validó en una DGX Spark (GB10, sm_120). La innovación técnica destacable es la cuantización weight-only W4A16, que evita la penalización de razonamiento asociada a las activaciones en FP4 (W4A4) y desquantiza en registro a BF16 en Blackwell.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" explícito (cada turno abre con `<think>…</think>`).
- Generación de código y tareas agénticas de ingeniería de software (tags `coding`, `agentic`, `swe-bench`, `terminal-bench`).
- Razonamiento matemático.
- Tool calling / function calling, con parsers `qwen3_coder` y `qwen3` en vLLM.
- Capacidades multimodales de imagen-texto (visión), con límites configurables de imágenes y vídeo por prompt.
- Soporte de agentes y razonamiento multi-paso.
- Modelo abliterado: rechazos eliminados según la validación del autor (0 rechazos en prompts dañinos diversos).
- Decodificación especulativa compatible con un drafter Qwen3.6-35B-A3B DFlash.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en producción: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD o entornos de desarrollo para generar, revisar y corregir código, aprovechando su orientación a SWE-bench y terminal-bench.
- Agentes autónomos de terminal: con 262.144 tokens de contexto y soporte de tool calling, puede gestionar sesiones multi-paso de resolución de tareas en entornos de línea de comandos.
- Despliegue en hardware Blackwell de gama contenida: la cuantización NVFP4 de 23,8 GB permite servir el modelo en una DGX Spark (GB10) con memoria unificada, manteniendo coherencia y capacidades de código según las pruebas del autor.
- Razonamiento matemático y analítico: el modo thinking y el rendimiento medido en cargas de matemáticas (119 tok/s con DFlash en DGX Spark) lo hacen adecuado para asistentes de análisis cuantitativo.
- Procesamiento multimodal documento-imagen: la torre visual en BF16 permite tareas de imagen-texto, como extracción de información de capturas o diagramas, con hasta 4 imágenes y 2 vídeos por prompt.
- Investigación sobre alineación y seguridad: al ser un modelo abliterado, sirve para estudiar comportamientos sin rechazos en entornos controlados de evaluación de riesgos.
- Servicio de chat de alto throughput: con 539 tok/s agregados a concurrencia 32 en DGX Spark, es viable para atención al cliente o asistentes internos con múltiples usuarios concurrentes.

## Benchmarks y rendimiento

La model card proporciona datos de validación del autor (no benchmarks estándar publicados como MMLU o HumanEval):

| Metrica | BF16 parent | NVFP4 |
|---|---|---|
| Agentic/coding pass@1 (sonda propia de 18 tareas) | 0,833 (15/18) | 0,833 (15/18) |
| Rechazos (prompts dañinos diversos) | 0 | 0 |
| Coherencia (generación larga) | limpia | 0/10 degenerados |

Rendimiento medido en DGX Spark (GB10), decodificación simple NVFP4:

| Concurrencia | c=1 | c=8 | c=16 | c=32 |
|---|---|---|---|---|
| tok/s agregados | 39 | 221 | 376 | 539 |

Con decodificación especulativa DFlash (single-stream):

| num_speculative_tokens | 4 | 6 | 8 | 11 |
|---|---|---|---|---|
| tok/s c=1 | 67,5 | 73,8 (1,89×) | 69,3 | 66,7 |

Comparativa de cargas en DGX Spark (single-stream):

| Carga | BF16 stock vLLM | NVFP4 stock vLLM | NVFP4 + DFlash AEON |
|---|---|---|---|
| Coding | 30,8 tok/s · 237 ms | 38,5 · 70 ms | 77,1 · 94 ms |
| Reasoning | 30,6 · 247 ms | 38,4 · 77 ms | 107,0 · 93 ms |
| Math | 30,5 · 221 ms | 38,3 · 72 ms | 119,0 · 88 ms |
| Prose | 30,4 · 193 ms | 38,3 · 69 ms | 70,3 · 91 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 23,8 GB, por lo que se requiere al menos ~24 GB de memoria para los pesos, más espacio para KV cache y activaciones.
- GPU recomendadas: NVIDIA Blackwell exclusivamente para NVFP4 (B200 / sm_100 o GB10 / sm_120). No funciona en GPUs anteriores (Ampere, Hopper, Ada) para esta cuantización.
- Cabe en consumer GPU: no disponible; las GPUs consumer actuales no son Blackwell con soporte NVFP4 según la información proporcionada.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` (comando de la model card), compatible con transformers; decodificación especulativa DFlash con drafter Qwen3.6-35B-A3B.
- Latencia y throughput: TTFT ≈ 65 ms a c=1 en DGX Spark; 39 tok/s a c=1 y 539 tok/s agregados a c=32; hasta 73,8 tok/s single-stream con DFlash n=6.
- En memoria unificada (DGX Spark) se recomienda `--gpu-memory-utilization` entre 0,6 y 0,7; por encima de ~0,8 el pool compartido CPU+GPU provoca page thrashing.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4 | 35,1B (MoE) | 262.144 | MIT | Hugging Face, vLLM Blackwell | Cuantización NVFP4 abliterada |
| Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16 | 35,1B (MoE) | no disponible | MIT | Hugging Face | Modelo base BF16, mayor tamaño |
| deepreinforce-ai/Ornith-1.0-35B | 35B (MoE) | no disponible | MIT (según license_link) | Hugging Face | Modelo original con alineación |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | no disponible | Hugging Face | Base del post-train; drafter DFlash compatible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: los rechazos han sido eliminados deliberadamente, lo que implica que puede generar contenido dañino o inapropiado; no es adecuado para despliegues públicos sin filtros externos.
- Requiere hardware Blackwell (B200 o GB10) para NVFP4; no es ejecutable en GPUs anteriores.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado tasas de alucinación.
- Idiomas soportados no especificados; el rendimiento multilingüe no está documentado.
- La validación de capacidades se basa en una sonda propia de 18 tareas del autor, no en benchmarks estándar independientes.
- En memoria unificada, una configuración de `--gpu-memory-utilization` superior a ~0,8 provoca page thrashing.
- La licencia MIT se aplica según la model card, pero el `license_link` apunta al LICENSE de deepreinforce-ai/Ornith-1.0-35B; conviene verificar los términos antes de uso comercial.
- El contexto de 262.144 tokens debe confirmarse en despliegue real; no se detalla en la información si es el máximo nativo del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-NVFP4
- Modelo base BF16: https://huggingface.co/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored-BF16
- Modelo original: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B
- Licencia: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B/blob/main/LICENSE
- Guía DGX Spark: https://github.com/AEON-7/Ornith-1.0-35B-AEON-Ultimate-Uncensored/blob/main/QUICKSTART_DGX_SPARK.md
- llm-compressor: https://github.com/vllm-project/llm-compressor
