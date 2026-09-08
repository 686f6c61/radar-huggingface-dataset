# sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e__pi05__seed_0__b25_from_base

## Resumen

El modelo `train_1_2_pile_random_pose__no_mask__ur5e__pi05__seed_0__b25_from_base` es un ajuste fino de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para la generalización en entornos abiertos. Este fine-tune ha sido entrenado con la librería LeRobot sobre el modelo base `lerobot/pi05_base`, y está orientado al control de un brazo robótico UR5e en tareas de manipulación de objetos apilados con poses aleatorias.

El modelo consume observaciones visuales de tres cámaras (agentview, dos cámaras en mano) y un vector de estado de 9 dimensiones, y produce acciones de 7 dimensiones para el brazo. La arquitectura interna no está documentada en la información disponible, pero el modelo cuenta con 4.143.404.816 parámetros en formato safetensors. Se trata de una política de aprendizaje por imitación, no de un modelo de lenguaje general, por lo que su uso se limita al control robótico.

La relevancia de este modelo radica en su aplicación práctica en robótica: permite ejecutar tareas de picking y manipulación en entornos no estructurados, aprovechando la capacidad de generalización del modelo base Pi05. Al estar integrado en el ecosistema LeRobot, facilita el entrenamiento, el despliegue y la evaluación de políticas robóticas en hardware real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); arquitectura interna no especificada en la información disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi05_base`, que a su vez es la implementación en LeRobot de π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación se adapta del repositorio OpenPI de Physical Intelligence. No se proporcionan detalles sobre la arquitectura interna (tipo de transformer, uso de MoE, mecanismos de atención, etc.) en la información disponible.

El entrenamiento se realizó con la librería LeRobot sobre el dataset `sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e`, compuesto por 162 episodios y 28.490 fotogramas a 20 FPS. Las tareas incluyen la manipulación de objetos como dispensador de jabón, mermelada, tarro, cereales, cuchillos, hervidor, frutas y verduras, entre otros. La configuración de entrenamiento fue de 5.000 pasos, con un tamaño de lote de 16, optimizador AdamW, tasa de aprendizaje de 5e-05 y semilla 0. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste fino por imitación.

## Capacidades

- Control de un brazo robótico UR5e a partir de observaciones visuales y de estado.
- Entrada multimodal: tres cámaras (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) con imágenes de 224x224 píxeles y un vector de estado de 9 dimensiones.
- Salida de acciones de 7 dimensiones para el brazo, aptas para control en tiempo real a 20 FPS.
- Ejecución de tareas de manipulación de objetos en una pila con poses aleatorias, incluyendo 20 categorías de objetos cotidianos.
- Compatibilidad con el ecosistema LeRobot y HuggingFace, permitiendo entrenamiento, rollout y evaluación de políticas robóticas.
- No se especifican capacidades de tool calling, agentes, razonamiento simbólico, generación de texto ni soporte multilingüe.

## Casos de uso

- Automatización de picking en almacenes: el modelo puede controlar un brazo UR5e para recoger objetos de una pila en posiciones aleatorias, lo que resulta útil en tareas logísticas de clasificación y preparación de pedidos.
- Manipulación doméstica de objetos: en entornos no estructurados, el modelo puede recoger objetos cotidianos como botes, frutas o utensilios, facilitando tareas de recogida y ordenación en el hogar.
- Investigación en aprendizaje por imitación: sirve como base para realizar fine-tuning con LeRobot en nuevas tareas de manipulación, permitiendo a los investigadores explorar la transferencia de políticas VLA.
- Robótica asistencial: el modelo puede integrarse en sistemas de asistencia para personas con movilidad reducida, realizando tareas de recogida y colocación de objetos en entornos domésticos.
- Integración en líneas de producción: en entornos industriales con brazos UR5e, el modelo puede ejecutar tareas repetitivas de manipulación de piezas guiadas por visión, reduciendo la necesidad de programación manual.
- Benchmarking de políticas de manipulación: el modelo puede utilizarse como referencia para comparar el rendimiento de otras políticas VLA en el mismo dataset o en configuraciones robóticas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143 millones de parámetros, una inferencia en precisión fp16/bf16 requeriría aproximadamente 8,3 GB de VRAM (estimación orientativa).
- GPU recomendadas: no disponible. Según la estimación anterior, sería viable en GPUs de consumo con 10 GB o más de VRAM, como la NVIDIA RTX 3080, RTX 3090 o RTX 4090, siempre que se utilice precisión fp16 o se aplique cuantización.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), HuggingFace Hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue.
- Latencia y throughput: no disponible. El dataset de entrenamiento se grabó a 20 FPS, lo que sugiere que la política está diseñada para operar a esa frecuencia, pero no se proporcionan mediciones de latencia en hardware real.

## Comparativa con modelos similares

No se han proporcionado datos de comparación con modelos similares en la información disponible. El modelo es un fine-tune de `lerobot/pi05_base`, por lo que comparte arquitectura y número de parámetros con el modelo base, pero sin el ajuste fino para las tareas específicas de UR5e. Otros modelos VLA como OpenVLA o pi0 no se han comparado en esta ficha por falta de datos públicos de rendimiento en las mismas tareas.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: no se conoce la tasa de éxito en las tareas de manipulación, lo que impide validar su rendimiento real en robot.
- Dataset de entrenamiento limitado: 162 episodios y 20 tareas específicas pueden no generalizar a otros objetos, entornos, iluminación o configuraciones de robot.
- Configuración de hardware fija: el modelo está entrenado para un brazo UR5e con tres cámaras concretas; cualquier cambio en la configuración de sensores o en el robot requeriría reentrenamiento o adaptación.
- No se especifican idiomas ni longitud de contexto: al ser una política de acción visual, estas métricas no son relevantes o no están documentadas.
- Riesgo de fallos de predicción de acción: como política robótica, puede producir acciones incorrectas en situaciones no vistas, lo que requiere supervisión humana en entornos de producción.
- Licencia Apache-2.0: permite uso comercial, pero se debe verificar la licencia del modelo base `lerobot/pi05_base` y del dataset utilizado, ya que pueden imponer restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e__pi05__seed_0__b25_from_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile_random_pose__no_mask__ur5e
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre Pi05: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de Pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
