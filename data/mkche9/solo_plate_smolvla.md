# mkche9/solo_plate_smolvla

## Resumen

SmolVLA es un modelo compacto de vision-language-action (VLA) para robótica, presentado en el paper "SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics" (arXiv 2506.01844). El modelo `mkche9/solo_plate_smolvla` es un fine-tuning del modelo base `lerobot/smolvla_base`, desarrollado por el usuario `mkche9` con la librería LeRobot. Está entrenado para la tarea de recoger una esponja y colocarla en un plato, utilizando un robot tipo `so_follower` con cámaras en vista cenital y en la muñeca.

El modelo tiene 450.046.176 parámetros totales, un tamaño de 0.9 GB y se distribuye en formato `safetensors` bajo licencia Apache 2.0. Al ser un VLA, procesa entradas visuales y de estado para generar acciones de control del robot. Su relevancia radica en que ofrece un policy de manipulación robótica eficiente y desplegable en hardware de consumo, alineado con la filosofía de SmolVLA de reducir costes computacionales manteniendo un rendimiento competitivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de acción robótica, no de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Observación: los metadatos indican que el repo tiene un tamaño de 0.9 GB y el pipeline `robotics`. No se especifican cuantizaciones.

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-language-action diseñado para ser compacto y eficiente, de modo que pueda ejecutarse en hardware de consumo. El repositorio `mkche9/solo_plate_smolvla` es un fine-tuning de `lerobot/smolvla_base` realizado con la librería LeRobot. El modelo consume un vector de estado de 6 dimensiones y 4 entradas visuales: `camera1`, `camera2` y `camera3` de tamaño 3×256×256, y `empty_camera_0` de tamaño 3×480×640. La salida es una acción de 6 dimensiones.

El entrenamiento se llevó a cabo sobre el dataset `mkche9/sponge_solo_plate`, compuesto por 99 episodios y 38.668 frames a 30 FPS, con la tarea "pick sponge and place on plate". La configuración de entrenamiento registrada es: 20.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se detallan innovaciones técnicas específicas en la información proporcionada; el modelo hereda la arquitectura del paper de SmolVLA.

## Capacidades

- Predicción de acciones de 6 dimensiones para el control de un robot `so_follower`.
- Procesamiento simultáneo de múltiples entradas visuales (3 cámaras de 256×256 y una adicional de 480×640) junto con el estado de 6 dimensiones.
- Ejecución de la tarea específica "pick sponge and place on plate".
- Integración total con LeRobot: incluye comandos de entrenamiento (`lerobot-train`) y de despliegue (`lerobot-rollout`).
- Posibilidad de servir como punto de partida para fine-tuning en otras tareas de manipulación desde el modelo base `lerobot/smolvla_base`.
- Al ser un modelo VLA, no proporciona capacidades de generación de texto, razonamiento genérico ni soporte de tool calling.

## Casos de uso

1. Manipulación robótica en laboratorio: el modelo puede desplegarse en un robot `so_follower` para recoger esponjas y colocarlas en platos. Su tamaño compacto permite ejecutarlo en una GPU de consumo, lo que lo hace adecuado para entornos de investigación sin infraestructura de servidores de gran escala.

2. Automatización de tareas de pick-and-place en producción: aunque está entrenado para una tarea concreta, el flujo de LeRobot permite reentrenar el modelo sobre datos de nuevas tareas de colocación de objetos, partiendo del mismo basamento de SmolVLA.

3. Investigación en aprendizaje por imitación: el modelo sirve como política de referencia en la librería LeRobot para comparar algoritmos de aprendizaje por demostración, gracias a su tamaño reducido y su facilidad de entrenamiento.

4. Evaluación de políticas en entornos simulados: con el dataset `mkche9/sponge_solo_plate` y la configuración de LeRobot, se puede probar la robustez del modelo ante variaciones de iluminación o posiciones de objetos antes de desplegarlo en un robot real.

5. Benchmark de modelos VLA compactos: permite comparar el rendimiento de políticas de visión-lenguaje-acción de menos de 500 millones de parámetros frente a alternativas más grandes, midiendo el trade-off entre eficiencia y precisión.

6. Despliegue en robots de servicio: en aplicaciones como restaurantes o entornos domésticos, el modelo puede adaptarse a tareas de ordenar objetos en platos, aprovechando la arquitectura VLA para interpretar indicaciones de alto nivel, siempre que se reentrene con datos del dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

Estimaciones basadas en el tamaño de 450 millones de parámetros y en el peso de 0.9 GB (formato FP16/BF16):

- VRAM estimada: entre 1 y 2 GB para inferencia, considerando los pesos en FP16 (0.9 GB) y la memoria necesaria para las activaciones y el procesamiento de imágenes.
- GPU recomendadas: una NVIDIA RTX 3060 12GB o superior es suficiente. También debería funcionar en RTX 4060, RTX 4070, A100, H100 y GPUs de la serie T4.
- Compatibilidad con GPU de consumo: sí. La arquitectura SmolVLA está orientada a desplegarse en hardware de consumo, y este modelo concreto de 450M se encuentra dentro de ese rango.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), ya que es la librería de referencia del modelo. No se especifican alternativas como vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa rigurosa. El modelo es un fine-tuning de `lerobot/smolvla_base`, pero no se han proporcionado especificaciones del modelo base ni de otros VLA de tamaño comparable (por ejemplo, OpenVLA o RT-2) en la información consultada. Por tanto, no se incluye una tabla comparativa.

## Limitaciones y advertencias

- Falta de resultados de evaluación: no se ha medido la tasa de éxito en robot real, lo que impide conocer su rendimiento efectivo.
- Generalización limitada: al estar entrenado con solo 99 episodios y una tarea específica, es probable que falle ante cambios en la iluminación, la posición de los objetos o las configuraciones de cámara.
- Dependencia de la configuración de hardware: el modelo requiere las teclas de entrada exactas (`observation.images.camera1`, `camera2`, `camera3`, `empty_camera_0`) y un robot `so_follower`; no funcionará con otros robots o cámaras sin adaptación.
- Sesgos conocidos: no hay información al respecto en la model card.
- Riesgo de alucinación: no aplica, al no ser un generador de texto, pero las predicciones de acción pueden ser incorrectas cuando el problema está fuera de la distribución de entrenamiento.
- Uso comercial: la licencia Apache 2.0 permite el uso comercial, pero el modelo se distribuye sin garantías y con responsabilidad limitada del autor.

## Enlaces

- Repositorio: https://huggingface.co/mkche9/solo_plate_smolvla
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/mkche9/sponge_solo_plate
- LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mkche9/sponge_solo_plate
