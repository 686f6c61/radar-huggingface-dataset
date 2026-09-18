# prehj/GR00T-N1.5-libero-atq-v3d-so3-s1-60k

## Resumen

`prehj/GR00T-N1.5-libero-atq-v3d-so3-s1-60k` es un ajuste fino del modelo fundacional robótico `nvidia/GR00T-N1.5-3B` orientado a la manipulación de brazo robótico en el benchmark LIBERO. Lo desarrolla el usuario `prehj` y su aportación principal es una cabeza de acción con mezcla de expertos (MoE) de 4 expertos, entrenada con una técnica de cuantización de acciones (ATQ, *action quantization*) en la que un clasificador de confianza aprendido a partir de etiquetas generadas por un VLM decide qué experto (y por tanto qué grado de compresión temporal de acciones) se utiliza en cada momento.

El problema que resuelve es doble. Por un lado, reduce el coste de inferencia agrupando varias acciones finas en un único bloque comprimido, sin reentrenar la política desde cero. Por otro, lo hace de forma selectiva: el *gate* comprime mucho en tareas donde la compresión no degrada el éxito (por ejemplo `libero_object`) y apenas comprime en tareas sensibles (`libero_spatial`), siguiendo el orden en que el benchmark se rompe con la compresión. El resultado declarado es un 92,5 % de éxito agregado sobre 1.971 episodios con una velocidad efectiva media de 1,244x.

El modelo tiene 2.829.861.577 parámetros (~2,83 mil millones) según los pesos publicados en safetensors, ocupa 8,0 GB de repositorio y se distribuye únicamente con pesos y configuración de inferencia, sin estados de optimizador. Se entrenó durante 60.000 pasos con batch 64 (2 GPU, 32 por dispositivo) y semilla 42, y hereda la licencia del modelo base (`other`). No se documentan idiomas soportados, longitud de contexto ni resultados de benchmarks generales de lenguaje: toda la evaluación publicada es de bucle cerrado sobre LIBERO en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ajuste de `nvidia/GR00T-N1.5-3B` (modelo fundacional robotico con backbone vision-lenguaje) con cabeza de accion de mezcla de expertos (MoE) de 4 expertos de horizonte |
| Parametros totales | 2.829.861.577 (~2,83 mil millones), dato real de los safetensors |
| Parametros activos | no disponible (el checkpoint usa un gate y un router que seleccionan experto y horizonte, pero no se publica el reparto de parametros activos por token) |
| Longitud de contexto | no disponible (el horizonte maximo documentado es de 16 filas de accion por bloque, no de tokens de contexto) |
| Tipos de cuantizacion | no disponible para los pesos (se distribuyen en safetensors sin indicar precision). El termino "ATQ" del nombre se refiere a cuantizacion de acciones: `main` y `n8` a 1x, `m8` a 1,78x teoricos (1,667x efectivos por el replan 5), `m4` con ratio no indicado |
| Idiomas soportados | no disponible (la model card esta redactada en coreano y no documenta idiomas; la salida del modelo son acciones, no texto) |
| Licencia | `other` (personalizada; hereda las condiciones del modelo base `nvidia/GR00T-N1.5-3B`) |
| Formato de pesos | `safetensors` en 2 shards (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) + `model.safetensors.index.json` |
| Modelo base | `nvidia/GR00T-N1.5-3B` (finetune) |
| Tarea declarada (pipeline) | `robotics` |
| Expertos MoE (horizontes) | `moe_expert_horizons = [16, 9, 5, 8]` |
| Umbral de confianza | `conf_threshold (tau) = 0.55` |
| Dimensiones de accion discretas | `discrete_action_dims = [6]` (gripper con comando absoluto; se usa el ultimo valor del bloque) |
| Reduccion de fusion de acciones | `action_merge_reduction = sum` |
| Fusion de rotaciones | SO(3) (`rotation_merge_spec` en el `config.json`); error angular ~1e-14 frente a scipy |
| Entrenamiento | 60.000 pasos, batch 64 (2 GPU x 32 por dispositivo), semilla 42 |
| Tamano del repositorio | 8,0 GB |
| Descargas / likes | 0 / 0 |

Detalle de los expertos publicados:

| Experto | Horizonte (filas) | Span | Plan de bloques | Compresion |
|---|---:|---:|---|---|
| `main` | 16 | 16 | 1x16 | 1x |
| `m8` | 9 | 16 | 2,2,1,2,2,1,2,2,2 | 1,78x |
| `m4` | 5 | 8 | 2,2,1,2,1 | no indicada |
| `n8` | 8 | 8 | 1x8 | 1x |

## Arquitectura y entrenamiento

El checkpoint parte del backbone de `nvidia/GR00T-N1.5-3B` y le superpone una cabeza de accion con 4 expertos de horizonte. La innovacion central es el *label-gated MoE*: una misma politica contiene decodificadores finos (1x) y decodificadores comprimidos, y un valor de confianza aprendido a partir de etiquetas de un VLM (`prehj/libero-conf-labels-v3d`, 16.286 filas, 1.693 episodios, stride 16, sin columna de contacto) decide a que grupo de decodificadores se enruta cada chunk. Dentro del grupo, el router elige unicamente el horizonte. Es decir, la decision de "cuanto comprimir" no la toma el router por si solo: la toma el gate, y el router solo resuelve el horizonte dentro del grupo seleccionado.

La fusion de acciones comprimidas no es una suma ingenua. Para las rotaciones se aplica una especificacion SO(3): se revierte la normalizacion, se convierte el vector de rotacion a cuaternion, se compone en orden temporal y se vuelve a normalizar, con un error angular de aproximadamente 1e-14 frente a la referencia de scipy. Las acciones discretas (dimension 6, el gripper) se tratan como comandos absolutos y se toma el ultimo valor del bloque, no la suma; el autor advierte que si `discrete_action_dims` queda vacio, los bloques se suman y se emiten valores de -2/-3. El entrenamiento se hizo sobre el entorno LIBERO con replan cada 5 pasos finos: como una fila comprimida equivale a la suma de 2 o 3 acciones finas, el plan de bloques se trunca cuando su suma acumulada alcanza 5, de modo que la compresion efectiva es de 1,667x y no de 1,78x. La relacion declarada es: velocidad efectiva = 1 + ratio de compresion x (1,667 - 1). No se documenta RLHF, DPO ni numero total de tokens de entrenamiento.

## Capacidades

- Generacion de chunks de acciones para control de brazo robotico con horizonte variable (16, 9, 8 y 5 filas segun experto).
- Control de gripper mediante comando absoluto en la dimension discreta 6, tomando el ultimo valor del bloque comprimido.
- Compresion selectiva de acciones en tiempo de inferencia: agrupa 2 o 3 acciones finas en una sola fila segun el experto elegido (`m8`, `m4`) o mantiene resolucion completa (`main`, `n8`).
- Enrutado por confianza aprendida: un valor de confianza derivado de etiquetas VLM selecciona el grupo de decodificadores; el umbral `tau` es ajustable en tiempo de servicio (`--conf-threshold`) para recorrer la curva velocidad/exito.
- Fusion geometricamente consistente de rotaciones en SO(3), con recomposicion temporal y renormalizacion.
- Herencia del backbone vision-lenguaje del modelo base, lo que implica percepcion visual y representaciones multimodales; no se documentan, sin embargo, capacidades de dialogo ni de generacion de texto en esta ficha.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes ni de razonamiento multi-paso en lenguaje natural.
- Capacidades multilingues: no disponibles; la interfaz del modelo es de observacion visual a accion.
- Capacidad especial: modo de compresion controlado por gate, con servidor de politica por websocket.

## Casos de uso

- Manipulacion robotica en habitos de investigacion sobre LIBERO: el modelo esta entrenado y evaluado especificamente sobre las suites `libero_spatial`, `libero_object`, `libero_goal` y `libero_10`, por lo que se puede usar como politica de referencia en experimentos de imitacion dentro de simulacion MuJoCo con esas cuatro suites y 40 tareas.
- Comparacion de politicas con y sin cuantizacion de acciones: al mantener decodificadores de 1x y comprimidos en el mismo checkpoint, permite medir el coste en exito de comprimir acciones sin cambiar de modelo ni reentrenar, variando solo `tau`.
- Barrido de la curva velocidad/exito: el parametro `--conf-threshold` permite desplazar el gate y obtener puntos intermedios entre maxima precision y maxima velocidad efectiva (1,0x a ~1,5x en las suites evaluadas).
- Tareas de horizonte largo: en `libero_10` el modelo mantiene un 86,1 % de exito con 217,6 pasos medios por episodio, lo que lo hace apto para cadenas de manipulacion con multiples subtareas encadenadas.
- Manipulacion que requiere agarre preciso: la gestion explicita de la dimension discreta del gripper (valor absoluto del ultimo elemento del bloque) evita el error de suma acumulada y hace el modelo adecuado para tareas de pick-and-place con apertura y cierre controlados.
- Servicio de politica en red: `scripts/serve_policy_moe.py` expone el modelo como servidor de politica por websocket en un puerto configurable, lo que permite desacoplar el proceso de inferencia del entorno de simulacion y reutilizar el mismo servidor para varias evaluaciones.
- Investigacion sobre cuantizacion de acciones y enrutado por etiquetas VLM: el checkpoint sirve como artefacto reproducible de un metodo concreto (gate aprendido desde etiquetas de confianza, fusion SO(3), plan de bloques) para replicar o rebatir el enfoque.

## Benchmarks y rendimiento

Evaluacion en bucle cerrado sobre LIBERO: 40 tareas x 50 episodios, clip de acciones del brazo eliminado, `tau = 0.55`.

| Suite | Episodios | Exitos | Tasa de exito | Ratio de compresion | Velocidad efectiva | Pasos medios en exito |
|---|---:|---:|---:|---:|---:|---:|
| `libero_spatial` | 489 | 469 | 0,959 | 0,053 | 1,022 | 104,4 |
| `libero_object` | 493 | 460 | 0,933 | 0,817 | 1,485 | 101,5 |
| `libero_goal` | 493 | 467 | 0,947 | 0,470 | 1,232 | 92,4 |
| `libero_10` | 496 | 427 | 0,861 | 0,479 | 1,237 | 217,6 |
| **Total** | **1.971** | **1.823** | **0,925** | **0,491** | **1,244** | **127,2** |

Notas de medicion declaradas por el autor: el ratio de compresion esta ponderado por chunk y los pasos medios por episodio; los bloques comprimidos pueden superar el rango +-1, por lo que la evaluacion se hizo sin el clip de entrada del controlador OSC del brazo (los limites de MuJoCo, los railes del gripper, las ganancias PD y el clip de par se mantuvieron). No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones frente a otras politicas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de 2.829.861.577 parametros (estimacion, no dato publicado): ~5,7 GB en FP16/BF16, ~11,3 GB en FP32, ~2,8 GB en INT8 y ~1,4 GB en INT4, sin contar activaciones del backbone visual ni buffers de imagen.
- GPU recomendadas: no disponibles en la model card. El entrenamiento se hizo con 2 GPU (batch por dispositivo 32, batch total 64) sin especificar modelo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16 (por ejemplo RTX 3070/4060 Ti en adelante) y con holgura en RTX 3090, RTX 4090 o RTX 5090 (24 GB o mas), siempre que seAnule el clip de acciones del controlador si se replica la configuracion de evaluacion.
- Opciones de despliegue documentadas: servidor de politica propio por websocket (`scripts/serve_policy_moe.py`, con `--head moe`, `--data-config libero_conf`, `--embodiment-tag new_embodiment`) y scripts de evaluacion en el entorno LIBERO (`gr00t/eval/libero/eval_taskwise_gr00t_moe.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- El despliegue exige `--data-config libero_conf`: con el config `libero` de stock los slices de desnormalizacion quedan desalineados porque el portador de confianza vive en `action_keys`.
- Latencia y throughput: no disponibles en unidades absolutas. La metrica publicada es de velocidad efectiva relativa (1,244x de media) y pasos medios por episodio (127,2).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO (exito / velocidad) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `prehj/GR00T-N1.5-libero-atq-v3d-so3-s1-60k` | 2,83 mil millones | no disponible | 0,925 sobre 1.971 episodios / 1,244x | `other` | HuggingFace, 0 descargas |
| `nvidia/GR00T-N1.5-3B` (base) | ~3 mil millones (segun denominacion del modelo) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace (NVIDIA) |
| Otras politicas para LIBERO (por ejemplo, variantes de imitacion publicadas en la literatura) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otras politicas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa mas alla del modelo base. Los resultados de busqueda web recibidos no contienen informacion relevante sobre el modelo (versan sobre el estandar USB) y no se han utilizado.

## Limitaciones y advertencias

- Evaluacion exclusivamente en simulacion (LIBERO sobre MuJoCo). No hay validacion publicada en robot real ni en entornos fuera de LIBERO.
- La evaluacion se realizo eliminando el clip de acciones del controlador OSC del brazo porque los bloques comprimidos superan el rango +-1. En un controlador con clip activo el rendimiento puede degradarse de forma no cuantificada en esta ficha.
- El gate se entrena con etiquetas generadas por un VLM (`prehj/libero-conf-labels-v3d`) que no incluyen columna de contacto. Los sesgos o errores sistematicos de esas etiquetas se transfieren directamente a la politica de compresion.
- La aceleracion efectiva es modesta: 1,244x de media, con `libero_spatial` practicamente sin comprimir (ratio 0,053) porque, segun el autor, la suite colapsa a 2x con una perdida de -0,160. La ganancia de velocidad depende por completo del umbral `tau` y supone una contrapartida en tasa de exito.
- Requiere `experiment_cfg/metadata.json`: sin las estadisticas de normalizacion no se pueden revertir las acciones. El repositorio no incluye `optimizer.pt`, `rng_state_*` ni `scheduler.pt`, por lo que no permite reanudar el entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido habitual (no genera texto libre), pero si existe riesgo de accion mal especificada cuando el gate elige un experto comprimido en una fase de contacto delicada.
- Limitaciones de contexto e idioma: no se documenta longitud de contexto ni idiomas soportados. El modelo consume observaciones visuales y produce acciones; no se documentan capacidades de dialogo.
- Licencia `other`: antes de cualquier uso comercial es imprescindible revisar los terminos del modelo base `nvidia/GR00T-N1.5-3B` y del dataset de etiquetas, ya que la ficha no aclara las condiciones de redistribucion ni de uso comercial.
- Madurez: checkpoint creado el 18 de septiembre de 2026 con 0 descargas y 0 likes, sin validacion externa conocida. Los scripts de servicio y evaluacion viven en una rama concreta (`jimin-dev-label-gated`) de un repositorio de terceros.
- Configuracion fragil: `discrete_action_dims = [6]` debe mantenerse; si la lista queda vacia, las acciones discretas se suman y el modelo emite comandos de gripper invalidos (-2/-3).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prehj/GR00T-N1.5-libero-atq-v3d-so3-s1-60k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.5-3B
- Dataset de etiquetas de confianza: https://huggingface.co/datasets/prehj/libero-conf-labels-v3d
- Codigo (rama `jimin-dev-label-gated`): https://github.com/rakybond007/GR00T-action-quantization
- Paper, blog o demo oficial: no disponible.
- Otros enlaces relevantes encontrados en la busqueda web: no disponible (los resultados recibidos no guardan relacion con el modelo).
