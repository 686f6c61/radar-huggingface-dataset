# Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-vision-mtplx

## Resumen

`Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-vision-mtplx` es una conversión independiente a formato MXFP4 (4 bits, grupo de 32) del checkpoint BF16 `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, realizada por el usuario Shiftedx. Este modelo base es a su vez una versión «abliterada» (desprovista de alineación de seguridad) de Qwen3.8-27B, una familia de arquitectura densa híbrida con atención y GDN (gated delta network) de 64 capas de lenguaje. La conversión preserva el componente de visión (333 tensores BF16 originales) y añade 15 tensores MTP (multi-token prediction) para decodificación especulativa, lo que permite acelerar la generación en hardware Apple Silicon mediante MLX.

El modelo está diseñado para ejecutarse exclusivamente en Apple Silicon a través de la librería MLX, y su pipeline es `image-text-to-text`, es decir, admite entrada de imágenes y texto para generar respuestas. La ventana de contexto configurada es de 262 144 tokens, aunque no se ha calificado de forma exhaustiva. Es una publicación experimental y comunitaria, no un lanzamiento oficial de Qwen ni de AEON-7. Su relevancia radica en combinar visión, contexto largo, tool calling y decodificación especulativa en un solo paquete cuantizado, pensado para desarrolladores que necesitan ejecutar un modelo multimodal sin censura en hardware local de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa Qwen3.5-family híbrida (attention + GDN), 64 capas de lenguaje |
| Parametros totales | 5 505 879 280 (según safetensors del checkpoint MXFP4; el modelo base se anuncia como 27B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (configurado, no exhaustivamente calificado) |
| Tipos de cuantizacion | MXFP4, 4 bits, group size 32 (también se generó MXFP8, pero el publicado es MXFP4) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura base corresponde a la familia Qwen3.5, con una mezcla de atención clásica y GDN (gated delta network), lo que reduce el coste de atención para contextos largos. El checkpoint original BF16 fue sometido a un proceso de «abliteración» (KL-drift) que elimina los mecanismos de rechazo de contenido, dejando el modelo sin alineación de seguridad. La conversión a MXFP4 se realizó con el adaptador de streaming de MLX-LM 0.31.3, preservando el tokenizer, el chat template, el procesador de visión y el linaje Apache-2.0. Además, se incorporaron 15 tensores MTP (multi-token prediction) del checkpoint pinneado, que permiten decodificación especulativa con profundidad configurable (D1, D2, D3); en la prueba local se seleccionó D2 con una velocidad de 52,67 tok/s y un multiplicador de 1,861x frente a la decodificación autorregresiva. No se dispone de información sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de RLHF/DPO) más allá de que es un modelo de la familia Qwen3.8.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de modo «thinking» (activado en el benchmark con intensidad media).
- Comprensión de imágenes (visión) mediante el pipeline `image-text-to-text`; el componente de visión se preserva en BF16.
- Tool calling / function calling: verificado en el benchmark con 6/6 casos superados.
- Capacidades agénticas (multi-step reasoning y ejecución de acciones): 2/2 casos superados en el benchmark.
- Decodificación especulativa con MTP (multi-token prediction) para acelerar la generación.
- Contexto largo: probado hasta 131 072 tokens de prompt en el benchmark, con 15/15 casos superados.
- Sin censura: al ser un modelo abliterado, no aplica filtros de contenido, lo que permite generar material que otros modelos rechazarían.

## Casos de uso

- Asistentes de programación con tool calling: el modelo puede integrarse en entornos de desarrollo para invocar funciones, ejecutar comandos o consultar APIs, gracias a su soporte nativo de function calling y su contexto largo.
- Análisis de imágenes en entornos controlados: por su componente de visión, puede describir o responder preguntas sobre imágenes, útil en aplicaciones de accesibilidad o revisión de documentos.
- Agentes autónomos de automatización: con sus capacidades agénticas verificadas, puede orquestar flujos multi-paso, por ejemplo, para gestión de tareas o integración con servicios externos.
- Generación de contenido creativo sin restricciones: al estar abliterado, permite producir textos literarios, guiones o material de ficción sin los filtros habituales de otros modelos.
- Investigación en alineación y seguridad: su naturaleza desalineada lo convierte en una herramienta para estudiar comportamientos de modelos sin censura, siempre en entornos aislados y con supervisión.
- Prototipado rápido en Apple Silicon: al ser una cuantización MXFP4 con MTP, permite probar aplicaciones multimodales locales con baja latencia en Macs con memoria unificada de 64 GiB o superior.

## Benchmarks y rendimiento

La model card incluye resultados del «Shiftedx Bench v0.3.0» sobre una revisión concreta del modelo. El host fue un Apple M4 Max con 64 GiB de memoria unificada, con MTPLX 2.7.1, thinking activado, temperatura 1.0, top_p 0.95, top_k 20, KV cache desactivado y profundidad MTP 2. Los resultados se presentan por categorías independientes (no hay puntuación compuesta):

| Categoría | Casos superados | Precisión | Tiempo medio (s) | Decodificación media (tok/s) | Memoria activa pico (GiB) |
|---|---:|---:|---:|---:|---:|
| Calidad | 8/10 | 80.0% | 21.53 | 55.22 | 31.21 |
| Contexto largo | 15/15 | 100.0% | 141.22 | 43.52 | 42.23 |
| Tool calling | 6/6 | 100.0% | 4.61 | 47.30 | 34.03 |
| Agéntico | 2/2 | 100.0% | 15.92 | — | — |
| Visión | 4/4 | 100.0% | 3.81 | 53.76 | 35.17 |

El contexto efectivo probado fue de 131 072 tokens de prompt; no se ejecutó la prueba de 260 096 tokens por estar fuera del alcance del gate ligero. El tiempo total de la evaluación fue de 2408,23 segundos. No se han publicado resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia ejecutada en Apple M4 Max con 64 GiB de memoria unificada; el pico de memoria activa alcanzó 42,23 GiB en la prueba de contexto largo.
- Se requiere una Mac con Apple Silicon y al menos 64 GiB de memoria unificada para un uso cómodo; con 32 GiB podría ser insuficiente para contextos largos.
- Al estar en formato MLX, no es compatible con GPUs NVIDIA o AMD; solo funciona en hardware Apple Silicon.
- Despliegue mediante `mlx-vlm` (para generación con imágenes) o MLX-LM para texto. No se mencionan opciones como vLLM, llama.cpp u Ollama para este formato específico.
- La velocidad de decodificación medida fue de 43-55 tok/s dependiendo de la tarea, con la configuración MTP D2.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Visión | MTP | Licencia | Notas |
|---|---|---|---|---|---|---|
| `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16` | BF16 (safetensors) | 262 144 | Sí | No | Apache-2.0 | Modelo base, sin cuantizar, requiere más VRAM |
| `Shiftedx/Qwen3.8-27B-MLX-MXFP4` | MXFP4 (MLX) | No especificado | No | No | Apache-2.0 | Conversión sin visión ni MTP, más ligera |
| `qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-vision-mtplx` (este) | MXFP4 (MLX) | 262 144 | Sí | Sí | Apache-2.0 | Conversión completa con visión y decodificación especulativa |

No se dispone de datos de rendimiento comparativos entre estos modelos en los mismos benchmarks; la comparación se basa en características declaradas.

## Limitaciones y advertencias

- Modelo experimental y comunitario; no es un lanzamiento oficial de Qwen ni de AEON-7.
- Al ser abliterado, puede producir contenido inseguro, ilegal o dañino. La cuantización no restaura la alineación de seguridad. El editor fuente advierte que los operadores asumen toda la responsabilidad legal y de seguridad.
- La ventana de contexto de 262 144 tokens no ha sido calificada de forma exhaustiva; la prueba solo llegó a 131 072 tokens.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de precisión factual.
- Solo compatible con Apple Silicon (MLX); no se puede ejecutar en GPUs NVIDIA o AMD sin conversión adicional.
- El número de parámetros reportado en safetensors (5,5B) difiere del nombre del modelo (27B); la discrepancia puede deberse a la cuantización o a un error de etiquetado, y no se ha aclarado oficialmente.
- No se especifican los idiomas soportados; se recomienda verificar el comportamiento multilingüe antes de usarlo en producción.
- Requiere memoria unificada elevada (64 GiB recomendados) para contextos largos, lo que limita su despliegue a equipos de gama alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-vision-mtplx
- Modelo base: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Conversión similar sin visión ni MTP: https://huggingface.co/Shiftedx/Qwen3.8-27B-MLX-MXFP4
- Repo GitHub con GGUF del mismo modelo base: https://github.com/Wassimyounes01/qwen38-uncensored
- Blog sobre la abliteración de Qwen3.8-27B AEON: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Blog de AMD sobre ejecución de Qwen 3.8 27B en hardware AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
