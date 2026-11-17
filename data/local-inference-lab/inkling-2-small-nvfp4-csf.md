# local-inference-lab/Inkling-2-Small-NVFP4-CSF

## Resumen

Inkling-2-Small-NVFP4-CSF es un checkpoint multimodal cuantizado del modelo Inkling 2 Small de Thinking Machines, publicado por el laboratorio independiente local-inference-lab. El modelo original es un transformer multimodal de tipo Mixture-of-Experts (MoE) con arquitectura de decodificador denso en atención y expertos enrutados, orientado a tareas de imagen-texto-a-texto, conversación, razonamiento y generación de código. Este checkpoint concreto reformatea los pesos para que puedan servirse en infraestructuras de inferencia local habituales, a cambio de una compresión agresiva de los expertos enrutados.

La aportación principal de esta versión no es un nuevo entrenamiento, sino una reempaquetado de precisión: los 48 decodificadores usan expertos enrutados en NVFP4 (valores E2M1 con escalas de bloque E4M3 cada 16 pesos) con escalas de activación estáticas calibradas, en lugar de mezclar NVFP4 y MXFP8 como hacía el release upstream. Además, las escalas de bloque de los 55.296 matrices de expertos se almacenan comprimidas sin pérdida mediante el esquema propietario `csf_32x2_v1`, lo que reduce el tamaño del repositorio a unos 329,9 GB para 633.818 millones de parámetros totales.

Es relevante ahora porque resuelve dos fricciones prácticas del despliegue local: la necesidad de cuantización por token en tiempo de ejecución (incompatible con paralelismo tensorial) y la mezcla de dos formatos de experto que obliga a disponer de dos conjuntos de kernels. Con este checkpoint, cualquier runtime que soporte el formato Model Optimizer NVFP4 estándar puede ejecutar los expertos de forma independiente por dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (decodificador con expertos enrutados + torre de visión + módulo DSpark) |
| Parametros totales | 633.818.031.824 (633,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (pesos feed-forward de DSpark), BF16 (atención, embeddings, cabeza de salida, torre de visión), FP32 (routers, convoluciones cortas, queries de atención residual) |
| Idiomas soportados | no disponible |
| Licencia | lil-license-1.0 (licencia "other", enlace en LICENSE del repo) |
| Formato de pesos | safetensors (48 shards de hasta 9,1 GB + `model-inputscales.safetensors` + `mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con decodificador MoE de 48 capas y 384 expertos enrutados por capa, lo que da un total de 55.296 matrices de expertos (gate, up y down por experto y capa). La atención se organiza en capas locales y ocho capas de atención global con convoluciones cortas (`k_sconv`, `v_sconv`). Incorpora una torre de visión en BF16 para el procesamiento de imagen, y un módulo auxiliar denominado DSpark con 99 tensores, que incluye atención, normalización, fusión y una cabeza de Markov, presumiblemente para decodificación especulativa o predicción multi-token.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que la model card del checkpoint cuantizado no los detalla y no se ha proporcionado la del modelo base. La innovación técnica documentada en este checkpoint es puramente de compresión y despliegue: los expertos enrutados se decodifican de MXFP8 a BF16, se desintercalan las filas `w13` en proyecciones gate (pares) y up (impares), y se empaquetan como NVFP4 con NVIDIA Model Optimizer en el commit `cc6963d`. Cada experto tiene su propia escala global (gate y up comparten `max(|gate|, |up|) / 2688`; down usa `max(|down|) / 2688`) y las escalas de bloque son `block_max / (6 * global_scale)` redondeadas a E4M3, sin búsqueda de escalas, AWQ ni smoothing. Las escalas de activación son estáticas y calibradas, de modo que ningún valor depende de las activaciones en tiempo de ejecución, lo que permite paralelismo tensorial sin comunicación entre dispositivos dentro de las capas de expertos.

## Capacidades

- Generación de texto y conversación multi-turno en modo `image-text-to-text`.
- Procesamiento de imágenes mediante torre de visión en BF16 (pipeline `image-text-to-text`).
- Razonamiento y matemáticas (el modelo base está etiquetado como `thinkingmachines/Inkling-2-Small`, con módulo DSpark orientado a decodificación especulativa).
- Generación de código y soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está poblado en el repo.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Decodificación especulativa mediante el módulo DSpark (15 matrices MXFP8 + 69 tensores BF16).

## Casos de uso

- Despliegue local de un modelo multimodal de gran escala: el checkpoint está diseñado para runtimes que ya sirven NVFP4 en formato Model Optimizer, de modo que un equipo con GPUs de centro de datos puede ejecutar los 384 expertos por capa sin necesidad de kernels MXFP8 adicionales.
- Servicio con paralelismo tensorial: al usar escalas de activación estáticas calibradas, cada dispositivo puede ejecutar su porción de cada experto sin intercambiar máximos por token dentro de las capas MoE, lo que simplifica el sharding en clústeres con interconexión limitada.
- Prototipado de asistentes multimodales: la pipeline `image-text-to-text` permite construir interfaces de chat que aceptan imágenes y texto, útil para demos internas y validación de producto antes de invertir en el modelo completo sin cuantizar.
- Investigación sobre cuantización extrema: el esquema `csf_32x2_v1` de compresión sin pérdida de escalas de bloque es un caso de estudio reproducible para quienes trabajan en formatos de baja precisión y quieren medir el impacto de NVFP4 en modelos MoE de más de 600.000 millones de parámetros.
- Evaluación comparativa de precisión: sirve para contrastar la calidad de NVFP4 con escalas estáticas frente al release upstream mixto (NVFP4 en capas 0-39, MXFP8 en 40-47), aislando el efecto del formato de experto.
- Fine-tuning o adaptación sobre pesos cuantizados: el formato estándar de Model Optimizer y los nombres de tensor de `Inkling2ForConditionalGeneration` en Transformers 5.23.0 facilitan la integración con pipelines de entrenamiento que operen sobre checkpoints cuantizados.
- Inferencia en un solo nodo multi-GPU: los 48 shards de hasta 9,1 GB y el archivo `mtp.safetensors` permiten distribuir la carga entre GPUs de un nodo sin necesidad de un clúster grande, siempre que la VRAM agregada supere ampliamente los 329,9 GB del repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 329,9 GB en disco; en VRAM se requiere al menos esa cifra más overhead de activaciones, escalas y buffers de runtime. Para un modelo de 633,8 mil millones de parámetros en NVFP4/BF16 mixto, es razonable planificar un nodo con 8×H100 80 GB (640 GB) o 8×H200 141 GB, aunque no se dispone de cifras oficiales de consumo.
- GPU recomendadas: H100 SXM/NVL, H200, B200 y A100 80 GB en configuraciones multi-GPU. No se dispone de datos de soporte en GPUs consumer.
- ¿Cabe en GPU consumer? No. El tamaño del checkpoint (329,9 GB) y los 633,8 mil millones de parámetros descartan cualquier GPU consumer individual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) y también configuraciones multi-GPU domésticas habituales.
- Opciones de despliegue: el checkpoint declara compatibilidad con el formato Model Optimizer NVFP4 y requiere un runtime capaz de reconstruir o ejecutar directamente las escalas de bloque desde los planos `csf32` antes de correr los expertos enrutados. No se especifican en la información disponibles nombres concretos de servidores (vLLM, TGI, TensorRT-LLM, SGLang); se debe verificar el soporte de `csf_32x2_v1` en el runtime elegido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-NVFP4-CSF (este) | 633,8 B | no disponible | NVFP4 + MXFP8 + BF16/FP32 | lil-license-1.0 | Hugging Face, 39 descargas |
| thinkingmachines/Inkling-2-Small | no disponible | no disponible | NVFP4 (capas 0-39) + MXFP8 (40-47) | no disponible | Hugging Face (upstream) |
| thinkingmachines/Inkling-2-Small-MXFP8 | no disponible | no disponible | MXFP8 | no disponible | Hugging Face (base de este checkpoint) |
| local-inference-lab/Inkling-2-Small | no disponible | no disponible | NVFP4 con escalas por token | no disponible | Hugging Face (fuente de escalas) |

No se dispone de información sobre modelos de otros laboratorios con los que comparar parámetros, contexto o rendimiento; la comparativa se limita a las variantes del propio Inkling 2 Small publicadas en Hugging Face.

## Limitaciones y advertencias

- La licencia `lil-license-1.0` es de tipo "other" y no se detalla en la información proporcionada; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- El checkpoint no incluye información sobre sesgos, toxicidad o alucinación; al ser una cuantización NVFP4 de un modelo mayor, es esperable cierta degradación de calidad frente al original MXFP8, no cuantificada en la model card.
- La compresión `csf_32x2_v1` de las escalas de bloque exige que el runtime sepa reconstruirlas o ejecutarlas directamente; un runtime que no lo soporte no podrá cargar los expertos enrutados.
- Los nombres de tensor siguen `Inkling2ForConditionalGeneration` de Transformers 5.23.0, con tres grupos que conservan la ortografía del origen (`embed_norm.weight`, `k_sconv/v_sconv.weight_proj`, `position_embedding`); esto puede romper herramientas que esperen la convención estándar.
- `mtp.safetensors` no está indexado en `model.safetensors.index.json`; los pipelines que solo lean el índice ignorarán el módulo DSpark y perderán la decodificación especulativa.
- El campo de idiomas no está poblado; no se puede garantizar cobertura multilingüe sin evaluarla.
- El tamaño de 329,9 GB y los 633,8 mil millones de parámetros hacen inviable el despliegue en hardware consumer y en nodos de menos de 8 GPUs de 80 GB.
- No se han publicado benchmarks ni métricas de latencia/throughput; cualquier estimación de rendimiento en producción debe validarse empíricamente.
- El número de descargas (39) y likes (3) es muy bajo, lo que sugiere escasa validación comunitaria del checkpoint.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/local-inference-lab/Inkling-2-Small-NVFP4-CSF
- Modelo base (MXFP8): https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8/tree/086a047e8b7ff2ac902dd52355328ddb66b16914
- Release upstream NVFP4: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Fuente de escalas de activación: https://huggingface.co/local-inference-lab/Inkling-2-Small/tree/1b77722adf8327b12b57af05cd2f370669b62657
- NVIDIA Model Optimizer (commit referenciado): https://github.com/NVIDIA/TensorRT-Model-Optimizer/commit/cc6963dea0a6f01d90d66c7699baf3884df5f64a
- Licencia: archivo LICENSE dentro del repositorio de Hugging Face
