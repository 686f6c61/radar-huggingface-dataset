# RemiFabre/microduck-rough-walk-e

## Resumen

`microduck-rough-walk-e` es una política de control de locomoción para el robot bípedo MicroDuck, desarrollada por RemiFabre y publicada bajo licencia Apache-2.0. Se trata de un modelo de aprendizaje por refuerzo (RL) que, partiendo del checkpoint del modelo base `alpha_walking`, ha sido afinado durante 800 iteraciones en un entorno simulado de terreno hostil (rejillas, pequeñas escaleras, escombros y pendientes). El resultado es una política que mantiene el mismo esquema de comandos de velocidad y el mismo consumo energético que `alpha_walking`, pero reduce a la mitad el número de caídas en terreno irregular (14/110 frente a 32/110) y es capaz de superar pendientes de 6-9° y escombros de hasta ±1,3 cm que el modelo original no lograba.

El modelo se distribuye en formato ONNX (`policy.onnx`) y sigue el contrato de entrada-salida `obs[1,61] f32 → actions[1,14] f32`, con normalizador integrado y una frecuencia de control de 50 Hz. Está diseñado como un reemplazo directo de `alpha_walking` en el robot MicroDuck, aunque la model card advierte explícitamente que nunca ha sido probado en hardware real y que su uso está pensado inicialmente para simulación. Su relevancia radica en que demuestra cómo el fine-tuning de políticas RL sobre terrenos adversos puede mejorar la robustez de la locomoción bípeda sin aumentar el coste energético, un paso clave hacia el despliegue de robots asequibles en entornos no estructurados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal, no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información proporcionada, pero por el contexto se trata de una red neuronal de política (probablemente un perceptrón multicapa) que mapea un vector de observación de 61 valores flotantes (estado del robot, sensores, comandos) a un vector de acción de 14 valores (articulaciones del cuerpo y la cabeza). El modelo opera a 50 Hz y el normalizador de observaciones está integrado en el propio grafo ONNX.

El entrenamiento se realizó mediante fine-tuning de 800 iteraciones sobre un "ladder" de terreno hostil (grid tiles, pequeñas escaleras, escombros, pendientes), partiendo del checkpoint del modelo `alpha_walking` (run `pollen-robotics/hostile-e-finetune-feet-progress-20260830-0103`, resume del checkpoint `model_9999`). No se menciona el uso de RLHF ni DPO; se trata de un ajuste de aprendizaje por refuerzo convencional. La provenance indica que el entrenamiento se ejecutó con el repositorio `pollen-robotics/microduck_rl` en la rama `hostile-terrain` (commit `6cd45fc`), y la exportación se realizó con `scripts/export.py`.

## Capacidades

- Control de locomoción bípeda mediante comandos de velocidad: `twist[0]` (vx, -0.4 a 0.4 m/s), `twist[1]` (vy, -0.3 a 0.3 m/s) y `twist[2]` (wz, -1.0 a 1.0 rad/s).
- Seguimiento de comandos de cabeza (4 articulaciones: neck_pitch, head_pitch, head_yaw, head_roll), aunque en la práctica se envían como ceros.
- Robustez en terreno irregular: cruza pendientes de 6-9°, escombros de ±1,3 cm y reduce las caídas a la mitad respecto a `alpha_walking` (14/110 vs 32/110).
- Consumo energético similar al modelo base: 1,02 W frente a 1,03 W en terreno plano, lo que implica el mismo calentamiento de los servos.
- Respuesta de giro más lineal que `alpha_walking`, aunque con un tope inferior (0,41 rad/s alcanzados para un comando de 1,0 rad/s).
- Funciona como reemplazo directo de `alpha_walking` en el robot MicroDuck, sin cambios en el esquema de comandos ni en el rango de potencia del motor.
- No incluye capacidades de lenguaje, visión, tool calling ni agentes; es exclusivamente una política de control motor.

## Casos de uso

- Simulación de locomoción en entornos hostiles: la política puede ejecutarse en MuJoCo mediante el script `infer_policy.py` del repositorio `microduck_rl`, permitiendo a investigadores evaluar el comportamiento del robot en terrenos con escaleras, escombros y pendientes sin necesidad de hardware físico.
- Despliegue en el robot MicroDuck para navegación en interiores con obstáculos: al ser un drop-in replacement de `alpha_walking`, basta con apuntar el rol `walk` del archivo `robotd.toml` al nuevo `policy.onnx` y reiniciar el servicio. Es adecuado para entornos con alfombras, bordes de moqueta o rampas suaves, aunque se recomienda probar primero en terreno plano.
- Investigación en aprendizaje por refuerzo para robótica: el modelo sirve como punto de partida para estudiar el efecto del fine-tuning en terrenos adversos, comparando métricas como tasa de caídas, consumo energético y capacidad de recuperación ante perturbaciones.
- Benchmarking de políticas de control: al estar disponible en formato ONNX, puede integrarse en pipelines de evaluación automatizada que midan el rendimiento en distintos escenarios simulados (pendientes, escombros, escalones) y compararlo con otras políticas como `alpha_walking`.
- Educación en sim-to-real: el modelo, junto con el repositorio `microduck_rl`, ofrece un caso práctico de transferencia de políticas RL de simulación a un robot real de bajo coste (399 USD), útil para cursos de robótica y aprendizaje automático.
- Pruebas de robustez en control de robots bípedos: la política puede utilizarse para validar algoritmos de estabilización en terrenos irregulares, ya que sus limitaciones documentadas (fallo en escalones descendentes ≥2 cm, recuperación ante empujones débil) permiten identificar fronteras de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. Sin embargo, la model card proporciona métricas de rendimiento específicas para la tarea de locomoción, comparando con el modelo base `alpha_walking`:

| Metrica | `microduck-rough-walk-e` | `alpha_walking` |
|---|---|---|
| Caidas en terreno irregular (110 episodios) | 14 | 32 |
| Consumo de potencia en terreno plano | 1,02 W | 1,03 W |
| Velocidad de giro alcanzada (comando 1,0 rad/s) | 0,41 rad/s | no disponible |
| Velocidad de giro alcanzada (comando 0,5 rad/s) | 0,22 rad/s | no disponible |
| Pendiente maxima superada | 6-9° | no supera (falla) |
| Escombros tolerados | ±1,3 cm | no supera (falla) |

Estos datos provienen de la simulación y no han sido verificados en hardware real.

## Requisitos de hardware

- El modelo es un archivo ONNX de tamaño muy reducido (repo de 0,0 GB), por lo que la inferencia es ligera y no requiere GPU.
- Puede ejecutarse en un portátil convencional para simulación (el script `infer_policy.py` funciona en Linux y macOS con MuJoCo).
- En el robot MicroDuck, se ejecuta en una placa Radxa (probablemente RK3566) con recursos limitados; el modelo está diseñado para correr a 50 Hz en este tipo de hardware embebido.
- No se especifican requisitos de VRAM; al ser un modelo de control pequeño, se puede asumir que cabe en cualquier CPU moderna.
- Opciones de despliegue: integración directa en el robot mediante `robotd.toml`, o ejecución en simulación con MuJoCo. No se mencionan frameworks como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos, pero la frecuencia de control de 50 Hz implica un presupuesto de 20 ms por inferencia, lo que sugiere que el modelo es extremadamente rápido.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `microduck-rough-walk-e` | Politica RL de locomocion | no disponible | no aplica | Apache-2.0 | ONNX en HuggingFace |
| `alpha_walking` (base) | Politica RL de locomocion | no disponible | no aplica | Apache-2.0 | Repositorio `microduck_rl` |
| `microduck-flamingo-cycle` | Politica RL (otra tarea) | no disponible | no aplica | Apache-2.0 | ONNX en HuggingFace |

La comparativa se limita a otros modelos de la misma familia MicroDuck, ya que no se dispone de información sobre alternativas de otros desarrolladores. `microduck-rough-walk-e` se distingue de `alpha_walking` por su robustez en terreno irregular, aunque sacrifica algo de capacidad de giro y recuperación ante empujones. `microduck-flamingo-cycle` parece ser una política para otra tarea (posiblemente un ciclo de marcha diferente), pero no se dispone de detalles.

## Limitaciones y advertencias

- La model card indica explícitamente "Limits (sim only, never run on hardware)" y afirma que el modelo "has never touched hardware". Aunque se proporcionan instrucciones para desplegarlo en el robot, existe un riesgo significativo de comportamiento impredecible en el mundo real; se recomienda encarecidamente probar primero en simulación y en terreno plano.
- Falla al descender escalones de 2 cm o más, lo que limita su uso en entornos con cambios de nivel pronunciados.
- La recuperación ante empujones es más débil que la de `alpha_walking`, por lo que puede ser menos estable ante perturbaciones externas.
- En escombros de aproximadamente 2 cm o más, el robot se detiene en lugar de avanzar, lo que reduce su utilidad en terrenos muy accidentados.
- La respuesta de giro alcanza un máximo de 0,41 rad/s para un comando de 1,0 rad/s, inferior al rendimiento de `alpha_walking` (no cuantificado), lo que puede afectar a maniobras rápidas.
- No se dispone de información sobre sesgos o alucinaciones, ya que no es un modelo generativo de texto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no ha sido validado en hardware real, por lo que cualquier uso en producción debe considerar este riesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RemiFabre/microduck-rough-walk-e
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `hostile-terrain`, commit `6cd45fc`)
- Documentacion de comparticion de politicas: https://github.com/pollen-robotics/microduck_rl/blob/main/docs/sharing-policies.md
- Articulo sobre MicroDuck en CircuitDigest: https://circuitdigest.com/news/this-microduck-robot-based-on-an-rk3566-has-no-arms-but-picks-things-up-using-ai-and-reinforcement-learning
- Articulo en The New Stack: https://thenewstack.io/hugging-face-microduck-robot/
- Articulo en Gadget Review: https://www.gadgetreview.com/hugging-faces-399-robot-duck-bets-on-crowdsourced-ai
- Perfil del autor en HuggingFace: https://huggingface.co/RemiFabre
