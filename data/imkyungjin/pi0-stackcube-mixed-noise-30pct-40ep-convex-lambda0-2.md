# ImKyungjin/pi0-stackcube-mixed-noise-30pct-40ep-convex-lambda0.2

## Resumen

El modelo `ImKyungjin/pi0-stackcube-mixed-noise-30pct-40ep-convex-lambda0.2` es un ajuste fino del modelo π₀ (Pi0) de Physical Intelligence, un modelo visión-lenguaje-acción (VLA) orientado al control robótico generalista. Lo publica el usuario ImKyungjin en Hugging Face y se ha entrenado con la librería LeRobot de Hugging Face, cuya implementación de π₀ deriva del repositorio open source OpenPI de Physical Intelligence. La tarea objetivo, según el identificador y el dataset asociado (`taewonkoo/stack_cube_mixed_noise_30pct_40ep`), es el apilado de cubos (stack cube), un escenario clásico de manipulación robótica.

π₀ recibe entradas visuales e instrucciones en lenguaje natural y produce acciones de bajo nivel para brazos robóticos, con el objetivo de actuar como política generalista en lugar de un controlador especializado por tarea. Este checkpoint concreto cuenta con 3.501.372.176 parámetros (~3,5 mil millones) almacenados en safetensors, un repositorio de 7,0 GB y licencia Apache 2.0. El nombre del modelo codifica los hiperparámetros del ajuste: un 30 % de ruido mixto en los datos, 40 épocas de entrenamiento y un coeficiente convexo λ = 0,2 (interpretación inferida del propio identificador, no confirmada en la model card).

Su relevancia es doble: por un lado, muestra el flujo de trabajo estándar de LeRobot para ajustar una política VLA sobre un dataset propio; por otro, sirve como punto de partida reproducible para estudiar la robustez frente al ruido en tareas de manipulación. En el momento de redactar esta ficha el repositorio no tiene descargas ni valoraciones registradas, por lo que se trata de un artefacto de investigación sin validación externa pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀; el detalle interno (backbone VLM, experto de acciones, flow matching) no se especifica en la model card |
| Parametros totales | 3.501.372.176 (~3,5 mil millones) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ ni GPTQ; el checkpoint se distribuye en safetensors) |
| Idiomas soportados | No disponible (el modelo acepta instrucciones en lenguaje natural, pero la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato de checkpoint de LeRobot) |
| Libreria | LeRobot |
| Pipeline | Robotics |
| Dataset de entrenamiento | `taewonkoo/stack_cube_mixed_noise_30pct_40ep` |
| Tamano del repositorio | 7,0 GB |

## Arquitectura y entrenamiento

La model card identifica el modelo como un VLA de π₀ (Pi0) para control robótico general, con la implementación de LeRobot adaptada del repositorio OpenPI. π₀ combina comprensión visual, interpretación de instrucciones en lenguaje natural y generación de acciones motoras, de modo que el mismo modelo puede controlar distintos robots y tareas. La model card de este checkpoint no detalla la composición interna (número de capas, tipo de atención, mecanismo de decodificación de acciones ni estrategia de flow matching), por lo que esos extremos quedan como no disponibles en esta ficha. Del tamaño del repositorio (7,0 GB para 3.501.372.176 parámetros) se deduce un almacenamiento en precisión de 16 bits, aproximadamente 2 bytes por parámetro.

En cuanto al entrenamiento, el único dato verificable es el dataset utilizado (`taewonkoo/stack_cube_mixed_noise_30pct_40ep`), que corresponde a una tarea de apilado de cubos con ruido mixto. El identificador del modelo sugiere un 30 % de ruido en los datos, 40 épocas y un coeficiente convexo de 0,2 aplicado probablemente a la función de pérdida o a la combinación de objetivos, pero la model card no documenta estos hiperparámetros ni confirma su significado. Tampoco se indica el número total de tokens o de episodios de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF, DPO o refinamiento posterior. No se describen innovaciones técnicas adicionales más allá de las propias de la arquitectura π₀.

## Capacidades

- Control robótico guiado por visión: genera acciones motoras a partir de imágenes de la escena, tal y como corresponde a un modelo de pipeline `robotics`.
- Interpretación de instrucciones en lenguaje natural: π₀ está descrito como un modelo capaz de entender instrucciones verbales y traducirlas en comportamiento motor.
- Manipulación de objetos: el ajuste fino está orientado específicamente al apilado de cubos, una tarea de pick-and-place con precisión posicional.
- Ejecución de políticas multi-paso: al tratarse de un modelo de acción, produce secuencias de acciones encadenadas para completar una tarea.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación e inferencia mediante `lerobot-train` y `lerobot-record`.
- Control de robots tipo seguidor SO-100: el ejemplo de evaluación de la model card emplea `so100_follower`.
- Soporte de tool calling: no disponible.
- Soporte de agentes basados en texto o razonamiento multi-paso simbólico: no disponible.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito (thinking), visión general, audio u otras modalidades: no disponibles.

## Casos de uso

- Apilado de cubos en laboratorio: es la tarea para la que se ha ajustado el modelo; se usaría cargando el checkpoint con `--policy.path` en LeRobot y ejecutando episodios de evaluación con `lerobot-record` sobre un robot seguidor tipo SO-100.
- Investigación sobre robustez al ruido: el dataset incorpora ruido mixto al 30 %, de modo que el checkpoint permite estudiar cómo afecta la contaminación de los datos de demostración al éxito de la política en tareas de manipulación.
- Ablaciones de hiperparámetros en VLA: al incorporar en el nombre el número de épocas (40) y el coeficiente convexo (λ = 0,2), el modelo resulta útil como punto de comparación frente a otros ajustes del mismo π₀ sobre el mismo dataset.
- Fine-tuning posterior con LeRobot: sirve como inicialización para nuevos datasets de manipulación, aprovechando el flujo `lerobot-train` documentado por Hugging Face.
- Automatización de pick-and-place en líneas de montaje sencillas: con el ajuste adecuado sobre datos propios, la arquitectura VLA puede reutilizarse para tareas repetitivas de recogida y colocación.
- Docencia y formación en robótica: el par modelo-dataset y los comandos de entrenamiento y evaluación de la model card constituyen un ejemplo completo y reproducible de un pipeline de aprendizaje por imitación.
- Evaluación comparativa de políticas: puede emplearse como referencia intermedia en comparaciones entre políticas del ecosistema LeRobot (por ejemplo, frente a políticas de tipo ACT) en el mismo escenario de apilado.
- Pruebas de simulación a real (sim2real): el checkpoint permite medir la transferencia de una política entrenada sobre datos concretos a un montaje físico equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas, y tampoco se han encontrado datos de este tipo en los resultados de búsqueda web. El único procedimiento de evaluación documentado es la ejecución de 10 episodios mediante `lerobot-record`, pero no se aportan los resultados obtenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 3,5 mil millones de parámetros en bf16 ocupan aproximadamente 7 GB solo en pesos, por lo que hay que sumar activaciones, memoria del codificador visual y buffers de inferencia.
- GPU recomendadas: no especificadas por el autor. Por el tamano del modelo, una GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4 de 24 GB) resulta un objetivo razonable para inferencia en precision de 16 bits; A100 o H100 no son necesarias salvo para entrenamiento o despliegue por lotes.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB (RTX 3090, 4090) en bf16 y en tarjetas de 16 GB con cuantizacion o reduccion de lote, aunque no hay confirmacion oficial.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) sobre PyTorch con CUDA, tal y como indica la model card. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni frecuencia de control.
- Almacenamiento: el repositorio ocupa 7,0 GB, por lo que se recomienda disponer de al menos 15 GB libres para el checkpoint y los ficheros temporales de evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi0-stackcube-mixed-noise-30pct-40ep-convex-lambda0.2) | 3,5 mil millones | No disponible | Apilado de cubos (VLA ajustado) | Apache 2.0 | Hugging Face, libreria LeRobot |
| π₀ base (Physical Intelligence / OpenPI) | No disponible en la informacion proporcionada | No disponible | VLA generalista multi-robot | Apache 2.0 (segun OpenPI) | Repositorio open source OpenPI |
| π₀-FAST | No disponible | No disponible | Variante de π₀ con decodificacion autoregresiva de acciones | No disponible | Distribucion publica de Physical Intelligence |
| SmolVLA | Aproximadamente 450 millones (segun documentacion publica del proyecto) | No disponible | VLA ligero integrado en LeRobot | Apache 2.0 (segun documentacion publica) | Hugging Face, libreria LeRobot |
| OpenVLA | Aproximadamente 7 mil millones (segun documentacion publica) | No disponible | VLA sobre backbone de lenguaje | No confirmada en esta busqueda | Hugging Face |

Las cifras de los modelos alternativos proceden de documentacion publica de cada proyecto y no se han verificado contra sus model cards en el contexto de esta ficha; conviene comprobarlas antes de citarlas en produccion.

## Limitaciones y advertencias

- Especializacion extrema: el checkpoint se ha ajustado sobre un unico dataset de apilado de cubos, por lo que su comportamiento fuera de esa tarea y de ese montaje no esta garantizado.
- Ausencia de validacion externa: cero descargas y cero valoraciones en el momento de la consulta; no existe evidencia publica independiente de su funcionamiento.
- Datos de evaluacion inexistentes: no se publican tasas de exito ni comparaciones, de modo que no es posible estimar su calidad relativa frente a otras politicas.
- Riesgo de comportamiento incorrecto fuera de distribucion: como cualquier politica de aprendizaje por imitacion, puede generar acciones erroneas ante iluminacion, posiciones de objeto o fondos distintos de los del dataset, con el consiguiente riesgo fisico para el entorno y el robot.
- Idiomas no declarados: aunque el modelo acepta instrucciones en lenguaje natural, la model card no especifica que idiomas estan cubiertos ni si hay datos multilingues.
- Composicion del dataset no documentada: no se detalla el numero de episodios, la variedad de objetos ni la naturaleza exacta del "ruido mixto" al 30 %.
- Hiperparametros no confirmados: los valores de 40 epocas y λ = 0,2 se deducen del identificador del repositorio y no estan explicados en la model card.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar por su cuenta las condiciones del dataset `taewonkoo/stack_cube_mixed_noise_30pct_40ep` y de los componentes base de π₀/OpenPI.
- Contexto de contexto y de control no disponible: sin datos sobre horizonte de acciones ni frecuencia de control, la planificacion de un despliegue en produccion requiere pruebas previas.
- Comandos de la model card con posibles erratas: el ejemplo de entrenamiento usa `--policy.type=act` en lugar de una configuracion de π₀, y el ejemplo de evaluacion asume un robot `so100_follower`; hay que adaptarlos antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-stackcube-mixed-noise-30pct-40ep-convex-lambda0.2
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/stack_cube_mixed_noise_30pct_40ep
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio OpenPI (implementacion original de π₀): https://github.com/Physical-Intelligence/openpi
