# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_3k

## Resumen

Este repositorio contiene un *policy* de robótica entrenado con LeRobot: un ajuste fino de π₀.₅ (pi05), el modelo Vision-Language-Action de Physical Intelligence orientado a la generalización en entornos abiertos. El modelo base es `lerobot/pi05_base` y esta versión concreta se ha entrenado durante 3000 pasos (batch 16, optimizador AdamW, *learning rate* 5e-05, semilla 0) sobre un dataset propio de 200 episodios y 69.392 fotogramas a 20 FPS, equivalente a unos 58 minutos de grabación.

El modelo resuelve el problema clásico de la imitación robótica: mapear observaciones multimodales (estado del robot e imágenes de tres cámaras) a acciones de control de 7 dimensiones. Con 4.143.404.816 parámetros (unos 4,14 mil millones) y pesos en formato safetensors, es un modelo de tamaño medio diseñado para ejecutarse en un robot Panda con tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`).

Su relevancia es doble. Por un lado, sirve como punto de partida reproducible para *fine-tuning* con datasets pequeños, algo poco habitual en el ecosistema VLA, donde los entrenamientos suelen requerir miles de horas de datos. Por otro, forma parte de la familia `sam-guided-vlas`, que explora aumento de datos guiado por segmentación (máscaras y superposiciones, `overlay_a75`) para mejorar la generalización visual de políticas robóticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot adaptada del repositorio OpenPI de Physical Intelligence |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es estado + 3 imágenes de 224x224) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin especificar precisión |
| Idiomas soportados | no disponible (el condicionamiento por tarea usa etiquetas cortas en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,4 GB |
| Entrada: estado | `observation.state`, forma `(9,)` |
| Entrada: visión | `observation.images.agentview`, `observation.images.robot0_eye_in_hand`, `observation.images.robot0_eye_in_hand_2`, cada una `(3, 224, 224)` |
| Salida | `action`, forma `(7,)` |
| Robot objetivo | Panda |
| Frecuencia de control del dataset | 20 FPS |
| Librería | lerobot (versión 0.6.0 en el entrenamiento) |
| Modelo base | lerobot/pi05_base |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card describe el modelo como un Vision-Language-Action (VLA) de la familia π₀.₅, cuyo objetivo declarado es generalizar a entornos y situaciones nunca vistos durante el entrenamiento, evolucionando el diseño de π₀. La implementación disponible en este repositorio procede de la adaptación de LeRobot del repositorio OpenPI. La información proporcionada no detalla la composición interna (backbone de visión-lenguaje, mecanismo de decodificación de acciones ni tipo de cabecera), por lo que no se puede confirmar aquí si emplea *flow matching*, discretización de acciones u otro esquema. El modelo no es autorregresivo en texto: consume observaciones y emite directamente un vector de acción continuo.

El entrenamiento se realizó por *fine-tuning* supervisado desde `lerobot/pi05_base` con 3000 pasos y batch de 16, lo que equivale a 48.000 muestras procesadas. No se menciona RLHF, DPO ni ningún tipo de ajuste por preferencias. El dataset (`sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live`) contiene 200 episodios, 69.392 fotogramas a 20 FPS y 20 tareas de manipulación: "basket", "boxed food", "cake", "can", "hamburger", "lemon", "orange", "spice", "squash", "spray", "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", "pear", "potato", "sweet potato" y "scone". La nomenclatura del dataset sugiere el uso de máscaras y superposiciones guiadas por SAM, así como de todas las cámaras disponibles, aunque la model card no documenta el proceso de aumento.

## Capacidades

- Generación de acciones de control de 7 dimensiones (típicamente pose del efector final más pinza) a partir de estado proprioceptivo de 9 dimensiones.
- Percepción visual multi-cámara: procesa simultáneamente una vista de agente y dos vistas de muñeca a resolución 224x224.
- Manipulación de objetos: cubre 20 categorías de tareas de recogida y colocación sobre una pila común ("pile").
- Condicionamiento por tarea: la inferencia acepta instrucciones cortas de tarea mediante el parámetro `--task` (por ejemplo, `--task="basket"`).
- Generalización a entornos nuevos: es el objetivo declarado de π₀.₅ frente a π₀, aunque no hay evaluación publicada que lo cuantifique en este ajuste.
- Ejecución en bucle cerrado sobre robot real mediante `lerobot-rollout`, con estrategia base o con grabación de episodios.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso en lenguaje, ni capacidades de audio.
- No se documentan capacidades multilingües.

## Casos de uso

- **Fine-tuning con datos propios de bajo presupuesto**: con solo 3000 pasos y 200 episodios, este ajuste demuestra que es viable adaptar un VLA de 4,14B a un conjunto de tareas concreto en horas de GPU, no en semanas. Sirve como plantilla para equipos que quieran replicar el flujo con su propio robot.
- **Investigación en aumento de datos guiado por SAM**: el repositorio pertenece a la familia `sam-guided-vlas` y su dataset incorpora máscaras y superposiciones (`overlay_a75`). Es un punto de comparación directo para medir si ese tipo de aumento mejora la generalización visual frente a un entrenamiento sin aumento.
- **Despliegue en robot Panda real**: mediante `lerobot-rollout` con `--robot.type=Panda` y tres cámaras configuradas, el modelo ejecuta tareas de recogida como "basket" durante el tiempo indicado en `--duration`. Es el caso de uso principal documentado en la model card.
- **Evaluación de técnicas de imitación en manipulación apilada**: el dataset se centra en una tarea de tipo *pile* con 20 objetos de supermercado, lo que permite usarlo como banco de pruebas para estudiar el efecto de la posición de los objetos, la iluminación o los distractores en la tasa de éxito.
- **Recogida y clasificación de comestibles en entorno controlado**: las categorías del dataset (frutas, botes, cajas de cereales, utensilios) se corresponden con tareas de *picking* en almacén o cocina experimental; el modelo puede integrarse en una celda de manipulación para validar el agarre y la colocación.
- **Reproducción de resultados y *baseline* interno**: al publicarse con semilla 0, 3000 pasos y una configuración completa, es un *baseline* reproducible para comparar arquitecturas, hiperparámetros o estrategias de aumento dentro del mismo robot y dataset.
- **Generación de datos sintéticos en bucle**: al ejecutar la política de forma indefinida (omitiendo `--duration`) se pueden recoger episodios nuevos con la propia política para analizar derivas o fallos sistemáticos de la distribución aprendida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla de tabla de éxitos por tarea, pero permanece vacía y acompañada de la frase "No evaluation results have been provided for this policy yet". No se dispone por tanto de tasas de éxito, comparaciones con π₀ ni métricas de simulación o de robot real.

## Requisitos de hardware

- **VRAM para inferencia (estimación a partir de los 4.143.404.816 parámetros publicados)**: en bf16/fp16 los pesos ocupan unos 8,3 GB; con activaciones y buffers de las tres cámaras, el consumo razonable se sitúa en el rango de 10-14 GB. En fp32 los pesos solos rondan los 16,6 GB.
- **GPU recomendadas para inferencia**: NVIDIA RTX 4090 o RTX 3090 (24 GB) sin problemas; RTX 4080/4070 Ti SUPER (16 GB) y RTX 4060 Ti (16 GB) quedan ajustadas pero son viables en bf16. Para entrenamiento con batch 16 se necesitan GPUs de centro de datos (A100 40/80 GB, H100) o varias GPU de 24 GB.
- **¿Cabe en GPU de consumo?**: sí. Una única GPU de 24 GB es suficiente para inferencia e incluso para *fine-tuning* con batch reducido; el repositorio pesa 9,4 GB, por lo que también es descargable y almacenable en un equipo de sobremesa.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento) sobre PyTorch y safetensors. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto sino una política de control robótico.
- **Latencia y throughput**: el dataset está grabado a 20 FPS, lo que implica un objetivo de 50 ms por paso de control, pero no se publica ninguna medición de latencia real, tasa de éxito ni *throughput* de inferencia. Tampoco se documenta si el modelo utiliza decodificación especulativa o algún mecanismo de aceleración de la generación de acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (pi05, `sam-guided-vlas`) | 4,14B | estado (9,) + 3 imágenes 224x224 | Sin resultados de evaluación | apache-2.0 | HuggingFace, formato safetensors + LeRobot |
| `lerobot/pi05_base` | 4,14B (misma familia) | Mismo esquema de observación | No disponible | apache-2.0 | HuggingFace |
| π₀ (pi0, predecesor de π₀.₅) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Referenciado por el autor, sin datos en esta ficha |
| OpenVLA y otros VLA de manipulación | no disponible en la información proporcionada | no disponible | no disponible | no disponible | No disponible |

La comparación cuantitativa con alternativas de la misma categoría no puede realizarse con la información proporcionada: no hay métricas de éxito del ajuste ni datos verificables de los modelos competidores en las fuentes consultadas.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no existe ninguna tasa de éxito medida, ni en simulación ni en robot real. Cualquier uso en producción debe ir precedido de una evaluación propia.
- **Dataset pequeño**: 200 episodios y 3000 pasos de entrenamiento son un régimen reducido; el riesgo de sobreajuste a las posiciones, iluminación y objetos concretos del dataset es alto.
- **Rigidez de configuración**: el modelo espera exactamente tres cámaras con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`, un estado de 9 dimensiones y un robot Panda. Cambiar la disposición de sensores o el robot invalida la política.
- **Brecha simulación-real**: la nomenclatura del dataset contiene los términos `sim` y `live`, lo que apunta a una mezcla de datos simulados y reales; la model card no aclara la proporción ni las condiciones de captura, un factor crítico para el rendimiento en el mundo físico.
- **Espacio de acción fijo de 7 dimensiones**: no admite robots con otra morfología o con más grados de libertad sin reentrenamiento.
- **Idioma y condicionamiento**: las tareas se especifican con etiquetas cortas en inglés extraídas del dataset; no hay soporte multilingüe ni comprensión de instrucciones largas en lenguaje natural.
- **Sesgo de datos y de anotación**: al provenir de un pipeline con máscaras y superposiciones guiadas por SAM, la política puede depender de artefactos visuales presentes en el entrenamiento y degradarse si estos no aparecen en el despliegue.
- **Riesgo físico**: no es un modelo de texto y no "alucina" en el sentido lingüístico, pero sí puede emitir acciones incorrectas o inseguras. Es obligatorio operar con parada de emergencia, límites de par y supervisión humana.
- **Licencia**: los pesos se publican bajo Apache 2.0, lo que en principio permite uso comercial; conviene verificar igualmente las condiciones del modelo base `lerobot/pi05_base` y de la implementación original de π₀.₅ antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_3k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: no se han encontrado enlaces técnicos relevantes. Los resultados devueltos corresponden a una serie de televisión francesa, a un fabricante de utillaje y al portal de contratación pública de Estados Unidos, sin relación con el modelo.
