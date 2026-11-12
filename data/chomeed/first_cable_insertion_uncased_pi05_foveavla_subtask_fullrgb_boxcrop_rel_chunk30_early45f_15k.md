# chomeed/first_cable_insertion_uncased_pi05_foveavla_subtask_fullrgb_boxcrop_rel_chunk30_early45f_15k

## Resumen

Este repositorio contiene un checkpoint de política robótica (no un modelo de lenguaje de propósito general) obtenido al afinar `lerobot/pi05_base` con la arquitectura FoveaVLA y predicción de subtareas de alto nivel. El autor es el usuario de Hugging Face `chomeed`, y el modelo está entrenado sobre el conjunto de datos privado `chomeed/first_cable_insertion_uncased`, orientado a una tarea concreta de inserción de cable con un brazo robótico Hyundai Duet. El checkpoint corresponde a 15.000 actualizaciones de optimizador de un total de 30.000 (paso de bucle 30.000), por lo que es un modelo parcialmente entrenado, no el final de la ejecución.

La relevancia es acotada y muy específica: se trata de un artefacto de investigación en robótica de manipulación, con 4.145.527.568 parámetros (4,15 mil millones) en formato safetensors y un tamaño de repositorio de 16,6 GB. No es un modelo conversacional ni un LLM al uso, sino una política visuomotora que consume seis cámaras y un vector de estado de 25 dimensiones para producir secuencias de acciones de 10 dimensiones en trozos (chunks) de 30 pasos. Su interés técnico reside en la combinación de predicción de subtareas mediante un VLM y un mecanismo de foveación con recortes por cámara.

No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks. El modelo está publicado bajo la librería LeRobot 0.6.2 y el pipeline `robotics`, con cero descargas y cero «likes» en el momento de la consulta, lo que sugiere un artefacto de uso interno o experimental más que un modelo destinado a adopción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (pi05) con extensión FoveaVLA y predicción de subtareas; política visuomotora sobre LeRobot 0.6.2 (`pi05_foveavla_subtask`) |
| Parametros totales | 4.145.527.568 (4,15 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observación multi-cámara y chunk de acción de 30 pasos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; entrenamiento en bf16 con pesos maestros fp32) |
| Idiomas soportados | no disponible (modelo de robótica; las subtareas se expresan en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 16,6 GB; incluye `policy_preprocessor_*` y `policy_postprocessor_*` en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` y se afina con la variante `pi05_foveavla_subtask` del repositorio `HDR-SRL/lerobot_foveavla` (rama `subtask`). La arquitectura combina un componente VLM que, tras el prompt, escribe la subtarea actual en lenguaje natural («grasp the cable with the right hand», «turn the head to the center», «insert the cable into the control module») y un «action expert» que condiciona la generación de acciones sobre esa subtarea. Además, tras la respuesta se predicen cuatro ranuras de caja (box slots) por cámara para `zed_mini`, `d405_left` y `d405_right`, correspondientes a la caja en t + 8, con 4 clases sobre 1024 bins; el action expert nunca ve estas cajas.

La foveación se implementa mediante vistas recortadas por cámara: en subtareas de tipo «grasp» o «turn the head» los recortes se enmascaran de la atención (como una cámara ausente) y el modelo solo ve los fotogramas completos; en la subtarea «insert» el recorte es exactamente la caja de la consulta anterior, estirada al tamaño del crop. Las pérdidas son flujo más 0,1 × entropía cruzada de subtarea, y en inserción se añade 0,1 × entropía cruzada de caja. El entrenamiento usó AdamW con lr máximo 2,5e-05, warmup de 2000 pasos y decaimiento coseno hasta 2,5e-06 en 60.000 pasos de bucle, batch efectivo de 64 (32 por GPU en una B200 con acumulación de gradiente 2), precisión bf16 con pesos maestros fp32 y checkpointing de gradientes. La pérdida de entrenamiento en este paso es 0,115. Las entradas son seis cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y un estado de 25 dimensiones; la salida es una acción de 10 dimensiones con chunk de 30 pasos y acciones relativas al estado actual, salvo tres articulaciones de la mano que se mantienen absolutas (right_thumb_joint1, right_index_joint2, right_index_joint3). La normalización usa las estadísticas de la rama `rel_chunk30` del dataset y las etiquetas de subtarea de la rama `foveavla_subtask_early45f`.

## Capacidades

- Predicción de subtareas de alto nivel en lenguaje natural a partir de observaciones visuales y del estado del robot.
- Generación de secuencias de acción de 10 dimensiones en chunks de 30 pasos, con acciones relativas al estado actual salvo tres articulaciones de la mano.
- Procesamiento multimodal de seis cámaras simultáneas, incluidas dos cámaras de foveación dedicadas.
- Foveación selectiva: enmascaramiento de recortes en atención para subtareas de agarre o giro de cabeza, y uso del recorte de la consulta anterior en la subtarea de inserción.
- Predicción de cajas delimitadoras por cámara a t + 8 (4 clases sobre 1024 bins) para las cámaras zed_mini, d405_left y d405_right.
- Integración con el ecosistema LeRobot mediante `PI05FoveaVLASubtaskPolicy` y procesadores pre/post configurables con proveedores en vivo (`box_provider`, `subtask_provider`).
- No dispone de capacidades de texto general, código, matemáticas, tool calling, agentes conversacionales ni audio; es una política robótica especializada.

## Casos de uso

- Investigación en manipulación robótica de precisión: el modelo está entrenado específicamente para la inserción de un cable en un módulo de control con un brazo Hyundai Duet, por lo que sirve como punto de partida para estudiar políticas visuomotoras con subtareas explícitas.
- Evaluación de foveación selectiva: permite comparar el rendimiento con y sin recortes por cámara en las distintas fases de la tarea, ya que el propio diseño enmascara los recortes en las subtareas de agarre y giro de cabeza.
- Reentrenamiento y ajuste fino sobre nuevos datasets de inserción: al estar construido sobre `lerobot/pi05_base` y LeRobot 0.6.2, puede reutilizarse como inicialización para tareas de ensamblaje similares.
- Estudio de predicción de subtareas como señal auxiliar: el modelo escribe la subtarea antes de actuar, lo que facilita el análisis de la coherencia entre el plan de alto nivel y las acciones generadas.
- Prototipado de pipelines de control con múltiples cámaras: su entrada de seis cámaras y estado de 25 dimensiones sirve para validar arquitecturas de percepción multi-vista en laboratorio.
- Reproducción de experimentos: el checkpoint incluye las estadísticas de normalización en sus procesadores, lo que permite reproducir exactamente el preprocesado y postprocesado del entrenamiento.
- Seguimiento de cajas para guiado visual: la predicción de cajas a t + 8 por cámara puede emplearse como módulo auxiliar de atención espacial en otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado es la pérdida de entrenamiento en el paso 15.000, que es de 0,115, sin comparación con otros modelos ni métricas de éxito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,15 mil millones de parámetros en bf16 se requieren aproximadamente 8,3 GB solo para los pesos, más el coste de las seis cámaras y del estado, por lo que conviene prever al menos 16 GB en la práctica.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA B200; para inferencia se puede usar cualquier GPU con suficiente VRAM, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 16 GB o más (por ejemplo, RTX 4090 o RTX 4080), aunque no se confirma en la información disponible.
- Opciones de despliegue: LeRobot 0.6.2 con `lerobot_policy_pi05_foveavla` (instalable desde `git+https://github.com/HDR-SRL/lerobot_foveavla@subtask`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 + FoveaVLA subtask) | 4,15 mil millones | chunk de 30 pasos | 6 cámaras + estado 25-D | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Otras políticas LeRobot (p. ej. pi0, ACT, Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | Ecosistema LeRobot |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas concretas; la comparación se limita al modelo base del que deriva y al ecosistema LeRobot.

## Limitaciones y advertencias

- Es un checkpoint intermedio (15.000 de 30.000 actualizaciones), por lo que su rendimiento final puede ser inferior al de la ejecución completa.
- Entrenado para una única tarea (inserción de cable) y un único robot (Hyundai Duet); no generaliza a otras tareas sin reentrenamiento.
- La licencia no está disponible, lo que impide determinar si se permite uso comercial.
- No se han publicado métricas de éxito en la tarea ni benchmarks, por lo que no hay evidencia cuantitativa de su fiabilidad.
- Depende de seis cámaras concretas y de un estado de 25 dimensiones; cambios en la configuración sensorial invalidan el modelo.
- El uso de recortes de foveación y de subtareas depende de proveedores en vivo (`box_provider`, `subtask_provider`) que deben implementarse correctamente en el bucle de control.
- Riesgo de alucinación en la subtarea predicha: el VLM puede emitir una subtarea incoherente con la escena, lo que condicionaría erróneamente al action expert.
- No se especifican sesgos conocidos; al ser un modelo de robótica, los sesgos relevantes serían los del dataset de entrenamiento, no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/first_cable_insertion_uncased_pi05_foveavla_subtask_fullrgb_boxcrop_rel_chunk30_early45f_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/chomeed/first_cable_insertion_uncased
- Repositorio del framework: https://github.com/HDR-SRL/lerobot_foveavla/tree/subtask
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/3nsg7nyl
