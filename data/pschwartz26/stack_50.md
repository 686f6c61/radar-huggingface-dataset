# pschwartz26/stack_50

## Resumen

`pschwartz26/stack_50` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. El autor del repositorio es el usuario `pschwartz26`, y la política está pensada para controlar un robot tipo `so_follower` (brazo robótico de bajo coste de la familia SO-100/SO-101) equipado con una cámara en la muñeca.

El modelo resuelve tareas concretas de manipulación: recoger un cubo y depositarlo en una bandeja, y apilar un cubo sobre otro. Se entrenó sobre el dataset `HRL-Group/stack`, compuesto por 100 episodios y 233.817 fotogramas grabados a 30 FPS mediante teleoperación. Con 51.668.614 parámetros (aproximadamente 51,7 millones) y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto.

Su relevancia radica en que ejemplifica el flujo actual de robótica open source: políticas de imitación ligeras, entrenadas con datos teleoperados y desplegables con la CLI de LeRobot. No obstante, se trata de un modelo muy específico de una tarea y un robot concretos, sin resultados de evaluación publicados ni licencia declarada, lo que limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en un transformer que, en lugar de predecir una única acción por paso de tiempo, predice un fragmento (chunk) de acciones futuras. Esta formulación reduce el error de acumulación típico de las políticas paso a paso y permite alcanzar tasas de éxito elevadas con datos teleoperados, tal como se describe en el paper arXiv:2304.13705. La política consume dos observaciones: el estado del robot (`observation.state`, vector de 6 dimensiones) y una imagen de la cámara de muñeca (`observation.images.wrist`, tensor RGB de 3×480×640), y produce una acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.0 durante 100.000 pasos, con batch size de 64, optimizador AdamW, learning rate de 1e-05 y semilla 1000. El dataset de entrenamiento, `HRL-Group/stack`, contiene 100 episodios y 233.817 fotogramas a 30 FPS, con dos tareas descritas: "Pick up the cube and place it in the tray" y "Pick up one cube and stack it on top of the other cube". No se documenta en la model card el uso de RLHF, DPO ni otras fases de ajuste posteriores; se trata de aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un brazo `so_follower` a partir del estado articular y de una imagen de muñeca.
- Ejecución de dos tareas específicas: colocar un cubo en una bandeja y apilar un cubo sobre otro.
- Aprendizaje por imitación con predicción de chunks de acciones, lo que mejora la estabilidad frente a políticas paso a paso.
- Percepción visual monocámara: procesa imágenes de 480×640 a 30 FPS desde la cámara de muñeca.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso en el sentido de agentes LLM; su "razonamiento" es la secuencia de acciones del chunk predicho.
- No tiene capacidades multilingües, de visión general, audio ni modo thinking.
- Despliegue mediante la CLI de LeRobot (`lerobot-rollout`) con la estrategia base.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política puede ejecutar la tarea "Pick up the cube and place it in the tray" sobre un `so_follower` calibrado, usando la cámara de muñeca como única entrada visual. Es adecuada porque fue entrenada exactamente sobre esa tarea y ese robot.
- Apilado de objetos (stacking): permite practicar tareas de ensamblaje simple apilando un cubo sobre otro, útil como banco de pruebas para investigar precisión y control fino.
- Base para experimentos de aprendizaje por imitación: sirve como punto de partida para comparar variantes de ACT, ajustar hiperparámetros o evaluar robustez frente a cambios de iluminación y posiciones de objetos.
- Docencia y formación en robótica open source: el flujo completo (grabación teleoperada, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) es reproducible con hardware de bajo coste tipo SO-100.
- Prototipado rápido de políticas de manipulación: al ser un modelo de ~51,7 M de parámetros y 0,2 GB, se puede iterar y reentrenar en una GPU de consumo.
- Generación de datos sintéticos o aumentados para otras políticas: las trayectorias ejecutadas pueden servir como referencia para comparar políticas o para análisis de fallos.
- Evaluación de infraestructura de inferencia robótica: útil para medir latencia de inferencia en tiempo real a 30 FPS con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~51,7 M de parámetros; en fp32 ocupa aproximadamente 0,2 GB de pesos, por lo que la VRAM necesaria es mínima (menos de 1 GB incluyendo activaciones y buffers de imagen).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado con `--policy.device=cuda`, por lo que se asume una GPU NVIDIA. Una RTX 3060, RTX 4060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso podría ejecutarse en CPU para inferencia, aunque a 30 FPS se recomienda GPU.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y el flujo de entrenamiento con `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada. El sistema está pensado para operar a 30 FPS, la misma frecuencia del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pschwartz26/stack_50` (ACT) | 51,7 M | no aplica | Manipulación pick-and-place / stacking con `so_follower` | no disponible | Hugging Face (LeRobot) |
| ACT original (paper arXiv:2304.13705) | no disponible | no aplica | Aprendizaje por imitación genérico | no disponible | Paper y código de referencia |
| Políticas LeRobot de la comunidad (p. ej. Diffusion Policy) | variable | no aplica | Manipulación con imitación | variable según repositorio | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasas de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real.
- Especificidad extrema: entrenada para un robot `so_follower` con una cámara de muñeca y dos tareas concretas; no generaliza a otros robots, cámaras ni tareas sin reentrenamiento.
- Licencia no declarada: la model card marca la licencia como "More Information Needed", lo que impide confirmar si el uso comercial está permitido.
- Dependencia de calibración y hardware: el rendimiento depende de la calibración del robot, de la posición e índice de las cámaras y de que los nombres de cámara coincidan con las claves de observación del entrenamiento.
- Sensibilidad a cambios de entorno: al ser aprendizaje por imitación con 100 episodios, es probable que sea sensible a variaciones de iluminación, posiciones de objetos y distractores; no se documenta robustez.
- Riesgo de sobreajuste a las demostraciones: con solo 100 episodios y 100.000 pasos de entrenamiento, puede reproducir sesgos de las trayectorias teleoperadas.
- Sin capacidades de lenguaje ni tool calling: no debe confundirse con un modelo de propósito general.
- Fecha de creación futura en los metadatos (2026-11-20): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/pschwartz26/stack_50
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack
