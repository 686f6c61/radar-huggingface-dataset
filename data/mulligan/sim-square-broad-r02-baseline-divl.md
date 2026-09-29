# mulligan/sim-square-broad-r02-baseline-divl

## Resumen

`mulligan/sim-square-broad-r02-baseline-divl` es un agente de control para robotica, no un modelo de lenguaje. Se publica con el pipeline `robotics` dentro del proyecto Mulligan y resuelve la tarea de simulacion `sim-square-broad`. Tecnicamente es una politica *state-based* (observaciones de estado, no vision) que combina dos componentes: un actor de difusion congelado, heredado del modelo padre `sim-square-broad-r02-baseline-idql`, y un critico DIVL de tipo distribucional. Los pesos se distribuyen como `policy.pt` mas un fichero `stats.json`.

El modelo corresponde a la ronda R2, brazo `baseline`, de la celda de campana `sq_d1_r2_baseline_uniform_nocf_human_only`. Se publican cinco checkpoints, uno por semilla (1 a 5), todos entrenados hasta el paso 250001 con el mismo commit de codigo (`551416bff972`). El repositorio ocupa 1,4 GB, aproximadamente 280 MB por semilla.

Su relevancia es metodologica y de reproducibilidad: sirve como referencia base frente a las variantes generadas por DAgger mining dentro de la misma campana, y como punto de partida congelado para experimentos posteriores de RL offline. La evaluacion se realiza sobre una rejilla de estados iniciales retenida, con resultados publicados por semilla en el dataset `sim-square-broad-r00-r03-eval`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL state-based: actor de difusion congelado (procedente de `mulligan/sim-square-broad-r02-baseline-idql`) mas critico DIVL distribucional |
| Parametros totales | no disponible (el repositorio ocupa 1,4 GB para 5 semillas, unos 280 MB por semilla) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: es una politica de control, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; los pesos se publican en precision nativa de PyTorch, sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) mas `stats.json`; el autor advierte de que los `.pt` son pickles de PyTorch |
| Tarea | sim-square-broad |
| Ronda del modelo | R2 |
| Brazo | baseline |
| Celda de campana | `sq_d1_r2_baseline_uniform_nocf_human_only` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Commit de codigo | `551416bff972` |

## Arquitectura y entrenamiento

El modelo es un agente de aprendizaje por refuerzo offline para control robotico. La model card describe explicitamente una arquitectura de dos piezas: un actor de difusion que se mantiene congelado y que procede del checkpoint `sim-square-broad-r02-baseline-idql`, y un critico DIVL distribucional que se entrena sobre ese actor fijo. El agente trabaja sobre observaciones de estado, no sobre imagenes, por lo que no incorpora codificadores visuales.

Los identificadores de los artefactos de Weights & Biases (`iql_ddpg_bc_idql_divl_square_d1_...`) indican que el pipeline de entrenamiento combina varias familias de algoritmos offline: IQL, DDPG mas behavioral cloning, IDQL y DIVL, con minado de datos tipo DAgger entre rondas. El conjunto de datos de entrenamiento declarado incluye teleoperacion humana (`sim-square-broad-c00-teleop-baseline`) y rollouts de politica con datos DAgger de las campanas c01 y c02. La celda de campana lleva el sufijo `human_only`, lo que sugiere que la mezcla de datos se restringe a demostraciones humanas, aunque la model card no detalla la composicion exacta ni el numero de transiciones.

No se documentan en la informacion disponible ni el numero de tokens o transiciones de entrenamiento, ni la existencia de RLHF o DPO (tecnicas propias de modelos de lenguaje que no aplican aqui), ni innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Control robotico a partir de observaciones de estado para la tarea de manipulacion simulada `sim-square-broad`.
- Generacion de acciones mediante un actor de difusion congelado, complementado por un critico DIVL distribucional entrenado en esta publicacion.
- Publicacion multi-semilla: cinco politicas independientes (semillas 1 a 5) que permiten analizar varianza de entrenamiento y robustez.
- Reproducibilidad: cada checkpoint referencia el artefacto W&B de origen, el run y el commit de codigo, con verificacion MD5 frente al manifiesto del artefacto y SHA-256 registrado en `release.json`.
- Servir como actor congelado para nuevos experimentos de RL offline y para minado de datos tipo DAgger.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues (no procesa texto).
- No tiene modo *thinking*, vision, audio ni ninguna capacidad multimodal documentada.
- No se documentan capacidades de generalizacion fuera de la tarea `sim-square-broad`.

## Casos de uso

- Referencia base en experimentos de RL offline: la publicacion funciona como el brazo `baseline` de la campana, de modo que cualquier variante posterior (por ejemplo, las generadas con DAgger mining) puede compararse contra estas cinco semillas bajo la misma rejilla de evaluacion.
- Minado de datos tipo DAgger: la politica puede desplegarse en el simulador para generar rollouts que, una vez anotados, alimenten la siguiente ronda de entrenamiento; de hecho los datasets `c01-dagger-baseline` y `c02-dagger-baseline` forman parte del entrenamiento declarado.
- Estudio de varianza entre semillas: con cinco checkpoints entrenados hasta el mismo paso (250001) y el mismo commit, es posible cuantificar la dispersion de rendimiento atribuible unicamente a la inicializacion aleatoria.
- Investigacion sobre criticos distribucionales: al mantener el actor congelado y variar solo el critico DIVL, el modelo aísla el efecto del aprendizaje de valor, lo que resulta util para comparar criticos distribucionales frente a alternativas escalares.
- Punto de partida para *fine-tuning* de politicas: el actor congelado puede reutilizarse como inicializacion en nuevas campanas sin repetir el coste de entrenamiento desde cero.
- Pruebas de regresion en infraestructura de investigacion: el par (artefacto W&B, commit `551416bff972`) permite reproducir exactamente el mismo checkpoint y verificar que el pipeline de entrenamiento del laboratorio sigue produciendo resultados equivalentes.
- Analisis de sensibilidad a estados iniciales: la evaluacion sobre una rejilla retenida de estados iniciales permitiria estudiar que configuraciones iniciales concentran los fallos, aunque la model card no desglosa los resultados por estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este modelo no es un modelo de lenguaje, por lo que metricas como MMLU, HumanEval o GSM8K no son aplicables.

La unica evaluacion publicada es la tasa de exito en la rejilla de estados iniciales retenida del dataset `sim-square-broad-r00-r03-eval`:

| Semilla | N | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 21180/30000 | 70,60 % |
| seed-2 | 32 | 21879/30000 | 72,93 % |
| seed-3 | 32 | 21320/30000 | 71,07 % |
| seed-4 | 32 | 20067/30000 | 66,89 % |
| seed-5 | 32 | 21417/30000 | 71,39 % |
| Total | — | 105863/150000 | 70,58 % |

La dispersion entre semillas es de aproximadamente 2,0 puntos porcentuales de desviacion tipica, con un rango de 66,89 % a 72,93 %. La model card no indica el significado exacto del campo `N` ni como se agregan los 30000 rollouts por semilla.

## Requisitos de hardware

- Tamano de checkpoint: el repositorio completo ocupa 1,4 GB para cinco semillas, es decir, unos 280 MB por semilla entre `policy.pt` y `stats.json`.
- VRAM estimada para inferencia: no disponible de forma oficial. Partiendo del tamano del fichero por semilla (unos 280 MB) y asumiendo pesos en coma flotante de 32 bits, el orden de magnitud seria de decenas de millones de parametros, de modo que la inferencia cabria holgadamente en cualquier GPU de consumo actual; esta estimacion es derivada del tamano del repositorio y no esta confirmada por el autor.
- GPU recomendadas: no disponible. Por el tamano del checkpoint, cualquier GPU con varios GB de VRAM es suficiente; no se documenta ninguna recomendacion oficial.
- Cabe en GPU de consumo: si, segun la estimacion anterior, en practicamente cualquier tarjeta moderna (por ejemplo, serie RTX 30 o 40). La inferencia tambien deberia ser viable en CPU dado el tamano del modelo.
- Opciones de despliegue: carga nativa de los ficheros `.pt` con PyTorch y el codigo de investigacion de Mulligan en el commit `551416bff972`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible. Como consideracion general, un actor de difusion requiere varios pasos de denoising por accion, lo que suele implicar mas coste por inferencia que una politica determinista de una sola pasada, pero no hay mediciones publicadas para este checkpoint.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en entornos de confianza.

## Comparativa con modelos similares

No se dispone de resultados comparables publicados para otros agentes de la misma categoria en la informacion proporcionada. La comparacion mas directa posible es contra los artefactos de la propia familia Mulligan citados en la model card:

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `sim-square-broad-r02-baseline-divl` (este) | Actor de difusion congelado + critico DIVL distribucional | no disponible | no aplica | 70,58 % de exito medio en 5 semillas | MIT | Publicado en HuggingFace |
| `sim-square-broad-r02-baseline-idql` | Modelo padre; aporta el actor de difusion congelado | no disponible | no aplica | no disponible | MIT | Publicado en HuggingFace |
| Variantes DAgger de la campana sq_d1 | Generadas con minado DAgger a partir de rollouts | no disponible | no aplica | no disponible | MIT | Datasets publicados; checkpoints no detallados en esta informacion |

## Limitaciones y advertencias

- Ambito restringido: es una politica especifica para la tarea `sim-square-broad`; no es un modelo de proposito general ni transferible fuera de ese entorno sin reentrenamiento.
- Observaciones de estado: el agente no procesa imagenes ni texto, por lo que no puede aplicarse a tareas que requieran percepcion visual directa.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de fallo silencioso, esto es, acciones invalidas o poco seguras cuando el estado se aleja de la distribucion de entrenamiento. La model card no publica analisis de cobertura ni de deteccion de estados fuera de distribucion.
- Datos de entrenamiento sesgados hacia un origen concreto: la celda `sq_d1_r2_baseline_uniform_nocf_human_only` sugiere el uso exclusivo de datos de teleoperacion humana, lo que puede limitar la diversidad de comportamientos cubiertos.
- Ausencia de analisis de sesgos: no se documentan estudios de sesgo, equidad ni comportamiento diferencial por subpoblaciones de estados.
- Sin validacion en hardware real: los resultados publicados corresponden a simulacion; no hay evidencia de transferencia sim-to-real ni de robustez frente a ruido de sensores o latencias reales.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia. No se han declarado restricciones adicionales.
- Riesgo de seguridad en la carga de pesos: los `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse; deben cargarse solo en entornos de confianza y, preferiblemente, tras verificar los hashes SHA-256 registrados en `release.json`.
- Reproducibilidad parcial: se conocen el commit de codigo (`551416bff972`) y los artefactos W&B, pero no se documenta el entorno de ejecucion completo (versiones de librerias, hardware de entrenamiento).
- Documentacion incompleta: no hay informacion sobre el espacio de acciones, la composicion exacta del dataset, el numero de transiciones ni los hiperparametros de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r02-baseline-divl
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Modelo padre (actor de difusion congelado): https://huggingface.co/mulligan/sim-square-broad-r02-baseline-idql
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-baseline-policy-rollouts
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-baseline
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-baseline-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-baseline
- Dataset DAgger relacionado (resultado de busqueda): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mulligan
- Artefactos de Weights & Biases (referencia textual, sin URL publica en la model card): proyecto `self-improving/square-d1-dagger-mining-01a`; runs `z2vb62u2` (seed-1), `cznjyy3r` (seed-2), `akjnrplo` (seed-3), `e0jclsox` (seed-4), `wqk1nv0r` (seed-5)

Otros enlaces consultados en la busqueda web, de caracter general y no especificos de este modelo (no contienen resultados aplicables a politicas de robotica):

- https://benchlm.ai/
- https://iternal.ai/llm-benchmark-repository
- https://aimodelsbenchmark.com/
- https://openrouter.ai/rankings
