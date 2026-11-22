# quocbao747/Qwen3.8-Flash-Next-Uncensored-NVFP4-2xGB10

## Resumen

Qwen3.8-Flash-Next-Uncensored-NVFP4-2xGB10 es una distribucion cuantizada y empaquetada para despliegue del modelo Qwen3.8-Flash-Next-Uncensored, un modelo de lenguaje multimodal (image-text-to-text) de arquitectura Mixture of Experts (MoE) con atención dispersa QSA, embeddings n-gram PLE y cabeza MTP para decodificación especulativa. Lo publica el usuario quocbao747 en Hugging Face como espejo byte a byte del checkpoint original de orcarouter, al que añade las herramientas, parches y configuraciones necesarias para reproducir un despliegue en produccion sobre dos nodos NVIDIA DGX Spark (GB10).

El modelo resuelve el problema de servir un modelo de ~180.000 millones de parametros con ventana de contexto de hasta 1.048.576 tokens (1M) en hardware de escritorio de gama alta para IA, en lugar de requerir un clúster de GPUs de centro de datos. Para ello combina cuantizacion weight-only con compressed-tensors (capas densas y lm_head en FP8 per-channel, expertos en NVFP4), paralelismo tensorial de grado 2 entre los dos nodos y una tabla PLE exportada en FP8 servida desde NVMe.

La relevancia actual del artefacto es doble: por un lado, demuestra que es posible ejecutar un MoE multimodal de 180B con contexto de 1M tokens en 256 GB de memoria unificada repartida en dos nodos; por otro, documenta de forma exhaustiva la topologia de red (RoCE v2 sobre un cable directo de 200 GbE), las metricas de produccion y las lecciones aprendidas, lo que lo convierte en una referencia practica para despliegues multi-nodo de bajo presupuesto. El repositorio pesa 234,1 GB y acumula 71 descargas y 2 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-Flash-Next (Qwen4-exp), MoE con vision, atencion dispersa QSA con indexer, embedding n-gram PLE y cabeza MTP |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 nativos; 1.048.576 con YaRN x4 |
| Tipos de cuantizacion | Weight-only con compressed-tensors: capas densas y lm_head en FP8 per-channel (W8A16); expertos en NVFP4 (W4A16); tabla PLE exportada en FP8 por rango TP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (17 shards, 183 GB / 170 GiB) + model-mtp.safetensors + binarios PLE FP8 por rango |

## Arquitectura y entrenamiento

El modelo es un transformer Mixture of Experts multimodal con atención dispersa QSA (Qwen Sparse Attention) e indexer propio, lo que permite manejar ventanas de contexto muy largas sin que el coste de atención crezca de forma cuadratica sobre todos los tokens. Incorpora además una tabla de embeddings n-gram PLE (layer-1) de 320 millones de filas y 160 dimensiones, almacenada en BF16 en el checkpoint original (~95 GiB) y exportada en este repositorio como dos shards FP8 de 25,6 GB cada uno, uno por rango de paralelismo tensorial, para servirse desde NVMe. Dispone de una cabeza MTP (Multi-Token Prediction) empaquetada aparte en `model-mtp.safetensors`, empleada para decodificación especulativa con dos tokens draft.

La cuantizacion es weight-only: no se incluyen escalas de activación, por lo que los kernels W4A4 no son aplicables y los expertos MoE se ejecutan mediante Marlin. El checkpoint corresponde al commit `56eb374a747fe0c359983553d869c27b86d1c8ce` del modelo base de orcarouter y es un espejo byte a byte del mismo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada. El sufijo "Uncensored" del nombre indica que el modelo base ha sido sometido a un proceso de reduccion de rechazos, aunque no se detalla la metodologia.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventanas de hasta 1.048.576 tokens gracias a YaRN x4 sobre los 262.144 nativos.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que habilita tareas de vision-lenguaje como descripcion de imagenes, VQA y extraccion de informacion de documentos.
- Generacion de codigo y matematicas: el modelo base Qwen3.8-Flash-Next esta orientado a tareas de razonamiento y programacion, aunque no se publican benchmarks en este repositorio.
- Decodificacion especulativa mediante cabeza MTP con dos tokens draft, que incrementa el throughput de decodificacion.
- Soporte de tool calling y function calling a traves del servidor compatible con la API de OpenAI incluido en el despliegue (rank 0 expone el endpoint).
- Capacidad de agentes y razonamiento multi-paso: la ventana de 1M tokens permite mantener historiales largos de herramientas y observaciones.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo "uncensored": reduccion de rechazos respecto al modelo alineado original, segun el nombre del checkpoint.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir un arbol de codigo extenso y responder preguntas transversales sobre arquitectura, dependencias y deuda tecnica sin trocear el repositorio.
- Procesamiento de documentos largos con vision: contratos, informes financieros o expedientes escaneados de cientos de paginas se pueden enviar como imagenes y texto en una sola peticion, aprovechando el pipeline image-text-to-text y la ventana extendida.
- Agentes autonomos con historial extenso: el soporte de tool calling y la ventana de 1M permiten mantener trazas de herramientas, resultados intermedios y contexto de sistema sin truncar, lo que reduce la perdida de informacion en tareas multi-paso.
- Atencion al cliente especializada: conversaciones multi-turno con contexto de producto, historial de tickets y base de conocimiento embebida en el prompt, servidas a 63-66 tok/s por stream segun las metricas del autor.
- Generacion de codigo en produccion: integracion en pipelines de CI/CD mediante el endpoint compatible con OpenAI para revisiones de codigo, generacion de tests y explicacion de diffs, con throughput agregado de 236 tok/s a 8 streams.
- Investigacion sobre alineacion y modelos sin censura: el checkpoint "uncensored" sirve como objeto de estudio para medir diferencias de comportamiento respecto al modelo alineado, siempre con las cautelas de uso responsable.
- Despliegue en laboratorios con hardware de gama alta para IA: dos DGX Spark conectadas por un cable directo de 200 GbE permiten servir el modelo sin infraestructura de centro de datos, util para prototipos y demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica metricas de rendimiento del despliegue medido:

| Metrica | Valor |
|---|---|
| Prefill a prompt de 8k | 3.723 tok/s |
| Prefill a prompt de 1M | 2.737 tok/s |
| Decodificacion, un stream | 63-66 tok/s (MTP, 2 tokens draft) |
| Decodificacion, 8 streams | 236 tok/s agregados |
| Time to first token, prompt de 1M | 6,2 min |
| Pool de KV cache | 3,76 M tokens (KV FP8 + indexer FP8, presupuesto de 28 GB) |

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint pesa 183 GB (170 GiB) en safetensors, mas la tabla PLE FP8 (2 x 25,6 GB) y el pool de KV cache (28 GB de presupuesto en la configuracion de referencia). El despliegue documentado usa 2 x 128 GB de memoria unificada.
- GPU recomendadas: 2 x NVIDIA DGX Spark (GB10 Grace-Blackwell, sm_121a), con paralelismo tensorial 2. No se documenta despliegue en A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en consumer GPU: no en una sola; el despliegue de referencia requiere dos nodos con 128 GB de memoria unificada cada uno.
- Interconexion: un cable directo QSFP de 200 GbE entre los puertos ConnectX-7 de ambos nodos, RoCE v2, MTU 1500, con NCCL sobre ambas mitades PCIe x4 del puerto.
- Opciones de despliegue: vLLM nightly 0.30.1rc1.dev616 con parches incluidos en `deploy/`; el repositorio usa la libreria transformers y formato safetensors, e incluye scripts de lanzamiento, benchmark y calidad.
- Latencia y throughput: prefill de 3.723 tok/s a 8k y 2.737 tok/s a 1M; decodificacion de 63-66 tok/s por stream y 236 tok/s agregados a 8 streams; TTFT de 6,2 minutos para un prompt de 1M tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, este artefacto se diferencia de las distribuciones habituales de modelos MoE abiertos en que incluye el stack completo de despliegue multi-nodo (parches de vLLM, exportacion PLE en FP8, launcher y metricas de produccion), no solo los pesos.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-NVFP4-2xGB10 | ~180B | 1.048.576 (YaRN x4) | Apache-2.0 | MoE multimodal cuantizado para 2 x DGX Spark |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El calificativo "Uncensored" implica una reduccion deliberada de rechazos; en produccion debe acompañarse de filtros y politicas de uso responsable, especialmente en aplicaciones de cara al publico.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se publican evaluaciones de fidelidad ni de tasa de alucinacion en la informacion disponible.
- La ventana de 1M tokens se obtiene mediante YaRN x4 sobre los 262.144 nativos, lo que puede degradar la calidad en contextos muy largos respecto al rango nativo; el autor no publica evaluaciones de calidad por longitud.
- El TTFT de 6,2 minutos para un prompt de 1M tokens hace inviable el uso interactivo con contextos maximos; conviene reservar la ventana completa para tareas por lotes.
- La cuantizacion es weight-only (W8A16/W4A16) sin escalas de activacion: los kernels W4A4 no son aplicables y los expertos se ejecutan en Marlin, lo que limita las optimizaciones disponibles.
- El despliegue de referencia depende de vLLM nightly (0.30.1rc1.dev616) y de parches propios, por lo que la reproducibilidad esta ligada a esa version concreta.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la procedencia y las condiciones del modelo base de orcarouter, ya que este repositorio es un espejo cuantizado.
- No se especifican los idiomas soportados ni se publican evaluaciones multilingues; el rendimiento en castellano no esta documentado.
- El hardware objetivo son dos DGX Spark con memoria unificada; no se documenta el comportamiento en GPUs de centro de datos con memoria HBM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quocbao747/Qwen3.8-Flash-Next-Uncensored-NVFP4-2xGB10
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4
- Documentacion del despliegue: https://huggingface.co/quocbao747/Qwen3.8-Flash-Next-Uncensored-NVFP4-2xGB10/tree/main/docs
- Scripts de despliegue: https://huggingface.co/quocbao747/Qwen3.8-Flash-Next-Uncensored-NVFP4-2xGB10/tree/main/deploy
- Tabla PLE en FP8: https://huggingface.co/quocbao747/Qwen3.8-Flash-Next-Uncensored-NVFP4-2xGB10/tree/main/ple-fp8
- DOI: https://doi.org/10.57967/hf/11247
