# EigenLabs/Qwen3.5-35B-A3B-MLX-VL-4bit-g64

## Resumen

EigenLabs/Qwen3.5-35B-A3B-MLX-VL-4bit-g64 es una conversión MLX (Apple Silicon) del modelo vision-language Qwen/Qwen3.5-35B-A3B, cuantizada en 4 bits con grupo de 64 (affine W4/g64). El modelo original es un MoE de 35B parámetros totales con 3B activos por token, que incorpora un vision tower en BF16 sin cuantizar y un módulo MTP (multi-token prediction) también cuantizado a W4/g64. Esta conversión está pensada para ejecutar inferencia de texto e imagen de forma eficiente en hardware Apple Silicon mediante la librería `mlx-vlm`, y el payload MTP inline está dirigido a runtimes que implementen Qwen3.5 MTP, como el motor MLX-Swift de Darkbloom.

La relevancia de este artefacto reside en que combina un modelo MoE de última generación con cuantización agresiva (4.647 bits efectivos por peso) y un vision tower en BF16, todo en formato MLX nativo. El autor reporta un benchmark local en un Apple M4 Max con prefill de 1.642 tok/s y decode de 113 tok/s, con un pico de memoria de 23,25 GB. El modelo se distribuye bajo licencia Apache 2.0 y el repositorio incluye manifiestos de cuantización, verificación y checksums para auditoría.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con vision tower y MTP |
| Parametros totales | 35B (modelo base); 5.995.254.448 pesos cuantizados en safetensors |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit con group size 64 (W4/g64), vision tower en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (5 shards) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 35B parámetros totales y 3B activos por token, basado en el modelo Qwen3.5-35B-A3B. La conversión MLX cuantiza todos los módulos cuantificables (512 módulos W4/g64, incluidos los routers de los expertos) y mantiene el vision tower en BF16 sin cuantizar (333 tensores, 446.571.248 parámetros). El módulo MTP completo (785 tensores fuente, 844.640.768 parámetros) se serializa en 46 tensores MLX cuantizados W4/g64, reutilizando el embedding y el LM head del modelo base.

La cuantización es affine con group size 64, sin overrides de 8 bits en routers. El conversor reporta 4.647 bits efectivos por peso de peso después de incluir escalas, biases y el vision tower sin cuantizar. No se han publicado detalles sobre el dataset de entrenamiento o el proceso de alineamiento (RLHF/DPO) porque es una conversión de pesos, no un entrenamiento original.

## Capacidades

- Generación de texto multimodal (image-text-to-text) con entrada de imágenes y texto.
- Soporte de visión-language: acepta imágenes como entrada adicional al prompt.
- MTP (multi-token prediction) integrado en el artefacto, diseñado para runtimes que lo implementen (por ejemplo, MLX-Swift de Darkbloom).
- Inferencia eficiente en Apple Silicon gracias a la cuantización 4-bit y al formato MLX nativo.
- Integración con `mlx-vlm>=0.6.12` para generación estándar de texto e imagen.
- Compatible con el chat template oficial de Qwen3.5 (byte-idéntico al original).

## Casos de uso

- Inferencia VLM local en Macs Apple Silicon: el modelo permite ejecutar un VLM de 35B MoE con 3B activos en un M4 Max con pico de memoria de 23,25 GB, adecuado para tareas de captioning o respuesta a preguntas visuales en equipos de gama alta.
- Desarrollo de aplicaciones de visión por computadora: integrable en pipelines de generación de descripciones de imágenes, análisis de documentos escaneados o asistencia visual en entornos sin conexión.
- Investigación en cuantización y eficiencia: el artefacto incluye manifiestos de cuantización y verificación, útil para estudiar el impacto de W4/g64 en modelos MoE multimodales.
- Prototipado de agentes con razonamiento multi-paso: aunque no se especifica tool calling, la arquitectura MoE con 3B activos permite ejecutar agentes conversacionales con contexto de imagen en hardware moderado.
- Evaluación de rendimiento de inferencia en Apple Silicon: el benchmark local (prefill 1.642 tok/s, decode 113 tok/s en M4 Max) sirve como referencia para comparar con otras conversiones MLX.
- Desarrollo de sistemas de respuesta visual en tiempo real: con latencia de decode de ~113 tok/s, es viable para asistentes que procesan imágenes y responden con texto en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es un benchmark local de inferencia en Apple M4 Max con `mlx-vlm 0.6.15`:

| Metric | Median | Mean | Range |
|---|---|---|---|
| Prefill (tok/s) | 1.642,06 | 1.642,60 | 1.641,14–1.644,61 |
| Decode (tok/s) | 113,67 | 112,22 | 109,23–113,75 |
| Peak memory (GB) | 23,25 | — | — |

Estas mediciones corresponden a generación greedy (temperature 0.0) con un prompt de 1.701 tokens y 128 tokens generados, con MTP desactivado. Son medidas locales, no garantías de rendimiento en otros dispositivos.

## Requisitos de hardware

- VRAM estimada: 23,25 GB de pico de memoria en Apple M4 Max (según benchmark local), lo que implica que se necesita un Mac con al menos 32 GB de RAM unificada para ejecutar el modelo cómodamente.
- GPU recomendadas: Apple Silicon (M4 Max, M3 Max, M2 Ultra, etc.) con 32 GB o más de RAM unificada. No está diseñado para GPUs NVIDIA/AMD en formato MLX.
- En consumer GPU: no aplica directamente, ya que MLX es específico de Apple Silicon. Para GPUs NVIDIA habría que usar otra conversión (por ejemplo, GGUF o EXL2).
- Opciones de despliegue: `mlx-vlm>=0.6.12` para generación local, y el motor MLX-Swift de Darkbloom para runtimes que implementen MTP. También se puede usar `mlx_vlm.generate` desde CLI.
- Latencia y throughput: prefill de ~1.642 tok/s y decode de ~113 tok/s en M4 Max (mediciones locales, sin MTP activo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (base) | 35B (3B activos) | no disponible | BF16 | Apache 2.0 | Modelo original, no cuantizado, requiere mucha más VRAM |
| EigenLabs/Qwen3.5-35B-A3B-MLX-VL-4bit-g64 | 35B (3B activos) | no disponible | MLX W4/g64 | Apache 2.0 | Conversión MLX con visión y MTP, benchmark local en M4 Max |
| mlx-community/Qwen3.5-35B-A3B-4bit | 35B (3B activos) | no disponible | MLX 4-bit | Apache 2.0 | Conversión MLX estándar sin visión ni MTP |

La comparativa se limita a conversiones MLX del mismo modelo base; no se dispone de datos de benchmarks comparativos entre ellas. La variante de EigenLabs se distingue por incluir el vision tower en BF16 y el MTP cuantizado, mientras que la de mlx-community es una conversión de texto puro.

## Limitaciones y advertencias

- No se ha verificado la salida de imagen pixel-grounded para esta conversión exacta; la verificación se limita a la inferencia de texto.
- El MTP no se ha validado en términos de paridad de tokens especulativos ni de speedup real; el benchmark local se realizó sin MTP activo.
- La inferencia de video no está verificada.
- No se ha evaluado la calidad a nivel de población tras la cuantización; los benchmarks estándar (MMLU, etc.) no están disponibles.
- El modelo requiere al menos 32 GB de RAM unificada en Apple Silicon; no funciona en GPUs NVIDIA sin conversión adicional.
- El artefacto no incluye un driver Python para el MTP, solo el payload serializado; se requiere un runtime externo (MLX-Swift) para aprovecharlo.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base Qwen3.5-35B-A3B por si hay restricciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/EigenLabs/Qwen3.5-35B-A3B-MLX-VL-4bit-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Variante con router8: https://huggingface.co/EigenLabs/Qwen3.6-35B-A3B-MLX-VL-4bit-g64-router8
- Guía MLX en Apple Silicon (2026): https://willitrunai.com/blog/qwen-3-5-mlx-apple-silicon-guide
- Análisis Qwen 3.5: https://localclaw.io/blog/qwen35-deep-dive
- Variante mlx-community (ModelScope): https://www.modelscope.cn/models/mlx-community/Qwen3.5-35B-A3B-4bit
