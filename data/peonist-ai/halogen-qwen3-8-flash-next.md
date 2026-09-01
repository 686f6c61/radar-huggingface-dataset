# peonist-ai/halogen-qwen3.8-flash-next

## Resumen

halogen-qwen3.8-flash-next es un checkpoint de pesos en formato propietario `.hgn` desarrollado por peonist-ai, pensado exclusivamente para el motor de inferencia halogen-flash-server sobre hardware AMD Strix Halo (gfx1151). Se trata de una versión cuantizada del modelo Qwen/Qwen3.8-Flash-Next, un modelo de 125 mil millones de parámetros con una tabla adicional de embeddings n-gram de 51 mil millones, que en precisión BF16 ocuparía 335 GiB y en FP8 173 GiB, demasiado para los 124 GB de memoria unificada del Strix Halo. Por eso, halogen aplica una cuantización de 4 bits como precondición de corrección, no como mera optimización.

La relevancia de este modelo radica en que demuestra cómo ejecutar un modelo de gran tamaño en un APU de gama alta con memoria unificada, mediante kernels escritos específicamente para ese silicio y un esquema de cuantización híbrido (Q4C-P para el trunk y expertos, FP8 para la tabla n-gram, BF16 para ciertas proyecciones). Incluye además un sidecar de calidad que re-cuantiza 723 tensores no experto de forma activation-aware y eleva a 8 bits los doce `o_proj`, lo que recupera gran parte de la pérdida de perplejidad. El checkpoint incorpora también la cabeza MTP (Multi-Token Prediction) para decodificación especulativa, que es byte-idéntica a la decodificación greedy serial.

El modelo no es cargable en transformers, vLLM ni llama.cpp; solo funciona montado dentro del contenedor halogen-flash-server, cuyo motor es de código cerrado. Está pensado para un caso de uso muy concreto: inferencia local de alta calidad en un único dispositivo AMD Strix Halo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivado de Qwen3.8-Flash-Next |
| Parametros totales | 125B (mas 51B de tabla n-gram, total 176B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-Flash soporta 1M tokens, no confirmado para esta variante) |
| Tipos de cuantizacion | Q4C-P (4-bit por grupos de columnas) para trunk y expertos; FP8 para tabla n-gram; BF16 para rank-1/conv1d/PLE; 8-bit para o_proj en sidecar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (derivado de Qwen3.8-Flash-Next, sujeto a la licencia del modelo base) |
| Formato de pesos | .hgn (propietario de halogen, no compatible con otros runtimes) |

## Arquitectura y entrenamiento

El modelo es una derivación cuantizada de Qwen3.8-Flash-Next, un modelo MoE de 125B parámetros con una tabla de embeddings n-gram de 51B. La cuantización fue realizada íntegramente por peonist-ai a partir de los pesos BF16 originales, sin importar cuantizaciones de terceros. El esquema de precisión es híbrido: el trunk y los expertos usan Q4C-P (4-bit con grupos por columna), la tabla n-gram se almacena en FP8 y se pagina en memoria en lugar de residir permanentemente, y las proyecciones rank-1, conv1d y PLE se mantienen en BF16. El sidecar de calidad re-cuantiza 723 tensores no experto con calibración activation-aware y sube los doce `o_proj` a 8 bits, lo que según el autor produce una pérdida estadísticamente indistinguible de las filas BF16 completas.

El checkpoint incluye la cabeza MTP (una capa Flash-Next completa con 512 expertos y su propio indexador) para decodificación especulativa. Esta cabeza solo propone tokens; el token final se emite únicamente si el trunk lo habría producido, garantizando que la salida sea byte-idéntica a la decodificación greedy serial. La decodificación especulativa está activada por defecto y puede desactivarse por petición. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, RLHF/DPO).

## Capacidades

- Generación de texto y razonamiento: al derivar de Qwen3.8-Flash-Next, hereda las capacidades del modelo base, aunque no se han verificado de forma independiente en esta variante.
- Decodificación especulativa con cabeza MTP: acelera la generación sin coste de calidad, con salida byte-idéntica a la decodificación greedy.
- Cuantización híbrida de alta calidad: el sidecar de calidad reduce la pérdida de perplejidad entre un 5 y un 9% respecto a la versión sin sidecar.
- Multimodalidad: el modelo base Qwen3.8-Flash es multimodal según QwenCloud, pero no se confirma que esta variante conserve dicha capacidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de alta calidad en AMD Strix Halo: el caso de uso principal. El modelo se monta en el contenedor halogen-flash-server y expone un endpoint compatible con OpenAI en el puerto 8731, permitiendo ejecutar un modelo de 125B en un dispositivo con 124 GB de memoria unificada.
- Desarrollo de aplicaciones de chat y asistencia en entornos sin conexión: gracias al endpoint OpenAI-compatible, se puede integrar en aplicaciones existentes que usen la API de OpenAI, sustituyendo el backend por este servidor local.
- Investigación sobre cuantización y eficiencia de memoria: el esquema de cuantización híbrida y el sidecar de calidad son un caso de estudio sobre cómo distribuir bits en modelos MoE de gran tamaño con restricciones de memoria.
- Evaluación de decodificación especulativa con MTP: la cabeza MTP integrada permite experimentar con decodificación especulativa en un modelo real, con la garantía de que la salida es idéntica a la greedy.
- Despliegue en entornos con requisitos de privacidad: al ser un servidor local, los datos no salen del dispositivo, lo que lo hace adecuado para aplicaciones que manejan información sensible.
- Benchmarking de rendimiento en APU frente a GPUs dedicadas: permite comparar el rendimiento de un APU Strix Halo con GPUs tradicionales en cargas de inferencia de modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una mejora de perplejidad del 5-9% gracias al sidecar de calidad, pero no proporciona cifras absolutas ni comparaciones con otros modelos.

## Requisitos de hardware

- Hardware específico: AMD Strix Halo (gfx1151), APU con memoria unificada de 124 GB.
- Memoria: el modelo necesita ~68 GiB residentes más la tabla n-gram mapeada en memoria (47.7 GiB en FP8, paginada). El checkpoint completo ocupa ~118 GiB en disco.
- GPU: no es compatible con GPUs NVIDIA ni con otras GPUs AMD; los kernels están escritos únicamente para gfx1151.
- Despliegue: exclusivamente mediante el contenedor halogen-flash-server (Podman o Docker), con los dispositivos `/dev/kfd` y `/dev/dri` expuestos.
- Latencia y throughput: no disponibles en la información proporcionada.
- No cabe en GPUs de consumo estándar (RTX 4090, etc.) por requisitos de memoria y por incompatibilidad de kernels.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| halogen-qwen3.8-flash-next (este) | 125B + 51B n-gram | no disponible | .hgn propietario | AMD Strix Halo | apache-2.0 (derivado) |
| halogen-qwen3.8-27b | 27B | no disponible | .hgn propietario | AMD Strix Halo | apache-2.0 (derivado) |
| Qwen3.8-Flash-Next (base) | 125B + 51B n-gram | 1M tokens (según QwenCloud) | safetensors (presumiblemente) | Multi-GPU | licencia Qwen |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento publicados para ninguna de las variantes halogen. El modelo base Qwen3.8-Flash-Next es multimodal y soporta contexto de 1M tokens, pero no se confirma que esta variante conserve esas capacidades.

## Limitaciones y advertencias

- Formato de pesos propietario: los pesos `.hgn` no se pueden cargar en transformers, vLLM, llama.cpp ni ningún otro runtime estándar. Solo funcionan con halogen-flash-server.
- Motor de código cerrado: el servidor de inferencia es closed source y se distribuye bajo sus propios términos, lo que limita la auditoría y la personalización.
- Hardware exclusivo: solo funciona en AMD Strix Halo (gfx1151). No hay soporte para otras GPUs o arquitecturas.
- Licencia derivada: aunque el repo declara apache-2.0, el modelo es un trabajo derivado de Qwen3.8-Flash-Next y está sujeto a la licencia del modelo base. El autor recomienda verificar los términos antes de uso comercial.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento, calidad o latencia que permitan comparar con otros modelos.
- Riesgo de alucinación y sesgos: no se ha evaluado de forma independiente; se heredan los riesgos del modelo base, que no están documentados en esta ficha.
- Requisitos de memoria elevados: aunque cabe en Strix Halo, necesita ~68 GiB residentes más la tabla n-gram paginada, lo que limita el uso simultáneo de otras aplicaciones en el mismo dispositivo.
- Fecha de creación futura: el modelo fue creado el 2026-09-01, lo que sugiere que es un proyecto reciente o experimental con pocas descargas (0) y un solo like.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Repositorio del servidor halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server
- Modelo hermano halogen-qwen3.8-27b: https://huggingface.co/peonist-ai/halogen-qwen3.8-27b
- Repositorio halogen-server (para el 27B): https://github.com/peonist-ai/halogen-server
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Página de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
