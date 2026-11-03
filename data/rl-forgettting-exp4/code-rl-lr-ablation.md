# RL-Forgettting-Exp4/code-rl-lr-ablation

## Resumen

`code-rl-lr-ablation` es un artefacto de investigación publicado por el usuario `RL-Forgettting-Exp4` en HuggingFace, no un modelo listo para producción. Contiene los checkpoints de un estudio de ablación sobre aprendizaje por refuerzo (GRPO) aplicado a generación de código, en el que se entrena `Qwen/Qwen2.5-3B` sobre 320 problemas de MBPP con tres tasas de aprendizaje del actor por debajo del valor por defecto de 1e-6 (6e-6, 3e-6 y 6e-7), cada una con y sin búfer de replay de tipo SFT. El objetivo declarado es determinar en qué punto de la escala de learning rate el entrenamiento deja de ser estable y si el replay desplaza ese umbral.

El repositorio tiene 251,4 GB e incluye, por cada celda de la ablación, directorios completos de modelo HuggingFace en formato safetensors con checkpoints cada 30 pasos (hasta el paso 800), además de logs del entrenador y rollouts muestreados. La model card documenta explícitamente dos carpetas: `qwen3b_mbpp_hardcd_lam0p1_lr6e7` (con replay, lambda=0.1, lr=6e-7, checkpoints de 30 a 800) y `qwen3b_mbpp_nobuf_lr6e7` (sin búfer, lr=6e-7, checkpoints de 330 a 800). Los runs de referencia con lr=1e-6 viven en repositorios separados.

Su relevancia es metodológica: proporciona una traza completa de checkpoints para estudiar olvido catastrófico y estabilidad de GRPO en código, con evaluación sobre MBPP+ (378 problemas, ~108 tests por problema) en lugar de los 3 asserts originales de MBPP. No es un modelo para desplegar en aplicaciones, sino material reproducible para investigadores que analicen dinámica de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B); el artefacto es un conjunto de checkpoints post-entrenamiento con GRPO |
| Parametros totales | 3B (modelo base `Qwen/Qwen2.5-3B`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B soporta contextos largos, pero la model card no lo especifica para estos checkpoints) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors sin cuantizar |
| Idiomas soportados | no disponible (la model card no declara idiomas; el entrenamiento es en inglés por el dataset MBPP) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (directorios HuggingFace completos por checkpoint) |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen/Qwen2.5-3B`, un transformer decoder-only de 3B parámetros. Sobre él se aplica GRPO (Group Relative Policy Optimization) con 8 rollouts por prompt, batch de 64 y longitud de respuesta de 3072 tokens. La recompensa es binaria y se obtiene ejecutando el programa generado contra los asserts de cada tarea. Los brazos con replay añaden 128 rollouts pasados por paso, ponderados con lambda=0.1 y muestreados mediante la estrategia `hard_cooldown`.

Los datos de entrenamiento son 320 problemas de MBPP, separados tanto de MBPP+ (378 problemas) como del split de test canónico de MBPP (276), de modo que ambos conjuntos permanecen evaluables sin contaminación. La ablación varía únicamente la tasa de aprendizaje del actor (6e-6, 3e-6, 6e-7) manteniendo el resto de hiperparámetros idénticos a los runs de referencia con lr=1e-6. Según la model card, lr=1e-5 es inestable ("coin flip") y 1e-4 / 1e-3 son "reliably fatal" en ambos brazos, lo que sitúa el interés del estudio en la franja entre 6e-7 y 6e-6.

## Capacidades

- Generación de código Python: el entrenamiento con GRPO sobre MBPP optimiza la producción de programas que pasan tests ejecutables.
- Razonamiento de resolución de problemas: cada prompt es un problema de programación con asserts de verificación.
- Aprendizaje por refuerzo con recompensa verificable: los checkpoints reflejan políticas optimizadas por ejecución, no por preferencias humanas.
- Trazabilidad de entrenamiento: se incluyen logs del entrenador y rollouts muestreados por celda de ablación.
- Reanudación y análisis por checkpoint: cada `global_step_<N>` es un directorio HF completo cargable con `AutoModelForCausalLM.from_pretrained`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles; el entrenamiento es exclusivamente en inglés (MBPP).

## Casos de uso

- Estudio de olvido catastrófico: comparar checkpoints tempranos y tardíos (paso 30 frente a 800) sobre tareas fuera de distribución para medir cuánto degrada el RL las capacidades del modelo base. El repositorio ofrece la serie completa de checkpoints cada 30 pasos.
- Investigación de estabilidad de GRPO: reproducir la escala de learning rates y analizar en qué punto la recompensa deja de mejorar o colapsa, usando los logs y rollouts incluidos.
- Evaluación del efecto del replay buffer: contrastar `qwen3b_mbpp_hardcd_lam0p1_lr6e7` con `qwen3b_mbpp_nobuf_lr6e7` manteniendo todo lo demás constante, para aislar la contribución del muestreo `hard_cooldown` con lambda=0.1.
- Benchmarking de generación de código: evaluar los checkpoints sobre MBPP+ con pass@k no sesgado (n=160, temperatura 0.6, top_p 0.95) y comparar con los runs de referencia lr=1e-6.
- Reproducibilidad de pipelines de RL para código: reutilizar la configuración (8 rollouts, batch 64, respuesta de 3072 tokens, recompensa por ejecución) como plantilla para otros datasets con tests ejecutables.
- Análisis de dinámica de políticas: estudiar la evolución de los rollouts muestreados a lo largo del entrenamiento para detectar colapso de diversidad o sobreajuste a los 320 problemas de entrenamiento.

## Benchmarks y rendimiento

La model card describe el protocolo de evaluación (MBPP+, 378 problemas, n=160 muestras, temperatura 0.6, top_p 0.95, pass@k no sesgado, suite completa de ~108 tests por problema) pero no incluye resultados numéricos en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6-7 GB para los 3B parámetros más overhead de activaciones y KV cache; en 8 bits, unos 3,5-4 GB; en 4 bits, unos 2-2,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación por lotes; RTX 4090 (24 GB) o A10G (24 GB) suficientes para inferencia en precisión completa.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización a 8 o 4 bits (la cuantización no está publicada en el repo, habría que generarla).
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir a GGUF; carga directa con `transformers` indicando el `subfolder` del checkpoint.
- Almacenamiento: el repo completo ocupa 251,4 GB; descargar una sola celda o un solo checkpoint reduce sustancialmente el espacio necesario.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RL-Forgettting-Exp4/code-rl-lr-ablation` (este) | 3B | no disponible | GRPO sobre MBPP, ablación de lr y replay | apache-2.0 | HuggingFace, 0 descargas |
| `RL-Forgettting-Exp4/code-q3_1p7b-nobuf` y `-replay-lam0p1` | no disponible (nombre sugiere ~1,7B) | no disponible | GRPO sobre MBPP con lr=1e-6, referencia del estudio | no disponible | HuggingFace (repos citados en la model card) |
| `RL-Forgettting-Exp4/code-q25_3b-*` | 3B | no disponible | GRPO sobre MBPP con lr=1e-6, referencia del estudio | no disponible | HuggingFace (repos citados en la model card) |
| `Qwen/Qwen2.5-3B` (base) | 3B | no disponible en esta ficha | Preentrenamiento + post-entrenamiento estándar de Qwen | apache-2.0 | HuggingFace, ampliamente utilizado |

La comparación relevante es interna al propio estudio: los runs de referencia con lr=1e-6 permiten aislar el efecto de la tasa de aprendizaje y del replay frente a este repositorio de ablación.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación con 0 descargas y 0 likes, sin validación externa.
- Entrenado sobre solo 320 problemas de MBPP; riesgo alto de sobreajuste y de degradación de capacidades generales (olvido catastrófico, precisamente el fenómeno que estudia).
- Evaluación limitada a Python y a tareas tipo MBPP; no hay evidencia de generalización a otros lenguajes o dominios.
- Idiomas: no se declaran; el entrenamiento es en inglés, por lo que el rendimiento en castellano no está caracterizado.
- Riesgo de alucinación en código: el modelo puede generar programas sintácticamente plausibles que fallen los tests; la recompensa por ejecución mitiga pero no elimina este comportamiento.
- Sesgos: no documentados en la model card; al heredar de Qwen2.5-3B, arrastra los sesgos del modelo base y los del dataset MBPP.
- Licencia apache-2.0 permite uso comercial, pero al derivar de Qwen2.5-3B conviene verificar que se cumplen las condiciones de la licencia del modelo base.
- Tamaño del repo (251,4 GB) y multiplicidad de checkpoints: requiere planificación de almacenamiento y ancho de banda; descargar el repo completo no es práctico para uso individual.
- No se especifican longitudes de contexto efectivas tras el entrenamiento; la respuesta se limita a 3072 tokens durante el RL.
- Fechas de creación y actualización (noviembre de 2026) posteriores a la fecha habitual de referencia; verificar la integridad de los artefactos antes de usarlos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RL-Forgettting-Exp4/code-rl-lr-ablation
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Runs de referencia lr=1e-6 citados en la model card: `RL-Forgettting-Exp4/code-q3_1p7b-nobuf`, `RL-Forgettting-Exp4/code-q3_1p7b-replay-lam0p1`, `RL-Forgettting-Exp4/code-q25_3b-*` (sin URL directa en la información proporcionada)
- Dataset MBPP: no se proporciona enlace en la información disponible
- Dataset MBPP+: no se proporciona enlace en la información disponible
- Paper de GRPO: no se proporciona enlace en la información disponible
