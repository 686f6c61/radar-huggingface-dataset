# IkerAzurmendiRubinnova/act-updown-bad-8000

## Resumen

act-updown-bad-8000 es una política de robótica (robot learning policy) entrenada con la arquitectura ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot, publicada por el usuario IkerAzurmendiRubinnova en Hugging Face. El modelo está especializado en una única tarea de manipulación con el brazo robótico SO-101: coger un soporte situado frente a la cámara, transportarlo hasta una caja ("bad box"), soltarlo y volver a la pose inicial. No es un modelo de lenguaje ni un modelo de propósito general: es un checkpoint de entrenamiento concreto, capturado a los 8.000 pasos de una ejecución de 10.000 pasos, que el autor identifica como el mejor checkpoint de su run según la evaluación offline sobre episodios reservados.

El modelo resuelve el problema clásico de imitación conductual: a partir de observaciones visuales (cámara frontal y cámara de muñeca) y de las posiciones de las seis articulaciones del brazo, genera un bloque (chunk) de 90 objetivos articulares futuros a 30 fps, lo que permite una ejecución suave y con replanificación cada 30 pasos de acción. Su relevancia es principalmente como ejemplo práctico y reproducible de un flujo completo de entrenamiento de políticas con LeRobot: grabación de demostraciones por teleoperación, filtrado de calidad, entrenamiento y evaluación offline comparada contra una línea base.

Con 51.658.374 parámetros (unos 52 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors, se trata de un modelo muy ligero, ejecutable en hardware modesto, pensado para inferencia en el contexto de la biblioteca lerobot. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación conductual |
| Parametros totales | 51.658.374 |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a un modelo denso) |
| Longitud de contexto | no disponible (entrada: 2 flujos de imagen + 6 posiciones articulares) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin componente lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Datos adicionales: pipeline etiquetado como `robotics`; checkpoint a los 8.000 pasos de un entrenamiento de 10.000 pasos; tamaño del repositorio 0,2 GB; 16 descargas y 1 like en el momento de la ficha.

## Arquitectura y entrenamiento

La política sigue el esquema ACT (Action Chunking with Transformers), una arquitectura de imitación conductual basada en un transformer encoder-decoder que, dada la observación actual, predice de golpe una secuencia completa de objetivos articulares futuros (chunk de 90 acciones a 30 fps) en lugar de una acción por paso. En la práctica esto reduce la deriva acumulativa por errores compuestos y estabiliza la ejecución. Las entradas del modelo son la imagen de la cámara frontal, la imagen de la cámara de muñeca (wrist camera) y las posiciones de las seis articulaciones del brazo SO-101; la salida es el chunk de 90 objetivos articulares, con replanificación cada 30 pasos de acción.

El entrenamiento se realizó con la función `train()` de LeRobot con los siguientes hiperparámetros: batch size 8, chunk de 90, 30 pasos de acción por replanificación, learning rate de 1e-5, augmentación de imagen por defecto y semilla 1000. Los datos de entrenamiento provienen de las grabaciones `MikelRubi/up-down-bad_*` del 24 de octubre, registradas con un grabador en vivo a 30 fps y resolución 640x480, con filtros de calidad laxos: episodios de 3 a 20 segundos, desviación inicial entre brazo líder y seguidor de como máximo 30 grados, como máximo 5 segundos de inactividad en los extremos, error medio acción-estado de como máximo 8 grados y apertura del gripper al menos una vez. Se usaron 121 episodios de entrenamiento, reservando la última sesión (`up-down-bad_20261024_223809`, 23 episodios) como conjunto de validación. Las sesiones del 23 de octubre con una cadena de tarea distinta ("Move the robot up and down") fueron excluidas deliberadamente por tener una pose final diferente.

## Capacidades

- Prediccion de chunks de accion: genera 90 objetivos articulares futuros a 30 fps a partir de la observacion actual, con replanificacion cada 30 pasos.
- Control de un brazo SO-101: salida directa de las posiciones de las seis articulaciones del brazo y del gripper.
- Percepcion visual: procesa simultaneamente la imagen de la camara frontal y la de la camara de muneca (640x480 en las grabaciones de origen).
- Tarea especifica aprendida: coger el soporte frente a la camara, transportarlo a la caja designada, soltarlo y volver a la pose home.
- Compatibilidad con el ecosistema LeRobot: cargable y ejecutable con la libreria lerobot en formato safetensors.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento: es una politica de control pura para una unica tarea.

## Casos de uso

- Ejecucion de la tarea de transporte en el SO-101: el caso de uso principal es desplegar la politica directamente en un brazo SO-101 equipado con camara frontal y camara de muneca para automatizar el ciclo coger-transportar-soltar-volver de forma autonoma.
- Comparacion de checkpoints en flujos LeRobot: al ser el mejor checkpoint de su run segun la metrica offline, sirve de referencia para comparar el efecto del numero de pasos de entrenamiento (2.000 a 10.000) en la calidad de la politica.
- Punto de partida para fine-tuning: los pesos pueden reentrenarse o ajustarse sobre nuevas grabaciones de la misma tarea para mejorar la tasa de exito, aprovechando el pipeline de LeRobot.
- Docencia y formacion en robot learning: el modelo y su model card documentan un flujo completo (grabacion con teleoperador, filtros de calidad, entrenamiento, evaluacion offline contra baseline), util como material didactico en talleres de imitacion conductual.
- Evaluacion de metricas offline: permite estudiar la relacion entre el error articular absoluto medio offline y el exito real de la tarea en el robot, un tema metodologico relevante en imitacion conductual.
- Reproduccion de experimentos con semilla fija: con seed 1000 e hiperparametros publicados, facilita reproducir el entrenamiento completo desde las grabaciones originales.

## Benchmarks y rendimiento

El autor publica una evaluacion offline sobre los 23 episodios de la sesion reservada (`up-down-bad_20261024_223809`), midiendo el error articular absoluto medio sobre el chunk predicho, comparado contra una linea base "mantener las posiciones articulares actuales" (stay-still). Valores menores son mejores:

| Checkpoint | Error (MAE articular) | Baseline stay-still | Porcentaje por debajo del baseline |
|---|---|---|---|
| 2.000 pasos | 14,93 | 23,90 | 38% |
| 4.000 pasos | 14,72 | 23,90 | 38% |
| 6.000 pasos | 14,76 | 23,90 | 38% |
| **8.000 pasos (este modelo)** | **14,40** | 23,90 | **40%** |
| 10.000 pasos | 14,49 | 23,90 | 39% |

El propio autor advierte que se trata de un error offline sobre una unica sesion de validacion con una unica semilla, y que no informa sobre si el brazo completa realmente la tarea. El modelo no ha sido probado fisicamente en el robot. No hay benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) por tratarse de una politica de robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con unos 52 millones de parametros y un repositorio de 0,2 GB, la politica es muy ligera y deberia ejecutarse con holgura en GPUs de consumo e incluso en CPUs para la parte de red, siendo el cuello de botella el procesado de las dos camaras.
- GPU recomendadas: no disponible explicitamente; cualquier GPU moderna (por ejemplo una RTX 3060 o superior) es mas que suficiente para inferencia. Para reentrenar con la receta original (batch 8), una GPU de consumo con 8-12 GB de VRAM deberia bastar, aunque no hay datos publicados al respecto.
- Cabe en consumer GPU: si, con holgura, dado el tamano del modelo (0,2 GB en safetensors).
- Opciones de despliegue: libreria lerobot (formato nativo); no hay informacion sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a politicas de robótica.
- Latencia y throughput: no disponibles; el modelo esta disenado para operar a 30 fps con chunks de 90 acciones y replanificacion cada 30 pasos de accion.

## Comparativa con modelos similares

Alternativas dentro del mismo ecosistema (politicas ACT para SO-101/SO-100 en LeRobot). Los datos de rendimiento especificos de cada checkpoint alternativo no estan disponibles en la informacion proporcionada:

| Modelo | Tarea | Parametros | Checkpoint | Licencia | Notas |
|---|---|---|---|---|---|
| act-updown-bad-8000 (este) | Transporte de pieza a caja con SO-101 | 51.658.374 | 8.000/10.000 pasos | Apache 2.0 | MAE offline 14,40; mejor de su run; no probado en robot |
| Otros checkpoints del mismo run (2.000, 4.000, 6.000, 10.000 pasos) | Misma tarea | no disponibles | varios | Apache 2.0 (presumible) | MAE offline entre 14,49 y 14,93 |
| Politicas ACT genericas de LeRobot (p. ej. para SO-100/SO-101) | Variadas | ~50 M (tipico de ACT) | variables | Apache 2.0 (tipico) | Mismo esquema de arquitectura; datos concretos no disponibles |

En terminos generales, ACT es la politica de referencia para teleoperacion con brazos de bajo coste como el SO-101, y este modelo es una instancia concreta y documentada de esa familia, con la ventaja de publicar su receta de entrenamiento y su evaluacion offline completa.

## Limitaciones y advertencias

- No verificado en el robot fisico: el autor indica explicitamente que el modelo no ha sido probado en el brazo; el error offline de 14,40 grados no garantiza que la tarea se complete con exito.
- Evaluacion con una unica semilla y una unica sesion de validacion (23 episodios): los resultados pueden no generalizar ni a otras sesiones ni a otras condiciones de iluminacion o colocacion de objetos.
- Especializacion extrema: la politica solo vale para la tarea "Carry the bracket from the camera to the bad box and release it"; no transfiere a otras tareas ni poses finales (las sesiones del 23 de octubre con otra pose final fueron excluidas precisamente por eso).
- Datos de entrenamiento con filtros de calidad laxos (error medio accion-estado de hasta 8 grados, hasta 5 segundos de inactividad), lo que puede introducir ruido en la politica.
- Sin componente de lenguaje ni razonamiento: cualquier expectativa de flexibilidad mas alla de la tarea entrenada es irrealista.
- Sesgos y riesgo de alucinacion: conceptos no aplicables tal cual a una politica de control; el riesgo equivalente es la deriva o el fallo de agarre ante observaciones fuera de distribucion (nuevas posiciones de la pieza, oclusiones, cambios de escena).
- Licencia: Apache 2.0, sin restricciones para uso comercial; no se identifican caveats legales adicionales.
- Madurez del repositorio: 16 descargas y 1 like; es un modelo experimental de autor individual, sin revision por terceros documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IkerAzurmendiRubinnova/act-updown-bad-8000
- Datos de entrenamiento (grabaciones de MikelRubi): no disponible un enlace directo; las grabaciones se referencian como `MikelRubi/up-down-bad_*` en la model card
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Articulo original de ACT (Action Chunking with Transformers): no disponible en la informacion proporcionada
