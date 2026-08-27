# HyeonseokE/smolvla_pull_cube_cap_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, desarrollado por Hugging Face y la comunidad LeRobot, que logra un rendimiento competitivo en tareas de manipulación robótica con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Este repositorio concreto, `HyeonseokE/smolvla_pull_cube_cap_2000_10fps`, es un fine-tune del modelo base `lerobot/smolvla_base` para una tarea específica: tirar de un cubo hasta un marcador objetivo, utilizando un robot SO-101 con dos cámaras (superior y muñeca izquierda). El modelo tiene 450 millones de parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra cómo un VLA compacto puede especializarse en una tarea de manipulación con un dataset reducido (100 episodios, 31.714 fotogramas a 10 FPS), manteniendo la viabilidad de ejecución en GPUs de gama media. Es un ejemplo práctico del flujo de trabajo de LeRobot para entrenar políticas robóticas por imitación, y su publicación en Hugging Face facilita la reproducibilidad y la comparación con otros fine-tunes de SmolVLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLA (modelo compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones para generar comandos motores a partir de observaciones de imágenes y estado. El modelo base `lerobot/smolvla_base` fue preentrenado en una amplia variedad de datos robóticos, y este fine-tune se especializa en la tarea "Pull the cube to the target marker" (tirar del cubo hasta el marcador). El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `HyeonseokE/pull_cube_cap_10fps`, que contiene 100 episodios y 31.714 fotogramas a 10 FPS. Se usaron 24.750 pasos de entrenamiento con batch size 64, optimizador AdamW, learning rate 0.0001 y semilla 2000. No se menciona el uso de RLHF ni DPO; es un fine-tune supervisado de imitación.

## Capacidades

- Control robótico de un brazo SO-101 (6 grados de libertad) mediante aprendizaje por imitación.
- Procesamiento de tres entradas de imagen (256x256 píxeles) y un vector de estado de 6 dimensiones.
- Generación de acciones continuas de 6 dimensiones (posiciones articulares o comandos de torque).
- Especialización en la tarea de manipulación "pull cube to target marker" (tirar de un cubo hacia un marcador).
- No soporta tool calling, agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües ni de generación de texto; es un policy puramente motor.

## Casos de uso

- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar la transferencia de políticas VLA compactas a tareas específicas, comparando con otros fine-tunes de SmolVLA.
- **Despliegue en robótica educativa**: al ser ligero (450M parámetros), puede ejecutarse en GPUs de consumo (p. ej., RTX 3060) para demostraciones en laboratorios universitarios o proyectos de fin de grado.
- **Benchmark de manipulación**: la tarea "pull cube" es un estándar en robótica; este modelo puede usarse como referencia para evaluar nuevos algoritmos de control o datasets.
- **Fine-tuning incremental**: a partir de este checkpoint, se pueden añadir nuevas tareas o variaciones (cambios de iluminación, posiciones de objetos) con datasets pequeños.
- **Validación de pipelines de LeRobot**: el repositorio incluye instrucciones de rollout y entrenamiento, útil para verificar la integración de hardware y software en un robot SO-101.
- **Estudio de robustez visual**: al usar dos cámaras (superior y muñeca), permite analizar cómo afecta la oclusión o el cambio de perspectiva al rendimiento del policy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras, ya que es un modelo de control robótico y no de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: con 450M parámetros, en fp16 el peso ocupa ~0,9 GB; con overhead de activaciones y procesamiento de imágenes, se estima un consumo de 2-4 GB en inferencia. No hay datos oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 3060) debería ser suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070/4070, A100 si se dispone).
- **Despliegue**: compatible con el framework LeRobot, que soporta inferencia en PyTorch con CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia**: no disponible. Depende de la GPU y de la resolución de las imágenes de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con otros modelos de la misma categoría. Existen otros fine-tunes de SmolVLA en Hugging Face (p. ej., `HyeonseokE/smolvla_phase1_pick_place_A2_2000_10fps`), pero no se han publicado métricas comparativas. El modelo base `lerobot/smolvla_base` es el punto de referencia natural, pero no se dispone de sus resultados en esta tarea concreta.

## Limitaciones y advertencias

- **Especialización estrecha**: el modelo solo realiza la tarea "pull cube to target marker" con el robot SO-101 y las cámaras específicas; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- **Sin evaluación en robot real**: no hay resultados de éxito reportados, por lo que su rendimiento real es desconocido; podría fallar en condiciones de iluminación, oclusión o variaciones de posición no vistas en el dataset.
- **Dependencia del dataset**: el entrenamiento se realizó con 100 episodios a 10 FPS, lo que limita la robustez frente a perturbaciones.
- **Sin capacidades de lenguaje**: no es un modelo conversacional ni de razonamiento; no debe usarse fuera del contexto robótico.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se recomienda revisar las licencias de los componentes.
- **Fechas futuras**: el repositorio fue creado en agosto de 2026, lo que sugiere que es un artefacto de investigación reciente; verificar la vigencia de las versiones de LeRobot.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/HyeonseokE/smolvla_pull_cube_cap_2000_10fps)
- [Dataset de entrenamiento](https://huggingface.co/datasets/HyeonseokE/pull_cube_cap_10fps)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Paper de SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Documentación de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Fork de LeRobot con chunk-wise delta joint actions](https://github.com/HyeonseokE/kaia_lerobot)
