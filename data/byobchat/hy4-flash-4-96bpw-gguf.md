# byobChat/Hy4-flash-4.96bpw-GGUF

## Resumen

Hy4-flash 4.96 bpw GGUF es una cuantización del modelo multimodal tencent/Hy4-flash, publicada por el usuario byobChat. El objetivo declarado es empaquetar el modelo completo en una única GPU de 96 GB (RTX PRO 6000, 95,6 GiB) manteniendo más de 128k tokens de contexto, algo que la cuantización Q4_K_M oficial de Tencent no consigue al incluir su capa MTP. La receta se eligió minimizando la divergencia KL (KLD) frente a los logits exactos del modelo BF16 de referencia.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 218.938.353.741 parámetros totales según los pesos en safetensors, etiquetado como multimodal (image-text-to-text) e incluyendo una innovación denominada Engram (tabla `per_layer_token_embd` de 59,0 GiB) que permanece en RAM del sistema y se lee de forma perezosa, sin ocupar VRAM. Incorpora además una capa MTP (multi-token prediction) para decodificación especulativa y un proyector de visión separado.

La relevancia de esta publicación es práctica: demuestra que es posible servir un MoE multimodal de este tamaño en hardware de una sola tarjeta profesional con contexto largo, a costa de una pérdida de calidad medible pero acotada (KLD de 0,2215 frente a 0,2027 de un Q8_0 de referencia). Requiere una compilación específica de llama.cpp (PR #32517), ya que el soporte de Hy4-flash no está aún en la rama principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con capa MTP y tabla Engram (según tags y model card del cuantizador) |
| Parametros totales | 218.938.353.741 |
| Parametros activos | no disponible |
| Longitud de contexto | 155.648 tokens con `--fit` en una RTX PRO 6000; prompt de 147.866 tokens verificado |
| Tipos de cuantizacion | GGUF 4.96 bpw (Q4_K/Q5_K en expertos, Q8_0 en resto, F8_E4M3 en Engram); variante MTP 5.22 bpw; referencia Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (basada en Apache 2.0 con términos comerciales adicionales en la sección 10) |
| Formato de pesos | GGUF (4 shards) + `mmproj-Hy4-flash-bf16.gguf` para visión |

## Arquitectura y entrenamiento

La información disponible corresponde al proceso de cuantización, no al entrenamiento original del modelo base. Se sabe que Hy4-flash es un MoE con 41 capas de expertos enrutados (capas 1-41), una capa densa (capa 0), proyecciones de enrutamiento, expertos compartidos, un indexer de atención y una cabeza de salida. Incluye una tabla Engram (`per_layer_token_embd`) de 59,0 GiB en F8_E4M3 que actúa como memoria de tokens por capa y se mantiene fuera de la VRAM. Dispone de una capa MTP en BF16 para decodificación especulativa y de un proyector de visión independiente.

La receta de cuantización aplica Q4_K con imatrix (98k tokens de calibración de prosa y código) a las proyecciones gate/up de expertos enrutados; Q5_K en las proyecciones down de las capas 1-35 y Q4_K en las capas 36-41 (imatrix de AtomicChat); Q8_0 al resto de tensores (atención, indexer, expertos compartidos, capa densa 0, proyecciones de enrutamiento, embeddings y cabeza de salida); y F32 en normas y router. Las proyecciones down de las capas 15-35 resultaron ser las más sensibles, mientras que las capas 36-41 apenas afectan a la calidad, lo que permitió ahorrar bits para alcanzar 128k de contexto en una sola tarjeta. No se dispone de datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en el modelo original.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento multimodal image-text-to-text mediante `--mmproj` con el proyector de visión de Tencent.
- Razonamiento y generación de código (la imatrix de calibración incluye prosa y código, lo que sugiere uso previsto en esos dominios).
- Decodificación especulativa con MTP (`--spec-type draft-mtp`), con una aceptación de borradores medida del 59-74 %.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistencia conversacional de contexto largo: con 155.648 tokens de contexto en una sola RTX PRO 6000, permite mantener hilos de conversación con documentos extensos adjuntos sin truncar.
- Análisis de documentos e imágenes combinados: el pipeline image-text-to-text y el proyector de visión permiten procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales.
- Procesamiento por lotes de prompts largos: la model card verifica un prompt de 147.866 tokens, adecuado para resumir o extraer información de contratos, informes o bases de código completas.
- Generación de código asistida: la calibración con código y el contexto largo permiten incluir repositorios o módulos extensos como referencia en una sola pasada.
- Despliegue en infraestructura de una sola GPU: para equipos con una RTX PRO 6000 que necesitan servir un MoE de 219B parámetros sin clúster multi-GPU.
- Inferencia con decodificación especulativa en dos tarjetas: la variante MTP 5.22 bpw permite acelerar la generación con una aceptación de borradores del 59-74 % cuando se dispone de más de una GPU de 96 GB.
- Evaluación comparativa de cuantizaciones: el conjunto de logits de referencia publicado permite medir KLD de futuras recetas sobre este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye métricas de fidelidad de cuantización (KLD frente a los logits BF16 y precisión Top-1):

| Modelo | Pesos en GPU | KLD opt | KLD 2K | KLD 8K | Top-1 opt / 2K / 8K |
|---|---|---|---|---|---|
| Este (4.96 bpw) | 89,9 GiB | 0,2215 | 0,2467 | 0,3326 | 88,6 / 90,2 / 85,8 % |
| Tencent Q4_K_M | 90,8 GiB + 7,0 MTP | 0,2354 | 0,2566 | 0,3613 | 88,3 / 89,7 / 85,9 % |
| NVFP4 propio (4.96 bpw, no publicado) | 89,8 GiB | 0,2459 | 0,2825 | 0,3672 | 87,9 / 89,4 / 85,3 % |
| Q8_0 (referencia) | 155 GiB | no disponible | 0,2027 | 0,2425 | no disponible / 92,2 / 89,1 % |

Margen de error indicado: ±0,003 (opt) y ±0,010 (2K, 8K). El autor señala que incluso Q8_0 puntúa alrededor de 0,2 porque pequeños cambios numéricos alteran las elecciones top-16 del router en las 41 capas MoE, por lo que Q8_0 debe tratarse como suelo.

## Requisitos de hardware

- VRAM estimada: 89,9 GiB de pesos en GPU para la variante 4.96 bpw; 96,9 GiB para la variante MTP 5.22 bpw; aproximadamente 1 GiB adicional para el proyector de visión.
- La tabla Engram (59,0 GiB) no usa VRAM: reside en RAM del sistema o page cache y se lee de forma perezosa, por lo que se requiere RAM abundante además de la GPU.
- GPU recomendada: una RTX PRO 6000 (95,6 GiB) para la variante 4.96 bpw con `--fit`; más de una tarjeta de 96 GB para la variante MTP.
- GPU de consumo: no cabe en ninguna GPU consumer actual según los requisitos indicados (89,9 GiB de pesos).
- Opciones de despliegue: llama.cpp con la PR #32517 (commit 3843691 probado); `llama-server` con `--jinja`, `--fit` (activado por defecto) y `--mmproj` para visión. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Throughput y latencia: no disponibles, salvo la tasa de aceptación de borradores MTP del 59-74 %.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KLD opt) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash 4.96 bpw (este) | 218,9B totales | 155.648 tokens en una RTX PRO 6000 | 0,2215 | Tencent Hy License 1.0 | GGUF en HF |
| Hy4-flash Q4_K_M (Tencent) | 218,9B totales | no disponible; no cabe en una tarjeta con MTP | 0,2354 | Tencent Hy License 1.0 | GGUF oficial |
| Hy4-flash Q8_0 | 218,9B totales | no disponible | no disponible (2K: 0,2027) | Tencent Hy License 1.0 | GGUF |
| Hy4-flash NVFP4 (byobChat, no publicado) | 218,9B totales | no disponible | 0,2459 | Tencent Hy License 1.0 | No publicado |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El soporte de Hy4-flash no está en la rama principal de llama.cpp: requiere compilar la PR #32517, lo que implica riesgo de cambios incompatibles.
- La cuantización introduce pérdida de calidad medible: KLD de 0,2215 frente a 0,2027 del Q8_0 de referencia; el autor advierte que el modelo es sensible a cambios numéricos por el enrutamiento top-16 en 41 capas MoE.
- Requiere RAM del sistema suficiente para la tabla Engram de 59,0 GiB además de la VRAM; el rendimiento depende de la velocidad de lectura desde RAM/page cache.
- La variante MTP necesita más de una GPU de 96 GB, lo que limita su uso en configuraciones de una sola tarjeta.
- Licencia Tencent Hy License 1.0: basada en Apache 2.0 pero con términos comerciales adicionales en la sección 10; es imprescindible revisarlos antes de un uso comercial.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- No hay datos publicados sobre sesgos, tasa de alucinación ni evaluación de seguridad del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de la receta.
- La versión NVFP4 para tensor cores FP4 de Blackwell aún no está publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/byobChat/Hy4-flash-4.96bpw-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- PR de llama.cpp con soporte Hy4-flash: https://github.com/ggml-org/llama.cpp/pull/32517
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Logits de referencia BF16: https://huggingface.co/datasets/Grawnch/Hy4-Flash-BF16-Reference-Logits
- Licencia: LICENSE (incluido en el repositorio)
