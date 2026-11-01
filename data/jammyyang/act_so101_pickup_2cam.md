# jammyyang/act_so101_pickup_2cam

## Resumen

`jammyyang/act_so101_pickup_2cam` es una política de aprendizaje por imitación entrenada con el método Action Chunking with Transformers (ACT) y empaquetada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea robótica concreta de manipulación —recoger un objeto— sobre un robot de tipo `so_follower` (familia SO-101) equipado con dos cámaras (frontal y de muñeca). No es un modelo de lenguaje: es una política visomotora que mapea observaciones (estado articular de 6 dimensiones e imágenes RGB de 480x640) a acciones de 6 dimensiones.

El modelo tiene 51.668.614 parámetros en formato safetensors (unos 0,2 GB de repositorio) y se entrenó sobre 53 episodios teleoperados que suman 24.972 fotogramas a 30 FPS, todos ellos con la instrucción "Pick up the object". La relevancia actual es la de un ejemplo canónico de flujo de trabajo de robótica open source: datos teleoperados, entrenamiento reproducible con LeRobot 0.6.2 y despliegue directo con `lerobot-rollout` sobre hardware de bajo coste.

La licencia Apache 2.0 permite reutilización comercial y modificación, aunque el alcance práctico del modelo está acotado a la tarea y al robot con los que fue entrenado. No se han publicado resultados de evaluación en robot real ni benchmarks estandarizados en la información disponible, por lo que debe tratarse como una política experimental o de referencia, no como un componente validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT); transformer con codificador visual y decodificador de acciones, predicción de chunks de acción |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por chunk de acción, sin especificar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso, el modelo predice un chunk de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política consume `observation.state` con forma `(6,)` y dos flujos visuales `observation.images.front` y `observation.images.wrist`, ambos de `(3, 480, 640)`, y produce una acción de forma `(6,)`. La arquitectura combina un codificador de imágenes con un transformer que fusiona estado y visión para generar las acciones; el número exacto de capas y dimensiones ocultas no se detalla en la model card.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `jammyyang/so101_pickup_2cam_merged`: 53 episodios, 24.972 fotogramas a 30 FPS, una única tarea ("Pick up the object"). La configuración reportada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni datos sintéticos; se trata de aprendizaje supervisado puro a partir de demostraciones teleoperadas. Tampoco se especifican aumentos de datos, composición exacta de escenas ni variabilidad de posiciones de objetos.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de 6 dimensiones (articulaciones del `so_follower`) a partir de estado y dos cámaras.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas de movimiento de forma coherente.
- Fusión multimodal de estado propioceptivo e imágenes RGB de dos puntos de vista (frontal y muñeca).
- Ejecución de una tarea concreta de picking ("Pick up the object") sobre el robot SO-101.
- Integración nativa con el ecosistema LeRobot: carga directa con `lerobot-rollout` y entrenamiento reproducible con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Recogida de objetos en laboratorio: la política ejecuta la tarea "Pick up the object" sobre un SO-101 calibrado, útil como base para experimentos de imitación con dos cámaras y estado articular de 6 ejes.
- Prototipado de pipelines de aprendizaje por imitación: sirve como referencia para validar la cadena completa de LeRobot (grabación, entrenamiento, rollout) antes de escalar a datasets mayores.
- Docencia y formación en robótica: ejemplo reproducible de ACT con configuración de entrenamiento documentada (100.000 pasos, batch 8, lr 1e-05), adecuado para prácticas guiadas.
- Benchmark interno de hardware de bajo coste: permite medir latencia y estabilidad de una política ACT sobre un robot económico con dos cámaras USB a 30 FPS.
- Punto de partida para fine-tuning: al estar en Apache 2.0 y safetensors, puede reentrenarse con `lerobot-train` sobre datasets propios de tareas similares de picking.
- Pruebas de robustez visual: al usar cámara frontal y de muñeca, facilita experimentos sobre sensibilidad a iluminación, oclusiones y cambios de posición del objeto.
- Integración en entornos de simulación o gemelos digitales: la política puede evaluarse en simuladores compatibles con LeRobot antes de desplegarla en el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota explícita: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors (fp32), el peso ronda los 0,2 GB, por lo que la huella de memoria del modelo es reducida y el cuello de botella será el procesamiento de dos imágenes de 480x640 a 30 FPS.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con suficiente memoria para el codificador visual debería poder ejecutar la política; se recomienda al menos una RTX 3060/4060 o superior, aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; la viabilidad real depende del pipeline de visión y de la latencia objetivo a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con `--policy.path=jammyyang/act_so101_pickup_2cam`; entrenamiento con `lerobot-train` y `--policy.type=act`. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El sistema opera a 30 FPS en la captura de datos, pero no se reporta la latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jammyyang/act_so101_pickup_2cam | ACT (LeRobot) | 51,7 M | no aplica | Pick up the object (SO-101, 2 cámaras) | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT (LeRobot) | variable según checkpoint | no aplica | Manipulación teleoperada | Apache 2.0 (típicamente) | Hugging Face / LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | variable | no aplica | Manipulación visomotora | variable | Hugging Face / LeRobot |
| Políticas VLA (p. ej. familias open VLA) | Vision-Language-Action | cientos de millones a miles de millones | variable | Instrucciones en lenguaje + acción | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 53 episodios de una única tarea y un único robot, la política está fuertemente sesgada hacia las posiciones, iluminación y objetos vistos en el dataset; la generalización fuera de esa distribución es incierta.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras cuando la observación se aleja de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural más allá de la tarea fija "Pick up the object". No hay soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones, pero el autor no ofrece garantías; el modelo se distribuye "tal cual".
- Caveats para producción: no hay evaluación publicada en robot real, ni tasas de éxito, ni pruebas de robustez. El despliegue requiere calibración del SO-101, puertos y cámaras correctos, y nombres de cámara que coincidan con las claves de observación (`front`, `wrist`).
- Dependencia de versión: entrenado con LeRobot 0.6.2; cambios de API en versiones posteriores pueden requerir adaptaciones.
- Sin datos de seguridad: no se documentan paradas de emergencia, límites de par ni protocolos de seguridad física; deben implementarse a nivel de sistema robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jammyyang/act_so101_pickup_2cam
- Dataset de entrenamiento: https://huggingface.co/datasets/jammyyang/so101_pickup_2cam_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jammyyang/so101_pickup_2cam_merged
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
