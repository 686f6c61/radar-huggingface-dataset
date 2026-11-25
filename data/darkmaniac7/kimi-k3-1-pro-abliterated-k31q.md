# darkmaniac7/Kimi-K3.1-Pro-abliterated-k31q

## Resumen

Kimi-K3.1-Pro-abliterated-k31q es una conversión cuantizada y modificada del modelo multimodal Kimi K3.1 Pro de Moonshot AI, publicada por el usuario darkmaniac7 en Hugging Face. Se trata de un checkpoint híbrido que combina cuantización vectorial de 1,625 bits por peso en los expertos enrutados del MoE con EXL3 de 6 bits en las proyecciones densas, incorporando además la edición de "abliteración" (eliminación de la dirección de rechazo) de 111 tensores procedente de moeadham/Kimi-K3.1-Pro-abliterated. El objetivo declarado es servir un modelo de 2,8 billones de parámetros en GPUs de 80 GB desbloqueadas (NVIDIA CMP 170HX, arquitectura sm_80) y en RTX PRO 6000 Blackwell (sm_120).

La arquitectura subyacente es un transformer híbrido con 93 capas decodificadoras: una capa densa inicial y 92 capas MoE con 896 expertos enrutados (top-16 activos, dimensión intermedia 3072) más dos expertos compartidos. Combina 69 capas de atención lineal KDA con 24 capas de atención dispersa MLA con compuerta, tamaño oculto de 7168, vocabulario de 163.840 tokens y una torre de visión de 27 capas. El checkpoint ocupa 599,80 GB en disco repartidos en 97 ficheros safetensors.

Su relevancia es fundamentalmente práctica y experimental: demuestra una ruta para ejecutar modelos de escala frontera en hardware de gama alta pero no específicamente de centro de datos, a costa de requerir un fork personalizado de vLLM con kernels propios de cuantización vectorial y EXL3. No es un modelo para uso directo con transformers o vLLM estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 69 capas de atención lineal KDA + 24 capas de atención dispersa MLA con compuerta; 93 capas decodificadoras (1 densa + 92 MoE) |
| Parametros totales | 2,8 billones (2,8T) |
| Parametros activos | 16 expertos enrutados de 896 por capa MoE, más 2 expertos compartidos (dimensión intermedia I=3072) |
| Longitud de contexto | no disponible (el autor cita 58.735 tokens KV en su benchmark, no la ventana máxima) |
| Tipos de cuantizacion | VQ 2D de 3 bits (`vq_d2_b3`, 1,625 bpw en expertos enrutados) + EXL3 de 6 bits (proyecciones densas y `lm_head`) + tensores sin cuantizar en BF16/FP32 (embeddings, visión, RMSNorm, routers) |
| Idiomas soportados | no disponible |
| Licencia | `other`, nombre `kimi-k3.1-pro` (Kimi K3.1-Pro License, heredada de Moonshot AI) |
| Formato de pesos | safetensors (97 ficheros: `layer-000` a `layer-092`, `embed`, `head`, `vision`, `codebooks`) + `k31q_manifest.json` |

## Arquitectura y entrenamiento

El modelo base Kimi K3.1 Pro emplea una arquitectura híbrida que alterna capas de atención lineal KDA (69 capas) con capas de atención dispersa MLA con compuerta (24 capas), lo que reduce el coste de atención en contextos largos. Las capas MoE contienen 896 expertos enrutados con activación top-16 y dos expertos compartidos, con dimensión intermedia de 3072 y tamaño oculto de 7168. Incluye una torre de visión de 27 capas que habilita el pipeline image-text-to-text.

Sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO) no se proporciona información en la documentación disponible. La contribución técnica de este checkpoint es la cuantización: los expertos enrutados se comprimen mediante cuantización vectorial 2D de 3 bits con codebook de 8 entradas (`codebooks.safetensors`) y escalas por grupo de 128 en el eje de entrada, alcanzando 1,625 bits por peso en `w1`, `w2` y `w3`. Las proyecciones densas y `lm_head` usan EXL3 de 6 bits con codebook de retícula `mul1` y SQNR de aproximadamente 35,2 dB. La edición de abliteración aplica 111 tensores BF16 en las capas 48 a 84 (`self_attn.o_proj`, `block_sparse_moe.shared_experts.down_proj`, `block_sparse_moe.routed_expert_up_proj`) antes de cuantizar. El autor incluye un drafter especulativo complementario (DSpark, 1,97 GB en EXL3 K6) y soporte de decodificación especulativa con taps de estado oculto entre etapas.

## Capacidades

- Generación de texto y razonamiento a escala de 2,8T parámetros, con la profundidad y anchura del modelo base Kimi K3.1 Pro.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante torre de visión de 27 capas y 168 tensores.
- Capacidades de código y matemáticas heredadas del modelo base (no se detallan evaluaciones específicas).
- Soporte de tool calling y function calling: no confirmado explícitamente en la documentación disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Decodificación especulativa mediante el drafter DSpark complementario, con taps de estado oculto entre etapas de pipeline.
- Comportamiento "abliterated": se ha eliminado la dirección de rechazo en 111 tensores, por lo que el modelo no aplicará los filtros de rechazo originales del modelo base.

## Casos de uso

- Investigación sobre alineación y seguridad: el checkpoint permite estudiar el efecto de la abliteración sobre un modelo de escala frontera, comparando respuestas con el modelo base original en tareas sensibles.
- Despliegue en clústeres de GPUs de gama alta no-datacenter: el formato `k31q` está diseñado para ejecutarse en CMP 170HX de 80 GB y RTX PRO 6000 Blackwell, permitiendo servir un modelo de 2,8T en hardware más asequible que H100/B200.
- Experimentación con cuantización extrema: sirve como referencia práctica para evaluar la calidad de VQ de 1,625 bpw en expertos MoE frente a EXL3 de 6 bits en capas densas, con métricas SQNR documentadas por matriz.
- Procesamiento multimodal de documentos: la torre de visión y el pipeline image-text-to-text permiten tareas de descripción, extracción y razonamiento sobre imágenes, aunque el contexto efectivo debe validarse empíricamente.
- Generación de texto a gran escala en investigación: útil para estudiar el comportamiento de modelos con 896 expertos enrutados y activación top-16 en tareas de generación abierta.
- Pruebas de decodificación especulativa: el drafter DSpark y los flags documentados permiten medir aceleraciones en producción con decodificación especulativa sobre arquitecturas híbridas KDA/MLA.
- Reproducción de benchmarks de serving: el autor publica cifras de throughput (105,0 tok/s estructurado, 77,9 tok/s código, 55,8 tok/s prosa en mediana, single-stream, T=0) que sirven como referencia para validar despliegues propios.

## Benchmarks y rendimiento

El autor reporta cifras de throughput de serving, no de calidad:

| Metrica | Valor |
|---|---|
| Throughput estructurado (mediana, single-stream, T=0) | 105,0 tok/s |
| Throughput código (mediana, single-stream, T=0) | 77,9 tok/s |
| Throughput prosa (mediana, single-stream, T=0) | 55,8 tok/s |
| Tokens KV en benchmark | 58.735 |
| Topología | TP2 x PP4 sobre 2x RTX PRO 6000 Blackwell + 6x CMP 170HX 80 GB (100 GbE) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Almacenamiento: 599,80 GB (558,61 GiB) en 97 ficheros safetensors; se recomienda verificar con `k31q_manifest.json` antes de servir.
- VRAM: el checkpoint completo no cabe en una sola GPU; el autor lo reparte en TP2 x PP4 sobre 8 GPUs (2x RTX PRO 6000 Blackwell + 6x CMP 170HX de 80 GB).
- GPUs compatibles: NVIDIA CMP 170HX (sm_80, 80 GB, desbloqueada) y RTX PRO 6000 Blackwell (sm_120). No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo; el modelo requiere un clúster multi-GPU.
- Despliegue: exclusivamente mediante el fork personalizado de vLLM con kernels `k31q` (VQ MoE, EXL3, taps DSpark y PipeSpec dinámico); el repositorio público está pendiente de publicación. `transformers` estándar y `vllm` upstream no parsean los shards `k31q`.
- Interconexión: el autor usa 100 GbE entre nodos y PCIe Gen4 x16; el rendimiento depende críticamente del ancho de banda entre etapas de pipeline.
- Latencia y throughput: ver tabla de benchmarks (55,8-105,0 tok/s single-stream según tipo de contenido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-abliterated-k31q (este) | 2,8T (top-16 de 896 expertos) | no disponible | Kimi K3.1-Pro (other) | safetensors `k31q`, fork vLLM | Cuantización VQ 1,625 bpw + EXL3 6 bits; abliterated |
| moonshotai/Kimi-K3.1-Pro | 2,8T | no disponible | Kimi K3.1-Pro | safetensors BF16 | Modelo base original de Moonshot AI; sin abliterar |
| moeadham/Kimi-K3.1-Pro-abliterated | 2,8T | no disponible | Kimi K3.1-Pro | safetensors BF16 | Edición de abliteración sin cuantizar; requiere hardware de mayor capacidad |
| darkmaniac7/Kimi-K3.1-Pro-DSpark-EXL3-K6 | 1,97 GB (drafter) | no aplica | no disponible | EXL3 K6 | Drafter especulativo complementario, no un modelo autónomo |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo en 111 tensores: el modelo puede producir contenido que el modelo base rechazaría, con implicaciones de seguridad y cumplimiento normativo.
- Requiere un fork privado de vLLM con kernels propios; sin él, el checkpoint es inutilizable con herramientas estándar. El repositorio público está pendiente, lo que supone un riesgo de reproducibilidad y soporte.
- El tamaño en disco (599,80 GB) y la topología multi-GPU (8 GPUs) limitan su uso a entornos con infraestructura dedicada.
- No se declaran idiomas soportados; el rendimiento multilingüe no está verificado.
- No se publican benchmarks de calidad (MMLU, HumanEval, GSM8K), por lo que la degradación introducida por la cuantización VQ de 1,625 bpw no está cuantificada más allá del SQNR por matriz (35,2 dB en EXL3).
- Riesgo de alucinación inherente a modelos de esta escala, no evaluado en la documentación.
- La licencia `kimi-k3.1-pro` (other) puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE antes de desplegar en producción.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Compatibilidad limitada a sm_80 y sm_120; no se garantiza funcionamiento en otras arquitecturas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/Kimi-K3.1-Pro-abliterated-k31q
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Edición abliterada de referencia: https://huggingface.co/moeadham/Kimi-K3.1-Pro-abliterated
- Drafter especulativo complementario: https://huggingface.co/darkmaniac7/Kimi-K3.1-Pro-DSpark-EXL3-K6
- Drafter upstream: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark
- Guía de serving en CMP 170HX (TP2 x PP4): https://cmp.wiki/wiki/Kimi_K3.1_Pro_on_6x_8_GB_plus_2x_RTX_PRO_6000_(vLLM_TP2_x_PP4)
- Licencia: fichero LICENSE del repositorio del modelo base
