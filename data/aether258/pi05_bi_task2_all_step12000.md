# Aether258/pi05_bi_task2_all_step12000

## Resumen

El modelo `Aether258/pi05_bi_task2_all_step12000` es un checkpoint intermedio de un modelo de visión‑lenguaje‑acción (VLA) basado en la arquitectura `pi05_bi` de openpi, desarrollado por el usuario Aether258 (Aether_Zhang). Está diseñado para controlar un robot bimanual en una tarea de lavado de platos con esponja, integrando cuatro sensores táctiles y dos cámaras. El entrenamiento se realizó con el framework LeRobot v2.1, sobre un conjunto de 948 episodios (916,302 frames) provenientes de tres fuentes públicas de datos de manipulación. El checkpoint corresponde al paso 12000 de un entrenamiento planificado de 20000 pasos, con una pérdida de validación *held‑out* de 0.0534, la más baja de la serie hasta ese momento.

El modelo está pensado para ser usado en investigación en robótica, no como un sistema de texto o chat. Su relevancia radica en la combinación de control bimanual, entrada táctil y aprendizaje de una tarea concreta de limpieza doméstica, lo que lo convierte en un caso de estudio para el desarrollo de políticas de manipulación en entornos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `pi05_bi` (openpi) – VLA con visión y acción, decodificación por *flow‑matching* |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache‑2.0 |
| Formato de pesos | no disponible (repo de 9.6 GB, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se entrena con la configuración `pi05_bi` de openpi, que corresponde a un VLA multimodal que combina una torre de visión, un modelo de lenguaje (LLM) y un *action expert* para generar acciones de control. Según la model card, se aplica LoRA con *rank* 16 en el LLM y *rank* 32 en el *action expert*, mientras que la torre de visión se entrena completamente (el filtro de congelación solo excluye los parámetros que coinciden con `.*llm.*`). El entrenamiento se realizó en 2 GPU A100‑80GB con FSDP, un *batch size* de 128, tasa de aprendizaje pico de 2e‑4 con 1000 pasos de *warmup* y *cosine decay* sobre 100000 pasos.

Los datos provienen de tres repositorios (`KaiyueChen/task2_01`, `task2_02` y `task2_03`), fusionados en un total de 948 episodios con 916,302 frames. Cada episodio tiene una duración media de ~966 frames a 30 fps. Las imágenes se incrustan en los archivos parquet (no hay vídeos separados) y se usan seis flujos de entrada: dos cámaras (`camera0`, `camera1`) y cuatro sensores táctiles (`tactile_left_0/1`, `tactile_right_0/1`). La normalización de los estados se calcula con cuantiles q01/q99 únicamente sobre el split de entrenamiento. Se usa una instrucción única para todos los episodios: *"Use the left hand to pick up the dish, and then use the right hand to pick up the sponge to brush the dish. Finally, put all things back."* (se eliminó un espacio final y se forzó esta instrucción en todas las fuentes, ya que dos de ellas contenían un placeholder).

El entrenamiento se evalúa con una pérdida de *flow‑matching* en 20 batches por split, con los mismos batches y RNG en cada evaluación para que las curvas sean comparables. La validación se divide en `val_seen` (subset de train) y `val_unseen` (held‑out, 10% por fuente). La pérdida de `val_unseen` desciende hasta el paso 8000 (0.0535), sube ligeramente en el paso 10000 (0.0552) y vuelve a 0.0534 en el paso 12000. El gap entre `val_seen` y `val_unseen` crece lentamente, pero sigue siendo pequeño en comparación con otros runs (p.ej. el run `two_tubes_0102` tuvo un gap de 0.0135 en su paso 12000).

## Capacidades

- **Manipulación bimanual**: el modelo es capaz de controlar dos brazos robóticos simultáneamente para tareas que requieren coordinación (recoger un plato con la mano izquierda y usar una esponja con la derecha).
- **Integración de sensores táctiles**: recibe cuatro flujos táctiles (dos por mano) y los combina con las cámaras para tomar decisiones de control.
- **Seguimiento de instrucciones**: la política se condiciona a una instrucción de texto en inglés, que se alimenta directamente como prompt.
- **Generación de acciones de control**: produce comandos de acción de robot (posición, orientación, etc.) mediante decodificación de *flow‑matching*.
- **Procesamiento multimodal**: combina visión (6 canales de imagen) y texto para generar acciones de control.
- **Entrenamiento con datos de demostración**: usa episodios de manipulación real (LeRobot) para aprender la tarea, sin necesidad de un simulador.

## Casos de uso

- **Lavado de platos en entorno doméstico**: el modelo puede controlar un robot bimanual para coger un plato, coger una esponja, fregar el plato y volver a colocar todo en su sitio. Es adecuado porque ha sido entrenado específicamente para esta tarea con datos de demostración.
- **Manipulación de objetos con feedback táctil**: gracias a los sensores táctiles, el modelo puede ajustar la fuerza de agarre o la posición en función del contacto, útil para tareas de ensamblaje o manipulación de objetos frágiles.
- **Investigación en robótica VLA**: sirve como punto de partida para estudios sobre *fine‑tuning* de VLA en tareas de manipulación bimanual, análisis de curvas de aprendizaje y comparación de estrategias de regularización.
- **Benchmark de aprendizaje por demostración**: se puede utilizar como referencia para comparar métodos de entrenamiento (p.ej., LoRA vs. full‑fine‑tuning) en un escenario con datos limitados.
- **Despliegue en plataformas de simulación**: aunque no se menciona, el modelo podría integrarse en entornos de simulación (como MuJoCo o Isaac) para evaluar políticas de control antes de llevarlo a hardware real.
- **Integración con frameworks de robótica**: al estar basado en LeRobot y openpi, es compatible con el ecosistema de herramientas de entrenamiento y evaluación de políticas robóticas de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, ya que se trata de un modelo de control robótico. La única métrica reportada es la pérdida de *flow‑matching* durante la validación. Los datos de la model card se resumen a continuación:

| Paso | Pérdida train | Pérdida val_seen | Pérdida val_unseen | Gap (val_unseen – val_seen) |
|---:|---:|---:|---:|---:|
| 0 | 0.6399 | 0.6621 | 0.6508 | −0.0113 |
| 2000 | 0.0535 | 0.0671 | 0.0662 | −0.0009 |
| 4000 | 0.0470 | 0.0574 | 0.0573 | −0.0001 |
| 6000 | 0.0448 | 0.0565 | 0.0566 | +0.0001 |
| 8000 | 0.0430 | 0.0513 | 0.0535 | +0.0022 |
| 10000 | 0.0420 | 0.0514 | 0.0552 | +0.0038 |
| **12000** | 0.0421 | 0.0493 | **0.0534** | +0.0041 |

La pérdida de validación *unseen* alcanza su mínimo en el paso 8000 y se mantiene prácticamente estable hasta el paso 12000, lo que indica que el modelo ha dejado de mejorar significativamente en ese punto.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron 2 GPU A100‑80GB con FSDP (datos de la model card). No se especifica el tiempo de entrenamiento.
- **Inferencia**: no se han publicado requisitos específicos. El tamaño del repo es de 9.6 GB, lo que sugiere que el modelo completo (sin cuantización) requiere al menos esa memoria en VRAM para cargar los pesos. Para inferencia en tiempo real en un robot, se recomienda una GPU con al menos 24 GB de VRAM (p. ej., RTX 4090, A5000) si se aplica cuantización, o una A100/H100 para inferencia sin cuantización.
- **Opciones de despliegue**: al ser un modelo de LeRobot, se puede ejecutar con las herramientas de LeRobot (Python) o integrarse en pipelines de openpi. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de control robótico, no de texto.
- **Latencia/throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (VLA bimanual con entrada táctil). La model card menciona un run hermano llamado `two_tubes_0102`, pero no se detallan sus características. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Sobreajuste leve**: la pérdida de validación *held‑out* se estanca después del paso 8000, mientras que la pérdida de entrenamiento continúa bajando, lo que indica una ligera tendencia a sobreajustar.
- **Validación con pocos episodios**: cada evaluación de validación cubre solo ~2‑3 episodios por split (unas 2560 frames), por lo que las fluctuaciones tempranas del gap pueden deberse al azar.
- **Instrucción única**: el modelo fue entrenado con una sola instrucción en inglés. No está preparado para manejar variaciones de lenguaje ni instrucciones en otros idiomas.
- **Dependencia de la normalización**: las estadísticas de normalización se calcularon solo sobre el split de entrenamiento; si se usa el modelo con datos fuera de esa distribución, el rendimiento puede degradarse.
- **Limitación de la tarea**: el modelo está especializado en la tarea de lavado de platos con esponja; no es un modelo general de manipulación.
- **Sin datos sobre seguridad**: no se han evaluado riesgos de seguridad o robustez en entornos no controlados.
- **Licencia**: Apache‑2.0 permite uso comercial, pero hay que revisar los términos de los datasets de origen (KaiyueChen) para asegurar que no hay restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Aether258/pi05_bi_task2_all_step12000)
- [Repositorio del usuario Aether258](https://huggingface.co/Aether258)
- [GitHub openpi‑comet (BEHAVIOR Challenge)](https://github.com/mli0603/openpi-comet)
- [GitHub EBiM Task 2 Pi0.5 submission](https://github.com/Jjshi2000/ebim-task2-pi05-submission/tree/main/)
