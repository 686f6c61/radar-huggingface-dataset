# briskVLA/student_8L_spread

## Resumen

briskVLA/student_8L_spread es un checkpoint de un modelo de vision-lenguaje-accion (VLA) para robótica, concretamente un estudiante destilado de SmolVLA entrenado sobre el benchmark LIBERO. Lo desarrolla el autor briskVLA y se distribuye a través de Hugging Face con la librería LeRobot. El modelo parte de `lerobot/smolvla_libero` como profesor y reduce la profundidad del "action expert" a 8 capas, seleccionando las capas `[0, 1, 4, 5, 8, 9, 12, 13]` del modelo original y manteniendo el ancho de FFN por defecto (2048).

El problema que aborda es el coste computacional de los VLA en inferencia robótica: al recortar el número de capas del experto de acción se reduce la latencia y el tamaño del modelo, lo que facilita su despliegue en bucles de control de robots donde cada milisegundo cuenta. El checkpoint tiene 400.923.616 parámetros y un tamaño de repositorio de 0,8 GB en formato safetensors.

La relevancia actual es doble: por un lado, forma parte de una familia de variantes (con "layout" canónico `spread`) que permite seguir destilando o comprimiendo (por ejemplo, de 8L a 4L), y por otro, se publica con scripts listos para evaluar en LIBERO con K=10 y K=1 y medir latencia. Es, por tanto, una pieza de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (vision-lenguaje-accion) con action expert de 8 capas; capas conservadas `[0, 1, 4, 5, 8, 9, 12, 13]` |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Rol | student (destilado de `lerobot/smolvla_libero` @ `a24f1f380461`) |
| Layout canonico | spread |
| Ancho FFN del experto | default (2048) |
| Libreria | lerobot |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El modelo es un estudiante destilado del checkpoint `lerobot/smolvla_libero` (commit `a24f1f380461`). La innovación principal es la reducción de profundidad del action expert: en lugar de mantener todas las capas del profesor, se conservan únicamente 8 capas concretas (`[0, 1, 4, 5, 8, 9, 12, 13]`), lo que reduce el número de parámetros y el coste de inferencia. El ancho de la FFN del experto se mantiene en el valor por defecto (2048), de modo que la compresión se produce solo en el eje de profundidad.

El entrenamiento se enmarca en el pipeline BriskVLA, que incluye scripts de destilación (`distill_student.py`) y de construcción de estudiantes más pequeños (`build_student.py`). El checkpoint se etiqueta con el layout canónico `spread`, lo que sugiere que forma parte de un conjunto de variantes organizadas por disposición de capas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; el benchmark de referencia es LIBERO.

## Capacidades

- Control robótico de manipulación: el modelo predice acciones a partir de observaciones visuales e instrucciones en lenguaje, en el marco del benchmark LIBERO.
- Política de vision-lenguaje-accion (VLA): integra percepción visual y comprensión del lenguaje para generar comandos motores.
- Evaluación con múltiples horizontes: los scripts permiten evaluar con K=10 y K=1, es decir, con distintos números de pasos de acción.
- Medición de latencia: incluye un script específico (`latency.py`) para cuantificar el coste de inferencia.
- Destilación y compresión adicional: puede usarse como punto de partida para generar estudiantes más pequeños (por ejemplo, 8L a 4L mediante agrupación y fusión de FFN).
- No se dispone de información sobre tool calling, capacidades multilingües, modo de razonamiento explícito, visión general o audio.

## Casos de uso

- Investigación en destilación de VLA: usar este checkpoint como estudiante de referencia para comparar estrategias de reducción de profundidad frente al profesor `lerobot/smolvla_libero`, midiendo la pérdida de éxito en LIBERO.
- Compresión iterativa de modelos robóticos: emplear `build_student.py` con `--group 2 --keep alternate --ffn fuse` para obtener una variante de 4 capas a partir de este estudiante de 8 capas, y evaluar el compromiso entre latencia y tasa de éxito.
- Evaluación de latencia en bucles de control: ejecutar `latency.py` para caracterizar el tiempo de inferencia por paso y decidir si el modelo cumple los requisitos de frecuencia de control de un robot concreto.
- Benchmarking reproducible en LIBERO: lanzar `run_eval.sh` con `STEPS="10 1"` para obtener métricas comparables entre variantes de la familia BriskVLA.
- Prototipado de políticas de manipulación en laboratorio: desplegar el modelo en entornos simulados LIBERO para validar tareas de pick-and-place antes de transferir a hardware real.
- Base para ajuste fino con datos propios: al ser un checkpoint LeRobot en safetensors, puede servir como inicialización para entrenamiento adicional en tareas de manipulación específicas, siempre que se respete la licencia (no disponible en la información).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe los comandos para evaluar en LIBERO con K=10 y K=1 y para medir latencia, pero no incluye cifras de tasa de éxito ni de latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 400,9 M de parámetros, en fp32 se requieren aproximadamente 1,6 GB solo para pesos, más memoria para activaciones y el codificador visual; en fp16/bf16, unos 0,8 GB para pesos.
- GPU recomendadas: no disponibles en la información. Por tamaño, el modelo es compatible con GPUs de consumo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 400,9 M de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: LeRobot (librería indicada); los scripts de evaluación y latencia se ejecutan con `uv run python`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el repositorio incluye herramientas para medirlos, pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| briskVLA/student_8L_spread | 400.923.616 | no disponible | no disponible | Hugging Face (LeRobot) | Estudiante destilado, 8 capas, layout spread |
| lerobot/smolvla_libero | no disponible | no disponible | no disponible | Hugging Face (LeRobot) | Profesor del que deriva este checkpoint |
| Otras variantes BriskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | Generables con `build_student.py` | Compresión adicional a partir de este estudiante |

No se dispone de datos de rendimiento comparado (tasa de éxito en LIBERO, latencia) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo para producción.
- Modelo de investigación: es un checkpoint de destilación con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Sin benchmarks publicados: no hay cifras de tasa de éxito ni latencia, por lo que no se puede evaluar su calidad frente al profesor.
- Dominio restringido: entrenado para LIBERO (manipulación en simulación); no se garantiza transferencia a robots reales ni a otras tareas.
- Idiomas no disponibles: no se especifica el soporte multilingüe de las instrucciones en lenguaje.
- Contexto no disponible: se desconoce la longitud máxima de observación o instrucción.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo de acción, el fallo se manifiesta como acciones incorrectas más que como texto inventado.
- Dependencia del pipeline BriskVLA: la evaluación y el uso requieren scripts específicos del proyecto, lo que añade fricción de integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/student_8L_spread
- Modelo base (profesor): https://huggingface.co/lerobot/smolvla_libero
- Repositorio LeRobot: no disponible en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
- Blog o demo de BriskVLA: no disponible en la información proporcionada
