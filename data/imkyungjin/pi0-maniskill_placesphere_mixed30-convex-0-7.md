# ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.7

## Resumen

`ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.7` es un checkpoint de política robótica construido sobre π₀ (Pi0), el modelo visión-lenguaje-acción (VLA) de propósito general para control de robots desarrollado por Physical Intelligence. La implementación utilizada es la de LeRobot, la librería de Hugging Face que adapta el repositorio OpenPI del autor original. El modelo consume observaciones visuales e instrucciones en lenguaje natural y emite acciones de control de bajo nivel, es decir, no es un modelo de chat ni un LLM al uso, sino una política de imitación entrenada para manipulación.

El checkpoint pertenece al usuario ImKyungjin y ha sido ajustado sobre el dataset `local/maniskill_placesphere_mixed30`, un conjunto de datos de manipulación asociado al simulador ManiSkill. El sufijo `convex-0.7` no está explicado en la model card; por la nomenclatura habitual en este tipo de experimentos, apunta a una combinación convexa de pesos o políticas con coeficiente 0,7, aunque esto no puede confirmarse con la información disponible.

Se trata de un modelo denso de aproximadamente 3.501 millones de parámetros (3,5 B) distribuidos en safetensors, con un repositorio de 7,0 GB, licencia Apache 2.0 y pipeline declarado como `robotics`. Su relevancia es fundamentalmente de investigación: permite reproducir y extender experimentos de fine-tuning de π₀ sobre tareas concretas de manipulación en simulación, aunque carece por completo de evaluación publicada y de documentación sobre el procedimiento de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀ (Pi0) de Physical Intelligence, implementada en LeRobot |
| Parametros totales | 3.501.372.176 (≈3,5 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no documentada en la model card ni en los metadatos) |
| Tipos de cuantizacion | No se documentan; el repo distribuye pesos en safetensors. No se incluyen variantes GGUF ni cuantizaciones de 4/8 bits |
| Idiomas soportados | No disponible. El condicionamiento por lenguaje natural depende del dataset de entrenamiento, que no está documentado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La model card describe π₀ como un modelo visión-lenguaje-acción para control general de robots, orientado a actuar como política generalista capaz de interpretar entradas visuales e instrucciones en lenguaje natural y de controlar distintos robots en tareas diversas. La implementación de referencia es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. Los detalles concretos de arquitectura (composición del codificador visual, tamaño del modelo de lenguaje subyacente, mecanismo de generación de acciones, número de tokens de entrenamiento y composición del dataset) no se especifican en la información proporcionada, por lo que no se detallan aquí.

Respecto al entrenamiento de este checkpoint concreto, la única información disponible es el identificador del dataset: `local/maniskill_placesphere_mixed30`, alojado localmente y por tanto no resoluble públicamente. No se documentan hiperparámetros, número de pasos, si hubo ajuste por LoRA o fine-tuning completo, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en políticas de imitación). Tampoco se explica el significado de `convex-0.7` ni si implica interpolación de pesos entre checkpoints. La model card reproduce el texto genérico de LeRobot e incluye instrucciones de entrenamiento y evaluación mediante `lerobot-train` y `lerobot-record`, pero el ejemplo de entrenamiento que aparece usa `--policy.type=act`, no π₀.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de manipulación a partir de observaciones visuales, típicamente en forma de *action chunks*.
- Condicionamiento por lenguaje natural: acepta instrucciones en texto para definir la tarea, siempre que se hayan visto instrucciones equivalentes durante el entrenamiento.
- Percepción visual: procesa imágenes de cámara como entrada principal para localizar objetos y guiar la acción.
- Ejecución multi-paso: al tratarse de una política entrenada por imitación sobre episodios completos, puede encadenar subtareas dentro de una misma demostración.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-train` y `lerobot-record`, y con el flujo de trabajo de datasets y checkpoints del Hub.
- Tool calling / function calling: no aplica; no es un modelo de lenguaje conversacional.
- Agentes y razonamiento multi-paso simbólico: no disponible; no se documenta ninguna capacidad de planificación simbólica.
- Capacidades multilingües: no disponibles ni verificables; dependen del dataset, no documentado.
- Modo *thinking*, visión general o audio: no disponibles. La visión se usa como entrada de política, no como capacidad de descripción de imágenes.
- Evaluación publicada: ninguna.

## Casos de uso

- Investigación en manipulación simulada: ejecutar la política en entornos ManiSkill para estudiar el comportamiento de π₀ en tareas de *place* sobre esferas, usando `lerobot-record` con `--policy.path` apuntando a este checkpoint.
- Reproducción de experimentos de fine-tuning: servir como punto de partida para comparar estrategias de ajuste sobre el mismo dataset `maniskill_placesphere_mixed30` y medir el efecto del coeficiente 0,7 frente a otros checkpoints del mismo autor.
- Estudio de combinación de políticas: si `convex-0.7` designa efectivamente una interpolación convexa de pesos, este checkpoint permite analizar cómo afecta el coeficiente de mezcla al éxito de la tarea en simulación.
- Generación de datos de evaluación: desplegar la política en episodios controlados para producir trayectorias que después se usen como referencia o como datos de *offline RL*.
- Transferencia sim-to-real en fase exploratoria: validar primero la política en simulador y, solo si el comportamiento es estable, evaluar su traslado a un brazo real de bajo coste tipo SO-100/SO-101 soportado por LeRobot, con límites de par y parada de emergencia.
- Docencia y experimentación con modelos VLA: usar el checkpoint como ejemplo práctico de política visión-lenguaje-acción en cursos o talleres sobre robótica y aprendizaje por imitación, dado su tamaño moderado (3,5 B) y su licencia permisiva.
- Base para nuevos fine-tunings: partir de estos pesos para adaptar la política a otras tareas de manipulación con datasets propios, aprovechando que la licencia Apache 2.0 no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, curvas de entrenamiento ni comparaciones con otros checkpoints, y el repositorio registra 0 descargas y 0 *likes*, por lo que no hay evidencia pública de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los pesos ocupan aproximadamente 7 GB (coherente con el repositorio de 7,0 GB); con activaciones y buffers de visión, un presupuesto práctico de 10-12 GB es razonable. Estas cifras son estimaciones basadas en el tamaño del repo, no datos publicados.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100 o L40S para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para inferencia.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 12-16 GB o más en bf16/fp16. En GPUs de 8 GB sería necesario cuantizar o dividir el modelo, algo no documentado por el autor.
- Fine-tuning: un ajuste completo con AdamW en bf16 requiere del orden de 60-70 GB de VRAM (estimación heurística de ~16-20 bytes por parámetro); en la práctica exige A100 80 GB, H100 o reparto multi-GPU. Un ajuste con LoRA cabría en GPUs de 24 GB.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF, que no aplican a una política robótica.
- Latencia y throughput: no disponibles. En políticas VLA la latencia de inferencia suele ser el factor limitante del bucle de control, pero no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Contexto |
|---|---|---|---|---|---|
| `ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.7` | ≈3,5 B | VLA (fine-tune de π₀ sobre ManiSkill) | Apache 2.0 | Repositorio público, sin evaluaciones ni descargas | No disponible |
| π₀ base (Physical Intelligence / OpenPI, adaptado en LeRobot) | ≈3,5 B (según este repo) | VLA de propósito general | Apache 2.0 en la distribución de LeRobot | Público, con documentación y *blog* asociados | No disponible |
| π₀-FAST y otras variantes de π₀ | No disponible | VLA | No disponible | Público en el ecosistema OpenPI/LeRobot | No disponible |
| Otros VLA de la misma categoría (OpenVLA, RDT-1B, GR00T N1) | No disponible en la información proporcionada | VLA | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas, ya que no se han publicado evaluaciones.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito, comparaciones ni métricas de ningún tipo. No puede asumirse que la política funcione correctamente ni siquiera en el entorno para el que fue entrenada.
- Dataset no reproducible: el dataset referenciado, `local/maniskill_placesphere_mixed30`, es una ruta local no accesible públicamente, lo que impide reproducir el entrenamiento o verificar su composición.
- Nomenclatura sin documentar: el sufijo `convex-0.7` no se explica en la model card; cualquier interpretación sobre interpolación de políticas es especulativa.
- Model card genérica: el README reproduce la plantilla de LeRobot para π₀, e incluso el ejemplo de entrenamiento usa `--policy.type=act`, lo que sugiere que el autor no adaptó la documentación al checkpoint real.
- Alcance limitado al simulador: no hay evidencia de validación en hardware físico. Aplicar una política entrenada en simulación a un robot real conlleva riesgo de colisiones, daños materiales o lesiones; requiere límites de par, espacios de trabajo acotados y parada de emergencia.
- Contexto e idioma desconocidos: no se documenta la longitud máxima de instrucción ni los idiomas vistos en entrenamiento, por lo que el comportamiento fuera de la distribución esperada es impredecible.
- Sesgos: no evaluables con la información disponible; los sesgos de una política de manipulación proceden del dataset de demostraciones, que no es público.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos base de π₀ y de las dependencias de LeRobot/OpenPI antes de un despliegue en producto.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta. Es un artefacto de investigación sin validación por parte de la comunidad.
- Metadatos inconsistentes: la fecha de creación registrada en el Hub (2026-09-15) no resulta coherente con una publicación ya existente, lo que aconseja tratar los metadatos del repositorio con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill_placesphere_mixed30-convex-0.7
- Blog de π₀ en Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI (implementación original): https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- ManiSkill (entorno de simulación asociado al dataset): https://maniskill.ai

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a foros de atención al cliente de un operador de telecomunicaciones y no guardan relación con el contenido de esta ficha.
