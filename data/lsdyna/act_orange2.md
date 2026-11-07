# lsdyna/act_orange2

## Resumen

`lsdyna/act_orange2` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face Hub mediante la librería LeRobot. La desarrolla el usuario `lsdyna` y resuelve una tarea concreta de manipulación: entregar una naranja a partir de la instrucción "Give me an orange". No es un modelo de lenguaje generalista, sino un controlador visuomotor que mapea observaciones (estado articular de 6 dimensiones más dos cámaras) a acciones de 6 dimensiones.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras aptas para inferencia en tiempo real sobre hardware de consumo. Está entrenado sobre el dataset `lsdyna/GiveMeOrange`, con 17 episodios y 9290 fotogramas a 30 FPS, capturados con un robot `so_follower` y dos cámaras (`hand` y `orbbec`).

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot, desde la grabación de datos teleoperados hasta el despliegue en robot real. No debe confundirse con un modelo fundacional: es una política especializada de un solo task, sin benchmarks publicados ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones por chunks |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (la tarea está definida en inglés: "Give me an orange") |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de imitation learning presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso, el modelo predice chunks de acciones cortas, lo que reduce el error de compounding y produce trayectorias más suaves. La arquitectura combina un backbone transformer con un encoder visual que procesa las imágenes de las cámaras `hand` (3×480×640) y `orbbec` (3×720×1280), y un decoder que emite vectores de acción de dimensión 6. El estado del robot se introduce como vector de 6 dimensiones (`observation.state`).

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `lsdyna/GiveMeOrange`: 17 episodios, 9290 fotogramas a 30 FPS, tarea única "Give me an orange". La configuración reportada es de 5000 pasos, batch size 32, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá del task, ni uso de RLHF/DPO (no aplica en imitation learning), ni innovaciones adicionales como decodificación especulativa. El tamaño del dataset (17 episodios) es reducido, lo que limita la generalización esperada.

## Capacidades

- Control visuomotor de un robot `so_follower` a partir de dos cámaras y el estado articular.
- Predicción de chunks de acciones de 6 dimensiones para tareas de manipulación.
- Ejecución de una tarea concreta de picking y entrega ("Give me an orange").
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling ni agentes multi-step.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de thinking mode, visión general, audio ni otras capacidades fundacionales.

## Casos de uso

- Reproducción de un pipeline completo de imitation learning: sirve como referencia para grabar datos teleoperados con LeRobot, entrenar una política ACT y desplegarla en un `so_follower`, útil para equipos que arrancan en robótica de imitación.
- Demostración de manipulación pick-and-place en laboratorio: el modelo ejecuta la entrega de una naranja en un entorno controlado, adecuado para validar hardware y calibración de cámaras antes de escalar a tareas más complejas.
- Base para fine-tuning con datos propios: al ser una política pequeña (51,7 M de parámetros) y con receta de entrenamiento documentada, se puede reentrenar con un dataset propio de pocas decenas de episodios para una tarea similar.
- Benchmark interno de latencia y throughput: permite medir el coste de inferencia de ACT con dos cámaras de resolución alta (640×480 y 1280×720) en GPUs de consumo.
- Docencia y talleres de robótica: ejemplo mínimo y ejecutable de política visuomotora con comandos CLI reproducibles.
- Prototipado de interfaces humano-robot: la instrucción textual "Give me an orange" actúa como condicionamiento de tarea, útil para experimentar con consignas en lenguaje natural en pipelines LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 M de parámetros en safetensors, ~0,2 GB), la inferencia cabe holgadamente en GPUs de consumo, aunque el cuello de botella real son las dos cámaras a 30 FPS y el preprocesado visual.
- GPU recomendadas: no documentadas por el autor. Por tamaño, una RTX 3060/4060 o superior debería bastar; para entrenamiento se recomienda al menos una GPU con 8-12 GB.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con 6 GB o más, aunque no hay cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=lsdyna/act_orange2`), que internamente usa PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lsdyna/act_orange2 | 51.668.614 | no aplica | Entrega de naranja (task único) | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot (genéricas) | variable | no aplica | Múltiples tasks según dataset | según repo | Hugging Face / GitHub |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | Manipulación visuomotora | según repo | Hugging Face / GitHub |
| Políticas pi0 / OpenVLA (fundacionales) | miles de millones | no aplica | Manipulación generalista | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación es cualitativa y basada en categoría y disponibilidad.

## Limitaciones y advertencias

- Dataset muy reducido (17 episodios, 9290 fotogramas): alta probabilidad de sobreajuste y baja generalización a posiciones, iluminación o distractores distintos.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que no se puede afirmar su fiabilidad.
- Licencia no declarada ("More Information Needed"): no se puede garantizar uso comercial; conviene contactar con el autor antes de producción.
- Especialización extrema: solo ejecuta la tarea "Give me an orange" con el robot `so_follower` y las cámaras `hand` y `orbbec`; no es reutilizable fuera de esa configuración sin reentrenamiento.
- Dependencia de calibración de hardware: cambios en puertos, índices de cámara o montaje invalidan la política.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de acciones erróneas o inseguras en entornos no controlados.
- Sin soporte multilingüe ni de texto: la consigna es un condicionamiento de tarea, no una capacidad de comprensión del lenguaje.
- No apta para entornos de producción sin validación previa y sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lsdyna/act_orange2
- Dataset de entrenamiento: https://huggingface.co/datasets/lsdyna/GiveMeOrange
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
