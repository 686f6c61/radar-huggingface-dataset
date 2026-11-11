# Haku-2004/act_k5t_input_15

## Resumen

`Haku-2004/act_k5t_input_15` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario Haku-2004 en Hugging Face y entrenada con la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular del robot y de dos cámaras (frontal y lateral), predice directamente comandos de acción de 6 dimensiones. El modelo resuelve una tarea concreta de manipulación denominada "taskbox" sobre un robot `so_follower` (el seguidor del SO-100 de LeRobot).

El modelo tiene 51.671.174 parámetros (dato real del fichero safetensors) y un tamaño de repositorio de 0,2 GB, lo que refleja que la mayor parte de los pesos corresponde al codificador visual y al transformer que fusiona imagen y estado. La entrada visual es de dos cámaras a 480x640 con 3 canales, y el estado de entrada y la acción de salida son vectores de 6 componentes. Fue entrenado durante 50.000 pasos con batch de 8, optimizador AdamW y learning rate de 1e-5 sobre un dataset de solo 20 episodios (25.815 frames a 30 FPS).

Su relevancia es acotada pero clara: es un ejemplo reproducible de extremo a extremo del flujo de imitación de LeRobot (grabación de datos, entrenamiento de ACT, publicación en el Hub y despliegue con `lerobot-rollout`). No aporta resultados de evaluación publicados ni benchmarks, por lo que debe tratarse como una política experimental ligada a un robot, una tarea y un dataset específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): codificador visual + transformer con encoder-decoder y CVAE |
| Parametros totales | 51.671.174 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa ventana de observación de imágenes y estado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (modelo de robótica; la tarea se especifica con la cadena "taskbox") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La arquitectura combina un codificador visual (procesa las dos cámaras de 3x480x640), un transformer encoder-decoder y un esquema de autoencoder variacional condicionado (CVAE) que modela la variabilidad de las demostraciones humanas. La política consume `observation.state` (6,) y las imágenes `observation.images.front` y `observation.images.side`, y produce `action` (6,).

El entrenamiento se realizó con LeRobot 0.5.2 durante 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre el dataset `Haku-2004/k5_4seg`: 20 episodios, 25.815 frames a 30 FPS, tarea "taskbox". No se documenta composición del dataset, aumentos de datos, ni si hubo etapas de RLHF/DPO (no aplicables en este paradigma). Tampoco se detalla la innovación técnica más allá del propio método ACT publicado en arXiv:2304.13705.

## Capacidades

- Control visomotor de manipulación: genera comandos de acción de 6 dimensiones a partir de estado articular y dos vistas de cámara.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas de movimiento de forma más estable que un control paso a paso.
- Aprendizaje por imitación a partir de teleoperación: reproduce la tarea "taskbox" para la que fue entrenado.
- Entrada multimodal limitada a estado propioceptivo (6,) e imágenes RGB de dos cámaras a 480x640.
- Integración nativa con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje ni un VLM general.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Automatización de la tarea "taskbox" en un SO-100 seguidor: la política se despliega con `lerobot-rollout` sobre el robot `so_follower` con dos cámaras y ejecuta la tarea entrenada durante un tiempo acotado con `--duration`.
- Reproducción de experimentos de imitación: sirve como referencia para comparar hiperparámetros (pasos, batch, learning rate) en el flujo de ACT de LeRobot sobre un dataset pequeño de 20 episodios.
- Base para fine-tuning con datos propios: al estar en formato safetensors y librería lerobot, se puede reentrenar con `lerobot-train --policy.type=act` sobre un dataset nuevo del mismo robot y tarea.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (0,2 GB) para mostrar el ciclo grabación-entrenamiento-despliegue sin necesidad de infraestructura pesada.
- Pruebas de integración de hardware: validar calibración de cámaras `front` y `side`, puerto del robot y frecuencia de 30 FPS antes de escalar a políticas más complejas.
- Prototipado de pipelines de evaluación en robot real: usar la política como caso base para medir tasas de éxito con distintas posiciones de objetos o iluminación, tal como sugiere la plantilla de evaluación de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y entradas de dos imágenes de 3x480x640, el modelo es muy ligero y cabe holgadamente en GPUs de consumo, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente, pero no hay dato publicado.
- ¿Cabe en consumer GPU? Sí, por el tamaño del modelo (0,2 GB de repositorio y ~51,7 M de parámetros), aunque no se especifica el modelo mínimo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la ejecución está pensada para operar a 30 FPS según la frecuencia del dataset, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5t_input_15 | 51.671.174 | Estado (6,) + 2 imágenes 3x480x640 | "taskbox" en `so_follower` | apache-2.0 | Hugging Face (0 descargas) |
| Otras políticas ACT en LeRobot | no disponible | no disponible | varía por dataset | habitualmente apache-2.0 | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no disponible | varía por dataset | habitualmente apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a la disponibilidad y al paradigma (ACT frente a otras políticas de imitación del ecosistema LeRobot).

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dataset muy pequeño: 20 episodios y 25.815 frames para una única tarea ("taskbox"); la generalización a posiciones, iluminación u objetos distintos es incierta.
- Altamente específico del hardware: entrenado para `so_follower` con cámaras `front` y `side` a 480x640 y 30 FPS; cambiar la configuración de cámaras o el robot invalida la política.
- Riesgo de sobreajuste y de fallo fuera de distribución: al ser imitación sobre pocas demostraciones, puede reproducir sesgos de la teleoperación y fallar ante variaciones no vistas.
- Sin capacidades de lenguaje ni de razonamiento: no debe usarse como modelo generativo, VLM ni agente conversacional.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset `Haku-2004/k5_4seg` por separado.
- Fecha de creación futura en los metadatos (2026-11-11): conviene tratar la información temporal del repositorio con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5t_input_15
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
