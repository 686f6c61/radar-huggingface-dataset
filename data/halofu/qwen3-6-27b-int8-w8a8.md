# halofu/Qwen3.6-27B-INT8-W8A8

## Resumen

Qwen3.6-27B-INT8-W8A8 es una cuantización INT8 con esquema W8A8 (pesos y activaciones a 8 bits) del modelo denso Qwen/Qwen3.6-27B, publicada por el usuario halofu. El modelo base es un transformer híbrido que combina capas de atención lineal GatedDeltaNet con capas periódicas de atención completa, e incorpora además una torre de visión y una cabeza MTP (multi-token prediction). Con 27.356.728.560 parámetros totales y un repositorio de 31,3 GB, la versión cuantizada reduce el peso en memoria respecto al checkpoint en bf16 manteniendo, según el autor, una calidad prácticamente sin pérdida.

La relevancia de esta ficha radica en que permite desplegar un modelo de ~27B con visión en GPUs Ampere (sm_80/sm_86) mediante la ruta CUTLASS INT8 W8A8 de vLLM, sin necesidad de hardware Hopper. El autor indica que el INT8 es robusto por sí mismo, por lo que no se aplicaron técnicas de suavizado como AWQ o SmoothQuant, y que las partes sensibles a la calidad (proyecciones de la GatedDeltaNet, lm_head, embeddings, torre de visión y cabeza MTP) se mantienen en bf16.

La licencia es Apache 2.0 y los idiomas declarados son inglés y chino. El modelo está pensado para generación de texto conversacional y soporta el parser de razonamiento `qwen3` en vLLM, lo que sugiere compatibilidad con modos de pensamiento del linaje Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: GatedDeltaNet (atención lineal) + atención completa periódica, con torre de visión y cabeza MTP |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 W8A8 (pesos simétricos por canal con observador MSE + activaciones INT8 dinámicas por token); componentes sensibles en bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` (`int-quantized`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de aproximadamente 27,36 mil millones de parámetros que sustituye la atención estándar en la mayoría de capas por GatedDeltaNet, un mecanismo de atención lineal con compuertas, e intercala capas de atención completa periódicas para preservar la capacidad de recuperación exacta sobre contextos largos. Además de la pila de lenguaje, incluye una torre de visión (lo que habilita entrada multimodal) y una cabeza MTP orientada a decodificación especulativa o predicción multi-token.

La cuantización se realizó con llm-compressor y se distribuye con una receta `recipe.yaml` en el repositorio. Se cuantificaron a INT8 todas las capas MLP, el `self_attn` de atención completa y el `out_proj` de la GatedDeltaNet. Se mantuvieron en bf16 las proyecciones `in_proj_a` e `in_proj_b` de la GatedDeltaNet, el `lm_head`, los embeddings, la torre de visión y la cabeza MTP, por ser sensibles a la calidad. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo de pensamiento, compatible con el `--reasoning-parser qwen3` de vLLM.
- Procesamiento de imágenes gracias a la torre de visión integrada en el modelo base.
- Predicción multi-token mediante la cabeza MTP, aprovechable para decodificación especulativa.
- Capacidades de código y matemáticas heredadas del modelo base Qwen3.6-27B (sin datos de benchmark específicos en esta versión cuantizada).
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.

## Casos de uso

- Despliegue en GPUs Ampere: la ruta CUTLASS INT8 W8A8 de vLLM funciona en sm_80 y sm_86, por lo que el modelo puede servirse en A100 o RTX 3090/4090 sin requerir Hopper, algo relevante para clústeres con hardware de generación anterior.
- Asistente conversacional bilingüe inglés-chino: el modelo declara soporte para ambos idiomas y su naturaleza conversacional lo hace adecuado para atención al cliente o asistentes internos en organizaciones con operaciones en esos mercados.
- Análisis de documentos con imágenes: la torre de visión permite procesar capturas, diagramas o formularios escaneados junto con texto, útil en pipelines de extracción de datos.
- Razonamiento con trazas explícitas: el parser `qwen3` de vLLM permite separar el razonamiento del resultado final, lo que facilita auditoría y filtrado en aplicaciones de análisis.
- Servicio con paralelismo tensorial: la configuración recomendada usa `--tensor-parallel-size 2`, lo que permite repartir el modelo entre dos GPUs y ajustar el coste de despliegue.
- Generación de código asistida en entornos de desarrollo: el modelo base pertenece a la familia Qwen3, con tradición en tareas de código, aunque esta variante cuantizada no publica métricas propias.
- Prototipado e investigación: al ser una cuantización near-lossless con licencia Apache 2.0, sirve para experimentar con modelos de ~27B multimodales en hardware limitado sin renunciar a la calidad del checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante INT8-W8A8. La model card menciona, a modo de referencia, que la variante INT4-W4A16 del mismo modelo base obtiene GSM8K 96,8 % y MMLU-Pro 82,4 %, pero no se aportan cifras propias para la versión INT8.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 31,3 GB, por lo que la inferencia en INT8 requiere del orden de 32 GB solo para pesos, más espacio para caché KV y activaciones. Con `--tensor-parallel-size 2` se reparte entre dos GPUs.
- GPUs recomendadas: A100 (40/80 GB) y otras Ampere sm_80/sm_86; el autor confirma compatibilidad con la ruta CUTLASS INT8 W8A8 en Ampere.
- GPU de consumo: una RTX 3090 o 4090 (24 GB) no puede alojar el modelo completo en una sola unidad; sería necesario repartirlo entre varias GPUs o recurrir a una cuantización de menor precisión.
- Opciones de despliegue: vLLM con `--trust-remote-code` y `--reasoning-parser qwen3`; el formato `compressed-tensors` es el esperado por vLLM. No se indica soporte para llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| halofu/Qwen3.6-27B-INT8-W8A8 | 27,36 B | No disponible | INT8 W8A8 | Apache 2.0 | Objeto de esta ficha; visión y MTP en bf16 |
| Qwen/Qwen3.6-27B | 27,36 B | No disponible | bf16 | Apache 2.0 | Modelo base sin cuantizar; mayor huella de memoria |
| Avesed/Qwen3.6-27B-INT4-W4A16 | 27,36 B | No disponible | INT4 W4A16 | Apache 2.0 | Menor huella; GSM8K 96,8 % y MMLU-Pro 82,4 % según la model card |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cuantización INT8 se describe como near-lossless, pero no se aportan métricas que lo cuantifiquen.
- Sesgos del modelo base no documentados en la información disponible.
- Longitud de contexto no especificada, lo que impide planificar aplicaciones con ventanas largas sin verificación previa.
- El despliegue requiere `--trust-remote-code`, lo que implica ejecutar código del repositorio; conviene auditar la receta y los ficheros antes de usarlo en producción.
- La cuantización W8A8 depende de la ruta CUTLASS INT8 de vLLM en Ampere; otros backends o GPUs pueden no soportarla.
- El número de descargas (29) y de likes (0) es muy bajo, por lo que la validación comunitaria es escasa.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base Qwen3.6-27B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halofu/Qwen3.6-27B-INT8-W8A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Variante INT4-W4A16: https://huggingface.co/Avesed/Qwen3.6-27B-INT4-W4A16
- Herramienta de cuantización: https://github.com/avesed/vllm-ampere-optimized/tree/main/quantize
