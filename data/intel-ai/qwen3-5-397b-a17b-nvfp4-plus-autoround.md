# intel-ai/Qwen3.5-397B-A17B-NVFP4-Plus-AutoRound

## Resumen

Este repositorio contiene una versión cuantizada a NVFP4+ (también denominada uNVFP4) del modelo multimodal Qwen3.5-397B-A17B de Alibaba Qwen, publicada por el equipo de Intel AI mediante la herramienta AutoRound. Se trata de un checkpoint de 4 bits orientado a la inferencia eficiente en hardware Blackwell de NVIDIA, donde el formato FP4 nativo permite reducir el espacio en memoria y aumentar el throughput sin degradar de forma significativa la calidad respecto al modelo original en BF16.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con arquitectura híbrida que combina capas de atención estándar y capas de atención lineal, además de un módulo de predicción multi-token (MTP) y una torre de visión que lo habilita para tareas image-text-to-text. Con aproximadamente 403.400 millones de parámetros totales y un subconjunto activo por token mucho menor, está diseñado para cargas de trabajo de razonamiento, código y comprensión multimodal de gran escala.

La relevancia de esta ficha radica en que demuestra la viabilidad de cuantizar a W4A4 un modelo de casi 400.000 millones de parámetros conservando en torno al 99 % del rendimiento del BF16 en los benchmarks publicados, lo que reduce el requisito de memoria de ~800 GB en BF16 a unos 215 GiB. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el despliegue exige stacks de inferencia con soporte específico para NVFP4+ con escalas de bloque E5M3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (atención estándar + atención lineal) con torre de visión y módulo MTP; clase `qwen3_5_moe` |
| Parametros totales | 403.397.928.944 (~403,4B) |
| Parametros activos | no disponible (el modelo base es MoE, pero la model card no detalla el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4+ (W4A4): pesos y activaciones en FP4 E2M1, escala de bloque FP8 E5M3 con grupo de 16, sin escala global tensor-wise; escalado dinámico por bloque en activaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato de empaquetado `auto_round:llm_compressor_nvfp4_e5m3` (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-397B-A17B es un transformer de mezcla de expertos que incorpora capas de atención lineal junto a capas de atención convencional, un módulo de predicción multi-token (MTP) y una torre de visión para entrada de imágenes. Esta versión cuantizada no ha sido reentrenada: se ha generado mediante cuantización post-entrenamiento con el algoritmo model-free OPT-RTN de AutoRound 0.16.0, que optimiza el redondeo de pesos mediante descenso de gradiente con signo (paper arXiv:2309.05516) sin necesidad de datos de calibración.

La cuantización afecta a 94.079 módulos lineales de `model.language_model.layers` y `mtp.layers`, incluyendo expertos enrutados, expertos compartidos, proyecciones de atención, proyecciones de atención lineal y las capas FC/atención del MTP, lo que suma aproximadamente 400,75B parámetros cuantizados. Se mantienen en BF16 el router (`mlp.gate`), `mlp.shared_expert_gate`, `in_proj_a`/`in_proj_b`, `lm_head`, los embeddings y la torre de visión (~2,64B parámetros), y en F32 `linear_attn.norm`. La caché KV y las operaciones de softmax/SDPA de atención no se cuantizan. El tamaño de release es de ~214,9 GiB.

## Capacidades

- Generación de texto y razonamiento multi-step, heredados del modelo base Qwen3.5.
- Comprensión image-text-to-text: la torre de visión se conserva en BF16, por lo que el modelo acepta entradas de imagen y texto.
- Generación de código y resolución de problemas matemáticos (evaluado en GSM8K y MMLU).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: el módulo MTP sugiere decodificación especulativa integrada, aunque no se detalla su uso en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Razonamiento matemático a gran escala: con una recuperación del 99,46 % en GSM8K respecto al BF16, es adecuado para pipelines de resolución de problemas aritméticos y verificación de cálculos en producción.
- Comprensión de documentos con imágenes: al conservar la torre de visión en BF16, puede procesar capturas, diagramas y documentos escaneados junto con texto para extracción de información estructurada.
- Evaluación de conocimiento general: su recuperación del 99,25 % en MMLU lo hace viable como modelo de referencia en tareas de question answering y clasificación de conocimiento.
- Despliegue en clústeres con GPU Blackwell: el formato NVFP4 nativo permite servir un modelo de ~400B en aproximadamente 215 GiB, reduciendo el número de GPU necesarias frente a un despliegue BF16.
- Investigación en cuantización: sirve como caso de estudio reproducible de cuantización W4A4 con AutoRound sobre un MoE multimodal de gran escala, con scripts de generación documentados.
- Inferencia de alto throughput con vLLM: el checkpoint está pensado para `vllm serve`, lo que facilita su integración en servicios de API compatibles con endpoints.
- Generación de código asistida: aunque no hay benchmark específico de código en la model card, las capacidades del modelo base y el soporte de tool calling (si se confirma en el base) permiten integrarlo en asistentes de desarrollo.

## Benchmarks y rendimiento

| Benchmark | BF16 | NVFP4+ | Recuperación |
|---|---:|---:|---:|
| GSM8K | 97,65 | 97,12 | 99,46 % |
| MMLU | 88,56 | 87,90 | 99,25 % |
| PIQA | 83,03 | 82,48 | 99,34 % |
| HellaSwag | 74,23 | 72,67 | 97,90 % |
| **Media** | **85,87** | **85,04** | **99,04 %** |

La pérdida media frente a BF16 es del 0,96 %. No se han publicado resultados de benchmarks de código, matemáticas avanzadas ni evaluación multimodal en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~215 GiB para los pesos en NVFP4+ (tamaño de release ~214,9 GiB), más la caché KV y activaciones, que no se cuantizan y añaden overhead según contexto y batch.
- GPU recomendadas: hardware NVIDIA Blackwell con soporte nativo de FP4 (por ejemplo, familia B200/GB200); el formato NVFP4+ con escalas E5M3 requiere un stack de inferencia compatible.
- GPU consumer: no cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB); se necesitan múltiples aceleradores de数据中心.
- Opciones de despliegue: vLLM (`vllm serve intel-ai/Qwen3.5-397B-A17B-NVFP4-Plus-AutoRound`) con una build de compressed-tensors/vLLM que soporte NVFP4+ con escalas de bloque E5M3. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-NVFP4-Plus-AutoRound | ~403,4B | NVFP4+ W4A4 | no disponible | Apache 2.0 | safetensors (auto_round) |
| Qwen/Qwen3.5-397B-A17B (base) | ~403,4B | BF16 | no disponible | Apache 2.0 | safetensors |
| Otras cuantizaciones del mismo base | ~403,4B | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación de rendimiento se limita a la recuperación frente al BF16 del propio modelo base.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; no debe usarse como fuente de verdad sin verificación.
- Riesgo de generar contenido sesgado, obsceno u ofensivo heredado de los datos de preentrenamiento y fine-tuning; se recomienda realizar pruebas de seguridad antes de desplegar.
- La cuantización introduce una pérdida media del 0,96 % en los benchmarks publicados, con mayor degradación en HellaSwag (2,10 % de pérdida).
- El checkpoint requiere un stack de inferencia específico (vLLM/compressed-tensors con soporte NVFP4+ y escalas E5M3); no es compatible con runtimes que solo soporten NVFP4 estándar o GGUF.
- La caché KV y las operaciones de atención no están cuantizadas, por lo que el ahorro de memoria no se extiende a contextos largos con batches grandes.
- Idiomas soportados y longitud de contexto no documentados en la model card; conviene verificar en la ficha del modelo base.
- La licencia Apache 2.0 no constituye asesoramiento legal; el autor recomienda consultar a un abogado antes de un uso comercial.
- El modelo tiene muy poca tracción en Hugging Face (12 descargas, 2 likes) en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- [Hugging Face: intel-ai/Qwen3.5-397B-A17B-NVFP4-Plus-AutoRound](https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-Plus-AutoRound)
- [Modelo base: Qwen/Qwen3.5-397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)
- [Repositorio AutoRound](https://github.com/intel/auto-round)
- [Intel Neural Compressor](https://github.com/intel/neural-compressor)
- [Paper AutoRound (arXiv:2309.05516)](https://arxiv.org/abs/2309.05516)
