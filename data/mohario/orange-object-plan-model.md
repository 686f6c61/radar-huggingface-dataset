# mohario/orange-object-plan-model

## Resumen

`mohario/orange-object-plan-model` es un modelo de visión-lenguaje-acción (VLA) para robótica, obtenido por fine-tuning de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence. Está entrenado para controlar un robot UR5e en dos tareas concretas de manipulación: recoger un objeto naranja y dejarlo caer en un embudo. El modelo consume tres vistas RGB de 224×224 píxeles (cámara base y dos cámaras de muñeca) más un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones.

Se trata de un modelo de política de imitación, no de un LLM: no genera texto ni mantiene conversaciones, sino que traduce observaciones visuales y propioceptivas en comandos de control a 30 FPS. Su relevancia es práctica para quien trabaje con LeRobot y quiera replicar el flujo completo de entrenamiento y despliegue de π₀.₅ sobre hardware UR5e, o adaptar el modelo base a una tarea propia.

El repositorio ocupa 9,4 GB y contiene 4.143.404.816 parámetros en formato safetensors. La licencia es Apache 2.0 y la librería de referencia es `lerobot` 0.6.1. No hay resultados de evaluación publicados ni datos de idiomas, ya que no es un modelo lingüístico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, implementación LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de política robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | `ur5e` |
| Cámaras de entrada | `base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb` (3×224×224 cada una) |
| Estado de entrada | `observation.state` de forma `(7,)` |
| Acción de salida | `action` de forma `(7,)` |
| Tamaño del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅ (Pi05), un VLA de Physical Intelligence diseñado para generalización en entornos abiertos. La implementación procede del repositorio OpenPI y se ha adaptado a LeRobot. La arquitectura combina percepción visual multicámara con un vector de estado propioceptivo y emite acciones continuas de 7 dimensiones, típicas de un brazo manipulador de 6 grados de libertad más pinza. No se detalla en la información disponible la composición interna del transformer ni el número de tokens de entrenamiento del modelo base.

El fine-tuning se realizó sobre el dataset `mohario/orange-object-plan`, con 720 episodios, 99.376 frames y 30 FPS. Las tareas registradas son "pick up the orange object" y "drop the orange object into the funnel". La configuración de entrenamiento fue de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, usando LeRobot 0.6.1. No se especifica si hubo RLHF, DPO ni otras fases de alineamiento, algo esperable en un modelo de imitación robótica.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un UR5e a partir de observaciones visuales y de estado.
- Percepción visual multicámara: procesa simultáneamente cámara base y dos cámaras de muñeca a 224×224.
- Ejecución de tareas de pick-and-place: entrenado específicamente para recoger un objeto naranja y depositarlo en un embudo.
- Seguimiento de instrucciones de tarea en lenguaje natural acotado: el campo `--task` de LeRobot permite indicar la tarea ("pick up the orange object").
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso textual, capacidades multilingües ni modos de "thinking"; no es un modelo de lenguaje.

## Casos de uso

- Replicación de un pipeline de imitación robótica: sirve como referencia completa para entrenar y desplegar una política π₀.₅ sobre un UR5e con LeRobot, usando el dataset y la configuración publicados.
- Automatización de pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un objeto y soltarlo en un embudo, útil para prototipos de manipulación en entornos controlados.
- Base para fine-tuning en tareas propias: al partir de `lerobot/pi05_base` con la receta documentada, se puede adaptar a nuevas tareas de manipulación con un dataset propio.
- Evaluación de generalización de π₀.₅: permite medir cómo se comporta el modelo base en un entorno y objetos concretos, aunque el autor no haya publicado métricas de éxito.
- Docencia y formación en VLA: ejemplo reproducible de extremo a extremo (grabación de datos, entrenamiento, rollout) para cursos de robótica e IA.
- Investigación en imitación con múltiples cámaras: el uso de tres vistas RGB permite estudiar el efecto de la percepción multi-cámara en tareas de precisión.
- Integración en bancos de pruebas de LeRobot: sirve como política de referencia para validar versiones de la librería y del hardware UR5e.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros en safetensors (9,4 GB en el repositorio), una estimación orientativa en FP16 sería de aproximadamente 8-9 GB de pesos, pero no se confirma en la documentación.
- GPU recomendadas: no disponibles. LeRobot permite `--policy.device=cuda`; no se especifican modelos concretos de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de pesos, cabría en GPUs con 12-16 GB o más en FP16, pero no hay dato oficial.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se indica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Robot | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `mohario/orange-object-plan-model` | 4.143.404.816 | VLA π₀.₅ fine-tuned | ur5e | Apache 2.0 | No |
| `lerobot/pi05_base` | no disponible | VLA π₀.₅ base | genérico | no disponible en esta ficha | no disponible |
| π₀ (Pi0) de Physical Intelligence | no disponible | VLA predecesor | genérico | no disponible en esta ficha | no disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto ni resultados de benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado solo para dos tareas ("pick up the orange object" y "drop the orange object into the funnel") y para un robot UR5e concreto; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un UR5e y tres cámaras con los nombres e índices correctos (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`); un cambio de montaje o calibración puede degradar el comportamiento.
- Dataset pequeño y específico: 720 episodios y 99.376 frames en un único entorno; probable sobreajuste a posiciones, iluminación y objetos del dataset.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitación, puede producir comandos erráticos fuera de la distribución de entrenamiento.
- Sin soporte lingüístico ni multilingüe: no es un modelo de texto; el campo `--task` solo admite las instrucciones para las que fue entrenado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base `lerobot/pi05_base`.
- Sin datos de cuantización: no se documentan versiones GGUF, INT8 ni INT4, lo que limita el despliegue en hardware de bajos recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohario/orange-object-plan-model
- Dataset de entrenamiento: https://huggingface.co/datasets/mohario/orange-object-plan
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mohario/orange-object-plan
