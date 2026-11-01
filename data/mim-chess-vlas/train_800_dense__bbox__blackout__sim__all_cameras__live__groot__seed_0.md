# mim-chess-vlas/train_800_dense__bbox__blackout__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. La política está especializada en una tarea concreta de manipulación pick-and-place sobre un robot Franka Panda en entorno simulado: recoger un objeto de una lista de 40 categorías (alimentos, utensilios, menaje) y depositarlo en una caja. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propiocepción.

Con 3.144.016.000 parámetros totales (aproximadamente 3,14 mil millones) y un tamaño de repositorio de 12,6 GB en formato safetensors, se trata de un modelo denso, no MoE. La política consume tres cámaras RGB de 224x224 (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) más un vector de estado de 9 dimensiones, y produce un vector de acción de 7 dimensiones. El checkpoint corresponde al seed 0 de un entrenamiento de 60.000 pasos con batch size 16 y learning rate 7e-05.

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de fine-tuning de un modelo fundacional robótico sobre un dataset de imitación concreto; por otro, el nombre del repositorio sugiere variantes experimentales (bbox, blackout, sim, all_cameras, live) que apuntan a estudiar robustez ante oclusiones y uso de múltiples cámaras. La licencia Apache 2.0 facilita su reutilización comercial, aunque las capacidades reales están acotadas al dominio de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7 de NVIDIA: un backbone visión-lenguaje basado en Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales y las instrucciones en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera trayectorias de acción continuas condicionadas por visión, lenguaje y propiocepción. El modelo es cross-embodiment en su concepción, pero este checkpoint concreto está especializado en el robot `Panda` con tres cámaras y un estado de 9 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_dense__bbox__blackout__sim__all_cameras__live`, compuesto por 776 episodios y 207.203 frames a 20 FPS en entorno simulado. La configuración reportada es de 60.000 pasos, batch size 16, optimizador AdamW y learning rate 7e-05 con seed 0. No se documentan en la información disponible detalles sobre el volumen total de tokens, la composición exacta del dataset más allá de las tareas, ni si hubo etapas de RLHF o DPO específicas para este checkpoint.

## Capacidades

- Manipulación robótica pick-and-place: predice acciones de 7 dimensiones para recoger uno de 40 objetos y colocarlo en una caja.
- Percepción multi-cámara: integra tres vistas RGB simultáneas (`agentview` y dos cámaras en la muñeca) a 224x224.
- Condicionamiento por lenguaje natural: acepta instrucciones del tipo "Pick the jam and place it into the box" para seleccionar el objeto objetivo.
- Fusión de propiocepción y visión: combina un vector de estado de 9 dimensiones con las observaciones visuales.
- Ejecución de políticas de imitación en tiempo real: compatible con el flujo `lerobot-rollout` sobre robot Panda.
- Generalización limitada al conjunto de objetos y al entorno simulado vistos en entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, diálogo multilingüe ni modos de razonamiento explícito, al tratarse de una política robótica y no de un modelo conversacional.

## Casos de uso

- Automatización de pick-and-place en simulación: ejecutar la política sobre un Panda simulado para validar pipelines de imitación antes de transferir a hardware real, usando las tres cámaras y la instrucción de lenguaje para seleccionar el objeto.
- Benchmark de robustez ante oclusiones: el sufijo `blackout` del dataset sugiere entrenamiento con apagones u oclusiones; útil para estudiar la degradación de la política cuando una cámara pierde información.
- Estudio de fusión multi-cámara: comparar el rendimiento con `all_cameras` frente a configuraciones de una sola vista para cuantificar la contribución de cada cámara en la precisión de agarre.
- Base para fine-tuning en dominios logísticos: reentrenar el checkpoint sobre un dataset propio de almacén para adaptar la política a nuevas categorías de objetos y contenedores.
- Generación de datos sintéticos y aumento: usar la política como generador de trayectorias en simulación para ampliar datasets de imitación con variaciones de iluminación y posición.
- Investigación en modelos fundacionales robóticos: servir como referencia reproducible (seed 0, hiperparámetros documentados) para experimentos de ablación sobre arquitectura GR00T y flow matching.
- Docencia y prototipado rápido: desplegar una política funcional con `lerobot-rollout` en un laboratorio con robot Panda para demostrar el ciclo completo de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,14 mil millones de parámetros en fp16 se requieren aproximadamente 6,3 GB solo para pesos; en fp32 unos 12,6 GB. A esto hay que sumar activaciones y buffers del transformer de acciones y del backbone visión-lenguaje, por lo que se recomienda al menos 16 GB de VRAM en fp16.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia cómoda en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) en fp16; en GPUs de 16 GB puede requerir cuantización o reducción de batch.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) como vía principal documentada; al ser un checkpoint LeRobot con safetensors, es compatible con el ecosistema HuggingFace, aunque no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI para este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la frecuencia de control del robot (el dataset se grabó a 20 FPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned) | 3,14 B | no disponible | Pick-and-place Panda simulado | Apache 2.0 | HuggingFace |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot ACT/Diffusion | típicamente < 1 B | no aplica | Imitación robótica por tarea | Apache 2.0 | HuggingFace / LeRobot |
| OpenVLA | ~7 B | no disponible | Manipulación generalista | no disponible | HuggingFace |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de la tabla para modelos externos reflejan conocimiento general y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Especialización estrecha: la política solo se ha entrenado para las 40 tareas de pick-and-place listadas y el robot Panda; no generaliza a otras tareas, robots o entornos sin fine-tuning.
- Entorno simulado: el dataset es `sim`, por lo que existe una brecha de sim-to-real no cuantificada en la información disponible.
- Dependencia de las cámaras: requiere exactamente las tres vistas (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a 224x224; cambiar la configuración de cámaras puede degradar el rendimiento.
- Riesgo de alucinación de acciones: como política de imitación, puede generar trayectorias fuera de distribución ante objetos o disposiciones no vistas, sin mecanismo explícito de rechazo.
- Sesgos de dataset: 776 episodios y 207.203 frames son un volumen modesto; el sesgo hacia posiciones, iluminación y objetos del simulador puede limitar la robustez.
- Idiomas: no se documenta soporte multilingüe; las instrucciones de tarea están en inglés.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las licencias del backbone Cosmos-Reason2/Qwen3-VL y de los datos subyacentes.
- Sin benchmarks publicados: no hay métricas de éxito (success rate) reportadas, lo que impide evaluar su rendimiento frente a alternativas.
- Repositorio con 24 descargas y 0 likes: ecosistema de validación muy limitado; no hay evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_dense__bbox__blackout__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__bbox__blackout__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__bbox__blackout__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
