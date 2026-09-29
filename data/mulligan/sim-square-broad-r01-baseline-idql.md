# mulligan/sim-square-broad-r01-baseline-idql

## Resumen

`mulligan/sim-square-broad-r01-baseline-idql` es una politica de control robótico entrenada con aprendizaje por refuerzo offline mediante el algoritmo IDQL (Implicit Q-Learning con actor de difusión). Lo publica la organizacion Mulligan como parte de su campana de evaluacion `sim-square-broad`, dentro del ecosistema de experimentos reproducibles que la organizacion mantiene en HuggingFace y en su plataforma Policy Arena. El modelo resuelve la tarea simulada `sim-square-broad` a partir de observaciones de estado (no de imagenes), y se distribuye como un checkpoint de PyTorch (`policy.pt`) acompanado de ficheros de normalizacion (`stats.json`).

Tecnicamente, el modelo combina un actor generativo de tipo diffusion (que produce acciones continuas mediante un proceso de denoising) con un critico escalar entrenado con IQL, es decir, sin necesidad de consultar acciones fuera de la distribucion del dataset. La version publicada corresponde al "round" R1, brazo `baseline`, y se libera con cinco semillas independientes (seed-1 a seed-5) entrenadas hasta el paso 250001. El repositorio ocupa 1,4 GB en total y esta bajo licencia Apache 2.0.

Su relevancia es fundamentalmente metodologica: sirve como linea base reproducible para comparar variantes de recogida de datos (teleoperacion humana, rollouts de politica e imitacion tipo DAgger) dentro de la misma tarea, y permite estudiar la varianza entre semillas de un pipeline de RL offline en robotica. No es un modelo de lenguaje ni un modelo fundacional multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (diffusion policy) sobre acciones continuas + critico escalar IQL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control; consume vectores de estado, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el checkpoint se distribuye en la precision nativa de PyTorch) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (pickle) por semilla, mas `stats.json` con normalizadores |
| Tarea | sim-square-broad |
| Ronda de modelo | R1 |
| Brazo experimental | baseline |
| Celda de campana | `sq_d1_r1_baseline_uniform_nocf_human_only` |
| Semillas publicadas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

El modelo es un agente IDQL de tipo "state-based": recibe observaciones de estado del entorno simulado y emite acciones continuas. El actor es una politica de difusion que genera acciones mediante un proceso iterativo de eliminacion de ruido, lo que permite representar distribuciones de accion multimodales (habitual en datos de teleoperacion con multiples estrategias validas). El critico es un critico escalar entrenado con IQL, que estima valores de accion mediante regresion de expectil y evita consultar acciones fuera del soporte del dataset, un requisito tipico del RL offline. La combinacion permite extraer politicas sin interaccion online durante el entrenamiento.

Los datos de entrenamiento proceden de tres fuentes declaradas: `sim-square-broad-c00-teleop-baseline` (demostraciones de teleoperacion humana), `sim-square-broad-c01-baseline-policy-rollouts` (rollouts de una politica base) y `sim-square-broad-c01-dagger-baseline` (datos de agregacion tipo DAgger generados a partir de la linea base). La celda de campana incluye el sufijo `human_only` y `nocf`, lo que indica que esta configuracion concreta no incorpora datos contrafactuales ni fuentes adicionales mas alla de las humanas y las derivadas de la propia politica. Los checkpoints son copias byte a byte de artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`, lo que permite reproducibilidad exacta del binario. Los commits de Git asociados al codigo de entrenamiento y evaluacion aparecen listados por semilla (`604a0622cf7b`, `5e540817f540`, `11dfbbda36b2`).

## Capacidades

- Control continuo de un brazo robotico simulado en la tarea `sim-square-broad`, a partir de observaciones de estado.
- Generacion de acciones multimodales mediante muestreo por difusion, adecuada para datos con varias estrategias de solucion.
- Estimacion de valor de accion mediante critico IQL, util para puntuar y filtrar acciones candidatas.
- Ejecucion determinista o estocastica segun el numero de pasos de denoising configurados en inferencia.
- Cinco semillas independientes, lo que permite medir varianza del pipeline y construir ensembles por votacion o promedio de acciones.
- Evaluacion sobre una rejilla de estados iniciales retenida (held-out), con resultados por rollout disponibles en el dataset de evaluacion.
- No dispone de tool calling, function calling, soporte de agentes basados en lenguaje, capacidades multilingues ni modos de razonamiento textual.
- No procesa vision: el modelo card lo describe explicitamente como "state-based", de modo que no consume imagenes ni pixeles.

## Casos de uso

- Linea base reproducible para RL offline en robotica: sirve como referencia fija (paso 250001, cinco semillas) contra la que comparar nuevas variantes de algoritmo o de recogida de datos dentro de la misma tarea.
- Estudio de varianza entre semillas: con cinco checkpoints entrenados en paralelo se puede cuantificar la dispersion del exito (los resultados publicados abarcan de 19076 a 19414 exitos sobre 30000) y decidir si una mejora observada supera el ruido estadistico.
- Ensembles de politicas: combinando las cinco semillas mediante promedio de acciones o seleccion por valor del critico, se puede obtener una politica mas robusta que cualquiera individual, especialmente en estados iniciales poco representados.
- Evaluacion de pipelines de DAgger: los datos `sim-square-broad-c01-dagger-baseline` permiten analizar como la agregacion iterativa de datos afecta al rendimiento final, usando este agente como punto final del ciclo.
- Investigacion en aprendizaje por imitacion y RL offline: util para reproducir experimentos de IQL, diffusion policy y sus combinaciones sin necesidad de acceso al simulador propietario ni de entrenamiento desde cero.
- Punto de partida para inicializacion en experimentos posteriores: al ser un checkpoint maduro (250001 pasos) y de licencia Apache 2.0, se puede afinar o reutilizar como politica inicial en rondas R2 o en tareas derivadas.
- Auditoria de reproducibilidad de artefactos: el repositorio incluye verificacion MD5 y SHA-256, por lo que es util como caso de estudio de trazabilidad de checkpoints de RL (procedencia W&B, commits de Git y ficheros de normalizacion).
- Docencia y practicas de RL offline: el par `policy.pt` + `stats.json` es un ejemplo compacto de como se serializa un agente IDQL completo para inferencia.

## Benchmarks y rendimiento

La model card publica evaluaciones sobre una rejilla de estados iniciales retenidos, con N = 1 por celda de semilla y 30000 rollouts agregados. Los resultados son:

| Semilla | Exitos / total | Tasa de exito |
|---|---|---|
| seed-1 | 19369 / 30000 | 64,56 % |
| seed-2 | 19414 / 30000 | 64,71 % |
| seed-3 | 19385 / 30000 | 64,62 % |
| seed-4 | 19076 / 30000 | 63,59 % |
| seed-5 | 19337 / 30000 | 64,46 % |
| Media (calculada) | 19316,2 / 30000 | 64,39 % |

Los porcentajes de la tercera columna son un calculo derivado de los recuentos publicados, no cifras aportadas por el autor. No se han publicado en la informacion disponible resultados de benchmarks estandar de robotica (por ejemplo, tasas de exito normalizadas por tarea de RoboMimic o metrica de exito por horizonte), ni comparaciones numericas con otros agentes de la misma campana.

## Requisitos de hardware

- El repositorio completo ocupa 1,4 GB e incluye los cinco checkpoints; cada semilla se puede cargar de forma independiente, reduciendo el consumo de disco y de memoria.
- Al tratarse de redes de politica (no de un modelo de lenguaje), la inferencia es ligera en comparacion con modelos generativos de texto. No se especifica el numero de parametros ni el coste exacto de memoria, por lo que no se puede dar una cifra de VRAM verificada.
- Es previsible que quepa en cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) e incluso que funcione en CPU para evaluacion por lotes, dado el tamano del artefacto; esta afirmacion es una estimacion cualitativa, no un dato publicado.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; su utilidad estaria en reentrenar el agente o en evaluar grandes rejillas de estados iniciales en paralelo.
- Opciones de despliegue: carga directa con PyTorch (los `.pt` son pickles y deben cargarse solo en entornos de confianza), exportacion a TorchScript u ONNX para servir la politica, o integracion en el bucle del simulador correspondiente.
- vLLM, llama.cpp, Ollama o TGI no son aplicables: no es un modelo de lenguaje y no expone pesos en formato GGUF ni safetensors.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de difusion usados en el muestreo de acciones y del hardware, y no se documentan en la model card.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados numericos de otros agentes sobre esta misma tarea, por lo que no es posible establecer una comparacion cuantitativa. A continuacion se recogen las familias metodologicas con las que este modelo es directamente comparable de forma conceptual, marcando como "no disponible" todo dato que no consta.

| Metodo | Tipo de actor | Critico | Contexto / tarea | Parametros | Licencia del modelo comparable | Disponibilidad |
|---|---|---|---|---|---|---|
| IDQL (este modelo) | Difusion sobre acciones continuas | IQL con regresion de expectil | sim-square-broad, estado | no disponible | Apache 2.0 | Checkpoint `policy.pt` + `stats.json` en HuggingFace |
| IQL puro | Determinista o policy explicita | IQL | No disponible para esta tarea | no disponible | no disponible | Implementaciones genericas en librerias de RL offline |
| Diffusion policy (sin critico) | Difusion sobre acciones continuas | No aplica | No disponible para esta tarea | no disponible | no disponible | Implementaciones genericas publicadas por la comunidad |
| CQL | Determinista o policy explicita | Q-learning conservador | No disponible para esta tarea | no disponible | no disponible | Implementaciones genericas en librerias de RL offline |
| Otros brazos de la campana Mulligan | no disponible | no disponible | Misma tarea sim-square-broad | no disponible | Apache 2.0 (previsible, no confirmado) | No consultados en esta busqueda |

La unica comparacion con datos reales disponible es interna: la dispersion entre las cinco semillas de este mismo modelo, con un rango de 338 exitos entre la mejor (seed-2, 19414) y la peor (seed-4, 19076) sobre 30000 rollouts.

## Limitaciones y advertencias

- Modelo especifico de una unica tarea (`sim-square-broad`) en simulacion; no es un modelo generalista ni transferible sin reentrenamiento.
- Segun la denominacion de la celda de campana (`nocf`, `human_only`), esta configuracion no incorpora datos contrafactuales ni fuentes adicionales, lo que puede limitar la cobertura de estados respecto a otras variantes.
- Al ser "state-based", no procesa vision. No puede aplicarse directamente a configuraciones donde la observacion sea imagen, sin cambiar la arquitectura de entrada.
- Los ficheros `.pt` son pickles de PyTorch. La propia model card advierte de que deben cargarse unicamente en entornos de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- No se documentan sesgos del modelo en el sentido de sesgos sociales, pero si existe un sesgo de distribucion de datos: el rendimiento fuera de la rejilla de estados iniciales evaluada no esta caracterizado.
- Riesgo de fallo en estados poco representados: la tasa de exito media ronda el 64 %, lo que implica que aproximadamente uno de cada tres rollouts no tiene exito incluso dentro de la distribucion evaluada.
- No se publican cuantizaciones ni variantes optimizadas, de modo que el coste de inferencia depende de la implementacion concreta del muestreo por difusion.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia de los datos de entrenamiento y del simulador subyacente, no cubiertos por esta ficha.
- Algunos commits de Git difieren entre semillas, por lo que las cinco semillas no proceden exactamente del mismo arbol de codigo: hay que tenerlo en cuenta al comparar resultados entre semillas.
- Las fechas de creacion y actualizacion del repositorio son muy proximas (28 de septiembre de 2026, con ocho segundos de diferencia), lo que sugiere una publicacion automatizada sin revision manual posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-baseline-idql
- Sitio de Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de rollouts de la politica base: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-baseline-policy-rollouts
- Dataset de DAgger: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-baseline
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Artefactos de origen en Weights & Biases (identificadores, no URL directa): `self-improving/square-d1-dagger-mining-01a/iql_ddpg_bc_idql_square_d1_20260528_130755_585602_task1-final-step-250001:v0` (seed-1), `..._590934_task2-...` (seed-2), `..._633732_task3-...` (seed-3), `..._578225_task4-...` (seed-4), `..._551332_task5-...` (seed-5)
- Commits de Git asociados: `604a0622cf7b` (seed-1, seed-2 y seed-5), `5e540817f540` (seed-3), `11dfbbda36b2` (seed-4)
