# Hygaard/Inkling-2-Small-oQ3e

## Resumen

Inkling-2-Small-oQ3e es una conversión cuantizada del modelo multimodal Inkling-2-Small-MXFP8 de Thinking Machines, publicada por el usuario Hygaard en Hugging Face. Se trata de una cuantización de precisión mixta realizada directamente sobre los tensores MXFP8 originales (no sobre un maestro BF16), pensada para ejecutarse con la implementación nativa de Inkling 2 en oMLX, una variante de MLX orientada a Apple Silicon. El modelo conserva la arquitectura completa del original: 48 capas de texto con 384 expertos enrutados por capa y enrutamiento top-8, además del codificador visual, el tokenizador original y un sidecar MTP (multi-token prediction) en BF16.

El modelo resuelve el problema de desplegar un modelo de mezcla de expertos (MoE) de gran tamano en hardware con memoria limitada. Con 595.762 millones de parámetros originales, el checkpoint completo pesa 268,099 GB (249,687 GiB), lo que lo hace inviable en la mayoria de equipos de consumo. La cuantización oQ3e reduce los expertos enrutados a 3 bits manteniendo componentes críticos en 8 bits o BF16, logrando un promedio de 3,60 bits por peso (BPW) y un pico de asignación de 7,884 GiB en el asignador MLX durante la validación con paginación externa de pesos.

Es relevante ahora porque demuestra una ruta práctica para ejecutar modelos MoE multimodales de escala grande en Apple Silicon mediante paginación de pesos por capas, aunque con limitaciones importantes: la materialización completamente residente no superó las pruebas en el host de validación, y no se han publicado resultados de benchmarks ni evaluación de calidad retenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + visión) con 48 capas de texto, 384 expertos enrutados por capa, enrutamiento top-8, y sidecar MTP |
| Parametros totales | 595.762.352.304 (originales, incluyendo MTP) |
| Parametros activos | no disponible (top-8 de 384 expertos por capa, pero sin cifra agregada publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta: expertos enrutados a 3 bits, atención de texto a 8 bits/BF16, cabecera de salida a 8 bits, embeddings a 8 bits, MTP en BF16, codificador visual en BF16, routers y controles de residual en FP32; 3,60 BPW efectivos (3,055 BPW en matrices cuantizadas empaquetadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (cuantización MLX/omlx), con directorio `tiktoken/` requerido |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal con 48 capas de texto, cada una con 384 expertos enrutados y enrutamiento top-8. Incluye un codificador visual y un proyector/merger que permiten la entrada de imágenes junto con texto (pipeline `image-text-to-text`). El modelo incorpora un sidecar MTP (multi-token prediction) en BF16, presumiblemente para decodificación especulativa o predicción multi-token, aunque la model card no detalla su uso en inferencia. La cuantización preserva todos los componentes del original: atención de texto, convoluciones, normalizaciones, routers, embeddings, cabecera de salida y el codificador visual.

El proceso de conversión partió directamente de los tensores MXFP8 publicados en `thinkingmachines/Inkling-2-Small-MXFP8`, fijado al commit `086a047e8b7ff2ac902dd52355328ddb66b16914`. La calibración utilizó activaciones nativas del modelo fuente: 384 secuencias de 512 tokens con cobertura completa de expertos enrutados, entradas reales de imagen y texto, y mediciones de sensibilidad nativas de nivel 3. No se aplicó poda de expertos ni forzado de rutas. La validación nativa verificó los 1.694 tensores principales con comprobaciones estrictas de nombre, forma, dtype, materialización serial y finitud numérica, y repitió generación completa de texto e imagen real a través del procesador y plantilla originales. La ejecución oQ3e paginada coincidió bit a bit con oQ2e en todos los logits FP32 de vocabulario válido para prefill de texto/imagen y decodificación con caché.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline `image-text-to-text` indica soporte de entradas conjuntas de imagen y texto.
- Procesamiento de imágenes mediante codificador visual BF16 y proyector dedicado.
- Generación de texto con arquitectura MoE de gran escala (595.762 millones de parámetros originales).
- Predicción multi-token (MTP) mediante sidecar BF16 incluido en el checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización de MoE a gran escala: el checkpoint sirve como referencia reproducible para estudiar precisión mixta (3 bits en expertos, 8 bits en atención) sobre un modelo de 595.762 millones de parámetros, con mapa de precisión por bloque documentado y calibración basada en activaciones nativas.
- Despliegue experimental en Apple Silicon con paginación de pesos: mediante el adaptador de paginación externa de capas descrito, se puede ejecutar inferencia de texto e imagen con un pico de asignador MLX de 7,884 GiB, adecuado para entornos de investigación con memoria unificada limitada.
- Validación de pipelines multimodales imagen-texto: el modelo conserva el procesador y la plantilla originales, por lo que puede usarse para probar flujos de prefill de imagen y decodificación con caché en implementaciones nativas de MLX.
- Estudio de decodificación especulativa con MTP: el sidecar MTP en BF16 incluido permite experimentar con predicción multi-token, aunque la model card indica que la decodificación MTP no fue probada.
- Comparación de precisiones de cuantización: junto con la variante oQ2e del mismo autor, permite evaluar el compromiso entre 2 y 3 bits efectivos en expertos enrutados manteniendo routers y controles en FP32.
- Desarrollo y depuración de kernels MLX personalizados: el modelo requiere la implementación nativa de Inkling 2 en oMLX PR #5229 y una corrección específica de ancho de portador afín para carga de 3/6 bits, lo que lo convierte en un banco de pruebas para kernels de cuantización afín.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta métricas de validación mecánica: 1.694 tensores principales con adjunción estricta de nombre/forma/dtype, coincidencia bit a bit de logits FP32 entre oQ2e ordinario y paginado, y un pico de asignador MLX de 7,884 GiB para oQ3e paginado. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de calidad retenida.

## Requisitos de hardware

- Pesos totales: 268,099 GB (249,687 GiB) en disco, incluyendo MTP. No cabe residente en ninguna GPU de consumo ni en configuraciones multi-GPU típicas sin paginación.
- La materialización completamente residente de oQ3e no superó las pruebas en el host de validación; se requiere paginación externa de pesos por capas.
- Pico de asignador MLX documentado: 7,884 GiB con paginación externa de capas (adaptador de paginación de pesos de capa).
- Hardware objetivo: Apple Silicon con MLX y la implementación nativa de Inkling 2 en oMLX (PR #5229, commit `2a18263b91e14ee92ed984f8c5a56d0053178cea`).
- Cargador nativo: `omlx.patches.inkling2.vlm.load`. No es una arquitectura genérica de `mlx-lm`.
- Requiere conservar el directorio completo `tiktoken/`.
- Requiere la corrección exacta de ancho de portador afín de expertos para carga de 3/6 bits: en `ExpertProj.__init__`, el ancho empaquetado debe ser `in_dims * bits // 32`, no `in_dims // (32 // bits)`.
- VRAM estimada para GPU NVIDIA (A100, H100, RTX 4090): no disponible; el checkpoint está en formato MLX y no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Small-oQ3e | 595.762 M (originales) | no disponible | 3,60 BPW efectivos (3 bits expertos, 8 bits atención) | Apache 2.0 | Safetensors MLX | Hugging Face (Hygaard) |
| Inkling-2-Small-oQ2e | no disponible | no disponible | 2 bits efectivos (variante del mismo autor) | Apache 2.0 | Safetensors MLX | Hugging Face (Hygaard) |
| Inkling-2-Small-MXFP8 | 595.762 M (originales) | no disponible | MXFP8 | Apache 2.0 | Safetensors | Hugging Face (thinkingmachines) |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la coincidencia bit a bit de logits entre oQ2e ordinario y paginado. No se identifican en la información proporcionada otros modelos de la misma categoría con los que comparar parámetros, contexto o benchmarks.

## Limitaciones y advertencias

- La materialización completamente residente de oQ3e no pasó las pruebas en el host de validación; el uso práctico depende de paginación externa de pesos por capas.
- La decodificación MTP y la capacidad de contexto completo no fueron probadas.
- La prueba con imagen reutilizada es una validación mecánica, no una evaluación de calidad retenida; no hay evidencia publicada de calidad de generación frente al modelo original.
- Requiere una implementación nativa específica (oMLX PR #5229) y una corrección de código concreta para carga de 3/6 bits; no funciona con `mlx-lm` genérico ni con otros runtimes estándar.
- El checkpoint está en formato MLX y orientado a Apple Silicon; no se documenta compatibilidad con CUDA, vLLM, llama.cpp, Ollama o TGI.
- El estado de publicación indica "weights uploading" en el momento de la model card, por lo que la integridad de la subida debe verificarse.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad y de benchmarks impide garantizar comportamiento en producción.
- El modelo base es de Thinking Machines; cualquier restricción adicional del modelo original debe consultarse en su model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hygaard/Inkling-2-Small-oQ3e
- Variante oQ2e: https://huggingface.co/Hygaard/Inkling-2-Small-oQ2e
- Modelo base MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- oMLX PR #5229: https://github.com/jundot/omlx/pull/5229
