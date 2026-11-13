# mlnha/gr00t-n15-pnp108-n15base_filt_succ_10k

## Resumen

`mlnha/gr00t-n15-pnp108-n15base_filt_succ_10k` es una coleccion de checkpoints de investigacion resultantes de un fine-tuning del modelo fundacional de robotica NVIDIA GR00T-N1.5-3B sobre rollouts de la tarea PickPlaceCounterToCabinet del simulador RoboCasa365. El autor, mlnha, parte del checkpoint base `nvidia/GR00T-N1.5-3B` y aplica clonacion de comportamiento (behavior cloning, BC) supervisado exclusivamente sobre episodios exitosos, en concreto 72 de los 108 rollouts generados por un checkpoint de GR00T (checkpoint-120000) sobre dicha tarea.

El proposito declarado es estudiar estimadores aprendidos de progreso de tarea como senal de entrenamiento para BC, por lo que se trata de un experimento academico y no de un modelo listo para produccion. El repositorio contiene los checkpoints de los pasos 2000 a 10000 (en incrementos de 2000), logs de entrenamiento y eventos de TensorBoard, pero no incluye estados del optimizador.

Por su naturaleza, el modelo es un policy de robotica (vision-lenguaje-accion) derivado de un backbone de 3B parametros, orientado a control de manipulacion en entornos simulados. La informacion publica disponible es muy limitada: no se declara licencia, idiomas, ni especificaciones tecnicas detalladas del backbone, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de NVIDIA GR00T-N1.5-3B; detalles internos no disponibles |
| Parametros totales | 3B (segun el checkpoint base `nvidia/GR00T-N1.5-3B`); recuento exacto del fine-tune no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `gr00t`); repo de 37.9 GB |
| Embodiment | `new_embodiment` (declarado en la model card) |
| Tarea | PickPlaceCounterToCabinet (RoboCasa365) |
| Dataset de entrenamiento | `pnp108`: 108 rollouts, 72 exitosos, formato LeRobot v2.1 |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone VLA de NVIDIA GR00T-N1.5-3B, que combina percepcion visual, instrucciones en lenguaje natural y salida de acciones motoras; la model card no detalla la composicion interna (vision encoder, LLM, cabeza de acciones) ni el contexto, por lo que no se puede confirmar la arquitectura exacta mas alla de su caracter VLA. El fine-tuning es una clonacion de comportamiento simple sobre episodios exitosos, sin indicios de RLHF, DPO ni decodificacion especulativa.

Los datos de entrenamiento proceden de `pnp108`: 108 rollouts generados por un checkpoint-120000 de GR00T sobre PickPlaceCounterToCabinet, de los cuales 72 fueron exitosos y se usaron para BC. El entrenamiento se realizo en una sola GPU, batch 64, learning rate 3e-5 con scheduler coseno (warmup 0.05) y semilla 42, con el embodiment etiquetado como `new_embodiment`. La evaluacion se hizo en simulacion RoboCasa365 con escenas de semilla 2000+ y politica de semilla 1, considerando exito si la tarea se completaba al final del episodio.

## Capacidades

- Control de manipulacion robotica: genera acciones para la tarea PickPlaceCounterToCabinet a partir de observaciones visuales e instrucciones.
- Clonacion de comportamiento: imita politicas exitosas recogidas en simulacion.
- Percepcion visual integrada: el backbone VLA procesa imagenes del entorno para producir acciones.
- Condicionamiento por lenguaje: al derivar de GR00T-N1.5, se espera que acepte instrucciones en lenguaje natural, aunque no se documenta en esta model card.
- Evaluacion en simulacion: checkpoints calibrados para RoboCasa365 con semillas concretas.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni modo thinking.

## Casos de uso

- Investigacion en aprendizaje por imitacion: usar los checkpoints como linea base para comparar estrategias de filtrado de datos (solo exitos frente a todos los rollouts) en tareas de manipulacion.
- Estudio de estimadores de progreso de tarea: el modelo sirve como referencia para evaluar si una senal de progreso aprendida mejora la BC frente a la seleccion binaria exito/fallo.
- Reproduccion de experimentos en RoboCasa365: los checkpoints y logs permiten replicar la curva de exito por paso (22/50 a 28/50) y analizar la evolucion del entrenamiento.
- Generacion de datos sinteticos de robotica: puede utilizarse para producir rollouts adicionales en simulacion que alimenten pipelines de entrenamiento posteriores.
- Benchmarking interno de politicas VLA: comparar el rendimiento de este fine-tune con otras variantes sobre la misma tarea y semillas de evaluacion.
- Docencia y demostraciones de VLA: ilustra como un modelo fundacional de 3B se adapta a una tarea concreta con pocos episodios (72) en una sola GPU.

## Benchmarks y rendimiento

Resultados de exito en simulacion RoboCasa365 (PickPlaceCounterToCabinet, semillas 2000-2049, politica semilla 1):

| Checkpoint | Exito simulado |
|---|---|
| checkpoint-2000 | 22/50 |
| checkpoint-4000 | 24/50 |
| checkpoint-6000 | 27/50 |
| checkpoint-8000 | 27/50 |
| checkpoint-10000 | 28/50 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- Entrenamiento declarado: 1 GPU, batch 64; no se especifica el modelo de GPU.
- VRAM estimada para inferencia: no disponible con precision; al partir de un backbone de 3B, la inferencia en precision completa requiere del orden de 6-8 GB solo para pesos, mas memoria para activaciones y buffers de vision/acciones (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamano del backbone serian razonables A100/H100 para evaluacion a escala y RTX 4090/A6000 para inferencia individual, pero el autor no lo documenta.
- Compatibilidad con GPU de consumo: probable en GPUs con 12-24 GB segun cuantizacion, aunque no se documentan formatos cuantizados.
- Opciones de despliegue: libreria `gr00t` (declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no estan orientados a politicas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlnha/gr00t-n15-pnp108-n15base_filt_succ_10k | 3B (base) | no disponible | PickPlaceCounterToCabinet (RoboCasa365) | no disponible | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.5-3B | 3B | no disponible | VLA generalista de robotica | no disponible en esta ficha | Hugging Face (modelo base) |
| Checkpoint-120000 de GR00T (origen de rollouts) | 3B (base) | no disponible | PickPlaceCounterToCabinet | no disponible | Referenciado en la model card |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de investigacion: pensado para estudiar senales de entrenamiento, no para despliegue en produccion.
- Rendimiento limitado: mejor checkpoint alcanza 28/50 (56 %) en simulacion, con alta varianza entre pasos.
- Entrenado solo con episodios exitosos (72), lo que puede reducir la diversidad de estados y favorecer sobreajuste al simulador.
- Evaluacion exclusivamente en simulacion RoboCasa365 con semillas fijas; la transferencia a robot real no esta validada.
- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribucion.
- Idiomas y contexto no documentados; no apto para tareas de lenguaje general.
- Riesgo de alucinacion en la generacion de acciones no cuantificado; en robotica se traduce en movimientos incorrectos.
- No incluye estados del optimizador, lo que limita reanudar el entrenamiento de forma exacta.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-n15base_filt_succ_10k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.
