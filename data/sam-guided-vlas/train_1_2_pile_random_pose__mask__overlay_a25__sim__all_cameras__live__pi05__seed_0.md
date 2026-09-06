# sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a25__sim__all_cameras__live__pi05__seed_0

## Resumen

El modelo es un fine-tuning de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence e implementado en el ecosistema LeRobot. Este fine-tuning ha sido entrenado sobre un dataset de simulación con tareas de manipulación de objetos cotidianos (utensilios de cocina, alimentos, envases, etc.) usando un robot Franka Panda. El modelo consume imágenes de tres cámaras y el estado del robot, y genera acciones de 7 dimensiones para controlar el brazo.

La relevancia de este modelo radica en que permite probar la adaptación de un VLA preentrenado a un dominio específico de manipulación robótica con datos sintéticos. Con 4.143.404.816 parámetros y licencia Apache 2.0, está disponible para investigación y prototipado, aunque no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); arquitectura interna no especificada |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Según la model card, el modelo es un fine-tuning de `lerobot/pi05_base`, que a su vez es la implementación de LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence. Pi05 está diseñado para generalización de mundo abierto, evolucionando el modelo π₀ para adaptarse a entornos y situaciones no vistos durante el entrenamiento.

El entrenamiento se realizó con LeRobot 0.6.0 durante 45.000 pasos, con batch size 16, optimizador AdamW y learning rate 5e-05, con semilla 0. El dataset de entrenamiento contiene 198 episodios y 35.267 fotogramas a 20 FPS, distribuidos en 20 tareas distintas (objetos como "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", entre otros). Las entradas del modelo son el estado del robot (9 valores) y tres imágenes RGB de 224x224; la salida es una acción de 7 dimensiones. No se detallan más innovaciones técnicas en la información disponible.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual basada en tres cámaras: `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`.
- Control de un robot Franka Panda para tareas de interacción con objetos cotidianos.
- Capacidad de generalización a entornos nuevos, heredada del modelo base Pi05, aunque este fine-tuning se ha especializado en un conjunto de tareas concreto.
- No se describen capacidades de tool calling, agentes, razonamiento de propósito general ni soporte multilingüe en la información disponible.

## Casos de uso

- Manipulación de objetos en simulación: el modelo puede ejecutar tareas de pick and place con objetos de cocina en un entorno simulado con el robot Panda.
- Investigación en imitación learning: permite estudiar el efecto del fine-tuning de un VLA preentrenado sobre datos sintéticos de simulación.
- Evaluación de políticas robóticas: sirve como baseline para comparar estrategias de entrenamiento en el ecosistema LeRobot.
- Generación de datasets de demostración: el modelo puede utilizarse para generar trayectorias de referencia en simulación.
- Control de brazo robótico con visión: adecuado para entornos de investigación que dispongan del hardware necesario (Panda con tres cámaras).
- Desarrollo de sistemas de manipulación de objetos domésticos: entrenado en tareas con objetos como envases, alimentos y utensilios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 4.143.404.816 parámetros. En FP32, la inferencia requeriría aproximadamente 16,6 GB; en FP16/bf16, unos 8,3 GB. No se proporcionan requisitos oficiales.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM sería necesaria para FP16; se recomienda RTX 4090, A100 o H100 para margen de seguridad.
- El modelo es demasiado grande para ejecutarse en GPUs de consumo con menos de 8 GB en FP16.
- Sí cabe en GPUs de consumo con 12 GB o más, como RTX 4070 Ti, 4080 o 4090, en FP16.
- Despliegue: la documentación oficial de LeRobot indica que el modelo se ejecuta mediante `lerobot-rollout` con el robot Panda.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sam-guided-vlas/...__pi05__seed_0` (este modelo) | 4.143.404.816 | No disponible | No disponible | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` (modelo base) | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |
| `sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0` | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |

El modelo es un fine-tuning del base `lerobot/pi05_base`; no se dispone de más comparativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido entrenado únicamente en un dataset de simulación con 198 episodios y 20 tareas concretas; su rendimiento en el mundo real no está evaluado.
- No se han proporcionado resultados de evaluación, por lo que no hay evidencia de su tasa de éxito en tareas reales.
- Está diseñado para un robot Panda específico con tres cámaras concretas; usar otros robots o configuraciones de cámara puede degradar el rendimiento.
- El modelo no es un modelo de lenguaje general; no soporta conversación, razonamiento simbólico ni tool calling.
- La licencia Apache 2.0 permite uso comercial y modificación, pero los derechos de autor del modelo base (Physical Intelligence) pueden aplicar términos adicionales.
- Las fechas de creación y actualización del repositorio son de 2026, lo cual podría indicar un proyecto experimental o no validado por la comunidad.
- Al ser un modelo de control robótico, existe riesgo de movimientos inseguros si se despliega sin supervisión adecuada en hardware real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a25__sim__all_cameras__live__pi05__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__mask__overlay_a25__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Documentación de LeRobot sobre Pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Blog de Physical Intelligence sobre Pi05: https://www.physicalintelligence.company/blog/pi05
- Perfil de la organización en HuggingFace: https://huggingface.co/sam-guided-vlas
