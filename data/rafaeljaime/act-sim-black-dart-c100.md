# RafaelJaime/act-sim-black-dart-c100

## Resumen

`act-sim-black-dart-c100` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), publicada por el usuario RafaelJaime en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: es un controlador visomotor entrenado con LeRobot 0.6.2 que, a partir de dos cámaras (vista superior y vista de muñeca) y del estado articular de 6 dimensiones de un brazo `so_follower` (SO-101), predice directamente comandos de acción de 6 dimensiones para la tarea "grasp the seed below the gripper".

El modelo resuelve un problema concreto de manipulación: el agarre de una semilla en un entorno simulado MuJoCo (el "SmartSeed MuJoCo twin" con semilla negra). Se entrenó sobre el dataset `RafaelJaime/smartseed-sim-grasp-black-v5-dart`, con 600 episodios y 176.974 fotogramas a 30 FPS, durante 40.000 pasos con batch de 32, optimizador AdamW y learning rate de 1e-5. Con 51.668.614 parámetros y un repositorio de 2,5 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware modesto.

Su relevancia es acotada pero clara: forma parte del ecosistema LeRobot y del hackathon RoboTekin, y sirve como referencia reproducible de un pipeline completo de imitation learning sim-a-real (o sim-a-sim) para brazos SO-101. El checkpoint marcado como mejor (`checkpoints/020000`) logró levantar una semilla más de 3 cm en 9 de 30 episodios en escenas de layout estrecho del gemelo MuJoCo, lo que da una tasa de éxito del 30 % en esa evaluación concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se pasa como cadena fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras de entrada | `top` y `wrist`, imágenes `(3, 480, 640)` |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida | `action` de forma `(6,)` |
| Dataset de entrenamiento | `RafaelJaime/smartseed-sim-grasp-black-v5-dart` (600 episodios, 176.974 frames, 30 FPS) |
| Pasos de entrenamiento | 40.000 (batch 32, AdamW, LR 1e-5, seed 1000) |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 2,5 GB |
| Descargas en Hugging Face | 18 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice chunks de acciones (secuencias cortas) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La política combina un backbone visual (procesa las dos cámaras a 480×640) con un transformer que fusiona las representaciones visuales y el vector de estado de 6 dimensiones, y un decodificador que emite el chunk de acciones de 6 dimensiones. El paper de referencia es arXiv:2304.13705 (Zhao et al., 2023).

El entrenamiento se hizo íntegramente en simulación sobre el dataset SmartSeed, con 600 episodios teleoperados de la tarea de agarre de semilla negra. La configuración es la estándar de LeRobot para ACT: 40.000 pasos, batch 32, AdamW con LR 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es imitation learning supervisado puro sobre demostraciones. El checkpoint `020000` se seleccionó como mejor modelo sobre escenas de layout estrecho del gemelo MuJoCo.

## Capacidades

- Control visomotor de un brazo SO-101 (`so_follower`) a partir de dos cámaras y del estado articular.
- Predicción de chunks de acción de 6 dimensiones para agarre de objetos.
- Ejecución de la tarea específica "grasp the seed below the gripper" en el entorno simulado SmartSeed.
- Integración nativa con el stack LeRobot (`lerobot-rollout`, `lerobot-train`).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica.
- Capacidades especiales: ninguna documentada más allá de la política de agarre; no hay thinking mode, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en imitation learning: sirve como baseline reproducible de ACT sobre SO-101 para comparar variantes de arquitectura, aumentos de datos o estrategias de chunking en un pipeline LeRobot estándar.
- Reproducción de experimentos sim-a-sim: permite replicar el entrenamiento y la evaluación sobre el gemelo MuJoCo SmartSeed con el dataset público, útil para validar cambios en el entorno antes de pasar a hardware real.
- Prototipado de agarre con SO-101: el modelo se puede desplegar con `lerobot-rollout` sobre un `so_follower` real para comprobar la transferencia de la política simulada a un brazo físico de bajo coste.
- Docencia y formación en robótica: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, es adecuado para cursos que cubran el ciclo completo de teleoperación, grabación de datos y entrenamiento de políticas.
- Benchmark de infraestructura de inferencia robótica: con 2,5 GB de repositorio y pesos safetensors, permite medir latencia y throughput de políticas ACT en GPUs de consumo dentro de pipelines LeRobot.
- Base para fine-tuning en tareas de pick-and-place: el checkpoint puede servir de inicialización para datasets propios de agarre con el mismo robot y configuración de cámaras, reduciendo el coste de entrenamiento desde cero.
- Validación de entornos simulados: la tasa de éxito del 30 % en layout estrecho (9/30) permite calibrar la dificultad del gemelo MuJoCo y detectar discrepancias entre simulación y realidad.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no aplican a una política robótica. El único dato de evaluación disponible es el del mejor checkpoint:

| Evaluación | Entorno | Episodios | Éxitos | Tasa de éxito |
|---|---|---|---|---|
| Levantar semilla > 3 cm | SmartSeed MuJoCo twin, layout narrow (`sim/eval.py --layout narrow`) | 30 | 9 | 30 % |

No se han publicado resultados de benchmarks adicionales ni evaluaciones en robot real en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de imagen (dos cámaras a 480×640) y el runtime de LeRobot.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente por tamaño; se espera que funcione en RTX 3060/4060 y superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con al menos 4-6 GB de VRAM efectiva, aunque el dato exacto no está documentado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=RafaelJaime/act-sim-black-dart-c100`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; la política está pensada para ejecución a 30 FPS (frecuencia del dataset), pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `RafaelJaime/act-sim-black-dart-c100` | ACT | 51,7 M | 2 cámaras 480×640 + estado (6,) | Agarre de semilla en simulación | Apache 2.0 | Hugging Face (18 descargas) |
| Políticas ACT genéricas de LeRobot | ACT | variable (del orden de decenas de millones) | Configurable según robot | Imitation learning general | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | no disponible | Configurable según robot | Imitation learning general | según implementación | Repositorios de investigación |
| Políticas VLA (p. ej. RT-2, OpenVLA) | Transformer visión-lenguaje-acción | miles de millones | Imagen + instrucción en lenguaje | Manipulación generalista | variable | Hugging Face / investigación |

La comparación directa con políticas VLA no es homogénea: este modelo es una política específica de tarea, sin comprensión de lenguaje, mientras que los VLA generalizan a múltiples instrucciones a costa de mucho mayor tamaño y requisitos de cómputo. Frente a otras políticas ACT de LeRobot, la diferencia principal es el dataset y la tarea concreta, no la arquitectura.

## Limitaciones y advertencias

- Modelo específico de tarea: solo ejecuta "grasp the seed below the gripper"; no generaliza a otras instrucciones ni objetos sin reentrenamiento.
- Entrenado en simulación: no hay evaluación en robot real documentada, por lo que la transferencia sim-a-real es incierta.
- Tasa de éxito limitada: 30 % (9/30) en el mejor checkpoint sobre layout estrecho; insuficiente para producción sin refinamiento.
- Sin datos de sesgo, alucinación o robustez: no se documentan análisis de sensibilidad a iluminación, posiciones de objeto o distracciones.
- Dependencia de la configuración de hardware: las cámaras deben coincidir con los nombres y la resolución de entrenamiento (`top`, `wrist`, 480×640, 30 FPS) y el robot debe ser un `so_follower` calibrado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Ecosistema muy específico: requiere LeRobot 0.6.2 o compatible; no es portable a stacks de inferencia de modelos de lenguaje.
- Madurez baja: 18 descargas y 0 likes en el momento de la consulta, sin issues ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RafaelJaime/act-sim-black-dart-c100
- Dataset de entrenamiento: https://huggingface.co/datasets/RafaelJaime/smartseed-sim-grasp-black-v5-dart
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RafaelJaime/smartseed-sim-grasp-black-v5-dart
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
