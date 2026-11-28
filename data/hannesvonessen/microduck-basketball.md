# HannesVonEssen/microduck-basketball

## Resumen

microduck-basketball es una política de control robótico entrenada mediante aprendizaje por refuerzo para que el robot bípedo Microduck de Pollen Robotics se mantenga en equilibrio sobre un balón de baloncesto de talla 7 que rueda libremente, siguiendo comandos de velocidad. Lo desarrolla HannesVonEssen y se publica bajo licencia Apache 2.0 en Hugging Face. El problema que resuelve es el control de balance sobre una superficie no planar y sin estado observable del balón: el actor solo recibe propiocepción (giroscopio, gravedad proyectada, posiciones y velocidades articulares, acciones previas y comandos de velocidad), sin ninguna medición de la posición o dinámica del balón.

La innovación principal es el uso de una capa LSTM de 256 unidades como memoria recurrente del actor, que permite inferir la dinámica oculta de contacto con el balón a partir del historial de propiocepción. La política tiene aproximadamente 624.000 parámetros y se distribuye como ONNX float32 con interfaz recurrente (estados h y c de 256 dimensiones) a 50 Hz. El checkpoint liberado es b11, iteración 6.999.

Es relevante ahora porque demuestra que una política recurrente ciega al estado del objeto puede acercarse al rendimiento de una política con acceso privilegiado al estado del balón (98,86 % vs 99,67 % de supervivencia a 20 s), y porque incluye el checkpoint completo de entrenamiento, configuración y validación de exportación, lo que facilita la reproducibilidad. No obstante, el propio autor la etiqueta como experimental para pruebas de hardware: la latencia en placa y el comportamiento en robot real no están verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor LSTM(256) + MLP ELU(512, 256, 128) + salida de 14 acciones; crítico privilegiado solo en entrenamiento |
| Parametros totales | Aproximadamente 624.000 (actor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 dimensiones por paso a 50 Hz con estado recurrente persistente |
| Tipos de cuantizacion | No disponible (se distribuye ONNX float32) |
| Idiomas soportados | No aplica (política de control robótico, sin entrada o salida de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (policy.onnx) y checkpoint PyTorch (checkpoint.pt) |

## Arquitectura y entrenamiento

La política es un actor recurrente que procesa una observación normalizada de 61 dimensiones compuesta por: giroscopio del cuerpo (índices 0:3), gravedad proyectada (3:6), posiciones articulares en la convención habitual del runtime (6:20), velocidades articulares (20:34), las 14 acciones previas de la política (34:48), comandos de velocidad forward, lateral y yaw (48:51), y padding de comandos de cabeza y cuerpo a cero (51:61). Es destacable que los índices 55:61 correspondientes al estado del balón están a cero: el actor es ciego al balón. La observación alimenta una LSTM de 256 unidades cuya salida pasa por un MLP con activación ELU de dimensiones 512, 256 y 128, que produce 14 acciones. La normalización de observaciones está incluida en el propio ONNX.

El entrenamiento se realizó en simulación con mjlab (entorno basado en MuJoCo), con un crítico privilegiado que sí observa el balón y que no forma parte del ONNX exportado. El coeficiente de recompensa de tasa de acción fue de −0,2, penalizando el cuadrado de los cambios de acción durante el aprendizaje; no se usó filtro low-pass de acciones. La política b11 se entrenó en continuación con comandos de ±0,15 m/s forward, ±0,10 m/s lateral y ±0,50 rad/s de yaw, aunque la evaluación usa comandos más amplios (±0,30 m/s, ±0,20 m/s y ±1,0 rad/s) como prueba de estrés. El checkpoint incluye actor, crítico, normalizadores, estado del optimizador Adam y contador de iteración/currículo; al reanudar se restauran los estados aprendidos pero se inician episodios simulados nuevos.

## Capacidades

- Control de balance sobre un balón de talla 7 que rueda libremente, partiendo de la posición upright sobre el ápice del balón.
- Seguimiento de comandos de velocidad: forward, lateral y yaw, con comando [0,0,0] como equilibrio en el sitio.
- Estimación implícita de la dinámica de contacto del balón mediante memoria recurrente LSTM a partir de propiocepción, sin cámara ni tracker del balón.
- Robustez ante perturbaciones de velocidad horizontal de base de ±0,09 m/s aplicadas cada 0,5–1 s, sin empujes angulares.
- Interfaz ONNX recurrente con estados h_in/c_in y h_out/c_out de [1,1,256], pensada para ejecución a 50 Hz con propagación de estado entre pasos.
- No incluye capacidades de lenguaje, visión, tool calling, agentes, matemáticas ni multilingüismo: es exclusivamente una política de control motor.
- No es capaz de subirse al balón ni de recuperarse del suelo por sí misma.

## Casos de uso

- Pruebas de equilibrio dinámico en robot real: desplegar la política sobre el Microduck físico para validar si el control recurrente ciego al balón transfiere desde simulación, usando el ejemplo `policy-rehearsal` del runtime PR #231 para verificar el presupuesto de control de 20 ms antes de activar motores.
- Investigación en control sin estado observable: servir como referencia para estudiar hasta qué punto una LSTM puede sustituir la medición directa de un objeto en contacto, comparando contra la política MLP con estado del balón (b2_6250).
- Benchmark de robustez ante perturbaciones: reproducir la evaluación de 1.024 entornos por semilla con disturbios de ±0,09 m/s cada 0,5–1 s para medir supervivencia a 20 s y 60 s en distintos seeds.
- Desarrollo de runtimes recurrentes para robótica: validar cargadores ONNX con soporte LSTM (estados h/c persistentes, reinicio en cambios de política y recuperación) en Rust o Python, usando la comparación de 80 pasos incluida como referencia de paridad.
- Docencia y divulgación en RL aplicado a robótica: el repositorio incluye vídeo de 30 s, configuración de entorno y agente en YAML, checkpoint completo y validación de exportación, lo que permite reproducir el pipeline de entrenamiento con `uv sync --locked`.
- Continuación de entrenamiento y ajuste fino: reanudar desde checkpoint.pt (con estado de Adam y contador de currículo) para ampliar el rango de comandos o añadir nuevas tareas de equilibrio sobre objetos.
- Análisis de suavidad de acciones: usar la métrica de RMS de cambio de acción (0,23384 frente a 0,13657 de la referencia) para estudiar el compromiso entre precisión de giro y suavidad en políticas recurrentes.

## Benchmarks y rendimiento

Evaluación emparejada: 1.024 entornos por semilla (101, 202, 303), 3.072 ensayos por política, 60 segundos, primera caída cuenta como fallo. Comandos de ±0,30 m/s forward, ±0,20 m/s lateral y ±1,0 rad/s yaw; disturbios que reinician la velocidad horizontal de base en ±0,09 m/s cada 0,5–1 s, sin empujes angulares.

| Política | Supervivencia 20 s | Supervivencia 60 s | MAE de seguimiento de yaw (rad/s) | RMS de cambio de acción |
|---|---:|---:|---:|---:|
| b11_6999 LSTM ciega | 98,86 % | 97,01 % | 1,2618 | 0,23384 |
| b2_6250 MLP con estado del balón (referencia) | 99,67 % | 99,12 % | 0,7574 | 0,13657 |

b11 sobrevive 2.980/3.072 ensayos; la referencia sobrevive 3.045/3.072. Las métricas de seguimiento y de acción excluyen las muestras en y posteriores al primer fallo, por lo que están condicionadas a la supervivencia. Los resultados no establecen igual calidad de movimiento ni transferencia al robot real. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el actor tiene aproximadamente 624.000 parámetros en float32 (unos 2,5 MB de pesos) más los estados recurrentes de 256 dimensiones. Cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; dada la carga computacional, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada. El cuello de botella es la latencia de control, no el cómputo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer; también es viable en CPU y potencialmente en el ordenador de a bordo del robot.
- Opciones de despliegue: ONNX Runtime (comparación de 80 pasos en Rust y Python verificada en el host de desarrollo), con soporte recurrente en el runtime PR #231 de pollen-robotics/microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput: la política debe ejecutarse a 50 Hz (presupuesto de control de 20 ms). La latencia en placa no está medida; el autor recomienda ejecutar el ejemplo `policy-rehearsal` en el ordenador del robot para verificarla antes del despliegue en motores.
- Precisión de exportación: comparación PyTorch/ONNX de 40 pasos con reset, error absoluto máximo de acción de 1,43e-6; comparación ONNX Rust/Python de 80 pasos con reset, coincidencia exacta en el host de desarrollo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada de estado del balón | Supervivencia 60 s | MAE yaw (rad/s) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| microduck-basketball b11_6999 | ~624.000 | No | 97,01 % | 1,2618 | Apache 2.0 | Hugging Face (ONNX + checkpoint) |
| microduck-basketball b2_6250 (referencia MLP) | No disponible | Sí | 99,12 % | 0,7574 | No disponible | Referencia interna del autor, no publicada como modelo independiente |
| Otras políticas de balance para Microduck | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otras políticas comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Política experimental: la simulación y las comprobaciones de exportación pasaron, pero el timing a bordo y el comportamiento en robot real no están probados.
- Requiere soporte de runtime recurrente (PR #231 o equivalente); el cargador feedforward existente no es suficiente.
- Debe publicarse e instalarse con `model_api: 2`.
- Arranque obligatorio con el robot apoyado en upright sobre el ápice del balón, como en entrenamiento; la política no sube al balón ni se recupera del suelo.
- Los slots de comandos de cabeza y cuerpo deben forzarse a cero.
- No usar filtros low-pass de acción en runtime si se busca un despliegue equivalente al entrenamiento; el entrenamiento no los usó.
- Precisión de giro y suavidad de acción peores que la referencia con estado del balón (MAE de yaw 1,2618 frente a 0,7574; RMS de cambio de acción 0,23384 frente a 0,13657).
- Los comandos de entrenamiento de b11 fueron más estrechos (±0,15 m/s forward, ±0,10 m/s lateral, ±0,50 rad/s yaw) que los de la evaluación; el rendimiento con comandos amplios es una prueba de estrés, no el régimen entrenado.
- Las métricas de seguimiento están condicionadas a la supervivencia y no demuestran transferencia ni igual calidad de movimiento.
- Riesgo de sesgo y alucinación no aplica en el sentido de modelos de lenguaje; el riesgo análogo es el fallo de control (caída) ante condiciones fuera de distribución, como empujes angulares o superficies distintas del balón.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la ausencia de validación en hardware desaconsejan su uso en producción sin verificación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannesVonEssen/microduck-basketball
- Código fuente de entrenamiento: https://github.com/Vottivott/microduck-playground
- Soporte de runtime LSTM (PR #231): https://github.com/pollen-robotics/microduck/pull/231
- Vídeo de simulación de 30 segundos: replay.mp4 (en el repositorio de Hugging Face)
- Visor de arquitectura: https://hfviewer.com/HannesVonEssen/microduck-basketball
