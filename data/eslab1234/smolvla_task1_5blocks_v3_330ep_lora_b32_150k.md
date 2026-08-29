# eslab1234/smolvla_task1_5blocks_v3_330ep_lora_b32_150k

## Resumen

El modelo `eslab1234/smolvla_task1_5blocks_v3_330ep_lora_b32_150k` es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, desarrollado por el usuario eslab1234. SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para tareas de robótica, que puede ejecutarse en hardware de consumo. Este fine-tune se ha entrenado específicamente para una tarea de manipulación: recoger cinco bloques de colores en secuencia y colocarlos en un área objetivo, utilizando un robot tipo `so_follower` con tres cámaras.

El modelo se ha entrenado con el framework LeRobot, sobre un dataset propio de 330 episodios (459.287 frames a 30 FPS), con 150.000 pasos de entrenamiento, batch size 32 y learning rate 1e-4. La relevancia de este modelo radica en demostrar cómo adaptar un VLA preentrenado a una tarea concreta con un coste computacional reducido, manteniendo la licencia Apache 2.0 y utilizando pesos en formato safetensors. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en SmolVLA, VLA compacto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base `lerobot/smolvla_base`, que a su vez se basa en la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. SmolVLA combina un modelo de lenguaje y visión preentrenado con un "action expert" entrenado mediante flow matching, generando secuencias de acciones a partir de observaciones visuales y una instrucción en lenguaje natural. En este caso, el fine-tune se ha realizado con la técnica LoRA (indicada en el nombre del repositorio), lo que reduce significativamente el número de parámetros entrenables.

El entrenamiento se realizó con el framework LeRobot (versión 0.5.2), utilizando el dataset `eslab1234/task1_hybrid_5blocks_v3_330ep_merged`, que contiene 330 episodios de una tarea de recogida y colocación de bloques. Se emplearon 150.000 pasos de entrenamiento, batch size 32, optimizador AdamW y learning rate 1e-4, con semilla 1000. No se especifican detalles adicionales sobre la composición del dataset ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Control robótico de precisión: genera acciones de 6 dimensiones (posición y orientación) a partir de observaciones de estado y tres cámaras (256x256 píxeles cada una).
- Seguimiento de instrucciones en lenguaje natural: la tarea se describe como "Pick up the 5 blocks in sequence (red, yellow, wood, green, blue), then place each at the target area", lo que indica que el modelo interpreta comandos textuales para ejecutar la manipulación.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Procesamiento multimodal: combina visión (tres cámaras) y estado del robot (6 valores) para producir acciones.
- Eficiencia computacional: al ser un fine-tune LoRA de SmolVLA, está diseñado para ejecutarse en hardware de consumo, aunque no se especifican requisitos exactos.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger y colocar objetos en posiciones específicas, siguiendo una secuencia definida por instrucción.
- Investigación en aprendizaje por imitación: sirve como ejemplo de cómo adaptar un VLA preentrenado a una tarea concreta con pocos datos, útil para laboratorios que estudian políticas robóticas.
- Prototipado rápido de soluciones robóticas: gracias a su integración con LeRobot, permite desplegar una política funcional en un robot `so_follower` con comandos simples como `lerobot-rollout`.
- Educación y demostraciones: al ser un modelo pequeño y con licencia Apache 2.0, puede utilizarse en entornos académicos para enseñar conceptos de VLA y aprendizaje por refuerzo.
- Benchmarking de algoritmos de control: puede servir como baseline para comparar otras técnicas de fine-tuning o arquitecturas en tareas de manipulación.
- Desarrollo de asistentes robóticos domésticos: aunque la tarea es específica, la metodología puede extrapolarse a otras tareas del hogar con datasets similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información proporcionada.
- SmolVLA está diseñado para ser eficiente y ejecutable en hardware de consumo, pero no se indican cifras concretas para este fine-tune.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU (por ejemplo, con `--policy.device=cuda`).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El autor ha publicado otros fine-tunes del mismo base (por ejemplo, `smolvla_task1_5blocks_v3_330ep_fullft_b16_150k_v1` y `smolvla_task1_5blocks_v3_100ep_b64_50k_v1`), pero no se han reportado resultados de rendimiento para ninguno de ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real es desconocido.
- El modelo está entrenado para una tarea muy específica (recoger 5 bloques en secuencia) y puede no generalizar a otras tareas o entornos.
- Depende de la configuración de cámaras y del robot `so_follower`; cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- El dataset de entrenamiento es propio y no se detalla su composición, lo que puede implicar sesgos no documentados.
- Al ser un fine-tune LoRA, la capacidad de adaptación puede estar limitada en comparación con un fine-tune completo, aunque no se han comparado ambos.
- No se especifican limitaciones de contexto o idioma, pero al ser un modelo de robótica, su uso está restringido a la tarea de control.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del dataset.

## Enlaces

- [HuggingFace - eslab1234/smolvla_task1_5blocks_v3_330ep_lora_b32_150k](https://huggingface.co/eslab1234/smolvla_task1_5blocks_v3_330ep_lora_b32_150k)
- [Paper SmolVLA (arXiv:2506.01844)](https://arxiv.org/abs/2506.01844)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Dataset de entrenamiento](https://huggingface.co/datasets/eslab1234/task1_hybrid_5blocks_v3_330ep_merged)
