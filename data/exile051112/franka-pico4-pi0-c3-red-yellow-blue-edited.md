# Exile051112/franka-pico4-pi0-c3-red-yellow-blue-edited

## Resumen

Este repositorio contiene un adaptador PEFT LoRA entrenado sobre el modelo base `lerobot/pi0_base` para el control de un brazo robótico Franka/Pico4 en el contexto de un experimento de manipulación con objetos de colores (condición `c3_red_yellow_blue_edited`). El adaptador fue desarrollado por el usuario Exile051112 y publicado en Hugging Face bajo licencia Gemma. No es un modelo completo, sino un conjunto de pesos LoRA de aproximadamente 5,6 MB que debe cargarse sobre el modelo base `pi0_base` (que requiere acceso gated en Hugging Face).

El modelo resuelve el problema de aprendizaje por imitación para tareas robóticas específicas, adaptando un modelo VLA (Vision-Language-Action) preentrenado a una configuración concreta de robot, cámaras y espacio de acciones. Su relevancia radica en que demuestra un flujo de fine-tuning eficiente con LoRA para robótica, reduciendo drásticamente los requisitos de almacenamiento y cómputo frente a un fine-tuning completo. La arquitectura subyacente es la de `pi0_base`, un modelo de acción visual-lenguaje de Physical Intelligence, aunque los detalles específicos de dicha arquitectura no se proporcionan en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `lerobot/pi0_base` (modelo VLA) |
| Parametros totales | No disponible (el adaptador pesa ~5,6 MB; el modelo base no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se entrena en bfloat16) |
| Idiomas soportados | No disponible (modelo orientado a control robótico, no a lenguaje) |
| Licencia | Gemma |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se basa en PEFT LoRA con rango `r=16` y `lora_alpha=16`, aplicado sobre el modelo base `lerobot/pi0_base`. El entrenamiento se realizó con PyTorch LeRobot durante 10.000 pasos, con batch size 4, precisión bfloat16 y gradient checkpointing. El dataset de entrenamiento corresponde a la condición `c3_red_yellow_blue_edited`, que implica la manipulación de objetos rojos, amarillos y azules con el robot Franka/Pico4. La política espera dos flujos de cámara RGB (`observation.images.top` y `observation.images.wrist`), un estado de 17 dimensiones y una acción TCP (Tool Center Point) de 10 dimensiones. No se proporcionan detalles sobre la arquitectura interna de `pi0_base` (número de parámetros, tipo de transformer, etc.) en la información disponible.

## Capacidades

- Control robótico por imitación: el adaptador predice acciones TCP de 10 dimensiones a partir de observaciones visuales (dos cámaras) y estado del robot.
- Especialización en tareas de manipulación con objetos de colores específicos (rojo, amarillo, azul) en el entorno Franka/Pico4.
- Fine-tuning eficiente mediante LoRA: permite adaptar un modelo VLA preentrenado con un coste de almacenamiento mínimo.
- Integración con el ecosistema LeRobot: compatible con la librería `lerobot` y su pipeline de entrenamiento e inferencia.
- No incluye capacidades de lenguaje natural, generación de texto, razonamiento general, tool calling ni agentes autónomos fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede controlar el brazo Franka/Pico4 para recoger y colocar objetos de colores específicos, útil en líneas de clasificación o experimentos de manipulación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA a nuevos robots o configuraciones de cámaras mediante LoRA.
- Prototipado rápido de políticas robóticas: al ser un adaptador ligero, permite iterar rápidamente sobre el modelo base sin necesidad de reentrenar desde cero, reduciendo costes de cómputo y almacenamiento.
- Validación de pipelines de control en simulación y real: el adaptador puede cargarse en entornos de simulación (por ejemplo, con MuJoCo o Isaac Sim) para verificar la política antes del despliegue físico.
- Benchmarking de adaptadores LoRA en robótica: permite comparar el rendimiento de diferentes configuraciones de LoRA (rango, alpha, dataset) sobre el mismo modelo base.
- Educación y formación en robótica con IA: el repositorio sirve como ejemplo práctico de fine-tuning de un VLA con LeRobot, útil para cursos de robótica o aprendizaje automático aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como tasa de éxito en tareas, precisión de acciones, ni comparaciones con otros modelos o adaptadores.

## Requisitos de hardware

- Al ser un adaptador LoRA, no es un modelo independiente; requiere cargar el modelo base `lerobot/pi0_base`, cuyos requisitos de hardware no se especifican en la información disponible.
- El adaptador en sí es muy ligero (~5,6 MB), por lo que el almacenamiento no es un problema.
- Se desconoce la VRAM necesaria para la inferencia del modelo base. Dado que `pi0_base` es un VLA de gran tamaño (típicamente varios miles de millones de parámetros), se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A10G, A100) para inferencia en bfloat16, pero esto es una estimación general no confirmada.
- Opciones de despliegue: el adaptador está diseñado para usarse con la librería LeRobot de PyTorch. No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores o modelos de control robótico. Se puede mencionar que existen otros adaptadores del mismo autor (por ejemplo, `franka-pico4-smolvla-c2-red-yellow-blue-real`), pero no se ofrecen datos comparativos.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere el modelo base `lerobot/pi0_base`, que está protegido por acceso gated en Hugging Face.
- Está entrenado específicamente para la configuración Franka/Pico4 con dos cámaras y un espacio de acción concreto. Cualquier cambio en la disposición de cámaras, calibración o límites de seguridad puede invalidar la política.
- La licencia Gemma impone restricciones de uso comercial y redistribución que deben revisarse antes de su implementación en producción.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos no deseados, pero al ser un modelo de control robótico, el riesgo principal es la ejecución de acciones inseguras si no se validan adecuadamente los límites del robot.
- El dataset de entrenamiento (`c3_red_yellow_blue_edited`) es específico y limitado; la generalización a otros objetos, colores o entornos no está garantizada.
- No hay información sobre la calidad del adaptador (por ejemplo, tasa de éxito en tareas reales), por lo que se recomienda una validación exhaustiva antes de cualquier despliegue físico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Exile051112/franka-pico4-pi0-c3-red-yellow-blue-edited
- Modelo base (gated): https://huggingface.co/lerobot/pi0_base
- Repositorio de referencia para pi0-franka (GitHub): https://github.com/hca-lab-UofAlberta/pi0-franka-robot
- Discusión de un adaptador similar del mismo autor: https://huggingface.co/Exile051112/franka-pico4-smolvla-c2-red-yellow-blue-real/discussions
