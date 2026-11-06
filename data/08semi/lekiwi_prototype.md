# 08semi/lekiwi_prototype

## Resumen

`08semi/lekiwi_prototype` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. El modelo lo publica el usuario `08semi` en Hugging Face Hub y se ha generado con la librería LeRobot de Hugging Face, que estandariza el entrenamiento, la serialización y el despliegue de políticas robóticas en PyTorch.

El modelo está pensado para controlar un robot de tipo `lekiwi_client` a partir de dos cámaras (`front` y `wrist`) y un vector de estado de 9 dimensiones, produciendo como salida un vector de acción también de 9 dimensiones. Con 51.674.761 parámetros (aproximadamente 51,7 M) y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto, no a razonamiento general.

Su relevancia es la de un prototipo de investigación: demuestra el flujo completo de LeRobot (grabación de datos teleoperados, entrenamiento ACT y rollout en robot real) sobre un dataset pequeño de 99 episodios y 146.785 fotogramas a 30 FPS. No es un modelo de propósito general ni un modelo de lenguaje: es una política visuomotora específica de tarea, y su model card no documenta resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.674.761 (51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de horizonte de acción, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de *action chunking*: en lugar de predecir una única acción por paso, el modelo predice un bloque de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política consume `observation.state` con forma `(9,)`, dos imágenes (`front` a 3×480×640 y `wrist` a 3×640×480) y emite `action` con forma `(9,)`. El repositorio contiene 51,7 M de parámetros en safetensors, coherente con un transformer pequeño con codificadores visuales ligeros.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `08semi/dataset_prototype1`: 99 episodios, 146.785 fotogramas a 30 FPS, con la descripción de tarea genérica "My task description". La configuración reportada es de 150.000 pasos, batch size 2, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset, aumentos de datos, ni fases de RLHF/DPO (no aplicables a este tipo de política). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de un robot `lekiwi_client` a partir de dos cámaras y un vector de estado de 9 dimensiones.
- Predicción de chunks de acciones (horizonte corto) para manipulación y navegación básica, según el paradigma ACT.
- Aprendizaje por imitación a partir de datos teleoperados, sin recompensas explícitas.
- Ejecución en bucle cerrado con `lerobot-rollout` y `--strategy.type=base`.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, código, visión general, audio ni modo *thinking*: es una política robótica específica de tarea.

## Casos de uso

- Prototipado de manipulación con LeKiwi: usar la política como punto de partida para validar el pipeline completo (grabación, entrenamiento, rollout) antes de escalar a datasets mayores.
- Recogida y organización de objetos en un entorno controlado: el modelo predice acciones de 9 dimensiones a partir de las cámaras frontal y de muñeca, adecuado para tareas de pick-and-place simples.
- Investigación en aprendizaje por imitación: comparar ACT con otros métodos de LeRobot (p. ej. Diffusion Policy) usando la misma configuración de dataset y robot.
- Docencia y formación: ejemplo reproducible de entrenamiento de una política con 150.000 pasos y batch 2 en una GPU convencional.
- Evaluación de hardware de bajo coste: al tener 51,7 M de parámetros, permite medir latencia y throughput en GPUs de consumo y en CPU.
- Base para *fine-tuning*: reentrenar con un dataset propio del mismo robot y cámaras para adaptar la política a una tarea concreta.
- Pruebas de integración con LeRobot CLI: validar `lerobot-rollout` y `lerobot-train` en un entorno real antes de desplegar políticas más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la VRAM vendrá dominada por las activaciones de las dos cámaras (480×640 y 640×480) y el batch.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer modernas; no hay cifras oficiales de latencia ni throughput.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que el bucle de control debe operar en ese orden de magnitud, pero no se documenta el rendimiento real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `08semi/lekiwi_prototype` (ACT) | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | no disponible | según repositorio | Hugging Face Hub / LeRobot |
| Diffusion Policy (LeRobot) | no disponible | no aplica | no disponible | según repositorio | Hugging Face Hub / LeRobot |
| Otras políticas LeRobot para LeKiwi | no disponible | no aplica | no disponible | según repositorio | Hugging Face Hub |

No se dispone de datos públicos de benchmarks que permitan una comparación cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- No hay resultados de evaluación en robot real: se desconoce la tasa de éxito y la robustez ante cambios de posición, iluminación o distracciones.
- El dataset de entrenamiento es muy pequeño (99 episodios) y la descripción de tarea es genérica ("My task description"), lo que limita la generalización.
- La licencia no está definida ("[More Information Needed]"), por lo que el uso comercial es incierto y requiere contactar con el autor.
- Es una política específica para `lekiwi_client` con cámaras `front` y `wrist`; no es reutilizable directamente en otros robots o configuraciones de cámara sin reentrenar.
- No dispone de capacidades lingüísticas, de razonamiento ni de tool calling; no debe evaluarse como un LLM.
- Riesgo de sobreajuste al entorno de grabación y de fallos ante objetos o posiciones no vistos durante el entrenamiento.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo visuomotor puede heredar sesgos de los datos teleoperados (posiciones, objetos, condiciones de luz).
- Para producción se recomienda validar con un protocolo de evaluación propio (varias repeticiones por tarea) antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/08semi/lekiwi_prototype
- Dataset de entrenamiento: https://huggingface.co/datasets/08semi/dataset_prototype1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=08semi/dataset_prototype1
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
