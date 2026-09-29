# mulligan/sim-square-narrow-r00-sobol-idql

## Resumen

El modelo `mulligan/sim-square-narrow-r00-sobol-idql` es un agente de aprendizaje por refuerzo offline para robótica, concretamente una política IDQL (Implicit Diffusion Q-Learning) entrenada sobre la tarea simulada `sim-square-narrow`. Lo publica la organización `mulligan` como parte de su plataforma de investigación Mulligan, que agrupa agentes, datasets de teleoperación y evaluaciones comparativas en un mismo repositorio. No es un modelo de lenguaje: su salida son acciones de control de un robot a partir de observaciones de estado, no tokens de texto.

Técnicamente se trata de un actor de difusión acompañado de un crítico IQL escalar (variante `iql_ddpg_bc_idql`), distribuido como un checkpoint de PyTorch (`policy.pt`) más un fichero de normalización (`stats.json`). El repositorio contiene cinco semillas de entrenamiento (carpetas `seed-1` a `seed-5`), todas con el mismo paso de entrenamiento (150001) y variantes del brazo `sobol` dentro de la celda de campaña `sq_d0_r0_ours_sobol`. El tamaño total del repo es de 1,4 GB.

Su relevancia es fundamentalmente metodológica: forma parte de una campaña de "self-improving" y DAgger mining sobre manipulación simulada, con evaluaciones de éxito registradas por semilla sobre una rejilla de estados iniciales retenida. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión con crítico IQL escalar (variante de entrenamiento `iql_ddpg_bc_idql`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control; entrada basada en estado, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen como checkpoint PyTorch sin cuantizar |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada ni salida de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `policy.pt` (pickle de PyTorch) y `stats.json` (normalizadores) |
| Tarea | `sim-square-narrow` |
| Ronda de modelo | R0 |
| Brazo | `sobol` |
| Celda de campana | `sq_d0_r0_ours_sobol` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Dataset de entrenamiento | `mulligan/sim-square-narrow-c00-teleop-sobol` |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un agente IDQL en el que la política se parametriza como un modelo de difusión que genera acciones, mientras que el crítico es un Q-funcion escalar entrenado con Implicit Q-Learning (IQL). El pipeline de entrenamiento indicado en los metadatos de los checkpoints es `iql_ddpg_bc_idql_nutassemblysquare`, es decir, una combinación de IQL, DDPG+BC e IDQL, sobre un entorno de ensamblaje de tuercas y piezas cuadradas. El modelo es estrictamente basado en estado (`state-based`), sin codificador visual, por lo que consume vectores de observación del simulador y no imágenes.

Los datos de entrenamiento proceden del dataset de teleoperación `mulligan/sim-square-narrow-c00-teleop-sobol`. La información proporcionada no detalla el número de transiciones, la composición del dataset ni si se aplicaron fases adicionales de RLHF/DPO (conceptos que en cualquier caso no aplican a un agente de control). Sí se documenta la procedencia exacta de cada semilla: cada una corresponde a un artefacto de Weights & Biases y a un commit de Git concretos, y los ficheros son copias byte a byte verificadas con MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`. Los pasos de entrenamiento son idénticos en las cinco semillas (150001), lo que permite interpretar la dispersión de resultados como variabilidad de semilla y no como diferencia de presupuesto de entrenamiento.

## Capacidades

- Control robótico basado en estado para la tarea de inserción/ensamblaje `sim-square-narrow` en simulación.
- Generación de acciones multimodales mediante actor de difusión, lo que permite representar distribuciones de acción multimodales en lugar de una única media.
- Aprendizaje por refuerzo offline: la política se entrena a partir de datos de teleoperación sin interacción online durante el entrenamiento.
- Evaluación reproducible sobre una rejilla de estados iniciales retenida, con resultados por semilla publicados en un dataset aparte.
- Reproducibilidad de semilla: cinco semillas independientes con artefacto de W&B y commit de Git trazables.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje, capacidades multilingües, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en RL offline para manipulación: usar los cinco checkpoints como línea base reproducible de IDQL en una tarea de ensamblaje, comparando la dispersión entre semillas (78,04 % a 82,84 % de éxito) frente a otros algoritmos.
- Punto de partida para DAgger mining: dado que los checkpoints provienen de un pipeline `square-dagger-mining`, sirven como política inicial para recolectar nuevas trayectorias y reentrenar con datos agregados.
- Evaluación comparativa en un arena de políticas: los resultados por semilla sobre 8000 rollouts por semilla permiten situar el agente en una tabla comparativa frente a otras celdas de campaña del mismo proyecto.
- Estudio de variabilidad de semilla en RL: con cinco semillas de idéntico presupuesto de pasos, el modelo permite cuantificar la varianza intrínseca del algoritmo en esta tarea (rango de aproximadamente 4,8 puntos porcentuales entre la mejor y la peor semilla).
- Ablación de componentes algorítmicos: al ser un agente IDQL con crítico IQL, sirve para aislar el efecto del actor de difusión frente a políticas deterministas en tareas de inserción estrecha ("narrow").
- Integración en bucles de simulación a bajo coste: al tratarse de un agente basado en estado y de tamaño reducido, puede ejecutarse en CPU o en una GPU de gama media dentro de un bucle de evaluación con miles de rollouts.
- Reproducibilidad y auditoría de artefactos: el repositorio documenta MD5/SHA-256 y commits, útil como caso práctico de trazabilidad de checkpoints en publicaciones.

## Benchmarks y rendimiento

Los únicos resultados disponibles son las evaluaciones de éxito por semilla sobre una rejilla de estados iniciales retenida, publicadas en el dataset `sim-square-narrow-r00-r03-eval`. No se han proporcionado resultados de benchmarks estándar de RL (por ejemplo, puntuaciones normalizadas por entorno) ni comparaciones numéricas con otros agentes.

| Semilla | Rollouts evaluados | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 6243 | 78,04 % |
| seed-2 | 8000 | 6627 | 82,84 % |
| seed-3 | 8000 | 6570 | 82,13 % |
| seed-4 | 8000 | 6623 | 82,79 % |
| seed-5 | 8000 | 6537 | 81,71 % |
| Total | 40000 | 32600 | 81,50 % |

La columna "N" de la tabla original de la model card vale 1 en todas las filas y hace referencia a la carpeta de semilla evaluada, no al número de rollouts.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 1,4 GB para cinco semillas, lo que sugiere del orden de 280 MB por checkpoint como estimación derivada, no confirmada por el autor.
- GPU recomendadas: no disponible. Al ser un agente basado en estado y de tamaño reducido, no requiere aceleradores de gama alta; una GPU consumer de gama media o incluso CPU debería ser suficiente, aunque el autor no publica cifras.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del artefacto, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: inferencia con PyTorch cargando `policy.pt` junto con `stats.json`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables de la misma categoría (agentes de RL offline basados en estado para manipulación simulada), por lo que la comparativa cuantitativa no está disponible. Como referencia contextual, dentro del propio proyecto Mulligan existen otras políticas de la misma tarea y celda de campaña, pero sus datos no forman parte de la información suministrada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-narrow-r00-sobol-idql | no disponible | no aplica | 81,50 % de exito (media de 5 semillas, 40000 rollouts) | MIT | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización estrecha: el agente está entrenado únicamente para la tarea `sim-square-narrow` en simulación; no es transferible directamente a otros entornos ni a un robot real sin trabajo adicional.
- Entrada basada en estado: no procesa imágenes ni lenguaje, por lo que no puede emplearse en escenarios que requieran percepción visual o instrucciones en lenguaje natural.
- Riesgo de sobreajuste al simulador: no hay evidencia en la información disponible de evaluación en dominio real (sim-to-real).
- Sesgos y alucinación: los conceptos de sesgo de contenido y alucinación no aplican de forma estándar, pero sí existe el riesgo análogo de generalización defectuosa ante estados iniciales fuera de la distribución de entrenamiento.
- Variabilidad de semilla: la tasa de éxito oscila entre 78,04 % y 82,84 % según la semilla, un rango de casi 5 puntos porcentuales que debe tenerse en cuenta al seleccionar un checkpoint para producción.
- Los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza, tal como advierte el propio autor.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, pero sin garantías y sin obligación de atribución más allá de conservar el aviso de copyright.
- Los resultados de búsqueda web devueltos no contienen ninguna referencia relevante al modelo (corresponden a servicios de radio de la BBC), por lo que no se ha podido contrastar la ficha con fuentes externas.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r00-sobol-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Papers, repositorios o demos adicionales: no disponible en la informacion proporcionada
