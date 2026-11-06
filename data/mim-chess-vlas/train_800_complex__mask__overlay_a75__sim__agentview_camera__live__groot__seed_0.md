# mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0

## Resumen

El modelo `mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0` es una política robótica entrenada con LeRobot sobre la arquitectura GR00T (N1.7) de NVIDIA, un modelo fundacional abierto y cross-embodiment disenado para razonamiento y habilidades en robots humanoides. Lo publica el usuario `mim-chess-vlas` y resuelve una tarea concreta de manipulación: recoger piezas geométricas complejas (bolas, huevos, estrellas, cubos con ranuras, coronas de puntas, etc.) y depositarlas en una caja, usando un brazo robótico Franka Panda en simulación.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo actual de LeRobot para adaptar un modelo fundacional de robótica a una tarea específica mediante fine-tuning sobre un dataset propio (`train_800_complex__mask__overlay_a75__sim__agentview_camera__live`). Por otro, documenta las dimensiones reales del artefacto: 3.144.016.000 parámetros en safetensors, un repositorio de 50,3 GB y una política que consume tres vistas de cámara (224x224) más un vector de estado de 9 dimensiones, y emite acciones de 7 dimensiones.

Arquitectónicamente, GR00T N1.7 combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, condicionado por visión, lenguaje y propiocepción. Esto lo sitúa en la categoría de modelos visión-lenguaje-acción (VLA) para control robótico, no en la de LLMs de propósito general. La información disponible no incluye detalles sobre hiperparámetros de entrenamiento, número de tokens vistos ni si hubo RLHF o DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment para robótica. El backbone es un modelo visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales y las instrucciones en lenguaje natural, mientras que un transformer de acciones con flow matching genera las trayectorias de acción condicionadas por visión, lenguaje y propiocepción. La política concreta de este repositorio ha sido entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje robótico.

El entrenamiento se realizó sobre el dataset `mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__agentview_camera__live`, compuesto por 790 episodios y 157.904 frames a 20 FPS. El robot es un Franka Panda con tres cámaras: `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`. Las tareas descritas en la model card son instrucciones largas y muy específicas de picking de piezas geométricas complejas (por ejemplo, "Pick the smooth ball clasped by two flat curved arms that arch over it from one side...") y su depósito en una caja. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset más allá de los episodios y frames indicados, ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones (posición y orientación del efector final, más pinza) a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa tres vistas simultáneas de 224x224 píxeles (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Condicionamiento por lenguaje natural: las instrucciones de tarea son descripciones textuales detalladas de la pieza a recoger y del destino.
- Integración de propiocepción: consume un vector de estado de 9 dimensiones del robot.
- Ejecución de tareas de pick-and-place sobre objetos geométricos complejos en simulación.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito (thinking mode) para este artefacto concreto.

## Casos de uso

- Manipulación de precisión en entornos simulados: el modelo puede recoger piezas geométricas complejas (estrellas de cuatro puntas, coronas de puntas, cubos con ranuras) y depositarlas en una caja, gracias a su condicionamiento por lenguaje detallado y a las tres vistas de cámara que permiten estimar la geometría de la pieza.
- Investigación en modelos fundacionales de robótica: sirve como punto de partida para estudiar el fine-tuning de GR00T N1.7 sobre datasets específicos con LeRobot, comparando el efecto de la composición del dataset (790 episodios, 157.904 frames) en el rendimiento de la política.
- Benchmarking de políticas VLA: al estar entrenado sobre una tarea concreta y reproducible (picking de piezas y depósito en caja), puede usarse como referencia para comparar arquitecturas VLA en tareas de manipulación con objetos no triviales.
- Generación de datos sintéticos y aumento de dataset: la política puede desplegarse en simulación para generar trayectorias adicionales que alimenten el entrenamiento de políticas más robustas o de modelos de recompensa.
- Prototipado de pipelines de robot learning: integrable con LeRobot para experimentar con el ciclo completo de entrenamiento, evaluación y despliegue en un brazo Panda simulado.
- Evaluación de robustez ante variaciones geométricas: las descripciones de tarea cubren múltiples formas (bolas, huevos, estrellas, cubos, coronas, barriles con nervios), lo que permite estudiar la generalización de la política ante cambios en la geometría del objeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144.016.000 parámetros, una estimación orientativa en FP16 sería de aproximadamente 6,3 GB solo para los pesos, más memoria para activaciones y las tres cámaras de 224x224; en cuantizaciones de 8 bits o 4 bits el peso se reduciría aproximadamente a 3,1 GB y 1,6 GB respectivamente, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer con al menos 12-16 GB de VRAM en FP16, pero no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: LeRobot (librería oficial de entrenamiento e inferencia). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLMs y no a políticas robóticas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 (este artefacto) | 3.144.016.000 | no disponible | Política VLA para manipulación robótica (Panda) | apache-2.0 | Hugging Face, libreria LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Políticas de imitación para manipulación | no disponible | Hugging Face, LeRobot |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La referencia más directa es el modelo base GR00T N1.7 de NVIDIA, del que este artefacto es un fine-tuning específico para la tarea de picking de piezas geométricas.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot concretos (Franka Panda en simulación); no es un modelo de propósito general y su rendimiento fuera de esa distribución no está garantizado.
- El dataset de entrenamiento es relativamente pequeño (790 episodios, 157.904 frames), lo que puede limitar la generalización a nuevas geometrías, iluminaciones o disposiciones de cámara.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad en entornos reales.
- El repositorio ocupa 50,3 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- La licencia apache-2.0 permite uso comercial, pero el modelo base GR00T N1.7 y las dependencias de LeRobot pueden tener sus propias condiciones que conviene revisar.
- No se documentan limitaciones de contexto o idioma porque no se dispone de esa información.
- Al ser una política robótica, no debe evaluarse con métricas de LLM (MMLU, HumanEval, GSM8K); su validación requiere métricas de éxito en tarea, precisión de agarre y robustez ante perturbaciones.

## Enlaces

- [Hugging Face: mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0](https://huggingface.co/mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__agentview_camera__live__groot__seed_0)
- [Dataset de entrenamiento](https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__agentview_camera__live)
- [GR00T N1.7 en GitHub (NVIDIA/Isaac-GR00T)](https://github.com/NVIDIA/Isaac-GR00T)
- [Guía de LeRobot para GR00T](https://huggingface.co/docs/lerobot/main/en/groot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
