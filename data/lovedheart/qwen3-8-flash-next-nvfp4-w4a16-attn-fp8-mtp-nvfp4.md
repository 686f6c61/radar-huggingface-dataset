# lovedheart/Qwen3.8-Flash-Next-NVFP4-W4A16-ATTN-FP8-MTP-NVFP4

## Resumen

Este repositorio es un checkpoint cuantizado en precisión mixta de Qwen/Qwen3.8-Flash-Next, publicado por el usuario lovedheart y no por el equipo de Qwen. La particularidad no está en el modelo objetivo, cuyas 48 capas MoE con expertos enrutados se mantienen idénticas al checkpoint NVFP4 W4A16 4-over-6 con atención FP8 que le sirve de base, sino en la capa MTP (Multi-Token Prediction / NextN) de decodificación especulativa, que se ha recuantizado a NVFP4 W4A16 con esquema 4-over-6 manteniendo la atención del borrador en BF16.

El problema que aborda es doble: reducir a la mitad la memoria de los pesos del borrador respecto al experimento con expertos en FP8 y, a la vez, mejorar la tasa de aceptación del borrador especulativo. Con 118.343.712.659 parámetros (~118,3 B) y una huella única de checkpoint de unos 122 GB, está pensado para servirse con SGLang sobre GPU Blackwell (SM120) con backend FlashInfer y decodificación especulativa NEXTN.

Su relevancia actual viene de combinar dos tendencias: la cuantización NVFP4 nativa de Blackwell para servir modelos MoE de ~120 B y el uso de borradores cuantizados en decodificación especulativa para reducir la latencia de decodificación sin modificar el modelo objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE; atención híbrida GDN + QSA según el repositorio del modelo base; 48 capas principales + 1 capa MTP/NextN de borrador especulativo |
| Parámetros totales | 118.343.712.659 (~118,3 B), dato real de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A16 con esquema 4-over-6 (grupo 16) en expertos enrutados del modelo principal y del borrador; atención en FP8 E4M3 weight-only con bloques 2D 128×128 (`FP8_PB_WO`); escalas de bloque FP8 E4M3 y escalas globales FP32; caché KV opcional en NVFP4 o FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | other (remite a los términos del modelo base Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors (incluye `model-mtp-nvfp4-moe.safetensors` y `model-mtp-bf16-attn.safetensors`) |
| Tamaño del repositorio | 128,9 GB (huella única del checkpoint ≈ 122 GB; el resto de shards son enlaces duros a los checkpoints base/v3) |
| Expertos enrutados del borrador | 512, top-10 |
| Librería declarada | Model Optimizer (NVIDIA ModelOpt) |

## Arquitectura y entrenamiento

El modelo objetivo es un MoE de 48 capas cuyos expertos enrutados están cuantizados a NVFP4 W4A16 con esquema 4-over-6 y cuya atención usa pesos en FP8 E4M3 con bloques 2D de 128×128 en modo weight-only. Sobre esa base se añade una única capa MTP/NextN que actúa como borrador especulativo: sus 512 expertos enrutados (top-10) se recuantizaron offline desde los pesos BF16 originales con el mismo esquema 4-over-6, mientras que su experto compartido, su atención q/k/v/o, sus normalizaciones, su router y sus embeddings se mantienen en BF16 byte a byte idénticos al checkpoint `-full`. La decisión de dejar la atención del borrador en BF16 es deliberada: versiones previas con atención FP8 en el borrador (v1/v2) descorrelacionaban el borrador del objetivo y hacían colapsar la aceptación hasta ~1,0.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si hubo RLHF, DPO u otro tipo de alineación, ni para el modelo base ni para este checkpoint (que en cualquier caso es una recuantización, no un reentrenamiento). Las únicas innovaciones documentadas son de inferencia: el esquema de refinamiento no uniforme de la rejilla FP4 (4-over-6), la separación de precisión entre borrador y objetivo y la integración con `flashinfer_cutlass` para MoE y `flashinfer_b12x` para GEMM FP4.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational` en el repositorio).
- Entrada multimodal de imagen y texto: el pipeline declarado es `image-text-to-text`, aunque no se detallan resolución, número de tokens de imagen ni arquitectura del codificador visual.
- Decodificación especulativa mediante la capa MTP/NextN, con `accept_length` medido de 2,5–2,6 y `accept_rate` de ~0,53 en la configuración probada por el autor.
- Caché KV cuantizable a NVFP4 o a FP8 E4M3, lo que reduce el consumo de memoria durante la decodificación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Servicio de inferencia multimodal en clúster Blackwell: el checkpoint está diseñado para servirse con SGLang sobre SM120 usando MoE con `flashinfer_cutlass` y GEMM FP4 con `flashinfer_b12x`, lo que reduce el ancho de banda de memoria frente a un despliegue BF16 del mismo MoE de ~118 B.
- Asistentes sobre documentación técnica con imágenes: al aceptar entradas de imagen y texto, encaja en flujos donde el usuario adjunta capturas, diagramas o páginas escaneadas y espera una respuesta conversacional con contexto amplio.
- Anotación y generación de datos sintéticos a gran escala: un MoE de este tamaño con caché KV cuantizada permite procesar lotes grandes de pares imagen-texto para etiquetado, descripción o generación de conjuntos de entrenamiento.
- Despliegue on-premise en entornos con requisitos de soberanía del dato: al ejecutarse íntegramente en infraestructura propia con SGLang, evita enviar imágenes o documentos a APIs externas.
- Investigación en decodificación especulativa: sirve como punto de comparación reproducible frente al borrador BF16 (accept_length 2–3) y frente a los borradores FP8 descartados (accept_rate ~1,0), para estudiar el equilibrio entre memoria del borrador y aceptación.
- Optimización de coste por token en servicios de chat de alto volumen: la combinación de expertos NVFP4 y borrador cuantizado ataca tanto el coste de pesos en VRAM como el número de pasos de decodificación necesarios por token generado.
- Evaluación de degradación por cuantización: permite comparar la salida del mismo modelo principal con distintos borradores (BF16 frente a NVFP4 4-over-6) sin tocar los pesos del objetivo, aislando el efecto del borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de comportamiento del borrador especulativo, tomados por el autor en RTX PRO 6000 / SM120 con `tp=1` y la misma línea de lanzamiento que el checkpoint base con NEXTN (`--speculative-num-steps 3 --speculative-eagle-topk 1 --speculative-num-draft-tokens 4 --speculative-draft-kv-cache-dtype fp8_e4m3`).

| Configuración del borrador | accept_length | accept_rate |
|---|---|---|
| Borrador BF16 (checkpoint base `-full`) | 2–3 | no disponible |
| BF16-attn + expertos NVFP4 4-over-6 (v4, este checkpoint) | 2,5–2,6 | ~0,53 |

## Requisitos de hardware

- VRAM estimada para inferencia: huella única de pesos de aproximadamente 122 GB (repositorio de 128,9 GB). No se detalla el consumo total con caché KV incluida; la línea de lanzamiento recomendada usa `--mem-fraction-static 0.9596` y caché KV en NVFP4.
- GPUs recomendadas: NVIDIA Blackwell (SM120/SM100) por el soporte nativo de NVFP4 y de los backends FlashInfer empleados. El autor reporta mediciones en RTX PRO 6000 con `--tensor-parallel-size 1`, aunque no especifica la topología exacta de GPU empleada.
- Cabe en GPU de consumo: no. Los ~122 GB de pesos exceden la VRAM de cualquier GPU de consumo y también la de una única RTX PRO 6000 (96 GB), por lo que en la práctica requiere agregación de memoria, offload o varias GPU.
- Opciones de despliegue: SGLang, obligatoriamente con la rama `rebase/qsa-on-main` del fork https://github.com/lovedheart/sglang. Las builds estándar (stock) no despachan `FP8_PB_WO` ni disponen de la plomería de configuración de cuantización para el borrador NextN, y pueden arrancar en silencio produciendo salida corrupta o un borrador muerto. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Comprobaciones de arranque indicadas por el autor: el log debe mostrar `quant=modelopt_mixed` y `Detected nvfp4 checkpoint`, sin líneas `not found in params_dict, skip loading` para las claves `mtp.*`; los expertos del borrador deben resolverse a `NvFp4MoEMethod` y su atención debe quedar sin cuantizar (BF16).
- Latencia y throughput: no disponibles. Solo se informa del comportamiento de aceptación del borrador (2,5–2,6 tokens aceptados por paso de decodificación en promedio).

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | BF16 (original) | no disponible | other | Modelo de referencia sin cuantizar |
| lovedheart/Qwen3.8-Flash-Next-NVFP4-W4A16-4-Over-6-FP8 | no disponible | NVFP4 W4A16 4-over-6 en expertos + atención FP8 bloque 128; borrador BF16 | no disponible | other | Borrador BF16, `accept_length` 2–3 |
| lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8 | ~119,6 B según LLM Explorer | NVFP4 W4A4, solo expertos de las 48 capas MoE | no disponible | other | Solo expertos cuantizados |
| lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8-Pruned-RTXPRO-6000 | no disponible | NVFP4 W4A4 (E2M1, grupo 16) en expertos enrutados | no disponible | other | Versión podada para RTX PRO 6000 |
| Este checkpoint (v4) | 118.343.712.659 | NVFP4 W4A16 4-over-6 en expertos + atención FP8 bloque 128 + borrador recuantizado | no disponible | other | `accept_length` 2,5–2,6, `accept_rate` ~0,53 |

## Limitaciones y advertencias

- Requiere una build parcheada de SGLang. Con la versión estándar el servidor puede arrancar sin error aparente y emitir salida corrupta o un borrador inoperante, lo que constituye un riesgo serio en producción.
- Checkpoint experimental y sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, creado el 25 de septiembre de 2026 y actualizado un minuto después.
- Hereda los sesgos, la toxicidad potencial derivada de los datos de entrenamiento y la propensión a errores factuales del modelo base. La cuantización del borrador no corrige ni mitiga ninguno de ellos.
- El borrador cuantizado puede aceptar menos tokens en continuaciones con carga matemática alta. Según el autor, el peor caso degrada a velocidad sin borrador, nunca a una salida incorrecta, pero no se aportan mediciones que cuantifiquen ese escenario.
- Efecto conocido y documentado: usar atención FP8 en el borrador (checkpoints v1/v2) descorrelaciona el borrador del objetivo y colapsa la aceptación a ~1,0. Cualquier variación de la configuración recomendada debe validarse.
- Licencia `other`: es imprescindible revisar los términos del modelo base Qwen/Qwen3.8-Flash-Next antes de cualquier uso comercial. No se especifican restricciones concretas en la información disponible.
- No se documentan idiomas soportados ni longitud de contexto, por lo que no puede garantizarse el comportamiento en idiomas distintos del inglés o en secuencias muy largas.
- El repositorio ocupa 128,9 GB, lo que implica costes relevantes de almacenamiento, transferencia y tiempo de carga.
- No hay benchmarks de calidad publicados para este checkpoint, de modo que no puede cuantificarse la degradación introducida por la cuantización NVFP4 frente al modelo en BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lovedheart/Qwen3.8-Flash-Next-NVFP4-W4A16-ATTN-FP8-MTP-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint base de cuantización (`-full`): https://huggingface.co/lovedheart/Qwen3.8-Flash-Next-NVFP4-W4A16-4-Over-6-FP8
- Variante NVFP4 + FP8: https://huggingface.co/lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8
- Variante podada para RTX PRO 6000: https://huggingface.co/lovedheart/Qwen3.8-Flash-Next-NVFP4-FP8-Pruned-RTXPRO-6000
- Fork de SGLang necesario (rama `rebase/qsa-on-main`): https://github.com/lovedheart/sglang
- Repositorio del modelo base en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Ficha en LLM Explorer: https://llm-explorer.com/model/lovedheart%2FQwen3.8-Flash-Next-NVFP4-FP8,2wkBTHSi16O0z9EX5GB4FP
