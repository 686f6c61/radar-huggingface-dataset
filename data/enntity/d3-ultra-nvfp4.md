# Enntity/d3-ultra-NVFP4

## Resumen

d3-ultra-NVFP4 es una cuantización de tipo NVFP4 del modelo d3-ultra, un modelo de decisión tipada de 27B desarrollado por el equipo de vLLM Semantic Router. El checkpoint lo publica Enntity y está pensado para servirse con el motor Atlas sobre un único NVIDIA DGX Spark, dentro del sistema SparkScore. No es un modelo conversacional: su función es puntuar entradas (scoring) en modo prefill y emitir una decisión tipada, no generar texto libre.

La relevancia de este checkpoint es de eficiencia de despliegue: reduce un modelo de aproximadamente 27B parámetros a pesos NVFP4 (W4A16) en las capas MLP y FP8 por tensor en las proyecciones de atención y Gated DeltaNet, manteniendo el resto sin cambios. El resultado cabe en 22,9 GB de repositorio y se sirve en hardware de un solo nodo con latencias de p50 en torno a 146 ms por pregunta en la variante W4A4.

El modelo base está bajo licencia Apache-2.0 y la cuantización preserva esa licencia. El checkpoint se construye de forma determinista con las herramientas de SparkScore (`tools/nvfp4_convert.py`) y se valida contra sumas de comprobación SHA-256, lo que facilita reproducibilidad y auditoría en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (tag `qwen3_5`), con proyecciones Gated DeltaNet; modelo de decisión tipada, atención bidireccional de prefijo en prefill |
| Parametros totales | 18.800.348.400 (según safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 en pesos MLP (bloques de 16 valores, escalas de bloque E4M3 y escala de tensor FP32); FP8 por tensor en atención y Gated DeltaNet; resto sin cambios; variantes de servicio W4A4 y W4A8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato ModelOpt MIXED_PRECISION, librería `atlas`) |

## Arquitectura y entrenamiento

El modelo base d3-ultra es un transformer derivado de la familia Qwen3.5 con proyecciones Gated DeltaNet, entrenado como modelo de decisión tipada con atención bidireccional de prefijo. Esa configuración implica que el modelo se usa en modo prefill-only para puntuar, no para decodificación autoregresiva de texto. La cabeza `lm_head` de este checkpoint no es la original completa: se construye a partir del `readout.safetensors` del modelo base, colocando filas únicamente en los identificadores de token de código de decisión definidos en `decision_config.json`, en BF16, y dejando el resto a cero. Debe servirse con una LM head en BF16.

La cuantización sigue el esquema de NVIDIA ModelOpt para Qwen3.8-27B (referencia `a2genesis/Qwen3.8-27B-NVFP4`, revisión `bfd9b31207712e0850eec9da32261e8c5ee16af7`). Los pesos MLP se cuantizan a NVFP4 W4A16 con calibración "max" reproducida bit a bit respecto a ModelOpt; las escalas de activación FP8 (`input_scale`) se copian de la referencia. No se incluye cabeza MTP porque el modelo base no la tiene. La conversión se ejecuta con `tools/nvfp4_convert.py convert` y `validate` de SparkScore mediante `install/convert.sh`, y es determinista: una conversión nueva produce archivos idénticos byte a byte. El modelo base de origen es `vllm-sr/d3-ultra` en la revisión `ccdcfa611649a59e095e0b5e1732a15cedafadd6` (BF16, Apache-2.0).

## Capacidades

- Puntuación y clasificación de decisiones tipadas: emite un código de decisión a partir de una entrada, mediante scoring en prefill.
- Clasificación zero-shot y feature extraction, según los tags del paquete equivalente publicado por vLLM Semantic Router.
- Modalidades adicionales declaradas en los tags del paquete de referencia: visión, vídeo y detección de objetos (no confirmado de forma explícita en la model card de este checkpoint).
- Integración con API de scoring: disponible a través de `/v1/systemone` de SparkScore y de `/v1/score` de Atlas con `"attention": "prefix_bidir"`.
- No es un modelo de chat ni de generación de texto libre; no se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento semántico de peticiones: el modelo puntúa la entrada y devuelve una decisión tipada que un router (vLLM Semantic Router) usa para dirigir la consulta al modelo o pipeline adecuado, aprovechando la latencia de p50 de 146 ms en DGX Spark.
- Clasificación de intenciones en producción: al ser un modelo de decisión con salida acotada a códigos, encaja en pipelines donde se necesita una etiqueta determinista y rápida en lugar de texto generado.
- Filtrado y moderación previa: scoring de contenido entrante antes de pasarlo a un LLM generativo, reduciendo coste al no invocar un modelo grande para cada petición.
- Despliegue en hardware de borde o nodo único: su tamaño cuantizado (22,9 GB) y el soporte de Atlas permiten servirlo en un único DGX Spark sin clúster multi-GPU.
- Evaluación y benchmarking de routers: sirve como referencia reproducible para medir precisión y latencia en JevBench u otros conjuntos de decisión, gracias a la conversión determinista y a las sumas SHA-256.
- Clasificación zero-shot de documentos o consultas: uso como extractor de características o clasificador cuando se dispone de pocas etiquetas y se requiere una decisión rápida.
- Integración en pipelines de CI/CD de modelos: la verificación por hash y la reproducibilidad byte a byte permiten validar artefactos antes de desplegarlos.

## Benchmarks y rendimiento

JevBench v1.6.1, 231 ítems públicos, latencia por pregunta, sobre un único DGX Spark:

| Configuracion | Precision | Brier | p50 | p95 |
|---|---:|---:|---:|---:|
| Este checkpoint, SparkScore (W4A4) | 90,9% | 0,118 | 146 ms | 1,05 s |
| Este checkpoint, SparkScore (W4A8) | 92,2% | 0,115 | 158 ms | 1,31 s |
| d3-ultra BF16, runtime propio de d3 | 91,3% | 0,117 | 633 ms | 3,07 s |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22,9 GB en pesos; en inferencia hay que sumar activaciones y caché KV, por lo que se recomienda al menos 24-32 GB de memoria unificada o VRAM según la variante (W4A4 o W4A8).
- GPU recomendadas: NVIDIA DGX Spark (GB10) es el objetivo declarado; también cabría en GPUs con suficiente memoria, aunque no se documentan pruebas en otras.
- Cabe en GPU de consumo: no confirmado; por tamaño podría entrar en GPUs de 24 GB o más, pero no hay validación publicada.
- Opciones de despliegue: motor Atlas (formato `atlas`, safetensors ModelOpt) y SparkScore; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: p50 de 146 ms y p95 de 1,05 s en W4A4; p50 de 158 ms y p95 de 1,31 s en W4A8, sobre DGX Spark con JevBench.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (JevBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-ultra-NVFP4 (este) | 18,8B | no disponible | 90,9% (W4A4) / 92,2% (W4A8) | Apache-2.0 | Hugging Face (Enntity) |
| d3-ultra BF16 | ~27B (según model card) | no disponible | 91,3% | Apache-2.0 | Hugging Face (vllm-sr) |
| d3-ultra-NVFP4 (vllm-sr) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face (vllm-sr) |
| Nemotron-3-Ultra-550B-A55B-NVFP4 | 550B (55B activos) | no disponible | no disponible | no disponible | NVIDIA NIM |

La comparación con Nemotron es solo orientativa por tratarse de otro modelo NVFP4 de gran escala; no comparten tarea ni rango de parámetros.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo para generación de texto libre produce resultados no válidos, ya que la LM head solo tiene filas en los tokens de decisión.
- Requiere atención bidireccional de prefijo (`prefix_bidir`); servirlo con atención causal estándar altera el comportamiento esperado.
- La cabeza `lm_head` debe servirse en BF16; otras precisiones pueden degradar la salida.
- No incluye cabeza MTP, por lo que no se puede usar decodificación especulativa basada en MTP.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un clasificador de decisión, el riesgo se traslada a decisiones erróneas más que a texto inventado.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el `NOTICE` y citar d3-ultra según indica el autor.
- Dependencia del ecosistema Atlas/SparkScore: no hay rutas de despliegue estándar documentadas (vLLM, llama.cpp, etc.).
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Enntity/d3-ultra-NVFP4
- Modelo base d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
- Paquete equivalente de vLLM Semantic Router: https://huggingface.co/vllm-sr/d3-ultra-NVFP4
- Repositorio SparkScore: https://github.com/Enntity/sparkscore
- Motor Atlas: https://github.com/Atlas-Inf/atlas
- Referencia de formato Qwen3.8-27B-NVFP4: https://huggingface.co/a2genesis/Qwen3.8-27B-NVFP4
- Nemotron-3-Ultra-550B-A55B-NVFP4 (comparativa): https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b/modelcard
