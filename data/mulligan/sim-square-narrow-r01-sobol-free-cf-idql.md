# mulligan/sim-square-narrow-r01-sobol-free-cf-idql

## Resumen

`mulligan/sim-square-narrow-r01-sobol-free-cf-idql` es un agente de aprendizaje por refuerzo offline para robótica, publicado por el proyecto Mulligan. No es un modelo de lenguaje: se trata de una política de control basada en estado (las observaciones son vectores de estado, no imagenes) que combina un actor de difusion con un critico escalar IQL, la formulacion conocida como IDQL. El artefacto distribuido es un checkpoint de PyTorch (`policy.pt`) acompañado de `stats.json` con los normalizadores de observaciones y acciones.

El modelo corresponde a la ronda R1 del brazo `sobol-free-cf` dentro de la celda de campana `sq_d0_r1_ours_sobol_freecf_human_only`, y se publica con cinco semillas independientes (1 a 5), cada una en su propia carpeta, todas ellas entrenadas hasta el paso 150001. Se entrenó sobre tres datasets del ecosistema Mulligan que combinan teleoperacion, datos DAgger y rollouts de politica, lo que lo situa en un flujo de aprendizaje por imitacion iterativo con correccion humana.

Su relevancia es acotada y de caracter experimental: sirve como referencia reproducible para evaluar agentes IDQL en la tarea simulada `sim-square-narrow`, y esta pensado para compararse con otras rondas y brazos dentro de la plataforma Policy Arena de Mulligan. No se han publicado parametros, resultados de benchmarks ni cifras de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion (diffusion policy) con critico escalar IQL; agente IDQL basado en estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: es una politica de control, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | Checkpoint de PyTorch (`.pt`) mas `stats.json` con normalizadores |
| Tarea | sim-square-narrow |
| Ronda del modelo | R1 |
| Brazo | sobol-free-cf |
| Celda de campana | `sq_d0_r1_ours_sobol_freecf_human_only` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | robotics |
| Datasets de entrenamiento | `mulligan/sim-square-narrow-c00-teleop-sobol`, `mulligan/sim-square-narrow-c01-dagger-sobol-free-cf`, `mulligan/sim-square-narrow-c01-sobol-policy-rollouts` |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card es un agente IDQL: un actor de difusion que modela la distribucion de acciones y un critico escalar entrenado con IQL (Implicit Q-Learning). El esquema IDQL permite combinar el modelado generativo de acciones del actor de difusion con el aprendizaje de valor conservador del critico, de forma que la politica no necesita consultar acciones fuera de la distribucion del dataset. El modelo es *state-based*: consume observaciones de estado en lugar de imagenes, y la normalizacion se aplica con los valores guardados en `stats.json`.

No se especifican en la informacion disponible ni el numero de parametros, ni el tamano de las capas, ni el numero de pasos de difusion, ni la composicion exacta de los datos de entrenamiento (numero de transiciones, proporcion de datos humanos frente a rollouts). Los datasets empleados si estan identificados: teleoperacion con muestreo Sobol, datos DAgger con intervencion humana (`sobol-free-cf`) y rollouts de politica, lo que indica un ciclo de mejora iterativa tipo DAgger con datos humanos solo en la fase de correccion. El entrenamiento se realizo con el codigo de investigacion de Mulligan en los commits `1d6f645075c7` y `55e127140163`, y los checkpoints son copias byte a byte de los artefactos de Weights & Biases correspondientes, verificadas por MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Control de manipulacion robotica en simulacion a partir de observaciones de estado: genera acciones continuas para la tarea `sim-square-narrow`.
- Modelado multimodal de acciones: el actor de difusion puede representar distribuciones de acciones multimodales, algo util cuando existen varias soluciones validas para una misma observacion.
- Estimacion de valor: el critico escalar IQL permite puntuar estados y acciones, lo que facilita analisis de calidad de politica y seleccion de acciones.
- Reproducibilidad entre semillas: se publican cinco semillas independientes del mismo brazo y ronda, lo que permite medir varianza de entrenamiento.
- Soporte de flujo DAgger: los datos `dagger-sobol-free-cf` y los rollouts de politica sugieren que el modelo esta pensado para integrarse en un bucle iterativo de recogida de datos y reentrenamiento.
- Verificacion de integridad: los artefactos incluyen comprobaciones MD5 y SHA-256, lo que facilita auditar la procedencia de los pesos.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue. Cualquier uso de esas capacidades queda fuera del alcance del modelo.

## Casos de uso

- Investigacion en aprendizaje por refuerzo offline: sirve como implementacion de referencia de IDQL en una tarea simulada concreta, permitiendo comparar el algoritmo frente a otras familias (IQL puro, CQL, TD3+BC, diffusion policy condicionada) bajo el mismo entorno y presupuesto de datos.
- Generacion de datos para DAgger iterativo: los checkpoints pueden desplegarse en simulacion para producir nuevos rollouts que alimenten el dataset `sim-square-narrow-c01-sobol-policy-rollouts`, cerrando el ciclo de mejora con correcciones humanas selectivas.
- Analisis de varianza entre semillas: al publicarse cinco semillas con el mismo paso de entrenamiento, es posible estudiar la estabilidad del algoritmo y distinguir mejoras reales de ruido de inicializacion.
- Evaluacion comparativa en plataforma externa: el modelo esta preparado para registrarse y compararse en Policy Arena, lo que permite contrastar el brazo `sobol-free-cf` con otras variantes de la misma campana.
- Punto de partida para transferencia sim-to-real: una politica de control basada en estado y de tamano reducido es un candidato razonable para estudiar tecnicas de adaptacion de dominio antes de asumir el coste de un modelo con vision.
- Estimacion de valor y analisis de politica: el critico escalar permite puntuar trayectorias y detectar estados donde la politica se aleja de la distribucion de datos, util en auditorias de seguridad antes de desplegar en un robot real.
- Docencia y prototipado en laboratorios de robotica: el repositorio es pequeno (1,4 GB), la licencia es MIT y los pesos son cargables con PyTorch estandar, lo que reduce la barrera para montar practicas reproducibles.
- Integracion como modulo de control en un bucle de simulacion propio: la politica puede invocarse desde un script de PyTorch que reciba observaciones de estado y devuelva acciones, usando `stats.json` para normalizar; requiere implementar el entorno `sim-square-narrow` o uno compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exito en la tarea, retorno medio, tasas de exito por semilla ni comparaciones numericas con otros agentes. El unico indicio de evaluacion es la referencia al dataset `sim-square-narrow-r00-r03-eval`, que apunta a una evaluacion externa dentro del ecosistema Mulligan, pero sin cifras disponibles.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en `sim-square-narrow` | no disponible |
| Retorno medio por semilla | no disponible |
| Comparacion con otros brazos o rondas | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras oficiales.
- Observacion sobre el tamano: el repositorio completo ocupa 1,4 GB e incluye cinco semillas mas metadatos, por lo que cada checkpoint individual es previsiblemente pequeno. Se trata de una inferencia a partir del tamano del repo, no de un dato confirmado.
- GPU recomendadas: no disponible. Para politicas de difusion basadas en estado (habitualmente implementadas con perceptrones multicapa), la inferencia suele ser viable en CPU, aunque no hay confirmacion en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos que permitan afirmar si cabe en una RTX 4090 u otras GPU de gama consumer.
- Opciones de despliegue: carga directa del checkpoint `policy.pt` con PyTorch, aplicando los normalizadores de `stats.json`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del numero de pasos de difusion del actor y del hardware, parametros que no se especifican.
- Nota de seguridad: los ficheros `.pt` son pickles de PyTorch; deben cargarse unicamente en entornos de confianza.

## Comparativa con modelos similares

No se dispone de informacion detallada sobre otros modelos comparables. Dentro del propio ecosistema Mulligan existen otras rondas y brazos (por ejemplo, la evaluacion referenciada `sim-square-narrow-r00-r03-eval`), pero no se publican sus especificaciones ni resultados en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mulligan/sim-square-narrow-r01-sobol-free-cf-idql` | no disponible | no aplica | no disponible | MIT | Publico en HuggingFace, 0 descargas |
| Otras rondas de Mulligan (r00, r03) | no disponible | no aplica | no disponible | no disponible | Referenciadas en metadatos, sin ficha disponible |
| Alternativas externas de IDQL o diffusion policy | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito muy restringido: el modelo esta entrenado exclusivamente para la tarea simulada `sim-square-narrow`. No es reutilizable como politica general ni como modelo de proposito general.
- Naturaleza *state-based*: no procesa imagenes ni entradas multimodales, por lo que no puede emplearse en configuraciones que dependan de vision.
- Sin datos de rendimiento: al no publicarse tasas de exito ni retornos, no es posible validar la calidad de la politica a partir de la informacion disponible.
- Sin contextualizacion de la tarea: la model card no describe el entorno, el espacio de observaciones, el espacio de acciones, los criterios de exito ni la herramienta de simulacion empleada, lo que dificulta la reproduccion fuera del codigo de investigacion de Mulligan.
- Procedencia dependiente del codigo original: los checkpoints se entrenaron y evaluaron con los commits indicados del codigo de investigacion de Mulligan; la inferencia fuera de ese entorno puede requerir trabajo de adaptacion.
- Riesgo de seguridad al cargar pesos: los ficheros `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarlos. Deben cargarse solo en entornos de confianza y, preferiblemente, tras verificar los hashes SHA-256 de `release.json`.
- Sesgos y generalizacion: los datos incluyen teleoperacion y correcciones humanas (`human_only`), por lo que la politica hereda los sesgos y las limitaciones de cobertura de esas demostraciones. No hay analisis publicado de sesgos ni de robustez ante cambios de distribucion.
- Licencia permisiva con caveats practicos: la licencia MIT permite uso comercial y modificacion, pero la ausencia de documentacion de rendimiento y de soporte hace desaconsejable un despliegue en produccion sin una evaluacion propia.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Idiomas: no aplica. El modelo no procesa ni genera lenguaje.
- Fechas de publicacion: el repositorio figura creado y actualizado el 29 de septiembre de 2026 segun los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-sobol-free-cf-idql
- Proyecto Mulligan: https://mulligan.page
- Plataforma de evaluacion Policy Arena: https://arena.mulligan.page
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset `mulligan/sim-square-narrow-c00-teleop-sobol`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset `mulligan/sim-square-narrow-c01-dagger-sobol-free-cf`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-sobol-free-cf
- Dataset `mulligan/sim-square-narrow-c01-sobol-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de evaluacion `mulligan/sim-square-narrow-r00-r03-eval`: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Paper o publicacion tecnica del proyecto: no disponible
- Repositorio de codigo: no disponible (se referencian unicamente commits internos, sin URL publica)
- Demos: no disponibles
