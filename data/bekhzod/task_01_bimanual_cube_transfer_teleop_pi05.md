# Bekhzod/TASK_01_bimanual_cube_transfer_teleop_pi05

## Resumen

Este repositorio contiene una política de imitación entrenada con LeRobot sobre la arquitectura SmolVLA, un modelo visión-lenguaje-acción (VLA) compacto presentado en el paper arXiv:2506.01844. El modelo parte del checkpoint base `lerobot/smolvla_base` y se ha ajustado fino para una tarea concreta de manipulación bimanual con un robot Fairino: coger un cubo con el brazo derecho, depositarlo en el centro y colocarlo en una caja con el brazo izquierdo. Lo publica el usuario Bekhzod como artefacto de un experimento de teleoperación, no como modelo de propósito general.

La relevancia de este tipo de políticas radica en que SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que abarata el ciclo de recogida de datos, entrenamiento y despliegue en robótica de manipulación. Sin embargo, conviene subrayar que se trata de un ajuste fino sobre 75 episodios y 49.128 fotogramas de un único dataset, por lo que su ámbito de validez es muy estrecho y no debe confundirse con el modelo base SmolVLA.

No se dispone de información sobre el número de parámetros del modelo en la información proporcionada, y el autor no ha publicado resultados de evaluación en robot real. El repositorio aparece con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo visión-lenguaje-acción compacto, según arXiv:2506.01844) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Tipo de robot | Fairino (bimanual) |
| Cámaras de entrada | `top`, `left`, `right` (3 × 480 × 640) |
| Dimensión de observación | `observation.state` de forma `(14,)` |
| Dimensión de acción | `action` de forma `(14,)` |
| Dataset de entrenamiento | `Bekhzod/TASK_01_bimanual_cube_transfer_teleop_train` |
| Episodios / fotogramas | 75 episodios / 49.128 fotogramas a 30 FPS |
| Pasos de entrenamiento | 100.000 |
| Tamaño del repositorio | 0.0 GB (según la ficha de Hugging Face) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, entrenado para mapear observaciones multimodales (imágenes de varias cámaras más el estado proprioceptivo del robot) a comandos motores. El paper de referencia (arXiv:2506.01844) lo presenta como una alternativa compacta orientada a hardware de consumo, pero la información proporcionada no detalla la composición exacta de bloques, el número de parámetros ni la longitud de contexto del modelo base.

El ajuste fino se realizó con LeRobot 0.6.1 durante 100.000 pasos, con batch size 32, optimizador AdamW, learning rate 0.001 y semilla 1000. El dataset contiene 75 episodios de teleoperación sobre una única tarea lingüística ("pick up the cube with the right arm, place it in the middle, then put it in the box with the left arm"), grabados a 30 FPS con tres cámaras y un estado de 14 dimensiones que corresponde a las articulaciones de los dos brazos del robot Fairino. No se especifica si hubo aumento de datos, mezcla con el dataset original de SmolVLA ni ninguna técnica de regularización adicional.

## Capacidades

- Generación de acciones motoras de 14 dimensiones a partir de observaciones visuales de tres cámaras y del estado articular del robot.
- Ejecución de una tarea bimanual específica de transferencia de un cubo (pick-and-place en dos fases).
- Condicionamiento por instrucción en lenguaje natural, limitado a la frase de tarea del dataset de entrenamiento.
- Inferencia en tiempo real a 30 FPS, coherente con la frecuencia de captura del dataset.
- Integración con el ecosistema LeRobot mediante el comando `lerobot-rollout`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo multilingüe ni modalidades de audio.

## Casos de uso

- **Investigación en imitación bimanual**: servir como punto de partida reproducible para comparar estrategias de teleoperación y ajuste fino sobre SmolVLA en un robot Fairino, dado que el dataset y la configuración de entrenamiento están publicados.
- **Reproducción de experimentos de VLA compactos**: el par dataset + política permite replicar el pipeline completo (grabación, entrenamiento, rollout) con LeRobot 0.6.1 y verificar la viabilidad de SmolVLA en hardware asequible.
- **Docencia y formación en robótica de manipulación**: útil en cursos donde se quiera mostrar el ciclo de vida de una política de imitación desde la teleoperación hasta el despliegue, con una tarea acotada y fácil de instrumentar.
- **Prototipado de células de pick-and-place**: la política puede probarse en una celda con dos brazos y tres cámaras para evaluar la robustez de SmolVLA ante variaciones de iluminación o posición del cubo, aunque sin garantías de éxito fuera de la distribución de entrenamiento.
- **Generación de datos sintéticos y aumento**: usar la política como generador de trayectorias candidatas para ampliar el dataset original antes de un reentrenamiento, siempre que se valide la calidad de las ejecuciones.
- **Banco de pruebas de latencia y throughput**: al estar pensada para hardware de consumo, permite medir tiempos de inferencia de SmolVLA en GPUs de gama media dentro de un lazo de control a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el número de parámetros del modelo no se especifica en la información proporcionada).
- GPU recomendadas: no disponibles; el paper de SmolVLA indica que está pensado para hardware de consumo, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: según la descripción del modelo base, SmolVLA está diseñado para desplegarse en hardware de consumo, aunque no se confirma para este ajuste fino concreto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), con soporte de CUDA mediante `--policy.device=cuda` en entrenamiento. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas VLA de robótica.
- Latencia y throughput: no disponibles; el lazo de control se ejecuta a 30 FPS según la frecuencia del dataset, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Bekhzod/TASK_01_bimanual_cube_transfer_teleop_pi05` | no disponible | no disponible | Pick-and-place bimanual (Fairino) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible | no disponible | VLA generalista para manipulación | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación diversa | no disponible | Ecosistema LeRobot |

La comparación cuantitativa con alternativas no es posible con los datos disponibles; la única referencia clara es el modelo base del que deriva este ajuste fino.

## Limitaciones y advertencias

- **Ámbito de validez muy estrecho**: entrenada sobre una única tarea y un único robot (Fairino), con 75 episodios; no hay evidencia de generalización a otras posiciones, objetos o entornos.
- **Sin evaluación publicada**: el autor no reporta tasa de éxito ni número de ensayos en robot real, por lo que se desconoce su fiabilidad.
- **Sesgos y alucinaciones**: en políticas de imitación, el equivalente es la extrapolación incorrecta ante estados fuera de distribución; no se documentan análisis al respecto.
- **Dependencia de la instrucción exacta**: el condicionamiento lingüístico está limitado a la frase de tarea del dataset; variaciones en el prompt pueden degradar el comportamiento.
- **Requisitos de hardware específicos**: la política espera tres cámaras con nombres `top`, `left` y `right` y un estado de 14 dimensiones; un montaje distinto invalida su uso.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías; conviene revisar también la licencia del modelo base `lerobot/smolvla_base`.
- **Repositorio sin actividad**: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bekhzod/TASK_01_bimanual_cube_transfer_teleop_pi05
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Bekhzod/TASK_01_bimanual_cube_transfer_teleop_train
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Bekhzod/TASK_01_bimanual_cube_transfer_teleop_train
