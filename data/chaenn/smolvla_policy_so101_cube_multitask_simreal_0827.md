# Chaenn/smolvla_policy_so101_cube_multitask_simreal_0827

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico con capacidades competitivas a un coste computacional reducido, pudiendo desplegarse en hardware de consumo. Este checkpoint concreto, `Chaenn/smolvla_policy_so101_cube_multitask_simreal_0827`, es un fine-tuning de `lerobot/smolvla_base` realizado por el usuario Chaenn para la tarea de pick-and-place de un cubo sobre un robot SO-100, utilizando el dataset `Chaenn/so101_cube_place_new_simreal_0827` que combina datos de simulación y reales (simreal). El modelo se ha entrenado y publicado mediante la librería LeRobot, lo que facilita su reproducción y evaluación en entornos robóticos estándar.

Con aproximadamente 450 millones de parámetros totales, este modelo sigue la arquitectura SmolVLA, que integra un encoder de visión SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" que se ajusta durante el fine-tuning. La relevancia de este checkpoint radica en su enfoque en una tarea robótica concreta, demostrando cómo un modelo base ligero puede adaptarse a manipulaciones específicas con pocos datos y recursos, siendo un ejemplo práctico para la comunidad de robótica open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): SigLIP + SmolLM2 + action expert |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | no disponibles (modelo orientado a tareas robóticas, no a lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un encoder de visión SigLIP para procesar imágenes, un modelo de lenguaje SmolLM2 para interpretar instrucciones y un "action expert" que genera comandos de actuación. Según la documentación de LeRobot y el blog de ggando.com, el modelo base tiene alrededor de 500 millones de parámetros, pero durante el fine-tuning solo se actualizan aproximadamente 50 millones correspondientes al action expert y las proyecciones, mientras que el encoder de visión y el modelo de lenguaje permanecen congelados. Este checkpoint concreto se ha entrenado con LeRobot sobre el dataset `Chaenn/so101_cube_place_new_simreal_0827`, que incluye demostraciones de pick-and-place de un cubo en un robot SO-100, combinando datos de simulación y reales. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Control robótico de manipulación: predice acciones de articulación para tareas de pick-and-place, específicamente para recoger un cubo y colocarlo en un recipiente.
- Percepción visual: procesa imágenes de cámara para localizar el cubo y el objetivo, gracias al encoder SigLIP.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de LeRobot, permitiendo su uso con robots SO-100 y otros compatibles.
- Fine-tuning específico: adaptado a una tarea concreta, lo que mejora el rendimiento en ese escenario frente a un modelo base sin ajustar.
- No se han documentado capacidades de tool calling, agentes autónomos, razonamiento multi-paso ni soporte multilingüe en este checkpoint.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios de robótica: el modelo puede controlar un brazo SO-100 para recoger cubos de posiciones aleatorias y depositarlos en un recipiente, útil para experimentos de manipulación repetitiva.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia sim-to-real, ya que el dataset combina datos simulados y reales, permitiendo analizar la brecha de realidad.
- Desarrollo de políticas robóticas de bajo coste: al ser un modelo compacto que corre en hardware de consumo, es adecuado para grupos de investigación con recursos limitados que necesitan una política funcional sin grandes infraestructuras.
- Evaluación de SmolVLA en tareas específicas: este checkpoint puede utilizarse como referencia para comparar el rendimiento de SmolVLA frente a otras arquitecturas (p. ej., ACT) en la misma tarea, como se documenta en el blog de ggando.com.
- Prototipado rápido de nuevas tareas: gracias a la integración con LeRobot, se puede reutilizar el modelo como base para fine-tuning en tareas similares, reduciendo el tiempo de desarrollo.
- Demostraciones educativas: en cursos de robótica o aprendizaje automático, este modelo permite ilustrar el ciclo completo de entrenamiento y despliegue de un VLA con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de robótica (tasa de éxito, precisión de agarre, etc.) para este checkpoint concreto. El blog de ggando.com menciona una comparación cualitativa entre SmolVLA y ACT en la tarea de pick-and-place, pero no se proporcionan cifras numéricas en los resultados de búsqueda.

## Requisitos de hardware

- El tamaño del repositorio es de 0,9 GB, lo que sugiere pesos en FP16 o BF16 (450M parámetros × 2 bytes ≈ 0,9 GB). Con cuantización a 8 bits o 4 bits, el modelo podría caber en GPUs con 4-6 GB de VRAM, aunque no se han publicado requisitos oficiales.
- SmolVLA está diseñado para ejecutarse en hardware de consumo, por lo que GPUs como la RTX 3060 (12 GB), RTX 4070 o superiores son suficientes para inferencia. Para entrenamiento, se recomienda al menos 16 GB de VRAM, aunque no hay datos específicos para este checkpoint.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede ejecutar con las herramientas de inferencia de LeRobot (`lerobot-record`), y también es compatible con frameworks como vLLM o llama.cpp si se convierte a formatos como GGUF, aunque no se ha documentado explícitamente.
- No se dispone de datos de latencia o throughput para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaenn/smolvla_policy_so101_cube_multitask_simreal_0827 | 450M | Pick-and-place SO-100 | so101_cube_place_new_simreal_0827 | Apache 2.0 | HuggingFace |
| Chaenn/smolvla_policy_so101_cube_multitask_real_0820 | 450M (estimado) | Pick-and-place SO-100 | so101_cube_place_multitask_real_0820 | Apache 2.0 | HuggingFace |
| Chaenn/smolvla_policy_so101_cube_multitask_realsim_0824 | 450M (estimado) | Pick-and-place SO-100 | so101_cube_place_multitask_realsim_0824 | Apache 2.0 | HuggingFace |
| ACT (Action Chunking with Transformers) | ~10-100M | Varias tareas robóticas | Depende del dataset | MIT | GitHub |

Los tres checkpoints de Chaenn son variantes de SmolVLA fine-tuneadas para la misma tarea pero con diferentes combinaciones de datos (solo real, solo simulado, o sim+real). ACT es una arquitectura alternativa más ligera, pero no se dispone de comparativas cuantitativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo fine-tuneado para una tarea muy específica (pick-and-place de cubo en SO-100); no es un modelo generalista y su rendimiento fuera de ese escenario probablemente sea deficiente.
- No se han documentado sesgos específicos, pero al entrenarse con un dataset limitado (probablemente decenas de episodios), puede tener problemas de generalización a variaciones no vistas (cambios de iluminación, posiciones extremas, texturas diferentes).
- Riesgo de alucinación en la predicción de acciones si la entrada visual es ambigua o fuera de distribución; no hay mecanismos de verificación de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes base (SmolVLA) que también están bajo Apache 2.0, por lo que no hay restricciones conocidas.
- No se proporcionan garantías de robustez en entornos de producción real; se recomienda validar exhaustivamente antes de un despliegue crítico.
- El modelo no soporta lenguaje natural explícito en este checkpoint; las instrucciones están implícitas en la tarea, por lo que no es adecuado para comandos verbales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chaenn/smolvla_policy_so101_cube_multitask_simreal_0827
- Paper SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Blog de ggando.com sobre fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
