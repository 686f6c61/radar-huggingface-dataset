# Haku-2004/act_k5e_input_20

## Resumen

`act_k5e_input_20` es una política de imitación robótica basada en Action Chunking with Transformers (ACT), el método presentado en el artículo arXiv 2304.13705. La desarrolla el usuario Haku-2004 y se distribuye a través de LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El modelo resuelve una tarea concreta de manipulación denominada "taskbox" sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot), consumiendo el estado articular y dos cámaras (frontal y lateral) para producir comandos de acción de 6 dimensiones.

Técnicamente es un transformer pequeño: 51.671.174 parámetros (unos 51,7 millones), almacenados en safetensors con un tamaño de repositorio de 0,2 GB. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones multimodales (imágenes de 3x480x640 y un vector de estado de dimensión 6) a secuencias de acciones. La predicción se hace por *chunks* de acciones en lugar de paso a paso, lo que reduce el error de acumulación típico de las políticas reactivas.

Su relevancia es acotada pero clara: es un ejemplo reproducible de entrenamiento de una política ACT con LeRobot 0.5.2 sobre un dataset propio de 20 episodios y 25.815 fotogramas a 30 FPS. Sirve como referencia para quien quiera replicar el flujo completo (grabación, entrenamiento, despliegue) en un robot de bajo coste, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con predicción por chunks |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal fijada por la configuración de la política) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de una acción por paso. La arquitectura combina un *backbone* visual que procesa las dos cámaras (`observation.images.front` y `observation.images.side`, ambas de 3x480x640) con un transformer que fusiona esas representaciones con el estado proprioceptivo (`observation.state`, vector de 6 dimensiones) y genera un chunk de acciones de dimensión 6. El objetivo habitual de ACT incluye una pérdida de reconstrucción tipo VAE sobre las acciones y regularización, orientada a capturar la multimodalidad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.5.2 sobre el dataset `Haku-2004/k5_4seg`: 20 episodios, 25.815 fotogramas a 30 FPS, una única tarea ("taskbox"). La configuración reportada es de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el número total de tokens ni composición del dataset más allá de esas cifras, ni si hubo etapas de RLHF/DPO (no aplicables en este paradigma). Tampoco se detalla ninguna innovación adicional más allá del propio mecanismo de action chunking del artículo original.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de estado articular y dos vistas de cámara.
- Predicción por chunks de acciones, que reduce el error compuesto en tareas de manipulación de horizonte corto.
- Fusión multimodal visión + propriocepción: integra dos cámaras RGB de 480x640 con el vector de estado.
- Ejecución de una tarea específica ("taskbox") en el entorno para el que fue entrenado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes lingüísticos; su "razonamiento" es la política de control aprendida.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Replicación de experimentos de imitación: sirve como política de referencia para validar el pipeline de LeRobot (grabación, entrenamiento, rollout) en un robot SO-100/SO-101 antes de entrenar políticas propias.
- Automatización de la tarea "taskbox": ejecuta la manipulación concreta para la que fue entrenado en un banco de pruebas, útil para medir tiempos de ciclo y repetibilidad.
- Docencia y formación: ejemplo didáctico de ACT con un dataset pequeño (20 episodios) para explicar action chunking, pérdidas VAE y despliegue con `lerobot-rollout`.
- Base para *fine-tuning*: punto de partida para adaptar la política a variantes de la misma tarea con nuevos objetos o posiciones, reentrenando con datos propios.
- Evaluación de hardware: permite comprobar la latencia de inferencia y la estabilidad del bucle de control en una GPU concreta antes de invertir en un modelo mayor.
- Pruebas de integración en CI de robótica: al ser un checkpoint pequeño (0,2 GB) y con licencia Apache 2.0, se puede incluir en tests automatizados de despliegue de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros, ~0,2 GB en safetensors), la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, e incluso en CPU para pruebas.
- GPU recomendadas: no hay recomendación del autor; por tamaño, una RTX 3060/4060 o superior es más que suficiente. Para entrenamiento con batch 8 y dos cámaras a 480x640 se recomienda al menos 8-12 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB (RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) con `--policy.path=Haku-2004/act_k5e_input_20`; entrenamiento con `lerobot-train --policy.type=act`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k5e_input_20` | 51,7 M | no aplica | taskbox (so_follower) | apache-2.0 | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | tareas diversas | apache-2.0 | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | manipulación | apache-2.0 | Hugging Face |
| Políticas π0 / π0.5 (Physical Intelligence) | no disponible en la información | no aplica | manipulación generalista | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenada con solo 20 episodios y una única tarea ("taskbox"); la generalización a otras tareas u objetos es muy limitada.
- Sin resultados de evaluación en robot real: no hay evidencia publicada de tasa de éxito.
- Depende de la configuración exacta del robot (`so_follower`) y de las cámaras (`front`, `side`) con las que se entrenó; cambios de montaje, iluminación o calibración pueden degradar el comportamiento.
- Riesgo de sobreajuste al entorno de grabación (posiciones, fondo, condiciones de luz).
- No apta para uso comercial fuera del marco de la licencia Apache 2.0, que permite uso comercial pero sin garantías; el autor no ofrece soporte ni mantenimiento.
- No es un modelo de lenguaje: no debe emplearse para generación de texto, razonamiento simbólico ni tareas lingüísticas.
- Sin información sobre sesgos; en robótica, los sesgos provienen de los datos de demostración y pueden reproducir trayectorias subóptimas del operador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5e_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
