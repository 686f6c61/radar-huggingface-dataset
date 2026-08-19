# khanhnd61/smolvla_so101_tape_prune10

## Resumen

El modelo `khanhnd61/smolvla_so101_tape_prune10` es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para controlar robots mediante instrucciones en lenguaje natural. Este checkpoint concreto ha sido entrenado por khanhnd61 sobre la base `lerobot/smolvla_base` para ejecutar una tarea específica de manipulación: colocar una cinta adhesiva dentro de una caja, utilizando un robot tipo `so_follower` (SO-101). El modelo se distribuye a través del ecosistema LeRobot y está pensado para experimentos de aprendizaje por imitación en robótica real.

La relevancia de este modelo radica en que SmolVLA es una de las arquitecturas VLA más ligeras disponibles, con alrededor de 500 millones de parámetros en su versión original, lo que permite su despliegue en hardware de consumo. En este caso, el checkpoint presenta 354 millones de parámetros según los pesos en safetensors, probablemente debido a una poda (pruning) indicada en el sufijo "prune10". El modelo está licenciado bajo Apache 2.0, lo que facilita su uso comercial e investigación. Sin embargo, se trata de un modelo especializado: no es un asistente de lenguaje general, sino una política robótica entrenada para una tarea concreta con un dataset reducido de 10 episodios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): encoder visual SigLIP + modelo de lenguaje SmolLM2 + action expert |
| Parametros totales | 354.210.336 |
| Parametros activos | No aplica (no es MoE); solo se fine-tunean aproximadamente 50M (action expert y proyecciones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base SmolLM2 soporta multilingue, pero este fine-tune no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina tres componentes principales: un encoder visual SigLIP que procesa imágenes de las cámaras (frontal y de muñeca, aunque el modelo acepta tres cámaras), un modelo de lenguaje SmolLM2 que interpreta la instrucción textual, y un action expert que produce comandos de acción de 6 dimensiones (posición y orientación del efector). Según el blog de ggando.com sobre fine-tuning de SmolVLA, durante el entrenamiento solo se actualizan los pesos del action expert y las proyecciones, mientras que el encoder visual y el modelo de lenguaje permanecen congelados. Esto reduce drásticamente los requisitos de cómputo y memoria.

El entrenamiento se realizó con LeRobot (versión 0.6.1) mediante aprendizaje por imitación (behavior cloning). Se usaron 4000 pasos de entrenamiento con un batch size de 8, optimizador AdamW y una tasa de aprendizaje de 0.0001, con semilla 1000. El dataset de entrenamiento, `khanhnd61/so101-tape_20260804_224429`, contiene 10 episodios y 3434 frames a 30 FPS, todos con la misma tarea: "Put the tape into the box". Las imágenes de entrada tienen resolución 256x256 píxeles y el estado del robot es un vector de 6 dimensiones. El sufijo "prune10" sugiere que se aplicó algún tipo de poda al 10%, pero no se proporciona información detallada sobre el método de poda utilizado.

## Capacidades

- Control de robot manipulador: genera acciones de 6 dimensiones (posición y orientación) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa hasta tres cámaras simultáneamente (frontal, muñeca y una tercera) con resolución 256x256.
- Ejecución de tareas de manipulación por imitación: reproduce la tarea aprendida ("colocar la cinta en la caja") con el robot SO-101.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante texto, lo que permite condicionar el comportamiento del robot.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue.
- Eficiencia computacional: al ser un modelo compacto (354M parámetros), puede ejecutarse en GPUs de consumo, a diferencia de VLAs más grandes como OpenVLA (7B).
- Fine-tuning específico: está optimizado para una tarea concreta, lo que lo hace adecuado para experimentos de aprendizaje por imitación con datasets pequeños.

## Casos de uso

- Automatización de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico SO-101 para recoger objetos (como cintas adhesivas) y depositarlos en contenedores, reduciendo la necesidad de programación manual de trayectorias.
- Prototipado rápido de políticas robóticas con LeRobot: los investigadores pueden usar este checkpoint como punto de partida para fine-tuning en tareas similares, aprovechando los 4000 pasos de entrenamiento ya realizados y la integración con la CLI de LeRobot.
- Experimentos de aprendizaje por imitación en laboratorio: dado que el dataset es pequeño (10 episodios), es útil para estudiar cómo los modelos VLA se comportan con pocas demostraciones y para investigar técnicas de aumento de datos o regularización.
- Robots de asistencia en almacenes y logística: la tarea de colocar un objeto en una caja es un caso representativo de operaciones de empaquetado, y el modelo puede adaptarse a variantes de esta tarea con fine-tuning adicional.
- Investigación en eficiencia de modelos VLA: al comparar este modelo con versiones sin poda o con otros VLAs, se puede analizar el impacto de la poda en el rendimiento de control robótico.
- Educación y demostraciones de robótica: gracias a su tamaño reducido y licencia Apache 2.0, es adecuado para cursos universitarios o talleres donde se necesite un modelo funcional que quepa en una GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en el robot real, ni comparaciones cuantitativas con otros modelos en tareas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 354 millones de parámetros, el modelo ocupa aproximadamente 0.7 GB en pesos safetensors. En FP32, la inferencia requeriría alrededor de 1.4 GB de VRAM, pero con cuantización a FP16 o int8 cabría en GPUs con 2-4 GB. No se dispone de datos oficiales de consumo de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050, RTX 3060 o superiores. También es compatible con GPUs de datacenter como A100 o H100 si se requiere mayor throughput.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos principales de SmolVLA, según el paper y la documentación de LeRobot.
- Opciones de despliegue: el modelo se ejecuta principalmente mediante LeRobot, usando el comando `lerobot-rollout`. También puede integrarse con frameworks de inferencia como vLLM o TGI si se convierte a formatos compatibles, aunque no se documenta explícitamente.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por paso en GPUs modernas, pero esto depende del hardware y de la optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khanhnd61/smolvla_so101_tape_prune10 | 354M | No disponible | Pick-and-place de cinta en caja | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | ~500M | No disponible | VLA general (preentrenamiento) | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | 2048 tokens | VLA general (instrucciones + visión) | MIT (pesos) | Hugging Face |
| RT-2 (Google) | 55B | No disponible | VLA general | No abierto | No disponible |

SmolVLA destaca frente a OpenVLA por su tamaño significativamente menor (354M vs 7B), lo que permite inferencia en hardware de consumo y fine-tuning con datasets pequeños. OpenVLA ofrece mayor capacidad de generalización a múltiples tareas, pero requiere GPUs de alta gama para inferencia en tiempo real. El modelo base `lerobot/smolvla_base` es el punto de partida preentrenado, y este checkpoint es un fine-tuning específico que sacrifica generalidad por especialización en una tarea concreta.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 10 episodios y 3434 frames, lo que aumenta el riesgo de sobreajuste y limita la generalización a variaciones de la tarea (cambios de iluminación, posición de objetos, etc.).
- Sin resultados de evaluación: la model card no reporta tasa de éxito en el robot real, por lo que el rendimiento real es desconocido.
- Especialización extrema: el modelo solo está entrenado para la tarea "Put the tape into the box" con el robot `so_follower`. No es adecuado para otras tareas sin fine-tuning adicional.
- Posible poda no documentada: el sufijo "prune10" sugiere que se aplicó poda, pero no se detalla el método ni el impacto en la calidad de las predicciones.
- Dependencia de cámaras específicas: el modelo espera tres cámaras con nombres concretos (`camera1`, `camera2`, `camera3`), lo que puede requerir adaptación si el hardware difiere.
- Riesgo de alucinación en acciones: como cualquier modelo de aprendizaje automático, puede generar acciones incorrectas o inestables en situaciones no vistas, lo que es crítico en robótica física.
- Sin soporte de idiomas declarado: aunque el modelo base SmolLM2 es multilingüe, no se especifica qué idiomas soporta este fine-tune; la instrucción está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de verificar la seguridad del robot y de cumplir con las normativas aplicables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khanhnd61/smolvla_so101_tape_prune10
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-tape_20260804_224429
- Proyecto relacionado de fine-tuning SmolVLA para SO-101: https://github.com/ajingu/SmolVLA-SO101-Tape-Dispenser
- Blog sobre fine-tuning SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
