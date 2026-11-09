# felsager/pi05_cube2cross_fast_tok_2

## Resumen

`felsager/pi05_cube2cross_fast_tok_2` es una política robótica de tipo VLA (Vision-Language-Action) publicada en Hugging Face por el usuario felsager, resultado de un fine-tuning de `lerobot/pi05_base`. Implementa la arquitectura FineART-VLA, que extiende el modelo π₀.₅ con una cabeza de lenguaje entrenada: el modelo predice en lenguaje su siguiente subtarea (System 2) y la ejecuta mediante un experto de acciones con flow matching (System 1), aplicando aislamiento de conocimiento para proteger el VLM preentrenado. Está pensado para control de robots manipuladores en tareas de pick-and-place.

El modelo se ha ajustado sobre el dataset `felsager/vla_cubes_cross_dr`, compuesto por 999 episodios y 510.363 fotogramas a 30 FPS, con cuatro tareas de recogida y colocación de cubos de colores sobre una cruz roja. El robot objetivo es un `ur5e_hand_e` con dos cámaras (`top` y `wrist`), y las observaciones son un vector de estado de 10 dimensiones más dos imágenes RGB de 3×480×640; la salida es un vector de acción de 10 dimensiones.

Es relevante como ejemplo práctico de despliegue de políticas VLA end-to-end en LeRobot 0.6.2, con un pipeline reproducible de entrenamiento e inferencia vía CLI (`lerobot-train`, `lerobot-rollout`). No obstante, se trata de un modelo de nicho, sin descargas ni likes en el momento de la consulta, sin resultados de evaluación publicados y con licencia Gemma, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FineART-VLA (π₀.₅ extendido con cabeza de lenguaje y experto de acciones flow-matching) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist |
| Entrada (estado) | observation.state (10,) |
| Entrada (visual) | observation.images.top (3, 480, 640), observation.images.wrist (3, 480, 640) |
| Salida | action (10,) |
| Libreria | lerobot 0.6.2 |
| Tamano del repo | 27,0 GB |
| Dataset de entrenamiento | felsager/vla_cubes_cross_dr (999 episodios, 510.363 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 5e-05 |
| Semilla | 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FineART-VLA descrita en la model card: un sistema dual que combina un VLM preentrenado con una cabeza de lenguaje entrenada (System 2), encargada de predecir la siguiente subtarea en lenguaje natural, y un experto de acciones basado en flow matching (System 1) que traduce esa subtarea en comandos motores de 10 dimensiones. La técnica de aislamiento de conocimiento ("knowledge insulation") protege el VLM preentrenado durante el ajuste, evitando el olvido catastrófico de las capacidades visuales y lingüísticas originales. El modelo parte de `lerobot/pi05_base`, que a su vez es una implementación de π₀.₅ en el ecosistema LeRobot.

El fine-tuning se realizó con 30.000 pasos, batch size 8, optimizador AdamW y learning rate 5e-05, semilla 0, sobre el dataset `felsager/vla_cubes_cross_dr`. Este dataset contiene 999 episodios y 510.363 fotogramas a 30 FPS, con cuatro tareas de pick-and-place (cubos verde, azul, amarillo y rojo sobre una cruz roja). No se especifica en la información disponible si hubo RLHF, DPO u otras fases de alineación adicionales, ni la composición exacta del corpus de preentrenamiento del modelo base.

## Capacidades

- Generación de subtareas en lenguaje natural (System 2) a partir de observaciones visuales y de estado.
- Ejecución de acciones motoras de 10 dimensiones mediante flow matching (System 1).
- Control de robots manipuladores UR5e con mano equipada (`ur5e_hand_e`).
- Procesamiento de dos flujos visuales simultáneos (cámara cenital y de muñeca) a 480×640.
- Tareas de pick-and-place guiadas por instrucción textual (cuatro tareas de cubos de colores sobre cruz roja).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-step reasoning: no disponible como capacidad general; el modelo implementa un razonamiento por subtareas en el dominio robótico.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo "thinking" en forma de predicción de subtarea en lenguaje; no se documentan visión general, audio ni otras modalidades fuera del pipeline robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo recoge un cubo de color y lo coloca sobre una cruz roja, usando las cámaras cenital y de muñeca para localizar el objeto y planificar la acción. Adecuado por su entrenamiento específico en estas cuatro tareas.
- Prototipado de políticas VLA con LeRobot: sirve como referencia reproducible para equipos que quieran entrenar sus propias políticas desde `lerobot/pi05_base` con el mismo pipeline (`lerobot-train`).
- Investigación en razonamiento jerárquico para robótica: el desdoblamiento System 2 / System 1 permite estudiar cómo la predicción de subtareas en lenguaje mejora la ejecución motora.
- Benchmarking de infraestructura de inferencia robótica: con 4.143 millones de parámetros y un repo de 27 GB, es útil para medir latencia y throughput de políticas VLA en GPUs de distinta gama.
- Docencia y demostraciones de imitación end-to-end: el comando `lerobot-rollout` permite ejecutar la política en un UR5e real con una configuración mínima de cámaras y puerto.
- Evaluación de técnicas de aislamiento de conocimiento: al derivar de π₀.₅ con una cabeza de lenguaje añadida, permite comparar el olvido catastrófico frente a fine-tunings convencionales.
- Integración en líneas de manipulación con objetos de color codificado: útil en entornos controlados donde la tarea se define por instrucción textual y la escena es similar a la del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143 millones de parámetros en safetensors (probablemente fp32 o bf16), una estimación orientativa en bf16 sería de unos 8-9 GB solo para pesos, más memoria para las dos imágenes de 480×640 y el estado; en fp32 se duplicaría. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs de 16-24 GB (RTX 4090, A5000, L4), pero el autor no lo especifica.
- ¿Cabe en consumer GPU?: probablemente sí en GPUs de 16 GB o más con bf16, pero no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para fine-tuning). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para una política robótica de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_fast_tok_2 | 4.143.404.816 | no disponible | Pick-and-place UR5e (4 tareas) | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la informacion | no disponible | Política VLA base π₀.₅ | no disponible en la informacion | Hugging Face (modelo base) |
| FineART-VLA (referencia Scale AI / Hugging Face) | no disponible en la informacion | no disponible | Política bimanual con subtareas en lenguaje | no disponible en la informacion | Referenciado en la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con cubos de cuatro colores sobre una cruz roja, el modelo probablemente no generaliza a otros objetos, colores o disposiciones.
- Riesgo de alucinación: en el componente de lenguaje (System 2) puede predecir subtareas incoherentes con la escena; no hay evaluación publicada que cuantifique este riesgo.
- Limitaciones de contexto o idioma: no se especifica longitud de contexto ni idiomas soportados; las instrucciones de tarea del dataset están en inglés.
- Restricciones de licencia: licencia `gemma`, sujeta a los términos de uso de Gemma, que imponen restricciones adicionales al uso comercial y a la redistribución. Verificar la política de Gemma antes de cualquier despliegue productivo.
- Sin resultados de evaluación: la model card no reporta tasa de éxito en robot real, por lo que no hay evidencia cuantitativa de rendimiento.
- Dependencia de hardware específico: entrenado para `ur5e_hand_e` con cámaras `top` y `wrist`; usar otro robot o configuración de cámaras invalida la política.
- Repo de 27 GB: requiere espacio de almacenamiento considerable y descarga lenta.
- Sin descargas ni likes: proyecto de nicho, sin comunidad que valide su funcionamiento.
- Fecha de creación futura (2026-11-09) en los metadatos: verificar la integridad del repositorio antes de confiar en él.
- Sin cuantizaciones publicadas: no hay GGUF ni otros formatos ligeros, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_fast_tok_2
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía FineART-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/fineart_vla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
