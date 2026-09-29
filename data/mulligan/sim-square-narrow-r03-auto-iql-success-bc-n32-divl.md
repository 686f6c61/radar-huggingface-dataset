# mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-divl

## Resumen

`mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-divl` es un checkpoint de agente de control para robotica basado en estado, publicado por la organizacion Mulligan dentro de su campana de experimentos `sim-square-narrow`. No es un modelo de lenguaje: se trata de un agente de aprendizaje por refuerzo compuesto por el actor de difusion congelado del modelo padre y un critico DIVL con componente distribuacional. El repositorio contiene cinco semillas de entrenamiento (carpetas `seed-1` a `seed-5`), cada una con `policy.pt` y `stats.json`, correspondientes al paso de entrenamiento 150001.

El modelo resuelve la tarea `sim-square-narrow`, un escenario de ensamblaje robotico simulado en el que el agente debe insertar una pieza cuadrada en un hueco estrecho a partir de observaciones de estado. Su relevancia es metodologica: forma parte de una campana de auto-mejora iterativa (rondas R0 a R3) en la que se generan rollouts de politicas, se filtran los exitosos y se reentrena con esos datos, comparando variantes de critico. La variante `divl` se diferencia de la `idql` de la que hereda el actor por el tipo de critico utilizado.

Los resultados publicados en la propia model card sitúan la tasa de exito en el rango del 76,6 % al 78,7 % sobre 8000 rollouts de evaluacion por semilla, con una media calculada del 77,4 %. El checkpoint se distribuye bajo licencia MIT y los ficheros son copias byte a byte de artefactos de Weights & Biases verificadas por MD5 y SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion congelado (heredado del modelo padre) mas critico DIVL distribuacional; agente de control basado en estado, sin vision ni lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica; la entrada es la observacion de estado del entorno en cada paso, no una secuencia de texto |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en punto flotante de PyTorch) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle: `policy.pt` mas `stats.json`, una carpeta por semilla |
| Tarea | `sim-square-narrow` |
| Ronda del modelo | R3 |
| Brazo experimental | `auto-iql-success-bc-n32` |
| Celda de campana | `sq_d0_r3_auto_iql_success_bc_n32` |
| Semillas incluidas | 1, 2, 3, 4, 5 |
| Paso de entrenamiento | 150001 |
| Commit del codigo de investigacion | `3053203fc3df` |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

El agente combina dos componentes. Por un lado, el actor de difusion se toma congelado del modelo padre `mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-idql`; es decir, esta variante no reentrena el generador de acciones, sino que sustituye el componente de valor por un critico DIVL con formulacion distribuacional. La model card describe explicitamente el resultado como "agente basado en estado con el actor de difusion congelado del padre y un critico DIVL distribuacional". El repositorio publica `policy.pt` (pesos) y `stats.json` (estadisticas de normalizacion, presumiblemente de observaciones y acciones, aunque su contenido exacto no se detalla).

Los nombres de los artefactos de Weights & Biases (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) y de la campana (`square-dagger-mining-01a`) sugieren una canalizacion de entrenamiento que combina IQL, DDPG, clonacion de comportamiento (BC), IDQL y DIVL sobre datos recogidos con un bucle tipo DAgger. Esta composicion es una inferencia a partir de los identificadores publicados, no una descripcion explicita del autor.

En cuanto a los datos, el modelo se entrena con cuatro conjuntos: una linea base de teleoperacion (`c00-teleop-baseline`), rollouts de una politica IQL automatica (`c01-auto-iql-n32-policy-rollouts`) y dos rondas de rollouts filtrados por exito de politicas entrenadas con BC (`c02` y `c03-auto-iql-success-bc-n32-policy-rollouts`). No se especifica el numero total de transiciones, la composicion exacta del dataset ni si hubo etapas adicionales de ajuste.

## Capacidades

- Generacion de acciones de control continuo para la tarea de ensamblaje `sim-square-narrow` a partir de observaciones de estado.
- Muestreo mediante actor de difusion: la politica genera acciones por desruido iterativo, no por una pasada directa de una red determinista.
- Estimacion de valor distribuacional mediante el critico DIVL, util para seleccion de acciones y para el analisis de la campana de auto-mejora.
- Ejecucion de episodios completos de manipulacion (multi-step) en el simulador, ya que el agente opera en bucle cerrado sobre el entorno.
- Replicabilidad experimental: cinco semillas independientes permiten medir varianza entre ejecuciones del mismo brazo.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente basado en lenguaje, razonamiento simbolico ni planificacion textual.
- No dispone de capacidades multilingues: no procesa entrada ni salida en lenguaje natural.
- No dispone de vision: el agente es estrictamente basado en estado, sin entrada de imagen.
- No dispone de modo de razonamiento explicito ni de generacion de texto de ningun tipo.

## Casos de uso

- Reproduccion de experimentos de RL offline: cargar `policy.pt` y `stats.json` de cada semilla y reevaluar la politica sobre la misma rejilla de estados iniciales para verificar los recuentos de exito publicados (6128 a 6298 sobre 8000).
- Punto de partida para una ronda posterior de auto-mejora: el checkpoint es el artefacto final del paso 150001 de la campana `square-dagger-mining-01a`, por lo que sirve como politica generadora de rollouts para la siguiente iteracion de minado de datos.
- Estudio comparativo de criticos: al compartir actor congelado con la variante `idql` del mismo brazo, permite aislar el efecto del critico DIVL distribuacional frente a otras formulaciones de valor sin confundirlo con cambios en la politica.
- Generacion de datos de politica para clonacion de comportamiento: los rollouts de este agente pueden filtrarse por exito y anadirse a los conjuntos `c0x` para reentrenar variantes con BC, replicando el procedimiento que produjo este mismo modelo.
- Analisis de varianza entre semillas: con cinco semillas y 8000 rollouts de evaluacion por semilla, es adecuado para cuantificar la dispersion del rendimiento de un mismo brazo experimental antes de decidir si una mejora es significativa.
- Referencia interna de linea base en la arena de evaluacion de Mulligan: sirve como punto de comparacion publicado para otras celdas de campana de la misma tarea o de la variante `sim-square-broad`.
- Validacion de infraestructura de evaluacion: el modelo y su conjunto de evaluacion asociado permiten comprobar que un pipeline propio de simulacion reproduce los recuentos de exito reportados antes de lanzar experimentos nuevos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a un agente de control robotico. Los unicos datos de rendimiento son las evaluaciones sobre rejilla de estados iniciales retenidos, con 32 elementos en el campo N y 8000 rollouts por semilla:

| Semilla | N | Exitos / rollouts | Tasa de exito (calculada) |
|---|---|---|---|
| seed-1 | 32 | 6128 / 8000 | 76,6 % |
| seed-2 | 32 | 6151 / 8000 | 76,9 % |
| seed-3 | 32 | 6179 / 8000 | 77,2 % |
| seed-4 | 32 | 6298 / 8000 | 78,7 % |
| seed-5 | 32 | 6189 / 8000 | 77,4 % |
| Media de las cinco semillas | 32 | 6189 / 8000 | 77,4 % |

La media y la mediana de los recuentos de exito coinciden en 6189 sobre 8000. El conjunto de evaluacion utilizado es `mulligan/sim-square-narrow-r00-r03-eval`; los resultados por rollout estan en ese dataset, no en el repositorio del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La informacion publicada no incluye el numero de parametros ni el consumo de memoria del actor o del critico.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible. El unico dato de tamano es el repositorio completo, 1,4 GB para las cinco semillas, lo que no permite deducir el consumo en inferencia.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni servidores similares. El checkpoint es un `policy.pt` de PyTorch pensado para cargarse con el codigo de investigacion de Mulligan en el commit `3053203fc3df`, dentro del entorno de simulacion correspondiente.
- Latencia y throughput: no disponibles. Al usar un actor de difusion, el coste por accion depende del numero de pasos de desruido, que no se especifica.
- Requisito adicional: el despliegue real exige el simulador de la tarea `sim-square-narrow` y las dependencias del codigo de investigacion, no solo el fichero de pesos.

## Comparativa con modelos similares

No se dispone de resultados numericos publicos de los modelos comparables dentro de la informacion proporcionada, por lo que la comparacion se limita a la relacion entre variantes.

| Modelo | Tarea | Relacion | Parametros | Contexto | Licencia | Metricas publicas |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r03-auto-iql-success-bc-n32-divl` (este) | sim-square-narrow | Variante con critico DIVL distribuacional | no disponible | no aplica | MIT | 76,6 % a 78,7 % de exito por semilla |
| `mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-idql` | sim-square-narrow | Modelo padre: aporta el actor de difusion congelado | no disponible | no aplica | no disponible | no disponible |
| Variantes `sim-square-broad` (`c03-auto-iql-success-bc-n32-policy-rollouts`) | sim-square-broad | Misma familia de campana, tarea mas amplia | no disponible | no aplica | no disponible | no disponible |

No se identifican en la informacion disponible alternativas externas de otros autores directamente comparables para esta tarea y este brazo experimental.

## Limitaciones y advertencias

- Ambito muy restringido: el agente esta especializado en la tarea `sim-square-narrow` y no es reutilizable tal cual para otras tareas de manipulacion sin reentrenamiento.
- Entorno simulado: no hay evidencia publicada de transferencia a robot real (sim-to-real), ni de robustez frente a ruido sensorial o variaciones fisicas no modeladas.
- Entrada exclusivamente de estado: no admite imagenes, lenguaje ni instrucciones; no puede usarse como asistente, chatbot ni componente de un pipeline de texto.
- Sin soporte de tool calling, function calling ni razonamiento multi-paso de tipo lenguaje. La unica secuencialidad es la ejecucion de episodios en el simulador.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo equivalente es la ejecucion de acciones incorrectas en estados fuera de la distribucion de entrenamiento, y no se publican cotas de ese comportamiento.
- Politica congelada: al no reentrenarse el actor, las ganancias de esta variante dependen exclusivamente del cambio de critico; no cabe esperar mejoras de la capacidad de representacion de la politica.
- Varianza entre semillas: la tasa de exito varia entre 76,6 % y 78,7 %, una horquilla de 2,1 puntos porcentuales que debe tenerse en cuenta antes de declarar mejoras en comparaciones de una sola semilla.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la ficha, y autor unico, sin revision externa ni resultados replicados por terceros.
- Ficheros `.pt` son pickles de PyTorch: la propia model card advierte de que solo deben cargarse en entornos de confianza, ya que la deserializacion puede ejecutar codigo arbitrario.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con aviso de copyright, pero la licencia no cubre derechos sobre los datos de entrenamiento ni sobre el simulador subyacente, cuyo regimen no se detalla.
- Falta de informacion operativa: no se publican numero de parametros, requisitos de memoria, latencia ni instrucciones de despliegue, lo que dificulta dimensionar una integracion en produccion.
- Trazabilidad dependiente de W&B: el entrenamiento y las evaluaciones se documentan mediante artefactos y ejecuciones alojados en Weights & Biases, por lo que la reproducibilidad completa depende de la disponibilidad de esos recursos y del commit `3053203fc3df`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-divl
- Modelo padre (actor de difusion congelado, variante idql): https://huggingface.co/mulligan/sim-square-narrow-r03-auto-iql-success-bc-n32-idql
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Sitio del proyecto Mulligan: https://mulligan.page
- Arena de evaluacion de politicas: https://arena.mulligan.page
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset c00 (teleoperacion, linea base): https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset c01 (rollouts de politica auto-iql n32): https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-iql-n32-policy-rollouts
- Dataset c02 (rollouts filtrados por exito, auto-iql-success-bc n32): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset c03 (rollouts filtrados por exito, auto-iql-success-bc n32): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
- Listado de datasets etiquetados `sim-square-narrow`: https://huggingface.co/datasets?other=sim-square-narrow
- Listado de datasets etiquetados `sim-square-broad`: https://huggingface.co/datasets?other=sim-square-broad
- Paper o blog tecnico del metodo: no disponible
- Repositorio de codigo: no disponible publicamente (se referencia el commit `3053203fc3df` del codigo de investigacion de Mulligan, sin URL en la informacion proporcionada)
- Demo interactiva: no disponible
