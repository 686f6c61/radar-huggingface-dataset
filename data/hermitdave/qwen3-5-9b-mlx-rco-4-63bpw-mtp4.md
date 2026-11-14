# hermitdave/Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4

## Resumen

Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4 es una cuantización de precisión mixta del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario hermitdave y empaquetada para su uso con la librería MLX de Apple. No se trata de un modelo nuevo ni de un fine-tune, sino de una compresión con pérdida (lossy compression) del modelo base, orientada a reducir el peso en disco y memoria de 19,31 GB en BF16 a 6,23 GB, manteniendo la fidelidad lo más alta posible. El modelo base Qwen3.5-9B es un transformer híbrido multimodal (texto e imagen) de 9.653.104.368 parámetros totales, con 32 capas y una arquitectura `Qwen3_5ForConditionalGeneration`.

La relevancia de esta ficha reside en su método de cuantización: RCO (rate-constrained optimization) de precisión mixta, que asigna anchos de bit distintos por tensor (4, 6 y 8 bits) resolviendo un problema de mochila (knapsack) exacto sobre un presupuesto de bits, guiado por una tabla de error de reconstrucción medida y ponderada por una imatrix de activaciones. Además, la cabeza MTP (multi-token prediction) también se cuantiza a 4 bits, lo que permite usar decodificación especulativa Lightning MTP sin necesidad de injertar una cabeza BF16.

El resultado medido es un modelo de 4,6268 bpw en el tronco (5,1609 bpw considerando torre de visión y cabeza MTP), con una perplejidad de 10,6043 frente a 10,2656 del BF16 de referencia, un KL de 0,0393 y un 89,56% de acuerdo top-1. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (multimodal, transformer híbrido con Gated DeltaNet linear attention y atención completa cada 4 capas) |
| Parametros totales | 9.653.104.368 (8,95B texto + 0,46B visión + 0,24B MTP) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO de precisión mixta: 4-bit base, 6-bit y 8-bit por tensor; group size 32/64/128 por sensibilidad medida; escalas y sesgos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX packed affine (`mlx-packed-affine`), safetensors; librería `mlx-lm` |
| Capas | 32 |
| Bitwidth del tronco | 4,6268 bpw (incluye overhead de escalas) |
| Bitwidth total | 5,1609 bpw (incluye torre de visión y cabeza MTP) |
| Distribución de bitwidth | 48 módulos a 8-bit, 4 a 6-bit, 206 a 4-bit, resto en BF16 (norms y torre de visión) |
| Group sizes | 55 tensores a gs32, 150 a gs64, 53 a gs128; las 8 proyecciones MTP a 4-bit con gs64 |
| Tamaño del repo | 6,2 GB (6,23 GB / 5,8 GiB empaquetado; 19,31 GB en BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida de 32 capas que combina Gated DeltaNet (atención lineal) con atención completa cada cuatro capas, e incorpora una torre de visión (0,46B parámetros) y una cabeza MTP (0,24B parámetros) para decodificación especulativa. Esta ficha describe la versión cuantizada, no el entrenamiento original del modelo base, del que no se dispone de información sobre número de tokens, composición del dataset ni fases de RLHF/DPO.

El proceso de cuantización RCO aplica una asignación de precisión mixta sobre una tabla medida de error de reconstrucción por tensor, resuelta como un problema de mochila exacto sobre el presupuesto de bits. Sobre esa base se aplican tres técnicas adicionales: ponderación por imatrix (una imatrix de energía de activación por columna capturada localmente que guía tanto la tabla de error como la búsqueda de escalas por grupo); búsqueda de escala y sesgo por grupo con refit de mínimos cuadrados (`--lsq-refit`), que explora candidatos `(scale, bias)` anclados en los extremos y refita en forma cerrada cada grupo, aceptando solo si reduce el error ponderado; y dimensionado de group size por tensor según sensibilidad medida (`--per-tensor-group-size`). La calibración se realizó con WikiText (128 muestras × 2048 tokens) y las escalas/sesgos se almacenan en bfloat16 para que el kernel de dequantización de MLX los consuma de forma nativa. La innovación destacable es la cuantización a 4 bits de la cabeza MTP, que permite decodificación especulativa sin cabeza BF16 y resulta ligeramente más rápida que esta, porque el paso de draft lee una cuarta parte de los bytes.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Procesamiento multimodal image-text-to-text: acepta entradas de imagen y texto (torre de visión de 0,46B parámetros, mantenida en BF16).
- Decodificación especulativa Lightning MTP mediante la cabeza MTP cuantizada a 4 bits, con aceptación de draft del 93,8% a profundidad 1 y 78,2% a profundidad 3.
- Capacidades heredadas del modelo base Qwen3.5-9B (razonamiento, código, matemáticas, tool calling, agentes), si bien no se detallan en la información disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas en la model card).
- No se documentan modos de pensamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo empaquetado en MLX ocupa 6,23 GB, lo que permite ejecutarlo en equipos con memoria unificada de 16 GB o más, usando `mlx_lm.load()` directamente. Adecuado para desarrolladores que quieren un modelo multimodal de 9,65B en un portátil Mac sin GPU dedicada.
- Decodificación especulativa de baja latencia: sirviendo el modelo a través de oMLX con `mtp_enabled: true` y `mtp_fixed_depth: 3`, se alcanzan 113,3 tok/s frente a 68,6 tok/s sin MTP en un M3 Max de 64 GB (1,65× de aceleración). Útil para asistentes interactivos donde el tiempo hasta el primer token y el throughput importan.
- Prototipado de pipelines image-text-to-text: al conservar la torre de visión en BF16, el modelo puede procesar pares imagen-texto en flujos de descripción, extracción de información o respuesta a preguntas sobre imágenes, aunque el autor advierte que las entradas de imagen no están testeadas en el Hub.
- Evaluación comparativa de métodos de cuantización: la model card publica perplejidad, KL, acuerdo top-1 y recuperación zero-shot, lo que permite usar este checkpoint como referencia reproducible para comparar RCO frente a otras técnicas (GPTQ, AWQ, etc.) en el mismo modelo base.
- Despliegue en entornos con restricciones de memoria: la reducción de 19,31 GB a 6,23 GB (3,1×) facilita ejecutar el modelo en contenedores o máquinas con RAM limitada, manteniendo una perplejidad de 10,6043 frente a 10,2656 del BF16.
- Investigación sobre decodificación especulativa con cabezas cuantizadas: el checkpoint demuestra que una cabeza MTP a 4 bits supera ligeramente a la BF16 (113,3 vs 107,6 tok/s a profundidad 3), lo que lo convierte en un banco de pruebas para estudiar el trade-off entre precisión del draft y velocidad.
- Fine-tuning ligero o adaptación sobre MLX: aunque el modelo está empaquetado y permanece empaquetado en memoria y disco, sirve como base comprimida para experimentos de adaptación en el ecosistema MLX cuando el presupuesto de memoria es ajustado.

## Benchmarks y rendimiento

Fidelidad medida frente a la referencia BF16 (calibración WikiText, 128 muestras × 2048 tokens; evaluación 8 muestras × 256 tokens, greedy):

| Métrica | BF16 | Esta cuantización |
|---|---:|---:|
| Perplejidad | 10,2656 | 10,6043 |
| KL vs referencia | — | 0,0393 |
| Acuerdo top-1 | — | 89,56% |

Recuperación zero-shot en 5 tareas × 400 ejemplos (mismo conjunto de muestras para todos los checkpoints):

| Modelo | ARC-Challenge | ARC-Easy | HellaSwag | WinoGrande | MMLU | Media |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 52,00 | 81,00 | 50,25 | 52,50 | 50,00 | 0,5715 |
| RCO-lsq-mtp4 | no disponible (placeholder sin publicar en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible |

Rendimiento de decodificación especulativa (oMLX, prompt de 256 tokens, M3 Max 64 GB, profundidad fija):

| Configuración MTP | Desactivado | Profundidad 1 | Profundidad 3 |
|---|---:|---:|---:|
| Esta cuantización (cabeza 4-bit) | 68,6 tok/s | 100,6 (1,47×) | 113,3 (1,65×) |
| Mismo tronco, cabeza BF16 | 68,1 tok/s | 97,9 (1,44×) | 107,6 (1,58×) |

No se han publicado resultados de benchmarks estándar (MMLU completo, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 6,23 GB (5,8 GiB) para el modelo empaquetado completo, incluida torre de visión y cabeza MTP; el modelo permanece empaquetado en memoria y disco.
- GPU/equipos recomendados: Apple Silicon con memoria unificada; las mediciones se hicieron en un M3 Max de 64 GB. No se documentan requisitos para A100, H100 o RTX 4090, y el formato MLX packed affine está orientado al ecosistema Apple.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (16 GB o más como orientación práctica, no confirmado explícitamente por el autor). No se indica compatibilidad con GPUs NVIDIA de consumo.
- Opciones de despliegue: `mlx-lm` para carga y generación directa; oMLX para servir con decodificación especulativa (`mtp_enabled: true`, `mtp_fixed_depth: 3`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 68,6 tok/s sin MTP y 113,3 tok/s con MTP a profundidad 3 en M3 Max 64 GB (prompt de 256 tokens); aceptación de draft del 93,8% a profundidad 1 y 78,2% a profundidad 3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Rendimiento |
|---|---:|---|---|---|---|---|
| Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4 | 9,65B | no disponible | RCO mixta 4/6/8-bit, 4,6268 bpw tronco | Apache 2.0 | MLX packed affine | PPL 10,6043; KL 0,0393; 113,3 tok/s con MTP |
| Qwen/Qwen3.5-9B (BF16) | 9,65B | no disponible | BF16 | Apache 2.0 | safetensors | PPL 10,2656; media zero-shot 0,5715; 68,1 tok/s con cabeza BF16 |
| Mismo tronco con cabeza MTP BF16 | 9,65B | no disponible | RCO mixta + cabeza BF16 | Apache 2.0 | MLX packed affine | 107,6 tok/s a profundidad 3 |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no incluye comparaciones con modelos de otros autores (Llama, Mistral, Gemma, etc.) de tamaño similar, por lo que la comparativa se limita a las variantes del propio modelo base documentadas en la model card.

## Limitaciones y advertencias

- No es un fine-tune: es compresión con pérdida. El autor lo indica explícitamente y el KL de 0,0393 confirma que no es bit-exacto.
- La tabla de recuperación zero-shot del checkpoint cuantizado aparece como placeholder sin publicar, por lo que no hay datos de rendimiento en ARC, HellaSwag, WinoGrande ni MMLU para esta versión.
- La torre de visión se mantiene en BF16 y no fue reajustada; las entradas de imagen no están testeadas en el Hub, por lo que el uso multimodal no está validado de forma pública.
- El modelo empaquetado permanece empaquetado en memoria y disco, lo que limita su conversión a otros formatos y su uso fuera del ecosistema MLX.
- Sesgos conocidos: no disponible (no se documentan en la model card).
- Riesgo de alucinación: no disponible como dato específico; al ser una cuantización con pérdida, puede amplificar errores del modelo base.
- Idiomas soportados: no disponible; no se especifica cobertura multilingüe.
- Longitud de contexto: no disponible.
- Restricciones de licencia: Apache 2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datos de calibración (WikiText).
- En producción: validar la calidad en las tareas objetivo antes de desplegar, dado que la cuantización introduce degradación medible (perplejidad +3,3% relativo) y no hay benchmarks estándar publicados para esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Qwen3.5-9B-MLX-RCO-4.63bpw-mtp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de cuantización rco-mlx: https://github.com/hermitdave/rco-mlx
- Servidor oMLX (decodificación especulativa): https://github.com/jundot/omlx
