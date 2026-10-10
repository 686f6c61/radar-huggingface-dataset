# dddddsds31341/pi05-wash_dish_100-15k

## Resumen

`dddddsds31341/pi05-wash_dish_100-15k` es un checkpoint de ajuste fino completo del modelo vision-language-action (VLA) pi0.5, publicado en HuggingFace por el usuario `dddddsds31341`. No se trata de un modelo de lenguaje general, sino de una politica robotica especializada: recibe observaciones visuales y estado del robot, junto con una instruccion en lenguaje natural, y emite acciones motoras para un robot bimanual. El modelo base es `pi05_base` y el ajuste se ha realizado sobre el conjunto de datos `wash_dish_100` del framework openpi.

El checkpoint corresponde al paso de entrenamiento 15000 (de un total de 20005 pasos planificados), con un tamano de lote de 32. El repositorio ocupa 12.4 GB y contiene los parametros en formato Orbax junto con metadatos y las estadisticas de normalizacion del dataset `wash_dish_100`, necesarias para la evaluacion con la configuracion kai0 existente. La tarea objetivo es bimanual: agarrar y levantar un plato con un efector, limpiar su superficie interior con una esponja sostenida por el otro, y colocar el plato en vertical en un escurridor.

Su relevancia radica en que es un artefacto listo para evaluacion dentro del ecosistema openpi, lo que permite reproducir experimentos de manipulacion bimanual de larga duracion sin necesidad de reentrenar. Al no haber sido publicado con licencia ni documentacion ampliada, su uso en produccion requiere verificar primero las condiciones legales y la procedencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); pi0.5 con backbone vision-lenguaje y experto de acciones |
| Parametros totales | no disponible (repositorio de 12.4 GB en Orbax) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye sin cuantizar, en formato Orbax) |
| Idiomas soportados | no disponible (el unico prompt documentado esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | Orbax (parametros + metadatos + estadisticas de normalizacion de `wash_dish_100`) |

Otros parametros relevantes:

| Parametro | Valor |
|---|---|
| Paso de entrenamiento | 15000 |
| Pasos totales del entrenamiento | 20005 |
| Tamano de lote | 32 |
| Modelo base | pi05_base |
| Dataset de ajuste | wash_dish_100 |
| Pipeline declarado | robotics |
| Plataforma de evaluacion | configuracion kai0 de openpi |
| Tamano del repositorio | 12.4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi0.5 (etiquetada como `pi0.5` / `pi05` en las etiquetas del repositorio), una arquitectura vision-language-action difundida a traves del proyecto openpi. Este tipo de modelos combina un backbone de vision y lenguaje, que procesa las imagenes de camara y la instruccion textual, con un modulo generador de acciones que produce trayectorias motoras. Las etiquetas indican que la base es `pi05_base`, sobre la que se ha aplicado un ajuste fino completo (full fine-tuning), no un simple adaptador.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset `wash_dish_100`, ni sobre si se emplearon tecnicas de RLHF, DPO u otras. Lo que si se documenta es el procedimiento de ajuste: 15000 pasos completados de un total de 20005, con un tamano de lote de 32, partiendo de `pi05_base`. El checkpoint se entrega como directorio raiz del repositorio e incluye las estadisticas de normalizacion de `wash_dish_100`, lo que sugiere que la normalizacion de observaciones y acciones se realiza en el momento de la inferencia usando esos valores.

La instruccion objetivo documentada es: "Grasp and lift the dish with one gripper, while the other picks up the sponge and repeatedly wipes its inner surface; return the sponge, then place the dish upright in the rack." Esto confirma que el modelo opera en un escenario bimanual con multiples subtareas encadenadas (agarrar, limpiar, devolver la esponja y colocar el plato).

## Capacidades

- Generacion de acciones motoras para robots bimanuales a partir de observaciones visuales y estado del robot.
- Ejecucion de tareas de manipulacion de larga duracion con multiples subtareas encadenadas (agarrar, limpiar, recolocar).
- Control coordinado de dos efectores o grippers para tareas de limpieza sobre superficies.
- Seguimiento de instrucciones en lenguaje natural (el prompt documentado esta en ingles).
- Especializacion en la tarea concreta de lavado de platos sobre la plataforma de evaluacion kai0.
- Capacidad de servir como punto de partida para ajustes finos adicionales dentro del ecosistema openpi.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso textual: no disponible (no es un modelo de lenguaje de proposito general).
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, vision adicional, audio): no disponible.

## Casos de uso

- Investigacion en manipulacion bimanual: el checkpoint reproduce una politica entrenada para coordinar dos grippers en una tarea de limpieza, lo que permite estudiar como un VLA gestiona la asignacion de subtareas entre efectores.
- Evaluacion reproducible de VLA: al ser un checkpoint "evaluation-ready" con estadisticas de normalizacion incluidas y una configuracion kai0 asociada, sirve como referencia fija para comparar cambios en la plataforma, en el entorno fisico o en la propia politica.
- Punto de partida para ajuste fino en tareas afines: puede reentrenarse sobre datasets de manipulacion similares (limpieza de superficies, ordenacion de objetos) partiendo de un modelo ya especializado en tareas bimanuales.
- Benchmark de infraestructura robotica: util para medir latencia, estabilidad y comportamiento del pipeline openpi con evaluaciones reales en laboratorio.
- Pruebas de generalizacion ante variaciones de iluminacion, posicion del plato o colocacion de la esponja, evaluando la robustez de la politica entrenada.
- Desarrollo de rutinas domesticas en robotica de servicio: la tarea de lavado de platos es representativa de un escenario de cocina, y el checkpoint puede integrarse en prototipos de asistencia domestica con supervision.
- Comparacion de estrategias de ajuste fino: al conocerse el numero exacto de pasos y el tamano de lote, permite reproducir el entrenamiento y comparar el efecto del numero de pasos sobre el exito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de tarea ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio de 12.4 GB en formato Orbax sugiere pesos sin cuantizar, por lo que el consumo de memoria en inferencia sera del orden del tamano de los parametros mas el estado de activaciones y observaciones visuales.
- GPU recomendadas: no disponibles en la documentacion. Por tamano del checkpoint, se espera que sea desplegable en GPUs de 24 GB o superiores (RTX 4090, RTX 3090, A100, H100) siempre que el framework openpi lo soporte.
- Cabida en GPU de consumo: probable en GPUs de 24 GB (RTX 4090, RTX 3090), aunque no confirmado por el autor.
- Opciones de despliegue: el formato Orbax apunta al ecosistema openpi (JAX). No se documentan soportes de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas roboticas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento que permitan una comparacion numerica. Se ofrece una comparacion cualitativa con alternativas de la misma categoria (VLA para control robotico):

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dddddsds31341/pi05-wash_dish_100-15k` | VLA bimanual, ajuste fino sobre pi05_base | no disponible (repo 12.4 GB) | no disponible | no disponible | HuggingFace, 0 descargas |
| pi05_base (modelo base) | VLA base | no disponible | no disponible | no disponible en esta ficha | referencia citada por el autor |
| Otros VLA de la misma categoria (por ejemplo, OpenVLA o RDT-1B) | VLA | no disponible | no disponible | no disponible | no verificada en la informacion disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas a partir de la informacion recibida.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no puede asumirse que el uso comercial este permitido. Es imprescindible aclarar la licencia del modelo base `pi05_base` antes de cualquier despliegue.
- Procedencia del repositorio: el autor es un usuario individual (`dddddsds31341`) con cero descargas y cero likes; no hay verificacion de que el ajuste se haya realizado correctamente ni de que el checkpoint sea funcional.
- Especificidad de tarea: el modelo esta ajustado exclusivamente para la tarea `wash_dish_100`; no debe esperarse un comportamiento competente fuera de ese escenario.
- Dependencia de la configuracion kai0: la evaluacion esta ligada a la configuracion kai0 de openpi, por lo que el comportamiento puede variar fuera de ese entorno.
- Idiomas: el unico prompt documentado esta en ingles; se desconoce el comportamiento con instrucciones en castellano u otros idiomas.
- Sesgos: no disponible. No se ha publicado informacion sobre sesgos fisicos, sesgos de percepcion ni sesgos en la composicion del dataset `wash_dish_100`.
- Riesgo de fallo en ejecucion fisica: al ser una politica robotica, los errores pueden provocar danos materiales. Se recomienda validar en simulacion y con medidas de seguridad antes de cualquier prueba con robot real.
- Entrenamiento incompleto: el checkpoint corresponde al paso 15000 de 20005 planificados; no representa el punto final del entrenamiento previsto.
- Ausencia de benchmarks: no hay tasas de exito ni metricas publicadas que respalden el rendimiento de la politica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dddddsds31341/pi05-wash_dish_100-15k
- Modelo base citado (`pi05_base`): no disponible como enlace directo en la informacion proporcionada.
- Framework openpi: no disponible como enlace directo en la informacion proporcionada.
- Dataset `wash_dish_100`: no disponible como enlace directo en la informacion proporcionada.
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
