# Bekhzod/TASK_02_act_policy_20260721

## Resumen

El modelo `Bekhzod/TASK_02_act_policy_20260721` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Bekhzod y entrenada con la librería LeRobot de Hugging Face. Está diseñada para un robot manipulador de tipo FR3WMS y resuelve la tarea de apilar cuatro cubos de colores (rojo, azul, amarillo y blanco) en orden vertical, a partir de datos teleoperados. El modelo pertenece a la categoría de aprendizaje por imitación en robótica, donde la política aprende a mapear observaciones (estado del robot e imágenes de dos cámaras) en secuencias de acciones.

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de consumo. Su relevancia radica en demostrar cómo los transformadores aplicados a la predicción de chunks de acciones permiten alcanzar altas tasas de éxito en tareas de manipulación precisas, como el apilado de objetos, sin necesidad de ingeniería de recompensas ni modelos de mundo. La licencia Apache 2.0 facilita su uso y modificación tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en transformadores que predice chunks de acciones (secuencias de varios pasos) en lugar de acciones individuales. Esto reduce el error de acumulación típico de los métodos de imitación paso a paso. La política recibe como entrada el estado del robot (vector de 7 dimensiones) y dos imágenes RGB de 480x480 píxeles procedentes de cámaras frontal y superior. La salida es un vector de acción de 7 dimensiones que corresponde a los comandos de articulación del brazo robótico.

El entrenamiento se realizó con el dataset `Bekhzod/TASK_02_block_stacking_rbyw_20260721_merged_data`, que contiene 141 episodios teleoperados y 117.506 fotogramas a 30 FPS. Se utilizaron 200.000 pasos de entrenamiento con un tamaño de lote de 64, optimizador AdamW y una tasa de aprendizaje de 1e-5, con semilla 1000. La versión de LeRobot empleada fue la 0.6.1. No se especifica el uso de técnicas como RLHF o DPO, ya que se trata de aprendizaje por imitación supervisado.

## Capacidades

- Control de un robot manipulador FR3WMS mediante comandos de articulación de 7 grados de libertad.
- Percepción visual multimodal con dos cámaras (frontal y superior) a resolución 480x480.
- Predicción de secuencias de acciones (action chunking) para movimientos suaves y coordinados.
- Ejecución de la tarea específica de apilado de cubos de colores en orden vertical.
- Generalización limitada a variaciones de posición de los objetos dentro del espacio de trabajo capturado en el dataset.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede integrarse en una celda robótica para recoger y colocar piezas de colores en posiciones determinadas, reduciendo el tiempo de ciclo frente a métodos programados manualmente.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a cambios de iluminación y fondo, gracias a su arquitectura ACT y su tamaño reducido.
- Prototipado rápido de manipulaciones en laboratorio: al ser ligero (51 M de parámetros), puede ejecutarse en una GPU de gama media para validar algoritmos de control antes de escalar a modelos más grandes.
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con políticas entrenadas por imitación sin necesidad de un clúster de GPUs, usando el flujo de trabajo de LeRobot.
- Benchmarking de métodos de imitación: al estar disponible públicamente con licencia Apache 2.0, puede utilizarse como referencia para comparar ACT con otras arquitecturas (p. ej., Diffusion Policy) en la misma tarea.
- Despliegue en robots de bajo coste: dado su pequeño tamaño, es viable ejecutarlo en dispositivos embebidos con aceleración GPU básica, habilitando aplicaciones de robótica asistencial o doméstica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,67 millones de parámetros, en precisión FP32 ocuparía aproximadamente 207 MB de memoria. Con un lote de 1 y resolución de imagen 480x480, se estima un consumo inferior a 2 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, o superiores) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, A100, etc.) dado el tamaño de lote de 64.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como la serie RTX 30/40 de NVIDIA.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También es posible exportar los pesos a otros formatos si se requiere, aunque no se documenta compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo y la resolución de entrada, se espera una inferencia en tiempo real (mayor de 30 FPS) en GPUs modernas, pero no está confirmado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control robótico para apilado de cubos) dentro de la documentación proporcionada. La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de apilar cubos de colores en un orden específico; no generaliza a otras tareas de manipulación sin reentrenamiento.
- Depende de la configuración de cámaras y del robot FR3WMS; cambios en la posición de las cámaras, iluminación o el propio robot pueden degradar el rendimiento.
- No se han reportado resultados de evaluación en robot real, por lo que la tasa de éxito real es desconocida.
- Al ser un modelo de imitación, puede heredar sesgos del operador humano que generó los datos teleoperados (p. ej., trayectorias subóptimas).
- No es un modelo de lenguaje, por lo que no presenta riesgos de alucinación textual ni problemas de sesgo lingüístico.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente al autor y a LeRobot según los términos de la licencia.
- El dataset de entrenamiento está disponible públicamente, pero se recomienda revisar su licencia y condiciones de uso antes de redistribuirlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bekhzod/TASK_02_act_policy_20260721
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Bekhzod/TASK_02_block_stacking_rbyw_20260721_merged_data
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
