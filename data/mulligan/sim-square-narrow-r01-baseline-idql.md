# mulligan/sim-square-narrow-r01-baseline-idql

## Resumen
sim-square-narrow-r01-baseline-idql es un agente de aprendizaje por refuerzo offline publicado por el usuario mulligan dentro del proyecto Mulligan, orientado a la tarea de simulación sim-square-narrow (ensamblaje e inserción de precisión). No es un modelo de lenguaje: es una política de control basada en estados, implementada como agente IDQL (Implicit Diffusion Q-Learning) con un actor de difusión y un crítico IQL escalar. El repositorio incluye cinco checkpoints, uno por semilla (semillas 1 a 5), en formato PyTorch, junto con ficheros de normalización en JSON.

El modelo pertenece a la ronda R1, brazo "baseline", bajo la celda de campaña `sq_d0_r1_baseline_uniform_nocf_human_only`, y corresponde al paso de entrenamiento 150001. Se entrenó con tres conjuntos de datos del proyecto: teleoperación baseline, rollouts de la política baseline y datos DAgger baseline. Su relevancia es metodológica: actúa como referencia reproducible para comparar algoritmos de RL offline e imitación en una tarea de manipulación concreta, con evaluación sobre una rejilla de estados iniciales retenida.

El repositorio ocupa 1,4 GB y, en el momento de la consulta, no registra descargas ni "likes". Los artefactos son copias byte a byte de artefactos de Weights & Biases, verificadas con MD5 contra el manifiesto y con SHA-256 registrado en `release.json`, lo que aporta trazabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente IDQL: actor de difusión con crítico IQL escalar, para control basado en estados |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: agente de RL basado en estados, no en lenguaje) |
| Tipos de cuantización | No disponible; se distribuye como checkpoint PyTorch sin cuantización publicada |
| Idiomas soportados | No disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`policy.pt`) y normalizadores (`stats.json`) |
| Tarea | sim-square-narrow |
| Ronda de modelo | R1 |
| Brazo / celda de campaña | baseline / `sq_d0_r1_baseline_uniform_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamaño del repositorio | 1,4 GB |
| Descargas / "likes" | 0 / 0 |
| Fecha de creación (según metadatos) | 2026-09-29 |

## Arquitectura y entrenamiento
IDQL combina un actor de difusión, que modela la distribución de acciones, con un crítico IQL escalar que puntúa las acciones candidatas para seleccionar la de mayor valor estimado. La model card describe explícitamente el artefacto como "state-based IDQL agent: diffusion actor with scalar IQL critic", distribuido como `policy.pt` más `stats.json` con los normalizadores. No se detallan en la información disponible el número de parámetros, la dimensionalidad del espacio de observación o de acción, la profundidad de la red ni los hiperparámetros de entrenamiento.

El entrenamiento se realizó a partir de tres conjuntos de datos del proyecto Mulligan: `sim-square-narrow-c00-teleop-baseline`, `sim-square-narrow-c01-baseline-policy-rollouts` y `sim-square-narrow-c01-dagger-baseline`. La combinación de teleoperación, rollouts de la política baseline y datos DAgger es coherente con un esquema de recolección iterativa de datos guiada, característico del proyecto. No hay información disponible sobre si se aplicó RLHF, DPO u otras fases de ajuste, algo que en cualquier caso no aplica a este tipo de agente.

Cada semilla procede de un artefacto de Weights & Biases distinto:

| Semilla | Artefacto de origen (W&B) | Run | Commit de Git |
|---|---|---|---|
| seed-1 | `iql_ddpg_bc_idql_nutassemblysquare_20260525_223359_248091_task1-final-step-150001:v0` | `j3u3ub0v` | `1d6f645075c7` |
| seed-2 | `iql_ddpg_bc_idql_nutassemblysquare_20260525_223359_239645_task2-final-step-150001:v0` | `gw76d7wj` | `1d6f645075c7` |
| seed-3 | `iql_ddpg_bc_idql_nutassemblysquare_20260525_223359_136558_task3-final-step-150001:v0` | `7glxgltt` | `1d6f645075c7` |
| seed-4 | `iql_ddpg_bc_idql_nutassemblysquare_20260526_025705_289457_task4-final-step-150001:v0` | `xf8xydll` | `53320191c975` |
| seed-5 | `iql_ddpg_bc_idql_nutassemblysquare_20260526_000355_442881_task5-final-step-150001:v0` | `zdyg9b15` | `55e127140163` |

## Capacidades
- Control robótico basado en estados para una tarea de ensamblaje de precisión en simulación (square nut assembly).
- Generación de acciones continuas mediante un actor de difusión, apto para distribuciones de acción multimodales.
- Selección de acciones guiada por un crítico IQL escalar, que evalúa candidatos y elige el de mayor valor.
- Aprendizaje a partir de datos offline heterogéneos: demostraciones de teleoperación, rollouts de política y correcciones DAgger.
- Evaluación sistemática sobre una rejilla de estados iniciales retenida, con resultados por rollout disponibles en el dataset enlazado.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades de visión, audio ni multilingües.
- No dispone de modo "thinking" ni de salida textual.

## Casos de uso
- Línea base reproducible para investigación en RL offline: el agente permite comparar IDQL frente a otros algoritmos sobre exactamente los mismos conjuntos de datos y la misma rejilla de evaluación retenida.
- Recolección de datos con DAgger: la política puede desplegarse en el simulador para generar trayectorias que después se corrigen con intervenciones humanas, alimentando la siguiente ronda de entrenamiento.
- Evaluación de robustez ante condiciones iniciales: la rejilla de estados iniciales retenida y los 8000 rollouts por semilla permiten medir la sensibilidad a la posición inicial y estimar intervalos de confianza.
- Estudio de variabilidad entre semillas: al incluir cinco semillas, sirve para cuantificar la varianza de rendimiento del algoritmo bajo una misma configuración.
- Inicialización de políticas para transferencia sim-a-real: los pesos pueden servir como punto de partida para ajuste fino en un robot físico, aunque no hay evidencia publicada de dicha transferencia en la información disponible.
- Referencia en competiciones internas o tableros de evaluación, como el Policy Arena de Mulligan, donde el brazo baseline se compara con otras rondas o brazos.
- Auditoría y reproducibilidad de experimentos: la correspondencia entre cada checkpoint, su artefacto de W&B, su run y su commit de Git facilita reproducir el entrenamiento con el código de investigación del proyecto.

## Benchmarks y rendimiento
Los únicos resultados publicados en la información disponible son las evaluaciones de éxito de la tarea sim-square-narrow sobre la rejilla de estados iniciales retenida, con 8000 rollouts por semilla. La columna N figura como 1 en la model card, lo que apunta a un único conjunto de evaluación agregado por semilla; el detalle por rollout está en el dataset `sim-square-narrow-r00-r03-eval`.

| Semilla | Evaluaciones (N) | Éxitos | Tasa de éxito |
|---|---|---|---|
| seed-1 | 1 | 6479/8000 | 80,99 % |
| seed-2 | 1 | 6922/8000 | 86,53 % |
| seed-3 | 1 | 6672/8000 | 83,40 % |
| seed-4 | 1 | 6872/8000 | 85,90 % |
| seed-5 | 1 | 6997/8000 | 87,46 % |
| Media (agregada) | — | 33942/40000 | 84,86 % |

No se han publicado resultados de benchmarks de MMLU, HumanEval, GSM8K ni equivalentes en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de tamaño, el repositorio completo ocupa 1,4 GB y contiene cinco semillas, del orden de 280 MB por semilla contando normalizadores; es una estimación basada en el tamaño de fichero, no un dato publicado.
- GPU recomendadas: no disponible. Al ser un checkpoint PyTorch, cualquier GPU con soporte CUDA y drivers compatibles puede ejecutarlo.
- Compatibilidad con GPU de consumo: probablemente sí, dado el reducido tamaño del checkpoint, aunque no se confirma en la documentación. Es una estimación, no un requisito verificado.
- Opciones de despliegue: el modelo se carga con PyTorch mediante el código de investigación de Mulligan. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Dependen del simulador, de la frecuencia de control y del hardware empleado, y no se publican cifras.

## Comparativa con modelos similares
No se han localizado en la información proporcionada otras fichas de modelos comparables de terceros para la misma tarea. La comparación más directa posible es entre las propias semillas de esta release, que comparten arquitectura, datos y presupuesto de entrenamiento:

| Modelo / variante | Arquitectura | Tarea | Tasa de éxito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-narrow-r01-baseline-idql, seed-5 | IDQL | sim-square-narrow | 87,46 % | MIT | HuggingFace |
| sim-square-narrow-r01-baseline-idql, seed-2 | IDQL | sim-square-narrow | 86,53 % | MIT | HuggingFace |
| sim-square-narrow-r01-baseline-idql, seed-4 | IDQL | sim-square-narrow | 85,90 % | MIT | HuggingFace |
| sim-square-narrow-r01-baseline-idql, seed-3 | IDQL | sim-square-narrow | 83,40 % | MIT | HuggingFace |
| sim-square-narrow-r01-baseline-idql, seed-1 | IDQL | sim-square-narrow | 80,99 % | MIT | HuggingFace |
| Otros algoritmos o brazos del proyecto Mulligan | No disponible | sim-square-narrow | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Ámbito restringido: el agente está entrenado para la tarea sim-square-narrow en simulación; no hay evidencia publicada de transferencia a un robot físico ni a otras tareas.
- Sesgo de distribución: al entrenarse con teleoperación humana, rollouts de la política baseline y datos DAgger, el comportamiento fuera de la distribución de estados visitados puede degradarse notablemente.
- Variabilidad entre semillas: la tasa de éxito oscila entre el 80,99 % y el 87,46 %, una horquilla de más de seis puntos que conviene tener en cuenta al comparar experimentos.
- Falta de documentación técnica: no se publican número de parámetros, dimensionalidad de observación y acción, hiperparámetros ni detalles completos del entrenamiento.
- Riesgo de seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch, por lo que deben cargarse únicamente en entornos de confianza, tal como advierte la propia model card.
- Licencia: MIT permite uso comercial y modificación, pero se distribuye sin garantías; la licencia del código de investigación de Mulligan asociado no se detalla en la información disponible.
- Idiomas y capacidades generativas: no aplica ninguna capacidad lingüística, conversacional, de visión o de tool calling.
- Validación externa limitada: 0 descargas y 0 "likes" en el momento de la consulta, sin evaluaciones independientes conocidas.
- Dependencia de artefactos externos: la trazabilidad depende de los artefactos de Weights & Biases y de los commits de Git indicados, lo que puede dificultar la reproducción si esos recursos dejan de estar disponibles.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-baseline-idql
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page/
- Policy Arena (evaluaciones): https://arena.mulligan.page/
- Dataset de teleoperación baseline: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de la política baseline: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset DAgger baseline: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de rollouts de política Mulligan: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Búsqueda de datasets de la familia sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
