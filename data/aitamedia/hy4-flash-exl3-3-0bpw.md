# aitamedia/Hy4-flash-EXL3-3.0bpw

## Resumen

Hy4-flash-EXL3-3.0bpw es una cuantización de 3 bits del modelo tencent/Hy4-flash-FP8, publicada por el usuario aitamedia. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 224.000 millones de parámetros totales, de los cuales solo 12.000 millones están activos por token, y una ventana de contexto de 1 millón de tokens. La cuantización emplea el formato EXL3 (ExLlamaV3 trellis-coded) y afecta únicamente a los expertos MoE enrutados (41 capas × 512 expertos, 148.600 millones de parámetros), dejando el resto de componentes copiados byte a byte desde el modelo FP8 original.

La característica más singular de este paquete es que la tabla Engram (cuatro tensores de embedding de 31,68 GB cada uno, 126,9 GB en total) se distribuye en shards independientes y cargables por separado, de modo que un runtime puede mapearlos desde NVMe y paginar únicamente las filas que toca cada token. Esto convierte al modelo en un candidato para hardware de memoria unificada como DGX Spark GB10, donde el offload a disco es la única forma real de liberar el pool de 121 GB.

El modelo es multimodal nativo, soporta inglés y chino, y su licencia es "other", heredada del modelo base. El repo ocupa 198,3 GB y la cuantización de expertos produce 55,72 GB, lo que confirma una densidad efectiva de 3,0 bits por peso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, multimodal nativa, con tabla Engram y cabeza MTP |
| Parametros totales | 224 B (155,5 B backbone + 63,5 B Engram + 0,85 B draft) |
| Parametros activos | 12 B por token |
| Longitud de contexto | 1 M tokens |
| Tipos de cuantizacion | EXL3 trellis 3,0 bpw sobre expertos MoE enrutados; resto en FP8/BF16 copiado del original |
| Idiomas soportados | en, zh |
| Licencia | other (sigue los terminos del modelo base) |
| Formato de pesos | safetensors + experts.pt (EXL3 trellis) + scales.json + exl3_k_map.json |

## Arquitectura y entrenamiento

El modelo base Hy4-flash-FP8 es un transformer MoE con 512 expertos enrutados por capa y top-16 en el enrutamiento, distribuidos en 41 capas. Incorpora una tabla Engram de cuatro tensores `multi_head_embedding.embedding.weight` en las capas 1, 11, 21 y 31, con dimensiones [164994380, 96], [164999008, 96], [165004086, 96] y [165008942, 96] en BF16, que suman 126,9 GB. También incluye una torre de visión y una cabeza MTP (multi-token prediction) para decodificación especulativa.

La cuantización EXL3 afecta solo a los expertos enrutados: 41 capas × 512 expertos, 148,6 B parámetros, codificados con codebook `mcg` (mean-centroid, sin mul1), tiles de 16 × 16 sobre bloques de 256 pesos y K = 3. El `gate_up_proj` está fusionado por experto. El resto de componentes (atención, router, normas, embeddings, torre de visión, cabeza MTP) se copia byte a byte desde el modelo FP8. El proceso de codificación se realizó íntegramente en CPU (GB10 es sm_121, por encima del techo CUDA 12.0 de torch), con un tiempo total de 3,81 horas (41 capas × 5,7 minutos). No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento multi-paso y soporte de agentes, gracias a la cabeza MTP y al contexto de 1 M tokens.
- Procesamiento multimodal nativo: incluye torre de visión en el paquete de pesos.
- Decodificación especulativa mediante la cabeza draft de 0,85 B parámetros.
- Enrutamiento MoE con top-16 sobre 512 expertos por capa, lo que permite activar solo 12 B parámetros por token.
- Tabla Engram con paginación por filas desde disco, pensada para cargar únicamente las filas que toca cada token.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Despliegue en DGX Spark GB10: el paquete está diseñado específicamente para memoria unificada, con la tabla Engram paginada desde NVMe mediante backends de offload a disco (dsv41/DeepSeek-V4.1 o MiaAI-Lab kit), liberando el pool de 121 GB para el resto de pesos.
- Servicio de conversación de contexto largo: con 1 M tokens de ventana, el modelo puede mantener conversaciones multi-turno con documentos extensos, historiales completos o bases de conocimiento embebidas sin truncar.
- Procesamiento multimodal de documentos: la torre de visión incluida permite extraer información de imágenes y PDFs escaneados combinándola con el contexto largo para tareas de análisis documental.
- Investigación sobre cuantización extrema: el paquete sirve como referencia reproducible para estudiar el impacto de EXL3 a 3,0 bpw sobre un MoE de 224 B, con mapas K por tensor y procedencia de codificación por capa.
- Experimentación con offload a disco: los cuatro shards Engram exclusivos permiten probar estrategias de `preadv` + `fadvise` y medir latencia de paginación por filas en cargas reales.
- Inferencia en clústeres con poca VRAM por GPU: al reducir los expertos a 55,72 GB (1,36 GB por capa, uniforme), el modelo puede distribuirse entre varias GPU consumer o profesionales con un backend compatible con EXL3.
- Evaluación comparativa de decodificación especulativa: la cabeza MTP de 0,85 B permite medir ganancias de throughput frente a decodificación autoregresiva estándar en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los expertos cuantizados ocupan 55,72 GB; el resto de pesos (atención, router, normas, embeddings, visión, MTP) suma aproximadamente 11,8 GB × 5 shards = 59 GB adicionales en FP8/BF16. La tabla Engram (126,9 GB) debe residir en SSD y paginarse por filas.
- GPU recomendadas: DGX Spark GB10 (memoria unificada de 121 GB) es el objetivo declarado; para el resto de pesos se requieren GPUs con al menos 60 GB combinados, como A100 80 GB, H100 80 GB o varias RTX 4090/5090 en paralelo.
- Cabe en consumer GPU: sí, de forma parcial y distribuida; los expertos a 3,0 bpw (55,72 GB) caben en dos RTX 4090 de 24 GB o en una RTX 5090 de 32 GB más offload, pero la tabla Engram exige almacenamiento NVMe.
- Opciones de despliegue: backends con soporte EXL3/ExLlamaV3 y offload a disco. La model card cita dsv41/DeepSeek-V4.1 con `--engram-config '{"cpu_offload":true,"dp_shared_memory":false,"disk_offload":true,"disk_threads":256}'` y el kit MiaAI-Lab (`engram_file_backend.py` + `librow_store.so` vía `--hf-overrides '{"engram_table_dir": …}'`). El motor de offload a disco de vLLM upstream está limitado a Qwen4Exp y la ruta HYV4-Flash solo expone `pin_memory`.
- Latencia y throughput: no disponibles. El tiempo de codificación (3,81 h en CPU) no es representativo de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-flash-EXL3-3.0bpw | 224 B | 12 B | 1 M | EXL3 3,0 bpw (expertos) | other | Hugging Face (aitamedia) |
| tencent/Hy4-flash-FP8 | 224 B | 12 B | 1 M | FP8 | other | Hugging Face (Tencent) |
| DeepSeek-V4.1 (referenciado en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base FP8 del que deriva este paquete y a DeepSeek-V4.1, citado únicamente como backend de offload compatible. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia es "other" y sigue los términos del modelo base tencent/Hy4-flash-FP8; es imprescindible revisar dichos términos antes de cualquier uso comercial.
- Solo se soportan inglés y chino de forma nativa; el rendimiento en castellano no está documentado.
- La tabla Engram de 126,9 GB exige almacenamiento NVMe y un backend de offload a disco específico; sin él, el modelo no es servible en hardware de memoria unificada.
- El motor de offload a disco de vLLM upstream no cubre la ruta HYV4-Flash (solo expone `pin_memory`), lo que limita las opciones de despliegue estándar.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad factual.
- No se documentan sesgos conocidos, pero al entrenarse principalmente en inglés y chino pueden aparecer sesgos culturales y lingüísticos en esos idiomas.
- La cuantización a 3,0 bpw puede degradar la calidad frente al modelo FP8 original; no se publican métricas de degradación.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del paquete.
- No se documenta soporte de tool calling ni function calling, lo que limita su uso en pipelines de agentes que dependan de esas interfaces.

## Enlaces

- [Hugging Face: aitamedia/Hy4-flash-EXL3-3.0bpw](https://huggingface.co/aitamedia/Hy4-flash-EXL3-3.0bpw)
- [Modelo base: tencent/Hy4-flash-FP8](https://huggingface.co/tencent/Hy4-flash-FP8)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
