# mim-chess-vlas/train_800_sparse__mask__blur__sim__all_cameras__live__groot__seed_0

## Resumen

`train_800_sparse__mask__blur__sim__all_cameras__live__groot__seed_0` es una política robótica de imitación publicada por el usuario `mim-chess-vlas` en HuggingFace Hub. No es un modelo de lenguaje generalista, sino un checkpoint entrenado con LeRobot sobre la arquitectura GR00T (concretamente, según la model card, GR00T N1.7 de NVIDIA), un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides.

El modelo resuelve una tarea concreta de manipulación: recoger un objeto de una lista cerrada de 40 categorías (jamón, cereal, pera, cebolla, etc.) y depositarlo en una caja. Se ha entrenado sobre un dataset propio de 787 episodios y 195.184 frames a 20 FPS, con tres cámaras (vista del agente y dos cámaras en la pinza) y un estado proprioceptivo de 9 dimensiones, produciendo acciones de 7 dimensiones para un robot Franka Panda.

Su relevancia es la de un ejemplo práctico y reproducible de fine-tuning de un modelo fundacional robótico con LeRobot 0.6.0: muestra cómo adaptar GR00T a una tarea de pick-and-place con datos teleoperados y un pipeline estándar. El repo ocupa 12,6 GB y contiene 3.144.016.000 parámetros en safetensors, coherente con el backbone Cosmos-Reason2/Qwen3-VL que menciona la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo consume instrucciones de tarea en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone vision-language basado en Cosmos-Reason2/Qwen3-VL que procesa observaciones visuales e instrucciones en lenguaje natural, acoplado a un transformer de acciones que genera trayectorias mediante flow matching. Las observaciones incluyen tres imágenes RGB de 224x224 (vista del agente y dos cámaras en la pinza) y un vector de estado de 9 dimensiones; la salida es un vector de acción de 7 dimensiones, típico de un brazo Franka Panda con pinza paralela.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `mim-chess-vlas/train_800_sparse__mask__blur__sim__all_cameras__live`: 787 episodios, 195.184 frames a 20 FPS, con 40 tareas de tipo "Pick the X and place it into the box". La configuración reportada es de 60.000 pasos, batch size 16, optimizador AdamW y learning rate 7e-05, con semilla 0. No se documenta en la información disponible si hubo RLHF, DPO ni detalles sobre la composición exacta del dataset más allá de los episodios y las tareas.

## Capacidades

- Generación de acciones robóticas de manipulación (7 dimensiones) condicionadas por visión, lenguaje y propriocepción.
- Ejecución de tareas de pick-and-place sobre 40 categorías de objetos domésticos y de cocina.
- Comprensión de instrucciones de tarea en lenguaje natural (formato "Pick the X and place it into the box").
- Fusión de tres vistas de cámara (vista global y dos cámaras en la pinza) para localización y agarre.
- Política de imitación entrenada end-to-end con LeRobot, ejecutable mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código ni modalidades de audio.

## Casos de uso

- **Automatización de picking en almacén o cocina:** la política puede recoger objetos de una lista cerrada de 40 categorías y colocarlos en una caja, adecuada para tareas repetitivas de clasificación con un brazo Franka Panda y tres cámaras.
- **Prototipado de modelos fundacionales robóticos:** sirve como punto de partida para fine-tuning de GR00T N1.7 con LeRobot sobre nuevos datasets de teleoperación, gracias al pipeline documentado y a la licencia Apache 2.0.
- **Investigación en imitación visual-motora:** el checkpoint permite reproducir experimentos de behavior cloning con observaciones multi-cámara y estado proprioceptivo, comparando semillas y configuraciones (el nombre del repo indica `seed_0`).
- **Evaluación de robustez ante variaciones visuales:** el nombre del dataset sugiere variantes con máscaras, desenfoque y datos simulados (`sparse`, `mask`, `blur`, `sim`), útil para estudiar la generalización de políticas ante perturbaciones.
- **Integración en pipelines de robótica con LeRobot:** se puede desplegar con `lerobot-rollout` sobre un robot Panda real, lo que facilita pruebas de extremo a extremo en laboratorio.
- **Generación de datos sintéticos y aumento de dataset:** al estar entrenado sobre datos simulados y reales (`sim` y `live`), puede emplearse como baseline para comparar políticas entrenadas solo con simulación frente a mixtas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible en la información proporcionada. Con 3.144 millones de parámetros, una estimación orientativa en FP16 sería de al menos 6-7 GB solo para pesos, más overhead de activaciones y del backbone visual; en FP32, alrededor de 12,6 GB, coincidiendo con el tamaño del repo.
- **GPU recomendadas:** no disponible. Por tamaño, cabría esperar que funcione en GPUs de 16 GB o más (RTX 4090, A100, H100), pero no se confirma en la documentación.
- **¿Cabe en consumer GPU?** No confirmado. El tamaño del repo (12,6 GB) sugiere que sí en GPUs de gama alta con 16-24 GB, pero no hay datos oficiales.
- **Opciones de despliegue:** LeRobot 0.6.0 mediante `lerobot-rollout` con `--policy.path` apuntando al repo. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- **Latencia y throughput:** no disponibles. El dataset está a 20 FPS, lo que da una referencia del ritmo de control esperado, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned) | 3.144.016.000 | no disponible | Pick-and-place Panda, 40 objetos | apache-2.0 | HuggingFace Hub |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica general | no disponible | HuggingFace Hub / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Alcance muy restringido:** entrenado exclusivamente para 40 tareas de pick-and-place sobre un robot Panda con una configuración de cámaras concreta; no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- **Dependencia del entorno:** el nombre del dataset indica datos simulados y reales (`sim`, `live`), pero no se especifica la proporción ni el dominio de simulación; el rendimiento en el mundo real puede degradarse fuera de las condiciones de entrenamiento.
- **Riesgo de alucinación motora:** como política de imitación, puede generar trayectorias plausibles pero incorrectas ante objetos o configuraciones no vistas, con riesgo físico en el robot.
- **Licencia:** Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y sus dependencias (Cosmos-Reason2/Qwen3-VL) pueden tener condiciones adicionales que deben verificarse por separado.
- **Documentación incompleta:** no hay información sobre sesgos, idiomas, cuantizaciones, latencia ni benchmarks; el repo tiene 19 descargas y 0 likes, lo que sugiere poca validación comunitaria.
- **Reproducibilidad:** el checkpoint corresponde a una única semilla (`seed_0`) y a una configuración concreta; no se reportan intervalos de confianza ni evaluaciones held-out.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mim-chess-vlas/train_800_sparse__mask__blur__sim__all_cameras__live__groot__seed_0)
- [Dataset de entrenamiento](https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__mask__blur__sim__all_cameras__live)
- [Visualizador del dataset en LeRobot Spaces](https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__mask__blur__sim__all_cameras__live)
- [Repositorio GR00T de NVIDIA](https://github.com/NVIDIA/Isaac-GR00T)
- [Guía de LeRobot para GR00T](https://huggingface.co/docs/lerobot/main/en/groot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
