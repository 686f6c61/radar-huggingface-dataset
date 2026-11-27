# 0vec/classify_model002

## Resumen

`0vec/classify_model002` es una política de robótica entrenada con LeRobot que implementa el método ACT (Action Chunking with Transformers), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario `0vec` sobre el framework LeRobot de Hugging Face y está pensado para controlar robots manipuladores a partir de datos de teleoperación.

El modelo resuelve el problema del control motor fino en robótica de imitación: en lugar de predecir una única acción por paso de tiempo, ACT genera un "chunk" de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del comportamiento. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto.

Es relevante porque ejemplifica el flujo de trabajo actual de LeRobot: entrenamiento reproducible desde un dataset propio (`0vec/dataset_raw_classify002`), pesos en safetensors y licencia Apache 2.0, lo que facilita su reutilización y despliegue en robots tipo SO-100. No obstante, al ser un modelo de robótica y no un LLM, sus capacidades se limitan al control de acciones en el entorno para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la ventana de observación depende de la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice chunks de acciones (secuencias cortas de comandos motores) en lugar de una acción por paso. La arquitectura combina un encoder que procesa las observaciones (típicamente imágenes de cámaras y estado de las articulaciones) con un decoder que genera el chunk de acciones, y se entrena de forma supervisada sobre episodios de teleoperación. El paper de referencia es "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

El entrenamiento se realizó con LeRobot (`lerobot-train`) sobre el dataset `0vec/dataset_raw_classify002`, usando `--policy.type=act` y dispositivo CUDA. No se dispone de información sobre el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplica en este paradigma). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; la innovación principal es el propio mecanismo de action chunking.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks) para robots manipuladores a partir de observaciones visuales y de estado.
- Aprendizaje desde teleoperación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Ejecución de políticas en tiempo real mediante `lerobot-record` con robots compatibles (p. ej. `so100_follower`).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue con los mismos comandos.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Manipulación robótica de laboratorio: el modelo ejecuta tareas de pick-and-place aprendidas de demostraciones, adecuado por su tamaño compacto (51,6 M de parámetros) y su entrenamiento específico sobre el dataset del autor.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT con LeRobot, ya que el flujo de entrenamiento está documentado en la model card.
- Prototipado con robot SO-100: se puede desplegar con `lerobot-record --robot.type=so100_follower` para evaluar la política en 10 episodios, tal como indica el autor.
- Automatización de tareas repetitivas de clasificación: el nombre del dataset (`dataset_raw_classify002`) sugiere un escenario de clasificación de objetos que la política puede reproducir.
- Docencia y formación: modelo pequeño y de licencia permisiva para enseñar el pipeline completo de LeRobot (dataset, entrenamiento, evaluación).
- Validación de hardware de bajo coste: permite probar controladores de imitación en plataformas económicas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,6 M de parámetros (los pesos ocupan aproximadamente 0,2 GB en safetensors); el consumo real depende de las imágenes de entrada y del tamaño de batch.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100; el modelo es lo bastante pequeño para no requerir aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con al menos 2 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0vec/classify_model002 (ACT) | 51,6 M | no disponible | no disponible | apache-2.0 | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | variable | no disponible | no disponible | apache-2.0 | Hugging Face / LeRobot |
| Diffusion Policy (referencia habitual en imitación) | variable | no disponible | no disponible | según implementación | Repositorios de investigación |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas; la comparación anterior es meramente categórica.

## Limitaciones y advertencias

- Sesgos: al entrenarse con un dataset propio y limitado (`0vec/dataset_raw_classify002`), la política puede sobreajustarse a las condiciones, objetos y posiciones presentes en las demostraciones.
- Riesgo de fallo fuera de distribución: en robótica de imitación, cambios de iluminación, fondo, posición de cámara u objetos no vistos pueden degradar el comportamiento de forma abrupta.
- Sin capacidades lingüísticas ni de razonamiento: no debe evaluarse como un LLM ni usarse para tareas de texto.
- Contexto e idioma: no aplica; no hay información sobre ventana de observación ni sobre generalización entre entornos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Caveat de producción: con 0 descargas y 0 likes, el modelo no tiene validación comunitaria; conviene evaluarlo en el robot objetivo antes de cualquier despliegue real.
- Seguridad física: al controlar un robot, deben establecerse límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0vec/classify_model002
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/0vec/dataset_raw_classify002
