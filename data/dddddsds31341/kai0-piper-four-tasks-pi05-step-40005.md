# dddddsds31341/Kai0-Piper-Four-Tasks-pi05-step-40005

## Resumen

Kai0 Piper Four Tasks π0.5 — step 40005 es un checkpoint de inferencia de un modelo vision-language-action (VLA) obtenido mediante fine-tuning completo del modelo base `pi05_base` de Physical Intelligence sobre cuatro tareas roboticas simultaneas. Lo publica el usuario `dddddsds31341` en Hugging Face y esta pensado para controlar un brazo robotico Piper de Agilex en tareas de manipulacion domestica: apilar munecas rusas, doblar una toalla, ordenar munecas y depositar pelotas de tenis en una cesta.

Tecnicamente no es un modelo de lenguaje al uso, sino una politica de accion entrenada con JAX y el framework OpenPI, empaquetada en formato Orbax/OCDBT. El repositorio ocupa 12,5 GB e incluye parametros EMA de inferencia, estadisticas de normalizacion y el codigo de preprocesado especifico de Kai0. No se publican resultados de exito en robot ni evaluaciones en conjunto de validacion.

Su relevancia es acotada: sirve como referencia reproducible de un entrenamiento multitarea sobre hardware modesto (dos A100 de 80 GB) y como punto de partida para quien quiera reproducir o extender el pipeline de fine-tuning de π0.5 con el robot Piper. La licencia no esta declarada, lo que limita su uso comercial sin aclaracion previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 de Physical Intelligence, implementacion JAX/OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como contexto de texto; horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint en precision de entrenamiento, formato Orbax) |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | Orbax/OCDBT (`params/`, `assets/`, `_CHECKPOINT_METADATA`) |
| Dimension de accion | 14D objetivos absolutos de articulacion/pinza, rellenados a 32D internamente |
| Camaras de entrada | `top_head`, `hand_left`, `hand_right` |
| Paso de entrenamiento | 40.005 / 40.005 |
| Tamano del repositorio | 12,5 GB |

## Arquitectura y entrenamiento

El modelo es una politica VLA derivada de `pi05_base`, el modelo base de Physical Intelligence para control robotico. La implementacion concreta es la de Kai0 sobre OpenPI en JAX, con entrenamiento distribuido mediante FSDP en dos A100 de 80 GB (batch global de 64, 32 ejemplos por GPU, sin acumulacion de gradientes). Se trata de un fine-tuning completo, no de un adaptador LoRA.

El conjunto de entrenamiento consta de 400 demostraciones y 569.842 fotogramas, con 100 demostraciones por tarea (cuatro tareas). Todos los fotogramas se mezclan de forma conjunta, de modo que el muestreo es proporcional al numero de fotogramas de cada tarea. Se aplica una normalizacion por cuantiles compartida entre las cuatro tareas (`effective_use_quantile_norm=True`), cuyos parametros estan en `assets/piper_four_tasks/norm_stats.json`. El horizonte de accion es de 50 pasos con objetivos absolutos de articulacion y pinza (no es un checkpoint de acciones delta). La transformacion original de Kai0 para Agilex pone a cero las entradas de estado/accion fuera de `[-pi, pi]`; el codigo incluido define el preprocesado exacto. Se uso EMA con decaimiento 0,99 y semilla 42. El entrenamiento se completo el 2 de noviembre de 2026 a las 14:06 hora de Singapur.

## Capacidades

- Control robotico de manipulacion multitarea sobre un brazo Piper de Agilex con pinza de dos dedos.
- Ejecucion de cuatro tareas condicionadas por instruccion en lenguaje natural: `nesting_doll`, `fold_towel`, `sorting_dolls` y `putting_tennis`.
- Percepcion visual multimodal a partir de tres camaras (`top_head`, `hand_left`, `hand_right`).
- Generacion de secuencias de acciones de 50 pasos con objetivos absolutos de articulacion y pinza en 14 dimensiones.
- Condicionamiento por prompt de tarea: cada observacion debe acompanarse del prompt correspondiente.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM; es una politica de accion.
- No se documentan capacidades multilingues, de codigo, matematicas ni audio.

## Casos de uso

- Reproduccion de investigacion en VLA: el checkpoint y el codigo permiten replicar el pipeline de fine-tuning de π0.5 sobre el robot Piper con dos A100, util para estudiar el efecto del entrenamiento multitarea conjunto frente a politicas por tarea.
- Manipulacion de precision con munecas rusas: la tarea `nesting_doll` requiere insertar cada muneca dentro de la siguiente; el modelo puede usarse como referencia para estudiar politicas de ensamblaje con tolerancias ajustadas.
- Plegado de tejidos: la tarea `fold_towel` implica coordinar ambas pinzas sobre una toalla larga; sirve como base para experimentos de manipulacion deformable con dos brazos o una pinza por extremo.
- Clasificacion y ordenacion de objetos: `sorting_dolls` evalua la capacidad de ordenar cinco objetos por tamano de izquierda a derecha, util para estudiar razonamiento espacial ordinal en politicas VLA.
- Recogida y deposito en contenedor: `putting_tennis` es un caso de pick-and-place repetido con cuatro pelotas hacia una cesta, apropiado para medir robustez ante variacion de posicion de objetos.
- Punto de partida para fine-tuning adicional: al incluir `training_config.json`, `task_prompts.json` y `code.zip`, el checkpoint puede reutilizarse como inicializacion para nuevas tareas del mismo robot, aunque no permite reanudar el entrenamiento exacto al carecer de estado del optimizador.
- Docencia y divulgacion: el repositorio documenta versiones de entorno (`source_versions.json`, `requirements-sip.txt`) y configuracion completa, lo que facilita montar practicas reproducibles de VLA en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito en robot ni evaluacion en conjunto reservado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 12,5 GB en formato Orbax sin cuantizar, por lo que se necesita al menos esa cantidad de memoria mas overhead de activaciones y camaras.
- GPU de entrenamiento documentadas: dos A100 de 80 GB con FSDP.
- GPU recomendadas para inferencia: no documentadas; por tamano del checkpoint, una A100 80 GB o H100 son las opciones seguras. No se confirma que quepa en GPUs de consumo como RTX 4090 (24 GB) sin conversion de formato, que no se proporciona.
- Opciones de despliegue: OpenPI con JAX y el config `pi05_piper_four_tasks_sip`; no es compatible con `from_pretrained` de Transformers, ni se documentan exportaciones a GGUF, vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kai0 Piper Four Tasks π0.5 (este) | no disponible | Horizonte de accion 50 | 4 tareas Piper | no disponible | Hugging Face, Orbax/JAX |
| `pi05_base` (Physical Intelligence) | no disponible | no disponible | Modelo base generalista | no disponible en la informacion | Referenciado como base |
| Otros checkpoints de la misma coleccion Kai0 | no disponible | Horizonte de accion 50 | Mismo run, distintos pasos | no disponible | Mismo autor en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se declara licencia; el uso comercial queda sin autorizacion explicita hasta que el autor la aclare.
- No hay evaluacion de tasa de exito ni validacion en robot; el autor lo indica de forma explicita.
- El checkpoint contiene solo parametros EMA de inferencia, sin estado del optimizador: no permite reanudar el entrenamiento de forma exacta.
- Especifico del robot Piper de Agilex y de las convenciones de camara, estado, accion y pinza de Kai0; no es portable a otras plataformas sin reentrenamiento.
- Solo cubre cuatro tareas y prompts en ingles; fuera de ese dominio no hay garantia de comportamiento.
- Requiere preservar la estructura de directorios Orbax/OCDBT completa (todos los shards y metadatos); mover o renombrar ficheros rompe la carga.
- Las rutas de configuracion registradas conservan rutas SIP; la implementacion canonica esta en `code.zip`, por lo que hay que ajustar rutas al desplegar.
- Riesgo de sobreajuste a las condiciones de recogida de datos (posiciones, iluminacion, fondo); no se documenta variabilidad del dataset.
- No se documentan sesgos, pero al ser un modelo de accion fisica, los fallos se traducen en colisiones o manipulaciones erroneas, con riesgo material en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Kai0-Piper-Four-Tasks-pi05-step-40005
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/bofang/finetune_pi05/runs/pwj4suby
- Dataset `putting_tennis`: https://huggingface.co/datasets/yuyingyinya/putting_tennis
- Dataset `nesting_doll`: https://huggingface.co/datasets/yuyingyinya/nesting_doll
- Dataset `fold_towel`: https://huggingface.co/datasets/yuyingyinya/fold_towel
- Dataset `sorting_dolls`: https://huggingface.co/datasets/yuyingyinya/sorting_dolls
