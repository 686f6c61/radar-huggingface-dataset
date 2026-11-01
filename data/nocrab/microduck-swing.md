# nocrab/microduck-swing

## Resumen

Microduck-swing es un conjunto de tres políticas de control entrenadas mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto Microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea de manipulación motora poco habitual: subir a un columpio impreso en 3D, bombearlo para ganar amplitud, frenarlo de forma controlada y bajarse caminando. Las tres políticas (`mount`, `pump` y `dismount`) se encadenan para completar un ciclo completo de uso del columpio.

El modelo lo publica el usuario nocrab y se distribuye en formato ONNX con licencia Apache-2.0. No es un modelo de lenguaje ni un modelo generativo multimodal: es un conjunto de políticas de reinforcement learning con la interfaz estándar de 61 dimensiones de observación y 14 de acción del contrato Microduck, ejecutadas a 50 Hz. Su relevancia radica en demostrar el encadenamiento de habilidades (skill chaining) en robótica de bajo coste y en documentar con detalle el proceso de entrenamiento, las curriculums y las tasas de éxito en simulación.

El proyecto es explícitamente una simulación: nada se ha impreso ni ejecutado en un robot físico, y las políticas de montaje y bombeo requieren una entrada (la pose de la plataforma) que el software del robot todavía no proporciona. Debe tratarse como un resultado de simulación y un punto de partida reproducible, no como una habilidad lista para instalar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de reinforcement learning (actor-critic entrenado con PPO) para control de robot cuadrúpedo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; interfaz de observación de 61 dimensiones y acción de 14 dimensiones a 50 Hz |
| Tipos de cuantizacion | no disponible (exportado en ONNX, normalizador de observaciones incluido en el grafo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policies/mount.onnx`, `policies/pump.onnx`, `policies/dismount.onnx`) |

## Arquitectura y entrenamiento

Las tres políticas se entrenaron con mjlab (basado en MuJoCo Warp) y PPO, sobre las tareas construidas a partir del repositorio `pollen-robotics/microduck_rl` (commit `4757d6ae`). El columpio se modeló en simulación con los mismos números que los STL imprimibles. La política de montaje usó una currículum de altura de plataforma de 10 a 80 mm, con invalidación del episodio si algo distinto de la planta del pie tocaba el columpio; los brazos del columpio se curvaron hacia fuera a la altura de la cabeza después de que el pico rozara repetidamente los brazos rectos.

La política de bombeo parte de posturas grabadas de la política de montaje, colocada de lado sobre la plataforma. La recompensa es la amplitud del columpio, con tope en 30 grados, más un término de crecimiento basado en potencial que solo se paga mientras el robot va limpio; en modo calmado el término de crecimiento cambia de signo para frenar activamente. La política de desmontaje no se entrenó desde cero: tres intentos partiendo de la política de montaje nunca lograron bajar de la plataforma, así que se partió de la política de marcha publicada por Pollen (`alpha_walking.onnx`, release seed-v8), se afinó con una currículum de altura de plataforma y después con estados reales de transferencia grabados, lo que elevó los desmontajes limpios del 54 % al 95-97 %.

## Capacidades

- Montaje: caminar hasta el columpio y subir a la plataforma (40 mm de altura en la evaluación principal, con currículum hasta 80 mm), quedándose de pie.
- Bombeo: hacer oscilar el columpio desde 1 grado hasta 20 grados en aproximadamente 1,5 s, manteniendo 23-28 grados.
- Frenado activo: con `twist[0] = 0`, reducir de 25 grados a unos 6 grados en 4 s y a unos 2 grados en 16 s.
- Desmontaje: caminar fuera del extremo abierto delantero o trasero de la plataforma y quedarse de pie, con comando de marcha (vx, vy, wz) hacia la salida.
- Encadenamiento de habilidades: las tres políticas se suceden en un ciclo completo (subir, bombear, frenar, bajar, quedarse de pie).
- Interfaz estándar Microduck: observación `[1,61]`, acción `[1,14]` a 50 Hz, con normalizador de observaciones integrado.
- Entrada de pose de plataforma para montaje y bombeo: 6 slots de comando corporal con `[3·x, 3·y, 3·z, sin(yaw), cos(yaw) − 1, ángulo de bisagra]`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en encadenamiento de habilidades: usar las tres políticas como referencia reproducible para estudiar cómo se compone una secuencia larga de habilidades (montar, bombear, frenar, bajar) sin que el error se acumule hasta la caída.
- Estudio de currículums de altura: la currículum de 10 a 80 mm del montaje sirve como ejemplo de cómo generalizar una habilidad de subida a plataformas de distinta altura y medir la degradación (84 % limpio a 40 mm, 75 % a 60 mm).
- Transferencia de políticas de marcha: el desmontaje demuestra el afinado de una política de marcha existente (`alpha_walking.onnx`) sobre estados de transferencia reales, útil para quien quiera adaptar una política publicada a una tarea nueva.
- Diseño de recompensas para locomoción rítmica: el bombeo con recompensa de amplitud con tope y término de potencial de signo variable es un caso de estudio para tareas de oscilación controlada.
- Simulación de robótica de bajo coste: el modelo del columpio con los mismos números que los STL y el periodo de oscilación vacío de 1,078 s permiten validar diseños mecánicos en MuJoCo antes de imprimir.
- Docencia y divulgación en RL robótico: el proyecto documenta con detalle los fallos (tres intentos fallidos de desmontaje, roces del pico, el giro de la plataforma al orientarse a lo largo del columpio) y sirve como material didáctico realista.
- Prueba de pipelines de exportación ONNX: el flujo `scripts/export.py` con normalizador integrado es un ejemplo de empaquetado de políticas para despliegue en el robot.

## Benchmarks y rendimiento

Resultados en simulación (MuJoCo Warp, con domain randomization sobre fricción del pivote, fricción de la plataforma, masa del columpio, masa del robot, centro de masas, fricción de articulaciones, sesgo de encoders y montaje de la IMU).

| Prueba | Resultado |
|---|---|
| Ciclo completo (30 ciclos: montar, bombear 10 s, frenar hasta menos de 2,5 grados, desmontar, quedarse de pie) | 28/30 completaron todas las fases sin caída |
| Ciclo completo sin más contacto que las plantas de los pies | 25/30 |
| Fallos por fase en el ciclo completo | montaje 4 (pico o espinilla rozando el bastidor), frenado 1 caída, desmontaje 0 |
| Montaje con plataforma de 40 mm | 84 % limpio (sin contacto distinto de las plantas), 75 % a 60 mm |
| Bombeo | de 1 grado a 20 grados en aproximadamente 1,5 s; mantiene 23-28 grados |
| Frenado | 25 grados a aproximadamente 6 grados en 4 s y a aproximadamente 2 grados en 16 s (la fricción sola dejaría 14-19 grados) |
| Bombear 10 s y parar | 88 % completan los 20 s de ciclo |
| Desmontaje en la transferencia real desde modo calmado | 95-97 % limpio (en el suelo, lejos de la plataforma, sin tocar con espinilla o pico), 2-3 % caídas |
| Retroceso del columpio tras el impulso de bajada | vuelve a unos 13-17 grados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; las políticas son modelos ONNX pequeños (el repositorio ocupa 0,0 GB), por lo que la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; al tratarse de políticas de control a 50 Hz con observación de 61 dimensiones, no requieren GPU dedicada.
- Cabe en cualquier GPU consumer y en CPU; no se documentan requisitos mínimos.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); el entrenamiento se hizo con mjlab y MuJoCo Warp.
- Latencia y throughput: no disponibles; la interfaz exige ejecución a 50 Hz (periodo de 20 ms por paso de control).

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Licencia | Disponibilidad |
|---|---|---|---|---|
| nocrab/microduck-swing | 3 políticas RL encadenadas (montar, bombear, desmontar) | obs[1,61] → act[1,14] a 50 Hz | Apache-2.0 | HuggingFace, solo simulación |
| pollen-robotics/alpha_walking | Política de marcha para Microduck | contrato Microduck | Apache-2.0 | HuggingFace (base del desmontaje) |
| pollen-robotics/microduck_rl | Stack de entrenamiento RL para Microduck | no aplica (repositorio de entrenamiento) | Apache-2.0 | GitHub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la única comparación documentada es que el desmontaje afinado desde `alpha_walking.onnx` subió del 54 % al 95-97 % de desmontajes limpios.

## Limitaciones y advertencias

- Solo simulación: nada se ha impreso ni ejecutado en un robot físico; los ajustes (prensa de rodamientos, alojamientos de tuercas) no están probados en una impresora real.
- Dependencia de entrada no disponible en hardware: las políticas de montaje y bombeo necesitan la pose de la plataforma (marcador fiducial más sensor de ángulo de bisagra), que el software del robot no proporciona todavía.
- Sesgos conocidos: no aplica en el sentido de sesgos de lenguaje; el fallo documentado es el roce del pico o la espinilla con el bastidor durante el montaje (4 de 30 ciclos).
- Riesgo de caída: 2-3 % de caídas en el desmontaje y 1 caída en la fase de frenado en la evaluación del ciclo completo.
- Limitaciones de generalización: el montaje baja del 84 % al 75 % de limpieza al pasar de 40 a 60 mm de altura de plataforma; el rendimiento a 80 mm no se reporta.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el proyecto se declara no listo para instalación en producción.
- Caveat de producción: el modelo del columpio asume 3 paredes, 4 capas superior e inferior y 25 % de relleno giroide (55 % de la masa del PETG sólido); el periodo de oscilación vacío de 1,078 s debe verificarse cronometrando diez oscilaciones de la pieza impresa.
- El bombeo se logra principalmente lanzando cabeza y tronco en cuclillas profundas, no con el patrón de agacharse y levantarse; puede no transferir a otras morfologías.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nocrab/microduck-swing
- Vídeo de la secuencia completa: https://huggingface.co/nocrab/microduck-swing/resolve/main/media/ride_full.mp4
- Repositorio de entrenamiento mjlab: https://github.com/mujocolab/mjlab
- Stack de RL de Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck_rl
- Organización de Pollen Robotics en HuggingFace: https://huggingface.co/pollen-robotics
