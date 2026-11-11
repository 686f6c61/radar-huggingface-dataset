# austindixson/skill-cartridges

## Resumen

Skill Cartridges es una colección de máscaras de poda (sparse masks) entrenadas con la técnica Deletion Tuning, publicadas por el usuario austindixson en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un conjunto de ficheros pequeños (entre 5 y 60 MB) que, aplicados sobre un modelo base congelado, desactivan una fracción mínima de los pesos de las proyecciones gate de las capas MLP para mejorar una habilidad concreta. La innovación clave es que la cartulina solo elimina pesos, nunca escribe valores nuevos, de modo que al expulsarla los pesos originales se restauran bit a bit.

El trabajo se apoya en la técnica Deletion Tuning descrita por Lu, Yang, Lasby, Pote, Ioannou y Ren en el artículo *The Surprising Effectiveness of Deleting Weights in LLM Post-Training* (arXiv:2611.10866), y reutiliza datos y evaluadores de ToolAlpaca y Science procedentes de Shenfeld et al. (arXiv:2601.19897). Los cartuchos incluidos cubren tres modelos base: Qwen/Qwen3.5-9B, Qwen/Qwen3.8-27B y LiquidAI/LFM3-1.7B, con habilidades de tool use, razonamiento científico y recuperación de valores sintéticos.

La relevancia actual reside en que ofrece un mecanismo de personalización ligero y reversible: en lugar de reentrenar o aplicar LoRA, se intercambian máscaras de menos del 1 % de los parámetros en tiempo de petición, con un coste de intercambio medido de 0,04 ms en Apple Silicon con MLX. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño total es de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Máscaras de poda sobre proyecciones gate de MLP en transformers densos (Qwen-style `mlp.gate_proj`; `feed_forward.w1` en LFM3) |
| Parametros totales | No aplica al cartucho; depende del modelo base (Qwen3.5-9B, Qwen3.8-27B, LFM3-1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | Formatos evaluados: bf16 y MLX 4-bit; el formato de máscara es `packbits_zstd` |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0-and-lfm-open-license-v1.0 (etiqueta `other` en Hugging Face) |
| Formato de pesos | `safetensors` (máscara empaquetada con `zstd(np.packbits(keep.ravel()))`), más `config.json`, `summary.json` y `metrics.jsonl` |

## Arquitectura y entrenamiento

Cada cartucho es una máscara booleana por capa decodificadora que indica qué pesos de la proyección gate del MLP se conservan (bit 1) y cuáles se eliminan (bit 0). El fichero `mask/model.safetensors` almacena, para cada capa `L`, la forma `model.layers.{L}.mlp.gate_proj.weight.shape` y el tensor `.packed`, que es el resultado de aplicar `zstd` sobre el empaquetado de bits de la máscara aplanada. El `mask/config.json` registra `total_params` y `zero_params`. La proporción de pesos eliminados oscila entre el 0,293 % y el 0,713 % según el cartucho.

El entrenamiento sigue la receta de Deletion Tuning: inicialización Wanda, un schedule de sharpness, un regularizador y un objetivo que solo permite poner pesos a cero. Los datos y evaluadores de ToolAlpaca y Science provienen de Shenfeld et al., y la combinación de máscaras se realiza por unión. Los seeds de entrenamiento están documentados (seed 0, 2 y 3 para las variantes de ToolAlpaca; seed 0 y 2 para recall). El cartucho de Science se detuvo en el paso 330 de 400 previstos, y el run de 27B en el paso 272 sobre dos GPUs. El repositorio incluye `summary.json` con argumentos, puntuaciones y tiempos de cada job, y `metrics.jsonl` con la pérdida y la tasa de borrado por paso.

## Capacidades

- Tool use / function calling: los cartuchos de ToolAlpaca mejoran la precisión de invocación de herramientas sobre el modelo base congelado.
- Razonamiento científico: el cartucho `science` eleva la puntuación en SciKnowEval Chem L-3.
- Recuperación de valores (latest-value recall): los cartuchos `recall-seed1` y `recall-seed2` mejoran tareas sintéticas de recuperación del valor más reciente, incluida la generalización a secuencias más largas en held-out.
- Apilamiento de habilidades: la unión de cartuchos combina mejoras (por ejemplo, tool + science conserva el 87,5 % de la ganancia en tool y el 90,8 % en science).
- Conmutación en caliente: aplicación y expulsión de la máscara en tiempo de petición, con restauración exacta de los pesos base.
- No soporta generación autónoma ni capacidades multimodales por sí mismo: hereda las del modelo base sobre el que se aplica.

## Casos de uso

- Mejora de agentes con tool calling en producción: aplicar `qwen3.5-9b/toolalpaca-seed1` sobre Qwen3.5-9B para elevar la tasa de invocaciones correctas de herramientas (de 42 a 69 sobre 97 ítems en bf16) sin reentrenar el modelo ni duplicar pesos.
- Asistentes científicos especializados: usar el cartucho `science` sobre Qwen3.5-9B para tareas de química en SciKnowEval (de 120 a 316 sobre 507 ítems), útil en pipelines de apoyo a investigación que requieren respuestas verificables en un dominio acotado.
- Conmutación de habilidades por petición: en un servidor MLX, cargar y expulsar cartuchos según el tipo de consulta (tool use, science, recall) con un coste de intercambio de 0,04 ms, manteniendo una sola copia del modelo base en memoria.
- Despliegue en Apple Silicon: ejecutar Qwen3.5-9B en MLX 4-bit con cartuchos de 21 MB, adecuado para estaciones de trabajo Mac con memoria unificada y para prototipado rápido sin GPUs dedicadas.
- Investigación en poda y post-entrenamiento: comparar el efecto de eliminar menos del 1 % de pesos frente a LoRA u otras técnicas, usando `metrics.jsonl` y `summary.json` para reproducir curvas de pérdida y tasa de borrado.
- Evaluación de olvido catastrófico: medir el impacto de un cartucho sobre tareas generales (HellaSwag, MMLU, ARC-Challenge, WinoGrande) y sobre perplejidad en WikiText-2 antes de desplegarlo, como paso previo a la validación en producción.
- Modelos pequeños en dispositivos: aplicar `lfm3-1.7b/toolalpaca` (5,2 MB) sobre LFM3-1.7B para tool use en entornos con recursos muy limitados, con una mejora de 11 a 59 sobre 97 ítems.

## Benchmarks y rendimiento

Los datos proceden de la model card y del artículo asociado. La notación "base → cartucho" compara el mismo modelo con y sin máscara sobre los mismos ítems; ganados/perdidos son emparejados y *p* corresponde a un test exacto de McNemar bilateral.

| Cartucho | Modelo base | Habilidad (n) | Base → cartucho | Ganados / perdidos | Borrado | Tamano |
|---|---|---|---|---|---|---|
| `qwen3.5-9b/toolalpaca-seed1` | Qwen3.5-9B | ToolAlpaca (97) | 42 → 69 (bf16); 38 → 66 (MLX 4-bit) | 27 / 0; 28 / 0 | 10.702.823 (0,6645 %) | 21,1 MB |
| `qwen3.5-9b/toolalpaca-seed2` | Qwen3.5-9B | ToolAlpaca (97) | 42 → 71; 38 → 66 (4-bit) | 30 / 1; 28 / 0 | 10.950.222 (0,6799 %) | 21,5 MB |
| `qwen3.5-9b/toolalpaca-seed3` | Qwen3.5-9B | ToolAlpaca (97) | 42 → 68; 38 → 61 (4-bit) | 26 / 0; 24 / 1 | 10.819.819 (0,6718 %) | 21,3 MB |
| `qwen3.5-9b/science` | Qwen3.5-9B | SciKnowEval Chem L-3 (507) | 120 → 316 (MLX bf16) | 211 / 15 | 8.696.798 (0,5400 %) | 17,9 MB |
| `qwen3.5-9b/recall-seed1` | Qwen3.5-9B | Latest-value recall (200) | 89 → 200; held-out largo 8 → 100 | 111 / 0; 92 / 0 | 5.078.363 (0,315 %) | 11,3 MB |
| `qwen3.5-9b/recall-seed2` | Qwen3.5-9B | Latest-value recall (200) | 90 → 200; held-out largo 8 → 99 | no registrado por ítem | 4.719.792 (0,293 %) | 10,6 MB |
| `qwen3.8-27b/toolalpaca-run1` | Qwen3.8-27B | ToolAlpaca (97) | 42 → 65 (bf16); 41 → 67 (MLX 4-bit) | 29 / 6; 28 / 2 | 28.730.353 (0,5037 %) | 60,0 MB |
| `lfm3-1.7b/toolalpaca` | LFM3-1.7B | ToolAlpaca (97) | 11 → 59 | 48 / 0 | 2.690.252 (0,713 %) | 5,2 MB |

Resultados adicionales reportados en la model card:

- Apilamiento (unión de `toolalpaca-seed1` y `science`, MLX bf16): la ganancia en tool se mantiene al 87,5 % (45 → 69 en solitario, 66 en unión) y la de science al 90,8 % (120 → 316 en solitario, 298 en unión). La caída de 18 ítems en science no es significativa (*p* = 0,105).
- Olvido (27B, 4-bit, subconjunto del 34 % de HellaSwag, MMLU, ARC-Challenge y WinoGrande): media de −0,76 puntos (IC 95 % bootstrap emparejado: −1,41 a −0,13); ninguna tarea baja más de 1,2. Perplejidad en WikiText-2: 7,5956 sin cartucho, 7,5712 con cartucho.
- No incluido: un cartucho de código entrenado sobre soluciones de referencia de MBPP empeoró el 9B (MBPP 349 → 293 de 500; HumanEval 139 → 114 de 164). Se reporta en el artículo pero no se distribuye.

## Requisitos de hardware

- VRAM estimada: no disponible para el cartucho en sí; depende del modelo base. Los cartuchos ocupan entre 5,2 MB y 60 MB en disco, por lo que el coste adicional de memoria es despreciable frente al modelo base.
- GPU recomendadas: no se especifican en la información disponible. El run de 27B se entrenó en dos GPUs (modelo no indicado) y las evaluaciones MLX se hicieron en Apple Silicon.
- Compatibilidad con GPU de consumo: no confirmada. La librería declarada es MLX, orientada a Apple Silicon; no se documenta soporte CUDA en la información proporcionada.
- Opciones de despliegue: MLX (`mlx_lm` con `cartridge` y `quant_cartridge`), con funciones `apply_nearest_zero`, `eject`, `apply_dense`, `eject_dense` y `combine`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el intercambio en caliente se midió en 0,04 ms (warm swap) en Apple Silicon con MLX 4-bit; no se aportan cifras de latencia de generación ni de throughput.

## Comparativa con modelos similares

| Criterio | Skill Cartridges | LoRA / adaptadores | Fine-tuning completo | Modelo base sin modificar |
|---|---|---|---|---|
| Naturaleza | Máscara de poda (solo borra pesos) | Pesos nuevos de bajo rango | Actualización de todos los pesos | Pesos originales |
| Reversibilidad | Exacta (eject restaura bit a bit) | Requiere descargar adaptador | No reversible sin checkpoint | N/A |
| Tamaño | 5,2–60 MB | Típicamente decenas a cientos de MB | Tamaño completo del modelo | Tamaño completo del modelo |
| Coste de intercambio | 0,04 ms (warm swap, MLX) | Recarga de adaptador | Recarga completa | N/A |
| Combinable | Sí, por unión de máscaras | Sí, múltiples adaptadores | No trivial | N/A |
| Baseline LoRA documentado | No disponible (caveat del autor) | N/A | N/A | N/A |

No se dispone de comparaciones numéricas con LoRA u otras técnicas en la información proporcionada; el autor indica explícitamente que aún no existe baseline LoRA.

## Limitaciones y advertencias

- ToolAlpaca tiene solo 97 ítems; parte de la ganancia en exact-match puede deberse a formato. En LFM3 esa parte es grande: la longitud mediana de respuesta cae de 1.152 a 205 caracteres.
- La tarea de recall es sintética, por lo que la generalización a datos reales no está demostrada.
- No hay baseline LoRA publicado; no puede afirmarse que la técnica supere a otras alternativas de post-entrenamiento.
- El cartucho de código empeoró el modelo (MBPP y HumanEval) y no se distribuye; no debe asumirse que la técnica funcione igual en todas las habilidades.
- El cartucho de Science se detuvo antes de completar el entrenamiento (330 de 400 pasos) y el de 27B en 272 pasos, lo que puede limitar su rendimiento máximo.
- Las funciones de aplicación MLX apuntan a capas `mlp.gate_proj` de estilo Qwen; la compatibilidad con otras arquitecturas no está garantizada.
- El olvido medido en el 27B es pequeño pero no nulo (−0,76 puntos de media en tareas generales), por lo que conviene validar el impacto antes de desplegar en producción.
- Licencia `other` con nombre `apache-2.0-and-lfm-open-license-v1.0`: el uso comercial está sujeto a los términos combinados de Apache 2.0 y la LFM Open License v1.0; no se detallan restricciones adicionales en la información disponible.
- Idiomas soportados no disponibles; se heredan del modelo base.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/austindixson/skill-cartridges
- Repositorio y paper: https://github.com/austindixson/skill-cartridges
- PDF del paper: https://github.com/austindixson/skill-cartridges/blob/main/paper/skill-cartridges.pdf
- Deletion Tuning (artículo): https://arxiv.org/abs/2611.10866
- Deletion Tuning (código): https://github.com/agentic-learning-ai-lab/deleting-weights
- Máscaras originales de Deletion Tuning: https://huggingface.co/Jacklu0831/deletion-tuning-masks
- Self-Distillation Enables Continual Learning: https://arxiv.org/abs/2601.19897
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo MLX 4-bit de referencia: https://huggingface.co/mlx-community/Qwen3.5-9B-MLX-4bit
