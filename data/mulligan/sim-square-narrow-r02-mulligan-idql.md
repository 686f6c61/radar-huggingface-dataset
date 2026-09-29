# mulligan/sim-square-narrow-r02-mulligan-idql

## Resumen

sim-square-narrow-r02-mulligan-idql es un agente de control robotico entrenado con el algoritmo IDQL (Implicit Q-Learning con actor de difusion) para la tarea simulada sim-square-narrow, que consiste en insertar una pieza cuadrada en una ranura estrecha. Lo publica la organizacion mulligan en Hugging Face como parte del proyecto Mulligan, una linea de investigacion sobre recogida de datos guiada por rendimiento para aprendizaje en robot. No es un modelo de lenguaje: es una politica de control de espacio de estados (state-based), sin entrada visual, empaquetada como checkpoint de PyTorch (`policy.pt`) junto con ficheros de normalizacion (`stats.json`).

El modelo pertenece a la ronda R2 de la campana, en la celda `sq_d0_r2_ours_mining_shape_beta05_freecf_human_only`, y se distribuye en cinco carpetas, una por semilla (1 a 5), todas entrenadas hasta el paso 150001. La relevancia actual esta en el contexto de la investigacion en robotica: el proyecto Mulligan estudia como seleccionar y corregir datos de demostracion (teleoperacion, DAgger, rollouts de politica) para maximizar la eficiencia de aprendizaje, y este checkpoint sirve como referencia reproducible de esa metodologia.

Los resultados declarados por el autor son altos: entre 7566/8000 y 7687/8000 exitos por semilla sobre una rejilla de estados iniciales no vista durante el entrenamiento, lo que equivale a una tasa de exito agregada del 95,39 %. El repositorio ocupa 1,4 GB en total y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion (diffusion policy) con critico IQL escalar; algoritmo IDQL. Entrada basada en estado, sin vision |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en precision de entrenamiento sin cuantizaciones publicadas |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`, serializado con pickle) mas `stats.json` con normalizadores |
| Tarea | sim-square-narrow (insercion de pieza cuadrada en ranura estrecha, simulacion) |
| Ronda del modelo | R2 |
| Celda de campana | `sq_d0_r2_ours_mining_shape_beta05_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La arquitectura combina un actor generativo de difusion con un critico escalar derivado de IQL (Implicit Q-Learning), siguiendo el esquema IDQL. El actor modela la distribucion de acciones mediante un proceso de difusion y el critico estima el valor de las acciones sin necesidad de consultar acciones fuera de la distribucion de los datos, lo que resulta adecuado para aprendizaje offline a partir de demostraciones y rollouts mixtos. El modelo es state-based: consume observaciones de estado del simulador y produce acciones de control, sin modulo de vision ni de lenguaje.

Los datos de entrenamiento proceden de cinco conjuntos publicados por el propio proyecto: `sim-square-narrow-c00-teleop-sobol` (teleoperacion), `sim-square-narrow-c01-dagger-mulligan` y `sim-square-narrow-c02-dagger-mulligan` (correcciones humanas con DAgger), `sim-square-narrow-c01-sobol-policy-rollouts` y `sim-square-narrow-c02-mulligan-policy-rollouts` (rollouts de politica). No se especifica en la informacion disponible el numero total de transiciones, la composicion exacta del dataset ni si se emplearon etapas de RLHF o DPO (no aplicables a este dominio). Los checkpoints son copias byte a byte de los artefactos de W&B indicados en la model card (verificacion MD5 contra el manifiesto del artefacto y SHA-256 registrado en `release.json`), entrenados y evaluados con el codigo de investigacion de Mulligan en el commit `ec52959c99f0`.

## Capacidades

- Control motor para una tarea de ensamblaje de precision en simulacion: insertar una pieza cuadrada en una ranura estrecha a partir del estado del entorno.
- Generacion de acciones mediante muestreo de difusion, con critico escalar asociado para evaluacion de acciones.
- Entrenamiento offline a partir de datos heterogeneos: teleoperacion, correcciones DAgger y rollouts de politica.
- Ejecucion determinista por semilla: se publican cinco politicas independientes (semillas 1 a 5) que permiten medir varianza entre entrenamientos.
- Reutilizacion como generador de rollouts: las trayectorias de la politica alimentan las campanas de recogida de datos del proyecto (`c01-sobol-policy-rollouts`, `c02-mulligan-policy-rollouts`).
- No dispone de tool calling, function calling, capacidades de agente multi-paso en el sentido de los modelos de lenguaje, ni capacidades multilingues, de vision o de audio.

## Casos de uso

- Ensamblaje de precision en simulacion: el agente ejecuta la insercion de la pieza cuadrada en la ranura estrecha con una tasa de exito declarada del 95,39 % agregada, adecuada para experimentos de manipulacion fina en entornos fisicos simulados.
- Comparacion de algoritmos de aprendizaje offline: sirve como referencia IDQL frente a otros brazos del proyecto (por ejemplo los basados en datos `sobol`) para medir el efecto de la estrategia de recogida de datos.
- Generacion de datos de entrenamiento: los rollouts de la politica pueden volcarse a los conjuntos de `policy-rollouts` y reutilizarse en iteraciones posteriores de la campana (esquema de mejora autoinducida).
- Correccion humana con DAgger: la politica sirve como punto de partida sobre el que un operador introduce correcciones, generando los conjuntos `dagger-mulligan` de la siguiente ronda.
- Estudio de robustez y varianza entre semillas: al publicar cinco semillas con evaluacion independiente sobre 8000 rollouts cada una, permite analizar la estabilidad del entrenamiento sin reentrenar.
- Preentrenamiento para transferencia sim-to-real: la politica puede usarse como inicializacion de un agente que se adapte a un banco de ensamblaje real, siempre que la interfaz de estados sea replicable.
- Auditoria de reproducibilidad: los checkpoints son copias verificadas por MD5 y SHA-256 de artefactos de W&B, por lo que resultan utiles para reproducir evaluaciones y auditar resultados publicados.

## Benchmarks y rendimiento

Evaluacion declarada por el autor sobre una rejilla de estados iniciales no vista durante el entrenamiento, con 8000 rollouts por semilla.

| Semilla | Rollouts | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 7666 | 95,83 % |
| seed-2 | 8000 | 7687 | 96,09 % |
| seed-3 | 8000 | 7585 | 94,81 % |
| seed-4 | 8000 | 7653 | 95,66 % |
| seed-5 | 8000 | 7566 | 94,58 % |
| Agregado | 40000 | 38157 | 95,39 % |

No se han publicado otros resultados de benchmarks (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no aplican a un agente de control robotico.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el repositorio completo ocupa 1,4 GB para cinco semillas, es decir, aproximadamente 280 MB por semilla incluyendo `policy.pt` y `stats.json`; un checkpoint de ese orden de magnitud es holgadamente cargable en GPU de consumo.
- GPU recomendadas: no especificadas por el autor. Por el tamano del checkpoint, cualquier GPU con al menos unos pocos GB de memoria libre deberia ser suficiente para inferencia, sin que la informacion disponible permita fijar un minimo con precision.
- GPU de consumo: no se documenta oficialmente, pero el tamano del artefacto sugiere que es viable en tarjetas de gama media y en CPU.
- Opciones de despliegue: carga del checkpoint PyTorch (`policy.pt`) con los normalizadores de `stats.json` mediante el codigo de investigacion de Mulligan en el commit `ec52959c99f0`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un agente de control.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia por paso ni frecuencia de control.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye metricas de otros brazos de la misma campana (por ejemplo los basados en conjuntos `sobol`) ni de agentes IDQL o de difusion alternativos, por lo que no es posible establecer una comparacion numerica. Como referencia cualitativa, el propio proyecto publica conjuntos de datos de otras configuraciones (`sim-square-narrow-c03-dagger-mixed`, `sim-square-narrow-c03-mulligan-policy-rollouts`) que corresponden a brazos distintos de la misma campana, pero sin resultados de evaluacion asociados en la informacion disponible.

## Limitaciones y advertencias

- Especificidad de tarea: la politica esta entrenada exclusivamente para sim-square-narrow; no se declara generalizacion a otras tareas, objetos o geometrias.
- Dependencia del espacio de estados: al ser state-based, requiere acceso a las mismas observaciones de estado que el simulador de entrenamiento; no dispone de entrada visual que permita operar con camaras reales directamente.
- Sesgos del dataset: el comportamiento hereda las caracteristicas de los datos de teleoperacion, DAgger y rollouts empleados; no se documenta la composicion ni el balance del dataset, lo que dificulta analizar sesgos por regimen.
- Tasa de fallo no nula: en la evaluacion declarada falla en torno al 4-5 % de los rollouts, lo que exige mecanismos de recuperacion o deteccion de fallo en un despliegue real.
- Ausencia de validacion en hardware real: los resultados son de simulacion sobre una rejilla de estados iniciales; no se aportan datos de transferencia sim-to-real.
- Seguridad de los ficheros: los ficheros `.pt` son pickles de PyTorch, por lo que el propio autor advierte que deben cargarse unicamente en entornos de confianza.
- Licencia: MIT, permisiva y apta para uso comercial, sin restricciones adicionales declaradas; conviene verificar de todos modos la procedencia de los datos de entrenamiento si se va a explotar comercialmente.
- Idiomas y contexto: no aplica; no es un modelo de lenguaje y no debe evaluarse con criterios de ventana de contexto, cuantizacion o capacidades multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulligan/sim-square-narrow-r02-mulligan-idql
- Proyecto Mulligan: https://mulligan.page/
- Arena de evaluacion de politicas: https://arena.mulligan.page/
- Organizacion mulligan en Hugging Face: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset DAgger c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Dataset de rollouts c01: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset DAgger c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan
- Dataset de rollouts c02: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset DAgger mixto c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mixed
- Dataset de rollouts c03: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
