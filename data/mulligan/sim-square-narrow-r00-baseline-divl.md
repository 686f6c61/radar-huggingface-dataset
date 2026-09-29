# mulligan/sim-square-narrow-r00-baseline-divl

## Resumen

sim-square-narrow-r00-baseline-divl es un agente de control robótico desarrollado por el proyecto Mulligan, publicado en Hugging Face bajo la organización mulligan. No es un modelo de lenguaje: se trata de una política de aprendizaje por refuerzo para la tarea de simulación sim-square-narrow, orientada a manipulación (el nombre de los artefactos de entrenamiento hace referencia a NutAssemblySquare, una tarea estándar de ensamblaje). El modelo combina un actor de difusión congelado, heredado del checkpoint sim-square-narrow-r00-baseline-idql, con un crítico distributional denominado DIVL.

El artefacto se enmarca en la ronda R0 y en el brazo "baseline" de la campaña `sq_d0_r0_baseline_uniform`. Se publican cinco checkpoints, uno por semilla (1 a 5), todos correspondientes al paso de entrenamiento 150001, con el objetivo de permitir comparaciones reproducibles y medir la varianza entre semillas. Cada carpeta contiene `policy.pt` y `stats.json`.

Su relevancia es metodológica más que de producto: sirve como línea base congelada y reproducible para investigar sobre aprendizaje por refuerzo offline y offline-to-online en robótica, así como para evaluar críticos distributionales frente a alternativas en el marco de Policy Arena de Mulligan. El repositorio ocupa 1,4 GB y se distribuye con licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico: actor de difusión (congelado, heredado de sim-square-narrow-r00-baseline-idql) más crítico distributional DIVL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (agente basado en estado, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; los pesos son pickles de PyTorch) |
| Idiomas soportados | no aplica (modelo de control robótico, sin interfaz de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle: `policy.pt` y `stats.json` (un directorio por semilla) |
| Tarea | sim-square-narrow (manipulación/ensamblaje en simulación) |
| Ronda del modelo | R0 |
| Brazo | baseline |
| Celda de campaña | `sq_d0_r0_baseline_uniform` |
| Semillas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 1,4 GB |
| Dataset de entrenamiento | `mulligan/sim-square-narrow-c00-teleop-baseline` |

## Arquitectura y entrenamiento

La model card describe el agente como "state-based", es decir, con observaciones de estado en lugar de píxeles, y con dos componentes diferenciados: el actor es una política de difusión congelada que proviene del modelo sim-square-narrow-r00-baseline-idql, y el crítico es un crítico distributional DIVL. La model card no desarrolla las siglas DIVL ni detalla la definición formal del crítico. Los nombres de los artefactos de W&B asociados a los checkpoints (`iql_ddpg_bc_idql_divl_nutassemblysquare_...` y el run `self-improving/square-dagger-mining-01a/...`) indican que el pipeline de investigación combina componentes de IQL, DDPG, behavioural cloning (BC), IDQL y DIVL, aunque no se especifica en la información disponible cómo se componen exactamente durante el entrenamiento.

Los checkpoints son copias idénticas a nivel de bytes de los artefactos de W&B, con verificación MD5 contra el manifiesto del artefacto y SHA-256 registrado en `release.json`. Todos los seeds comparten el mismo commit de Git (`3053203fc3df`) y el mismo paso de entrenamiento (150001), de modo que las diferencias entre carpetas corresponden a la semilla de entrenamiento. No se indica el número de tokens, episodios ni muestras de transiciones empleadas, ni si hubo fases de RLHF o DPO (categorías que, por otra parte, no aplican directamente a este tipo de agente). La model card tampoco describe innovaciones de decodificación especulativa, atención lineal ni mecanismos equivalentes.

## Capacidades

- Control robótico basado en estado para la tarea sim-square-narrow: el agente genera acciones a partir de observaciones de estado, no de texto ni de imágenes.
- Política generativa de difusión: el actor produce acciones mediante un proceso de difusión, en lugar de una regresión directa de la acción.
- Estimación de valor con crítico distributional (DIVL), que modela la distribución del retorno en lugar de únicamente su media.
- Reproducibilidad por semilla: se publican cinco semillas independientes entrenadas hasta el paso 150001, lo que permite analizar la dispersión de resultados.
- Reutilización de actor congelado: al compartir el actor con sim-square-narrow-r00-baseline-idql, es posible aislar el efecto del crítico en experimentos comparativos.
- No dispone de tool calling ni function calling: es un agente de control, no un modelo de lenguaje.
- No dispone de capacidades de agente conversacional ni de razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingües (no hay procesamiento de lenguaje).
- No se documenta capacidad de visión, audio ni modo de "pensamiento" (thinking mode).

## Casos de uso

- Línea base reproducible en investigación de RL robótico: los cinco checkpoints al mismo paso de entrenamiento permiten comparar nuevos métodos contra un punto de referencia estable y cuantificar si las mejoras superan la varianza entre semillas.
- Evaluación de críticos distributionales: al mantener el actor congelado y variar el crítico (DIVL frente a otras variantes del pipeline, como las etiquetadas IDQL o IQL en los artefactos), se puede medir el impacto aislado del estimador de valor.
- Generación de datos de entrenamiento por minería tipo DAgger: los runs asociados (`square-dagger-mining-01a`) sugieren que la política se usa para generar nuevas trayectorias que alimentan rondas posteriores de entrenamiento.
- Inicialización de políticas para rondas siguientes: al ser un artefacto de la ronda R0, es un punto de partida natural para experimentos de mejora iterativa (R1, R2, R3) sobre la misma tarea.
- Validación de pipelines de simulación antes de transferencia a hardware: permite verificar que la tarea sim-square-narrow, el espacio de acciones y las métricas de éxito funcionan correctamente antes de invertir en experimentos con un robot real.
- Análisis de robustez frente a estados iniciales: la evaluación se realiza sobre una rejilla de estados iniciales retenidos, lo que permite estudiar en qué regiones del espacio de estados falla la política.
- Benchmarking en Policy Arena: la model card enlaza explicitamente el entorno de evaluaciones de Mulligan, de modo que el modelo puede registrarse y compararse públicamente con otras políticas de la misma campaña.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados son las evaluaciones sobre una rejilla de estados iniciales retenidos, con resultados por rollout en el dataset `sim-square-narrow-r00-r03-eval`.

| Semilla | Conjunto de evaluación | N | Éxitos | Tasa de éxito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 32 | 5509/8000 | 68,9 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 32 | 5727/8000 | 71,6 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 32 | 5860/8000 | 73,3 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 32 | 5768/8000 | 72,1 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 32 | 5455/8000 | 68,2 % |
| Media de las cinco semillas | sim-square-narrow-r00-r03-eval | 32 | 28319/40000 | 70,8 % |

La model card no detalla qué representa la columna N (32) en relación con el denominador de 8000 rollouts por semilla, ni las condiciones exactas de la rejilla de estados iniciales. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras de memoria ni de tamaño por semilla. El repositorio completo (cinco semillas) ocupa 1,4 GB, por lo que el conjunto de pesos es de escala reducida.
- Al tratarse de una política de control con observaciones de estado de baja dimensión para una única tarea, la huella de memoria es previsiblemente muy inferior a la de un modelo de lenguaje; cualquier GPU moderna con unos pocos gigabytes de VRAM debería bastar, aunque esta afirmación es una inferencia y no un dato publicado.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la información proporcionada.
- Encaje en GPU de consumo: no confirmado explícitamente, pero el tamaño del repositorio (1,4 GB para cinco checkpoints) hace plausible la ejecución en GPU de consumo; no se aportan pruebas ni requisitos oficiales.
- Opciones de despliegue: carga directa con PyTorch desde los ficheros `policy.pt` y `stats.json`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este artefacto.
- Latencia y throughput: no disponibles. Al emplear un actor de difusión, el coste de inferencia depende del número de pasos de denoising, que no se especifica en la model card.

## Comparativa con modelos similares

La búsqueda web realizada no ha devuelto políticas robóticas comparables con datos públicos de rendimiento. El único modelo directamente relacionado que aparece en la documentación es el ancestro del actor.

| Modelo | Relación | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-narrow-r00-baseline-divl | Este modelo | no disponible | no aplica | 70,8 % de éxito de media en 5 semillas | MIT | Hugging Face |
| sim-square-narrow-r00-baseline-idql | Origen del actor congelado | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Hugging Face |

No se dispone de comparativas con otras familias de políticas (por ejemplo, políticas de difusión alternativas o métodos de RL offline de otros autores) dentro de la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y en un agente de control el equivalente relevante sería un análisis de cobertura de estados y de fallos sistemáticos, que no se aporta.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de acciones fuera de distribución cuando el agente se enfrenta a estados no vistos durante el entrenamiento.
- Limitaciones de contexto: el agente está entrenado para una única tarea (sim-square-narrow) y no es transferible a otras tareas sin reentrenamiento o ajuste.
- Limitaciones de idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright y la licencia.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch. Cargarlos ejecuta código Python arbitrario contenido en el fichero, por lo que la propia model card recomienda cargarlos únicamente en un entorno de confianza.
- Advertencia de reproducibilidad: los pesos son copias byte a byte de artefactos de W&B, con integridad verificada por MD5 y SHA-256, pero el código de investigación no se distribuye en este repositorio; solo se indican los commits de Git empleados.
- Caveat para producción: es un artefacto de investigación de la ronda R0, con 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia publicada de despliegue en robots reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulligan/sim-square-narrow-r00-baseline-divl
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización mulligan en Hugging Face: https://huggingface.co/mulligan
- Modelo del que procede el actor congelado: https://huggingface.co/mulligan/sim-square-narrow-r00-baseline-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset relacionado de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Explorador de datasets con la etiqueta sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
