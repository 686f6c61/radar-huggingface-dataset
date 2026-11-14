# felsager/pi05_cube2cross_v2_base

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos para control robótico. Esta ficha concreta, `felsager/pi05_cube2cross_v2_base`, es un fine-tune del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la librería LeRobot, especializado en una tarea única de manipulación: coger un cubo de color y colocarlo sobre una cruz roja.

El modelo consume observaciones multimodales (imágenes de dos cámaras y el estado del robot) y produce directamente un vector de acción de 10 dimensiones para un brazo UR5e con pinza. Se entrenó con 1000 episodios y 493.474 fotogramas a 30 FPS sobre el dataset `felsager/vla_cubes_cross_v2`, con 30.000 pasos de entrenamiento y batch de 8.

Su relevancia es acotada pero clara: demuestra el flujo completo de fine-tuning de π₀.₅ en LeRobot para una tarea de manipulación concreta y sirve como referencia reproducible para quien quiera adaptar un VLA a su propio robot o dataset. No es un modelo de propósito general ni un chatbot: es una política de imitación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, implementación LeRobot del repositorio OpenPI |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Cámaras | top, wrist |
| Tamaño del repo | 146.9 GB |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina un backbone de visión-lenguaje con una cabeza de acciones, adaptado en la implementación de LeRobot a partir del repositorio OpenPI. La entrada son dos flujos visuales de 3x480x640 píxeles (cámara superior y cámara en la muñeca) más un vector de estado de 10 dimensiones; la salida es un vector de acción de 10 dimensiones. No se dispone de detalles adicionales sobre el backbone exacto, el número de capas ni la composición del corpus de preentrenamiento del modelo base.

El fine-tuning se realizó sobre el dataset `felsager/vla_cubes_cross_v2`: 1000 episodios, 493.474 fotogramas a 30 FPS, con cuatro instrucciones de tarea (coger el cubo azul, verde, amarillo o rojo y colocarlo sobre la cruz roja). La configuración de entrenamiento fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.2. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para un UR5e con pinza a partir de observaciones visuales y de estado.
- Condicionamiento por lenguaje: acepta instrucciones de tarea del tipo "pick up the blue cube and place it on the red cross".
- Percepción multimodal con dos cámaras: vista superior y vista de muñeca, ambas a 480x640 y 30 FPS.
- Discriminación de color de objetos: entrenado explícitamente para cubos azul, verde, amarillo y rojo.
- Política de imitación end-to-end: no requiere planificación simbólica ni módulos intermedios.
- Ejecución en bucle cerrado mediante `lerobot-rollout` con estrategia `base`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es una política de acción, no un modelo generativo de texto.

## Casos de uso

- Clasificación de cubos por color en línea de montaje: el modelo identifica el cubo solicitado mediante las cámaras y ejecuta la secuencia de agarre y colocación sobre la cruz roja, útil como banco de pruebas de pick-and-place.
- Automatización de una celda UR5e en laboratorio: integrable con `lerobot-rollout` sobre un UR5e real para tareas repetitivas de recogida y depósito en posiciones fijas.
- Base para fine-tuning de nuevas tareas: al partir de `lerobot/pi05_base`, sirve como punto de arranque para adaptar el VLA a otros objetos o destinos con un dataset propio.
- Evaluación de pipelines de imitación: referencia reproducible para comparar configuraciones de entrenamiento (pasos, batch, learning rate) sobre la misma tarea.
- Docencia e investigación en VLA: ejemplo completo y de tamaño moderado (4,1 mil millones de parámetros) para estudiar el flujo LeRobot de grabación, entrenamiento y despliegue.
- Pruebas de robustez perceptual: permite medir cómo afectan cambios de iluminación, posición de cámara o distracciones a una política entrenada con 1000 episodios en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito reportadas para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros, una estimación en FP16 rondaría los 8-9 GB solo para pesos, pero no se confirma en la documentación.
- GPU recomendadas: no especificadas. El comando de ejemplo usa `--policy.device=cuda` sin indicar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (146,9 GB) sugiere que incluye múltiples checkpoints y artefactos, no solo los pesos finales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de cámaras opera a 30 FPS, pero no se reporta la frecuencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_base | 4.143.404.816 | no disponible | Pick-and-place de cubos sobre cruz (UR5e) | gemma | Hugging Face, 28 descargas |
| lerobot/pi05_base | no disponible | no disponible | VLA base de propósito general | no disponible | Hugging Face (modelo base) |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA de propósito general | no disponible | Repositorio OpenPI |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para cuatro instrucciones de color sobre una cruz roja; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas de robustez, por lo que su fiabilidad real en producción es desconocida.
- Dependencia de hardware concreto: asume un UR5e con pinza y dos cámaras con nombres y calibración específicos (`top`, `wrist`); cambiar la configuración invalida la política.
- Dataset pequeño y de un solo operador: 1000 episodios pueden no cubrir variaciones de iluminación, posiciones extremas o distracciones.
- Riesgo de sobreajuste al entorno de grabación: cambios en la mesa, el fondo o la iluminación pueden degradar el rendimiento sin aviso.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos de la Gemma Terms of Use antes de desplegar.
- Idiomas no documentados: las instrucciones de tarea están en inglés y no se reporta soporte multilingüe.
- Tamaño del repo elevado (146,9 GB): puede dificultar la descarga y el almacenamiento en entornos con recursos limitados.
- Sin datos de cuantización ni de latencia: no se puede estimar el coste de despliegue en tiempo real a partir de la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_base
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
