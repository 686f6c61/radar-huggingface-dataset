# mulligan/sim-square-narrow-r03-mining-no-cf-idql

## Resumen

sim-square-narrow-r03-mining-no-cf-idql es una politica de control para robotica entrenada con el algoritmo IDQL (Implicit Diffusion Q-Learning): un actor de difusion que genera acciones y un critico escalar basado en IQL. Lo publica el proyecto Mulligan, que mantiene un ecosistema de agentes para tareas de manipulacion simulada y un portal publico de evaluaciones denominado Policy Arena. No es un modelo de lenguaje ni un modelo de vision-lenguaje: consume vectores de estado (state-based) y produce acciones de control.

El modelo resuelve la tarea simulada sim-square-narrow, dentro de la ronda R3 de la campana y del brazo experimental "mining-no-cf", con la celda de campana `sq_d0_r3_ours_grid_cell_bonus_b1p0_nocf_human_only`. Se entrega como cinco checkpoints independientes (semillas 1 a 5), todos en el paso de entrenamiento 150001, lo que permite medir varianza entre semillas. El repositorio pesa 1,4 GB en total.

Su relevancia es de caracter metodologico: forma parte de una linea de investigacion sobre aprendizaje por refuerzo offline e imitacion iterativa (teleoperacion, agregacion tipo DAgger y rollouts de politica), y su interes principal es servir como material reproducible para comparar agentes dentro del mismo banco de evaluacion. La model card no declara numero de parametros, ni arquitectura de red detallada, ni cifras de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | actor de difusion (generador de acciones) con critico escalar IQL; agente IDQL basado en estado (state-based) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observacion es un vector de estado del entorno) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas ni formatos de inferencia alternativos) |
| Idiomas soportados | no aplica (politica de control; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint `policy.pt` (pickle de PyTorch) y normalizadores `stats.json`; metadatos de publicacion en `release.json` |
| Tarea | sim-square-narrow |
| Ronda del modelo | R3 |
| Brazo experimental | mining-no-cf |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1,4 GB |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor generativo de difusion que modela la distribucion de acciones y un critico escalar entrenado con el objetivo de IQL (regresion por expectil, sin consultar acciones fuera de las del dataset). La extraccion de politica se hace reweightando o filtrando las muestras del actor segun el valor estimado por el critico. La model card lo describe literalmente como "state-based IDQL agent: diffusion actor with scalar IQL critic". Los nombres de los artefactos de W&B (`iql_ddpg_bc_idql_nutassemblysquare_...`) indican que el entrenamiento se ejecuto en una base de codigo que tambien aloja implementaciones de IQL y de DDPG+BC, y que la tarea esta registrada internamente como `nutassemblysquare`.

El entrenamiento es iterativo, no un simple ajuste offline: los datasets asociados cubren teleoperacion con muestreo Sobol, rondas de agregacion de datos tipo DAgger etiquetadas como `dagger-mining-no-cf` y rollouts de politica de las rondas c01 a c03 (con prefijos `sobol` y `mulligan`). Los cinco checkpoints son copias byte a byte de artefactos de Weights & Biases, con MD5 verificado contra el manifiesto del artefacto y SHA-256 registrado en `release.json`, y se entrenaron en los commits `7c7edbfe73f0`, `e74e85956046`, `29155d0f0dcb`, `46b2b3a22e0a` (semillas 4 y 5 comparten commit). El significado del sufijo "no-cf" del brazo experimental no se define en la model card: no disponible.

## Capacidades

- Control de manipulacion en simulacion para la tarea sim-square-narrow, a partir de observaciones de estado.
- Generacion de acciones multimodales mediante actor de difusion, lo que permite representar distribuciones de acciones multimodales en lugar de una unica accion media.
- Extraccion de politica offline con critico escalar IQL, sin necesidad de interaccion online durante el calculo del objetivo.
- Ejecucion determinista o estocastica segun el numero de muestras del actor y el criterio de seleccion por valor.
- Reproducibilidad por semilla: cinco politicas independientes entrenadas hasta el mismo paso (150001).
- Integracion en pipelines de evaluacion del ecosistema Mulligan (Policy Arena) y con los datasets de rollouts publicados.
- Tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio y modo de razonamiento: no aplica, no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Evaluacion comparativa de algoritmos de RL offline: usar los cinco checkpoints como linea base de IDQL en sim-square-narrow y comparar contra otros brazos de la misma campana dentro de Policy Arena, aprovechando que todas las semillas estan en el mismo paso de entrenamiento.
- Estudio de varianza entre semillas: al existir cinco politicas independientes, permite estimar la dispersion del rendimiento de una misma configuracion y detectar si una mejora observada es significativa o ruido.
- Investigacion en imitacion iterativa tipo DAgger: los datasets `*-dagger-mining-no-cf` y los rollouts de politica permiten reproducir ciclos de recogida de datos, reentrenamiento y evaluacion, y analizar el efecto de cada ronda.
- Ablacion de componentes: al compartir base de codigo con IQL y DDPG+BC (segun los nombres de los artefactos), sirve para aislar la contribucion del actor de difusion frente a politica de extraccion de un solo paso.
- Desarrollo de infraestructura de evaluacion: el checkpoint y `stats.json` permiten levantar un runner de evaluacion en simulacion para validar entornos, normalizadores y metricas antes de escalar a campanas mayores.
- Base para experimentos de sim-to-real: por ser un agente basado en estado y de pesos ligeros, es un candidato razonable para probar la transferencia de politica aprendida en simulacion a un montaje real de la misma tarea, asumiendo la brecha de observacion entre estado simulado y sensado real.
- Analisis de fallos y analisis de datos de rollout: comparar las trayectorias de los datasets `*-mulligan-policy-rollouts` con las de `*-sobol-policy-rollouts` para identificar modos de fallo recurrentes y dirigir la siguiente ronda de mineria de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, retorno medio, ni comparaciones numericas. El unico indicio de evaluacion es que el repositorio declara estar referenciado por los metadatos del dataset `mulligan/sim-square-narrow-r00-r03-eval`, que actua como banco de evaluacion de las rondas R00 a R03, pero no se proporcionan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se documenta el tamano de la red ni el consumo. Como referencia indirecta, el repositorio completo ocupa 1,4 GB para cinco semillas (aproximadamente 280 MB por semilla, incluyendo actor, critico y normalizadores); se trata, por tanto, de checkpoints ligeros en comparacion con modelos generativos de gran escala.
- GPU recomendadas: no disponibles en la documentacion. Por el tipo de agente (politica basada en estado, no en imagenes) es esperable que funcione en GPU de gama media o incluso en CPU, pero esto es una estimacion no verificada y no un dato publicado.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del checkpoint, aunque no hay confirmacion oficial. Requiere verificacion con el codigo de Mulligan en los commits indicados.
- Opciones de despliegue: no se documentan servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama; esos formatos no aplican a un checkpoint `.pt` de un agente de control. El despliegue natural es cargar `policy.pt` con PyTorch junto a `stats.json` para normalizar observaciones, dentro del entorno de simulacion correspondiente.
- Latencia y throughput: no disponibles.
- Advertencia de seguridad en la carga: los archivos `.pt` son pickles de PyTorch; deben cargarse unicamente en un entorno de confianza.

## Comparativa con modelos similares

No hay datos verificados de parametros, contexto ni rendimiento de este modelo, y la informacion proporcionada no incluye cifras de otros agentes. La comparacion solo puede ser cualitativa, por familia de metodo.

| Alternativa | Tipo de metodo | Datos comparativos disponibles |
|---|---|---|
| mulligan/sim-square-narrow-r03-mining-no-cf-idql | IDQL: actor de difusion + critico escalar IQL | no disponible (sin benchmarks publicados) |
| Implementaciones de IQL (misma base de codigo, segun nombres de artefactos) | RL offline con expectil, sin actor generativo | no disponible |
| Implementaciones de DDPG+BC (misma base de codigo, segun nombres de artefactos) | Actor-critico determinista con regularizacion conductual | no disponible |
| Otros brazos de la campana Mulligan sobre sim-square-narrow | Variantes de recogida de datos y extraccion de politica | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo ni de cobertura del dataset de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido linguistico; en su lugar existe riesgo de acciones fuera de distribucion cuando la politica se evalua en estados no representados en los datos de teleoperacion y rollouts.
- Especificidad de tarea: el modelo esta entrenado para sim-square-narrow y no se declara ninguna capacidad de generalizacion a otras tareas, entornos o morfologias de robot.
- Limitacion de observacion: es un agente basado en estado, por lo que no procesa imagenes ni entradas multimodales; requiere acceso al vector de estado del entorno.
- Idiomas: no aplica; no hay soporte de lenguaje ni de instrucciones en lenguaje natural.
- Licencia: MIT, lo que permite uso comercial y modificacion, pero la propia model card advierte que los checkpoints son pickles de PyTorch y deben cargarse solo en entornos de confianza.
- Caveat de procedencia: los pesos son copias byte a byte de artefactos de W&B, verificadas por MD5 y con SHA-256 en `release.json`; cualquier reproduccion adicional depende de disponer de la base de codigo de Mulligan en los commits indicados.
- Ausencia de cifras: sin tasas de exito publicadas no es posible afirmar que el modelo sea competitivo frente a alternativas; cualquier afirmacion de rendimiento exigiria una evaluacion propia.
- Metadatos incompletos: no se documentan parametros, hiperparametros, composicion exacta del dataset ni el significado del sufijo "no-cf" del brazo experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-mining-no-cf-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset sim-square-narrow-c00-teleop-sobol: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset sim-square-narrow-c01-dagger-mining-no-cf: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mining-no-cf
- Dataset sim-square-narrow-c01-sobol-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset sim-square-narrow-c02-dagger-mining-no-cf: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mining-no-cf
- Dataset sim-square-narrow-c02-mulligan-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset sim-square-narrow-c03-dagger-mining-no-cf: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mining-no-cf
- Dataset sim-square-narrow-c03-mulligan-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Dataset de evaluacion referenciado: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
