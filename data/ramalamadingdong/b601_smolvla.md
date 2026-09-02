# ramalamadingdong/b601_smolvla

## Resumen

`ramalamadingdong/b601_smolvla` es un modelo de visión-lenguaje-acción (VLA) compacto, con 450 millones de parámetros, desarrollado como fine-tuning del modelo base `lerobot/smolvla_base` de Hugging Face. SmolVLA está diseñado para resolver el problema del alto coste computacional de los modelos VLA tradicionales, que suelen ser masivos y requieren hardware especializado. Este modelo concreto se ha ajustado para tareas de pick-and-place (recogida y colocación) sobre el dataset `ramalamadingdong/b601_pick_place_clean`, utilizando el framework LeRobot.

La relevancia de este modelo radica en que demuestra que es posible obtener políticas robóticas funcionales con un coste computacional reducido, desplegables en hardware de consumo. El modelo recibe múltiples imágenes y una instrucción en lenguaje natural, y genera un fragmento de acciones (action chunk) mediante flow matching. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): VLM compacto preentrenado + experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de visión-lenguaje (VLM) compacto preentrenado con un experto de acciones entrenado mediante flow matching. Dado un conjunto de imágenes y una instrucción en lenguaje natural que describe la tarea, el modelo genera un fragmento de acciones (action chunk) que se ejecuta en el robot. Esta arquitectura híbrida permite aprovechar el conocimiento visual y lingüístico del VLM preentrenado sin necesidad de entrenar una política desde cero.

El modelo `b601_smolvla` es un fine-tuning del base `lerobot/smolvla_base` realizado con el framework LeRobot sobre el dataset `ramalamadingdong/b601_pick_place_clean`, un conjunto de datos de demostraciones de pick-and-place. El entrenamiento se realizó siguiendo la guía oficial de LeRobot para entrenamiento de políticas robóticas. No se dispone de información detallada sobre el número de episodios, tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

## Capacidades

- Generación de acciones robóticas a partir de imágenes y instrucciones en lenguaje natural.
- Ejecución de tareas de pick-and-place (recogida y colocación de objetos).
- Control de robots manipuladores, específicamente el brazo SO-100 según la guía de evaluación incluida en la model card.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- Despliegue en hardware de consumo gracias a su tamaño reducido (450M parámetros).
- Generación de action chunks mediante flow matching, lo que permite predicciones de acciones suaves y coherentes.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico para recoger objetos de una posición y colocarlos en otra, guiado por instrucciones en lenguaje natural, lo que facilita la reconfiguración de tareas sin reprogramación manual.
- Prototipado rápido de políticas robóticas en investigación: al ser un modelo compacto entrenable con LeRobot, los investigadores pueden fine-tunearlo sobre nuevos datasets de demostraciones en horas y con hardware asequible, acelerando el ciclo de iteración experimental.
- Educación y formación en robótica: su bajo requisito de hardware permite que laboratorios docentes y estudiantes ejecuten políticas VLA en GPUs de consumo, haciendo accesible la robótica basada en aprendizaje a entornos académicos con presupuesto limitado.
- Evaluación comparativa de políticas robóticas: al estar integrado con LeRobot, puede utilizarse como baseline en experimentos que comparen diferentes arquitecturas de control o estrategias de entrenamiento sobre el mismo dataset.
- Despliegue en robots de bajo coste tipo SO-100: el modelo está adaptado a este brazo robótico de bajo coste, lo que permite implementar manipulación autónoma en configuraciones de hardware reducido.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning de VLMs compactos mejora la generalización de políticas robóticas en tareas específicas como pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tuning en la informacion disponible. El paper original de SmolVLA (arXiv:2506.01844) describe evaluaciones del modelo base, pero no se dispone de esos datos en la informacion proporcionada para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 450M parámetros, lo que supone aproximadamente 0,9 GB en precisión FP16/BF16 (el tamaño del repositorio es de 0,9 GB). En FP32 ocuparía unos 1,8 GB. Cabe holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM.
- GPUs recomendadas: cualquier GPU de consumo moderna, incluyendo RTX 3060, RTX 4060, RTX 4090, o incluso GPUs integradas con suficiente VRAM. No requiere GPUs de datacenter como A100 o H100.
- Despliegue: el modelo se integra con el framework LeRobot (librería `lerobot`), que utiliza PyTorch como backend. Los comandos de entrenamiento y evaluación se ejecutan mediante `lerobot-train` y `lerobot-record`.
- Latencia y throughput: no se dispone de datos de latencia específicos para este fine-tuning. Dado el tamaño reducido del modelo, se espera que la inferencia sea significativamente más rápida que la de VLAs de 7B+ parámetros, aunque no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ramalamadingdong/b601_smolvla (este) | 450M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | no disponible | Apache 2.0 | Hugging Face |
| adrfm/pick_place_b601_smolvla_v1 | no disponible | no disponible | no disponible | Hugging Face |

El modelo base `lerobot/smolvla_base` es la referencia directa: este fine-tuning se diferencia por estar ajustado específicamente al dataset `b601_pick_place_clean` para tareas de pick-and-place. Existe otro fine-tuning similar (`adrfm/pick_place_b601_smolvla_v1`) sobre el mismo dataset, aunque no se dispone de detalles sobre sus parámetros. En comparación con VLAs de mayor tamaño (típicamente en el rango de 7B+ parámetros, como se menciona en el abstract del paper), SmolVLA ofrece un coste computacional y de despliegue muy inferior, a costa de un rendimiento potencialmente menor en tareas complejas.

## Limitaciones y advertencias

- El modelo es un fine-tuning específico para tareas de pick-and-place sobre el dataset `b601_pick_place_clean`; su capacidad de generalización a otras tareas o entornos no está garantizada.
- La guía de evaluación incluida en la model card referencia el brazo robótico SO-100, lo que sugiere que el modelo está adaptado a ese hardware concreto; su uso con otros robots requeriría verificación.
- No se dispone de información sobre los idiomas soportados para las instrucciones en lenguaje natural; es probable que el rendimiento varíe según el idioma de la instrucción.
- No se han publicado benchmarks específicos para este fine-tuning, por lo que no hay datos objetivos sobre su rendimiento en tareas estandarizadas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que es un modelo muy reciente o poco validado por la comunidad.
- No se dispone de información sobre sesgos conocidos, pero al ser un modelo entrenado sobre demostraciones robóticas, podría heredar sesgos del dataset de demostraciones (por ejemplo, posiciones iniciales, tipos de objetos o iluminación del entorno de captura).
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento `ramalamadingdong/b601_pick_place_clean` no tenga restricciones adicionales que afecten al uso del modelo resultante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ramalamadingdong/b601_smolvla
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ramalamadingdong/b601_pick_place_clean
- Modelo similar: https://huggingface.co/adrfm/pick_place_b601_smolvla_v1
