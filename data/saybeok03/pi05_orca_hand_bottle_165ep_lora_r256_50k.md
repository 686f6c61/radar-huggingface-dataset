# saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_50k

## Resumen

El modelo `saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_50k` es un fine-tuning LoRA del modelo base `lerobot/pi05_base`, que a su vez implementa π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence para generalizacion en entornos abiertos. Se trata de una politica robotica de imitacion entrenada para ejecutar una unica tarea manipulativa: "move the bottle" (mover la botella) con una mano robotica ORCA Hand v1 montada sobre un brazo AM-ARM200.

El fine-tuning se ha realizado con la libreria LeRobot (version 0.6.1) sobre un dataset propio de 165 episodios y 141.740 frames a 30 FPS, empleando tecnicas de LoRA con rango 256 y 50.000 pasos de entrenamiento. El modelo consume tres flujos de imagen (camara inferior, camara de muneca y RealSense) junto con un vector de estado de 20 dimensiones, y produce un vector de accion de 20 dimensiones a la misma frecuencia de captura.

Es relevante como ejemplo practico de adaptacion de un VLA generalista a un hardware robotico de bajo coste mediante LoRA, y porque demuestra el flujo completo de LeRobot para captura, entrenamiento y despliegue de politicas sobre robots reales. Al no haberse publicado evaluaciones cuantitativas, las cifras de rendimiento no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (Pi05, derivada de π₀) con adaptadores LoRA; implementacion LeRobot |
| Parametros totales | no disponible (el repositorio ocupa 3,0 GB, pero no se detalla el desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; soporte de cuantizacion no documentado) |
| Idiomas soportados | no disponible (el modelo genera acciones, no texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Framework | lerobot 0.6.1 |
| Entrada visual | 3 camaras RGB 3x480x640 (`bottom`, `wrist`, `realsense`) |
| Entrada de estado | `observation.state` de dimension (20,) |
| Salida | `action` de dimension (20,) |
| Tarea entrenada | "move the bottle" |
| Episodios de entrenamiento | 165 |
| Frames de entrenamiento | 141.740 a 30 FPS |
| Pasos de entrenamiento | 50.000 |
| Batch size | 32 |
| Optimizador | AdamW, lr 0,0001, seed 1000 |
| Metodo de ajuste | LoRA con rango 256 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura VLA de π₀.₅, que combina un backbone vision-language con un cabezal de accion que produce trayectorias de control continuo. La implementacion concreta es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. Sobre el modelo base se aplica un fine-tuning LoRA de rango 256, lo que permite adaptar la politica a un robot y una tarea especificos sin reentrenar todos los pesos. La model card no detalla el numero de tokens de preentrenamiento ni la composicion del dataset original de π₀.₅, por lo que esos datos no estan disponibles.

El entrenamiento de este checkpoint se realizo durante 50.000 pasos con batch de 32, AdamW y tasa de aprendizaje 1e-4 (semilla 1000), sobre el dataset `saybeok03/orca-hand-bottle`, compuesto por 165 episodios de teleoperacion a 30 FPS. Las observaciones incluyen tres vistas (camara inferior, muneca y RealSense) y un vector de estado de 20 dimensiones correspondiente a la mano ORCA v1 con servos Feetech HLS sobre brazo AM-ARM200. La model card no documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ni innovaciones adicionales mas alla del propio diseno VLA.

## Capacidades

- Generacion de acciones de control continuo (vector de 20 dimensiones) a partir de observaciones visuales y de estado, a 30 FPS.
- Percepcion visual multi-camara: integra simultaneamente tres vistas RGB de 480x640.
- Manipulacion robotica de una unica tarea: mover una botella con la mano ORCA.
- Control de mano robotica antropomorfa con 20 dimensiones de estado/accion.
- Inferencia en tiempo real mediante el comando `lerobot-rollout`.
- Capacidad de reentrenamiento y ajuste fino adicional sobre el mismo esquema (LeRobot + LoRA).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generacion de texto, al ser un modelo de accion.

## Casos de uso

- Manipulacion de botellas en laboratorio: el modelo ejecuta la tarea "move the bottle" con la mano ORCA y brazo AM-ARM200, sirviendo como politica de referencia para experimentos de imitacion de bajo coste.
- Prototipado de politicas VLA con hardware asequible: permite validar el pipeline LeRobot sobre una mano impresa/servo Feetech sin partir del modelo base completo.
- Reproduccion de experimentos de teleoperacion: el dataset `orca-hand-bottle` y el checkpoint permiten comparar configuraciones de LoRA (por ejemplo, frente a las variantes de rango 256 y 30k pasos del mismo autor).
- Base para fine-tuning adicional: al ser un LoRA apache-2.0 sobre `lerobot/pi05_base`, se puede reentrenar con nuevos datasets manteniendo la infraestructura de LeRobot.
- Evaluacion comparativa de estrategias de ajuste: el checkpoint con 50k pasos y rango 256 es util para estudiar el efecto del numero de pasos y del rango LoRA en el exito de la tarea.
- Demostraciones educativas de aprendizaje por imitacion: el repositorio incluye comandos de rollout listos para usar, lo que facilita talleres y formacion en robotica con IA.
- Integracion en pipelines de captura y despliegue: los repositorios `orca-hand` y `orca-hand-data-collector` del mismo autor permiten cerrar el ciclo captura-entrenamiento-despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la nota "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 3,0 GB en safetensors, por lo que la inferencia en precision completa requeriria al menos ese orden de magnitud mas memoria para activaciones y las tres camaras.
- GPU recomendadas: no especificadas. Para inferencia en tiempo real de un VLA con tres flujos de 480x640 se recomienda una GPU CUDA dedicada; el comando de entrenamiento de LeRobot usa `--policy.device=cuda`.
- GPU de consumo: no confirmado. Por tamano del checkpoint (3,0 GB) es plausible que quepa en GPUs de consumo con 8-12 GB o mas, pero no hay datos oficiales que lo confirmen.
- Despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecucion sin grabacion de episodios; `lerobot-train` para reentrenamiento. La libreria es `lerobot` 0.6.1. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La captura y el control se realizan a 30 FPS, pero no se publica la latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_50k` | no disponible | no disponible | sin evaluacion publicada | apache-2.0 | Hugging Face |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | sin datos en esta ficha | apache-2.0 (segun repositorio base, no verificado aqui) | Hugging Face |
| `saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_30k` | no disponible | no disponible | sin evaluacion publicada | no disponible en la busqueda | Hugging Face |
| `saybeok03/pi05_orca_hand_bottle_lora_r256_30k` | no disponible | no disponible | sin evaluacion publicada | no disponible en la busqueda | Hugging Face |

Las tres variantes del mismo autor comparten dataset y esquema LoRA, diferenciandose en el numero de pasos (30k frente a 50k) y en la nomenclatura del checkpoint. No se dispone de datos cuantitativos para comparar su exito en la tarea.

## Limitaciones y advertencias

- Sesgos: no documentados; al ser un modelo de accion, el riesgo de sesgo se traslada a la distribucion del dataset de teleoperacion (posiciones, iluminacion y objetos concretos).
- Alucinacion: no aplica en el sentido textual, pero existe riesgo de acciones fuera de distribucion si el entorno difiere del de entrenamiento.
- Generalizacion limitada: entrenado para una unica tarea ("move the bottle") con un robot concreto (ORCA Hand v1 + AM-ARM200); no se garantiza su funcionamiento en otro hardware ni con otros objetos.
- Sin evaluacion publicada: no hay tasa de exito ni numero de ensayos, por lo que no se puede afirmar su fiabilidad en produccion.
- Dependencia de camaras: requiere exactamente las tres vistas (`bottom`, `wrist`, `realsense`) con los nombres e indices configurados; un cambio de montaje o calibracion puede degradar el comportamiento.
- Idioma: no aplica generacion de lenguaje; la unica instruccion textual es la tarea fija.
- Licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `lerobot/pi05_base` y de los pesos derivados.
- Fecha de creacion futura (2026-11-13) en los metadatos del repositorio, lo que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_50k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/orca-hand-bottle
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/orca-hand-bottle
- Blog de Pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible como URL directa en la informacion proporcionada
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio orca-hand: https://github.com/saybeok/orca-hand
- Repositorio orca-hand-data-collector: https://github.com/saybeok/orca-hand-data-collector
- Variante 30k pasos: https://huggingface.co/saybeok03/pi05_orca_hand_bottle_165ep_lora_r256_30k
- Variante sin prefijo 165ep: https://huggingface.co/saybeok03/pi05_orca_hand_bottle_lora_r256_30k
