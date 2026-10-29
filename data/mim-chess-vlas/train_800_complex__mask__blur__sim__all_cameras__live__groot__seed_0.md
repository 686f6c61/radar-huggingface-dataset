# mim-chess-vlas/train_800_complex__mask__blur__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política robótica de tipo visión-lenguaje-acción (VLA) construida sobre GR00T N1.7, el modelo fundacional *cross-embodiment* de NVIDIA para razonamiento y habilidades en robots humanoides. La arquitectura combina un backbone de visión y lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en *flow matching* que predice trayectorias condicionadas por imagen, instrucción en lenguaje natural y propiocepción. El autor del *fine-tune* es `mim-chess-vlas` y la política está empaquetada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación.

Frente al modelo base, esta versión está especializada en una única familia de tareas: coger objetos de formas complejas (piezas tipo estrella, con forma de huevo, con lóbulos, anillos, etc.) y depositarlos en una caja. El conjunto de entrenamiento contiene 790 episodios y 157.904 fotogramas a 20 FPS, capturados con un robot `Panda` y tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`). El nombre del repositorio codifica la receta de entrenamiento: 800 episodios complejos, con máscaras y desenfoque, datos simulados, todas las cámaras, semilla 0.

Su relevancia es doble: por un lado demuestra el flujo de trabajo de *fine-tuning* de un modelo fundacional robótico con LeRobot; por otro, sirve como referencia reproducible (semilla fija) para estudiar el efecto del aumento de datos y de la configuración de cámaras en tareas de manipulación. Con 3,14 mil millones de parámetros, es un modelo que cabe en GPU de consumo y que se puede desplegar en laboratorio sin infraestructura dedicada. No obstante, se trata de un artefacto de investigación con cero descargas y sin métricas de éxito publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (NVIDIA): backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching (VLA) |
| Parámetros totales | 3.144.016.000 (≈3,14 mil millones, dato real de safetensors) |
| Parámetros activos | No aplica: la información disponible no describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; pesos publicados en safetensors (repositorio de 12,6 GB) |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset están redactadas en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, en formato de política LeRobot |
| Tipo de robot | `Panda` (Franka Emika) |
| Cámaras | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Librería | LeRobot |

Interfaz de entrada y salida declarada en la model card:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(9,)` |
| `observation.images.agentview` | VISUAL | `(3, 224, 224)` |
| `observation.images.robot0_eye_in_hand` | VISUAL | `(3, 224, 224)` |
| `observation.images.robot0_eye_in_hand_2` | VISUAL | `(3, 224, 224)` |
| `action` | ACTION | `(7,)` |

## Arquitectura y entrenamiento

El modelo sigue el diseño de GR00T N1.7: un backbone de visión y lenguaje (Cosmos-Reason2/Qwen3-VL) que interpreta las tres vistas de cámara junto con la instrucción textual de la tarea, y una cabeza de acción implementada como transformer de *flow matching* que genera vectores de acción de 7 dimensiones condicionados además por el estado propioceptivo de 9 dimensiones. Este esquema de difusión por *flow matching* permite modelar distribuciones multimodales de trayectorias (varias formas válidas de agarrar un objeto) sin discretizar el espacio de acciones, algo crítico en manipulación con objetos de geometría irregular. El modelo es *cross-embodiment* por diseño, aunque esta instancia está especializada en un único robot y una única célula de trabajo.

El entrenamiento se realizó por imitación supervisada sobre el dataset `train_800_complex__mask__blur__sim__all_cameras__live`: 790 episodios, 157.904 fotogramas a 20 FPS, con 22 instrucciones de tarea distintas que describen verbalmente la geometría del objeto a coger. La nomenclatura del repositorio indica el uso de máscaras y desenfoque como aumento de datos, datos de origen simulado y las tres cámaras activas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición completa del dataset, ni si hubo etapas de RLHF o DPO; en un modelo de acción esto último es esperable que no aplique. Tampoco se detalla la innovación técnica concreta del *fine-tune* respecto al modelo base más allá de la receta de datos.

## Capacidades

- Generación de acciones de manipulación de 7 grados de libertad a partir de tres vistas de cámara, estado propioceptivo de 9 dimensiones e instrucción en lenguaje natural.
- Comprensión de instrucciones textuales largas y descriptivas sobre geometría de objetos (forma, lóbulos, ranuras, protuberancias) gracias al backbone Qwen3-VL.
- Ejecución de tareas de *pick-and-place* sobre objetos de geometría compleja y no trivial (estrellas de cuatro puntas, huevos, anillos con radios, bloques con ranuras).
- Fusión multi-cámara: vista global de la escena más dos vistas de muñeca, lo que aporta robustez ante oclusiones.
- Política de control a 20 FPS, compatible con bucles de control en tiempo casi real.
- Capacidad de *fine-tuning* adicional sobre nuevas tareas mediante LeRobot.
- No es un modelo conversacional: no genera texto libre, no soporta *tool calling* ni *function calling*, y no implementa razonamiento multi-paso explícito más allá de la planificación implícita en la secuencia de acciones.
- No dispone de modo *thinking*, capacidades de audio ni procesamiento de vídeo temporal explícito documentado.

## Casos de uso

- **Bin picking de precisión en línea de montaje**: la política puede recoger piezas de geometría irregular (forma de huevo, lóbulos, anillos) desde una bandeja y depositarlas en una caja, usando las dos vistas de muñeca para resolver oclusiones parciales cuando las piezas se apilan.
- **Investigación en sim-to-real**: al estar entrenada con datos simulados y un conjunto de validación etiquetado como `live`, sirve para medir la brecha entre simulación y realidad en una tarea de manipulación concreta, comparando tasas de éxito en ambos dominios.
- **Ablación reproducible de aumento de datos**: el nombre del repositorio fija máscaras, desenfoque y semilla 0, lo que permite entrenar variantes (sin máscara, sin desenfoque, otra semilla) y atribuir diferencias de rendimiento al cambio introducido.
- **Base para *fine-tuning* con pocos datos**: con 790 episodios a 20 FPS se puede replicar la receta en una célula nueva y estimar cuántas horas de demostración hacen falta para una tarea de picking similar en un robot Franka Panda.
- **Evaluación de arquitecturas VLA multi-cámara**: permite comparar el rendimiento de configuraciones de una, dos y tres cámaras sobre la misma tarea, aislando la contribución de la vista `agentview` frente a las dos vistas de muñeca.
- **Generación de rollouts sintéticos en Isaac Sim / Isaac Lab**: la política se puede ejecutar en simulación para producir trayectorias etiquetadas que alimenten un bucle de entrenamiento iterativo o de *data augmentation*.
- **Docencia y prototipado en robótica**: al caber en una GPU de consumo, es un punto de partida realista para cursos de aprendizaje por imitación donde el alumnado entrena y evalúa una política VLA completa.
- **Banco de pruebas de pipelines LeRobot**: útil para validar el flujo de entrenamiento, registro y despliegue de LeRobot con el backend GR00T antes de invertir en datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, errores de posición final, ni comparaciones con el modelo base GR00T N1.7 o con otras políticas sobre el mismo dataset.

## Requisitos de hardware

- **Peso de los parámetros**: 3.144.016.000 parámetros equivalen a unos 6,3 GB en BF16/FP16 y unos 12,6 GB en FP32. El repositorio ocupa 12,6 GB, aproximadamente el doble del peso en BF16, lo que sugiere artefactos adicionales no detallados en la model card.
- **VRAM estimada para inferencia**: entre 8 y 12 GB en BF16 (estimación propia a partir del peso más las activaciones del backbone VLM y las tres imágenes de 224×224). En FP32, por encima de 14 GB.
- **Cuantización**: pesos en 8 bits, en torno a 3,5 GB; en 4 bits, en torno a 2 GB (estimaciones aritméticas, no validadas por el autor ni documentadas para este modelo).
- **GPU de consumo**: cabe con holgura en RTX 4090 y RTX 3090 (24 GB); previsiblemente en RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) en BF16, con margen ajustado en esta última.
- **GPU de centro de datos**: A100, H100 y L40S sin problema; permiten además ejecutar varias réplicas o el entrenamiento completo en una sola tarjeta.
- **Opciones de despliegue**: LeRobot es la vía nativa (guía específica de GR00T en la documentación); el modelo se ejecuta sobre PyTorch. No hay constancia de soporte para vLLM, TGI, llama.cpp u Ollama, que además no encajan con una política de acción.
- **Latencia y throughput**: no publicados. Como referencia de diseño, el dataset está capturado a 20 FPS, lo que fija un presupuesto de 50 ms por paso de control; el cumplimiento real de ese presupuesto en inferencia no está documentado.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune de GR00T N1.7) | VLA para manipulación | 3,14 mil M | No disponible | Apache-2.0 | HuggingFace, formato LeRobot |
| GR00T N1.7 (modelo base, NVIDIA) | VLA fundacional *cross-embodiment* | No disponible en la información | No disponible | No disponible en la información | GitHub de Isaac-GR00T |
| OpenVLA | VLA para manipulación | No disponible en la información | No disponible | No disponible en la información | Pesos públicos |
| π0 (Physical Intelligence) | VLA para control de robots | No disponible en la información | No disponible | No disponible en la información | No disponible en la información |

Los datos de los modelos alternativos no aparecen en la información proporcionada, por lo que no se pueden comparar cifras de rendimiento ni de contexto. Cualquier comparación cuantitativa requeriría consultar sus respectivas model cards.

## Limitaciones y advertencias

- **Modelo de tarea única**: la política está entrenada exclusivamente para coger objetos y meterlos en una caja. Fuera de esa distribución de objetos, cámara y robot, el comportamiento no está garantizado.
- **Sin métricas publicadas**: cero descargas, cero *likes* y ninguna tasa de éxito reportada. No hay evidencia pública de que la política funcione correctamente, ni siquiera en el propio entorno de entrenamiento.
- **Riesgo de sobreajuste**: 790 episodios para 22 instrucciones distintas y 3,14 mil millones de parámetros es una proporción baja de datos por parámetro; es esperable un ajuste fuerte a la disposición concreta de la célula de trabajo.
- **Dependencia de hardware específico**: requiere exactamente tres cámaras con los nombres y resoluciones indicados (224×224) y un estado propioceptivo de 9 dimensiones. Cambiar la configuración de sensores invalida la entrada del modelo.
- **Origen simulado de los datos**: el nombre del dataset incluye `sim`, por lo que el modelo puede explotar artefactos del renderizador. El sufijo `live` del repositorio no aclara si hay datos reales mezclados; la model card no lo detalla.
- **Alucinación en el sentido robótico**: en modelos de acción se traduce en trayectorias plausibles pero físicamente inválidas (colisiones, agarres fallidos) cuando la escena se aleja de la distribución de entrenamiento. No hay estimación cuantitativa de esta tasa.
- **Idiomas**: las instrucciones del dataset están en inglés; no se documenta comportamiento en castellano ni en otros idiomas, aunque el backbone Qwen3-VL sea multilingüe.
- **Licencia**: el artefacto se publica bajo Apache-2.0, lo que permite uso comercial. Conviene verificar por separado las condiciones del modelo base GR00T N1.7 de NVIDIA y de los componentes Qwen3-VL/Cosmos-Reason2 antes de un despliegue comercial.
- **Model card auto-generada**: contiene comentarios de plantilla sin rellenar y enlaces de demostración comentados; la información técnica es escasa y no ha sido revisada en profundidad por el autor.
- **Fecha de creación futura**: los metadatos indican 2026-10-29, lo que conviene tener en cuenta al citar el artefacto.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_complex__mask__blur__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__mask__blur__sim__all_cameras__live
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Nota: los resultados de la búsqueda web proporcionados no contienen enlaces relevantes para este modelo; corresponden a entidades no relacionadas (grupos de radiología y un museo de instrumentos musicales).
