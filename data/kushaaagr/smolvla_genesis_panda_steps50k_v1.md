# kushaaagr/smolvla_genesis_panda_steps50k_v1

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. La variante publicada por kushaaagr ha sido entrenada sobre el modelo base `lerobot/smolvla_base` para una tarea concreta de manipulación robótica con un brazo Franka Panda: recoger un cubo rojo y elevarlo. El entrenamiento se realizó con el framework LeRobot sobre un dataset sintético de 50 episodios y 57.500 frames.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede especializarse en tareas de manipulación concretas con un coste computacional modesto, lo que lo hace viable para hardware de consumo. Al estar licenciado bajo Apache 2.0 y ser totalmente reproducible con LeRobot, cualquier desarrollador puede reentrenarlo o adaptarlo a su propio robot sin barreras de entrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje para generar acciones de control robótico a partir de observaciones multimodales. Su arquitectura está descrita en el paper arxiv 2506.01844 y está diseñada para ser eficiente en cómputo y desplegable en hardware de consumo. Este modelo concreto es un fine-tuning del base `lerobot/smolvla_base` realizado con LeRobot 0.6.2.

El entrenamiento se ejecutó durante 50.000 pasos con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 1e-4, con semilla 1000. El dataset de entrenamiento es `local/genesis_panda_pick_place_prod1`, que contiene 50 episodios y 57.500 frames a 30 FPS de la tarea "Pick up the target red cube and lift it" ejecutada en un robot Franka Panda con dos cámaras (frontal y de muñeca). Las observaciones de entrada incluyen dos imágenes de 224x224 píxeles y un vector de estado de 9 dimensiones; la salida es un vector de acción de 9 dimensiones.

## Capacidades

- Manipulación robótica de brazo único: control de acciones de 9 dimensiones (posición, orientación y apertura de pinza) sobre un robot Franka Panda.
- Integración de visión y lenguaje: combina dos entradas de imagen (cámara frontal y de muñeca) con instrucciones en lenguaje natural.
- Ejecución de tareas específicas: entrenado para la tarea "Pick up the target red cube and lift it" (recoger el cubo rojo y elevarlo).
- Inferencia en bucle de control: captura de imágenes a 30 fps, adecuado para control en tiempo real.
- Reproducibilidad completa: el entrenamiento puede replicarse con LeRobot usando el modelo base y el dataset indicado.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio o producción: el modelo controla un Franka Panda para recoger y elevar objetos, sustituyendo secuencias programadas manualmente por una política aprendida.
- Prototipado rápido de políticas robóticas: por su tamaño reducido, permite validar técnicas de aprendizaje por imitación en robots reales sin necesidad de una GPU de gama alta.
- Investigación en modelos VLA: sirve como punto de partida para experimentos de fine-tuning sobre tareas específicas con LeRobot, comparando distintos datasets, hiperparámetros o configuraciones de cámaras.
- Demostraciones educativas: al ser de pequeño tamaño y licencia permisiva, se puede desplegar en un Franka Panda para enseñar conceptos de robótica y aprendizaje por imitación en cursos universitarios o talleres.
- Sistemas de control de bajo coste: al caber en hardware de consumo, permite construir prototipos de robots con capacidades de razonamiento visual-lenguaje a un coste reducido.
- Evaluación de datasets sintéticos: al estar entrenado sobre datos generados con Genesis, este modelo es útil para comparar la calidad de datos sintéticos frente a datos reales en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política en robot real.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. SmolVLA está diseñado para hardware de consumo, pero no se especifican los requisitos exactos de VRAM para este fine-tuning.
- GPU recomendadas: no disponible. Como referencia general, SmolVLA de 450M de parámetros puede ejecutarse en GPUs consumer de gama media (p. ej., RTX 3060 o superiores), pero no hay datos concretos para este modelo.
- Despliegue: se ejecuta con LeRobot mediante el comando `lerobot-rollout`, que gestiona la inferencia y el control del robot.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| kushaaagr/smolvla_genesis_panda_steps50k_v1 | 450M | pick-and-place (Franka Panda) | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | general, no especializado | Apache 2.0 | HuggingFace |
| OpenVLA (referencia) | 7B | general, VLA de gran tamaño | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger y elevar un cubo rojo; no generaliza a otras tareas ni a otros objetos sin reentrenamiento.
- El dataset de entrenamiento es sintético (Genesis), lo que puede limitar la transferencia a entornos reales con iluminación, texturas o dinámicas diferentes.
- No se han publicado resultados de evaluación en robot real, por lo que su rendimiento en producción no está validado.
- La ventana de contexto no está documentada, por lo que no se conoce si soporta instrucciones largas o múltiples turnos de lenguaje.
- Los idiomas soportados no están especificados; el modelo base SmolVLA tiene capacidades multilingües, pero no se ha confirmado para este fine-tuning.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad del despliegue y la seguridad en entornos de producción recae en el usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kushaaagr/smolvla_genesis_panda_steps50k_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/local/genesis_panda_pick_place_prod1
