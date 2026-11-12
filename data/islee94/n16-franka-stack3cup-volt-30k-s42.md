# islee94/n16-franka-stack3cup-volt-30k-s42

## Resumen

n16-franka-stack3cup-volt-30k-s42 es un checkpoint de ajuste fino del modelo fundacional de robotica GR00T N1.6, publicado por el usuario islee94 en Hugging Face. Se trata de un modelo de vision-lenguaje-accion (VLA) entrenado para controlar un brazo robotico Franka en la tarea concreta de apilar tres vasos (stack_3_cup), partiendo de datos reales retimed con la tecnica VOLT en configuracion 1x/2x.

El checkpoint contiene unicamente los pesos de inferencia (sin estado del optimizador), con 3.286.608.832 parametros en formato safetensors y un tamano de repositorio de 6,6 GB. El entrenamiento se realizo durante 30.000 actualizaciones sobre 4 GPU A100 con semilla 42, a partir del commit gr00tn16 179b98b, y segun la model card la evaluacion en robot fisico esta pendiente.

Su relevancia es acotada: no es un modelo de proposito general ni un lanzamiento de un laboratorio, sino un artefacto de investigacion reproducible que documenta un pipeline completo de ajuste fino de GR00T N1.6 sobre un embodiment real (Franka), con manifiestos y hashes de verificacion. Resulta util para quienes trabajan en imitation learning y VLA aplicados a manipulacion robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (vision-lenguaje-accion, fine-tune); detalles internos no disponibles |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (2 shards) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.6, una arquitectura de vision-lenguaje-accion orientada a control robotico. La informacion proporcionada no detalla la composicion interna de la red (backbone visual, encoder de lenguaje, cabeza de acciones), por lo que no es posible describir con rigor sus componentes mas alla de su naturaleza VLA.

El entrenamiento se realizo sobre datos reales del robot Franka para la tarea stack_3_cup, con un dataset retimed mediante VOLT en configuraciones 1x y 2x (referencia stack3cup_volt_l1_h2_6165a20). Se ejecutaron 30.000 actualizaciones en 4 GPU A100 (4 x 16, presumiblemente 4 procesos con batch 16), con semilla 42, partiendo del checkpoint gr00tn16 179b98b. El repositorio incluye manifiestos de destilacion (pacedistill_manifest.json), contexto de entrenamiento (raven_context.txt) y estadisticas de dataset, lo que facilita la trazabilidad. No se especifican el numero total de tokens, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Control robotico de manipulacion: genera acciones motoras para un brazo Franka en la tarea especifica de apilar tres vasos.
- Percepcion visual y condicionamiento por lenguaje: al ser un modelo VLA, procesa observaciones visuales e instrucciones en lenguaje para producir acciones.
- Ejecucion de politicas de imitation learning entrenadas sobre demostraciones reales retimed.
- No se documentan capacidades de tool calling, agentes multi-paso, generacion de texto general, codigo ni matematicas.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en imitation learning: reproducir el ajuste fino de GR00T N1.6 sobre un embodiment Franka concreto para comparar hiperparametros y recetas de entrenamiento.
- Benchmark de manipulacion robotica: evaluar la politica en la tarea stack_3_cup y contrastar el efecto del retiming VOLT 1x/2x frente a datos sin retimed.
- Base para nuevos fine-tunes: partir de este checkpoint de 30k actualizaciones como inicializacion en tareas de apilado similares.
- Estudio de reproducibilidad: los hashes y manifiestos permiten auditar el pipeline de entrenamiento y verificar la correspondencia entre datos y pesos.
- Prototipado en simulacion: desplegar la politica en entornos simulados de Franka antes de la evaluacion en robot fisico (que sigue pendiente).
- Docencia y formacion: ejemplo completo de artefacto VLA con trazabilidad de origen para cursos de robotica y aprendizaje por refuerzo/imitation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en robot esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,6 GB en precision original (pesos en safetensors suman 6,57 GB); con overhead de activaciones y contexto visual, se recomienda al menos 12-16 GB.
- GPU recomendadas: A100 (usadas en entrenamiento) o H100 para despliegue con mayor throughput; RTX 4090 (24 GB) es suficiente para inferencia en precision original.
- Cabe en GPU de consumo: si, en RTX 4090 y potencialmente en GPUs de 16 GB con cuantizacion, aunque no se documentan formatos cuantizados.
- Opciones de despliegue: no se especifican; al ser un checkpoint GR00T N1.6, requeriria el stack de inferencia correspondiente a esa familia (no documentado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea stack_3_cup sobre un embodiment Franka concreto; no generaliza a otras tareas sin nuevo ajuste.
- Evaluacion en robot pendiente: no hay evidencia publicada de exito en hardware real.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Idiomas y contexto no documentados: no es posible garantizar comportamiento multilingue ni ventanas de contexto largas.
- Riesgo de sobreajuste al dataset de entrenamiento (30.000 actualizaciones sobre una unica tarea) y de degradacion ante variaciones de iluminacion, posicion de objetos o del robot.
- Sin estado del optimizador: el checkpoint esta pensado solo para inferencia, no para reanudar entrenamiento.
- Procedencia de investigacion: autor individual, cero descargas y cero likes en el momento del registro; no hay validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-stack3cup-volt-30k-s42
