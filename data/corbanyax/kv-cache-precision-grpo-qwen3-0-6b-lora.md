# corbanyax/KV-Cache-Precision-GRPO-Qwen3-0.6B-LoRA

## Resumen

KV-Cache-Precision-GRPO-Qwen3-0.6B-LoRA es una coleccion de adaptadores LoRA entrenados sobre el modelo base Qwen3-0.6B en cuantizacion 4-bit para MLX, desarrollada por el usuario corbanyax. No se trata de un modelo de proposito general, sino del artefacto de un estudio preregistrado y reproducible sobre el efecto de la cuantizacion de la KV cache durante el entrenamiento con GRPO (Group Relative Policy Optimization) en tareas de razonamiento aritmetico.

El trabajo comprende 33 ejecuciones de GRPO que difieren unicamente en la precision de la KV cache empleada durante la generacion de rollouts: BF16 como referencia, K8V4 (claves a 8 bits, valores a 4 bits, grupo 64), K8V4 con importance sampling truncado, K8V4 con un buffer de atencion de 8 bits y K8V4 con un aprendiz que simula la cache cuantizada mediante gradiente straight-through. Cada brazo se replica con multiples semillas, y los adaptadores resultantes (rango 16, alpha 32) se publican como directorios cargables por mlx-lm.

Su relevancia es metodologica: cuantifica cuanto degrada la cuantizacion de la KV cache la varianza del gradiente en RL, cuanto ahorra en memoria de rollout y hasta que punto un modelo entrenado con cache BF16 se rompe al servirse con cache cuantizada. Todo el estudio esta disenado para Apple Silicon y verificado con versiones concretas de mlx y mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), adaptadores LoRA sobre modelo base cuantizado 4-bit |
| Parametros totales | 0.6B (modelo base); adaptadores LoRA: 10.092.544 parametros (~40 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base en 4-bit (MLX); KV cache en BF16, K8V4 (8-bit keys, 4-bit values, grupo 64) y 4-bit estandar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | adapters.safetensors (formato de adaptador mlx-lm); modelo base en MLX 4-bit |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B en cuantizacion 4-bit de MLX (mlx-community/Qwen3-0.6B-4bit), un transformer decoder-only de 28 capas. Sobre el se aplican adaptadores LoRA de rango 16, alpha 32 (escala 2.0) y dropout 0, en las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de las 28 capas, con 10.092.544 parametros entrenables.

El entrenamiento emplea GRPO sobre el dataset Countdown-3 (corbanyax/Countdown-3-Hash-Splits), una tarea de razonamiento aritmetico en la que hay que construir una expresion que alcance un objetivo usando cada numero exactamente una vez. El diseno es preregistrado y multiobjetivo: 33 ejecuciones que solo varian en la KV cache usada para los rollouts, con bloques exploratorios (A3, semillas 1-3) y de replicacion preregistrada (A4, semillas 4-8). Los adaptadores publicados corresponden a la actualizacion 30 de cada semilla. Innovaciones tecnicas destacables: K8V4 con grupo 64 (41% del payload BF16 de la KV cache), importance sampling truncado con tope 2, buffer de atencion de 64 slots por fila y capa con residuales de valores a 8 bits para los tokens de mayor masa de atencion decaida, y un aprendiz que lee una cache K8V4 simulada con gradiente straight-through.

## Capacidades

- Generacion de texto y razonamiento aritmetico: resolucion de puzzles tipo Countdown (construir una expresion con un conjunto de numeros que alcance un objetivo).
- Razonamiento multi-paso con formato de respuesta estructurado (etiquetas `<answer>`), segun el template de chat empleado en la evaluacion.
- Generacion con y sin modo thinking (`enable_thinking=False` en el ejemplo de uso).
- Inferencia con KV cache cuantizada en distintas precisiones (BF16, K8V4, 4-bit) mediante los parametros `kv_bits`, `kv_group_size` y `quantized_kv_start` de mlx-lm.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion sobre cuantizacion de KV cache en RL: reproducir los brazos del estudio (BF16, K8V4, K8V4+TIS, buffer de atencion) cargando el adaptador de cada carpeta y semilla para medir precision en dev-200 con cache BF16.
- Analisis de varianza del gradiente en GRPO: usar la politica BF16 congelada (`bf16-frozen-diagnostic-policy/`) para replicar el diagnostico preregistrado de varianza de gradiente de grupo (1.56x con K8V4, IC 95% [1.11, 2.18]).
- Evaluacion de robustez al servir con cache cuantizada: comparar la precision de politicas entrenadas en BF16 servidas por K8V4 (perdida de 10.9 puntos) frente a las entrenadas a traves de K8V4, con y sin TIS, buffer o aprendiz de cache simulada.
- Reproducibilidad de estudios preregistrados: el diseno con bloques A3/A4 y semillas multiples permite reejecutar las pruebas de replicacion y comprobar que las ventajas iniciales de tres semillas no sobreviven a cinco semillas nuevas (Holm p = 0.75 y 0.24).
- Prototipado en Apple Silicon: cargar el adaptador con mlx-lm en un Mac para experimentar con GRPO y LoRA en un modelo de 0.6B sin necesidad de GPU dedicada, dado que el pico de ciclo completo es de 3.9 GB.
- Docencia y divulgacion sobre RL para LLMs: el ejemplo de uso resuelve un puzzle Countdown concreto (numeros 1, 11, 30, objetivo 42) y sirve como caso practico minimo de entrenamiento con recompensa verificable.
- Base para experimentos de decodificacion con cache cuantizada: comparar la misma politica decodificando con `kv_bits=4` frente a BF16 para observar el colapso a 0 descrito con la cache 4-bit estandar.

## Benchmarks y rendimiento

Precision greedy en dev-200 (200 ejemplos) en la actualizacion 30, evaluada con cache BF16, segun los datos declarados por el autor:

| Semilla | Bloque | BF16 | K8V4 | K8V4+TIS | Attention buffer |
|---|---|---|---|---|---|
| 1 | A3 | 0.680 | 0.670 | 0.765 | 0.570 |
| 2 | A3 | 0.625 | 0.700 | 0.660 | 0.665 |
| 3 | A3 | 0.685 | 0.720 | 0.735 | 0.620 |
| 4 | A4 | 0.610 | - | 0.700 | 0.605 |
| 5 | A4 | 0.565 | - | 0.700 | 0.695 |
| 6 | A4 | 0.625 | - | 0.655 | 0.655 |
| 7 | A4 | 0.575 | - | 0.560 | 0.660 |
| 8 | A4 | 0.655 | - | 0.500 | 0.665 |

Coste computacional y memoria por brazo:

| Brazo | KV payload (GB) | Pico rollout / ciclo (GB) | s / actualizacion | Exito de entrenamiento |
|---|---|---|---|---|
| BF16 | 2.25 | 3.54 / 3.9 | 168 | 0.488 |
| K8V4 | 0.92 | 1.82 / 3.9 | 170 | 0.419 |
| K8V4+TIS | 0.92 | 1.82 / 3.9 | 169 | 0.388 |
| Attention buffer | 0.98 | 1.81 / 3.9 | 178 | 0.428 |

Hallazgos declarados: K8V4 reduce a la mitad el pico de memoria de rollout sin perdida detectable en precision evaluada con BF16; K8V4 eleva la varianza del gradiente de grupo 1.56x (IC 95% [1.11, 2.18], p = 0.014), y 1.60x (p = 0.008) con scoring consistente; las politicas entrenadas en BF16 servidas por K8V4 pierden 10.9 puntos (8 semillas, IC 95% t [-16.8, -4.9]); con cache 4-bit estandar colapsan a 0. Las ventajas iniciales de tres semillas no se replicaron con cinco semillas nuevas.

## Requisitos de hardware

- Requiere Apple Silicon (MLX); no es ejecutable en CUDA segun la informacion disponible.
- Memoria: el pico de ciclo completo del entrenamiento es de 3.9 GB (fase de actualizacion); el pico de rollout es de 3.54 GB con BF16 y 1.82 GB con K8V4.
- El modelo base es de 0.6B en 4-bit y el adaptador pesa unos 40 MB, por lo que cabe holgadamente en cualquier Mac con Apple Silicon.
- Despliegue e inferencia mediante mlx-lm (probado con mlx 0.31.2 y mlx-lm 0.31.3); no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Tiempo de entrenamiento medido: 168-178 s por actualizacion segun brazo.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KV-Cache-Precision-GRPO-Qwen3-0.6B-LoRA | 0.6B + LoRA 10.1M | no disponible | Razonamiento aritmetico Countdown, estudio de KV cache | apache-2.0 | Hugging Face (MLX) |
| Dress Rehearsal-Qwen3-0.6B-4bit-KV-LoRA | 0.6B + LoRA | no disponible | Correccion del colapso con cache 4-bit (mismo autor) | no disponible | Hugging Face |
| Qwen3-0.6B (base) | 0.6B | no disponible | Generacion de texto general | apache-2.0 | Hugging Face / mlx-community |

## Limitaciones y advertencias

- Modelo de investigacion: los adaptadores estan entrenados exclusivamente para puzzles Countdown; no son un asistente general y su rendimiento fuera de esa tarea no esta caracterizado.
- Solo ingles (`language: en`); no se documenta soporte multilingue.
- Riesgo de alucinacion y de expresiones aritmeticas invalidas fuera de la distribucion de entrenamiento; la evaluacion se limita a dev-200.
- Degradacion severa al servir con cache cuantizada: las politicas entrenadas en BF16 pierden 10.9 puntos con K8V4 y colapsan a 0 con cache 4-bit estandar.
- Alta sensibilidad a la semilla: BF16 solo abarca 0.565-0.685 de precision entre semillas, y las ventajas de brazos con tres semillas no se replicaron con cinco semillas nuevas.
- Los resultados del model-index estan marcados como no verificados (`verified: false`) y proceden del propio autor.
- Dependencia estricta de versiones (mlx 0.31.2, mlx-lm 0.31.3) y del hardware Apple Silicon; la reproducibilidad en otras versiones no esta garantizada.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que deben revisarse.

## Enlaces

- Hugging Face: https://huggingface.co/corbanyax/KV-Cache-Precision-GRPO-Qwen3-0.6B-LoRA
- Dataset: https://huggingface.co/datasets/corbanyax/Countdown-3-Hash-Splits
- Modelo relacionado (Dress Rehearsal): https://huggingface.co/corbanyax/Dress-Rehearsal-Qwen3-0.6B-4bit-KV-LoRA
- Modelo base: https://huggingface.co/mlx-community/Qwen3-0.6B-4bit
- Paper DeepSeekMath (GRPO): https://arxiv.org/abs/2402.03300
- Paper Qwen3: https://arxiv.org/abs/2505.09388
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Paper KIVI (cuantizacion KV): https://arxiv.org/abs/2402.02750
- Paper KVQuant: https://arxiv.org/abs/2401.18079
- Paper sobre cuantizacion de KV cache: https://arxiv.org/abs/2305.17888
- Paper sobre cuantizacion de KV cache: https://arxiv.org/abs/2502.04420
- Paper sobre cuantizacion de KV cache: https://arxiv.org/abs/2604.07853
- Paper de referencia sobre estimacion de gradientes: https://arxiv.org/abs/1308.3432
