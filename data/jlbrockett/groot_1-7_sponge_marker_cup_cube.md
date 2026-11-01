# Jlbrockett/groot_1.7_sponge_marker_cup_cube

## Resumen

`Jlbrockett/groot_1.7_sponge_marker_cup_cube` es una política robótica entrenada mediante imitación con el framework LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. No se trata de un modelo de lenguaje generalista, sino de un checkpoint especializado para control de un brazo robótico `so_follower` (tipo SO-100/SO-101 de LeRobot) equipado con dos cámaras (`handeye` y `front`), entrenado para ejecutar cuatro tareas concretas de manipulación: colocar una esponja en un cuenco, insertar un rotulador verticalmente en un vaso, depositar el vaso sobre un salvamanteles y meter un cubo gris en una papelera gris.

El modelo subyacente, GR00T N1.7, es un modelo fundacional abierto de NVIDIA para razonamiento y habilidades de robots humanoides, publicado bajo licencia Apache 2.0. Combina un backbone vision-language Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propriocepción. Este checkpoint concreto tiene 3.144.016.000 parámetros (según los safetensors del repositorio) y ocupa 12,6 GB.

Es relevante ahora porque demuestra el flujo completo de LeRobot 0.6.1 para afinar un modelo fundacional robótico con un dataset propio pequeño (250 episodios, 154.563 frames a 30 FPS) y desplegarlo en hardware de bajo coste. Su valor práctico es acotado: sirve como referencia reproducible de fine-tuning de GR00T y como política funcional para las cuatro tareas del dataset, no como modelo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching (GR00T N1.7) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (política de control; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Tipo de robot | `so_follower` |
| Camaras | `handeye`, `front` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Tamano del repo | 12,6 GB |
| Descargas | 25 |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

GR00T N1.7 sigue una arquitectura de dos componentes: un backbone vision-language (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las cámaras y la instrucción de tarea en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera trayectorias de acción continuas condicionadas por las representaciones del backbone y por el estado proprioceptivo del robot (6 dimensiones). Las observaciones visuales son dos vistas RGB de 480x640 a 30 FPS, y la salida es un vector de acción de 6 dimensiones.

El fine-tuning se realizó sobre el dataset `Jlbrockett/sponge_marker_cup_cube`, compuesto por 250 episodios y 154.563 frames a 30 FPS, con cuatro tareas de manipulación. La configuración de entrenamiento documentada es: 30.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se especifica en la información disponible el número de tokens de entrenamiento del modelo base ni si hubo etapas de RLHF o DPO; el ajuste aquí es de imitación supervisada sobre demostraciones.

## Capacidades

- Control robótico de manipulación por imitación: predice acciones de 6 dimensiones a partir de dos vistas de cámara y el estado del robot.
- Ejecución de instrucciones en lenguaje natural limitadas a las cuatro tareas del dataset: "grab the sponge and place it in the bowl", "pick up the marker on the table and place it vertically into the cup", "place the cup on the hotpad" y "Put the grey cube in the grey bin".
- Percepción visual multi-cámara: integra una vista de la mano (`handeye`) y una vista frontal (`front`) a 480x640.
- Condicionamiento por propriocepción: usa `observation.state` de 6 dimensiones como entrada.
- Razonamiento viso-lingüístico heredado del backbone Qwen3-VL, aunque el checkpoint está especializado y no se documenta su uso como modelo de propósito general.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito en la información disponible.

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política ejecuta la secuencia de coger la esponja y depositarla en el cuenco sobre un brazo `so_follower` real, útil como banco de pruebas de imitación visual-motora con hardware de bajo coste.
- Inserción de precisión: la tarea de colocar el rotulador verticalmente en el vaso requiere alineación fina; el modelo sirve para evaluar la precisión de políticas VLA en tareas de inserción con una sola vista de mano.
- Apilado y colocación sobre superficies: la tarea de poner el vaso sobre el salvamanteles permite estudiar el control de contacto y la colocación suave en robots de sobremesa.
- Clasificación y descarte de objetos: la tarea de meter el cubo gris en la papelera gris es un caso de manipulación condicionada por atributos visuales (color y forma), útil para investigar el grounding visual en políticas de imitación.
- Referencia reproducible de fine-tuning de GR00T: el repositorio documenta dataset, hiperparámetros y comandos de entrenamiento, por lo que sirve como plantilla para adaptar GR00T N1.7 a nuevos datasets con LeRobot.
- Despliegue con `lerobot-rollout`: el comando documentado permite ejecutar la política en un robot real durante un tiempo acotado (`--duration=60`), adecuado para demostraciones y validación en vivo.
- Evaluación comparativa de políticas de imitación: al estar entrenada con 250 episodios y 30.000 pasos, es un punto de partida para medir el efecto de más datos o más pasos en tareas de manipulación doméstica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144 millones de parámetros en safetensors (12,6 GB en fp32/bf16), una estimación orientativa sitúa la inferencia en bf16 en torno a 6-7 GB de VRAM para los pesos, más el coste del backbone visual, aunque el autor no publica cifras.
- GPU recomendadas: no disponible. Por tamaño, una GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100) es un punto de partida razonable para bf16, pero no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente en RTX 4090 y GPUs de 16 GB o más, sujeto a verificación; no confirmado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de control.
- Latencia y throughput: no disponibles. La política está pensada para control a 30 FPS según la tasa del dataset, pero no se publican medidas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jlbrockett/groot_1.7_sponge_marker_cup_cube` | 3.144 M | VLA (GR00T N1.7 fine-tuned) | no aplica | Apache 2.0 | HuggingFace, 25 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | VLA fundacional | no disponible | Apache 2.0 | GitHub NVIDIA/Isaac-GR00T |
| Políticas ACT de LeRobot | no disponible | Imitación (transformer) | no aplica | Apache 2.0 | HuggingFace / LeRobot |
| Políticas Diffusion Policy | no disponible | Imitación (difusión) | no aplica | no disponible | Repositorios de investigación |

La comparación con alternativas concretas no está disponible con datos numéricos en la información proporcionada; solo se confirma que GR00T N1.7 base y las políticas ACT/Diffusion de LeRobot son las referencias naturales de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: la política solo está entrenada para cuatro tareas concretas con objetos y posiciones similares a los del dataset; no generaliza a tareas nuevas sin reentrenamiento.
- Sin evaluación publicada: la model card declara que no hay resultados de éxito en robot real, por lo que se desconoce la tasa de acierto.
- Dataset pequeño: 250 episodios y 154.563 frames son una base limitada; es probable que la política sea sensible a cambios de iluminación, posiciones de objetos y distractores, aunque esto no se cuantifica en la información disponible.
- Dependencia de hardware específico: requiere un robot `so_follower` con dos cámaras configuradas con los nombres `handeye` y `front`, y las instrucciones de tarea están en inglés.
- Riesgo de alucinación motora: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento; no hay mecanismo de verificación documentado.
- Sesgos: no documentados; al entrenarse con un único operador y entorno, puede heredar sesgos de las demostraciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base GR00T N1.7 y las dependencias de LeRobot deben verificarse por separado.
- Idiomas: no se documenta soporte multilingüe; las tareas están definidas en inglés.
- Fecha de creación futura (2026-10-28) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jlbrockett/groot_1.7_sponge_marker_cup_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/Jlbrockett/sponge_marker_cup_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Jlbrockett/sponge_marker_cup_cube
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
