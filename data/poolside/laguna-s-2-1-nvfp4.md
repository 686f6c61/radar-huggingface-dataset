# poolside/Laguna-S-2.1-NVFP4

## Resumen

Laguna S 2.1-NVFP4 es una versión cuantizada del modelo Laguna S 2.1, desarrollado por poolside, una empresa que entrena modelos desde cero con infraestructura y datos propios. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 117.6B parámetros totales y 8.5B activos por token, diseñado específicamente para tareas de codificación agéntica y trabajo de horizonte largo en una máquina local.

La versión NVFP4 presenta los pesos cuantizados a 4 bits en formato NVFP4, lo que reduce el tamaño del modelo a aproximadamente 71 GB, permitiendo su ejecución en estaciones de trabajo con una sola GPU de gama alta. El modelo destaca por su ventana de contexto nativa de 1,048,576 tokens (1M), soporte de razonamiento intercalado con llamadas a herramientas, y una arquitectura de atención híbrida con ventana deslizante que reduce los requisitos de KV cache.

Esta versión actualizada (agosto de 2026) sustituye a un checkpoint anterior y es relevante porque democratiza el acceso a un modelo de 118B con capacidades de agente de codificación de alto nivel, ejecutable en hardware local, con licencia OpenMDW-1.1 que permite uso comercial y no comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida: 36 capas con Sliding Window Attention (SWA) y 12 capas con atención global |
| Parametros totales | 117.561.977.600 (117.6B) |
| Parametros activos | 8.5B por token |
| Longitud de contexto | 1,048,576 tokens (1M), configurable a 262,144 (256K) |
| Tipos de cuantizacion | NVFP4 (4 bits), BF16, Q4_K_M (via llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (NVFP4), GGUF (via llama.cpp) |

## Arquitectura y entrenamiento

Laguna S 2.1 utiliza una arquitectura MoE con 256 expertos y 1 experto compartido, distribuidos en 48 capas. La innovación principal reside en su diseño de atención híbrida: 36 de las 48 capas emplean Sliding Window Attention con una ventana de 512 tokens, mientras que las 12 restantes usan atención global. Esta combinación, gestionada mediante gating por cabeza con softplus y escalas rotativas por capa, permite reducir significativamente los requisitos de memoria de KV cache manteniendo la capacidad de modelar dependencias de largo alcance.

El entrenamiento incluyó fases de pre-entrenamiento, post-entrenamiento y reinforcement learning, con el optimizador Muon. El modelo incorpora una etapa de extensión de contexto largo hasta 1,048,576 tokens, y la cuantización NVFP4 fue calibrada en la configuración de 1M de contexto. La KV cache se cuantiza a FP8, reduciendo aún más la memoria por token. El modelo soporta razonamiento intercalado entre llamadas a herramientas, con capacidad de preservar el pensamiento intermedio y de habilitar o deshabilitar el modo thinking por petición.

## Capacidades

- Generación de texto y razonamiento avanzado con soporte nativo de modo thinking intercalado entre llamadas a herramientas.
- Codificación agéntica: diseñado para tareas de programación autónoma de horizonte largo, incluyendo resolución de issues, refactorización y navegación de codebases.
- Tool calling / function calling robusto, con interleaved thinking entre llamadas.
- Soporte de agentes y multi-step reasoning, con preservación del pensamiento intermedio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Ventana de contexto de 1M tokens nativa, sin necesidad de interpolación de RoPE.
- KV cache en FP8 para reducir memoria por token.
- Cuantización NVFP4 que permite ejecución local en hardware de gama alta.

## Casos de uso

- Resolución autónoma de issues en repositorios de código: el modelo puede navegar un codebase completo dentro de su ventana de 1M tokens, identificar el problema y generar un parche, como demuestra su rendimiento en SWE-bench Multilingual (78.5%).
- Asistente de programación en entornos locales: con 71 GB de pesos NVFP4, puede ejecutarse en una estación de trabajo con GPU de 80 GB (como DGX Spark o RTX 6000 Ada), ofreciendo asistencia de codificación sin depender de APIs externas.
- Automatización de tareas de terminal: su puntuación de 70.2% en Terminal-Bench 2.1 indica capacidad para ejecutar comandos, interpretar salidas y completar tareas administrativas complejas.
- Agente de análisis de codebases: con 46.2% en SWE Atlas (Codebase QnA), puede responder preguntas sobre arquitectura de software y localizar código relevante en proyectos extensos.
- Desarrollo de software con herramientas externas: soporta tool calling con razonamiento intercalado, permitiendo integración con editores, linters, compiladores y sistemas de control de versiones en pipelines de CI/CD.
- Investigación en agentes de IA: al ser open-source con licencia permisiva, sirve como base para experimentación en agentes de largo horizonte, multi-step reasoning y evaluación de modelos de codificación.

## Benchmarks y rendimiento

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | **70.2%** | **78.5%** | **59.4%** | **40.4%** | **46.2%** | **49.7%** |
| Tencent Hy3 | 295B-A21B | 71.7% | 75.8% | 57.9% | - | - | - |
| Inkling | 975B-A41B | 63.8% | - | 54.3% | - | - | 45.5%* |
| Nemotron 3 Ultra | 550B-A55B | 56.4% | 67.7% | - | - | - | 34.3%* |
| DeepSeek-V4-Pro Max | 1.6T-A49B | 64.0%* | 76.2% | 55.4% | 9.0%* | 27.2%* | 55.9%* |
| Qwen 3.7 Max | - | 74.5%* | 78.3% | 60.6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61.5% | 53.3% | 42.2%* | 75.6% |

Benchmarks a fecha de 21 de julio de 2026. Las puntuaciones marcadas con * son reportadas por terceros. Fuente: model card oficial de poolside. No se han publicado resultados de benchmarks para la versión NVFP4 específicamente, pero se espera que sean equivalentes a los del modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 71 GB para los pesos NVFP4, más overhead de KV cache y activaciones. Con KV cache en FP8 y SWA, el requisito total se estima en 80-90 GB para contexto de 1M.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB unificados), RTX 6000 Ada (48 GB, requiere contexto reducido), A100 80GB, H100 80GB. Para contexto completo de 1M se recomienda al menos 80 GB de VRAM.
- Consumer GPU: no cabe en GPUs de consumo de 24 GB (RTX 4090) con contexto completo, pero podría ejecutarse con contexto muy reducido o usando GGUF Q4_K_M con capas parciales en CPU.
- Opciones de despliegue: vLLM (versión 0.25.0 o superior), llama.cpp (solo BF16 y Q4_K_M), Ollama (con soporte MLX), Transformers, TRT-LLM. No compatible con SGLang.
- Latencia y throughput: no disponible en la información proporcionada. El diseño SWA con 8.5B parámetros activos sugiere una latencia de generación significativamente menor que modelos densos de tamaño similar.
- Decodificación especulativa opcional: se puede emparejar con el modelo borrador poolside/Laguna-S-2.1-DFlash-NVFP4 para acelerar la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Destacado |
|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | 1M | OpenMDW-1.1 | Mejor equilibrio rendimiento/tamaño, ejecutable local |
| Tencent Hy3 | 295B-A21B | no disponible | no disponible | Superior en Terminal-Bench (71.7%) pero 2.5x mas parametros |
| DeepSeek-V4-Pro Max | 1.6T-A49B | no disponible | no disponible | Inferior en casi todos los benchmarks a pesar de ser 13x mas grande |
| Qwen 3.7 Max | no disponible | no disponible | no disponible | Similar en SWE-bench (78.3%) pero superior en Terminal-Bench (74.5%) |

Laguna S 2.1 ofrece el mejor ratio rendimiento-por-parametro de su categoria, superando a modelos significativamente mas grandes en la mayoria de benchmarks de codificacion agéntica. Su principal ventaja competitiva es la combinacion de 1M de contexto nativo con un tamaño que permite despliegue local.

## Limitaciones y advertencias

- La version NVFP4 no es compatible con SGLang; requiere vLLM 0.25.0 o superior para un funcionamiento correcto con tool calling.
- Con vLLM anterior a 0.25.0, el tool calling falla produciendo "token salad" y tool_calls ilegibles.
- A contexto largo (1M tokens) puede experimentarse degradacion de calidad en la generacion.
- Los idiomas soportados no estan documentados en la informacion proporcionada.
- No se dispone de informacion sobre sesgos o riesgos de alucinacion especificos de este modelo.
- La licencia OpenMDW-1.1 permite uso comercial, pero se recomienda revisar los terminos completos en openmdw.ai.
- El modelo requiere re-descarga si se obtuvo una version anterior del checkpoint, ya que los pesos han cambiado.
- Para contexto de 1M se recomienda una GPU con al menos 80 GB de VRAM; en hardware inferior habra que reducir la ventana de contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Coleccion Laguna S 2.1: https://huggingface.co/collections/poolside/laguna-s-21
- Blog de presentacion: https://poolside.ai/blog/introducing-laguna-s-2-1
- Pagina de modelos de poolside: https://poolside.ai/models
- Trajectorias de evaluacion: https://trajectories.poolside.ai
- Uso en OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Uso en Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Modelo borrador para decodificacion especulativa: https://huggingface.co/poolside/Laguna-S-2.1-DFlash-NVFP4
- Guia de despliegue en DGX Spark: https://github.com/Weschera/Laguna-S-2.1-NVFP4-1x-DGX-Spark
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/25165
- Licencia OpenMDW: https://openmdw.ai/
