# ceselder/glm-5.3-olens-qwen-reader

## Resumen

`ceselder/glm-5.3-olens-qwen-reader` es un adaptador LoRA de investigación, publicado bajo licencia Apache 2.0, que permite que un modelo Qwen3.6-27B lea e interprete las activaciones internas de un modelo mucho mayor, GLM-5.3 (754B parámetros, arquitectura MoE). El adaptador no genera texto de forma convencional: actúa como un "lector" (reader) que, dada la activación de la capa 51 del decodificador de GLM-5.3 (vector de 6144 dimensiones), produce cuatro viñetas descriptivas de lo que GLM-5.3 está a punto de generar. La pieza central es un mapa afín aprendido A (6144 → 5120) que proyecta la activación de GLM-5.3 al espacio de la capa 42 de Qwen3.6-27B, donde un LoRA tipo oracle lens la verbaliza.

El interés técnico es doble. Por un lado, es un ejercicio de interpretabilidad cross-model: demostrar que las representaciones internas de un modelo grande pueden traducirse al espacio latente de un modelo más pequeño y hacerse legibles. Por otro, es una optimización de costes de entrenamiento: los rollouts de GLM-5.3 cuestan aproximadamente 25 veces más que los de Qwen3.6-27B, de modo que el bucle de RL del lens se ejecuta sobre Qwen mientras la recompensa se calcula con el reconstructor nativo de GLM-5.3.

El checkpoint publicado (`release/` = `rl_step0300/`) alcanza un FVE centrado de reconstrucción en held-out de 0,345 (coseno centrado 0,579) y una puntuación de 0,414 en WorkspaceBench (21 familias sin variantes tipográficas) o 0,437 con las 24 familias. Es un artefacto estrictamente de investigación, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA r64/α16) sobre Qwen3.6-27B + mapa afín aprendido (6144 → 5120); el modelo leído es GLM-5.3 (MoE, 754B) |
| Parámetros totales | No disponible (adaptador LoRA sobre un modelo base de 27B; el repo ocupa 6,0 GB) |
| Parámetros activos | No disponible (GLM-5.3 es MoE de 754B; el número de activos no se especifica) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.6-27B) |
| Tipos de cuantización | No disponible (pesos del adaptador en safetensors; `affine.pt` en punto flotante) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) y `affine.pt` (PyTorch) |

## Arquitectura y entrenamiento

El sistema consta de tres componentes. Primero, un mapa afín A (matriz W de 5120×6144 más vector b de 5120) que proyecta la salida de la capa 51 del decodificador de GLM-5.3 (6144-d) al espacio de la capa 42 de Qwen3.6-27B. Segundo, un LoRA sobre Qwen3.6-27B inicializado desde la etapa SFT del oracle lens público `ceselder/olens-qwen3.6-27b-l42` (rsLoRA r64/α16), que verbaliza la activación inyectada como cuatro viñetas. Tercero, un mecanismo de inyección norm-matched: el vector proyectado se suma a la salida del bloque 1 del decodificador de Qwen en el token marcador, replicando el protocolo del lens público de Qwen.

El entrenamiento se organiza en cuatro fases. (1) Emparejamiento de activaciones: 1.242.412 posiciones de FineFineWeb con activación de GLM-5.3 ya almacenada se re-tokenizaron para Qwen; al ser ambos tokenizadores BPE a nivel de byte, se emparejó el token de Qwen que termina en el mismo offset de byte que el token leído por GLM (tasa de acierto 0,998 en held-out). (2) Warm start del mapa afín mediante ridge en forma cerrada desde momentos fp64, centrado en ambos lados (fuerza 0,03 × diagonal media, elegida en un slice de validación); coseno centrado en held-out de 0,706 (FVE centrado 0,511, suelo con filas barajadas 0,010). (3) SFT co-entrenando el LoRA de Qwen y A sobre 245.000 objetivos destilados de 4 viñetas con conciencia de prefijo del lens de GLM, una pasada de 239 pasos × 1024 filas, AdamW con lr 3e-05 (LoRA) y 0,0003 (A); la entropía cruzada en held-out bajó de 2,604 a 1,905. (4) RL con CISPO, 300 pasos × 1024 prompts × 8 muestras, lr 1e-05 (LoRA) y 0,0001 (A), sin término KL; la recompensa la calcula el reconstructor nativo de GLM-5.3 (sink16), que lee cada viñeta tras `[gMASK]<sop>` a través de los bloques 0..51 más el LoRA r512 y la value head, ajusta los 4 átomos por NNLS a h51 − μ y devuelve la fracción de varianza explicada centrada. La recompensa pasó de 0,274 en el paso 1 a 0,372 en el paso 300.

## Capacidades

- Lectura cross-model de activaciones: traduce la activación de la capa 51 de GLM-5.3 al espacio de Qwen3.6-27B y la verbaliza como cuatro viñetas descriptivas del contenido que GLM-5.3 va a generar.
- Interpretabilidad de representaciones: permite inspeccionar el estado interno de un modelo de 754B usando un modelo de 27B como sonda, con un mapa afín de un solo paso (K = 1, no las variantes de 4 mapas).
- Verbalización de activaciones (activation verbalizer): genera descripciones en lenguaje natural a partir de vectores latentes, no texto libre a partir de un prompt convencional.
- Reconstrucción evaluable: las viñetas producidas se puntúan contra el reconstructor nativo de GLM-5.3 mediante NNLS y FVE centrado, lo que permite medir la fidelidad de la lectura.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Auditoría de representaciones internas de un modelo grande: dado un rollout de GLM-5.3, extraer la activación de la capa 51 e introducirla en el reader para obtener cuatro viñetas sobre el contenido que el modelo iba a generar; útil para estudiar qué información está codificada antes de la emisión del token.
- Investigación en interpretabilidad cross-model: usar el mapa afín A como objeto de estudio para medir cuánto de la representación de un MoE de 754B es linealmente recuperable en el espacio de un transformer denso de 27B (coseno centrado 0,706 en el warm start).
- Entrenamiento de lenses a bajo coste: replicar la estrategia de RL sobre Qwen3.6-27B con recompensa calculada por el reconstructor de GLM-5.3, aprovechando que los rollouts de Qwen cuestan unas 25 veces menos y permiten lotes de 1024 prompts × 8 muestras por paso.
- Detección temprana de contenido problemático: las viñetas describen lo que el modelo está a punto de generar; en un pipeline de moderación podrían usarse como señal previa a la decodificación, aunque la tasa de alucinación del reader (0,555 en el paso 300) limita su fiabilidad.
- Evaluación comparativa de fidelidad de sondas: emplear WorkspaceBench (24 familias, juez Sonnet 5) para comparar el reader de Qwen contra el lens nativo de GLM-5.3 (0,437 frente a 0,469 en el paso 300 con 24 familias).
- Reproducción de experimentos de destilación de activaciones: el pipeline de emparejamiento por offset de byte entre tokenizadores BPE (tasa 0,998) sirve como referencia metodológica para alinear activaciones entre modelos con tokenizadores distintos.

## Benchmarks y rendimiento

Reconstrucción en held-out (256 filas, 4 viñetas greedy, FVE centrado con NNLS contra el reconstructor de GLM-5.3):

| Métrica | Valor |
|---|---|
| FVE centrado (release, rl_step0300) | 0,345 |
| Coseno centrado (release) | 0,579 |
| FVE con la continuación propia de GLM-5.3 (16 tokens como un span) | 0,125 |
| FVE del SFT inicial (rl_step 0) | 0,342 |
| Coseno centrado del mapa afín en warm start | 0,706 |
| FVE centrado del mapa afín en warm start | 0,511 |
| Suelo con filas barajadas | 0,010 |

WorkspaceBench durante el RL (una muestra de 4 viñetas a T=1 por celda, juez Sonnet 5):

| Paso RL | Media (24) | IC 95 % | Sin variantes tipográficas (21) | Solo workspace (11) | Tasa de alucinación |
|---|---|---|---|---|---|
| 0 | 0,361 | [0,344, 0,377] | 0,342 | 0,290 | 0,467 |
| 25 | 0,452 | [0,435, 0,469] | 0,418 | 0,370 | 0,489 |
| 50 | 0,466 | [0,448, 0,483] | 0,436 | 0,412 | 0,494 |
| 75 | 0,469 | [0,452, 0,486] | 0,436 | 0,412 | 0,500 |
| 125 | 0,453 | [0,435, 0,470] | 0,421 | 0,406 | 0,529 |
| 150 | 0,441 | [0,424, 0,458] | 0,417 | 0,379 | 0,537 |
| 200 | 0,427 | [0,410, 0,444] | 0,401 | 0,379 | 0,505 |
| 225 | 0,434 | [0,417, 0,451] | 0,410 | 0,401 | 0,514 |
| 250 | 0,444 | [0,427, 0,461] | 0,422 | 0,403 | 0,549 |
| 275 | 0,437 | [0,421, 0,454] | 0,410 | 0,388 | 0,541 |
| 300 | 0,437 | [0,420, 0,454] | 0,414 | 0,399 | 0,555 |

Referencia del lens nativo de GLM-5.3 (un solo bullet, mismo reward model, 256 × 8 RL, lr 3e-6): de 0,296 a 0,440 (21 familias) y de 0,271 a 0,469 (24 familias) entre SFT y el paso 300 de RL.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 6,0 GB, pero la inferencia requiere cargar Qwen3.6-27B completo en bfloat16 (aproximadamente 54 GB de pesos) más el adaptador y el mapa afín. No se dispone de cifras oficiales de VRAM para el pipeline completo.
- GPU recomendadas: para el modelo base en bf16 se necesita al menos una A100 80 GB o H100 80 GB; con cuantización del base (no documentada para este adaptador) podría reducirse el requisito.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en bf16 sin cuantizar el modelo base; no se han publicado configuraciones probadas en RTX 4090.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `PeftModel` y `device_map={'': 0}`; para extraer la activación de GLM-5.3 se menciona vLLM con `vllm-metamodels` o el stack de Hugging Face del repo `ceselder/glm-5.3-olens-lens`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El coste computacional dominante es el rollout de GLM-5.3 (unas 25 veces más caro que el de Qwen3.6-27B, según el autor).

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|---|
| `ceselder/glm-5.3-olens-qwen-reader` (este) | LoRA reader cross-model | Qwen3.6-27B | No disponible (repo 6,0 GB) | No disponible | FVE held-out 0,345; WorkspaceBench 0,437 (24) | Apache 2.0 |
| `ceselder/glm-5.3-olens-lens` | Oracle lens nativo de GLM-5.3 | GLM-5.3 (754B MoE) | No disponible | No disponible | WorkspaceBench 0,469 (24) en paso 300 | No disponible |
| `ceselder/olens-qwen3.6-27b-l42` | Oracle lens de Qwen | Qwen3.6-27B | No disponible | No disponible | No disponible en la información proporcionada | No disponible |

## Limitaciones y advertencias

- Checkpoint de investigación: el reader se entrenó sobre posiciones de texto web de alta entropía de GLM-5.3 y sobre objetivos destilados del lens de un solo bullet de GLM; se esperan lecturas más débiles fuera de esa distribución.
- El mapa afín se ajustó sobre posiciones exactamente alineadas por byte; desalineaciones entre tokenizadores degradan la proyección.
- Tasa de alucinación elevada: 0,555 en el paso 300 de RL, con un máximo de 0,549 en el paso 250; las viñetas pueden describir contenido que GLM-5.3 no iba a generar.
- El mejor checkpoint por reconstrucción en held-out (`rl_step0300`) no es el mejor en WorkspaceBench (`rl_step0050`, 0,466 / 0,436); hay que elegir según la métrica objetivo.
- El rendimiento queda por debajo del lens nativo de GLM-5.3 en WorkspaceBench (0,437 frente a 0,469 con 24 familias), aunque el coste de entrenamiento es mucho menor.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento en contextos largos; el adaptador no es un modelo de chat ni de generación libre.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.6-27B y el acceso a GLM-5.3 tienen sus propias condiciones, no detalladas aquí.
- Requiere extraer activaciones de GLM-5.3 (754B), lo que implica infraestructura de inferencia de gran escala no incluida en el repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ceselder/glm-5.3-olens-qwen-reader
- Lens nativo de GLM-5.3: https://huggingface.co/ceselder/glm-5.3-olens-lens
- Oracle lens público de Qwen3.6-27B (capa 42): https://huggingface.co/ceselder/olens-qwen3.6-27b-l42
- Colección glm5.3-olens: https://huggingface.co/collections/ceselder/glm53-olens-6adaf9d544d3645a7fb96eb9
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
