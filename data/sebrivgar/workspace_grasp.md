# SebRivGar/workspace_grasp

## Resumen
`workspace_grasp` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular del robot y dos flujos de imagen (cámara de muñeca y cámara cenital) y emite comandos de acción de 6 dimensiones. El autor es SebRivGar y el modelo resuelve una tarea concreta de manipulación: agarrar un cubo y depositarlo en una caja.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible, con 51.668.614 parámetros y un repositorio de 0,2 GB, no de un modelo de propósito general. Su interés técnico radica en que ejemplifica el flujo completo de LeRobot (grabación de datos teleoperados, entrenamiento con ACT y despliegue en un robot SO-100/SO-101 follower), lo que permite a otros equipos replicar el pipeline con su propio hardware y dataset.

El modelo se entrenó sobre 240 episodios y 143.461 fotogramas a 30 FPS del dataset `SebRivGar/dataset3`, durante 25.000 pasos con batch de 16. La model card no incluye resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; no usa ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo robótico; la instrucción de tarea es una cadena fija) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

Especificaciones de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.wrist` | VISUAL | (3, 480, 640) |
| `observation.images.top` | VISUAL | (3, 480, 640) |
| `action` | ACTION | (6,) |

## Arquitectura y entrenamiento
ACT es un método de aprendizaje por imitación que predice chunks de acciones cortos en lugar de pasos individuales, lo que reduce el error de acumulación y la varianza temporal típicos de las políticas paso a paso. La arquitectura combina un backbone visual (procesa las dos cámaras a 480x640) con un transformer que modela la secuencia de estados y acciones, y una cabeza que emite vectores de acción de 6 dimensiones correspondientes a las articulaciones del robot `so_follower`. El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.2: 25.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. Los datos provienen de teleoperación humana sobre la tarea "Grasp cube and put it in the box", con 240 episodios y 143.461 fotogramas a 30 FPS. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en este paradigma), ni aumentos de datos, ni innovaciones adicionales como decodificación especulativa.

## Capacidades
- Control visomotor de manipulación: genera comandos de 6 dimensiones a partir de estado articular y dos imágenes RGB.
- Ejecución de una tarea única y fija: "Grasp cube and put it in the box".
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Predicción de chunks de acción, lo que aporta suavidad temporal en la ejecución.
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, código, visión general, audio ni modo thinking. No es multilingüe.

## Casos de uso
- Replicación de experimentos de imitación: un laboratorio puede clonar el pipeline ACT con LeRobot y comparar su propia política contra esta línea base en la misma tarea de picking.
- Docencia en robótica de manipulación: sirve como ejemplo completo y de tamaño reducido (0,2 GB) para explicar el ciclo datos-entrenamiento-despliegue en un robot SO-100.
- Prueba de hardware SO-100/SO-101: validar la cadena de calibración, cámaras y puertos antes de entrenar políticas propias.
- Generación de datos sintéticos de referencia: usar la política como profesor para recolectar trayectorias adicionales y aumentar el dataset.
- Benchmark interno de infraestructura: medir latencia de inferencia y throughput de `lerobot-rollout` en distintas GPUs con un modelo de 51,7 M de parámetros.
- Estudio de generalización: evaluar cómo se degrada la política ante cambios de iluminación, posición de objetos o distracciones, dado que la model card no reporta métricas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware
- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 el modelo ocupa aproximadamente 0,2 GB, más el coste de procesar dos imágenes de 480x640 por paso. En la práctica, menos de 2 GB de VRAM en total.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090). Para entrenamiento, una RTX 3090/4090 o A100 acelera los 25.000 pasos, aunque el modelo es pequeño.
- Cabe en GPU consumer: sí, holgadamente, en cualquier GPU moderna con 4 GB o más.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=SebRivGar/workspace_grasp`), con backend PyTorch en CUDA o CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La tasa de control está ligada a los 30 FPS del dataset y a la latencia de inferencia del hardware; no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SebRivGar/workspace_grasp` (ACT) | 51,7 M | 2 imágenes 480x640 + estado (6,) | Grasp cube into box | no disponible | Hugging Face Hub |
| Diffusion Policy (referencia LeRobot) | no disponible | imágenes + estado | manipulación por imitación | según implementación | LeRobot |
| VQ-BeT (referencia LeRobot) | no disponible | imágenes + estado | manipulación por imitación | según implementación | LeRobot |
| π0 / políticas VLA de gran escala | no disponible | imágenes + instrucción en lenguaje | manipulación generalista | según modelo | según modelo |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito para esta política ni datos comparables en la información proporcionada. Las alternativas citadas son familias de métodos implementadas en LeRobot, no resultados medidos frente a este checkpoint.

## Limitaciones y advertencias
- Ausencia total de evaluación: no hay tasa de éxito, número de ensayos ni condiciones reportadas; no debe asumirse que funciona en producción.
- Tarea única y fija: solo se entrenó para "Grasp cube and put it in the box"; no generaliza a otras tareas ni objetos.
- Dependencia del hardware: entrenada para `so_follower` con cámaras `wrist` y `top` a 480x640 y 30 FPS; cambios de cámara, montaje o robot invalidan la política.
- Sensibilidad al dominio visual: sin datos de aumentos ni evaluación, es probable que se degrade ante cambios de iluminación, fondo o posición de objetos.
- Licencia no especificada: no se puede confirmar el uso comercial; la model card marca la licencia como "[More Information Needed]".
- Sin información sobre sesgos: no se documentan sesgos, pero al derivar de teleoperación humana puede heredar sesgos de las demostraciones (posiciones, velocidades, objetos concretos).
- Riesgo de alucinación en sentido figurado: la política puede generar acciones plausibles pero incorrectas ante estados fuera de distribución, sin mecanismo de verificación.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- Fecha de creación futura en los metadatos (2026-11-09): conviene verificar la integridad y procedencia del artefacto antes de reutilizarlo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SebRivGar/workspace_grasp
- Dataset de entrenamiento: https://huggingface.co/datasets/SebRivGar/dataset3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebRivGar/dataset3
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
