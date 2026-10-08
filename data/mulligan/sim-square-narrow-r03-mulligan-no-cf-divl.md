# mulligan/sim-square-narrow-r03-mulligan-no-cf-divl

## Resumen

`mulligan/sim-square-narrow-r03-mulligan-no-cf-divl` es un agente de control para robótica basado en estado (state-based), entrenado para la tarea simulada `sim-square-narrow`. No es un modelo de lenguaje: es una política de manipulación compuesta por un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r03-mulligan-no-cf-idql`, y un crítico DIVL (Distributional Inverse soft-Q / distributional value learning) entrenado específicamente en esta variante. Lo desarrolla el equipo de Mulligan, un proyecto de investigación en aprendizaje por refuerzo offline para robótica.

La relevancia del artefacto está en su carácter comparativo: forma parte de la campaña R3 del brazo `mulligan-no-cf` dentro de la celda experimental `square_narrow_r3_mulligan_no_cf_human_only`, con cinco semillas independientes (1 a 5), cada una entrenada hasta el paso 150.001 y evaluada sobre una rejilla de estados iniciales reservada. El repositorio ocupa 1,4 GB e incluye un directorio por semilla con `policy.pt` y `stats.json`, además de un `release.json` con el SHA-256 de cada fichero.

Para un investigador en RL offline, el interés práctico es doble: por un lado, cuantifica el efecto de sustituir el crítico del modelo padre por un crítico distributional DIVL manteniendo el actor congelado; por otro, publica las cinco semillas con sus resultados de evaluación, lo que permite medir varianza entre semillas en lugar de fiarse de una única ejecución. La tasa de éxito media agregada es del 94,75 % sobre 40.000 rollouts de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusión (congelado, heredado del modelo padre) mas critico DIVL distributional; agente de RL offline basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control sobre observaciones de estado, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch en precision de entrenamiento; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`), acompanado de `stats.json` por semilla y `release.json` con hashes SHA-256 |

Datos adicionales del repositorio:

| Campo | Valor |
|---|---|
| ID en HuggingFace | `mulligan/sim-square-narrow-r03-mulligan-no-cf-divl` |
| Pipeline declarado | robotics |
| Tarea | sim-square-narrow |
| Ronda de modelo | R3 |
| Brazo experimental | mulligan-no-cf |
| Celda de campana | `square_narrow_r3_mulligan_no_cf_human_only` |
| Semillas publicadas | 1, 2, 3, 4 y 5 |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |
| Ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

El agente combina dos componentes. El actor es una política de difusión congelada, tomada tal cual del modelo `sim-square-narrow-r03-mulligan-no-cf-idql`; al estar congelado, no se actualiza durante el entrenamiento de esta variante, de modo que toda la diferencia de comportamiento respecto al padre proviene del crítico. El crítico es de tipo DIVL (distributional), una formulación que modela la distribución del valor en lugar de una estimación puntual, lo que en teoría mejora la estabilidad del aprendizaje offline cuando las recompensas son dispersas o la cobertura del dataset es limitada.

El entrenamiento se realizó exclusivamente sobre datos de interacción humana y de políticas previas, sin componente de coste o restricción (de ahí el sufijo `no-cf`, "no cost function" / sin función de coste), dentro de la celda `square_narrow_r3_mulligan_no_cf_human_only`. El corpus de entrenamiento combina siete datasets: teleoperación con SOBOL (`sim-square-narrow-c00-teleop-sobol`), tres rondas de DAgger con el propio brazo `mulligan-no-cf` (`c01`, `c02` y `c03`) y rollouts de política de SOBOL y de Mulligan en las rondas `c01`, `c02` y `c03`. Esta composición escalonada —teleoperación, agregación de datos con DAgger y rollouts de política— es la innovación metodológica central: cada ronda incorpora las trayectorias generadas por la política de la ronda anterior, ampliando la cobertura del espacio de estados alrededor de los fallos observados.

No se publican en la información disponible el número total de transiciones, la composición exacta por dataset, el esquema de recompensa ni los hiperparámetros del crítico. Las configuraciones de ejecución se referencian como ficheros `release/run-configs/sim-square-narrow-r03-mulligan-no-cf-divl__seed-{1..5}.json`, ubicados en el repositorio de código de Mulligan.

## Capacidades

- Control robótico de manipulación en simulación para la tarea `sim-square-narrow`, a partir de observaciones de estado (no de imágenes ni de lenguaje).
- Política de difusión multimodal: la parametrización por difusión permite representar distribuciones de acción multimodales, útil cuando existen varias trayectorias válidas hacia el objetivo.
- Estimación distributional del valor mediante el crítico DIVL, que modela la distribución del retorno en lugar de solo su media.
- Entrenamiento offline puro: puede entrenarse sin acceso al entorno en tiempo de aprendizaje, a partir de los datasets publicados.
- Evaluación reproducible con cinco semillas independientes, cada una con su propio checkpoint y su propia rejilla de estados iniciales de evaluación.
- Compatibilidad con el marco de trabajo Mulligan: los `run-configs` permiten reproducir el entrenamiento de cada checkpoint desde el repositorio de código.
- No soporta tool calling, function calling, agentes multi-paso con herramientas, ni capacidades multilingües. Tampoco tiene visión, audio ni modo de razonamiento explícito; el nombre `divl-agent` en las etiquetas se refiere al tipo de agente RL, no a un agente conversacional.

## Casos de uso

- Investigación en RL offline comparado: sirve como punto de comparación frente al modelo padre IDQL, ya que comparte el actor congelado y solo cambia el crítico; cualquier diferencia de rendimiento es atribuible al componente de valor.
- Evaluación de la varianza entre semillas: al publicar cinco semillas con resultados individuales (de 7466/8000 a 7684/8000), permite estimar la dispersión real del método y no solo su media, algo poco habitual en artefactos de RL.
- Reproducción de experimentos: los `run-configs` referenciados en la model card permiten reentrenar cada checkpoint desde el repositorio de código de Mulligan, lo que facilita la verificación independiente de los resultados.
- Generación de datos para DAgger: la política puede desplegarse en el simulador para recoger los rollouts de la ronda siguiente, que alimentarían nuevos datasets de agregación como los `c01`-`c03` publicados.
- Destilación y compresión de políticas: al tratarse de un agente basado en estado con pesos compartidos por semilla (aproximadamente 280 MB por semilla, dado que el repositorio de 1,4 GB contiene cinco), es un candidato razonable para destilar a una política más pequeña orientada a control en tiempo real.
- Estudio del sesgo de evaluación: la rejilla de estados iniciales reservada (`sim-square-narrow-r00-r03-eval`, 32 estados iniciales y 8000 rollouts por semilla) permite analizar cómo varía la tasa de éxito según la condición inicial dentro de la misma tarea.
- Base para transferencia sim-a-real: el actor de difusión congelado puede exportarse como punto de partida para ajuste fino con datos reales, aunque la información disponible no documenta ningún experimento de este tipo.
- Integración en plataformas de comparación: los resultados están enlazados desde el dataset de evaluación y desde Policy Arena, de modo que el modelo puede incorporarse a comparativas automatizadas entre brazos y rondas.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son las evaluaciones sobre una rejilla de estados iniciales reservada, con 8000 rollouts por semilla:

| Semilla | Estados iniciales (N) | Exitos / Rollouts | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 7466 / 8000 | 93,33 % |
| seed-2 | 32 | 7560 / 8000 | 94,50 % |
| seed-3 | 32 | 7569 / 8000 | 94,61 % |
| seed-4 | 32 | 7620 / 8000 | 95,25 % |
| seed-5 | 32 | 7684 / 8000 | 96,05 % |
| Agregado | 160 | 37899 / 40000 | 94,75 % |

No se han publicado resultados de benchmarks estándar de RL (por ejemplo, D4RL, RLBench, Meta-World) en la información disponible. Tampoco se publican métricas de eficiencia (latencia de inferencia, frecuencia de control) ni comparaciones numéricas con otros brazos de la misma campaña.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 1,4 GB e incluye cinco semillas, lo que implica del orden de 280 MB por checkpoint; en inferencia, cada semilla necesita cargar únicamente `policy.pt` más `stats.json`.
- GPU recomendadas: no especificadas por el autor. Dado el tamaño del artefacto, cualquier GPU con varios GB de memoria libre debería ser suficiente, pero se trata de una estimación a partir del tamaño del repositorio y no de un dato publicado.
- Idoneidad para GPU de consumo: probablemente sí, en tarjetas tipo RTX 3060 o superiores, por el reducido tamaño del checkpoint. No hay confirmación oficial.
- Opciones de despliegue: el formato es PyTorch pickle (`.pt`), por lo que la carga se realiza con PyTorch y el código de Mulligan. Los servidores de inferencia de modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no son aplicables a este artefacto.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch y deben cargarse únicamente en entornos de confianza, tal como advierte la propia model card.
- Entrenamiento: no se documentan requisitos de cómputo para el entrenamiento (número de GPU, horas, tipo de acelerador).

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Semillas | Tasa de exito (eval publicada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mulligan/sim-square-narrow-r03-mulligan-no-cf-divl` (este) | Actor de difusion congelado + critico DIVL distributional | sim-square-narrow | 5 | 94,75 % agregado (37899/40000) | MIT | HuggingFace, 1,4 GB |
| `mulligan/sim-square-narrow-r03-mulligan-no-cf-idql` | Actor de difusion (origen del actor congelado) + critico IDQL | sim-square-narrow | no disponible | no disponible | no disponible | HuggingFace |
| `mulligan/sim-square-narrow-r03-mulligan-idql` | Agente IDQL de la campana R3 | sim-square-narrow | no disponible | no disponible | no disponible | HuggingFace |
| Otros brazos de la campana R3 (`mulligan-no-cf` y variantes) | no disponible | sim-square-narrow | no disponible | no disponible | no disponible | HuggingFace, filtro `other=sim-square-narrow` |

La comparación directa más informativa es con `sim-square-narrow-r03-mulligan-no-cf-idql`, porque este modelo reutiliza su actor congelado y solo lo diferencia el crítico. Sin embargo, la información disponible no incluye las métricas de evaluación de ese modelo, por lo que no es posible cuantificar la ganancia o pérdida atribuible al crítico DIVL. No se dispone de comparativas con políticas de referencia externas a Mulligan.

## Limitaciones y advertencias

- Especialización extrema: el agente está entrenado para una única tarea (`sim-square-narrow`) con observaciones de estado. No generaliza a otras tareas, morfologías de robot ni modalidades sensoriales sin reentrenamiento.
- Naturaleza offline: al entrenarse solo con los datasets listados, hereda sus sesgos de cobertura. Los estados no visitados durante la recogida de datos quedan fuera de la distribución de entrenamiento y la política puede comportarse de forma imprevisible en ellos.
- Riesgo de fallo silencioso: el 94,75 % de éxito agregado implica aproximadamente un 5,25 % de fallos, con una variación entre semillas de casi tres puntos porcentuales (93,33 % a 96,05 %). En un despliegue real esa dispersión es relevante para dimensionar el margen de seguridad.
- Entorno simulado: no hay evidencia publicada de transferencia a hardware real. La tasa de éxito en simulación no es un predictor fiable del rendimiento físico.
- Sesgos de los datos de teleoperación: la celda se denomina `human_only`, de modo que las políticas aprendidas reflejan las estrategias y limitaciones de los operadores humanos que generaron las demostraciones iniciales.
- Ficheros pickle: los `.pt` son serializaciones de PyTorch y su carga ejecuta código arbitrario contenido en el fichero. Deben tratarse como artefactos no confiables salvo verificación del SHA-256 publicado en `release.json`.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. No hay restricciones adicionales declaradas, pero conviene revisar la licencia de los datasets de entrenamiento por separado, ya que no se detalla en la información disponible.
- Ausencia de métricas de eficiencia: no se publican latencia, frecuencia de control ni coste computacional de inferencia, datos imprescindibles para valorar un despliegue en bucle cerrado.
- Mantenimiento incierto: el artefacto tiene cero descargas y cero likes en el momento de redactar esta ficha, y depende del repositorio de código de Mulligan para reproducir el entrenamiento.
- Idiomas y contexto: no aplica, pero conviene subrayarlo porque las fichas de HuggingFace con `pipeline: robotics` pueden confundirse con modelos generativos. Este modelo no procesa texto ni mantiene conversaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-no-cf-divl
- Modelo padre del actor congelado (IDQL): https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-no-cf-idql
- Variante IDQL de la campana R3: https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-idql
- Organizacion de datasets: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset DAgger ronda 1: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan-no-cf
- Dataset de rollouts SOBOL ronda 1: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset DAgger ronda 2: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan-no-cf
- Dataset de rollouts Mulligan ronda 2: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset DAgger ronda 3: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mulligan-no-cf
- Dataset de rollouts Mulligan ronda 3: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Sitio del proyecto Mulligan: https://mulligan.page
- Plataforma de evaluacion Policy Arena: https://arena.mulligan.page
- Listado de modelos con la etiqueta `sim-square-narrow`: https://huggingface.co/models?other=sim-square-narrow
