# masondx/diff_new_tension_cut_rope_rot_state20

## Resumen

Este modelo es una política de difusión (Diffusion Policy) para control visuomotor de robots, entrenada con la librería LeRobot de Hugging Face. Está diseñada para la tarea de cortar una cuerda bajo tensión (new_tension_cut_rope), un escenario de manipulación de contacto que requiere generar trayectorias de acción suaves y multi-paso. El modelo fue desarrollado por el usuario masondx y se distribuye bajo licencia Apache-2.0.

La arquitectura se basa en el enfoque descrito en el paper "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion" (arXiv:2303.04137), que trata el control visuomotor como un proceso generativo de difusión. El modelo cuenta con 277.224.436 parámetros (aproximadamente 277 millones) y sus pesos están en formato safetensors, ocupando 1,1 GB en el repositorio. Es relevante porque representa una aplicación práctica de políticas de difusión en manipulación robótica contact-rich, un área de investigación activa en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (UNet condicionado por observaciones visuales) |
| Parametros totales | 277.224.436 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, una arquitectura que modela la política de control como un proceso de difusión denoising. En lugar de predecir directamente una acción, el modelo genera una trayectoria completa de acciones (multi-step action trajectory) mediante un proceso iterativo de denoising, condicionado por las observaciones del robot (imagenes y estados de las articulaciones). Este enfoque produce acciones suaves y coherentes, especialmente adecuadas para tareas de manipulación que requieren contacto físico, como cortar una cuerda bajo tensión.

El entrenamiento se ha realizado con la librería LeRobot, sobre el dataset `masondx/new_tension_cut_rot_state20`, que contiene episodios de demostración de la tarea de corte de cuerda. El repositorio no especifica el número exacto de episodios, el tamaño del dataset ni si se utilizaron técnicas de RLHF o DPO (en este caso no aplican, ya que es un modelo de robótica y no de lenguaje). El pipeline declarado es `robotics`, lo que confirma que el modelo se usa para control de robots.

## Capacidades

- Generación de trayectorias de acción multi-paso para control robótico.
- Manejo de tareas de manipulación con contacto físico (contact-rich manipulation).
- Generación de acciones suaves y coherentes gracias al proceso de difusión.
- Condicionamiento por observaciones visuales y/o estado del robot (no se detalla la entrada exacta en la información disponible).
- Integración con LeRobot para entrenamiento y evaluación en robots reales y simulados.
- Soporte de inferencia en GPU mediante PyTorch (dispositivo CUDA).

## Casos de uso

- Manipulación industrial de precisión: el modelo puede controlar un brazo robótico para cortar materiales bajo tensión (cuerdas, cables, tejidos) en procesos de fabricación automatizada, generando trayectorias suaves que evitan daños en el material.
- Investigación en robótica de imitación: sirve como implementación de referencia de Diffusion Policy con LeRobot para estudiar la eficacia de la difusión en tareas de contacto.
- Prototipado de políticas de control: los investigadores pueden usar el modelo como punto de partida para entrenar políticas en tareas similares de manipulación con contacto.
- Evaluación de robots de bajo coste: el modelo está pensado para robots como el SO100 (mencionado en la guía de LeRobot), lo que permite validar políticas en hardware de bajo coste.
- Automatización de tareas de corte en entornos controlados: como laboratorios o plantas piloto, donde se necesita repetir la operación de cortar cuerdas tensadas con consistencia.
- Formación en aprendizaje por imitación: el modelo sirve como ejemplo didáctico para aprender a entrenar y desplegar políticas de difusión con la librería LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como tasa de éxito, precisión de corte o comparativas con otros modelos en la tarea de `new_tension_cut`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado que el modelo tiene 277 millones de parámetros en safetensors (1,1 GB), se estima que puede ejecutarse en una GPU con al menos 4 GB de VRAM en FP32, y menos si se cuantiza (aunque no se documentan cuantizaciones).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 6-8 GB de VRAM (GTX 1660 Super, RTX 2060, RTX 3060, RTX 4090) debería ser suficiente para inferencia. Para entrenamiento se recomienda al menos 12 GB (RTX 3060/3080/3090, A100).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: el modelo está pensado para usarse con LeRobot, por lo que se ejecuta con PyTorch en GPU (`--policy.device=cuda`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (corte de cuerda tensada con Diffusion Policy). Se puede indicar que existen otros modelos de Diffusion Policy en LeRobot para distintas tareas de manipulación, pero no hay datos públicos de rendimiento para comparar.

## Limitaciones y advertencias

- Sesgos: no aplica directamente al ser un modelo de control robótico, pero los sesgos del dataset de demostración (por ejemplo, variaciones en la forma de cortar) se heredan en la política.
- Riesgo de alucinación: en el contexto robótico, el modelo puede generar acciones inválidas o inseguras si se enfrenta a observaciones fuera de distribución; se recomienda supervisión en entornos reales.
- Limitaciones de contexto: no aplica, al no ser un modelo de texto. Sin embargo, la generalización a otras tareas de corte o a otros robots no está garantizada sin reentrenamiento.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo se ha entrenado con un dataset específico; hay que verificar los términos del dataset `masondx/new_tension_cut_rot_state20`.
- Caveat de producción: es un modelo experimental, no certificado para uso industrial de seguridad; se debe probar exhaustivamente en simulación y con supervisión humana antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masondx/diff_new_tension_cut_rope_rot_state20
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Modelo similar del mismo autor: https://huggingface.co/masondx/diff_new_tension_cut_rope_zero
