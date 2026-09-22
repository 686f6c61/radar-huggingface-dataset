# bklassen3434/smolvla_pick_pen_v2_pi05

## Resumen

`bklassen3434/smolvla_pick_pen_v2_pi05` es un checkpoint de política robótica publicado en Hugging Face por el usuario bklassen3434, entrenado con la librería LeRobot de Hugging Face sobre la arquitectura π₀.₅ (Pi05) de Physical Intelligence. Se trata de un modelo Vision-Language-Action (VLA): recibe observaciones visuales y el estado del robot y emite acciones motrices, con el objetivo declarado de generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación de LeRobot está adaptada del repositorio de código abierto OpenPI de Physical Intelligence.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) según los pesos en safetensors, y el repositorio ocupa 9,4 GB. Está especializado mediante ajuste fino sobre el dataset `bklassen3434/pick_pen_v2_20260920_124400`, cuyo nombre sugiere una tarea concreta de recogida de un bolígrafo, y los ejemplos de la model card apuntan a un robot de tipo `so100_follower` (brazo SO-100/SO-101).

Su relevancia es limitada y muy experimental: es un checkpoint con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados, y con una discrepancia entre el identificador del repositorio (que menciona `smolvla`) y la model card (que declara `model_name: pi05`). Se publica bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), adaptada en LeRobot desde OpenPI |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (precisión no declarada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Pipeline | robotics |
| Dataset de entrenamiento | bklassen3434/pick_pen_v2_20260920_124400 |
| Tamaño del repositorio | 9,4 GB |
| Fecha de creación | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe π₀.₅ como una evolución de π₀ orientada a la generalización en mundo abierto: el modelo debe trasladar lo aprendido a entornos y situaciones que no aparecieron en el entrenamiento. La implementación incluida en este repositorio procede de LeRobot, la librería de Hugging Face para aprendizaje por imitación, y está adaptada del repositorio OpenPI de Physical Intelligence. No se especifican en la información disponible el backbone de visión-lenguaje empleado, el mecanismo de generación de acciones (por ejemplo, flow matching o action chunking), el número de tokens de entrenamiento ni la composición del dataset.

El checkpoint concreto ha sido ajustado sobre un único dataset de demostraciones teleoperadas (`pick_pen_v2_20260920_124400`), por lo que su comportamiento está ligado a la tarea, al robot y a la configuración de cámaras de esa recolección de datos. No se documenta si hubo fases de RLHF, DPO u otras técnicas de alineamiento, ni innovaciones adicionales más allá de las atribuidas al modelo base π₀.₅. Tampoco se indica la precisión de los pesos ni si existe una variante cuantizada.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales y del estado del robot (política VLA, no un modelo de lenguaje conversacional).
- Aprendizaje por imitación: reproduce la tarea demostrada en el dataset de entrenamiento (`pick_pen_v2`), presumiblemente la recogida de un bolígrafo.
- Condicionamiento multimodal: al ser un modelo Vision-Language-Action, combina entrada visual e información lingüística con la salida de acciones; el alcance exacto del condicionamiento por lenguaje no está documentado en la información disponible.
- Generalización en mundo abierto: capacidad atribuida al modelo base π₀.₅ por Physical Intelligence, no verificada para este ajuste fino concreto.
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record` sobre robots tipo `so100_follower`.
- Soporte de tool calling / function calling: no disponible (no aplica a una política robótica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión como entrada (propia de un VLA); sin más detalles en la información disponible.

## Casos de uso

- Recogida de objetos tipo pick-and-place: el modelo está ajustado específicamente para tomar un bolígrafo en un brazo SO-100/SO-101; sirve como política de referencia para esa tarea en un banco de pruebas de laboratorio.
- Investigación en aprendizaje por imitación: permite reproducir el flujo completo de LeRobot (grabación de dataset, entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) y comparar hiperparámetros sobre una tarea reproducible.
- Base para ajuste fino posterior: al ser un checkpoint π₀.₅ ya entrenado, puede utilizarse como punto de partida para nuevas tareas manipulativas con datasets propios, siempre que se respete la licencia Apache-2.0.
- Evaluación de generalización visual: útil para medir hasta qué punto el modelo transfiere la tarea a cambios de iluminación, fondo o posición de cámara no presentes en el dataset original, dado el énfasis de π₀.₅ en generalización de mundo abierto.
- Docencia y formación en robótica: ejemplo práctico y completo de pipeline VLA de código abierto para cursos sobre manipulación y políticas visomotoras, con requisitos de hardware modestos (≈4,14 mil millones de parámetros).
- Pruebas de robustez y seguridad en manipulación: al ser un modelo pequeño y de dominio restringido, resulta adecuado para estudiar fallos de agarre, colisiones y recuperación de errores antes de escalar a políticas mayores.
- Integración en demostraciones de laboratorio o ferias: la tarea de recoger un objeto es fácil de mostrar al público y el despliegue puede hacerse en una estación con una GPU de gama alta para consumidor.
- Automatización de tareas repetitivas de precisión limitada: manipulación de piezas ligeras en celdas controladas, siempre con verificación empírica previa, ya que no hay métricas publicadas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito de la tarea, métricas de simulación ni comparaciones cuantitativas, y los resultados de búsqueda web proporcionados no contienen información relacionada con este modelo ni con π₀.₅ (se limitan a páginas de citas del día, sin relación con el contenido solicitado).

## Requisitos de hardware

- VRAM estimada para los pesos: ≈16,6 GB en float32; ≈8,3 GB en bfloat16/float16; ≈4,1 GB en int8; ≈2,1 GB en int4 (estimaciones a partir de los 4.143.404.816 parámetros; los tipos de cuantización no están documentados para este checkpoint).
- El repositorio ocupa 9,4 GB, lo que es coherente con pesos en bfloat16 (8,3 GB) más ficheros auxiliares, aunque no se declara la precisión.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para inferencia en bfloat16 con margen para activaciones. En RTX 4080/4090 con 16 GB la inferencia en bfloat16 queda muy ajustada.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, 4090) con pesos en bfloat16; en 16 GB solo con cuantización, cuya disponibilidad no está confirmada para esta política.
- Opciones de despliegue: ecosistema LeRobot (`lerobot-train`, `lerobot-record`), PyTorch con aceleración CUDA. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje de texto.
- Latencia y throughput: no disponible. En robótica manipulativa la frecuencia de control es crítica, por lo que conviene medirla en el hardware objetivo antes de cualquier despliegue.
- Requisitos adicionales: robot compatible (el ejemplo de la model card usa `so100_follower`), cámaras de observación y dataset de calibración equivalente al de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bklassen3434/smolvla_pick_pen_v2_pi05 | ≈4,14 mil millones | no disponible | apache-2.0 | Hugging Face, 0 descargas | Ajuste fino de π₀.₅ sobre dataset propio de pick_pen |
| π₀.₅ de Physical Intelligence (openpi) | no disponible | no disponible | no disponible en la informacion proporcionada | Repositorio OpenPI citado en la model card | Modelo base del que deriva esta política; generalización de mundo abierto |
| π₀ de Physical Intelligence | no disponible | no disponible | no disponible en la informacion proporcionada | Repositorio OpenPI citado en la model card | Predecesor directo de π₀.₅ |
| Políticas ACT de LeRobot | no disponible | no disponible | no disponible en la informacion proporcionada | Librería LeRobot | Aparece en el comando de ejemplo de la model card como `--policy.type=act`; alternativa clásica de action chunking |
| SmolVLA | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Mencionado implícitamente en el identificador del repositorio | El ID del repo incluye "smolvla" aunque la model card declara `pi05` |

No se dispone de cifras de rendimiento comparadas para ninguno de estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros conocidos, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de validación pública: 0 descargas y 0 likes, sin benchmarks, sin tasas de éxito y sin evaluación independiente.
- Inconsistencia de identidad: el identificador del repositorio menciona `smolvla` mientras que la model card declara `model_name: pi05`, lo que puede inducir a error sobre la arquitectura real.
- Especialización extrema: el ajuste se ha hecho sobre un único dataset (`pick_pen_v2_20260920_124400`), por lo que cabe esperar un sobreajuste a la tarea, al robot y a la disposición de cámaras de esa recolección.
- Riesgo de fallo fuera de distribución: cualquier cambio de iluminación, fondo, posición de la cámara u objeto puede degradar el comportamiento; la generalización de mundo abierto es una propiedad atribuida al modelo base, no verificada aquí.
- Idiomas no documentados: la model card no lista idiomas soportados, y el condicionamiento lingüístico efectivo de este ajuste fino es desconocido.
- Longitud de contexto no disponible: imposibilita planificar despliegues que dependan de historiales largos de observación.
- Cuantizaciones no documentadas: no se indican formatos GGUF, int8 ni int4, por lo que no se puede garantizar el despliegue en hardware limitado.
- Restricciones de licencia: el checkpoint se publica como apache-2.0, pero conviene verificar los términos del repositorio OpenPI y de los pesos originales de π₀.₅ de Physical Intelligence antes de un uso comercial, ya que la licencia de la obra derivada puede estar condicionada por la del modelo base.
- Alucinación en sentido robótico: al ser una política visomotora, el riesgo se traduce en acciones incorrectas o inseguras (agarres fallidos, trayectorias erráticas) en lugar de texto inventado.
- Requisitos de reproducción: el uso previsto exige el mismo tipo de robot, calibración y espacio de observación, además de las dependencias de LeRobot.
- No apto como modelo de lenguaje: no debe emplearse para generación de texto, código ni diálogo, pese a compartir el apellido VLA con modelos de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bklassen3434/smolvla_pick_pen_v2_pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/bklassen3434/pick_pen_v2_20260920_124400
- Entrada de blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot (IL robots): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio OpenPI de Physical Intelligence: no disponible como URL directa en la información proporcionada (citado en la model card como origen de la implementación).
