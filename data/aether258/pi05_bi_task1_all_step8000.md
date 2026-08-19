# Aether258/pi05_bi_task1_all_step8000

## Resumen

`pi05_bi_task1_all_step8000` es un checkpoint del modelo `pi05_bi` de openpi, una arquitectura de visión-lenguaje-acción (VLA) basada en el modelo π0.5 desarrollado por Physical Intelligence. Este checkpoint concreto, publicado por el usuario Aether258, corresponde al paso 8000 de entrenamiento y está especializado en una tarea de manipulación bimanual concreta: coger un tubo negro con la mano izquierda, transferirlo a la mano derecha y colocarlo en un soporte.

El modelo se entrenó sobre 950 episodios fusionados de tres datasets LeRobot v2.1, con un total de 620.950 frames. Utiliza seis flujos de cámara, incluyendo dos cámaras táctiles, y emplea LoRA para el ajuste fino del LLM PaliGemma y del experto de acción, mientras que la torre de visión SigLIP se afina completamente. Es relevante porque demuestra un flujo de entrenamiento completo para tareas robóticas de largo horizonte con el framework openpi, y el checkpoint se eligió en un punto donde la pérdida de validación en datos no vistos seguía descendiendo, sin signos de sobreajuste.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, y el repositorio pesa 9,6 GB en formato Orbax checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (flow matching) con LLM PaliGemma y torre de visión SigLIP |
| Parametros totales | no disponible (checkpoint de 9,6 GB en formato Orbax) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (action_horizon=50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax checkpoint (params/, train_state/, assets/) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 de openpi: un VLA basado en flow matching que combina una torre de visión SigLIP, un LLM PaliGemma y un experto de acción. El entrenamiento se realizó con LoRA de rango 16 sobre el LLM y rango 32 sobre el experto de acción, mientras que la torre de visión SigLIP se fine-tuneó completamente (413M de los 463M parámetros entrenables, el 89,8%). Esta decisión se tomó porque el filtro de congelación de openpi solo coincide con `.*llm.*`, dejando `PaliGemma/img/*` entrenable.

Los datos provienen de tres datasets LeRobot v2.1 fusionados (task1_01, task1_02 y task1_03), con un total de 950 episodios y 620.950 frames a 30 fps. Un detalle importante es que el dataset task1_01 usaba un prompt placeholder ("perform manipulation task") mientras que los otros dos llevaban la descripción completa; en la fusión se unificaron todos los prompts a la descripción completa para evitar que el 58% de los datos se entrenara con un prompt poco informativo. La partición fue 855 episodios para entrenamiento, 95 para val_seen y 95 para val_unseen, con estadísticas de normalización calculadas solo sobre el split de entrenamiento.

El entrenamiento usó batch size 128 con FSDP sobre 2×A100-80GB, schedule CosineDecaySchedule con peak_lr 2.5e-5, warmup de 1000 pasos y decay_steps de 30000. Se inicializó desde el checkpoint base `pi05_base/params` de Google Cloud Storage. Una época equivale a 4356 pasos, por lo que el paso 8000 representa aproximadamente 1,8 épocas.

## Capacidades

- Manipulación robótica bimanual: el modelo controla 20 dimensiones de estado y 20 de acción, con un horizonte de acción de 50 pasos.
- Percepción multimodal: procesa seis flujos de cámara simultáneos, incluyendo dos cámaras táctiles (izquierda y derecha, cada una con dos vistas).
- Ejecución de tareas de largo horizonte: la tarea objetivo implica una secuencia de tres fases (coger, transferir, colocar) que requiere coordinación bimanual.
- Seguimiento de instrucciones en lenguaje natural: el modelo recibe la descripción de la tarea como prompt textual.
- Control basado en flow matching: genera acciones mediante un proceso de denoising iterativo, lo que permite acciones más suaves y precisas que los métodos autoregresivos.
- Ajuste fino eficiente: el uso de LoRA permite adaptar el modelo a tareas específicas con un coste computacional reducido.

## Casos de uso

- Automatización de ensamblaje en fabricación: el modelo puede aprender secuencias de manipulación que requieren transferencia de objetos entre manos, como insertar componentes en posiciones de difícil acceso. Su horizonte de acción de 50 pasos permite planificar la secuencia completa de movimiento.
- Investigación en manipulación bimanual: sirve como punto de partida para estudiar estrategias de coordinación entre dos brazos robóticos, ya que el checkpoint está especializado en una tarea que exige cooperación entre ambas manos.
- Desarrollo de políticas robóticas con aprendizaje por imitación: el flujo de entrenamiento documentado (fusión de datasets, normalización, LoRA) es un ejemplo reproducible para entrenar políticas VLA sobre datos propios.
- Benchmarking de VLAs en tareas físicas: la tarea de transferencia de objetos es un caso de estudio útil para comparar el rendimiento de diferentes arquitecturas VLA en manipulación de largo horizonte.
- Robots de laboratorio con manipulación delicada: la inclusión de cámaras táctiles en el entrenamiento sugiere que el modelo puede aprovechar información de contacto para tareas que requieren precisión, como manejar tubos frágiles.
- Educación y prototipado en robótica: al estar publicado con licencia Apache 2.0 y basado en el framework openpi, permite a estudiantes e investigadores experimentar con VLAs sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

La validación se realizó con el objetivo de entrenamiento flow matching, evaluado con aumentación de imagen desactivada y sobre un conjunto fijo de batches con rng fijo. Los resultados son:

| Paso | val_seen | val_unseen |
|---|---|---|
| 2000 | 0.0575 | 0.0534 |
| 4000 | 0.0530 | 0.0501 |
| 6000 | 0.0497 | 0.0482 |
| 8000 | 0.0483 | 0.0470 |

Es importante señalar que la validación usó solo 20 batches de 128 frames (2560 frames), y los episodios promedian 653 frames, por lo que cada evaluación cubre aproximadamente los primeros 4 episodios de cada split (~5,4%). La tendencia absoluta de `val_unseen` es significativa (mismos episodios y rng en cada evaluación), pero la diferencia seen-vs-unseen se basa en solo 4 episodios por lado y no debe interpretarse como una brecha de generalización. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de robótica.

## Requisitos de hardware

- El entrenamiento se realizó con FSDP sobre 2×A100-80GB, lo que da una referencia del hardware mínimo para reproducir el entrenamiento.
- Para inferencia, el checkpoint de 9,6 GB en formato Orbax requiere una GPU con al menos 24 GB de VRAM si se carga en precisión completa (fp32), o 12-16 GB si se convierte a bf16 o fp16.
- No es un modelo adecuado para GPUs de consumo como RTX 3060 o RTX 4060 sin cuantización agresiva, y el formato Orbax no es directamente compatible con llama.cpp u Ollama.
- Para despliegue en robótica, se recomienda usar el framework openpi directamente, que soporta inferencia con JAX en GPUs NVIDIA.
- La latencia de inferencia no está documentada, pero los modelos VLA basados en flow matching suelen requerir varios pasos de denoising por acción, lo que implica latencias del orden de cientos de milisegundos por paso de control.
- Alternativas de despliegue: openpi (JAX), o conversión a otros formatos si se requiere integración con otros frameworks.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_bi (este checkpoint) | VLA bimanual, flow matching | no disponible | action_horizon 50 | Apache 2.0 | HuggingFace |
| π0 (base) | VLA, flow matching | no disponible | no disponible | no disponible | openpi repo |
| π0.5 (base) | VLA, flow matching | no disponible | no disponible | no disponible | openpi repo |
| π0-FAST | VLA autoregresivo con FAST tokenizer | no disponible | no disponible | no disponible | openpi repo |

La comparativa directa con otros checkpoints de π0.5 no está disponible en la información proporcionada. Este checkpoint se distingue por estar especializado en una tarea bimanual concreta y por el uso de LoRA, mientras que los modelos base de openpi son generalistas.

## Limitaciones y advertencias

- El modelo está entrenado para una única tarea específica (transferencia de tubo negro entre manos) y no se ha evaluado su capacidad de generalización a otras tareas u objetos.
- La validación se realizó sobre una fracción muy pequeña de los datos (~5,4% de cada split), por lo que las métricas de validación tienen una fiabilidad limitada.
- El checkpoint se guardó en el paso 8000 porque una ejecución anterior en un dataset diferente mostró degradación a partir de ese punto, pero no hay garantía de que este checkpoint sea óptimo para todos los escenarios.
- El formato Orbax checkpoint requiere el ecosistema JAX/openpi para cargarse; no es directamente compatible con PyTorch u otros frameworks.
- No hay información sobre sesgos o riesgos de alucinación, pero al ser un modelo de control robótico, los errores pueden traducirse en movimientos físicos inseguros. Se recomienda supervisión humana en entornos reales.
- Los prompts están en inglés y no se ha evaluado el rendimiento en otros idiomas.
- El autor advierte que el dataset task1_01 original usaba un prompt placeholder, y aunque se unificaron los prompts, puede haber inconsistencias residuales en los datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aether258/pi05_bi_task1_all_step8000
- Perfil del autor en HuggingFace: https://huggingface.co/Aether258
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Documentación de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Repositorio openpi-comet (BEHAVIOR Challenge 2025): https://github.com/mli0603/openpi-comet
