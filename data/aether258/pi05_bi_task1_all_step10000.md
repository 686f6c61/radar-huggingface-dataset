# Aether258/pi05_bi_task1_all_step10000

## Resumen

El modelo `Aether258/pi05_bi_task1_all_step10000` es un checkpoint intermedio de un modelo de visión-lenguaje-acción (VLA) basado en Pi0.5, desarrollado por Aether258 (Aether_Zhang) y publicado en Hugging Face bajo licencia Apache 2.0. Este snapshot corresponde al paso 10.000 de entrenamiento (aproximadamente 2,3 épocas) sobre una tarea concreta de manipulación bimanual: recoger un tubo negro con la mano izquierda, transferirlo a la mano derecha y colocarlo en un soporte. El modelo se construye sobre la arquitectura Pi0.5 de Physical Intelligence, que combina un LLM PaliGemma con un codificador visual SigLIP, y se entrena con el objetivo de flow-matching para generar acciones de control continuas.

La relevancia de este modelo radica en que demuestra un enfoque de fine-tuning eficiente mediante LoRA sobre el LLM y el experto de acciones, mientras que la torre de visión SigLIP se ajusta completamente, lo que supone una innovación frente a los métodos que congelan o solo adaptan parcialmente el codificador visual. El checkpoint se ha validado con una pérdida de flow-matching en splits `val_seen` y `val_unseen`, mostrando una mejora consistente hasta el paso 10.000 sin signos de sobreajuste. Sin embargo, es importante señalar que la validación cubre solo una pequeña fracción de los datos y que el modelo no ha sido evaluado en despliegue físico real.

El repositorio contiene un checkpoint en formato Orbax (JAX) de 9,6 GB, con parámetros, estado de entrenamiento y metadatos. No se proporcionan especificaciones detalladas del modelo base (número total de parámetros, longitud de contexto, etc.), por lo que esta ficha se basa exclusivamente en la información disponible en la model card y en referencias públicas sobre Pi0.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en Pi0.5: LLM PaliGemma + codificador visual SigLIP + experto de acciones con flow-matching |
| Parametros totales | no disponible (el checkpoint pesa 9,6 GB en formato Orbax, pero no se indica el número de parámetros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se menciona ninguna cuantización) |
| Idiomas soportados | no disponible (la tarea está descrita en inglés, pero no se especifican idiomas del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax (JAX/Flax) — incluye `params/`, `train_state/`, `assets/` y `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pi0.5 de Physical Intelligence, un VLA que co-entrena con demostraciones robóticas y datos multimodales a gran escala para permitir generalización a tareas de manipulación de largo horizonte. En este checkpoint concreto, el LLM PaliGemma se adapta mediante LoRA con rango 16, y el experto de acciones (action expert) con LoRA de rango 32. La torre de visión SigLIP se ajusta completamente (fine-tuning total) en lugar de usar LoRA, ya que la función `get_freeze_filter()` de openpi solo congela los pesos que coinciden con `.*llm.*`, dejando `PaliGemma/img/*` entrenable. Esto supone que 413 de los 463 millones de parámetros entrenables (89,8%) corresponden a la torre de visión.

El entrenamiento se realizó con un batch size de 128, usando FSDP (Fully Sharded Data Parallel) sobre 2 GPU A100 de 80 GB. Se empleó un programador de tasa de aprendizaje coseno con pico de 2,5e-5, warmup de 1000 pasos y decay en 30000 pasos. El modelo se inicializó desde el checkpoint base `pi05_base` de openpi. Los datos provienen de tres datasets LeRobot v2.1 (30 fps, imágenes embebidas en parquet) que se fusionaron en un único conjunto de 950 episodios y 620.950 frames. La división se hizo por fuente con un 10% de retención (seed 42), resultando en 855 episodios de entrenamiento, 95 de `val_seen` y 95 de `val_unseen`. Las estadísticas de normalización se calcularon solo sobre el split de entrenamiento.

Una innovación destacable es que todas las tareas se unificaron con la descripción completa de la tarea (la que llevaban los datasets 02/03), ya que el dataset 01 tenía un placeholder no informativo. Esto evita que el 58% de los datos se entrenara con un prompt poco útil.

## Capacidades

- Generación de acciones de control continuo para manipulación robótica bimanual: el modelo recibe 6 flujos de cámara (`camera0`, `camera1`, `tactile_left_{0,1}`, `tactile_right_{0,1}`) y produce un horizonte de 50 acciones con 20 dimensiones cada una (`action_dim=20`).
- Ejecución de una tarea específica de pick-and-place: recoger un tubo negro con la mano izquierda, transferirlo a la mano derecha y colocarlo en un rack.
- Entrada multimodal: combina imágenes de cámaras RGB y táctiles, junto con el estado del robot (`state_dim=20`).
- Fine-tuning eficiente mediante LoRA en el LLM y el experto de acciones, lo que permite adaptar el modelo a nuevas tareas con recursos limitados.
- No tiene capacidades de generación de texto, tool calling, razonamiento simbólico ni procesamiento de lenguaje natural más allá de la comprensión del prompt de tarea.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: este checkpoint sirve como punto de referencia intermedio para estudiar la dinámica de entrenamiento de VLA, especialmente el efecto de ajustar completamente la torre de visión frente a LoRA.
- Desarrollo de pipelines de manipulación bimanual: el modelo está entrenado para una tarea concreta que requiere coordinación entre dos brazos, lo que lo hace útil para probar algoritmos de control y planificación en entornos simulados o reales.
- Fine-tuning posterior para tareas similares: dado que se parte de un checkpoint base preentrenado, se puede continuar el entrenamiento con datos adicionales de tareas de pick-and-place con objetos similares.
- Evaluación de estrategias de validación en VLA: la metodología de validación con splits `val_seen`/`val_unseen` y la métrica de loss flow-matching puede servir como plantilla para otros proyectos.
- Benchmarking de eficiencia de entrenamiento: el uso de FSDP en 2×A100 y LoRA permite comparar costes computacionales frente a otros enfoques de fine-tuning completo.
- Estudio de la influencia de la descripción de la tarea en el aprendizaje: la unificación de prompts en el dataset es un caso práctico de cómo el texto del prompt afecta al rendimiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) para este modelo, ya que es un VLA orientado a robótica. La única métrica disponible es la pérdida de flow-matching en validación, reportada en la model card:

| step | val_seen | val_unseen |
|---|---|---|
| 2000 | 0.0575 | 0.0534 |
| 4000 | 0.0530 | 0.0501 |
| 6000 | 0.0497 | 0.0482 |
| 8000 | 0.0483 | 0.0470 |
| **10000** | **0.0463** | **0.0465** |

El autor indica que `val_unseen` alcanzó un sexto mínimo consecutivo, sin signos de sobreajuste, aunque la mejora por paso se desacelera (3,8% → 2,4% → 1,1%). Es importante señalar que la validación se realizó con solo 20 batches de 128 frames (2560 frames), lo que equivale aproximadamente a los primeros 4 episodios de cada split (~5,4% del total). Por tanto, la diferencia entre `val_seen` y `val_unseen` no debe interpretarse como una brecha de generalización robusta.

## Requisitos de hardware

- Entrenamiento: se utilizaron 2 GPU A100 de 80 GB con FSDP. No se especifican requisitos mínimos para inferencia.
- Inferencia: no se proporcionan datos sobre VRAM necesaria, latencia o throughput. Dado que el checkpoint pesa 9,6 GB en formato Orbax, es plausible que quepa en una GPU consumer de 24 GB (por ejemplo, RTX 4090) si se convierte a un formato más ligero, pero esto no está confirmado.
- Opciones de despliegue: al ser un checkpoint de JAX/Orbax, requiere el ecosistema openpi o JAX para cargarlo. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje, no a VLA robóticos.
- Para uso práctico en robótica, se necesitaría un entorno con controladores de robot y cámaras, además de una GPU para la inferencia del modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros VLA en la información proporcionada. Sin embargo, se puede contextualizar:

- **Pi0.5 base** (Physical Intelligence): modelo fundacional de 3B parámetros aproximadamente, entrenado con datos web y robóticos. Este checkpoint es un fine-tuning de Pi0.5 para una tarea específica, por lo que no es comparable directamente en rendimiento general.
- **OpenVLA**: VLA de 7B parámetros basado en Prismatic, con licencia MIT. No se han reportado comparaciones numéricas con Pi0.5 en esta ficha.
- **RT-2** (Google DeepMind): VLA de 55B parámetros, pero no se dispone de datos de comparación.

Dado que no hay benchmarks comunes, se recomienda consultar la literatura de Pi0.5 para comparaciones cualitativas. La licencia Apache 2.0 de este checkpoint es más permisiva que la de algunos competidores.

## Limitaciones y advertencias

- El modelo es un checkpoint intermedio (step 10000 de 30000 posibles) y no representa el entrenamiento completo. El propio autor indica que la curva de pérdida se acerca a una meseta, pero no se garantiza que el rendimiento mejore significativamente con más pasos.
- La validación se basa en una fracción muy pequeña de los datos (4 episodios por split), por lo que las cifras de pérdida tienen alta varianza y no deben usarse para conclusiones definitivas sobre generalización.
- No se ha evaluado el modelo en un robot físico real; solo se reporta la pérdida de entrenamiento. El rendimiento en el mundo real puede diferir sustancialmente.
- La tarea está muy específica (recoger un tubo negro y colocarlo en un rack) y el modelo no está diseñado para generalizar a otras tareas sin fine-tuning adicional.
- Los datos de entrenamiento provienen de tres datasets de un mismo entorno; puede haber sesgos en la iluminación, posición de la cámara o textura de los objetos que afecten a la transferencia a otros entornos.
- No se especifican los idiomas del modelo; aunque el prompt de tarea está en inglés, no se garantiza soporte multilingüe.
- El formato Orbax no es directamente compatible con los frameworks de inferencia más comunes para modelos de lenguaje; se requiere el stack de JAX/openpi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aether258/pi05_bi_task1_all_step10000
- Perfil del autor en Hugging Face: https://huggingface.co/Aether258
- Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Repositorio openpi-comet (Team Comet, BEHAVIOR Challenge): https://github.com/mli0603/openpi-comet
- Pi0.5 base en ModelScope: https://www.modelscope.cn/models/lerobot/pi05_base/summary
