# SeunghakHan/omx_smolvla_toponly_lora_20k

## Resumen

omx_smolvla_toponly_lora_20k es un adaptador LoRA sobre el modelo base lerobot/smolvla_base, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado en el ecosistema LeRobot de Hugging Face y descrito en el artículo SmolVLA (arXiv:2506.01844). El modelo resuelve el problema de generar políticas de control robótico directamente a partir de observaciones visuales y del estado de los actuadores, sin necesidad de ingeniería de control manual. Este adaptador concreto ha sido entrenado por el usuario SeunghakHan para una tarea de manipulación específica: recoger bloques de cuatro colores y depositarlos en una caja.

El interés de esta ficha reside en que ejemplifica el flujo de trabajo de ajuste fino de bajo coste sobre modelos VLA compactos: en lugar de reentrenar el modelo completo, se entrena un adaptador con 20 000 pasos sobre un conjunto de datos de solo 80 episodios y 20 614 fotogramas a 30 FPS. El resultado es una política especializada, ejecutable en hardware de consumo, que demuestra cómo el ecosistema LeRobot permite pasar de la captura de datos a una política desplegable con pocos recursos.

Se trata de un artefacto de investigación y experimentación, no de un modelo de propósito general: su ámbito de aplicación está limitado al robot `omx_follower` con dos cámaras y a las cuatro tareas de recogida de bloques descritas. La licencia Apache 2.0 facilita su reutilización, pero no se han publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, base SmolVLA; adaptador LoRA (top-only) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | omx_follower |
| Camaras | front, top |
| Entrada de estado | observation.state, forma (6,) |
| Entradas visuales | observation.images.camera1 (3, 480, 640); camera2 y camera3 (3, 256, 256) |
| Salida de accion | action, forma (6,) |
| Pasos de entrenamiento | 20 000 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Semilla | 42 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 0.0 GB (aproximado en la ficha de HF) |

## Arquitectura y entrenamiento

El modelo base SmolVLA es una política de visión-lenguaje-acción compacta que combina un codificador visual, un componente de lenguaje y una cabeza de acciones, diseñada para alcanzar rendimiento competitivo con coste computacional reducido y poder desplegarse en hardware de consumo. Este repositorio no contiene el modelo completo, sino un adaptador LoRA entrenado sobre `lerobot/smolvla_base`; la model card indica `base_model_relation: adapter` y el nombre del repositorio sugiere una variante "top-only" del adaptador, aunque no se detalla en la información disponible qué capas concretas se ajustan.

El entrenamiento se realizó con LeRobot 0.7.1 mediante imitación supervisada sobre el conjunto de datos `local/omx_fourcolors_merged`, compuesto por 80 episodios y 20 614 fotogramas a 30 FPS. Las tareas cubiertas son cuatro instrucciones de recogida y depósito de bloques (verde, azul, rojo y amarillo) en una caja. Se usaron 20 000 pasos, batch de 64, AdamW con learning rate 1e-4 y semilla 42. No se dispone de información sobre composición adicional del dataset, aumento de datos, ni sobre si se aplicaron técnicas de regularización más allá del propio ajuste LoRA.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones a partir del estado del robot y de dos cámaras.
- Percepción visual multi-cámara: consume una imagen frontal de 480x640 y dos vistas adicionales de 256x256.
- Ejecución de instrucciones en lenguaje natural para cuatro tareas concretas de manipulación (recoger bloque verde, azul, rojo o amarillo y colocarlo en la caja).
- Despliegue en hardware de consumo, según las características del modelo base SmolVLA.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, generación de texto libre ni procesamiento de audio.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un bloque de color y depositarlo en una caja, adecuado para experimentos de imitación con pocos datos (80 episodios).
- Prototipado rápido de políticas VLA: sirve como punto de partida para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas más complejas.
- Investigación en ajuste fino eficiente: al ser un adaptador LoRA sobre SmolVLA, permite estudiar el impacto del número de pasos y del subconjunto de capas ajustadas sin reentrenar el modelo completo.
- Clasificación y selección de objetos por color: las cuatro tareas entrenadas cubren discriminación cromática, útil como banco de pruebas para percepción visual en robótica de bajo coste.
- Despliegue en robots de sobremesa con hardware de consumo: la naturaleza compacta del modelo base permite ejecutar la política en estaciones con GPU de gama media, según las indicaciones del paper.
- Docencia y formación en robótica con IA: el flujo de trabajo documentado (dataset pequeño, comandos de entrenamiento y rollout) es reproducible en cursos y talleres.
- Base para transferencia a nuevas tareas: el adaptador puede servir como inicialización para ajustes posteriores en tareas de manipulación similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base SmolVLA se describe como desplegable en hardware de consumo, pero no se especifican cifras.
- GPU recomendadas: no disponible. El ejemplo de entrenamiento de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: el paper del modelo base afirma que puede desplegarse en hardware de consumo; no se detalla qué tarjetas concretas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El dataset se grabó a 30 FPS, pero no se documenta la tasa de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omx_smolvla_toponly_lora_20k | no disponible (adaptador LoRA) | no disponible | VLA robótica | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible | no disponible | VLA robótica | no disponible en la información | Hugging Face |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | VLA robótica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política solo ha sido entrenada para cuatro tareas de recogida de bloques de color; no generaliza a otras instrucciones ni objetos.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad.
- Dependencia de hardware concreto: requiere un robot `omx_follower` y una configuración de cámaras concreta (front y top) con los nombres de observación exactos usados en el entrenamiento.
- Dataset muy pequeño: 80 episodios y 20 614 fotogramas pueden provocar sobreajuste y escasa robustez ante cambios de iluminación, posición de objetos o distracciones.
- Adaptador, no modelo completo: debe combinarse con `lerobot/smolvla_base`; no es autónomo.
- Idiomas no documentados: la model card no especifica capacidades multilingües; las instrucciones de tarea están en inglés.
- Riesgo de alucinación en el sentido de acciones incorrectas: como política de imitación, puede generar trayectorias no válidas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que deben verificarse.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero la percepción visual puede verse afectada por condiciones de iluminación y color del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeunghakHan/omx_smolvla_toponly_lora_20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento: https://huggingface.co/datasets/local/omx_fourcolors_merged
