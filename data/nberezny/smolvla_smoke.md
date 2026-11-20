# nberezny/smolvla_smoke

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado originalmente por Hugging Face para robótica, publicado con el paper arXiv:2506.01844. La ficha que nos ocupa, `nberezny/smolvla_smoke`, es un ajuste fino (fine-tune) del checkpoint base `lerobot/smolvla_base` realizado por el usuario nberezny mediante la librería LeRobot. El modelo resultante está especializado en una única tarea de manipulación robótica: apilar tres bloques en un orden concreto (rojo abajo, amarillo en medio, azul arriba) sobre un robot Ufactory Lite6 simulado.

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras de 256x256 píxeles) y produce un vector de acción de 10 dimensiones. Con 450 millones de parámetros totales y un tamaño de repositorio de 0,9 GB, está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios con presupuesto limitado.

La relevancia de esta ficha concreta es limitada: se trata de un "smoke test" de entrenamiento (apenas 200 pasos con batch size 32) sin resultados de evaluación publicados, por lo que debe interpretarse como una demostración del flujo de trabajo de LeRobot más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacta, según paper SmolVLA (arXiv:2506.01844); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de política robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones para mapear observaciones multimodales a comandos motores. El paper de referencia (arXiv:2506.01844) describe el modelo como "compacto y eficiente", capaz de lograr rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. Los detalles internos de la arquitectura (número de capas, dimensión oculta, mecanismo de atención) no se detallan en la información disponible.

Este checkpoint concreto se ha obtenido por ajuste fino del modelo base `lerobot/smolvla_base` sobre el dataset `nberezny/lite6_stack_dense`, compuesto por 4.924 episodios y 143.843 fotogramas a 20 FPS de la tarea de apilado de bloques. La configuración de entrenamiento es mínima: 200 pasos, batch size de 32, optimizador AdamW con learning rate 1e-4, semilla 1000 y LeRobot 0.7.0. No se menciona uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación supervisado. El nombre "smoke" sugiere que el entrenamiento fue una prueba de humo para validar el pipeline, no un entrenamiento completo.

## Capacidades

- Control robótico de manipulación: genera acciones de 10 dimensiones para el robot Ufactory Lite6.
- Percepción visual multimodal: procesa tres cámaras simultáneas (`overhead`, `wrist` y una tercera no especificada) a 256x256 píxeles.
- Fusión de estado propioceptivo: integra el estado articular de 6 dimensiones (`observation.state`) con las observaciones visuales.
- Ejecución de una tarea específica de apilado: "stack the blocks: red at the bottom, yellow, blue on top".
- Condicionamiento por instrucción en lenguaje natural: acepta un parámetro `--task` con la descripción de la tarea.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras habilidades de propósito general.

## Casos de uso

- Validación de pipelines de entrenamiento: el modelo sirve como prueba de humo para verificar que el flujo completo de LeRobot (grabación de datos, entrenamiento, despliegue) funciona correctamente antes de lanzar entrenamientos largos.
- Reproducción de experimentos de imitación: permite reproducir el ajuste fino de SmolVLA sobre un dataset propio de apilado de bloques y comparar hiperparámetros.
- Investigación en VLA de bajo coste: con 450 M de parámetros y 0,9 GB, es adecuado para experimentar con modelos de acción en GPUs de consumo sin grandes inversiones.
- Benchmark de referencia para tareas de apilado: puede usarse como línea base mínima contra la que comparar políticas entrenadas con más pasos o más datos.
- Docencia y formación: sirve para ilustrar el ciclo completo de aprendizaje por imitación en robótica con un ejemplo pequeño y rápido de entrenar.
- Pruebas de integración hardware-software: permite verificar la comunicación entre el robot Lite6 simulado, las cámaras y el stack de inferencia antes de desplegar políticas más maduras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors (fp32 o bf16), una estimación orientativa sería de 1-2 GB, pero no está confirmada en la información proporcionada.
- GPU recomendadas: no disponibles en la información; el paper de SmolVLA menciona despliegue en hardware de consumo, pero no se listan modelos concretos.
- Compatibilidad con GPU de consumo: probable según la descripción del paper ("consumer-grade hardware"), pero sin confirmación específica para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de política robótica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nberezny/smolvla_smoke | 450 M | no aplica | apache-2.0 | Hugging Face | Fine-tune de 200 pasos, sin evaluación |
| lerobot/smolvla_base | no disponible en la información | no aplica | no disponible en la información | Hugging Face | Modelo base del que deriva este checkpoint |
| Otros modelos VLA (p. ej. OpenVLA, pi0) | no disponible en la información | no aplica | no disponible | no disponible | No se proporcionan datos comparativos en la información recibida |

## Limitaciones y advertencias

- Entrenamiento mínimo: solo 200 pasos con batch size 32, lo que sugiere un modelo infraentrenado y no apto para uso real.
- Sin evaluación: no hay resultados de éxito publicados; se desconoce si la política funciona siquiera en la tarea objetivo.
- Especialización extrema: entrenado únicamente para apilar tres bloques concretos en un orden específico con un robot Lite6 simulado; no generaliza a otras tareas, objetos ni robots.
- Dependencia de hardware concreto: requiere el robot `ufactory_lite6_sim_hybrid_dense_rel` y tres cámaras con nombres y disposición específicos.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución: al ser un modelo de política, los riesgos son de ejecución física incorrecta, no de generación de texto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones que conviene verificar.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.
- Advertencia de producción: no debe desplegarse en un robot real sin una evaluación exhaustiva previa y medidas de seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/smolvla_smoke
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/lite6_stack_dense
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/lite6_stack_dense
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
