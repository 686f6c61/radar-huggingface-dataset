# eslab1234/smolvla_task1_5blocks_v3_444ep_fullft_b16_150k_v1

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente, disenado para el control de robots mediante instrucciones en lenguaje natural y percepcion visual. Este repositorio concreto contiene un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario `eslab1234` para una tarea especifica de manipulacion: recoger cinco bloques de colores (rojo, amarillo, madera, verde y azul) en secuencia y colocarlos en un area objetivo. El modelo se enmarca en el ecosistema LeRobot de HuggingFace y sigue la arquitectura propuesta en el articulo arXiv 2506.01844.

Con aproximadamente 450 millones de parametros y un tamano de repositorio de 0,9 GB, el modelo esta pensado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios de robotica con recursos limitados. El fine-tuning se realizo sobre un dataset hibrido de 444 episodios y 625.527 frames capturados a 30 FPS con dos camaras (superior y muneca), entrenando durante 150.000 pasos con un batch size de 16. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en que demuestra el enfoque SmolVLA aplicado a una tarea real de manipulacion multi-paso: en lugar de entrenar politicas desde cero, se parte de un VLM preentrenado y se adapta a control robotico mediante aprendizaje por imitacion, logrando rendimiento competitivo a un coste computacional reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action model sobre backbone VLM compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-language-action que adapta un vision-language model (VLM) preentrenado a gran escala para el control robotico. En lugar de entrenar una politica desde cero, aprovecha el conocimiento visual y linguistico del VLM base y lo extiende con una cabeza de accion que emite chunks de acciones (vectores de 6 dimensiones) a partir de observaciones visuales multiples y una instruccion en lenguaje natural. La arquitectura sigue el enfoque descrito en el paper SmolVLA (arXiv:2506.01844), disenado para ser compacto y eficiente, ejecutable en hardware de consumo.

El entrenamiento de este repositorio concreto consistio en un fine-tuning completo del modelo base `lerobot/smolvla_base` sobre el dataset `eslab1234/task1_hybrid_5blocks_v3_444ep_merged`, que contiene 444 episodios y 625.527 frames a 30 FPS. La tarea consiste en recoger cinco bloques (rojo, amarillo, madera, verde y azul) en secuencia y colocarlos en un area objetivo. La configuracion de entrenamiento fue: 150.000 pasos, batch size 16, optimizador AdamW, learning rate 2e-05, seed 1000 y LeRobot version 0.5.2. El robot utilizado es un `so_follower` con dos camaras (superior y muneca) a resolucion 480x640.

## Capacidades

- Control robotico de manipulacion por imitacion: el modelo recibe imagenes de dos camaras (top y wrist) junto con el estado del robot (6 dimensiones) y emite acciones de 6 dimensiones en forma de chunks.
- Ejecucion de tareas multi-paso: la tarea entrenada implica recoger cinco bloques en una secuencia especifica y colocarlos en un area objetivo, lo que requiere planificacion y ejecucion prolongada (el rollout de ejemplo usa una duracion de 60 segundos).
- Comprension de instrucciones en lenguaje natural: el modelo interpreta la instruccion "Pick up the 5 blocks in sequence (red, yellow, wood, green, blue), then place each at the target area" para guiar su comportamiento.
- Percepcion visual dual: procesa simultaneamente imagenes de camara superior y de muneca a resolucion 480x640, lo que permite razonar sobre la posicion de los objetos y la pose del efector final.
- Integracion con el ecosistema LeRobot: compatible con las herramientas de rollout, entrenamiento y evaluacion de LeRobot, incluyendo despliegue en robots reales tipo `so_follower`.
- Eficiencia computacional: al ser un modelo compacto (~450M parametros), esta disenado para ejecutarse en GPUs de consumo, segun el paper SmolVLA.

## Casos de uso

- Automatizacion de pick-and-place en entornos industriales: el modelo puede controlar un brazo robotico para recoger piezas de colores especificos y colocarlas en posiciones determinadas, con aplicacion directa en lineas de montaje donde los objetos tienen marcas visuales distintivas.
- Investigacion en aprendizaje por imitacion: sirve como base reproducible para estudiar como los VLM preentrenados se adaptan a tareas de manipulacion, comparando el rendimiento frente a politicas entrenadas desde cero.
- Prototipado rapido de celdas robotizadas: gracias a su bajo coste computacional, permite validar la viabilidad de una tarea de manipulacion en un laboratorio sin necesidad de servidores GPU de alta gama, reduciendo el tiempo de iteracion.
- Educacion en robotica: al ser un modelo compacto con licencia Apache 2.0, puede utilizarse en cursos universitarios de robotica y aprendizaje por refuerzo para demostrar politicas VLA en hardware asequible.
- Benchmarking de politicas VLA: la tarea de los cinco bloques con secuencia fija puede servir como caso de evaluacion estandarizado para comparar diferentes arquitecturas VLA o estrategias de fine-tuning.
- Despliegue en robots colaborativos (cobots): el modelo puede integrarse en un robot `so_follower` para tareas de clasificacion y ordenacion de objetos por color, un caso tipico en entornos de logistica ligera y almacenes pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de datos de tasa de exito en robot real ni de comparaciones cuantitativas con otros modelos para esta tarea concreta. El paper SmolVLA (arXiv:2506.01844) reporta resultados comparativos del enfoque general, pero no se dispone de esos datos en la informacion proporcionada para este repositorio especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~450M parametros y 0,9 GB de pesos en safetensors, una estimacion razonable para inferencia en FP32 seria de 2-4 GB de VRAM, y menos con cuantizacion, pero no se han publicado cifras oficiales.
- GPU recomendadas: el paper SmolVLA indica que el modelo esta disenado para hardware de consumo. GPUs como la RTX 3060 (12 GB), RTX 4070 o superiores deberian ser suficientes para inferencia.
- Compatibilidad con GPU de consumo: si, segun el diseno del modelo y su tamano. No se requiere hardware de centro de datos.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, con el comando `lerobot-rollout` para inferencia en robot real. Tambien es compatible con el flujo de entrenamiento `lerobot-train`.
- Latencia y throughput: no disponible. La tasa de captura de frames es de 30 FPS, lo que sugiere que el modelo debe operar a al menos esa frecuencia para control en tiempo real, pero no se han publicado mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_task1_5blocks_v3_444ep_fullft_b16_150k_v1 (este) | 450M | no disponible | Pick-and-place de 5 bloques | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | ~450M | no disponible | Preentrenamiento general VLA | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | no disponible | VLA generalista | MIT | HuggingFace |

El modelo base `lerobot/smolvla_base` es el punto de partida de este fine-tuning y comparte arquitectura y tamano. OpenVLA es un VLA de referencia con 7.000 millones de parametros, significativamente mas grande, que requiere hardware de mayor capacidad. El paper SmolVLA argumenta que su enfoque compacto logra rendimiento competitivo con un coste computacional muy inferior, pero no se dispone de datos de comparacion cuantitativa para este repositorio concreto.

## Limitaciones y advertencias

- La tarea esta restringida a un escenario muy especifico: recoger cinco bloques de colores en una secuencia fija y colocarlos en un area objetivo. No se ha demostrado generalizacion a otras tareas, disposiciones de objetos o entornos.
- No se han publicado resultados de evaluacion en robot real: la model card indica que no hay resultados de evaluacion, por lo que la tasa de exito real de la politica es desconocida.
- El modelo depende de las dos camaras especificas (top y wrist) con las que se entreno. Cambios en la posicion, orientacion o calibracion de las camaras pueden degradar el rendimiento.
- La resolucion de entrada es fija (480x640), lo que limita la adaptacion a otras configuraciones de camara sin reentrenamiento.
- El dataset de entrenamiento es de un unico robot (`so_follower`); la transferencia a otros robots requiere reentrenamiento o adaptacion.
- No se dispone de informacion sobre sesgos del modelo, riesgo de alucinacion o limitaciones de idioma, ya que la model card no los documenta.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo es un fine-tuning de investigacion con 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/eslab1234/smolvla_task1_5blocks_v3_444ep_fullft_b16_150k_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/eslab1234/task1_hybrid_5blocks_v3_444ep_merged
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://ar5iv.labs.arxiv.org/html/2506.01844
- Blog de SmolVLA (HuggingFace): https://github.com/huggingface/blog/blob/main/smolvla.md
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de rollout: https://huggingface.co/docs/lerobot/main/en/inference
