# NaaaaaiVe6/franka-30demos-normal_task2_cartesian_20260913T212156Z-step-10000

## Resumen

El modelo `NaaaaaiVe6/franka-30demos-normal_task2_cartesian_20260913T212156Z-step-10000` es un checkpoint de robótica publicado en HuggingFace por el usuario NaaaaaiVe6, etiquetado con las etiquetas `openpi`, `pi05`, `robotics` y `safetensors`. Se trata de una política de control para un brazo robótico Franka, es decir, un modelo de visión-lenguaje-acción (VLA) que recibe observaciones visuales y de estado del robot y emite comandos de movimiento, en lugar de un modelo de lenguaje generativo. El checkpoint corresponde al paso 10.000 de entrenamiento y fue convertido de JAX a PyTorch en precisión bfloat16 conservando la configuración original de entrenamiento para Franka.

La relevancia de esta publicación es acotada y muy específica: se trata de un artefacto de investigación asociado a una única tarea (`task2`) y, según indica el propio identificador del repositorio, a un conjunto reducido de 30 demostraciones. Con 3.616.757.520 parámetros almacenados en un repositorio de 7,2 GB, su interés principal es servir como punto de partida para reproducir, evaluar o continuar el ajuste de una política concreta dentro del ecosistema openpi.

Cabe destacar que el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, no declara licencia ni idiomas soportados, y su model card remite a un fichero `log.txt` incluido en el propio repositorio para conocer el formato de salida, los límites de normalización y las convenciones del controlador. Toda la información técnica disponible es la que el autor ha volcado en esa model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; etiquetada como `pi05` dentro del ecosistema `openpi` (política de visión-lenguaje-acción para robótica) |
| Parametros totales | 3.616.757.520 (datos de los tensores safetensors) |
| Parametros activos | No aplica: no se documenta una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica / no disponible: no es un modelo de lenguaje. La model card describe un horizonte de salida de 50 pasos de acción y 32 coordenadas por paso |
| Tipos de cuantizacion | bfloat16 (formato del checkpoint convertido). No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PyTorch, bfloat16, convertido desde JAX) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo que sí detalla es el proceso de conversión: el checkpoint se obtuvo a partir de un modelo entrenado originalmente en JAX y se convirtió a PyTorch en bfloat16, manteniendo la configuración de modelo empleada en el entrenamiento con Franka. El identificador del repositorio sugiere un entrenamiento con 30 demostraciones sobre una tarea concreta (`task2`) y una representación cartesiana, si bien la model card no confirma explícitamente estos extremos.

El aspecto técnico más relevante documentado es la representación de acciones, que es cartesiana absoluta y no un delta de controlador. Cada salida consta de 50 pasos y 32 coordenadas, de las cuales únicamente las ocho primeras corresponden a acciones del robot; el resto de coordenadas no se describe. La composición exacta de las acciones es XYZ absoluto más cuaternión en orden xyzw más pinza binaria expresada como -1 o +1. Para reproducir el comportamiento correcto es obligatorio usar el fichero `assets/franka/norm_stats.json` incluido en el repositorio junto con las transformaciones de entrenamiento correspondientes. No hay información sobre número de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de trayectorias de acción para un brazo robótico Franka: emite 50 pasos de acción con 32 coordenadas por paso, de las que las ocho primeras son las acciones efectivas del robot.
- Control en espacio cartesiano absoluto: las acciones se expresan como posición XYZ más cuaternión (xyzw) más estado binario de pinza (-1/+1), no como deltas de controlador.
- Procesamiento de entradas visuales y de estado: la model card menciona entradas de cámara (`camera`) y de estado (`state`), detalladas en el fichero `log.txt`.
- Normalización específica: requiere el uso de `assets/franka/norm_stats.json` y de las transformaciones de entrenamiento originales para interpretar correctamente las salidas.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de texto; el horizonte multi-paso se limita a los 50 pasos de acción del bloque de salida.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo "thinking", visión, audio): no se documenta ninguna más allá de la percepción visual implícita en las entradas de cámara.

## Casos de uso

- Manipulación robótica sobre una tarea concreta: el modelo puede controlar un brazo Franka en la tarea `task2` para la que fue entrenado, emitiendo bloques de 50 pasos de acciones cartesianas absolutas. Es adecuado porque la salida ya está expresada en el espacio de control del robot y con la normalización del entrenamiento original.
- Reproducción de experimentos de investigación en VLA: sirve como artefacto de referencia para verificar la conversión JAX a PyTorch bfloat16 y comparar el comportamiento del modelo convertido frente al original.
- Punto de partida para ajuste fino (fine-tuning): al ser un checkpoint intermedio (paso 10.000) con pesos safetensors de 3,6 mil millones de parámetros, puede reentrenarse sobre nuevas demostraciones de la misma plataforma Franka.
- Evaluación de políticas en simulación: puede integrarse en un bucle de evaluación que alimente observaciones de cámara y estado y consuma las ocho coordenadas de acción, comparando el rendimiento con otras variantes del mismo entrenamiento.
- Análisis de representación de acciones: útil para estudiar las diferencias entre control cartesiano absoluto y control por deltas de controlador en esta plataforma.
- Instrumentación y depuración de pipelines de robótica: el repositorio incluye `log.txt` con el formato de salida, los límites de normalización y las convenciones del controlador, lo que permite validar la integración antes de desplegar el modelo en hardware real.
- Docencia y divulgación técnica: como ejemplo real de publicación de checkpoints de robótica en HuggingFace con conversión de framework y requisitos de normalización explícitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas con otros checkpoints. La busqueda web asociada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 7,2 GB (coincide con el tamano del repositorio). A esa cifra hay que anadir el coste de las activaciones, los buffers de imagen y el estado del robot, por lo que se recomienda un margen adicional; no se dispone de una cifra oficial de pico de memoria.
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, una GPU con 16 GB o mas de memoria deberia ser suficiente para inferencia en bfloat16, aunque no hay confirmacion oficial.
- Compatibilidad con GPU de consumo: si cabe previsiblemente en tarjetas de consumo con 24 GB como la RTX 4090 o la RTX 3090, siempre que el resto del pipeline (codificadores de vision, preprocesado) quepa en el mismo margen de memoria.
- Opciones de despliegue: la libreria declarada es `openpi` con pesos PyTorch safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas de robotica.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de control, la metrica relevante seria la frecuencia de inferencia alcanzable en el bucle de control, dato que la model card no aporta.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de otros modelos comparables, por lo que no es posible construir una comparativa cuantitativa fiable. Como referencia cualitativa, este checkpoint pertenece a la familia de politicas etiquetadas como `openpi`/`pi05`, y existen en el ecosistema otros checkpoints base con los que comparte supuestamente arquitectura, pero sus parametros, contexto, rendimiento y licencia no estan disponibles en la informacion consultada.

| Modelo | Parametros | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (`franka-30demos-normal_task2_cartesian`, paso 10000) | 3.616.757.520 | Acciones cartesianas absolutas, 50 pasos x 32 coordenadas | No disponible | Publicado en HuggingFace, 0 descargas |
| Checkpoints base del ecosistema `openpi` / `pi05` | No disponible | No disponible | No disponible | No disponible en la informacion consultada |
| Otros modelos VLA para robotica | No disponible | No disponible | No disponible | No disponible en la informacion consultada |

## Limitaciones y advertencias

- Especializacion extrema: el propio identificador indica un entrenamiento sobre una unica tarea (`task2`) y un numero reducido de demostraciones (30, segun el nombre del repositorio). No hay evidencia de generalizacion a otras tareas, objetos o entornos.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribucion. Es un riesgo legal relevante para cualquier integracion en produccion.
- Sin historial de uso: 0 descargas y 0 "likes" en el momento de la consulta. No existe validacion independiente del comportamiento del modelo.
- Riesgo de discrepancia por la conversion: el paso de JAX a PyTorch bfloat16 puede introducir diferencias numericas respecto al modelo original. La propia model card remite a `log.txt` para confirmar convenciones del controlador que aun requieren verificacion.
- Dependencia de la normalizacion: omitir `assets/franka/norm_stats.json` o las transformaciones de entrenamiento produce salidas incorrectas. No es un checkpoint autocontenido desde el punto de vista del preprocesado.
- Interpretacion de la salida: solo las ocho primeras de las 32 coordenadas son acciones del robot. Consumir el vector completo como acciones es un error de integracion probable.
- Representacion absoluta: las acciones no son deltas de controlador, de modo que no puede sustituir directamente a un controlador que espere incrementos.
- Sesgos y alucinacion: no hay informacion sobre sesgos del dataset de demostraciones ni sobre el comportamiento del modelo fuera de distribucion.
- Idiomas: no se declara soporte de idiomas. Cualquier instruccion en lenguaje natural que se pretenda usar como condicionamiento no esta documentada.
- Ausencia de benchmarks: no hay tasas de exito ni metricas de error publicadas, por lo que no puede estimarse su fiabilidad antes de evaluarlo en hardware real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task2_cartesian_20260913T212156Z-step-10000
- Fichero de log citado en la model card: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task2_cartesian_20260913T212156Z-step-10000/blob/main/log.txt
- Estadisticas de normalizacion citadas en la model card: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task2_cartesian_20260913T212156Z-step-10000/blob/main/assets/franka/norm_stats.json

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los unicos resultados obtenidos correspondian a servicios de mapas y no guardan relacion con el contenido de esta ficha.
