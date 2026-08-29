# JANGQ-AI/GLM-5.3-FP8

## Resumen

GLM-5.3-FP8 es una cuantización en precisión FP8 E4M3 del modelo GLM-5.3 de Z.ai, realizada por JANGQ-AI. El modelo original, de arquitectura GLM-MoE-DSA, ocupa aproximadamente 1,5 TB en BF16; esta versión lo reduce a unos 756 GB en disco, manteniendo el mismo esquema de cuantización que el release oficial FP8 de Z.ai y el formato block-FP8 de DeepSeek-V3. Está pensado para ejecutarse de forma nativa en GPUs Hopper (H100/H200) mediante vLLM, sin necesidad de hardware Blackwell.

La cuantización es weight-only con escalas estáticas por bloques de 128×128 y activaciones dinámicas, lo que elimina la necesidad de un conjunto de calibración. Incluye la capa de multi-token prediction (MTP) y cubre el mismo conjunto de tensores cuantizados que la versión oficial FP8, verificado 1:1 contra el índice del modelo BF16. Es una opción práctica para desplegar GLM-5.3 en entornos de producción con múltiples GPUs Hopper, reduciendo el uso de memoria y ancho de banda sin cambiar la arquitectura subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-MoE-DSA (MoE con 256 expertos enrutados top-8, 1 experto compartido, MLA + DeepSeek Sparse Attention, MTP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE, no se especifica) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 E4M3 block-128, weight-only con escalas estáticas por bloque y activaciones dinámicas |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (licencia propia de Z.ai) |
| Formato de pesos | safetensors (inferido de la estructura de shards, 282 shards) |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una conversión del checkpoint BF16 de `zai-org/GLM-5.3` al formato FP8. La arquitectura base es GLM-MoE-DSA: un transformer con 78 capas, atención MLA (Multi-head Latent Attention) combinada con DeepSeek Sparse Attention (DSA), 256 expertos enrutados con top-8 y un experto compartido, más una cabeza de multi-token prediction (MTP) en la capa 78. El modelo original fue desarrollado por Z.ai y, según su documentación, usa el mismo modelo base que GLM-5.2, con todas las mejoras introducidas mediante post-entrenamiento (RLHF/DPO u otros métodos no especificados).

La cuantización se realizó con un conversor streaming que procesa un tensor a la vez, sin necesidad de GPU ni grandes cantidades de RAM. El esquema es idéntico al release oficial FP8 de Z.ai: pesos en FP8 E4M3 con escalas inversas en FP32 por bloques de 128×128, y cuantización dinámica de activaciones en tiempo de ejecución. No se usó calibración, por lo que el proceso es data-free. El `config.json` resultante es una copia verbatim del oficial, lo que garantiza que vLLM lo trate exactamente igual que la versión upstream.

## Capacidades

- Generación de texto y razonamiento complejo, con especial énfasis en tareas de ingeniería de software y agentes de largo horizonte (según la documentación de Z.ai).
- Soporte de contexto largo de hasta 1M de tokens, gracias a la combinación de MLA y DeepSeek Sparse Attention.
- Capacidades multilingües limitadas a inglés y chino (en, zh).
- Incluye la capa MTP, que permite decodificación especulativa en vLLM para acelerar la generación.
- No se especifica explícitamente soporte de tool calling o function calling, pero al estar orientado a agentes es probable que lo herede del modelo base.
- No se mencionan capacidades de visión, audio u otras modalidades; es un modelo de texto puro.

## Casos de uso

- Despliegue de GLM-5.3 en producción con GPUs Hopper: al ser FP8, reduce el uso de VRAM y ancho de banda, permitiendo servir el modelo en 8× H200 o H100 con vLLM y tensor parallelism.
- Generación de código a gran escala: el modelo base destaca en coding complejo (mejora del 50% sobre GLM-5.2 en benchmarks internos de Z.ai), por lo que esta cuantización es adecuada para entornos de desarrollo asistido por IA con alta concurrencia.
- Agentes autónomos de largo plazo: con 1M de contexto y capacidades de razonamiento multi-paso, puede mantener estado y ejecutar tareas extensas sin perder el hilo.
- Análisis de repositorios completos: la ventana de 1M tokens permite procesar código fuente de proyectos grandes en una sola pasada, útil para revisión de código, detección de vulnerabilidades o refactorización.
- Atención al cliente multilingüe (en/zh): puede gestionar conversaciones largas con historial extenso, aunque limitado a dos idiomas.
- Investigación en eficiencia de inferencia: al ser una cuantización FP8 con el mismo esquema que DeepSeek-V3, sirve como referencia para estudiar el impacto de FP8 en modelos MoE de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de Z.ai menciona mejoras cualitativas sobre GLM-5.2 en coding y tareas de largo horizonte, pero no se proporcionan cifras concretas en la model card ni en los resultados de búsqueda. No se deben inferir números sin fuente verificable.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa ~756 GB en disco en FP8. Para inferencia, se requiere al menos esa cantidad de memoria GPU distribuida. Con 8× H200 (141 GB cada una) se dispone de ~1,1 TB, suficiente. Con 8× H100 de 80 GB se tendrían 640 GB, insuficiente; probablemente se necesiten H100 NVL de 94 GB o más.
- GPUs recomendadas: 8× H200 o H100 (Hopper) con vLLM y tensor parallelism. No es compatible con GPUs de consumo (RTX, etc.) por el tamaño y el esquema FP8 block-128.
- Opciones de despliegue: vLLM es la opción principal (comando `vllm serve` con `--tensor-parallel-size 8`). También podría usarse con transformers, pero no se documenta.
- Latencia y throughput: no disponible. Se puede habilitar decodificación especulativa con MTP para mejorar la velocidad de generación, según la documentación de vLLM.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Tamaño (disco) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JANGQ-AI/GLM-5.3-FP8 | GLM-MoE-DSA (MoE, 78 capas, 256 expertos) | 1M | ~756 GB (FP8) | glm-5.3 | HuggingFace |
| zai-org/GLM-5.3 (BF16) | GLM-MoE-DSA | 1M | ~1,5 TB (BF16) | glm-5.3 | HuggingFace |
| zai-org/GLM-5.3-Flash | Híbrida (sparse + linear attention) | 1M (presumible) | no disponible | glm-5.3 | HuggingFace |
| DeepSeek-V3 (FP8) | MoE con MLA + DSA | 128K | ~600 GB (FP8) | MIT (modelo) | HuggingFace |

La comparativa se basa en características públicas. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Al ser una cuantización FP8, puede haber una ligera pérdida de precisión respecto al BF16 original, aunque el esquema block-128 con escalas dinámicas minimiza el impacto.
- La licencia `glm-5.3` es propietaria de Z.ai; es necesario revisar sus términos para uso comercial, especialmente en cuanto a redistribución y uso en productos.
- Solo soporta inglés y chino; no es adecuado para otros idiomas sin adaptación.
- El tamaño del modelo (~756 GB) requiere infraestructura de múltiples GPUs de alta gama, lo que limita su uso a entornos con presupuesto elevado.
- No se han publicado benchmarks independientes que verifiquen el rendimiento de esta cuantización específica.
- La capa MTP está incluida, pero su uso requiere configuración adicional en vLLM; si no se activa, no aporta beneficio.
- El proceso de cuantización es data-free, pero no se ha validado en todos los escenarios de uso; se recomienda probar en el dominio de aplicación antes de producción.

## Enlaces

- [HuggingFace - JANGQ-AI/GLM-5.3-FP8](https://huggingface.co/JANGQ-AI/GLM-5.3-FP8)
- [HuggingFace - zai-org/GLM-5.3 (BF16)](https://huggingface.co/zai-org/GLM-5.3-BF16)
- [HuggingFace - zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [Documentación de Z.ai sobre GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3)
- [GitHub - zai-org/GLM-5](https://github.com/zai-org/GLM-5)
- [Sitio de JANGQ-AI](https://jangq.ai/)
