# CamilleWalters/pi05-block-sorter-v1

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, diseñado para generalización en entornos abiertos. Este finetuning, denominado pi05-block-sorter-v1, ha sido creado por CamilleWalters sobre el modelo base lerobot/pi05_base y está orientado a tareas de manipulación robótica. El modelo resuelve el problema de colocar bloques de distintos colores y formas en sus orificios correspondientes con un robot WidowX AI, y es relevante porque demuestra cómo un VLA puede adaptarse a tareas específicas con conjuntos de datos relativamente pequeños mediante finetuning con LeRobot. El modelo acepta observaciones de tres cámaras RGB de 224×224 y un vector de estado de 32 dimensiones, y produce acciones de 7 dimensiones. La arquitectura exacta y el número de parámetros no se especifican en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ (Pi05) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica: modelo robótico multimodal) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | WidowX AI follower |
| Entradas | Imágenes RGB (3, 224, 224) ×3, estado (32,) |
| Salidas | Acción (7,) |

## Arquitectura y entrenamiento

El modelo es un VLA que hereda las capacidades de generalización de π₀.₅ (Pi05), implementado en LeRobot. En este finetuning, el modelo recibe como observaciones imágenes RGB de 224×224 procedentes de tres cámaras (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) y un vector de estado de 32 dimensiones, y genera una acción de 7 dimensiones. El entrenamiento se realizó sobre el dataset `CamilleWalters/block_sorter_v3_20260901_180009`, compuesto por 245 episodios y 131.960 muestras a 30 FPS, con cinco tareas de colocación de bloques. La configuración de entrenamiento incluye 30.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001 y semilla 1000, con la versión 0.6.1 de LeRobot. No se especifican innovaciones técnicas adicionales en los datos proporcionados.

## Capacidades

- Manipulación robótica: ejecuta tareas de colocación de bloques en orificios correspondientes.
- Percepción multimodal: integra imágenes de tres cámaras y estado de articulaciones.
- Generación de acciones espaciales: produce acciones continuas de 7 dimensiones.
- Finetuning específico: adaptado a cinco tareas concretas de clasificación de bloques.
- Generalización del modelo base: hereda la capacidad de π₀.₅ para operar en nuevos entornos.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso en el sentido convencional de modelos de lenguaje.

## Casos de uso

- Clasificación automatizada de piezas: el modelo puede usarse en líneas de montaje para colocar bloques o piezas en sus ranuras correspondientes, ya que su salida predictiva de acciones permite controlar el robot de forma autónoma.
- Investigación en aprendizaje por imitación: sirve como ejemplo de finetuning de un VLA sobre un dataset pequeño (245 episodios) en el ecosistema LeRobot.
- Automatización de pick-and-place en almacenes: puede integrarse en un robot WidowX para tareas repetitivas de recogida y colocación de objetos.
- Robots domésticos educativos: permite enseñar a un robot a ordenar juguetes o bloques por color y forma en un entorno doméstico sencillo.
- Benchmarking de políticas robóticas: se puede utilizar para comparar el rendimiento de diferentes políticas VLA en tareas de manipulación con LeRobot.
- Prototipado rápido de nuevas tareas: gracias a la integración con LeRobot, puede adaptarse a nuevas tareas mediante el comando `lerobot-train` usando el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el entrenamiento e inferencia se ejecutan con CUDA (`--policy.device=cuda`).
- Compatibilidad con GPU de consumo: no disponible, aunque el uso de LeRobot suele admitir GPUs NVIDIA; no se ha informado de requisitos específicos.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`), con soporte de Python y PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa completa con modelos similares. El modelo base es `lerobot/pi05_base`, pero no se han publicado datos de rendimiento que permitan comparar parámetros, contexto o resultados. Los únicos datos conocidos son los de este finetuning y su dataset.

## Limitaciones y advertencias

- No se han proporcionado evaluaciones en robot real, por lo que no hay garantía de éxito en despliegue.
- El dataset de entrenamiento es reducido (245 episodios) y las tareas están muy acotadas a cinco colocaciones de bloques, lo que limita la generalización a otros escenarios.
- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que podría indicar que los pesos no están correctamente subidos; se recomienda verificar antes de su uso.
- El modelo está diseñado para el robot WidowX AI follower y puede requerir calibración específica y configuración de cámaras.
- La información sobre arquitectura, parámetros y cuantización no está disponible, lo que dificulta su evaluación técnica.
- El modelo depende de LeRobot 0.6.1 y de las dependencias de esa versión.
- Riesgo de sobreajuste al dataset de bloques: puede fallar ante variaciones de iluminación, posiciones u objetos nuevos.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CamilleWalters/pi05-block-sorter-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/CamilleWalters/block_sorter_v3_20260901_180009
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre Pi05: https://www.physicalintelligence.company/blog/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
