# fedesito/Qwen3.8-27B-Coder390-DFlash2-W4A16

## Resumen

`fedesito/Qwen3.8-27B-Coder390-DFlash2-W4A16` es una re-cuantización a W4A16 del *draft model* DFlash2 asociado al modelo objetivo `nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`. No es un modelo generativo autónomo: es un cabezal de decodificación especulativa (draft model) que se acopla a un modelo objetivo de 27B para acelerar la inferencia mediante la técnica DFlash2, un esquema de *speculative decoding* con bloques.

El problema que resuelve es de despliegue: el drafter original en FP8 con block-128 no carga en la ruta de draft de vLLM sobre arquitecturas sm86 (RTX 30xx/40xx), debido a un fallo de tipos en el bucle de draft (matmul bf16 frente a fp8). El autor re-cuantiza los pesos del drafter a W4A16 con *compressed-tensors* (pack-quantized, grupo 128, simétrico) para que el drafter cargue junto al objetivo INT4/W4A16 de 18,1 GB sin cambiar la configuración del servidor.

El repositorio es pequeño (1,3 GB, 1.924.404.480 parámetros almacenados) porque el drafter comparte los *embeddings* y el `lm_head` del modelo objetivo y no los incluye. Está pensado para usarse exclusivamente con vLLM con soporte DFlash2 (0.27.1 con el backport del drafter, o `main` con el PR #52816).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 block drafter (5 capas transformer con grouped-conv y candidate_selector) sobre Qwen3.8; draft model para speculative decoding |
| Parametros totales | 1.924.404.480 (solo drafter; no incluye embeddings ni lm_head del objetivo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo objetivo, no declarada en la model card) |
| Tipos de cuantizacion | W4A16 compressed-tensors, pack-quantized, grupo 128, simétrico, RTN; activaciones bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), con `config.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un drafter DFlash2 de 5 capas. Cada capa contiene proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de MLP (`gate_proj`, `up_proj`, `down_proj`), más una proyección `fc` de 5120 × 25600 que mapea los estados ocultos de las capas 5, 19, 33, 47 y 61 del modelo objetivo. Incluye además `kernel_projection` de convolución agrupada, un `candidate_selector` y capas de normalización.

La cuantización se aplica únicamente a las proyecciones de atención y MLP (5 capas) y a la matriz `fc`, todas en int4 RTN simétrico con grupo 128 y `weight_scale` en fp16 con `weight_shape` en int64. Las `kernel_projection` de convolución agrupada, el `candidate_selector` y las normas quedan en bf16 como passthrough, ya que vLLM las construye sin cuantizar. No se usó conjunto de calibración: se aplicó *round-to-nearest* directamente sobre los pesos FP8 del drafter original, que ya era un artefacto de baja precisión. El autor indica que el layout resultante coincide exactamente con el de `syvai/Qwen3.8-27B-DFlash2-W4A16`: mismo conjunto de 153 tensores, mismas formas y `config.json` byte-idéntico, difiriendo solo en los valores cuantizados.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO. El nombre del modelo base sugiere un pipeline de SFT, RLOO y MTP, pero la model card no lo documenta.

## Capacidades

- Decodificación especulativa DFlash2: propone bloques de tokens candidatos (hasta `num_speculative_tokens=7` en la configuración de ejemplo) que el modelo objetivo de 27B verifica en paralelo.
- Aceleración de inferencia en vLLM: se integra mediante `--speculative-config '{"method":"dflash","model":"..."}'`.
- Compatibilidad con objetivos Qwen3.8 de 27B: consume los estados ocultos de las capas 5, 19, 33, 47 y 61 del objetivo y comparte sus embeddings y `lm_head`.
- No genera texto de forma autónoma: no es un modelo de chat, razonamiento, código ni matemáticas por sí mismo.
- No soporta tool calling, function calling ni comportamiento de agente de forma directa.
- Capacidades multilingües: no disponibles (heredadas del objetivo, no declaradas).
- No incluye vision, audio ni modo thinking propio.

## Casos de uso

- Aceleración de un servidor vLLM en producción: se despliega junto al objetivo de 27B con `--speculative-config` y `num_speculative_tokens` ajustado; reduce la latencia por token en generación de código al verificar varios tokens por paso.
- Despliegue en GPUs consumer sm86 (RTX 3090, 4090): es el caso que motiva el repositorio, ya que el drafter FP8 original no carga en esa arquitectura y esta versión W4A16 sí lo hace.
- Generación de código asistida de baja latencia: al estar asociado a un objetivo orientado a código (Coder390), acelera autocompletado y generación de funciones en IDE o pipelines de CI/CD.
- Reducción de coste en inferencia por lotes: al compartir embeddings y `lm_head` con el objetivo, el drafter añade solo 1,28 GB de pesos, lo que permite mantener el objetivo INT4 de 18,1 GB en memoria y ganar throughput.
- Experimentación con decodificación especulativa: sirve como referencia para comparar configuraciones de drafter (FP8 frente a W4A16) sobre el mismo objetivo.
- Validación de integración en vLLM: útil para probar la ruta de draft DFlash2 en versiones 0.27.1 con backport o `main` con PR #52816 antes de adoptarla en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de aceptación del drafter, *speedup* medido, throughput ni latencia.

## Requisitos de hardware

- VRAM del drafter: 1,28 GB de pesos en W4A16, más activaciones en bf16 y caché KV del objetivo.
- VRAM total: requiere el objetivo de 27B en INT4/W4A16 (18,1 GB) más el drafter, por lo que se necesita al menos ~20-24 GB de VRAM en función de la longitud de contexto y el tamaño de lote.
- GPUs recomendadas: RTX 3090 (24 GB) y RTX 4090 (24 GB) como mínimo para el conjunto; A100 40/80 GB y H100 para producción con lotes grandes.
- Compatibilidad sm86: es el objetivo del repositorio; el drafter FP8 original falla en esa arquitectura y esta versión W4A16 está pensada para funcionar.
- Despliegue: exclusivamente vLLM con soporte DFlash2 (0.27.1 + backport del drafter, o `main` con PR #52816). No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Flags de ejemplo: `--attention-backend FLASH_ATTN --kv-cache-dtype bfloat16`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| fedesito/Qwen3.8-27B-Coder390-DFlash2-W4A16 | 1,92 B (drafter) | W4A16 g128 RTN | no disponible | Apache-2.0 | Drafter DFlash2 para objetivo Coder390; requiere vLLM con DFlash2 |
| syvai/Qwen3.8-27B-DFlash2-W4A16 | no disponible | W4A16 g128 | no disponible | no disponible | Layout de referencia idéntico (153 tensores, mismo `config.json`); drafter del objetivo genérico Qwen3.8-27B |
| nerkyor/Qwen3.8-27B-Coder390-...-DFlash2 (FP8) | no disponible | FP8 block-128 | no disponible | Apache-2.0 | Drafter original; no carga en sm86 en la ruta de draft de vLLM |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo de 27B y sin vLLM con DFlash2 no produce salidas útiles.
- Dependencia estricta de versión: requiere vLLM 0.27.1 con el backport del drafter o `main` con PR #52816; otras versiones pueden no cargar el modelo.
- La cuantización es RTN sin calibración sobre un artefacto ya FP8, por lo que la precisión del drafter puede degradarse respecto al original; no se han publicado métricas de tasa de aceptación.
- Solo se han cuantizado atención, MLP y `fc`; el resto queda en bf16 y vLLM lo construye sin cuantizar, lo que puede generar discrepancias si se usa otro runtime.
- Comparte embeddings y `lm_head` con el objetivo: no se puede usar con un objetivo distinto al indicado.
- Sin datos de idiomas, sesgos ni alucinación propios; estos dependen del modelo objetivo.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el objetivo subyacente y sus datos de entrenamiento recae en el usuario.
- Repositorio con 17 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- HuggingFace: https://huggingface.co/fedesito/Qwen3.8-27B-Coder390-DFlash2-W4A16
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Layout de referencia W4A16: https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- Blog de referencia DFlash2 (Inco): https://inco.ai/blog/dflash2/
- Perfil del autor del drafter original: https://huggingface.co/nerkyor
