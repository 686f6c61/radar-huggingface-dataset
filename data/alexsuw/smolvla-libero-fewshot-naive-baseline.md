# alexsuw/smolvla-libero-fewshot-naive-baseline

## Resumen

El modelo `alexsuw/smolvla-libero-fewshot-naive-baseline` es una familia de treinta fine-tunes independientes del checkpoint `lerobot/smolvla_base` (un modelo de visión-lenguaje-acción, VLA) sobre el benchmark de robótica LIBERO, concretamente sobre la suite `libero_goal`. Cada celda parte de los mismos pesos iniciales (el checkpoint "seen-expert" congelado) y se entrena únicamente con un prefijo de demostraciones de una lista de episodios de entrenamiento, variando el número de demostraciones (N = 1, 2, 5, 10, 25) y la semilla de entrenamiento (42 y 123). El objetivo es evaluar el rendimiento few-shot en tres tareas held-out de LIBERO-Goal: abrir el cajón del medio, poner el bol en la cocina y poner la botella de vino encima del armario.

Este trabajo es relevante porque estudia de forma sistemática el comportamiento de un VLA moderno (SmolVLA) en un escenario de aprendizaje con muy pocas demostraciones, un problema central en robótica de imitación. Los resultados muestran que con solo una demostración se alcanza una tasa de éxito del 90,8% en las tareas objetivo, frente al 1,7% en zero-shot, lo que demuestra la capacidad de adaptación rápida del modelo. El repositorio incluye los pesos, estadísticas de normalización, configuraciones y checksums para cada celda, lo que facilita la reproducibilidad.

El modelo está desarrollado por alexsuw y se distribuye bajo licencia "other" (los pesos derivan de `lerobot/smolvla_base` y del dataset `nvidia/LIBERO_LeRobot_v3`, por lo que se deben seguir los términos de esos componentes). El tamaño del repositorio es de 27,2 GB, y los pesos se guardan en formato `weights.pt` (PyTorch). No se especifican parámetros totales ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (no se especifican detalles de la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se ofrecen pesos en `weights.pt`, sin cuantización) |
| Idiomas soportados | no disponible (instrucciones en inglés, pero no se documenta soporte multilingüe) |
| Licencia | other (derivados de `lerobot/smolvla_base` y `nvidia/LIBERO_LeRobot_v3`; el código del proyecto es Apache-2.0) |
| Formato de pesos | `weights.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un VLA que combina visión, lenguaje y acciones para control robótico. SmolVLA está diseñado para ser eficiente y asequible, superando a otros VLA como Octo y OpenVLA en benchmarks de simulación (LIBERO y Meta-World) según el paper original (arXiv:2506.01844). El entrenamiento de este repositorio consiste en 30 fine-tunes independientes: cada celda parte del mismo checkpoint "seen-expert" (entrenado con 100k pasos en tareas de LIBERO-Goal) y se ajusta con un subconjunto de demostraciones de una tarea objetivo concreta. No se continúa el entrenamiento entre N distintos (N=10 no parte de N=5). Se usan dos semillas (42 y 123) y se aplica una normalización específica por celda (archivo `normalization_stats.json`). El entrenamiento se realizó con la librería LeRobot, y no se subió el optimizador (`optimizer.pt` no está disponible).

## Capacidades

- Control robótico por imitación: el modelo genera acciones de control (posición, orientación, etc.) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Aprendizaje few-shot: con solo 1-25 demostraciones de una tarea nueva, el modelo se adapta y logra altas tasas de éxito (hasta 96,7% con N=10).
- Seguimiento de instrucciones en inglés: las tareas de LIBERO-Goal se describen con frases como "open the middle drawer of the cabinet".
- Evaluación reproducible: incluye checksums, configuraciones y estadísticas de normalización para cada celda.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto general.

## Casos de uso

- Investigación en aprendizaje few-shot para robótica: el repositorio permite estudiar cómo varía el rendimiento con el número de demostraciones y la semilla, útil para diseñar algoritmos de adaptación rápida.
- Evaluación de políticas de imitación en simulación: se puede usar como baseline para comparar métodos de fine-tuning o meta-learning en LIBERO.
- Desarrollo de sistemas de manipulación robótica con pocos datos: si se dispone de un robot real, el modelo puede adaptarse a una tarea nueva con unas pocas demostraciones humanas, reduciendo el coste de recopilación de datos.
- Benchmarking de VLA en entornos simulados: los resultados de éxito (tabla de la model card) sirven como referencia para otros modelos de la misma categoría.
- Estudio de olvido catastrófico: al evaluar con las estadísticas de normalización de la suite `libero_90`, se puede analizar la retención de tareas vistas tras el fine-tuning.
- Reproducibilidad de experimentos: al incluir checksums y configuraciones, es posible replicar exactamente los entrenamientos y verificar la integridad de los pesos.

## Benchmarks y rendimiento

La model card reporta la tasa de éxito en las tres tareas objetivo (held-out) de LIBERO-Goal, evaluada con 20 semillas de evaluación por celda y agrupada sobre 3 tareas × 2 semillas de entrenamiento. N=0 corresponde a zero-shot desde el checkpoint seen-expert (no incluido en este repositorio).

| N (demostraciones) | Tasa de éxito (éxitos / total) |
|---|---|
| 0 | 1/60 (0,017) |
| 1 | 109/120 (0,908) |
| 2 | 100/120 (0,833) |
| 5 | 107/120 (0,892) |
| 10 | 116/120 (0,967) |
| 25 | 114/120 (0,950) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) porque el modelo no está orientado a tareas de lenguaje general.

## Requisitos de hardware

- El tamaño del repositorio es de 27,2 GB, lo que sugiere que los pesos completos requieren al menos 27 GB de almacenamiento y una GPU con VRAM suficiente para cargarlos (probablemente 32 GB o más, dependiendo de la precisión).
- No se especifican requisitos mínimos de VRAM ni GPUs recomendadas en la información disponible.
- Al ser un modelo de robótica, la inferencia se realiza típicamente en entornos de simulación (por ejemplo, MuJoCo) o en robots reales, no con frameworks de LLM como vLLM u Ollama.
- Se puede desplegar con la librería LeRobot, que es la que se usó para el entrenamiento y la evaluación.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa directa en la model card ni en los resultados de búsqueda. El paper de SmolVLA (arXiv:2506.01844) indica que SmolVLA supera a Octo y OpenVLA en LIBERO y Meta-World, pero no se proporcionan los números concretos en la información disponible. Por tanto, no se puede elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación, no un producto listo para producción. No se ha validado en robots reales.
- Los resultados de éxito se obtuvieron en simulación (LIBERO) y con un protocolo de evaluación específico; la generalización a entornos reales no está garantizada.
- La normalización es crítica: para evaluar correctamente las tareas objetivo hay que usar el `normalization_stats.json` de cada celda. Usar las estadísticas de otra suite (por ejemplo, `libero_90`) produce una "deployment mismatch" y no refleja olvido catastrófico real.
- Los entrenamientos con N=1 y N=2 usan el mismo `warmup_steps=1000` que los demás, por lo que esas ejecuciones cortas permanecen dentro del warmup, lo que se reconoce como una limitación del estudio.
- La licencia es "other": los pesos derivan de `lerobot/smolvla_base` y del dataset `nvidia/LIBERO_LeRobot_v3`, por lo que se deben respetar los términos de esos componentes. El código del proyecto es Apache-2.0.
- No se documentan sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de control robótico, un comportamiento inesperado podría causar daños físicos si se usa en un robot real sin supervisión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alexsuw/smolvla-libero-fewshot-naive-baseline
- Código del proyecto: https://github.com/alexsuw/smolvla-libero-fewshot
- Checkpoint origen (seen-expert): https://huggingface.co/alexsuw/smolvla-libero-fewshot-seen-expert-100k
- Colección de modelos: https://huggingface.co/collections/alexsuw/smolvla-libero-few-shot-6a8b009357482d2b4b9d3c2f
- Dataset LIBERO_LeRobot_v3: https://huggingface.co/datasets/nvidia/LIBERO_LeRobot_v3
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Paper LIBERO: https://arxiv.org/abs/2306.03310
- Modelo base: https://huggingface.co/lerobot/smolvla_base
