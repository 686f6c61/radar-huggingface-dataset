# acai7/so101_pickplace_policy_fast_finetuned

## Resumen

`acai7/so101_pickplace_policy_fast_finetuned` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es un modelo de control visomotor que, a partir del estado articular de un brazo robótico SO-101 y de dos cámaras RGB, predice directamente comandos de acción de 6 dimensiones. Lo desarrolla el usuario `acai7` como un ajuste fino del modelo `swapnilpaul/so100_pickplace_policy_fast`, sobre un dataset propio de demostraciones teleoperadas.

El modelo resuelve una tarea concreta: coger un cubo y depositarlo en una caja ("Pick up the cube and place it in the box"). Se entrenó con 20 episodios (12.617 fotogramas a 30 FPS) y 7.000 pasos de entrenamiento, lo que lo sitúa en la categoría de políticas de imitación de bajo coste computacional: 51,6 millones de parámetros y un repositorio de solo 0,2 GB. Es relevante para quienes trabajan con brazos SO-101 de bajo coste y quieren un punto de partida reproducible para tareas de pick-and-place con LeRobot 0.7.1.

La ficha describe una política de robótica, no un LLM, por lo que las secciones de benchmarks lingüísticos, cuantización o tool calling se marcan como no disponibles o se reinterpretan en clave robótica (VRAM, GPUs, latencia de control).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación definida por la configuración ACT (chunking de acciones, valor no publicado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo visomotor, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `top` y `wrist` (también referidas como `front` y `handeye` en la model card), 3x480x640 |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida | `action` de forma (6,) |
| Modelo base | `swapnilpaul/so100_pickplace_policy_fast` |
| Dataset de entrenamiento | `swapnilpaul/so101_cube_pickplace_pilot_20261120_174602` |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice *chunks* de acciones (varias acciones consecutivas) en lugar de un único paso, lo que reduce el error de acumulación y estabiliza el control. La arquitectura combina un codificador visual (procesa las dos imágenes de 480x640) con un transformer que fusiona la observación del estado articular de 6 dimensiones y genera una secuencia de acciones de 6 dimensiones. La referencia metodológica es el paper arXiv:2304.13705 (Zhao et al., 2023).

El ajuste fino se realizó con LeRobot 0.7.1 sobre 20 episodios teleoperados (12.617 fotogramas a 30 FPS) de la tarea de pick-and-place de un cubo en una caja. Configuración: 7.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ningún proceso de refuerzo; es aprendizaje supervisado puro sobre demostraciones. Tampoco se detalla el número de tokens ni composición de datos más allá del dataset citado.

## Capacidades

- Control visomotor de un brazo SO-101 (`so_follower`) para la tarea específica de coger un cubo y dejarlo en una caja.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular de 6 dimensiones y dos vistas RGB.
- Fusión de información de cámara cenital (`top`/`front`) y de muñeca (`wrist`/`handeye`).
- Ejecución en bucle cerrado a través de `lerobot-rollout` con estrategia `base`.
- Reentrenamiento y ajuste fino a partir del modelo base `swapnilpaul/so100_pickplace_policy_fast` mediante `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".

## Casos de uso

- Pick-and-place de laboratorio: usar la política para recoger un cubo y depositarlo en una caja con un SO-101, replicando exactamente la tarea del dataset de entrenamiento. Adecuado por la coincidencia exacta entre distribución de entrenamiento y despliegue.
- Punto de partida para ajuste fino: cargar el modelo base `swapnilpaul/so100_pickplace_policy_fast` y reentrenar con un dataset propio de otra tarea (por ejemplo, apilar bloques) usando `lerobot-train` con `--policy.path`.
- Docencia e investigación en aprendizaje por imitación: sirve como ejemplo reproducible de pipeline LeRobot completo (grabación, entrenamiento, rollout) con solo 20 episodios y 7.000 pasos, lo que permite iterar rápido en un aula o laboratorio.
- Benchmark interno de políticas ACT: comparar tasas de éxito frente a otras políticas entrenadas con el mismo dataset, ya que el modelo es pequeño (51,6 M de parámetros) y el entrenamiento es barato.
- Pruebas de infraestructura de control: validar latencia, calibración de cámaras y cableado de un SO-101 antes de invertir en datasets mayores, usando esta política como *smoke test* funcional.
- Recolección de datos asistida: ejecutar la política en modo `base` para generar trayectorias iniciales que luego se corrigen por teleoperación y se añaden al dataset, acelerando la recolección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (51,6 M de parámetros, ~0,2 GB de pesos en FP32). Cabe holgadamente en cualquier GPU consumer con 4 GB o más; también es viable en CPU para pruebas, aunque la latencia de control a 30 FPS puede resentirse.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real; A100/H100 no son necesarias para este tamaño, pero aceleran el reentrenamiento.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), integración con el stack LeRobot; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la model card; dependen de la GPU, de la resolución de las dos cámaras (480x640) y de la frecuencia de control (30 FPS en el dataset).

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `acai7/so101_pickplace_policy_fast_finetuned` | 51,6 M | Pick-and-place SO-101 | estado (6,) + 2 imágenes 480x640 | Apache 2.0 | Hugging Face (0 descargas) |
| `swapnilpaul/so100_pickplace_policy_fast` (base) | no disponible | Pick-and-place SO-100 | estado + imágenes | no disponible en esta ficha | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | Tareas de imitación diversas | estado + imágenes | Apache 2.0 (típico) | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparado (tasas de éxito) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Entrenada para una única tarea y un único robot (`so_follower`); no generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Dataset muy pequeño (20 episodios, 12.617 fotogramas): alta probabilidad de sobreajuste a posiciones, iluminación y fondo concretos del entorno de recogida.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez.
- Sensible a la calibración de cámaras y a los nombres de las claves de observación (`top`/`wrist` frente a `front`/`handeye` en la model card); un desajuste rompe la inferencia.
- Riesgo de fallos silenciosos: al ser una política de imitación sin mecanismo de verificación, puede ejecutar acciones incorrectas sin señal de error.
- Sesgos: no aplica en el sentido lingüístico, pero hereda los sesgos de distribución del dataset (posiciones, colores, iluminación).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable desplegarla en producción sin validación propia.
- Sin soporte de texto, multilingüe, tool calling ni agentes; no debe confundirse con un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acai7/so101_pickplace_policy_fast_finetuned
- Modelo base: https://huggingface.co/swapnilpaul/so100_pickplace_policy_fast
- Dataset de entrenamiento: https://huggingface.co/datasets/swapnilpaul/so101_cube_pickplace_pilot_20261120_174602
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
