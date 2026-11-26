# jmarceno/Qwen3.8-27B-DFlash2-GGUF

## Resumen

Qwen3.8-27B-DFlash2-GGUF es la conversión a formato GGUF del borrador (draft model) DFlash 2 de incoai, publicada por jmarceno para su uso con la decodificación especulativa `draft-dflash` de llama.cpp. No es un modelo de lenguaje autónomo: se trata de un drafter de difusión por bloques que propone bloques completos de tokens en una sola pasada, que luego un modelo objetivo Qwen3.8-27B verifica. Al carecer de embeddings de entrada y de proyección de salida propios, reutiliza los del modelo objetivo junto con los estados ocultos extraídos de cinco capas de este, por lo que solo funciona emparejado con un target compatible.

La relevancia del artefacto es práctica: permite acelerar la inferencia de Qwen3.8-27B en llama.cpp manteniendo la decodificación sin pérdida, es decir, la salida greedy coincide exactamente con la del objetivo y el muestreo preserva su distribución; el borrador únicamente reduce el número de pasadas forward necesarias. El repositorio, de 14,1 GB, incluye tres cuantizaciones (Q4_K_M, Q8_0 y F16) con metadatos de ventana deslizante de 2048 tokens, además de los scripts de conversión y de parcheo de M-RoPE.

La actualización del 27 de septiembre de 2026 añadió la clave de metadatos `dflash.rope.dimension_sections = [64, 0, 0, 0]`, que habilita las peticiones con imagen cuando el objetivo se carga con `--mmproj`; antes de ese cambio, cualquier prompt visual fallaba con `decode() failed: failed to process speculative batch`. Los tensores no cambiaron, por lo que la decodificación de solo texto es idéntica entre ambas versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador de difusión por bloques (DFlash 2) con atención de ventana deslizante; requiere un target Qwen3.8-27B |
| Parametros totales | 1.924.404.480 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 tokens en el borrador; el contexto real lo fija el target (ejemplo de la model card: 131.072 tokens) |
| Tipos de cuantizacion | Q4_K_M (1,09 GiB), Q8_0 (1,96 GiB), F16 (3,86 GiB); pesos de normalización y kernels conv `*_base` en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del bloque de borrador | 8 tokens (ancla + 7 tokens draft) |
| Token de máscara | 248070 |
| Modelo base | Qwen/Qwen3.8-27B (target); incoai/Qwen3.8-27B-DFlash2 (borrador) |

## Arquitectura y entrenamiento

El borrador emplea un esquema de difusión por bloques: en lugar de predecir token a token, genera un bloque de 8 posiciones (una de ancla más 7 tokens draft) en una única pasada, que el modelo objetivo valida después. La decodificación resultante es sin pérdida respecto al target: con greedy la salida es idéntica y con muestreo se conserva la distribución del objetivo, de modo que el borrador solo altera el número de pasadas forward necesarias. El checkpoint incorpora metadatos de ventana deslizante de 2048 tokens, lo que limita su caché KV a decenas de MiB independientemente de la longitud de contexto configurada en el target.

El modelo no dispone de embeddings ni de cabeza de salida propios: consume los del target Qwen3.8-27B y los estados ocultos de cinco capas de este, de ahí que el tokenizador deba coincidir obligatoriamente. Para soportar M-RoPE (usado por Qwen3.8-27B con imágenes), los archivos declaran secciones M-RoPE degeneradas `[head_dim/2, 0, 0, 0]`, con lo que llama.cpp aplica rotación únicamente en la dimensión temporal: la rotación de texto equivale a la NeoX y la caché del borrador acepta el salto posicional que introduce una imagen. Las filas de imagen se excluyen de la inyección del borrador, que se condiciona a los estados ocultos del texto circundante. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Aceleración de decodificación especulativa sobre Qwen3.8-27B en llama.cpp mediante el tipo `draft-dflash`.
- Borrador de bloques de 8 tokens con profundidad de borrador entrenada de 7 (`--spec-draft-n-max 7`).
- Decodificación sin pérdida: salida greedy idéntica al target y muestreo que preserva su distribución.
- Soporte de prompts con imagen cuando el target se carga con `--mmproj` (desde la revisión del 27 de septiembre de 2026).
- Compatibilidad con cuantización de la caché KV del borrador (`--spec-draft-type-k q4_0`, `--spec-draft-type-v q4_0`).
- Despliegue con Flash Attention activada (`-fa on`) y offload independiente del borrador a una GPU concreta (`--spec-draft-device`).
- No es un modelo autónomo: no genera texto por sí mismo, no soporta tool calling propio ni dispone de modo thinking; todas esas capacidades dependen del target Qwen3.8-27B.

## Casos de uso

- Servicio de chat de baja latencia con Qwen3.8-27B: desplegar `llama-server` con el target en IQ4_XS y este borrador en Q4_K_M reduce las pasadas forward del target por token emitido, manteniendo la calidad intacta al ser decodificación sin pérdida.
- Asistentes con contexto largo (131.072 tokens en el ejemplo de la model card): el borrador añade solo decenas de MiB de caché KV gracias a su ventana de 2048, por lo que no penaliza el presupuesto de VRAM del contexto extenso.
- Inferencia multimodal con imágenes: con el `--mmproj` del target cargado, el borrador acepta peticiones con imagen (verificado con una imagen de 512x512 y 120.517 tokens de prompt) y acelera la generación de la respuesta.
- Despliegue en máquinas con varias GPU y VRAM ajustada: el borrador es offloadable de forma independiente (`--spec-draft-device CUDA1`), lo que permite colocarlo en la tarjeta con espacio libre mientras el target ocupa el resto.
- Evaluación comparativa de técnicas de decodificación especulativa: al ser un artefacto reproducible con scripts de conversión incluidos, sirve para medir la ganancia de throughput de la difusión por bloques frente a drafters autorregresivos clásicos.
- Servidores de un solo usuario o baja concurrencia: con `--parallel 1` se evita el coste de estado recurrente (híbrido GDN) por slot, que en configuraciones de 4 slots desperdicia varios GiB de VRAM.
- Replicación y requantización: el F16 incluido permite generar nuevas cuantizaciones a partir del GGUF en lugar de los safetensors originales, conservando la regla de precisión F32 para normas y kernels conv.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta una medición cualitativa: la cuantización Q4_K_M ofrece una decodificación igual o mejor que Q8_0 en profundidad y ocupa aproximadamente 0,9 GiB menos, por lo que se recomienda como opción por defecto.

## Requisitos de hardware

- VRAM del borrador: 1,09 GiB en Q4_K_M, 1,96 GiB en Q8_0 y 3,86 GiB en F16, más la caché KV limitada por la ventana de 2048 tokens (decenas de MiB).
- VRAM del target: no especificada en la información disponible; el ejemplo de la model card usa Qwen3.8-27B en IQ4_XS con 131.072 tokens de contexto.
- GPU recomendadas: no disponibles de forma explícita; la model card menciona configuraciones multigpu (por ejemplo, `CUDA0,CUDA1`) y offload selectivo del borrador.
- Cabe en GPU de consumo: el borrador por sí solo sí (1,09 GiB en Q4_K_M), pero el requisito real lo impone el target Qwen3.8-27B, cuyo tamaño cuantizado no se detalla.
- Opciones de despliegue: llama.cpp con soporte de arquitectura `dflash` y tipo especulativo `draft-dflash` (probado contra master `56381e407c0ccfb3a6f71e668a27a901001d22ce`, build 0.4.0-dev); requiere `-fa on` y `--parallel 1` salvo necesidad de concurrencia.
- Latencia y throughput: no disponibles como cifras; la ganancia proviene de reducir las pasadas forward del target, con profundidad de borrador fijada en 7 tokens.
- Restricción de compatibilidad: el binario F16 provoca un aborto en la ruta CUDA de broadcast binario de llama.cpp (`binbcast.cu: GGML_ASSERT(nb10 % sizeof(src1_t))`), de ahí que normas y kernels conv se almacenen en F32.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jmarceno/Qwen3.8-27B-DFlash2-GGUF | Borrador de difusión por bloques para llama.cpp | 1.924.404.480 | Ventana deslizante de 2048 en el borrador | Apache 2.0 | Hugging Face, 274 descargas |
| incoai/Qwen3.8-27B-DFlash2 | Borrador DFlash 2 original (safetensors) | no disponible | no disponible | no disponible | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 | Espejo del borrador DFlash 2 | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B | Modelo objetivo (no es un drafter) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes ni con otros drafters de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un target Qwen3.8-27B con tokenizador idéntico no produce salida alguna.
- Requiere una versión de llama.cpp con soporte de la arquitectura `dflash` y del tipo `draft-dflash`; las builds estándar sin ese parche no lo cargarán.
- Los archivos anteriores al 27 de septiembre de 2026 fallan en cualquier petición con imagen; es necesario redescargar o aplicar `add_dflash_mrope_sections.py` sobre la copia local.
- El estado recurrente (híbrido GDN) se asigna por slot: con más de un slot paralelo se desperdician varios GiB de VRAM.
- Si los tensores compartidos del target abarcan varias GPU, el borrador debe recibir esas mismas GPU (`--spec-draft-device CUDA0,CUDA1`); de lo contrario el planificador rechaza `output.weight` y `token_embd`.
- La ventana deslizante de 2048 tokens del borrador acota su caché KV, pero también su campo de visión efectivo; el contexto largo lo aporta el target.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática del borrador; al heredar la distribución del target, estos riesgos son los de Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo objetivo y del checkpoint original de incoai antes de producción.
- No se han publicado benchmarks cuantitativos; la afirmación de que Q4_K_M decodifica igual o mejor que Q8_0 es una medición del autor sin datos reproducibles en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jmarceno/Qwen3.8-27B-DFlash2-GGUF
- Borrador original: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Espejo del borrador: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (build de referencia): https://github.com/ggml-org/llama.cpp
