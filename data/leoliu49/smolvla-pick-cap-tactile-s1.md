# leoliu49/smolvla-pick-cap-tactile-s1

## Resumen

smolvla-pick-cap-tactile-s1 es un ajuste fino (fine-tune) del modelo base SmolVLA de Hugging Face, un modelo vision-lenguaje-accion (VLA) compacto orientado a robotica. Lo publica el usuario leoliu49 en el Hub y esta especializado en una tarea concreta de manipulacion con retorno tactil: recoger una tapa o tapon ("pick cap") haciendo uso de un dataset propio con senal tactil (leoliu49/pick-cap-tactile). No es un modelo de proposito general, sino una politica de control entrenada para un montaje robotico especifico.

El modelo hereda la arquitectura de SmolVLA: un VLM preentrenado compacto que codifica varias vistas de camara, el estado sensoriomotor del robot y una instruccion en lenguaje natural, mas un "action expert" entrenado con flow matching que genera trozos (chunks) de acciones. Con 450.046.176 parametros (~450 M) y un repositorio de 0,9 GB, esta pensado para desplegarse en hardware de consumo, lo que reduce la barrera de entrada frente a VLA de miles de millones de parametros.

Su relevancia es doble: por un lado demuestra el flujo de trabajo de LeRobot para adaptar un modelo fundacional de robotica a una tarea propia con relativamente pocas demostraciones; por otro, incorpora modalidad tactil ademas de vision y lenguaje, un caso menos habitual en los VLA publicos. La licencia Apache 2.0 permite uso comercial, pero el checkpoint esta atado al dataset y al setup de robot concretos con los que se entreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-languaje-accion (VLA): VLM compacto preentrenado + "action expert" con flow matching |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente bf16/fp32; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (recibe instrucciones en lenguaje natural, pero no se especifica el conjunto de idiomas de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | leoliu49/pick-cap-tactile |
| Pipeline | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA sigue un diseno de dos componentes: un modelo de vision-lenguaje (VLM) compacto y preentrenado que procesa multiples vistas de camara, el estado propioceptivo del robot y una instruccion textual; y un "action expert" que, condicionado por esas caracteristicas contextuales, genera un chunk de acciones mediante flow matching. Esta formulacion permite entrenar el modulo de accion sin reentrenar el codificador visual-lenguaje completo. El modelo base se describe en el paper arXiv:2506.01844 como un VLA ligero con rendimiento competitivo a un coste computacional reducido y desplegable en hardware de consumo.

Este checkpoint concreto es un fine-tune del modelo base sobre el dataset leoliu49/pick-cap-tactile, que aporta demostraciones de una tarea de recogida de tapa con senal tactil. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el numero de episodios ni si hubo etapas de RLHF o DPO. Tampoco se detalla el esquema de fusion de la modalidad tactil dentro del codificador. El entrenamiento se ha realizado con LeRobot, cuyo flujo estandar recomienda grabar alrededor de 50 episodios por tarea como punto de partida para un ajuste razonable.

## Capacidades

- Control robótico por imitacion: genera chunks de acciones de bajo nivel a partir de observaciones visuales y del estado del robot.
- Percepcion multimodal de entrada: acepta multiples vistas de camara, estado sensoriomotor y una instruccion en lenguaje natural.
- Condicionamiento por lenguaje: la tarea se especifica mediante instruccion textual, lo que permite variar el objetivo sin reentrenar.
- Integracion de senal tactil: el ajuste fino se ha realizado sobre un dataset con modalidad tactil para la tarea de recogida de tapa, aunque no se detalla el mecanismo exacto de fusion.
- Manipulacion tipo pick: especializado en tareas de agarre y recogida ("pick cap") en el montaje para el que fue entrenado.
- Inferencia en hardware de consumo: el tamano de ~450 M y el repositorio de 0,9 GB lo permiten.
- Tool calling / function calling: no disponible; no es una capacidad de este tipo de modelo.
- Razonamiento multi-paso explicito y modo "thinking": no disponible.
- Vision y audio generativos: no disponible; la vision se usa como entrada de control, no como salida.
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de una celda de pick-and-place: el modelo ejecuta la secuencia de aproximacion, agarre y deposito de la tapa sobre el mismo tipo de robot y utillaje con el que se entreno, sustituyendo a una politica programada a mano.
- Manipulacion con objetos que requieren ajuste fino de fuerza: al haberse entrenado con datos tactiles, es adecuado para recoger piezas donde el exito depende de la presion de agarre y no solo de la posicion visual.
- Prototipado rapido de politicas en laboratorio: sirve como punto de partida para investigar fusion vision-tacto en robotica, comparando este checkpoint con variantes sin senal tactil.
- Generacion de datos y evaluacion comparativa: puede usarse como politica de referencia en experimentos de evaluacion con LeRobot (`lerobot-record`), registrando episodios etiquetados como `eval_*` para medir tasa de exito.
- Base para un nuevo ajuste fino: dado que es un derivado de `lerobot/smolvla_base`, se puede continuar el entrenamiento con mas episodios o con variaciones de posicion del objeto para mejorar la robustez.
- Demostraciones educativas de VLA de bajo coste: al caber en una GPU de consumo, permite montar talleres o practicas donde se explique el ciclo completo de grabacion de dataset, entrenamiento y despliegue con LeRobot.
- Despliegue en robot de bajo coste tipo SO-100/SO-101: la documentacion de LeRobot usa estos brazos para evaluar politicas SmolVLA, por lo que encaja en montajes economicos de laboratorio o docencia.
- Investigacion en adaptacion de dominio: util para estudiar cuanto generaliza un VLA pequeno cuando cambia la iluminacion, la camara o la textura del objeto respecto al dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye tablas de evaluacion, tasas de exito ni comparaciones numericas, y el autor no aporta metricas de la tarea `pick-cap-tactile`. El paper del modelo base (arXiv:2506.01844) describe evaluaciones de SmolVLA, pero no se dispone de sus cifras en la informacion proporcionada, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 450 M de parametros, sin contar activaciones ni buffers de camaras): ~1,8 GB en fp32, ~0,9 GB en bf16/fp16, ~0,45 GB en int8 si se cuantizara.
- VRAM realista en ejecucion: superior a la de los pesos por las multiples entradas de camara, el estado del robot y el bucle de control; se recomienda reservar al menos 2-4 GB en bf16 para trabajar con margen.
- GPU recomendadas: cualquier GPU con >=4 GB de VRAM; RTX 3060/4060/4090 son suficientes. No requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, es uno de los objetivos de diseno de SmolVLA; tambien puede ejecutarse en CPU para pruebas, con latencia mayor.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record` con `--policy.path`), sobre PyTorch. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no son el cauce habitual para politicas VLA.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia de diseno, el modelo debe generar chunks de acciones a la frecuencia de control del robot, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla-pick-cap-tactile-s1 (este) | ~450 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hub de Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible (modelo base del anterior) | no disponible | evaluado en arXiv:2506.01844, cifras no disponibles aqui | Apache 2.0 | Hub de Hugging Face |
| Otros VLA comparables (por ejemplo, pi0, OpenVLA, ACT) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La unica comparacion que puede sostenerse con la informacion disponible es frente a `lerobot/smolvla_base`: este checkpoint anade un ajuste especifico sobre el dataset tactil `pick-cap-tactile`, por lo que gana especializacion en esa tarea y pierde generalidad respecto al modelo base. Para el resto de alternativas del ecosistema VLA no se dispone de datos verificados en esta ficha.

## Limitaciones y advertencias

- Especializacion extrema: es un fine-tune de una unica tarea sobre un unico dataset, por lo que no debe esperarse generalizacion a otras tareas, objetos o montajes sin un nuevo ajuste.
- Dependencia del setup: el rendimiento probablemente se degrada si cambian la camara, la iluminacion, la posicion del robot o el sensor tactil respecto a los usados al grabar `leoliu49/pick-cap-tactile`.
- Sin datos de evaluacion: no hay tasas de exito, curvas de aprendizaje ni analisis de fallos publicados; en produccion habria que medirlos antes de confiar en la politica.
- Riesgo de sobreajuste: con repositorios pequenos y pocas horas de demostracion, la politica puede memorizar trayectorias en lugar de generalizar posiciones de objeto.
- Modo de fallo fisico en lugar de alucinacion textual: al ser una politica de control, los errores se manifiestan como agarres fallidos, colisiones o movimientos inseguros, con el riesgo material que ello implica; requiere limites de par, parada de emergencia y supervision.
- Idiomas y contexto: no se especifica que idiomas entiende ni la longitud de contexto del componente de lenguaje, lo que impide garantizar instrucciones en castellano.
- Cuantizacion no documentada: no hay variantes GGUF ni cuantizadas oficiales, asi que el despliegue en hardware muy limitado requeriria trabajo adicional.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe cumplir tambien las condiciones aplicables al modelo base `lerobot/smolvla_base` y a los datos de origen; conviene revisar la licencia del dataset `leoliu49/pick-cap-tactile`.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los fallos esten ya documentados por terceros.
- Advertencia general de SmolVLA: la documentacion de LeRobot indica que es un modelo base y que el ajuste fino con datos propios es necesario para un rendimiento optimo en cada montaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leoliu49/smolvla-pick-cap-tactile-s1
- Dataset de ajuste: https://huggingface.co/datasets/leoliu49/pick-cap-tactile
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- PDF del paper: https://arxiv.org/pdf/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Documentacion de SmolVLA (espejo): https://dctx-team.github.io/lerobot-zh/en/smolvla/
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
