# Low101/smolvla_parcel_b_fb_15k

## Resumen
smolvla_parcel_b_fb_15k es un modelo de visión-lenguaje-acción (VLA) obtenido por ajuste fino de SmolVLA Base de LeRobot, publicado por el usuario Low101. Está especializado en una única tarea robótica de clasificación de paquetes con un brazo SO-101: coger un paquete de un montón, colocarlo en una zona de volteo, girarlo si la etiqueta mira hacia arriba y empujarlo fuera de la mesa con la etiqueta hacia abajo. El modelo tiene 450 millones de parámetros totales, de los cuales solo el experto de acción (unos 100 millones) se entrena mientras el codificador visual permanece congelado.

El modelo se presenta explícitamente como el checkpoint de referencia del proyecto (paso 10k de un entrenamiento de 15k pasos), pensado para reproducir resultados y servir de punto de partida para ajustes finos propios. No es un modelo de propósito general: aprendió una escena concreta (bandeja, poses de cámara, iluminación y paquetes fabricados por el autor) y el propio autor advierte que probablemente no funcione tal cual en otro montaje.

Su relevancia es acotada pero útil para la comunidad de robótica de imitación: demuestra un flujo completo de entrenamiento VLA con LeRobot en una GPU de portátil de 6 GB, con datos multimodales (tres cámaras y estado articular) y una licencia Apache 2.0 que permite reutilización comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción) con codificador visual congelado y experto de acción entrenable |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE; el experto de acción entrena ~100M) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la instrucción de tarea está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento
El modelo parte de `lerobot/smolvla_base` y se inicializa desde `smolvla_parcel_b_80k`. La política SmolVLA combina un codificador visual congelado con un experto de acción de aproximadamente 100 millones de parámetros que es la única parte entrenada. Las entradas son tres flujos de imagen a 30 fps (`top` a 848×480, `wrist` y `side` a 640×480), el estado de las 6 articulaciones del seguidor SO-101 y un texto de tarea en inglés; la salida son las consignas articulares de las 6 articulaciones.

El entrenamiento usó el dataset B más 16 correcciones cortas de borde lejano y 20 demostraciones de apilado de cajas (repetidas 3 veces), durante 15k pasos con batch 12, tasa de aprendizaje 1e-4 y 500 pasos de warmup, en 5,2 horas sobre una GPU de portátil de 6 GB. El checkpoint publicado corresponde al paso 10k. Se empleó LeRobot en el commit `64b23178`. No se documentan técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades
- Control robótico de manipulación: genera consignas articulares para un brazo SO-101 de 6 grados de libertad.
- Percepción multimodal: integra tres cámaras (vista superior, muñeca y lateral) con el estado articular.
- Seguimiento de instrucción en lenguaje natural: acepta el texto de tarea "sort the parcel so the label faces down and push it off the table".
- Habilidad de volteo de paquetes según la orientación de la etiqueta.
- Habilidad de empuje de paquetes fuera de la mesa con la etiqueta hacia abajo.
- Ejecución con control de tiempo real (RTC) mediante el parámetro `--inference.type=rtc`, con horizonte de ejecución de 10 y umbral de cola de 30.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento.

## Casos de uso
- Reproducción de resultados del proyecto: cargar el checkpoint en el layout de scripts de LeRobot y ejecutar `run_parcel.sh smolvla_b_fb` para verificar las métricas publicadas (4/4 con un tipo y 3 paquetes) en el montaje original.
- Punto de partida para ajuste fino: usar el modelo como inicialización y reentrenar el experto de acción con demostraciones propias de otra escena, aprovechando que solo ~100M de parámetros son entrenables y cabe en GPU de consumo.
- Prueba de pipelines de imitación: validar el flujo completo de LeRobot (grabación de demos, entrenamiento, despliegue con RTC) antes de invertir en datasets mayores.
- Investigación en correcciones de borde: el modelo incorpora 16 correcciones cortas de borde lejano, útil como referencia para estudiar cómo pequeñas cantidades de datos correctivos afectan al comportamiento en los límites de la tarea.
- Docencia y divulgación: ejemplo reproducible de VLA entrenado en hardware modesto (GPU de 6 GB) para cursos de robótica de imitación.
- Evaluación comparativa de políticas: servir como baseline de SmolVLA B en experimentos con distintos números de paquetes y tipos, dado que el autor publica resultados por configuración (1 tipo/3 paquetes, 1 tipo/4 paquetes, 4 tipos/4 paquetes).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación son los del autor en su montaje:

| Prueba | Resultado |
|---|---|
| Error de agarre offline (habilidades nuevas) | 1,4° |
| Error de agarre offline (dataset B) | 1,4° |
| Test de inicio (el brazo abandona la posición home) | superado |
| Benchmark, 1 tipo, 3 paquetes | 4/4 |
| Benchmark, 1 tipo, 4 paquetes | 1/6 |
| Benchmark, 4 tipos, 4 paquetes | 0/6 |
| Volteo | 1 etiqueta incorrecta en 108 paquetes despejados |

El propio autor advierte que la mayoría de pruebas robóticas tienen pocos ensayos y un solo montón por modelo, por lo que son indicativas y no una comparación controlada.

## Requisitos de hardware
- Entrenamiento documentado: una GPU de portátil con 6 GB de VRAM, 5,2 horas para 15k pasos con batch 12.
- VRAM estimada para inferencia: no disponible de forma explícita; con 450M parámetros en FP32 los pesos ocupan aproximadamente 1,8 GB, más el coste de los tres flujos de imagen.
- GPU recomendadas: no disponibles; el autor solo documenta una GPU de portátil de 6 GB para entrenamiento.
- Cabe en GPU de consumo: sí, según el entrenamiento documentado en 6 GB.
- Opciones de despliegue: LeRobot en el commit `64b23178`, con ejecución mediante `parcel_vla/robot/run_parcel.sh` y control RTC. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles; las cámaras operan a 30 fps y el despliegue usa horizonte de ejecución de 10.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_parcel_b_fb_15k | 450M | no disponible | Clasificación de paquetes con SO-101 | Apache 2.0 | Hugging Face (20 descargas) |
| lerobot/smolvla_base | no disponible | no disponible | VLA base de propósito general para manipulación | no disponible en la información | Hugging Face (modelo base) |
| smolvla_parcel_b_80k | no disponible | no disponible | Clasificación de paquetes, checkpoint previo | no disponible en la información | Referenciado como inicialización |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Sobreajuste a una escena: el modelo aprendió una bandeja, unas poses de cámara, una iluminación y unos paquetes concretos; en otro montaje probablemente no funcionará tal cual.
- Dataset pequeño y un solo operador: los resultados no garantizan generalización a otras condiciones.
- Evaluación limitada: pocos ensayos por configuración y un solo montón por modelo; las cifras son indicativas, no comparaciones controladas.
- Degradación con complejidad: pasa de 4/4 con un tipo y 3 paquetes a 0/6 con 4 tipos y 4 paquetes.
- Dependencia de versión: requiere LeRobot en el commit `64b23178`; otras versiones pueden romper la compatibilidad.
- Dependencia de hardware: asume un brazo SO-101, tres cámaras con resoluciones y montajes específicos, y una instrucción de tarea concreta en inglés.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de funcionamiento fuera de su montaje.
- No se documentan sesgos, tasas de alucinación ni cuantizaciones disponibles.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Low101/smolvla_parcel_b_fb_15k
- Repositorio del proyecto: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm
- Página del proyecto: https://timeisgold5168.github.io/
- Instrucciones de instalación: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm#installation
- Modelo base: https://huggingface.co/lerobot/smolvla_base
