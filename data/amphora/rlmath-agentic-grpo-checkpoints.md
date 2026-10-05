# amphora/rlmath-agentic-grpo-checkpoints

# amphora/rlmath-agentic-grpo-checkpoints

## Resumen

`amphora/rlmath-agentic-grpo-checkpoints` no es un modelo único, sino una colección de checkpoints intermedios publicados tras ejecuciones de aprendizaje por refuerzo con GRPO sobre **rlmath**, un conjunto de entornos de construcción y optimización matemática con verificadores deterministas y sin juez basado en LLM. El agente entrenado es Terminus-2 y opera en una terminal sandbox: escribe y ejecuta código y finalmente envía una construcción que un evaluador programático puntúa. El problema que aborda es el entrenamiento de agentes que resuelven tareas matemáticas verificables de forma automática, sin depender de modelos evaluadores y sin recompensas difusas.

La relevancia de esta publicación es doble: por un lado, expone checkpoints intermedios de runs con recetas distintas, lo que permite analizar la dinámica del entrenamiento; por otro, documenta con detalle fallos concretos (desajuste de contexto entre rollout y entrenador, explosión de entropía) que resultan útiles para quien reproduzca pipelines de RL agéntico. Los modelos base sobre los que se parte son tres: Qwen3-4B-Thinking-2507 (transformer denso de 4.000 millones de parámetros), Qwen3-30B-A3B-Thinking-2507 (arquitectura MoE con unos 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos) y Qwen3.5-4B (modelo híbrido Gated-DeltaNet/atención, multimodal nativo).

Cada carpeta del repositorio es un directorio de modelo independiente con pesos safetensors, configuración, tokenizador y plantilla de chat, cargable mediante `from_pretrained(<repo>, subfolder="<folder>")`. No se incluyen estados del optimizador. El repositorio ocupa 409,1 GB y se publica bajo licencia Apache 2.0, aunque no ha registrado descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depende del checkpoint: transformer denso (Qwen3-4B-Thinking-2507), MoE (Qwen3-30B-A3B-Thinking-2507) e híbrido Gated-DeltaNet/atención con torre de visión nativa (Qwen3.5-4B) |
| Parametros totales | 4.000 millones (Qwen3-4B-Thinking-2507 y Qwen3.5-4B) y 30.000 millones (Qwen3-30B-A3B-Thinking-2507) |
| Parametros activos | Aproximadamente 3.000 millones en Qwen3-30B-A3B-Thinking-2507 (MoE); no aplica en los checkpoints densos de 4B |
| Longitud de contexto | No disponible como dato nativo del modelo base; en las ejecuciones de entrenamiento se emplean 32.000 tokens por llamada al modelo y hasta 128.000 tokens por trayectoria (receta v2) |
| Tipos de cuantizacion | No disponible; los pesos publicados están en bf16 (safetensors). No se distribuyen versiones GGUF ni cuantizadas |
| Idiomas soportados | No disponible; el entrenamiento fue exclusivamente con datos matemáticos y texto en inglés según la receta descrita, sin desglose lingüístico publicado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (directorios independientes con config, tokenizer y chat template; sin estados del optimizador) |

## Arquitectura y entrenamiento

La colección agrupa checkpoints de tres familias base. Qwen3-4B-Thinking-2507 es un transformer denso de 4.000 millones de parámetros; Qwen3-30B-A3B-Thinking-2507 es un modelo de mezcla de expertos con unos 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token; Qwen3.5-4B es un modelo híbrido que combina capas Gated-DeltaNet con atención y dispone de torre de visión nativa. En el caso de Qwen3.5, el entrenamiento fue solo de texto: la torre de visión se incluye en las carpetas publicadas pero nunca se actualizó. Además, las micro-batches contienen una sola secuencia cada una, porque la implementación de Gated-DeltaNet en transformers no respeta los límites de secuencias empaquetadas.

El entrenamiento emplea el *trainer* verl con receta agéntica de Alibaba (bucle de agente remoto y proxy de LLM), *rollouts* con vLLM y entrenamiento con FSDP. El algoritmo es GRPO con tasa de aprendizaje constante de 1e-6, *clip* de 0,2 / 0,28, sin pérdida KL, agregación de pérdida por media de tokens, temperatura 1,0 y un paso de optimizador por paso de entrenamiento. Las recompensas son deterministas: las tareas de construcción otorgan 1/0; las de optimización otorgan 0 si el envío es inválido y, en caso contrario, 0,1 + 0,9 · progreso recortado hacia el objetivo. La receta v2 usa 1.024 tareas de entrenamiento, 16 prompts × 32 rollouts por paso, hasta 12 turnos, 32.000 tokens por llamada y 128.000 por trayectoria, con 192 pasos planificados. Las trayectorias truncadas por límite de longitud se descartan de la pérdida. Se aplica *importance sampling* truncado a nivel de token (tope 2,0) para corregir el desajuste entre vLLM y el entrenador, y cada turno posterior al primero se prompea con exactamente la secuencia de tokens que ve el entrenador. Los pesos son bf16 con AdamW de torchao (redondeo estocástico bf16) bajo FSDP1.

## Capacidades

- Resolución de tareas matemáticas verificables mediante construcción de objetos y optimización con progreso medible.
- Ejecución de código en terminal sandbox: el agente escribe, ejecuta y depura programas antes de enviar una solución.
- Razonamiento multi-turno y multi-paso: las trayectorias contemplan hasta 12 turnos y 128.000 tokens en la receta v2.
- Modo *thinking* heredado de los modelos base Qwen3-Thinking y Qwen3.5.
- Aprendizaje por refuerzo con recompensa verificable, sin juez LLM, lo que reduce el riesgo de recompensas especulativas.
- Capacidad multimodal potencial en los checkpoints basados en Qwen3.5-4B (torre de visión presente) sin entrenamiento específico de visión: no se actualizó durante estos runs.
- Soporte de *tool calling* / *function calling*: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible; no hay desglose por idioma en la documentación.

## Casos de uso

- Investigación en RL agéntico con recompensa verificable: los checkpoints permiten reproducir y auditar la evolución de la recompensa de validación paso a paso, comparando recetas (v1 con validación contaminada frente a v2 con conjunto retenido) y observando el efecto de hiperparámetros como el bonus de entropía.
- Análisis de fallos de entrenamiento: los runs `rlmath_q35_4b_jupiter_v1` documentan una explosión de entropía (de ~0,66 en el paso 6 a 1,82 en el paso 20) con respuestas de 30.000 a 51.000 tokens, útiles como caso de estudio de inestabilidad en RL con bonus de entropía.
- Construcción geométrica y algebraica asistida: el agente puede generar construcciones que un verificador programático puntúa, lo que encaja en entornos educativos o de evaluación automática donde se requiere una comprobación objetiva.
- Optimización de objetos matemáticos: las tareas de optimización otorgan recompensa proporcional al progreso, de modo que el modelo puede emplearse en bucles de mejora iterativa sobre parámetros o estructuras con función objetivo medible.
- Generación y ejecución de código científico en sandbox: al operar en una terminal aislada, el modelo puede escribir scripts, ejecutarlos y corregirlos, lo que resulta adecuado para entornos de experimentación reproducible.
- Base para *fine-tuning* posterior en dominios con verificador propio: al publicarse bajo Apache 2.0 y en safetensors, los checkpoints pueden reentrenarse con otras funciones de recompensa deterministas.
- Estudio comparativo de arquitecturas base: la colección permite contrastar un denso de 4B, un MoE de 30B-A3B y un híbrido Gated-DeltaNet de 4B bajo la misma tarea y el mismo algoritmo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos números publicados son puntuaciones de validación sobre el propio entorno rlmath, que no son comparables con benchmarks generales. Se advierte además que la validación v1 (139 tareas, una por familia) está contaminada: 93 de esas 139 tareas también forman parte del conjunto de entrenamiento de 1.145 tareas usado desde `rlmath_async_v2`. La validación v2 (121 tareas, 48 familias) no se solapa con el conjunto `tasks_train_v2` de 1.024 tareas.

| Checkpoint | Base | Validación | Pasos evaluados |
|---|---|---|---|
| `qwen3-4b-thinking/rlmath_q4bthink_async_v1/step_25` | Qwen3-4B-Thinking-2507 | 0,235 (v1, contaminada) | paso 25 |
| `qwen3-4b-thinking/rlmath_async_v2/step_25` | v1 step 25 | 0,235 (paso 0) → 0,134 (paso 25) (v1) | 0 y 25 |
| `qwen3-4b-thinking/rlmath_4b_kt_v1/step_36`, `step_48` | Qwen3-4B-Thinking-2507 | 0,054 / 0,227 / 0,294 / 0,299 / 0,306 (v1) | 0 / 12 / 24 / 36 / 48 |
| `qwen3-30b-a3b-thinking/rlmath_30b_v1/step_6` | Qwen3-30B-A3B-Thinking-2507 | 0,341 (v1) | 0 |
| `qwen3-30b-a3b-thinking/rlmath_30b_mlxp_v1/step_36`, `step_48` | Qwen3-30B-A3B-Thinking-2507 | 0,331 / 0,372 / 0,447 / 0,521 / 0,503 (v1) | 0 / 12 / 24 / 36 / 48 |
| `qwen3-30b-a3b-thinking/rlmath_30b_mlxp_v2/step_36`, `step_48` | Qwen3-30B-A3B-Thinking-2507 | 0,427 / 0,479 / 0,548 / 0,536 / 0,539 (v2, retenida) | 0 / 12 / 24 / 36 / 48 |
| `qwen3.5-4b/rlmath_q35_4b_kt_v1/step_24`, `step_36` | Qwen3.5-4B | 0,399 / 0,323 / 0,483 / 0,529 (v2) | 0 / 12 / 24 / 36 |
| `qwen3.5-4b/rlmath_q35_4b_jupiter_v1/step_6` … `step_20` | Qwen3.5-4B | 0,343 (paso 0) / 0,511 (paso 12) (v2) | 0 y 12 |

Las puntuaciones de las tablas v1 y v2 no son directamente comparables entre sí, ya que proceden de conjuntos de validación distintos y con distinto grado de contaminación.

## Requisitos de hardware

- Tamano del repositorio: 409,1 GB en total, al agrupar checkpoints de tres familias base en precisión bf16. La descarga de una sola carpeta requiere únicamente los pesos de ese checkpoint.
- VRAM estimada para inferencia (orientativa, pesos en bf16, sin contar caché KV): en torno a 8-9 GB para los checkpoints de 4B, y en torno a 60 GB para el checkpoint MoE de 30B-A3B (el número de parámetros activos reduce el coste de cómputo, no el de memoria de pesos).
- GPU recomendadas: los runs de 30B se ejecutaron con 4 GPU para vLLM más 4 GPU para el entrenador (receta v2) y con FSDP1; el run de Qwen3.5-4B `rlmath_q35_4b_jupiter_v1` se ejecutó en un nodo con 4 × GH200 (2 para vLLM y 2 para entrenador). El run `rlmath_q35_4b_kt_v1` usó 5 GPU para vLLM y 2 para entrenamiento.
- Cabe en GPU de consumo: los checkpoints de 4B en bf16 deberían caber en GPU con 12-16 GB o más (por ejemplo RTX 4090 o RTX 4080), sujeto a la longitud de contexto empleada; el checkpoint de 30B-A3B requiere agregación de memoria o cuantización, no documentada en la información disponible.
- Opciones de despliegue: la información proporcionada menciona explícitamente vLLM para los *rollouts* y FSDP para el entrenamiento, además de compatibilidad con `from_pretrained` de transformers. No se documentan integraciones con llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponible.
- Nota sobre optimización de memoria en entrenamiento: se emplean pesos bf16 con AdamW de torchao (redondeo estocástico bf16) bajo FSDP1, y Ulysses SP 2 en el run de 30B de la receta v2.

## Comparativa con modelos similares

La comparación más directa es entre las tres familias base utilizadas en esta colección, ya que no se han identificado en la información disponible otras publicaciones equivalentes de checkpoints intermedios de GRPO agéntico sobre entornos matemáticos.

| Modelo base | Parametros | Arquitectura | Contexto de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Thinking-2507 | 4.000 millones | Transformer denso | 32k tokens/llamada, 64k por trayectoria (run `rlmath_4b_kt_v1`) | Apache 2.0 en estos checkpoints | Checkpoints en este repositorio |
| Qwen3-30B-A3B-Thinking-2507 | ~30.000 millones totales, ~3.000 millones activos | MoE | 32k tokens/llamada, 128k por trayectoria (receta v2) | Apache 2.0 en estos checkpoints | Checkpoints en este repositorio |
| Qwen3.5-4B | 4.000 millones | Híbrido Gated-DeltaNet/atención, multimodal nativo | 32k tokens/llamada, 128k por trayectoria (receta v2) | Apache 2.0 en estos checkpoints | Checkpoints en este repositorio |

El mejor resultado de validación retenida (v2) corresponde a `rlmath_30b_mlxp_v2/step_48` con 0,539, seguido de `rlmath_q35_4b_kt_v1/step_36` con 0,529 y `rlmath_q35_4b_jupiter_v1/step_12` con 0,511. Comparado con la puntuación inicial de cada base (0,427 y 0,399 respectivamente), las ganancias son de 0,112 y 0,130 puntos absolutos. Comparativa con alternativas externas de la misma categoría: no disponible.

## Limitaciones y advertencias

- La validación v1 (139 tareas) está contaminada: 93 de sus tareas pertenecen al conjunto de entrenamiento de 1.145 tareas. Las puntuaciones obtenidas con v1 no deben interpretarse como rendimiento generalizable.
- Los runs `rlmath_q4bthink_async_v1` y `rlmath_async_v2` se entrenaron con un desajuste de contexto entre rollout y entrenador: la plantilla de chat de Qwen3-Thinking elimina el razonamiento de turnos asistente anteriores, de modo que los turnos posteriores al primero se muestrearon sin ese razonamiento en contexto pero se entrenaron con él (KL entre vLLM y entrenador ≈ 0,045). Ambos runs degradaron a partir de unos 25 pasos, con la validación cayendo de 0,235 a 0,134.
- El run `rlmath_q35_4b_jupiter_v1` sufre una explosión de entropía: con bonus de 0,001, la entropía por token creció monótonamente de ~0,66 (paso 6) a 0,91 (paso 12), 1,16 (paso 14), 1,49 (paso 18) y 1,82 (paso 20), con respuestas de 30.000 a 51.000 tokens. El **paso 12 es el último checkpoint antes del colapso**; los pasos 14 a 20 se incluyen únicamente para análisis y no se recomiendan para uso. Un run de Qwen3.5-9B con el mismo bonus colapsó siguiendo el mismo patrón (entropía 3,6 y recompensa de entrenamiento reducida a la mitad en el paso 32).
- Los checkpoints basados en Qwen3.5-4B incluyen la torre de visión pero no fue entrenada: no debe esperarse capacidad multimodal funcional en estas carpetas.
- Entrenamiento exclusivamente sobre tareas matemáticas: no hay evidencia de capacidades generales de conversación, código de propósito general ni instruction following fuera del dominio.
- No se han publicado benchmarks estándar, por lo que no es posible situar estos checkpoints frente a modelos de propósito general del mismo tamaño.
- No se distribuyen estados del optimizador, lo que limita la reanudación exacta de los runs.
- Idiomas soportados y sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no evaluado en la documentación; en tareas con verificador determinista las salidas inválidas reciben recompensa cero durante el entrenamiento, pero no se caracteriza el comportamiento fuera de ese entorno.
- Uso comercial: la licencia Apache 2.0 de los checkpoints lo permite, si bien conviene verificar las condiciones de las licencias de los modelos base sobre los que se derivan.

## Enlaces

- HuggingFace: https://huggingface.co/amphora/rlmath-agentic-grpo-checkpoints
- Repositorio de Harbor (tareas empaquetadas): https://github.com/laude-institute/harbor
- Modelos base referenciados: Qwen/Qwen3-4B-Thinking-2507, Qwen/Qwen3-30B-A3B-Thinking-2507, Qwen/Qwen3.5-4B (no se han proporcionado URLs directas)
- Paper, blog, demo o repositorio adicional: no disponible. Los resultados de la búsqueda web realizada no contienen enlaces relevantes al modelo.
