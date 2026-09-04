# sam-guided-vlas/train_1_2_3_4_hard_items__no_mask__pi05__seed_0__steps_45k

## Resumen

El modelo `sam-guided-vlas/train_1_2_3_4_hard_items__no_mask__pi05__seed_0__steps_45k` es un fine-tune de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) de Physical Intelligence para manipulación robótica. Ha sido entrenado con LeRobot por `sam-guided-vlas` sobre el modelo base `lerobot/pi05_base`, con 4.143.404.816 parámetros. Su función es convertir descripciones textuales de tareas e imágenes de tres cámaras (224×224) en acciones de control de 7 dimensiones para un robot Panda. El dataset de entrenamiento contiene 446 episodios y 66.323 fotogramas con objetos de geometrías variadas. La licencia es Apache 2.0. No se especifican en la información disponible la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de π₀.₅, un modelo VLA que condiciona la política de acción a partir de observaciones visuales y una instrucción en lenguaje natural. En esta implementación, el modelo consume como entradas el estado del robot (vector de 9 dimensiones) y tres imágenes de 224×224 (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), y produce un vector de acción de 7 dimensiones. Según la model card, la inferencia se realiza sobre un robot Panda.

El entrenamiento se ha realizado mediante fine-tuning del checkpoint `lerobot/pi05_base` con el framework LeRobot. El dataset de entrenamiento `sam-guided-vlas/train_1_2_3_4_hard_items__no_mask` contiene 446 episodios y 66.323 fotogramas a 20 FPS, con descripciones de tareas en inglés centradas en la manipulación de objetos de forma compleja, como cuencos con bordes ondulados, esferas con púas o estructuras de varillas. No se proporciona información sobre técnicas de alineación (RLHF/DPO) ni sobre innovaciones específicas de decodificación o atención.

## Capacidades

- **Control robótico de bajo nivel:** genera acciones de 7 dimensiones para el brazo del robot Panda.
- **Percepción multi-cámara:** integra tres vistas visuales diferentes (vista del agente y dos cámaras en mano) para tomar decisiones.
- **Entrada de instrucciones en lenguaje natural:** el modelo usa descripciones textuales de tareas como parte del condicionamiento.
- **Generalización a nuevos escenarios:** siguiendo la filosofía de π₀.₅, está orientado a funcionar en entornos y situaciones no vistas durante el entrenamiento.
- **Manipulación de objetos con geometría compleja:** el dataset de entrenamiento cubre una amplia variedad de formas, lo que sugiere capacidad para razonar sobre características físicas de los objetos.
- **No** se han especificado capacidades de tool calling, soporte de agentes multi-paso, visión general (más allá de las cámaras del robot) ni multimodalidad adicional.

## Casos de uso

- **Manipulación industrial de piezas complejas:** el modelo puede controlar un brazo robótico para agarrar objetos con formas irregulares (cuencos, esferas con protuberancias, estructuras abiertas) en procesos de ensamblaje o inspección, gracias a la entrada de lenguaje y a las tres cámaras.
- **Automatización de picking en almacenes:** las tareas de recogida y colocación se benefician de la cámara en mano y de la vista del agente para localizar y agarrar artículos en estanterías o contenedores desordenados.
- **Robótica colaborativa en laboratorios:** el robot puede manipular muestras o equipos descritos en lenguaje natural, reduciendo la intervención humana en tareas repetitivas.
- **Investigación en aprendizaje por imitación:** este checkpoint proporciona una política preentrenada sobre un dataset concreto que puede servir como punto de partida para fine-tuning en nuevas tareas de manipulación.
- **Ensayos de ensamblado automático:** la variedad de objetos del dataset (con rebajes, anillos, púas y tetones) permite modelar operaciones de alineación, inserción y encaje.
- **Control de robots educativos:** el uso del robot Panda y del framework LeRobot facilita su integración en entornos académicos para demostraciones de manipulación visual-lenguaje-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** con 4.143.404.816 parámetros, los pesos en FP16 ocupan alrededor de 8,3 GB. Sumando las activaciones de tres imágenes de 224×224 y el estado del robot, se recomienda al menos 16 GB de VRAM para inferencia en FP16.
- **GPU recomendadas:** NVIDIA RTX 4090 (24 GB) o superior para inferencia; se recomienda una A100 (40/80 GB) para entrenamiento o fine-tuning.
- **Compatibilidad con GPU de consumo:** sí, una RTX 4090 o 3090 puede albergar el modelo en FP16, aunque no se han publicado cuantizaciones probadas en la información disponible.
- **Opciones de despliegue:** el modelo está diseñado para ejecutarse con LeRobot y PyTorch. No es aplicable a vLLM, llama.cpp ni Ollama, al tratarse de un modelo de acción robótica con entradas de visión.
- **Latencia y throughput:** no disponible.

## Comparativa con modelos similares

No se dispone de datos comparables suficientes en la información proporcionada. El modelo es un fine-tune de `lerobot/pi05_base`, con el que comparte arquitectura y parámetros (4.143.404.816). No se han encontrado otros modelos comparables con datos de rendimiento publicados en la información disponible.

## Limitaciones y advertencias

- El modelo se ha afinado sobre un conjunto de datos muy reducido (446 episodios) con tareas específicas de manipulación. La generalización fuera de este dominio puede verse limitada.
- No se especifican sesgos conocidos ni evaluaciones de alucinación en la información disponible.
- Las descripciones de tareas del entrenamiento están en inglés; no se informa de soporte multilingüe y es posible que el modelo no responda bien a instrucciones en español.
- La ausencia de benchmarks publicados impide una comparación objetiva de su rendimiento con otros modelos VLA.
- El repositorio no presenta descargas ni likes, lo que indica baja validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial con atribución, pero el usuario debe evaluar los riesgos antes de integrar el modelo en producción.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/sam-guided-vlas/train_1_2_3_4_hard_items__no_mask__pi05__seed_0__steps_45k)
- [Blog de π₀.₅ (Pi05)](https://www.physicalintelligence.company/blog/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de π₀.₅ en LeRobot](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sam-guided-vlas/train_1_2_3_4_hard_items__no_mask)
