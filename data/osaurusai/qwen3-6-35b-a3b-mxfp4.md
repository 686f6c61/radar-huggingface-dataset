# OsaurusAI/Qwen3.6-35B-A3B-mxfp4

## Resumen

Qwen3.6-35B-A3B-mxfp4 es una cuantización MXFP4 (Open Compute Project Microscaling FP4) del modelo Qwen3.6-35B-A3B de Alibaba, publicada por OsaurusAI para ejecución en Apple Silicon mediante la librería MLX. Se trata de un modelo de lenguaje multimodal de arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención completa, organizado como un Mixture of Experts (MoE) con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token. La cuantización reduce el peso en disco a 19,32 GB, lo que permite ejecutarlo en equipos con memoria unificada moderada.

El modelo conserva la torre de visión (un ViT de 27 capas) en fp16, por lo que mantiene capacidades de entrada de imagen además de texto. Su ventana de contexto nativa es de 262 144 tokens, ampliable hasta aproximadamente 1 millón con escalado YaRN. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. Esta versión cuantizada está pensada para desarrolladores que necesitan ejecutar un modelo de razonamiento y visión de alto rendimiento en hardware de Apple, con una degradación mínima gracias a la precisión MXFP4 y a overrides de 8 bits en los routers, que son críticos para la selección de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` — 40 capas decoder: 30 Gated DeltaNet (lineal) + 10 full-attention, 256 expertos enrutados + 1 experto compartido siempre activo |
| Parametros totales | 35 B (segun model card); recuento de safetensors del repo: 6,95 B (probablemente por la cuantizacion) |
| Parametros activos | ~3 B por token (segun model card) |
| Longitud de contexto | 262 144 tokens nativo; hasta ~1 M con YaRN |
| Tipos de cuantizacion | MXFP4 (E2M1 + escala E8M0, bloque 32) con overrides de 8 bits afines en routers y gates; vision tower en fp16 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida de atención: 30 de las 40 capas usan Gated DeltaNet, una variante de atención lineal con regla delta que mantiene memoria constante en la longitud de secuencia, mientras que las 10 restantes (una cada cuatro capas, según `full_attention_interval: 4`) usan atención softmax completa con una puerta sigmoide en la salida (`attn_output_gate: true`). El componente MoE activa 8 de 256 expertos enrutados por token, más un experto compartido siempre activo con puerta sigmoide. El router usa softmax-topk, no el esquema sigmoide de DeepSeek. La rotación parcial de embeddings afecta solo al 25% de la dimensión de cabeza (`partial_rotary_factor: 0.25`, `rope_theta = 1e7`), y se conservan los metadatos de posición multimodal (`mrope_section: [11, 11, 10]`).

Esta versión no es un entrenamiento nuevo, sino una cuantización del modelo original de Alibaba. OsaurusAI aplicó MXFP4 (especificación OCP, distinta de NVFP4) a todos los tensores de peso, manteniendo en fp16 las normas, los parámetros de estado de DeltaNet (`A_log`, `dt_bias`, `conv1d`) y la torre de visión. Los routers y las puertas del experto compartido se cuantizan a 8 bits afines con grupo 64 para preservar la precisión en la selección de expertos. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento conversacional con formato de chat Qwen (`im_start`/`im_end`) y conmutador de pensamiento controlado por plantilla (`enable_thinking`).
- Entrada de imagen (visión) mediante torre ViT de 27 capas preservada en fp16; soporta prompts de imagen única.
- Razonamiento multi-paso con modo de pensamiento activable o desactivable por petición.
- Atención híbrida que permite manejar secuencias muy largas (hasta 262 K nativos) con coste de memoria sublineal gracias a las capas Gated DeltaNet.
- Mixture of Experts con 256 expertos enrutados y un experto compartido, lo que reduce el coste de inferencia a ~3 B parámetros activos por token.
- Soporte de tool calling y function calling (heredado del modelo base Qwen 3.6, aunque no se detalla en la model card).
- Capacidades multilingües limitadas: la model card declara solo inglés, aunque el modelo base de Qwen suele ser multilingüe; no se confirma en esta versión.

## Casos de uso

- Asistentes conversacionales en Mac: el modelo puede ejecutarse localmente en Apple Silicon con `mlx-lm`, ofreciendo respuestas de razonamiento sin conexión a internet, ideal para prototipos y aplicaciones de escritorio.
- Análisis de documentos largos: gracias a su contexto nativo de 262 K tokens y a la atención lineal, puede procesar libros técnicos, informes o transcripciones completas en una sola pasada, resumiendo o extrayendo información sin truncar.
- Descripción y análisis de imágenes: con la torre de visión preservada, puede generar descripciones detalladas de imágenes, extraer texto de capturas o responder preguntas visuales, todo en local.
- Generación de código asistida: el modo de razonamiento permite descomponer problemas de programación en pasos, y el soporte de tool calling facilita la integración en editores o CLIs que invoquen funciones externas.
- Automatización de atención al cliente: con el conmutador de pensamiento, se puede configurar para responder de forma directa (sin razonamiento visible) en chatbots, manteniendo la calidad de un modelo de 35 B con bajo coste por token.
- Investigación en eficiencia de cuantización: al ser una implementación de referencia de MXFP4 en MLX, sirve para evaluar el impacto de la cuantización de 4 bits en modelos MoE híbridos, comparando con versiones fp16 o GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta versión cuantizada. Los resultados web mencionan benchmarks del modelo base Qwen3.6-35B-A3B, pero no se proporcionan cifras concretas en los enlaces consultados. Se recomienda consultar la documentación oficial de Qwen 3.6 para datos de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- Este repositorio está empaquetado para MLX, por lo que requiere Apple Silicon (M1 o posterior) con `mlx-lm >= 0.30.7` para texto y `mlx-vlm >= 0.4.4` para visión.
- Peso en disco: 19,32 GB en 5 shards. Se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo con margen para el contexto y el estado de atención.
- Para GPU NVIDIA, la versión GGUF del mismo modelo base (no este repo) cabe en una tarjeta de 24 GB: según la guía de insiderllm.com, la cuantización UD-Q4_K_M ocupa unos 24 GB y alcanza 157,66 tokens/s en una RTX 3090; la UD-Q3_K_M (16,6 GB) cabe en 16 GB con offload de KV.
- Opciones de despliegue: `mlx_lm.generate` para CLI, API de Python con `load`/`generate`, o integración en aplicaciones mediante la librería MLX. Para GPU NVIDIA, se puede usar llama.cpp u Ollama con los pesos GGUF del modelo base.
- Latencia y throughput: no se proporcionan datos específicos para esta versión MLX; el rendimiento dependerá del chip (M1 Pro, M2 Max, M3 Ultra, etc.) y de la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35 B totales, ~3 B activos | 262 K (hasta ~1 M YaRN) | MoE híbrido (Gated DeltaNet + full attention) | Apache 2.0 | safetensors (fp16) |
| Qwen3.6-35B-A3B-mxfp4 (este) | 35 B totales, ~3 B activos | 262 K (hasta ~1 M YaRN) | MoE híbrido cuantizado MXFP4 | Apache 2.0 | safetensors (MLX) |
| Qwen3.6-27B (dense) | 27 B | 262 K (hasta ~1 M YaRN) | Dense, atención completa | Apache 2.0 | safetensors |

La comparativa se limita a las variantes de la misma familia Qwen 3.6, ya que no se dispone de datos suficientes sobre otros modelos MoE comparables (como DeepSeek-V3 o Qwen3-30B-A3B) en la información proporcionada. La versión cuantizada ofrece el mismo contexto y arquitectura que el base, con un peso en disco un 50% menor, a costa de una posible pérdida de precisión en tareas sensibles a la cuantización.

## Limitaciones y advertencias

- La cuantización MXFP4 puede degradar ligeramente la calidad en tareas de razonamiento complejo o generación de código, a pesar de los overrides de 8 bits en routers; se recomienda validar en el caso de uso concreto.
- La model card declara solo inglés como idioma soportado; el uso en otros idiomas puede producir resultados inconsistentes.
- El modelo puede alucinar hechos o generar respuestas incorrectas, especialmente en modo de razonamiento con secuencias largas; no es adecuado para decisiones críticas sin supervisión humana.
- La ventana de contexto de 262 K tokens es nativa, pero el escalado a ~1 M con YaRN puede aumentar la latencia y el consumo de memoria; no se garantiza la calidad en toda la extensión.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales de uso en ciertos sectores (por ejemplo, alto riesgo); se debe revisar la documentación de Qwen 3.6.
- Este repositorio es específico para MLX; no es compatible directamente con vLLM, TGI u otros servidores de GPU NVIDIA sin convertir los pesos a otro formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OsaurusAI/Qwen3.6-35B-A3B-mxfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- ModelScope: https://www.modelscope.cn/models/OsaurusAI/Qwen3.6-35B-A3B-mxfp4/summary
- Guia de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Guia de ejecucion local de Qwen 3.6 35B MoE: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
- Sitio de OsaurusAI: https://osaurus.ai
