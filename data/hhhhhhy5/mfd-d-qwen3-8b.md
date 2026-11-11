# hhhhhhy5/MFD-D-Qwen3-8B

## Resumen

MFD-D-Qwen3-8B es un modelo borrador (draft model) para decodificación especulativa diseñado para acelerar la inferencia de Qwen/Qwen3-8B. Lo desarrolla Haoyu Huang y colaboradores en el marco del trabajo *Multi-Future Drafting: Mixture Block Drafters for Tree-Verified Speculative Decoding* (arXiv:2611.13017). No es un modelo generativo autónomo: se acopla al modelo objetivo, lee sus estados ocultos y propone bloques de tokens candidatos que el objetivo verifica en árbol, de modo que la decodificación resultante es sin pérdida (lossless).

Técnicamente es un DFlash block drafter de 1049M parámetros en bf16, con 5 capas de anchura 4096 que leen las capas [1, 9, 17, 25, 33] del objetivo, un bloque de 16 posiciones (15 borradores por paso) y 8 embeddings de modo (`mode_embed`, 8 x 4096) que permiten generar un árbol de futuros múltiples. Se inicializa desde z-lab/Qwen3-8B-DFlash-b16 y se afina sobre 1,42M prompts de mlabonne/open-perfectblend con respuestas regeneradas por Qwen3-8B sin modo thinking.

Su relevancia es de ingeniería de serving: según el paper, alcanza 6,41x de speedup a temperatura 0 y 5,24x a temperatura 1 en el benchmark de 5 tareas con batch size 1, frente a 4,39x del DFlash chain nativo de SGLang y 5,27x de DDTree. El repositorio pesa 2,1 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (block drafter con mezcla de modos): 5 capas de anchura 4096, lectura de capas objetivo [1, 9, 17, 25, 33], bloque de 16 (15 posiciones borradoradas), 8 mode embeddings y gate lineal |
| Parametros totales | 1.048.663.296 (1049M) en bf16; no almacena embedding ni LM head del objetivo, que se usan en tiempo de ejecución |
| Parametros activos | no disponible (no es MoE; la mezcla de modos no implica activación dispersa de parámetros) |
| Longitud de contexto | no disponible (el entrenamiento usa secuencias de hasta 3072 tokens; la ventana efectiva la fija el modelo objetivo Qwen3-8B) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible de forma explícita; hereda el comportamiento del objetivo Qwen3-8B |
| Licencia | Apache-2.0 (los pesos de partida de z-lab/Qwen3-8B-DFlash-b16 son MIT) |
| Formato de pesos | safetensors con `custom_code` (requiere `DFlashDraftModel` del repositorio de código) |

## Arquitectura y entrenamiento

El modelo es un borrador por bloques de tipo DFlash: dado el contexto y los estados ocultos intermedios del objetivo, predice de golpe un bloque de 16 posiciones (15 borradores más la posición ancla). Sobre esa base, MFD-D añade K = 8 embeddings de modo aprendidos y un gate lineal (`mode_gate`, no usado en inferencia) que permiten generar varios futuros alternativos y verificar el árbol resultante contra el objetivo. El mismo borrador, sin embedding de modo, se entrena también como borrador monomodo (la "ruta por defecto"), de forma que un único motor sirve ambos caminos.

El entrenamiento parte de z-lab/Qwen3-8B-DFlash-b16 y usa los 1,42M prompts de mlabonne/open-perfectblend con respuestas regeneradas por Qwen3-8B sin thinking (T = 0,7, top-p 0,8, top-k 20, máximo 2048 tokens nuevos). Se realizan 3 épocas con AdamW, learning rate 1e-4 (4% warmup, coseno), clipping de gradiente 1, secuencias de hasta 3072 tokens, 36 secuencias por paso y 64 bloques ancla por secuencia x 8 modos. El objetivo combina un winner-take-all relajado sobre los 8 modos (el modo con mayor cobertura suave recibe peso 0,9 y el resto 0,1/7), la pérdida D-PACE con suavizado 0,5 por modo, entropía cruzada del gate con peso 0,1 y la pérdida D-PACE monomodo sobre la ruta por defecto. El vocabulario de borrador es de 64K tokens y el árbol se verifica con presupuesto configurable (B = 63 en los resultados del paper).

## Capacidades

- Aceleración de decodificación especulativa sin pérdida sobre Qwen/Qwen3-8B (sin modo thinking): no altera la distribución del objetivo, solo reduce el número de pasos de decodificación.
- Borrador por bloques de 16 posiciones con árbol verificado (`ddtree_generate`, `tree_budget` configurable).
- Mezcla de 8 modos para generar futuros alternativos y aumentar la tasa de aceptación del árbol.
- Ruta monomodo por defecto para escenarios de alta concurrencia.
- Integración con SGLang mediante un parche que sirve la mezcla a batch sizes 1-2 y la ruta por defecto a partir de 3 peticiones concurrentes, dentro del mismo motor.
- Inferencia directa con Hugging Face Transformers (entorno `inference/hf`) usando `DFlashDraftModel` y utilidades C++ opcionales (`enable_cpp_tree`, `enable_mode_attention`).
- No soporta tool calling, agentes, visión, audio ni generación autónoma: su única función es proponer tokens para el objetivo.

## Casos de uso

- Serving de alto rendimiento de Qwen3-8B en producción: desplegado con SGLang y el parche MFD, reduce el coste por token generado al elevar el speedup a 6,41x (T = 0) y 5,24x (T = 1) en batch 1, lo que se traduce directamente en menor latencia y mayor throughput por GPU.
- Asistentes conversacionales interactivos: con batch sizes 1-2 el motor usa la mezcla de 8 modos, ideal para chats individuales donde la latencia percibida es crítica.
- Endpoints con concurrencia moderada: a partir de 3 peticiones simultáneas el motor conmuta automáticamente a la ruta monomodo, manteniéndose dentro del 3,1% del mejor motor fijo en cada batch size de 1 a 32 (Figura 5 del paper), lo que evita reconfigurar el despliegue al cambiar la carga.
- Generación de código y matemáticas de forma interactiva: el ejemplo de la model card resuelve "What is 17 * 23?" con el objetivo sin thinking y el borrador MFD-D, adecuado para autocompletado o REPL asistido donde importa el tiempo hasta el primer token y la velocidad de emisión.
- Evaluación e investigación en decodificación especulativa: sirve como referencia reproducible para comparar DFlash chain, DDTree y D-PACE + DDTree bajo el mismo harness de 5 tareas y B = 63.
- Reducción de costes en inferencia por lotes pequeños: al no requerir GPUs adicionales ni cambiar el modelo objetivo, permite reutilizar despliegues existentes de Qwen3-8B añadiendo solo los 2,1 GB del borrador.
- Benchmarking interno de infraestructura: útil para medir el impacto real de la verificación en árbol y del vocabulario de borrador de 64K en clústeres propios antes de adoptar la técnica a mayor escala.

## Benchmarks y rendimiento

Resultados del paper (SGLang 0.5.22 con el parche MFD, batch size 1, las mismas 5 tareas, B = 63, vocabulario de borrador de 64K, Tabla 2). Se muestra el speedup y, entre paréntesis, el valor absoluto de tokens por paso o métrica equivalente tal como aparece en la fuente:

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (drafter publicado, SGLang nativo) | 4,39x (5,90) | 3,62x (4,88) |
| DDTree (drafter publicado) | 5,27x (7,79) | 4,56x (6,74) |
| D-PACE + DDTree (1,42M prompts) | 5,99x (8,84) | 4,82x (7,15) |
| **Este drafter (MFD-D)** | **6,41x (9,69)** | **5,24x (7,95)** |

En el barrido de batch sizes 1-32 (bucle cerrado, 320 peticiones), el motor con conmutación se mantiene dentro del 3,1% del mejor motor fijo en cada batch size (Figura 5 del paper). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad, ya que el modelo no genera respuestas por sí mismo.

## Requisitos de hardware

- VRAM del borrador: 2,1 GB de pesos en bf16 (1049M parámetros); a esto se suma la memoria del objetivo Qwen3-8B (aproximadamente 16 GB en bf16), que debe residir en la misma GPU o en una accesible.
- GPU recomendadas: no hay lista oficial en la información disponible; por tamaño, el par objetivo + borrador en bf16 encaja en A100 40/80 GB, H100 y L40S. En GPUs de consumo (RTX 4090 de 24 GB) el conjunto en bf16 es ajustado y requiere cuantización del objetivo, no documentada por el autor.
- Cabe en GPU de consumo: solo con el objetivo cuantizado; el borrador en bf16 ocupa 2,1 GB adicionales. No se documentan recetas de cuantización para el borrador.
- Despliegue: SGLang 0.5.22 con el parche MFD (`inference/sglang/launch_server.sh`, `draft_vocab_qwen3-8b_64k.json`, `mfdd-switch-qwen3-8b.env`) o Hugging Face Transformers con `DFlashDraftModel` y las utilidades `ddtree`. No se mencionan soportes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el paper reporta speedups de 6,41x (T = 0) y 5,24x (T = 1) en batch 1; no se publican valores absolutos de latencia (ms/token) ni de throughput (tokens/s) en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (T = 0 / T = 1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MFD-D-Qwen3-8B (este) | DFlash drafter con 8 modos | 1049M | no disponible | 6,41x / 5,24x | Apache-2.0 | Hugging Face + repo de código |
| z-lab/Qwen3-8B-DFlash-b16 | DFlash drafter monomodo (inicialización) | no disponible en la información | no disponible | base de partida; no se reporta su speedup aislado | MIT | Hugging Face |
| DFlash chain (drafter publicado, SGLang nativo) | Cadena DFlash | no disponible | no disponible | 4,39x / 3,62x | no disponible | SGLang nativo |
| DDTree (drafter publicado) | Árbol DDTree | no disponible | no disponible | 5,27x / 4,56x | no disponible | Publicado |
| D-PACE + DDTree (1,42M prompts) | Árbol DDTree con D-PACE | no disponible | no disponible | 5,99x / 4,82x | no disponible | Publicado |

La comparación es en términos de speedup de decodificación especulativa sobre el mismo objetivo Qwen3-8B; no procede comparar parámetros o contexto con modelos generativos, ya que el borrador no produce respuestas de forma autónoma.

## Limitaciones y advertencias

- La mezcla de 8 modos solo se usa con batch sizes 1-2; a partir de 3 peticiones concurrentes el motor ejecuta la ruta monomodo por defecto, con menor speedup potencial.
- El borrador está atado a su objetivo: lee los estados ocultos de Qwen3-8B y usa su embedding y LM head. No es portable a otros modelos sin reentrenamiento.
- No soporta el modo thinking de Qwen3-8B: el entrenamiento y los ejemplos usan `enable_thinking=False`.
- No es un modelo generativo: no debe evaluarse con benchmarks de calidad (MMLU, HumanEval, GSM8K) ni usarse como sustituto del objetivo.
- Riesgo de alucinación: no aplica de forma directa, ya que la verificación en árbol es sin pérdida y la salida final la produce el objetivo; cualquier error factual proviene de Qwen3-8B.
- Sesgos: hereda los del objetivo y los de los prompts de mlabonne/open-perfectblend; el autor no documenta análisis de sesgo específico.
- Idiomas: no se declaran idiomas soportados; la cobertura depende de Qwen3-8B y de la distribución de open-perfectblend.
- Licencia: Apache-2.0 para este borrador, pero los pesos de partida de z-lab/Qwen3-8B-DFlash-b16 son MIT y su aviso aplica a los pesos originales; conviene conservar ambas atribuciones en uso comercial.
- Requiere código con `custom_code` y, para SGLang, un parche específico sobre la versión 0.5.22; no es un artefacto plug-and-play en stacks estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se creó el 2026-11-11: no hay evidencia de uso en producción ni validación independiente fuera del paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhhhhhy5/MFD-D-Qwen3-8B
- Modelo base (inicialización): https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Dataset de prompts: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Paper: https://arxiv.org/abs/2611.13017
- Código: https://github.com/hhhhhhy5/multi-future-drafting
- Página del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
