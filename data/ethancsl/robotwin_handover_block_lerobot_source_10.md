# ethanCSL/robotwin_handover_block_lerobot_source_10

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face, disenado para controlar robots manipuladores a partir de observaciones visuales y comandos en lenguaje natural. Esta ficha concreta, `ethanCSL/robotwin_handover_block_lerobot_source_10`, es un fine-tuning de `lerobot/smolvla_base` sobre un dataset especifico de tarea de handover (pasar un bloque rojo de un brazo a otro), con 450 millones de parametros y entrenado mediante aprendizaje por imitacion.

El modelo resuelve el problema de generar politicas de control roboticas eficientes y desplegables en hardware de consumo, sin necesidad de infraestructura de gran escala. Su relevancia actual radica en que demuestra que un VLA de tamano reducido puede aprender tareas de manipulacion bimanual especificas a partir de pocos episodios de demostracion (10 episodios, 2835 frames), lo que abarata el ciclo de desarrollo de politicas para robots tipo ALOHA.

La arquitectura subyacente es SmolVLA (paper arXiv:2506.01844), un VLA compacto que combina un codificador visual y de lenguaje con un modulo de accion, orientado a inferencia en GPUs de consumo. Este checkpoint concreto esta especializado en una unica tarea y no es un modelo general de proposito multiple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision original) |
| Idiomas soportados | no disponible (comandos de tarea en ingles en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un VLA compacto que procesa tres flujos visuales de 256x256 píxeles (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) junto con un vector de estado de 6 dimensiones, y produce un vector de accion de 14 dimensiones. La arquitectura SmolVLA combina un backbone vision-lenguaje con un cabezal de accion, orientado a inferencia de baja latencia en hardware de consumo. El modelo base se describe en el paper arXiv:2506.01844.

El entrenamiento se realizo mediante aprendizaje por imitacion supervisado sobre el dataset `ethanCSL/robotwin_handover_block_lerobot_source_10`, compuesto por 10 episodios y 2835 frames a 30 FPS, con tareas descritas en lenguaje natural (variantes de "coger el bloque rojo con el brazo izquierdo, pasarlo al derecho y colocarlo en la almohadilla azul"). La configuracion de entrenamiento fue: 20000 pasos, batch size 8, optimizador AdamW, learning rate 0.0001, semilla 1000, sobre LeRobot 0.6.2. No se indica en la informacion disponible si hubo RLHF, DPO ni otra fase de alineamiento.

## Capacidades

- Generacion de acciones de control roboticas a partir de observaciones multimodales (tres camaras + estado de 6 dimensiones).
- Comprension de comandos de tarea en lenguaje natural para condicionar la politica (las descripciones del dataset estan en ingles).
- Manipulacion bimanual: la tarea entrenada implica coordinacion de dos brazos (coger, transferir y colocar).
- Ejecucion de politicas de imitacion en robots tipo ALOHA mediante `lerobot-rollout`.
- Despliegue en hardware de consumo, segun la model card del modelo base.
- No soporta tool calling, function calling ni razonamiento multi-paso general: es una politica de control, no un modelo de proposito general.
- Capacidades multilingues: no disponible; los comandos de tarea estan en ingles.

## Casos de uso

- Automatizacion de tareas de pick-and-place bimanual: el modelo ejecuta la secuencia de coger un bloque con el brazo izquierdo, transferirlo al derecho y depositarlo en una almohadilla, adecuado para lineas de montaje o laboratorios de robotica que repliquen la configuracion ALOHA.
- Prototipado rapido de politicas de imitacion: con solo 10 episodios de demostracion se obtiene un checkpoint funcional, lo que permite validar rapido una tarea antes de invertir en datasets mayores.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del numero de episodios, la variabilidad de instrucciones o la configuracion de camaras en el rendimiento de un VLA compacto.
- Benchmarking de hardware de consumo: al ser un modelo de 450 M de parametros, permite medir latencia y throughput en GPUs de gama media para tareas de control en tiempo real.
- Educacion y formacion en robotica: el flujo completo (grabar datos, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) es reproducible con hardware ALOHA y sirve para ensenar el ciclo de vida de una politica robotica.
- Base para fine-tuning en tareas de handover en entornos simulados o reales: el checkpoint puede reentrenarse sobre nuevos datasets de transferencia de objetos con la misma morfologia de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion sin completar ("No evaluation results").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 450 M de parametros en safetensors (repo de 0.9 GB), la inferencia en precision original requiere aproximadamente 1-2 GB de VRAM, aunque esta cifra es una estimacion derivada del tamano de pesos y no un dato publicado.
- GPU recomendadas: no disponible en la informacion proporcionada; la model card del modelo base indica despliegue en hardware de consumo.
- Compatibilidad con GPU de consumo: probable segun el diseno de SmolVLA (modelo compacto), pero sin confirmacion numerica en la informacion disponible.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) para ejecucion en robot; `lerobot-train` para reentrenamiento. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ethanCSL/robotwin_handover_block_lerobot_source_10 | 450 M | no disponible | Handover bimanual (ALOHA) | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA general base | apache-2.0 (segun repo base) | Hugging Face |
| Alternativas VLA de mayor tamano (p. ej. OpenVLA) | no disponible en la informacion proporcionada | no disponible | Manipulacion general | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha sido entrenado para una tarea concreta (handover de un bloque rojo a una almohadilla azul) y no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido: 10 episodios y 2835 frames implican un riesgo alto de sobreajuste y baja robustez ante variaciones de iluminacion, posicion de objetos o configuracion de camaras.
- Dependencia de la morfologia: asume un robot ALOHA con tres camaras concretas (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) y un vector de estado de 6 dimensiones; no es portable a otras plataformas sin adaptacion.
- Riesgo de alucinacion en el sentido de acciones incorrectas: como politica de imitacion, puede ejecutar movimientos plausibles pero fallidos ante estados fuera de distribucion.
- Sesgos: no disponibles; no se documentan sesgos especificos, pero el dataset limitado puede reflejar sesgos de las demostraciones (posiciones, velocidades, condiciones de laboratorio).
- Idiomas: los comandos de tarea estan en ingles; no se documenta soporte multilingue.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de tasa de exito en robot real.
- Fecha de creacion del repo (2026-11-17) y cero descargas/likes: modelo muy reciente y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/robotwin_handover_block_lerobot_source_10
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/robotwin_handover_block_lerobot_source_10
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/robotwin_handover_block_lerobot_source_10
