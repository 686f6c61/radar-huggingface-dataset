# fecasado/gact-cubes-vit-dino-v3

## Resumen

El modelo `fecasado/gact-cubes-vit-dino-v3` es una política de control robótico entrenada con el framework LeRobot de Hugging Face. Está diseñada para una tarea concreta de manipulación: trasladar cubos a cestas, utilizando un dataset propio (`fecasado/Ncubes-to-Nbaskets-320x240`) con imágenes de resolución 320x240. El nombre sugiere el uso de un backbone visual basado en DINOv3 (un modelo de visión autocontrastivo de Meta), aunque esta arquitectura no está confirmada en la documentación disponible.

Con 44,89 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero pensado para ejecutarse en tiempo real en robots físicos. Su licencia Apache-2.0 permite uso comercial y modificación sin restricciones significativas. La relevancia actual radica en que representa un ejemplo de aplicación de aprendizaje por imitación en robótica, un campo en rápida expansión, y demuestra cómo LeRobot facilita el entrenamiento y despliegue de políticas de control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_act (política de robótica basada en LeRobot, probablemente con backbone visual ViT-DINOv3, no confirmado) |
| Parametros totales | 44.890.522 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de visión-accion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. El nombre `gact-cubes-vit-dino-v3` sugiere que utiliza un backbone visual tipo Vision Transformer (ViT) preentrenado con DINOv3, seguido de una cabeza de acción (gaze_act) que genera comandos de control para el robot. Sin embargo, esto es una inferencia basada en el nombre y no está confirmado en la model card.

El entrenamiento se realizó con el framework LeRobot, que implementa aprendizaje por imitación (behavior cloning) a partir de demostraciones humanas. El dataset `fecasado/Ncubes-to-Nbaskets-320x240` contiene episodios de manipulación de cubos hacia cestas, con imágenes de 320x240 píxeles. No se especifican el número de episodios, el método de entrenamiento exacto (ACT, Diffusion Policy, etc.) ni si se aplicaron técnicas como RLHF o DPO. La model card indica que se usó `--policy.type=act` en el ejemplo de entrenamiento, lo que sugiere que la política podría ser una variante de ACT (Action Chunking with Transformers), pero no es concluyente.

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de control (posiciones de articulaciones o comandos de efector final) a partir de observaciones visuales.
- Aprendizaje por imitación: está entrenado para replicar demostraciones humanas en la tarea específica de mover cubos a cestas.
- Procesamiento visual: utiliza imágenes de cámara como entrada, probablemente con un backbone ViT preentrenado (DINOv3) para extraer características.
- Ejecución en tiempo real: con 44,8M parámetros, es adecuado para inferencia de baja latencia en sistemas robóticos.
- No soporta generación de texto, razonamiento simbólico, tool calling ni capacidades multilingües, al ser un modelo puramente de visión-accion.

## Casos de uso

- Automatización de tareas de picking y placing en entornos industriales: el modelo puede controlar un brazo robótico para recoger cubos y depositarlos en cestas, una tarea típica en líneas de montaje o almacenes. Su tamaño reducido permite ejecutarse en hardware embebido.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los backbones visuales autocontrastivos (DINOv3) mejoran la generalización en políticas robóticas.
- Prototipado rápido con LeRobot: al estar integrado con el ecosistema LeRobot, se puede cargar y evaluar fácilmente en robots SO-100 u otros compatibles, acelerando el desarrollo de nuevas tareas.
- Benchmarking de políticas de control: permite comparar el rendimiento de diferentes arquitecturas (ACT, Diffusion Policy, etc.) en una tarea estandarizada de manipulación.
- Educación en robótica: los estudiantes pueden desplegar este modelo en simuladores o robots reales para aprender sobre control basado en visión y aprendizaje por imitación.
- Transferencia a tareas similares: aunque está entrenado para cubos y cestas, el backbone visual podría reutilizarse como extractor de características para otras tareas de manipulación con fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito en la tarea, precisión de manipulación, ni comparaciones con otros modelos en el repositorio de Hugging Face.

## Requisitos de hardware

- VRAM estimada: con 44,89M parámetros y pesos en safetensors de ~0,2 GB, la inferencia requiere aproximadamente 0,5-1 GB de VRAM en FP32, y menos de 0,5 GB en cuantización (si estuviera disponible). Cabe en cualquier GPU consumer moderna (GTX 1060 6GB o superior).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM, por ejemplo RTX 2060, RTX 3060, RTX 4090, o incluso GPUs integradas si se usa CPU (aunque con mayor latencia).
- Despliegue: al ser un modelo de LeRobot, se integra con el framework para inferencia en robots. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos. Dado el tamaño, se espera una inferencia en tiempo real (menos de 50 ms por paso) en una GPU moderna, pero no está confirmado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica con backbone DINOv3). La comparativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de mover cubos a cestas con un robot específico (probablemente SO-100). No generaliza a otras tareas u objetos sin reentrenamiento.
- Falta de documentación: la model card es un template genérico de LeRobot y no proporciona detalles sobre el dataset, el procedimiento de entrenamiento, ni métricas de rendimiento. Esto dificulta la reproducibilidad y la evaluación objetiva.
- Riesgo de sobreajuste: al ser un modelo pequeño y entrenado en un dataset limitado, puede fallar ante variaciones de iluminación, fondo o posición de la cámara.
- Sin validación en entornos reales: no se han publicado resultados de despliegue físico, por lo que su robustez en condiciones reales es desconocida.
- Licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las atribuciones correspondientes.
- Sesgos: al ser un modelo de visión-accion, no presenta sesgos lingüísticos, pero podría tener sesgos visuales derivados del dataset (por ejemplo, solo ciertos colores de cubos o fondos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-cubes-vit-dino-v3
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240 (inferido del nombre, no verificado)
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- DINOv3 (Meta AI): https://ai.meta.com/research/dinov3/
- Repositorio de DINOv3: https://github.com/facebookresearch/dinov3
- Paper de DINOv3: https://arxiv.org/html/2508.10104v1
