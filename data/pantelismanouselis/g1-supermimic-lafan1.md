# pantelismanouselis/g1-supermimic-lafan1

## Resumen

G1 SuperMimic LAFAN1 es una política de seguimiento de movimiento de cuerpo completo para el robot humanoide Unitree G1 de 29 grados de libertad (DoF), entrenada en simulación y publicada por Pantelis Manouselis como artefacto no oficial. No es un modelo de lenguaje ni un transformer: es una política de aprendizaje por refuerzo (reinforcement learning) que, dada una secuencia de observaciones propioceptivas y un latente de referencia de movimiento, produce acciones normalizadas que el modelo de actuadores del simulador convierte en consignas de posición articular a 50 Hz. Se distribuye como checkpoint de inferencia (40.000 iteraciones) seleccionado entre 11 checkpoints evaluados.

El modelo resuelve el problema de imitación de movimiento whole-body en robótica humanoide: reproducir trayectorias de referencia retargetizadas al G1 manteniendo estabilidad y equilibrio. Su relevancia radica en que libera pesos, configuración exacta (orden de articulaciones, layout de entrada, hashes de datos) y resultados de evaluación reproducibles, lo que permite a investigadores comparar y reutilizar una política de tracking sin reentrenar desde cero. El paquete pesa unos 36,5 MB de tensores de política y el repositorio completo ocupa 0,1 GB.

La arquitectura combina un encoder de movimiento que comprime 10 frames futuros de referencia (73 valores cada uno) en un latente continuo de 32 dimensiones, y un decoder MLP compartido que emite 29 acciones normalizadas. El entrenamiento se realizó con un modelo del mundo de dinámica aprendida y rollouts imaginados sobre 40 movimientos LAFAN1 retargetizados al G1 (unas 2,45 horas de referencia), en 4.096 entornos simulados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de RL con encoder de movimiento (10 frames × 73 valores → latente de 32) y decoder MLP compartido (29 acciones); no es un transformer |
| Parámetros totales | 9.116.477 parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 10 × 99 valores y 10 frames futuros de referencia |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (`policy.safetensors`) más `config.json` adyacente |

## Arquitectura y entrenamiento

La política procesa una ventana de 10 observaciones de 99 valores cada una (observación más reciente al final), que incluyen posición y velocidad articular, velocidad angular del root, vector de gravedad, acción previa y orientación relativa del root respecto a la referencia. En paralelo, un encoder de movimiento transforma 10 frames futuros de referencia de 73 valores en un latente continuo de 32 dimensiones. Un decoder MLP compartido genera 29 acciones normalizadas que el modelo de actuadores existente convierte en objetivos de posición articular a 50 Hz; el autor advierte explícitamente de que las salidas crudas no deben enviarse directamente a los motores.

El entrenamiento usó 40 movimientos LAFAN1 retargetizados al G1 (aproximadamente 2,45 horas), remuestreados de 30 a 50 Hz, con un modelo del mundo de dinámica aprendida y rollouts de política imaginados. Se ejecutaron 4.096 entornos simulados en una RTX 4090 Laptop con 16 GB de VRAM. El checkpoint liberado (40.000 iteraciones) representa 15,69 horas registradas de entrenamiento; la ejecución continuó hasta 50.000 iteraciones (unas 19,4 horas). Solo se publica la política: el modelo del mundo, el crítico, el optimizador, el replay buffer, los CSV de movimiento y los assets del robot no están incluidos, por lo que el paquete no permite reanudar el entrenamiento. La evaluación se realizó con fricción 1.0, acciones deterministas y sin ruido de observación ni domain randomization.

## Capacidades

- Seguimiento de movimiento whole-body de referencia para el Unitree G1 de 29 DoF en simulación.
- Locomoción (caminar) con seguimiento de trayectorias retargetizadas.
- Saltos y movimientos dinámicos (clip `jumps1_subject2`).
- Caída y levantamiento (clip `fallAndGetUp2_subject3`).
- Codificación de referencia futura mediante latente de movimiento de 32 dimensiones.
- Inferencia a 50 Hz compatible con el modelo de actuadores del simulador.
- Integración con el runtime Docker de Isaac Lab 3 (kitless) del fork de referencia, con física Newton/MuJoCo-Warp.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Investigación en imitación de movimiento: reproducir los resultados del autor cargando el checkpoint 40.000 con `evaluate.py` del fork y comparando el retorno normalizado medio (0,8696) sobre los 40 clips de entrenamiento.
- Baseline para nuevas políticas de tracking: servir como referencia cuantitativa frente a políticas propias entrenadas sobre el mismo dataset LAFAN1 retargetizado, usando el mismo protocolo de evaluación (fricción 1.0, acciones deterministas, sin ruido).
- Estudio de selección de checkpoints: el autor publica las puntuaciones de 11 checkpoints (14.000: 0,8450 con 0/40 fallos; 40.000: 0,8696 con 0/40; 50.000: 0,8450 con 1/40), útil para analizar la relación entre iteraciones y rendimiento.
- Validación de pipelines de retargeting: emplear la política para verificar si un nuevo conjunto de movimientos retargetizados al G1 es físicamente ejecutable en simulación antes de transferirlo a hardware.
- Docencia y divulgación en robótica: los ejemplos de vídeo (caminar, saltar, levantarse) y la grabación completa de 4 minutos 4 segundos de `jumps1_subject2` permiten ilustrar tracking con referencia fantasma frente a robot sólido.
- Pruebas de integración de infraestructura: el script `tools/download_policy.py` verifica hashes SHA-256 de política y configuración, lo que permite probar pipelines de descarga y verificación de artefactos con revisión fijada (`v1.0.0`).
- Análisis de límites de imitación: los clips de salto y levantamiento muestran offsets de tracking visibles, útiles para estudiar dónde falla la imitación aunque el clip se complete.

## Benchmarks y rendimiento

| Checkpoint | Retorno normalizado medio | Clips fallidos |
|---|---:|---:|
| 14.000 | 0,8450 | 0 / 40 |
| 40.000 (liberado) | 0,8696 | 0 / 40 |
| 50.000 | 0,8450 | 1 / 40 |

- Retorno ponderado por frames del checkpoint liberado: 0,8708.
- Evaluación sobre los 40 clips de entrenamiento (no es un test de movimientos no vistos), un rollout por clip, desde el primer frame hasta finalización o terminación.
- El retorno es recompensa acumulada dividida por la recompensa máxima del clip completo; 0,8696 no equivale a 86,96 % de precisión posicional.
- Se considera fallo un desajuste de altura de pelvis superior a 0,25 m o un desajuste de orientación vertical superior a 0,8 (magnitud adimensional, no radianes).
- No se han publicado resultados frente a otros modelos ni métricas de hardware real en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete de política ocupa unos 36,5 MB de tensores, por lo que la huella de pesos es mínima frente al entorno de simulación.
- GPU de entrenamiento documentada: RTX 4090 Laptop con 16 GB de VRAM, 4.096 entornos simulados.
- Entorno de evaluación probado: Linux con GPU NVIDIA y el runtime Docker Isaac Lab 3 kitless del fork, con física Newton/MuJoCo-Warp (no la aplicación completa Isaac Sim/Kit).
- Despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican); la inferencia se realiza con `supermimic/evaluate.py` del fork en el commit `8bdf60a74c700720817669539e160f4f846b0cf4`.
- Latencia y throughput: no disponibles; la política opera a 50 Hz según el modelo de actuadores.
- No se establece rendimiento en robot físico ni incertidumbre por repetición de semillas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G1 SuperMimic LAFAN1 (este) | 9,1 M | 10 × 99 obs. + 10 × 73 ref. | Retorno 0,8696 en 40 clips de entrenamiento | MIT | Pesos de inferencia en HuggingFace |
| SuperMimic original (Chong Zhang) | no disponible | no disponible | no disponible | no disponible | Repositorio `zita-ch/supermimic_vibed` |
| Otros modelos de tracking para G1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos publicados de otros modelos de tracking whole-body para el Unitree G1 en la información proporcionada.

## Limitaciones y advertencias

- Modelo solo de inferencia: no incluye modelo del mundo, crítico, optimizador, replay buffer, CSV de movimiento ni assets del robot; no permite reanudar entrenamiento.
- No es un modelo de Transformers; no admite prompts, texto ni tareas lingüísticas.
- Los resultados se obtuvieron sobre los 40 clips de entrenamiento, no sobre movimientos no vistos; no hay evidencia de generalización a nuevas referencias.
- No se ha establecido rendimiento en robot físico; toda la evaluación es en simulación.
- No hay incertidumbre por repetición de semillas ni evaluación con domain randomization o ruido de observación.
- La evaluación usa fricción 1.0 y acciones deterministas; condiciones distintas pueden degradar el tracking.
- Los clips de salto y levantamiento muestran offsets de tracking visibles: completar un clip no implica imitación perfecta.
- Las salidas crudas de la política no deben enviarse directamente a los motores; requieren el modelo de actuadores del simulador.
- El retorno normalizado no es una métrica de precisión posicional; no debe interpretarse como porcentaje de acierto.
- Licencia MIT: permite uso comercial, pero el autor la califica como no oficial y no se documentan sesgos (no aplica el concepto habitual de sesgo lingüístico).

## Enlaces

- HuggingFace: https://huggingface.co/pantelismanouselis/g1-supermimic-lafan1
- Código fuente compatible: https://github.com/Manouselis/supermimic_vibed_fork/tree/8bdf60a74c700720817669539e160f4f846b0cf4
- Instalación y evaluación: https://github.com/Manouselis/supermimic_vibed_fork/blob/8bdf60a74c700720817669539e160f4f846b0cf4/docs/RELEASE.md
- Reproducción independiente de SuperMimic (Chong Zhang): https://github.com/zita-ch/supermimic_vibed
- Investigación original: https://supermimic.github.io/
- Dataset: https://huggingface.co/datasets/lvhaidong/LAFAN1_Retargeting_Dataset
- Puntuaciones de checkpoints: https://huggingface.co/pantelismanouselis/g1-supermimic-lafan1/blob/main/checkpoint_scores.csv
- Evaluación del checkpoint liberado: https://huggingface.co/pantelismanouselis/g1-supermimic-lafan1/blob/main/evaluation.json
- Vídeo completo de saltos: https://huggingface.co/pantelismanouselis/g1-supermimic-lafan1/resolve/main/media/jumps1_subject2_full.mp4
- Paper referenciado (arXiv): https://arxiv.org/abs/2610.28480
