# FlagRelease/Xing4.1-Preview-W8A8-iluvatar-FlagOS

## Resumen

Xing4.1-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por FlagRelease dentro de la familia Xingchen Semantic Large Model, orientado a programación de agentes y tareas complejas de horizonte largo. Cuenta con 285 mil millones de parámetros totales (279.902.121.728 según los pesos en safetensors) y aproximadamente 17 mil millones activados por token, con una ventana de contexto nativa de 1 millón de tokens. La arquitectura combina MLA (Multi-head Latent Attention) para la representación comprimida de KV y DSA (DeepSeek Sparse Attention), sobre un backbone Transformer de 45 capas, 42 de las cuales son capas MoE.

La relevancia de esta ficha concreta reside en que no se trata del checkpoint original, sino de una adaptación W8A8 (cuantización INT8 de pesos y activaciones) publicada por FlagRelease para su despliegue sobre la pila FlagOS y aceleradores Iluvatar BI-V150, es decir, hardware de computación doméstico chino. El modelo fue entrenado íntegramente en plataformas de cómputo nacionales, y esta variante amplía las opciones de inferencia fuera del ecosistema NVIDIA.

El repositorio ocupa 281,5 GB e incluye código personalizado (`custom_code`) y tensores comprimidos en formato `compressed-tensors`. Está pensado para escenarios de flujos de oficina multi-paso, investigación profunda, generación de código y cargas de trabajo intensivas en documentos, con soporte de conmutación de modo de razonamiento (thinking mode), tool calling y salida estructurada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con MLA y DSA (sparse attention); `model_type=deepseek_v32` |
| Parámetros totales | 285B (279.902.121.728 en safetensors) |
| Parámetros activos | ~17B por token |
| Longitud de contexto | 1M tokens (nativo) |
| Tipos de cuantización | W8A8 (INT8 pesos y activaciones), formato `compressed-tensors` |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8-bit, compressed-tensors) |
| Capas | 45 (42 MoE) |
| Hidden size | 4096 |
| Expertos | 256 enrutados, top-8 + 1 compartido |
| Vocabulario | 131.072 |
| MLA kv_lora_rank | 512 |
| DSA index_topk | 2048 |
| MTP | No |
| Tamaño del repo | 281,5 GB (263 GB de pesos, 276 archivos) |

## Arquitectura y entrenamiento

El modelo sigue un backbone Transformer de 45 capas, de las cuales 42 son capas MoE. En cada token se seleccionan 8 expertos de un total de 256 enrutados, más un experto compartido, lo que da lugar a los ~17B parámetros activos sobre los 285B totales. La atención utiliza MLA con `kv_lora_rank=512`, que comprime la representación de clave-valor para reducir el coste de memoria del KV cache, y DSA con `index_topk=2048`, una atención dispersa que limita el número de posiciones atendidas por token. No incorpora predicción multi-token (MTP). El vocabulario es de 131.072 tokens.

Según la model card, el modelo se entrenó sobre plataformas de cómputo totalmente domésticas (chinas). No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La variante aquí descrita es una adaptación de despliegue: cuantización W8A8 en formato `compressed-tensors` y empaquetado para la pila FlagOS sobre Iluvatar BI-V150, con un contenedor Docker que integra vLLM 0.32.0, vllm-plugin-FL, FlagGems y el plugin de plataforma correspondiente.

## Capacidades

- Generación de texto y razonamiento de horizonte largo, con ventana de contexto nativa de 1M tokens.
- Conmutación de modo de razonamiento (thinking mode) activable o desactivable.
- Tool calling y function calling.
- Salida estructurada (structured output).
- Razonamiento multi-paso y flujos de agente.
- Generación de código y tareas de programación de agentes.
- Capacidades matemáticas (evaluado en MATH-500 en la variante NVIDIA).
- Procesamiento de documentos intensivos y flujos de oficina multi-paso.
- Multilingüe limitado a chino e inglés.

## Casos de uso

- Agentes de automatización de oficina: el modelo puede encadenar varios pasos (leer documento, extraer datos, generar respuesta, llamar a herramientas) manteniendo el estado en una ventana de 1M tokens, adecuado para flujos administrativos largos.
- Investigación profunda (deep research): con contexto de 1M tokens puede ingerir corpus documentales extensos y razonar sobre ellos sin truncamiento, apoyándose en el modo thinking para tareas analíticas.
- Generación de código en pipelines: el soporte de tool calling y salida estructurada permite integrarlo en CI/CD para generar parches, tests o revisiones automatizadas con formato verificable.
- Atención al cliente multi-turno: la ventana de contexto larga permite conservar historiales extensos y documentación de producto en la misma sesión, reduciendo la pérdida de contexto entre turnos.
- Análisis de contratos y documentación legal: procesamiento de documentos densos en chino e inglés con extracción estructurada de cláusulas y campos.
- Despliegue en infraestructura no-NVIDIA: esta variante W8A8 sobre Iluvatar BI-V150 permite servir el modelo en clústeres con aceleradores domésticos, útil en entornos con requisitos de soberanía tecnológica.
- Asistentes de programación con agentes: razonamiento multi-paso sobre repositorios y llamadas a herramientas de build o test.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card:

| Métrica | Xing4.1-Preview-W8A8-Nvidia-Origin | Xing4.1-Preview-W8A8-Iluvatar-FlagOS |
|---|---|---|
| MATH-500 | 95,20 | En evaluación |
| GPQA-Diamond | En evaluación | En evaluación |

La evaluación FlagEval (GPQA-Diamond / MATH-500) se envió el 2026-11-20 a través de la plataforma Auto-Evaluation (`eval_model=xing4.1-preview-tianshu-20261120-2355`, `request_id=3c7b33d8-6bbd-4dc4-9cde-fe97834408e1`, `batch_id=30680`, región `tianshu`). El lote terminó con estado `C` (cancelado) en `0/0` datasets, sin muestras servidas, por lo que no hay cifras disponibles para la variante Iluvatar. El reenvío está pendiente.

Rendimiento de inferencia medido (4k entrada / 1k salida, `vllm bench serve`, 2 rondas de calentamiento + 1 medida, `--ignore-eos`, concurrencia fija 64, `--max-model-len 66560`, `max-num-seqs 64`):

| Configuración | Output tok/s | Total tok/s | TTFT medio | TPOT medio |
|---|---|---|---|---|
| TP16 graph (PIECEWISE cap=8), 64 concurrentes | 25,36 | 129,25 | 823,6 s | 1173,1 ms |

- 64/64 peticiones exitosas, 0 fallos; pico de salida de 82 tok/s.
- El KV cache alberga 172.736 tokens, por lo que con entradas de 4k solo corren ~41 peticiones simultáneas y el resto hace cola; TTFT y E2EL incluyen tiempo de encolamiento.
- Los puntos de 16k y 32k no se han medido todavía.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el despliegue validado usa 16 GPU Iluvatar BI-V150 de 32 GB (512 GB de VRAM agregada) en un solo nodo con TP16.
- GPU recomendadas: Iluvatar BI-V150 32GB ×16 (configuración validada). Para la variante NVIDIA original no se detalla la configuración en la información disponible.
- Memoria de host: ≥ 512 GB.
- Disco: ≥ 300 GB para los pesos (263 GB, 276 archivos).
- Sistema operativo: Ubuntu 22.04 (kernel 5.4.0-148-generic).
- Driver: CoreX 4.5.0, obligatoriamente la build con kmd `iluvatar.ko` sha256 `6fed4040…` y umd `libcuda.so.1` sha256 `492a8447…`. La build `4.5.0.20260509` no soporta captura de CUDA Graph y solo ejecuta en modo eager.
- No cabe en GPU de consumo: el tamaño (285B, 263 GB de pesos en INT8) requiere un nodo multi-GPU.
- Opciones de despliegue: contenedor FlagOS con vLLM 0.32.0 + vllm-plugin-FL + FlagGems sobre CoreX 4.5.0; modo graph (PIECEWISE, `CAPTURE_SIZES=8`) recomendado y validado, o modo eager si la build de driver no soporta CUDA Graph.
- Throughput medido: 25,36 tok/s de salida y 129,25 tok/s totales con 64 concurrentes en TP16; TTFT medio de 823,6 s y TPOT medio de 1173,1 ms en ese escenario (incluye encolamiento).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Xing4.1-Preview-W8A8-Iluvatar-FlagOS | 285B | ~17B | 1M | Apache 2.0 | Variante INT8 para Iluvatar BI-V150; MATH-500 pendiente en esta pila |
| Xing4.1-Preview-W8A8-Nvidia-Origin | 285B | ~17B | 1M | Apache 2.0 | Misma arquitectura; MATH-500 = 95,20 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables en la información disponible |

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no hay soporte declarado para castellano ni otras lenguas.
- Riesgo de alucinación inherente a modelos de gran escala; no se documentan mitigaciones específicas en la información disponible.
- Los benchmarks de la variante Iluvatar están pendientes (lote cancelado sin muestras), por lo que no hay validación de calidad publicada para esta pila concreta.
- El rendimiento medido es bajo en el escenario probado (25,36 tok/s de salida con 64 concurrentes) y el TTFT incluye encolamiento por límite de KV cache; no se han medido contextos de 16k ni 32k.
- Dependencia estricta de la build de driver CoreX 4.5.0: varias builds comparten el string de versión y solo algunas soportan CUDA Graph; es necesario verificar los sha256 del kmd y umd.
- El contenedor requiere `--privileged`, montaje de `/dev`, `/sys`, `/lib/modules` y `/usr/src`, y bind-mount del userspace CoreX del host; sin él, `torch.cuda.is_available()` devuelve False y el plugin de plataforma no carga.
- El directorio de trabajo debe estar fuera de `/workspace` (`-w /`), ya que con instalaciones editables `vllm` se resuelve como namespace package.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía.
- No incorpora MTP, lo que limita técnicas de decodificación especulativa basadas en predicción multi-token.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Xing4.1-Preview-W8A8-iluvatar-FlagOS
- Repositorio de pesos vía ModelScope: `modelscope download --model FlagRelease/Xing4.1-Preview-W8A8-iluvatar-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/hy4-flash-iluvatar-bi-v150-gems5.3.4-pluginfl-27cc489-vllm0.32.0-corex4.5.0:xing4.1-285b-iluvatar-20261120-graph`
- Documentación de soporte de CUDA Graph: `CUDA_GRAPH_NOT_SUPPORTED.md` (referenciado en la model card)
- Scripts de inferencia: `/work/vllm_serve` (incluido en la imagen)
- Paper, blog o demo oficiales: no disponible en la información proporcionada
