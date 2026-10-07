# arkojit1/pi05_pick_block_eef_abs_freezevis_bs64_lr2.5e-5_20k

## Resumen
El modelo `arkojit1/pi05_pick_block_eef_abs_freezevis_bs64_lr2.5e-5_20k` es un ajuste fino de la política robótica π₀.₅ (`lerobot/pi05_base`) desarrollado por el usuario arkojit1. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a controlar un brazo robótico Franka en una tarea concreta de recogida de bloques (*pick block*). El problema que aborda es la generación de comandos motores de efector final a partir de observaciones visuales y de estado, siguiendo el paradigma de aprendizaje por imitación con *flow matching*. 

La relevancia de esta ficha es doble: por un lado, documenta un caso real de ajuste fino de π₀.₅ con LeRobot 0.6.1; por otro, sirve como advertencia metodológica, ya que el propio autor indica que el checkpoint está fuertemente sobreajustado a los episodios de entrenamiento. El modelo tiene 4.143.404.816 parámetros totales (~4,14B) y un tamaño de repositorio de 9,4 GB. No se dispone de información sobre longitud de contexto, idiomas o licencia.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅: modelo de lenguaje Gemma-2B, experto de acción y codificador visual SigLIP |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura π₀.₅, que combina un modelo de lenguaje Gemma-2B, un experto de acción y un codificador de visión SigLIP. En este ajuste fino se entrenaron el modelo de lenguaje y el experto de acción, mientras que el codificador SigLIP permaneció congelado (`--freeze_vision_encoder --no-train_expert_only`). El número de parámetros entrenables fue de 3.730.962.464 (~3,73B). El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `Ameyapores/pick_block_eef_position_abs`, compuesto por 35 episodios de un Franka (9.181 fotogramas a 25 fps, una única tarea, dos cámaras de 224×224 denominadas `cam0` y `cam2`, con un tercer slot de imagen rellenado mediante `empty_cameras=1`, y estado de 4 dimensiones). Se usó un batch global de 64 (8 GPUs × 8), optimizador AdamW con LR máximo 2,5e-5 y decaimiento coseno hasta 2,5e-6 durante 20.000 pasos, con 666 pasos de calentamiento. El checkpoint corresponde al paso 20.000 (~157 épocas), con precisión bf16, *gradient checkpointing*, `torch.compile` en modo por defecto, aumento de imagen activado, `chunk_size` 50 y `n_action_steps` 50. La función de pérdida es de *flow matching*. El autor advierte que el modelo está fuertemente sobreajustado a los episodios de entrenamiento.

## Capacidades
- Generación de acciones robóticas de efector final en formato `[x, y, z, gripper]`, donde `x`, `y`, `z` son la posición absoluta a alcanzar en el siguiente fotograma (mismas unidades que `observation.state[:3]`) y `gripper` es un objetivo binario (0/1).
- Control de un brazo Franka en la tarea específica de recogida de bloques (*pick block*), con una única tarea entrenada.
- Procesamiento de dos cámaras de 224×224 (`cam0` y `cam2`) y un estado de 4 dimensiones.
- Normalización por cuantiles (q01–q99) tanto para el estado como para la acción.
- No se ha documentado soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento (*thinking mode*). Es un modelo puramente robótico.

## Casos de uso
- Investigación en aprendizaje por imitación para robótica: el modelo permite estudiar el comportamiento de π₀.₅ al ajustar solo el modelo de lenguaje y el experto de acción, manteniendo congelado el codificador visual, en un entorno controlado de laboratorio.
- Reproducción de la tarea *pick block* en un Franka real: se puede desplegar mediante `lerobot-eval` para recoger bloques dentro de la región de entrenamiento (x 0,528–0,559; y 0,056–0,068; z 0,145–0,311), siempre que el entorno coincida con las condiciones del dataset.
- Estudio de sobreajuste en políticas VLA: al ser un caso documentado de sobreajuste severo (pérdida de evaluación 0,2565 frente a 0,009 de entrenamiento), sirve como ejemplo para analizar estrategias de regularización, *early stopping* o aumento de datos.
- Comparación de espacios de acción absolutos frente a delta: el modelo emplea posiciones absolutas de efector final, por lo que puede usarse en experimentos que comparen ambos paradigmas, junto con la variante delta `arkojit1/pi05_pick_block_eef_delta`.
- Evaluación de normalización por cuantiles: permite reproducir y analizar el efecto de la normalización q01–q99 en políticas robóticas con distribuciones de estado estrechas.
- Generación de trayectorias de referencia para *fine-tuning* posterior: las predicciones del modelo, aunque sobreajustadas, pueden servir como punto de partida para un ajuste adicional con más datos o tareas.
- Docencia y demostraciones en robótica: ilustra el flujo completo de entrenamiento y evaluación con LeRobot 0.6.1, incluyendo configuración de *freeze* de visión y *chunking* de acciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de pérdida de *flow matching* sobre 4 episodios reservados (31–34), que no equivalen a una tasa de éxito de tarea:

| Metrica | Valor |
|---|---|
| Pérdida de evaluación (checkpoint final, paso 20.000) | 0,2565 |
| Pérdida de entrenamiento (paso 20.000) | 0,009 |
| Mejor pérdida de evaluación (paso 1.000, ~8 épocas) | 0,0671 (con pérdida de entrenamiento 0,054) |
| Medias trimestrales de evaluación | 0,106 / 0,167 / 0,224 / 0,257 |
| Pérdida final del run equivalente solo experto (Gemma congelado) | 0,0991 (mejor: 0,0587) |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada. Como estimación orientativa basada en el número de parámetros, los pesos en bf16 ocuparían aproximadamente 8,3 GB, y con activaciones y sobrecarga la inferencia podría requerir del orden de 10–12 GB, aunque no está confirmado.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 8 GPUs (modelo no especificado) y batch global 64.
- ¿Cabe en GPU de consumo? No confirmado. Según la estimación anterior, una GPU con 24 GB (RTX 3090, RTX 4090) podría ser suficiente, pero no hay verificación oficial.
- Opciones de despliegue: el propio autor indica el uso de LeRobot mediante `lerobot-eval --policy.path=arkojit1/pi05_pick_block_eef_abs_freezevis_bs64_lr2.5e-5_20k`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05_pick_block_eef_abs_freezevis_bs64_lr2.5e-5_20k`) | 4,14B | no disponible | Pérdida eval 0,2565 (sobreajustado) | no disponible | HuggingFace |
| `arkojit1/pi05_pick_block_eef_delta` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Run equivalente solo experto (sin enlace público) | no disponible | no disponible | Pérdida final 0,0991; mejor 0,0587 | no disponible | no disponible |

La comparación directa con el run solo experto es relevante porque comparte batch y esquema de entrenamiento, pero no se proporciona un identificador público. El modelo delta no es intercambiable con este, ya que emplea acciones relativas en lugar de absolutas.

## Limitaciones y advertencias
- Sobreajuste severo: la pérdida de evaluación final (0,2565) es muy superior a la de entrenamiento (0,009). El mejor checkpoint fue el paso 1.000 (~8 épocas), con una pérdida de evaluación de 0,0671; a partir de ahí el rendimiento en validación empeoró de forma sostenida.
- Región de entrenamiento muy estrecha: x 0,528–0,559; y 0,056–0,068; z 0,145–0,311. Cualquier objetivo fuera de ese rango es extrapolación y probablemente falle.
- Espacio de acción absoluto: las acciones son posiciones absolutas de efector final, no incrementos. No es intercambiable con modelos de acción delta como `arkojit1/pi05_pick_block_eef_delta`.
- Normalización por cuantiles q01–q99: el modelo es sensible a la distribución de estados y acciones vista durante el entrenamiento; cambios en la escala o en el rango pueden degradar el rendimiento.
- Entrenado con solo 35 episodios y una única tarea: no generaliza a otras tareas de manipulación ni a otros objetos o entornos.
- No se reporta tasa de éxito de tarea, solo pérdida de *flow matching*. La utilidad real en un robot no está cuantificada.
- Licencia no especificada: existe incertidumbre sobre el uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no aplicables: aunque el modelo base Gemma-2B es multilingüe, en este ajuste fino la componente de lenguaje se usa para condicionar acciones, no para generar texto.
- Codificador visual congelado: puede limitar la adaptación a variaciones visuales no presentes en el dataset.
- Entrenamiento en bf16 con `torch.compile` y *gradient checkpointing*: la reproducibilidad exacta puede requerir el mismo entorno de LeRobot 0.6.1.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_pick_block_eef_abs_freezevis_bs64_lr2.5e-5_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/pick_block_eef_position_abs
- Modelo con acciones delta: https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- No se han proporcionado papers, blogs, repositorios adicionales ni demos en la información disponible.
