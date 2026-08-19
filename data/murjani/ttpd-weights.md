# Murjani/ttpd-weights

## Resumen

El repositorio `Murjani/ttpd-weights` contiene los checkpoints entrenados del modelo de construcción de políticas para el Travelling Thief Problem with Drone (TTP-D), un problema de optimización combinatoria que combina la planificación de rutas de un camión con capacidad limitada y un dron de un solo paquete. El modelo es un encoder-decoder que embebe la instancia una vez y emite una acción compuesta en cada nodo que alcanza el camión, entrenado offline con Proximal Policy Optimisation (PPO) bajo un baseline POMO. Los pesos corresponden al estudio *Fly, Pack, Drive: the Travelling Thief Problem with Drone* de Murjani y Sobhanan, y están publicados bajo licencia MIT.

El problema resuelto es relevante en logística y operaciones porque modela escenarios reales de entrega con vehículos mixtos (camión y dron), donde la velocidad del camión depende de la carga acumulada y el dron puede recoger paquetes en clientes remotos y reunirse con el camión más adelante. El objetivo es maximizar el beneficio neto de la colección, restando un coste de alquiler proporcional al makespan. Los checkpoints cubren dos variantes: `a280` (resistencia de dron fija) y `ttd300` (resistencia condicionada), con tamaños de instancia desde N=5 hasta N=100.

El repositorio incluye modelos con tres arquitecturas de encoder: `gat` (attention encoder), `mlp` (ablation del encoder) y `lisa` (behavior cloning). Los checkpoints se organizan por variante, modelo, familia de distribución de entrenamiento y tamaño. El código asociado está en el repositorio GitHub `corbit-lab/ttpd`, y los datos de benchmark y conjuntos de behavior cloning en el dataset complementario `Murjani/ttpd-benchmarks`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (GAT o MLP segun variante) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante nativo de PyTorch) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch `torch.save`) |

## Arquitectura y entrenamiento

El modelo es una politica de construccion de soluciones para el TTP-D. La arquitectura sigue un esquema encoder-decoder: el encoder embebe la instancia completa (nodos, demandas, posiciones, capacidades) una sola vez, y el decoder genera una accion compuesta en cada paso de decision (que nodo visitar, si lanzar el dron, donde reunirse). El encoder puede ser un transformer con atencion (GAT) o un perceptron multicapa (MLP, usado como ablation). La variante `lisa` corresponde a politicas clonadas de comportamiento (behavior cloning) a partir de demostraciones.

El entrenamiento se realizo offline con Proximal Policy Optimisation (PPO) utilizando un baseline de grupo POMO (Policy Optimization with Multiple Optima). Las politicas se entrenaron sobre dos distribuciones de datos: `benchmark-tuned` (cinco instancias benchmark de cada tamano) y `sampled` (subconjuntos a280 muestreados aleatoriamente para generalizacion). Las politicas `benchmark-tuned` se inicializan con los pesos de `sampled/n20` del mismo modelo, ya que entrenar desde cero no converge dentro del presupuesto en tamanos grandes. La seleccion del checkpoint final (`best.pt`) se hizo mediante evaluacion con beam search en un conjunto de validacion retenido.

No se especifican el numero total de parametros, el tamano del dataset de entrenamiento ni la composicion exacta de las instancias en la informacion disponible.

## Capacidades

- Resolucion del Travelling Thief Problem with Drone (TTP-D), incluyendo la coordinacion de un camion con carga y un dron de un solo paquete.
- Generacion de rutas completas de coleccion que maximizan el beneficio neto (profit recogido menos coste de alquiler proporcional al makespan).
- Manejo de instancias con diferentes tamanos (N=5 a N=100) y dos variantes de resistencia del dron (`a280` fija, `ttd300` condicionada).
- Capacidad de generalizacion a instancias no vistas gracias al entrenamiento sobre distribuciones muestreadas.
- Soporte para warm-start: los checkpoints `sampled` pueden usarse como inicializacion para ajuste fino en instancias especificas.
- Incluye politicas de behavior cloning (`lisa`) para reproduccion de comportamiento experto.

## Casos de uso

- Planificacion de rutas de reparto con flota mixta camion-dron: el modelo genera una ruta completa para un escenario concreto, indicando donde el camion debe lanzar el dron y donde reunirse, optimizando el beneficio neto.
- Simulacion de operaciones logisticas en entornos urbanos o rurales: permite evaluar rapidamente el impacto de diferentes configuraciones de capacidad, resistencia del dron y costes de alquiler.
- Investigacion en optimizacion combinatoria con aprendizaje por refuerzo: sirve como punto de partida para comparar politicas entrenadas con PPO frente a metodos exactos o metaheuristicas.
- Generacion de soluciones iniciales para solvers exactos o metaheuristicos: las rutas producidas pueden usarse como warm-start en algoritmos de optimizacion mas costosos.
- Benchmarking de algoritmos de optimizacion: los checkpoints permiten reproducir los resultados del paper y comparar con otros metodos en las mismas instancias.
- Educacion y prototipado: el modelo puede integrarse en entornos de simulacion para ensenar conceptos de RL aplicados a problemas de rutas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados comparativos contra el solver exacto y metaheuristicas se presentan en el paper asociado, pero no se proporcionan numeros concretos en el repositorio ni en la documentacion accesible.

## Requisitos de hardware

- El tamano del repositorio es de 0.4 GB, lo que sugiere que los checkpoints individuales son ligeros (probablemente menos de 100 MB cada uno).
- No se especifican requisitos de VRAM ni GPU recomendadas en la informacion disponible.
- Dado el tamano reducido, es plausible que la inferencia pueda ejecutarse en CPU o en GPUs de gama media (por ejemplo, RTX 3060 o superior), aunque no hay datos oficiales.
- Para el entrenamiento desde cero o fine-tuning, se requieren recursos moderados; el paper no detalla el hardware utilizado.
- El codigo de inferencia esta disponible en el repositorio GitHub `corbit-lab/ttpd` y los checkpoints se cargan con PyTorch estándar.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (solvers de TTP-D o metodos de RL para optimizacion combinatoria). La model card menciona que el paper incluye comparaciones con un solver exacto y metaheuristicas, pero no se proporcionan resultados numericos en la informacion accesible. Por tanto, no se puede realizar una comparativa cuantitativa en esta ficha.

## Limitaciones y advertencias

- Los checkpoints estan especializados en el TTP-D; no son modelos de proposito general ni de lenguaje.
- Las politicas `benchmark-tuned` pueden estar sobreajustadas a las cinco instancias benchmark de cada tamano, por lo que su rendimiento en instancias fuera de esa distribucion puede degradarse.
- Las politicas `sampled` ofrecen mejor generalizacion pero posiblemente peor rendimiento absoluto en las instancias benchmark.
- No se especifican sesgos ni riesgos de alucinacion porque no es un modelo generativo de texto.
- La licencia MIT permite uso comercial, pero se recomienda revisar el paper para entender las limitaciones del metodo.
- El formato de pesos es `.pt` y requiere PyTorch para su carga; no se proporcionan versiones en otros formatos (ONNX, etc.).
- No se indica la version de PyTorch utilizada, lo que puede requerir compatibilidad al cargar los checkpoints.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Murjani/ttpd-weights
- Dataset complementario: https://huggingface.co/datasets/Murjani/ttpd-benchmarks
- Codigo fuente: https://github.com/corbit-lab/ttpd
- Paper (arXiv): https://arxiv.org/abs/2608.16435
