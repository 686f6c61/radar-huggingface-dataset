# huzican0419/robotwin_piper_x_real_step10000_jax

## Resumen

`huzican0419/robotwin_piper_x_real_step10000_jax` es un checkpoint de parámetros en formato JAX/Orbax del modelo de robótica pi0.5 (pi05), especializado en control visuomotor para el robot Piper en entornos simulados y reales del conjunto RoboTwin. Lo publica el usuario huzican0419 en Hugging Face y corresponde al paso de entrenamiento 10.000 de un ajuste fino (SFT) continuado desde el checkpoint de 40.000 pasos del experimento `robotwin_piper_x_sim_real`.

El modelo se enmarca en el ecosistema OpenPI (Physical Intelligence), que agrupa modelos de política visuomotora (vision-language-action, VLA) capaces de mapear observaciones visuales e instrucciones en acciones de robot. Este artefacto concreto no es un modelo de lenguaje generalista: es un conjunto de pesos de política entrenado para ejecutar tareas de manipulación con el brazo Piper, y su interés radica en servir como referencia reproducible para investigación en imitación y control robótico con JAX.

El repositorio ocupa 12,4 GB y contiene únicamente los parámetros (sin estado del optimizador ni `train_state`), lo que lo hace adecuado para inferencia y evaluación, no para reanudar el entrenamiento. No se dispone de información sobre licencia, idiomas ni métricas de rendimiento publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visuomotora pi0.5 (VLA) sobre JAX; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en precisión de entrenamiento JAX/Orbax) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX), solo parámetros (`params/`), sin estado del optimizador |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia pi0.5 de OpenPI, un modelo de política visuomotora que combina percepción visual y lenguaje para producir acciones de robot. El artefacto publicado es la exportación JAX/Orbax de los parámetros de `pi05_piper_sim_real_from40k` en el paso 10.000, y constituye la contraparte JAX del checkpoint equivalente en PyTorch (`robotwin_piper_x_sim_real_from40k_step10000`). No se detalla en la información disponible la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención ni cabezas de acción).

El entrenamiento parte de los parámetros de `checkpoints/pi05_piper_new/robotwin_piper_x_new_sft/40000/params` y utiliza el dataset `robotwin_piper_x_sim_real`, que mezcla datos de simulación y de robot real. Se aplica un ajuste fino supervisado con programación coseno del learning rate: 500 pasos de calentamiento, pico de `1e-5` y decaimiento durante 10.000 pasos hasta `1e-6`. El repositorio incluye las estadísticas de normalización (`norm_stats.json`) de las 20 tareas de RoboTwin en formato LeRobot v2.1, necesarias para la inferencia. No se especifica el volumen de tokens, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control visuomotor de robot: genera acciones para el brazo Piper a partir de observaciones visuales e instrucciones de tarea.
- Ejecución de tareas de manipulación del conjunto RoboTwin (20 tareas referenciadas en las estadísticas de normalización).
- Transferencia sim-to-real: entrenado con datos mixtos de simulación y robot real.
- Inferencia en JAX mediante `CheckpointWeightLoader` sobre la ruta `params/`.
- Compatibilidad con el ecosistema OpenPI y con el formato LeRobot v2.1 para datos y normalización.
- Soporte de tool calling, agentes, razonamiento multietapa o capacidades multilingües: no disponible (no es un modelo de lenguaje de propósito general).

## Casos de uso

- Investigación en imitación robótica: punto de partida reproducible para evaluar políticas pi0.5 en las 20 tareas de RoboTwin, con estadísticas de normalización incluidas.
- Evaluación sim-to-real: permite medir la brecha entre ejecución en simulador y robot Piper real usando el mismo checkpoint.
- Comparación de backends: al existir una versión PyTorch equivalente, sirve para contrastar resultados de inferencia entre JAX y PyTorch sobre la misma política.
- Ajuste fino posterior: los parámetros pueden cargarse como inicialización para nuevos SFT sobre datasets propios de manipulación.
- Reproducción de experimentos: el paso 10.000 y la programación de learning rate documentada permiten replicar la curva de entrenamiento.
- Integración en pipelines OpenPI: uso con `CheckpointWeightLoader` dentro de flujos de despliegue de políticas visuomotoras en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 12,4 GB, correspondiente a los parámetros en precisión de entrenamiento; la VRAM necesaria para inferencia no está documentada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `CheckpointWeightLoader` de OpenPI con backend JAX/Orbax; no se documentan otros runners (vLLM, llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Paso de entrenamiento | Dataset | Licencia |
|---|---|---|---|---|
| `huzican0419/robotwin_piper_x_real_step10000_jax` | JAX/Orbax (solo params) | 10.000 | robotwin_piper_x_sim_real | no disponible |
| `huzican0419/robotwin_piper_x_sim_real_from40k_step10000` | PyTorch BF16 | 10.000 | robotwin_piper_x_sim_real | no disponible |
| `huzican0419/robotwin_piper_x_sim_real_from80k_step10000_jax` | JAX/Orbax | 10.000 | robotwin_piper_x_sim_real_from80k | no disponible |
| `huzican0419/robotwin_piper_x_sim_real_from80k_step10000` | PyTorch BF16 | 10.000 | robotwin_piper_x_sim_real_from80k | no disponible |

## Limitaciones y advertencias

- Solo contiene parámetros: no incluye estado del optimizador ni `train_state`, por lo que no permite reanudar el entrenamiento tal cual.
- Específico para el robot Piper y las tareas de RoboTwin; no es un modelo generalista ni un modelo de lenguaje.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Sin métricas publicadas de éxito en tareas, lo que impide evaluar su calidad sin ejecución propia.
- Repositorio sin descargas ni likes en el momento de la consulta; sin validación comunitaria.
- Riesgo de sobreajuste al dataset `robotwin_piper_x_sim_real` y de degradación fuera de la distribución de tareas entrenadas.
- Dependencia de las estadísticas de normalización incluidas; un uso con otras escalas de acciones o sensores puede producir resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huzican0419/robotwin_piper_x_real_step10000_jax
- Contraparte PyTorch: https://huggingface.co/huzican0419/robotwin_piper_x_sim_real_from40k_step10000
- Variante desde 80k (JAX): https://huggingface.co/huzican0419/robotwin_piper_x_sim_real_from80k_step10000_jax
- Variante desde 80k (PyTorch): https://huggingface.co/huzican0419/robotwin_piper_x_sim_real_from80k_step10000
