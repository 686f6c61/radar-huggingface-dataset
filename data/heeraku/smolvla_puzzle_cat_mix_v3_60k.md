# heeraku/smolvla_puzzle_cat_mix_v3_60k

## Resumen

smolvla_puzzle_cat_mix_v3_60k es un modelo de visión-lenguaje-acción (VLA) compacto, desarrollado por el usuario heeraku, obtenido mediante ajuste fino de `lerobot/smolvla_base` sobre el dataset propio `heeraku/puzzle-cat-mix-v3`. Su propósito es ejecutar políticas de manipulación robótica de tipo pick-and-place y giro de cubos en un entorno de tipo puzle, controlando un robot `so_follower` (SO-100/SO-101 de LeRobot) con dos cámaras (vista superior y de muñeca).

El modelo resuelve el problema de llevar un VLA de propósito general a una tarea concreta con hardware de consumo: con 450 millones de parámetros y pesos en safetensors, está pensado para inferencia en tiempo real a 30 FPS sobre una estación de trabajo convencional, sin necesidad de GPUs de datacenter. Es relevante porque ejemplifica el flujo completo de imitación en LeRobot: grabar episodios, entrenar una política y desplegarla con `lerobot-rollout` sobre un robot de bajo coste.

El ajuste se realizó durante 60 000 pasos con batch de 64 y optimizador AdamW, sobre 785 episodios y 501 058 frames anotados con 24 instrucciones en lenguaje natural distintas. La licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), política de imitación sobre backbone VLM compacto |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 7,9 GB) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones, entrenado con aprendizaje por imitación para mapear observaciones (imágenes de cámara e estado proprioceptivo del robot) e instrucciones en lenguaje natural a comandos de acción de 6 dimensiones. La variante aquí publicada parte de `lerobot/smolvla_base` y se ajusta de forma supervisada sobre demonstrations del dataset `heeraku/puzzle-cat-mix-v3`; no se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

La configuración de entrenamiento reportada es: 60 000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.2. El dataset contiene 785 episodios y 501 058 frames a 30 FPS, con 24 tareas distintas que combinan recogida de cubos (posiciones far-left, mid-left, mid-right, far-right) y su colocación en ranuras (top-left, top-right, bottom-left, bottom-right), además de giros horarios y antihorarios de cubos ya colocados. Las observaciones incluyen `observation.state` de dimensión 6 y tres cámaras visuales de 3×256×256 (top y wrist entre ellas), y la salida es un vector de acción de dimensión 6.

## Capacidades

- Generación de acciones de manipulación robótica de 6 grados de libertad a partir de imágenes y una instrucción textual.
- Ejecución de tareas pick-and-place entre cuatro posiciones de origen y cuatro ranuras de destino.
- Rotación de cubos en las ranuras en sentido horario y antihorario.
- Condicionamiento por lenguaje natural: 24 instrucciones de tarea distintas documentadas en el dataset.
- Fusión de múltiples vistas (cámara superior y de muñeca) con el estado proprioceptivo del robot.
- Inferencia en tiempo real a 30 FPS sobre hardware de consumo, según la model card.
- Integración nativa con LeRobot (`lerobot-rollout` para despliegue, CLI de entrenamiento para reajuste).
- No se documenta soporte de tool calling, agentes multi-paso, audio ni modo thinking.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo recibe la instrucción "pick up the mid-right cube and place it in the top-right slot" y ejecuta la secuencia completa sobre un SO-100/SO-101, útil para prototipos de clasificación y ordenación de piezas.
- Clasificación de cubos por posición: las 24 tareas cubren todas las combinaciones origen-destino entre cuatro posiciones, lo que permite usar el modelo como base para tareas de ordenación tipo puzle en celdas de montaje.
- Manipulación con reorientación: los comandos de giro horario y antihorario permiten integrar el modelo en tareas que requieren alinear piezas antes de insertarlas en una ranura.
- Base para ajuste fino con datos propios: al derivar de `lerobot/smolvla_base` y publicarse con licencia Apache 2.0, sirve como punto de partida para reentrenar con un dataset propio de pocos cientos de episodios y un robot de bajo coste.
- Investigación en aprendizaje por imitación: el par modelo+dataset permite reproducir el pipeline completo de LeRobot (grabación, entrenamiento, rollout) y comparar hiperparámetros como pasos de entrenamiento o batch size.
- Docencia y demos de robótica: al ejecutarse en hardware de consumo y con un único comando CLI, es adecuado para talleres y demostraciones de VLA en entornos académicos.
- Evaluación de robustez visual: con dos cámaras (top y wrist) y entradas de 256×256, permite estudiar el impacto de oclusiones y cambios de iluminación en políticas de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (repo de 7,9 GB) la inferencia en fp32 requiere del orden de 2 GB de VRAM para los pesos, más el coste de las activaciones visuales.
- GPU recomendadas: no disponible en la información proporcionada; la model card indica que SmolVLA puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: sí, según la model card de SmolVLA (hardware de consumo); no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=heeraku/smolvla_puzzle_cat_mix_v3_60k`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles; el dataset y el despliegue están pensados para 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heeraku/smolvla_puzzle_cat_mix_v3_60k | 450 M | no disponible | VLA pick-and-place sobre SO follower | Apache 2.0 | Hugging Face (20 descargas) |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base de propósito general | no disponible | Hugging Face |
| heeraku/smolvla_puzzle_cat_30k_v3 | no disponible en la información | no disponible | VLA pick-and-place, 30 000 pasos | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- Modelo especializado: entrenado exclusivamente para el entorno de puzle con cubos y las 24 tareas del dataset; no generaliza a otras tareas, objetos o disposiciones sin reajuste.
- Dependencia del hardware: las observaciones esperan un robot `so_follower` con estado de 6 dimensiones y cámaras `top` y `wrist` a 256×256; cualquier cambio de configuración requiere reentrenamiento.
- Riesgo de sobreajuste al dataset: 785 episodios y 501 058 frames son un volumen modesto; la política puede degradarse ante cambios de iluminación, fondo u oclusiones no representadas.
- Sin benchmarks publicados: no hay métricas de éxito (success rate) ni comparaciones cuantitativas con la base, por lo que la calidad real de la política no está verificada de forma independiente.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar la licencia del modelo base `lerobot/smolvla_base` antes de un despliegue comercial.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual puede heredar sesgos de los datos de grabación (posiciones, colores y objetos concretos).
- Repositorio con muy poca tracción (20 descargas, 0 likes): no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heeraku/smolvla_puzzle_cat_mix_v3_60k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/heeraku/puzzle-cat-mix-v3
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=heeraku/puzzle-cat-mix-v3
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Variante de 30 000 pasos: https://huggingface.co/heeraku/smolvla_puzzle_cat_30k_v3
