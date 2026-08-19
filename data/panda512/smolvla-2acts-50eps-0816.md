# Panda512/smolvla-2acts-50eps-0816

## Resumen

El modelo `Panda512/smolvla-2acts-50eps-0816` es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face en colaboración con la comunidad. Este checkpoint concreto ha sido entrenado por el usuario Panda512 sobre un dataset propio de robótica, con el objetivo de controlar un robot manipulador tipo `so_follower` para una tarea específica de manipulación de objetos en una mesa.

El modelo pertenece a la familia SmolVLA, presentada en el artículo arXiv 2506.01844, que busca llevar los modelos de política robótica a hardware de consumo, reduciendo costes computacionales y de memoria. Con aproximadamente 450 millones de parámetros, este modelo es capaz de procesar imágenes de tres cámaras y un estado del robot de 6 dimensiones para generar acciones de control de 6 dimensiones, todo ello mediante aprendizaje por imitación. La relevancia de este modelo radica en su aplicabilidad práctica para entornos de investigación y desarrollo con recursos limitados, así como en su integración con el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en F32 y BF16) |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acción. La arquitectura exacta se describe en el paper 2506.01844; se trata de un transformer compacto diseñado para ser desplegado en hardware de consumo, con un coste computacional reducido respecto a modelos VLA de mayor tamaño. El modelo base `lerobot/smolvla_base` fue preentrenado en grandes conjuntos de datos multimodales, y este checkpoint ha sido ajustado mediante aprendizaje por imitación (behavior cloning) sobre un dataset propio.

El entrenamiento se realizó con LeRobot (versión 0.6.1) durante 35.000 pasos, con un tamaño de lote de 32, optimizador AdamW y una tasa de aprendizaje de 0.0001. El dataset de entrenamiento, `record-0816-2acts-50eps_20260816`, contiene 50 episodios y 45.601 frames a 30 FPS, con la tarea descrita como: "Pick up the eyedrops, put them into the cup, grab the cup handle, and move the cup to the left". Las entradas del modelo son tres imágenes de cámaras (256x256 píxeles) y un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un ajuste supervisado estándar.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa tres imágenes simultáneas (256x256), lo que permite capturar diferentes perspectivas de la escena.
- Aprendizaje por imitación: reproduce comportamientos demostrados en los episodios de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- Ejecución en tiempo real: diseñado para funcionar a 30 FPS en hardware de consumo.
- No soporta generación de texto libre, tool calling, agentes conversacionales ni razonamiento multi-paso fuera del contexto robótico.

## Casos de uso

- Manipulación pick-and-place en entornos de laboratorio: el modelo puede ejecutar tareas de recoger un objeto y colocarlo en una ubicación determinada, como se demuestra en la tarea de entrenamiento (gotas para los ojos, vaso, etc.).
- Automatización de tareas repetitivas en líneas de montaje: con un dataset adecuado, puede aprender a realizar secuencias de ensamblaje sencillas con un brazo robótico.
- Investigación en robótica de bajo coste: permite probar algoritmos de aprendizaje por imitación sin necesidad de GPUs de gama alta, gracias a sus 450M parámetros.
- Teleoperación asistida: puede utilizarse como política de control para robots `so_follower` en configuraciones de demostración remota.
- Desarrollo de prototipos en entornos académicos: sirve como punto de partida para estudiantes e investigadores que deseen experimentar con VLA sin grandes recursos.
- Benchmarking de políticas robóticas: al ser un modelo pequeño y con licencia Apache-2.0, es adecuado para comparar métricas de éxito en tareas de manipulación frente a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Tampoco se proporcionan métricas como MMLU, HumanEval o GSM8K, dado que el modelo no está orientado a tareas de lenguaje o razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parámetros en BF16, se estima un consumo de aproximadamente 1-2 GB de VRAM para inferencia en lote pequeño (no se han medido valores exactos en la documentación disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente, incluyendo RTX 3050, RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo de gama media y baja.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), que internamente utiliza PyTorch; también podría usarse con vLLM u otros servidores de inferencia, aunque la documentación oficial solo menciona LeRobot.
- Latencia y throughput: no se han publicado datos medidos; dado el tamaño del modelo, se espera una inferencia en tiempo real (30 FPS) en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Panda512/smolvla-2acts-50eps-0816 | 450M | no disponible | Apache-2.0 | Manipulación robótica (fine-tuning específico) |
| lerobot/smolvla_base | 450M (aprox.) | no disponible | Apache-2.0 | Modelo base VLA preentrenado |
| Otros VLA (p.ej. OpenVLA, RT-2) | 7B o más | no disponible | Mixta | Manipulación robótica a gran escala |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y licencia; para una evaluación completa se necesitarían resultados de benchmarks en tareas robóticas, que no están publicados.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 50 episodios, lo que puede provocar sobreajuste y falta de generalización a variaciones en la posición de objetos, iluminación o fondo.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que el rendimiento real es desconocido.
- Tarea específica: el modelo ha sido entrenado para una única tarea (recoger gotas, ponerlas en un vaso, mover el vaso a la izquierda); no es adecuado para otras tareas sin reentrenamiento.
- Dependencia de la configuración del robot: las cámaras y el estado deben coincidir con las utilizadas en el entrenamiento (tres cámaras, estado de 6 dimensiones).
- Riesgo de alucinación visual: como cualquier modelo basado en visión, puede malinterpretar escenas fuera de la distribución de entrenamiento.
- Sin capacidades de lenguaje: no puede procesar instrucciones de texto libre; la tarea está fijada en el momento del entrenamiento.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero el modelo depende del dataset de entrenamiento que puede tener sus propias condiciones (no especificadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Panda512/smolvla-2acts-50eps-0816
- Paper SmolVLA (arXiv 2506.01844): https://arxiv.org/pdf/2506.01844v1
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/record-0816-2acts-50eps_20260816
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=record-0816-2acts-50eps_20260816
