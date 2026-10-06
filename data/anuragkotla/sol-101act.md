# AnuragKotla/sol-101act

## Resumen

El modelo `AnuragKotla/sol-101act` es una política de robótica entrenada mediante clonación de comportamiento (behavior cloning) con el método ACT (Action Chunking with Transformers) y el framework LeRobot de Hugging Face. Lo publica el usuario AnuragKotla en Hugging Face y resuelve una tarea concreta de manipulación con el brazo robótico de bajo coste SO-ARM101: coger un cubo rojo y depositarlo en un cuenco gris.

A diferencia de un modelo de lenguaje, no procesa texto ni genera lenguaje natural: recibe observaciones (previsiblemente imágenes de cámara y estado del robot) y produce secuencias de acciones motoras. El repositorio contiene 51.668.662 parámetros (unos 51,7 millones) en formato safetensors, con un tamano total de 0,2 GB, lo que lo sitúa en la categoria de políticas ligeras ejecutables en hardware modesto.

Su relevancia es acotada y practica: sirve como ejemplo reproducible de entrenamiento de una política de imitación con LeRobot sobre el dataset `xinjiehu76/so101-pick-place-dataset`, y como punto de partida para quien quiera replicar o adaptar un pipeline de pick-and-place con SO-ARM101. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y no se publican resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de clonación de comportamiento para robótica |
| Parametros totales | 51.668.662 (aprox. 51,7 M), segun metadatos de safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); el horizonte de predicción de acciones depende de `config.json`, no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan versiones GGUF, INT8 ni otras) |
| Idiomas soportados | no aplica (política robótica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), junto con `config.json` y `train_config.json` |

## Arquitectura y entrenamiento

La política sigue el método ACT, presentado en el trabajo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (Zhao et al., 2023). ACT es una técnica de clonación de comportamiento que predice trozos (chunks) de acciones en lugar de una única acción por paso, lo que reduce el error de acumulacion y mejora la estabilidad en tareas de manipulación fina. La implementacion concreta de este repositorio se apoya en el framework LeRobot, que aporta las utilidades de entrenamiento, carga de datasets y control del robot.

El entrenamiento se realizo sobre el dataset `xinjiehu76/so101-pick-place-dataset`, que contiene los subconjuntos `view_above` y `view_side`. No se especifica en la informacion disponible el numero de episodios, el numero de demostraciones, la composicion exacta de las observaciones (numero de camaras, resolucion, frecuencia de control) ni si se aplicaron etapas de ajuste adicionales. Tampoco se documenta el numero total de pasos de entrenamiento ni los hiperparametros, aunque el repositorio incluye un fichero `train_config.json` que presumiblemente los recoge. La tarea objetivo declarada es coger un cubo rojo y colocarlo en un cuenco gris.

## Capacidades

- Generacion de acciones motoras para manipulación robotica: la política produce comandos de control para el brazo SO-ARM101 en la tarea de pick-and-place.
- Clonacion de comportamiento a partir de demostraciones: aprende la tarea por imitacion de trayectorias registradas, no por refuerzo ni por reglas programadas.
- Prediccion por chunks de acciones, caracteristica del metodo ACT, orientada a reducir la acumulacion de error a lo largo de la ejecucion.
- Uso de observaciones visuales: el dataset de entrenamiento incluye los subconjuntos `view_above` y `view_side`, por lo que la política se entrena con al menos dos puntos de vista de camara (la configuracion exacta de entradas no esta documentada en la informacion disponible).
- Integracion con el ecosistema LeRobot: carga de pesos, scripts de control de robot y reutilizacion del pipeline de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues ni de generacion de texto.

## Casos de uso

- Automatizacion de pick-and-place en celda robotizada: la política ejecuta la secuencia completa de coger un cubo y depositarlo en un cuenco, adecuada para tareas de alimentacion de piezas o clasificacion simple en lineas de montaje de baja complejidad.
- Docencia y formacion en robotica: al estar construida sobre el brazo SO-ARM101, de bajo coste, y con todo el pipeline en LeRobot, sirve como practica completa de recogida de datos, entrenamiento e inferencia en asignaturas de robotica o aprendizaje automatico.
- Prototipado rapido de nuevas tareas: el mismo esquema se puede reutilizar cambiando el dataset de demostraciones para enseñar al brazo otra secuencia de manipulacion, sin redefinir la arquitectura.
- Investigacion en clonacion de comportamiento: sirve como linea base ligera (51,7 M de parametros) para comparar variantes de ACT, esquemas de aumento de datos o cambios en el numero de vistas de camara.
- Recoleccion y curacion de datasets de robotica: el dataset asociado y el modelo permiten estudiar como afecta la composicion de las demostraciones (vistas, numero de episodios) al exito de la política.
- Demostraciones en ferias y laboratorios: el reducido tamano del modelo (0,2 GB de repositorio) facilita desplegarlo en un equipo local conectado al brazo sin depender de infraestructura en la nube.
- Base para aprendizaje por transferencia: ajuste fino del modelo preentrenado sobre nuevas posiciones de objeto, colores o recipientes, siempre que se disponga de demostraciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta tasa de exito de la tarea, numero de episodios de evaluacion, ni comparaciones con otras políticas. Tampoco se dispone de medidas de latencia, frecuencia de control alcanzada o robustez ante cambios de posicion del objeto.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros publicado: aproximadamente 197 MiB en fp32, 98 MiB en fp16 y 49 MiB en INT8. Son valores derivados del recuento de parametros, no mediciones publicadas por el autor.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con al menos 1 GB de VRAM es suficiente para los pesos; para control en tiempo real con entrada de camara se recomienda una GPU dedicada moderna (gama RTX 30/40 o equivalentes) o un modulo embebido tipo Jetson, aunque el autor no especifica requisitos.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano del modelo. Tambien es viable la ejecucion en CPU para pruebas de inferencia, si bien el control en tiempo real depende del bucle de control de LeRobot.
- Opciones de despliegue: LeRobot mediante el script de control de robot (ejemplo incluido en la model card con `python -m lerobot.scripts.control_robot --robot.type=so101_follower`), y carga directa de `model.safetensors` con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables (parametros, contexto, rendimiento o licencia), por lo que la comparacion cuantitativa no es posible. A continuacion se indica lo poco que puede afirmarse sin inventar datos:

| Modelo | Parametros | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| AnuragKotla/sol-101act | 51,7 M | Pick-and-place con SO-ARM101 (ACT) | apache-2.0 | no disponible |
| ACT (implementacion de referencia, Zhao et al.) | no disponible | Manipulacion bimanual de bajo coste | no disponible | no disponible en la informacion proporcionada |
| Diffusion Policy (politicas por difusion) | no disponible | Manipulacion robotica por imitacion | no disponible | no disponible en la informacion proporcionada |

Se citan las dos alternativas anteriores por ser las familias de referencia en clonacion de comportamiento para manipulacion, pero no se dispone de sus especificaciones en la informacion facilitada, por lo que no se comparan cifras.

## Limitaciones y advertencias

- Alcance muy restringido: la política esta entrenada para una unica tarea (coger un cubo rojo y dejarlo en un cuenco gris). Fuera de esa distribucion de objetos, posiciones e iluminacion, el comportamiento es impredecible.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de que los pesos funcionen correctamente.
- Incoherencia en la model card: el ejemplo de inferencia apunta a `--policy.path=xinjiehu76/so101-act-pick-place_ACT`, una ruta distinta de este repositorio (`AnuragKotla/sol-101act`). Hay que verificar cual es el identificador correcto antes de usarlo en produccion.
- Ausencia de benchmarks: no se publica tasa de exito, numero de ensayos ni condiciones de evaluacion, de modo que no se puede afirmar ningun nivel de rendimiento.
- Falta de documentacion tecnica: no se detallan el numero de episodios del dataset, la frecuencia de control, el numero y la resolucion de las camaras, ni los hiperparametros de entrenamiento.
- Riesgo de sobreajuste a las demostraciones: al ser clonacion de comportamiento sobre un dataset especifico, es probable que la política dependa de la posicion inicial del cubo y de la configuracion de las camaras usadas en la recogida de datos.
- Riesgo de fallo fisico: cualquier despliegue sobre hardware real debe incorporar limites de par, paradas de emergencia y supervision, dado que una política de imitacion puede generar acciones fuera de rango ante entradas no vistas.
- Sesgos: no aplica en el sentido de sesgos linguisticos o sociales, pero si existe un sesgo de dominio hacia el entorno de recogida de datos (mesa, iluminacion, colores y disposicion concretos).
- Licencia: apache-2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de licencia. No hay garantias ni soporte por parte del autor.
- Idiomas: no aplica; el modelo no procesa ni genera texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnuragKotla/sol-101act
- Dataset de entrenamiento: https://huggingface.co/datasets/xinjiehu76/so101-pick-place-dataset
- Framework LeRobot: https://github.com/huggingface/lerobot
- Paper de ACT, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware": https://arxiv.org/abs/2304.13705
- Busquedas web realizadas: no devolvieron ningun enlace relevante a este modelo. Los resultados obtenidos correspondian a articulos sobre redaccion de correos electronicos en ingles, sin relacion con robotica ni con aprendizaje por imitacion.
