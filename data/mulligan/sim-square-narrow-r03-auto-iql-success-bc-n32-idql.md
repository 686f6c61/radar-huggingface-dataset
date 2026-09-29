# mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-idql

# mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-idql

## Resumen

Se trata de un agente de control robotico basado en IDQL (Implicit Q-Learning as an Actor-Critic method), publicado por el usuario mulligan dentro del proyecto Mulligan, una coleccion de politicas y datasets de aprendizaje por refuerzo offline para manipulacion. No es un modelo de lenguaje: es un checkpoint de politica entrenado para la tarea de simulacion `sim-square-narrow`, con un actor de difusion y un critico Q escalar. El repositorio contiene cinco semillas (seed-1 a seed-5), cada una en su propia carpeta, con un fichero `policy.pt` de PyTorch y un `stats.json` con los normalizadores de observaciones y acciones.

El modelo corresponde a la ronda R3 del brazo `auto-iql-success-bc-n32`, dentro de la celda de campana `sq_d0_r3_auto_iql_success_bc_n32`, y fue entrenado hasta el paso 150.001. Los checkpoints son copias byte a byte de artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`. El repositorio ocupa 1,4 GB en total, aproximadamente 280 MB por semilla.

Su relevancia es acotada pero clara: sirve como referencia reproducible para investigacion en RL offline con actores de difusion, como fuente de rollouts sinteticos para ampliar datasets de entrenamiento (el nombre interno de la campana es `square-dagger-mining-01a`, lo que apunta a una mineria iterativa estilo DAgger) y como punto de comparacion cuantitativo dentro de la propia familia, dado que se publican tasas de exito sobre un grid de estados iniciales reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critico IDQL: actor de difusion mas critico Q escalar entrenado con Implicit Q-Learning, sobre observaciones de estado |
| Parametros totales | no disponible (no se desglosa; el repositorio completo pesa 1,4 GB para 5 semillas) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (politica reactiva sobre estado, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en su precision nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica: politica de control robotico, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `policy.pt` (pickle de PyTorch) mas `stats.json` con normalizadores |
| Tarea | sim-square-narrow |
| Ronda del modelo | R3 |
| Brazo / variante | auto-iql-success-bc-n32 |
| Celda de campana | `sq_d0_r3_auto_iql_success_bc_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150.001 |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el planteamiento de IDQL descrito en el articulo arXiv:2304.10573: se reinterpreta IQL como metodo actor-critico, de modo que el critico Q se entrena utilizando unicamente acciones presentes en el dataset mediante un backup de Bellman modificado (regresion por expectil), y el actor es un modelo generativo de difusion ajustado a la distribucion de acciones del dataset. En inferencia, el actor propone acciones por muestreo difusivo y el critico las puntua, de forma que la seleccion final queda sesgada hacia las acciones de mayor valor estimado. En este caso concreto, el agente trabaja con observaciones de estado, no con imagenes, tal como indica la propia model card ("state-based IDQL agent").

El entrenamiento se enmarca en un proceso de mejora iterativa con reciclado de datos. Segun los metadatos, el modelo se entreno sobre cuatro datasets: `sim-square-narrow-c00-teleop-baseline` (demostraciones de teleoperacion), `sim-square-narrow-c01-auto-iql-n32-policy-rollouts` (rollouts de una politica IQL previa), y `sim-square-narrow-c02` y `c03-auto-iql-success-bc-n32-policy-rollouts` (rollouts de una variante con behavior cloning filtrado por exito, con N=32). El nombre de la ejecucion en W&B, `square-dagger-mining-01a` y `iql_ddpg_bc_idql_nutassemblysquare`, sugiere una canalizacion estilo DAgger con recogida de nuevos rollouts y filtrado por exito, si bien la model card no detalla la composicion exacta del dataset, el numero de transiciones totales ni si se aplicaron etapas de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no aplicables aqui). Los cinco checkpoints se entrenaron y evaluaron con el codigo de investigacion de Mulligan en los commits `8c68c6570673`, `f7d05c7d9cdb`, `3bd32b4b1e91`, `0ec8a1209756` y `ea4f0167c037`.

## Capacidades

- Generacion de acciones de control continuo para manipulacion robotica en simulacion, a partir de observaciones de estado (sin vision).
- Ejecucion de la tarea `sim-square-narrow`, que por los nombres de los artefactos de W&B (`nutassemblysquare`) corresponde a una variante estrecha de una tarea de ensamblaje e insercion de tipo nut assembly.
- Control de horizonte largo: la evaluacion se realiza sobre episodios completos, con un grid de 32 estados iniciales y 8.000 intentos de rollout por semilla.
- Inferencia estocastica: el actor de difusion permite muestrear multiples acciones candidatas y reordenarlas con el critico, lo que habilita esquemas de tipo best-of-N (el sufijo `n32` del brazo apunta a ello, aunque la model card no lo documenta de forma explicita).
- Entrenamiento offline puro: no requiere interaccion con el entorno durante el ajuste del critico, lo que permite reutilizar datasets ya recogidos.
- Capacidad de servir como generador de datos: las politicas resultantes se emplean para producir datasets de rollouts que alimentan la siguiente ronda (c01, c02, c03).
- No soporta tool calling ni function calling.
- No soporta orquestacion de agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues, de vision, de audio ni modo de razonamiento explicito.

## Casos de uso

- Referencia reproducible en investigacion de RL offline: el repositorio publica cinco semillas con el mismo paso de entrenamiento (150.001) y los commits exactos del codigo, lo que permite reproducir o auditar los resultados sin depender de un unico checkpoint.
- Generacion de datasets de rollouts para entrenamiento posterior: la propia campana usa las politicas resultantes para producir los datasets `c02` y `c03`, de modo que el modelo es un eslabon directo de un bucle de auto-mejora estilo DAgger con filtrado por exito.
- Evaluacion comparativa de variantes de algoritmo: al compartir tarea, ronda y formato, el checkpoint sirve para aislar el efecto del filtrado por exito y del behavior cloning frente a la variante `c01-auto-iql-n32` sin ese filtrado.
- Analisis de varianza entre semillas: con cinco semillas evaluadas sobre el mismo grid, se puede estudiar la estabilidad del entrenamiento (el rango observado va de 77,05 % a 79,05 % de exito).
- Punto de partida para ajuste fino con teleoperacion: al estar en formato PyTorch estandar, puede inicializarse desde el para experimentos de offline-to-online o de adaptacion a variantes mas amplias de la tarea.
- Evaluacion masiva en simulacion: la politica puede lanzarse en paralelo sobre entornos vectorizados para producir estadisticas de exito sobre miles de estados iniciales, tal como refleja la evaluacion publicada (8.000 rollouts por semilla).
- Docencia y divulgacion de RL offline: es un ejemplo compacto y con licencia permisiva de un actor de difusion con critico IQL aplicado a una tarea de manipulacion, util para cursos y practicas.
- Baseline interno en pipelines de robotica: sirve como referencia contra la que medir politicas nuevas en la misma tarea antes de justificar el coste de evaluaciones en hardware real.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre un grid de estados iniciales reservado, con N=32 y 8.000 intentos por semilla, referenciada por el dataset `sim-square-narrow-r00-r03-eval`.

| Semilla | N (estados iniciales) | Exitos / intentos | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 6175 / 8000 | 77,19 % |
| seed-2 | 32 | 6164 / 8000 | 77,05 % |
| seed-3 | 32 | 6197 / 8000 | 77,46 % |
| seed-4 | 32 | 6324 / 8000 | 79,05 % |
| seed-5 | 32 | 6218 / 8000 | 77,73 % |
| Media | 32 | 31078 / 40000 | 77,70 % |

No se han publicado resultados de benchmarks comparables (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a un modelo de control robotico. Tampoco se publican curvas de aprendizaje, recompensa media por episodio, longitud media de episodio ni comparaciones contra otros algoritmos de RL offline sobre esta misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion a partir del tamano del repositorio (1,4 GB para cinco semillas, aproximadamente 280 MB por semilla incluyendo actor, critico y normalizadores), el checkpoint individual cabe holgadamente en cualquier GPU con mas de 1 GB de memoria, y es viable incluso en CPU.
- GPU recomendadas: no disponible. Al tratarse de una politica de estado con redes de tipo perceptron multicapa y difusion, no requiere GPUs de clase A100 o H100; cualquier GPU consumer reciente es suficiente, y el cuello de botella real estara en la simulacion del entorno, no en la red.
- GPU consumer: si cabe, en practicamente cualquier modelo con al menos 1 GB de VRAM (por ejemplo, GTX 1050 en adelante), aunque no hay confirmacion del autor.
- Opciones de despliegue: carga directa con PyTorch (`policy.pt` mas `stats.json`) y el codigo de investigacion de Mulligan en los commits indicados. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, que son runtimes orientados a modelos de lenguaje y no aplican a este tipo de checkpoint.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por paso de control, frecuencia de inferencia ni coste del muestreo difusivo del actor.
- Advertencia de carga: los ficheros `.pt` son pickles de PyTorch, por lo que deben cargarse unicamente en entornos de confianza.

## Comparativa con modelos similares

No se dispone de resultados de rendimiento de los modelos comparables en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales dentro de la misma campana.

| Modelo | Tarea | Variante | Semillas | Exito publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-narrow-r03-auto-iql-success-bc-n32-idql (este) | sim-square-narrow | auto-iql-success-bc-n32, R3 | 5 | 77,05 % - 79,05 % | MIT | HuggingFace, 0 descargas |
| sim-square-narrow-c01-auto-iql-n32-policy-rollouts | sim-square-narrow | auto-iql-n32 sin filtrado por exito | no disponible | no disponible | no disponible | solo como dataset de rollouts |
| sim-square-narrow-c02 / c03-auto-iql-success-bc-n32-policy-rollouts | sim-square-narrow | auto-iql-success-bc-n32 | no disponible | no disponible | no disponible | solo como datasets de rollouts |
| sim-square-narrow-c00-teleop-baseline | sim-square-narrow | teleoperacion humana | no disponible | no disponible | no disponible | solo como dataset |
| Implementacion de referencia de IDQL (arXiv:2304.10573) | tareas D4RL y otras | IDQL generico | no disponible | no disponible | no disponible | publicacion cientifica |

Los datasets `sim-square-narrow-r00-r03-eval` cubren tambien las rondas R0 a R2 de la misma tarea, pero la model card aqui analizada no desglosa sus cifras, por lo que no es posible una comparacion cuantitativa entre rondas con los datos disponibles.

## Limitaciones y advertencias

- Modelo de dominio unico: solo cubre la tarea `sim-square-narrow` en simulacion. No hay evidencia de transferencia a otras tareas ni a un robot real.
- Entrada limitada a observaciones de estado: no procesa imagenes ni otro tipo de modalidad sensorial.
- Tasa de fallo no trivial: en el mejor caso publicado se alcanza el 79,05 % de exito, lo que implica en torno a un 21 % de episodios fallidos sobre el grid evaluado.
- Varianza entre semillas: el rango de 77,05 % a 79,05 % muestra una dispersion de aproximadamente dos puntos porcentuales atribuible unicamente a la semilla de entrenamiento.
- Riesgo de sesgo por filtrado por exito: el nombre del brazo (`success-bc`) indica que parte de los datos de entrenamiento son rollouts filtrados por exito, lo que puede concentrar la politica en los modos de exito observados y reducir la diversidad de comportamientos.
- Riesgo de sobreajuste al grid de evaluacion: no se documenta si el grid de estados iniciales reservado es representativo de la tarea completa; las cifras no garantizan generalizacion fuera de esa distribucion.
- Sin replicacion externa: los resultados proceden del propio autor y de la misma infraestructura de evaluacion; no hay verificacion independiente.
- Sin validacion en hardware: la model card no menciona despliegue en robot fisico, por lo que no puede asumirse robustez ante ruido de sensores, latencia de actuadores o variaciones de friccion.
- Idiomas: no aplica ni se documenta soporte linguistico alguno.
- Licencia: MIT, permisiva y compatible con uso comercial, pero los datasets enlazados pueden tener condiciones propias no verificadas en esta ficha. La licencia MIT se aplica al codigo y pesos publicados por el autor.
- Seguridad de carga: `policy.pt` es un pickle de PyTorch y puede ejecutar codigo arbitrario al deserializarse; debe cargarse solo en entornos controlados.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni informes de uso en produccion.
- Ausencia de documentacion operativa: no se especifican dimensiones de observacion y accion, frecuencia de control, hiperparametros del actor de difusion ni el numero de pasos de difusion, lo que complica la integracion fuera del codigo de investigacion original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset base de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts auto-iql-n32: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset de rollouts auto-iql-success-bc-n32 (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset de rollouts auto-iql-success-bc-n32 (c03): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
- Articulo de IDQL: https://arxiv.org/abs/2304.10573
- Listado de datasets con la etiqueta sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
- Pagina de dataset en claru.ai: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
