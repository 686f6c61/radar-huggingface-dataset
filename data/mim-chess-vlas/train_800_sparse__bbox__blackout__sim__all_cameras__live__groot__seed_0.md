# mim-chess-vlas/train_800_sparse__bbox__blackout__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenado con LeRobot 0.6.0 sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional visión-lenguaje-acción (VLA) para robots. El autor (`mim-chess-vlas`) lo ha entrenado sobre el dataset `train_800_sparse__bbox__blackout__sim__all_cameras__live` y lo publica con licencia Apache-2.0. El modelo consume tres cámaras de 224×224 píxeles (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) más un vector de propiocepción de 9 dimensiones, y emite acciones de 7 dimensiones para un brazo Franka Panda.

El checkpoint tiene 3.144.016.000 parámetros (3,14 mil millones) según los archivos safetensors, con un tamaño de repositorio de 12,6 GB. La arquitectura combina un backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, según indica la model card del autor.

Su relevancia es acotada pero concreta: es una política de imitación reproducible (semilla 0, configuración de entrenamiento documentada) para tareas de *pick-and-place* de objetos domésticos y de cocina. No es un modelo de propósito general ni un LLM conversacional; su interés está en la investigación en manipulación robótica y en servir de línea base reproducible frente a otras semillas o configuraciones del mismo dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching (GR00T N1.7) |
| Parámetros totales | 3.144.016.000 (3,14 mil millones), según safetensors |
| Parámetros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (las 40 instrucciones del dataset están en inglés; la model card no detalla cobertura lingüística) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, en formato de política LeRobot; no se publican GGUF, ONNX ni TensorRT |
| Tipo de robot | Franka Panda |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 224, 224), `observation.images.robot0_eye_in_hand` (3, 224, 224), `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salida | `action` (7,) |
| Dataset de entrenamiento | `mim-chess-vlas/train_800_sparse__bbox__blackout__sim__all_cameras__live`: 787 episodios, 195.184 frames, 20 FPS |
| Fecha en el Hub | creado el 2026-10-28, actualizado el 2026-10-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el diseño de GR00T N1.7: un backbone vision-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las tres vistas de cámara junto con la instrucción en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. La salida es un vector de 7 dimensiones, compatible con los 6 grados de libertad más la pinza de un Panda. El espaciado temporal de acción (*action chunking*) y el número de pasos de integración del flow matching no se documentan en la información disponible.

El entrenamiento es de imitación supervisada sobre 787 episodios (195.184 frames a 20 FPS) que cubren 40 tareas del tipo «Pick the X and place it into the box», con objetos como jamón, cereal, pera, cuchillo, hervidor o seta. La configuración declarada es de 60.000 pasos, batch de 16, optimizador AdamW, learning rate 7e-5 y semilla 0, lo que equivale a 960.000 muestras procesadas; si cada muestra corresponde a un frame del dataset, serían aproximadamente 5 pasadas sobre los datos (cálculo derivado, no publicado por el autor). No se documenta ningún proceso de RLHF o DPO, lo cual es coherente con una política de imitación; tampoco se detalla la composición del dataset de preentrenamiento del backbone.

## Capacidades

- Generación de acciones de manipulación de 7 dimensiones (6 DoF + pinza) para un Franka Panda, condicionadas por tres vistas visuales y propiocepción.
- Seguimiento de instrucciones en lenguaje natural limitado al conjunto de 40 tareas de *pick-and-place* presentes en el dataset de entrenamiento.
- Fusión multi-cámara: una vista global de escena (`agentview`) y dos vistas de muñeca (`eye_in_hand`, `eye_in_hand_2`), todas a 224×224.
- Condicionamiento por propiocepción mediante un vector de estado de 9 dimensiones.
- Ejecución en bucle cerrado sobre el robot mediante `lerobot-rollout`.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, matemáticas, generación de texto libre, visión general (VQA) ni audio. El uso previsto es exclusivamente como política de control.

## Casos de uso

- **Automatización de *pick-and-place* en entorno de laboratorio**: la política recibe tres vistas de un Panda y devuelve acciones de 7 dimensiones; es directamente ejecutable con `lerobot-rollout --robot.type=Panda` indicando la tarea, por ejemplo «Pick the jam and place it into the box».
- **Línea base reproducible para experimentación**: al fijar semilla 0 y documentar pasos, batch, optimizador y learning rate, sirve como referencia contra la que comparar otras semillas y configuraciones del mismo dataset sin recalibrar el protocolo.
- **Estudio de variantes de datos de entrenamiento**: el nombre del dataset incluye los tokens `sparse`, `bbox` y `blackout`, de modo que el checkpoint permite analizar el efecto de esas variantes (dispersión de datos, recortes de caja delimitadora, oclusiones) sobre el rendimiento final, siempre que se confirmen con el autor.
- **Ajuste fino posterior sobre un robot propio**: el formato LeRobot y la licencia Apache-2.0 permiten reentrenar la política con datos de un Panda real o de otro manipulador, partiendo de un modelo ya expuesto a 40 categorías de objetos.
- **Validación de pipelines de entrenamiento en robótica**: útil en equipos que verifican su infraestructura de *imitation learning* de extremo a extremo (grabación, conversión a LeRobot, entrenamiento y despliegue) antes de invertir en datos reales.
- **Docencia y divulgación técnica**: el par modelo + dataset público + comando de ejecución documentado permite montar prácticas sobre VLA y flow matching sin partir de cero.
- **Evaluación comparativa de backbones VLM en control**: al estar construido sobre Cosmos-Reason2/Qwen3-VL, sirve para medir cuánto aporta el backbone lingüístico-visual frente a políticas puramente visuales en tareas de manipulación cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, comparaciones con otras políticas ni métricas de evaluación en el entorno, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existe validación comunitaria documentada.

## Requisitos de hardware

- **VRAM estimada (bf16)**: los 3.144.016.000 parámetros ocupan aproximadamente 6,3 GB; sumando activaciones de tres imágenes de 224×224 y el estado de decodificación del flow matching, la estimación para batch 1 es de 8-12 GB (cálculo derivado del recuento de parámetros, no publicado por el autor).
- **VRAM estimada (fp32)**: unos 12,6 GB solo en pesos, cifra que coincide con el tamaño del repositorio; es posible que el repositorio incluya pesos en fp32 o más de una copia de los mismos.
- **GPU consumer**: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) y, en el límite con batch 1, en RTX 4080 (16 GB). No se ha verificado en GPUs de 8 GB.
- **GPU de centro de datos**: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) permiten batch mayor y evaluación paralela de episodios; no hay datos de escalado publicados.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`) sobre PyTorch es la vía documentada. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni TensorRT-LLM, y no se publican pesos GGUF.
- **Latencia y throughput**: no disponibles. El número de pasos de integración del transformer de acciones, que determina buena parte de la latencia, no se especifica en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 (este checkpoint) | 3,14 mil millones | no disponible | sin benchmarks publicados | apache-2.0 | HuggingFace, formato LeRobot, 0 descargas |
| GR00T N1.5 (NVIDIA) | del orden de 3 mil millones | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace / Isaac-GR00T |
| OpenVLA-7B | 7 mil millones | no disponible | no disponible | MIT según documentación pública | HuggingFace |
| π0 (Physical Intelligence, openpi) | del orden de 3,3 mil millones | no disponible | no disponible | Apache-2.0 según documentación pública | HuggingFace / repositorio openpi |

Los datos de los modelos comparables proceden de documentación pública de cada proyecto y no han sido verificados contra la información proporcionada en esta ficha; tómense como orientativos. No se dispone de comparaciones de rendimiento entre estos modelos en el mismo entorno.

## Limitaciones y advertencias

- **Alcance muy restringido**: el modelo está entrenado exclusivamente sobre 40 instrucciones de *pick-and-place* con una lista cerrada de objetos; se espera un comportamiento degraded fuera de esa distribución, aunque no se han publicado mediciones al respecto.
- **Riesgo de alucinación motora**: como toda política de imitación, puede producir trayectorias plausibles pero incorrectas (colisiones, agarres fallidos) sin señal de incertidumbre; no se documenta ningún mecanismo de abstención ni de detección de fallo.
- **Sin benchmarks ni validación externa**: 0 descargas y 0 likes en el Hub, y ninguna tasa de éxito publicada; no hay evidencia pública de que la política funcione fuera del entorno del autor.
- **Dependencia de la configuración de cámaras**: las entradas están fijadas a tres vistas concretas con nombres de robosuite (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y resolución 224×224; cambiar la disposición, la resolución o el número de cámaras invalida el uso directo.
- **Idioma**: las instrucciones del dataset están en inglés; no hay cobertura multilingüe documentada, por lo que el uso en castellano no está verificado.
- **Ambigüedad sobre el origen de los datos**: el nombre del dataset incluye los tokens `sim`, `bbox` y `blackout`, lo que sugiere datos generados en simulación y variantes de recorte u oclusión, pero la model card no lo confirma; conviene verificarlo antes de asumir una transferencia sim-a-real.
- **Licencia**: Apache-2.0 permite uso comercial de este checkpoint, pero el modelo deriva de GR00T N1.7 y de un backbone Cosmos-Reason2/Qwen3-VL; deben revisarse por separado las licencias de esos componentes antes de un despliegue comercial.
- **Tamaño del repositorio**: 12,6 GB frente a los aproximadamente 6,3 GB esperados para 3,14 mil millones de parámetros en bf16, lo que sugiere pesos en fp32 o duplicación de archivos; conviene inspeccionar el árbol antes de desplegar.
- **Metadatos**: el modelo fue creado y actualizado el mismo día (2026-10-28), sin historial de revisiones que permita evaluar su evolución.
- **Sin soporte de cuantización**: no hay pesos GGUF ni INT8/INT4 publicados, lo que limita el despliegue en GPUs de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_sparse__bbox__blackout__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__bbox__blackout__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__bbox__blackout__sim__all_cameras__live
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo; los enlaces devueltos corresponden a entidades homónimas sin relación (grupos de radiología en Estrasburgo y el Musée des Instruments de Musique de Bruselas).
