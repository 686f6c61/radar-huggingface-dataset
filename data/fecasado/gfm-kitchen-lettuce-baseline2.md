# fecasado/gfm-kitchen-lettuce-baseline2

## Resumen

GFM Kitchen Lettuce Baseline2 es una política robótica entrenada mediante imitación y publicada en Hugging Face por el usuario fecasado. El modelo implementa la técnica de gaze flow matching (GFM), una variante de flow matching condicionada por la mirada del operador, y se distribuye a través de la librería LeRobot de Hugging Face, que proporciona las utilidades de entrenamiento, evaluación y despliegue sobre robots reales.

El modelo está especializado en una tarea concreta de manipulación: el traslado de lechuga desde una cocina hasta un plato, tal y como indica el dataset asociado fecasado/lettuce-to-plate-320x240, con observaciones visuales de resolución 320x240. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política de control visuomotor que mapea observaciones (imágenes y estado del robot) a acciones de robot.

Con 75.216.858 parámetros (aproximadamente 75 millones) y un tamaño de repositorio de 0,3 GB en formato safetensors, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia es la de un artefacto de investigación reproducible: un baseline entrenado con LeRobot sobre un dataset propio, con licencia Apache 2.0 y descargas limitadas (30 en el momento de la consulta), lo que sugiere un uso experimental más que un despliegue en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze flow matching (política visuomotora de imitación; detalles internos no disponibles) |
| Parametros totales | 75.216.858 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo robótico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo LeRobot) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se denomina gaze_flow_matching y pertenece a la categoría de políticas de imitación de LeRobot. Flow matching es una familia de modelos generativos que aprenden un campo vectorial que transforma una distribución simple (por ejemplo, ruido gaussiano) en la distribución de acciones expertas; en el contexto robótico se emplea para generar trayectorias de acción multimodales. El prefijo "gaze" sugiere que el condicionamiento incluye información de la mirada del operador, aunque la model card no detalla cómo se incorpora esa señal ni qué arquitectura de red la procesa.

El entrenamiento se realizó con LeRobot sobre el dataset fecasado/lettuce-to-plate-320x240, que contiene episodios de demostración de la tarea de trasladar lechuga a un plato con observaciones de 320x240 píxeles. No se especifican en la información proporcionada el número de episodios, el número de tokens o pasos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en políticas de imitación). La model card es una plantilla sin completar ("Model type not recognized — please update this template"), por lo que los detalles de arquitectura, hiperparámetros y proceso de entrenamiento no están documentados.

## Capacidades

- Control visuomotor de un robot manipulador para la tarea de trasladar lechuga desde una cocina hasta un plato.
- Generación de trayectorias de acción mediante flow matching, lo que permite modelar distribuciones multimodales de acciones.
- Condicionamiento por mirada (gaze) según el nombre del modelo, aunque el mecanismo exacto no está documentado.
- Integración con el ecosistema LeRobot: entrenamiento con lerobot-train y evaluación con lerobot-record.
- Ejecución sobre robots compatibles con LeRobot (la model card menciona so100_follower en los ejemplos).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como baseline público para comparar variantes de gaze flow matching frente a otras políticas de LeRobot sobre el mismo dataset de lechuga a plato.
- Investigación en condicionamiento por mirada: permite estudiar si la señal de gaze mejora la precisión de la política en tareas de manipulación con objetos deformables como la lechuga.
- Evaluación de políticas en robot real: con lerobot-record y un so100_follower se pueden ejecutar episodios de evaluación y medir la tasa de éxito del traslado.
- Punto de partida para fine-tuning: al ser un checkpoint LeRobot con licencia Apache 2.0, se puede reentrenar sobre datasets propios de tareas culinarias o de manipulación similares.
- Docencia y formación en robótica de imitación: modelo pequeño (75 M de parámetros, 0,3 GB) que cabe en una GPU de consumo y permite demostrar el ciclo completo de entrenamiento y despliegue con LeRobot.
- Pruebas de integración de pipelines de datos: el dataset asociado de 320x240 y el modelo permiten validar flujos de captura, entrenamiento y evaluación antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 75,2 M de parámetros en safetensors (0,3 GB de repo), la inferencia en precisión nativa requiere del orden de 0,3-0,6 GB de VRAM, estimación orientativa no confirmada por el autor.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para la inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060, RTX 4060 o superiores, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (lerobot-train para entrenamiento y lerobot-record para evaluación/inferencia); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-lettuce-baseline2 | 75,2 M | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face (30 descargas) |
| Políticas ACT de LeRobot | no disponible | no aplica | sin datos comparables en la información | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas de imitación genéricas de LeRobot | no disponible | no aplica | sin datos comparables en la información | Apache 2.0 (LeRobot) | Hugging Face / GitHub |

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card es una plantilla sin completar: no documenta arquitectura, datos de entrenamiento, hiperparámetros ni procedimiento de evaluación.
- Especialización extrema: el modelo está entrenado para una única tarea (lechuga a plato) y no generalizará a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al entorno del dataset: cambios de iluminación, posición de objetos o del robot pueden degradar el rendimiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito ni comparación con baselines.
- Sesgos: no documentados; en robótica de imitación, los sesgos provienen de las demostraciones del operador y de la distribución del dataset.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede generar acciones no válidas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo no incluye garantías.
- Para producción: requiere validación en el robot y entorno objetivo; el número de descargas (30) y la ausencia de documentación sugieren que no es un artefacto maduro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-lettuce-baseline2
- Dataset asociado: https://huggingface.co/datasets/fecasado/lettuce-to-plate-320x240
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
