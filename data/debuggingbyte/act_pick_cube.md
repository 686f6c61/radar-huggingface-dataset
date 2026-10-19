# DebuggingByte/act_pick_cube

## Resumen

`DebuggingByte/act_pick_cube` es una política de manipulación robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario DebuggingByte y se ha entrenado y subido al Hub con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. No es un modelo de lenguaje: es un controlador visomotor que consume una imagen de cámara y el estado de las articulaciones para emitir comandos de actuación.

La política está especializada en una única tarea, "Pick up the cube and put it in the box", sobre un brazo seguidor tipo `so_follower` (familia SO-100) con una cámara frontal. La entrada combina `observation.state` de 6 dimensiones con una imagen RGB de 3×480×640; la salida es un vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, por lo que es muy ligero en comparación con los modelos fundacionales de robótica.

Su relevancia práctica es la de un artefacto reproducible y de bajo coste: la model card documenta la configuración exacta de entrenamiento (20.000 pasos, batch 8, AdamW, LR 1e-5, semilla 1000, LeRobot 0.6.1) y el dataset de origen (50 episodios, 29.519 fotogramas a 30 FPS), lo que permite replicar el pipeline o usarlo como línea base para experimentos de imitación con hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con CVAE, encoder visual, encoder de estado y decoder de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no documenta el observation horizon ni el chunk size de ACT) |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (política robótica; no procesa lenguaje, la tarea se fija como instrucción de texto en el rollout) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (brazo seguidor SO-100) |
| Camaras | `front` (una cámara frontal) |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.front`, shape `(3, 480, 640)` |
| Salida de accion | `action`, shape `(6,)` |
| Frecuencia de los datos | 30 FPS |
| Dataset de entrenamiento | `DebuggingByte/pick_cube` (50 episodios, 29.519 fotogramas) |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación supervisado que se entrena con datos de teleoperación. La arquitectura es un transformer con un componente de autoencoder variacional condicional (CVAE): un encoder visual procesa la imagen de la cámara, un encoder de estado procesa la posición articular, y un decoder genera un chunk de acciones futuras en lugar de un único paso. Predecir secuencias cortas de acciones reduce el error de composición acumulado típico de las políticas paso a paso y suele traducirse en tasas de éxito más altas con datos modestos. El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `DebuggingByte/pick_cube`: 50 episodios y 29.519 fotogramas a 30 FPS de la tarea "Pick up the cube and put it in the box". La model card no especifica el número total de tokens ni la composición exacta del dataset, ni indica si se aplicaron fases de RLHF o DPO (no aplicables en este paradigma). Tampoco se documentan aumentos de datos, resolución de recorte de imagen ni hiperparámetros específicos de ACT más allá de los citados.

## Capacidades

- Manipulación visomotora de una tarea concreta: recoger un cubo y depositarlo en una caja, a partir de imagen frontal y estado articular de 6 dimensiones.
- Generación de chunks de acción de 6 dimensiones adecuados para control de brazo seguidor SO-100.
- Aprendizaje por imitación a partir de teleoperación: reproduce la distribución de comportamientos presente en el dataset.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`, con la política como estrategia base.
- Reentrenamiento y ajuste fino con `lerobot-train` sobre nuevos datasets con el mismo esquema de observaciones.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, agentes, visión general, audio ni capacidades multilingües: no es un modelo de lenguaje.
- Capacidad especial: ninguna más allá del chunking de acciones propio de ACT (no hay modo "thinking", ni visión de propósito general).

## Casos de uso

- Automatización de pick-and-place en laboratorio: ejecutar la tarea cubo-caja sobre un SO-100 con cámara frontal, usando `lerobot-rollout --strategy.type=base` para pruebas de 60 segundos sin grabación de episodios.
- Línea base de comparación: servir como referencia cuantitativa frente a políticas nuevas entrenadas sobre el mismo dataset, al estar documentada la configuración completa (semilla 1000, 20.000 pasos).
- Replicación de experimentos: reconstruir el entrenamiento con `lerobot-train` y verificar que se alcanza un comportamiento similar, útil en docencia e investigación sobre aprendizaje por imitación.
- Ajuste fino con datos propios: partir de estos pesos y reentrenar con un dataset nuevo que mantenga las claves `observation.state` y `observation.images.front`, por ejemplo variando posiciones del cubo o iluminación.
- Docencia en robótica de bajo coste: demostrar el ciclo completo teleoperación, grabación, entrenamiento y despliegue en hardware asequible, dado el tamaño reducido del modelo (51,7 M de parámetros).
- Validación de infraestructura: probar pipelines de LeRobot, calibración de brazos y configuración de cámaras OpenCV antes de invertir en datasets mayores.
- Generación de datos sintéticos de evaluación: ejecutar la política de forma continua (`--duration` omitido) para caracterizar modos de fallo del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no incluye tabla de ensayos, éxitos ni tasa de acierto. Tampoco se reportan métricas de pérdida de entrenamiento ni comparaciones con otras políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 para los 51,7 M de parámetros, más el coste de activaciones del encoder visual; el repositorio completo ocupa 0,2 GB. Cálculo estimado, no medido.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también es viable en GPU de portátil y en CPU, aunque la tasa de refresco a 30 FPS puede no sostenerse en CPU.
- Cabe en GPU consumer: sí, con margen muy amplio; el cuello de botella real es la latencia del pipeline de cámara y control, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=DebuggingByte/act_pick_cube`) sobre PyTorch; el robot y las cámaras se configuran vía OpenCV. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles; no se han publicado mediciones de latencia por chunk ni de FPS efectivos en hardware concreto.
- Requisitos adicionales: puerto serie del robot, calibración previa del brazo seguidor y nombres de cámara que coincidan con las claves de observación (`observation.images.front`).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DebuggingByte/act_pick_cube` (este) | 51.668.614 | Imagen 3×480×640 + estado (6,) | pick_cube sobre `so_follower` | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `sanjay050/act_pick_cube` | no disponible | no disponible | pick_cube con ACT y LeRobot | no disponible | Hugging Face |
| Diffusion Policy (arXiv:2303.04137) | no disponible | observaciones visuales | imitación visual genérica | no disponible | paper y código de referencia |
| Políticas fundacionales tipo VLA (p. ej. SmolVLA en LeRobot) | no disponible en la información | imagen + instrucción en lenguaje | multi-tarea | no disponible en la información | ecosistema LeRobot |

La comparación relevante es metodológica: frente a Diffusion Policy, ACT es más ligero y suele entrenar más rápido con datasets pequeños, mientras que Diffusion Policy modela distribuciones multimodales de acción de forma más explícita. Frente a políticas VLA, este modelo no acepta instrucciones en lenguaje ni generaliza a tareas no vistas. No se dispone de datos verificados de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Especialización extrema: solo se ha entrenado para "Pick up the cube and put it in the box"; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Sin evaluación publicada: no hay evidencia medida de tasa de éxito, por lo que no debe asumirse un rendimiento concreto en producción.
- Dependencia del hardware: el entrenamiento se hizo con un `so_follower` y una cámara `front`; cambios de brazo, calibración, montaje de cámara o iluminación pueden degradar el comportamiento de forma significativa.
- Dataset pequeño: 50 episodios y 29.519 fotogramas implican poca cobertura de posiciones, distracciones y condiciones de iluminación; se espera sobreajuste al entorno de grabación.
- Riesgo de fallo silencioso: al ser una política de imitación sin mecanismos de verificación, puede ejecutar acciones incorrectas sin señal de error; requiere supervisión y paradas de seguridad.
- Sin capacidades de lenguaje ni de razonamiento: no interpreta instrucciones nuevas en tiempo de ejecución más allá de la cadena de tarea usada en el rollout.
- Idiomas: no aplica; no hay soporte multilingüe que evaluar.
- Licencia: apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y citar LeRobot y el paper de ACT.
- Trazabilidad: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-19; no hay historial de mantenimiento ni issues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DebuggingByte/act_pick_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/DebuggingByte/pick_cube
- Visor del dataset: https://huggingface.co/datasets/DebuggingByte/pick_cube/viewer
- Visualizar dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=DebuggingByte/pick_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Política ACT similar encontrada en la búsqueda: https://huggingface.co/sanjay050/act_pick_cube
