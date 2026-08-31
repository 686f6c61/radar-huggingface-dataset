# RemiFabre/microduck-rough-walk-g

## Resumen

`microduck-rough-walk-g` es una política de control de caminata para el robot bípedo MicroDuck, desarrollada por Remi Fabre en el contexto del proyecto colaborativo entre Hugging Face y Pollen Robotics. Se trata de un modelo de aprendizaje por refuerzo (RL) entrenado desde cero sobre un terreno irregular con escalones y pendientes, exportado a formato ONNX para su ejecución a 50 Hz en el robot. Su propósito es permitir que el MicroDuck camine siguiendo comandos de velocidad lineal y angular, con especial robustez en obstáculos discretos como escalones de 2 cm y pendientes de 9 grados.

El modelo forma parte de una familia de políticas para MicroDuck, donde destaca por ser el más resistente en terreno accidentado, aunque a costa de un mayor consumo de potencia en los servomotores (+17 % respecto a la política de referencia `alpha_walking`). Está diseñado para ejecutarse en simulación o en el robot real, pero el autor advierte explícitamente que solo debe usarse en simulación y que la transferencia sim-to-real no está tan validada como en políticas ajustadas a partir de la original. La arquitectura interna no se detalla en la información disponible, pero se sabe que el contrato de entrada es un vector de observación de 61 valores y la salida son 14 acciones, con un normalizador integrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de política, formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de control en tiempo real, sin contexto secuencial) |
| Tipos de cuantizacion | no disponible (exportado a ONNX, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (modelo de control, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo `policy.onnx`) |

## Arquitectura y entrenamiento

La información publicada no especifica la arquitectura interna de la red neuronal (número de capas, tipo de capas, etc.). Se sabe que es una política de control entrenada mediante aprendizaje por refuerzo con el entorno MuJoCo, utilizando el framework `microduck_rl` de Pollen Robotics. El entrenamiento se realizó desde cero (no como fine-tuning de una política existente) sobre una "escalera" de terreno irregular, con 2500 iteraciones iniciales más 800 iteraciones de continuación, totalizando 3300 iteraciones. El proceso se registró en Weights & Biases con el identificador `lyr06dji` y la ejecución `pollen-robotics/hostile-g-continue-c-20260830-0630`. El modelo se exportó con el script `scripts/export.py` del repositorio `microduck_rl` en la rama `hostile-terrain` (commit `6cd45fc`).

El contrato de entrada es `obs[1,61] f32` (61 observaciones en punto flotante de 32 bits) y la salida es `actions[1,14] f32` (14 acciones). El normalizador está integrado en el modelo. La frecuencia de control es de 50 Hz. Los comandos se introducen mediante un bloque de 13 dimensiones (twist slots), donde los tres primeros slots corresponden a velocidad lineal en x (rango -0.4 a 0.4 m/s), velocidad lateral en y (rango -0.3 a 0.3 m/s) y velocidad angular en z (rango -1.0 a 1.0 rad/s). Los comandos de cabeza se rastrean pero no se utilizan (ceros).

## Capacidades

- Caminata con comandos de velocidad: acepta comandos de velocidad lineal (adelante/atrás, lateral) y velocidad angular (giro) en tiempo real.
- Robustez en terreno irregular: entrenado específicamente para escalones pequeños (2 cm) y pendientes de hasta 9 grados, mostrando mayor estabilidad que la política de referencia.
- Operación en tiempo real: ejecuta a 50 Hz, adecuado para control de robot en bucle cerrado.
- Formato ONNX: portable y ejecutable en el robot (RK3566) o en simulación con MuJoCo.
- Integración con el ecosistema MicroDuck: compatible con el sistema de políticas de `microduck_rl` y con la configuración de `robotd.toml` para despliegue en el robot.
- No es un modelo de lenguaje ni de visión: sus capacidades se limitan al control motor.

## Casos de uso

- Pruebas de robustez en simulación: investigadores pueden evaluar la política en entornos MuJoCo con obstáculos discretos (escalones, pendientes) para comparar su estabilidad frente a otras políticas de la familia MicroDuck.
- Desarrollo de algoritmos de control para robots bípedos de bajo coste: el modelo sirve como referencia para estudiar políticas entrenadas desde cero en terreno irregular, sin necesidad de hardware físico.
- Benchmarking de transferencia sim-to-real: aunque el autor advierte que la transferencia no está tan validada, el modelo puede usarse para estudiar la brecha sim-to-real en políticas de RL para robots pequeños.
- Educación en robótica y RL: como parte del proyecto MicroDuck, permite a estudiantes y desarrolladores experimentar con políticas de caminata en un robot de 399 dólares, usando el flujo de trabajo de `microduck_rl`.
- Evaluación de consumo energético: al tener un mayor consumo de potencia (+17 %), es útil para estudiar el equilibrio entre robustez y eficiencia energética en políticas de control.
- Comparación de estrategias de entrenamiento: al ser un entrenamiento desde cero, puede compararse con políticas ajustadas a partir de la original para analizar diferencias en rendimiento y transferibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje. Los datos de rendimiento disponibles se refieren a pruebas en simulación:

| Metrica | Valor |
|---|---|
| Caidas en bateria de terreno irregular (rough-ground battery) | 12 de 110 (frente a 32 de 110 de `alpha_walking`) |
| Supervivencia en escalones de 2 cm | Sí (única política de la familia que lo logra en comparación sincronizada) |
| Supervivencia en pendiente de 9 grados | Sí (única política de la familia que lo logra) |
| Potencia media en terreno plano | 1.21 W (frente a 1.03 W de `alpha_walking`, +17 %) |
| Velocidad angular alcanzada para comando de 1.0 rad/s | ~0.29 rad/s (respuesta de giro débil) |
| Parada en escombros | Se detiene con escombros de aproximadamente 1.5 cm o más |

Estos datos provienen de la model card del autor y de la comparación sincronizada mencionada en la misma.

## Requisitos de hardware

- El modelo es un archivo ONNX de tamaño muy reducido (el repositorio indica 0.0 GB, probablemente menos de 1 MB), por lo que no requiere GPU para inferencia.
- Puede ejecutarse en la CPU del robot MicroDuck, que utiliza un procesador RK3566 (SoC ARM de bajo consumo).
- En simulación, se ejecuta con MuJoCo en un portátil convencional, sin necesidad de hardware especializado.
- No se dispone de datos de VRAM, latencia o throughput específicos, pero al ser una red pequeña y a 50 Hz, se espera que la inferencia sea trivial en cualquier hardware moderno.
- Opciones de despliegue: el flujo oficial usa `scripts/infer_policy.py` del repositorio `microduck_rl` para simulación, y la configuración de `robotd.toml` para el robot real. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia de modelos de lenguaje, ya que no es un LLM.

## Comparativa con modelos similares

No se dispone de información detallada sobre otros modelos de la familia MicroDuck (como `alpha_walking` o `microduck-flamingo-cycle`) en cuanto a parámetros, arquitectura o contexto. La única comparación cuantitativa disponible es la que aparece en la model card:

| Modelo | Caidas en terreno irregular (110 pruebas) | Potencia en plano | Respuesta de giro |
|---|---|---|---|
| `microduck-rough-walk-g` | 12 | 1.21 W | ~0.29 rad/s para comando 1.0 |
| `alpha_walking` (referencia) | 32 | 1.03 W | no disponible |

No se dispone de datos de otros modelos comparables fuera de la familia MicroDuck.

## Limitaciones y advertencias

- El autor indica explícitamente: "Limits (sim only, never run on hardware)" — el modelo solo debe usarse en simulación, no en el robot real, debido a que es un entrenamiento desde cero y su transferencia sim-to-real no está suficientemente validada.
- Consumo de potencia elevado: +17 % de potencia en los servomotores respecto a `alpha_walking`, lo que puede provocar sobrecalentamiento en uso sostenido. Se recomienda vigilar la temperatura de los servos.
- Respuesta de giro débil: para un comando de 1.0 rad/s, solo alcanza ~0.29 rad/s, lo que limita su maniobrabilidad en espacios reducidos.
- Se detiene en escombros de aproximadamente 1.5 cm o más, por lo que no es adecuado para terrenos con obstáculos mayores.
- Al ser un modelo de control, no tiene capacidades de lenguaje, visión ni razonamiento simbólico.
- No se dispone de información sobre sesgos, alucinaciones u otros riesgos típicos de modelos de lenguaje, ya que no aplican.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda no usarlo en hardware real, lo que limita su aplicabilidad práctica en productos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RemiFabre/microduck-rough-walk-g
- Repositorio de entrenamiento (rama `hostile-terrain`): https://github.com/pollen-robotics/microduck_rl (commit `6cd45fc`)
- Documentación de compartición de políticas: https://github.com/pollen-robotics/microduck_rl/blob/main/docs/sharing-policies.md
- Artículo sobre MicroDuck (contexto del proyecto): https://www.explainx.ai/blog/microduck-hugging-face-399-open-source-rl-robot-august-2026
- Noticia sobre MicroDuck en Circuit Digest: https://circuitdigest.com/news/this-microduck-robot-based-on-an-rk3566-has-no-arms-but-picks-things-up-using-ai-and-reinforcement-learning
