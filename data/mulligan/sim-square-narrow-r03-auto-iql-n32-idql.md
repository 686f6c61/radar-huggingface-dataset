# mulligan/sim-square-narrow-r03-auto-iql-n32-idql

## Resumen

`mulligan/sim-square-narrow-r03-auto-iql-n32-idql` es un agente de aprendizaje por refuerzo offline para control robótico, entrenado sobre la tarea de simulación `sim-square-narrow` (variante estrecha de la tarea de ensamblaje Square del benchmark de robótica, donde un brazo debe insertar una pieza en un hueco cuadrado). No es un modelo de lenguaje: es una política de control basada en estado, compuesta por un actor de difusión y un crítico IQL escalar, empaquetada como checkpoint de PyTorch (`policy.pt`) más un fichero de normalización (`stats.json`). Lo publica la organización `mulligan`, responsable del benchmark y de la plataforma Policy Arena, e implementa la formulación IDQL (Implicit Q-Learning as an Actor-Critic method) descrita en arXiv:2304.10573.

El modelo pertenece a la ronda R3 de la campaña de autoentrenamiento iterativo del proyecto, dentro del brazo `auto-iql-n32` y de la celda de campaña `sq_d0_r3_auto_iql_n32`. Se entrenó durante 150 001 pasos sobre una mezcla de datos de teleoperación (`sim-square-narrow-c00-teleop-baseline`) y de rollouts generados por políticas anteriores de la propia campaña (`c01`, `c02`, `c03`), en un esquema de imitación/refuerzo iterativo tipo DAgger. El repositorio incluye cinco semillas independientes (seeds 1 a 5) y ocupa 1,4 GB en total, aproximadamente 280 MB por semilla.

Su relevancia es doble: por un lado, sirve como referencia reproducible de un agente IDQL en un régimen de datos híbridos (demostraciones humanas más rollouts de política); por otro, sus resultados de evaluación —entre el 77,94 % y el 82,04 % de éxito según semilla, sobre una rejilla de 32 estados iniciales retenidos— quedan publicados junto con los datasets de evaluación, lo que permite auditar la varianza entre semillas de un mismo algoritmo. La licencia es MIT, lo que facilita su reutilización y su comparación directa en la arena pública del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico IDQL: actor de difusión (generador de acciones) más crítico IQL escalar; observaciones basadas en estado, sin entrada visual |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (consume observaciones de estado, no secuencias de texto; no se documenta ventana de historial) |
| Tipos de cuantizacion | no disponible (se publica un único checkpoint PyTorch sin variantes cuantizadas) |
| Idiomas soportados | no aplica (política de control robótico sin interfaz de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle `.pt` (`policy.pt`) más `stats.json` (normalizadores) y `release.json` (procedencia y hashes) |
| Tarea | sim-square-narrow |
| Ronda del modelo | R3 |
| Brazo | auto-iql-n32 |
| Celda de campaña | `sq_d0_r3_auto_iql_n32` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150 001 |
| Tamaño del repositorio | 1,4 GB (aproximadamente 280 MB por semilla) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura sigue la formulación IDQL: un crítico Q entrenado con IQL, que aprende la función de valor usando exclusivamente acciones presentes en el dataset mediante un backup de Bellman modificado y una pérdida asimétrica (expectile) que evita consultar acciones fuera de distribución, y un actor de difusión que se ajusta por muestreo ponderado por el valor estimado del crítico. El resultado es un método actor-crítico donde el actor es un modelo generativo de acciones en lugar de una política gaussiana o determinista, lo que permite representar distribuciones multimodales de acciones típicas en demostraciones humanas de teleoperación. El crítico es escalar y las observaciones son exclusivamente de estado (sin píxeles), lo que reduce drásticamente el coste computacional frente a políticas visomotoras. No se detalla en la información disponible el número de capas, dimensión oculta ni número de pasos de difusión.

El entrenamiento cubre 150 001 pasos por semilla y se apoya en cuatro datasets: un conjunto de teleoperación baseline (`c00-teleop-baseline`) y tres rondas de rollouts generados por políticas `auto-iql-n32` anteriores (`c01`, `c02`, `c03`). Este esquema corresponde a un ciclo iterativo de recolección de datos con la política en curso y reentrenamiento posterior, con una componente de aprendizaje por imitación además del componente RL (el artefacto de origen se registra como `iql_ddpg_bc_idql_nutassemblysquare`, es decir, una variante del código que combina IQL con DDPG+BC). No se documentan en la información disponible el número total de transiciones, la composición exacta del dataset ni si se aplicó algún tipo de ajuste adicional (RLHF, DPO u otros), ya que estos mecanismos no aplican a políticas de control.

La procedencia está verificada: los ficheros son copias byte a byte de los artefactos de Weights & Biases, con MD5 comprobado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`. Los commits de git asociados son `1edf2e7a2851` (seeds 1 y 2), `43971775aff7` (seeds 3 y 4) y `4e50ff42420f` (seed 5).

## Capacidades

- Control robótico continuo basado en estado para la tarea de inserción `sim-square-narrow`, con generación de acciones mediante un actor de difusión.
- Aprendizaje por refuerzo offline puro: la política puede mejorarse a partir de datos previamente recogidos, sin interacción en línea durante el entrenamiento.
- Manejo de distribuciones multimodales de acciones, gracias a la parametrización generativa del actor, relevante cuando las demostraciones humanas contienen múltiples estrategias válidas.
- Aprendizaje por imitación complementario (los rollouts incluyen datos de política etiquetados), lo que permite afinar la política hacia regiones de alta recompensa del espacio de estados.
- Reproducibilidad multi-semilla: cinco checkpoints independientes con el mismo paso de entrenamiento, lo que permite medir varianza de inicialización.
- Normalización de observaciones incluida en el paquete (`stats.json`), lo que facilita el despliegue sin recalcular estadísticas del dataset de entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito: esas categorías no aplican a este tipo de modelo.
- No dispone de capacidades de visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Evaluación comparativa de algoritmos de RL offline: el checkpoint permite reproducir la línea base IDQL dentro del brazo `auto-iql-n32` y compararla contra otras variantes de la misma campaña, usando la rejilla de 32 estados iniciales retenidos y los datasets de evaluación publicados.
- Investigación en aprendizaje iterativo con datos híbridos: sirve para estudiar cómo evoluciona el rendimiento al acumular rondas de rollouts de política (c01, c02, c03) sobre un mismo conjunto de demostraciones de teleoperación.
- Punto de partida para ajuste fino en tareas de inserción estrecha: al ser una política basada en estado con licencia MIT, puede reutilizarse como inicialización para variantes con tolerancias dimensionales distintas o para otras tareas de ensamblaje del mismo benchmark.
- Análisis de varianza entre semillas: con cinco checkpoints entrenados al mismo número de pasos, es posible cuantificar la dispersión del éxito (de 77,94 % a 82,04 %) y decidir cuántas semillas son necesarias en experimentos futuros.
- Destilación y compresión de políticas: el actor de difusión puede usarse como profesor para destilar una política determinista de menor coste de inferencia, útil si el despliegue requiere control a frecuencia alta.
- Pruebas de robustez y análisis de fallos: los rollouts de evaluación permiten localizar en qué configuraciones iniciales falla la política y correlacionarlo con propiedades del estado inicial.
- Integración en plataformas de benchmarking de robótica: el modelo sigue el formato de la organización `mulligan` (carpetas por semilla, `release.json`, vínculo a Policy Arena), por lo que puede registrarse y puntuarse automáticamente en evaluaciones públicas.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son los de la evaluación en rejilla de estados iniciales retenidos (`sim-square-narrow-r00-r03-eval`), con 32 estados iniciales y 8 000 rollouts por semilla. No se han publicado resultados de benchmarks estándar de RL (D4RL, RL Unplugged u otros) en la información disponible.

| Dataset de evaluación | Carpeta | Estados iniciales | Éxitos / rollouts | Tasa de éxito |
|---|---|---|---|---|
| sim-square-narrow-r00-r03-eval | seed-1 | 32 | 6 272 / 8 000 | 78,40 % |
| sim-square-narrow-r00-r03-eval | seed-2 | 32 | 6 350 / 8 000 | 79,38 % |
| sim-square-narrow-r00-r03-eval | seed-3 | 32 | 6 563 / 8 000 | 82,04 % |
| sim-square-narrow-r00-r03-eval | seed-4 | 32 | 6 425 / 8 000 | 80,31 % |
| sim-square-narrow-r00-r03-eval | seed-5 | 32 | 6 235 / 8 000 | 77,94 % |
| Total agregado | las cinco semillas | 32 | 31 845 / 40 000 | 79,61 % |

No se dispone de comparaciones numéricas contra otros algoritmos o rondas dentro de la información proporcionada.

## Requisitos de hardware

- El modelo consume observaciones de estado (no imágenes), por lo que la inferencia es de coste muy bajo. El repositorio completo pesa 1,4 GB, lo que implica aproximadamente 280 MB por semilla entre pesos y normalizadores; el espacio de VRAM necesario es inferior a 1 GB por política cargada.
- No se especifican GPU recomendadas por el autor. Al tratarse de redes de tamaño reducido con entrada de estado, tanto GPU de gama de consumo (RTX 3060, RTX 4090, etc.) como CPU son suficientes para inferencia; la GPU solo aporta ventaja si se ejecutan muchos entornos en paralelo o si la frecuencia de control exigida es alta.
- No se documenta latencia ni throughput de inferencia. La variable crítica en este tipo de políticas es el número de pasos de difusión del actor, que no se detalla en la información disponible.
- Opciones de despliegue: al publicarse únicamente como checkpoint PyTorch (`.pt`), el despliegue requiere cargar el estado con PyTorch (o exportarlo a TorchScript/ONNX). No se publican variantes para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo. El autor advierte de que los ficheros `.pt` son pickles de PyTorch y deben cargarse solo en entornos de confianza.
- Para evaluación end-to-end hace falta un simulador compatible con la tarea `sim-square-narrow` y el código de investigación del proyecto en los commits indicados.

## Comparativa con modelos similares

| Modelo / algoritmo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mulligan/sim-square-narrow-r03-auto-iql-n32-idql | no disponible | no aplica (entrada de estado) | 77,94 %-82,04 % de éxito por semilla en la rejilla de 32 estados iniciales | MIT | Checkpoint `.pt` en HuggingFace (5 semillas) |
| Otros brazos `auto-iql-n32` de la misma campaña (`c01`, `c02`, `c03` policy rollouts) | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Datasets de rollouts publicados por `mulligan` |
| IQL estándar (algoritmo de referencia del artículo IDQL) | no disponible | no aplica | no disponible (no se incluyen cifras comparativas en la información) | no disponible | Implementaciones públicas en repos de investigación |
| IDQL (formulación original, arXiv:2304.10573) | no disponible | no aplica | no disponible (resultados publicados en el paper, no en esta información) | no disponible | Paper y código de referencia |

No se dispone de datos numéricos que permitan una comparación directa contra alternativas concretas dentro de la información proporcionada.

## Limitaciones y advertencias

- Es un modelo específico de tarea y de entorno: solo controla la tarea `sim-square-narrow` en simulación. No es un modelo general ni transferible sin reentrenamiento o ajuste fino.
- La política es puramente basada en estado; no procesa imágenes ni texto, por lo que no puede emplearse en configuraciones visomotoras ni en interfaces conversacionales.
- El rendimiento depende de la normalización de observaciones de `stats.json`; usar el checkpoint con normalizadores distintos o con una definición de estado diferente degradará el control sin aviso.
- La evaluación se realizó sobre una rejilla de 32 estados iniciales retenidos con 8 000 rollouts por semilla. Es una cobertura limitada del espacio de estados, por lo que las tasas de éxito publicadas no garantizan generalización a configuraciones iniciales fuera de esa rejilla.
- Existe varianza apreciable entre semillas (4,1 puntos porcentuales entre la mejor y la peor), por lo que comparar configuraciones con una sola semilla es metodológicamente débil.
- Los ficheros `.pt` son pickles de PyTorch y pueden ejecutar código arbitrario al cargarse; el propio autor recomienda hacerlo solo en un entorno de confianza. Verificar los SHA-256 de `release.json` antes de usarlos.
- El artefacto de entrenamiento registrado lleva el nombre `iql_ddpg_bc_idql_nutassemblysquare`, que no coincide con el nombre de la tarea publicada; conviene revisar el código en el commit correspondiente si se necesita reproducir el entrenamiento exacto.
- La información disponible no documenta sesgos del modelo, composición demográfica del dataset ni análisis de alucinación, ya que no se trata de un modelo generativo de lenguaje.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantías, sujeto al aviso de responsabilidad habitual de este tipo de licencias.
- No se han publicado curvas de aprendizaje, análisis de fallos ni resultados de benchmarks estándar de RL, lo que limita la evaluación independiente del método más allá de las tasas de éxito de la rejilla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-auto-iql-n32-idql
- Organización Mulligan (modelos y datasets): https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones públicas): https://arena.mulligan.page
- Dataset de teleoperación baseline: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Rollouts de política c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Rollouts de política c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-n32-policy-rollouts
- Rollouts de política c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-iql-n32-policy-rollouts
- Dataset de evaluación r00-r03: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Paper IDQL (arXiv:2304.10573): https://arxiv.org/abs/2304.10573
- Rollouts c03 (variante mulligan): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Rollouts c03 (variante auto-iql-success-bc-n32, referencia externa): https://claru.ai/datasets/mulligan-sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
