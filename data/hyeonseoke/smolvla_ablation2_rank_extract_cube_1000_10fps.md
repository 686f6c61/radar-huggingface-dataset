# HyeonseokE/smolvla_ablation2_rank_extract_cube_1000_10fps

## Resumen

smolvla_ablation2_rank_extract_cube_1000_10fps es una politica robótica de imitación (vision-language-action) publicada por el usuario HyeonseokE sobre el modelo base lerobot/smolvla_base. Se distribuye con la librería LeRobot y el pipeline "robotics", y resuelve una única tarea de manipulación: "Extract the cube from the pocket and place it on the target marker" (extraer un cubo de un hueco y colocarlo sobre una marca objetivo) con un robot SO-101 follower.

El modelo pesa 450.046.176 parámetros (unos 450 M) en formato safetensors, con un repositorio de 0,9 GB. Se trata de un fine-tune, no de un modelo entrenado desde cero: parte de SmolVLA, el VLA compacto presentado en el paper arXiv:2506.01844, cuya propuesta es conseguir rendimiento competitivo en control robótico con un coste computacional reducido y desplegable en hardware de consumo.

Su relevancia es acotada y muy específica: es un artefacto de ablación experimental (el propio nombre indica "ablation2", semilla 1000, dataset a 10 FPS) útil para reproducir y comparar estrategias de entrenamiento, no un modelo de propósito general. No incluye resultados de evaluación publicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en transformer; fine-tune de SmolVLA (backbone tipo SmolVLM-2 con experto de acciones, segun el paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 (aproximadamente 450 M), segun los pesos en safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | no disponible; las instrucciones de tarea de la model card estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, empaquetado para la libreria lerobot |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo vision-language-action compacto y eficiente, capaz de rendimiento competitivo con coste computacional reducido y desplegable en hardware de consumo. La arquitectura concreta de SmolVLA se detalla en el paper enlazado (arXiv:2506.01844), no en esta model card: la información disponible aquí se limita a indicar que es un VLA y a documentar sus entradas y salidas. Las entradas son `observation.state` con forma `(6,)` y tres cámaras visuales `observation.images.camera1`, `camera2` y `camera3` de `(3, 256, 256)`; las salidas son `action` de forma `(6,)` y `action.radian_urdf0` de forma `(6,)`.

El entrenamiento es un fine-tune supervisado por imitación sobre el dataset HyeonseokE/ablation2_rank_extract_cube_10fps: 100 episodios, 31.823 fotogramas a 10 FPS, una sola tarea. La configuración registrada es de 24.850 pasos, batch size 64, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.0. No se documentan en la información disponible fases de RLHF, DPO ni ninguna innovación técnica adicional más allá de las propias de SmolVLA.

## Capacidades

- Generación de acciones de manipulación: produce vectores de acción de 6 dimensiones (más `action.radian_urdf0`) a partir del estado del robot y de tres vistas de cámara.
- Control visomotor de una tarea concreta: extraer un cubo de un hueco y depositarlo sobre una marca objetivo, con el robot `so101_follower`.
- Fusión de estado propioceptivo y visión: combina `observation.state` de 6 valores con tres flujos de imagen de 256x256.
- Ejecución continua: se despliega con `lerobot-rollout` y puede ejecutarse indefinidamente si no se fija `--duration`.
- Seguimiento de instrucción textual de tarea: la CLI recibe `--task` con la descripción de la tarea; no se documenta el alcance real de esa condicionalidad lingüística.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, razonamiento multi-paso, agentes, matemáticas, generación de código, visión generalista, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de experimentos de ablación: el repositorio forma parte de una serie de variantes ("ablation2", semilla 1000); se usaría para comparar el efecto de distintas configuraciones de entrenamiento manteniendo constante el dataset y la tarea.
- Banco de pruebas de imitación en robot SO-101: sirve para validar el pipeline completo de LeRobot (grabación de datos, entrenamiento, rollout) sobre un robot de bajo coste.
- Automatización de pick-and-place en laboratorio: la tarea de extraer un cubo de un hueco y colocarlo sobre una marca es representativa de operaciones de recogida y posicionamiento en entornos controlados.
- Investigación en políticas visomotoras con múltiples cámaras: permite estudiar cómo contribuyen tres vistas (por ejemplo, superior y muñeca) al control de un brazo de 6 grados de libertad.
- Evaluación de robustez frente a variaciones de iluminación, posición o distractores: al ser un fine-tune sobre una única tarea, es un candidato natural para medir degradación fuera de distribución.
- Docencia y formación en robótica con aprendizaje por imitación: el modelo y su dataset son reproducibles con comandos de LeRobot y caben en una GPU de consumo.
- Base de partida para nuevos fine-tunes: al derivar de `lerobot/smolvla_base` y mantener licencia Apache 2.0, puede reentrenarse para tareas adicionales con el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni de evaluación en robot real en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto no se dispone de tasas de éxito, número de ensayos ni comparaciones cuantitativas para esta política concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,9 GB en precisión reducida (bf16/fp16), coherente con el tamaño del repositorio, y en torno a 1,8 GB si se carga en fp32. Cifras estimadas a partir de los 450 M de parámetros; el modelo no publica requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090 o similar es suficiente. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, con margen amplio; también es previsible su ejecución en CPU, aunque no se documenta latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), PyTorch con CUDA (`--policy.device=cuda` en el entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que no aplican a una política robótica de este tipo.
- Latencia y throughput: no disponibles. Es un factor relevante en control robótico, ya que el dataset de entrenamiento está grabado a 10 FPS, pero la información proporcionada no incluye mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolvla_ablation2_rank_extract_cube_1000_10fps | 450 M | 1 estado (6,) + 3 imagenes 256x256; contexto no disponible | Apache 2.0 | HuggingFace, libreria lerobot | Fine-tune de una sola tarea; sin evaluacion publicada |
| lerobot/smolvla_base | 450 M (aproximado, segun el modelo base) | Configuracion SmolVLA | Apache 2.0 | HuggingFace | Modelo base generico del que deriva este fine-tune |
| OpenVLA | 7 B (aproximado, dato publico) | Vision + instruccion en lenguaje | Licencia abierta con restricciones (base Llama) | HuggingFace | VLA de mayor tamano y coste; no comparable en requisitos de hardware |
| pi0 / pi0.5 (Physical Intelligence) | no disponible en esta busqueda | Vision + lenguaje, experto de acciones | no disponible en esta busqueda | no disponible en esta busqueda | Alternativa de referencia en VLA de escala media; datos no confirmados aqui |

Los datos de los modelos alternativos provienen de conocimiento general publico y no de la informacion proporcionada en esta busqueda; los campos marcados como no disponibles no han podido confirmarse. La busqueda web realizada no devolvio resultados tecnicos relevantes (los resultados obtenidos corresponden a un hotel en Kuhlungsborn, Alemania, y no guardan relacion con el modelo).

## Limitaciones y advertencias

- Especializacion extrema: el fine-tune aprende una unica tarea, "extract the cube from the pocket and place it on the target marker", y solo para el robot `so101_follower`. Fuera de ese escenario se espera un fallo de generalizacion.
- Sin evaluación publicada: no hay tasas de éxito en robot real, ni protocolo de ensayos, por lo que no puede afirmarse ningún nivel de fiabilidad en producción.
- Discrepancia en la documentación de cámaras: la sección Model Details indica las camaras `top` y `left_wrist`, mientras que las entradas declaradas son `observation.images.camera1`, `camera2` y `camera3`. Hay que verificar los nombres de las claves de observacion antes de desplegar, ya que deben coincidir exactamente con los del entrenamiento.
- Sensibilidad a las condiciones de captura: cambios de iluminación, posición de la cámara, fondo, posición inicial del cubo o distractores pueden degradar el comportamiento, algo propio de las políticas entrenadas por imitación con 100 episodios.
- Riesgo de sobreajuste al operador y al entorno: 100 episodios y 31.823 fotogramas a 10 FPS para una sola tarea implican poca diversidad; se recomienda grabar datos propios antes de usar el modelo en una instalación distinta.
- Limitaciones de idioma: no se documentan idiomas soportados; las instrucciones de ejemplo están en inglés, y no está claro si la condicionalidad por texto de tarea afecta realmente a la política o es meramente informativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se documentan avisos sobre los datos de entrenamiento (procedentes de una grabación propia del autor) ni sobre el modelo base más allá de su propia licencia. Conviene revisar la licencia de `lerobot/smolvla_base` antes de un despliegue comercial.
- Metadatos a verificar: la fecha de creación registrada (2026-09-14) es posterior a la fecha de esta ficha; conviene comprobar la vigencia del repositorio antes de citarlo.
- Uso responsable: es una política de control físico; cualquier despliegue debe incluir limites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_ablation2_rank_extract_cube_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_rank_extract_cube_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_rank_extract_cube_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
