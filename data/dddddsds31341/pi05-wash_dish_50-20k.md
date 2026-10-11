# dddddsds31341/pi05-wash_dish_50-20k

## Resumen

El modelo `dddddsds31341/pi05-wash_dish_50-20k` es un checkpoint de ajuste fino completo (full fine-tuning) del modelo base `pi05_base`, publicado en Hugging Face por el usuario `dddddsds31341`. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, etiquetado con las tags `robotics`, `vision-language-action`, `pi0.5` y `openpi`. El checkpoint se ha entrenado sobre el conjunto de datos `wash_dish_50`, una tarea concreta de manipulación bimanual: agarrar un plato con un efector, limpiarlo con una esponja con el otro y colocarlo en un escurridor.

La relevancia de esta publicación es acotada pero específica: se trata de un artefacto "listo para evaluación" (evaluation-ready) que incluye tanto los parámetros en formato Orbax como las estadísticas de normalización del dataset, lo que permite reproducir evaluaciones sin reentrenar. El entrenamiento se detuvo en el paso 20.000, con un tamaño de lote de 32 y un total declarado de 20.005 pasos, lo que lo convierte en la variante "larga" de una familia de checkpoints del mismo autor (existe una versión de 10.000 pasos).

La información pública es muy limitada: no se declara licencia, idiomas soportados, número de parámetros ni contexto. El repositorio ocupa 12,4 GB. El modelo base `pi0.5` es, según la fuente consultada, un modelo fundacional robótico generalista que co-entrena datos de demostraciones robóticas, datos web y subtareas semánticas para habilitar generalización en manipulación de horizonte largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `pi0.5`; detalles internos (backbone, cabeza de acciones, mecanismo de difusión o flow matching) no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en formato Orbax a precisión de entrenamiento |
| Idiomas soportados | no disponible; el prompt de ejemplo de la model card esta en ingles |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | Orbax (parametros + estadisticas de normalizacion del dataset `wash_dish_50`) |

Otros datos declarados por el autor: paso de entrenamiento 20.000, tamanio de lote 32, total de pasos 20.005, modelo base `pi05_base`, activo de dataset `wash_dish_50`. Tamanio del repositorio: 12,4 GB. Creado el 2026-10-11 y actualizado el 2026-10-11.

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna de este checkpoint mas alla de su adscripcion a la familia `pi0.5` y a la categoria de modelos vision-language-action. La model card unicamente indica que se trata de un ajuste fino completo (full fine-tuning) de `pi05_base` sobre el activo de datos `wash_dish_50`, con 20.000 pasos completados (20.005 totales declarados) y lote de 32. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Segun la fuente publica consultada (Qualcomm AI Hub), `pi0.5` es un modelo fundacional robotico generalista entrenado con vision, lenguaje y accion que co-entrena sobre fuentes de datos diversas (demostraciones roboticas, datos web y subtareas semanticas) para habilitar generalizacion en tareas de manipulacion de horizonte largo. Este checkpoint concreto es una especializacion de ese modelo base a una unica tarea de laboratorio, por lo que su valor esta en la evaluacion y reproduccion, no en la generalizacion abierta. No se documentan innovaciones tecnicas adicionales propias de esta publicacion.

## Capacidades

- Control de robot mediante instrucciones en lenguaje natural: el modelo acepta un prompt textual que describe la tarea y produce acciones motoras.
- Manipulacion bimanual: el prompt de ejemplo requiere el uso coordinado de dos pinzas ("one gripper" / "the other"), lo que implica control de dos efectores.
- Ejecucion de tareas de horizonte largo con subtareas encadenadas: agarrar, levantar, limpiar repetidamente, devolver la esponja y colocar el plato en el escurridor.
- Percepcion visual integrada: al ser un modelo de vision-lenguaje-accion, consume observaciones visuales del entorno ademas del texto.
- Especializacion en una tarea concreta: lavado y colocacion de vajilla (`wash_dish_50`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en el sentido de LLM: no disponible; el razonamiento multi-paso existe unicamente como secuencia de acciones motoras.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision si (VLA); audio no disponible; modo thinking no disponible.

## Casos de uso

- Reproduccion de evaluaciones de robotica: el checkpoint incluye las estadisticas de normalizacion del dataset y esta pensado explicitamente para evaluacion, de modo que un laboratorio puede cargarlo en la configuracion de evaluacion existente y obtener resultados comparables con los del autor.
- Investigacion en manipulacion bimanual: la tarea de lavar un plato exige coordinacion de dos efectores y una secuencia de subtareas; sirve como banco de pruebas para estudiar politicas bimanuales frente a politicas de un solo brazo.
- Estudio de escalado de entrenamiento: la existencia de una variante de 10.000 pasos y otra de 20.000 permite comparar el efecto del numero de pasos sobre la tasa de exito en la misma tarea y dataset.
- Punto de partida para ajuste adicional: al ser un fine-tuning completo sobre `pi05_base`, puede servir como inicializacion para transferir a tareas de limpieza o cocina relacionadas, aunque no hay documentacion que garantice que mejore respecto al modelo base.
- Despliegue en plataformas roboticas de investigacion: si el modelo base `pi0.5` esta soportado por frameworks de inferencia robotica (por ejemplo, el ecosistema `openpi` referenciado en las tags), este checkpoint podria integrarse en el mismo pipeline de ejecucion en hardware real.
- Generacion de demostraciones sinteticas: el modelo puede emplearse para producir trayectorias candidatas que luego se filtren y anotar, alimentando un ciclo de recoleccion de datos en entornos simulados de cocina.
- Validacion de pipelines de normalizacion: al incluir las estadisticas del dataset `wash_dish_50`, es util para verificar que un stack de inferencia aplica correctamente la normalizacion de acciones y observaciones antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, tablas comparativas ni metricas de evaluacion; solo el contexto de entrenamiento (paso 20.000, lote 32, total 20.005 pasos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia del orden de magnitud, el repositorio ocupa 12,4 GB, por lo que cargar el checkpoint completo en memoria requiere al menos ese orden de VRAM, mas el espacio para activaciones y observaciones visuales.
- GPU recomendadas: no disponibles. Por el tamanio del checkpoint, GPUs de centro de datos con 24 GB o mas (A100 40/80 GB, H100, L40S) son las candidatas razonables; no hay confirmacion por parte del autor.
- Compatibilidad con GPU de consumo: no confirmada. Una GPU de consumo con 24 GB (RTX 3090, RTX 4090) podria ser suficiente para cargar el checkpoint si el modelo cabe en ese presupuesto, pero no hay datos que lo confirmen y no se documenta ningun proceso de cuantizacion que reduzca el requisito.
- Opciones de despliegue: el formato Orbax es nativo del ecosistema JAX; se desconoce si existe conversion a GGUF, ONNX u otros formatos. vLLM, llama.cpp, Ollama y TGI estan orientados a modelos de lenguaje y no se ha documentado soporte para este checkpoint. El ecosistema de referencia indicado en las tags es `openpi`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dddddsds31341/pi05-wash_dish_50-20k` | no disponible | no disponible | no disponible (sin benchmarks) | no disponible | Publico en Hugging Face, 0 descargas, 0 likes |
| `dddddsds31341/pi05-wash_dish_50-10k` | no disponible | no disponible | no disponible | no disponible | Publico en Hugging Face; mismo autor, mismo dataset, la mitad de pasos |
| `pi05_base` | no disponible | no disponible | no disponible | no disponible | Modelo base referenciado en la model card; ficha no localizada en la informacion proporcionada |
| `pi0.5` (modelo original) | no disponible | no disponible | Descripcion cualitativa de "state-of-the-art" en el modelo fundacional, sin cifras | no disponible | Referenciado en Qualcomm AI Hub |

Los tres checkpoints comparten base y dataset, por lo que la comparacion relevante es el numero de pasos de entrenamiento (10.000 frente a 20.000), sin datos publicos de rendimiento que permitan decidir cual es mejor. No se han localizado otros modelos comparables con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. Cualquier uso en produccion debe aclararse previamente con el autor.
- Ausencia total de benchmarks: no hay tasas de exito ni evaluaciones publicadas, por lo que no se puede afirmar que el checkpoint funcione correctamente en la tarea objetivo.
- Modelo de tarea unica: entrenado exclusivamente sobre `wash_dish_50`; es previsible un rendimiento pobre fuera de esa tarea, ese entorno y esa distribucion de objetos.
- Riesgo de sobreajuste: 20.000 pasos con lote 32 sobre un unico activo de datos es un regimen propenso a memorizar el entorno de recogida de datos y a fallar ante cambios de iluminacion, posicion de la vajilla o tipo de fregadero.
- Sin informacion sobre sesgos: no se documenta la composicion del dataset ni posibles sesgos, algo especialmente relevante en robotica porque los sesgos se manifiestan como fallos fisicos de manipulacion.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: los modelos VLA pueden generar trayectorias que parecen razonables pero no cumplen la tarea o resultan inseguras con objetos fragiles.
- Idioma: la unica instruccion documentada esta en ingles; no hay evidencia de que el modelo responda a prompts en castellano ni en otros idiomas.
- Limitaciones de contexto: no se especifica la ventana de contexto ni la longitud del historial de observaciones admitido.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan validaciones independientes por terceros.
- Fecha de creacion inusual (2026-10-11): conviene verificar la integridad y procedencia del repositorio antes de integrarlo en un pipeline.
- Falta de instrucciones de despliegue: la model card no documenta dependencias, versiones ni el procedimiento de carga del checkpoint Orbax.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/pi05-wash_dish_50-20k
- Checkpoint hermano de 10.000 pasos: https://huggingface.co/dddddsds31341/pi05-wash_dish_50-10k
- Pagina de pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Plataforma Hugging Face: https://huggingface.co/
- No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos adicionales especificos de este checkpoint en la busqueda web realizada.
