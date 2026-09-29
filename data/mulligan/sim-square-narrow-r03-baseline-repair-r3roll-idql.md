# mulligan/sim-square-narrow-r03-baseline-repair-r3roll-idql

## Resumen

sim-square-narrow-r03-baseline-repair-r3roll-idql es un agente de control robotico entrenado con el algoritmo IDQL (Implicit Diffusion Q-Learning) sobre la tarea simulada `sim-square-narrow`, un escenario de ensamblaje tipo *nut assembly square* con holgura estrecha. Lo publica el usuario `mulligan` como parte de la campana de investigacion Mulligan, orientada a comparar y reparar politicas mediante ciclos de automejora con datos DAgger. El modelo no es un modelo de lenguaje: es una politica de robot estado-a-accion compuesta por un actor de difusion y un critico IQL escalar.

El artefacto contiene cinco checkpoints independientes (uno por semilla: seeds 1 a 5), todos en el paso de entrenamiento 150001, almacenados junto a ficheros `stats.json` con los normalizadores de observaciones y acciones. Cada checkpoint es una copia byte a byte de un artefacto de Weights & Biases, con verificacion MD5 contra el manifiesto y SHA-256 registrado en `release.json`. El repositorio ocupa 1,4 GB, lo que supone aproximadamente 280 MB por semilla.

Su relevancia es metodologica: sirve como linea base reproducible de la variante `baseline-repair-r3roll` dentro de la celda de campana `sq_d0_r3_repair_baseline_uniform_nocf_human_only_r3roll`, y viene acompanado de evaluaciones exhaustivas sobre una rejilla de estados iniciales reservada (8000 rollouts por semilla). Los resultados publicados se situan entre el 92,16 % y el 95,08 % de exito segun la semilla, con una media de 7512/8000 (93,90 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (diffusion policy) con critico IQL escalar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones de estado por paso de decision) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch sin versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de control robotico; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `policy.pt` (checkpoint PyTorch, serializado como pickle) y `stats.json` (normalizadores) |
| Tarea | `sim-square-narrow` (ensamblaje de pieza cuadrada con holgura estrecha) |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB (aproximadamente 280 MB por semilla) |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor generativo de tipo difusion que modela la distribucion de acciones, combinado con un critico escalar entrenado con Implicit Q-Learning (IQL). El critico se usa para seleccionar o ponderar las muestras generadas por el actor, lo que permite aprovechar datos offline heterogeneos sin necesidad de estimar directamente el valor de acciones fuera de distribucion. Los nombres de los artefactos de origen (`iql_ddpg_bc_idql_nutassemblysquare_...`) indican una base de entrenamiento que combina componentes de IQL, DDPG y behavioral cloning junto con IDQL. La observacion es de tipo estado (no hay vision), y las entradas se normalizan mediante los ficheros `stats.json` incluidos.

El entrenamiento se enmarca en un ciclo de automejora con mineria DAgger (`self-improving/square-dagger-mining-01a`). Los datos proceden de siete conjuntos: una demostracion de teleoperacion inicial (`sim-square-narrow-c00-teleop-baseline`), tres rondas de rollouts de la politica base (`c01`, `c02`, `c03-baseline-policy-rollouts`) y tres conjuntos DAgger correspondientes (`c01`, `c02`, `c03-dagger-baseline`). Los checkpoints se entrenaron con el codigo de investigacion de Mulligan en los commits `3f254b76f9f4` (seeds 1 y 2) y `86aa1b45a767` (seeds 3, 4 y 5), con parada en el paso 150001. No se documenta en la informacion disponible el numero total de transiciones, la composicion porcentual del dataset ni el uso de RLHF o DPO, tecnicas que ademas no aplican a este dominio.

## Capacidades

- Control robotico estado-a-accion: genera acciones continuas para completar la tarea de ensamblaje de una pieza cuadrada con tolerancia estrecha.
- Politica multi-semilla: cinco checkpoints independientes permiten estudiar la varianza de rendimiento entre semillas bajo el mismo protocolo.
- Aprendizaje por imitacion combinado con RL offline: integra datos de teleoperacion y de DAgger en un unico entrenamiento.
- Evaluacion sobre rejilla reservada: cada semilla ha sido evaluada con 8000 rollouts sobre una rejilla de estados iniciales no usada en entrenamiento.
- Reproducibilidad verificable: los ficheros son copias byte a byte de artefactos de W&B, con MD5 contrastado contra el manifiesto y SHA-256 en `release.json`.
- No dispone de tool calling, function calling ni capacidades de agente basadas en lenguaje.
- No dispone de capacidades multilingues, de vision ni de audio: el entrada es puramente estado (propiocepcion y variables de la tarea simulada).

## Casos de uso

- Linea base reproducible en investigacion de RL offline: permite comparar nuevas variantes de IDQL o de diffusion policy contra un punto de referencia con cinco semillas y 8000 evaluaciones por semilla, reduciendo el ruido estadistico en las conclusiones.
- Mineria DAgger iterativa: la politica puede desplegarse en el simulador para generar nuevos rollouts etiquetados por el experto, alimentando la siguiente ronda de entrenamiento del ciclo `self-improving`.
- Estudio de varianza entre semillas: al haber cinco checkpoints con arquitectura y datos equivalentes, es posible cuantificar la dispersion de exito (92,16 % a 95,08 %) y dimensionar correctamente el numero de semillas necesarias en experimentos futuros.
- Seleccion de politicas para transferencia sim-a-real: un agente con mas del 93 % de exito medio en simulacion es un candidato razonable para probar bajo perturbaciones de dinamica antes de un despliegue fisico.
- Destilacion a controladores mas ligeros: la politica puede actuar como profesor para destilar una red de inferencia mas rapida o para ajustar un controlador clasico en entornos con restricciones de computo.
- Pruebas de robustez ante holgura estrecha: la tarea `square-narrow` exige precision alta; la politica sirve para medir la degradacion del exito al modificar tolerancias, ruido de actuacion o friccion.
- Generacion de datos sinteticos para *digital twins*: los rollouts de la politica pueden poblar gemelos digitales de lineas de ensamblaje con trazas realistas de exito y fallo.
- Auditoria de artefactos en produccion: el flujo de verificacion MD5/SHA-256 del repositorio sirve como plantilla para pipelines internos que exigen trazabilidad de los pesos desplegados.

## Benchmarks y rendimiento

Evaluacion sobre rejilla de estados iniciales reservada, 8000 rollouts por semilla (conjunto `sim-square-narrow-r00-r03-eval`):

| Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 7448 | 93,10 % |
| seed-2 | 8000 | 7606 | 95,08 % |
| seed-3 | 8000 | 7373 | 92,16 % |
| seed-4 | 8000 | 7558 | 94,48 % |
| seed-5 | 8000 | 7575 | 94,69 % |
| Media (5 semillas) | 40000 | 37560 | 93,90 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a un modelo de control robotico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano por checkpoint (aproximadamente 280 MB) sugiere un modelo de red neuronal de pequeno a medio, pero no se publica el numero de parametros ni el desglose peso a peso.
- GPU recomendadas: no disponibles en la informacion proporcionada. Cualquier GPU con al menos unos pocos GB de VRAM deberia ser suficiente para inferencia, dado el tamano del checkpoint, pero es una estimacion no confirmada por el autor.
- Cabe en GPU de consumo: muy probablemente si, incluidas gamas medias y de entrada con suficiente VRAM; no hay confirmacion oficial ni cifras concretas.
- Opciones de despliegue: carga directa del checkpoint con PyTorch (`policy.pt` + `stats.json`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia para modelos de lenguaje, ya que no es un modelo de texto.
- Latencia y throughput: no disponibles.
- Nota de seguridad: los ficheros `.pt` son pickles de PyTorch; deben cargarse unicamente en un entorno de confianza, tal como advierte la propia model card.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la informacion proporcionada. Las lineas comparables de forma natural serian el IDQL original, Diffusion Policy y variantes de IQL o de behavioral cloning sobre la misma tarea, pero no hay cifras publicadas en el material facilitado que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-narrow-r03-baseline-repair-r3roll-idql | no disponible | no aplica | 93,90 % de exito medio (5 semillas, 8000 rollouts cada una) | MIT | HuggingFace, checkpoints por semilla |
| Alternativas de la misma categoria (IDQL, Diffusion Policy, IQL, BC) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especifico de tarea: solo aborda `sim-square-narrow`; no es un agente general ni transferible sin reentrenamiento a otras tareas de manipulacion.
- Dominio simulado: no hay evidencia publicada de transferencia a un robot fisico, ni de robustez ante ruido sensorial, latencias o variaciones de friccion del mundo real.
- Entrada basada en estado: no procesa imagenes ni lenguaje, lo que limita su uso en configuraciones que dependan de vision o de instrucciones textuales.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe riesgo de acciones erroneas o fuera de distribucion cuando el estado observado se aleja de la distribucion de entrenamiento.
- Varianza entre semillas: la tasa de exito oscila entre el 92,16 % y el 95,08 %, una diferencia de casi tres puntos que obliga a reportar resultados agregados y no de una unica semilla.
- Dependencia de datos DAgger: el rendimiento esta ligado a los conjuntos de rollouts y de correcciones humanas del ciclo; sin esos datos, la reproduccion fiel del resultado no es posible.
- Riesgo de deserializacion: los `.pt` son pickles; cargarlos desde fuentes no verificadas puede ejecutar codigo arbitrario.
- Licencia MIT: permite uso comercial y modificacion sin restricciones relevantes, con la unica obligacion habitual de conservar el aviso de copyright y la licencia.
- Trazabilidad limitada del entrenamiento: no se documentan hiperparametros, numero de transiciones ni composicion exacta del dataset en la informacion disponible.
- Sin garantias de mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin senales de soporte activo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-baseline-repair-r3roll-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion base: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Rollouts de la politica base c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-baseline-policy-rollouts
- Conjunto DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-baseline
- Rollouts de la politica base c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-baseline-policy-rollouts
- Conjunto DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-baseline
- Rollouts de la politica base c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-baseline-policy-rollouts
- Conjunto DAgger c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-baseline
