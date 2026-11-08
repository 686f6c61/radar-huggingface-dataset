# ChadSaglam/act_aloha_sim_transfer_cube

## Resumen

`ChadSaglam/act_aloha_sim_transfer_cube` es una política de control robótico basada en ACT (Action Chunking with Transformers), publicada por el usuario ChadSaglam, que resuelve la tarea de simulación `AlohaTransferCube-v0` del entorno gym-aloha. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que, a partir de observaciones visuales y propioceptivas del robot bimanual ALOHA, genera secuencias de acciones de 100 pasos para levantar un cubo con el brazo derecho y transferirlo a la pinza izquierda. Se entrenó con LeRobot 0.7.0 sobre 50 demostraciones humanas del dataset `lerobot/aloha_sim_transfer_cube_human`, íntegramente en un Apple M4 MacBook Pro mediante MPS, sin GPU NVIDIA.

El interés de esta ficha es doble. Por un lado, sirve como referencia reproducible de un pipeline completo de entrenamiento de políticas robóticas en hardware de consumo (unas 10 horas para 80k pasos a 2,2 pasos/s). Por otro, documenta con rigor estadístico la variabilidad del entrenamiento: el autor reporta intervalos de confianza de Wilson al 95% sobre 200 episodios y muestra que la pérdida de entrenamiento no predice el éxito de la tarea, y que evaluaciones de 50 episodios no permiten ordenar checkpoints cercanos.

El modelo tiene 51.685.006 parámetros (unos 51,7 M), un tamaño de repositorio de 0,2 GB y licencia MIT. Alcanza un 75,5% de éxito (151/200 episodios, IC 95% 69,1-80,9), estadísticamente indistinguible del checkpoint oficial de LeRobot (81,0%) con el mismo presupuesto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); backbone ResNet-18 con inicialización ImageNet y transformer de decodificación de acciones |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk size de 100 pasos de acción y horizonte de 100 pasos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors, con pipeline de procesadores de LeRobot 0.7.0 (`policy_preprocessor.json`, `policy_postprocessor.json`) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación que combina un backbone convolucional ResNet-18 (preentrenado en ImageNet) para procesar las imágenes de las cámaras del robot con un transformer encoder-decoder que predice chunks de acciones futuras en lugar de acciones individuales. En esta configuración concreta se usan chunk size de 100, 100 pasos de acción, VAE activado con peso KL de 10, optimizador AdamW y learning rate de 1e-5. El entrenamiento se realizó con los hiperparámetros por defecto de LeRobot, sin ajuste alguno, en dos fases: 50k pasos (6 h 22 min) y una extensión hasta 80k pasos (3 h 47 min adicionales), con batch size 8 y semilla 1000. El throughput medido en el M4 fue de 2,2 pasos/s.

Los datos de entrenamiento son 50 demostraciones humanas del dataset `lerobot/aloha_sim_transfer_cube_human`, capturadas en simulación. No se documenta número de tokens (no aplica), composición del dataset más allá de las 50 demostraciones, ni fases de RLHF o DPO (tampoco aplican a un modelo de imitación). La innovación técnica destacable no está en la arquitectura, sino en la metodología de evaluación: el autor publica evaluaciones por checkpoint con 200 episodios, semillas fijas (`--seed=1000`) e intervalos de Wilson, y documenta que dos semillas con curvas de pérdida idénticas difirieron 34 puntos en éxito a 10k pasos.

## Capacidades

- Generación de acciones robóticas bimanuales para la tarea `AlohaTransferCube-v0`: levantar un cubo con el brazo derecho y transferirlo a la pinza izquierda.
- Imitación de comportamiento a partir de demostraciones humanas (imitation learning), sin recompensa explícita ni RL.
- Predicción de chunks de 100 acciones consecutivas, lo que reduce el error de composición frente a políticas paso a paso.
- Procesamiento de observaciones visuales multivista mediante ResNet-18 y de estado propioceptivo del robot.
- Integración con el ecosistema LeRobot: evaluación con `lerobot-eval` y entrenamiento con `lerobot-train`.
- Soporte de ejecución en CUDA, MPS (Apple Silicon) y CPU mediante el flag `--policy.device`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión general ni capacidades multilingües: es una política específica de una única tarea de manipulación.

## Casos de uso

- Reproducción de experimentos de imitation learning: sirve como punto de partida verificado para replicar el pipeline ACT de LeRobot en un portátil Apple Silicon, con tiempos y curvas de entrenamiento documentados.
- Baseline para comparación de políticas: al estar evaluado con 200 episodios, semilla fija e intervalos de Wilson, puede usarse como referencia estadística frente a nuevas políticas en `AlohaTransferCube-v0`.
- Docencia y formación en robótica: permite mostrar de extremo a extremo el ciclo dataset-demo, entrenamiento, evaluación y análisis de incertidumbre sin requerir clústeres GPU.
- Validación de infraestructura de evaluación: el modelo y sus scripts permiten comprobar que un entorno gym-aloha y LeRobot 0.7.0 están correctamente configurados antes de lanzar experimentos costosos.
- Estudio de la relación pérdida-éxito: los checkpoints intermedios (50k y 80k) y las dos semillas documentadas permiten investigar por qué la loss no predice el rendimiento final en políticas de imitación.
- Prototipado de transferencia sim-to-real: aunque el modelo es solo de simulación, su arquitectura y formato de checkpoint son compatibles con el flujo de LeRobot para experimentar con ajuste fino sobre datos reales de ALOHA.
- Benchmarking de hardware de consumo: los 2,2 pasos/s en M4 y las 10 horas totales de entrenamiento permiten estimar costes de experimentación en equipos sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), sobre `AlohaTransferCube-v0` con `--seed=1000` y 200 episodios:

| Política | Pasos de entrenamiento | Éxito | IC 95% (Wilson) |
|---|---|---|---|
| `lerobot/act_aloha_sim_transfer_cube_human` (oficial) | 80k | 81,0% (162/200) | 75,0-85,8 |
| Este modelo (semilla 1000) | 80k | 75,5% (151/200) | 69,1-80,9 |
| Este modelo, mismo run a 50k | 50k | 64,0% (128/200) | 57,1-70,3 |
| Segunda semilla (1001) a 50k | 50k | 62,0% (124/200) | 55,1-68,4 |

Los intervalos de confianza del modelo y del checkpoint oficial se solapan, por lo que el autor concluye que son estadísticamente indistinguibles con este tamaño de muestra. Los checkpoints de 50k quedan claramente por debajo del baseline. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que el modelo no es de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors y un repo de 0,2 GB, la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa por debajo de 1-2 GB, no confirmada por el autor).
- GPU recomendadas: el autor no especifica requisitos de GPU; la evaluación se documenta con `--policy.device=cuda` como opción y el entrenamiento se realizó en MPS (Apple M4). Cualquier GPU NVIDIA con soporte CUDA es suficiente por el tamaño del modelo.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros; también se ejecuta en Apple Silicon vía MPS (con `--eval.use_async_envs=false` en macOS) y en CPU.
- Opciones de despliegue: LeRobot 0.7.0 (`lerobot-eval`, `lerobot-train`), pipeline de procesadores `policy_preprocessor.json` y `policy_postprocessor.json`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 2,2 pasos/s durante el entrenamiento en M4; 50k pasos en 6 h 22 min y la extensión de 30k pasos en 3 h 47 min. No se publica latencia de inferencia por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Éxito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`ChadSaglam/act_aloha_sim_transfer_cube`) | 51,7 M | AlohaTransferCube-v0 | 75,5% (IC 69,1-80,9) | MIT | Hugging Face |
| `lerobot/act_aloha_sim_transfer_cube_human` (oficial) | no disponible en la información | AlohaTransferCube-v0 | 81,0% (IC 75,0-85,8) | no disponible en la información | Hugging Face |
| Otras políticas ACT de LeRobot para tareas ALOHA | no disponible | otras tareas de manipulación | no disponible | no disponible | Hugging Face |

No se dispone de datos de otros modelos comparables (por ejemplo, políticas basadas en diffusion o VQ-BeT) en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: no se ha validado en un robot físico ni se documenta transferencia sim-to-real.
- Una única tarea: la política está especializada en `AlohaTransferCube-v0` y no generaliza a otras tareas de manipulación.
- Un único conjunto de semillas de evaluación: el autor advierte que otro `--seed` desplazaría todos los números varios puntos.
- La métrica de éxito es la definición de `gym-aloha` (cubo levantado por el brazo derecho y transferido a la pinza izquierda), no una métrica física más estricta.
- Sin ajuste de hiperparámetros: se usan los valores por defecto de LeRobot, por lo que el rendimiento podría mejorar con tuning.
- Riesgo de sobreinterpretación estadística: con 200 episodios y solapamiento de intervalos, no puede afirmarse que este modelo sea mejor o peor que el oficial; además, el autor documenta que 50 episodios no bastan para ordenar checkpoints vecinos.
- La pérdida de entrenamiento no predice el éxito de la tarea (dos semillas con curvas idénticas difirieron 34 puntos a 10k pasos), lo que desaconseja seleccionar checkpoints solo por loss.
- Sin datos de sesgos, alucinación o limitaciones de idioma: no aplican a un modelo de robótica sin salida textual, y no se documentan sesgos de comportamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; los resultados de benchmarks están declarados como no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChadSaglam/act_aloha_sim_transfer_cube
- Código, scripts de evaluación y curvas de entrenamiento: https://github.com/ChadSaglam/lerobot-sim-transfer-cube
- Paper de ACT: https://arxiv.org/abs/2304.13705
- Checkpoint oficial de LeRobot: https://huggingface.co/lerobot/act_aloha_sim_transfer_cube_human
- README del checkpoint oficial: https://huggingface.co/lerobot/act_aloha_sim_transfer_cube_human/blob/main/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
