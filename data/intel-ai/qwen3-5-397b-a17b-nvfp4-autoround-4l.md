# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L

## Resumen

`intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L` es una variante estructuralmente reducida del checkpoint cuantizado NVFP4 `Qwen3.5-397B-A17B-NVFP4-AutoRound-v2`, derivado a su vez del modelo base multimodal `Qwen/Qwen3.5-397B-A17B` de Alibaba Qwen. No se trata de un modelo entrenado ni destilado: es un recorte a nivel de safetensors que conserva únicamente 4 capas del lenguaje (las capas 0 a 3 del original), la torre visual completa y la capa MTP (multi-token prediction). El resto de capas del lenguaje se descarta.

El modelo pertenece a la familia Qwen3.5 MoE, con arquitectura híbrida de atención (tres capas de atención lineal seguidas de una capa de atención completa), 512 expertos enrutados por capa con 10 expertos activos por token, y un experto compartido. La reducción la publica el equipo `intel-ai`, presumiblemente como artefacto de referencia para validar pipelines de cuantización, despliegue o herramientas de compresión sobre modelos Qwen3.5, más que como modelo de producción.

Su relevancia práctica es limitada: al conservar solo 4 de las 60 capas del lenguaje original, la calidad de generación de texto queda severamente degradada. Su interés es fundamentalmente técnico: permite probar cargas de modelos NVFP4 con compressed-tensors, validar la torre visual y la capa MTP en un entorno de bajo peso (~30,77 GiB de datos tensoriales), y experimentar con el formato de cuantización AutoRound NVFP4 sin necesidad de descargar el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención híbrida (linear_attention x3 + full_attention x1) y capa MTP |
| Parametros totales | 35.373.294.064 (35,37 B) |
| Parametros activos | 10 expertos enrutados por token de 512 (no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 262.144 posiciones máximas (max_position_embeddings) |
| Tipos de cuantizacion | NVFP4 (4 bits, group_size=16, simétrica, escala float8_e4m3fn) para pesos y activaciones dinámicas por bloque; BF16 para módulos ignorados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (7 shards), formato compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal de la familia Qwen3.5. El modelo reducido conserva 4 capas del lenguaje con tipos `['linear_attention', 'linear_attention', 'linear_attention', 'full_attention']`, hidden size de 4096, 32 cabezas de atención, 2 cabezas KV, dimensión de cabeza 256, 512 expertos enrutados con 10 activos por token, tamaño intermedio MoE de 1024, experto compartido de 1024, vocabulario de 248.320 tokens y RoPE theta de 10.000.000. La torre visual tiene 27 bloques, hidden size 1152 y salida de 4096, coincidente con el hidden size del texto. Se conserva una capa MTP (multi-token prediction) con embeddings dedicados desactivados.

No hay entrenamiento ni ajuste en esta variante: los pesos se copian tensor a tensor desde el checkpoint NVFP4 de origen mediante `reduction/make_reduced_model.py`, sin cargar el modelo completo en memoria. El checkpoint de origen es una cuantización AutoRound (versión 0.17.0) en formato compressed-tensors NVFP4, con cuantización dinámica por bloque de activaciones (`dynamic=local`, group_size=16) y sin esquema de cuantización para KV cache. Los módulos cuantizados son los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`), las proyecciones de atención lineal (`in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b`, `out_proj`) y las de atención completa (`q_proj`, `k_proj`, `v_proj`, `o_proj`). Quedan en BF16 el router, el gate del experto compartido, el experto compartido completo, todas las capas lineales de la torre visual, todos los módulos MTP, `lm_head`, embeddings y tensores no lineales (RMSNorm, biases, `A_log`, `conv1d`, `dt_bias`, `patch_embed`, `pos_embed`).

## Capacidades

- Generación de texto: nominalmente soportada, pero severamente degradada al conservar solo 4 de 60 capas del lenguaje.
- Razonamiento y matemáticas: no fiable en esta variante reducida; el recorte de capas elimina la mayor parte de la capacidad de cómputo profundo.
- Generación de código: no fiable por la misma razón.
- Procesamiento visual: la torre visual se conserva completa (27 bloques, 333 tensores), por lo que la codificación de imágenes funciona, aunque el decodificador de texto que consume esas representaciones está truncado.
- Tool calling / function calling: el modelo base Qwen3.5 lo soporta; en esta variante reducida no es fiable en producción.
- Agentes y razonamiento multi-paso: no fiable por el truncado de capas.
- Multilingüe: no se publica la lista de idiomas; el vocabulario de 248.320 tokens es el del modelo base.
- Capa MTP (multi-token prediction): conservada en BF16 (1.553 tensores, ~12,29 GiB), útil para probar decodificación especulativa o predictiva multi-token.
- Capacidad multimodal: entrada de imagen vía torre visual de 27 bloques.

## Casos de uso

- Validación de pipelines de cuantización NVFP4: sirve para comprobar que una herramienta (compressed-tensors, AutoRound, vLLM, TensorRT-LLM) carga correctamente un checkpoint `nvfp4-pack-quantized` con `quantization_config.ignore` y escalas float8_e4m3fn, sin descargar los ~144 GB del modelo completo.
- Pruebas de integración de la torre visual: al conservarse los 27 bloques visuales completos, permite validar el pipeline de preprocesado de imagen, patch embedding y merger contra el hidden size de texto (4096) en un entorno ligero.
- Experimentación con la capa MTP: los 1.553 tensores MTP en BF16 permiten probar mecanismos de decodificación multi-token o especulativa sobre un modelo reducido antes de escalar al checkpoint completo.
- Referencia para reducción de modelos: el script `reduction/make_reduced_model.py` y la estructura de shards sirven como plantilla para construir variantes reducidas de otros checkpoints Qwen3.5 MoE.
- Benchmarking de infraestructura: con 30,77 GiB de datos tensoriales y 26.583 tensores, es un banco de pruebas realista para medir latencia de carga, throughput de deserialización y memoria en GPUs consumer de gama alta o en nodos con varias GPUs.
- Docencia y divulgación: permite mostrar la anatomía interna de un MoE multimodal Qwen3.5 (router, expertos compartidos, atención híbrida, MTP) sin requerir el modelo completo.
- Pruebas de humo de servidores de inferencia: útil para verificar que un servidor (vLLM, TGI, SGLang) arranca y responde con un modelo MoE multimodal NVFP4 antes de desplegar el checkpoint íntegro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~30,77 GiB de datos tensoriales en NVFP4; con overhead de activaciones, KV cache y buffers, se recomienda al menos 40-48 GB de VRAM para el modelo en solitario.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200, L40S 48 GB, RTX 6000 Ada 48 GB. En GPUs de 24 GB no cabe el checkpoint completo; requeriría offload a CPU o sharding.
- Cabe en consumer GPU: no en RTX 4090 (24 GB) ni RTX 3090 (24 GB) sin offload; sí en GPUs profesionales de 48 GB o en configuraciones multi-GPU.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y TensorRT-LLM son candidatos habituales para NVFP4 con compressed-tensors; llama.cpp y Ollama no soportan de forma nativa el formato `nvfp4-pack-quantized` de compressed-tensors, por lo que requerirían conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas lenguaje | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L | 35,37 B (recortado) | 4 | 262.144 | NVFP4 AutoRound | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-397B-A17B (base) | 397 B (nominal) | 60 | 262.144 | BF16 | Apache 2.0 | Hugging Face |
| Qwen3.5-397B-A17B-NVFP4-AutoRound-v2 (origen) | 397 B (nominal) | 60 | 262.144 | NVFP4 AutoRound | Apache 2.0 | Hugging Face |

La comparación relevante es con el checkpoint de origen y con el modelo base: esta variante reduce el número de capas de 60 a 4 y el tamaño de pesos de ~144 GB a ~30,77 GiB de datos tensoriales, a costa de una pérdida drástica de capacidad de generación. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Modelo estructuralmente truncado: conserva solo 4 de 60 capas del lenguaje, por lo que la calidad de generación de texto, razonamiento y código es muy inferior a la del modelo base y no es apta para producción.
- No es un modelo entrenado ni destilado: los pesos se copian del checkpoint NVFP4 de origen; no ha habido ajuste para compensar el recorte de capas.
- Riesgo elevado de alucinación y de respuestas incoherentes por la pérdida de profundidad de la red.
- Idiomas soportados no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el estado truncado del modelo hace desaconsejable su uso en producción sin validación exhaustiva.
- El formato NVFP4 requiere hardware y librerías compatibles (compressed-tensors, GPUs con soporte FP4 o emulación); no es portable a llama.cpp/Ollama sin conversión.
- La capa MTP representa ~12,29 GiB de los 30,77 GiB totales; si no se usa decodificación multi-token, es peso muerto.
- El checkpoint de origen v2 mantiene el experto compartido en BF16; la variante E5M3 con nombre similar es un formato de empaquetado distinto y no debe confundirse con esta reducción.
- Solo 210 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-4L
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Checkpoint de origen (reducción): `Qwen3.5-397B-A17B-NVFP4-AutoRound-v2` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Script de reducción: `reduction/make_reduced_model.py` (incluido en el repositorio del modelo)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
