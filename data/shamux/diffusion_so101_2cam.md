# shamux/diffusion_so101_2cam

## Resumen

`shamux/diffusion_so101_2cam` es una política de control visuomotor entrenada con Diffusion Policy y publicada en Hugging Face mediante la librería LeRobot. No es un modelo de lenguaje: es una policy de imitación que transforma observaciones multimodales (estado articular de 6 dimensiones y dos cámaras RGB de 480x640) en trayectorias de acción de 6 dimensiones para un robot seguidor SO-101. La desarrolla el usuario `shamux` y se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación: "Pick up the cube and place it in the bin". Se entrenó sobre 52 episodios y 27.886 fotogramas a 30 FPS, con 100.000 pasos de entrenamiento y batch de 4. Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de imitation learning en robótica de bajo coste, con dos cámaras (muñeca y externa) y el robot SO-101 de LeRobot.

Con 277.840.246 parámetros y un repositorio de 1,1 GB en safetensors, es un modelo pequeño en términos de despliegue (cabe en GPU de consumo), pero altamente especializado: no generaliza a otras tareas ni objetos fuera de su distribución de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor, sobre backbone de red convolucional; detalles internos no disponibles) |
| Parametros totales | 277.840.246 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política sigue el enfoque Diffusion Policy (paper arXiv:2303.04137): el control visuomotor se modela como un proceso generativo de difusión que produce trayectorias de acción multimodales y suaves, adecuadas para manipulación con contacto. La entrada combina `observation.state` de forma `(6,)` con dos imágenes RGB de `(3, 480, 640)` procedentes de las cámaras `wrist` y `external`; la salida es un vector de acción de `(6,)`. La arquitectura interna exacta (número de capas, tipo de encoder visual, schedule de difusión) no está detallada en la model card.

El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, batch size 4, optimizador Adam, learning rate 1e-4 y semilla 1000. El dataset `shamux/so101_cube_2cam` contiene 52 episodios y 27.886 fotogramas a 30 FPS de la tarea "Pick up the cube and place it in the bin". No se documenta el uso de RLHF, DPO ni fine-tuning posterior; es imitation learning puro supervisado sobre demostraciones.

## Capacidades

- Generación de trayectorias de acción de 6 grados de libertad para el robot SO-101 (`so_follower`).
- Percepción visual multimodal con dos cámaras simultáneas (muñeca y externa).
- Condicionamiento por tarea mediante prompt textual ("Pick up the cube and place it in the bin").
- Control reactivo a partir del estado articular y de las imágenes en tiempo real.
- Ejecución de una única tarea de manipulación concreta: recoger un cubo y depositarlo en una papelera.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Reproducción de un pipeline de imitation learning: usar el modelo como referencia para validar la instalación de LeRobot, la calibración del SO-101 y el flujo `lerobot-rollout` antes de entrenar políticas propias.
- Automatización de una celda pick-and-place de laboratorio: el modelo ejecuta la secuencia de recogida y depósito de cubos en un entorno controlado, útil para pruebas de repetibilidad y de hardware.
- Benchmark interno de políticas de difusión: comparar éxito y suavidad de trayectoria frente a políticas ACT o VQ-BeT entrenadas sobre el mismo dataset de 52 episodios.
- Docencia en robótica: ejemplo completo y de bajo coste (SO-101) para explicar difusión aplicada a control, desde la grabación de datos hasta el despliegue.
- Generación de datos sintéticos de trayectoria: usar las salidas del modelo como referencia para estudiar la variabilidad multimodal de Diffusion Policy en tareas con contacto.
- Prueba de robustez ante cambios de iluminación o posición del cubo: evaluar la degradación del éxito al variar condiciones respecto al dataset original, útil para decidir si hace falta aumento de datos.
- Base para fine-tuning con más episodios: partir de estos pesos y ampliar el dataset con nuevas posiciones u objetos para extender la política a tareas cercanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (_No evaluation results have been provided for this policy yet_).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 277,8 M de parámetros en safetensors (1,1 GB de repo), la inferencia en FP32 requiere aproximadamente 1,1 GB de pesos más memoria para activaciones y dos flujos de vídeo de 480x640.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la práctica.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=shamux/diffusion_so101_2cam`); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el control opera a 30 FPS según el dataset, pero no se publica la latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shamux/diffusion_so101_2cam | Diffusion Policy | 277,8 M | Pick-and-place con SO-101 | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot | Action Chunking Transformer | no disponible | Manipulación con SO-101 | Apache 2.0 (típico en LeRobot) | Hugging Face |
| Políticas VQ-BeT de LeRobot | VQ-BeT | no disponible | Manipulación con SO-101 | Apache 2.0 (típico en LeRobot) | Hugging Face |
| Diffusion Policy original (Chi et al., 2023) | Diffusion Policy | no disponible | Manipulación diversa | no disponible | Paper y código de referencia |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible: no hay evaluación publicada para este checkpoint ni resultados comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenada solo para "Pick up the cube and place it in the bin"; no se espera generalización a otros objetos, tareas o posiciones fuera de la distribución de los 52 episodios.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento en producción es desconocido.
- Dataset pequeño: 52 episodios y 27.886 fotogramas es un volumen reducido, lo que aumenta el riesgo de sobreajuste a condiciones concretas de iluminación, fondo y colocación del cubo.
- Dependencia de hardware exacto: requiere robot `so_follower` y dos cámaras con los nombres `wrist` y `external`; cambios de cámara, calibración o montaje pueden degradar el comportamiento.
- Sin capacidades lingüísticas: no procesa prompts libres ni mantiene conversaciones; el texto de tarea es un condicionamiento fijo.
- Riesgo de alucinación en el sentido de trayectorias no válidas: al ser un modelo generativo, puede producir acciones fuera de distribución ante entradas atípicas.
- Sesgos: no documentados por el autor; cabe esperar sesgo hacia las condiciones visuales y posiciones presentes en el dataset.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar el cumplimiento de las licencias de las dependencias de LeRobot y del dataset.
- Repositorio con pocas descargas (26) y sin likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shamux/diffusion_so101_2cam
- Dataset de entrenamiento: https://huggingface.co/datasets/shamux/so101_cube_2cam
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shamux/so101_cube_2cam
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
