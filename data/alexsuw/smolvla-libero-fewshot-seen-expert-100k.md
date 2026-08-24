# alexsuw/smolvla-libero-fewshot-seen-expert-100k

## Resumen

Este repositorio contiene un checkpoint congelado del modelo SmolVLA, fine-tuneado mediante aprendizaje por imitación durante 100 000 pasos sobre la suite `libero_90` del benchmark LIBERO. El autor, alexsuw, lo publica como punto de partida inmutable para experimentos de adaptación few-shot en tareas de manipulación robótica condicionadas por lenguaje. El modelo no ha sido entrenado en las tres tareas held-out de `libero_goal`, lo que lo convierte en un origen limpio para medir cuántas demostraciones expertas se necesitan para resolver nuevas tareas.

SmolVLA es una familia de modelos visión-lenguaje-acción (VLA) descrita en el artículo arXiv:2506.01844, diseñada para ser asequible y eficiente en comparación con otros VLA de gran tamaño. Este checkpoint concreto deriva de `lerobot/smolvla_base` y se distribuye bajo la licencia `other`, con el código del proyecto bajo Apache-2.0. El tamaño del repositorio es de 0,9 GB, lo que sugiere un modelo ligero, aunque no se especifican los parámetros totales en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), basada en el paper arXiv:2506.01844 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (derivada de `lerobot/smolvla_base` y del dataset `nvidia/LIBERO_LeRobot_v3`) |
| Formato de pesos | PyTorch checkpoint (`weights.pt`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base` sobre la suite `libero_90` del dataset `nvidia/LIBERO_LeRobot_v3`. Según la model card, el vision encoder y el backbone VLM permanecen congelados durante el entrenamiento; solo se actualizan el Action Expert y las proyecciones de estado y acción. El entrenamiento se realizó durante 100 000 pasos de imitación, sin indicios de uso de RLHF o DPO. La normalización debe aplicarse con las estadísticas MEAN_STD de la suite `libero_90` completa; adjuntar estadísticas de `libero_goal` rompe la compatibilidad y anula el rendimiento en las sondas seen.

El checkpoint se seleccionó exclusivamente a partir de sondas de `libero_90` (tres sondas congeladas, seeds 1000-1009, horizonte 300), logrando una tasa de éxito de 24/30 (0,80). No se utilizó el rendimiento en tareas objetivo para elegir este punto de control, lo que garantiza que no hay fuga de información hacia las tareas held-out.

## Capacidades

- Manipulación robótica condicionada por lenguaje: el modelo interpreta instrucciones en lenguaje natural y genera acciones de control para un brazo robótico en entornos simulados de LIBERO.
- Aprendizaje por imitación: entrenado mediante clonación de comportamiento sobre demostraciones expertas.
- Adaptación de dominio: sirve como base congelada para experimentos de few-shot en tareas nuevas dentro del mismo dominio.
- Sin soporte de tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.
- Capacidades multilingües: no disponibles (el modelo se centra en instrucciones en inglés del benchmark LIBERO, aunque no se especifica).

## Casos de uso

- Investigación en aprendizaje few-shot para robótica: el checkpoint permite estudiar cuántas demostraciones expertas se necesitan para adaptar un VLA a una tarea de manipulación no vista, comparando con la familia de checkpoints naive baseline publicada por el mismo autor.
- Evaluación de políticas VLA en entornos simulados: se puede desplegar en el simulador LIBERO para medir tasas de éxito en tareas de `libero_90` y comparar con otros modelos.
- Punto de partida para fine-tuning en tareas específicas: al estar congelado en el dominio seen, sirve como inicialización para adaptar a nuevas tareas con pocas demostraciones, evitando el olvido catastrófico.
- Benchmarking de eficiencia de adaptación: permite comparar estrategias de fine-tuning (naive vs. few-shot) sobre la misma base, como hace el proyecto del autor.
- Reproducibilidad en robótica: al incluir el SHA-256 de los pesos y el run_id, se puede verificar la integridad del checkpoint y reproducir experimentos.
- Docencia y formación en VLA: útil para demostrar el flujo de entrenamiento y evaluación de modelos visión-lenguaje-acción en un entorno controlado.

## Benchmarks y rendimiento

La model card reporta un único dato de rendimiento:

| Metrica | Valor |
|---|---|
| Seen-probe success (3 sondas de `libero_90`, seeds 1000-1009, horizonte 300) | 24/30 = 0,80 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor indica explícitamente que el checkpoint se seleccionó solo con sondas seen, sin usar el rendimiento en tareas objetivo.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,9 GB) sugiere que el modelo es ligero, pero no se especifican requisitos de memoria.
- GPU recomendadas: no disponible. Dado que SmolVLA se presenta como "asequible y eficiente" en el paper, es probable que funcione en GPUs de consumo como RTX 3090 o superiores, pero no hay datos confirmados.
- Compatibilidad con consumer GPU: probable, pero no confirmado.
- Opciones de despliegue: el modelo se distribuye como checkpoint de LeRobot, por lo que se puede cargar con la librería `lerobot`. No se mencionan formatos GGUF, vLLM u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. Existe otro modelo few-shot para LIBERO, `THU-SIGS-EILAB/Pi05_few_shot_libero`, basado en PI0.5, pero no se conocen sus métricas ni especificaciones en los resultados de búsqueda. Por tanto, la comparativa se limita a indicar que ambos abordan el problema de few-shot en LIBERO, pero con arquitecturas y metodologías distintas.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alexsuw/smolvla-libero-fewshot-seen-expert-100k | SmolVLA | no disponible | no disponible | other | HuggingFace |
| THU-SIGS-EILAB/Pi05_few_shot_libero | PI0.5 | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- No entrenado en tareas held-out de `libero_goal`: el modelo no ha visto las tres tareas de objetivo, por lo que su rendimiento en ellas será bajo o nulo sin adaptación adicional.
- Normalización específica de dominio: es obligatorio usar las estadísticas MEAN_STD de `libero_90`; usar estadísticas de `libero_goal` invalida el modelo.
- Licencia restrictiva: la licencia `other` implica que hay que revisar los términos del modelo base (`lerobot/smolvla_base`) y del dataset (`nvidia/LIBERO_LeRobot_v3`) antes de uso comercial.
- Riesgo de sobreajuste al dominio seen: al ser un checkpoint congelado tras 100k pasos en `libero_90`, puede generalizar mal a distribuciones diferentes.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de control robótico, no se aplican los riesgos típicos de generación de texto, pero la falta de datos impide evaluar posibles fallos de percepción o acción.
- Tamaño del repositorio pequeño (0,9 GB) pero sin especificación de cuantización: puede requerir conversión para despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexsuw/smolvla-libero-fewshot-seen-expert-100k
- Código del proyecto: https://github.com/alexsuw/smolvla-libero-fewshot
- Familia few-shot naive baseline: https://huggingface.co/alexsuw/smolvla-libero-fewshot-naive-baseline
- Colección de checkpoints: https://huggingface.co/collections/alexsuw/smolvla-libero-few-shot-6a8b009357482d2b4b9d3c2f
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Paper LIBERO: https://arxiv.org/abs/2306.03310
- Dataset LIBERO_LeRobot_v3: https://huggingface.co/datasets/nvidia/LIBERO_LeRobot_v3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot
