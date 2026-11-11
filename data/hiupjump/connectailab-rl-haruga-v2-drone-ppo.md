# hiupjump/connectailab-rl-haruga-v2-drone-ppo

## Resumen

`connectailab-rl-haruga-v2-drone-ppo` es un agente de aprendizaje por refuerzo publicado en Hugging Face por el usuario `hiupjump`, entrenado con el algoritmo PPO (Proximal Policy Optimization) para el control continuo de un cuadricóptero simulado en MuJoCo. El entorno utilizado es `CustomDrone-v0`, un entorno propio de MuJoCo con un dron de cuatro rotores, y el objetivo del agente es volar y mantenerse en hovering sobre un waypoint (punto objetivo) controlando de forma continua el empuje de cada uno de los cuatro rotores.

El repositorio tiene un tamaño de 0.0 GB, no registra descargas ni likes, y no incluye información sobre licencia ni idiomas. Se enmarca dentro de una iniciativa formativa denominada "AI CITY BUILDERS" (lección 6 de refuerzo) del CONNECT AI LAB, por lo que su propósito parece ser más educativo y demostrativo que de producción.

A diferencia de los modelos de lenguaje, este artefacto no procesa texto ni imágenes: es una política neuronal (posiblemente una MLP pequeña, con capa oculta de 128 unidades según la configuración de entrenamiento) que mapea un vector de estado de 16 dimensiones a 4 acciones continuas. Su relevancia radica en ser un ejemplo reproducible de control continuo con PPO en robótica aérea simulada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para RL (PPO), red oculta de 128 unidades (según configuración de entrenamiento) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería declarada: pytorch) |

## Arquitectura y entrenamiento

El agente se entrena con PPO sobre el entorno `CustomDrone-v0` de MuJoCo. El espacio de observación es un vector de 16 dimensiones compuesto por: posición relativa al objetivo (3), posición actual (3), cuaternión de orientación (4), velocidad lineal (3) y velocidad angular (3). El espacio de acción es continuo y de 4 dimensiones, correspondiente al empuje normalizado de cada rotor en el rango [-1, 1].

La configuración de entrenamiento reportada es: 300 000 pasos totales, 8 entornos en paralelo, `n_steps` de 256, `batch_size` de 256, red oculta de 128 unidades, coeficiente de clipping de 0.2, factor de descuento gamma de 0.99, `gae_lambda` de 0.95 y tasa de aprendizaje de 0.0003. No se especifica el número de tokens de entrenamiento (no aplica), la composición del dataset (no aplica, es RL on-policy) ni si se emplearon técnicas adicionales como recompensas conformadas o currículum de entrenamiento. No se detalla la función de recompensa del entorno `CustomDrone-v0`.

## Capacidades

- Control continuo de un cuadricóptero simulado: genera comandos de empuje para cuatro rotores.
- Navegación hacia waypoint: vuela hacia una posición objetivo relativa codificada en la observación.
- Hovering: mantiene posición estable sobre el objetivo (según el resultado reportado de 1458.2 puntos de media en 10 episodios no vistos).
- Política reactiva basada en estado: no usa memoria recurrente ni planificación explícita; la observación incluye posición, orientación, velocidad lineal y angular.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento. Es exclusivamente una política de control.

## Casos de uso

- Docencia y formación en RL: reproducir el entrenamiento PPO de un dron en MuJoCo como ejercicio práctico de control continuo, dado que el repositorio se asocia a una lección formativa del CONNECT AI LAB.
- Prototipado de controladores de vuelo en simulación: usar la política como línea base para comparar con otros algoritmos (SAC, TD3) o con controladores clásicos PID en el mismo entorno `CustomDrone-v0`.
- Investigación en simulación aérea: evaluar el efecto de cambios en la formulación de recompensa, en la observación (por ejemplo, añadir ruido) o en la dinámica del dron sobre una política ya entrenada.
- Generación de datos sintéticos de trayectorias: ejecutar el agente en bucle para recolectar secuencias de estados y acciones que sirvan como dataset para entrenar modelos de dinámica o para imitación.
- Pruebas de robustez y transferencia sim-a-real: servir como punto de partida para estudiar la degradación de la política al variar parámetros físicos del simulador (masa, empuje máximo, fricción) antes de plantear un despliegue real.
- Benchmark interno de entornos MuJoCo: comparar la puntuación media reportada (1458.2 en 10 episodios) con la de otras políticas sobre `CustomDrone-v0` para validar la estabilidad del entorno y de la configuración de entrenamiento.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Puntuación media en 10 episodios no vistos | 1458.2 |

No se han publicado resultados de benchmarks comparativos con otros modelos o algoritmos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la política es una red pequeña (capa oculta de 128 unidades) y el cuello de botella es la simulación MuJoCo, no el modelo. No se dispone de cifras exactas.
- GPU recomendadas: no disponible. Para entrenamiento con 8 entornos MuJoCo en paralelo, una GPU de gama media es suficiente, pero no se especifica en la información.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna, dado el tamaño reducido de la red; no se confirma con datos del autor.
- Opciones de despliegue: PyTorch (librería declarada), con el entorno MuJoCo `CustomDrone-v0` para la simulación. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros agentes RL comparables ni datos de rendimiento de alternativas sobre `CustomDrone-v0`.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifican términos de uso comercial ni de redistribución; debe contactarse con el autor antes de cualquier uso productivo.
- Ámbito muy restringido: es una política específica para `CustomDrone-v0`; no es un modelo de propósito general y no funcionará fuera de ese entorno sin reentrenamiento.
- Sin información sobre sesgos ni alucinación: al no ser un modelo generativo de lenguaje, estos riesgos no aplican, pero tampoco hay evaluación de robustez fuera de la distribución de entrenamiento.
- Entrenamiento corto: 300 000 pasos con 8 entornos es una cantidad modesta; la puntuación reportada (1458.2) proviene de una única evaluación de 10 episodios, sin intervalos de confianza ni evaluación en múltiples semillas.
- Reproducibilidad limitada: no se publica el código del entorno `CustomDrone-v0` ni la función de recompensa en la información disponible, lo que dificulta replicar el resultado.
- Sin soporte de idiomas, contexto ni cuantización: no aplica a este tipo de artefacto, pero conviene no confundirlo con un modelo de lenguaje al integrarlo en pipelines.
- Uso en producción real: no hay evidencia de transferencia sim-a-real ni de validación en hardware físico.

## Enlaces

- Hugging Face: https://huggingface.co/hiupjump/connectailab-rl-haruga-v2-drone-ppo
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
