# alanoob/pi05-sort-stack-drawer-alpha1

## Resumen

pi05-sort-stack-drawer-alpha1 es un checkpoint de politica robotica publicado por el usuario alanoob en HuggingFace, construido como ajuste fino completo (full fine-tuning) sobre el modelo base pi05_base. Esta orientado a tres tareas de manipulacion con un brazo Franka de un solo brazo: clasificacion de cubos (sort), apilado de vasos (stack) y manipulacion de cajones (drawer). Se distribuye dentro del ecosistema openpi, la libreria asociada a los modelos pi05, y su repositorio ocupa 134.1 GB.

El modelo es relevante para investigadores en robotica que trabajan con aprendizaje por imitacion y vision-language-action (VLA), porque documenta de forma explicita el esquema de ponderacion del dataset (dataset-shard-count weighting con alpha=1) y las proporciones de cada tarea durante el entrenamiento: Sort 0.6179, Stack 0.1057 y Drawer 0.2764. Esta transparencia en la mezcla de tareas facilita reproducir o comparar estrategias de entrenamiento multitarea sobre un mismo brazo.

El repositorio incluye tres checkpoints (30000, 40000 y 45000 pasos), cada uno con parametros de inferencia, assets de normalizacion y estado de entrenamiento. El guardado de 50000 pasos fallo por cuota de disco local. Se trata de un artefacto muy reciente, con 0 descargas y 0 likes, sin licencia declarada ni idiomas especificados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi05; no se detalla la topologia interna en la informacion disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint de openpi (parametros de inferencia, assets de normalizacion y estado de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo desde pi05_base, el modelo base de la familia pi05, orientado a control robotico. La informacion disponible no detalla la topologia interna (encoder visual, backbone de lenguaje ni cabezal de acciones), por lo que no se pueden confirmar aspectos como el tipo de atencion, el numero de parametros ni el mecanismo de generacion de acciones. Si se especifica que la salida de control emplea un horizonte de accion de 20 y un muestreo temporal de 30 Hz, parametros relevantes para el despliegue en el brazo Franka.

El entrenamiento cubre tres tareas de manipulacion de un solo brazo: clasificacion de cubos, apilado de vasos y manipulacion de cajones. La mezcla de datos se construyo mediante ponderacion por numero de shards del dataset (dataset-shard-count weighting, alpha=1), con pesos registrados de Sort 0.6179, Stack 0.1057 y Drawer 0.2764, lo que indica un fuerte sesgo hacia la tarea de clasificacion. El tamano de batch fue de 16 y se conservan checkpoints en los pasos 30000, 40000 y 45000; el guardado en el paso 50000 no se incluye porque fallo por cuota de disco local.

## Capacidades

- Manipulacion robotica multitarea: ejecuta tres tareas distintas (sort, stack, drawer) con una sola politica entrenada mediante ajuste fino completo.
- Clasificacion de cubos: tarea con mayor peso en el entrenamiento (0.6179), por lo que es previsiblemente la habilidad mejor representada en los datos.
- Apilado de vasos: tarea con el peso mas bajo (0.1057), lo que sugiere menos exposicion durante el entrenamiento.
- Manipulacion de cajones: apertura y operacion de cajones con un brazo Franka.
- Control a 30 Hz con horizonte de accion de 20: compatible con bucles de control de frecuencia media en robotica.
- Inferencia como politica VLA a partir de observaciones visuales; no se detallan capacidades de lenguaje, tool calling ni agentes en la informacion disponible.
- Capacidades multilingues, de codigo, matematicas, vision general o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion de piezas en linea de montaje: usar la politica para separar cubos u objetos similares por categoria sobre una mesa de trabajo, aprovechando que sort es la tarea con mayor peso de entrenamiento (0.6179) y por tanto la mas representada.
- Apilado controlado de recipientes: emplear el checkpoint para tareas de stacking de vasos, util en entornos de laboratorio donde se requiere colocacion precisa de objetos cilindricos.
- Automatizacion de apertura y cierre de cajones: integrar la politica en una celda robotica Franka para manipular cajones en tareas de almacenamiento o inspeccion.
- Investigacion en aprendizaje multitarea: usar los tres checkpoints (30000, 40000, 45000) para estudiar como evoluciona el rendimiento y el olvido entre tareas a lo largo del entrenamiento.
- Reproduccion de experimentos de mezcla de datos: emplear los pesos documentados (alpha=1, Sort 0.6179, Stack 0.1057, Drawer 0.2764) como referencia para disenar estrategias de muestreo en nuevos ajustes finos.
- Base para fine-tuning en tareas nuevas: partir de este checkpoint ya ajustado en lugar de pi05_base para adaptar la politica a variaciones de la misma tarea (nuevos objetos, posiciones o utilajes).
- Evaluacion de infraestructura de despliegue: medir latencia y estabilidad del bucle de control a 30 Hz con horizonte 20 sobre hardware objetivo antes de escalar a produccion.
- Generacion de datos de demostracion: usar la politica como generador de trayectorias en simulacion o en real para aumentar datasets de aprendizaje por imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de error ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 134.1 GB, pero ese tamano incluye estado de entrenamiento y assets de normalizacion, por lo que el checkpoint de inferencia es un subconjunto de esas cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; no se especifica hardware objetivo ni requisitos minimos.
- Compatibilidad con GPU de consumo: no disponible; sin datos de parametros totales no se puede confirmar si cabe en una RTX 4090 u otra GPU de gama alta.
- Opciones de despliegue: la libreria declarada es openpi, por lo que el despliegue esperado es a traves de ese stack. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a politicas roboticas VLA.
- Latencia y throughput: no disponibles. El unico dato de temporizacion es el muestreo temporal de 30 Hz y el horizonte de accion de 20, que condicionan el bucle de control, no el rendimiento medido.
- Almacenamiento: se requiere espacio en disco para 134.1 GB si se descarga el repositorio completo; el autor advierte de problemas de cuota de disco local durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-sort-stack-drawer-alpha1 | Modelo de esta ficha | no disponible | no disponible | no disponible | HuggingFace (0 descargas) |
| pi05_base | Modelo base del que parte el ajuste fino | no disponible | no disponible | no disponible | Referenciado en la model card |
| Otras politicas VLA abiertas (por ejemplo OpenVLA, RDT-1B) | Alternativas del mismo ambito | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numericos del modelo ni de comparativas publicadas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento, parametros o contexto frente a alternativas.

## Limitaciones y advertencias

- Sesgos de tarea: la mezcla de entrenamiento esta fuertemente desequilibrada hacia Sort (0.6179) frente a Stack (0.1057), por lo que el rendimiento en apilado puede ser notablemente inferior.
- Ambito restringido: la politica esta ajustada para tres tareas especificas con un brazo Franka; no se garantiza su generalizacion a otros robots, morfologias u objetos.
- Riesgo de fallo fuera de distribucion: al ser aprendizaje por imitacion, cambios en iluminacion, posiciones de camara o utilajes pueden degradar el comportamiento.
- Ausencia de licencia: no se declara licencia, lo que impide conocer las condiciones de uso comercial o redistribucion. Esto es un riesgo relevante para produccion.
- Idiomas no declarados: no hay informacion sobre capacidades linguisticas ni sobre como se procesan instrucciones de texto.
- Checkpoint incompleto: el paso 50000 no se incluye por un fallo de cuota de disco, por lo que la evolucion final del entrenamiento no esta disponible.
- Ausencia de benchmarks: no hay tasas de exito ni metricas de seguridad, lo que dificulta evaluar el modelo antes de desplegarlo.
- Madurez: 0 descargas y 0 likes; el artefacto es muy reciente y no cuenta con validacion externa conocida.
- Tamano del repositorio: 134.1 GB complican la descarga, el almacenamiento y la gestion de versiones en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alanoob/pi05-sort-stack-drawer-alpha1
- Libreria openpi (referenciada por el modelo): https://github.com/Physical-Intelligence/openpi
- Modelo base pi05_base: referenciado en la model card sin enlace directo disponible
