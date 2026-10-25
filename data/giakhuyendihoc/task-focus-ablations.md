# giakhuyendihoc/task-focus-ablations

## Resumen

`giakhuyendihoc/task-focus-ablations` es una coleccion de checkpoints de ablation de **pi0.5**, un modelo vision-language-action (VLA) de la familia pi0, implementado en PyTorch sobre el stack **openpi** y afinado sobre el benchmark de manipulacion **LIBERO**. El autor es el usuario de HuggingFace `giakhuyendihoc` y el repositorio se publica bajo licencia Apache 2.0. No es un modelo de proposito general, sino un conjunto de cinco variantes experimentales disenadas para medir el efecto de una tecnica concreta de supervision auxiliar denominada **TaskFocus**.

La innovacion que se evalua son los *focus tokens*: tokens de prefijo aprendidos y supervisados para predecir donde estan la pinza, el objeto manipulado y el objetivo (en el instante actual y 10 fotogramas hacia delante), ademas de relaciones pinza-objeto, contacto y fase de la tarea. El gradiente de esa perdida auxiliar hacia el backbone se escala por 0.1. Cada carpeta del repositorio corresponde a una configuracion (`pi05_libero_tf_*`) del fork de openpi del autor y contiene `model.safetensors`, `metadata.pt` y `assets/` con las estadisticas de normalizacion.

El repositorio ocupa 120,1 GB y esta pensado para investigacion en robotica: el entrenamiento usa solo **8 demostraciones por tarea** sobre las 40 tareas de LIBERO, 30k pasos, batch 16 y un LR coseno de 5e-5 a 5e-6. Los checkpoints se ofrecen "as is" y las cifras publicadas corresponden a evaluacion en simulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5 (familia pi0, implementacion openpi en PyTorch); backbone no detallado en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `safetensors`) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en lenguaje natural, pero no se publica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` + `metadata.pt` + `assets/` (estadisticas de normalizacion) |

Otros datos del repositorio: 5 checkpoints (uno por variante de ablation), 120,1 GB de tamano total, pipeline declarado `robotics`, etiquetas `robotics`, `vision-language-action`, `pi0.5`, `libero`, `region:us`. Creado el 2026-10-06, actualizado el 2026-10-25, con 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de pi0.5, un VLA que combina un backbone vision-language con un modulo de generacion de acciones (la familia pi0 usa flow matching para producir trayectorias de accion continuas; el detalle exacto de capas y del backbone no se especifica en la model card). Sobre esa base, el autor anade los *focus tokens*: un prefijo aprendido que se supervisa para predecir la posicion de la pinza, del objeto manipulado y del objetivo, tanto en el frame actual como 10 frames hacia delante, junto con relaciones pinza-objeto, senal de contacto y fase de la tarea. La perdida de estos tokens se propaga al backbone con un factor de escala de 0.1, de modo que actua como regularizador auxiliar sin dominar el objetivo principal de imitacion.

El entrenamiento se hace sobre LIBERO: 40 tareas en total, **8 demostraciones por tarea**, 30.000 pasos, batch de 16 y scheduling coseno con LR de 5e-5 a 5e-6. Las cinco variantes ablacionan la supervision: solo objeto y objetivo (`focus_obj_low`), anadiendo pinza (`focus_objgrip_low`), supervision completa sin etiquetas de objeto en la camara de muneca (`focus_gs01_nowrist_low`), supervision completa mas una cabeza de region de contacto (`focus_gs01_contact_low`) y supervision completa sobre etiquetas de profesor generadas con SAM2 y eventos de pinza, incluyendo mascaras de muneca (`focus_gs01_l1w_low`). La comparacion de referencia incluye un fine-tune plano de pi0.5 sobre los mismos datos y el TaskFocus completo, promediados sobre 2 semillas.

## Capacidades

- **Manipulacion robotica guiada por instrucciones**: genera acciones motoras a partir de observaciones visuales (incluida camara de muneca) y una instruccion en lenguaje natural, en el entorno de simulacion LIBERO.
- **Prediccion de puntos de interes**: los focus tokens producen estimaciones de posicion de pinza, objeto y objetivo, en el instante actual y con 10 frames de antelacion.
- **Razonamiento relacional pinza-objeto**: modela relaciones entre la pinza y el objeto, senal de contacto y fase de la tarea como salidas auxiliares.
- **Ejecucion de tareas de horizonte largo en simulacion**: evaluado en LIBERO-10 (50 trials) y en el layout de LIBERO-Plus con 150 tareas.
- **Robustez parcial a instrucciones intercambiadas**: se reporta una metrica especifica de exito con instrucciones permutadas (31,8-54,4 segun variante), lo que indica cierta sensibilidad al emparejamiento instruccion-escena.
- **Tool calling / function calling**: no disponible; no es una capacidad declarada para este modelo.
- **Agentes multi-paso en texto**: no disponible; el modelo esta especializado en control motor, no en tareas de texto generales.
- **Capacidades multilingues**: no disponible; no se publica cobertura de idiomas.
- **Vision / audio / thinking mode**: vision si (entrada visual multi-camara); audio y modo de razonamiento explicito no disponibles.

## Casos de uso

- **Evaluacion comparativa de supervision auxiliar en VLAs**: usar las cinco variantes como suite controlada para medir cuanto aporta cada tipo de etiqueta (objeto, pinza, contacto, mascaras de muneca) al exito en LIBERO-10 y LIBERO-Plus, manteniendo constantes datos, pasos y semillas.
- **Investigacion en atencion espacial para politicas de imitacion**: los focus tokens permiten analizar si el modelo aprende a mirar la pinza y el objeto antes de actuar; sirve para estudiar interpretabilidad y para disenar perdidas auxiliares alternativas.
- **Baseline reproducible con pocos datos**: con 8 demostraciones por tarea y 30k pasos, el repositorio documenta un regimen de bajo dato replicable para comparar nuevas tecnicas de aumento o de representacion.
- **Prueba de robustez ante instrucciones erroneas**: la metrica de instrucciones intercambiadas permite cuantificar si una mejora en exito base degrada la fidelidad a la instruccion (por ejemplo, 54,4 frente a 31,8 del fine-tune plano).
- **Seleccion de checkpoint para pipelines de evaluacion en simulacion**: integrar la variante `focus_gs01_l1w_low` (88,0 en LIBERO-10, 79,3 en LIBERO-Plus layout) como referencia fuerte en un banco de pruebas MuJoCo/LIBERO antes de plantear transferencia a hardware.
- **Estudio de destilacion de etiquetas de profesor**: la variante basada en SAM2 y eventos de pinza permite evaluar si etiquetas generadas automaticamente sustituyen a anotaciones manuales de objeto, reduciendo coste de anotacion.
- **Ablation de modalidades de entrada**: comparar `focus_gs01_nowrist_low` (sin etiquetas de objeto en camara de muneca) frente a `focus_gs01_l1w_low` informa sobre el valor real de la camara de muneca en el setup.

## Benchmarks y rendimiento

Resultados publicados en la model card (exito en porcentaje):

| Variante (carpeta) | Descripcion | Semilla | LIBERO-10 (50 trials) | LIBERO-Plus layout (150 tareas) | Instrucciones intercambiadas |
|---|---|---|---|---|---|
| `pi05_libero_tf_focus_obj_low` | supervision de posicion solo objeto + objetivo | 43 | 86,4 | 77,3 | 48,0 |
| `pi05_libero_tf_focus_objgrip_low` | lo anterior + pinza | 43 | 85,6 | 75,3 | 38,8 |
| `pi05_libero_tf_focus_gs01_nowrist_low` | supervision completa sin etiquetas de objeto en muneca | 42 | 83,4 | 73,3 | no disponible |
| `pi05_libero_tf_focus_gs01_contact_low` | supervision completa + cabeza de region de contacto | 42 | 86,2 | 76,0 | 54,4 |
| `pi05_libero_tf_focus_gs01_l1w_low` | supervision completa con etiquetas de profesor (SAM2 + eventos de pinza) y mascaras de muneca | 42 | 88,0 | 79,3 | 46,8 |
| Referencia: fine-tune plano de pi0.5 (no incluido en el repo) | mismos datos, sin TaskFocus | 2 semillas (media) | 82,4 | 72,7 | 31,8 |
| Referencia: TaskFocus completo (no incluido en el repo) | supervision completa | 2 semillas (media) | 87,0 | 79,3 | 46,8 |

Observaciones: la ganancia del TaskFocus completo frente al fine-tune plano es de +4,6 puntos en LIBERO-10, +6,6 en LIBERO-Plus layout y +15,0 en instrucciones intercambiadas. La variante `focus_gs01_l1w_low` iguala o supera ligeramente la media del TaskFocus completo, pero corresponde a una sola semilla, por lo que la comparacion con la media de 2 semillas no es estrictamente equivalente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de texto o codigo, que no aplican a este modelo.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio ocupa 120,1 GB para 5 checkpoints, lo que situa cada checkpoint en torno a 24 GB en el formato distribuido; el numero de parametros y la precision de almacenamiento no se publican, por lo que la cifra es solo una estimacion derivada.
- **GPU recomendadas**: no disponible en la informacion proporcionada. Por el tamano del repo y el caracter de investigacion, se espera un entorno con GPU de datacenter (A100/H100) para entrenamiento y evaluacion; no hay datos oficiales de VRAM minima.
- **Consumer GPU**: no confirmado. No se documenta ninguna variante cuantizada ni formato GGUF, por lo que no se puede afirmar que quepa en una RTX 4090 u otras GPU de consumo.
- **Opciones de despliegue**: el pipeline es `robotics` y requiere el runtime de **openpi** (PyTorch) con las configs `pi05_libero_tf_*` del fork TaskFocus del autor, junto con `assets/` para la normalizacion. No hay soporte declarado para vLLM, TGI, llama.cpp u Ollama, y estos runtimes de servido de texto no son aplicables a un VLA con salida de acciones.
- **Latencia y throughput**: no disponible. No se publican tiempos de inferencia ni frecuencia de control alcanzada.
- **Entorno de evaluacion**: las metricas proceden de simulacion LIBERO / LIBERO-Plus; no se reportan despliegues en robot real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | LIBERO-10 | LIBERO-Plus layout | Instrucciones intercambiadas | Licencia |
|---|---|---|---|---|---|---|---|
| `focus_gs01_l1w_low` (este repo) | VLA pi0.5 + TaskFocus, 1 semilla | no disponible | no disponible | 88,0 | 79,3 | 46,8 | Apache 2.0 |
| `focus_gs01_contact_low` (este repo) | VLA pi0.5 + TaskFocus + contacto | no disponible | no disponible | 86,2 | 76,0 | 54,4 | Apache 2.0 |
| TaskFocus completo (referencia del autor) | VLA pi0.5 + TaskFocus, media de 2 semillas | no disponible | no disponible | 87,0 | 79,3 | 46,8 | no disponible |
| Fine-tune plano de pi0.5 (referencia del autor) | VLA pi0.5 sin supervision auxiliar | no disponible | no disponible | 82,4 | 72,7 | 31,8 | no disponible |
| pi0.5 / openpi base | VLA generalista de la familia pi0 | no disponible en esta informacion | no disponible | no disponible | no disponible | no disponible | no disponible en esta informacion |

No se dispone de datos de otros VLAs comparables (por ejemplo, RT-2, OpenVLA u Octo) en la informacion proporcionada, por lo que no se incluyen cifras cruzadas.

## Limitaciones y advertencias

- **Checkpoints de investigacion**: la model card indica explicitamente que se ofrecen "as is", sin garantias de robustez ni soporte; no son artefactos listos para produccion.
- **Ambito reducido**: entrenados sobre las 40 tareas de LIBERO con solo 8 demostraciones por tarea; la generalizacion fuera de esa distribucion (nuevos objetos, escenas o robots) no esta validada.
- **Solo simulacion**: todas las metricas son de LIBERO y LIBERO-Plus; no se reportan resultados en robot real ni analisis de sim2real.
- **Sensibilidad a la instruccion**: el exito con instrucciones intercambiadas cae a 31,8-54,4, lo que indica que el modelo aprovecha el emparejamiento instruccion-escena y puede ejecutar la tarea equivocada si la instruccion no concuerda.
- **Comparaciones no estrictamente equivalentes**: las variantes usan semillas distintas (42 y 43) y las referencias son medias de 2 semillas; las diferencias de 1-2 puntos deben interpretarse con cautela.
- **Riesgo de alucinacion**: no evaluado en la informacion disponible; en un VLA el equivalente seria ejecutar acciones no sustentadas por la observacion, pero no hay analisis publicado.
- **Sesgos**: no documentados. Al entrenar solo con LIBERO, hereda los sesgos de ese dataset (objetos, texturas, morfologia de pinza y disposicion de escenas concretas).
- **Idioma**: no se publica cobertura linguistica; no se puede asumir soporte multilingue en las instrucciones.
- **Cuantizacion y despliegue**: no hay variantes cuantizadas ni formatos ligeros publicados, lo que limita el despliegue en hardware modesto.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base pi0.5 y el stack openpi pueden tener condiciones propias que deben verificarse antes de un uso productivo.
- **Repositorio sin traccion**: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las cifras.

## Enlaces

- HuggingFace: https://huggingface.co/giakhuyendihoc/task-focus-ablations
- Repositorio openpi (stack base en PyTorch sobre el que se implementa pi0.5): no se proporciona URL en la informacion disponible; la model card menciona un fork de openpi con las configs `pi05_libero_tf_*`, sin enlace.
- Paper de pi0.5: no disponible en la informacion proporcionada.
- Benchmark LIBERO / LIBERO-Plus: no se proporcionan enlaces en la informacion disponible.
- Demo o espacio interactivo: no disponible.
