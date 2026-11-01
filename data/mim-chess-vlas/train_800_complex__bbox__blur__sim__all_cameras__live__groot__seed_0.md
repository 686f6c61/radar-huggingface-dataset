# mim-chess-vlas/train_800_complex__bbox__blur__sim__all_cameras__live__groot__seed_0

## Resumen

El modelo `train_800_complex__bbox__blur__sim__all_cameras__live__groot__seed_0` es una política robótica de manipulación entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. Lo publica el usuario `mim-chess-vlas` en Hugging Face con licencia Apache 2.0 y un total de 3.144.016.000 parámetros en formato safetensors. El problema que resuelve es el de mapear observaciones multimodales (tres cámaras y el estado proprioceptivo del robot) a acciones de control de un brazo robótico Panda en una tarea concreta de pick-and-place.

La política está especializada en una tarea de recogida y depósito de objetos geométricos complejos (bolas, huevos, estrellas, bloques con protuberancias, etc.) en una caja, descrita mediante instrucciones en lenguaje natural. El dataset de entrenamiento contiene 790 episodios y 157.904 fotogramas a 20 FPS, con variaciones de iluminación (blur), simulación y cámaras en vivo, lo que sugiere un entrenamiento orientado a robustez visual y generalización entre dominios sim y real.

Es relevante ahora porque ejemplifica el patrón actual de adaptación de modelos fundacionales de robótica (GR00T) a tareas específicas mediante fine-tuning con LeRobot, un ecosistema abierto que facilita reproducir el pipeline de entrenamiento y despliegue. El sufijo `seed_0` indica que se trata de una ejecución concreta de un barrido de semillas, útil para estudios de reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone vision-language basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de cámara y las instrucciones de lenguaje, acoplado a un transformer de acciones entrenado con flow matching que predice las acciones condicionadas por visión, lenguaje y propriocepción. La política consume tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a resolución 224x224 y un vector de estado de 9 dimensiones, y produce un vector de acción de 7 dimensiones, típico de un robot Panda de 7 grados de libertad.

El entrenamiento se realizó con LeRobot sobre el dataset `mim-chess-vlas/train_800_complex__bbox__blur__sim__all_cameras__live`, con 790 episodios y 157.904 fotogramas a 20 FPS. Las tareas cubren 22 instrucciones distintas de pick-and-place de objetos geométricos complejos, con variaciones de desenfoque, anotaciones de bounding box, simulación y cámaras en vivo. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card no los detalla.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por visión, lenguaje y propriocepción.
- Comprensión de instrucciones en lenguaje natural para describir el objeto a recoger y la tarea a realizar.
- Percepción multimodal con tres cámaras simultáneas (vista de agente y dos cámaras en la muñeca).
- Control de un robot Panda de 7 grados de libertad mediante un vector de acción de 7 dimensiones.
- Generalización cross-embodiment heredada del backbone GR00T N1.7 (aunque esta política concreta está entrenada para Panda).
- Robustez ante variaciones visuales (desenfoque) y cambio de dominio sim a real, según la composición del dataset.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso ni capacidades de audio.

## Casos de uso

- Pick-and-place de precisión en laboratorio: la política puede recoger objetos geométricos complejos (estrellas, huevos, bloques con protuberancias) y depositarlos en una caja, usando las tres cámaras para localizar el objeto y el vector de estado para controlar el brazo.
- Investigación en generalización sim-to-real: el dataset mezcla simulación y cámaras en vivo, por lo que el modelo sirve para estudiar la transferencia de políticas entrenadas en simulador a un robot físico.
- Benchmark de manipulación con lenguaje natural: las 22 instrucciones detalladas permiten evaluar la comprensión de descripciones geométricas complejas por parte del modelo.
- Estudio de robustez visual: la inclusión de desenfoque en el entrenamiento permite analizar la degradación del rendimiento ante imágenes borrosas o de baja calidad.
- Base para fine-tuning en tareas de ensamblaje: la arquitectura GR00T y el pipeline LeRobot permiten adaptar la política a nuevas tareas de manipulación con pocos episodios adicionales.
- Reproducibilidad de experimentos: al ser una ejecución con semilla fija (`seed_0`), es útil para comparar variantes de entrenamiento y medir la varianza entre semillas.
- Despliegue en entornos de investigación con robot Panda: puede integrarse en un stack LeRobot para ejecutar la política en tiempo real a 20 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.144 millones de parámetros en fp16, se requieren aproximadamente 6,3 GB solo para los pesos; en fp32, unos 12,6 GB. A ello hay que sumar el coste del backbone vision-language y de las tres cámaras de entrada, por lo que se recomienda al menos 16 GB de VRAM en fp16.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia cómoda en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16; en RTX 3090 (24 GB) también, con margen ajustado. En GPUs de 16 GB (RTX 4080) podría requerir cuantización o reducción de precisión, no documentada.
- Opciones de despliegue: LeRobot (librería nativa), con soporte de inferencia en tiempo real; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este tipo de política robótica.
- Latencia y throughput: el dataset está a 20 FPS, lo que sugiere que la política está pensada para operar a esa frecuencia; no se dispone de medidas de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned) | 3.144 M | no disponible | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | no disponible | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | variable (decenas de millones) | no disponible | Apache 2.0 | Hugging Face, LeRobot |

La comparación con modelos de la misma categoría (políticas robóticas) es limitada porque no se dispone de datos de rendimiento publicados para este modelo ni para las alternativas en la información proporcionada. Frente a políticas ligeras como ACT o Diffusion Policy, este modelo es mucho mayor (3.144 M de parámetros) al apoyarse en un backbone vision-language, lo que implica mayores requisitos de cómputo pero potencialmente mejor generalización semántica.

## Limitaciones y advertencias

- Es una política especializada en una tarea concreta (pick-and-place de objetos geométricos en una caja) y un robot concreto (Panda); no es un modelo de propósito general.
- El dataset de entrenamiento es limitado (790 episodios, 157.904 fotogramas), lo que puede reducir la generalización a objetos, posiciones o entornos no vistos.
- No se dispone de información sobre sesgos, tasas de alucinación ni evaluación de seguridad en entornos reales.
- Las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Aunque la licencia es Apache 2.0, el uso comercial en robótica física requiere validación de seguridad adicional no cubierta por la licencia.
- El sufijo `seed_0` indica una única ejecución; el rendimiento puede variar entre semillas y no se reporta varianza.
- No se documentan limitaciones de contexto ni de idioma más allá de lo indicado.
- La model card no incluye resultados de evaluación ni demos en vídeo, lo que dificulta verificar el rendimiento real.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_complex__bbox__blur__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__bbox__blur__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
