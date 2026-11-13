# hubnemo/so101_smolvla_exp12_exp5_mlp_targets

## Resumen

`hubnemo/so101_smolvla_exp12_exp5_mlp_targets` es una política de visión-lenguaje-acción (VLA) compacta obtenida mediante ajuste fino de `lerobot/smolvla_base`, el modelo base publicado por Hugging Face dentro del ecosistema LeRobot. El modelo resuelve una tarea robótica concreta de manipulación: coger un cubo morado y depositarlo en una caja de cartón, ignorando el resto de objetos, sobre un robot `so101_follower` con una única cámara frontal.

La arquitectura subyacente es SmolVLA, un modelo VLA compacto presentado en el artículo arXiv 2506.01844, diseñado para ejecutarse en hardware de consumo con costes computacionales reducidos. Este repositorio concreto es un adaptador (fine-tune) sobre el modelo base, entrenado con el dataset `Orellius/so101_sort_cubes_no_top` durante 15.000 pasos.

Es relevante ahora porque demuestra el flujo completo de imitación en robótica de bajo coste: un modelo pequeño, entrenado con 77 episodios y 54.777 frames a 30 FPS, desplegable en un robot de sobremesa. No obstante, se trata de un experimento de autor individual (hubnemo) sin resultados de evaluación publicados, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones de entrada/salida de la política:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.front` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

Configuración de entrenamiento:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 15000 |
| Tamano de batch | 16 |
| Optimizador | adamw |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

El modelo es un adaptador de SmolVLA, un VLA compacto que combina percepción visual y comprensión del lenguaje con la generación directa de acciones motoras, según se describe en el artículo arXiv 2506.01844. La model card no detalla la composición interna (número de capas, dimensión oculta, encoder visual empleado ni mecanismo de fusión visión-lenguaje), por lo que esos datos deben considerarse no disponibles. El modelo consume un vector de estado de 6 dimensiones y una imagen RGB de 480x640, y produce un vector de acción de 6 dimensiones, típico de un brazo robótico de 6 grados de libertad.

El entrenamiento se realizó por imitación (behavior cloning) sobre el dataset `Orellius/so101_sort_cubes_no_top`: 77 episodios, 54.777 frames a 30 FPS, con la instrucción en lenguaje natural "Grab the purple cube and put it into the cardboard box, ignore the other objects". Se ejecutaron 15.000 pasos con batch 16, AdamW y learning rate 1e-4, semilla 1000, usando LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni ningún proceso de refinamiento posterior, ni innovaciones técnicas adicionales más allá de las propias de SmolVLA.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so101_follower` a partir de observaciones visuales y de estado.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante un prompt de texto ("Grab the purple cube and put it into the cardboard box, ignore the other objects").
- Percepción visual monocámara: procesa una imagen frontal de 480x640 píxeles.
- Ejecución de políticas entrenadas por imitación: se despliega mediante `lerobot-rollout`.
- Reentrenamiento: puede servir como punto de partida para ajustar una política propia desde `lerobot/smolvla_base`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión general, audio): no disponibles; la visión está limitada al uso como entrada de la política.

## Casos de uso

- Clasificación de cubos en línea de montaje educativa: el modelo ejecuta la tarea de coger el cubo morado y depositarlo en una caja, útil en laboratorios y cursos de robótica con el brazo SO-101 como banco de pruebas de imitación.
- Prototipado de políticas de imitación: sirve como referencia de un fine-tune completo sobre SmolVLA con 77 episodios, para que un equipo calibre cuántos datos y pasos necesita una tarea de pick-and-place.
- Despliegue en hardware de consumo: al derivar de SmolVLA, está pensado para ejecutarse en equipos de gama consumer, lo que permite montar una célula robótica de bajo coste sin GPUs de centro de datos.
- Investigación en manipulación con distractores: la instrucción exige ignorar otros objetos, lo que lo hace útil para estudiar robustez frente a distractores visuales en entornos controlados.
- Base para ajuste fino en tareas propias: partiendo del mismo `lerobot/smolvla_base` y siguiendo la receta documentada (`lerobot-train`), un equipo puede reproducir el pipeline y adaptarlo a su robot y dataset.
- Automatización de demostraciones en ferias o docencia: con `--duration=60` se puede ejecutar una demo acotada de la política en un robot físico para mostrar el ciclo percepción-acción.
- Evaluación comparativa de checkpoints: al ser un experimento concreto (`exp12_exp5_mlp_targets`), sirve para comparar variantes de entrenamiento dentro de una misma familia de políticas SmolVLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0.0 GB según Hugging Face, lo que sugiere que los pesos no se han subido o son de tamaño despreciable; no es posible estimar VRAM a partir de los datos proporcionados.
- GPU recomendadas: no disponibles en la información proporcionada. La model card de SmolVLA afirma que el modelo está diseñado para desplegarse en hardware de consumo, pero no se listan modelos concretos.
- ¿Cabe en GPU consumer?: según la descripción de SmolVLA, sí está pensado para hardware de consumo; no se especifica qué GPU concretas.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=hubnemo/so101_smolvla_exp12_exp5_mlp_targets`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política VLA de robótica.
- Latencia y throughput estimados: no disponibles. La captura de datos y la inferencia se plantean a 30 FPS, pero no se aportan mediciones de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_exp12_exp5_mlp_targets` | VLA (fine-tune de SmolVLA) | no disponible | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | VLA base (SmolVLA) | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face, modelo base oficial de LeRobot |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | Políticas de imitación | no disponible | no disponible | no disponible | Ecosistema LeRobot |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado parámetros, contexto ni métricas de rendimiento para este modelo ni para los comparables citados.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Tarea única y muy específica: entrenada solo para "coger el cubo morado e introducirlo en la caja de cartón, ignorando otros objetos"; no generaliza a otras instrucciones sin reentrenamiento.
- Dependencia de hardware exacto: diseñada para `so101_follower` con una cámara `front` de 480x640; los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Dataset pequeño: 77 episodios y 54.777 frames, lo que limita la diversidad de posiciones, iluminación y condiciones cubiertas.
- Sesgos conocidos: no disponibles; en robótica por imitación los sesgos provienen de las demostraciones (posiciones, colores, disposición de objetos), pero no se documentan análisis al respecto.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la generación de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Idiomas: no disponibles; la instrucción de tarea está en inglés.
- Licencia: apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base `lerobot/smolvla_base` y del dataset de entrenamiento antes de un despliegue productivo.
- Repositorio de autor individual con 0 descargas y 0 likes: sin validación comunitaria; tratar como experimento, no como artefacto listo para producción.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la integridad y procedencia de los archivos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_exp12_exp5_mlp_targets
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
- Artículo SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
