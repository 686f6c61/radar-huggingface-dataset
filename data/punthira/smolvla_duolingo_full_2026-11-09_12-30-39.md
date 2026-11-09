# punthira/smolvla_duolingo_full_2026-11-09_12-30-39

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Este repositorio concreto (`punthira/smolvla_duolingo_full_2026-11-09_12-30-39`) es un ajuste fino del modelo base `lerobot/smolvla_base` orientado a una tarea robótica específica: devolver un peluche de Duolingo a su nido. El modelo resuelve el problema de control robótico por imitación a partir de observaciones multimodales (estado de las articulaciones e imágenes de cámaras).

El modelo combina un codificador visual-lenguaje con un decodificador de acciones, sumando 450 millones de parámetros en formato safetensors. Está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que necesitan prototipar políticas robóticas sin depender de clústeres de GPU. La licencia Apache 2.0 facilita su uso comercial y su modificación.

Este checkpoint en particular ha sido entrenado sobre un dataset de 97 episodios y 49.013 fotogramas a 30 FPS, con 20.000 pasos de entrenamiento y un tamaño de lote de 8. Es un ejemplo típico de política de imitación de extremo a extremo para un robot `so_follower` con dos cámaras (muñeca y cenital).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer, ajustada desde `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que procesa observaciones multimodales: estado de las articulaciones (`observation.state`, vector de 6 dimensiones) e imágenes de tres cámaras (`observation.images.camera1`, `camera2`, `camera3`, cada una de 3×256×256 píxeles). Produce un vector de acción de 6 dimensiones (`action`). El modelo base `lerobot/smolvla_base` se ha ajustado con 20.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.7.1.

El entrenamiento se realizó por imitación sobre el dataset `sitthaveet/duolingo_to_nest_20261101_154145`, compuesto por 97 episodios y 49.013 fotogramas a 30 FPS, con la tarea única "put Duolingo back to bird's nest". No se especifican datos sobre RLHF, DPO ni innovaciones técnicas adicionales más allá de las propias del modelo base SmolVLA (que incluye un diseño eficiente para hardware de consumo). El robot utilizado es `so_follower` con cámaras `wrist` y `top`.

## Capacidades

- Control robótico por imitación: genera acciones de 6 dimensiones a partir de observaciones de estado e imágenes.
- Procesamiento multimodal: integra tres cámaras (aunque la model card menciona `wrist` y `top`, la tabla de inputs lista tres cámaras) y estado de articulaciones.
- Ejecución en hardware de consumo: el modelo base está diseñado para desplegarse en GPUs asequibles.
- Tarea especializada: entrenado exclusivamente para "put Duolingo back to bird's nest".
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento, al ser un modelo de robótica y no de lenguaje general.

## Casos de uso

- Automatización de tareas de recogida y colocación: el modelo puede ejecutar la secuencia de movimientos para devolver un objeto (peluche de Duolingo) a su nido, usando las cámaras para localizar el objeto y el estado de las articulaciones para controlar el brazo.
- Prototipado rápido de políticas robóticas: al estar basado en SmolVLA y LeRobot, permite a desarrolladores fine-tuning con sus propios datasets y desplegar en robots `so_follower` con hardware asequible.
- Investigación en imitación de bajo coste: sirve como referencia para estudiar el rendimiento de modelos VLA compactos en tareas de manipulación con un solo objeto y entorno controlado.
- Pruebas de integración con LeRobot: el repositorio incluye comandos `lerobot-rollout` y `lerobot-train`, lo que facilita la evaluación y el reentrenamiento en pipelines existentes.
- Educación y demos: por su tamaño reducido (450M parámetros) y licencia Apache 2.0, es adecuado para demostraciones en entornos académicos o talleres de robótica.
- Benchmarking de políticas de imitación: puede usarse como línea base para comparar con otras políticas entrenadas en el mismo dataset o tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 450M parámetros, una estimación conservadora en FP16 sería de aproximadamente 0,9 GB solo para pesos, más overhead de activaciones y memoria de las imágenes; en la práctica, cabría en GPUs de 4-8 GB.
- GPU recomendadas: no disponible. El modelo base SmolVLA está diseñado para hardware de consumo, por lo que se espera que funcione en RTX 3060/4060 o superiores, pero no se confirma en la documentación.
- ¿Cabe en consumer GPU? Sí, según la descripción del modelo base ("can be deployed on consumer-grade hardware"), aunque no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `punthira/smolvla_duolingo_full_2026-11-09_12-30-39` | 450M | no disponible | Robótica (VLA) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible (modelo base) | no disponible | Robótica (VLA) | Apache 2.0 | Hugging Face |
| Otros modelos VLA comparables (p. ej. OpenVLA, RT-2) | no disponible en la información | no disponible | Robótica (VLA) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea ("put Duolingo back to bird's nest"); no generaliza a otras tareas sin reentrenamiento.
- Entrenado con solo 97 episodios y 49.013 fotogramas, lo que puede provocar sobreajuste al entorno y posiciones específicas del dataset.
- No se han publicado evaluaciones de éxito en robot real, por lo que se desconoce su robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- No se documentan sesgos, pero al ser un modelo de imitación, puede reproducir sesgos presentes en las demostraciones humanas.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí puede generar acciones incorrectas o inseguras en entornos no vistos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias restricciones (no especificadas).
- No se especifican limitaciones de contexto o idioma porque no es un modelo de lenguaje.
- Para producción, es necesario validar la política en el robot objetivo y con condiciones variables antes de desplegarla.

## Enlaces

- Hugging Face: https://huggingface.co/punthira/smolvla_duolingo_full_2026-11-09_12-30-39
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset: https://huggingface.co/datasets/sitthaveet/duolingo_to_nest_20261101_154145
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizar dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sitthaveet/duolingo_to_nest_20261101_154145
