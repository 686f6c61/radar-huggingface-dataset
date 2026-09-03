# Flashkernel/3dwm-franka-pickplace-mppi

## Resumen

El modelo `Flashkernel/3dwm-franka-pickplace-mppi` es un world model tridimensional basado en nubes de puntos, desarrollado por Flashkernel (Liang Ji), diseñado específicamente para la planificación de movimientos de un brazo robótico Franka en el entorno MuJoCo `FrankaPickPlace3D-o1`. El modelo predice la siguiente nube de puntos de cada parte del objeto y la escena, y se utiliza en un esquema de control predictivo por modelo (MPPI) en bucle cerrado, sin entrenar ninguna política explícita: el planificador es el controlador.

Con 16,65 millones de parámetros y un peso de 200 MB, este checkpoint (época 28 de un entrenamiento de 60) fue seleccionado por ofrecer el mejor rendimiento para planificación, a pesar de ser un punto intermedio del entrenamiento. El modelo se entrenó sobre 1000 demostraciones (109 084 frames) del dataset `Franka-pickplace-1000demos-v2`, y está diseñado para tareas de alcanzar, agarrar, transportar y colocar un cubo. Su relevancia radica en demostrar que un world model compacto puede guiar un planificador MPPI sin necesidad de redes de política complejas.

La licencia MIT permite uso comercial y modificación sin restricciones significativas, aunque el modelo está fuertemente acoplado a una versión concreta del entorno `kindergarden`, lo que limita su portabilidad directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PTv3 (Point Transformer v3) encoder/decoder, world model autoregresivo |
| Parametros totales | 16,65 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa nubes de puntos, no secuencias de texto) |
| Tipos de cuantizacion | No disponible (checkpoint en formato PyTorch, probablemente float32) |
| Idiomas soportados | No disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pt`) |

## Arquitectura y entrenamiento

El modelo emplea un encoder-decoder basado en Point Transformer v3 (PTv3), una arquitectura diseñada para procesar nubes de puntos. Con `multi_frame_num=2`, el modelo recibe dos frames consecutivos de la nube de puntos y produce la predicción del siguiente frame. El entrenamiento es autoregresivo con una longitud de rollout de 10 pasos, lo que obliga a que el horizonte del planificador MPPI coincida con ese valor. Se usan 7 canales de acción, que corresponden a los grados de libertad del brazo Franka (incluida la pinza).

El dataset de entrenamiento consta de 1000 demostraciones generadas en el entorno `kindergarden` (commit `1d0cc56`), con un total de 109 084 frames. El optimizador fue AdamW con tasa de aprendizaje 1e-4 y un programador StepLR con hitos en las épocas 10 y 20. Se entrenaron 60 épocas en total, pero la época 28 resultó ser la mejor para planificación; las épocas posteriores no mejoraron el rendimiento. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es puramente supervisado sobre las demostraciones.

Una característica destacable es que no se entrena ninguna política: el controlador es el planificador MPPI, que puntúa secuencias de acciones muestreadas aleatoriamente rodando el world model hacia adelante. Esto simplifica el pipeline y demuestra la viabilidad de usar world models como sustitutos del entorno para planificación en bucle cerrado.

## Capacidades

- Predicción de nubes de puntos del siguiente paso para cada parte del objeto y la escena.
- Planificación de movimientos de manipulación robótica: alcanzar, agarrar, transportar y colocar un cubo.
- Control en bucle cerrado mediante MPPI, sin necesidad de política entrenada.
- Soporte para entornos MuJoCo a través de la librería `kindergarden`.
- Entrenamiento reanudable: el checkpoint incluye el estado del optimizador.
- No incluye capacidades de lenguaje natural, tool calling, visión general ni razonamiento simbólico; está especializado exclusivamente en la tarea de pick-and-place con nubes de puntos.

## Casos de uso

- **Planificación de movimientos en robótica de manipulación**: el modelo puede integrarse en un sistema de control predictivo para generar trayectorias de agarre y colocación de objetos en entornos simulados, reduciendo la necesidad de modelos dinámicos analíticos.
- **Sustitución de simulador en bucle cerrado**: al predecir la evolución de la nube de puntos, puede reemplazar al simulador MuJoCo en el bucle de planificación, acelerando la evaluación de secuencias de acciones.
- **Investigación en world models para robótica**: sirve como punto de partida para estudiar cómo los world models basados en nubes de puntos pueden escalar a tareas más complejas o a entornos con más objetos.
- **Generación de datos sintéticos**: las predicciones del modelo podrían utilizarse para aumentar datasets de entrenamiento de políticas, aunque requeriría validación adicional.
- **Despliegue en sistemas embebidos**: su tamaño reducido (200 MB, 16 M de parámetros) permite ejecutarlo en hardware con recursos limitados, como ordenadores de a bordo en robots reales.
- **Reproducción de experimentos**: el checkpoint está publicado con metadatos de entrenamiento completos (época, optimizador, dataset), lo que facilita la reproducción de los resultados descritos en la guía de reproducción del repositorio de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM. La model card indica que, en 15 semillas aleatorias, el checkpoint coloca el cubo correctamente en 15 de 15 episodios. No se proporcionan métricas adicionales como tasa de éxito por etapa (reach, grasp, carry, place) ni comparaciones con otros modelos. Se recomienda consultar el repositorio de código del autor para obtener la guía de reproducción y los resultados detallados.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 16,65 M de parámetros en float32 (~66,6 MB de pesos), la inferencia puede ejecutarse con menos de 1 GB de VRAM, incluso en CPU.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060) es suficiente. No se requiere hardware de gama alta como A100 o H100.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en cualquier GPU moderna de consumo y también en CPU, aunque la velocidad de inferencia dependerá del tamaño de las nubes de puntos.
- **Opciones de despliegue**: no es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje. Se ejecuta mediante el código Python del repositorio del autor, que usa PyTorch y MuJoCo.
- **Latencia y throughput**: no se proporcionan datos específicos. La latencia dependerá del número de partículas en la nube de puntos y de la longitud del rollout (10 pasos). Para planificación MPPI, se espera que el throughput sea suficiente para operar en tiempo real en entornos simulados con hardware moderado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (world models 3D para pick-and-place con MPPI) en la documentación proporcionada. Existen otros checkpoints de robótica en Hugging Face (por ejemplo, `Sumo00048/pi05_franka_pickplace_v2_ft2_ckpt`), pero no se han encontrado datos públicos que permitan una comparación rigurosa en términos de arquitectura, rendimiento o licencia. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **Dependencia crítica de la versión del entorno**: el modelo fue entrenado contra el commit `1d0cc56` de `kindergarden`. Versiones posteriores (v0.2.1 y siguientes) cambian la escena y el modelo queda fuera de distribución, fallando silenciosamente. Es imprescindible fijar la versión exacta del entorno.
- **No reproducibilidad bit a bit**: aunque se use el mismo checkpoint y semilla, la no determinismo de GPU hace que los pasos de cada episodio varíen. Las tasas de éxito y rankings deben evaluarse sobre un rango de semillas, no sobre ejecuciones individuales.
- **Alcance limitado**: el modelo solo funciona para la tarea específica de pick-and-place con el brazo Franka en el entorno MuJoCo. No es generalizable a otras tareas, objetos o robots sin reentrenamiento.
- **Riesgo de alucinación en predicciones**: como cualquier world model autoregresivo, las predicciones a largo plazo pueden degradarse, especialmente si el rollout supera los 10 pasos para los que fue entrenado.
- **Sin soporte de lenguaje**: no procesa texto ni instrucciones; su interfaz es exclusivamente numérica (nubes de puntos y acciones).
- **Formato de pesos propietario**: el checkpoint está en formato PyTorch `.pt`, lo que requiere el ecosistema PyTorch para su uso; no se ofrecen conversiones a otros formatos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Flashkernel/3dwm-franka-pickplace-mppi)
- [Commit de kindergarden utilizado para el entrenamiento](https://github.com/Princeton-Robot-Planning-and-Learning/kindergarden/commit/1d0cc56c093cfbb930d43fe83c2272b7b44f6e29)
- Repositorio de código del autor (referenciado en la model card, no se proporciona URL directa; se recomienda consultar el perfil de Hugging Face de Flashkernel para más detalles).
