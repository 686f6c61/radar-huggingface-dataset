# mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__ab_b100

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. La política combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow-matching, y predice comandos motores condicionados por observaciones visuales, instrucciones en lenguaje natural y propriocepción. El checkpoint aquí publicado suma 3.144.016.000 parámetros y ocupa 50,3 GB en el repositorio.

El modelo está especializado en una tarea concreta de manipulación pick-and-place sobre una plataforma compuesta `Panda+UR5e`, con tres cámaras (`agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`) y un vector de estado de 9 dimensiones que produce acciones de 7 dimensiones. Fue entrenado con 1526 episodios y 377.262 frames a 20 FPS, procedentes de un dataset simulado y real fusionado (`mim-chess-vlas-...-sim__all_cameras__live`), cubriendo 40 variantes de la instrucción "Pick the X and place it into the box".

Es relevante ahora porque ejemplifica el flujo actual de políticas fundacionales de robótica: un backbone VLM grande preentrenado más una cabeza de acción entrenada por imitación, publicadas directamente en el Hub con licencia Apache 2.0 y reproducibles mediante la CLI de LeRobot. Aunque su utilidad fuera de la tarea y del robot específicos es limitada, sirve como referencia para estudiar transferencia, ajuste fino y despliegue de GR00T en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow-matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7 de NVIDIA: un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que codifica las imágenes de cámara y las instrucciones textuales, acoplado a un transformer de acciones que genera trayectorias mediante flow-matching. La política consume tres vistas visuales de 224×224 píxeles, un vector de propriocepción de 9 componentes y produce un vector de acción de 7 componentes. El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos, con batch size de 16, optimizador AdamW, learning rate 7e-05 y semilla 0.

Los datos de entrenamiento provienen de un dataset fusionado de simulación y realidad con 1526 episodios y 377.262 frames a 20 FPS, cubriendo 40 instrucciones distintas de tipo "Pick the X and place it into the box" sobre objetos variados (alimentos, utensilios, menaje). No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni innovaciones adicionales más allá de la propia arquitectura GR00T.

## Capacidades

- Manipulación robótica pick-and-place condicionada por lenguaje: ejecuta instrucciones del tipo "Pick the <objeto> and place it into the box" sobre 40 categorías de objetos.
- Percepción multi-cámara: integra tres vistas simultáneas (vista de agente y dos cámaras en la muñeca).
- Fusión visión-lenguaje-propriocepción: usa el backbone VLM para interpretar la escena y la instrucción, y la cabeza de acción para generar comandos motores.
- Control de efector final de 7 dimensiones sobre plataforma `Panda+UR5e`.
- Política de imitación entrenada de extremo a extremo, sin planificación simbólica explícita.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo general ni modos de razonamiento extendido; el modelo es una política robótica, no un LLM conversacional.

## Casos de uso

- Automatización de picking en laboratorio: recoger objetos variados (alimentos, utensilios) y depositarlos en una caja, usando las tres cámaras para localizar el objeto y verificar la pinza.
- Investigación en aprendizaje por imitación: servir como checkpoint de referencia para estudiar ajuste fino de GR00T N1.7 sobre datasets propios con LeRobot.
- Evaluación de transferencia sim-a-real: comparar el rendimiento del mismo checkpoint en entornos simulados y reales, dado que el dataset de entrenamiento fusiona ambas fuentes.
- Benchmarking de políticas fundacionales: usar la política como línea base al comparar variantes de backbone, resolución de cámara o esquemas de flow-matching.
- Prototipado de pipelines de datación y entrenamiento: replicar el flujo `lerobot-record` → `lerobot-train` → `lerobot-rollout` con la misma configuración (60.000 pasos, batch 16, lr 7e-05) para validar infraestructura.
- Docencia y demostraciones de robótica: ilustrar el ciclo completo de una política VLA en un robot de dos brazos con cámara en muñeca.
- Pruebas de robustez ante variación de objeto: al cubrir 40 categorías, permite medir generalización dentro de la misma tarea con cambios de objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 50,3 GB en safetensors, lo que sugiere que la inferencia en precisión completa requiere del orden de 50 GB o más de memoria, aunque no se documenta oficialmente.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs de数据中心 (A100/H100) para carga completa, pero no hay confirmación del autor.
- Compatibilidad con GPU de consumo: no confirmada; con cuantización agresiva podría intentarse en RTX 4090 (24 GB), pero no hay datos publicados al respecto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--robot.type=Panda+UR5e`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 sobre Panda+UR5e) | 3.144.016.000 | no disponible | Pick-and-place específico, 40 objetos | apache-2.0 | Hugging Face |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible | GitHub Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | del orden de millones a decenas de millones | no disponible | Tareas de manipulación específicas | no disponible | Hugging Face / LeRobot |

La comparación con alternativas de la misma categoría (políticas fundacionales VLA) no está disponible en la información proporcionada más allá de la referencia al GR00T base de NVIDIA.

## Limitaciones y advertencias

- Especialización estrecha: entrenado para una única tarea y plataforma (`Panda+UR5e`); no se espera generalización a otros robots, tareas o morfologías sin reentrenamiento.
- Dataset limitado: 1526 episodios y 377.262 frames, con 40 variantes de una misma instrucción; la cobertura de escenarios es acotada.
- Riesgo de sobreajuste al entorno: la mezcla sim+real puede provocar discrepancias de dominio si se despliega en escenas visualmente distintas.
- Idiomas: las instrucciones del dataset están en inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados en la información disponible; al ser un modelo entrenado por imitación, puede heredar sesgos de las demostraciones (posiciones, objetos y condiciones presentes en el dataset).
- Alucinación: no aplica en el sentido de texto generativo, pero la política puede producir acciones erróneas o inseguras ante objetos o configuraciones fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; verificar la licencia del backbone GR00T subyacente antes de producción.
- Caveat de producción: 0 descargas y 0 likes en el Hub; no hay evidencia de validación externa ni métricas de éxito publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__ab_b100
- Dataset de entrenamiento: https://huggingface.co/datasets/lets-merged/mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live_mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lets-merged/mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live_mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
