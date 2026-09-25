# leoliu49/smolvla-pick-cap-notactile-s1

## Resumen

`leoliu49/smolvla-pick-cap-notactile-s1` es un checkpoint de política robótica de tipo vision-language-action (VLA) obtenido por ajuste fino (*fine-tuning*) del modelo base `lerobot/smolvla_base`. Lo publica el usuario `leoliu49` y está entrenado con LeRobot sobre el dataset `leoliu49/pick-cap-notactile`, que define una tarea concreta de manipulación: coger un tapón (*cap*) sin información táctil. Con 450.046.176 parámetros y un repositorio de 0,9 GB, es un modelo compacto pensado para ejecutarse en hardware de consumo.

SmolVLA es la familia de referencia descrita en el artículo arXiv 2506.01844, que propone un VLA compacto y eficiente capaz de alcanzar rendimiento competitivo con un coste computacional reducido. Este checkpoint en concreto no es un modelo general, sino una política especializada: hereda la arquitectura y los pesos preentrenados del modelo base y los adapta a una única tarea de agarre.

Su relevancia es práctica más que investigadora: sirve como ejemplo reproducible de cómo se ajusta un VLA pequeño con LeRobot sobre un dataset propio y se despliega en un robot tipo SO-100/SO-101 con GPU de gama media. No es un modelo conversacional ni de propósito general: no genera texto libre, no razona en lenguaje natural y solo produce acciones motoras condicionadas por observaciones visuales e instrucciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer; backbone concreto no especificado en la informacion disponible |
| Parametros totales | 450.046.176 (450 M, dato real de safetensors) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF o similares) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | leoliu49/pick-cap-notactile |
| Pipeline | robotics |
| Tamano del repositorio | 0,9 GB |
| Fecha de creacion | 2026-09-24 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action: combina un codificador visual, un componente de lenguaje y una cabeza de acción que emite comandos motores. El artículo de referencia (arXiv 2506.01844) describe la familia como un VLA compacto y eficiente, capaz de obtener resultados competitivos con un coste computacional reducido y de desplegarse en hardware de consumo. El detalle exacto del backbone, la ventana de observación, el número de tokens por acción (*action chunking*) y el mecanismo de atención no se especifican en la información disponible, por lo que no se reproducen aquí.

Este checkpoint concreto se ha obtenido por ajuste fino supervisado del modelo base `lerobot/smolvla_base` sobre el dataset `leoliu49/pick-cap-notactile`, mediante el flujo estándar de LeRobot. No hay información sobre el número de episodios, la composición del dataset, el número de pasos de entrenamiento ni sobre técnicas de alineación como RLHF o DPO, que en un modelo de política robótica no serían el mecanismo habitual. La model card reproduce la plantilla genérica de LeRobot: los comandos de ejemplo que incluye usan `--policy.type=act`, que no corresponde a SmolVLA, por lo que deben adaptarse antes de reutilizarlos.

## Capacidades

- Generación de acciones motoras (*action policy*) condicionadas por observaciones visuales de cámara y por el estado del robot.
- Control guiado por lenguaje: la política acepta instrucciones en lenguaje natural para definir la tarea, en línea con el planteamiento VLA de SmolVLA.
- Especialización en una tarea concreta: coger un tapón (*pick cap*) sin señal táctil.
- Integración nativa con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y evaluación o inferencia (`lerobot-record`).
- Compatibilidad con robots de tipo `so100_follower` (SO-100/SO-101) según los comandos documentados en la model card.
- Inferencia en hardware de consumo, gracias a los 450 M de parámetros del modelo.
- No soporta *tool calling*, function calling, agentes multi-paso ni generación de texto libre: no es un modelo de lenguaje.
- Capacidades multilingües, de visión general, audio o *thinking mode*: no disponibles o no aplicables.

## Casos de uso

- Automatización de una celda de agarre (*pick-and-place*): la política ejecuta la tarea de coger un tapón y colocarlo en la posición aprendida, sustituyendo el script de control manual por una política visual condicionada.
- Base para ajuste fino de tareas similares: al ser un modelo de 450 M y licencia Apache 2.0, sirve como punto de partida para entrenar variantes de agarre con nuevos datasets de pocas decenas de episodios.
- Prototipado rápido en robótica de bajo coste: se puede desplegar sobre un SO-100/SO-101 con una GPU de gama media, lo que permite validar un *pipeline* completo de VLA sin infraestructura de centro de datos.
- Investigación en manipulación sin señal táctil: al ser explícitamente la variante "notactile", permite estudiar hasta qué punto la visión basta para tareas de agarre donde normalmente se usaría sensor táctil.
- Evaluación comparativa de políticas en LeRobot: el flujo `lerobot-record` con `--episodes=N` y prefijo `eval_` permite medir tasas de éxito y compararlas con otras políticas entrenadas sobre el mismo robot.
- Docencia y reproducción de resultados: es un ejemplo compacto y de extremo a extremo (dataset, entrenamiento, checkpoint publicado) para enseñar cómo se ajusta un VLA con LeRobot.
- Generación de datos de evaluación: ejecutando la política sobre el robot real se pueden grabar episodios etiquetados como `eval_` que alimenten análisis posteriores de fallos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye tablas de tasas de éxito, número de episodios de evaluación ni comparaciones numéricas con otras políticas. El artículo arXiv 2506.01844 describe el rendimiento de la familia SmolVLA en términos cualitativos ("rendimiento competitivo con coste computacional reducido"), pero sus cifras concretas no forman parte de la información proporcionada y no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada en inferencia: en bf16/fp16, los pesos ocupan aproximadamente 0,9 GB (coincide con el tamaño del repositorio); en fp32, unos 1,8 GB. Sumando activaciones del codificador visual y de la cabeza de acción, un presupuesto práctico de 2 a 4 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Una RTX 3060 (12 GB), RTX 4060, RTX 4070 o RTX 4090 son más que suficientes; A100 o H100 solo tendrían sentido si se entrenan varias políticas en paralelo.
- Cabe en GPU de consumo: sí, es uno de los objetivos de diseño de SmolVLA. El propio artículo destaca el despliegue en hardware de consumo.
- Opciones de despliegue: el flujo nativo es LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluación). vLLM, TGI u Ollama no aplican a este tipo de política, orientada a salidas de acción y no a texto.
- Latencia y throughput: no disponible. No se documentan tiempos de inferencia ni frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leoliu49/smolvla-pick-cap-notactile-s1 | 450 M | no disponible | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| lerobot/smolvla_base (modelo base) | no disponible | no disponible | politica general, requiere ajuste fino para cada tarea | Apache 2.0 | HuggingFace, mantenido por LeRobot |
| Zyz66/pick-object-smolvla-v4 | no disponible | no disponible | politica de agarre de objetos, ajuste de SmolVLA | no disponible | HuggingFace |
| Politica ACT en LeRobot | no disponible | no disponible | linea base de imitacion sin componente de lenguaje | no disponible | repositorio huggingface/lerobot |

La comparación cuantitativa no es posible con la información disponible: no hay cifras de rendimiento publicadas para este checkpoint ni para las alternativas listadas. La diferencia principal frente al modelo base es la especialización en la tarea de coger un tapón sin señal táctil; frente a ACT, la ventaja teórica es el componente de lenguaje y el preentrenamiento visual, aunque sin datos de evaluación no puede confirmarse.

## Limitaciones y advertencias

- Es una política especializada en una única tarea. No debe esperarse generalización a otras tareas de manipulación sin un nuevo ajuste fino.
- Al ser la variante "notactile", no utiliza sensor táctil; en tareas donde el contacto sea crítico (objetos frágiles, agarres ajustados) su fiabilidad puede degradarse.
- No hay resultados de evaluación publicados: no se conoce la tasa de éxito real de la política ni el número de episodios usados en el entrenamiento, lo que dificulta juzgar su robustez.
- El repositorio registra 0 descargas y 0 "likes", por lo que no ha sido validado por la comunidad.
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, posición de cámara, fondo o tipo de objeto pueden degradar el comportamiento. No hay datos sobre aumentos de datos o aleatorización de dominio.
- La model card reutiliza la plantilla genérica de LeRobot y sus comandos hacen referencia a `--policy.type=act`, que no corresponde a SmolVLA. Hay que revisar y adaptar los comandos antes de usarlos.
- No se documentan cuantizaciones, idiomas soportados ni requisitos de contexto, por lo que integrarlo en un *pipeline* de producción exige validación propia.
- La fecha de creación indicada en los metadatos (2026-09-24) es posterior a la fecha actual del análisis en el momento de redactar esta ficha; conviene verificarla antes de citarla.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base y LeRobot pueden arrastrar sus propias condiciones, que conviene revisar por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leoliu49/smolvla-pick-cap-notactile-s1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/leoliu49/pick-cap-notactile
- Artículo SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Modelo comunitario relacionado: https://huggingface.co/Zyz66/pick-object-smolvla-v4
- Fork de referencia de LeRobot con SmolVLA: https://github.com/zyqdragon/lerobot_smolvla
