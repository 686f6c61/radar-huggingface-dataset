# LeeHakHo/square_real100_bs128_ckpt

## Resumen

`LeeHakHo/square_real100_bs128_ckpt` es un conjunto de checkpoints de una policy de difusion (diffusion policy) entrenada mediante clonacion de comportamiento (behavior cloning) sobre 100 demostraciones reales de un brazo Franka en la tarea Square de robomimic, que consiste en insertar una tuerca en un pivote. El autor es LeeHakHo y el artefacto se publica con licencia MIT. No es un modelo de lenguaje ni un modelo multimodal de proposito general: es una policy de control robotico que consume observaciones visuales de 84 px y produce secuencias de acciones de horizonte 16.

El entrenamiento se hizo en una unica RTX 4080 local, con los dos brazos de estudio compartiendo la GPU, batch 128, learning rate 1,4e-4 (escalado por raiz cuadrada desde el 1e-4 usado a batch 64), 700 pasos de warmup, decaimiento coseno que llega a cero en el paso final y 1000 epocas de 100 pasos. La caracteristica mas relevante del run es metodologica: las 100 demostraciones se usan como datos de entrenamiento (`hdf5_filter_key` es nulo y `experiment.validate` es falso), de modo que no existe curva de validacion y los checkpoints solo pueden seleccionarse por perdida de entrenamiento.

El repositorio ocupa 26,3 GB y contiene checkpoints centenarios (`model_epoch_{100,200,...}.pth`) de aproximadamente 1,7 GiB cada uno, con estado del optimizador y pesos EMA incluidos. En el momento de la ultima actualizacion el run seguia entrenando (epocas registradas 858 y 860 de 1000). No se reporta tasa de exito porque no hay simulador detras del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Policy de difusion para clonacion de comportamiento (robomimic / diffusion policy). Backbone concreto no detallado en la model card |
| Parametros totales | No disponible (cada checkpoint `.pth` ocupa ~1,7 GiB e incluye estado del optimizador y pesos EMA) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). La configuracion usa `seq_length` 16 |
| Tipos de cuantizacion | No se ofrecen variantes cuantizadas; solo checkpoints PyTorch en precision de entrenamiento |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`model_epoch_*.pth`) |
| Tarea | Square (nut-on-peg) de robomimic, insercion de tuerca en pivote |
| Dataset de entrenamiento | `LeeHakHo/square_real100`, 100 demostraciones reales de Franka |
| Resolucion de observacion | 84 px |
| Tamano del repositorio | 26,3 GB |
| Fecha de publicacion | 2026-09-12 (creacion), 2026-09-12 (ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de una policy de difusion aplicada a imitacion robotica: el modelo aprende a generar secuencias de acciones mediante un proceso de difusion condicionado por observaciones, en lugar de regresar directamente una accion unica. La model card no especifica el backbone exacto ni el numero de parametros; lo que si detalla es que existe un unico backbone y una unica configuracion, y que los dos brazos publicados se diferencian exclusivamente en el objetivo auxiliar aplicado al codificador visual. El horizonte de accion configurado es `seq_length` 16 y las observaciones visuales se capturan a 84 px.

El regimen de entrenamiento es batch 128 con learning rate 1,4e-4, obtenido por escalado de raiz cuadrada desde el 1e-4 empleado a batch 64, con 700 pasos de warmup y decaimiento coseno que alcanza exactamente cero en el paso final, durante 1000 epocas de 100 pasos. Los dos brazos son `baseline/` (sin objetivo auxiliar) y `aux_eef_frame/`, que anade la prediccion de la posicion del objeto en el marco del gripper mediante `--aux_eef_frame` con 3 capas de cabeza. No se supervisa rotacion en ningun caso (`rotation_blocks: []`): la cabeza auxiliar emite las ranuras de rotacion pero su error queda enmascarado, de modo que solo se aprende posicion. La observacion `obs/object` procede de tracking con FoundationPose y no de ground truth, por lo que las muestras con `obs/aux_valid = 0` se descartan tanto de la perdida auxiliar como de la estandarizacion de sus objetivos.

Una decision metodologica destacable es la eliminacion de la validacion. El estudio previo a batch 64 con particion 90/10 mostro que la perdida de validacion toca suelo en torno a las epocas 30-100 y despues sube durante el resto del entrenamiento, mientras que el replay offline sobre demostraciones retenidas seguia mejorando hasta la epoca 900. Por ese motivo este run entrena con las 100 demostraciones y selecciona checkpoints unicamente por perdida de entrenamiento, replicando lo que hace la implementacion de referencia de diffusion policy para su configuracion de robot real.

## Capacidades

- Generacion de trayectorias de accion para la tarea Square (insertar una tuerca en un pivote) con un brazo Franka, a partir de observaciones visuales de 84 px.
- Control visomotor de horizonte 16: la policy produce secuencias de acciones, no acciones aisladas, lo que permite ejecucion con replanificacion.
- Estimacion implicita de posicion del objeto en el marco del efector en el brazo `aux_eef_frame/`, como objetivo auxiliar de representacion; el brazo `baseline/` no la tiene.
- Aprendizaje exclusivo de posicion: la rotacion no esta supervisada ni se predice de forma efectiva (`rotation_blocks: []`, error de las ranuras de rotacion enmascarado).
- Replay offline: la model card menciona evaluacion mediante replay sobre demostraciones retenidas en el estudio previo, no como capacidad del modelo en si.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling, soporte de agentes, capacidades multilingues ni modo de pensamiento. Cualquier uso fuera del control robotico de la tarea no esta soportado.

## Casos de uso

- Reproduccion de la tarea Square sobre un Franka real: cargar `model_epoch_*.pth` en robomimic y ejecutar la policy en bucle cerrado con las mismas camaras y preprocesado a 84 px. Es el uso directo para el que fue entrenada, aunque sin tasa de exito publicada hay que validarla en el banco.
- Estudio de ablacion del objetivo auxiliar: comparar `baseline/` frente a `aux_eef_frame/` con la misma configuracion y los mismos datos permite aislar el efecto de supervisar la posicion del objeto en el marco del gripper. La model card ya reporta que ambas terminan con la misma perdida de accion (0,0048), lo que invita a medir diferencias en ejecucion real.
- Punto de partida para fine-tuning con mas demostraciones: al usar las 100 demostraciones como datos de entrenamiento, el checkpoint es un candidato razonable para continuar el entrenamiento con nuevas demos o con rotacion supervisada activada.
- Investigacion sobre seleccion de checkpoints sin validacion: el run es un caso practico para estudiar estrategias de seleccion basadas en perdida de entrenamiento o en replay offline, dado que la validacion se elimino de forma deliberada.
- Integracion en un pipeline de percepcion con FoundationPose: el brazo `aux_eef_frame/` consume `obs/object` procedente de tracking, de modo que sirve para evaluar la sensibilidad de la policy al ruido y a los huecos de la estimacion de pose (muestras con `obs/aux_valid = 0`).
- Replicacion de experimentos de diffusion policy en hardware consumer: todo el run se entreno en una sola RTX 4080 con los dos brazos compartiendo la GPU, lo que lo convierte en una referencia util para grupos con recursos limitados que quieran reproducir el pipeline completo.
- Banco de pruebas de despliegue y latencia de una policy de difusion: sirve para medir coste de inferencia por paso de control y decidir si el horizonte 16 permite ejecutar con o sin replanificacion.
- Docencia y divulgacion en robotica: ejemplo completo de clonacion de comportamiento sobre datos reales, con configuracion, regimen de entrenamiento y artefactos publicados, sin depender de un simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay simulador detras del dataset y que no se reporta tasa de exito. El unico dato cuantitativo publicado es la perdida de accion de entrenamiento, registrada antes de sumar el termino auxiliar para que ambos brazos sean comparables:

| Brazo | Perdida de accion (train) | Epoca |
|---|---|---|
| `aux_eef_frame/` | 0,0048 | 858 |
| `baseline/` | 0,0048 | 860 |

No hay curva de validacion, no hay particion de test y no hay comparacion con checkpoints de otros autores. Cualquier cifra de exito en la tarea Square tendria que obtenerse ejecutando la policy en un Franka real.

## Requisitos de hardware

- Entrenamiento documentado: una unica RTX 4080 local (16 GB de VRAM), con los dos brazos compartiendo la GPU. Es una referencia util como cota inferior de recursos para este tamano de run.
- Almacenamiento: el repositorio completo ocupa 26,3 GB. Cada checkpoint centenario pesa aproximadamente 1,7 GiB e incluye estado del optimizador y pesos EMA, por lo que el peso de los parametros de inferencia es una fraccion de esa cifra.
- VRAM para inferencia: no disponible como medicion publicada. Dado que se trata de una policy convolucional con observaciones de 84 px y horizonte 16, es razonable esperar que quepa en GPUs consumer modernas con 8 GB o mas, pero esta afirmacion es una estimacion no verificada y debe comprobarse en el entorno objetivo.
- GPU recomendadas: no especificadas por el autor. La unica GPU citada en la model card es la RTX 4080 empleada para entrenar.
- Compatibilidad con GPU consumer: si, la evidencia disponible (entrenamiento completo en una RTX 4080) apunta a que el modelo cabe en hardware consumer, aunque no se documenta el consumo en inferencia.
- Opciones de despliegue: inferencia en PyTorch dentro del ecosistema robomimic, que es el marco con el que se entreno. No se proporcionan exportaciones a ONNX, TensorRT ni TorchScript.
- Incompatibilidades: al no ser un modelo de lenguaje, no aplican vLLM, TGI, llama.cpp, Ollama ni formatos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por paso de control ni de frecuencia de replanificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LeeHakHo/square_real100_bs128_ckpt` | No disponible | 16 (acciones), obs. a 84 px | Sin tasa de exito; perdida de accion 0,0048 | MIT | HuggingFace |
| `LeeHakHo/square_real100_ckpt` (batch 64, mismo autor) | No disponible | 16 (acciones), obs. a 84 px | Sin tasa de exito; particion 90/10 con validacion que repunta tras la epoca 30-100 | MIT | HuggingFace |
| Implementacion de referencia de diffusion policy (robot real) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparacion mas directa es con el propio estudio a batch 64 del mismo autor, que se diferencia en el batch, en el learning rate (1e-4 frente a 1,4e-4) y, sobre todo, en el uso de una particion 90/10 con validacion. El resto de alternativas de la misma categoria no se pueden comparar con datos porque no se ha proporcionado informacion sobre ellas.

## Limitaciones y advertencias

- Tarea unica: la policy esta entrenada exclusivamente para Square (nut-on-peg) con un Franka. No hay evidencia de generalizacion a otras tareas, objetos o morfologias.
- Sin metrica de exito: al no existir simulador, no se publica tasa de exito. La perdida de accion de entrenamiento no es un proxy fiable de rendimiento en ejecucion real.
- Sin validacion ni test: las 100 demostraciones son datos de entrenamiento (`hdf5_filter_key` nulo, `experiment.validate` falso). No hay conjunto retenido, curva de validacion ni criterio objetivo de seleccion de checkpoint mas alla de la perdida de entrenamiento, lo que favorece el sobreajuste y dificulta elegir la mejor epoca.
- Rotacion no supervisada: `rotation_blocks: []` implica que la cabeza auxiliar emite ranuras de rotacion cuyo error se enmascara. El modelo aprende posicion, no orientacion, lo que limita tareas que requieran control rotacional preciso.
- Dependencia de FoundationPose: `obs/object` es tracking, no ground truth. Los frames con `obs/aux_valid = 0` se descartan de la perdida auxiliar y de la estandarizacion de objetivos, de modo que la calidad del brazo `aux_eef_frame/` queda ligada al estimador de pose externo y al porcentaje de frames validos.
- Estado de entrenamiento incompleto en el momento del volcado: los ultimos registros corresponden a las epocas 858 y 860 de 1000, y los checkpoints centenarios posteriores se anaden a medida que se escriben. Un checkpoint descargado hoy puede no corresponder al run final.
- Deriva de la validacion documentada por el propio autor: en el estudio a batch 64 la perdida de validacion empeora tras la epoca 30-100 mientras el replay offline seguia mejorando hasta la epoca 900. Es un indicio de que la seleccion de checkpoint por perdida de entrenamiento mezcla senales contradictorias.
- Riesgo de sobreajuste a las condiciones de recogida: 100 demostraciones reales con camara y montaje concretos. Cambios de iluminacion, posicion de camara o utillaje no estan cubiertos.
- Sesgos conocidos: no documentados. En robomimic, el sesgo tipico de este tipo de datos es la sobrerrepresentacion de condiciones de exito y la falta de ejemplos de recuperacion ante fallos.
- Licencia MIT: permite uso comercial y modificacion, con mantencion del aviso de copyright. La licencia cubre el artefacto publicado, no el dataset asociado ni las dependencias (robomimic, FoundationPose), cuyas condiciones hay que verificar por separado.
- Los resultados de busqueda web proporcionados no guardan ninguna relacion con el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeeHakHo/square_real100_bs128_ckpt
- Dataset de demostraciones: https://huggingface.co/datasets/LeeHakHo/square_real100
- Estudio a batch 64 con particion 90/10: https://huggingface.co/LeeHakHo/square_real100_ckpt
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos) en la informacion disponible.
