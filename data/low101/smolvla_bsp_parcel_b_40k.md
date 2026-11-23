# Low101/smolvla_bsp_parcel_b_40k

## Resumen

SmolVLA-BSP es un modelo de visión-lenguaje-acción (VLA) para robótica de manipulación, desarrollado por el usuario Low101 como parte del proyecto "Parcel sorting with a LeRobot SO-101 arm". Se trata de un fine-tuning de `lerobot/smolvla_base` que introduce una modificación sustancial en la cabeza de acción: en lugar de predecir chunks de acciones discretas, el modelo genera segmentos de curvas B-spline (B-spline Policy, arXiv:2607.09648) que representan trayectorias continuas de las seis articulaciones del brazo SO-101.

El modelo resuelve una tarea concreta de clasificación y manipulación de paquetes: un brazo SO-101 recoge un paquete de un montón, lo coloca en una zona de volteo, lo gira si la etiqueta está hacia arriba y finalmente lo empuja fuera de la mesa con la etiqueta hacia abajo. Cada paquete constituye un episodio completo. Con 450 millones de parámetros totales (de los cuales 100 M corresponden al experto de acción entrenable, mientras el codificador visual permanece congelado), el modelo se entrena sobre 99 demostraciones y 73.444 fotogramas del dataset B.

La relevancia de este modelo reside en su enfoque técnico: la parametrización mediante B-splines reduce la dimensionalidad de la salida de acción y produce trayectorias suaves y ejecutables, con tiempos de planificación de 258 ms (148 ms con el paso de denoising compilado). Es un ejemplo práctico de fine-tuning de un VLA pequeño sobre hardware de consumo (una GPU de portátil con 6 GB) para una tarea industrial de clasificación de paquetes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) con cabeza de política B-spline |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE; 100 M del experto de acción son entrenables) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la tarea se especifica en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base` y se inicializa desde el checkpoint `smolvla_parcel_b_80k`. La arquitectura es un VLA de tipo SmolVLA en el que el experto de acción (100 M de parámetros) se entrena mientras el codificador visual permanece congelado. La innovación principal es la sustitución de la predicción de chunks de acciones por una política B-spline: el modelo emite 16 filas que contienen un tiempo de nudo (knot time) y los puntos de control de las seis articulaciones, lo que permite reconstruir trayectorias continuas y suaves en lugar de secuencias discretas de comandos.

El entrenamiento se realizó sobre el dataset B, compuesto por 99 demostraciones y 73.444 fotogramas, durante 40.000 pasos con un tamaño de lote de 12, empleando 13,8 horas en una única GPU de portátil con 6 GB de VRAM. Se utilizó LeRobot en el commit `64b23178`. Las entradas del modelo son tres cámaras (vista superior a 848×480, muñeca a 640×480 y lateral a 640×480, todas a 30 fps), el estado de las seis articulaciones del seguidor SO-101 y un texto de tarea ("sort the parcel so the label faces down and push it off the table"). La salida son los objetivos articulares de las seis articulaciones en forma de segmentos B-spline.

## Capacidades

- Generación de trayectorias articulares continuas mediante curvas B-spline para un brazo robótico de 6 grados de libertad (SO-101).
- Percepción visual multimodal a partir de tres cámaras simultáneas (superior, muñeca y lateral) a 30 fps.
- Condicionamiento por instrucción textual de tarea en inglés.
- Ejecución de una secuencia de manipulación de múltiples pasos: recogida, colocación, volteo condicional y empuje.
- Control de las seis articulaciones del seguidor SO-101 con objetivos articulares.
- Planificación con tiempos de inferencia de 258 ms (148 ms con el paso de denoising compilado).
- No se ha documentado soporte de tool calling, function calling, agentes genéricos ni capacidades multilingües.

## Casos de uso

- Clasificación automatizada de paquetes en cintas transportadoras: el modelo ejecuta la secuencia completa de recogida, orientación por etiqueta y empuje, adecuado para entornos logísticos donde la etiqueta debe quedar hacia abajo antes del empaquetado.
- Punto de partida para fine-tuning en nuevas escenas: dado que el modelo aprendió una única escena (bandeja, poses de cámara, iluminación y paquetes propios), sirve como inicialización para reentrenar con demostraciones del usuario en su propio montaje.
- Prueba de integración del stack LeRobot con políticas B-spline: útil para validar el ejecutor `parcel_vla/robot/run_bsp_parcel.py` y el flujo de descarga y despliegue de checkpoints.
- Investigación en parametrización de acciones: permite comparar la predicción de chunks frente a la predicción de curvas B-spline en tareas de manipulación con el mismo hardware y dataset.
- Prototipado en hardware de bajo coste: el entrenamiento cabe en una GPU de portátil de 6 GB, lo que facilita la experimentación académica con brazos SO-101 de bajo presupuesto.
- Demostración de manipulación condicional: el comportamiento de volteo condicionado a la orientación de la etiqueta sirve como caso de estudio de políticas que ramifican según el estado visual percibido.
- Evaluación de latencia en control robótico: con 148 ms por planificación compilada, es adecuado para experimentos sobre la viabilidad de políticas VLA en bucles de control de baja frecuencia.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Montón de 5 paquetes a 1,5× de velocidad | 4/5 paquetes despejados en 219 s (una sola ejecución) |
| Tiempo de planificación | 258 ms |
| Tiempo de planificación con denoising compilado | 148 ms |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los resultados de robot son indicativos, con pocos ensayos y un único montón por modelo, y no constituyen una comparación controlada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó en una GPU de portátil con 6 GB, por lo que la inferencia debería caber holgadamente en ese margen.
- GPU recomendadas: no disponible. El autor reporta entrenamiento en una GPU de portátil de 6 GB.
- Cabe en GPU de consumo: sí, según el entrenamiento reportado en una GPU de portátil de 6 GB.
- Opciones de despliegue: LeRobot en el commit `64b23178` con el ejecutor específico `parcel_vla/robot/run_bsp_parcel.py`. `lerobot-rollout` no puede ejecutar este modelo.
- Latencia: 258 ms de planificación; 148 ms con el paso de denoising compilado.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_bsp_parcel_b_40k | 450 M | no disponible | Clasificación de paquetes con SO-101 (B-spline) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA base de LeRobot | no disponible | Hugging Face |
| smolvla_parcel_b_80k | no disponible | no disponible | Clasificación de paquetes con SO-101 (checkpoint previo) | no disponible | Referenciado como inicialización |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo aprendió una única escena: bandeja, poses de cámara, iluminación y paquetes fabricados por el autor. En otro montaje probablemente no funcionará tal cual.
- Dataset pequeño (99 demostraciones) y un solo operador, lo que limita la generalización.
- Los resultados de robot provienen de pocos ensayos y un único montón por modelo; son indicativos, no una comparación controlada.
- Requiere el ejecutor B-spline del repositorio; `lerobot-rollout` no es compatible.
- Depende de una versión concreta de LeRobot (commit `64b23178`), lo que puede complicar la reproducibilidad a largo plazo.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero la escasa generalización limita su aplicabilidad directa en producción sin fine-tuning.
- La instrucción de tarea está en inglés y no se documentan capacidades multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Low101/smolvla_bsp_parcel_b_40k
- Repositorio GitHub del proyecto: https://github.com/TimeisGold5168/Parcel_task_VLA_s0_101_arm
- Página del proyecto: https://timeisgold5168.github.io/
- Paper de B-spline Policy: arXiv:2607.09648
- Modelo base: https://huggingface.co/lerobot/smolvla_base
