# padiredd/smolvla-toythrow-visual-2k

## Resumen

smolvla-toythrow-visual-2k es una política robótica de tipo vision-language-action (VLA) publicada por el usuario padiredd en Hugging Face. Se trata de un fine-tuning de SmolVLA, la arquitectura compacta de VLA presentada por Hugging Face dentro del ecosistema LeRobot, entrenada específicamente para una tarea de lanzamiento de un objeto de juguete ("toy throw") a partir de un dataset propio de 2.000 episodios con tres cámaras. El repositorio contiene los pesos en formato safetensors con 450 millones de parámetros y un tamaño de 1,8 GB.

El modelo no es un modelo de lenguaje generalista, sino una política de control entrenada por imitación (behavior cloning) sobre demostraciones teleoperadas. Recibe observaciones visuales y estado del robot y emite acciones motoras; por tanto, su utilidad está acotada al entorno y a la morfología del robot con el que se recogieron los datos. La model card indica que se entrenó con el fork `lerobot-cyclo` de ROBOTIS, con receta de 20.000 pasos, batch de 16 y semilla 42, y que el repositorio raíz corresponde al checkpoint del paso 20.000, con un checkpoint intermedio en `step-10000/`.

Su relevancia es doble: por un lado, ejemplifica el flujo de trabajo actual para adaptar un VLA pequeño a una tarea concreta con hardware de consumo; por otro, sirve como referencia de cómo se publican políticas LeRobot con metadatos mínimos, lo que también evidencia las lagunas de documentación habituales en este tipo de artefactos (sin licencia declarada, sin idiomas, sin benchmarks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), política de imitación sobre LeRobot |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura subyacente es SmolVLA, un modelo vision-language-action compacto que combina un codificador visual, un componente lingüístico y un cabezal de acciones, entrenado para mapear observaciones multimodales a comandos motores. En este caso concreto no se dispone de detalles adicionales sobre la configuración exacta de capas, dimensión oculta o tokenizador, ya que la model card solo documenta el procedimiento de entrenamiento.

El entrenamiento se realizó por imitación sobre el dataset `local/toy-throw-visual-2k-3cam`, compuesto por demostraciones con tres cámaras, con una receta de 20.000 pasos, batch de 16 y semilla 42. La model card indica que la co-formación (co-training) está desactivada (alpha None, split episode None) y que la augmentación de imagen está apagada. No se especifica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO, algo esperable en políticas de behavior cloning. El entrenamiento se llevó a cabo con el fork `lerobot-cyclo` de ROBOTIS.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones motoras a partir de observaciones visuales de tres cámaras y del estado del robot.
- Ejecución de una tarea específica: lanzamiento de un objeto de juguete ("toy throw") en el entorno para el que se recogieron las demostraciones.
- Procesamiento multimodal de entrada: integra señales visuales e información proprioceptiva del robot.
- Inferencia dentro del ecosistema LeRobot mediante `from_pretrained("padiredd/smolvla-toythrow-visual-2k")`.
- Checkpoint intermedio disponible en `step-10000/` para comparar el efecto del número de pasos de entrenamiento.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de "thinking"; no aplica a una política VLA de este tipo.

## Casos de uso

- Reproducción de la tarea de lanzamiento en un robot ROBOTIS compatible: cargar la política con LeRobot y ejecutarla sobre la misma morfología y configuración de cámaras usadas en la recogida de datos, para validar el comportamiento aprendido.
- Baseline para fine-tuning de SmolVLA: servir como punto de partida para adaptar el modelo a una nueva tarea de manipulación con un dataset propio, aprovechando que el repositorio incluye checkpoints intermedios.
- Estudio de curvas de aprendizaje: comparar el checkpoint del paso 10.000 con el del 20.000 para analizar la evolución de la política y decidir cuántos pasos son necesarios en tareas similares.
- Evaluación de pipelines de entrenamiento LeRobot: usar la receta documentada (20.000 pasos, batch 16, semilla 42, sin augmentación) como referencia reproducible en experimentos de behavior cloning.
- Docencia y divulgación en robótica: ejemplo didáctico de VLA pequeño entrenado con tres cámaras para ilustrar el flujo completo de recogida de datos, entrenamiento y despliegue en LeRobot.
- Pruebas de infraestructura de inferencia robótica: validar latencia y throughput de un modelo de 450 M de parámetros en el hardware objetivo antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 1,8 GB en precisión original (fp32/bf16 según el checkpoint); en fp16 el modelo de 450 M de parámetros requiere del orden de 0,9 GB solo para pesos, más memoria para activaciones y buffers de imagen.
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería poder alojar el modelo, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6 GB o más, aunque no hay confirmación oficial del autor.
- Opciones de despliegue: LeRobot (`from_pretrained`), que es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de control.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| padiredd/smolvla-toythrow-visual-2k | 450 M | no disponible | Toy throw (3 cámaras) | no disponible | Hugging Face |
| SmolVLA (base, Hugging Face) | ~450 M | no disponible | VLA generalista | no disponible en esta ficha | Hugging Face / LeRobot |
| OpenVLA | ~7 B | no disponible | VLA generalista | no disponible en esta ficha | Hugging Face |
| Políticas ACT / Diffusion Policy en LeRobot | variable | no disponible | Manipulación por imitación | no disponible en esta ficha | LeRobot |

La comparación se limita a categorías y tamaños; no se dispone de datos de rendimiento comparables para este checkpoint concreto.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único entorno; no generalizará a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Dependencia del hardware: el comportamiento está ligado a la morfología del robot y a la calibración usada durante la recogida de datos; cambios en el robot pueden degradar o invalidar la política.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda en un limbo legal y no debería asumirse permiso de uso.
- Idiomas no declarados: irrelevante para una política de control, pero indicativo de la falta de metadatos.
- Riesgo de sobreajuste: 20.000 pasos sobre un dataset de 2.000 episodios con una sola semilla y sin augmentación de imagen aumenta la probabilidad de sobreajuste al entorno de entrenamiento.
- Sin benchmarks ni evaluación publicada: no hay métricas de éxito de la tarea, lo que impide estimar su fiabilidad real en producción.
- Sin información sobre sesgos: no se documentan sesgos, pero al ser un modelo entrenado con datos propios, hereda las limitaciones y posibles desequilibrios de ese dataset.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/smolvla-toythrow-visual-2k
- LeRobot (librería): https://github.com/huggingface/lerobot
- SmolVLA (modelo base de Hugging Face): https://huggingface.co/lerobot/smolvla_base
- Fork lerobot-cyclo de ROBOTIS: no disponible como enlace directo en la información proporcionada
