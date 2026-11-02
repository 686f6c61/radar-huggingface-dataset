# helenlu94/pi05-libero-goal-matched-lora-from-libero

## Resumen

`pi05-libero-goal-matched-lora-from-libero` es un checkpoint de ajuste fino mediante LoRA sobre el modelo base pi0.5 de Physical Intelligence, orientado a control robótico en el benchmark LIBERO (tarea Goal). Lo publica el usuario `helenlu94` dentro del ecosistema `openpi`, la librería de referencia de Physical Intelligence para políticas visión-lenguaje-acción (VLA). No es un modelo de lenguaje generalista: es una política de robot que recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones motrices.

El checkpoint corresponde al paso 22000 del experimento `matched_vlm_lora_from_libero`, seleccionado como mejor validación con una pérdida de validación de 0,00209 y una tasa de éxito en simulador de 0,897 sobre 15 escenas held-out y 11 tareas (165 episodios). Se entrenó a partir de los pesos base pi0.5 (no del checkpoint ya ajustado en LIBERO), lo que lo convierte en un punto de partida limpio para experimentos de adaptación con LoRA.

Su relevancia es acotada pero clara para investigación en robótica: demuestra el rendimiento alcanzable con LoRA sobre pi0.5 en LIBERO Goal con un conjunto de datos "matched" (escenas emparejadas entre entrenamiento y evaluación) y publica la curva completa de éxito frente a pasos de entrenamiento. El repositorio ocupa 6,3 GB e incluye pesos de inferencia (`params/`) y estadísticas de normalización (`assets/`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) pi0.5 con adaptadores LoRA; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de LIBERO son en inglés por defecto) |
| Licencia | no disponible |
| Formato de pesos | pesos de inferencia en `params/` (formato no especificado) y estadísticas de normalización en `assets/` |

## Arquitectura y entrenamiento

El modelo parte de los pesos base de pi0.5 (`gs://openpi-assets/checkpoints/pi05_base/params`), no del checkpoint de pi0.5 ya ajustado en LIBERO, y aplica un ajuste fino con LoRA (Low-Rank Adaptation). El entrenamiento utiliza el conjunto `helenlu94/libero_goal_matched_150_multi_pick_place_targets_lerobot_v21_lossless`, en formato LeRobot v2.1 con imágenes PNG embebidas sin pérdida y el mismo layout que `physical-intelligence/libero`. Contiene 150 escenas y 11 tareas de LIBERO Goal con escenas emparejadas ("matched") entre entrenamiento y evaluación.

El checkpoint publicado es el paso 22000, elegido por early stopping sobre escenas held-out. La curva de validación muestra una mejora sostenida de la tasa de éxito en simulador desde 0,655 en el paso 2000 hasta 0,897 en el paso 22000, con la pérdida de validación bajando de 0,00735 a 0,00209. El entrenamiento se registró en el proyecto W&B `langgap-libero-goal-matched-pi05-lora` (run `0o9e5j0q`) y se ejecutó sobre el commit `7190119d04a3acd534f3e53caa6b567d353c5fdf` de openpi. No se detallan hiperparámetros de LoRA (rango, alpha, capas objetivo) ni el número de tokens o composición del dataset más allá de la descripción anterior.

## Capacidades

- Control robótico por imitación: genera acciones a partir de observaciones visuales e instrucciones en lenguaje natural.
- Ejecución de tareas de manipulación de LIBERO Goal, incluidas variantes multi pick-and-place con objetivos especificados.
- Condicionamiento por lenguaje: la política acepta la instrucción de la tarea como entrada.
- Adaptación eficiente mediante LoRA sobre pi0.5, lo que permite reajustes posteriores con menor coste.
- Inferencia en simulador mediante `serve_policy.py` de openpi.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de políticas VLA en LIBERO Goal: servir el checkpoint con `serve_policy.py policy:checkpoint --policy.config pi05_matched_lora_from_libero --policy.dir <dir>` para reproducir la tasa de éxito de 0,897 en las 15 escenas held-out y 11 tareas.
- Punto de partida para nuevos ajustes LoRA: al derivar de pi0.5 base y no del checkpoint LIBERO, sirve como inicialización limpia para adaptar la política a otras suites o entornos con bajo coste de entrenamiento.
- Estudio de eficiencia de LoRA en robótica: comparar la curva de éxito frente a pasos publicada (0,655 en el paso 2000, 0,897 en el 22000) con otras configuraciones de adaptación.
- Investigación sobre generalización con escenas emparejadas: el dataset "matched" permite analizar la brecha entre rendimiento en escenas vistas y no vistas.
- Integración en pipelines de simulación headless: el checkpoint se evaluó en modo headless, lo que facilita su uso en pruebas automatizadas de CI para políticas robóticas.
- Reproducibilidad de experimentos: el run de W&B y el commit de openpi documentados permiten reconstruir el entrenamiento y auditar resultados.

## Benchmarks y rendimiento

Los únicos datos publicados son la tasa de éxito en simulador LIBERO Goal sobre escenas held-out (15 escenas x 11 tareas) y la pérdida de validación por paso de entrenamiento.

| Paso | Tasa de éxito | Pérdida de validación |
|---|---|---|
| 2000 | 0,655 | 0,00735 |
| 4000 | 0,824 | 0,00519 |
| 6000 | 0,830 | 0,00386 |
| 8000 | 0,782 | 0,00341 |
| 10000 | 0,806 | 0,00288 |
| 12000 | 0,848 | 0,00253 |
| 14000 | 0,855 | 0,00230 |
| 16000 | 0,867 | 0,00216 |
| 18000 | 0,867 | 0,00191 |
| 20000 | 0,891 | 0,00218 |
| 22000 | 0,897 | 0,00209 |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros checkpoints en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,3 GB, lo que da una cota inferior del espacio en disco necesario para pesos y estadísticas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de políticas de openpi mediante `serve_policy.py` con la configuración `pi05_matched_lora_from_libero`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Adaptación | Contexto | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| pi05-libero-goal-matched-lora-from-libero | pi0.5 base | LoRA, 22000 pasos | no disponible | 0,897 de éxito en LIBERO Goal held-out (165 episodios) | no disponible |
| pi0.5 base (Physical Intelligence) | — | ninguno | no disponible | no disponible en esta ficha | no disponible |
| Checkpoint pi0.5 ajustado en LIBERO | pi0.5 | ajuste completo (referenciado, no publicado aquí) | no disponible | no disponible en esta ficha | no disponible |

No se dispone de datos suficientes para comparar con alternativas de otros autores (por ejemplo, otras políticas VLA para LIBERO) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: entrenado exclusivamente para LIBERO Goal con 11 tareas; no debe esperarse generalización a otros entornos o tareas sin reajuste.
- Riesgo de sobreajuste a escenas emparejadas: el conjunto "matched" facilita la evaluación, por lo que la tasa de 0,897 puede no trasladarse a escenas no emparejadas.
- Licencia no especificada: no hay información sobre términos de uso comercial; debe verificarse antes de cualquier despliegue productivo.
- Idiomas no declarados: las instrucciones de LIBERO son en inglés; el comportamiento multilingüe no está documentado.
- Sin datos de sesgos, alucinación o robustez fuera de simulador; no se han publicado evaluaciones en robot real.
- Dependencia de la versión de openpi: el checkpoint se entrenó sobre un commit concreto; cambios en la librería pueden afectar a la reproducibilidad.
- Documentación mínima: no se detallan hiperparámetros de LoRA, composición exacta del dataset ni requisitos de hardware, lo que dificulta la réplica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/helenlu94/pi05-libero-goal-matched-lora-from-libero
- Dataset de entrenamiento: https://huggingface.co/datasets/helenlu94/libero_goal_matched_150_multi_pick_place_targets_lerobot_v21_lossless
- Dataset de referencia LIBERO: https://huggingface.co/datasets/physical-intelligence/libero
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi (commit `7190119d04a3acd534f3e53caa6b567d353c5fdf`)
- Run de W&B: proyecto `langgap-libero-goal-matched-pi05-lora`, run `0o9e5j0q` (sin URL directa en la información disponible)
- Pesos base pi0.5: `gs://openpi-assets/checkpoints/pi05_base/params`
