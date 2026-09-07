# sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0

## Resumen

El modelo `sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0` es un fine-tuning de `lerobot/pi05_base`, un modelo Vision-Language-Action (VLA) de Physical Intelligence diseñado para la generalización en entornos abiertos. Este ajuste se ha entrenado con el dataset `train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live`, que contiene 199 episodios y 31.073 frames a 20 FPS, con tareas de manipulación de objetos de geometría compleja (esferas, anillos, cuencos, formas lobuladas, etc.). El modelo genera acciones de 7 dimensiones a partir de un estado de 9 dimensiones y tres imágenes de 224x224 procedentes de las cámaras `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`, para controlar un robot Panda. El repositorio tiene 28,1 GB y 4.143.404.816 parámetros. La relevancia de este modelo radica en su aplicación directa a robótica de manipulación, permitiendo evaluar y desplegar políticas de agarre con capacidades de simulación y transferencia a entornos reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅; arquitectura interna no disponible |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, que a su vez es una adaptación de π₀.₅ (Pi05) de Physical Intelligence en el framework LeRobot. π₀.₅ es un VLA de código abierto que extiende π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. El fine-tuning se ha realizado con el dataset `sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live`, compuesto por 199 episodios y 31.073 frames a 20 FPS. Las tareas incluyen descripciones de objetos con formas difíciles de manipular, como esferas con anillos, cuencos con bordes ondulados, formas con lóbulos y superficies texturizadas. Los datos se capturaron en simulación con múltiples cámaras (`all_cameras`) y también en condiciones "live". No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni la aplicación de técnicas como RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación robótica: el modelo produce vectores de acción de 7 dimensiones a partir de observaciones de estado y visión.
- Percepción multimodal de visión y estado: procesa tres imágenes de 224x224 (vista del agente, cámara en mano y segunda cámara en mano) junto con un estado de 9 dimensiones.
- Ejecución de tareas de agarre sobre objetos de geometría compleja, entrenado con "hard items" que requieren adaptación a formas irregulares.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue de políticas robóticas.
- Transferencia sim-to-real: el uso de datos de simulación y "live" sugiere capacidades de transferencia, aunque no se documenta validación específica.
- No se han documentado capacidades de tool calling, razonamiento simbólico, generación de texto o soporte multilingüe en la información disponible.

## Casos de uso

- Manipulación de objetos complejos en entornos industriales: el modelo puede planificar acciones de agarre para piezas con formas irregulares (anillos, cuencos, formas lobuladas) en estaciones de trabajo automatizadas.
- Investigación en robótica de manipulación: permite estudiar la generalización de políticas VLA en escenarios con objetos difíciles, usando el dataset de "hard items" como banco de pruebas.
- Control de brazos robóticos tipo Panda: integración directa con el robot Panda, usando las tres cámaras y el estado de 9 dimensiones para generar comandos de acción en tiempo real.
- Evaluación de políticas sim-to-real: al estar entrenado con datos de simulación y en vivo, puede utilizarse para comparar el rendimiento de políticas en entornos virtuales y físicos.
- Fine-tuning para tareas específicas de agarre: sobre la base de pi05, el modelo puede ajustarse con datos propios para adaptarse a nuevos objetos o condiciones de iluminación.
- Despliegue en pipelines de robótica con LeRobot: el modelo se carga con la librería LeRobot y puede integrarse en sistemas de control de robots para ejecutar políticas de acción.
- Automatización de tareas de pick-and-place con piezas complejas: el modelo genera acciones de 7 dimensiones que pueden traducirse a comandos de brazo robótico para colocar objetos con geometrías difíciles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el modelo está diseñado para su uso con LeRobot; no se especifican otros frameworks (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0` | 4.143.404.816 | no disponible | Apache-2.0 | HuggingFace |
| `lerobot/pi05_base` | no disponible | no disponible | Apache-2.0 | HuggingFace |
| `sam-guided-vlas/train_1_2_pile__point__overlay_a25__sim__all_cameras__live__pi05__seed_0` | no disponible | no disponible | Apache-2.0 | HuggingFace |

Otros fine-tunes del mismo autor, como `train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__half_item_p03__pi05__seed_0`, también están disponibles en HuggingFace, pero no se dispone de sus especificaciones.

## Limitaciones y advertencias

- El dataset de entrenamiento es reducido (199 episodios, 31.073 frames), lo que puede limitar la generalización a objetos y entornos fuera del conjunto.
- No se han publicado benchmarks ni evaluaciones independientes que validen el rendimiento en tareas reales.
- La arquitectura interna, la longitud de contexto y las capacidades lingüísticas no se han documentado en la información disponible.
- Al ser un modelo de robótica, requiere un entorno físico o simulador específico (robot Panda, cámaras, controladores) para su ejecución, lo que dificulta su uso como modelo generalista.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base `pi05_base` no imponga restricciones adicionales.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de simulación puede presentar problemas de transferencia sim-to-real no controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
