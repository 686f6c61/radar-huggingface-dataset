# HyeonseokE/smolvla_push_cube_cap_3000_10fps

## Resumen

Este modelo es una política de control robótico basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. Ha sido fine-tuneado por HyeonseokE a partir del modelo base `lerobot/smolvla_base` para ejecutar la tarea concreta de empujar un cubo hasta un marcador objetivo en un robot SO-101 de tipo seguidor. El modelo consume imágenes de dos cámaras (superior y muñeca izquierda) junto con el estado del robot (6 dimensiones) y produce acciones de control de 6 dimensiones.

SmolVLA se presenta como una alternativa asequible a los VLA masivos existentes, ya que reduce el coste computacional y puede desplegarse en hardware de consumo. Este fine-tune concreto se entrenó sobre un dataset de 100 episodios (21 210 frames a 10 FPS) recopilado mediante teleoperación, y el modelo resultante tiene 450 millones de parámetros en formato safetensors, con un peso total de 0,9 GB. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLM (SigLIP + SmolLM2) con action expert |
| Parametros totales | 450 046 176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un encoder de visión SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que proyecta las representaciones multimodales en acciones de control. Según la documentación del proyecto y el blog de fine-tuning de ggando.com, durante el fine-tuning solo se actualizan aproximadamente 50 millones de parámetros (el action expert y las proyecciones), mientras que el encoder de visión y el modelo de lenguaje permanecen congelados. Esto reduce drásticamente el coste de entrenamiento respecto a un ajuste completo.

El entrenamiento de esta política concreta se realizó con la librería LeRobot (versión 0.5.1) sobre el dataset `HyeonseokE/push_cube_cap_10fps`, que contiene 100 episodios de la tarea "Push the cube to the target marker" grabados a 10 FPS. Se emplearon 16 571 pasos de entrenamiento con un batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 3000. El modelo recibe como entrada tres observaciones visuales de 256×256 píxeles (aunque la model card menciona dos cámaras físicas, los inputs declaran tres canales de imagen) y un vector de estado de 6 dimensiones, y genera acciones de 6 dimensiones.

## Capacidades

- Control robótico por imitación: ejecuta la tarea de empujar un cubo hasta un marcador objetivo sobre un robot SO-101.
- Percepción multimodal: integra imágenes de cámara (superior y muñeca izquierda) con el estado propioceptivo del robot.
- Generación de acciones continuas: produce vectores de acción de 6 dimensiones compatibles con el espacio de control del efector final.
- Fine-tuning eficiente: al partir de `smolvla_base`, solo se actualizan los módulos de acción, lo que permite adaptarlo a nuevas tareas con pocos datos.
- Inferencia en hardware de consumo: gracias a su tamaño reducido (450M parámetros), puede ejecutarse en GPUs de gama media.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face para robótica.

## Casos de uso

- Investigación en aprendizaje por imitación: permite estudiar cómo un VLA compacto se adapta a tareas de manipulación con datasets pequeños (100 episodios) y qué factores afectan a la generalización.
- Benchmarking de VLA en hardware de consumo: sirve como referencia para comparar el rendimiento de SmolVLA frente a otros métodos como ACT o VLA más grandes en la misma tarea.
- Prototipado rápido de políticas robóticas: con LeRobot, se puede entrenar y desplegar una política de empuje en un robot SO-101 en pocas horas, ideal para validar hipótesis experimentales.
- Desarrollo de sistemas de manipulación de objetos pequeños: la tarea de empujar un cubo es un bloque básico para pipelines más complejos de pick-and-place o ensamblaje.
- Estudio de transferencia entre tareas: al ser un fine-tune de un modelo base, permite investigar cómo el conocimiento previo de SmolVLA se transfiere a tareas específicas con pocas demostraciones.
- Educación y formación en robótica: su tamaño reducido y la integración con LeRobot lo hacen adecuado para cursos y talleres donde se necesite un modelo ejecutable en estaciones de trabajo sin GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen datos de tasa de éxito en el robot real ni comparaciones cuantitativas con otras políticas para esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 0,9 GB en safetensors (probablemente en fp16 o bf16), por lo que la inferencia requiere aproximadamente 2-4 GB de VRAM según el framework y las optimizaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060 o superiores. Para entrenamiento, se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4060 Ti, etc.).
- Compatibilidad con GPU de consumo: sí, es uno de los objetivos principales de SmolVLA. Una RTX 3060 o superior es suficiente para inferencia en tiempo real.
- Opciones de despliegue: LeRobot (librería oficial de Hugging Face) mediante los comandos `lerobot-rollout` y `lerobot-train`. También es posible exportar los pesos a otros formatos si se requiere.
- Latencia y throughput: no se han publicado mediciones específicas para este fine-tune, pero SmolVLA está diseñado para operar en tiempo real en hardware de consumo, con latencias típicas de decenas de milisegundos por paso de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_push_cube_cap_3000_10fps | 450M | VLA (SigLIP + SmolLM2 + action expert) | Empujar cubo a marcador | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | ~500M | VLA (SigLIP + SmolLM2 + action expert) | Generalista (preentrenado) | Apache 2.0 | Hugging Face |
| ACT (Action Chunking with Transformers) | ~10-50M | Transformer con chunking de acciones | Pick-and-place en SO-101 | MIT | GitHub / LeRobot |
| OpenVLA | ~7B | VLA basado en Prismatic (LLaMA-2) | Manipulación generalista | MIT | Hugging Face |

SmolVLA se sitúa en un punto intermedio: mucho más pequeño que OpenVLA (7B), pero más grande que ACT. Su ventaja frente a ACT es la capacidad de razonamiento visual-lingüístico heredada de SmolVLM, mientras que frente a OpenVLA ofrece un coste computacional muy inferior. No se dispone de comparativas de rendimiento cuantitativas para esta tarea específica.

## Limitaciones y advertencias

- Entrenado exclusivamente para una tarea concreta (empujar un cubo a un marcador) en un robot SO-101; no generaliza a otras tareas o configuraciones de robot sin fine-tuning adicional.
- El dataset de entrenamiento es pequeño (100 episodios) y probablemente capturado en un entorno fijo; el rendimiento puede degradarse con cambios de iluminación, posición de cámara o texturas del objeto.
- No se han reportado resultados de evaluación en el robot real, por lo que no hay evidencia de la tasa de éxito real de la política.
- La model card declara dos cámaras físicas (top y left_wrist) pero los inputs listan tres canales de imagen; esta inconsistencia puede causar errores al desplegar si no se configuran correctamente las cámaras.
- Al ser un fine-tune de un modelo base, hereda posibles sesgos del preentrenamiento de SmolVLM, aunque al estar congelado su impacto en la acción es limitado.
- No soporta tool calling, generación de texto libre ni razonamiento conversacional; es exclusivamente un modelo de control robótico.
- La fecha de creación del repositorio (2026-08-28) es posterior a la fecha actual, lo que sugiere que puede tratarse de un repositorio de prueba o con metadatos incorrectos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_push_cube_cap_3000_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/push_cube_cap_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot (librería): https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Blog de fine-tuning de SmolVLA en SO-101: https://ggando.com/blog/smolvla-so101/
