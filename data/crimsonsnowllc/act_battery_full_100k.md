# CrimsonSnowLLC/act_battery_full_100k

## Resumen

ACT battery picker (SO-101) es una política de imitación basada en el algoritmo Action Chunking Transformer (ACT) entrenada para controlar un brazo robótico SO-101. El modelo resuelve una tarea concreta de manipulación: localizar una batería entre otros objetos sobre una mesa, agarrarla y depositarla en una caja. Lo desarrolla el equipo CrimsonSnow durante el hackathon LeRobot Bilbao (segunda edición, 20-22 de noviembre de 2026) y se publica como pesos entrenados desde cero con LeRobot 0.7.0.

Técnicamente es un transformer de 51,6 millones de parámetros entrenado con aprendizaje por imitación supervisado sobre 281 episodios teleoperados (184.446 fotogramas a 30 fps) con dos cámaras: una cenital y otra en la muñeca. El entrenamiento completo requirió 100.000 pasos con batch de 8 y tasa de aprendizaje de 1e-5, lo que se tradujo en 1 hora y 57 minutos sobre una única GPU A100.

Su relevancia es doble: por un lado, demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con el stack abierto LeRobot; por otro, incorpora un mecanismo de verificación automática (un clasificador ResNet-18 que comprueba si la batería ha quedado en la caja) que permite reintentos autónomos sin intervención humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.7.0 |
| Entradas | `observation.images.front` (cenital) y `observation.images.gripper` (muñeca), 640x480 |
| Dataset de entrenamiento | CrimsonSnowLLC/battery-full-dataset (281 episodios, 184.446 fotogramas, 30 fps) |
| Hardware de entrenamiento | 1x A100, 1 h 57 min, 100.000 pasos, batch 8, lr 1e-5 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking Transformer), presentado en el artículo arXiv:2304.13705. ACT es una arquitectura de aprendizaje por imitación que predice bloques de acciones futuras (chunks) en lugar de una sola acción por paso, lo que reduce el error acumulado y suaviza la ejecución. Combina un codificador visual sobre las imágenes de las dos cámaras con un transformer que genera las secuencias de acciones del brazo.

El entrenamiento se realizó desde cero con LeRobot 0.7.0 sobre el dataset propio `battery-full-dataset`: 281 episodios teleoperados que suman 184.446 fotogramas a 30 fps, capturados con cámara cenital y de muñeca. Se ejecutaron 100.000 pasos de optimización con batch de 8 y tasa de aprendizaje de 1e-5, completados en 1 hora y 57 minutos en una A100 mediante Hugging Face Jobs. No se documenta uso de RLHF ni DPO, algo esperable en una política de imitación supervisada. Como innovación de despliegue, el sistema incluye un verificador externo (ResNet-18 entrenado en 8 minutos sobre 4.000 fotogramas etiquetados automáticamente a partir de la señal del gripper, con 99,8 % de acierto en episodios no vistos) que valida el resultado de cada ejecución y dispara reintentos.

## Capacidades

- Manipulación robótica de pick-and-place: detecta una batería entre otros objetos, la agarra y la deposita en una caja.
- Control de brazo SO-101 a partir de observaciones visuales de dos cámaras (cenital y muñeca).
- Predicción de chunks de acciones, lo que produce trayectorias suaves y reduce el error acumulado.
- Ejecución autónoma con reintentos: integrada con el verificador ResNet-18 del equipo, repite la tarea si el objeto no ha quedado en la caja.
- Generalización limitada a las posiciones registradas: funciona en el área de trabajo cubierta por el dataset y falla en dos huecos entre las marcas exteriores, cubiertos por la versión fine-tuned.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio; es una política de control específica de tarea.

## Casos de uso

- Clasificación y recogida de piezas en líneas de montaje: el modelo puede localizar un objeto concreto entre distractores sobre una superficie y depositarlo en un contenedor, replicando el flujo de la tarea de batería en entornos con objetos similares.
- Prototipado rápido de robots de bajo coste: al ejecutarse sobre un SO-101 con LeRobot 0.7.0, sirve como base para validar pipelines de teleoperación, entrenamiento y despliegue en hardware asequible.
- Demostraciones autónomas en ferias y laboratorios: el bucle de reintento con verificación visual permite dejar el brazo funcionando sin supervisión durante exhibiciones.
- Generación de datos y evaluación de políticas: el dataset y los pesos sirven como referencia para comparar variantes de ACT, ajustes de hiperparámetros o estrategias de aumento de datos.
- Investigación en aprendizaje por imitación: caso de estudio reproducible de entrenamiento desde cero (100.000 pasos, ~2 horas en A100) para analizar el efecto del número de episodios y de la cobertura espacial.
- Base para fine-tuning en tareas de recogida específicas: la versión fine-tuned del propio equipo demuestra que se puede extender la cobertura del área de trabajo partiendo de estos pesos.
- Automatización de tareas de pick-and-place en laboratorios docentes: permite a estudiantes desplegar una política entrenada y analizar sus fallos sin necesidad de teleoperar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de una política robótica y no de un modelo de lenguaje. El autor reporta únicamente evaluaciones cualitativas y del verificador:

| Metrica | Resultado | Fuente |
|---|---|---|
| Acierto del verificador ResNet-18 en episodios no vistos | 99,8 % | Model card |
| Rendimiento de la política en pruebas del equipo | "claramente el mejor de los modelos candidatos"; falla solo en dos huecos del área de trabajo no registrados | Model card |
| Tiempo de entrenamiento | 1 h 57 min en 1x A100 (100.000 pasos, batch 8) | Model card |
| Tasa de exito de la politica | no disponible (sin metrica numerica publicada) | - |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros en safetensors el modelo es muy ligero (el repositorio completo ocupa 0,2 GB), por lo que debería caber holgadamente en GPUs de consumo, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con suficiente VRAM para LeRobot 0.7.0; el entrenamiento se realizó en una A100. Para inferencia en tiempo real se recomienda una GPU dedicada, aunque no se especifica el modelo mínimo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, pero no se confirma en la documentación.
- Opciones de despliegue: LeRobot 0.7.0 (`lerobot-rollout --policy.path=...`) o el repositorio del equipo (`so demo`, `so try`), disponible en Windows, macOS y Linux.
- Requisitos adicionales: cámaras `observation.images.front` y `observation.images.gripper` a 640x480, y la calibración del brazo con el archivo `so100_follower` de SenseCraft Robotics.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CrimsonSnowLLC/act_battery_full_100k | 51,6 M | no aplica | Pick-and-place de batería en SO-101 | no disponible | Hugging Face |
| CrimsonSnowLLC/act_battery_finetune_locations_2026-11-22_03-35-47 | no disponible | no aplica | Misma tarea, con cobertura ampliada del área de trabajo | no disponible | Hugging Face |
| Otras políticas ACT para LeRobot | variable | no aplica | Manipulación genérica | variable | Hugging Face / GitHub |

No se dispone de datos de benchmarks comparativos con otras políticas ACT o alternativas como Diffusion Policy en la información proporcionada.

## Limitaciones y advertencias

- Cobertura espacial limitada: el modelo falla en dos huecos del área de trabajo (entre las marcas exteriores) donde no se grabaron episodios; se recomienda usar la versión fine-tuned para esas zonas.
- Dependencia de la calibración: requiere el archivo de calibración `so100_follower` con el que se grabaron los datos; una calibración distinta puede degradar el rendimiento.
- Dependencia del hardware: diseñado específicamente para el brazo SO-101 y las cámaras cenital y de muñeca a 640x480; no es transferible directamente a otros robots o configuraciones de cámara.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- Sin datos de idiomas ni de sesgos: al no procesar lenguaje, no aplican sesgos lingüísticos, pero no se documentan sesgos visuales ni de generalización más allá de la evaluación cualitativa del equipo.
- Riesgo de fallo silencioso: la política puede no completar la tarea; el sistema de reintentos mitiga el problema, pero depende del verificador ResNet-18, que aunque reporta 99,8 % de acierto no es infalible.
- Sin métricas cuantitativas de éxito publicadas: la evaluación es cualitativa ("claramente el mejor de los candidatos"), lo que dificulta comparaciones rigurosas.
- Proyecto de hackathon: desarrollado en tres días, sin garantías de mantenimiento ni soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrimsonSnowLLC/act_battery_full_100k
- Dataset: https://huggingface.co/datasets/CrimsonSnowLLC/battery-full-dataset
- Versión fine-tuned: https://huggingface.co/CrimsonSnowLLC/act_battery_finetune_locations_2026-11-22_03-35-47
- Repositorio del equipo: https://github.com/SO-101-Hackathon/CrimsonSnow
- Artículo ACT: https://huggingface.co/papers/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
