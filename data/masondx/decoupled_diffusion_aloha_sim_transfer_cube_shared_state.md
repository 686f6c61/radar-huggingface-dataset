# masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state

## Resumen

El modelo `masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state` es una política de aprendizaje por imitación (imitation learning) para control robótico bimanual, entrenada con el framework LeRobot de Hugging Face. Fue desarrollada por el usuario masondx (Hongming Mei) y publicada en agosto de 2026. Resuelve el problema de transferencia de objetos entre dos brazos robóticos, concretamente la tarea de recoger un cubo con el brazo derecho y pasarlo al brazo izquierdo en un entorno simulado ALOHA.

La arquitectura empleada es `decoupled_bimanual_diffusion`, una variante de diffusion policy que desacopla el control de ambos brazos, lo que permite una mayor flexibilidad en la generación de acciones coordinadas. El modelo cuenta con aproximadamente 526,85 millones de parámetros y se distribuye bajo licencia Apache 2.0 en formato safetensors. Es relevante porque demuestra la aplicación práctica de diffusion policies en robótica bimanual, un campo con alta demanda de control coordinado y preciso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoupled bimanual diffusion policy (variante de diffusion policy) |
| Parametros totales | 526.850.558 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible (pesos en float32 en safetensors) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es una **diffusion policy desacoplada para control bimanual** (`decoupled_bimanual_diffusion`). A diferencia de las diffusion policies estándar que generan secuencias de acciones completas desde el estado observado, esta variante descompone la generación de acciones para cada brazo de forma independiente, aunque comparten la misma observación global. Esto permite que cada brazo aprenda su propia dinámica de control mientras el modelo mantiene coherencia global de la tarea.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre el dataset `lerobot/aloha_sim_transfer_cube_human`, que contiene 50 episodios con 20.000 frames capturados a 50 FPS. La configuración de entrenamiento incluyó 100.000 pasos con batch size 8, optimizador Adam con learning rate 0.0001 y semilla fija 1000. No se menciona el uso de técnicas de refuerzo como RLHF o DPO, ya que es un pipeline de aprendizaje por imitación supervisada.

Las observaciones del modelo consisten en una imagen de cámara `top` con resolución 480x640 píxeles y un vector de estado de 14 dimensiones (posición de las articulaciones de ambos brazos). La salida es un vector de acción de 14 dimensiones que controla ambos brazos.

## Capacidades

- Control robótico bimanual: genera acciones coordinadas para dos brazos robóticos ALOHA.
- Aprendizaje por imitación: replica la estrategia demostrada en los episodios del dataset.
- Manejo de observaciones multimodales: combina entrada visual (imagen de cámara) con estado propioceptivo (posición de articulaciones).
- Tarea específica: transferencia de cubo entre brazos (pick up con derecha, transferir a izquierda).
- Generación de acciones a alta frecuencia: el dataset se capturó a 50 FPS, lo que sugiere capacidad de control en tiempo real.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot.
- Sin capacidades lingüísticas ni de razonamiento general: es un modelo puramente de control motor, no un LLM.

## Casos de uso

- Manipulación bimanual en simulación: usar el modelo para evaluar políticas de control coordinado en entornos simulados ALOHA antes de transferirlas a robots reales.
- Transferencia de objetos entre manos: aplicable en líneas de ensamblaje donde un robot debe pasar componentes de una pinza a otra.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar diffusion policies desacopladas frente a variantes acopladas en tareas bimanuales.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede predecir acciones que luego se filtran o combinan con comandos de un operador humano.
- Benchmark de robótica: útil para evaluar el rendimiento de la arquitectura `decoupled_bimanual_diffusion` frente a otras políticas en el dataset `aloha_sim_transfer_cube_human`.
- Formación de estudiantes de robótica: permite experimentar con el pipeline completo de LeRobot (grabación, entrenamiento, evaluación) sobre una tarea clásica de manipulación bimanual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de tasa de éxito en la tarea, ni comparaciones con otras políticas (ACT, Diffusion Policy, VINN) en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente. Con 526 millones de parámetros en float32 (aproximadamente 2,1 GB), la inferencia con batch de 1 debería caber en una GPU de consumo con al menos 6 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA y suficiente VRAM. Para entrenamiento se usó una GPU con al menos 8 GB (configuración de batch 8 con imágenes 480x640).
- Consumer GPU: sí, modelos como RTX 3060, RTX 4060 o RTX 4090 son suficientes para inferencia; para entrenamiento se recomienda al menos una RTX 3080 o superior.
- Opciones de despliegue: mediante el CLI de LeRobot (`lerobot-rollout`), compatible con el robot ALOHA real y con simuladores. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El control robótico en tiempo real exige latencias bajas, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state | Decoupled bimanual diffusion | 526,85 M | n/a | Apache 2.0 | Safetensors |
| masondx/diffusion_aloha_sim_transfer_cube-ema | Diffusion policy estándar (con EMA) | no disponible | n/a | Apache-2.0 | Safetensors |
| ACT (Action Chunking with Transformers) | Transformer-based | no disponible | n/a | MIT (referencia) | no disponible |

No se dispone de comparativas de rendimiento publicadas entre estos modelos. La variante `diffusion_aloha_sim_transfer_cube-ema` del mismo autor usa una diffusion policy clásica con EMA, mientras que el modelo de esta ficha introduce el desacoplamiento bimanual. No hay datos que permitan cuantificar la mejora.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real ni en simulación: no se conoce la tasa de éxito real de la política.
- Es un modelo de tarea específica: solo está entrenado para la tarea de transferencia de cubo entre dos brazos; no generaliza a otras tareas sin reentrenamiento.
- Dependencia de las condiciones de simulación: el dataset proviene de ALOHA en simulación; la transferencia a un robot físico puede degradar el rendimiento.
- Sensibilidad a la posición de cámara: el modelo usa una única cámara `top`; cambios en la posición, iluminación u oclusión pueden afectar severamente el control.
- Limitación de contexto temporal: al ser una diffusion policy, la generación de acciones se basa en ventanas de observación finitas; no mantiene memoria de largo plazo.
- Licencia Apache 2.0: permite uso comercial, pero no hay garantías de seguridad para aplicaciones industriales críticas.
- Riesgo de alucinación de acciones: en estados fuera de la distribución de entrenamiento, el modelo puede generar acciones irreales o inseguras; se recomienda supervisión humana.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/masondx/decoupled_diffusion_aloha_sim_transfer_cube_shared_state
- Perfil del autor: https://huggingface.co/masondx
- Variante del modelo con diffusion estándar: https://huggingface.co/masondx/diffusion_aloha_sim_transfer_cube-ema
- Dataset utilizado: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_transfer_cube_human
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
