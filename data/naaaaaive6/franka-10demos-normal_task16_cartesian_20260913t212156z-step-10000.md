# NaaaaaiVe6/franka-10demos-normal_task16_cartesian_20260913T212156Z-step-10000

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado para un brazo Franka, publicado por el usuario NaaaaaiVe6 bajo la librería `openpi` y con la etiqueta `pi05`. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a control robótico, no de un modelo de lenguaje conversacional: su salida es una secuencia de acciones motrices, no texto. El checkpoint corresponde al paso 10.000 de entrenamiento y fue convertido desde JAX a PyTorch en bfloat16 conservando la configuración original de entrenamiento para Franka.

La representación de acciones es Cartesiana absoluta: coordenadas XYZ más cuaternión `xyzw` más pinza binaria (-1/+1). El autor advierte explícitamente de que no son acciones delta del controlador, un detalle crítico para cualquier integración. La salida tiene 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras corresponden a acciones reales del robot.

El modelo tiene 3.616.757.520 parámetros (unos 3,62 mil millones), según los pesos en safetensors, y el repositorio ocupa 7,2 GB. La relevancia de esta ficha es acotada: se trata de un artefacto experimental con cero descargas y cero likes, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados, por lo que debe tratarse como material de evaluación, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; la etiqueta `pi05` y la libreria `openpi` apuntan a la familia pi0.5 de openpi, pero no se documenta la arquitectura interna en la model card |
| Parametros totales | 3.616.757.520 (segun pesos safetensors) |
| Parametros activos | No aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (la salida de accion tiene 50 pasos y 32 coordenadas) |
| Tipos de cuantizacion | Pesos publicados en bfloat16 (PyTorch, convertidos desde JAX); no se documentan otros formatos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, PyTorch bfloat16 |
| Libreria | openpi |
| Pipeline | robotics |
| Tamano del repositorio | 7,2 GB |
| Paso de entrenamiento | 10.000 |
| Demostraciones de entrenamiento | 10 (inferido del nombre del repositorio) |
| Tarea | task16 (identificador interno del autor) |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: la model card solo indica que se trata de un checkpoint convertido de JAX a PyTorch en bfloat16 con la configuracion original de entrenamiento para Franka. Las etiquetas `pi05` y `openpi` sugieren vinculacion con la familia de modelos pi0.5 y con el ecosistema openpi, pero no se proporciona ninguna confirmacion documental, numero de tokens, composicion del dataset ni si hubo etapas de RLHF o DPO. Al ser un modelo de robotica, los datos de entrenamiento serian demostraciones de teleoperacion y observaciones de camara y estado, no corpus de texto.

Lo que si se especifica es la interfaz de accion, que es la innovacion practica mas relevante de este artefacto. La representacion es Cartesiana absoluta (XYZ + cuaternion `xyzw` + pinza binaria -1/+1), no deltas del controlador. La salida se estructura en 50 pasos y 32 coordenadas, y solo los ocho primeros valores constituyen acciones reales del robot. El autor indica que deben usarse el fichero `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes, y remite a `log.txt` para el layout de salida, el limite de normalizacion, las entradas de camara y estado y las convenciones del controlador que requieren confirmacion.

## Capacidades

- Generacion de acciones de control para un brazo Franka: produce trayectorias en coordenadas Cartesianas absolutas con orientacion en cuaternion y accion binaria de pinza.
- Ejecucion de una tarea concreta de manipulacion (identificada como `task16`), presumiblemente aprendida a partir de 10 demostraciones.
- Prediccion de chunks de accion de 50 pasos con 32 coordenadas de salida, de las que 8 son accion efectiva.
- Procesamiento de entradas de camara y estado del robot, segun lo indicado en `log.txt` (numero y tipo de camaras no disponible en la informacion proporcionada).
- Normalizacion integrada mediante `norm_stats.json`, lo que permite revertir la normalizacion de las acciones con las estadisticas de entrenamiento.
- Ejecucion en PyTorch con pesos en bfloat16, tras la conversion desde JAX.
- Soporte de tool calling: no disponible / no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido conversacional; genera chunks de accion multi-paso a nivel motor.
- Capacidades multilingues: no aplicable segun la informacion disponible.
- Capacidades especiales: no se documentan modos de razonamiento, vision o audio mas alla de las observaciones de robot necesarias para la politica.

## Casos de uso

- Investigacion en imitacion robótica: el modelo sirve como punto de partida para reproducir el entrenamiento de una politica de manipulacion con solo 10 demostraciones, util para estudiar la generalizacion en regimen de pocos datos.
- Evaluacion de la conversion JAX a PyTorch: resulta directamente util para verificar si la conversion a bfloat16 preserva el comportamiento de la politica original, comparando trayectorias generadas en ambos frameworks.
- Control de un Franka en laboratorio: se puede desplegar en un banco de pruebas con el controlador correspondiente, siempre que se confirmen antes las convenciones de controlador y el limite de normalizacion documentados en `log.txt`.
- Referencia de formato de acciones Cartesianas absolutas: sirve como ejemplo de implementacion de salidas XYZ + cuaternion + pinza binaria, util para equipos que disenan su propia interfaz de accion.
- Test de pipelines de datos de robotica: al incluir `norm_stats.json` y transformaciones de entrenamiento, es util para validar cadenas de preprocesado y desnormalizacion antes de escalar a modelos mayores.
- Estudio de sobreajuste con datasets minimos: con 10 demostraciones y 10.000 pasos, es un caso adecuado para analizar cuándo una politica memoriza la tarea en lugar de generalizar.
- Benchmark interno de latencia en hardware consumer: al tener 3,62 mil millones de parametros en bfloat16, permite medir si un solo GPU de gama alta puede ejecutar el chunk completo de 50 pasos dentro de los limites de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de exito por tarea, tasas de exito en simulacion ni comparaciones con otras politicas, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 7,2 GB en bfloat16 o float16 (coincide con el tamano del repositorio); en float32 ascenderia a unos 14,5 GB.
- VRAM adicional necesaria para activaciones, buffers de imagen y el chunk de 50 pasos: no disponible en la informacion proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamano, un RTX 4090 (24 GB) o RTX 3090 (24 GB) deberia poder alojar los pesos en bfloat16; A100 (40/80 GB) y H100 (80 GB) ofrecen margen amplio para lotes y observaciones multiples.
- Cabe en GPU consumer: previsiblemente si en tarjetas con 24 GB o mas en bfloat16; en GPUs de 12-16 GB requeriria cuantizacion a 8 bits o carga por capas, opcion no documentada por el autor.
- Opciones de despliegue: inferencia en PyTorch (formato publicado) o en JAX si se recupera el checkpoint original. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que el modelo genera acciones de robot y no tokens de texto.
- Latencia y throughput estimados: no disponibles. En control robótico, la latencia por chunk de 50 acciones es un parametro critico que el autor no documenta.

## Comparativa con modelos similares

No se dispone de datos verificables de los modelos comparables en la informacion proporcionada. La tabla siguiente recoge la comparacion por categoria, marcando como no disponible todo dato que no se ha podido confirmar.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franka-10demos-normal_task16_cartesian (este checkpoint) | 3,62 B | No disponible (chunk de 50 pasos) | No disponible | No disponible | HuggingFace, 0 descargas |
| pi0 / pi0.5 (familia openpi) | No disponible | No disponible | No disponible | No disponible | Referencia por etiqueta, sin datos confirmados |
| Otros checkpoints de robotica de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial ni de redistribucion, por lo que el uso en produccion es juridicamente inseguro.
- Entrenado con solo 10 demostraciones (segun el nombre del repositorio) para una unica tarea (`task16`), lo que implica un riesgo alto de sobreajuste y una generalizacion muy limitada fuera del entorno de recogida.
- Las acciones son Cartesianas absolutas, no deltas del controlador. Interpretarlas como deltas produce comandos incorrectos y potencialmente peligrosos en un robot real.
- La salida tiene 32 coordenadas, pero solo las 8 primeras son acciones del robot. Ignorar esta restriccion lleva a malinterpretar la salida.
- Requiere `assets/franka/norm_stats.json` y las transformaciones de entrenamiento exactas; sin ellas, la desnormalizacion de acciones es incorrecta.
- El propio autor indica que hay convenciones del controlador "que requieren confirmacion", es decir, la integracion no esta cerrada ni validada.
- No se documentan idiomas, sesgos, tasas de exito, ni comportamiento ante condiciones fuera de distribucion.
- Riesgo de alucinacion en el sentido de acciones plausibles pero fisicamente invalidas: como politica de imitacion, puede generar trayectorias que parezcan correctas y no serlo.
- Sin datos de benchmarks ni validacion publica, no hay evidencia de rendimiento reproducible.
- Repositorio con 0 descargas y 0 likes: no ha pasado por revision de la comunidad ni por validacion independiente.
- No es desplegable con servidores de inferencia de texto (vLLM, TGI, Ollama, llama.cpp); requiere un stack de robotica.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo (devuelven resultados sobre pasamanos de aluminio), por lo que no se ha podido contrastar ningun dato externo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task16_cartesian_20260913T212156Z-step-10000
- Fichero de log citado en la model card: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task16_cartesian_20260913T212156Z-step-10000/blob/main/log.txt
- Estadisticas de normalizacion citadas: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task16_cartesian_20260913T212156Z-step-10000/blob/main/assets/franka/norm_stats.json
- Resultados de busqueda web: sin enlaces relevantes; las URLs devueltas corresponden a comercios de pasamanos de aluminio y no guardan relacion con el modelo.
