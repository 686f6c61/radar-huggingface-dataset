# mohario/orange-object-plan-v2-model

## Resumen

`mohario/orange-object-plan-v2-model` es un modelo de visión-lenguaje-acción (VLA) para robótica, resultado del ajuste fino de `lerobot/pi05_base`, el modelo π₀.₅ publicado por Physical Intelligence. El autor, mohario, lo ha entrenado con LeRobot 0.6.1 sobre un dataset propio de 880 episodios y 139.840 fotogramas a 30 FPS para resolver dos tareas concretas de manipulación con un brazo UR5e: recoger un objeto naranja y depositarlo en un embudo.

El modelo consume tres cámaras RGB de 224×224 (base y dos muñecas) más un vector de estado de 7 dimensiones, y produce un vector de acción de 7 dimensiones. Con 4.143.404.816 parámetros y un repositorio de 9,4 GB en safetensors, se distribuye bajo licencia Apache 2.0 y se ejecuta mediante `lerobot-rollout`.

Su relevancia es acotada: no es un modelo generalista, sino una política de imitación especializada en un entorno y una tarea muy concretos. Resulta útil como referencia de flujo de trabajo completo (grabación de datos, entrenamiento y despliegue) y como ejemplo de ajuste fino de π₀.₅ sobre hardware UR5e.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 9,4 GB) |
| Modelo base | `lerobot/pi05_base` |
| Tipo de robot | `ur5e` |
| Cámaras de entrada | `base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb` (3×224×224) |
| Entrada de estado | `observation.state` de forma (7,) |
| Salida de acción | `action` de forma (7,) |
| Framework | LeRobot 0.6.1 |
| Pasos de entrenamiento | 30.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 2,5e-05 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π₀.₅ de Physical Intelligence, un modelo VLA diseñado para generalización en entornos abiertos que evoluciona π₀. La implementación concreta procede del repositorio OpenPI de Physical Intelligence, adaptada por el equipo de LeRobot. No se detalla en la información disponible la composición interna del backbone (número de capas, dimensión oculta, mecanismo de atención ni estrategia de fusión visión-lenguaje-acción), por lo que esos datos deben consultarse en la documentación de π₀.₅.

El ajuste fino se realizó sobre el dataset `mohario/orange-object-plan-v2`, compuesto por 880 episodios y 139.840 fotogramas a 30 FPS, con dos tareas anotadas: "pick up the orange object" y "drop the orange object into the funnel". El entrenamiento empleó 30.000 pasos con batch size 8, AdamW y learning rate 2,5e-05 bajo LeRobot 0.6.1. No se especifica en la model card si hubo etapas de RLHF, DPO ni qué proporción de los datos corresponde a cada tarea.

## Capacidades

- Control robótico de manipulación extremo a extremo: mapea observaciones visuales y de estado a comandos de acción de 7 dimensiones para un UR5e.
- Percepción multi-cámara: procesa simultáneamente vista base y dos vistas de muñeca a 224×224 píxeles.
- Ejecución de tareas de picking y placing: recogida de un objeto naranja y depósito en un embudo.
- Condicionamiento por instrucción en lenguaje natural: acepta una descripción de tarea (`--task`) que guía la política.
- Despliegue en tiempo real a 30 FPS mediante `lerobot-rollout`.
- Ajuste fino adicional: puede reentrenarse con nuevos datasets siguiendo el flujo de LeRobot.
- No se documentan capacidades de tool calling, razonamiento multi-paso, diálogo multilingüe ni modos de pensamiento; el modelo es una política de imitación, no un asistente conversacional.

## Casos de uso

- Automatización de picking en línea de montaje: el modelo ejecuta la secuencia de aproximación, agarre y traslado del objeto naranja sobre un UR5e, integrándose en una celda robotizada con las tres cámaras calibradas.
- Depósito en tolva o embudo: útil en procesos de clasificación y vertido donde el robot debe colocar piezas en un receptáculo concreto, aprovechando la vista de muñeca para el alineamiento final.
- Base para ajuste fino en nuevas tareas de manipulación: al partir de `lerobot/pi05_base` y estar entrenado con el pipeline de LeRobot, sirve como punto de partida para reentrenar con datasets propios de otras piezas u objetos.
- Prototipado rápido de políticas de imitación: con 880 episodios y 30.000 pasos de entrenamiento, el flujo completo (grabación, entrenamiento, rollout) es reproducible en laboratorio en plazos cortos.
- Validación de hardware UR5e con LeRobot: el modelo permite verificar la cadena de calibración de cámaras, puerto del robot y frecuencia de control antes de escalar a tareas más complejas.
- Docencia e investigación en VLA: como ejemplo documentado de ajuste fino de π₀.₅ con métricas de entrenamiento y configuración completas, es adecuado para estudiar el comportamiento de políticas de imitación en entornos controlados.
- Benchmark interno de referencia: permite comparar el rendimiento de nuevas políticas sobre la misma tarea y el mismo robot, aunque el autor no haya publicado tasas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._", por lo que no existen tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros en safetensors (aproximadamente 8,3 GB en precisión de 16 bits), se requiere al menos una GPU con 16 GB de VRAM para cargar los pesos sin cuantizar; esta cifra es una estimación por tamaño de pesos, no un dato publicado por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo, encajan GPU de gama alta con 24 GB o más (RTX 4090, A100, H100) para inferencia en FP16.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) y modelos con 16 GB o más, aunque no hay confirmación oficial ni datos de latencia.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=mohario/orange-object-plan-v2-model` y `--strategy.type=base`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al tratarse de una política robótica y no de un LLM de texto.
- Latencia y throughput: no disponibles. El entrenamiento y la inferencia se plantean a 30 FPS según la frecuencia del dataset, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mohario/orange-object-plan-v2-model` | 4.143.404.816 | no disponible | Política VLA para UR5e (pick and place) | Apache 2.0 | Hugging Face, 0 descargas |
| `lerobot/pi05_base` | no disponible | no disponible | Modelo VLA base π₀.₅, generalista | no disponible en la información | Hugging Face |
| π₀ (Physical Intelligence) | no disponible | no disponible | Modelo VLA predecesor | no disponible en la información | OpenPI |

No se dispone de datos de rendimiento comparativo entre estas alternativas. La comparación se limita a parámetros, licencia y disponibilidad según la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para dos tareas ("pick up the orange object" y "drop the orange object into the funnel") sobre un UR5e con una configuración de cámaras concreta; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni ensayos documentados, por lo que se desconoce su fiabilidad real en producción.
- Dependencia del hardware: requiere un UR5e y tres cámaras con los nombres e índices exactos de las claves de observación (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`); cualquier cambio de montaje o calibración puede degradar el comportamiento.
- Riesgo de fallo silencioso: al ser una política de imitación sin mecanismos de verificación, puede ejecutar acciones incorrectas sin señal de error; se recomienda supervisión humana y paradas de seguridad.
- Sesgos de los datos: el dataset refleja posiciones, iluminación y condiciones concretas de grabación; no se documenta diversidad de escenarios ni objetos distractores.
- Idiomas: no se especifican idiomas soportados; el condicionamiento por tarea se realiza en inglés según los ejemplos de la model card.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base `lerobot/pi05_base` puede tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohario/orange-object-plan-v2-model
- Dataset de entrenamiento: https://huggingface.co/datasets/mohario/orange-object-plan-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mohario/orange-object-plan-v2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
