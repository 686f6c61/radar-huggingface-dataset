# pdhinaka/pi05_so101_blue_cube_gray_box_cleaned_20k

## Resumen

Este modelo es un fine-tuning del modelo base `lerobot/pi05_base`, un Vision-Language-Action (VLA) desarrollado por Physical Intelligence, adaptado para una tarea concreta de manipulación robótica: recoger un cubo azul y colocarlo en una caja gris. El autor, `pdhinaka`, ha entrenado esta política con el framework LeRobot de Hugging Face, utilizando un dataset propio de 50 episodios con 18.736 frames capturados a 30 FPS desde dos cámaras (muñeca y superior). El modelo está pensado para el brazo robótico SO-101 (SO-ARM) y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de última generación (π₀.₅) sobre una tarea específica de pick-and-place, usando herramientas open source como LeRobot. Con 4.143 millones de parámetros, es un modelo de tamaño considerable para robótica, pero su arquitectura está optimizada para inferencia en tiempo real sobre hardware de consumo. Al ser un fine-tuning, hereda las capacidades de generalización del modelo base, aunque su especialización en esta tarea concreta limita su aplicabilidad fuera de ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Physical Intelligence) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo multimodal, no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un VLA de Physical Intelligence que extiende π₀ para generalizar a entornos y situaciones no vistas durante el entrenamiento. La implementación en LeRobot está adaptada del repositorio open source OpenPI. La arquitectura combina un codificador visual (para procesar las imágenes de las cámaras), un codificador de estado (para las posiciones articulares del robot) y un decodificador de acciones que genera comandos de 6 dimensiones (posición y orientación del efector final). El modelo consume observaciones de dos cámaras RGB (480x640) y el estado del robot (6 valores), y produce acciones de 6 dimensiones.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi05_base` sobre el dataset `pdhinaka/so101_blue_cube_in_gray_box_pi05_cleaned`, que contiene 50 episodios de la tarea "Pick up the blue cube and place it in the gray box". Se usaron 20.000 pasos de entrenamiento con batch size 1, optimizador AdamW y learning rate 2.5e-5, con semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento de imitación supervisada estándar. El dataset fue limpiado (filtrado de episodios defectuosos) antes del entrenamiento.

## Capacidades

- Manipulación robótica de precisión: el modelo genera acciones de 6 grados de libertad (posición y orientación) para controlar un brazo robótico SO-101.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (muñeca y superior) para localizar el objeto y la caja.
- Aprendizaje por imitación: la política ha sido entrenada para replicar demostraciones humanas de la tarea específica.
- Generalización limitada a la tarea entrenada: recoger un cubo azul y colocarlo en una caja gris, con variaciones de posición y orientación dentro del espacio de trabajo.
- Inferencia en tiempo real: al ser un VLA optimizado, puede ejecutarse a frecuencias de control compatibles con robots reales (típicamente 10-30 Hz).
- No incluye capacidades de generación de texto, tool calling ni razonamiento conversacional; es exclusivamente un modelo de control motor.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un brazo SO-101 para realizar tareas repetitivas de recogida y colocación de objetos, reduciendo la intervención humana.
- Prototipado de políticas robóticas con LeRobot: sirve como ejemplo de referencia para investigadores que quieran fine-tunear π₀.₅ sobre sus propias tareas, mostrando la configuración completa de entrenamiento y despliegue.
- Evaluación de VLA en hardware de bajo coste: al estar diseñado para el brazo SO-101 (un robot asequible), permite probar capacidades de VLA sin necesidad de robots industriales caros.
- Investigación en generalización de tareas: aunque está especializado, puede usarse como baseline para estudiar cómo el fine-tuning afecta a la capacidad de generalización del modelo base.
- Educación en robótica y aprendizaje por imitación: el modelo y su dataset están disponibles públicamente, lo que facilita su uso en cursos y talleres sobre manipulación robótica.
- Benchmarking de frameworks de entrenamiento: permite comparar el rendimiento de LeRobot frente a otras herramientas de entrenamiento de políticas robóticas en una tarea estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de tasa de éxito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero por el tamaño del modelo (4.14B parámetros) y su naturaleza multimodal, se estima que necesita al menos 12-16 GB de VRAM en FP16 para inferencia. Con cuantización a 8 bits podría reducirse a ~8 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para entrenamiento. Para inferencia en tiempo real, una RTX 4080 o superior sería adecuada.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o 4090 puede ejecutar el modelo, aunque la latencia dependerá de la optimización.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan sobre el robot. También puede usarse con vLLM o TGI si se adapta, aunque no es el flujo estándar.
- Latencia y throughput: no disponibles. Para control robótico en tiempo real, se espera que la inferencia sea inferior a 100 ms por paso, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 fine-tuned) | 4.14B | no disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 4.14B (aprox.) | no disponible | VLA generalista | Apache 2.0 | Hugging Face |
| ACT (Action Chunking Transformer) | ~100M | no disponible | Imitación robótica | MIT | Hugging Face |
| Diffusion Policy | ~100M | no disponible | Imitación robótica | MIT | GitHub |

La comparativa es limitada porque no hay datos de rendimiento publicados para este modelo. Frente a ACT o Diffusion Policy, π₀.₅ es un modelo mucho más grande y con capacidades de generalización superiores, pero también requiere más recursos. Frente al base pi05, este fine-tuning está especializado en una tarea concreta, lo que puede mejorar la precisión en esa tarea a costa de perder generalidad.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha sido entrenado para una tarea concreta (cubo azul en caja gris). No funcionará en otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay datos de tasa de éxito en el robot real, por lo que su rendimiento real es desconocido.
- Dependencia del hardware: requiere el brazo SO-101 y las cámaras específicas (wrist_cam y top_cam) con las mismas posiciones y calibración que en el entrenamiento.
- Riesgo de sobreajuste: con solo 50 episodios, el modelo puede no generalizar bien a variaciones de iluminación, posición de objetos o distracciones.
- Sesgos del dataset: el dataset fue limpiado, pero puede contener sesgos de las demostraciones humanas (por ejemplo, trayectorias subóptimas).
- Alucinación en robótica: como cualquier VLA, puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento, lo que puede causar fallos físicos.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base π₀.₅ tiene su propia licencia (Apache 2.0 también, según la model card), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pdhinaka/pi05_so101_blue_cube_gray_box_cleaned_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/pdhinaka/so101_blue_cube_in_gray_box_pi05_cleaned
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
