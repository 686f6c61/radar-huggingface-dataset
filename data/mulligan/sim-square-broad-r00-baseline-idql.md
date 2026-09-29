# mulligan/sim-square-broad-r00-baseline-idql

## Resumen

`mulligan/sim-square-broad-r00-baseline-idql` es un checkpoint de politica de control robotico entrenado con IDQL (Implicit Diffusion Q-Learning). No es un modelo de lenguaje: se trata de un agente state-based compuesto por un actor de difusion y un critico escalar IQL, distribuido como cinco carpetas (`seed-1` a `seed-5`), una por semilla de entrenamiento, cada una con un fichero `policy.pt` de PyTorch y un `stats.json` con los normalizadores de observaciones y acciones.

El modelo pertenece a la campana de investigacion Mulligan, dentro de la tarea `sim-square-broad`, y corresponde a la ronda R0 con el brazo `baseline` (celda de campana `sq_d1_r0_baseline_uniform`). Se entreno sobre el dataset de teleoperacion `mulligan/sim-square-broad-c00-teleop-baseline` hasta el paso 250001. Los artefactos originales provienen de ejecuciones de Weights & Biases del proyecto `self-improving/square-d1-dagger-mining-01a`, y los ficheros publicados son copias identicas byte a byte verificadas por MD5 contra el manifiesto del artefacto, con SHA-256 registrado en `release.json`.

Su relevancia es la de un baseline reproducible: fija una referencia cuantitativa (~50 % de exito medio en la evaluacion publicada) contra la que comparar brazos posteriores (auto-BC, auto-IQL, rondas R03) dentro del mismo banco de pruebas. La model card no documenta el numero de parametros, la arquitectura exacta de las redes ni el simulador subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion (politica generativa por difusion) con critico escalar IQL; red neuronal feed-forward, no transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector de estado) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en el formato entregado por el entrenamiento) |
| Idiomas soportados | no aplica (modelo de control robotico, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch checkpoint (`policy.pt`, pickle de PyTorch) + `stats.json` con normalizadores |
| Tarea | `sim-square-broad` |
| Ronda / brazo | R0 / `baseline` |
| Celda de campana | `sq_d1_r0_baseline_uniform` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Dataset de entrenamiento | `mulligan/sim-square-broad-c00-teleop-baseline` |
| Tamano del repositorio | 1,4 GB (aproximadamente 280 MB por semilla) |
| Pipeline declarado en HuggingFace | robotics |
| Idiomas declarados en HuggingFace | no disponibles |

## Arquitectura y entrenamiento

El agente es un IDQL: combina un actor de difusion que modela la distribucion de acciones con un critico escalar entrenado con Implicit Q-Learning. En inferencia, la politica genera acciones muestreando el proceso de difusion y seleccionando entre las candidatas generadas mediante el critico, lo que permite representar distribuciones de accion multimodales propias de datos de teleoperacion con multiples estrategias validas. Los nombres de los artefactos de origen (`iql_ddpg_bc_idql_square_d1_*`) indican que el mismo codigo de investigacion soporta variantes IQL, DDPG+BC e IDQL, aunque la model card no detalla la configuracion concreta de red, numero de pasos de difusion ni hiperparametros.

El entrenamiento se hizo sobre el dataset de teleoperacion `sim-square-broad-c00-teleop-baseline` hasta el paso 250001, en cinco ejecuciones independientes dentro de la campana `square-d1-dagger-mining-01a` (commits de git `56db5a8b9fca`, `42cda0628b1c`, `48f10b2f42d2`, `42cda0628b1c` y `5aa32073002a`). No se documenta el numero de transiciones del dataset, la composicion de las observaciones, si hubo fases de RLHF/DPO (no aplica en control) ni si se aplico decodificacion especulativa o alguna innovacion de atencion. El nombre de la campana sugiere un proceso de minado tipo DAgger, pero la model card no describe ese procedimiento.

## Capacidades

- Control robotico a partir de estado (state-based): produce acciones continuas a partir de un vector de observacion normalizado.
- Politica generativa por difusion: puede representar distribuciones de accion multimodales, a diferencia de una politica unimodal tipo DDPG+BC.
- Seleccion de accion guiada por critico: el critico escalar IQL puntua las candidatas generadas por el actor.
- Entrenamiento offline: la politica se entrena sin interaccion adicional con el entorno, a partir de datos de teleoperacion.
- Reproducibilidad multi-semilla: se publican cinco semillas independientes del mismo brazo y paso de entrenamiento.
- Generacion de rollouts para datasets derivados: el modelo es referenciado por los datasets `sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts` y `sim-square-broad-c01-auto-iql-n32-policy-rollouts`.
- Tool calling / function calling: no soportado (no aplica).
- Agentes conversacionales o razonamiento multi-paso en lenguaje: no soportado (no aplica).
- Capacidades multilingues: no aplica.
- Vision, audio, thinking mode: no disponibles (el checkpoint es state-based segun la model card).

## Casos de uso

- Baseline de referencia en experimentos de RL offline: sirve como punto de comparacion fijo (mismo paso de entrenamiento, mismo dataset, cinco semillas) para medir la mejora de brazos posteriores como auto-BC o auto-IQL en la tarea `sim-square-broad`.
- Evaluacion de robustez ante condiciones iniciales: la evaluacion publicada incluye una rejilla de estados iniciales reservados, lo que permite analizar como varia la tasa de exito cuando cambian las condiciones de partida.
- Analisis de varianza entre semillas: con cinco semillas al mismo paso de entrenamiento, el modelo permite estimar la dispersion de rendimiento atribuible unicamente a la inicializacion y al orden de los datos.
- Punto de partida para recoleccion de datos tipo DAgger: al ser el brazo baseline de una campana de minado, puede usarse para generar rollouts que despues se agregan al dataset de entrenamiento en rondas posteriores.
- Generacion de rollouts etiquetados para destilacion: sus trayectorias pueden alimentar datasets de politicas compartidas (`shared-policy-rollouts`) o de IQL con 32 muestras.
- Comparacion de algoritmos sobre los mismos datos de teleoperacion: al compartir dataset con variantes IQL y DDPG+BC del mismo codigo, permite aislar el efecto del componente de difusion.
- Validacion de infraestructura de evaluacion: util para verificar pipelines de simulacion, normalizadores y protocolos de evaluacion antes de lanzar campanas mas costosas.

## Benchmarks y rendimiento

Unicos resultados publicados en la model card: evaluacion sobre una rejilla reservada de estados iniciales. Los resultados por rollout estan en el dataset `mulligan/sim-square-broad-r00-r03-eval`.

| Semilla | N | Exitos / Total | Tasa de exito |
|---|---|---|---|
| seed-1 | 1 | 15028 / 30000 | 50,09 % |
| seed-1 | 32 | 14654 / 30000 | 48,85 % |
| seed-2 | 1 | 16092 / 30000 | 53,64 % |
| seed-2 | 32 | 15550 / 30000 | 51,83 % |
| seed-3 | 1 | 14688 / 30000 | 48,96 % |
| seed-3 | 32 | 14125 / 30000 | 47,08 % |
| seed-4 | 1 | 15457 / 30000 | 51,52 % |
| seed-4 | 32 | 14637 / 30000 | 48,79 % |
| seed-5 | 1 | 15073 / 30000 | 50,24 % |
| seed-5 | 32 | 14676 / 30000 | 48,92 % |

Agregados calculados a partir de la tabla anterior: media de 50,89 % para N=1 (rango 48,96 %–53,64 %) y media de 49,09 % para N=32 (rango 47,08 %–51,83 %). El significado de la columna N no se documenta en la model card; en todos los casos la diferencia entre N=1 y N=32 es pequena (entre 0,6 y 1,8 puntos porcentuales). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark de lenguaje, porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM para inferencia: no disponible. La model card no declara el tamano de red ni el uso de memoria.
- Estimacion indirecta no confirmada: el repositorio ocupa 1,4 GB para cinco semillas, es decir, aproximadamente 280 MB por semilla. Si el contenido fuese exclusivamente pesos en fp32, el orden de magnitud seria de decenas de millones de parametros, pero el repositorio puede incluir otros ficheros y la model card no lo especifica.
- GPU recomendadas: no disponible. Al ser una politica state-based de una sola tarea, el coste de inferencia es previsiblemente muy inferior al de un modelo de lenguaje, pero no hay datos publicados.
- GPU de consumo: no disponible. No se documenta si el checkpoint cabe en GPU consumer ni en cuales.
- Opciones de despliegue: inferencia directa con PyTorch cargando `policy.pt` junto con `stats.json`. No aplican herramientas de servido de LLM como vLLM, TGI, llama.cpp u Ollama, ya que el formato no es safetensors ni GGUF y el modelo no recibe texto.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por paso ni de acciones por segundo.

## Comparativa con modelos similares

No disponible. La model card no publica metricas comparativas frente a otros modelos. Los unicos elementos comparables son variantes del mismo codigo de investigacion y otros brazos de la misma campana, para los que existen artefactos de datos pero no resultados de evaluacion publicados en esta ficha.

| Elemento comparable | Relacion | Datos disponibles |
|---|---|---|
| Variantes IQL / DDPG+BC del mismo codigo | Mismo repositorio de investigacion, segun los nombres de los artefactos W&B | Sin metricas publicadas en esta model card |
| Brazo auto-BC (`sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts`) | Referencia este modelo en los metadatos del dataset | Sin tasas de exito publicadas aqui |
| Brazo auto-IQL con 32 muestras (`sim-square-broad-c01-auto-iql-n32-policy-rollouts`) | Referencia este modelo en los metadatos del dataset | Sin tasas de exito publicadas aqui |
| Dataset de teleoperacion `sim-square-broad-c00-teleop-baseline` | Fuente de datos de entrenamiento | No es un modelo, no comparable en rendimiento |

## Limitaciones y advertencias

- Tasa de exito en torno al 50 %: entre el 47,08 % y el 53,64 % segun semilla y configuracion de evaluacion. Es un baseline, no una politica lista para produccion.
- Alcance limitado a una sola tarea: `sim-square-broad`, en entorno simulado. No hay evidencia de transferencia a robot real ni a otras tareas.
- Modelo state-based: la model card no menciona entrada de vision, por lo que no puede aplicarse directamente a configuraciones que requieran percepcion visual.
- Riesgo de sobreajuste al dataset de teleoperacion: al ser un metodo offline, el rendimiento fuera de la distribucion de estados del dataset `c00-teleop-baseline` no esta caracterizado para esta politica.
- Dependencia de `stats.json`: cargar `policy.pt` sin los normalizadores correspondientes de la misma semilla produce acciones incorrectas.
- Ficheros `.pt` son pickles de PyTorch: la propia model card advierte de que solo deben cargarse en entornos de confianza, ya que la deserializacion de un pickle puede ejecutar codigo arbitrario.
- Sin documentacion de sesgos: no aplica el concepto de sesgo linguistico, pero si existe un sesgo de comportamiento heredado de los datos de teleoperacion, que no se analiza en la model card.
- Ambiguedad de versionado: los checkpoints corresponden a commits de git distintos entre semillas; dos semillas comparten commit (`42cda0628b1c`) y las otras tres usan commits diferentes.
- Licencia: apache-2.0, que permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia. No se declaran restricciones adicionales de uso.
- Ausencia de garantias: no hay informacion sobre numero de parametros, configuracion de red, simulador ni protocolo de evaluacion mas alla de la rejilla de estados iniciales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r00-baseline-idql
- Proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset de rollouts auto-BC: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de rollouts auto-IQL (N=32): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
