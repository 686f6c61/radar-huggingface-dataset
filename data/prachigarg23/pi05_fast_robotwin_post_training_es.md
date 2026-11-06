# prachigarg23/pi05_FAST_robotwin_post_training_ES

## Resumen

`pi05_FAST_robotwin_post_training_ES` es un checkpoint de investigación de un modelo de visión-lenguaje-acción (VLA) para manipulación robótica, publicado por Prachi Garg en Hugging Face bajo el ecosistema openpi. Se trata de un fine-tuning de π0.5 con tokens FAST sobre el benchmark RoboTwin, concretamente sobre las tareas de apilado de bloques (*stack blocks*) de la etapa 2, partiendo del checkpoint intermedio `pi05_FAST_robotwin_mid_training`. El sufijo "ES" indica que es el checkpoint *baseline* del artículo "Fine-Tuning VLAs with Self-Demonstrated Generative Control for Multi-Task Manipulation" (arXiv 2608.19490).

El modelo resuelve el problema de adaptar un VLA preentrenado a tareas de manipulación multi-tarea en simulación mediante post-entrenamiento con demostraciones expertas. Es relevante porque acompaña a un artículo que propone el uso de control generativo auto-demostrado para el fine-tuning de VLA, y porque se distribuye con licencia Apache 2.0, lo que facilita su reproducción y comparación.

La información pública disponible es escasa: la model card no detalla arquitectura interna, número de parámetros ni longitud de contexto, y no se han publicado resultados de benchmarks en la información proporcionada. El repositorio ocupa 24,9 GB, lo que sugiere pesos en precisión completa o bfloat16 sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 con tokens FAST |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio de 24,9 GB, aparentemente sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint openpi descargable vía `hf download`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre π0.5 (la evolución del modelo π0 de Physical Intelligence) con tokenización FAST para las acciones. La arquitectura subyacente combina un backbone de visión-lenguaje con un decodificador de acciones, aunque la model card no detalla la configuración exacta de capas, dimensión oculta ni número de parámetros. El checkpoint corresponde al paso 6000 de entrenamiento y no incluye estado del optimizador.

El entrenamiento consiste en un fine-tuning supervisado sobre demostraciones expertas del dataset `robotwin_post_training_stack_blocks_expert`, centrado en las tareas de apilado de bloques de la etapa 2 de RoboTwin. Se parte del checkpoint `pi05_FAST_robotwin_mid_training`, lo que configura un pipeline de entrenamiento por etapas (mid-training y post-training). No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el artículo asociado propone un marco de control generativo auto-demostrado, pero los detalles metodológicos no están recogidos en la model card.

## Capacidades

- Manipulación robótica multi-tarea en simulación: ejecución de tareas de apilado de bloques en el benchmark RoboTwin.
- Control visomotor a partir de observaciones visuales e instrucciones de tarea, propio de un VLA.
- Generación de acciones mediante tokens FAST, lo que permite decodificación de secuencias de acción discretizadas.
- Evaluación con horizonte de ejecución configurable (el ejemplo de uso emplea `--exec_horizon 25`).
- Integración con el ecosistema openpi para descarga de checkpoints y ejecución de tests.
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades multilingües: no disponible en la información proporcionada (el modelo está orientado a robótica, no a texto general).

## Casos de uso

- Reproducción de resultados del artículo: el checkpoint ES sirve como línea base para comparar la propuesta de control generativo auto-demostrado frente al fine-tuning convencional con demostraciones expertas.
- Evaluación en RoboTwin: ejecución del script `run_test_tasks.py` con el checkpoint descargado para medir tasas de éxito en las tareas de apilado de bloques de la etapa 2.
- Investigación en post-entrenamiento de VLA: punto de partida para experimentar con distintas estrategias de fine-tuning sobre el mismo dataset de demostraciones expertas.
- Desarrollo de pipelines de simulación a realidad: al estar entrenado en RoboTwin, puede servir para estudiar transferencia de políticas simuladas a entornos reales, aunque no se documenta dicha transferencia.
- Comparación de tokenizaciones de acción: al usar tokens FAST, permite contrastar con variantes de π0.5 que emplean otras representaciones de acción.
- Docencia y divulgación: ejemplo accesible (Apache 2.0) de un VLA post-entrenado para ilustrar el flujo completo de descarga, configuración y evaluación en un benchmark de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24,9 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos sin cuantizar, más el overhead de activaciones y del backbone de visión.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del checkpoint, se requiere una GPU de datacenter (A100, H100) o varias GPU consumer de gama alta con suficiente VRAM.
- Compatibilidad con GPU consumer: no confirmada; probablemente no cabe en una única GPU consumer de 24 GB sin cuantización, dado el tamaño del repositorio.
- Opciones de despliegue: el flujo documentado usa el repositorio de código `self-supervised-continual-control` y el subdirectorio `third_party/robotwin`, con ejecución mediante `run_test_tasks.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_FAST_robotwin_post_training_ES | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| pi05_FAST_robotwin_mid_training | no disponible | no disponible | no disponible | no disponible | Hugging Face (checkpoint previo del mismo autor) |
| π0.5 (base, Physical Intelligence) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Información técnica muy limitada: la model card no documenta parámetros, contexto, composición del dataset ni metodología de entrenamiento.
- Sin resultados de benchmarks publicados: no es posible evaluar su rendimiento relativo frente a alternativas.
- Ámbito restringido: entrenado específicamente para tareas de apilado de bloques en RoboTwin; no es un modelo de propósito general.
- Sin evidencia de transferencia a robots reales: el entrenamiento y la evaluación documentados son en simulación.
- Checkpoint intermedio (paso 6000) sin estado del optimizador: no está pensado para reanudar entrenamiento, solo para inferencia o evaluación.
- Riesgo de sobreajuste al dataset de demostraciones expertas: al ser un fine-tuning sobre un conjunto concreto de tareas, la generalización a otras manipulaciones no está demostrada.
- Sesgos: no documentados.
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en entornos físicos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe verificar las licencias de los componentes base (π0.5, openpi) y del dataset utilizado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: prachigarg23/pi05_FAST_robotwin_post_training_ES](https://huggingface.co/prachigarg23/pi05_FAST_robotwin_post_training_ES)
- [Paper (arXiv 2608.19490)](https://arxiv.org/abs/2608.19490)
- [Project page](https://self-supervised-control.pages.dev/)
- [Código](https://github.com/prachigarg23/self-supervised-continual-control)
- [Código RoboTwin](https://github.com/prachigarg23/self-supervised-control-robotwin)
- [Dataset: robotwin_post_training_stack_blocks_expert](https://huggingface.co/datasets/prachigarg23/robotwin_post_training_stack_blocks_expert)
- [Checkpoint previo: pi05_FAST_robotwin_mid_training](https://huggingface.co/prachigarg23/pi05_FAST_robotwin_mid_training)
