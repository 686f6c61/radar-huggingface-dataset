# mulligan/sim-square-narrow-r03-mulligan-repair-no-r3roll-idql

## Resumen

El modelo `mulligan/sim-square-narrow-r03-mulligan-repair-no-r3roll-idql` es un agente de aprendizaje por refuerzo offline de tipo IDQL (Implicit Diffusion Q-Learning) desarrollado por el proyecto Mulligan, una iniciativa de investigacion centrada en la recoleccion de datos guiada por rendimiento para el aprendizaje robotico eficiente. No se trata de un modelo de lenguaje: es una politica de control entrenada para una unica tarea de manipulacion simulada, `sim-square-narrow`, que por el nombre del identificador parece corresponder a una tarea de ensamblaje o insercion de una pieza cuadrada con tolerancia estrecha. El agente consume observaciones basadas en estado (no vision) y produce acciones de control de un brazo robotico.

El checkpoint forma parte de la ronda R3 de la campana Mulligan, bajo el brazo experimental `mulligan-repair-no-r3roll`, y se distribuye con cinco semillas independientes (seed-1 a seed-5) en carpetas separadas, todas entrenadas hasta el paso 150001. Cada semilla contiene un fichero `policy.pt` (checkpoint de PyTorch) junto con un `stats.json` que almacena los normalizadores de observaciones y acciones. El repositorio ocupa 1.4 GB en total.

Su relevancia es doble. Por un lado, sirve como artefacto reproducible dentro de una campana de investigacion que encadena teleoperacion, agregacion de datasets tipo DAgger y rollouts de politica, con procedencia verificable mediante MD5 contra el manifiesto del artefacto original de Weights & Biases y SHA-256 registrado en `release.json`. Por otro, funciona como baseline de IDQL para tareas de insercion con tolerancia estrecha en simulacion, comparable con otras familias de politicas de difusion del ecosistema abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion con critico IQL escalar (IDQL); observaciones basadas en estado, sin vision |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: consume vectores de observacion de estado y horizontes de decision, no secuencias de texto |
| Tipos de cuantizacion | no disponible; se distribuye en su precision original de entrenamiento, sin variantes GGUF, GPTQ, AWQ ni similares |
| Idiomas soportados | no aplica (modelo de control robotico) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`, serializado con pickle) mas `stats.json` con normalizadores |
| Tarea | sim-square-narrow |
| Ronda de modelo | R3 |
| Brazo experimental | mulligan-repair-no-r3roll |
| Celda de campana | `sq_d0_r3_repair_ours_grid_cell_bonus_b1p0_freecf_human_only_no_r3roll` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamano del repositorio | 1.4 GB |
| Commit de entrenamiento | `3f254b76f9f4` |
| Region | us |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor parametrizado como modelo de difusion que genera acciones mediante un proceso iterativo de denoising, acoplado a un critico escalar entrenado con Implicit Q-Learning (IQL) sobre datos offline. Esta combinacion permite explotar la expresividad multimodal de las politicas de difusion sin necesidad de interactuar con el entorno durante el entrenamiento, algo especialmente relevante cuando los datos provienen de demostraciones humanas heterogeneas y de rollouts de politicas previas. Los ficheros `stats.json` normalizan las observaciones y las acciones, y son imprescindibles para reproducir el comportamiento del checkpoint.

El entrenamiento combina seis datasets encadenados en una campana iterativa: `sim-square-narrow-c00-teleop-sobol` (teleoperacion inicial), `sim-square-narrow-c01-dagger-mulligan`, `sim-square-narrow-c01-sobol-policy-rollouts`, `sim-square-narrow-c02-dagger-mulligan`, `sim-square-narrow-c02-mulligan-policy-rollouts` y `sim-square-narrow-c03-dagger-mulligan`. La nomenclatura sugiere un ciclo de agregacion tipo DAgger con tres iteraciones de correccion (c01, c02, c03), complementado con rollouts de politica y con exploracion basada en secuencias de Sobol. Los nombres de los artefactos de W&B asociados (`iql_ddpg_bc_idql_nutassemblysquare_*`) indican que la base de codigo reutiliza la implementacion de IQL+DDPG+BC sobre el entorno NutAssemblySquare de ManiSkill, adaptada despues a la tarea `sim-square-narrow` de tolerancia estrecha. No se especifica en la informacion disponible el numero total de transiciones, la composicion exacta de la mezcla ni si se aplicaron etapas de RLHF o DPO (no aplicables en este dominio).

Cada semilla se entrena en un run independiente de W&B, todos con el mismo commit `3f254b76f9f4`, lo que permite analizar la varianza entre inicializaciones. La procedencia esta verificada: los ficheros son copias identicas byte a byte de los artefactos originales, comprobadas por MD5 contra el manifiesto y con SHA-256 registrado.

## Capacidades

- Control robotico de una tarea unica: genera acciones de manipulacion para la tarea simulada `sim-square-narrow`, definida por el propio entorno de simulacion.
- Politica multimodal: al ser un actor de difusion, puede representar distribuciones de accion multimodales, algo util cuando existen varias estrategias validas de agarre o insercion.
- Aprendizaje offline puro: no requiere interaccion con el entorno en tiempo de entrenamiento, solo un dataset de transiciones.
- Consumo de observaciones de estado: opera con vectores de estado del simulador (posiciones, velocidades, poses de efector y objeto, y variables similares segun el entorno). No procesa imagenes ni nubes de puntos.
- Reproducibilidad multi-semilla: cinco checkpoints independientes listos para comparar varianza y estabilidad.
- Integracion en bucles de evaluacion episodica: al ser un checkpoint de PyTorch, se puede cargar en procesos de rollout por lotes.
- No dispone de tool calling, function calling, agentes multi-paso, capacidad multilingue, modo thinking, vision ni audio. Es una politica de control, no un modelo generativo de proposito general.

## Casos de uso

- Investigacion en RL offline: usar el checkpoint como baseline de IDQL para comparar contra otras familias (diffusion policy pura, ACT, DDPG+BC, IQL con actor gaussiano) sobre la misma tarea, aprovechando que el entorno y los datasets estan publicados.
- Evaluacion comparativa en Policy Arena: el proyecto mantiene un panel de evaluaciones en `arena.mulligan.page`, de modo que estos checkpoints sirven para reproducir o auditar resultados publicados en la campana R3.
- Generacion de rollouts para ciclos DAgger: cargar la politica, ejecutar episodios en simulacion, registrar fallos y anadir correcciones humanas o de un experto, alimentando asi la siguiente iteracion del ciclo de recoleccion de datos.
- Ablacion de componentes de campana: el brazo `mulligan-repair-no-r3roll` esta disenado explicitamente para medir el efecto de eliminar los rollouts de la ronda 3; estos checkpoints permiten cuantificar esa contribucion frente a las variantes que si los incluyen.
- Destilacion a politicas mas rapidas: al ser un actor de difusion, requiere multiples pasos de denoising por accion; se puede usar el checkpoint como profesor para destilar una politica determinista o de un solo paso, reduciendo latencia en bucle cerrado.
- Pruebas de infraestructura de simulacion GPU: como politica ligera basada en estado, es util para medir throughput de entornos vectorizados y detectar cuellos de botella en el lado de la simulacion, no en el de la red.
- Estudio de robustez y sensibilidad: las cinco semillas permiten analizar dispersion de exito, sensibilidad a condiciones iniciales y estabilidad del entrenamiento a 150001 pasos.
- Banco de pruebas para evaluacion en robot real: sirve como punto de partida para experimentos de sim-to-real en tareas de insercion con tolerancia estrecha, siempre que la interfaz de observaciones y acciones se adapte al hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen tasas de exito, retornos medios ni comparaciones numericas con otras politicas. El unico puntero a evaluacion es el dataset `mulligan/sim-square-narrow-r00-r03-eval`, referenciado en los metadatos del modelo, y el panel externo `arena.mulligan.page`, cuyos valores no se han proporcionado.

| Metrica | Valor |
|---|---|
| Tasa de exito en sim-square-narrow | no disponible |
| Retorno medio por episodio | no disponible |
| Numero de episodios de evaluacion | no disponible |
| Comparacion numerica con otras politicas | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, cada semilla ocupa del orden de 280 MB en disco (1.4 GB repartidos entre cinco carpetas con `policy.pt` y `stats.json`), lo que sugiere una red compacta basada en MLP; un checkpoint de ese tamano en precision de 32 bits cabe holgadamente en cualquier GPU con 8 GB o mas de VRAM. Esta estimacion es una deduccion del tamano del repositorio, no un dato publicado.
- GPU recomendadas: para inferencia de la politica aislada basta una GPU de consumo como RTX 3060, RTX 4070 o RTX 4090, o incluso CPU. Para evaluacion a gran escala con entornos vectorizados, una A100 o H100 reduce el tiempo total, pero el cuello de botella suele estar en la simulacion fisica.
- Cabe en GPU de consumo: si, con margen amplio. El requisito dominante no es la red neuronal sino el simulador, que puede necesitar varios gigabytes si se ejecutan cientos de entornos en paralelo.
- Opciones de despliegue: al no ser un modelo de lenguaje, no aplican vLLM, llama.cpp, Ollama ni TGI. Las vias realistas son PyTorch eager con el checkpoint `policy.pt` y sus normalizadores `stats.json`, exportacion a TorchScript u ONNX para reducir overhead, y contenedores propios del proyecto Mulligan o del entorno de simulacion (ManiSkill) para los rollouts.
- Latencia y throughput estimados: no disponible. Hay que tener en cuenta que un actor de difusion ejecuta varios pasos de denoising por accion, por lo que su latencia por paso de control es mayor que la de una politica determinista equivalente; el numero de pasos de denoising no se especifica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-narrow-r03-mulligan-repair-no-r3roll-idql | IDQL: actor de difusion + critico IQL, estado | no disponible | no aplica | MIT | HuggingFace, repo de 1.4 GB |
| Diffusion Policy (Chi et al.) | Actor de difusion para control visual y de estado | no disponible en la informacion proporcionada | no aplica | codigo abierto, consultar repositorio oficial | Repositorio publico |
| ACT (Zhao et al., ALOHA) | Transformer con decodificacion de acciones por chunks | no disponible en la informacion proporcionada | no aplica | codigo abierto, consultar repositorio oficial | Repositorio publico |
| DP3 (3D Diffusion Policy) | Difusion sobre representaciones 3D de nubes de puntos | no disponible en la informacion proporcionada | no aplica | codigo abierto, consultar repositorio oficial | Repositorio publico |

La comparacion cuantitativa no es posible con los datos disponibles: no se han publicado tasas de exito ni retornos para este checkpoint, y la tarea `sim-square-narrow` no es un benchmark estandar de proposito general. La diferencia estructural mas relevante frente a Diffusion Policy y DP3 es que este modelo consume solo estado, mientras que las alternativas citadas incorporan observaciones visuales, lo que las hace aplicables a un rango mas amplio de tareas pero tambien mas costosas computacionalmente.

## Limitaciones y advertencias

- Dominio cerrado: el modelo esta entrenado exclusivamente para la tarea `sim-square-narrow`. No es transferible a otras tareas sin reentrenamiento, y no debe presentarse como una politica generalista.
- Dependencia del simulador: las observaciones de estado provienen del entorno de simulacion. Cualquier cambio en la definicion del espacio de observacion o de accion invalida el checkpoint.
- Sin validacion sim-to-real: la informacion disponible no incluye ningun resultado en robot fisico. El salto a hardware real exige trabajo adicional de adaptacion y evaluacion.
- Riesgo de seguridad al cargar los pesos: los ficheros `.pt` son pickles de PyTorch y la propia model card advierte de que solo deben cargarse en entornos de confianza. Un pickle malicioso puede ejecutar codigo arbitrario.
- Ausencia de datos de rendimiento: no hay tasas de exito publicadas, por lo que no es posible afirmar que el modelo resuelva la tarea de forma fiable.
- Varianza entre semillas: se distribuyen cinco semillas precisamente porque el rendimiento puede variar entre inicializaciones. Evaluar con una sola semilla daria una imagen incompleta.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, de modo que no existe validacion independiente por parte de la comunidad.
- Alucinacion: el concepto no aplica a un modelo de control. El fallo equivalente es la generacion de acciones fuera de distribucion, que puede provocar colisiones o danos en un robot real si se despliega sin salvaguardas.
- Licencia permisiva con matices: la licencia MIT cubre los pesos y permite uso comercial, pero el entorno de simulacion, los datasets asociados y posibles dependencias de terceros pueden tener condiciones propias que conviene revisar.
- Idiomas y capacidades generativas: no procede. Este modelo no procesa ni genera texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-mulligan-repair-no-r3roll-idql
- Proyecto Mulligan: https://mulligan.page/
- Panel de evaluaciones Policy Arena: https://arena.mulligan.page/
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset sim-square-narrow-c00-teleop-sobol: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset sim-square-narrow-c01-dagger-mulligan: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mulligan
- Dataset sim-square-narrow-c01-sobol-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset sim-square-narrow-c02-dagger-mulligan: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-dagger-mulligan
- Dataset sim-square-narrow-c02-mulligan-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-mulligan-policy-rollouts
- Dataset sim-square-narrow-c03-dagger-mulligan: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-dagger-mulligan
- Dataset sim-square-narrow-c03-mulligan-policy-rollouts: https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-mulligan-policy-rollouts
- Dataset de evaluacion sim-square-narrow-r00-r03-eval: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- ManiSkill, plataforma de simulacion robotica: https://www.maniskill.ai/
- Ficha del dataset de rollouts en claru.ai: https://claru.ai/datasets/mulligan-sim-square-narrow-c03-mulligan-policy-rollouts
