# AlexHung29629/gemma-4-26B-A4B-it-dequant-Q4KM

## Resumen

`AlexHung29629/gemma-4-26B-A4B-it-dequant-Q4KM` es una reconstrucción no oficial del modelo multimodal `google/gemma-4-26B-A4B-it` de Google. El autor ha tomado la cuantización GGUF `UD-Q4_K_M` publicada por Unsloth y ha dequantizado cada tensor a bfloat16, empaquetándolo de nuevo en el formato `Gemma4ForConditionalGeneration` de Hugging Face para que sea cargable con `transformers` exactamente igual que el checkpoint original. El resultado es un repositorio de 51,6 GB con 25.805.936.206 parámetros en 11 shards safetensors.

Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 26B parámetros totales y aproximadamente 4B activos por token, según indica el propio nombre del modelo base. Es multimodal de entrada (image-text-to-text): incorpora una torre de visión y un proyector multimodal, además del modelo de lenguaje. La innovación del repositorio no está en el modelo en sí, sino en el proceso de conversión: el autor documenta con detalle la metodología inversa de `convert_hf_to_gguf.py` y mide el error introducido tensor a tensor.

La relevancia de esta ficha es doble. Por un lado, sirve como referencia técnica sobre cómo se reconstruye un checkpoint HF a partir de un GGUF y qué precisión se pierde en el camino. Por otro, es un ejemplo claro de artefacto "research-only": los pesos son lossy, el error de cuantización está horneado y no se recupera al pasar a bf16. Para producción debe usarse el checkpoint oficial de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), clase `Gemma4ForConditionalGeneration` |
| Parámetros totales | 25.805.936.206 |
| Parámetros activos | no disponible (el nombre del modelo base sugiere ~4B, sin confirmación en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos en BF16; origen GGUF con mezcla Q4_K, Q5_1, Q8_0, F32 y BF16 según tensor |
| Idiomas soportados | no disponible (el smoke test muestra respuestas en chino tradicional e inglés) |
| Licencia | Apache 2.0 (con `license_link` a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (11 shards, BF16), index `model.safetensors.index.json` |
| Tensores | 1013 tensores, 0 faltantes respecto al índice oficial |
| Tamaño del repo | 51,6 GB |
| Descargas / likes | 24 / 0 |
| Fecha de creación | 2026-10-30 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 26B parámetros totales y un subconjunto activo por token (el sufijo A4B del nombre apunta a unos 4B activos, aunque la información proporcionada no lo confirma explícitamente). La capa MoE se materializa en tensores `experts.gate_up_proj` con forma `128×1408×2816` y `experts.down_proj` con forma `128×2816×704`, es decir, 128 expertos por capa en las 30 capas del modelo de lenguaje. Incluye además un router con `router.proj`, `router.scale` y `router.per_expert_scale`, y un `layer_scalar` por capa. La parte multimodal consta de una torre de visión (`vision_tower`) con patch embedder de proyección `1152×768` y un proyector `embed_vision.embedding_projection` de `2816×1152`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo original. Lo que sí documenta este repositorio es el proceso de conversión: lectura de los GGUF `gemma-4-26B-A4B-it-UD-Q4_K_M.gguf` (modelo de lenguaje) y `mmproj-BF16.gguf` (torre de visión y proyector) con `gguf-py`, dequantización a float32 y casteo a bfloat16, y mapeo de nombres mediante la inversa de `convert_hf_to_gguf.py`/`conversion/gemma.py`. Para Gemma 4 no hacen falta permutaciones Q/K ni el offset `+1` en RMSNorm. Los tensores de normas, router, escalas y `layer_scalar` quedan en F32 bit-exactos; la torre de visión y `embed_vision` en BF16/F32 bit-exactos; atención, MLP densa y `embed_tokens` en Q8_0; y los expertos en Q4_K (`gate_up_proj`) y Q5_1/Q8_0 (`down_proj`).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat copiada del checkpoint oficial.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), gracias a la torre de visión y al proyector multimodal.
- Razonamiento y respuesta a preguntas generales; el smoke test muestra respuestas correctas a preguntas triviales en inglés y chino tradicional.
- Capacidades multilingües: el ejemplo de la model card genera chino tradicional coherente, aunque no se documenta la lista completa de idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Experimentación con pipelines de conversión GGUF a safetensors: el repositorio incluye los scripts `convert.py`, `compare.py` y `gen.py` en `conversion/`, útiles para validar metodologías de dequantización y medir el error frente al checkpoint oficial.
- Investigación sobre el impacto de la cuantización en modelos MoE multimodales: la tabla de errores por tensor (Q8_0 ≈ 0,6 %, Q5_1 ≈ 3,5 %, Q4_K ≈ 7,3 % de error de Frobenius relativo) permite estudiar qué componentes son más sensibles a la compresión.
- Pruebas de integración con `transformers`: al ser cargable con `AutoModelForImageTextToText` y `AutoProcessor`, sirve para validar código de carga, sharding e indexado sin depender del checkpoint oficial de 50+ GB.
- Desarrollo de tooling de comparación de checkpoints: el script `compare.py` y los JSON de estadísticas adjuntos son una base para construir herramientas de auditoría de pesos.
- Docencia y divulgación: ejemplos reproducibles de dequantización y de diferencias entre cuantizaciones (Q4_K, Q5_1, Q8_0, F32) con métricas concretas.
- Pruebas de humo en CPU con offload: la model card documenta decodificación greedy con `transformers` y offload a CPU, útil para entornos sin GPU.
- No recomendado para producción, atención al cliente, generación de código en CI/CD ni despliegues con SLA: la calidad corresponde al quant UD-Q4_K_M, no al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye un smoke test cualitativo con decodificación greedy:

| Consulta | Respuesta |
|---|---|
| `用繁體中文一句話介紹台北。` | `台北是一座融合了現代繁華都市景觀與深厚傳統文化底蘊，並以豐富美食與便利交通聞名的活力之都。` |
| `What is the capital of France? Answer in one sentence.` | `The capital of France is Paris.` |

Métricas de error de dequantización frente al checkpoint oficial bf16 (medidas con `conversion/compare.py`):

| Tensor | Tipo GGUF | Forma | Error Frobenius rel. | Coseno | Error abs. máx. | Exactos |
|---|---|---|---|---|---|---|
| `embed_tokens.weight` | Q8_0 | 262144×2816 | 0,570 % | 0,999984 | 0,00391 | 25,3 % |
| `layers.0.self_attn.q_proj` | Q8_0 | 4096×2816 | 0,573 % | 0,999984 | 0,00195 | 25,4 % |
| `layers.5.self_attn.k_proj` | Q8_0 | 1024×2816 | 0,606 % | 0,999982 | 0,00183 | 23,6 % |
| `layers.3.experts.gate_up_proj` | Q4_K | 128×1408×2816 | 7,294 % | 0,997338 | 0,0254 | 2,2 % |
| `layers.3.experts.down_proj` | Q5_1 | 128×2816×704 | 3,528 % | 0,999378 | 0,0273 | 4,8 % |
| `layers.29.experts.gate_up_proj` | Q4_K | 128×1408×2816 | 7,385 % | 0,997270 | 0,0278 | 2,2 % |
| `layers.3.mlp.down_proj` | Q8_0 | 2816×2112 | 0,643 % | 0,999979 | 0,00293 | 22,3 % |
| `layers.3.router.proj` | F32 | 128×2816 | 0,000 % | 1,000000 | 0 | 100 % |
| `layers.3.input_layernorm` | F32 | 2816 | 0,000 % | 1,000000 | 0 | 100 % |
| `vision_tower.patch_embedder.input_proj` | F32 | 1152×768 | 0,000 % | 1,000000 | 0 | 100 % |
| `embed_vision.embedding_projection` | BF16 | 2816×1152 | 0,000 % | 1,000000 | 0 | 100 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repo pesa 51,6 GB, por lo que se necesitan al menos ~52 GB de VRAM solo para pesos, más overhead de activaciones y caché KV. En la práctica, 80 GB (A100/H100) es el mínimo cómodo para una GPU única.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con tensor parallelism. En GPUs consumer (RTX 4090 24 GB, RTX 3090 24 GB) no cabe en BF16 sin offload a CPU o sin recurrir a cuantización adicional.
- Consumer GPU: no cabe en BF16 en ninguna GPU consumer de una sola tarjeta. La model card documenta un smoke test con CPU offload, lo que confirma que es viable en entornos sin VRAM suficiente pero con latencia muy alta.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (soporte directo y documentado). vLLM, llama.cpp, Ollama o TGI no están documentados para este repositorio; llama.cpp podría cargar el GGUF original de Unsloth, pero no este safetensors sin conversión previa.
- Latencia y throughput: no disponibles. Al ser un artefacto research-only con offload a CPU en el único ejemplo documentado, no se han publicado cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (dequant Q4KM) | 25,8B totales | no disponible | Apache 2.0 | safetensors BF16 | Hugging Face, 24 descargas |
| `google/gemma-4-26B-A4B-it` | 26B (A4B) | no disponible | Apache 2.0 (licencia Gemma 4) | safetensors oficial | Hugging Face, checkpoint oficial |
| `unsloth/gemma-4-26B-A4B-it-GGUF` | 26B (A4B) | no disponible | Apache 2.0 | GGUF (Q4_K_M, etc.) | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye datos de benchmarks ni especificaciones de modelos competidores de otros desarrolladores. Frente al checkpoint oficial, este repo pierde precisión (error de Frobenius relativo de hasta ~7,3 % en los expertos `gate_up_proj`) y no aporta ventajas de tamaño (51,6 GB en BF16 frente al oficial). Frente al GGUF de Unsloth, ofrece la ventaja de ser cargable directamente con `transformers` sin necesidad de llama.cpp, a costa de un mayor uso de disco y VRAM.

## Limitaciones y advertencias

- Pesos lossy: la dequantización no recupera la precisión perdida. La calidad corresponde al quant UD-Q4_K_M, no al modelo original de Google.
- El propio autor etiqueta el repositorio como `research-only` y advierte explícitamente de que no es el checkpoint oficial.
- Error de cuantización significativo en los expertos: ~7,3 % de error de Frobenius relativo en `experts.gate_up_proj` (Q4_K) y ~3,5 % en `experts.down_proj` (Q5_1). Solo el 2,2 % y el 4,8 % de los elementos son bit-idénticos, respectivamente.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo conversacional, el riesgo existe y se amplifica por el error de cuantización.
- Idiomas soportados no documentados; el smoke test solo cubre inglés y chino tradicional.
- Longitud de contexto no disponible en la información proporcionada.
- Restricciones de licencia: aunque la etiqueta indica Apache 2.0, el `license_link` apunta a la licencia de Gemma 4 de Google, que puede imponer términos adicionales de uso comercial. Conviene revisar esa licencia antes de cualquier uso en producción.
- Sin soporte documentado para tool calling, agentes o modo thinking; no asumir estas capacidades sin verificación.
- No apto para producción: sin benchmarks, sin cifras de latencia, con 24 descargas y 0 likes, y con advertencia explícita del autor.
- Para cualquier uso real debe preferirse `google/gemma-4-26B-A4B-it` o, si se necesita un formato ligero, el GGUF original de Unsloth.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AlexHung29629/gemma-4-26B-A4B-it-dequant-Q4KM
- Modelo base oficial: https://huggingface.co/google/gemma-4-26B-A4B-it
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Scripts de conversión: carpeta `conversion/` del repositorio (`convert.py`, `compare.py`, `gen.py`)
- llama.cpp (herramienta `convert_hf_to_gguf.py` y `gguf-py`): no se proporciona URL en la información disponible
