# moonjongsul/kcare_hang_cup_pink_upper_smolvla_260923

## Resumen

kcare_hang_cup_pink_upper_smolvla_260923 es un checkpoint de robótica publicado por el usuario moonjongsul en Hugging Face. Se trata de un ajuste fino del modelo base lerobot/smolvla_base, un modelo compacto de visión-lenguaje-acción (VLA, vision-language-action) de la familia SmolVLA, que traduce observaciones visuales más una instrucción de tarea en comandos motores para un brazo robótico.

El modelo declara 450.046.176 parámetros en los pesos safetensors (unos 450 millones), ocupa 0,9 GB en el repositorio y se ha entrenado con LeRobot sobre el dataset yunjuyoung64/smolvla_hang_cup_3cups_260921_260923_pink_upper, que corresponde a una tarea concreta de manipulación: colgar tres tazas con una pieza superior de color rosa.

Su relevancia es acotada pero clara: es un ejemplo reproducible de política VLA especializada, de coste computacional bajo y desplegable en hardware de consumo, útil para replicar un experimento de aprendizaje por imitación concreto. En el momento de la consulta no registra descargas ni "likes", y la model card no incluye benchmarks ni detalles cuantitativos del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; ajuste fino de lerobot/smolvla_base (familia SmolVLA) |
| Parámetros totales | 450.046.176 (≈450 M), dato real de los pesos safetensors |
| Parámetros activos | no procede (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se distribuyen en safetensors (precisión no confirmada en la información proporcionada) |
| Idiomas soportados | no disponible (modelo de robótica; no se documenta el idioma de las instrucciones) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,9 GB |
| Librería | lerobot |
| Pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | yunjuyoung64/smolvla_hang_cup_3cups_260921_260923_pink_upper |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un ajuste fino de lerobot/smolvla_base, etiquetado con la referencia bibliográfica arXiv:2506.01844 (SmolVLA). La model card describe SmolVLA como un modelo de visión-lenguaje-acción compacto y eficiente, con rendimiento competitivo a un coste computacional reducido y desplegable en hardware de consumo. No se detallan en la información proporcionada ni la arquitectura interna (backbone de visión-lenguaje, experto de acción, mecanismo de decodificación) ni la composición exacta del dataset, el número de tokens o episodios, ni si hubo etapas de RLHF/DPO.

El entrenamiento se ha realizado y publicado con LeRobot (librería `lerobot`), siguiendo el flujo de aprendizaje por imitación de esa herramienta: entrenamiento con `lerobot-train` y evaluación o inferencia con `lerobot-record` apuntando a un robot `so100_follower`. La model card incluida en el repositorio es la plantilla genérica de LeRobot/SmolVLA: el fragmento de entrenamiento que muestra usa `--policy.type=act` como ejemplo de la documentación, por lo que no debe interpretarse necesariamente como la configuración real empleada en este checkpoint.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales y una instrucción de tarea, en el formato de política de LeRobot.
- Ejecución de una tarea de manipulación concreta: colgar tazas (variante "pink upper", tres tazas), según el dataset de entrenamiento declarado.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y grabación de episodios.
- Inferencia en hardware de consumo, según la descripción de la familia SmolVLA.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): visión como entrada (propia de un VLA); el resto, no disponible.

## Casos de uso

- Automatización de una celda de colgado de tazas: el modelo recibe las imágenes de las cámaras y la instrucción de la tarea y emite acciones continuas para el efector; es adecuado porque se ha ajustado exactamente sobre esa tarea y ese montaje.
- Reproducción de experimentos de aprendizaje por imitación: permite replicar el pipeline completo de LeRobot (dataset, `lerobot-train`, `lerobot-record`) y comparar el ajuste fino frente al modelo base preentrenado.
- Punto de partida para ajustes finos específicos: reentrenar con datos propios del robot (por ejemplo, brazos compatibles tipo SO-100/SO-101) para adaptar la política a nuevas posiciones de cámara, iluminación o variantes de objeto.
- Prototipado en hardware de bajo coste: con 450 M de parámetros y 0,9 GB de pesos, el checkpoint cabe en GPUs de gama de consumo, lo que permite validar la política en laboratorio sin acceso a clúster.
- Generación y aumento de datos durante la teleoperación: usar la política como asistencia en `lerobot-record` para producir episodios adicionales que alimenten un dataset de evaluación.
- Docencia y talleres de robótica: sirve como ejemplo didáctico y acotado de VLA aplicado a una tarea de manipulación con un único objeto.
- Evaluación comparativa de políticas: contrastar este checkpoint con otros del mismo autor (por ejemplo, kcare_open_drawer_smolvla o kcare_hang_cup_pink_upper_smolvla_260921) en tareas de manipulación distintas.
- Validación de integraciones de software robótico: comprobar el cableado entre el checkpoint, la librería LeRobot y el robot `so100_follower` antes de escalar a un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de tasa de éxito, número de episodios, frecuencia de control ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Los pesos safetensors suman 450.046.176 parámetros en un repositorio de 0,9 GB, lo que corresponde a precisión de 16 bits (bf16/fp16) de forma aproximada.
- VRAM estimada para inferencia: del orden de 1,5 a 3 GB en bf16/fp16, incluyendo pesos y activaciones de la pila de visión (estimación; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; H100, A100, RTX 4090, RTX 4080, RTX 3060/4060 son más que suficientes para este tamaño.
- Compatibilidad con GPU de consumo: sí, es el escenario previsto por la familia SmolVLA; también es viable en Apple Silicon vía MPS.
- CPU: técnicamente posible, pero no se dispone de datos de latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch. vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles. El autor no publica frecuencia de control ni tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| moonjongsul/kcare_hang_cup_pink_upper_smolvla_260923 | 450.046.176 | Colgar tazas (pink upper, tres tazas) | apache-2.0 | Hugging Face, 0 descargas | Objeto de esta ficha; mismo autor y familia |
| lerobot/smolvla_base | no disponible en la información proporcionada | Política VLA preentrenada (modelo base) | no disponible | Hugging Face | Modelo del que parte este ajuste fino |
| moonjongsul/kcare_hang_cup_pink_upper_smolvla_260921 | no disponible | Colgar tazas (variante fechada el 26/09/21) | no disponible | Hugging Face | Checkpoint hermano del mismo autor |
| moonjongsul/kcare_open_drawer_smolvla | no disponible | Abrir un cajón | no disponible | Hugging Face | Ajuste fino del mismo autor sobre otra tarea |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo se ha ajustado sobre un único dataset y una única tarea (colgar tazas "pink upper"). Es previsible que no generalice a otros objetos, posiciones de cámara, iluminación o brazos distintos.
- Riesgo de acciones erráticas fuera de distribución: en robótica, una política que falla no "alucina" texto, sino que puede ejecutar movimientos incorrectos o inseguros. Es obligatorio disponer de parada de emergencia y validación previa en entorno controlado.
- Ausencia de métricas: no hay benchmarks, tasas de éxito ni curvas de entrenamiento publicadas, por lo que el rendimiento real es desconocido.
- Model card genérica: el README es la plantilla de LeRobot/SmolVLA y no documenta la tarea, el número de episodios ni la configuración de entrenamiento empleada.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto; se desconoce cómo afecta la formulación de la instrucción de tarea al comportamiento de la política.
- Licencia: el checkpoint es apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base (lerobot/smolvla_base) y del dataset de entrenamiento antes de un despliegue productivo.
- Validación comunitaria nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay informes independientes de reproducción.
- Mantenimiento: sin historial de actualizaciones más allá de la creación del repositorio; no hay garantía de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonjongsul/kcare_hang_cup_pink_upper_smolvla_260923
- Archivos del repositorio: https://huggingface.co/moonjongsul/kcare_hang_cup_pink_upper_smolvla_260923/tree/main
- Discusiones del modelo: https://huggingface.co/moonjongsul/kcare_hang_cup_pink_upper_smolvla_260923/discussions
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yunjuyoung64/smolvla_hang_cup_3cups_260921_260923_pink_upper
- Paper de SmolVLA (referencia arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Versión en arXiv: https://arxiv.org/abs/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor: https://huggingface.co/moonjongsul
- Checkpoint hermano (misma tarea, fecha anterior): https://huggingface.co/moonjongsul/kcare_hang_cup_pink_upper_smolvla_260921
- Checkpoint hermano (tarea de abrir cajón): https://huggingface.co/moonjongsul/kcare_open_drawer_smolvla
