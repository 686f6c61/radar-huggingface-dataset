# mulligan/sim-square-narrow-r02-baseline-divl

## Resumen

`mulligan/sim-square-narrow-r02-baseline-divl` es un agente de aprendizaje por refuerzo para robótica, no un modelo de lenguaje. Lo publica la organización Mulligan dentro de su campaña de investigación sobre la tarea de simulación `sim-square-narrow`, y corresponde a la ronda R2, brazo `baseline`, de la celda de campaña `sq_d0_r2_baseline_uniform_nocf_human_only`. El agente es "state-based": consume observaciones de estado (no vision) y produce acciones, con un actor de difusión congelado heredado del modelo padre `sim-square-narrow-r02-baseline-idql` y un crítico de valor distributional denominado DIVL. El repositorio incluye cinco checkpoints independientes, uno por semilla (seed-1 a seed-5), todos capturados en el paso de entrenamiento 150001.

La relevancia de esta ficha es metodológica: se trata de un artefacto de evaluación comparativa dentro de un pipeline de RL offline/offline-to-online con minería DAgger. Los cinco seeds reportan tasas de éxito entre el 91,63 % y el 93,28 % sobre una rejilla de estados iniciales reservada, lo que da una referencia cuantitativa reproducible para comparar variantes de crítico (DIVL frente a IDQL y otras configuraciones) manteniendo el actor fijo. El tamaño del repositorio es de 1,4 GB en total, unos 280 MB por semilla, lo que refleja que el actor de difusión y el crítico son redes compactas comparadas con los transformers habituales.

Los pesos se distribuyen como pickles de PyTorch (`policy.pt`) junto a `stats.json` y un `release.json` con hashes SHA-256. La licencia es MIT. No hay información publicada sobre número de parámetros, arquitectura interna detallada del actor o del crítico, ni sobre cuantizaciones o despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado con actor de difusión (congelado, heredado del padre) y crítico de valor distributional DIVL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política basada en estado, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en precisión de entrenamiento, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`policy.pt`) más `stats.json` y `release.json`; un directorio por semilla |

## Arquitectura y entrenamiento

El modelo es un agente de control para la tarea simulada `sim-square-narrow`. La model card lo describe explícitamente como un agente basado en estado que combina el actor de difusión congelado del modelo padre `sim-square-narrow-r02-baseline-idql` con un crítico distributional DIVL. El nombre de los runs de W&B asociados (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indica que el pipeline de entrenamiento emplea componentes IQL, DDPG+BC e IDQL junto con DIVL, y que la base de entorno deriva del entorno de tipo NutAssemblySquare. No se publican detalles sobre el número de capas, dimensión de las representaciones, pasos de difusión del actor ni hiperparámetros del crítico.

El entrenamiento cubre 150001 pasos por semilla y se apoya en cinco datasets: teleoperación base (`sim-square-narrow-c00-teleop-baseline`), rollouts de la política base en las rondas c01 y c02, y datos de corrección DAgger de las mismas rondas (`sim-square-narrow-c01-dagger-baseline`, `sim-square-narrow-c02-dagger-baseline`). La celda de campaña (`uniform_nocf_human_only`) sugiere un muestreo uniforme sin contrafactuales y con datos exclusivamente humanos más rollouts. Los checkpoints son copias byte a byte de los artefactos de W&B, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico continuo basado en estado para la tarea de inserción/ensamblaje `sim-square-narrow` en simulación.
- Política determinista o estocástica derivada de un actor de difusión, con selección de acción sobre observaciones de estado.
- Estimación de valor mediante un crítico distributional DIVL, útil para análisis de incertidumbre y para comparación entre variantes de crítico.
- Reproducibilidad por semilla: cinco checkpoints independientes (seed-1 a seed-5) con el mismo paso de entrenamiento, lo que permite medir varianza entre inicializaciones.
- Evaluación sobre una rejilla reservada de estados iniciales, con resultados por rollout publicados en el dataset `sim-square-narrow-r00-r03-eval`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Comparación de variantes de crítico en RL offline: usar este checkpoint como referencia DIVL frente al padre IDQL manteniendo el actor congelado, de modo que cualquier diferencia de tasa de éxito se atribuya al crítico.
- Reproducción de experimentos de investigación: los cinco seeds permiten estimar intervalos de confianza y detectar si una mejora propuesta cae dentro de la varianza observada (91,63 %–93,28 %).
- Generación de datos de entrenamiento por políticas: los checkpoints pueden desplegarse en el simulador para producir nuevos rollouts etiquetados, alimentando rondas posteriores de minería DAgger.
- Estudio de estabilidad de políticas de difusión: al estar el actor congelado y el crítico variado, sirve para analizar cómo cambia el comportamiento en los estados iniciales más difíciles de la rejilla evaluada.
- Punto de partida para ajuste fino en tareas de ensamblaje similares: el agente puede reentrenarse sobre nuevos datasets de teleoperación con la misma interfaz de estado.
- Docencia y divulgación en RL robótico: el tamaño reducido del repositorio (1,4 GB, unos 280 MB por semilla) y la naturaleza basada en estado facilitan ejecutar demostraciones sin clústeres de GPU grandes.
- Auditoría de artefactos de investigación: la verificación por MD5 y SHA-256 permite comprobar la integridad de los pesos antes de reutilizarlos en una comparativa publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. Los únicos datos de evaluación son tasas de éxito sobre la rejilla reservada de estados iniciales del dataset `sim-square-narrow-r00-r03-eval` (N = 32 estados iniciales, 8000 rollouts por semilla).

| Seed | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 7330 | 91,63 % |
| seed-2 | 8000 | 7367 | 92,09 % |
| seed-3 | 8000 | 7364 | 92,05 % |
| seed-4 | 8000 | 7462 | 93,28 % |
| seed-5 | 8000 | 7370 | 92,13 % |
| Media (calculada) | 40000 | 36893 | 92,23 % |

La media y la tasa agregada son cálculos derivados de los datos de la model card; el autor no publica ese agregado explícitamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un agente basado en estado y sin torre de visión, la huella en memoria es muy inferior a la de un modelo de lenguaje de tamaño comparable; el repositorio completo ocupa 1,4 GB, es decir, unos 280 MB por semilla en disco.
- GPU recomendadas: no disponible. No se publican cifras de GPU empleadas en entrenamiento ni en evaluación.
- Viabilidad en GPU de consumo: no disponible como cifra publicada, pero la naturaleza state-based del agente y el tamaño del artefacto sugieren que la inferencia cabe holgadamente en GPUs de consumo e incluso en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; estas herramientas no son aplicables porque el artefacto es un checkpoint de PyTorch para RL, no un modelo generativo de texto.
- Latencia y throughput: no disponibles.
- Requisito de entorno: los ficheros `.pt` son pickles de PyTorch; deben cargarse únicamente en entornos de confianza.
- Entorno de ejecución: el código de investigación de Mulligan en los commits indicados (`3053203fc3df`), con el simulador correspondiente a la tarea `sim-square-narrow`.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r02-baseline-divl` (este) | Agente R2, arm baseline, critico DIVL | no disponible | no aplica | 91,63 %–93,28 % de exito segun seed | MIT | HuggingFace, 5 seeds |
| `sim-square-narrow-r02-baseline-idql` | Agente R2, arm baseline, critico IDQL; padre del actor congelado | no disponible | no aplica | no disponible en la informacion proporcionada | MIT | HuggingFace |
| Otras celdas de campana de la ronda R2 (no identificadas en la informacion) | Variantes de arm y de configuracion | no disponible | no aplica | no disponible | MIT (presumible por la organizacion) | no disponible |

No se dispone de resultados publicados de otros agentes de la misma tarea dentro de la informacion proporcionada, por lo que no es posible construir una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Es un agente específico de una única tarea simulada (`sim-square-narrow`); no hay evidencia publicada de transferencia a robots reales ni a otras tareas.
- El actor está congelado y se hereda de `sim-square-narrow-r02-baseline-idql`; por tanto, este checkpoint no puede mejorar la política base, solo el crítico asociado.
- Los ficheros `.pt` son pickles de PyTorch y pueden ejecutar código arbitrario al cargarse; deben abrirse solo en entornos de confianza, tal como advierte el propio autor.
- Sesgos conocidos: no disponibles como análisis publicado. Los datos de entrenamiento combinan teleoperación humana y rollouts de políticas, lo que puede introducir sesgo hacia las trayectorias y los estados iniciales cubiertos por esos datasets.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de generalización incorrecta fuera de la distribución de estados iniciales evaluada.
- La evaluación se limita a una rejilla reservada de estados iniciales (N = 32) con 8000 rollouts por semilla; no se documentan pruebas fuera de esa rejilla ni con perturbaciones.
- La varianza entre semillas es pequeña (1,65 puntos porcentuales entre el mínimo y el máximo), pero con solo cinco semillas no permite descartar diferencias menores al 1,7 % frente a otras variantes.
- No hay información publicada sobre cuantizaciones, latencia, throughput ni requisitos de hardware, lo que dificulta planificar un despliegue en producción.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías y con la obligación habitual de conservar el aviso de copyright.
- No se documenta soporte, mantenimiento ni actualizaciones posteriores a la fecha de creación del repositorio (29 de septiembre de 2026).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r02-baseline-divl
- Modelo padre (actor de difusion congelado): https://huggingface.co/mulligan/sim-square-narrow-r02-baseline-idql
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de la politica base (c01): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Dataset DAgger de la ronda c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Dataset de rollouts de la politica base (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-baseline-policy-rollouts
- Dataset DAgger de la ronda c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-baseline
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Las busquedas web realizadas no devolvieron ningun enlace relevante sobre este modelo; los unicos resultados obtenidos eran contenido no relacionado y no se incluyen.
