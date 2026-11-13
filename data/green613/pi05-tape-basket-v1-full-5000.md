# Green613/pi05-tape-basket-v1-full-5000

## Resumen

`Green613/pi05-tape-basket-v1-full-5000` es un checkpoint de ajuste fino completo (full fine-tuning) del modelo base `lerobot/pi05_base`, orientado a una tarea robotica concreta: recoger un rollo de cinta y depositarlo en una cesta. Lo publica el usuario Green613 bajo licencia Apache 2.0 y se distribuye en formato LeRobot, la libreria de referencia del ecosistema Hugging Face para politicas de robotica (imitation learning / vision-language-action).

El modelo no es un LLM conversacional: es una politica VLA (vision-language-action) que recibe imagenes RGB de la cabeza y de la muneca derecha, junto con seis articulaciones del brazo derecho muestreadas a 10 Hz, y emite seis objetivos articulares absolutos. Predice secuencias de 50 pasos con una ventana de ejecucion inicial de 10 pasos, un esquema tipico de action chunking para reducir el coste de inferencia en bucle cerrado.

Es relevante como ejemplo de pipeline reproducible de fine-tuning completo sobre PI05 en el stack XLeRobot/LeRobot: incluye checkpoints de recuperacion con estado del optimizador, scheduler y RNG, normalizacion por cuantiles calculada solo con el conjunto de entrenamiento y una particion de datos documentada (108 demostraciones de entrenamiento, 20 de validacion y un TEST20 que permanece local). El autor advierte explicitamente de que la evaluacion de exito en robot y la aceptacion en GPU estan en curso, por lo que no debe tratarse como un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica VLA PI05 (vision-language-action) sobre LeRobot; detalles internos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de accion de 50 pasos, ejecucion de 10) |
| Tipos de cuantizacion | no disponible; el entrenamiento se realizo en BF16 con salvaguardas FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints de LeRobot (libreria `lerobot`); formatos de fichero concretos no disponibles |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` (revision `22c30e5b34f9e7ab738b1b34fc2fc5ecfe2d28f0`) y aplica un ajuste fino de todos los parametros sobre 108 demostraciones de la tarea "cinta a cesta". La entrada combina dos flujos RGB (camara de cabeza y muneca derecha) con el estado de seis articulaciones del brazo derecho a 10 Hz; la salida son seis objetivos articulares absolutos, con prediccion de 50 pasos y ejecucion de los 10 primeros, lo que encaja con un esquema de action chunking para politicas de imitacion.

El entrenamiento se ejecuto en BF16 con salvaguardas fijadas en FP32, gradient checkpointing y un schedule de 5000 pasos con checkpoints cada 500 pasos. La normalizacion usa cuantiles calculados exclusivamente con el conjunto de entrenamiento, lo que evita fugas de informacion desde validacion o test. Los checkpoints de recuperacion incluyen estado del optimizador, scheduler y RNG, y el codigo de referencia corresponde al commit `71a11efe77f55e61f3ab2ce45b40da8cf626afa9` de LeRobot. No se documentan en la informacion disponible detalles sobre el corpus de preentrenamiento del modelo base, ni si hubo RLHF, DPO u otras fases de alineacion.

## Capacidades

- Control robotico de imitacion para una tarea manipulativa concreta: pick-and-place de un rollo de cinta en una cesta.
- Percepcion visual multimodal: procesa simultaneamente RGB de camara de cabeza y de muneca derecha.
- Prediccion de acciones en espacio articular absoluto (seis articulaciones del brazo derecho).
- Action chunking: genera 50 pasos de accion y ejecuta una ventana inicial de 10, lo que reduce la frecuencia efectiva de inferencia.
- Operacion a 10 Hz en el bucle de control descrito.
- Reanudacion de entrenamiento desde checkpoints completos (optimizador, scheduler y RNG incluidos).
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matematicas, codigo, vision general, audio ni modo thinking; el modelo esta especializado en la tarea descrita.

## Casos de uso

- Replicacion de la tarea de pick-and-place en un XLeRobot: el checkpoint sirve como referencia para recoger un rollo de cinta y soltarlo en una cesta con el brazo derecho, usando las dos camaras RGB y el estado articular a 10 Hz.
- Punto de partida para fine-tuning de tareas similares: al ser un ajuste completo sobre `pi05_base` con normalizacion por cuantiles y particion documentada, es util como receta reproducible para adaptar PI05 a nuevas tareas de manipulacion.
- Evaluacion de pipelines de imitation learning en LeRobot: permite comparar variantes de entrenamiento (pasos, ventana de ejecucion, normalizacion) sobre una tarea acotada y con conjunto de validacion separado.
- Estudio de action chunking en robotica: la combinacion de prediccion de 50 pasos con ejecucion de 10 permite medir el compromiso entre latencia de inferencia y reactividad del control.
- Docencia y prototipado en laboratorio: la licencia Apache 2.0 y el formato LeRobot facilitan su uso en cursos y pruebas internas de robotica sin restricciones comerciales adicionales.
- Auditoria de reproducibilidad: los checkpoints de recuperacion con estado de optimizador, scheduler y RNG permiten reanudar y auditar el proceso de entrenamiento paso a paso.
- No se recomienda como caso de uso la atencion al cliente, generacion de codigo, analisis documental ni ninguna tarea de lenguaje: el modelo no esta disenado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la ejecucion en robot y la aceptacion en GPU estan en curso y que el exito de la tarea no ha sido evaluado; el conjunto TEST20 permanece local y no se ha subido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El numero de parametros del modelo base no se documenta en la informacion proporcionada, por lo que no es posible calcular una estimacion fiable.
- GPU recomendadas: no disponible. El autor menciona una "prueba corta inicial en GPU" (100 pasos y reanudacion hasta 200) sin especificar el modelo de GPU utilizado.
- Compatibilidad con GPU de consumo: no determinada; depende del tamano real de `pi05_base`, que no se indica.
- Opciones de despliegue: el modelo se distribuye como checkpoint de LeRobot y se carga mediante la libreria `lerobot`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a una politica VLA de este tipo.
- Latencia y throughput: no disponibles. La ventana de ejecucion de 10 pasos a 10 Hz sugiere un ciclo de control de 1 segundo entre inferencias, pero no se aportan mediciones reales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Estado |
|---|---|---|---|---|---|
| `Green613/pi05-tape-basket-v1-full-5000` | VLA PI05 ajustado a tarea | no disponible | 50 pasos de accion, ejecucion de 10 | Apache 2.0 | Checkpoint de investigacion, sin evaluacion de exito |
| `lerobot/pi05_base` | VLA PI05 base | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo base publicado por LeRobot |
| Otras politicas de imitation learning en LeRobot (p. ej. ACT, Diffusion Policy) | Politicas de imitacion | no disponible | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (cinta a cesta) con un unico brazo (derecho) y una configuracion de camaras concreta; no generaliza a otras tareas sin reentrenamiento.
- El autor declara que la evaluacion de exito en robot y la aceptacion en GPU estan en curso: no hay evidencia publicada de que la politica funcione de forma fiable.
- El conjunto TEST20 no se ha publicado, por lo que no es posible verificar de forma independiente el rendimiento en datos no vistos.
- Riesgo de sobreajuste a las 108 demostraciones de entrenamiento y a las condiciones de iluminacion, posicion de camara y disposicion de objetos de la grabacion original.
- No se documentan sesgos especificos, pero al ser un modelo de robotica entrenado con datos propios, su comportamiento fuera de la distribucion de entrenamiento es incierto.
- No se incluyen videos de demostracion, datos de test final ni credenciales de acceso en el repositorio.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de validacion en robot hace desaconsejable su despliegue en produccion sin una evaluacion previa propia.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje natural de forma conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Green613/pi05-tape-basket-v1-full-5000
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio LeRobot (commit de referencia `71a11efe77f55e61f3ab2ce45b40da8cf626afa9`): https://github.com/huggingface/lerobot
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos especificos de este checkpoint.
