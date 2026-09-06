# Jon-Nielsen/Qwen3.8-Flash-Next-AWQ-INT4-FP8PLE

## Resumen

El modelo Qwen3.8-Flash-Next-AWQ-INT4-FP8PLE es una cuantización AWQ-INT4 del modelo Qwen3.8-Flash-Next, desarrollada por Jon-Nielsen. El modelo base es un sistema híbrido de Mixture of Experts (MoE) con 125.000 millones de parámetros principales, complementado con 51.000 millones de parámetros de embeddings n-gram (PLE), y activa 6.000 millones de parámetros por token. Esta variante cuantizada está diseñada para permitir el despliegue en servidores con múltiples GPUs de consumo, como 8× RTX 3090 de 24 GB, utilizando el fork wtdcode/vllm-backport.

La principal innovación técnica de esta versión es la conversión de la tabla de lookup PLE (n-gram embeddings) de BF16 a FP8 e4m3, lo que reduce el footprint de memoria RAM pinneada de aproximadamente 95 GiB a 48 GiB cuando se activa el offload a CPU (VLLM_PLE_CPU_OFFLOAD=1). Los expertos del MoE se cuantizan con AWQ INT4 asimétrico de grupo 32, mientras que las capas de atención, normalizaciones, MTP y la tabla PLE se mantienen en alta precisión. El resultado es un checkpoint de 127,72 GiB distribuido en 38 shards safetensors, con 78.550.400.916 parámetros totales en el repositorio.

El modelo es relevante porque permite ejecutar un modelo de la familia Qwen3.8 con contexto nativo de 262.144 tokens en hardware de gama media-alta, manteniendo un rendimiento de decodificación de aproximadamente 100 tokens por segundo en la configuración verificada. La licencia es Qwen Community License 1.0, que impone condiciones específicas para usos comerciales a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido (atención, Mamba, MTP, PLE n-gram embeddings) |
| Parámetros totales | 78.550.400.916 (en el repo cuantizado) |
| Parámetros activos | 6.000 millones por token (modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | AWQ INT4 asimétrico (grupo 32) para expertos; FP8 e4m3 para tabla PLE; alta precisión para attention, norms y MTP |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (38 shards), compressed-tensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina una arquitectura de Mixture of Experts con capas de atención estándar, capas Mamba (state space model) y un mecanismo de predicción multi-token (MTP). Además, incorpora una capa PLE (n-gram embeddings) con 51.000 millones de parámetros que actúa como lookup table para mejorar la generación. Según la documentación del proyecto, el modelo activa 6.000 millones de parámetros por token y reduce el coste de entrenamiento e inferencia en aproximadamente un noveno en comparación con Qwen3.7-Plus, manteniendo capacidades superiores en tareas de programación y ofimática.

En esta variante cuantizada, los expertos del MoE se comprimen con AWQ INT4 asimétrico de grupo 32, mientras que las capas de atención, normalizaciones, MTP y la tabla PLE se mantienen en alta precisión. La tabla PLE se convierte de BF16 a FP8 e4m3 mediante el script serving/convert_fp8_ple.py, utilizando una escala global bf16 de 0,00019931793212890625. La conversión se verificó con una SNR de 31,5 dB en el shard 0 y un error relativo máximo de 0,195, sin cambios de dtype en los tensores no-PLE.

## Capacidades

- Generación de texto con contexto largo nativo de 262.144 tokens.
- Capacidades mejoradas en tareas de programación y ofimática, según la documentación del modelo base.
- Decodificación especulativa MTP-3 con 4 tokens por paso, lo que acelera la inferencia.
- Soporte de MoE con paralelización de expertos (Marlin WNA16) para aprovechar múltiples GPUs.
- Mecanismo PLE (n-gram embeddings) que complementa la generación con información de contexto de alta dimensionalidad.
- Capacidad de offload de la tabla PLE a CPU, reduciendo el uso de VRAM.
- Soporte de Mamba con modo de caché alineado (--mamba-cache-mode align) para optimizar la memoria.

## Casos de uso

- Despliegue de un modelo de 125B en servidores con GPUs de consumo: la cuantización AWQ INT4 y el offload de la tabla PLE a CPU permiten ejecutar el modelo en 8× RTX 3090 de 24 GB, lo que reduce significativamente el coste de hardware en comparación con GPUs de centro de datos.
- Análisis de documentos extensos: con un contexto nativo de 262.144 tokens, el modelo puede procesar manuales técnicos, contratos o bases de conocimiento completas sin necesidad de fragmentar el texto.
- Generación de código y revisión de repositorios: las capacidades de programación del modelo base, junto con la decodificación especulativa, permiten usarlo en asistentes de código integrados en pipelines de CI/CD.
- Tareas de ofimática y automatización de documentos: el modelo destaca en tareas de oficina según la documentación, lo que lo hace adecuado para resúmenes, redacción de informes y extracción de datos estructurados.
- Investigación en eficiencia de cuantización: la conversión de la tabla PLE a FP8 y su integración en checkpoints compressed-tensors sirve como referencia para optimizar el despliegue de modelos MoE híbridos en memoria limitada.
- Servicio de inferencia con vLLM backport: el modelo está preparado para ejecutarse con docker-compose en el fork wtdcode/vllm-backport, lo que facilita su integración en entornos de producción con múltiples GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el serving verificado utiliza 8× RTX 3090 de 24 GB (192 GB en total). La tabla PLE se puede offload a CPU, reduciendo la RAM pinneada de ~95 GiB a ~48 GiB.
- GPU recomendadas: 8× RTX 3090 24 GB (PCIe, sin NVLink) para la configuración verificada. No se han proporcionado recomendaciones para otras GPUs.
- ¿Cabe en consumer GPU? Sí, pero requiere múltiples GPUs (TP=8) y suficiente RAM del sistema para el offload de la tabla PLE.
- Opciones de despliegue: vLLM backport (wtdcode/vllm-backport) con docker compose; se utiliza Marlin WNA16 para la decodificación MoE y cudagraphs FULL_AND_PIECEWISE.
- Latencia y throughput: ~100 tokens/s de decodificación en la configuración verificada; pool KV de 582.370 tokens a 0,9 de utilización de memoria GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-AWQ-INT4-FP8PLE | 78,55B (repo) / 125B + 51B PLE (base) | 262.144 | ~100 tok/s (8× RTX 3090) | Qwen Community 1.0 | HuggingFace |
| Qwen/Qwen3.8-Flash-Next | 125B + 51B PLE | no disponible | no disponible | Qwen Community 1.0 | HuggingFace |
| Qwen/Qwen3.8-Flash-Next-FP8 | no disponible | no disponible | no disponible | Qwen Community 1.0 | HuggingFace |

Según la documentación del proyecto, Qwen3.8-Flash-Next reduce el coste de entrenamiento e inferencia en aproximadamente un noveno en comparación con Qwen3.7-Plus, con capacidades superiores en programación y tareas de oficina. No se han publicado datos numéricos de benchmarks en la información disponible.

## Limitaciones y advertencias

- La licencia Qwen Community License 1.0 exige mostrar el nombre del modelo en productos comerciales con más de 100.000.000 de usuarios activos mensuales o más de 20.000.000 de dólares de ingresos mensuales. Ofrecer el modelo como servicio comercial "Model as a Service" o "AI Work Assistant" requiere una licencia separada de Qwen.
- El checkpoint requiere el fork específico wtdcode/vllm-backport y el overlay ple_layer.py; sin estos componentes, el modelo no carga correctamente.
- El fork tiene restricciones: no se puede combinar ningún conector KV con PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True. Con decodificación especulativa, es necesario establecer --max-num-batched-tokens igual al tamaño de bloque del modelo (400).
- Al ser una cuantización, puede haber una pérdida de calidad en comparación con el modelo original, aunque la tabla PLE se mantiene con un error relativo máximo de 0,195.
- No se han publicado estudios sobre sesgos, alucinaciones o limitaciones de idioma en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Jon-Nielsen/Qwen3.8-Flash-Next-AWQ-INT4-FP8PLE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización AWQ-INT4 original: https://huggingface.co/cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4
- Referencia FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Fork de vLLM: https://github.com/wtdcode/vllm-backport
- Repositorio del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
