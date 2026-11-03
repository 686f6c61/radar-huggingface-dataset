# 5hadytru/so101_bench_MolmoAct2-SO101_WM_base_full_fine_tune

## Resumen

`so101_bench_MolmoAct2-SO101_WM_base_full_fine_tune` es un checkpoint de investigación publicado por el usuario 5hadytru como parte del proyecto SO-101 Bench, un banco de evaluación de manipulación espacial accesible. Se trata de un ajuste fino completo (todos los parámetros entrenables) del modelo visión-lenguaje-acción (VLA) `allenai/MolmoAct2` de AI2, orientado a control robótico sobre el brazo SO-101 en simulación.

El modelo parte del checkpoint general multi-embodiment de MolmoAct2 y se entrena sobre el conjunto simulado `so101_bench_sim_WM` (3.629 episodios, 1.996.120 fotogramas a 30 fps generados en Isaac Lab con aleatorización de dominio). El objetivo es servir como referencia base frente a la variante que arranca desde `MolmoAct2-SO100_101`, manteniendo receta, datos y presupuesto idénticos.

Es relevante ahora porque documenta de forma transparente un resultado negativo: con 5.447 millones de parámetros entrenables y un presupuesto fijo de unas 34 horas en 4× A100-SXM4-80GB, el modelo solo alcanza 8/39 episodios de éxito en el conjunto de validación, frente a los 22/39 de GR00T N1.7 con el mismo presupuesto. El autor lo atribuye a un subentrenamiento (1,28 millones de muestras, aproximadamente 0,64 épocas).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en MolmoAct2 (transformador multimodal con experto de acción y flujo de difusión por chunk); detalles internos no disponibles |
| Parametros totales | 5.447.439.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint Hugging Face autocontenido con `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `allenai/MolmoAct2` (commit `e432d85`), un VLA que combina un codificador visual (ViT), un LLM y un experto de acción que genera chunks de 30 pasos mediante flow matching con un paso de tiempo de flujo por chunk. El ajuste fino es completo: se entrenan todos los módulos (ViT, conector, LLM y experto de acción) con tasas de aprendizaje diferenciadas (7e-5 para el experto de acción, 1,4e-5 para el LLM, 7e-6 para ViT y conector), calentamiento lineal de 200 pasos y decaimiento coseno hasta el 10 % del pico.

Los datos provienen de `5hadytru/so101_bench_sim_WM` en formato LeRobot v3.0: 3.629 episodios y 1.996.120 fotogramas a 30 fps simulados en Isaac Lab con aleatorización de dominio. Se usan cuatro cámaras a 640×480 en el orden `overhead`, `wrist`, `overhead_init`, `wrist_init`, donde las dos últimas son fotogramas fijados al estabilizarse el episodio y actúan como memoria de trabajo. La normalización es q01/q99 con la etiqueta `so101_bench_sim_wm` y las estadísticas en `norm_stats.json`. El entrenamiento se ejecutó con batch global de 128 (16 por GPU × 4 GPU × 2 de acumulación), checkpointing de activaciones, sin packing y con pérdida de acción continua únicamente, durante 10.000 pasos; este checkpoint corresponde al paso 8.000 (1,02 millones de muestras).

## Capacidades

- Generación de acciones robóticas de manipulación para el brazo SO-101 a partir de observaciones visuales multicámara e instrucciones.
- Procesamiento de imagen y texto conjuntamente (pipeline `image-text-to-text` con etiqueta `robotics`).
- Uso de memoria de trabajo visual mediante los streams `overhead_init` y `wrist_init`, fijados durante todo el episodio.
- Predicción de chunks de acción de 30 pasos con horizonte de ejecución configurable.
- Integración con LeRobot y con el servidor de inferencia `scripts/molmoact2_server.py` del repositorio `allenai/molmoact2`.
- Soporte de tool calling, agentes multi-paso, matemáticas o capacidades multilingües: no disponible (no se documentan; el modelo está especializado en control robótico).

## Casos de uso

- Evaluación comparativa de checkpoints base en SO-101 Bench: sirve como referencia del rendimiento de MolmoAct2 partiendo del checkpoint general frente a la variante SO100_101, con receta y datos idénticos.
- Investigación sobre subentrenamiento en VLA: permite estudiar el efecto del número de pasos y épocas en un presupuesto fijo de 4× A100 durante 34 horas, con curva de validación por paso publicada.
- Reproducción de experimentos de manipulación simulada: el checkpoint y el dataset asociado permiten replicar el pipeline en Isaac Lab con aleatorización de dominio.
- Desarrollo de políticas con memoria visual de episodio: los streams `_init` son útiles para tareas donde el estado inicial del entorno condiciona la política.
- Punto de partida para ajustes finos posteriores: al ser un fine-tune completo sobre el modelo general, puede servir como inicialización para dominios con más datos o más pasos.
- Docencia y divulgación sobre VLA: ejemplo documentado de receta de entrenamiento, hiperparámetros y evaluación en un benchmark abierto con leaderboard público.

## Benchmarks y rendimiento

Conjunto de validación `real_gr00t_val_v2` (39 episodios, horizonte de ejecución 30, 13 por split de objeto: vistos, clases vistas con objetos no vistos y clases no vistas):

| Paso | 1000 | 2000 | 3000 | 4000 | 5000 | 6000 | 7000 | 8000 | 9000 | 10000 |
|---|---|---|---|---|---|---|---|---|---|---|
| Éxitos / 39 | 3 | 3 | 8 | 6 | 6 | 8 | 6 | 8 | 5 | 6 |

Comparación con el mismo presupuesto y dataset:

| Modelo | Éxitos / 39 |
|---|---|
| Este checkpoint (paso 8000) | 8 |
| GR00T N1.7 (3B) | hasta 22 |
| Variante desde MolmoAct2-SO100_101 | 5 oficial, 7 pico |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 11 GB solo para pesos (5,45 mil millones de parámetros), más memoria para activaciones y cámaras; el entrenamiento usó A100 de 80 GB con checkpointing de activaciones.
- GPU recomendadas para entrenamiento: 4× A100-SXM4-80GB (configuración documentada, unas 34 horas para 10.000 pasos).
- GPU de consumo: no se documenta; por tamaño de pesos en bf16 podría caber en GPUs de 24 GB (RTX 4090) si el resto del grafo lo permite, pero no hay datos publicados.
- Opciones de despliegue: servidor propio `scripts/molmoact2_server.py` con `--device cuda:0 --dtype bfloat16 --num_steps 10 --port 8000`; evaluación con `scripts/molmoact2_eval.py --action_horizon 30 --policy_cameras overhead,wrist --use_overhead_init true --use_wrist_init true`. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en SO-101 Bench sim | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 5,45 B | no disponible | 8/39 | no disponible | Hugging Face (`5hadytru`) |
| MolmoAct2-SO100_101 full fine-tune | no disponible | no disponible | 5/39 oficial, 7/39 pico | no disponible | Hugging Face (`5hadytru`) |
| GR00T N1.7-3B | 3 B (según nombre del repo) | no disponible | hasta 22/39 | no disponible | Hugging Face (`5hadytru`) |
| MolmoAct2 (base, AI2) | no disponible | no disponible | no disponible | no disponible | Hugging Face (`allenai`) |

## Limitaciones y advertencias

- Rendimiento bajo en el benchmark propio: 8/39 episodios de éxito, muy por debajo de GR00T N1.7 (22/39) con el mismo presupuesto y datos.
- Causa probable documentada por el autor: subentrenamiento; 10.000 pasos con batch 128 equivalen a 1,28 millones de muestras, unas 0,64 épocas de fotogramas para 5,4 mil millones de parámetros entrenables.
- El checkpoint publicado es el paso 8.000, no el final (paso 10.000, con 6/39), porque el paso 8.000 empató con la mejor puntuación de validación (8/39, junto con los pasos 3.000 y 6.000).
- Validación exclusivamente en simulación (Isaac Lab) con layouts fijos; no hay evidencia de transferencia a robot real.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles; el modelo está orientado a control robótico, no a tareas generales de lenguaje.
- Riesgo de alucinación en instrucciones fuera de distribución: no evaluado en la información disponible.
- Requiere `trust_remote_code` y código parcheado (`allenai/molmoact2` @ `66b87e64` más un parche para registrar la mezcla `so101_bench_sim_wm`), lo que añade fricción de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/5hadytru/so101_bench_MolmoAct2-SO101_WM_base_full_fine_tune
- Dataset de entrenamiento: https://huggingface.co/datasets/5hadytru/so101_bench_sim_WM
- Modelo base: https://huggingface.co/allenai/MolmoAct2
- Variante desde SO100_101: https://huggingface.co/5hadytru/so101_bench_MolmoAct2-SO101_WM_full_fine_tune
- GR00T N1.7-3B comparado: https://huggingface.co/5hadytru/so101_bench_GR00T_N1.7-3B
- Paper: https://huggingface.co/papers/2610.36420
- Página del proyecto: https://so101-bench.github.io/
- Leaderboard: https://so101-bench.github.io/leaderboard/
- Código: https://github.com/5hadytru/so101_bench
- Repositorio de entrenamiento: https://github.com/allenai/molmoact2
