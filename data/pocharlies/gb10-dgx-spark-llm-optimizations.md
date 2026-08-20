# pocharlies/gb10-dgx-spark-llm-optimizations

## Resumen

El repositorio `pocharlies/gb10-dgx-spark-llm-optimizations` es un conjunto de checkpoints optimizados en formato NVFP4 y recetas reproducibles para servir modelos de la familia Qwen3.6 y DeepSeek-V4 en el hardware NVIDIA GB10 (DGX Spark, arquitectura `sm_121`, 119.6 GiB de memoria unificada) mediante vLLM. No es un modelo de lenguaje en sí, sino un trabajo de ingeniería de rendimiento que aborda cuellos de botella específicos de este hardware, como la cuantización del `lm_head` y la restauración de cabezas MTP para decodificación especulativa.

La relevancia actual radica en que el GB10 es un equipo de escritorio de alto rendimiento pero con limitaciones de ancho de banda de memoria, y las optimizaciones presentadas consiguen mejoras de hasta un 47 % en velocidad de decodificación para modelos densos y un factor de 2.8× en decodificación especulativa para modelos MoE. Todo el trabajo está validado con mediciones reales en un clúster de dos nodos GB10, con contadores de Prometheus de vLLM como referencia.

El repositorio incluye dos modelos optimizados: **Ornith-1.0-35B-NVFP4-MTP-graft**, un MoE de 35B con 3B activos y 256 expertos, con cabeza MTP injertada y `lm_head` cuantizado a 4 bits; y **Qwen3.6-27B-uncensored-heretic-v2-NVFP4-lmheadW4**, un modelo denso de 27B sin censura con `lm_head` re-cuantizado a NVFP4. Ambos se distribuyen bajo licencias MIT y Apache-2.0 respectivamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de optimizaciones, no un modelo único; incluye un MoE de 35B-A3B y un denso de 27B) |
| Parametros totales | 35B (MoE) y 27B (denso) según el checkpoint |
| Parametros activos | 3B (en el MoE Ornith-1.0-35B) |
| Longitud de contexto | 131K tokens (medido en pruebas) y 245K en una pasada adicional |
| Tipos de cuantizacion | NVFP4 (W4A16), incluyendo cuantización del `lm_head`; KV cache en FP8 |
| Idiomas soportados | No disponible (los modelos base son multilingües, pero no se especifica en el repositorio) |
| Licencia | No disponible para el repositorio; los modelos incluidos: MIT (Ornith) y Apache-2.0 (Qwen3.6-27B) |
| Formato de pesos | Safetensors (con índices) y configuraciones de vLLM |

## Arquitectura y entrenamiento

El repositorio no describe un entrenamiento propio, sino un proceso de optimización sobre modelos base existentes. La arquitectura de los modelos subyacentes es transformer (Qwen3.6 y DeepSeek-V4), con variante MoE para el caso de 35B (256 expertos, 8 activos). Las innovaciones técnicas documentadas incluyen:

- **Cuantización del `lm_head`**: el tensor de salida se re-cuantiza de BF16 a NVFP4 W4A16 de forma aislada (cargando solo ese tensor, ~21 GB de pico) para evitar OOM en la memoria unificada del GB10. Esto supuso un +47% en velocidad de decodificación para el modelo denso de 27B.
- **Injerto de cabeza MTP**: cuando un fine-tune declara MTP en `config.json` pero no publica los tensores `mtp.*`, se copian los 19 tensores de una base arquitectónicamente idéntica para restaurar la decodificación especulativa, logrando ~100% de aceptación con K=3 y un factor de 2.8× en decodificación.
- **KV cache en FP8** en lugar de NVFP4, por limitaciones de hardware del GB10.
- **Backends de atención y GEMM**: FlashInfer para atención y Marlin para GEMM NVFP4, con flags específicos de vLLM.
- **Parámetros de muestreo**: se recomienda `temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5` porque temperatura 0 degrada el rendimiento en tool-calling.

No se proporcionan datos de entrenamiento, tokens o datasets; el repositorio se centra en la optimización de la inferencia.

## Capacidades

- **Servir modelos LLM de gran tamaño en GB10**: permite ejecutar modelos de hasta 35B de parámetros (MoE) y 27B (denso) en un hardware de escritorio con 119.6 GiB de memoria unificada.
- **Decodificación especulativa**: restauración e integración de cabezas MTP para acelerar la generación, con aceptación ~100% en K=3.
- **Tool-calling y agentes**: los checkpoints están validados con 370 casos deterministas de cadenas de herramientas, salida estructurada, disciplina de esquemas e inferencia NL→tool+args (346/370 aciertos).
- **Integración con vLLM**: soporte completo de `--enable-prefix-caching`, `--enable-chunked-prefill` y contadores Prometheus para monitorización.
- **Procesamiento de contexto largo**: funciona correctamente con hasta 131K tokens (y una pasada de 245K), con needle-in-a-haystack superado a 8K y 32K.
- **Visión sobre modelos de texto**: se documenta la integración de una pila de visión comunitaria en DeepSeek-V4-Flash-0731 (text-only) con aceptación de especulación mejorada de 0.0124 a 0.600.

## Casos de uso

- **Agentes de tool-calling en producción**: el modelo Ornith-1.0-35B es adecuado para agentes que necesitan encadenar llamadas a herramientas, estructurar salidas y mantener esquemas estrictos. Con 131K de contexto y 133 tok/s de decodificación, puede gestionar sesiones largas de agentes con múltiples turnos y razonamiento multi-paso.
- **CLI de generación de código**: el modelo denso de 27B, con 41.2 tok/s a 8K de contexto, sirve para asistentes de código en tiempo real dentro de un IDE o terminal, con baja latencia de TTFT (1.9 s a 131K).
- **Chat sin censura en entornos controlados**: el checkpoint "uncensored" (basado en abliteración de bajo daño, KL ≈ 0.0021 respecto al modelo original) permite desplegar asistentes de chat que eviten respuestas negativas, manteniendo coherencia y calidad.
- **Servicio de inferencia para equipos pequeños**: con un GB10 se puede servir un modelo MoE de 35B a ~25k tok/s agregados en dos nodos, suficiente para un equipo de desarrollo o laboratorio de investigación sin acceso a GPUs de centro de datos.
- **Investigación en decodificación especulativa**: el repositorio documenta mediciones por posición de aceptación de MTP, útil para quienes estudian la viabilidad de especulación en MoE y densos en hardware de consumo.
- **Optimización de costes de inferencia**: las recetas de cuantización del `lm_head` y el uso de KV cache FP8 reducen el ancho de banda consumido por paso de decodificación, lo que se traduce en mayor throughput por vatio y menor coste por token en hardware de borde.

## Benchmarks y rendimiento

Los datos de rendimiento se han medido en hardware real (2 nodos GB10) con vLLM y contadores de Prometheus. La siguiente tabla resume las velocidades de decodificación (single-stream, 512 tokens de salida) para el modelo MoE de 35B:

| Contexto | Ornith + MTP-graft + lm_head-W4 | Baseline nvidia/Qwen3.6-35B-A3B-NVFP4 | Ornith antes de optimizar |
|---|---|---|---|
| 1K | 174 tok/s | ~63 | 63.5 |
| 8K | 170 tok/s | 155 | 59.1 |
| 131K | 133 tok/s | ~88 | 27.1 |

Prefill a 131K: 47.8 s (frente a 518 s antes de la optimización, factor 10.8×). TTFT con caché a 131K: 1.9 s.

Para el modelo denso de 27B:

| Modelo | Decode @8K | @16K | @32K | Prefill @8K |
|---|---|---|---|---|
| **Optimizado (lm_head-NVFP4)** | **41.2** | 40.6 | 39.5 | 2155 |
| `nvidia/Qwen3.6-27B-NVFP4` (baseline) | 35.7 | 35.2 | 34.3 | 777 |
| Uncensored heretic-v2, BF16 `lm_head` | 28 | — | — | 2101 |
| Uncensored AEON-Ultimate + DFlash draft | 26 | 24.5 | 22.6 | 1740 |

En pruebas de tool-calling, el modelo optimizado logró 346/370 casos aciertos (343 antes de la optimización, dentro del ruido). Los tests de agente OpenClaw dieron 20/20 en el modo "exact-one" y 27/30 en "top-5".

## Requisitos de hardware

- **Hardware mínimo**: NVIDIA GB10 (DGX Spark) con 119.6 GiB de memoria unificada. Es el único hardware validado en el repositorio.
- **VRAM estimada**: para el modelo MoE de 35B, el checkpoint NVFP4 con `lm_head` cuantizado ocupa aproximadamente 21 GB del tensor `lm_head` más el resto del modelo; el pico de carga del tensor aislado es de ~21 GB. Para el denso de 27B, la memoria total es inferior a 30 GB en NVFP4.
- **GPU recomendadas**: GB10 con arquitectura `sm_120` (Blackwell). No se mencionan GPUs de otras arquitecturas.
- **Compatibilidad con GPUs de consumo**: no se ha probado; el repositorio se centra exclusivamente en GB10.
- **Opciones de despliegue**: vLLM es el runtime principal, con flags específicos (`--enable-prefix-caching`, `--enable-chunked-prefill`, `VLLM_NVFP4_GEMM_BACKEND=marlin`, `VLLM_MARLIN_USE_ATOMIC_ADD=1`). Se pueden usar también llama.cpp u Ollama, pero no se documentan en el repositorio.
- **Latencia y throughput**: en dos nodos GB10, el modelo MoE alcanza ~25k tok/s agregados con batching continuo (c1→c64); el denso de 27B ~6k tok/s. La latencia de decodificación single-stream es de 174 tok/s a 1K de contexto.

## Comparativa con modelos similares

El repositorio no presenta una comparación con modelos de la misma categoría, sino con versiones sin optimizar de los mismos modelos. La comparación más relevante es contra los checkpoints oficiales de NVIDIA para GB10:

| Característica | Ornith-1.0-35B (optimizado) | nvidia/Qwen3.6-35B-A3B-NVFP4 | Qwen3.6-27B (optimizado) | nvidia/Qwen3.6-27B-NVFP4 |
|---|---|---|---|---|
| Tipo | MoE (35B-A3B) | MoE (35B-A3B) | Denso (27B) | Denso (27B) |
| Decode @1K | 174 tok/s | ~63 | — | — |
| Decode @8K | 170 tok/s | 155 | 41.2 | 35.7 |
| Prefill @8K | — | — | 2155 | 777 |
| Licencia | MIT | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Contexto | 131K | 131K | 131K | 131K |

La diferencia de rendimiento se debe a la cuantización del `lm_head` y a la restauración de la cabeza MTP, ambas técnicas específicas del GB10.

## Limitaciones y advertencias

- **Hardware específico**: todas las optimizaciones están medidas únicamente en GB10 (`sm_120`); no hay garantía de funcionamiento en otras arquitecturas.
- **Sesgos y censura**: el modelo "uncensored" es una variante abliterada que puede producir contenido ofensivo o inapropiado; su uso en producción requiere moderación humana.
- **Riesgo de alucinación**: no se documentan pruebas de alucinación específicas; el modelo base Qwen3.6 puede generar respuestas falsas o inventadas, especialmente en tareas de razonamiento.
- **Contexto y longitud**: aunque se probó hasta 245K tokens, el rendimiento decae significativamente a partir de 131K (133 tok/s frente a 174 tok/s a 1K). El uso de contextos muy largos aumenta la latencia de prefill (47.8 s a 131K).
- **Restricciones de licencia**: el repositorio no declara licencia explícita (no disponible); los modelos incluidos tienen licencias MIT y Apache-2.0, que permiten uso comercial, pero se recomienda verificar los términos de los modelos base originales (Qwen3.6, DeepSeek-V4).
- **Configuración de muestreo**: el repositorio advierte que `temperature 0` degrada el rendimiento en tool-calling; es obligatorio usar los parámetros recomendados para evitar bucles de repetición.
- **Estabilidad de producción**: las optimizaciones son experimentales y no se ofrecen garantías de estabilidad en entornos de producción; se recomienda monitorizar con Prometheus y validar con el harness de pruebas del repositorio.

## Enlaces

- Repositorio en HuggingFace: [pocharlies/gb10-dgx-spark-llm-optimizations](https://huggingface.co/pocharlies/gb10-dgx-spark-llm-optimizations)
- Modelo Ornith-1.0-35B-NVFP4-MTP-graft: https://huggingface.co/pocharlies/Ornith-1.0-35B-NVFP4-MTP-graft
- Modelo Qwen3.6-27B-uncensored-heretic-v2-NVFP4-lmheadW4: https://huggingface.co/pocharlies/Qwen3.6-27B-uncensored-heretic-v2-NVFP4-lmheadW4
- Guía de visión para DeepSeek-V4-Flash (en el repositorio): [deepseek-v4-flash-vision-gb10.md](https://huggingface.co/pocharlies/gb10-dgx-spark-llm-optimizations/tree/main)
- Foro de NVIDIA DGX Spark / GB10: https://forums.developer.nvidia.com/c/accelerated-computing/dgx-spark-gb10/719
- Guía general de optimización en GB10 (externa): https://github.com/omnia-projetcs/spark-dgx
