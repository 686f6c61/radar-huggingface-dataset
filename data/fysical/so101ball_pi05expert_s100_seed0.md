# fysical/so101ball_pi05expert_S100_seed0

## Resumen

`fysical/so101ball_pi05expert_S100_seed0` es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario fysical en HuggingFace. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot de π₀.₅ (Pi05) de Physical Intelligence, un modelo VLA disenado para generalización en entornos abiertos. El modelo resuelve una tarea de manipulación concreta: coger una pelota verde y depositarla en una cesta, ignorando dos pelotas rojas distractoras.

El checkpoint contiene 4.143.404.816 parámetros (~4,14 mil millones) almacenados en safetensors, y el repositorio ocupa 20 GB. Está entrenado con la librería LeRobot 0.6.2 sobre el dataset `fysical/greenball_pool_225_v1`, compuesto por 225 episodios y 116.164 fotogramas a 30 FPS. La política consume tres cámaras RGB de 224x224 (base, muñeca izquierda y muñeca derecha) más un vector de estado de 32 dimensiones, y produce un vector de acción de 6 dimensiones para un robot `so_follower`.

Es relevante ahora porque forma parte del ecosistema emergente de modelos VLA abiertos con licencia Apache 2.0, que permiten reproducir y ajustar políticas de control robótico de extremo a extremo sobre hardware de bajo coste (familia SO-101 / SO-100). El modelo no incluye resultados de evaluación publicados en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot de π₀.₅ (Pi05), adaptada del repositorio OpenPI |
| Parametros totales | 4.143.404.816 (~4,14B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo declara safetensors) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/pi05_base |
| Robot objetivo | so_follower |
| Camaras | front (base_0_rgb), left_wrist_0_rgb, right_wrist_0_rgb |
| Entradas | observation.images.base_0_rgb (3,224,224); observation.images.left_wrist_0_rgb (3,224,224); observation.images.right_wrist_0_rgb (3,224,224); observation.state (32,) |
| Salidas | action (6,) |
| Tamano del repositorio | 20,0 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo es una política VLA derivada de π₀.₅ (Pi05), un modelo de Physical Intelligence orientado a la generalización en entornos y situaciones no vistos durante el entrenamiento. La model card indica que la implementación en LeRobot está adaptada del repositorio de código abierto OpenPI y que el modelo se ha entrenado y subido al Hub mediante LeRobot. El checkpoint es un fine-tune de `lerobot/pi05_base`. No se detalla en la información disponible la composición interna del backbone (encoder visual, modelo de lenguaje, experto de acciones), el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO.

Los datos de entrenamiento proceden del dataset `fysical/greenball_pool_225_v1`, con 225 episodios y 116.164 fotogramas grabados a 30 FPS sobre la tarea "Pick up the green ball and place it in the basket, ignoring the two red distractor balls". La configuración de entrenamiento documentada es la siguiente: 6000 pasos, batch size 32, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 0 y LeRobot 0.6.2. No se han publicado datos sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) en la información disponible.

## Capacidades

- Control robótico de manipulación de extremo a extremo: genera directamente acciones de 6 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa tres flujos RGB de 224x224 (vista base y dos muñecas) de forma simultánea.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante un prompt de texto ("Pick up the green ball...").
- Discriminación de objetos por color: la tarea requiere distinguir la pelota objetivo (verde) de dos distractores rojos.
- Ejecución de políticas de imitación: entrenado mediante aprendizaje por imitación sobre demostraciones teleoperadas.
- Generalización a entornos nuevos: el modelo base π₀.₅ está disenado explícitamente para generalizar a entornos y situaciones no vistos.
- Soporte de tool calling / function calling: no aplica / no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales adicionales (modo thinking, visión general, audio): no disponible.

## Casos de uso

- Recogida y clasificación de objetos en lineas de laboratorio: la política puede colocarse sobre un brazo SO-101 para coger objetos de un color concreto y depositarlos en un contenedor, descartando distractores del mismo tipo.
- Automatización de tareas pick-and-place en entornos controlados: útil para prototipos de manipulación repetitiva donde se dispone de un robot so_follower con cámaras base y de muñeca.
- Base para fine-tuning sobre nuevas tareas: al estar liberado con licencia Apache 2.0 y ser un fine-tune documentado, sirve como punto de partida para reentrenar sobre datasets propios con `lerobot-train`.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de políticas VLA sobre el dataset público `greenball_pool_225_v1` y comparar variantes.
- Evaluación de robustez frente a distractores: el escenario de dos pelotas rojas permite estudiar cómo la política ignora objetos irrelevantes.
- Despliegue en robótica educativa y de bajo coste: la familia SO-101 es económica, lo que facilita su uso en docencia y prototipado.
- Generación de datos y benchmarking de políticas VLA: sirve para comparar el rendimiento de políticas ajustadas frente al modelo base `lerobot/pi05_base`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito, número de ensayos ni métricas de tarea reportadas.

## Requisitos de hardware

Estimaciones basadas en el recuento de parámetros (4,14B); no están confirmadas por el autor:

- VRAM para inferencia en bf16/fp16: aproximadamente 8-10 GB (pesos ~8,3 GB más overhead de activaciones y buffers).
- VRAM para inferencia en fp32: aproximadamente 17-20 GB (pesos ~16,6 GB).
- VRAM en cuantización de 8 bits: aproximadamente 5-6 GB.
- VRAM en cuantización de 4 bits: aproximadamente 3-4 GB (los tipos de cuantización no están documentados por el autor).
- GPU recomendadas: una GPU con al menos 10-16 GB de VRAM para bf16 (por ejemplo RTX 4080/4090, A100, H100). No hay una recomendación oficial publicada.
- Compatibilidad con GPU de consumo: probablemente sí en bf16 en GPUs de 12 GB o más (RTX 3060 12GB, RTX 4070 Ti, RTX 4090), sujeto a verificación práctica.
- Opciones de despliegue: LeRobot mediante los comandos `lerobot-rollout` (inferencia sobre robot) y `lerobot-train` (entrenamiento/ajuste). El modelo usa `--policy.path` en dichas herramientas. No se documentan rutas alternativas como vLLM, TGI, llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. A continuación se comparan únicamente los datos documentados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fysical/so101ball_pi05expert_S100_seed0 | 4,14B | no disponible | apache-2.0 | HuggingFace (0 descargas) | Fine-tune especializado en una tarea de pick-and-place |
| lerobot/pi05_base | no disponible | no disponible | no disponible en la información | HuggingFace | Modelo base del que deriva este checkpoint |
| π₀.₅ (Pi05, Physical Intelligence) | no disponible | no disponible | no disponible en la información | Blog/repositorio OpenPI | Método original sobre el que se basa la implementación LeRobot |

No se dispone de datos suficientes (parámetros, contexto, rendimiento, licencia) de modelos comparables adicionales para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser una política entrenada por imitación, puede heredar los sesgos de las demostraciones humanas (posiciones, iluminación, colocación de objetos) del dataset `greenball_pool_225_v1`.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de acciones erróneas o incoherentes fuera de la distribución de entrenamiento (nuevas posiciones, iluminación o tipo de objeto).
- Limitaciones de tarea: el modelo está especializado en una única tarea (coger la pelota verde e ignorar dos rojas); no se documenta su comportamiento en otras tareas.
- Limitaciones de contexto e idioma: no disponible. No se documenta ventana de contexto ni cobertura multilingüe.
- Ausencia de evaluación: la model card no reporta ningún resultado de éxito, por lo que no hay evidencia empírica publicada de su rendimiento.
- Requisitos de hardware específicos: la inferencia depende de la configuración correcta de `--robot.port` y de que los nombres de cámara coincidan con las claves de observación del entrenamiento; una configuración incorrecta puede degradar o impedir el funcionamiento.
- Restricciones de licencia: la licencia es apache-2.0, que permite uso comercial, pero se recomienda verificar las condiciones del modelo base (`lerobot/pi05_base`) y del método original π₀.₅ por si impusieran restricciones adicionales.
- Caveat de producción: con 0 descargas y 1 like, el modelo es prácticamente inédito y carece de validación por parte de la comunidad.
- Fecha de creación declarada: 2026-10-07 (según los metadatos de HuggingFace), inusual y posterior a la fecha habitual de publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fysical/so101ball_pi05expert_S100_seed0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/fysical/greenball_pool_225_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fysical/greenball_pool_225_v1
- Blog de π₀.₅ (Pi05), Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Cita de LeRobot (Cadene et al., 2024): incluida en la model card del autor
