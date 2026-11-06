# jeanesther/microduck-basketball

## Resumen

Microduck-basketball es una política de control robótico entrenada mediante aprendizaje por refuerzo para que el robot cuadrúpedo Microduck (de Pollen Robotics) mantenga el equilibrio sobre un balón de baloncesto de talla 7 que gira libremente y siga comandos de velocidad. Lo desarrolla el autor independiente jeanesther (publicado también bajo la cuenta HannesVonEssen) y se distribuye con licencia Apache 2.0 en Hugging Face. No es un modelo de lenguaje: es un actor neuronal recurrente que mapea observaciones propioceptivas de 61 dimensiones a 14 acciones articulares.

La relevancia técnica del modelo está en su diseño "ciego": el actor no recibe ninguna información del estado del balón, solo propiocepción (giroscopio, gravedad proyectada, posiciones y velocidades articulares, acciones previas y comandos de velocidad). Para compensar esa ausencia de información, incorpora una capa LSTM de 256 unidades que actúa como memoria recurrente y permite inferir la dinámica oculta del contacto con el balón a partir del historial de observaciones.

El checkpoint publicado corresponde a la iteración 6.999 del entrenamiento b11. El autor lo describe explícitamente como una política experimental para pruebas de hardware: las comprobaciones de simulación y exportación han pasado, pero el comportamiento en robot real y los tiempos de ejecución en placa no están validados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor recurrente: LSTM(256) seguida de MLP ELU(512, 256, 128) y salida de 14 acciones; crítico privilegiado solo en entrenamiento |
| Parametros totales | Aproximadamente 624.000 (actor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; memoria recurrente LSTM de estado (h, c) de 256 unidades, ejecución a 50 Hz |
| Tipos de cuantizacion | No disponible (exportación en float32 ONNX) |
| Idiomas soportados | No aplica (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`, float32) y checkpoint PyTorch (`checkpoint.pt`) con actor, crítico, normalizadores, estado de Adam y contador de iteración |

## Arquitectura y entrenamiento

La política es un actor recurrente que recibe una observación normalizada de 61 dimensiones y la procesa con una LSTM de 256 unidades, cuyas salidas pasan por un MLP con activación ELU de capas 512, 256 y 128 hasta producir 14 acciones articulares. El vector de observación se compone de: giroscopio (índices 0:3), gravedad proyectada (3:6), posiciones articulares (6:20), velocidades articulares (20:34), las 14 acciones previas (34:48), comandos de velocidad lineal y angular (48:51) y dos bloques de relleno a cero para comandos de cabeza y cuerpo (51:55 y 55:61). No hay estado del balón en la entrada del actor.

El entrenamiento se realizó en simulación con el entorno mjlab. El crítico privilegiado sí podía observar el balón durante el aprendizaje, pero se elimina en la exportación ONNX. La recompensa incluye un término de penalización de cambios de acción al cuadrado con coeficiente −0,2, que actúa como suavizado durante el aprendizaje (no como filtro posterior de salida). El entrenamiento de continuación b11 usó comandos de ±0,15 m/s en avance, ±0,10 m/s en lateral y ±0,50 rad/s en guiñada. La normalización de observaciones está integrada en el propio `policy.onnx`.

## Capacidades

- Control de equilibrio sobre un balón de baloncesto de talla 7 que rueda libremente, partiendo de la posición erguida sobre el ápice del balón.
- Seguimiento de comandos de velocidad: avance, lateral y guiñada, con comando `[0,0,0]` como equilibrio en el sitio.
- Estimación implícita de la dinámica del balón mediante memoria recurrente LSTM a partir del historial propioceptivo, sin cámara ni rastreador del balón.
- Robustez ante perturbaciones: el entrenamiento y la evaluación incluyen reinicios de velocidad horizontal de la base de ±0,09 m/s cada 0,5–1 s.
- Inferencia a 50 Hz con estado recurrente (h, c) que debe propagarse entre pasos y reiniciarse en activaciones, cambios de política y límites de recuperación o reset.
- No incluye capacidades de visión, audio, lenguaje, tool calling ni razonamiento multi-paso.

## Casos de uso

- Investigación en control de robots con patas: banco de pruebas para estudiar políticas recurrentes ciegas frente a políticas feedforward con estado completo, usando la referencia b2_6250 como línea base.
- Pruebas de hardware en el Microduck: validar en robot real el equilibrio sobre un objeto rodante antes de integrar percepción adicional, con la advertencia de que el comportamiento físico no está verificado.
- Evaluación de robustez ante perturbaciones: reproducir el protocolo de 1.024 entornos por semilla y 60 s por episodio para medir supervivencia y seguimiento de guiñada bajo empujes controlados.
- Desarrollo de runtimes recurrentes: servir como caso de prueba para el soporte LSTM del cargador de Microduck (PR #231) y para la verificación del presupuesto de control de 20 ms en la placa del robot.
- Estudio de sim-to-real en contacto dinámico: analizar si la memoria recurrente compensa la falta de observación del balón al transferir la política a hardware.
- Formación y docencia en aprendizaje por refuerzo robótico: el repositorio incluye checkpoint completo, configuración ejecutable, vídeo de simulación y recibos de evaluación, lo que facilita reproducir el pipeline de entrenamiento y exportación.

## Benchmarks y rendimiento

Evaluación emparejada: 1.024 entornos por semilla (101, 202, 303), 3.072 ensayos por política, 60 s por episodio, primera caída como fallo. Perturbaciones de ±0,09 m/s cada 0,5–1 s. Comandos de evaluación de ±0,30 m/s en avance, ±0,20 m/s en lateral y ±1,0 rad/s en guiñada.

| Politica | Supervivencia 20 s | Supervivencia 60 s | MAE seguimiento guiñada (rad/s) | RMS de cambio de acción |
|---|---:|---:|---:|---:|
| b11_6999 LSTM ciega | 98,86% | 97,01% | 1,2618 | 0,23384 |
| b2_6250 MLP con estado del balón (referencia) | 99,67% | 99,12% | 0,7574 | 0,13657 |

La política b11 sobrevive 2.980 de 3.072 ensayos; la referencia sobrevive 3.045 de 3.072. Las métricas de seguimiento y suavidad excluyen las muestras desde la primera caída, por lo que están condicionadas a la supervivencia. El autor señala que estos resultados no demuestran igual calidad de movimiento ni transferencia al robot real. Comparación numérica PyTorch/ONNX de 40 pasos con reset: error absoluto máximo de acción de 1,43e-6. Comparación de producción Rust/Python de 80 pasos con reset: coincidencia exacta en el host de desarrollo; ninguna de las dos mide latencia en placa.

## Requisitos de hardware

- VRAM estimada: mínima; el actor tiene unas 624.000 parámetros y el repositorio ocupa 0,1 GB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; para inferencia a 50 Hz basta CPU o una GPU integrada. El cuello de botella es la latencia en la placa del robot, no el cómputo.
- Cabe en GPU consumer: sí, con amplio margen (RTX 4090, RTX 3060 o inferiores).
- Opciones de despliegue: ONNX Runtime (float32) con soporte de estado recurrente; el cargador estándar de Microduck requiere el soporte LSTM del PR #231 o un cargador equivalente. Se debe publicar con `model_api: 2`.
- Latencia y throughput: ejecución objetivo a 50 Hz (presupuesto de control de 20 ms). El autor recomienda ejecutar el ejemplo `policy-rehearsal` del PR del runtime en el ordenador del robot para verificar ese presupuesto antes del despliegue en motores. No se publican medidas de latencia en placa.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Supervivencia 60 s | MAE guiñada (rad/s) | Licencia |
|---|---|---:|---:|---:|---|
| microduck-basketball b11_6999 | ~624.000 (actor) | 61D propioceptiva, sin balón | 97,01% | 1,2618 | Apache 2.0 |
| b2_6250 (referencia MLP) | No disponible | Estado del balón incluido | 99,12% | 0,7574 | No disponible |

No se dispone de información sobre otros modelos comparables de terceros para esta tarea concreta.

## Limitaciones y advertencias

- Política experimental: la simulación y la exportación están verificadas, pero el comportamiento en robot real y los tiempos en placa no se han probado.
- No sube al balón ni se recupera del suelo: debe iniciarse con el robot erguido sobre el ápice, como en el entrenamiento.
- El seguimiento de guiñada y la suavidad de acciones son peores que la referencia con estado del balón (MAE 1,2618 frente a 0,7574; RMS 0,23384 frente a 0,13657).
- Los comandos de entrenamiento son más estrechos (±0,15 m/s avance, ±0,10 m/s lateral, ±0,50 rad/s guiñada) que los de la evaluación de estrés; el rendimiento fuera de ese rango no está garantizado.
- Requiere gestionar correctamente el estado recurrente: inicializar h y c a cero, propagarlos entre pasos y reiniciarlos en activaciones, cambios de política y recuperaciones. Mantener la memoria durante cambios ordinarios de comando.
- Se deben forzar a cero los espacios de comando de cabeza y cuerpo y desactivar filtros opcionales de acción en tiempo de ejecución para un despliegue equivalente al entrenamiento.
- No hay datos publicados sobre sesgos (no aplica en el sentido lingüístico) ni sobre riesgos de alucinación; el riesgo principal es de transferencia sim-to-real no verificada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face (cuenta del autor): https://huggingface.co/jeanesther/microduck-basketball
- Modelo en Hugging Face (cuenta citada en la model card): https://huggingface.co/HannesVonEssen/microduck-basketball
- Árbol de archivos del repositorio: https://huggingface.co/HannesVonEssen/microduck-basketball/tree/main
- Código fuente de entrenamiento: https://github.com/Vottivott/microduck-playground
- Soporte de runtime LSTM (PR #231): https://github.com/pollen-robotics/microduck/pull/231
