# bibi0108/open_top_drawer_smolvla

## Resumen

`bibi0108/open_top_drawer_smolvla` es una política de imitación de tipo vision-language-action (VLA) obtenida por fine-tuning de `lerobot/smolvla_base`, el modelo SmolVLA publicado por Hugging Face. No es un modelo de lenguaje conversacional: recibe el estado articular de un brazo robótico `so_follower` (vector de 6 dimensiones) junto con tres cámaras RGB (`top`, `wrist`, `belly`, 3×256×256 cada una) y emite un vector de acción de 6 dimensiones. Su única tarea entrenada es abrir un cajón, en concreto el cajón superior, a partir de las instrucciones `open_drawer` y `open_top_drawer`.

El modelo resuelve un problema muy acotado: reproducir una habilidad de manipulación aprendida de 15 episodios teleoperados (6.706 fotogramas a 30 FPS). Su relevancia práctica está en servir como ejemplo reproducible de fine-tuning de SmolVLA con LeRobot 0.6.2 y como punto de partida para quien quiera adaptar el mismo pipeline a otras tareas con pocos datos. La arquitectura subyacente es la de SmolVLA, un VLA compacto de 450.046.176 parámetros (unos 450 M) descrito por sus autores como capaz de rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo.

Conviene subrayar dos cosas desde el principio. Primero, el repositorio no incluye ninguna evaluación en robot real: la model card deja la tabla de resultados vacía y lo indica explícitamente. Segundo, el modelo no genera texto libre, no soporta tool calling ni razonamiento multi-paso; la cadena de tarea se usa como condicionamiento, no como interfaz conversacional. Cualquier uso en producción debería ir precedido de una validación propia con el mismo robot, cámaras y distribución de escena del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) compacto; fine-tuning de `lerobot/smolvla_base` (SmolVLA). No es MoE. Detalle completo en el paper arXiv:2506.01844 |
| Parametros totales | 450.046.176 (dato real de los safetensors) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible; el contexto es una ventana de observacion (estado de 6 dimensiones + 3 imagenes de 3x256x256) y una instruccion de tarea |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no hay GGUF ni cuantizaciones de terceros) |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset estan en ingles (`open_drawer`, `open_top_drawer`) y no se ha evaluado el condicionamiento en otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB, compatible con la libreria `lerobot`) |

Especificaciones de entrada y salida:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (6,) |
| `observation.images.camera1` | VISUAL | (3, 256, 256) |
| `observation.images.camera2` | VISUAL | (3, 256, 256) |
| `observation.images.camera3` | VISUAL | (3, 256, 256) |
| `action` | ACTION | (6,) |

| Parametro de entrenamiento | Valor |
|---|---|
| Robot | `so_follower` |
| Camaras | `top`, `wrist`, `belly` |
| Pasos de entrenamiento | 50.000 |
| Tamano de batch | 8 |
| Optimizador | adamw |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action: combina un backbone de vision-lenguaje preentrenado con un modulo que produce acciones continuas, de forma que la política mapea observaciones visuales y estado propioceptivo a comandos motores. En este fine-tune concreto, el modelo toma tres vistas RGB a 256×256 y un estado de 6 dimensiones, y devuelve una acción de 6 dimensiones por paso. La descripción técnica completa de la arquitectura, la composición exacta del preentrenamiento y las innovaciones del método (por ejemplo, el esquema de generación de acciones o el entrenamiento asíncrono) están en el paper arXiv:2506.01844, referenciado en la model card; esta ficha no dispone del texto del paper y por tanto no detalla esos extremos.

El entrenamiento de este repositorio es un fine-tuning de imitación supervisada sobre el dataset `bibi0108/open_top_drawer`: 15 episodios, 6.706 fotogramas a 30 FPS, con las tareas etiquetadas como `open_drawer` y `open_top_drawer`. Se ejecutaron 50.000 pasos con batch de 8, optimizador AdamW y learning rate 1e-4, semilla 1000, sobre LeRobot 0.6.2. No se documenta en la información disponible qué GPU se usó, cuántas horas de cómputo requirió ni si hubo aumento de datos, y tampoco se reporta ninguna fase de RLHF o DPO, algo esperable en una política de imitación y no en un modelo alineado por preferencias.

## Capacidades

- Control visomotor de un brazo `so_follower`: genera acciones de 6 dimensiones a partir de tres cámaras y del estado articular.
- Ejecución de una habilidad concreta de manipulación: abrir el cajón superior, condicionada por las instrucciones `open_drawer` u `open_top_drawer`.
- Fusión de tres vistas simultáneas (`top`, `wrist`, `belly`), lo que aporta información tanto global de la escena como local de la empuñadura.
- Política de imitación entrenada de extremo a extremo, sin planificador explícito ni módulo de percepción separado.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia en robot y `lerobot-train` para reentrenamiento.
- Punto de partida para fine-tuning: puede adaptarse a otras tareas partiendo de `lerobot/smolvla_base` con el mismo pipeline.
- Generación de texto libre: no soportada (no es un modelo de lenguaje).
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no evaluadas; el condicionamiento textual del dataset está en inglés.
- Vision general (VQA, OCR, captioning): no es su función; el backbone visual está especializado en la política.

## Casos de uso

- Reproducción de la tarea en un banco de pruebas propio: ejecutar `lerobot-rollout` con `--policy.path=bibi0108/open_top_drawer_smolvla` sobre un `so_follower` calibrado con tres cámaras en las posiciones `top`, `wrist` y `belly` para verificar si la política transfiere al montaje físico disponible.
- Fine-tuning de una habilidad nueva por transferencia: usar este checkpoint o `lerobot/smolvla_base` como inicialización y grabar 10-30 episodios de otra tarea (por ejemplo, cerrar el cajón o abrir el inferior) con `lerobot-train`, aprovechando que el coste de entrenamiento es bajo con 450 M de parámetros.
- Docencia y divulgación en aprendizaje por imitación: el par repositorio de modelo más dataset de 15 episodios constituye un ejemplo mínimo y completo del ciclo grabar-calibrar-entrenar-desplegar.
- Validación de infraestructura de robot learning: sirve para comprobar la latencia real del bucle de control a 30 FPS, la sincronización de tres cámaras USB y la estabilidad de las lecturas de estado antes de invertir en datasets mayores.
- Generación de datos sintéticos de evaluación: ejecutar la política de forma repetida con distintas posiciones iniciales del cajón para medir la tasa de éxito y detectar los modos de fallo antes de escalar el dataset.
- Prototipado de automatización doméstica de bajo coste: al caber en GPUs de consumo y no requerir servidores de inferencia, permite montar un demostrador autónomo de apertura de cajones en una estación local.
- Base para comparativas internas: confrontar el rendimiento de SmolVLA con otras políticas de LeRobot (ACT, Diffusion Policy) sobre el mismo dataset y el mismo robot para decidir la arquitectura del siguiente proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la nota literal «No evaluation results have been provided for this policy yet», es decir, no hay tasas de éxito en robot real, ni número de ensayos, ni comparación con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-4 GB en bf16, contando pesos (0,9 GB, coherente con el tamaño del repo) más activaciones de tres imágenes de 3×256×256 y el estado de 6 dimensiones. En fp32 los pesos solos ocuparían unos 1,8 GB. Son estimaciones, no cifras publicadas por el autor.
- GPU recomendadas para despliegue: cualquier GPU con 4 GB o más de VRAM. Encajan RTX 3060, RTX 4060, RTX 4070, RTX 4090, L4, A10 o A100; también iGPU recientes con memoria unificada suficiente, aunque sin datos de latencia publicados.
- Cabe en GPU de consumo: sí, es uno de los objetivos de diseño declarados de SmolVLA. Una RTX 3050 de 8 GB o una RTX 4060 de 8 GB deberían ser suficientes para inferencia; para fine-tuning con batch 8 conviene subir a 8-16 GB, aunque el autor no documenta la GPU empleada.
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot) y `lerobot-train` (entrenamiento) de la librería `lerobot` 0.6.2 o superior, sobre PyTorch y CUDA. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje con decodificación de tokens.
- Latencia y throughput: el dataset se grabó a 30 FPS, por lo que el bucle de control exige del orden de 33 ms por paso, pero no se han publicado medidas de latencia ni de frecuencia de control efectiva para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bibi0108/open_top_drawer_smolvla` | 450 M | VLA especializado en una tarea (abrir cajón) | Estado (6,) + 3 imagenes 3x256x256 | apache-2.0 | Hugging Face, via `lerobot` |
| `lerobot/smolvla_base` | 450 M | VLA generalista preentrenado, base de este fine-tuning | Configurable por politica; en este repo, 3 camaras + estado de 6 | apache-2.0 | Hugging Face, via `lerobot` |
| ACT (LeRobot) | no disponible (arquitectura configurable, de decenas de millones) | Politica de imitacion con transformer y acciones por chunks | Imagenes + estado, sin condicionamiento de lenguaje | apache-2.0 (implementacion LeRobot) | Integrado en LeRobot |
| Diffusion Policy (LeRobot) | no disponible | Politica de imitacion generativa por difusion | Imagenes + estado | apache-2.0 (implementacion LeRobot) | Integrado en LeRobot |
| OpenVLA-7B | 7 B | VLA generalista con backbone Llama-2 | Imagen unica + instruccion en lenguaje | open weights con condiciones (consultar model card) | Hugging Face |

La comparación honesta es que este checkpoint no compite en generalidad con los VLA grandes: gana en coste de despliegue (0,9 GB de pesos frente a varios GB) y pierde en alcance, porque solo ha visto una tarea. Frente a ACT o Diffusion Policy, la diferencia práctica es el condicionamiento por lenguaje y el backbone VLM preentrenado, que en teoría facilita la transferencia con pocos episodios, aunque aquí no hay evaluación publicada que lo demuestre.

## Limitaciones y advertencias

- Dataset mínimo: 15 episodios y 6.706 fotogramas son muy pocos. Es esperable sobreajuste a las posiciones, la iluminación y la apariencia concreta del cajón del dataset original.
- Sin evaluación publicada: no hay tasa de éxito, ni número de ensayos, ni análisis de fallos. Cualquier afirmación de rendimiento sería especulativa.
- Un solo embodiment: la política está atada a un robot `so_follower` con tres cámaras en posiciones concretas. Cambiar el brazo, el número de cámaras o sus nombres rompe la inferencia.
- Nombres de cámara fijos: `lerobot-rollout` exige que los nombres e índices de cámara coincidan con las claves de observación del entrenamiento (`top`, `wrist`, `belly`); un desajuste produce acciones sin sentido.
- Sensibilidad a la distribución: cambios de altura de la mesa, tipo de cajón, iluminación o presencia de distractores pueden degradar la política de forma no documentada.
- Alcance lingüístico reducido: el condicionamiento textual se limita a las instrucciones vistas (`open_drawer`, `open_top_drawer`) y no hay evaluación en otros idiomas ni en paráfrasis.
- Alucinación en el sentido clásico: no aplica, pero sí existe el riesgo equivalente de generar trayectorias plausibles pero incorrectas cuando la escena se sale de la distribución de entrenamiento.
- Licencia: apache-2.0 permite uso comercial y modificación, pero conviene verificar la licencia del dataset `bibi0108/open_top_drawer` y del modelo base antes de un despliegue productivo.
- Sin garantías de seguridad física: operar un brazo real con una política no validada puede provocar colisiones. Es imprescindible un botón de parada de emergencia y límites de par y velocidad en el controlador.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado ni issues de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bibi0108/open_top_drawer_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/bibi0108/open_top_drawer
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=bibi0108/open_top_drawer
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
