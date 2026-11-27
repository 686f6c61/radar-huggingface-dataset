# chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_5k

## Resumen

Este repositorio contiene un checkpoint de robótica basado en pi0.5 (pi05) con la extensión FoveaVLA, desarrollado por el usuario `chomeed` a partir del modelo base `lerobot/pi05_base`. Se trata de un modelo de política visuomotora (vision-language-action) destinado al control de un robot bimanual Hyundai Duet en una tarea concreta de inserción de cable (task 2, "GRC cable insertion"). El modelo combina un VLM que predice la subtarea de alto nivel en curso con un experto de acción que genera comandos motores condicionados por dicha subtarea y por vistas foveadas (recortes de alta resolución) de las cámaras relevantes.

La relevancia técnica está en la arquitectura de foveación por etapas: el modelo no procesa siempre todas las cámaras a resolución completa, sino que selecciona recortes exactos de las cámaras que importan en cada subtarea (por ejemplo, `d405_left` durante la inserción del cable en el puerto), con predicción de cajas por cámara a t+8 mediante 4 clases sobre 1024 bins. Esto reduce el coste computacional y concentra la capacidad del modelo en la región de la escena donde ocurre la manipulación fina.

El checkpoint corresponde a 5.000 de 30.000 actualizaciones del optimizador (loss de entrenamiento 0,319 en ese paso). Es un artefacto de investigación, no un modelo de propósito general: no genera texto libre ni código, sino que produce trayectorias de acción de 18 dimensiones para un robot concreto. No dispone de licencia declarada, de idiomas declarados ni de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en pi0.5 (pi05) con extension FoveaVLA; VLM con prediccion de subtarea + experto de accion condicionado |
| Parametros totales | 4.145.521.424 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Framework | LeRobot 0.6.2 (`pi05_foveavla_subtask`, fork `lerobot_foveavla`, rama `stage-views`) |
| Modelo base | lerobot/pi05_base |
| Entradas | 6 camaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right), estado 18-D |
| Salida | accion 18-D, chunk 50 (n_action_steps 30) |
| Espacio de acciones | relativo al estado actual; absoluto para right_index_joint2/3 y left_index_joint2/3 |
| Tamano del repo | 16,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y añade la extensión FoveaVLA. La arquitectura es un VLA con dos componentes acoplados: un VLM que, tras el prompt, escribe la subtarea actual en lenguaje natural ("grasp the board with the right hand", "insert the board into the control module") y un experto de acción que condiciona la generación de trayectorias sobre esa subtarea. Además, el VLM predice para cada cámara (zed_mini, d405_left, d405_right) 4 slots de caja, cada uno con 4 clases sobre 1024 bins, que estiman la caja de la cámara en t+8; el experto de acción nunca ve estas cajas, solo los recortes resultantes.

El entrenamiento se realizó por fine-tuning supervisado sobre siete datasets de la colección Hyundai Duet task 2 (demostraciones más rondas DAgger 1-3 de las subtareas 2 y 3), con un total aproximado de 962.000 fotogramas en 363 episodios. Se usó AdamW con lr pico 2,5e-05, warmup de 1.000 pasos y decaimiento coseno hasta 2,5e-06 en 30.000 pasos, precisión bf16 con pesos maestros fp32, gradient checkpointing y batch efectivo de 64 (32 por GPU en 2×B200 con DDP). El muestreo SIRIUS pondera demostración 0,5 / intervención 0,4 / robot ≤0,1 y excluye los 3 segundos previos a una toma de control. La foveación sigue un esquema por etapas: en subtareas de agarre y giro de cabeza solo se usan los 3 fotogramas completos; en las de inserción se añade un recorte RGB 224×224 de la caja exacta de la cámara correspondiente, y los recortes sin ventana se enmascaran fuera de la atención como si faltara la cámara. La pérdida combina flow matching con 0,1×CE de subtarea y, en las etapas de inserción, 0,1×CE de caja.

## Capacidades

- Predicción de subtarea de alto nivel en lenguaje natural a partir de las observaciones visuales y el prompt.
- Generación de acciones robóticas de 18 dimensiones en chunks de 50 pasos (30 ejecutados) para el robot Hyundai Duet.
- Control bimanual con espacio de acciones relativo al estado actual, salvo cuatro articulaciones de índice mantenidas en absoluto.
- Foveación selectiva por etapa: recortes 224×224 de las cámaras relevantes (zed_mini para el paso de cable, d405_left y d405_right para la inserción).
- Predicción de cajas por cámara a t+8 (centro x, centro y, lado) para guiar los recortes de la siguiente consulta.
- Procesamiento de 6 cámaras y estado 18-D como entrada.
- No soporta tool calling, agentes genéricos, generación de texto libre, código ni matemáticas: es un modelo específico de política robótica.

## Casos de uso

- Inserción de cable en un módulo de control con robot bimanual Hyundai Duet: el modelo genera la secuencia de acciones de 18-D para las subtareas 2 y 3 (pasar el cable de una mano a otra e insertarlo en el puerto), condicionado por la subtarea predicha y las vistas foveadas de las cámaras de muñeca.
- Investigación en foveación para VLA: sirve como referencia reproducible de un esquema de atención selectiva por etapas, con recortes exactos y enmascaramiento de cámaras ausentes, para comparar frente a políticas que procesan siempre todas las vistas.
- Estudio de predicción de subtareas como condicionamiento: permite evaluar cómo el hecho de que el VLM escriba la subtarea antes de que el experto de acción genere la trayectoria afecta a la estabilidad y a la tasa de éxito en tareas de manipulación fina.
- Aprendizaje por imitación con DAgger y muestreo ponderado: el checkpoint y sus datos asociados permiten reproducir el pipeline SIRIUS (demostración/intervención/robot) y analizar su efecto en el entrenamiento de políticas.
- Predicción de regiones de interés en imágenes de robot: los slots de caja por cámara a t+8 pueden reutilizarse como módulo de seguimiento de objeto para otras políticas que necesiten recortes de alta resolución.
- Despliegue en un banco de pruebas con LeRobot: integrable mediante `policy.type=pi05_foveavla_subtask` y `policy.config.fovea_scenario = "subtask2"` o `"subtask3"` para replicar la tarea en hardware o en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en el paso 5.000: 0,319 (flow + 0,1×CE de subtarea + 0,1×CE de caja en las etapas de inserción).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4.145 millones de parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB, a los que hay que sumar activaciones y buffers de las 6 cámaras.
- GPU de entrenamiento utilizadas: 2×NVIDIA B200 con DDP, batch 32 por GPU y gradient checkpointing.
- GPU recomendadas para inferencia: no disponible; por tamaño, una GPU con 16-24 GB de VRAM (A100 40 GB, L40S, RTX 4090) sería el mínimo razonable, aunque no se ha validado en la información disponible.
- Compatibilidad con GPU de consumo: probable en RTX 4090/3090 por tamaño de pesos, no confirmada.
- Opciones de despliegue: LeRobot 0.6.2 con el fork `lerobot_foveavla` (rama `stage-views`) y `lerobot_sirius`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_foveavla_stage (este) | 4.145 M | no disponible | VLA bimanual, task 2 Hyundai Duet | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base pi0.5 | no disponible | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación robótica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la task 2 (inserción de cable GRC) del robot Hyundai Duet, subtareas 2 y 3; no es reutilizable en otras tareas sin reentrenamiento.
- Checkpoint intermedio: corresponde a 5.000 de 30.000 pasos de entrenamiento, por lo que su rendimiento final puede ser inferior al de un checkpoint completo.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas no declarados: las subtareas se generan en inglés y no hay evidencia de soporte multilingüe.
- Dependencia de un fork concreto de LeRobot (`lerobot_foveavla`, rama `stage-views`) y de `lerobot_sirius`; la reproducibilidad fuera de ese entorno no está garantizada.
- Requiere configuración manual del escenario (`fovea_scenario`) antes de construir los procesadores; una configuración incorrecta altera las vistas de entrada y el comportamiento del modelo.
- Riesgo de alucinación en la subtarea predicha: si el VLM escribe una subtarea incorrecta, el experto de acción genera trayectorias condicionadas por un objetivo erróneo.
- Sesgos desconocidos: no hay información sobre la composición demográfica o de escenarios de los datasets de entrenamiento, ni sobre su cobertura de condiciones de iluminación u oclusión.
- Sin benchmarks publicados ni métricas de tasa de éxito en robot, lo que impide evaluar su robustez en producción.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_stage_sqbox_rel_chunk50_jitter0.05_sirius_bs64_1127_5k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Fork de LeRobot con FoveaVLA: https://github.com/HDR-SRL/lerobot_foveavla/tree/stage-views
- Dataset principal: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Dataset DAgger subtarea 2, ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r1
- Dataset DAgger subtarea 2, ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r2
- Dataset DAgger subtarea 2, ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask2_dagger_r3
- Dataset DAgger subtarea 3, ronda 1: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r1
- Dataset DAgger subtarea 3, ronda 2: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r2
- Dataset DAgger subtarea 3, ronda 3: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2_subtask3_dagger_r3
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/fbj3mr5u
