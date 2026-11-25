# dollhouserobotics/G1-25-DOF-GPC

## Resumen

G1-25-DOF-GPC (Generative Pretrained Controller) es un conjunto de políticas de control para el robot humanoide Unitree G1, desarrollado por Dollhouse Robotics. No es un modelo de lenguaje: es una pila de control motor aprendida por refuerzo que combina un rastreador de movimiento (Stage 1), un prior generativo autorregresivo sobre el espacio de latentes del rastreador (Stage 2) y una serie de adaptadores de tarea (CoLAs) entrenados sobre el prior congelado. El objetivo es dotar al G1 de 25 grados de libertad de locomoción y habilidades motrices (caminar, agacharse, tumbarse, caer de forma segura) a partir de datos de movimiento humano retargeteado.

El modelo se entrenó en MJLab (MuJoCo Warp) sobre una única GPU RTX 5090 entre el 21 y el 22 de noviembre de 2026, lo que lo convierte en una demostración de entrenamiento rápido de políticas humanoides. El repositorio publica todos los artefactos de una ejecución: checkpoints nativos en PyTorch, exportaciones ONNX (interfaz soportada), configuraciones, métricas de entrenamiento y bundles para visualización en navegador.

Es relevante para investigadores en robótica y aprendizaje por refuerzo porque muestra un pipeline completo de "modelo generativo como prior motor" con adaptadores ligeros por tarea, y porque publica la interfaz ONNX con detalle de observaciones, acciones y ganancias PD, lo que facilita la reproducibilidad en simulación. El tamaño del repositorio (59,5 GB) refleja la inclusión de todos los checkpoints y grabaciones, no el tamaño de un único modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline RL: Stage 1 rastreador (estilo SuperMimic, cuello de botella FSQ de 16 escalares); Stage 2 prior transformer autorregresivo (ancho 1024, 3 capas, 8 cabezas) sobre codigos FSQ; CoLAs como adaptadores de tarea |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje); historial de observacion de 10 frames de 81 valores |
| Tipos de cuantizacion | no disponible (exportaciones ONNX en fp32, opset 18) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32, opset 18), PyTorch nativo (.pt), bundle Miniverse (.mini) |

## Arquitectura y entrenamiento

El sistema se organiza en tres etapas. La Stage 1 es un rastreador de movimiento entrenado al estilo SuperMimic, con un cuello de botella de cuantización escalar finita (FSQ) de 16 escalares que comprime el movimiento de referencia en códigos discretos. La Stage 2 es un prior generativo: un transformer de ancho 1024, 3 capas y 8 cabezas que hace predicción de siguiente token sobre los códigos FSQ del rastreador, aprendiendo la distribución de movimientos plausibles. Sobre el prior congelado se entrenan adaptadores CoLA (joystick, get-down, crouch, safe-fall) que condicionan la generación a una tarea concreta. Además, hay un modelo de movimiento de cabeza separado (MLP sobre el historial del cuerpo).

Los datos de entrenamiento consisten en unas 55,8 horas de movimiento humano retargeteado (24.467 clips, incluyendo copias espejadas) provenientes de cuatro conjuntos privados de Dollhouse construidos a partir de BONES-SEED y capturas propias de incorporación desde el suelo: `dollhouse-g1-bones-15hrs-basic` (15,6 h), `dollhouse-g1-bones-advanced` (24,4 h), `dollhouse-g1-bones-floor` (15,6 h) y `dollhouse-g1-getups` (0,2 h). Los datos de movimiento no se distribuyen. Todo el entrenamiento se realizó en una RTX 5090; los resultados publicados son de simulación.

La interfaz soportada son los grafos ONNX, que se ejecutan en el proveedor CPU de ONNX Runtime. La política corre a 50 Hz mientras la simulación lo hace a 200 Hz, manteniendo la acción durante 4 pasos físicos. El control es de posición por articulación con PD: el objetivo es `default_q + action_scale × action`, con acciones recortadas a ±5. Las observaciones incluyen `robot_state` [1,67] (posición de pelvis, cuaternión WXYZ, velocidad lineal mundial, velocidad angular, 27 posiciones y 27 velocidades articulares) y un historial de 10 frames de 81 valores (25 offsets de posición, 25 velocidades, giroscopio, gravedad proyectada y acción previa). Los CoLAs get-down y safe-fall usan altura y velocidad de pelvis que en entrenamiento provenían del simulador, por lo que en hardware requieren una estimación de estado.

## Capacidades

- Control de locomoción del Unitree G1 con 25 articulaciones: 12 de piernas (cadera pitch/roll/yaw, rodilla, tobillo pitch/roll), 3 de cintura (yaw/roll/pitch) y 10 de brazos (hombro pitch/roll/yaw, codo, muñeca roll).
- Rastreo de movimiento humano retargeteado mediante el rastreador Stage 1 (99,8% de éxito de rastreo en evaluación de entrenamiento; 94,3% de paso en una comprobación de calidad de contacto sobre 1.079 ventanas).
- Generación de movimiento libre mediante el prior Stage 2, con recuperación de empujones de 9,8 m/s en el 76% de los casos.
- Control por joystick de velocidad de marcha y dirección de orientación (CoLA joystick).
- Habilidad de tumbarse boca arriba con bajo impacto (CoLA get-down: 99,7% de éxito, fuerza pico contra el suelo de 1,44 kN).
- Habilidad de agacharse (CoLA crouch: 99,2% de éxito, pelvis a 0,53 m).
- Caída segura (CoLA safe-fall: se tumba en todas las evaluaciones, fuerza pico de 1,82 kN).
- Modelo opcional de movimiento de cabeza (MLP desde el historial del cuerpo).
- Interfaz ONNX con entradas y salidas documentadas para integración en controladores externos.
- No soporta tool calling, agentes, ni capacidades de lenguaje, visión o audio: es exclusivamente un controlador motor.

## Casos de uso

- Investigación en aprendizaje por refuerzo para humanoides: el repositorio publica todos los artefactos de una ejecución (checkpoints, métricas, configuraciones), lo que permite reproducir el pipeline de Stage 1 + Stage 2 + CoLA y estudiar el efecto del prior generativo sobre el rastreador.
- Desarrollo de controladores de locomoción en simulación: los grafos ONNX se ejecutan en CPU con ONNX Runtime, de modo que se pueden integrar en bucles de control a 50 Hz dentro de MuJoCo u otros simuladores para probar políticas antes de tocar hardware.
- Entrenamiento de adaptadores de tarea ligeros: sobre el prior congelado se pueden entrenar nuevos CoLAs para tareas específicas (por ejemplo, sentarse, gatear o alcanzar posturas), reutilizando el prior y reduciendo el coste de entrenamiento.
- Pruebas de seguridad y recuperación ante caídas: los CoLAs get-down y safe-fall permiten estudiar estrategias de bajo impacto (fuerzas pico de 1,44 y 1,82 kN) y validar protocolos de parada de emergencia en simulación.
- Control teleoperado o por joystick en entornos simulados: el CoLA joystick permite comandar velocidad y orientación, útil para generar demostraciones o evaluar la respuesta del robot a consignas de alto nivel.
- Benchmarking de pipelines de entrenamiento rápido: al haberse entrenado en una sola RTX 5090 en aproximadamente un día, sirve como referencia para comparar coste y calidad de políticas humanoides entrenadas con datos de movimiento retargeteado.
- Visualización e inspección en navegador: el bundle `base.mini` de Miniverse permite ejecutar la política en un visor web para inspección cualitativa del comportamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card, todos en simulación:

| Modelo | Metrica | Resultado |
|---|---|---|
| Stage 1 tracker | Exito de rastreo (evaluacion de entrenamiento) | 99,8% |
| Stage 1 tracker | Paso en comprobacion de calidad de contacto (1.079 ventanas) | 94,3% |
| Stage 2 prior | Episodios con caida o atasco en marcha libre | 4,3% |
| Stage 2 prior | Recuperacion tras empujon de 9,8 m/s | 76% |
| CoLA joystick | Marcha a velocidad y orientacion comandadas | cualitativo (sin cifra) |
| CoLA get-down | Exito tumbado boca arriba | 99,7% |
| CoLA get-down | Fuerza pico contra el suelo | 1,44 kN |
| CoLA crouch | Exito | 99,2% |
| CoLA crouch | Altura de pelvis | 0,53 m |
| CoLA safe-fall | Tumbado en todas las evaluaciones | si |
| CoLA safe-fall | Fuerza pico contra el suelo | 1,82 kN |

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los grafos ONNX son fp32 y se ejecutan en CPU con ONNX Runtime, por lo que la inferencia no requiere GPU. El coste de memoria depende del tamaño de los grafos, no publicado.
- GPU recomendadas para inferencia: no aplica estrictamente; cualquier CPU capaz de ejecutar ONNX Runtime a 50 Hz. Para entrenamiento, el autor usó una única RTX 5090.
- Cabe en GPU consumer: sí para entrenamiento (RTX 5090) e inferencia (CPU o GPU consumer).
- Opciones de despliegue: ONNX Runtime (proveedor CPU soportado), PyTorch nativo (.pt), bundle Miniverse (.mini) para visor en navegador.
- Latencia y throughput: la política corre a 50 Hz; la simulación a 200 Hz con la acción mantenida 4 pasos físicos. No se publican cifras de latencia por llamada ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G1-25-DOF-GPC (Dollhouse Robotics) | Pipeline RL + prior generativo para Unitree G1 | no disponible | no aplica | Apache 2.0 | Hugging Face (ONNX, PyTorch, Miniverse) |
| Alternativas de control de humanoides | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Sin garantía para uso en robot real: el autor declara explícitamente que los modelos se ofrecen "tal cual", sin garantía de comportamiento en hardware físico. Una política aprendida puede moverse de forma súbita, caer y causar lesiones graves o daños.
- Requiere pruebas en simulación antes de desplegar, mantener personas alejadas del robot, usar grúa o arnés, tener una parada de emergencia al alcance y empezar con ganancias y límites de par reducidos.
- El robot se entrenó como variante de Dollhouse con cabeza de dos articulaciones; la cabeza se mantiene a cero y la interfaz ONNX no tiene entradas de cabeza. En un G1 estándar de 29 DoF, las articulaciones de muñeca pitch y yaw (cuatro en total) no forman parte de la política y deben mantenerse a cero o fijarse.
- Los CoLAs get-down y safe-fall dependen de altura y velocidad de pelvis que en entrenamiento provenían del simulador; en hardware necesitan una estimación de estado, lo que introduce dependencia de la percepción.
- Los datos de movimiento no se distribuyen, lo que limita la reproducción completa del entrenamiento.
- Los resultados publicados son de simulación; no hay validación en robot físico reportada.
- Las ganancias PD, escalas de acción y postura por defecto provienen del modelo del robot y del código de entrenamiento; deben identificarse en el hardware propio antes de confiar en ellas.
- No es un modelo de lenguaje: no tiene capacidades de texto, código, visión, audio, tool calling ni razonamiento multi-paso.
- Sesgos y riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es que la política genere movimientos no previstos o inestables fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantía y los riesgos físicos deben evaluarse antes de cualquier despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dollhouserobotics/G1-25-DOF-GPC
- Articulo del autor (SuperGPC): https://www.dollhouserobots.com/posts/super-gpc
- Repositorio de codigo de entrenamiento: https://github.com/DollhouseRobotics/super-gpc
- Video de previsualizacion: https://huggingface.co/dollhouserobotics/G1-25-DOF-GPC/resolve/main/assets/supergpc-preview.mp4
