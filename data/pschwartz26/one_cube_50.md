# pschwartz26/one_cube_50

## Resumen

`one_cube_50` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face por el usuario pschwartz26 mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de una imagen de cámara de muñeca y del estado articular del robot, predice directamente comandos de acción de 6 dimensiones. El repositorio ocupa 0,2 GB y contiene 51.617.414 parámetros en formato safetensors.

El modelo resuelve una tarea única y concreta: "Pick up the cube and place it in the tray" (coger el cubo y dejarlo en la bandeja) sobre un robot de tipo `so_follower` con una sola cámara en la muñeca. Se entrenó con 29 episodios de teleoperación (39.784 fotogramas a 30 FPS) del dataset `pschwartz26/one_cube`, durante 100.000 pasos con batch de 8, optimizador AdamW y learning rate de 1e-5.

Su relevancia es la de un ejemplo reproducible de pipeline de imitation learning de extremo a extremo con LeRobot 0.7.0: sirve como referencia para validar la cadena de grabación de datos, entrenamiento y despliegue en robots de bajo coste tipo SO-100/SO-101, no como política generalista. No se han publicado resultados de evaluación en robot real ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (modelo visomotor, sin interfaz de lenguaje; la tarea se especifica como cadena de texto en el prompt de rollout) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `wrist` (una sola) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.wrist` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Dataset de entrenamiento | `pschwartz26/one_cube` (29 episodios, 39.784 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.0 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers, paper arXiv:2304.13705) es un método de imitation learning que predice chunks de acciones cortos en lugar de pasos individuales, lo que reduce el error de acumulación del comportamiento y estabiliza el control. La política combina un codificador visual para la imagen de muñeca (3x480x640) con el estado articular de 6 dimensiones, y un decodificador transformer que emite secuencias de acciones de 6 dimensiones. El entrenamiento es supervisado por imitación sobre demostraciones teleoperadas, sin RLHF ni DPO.

Los datos provienen exclusivamente del dataset `pschwartz26/one_cube`: 29 episodios y 39.784 fotogramas a 30 FPS de una única tarea. El entrenamiento se ejecutó con LeRobot 0.7.0 durante 100.000 pasos, batch de 8, AdamW y learning rate de 1e-5 con semilla 1000. No se documenta aumento de datos, composición adicional del dataset ni innovaciones técnicas más allá del propio método ACT.

## Capacidades

- Control visomotor de robot manipulador: mapea imagen de muñeca y estado articular a comandos de acción de 6 dimensiones.
- Predicción de chunks de acciones, lo que permite ejecutar secuencias cortas de movimiento de forma coherente.
- Ejecución de una tarea concreta de pick-and-place: "Pick up the cube and place it in the tray".
- Integración con el ecosistema LeRobot: `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; la tarea se pasa como cadena de texto al rollout.
- Capacidades especiales: no dispone de modo thinking, visión general, audio ni otras modalidades fuera de la imagen de muñeca.

## Casos de uso

- Validación de pipeline de imitation learning: sirve como referencia para comprobar que la cadena de grabación, entrenamiento y despliegue con LeRobot 0.7.0 funciona en un robot `so_follower` antes de escalar a tareas propias.
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un cubo y dejarlo en una bandeja con una sola cámara de muñeca, adecuado para prototipos de manipulación de bajo coste.
- Base para fine-tuning con datos propios: al estar entrenado con ACT y LeRobot, puede reentrenarse con `lerobot-train` sobre un dataset nuevo para adaptar la política a otras posiciones de objeto o entornos.
- Docencia y demostraciones de robótica: su tamaño reducido (51,6 M de parámetros, 0,2 GB) y su licencia abierta en el Hub lo hacen manejable para prácticas y talleres.
- Benchmark interno de políticas: sirve como línea base de éxito en una tarea simple para comparar con otras políticas (Diffusion Policy, VQ-BeT) entrenadas con los mismos datos.
- Pruebas de despliegue en hardware consumer: al ser una política pequeña, puede ejecutarse en el ordenador que controla el robot sin GPU de datacenter, lo que facilita iteraciones rápidas.
- Recolección de datos asistida: puede usarse en modo rollout para generar trayectorias iniciales que luego se corrijan por teleoperación y se añadan al dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasa de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors, los pesos ocupan del orden de 0,1-0,2 GB en FP32/FP16, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el comando de entrenamiento de la model card usa `--policy.device=cuda`, sin modelo de GPU concreto.
- ¿Cabe en GPU consumer? Sí, por tamaño de parámetros; cualquier GPU con unos pocos GB de VRAM es suficiente, aunque no se documenta el modelo exacto.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del robot, la cámara y el hardware de control, y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pschwartz26/one_cube_50` (ACT) | 51.617.414 | Imagen 3x480x640 + estado (6,) | Pick-and-place de un cubo | no disponible | Hugging Face, LeRobot |
| ACT (metodo base, arXiv:2304.13705) | no disponible | Configurable | Imitation learning general | no disponible | Paper y referencia en LeRobot |
| Diffusion Policy | no disponible | Configurable | Imitation learning general | no disponible | Referencia metodologica |
| VQ-BeT | no disponible | Configurable | Imitation learning general | no disponible | Referencia metodologica |

No se dispone de datos de rendimiento comparativo entre estas políticas en la informacion proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Entrenado para una única tarea y un único robot (`so_follower`) con una sola cámara de muñeca; no generaliza a otras tareas, objetos o configuraciones sin reentrenamiento.
- Dataset muy pequeño: 29 episodios y 39.784 fotogramas, lo que limita la robustez frente a variaciones de iluminación, posiciones de objeto o distractores.
- Sin resultados de evaluación publicados: no hay evidencia documentada de tasa de éxito en robot real.
- Licencia no especificada ("[More Information Needed]"), lo que impide confirmar condiciones de uso comercial.
- Riesgo de sobreajuste a la disposición de la escena de grabación y a la cámara concreta usada en el dataset.
- No es un modelo de lenguaje: no admite tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- La tarea se pasa como texto al rollout, pero el modelo no interpreta lenguaje de forma general; solo ejecuta el comportamiento aprendido.
- Para producción se requiere calibración del robot, puerto y cámaras específicos de cada máquina, tal como advierte la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pschwartz26/one_cube_50
- Dataset de entrenamiento: https://huggingface.co/datasets/pschwartz26/one_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=pschwartz26/one_cube
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
