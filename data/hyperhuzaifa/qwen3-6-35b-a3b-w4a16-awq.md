# hyperhuzaifa/Qwen3.6-35B-A3B-W4A16-AWQ

## Resumen

El modelo **hyperhuzaifa/Qwen3.6-35B-A3B-W4A16-AWQ** es una cuantización de 4 bits (W4A16) del modelo base **Qwen/Qwen3.6-35B-A3B**, desarrollada por el usuario hyperhuzaifa mediante la herramienta `llm-compressor` de vLLM con calibración AWQ (activation-aware quantization). El objetivo principal es permitir ejecutar un modelo MoE de 35 mil millones de parámetros con contexto largo en una única GPU de consumo de 24 GB, manteniendo la multimodalidad (visión) y la cabeza de decodificación especulativa MTP.

El modelo base es un MoE híbrido con 30 capas de atención lineal (gated DeltaNet) y 10 capas de atención completa, con 256 expertos enrutados por capa más expertos compartidos. La cuantización reduce el peso en disco a aproximadamente 20,5 GB y el uso de VRAM residente a 19,06 GiB, lo que lo hace viable en tarjetas como RTX 3090 o RTX 4090. Está diseñado para servirse con vLLM (versión ≥ 0.26.0) y soporta contexto de hasta 262 144 tokens en configuraciones de doble GPU.

La relevancia actual de este modelo radica en que combina eficiencia de MoE, atención híbrida (lineal + full) y multimodalidad en un paquete cuantizado que cabe en hardware de consumo, algo poco común en modelos de este tamaño. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE híbrido: 30 capas gated DeltaNet + 10 capas full-attention, 256 expertos enrutados por capa + shared experts) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (el nombre sugiere ~3B, pero no se confirma en la documentación) |
| Longitud de contexto | hasta 262 144 tokens (según configuración de hardware; en una sola GPU con CUDA graphs alcanza 32 768) |
| Tipos de cuantizacion | W4A16 AWQ (int4 simétrico, group size 128) en formato compressed-tensors pack-quantized |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.6-35B-A3B** es un MoE con 35 951 822 704 parámetros totales y una arquitectura híbrida: 30 de sus 40 capas utilizan **gated DeltaNet** (atención lineal estilo Mamba), mientras que las 10 restantes son bloques de atención completa (full attention). Cada capa MoE contiene 256 expertos enrutados (top-8 routing) más expertos compartidos. Además, el modelo incluye un **vision tower** para entrada de imágenes (pipeline image-text-to-text) y una **cabeza MTP** (multi-token prediction) para decodificación especulativa.

La cuantización se realizó con `llm-compressor` 0.12.0 y `compressed-tensors` 0.17.1, aplicando AWQ con `duo_scaling="both"` y calibración sobre 128 muestras de 1024 tokens del dataset `HuggingFaceH4/ultrachat_200k` con formato de chat. Se cuantizaron todas las capas lineales del modelo de lenguaje, incluyendo los 256 expertos enrutados por capa, los expertos compartidos, las 30 proyecciones gated-DeltaNet (`in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a`) y los 10 bloques full-attention. Se mantuvieron en bf16 los embeddings de entrada, la cabeza de salida (`lm_head`), el vision tower, la cabeza MTP y los routers/gates/normalizaciones, para evitar pérdidas de calidad.

El entrenamiento del modelo base no se detalla en la documentación proporcionada; solo se especifica el proceso de cuantización.

## Capacidades

- **Multimodalidad (visión + texto)**: el modelo acepta imágenes como entrada y genera texto, gracias al vision tower preservado en bf16.
- **Generación de texto**: capacidad estándar de modelos de lenguaje, con soporte para conversación y generación de contenido.
- **Contexto largo**: soporta hasta 262 144 tokens en configuraciones de doble GPU, y 32 768 tokens en una sola GPU con CUDA graphs.
- **Decodificación especulativa opcional**: incluye cabeza MTP (1 token especulativo) que puede activarse en vLLM, aunque su uso no siempre mejora el rendimiento (ver limitaciones).
- **Eficiencia MoE**: al activar solo un subconjunto de expertos por token, el coste computacional por inferencia es menor que un modelo denso equivalente.
- **Compatibilidad con vLLM**: integración nativa con el servidor vLLM para despliegue en producción.

## Casos de uso

- **Procesamiento de documentos largos con imágenes**: el modelo puede analizar documentos extensos (informes, contratos, artículos científicos) que combinan texto e imágenes, gracias a su contexto de hasta 262K tokens y su capacidad multimodal. Adecuado para tareas de extracción de información y resumen.
- **Asistentes conversacionales con memoria amplia**: con 32K tokens de contexto en una GPU de consumo, puede mantener conversaciones de larga duración sin perder el hilo, útil para chatbots de atención al cliente o asistentes virtuales.
- **Análisis de imágenes médicas o técnicas**: al aceptar entrada de imágenes, puede generar descripciones o responder preguntas sobre radiografías, diagramas o capturas de pantalla, siempre que el modelo base haya sido entrenado para ello (no se especifica).
- **Generación de código con contexto de proyecto**: aunque no se menciona soporte específico para código, un modelo de este tamaño con contexto largo puede ayudar a completar o refactorizar código en repositorios extensos, manteniendo el contexto de múltiples archivos.
- **Búsqueda y recuperación de información en corpus largos**: su ventana de contexto permite procesar libros completos o bases de conocimiento textuales en una sola pasada, facilitando tareas de pregunta-respuesta sobre documentos extensos.
- **Prototipado de aplicaciones multimodales en hardware de consumo**: al caber en una RTX 3090/4090, permite a desarrolladores individuales o pequeños equipos experimentar con modelos MoE de 35B sin necesidad de infraestructura cloud costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia realizadas con vLLM 0.26.0 en GPUs RTX 3090/4090 (24 GB), con KV cache en fp8:

| Configuracion | Max contexto | Concurrencia | Decode (tok/s) |
|---|---|---|---|
| 1 × 24 GB, CUDA graphs | 32 768 | 2.86× | 156 |
| 1 × 24 GB, `--enforce-eager` | 171 872 | 1× | 19.5 |
| 2 × 24 GB (TP=2), CUDA graphs | 262 144 | 7.5× @ 256K | 127 |

Estos datos indican que el rendimiento depende fuertemente de la configuración: una sola GPU con CUDA graphs ofrece alta velocidad pero contexto limitado, mientras que `--enforce-eager` amplía el contexto a costa de una caída de ~8× en velocidad. La configuración de doble GPU proporciona el mejor equilibrio entre contexto y throughput.

## Requisitos de hardware

- **VRAM estimada**: el modelo cuantizado ocupa 19,06 GiB residentes en GPU, más la memoria para KV cache. En una GPU de 24 GB es necesario ajustar `--max-num-seqs` y `--kv-cache-dtype fp8` para que quepa.
- **GPU recomendadas**: RTX 3090 o RTX 4090 (24 GB) para una sola GPU; para contexto completo de 262K se requieren dos GPUs de 24 GB con tensor parallelism (TP=2).
- **Compatibilidad con GPU de consumo**: sí, cabe en una sola RTX 3090/4090, aunque con limitaciones de contexto (32K con CUDA graphs, 171K con `--enforce-eager`).
- **Opciones de despliegue**: vLLM (recomendado, versión ≥ 0.26.0). También es compatible con la librería `transformers` usando la clase `Qwen3_5MoeForConditionalGeneration`, aunque sin soporte de vLLM para esa arquitectura.
- **Latencia y throughput**: 156 tok/s en una sola GPU con CUDA graphs (contexto 32K), 127 tok/s en TP=2 con contexto 262K. En modo `--enforce-eager` baja a 19,5 tok/s.
- **Ajustes críticos**: en una sola GPU de 24 GB es obligatorio fijar `--max-num-seqs` a 46 o menos (el valor por defecto de 256 provoca fallo en la captura de CUDA graphs). Se recomienda `--kv-cache-dtype fp8` para maximizar el pool de KV.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es una cuantización del propio Qwen3.6-35B-A3B, por lo que la comparación natural sería contra el modelo base sin cuantizar (mayor tamaño en disco y VRAM, pero sin pérdida de precisión). No se han proporcionado datos de otros modelos MoE cuantizados de características similares (por ejemplo, Mixtral 8x7B AWQ o Qwen2.5-MoE cuantizados), por lo que esta sección queda sin datos concretos.

## Limitaciones y advertencias

- **`lm_head` no cuantizado**: se mantiene en bf16 por requisito de vLLM; si se cuantizara, el modelo fallaría al cargar con el error `There is no module or parameter named 'lm_head.weight_packed'`.
- **Carga multimodal obligatoria**: debe usarse la clase `Qwen3_5MoeForConditionalGeneration`. Si se carga con `AutoModelForCausalLM`, el modelo se resuelve como `Qwen3_5MoeForCausalLM` (solo texto) y **descarta silenciosamente** el vision tower y la cabeza MTP.
- **Calibración solo texto**: la cuantización AWQ se calibró únicamente con datos de chat textuales, por lo que las activaciones del vision tower no se calibraron y se dejaron en bf16. Esto podría implicar una calidad inferior en tareas multimodales comparado con el modelo base.
- **Limitaciones de contexto en una sola GPU**: con CUDA graphs el contexto máximo es 32K; para alcanzar 262K se necesitan dos GPUs. En modo `--enforce-eager` el contexto llega a 171K pero el rendimiento cae a ~19,5 tok/s.
- **Concurrencia limitada por Mamba cache**: la arquitectura híbrida requiere un bloque de cache recurrente por secuencia, lo que limita el número de secuencias simultáneas a ~46 en una GPU de 24 GB. Ignorar esto provoca fallos en la captura de CUDA graphs.
- **MTP no recomendado en una sola GPU**: activar la decodificación especulativa consume ~92% del presupuesto de KV, haciendo inviable incluso 8K de contexto. En TP=2 sin NVLink, el MTP reduce el throughput (107 tok/s vs 127 tok/s) debido al coste de all-reduce adicional.
- **Posible degradación de calidad**: al ser una cuantización int4, puede haber pérdida de precisión en tareas sensibles a la perplejidad, aunque no se han publicado evaluaciones comparativas.
- **Licencia**: Apache 2.0, permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base (también Apache 2.0 según el enlace).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/hyperhuzaifa/Qwen3.6-35B-A3B-W4A16-AWQ)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Repositorio llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE)
