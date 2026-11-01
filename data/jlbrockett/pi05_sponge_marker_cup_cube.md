# Jlbrockett/pi05_sponge_marker_cup_cube

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, diseñado para la generalización en entornos abiertos en robótica. Este repositorio concreto, `Jlbrockett/pi05_sponge_marker_cup_cube`, es un fine-tuning de `lerobot/pi05_base` realizado por un tercero (usuario Jlbrockett) sobre un conjunto de datos propio de manipulación robótica, y publicado a través de la librería LeRobot de Hugging Face. No se trata del modelo base original, sino de una política entrenada para cuatro tareas específicas de pick-and-place.

El modelo resuelve el problema de control robótico mediante imitación: consume observaciones multimodales (tres cámaras RGB de 224×224 y un vector de estado de 32 dimensiones) y produce un vector de acción de 6 dimensiones a 30 FPS. La arquitectura subyacente es la de π₀.₅, que evoluciona π₀ para generalizar a entornos y situaciones no vistas durante el entrenamiento, según la descripción del autor en la model card.

Es relevante ahora porque ejemplifica el flujo de trabajo de fine-tuning de modelos VLA de gran tamaño (4.143 millones de parámetros) sobre hardware de bajo coste (robot SO-100/SO-101 follower) usando LeRobot 0.6.1, lo que democratiza la experimentación con políticas de manipulación entrenadas por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (implementación LeRobot de OpenPI) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; repo de 9.4 GB) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence, adaptada desde el repositorio OpenPI. Se trata de un modelo VLA que combina percepción visual (tres cámaras: `base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`, todas a 224×224) con un vector de estado de 32 dimensiones para producir acciones de 6 dimensiones. La arquitectura interna detallada (backbone de visión, transformer de política, mecanismo de difusión o flow matching) no se especifica en la información proporcionada.

El entrenamiento se realizó sobre el dataset `Jlbrockett/sponge_marker_cup_cube`, con 250 episodios y 154.563 frames a 30 FPS, cubriendo cuatro tareas: coger la esponja y colocarla en el bol, coger el rotulador y colocarlo verticalmente en la taza, colocar la taza sobre el salvamanteles y meter el cubo gris en el contenedor gris. La configuración fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05, semilla 1000 y LeRobot 0.6.1. No se indica si hubo RLHF, DPO ni otras fases de alineamiento; es entrenamiento por imitación supervisada.

## Capacidades

- Control robótico de manipulación mediante imitación: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente tres vistas RGB (cámara base y dos cámaras de muñeca).
- Ejecución de tareas de pick-and-place específicas: esponja al bol, rotulador a la taza, taza al salvamanteles, cubo al contenedor.
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable con `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual, matemáticas ni generación de código; es un modelo de política robótica, no un LLM de propósito general.
- Capacidades multilingües: no aplicable / no disponible.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo puede ejecutar las cuatro tareas entrenadas sobre un robot SO follower con cámaras `handeye` y `front`, usando `lerobot-rollout` con la tarea indicada por texto.
- Base para fine-tuning en nuevas tareas de manipulación: al partir de `lerobot/pi05_base` y requerir solo 30.000 pasos con batch 8, sirve como plantilla para entrenar políticas propias con datasets pequeños (250 episodios).
- Investigación en imitación visual-motora: permite reproducir experimentos de VLA sobre hardware asequible (SO-100/SO-101) y comparar con el modelo base.
- Prototipado de pipelines de evaluación robótica: el comando de rollout con `--duration` y `--strategy.type=base` facilita pruebas rápidas sin grabación de episodios.
- Docencia y formación en robótica de imitación: el flujo completo (grabar dataset, entrenar, desplegar) está documentado en las guías de LeRobot enlazadas en la model card.
- Benchmark interno de generalización: al ser un fine-tuning sobre cuatro tareas concretas, permite medir la degradación o transferencia respecto a π₀.₅ base en posiciones de objetos, iluminación y distractores (aunque el autor no reporta resultados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita: «No evaluation results have been provided for this policy yet».

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143 millones de parámetros en safetensors (9,4 GB de repo), la inferencia en precisión completa requeriría del orden de 8-10 GB solo para pesos, más activaciones y buffers de visión; en cuantización de 8 bits podría reducirse aproximadamente a la mitad, pero no se confirman cuantizaciones soportadas.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos, sería plausible en GPUs con 12-16 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de política robótica).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jlbrockett/pi05_sponge_marker_cup_cube | 4.143.404.816 | no disponible | VLA fine-tuned, 4 tareas | apache-2.0 | Hugging Face (59 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA base π₀.₅ | no disponible en la información | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA predecesor | no disponible en la información | OpenPI / Physical Intelligence |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor no ha publicado ninguna evaluación real: se desconoce la tasa de éxito de las cuatro tareas.
- El modelo está entrenado para un robot concreto (`so_follower`) y cámaras concretas (`handeye`, `front`); los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento o el rollout fallará.
- Generalización limitada a las cuatro tareas del dataset; no hay evidencia de transferencia a objetos, posiciones o iluminación nuevos.
- Riesgo de sobreajuste al dataset de 250 episodios y 30.000 pasos de entrenamiento.
- No se documentan sesgos, pero al ser un modelo visual puede verse afectado por condiciones de iluminación y oclusiones no representadas en los datos.
- Licencia apache-2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el método π₀.₅ pueden tener condiciones adicionales no detalladas en esta ficha; conviene verificar la licencia del modelo base y la del repositorio OpenPI.
- Sin datos de cuantización ni de requisitos de VRAM, el despliegue en producción requiere validación empírica previa.
- El repositorio tiene 59 descargas y 0 likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jlbrockett/pi05_sponge_marker_cup_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/Jlbrockett/sponge_marker_cup_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jlbrockett/sponge_marker_cup_cube
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
