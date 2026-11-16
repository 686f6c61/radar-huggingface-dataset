# qrvmil/pi05-libero-goal-middle_drawer-20261116

## Resumen

Pi0.5 SFT para LIBERO-goal es un ajuste fino supervisado (SFT) completo del modelo base `lerobot/pi05_base`, publicado por el usuario qrvmil en Hugging Face. Se trata de un modelo de política robótica (vision-language-action) especializado en una única tarea del benchmark LIBERO-goal: abrir el cajón central de un armario. El modelo parte de la arquitectura Pi0.5 de Physical Intelligence, distribuida a través de la librería LeRobot, y se entrena sobre 43 demostraciones (6019 fotogramas) del dataset `lerobot/libero`.

El interés de esta ficha es doble: por un lado, documenta un experimento reproducible de SFT completo sobre un modelo VLA de aproximadamente 4.143 millones de parámetros (4,14 mil millones), con todos los pesos entrenables y sin LoRA ni backbone congelado; por otro, sirve como referencia de cómo se estructura un pipeline de entrenamiento y evaluación en robótica con LeRobot (checkpoints intermedios, estados del optimizador, evaluación con semillas fijas y control relativo del efector final a 20 Hz).

Es relevante ahora porque los modelos VLA de tipo Pi0.5 están emergiendo como base para manipulación robótica de propósito general, y los ajustes de tarea única sobre benchmarks estandarizados como LIBERO permiten medir de forma controlada la transferencia de estos modelos a tareas concretas. No obstante, en el momento de la consulta no hay resultados de evaluación publicados (todos los checkpoints figuran como "pending"), por lo que su rendimiento real aún no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (Pi0.5) sobre transformer, con flow matching para generación de acciones |
| Parametros totales | 4.143.404.816 (todos entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (modelo de robótica; tokenizador PaliGemma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (directorio `pretrained_model` de LeRobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, la implementación de Pi0.5 en LeRobot. La arquitectura combina un backbone vision-language (tokenizador oficial PaliGemma de Big Vision, con IDs de token verificados y guardado en `qrvmil/pi05-paligemma-tokenizer-20261116`) con un cabezal de acciones basado en flow matching, que genera trozos de acción (action chunks) de longitud 50 y ejecuta 10 acciones por inferencia, con 10 pasos de inferencia de flow matching. El control es relativo sobre el efector final a 20 Hz.

El entrenamiento consiste en un SFT completo de 1000 pasos sobre 43 demostraciones y 6019 fotogramas del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), filtrados por tarea exacta. Se usan pesos en FP32 y estado AdamW, autocast en BF16, batch de 8, semilla 1000, learning rate 5e-5 con warmup de 50 pasos y decaimiento coseno hasta 5e-6 en el paso 1000. La normalización media/desviación típica proviene del dataset original y se emplean dos cámaras más una cámara enmascarada. El commit de LeRobot utilizado es `781d3daccc64e8ce3e3d0910e64b2b0180551059`. No se menciona RLHF ni DPO; es SFT puro.

## Capacidades

- Manipulación robótica de tarea única: abrir el cajón central de un armario en el entorno LIBERO-goal.
- Generación de acciones continuas mediante flow matching con chunks de 50 acciones y ejecución de 10.
- Control relativo del efector final a 20 Hz.
- Procesamiento multimodal: entrada de imágenes de dos cámaras (más una cámara enmascarada) y estado del robot.
- Entrenamiento completo y reanudable: checkpoints con estado del optimizador y RNG en los pasos 250, 500, 750 y 1000.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni razonamiento de propósito general; es un modelo específico de política robótica.

## Casos de uso

- Investigación en manipulación robótica: servir como línea base reproducible de SFT completo sobre Pi0.5 para comparar con variantes con LoRA o backbone congelado en la misma tarea de LIBERO-goal.
- Evaluación de transferencia de modelos VLA: medir cuánto conocimiento del modelo base `pi05_base` se conserva tras un ajuste de tarea única con solo 43 demostraciones.
- Reproducción de pipelines LeRobot: el repositorio incluye checkpoints intermedios con estado del optimizador, lo que permite reanudar entrenamientos y estudiar la curva de aprendizaje paso a paso.
- Desarrollo de sistemas de control visual: integrar la política en un bucle de control a 20 Hz con control relativo del efector final para experimentos de robótica de escritorio.
- Benchmarking estandarizado: usar la configuración de evaluación (5 intentos, estados iniciales 0–4, semillas 1000–1004, resets duros, 256×256 píxeles, límite de 300 pasos) como plantilla para comparaciones entre modelos.
- Docencia y prototipado: ejemplo didáctico de SFT completo en robótica con LeRobot, incluyendo tokenizador PaliGemma y carga de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones de los checkpoints 250, 500, 750 y 1000 están pendientes ("pending"), con una métrica de tasa de éxito (SR) calculada sobre 5 intentos, lo que da una estimación gruesa en incrementos de 20 puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,14 mil millones de parámetros en FP32 los pesos ocupan aproximadamente 16,6 GB, y en BF16 unos 8,3 GB, sin contar activaciones ni buffers de imágenes.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs con al menos 16–24 GB de VRAM para FP32/BF16, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; probablemente sí en BF16 en GPUs de gama alta con 16 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`PI05Policy.from_pretrained`), según el ejemplo de la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qrvmil/pi05-libero-goal-middle_drawer-20261116 | 4,14 mil millones | no disponible | Tarea única LIBERO-goal | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | Política VLA base | no disponible en esta ficha | Hugging Face (LeRobot) |
| Otros ajustes LIBERO de la familia Pi0.5 | no disponible | no disponible | Tareas LIBERO | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: solo está entrenado para abrir el cajón central del armario en LIBERO-goal; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: los checkpoints figuran como "pending", por lo que no hay evidencia de tasa de éxito.
- Estimación de rendimiento gruesa: la evaluación con 5 intentos solo permite incrementos de 20 puntos, lo que limita la precisión estadística.
- Riesgo de sobreajuste: 43 demostraciones y 1000 pasos de SFT completo sobre 4,14 mil millones de parámetros pueden provocar sobreajuste a las condiciones del dataset.
- Dependencia del entorno: requiere el setup específico de LIBERO (cámaras, control relativo a 20 Hz, resolución 256×256) y el commit de LeRobot indicado.
- Sesgos: no documentados, pero al ser un modelo entrenado en un entorno simulado, puede no transferir a robots reales.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener condiciones adicionales que deben verificarse.
- Idiomas: no aplica en el sentido habitual; el tokenizador es PaliGemma y no se documentan capacidades lingüísticas generales.

## Enlaces

- Hugging Face: https://huggingface.co/qrvmil/pi05-libero-goal-middle_drawer-20261116
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Tokenizador: https://huggingface.co/qrvmil/pi05-paligemma-tokenizer-20261116
- Librería LeRobot: https://github.com/huggingface/lerobot
