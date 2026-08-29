# dabsLabs/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es una cuantización en formato NVFP4 (4 bits) del modelo Qwen3.8-Flash-Next, desarrollada por dabsLabs. El modelo original, creado por Qwen, es un MoE multimodal ultra-disperso de 125B parámetros activos por token (~6B), complementado con una tabla de embeddings n-gram de 51B parámetros, lo que eleva el total a aproximadamente 180B parámetros según los tensores safetensors. Esta versión cuantizada reduce el peso del modelo de 360 GB (BF16) a unos 174 GB, manteniendo en precisión completa las partes críticas: atención, sistema de visión, cabezal de decodificación especulativa y la memoria n-gram (PLE).

La relevancia de esta ficha radica en que permite ejecutar un modelo de última generación en hardware Blackwell (SM120) con requisitos de VRAM más asequibles, especialmente si se activa el offload de la PLE a RAM del host. La cuantización se ha verificado numéricamente contra la exportación FP8 oficial de Qwen, con un error relativo medio de 0.0869 en los expertos cuantizados. Sin embargo, el autor advierte que aún no se ha realizado una prueba de servicio end-to-end, por lo que su funcionamiento en producción está "muy probablemente correcto" pero no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Gated DeltaNet + Qwen Sparse Attention) con PLE n-gram, MTP y torre de visión |
| Parametros totales | 179.999.981.459 (según safetensors; el modelo base declara 125B-A6B + 51B de embeddings n-gram) |
| Parametros activos | ~6B por token |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1M con YaRN |
| Tipos de cuantizacion | NVFP4 (4 bits) en expertos enrutados; BF16 en el resto (atención, visión, PLE, MTP, router, embeddings) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (compressed-tensors, `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina cuatro innovaciones principales: (1) Gated DeltaNet (GDN) en tres de cada cuatro capas, que comprime el historial de forma recurrente; (2) Qwen Sparse Attention (QSA) en la cuarta capa, para recuperación precisa de contexto largo; (3) una tabla de embeddings n-gram (PLE) de 51B parámetros que actúa como memoria local de alta velocidad; y (4) un árbol de decodificación especulativa (MTP) que acelera la generación. El modelo es multimodal, acepta entradas de imagen y texto.

Esta versión cuantizada aplica NVFP4 (NVFP4A16) únicamente a los pesos de los expertos enrutados (aproximadamente 121B de los parámetros), utilizando escalas de bloque de 16 elementos con una selección óptima entre el esquema clásico `amax/6` y el `four-over-six` de ModelOpt, lo que reduce el error cuadrático total en un 16,11 % frente a RTN plano. El resto de componentes (atención, PLE, visión, MTP, router, embeddings) permanecen en BF16 sin modificar. La conversión se realizó a partir de la versión BF16 original (pin `f5d08274`), no de la exportación FP8, y se verificó contra la exportación FP8 oficial de Qwen con un error relativo medio de 0.0266, consistente con ruido FP8 puro. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, método de alineación).

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto simultáneamente (pipeline `image-text-to-text`).
- Contexto largo nativo de 262.144 tokens, ampliable a 1M con YaRN, adecuado para documentos extensos y conversaciones multi-turno.
- Decodificación especulativa mediante el árbol MTP, que acelera la inferencia sin pérdida de calidad.
- Memoria n-gram (PLE) de 51B parámetros para recuperación local rápida de patrones frecuentes.
- Soporte de conversación y diálogo (etiqueta `conversational`).
- Capacidades de código, matemáticas y razonamiento general heredadas del modelo base Qwen (no especificadas explícitamente en la documentación de esta cuantización).
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Análisis de documentos técnicos extensos con figuras y tablas: el modelo puede procesar manuales, informes o artículos científicos de cientos de páginas (hasta 262K tokens) combinando comprensión de imágenes y texto, gracias a su ventana de contexto nativa y su arquitectura híbrida que mantiene un historial comprimido.
- Asistentes conversacionales de largo recorrido: con 6B parámetros activos y contexto amplio, puede mantener diálogos coherentes a lo largo de muchas interacciones sin perder el hilo, adecuado para atención al cliente o tutoría personalizada.
- Generación de código con razonamiento visual: al aceptar capturas de pantalla o diagramas, puede ayudar a depurar o generar código a partir de representaciones visuales de interfaces o flujos.
- Búsqueda y recuperación en corpus largos: la combinación de QSA (atención dispersa) y PLE permite localizar información relevante en grandes volúmenes de texto, útil para motores de búsqueda internos o análisis de jurisprudencia.
- Creación de contenido multimodal: redacción de informes que integran imágenes, gráficos y texto, con coherencia entre ambos formatos.
- Investigación académica: análisis de papers con ecuaciones, figuras y referencias cruzadas, aprovechando el contexto de 262K tokens para procesar documentos completos de una sola vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de error de cuantización (error relativo medio 0.0869 en expertos, 0.0266 en la verificación cruzada contra FP8), pero no resultados de tareas como MMLU, HumanEval o GSM8K. Tampoco se ofrecen comparativas de rendimiento con el modelo base o con otras cuantizaciones.

## Requisitos de hardware

- GPU: requiere arquitectura NVIDIA Blackwell con soporte SM120 (por ejemplo, RTX PRO 6000, GB200, GB300). No es compatible con GPUs Ampere o anteriores.
- VRAM: el peso cuantizado ocupa ~174 GB en GPU. Con la variable de entorno `VLLM_PLE_CPU_OFFLOAD=1`, la PLE (51B parámetros) se mueve a RAM del host, reduciendo el peso en GPU a ~90 GB, lo que permite ejecutarlo en dos GPUs de 96 GB (por ejemplo, 2×96 GB).
- RAM del sistema: si se activa el offload de PLE, se necesitan ~51 GB adicionales de RAM del host.
- Despliegue: requiere la imagen dedicada de vLLM `vllm/vllm-openai:qwen38-flash-next` hasta que el soporte upstream esté disponible. Argumentos recomendados: `--max-num-seqs 256` (obligatorio para cachés Mamba), `--no-enable-flashinfer-autotune`, `VLLM_ENGINE_READY_TIMEOUT_S=3600`.
- Latencia y throughput: no disponibles. El autor indica que la arquitectura se sirve en producción con la versión FP8 oficial en 4×96 GB, pero no proporciona cifras concretas para esta cuantización NVFP4.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Precisión | Tamaño | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16) | ~180B (125B + 51B PLE) | ~6B | 262K (1M con YaRN) | BF16 | 360 GB | qwen-community-1.0 |
| Qwen3.8-Flash-Next (FP8 oficial) | ~180B | ~6B | 262K (1M con YaRN) | FP8 | ~180 GB (estimado) | qwen-community-1.0 |
| Qwen3.8-Flash-Next-NVFP4 (este modelo) | ~180B | ~6B | 262K (1M con YaRN) | NVFP4 (expertos) + BF16 | ~174 GB | qwen-community-1.0 |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para comparar con otros MoE como DeepSeek-V3 o Qwen3-235B. La ventaja principal de esta versión NVFP4 es la reducción de peso frente al BF16, con un error de cuantización medido y verificado, y un formato nativo para Blackwell. Frente a la versión FP8 oficial, ofrece un tamaño ligeramente menor (174 GB vs ~180 GB estimado) a costa de una precisión reducida en los expertos (4 bits vs 8 bits), aunque el autor afirma que la calidad se mantiene gracias a la selección de escalas optimizada.

## Limitaciones y advertencias

- No se ha completado una prueba de servicio end-to-end: el autor indica explícitamente que el checkpoint está verificado estructural y numéricamente, pero no se ha ejecutado en producción. Existe riesgo de que el cargador de vLLM encuentre incompatibilidades de nombres o formatos, aunque el layout replica la exportación FP8 oficial.
- Error de cuantización: los expertos enrutados se almacenan en 4 bits, con un error relativo medio de 0.0869 frente al BF16 original. Aunque es un valor aceptable para 4 bits, puede degradar ligeramente la calidad en tareas sensibles a la precisión numérica.
- Requisitos de hardware estrictos: solo funciona en GPUs Blackwell (SM120). No es ejecutable en hardware consumer de generaciones anteriores (RTX 30/40 series) ni en centros de datos con GPUs Ampere.
- Licencia Qwen Community 1.0: permite uso comercial, pero con restricciones específicas (por ejemplo, no usar para servicios que compitan con Qwen, mantener atribución). Es recomendable revisar el texto completo de la licencia.
- Dependencia de vLLM con imagen dedicada: hasta que el soporte de la arquitectura `qwen4_exp` se integre en el upstream, es necesario usar una imagen de contenedor específica, lo que puede limitar la portabilidad del despliegue.
- La PLE ocupa 51 GB de VRAM si no se usa offload; sin él, el modelo requiere ~174 GB de VRAM, lo que obliga a múltiples GPUs de alta capacidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/dabsLabs/Qwen3.8-Flash-Next-NVFP4)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Receta de vLLM para Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- [Anuncio de NVIDIA sobre Qwen3.8-Flash-Next 176B](https://forums.developer.nvidia.com/t/qwen3-8-flash-next-176b-now-available/381413)
- [Foro de NVIDIA sobre Qwen3.8-Flash-Next en DGX Spark](https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228)
- [Blog de explainx.ai sobre el lanzamiento](https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026)
