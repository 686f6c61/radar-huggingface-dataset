# fecasado/gfm-cubes-21c2

## Resumen

gfm-cubes-21c2 es una política de aprendizaje por imitación para robótica desarrollada por el usuario fecasado y publicada en HuggingFace Hub. Se trata de un modelo de tipo gaze_flow_matching (flow matching aplicado a políticas de robot) entrenado con la librería LeRobot de HuggingFace. Con 75.280.346 parámetros (~75 M), está orientado a control robótico de manipulación, concretamente a una tarea de transferencia de cubos a cestas, según se deduce del dataset de entrenamiento asociado (fecasado/Ncubes-to-Nbaskets-320x240) y del nombre del modelo (cubes).

No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural. Su función es mapear observaciones (imágenes de cámara a resolución 320x240 y estado del robot) a acciones de control, siguiendo el paradigma de las políticas visomotoras. Su relevancia radica en ser un ejemplo de aplicación de técnicas de flow matching al control robótico dentro del ecosistema LeRobot, una línea de investigación activa para mejorar la estabilidad y precisión de las políticas de imitación frente a enfoques clásicos como ACT o Diffusion Policy.

La model card publicada es mínima y no incluye detalles sobre la arquitectura interna, la composición del dataset, el número de episodios de entrenamiento ni resultados de evaluación. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_flow_matching (política de flow matching para robótica, sobre LeRobot) |
| Parametros totales | 75.280.346 (~75 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (política visomotora; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplicable (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una política de tipo gaze_flow_matching, entrenada y publicada mediante LeRobot (github.com/huggingface/lerobot). La etiqueta gaze_flow_matching sugiere el uso de flow matching (una familia de modelos generativos basados en campos de flujo, alternativa a los modelos de difusión) aplicado a la predicción de acciones, con alguna forma de integración de información de mirada (gaze) como señal adicional. No se detalla en la model card la arquitectura concreta de la red (backbone visual, encoder de estado, cabezal de acción), ni el número de capas o la dimensión de las representaciones.

Tampoco se especifican los datos de entrenamiento más allá del dataset asociado, fecasado/Ncubes-to-Nbaskets-320x240, que define una tarea de manipulación (transferencia de cubos a cestas) a resolución de 320x240. Se desconoce el número de episodios, la composición exacta del dataset, si hubo etapas de ajuste fino o regularización, y cualquier innovación técnica adicional más allá de lo indicado por el nombre de la arquitectura.

## Capacidades

- Control robótico por imitación: genera acciones de control a partir de observaciones visuales y de estado del robot.
- Manipulación tipo pick-and-place: entrenada específicamente para la tarea de mover cubos a cestas (según el dataset Ncubes-to-Nbaskets).
- Entrada multimodal: procesa imágenes de cámara (320x240) y estado del robot, según el pipeline de robótica de LeRobot.
- Integración con LeRobot: compatible con los flujos de entrenamiento (lerobot-train) y evaluación/ejecución (lerobot-record) de la librería.
- Ejecución en robots de tipo SO-100 follower (la model card incluye un ejemplo de evaluación con robot.type=so100_follower).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión general ni de audio; su percepción visual está limitada a la tarea para la que fue entrenada.

## Casos de uso

- Manipulación pick-and-place en entornos controlados: la política puede ejecutar la tarea de transferir cubos a cestas capturando imágenes a 320x240 y emitiendo comandos de actuador, adecuada para celdas de trabajo con objetos y posiciones similares a los del entrenamiento.
- Investigación en flow matching para robótica: sirve como referencia reproducible dentro de LeRobot para estudiar políticas basadas en campos de flujo frente a alternativas como ACT o Diffusion Policy.
- Punto de partida para ajuste fino: al estar en formato safetensors y seguir la convención de LeRobot, puede reentrenarse con un dataset propio (por ejemplo, otra tarea de clasificación o apilado) partiendo de estos pesos.
- Evaluación y benchmarking interno: útil para comparar el comportamiento de una política de flow matching con otras políticas de la misma familia en un banco de pruebas con el robot SO-100.
- Docencia y demostraciones: ejemplo didáctico de extremo a extremo (dataset, entrenamiento y ejecución) con LeRobot para cursos de aprendizaje por imitación.
- Prototipado de pipelines de datos robóticos: el dataset asociado (320x240) y la política permiten practicar la captura, curado y reentrenamiento de datos de demostración.
- Integración en bucles de control real: con la latencia adecuada, puede desplegarse en robots que requieran inferencia en tiempo real, siempre que el hardware cumpla los requisitos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparativas cuantitativas frente a otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75 M de parámetros, los pesos ocupan aproximadamente 300 MB en fp32 y unos 150 MB en fp16/bf16. A esto hay que sumar el coste de las activaciones y del backbone visual, por lo que conviene reservar varios cientos de MB adicionales. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente desde el punto de vista de memoria. Para control en tiempo real se recomienda una GPU con buena capacidad de cómputo y baja latencia (por ejemplo, RTX 3060 o superior).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090, etc.), dado el reducido tamaño del modelo.
- Opciones de despliegue: el flujo nativo es LeRobot (lerobot-train para entrenamiento y lerobot-record para evaluación/ejecución). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica.
- Latencia y throughput: no disponibles. Para control robótico en tiempo real, la frecuencia de inferencia debe ser suficiente para el bucle de control del robot (habitualmente decenas de hercios), pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gfm-cubes-21c2 | Política flow matching (LeRobot) | 75.280.346 | no aplicable | Apache 2.0 | HuggingFace |
| ACT (Action Chunking Transformer) | Política de imitación (LeRobot) | no disponible | no aplicable | no disponible | Integrada en LeRobot |
| Diffusion Policy | Política de difusión (LeRobot) | no disponible | no aplicable | no disponible | Integrada en LeRobot |
| SmolVLA | Política VLA (LeRobot) | no disponible | no aplicable | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas políticas en la información proporcionada. La comparativa es estructural (categoría, librería y licencia); los recuentos de parámetros y licencias de las alternativas no están confirmados en la documentación consultada.

## Limitaciones y advertencias

- Especificidad de tarea: la política está entrenada para una tarea concreta (cubos a cestas) y un entorno y resolución determinados (320x240); probablemente no generaliza a otras tareas, objetos o configuraciones de cámara.
- Ausencia de datos de evaluación: no hay tasas de éxito ni métricas publicadas, por lo que se desconoce su fiabilidad real en producción.
- Sesgos de datos: al depender de un único dataset de demostración, heredará los sesgos y limitaciones de las demostraciones (iluminación, posiciones, materiales, operador).
- Riesgo de fallo silencioso: como toda política de imitación, puede producir acciones incorrectas sin señal de error explícita, lo que exige supervisión y mecanismos de seguridad en el robot.
- Documentación mínima: la model card indica explícitamente "Model type not recognized" y no describe arquitectura, dataset ni hiperparámetros, lo que dificulta la reproducibilidad.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se mantengan los avisos de copyright y de licencia; conviene revisar también las condiciones del dataset asociado.
- Uso responsable: en aplicaciones robóticas reales debe combinarse con límites de seguridad física y validación en entornos controlados antes de cualquier despliegue con personas cerca.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fecasado/gfm-cubes-21c2
- Dataset asociado: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas (il_robots): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
