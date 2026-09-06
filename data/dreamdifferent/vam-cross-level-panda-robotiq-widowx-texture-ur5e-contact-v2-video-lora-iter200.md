# dreamdifferent/vam-cross-level-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200

## Resumen

El modelo `dreamdifferent/vam-cross-level-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200` es un adaptador LoRA de bajo rango (rango 256) para un modelo de generación de vídeo robótico, desarrollado por el usuario `dreamdifferent`. No es un modelo independiente: se trata de un checkpoint entrenable que se aplica sobre un backbone de tipo `fused_video2world_dit`, un Diffusion Transformer (DiT) fusionado, para adaptarlo a una tarea concreta de manipulación robótica.

El adaptador está especializado en la generación de vídeos que predicen la evolución de una escena de manipulación con un brazo robótico Panda, una pinza Robotiq, una muñeca WidowX y un brazo UR5e, a partir de observaciones de dos cámaras y una instrucción en lenguaje natural: "pick up the candle and place it into the bowl". El repositorio pesa 0.7 GB, mientras que el backbone requerido ocupa aproximadamente 3.9 GB. Su relevancia radica en permitir a investigadores ajustar modelos de mundo (world models) para robótica sin necesidad de entrenar desde cero, reutilizando un backbone preentrenado y un dataset específico de manipulación multi-cámara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) fusionado, con adaptador LoRA (Video2World) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint LoRA; el backbone se sirve en formato `.pt`) |

## Arquitectura y entrenamiento

El modelo se compone de un adaptador LoRA sobre un backbone `fused_video2world_dit`. El README indica que el checkpoint inicial requerido es `dreamdifferent/widowx250-video-fused`, en la revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, que incluye una fusión previa de LoRA de WidowX/Bridge. Cargar el backbone original de Bridge en lugar del fusionado sería incorrecto. El adaptador se entrenó durante 200 iteraciones de un run cuya terminación fue `completed`. El dataset de entrenamiento consta de 165 episodios y 54343 frames, capturados con dos cámaras (`corner_cam` y `front_cam`) dispuestas en formato `hstack` a 5 Hz. La instrucción asociada es "pick up the candle and place it into the bowl". No se menciona uso de RLHF ni de técnicas de alineación posteriores. El runtime recomendado es MimicVideo, con un tokenizador de vídeo y un codificador de texto T5-11B.

## Capacidades

- Generación de vídeo condicionada por observaciones de dos cámaras y una instrucción en lenguaje natural, orientada a escenas de manipulación robótica.
- Ajuste fino de bajo rango (LoRA) para adaptar el backbone a una tarea concreta sin modificar los pesos base.
- Especializado en brazos robóticos Panda y UR5e, pinza Robotiq y muñeca WidowX, con un modelo de contacto específico (`contact_v2`).
- Soporte de múltiples vistas: las observaciones de `corner_cam` y `front_cam` se combinan en una disposición horizontal (`hstack`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-step ni capacidades de agente.
- No se indica capacidad multilingüe; la instrucción de entrenamiento está en inglés.

## Casos de uso

- Generación de datos sintéticos para entrenar políticas de manipulación: el modelo recibe observaciones de cámaras y una instrucción, y produce vídeos que pueden usarse como datos de entrenamiento para políticas de control robótico, reduciendo la necesidad de recopilar datos físicos.
- Planificación de tareas de picking and placing: dado un estado observado, el modelo predice la secuencia de vídeo de la acción, permitiendo validar planes de movimiento en simulación antes de ejecutarlos en el robot real.
- Simulación de interacciones de contacto en entornos controlados: al modelar el contacto entre la pinza y el objeto (vela y cuenco), el adaptador puede utilizarse para estudiar interacciones físicas sin riesgo de dañar el hardware.
- Evaluación de políticas en bucle cerrado: se pueden comparar los vídeos predichos por el modelo con la ejecución real del robot para detectar desviaciones y depurar políticas en sistemas de aprendizaje por imitación.
- Investigación en modelos de mundo para robótica: sirve como referencia para experimentos sobre predicción de vídeo multi-cámara en tareas de manipulación, especialmente en entornos con contacto.
- Ajuste fino de modelos de vídeo generales a dominios robóticos específicos: el adaptador permite adaptar el backbone preentrenado a una tarea concreta (recoger una vela y colocarla en un cuenco) con un número limitado de datos, útil para prototipado rápido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El backbone requerido ocupa 3.9 GB y el adaptador 0.7 GB, por lo que se necesita una GPU con suficiente memoria para alojar ambos pesos, además de los activos del modelo de difusión.
- GPU recomendadas: no especificadas en la información proporcionada.
- No se indica si el modelo cabe en GPUs de consumo; dado el tamaño del backbone, una GPU con al menos 8 GB de VRAM podría ser necesaria, pero no se confirma.
- Opciones de despliegue: no especificadas. El README menciona MimicVideo como runtime, pero no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Dataset/entorno | Iteración | Notas |
|---|---|---|---|---|
| dreamdifferent/vam-cross-level-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200 | widowx250-video-fused | Nivel 5, Panda + Robotiq + WidowX + UR5e, contacto v2, dos cámaras | 200 | Este modelo |
| dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200 | widowx250-video-fused | Nivel 2, Panda + Robotiq + WidowX, dos cámaras | 200 | Misma familia, tarea de menor complejidad |
| dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400 | no disponible | Nivel 5, Panda + Robosuite + WidowX | 400 | Misma familia, entorno de simulación Robosuite |

No se dispone de métricas de rendimiento comparativas para ninguno de los tres modelos.

## Limitaciones y advertencias

- No es un modelo independiente: requiere cargar el backbone fusionado exacto (`dreamdifferent/widowx250-video-fused` en la revisión `f0cea76`) antes de aplicar el adaptador; usar el backbone original de Bridge sería incorrecto.
- Licencia no disponible: se desconocen los términos de uso, incluida la posibilidad de uso comercial.
- Los datos de entrenamiento no están incluidos en el repositorio y su acceso está sujeto a la política del dataset original y a los términos de MimicVideo, NVIDIA Cosmos y del checkpoint base.
- Riesgo de alucinación en la generación de vídeo: el modelo puede producir secuencias visualmente inconsistentes o no realistas, especialmente fuera de la distribución de la tarea de entrenamiento.
- Especialización limitada: el adaptador fue entrenado para una instrucción concreta (recoger una vela y colocarla en un cuenco) y una configuración específica de cámaras; su capacidad de generalización a otras tareas, objetos o disposiciones de sensores es limitada.
- No se han publicado evaluaciones de sesgos, seguridad ni robustez frente a condiciones adversas.

## Enlaces

- https://huggingface.co/dreamdifferent/vam-cross-level-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200
- https://huggingface.co/dreamdifferent/widowx250-video-fused
- https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200
- https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-video-lora-iter-400
