# marcsun13/ggml-attn

## Resumen

`ggml-attn` es un kernel de atención flash de ggml (la librería tensor que usa llama.cpp) empaquetado como operación de torch y como implementación de atención para `transformers`. Lo desarrolla Marc Sun (marcsun13), ingeniero de Hugging Face, y su objetivo es resolver el cuello de botella de atención en Apple Silicon (MPS), donde torch no dispone de atención fusionada y cae al camino *math* de SDPA, que escala linealmente con la longitud de caché. El kernel está vendido directamente de llama.cpp, no es una reimplementación, y se despacha con las mismas constantes de función que usa upstream.

La relevancia actual radica en que, para decodificación con contexto largo, el kernel es casi plano en longitud de caché mientras que SDPA *math* degrada, y la atención de grupos de consulta (GQA) es nativa, eliminando la copia de `repeat_kv`. Se integra con `transformers` mediante `attn_implementation="kernels-community/ggml-attn:flash_attn_forward"` y `allow_all_kernels=True`. No es un modelo de lenguaje, sino un componente de inferencia; no tiene parámetros propios ni pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de atención flash de ggml (Metal) como op de torch y atención de `transformers` |
| Parametros totales | no aplica (kernel, no modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (depende del modelo anfitrión) |
| Tipos de cuantizacion | no aplica (opera en f32; acumula en f16 internamente) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no aplica (no publica pesos; solo código fuente del kernel) |

## Arquitectura y entrenamiento

El kernel implementa `flash_attn_ext` de ggml en su variante *vector*, seleccionada por `ggml_metal_op_flash_attn_ext_use_vec()` cuando el número de consultas (`ne01`) es menor que 20. Para `n_q` entre 1 y 19 (el rango típico de decodificación) se ejecuta el kernel Metal; para `n_q` mayor o igual a 20 (prefill real) se delega en `torch.nn.functional.scaled_dot_product_attention`. Esta cobertura permite usar el kernel como única implementación de atención de un modelo.

La atención de grupos de consulta (GQA) es nativa: las claves y valores se pasan sin expandir a `n_heads`, eliminando la copia de `repeat_kv`. La causalidad se expresa mediante una máscara aditiva densa; no existe argumento `is_causal`. Una máscara nula significa atención bidireccional, un modo real que llama.cpp nunca alcanza porque siempre construye una máscara KQ en su grafo. El kernel acumula en f16, igual que la atención por defecto de llama.cpp, por lo que no es bit-idéntico a torch (diferencia máxima absoluta de 5e-05 en `n_kv=141` y 9e-05 en `n_kv=512`).

No hay entrenamiento: el repositorio solo contiene el kernel, el vendoring de llama.cpp y los bindings de torch. El código fuente se compila completo (`ggml-metal.metal`, 11k líneas), aunque los kernels no usados no penalizan en runtime porque Metal construye pipelines de forma perezosa.

## Capacidades

- Atención flash en Metal para decodificación (`n_q` de 1 a 19) con escalado lineal mínimo en longitud de caché.
- Atención de grupos de consulta (GQA) nativa, sin expansión de k/v a `n_heads`.
- Integración con `transformers` como implementación de atención (`attn_implementation`), con registro de `mask_implementation = "sdpa"` para preservar la construcción de máscaras.
- Operación torch directa mediante `kernels.get_kernel("kernels-community/ggml-attn")` con API `flash_attn(q, k, v, mask, scale)`.
- Máscara aditiva densa opcional; máscara nula implica atención bidireccional.
- Fallback automático a SDPA de torch para prefill (`n_q >= 20`), manteniendo una única implementación de atención.
- Requiere dimensiones de cabeza múltiplo de 32, verificables con `supports_flash_attn`.

## Casos de uso

- Inferencia de LLMs en Apple Silicon con contexto largo: el kernel acelera la decodificación con caché KV profunda; en las pruebas con Qwen3.5-4B-Q4_K_M en M2 Max, un prompt de 1024 tokens pasa de 29.91 a 35.83 tok/s (1.198x) frente a SDPA *math*.
- Generación de texto en producción sobre Mac: al integrarse como atención de `transformers`, un pipeline de `generate()` existente puede activarlo con un solo argumento, sin cambios en el código del modelo.
- Desarrollo de kernels de atención personalizados: el repositorio sirve como referencia de cómo venderar y despachar kernels de ggml desde torch, incluyendo constantes de función Metal y encoding en el command buffer actual.
- Investigación en eficiencia de atención: permite medir el impacto de la atención flash en decodificación frente a SDPA *math* en hardware MPS, con un punto de comparación numérico documentado.
- Despliegue en edge con hardware Apple: adecuado para aplicaciones de IA local en MacBooks y Mac Studio donde no hay GPU NVIDIA disponible y SDPA carece de fusión.
- Optimización de throughput en servicios de inferencia: al eliminar la copia de `repeat_kv` y reducir la escalabilidad con la caché, mejora la latencia por token en cargas de trabajo con muchos turnos de conversación.

## Benchmarks y rendimiento

Mediciones publicadas en la model card, realizadas con Qwen3.5-4B-Q4_K_M en un M2 Max, 16 cabezas de consulta sobre 4 cabezas KV, `head_dim` 256, f32, end-to-end a través de `generate()` con 128 tokens generados. Los brazos se alternaron dentro de un mismo proceso y se reporta la mediana de las ratios por repetición.

| Prompt | `sdpa` | `ggml-attn` | Ganancia |
| ---: | ---: | ---: | ---: |
| 16 tokens | 52.33 tok/s | 53.52 tok/s | 1.023x |
| 1024 tokens | 29.91 tok/s | 35.83 tok/s | **1.198x** |

Precisión numérica frente a la atención *math* de torch en f32 (formas de decodificación, `n_q=1`): diferencia máxima absoluta de 5e-05 en `n_kv=141` y 9e-05 en `n_kv=512`, atribuible a la acumulación en f16.

## Requisitos de hardware

- Solo Apple Silicon (aarch64-darwin) con backend Metal; torch 2.12 o 2.13.
- Probado en M2 Max; no requiere GPU NVIDIA ni CUDA.
- No aplica VRAM dedicada: usa la memoria unificada del sistema, compartida con el modelo anfitrión.
- Despliegue mediante torch y `transformers`; no hay soporte para vLLM, llama.cpp ni Ollama en este paquete.
- El kernel compilado añade 6.8 MB de metallib, sin penalización en runtime por kernels no usados.
- Latencia y throughput: los datos medidos indican 35.83 tok/s en decodificación con 1024 tokens de prompt en M2 Max, pero no se han publicado cifras para otros chips.

## Comparativa con modelos similares

| Implementación | Backend | Rango de `n_q` | GQA nativa | Máscara causal | Precisión |
|---|---|---|---|---|---|
| `ggml-attn` (este) | Metal (MPS) | 1–19 (kernel), ≥20 (SDPA) | Sí | Vía máscara aditiva | f16 acumulación |
| SDPA *math* de torch | CPU/MPS | todos | No (requiere `repeat_kv`) | Vía `is_causal` | f32 |
| FlashAttention-2 (triton/CUDA) | CUDA | todos | Sí | Interna al kernel | f32/f16 |

La comparación directa con FlashAttention-2 no es posible porque `ggml-attn` solo cubre Metal; en CUDA no está disponible. Frente a SDPA *math* en MPS, la ventaja principal es la escalabilidad con la caché y la eliminación de la copia GQA, a costa de una precisión ligeramente inferior (acumulación f16).

## Limitaciones y advertencias

- Solo backend Metal; CUDA no está implementado en la versión actual (el autor indica que es "una sección y un directorio de distancia").
- El kernel solo cubre el camino *vector* de ggml (`n_q < 20`); el prefill real (`n_q >= 20`) cae a SDPA de torch, por lo que la aceleración se limita a decodificación.
- La máscara nula significa atención bidireccional: si se llama a la op `flash_attn` directamente sin máscara, se obtiene atención no causal de forma silenciosa. En Qwen3.5-4B, un prefill no causal de 16 tokens movió los logits de la última posición en 1.44, aunque el top-5 greedy no cambió; una comparación a nivel de texto no detecta el error.
- No soporta `is_causal`; la causalidad debe expresarse siempre como máscara aditiva.
- Requiere dimensiones de cabeza múltiplo de 32 y que k/v compartan la misma dimensión.
- La acumulación en f16 implica que los logits no son bit-idénticos a torch; relevante si se comparan logits exactos.
- Sin soporte de padding reconstructivo: la atención no puede reconstruir el padding que no recibe; la máscara debe incluir el padding explícitamente.
- Repositorio sin descargas ni likes; proyecto en fase temprana (creado en agosto de 2026), con riesgo de cambios de API.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marcsun13/ggml-attn
- Perfil del autor: https://huggingface.co/marcsun13
- Modelos del autor: https://huggingface.co/marcsun13/models
- ggml (librería tensor): https://ggml.ai/ y https://github.com/ggml-org/ggml
- llama.cpp (origen del kernel): https://github.com/ggml-org/llama.cpp
