# corbanyax/Dress-Rehearsal-Qwen3-0.6B-4bit-KV-LoRA

## Resumen

Dress-Rehearsal-Qwen3-0.6B-4bit-KV-LoRA es un adaptador LoRA publicado por el usuario corbanyax sobre el modelo base `mlx-community/Qwen3-0.6B-4bit`, orientado a un problema muy concreto de ingeniería de inferencia: mantener la precisión de un modelo de razonamiento aritmético cuando se sirve a través de una caché KV cuantizada a 4 bits. El autor denomina "Dress Rehearsal" a la receta de entrenamiento en dos etapas (warm-up supervisado con caché simulada de 4 bits y posterior GRPO con la caché real) que evita el colapso de precisión que sufren las políticas entrenadas en BF16 al decodificarse con caché cuantizada.

El modelo se apoya en Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros, y se distribuye como adaptador LoRA en formato MLX para Apple Silicon, con licencia Apache 2.0. No es un modelo generalista: está especializado en la tarea Countdown (construir una expresión aritmética con unos números dados para alcanzar un objetivo), y su interés radica en demostrar que el entrenamiento consciente de la cuantización de la caché KV permite servir modelos pequeños con memoria reducida sin pérdida práctica de exactitud.

La relevancia actual es metodológica: el autor documenta ablaciones con tests de McNemar que aíslan qué componente de la receta es imprescindible (el warm-up con caché simulada) y cuál no (el learner RL con caché simulada), y cuantifica el coste de servir en 4 bits frente a BF16 (1,7 puntos agregados sobre dos semillas). El repositorio incluye seis variantes en carpetas separadas, incluyendo ablaciones y ambas semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA; inferencia con caché KV cuantizada a 4 bits |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B); el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | Pesos del modelo base en 4 bits; caché KV en 4 bits (grupo 64, ~28% del payload BF16); el adaptador puede servirse también con caché BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA en `adapters.safetensors` + `adapter_config.json`; requiere el modelo base en MLX (`mlx-community/Qwen3-0.6B-4bit`) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros, mediante una receta de dos etapas sobre una política previamente entrenada con GRPO. La primera etapa, denominada "rehearsal" o warm-up (~31 minutos), consiste en un ajuste fino supervisado del adaptador LoRA sobre las respuestas correctas de la propia política, pero con una modificación clave: en cada paso forward del learner, cada clave y valor se sustituyen por `dequant(q4(.))` usando el cuantizador exacto de la caché de servicio, con el gradiente atravesando el redondeo. Esto lleva al learner al suelo de ruido de la caché real (KL de 7,4 a 0,18). La segunda etapa (~2 horas) aplica 30 actualizaciones GRPO estándar con rollouts a través de la caché real de 4 bits y un learner sin modificar.

El hallazgo técnico central es que el warm-up necesita la caché simulada: la ablación con warm-up sobre caché BF16 plana cae a 0,000 de precisión al servirse en 4 bits (frente a 0,550 en BF16), mientras que el warm-up simulado alcanza 0,470/0,460. En cambio, el learner RL con caché simulada no aporta ventaja significativa sobre el learner RL estándar (15 vs 13, p = 0,85). El dataset de entrenamiento y evaluación es `corbanyax/Countdown-3-Hash-Splits`, y el adaptador se distribuye en seis variantes (dos semillas principales, una ablación de RL simulado, dos warm-ups por semilla y una ablación de warm-up con caché plana).

## Capacidades

- Generación de texto y razonamiento aritmético multi-paso en la tarea Countdown: construir expresiones con suma, resta, multiplicación, división y paréntesis usando cada número exactamente una vez.
- Formato de respuesta estructurado con etiquetas `<answer>...</answer>` tras un razonamiento breve, tal como se especifica en el prompt de ejemplo.
- Modo sin thinking (`enable_thinking=False` en la plantilla de chat de Qwen3); el modo con thinking no se documenta en la información disponible.
- Inferencia con caché KV cuantizada a 4 bits (4 bits, grupo 64, `quantized_kv_start=0`) usando mlx-lm estándar, o con caché BF16 omitiendo `kv_bits`.
- Ejecución en Apple Silicon mediante MLX (probado con mlx 0.31.2 y mlx-lm 0.31.3).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Evaluación de técnicas de cuantización de caché KV: el adaptador sirve como referencia reproducible para medir la degradación de precisión al pasar de BF16 a 4 bits en un modelo pequeño, con tests estadísticos ya calculados por el autor.
- Investigación en entrenamiento consciente de la cuantización (QAT): la receta de warm-up con caché simulada y gradiente a través del redondeo es directamente reutilizable en otros modelos y tareas de razonamiento.
- Despliegue en Apple Silicon con memoria restringida: al reducir el payload de la caché KV al 28% del BF16, permite servir Qwen3-0.6B en equipos con RAM unificada limitada manteniendo exactitud en tareas aritméticas.
- Reproducción de experimentos de RL (GRPO) con restricciones de memoria: útil para laboratorios que entrenan políticas pequeñas en portátiles o estaciones Mac sin GPU dedicada.
- Benchmark de referencia para Countdown: el split `test_id` de 1.000 problemas evaluado una sola vez permite comparar futuras políticas con una métrica pública y estable.
- Estudio de ablaciones metodológicas: las seis variantes del repositorio permiten analizar el impacto aislado de cada componente (warm-up simulado, warm-up plano, learner RL simulado) sin reentrenar desde cero.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), precisión greedy servida con caché KV de 4 bits; entre paréntesis, la precisión de la misma política con caché BF16.

| Política | dev-200 | test_id (1.000, evaluado una vez) |
|---|---|---|
| Baseline entrenado en BF16 (no incluido en el repo) | 0,000* (0,680 / 0,625) | (0,582 / 0,535) |
| Dress Rehearsal, semilla 1 (raíz) | 0,675 (0,670) | 0,617 (0,643) |
| Dress Rehearsal, semilla 2 | 0,695 (0,695) | 0,630 (0,638) |
| Ablación: learner RL con caché simulada, semilla 1 | 0,685 (0,670) | no disponible |
| Solo warm-up, caché simulada (semillas 1 y 2) | 0,470 / 0,460 (0,515 / 0,475) | no disponible |
| Ablación: warm-up con caché plana BF16, semilla 1 | 0,000 (0,550) | no disponible |

\* Primeros 64 problemas. Tests de McNemar exactos por pares: RL frente al inicio del warm-up 46 vs 5 (p = 2e-9) y 50 vs 3 (p = 6e-12); warm-up simulado frente a plano 94 vs 0 (p = 1e-28); learner RL simulado frente a plano 15 vs 13 (p = 0,85). En el split de test, servir en 4 bits frente a BF16 cuesta 1,7 puntos agregados sobre ambas semillas (p = 0,03), y las políticas servidas en 4 bits superan a las entrenadas en BF16 servidas en BF16 (79 vs 44, p = 0,002; 153 vs 58, p = 5e-11). El autor aclara que las políticas Dress Rehearsal tuvieron warm-up más 30 actualizaciones adicionales que las baselines, por lo que la afirmación es ausencia de pérdida en servicio, no ganancia.

## Requisitos de hardware

- VRAM/RAM unificada: el repositorio ocupa 0,2 GB (adaptador LoRA); el modelo base Qwen3-0.6B en 4 bits requiere del orden de 0,4-0,5 GB de pesos, más la caché KV de 4 bits (28% del payload BF16), lo que en conjunto cabe holgadamente en cualquier Mac con Apple Silicon.
- GPU recomendadas: exclusivamente Apple Silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) por la dependencia de MLX; no hay soporte documentado para CUDA en la información proporcionada.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no se documenta compatibilidad con RTX 4090 u otras GPU NVIDIA.
- Opciones de despliegue: mlx-lm 0.31.3 (verificado por el autor el 2026-11-13), con `kv_bits=4`, `kv_group_size=64` y `quantized_kv_start=0` para replicar la evaluación; `huggingface_hub.snapshot_download` para descargar el adaptador.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo reporta tiempos de entrenamiento (~31 min de warm-up y ~2 h de GRPO).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dress-Rehearsal-Qwen3-0.6B-4bit-KV-LoRA | 0,6B (base) + LoRA | no disponible | Adaptador para caché KV 4 bits en tarea Countdown | Apache 2.0 | Hugging Face (MLX) |
| Qwen3-0.6B (base, `mlx-community/Qwen3-0.6B-4bit`) | 0,6B | no disponible en la información proporcionada | Modelo generalista de texto | Apache 2.0 | Hugging Face |
| Política GRPO entrenada en BF16 (baseline del autor, no publicada) | 0,6B | no disponible | Countdown con caché BF16 | no disponible | no disponible |

No se dispone de datos de benchmarks de Qwen3-0.6B base ni de la baseline BF16 en la información proporcionada, por lo que no es posible una comparación cuantitativa fuera de la tabla de resultados del propio autor.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado para Countdown y razonamiento aritmético; no se documenta su comportamiento en otras tareas y es probable que degrade capacidades generales del modelo base.
- Solo inglés: la model card declara únicamente `en`; no hay evaluación en castellano ni en otros idiomas.
- Dependencia de plataforma: requiere Apple Silicon y MLX; no hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama ni TGI.
- Resultados no verificados: las métricas del model-index tienen `verified: false` y provienen del propio autor; los tests estadísticos no han sido replicados de forma independiente.
- Coste de servir en 4 bits: 1,7 puntos de precisión agregados frente a BF16 (p = 0,03) sobre dos semillas; el autor lo describe como ausencia de pérdida práctica, no como ganancia.
- Comparación de entrenamiento no equilibrada: las políticas Dress Rehearsal recibieron warm-up más 30 actualizaciones adicionales que las baselines, lo que impide atribuir las diferencias exclusivamente a la receta.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas aritméticas, el formato exige expresión final entre etiquetas `<answer>`, y el autor documenta que el baseline servido en 4 bits agota el límite de longitud sin resolver problemas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador hereda las condiciones del modelo base Qwen3-0.6B; conviene revisar la licencia del base antes de producción.
- Reproducibilidad: el autor fija la revisión `73e3e38d981303bc594367cd910ea6eb48349da8` del modelo base y versiones concretas de mlx y mlx-lm; otras versiones pueden alterar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/corbanyax/Dress-Rehearsal-Qwen3-0.6B-4bit-KV-LoRA
- Modelo base: https://huggingface.co/mlx-community/Qwen3-0.6B-4bit
- Dataset: https://huggingface.co/datasets/corbanyax/Countdown-3-Hash-Splits
- Paper Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper DeepSeekMath / GRPO (arXiv:2402.03300): https://arxiv.org/abs/2402.03300
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper SmoothQuant (arXiv:2305.17888): https://arxiv.org/abs/2305.17888
- Paper KV-cache quantization (arXiv:2402.02750): https://arxiv.org/abs/2402.02750
- Paper KIVI (arXiv:2401.18079): https://arxiv.org/abs/2401.18079
- Paper QAQ (arXiv:2502.04420): https://arxiv.org/abs/2502.04420
- Paper Countdown (arXiv:2402.03300, referencia del autor): https://arxiv.org/abs/2402.03300
- Paper Adam (arXiv:1308.3432): https://arxiv.org/abs/1308.3432
- Referencia adicional citada (arXiv:2604.07853): https://arxiv.org/abs/2604.07853
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
