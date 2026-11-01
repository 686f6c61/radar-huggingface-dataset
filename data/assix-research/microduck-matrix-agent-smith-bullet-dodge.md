# assix-research/microduck-matrix-agent-smith-bullet-dodge

## Resumen

`agentsmith_dodge` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de sobremesa Microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una red neuronal que lee la propiocepción e IMU del robot a 50 Hz (observación de 61 dimensiones) y emite directamente las consignas de las 14 articulaciones para ejecutar un paso lateral de esquiva, inspirado en el movimiento de los agentes Smith en *The Matrix Reloaded*. Lo publica el usuario `assix-research` bajo licencia Apache-2.0.

El modelo resuelve un problema concreto de locomoción: el Microduck solo tiene articulaciones de tobillo en pitch, sin roll, lo que hace imposible la inclinación lateral que muestra la película. La política descubrió por sí sola que la única forma viable de esquivar era dar un paso, y lo aprendió desde cero sin animación pregrabada. En la verificación final recorrió 0,191 m en una retención de 3 segundos, con cero caídas en lotes de 16 simulaciones con rumbos aleatorizados.

Es relevante como ejemplo de política de habilidad empaquetada según el esquema 2 del manifiesto de políticas de Microduck: un comando constante se inyecta mientras la habilidad está activa y el daemon gestiona la transición de vuelta a la marcha normal. El repositorio es de tamaño 0,0 GB y el formato de pesos es ONNX, con el normalizador de observaciones integrado en el propio fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (perceptrón feed-forward, detalles de capas no disponibles) entrenada con aprendizaje por refuerzo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 (consignas articulares) |
| Frecuencia de control | 50 Hz |
| Tipo de política | Perpetua (se mantiene mientras está activa) |
| Esquema de manifiesto | Schema 2 de Microduck policy manifest |

## Arquitectura y entrenamiento

La política es una red neuronal entrenada desde cero con aprendizaje por refuerzo, no una animación reproducida. Recibe 61 dimensiones de observación (propiocepción e IMU) y emite 14 consignas articulares a 50 Hz. El normalizador de observaciones está integrado en `policy.onnx`, de modo que se alimentan observaciones en bruto. El entrenamiento reutiliza la maquinaria de la tarea de seguimiento de velocidad estándar del Microduck: se clonó la receta base y se restringió el espacio de comandos al sobre de la esquiva, con velocidad frontal casi nula (±0,05 m/s), velocidad lateral completa (±0,30 m/s) y guiñada casi nula (±0,15 rad/s), remuestreando comandos cada 3–5 s para que la política aprendiera arranques y paradas limpias. Los términos de recompensa, currículos, empujones y aleatorización de dominio se heredaron sin cambios.

El diseño inicial intentaba reproducir el latigazo lateral de la película con ambos pies plantados, pero resultó inviable: los tobillos del Microduck solo tienen pitch y carecen de articulación de roll. Tres variantes entrenadas (inclinación mantenida de 12°, inclinación de 8° y una racha de balanceo finita) fallaron sus puertas de verificación. El entrenamiento se detuvo en la meseta: el desplazamiento lateral se estabilizó en 0,18–0,20 m entre los checkpoints 2.000 y 2.500, mientras solo la orientación seguía mejorando, por lo que se publicó el checkpoint 2.500. La política realiza aproximadamente el 25 % de la velocidad comandada (0,25 m/s solicitados, ≈0,065 m/s reales), limitada por un techo de par de ±1,07 Nm y recompensas que penalizan caídas, tropiezos y deslizamiento.

## Capacidades

- Ejecución de un paso lateral de esquiva hacia la derecha (o izquierda invirtiendo el signo del comando) con desplazamiento medido de 0,191 m en 3 s.
- Control de locomoción completo: la política fija las 14 articulaciones del robot a 50 Hz.
- Arranque y parada limpios: deriva máxima de 0,006 m en las fases de pie quieto.
- Robustez direccional: en lotes de 16 simulaciones con rumbos aleatorizados, todas las simulaciones se desplazaron en la dirección comandada, en ambos sentidos, sin caídas en ninguna fase.
- Habilidad perpetua: se mantiene mientras está activa y, al liberarse, el daemon ejecuta `command.idle` (ceros) durante 3,0 s antes de devolver el control a la marcha.
- Integración con el daemon de Microduck mediante `robotctl` y manifiesto schema 2.
- No dispone de generación de texto, razonamiento, código, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Esquiva reactiva en robótica de sobremesa: el robot puede apartarse lateralmente ante un obstáculo o proyectil simulado, con una política que garantiza la dirección y evita caídas en el 100 % de las pruebas por lotes.
- Demostración docente de aprendizaje por refuerzo: sirve para ilustrar cómo una política descubre una solución motora (el paso) cuando la solución intuitiva (la inclinación) está cinemáticamente bloqueada por el hardware.
- Investigación en locomoción con tobillos de un solo eje: el modelo documenta empíricamente los límites de las estrategias de equilibrio con tobillos solo en pitch y proporciona una línea base reproducible.
- Componente de habilidades compuestas: al empaquetarse como habilidad perpetua con comando constante, puede encadenarse con otras políticas de Microduck gestionadas por el daemon para construir secuencias de movimiento.
- Pruebas de robustez y aleatorización de dominio: la receta heredada (empujones, currículos, aleatorización) permite usar el modelo como referencia para evaluar la estabilidad de nuevas políticas bajo perturbaciones.
- Benchmark de eficiencia de políticas ONNX en hardware embebido: al ejecutarse a 50 Hz con observaciones en bruto y normalizador integrado, es útil para medir latencia de inferencia en el controlador del robot.
- Replicación del experimento: el repositorio incluye `replay.mp4` y los comandos exactos de instalación, lo que permite reproducir la verificación de 0,191 m en 3 s.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Desplazamiento lateral en retención de 3 s | 0,191 m (≈0,065 m/s, ≈25 % del comando de 0,25 m/s) |
| Deriva en fases de pie quieto | ≤0,006 m |
| Tasa de caídas en verificación por lotes (16 simulaciones, rumbos aleatorizados) | 0 caídas en todas las fases y en ambos sentidos |
| Precisión direccional | 100 % de las simulaciones en la dirección comandada |
| Techo de par | ±1,07 Nm |
| Frecuencia de control | 50 Hz |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo se ejecuta en el propio robot Microduck o en su simulador; no requiere GPU dedicada para inferencia en producción.
- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y los pesos ONNX son de tamaño reducido (red de 61 entradas y 14 salidas).
- GPU recomendadas: no aplica para despliegue en robot; para entrenamiento o simulación a gran escala se requeriría una GPU compatible con el entorno de simulación de Microduck (modelo concreto no disponible).
- Cabe en cualquier GPU de consumo e incluso en CPU para inferencia, dado el reducido tamaño de la red.
- Opciones de despliegue: `robotctl policy add` con el daemon de Microduck; el formato ONNX permite ejecución con ONNX Runtime.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms); no se publican cifras de latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| agentsmith_dodge | Política RL para Microduck (esquiva lateral) | no disponible | no aplica | 0,191 m en 3 s, 0 caídas en lotes de 16 | Apache-2.0 | HuggingFace |
| Política de marcha estándar de Microduck | Política RL de seguimiento de velocidad | no disponible | no aplica | no disponible | no disponible | Incluida con el robot |
| Otras políticas de la comunidad Microduck | Políticas RL empaquetadas | no disponible | no aplica | no disponible | variable | HuggingFace |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Velocidad real muy inferior a la comandada: solo alcanza ≈25 % de la velocidad solicitada (0,065 m/s frente a 0,25 m/s), por el techo de par de ±1,07 Nm y las penalizaciones de la recompensa.
- El entrenamiento se detuvo en meseta: el desplazamiento lateral no mejoró entre los checkpoints 2.000 y 2.500, por lo que el rendimiento está lejos del máximo teórico.
- Habilidad perpetua de comando constante: no admite comandos variables en tiempo de ejecución; el comando se fija en la instalación (`--command`).
- Solo se ha validado en simulación por lotes; no se documentan pruebas en hardware físico en la información disponible.
- La dirección de la esquiva debe elegirse al instalar la habilidad (signo del comando); no hay selección dinámica.
- Dependencia del ecosistema Microduck (`robotctl`, daemon, manifiesto schema 2); no es portable a otros robots sin reentrenamiento.
- Sin capacidades de lenguaje, visión ni razonamiento; cualquier uso fuera del control locomotor del Microduck no está soportado.
- La imagen de referencia de la película está bajo copyright de Warner Bros. y no queda cubierta por la licencia Apache-2.0 del repositorio.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantías de seguridad para operación con personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/assix-research/microduck-matrix-agent-smith-bullet-dodge
- Replay de la verificación: https://huggingface.co/assix-research/microduck-matrix-agent-smith-bullet-dodge/resolve/main/replay.mp4
- Repositorio de Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Cloudflare (resultado de búsqueda sin relación con el modelo): https://www.cloudflare.com/
