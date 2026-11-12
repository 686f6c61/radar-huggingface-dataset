# nberezny/act_hybwide_wp

## Resumen

`nberezny/act_hybwide_wp` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. La ha entrenado el usuario nberezny y la ha subido al Hub de Hugging Face empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de dos cámaras y del estado de las articulaciones, predice secuencias cortas de acciones (action chunks) para un brazo robótico Franka Panda en simulación.

El modelo resuelve una tarea concreta de manipulación: recoger un cubo rojo y colocarlo sobre un cuadrado azul. Se ha entrenado por imitación a partir de 800 episodios teleoperados (2400 frames a 20 FPS) del dataset `nberezny/franka_pick_place_hybwide_wp`. La arquitectura es un transformer con codificador visual y decodificador de acciones, con 51.583.627 parámetros totales y un peso en safetensors de aproximadamente 0,4 GB.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabación de datos, entrenamiento con `lerobot-train`, publicación en el Hub y despliegue con `lerobot-rollout`. No aporta resultados de evaluación publicados ni una licencia declarada, por lo que debe tratarse como una política experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.583.627 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; recibe una instrucción de tarea fija en texto) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería lerobot) |
| Entradas | `observation.images.overhead` (3, 240, 320), `observation.images.wrist` (3, 240, 320), `observation.state` (17,) |
| Salidas | `action` (11,) |
| Tipo de robot | `franka_panda_sim_hybrid_wp` |
| Dataset de entrenamiento | `nberezny/franka_pick_place_hybwide_wp` (800 episodios, 2400 frames, 20 FPS) |
| Pasos de entrenamiento | 50.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La implementación de LeRobot combina un codificador visual (para las dos cámaras, `overhead` y `wrist`, a resolución 240x320) con un transformer que fusiona las características visuales, el estado de 17 dimensiones del robot y una representación de la instrucción de tarea, y emite una acción de 11 dimensiones. El modelo tiene 51.583.627 parámetros y se distribuye en safetensors dentro del ecosistema LeRobot.

El entrenamiento se realizó con `lerobot-train` durante 50.000 pasos, con batch size 8, optimizador AdamW y learning rate 1e-05, sobre 800 episodios teleoperados de la tarea "Pick up the red cube and place it on the blue square" (2400 frames a 20 FPS). La model card no documenta el uso de RLHF, DPO ni ningún refinamiento posterior al aprendizaje por imitación, ni detalla la composición exacta del dataset más allá del número de episodios, frames y tasa de captura. Tampoco se especifica si se aplicaron aumentos de datos, variaciones de posición de objetos o cambios de iluminación durante la recogida.

## Capacidades

- Control visomotor de un brazo Franka Panda en simulación (`franka_panda_sim_hybrid_wp`) para una tarea de pick-and-place.
- Predicción de chunks de acción de 11 dimensiones a partir de dos vistas de cámara y del estado articular de 17 dimensiones.
- Ejecución condicionada por una instrucción de tarea en texto fija ("Pick up the red cube and place it on the blue square").
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout` y visualización del dataset en Spaces.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, generación de código, visión general, audio ni modo de pensamiento. Es exclusivamente una política de robótica.

## Casos de uso

- **Reproducción de un pipeline de imitación de extremo a extremo:** sirve como referencia para validar la instalación de LeRobot, la grabación de datos con `lerobot-rollout` y el entrenamiento con `lerobot-train` antes de abordar tareas propias.
- **Docencia y formación en robótica de manipulación:** permite mostrar en un entorno simulado cómo una política ACT transforma observaciones visuales y proprioceptivas en acciones articulares, con un coste computacional bajo (51,6 M de parámetros, 0,4 GB).
- **Punto de partida para fine-tuning en tareas de pick-and-place:** el checkpoint puede reutilizarse como inicialización para tareas similares con el mismo robot y cámaras, sustituyendo el dataset por uno propio.
- **Evaluación de infraestructura de inferencia robótica:** útil para medir latencia y throughput de `lerobot-rollout` con dos cámaras a 20 FPS en una GPU concreta antes de escalar a políticas mayores.
- **Pruebas de integración con el simulador Franka:** valida la cadena de calibración, nombres de cámaras y claves de observación (`observation.images.overhead`, `observation.images.wrist`, `observation.state`) en un robot simulado.
- **Generación de datos sintéticos de demostración:** combinado con el dataset original, permite comparar distribuciones de acciones y detectar desviaciones entre la política entrenada y las trayectorias teleoperadas.
- **Prototipado rápido de tareas de manipulación en investigación:** al ser un modelo pequeño y con licencia por determinar, es adecuado para experimentos académicos internos, no para despliegues comerciales sin aclarar la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la nota literal "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real ni en simulación, ni comparaciones con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia:** el modelo tiene 51,6 M de parámetros y pesa unos 0,4 GB en safetensors; en FP32 ocupa aproximadamente 0,2 GB de pesos y en FP16 unos 0,1 GB. Sumando activaciones de las dos cámaras a 240x320 y buffers de inferencia, el consumo realista se sitúa en el rango de 1 a 2 GB de VRAM.
- **GPU recomendadas:** cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para esta carga, la GPU de gama de consumo es más que suficiente.
- **¿Cabe en GPU de consumo?** Sí, en cualquier GPU de consumo moderna con 4 GB o más de VRAM, e incluso en CPU para inferencia a baja frecuencia.
- **Opciones de despliegue:** `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=nberezny/act_hybwide_wp`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput:** no disponibles. La model card no reporta tiempos de inferencia ni frecuencia de control alcanzable; el dataset se capturó a 20 FPS, pero no se especifica si la política se ejecuta a esa misma tasa.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `nberezny/act_hybwide_wp` | ACT | 51,6 M | 2 cámaras 240x320 + estado (17,) | Pick-and-place en Franka sim | no disponible | Hub de Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | ACT | del orden de decenas de millones (según configuración) | cámaras + estado | Tareas de manipulación diversas | según repositorio | Hub de Hugging Face (LeRobot) |
| Políticas Diffusion Policy | Diffusion Policy | no disponible | cámaras + estado | Manipulación visomotora | según implementación | Repositorios de investigación |
| Políticas basadas en VLA (p. ej. RT-2, OpenVLA) | VLA | miles de millones | imágenes + instrucción en lenguaje | Manipulación generalista | varía | Principalmente investigación |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado métricas de éxito para esta política. Las filas de Diffusion Policy y VLA se incluyen como referencia categórica; sus cifras concretas no se detallan aquí para no inventar datos.

## Limitaciones y advertencias

- **Sin licencia declarada:** la model card indica "More Information Needed". No debe usarse en producción ni en contextos comerciales hasta que el autor aclare la licencia.
- **Sin evaluación publicada:** no hay tasas de éxito ni en simulación ni en robot real, por lo que se desconoce su robustez fuera de las condiciones exactas de entrenamiento.
- **Tarea única y muy concreta:** solo se ha entrenado para "Pick up the red cube and place it on the blue square" en un Franka Panda simulado; no generaliza a otras tareas, objetos ni robots sin reentrenamiento.
- **Dependencia del entorno de simulación:** el tipo de robot es `franka_panda_sim_hybrid_wp`; el uso en hardware físico requeriría validación adicional y posiblemente recalibración de cámaras y estados.
- **Sesgos de los datos de demostración:** al ser aprendizaje por imitación sobre 800 episodios teleoperados, la política hereda las posiciones, iluminación y estilo de los demostradores; no se documentan variaciones de posición, distractores ni cambios de iluminación.
- **Riesgo de alucinación en el sentido de acciones incorrectas:** como toda política de imitación, puede producir acciones fuera de distribución ante observaciones novedosas, con riesgo de colisiones o movimientos no seguros en un robot real.
- **Sin soporte multilingüe ni de lenguaje natural:** la instrucción de tarea es una cadena fija; no interpreta instrucciones nuevas ni variaciones de fraseo.
- **Ecosistema restringido:** depende de LeRobot 0.7.0 y de la CLI `lerobot-rollout`; no hay formatos alternativos (GGUF, ONNX) publicados.
- **Madurez:** 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-11; es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_hybwide_wp
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/franka_pick_place_hybwide_wp
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/franka_pick_place_hybwide_wp
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
