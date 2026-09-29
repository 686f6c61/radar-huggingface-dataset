# mulligan/sim-square-broad-r00-baseline-divl

## Resumen

`mulligan/sim-square-broad-r00-baseline-divl` es un agente de control robótico basado en estado, publicado por la organización Mulligan dentro de su infraestructura de investigación y evaluación en robótica. Corresponde a la ronda de modelo R0, brazo `baseline`, celda de campaña `sq_d1_r0_baseline_uniform`, sobre la tarea simulada `sim-square-broad`. El repositorio ocupa 1,4 GB y contiene cinco carpetas (una por semilla: 1 a 5), cada una con los ficheros `policy.pt` y `stats.json`, correspondientes al paso de entrenamiento 250001.

El modelo combina un actor de difusión congelado, heredado del modelo padre `sim-square-broad-r00-baseline-idql`, con un crítico DIVL de tipo distributional. Se entrenó sobre el dataset de teleoperación `mulligan/sim-square-broad-c00-teleop-baseline`. Su función principal es servir como referencia reproducible (baseline) frente a otras rondas y brazos experimentales de la misma campaña, con evaluación sobre una rejilla de estados iniciales reservada.

La relevancia actual es metodológica más que de capacidad: todos los checkpoints son copias byte a byte de artefactos de Weights & Biases, con verificación MD5 contra el manifiesto del artefacto y SHA-256 registrado en `release.json`, lo que permite trazabilidad completa entre pesos, runs de entrenamiento y commit de código (`3053203fc3df`). No es un modelo de lenguaje ni un modelo visión-lenguaje-acción: no procesa texto ni imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Actor de difusión (diffusion policy) congelado + crítico DIVL distributional; agente basado en estado |
| Parámetros totales | No disponible (no se publica el recuento de parámetros) |
| Parámetros activos | No aplicable (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No aplicable (política de control; consume observaciones de estado, no secuencias de texto) |
| Tipos de cuantización | No aplicable. Los pesos se distribuyen sin cuantización, en formato PyTorch `.pt` |
| Idiomas soportados | No aplicable (no procesa ni genera lenguaje natural; la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (pickles) y `stats.json` por semilla |

## Arquitectura y entrenamiento

El agente es un policy state-based que reutiliza el actor de difusión del modelo `sim-square-broad-r00-baseline-idql` en estado congelado, y añade un crítico DIVL de tipo distributional. La model card describe explícitamente esa composición ("parent's frozen diffusion actor and a distributional DIVL critic") y entrega como artefactos `policy.pt` y `stats.json`. Los identificadores de los runs de W&B asociados (`iql_ddpg_bc_idql_divl_square_d1_...`) apuntan a una combinación de componentes de aprendizaje por imitación y aprendizaje por refuerzo offline (IQL, DDPG+BC, IDQL) junto con el componente DIVL; esta lectura procede de los nombres de los artefactos y no está desarrollada en la documentación publicada.

Los checkpoints se entrenaron hasta el paso 250001 con cinco semillas independientes (semillas 1 a 5), todas bajo el mismo commit de código `3053203fc3df`. Los datos de entrenamiento son el dataset de teleoperación `mulligan/sim-square-broad-c00-teleop-baseline`. No se publican en la información disponible el número de transiciones, la composición del dataset, el esquema de recompensas, ni detalles sobre fases de ajuste tipo RLHF/DPO (que no aplican a este tipo de modelo). Tampoco se documentan innovaciones de inferencia como decodificación especulativa.

## Capacidades

- Control robótico en simulación para la tarea `sim-square-broad`, a partir de observaciones de estado (no de píxeles).
- Generación de acciones mediante un actor de difusión preentrenado y congelado, complementado por un crítico distributional para la estimación de valor.
- Evaluación multi-semilla: el repositorio incluye cinco políticas independientes, lo que permite medir varianza entre semillas.
- Integración en infraestructura de comparación: los checkpoints se referencian en los metadatos del dataset de evaluación `sim-square-broad-r00-r03-eval`.
- Exportación de estadísticas de normalización junto a los pesos (`stats.json`), necesarias para reproducir el preprocesado de observaciones.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües.
- No tiene visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Baseline de referencia en experimentos de RL offline: cualquier nuevo brazo de la campaña `sim-square-broad` puede compararse contra estos cinco checkpoints para aislar el efecto de la modificación introducida.
- Estudio de la varianza entre semillas: al disponer de cinco políticas entrenadas hasta el mismo paso (250001) sobre la misma tarea, permite estimar la dispersión de resultados atribuible únicamente a la inicialización.
- Evaluación de críticos distributionales: al separar actor congelado y crítico DIVL, el modelo sirve para analizar el comportamiento del crítico sin que el actor cambie durante el análisis.
- Reproducción de resultados publicados: los artefactos son copias verificadas (MD5 y SHA-256) de los runs originales, de modo que se puede replicar la evaluación sin depender del estado de W&B.
- Punto de partida para ajuste posterior: el actor congelado y los pesos resultantes pueden usarse como inicialización en experimentos de refinamiento o de destilación sobre la misma tarea simulada.
- Docencia y prototipado en robótica simulada: el tamaño del repositorio (1,4 GB para cinco semillas) y la licencia Apache-2.0 facilitan su uso en entornos académicos para ilustrar pipelines de aprendizaje por imitación con actores de difusión.
- Auditoría de pipelines de datos: al estar vinculado al dataset de teleoperación y al dataset de evaluación, permite verificar la coherencia entre datos de entrenamiento, checkpoints y resultados reportados.

## Benchmarks y rendimiento

La model card publica únicamente resultados de éxito sobre una rejilla de estados iniciales reservada (held-out), con N=32 por semilla y 30000 rollouts por semilla según el dataset `sim-square-broad-r00-r03-eval`. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, porque el modelo no es un modelo de lenguaje.

| Semilla | N (estados iniciales) | Éxitos / rollouts | Tasa de éxito |
|---|---|---|---|
| seed-1 | 32 | 14710 / 30000 | 49,03 % |
| seed-2 | 32 | 15486 / 30000 | 51,62 % |
| seed-3 | 32 | 14104 / 30000 | 47,01 % |
| seed-4 | 32 | 14571 / 30000 | 48,57 % |
| seed-5 | 32 | 14674 / 30000 | 48,91 % |

La horquilla entre semillas va del 47,01 % al 51,62 % de éxito, con una media aproximada del 49,03 %. No se publican métricas adicionales (retorno medio, longitud de episodio, tasas de éxito por estado inicial) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican requisitos de memoria ni tamaño de parámetros.
- Estimación orientativa: el repositorio completo ocupa 1,4 GB para cinco semillas, es decir, en torno a 280 MB por semilla incluyendo `policy.pt` y `stats.json`; se trata de una cifra derivada del tamaño del repositorio, no de una especificación publicada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; dado el tamaño del artefacto por semilla, es plausible que quepa en GPU de consumo, pero no hay confirmación del autor.
- Opciones de despliegue: no se documentan. No hay integración declarada con vLLM, llama.cpp, Ollama ni TGI (ninguna de ellas aplica a una política de control en PyTorch).
- Latencia y throughput: no disponibles.
- Requisito operativo relevante: los `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza.

## Comparativa con modelos similares

No se dispone de datos publicados de otros agentes comparables salvo el modelo padre, del que este hereda el actor.

| Modelo | Relación | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mulligan/sim-square-broad-r00-baseline-divl` | Este modelo: actor de difusión congelado + crítico DIVL | No disponible | No aplicable | 47,01 %–51,62 % de éxito (5 semillas) | apache-2.0 | HuggingFace, 1,4 GB |
| `mulligan/sim-square-broad-r00-baseline-idql` | Modelo padre; aporta el actor de difusión congelado | No disponible | No aplicable | No disponible en esta búsqueda | apache-2.0 (según la referencia del propio autor) | HuggingFace |
| Otros brazos de la campaña `sim-square-broad` | No disponible | No disponible | No aplicable | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Rendimiento limitado: la tasa de éxito se sitúa entre el 47,01 % y el 51,62 %, es decir, aproximadamente la mitad de los rollouts evaluados no tienen éxito.
- Varianza entre semillas de más de cuatro puntos porcentuales (47,01 % a 51,62 %), lo que obliga a reportar intervalos y no un único valor al comparar contra otros brazos.
- Específico de una única tarea simulada (`sim-square-broad`); no hay evidencia de transferencia a otras tareas ni a entornos reales.
- Entrada basada en estado: no acepta imágenes ni texto, por lo que no puede emplearse en pipelines multimodales ni en robótica que requiera percepción visual directa.
- Sesgos conocidos: no se documentan sesgos específicos; al depender de un dataset de teleoperación, hereda las limitaciones de cobertura y las regularidades de las demostraciones humanas registradas, no detalladas en la model card.
- Riesgo de alucinación: no aplicable en el sentido de generación de lenguaje; el riesgo análogo es la generalización incorrecta a estados iniciales fuera de la distribución evaluada.
- Limitaciones de idioma: no aplicable, el modelo no procesa lenguaje.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no se ofrece ninguna garantía ni soporte por parte del autor.
- Seguridad de los artefactos: los ficheros `.pt` son pickles de PyTorch y deben cargarse solo en entornos de confianza, tal como advierte la propia model card.
- Trazabilidad: la reproducibilidad depende de los commits de código indicados (`3053203fc3df`) y de los artefactos de W&B referenciados; fuera de ese entorno no se garantiza una réplica exacta del entrenamiento.
- Adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r00-baseline-divl
- Modelo padre (actor de difusión congelado): https://huggingface.co/mulligan/sim-square-broad-r00-baseline-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
