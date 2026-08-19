# ciaociao0617/aloha-diffusion-100k

## Resumen

El modelo `ciaociao0617/aloha-diffusion-100k` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Su objetivo es realizar la tarea de inserción de una clavija en un zócalo ("Insert the peg into the socket") en el entorno de simulación ALOHA, un robot bimanual de bajo coste. El modelo consume imágenes de una cámara superior (top) y el estado del robot (14 dimensiones) para producir acciones de 14 dimensiones que controlan ambos brazos.

Desarrollado por el usuario ciaociao0617, este modelo se publica como un ejemplo de entrenamiento de políticas de imitación con diffusion en robótica. Con 263 millones de parámetros y licencia Apache-2.0, está pensado para ser ejecutado y evaluado en el simulador ALOHA mediante las herramientas de LeRobot. Su relevancia radica en demostrar la aplicación de modelos generativos de difusión al control de robots, un área activa de investigación en aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor) |
| Parametros totales | 263.450.374 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada visual y estado, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión. En lugar de predecir una única acción, el modelo genera una trayectoria completa de acciones (multi-step) mediante un proceso de denoising iterativo, lo que produce movimientos suaves y robustos, especialmente en tareas que requieren contacto físico, como la inserción de piezas.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre el dataset `lerobot/aloha_sim_insertion_human`, compuesto por 50 episodios y 25.000 frames a 50 FPS. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador Adam con learning rate de 0.0001 y semilla 1000. No se menciona el uso de técnicas como RLHF o DPO, ya que se trata de aprendizaje por imitación supervisado.

## Capacidades

- Control visuomotor para robots bimanuales tipo ALOHA: genera acciones de 14 dimensiones (posición de ambos brazos) a partir de imágenes y estado del robot.
- Entrada multimodal: imagen de cámara superior (3×480×640) y vector de estado de 14 dimensiones.
- Salida de trayectorias de acción multi-paso, gracias al proceso de difusión.
- Específico para la tarea de inserción de clavija en simulación, aunque la arquitectura puede adaptarse a otras tareas de manipulación.
- No tiene capacidades de lenguaje, tool calling ni agentes; es exclusivamente un modelo de control robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de Diffusion Policy frente a otros métodos como ACT en tareas ALOHA.
- Evaluación de políticas en simulación: permite reproducir experimentos de inserción de clavija y comparar métricas de éxito en entornos controlados.
- Desarrollo de controladores para robots bimanuales: el modelo puede servir como base para transferir políticas a entornos reales, aunque requiere adaptación y datos adicionales.
- Benchmarking de frameworks de robótica: útil para validar la integración de LeRobot con simuladores y hardware.
- Educación en robótica y aprendizaje automático: ejemplo didáctico de entrenamiento de políticas con difusión.
- Pruebas de robustez ante perturbaciones: al ser un modelo generativo, se puede evaluar su comportamiento ante variaciones en la posición de la clavija o del zócalo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. En la literatura general, Diffusion Policy ha mostrado buen rendimiento en tareas de manipulación, pero estudios comparativos en ALOHA (como el repositorio `heyeuu/aloha-act-vs-diffusion`) sugieren que ACT supera a Diffusion Policy en la tarea de transferencia de cubo. No obstante, no hay datos específicos para este modelo concreto.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la model card.
- Dado el tamaño de 263 millones de parámetros y el tipo de entrada (imágenes de 480×640), se estima que la inferencia en tiempo real requiere una GPU con al menos 8 GB de VRAM, aunque no hay datos confirmados.
- El entrenamiento se realizó con batch size 8 y 100.000 pasos, lo que sugiere que se usó una GPU de gama media-alta (por ejemplo, RTX 3090 o superior), pero no se especifica.
- El despliegue se realiza mediante las herramientas de LeRobot (`lerobot-rollout`), que gestionan la inferencia sobre el robot o simulador.
- No se mencionan opciones de cuantización ni despliegue en vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `ciaociao0617/aloha-diffusion-100k` | Diffusion Policy | 263M | Inserción de clavija | No evaluado | Apache-2.0 |
| `LeTau/dp_aloha_transfer_cube` | Diffusion Policy | no disponible | Transferencia de cubo | Publicado como baseline, superado por ACT | no disponible |
| Modelos ACT (por ejemplo, en LeRobot) | Transformer con acción | típicamente <100M | Tareas ALOHA | 80% de éxito en transferencia de cubo (según repositorio de comparación) | Apache-2.0 |

La comparación se basa en información pública de repositorios similares. No hay datos directos de este modelo frente a otros.

## Limitaciones y advertencias

- Modelo entrenado exclusivamente en simulación; no se ha validado en hardware real.
- No se han publicado resultados de evaluación, por lo que su tasa de éxito real es desconocida.
- Específico para la tarea de inserción de clavija; puede no generalizar a otras tareas sin reentrenamiento.
- Depende de la configuración de cámaras y del robot ALOHA; cambios en la iluminación o posición de la cámara pueden degradar el rendimiento.
- No es un modelo de lenguaje ni multimodal en el sentido tradicional; no soporta interacción por texto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ciaociao0617/aloha-diffusion-100k
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Comparación ACT vs Diffusion (referencia externa): https://github.com/heyeuu/aloha-act-vs-diffusion
