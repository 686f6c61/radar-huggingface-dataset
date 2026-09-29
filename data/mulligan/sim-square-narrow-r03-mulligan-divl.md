# mulligan/sim-square-narrow-r03-mulligan-divl

## Resumen

sim-square-narrow-r03-mulligan-divl es un agente de control para robótica entrenado mediante aprendizaje por refuerzo offline y offline-to-online sobre la tarea simulada "sim-square-narrow". Lo publica la organización mulligan dentro de su proyecto de investigación Mulligan, que agrupa campañas de entrenamiento con datos de teleoperación, agregación de conjuntos de datos (DAgger) y rollouts de políticas, y que expone las evaluaciones en Policy Arena. El modelo no es un modelo de lenguaje: es una política de control de acción sobre observaciones de estado, sin cámara.

Técnicamente, el artefacto combina el actor de difusión congelado del modelo padre sim-square-narrow-r03-mulligan-idql con un crítico DIVL de tipo distribucional. El repositorio ocupa 1,4 GB e incluye cinco checkpoints independientes (uno por semilla, de la 1 a la 5), todos ellos correspondientes al paso de entrenamiento 150001 y procedentes de artefactos de Weights & Biases verificados por MD5. Cada carpeta contiene un `policy.pt` y un `stats.json`, más ficheros de procedencia.

Su relevancia es doble: por un lado sirve como referencia reproducible (cinco semillas, evaluación sobre una rejilla de estados iniciales reservados y tasas de éxito superiores al 95 %); por otro, documenta una receta concreta de RL offline con actor de difusión y crítico distribucional que puede reutilizarse como punto de partida en investigación de manipulación robótica. La licencia es MIT y el tamaño por checkpoint es reducido, lo que facilita su uso en laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente actor-crítico para robótica: actor de difusión congelado (heredado del modelo padre idql) más crítico DIVL distribucional; entrenamiento de tipo offline RL con datos de DAgger y rollouts de política |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo lingüístico) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en `policy.pt`, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; las observaciones son de estado, sin lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) por semilla, acompañado de `stats.json`, `release.json` y metadatos de procedencia |
| Tarea | sim-square-narrow (manipulación en simulación) |
| Ronda del modelo | R3 |
| Brazo (arm) | mulligan |
| Celda de campaña | `sq_d0_r3_ours_grid_cell_bonus_b1p0_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Commit de Git del entrenamiento | `3053203fc3df` |
| Tamaño del repositorio | 1,4 GB |
| Fecha de creación (según HuggingFace) | 2026-09-29 |
| Fecha de actualización (según HuggingFace) | 2026-09-29 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un agente de control basado en estado. Según la model card, se trata de un "state-based agent with the parent's frozen diffusion actor and a distributional DIVL critic": el actor generador de acciones es una política de difusión congelada que proviene del modelo sim-square-narrow-r03-mulligan-idql, y sobre ella se entrena un crítico DIVL de naturaleza distribucional. El nombre del artefacto de Weights & Biases asociado a cada semilla (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indica que la receta combina componentes de IQL, DDPG+BC e IDQL junto con el crítico DIVL; no se documenta en la información disponible el detalle de cada componente ni la expansión del acrónimo DIVL.

El entrenamiento se apoya en siete conjuntos de datos públicos: teleoperación inicial (`sim-square-narrow-c00-teleop-sobol`), rondas sucesivas de DAgger dirigidas por el agente (`c01`, `c02`, `c03` con el sufijo `dagger-mulligan`) y rollouts de políticas previas (`sobol-policy-rollouts`, `mulligan-policy-rollouts`). Se trata, por tanto, de un bucle iterativo de recogida de datos y reentrenamiento típico de DAgger, con la particularidad de que el actor permanece congelado mientras se ajusta el crítico. No se especifican en la información disponible el número total de transiciones, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF, DPO o ajuste por preferencias (no aplicables en este dominio). Cada checkpoint corresponde al paso 150001 y los cinco ficheros son copias byte a byte de los artefactos originales, con MD5 comprobado contra el manifiesto y SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico por estado: genera acciones a partir de observaciones de estado del entorno simulado sim-square-narrow, sin entrada de cámara ni percepción visual.
- Manipulación fina en simulación: la tarea objetivo requiere insertar o ensamblar una pieza en un espacio estrecho, con tolerancias reducidas.
- Política condicionada por difusión: el actor de difusión permite representar distribuciones multimodales de acciones, lo que resulta útil cuando existen varias soluciones válidas para una misma observación.
- Estimación de valor distribucional: el crítico DIVL modela la distribución del retorno en lugar de una única media, lo que facilita el entrenamiento offline con datos heterogéneos.
- Reutilización como inicialización: al ser un actor congelado más un crítico ajustado, puede servir como punto de partida para nuevas rondas de DAgger o para destilación.
- Reproducibilidad multilla: incluye cinco semillas independientes, lo que permite medir varianza entre ejecuciones.
- Sin soporte de tool calling, function calling, agentes multi-paso lingüísticos, capacidades multilingües ni modo de razonamiento: no disponibles porque el modelo no es un modelo de lenguaje.

## Casos de uso

- Investigación en aprendizaje por refuerzo offline: el modelo sirve como artefacto de referencia para comparar variantes de crítico (DIVL frente a otros estimadores de valor) manteniendo el actor fijo, lo que aísla el efecto del crítico en el rendimiento.
- Generación de datos para DAgger: los rollouts de la política pueden volcarse a un nuevo conjunto de datos con correcciones humanas, alimentando la siguiente ronda de entrenamiento del bucle de mejora iterativa descrito en la model card.
- Evaluación estandarizada en Policy Arena: al estar vinculado a la campaña R3 y a la rejilla de estados iniciales reservada, permite reproducir y comparar métricas con otras políticas de la misma campaña bajo condiciones idénticas.
- Destilación de políticas: el actor de difusión, más costoso de muestrear, puede destilarse a un actor determinista más rápido para despliegue en simulación a alta frecuencia.
- Inicialización de políticas para tareas relacionadas: el checkpoint puede reutilizarse como punto de partida en variantes de la tarea (por ejemplo, otras disposiciones de la pieza o geometrías del hueco) mediante ajuste fino con datos de la nueva variante.
- Estudio de sim-to-real con reservas: dado que las observaciones son exclusivamente de estado y sin visión, un traslado a un robot físico exigiría disponer del mismo vector de estado mediante estimación de estado; no se documenta ninguna validación en hardware real.
- Docencia y prácticas de RL: el repositorio, con licencia MIT y cinco semillas, es adecuado para reproducir un experimento completo de RL offline en un entorno de laboratorio.

## Benchmarks y rendimiento

La model card publica una única evaluación: éxito sobre una rejilla de estados iniciales reservados ("held-out initial-state grid"), con N=32 y resultados por rollout en el conjunto de datos sim-square-narrow-r00-r03-eval. No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un agente de control robótico.

| Semilla | Conjunto de datos de evaluación | N | Éxitos / rollouts | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 32 | 7618 / 8000 | 95,23 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 32 | 7749 / 8000 | 96,89 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 32 | 7711 / 8000 | 96,39 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 32 | 7755 / 8000 | 96,94 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 32 | 7739 / 8000 | 96,74 % |
| Media (calculada a partir de los datos publicados) | — | — | 38572 / 40000 | 96,43 % |

La dispersión entre semillas es baja: 1,71 puntos porcentuales entre el mejor (seed-4) y el peor (seed-1) resultado. No se han publicado intervalos de confianza ni comparaciones estadísticas con otros brazos de la campaña dentro de la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia indirecta, el repositorio completo ocupa 1,4 GB e incluye cinco semillas, de modo que cada checkpoint (`policy.pt` más `stats.json`) ocupa previsiblemente menos de unos 300 MB, lo que sugiere un modelo de tamaño moderado; se trata de una estimación por tamaño de fichero, no de un dato publicado.
- GPU recomendadas: no disponibles. La model card no especifica requisitos de GPU, ni para entrenamiento ni para inferencia.
- GPU de consumo: no confirmado por el autor. Por el tamaño de los artefactos es plausible que quepa en GPU de consumo (por ejemplo, series RTX 30xx o 40xx), pero esta afirmación no está respaldada por documentación del modelo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un agente de control. El uso previsto es cargar `policy.pt` con PyTorch dentro del código de investigación de Mulligan, en los commits indicados (`3053203fc3df`).
- Latencia y throughput: no disponibles. Al emplear un actor de difusión, el coste por acción vendrá dominado por el número de pasos de muestreo del proceso de difusión, parámetro que no se detalla en la información proporcionada.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch; deben cargarse únicamente en entornos de confianza, tal y como advierte la propia model card.
- Almacenamiento: 1,4 GB para el repositorio completo; menos de 300 MB si solo se descarga una semilla.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Parámetros | Contexto | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| sim-square-narrow-r03-mulligan-divl (este) | sim-square-narrow | Actor de difusión congelado + crítico DIVL distribucional | no disponible | no aplica | 7618-7755 éxitos sobre 8000 por semilla (5 semillas) | MIT | HuggingFace, 1,4 GB, 0 descargas |
| sim-square-narrow-r03-mulligan-idql | sim-square-narrow | Actor de difusión + crítico de tipo IDQL (modelo padre) | no disponible | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | HuggingFace |
| Otros brazos de la ronda R3 del proyecto Mulligan | sim-square-narrow | no disponible | no disponible | no aplica | no disponible | no disponible en la información proporcionada | Parcialmente visibles en la organización mulligan; sin ficha detallada en la información disponible |
| Agentes de RL offline genéricos (IQL, CQL, TD3+BC) | Manipulación robótica simulada | Actor-crítico determinista o estocástico, sin actor de difusión | no disponible | no aplica | no comparables directamente con esta campaña | Varía según implementación | Repositorios de investigación públicos |

No se dispone de datos suficientes para una comparación cuantitativa homogénea con alternativas: la campaña Mulligan no publica en esta información el rendimiento de otros brazos bajo la misma rejilla de evaluación, más allá de la referencia al modelo padre idql.

## Limitaciones y advertencias

- Dominio restringido: el modelo está entrenado exclusivamente para la tarea sim-square-narrow en simulación; no se ha validado en otros entornos ni en hardware real.
- Observaciones de estado sin visión: los conjuntos de datos asociados contienen observaciones de estado sin grabaciones de cámara, por lo que el agente no dispone de percepción visual y depende de que el vector de estado esté disponible y sea consistente.
- Riesgo de sobreajuste a la distribución de datos: al ser una política entrenada con datos de teleoperación y DAgger, es probable que degrade su rendimiento ante estados iniciales fuera de la distribución cubierta por la rejilla de evaluación.
- Sin datos de sesgo en sentido sociotécnico: no aplica el análisis habitual de sesgos lingüísticos, pero sí existe riesgo de sesgo hacia las trayectorias de los operadores humanos que generaron los datos de teleoperación.
- Riesgo de fallo silencioso en producción: la tasa de error media ronda el 3,5 % de los rollouts, con variación entre semillas; en un uso real esto implica fallos de manipulación no anunciados.
- Trazabilidad dependiente de infraestructura externa: los checkpoints apuntan a artefactos de Weights & Biases y a un commit concreto de Git; sin acceso a ese código, la reproducibilidad queda limitada al propio fichero de pesos.
- Licencia permisiva con matices prácticos: la licencia MIT permite uso comercial y modificación, pero no se documentan patentes, condiciones de los datos de origen ni restricciones derivadas de los datasets de teleoperación.
- Seguridad al cargar: los `.pt` son pickles de PyTorch y pueden ejecutar código arbitrario; deben cargarse solo desde fuentes de confianza.
- Ausencia de métricas de eficiencia: no se publican latencias, frecuencia de control ni coste computacional del muestreo del actor de difusión, datos necesarios para integrar el modelo en un lazo de control en tiempo real.
- Madurez temprana del repositorio: cero descargas y cero likes en el momento de redactar esta ficha, y fecha de actualización idéntica a la de creación, lo que indica que no ha habido revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-idql
- Proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page
- Organización en HuggingFace: https://huggingface.co/mulligan
- Conjunto de datos de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Datos de teleoperación inicial: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- DAgger ronda 1: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Rollouts de política ronda 1: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- DAgger ronda 2: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan
- Rollouts de política ronda 2: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- DAgger ronda 3: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mulligan
- Rollouts de política ronda 3: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- DAgger mixto ronda 3: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mixed
- Referencia externa al conjunto de datos de rollouts de la ronda 3: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-mulligan-policy-rollouts
