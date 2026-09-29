# mulligan/sim-square-narrow-r01-mulligan-divl

## Resumen

`sim-square-narrow-r01-mulligan-divl` es un checkpoint de política de aprendizaje por refuerzo para robótica, publicado por el proyecto Mulligan (organización `mulligan` en Hugging Face). No es un modelo de lenguaje: es un agente basado en estado que resuelve la tarea de manipulación simulada `sim-square-narrow`. El artefacto contiene un actor de difusión congelado, heredado del modelo padre `sim-square-narrow-r01-mulligan-idql`, junto con un crítico DIVL de tipo distribuido; los pesos se distribuyen como `policy.pt` más `stats.json`.

Forma parte de la ronda R1 de la campaña `sq_d0_r1_ours_mining_beta05_freecf_human_only` y se publica con cinco semillas independientes (seed-1 a seed-5), todas entrenadas hasta el paso 150001. El repositorio ocupa 1,4 GB y se distribuye bajo licencia MIT. No tiene descargas ni valoraciones en el momento de la consulta.

Su interés es metodológico: permite comparar críticos distribuidos (DIVL) frente a la variante IDQL sobre exactamente el mismo actor congelado, y sirve como generador de rollouts para bucles de auto-mejora tipo DAgger. Las evaluaciones publicadas sobre una rejilla de estados iniciales retenida dan tasas de éxito de entre el 92,24 % y el 94,71 % según semilla (media del 93,53 % sobre 40.000 rollouts).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado: actor de difusión congelado (heredado del padre IDQL) + crítico DIVL distribuido |
| Parametros totales | no disponible (la model card no declara recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (observaciones de estado por paso, tipo state-only; no se especifica ventana de historial) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precision nativa de PyTorch, sin variantes GGUF, int8 ni similares |
| Idiomas soportados | no aplica (modelo de control robotico, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`): `policy.pt` y `stats.json` por semilla |
| Tarea | sim-square-narrow (manipulacion simulada de pieza cuadrada en hueco estrecho) |
| Ronda / arm | R1 / mulligan |
| Celda de campana | `sq_d0_r1_ours_mining_beta05_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Modelo padre (actor congelado) | `mulligan/sim-square-narrow-r01-mulligan-idql` |
| Commit de codigo | `da3e816c1b0f` |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

El agente es un actor-crítico para control continuo. El actor es una política de difusión que no se entrena en esta ronda: se hereda congelado del modelo `sim-square-narrow-r01-mulligan-idql`. La aportación específica de este checkpoint es el crítico DIVL (distributional implicit value learning, según la nomenclatura del propio autor), que modela la distribución del retorno en lugar de solo su esperanza. Al mantener fijo el actor, la campaña aísla el efecto del crítico sobre el rendimiento final.

Los identificadores de los artefactos de Weights & Biases (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indican que la pila de entrenamiento combina IQL, DDPG+BC, IDQL y DIVL sobre el entorno de ensamblaje de pieza cuadrada. La celda de campaña `beta05_freecf_human_only` sugiere un coeficiente beta de 0,5, un esquema sin *counterfactual* (free CF) y datos exclusivamente humanos, aunque la model card no documenta el significado exacto de estos parámetros. El entrenamiento usa tres conjuntos de datos: teleoperación (`sim-square-narrow-c00-teleop-sobol`), datos DAgger (`sim-square-narrow-c01-dagger-mulligan`) y rollouts de una política Sobol (`sim-square-narrow-c01-sobol-policy-rollouts`), lo que corresponde a un bucle iterativo de recogida de datos y reentrenamiento. Cada semilla se entrenó de forma independiente durante 150.001 pasos.

## Capacidades

- Control continuo de un manipulador simulado a partir de observaciones de estado (sin píxeles), orientado a la tarea `sim-square-narrow`.
- Resolución de una tarea de inserción/ensamblaje estrecha con tasas de éxito superiores al 92 % en todos los seeds evaluados.
- Estabilidad entre semillas: la variación de rendimiento entre los cinco seeds es de 1,16 puntos porcentuales de desviación típica, un indicador de reproducibilidad del procedimiento de entrenamiento.
- Aprendizaje por refuerzo offline con crítico distribuido, útil como referencia metodológica frente a críticos basados solo en valor esperado.
- Generación de rollouts de política para bucles de auto-mejora (los datos resultantes se publican como conjuntos de datos DAgger y de rollouts).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa; es una política de control, no un generador de texto.

## Casos de uso

- Investigación en RL offline y offline-to-online: sirve como punto de partida reproducible para estudiar cómo afecta un crítico distribuido al rendimiento de una política de difusión congelada, con cinco semillas ya entrenadas.
- Comparación de algoritmos en robótica: al compartir el mismo actor que `sim-square-narrow-r01-mulligan-idql`, permite aislar el efecto de DIVL frente a IDQL en la misma tarea, sin contaminar la comparación con diferencias de política.
- Generación de datos de entrenamiento para DAgger: la política puede ejecutarse en el simulador para producir trayectorias etiquetadas que alimenten la siguiente ronda de la campaña.
- Evaluación en banco de pruebas público: el proyecto mantiene Policy Arena, donde estos checkpoints pueden compararse contra otras políticas sobre la misma rejilla de estados iniciales retenida.
- Reproducción de experimentos: los ficheros son copias byte a byte de los artefactos de W&B, con MD5 verificado contra el manifiesto y SHA-256 registrado en `release.json`, lo que permite auditar la procedencia de cada resultado.
- Docencia y prototipado en robótica simulada: es un caso compacto (1,4 GB para cinco semillas) de pipeline de RL con datos de teleoperación, DAgger y rollouts, adecuado para cursos o prácticas de manipulación.
- Base para transferencia sim-to-real: la política puede actuar como inicialización o como profesor en destilación hacia un controlador desplegable, siempre que se valide antes la brecha de simulación a realidad, que este artefacto no documenta.
- Integración en infraestructuras de entrenamiento auto-mejorado: el checkpoint encaja en un bucle que evalúe políticas, seleccione las mejores y vuelva a lanzar DAgger con los datos minados (la celda incluye explícitamente `mining`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a una política de control. La model card incluye únicamente la evaluación interna sobre una rejilla de estados iniciales retenida (`sim-square-narrow-r00-r03-eval`):

| Carpeta | Conjunto de evaluacion | N | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 32 | 7577/8000 | 94,71 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 32 | 7379/8000 | 92,24 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 32 | 7405/8000 | 92,56 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 32 | 7473/8000 | 93,41 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 32 | 7576/8000 | 94,70 % |
| Total | sim-square-narrow-r00-r03-eval | 160 | 37410/40000 | 93,53 % |

Estadísticas derivadas del total agregado: media del 93,53 %, desviación típica entre semillas de 1,16 puntos porcentuales, mínimo del 92,24 % (seed-2) y máximo del 94,71 % (seed-1). La model card no detalla cómo se descomponen los 8000 rollouts por carpeta ni qué representa exactamente la columna N (32), por lo que conviene consultar el conjunto de datos de evaluación para interpretar estas cifras.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. La política consume vectores de estado, no imágenes, y el repositorio completo de cinco semillas ocupa 1,4 GB (si el tamaño se reparte de forma uniforme, unos 280 MB por semilla, estimación no confirmada por el autor). Un forward pass de una red de este tipo cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no especificadas. Para inferencia bastan GPU de gama media o incluso CPU; para reentrenar con los mismos volúmenes de datos conviene una GPU con 24 GB o más (RTX 4090, A100, H100) si se replica el pipeline completo de RL.
- ¿Cabe en GPU de consumo? Sí, con alta probabilidad, dado que el actor opera sobre observaciones de estado de baja dimensionalidad; no se publica una cifra verificada de memoria.
- Opciones de despliegue: no se documentan. Los formatos publicados son únicamente PyTorch (`.pt`), por lo que el despliegue pasa por cargar los pesos en el código de investigación de Mulligan en el commit `da3e816c1b0f`. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible. Al no publicarse especificaciones de la red ni mediciones de inferencia, no es posible estimar tiempos por paso con rigor.
- Advertencia de carga: los ficheros `.pt` son pickles de PyTorch; deben cargarse solo en entornos de confianza, tal como indica la propia model card.

## Comparativa con modelos similares

| Modelo | Tarea | Actor | Critico | Semillas | Exito medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| sim-square-narrow-r01-mulligan-divl | sim-square-narrow | Difusion congelado (heredado) | DIVL distribuido | 5 | 93,53 % | MIT | Hugging Face, 0 descargas, 0 likes |
| sim-square-narrow-r01-mulligan-idql | sim-square-narrow | Difusion | IDQL | no disponible | no disponible | no disponible | Hugging Face (citado como origen del actor) |
| Politicas baseline de la campana (rollouts Sobol) | sim-square-narrow | no disponible | no aplica | no disponible | no disponible | no disponible | Solo se publican los rollouts como conjunto de datos |

La informacion disponible no incluye otros checkpoints comparables de la misma categoria (misma tarea y tamano). La comparacion mas directa posible es contra el modelo padre IDQL, del que procede el actor congelado, pero no se han facilitado sus cifras de evaluacion ni su licencia. No se dispone tampoco de comparaciones con politicas de otros proyectos de robotica.

## Limitaciones y advertencias

- Alcance muy restringido: la politica esta especializada en la tarea `sim-square-narrow`. No hay evidencia de generalizacion a otras tareas de manipulacion ni a variaciones del entorno no cubiertas por la rejilla de evaluacion.
- Solo simulación: no se documenta ninguna validacion en robot real. Cualquier uso fisico exigiria un estudio de sim-to-real que este artefacto no respalda.
- Sin percepcion visual: las observaciones son de estado (state-only), por lo que no puede desplegarse con entradas de camara sin reentrenar el actor.
- Tasa de fallo no despreciable: entre el 5,29 % y el 7,76 % de los rollouts fallan segun la semilla. En un entorno de produccion eso implica necesidad de deteccion de fallo y recuperacion.
- Evaluacion autodeclarada: las cifras de exito provienen del propio proyecto, sobre una rejilla de estados iniciales retenida de la misma tarea, sin replicacion independiente. Las 0 descargas y 0 likes indican ausencia de validacion por terceros.
- Riesgo de seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch y su deserializacion puede ejecutar codigo arbitrario. La model card recomienda explicitamente cargarlos solo en entornos de confianza.
- Dependencia del codigo de investigacion: la reproducibilidad depende del commit `da3e816c1b0f` del repositorio de Mulligan, que no se distribuye junto con los pesos en este repositorio.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con conservacion del aviso de copyright, pero no ofrece garantias ni soporte. Conviene revisar los terminos de los artefactos de W&B y de los conjuntos de datos enlazados, que son fuentes distintas del checkpoint.
- Documentacion incompleta: no se declaran parametros totales, composicion exacta del dataset, hiperparametros de entrenamiento ni requisitos de hardware. El significado preciso de la celda de campana (`beta05`, `freecf`, `human_only`) no se explica en la model card.
- Idiomas y texto: al no ser un modelo de lenguaje, no procede evaluar sesgos linguisticos, tool calling ni alucinacion de texto; el modo de fallo relevante es el fallo de la tarea de manipulacion.
- Fechas de publicacion y creacion en 2026-09-29, con actualizacion el mismo dia; no hay historial posterior de mantenimiento en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulligan/sim-square-narrow-r01-mulligan-divl
- Modelo padre (actor congelado, IDQL): https://huggingface.co/mulligan/sim-square-narrow-r01-mulligan-idql
- Organizacion Mulligan en Hugging Face: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Dataset de rollouts de politica Sobol: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Ficha externa del dataset DAgger (Claru): https://claru.ai/datasets/mulligan-sim-square-narrow-c01-dagger-mulligan
- Listado de conjuntos de datos con la etiqueta sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
