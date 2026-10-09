# RyanL22/pi05-openarm-rh56f1-egomimic-baseline-qstate-20k

## Resumen

`pi05-openarm-rh56f1-egomimic-baseline-qstate-20k` es una política robótica visión-lenguaje-acción (VLA) publicada por el usuario RyanL22 en HuggingFace, obtenida por ajuste fino del modelo base `lerobot/pi05_base` (familia pi0.5) con la librería LeRobot. Cuenta con 4.143.404.816 parámetros (~4,14 mil millones) en safetensors y un repositorio de 9,4 GB, y está especializada en manipulación sobre el robot OpenArm con manos RH56F1.

El modelo no es un LLM conversacional: es un controlador que traduce observaciones (imagen estéreo de 288x512 a 20 fps más un vector de estado propioceptivo de 28 dimensiones) en 28 dimensiones de acción, condicionado por una cadena de texto que identifica la tarea. Se entrenó durante 20.000 pasos con batch global de 64 sobre 16 tareas: 4 de teleoperación a 20 Hz y 12 procedentes de vídeo humano (anyh2r), siguiendo el estilo EgoMimic.

Su relevancia es metodológica: es una reconstrucción corregida de un modelo anterior del mismo autor (`RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k`) en la que solo se ha cambiado el `observation.state` de los fotogramas humanos, sustituyendo una síntesis basada en rezago y ganancias por la pose retargetizada real `q`. El autor documenta que el modelo previo hacía que el robot real seleccionase el modo de teleoperación en el despliegue, provocando el fallo de las tareas que solo existen como datos humanos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) derivada de pi0.5 (`lerobot/pi05_base`); la model card no detalla la arquitectura interna, pero menciona encoder de visión y vectores de estado/acción de 28 dimensiones |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones), dato real de safetensors |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible; no es una ventana de texto, sino observaciones de imagen estéreo 288x512 a 20 fps más un estado de 28 dimensiones |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors (bfloat16 declarado en entrenamiento) |
| Idiomas soportados | No disponible; el condicionamiento por tarea usa cadenas de texto y los ejemplos de la model card están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tamaño del repositorio | 9,4 GB |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi05_base`, la implementación de pi0.5 en LeRobot. La model card no describe la arquitectura interna más allá de la existencia de un encoder de visión que permaneció descongelado durante el entrenamiento, y de las dimensiones de entrada y salida del sistema: estado y acción de 28 dimensiones, imágenes estéreo de 288x512 y control a 20 fps. No se documentan en la información disponible el tipo de backbone, el mecanismo de generación de acciones ni el número de tokens de entrenamiento.

Los datos de entrenamiento combinan dos fuentes: teleoperación v4 a 20 Hz con 4 tareas y vídeo humano anyh2r con 12 tareas, repartidos en 16 celdas con proporciones proporcionales a la raíz cuadrada del número de fotogramas. El ajuste fino se realizó durante 20.000 pasos con batch global 64 (2 procesos x 32, sobre H200), precisión bfloat16, aumento de datos estéreo consistente y sin espejado (mirror off).

La innovación técnica del autor no está en la arquitectura, sino en la reconstrucción del estado humano: en lugar de sintetizarlo a partir de la acción con un modelo de rezago y ganancia/desplazamiento ajustado sobre teleoperación, se utiliza directamente la pose retargetizada `q`, emparejada con cada fichero de etiquetas por su secuencia exacta de acciones (466 de 466 coincidencias). El autor documenta que la corrección previa se aplicaba dos veces, lo que llevaba la articulación del cuello a 0,8973 en lugar de 0,889 y comprimía las articulaciones de la mano con ganancias de hasta 0,17.

## Capacidades

- Control de manipulación bimanual sobre el robot OpenArm con manos RH56F1, con salida de acciones de 28 dimensiones a 20 fps.
- Percepción visual estéreo a resolución 288x512, con aumento de datos estéreo consistente durante el entrenamiento.
- Condicionamiento por instrucción de tarea mediante cadenas de texto que deben coincidir exactamente con las usadas en entrenamiento.
- Integración de estado propioceptivo en la convención medida (pose retargetizada), compartido entre fotogramas de teleoperación y humanos.
- Aprendizaje a partir de vídeo humano: 12 de las 16 tareas del conjunto de datos provienen de vídeo anyh2r, con máscara de brazo estilo EgoMimic (máscara SAM3 rellena de negro más una línea roja; línea sobre la mano en fotogramas humanos y cinemática directa de palma a codo en teleoperación).
- Capacidad de actuar como punt de partida para nuevos fine-tunes sobre dominios propios.
- No soporta tool calling ni function calling, no implementa razonamiento multi-paso en lenguaje natural y no se documenta generación de texto general, código, matemáticas, visión general, audio ni modo de pensamiento.

## Casos de uso

- Manipulación bimanual en laboratorio con OpenArm y manos RH56F1: el modelo genera las 28 dimensiones de acción a partir de la observación estéreo y del estado propioceptivo, por lo que puede controlar directamente la política sobre el hardware objetivo.
- Replicación de demostraciones humanas (aprendizaje anyh2r): 12 de las 16 tareas del entrenamiento provienen de vídeo humano, lo que permite abordar tareas para las que no existe teleoperación, siempre que se arranque desde la pose inicial retargetizada indicada en `init_states_by_task_qstate.yaml`.
- Baseline reproducible para comparativas de ajuste fino: al fijar datos, etiquetas, acciones, imágenes, celdas e hiperparámetros, y variar solo el `observation.state` de los fotogramas humanos, sirve como referencia controlada en estudios de representación del estado.
- Investigación en coherencia estado-acción: el caso documentado por el autor (un error de doble corrección que hacía que el robot seleccionase el modo de teleoperación) es un ejemplo directo de uso para estudiar cómo pequeñas desviaciones en la normalización del estado alteran la selección de modo en el despliegue.
- Evaluación de políticas en robot real: el modelo es desplegable mediante la librería LeRobot, lo que permite ejecutar rollouts y medir tasas de éxito sobre las 16 tareas entrenadas.
- Inicialización de fine-tunes sobre dominios nuevos: al ser un checkpoint de 4,14 mil millones de parámetros con licencia apache-2.0, se puede reentrenar con datos propios de un robot OpenArm de laboratorio.
- Docencia e investigación académica en VLA: el repositorio incluye pesos safetensors y una model card detallada sobre el pipeline de datos, útil para reproducir el flujo de LeRobot de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la information disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de tasa de éxito por tarea, algo esperable en una política robótica.

Como diagnósticos declarados por el autor (no comparables con benchmarks estándar) se documentan los siguientes valores:

| Diagnóstico declarado | Valor |
|---|---|
| Estado del cuello de la política | 0,889 / 0,001 (fotogramas de teleoperación y humanos comparten valor) |
| Valor medido equivalente | 0,881, que normaliza a -0,08 |
| Emparejamiento de etiquetas por secuencia de acciones | 466 / 466 |
| Ganancia mínima de compresión de la mano en la versión anterior | 0,17 |
| Valor del cuello en la versión anterior | 0,8973 (frente a 0,889 correcto) |

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 8,3 GB solo de pesos, más las activaciones del encoder de visión con dos imágenes de 288x512; estimación orientativa de 10 a 12 GB en inferencia.
- VRAM en float32: aproximadamente 16,6 GB de pesos. No se publican cuantizaciones (int8, int4 ni GGUF).
- Entrenamiento declarado: 2 GPU H200 con batch global 64 (2 x 32) durante 20.000 pasos y precisión bfloat16.
- GPU recomendadas para inferencia: H100 o H200 (uso declarado en entrenamiento), A100 de 40 o 80 GB, L40S de 48 GB.
- Cabe en GPU de consumo: una RTX 4090 de 24 GB o una RTX 3090 de 24 GB deberían alojar los pesos en bfloat16, aunque la latencia por paso del encoder de visión no está documentada.
- Restricción de latencia: el control a 20 fps exige completar cada paso en unos 50 ms, incluido el preprocesado de las imágenes estéreo; no hay medidas publicadas de latencia ni de throughput.
- Opciones de despliegue: librería LeRobot (declarada en los tags) sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no son aplicables a este formato ni a este tipo de política, y no se documentan como soportados.
- Almacenamiento: 9,4 GB de repositorio para los pesos en safetensors.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`RyanL22/pi05-openarm-rh56f1-egomimic-baseline-qstate-20k`) | 4,14 mil millones | VLA fine-tune sobre pi0.5 | Imagen estéreo 288x512 a 20 fps y estado/acción de 28 dimensiones | apache-2.0 | HuggingFace, 0 descargas y 0 "likes" en el momento de la consulta |
| `lerobot/pi05_base` | No disponible | VLA base de pi0.5 | No disponible | No disponible | HuggingFace |
| `RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k` | No disponible | Versión anterior del mismo ajuste | Mismas imágenes y mismas tareas | apache-2.0 declarado en la model card citada | HuggingFace |
| Otros VLA de la misma categoría (por ejemplo OpenVLA o variantes de pi0) | No disponible | VLA | No disponible | No disponible | No se han encontrado datos en la información proporcionada |

La búsqueda web realizada no devolvió información técnica sobre modelos comparables: los únicos resultados obtenidos corresponden a páginas de ChatGPT y OpenAI, sin relación con robótica ni con pi0.5.

## Limitaciones y advertencias

- Las cadenas de tarea deben coincidir exactamente con las usadas en entrenamiento; cualquier variación en el texto puede alterar la selección de comportamiento.
- Para tareas que solo existen como datos humanos hay que arrancar desde la pose inicial retargetizada de `init_states_by_task_qstate.yaml`; además, la convención de la mano (meñique flexionado) sigue difiriendo de la de teleoperación.
- El conjunto de datos cubre 16 tareas (4 de teleoperación y 12 de vídeo humano); no se documenta generalización fuera de esa distribución.
- No hay benchmarks ni tasas de éxito publicadas, y el modelo acumula 0 descargas y 0 "likes", por lo que carece de validación externa por parte de la comunidad.
- Riesgo de acciones erróneas en el robot real: en una política sin métricas publicadas, una alucinación se traduce en comandos de actuación incorrectos, con riesgo físico asociado.
- No se documentan sesgos específicos, pero el modelo hereda los de los datos de teleoperación y de vídeo humano empleados, incluidos los del pipeline EgoMimic y de las máscaras SAM3.
- Idiomas: los ejemplos de la model card están en inglés y no se documenta soporte multilingüe de las cadenas de tarea.
- La licencia apache-2.0 permite el uso comercial, pero los datos de terceros empleados en el entrenamiento (vídeo humano anyh2r, pipeline EgoMimic o las máscaras SAM3) pueden tener condiciones propias que conviene verificar antes de un despliegue comercial.
- No se publican cuantizaciones, de modo que el despliegue se limita a los pesos safetensors en el formato declarado.
- Al tratarse de un controlador físico, cualquier despliegue en producción requiere paradas de emergencia, límites de par y supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-openarm-rh56f1-egomimic-baseline-qstate-20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Versión anterior citada en la model card: https://huggingface.co/RyanL22/pi05-openarm-rh56f1-egomimic-baseline-20k
- Perfil del autor: https://huggingface.co/RyanL22
- Repositorio de la librería LeRobot (declarada en los tags del modelo; no verificado en la búsqueda web): https://github.com/huggingface/lerobot
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo, pi0.5 ni robótica; los resultados obtenidos fueron páginas de ChatGPT y OpenAI, sin relación con el contenido de esta ficha.
