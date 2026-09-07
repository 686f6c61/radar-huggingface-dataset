# arabellako22/microduck-walk-seed42

## Resumen

El modelo `arabellako22/microduck-walk-seed42` es una política de control para locomoción bípeda en terreno plano, desarrollada por arabellako22 como parte de un estudio personal de aprendizaje por refuerzo. La política se entrena con el algoritmo PPO sobre el simulador MuJoCo Warp, utilizando el entorno `Mjlab-Velocity-Flat-MicroDuck` de Pollen Robotics, y se exporta a formato ONNX con la normalización de observaciones integrada. Resuelve el problema de hacer caminar a un robot bípedo de 25 cm con 15 motores siguiendo una velocidad objetivo, en este caso 0,50 m/s.

La arquitectura es una red de política (policy network) que mapea un vector de observaciones de 61 dimensiones a un vector de acciones de 14 dimensiones, con contrato ONNX `[1, 61] -> [1, 14]`. El modelo se entrenó con 4096 entornos paralelos durante 4000 iteraciones con semilla 42. No se especifica el número total de parámetros ni la longitud de contexto, ya que no se trata de un modelo de lenguaje. La relevancia del modelo radica en demostrar un pipeline completo de entrenamiento en simulación, exportación y validación de artefactos para robótica, con resultados de evaluación multi-semilla publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política (policy network) entrenada con PPO, exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La política es un modelo de control para un robot bípedo, entrenado mediante aprendizaje por refuerzo con el algoritmo PPO implementado en `rsl_rl`. El entorno de entrenamiento es `Mjlab-Velocity-Flat-MicroDuck`, basado en MuJoCo Warp, que permite simular 4096 entornos en paralelo. El entrenamiento se ejecutó durante 4000 iteraciones con la semilla 42, sobre la revisión `29e887ecfbf5` del repositorio `pollen-robotics/microduck_rl`. La exportación del modelo se realizó con el script oficial `scripts/export.py`, que integra el normalizador de observaciones dentro del grafo ONNX. El contrato de entrada y salida es `[1, 61] -> [1, 14]`, lo que indica que recibe 61 observaciones (estado del robot, velocidades, comandos, etc.) y produce 14 acciones de control para los motores.

Entre las innovaciones técnicas destacables se encuentran el uso de MuJoCo Warp para simulación masivamente paralela, la randomización de dinámica para mejorar la robustez de la política y los modelos de fricción BAM para servoactuadores. El modelo se validó en simulación sin renderizado en 10 semillas de evaluación deterministas (100 a 109), obteniendo una tasa de éxito sin terminación del 100 % y una velocidad media hacia adelante de 0,258 ± 0,028 m/s.

## Capacidades

- Control de locomoción bípeda en terreno plano mediante comandos de velocidad.
- Seguimiento de velocidad objetivo: en la evaluación multi-semilla, el comando era 0,50 m/s y la velocidad media medida fue de 0,258 m/s.
- Sin terminaciones durante los rollouts: las 10 semillas de evaluación completaron 400 pasos cada una sin caídas ni condiciones de terminación.
- Exportación a ONNX con normalización de observaciones integrada, lo que facilita el despliegue en sistemas embebidos.
- Evaluación reproducible: se proporcionan los resultados por semilla en formato CSV y JSON.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento simbólico, código, visión ni audio.

## Casos de uso

- Investigación en robótica: la política puede usarse como referencia para estudiar el efecto de la semilla, la randomización de dinámica o los modelos de fricción en el rendimiento de locomoción bípeda.
- Educación en aprendizaje por refuerzo: el repositorio documenta un pipeline completo desde el entrenamiento con PPO hasta la exportación a ONNX, útil como ejemplo didáctico.
- Prototipado de robots bípedos: permite pre-entrenar comportamientos en simulación antes de transferirlos a un robot físico, reduciendo el tiempo de ajuste en hardware.
- Simulación de robótica: el modelo puede integrarse en entornos MuJoCo para evaluar políticas de control o comparar configuraciones de entrenamiento.
- Despliegue en hardware embebido: el formato ONNX permite ejecutar la política con ONNX Runtime en dispositivos de bajo consumo, como microcontroladores o placas de desarrollo.
- Benchmark de políticas: los resultados multi-semilla proporcionan una base para comparar futuras políticas o variaciones del algoritmo de entrenamiento.
- Reproducibilidad de experimentos: el repositorio incluye `training_config.json` y `manifest.json`, lo que facilita replicar el estudio y verificar los artefactos generados.

## Benchmarks y rendimiento

Se han publicado resultados de evaluación multi-semilla en el modelo, declarados por el autor. La tabla siguiente resume los resultados agregados sobre 10 semillas de evaluación deterministas (100 a 109), con 400 pasos por semilla.

| Metrica | Resultado |
|---|---|
| Tasa de exito sin terminacion | 100,0 % |
| Recompensa media por paso | 0,1478 ± 0,0036 |
| Velocidad media hacia adelante (m/s) | 0,258 ± 0,028 |
| Error absoluto medio de velocidad (m/s) | 0,244 ± 0,027 |
| Terminaciones totales | 0 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor indica explícitamente que un video y una semilla no constituyen un benchmark estadístico.

## Requisitos de hardware

- VRAM estimada: no aplica, el modelo es una red pequeña en formato ONNX y puede ejecutarse en CPU.
- GPU recomendada: no se especifica; la inferencia es trivial y no requiere GPU dedicada.
- Si cabe en consumer GPU: sí, el modelo es extremadamente ligero y se ejecuta sin problemas en cualquier hardware moderno, incluidos dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime, Python (con el script `infer_policy.py` incluido), o integración directa en el firmware del robot Microduck.
- Latencia y throughput: no disponible; el autor no publica mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada. El modelo es un artefacto específico de un estudio personal de aprendizaje por refuerzo para robótica, sin comparativas publicadas con otras políticas de control.

## Limitaciones y advertencias

- El modelo no ha sido probado en un Microduck físico; solo se ha validado en simulación.
- El entrenamiento se realizó con una única semilla (42), por lo que los resultados no demuestran robustez frente a variaciones de la inicialización.
- La política está entrenada exclusivamente para terreno plano; no se ha evaluado en terrenos irregulares, pendientes ni obstáculos.
- La velocidad media medida (0,258 m/s) es notablemente inferior al comando de velocidad objetivo (0,50 m/s), lo que indica un error de seguimiento significativo.
- El error absoluto medio de velocidad es de 0,244 m/s, lo que sugiere que la política no alcanza con precisión la velocidad comandada.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que el estudio no constituye un benchmark estadístico y que un solo video no es una validación suficiente.
- No es un modelo de lenguaje ni de visión; no debe usarse para tareas de procesamiento de texto, generación de código o análisis de imágenes.

## Enlaces

- Hugging Face: https://huggingface.co/arabellako22/microduck-walk-seed42
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Web del robot Microduck: https://pollen-robotics.com/microduck/
- Referencia PPO: https://arxiv.org/abs/1707.06347
- Referencia modelos de fricción BAM: https://arxiv.org/abs/2410.08650
- Referencia randomización de dinámica: https://arxiv.org/abs/1710.06537
- Referencia aprendizaje de locomoción masivamente paralelo: https://arxiv.org/abs/2109.11978
