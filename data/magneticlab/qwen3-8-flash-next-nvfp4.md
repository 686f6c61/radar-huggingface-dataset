# MagneticLab/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es una cuantización NVFP4 del modelo multimodal Qwen3.8-Flash-Next, publicada por MagneticLab. El objetivo es ejecutar el modelo completo, con sus 262 144 tokens de contexto nativos, en un único DGX Spark (GB10, 121 GiB de memoria unificada), cuando la receta original del modelo base requiere dos GPU GB300 en configuración TP2 o TP4. La cuantización afecta únicamente a los expertos enrutados (routed experts), mientras que la tabla n-gram PLE de 51 200 millones de parámetros se sirve desde un sidecar cuantizado y mapeado en memoria (mmap) de solo lectura.

El modelo base Qwen3.8-Flash-Next introduce una arquitectura híbrida GDN (Gated DeltaNet) + QSA (Quadratic Selective Attention) que combina atención lineal y atención cuadrática selectiva, junto con una tabla n-gram de búsqueda local para acelerar la generación. Esta versión cuantizada mantiene las capacidades de tool calling, visión y razonamiento del original, y ha sido validada con pruebas de needle-in-a-haystack hasta 185 000 tokens de prompt. El repositorio incluye el checkpoint cuantizado (186 GB), la tabla PLE sidecar (28,8 GB) y los overlays de vLLM necesarios para cargar la tabla cuantizada, todo en un solo paquete descargable.

La relevancia de esta ficha radica en que demuestra un despliegue práctico de un modelo de 176 000 millones de parámetros en hardware de consumo (una estación GB10), con métricas de rendimiento reales medidas en hardware, no estimadas. Es una opción viable para equipos que quieran ejecutar un MoE multimodal de gran tamaño sin recurrir a clústeres de GPU de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido GDN + QSA (atención lineal + cuadrática selectiva) con tabla n-gram PLE |
| Parametros totales | 176 B (incluye tabla PLE de 51,2 B) |
| Parametros activos | no disponible (MoE, no se especifica el número de activos por token) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (rutas de expertos), tabla PLE cuantizada en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (131 shards para el checkpoint principal, 128 shards para el sidecar PLE) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida que combina dos mecanismos de atención: GDN (Gated DeltaNet), una atención lineal con compuerta que reduce el coste computacional, y QSA (Quadratic Selective Attention), que aplica atención cuadrática selectiva para capturar dependencias de largo alcance. Además, incorpora una tabla n-gram de 51 200 millones de parámetros (PLE) que actúa como memoria de búsqueda local para acelerar la generación de tokens. El modelo es multimodal, con capacidades de visión y texto.

La cuantización NVFP4 de MagneticLab se aplica únicamente a los expertos enrutados del MoE, manteniendo el resto de pesos en precisión original. La tabla PLE se cuantiza por separado y se sirve desde un sidecar mapeado en memoria (mmap), lo que evita mantener 95 GB de tabla en RAM BF16. El proceso de entrenamiento del modelo base no está descrito en la información disponible; no se mencionan datos sobre el dataset, el número de tokens de entrenamiento ni el uso de RLHF o DPO. Los overlays de vLLM incluidos en el repositorio (`worker_image_quant.py` y `ple_layer_quant.py`) provienen del proyecto primitive-ai/Qwen3.8-Flash-Next-PLE-quant y están licenciados bajo Apache-2.0.

## Capacidades

- Generación de texto y razonamiento multi-step (soporta el parser de razonamiento `qwen3`).
- Tool calling / function calling mediante el parser `qwen3_xml`, con auto-selección de herramientas (`--enable-auto-tool-choice`).
- Capacidades multimodales: visión y texto (el modelo base es multimodal).
- Ventana de contexto nativa de 262 144 tokens, verificada con pruebas needle-in-a-haystack hasta 185 000 tokens de prompt.
- Búsqueda local de tokens mediante la tabla n-gram PLE, que acelera la generación sin sacrificar precisión.
- Compatible con vLLM (imagen `vllm/vllm-openai:qwen38-flash-next`), con soporte para prefix caching y ejecución distribuida con backend `mp`.

## Casos de uso

- Análisis de documentos extensos: con 262 144 tokens de contexto, el modelo puede procesar libros completos, expedientes legales o informes técnicos de cientos de páginas en una sola pasada, manteniendo coherencia global gracias a la atención híbrida GDN+QSA.
- Asistentes de programación con razonamiento: el soporte de tool calling y el parser de razonamiento permiten integrarlo en entornos de desarrollo para generar código, explicar fragmentos y ejecutar herramientas externas en flujos multi-paso.
- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto largo, y su capacidad de tool calling permite conectarlo a bases de conocimiento o APIs de CRM para resolver incidencias sin intervención humana.
- Análisis de imágenes y documentos escaneados: al ser multimodal, puede extraer información de capturas, diagramas o formularios, combinando la comprensión visual con el razonamiento textual para tareas como verificación de facturas o clasificación de tickets.
- Investigación académica: el modelo puede resumir y comparar artículos científicos completos, extraer conclusiones de largas cadenas de razonamiento y asistir en la redacción de revisiones bibliográficas.
- Despliegue en entornos con hardware limitado: al caber en un DGX Spark (121 GiB de memoria unificada), es viable para laboratorios o equipos que no disponen de clústeres de GPU, permitiendo experimentar con un MoE de 176 B en una estación de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento medidos corresponden a la inferencia en un DGX Spark, con MTP desactivado y el sidecar caliente:

| Concurrencia | Rendimiento agregado (tok/s) | Por stream (tok/s) |
|---|---|---|
| 1 | 16,9 | 16,9 |
| 2 | 31,7 | 15,9 |
| 4 | 54,5 | 13,6 |
| 8 | 87,2 | 10,9 |

Tiempos de prefill: 12,3 s a 25k tokens, 41,1 s a 99k, 70,4 s a 185k. Las pruebas needle-in-a-haystack pasan a 8k, 25k, 99k y 185k tokens de prompt. El uso de memoria en reposo es de 94-96 GiB de los 121,7 GiB disponibles, con un uso de swap de unos pocos GiB considerado normal.

## Requisitos de hardware

- Hardware mínimo validado: un DGX Spark (GB10) con 121 GiB de memoria unificada.
- VRAM estimada: 75,9 GiB de pesos en memoria, más 10 GiB de KV cache (configurable con `--kv-cache-memory`), más activaciones (~2 GiB). El total en reposo ronda los 94-96 GiB.
- GPU recomendadas: GB10 integrado en DGX Spark. No se ha validado en otras GPU; el modelo base requiere dos GB300 en FP8.
- No cabe en GPUs de consumo estándar (RTX 4090, 3090, etc.) por el tamaño del checkpoint y la memoria necesaria.
- Opciones de despliegue: vLLM con imagen `vllm/vllm-openai:qwen38-flash-next`; el repositorio incluye overlays para cargar la tabla PLE cuantizada. No se mencionan alternativas como Ollama o llama.cpp.
- Latencia y throughput: 16,9 tok/s con concurrencia 1, hasta 87,2 tok/s agregados con concurrencia 8. Prefill de 12,3 s a 25k tokens. El arranque en frío tarda 11-14 minutos, la mayor parte en streaming de pesos desde NVMe.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Hardware necesario | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16 original) | 176 B | 262 144 | BF16 | 2× GB300 (FP8) | Apache-2.0 |
| MagneticLab/Qwen3.8-Flash-Next-NVFP4 | 176 B | 262 144 | NVFP4 (expertos) | 1× DGX Spark (121 GiB) | Apache-2.0 |
| primitive-ai/Qwen3.8-Flash-Next-NVFP4 | 176 B | 262 144 | NVFP4 (expertos) | 1× GPU Blackwell 96 GB | Apache-2.0 |

La versión de MagneticLab se distingue por incluir la tabla PLE cuantizada en un sidecar mmap, lo que reduce la huella de RAM frente a la versión de primitive-ai que mantiene la tabla en RAM de host. Ambas cuantizaciones son funcionales, pero la de MagneticLab está validada específicamente para DGX Spark con métricas de rendimiento publicadas.

## Limitaciones y advertencias

- El uso de swap de memoria de unos pocos GiB es normal durante la inferencia debido al mmap de la tabla PLE; no debe interpretarse como un fallo, pero puede afectar a la latencia en accesos no calientes.
- No se debe habilitar MTP (Multi-Token Prediction): el checkpoint incluye un módulo MTP, pero las pruebas controladas muestran que no es recomendable; la documentación no detalla el motivo exacto.
- El arranque en frío tarda 11-14 minutos y requiere calentar el sidecar (`cat ple-sidecar/ples_nvfp4/* > /dev/null`) para evitar fallos a NVMe en las primeras peticiones.
- El flag `--distributed-executor-backend mp` es imprescindible; sin él, el servidor responde al health check pero nunca queda operativo.
- No se debe usar `--gpu-memory-utilization` ni limitar la memoria del contenedor; en el DGX Spark la memoria es unificada y estos ajustes causan errores `NVRM: NV_ERR_NO_MEMORY`.
- `--kv-cache-memory` tiene un mínimo de ~6,36 GiB para el contexto completo de 262 144 tokens; valores inferiores impiden el arranque.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantización; el rendimiento funcional está verificado, pero no su precisión relativa frente al modelo BF16.
- La licencia Apache-2.0 permite uso comercial, pero los overlays de vLLM provienen de un tercero (primitive-ai) y deben respetarse sus términos, también Apache-2.0.
- Los idiomas soportados no están documentados en la información disponible; se asume que hereda los del modelo base Qwen3.8-Flash-Next, pero no se puede confirmar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MagneticLab/Qwen3.8-Flash-Next-NVFP4
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio GitHub de despliegue dual DGX Spark (MiaAI-Lab): https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Dual-DGX-Sparks
- Cuantización NVFP4 de primitive-ai (fuente de los overlays): https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4
- Hilo del foro de NVIDIA sobre Qwen3.8-Flash-Next en DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
