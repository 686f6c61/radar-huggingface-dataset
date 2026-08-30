# Akicou/Qwen3.8-Flash-Next-REAM-60Pct-GGUF

## Resumen

El modelo **Akicou/Qwen3.8-Flash-Next-REAM-60Pct-GGUF** es una versión comprimida del modelo Qwen3.8-Flash-Next de Qwen, generada mediante la técnica REAM (Router Expert Activation Merging). REAM elimina el 40% de los expertos enrutados en cada capa, reduciendo el número de expertos de 512 a 308 por capa, lo que disminuye el tamaño del modelo y los requisitos de memoria sin modificar la arquitectura base. El resultado se ha convertido a formato GGUF para su uso directo con llama.cpp y runtimes compatibles.

Este lanzamiento es experimental y no ha sido evaluado con benchmarks públicos. Está pensado para desarrolladores que necesitan ejecutar un modelo de razonamiento de gran tamaño en entornos con recursos limitados, aprovechando la cuantización GGUF para reducir aún más la huella de memoria. El modelo base, Qwen3.8-Flash-Next, es un MoE ultra disperso de 125B parámetros con 6B activos por token, que combina atención lineal híbrida (Gated DeltaNet) y atención dispersa de Qwen (QSA), con una ventana de contexto de 262K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (híbrido Gated DeltaNet + Qwen Sparse Attention, MoE) |
| Parametros totales | 128.789.193.600 (~128,8 mil millones) |
| Parametros activos | no disponible (el modelo base activa 6B por token) |
| Longitud de contexto | no disponible (el modelo base soporta 262K tokens) |
| Tipos de cuantizacion | Q8_0 (~8,5 bits/peso, ~137 GB), Q4_K_S (~4,5 bits/peso, ~82 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura del modelo base, Qwen3.8-Flash-Next, combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de forma eficiente, y la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de información a largo plazo. El modelo tiene 48 capas y 512 expertos enrutados por capa, con una tabla de embeddings N-gram adicional de 51B parámetros.

REAM (Router Expert Activation Merging) poda el 40% de los expertos enrutados, reduciendo cada capa de 512 a 308 expertos. Los expertos compartidos, la atención y los embeddings N-gram no se modifican; solo se fusionan los expertos enrutados. El checkpoint comprimido se convirtió a GGUF con `convert_hf_to_gguf.py` en bf16 y se cuantizó con `llama-quantize` sin usar matriz de importancia. No se ha realizado ningún fine-tuning posterior a la compresión, por lo que el modelo conserva las capacidades del original pero con una posible degradación de rendimiento no medida.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-Flash-Next.
- Soporte de tool calling y function calling, disponible en el modelo base (no verificado en esta versión comprimida).
- Capacidad de agentes y razonamiento multi-paso, presente en el modelo base.
- Multilingüismo limitado: la model card solo declara inglés, aunque el modelo base soporta múltiples idiomas.
- No se ha confirmado soporte multimodal en esta versión GGUF; el modelo base es multimodal, pero la conversión GGUF se centra en texto.
- Modo de razonamiento avanzado (thinking mode) disponible en el modelo base, no confirmado aquí.

## Casos de uso

- Inferencia local en hardware limitado: gracias a la cuantización Q4_K_S (~82 GB), el modelo puede ejecutarse en una GPU de 80 GB (A100, H100) o en configuraciones multi-GPU, o incluso en CPU con suficiente RAM, usando llama.cpp.
- Prototipado rápido de aplicaciones de generación de texto: al ser GGUF, se integra fácilmente con Ollama, llama.cpp y otros runtimes, permitiendo pruebas sin necesidad de cargar el modelo completo en memoria.
- Asistente de código en entornos sin conexión: el modelo base tiene buenas capacidades de generación de código; esta versión comprimida permite desplegarlo en estaciones de trabajo con menos VRAM.
- Análisis de documentos largos: con una ventana de contexto de 262K (heredada del modelo base), puede procesar informes extensos, aunque no se ha verificado en esta versión.
- Investigación en compresión de modelos: sirve como referencia para estudiar el impacto de la poda de expertos en modelos MoE de gran escala.
- Despliegue en entornos de producción con restricciones de memoria: la cuantización Q8_0 ofrece mayor fidelidad (~137 GB) para casos donde la precisión es crítica, mientras que Q4_K_S reduce el consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el lanzamiento es experimental y no ha sido evaluado. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras pruebas comparativas para esta versión comprimida.

## Requisitos de hardware

- VRAM estimada: para Q4_K_S (~82 GB), se necesita al menos 82 GB de VRAM o memoria unificada; para Q8_0 (~137 GB), se requieren 137 GB o más.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 24GB no son suficientes para Q4_K_S, pero sí para versiones más pequeñas si existieran).
- En consumer GPU: no cabe en GPUs de 24 GB (RTX 4090) ni de 16 GB; se necesitan soluciones de memoria unificada como Apple Silicon con 128 GB o más.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama, llama-cpp-python, o servidores como llama-server.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Al ser un MoE con 6B activos, la inferencia es más rápida que un modelo denso de tamaño equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B embeddings | 262K | Apache 2.0 (según Qwen) | safetensors | Modelo original sin comprimir |
| Akicou/Qwen3.8-Flash-Next-REAM-60Pct-GGUF | 128,8B (comprimido) | no disponible | other | GGUF | Versión podada al 60% de expertos |
| DeepSeek-V3 (MoE) | 671B total, 37B activos | 128K | MIT | safetensors | Alternativa MoE de gran escala, no comparable en tamaño |

La comparativa directa con otros modelos comprimidos no está disponible. La principal diferencia con el modelo base es la reducción de expertos (308 vs 512 por capa) y el formato GGUF, que facilita el despliegue en runtimes como llama.cpp.

## Limitaciones y advertencias

- Lanzamiento experimental: no se han realizado benchmarks, por lo que el rendimiento real es desconocido y puede degradarse respecto al modelo base.
- Licencia "other" no especificada: no se detallan las restricciones de uso comercial; se recomienda consultar la licencia del modelo base Qwen3.8-Flash-Next.
- Idioma limitado: la model card solo declara inglés, aunque el modelo base es multilingüe; no se garantiza el soporte de otros idiomas.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no mitigado en esta versión.
- Sin soporte de tool calling verificado: aunque el modelo base lo tiene, no se ha confirmado en esta compresión.
- Requiere `trust_remote_code=True` para el modelo base, pero los archivos GGUF no lo necesitan al cargarse con llama.cpp.
- La poda de expertos puede afectar la coherencia en tareas que dependen de la especialización de los expertos eliminados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Akicou/Qwen3.8-Flash-Next-REAM-60Pct-GGUF
- Modelo base comprimido (safetensors): https://huggingface.co/Akicou/Qwen3.8-Flash-Next-REAM-60Pct
- Modelo original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de vLLM sobre Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de unsloth para ejecutar el modelo localmente: https://unsloth.ai/docs/models/qwen3.8-next
