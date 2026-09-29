# mulligan/sim-square-narrow-r03-mulligan-idql

## Resumen

El modelo `mulligan/sim-square-narrow-r03-mulligan-idql` es un agente de aprendizaje por refuerzo offline para control robótico, concretamente una política entrenada para la tarea de manipulacion simulada `sim-square-narrow`. Lo publica la organizacion `mulligan` dentro de su campana de investigacion sobre agentes auto-mejorables, y corresponde a la ronda R3 del brazo denominado `mulligan`, con celda de campana `sq_d0_r3_ours_grid_cell_bonus_b1p0_freecf_human_only`. El repositorio contiene cinco checkpoints, uno por semilla (1 a 5), en el paso de entrenamiento 150001.

Tecnicamente se trata de un agente IDQL (Implicit Q-Learning with Diffusion Policies) basado en estado: un actor de difusion que genera acciones y un critico IQL escalar. No es un modelo de lenguaje ni un modelo multimodal: consume observaciones de estado (sin camaras) y produce acciones de control. Los pesos se distribuyen como un checkpoint PyTorch (`policy.pt`) acompanado de ficheros `stats.json` con los normalizadores, con un tamano de repositorio de 1,4 GB.

Su relevancia es de investigacion: permite reproducir y auditar una politica de manipulacion con evaluacion publicada sobre una rejilla de estados iniciales reservada, con tasas de exito de entre el 94,54 % y el 96,38 % segun semilla. Los artefactos son copias byte a byte de los artefactos de Weights & Biases, verificadas por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusion (diffusion policy) con critico IQL escalar; agente de RL offline basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la politica consume observaciones de estado del entorno) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | mit |
| Formato de pesos | PyTorch (`policy.pt`, pickle de PyTorch) mas `stats.json` con normalizadores |

Datos adicionales del repositorio: tarea `sim-square-narrow`, ronda de modelo R3, brazo `mulligan`, paso de entrenamiento 150001, semillas 1 a 5 (una carpeta por semilla), tamano del repo 1,4 GB, pipeline declarado `robotics`, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL (Implicit Q-Learning with Diffusion Policies): la politica se representa mediante un modelo de difusion que genera acciones a partir de observaciones de estado mediante un proceso de denoising, mientras que la funcion de valor se aprende con un critico IQL escalar. En esta publicacion el agente es estrictamente basado en estado, es decir, las observaciones no incluyen imagenes ni grabaciones de camara. El entrenamiento se realizo con el codigo de investigacion de Mulligan en los commits Git indicados en la model card, y los checkpoints corresponden al paso 150001 en las cinco semillas.

Los datos de entrenamiento proceden de un pipeline iterativo de varias rondas: una demostracion inicial de teleoperacion (`sim-square-narrow-c00-teleop-sobol`) y sucesivas rondas de agregacion de datos con DAgger y rollouts de politica (`c01`, `c02`, `c03`, tanto variantes `dagger-mulligan` como `mulligan-policy-rollouts`, mas `sobol-policy-rollouts` en la ronda c01). No se especifica en la informacion disponible el numero total de transiciones, la composicion exacta del dataset ni si se aplicaron tecnicas tipo RLHF o DPO, que por otra parte no son habituales en RL offline para control. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, que no aplican a este tipo de politica.

Cada checkpoint proviene de un artefacto de Weights & Biases distinto, con su propio run y commit; los ficheros publicados son copias identicas en bytes y se advierte de que los `.pt` son pickles de PyTorch que solo deben cargarse en entornos de confianza.

## Capacidades

- Generacion de acciones de control para manipulacion robotica en simulacion sobre la tarea `sim-square-narrow`.
- Politica basada en estado: consume observaciones de estado del entorno, sin entrada visual.
- Aprendizaje por refuerzo offline con actor de difusion, lo que permite modelar distribuciones de acciones multimodales.
- Evaluacion sobre una rejilla reservada de estados iniciales (held-out initial-state grid) con resultados por rollout publicados.
- Cinco semillas independientes, lo que permite estudiar varianza entre inicializaciones y hacer ensembles o comparaciones de robustez.
- Integracion en pipelines de investigacion en RL offline y en bucles de DAgger para recoleccion iterativa de datos.
- Soporte de tool calling / function calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplicable.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision, audio, etc.): no disponible; no se declaran.

## Casos de uso

- Investigacion en RL offline: usar el checkpoint como politica de referencia IDQL para comparar variantes de actor de difusion frente a criticos IQL, partiendo de una tasa de exito publicada de entorno al 95,68 % de media en la rejilla de evaluacion.
- Generacion de datos sinteticos para entrenamiento: desplegar la politica en el simulador para producir rollouts etiquetados (exito o fallo) que alimenten la siguiente ronda de DAgger, replicando el esquema c01-c03 del propio proyecto.
- Evaluacion comparativa de semillas: entrenar o evaluar variantes y usar las cinco semillas publicadas como linea base para medir varianza; el rango observado va de 7563/8000 a 7710/8000 exitos.
- Destilacion a politicas mas ligeras: al ser una politica basada en estado de un dominio acotado, sirve como profesor para destilar un controlador de inferencia mas barata en simulacion.
- Analisis de fallos y minado de casos limite: los 8000 rollouts de evaluacion por semilla y sus resultados por rollout permiten estudiar los modos de fallo sistematicos de la tarea `sim-square-narrow`.
- Reproducibilidad de publicaciones: los checkpoints son copias verificadas por MD5 y SHA-256 de artefactos de W&B, de modo que un tercero puede auditar resultados sin depender del estado del run original.
- Pruebas de transferencia sim-a-real: la politica puede servir de punto de partida para experimentos de adaptacion al robot real, siempre que se conozca el espacio de acciones y observaciones del entorno simulado, datos que no se detallan en la informacion disponible.
- Integracion en bancos de pruebas de robotica: dado su tamano de repositorio (1,4 GB para cinco semillas) y su licencia MIT, es viable incluirlo en suites de evaluacion internas de agentes de manipulacion.

## Benchmarks y rendimiento

La model card publica evaluaciones sobre una rejilla reservada de estados iniciales, con resultados por rollout en el dataset `sim-square-narrow-r00-r03-eval`. Los datos disponibles son:

| Semilla | Dataset de evaluacion | N declarado | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-narrow-r00-r03-eval | 1 | 7563/8000 | 94,54 % |
| seed-2 | sim-square-narrow-r00-r03-eval | 1 | 7710/8000 | 96,38 % |
| seed-3 | sim-square-narrow-r00-r03-eval | 1 | 7668/8000 | 95,85 % |
| seed-4 | sim-square-narrow-r00-r03-eval | 1 | 7648/8000 | 95,60 % |
| seed-5 | sim-square-narrow-r00-r03-eval | 1 | 7684/8000 | 96,05 % |
| Media (calculada) | sim-square-narrow-r00-r03-eval | 5 | 38273/40000 | 95,68 % |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), ni metricas adicionales de retorno, eficiencia de muestra o robustez. El campo N aparece con valor 1 en cada fila tal como lo reporta el autor; no se explica su significado en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican requisitos de memoria ni tamano de los tensores del checkpoint `policy.pt`.
- GPU recomendadas: no disponible. Al tratarse de una politica basada en estado para una tarea simulada, no se documenta ninguna GPU concreta.
- Encaje en GPU de consumo: no disponible. No hay datos publicados que permitan confirmarlo, aunque el tamano total del repositorio (1,4 GB para cinco semillas, incluidos normalizadores) es reducido en comparacion con modelos generativos.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a una politica de control; el artefacto se carga como checkpoint de PyTorch con los normalizadores de `stats.json`.
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de inferencia ni de coste por paso de control.
- Requisito de entorno: el simulador de la tarea `sim-square-narrow` y el codigo de investigacion de Mulligan en los commits indicados (por ejemplo `374f4f444036`, `66ea7b42a716`, `29155d0f0dcb`, `46b2b3a22e0a`) para reproducir entrenamiento y evaluacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints de la misma tarea con resultados publicados, ni especificaciones de modelos comparables (parametros, contexto, licencia y disponibilidad) que permitan una comparacion rigurosa. Como referencia metodologica externa existe la implementacion de IDQL en el repositorio `philippe-eecs/IDQL`, pero no se aportan metricas comparables entre ambas.

## Limitaciones y advertencias

- Ambito restringido: la politica esta entrenada especificamente para la tarea `sim-square-narrow`; no se declara capacidad de generalizacion a otras tareas, objetos o entornos.
- Entrada solo de estado: no procesa imagenes ni otro tipo de observacion sensorial, lo que limita su aplicacion directa a montajes con vision.
- Brecha simulacion-realidad: los resultados publicados son de simulacion; no hay evidencia en la informacion disponible de transferencia a un robot fisico.
- Riesgo de alucinacion: no aplicable en el sentido de modelos de lenguaje, pero si existe riesgo de acciones no validas o inseguras fuera de la distribucion de estados de entrenamiento.
- Idiomas: no aplicable; el modelo no procesa lenguaje natural.
- Limitaciones de contexto: no disponible; depende de la definicion de observacion del entorno, que no se detalla.
- Licencia: MIT, permisiva e incluye uso comercial, pero se heredan las condiciones de los datasets de entrenamiento, cuyos terminos no se detallan en la informacion disponible.
- Seguridad de carga: los ficheros `.pt` son pickles de PyTorch; deben cargarse unicamente en entornos de confianza, tal como advierte el propio autor.
- Trazabilidad: la varianza entre semillas es apreciable (de 7563 a 7710 exitos sobre 8000), por lo que conviene reportar la semilla utilizada en cualquier comparacion.
- Adopcion: el repositorio registra 0 descargas y 0 likes, de modo que no hay evidencia de uso o validacion por parte de terceros.
- Fecha de publicacion: los metadatos indican creacion y actualizacion en septiembre de 2026; conviene verificar la vigencia del codigo de investigacion asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset c00 teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset c01 DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Dataset c01 rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset c02 DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan
- Dataset c02 rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset c03 DAgger: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mulligan
- Dataset c03 rollouts de politica: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Dataset c03 DAgger mixto (encontrado en busqueda web): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mixed
- Referencia sobre la implementacion de IDQL (diffusion models): https://deepwiki.com/philippe-eecs/IDQL/3.1-diffusion-models
- Ficha externa del dataset c03 rollouts: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-mulligan-policy-rollouts
