# innoblabla/devracage_sphere_GR00T17_abs

## Resumen

`innoblabla/devracage_sphere_GR00T17_abs` es una política robótica de imitación publicada en HuggingFace por el usuario `innoblabla`, construida sobre la arquitectura GR00T N1.7 de NVIDIA y empaquetada con la librería LeRobot. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir de tres flujos de cámara, el estado proprioceptivo del robot y una instrucción en lenguaje natural, predice directamente acciones de 6 grados de libertad para un brazo seguidor de tipo `so_follower`.

El modelo parte de un backbone Cosmos-Reason2/Qwen3-VL (visión-lenguaje) y de un transformador de acciones con flow matching, según indica la propia model card. Con 3.144.016.000 parámetros totales y un repositorio de 12,6 GB, se trata de un ajuste fino (fine-tuning) del modelo fundacional abierto y multi-embodiment de NVIDIA, especializado aquí en una única tarea: recoger una esfera de un contenedor y colocarla en un bol.

Su relevancia es doble. Por un lado, demuestra el flujo de trabajo completo de LeRobot para entrenar, publicar y desplegar políticas robóticas reales con comandos de CLI. Por otro, sirve como referencia reproducible de ajuste de un modelo fundacional de robot a un conjunto de datos pequeño (352 episodios, 83.356 fotogramas a 30 FPS), algo habitual en laboratorios con recursos limitados. La model card no incluye resultados de evaluación ni idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformador de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | No aplica (no se describe como modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el backbone es vision-lenguaje, pero la tarjeta no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 12,6 GB) |
| Libreria / framework | LeRobot 0.6.1 (policy type `groot`) |
| Tipo de pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `pince`, `base`, `top` |
| Entradas | `observation.state` (6,); `observation.images.pince` (3, 480, 640); `observation.images.base` (3, 480, 640); `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `innoblabla/devracage_sphere` |
| Tarea | "pick up a sphere from the bin and place it in the bowl" |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el diseño de GR00T N1.7 descrito en la model card: un backbone vision-lenguaje (Cosmos-Reason2/Qwen3-VL) que interpreta las imágenes de las tres cámaras junto con la instrucción textual y el estado proprioceptivo, y un transformador de acciones entrenado con flow matching que genera las acciones condicionadas por esa representación. Se trata de un esquema de dos etapas típico de los modelos fundacionales de robot: comprensión multimodal por un lado, generación de trayectorias continuas por otro. La información proporcionada no detalla el número de capas, la dimensionalidad oculta, el mecanismo de atención ni si se emplea decodificación especulativa.

El ajuste fino se realizó sobre el dataset `innoblabla/devracage_sphere`: 352 episodios, 83.356 fotogramas grabados a 30 FPS, con demostraciones teleoperadas de una única tarea de pick-and-place. La configuración de entrenamiento reportada es de 20.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 42, todo con LeRobot 0.6.1. No se menciona ningún uso de RLHF, DPO ni aprendizaje por refuerzo: se trata, por tanto, de aprendizaje por imitación (behavior cloning) sobre demostraciones. La model card no documenta ninguna innovación técnica adicional más allá de la propia arquitectura GR00T.

## Capacidades

- Control visuomotor de un brazo `so_follower` con salida de acciones de 6 dimensiones.
- Fusión de tres vistas de cámara simultáneas (`pince`, `base`, `top`) a 480x640 píxeles.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante el prompt "pick up a sphere from the bin and place it in the bowl".
- Integración del estado proprioceptivo del robot (`observation.state`, 6 valores) como entrada.
- Ejecución de una tarea concreta de pick-and-place aprendida por imitación.
- Despliegue e inferencia mediante la CLI de LeRobot (`lerobot-rollout`).
- Reentrenamiento y ajuste mediante `lerobot-train` con `--policy.type=groot`.
- Al proceder de un modelo fundacional multi-embodiment, conserva la capacidad potencial de reajustarse a otras tareas y morfologías, aunque no se documenta en esta tarjeta.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo "thinking".

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia completa de recoger una esfera de un contenedor y depositarla en un bol, integrándose en una celda robotizada con un brazo `so_follower` y tres cámaras.
- Línea de base para investigación en manipulación: sirve para comparar políticas de imitación sobre GR00T N1.7 frente a alternativas como ACT o diffusion policy sobre el mismo dataset de 352 episodios.
- Replicación de experimentos: al estar empaquetado con LeRobot y publicar la configuración exacta de entrenamiento (20.000 pasos, batch 32, lr 1e-4, semilla 42), permite reproducir el ajuste paso a paso.
- Reajuste a nuevas tareas de manipulación: partiendo de este checkpoint, un equipo puede entrenar variantes con su propio dataset usando `lerobot-train --policy.type=groot`, aprovechando el backbone preentrenado.
- Generación de datos sintéticos de evaluación: ejecutando la política en bucle con `--duration` se pueden registrar episodios de éxito y fallo para medir robustez ante cambios de posición e iluminación.
- Docencia y formación en robótica: el flujo completo (instalación, calibración de hardware, grabación, entrenamiento, rollout) está documentado y es ejecutable con una sola GPU.
- Pruebas de integración continua en robótica: la política puede invocarse mediante CLI en scripts automatizados para verificar periódicamente que la cadena hardware-software sigue funcionando tras cambios de versión.
- Evaluación de transferencia entre cámaras o robots del mismo tipo: útil para estudiar hasta qué punto una política entrenada con vistas concretas generaliza a otras configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), y la tabla de evaluación del documento permanece vacía. Tampoco se reportan métricas de éxito, latencia ni throughput.

| Benchmark | Resultado |
|---|---|
| Evaluación en robot real | No disponible |
| MMLU / HumanEval / GSM8K | No aplica (modelo de control robótico, no de lenguaje) |
| Tasa de éxito por tarea | No disponible |

## Requisitos de hardware

- VRAM estimada en precisión bf16: alrededor de 6,3 GB solo para los pesos (3,14 mil millones de parámetros), más el coste de activaciones y buffers de las tres imágenes de 480x640.
- VRAM estimada en fp32: el repositorio ocupa 12,6 GB, lo que sugiere pesos en 32 bits o en 16 bits con estados de optimizador; para inferencia conviene usar menor precisión.
- GPU recomendadas para inferencia: cualquier GPU con 12-16 GB o más de memoria, como RTX 4080, RTX 4090, RTX A5000 o superiores. Para entrenamiento, se recomienda RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas de 12 GB o más si se carga en bf16, aunque no hay datos confirmados en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=innoblabla/devracage_sphere_GR00T17_abs`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a una política robótica.
- Latencia y throughput: no disponibles. El sistema debe operar con las tres cámaras a 30 FPS, pero la tarjeta no especifica la frecuencia de inferencia alcanzada.
- Requisitos adicionales: puerto serie del robot, tres cámaras OpenCV configuradas con los nombres `pince`, `base` y `top`, y LeRobot 0.6.1 o compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `innoblabla/devracage_sphere_GR00T17_abs` | 3,14 mil millones | No disponible | apache-2.0 | HuggingFace, via LeRobot | Ajuste fino de GR00T N1.7 sobre 352 episodios y una tarea |
| NVIDIA GR00T N1.7 / Isaac-GR00T | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Repositorio GitHub de NVIDIA | Modelo fundacional base sobre el que se construye este ajuste |
| Alternativas de imitacion en LeRobot (ACT, diffusion policy) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace, via LeRobot | Políticas más ligeras, sin backbone vision-lenguaje fundacional |
| Otros modelos fundacionales de robot (por ejemplo, familia pi0 o SmolVLA) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Publicaciones propias de cada proyecto | No se dispone de datos verificados en la información aportada |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al entrenarse por imitación sobre demostraciones de un único operador y un único entorno, es esperable que herede las condiciones de iluminación, posiciones de objeto y estilo de teleoperación del dataset, pero no se documenta formalmente.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o fuera de distribución cuando el escenario difiere del visto en entrenamiento.
- Limitación de tarea: la política está ajustada para una sola instrucción ("pick up a sphere from the bin and place it in the bowl"); no se declara capacidad de generalizar a otras tareas sin reentrenamiento.
- Dependencia de la configuración de sensores: los nombres de cámara (`pince`, `base`, `top`) y las resoluciones (480x640) deben coincidir exactamente con los usados en entrenamiento para que la inferencia funcione.
- Dependencia del hardware: diseñada para `so_follower` con estado de 6 dimensiones y acción de 6 dimensiones; no es portable directamente a otros robots.
- Ausencia de evaluación: no hay ninguna métrica de tasa de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de redactar esta ficha.
- Licencia: apache-2.0, que permite uso comercial, pero conviene verificar las licencias del modelo base GR00T N1.7, del backbone Cosmos-Reason2/Qwen3-VL y del dataset asociado, ya que no se detallan en la información proporcionada.
- Idiomas: la tarjeta no declara idiomas soportados; la instrucción de tarea está en inglés y se desconoce el comportamiento con prompts en otros idiomas.
- Fecha de publicación futura: la tarjeta registra creación y actualización el 2026-09-18, un dato anómalo que conviene contrastar antes de usarla como referencia temporal.
- Contexto: se desconoce la longitud de contexto del backbone y si la instrucción de tarea puede ser más larga que una frase corta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/innoblabla/devracage_sphere_GR00T17_abs
- Dataset de entrenamiento: https://huggingface.co/datasets/innoblabla/devracage_sphere
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=innoblabla/devracage_sphere
- Repositorio Isaac-GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot: Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024
- Búsqueda web: no se encontraron enlaces relevantes sobre el modelo; los resultados devueltos correspondían a páginas de Spotify y no guardan relación con esta ficha.
