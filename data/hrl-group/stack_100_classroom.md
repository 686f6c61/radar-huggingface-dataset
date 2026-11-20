# HRL-Group/stack_100_classroom

## Resumen

`HRL-Group/stack_100_classroom` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método publicado por Zhao et al. en 2023 y adoptado por LeRobot como una de sus políticas de referencia. El modelo no es un modelo de lenguaje: es una política visomotora que mapea observaciones (estado articular de 6 dimensiones y una imagen de muñeca de 3x480x640) a acciones de 6 dimensiones, entrenada para manipular cubos en una tarea de apilado.

El modelo lo publica el grupo HRL-Group y se ha entrenado con LeRobot 0.7.0 sobre el dataset `HRL-Group/stack`, compuesto por 92 episodios y 218.681 fotogramas a 30 FPS. La tarea principal es "coger un cubo y apilarlo encima de otro cubo"; también se incluye la tarea "coger el cubo y colocarlo en la bandeja". El robot objetivo es un `so_follower` (SO-100/SO-101 de LeRobot) con una única cámara de muñeca.

Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño que puede ejecutarse en tiempo real en una GPU de consumo. Su relevancia radica en que sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot: captura de datos teleoperados, entrenamiento ACT y despliegue con `lerobot-rollout`. No se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo no procesa lenguaje natural, solo observaciones visomotoras) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Entrada | `observation.state` (6,), `observation.images.wrist` (3, 480, 640) |
| Salida | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras | `wrist` |
| Libreria | lerobot 0.7.0 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación visomotora. El encoder procesa la imagen de la cámara de muñeca y el estado articular; el decoder predice un chunk de acciones futuras en lugar de una sola acción por paso, lo que reduce el error de acumulación y estabiliza el control. La técnica de action chunking, junto con el ensamblado temporal (temporal ensembling) en inferencia, es la innovación central del método y la razón por la que ACT alcanza tasas de éxito altas con datasets relativamente pequeños de teleoperación.

El entrenamiento se realizó con LeRobot 0.7.0 durante 100.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset `HRL-Group/stack` contiene 92 episodios y 218.681 fotogramas a 30 FPS, con dos tareas de manipulación de cubos. No se documenta composición adicional del dataset, aumento de datos, ni si hubo fases de RLHF/DPO (no aplicables en este paradigma). Tampoco se especifica la configuración exacta de la arquitectura interna (número de capas, dimensión oculta, número de queries del decoder).

## Capacidades

- Manipulación robótica visomotora: apilado de cubos y colocación de cubos en una bandeja.
- Control de un brazo `so_follower` de 6 grados de libertad a partir de estado articular e imagen de muñeca.
- Predicción de chunks de acciones (action chunking) para movimiento suave y coherente.
- Ejecución en tiempo real a 30 FPS (frecuencia de captura del dataset de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de la imagen de muñeca.

## Casos de uso

- Apilado de cubos en entorno de laboratorio: el modelo ejecuta la tarea "Pick up one cube and stack it on top of the other cube" sobre un SO-100/SO-101 con cámara de muñeca, sirviendo como baseline reproducible para experimentos de manipulación.
- Colocación de objetos en contenedores: la segunda tarea del dataset ("Pick up the cube and place it in the tray") permite evaluar generalización dentro del mismo dominio de objetos.
- Docencia y formación en imitation learning: al ser un modelo pequeño (51,7 M de parámetros) y con un pipeline estándar de LeRobot, es adecuado para cursos y talleres donde se enseña a grabar datos, entrenar y desplegar políticas.
- Prototipado rápido de políticas robóticas: sirve como plantilla para adaptar ACT a nuevas tareas cambiando el dataset y reentrenando con `lerobot-train`.
- Validación de hardware SO-100/SO-101: permite comprobar la cadena completa de calibración, cámaras y control antes de invertir en tareas más complejas.
- Investigación en action chunking: útil para comparar variantes de chunking, ensamblado temporal y configuraciones de entrenamiento sobre una tarea controlada.
- Benchmark interno de infraestructura de inferencia: al ser ligero, permite medir latencia y throughput de `lerobot-rollout` en distintas GPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ocupa aproximadamente 0,2 GB, por lo que la VRAM necesaria es mínima (por debajo de 1-2 GB incluyendo activaciones y buffer de imagen).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; se espera que funcione en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `lerobot-rollout` (comando oficial documentado en la model card); LeRobot como librería principal. No se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El modelo se entrenó con datos a 30 FPS, lo que sugiere que el bucle de control está pensado para operar a esa frecuencia, pero no se aportan medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HRL-Group/stack_100_classroom (ACT) | 51,7 M | no aplica | Apilado de cubos con SO-100/SO-101 | no disponible | Hugging Face |
| Otras políticas ACT de LeRobot | variable | no aplica | Manipulación genérica | variable según repo | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | no aplica | Manipulación genérica | variable según repo | Hugging Face |
| Políticas VLA (p. ej. pi0, SmolVLA) | cientos de millones a miles de millones | no aplica | Manipulación con instrucciones en lenguaje | variable según repo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real de la política en el robot.
- La licencia no está especificada ("[More Information Needed]"), lo que impide confirmar si el uso comercial está permitido.
- El modelo está entrenado para un robot concreto (`so_follower`) y una cámara de muñeca; no se garantiza su funcionamiento en otras configuraciones de hardware.
- El dataset de entrenamiento es pequeño (92 episodios) y cubre dos tareas específicas; la generalización a nuevos objetos, posiciones, iluminación o distracciones no está validada.
- Riesgo de sobreajuste al entorno de captura (posiciones de cubos, fondo, iluminación del aula o laboratorio donde se grabaron los datos).
- No procesa lenguaje natural: la instrucción de tarea se pasa como cadena en `lerobot-rollout`, pero el modelo no la interpreta semánticamente.
- No hay información sobre sesgos, alucinaciones (no aplica en el sentido de LLM) ni comportamientos de seguridad en entornos reales.
- Para producción en robots reales se recomienda validación exhaustiva y protocolos de parada de emergencia, dado que no se documentan límites de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HRL-Group/stack_100_classroom
- Dataset de entrenamiento: https://huggingface.co/datasets/HRL-Group/stack
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HRL-Group/stack
