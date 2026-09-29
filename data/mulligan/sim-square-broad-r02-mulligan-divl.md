# mulligan/sim-square-broad-r02-mulligan-divl

## Resumen

sim-square-broad-r02-mulligan-divl es un checkpoint de agente de control para robotica publicado por la organizacion Mulligan en Hugging Face. No es un modelo de lenguaje: se trata de una politica entrenada por aprendizaje por refuerzo para la tarea de simulacion denominada sim-square-broad, distribuida como un fichero `policy.pt` de PyTorch mas un `stats.json` con estadisticas de normalizacion. La model card lo describe literalmente como un agente basado en estado (state-based) que combina el actor de difusion congelado del modelo padre con un critico DIVL de tipo distribucional.

La relevancia del artefacto es de investigacion en RL y robotica: forma parte de la campana `sq_d1_r2_ours_mining_freecf_human_only` y cubre cinco semillas independientes (seed-1 a seed-5), todas ellas entrenadas hasta el paso 250001. El actor congelado procede del modelo sim-square-broad-r02-mulligan-idql, de modo que este repositorio aisla el efecto del critico DIVL sobre una politica ya existente, lo que lo hace util para experimentos controlados de reproducibilidad.

El repositorio ocupa 1,4 GB en total, lo que equivale a aproximadamente 280 MB por semilla. Los resultados de evaluacion publicados en la propia model card sobre una rejilla de estados iniciales no vistos se situan en torno al 82 % de exito de media, con muy poca dispersion entre semillas. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL basado en estado: actor de difusion congelado (heredado del modelo padre) mas critico DIVL distribucional |
| Parametros totales | no disponible (no se publica el recuento; el checkpoint por semilla ocupa aproximadamente 280 MB, derivado de 1,4 GB entre 5 semillas) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no procesa secuencias de texto; la politica opera sobre observaciones de estado) |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint `.pt` en el formato original, sin variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) mas `stats.json`; los ficheros `.pt` son pickles de PyTorch y deben cargarse solo en entornos de confianza |
| Tarea | sim-square-broad |
| Ronda de modelo | R2 |
| Brazo | mulligan |
| Celda de campana | sq_d1_r2_ours_mining_freecf_human_only |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Commit de codigo | 551416bff972 |
| Tamano del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

La model card define el modelo como un agente basado en estado compuesto por dos piezas: un actor de difusion congelado, procedente del modelo sim-square-broad-r02-mulligan-idql, y un critico DIVL de tipo distribucional. Esto implica que durante el entrenamiento de este checkpoint solo se actualiza la parte critica, mientras que la politica generadora de acciones permanece intacta respecto al modelo padre. Los nombres de los artefactos de W&B (`iql_ddpg_bc_idql_divl_square_d1_...`) sugieren una cadena de algoritmos que incluye IQL, DDPG+BC, IDQL y DIVL, aunque la model card no detalla la formulacion matematica ni los hiperparametros.

El entrenamiento alcanza el paso 250001 en las cinco semillas y se apoya en cinco conjuntos de datos: teleoperacion inicial (c00-teleop-sobol), datos DAgger generados por el propio agente en dos rondas (c01-dagger-mulligan y c02-dagger-mulligan) y rollouts de politica de dos agentes distintos (c01-sobol-policy-rollouts y c02-mulligan-policy-rollouts). No se especifica en la documentacion disponible el numero total de transiciones, la composicion exacta del dataset ni si se aplico algun esquema adicional de RLHF o DPO, que en cualquier caso no serian aplicables a este tipo de modelo. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa ni mecanismos de atencion.

Un aspecto relevante de trazabilidad: los ficheros son copias identicas byte a byte de los artefactos de W&B, verificadas con MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`. Cada semilla corresponde a un run concreto de W&B y al commit `551416bff972` del codigo de investigacion de Mulligan.

## Capacidades

- Control de politica en simulacion: genera acciones a partir de observaciones de estado para la tarea sim-square-broad, sin componente de vision ni de lenguaje.
- Ejecucion determinista por semilla: se distribuyen cinco politicas independientes (seed-1 a seed-5), lo que permite medir varianza de rendimiento entre inicializaciones.
- Generacion de rollouts: la politica puede desplegarse para producir trayectorias de simulacion reutilizables como datos de entrenamiento o de evaluacion.
- Soporte como critico distribuional: el checkpoint incluye la componente DIVL, util para estudiar estimacion de valor con incertidumbre en RL offline.
- Aprendizaje por imitacion sobre politica congelada: al mantener el actor fijo, sirve como referencia controlada en experimentos de DAgger iterativo.
- Soporte de tool calling / function calling: no disponible (no aplica a este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes basados en lenguaje; la politica si ejecuta planes de control multi-paso dentro del episodio de simulacion.
- Capacidades multilingues: no disponible (no aplica).
- Capacidades especiales (modo thinking, vision, audio): no disponible; ninguna de ellas esta documentada.

## Casos de uso

- Reproduccion de resultados de investigacion: cargando cada una de las cinco carpetas de semilla con el codigo de Mulligan en el commit `551416bff972`, se puede replicar la evaluacion publicada sobre la rejilla de estados iniciales no vistos y verificar la tasa de exito declarada.
- Punto de partida para nuevas rondas de DAgger: los datasets `c01-dagger-mulligan` y `c02-dagger-mulligan` ya forman parte del entrenamiento, por lo que este checkpoint es el candidato natural para generar la siguiente ronda de datos agregados con la politica actual y volver a entrenar.
- Estudio controlado del critico DIVL: dado que el actor esta congelado y procede de sim-square-broad-r02-mulligan-idql, comparar ambos repositorios permite aislar la contribucion del critico distribuional frente a la variante IDQL sin cambios en la politica.
- Generacion de conjuntos de rollouts: desplegando la politica en el simulador se pueden producir datasets de trayectorias etiquetadas, del mismo tipo que `sim-square-broad-c02-mulligan-policy-rollouts`, utiles para evaluacion o para entrenamiento de terceros.
- Analisis de robustez y varianza entre semillas: con cinco politicas entrenadas bajo la misma celda de campana, se puede cuantificar la sensibilidad del rendimiento a la inicializacion, algo relevante para decidir si un resultado es reproducible o dependiente de la semilla.
- Comparacion en Policy Arena: el artefacto esta pensado para ser evaluado en la plataforma arena.mulligan.page, de modo que su uso tipico es la comparacion contra otros brazos y rondas del mismo benchmark.
- Destilacion o compresion de politica: al ser un checkpoint relativamente pequeno (unos 280 MB por semilla), es un candidato razonable para experimentos de destilacion hacia politicas mas ligeras o para despliegue en simulacion a gran escala.

## Benchmarks y rendimiento

La model card publica resultados de evaluacion sobre una rejilla de estados iniciales no vistos, con los resultados por rollout almacenados en el dataset sim-square-broad-r00-r03-eval. Cada semilla declara 32 estados iniciales y, simultaneamente, un total de 30000 resultados; la documentacion disponible no explica esa discrepancia, por lo que los porcentajes deben interpretarse con cautela.

| Semilla | Conjunto de evaluacion | N declarado | Exitos | Tasa de exito |
|---|---|---|---|---|
| seed-1 | sim-square-broad-r00-r03-eval | 32 | 24696/30000 | 82,32 % |
| seed-2 | sim-square-broad-r00-r03-eval | 32 | 24840/30000 | 82,80 % |
| seed-3 | sim-square-broad-r00-r03-eval | 32 | 24789/30000 | 82,63 % |
| seed-4 | sim-square-broad-r00-r03-eval | 32 | 24527/30000 | 81,76 % |
| seed-5 | sim-square-broad-r00-r03-eval | 32 | 24692/30000 | 82,31 % |
| Media | sim-square-broad-r00-r03-eval | 32 | 123544/150000 | 82,36 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros), y no serian aplicables a un agente de control. Tampoco se ofrecen resultados comparativos del modelo padre ni de la politica base uniforme.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamano del repositorio, cada semilla ocupa aproximadamente 280 MB en el formato original; una politica de este orden cabe en configuraciones de VRAM muy modestas, del orden de 1 GB o menos, aunque el dato exacto no esta publicado.
- GPU recomendadas: no disponible. Por el tamano del checkpoint, cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100; no se documenta ninguna recomendacion oficial.
- Compatibilidad con GPU de consumo: si, previsiblemente cabe en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso la inferencia podria ejecutarse en CPU.
- Opciones de despliegue: no disponible en el sentido habitual (vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no se trata de un modelo de lenguaje). El despliegue requiere el codigo de investigacion de Mulligan en el commit `551416bff972` y el simulador correspondiente a la tarea sim-square-broad.
- Latencia y throughput: no disponible. Al emplear un actor de difusion, la latencia de inferencia dependera del numero de pasos de desdifusion, parametro que no se documenta en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sim-square-broad-r02-mulligan-divl (este) | Actor de difusion congelado + critico DIVL | no disponible (aprox. 280 MB por semilla) | no aplica | 82,36 % de exito medio en 5 semillas | MIT | Hugging Face, 5 semillas |
| sim-square-broad-r02-mulligan-idql | Agente IDQL; proporciona el actor congelado | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| sim-square-broad-c01-baseline-policy-rollouts | Politica base uniforme (solo datos de rollout) | no disponible | no aplica | no disponible | no disponible | Dataset en Hugging Face |
| sim-square-broad-c01-sobol-policy-rollouts | Politica SoBol usada como fuente de datos | no disponible | no aplica | no disponible | no disponible | Dataset en Hugging Face |

No se dispone de cifras de rendimiento de las alternativas dentro de la informacion proporcionada, por lo que la comparacion cuantitativa directa queda limitada al propio modelo evaluado.

## Limitaciones y advertencias

- Ambito restringido: la politica esta entrenada exclusivamente para la tarea sim-square-broad. No hay evidencia de generalizacion a otras tareas, morfologias de robot ni entornos reales.
- Brecha sim a real: no se documenta ningun experimento de transferencia a hardware fisico, y el modelo opera solo sobre observaciones de estado de simulacion.
- Riesgo de sobreajuste a la distribucion de datos: el entrenamiento combina teleoperacion y rollouts de DAgger de dos rondas concretas; fuera de esa distribucion de estados el comportamiento no esta caracterizado.
- Discrepancia no explicada en las cifras de evaluacion: la model card declara 32 estados iniciales y 30000 resultados por semilla a la vez, sin aclarar la relacion entre ambos valores. Los porcentajes deben tratarse como provisionales hasta verificar los datos del dataset de evaluacion.
- Varianza entre semillas no resuelta: aunque la dispersion observada es baja (81,76 % a 82,80 %), no se publican intervalos de confianza ni el numero efectivo de ensayos independientes.
- Seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch y pueden ejecutar codigo arbitrario al deserializarse. Deben cargarse unicamente en entornos de confianza; la propia model card incluye esta advertencia.
- Ausencia de documentacion de sesgos: no se han publicado analisis de sesgo, y en el caso de un agente de control el concepto aplicaria a sesgos de politica o de distribucion de datos, no a sesgos linguisticos.
- Licencia permisiva pero sin garantias: la licencia MIT permite uso comercial y modificacion, pero no ofrece ninguna garantia de idoneidad ni de soporte; ademas, el modelo depende de codigo de investigacion de Mulligan y del simulador asociado para poder ejecutarse.
- Sin soporte de herramientas estandar: no se puede cargar con transformers, vLLM, llama.cpp, Ollama ni TGI, lo que complica su integracion en infraestructuras de despliegue convencionales.
- Trazabilidad dependiente de W&B: la procedencia se apoya en artefactos y runs de W&B (`self-improving/square-d1-dagger-mining-01a`) que pueden no estar accesibles publicamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mulligan/sim-square-broad-r02-mulligan-divl
- Modelo padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r02-mulligan-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion en Hugging Face: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset c00-teleop-sobol: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset c01-dagger-mulligan: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mulligan
- Dataset c01-sobol-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset c02-dagger-mulligan: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mulligan
- Dataset c02-mulligan-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts
- Busqueda de datasets de la serie: https://huggingface.co/datasets?other=sim-square-broad
- Ficha externa de sim-square-broad-c01-baseline-policy-rollouts: https://claru.ai/datasets/mulligan-sim-square-broad-c01-baseline-policy-rollouts
- Ficha externa de sim-square-broad-c03-mulligan-policy-rollouts: https://claru.ai/datasets/mulligan-sim-square-broad-c03-mulligan-policy-rollouts
- Artefactos de W&B (identificadores citados, sin URL publica verificada): run `self-improving/square-d1-dagger-mining-01a/t8iodxtx` (seed-1), `.../hun0nz38` (seed-2), `.../y4sywod6` (seed-3), `.../2gxlfzzm` (seed-4), `.../4r69a8hb` (seed-5); commit de codigo `551416bff972`
- Paper o publicacion tecnica: no disponible
