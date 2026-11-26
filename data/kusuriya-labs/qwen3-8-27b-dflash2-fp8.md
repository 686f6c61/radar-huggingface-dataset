# kusuriya-labs/Qwen3.8-27B-DFlash2-FP8

## Resumen

Qwen3.8-27B-DFlash2-FP8 es una cuantización en FP8 (formato E4M3) del modelo borrador DFlash 2 publicado originalmente por inco.ai como `incoai/Qwen3.8-27B-DFlash2` y alojado en `z-lab/Qwen3.8-27B-DFlash2`. No es un modelo de lenguaje autónomo: se trata de un *draft model* diseñado para decodificación especulativa, que propone tokens que el modelo objetivo Qwen3.8-27B verifica en cada ronda. El repositorio lo mantiene kusuriya-labs y está pensado para ejecutarse en el runtime `shelf` sobre hardware AMD ROCm.

La relevancia de esta ficha radica en que reduce el peso del borrador de 3,58 GiB (BF16) a 1,97 GiB manteniendo la fidelidad de las propuestas, lo que se traduce en una mejora medible de velocidad de decodificación sin degradar la salida del modelo objetivo. Con 1.924.404.480 parámetros reales en safetensors y licencia Apache-2.0, es una pieza de infraestructura de inferencia más que un modelo generativo de propósito general.

El modelo está etiquetado como `inference: false` porque requiere un runtime de decodificación especulativa (shelf) y un modelo objetivo compatible; no puede cargarse de forma independiente en pipelines estándar de `transformers` para generar texto por sí solo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador (draft model) de 5 capas para decodificación especulativa DFlash 2; incluye capa `fc`, convoluciones dinámicas y selector de candidatos |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 con escalas BF16 por bloques de 128x128; esquema de activación dinámica; tensores pequeños (norms, convoluciones, selector) en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 1,97 GiB) con `quantization_config` FP8 en `config.json` |

## Arquitectura y entrenamiento

El modelo es un borrador de 5 capas que acompaña a Qwen3.8-27B en un esquema de decodificación especulativa DFlash 2. Contiene 36 capas lineales cuantizadas (`fc`, Q/K/V/O, gate/up/down de las 5 capas) en FP8 E4M3 con escalas BF16 por bloques de 128x128, y 45 tensores pequeños en BF16 sin cuantizar (norms, convoluciones dinámicas y selector de candidatos). No incluye embeddings ni LM head: el runtime los toma prestados del modelo objetivo. El proceso de cuantización es puramente post-entrenamiento, sin calibración: cada bloque de 128x128 se escala con `amax / 448` y se redondea a E4M3.

No se dispone de información sobre el dataset de entrenamiento del borrador original, número de tokens, ni si hubo fases de RLHF o DPO; la model card solo describe el proceso de cuantización. La innovación técnica destacable es la propia arquitectura DFlash 2 de decodificación especulativa, que permite al borrador proponer varios tokens por ronda (7 en las evaluaciones publicadas) y al modelo objetivo verificarlos en paralelo, con aceptación media de ~2,9 borradores por ronda.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone hasta `--dflash2-drafts 7` tokens por ronda que el modelo objetivo Qwen3.8-27B verifica.
- Preservación de la salida del modelo objetivo: en las 16 prompts evaluadas, los IDs generados coinciden al 100% con la decodificación greedy no especulativa.
- Compatibilidad con decodificación greedy y con temperatura 0,7 (mediciones posteriores del runtime shelf).
- Soporte de caché de prefijo (restauración de 4.096 tokens de prefijo en pruebas con tensor parallelism).
- Soporte de tensor parallelism en dos GPU con el modelo objetivo FP8.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües por sí mismo: hereda el comportamiento del modelo objetivo Qwen3.8-27B.
- No es un modelo de chat ni de instrucciones: no genera texto de forma autónoma.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B en producción: desplegar este borrador junto al modelo objetivo en el runtime shelf reduce el tiempo por ronda del borrador de 8,48 ms (BF16) a 6,23 ms, con un aumento de throughput de decodificación de +5,9% (69,13 a 73,19 tok/s) en una Radeon AI PRO R9700.
- Servicio de chat de baja latencia: al mantener la fidelidad exacta de los IDs generados respecto a la decodificación greedy, es adecuado para aplicaciones interactivas donde la reproducibilidad importa.
- Generación de código en pipelines: las pruebas cubren categorías de código, edición de ficheros y JSON, con salidas idénticas al modo no especulativo, lo que permite integrarlo en flujos de generación de código sin cambiar los resultados.
- Razonamiento y matemáticas: las categorías de evaluación incluyen math y reasoning, con aceptación de borradores estable, lo que lo hace viable para asistentes de resolución de problemas.
- Despliegue en hardware AMD ROCm: es una de las pocas opciones de borrador cuantizado probadas en `gfx1201` (R9700), útil para entornos con GPU AMD en lugar de NVIDIA.
- Inferencia con tensor parallelism multi-GPU: el test con dos GPU y caché de prefijo de 4.096 tokens demuestra su uso en despliegues con paralelismo de tensores y reutilización de prefijos largos.
- Reducción de huella de memoria en servidores: al pasar de 3,58 GiB a 1,97 GiB, libera VRAM para el modelo objetivo o para mayor batch.

## Benchmarks y rendimiento

Mediciones publicadas en la model card con el runtime `shelf` sobre una AMD Radeon AI PRO R9700 (gfx1201), objetivo Qwen3.8-27B EXL3-INT8 4 bpw, greedy, 7 borradores por ronda, 16 prompts (BetterBench: chat, code, file edit, json, math, prose, reasoning, summarization), hasta 512 tokens nuevos, una ejecución por prompt:

| Modelo borrador | Borradores aceptados / ronda | Decode tok/s | IDs idénticos vs greedy no especulativo |
|---|---:|---:|---|
| BF16 original | 2,933 | 69,13 | sí (16/16) |
| FP8 (este modelo) | 2,939 (100,2% de BF16) | 73,19 (+5,9%) | sí (16/16) |
| EXL3-INT8 4 bpw (repo hermano) | 2,884 | 73,35 (+6,1%) | sí (16/16) |

Tiempo de GPU del borrador por ronda: 8,48 ms (BF16) frente a 6,23 ms (FP8). El autor advierte que la diferencia de velocidad proviene de una sola ejecución por prompt y no ha sido validada estadísticamente.

Mediciones posteriores con objetivo EXL3-INT8 3,05 bpw y KV en BF16, una R9700 con ROCm 10.2, seis peticiones secuenciales (JSON, código y prosa), greedy y temperatura 0,7, 7 borradores sin árbol y caché de prefijo caliente:

| Configuración | tok/s | Borradores aceptados / ronda | IDs idénticos |
|---|---:|---:|---|
| Cabeza de propuesta original | 112,42 | 3,395 | sí (6/6) |
| Cabeza de propuesta optimizada | 114,10 | 3,395 | sí (6/6) |

Sobre 384 tokens generados, cada configuración medida una vez. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad, ya que el modelo no es evaluable de forma autónoma.

## Requisitos de hardware

- VRAM estimada para el borrador: ~1,97 GiB en FP8 (frente a 3,58 GiB en BF16), más la memoria del modelo objetivo Qwen3.8-27B y la caché KV.
- GPU probada: AMD Radeon AI PRO R9700 (gfx1201) con ROCm 10.2; también validado en configuración de dos GPU con tensor parallelism.
- No se ha probado en GPU NVIDIA ni en GPU de consumo; la model card solo confirma compatibilidad con `shelf` sobre ROCm.
- Opciones de despliegue: exclusivamente el runtime `shelf` (soporte de borradores cuantizados desde el PR #20); no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 73,19 tok/s de decodificación con objetivo EXL3-INT8 4 bpw en una R9700; 114,10 tok/s con objetivo 3,05 bpw y cabeza optimizada.
- Latencia del borrador por ronda: 6,23 ms en FP8.
- El formato FP8 por bloques es estándar, pero el repositorio solo ha sido probado con `shelf`.

## Comparativa con modelos similares

| Modelo | Parámetros | Precisión | Licencia | Runtime | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2-FP8 (este) | 1.924.404.480 | FP8 E4M3, bloques 128x128 | Apache-2.0 | shelf (ROCm) | 73,19 tok/s, 2,939 borradores/ronda |
| Qwen3.8-27B-DFlash2 (BF16 original) | no disponible | BF16 | Apache-2.0 | shelf (ROCm) | 69,13 tok/s, 2,933 borradores/ronda |
| Qwen3.8-27B-DFlash2-EXL3-INT8-4bpw | no disponible | EXL3-INT8 4 bpw | Apache-2.0 | shelf (ROCm) | 73,35 tok/s, 2,884 borradores/ronda |

No se dispone de información sobre otros borradores de decodificación especulativa comparables (por ejemplo, EAGLE o Medusa) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere el runtime `shelf` y el modelo objetivo Qwen3.8-27B; no funciona en pipelines estándar de `transformers`.
- Solo se ha validado con `shelf` sobre ROCm y GPU AMD R9700; no hay evidencia de funcionamiento en CUDA, vLLM, llama.cpp, Ollama o TGI.
- Las mediciones de velocidad provienen de una sola ejecución por prompt y no han sido validadas estadísticamente; el autor lo advierte explícitamente.
- La cuantización es post-entrenamiento sin calibración (escala `amax / 448` por bloque), lo que puede introducir error en distribuciones de activación atípicas, aunque en las pruebas publicadas los IDs generados coinciden al 100%.
- No se dispone de información sobre sesgos, riesgo de alucinación o cobertura idiomática del borrador; estas propiedades dependen del modelo objetivo.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el modelo objetivo Qwen3.8-27B y su licencia recae en el usuario.
- El repositorio tiene 234 descargas y 1 like, con actualización en noviembre de 2026; es un artefacto reciente y con poca validación comunitaria.
- El formato FP8 por bloques es estándar, pero la falta de pruebas fuera de `shelf` limita la portabilidad a otros stacks de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-DFlash2-FP8
- Modelo base (borrador BF16): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Repositorio hermano EXL3-INT8 4 bpw: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-DFlash2-EXL3-INT8-4bpw
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime shelf: https://github.com/kusuriya-labs/shelf
- PR de soporte de borradores cuantizados: https://github.com/kusuriya-labs/shelf/pull/20
- Comparativa de cabezas DFlash2: https://github.com/kusuriya-labs/shelf/blob/1fb31fd963cc4c71210aa0c9c461679af150be71/docs/research/20261122/dflash2_phase3a/README.md
- Test de caché de prefijo con tensor parallelism: https://github.com/kusuriya-labs/shelf/blob/1fb31fd963cc4c71210aa0c9c461679af150be71/docs/research/20261116/prefix_cache_radix_checkpoints.md
