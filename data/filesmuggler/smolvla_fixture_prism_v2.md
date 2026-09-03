# filesmuggler/smolvla_fixture_prism_v2

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo. Este repositorio concreto, `filesmuggler/smolvla_fixture_prism_v2`, es un fine-tune del modelo base `lerobot/smolvla_base` realizado con la librería LeRobot sobre un dataset propio de 50 episodios de una tarea de manipulación robótica (experimento con un fixture prism). El modelo toma imágenes de varias cámaras y el estado del robot, y produce acciones de control de 6 grados de libertad.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de bajo coste para una tarea específica, utilizando herramientas open source como LeRobot. Al ser un modelo pequeño (450M parámetros), puede desplegarse en GPUs de gama media, lo que lo hace accesible para laboratorios de investigación y desarrolladores sin infraestructura de alto rendimiento. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basado en SmolVLM) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual, un modelo de lenguaje y una cabeza de acción. El modelo base fue preentrenado por Hugging Face sobre grandes conjuntos de datos multimodales, y este repositorio contiene un fine-tune supervisado mediante imitación (behavior cloning) sobre un dataset de demostraciones de una tarea de manipulación con un robot tipo `so_follower`. El dataset incluye 50 episodios con 23.800 frames a 30 FPS, con imágenes de tres cámaras (top, wrist y una cámara adicional) y el estado del robot (6 dimensiones). El entrenamiento se realizó con 40.000 pasos, batch size 16, optimizador AdamW y learning rate 0.0001, usando la librería LeRobot versión 0.6.2. No se aplicaron técnicas de RLHF ni DPO; es un fine-tune puramente de imitación.

## Capacidades

- Control robótico: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente imágenes de múltiples cámaras (resoluciones 256x256 y 480x640) junto con el estado del robot.
- Ejecución de tareas específicas: entrenado para una tarea concreta de manipulación (experimento con fixture prism), no es un modelo generalista.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de políticas robóticas de Hugging Face.
- No soporta generación de texto, tool calling, ni capacidades de agente conversacional; es exclusivamente un modelo de acción visual.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el fine-tuning de VLA en tareas de manipulación con pocos datos (50 episodios).
- Prototipado rápido de políticas robóticas: permite validar el flujo de LeRobot (grabación de datos, entrenamiento, rollout) en hardware de laboratorio sin necesidad de GPUs de alta gama.
- Tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea específica de manipulación del fixture prism para la que fue entrenado, con cámaras top y wrist.
- Benchmark de VLA compactos: útil para comparar el rendimiento de SmolVLA frente a modelos más grandes en tareas de manipulación real.
- Educación en robótica: adecuado para cursos y talleres donde se enseña el entrenamiento de políticas de control con visión, gracias a su bajo coste computacional.
- Despliegue en robots de bajo coste: al ser un modelo pequeño, puede ejecutarse en robots con computación embebida (por ejemplo, Jetson) para aplicaciones de automatización sencilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política. El paper original de SmolVLA (arXiv:2506.01844) reporta rendimiento competitivo frente a modelos más grandes, pero no se dispone de cifras concretas en este repositorio.

## Requisitos de hardware

- VRAM estimada: al tener 450M parámetros, el modelo en fp32 ocupa aproximadamente 1,8 GB, y en fp16 unos 0,9 GB. El tamaño del repositorio es de 0,9 GB, lo que sugiere pesos en fp16 o cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super) puede ejecutar la inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: se utiliza exclusivamente a través de LeRobot, con el comando `lerobot-rollout` para ejecutar la política en un robot real. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no se dispone de datos medidos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | No disponible | Propietaria | No público |

SmolVLA es significativamente más pequeño que OpenVLA (450M vs 7B), lo que permite su ejecución en hardware de consumo. El paper original indica que SmolVLA alcanza un rendimiento competitivo con modelos mucho más grandes en tareas de manipulación, aunque no se incluyen cifras en este repositorio. RT-2 no es de código abierto, por lo que SmolVLA ofrece una alternativa accesible para investigación.

## Limitaciones y advertencias

- Es un fine-tune específico para una tarea concreta (manipulación de un fixture prism); no generaliza a otras tareas sin reentrenamiento.
- No se han proporcionado resultados de evaluación en el robot real, por lo que el rendimiento real es desconocido.
- El dataset de entrenamiento es pequeño (50 episodios), lo que puede limitar la robustez frente a variaciones en la posición de objetos o iluminación.
- No soporta generación de lenguaje natural ni interacción conversacional; es exclusivamente un modelo de control.
- Los idiomas soportados no están documentados, aunque al ser un modelo de acción visual, el idioma no es relevante para su funcionamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de la configuración específica del robot (tipo `so_follower`), lo que puede requerir adaptaciones para otros hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/filesmuggler/smolvla_fixture_prism_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/filesmuggler/fixture-experiment-prism-simple-50_20260902_214241
