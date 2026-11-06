# mim-chess-vlas/train_800_dense__bbox__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot, no un modelo de lenguaje al uso. Se trata de un checkpoint de GR00T N1.7, el modelo fundacional abierto de NVIDIA para razonamiento y habilidades de robots humanoides, adaptado mediante aprendizaje por imitación a una tarea concreta de manipulación (recoger objetos y depositarlos en una caja) sobre un brazo Franka Panda en simulación. El autor del repositorio es el usuario `mim-chess-vlas`, que lo publica como artefacto de entrenamiento (nombre con semilla `seed_0`), no como modelo generalista.

La arquitectura subyacente combina un backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice vectores de acción condicionados por visión, lenguaje y propriocepción. El checkpoint tiene 3.144.016.000 parámetros según los pesos en safetensors y ocupa 12,6 GB en el repositorio, lo que es coherente con un backbone VLM de varios miles de millones de parámetros más la cabeza de acciones.

Su relevancia es acotada: sirve como referencia reproducible de un entrenamiento GR00T/LeRobot sobre un dataset específico (776 episodios, 207.203 frames a 20 FPS) y como punto de partida para quien quiera replicar o comparar pipelines de imitation learning en robótica. No es un modelo para generación de texto ni para uso conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone VLM (Cosmos-Reason2/Qwen3-VL) que procesa observaciones visuales e instrucciones en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera trayectorias de acción continuas. La política consume cuatro cámaras de 224x224 (vista del agente, dos vistas de la pinza y una máscara) más un vector de estado de 9 dimensiones, y produce acciones de 7 dimensiones (típicamente pose del efector final más apertura de pinza).

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_dense__bbox__separate_channel__sim__all_cameras__live`: 776 episodios, 207.203 frames a 20 FPS, con 40 variantes de instrucción del tipo "Pick the X and place it into the box". La configuración reportada es de 60.000 pasos, batch size 16, optimizador AdamW, learning rate 7e-5 y semilla 0. No se documenta el número total de tokens de entrenamiento del backbone ni si hubo fases de RLHF/DPO; al ser un modelo de imitación supervisada, no aplica el alineamiento conversacional.

## Capacidades

- Control robótico por imitación: predice acciones de 7 dimensiones para un Franka Panda a partir de observaciones visuales y de estado.
- Fusión multimodal de cuatro cámaras (vista global, dos vistas de muñeca y máscara de segmentación) con instrucción en lenguaje natural.
- Seguimiento de instrucciones de tarea del tipo "Pick the <objeto> and place it into the box" para 40 categorías de objetos.
- Condicionamiento por propriocepción mediante un vector de estado de 9 dimensiones.
- Ejecución de políticas en robot real o simulado mediante `lerobot-rollout`.
- No soporta tool calling, agentes multi-paso, generación de texto libre ni capacidades de audio.

## Casos de uso

- Recogida y colocación en simulación: ejecutar la política sobre un Panda en un entorno simulado para validar el pipeline de entrenamiento antes de transferir a hardware, usando `lerobot-rollout` con las cuatro cámaras configuradas.
- Baseline reproducible para investigación en imitation learning: sirve como referencia con semilla fija (`seed_0`) y configuración documentada para comparar variantes de arquitectura o de dataset.
- Estudio de representaciones vision-lenguaje en robótica: permite analizar cómo el backbone Qwen3-VL condiciona las acciones ante distintas instrucciones de objeto.
- Prototipado de tareas pick-and-place en laboratorio: adaptar el checkpoint con fine-tuning sobre un dataset propio de objetos y caja para evaluar la transferibilidad del modelo fundacional.
- Evaluación de robustez ante variaciones de cámara: el uso de vistas redundantes (agente, dos de muñeca y máscara) permite estudiar la contribución de cada canal visual.
- Docencia y demostraciones de LeRobot: ejemplo completo de entrenamiento y despliegue con la CLI de LeRobot 0.6.0, útil en cursos de robótica de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144 millones de parámetros en safetensors, la inferencia en precisión completa requiere del orden de 12-13 GB solo para pesos, más activaciones y buffers de las cuatro cámaras.
- GPU recomendadas: no disponible en la documentación; por tamaño, una GPU con 24 GB o más (RTX 4090, L40S, A100) es un punto de partida razonable, sin confirmación del autor.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en FP16/BF16; no confirmado para GPUs de 16 GB o menos.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path` apuntando al repositorio; el ecosistema LeRobot es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la política opera a 20 FPS según el dataset de entrenamiento, pero no se reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned) | 3.144 M | no disponible | Pick-and-place Panda (40 objetos) | Apache 2.0 | Hugging Face, 22 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitation learning por tarea | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de tarea específica, no un modelo general: solo se ha entrenado para pick-and-place de 40 objetos concretos sobre un Panda en el dataset indicado.
- El dataset es de simulación (`sim` en el nombre), por lo que la transferencia a robot real no está validada en la model card.
- Riesgo de sobreajuste al entorno y a las cámaras exactas del dataset (resoluciones 224x224, cuatro vistas concretas); cambios de cámara o iluminación pueden degradar el rendimiento.
- No hay información sobre sesgos, robustez ante objetos no vistos ni tasas de éxito medidas.
- Las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y sus dependencias (Cosmos-Reason2/Qwen3-VL) deben verificarse por separado.
- El nombre del repositorio incluye la semilla y la configuración de entrenamiento; no se trata de un release estable ni versionado.
- Solo 22 descargas y 0 likes: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_dense__bbox__separate_channel__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__bbox__separate_channel__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__bbox__separate_channel__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
