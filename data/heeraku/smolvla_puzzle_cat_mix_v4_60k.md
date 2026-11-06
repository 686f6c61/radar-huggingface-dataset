# heeraku/smolvla_puzzle_cat_mix_v4_60k

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para controlar robots manipuladores con un coste computacional reducido. Este repositorio concreto, `heeraku/smolvla_puzzle_cat_mix_v4_60k`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario heeraku sobre un conjunto de datos propio de manipulación de cubos (tarea de tipo puzzle), con 785 episodios y 525.396 fotogramas a 30 FPS.

El modelo resuelve el problema de la política robótica de extremo a extremo: recibe el estado articular del robot y hasta tres cámaras de 256x256 píxeles, y emite directamente un vector de acción de 6 dimensiones. Con 450 millones de parámetros, está pensado para entrenamiento e inferencia en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que no disponen de clústeres de GPU de gran escala.

Este checkpoint ha sido entrenado y publicado mediante LeRobot, la librería de Hugging Face para robótica, y está especializado en un dominio muy concreto: recoger cubos de distintas posiciones de una superficie y colocarlos o girarlos en ranuras de destino. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, basada en SmolVLA (transformers con codificador visual y decodificador de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de texto; ventana de observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Camaras | top, wrist (hasta 3 entradas visuales de 3x256x256) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Dataset de entrenamiento | heeraku/puzzle-cat-mix-v4 (785 episodios, 525.396 fotogramas, 30 FPS) |
| Libreria | lerobot |
| Tamano del repositorio | 7,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual (procesa las imágenes de las cámaras), un componente de lenguaje que interpreta la instrucción de la tarea en lenguaje natural y un decodificador que genera directamente el vector de acción de 6 dimensiones. El modelo está diseñado para ser compacto (450 millones de parámetros) y desplegable en hardware de consumo, según la model card del autor.

El ajuste fino se realizó sobre el dataset `heeraku/puzzle-cat-mix-v4`, compuesto por 785 episodios y 525.396 fotogramas capturados a 30 FPS. Las tareas cubren una amplia variedad de instrucciones de manipulación de cubos: recoger un cubo de una posición (mid-right, far-left, etc.) y colocarlo en una ranura (top-right, bottom-left, etc.), así como girar cubos en sus ranuras en sentido horario o antihorario, y combinaciones de recogida, giro en grados concretos (5, 10, 25, 30, 40, 55, 65, 70, 75, 100, 105, 115, 120, 130, 145, 160 grados) y colocación. El modelo se entrenó con LeRobot, la librería de Hugging Face para robótica. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset más allá de los episodios y fotogramas indicados, ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones para un robot tipo `so_follower` a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa hasta tres imágenes de 3x256x256 píxeles (cámaras `top` y `wrist`, más una tercera entrada visual).
- Comprensión de instrucciones en lenguaje natural: interpreta tareas como "pick up the mid-right cube and place it in the top-right slot" o "turn the cube in the top-right slot counter-clockwise".
- Manipulación con giro preciso: ejecuta instrucciones que combinan recogida, rotación en grados concretos (por ejemplo, 40 grados en sentido horario) y colocación en ranura.
- Ejecución de políticas de extremo a extremo: no requiere planificación simbólica externa; mapea observación a acción directamente.
- Despliegue en hardware de consumo: el tamaño de 450 millones de parámetros y el formato safetensors permiten inferencia en GPU de gama media.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni modo de razonamiento explícito; es un modelo de política robótica, no un LLM conversacional.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede recoger cubos de posiciones designadas y colocarlos en ranuras concretas, útil para prototipos de manipulación robótica en entornos controlados con la configuración de cámaras `top` y `wrist`.
- Clasificación y ordenación de objetos: las instrucciones de colocar cubos en ranuras específicas (top-right, bottom-left, etc.) permiten usar el modelo en tareas de sorting o kitting en líneas de montaje ligeras.
- Manipulación con orientación precisa: las tareas que combinan giro en grados (por ejemplo, "pick up the far-right cube, turn it 40 degrees clockwise, and place it in the bottom-right slot") son adecuadas para operaciones que requieren alineación angular, como inserción de piezas.
- Investigación en aprendizaje por imitación: al estar entrenado con LeRobot y disponible en safetensors, sirve como punto de partida para experimentos de fine-tuning con nuevos datasets de manipulación.
- Evaluación de políticas VLA en hardware de consumo: con 450 millones de parámetros, se puede desplegar en estaciones de trabajo con GPU de gama media para probar políticas antes de escalar a modelos mayores.
- Formación y docencia en robótica: el modelo y su dataset asociado permiten reproducir el pipeline completo de entrenamiento y evaluación con LeRobot en cursos o talleres.
- Pruebas de robustez visual: al usar tres cámaras, se puede evaluar cómo afecta la oclusión o el cambio de iluminación en la política entrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 millones de parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16), la inferencia requiere previsiblemente menos de 4 GB de VRAM, aunque no se ha documentado.
- GPU recomendadas: no disponible. Por el tamaño del modelo, es plausible su ejecución en GPU de consumo como RTX 3060, RTX 4060 o superiores, pero no hay confirmación oficial.
- Cabe en GPU de consumo: sí, por el número de parámetros (450 millones), aunque no se especifican los requisitos exactos.
- Opciones de despliegue: LeRobot (librería oficial de Hugging Face para entrenamiento e inferencia). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| heeraku/smolvla_puzzle_cat_mix_v4_60k | 450 M | no aplica | Apache 2.0 | Hugging Face | Ajuste fino especializado en manipulación de cubos |
| lerobot/smolvla_base | no disponible | no aplica | no disponible | Hugging Face | Modelo base del que deriva este checkpoint |
| Otros modelos VLA compactos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, otros modelos VLA compactos) en términos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para tareas de manipulación de cubos en un entorno concreto; no generaliza a otros objetos, configuraciones de robot o entornos sin reentrenamiento.
- Dependencia de la configuración de hardware: espera un robot `so_follower` con cámaras `top` y `wrist` y un estado de 6 dimensiones; cualquier variación en la morfología o el montaje de sensores puede degradar el rendimiento.
- Riesgo de alucinación en el sentido de acciones incorrectas: como política de extremo a extremo, puede generar trayectorias erróneas ante condiciones visuales no vistas durante el entrenamiento (iluminación, oclusiones, fondos distintos).
- Idiomas: las instrucciones del dataset están en inglés; no se documenta soporte multilingüe.
- Sin datos de benchmarks: no se han publicado métricas de éxito en tareas, lo que impide evaluar su rendimiento de forma objetiva antes de desplegarlo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Dataset y modelo de autor único: al ser un ajuste fino de un usuario individual (heeraku), no hay validación externa ni mantenimiento garantizado.
- No apto para tareas de lenguaje general: no es un LLM; no debe usarse para generación de texto, código o razonamiento conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heeraku/smolvla_puzzle_cat_mix_v4_60k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/heeraku/puzzle-cat-mix-v4
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor: https://huggingface.co/heeraku/models
