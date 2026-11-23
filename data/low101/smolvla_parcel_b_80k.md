# Low101/smolvla_parcel_b_80k

## Resumen

smolvla_parcel_b_80k es un modelo de visión-lenguaje-acción (VLA) obtenido por ajuste fino supervisado de SmolVLA, la política robótica de 450 millones de parámetros publicada por Hugging Face en el marco de LeRobot. Lo desarrolla el usuario Low101 como parte de un proyecto personal de clasificación de paquetes con un brazo robótico LeRobot SO-101, y su único propósito es ejecutar una tarea concreta: coger un paquete de un montón, girarlo si la etiqueta mira hacia arriba y empujarlo fuera de la mesa con la etiqueta hacia abajo.

El modelo parte de `lerobot/smolvla_base` y se entrena sobre el dataset B del proyecto, compuesto por 99 demostraciones de teleoperación (73.444 fotogramas) con un único texto de tarea. El experto de acción (unos 100 millones de parámetros) se entrena mientras el codificador visual permanece congelado. El resultado es un checkpoint de 80.000 pasos con un error de acción offline de 1,91 grados, el más bajo de los cuatro modelos entrenados sobre el mismo dataset.

Su relevancia es acotada pero ilustrativa: demuestra que es posible ajustar una política VLA de tamaño moderado en una GPU de portátil con 6 GB de VRAM en algo menos de 28 horas, y sirve como referencia práctica de imitación de bajo coste para quien quiera replicar el flujo con LeRobot. No es un modelo de propósito general ni está pensado para desplegarse fuera del entorno para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): codificador visual congelado, modelo de lenguaje y experto de acción entrenable con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE; el experto de acción entrenable suma unos 100 M) |
| Longitud de contexto | no disponible (la entrada es un texto de tarea único más tres imágenes y el estado de las articulaciones) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (el texto de tarea está en inglés y es fijo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

SmolVLA combina percepción visual, instrucción en lenguaje natural y generación de acciones motoras en una sola política. En este ajuste fino, el codificador visual queda congelado y solo se entrena el experto de acción, de aproximadamente 100 millones de parámetros. La generación de acciones emplea flow matching con 10 pasos de integración y produce fragmentos de 50 acciones consecutivas por inferencia, lo que reduce la frecuencia de replanificación y suaviza la ejecución.

Los datos de entrenamiento son 99 demostraciones de teleoperación del dataset B, con 73.444 fotogramas capturados a 30 fps desde tres cámaras (superior a 848×480, de muñeca a 640×480 y lateral a 640×480), más las seis posiciones articulares del seguidor SO-101 como estado y un único texto de tarea: «sort the parcel so the label faces down and push it off the table». El entrenamiento dura 80.000 pasos con tamaño de lote 12, calentamiento de 1.000 pasos y decaimiento coseno, y consume 27,4 horas en una GPU de portátil con 6 GB de VRAM. El checkpoint publicado corresponde al paso 80.000 y se ejecutó con LeRobot en el commit `64b23178`.

## Capacidades

- Generación de acciones motoras de 6 articulaciones para el brazo SO-101 a partir de tres vistas de cámara y del estado de las articulaciones.
- Seguimiento de una instrucción de tarea en lenguaje natural, fijada en el entrenamiento a una única frase.
- Ejecución de una secuencia de manipulación completa: agarre desde un montón, giro condicional del paquete según la orientación de la etiqueta y empuje fuera de la mesa.
- Inferencia por fragmentos de 50 acciones con flow matching de 10 pasos, compatible con inferencia de tiempo real (RTC) y horizonte de ejecución configurable.
- No dispone de tool calling, function calling, razonamiento multietapa ni capacidades conversacionales; no es un modelo de lenguaje de propósito general.
- No se han documentado capacidades multilingües ni de audio.

## Casos de uso

- Prueba del pipeline de LeRobot: sirve para verificar de extremo a extremo la instalación, la carga de checkpoints y el bucle de control con inferencia RTC antes de entrenar un modelo propio.
- Punto de partida para ajuste fino: al estar entrenado sobre `lerobot/smolvla_base` y documentar hiperparámetros completos, puede reutilizarse como inicialización para nuevas tareas de manipulación con demos propias.
- Clasificación de paquetes en laboratorio: reproduce la tarea de ordenar un paquete por orientación de etiqueta y empujarlo fuera de la mesa, útil como banco de pruebas de manipulación con un solo brazo.
- Estudio de imitación de bajo coste: permite medir cuánto rendimiento se obtiene con 99 demos y 27 horas de entrenamiento en una GPU de 6 GB, como referencia para decidir el volumen de datos de proyectos mayores.
- Validación de configuraciones de inferencia: el script de ejecución expone variables como `FREEZE`, `RTC_EXACT_DELAY`, `COMPILE` y `queue_threshold`, lo que permite comparar latencia y estabilidad del control en tiempo real.
- Docencia y demostraciones: por su tamaño reducido y licencia Apache 2.0, es adecuado para mostrar el ciclo completo de un VLA en cursos o talleres con hardware asequible.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Error de acción offline (dataset B) | 1,91° (el más bajo de los cuatro modelos del dataset B) |
| Pasos de entrenamiento | 80.000 |
| Tiempo de entrenamiento | 27,4 h en una GPU de portátil de 6 GB |
| Inferencia | fragmentos de 50 acciones, flow matching de 10 pasos |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible; se trata de un modelo robótico y las únicas métricas reportadas son las de la tarea de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el entrenamiento cupo en una GPU de 6 GB, por lo que la inferencia en precisión nativa debería caber holgadamente en 8 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM para inferencia; el entrenamiento documentado se realizó en una GPU de portátil de 6 GB.
- Cabe en GPU consumer: sí, según el autor, con 6 GB de VRAM durante el entrenamiento.
- Opciones de despliegue: LeRobot en el commit `64b23178` con los scripts del repositorio del proyecto; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la inferencia usa fragmentos de 50 acciones con flow matching de 10 pasos y opciones de tiempo real (RTC) con horizonte de ejecución de 10 y umbral de cola de 30.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_parcel_b_80k | 450 M (≈100 M entrenables) | no disponible | error offline de 1,91° en dataset B | Apache 2.0 | Hugging Face, LeRobot |
| lerobot/smolvla_base | 450 M | no disponible | no disponible (modelo base sin ajuste a esta tarea) | no disponible en la información proporcionada | Hugging Face, LeRobot |
| Otros modelos del dataset B del mismo proyecto | no disponible | no disponible | peor error offline que 1,91° según el autor | no disponible | no disponible |

No se dispone de datos suficientes para comparar con otras familias de VLA (por ejemplo, OpenVLA o RT-2) en parámetros, contexto o rendimiento dentro de la información proporcionada.

## Limitaciones y advertencias

- Sobreajuste al entorno: el modelo aprendió una única escena (bandeja, poses de cámara, iluminación y paquetes fabricados por el autor); en otra instalación probablemente no funcionará tal cual.
- Dataset muy pequeño: 99 demostraciones, un solo operador y un único texto de tarea, lo que limita la generalización y la variedad de instrucciones.
- Evaluación débil: la mayoría de las pruebas robóticas tienen pocos ensayos y un solo montón por modelo, por lo que son indicativas y no una comparación controlada.
- Riesgo de alucinación de acciones: como política de imitación, puede producir trayectorias no vistas ante distribuciones de entrada distintas de las de entrenamiento, sin mecanismo de detección de fallo.
- Idiomas: el texto de tarea está fijado en inglés y no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece ninguna garantía de robustez ni de seguridad física; cualquier despliegue en un brazo real requiere supervisión y límites de par y de espacio de trabajo.
- Dependencia de versión: requiere LeRobot en el commit `64b23178`; otras versiones pueden romper la carga de procesadores y el renombrado de cámaras (top, wrist, side a camera1, camera2, camera3).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Low101/smolvla_parcel_b_80k
- Repositorio del proyecto: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm
- Página del proyecto: https://timeisgold5168.github.io/
- Instalación: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm#installation
- Modelo base: https://huggingface.co/lerobot/smolvla_base
