# mulligan/sim-square-broad-r01-sobol-free-cf-idql

## Resumen

`mulligan/sim-square-broad-r01-sobol-free-cf-idql` es un agente de control robótico basado en estados, entrenado con el algoritmo IDQL (Implicit Diffusion Q-Learning) sobre la tarea de simulación `sim-square-broad`. Lo publica la organización `mulligan` como parte de su plataforma de investigación Mulligan, orientada a comparar métodos de aprendizaje por imitación y refuerzo offline en entornos de manipulación simulados. No es un modelo de lenguaje: es una política (actor) más un crítico, empaquetados como checkpoints de PyTorch.

El agente combina un actor de difusión con un crítico escalar IQL, una formulación que busca capturar distribuciones de acciones multimodales propias de datos de demostración humanos, al tiempo que usa el crítico para seleccionar entre las acciones generadas por el actor. El repositorio contiene cinco semillas independientes (`seed-1` a `seed-5`), cada una entrenada hasta el paso 250 001, lo que permite estudiar la varianza entre ejecuciones de un mismo método, un aspecto crítico en evaluación de políticas robóticas.

Su relevancia es de carácter metodológico más que de producto: forma parte de una campaña experimental (`sq_d1_r1_ours_sobol_freecf_human_only`) dentro de la ronda R1 del proyecto, y está referenciado por el conjunto de evaluación `sim-square-broad-r00-r03-eval`. El repositorio ocupa 1,4 GB en total y se distribuye con licencia Apache 2.0. No se han publicado métricas de rendimiento ni requisitos de hardware en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion de acciones + critico escalar IQL (red neuronal basada en estados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (es una politica robotica, no un modelo de lenguaje; consume observaciones de estado del entorno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch `.pt` (pickle) + `stats.json` con normalizadores |

Datos adicionales de la ficha del autor:

| Parametro | Valor |
|---|---|
| Tarea | sim-square-broad |
| Ronda de modelo | R1 |
| Brazo experimental | sobol-free-cf |
| Celda de campana | `sq_d1_r1_ours_sobol_freecf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250 001 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El componente principal es un actor de difusion que modela la distribucion de acciones condicionada al estado, combinado con un critico escalar entrenado mediante IQL. En IDQL, el actor genera candidatos de accion por muestreo difusivo y el critico se emplea para seleccionar la accion de mayor valor esperado, lo que permite representar distribuciones multimodales de comportamiento sin colapsar a la media de las demostraciones. Los ficheros publicados son `policy.pt` (checkpoint de PyTorch) y `stats.json`, que contiene los normalizadores de observaciones y acciones necesarios para reproducir la inferencia.

El entrenamiento se realizo sobre tres conjuntos de datos de la organizacion `mulligan`: `sim-square-broad-c00-teleop-sobol` (teleoperacion), `sim-square-broad-c01-dagger-sobol-free-cf` (agregacion de datos tipo DAgger para el brazo `sobol-free-cf`) y `sim-square-broad-c01-sobol-policy-rollouts` (rollouts de politica). Las rutas de los artefactos de Weights & Biases y los commits de Git de cada semilla estan documentados en la model card; los nombres de los runs (`iql_ddpg_bc_idql_square_d1_...`) indican que la implementacion de referencia combina las recetas IDQL, IQL y DDPG+BC en el mismo codigo de investigacion. No se especifican en la informacion disponible el numero de transiciones, la composicion exacta del dataset, la arquitectura concreta de las redes ni si hubo etapas de ajuste adicionales.

La procedencia esta verificada: los ficheros son copias byte a byte de los artefactos de W&B, con comprobacion MD5 contra el manifiesto del artefacto y hash SHA-256 registrado en `release.json`.

## Capacidades

- Control continuo de un brazo robotico en la tarea simulada `sim-square-broad`: recibe observaciones de estado y emite acciones continuas.
- Seleccion de acciones fuera de distribucion mediante el critico IQL: el actor propone y el critico puntua, lo que permite cierto grado de mejora mas alla de las demostraciones.
- Representacion de politicas multimodales gracias al actor de difusion, util cuando los datos de teleoperacion contienen multiples estrategias validas para la misma situacion.
- Reentrenamiento reproducible por semilla: se publican cinco semillas independientes con sus commits asociados.
- Normalizacion de entradas y salidas incluida en `stats.json`, lo que facilita la integracion en un bucle de evaluacion.
- No soporta tool calling, function calling, agentes basados en lenguaje, vision, audio ni capacidades multilingues: es un controlador de baja dimension para simulacion.

## Casos de uso

- Investigacion en aprendizaje por imitacion: usar los cinco checkpoints como linea base reproducible para estudiar la varianza entre semillas de un mismo algoritmo en tareas de manipulacion.
- Comparativa de algoritmos offline: enfrentar este agente IDQL contra variantes DDPG+BC o IQL puras dentro de la misma campana experimental de Mulligan para aislar el efecto del actor de difusion.
- Evaluacion de tecnicas de agregacion de datos: el brazo `sobol-free-cf` se entreno con datos de teleoperacion y de DAgger, por lo que sirve para medir cuanto aporta cada fuente de datos al rendimiento final.
- Analisis de exploracion con secuencias de Sobol: los identificadores de los datasets sugieren el uso de muestreo cuasi-aleatorio de Sobol, de modo que el modelo permite evaluar el impacto de ese esquema de exploracion frente a alternativas.
- Reproduccion de experimentos de un articulo o informe tecnico: los hashes MD5 y SHA-256 y los commits de Git permiten reconstruir exactamente la configuracion usada en cada semilla.
- Punto de partida para ajuste fino en una tarea de manipulacion relacionada: al ser un agente basado en estados con un actor de difusion generico, puede reutilizarse como inicializacion en entornos con espacio de acciones similar.
- Docencia y practicas de robotica: el tamano reducido esperado del checkpoint permite ejecutar la politica en una maquina de laboratorio sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, retornos medios ni comparaciones numericas con otros metodos; unicamente referencia el conjunto de evaluacion `mulligan/sim-square-broad-r00-r03-eval`, cuyos resultados no se detallan en el material proporcionado.

## Requisitos de hardware

- No se publican requisitos de VRAM, GPU recomendadas ni opciones de despliegue en la informacion disponible.
- Estimacion orientativa a partir del tamano del repositorio: 1,4 GB repartidos entre cinco semillas implican del orden de 280 MB por semilla, incluyendo `policy.pt` y `stats.json`. Eso es compatible con redes de tamano moderado que caben holgadamente en GPU de consumo (por ejemplo, RTX 3060 o superiores) y probablemente en CPU para inferencia de baja frecuencia, aunque no hay mediciones que lo confirmen.
- No se documentan integraciones con motores de inferencia como vLLM, TGI, llama.cpp u Ollama; no aplican, ya que no es un modelo de lenguaje. La carga se realiza con PyTorch estandar.
- Los ficheros `.pt` son pickles de PyTorch, por lo que deben cargarse unicamente en entornos de confianza.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos numericos que permitan una comparativa cuantitativa. La tabla siguiente contrasta el enfoque de este agente con las familias de algoritmos con las que comparte espacio de problemas, usando unicamente caracteristicas cualitativas; los valores de rendimiento y licencia de las alternativas figuran como no disponibles porque no se han aportado en la informacion recibida.

| Modelo / familia | Tipo de actor | Tipo de critico | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| sim-square-broad-r01-sobol-free-cf-idql | Actor de difusion | Critico escalar IQL | sim-square-broad | apache-2.0 | no disponible |
| Diffusion Policy (familia) | Actor de difusion | No usa critico de valor | Manipulacion (principalmente desde vision) | no disponible | no disponible |
| DDPG+BC (familia) | Actor deterministico con regularizacion de comportamiento | Critico Q | Manipulacion y control continuo | no disponible | no disponible |
| IQL puro (familia) | Actor tipo expectile regression | Critico de valor | Aprendizaje por refuerzo offline | no disponible | no disponible |

La ventaja estructural que la model card atribuye a IDQL frente a DDPG+BC es la combinacion de un actor capaz de representar multiples modos con un critico que selecciona entre sus muestras; no hay evidencia publicada en este repositorio que cuantifique esa ventaja.

## Limitaciones y advertencias

- Especificidad de tarea: el agente esta entrenado para `sim-square-broad` y no se ha validado su transferencia a otros entornos o a un robot fisico.
- Sesgo de los datos: al entrenarse con teleoperacion humana y con datos de DAgger generados por una politica concreta, hereda las estrategias y los sesgos de esos demostradores y de esa politica.
- Riesgo de sobreajuste al simulador: no consta ningun proceso de aleatorizacion de dominio ni de transferencia sim-a-real.
- Aleatoriedad entre semillas: se publican cinco semillas precisamente porque el rendimiento puede variar entre ejecuciones; usar una sola semilla para conclusiones es metodologicamente arriesgado.
- Ausencia de metricas publicadas: sin tasas de exito ni curvas de evaluacion no es posible afirmar que el agente resuelva la tarea de forma fiable.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se apoya en datasets de la organizacion `mulligan` cuya licencia propia no se detalla en la informacion disponible; conviene verificarla antes de reutilizar los datos.
- Seguridad al cargar: los ficheros `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse. Cargarlos solo desde el repositorio oficial y en un entorno aislado.
- Sin soporte de lenguaje, vision ni audio: cualquier caso de uso conversacional o multimodal queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-sobol-free-cf-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset de DAgger (brazo sobol-free-cf): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-sobol-free-cf
- Dataset de rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset de evaluacion r00-r03: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
