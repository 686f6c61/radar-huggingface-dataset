# sam-guided-vlas/train_1_2_pile__bbox__blackout_a50__sim__all_cameras__live__pi05__seed_0

## Resumen

El modelo `sam-guided-vlas/train_1_2_pile__bbox__blackout_a50__sim__all_cameras__live__pi05__seed_0` es un fine-tune del modelo base `lerobot/pi05_base`, que a su vez es una implementación del modelo π₀.₅ (Pi05) de Physical Intelligence, un Vision-Language-Action (VLA) diseñado para generalización en robótica de manipulación. Este checkpoint concreto ha sido entrenado con el framework LeRobot sobre un dataset de simulación con 200 episodios y 69.392 frames, abarcando 20 tareas de apilado y manipulación de objetos cotidianos (basket, cake, can, etc.) en un robot Panda con tres cámaras.

El modelo resuelve el problema de control robótico a partir de observaciones visuales y de estado, generando acciones de 7 grados de libertad. Su relevancia radica en que demuestra el fine-tuning de un VLA de gran tamaño (4.143 millones de parámetros) sobre un dataset relativamente pequeño, lo que permite adaptar capacidades preentrenadas a tareas específicas sin entrenar desde cero. La licencia Apache 2.0 facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptación de π₀.₅ |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje puro; procesa imágenes de 224x224 y estado de 9 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina codificadores visuales, un modelo de lenguaje y un cabezal de acción para generar comandos de control directamente desde observaciones. La implementación en LeRobot adapta el código abierto de OpenPI. El modelo consume tres imágenes RGB de 224x224 (cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`) junto con un vector de estado de 9 dimensiones, y produce una acción de 7 dimensiones (posición y orientación del efector final).

El entrenamiento se realizó mediante fine-tuning supervisado sobre el dataset `sam-guided-vlas/train_1_2_pile__bbox__blackout_a50__sim__all_cameras__live`, con 45.000 pasos, batch size 16, optimizador AdamW y learning rate 5e-5, con semilla 0. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento de imitación directa. El dataset contiene 20 tareas de manipulación con objetos variados, lo que sugiere que el fine-tuning busca especializar el modelo en escenarios de apilado y recogida de objetos en un entorno simulado.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 grados de libertad (posición y orientación) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa tres cámaras simultáneamente (vista global, cámara en mano y segunda cámara en mano) con resolución 224x224.
- Generalización a tareas de apilado y manipulación de objetos cotidianos (20 tareas distintas en el dataset de entrenamiento).
- Fine-tuning eficiente: al partir de un modelo base preentrenado, puede adaptarse a nuevas tareas con datasets relativamente pequeños (200 episodios).
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes ni razonamiento multi-step en el sentido de los modelos de lenguaje; su salida es directamente una acción motora.

## Casos de uso

- Automatización de tareas de picking y placing en entornos industriales: el modelo puede controlar un brazo robótico Panda para recoger y colocar objetos como latas, botellas o cajas, gracias a su entrenamiento en tareas de manipulación con objetos variados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo el fine-tuning de VLA grandes se comporta con datasets pequeños, permitiendo comparar estrategias de regularización y aumento de datos.
- Desarrollo de robots de asistencia en entornos domésticos: las tareas de apilado de alimentos (cake, hamburger, etc.) pueden transferirse a escenarios de cocina asistida, aunque requiere adaptación a hardware real.
- Benchmarking de VLA en simulación: el modelo puede evaluarse en entornos simulados para medir la robustez frente a variaciones de iluminación, oclusiones o cambios de cámara, dado que el dataset incluye "blackout" y "bbox" como aumentos.
- Entrenamiento de políticas de control para robots colaborativos: su salida de acción de 7 dimensiones es compatible con brazos de 7 grados de libertad, facilitando su integración en líneas de producción.
- Estudio de transferencia sim-to-real: al estar entrenado en simulación, puede usarse para investigar técnicas de adaptación a robots físicos, evaluando la brecha de realidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en tareas reales o simuladas, ni comparaciones con otros VLA.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Dado el tamaño de 4.143 millones de parámetros, se estima que la inferencia en precisión FP32 requiere al menos 16 GB de VRAM (el modelo ocupa aproximadamente 16,5 GB en FP32, según el tamaño del repo de 28,1 GB que incluye checkpoints y optimizador).
- Para ejecución en tiempo real con un robot, se recomienda una GPU de gama alta como RTX 4090 (24 GB) o A100 (40/80 GB). No se descarta que con cuantización (no disponible) pueda ejecutarse en GPUs con menos memoria.
- El despliegue se realiza mediante el framework LeRobot, que soporta inferencia con `lerobot-rollout`. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput no están documentados; al ser un modelo de control en tiempo real, se espera que la inferencia sea lo suficientemente rápida para operar a 20 FPS (frecuencia del dataset), pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de una comparativa directa con datos concretos en la información proporcionada. Sin embargo, se puede contextualizar con otros VLA conocidos:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (pi05 fine-tune) | 4,14 B | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7 B | no disponible | MIT | Hugging Face |
| RT-2 (Google) | 55 B | no disponible | propietaria | no abierto |

La comparación es limitada porque no hay benchmarks publicados para este checkpoint. Se recomienda consultar la literatura de VLA para evaluaciones más completas.

## Limitaciones y advertencias

- No se han reportado resultados de evaluación, por lo que el rendimiento real en tareas no vistas es desconocido.
- El modelo está entrenado exclusivamente en simulación con un robot Panda y tres cámaras específicas; su transferencia a otros robots o configuraciones de cámara requiere reentrenamiento o adaptación.
- El dataset de entrenamiento incluye aumentos como "blackout" y "bbox", pero no se especifica su efecto en la robustez; puede haber sensibilidad a oclusiones o cambios de iluminación.
- Al ser un modelo de imitación, puede heredar sesgos del dataset (por ejemplo, posiciones de objetos, estrategias de agarre) y no generalizar a distribuciones muy diferentes.
- Riesgo de alucinación en acciones: en situaciones fuera de distribución, el modelo puede generar comandos de movimiento inválidos o inseguros; se requiere supervisión humana en entornos reales.
- No es un modelo de lenguaje; no soporta instrucciones en texto libre ni razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base π₀.₅ tiene su propia licencia (también Apache 2.0 según la model card), por lo que se debe verificar la cadena de licencias.
- El tamaño del repo (28,1 GB) incluye checkpoints de entrenamiento; para inferencia solo se necesitan los pesos safetensors, que ocupan aproximadamente 16,5 GB.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sam-guided-vlas/train_1_2_pile__bbox__blackout_a50__sim__all_cameras__live__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__bbox__blackout_a50__sim__all_cameras__live
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
